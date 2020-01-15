---
title: "蚂蚁金服 API Gateway Mesh 思考与实践"
author: "贾岛"
authorlink: "https://github.com/jwx0925"
description: " 本次分享，将从蚂蚁金服 API 网关发展历程来看，Mesh 化的网关架构是怎样的、解决了什么问题、双十一的实践表现以及我们对未来的思考。"
categories: "Service Mesh"
tags: ["Service Mesh","MOSN","Service Mesh Meetup"]
date: 2020-01-15T17:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1579060022516-11dd9680-41f9-441b-969b-7aa319e03564.jpeg"
---

![Service Mesh Meetup 现场照](https://cdn.nlark.com/yuque/0/2020/png/226702/1578548444833-e8a44e1c-0055-465a-99a4-a84339bce3e3.png)

本文整理自蚂蚁金服高级技术专家贾岛在 12 月 28 日 Service Mesh Meetup 杭州站现场分享。

## MOSN 完成孵化， 启用独立 Group

**2020.2019.12.18，MOSN 项目负责人、蚂蚁金服应用网络组负责人涵畅宣布 MOSN 完成从 SOFAStack 的孵化，将启用独立 Group 进行后续运作，欢迎大家共同建设社区。**

MOSN 是一款使用 Go 语言开发的网络代理软件，作为云原生的网络数据平面，旨在为服务提供多协议，模块化，智能化，安全的代理能力。MOSN 是 Modular Open Smart Network-proxy 的简称，可以与任何支持 xDS API 的 Service Mesh 集成，亦可以作为独立的四、七层负载均衡，API Gateway，云原生 Ingress 等使用。

项目地址：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

## 导语

在 Service Mesh 微服务架构中，我们常常会听到东西流量和南北流量两个术语。蚂蚁金服开源的 Service Mesh Sidecar：MOSN（Modular Observable Smart Network）已经多次与大家见面交流，以往的议题重点在东西流量的服务发现与路由，那么蚂蚁金服在南北流量上的思考是怎样的？

本次分享，将从蚂蚁金服 API 网关发展历程来看，Mesh 化的网关架构是怎样的、解决了什么问题、双十一的实践表现以及我们对未来的思考。

![导读](https://cdn.nlark.com/yuque/0/2020/png/226702/1578548437876-5163fc42-0828-4b82-bd8c-a1afbc697657.png)

今天的分享分为三个部分：

1. API Gateway Mesh 的定义：我在 Google 上搜了下 API Gateway Mesh 这个词，找到的都是 API Gateway vs Service Mesh，大家估计也会很好奇：这个词具体的定义是怎样的呢？所以我们下面会做将 API Gateway 和 Service Mesh 做个对比，然后讲一下我个人对这个词有理解和思考。
1. API Gateway Mesh 在蚂蚁金服的实践：今年阿里巴巴核心系统 100% 云原生化，撑住了双11的世界级流量洪峰，这其中，蚂蚁金服的 Service Mesh 大放光彩，核心链路全上 Mesh，数万容器规模，我们 API Gateway 在其中也承担了部分钱包链路和支付链路 100% 的请求。这个章节，我会从蚂蚁金服 API 网关的发展历程来看，我们为什么做 API Gateway Mesh，我们的架构是如何的，以及我们在过程中的一些风险和考验。
1. 云原生下 API Gateway 的思考：大家现在都在讲云原生，但是真正实践云原生的过程中，会越到各种各样的问题，怎么样的 API Gateway 方案和形态是最合适你们的业务的？在云原生的架构中，Service Mesh，API Gateway 都是最核心的组件之一，我们对于云原生下的 API Gateway 在 Service Mesh 架构中的定位是如何思考的？还有，未来我们的一些计划是怎样的？都会在这个章节跟大家分享一下。

## API Gateway Mesh 的定义

![API Gateway in Service Mesh](https://cdn.nlark.com/yuque/0/2020/png/226702/1578548437987-d3ce4f1d-e4ee-4605-b88b-b917526069d9.png)

上面这张图是一个云原生，南北+东西流量的架构图，这里面包含了核心的一些组件，我快速介绍一下：

- LB\ingress：负责 ssl 卸载、入口流量的负载均衡，通常会做一些简单的路由；
- API Gateway：负责更偏向业务的 API 验签、限流、协议转换、用户会话、负载均衡等逻辑；
- Sidecar in POD：业务系统中的 Sidecar，代理机房内东西流量的转发，一般走内部的 RPC（比如SOFARPC \ Dubbo \ Thrift \ SpringCloud），这里面的流量全部通过 Service Mesh 的 Sidecar Proxy 来承载，这个 Sidecar 负责路由（单元化\灰度\金丝雀），负载均衡、服务鉴权等等；
- Control Plane：流量控制「大管家」，云原生里目前最主流的方案是 Istio，负责路由策略、安全、鉴权等等下发和控制；

上面的架构大家都比较了解了，从上面的描述大家也看出来了，API Gateway 和 Service Mesh 的 Sidecar 很多能力都是类似的，比如都是一个网络代理，都具备负载均衡，都具备一些限流和鉴权能力。下面，我们将做一个 API  Gateway 和 Service Mesh 的对比。

### API  Gateway vs Service Mesh 

![API Gateway vs Service Mesh](https://cdn.nlark.com/yuque/0/2020/png/226702/1578548437900-a57f1295-7309-4e30-a39a-8c9289fc8938.png)

从本质概念上来讲，API Gateway 用一句话概括：「Exposes your services as managed APIs」，将内部的服务以更加可控可管理的方式暴露出去，这里的关键词是「暴露」和「可控」。Service Mesh 用一句话概括：「A infrastructure to decouple the application network from your service code」，一种将服务代码与应用网络解耦的基础设施，这里的关键词是「解耦」。

在流量上，API Gateway 是管理南北流量的，而 Servcie Mesh 中的 Sidecar 一般情况下是用来负载东西流量的Proxy。两者都具备负责均衡的能力，API Gateway 一般情况下是通过 lvs 、nginx 中心化的一个负载均衡器，我们管这个叫硬负载；而 Service Mesh 一般情况下是通过服务发现，Sidecar 之间是点对点的调用，我们叫软负载。

通信协议上，API Gateway 一般对外接收开放的通信协议，一般是 HTTP、gRPC 等，而且可能涉及到协议的转换，将 HTTP 转换成内部的 RPC 协议，而 Service Mesh 代理的内部流量一般是内部的私有 RPC 协议（WebService、Dubbo、SOFABolt、Thrift 等等）。在鉴权、流控、安全等控制流量的层面上，对于 API Gateway 来讲都是强依赖的，这样才体现「可控」的特点，而 Service Mesh 代理的内部流量，由于一般处于内网环境，这些控制一般情况下都是弱依赖。

### 我们对 Service Mesh 的真正理解

大家可以看到，API Gateway 和 Service Mesh 实际上有很多共同点，也有很多区别。那 API Gateway Mesh 到底是如何定义的呢？那要介绍下，我们对 Service Mesh 的真正理解！

![Service Mesh is Patterns](https://cdn.nlark.com/yuque/0/2020/png/226702/1578548437909-f4439bd3-efff-490f-b795-90c2bb78bd27.png)

Service Mesh 中的 Sidecar 就是这样一辆边车摩托车，Sidecar 将 Service Code 和内部通信 RPC 逻辑解耦掉。但是 Sidecar 的座位上，不仅仅可以坐「内部通信的 RPC」，也可以将其他中间件放到这辆 Sidecar 中，API Gateway + Sidecar = API Gateway Mesh，我们也可以把 MessageQueue Client 放在 Sidecar 中，就是 Message Mesh。

所以，大家看，其实 Service Mesh 是一种模式和架构，关键词就是「解耦」你的服务代码和你的「中间件」。

### API Gateway Mesh 定义

![API Gateway Mesh 的定义](https://cdn.nlark.com/yuque/0/2020/png/226702/1578548437945-050874c2-a9cc-4dbb-b194-3195861559a9.png)

所以 API Gateway Mesh 的定义是：An infrastructure to expose your services as a managed APIs in the form of a decoupled sidecar proxy，以解耦 Sidecar 的形式，将你的服务代码暴露成可控的 API 基础设施。

OK，到目前为止，API Gateway Mesh 的定义解释清楚了，但是我们为什么要这样架构我们的 API Gateway？这样做解决了什么问题？解释这些问题，要从支付宝 API 网关的发展历程来看。

## 蚂蚁金服 API Gateway Mesh 实践

### 支付宝移动网关的前身

![支付宝移动网关的前身](https://cdn.nlark.com/yuque/0/2020/png/226702/1578548437941-e0280224-317f-4da7-bd2a-b4aa50901c52.png)

支付宝 APP 第一版2009年发布的，2009年还是功能机（Nokia Symbian）的天下，APP 移动端还不是流量的主入口，所以 APP 服务器的架构也是很简单的，所有业务代码都堆积在一个叫 Mobile 的系统中，对外提供 https restful 服务，这样的架构优点就是简单粗暴。随着时间的推迟，2013年移动互联网崛起，智能机（Android&iOS）普及开来，公司越来越多的业务转向移动端，一个 Mobile 系统已经成为研发的瓶颈，另外单体系统的稳定性问题也凸现出来。

2013年，公司提出「ALL IN」无线的战略，那个时候产生了移动微服务网关（2014年马丁大叔提出了微服务概念），主要是解决多业务团队协作的问题。

### 微服务网关架构

![微服务网关架构](https://cdn.nlark.com/yuque/0/2020/png/226702/1578548437924-ec6ab312-53bb-4b27-bf48-a09e944d100e.png)

我们在这套网关架构中，设计了蚂蚁金服无线 RPC 协议（类似于 gRPC），支持客户端 iOS、Android 多语言 RPC 代码生成能力，屏蔽了网络通信细节，加入了更多安全、鉴权、监控的能力。由于传统 Servlet 的线程模型与后端系统 RT 很敏感，我们将 API Gateway 的通信全部改成了 Netty 异步化。为了解决 HTTP 通信在移动弱网下的不友好，我们设计了基于 TCP 的私有长连接协议。这样一个架构支撑了3-4年的业务快速发展。

但是在2016年底，中心化的网关暴露出很多问题，比如：

- 网关更变风险的问题：网关的逻辑变更发布一旦有问题，将会影响所有业务；
- 业务分级隔离的问题：核心业务的 API 希望和非核心业务的接口做资源上隔；
- 大促容量评估的问题：每年双11、新春红包活动，上万 API 接口的 QPS 很难评估，不同 API 的 RT、BodySize、QPS 对于网关性能的影响都是不同的，为了网关入口的稳定性，一般情况下，都会疯狂的扩容；

### 去中心化网关

基于上述的问题，我们打算干掉形式上的网关，这样就引入了下一代的网关架构：去中心化网关。

![去中心化网关架构](https://cdn.nlark.com/yuque/0/2020/png/226702/1578548437979-958ca053-6811-4a81-9a99-864a6796d5b9.png)

我们将中心化的网关进行了拆分，将逻辑简单的路由模块迁移到 spanner 负载均衡器上，将网关复杂的鉴权、LDC 路由、安全等逻辑抽象成一个 gateway.jar，业务集成这个 Jar 包就具备了网关的能力，这样业务系统之间做到了隔离，中心化的网关变更风险也不会影响到这些系统，这些系统本身就是一个「网关」，大促容量的问题也不再是问题。

一个新的架构，解决了一些问题，但是也会引入一些新的问题。

去中心化架构平稳运行了2年，接入了30多个系统（全量系统在数百个），承载了60%-80%的流量，为什么只接入30个系统？因为目前的去中心化网关架构存在很多问题，导入推广比较困难：

- 接入困难：gateway.jar 依赖了数十个 Jar，另外还存在配置，而且新的版本还在不停加新的依赖；
- Jar 包冲突：一个案例，gateway.jar 依赖 Netty 低版本，某个中间件升级间接升级了这个 Netty 版本，导致网关 Jar 的功能异常；
- 升级困难：最开始的时候，我们有想过去中心化网关带来的版本多、升级难的问题，但是当时天真的认为，网关发展了这么多年，已经很稳定，不需要经常变更了，而且即使变更，让需要更新的系统升级一下就好了。但是事情总是想象的太美好：一旦有升级，业务方都要说：开发集成、回归测试，没时间！新功能无法普及，全网升级更本超级高；
- 异构系统支持：支付宝有部分业务是 Node.js 技术栈的，Node.js 中间件团队非常牛逼，花了1-2个月时间用 JavaScript 把网关的 Java 的代码翻译了一遍，但是后面放弃了更新了，新功能不可能全部 copy 一遍，成本太高，而且研发同学没有成就感...

看到这里，大家是不是感觉跟 Service Mesh 解决的问题差不多：解耦网关代码和业务代码、独立升级、支持异构系统。所以我们将去中心化的网关 Jar 集成到 Service Mesh 的 Sidecar 中，引入了下一代网关架构：Mesh 化网关架构。

### Mesh 化网关架构

![Mesh 化网关架构](https://cdn.nlark.com/yuque/0/2020/png/226702/1578548437956-c8721940-0e95-4a23-aa60-876c9577cb0e.png)

总结一下：

- 微服务网关架构：解耦业务和网关；
- 去中心化网关架构：解决稳定性、业务分级隔离、大促容量评估等问题；
- Mesh 化网关架构：解决了去中心化升级难，异构系统支持等问题；

### 蚂蚁金服 API Gateway Mesh 架构

下面介绍下蚂蚁金服 API Gateway Mesh 的架构和落地过程中的问题。

![蚂蚁金服 API Gateway Mesh 架构](https://cdn.nlark.com/yuque/0/2020/png/226702/1578548438055-15a2fe82-0b2e-4446-bcba-9af29f640e4d.png)

上图是 API Gateway Mesh 的架构图，其中有3个流：

- 数据流：业务数据通过 Spanner 直接转发到某个系统中 POD 的 Sidecar 中，经过网关内的各种检验逻辑，本地或转发请求到 SOFA 业务逻辑中；
- 控制流：一般 Service Mesh 中的控制面是 Istio 中的 Pilot 组件，但是由于原生 Pilot 组件在较大体量体况下性能不行，所以我们目前没有走 Pilot，而是直接对接了网关后台管控；
- Ops 流：是运维的通道，通过 K8s operator sidecar 注入的方式，让业务具备网关 Mesh 的能力；

![API Gateway Mesh Based on MOSN](https://cdn.nlark.com/yuque/0/2020/png/226702/1578548437968-048e4b49-35af-4a41-8e3f-ca96f4421267.png)

![API Gateway Core](https://cdn.nlark.com/yuque/0/2020/png/226702/1578548438129-836383e3-8208-42e4-aa0e-d526f3c0fe17.png)

API Gateway Mesh 的底座是蚂蚁金服开源的 MOSN Sidecar Proxy，我们基于 MOSN 的模块化扩展能力，升级了一层 Gateway Core Module，包括核心的 Server、Router、Pipeline、Service、Config 等核心模型，集成了 Lua、JavaScript 等动态脚本增强网关的动态能力，基于 MOSN 的协议扩展能力，轻松地实现了蚂蚁金服的 MMTP 私有协议。在 Gateway Core 的上线，通过插拔不同的 Filter 和 Config，扩展出不同场景的网关产品，如蚂蚁金服的无线网关、开放平台网关、金融云网关等等。控制面上我们支持多种形式的配置下发通道，包括 Istio 的 XDS、Amdin RestAPI，K8s ConfigMap 等等。

MOSN：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

新技术的上线，绝对不是一件简单的事！

![API Gateway Mesh 落地挑战](https://cdn.nlark.com/yuque/0/2020/png/226702/1578548438034-05ad51b6-28fc-48e2-9ed3-814e8a6b812d.png)

- 功能：因为 MOSN 是基于 Go 语言研发的，所以我们要将 Java 技术栈转向 Go，但不仅仅是照搬 Java 代码，根据 Go 的语言特点，不仅做好功能，更好做好性能；
- 性能：最终线上压测，我们发现 Mesh 版本比原来的 Java 版本还有一定的性能提升，原因在于我们将序列化方式从 Hessian 改成了 Protobuf，另外 Java 的线程模式切换到 Go 的 goroutine 也带来了一定的性能提升；
- 运维：运维更想偏于 K8s 云原生的方向；
- 风险：已知的风险都不是风险，怎么降低未知的风险？

互联网公司与传统软件公司最大的区别就是敏捷，我们会将更多的精力放在三板斧的实现上。通常，我们为了做一个功能可能花了30%的工作量，但是要花70%的工作量来做灰度、回滚、监控的建设。

在 API Gateway Mesh 上线的过程中，我们如何做灰度和快速回滚的？

![API Gateway Mesh 灰度能力建设](https://cdn.nlark.com/yuque/0/2020/png/226702/1578548438081-8a136669-c1c9-481a-96f7-cb1dfe2f892d.png)

这里，我举一个例子，Spanner 为新网 Sidecar 切流的流程。我们支持通过百分比切流，可以做到慢速度的灰度和快速的回滚。另外，MOSN 的 Sidecar 注入不是一次性全集群接入的，我们通过 Label 打标的方式，支持集群部分单机集成 MOSN 的切流验证。

## 云原生下 API Gateway 的思考

### 云原生南北向流量方案

上面介绍的是蚂蚁金服在实践 API Gateway Mesh 的一些经验，接下来，我想跟大家分享，云原生下一些标准的南北向流量解决方案的选择问题。

![云原生南北向流量方案](https://cdn.nlark.com/yuque/0/2020/png/226702/1578548437988-478590d5-6457-4bca-bfac-df8c2c01680c.png)

上图是业界主流的3种南北向方案，第一种是 K8s Ingress，功能比较简单；第二种是 Istio Gateway，具备了比 Ingress 更多的路由等功能；第三种是功能更加强大的 API Gateway，可以更加精细化的管控接口和流量，可以根据自己业务的特点选择适合自己的南北向流量产品。

### 云原生下 MOSN 的多面性

下面，介绍下 MOSN 的多面性。

![云原生下 MOSN 的多面性](https://cdn.nlark.com/yuque/0/2020/png/226702/1578548438042-2bce29b9-8c2d-49e9-b1ab-e648c7c9f860.png)

前面讲过 Service Mesh 的 Sidecar，不仅仅只用于南北流量的 RPC，实际上它可以做所有流量的 Sidecar。

未来，MOSN 的定位就是云原生全功能网络代理，可以和 LB 部署在一起作为 LB Sidecar；可以独立部署作为中心化网关；可以和业务 POD 部署作为去中心化网关或 MessageQueue Client；也可以作为跨云通信网关。

Service Mesh 已来，还不赶紧上车！以上就是本期的全部分享内容。

## 作者介绍

靳文祥（花名贾岛），蚂蚁金服高级技术专家贾岛，2011年毕业后加入支付宝无线团队，一直从事移动网络接入、API 网关、微服务等相关的研发工作，目前负责蚂蚁金服移动网络接入架构设计与优化。

### 本期回顾视频以及分享 PPT 查看地址

[https://tech.antfin.com/community/activities/1056/review/962](https://tech.antfin.com/community/activities/1056/review/962)