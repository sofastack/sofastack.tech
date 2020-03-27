---
title: "云原生网络代理 MOSN 多协议机制解析 | SOFAChannel#13 直播整理"
author: "无钩"
authorlink: "https://github.com/neverhook"
description: "本文根据昨晚直播整理，主要分享云原生网络代理 MOSN 多协议机制解析，并介绍对应私有协议快速接入实践案例以及对其实现多协议低成本接入的设计进行解读。"
categories: "MOSN"
tags: ["MOSN","Service Mesh","SOFAChannel"]
date: 2020-03-26T21:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1584350858191-cb9a29fd-c5a0-48dd-a1da-498bc7333a06.jpeg"
---

> <SOFA:Channel/>，有趣实用的分布式架构频道。
> 回顾视频以及 PPT 查看地址见文末。欢迎加入直播互动钉钉群 : 21992058，不错过每场直播。
> 本文根据 SOFAChannel#13 直播分享整理，主题：云原生网络代理 MOSN 多协议机制解析。

![SOFAChannel#13](https://cdn.nlark.com/yuque/0/2020/png/226702/1585209248477-6d1bab62-53a7-4362-87f6-27ea043e6b79.png)

大家好，我是今天的讲师无钩，目前主要从事蚂蚁金服网络代理相关的研发工作，也是 MOSN 的 Committer。今天要和大家分享的是《云原生网络代理 MOSN 多协议机制解析》，并介绍对应的私有协议快速接入实践案例以及对 MOSN 实现多协议低成本接入的设计进行解读。

我们将按以下顺序进行介绍：

- 多协议机制产生的背景与实践痛点；
- 常见的协议扩展思路初探；
- SOFABolt 协议接入实践；（重点）
- MOSN 多协议机制设计解读；（重点）
- 后续规划及展望；

其中第三点「接入实践」是今天分享的重点，希望能给大家就「如何在 MOSN 中快速扩展私有协议接入」有一个具体的感受。另外「MOSN 如何实现多协议框架」也是很多人关心和问题，我们将摘选几个技术功能，对其背后的设计思考进行解读。

## MOSN 简介

![MOSN 简介](https://cdn.nlark.com/yuque/0/2020/png/226702/1585209248453-cbf84b1b-6765-4f05-bd8e-44300b995266.png)

云原生网络代理 MOSN 定位是一个全栈的网络代理，支持包括网络接入层(Ingress)、API Gateway、Service Mesh 等场景，目前在蚂蚁金服内部的核心业务集群已经实现全面落地，并经受了 2019 年双十一大促的考验。今天要向大家介绍的是云原生网络代理 MOSN 核心特性之一的多协议扩展机制，目前已经支持了包括 SOFABolt、Dubbo、TARS 等多个协议的快速接入。

MOSN：[https://github.com/mosn](https://github.com/mosn)

## 多协议机制产生的背景与实践痛点

首先介绍一下多协议机制产生的背景。

![多协议机制产生背景](https://cdn.nlark.com/yuque/0/2020/png/226702/1585209248463-b8b38ab0-09ed-4225-8d60-5bad3c2a372b.png)

前面提到，蚂蚁金服 2019 年双十一核心链路百分之百 Mesh 化，是业界当时已知的最大规模的 Service Mesh 落地，为什么我们敢这么做？因为我们具备能够让架构平滑迁移的方案。"兼容性"是任何架构演进升级都必然要面对的一个问题，这在早已实践微服务化架构的蚂蚁金服内部同样如此。为了实现架构的平滑迁移，需要让新老节点的外在行为尽可能的表现一致，从而让依赖方无感知，这其中很重要的一点就是保持协议兼容性。

因此，我们需要在 Service Mesh 架构下，兼容现有微服务体系中的通信协议——也就是说需要在 MOSN 内实现对目前蚂蚁金服内部通信协议的扩展支持。

![通信协议扩展支持](https://cdn.nlark.com/yuque/0/2020/png/226702/1585209248513-3bf90371-3d7c-4a0f-a98a-db4538bb2271.png)

基于 MOSN 本身的扩展机制，我们完成了最初版本的协议扩展接入。但是在实践过程中，我们发现这并不是一件容易的事情：

- 相比编解码，协议自身的处理以及与框架集成才是其中最困难的环节，需要理解并实现包括请求生命周期、多路复用处理、链接池等等机制；
- 社区主流的 xDS 路由配置是面向 HTTP 协议的，无法直接支持私有协议，存在适配成本；

基于这些实践痛点，我们设计了 MOSN 多协议框架，希望可以降低私有协议的接入成本，加快普及 ServiceMesh 架构的落地推进。

## 常见的协议扩展思路初探

前面介绍了背景，那么具体协议扩展框架要怎么设计呢？我们先来看一下业界的思路与做法。

### 协议扩展框架 - Envoy

![协议扩展框架 - Enovy](https://cdn.nlark.com/yuque/0/2020/png/226702/1585209248576-01797bba-8a94-4960-be17-1c87c725a75a.png)
注：图片来自 Envoy 分享资料

第一个要介绍的是目前发展势头强劲的 Envoy。从图上可以看出，Envoy 支持四层的读写过滤器扩展、基于 HTTP 的七层读写过滤器扩展以及对应的 Router/Upstream 实现。如果想要基于 Envoy 的扩展框架实现 L7 协议接入，目前的普遍做法是基于 L4 filter 封装相应的 L7 codec，在此基础之上再实现对应的协议路由等能力，无法复用 HTTP L7 的扩展框架。 

### 协议扩展框架 - Nginx

![协议扩展框架 - Nginx](https://cdn.nlark.com/yuque/0/2020/png/226702/1585209248600-c47725ed-7d47-4c07-ad1b-f2e2ba4ea2c6.png)

第二个则是老牌的反向代理软件 Nginx，其核心模块是基于 Epoll/Kqueue 等 I/O 多路复用技术之上的离散事件框架，基于事件框架之上构建了 Mail、Http 等协议模块。与 Envoy 类似，如果要基于 Nginx 扩展私有协议，那么也需要自行对接事件框架，并完整实现包括编解码、协议处理等能力。

### 协议扩展框架 - MOSN

![协议扩展框架 - MOSN](https://cdn.nlark.com/yuque/0/2020/png/226702/1585209248645-5d6eac2f-962e-4c3c-92f1-814d18db47cd.png)

最后回过头来，我们看一下 MOSN 是怎么做的。实际上，MOSN 的底层机制与 Envoy、Nginx 并没有核心差异，同样支持基于 I/O 多路复用的 L4 读写过滤器扩展，并在此基础之上再封装 L7 的处理。但是与前两者不同的是，MOSN 针对典型的微服务通信场景，抽象出了一套适用于基于多路复用 RPC 协议的扩展框架，屏蔽了 MOSN 内部复杂的协议处理及框架流程，开发者只需要关注协议本身，并实现对应的框架接口能力即可实现快速接入扩展。

### 三种框架成本对比

![三种框架成本对比](https://cdn.nlark.com/yuque/0/2020/png/226702/1585209248614-5807d3b3-fb18-4a15-83ef-e05bb162f222.png)

最后对比一下，典型微服务通信框架协议接入的成本，由于 MOSN 针对此类场景进行了框架层面的封装支持，因此可以节省开发者大量的研发成本。

## SOFABolt 协议接入实践

初步了解多协议框架的设计思路之后，让我们以 SOFABolt 协议为例来实际体验一下协议接入的过程。

### SOFABolt 简介

![SOFABolt](https://cdn.nlark.com/yuque/0/2020/png/226702/1585209248663-0e25c95b-d711-4de2-9a42-f71d05b360df.png)

这里先对 SOFABolt 进行一个简单介绍，SOFABolt 是一个开源的轻量、易用、高性能、易扩展的  RPC 通信框架，广泛应用于蚂蚁金服内部。

SOFABolt：[https://github.com/sofastack/sofa-bolt](https://github.com/sofastack/sofa-bolt)

基于 MOSN 的多协议框架，实际编写了 7 个代码文件，一共 925 行代码(包括 liscence、comment 在内)就完成了接入。如果对于协议本身较为熟悉，且具备一定的 MOSN/Golang 开发经验，甚至可以在一天内就完成整个协议的扩展，可以说接入成本是非常之低。

![多协议框架](https://cdn.nlark.com/yuque/0/2020/png/226702/1585209248669-1138c7d3-fc69-446c-99a9-65932aebca99.png)

Github:
[https://github.com/mosn/mosn/tree/master/pkg/protocol/xprotocol/bolt](https://github.com/mosn/mosn/tree/master/pkg/protocol/xprotocol/bolt)

下面让我们进入正题，一步一步了解接入过程。

### Step1：确认协议格式

第一步，需要确认要接入的协议格式。为什么首先要做这个，因为协议格式是一个协议最基本的部分，有以下两个层面的考虑：

- 任何协议特性以及协议功能都能在上面得到一些体现，例如有无 requestId/streamId 就直接关联到协议是否支持连接多路复用；
- 协议格式与报文模型直接相关，两者可以构成逻辑上的映射关系；而这个映射关系也就是所谓的编解码逻辑；

![确认协议格式](https://cdn.nlark.com/yuque/0/2020/png/226702/1585209248674-536ba7de-4f23-4797-a3db-cc085ec8a620.png)

以 SOFABolt 为例，其第一个字节是协议 magic，可以用于校验当前报文是否属于 SOFABolt 协议，并可以用于协议自动识别匹配的场景；第二个字节是 type，用于标识当前报文的传输类型，可以是 Request / RequestOneway / Response 中的一种；第三个字节则是当前报文的业务类型，可以是心跳帧，RPC 请求/响应等类型。后面的字段就不一一介绍了，可以发现，**理解了协议格式本身，其实对于协议的特性支持和模型编解码就理解了一大半，**因此第一步协议格式的确认了解是重中之重，是后续一切工作开展的前提。

### Step2：确认报文模型

![确认报文模型](https://cdn.nlark.com/yuque/0/2020/png/226702/1585209248773-66c3234b-f805-4735-9e70-acf8abef294b.png)

顺应第一步，第二步的主要工作是确认报文编程模型。一般地，在第一步完成之后，应当可以很顺利的构建出相应的报文模型，SOFABolt 例子中可以看出，模型字段设计基本与协议格式中的 header / payload 两部分相对应。有了编程模型之后，就可以继续进行下一步——基于模型实现对应的框架扩展了。

### Step3：接口实现 - 协议

![接口实现 - 协议](https://cdn.nlark.com/yuque/0/2020/png/226702/1585209248724-28eaa458-a928-4f19-bf16-96895808a5b8.png)

协议扩展，顾名思义，是指协议层面的扩展，描述的是协议自身的行为（区别于报文自身）。

目前多协议框架提供的接口包括以下五个：

- Name：协议名称，需要具备唯一性；
- Encoder：编码器，用于实现从报文模型到协议传输字节流的映射转换；
- Decoder：解码器，用于实现从协议传输字节流到报文模型的映射转换；
- Heartbeater：心跳处理，用于实现心跳保活报文的构造，包括探测发起与回复两个场景；
- Hijacker：错误劫持，用于在特定错误场景下错误报文的构造；

### Step3：接口实现 - 报文

![接口实现 - 报文](https://cdn.nlark.com/yuque/0/2020/png/226702/1585209248793-9cb8efd3-c12e-4da1-91f9-0901bcf36e16.png)

前面介绍了协议扩展，接下里则是报文扩展，这里关注的是单个请求报文需要实现的行为。

目前框架抽象的接口包括以下几个：

- Basic：需要提供 GetStreamType、GetHeader、GetBody 几个基础方法，分别对应传输类型、头部信息、载荷信息；
- Multiplexing：多路复用能力，需要实现 GetRequestId 及 SetRequestId；
- HeartbeatPredicate：用于判断当前报文是否为心跳帧；
- GoAwayPredicate：用于判断当前报文是否为优雅退出帧；
- ServiceAware：用于从报文中获取 service、method 等服务信息；

### 举个例子

![框架如何基于接口封装处理流程](https://cdn.nlark.com/yuque/0/2020/png/226702/1585209248756-4c3fce60-436b-4153-9372-b39fe80fc975.png)

这里举一个例子，来让大家对**框架如何基于接口封装处理流程**有一个体感：服务端心跳处理场景。当框架收到一个报文之后：

- 根据报文扩展中的 GetStreamType 来确定当前报文是请求还是响应。如果是请求则继续 2；
- 根据报文扩展中的 HeartbeatPredicate 来判断当前报文是否为心跳包，如果是则继续 3；
- 当前报文是心跳探测(request + heartbeat)，需要回复心跳响应，此时根据协议扩展中的 Heartbeater.Reply 方法构造对应的心跳响应报文；
- 再根据协议扩展的 Encoder 实现，将心跳响应报文转换为传输字节流；
- 最后调用 MOSN 网络层接口，将传输字节流回复给发起心跳探测的客户端；

当协议扩展与报文扩展都实现之后，MOSN 协议扩展接入也就完成了，框架可以依据协议扩展的实现来完成协议的处理，让我们实际演示一下 SOFABolt 接入的 example。

Demo 地址：[https://github.com/mosn/mosn/tree/master/examples/codes/sofarpc-with-xprotocol-sample](https://github.com/mosn/mosn/tree/master/examples/codes/sofarpc-with-xprotocol-sample)

## MOSN 多协议机制设计解读

通过 SOFABolt 协议接入的实践过程，大家对如何基于 MOSN 来做协议扩展应该有了一个初步的认知。那么 MOSN 多协议机制究竟封装了哪些逻辑，背后又是如何思考设计的？接下来将会挑选几个典型技术案例为大家进行解读。

### 协议扩展框架

**协议扩展框架 -  编解码**

![协议扩展框架 - 编解码](https://cdn.nlark.com/yuque/0/2020/png/226702/1585227625966-1b00d83d-fff1-40f1-b6b1-3bda19db0afb.png)

最先介绍的是编解码机制，这个在前面 SOFABolt 接入实践中已经简单介绍过，MOSN 定义了编码器及解码器接口来屏蔽不同协议的编解码细节。协议接入时只需要实现编解码接口，而不用关心相应的接口调用上下文。

**协议扩展框架 - 多路复用**

![协议扩展框架 - 多路复用](https://cdn.nlark.com/yuque/0/2020/png/226702/1585209248762-c83706cd-b413-468c-80b1-151de9ae8f3c.png)

接下来是多路复用机制的解读，这也是流程中相对不太好理解的一部分。首先明确一下链接多路复用的定义：允许在单条链接上，并发处理多个请求/响应。那么支持多路复用有什么好处呢？

以 HTTP 协议演进为例，HTTP/1 虽然可以维持长连接，但是单条链接同一时间只能处理一个请求/相应，这意味着如果同时收到了 4 个请求，那么需要建立四条 TCP 链接，而建链的成本相对来说比较高昂；HTTP/2 引入了 stream/frame 的概念，支持了分帧多路复用能力，在逻辑上可以区分出成对的请求 stream 和响应 stream，从而可以在单条链接上并发处理多个请求/响应，解决了 HTTP/1 链接数与并发数成正比的问题。

类似的，典型的微服务框架通信协议，如 Dubbo、SOFABolt 等一般也都实现了链接多路复用能力，因此 MOSN 封装了相应的多路复用处理流程，来简化协议接入的成本。让我们跟随一个请求代理的过程，来进一步了解。

![上下游关联映射](https://cdn.nlark.com/yuque/0/2020/png/226702/1585209248791-900751cb-c096-48d4-a5d5-d8247ef9d725.png)

1. MOSN 从 downstream(conn=2) 接收了一个请求 request，依据报文扩展多路复用接口 GetRequestId 获取到请求在这条连接上的身份标识(requestId=1)，并记录到关联映射中待用；
1. 请求经过 MOSN 的路由、负载均衡处理，选择了一个 upstream(conn=5)，同时在这条链接上新建了一个请求流(requestId=30)，并调用文扩展多路复用接口 SetRequestId 封装新的身份标识，并记录到关联映射中与 downstream 信息组合；
1. MOSN 从 upstream(conn=5) 接收了一个响应 response，依据报文扩展多路复用接口 GetRequestId 获取到请求在这条连接上的身份标识(requestId=30)。此时可以从上下游关联映射表中，根据 upstream 信息(connId=5, requestId=30) 找到对应的 downstream 信息(connId=2, requestId=1)；
1. 依据 downstream request 的信息，调用文扩展多路复用接口 SetRequestId 设置响应的 requestId，并回复给 downstream；

在整个过程中，框架流程依赖的报文扩展 Multiplexing 接口提供的能力，实现了上下游请求的多路复用关联处理，除此之外，框架还封装了很多细节的处理，例如上下游复用内存块合并处理等等，此处限于篇幅不再展开，有兴趣的同学可以参考源码进行阅读。

### 统一路由框架

![统一路由框架](https://cdn.nlark.com/yuque/0/2020/png/226702/1585209248786-ff9c157a-5ff9-444b-8b0f-2da90ddb8392.png)

接下来要分析的是「统一路由框架」的设计，此方案主要解决的是非 HTTP 协议的路由适配问题。我们选取了以下三点进行具体分析：

- 通过基于属性匹配(attribute-based)的模式，与具体协议字段解耦；
- 引入层级路由的概念，解决属性扁平化后带来的线性匹配性能问题；
- 通过变量机制懒加载的特定，按需实现深/浅解包；

**统一路由框架 – 基于属性匹配**

![统一路由框架 - 基于属性匹配](https://cdn.nlark.com/yuque/0/2020/png/226702/1585209248809-fe944cba-e8df-4497-8eff-c8d47131c918.png)

首先来看一下典型的 RDS 配置，可以看到其中的 domains、path 等字段，对应的是 HTTP 协议里的域名、路径概念，这就意味着其匹配条件只有 HTTP 协议才有字段能够满足，配置结构设计是与 HTTP 协议强相关的。这就导致了如果我们新增了一个私有协议，无法复用 RDS 的配置来做路由。

那么如何解决配置模型与协议字段强耦合呢？简单来说就是把匹配字段拆分为扁平属性的键值对(key-value pair)，匹配策略基于键值对来处理，从而解除了匹配模型与协议字段的强耦合，例如可以配置 key: $http_host，也可以配置 key:$dubbo_service，这在配置模型层面都是合法的。

但是这并不是说匹配就有具体协议无关了，这个关联仍然是存在的，只是从强耦合转换为了隐式关联，例如配置 key: $http_host，从结构来说其与 HTTP 协议并无耦合，但是值变量仍然会通过 HTTP 协议字段来进行求值。

**统一路由框架 -  层级路由**

![统一路由框架 -  层级路由](https://cdn.nlark.com/yuque/0/2020/png/226702/1585209248832-20483dc3-e959-4cf4-aecd-cbe5ba37b4fb.png)

在引入「基于属性的匹配」之后，我们发现了一个问题，那就是由于属性本身的扁平化，其内在并不包含层级关系。如果没有层级关系，会导致匹配时需要遍历所有可能的情况组合，大量条件的场景下匹配性能近似于线性的 O(n)，这显然是无法接受的。 

举例来说，对于 HTTP 协议，我们总是习惯与以下的匹配步骤：

- 匹配 Host(:authority) ；
- 匹配 Path ；
- 匹配 headers/args/cookies ；

这其实构成了一个层级关系，每一层就像是一个索引，通过层级的索引关系，在大量匹配条件的情况下仍然可以获得一个可接受的耗时成本。但是对于属性(attribute)，多个属性之间并没有天然的层级关系(相比于 host、path 这种字段)，这依赖于属性背后所隐式关联的字段，例如对于 Dubbo 协议，我们希望的顺序可能是：

- 匹配 $dubbo_service；
- 匹配 $dubbo_group；
- 匹配 $dubbo_version；
- 匹配 $dubbo_attachments_xx；

因此在配置模型上，我们引入了对应的索引层级概念，用于适配不同协议的结构化层级路由，解决扁平属性的线性匹配性能问题。

**统一路由框架 - 浅解包优化**

![统一路由框架 - 浅解包优化](https://cdn.nlark.com/yuque/0/2020/png/226702/1585209248848-77a91fc3-ab6c-4eb8-a62b-3496668d66c3.png)

最后，介绍一下浅解包优化的机制。利用 MOSN 变量懒加载的特性，我们可以在报文解析时，先不去解析成本较高的部分，例如 dubbo 协议的 attachments。那么在代理请求的实际过程中，需要使用到 attachments 里的信息时，就会通过变量的 getter 求值逻辑来进行真正的解包操作。依靠此特性，可以大幅优化在不需要深解包的场景下 dubbo 协议代理转发的性能表现，实现按需解包。

### 解读总结

最后，对设计部分的几个技术案例简单总结一下，整体的思路仍然是对处理流程进行抽象封装，并剥离可扩展点，从而降低用户的接入成本。

在协议扩展支持方面：

- 封装编解码流程，抽象编解码能力接口作为协议扩展点
- 封装协议处理流程，抽象多路复用、心跳保活、优雅退出等能力接口作为协议扩展点

在路由框架方面：

- 通过改为基于属性匹配的机制，与具体协议字段解耦，支持多协议适配；
- 引入层级路由机制，解决属性扁平化的匹配性能问题；
- 利用变量机制懒加载特性，按需实现深/浅解包；

## 后续规划及展望

### 更多流模式支持、更多协议接入

![更多流模式支持、更多协议接入](https://cdn.nlark.com/yuque/0/2020/png/226702/1585209248869-cc2b0d96-1e9c-4e77-8047-d2022dd3dac0.png)

当前 MOSN 多协议机制，已经可以比较好的支持像 Dubbo、SOFABolt 这样基于多路复用流模型的微服务协议，后续会继续扩展支持的类型及协议，例如经典的 PING-PONG 协议、Streaming 流式协议，也欢迎大家一起参与社区建设，贡献你的 PR。

### 社区标准方案推进

![社区标准方案推进](https://cdn.nlark.com/yuque/0/2020/png/226702/1585209248892-b736ba21-4a23-4f8b-9ba0-7623f7125e72.png)

与此同时，我们注意到 Istio 社区其实也有类似的需求，希望设计一套协议无关的路由机制——"Istio Meta Routing API"。其核心思路与 MOSN 的多协议路由框架基本一致，即通过基于属性的路由来替代基于协议字段的路由。目前该草案还处于一个比较初级的阶段，对于匹配性能、字段扩展方面还没有比较完善的设计说明，后续 MOSN 团队会积极参与社区方案的讨论，进一步推动社区标准方案的落地。

以上就是本期分享的全部内容，如果大家对 MOSN 有问题以及建议，欢迎在群内与我们交流。

### 本期视频回顾以及 PPT 查看地址

[https://tech.antfin.com/community/live/1131](https://tech.antfin.com/community/live/1131)

## MOSN Logo 社区投票结果公示

MOSN 的 Logo 升级，在进过社区投票后，在本期直播结束后截止。截止 2020年3月26日20:00，有效票数 35 票。方案一 25 票，占比 71.43%；方案二 2 票，占比 5.71%；方案三 8 票，占比 22.86%。最终，方案一大比分胜出，**方案一 为 MOSN 最终 Logo **。感谢大家参与社区投票～

![MOSN logo](https://cdn.nlark.com/yuque/0/2020/png/226702/1585209248937-7adc6883-27ef-4f59-acce-20183b5a0407.png)

恭喜以下社区同学，你们投票与最终结果一致～Github ID： [@CodingSinger](https://github.com/CodingSinger) [@trainyao](https://github.com/trainyao) [@JasonRD](https://github.com/JasonRD) [@taoyuanyuan](https://github.com/taoyuanyuan) [@wangfakang](https://github.com/wangfakang) [@ujjboy](https://github.com/ujjboy) [@InfoHunter](https://github.com/InfoHunter) [@Tony-Hangzhou](https://github.com/Tony-Hangzhou) [@GLYASAI](https://github.com/GLYASAI) [@carolove](https://github.com/carolove) [@tanjunchen ](https://github.com/tanjunchen)[@bruce-sha](https://github.com/bruce-sha) [@hb-chen](https://github.com/hb-chen) [@luxious](https://github.com/luxious) [@echooymxq](https://github.com/echooymxq) [@qunqiang](https://github.com/qunqiang) [@f2h2h1](https://github.com/f2h2h1) [@sunny0826](https://github.com/sunny0826) [@token01](https://github.com/token01) [@Ayi- ](https://github.com/Ayi-)[@cytyikai](https://github.com/cytyikai) [@fanyanming2016](https://github.com/fanyanming2016) [@inkinworld](https://github.com/inkinworld) [@dllen](https://github.com/dllen) [@meua](https://github.com/meua)

具体 issue 地址：[https://github.com/mosn/community/issues/2](https://github.com/mosn/community/issues/2)