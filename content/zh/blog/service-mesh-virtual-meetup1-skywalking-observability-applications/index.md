---
title: "Apache SkyWalking 在 Service Mesh 中的可观察性应用"
author: "高洪涛"
authorlink: "https://github.com/sofastack"
description: "本文根据5月7日晚，美国 Service Mesh 服务商 Tetrate 创始工程师高洪涛的主题分享《Apache SkyWalking 在 Service Mesh 中的可观察性应用》整理。"
categories: "Service Mesh"
tags: ["Service Mesh","Service Mesh Virtual Meetup"]
date: 2020-05-28T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1590737231249-c86acab6-bd8c-4fee-bfcf-1cc0625a6a4f.jpeg"
---

![Service Mesh Virtual Meetup](https://cdn.nlark.com/yuque/0/2020/png/1286189/1589857229052-fbe701b4-ba1a-4f3c-8408-29fc9f7b9292.png)

Service Mesh Virtual Meetup 是 ServiceMesher 社区和 CNCF 联合主办的线上系列直播。本期为 Service Mesh Virtual Meetup#1 ，邀请了四位来自不同公司的嘉宾，从不同角度展开了 Service Mesh 的应用实践分享，分享涵盖 Service Mesh 的可观察性和生产实践以及与传统微服务中可观察性的区别，还有如何使用 SkyWalking 来观测 Service Mesh，来自陌陌和百度的 Service Mesh 生产实践。

本文根据5月7日晚，美国 Service Mesh 服务商 Tetrate 创始工程师高洪涛的主题分享《Apache SkyWalking 在 Service Mesh 中的可观察性应用》整理。文末包含本次分享的视频回顾链接以及 PPT 下载地址。

## 前言

本次演讲为大家分享的是 Apache SkyWalking 对 Service Mesh 可观测性方面的应用实践，共分为三个部分：

- 第一部分是 Apache SkyWalking 的相关背景；
- 第二部分是 Service Mesh 场景下 SkyWalking 所面临的挑战；
- 最后是针对 Service Mesh 场景方案的演化；

## SkyWalking 的历史沿革及其特点

![SkyWalking 的历史沿革](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1590571638488-c7006a05-1db4-4b33-ae84-259a8381bb6d.jpeg)

SkyWalking 项目的建设目的是为了解决在微服务环境下，如何快速的定位系统稳定性问题。创始团队于2016年启动项目，经过一年的努力完善了最初的版本。2017年，团队启动将项目捐献给 Apache 基金会的流程。在 Apache 基金会孵化器内，经过了多轮系统升级迭代，并获得近乎翻倍的贡献者和关注度，于2019年顺利毕业。经过经年的升级与维护，SkyWalking 从最开始专注于分布式追踪系统的单一平台，发展为包含多个门类并拥有丰富的功能的全领域 APM 系统。

![Architecture](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1590571660622-717a5e16-8ec6-4a24-a661-c0d3e47e7962.jpeg)

SkyWalking 整体的系统架构包括有三个部分:

- 第一个是数据采集端，可以使用语言探针对系统的监控指标进行采集，同时也提供了一套完整的数据采集协议。第三方系统可以使用协议将相关的监控数据上报到分析平台。
- 第二部是分析平台，主要包括对监控指标数据的搜集，流式化处理，最终将数据写到存储引擎之中。存储引擎可使用Elasticsearch，MySQL数据库等多种方案。
- 第三部分是 UI。UI 组件有丰富的数据展示功能，包含指标展板，调用拓扑图，跟踪数据查询，指标比较和告警等功能。

在此基础上，SkyWalking 本身组件具有丰富的定制功能，方便用户去进行二次开发以支持自己特有的场景。

![SkyWalking 观察纬度](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1590571676780-cff7ac94-24d1-416f-bd2f-61e2bc7c8b82.jpeg)

SkyWalking 定义了三个维度用来绑定相关的监控指标数据。

- 服务(Service)：表示对请求提供相同行为的一系列或一组工作负载。在使用打点代理或 SDK 的时候, 你可以定义服务的名字。如果不定义的话，SkyWalking 将会使用你在平台上定义的名字, 如 Istio。
- 实例(Instance)：上述的一组工作负载中的每一个工作负载称为一个实例。就像 Kubernetes 中的 Pod 一样, 服务实例未必就是操作系统上的一个进程。但当你在使用打点代理的时候，一个服务实例实际就是操作系统上的一个真实进程。
- 端点(Endpoint)：对于特定服务所接收的请求路径，如 HTTP 的 URL 路径和 gRPC 服务的类名 + 方法签名。

预定义的维度可以方便的进行数据预汇集操作，是 SkyWalking 分析引擎重要的组成部分。虽然其相对的会有使用不够灵活的缺点，但在 APM 场景下，指标往往都是预先经过精心设计的，而性能才是关键因素。故 SkyWalking 采用这种预定义维度模式来进行数据汇集操作。

## Service Mesh 场景下 SkyWalking 面对的挑战

![可观察性](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1590571693607-b417fd18-68fd-4af7-96bf-171b6df548d9.jpeg)

在描述 Service Mesh 的场景下所面临的挑战之前，需要去解释可观测性所包含的含义。可观测性一般包含有三个部分:

- 第一点，日志系统。由其可以构建出系统运行的实时状态。故日志成为非常方便的观测手段。
- 第二点，分布式追踪。这部分数据在微服务场景下具有强大的生命力，可以提供给用户分布式系统观测指标。
- 第三点，指标监控。相比于日志和分布式追踪，其具有消耗小，处理简便等特点，通常作为系统监测告警的重要数据来源。

![Istio1.5 的架构图](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1590571715770-4358d04f-a5b3-41a8-8012-34c1c0c9c977.jpeg)

如上所示是 Istio1.5 的架构图。重点看一下他对可观测性的支持。从图上看，所有的监控指标都汇聚到中间的 Mixer 组件，然后由 Mixer 再发送给他左右的 Adapter，通过 Adapter 再将这些指标发送给外围的监控平台，如 SkyWalking 后端分析平台。在监控数据流经 Mixer 的时候，Istio 的元数据会被附加到这些指标中。另一种新的基于 Telemetry V2 观测体系是通过 Envoy 的 Proxy 直接将监控指标发送给分析平台，这种模式目前还处于快速的演进和开发中，但是它代表着未来的一种趋势。

![Service Mesh 场景下技术路线多变](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1590571728360-c04b6166-297f-4b22-93b7-b6b934ba93db.jpeg)

从架构图中我们可以看到，这里面的第一个挑战就是 Service Mesh 场景下，对于可观测性的技术体系的支持是非常多变的。

Istio 本身就包括两种不融合的体系，第一种是基于 Mixer 的场景，第二种是 Mixerless 场景。

Mixer 是基于访问日志进行指标生成的，也就是说服务与服务之间的访问日志经过 Mixer 增加相关的原数据后再发给外围分析系统。其特点是这个模式非常的成熟、稳定，但是性能会非常的低。它的低效源于两个方面，第一点是他的数据发送通道很长，中间节点过多。可以看到数据需要到从 Proxy 发送到 Mixer 节点，再发送给外围的 Adapter 节点。另一个效能低下的原因主要是体现在它发送的是原始访问日志，其数据量是非常大的，会消耗过多的带宽，这对整体的数据搜集与分析提出了非常大的挑战。

另一种模式是 Mixerless，它完全是基于 Metrics 指标的。通过可观测性包含的技术及其特点分析可知，它是一种消耗比较小的技术，对带宽以及分析后台都是非常友好的。但是它同时也有自己的问题，第一个问题就是他需要的技术门槛是比较高的（使用 WASM 插件来实现），并且对于 Proxy 端的性能消耗也是比较大的。同时由于是新的技术，稳定性较差，相关接口与规范并不完整。

![Service Mesh 场景下无 Tracing 数据](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1590571745555-ad923589-3537-4294-8b02-0bd482ef9768.jpeg)

第二个挑战就是无 Tracing 数据。SkyWalking 最早是为了收集处理跟踪数据（Tracing）而设计的一套系统，但是我们可以从右边的图发现，对于 Service Mesh 上报的数据其实是基于调用的，也就是说它不存在一条完整的跟踪链路。这样就对后台的分析模型有比较大的挑战，如何才能同时支持好这两种模式成为后端分析系统所要处理的棘手问题。

![维度匹配的问题](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1590571761011-f9ec4cda-f4a6-4f72-afb0-c2224a7383ed.jpeg)

第三个挑战就是维度匹配的问题。我们从前一章可以看到 SkyWalking 是包括三个维度的，其中对于实例和端点，在 Service Mesh 场景下都是有比较好的支持。这里多说一句，不仅仅是对 Mesh 场景，对于大部分场景都可以很好的去匹配它们。但是对于服务的匹配是有相当大难度的，因为 SkyWalking 只有服务这一层的概念，而在 Istio 中有好几个概念可以称之为“服务”。如何才能进行相关的维度匹配，特别是对于服务级别的维度匹配，成为了 Service Mesh 是如何与 SkyWalking 结合的另一个关键点。

## 应用方案及其演化

### 与 Istio 的集成

![技术路线全覆盖-Mixer](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1590571782642-4749067f-6ba7-4546-97c4-20e60ee52ef2.jpeg)

我们从 Istio 的架构图中可见，除了网络流量控制服务以外，Istio 同时提供了对 Telemetry 数据集成的功能。Telemetry 组件主要通过 Mixer 进行集成，而这恰恰就是 SkyWalking 首先与 Istio 集成的点。早期 Istio 可以进行进程内的集成，即将集成代码添加到其源码进行变异，以达到最高性能。后来 Istio 为了降低系统的集成复杂性，将该功能演变为进程外的适配器。目前 SkyWalking 就是采用这种进程外适配器进行集成的。

![技术路线全覆盖-Mixer](https://cdn.nlark.com/yuque/0/2020/png/1286189/1589893004201-bb22a49b-be43-4090-8368-6c6053e3149e.png)

安装模式有两种：

1. 如果从 Helm Chart 安装 SkyWalking，可以在 values.yml 文件中将如图的参数设置为 true。而后 Helm 会自动安装 SkyWalking 分析后台，并将它以进程外适配器的模式集成到 Istio 中。
1. 如果 SkyWalking 与 Istio 已经安装，可以使用右图中所示的 cr 文件来配置 Istio，使其将观测数据发送到 SkyWalking 中；

![技术路线全覆盖-Mixer](https://cdn.nlark.com/yuque/0/2020/png/1286189/1589893305420-5d168e1f-fd1a-4110-add7-d3d535b60e64.png)

安装完毕后，使用 BookInfo 示例程序进行测试。可以看到维度匹配为：

- 服务 Service：< ReplicaSet >.< Namespace >；
- 实例 Instance: kubernetes://< Pod >；
- 端点 Endpoint：http url；

可以发现 Service 包含了 Namespace。故在不同 Namespace 下，一定是两个不同的服务。

![技术路线全覆盖-Mixer](https://cdn.nlark.com/yuque/0/2020/png/1286189/1589893280616-f98f368f-c303-49b4-85ce-2fe4696ccf33.png)

拓扑图中除了示例中的服务和 Ingress 外，还包含有 istio-telemetry 组件。这反映了实际的数据流量，但有些用户会觉得这稍显冗余，而后的方案大家会看到此处略有不同。

![技术路线全覆盖-Envoy](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1590572043489-a2db0c04-53f9-4739-b1ea-9f2ed1cc23b4.jpeg)

除了进行 Mixer 的集成以外，SkyWalking 同时可以与 Envoy 的 access log service 进行相关的系统集成，以达到 Mixer 类似的效果。与 Envoy 集成的优势在于可以非常高效的将访问日志发送给 SkyWalking 的接收器，这样延迟最小。但缺点是目前的 access log service 发送数据非常多，会潜在影响 SkyWalking 的处理性能和网络带宽。同时所有的分析模块都依赖于较为底层的访问日志，一些 Istio 的相关特性不能被识别。比如这种模式下只能现实 Envoy 的元数据，Istio 的虚拟服务等概念无法有效的现实。

![技术路线全覆盖-Mixer](https://cdn.nlark.com/yuque/0/2020/png/1286189/1589894131155-9915d877-bddd-474d-91c8-d6317acbb958.png)

这种模式需要在安装 SkyWalking 与 Istio 时进行配置。首先在 SkyWalking 的 Helm 里将“envoy.als.enabled”设置为 true。而后安装 Istio 时，需要设置"values.global.proxy.envoyAccessLogService"为如图中的值。

![技术路线全覆盖-Envoy](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1590572016592-762997ad-3c9e-4875-985f-b67de30394d7.jpeg)

从拓扑图中看，与 Mixer 模式最明显的区别为没有 istio-telemetry 组件。这是由于该组件并没有 Envoy Sidecar 来路由流量，故也不会产生访问日志。也就是，此种模式完全反应了实际的工作负载情况。

![技术路线全覆盖-TelemetryV2](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1590572000265-46274b5d-f609-44ab-a25c-831d8a071c9e.jpeg)

除了上述两种模式，目前社区正在开发基于 Istio 最新的 TelemetryV2 协议的观测模型。此种模式是基于 Metrics 监控而不是基于访问日志。这种模式将对外暴露两种 Metrics：

- service level: 这种 Metrics 描述的是服务之间的关系指标，用来生成拓扑图和服务级别的指标；
- proxy level: 这种 Metrics 描述的 Proxy 进程的相关指标，用来生成实例级别的指标；

此种模式为标椎的 Mixerless，其优点是对分析平台友好，网络带宽消耗小。缺点为需要消耗 Envoy 的资源，特别是对内存消耗大。但是相信经过外来多轮优化，可以很好的解决这些问题。

但此种模式还有另外的缺点，即不能生成端点 Endpoint 的监控指标。如果用户希望能包含此种指标，还需要使用基于 ALS 访问日志的模式。

## Tracing 与 Metric 混合支持

![Tracing](https://cdn.nlark.com/yuque/0/2020/png/1286189/1589940330184-714de17e-2f1c-4102-8ffa-dc1877e1196e.png)

在 SkyWalking8.0 之前，如果开启 Service Mesh 模式，那么传统的 Tracing 模式是不能使用的。原因是他们共享了一个分析流水线。如果同时开启会造成计算指标重复的问题。

在 SkyWalking8.0 中，引入的 MeterSystem 可以避免此种问题的产生。而且计划将 Tracing 调整为可以配置是否生成监控指标，这样最终将会达到的效果是：指标面板与拓扑图的数据来源于 Envoy 的 Metrics，跟踪数据来源于 Tracing 分析，从而达到支持 Istio 的 Telemetry 在控制面中的所有功能。

![Tracing-协议支撑](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1590571955506-d7a9c65b-47bd-43df-8866-214dc02a0632.jpeg)

另外，Envoy 和 Istio 本身不支持 Skywalking 的远程 Tracing 协议。目前社区已经尝试进行 nginx 和 MOSN 等Mesh 环境中常用的 Proxy 的协议支持，后续也会尝试将 Skywalking 协议添加到 Envoy 中（使用 WASM 插件）。

## 维度匹配

![纬度匹配](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1590571930956-8a8749bb-375b-42cc-a8ea-d0b98228d49c.jpeg)

从安装过程可以发现，服务 Service 在 Mixer 和 ALS 中的规则为 ReplicaSet+Namespace 的形式。其很难反映 Istio 实际的维度情况。后续在 TelemetryV2 中将会获得真实的 Istio 服务间映射。同时也会尝试增加如下的命名规则以区分跨Cluster的情况：“Version|App|Namespace|Cluster”。

## 总结

本次分享简要的介绍了 Apache SkyWalking 在 Service Mesh 场景下的应用方案。主要是基于 Istio 做了详细的介绍，通过三种主要的挑战而引出的解决方案，将帮助大家更好的理解和使用 SkyWalking 的 Mesh 功能。希望大家有兴趣去尝试使用 SkyWalking 去观测 Istio。

以上就是此次分享的全部内容，感谢大家的关注与支持！

## 嘉宾介绍

高洪涛，FoundingEngineer 美国 Service Mesh 服务商 Tetrate 创始工程师。原华为软件开发云技术专家，对云原生产品有丰富的设计，研发与实施经验。对分布式数据库、容器调度、微服务、Servic Mesh 等技术有深入的了解。目前为 Apache ShardingSphere 和 Apache SkyWalking 核心贡献者，参与该开源项目在软件开发云的商业化进程。前当当网系统架构师，开源达人，曾参与 Elastic-Job 等知名开源项目。

## 回顾视频以及 PPT 下载地址

- 视频回顾：[https://www.bilibili.com/video/BV1qp4y197zU](https://www.bilibili.com/video/BV1qp4y197zU)
- PPT 下载：[https://github.com/servicemesher/meetup-slides/tree/master/2020/05/virtual](https://github.com/servicemesher/meetup-slides/tree/master/2020/05/virtual)
