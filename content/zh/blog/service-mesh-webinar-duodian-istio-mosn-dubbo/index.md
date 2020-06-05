---
title: "多点生活在 Service Mesh 上的实践 -- Istio + Mosn 在 Dubbo 场景下的探索之路"
author: "陈鹏"
authorlink: "https://github.com/sofastack"
description: "本文主要给分享 Service Mesh 的一些技术点以及多点生活在 Service Mesh 落地过程中适配 Dubbo 的一些探索。"
categories: "Service Mesh"
tags: ["Service Mesh","Service Mesh Webinar"]
date: 2020-06-04T18:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2020/png/226702/1589959655608-27c7682b-ed23-491a-8d6c-7a6c2ca56457.png"
---

> Service Mesh Webinar 是由 ServiceMesher 社区和 CNCF 联合发起的线上直播活动，活动将不定期举行，为大家带来 Service Mesh 领域的知识和实践分享。

本文根据5月28日晚 Service Mesh Webinar#1 多点生活平台架构组研发工程师陈鹏，线上主题分享《多点生活在 Service Mesh 上的实践 -- Istio + Mosn 在 Dubbo 场景下的探索之路》整理，文末包含本次分享的视频回顾链接以及 PPT 下载地址。

## 前言

随着多点生活的业务发展，传统微服务架构的面临升级困难的问题。在云原生的环境下，Service Mesh 能给我们带来什么好处。如何使用社区解决方案兼容现有业务场景，落地成符合自己的 Service Mesh 成为一个难点。

今天主要给大家分享一下 Service Mesh 的一些技术点以及多点生活在 Service Mesh 落地过程中适配 Dubbo 的一些探索。

首先我们从三个方面入手：

- 为什么需要 Service Mesh 改造；
- 探索 Istio 技术点；
- Dubbo 场景下的改造；

## 为什么需要 Service Mesh 改造

说到为什么需要改造，应该先说一下 Service Mesh 和传统微服务架构的一些特点。

### 微服务

微服务一般有这些模块：

- 安全；
- 配置中心；
- 调用链监控；
- 网关；
- 监控告警；
- 注册和发现；
- 容错和限流；

这些模块在传统的微服务架构中有的是和 SDK 结合在一起，有的是一个独立的中间件。

特点：

- 独立部署；
- 模块的边界；
- 技术多样性；

正是由于技术多样性，我的微服务系统可以使用不同的语言进行开发，比如我一个商城系统，订单系统使用 Java 开发，库存系统使用 Go 开发，支付系统使用 Python 开发，微服务之间通过轻量级通信机制协作，比如：HTTP/GRPC 等。比如目前多点使用的 Dubbo(服务治理框架)，随着多点生活的业务发展，目前遇到最棘手的问题就是中间件在升级过程中，推进很慢，需要业务方进行配合，接下来我们看看 Service Mesh。

### Service Mesh

优点：

- 统一的服务治理；
- 服务治理和业务逻辑解藕；

缺点：

- 增加运维复杂度；
- 引入延时；
- 需要更多技术栈；

看了 Service Mesh 的优缺点，如果我们 Mesh 化了之后就可以解决我们目前的痛点，升级中间件只需要重新发布一下 Sidecar 就好了，不同语言开发的微服务系统可以采用同样的服务治理逻辑，业务方就可以尝试更多的技术。

## 探索 Istio 技术点

在谈 Dubbo 场景下的改造之前我们先介绍一下 Istio 相关的技术点，然后结合 Dubbo 场景应该如何进行适配

### MCP

MCP（Mesh Configuration Protocol）提供了一套用于订阅(Watch)、推送(Push)的 API，分为 Source 和 Sink 两个角色。

- Source 是资源提供方(server)，资源变化了之后推送给订阅者(Pilot)，Istio 1.5 之前这个角色就是 Galley 或者自定义 MCP Server；
- Sink 是资源的订阅者(client)，在 Istio 1.5 之前这个角色就是 Pilot 和 Mixer，都是订阅 Galley 或者自定义 MCP Server 的资源

MCP 的订阅、推送流程图:

![mcp](https://cdn.nlark.com/yuque/0/2020/png/226702/1590994674298-e8bbe0ba-a7bb-4034-8214-751eb5b28f43.png)

为了和实际情况结合，我们就以 MCPServer 作为 Source，Pilot 作为 Sink 来介绍订阅、推送流程，其中 MCP 通信过程中所传输的「资源」就是 Istio 定义的 CRD 资源，如：VirtualService、DestinationRules 等。

#### 订阅

- Pilot 启动后会读取 Configmap 的内容，里面有一个 `configSources` 的一个数组配置（Istio 1.5 之后没有这个配置，需要自己添加）、存放的是 MCP Server 的地址；
- Pilot 连接 MCPServer 之后发送所关注的资源请求；
- MCPServer 收到资源请求，检查请求的版本信息（可能为空），判断版本信息和当前最新维护的版本信息是否一致，不一致则触发 Push 操作，一致则不处理；
- Pilot 收到 Push 数据，处理返回的数据（数据列表可能为空，为空也标示处理成功），根据处理结果返回 ACK（成功）/ NACK（失败），返回的应答中包含返回数据的版本信息，如果返回的是 NACK，Pilot 会继续请求当前资源；
- MCPServer 收到 ACK（和资源请求一致）之后对比版本号，如果一致则不推送，否则继续推送最新数据；

#### 推送

- MCPServer 自身数据发生变化，主动推送变化的资源给 Pilot；
- Pilot 收到之后处理这些数据，并根据处理结果返回 ACK / NACK；
- MCPServer 收到 ACK（和资源请求一致） 之后对比版本号，如果一致则不推送，否则继续推送最新数据；

这样的订阅、推送流程就保证了 MCPServer 和 Pilot 资源的一致。MCPServer 只能通过 MCP 协议告诉 Pilot 资源发生变化了么？当然不是，MCPServer 可以使用创建 CR 的方式，Pilot 通过 Kubernetes 的 Informer 机制也能感知到资源发生变化了，只是通过 MCP 传输的资源在 Kubernetes 里面看不到，只是存在于 Pilot 的内存里面，当然也可以通过 Pilot 提供的 HTTP debug 接口（istiod_ip:8080/debug/configz）来查。

[https://github.com/champly/mcpserver](https://github.com/champly/mcpserver)  提供了一个 MCPServer 的一个 demo，如果需要更加细致的了解 MCP 原理可以看一看。

> _更多 debug 接口可以查看: [https://github.com/istio/istio/blob/5b926ddd5f0411aa50fa25c0a6f54178b758cec5/pilot/pkg/proxy/envoy/v2/debug.go#L103](https://github.com/istio/istio/blob/5b926ddd5f0411aa50fa25c0a6f54178b758cec5/pilot/pkg/proxy/envoy/v2/debug.go#L103)_

### Pilot

Pilot 负责网格中的流量管理以及控制面和数据面之前的配置下发，在 Istio 1.5 之后合并了 Galley、Citadel、Sidecar-Inject 和 Pilot 成为 Istiod。我们这里说的是之前 Pilot 的功能，源码里面 pilot-discovery 的内容。

#### 功能

- 根据不同平台（Kubernetes、Console）获取一些资源，Kubernetes 中使用 Informer 机制获取 Node、Endpoint、Service、Pod 变化；
- 根据用户的配置（CR、MCP 推送、文件）触发推送流程；
- 启动 gRPC server 用于接受 Sidecar 的连接；

#### 推送流程

- 记录变化的资源类型；
- 根据变化的资源类型(数组)整理本地数据；
- 根据变化的资源类型判断需要下发的 xDS 资源；
- 构建 xDS 资源，通过 gRPC 下发到连接到当前 Pilot 的 Sidecar；

### xDS

Sidecar 通过动态获取服务信息、对服务的发现 API 被称为 xDS。

- 协议部分（ADS、控制资源下发的顺序及返回确认的数据）；
- 数据部分（CDS、EDS、LDS、RDS、SDS）；

Pilot 资源类型发生变化需要下发的 xDS 资源对照：

| 资源名称 | CDS | EDS | LDS | RDS |
| :--- | :---: | :---: | :---: | :---: |
| Virtualservices |  |  | ✔ | ✔ |
| Gateways |  |  |  |  |
| Serviceentries | ✔ | ✔ | ✔ | ✔ |
| Destinationrules | ✔ | ✔ |  | ✔ |
| Envoyfilters | ✔ | ✔ | ✔ | ✔ |
| Sidecars | ✔ | ✔ | ✔ | ✔ |
| ConfigClientQuotaspecs |  |  | ✔ | ✔ |
| ConfigClientQuotaspecbindings |  |  | ✔ | ✔ |
| Authorizationpolicies |  |  | ✔ |  |
| Requestauthentications |  |  | ✔ |  |
| Peerauthentications | ✔ | ✔ | ✔ |  |
| Other | ✔ | ✔ | ✔ | ✔ |

> _以上内容是根据 [源码](https://github.com/istio/istio/blob/5b926ddd5f0411aa50fa25c0a6f54178b758cec5/pilot/pkg/proxy/envoy/v2/ads_common.go#L97) 整理的_

### MOSN

MOSN 是一款使用 Go 语言开发的网络代理软件，作为云原生的网络数据平面，旨在为服务提供多协议、模块化、智能化、安全的代理能力。MOSN 是 Modular Open Smart Network 的简称。MOSN 可以与任何支持 xDS API 的 Service Mesh 集成，亦可以作为独立的四、七层负载均衡，API Gateway，云原生 Ingress 等使用。

MOSN：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

配置文件：

- mosn_config：MOSN 的配置信息；
- listener：LDS；
- routers：RDS；
- cluster：CDS 和 EDS；

#### listener

![listener](https://cdn.nlark.com/yuque/0/2020/png/226702/1590994777393-96eb1de6-4a45-41dd-8470-b98fb244ab2b.png)

其中 `address` 就是 MOSN 监听的地址。

##### filter chains

filter_chains 在 MOSN 里面的 `network chains`，实现的还有：

- fault_inject；
- proxy；
- tcp_proxy；

和 `network chains` 同级的还有 `listener chains`、`stream chains`, 其中
`listener chains` 目前只有 `original_dst` 实现。`stream chains` 可以对请求中的

- StreamSender；
- StreamReceiver；
- StreamAccessLog；

进行 `BeforeRoute` `AfterRoute` 这些关键步骤进行修改请求信息。

所有的 `filter` 都只有两种返回结果：

- Continue：如果后面还有 `filter` 那就执行后续 `filter`；
- Stop：执行完当前 `filter` 就不再继续执行了；

##### conv

看图中的配置信息 `config` 的内容, `downstream_protocol` 和 `upstream_protocol` 这里如果配置不一致，就需要协议转换。比如 `HTTP1` 转换为 `HTTP2`，MOSN 就会先把 `HTTP1` 转换为 `common` 的中间协议，然后再把 `common`转换为 `HTTP2`，这样就实现了协议之间的转换。如果需要自己实现其他协议转换，那么只需要编写转换 `common` 的内容和 `common` 转换为当前协议的内容即可实现协议之间的互转。

##### proxy

我们再来看 `filters` 里面的 `proxy`，这个就是一个会经过路由的代理，配置信息里面配置了`router_config_name`，就是要路由的`router`名字。

#### routers

![routers](https://cdn.nlark.com/yuque/0/2020/png/226702/1590994801068-1a27f709-bf26-4798-8c73-e6ea1ced9729.png)

根据 `listener` 里面的 `proxy` 的配置信息里面的 `router_config_name` 会找到一个 `router`，如上图所示。然后就会根据请求里面的 `domains` 去匹配 `virtual_hosts`， 这里的 `domains` 里面在 `HTTP` 里面就会是 `host`，当在 Dubbo 协议里面我们可以把 `service`（有些地方叫做 interface、target，我们这里统一叫 service） 放到 `x-mosn-host` 这个 MOSN 的 `Header` 里面，MOSN 就可以根据这个去匹配 `domains`。

然后匹配到一个 `virtual_hosts` 之后，就会得到对应的 `routers`，这里又会根据 `match` 里面的匹配规则进行匹配，`HTTP` 协议里面可以根据 `path`、`queryparam`、`header` 等信息进行匹配，具体匹配规则通过 VirtualService 下发，如果是 Dubbo 协议，那么可以套用 `HTTPRoute` 规则，然后把 Dubbo 的 `attachment` 解析出来当作 `header`去用，目前 MOSN 没有解析 `attachment`，我们自己实现了一个。

匹配到了之后会得到一个 `route`，图中所示只有一个 `cluster_name`，如果是有多个 `subset`(DestinationRule 定义)，那么就会有 `weighted_cluster` ，里面会有 `cluster_name` 和 `weight` 构成的对象的数组，例如：

```json
"route":{
    "weighted_clusters":[
        {
            "cluster":{
                "name":"outbound|20882|green|mosn.io.dubbo.DemoService.workload",
                "weight":20
            }
        },
        {
            "cluster":{
                "name":"outbound|20882|blue|mosn.io.dubbo.DemoService.workload",
                "weight":80
            }
        }
    ],
    "timeout":"0s",
    "retry_policy":{
        "retry_on":true,
        "retry_timeout":"3s",
        "num_retries":2
    }
}
```

其中 `weight` 之和必须为 100（Istio 定义的），必须是非负数的整数。

下面有一些 `timeout`、`retry_policy` 服务策略。

匹配上了之后会得到一个`cluster_name`，然后我们再看 `cluster`

#### cluster

在 `routers` 里面匹配出来的 `cluster_name` 作为 `key` 在 `cluster` 里面会找到这么一个对象。

![cluster](https://cdn.nlark.com/yuque/0/2020/png/226702/1590994825928-2e3e7b50-4841-4cc6-8df6-0123b5d99d16.png)

其中 `lb_type` 就是节点的负载均衡策略，目前 MOSN 支持：

- ROUNDROBIN；
- RANDOM；
- WEIGHTED_ROUNDROBIN；
- EAST_REQUEST；

`hosts` 里面的 `address` 里面也可以配置权重，这个权重必须是大于 0 或小于 129 的整数。可以通过 Istio 1.6 里面的 `WorkloadEntry` 来配置权重。然后根据负载均衡策略拿到 `host` 之后直接请求到对应的节点。

这就完成了流量的转发。接下来我们看看 Dubbo 场景下应该如何改造。

## Dubbo 场景下的改造

所有的改造方案里面都是要把 SDK 轻量化，关于服务治理的逻辑下沉到 Sidecar，我们在探索的过程中有三种方案。

### Istio + Envoy

这个方案是 Istio+Envoy 的方案，是参考的华为云的方案: [https://support.huaweicloud.com/bestpractice-istio/istio_bestpractice_3005.html](https://support.huaweicloud.com/bestpractice-istio/istio_bestpractice_3005.html)

- 通过创建 EnvoyFilter 资源来给 xDS 资源打 patch；
- Envoy 解析 Dubbo 协议中的 Service 和 Method；
- 根据路由策略配置把流量转发到对应的 Provider；

这种方案如果需要解析更多的 Dubbo 内容，可以通过 WASM 扩展。

### MOSN + Dubbo-go

- MOSN 提供 Subscribe、Unsubscribe、Publish、Unpublish 的 HTTP 服务；
- SDK 发送请求到 MOSN 提供的这些服务，让 MOSN 代为与真正的注册中心交互；
- MOSN 通过 Dubbo-狗直接和注册中心连接；

这种方案的话就不需要 Istio。

### Istio + MOSN

这种方案就是我们现在采用的方案，包括：

- 数据面改造；
- 控制面适配；

我们有一个理念就是如果能通过标准的 CRD 最好，如果描述不了的话我们就通过 EnvoyFilter 进行修改。这里特别说一下，我们一开始也有一个误区就是 EnvoyFilter 是作用于 Envoy，其实不是的，是对生成好的 xDS 资源进行 ADD, MERGE 等操作，目前只可以修改 LDS、RDS、CDS，这个修改也是有一定局限性的。如果 EnvoyFilter 修改不了某些特定的场景（比如 Istio 1.6 之前的 ServiceEntry 里面的 Endpoint 不能单独为每个实例指定不同的端口），那么我们只能修改 pilot-discovery 的代码，xDS 是不会作任何修改的。按照这个理念，我们开始探索如何改造。

#### 数据面改造

![mosn](https://cdn.nlark.com/yuque/0/2020/png/226702/1590994844863-2abb501b-3244-4b25-8371-a4237253ffb3.png)

首先有三个端口需要说明一下：

- 20880 : provider 监听端口；
- 20881 : consumer 请求 mosn 的这个端口，mosn 做转发到 provider；
- 20882 : 接受来自下游(mosn/consumer)的请求，直接转到 127.0.0.1:20880；

步骤：

- provider 启动之后请求本地 mosn 的注册接口，把服务信息注册到注册中心(zk/nacos)，注册请求到达 mosn 之后，mosn 会把注册端口号改为 20882；
- consumer 启动之后不需要连接注册中心，直接把请求发送到 127.0.0.1:20881；
- consumer 端的 mosn 收到请求之后，根据配置信息 listener->routers->cluster->host，找到合适的 host(可以是 provider 的 mosn 或者 直接是 provider) 发送请求，这里的匹配过程可以修改 MOSN 让 Dubbo 的 service 作为 domains，attachment 作为 header；
- provider 端 mosn 收到请求后(20882)，直接转发请求到本地 127.0.0.1:20880；

这个只是通过静态配置实现的，如果 provider 这些信息如何通过 Pilot 下发呢？

#### 控制面适配

MOSN 本身支持 xDS API，配置信息可以通过 xDS 下发，而不是静态配置。我们有一个对接配置中心，注册中心的程序我们叫 Adapter，这个主要获取注册中心的服务信息，然后根据配置中心的服务治理策略(比如流程比例，还有一些我们内部的一些单元的信息)构建出 Istio 支持的 CR，然后创建 CR，Pilot 自己感知 CR 变化 或者 通过 MCP 把这些信息直接发送给 Pilot，触发 Pilot 的资源变化，然后 Pilot 根据资源的变化去下发一些 xDS 资源，Sidecar 收到资源变化后，就可以动态调整路由策略，从而达到服务治理的目的。

最终架构图如图所示：

![architecture](https://cdn.nlark.com/yuque/0/2020/png/226702/1590994859064-c672218d-b001-4cd5-80fa-65947107d072.png)

注册(灰色部分)：

1. provider 发送注册信息给 MOSN；
1. MOSN 修改注册信息(端口号等)，然后注册到真正到注册中心(ZK / Nacos 等)；

配置下发(蓝色部分)：

1. Adapter 连接注册中心和配置中心并感知其变化；
1. Adapter 感知到变化之后通过 MCP 把变化的信息传递给 Pilot(或者创建 CR 让 Pilot 自己感知)；
1. Pilot 感知到资源变化触发配置下发流程，根据变化到资源类型下发对应到 xDS 资源到 连接到它的 Sidecar；

服务请求(黄色部分)：

1. consumer 请求本地 127.0.0.1:20881（MOSN 监听的端口）；
1. MOSN 根据 listener->router->cluster 找到一个 host，然后把请求转发到这个 host 上；

以上就完成了服务注册、发现、治理的所有逻辑。

**Istio 1.6 之后可以通过 WorkloadEntry + ServiceEntry 这两种 CRD 资源来描述集群外的服务，当实例上线或者下线的时候就会直接触发 EDS 增量下发**。

## Demo 演示

首先要说明一下：

- 由于没有真正的注册，所以使用手动添加 ServiceEntry 的方式代替 Adapter 功能；
- Listener 和 Routers 配置信息目前是固定的；
- Provider 只注册到本地 ZK；
- Sidecar 注入到方式使用的是多个 Container；

具体操作可以按照 [mosn-tutorial](https://github.com/mosn/mosn-tutorial)，里面的`istio-mosn-adapt-dubbo`。即使你没有 Kubernetes 环境也可以尝试的，后期这个会移植到 MOSN 官网，敬请期待。

mosn-tutorial：[https://github.com/mosn/mosn-tutorial](https://github.com/mosn/mosn-tutorial)

以上就是本期分享的全部内容，感谢大家的收看。

## 本期嘉宾介绍

陈鹏，多点生活平台架构组研发工程师，开源项目与云原生爱好者。有多年的网上商城、支付系统相关开发经验，2019年至今从事云原生和 Service Mesh 相关开发工作。

## 回顾资料

PPT 下载：[https://github.com/servicemesher/meetup-slides/tree/master/2020/05/webinar](https://github.com/servicemesher/meetup-slides/tree/master/2020/05/webinar)
视频回顾：[https://www.bilibili.com/video/BV15k4y1r7n8](https://www.bilibili.com/video/BV15k4y1r7n8)
