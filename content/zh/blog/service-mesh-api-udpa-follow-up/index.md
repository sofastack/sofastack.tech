---
title: "Service Mesh 通用数据平面 API（UDPA）最新进展深度介绍"
author: "敖小剑"
authorlink: "https://skyao.io/"
description: "本文收集并整理了一下 UDPA 目前的情况和信息，给大家介绍一下 UDPA 目前最新的进展。"
categories: "Service Mesh"
tags: ["Service Mesh"]
date: 2020-03-25T18:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2020/png/226702/1585189900989-0ae555ff-5258-4cd3-b288-b8f9895a1e8c.png"
---

在2019年5月，CNCF 筹建通用数据平面 API 工作组（Universal Data Plane API Working Group / UDPA-WG)，以制定数据平面的标准 API。

当时我写了一个博客文章 “CNCF 正在筹建通用数据平面 API 工作组，以制定数据平面的标准 API” 对此进行了介绍。当时 UDPA 还处于非常早期的筹备阶段，信息非常的少。

现在9个月过去了，我最近收集并整理了一下 UDPA 目前的情况和信息，给大家介绍一下 UDPA 目前最新的进展（截止2020年2月24日）。

另外蚂蚁金服开源的云原生网络代理 MOSN 目前已经支持 xDS v2 API，后面也会逐步向着 UDPA 的方向去演进，兼容标准 Istio，感兴趣的读者可以去了解下。

MOSN：https://github.com/mosn/mon

## UDPA 介绍

首先快速介绍一下什么是 UDPA：

- UDPA ：“Universal Data Plane API”的缩写， “通用数据平面 API”
- UDPA-WG：”Universal Data Plane API Working Group”的缩写，这是 CNCF 下的一个工作组，负责制定 UDPA；

UDPA 的目标，援引自 https://github.com/cncf/udpa 的描述：

> 通用数据平面 API 工作组（UDPA-WG）的目标是召集对数据平面代理和负载均衡器的通用控制和配置 API 感兴趣的业界人士。

UDPA 的愿景，同样援引：

> 通用数据平面 API（UDPA）的愿景在 https://blog.envoyproxy.io/the-universal-data-plane-api-d15cec7a 中阐明。我们将寻求一组 API，它们为 L4/L7 数据平面配置提供事实上的标准，类似于 SDN 中 L2/L3/L4 的 OpenFlow 所扮演的角色。
> 这些 API 将在 proto3 中规范定义，并通过定义良好的、稳定 API 版本控制策略，从现有的 Envoy xDS API 逐步演进。API 将涵盖服务发现、负载均衡分配、路由发现、监听器配置、安全发现、负载报告、运行状况检查委托等。
> 我们将对 API 进行改进和成型，以支持客户端 lookaside 负载均衡（例如 gRPC-LB），Envoy 之外的数据平面代理，硬件 LB，移动客户端以及其他范围。我们将努力尽可能与供应商和实现无关，同时坚持支持已投入生产的 UDPA 的项目（到目前为止，Envoy 和 gRPC-LB）。

对 UDPA 感兴趣的同学，可以通过以下两个途径进一步深入了解：

- UDPA @ GitHub：UDPA 在 github 上的项目，UDPA API 定义的代码都在这里；
- Universal Data Plane API Working Group (UDPA-WG)：CNCF 的 UDPA 工作组，可以通过加入工作组的方式了解更多信息；

## UDPA 和 xDS 的关系

在展开 UDPA 的细节之前，有必要先解释清楚 UDPA 和 xDS 的关系，因为这对理解 UDPA 会有很大帮助。

在2019年11月的 EnvoyCon 上，Envoy 的开发者，也是目前 UDPA 最主要的负责人之一，来自 Google 的 Harvey Tuch，有一个演讲非常详细而清晰的解答了这个问题，这个演讲的标题是：“The Universal Dataplane API (UDPA): Envoy’s Next Generation APIs”。

> 备注：这里我直接援引这份演讲的部分内容，以下两张图片均出自 [这份演讲的PPT](https://static.sched.com/hosted_files/envoycon2019/ac/EnvoyCon UDPA 2019.pdf) 。鸣谢 Harvey。

下图展示了近年来 xDS 协议的演进历程和未来规划：

![xDS 协议的演进历程和未来规划](https://cdn.nlark.com/yuque/0/2020/png/226702/1585043233344-55789002-04f3-454c-a5aa-9d493f3469b3.png)

- 2017年，xDS v2 引入 proto3 和 gRPC，同年 Istio 项目启动；
- 2018和2019年，xDS v2 API 继续发展，陆续引入了新的 API 定义，如 HDS / LRS / SDS 等，尤其是为了改进 Pilot 下发性能，开始引入增量推送机制；
- xDS v3 API 原计划于2019年年底推出，但目前看技术推迟，目前 v3 还是 alpha1 状态，预计在即将发布的 Istio 1.5 中会有更多的 v3 API 引入。同时 v3 API 也引入了 UDPA 的部分内容，但是由于 UDPA 目前进展缓慢，对 xDS 的影响并不大，主要还是 xDS 自身的发展，比如对 API 和技术债务的清理；
- 但在2020年，预计 UDPA 会有很大的进展，尤其是下面我们将会展开的 UDPA-TP 和 UDPA-DM 的设计开始正式制定为 API 之后。而 xDS v4 预计将基于 UDPA ，因此 xDS v4 可能会迎来比较大的变动；

简单总结说：**xDS 将逐渐向 UDPA 靠拢，未来将基于 UDPA** 。

下图则展示了 Envoy 在 xDS 版本支持上的时间线：

![1.png](https://cdn.nlark.com/yuque/0/2020/png/226702/1585042334938-ec15ee71-9b52-4743-a6cf-3c0df57c81ae.png#align=left&display=inline&height=544&name=1.png&originHeight=544&originWidth=1080&size=244006&status=done&style=none&width=1080)

目前看这个计划在执行时稍微有一点点延误，原计划于2019年年底推出的 v3 的 stable 版本实际上是在1月中定稿的。（备注：具体可参考 Envoy PR api: freeze v3 API ）。然后目前正在广泛使用的 v2 API 将被标记为 depreated。而且在2020年底，v3 API 预计被 v4 API 取代（注意 v4 API 将会是基于 UDPA），而目前我们最熟悉的 v2 API 将计划在2020年底移除，不再支持！

上图也展示了未来 xDS 协议的大版本演进和更替的方式，总的来说规律是这样：

1. 一年一个大版本：2019 v2 -> 2020 v3 -> 2021 v4 ->2022 v5；
1. 每个大版本都要经历 alpha -> stable -> deprecated -> removed 四个阶段，每个阶段历时一年；
1. 稳定后 Envoy 会同时存在三个 API 大版本：正在使用的稳定版本，已经弃用的上一个稳定版本，准备开发的新的下一个大版本（但只会是Alpha）；
1. 发布一个新的 stable 的大版本，就一定会 deprecated 上一个稳定的大版本，同时 remove 更前一个已经 deprecated 的大版本；

所谓 “长江后浪推前浪，前浪死在沙滩上”，又或者说，“江山代有新版出，各领风骚12个月”。

> 备注：Envoy 具体的稳定 API 版本控制策略，可以参见 Envoy 的设计文档 “Stable Envoy API versioning” ，不过这个文档长的有点过分，嫌长的同学可以直接看这个文档的缩减版本 API versioning guidelines。

## UDPA API 进展

言归正传，我们来看一下 UDPA 目前的最新进展。从 https://github.com/cncf/udpa ，可以看到目前 UDPA 中已经定义好的部分 API 内容：

### 类型定义

目前只定义了一个类型 TypedStruct。

TypedStruct 包含任意 JSON 序列化后的 protocol buffer 消息以及一个描述序列化消息类型的URL。这与 google.protobuf.Any 非常相似，它使用 google.protobuf.Struct 作为值，而不是使用 protocol buffer 二进制。

```
message TypedStruct {
  // 用于唯一标识序列化 protocol buffer 消息的类型的URL
  // 这与 google.protobuf.Any 中描述的语义和格式相同：
  // https://github.com/protocolbuffers/protobuf/blob/master/src/google/protobuf/any.proto
  string type_url = 1;
  // 上述指定类型的JSON表示形式。
  google.protobuf.Struct value = 2;
}
```

TypedStruct 定义的背景是：如何在 protocol buffer 的静态类型报文中嵌入一个不透明的配置。这是一个普遍需求，涉及 google.protobuf.Any 和 google.protobuf.Struct 的差别和权衡使用。具体内容请见我之前翻译的博客文章 “[译] 动态可扩展性和Protocol Buffer”，对此做了非常好的介绍和分析讨论。

TypedStruct 可以说是到目前为止对此需求的最佳实践，算是为这一话题正式画上了句号。

### 数据定义

数据定义也只定义了一个数据 OrcaLoadReport。

其中 ORCA 是 Open Request Cost Aggregation 的缩写，OrcaLoadReport 用于提交请求开销汇总的负载报告。

ORCA 的简短介绍：

> 如今，在 Envoy 中，可以通过考虑后端负载（例如 CPU）的本地或全局知识来做出简单的负载均衡决策。更复杂的负载均衡决策可能需要借助特定于应用的知识，例如队列深度，或组合多个指标。
> 这对于可能在多个维度上受到资源限制的服务（例如，CPU 和内存都可能成为瓶颈，取决于所应用的负载和执行环境，无法确定是哪个先触及瓶颈）以及这些维度不在预定类别中的位置时很有用（例如，资源可能是“池中的可用线程数”，磁盘 IOPS 等）。

有关 Orca 的更详细的信息，请见设计文档 Open Request Cost Aggregation (ORCA) 。

目前 Envoy 正在实现对 ORCA 的支持，然后这个特性被作为 UPDA 标准的一部分直接在 UDPA API 中定义。
以下为 OrcaLoadReport 定义，可以看到包含有 CPU/内存的利用率和 RPS 信息：

```
message OrcaLoadReport {
  // CPU利用率表示为可用CPU资源的一部分。 应该来自最新的样本或测量。
  double cpu_utilization = 1 [(validate.rules).double.gte = 0, (validate.rules).double.lte = 1];
  // 内存利用率表示为可用内存资源的一部分。 应该来自最新的样本或测量。
  double mem_utilization = 2 [(validate.rules).double.gte = 0, (validate.rules).double.lte = 1];
  // 端点已服务的总RPS。 应该涵盖端点负责的所有服务。
  uint64 rps = 3;
  ...
}
```

### 服务定义

服务定义依然也只定义了一个服务 OpenRcaService。

OpenRcaService 是一个带外（Out-of-band/OOB）负载报告服务，它不在请求路径上。OpenRcaService 定期以足够的频率对报告进行采样，以提供与请求的关联。OOB 报告弥补了带内（in-band）报告的局限性。

```
service OpenRcaService {
  rpc StreamCoreMetrics(OrcaLoadReportRequest) returns (stream udpa.data.orca.v1.OrcaLoadReport);
}
```

### 注解定义

UDPA 目前定义了四个注解（Annotation）：

- MigrateAnnotation：用于标记在前后版本中的和迁移相关的 API 变更，包括 rename / oneof_promotion / move_to_package 等多种语义；
- SensitiveAnnotation：将某个字段标记为“敏感”字段，例如个人身份信息，密码或私钥；
- StatusAnnotation：标记状态，比如将某个文件标记为“work_in_progress/进行中”；
- VersioningAnnotation：用于记录版本信息，比如通过 previous_message_type 表示当前 message 在上一个版本中的类型；

还有一个 ProtodocAnnotation 在提出设计后，存在分歧，暂时还没有正式加入 UDPA。这个注解的目的是标记当前尚未实现的 UDPA 消息；

### UDPA API 总

从上面列出的 UDPA API 列表可以看到，目前 UDPA 中正式推出的 API 内容非常的少，也就：

- 一个 TypedStruct 类型定义；
- 一个 OpenRcaService 服务定义和配套的 OracLoadReport 数据定义；
- 4个注解；

考虑到 UDPA 推出的时间是 2019年5月份，迄今有9个月的时间，这个进展有些出乎意料。 

翻了一遍 https://github.com/cncf/udpa 上的内容，包括所有的 commit 和 PR ，发现活跃的开发者主要是两位同学：Google 的 htuch 和 Tetrate公司的 Lizan。然后 cncf/UDPA 项目的 star 数量也非常低，才 55 个 star，可以认为社区基本上没什么人关注。

但是，稍后当我看到 UDPA 的设计文档时，才发现原来 UDPA 的精华都在设计中，只是进度原因还未能正式出成型的 API。

## UDPA 设计

我们来重点看一下 UDPA 的设计，主要的设计文档有两份：

- UDPA-TP strawman: UDPA 设计之传输协议(TransPort)，是用于 UDPA 的下一代传输协议；
- UDPA-DM: L7 routing strawman: UDPA 设计之数据模型(Data Model)，是对通过 UDPA-TP 传输的资源定义；

UDPA 对此的解释是：

> Envoy v2 xDS API 当前正在转向通用数据平面 API（Universal Dataplane API/UDPA）。重点是传输协议与数据模型的关注点分离。

关于传输协议与数据模型的关注点分离，一个典型的例子是“集装箱运输机制”（类比 UDPA-TP ）和 “集装箱中标准规格”（类比 UDPA-DM）。在 UDPA 的设计中，数据模型的定义和传输协议的实现是分离的，这意味着只要设计不同的数据模型，就可以重用一套统一的传输协议。因此，UDPA 的可扩展性就变得非常强大。

对此，我个人有些惊喜，因为去年年底我和彦林同学在商讨通过 MCP/xDS/UDPA 协议融合注册中心和控制平面时，就发现这三者的工作机制非常类似。考虑到后续可能会有各种不同的资源需要定义并在这个工作机制上做资源同步和分发，当时有过类似的想法，希望能把底层这套资源同步机制标准化，以便重用：

![MCP/xDS/UDPA 关系和标准化](https://cdn.nlark.com/yuque/0/2020/png/226702/1585042601995-356febd3-61c0-476b-a9e2-ba534690be7c.png)

目前看来，UDPA-TP 已经在朝这个目标迈出了坚实的步伐。当然如果能再往前迈进一步就更好了：这个底层资源同步的工作机制，没有必要限制在 UDPA 的范畴，完全可以变成一个用途更加广泛的通用机制。

下面来详细看一下 UDPA-TP 和 UDPA-DM 的设计，以下内容来自 UDPA 的两份设计文档以及个人的解读。

### UDPA-TP 设计

UDPA-TP 的设计文档，在开始部分列出了 UDPA-TP 的关键设计动机，具体包括：

- 在保留 Core v2 xDS 中存在的概念性 pub-sub 模型的同时，还支持高级功能，例如 LRS/HDS；
- 支持 Envoy Mobile 和其他 DPLB 客户端的大规模扩展；
- 简单的客户端和简单的管理服务器实现；
- 使增量更新资源高效而简单（备注：增量更新是目前 Istio/Envoy 正在努力实现的重点特性）；
- 支持资源联邦（备注：和我之前构想的通过 MCP 协议聚合多个注册中心/配置中心的思路一致，当现实中存在多个资源的来源时，就必须提供机制来聚合这些资源并提供一个全局的视图）；
- 使 API 资源的子资源变得简单且实现成本低，并且使其可以增量更新和可联合；
- 维护对一致性模型的支持；
- 消除 v2 xDS 奇怪之处；
- ACK/NACK 与订阅消息的合并。在 v2 xDS 中，DiscoveryRequest 既是订阅请求，又是对先前消息的潜在确认。这导致了一些复杂的实现和调试体验（备注：这会造成 UDPA 交互模式和 xDS 的不同）；
- CDS/LDS 是与 EDS/RDS 不同的 API 层。在 v2 xDS 中，EDS/RDS 是准增量的，而 CDS/LDS 是最新状态；
- 从概念上讲，在 Envoy v2 xDS API 基础上小范围变更。我们不希望对 UDPA 管理服务器实现者造成重大的概念和实现开销（备注：个人理解，这应该是目前 UDPA 没有大张旗鼓的制定各种 API 的原因，UDPA 和 xDS，包括和 xDS 的实际实现者 Envoy 的关系过于紧密，因此需要考虑从 xDS 到 UDPA 的过渡，不能简单的推出一套全新的 API）；

以下是 UDPA 的术语，对于后面理解 UDPA 非常有帮助：

- DPLB：data plane load balancer 的缩写。涵盖诸如代理（例如 Envoy）或客户端 RPC 库（例如 gRPC 和 Envoy Mobile）的用例。DPLB 是 UDPA 客户端。他们负责启动到管理服务器的 UDPA 流（备注：注意，DPLB 不仅仅包含以 Envoy 为代表的 service mesh sidecar，也包括了以 SDK 形式存在的类库如 gRPC，而  gRPC 目前已经在实现对 xDS 接口的支持）；
- Management server/管理服务器：能够提供 UDPA 服务的实体，管理服务器可以仅是 UDPA 服务器，也可以是 UDPA 客户端和服务器（在联邦的情况下）；
- UDPA：通用数据平面 API，其中包括数据模型（UDPA-DM）和传输协议（UDPA-TP）；
- UDPA-TP：UDPA API 的基准传输协议；
- UDPA-DM：UDPA API 的数据模型；
- UaaS：UDPA-as-a-service，云托管的 UDPA 管理服务（备注：Google 在 GCP 上提供的 Google Traffic Director 和 AWS 提供的 App Mesh，可以视为就是 UaaS 雏形）；

然后是和联邦相关的术语：

- Federation/联邦：多个 UDPA 管理服务器的互操作以生成 UDPA 配置资源；
- Direct federation/直接联邦：当 DPLB 直接连接到多个 UDPA 管理服务器并能够从这些流中合成其配置资源时；
- Indirect federation/间接联邦：当 DPLB 一次最多连接一个 UDPA 管理服务器（对于某些给定的资源类型），并且 UDPA 管理服务器执行所有与联邦有关的工作时；
- Advanced DPLB/高级 DPLB：支持直接联邦的 DPLB（需要 UDPA-Fed-TP）；
- Simple DPLB/简单 DPLB：不支持直接联邦的 DPLB，即仅基线 UDPA-TP；
- UDPA-Fed-DM：UDPA-DM 的超集，具有用于联邦的其他资源类型；
- UDPA-Fed-TP：支持联邦的 UDPA-TP 的超集；

下图可以帮助理解这些术语：

![UDPA 术语](https://cdn.nlark.com/yuque/0/2020/png/226702/1585042586265-d74cfbcc-dd1c-40b3-bac6-5d460ba9e188.png)

(备注：图中可能有误，simple UDPA management server 和 Advanced UDPA management server 之间应该是 “UDPA-TP”, 而不应该是 “UDPA-Fed-TP”。)

UDPA-TP 传输协议提供了在管理服务器和 DPLB 客户端之间传输命名和版本化资源的方法，我们称这些实体为 UDPA-TP 端点。UDPA-TP 端点可以是客户端和管理服务器，也可以是两个管理服务器（例如，在联邦配置时）。上图说明了使用 UDPA 在 UDPA-TP 端点之间传送资源的各种方式。

其中，UDPA管理服务器分为两种：

- 简单(simple)：实际上只是对不透明资源的缓存（几乎不了解 UDPA-DM），主要功能是从上游高级 UDPA 管理服务器获取资源，并分发资源给 DPLB，自身不产生资源；
- 高级(advanced)：对 UDPA-DM 有感知，通常是用来获取信息并转换为标准化的资源（典型如 Istio 中的 Pilot）。可以直接分发资源给到 DPLB，也可以发送资源给简单 UDPA 管理服务器，然后由简单 UDPA 管理服务器再分发给 DPLB；

而对应的 DPLB 客户端也分为两种：

- 简单(simple)：对于任何配置源，简单的 DPLB 在任何时间点最多只能与一台管理服务器进行对话；
- 高级(advanced)：将实现对 UDPA-Fed-TP 的支持，并能够直接作为联邦端点参与；

简单 DPLB 虽然只能连接一台管理服务器，但是也是可以实现联邦的：简单 DPLB 连接的管理服务器可以实现联邦，然后为 DPLB 实现了间接联邦（备注：上图中的简单 DPLB 就是例子，两个 Advanced UDPA management server 之间做了联邦）。

### UDPA-TP 设计解读

在解读 UDPA-TP 的设计之前，我们回顾一下 Istio 经典的组件和架构图，下面分别是 Istio 1.0 和 Istio 1.1 的架构图：

![Istio 1.0 和 Istio 1.1 的架构图](https://cdn.nlark.com/yuque/0/2020/png/226702/1585042693738-c8a4f54d-10b4-4bc8-b97f-5f467e24506d.png)

考虑到 Mixer 和 Citadel 两个组件和 UDPA 的关系相比没那么大， 我们重点看 Proxy / Pilot / Galley：

- Proxy在 Istio 中就是 Envoy（我们的 MOSN 正在努力成为候选方案），直接对等 UDPA 中的 DPLB 的概念。但是 Istio 中的 Proxy，功能上只和上图中的 Simple DPLB 对齐。相比之下，UDPA-TP 设计中增加了一个能够连接多个 UDPA management server 进行联邦的 Advanced DPLB；
- Pilot 和 Galley，从和 DPLB 的连接关系看，分别对应着 UDPA-TP 设计中的 Simple UDPA management server 和 Advanced UDPA management server。但从实际实现的功能看，目前 Pilot 的职责远远超过了  Simple UDPA management server 的设计，而 Galley 的功能则远远少于 Advanced UDPA management server。如果未来 Istio 的架构和组件要向 UDPA 的设计靠拢，则显然 Pilot 和 Galley 的职责要发生巨大调整；
- 最大的差异还是在于 UDPA-TP 中引入了联邦的概念，而且同时支持在 DPLB 和 Advanced UDPA management server 上做联邦。尤其是 DPLB 要实现联邦功能，则必然会让 DPLB 的功能大为增加，相应的 DPLB 和 UDPA management server 的通讯协议 （目前是 xDS）也将为联邦的实现增加大量内容；

对照 UDPA-TP 的设计：

![对照 UDPA-TP 的设计](https://cdn.nlark.com/yuque/0/2020/png/226702/1585042729260-97b74bb3-4af7-46d7-8255-195c5507cc92.png)

UDPA-TP 的设计目前应该还没有对应具体的实现产品，而且我也还没有找到 UDPA-Fed-TP 详细的 API 设计。资料来源太少，所以只能简单的做一些个人的初步解读：

- 首先，Simple UDPA management server 的引入是一大亮点，功能足够简单而且专注，聚焦在将数据（在 UDPA 中体现为资源）分发给 DPLB （如大家熟悉的数据平面）。毫无疑问，Simple UDPA management server 的重点必然会在诸如容量 / 性能 / 下发效率 / 稳定性等关键性能指标，弥补目前 Istio 设计中 Pilot 下发性能赢弱的短板。从这个角度说，我倾向于将 Simple UDPA management server 理解为一个新的组件，介于 DPLB 和 Pilot 之间。
  小结：**解决容量和性能问题**。

- 其次，Advanced UDPA management server 引入了联邦的概念， 上面的图片显示是为了在两个不同的云供应商（Cloud Provider X 和 Cloud Provider Y）和本地（On-premise）之间进行联邦，这是典型的混合云的场景。而我的理解是，联邦不仅仅用于多云，也可以用于多数据来源，比如打通多个不同的注册中心，解决异构互通问题。
  小结：**解决多数据来源的全局聚合问题**。

- 然后，比较费解的是引入了 Advanced DPLB 的概念，而且从图上看，使用场景还非常复杂：1. 第一个 DPLB 是间接联邦的典型场景，还比较简单 2. 第二个 DPLB 除了以同样的方式做了间接联邦，还直接通过 UDPA-Fed-TP 协议和 On-Premise 的 Advanced UDPA management server 连接，实现了直接联邦 3. 第三个 DPLB 则更复杂，做了三个 management server 的联邦 。
  小结：**复杂的场景必然带来复杂的机制，背后推动力待查。**

对于 UDPA-TP 的设计，我个人有些不太理解，主要是对于联邦的使用场景上，我的疑虑在于：真的有这么复杂的场景吗？尤其是将联邦的功能引入到 DPLB，这必然会使得 xDS/UDPA 协议不得不为此提供联邦 API 支持，而 Envoy/MOSN 等的实现难度也要大为提升。因此，除非有特别强烈的需求和场景推动，否则最好能在复杂度和功能性之间做好平衡。

我个人更倾向于类似下面的设计：

![UDPA-TP 个人倾向设计](https://cdn.nlark.com/yuque/0/2020/png/226702/1585056667351-1634af3e-6c7a-4e08-8636-958bdcbf8469.png)

- 维持 DPLB 和 Simple UDPA management server 的简单性；
- DPLB 只对接 Simple UDPA management server，协议固定为 UDPA-TP，联邦对 DPLB 透明（只实现间接联邦）；
- Simple UDPA management server 重点在于容量和性能的提升，包括目前正在进行中的支持各种资源的增量更新；
- Advanced UDPA management server 负责完成联邦，包括和其他环境的 Advanced UDPA management server 做联邦，以及从本地的其他注册中心聚合数据；

总之，我个人更倾向于让 DPLB 和 Simple UDPA management server 保持简单和高性能，而将复杂功能交给 Advanced UDPA management server 。后续我会重点关注 UDPA 在联邦功能的实现，如有新进展尽量及时撰文分享。

### UDPA 的资源定义和设计

在 UDPA-TP 的设计中，根据资源的来源，资源被划分为两类类型：

- Configuration Resources/配置资源：控制平面生成，由管理服务器分发到 DPLB。平常大家熟悉的，通过 xDS 协议传输的 Listener / Route / Cluster / Endpoint 等资源就属于这种类型；
- Client Resources/客户资源：DPLB 生成，准备交给控制平面使用。前面 UDPA 中定义的 OracLoadReport  就是典型例子，这是最近才有的新特性，由 DPLB 收集统计信息和状态，汇报给到控制平面，以便控制平面在决策时可以有多完善的参考信息；

资源在定义时，将有三个重要属性：

- 名称/Name：对于给定类型是唯一的，而且资源名称是结构化的，其路径层次结构如下：/ ，例如 com.acme.foo/service-a 。注意 namespace 的引入，是后面的资源联邦和所有权委派的基础；
- 类型/Type：资源类型由 Type URL 提供的字符串来表示；
- 版本/Version：对于给定的命名资源，它可能在不同的时间点具有不同的版本。在资源定义中带上版本之后，检测资源是否有更新就非常方便了；

以下是资源定义的实例（只是示意，暂时还没正式成为 UDPA API 的内容）：

```
message Resource {
  // 资源的名称，以区别于其他同类型的资源。
  // 遵循反向DNS格式，例如 com.acme.foo/listener-a
  string name = 1;
  // 资源级别版本
  string version = 2;
  // 资源有效负载。
  // 通过 Any 的 type URL 指定资源类型
  google.protobuf.Any resource = 3;
  // 资源的TTL。
  // 此时间段后，资源将在DPLB上失效。
  // 当管理服务器的连接丢失时，将支持资源的优雅降级，例如端点分配。
  // 使用新的TTL接收到相同的资源 name/version/type 将不会导致除了刷新TTL之外的任何状态更改。
  // 按需资源可能被允许过期，并且可能在TTL过期时被重新获取。
  // TTL刷新消息中的resource字段可能为空，name/version/type用于标识要刷新的资源。
  google.protobuf.Duration ttl = 4;
  // 资源的出处（所有权，来源和完整性）。
  Provenance origin_info = 5;
}
```

UDPA-TP 设计中的其他内容，如安全 / 错误处理 / 传输 / 用户故事 等，就不一一展开了，这些设计目前看离正式成为 API 还有点远。如有兴趣可以直接翻阅 UDPA-TP 的设计文档。

### UDPA-DM 设计

UDPA 设计的一个核心内容就是将传输（TransPort）与数据模型（Date Model）的关注点分离，前面介绍了  UDPA-TP 的设计，可以说目前还在进行中，并未完全定型。

而 UDPA-DM 的设计，感觉进度上比 UDPA-TP 还要更早期，这多少有点出乎意料：原以为 UDPA 会基于 xDS 现有的成熟 API 定义，快速推出一套覆盖常见通用功能的 API ，甚至直接把 xDS 中的部分内容清理干净之后搬过来。但事实是：目前 UDPA-DM 中已经定义的 API 内容非常少，仅有 L7 Routing ，而且还在设计中，其他大家熟悉的 Listener / Cluster / Endpoint / Security / RatingLimit 等API都还没有看到。

而 UDPA-DM 的设计和实现方式，也因为资料较少而有些不够明朗。在 UDPA-DM 的设计文档的开头，有如下一段描述：

> As a starting point, we recognize that the UDPA-DM is not required to be as expressive as any given DPLB client’s full set of capabilities, instead it should be possible to translate from UDPA-DM to various DPLB native configuration formats. We envisage UDPA-DM as a lingua franca that captures a large amount of useful functionality that a DPLB may provide, making it possible to build common control planes and ecosystems around UDPA capable DPLBs.
> 首先，我们认识到 UDPA-DM 不需要像任何已有的 DPLB 客户端那样，全部能力都具备表现力，而是应该可以从 UDPA-DM 转换为各种 DPLB 原生配置格式。我们将 UDPA-DM 设想为一种通用语言，它具备大量 DPLB 应该提供的有用的功能，从而有可能在支持 UDPA 的 DPLB 周围构建通用的控制平面和生态系统。
> The UDPA-DM will be a living standard. We anticipate that it will initially cover some obvious common capabilities shared by DPLBs, while leaving other behaviors to proxy specific API fields. Over time, we expect that the UDPA-DM will evolves via a stable API versioning policy to accommodate functionalities as we negotiate a common representation.
> UDPA-DM 将成为事实标准。我们期望它最初将涵盖 DPLB 共有的一些显而易见的通用功能，同时将其他行为留给代理特定的API字段。随着时间的推移，我们期望 UDPA-DM 将通过稳定的API版本控制策略来发展，以容纳各种功能，而我们将协商通用的表示形式。

对这两段文字描述的理解，我是有一些困惑的，主要在清楚解 UDPA-DM 的定义和具体的 DPLB 原生实现（典型如 Envoy 的 xDS）之间的关系。下面这张图是我画的：

![具体的 DPLB 原生实现](https://cdn.nlark.com/yuque/0/2020/png/226702/1585042829023-8ddfb500-bf83-41ad-bb23-1b77bce060c2.png)

- 左边的图是转换方案：按照第一段文字的描述，UDPA-DM 是做通用定义，然后转换（Translate）为各种 DPLB 的原生配置格式。这意味着 UDPA-DM API 和实际的 DPLB 原生配置格式可能会有非常大的不同，甚至有可能是完全不一样的格式定义。这个关系有点类似 Istio API 和 xDS API 的关系，也类似于 SMI （微软推出的 Service Mesh Interface）和 xDS 的关系；
- 右边的图是子集方案：按照第二段文字的描述，UDPA-DM 是做通用定义，但是不会做转换，其他 DPLB 会直接复用这些 UDPA-DM 的 API 定义，然后补充自身特有的 API 定义。这样 UDPA-DM 会以通用子集的形式出现，逐渐扩大范围，然后其他 API 会逐渐将自身的 API 中和 UDPA-DM 重叠的部分替换为 UDPA-DM API，只保留自身特有的扩展 API；

前面谈到 xDS 的演进路线， v3 / v4 会逐渐向 UDPA 靠拢，尤其 v4 会基于 UDPA 来。目前由于 UDPA API 远未成型，而 xDS v3 中对 UDPA API 的使用非常少（基本只用到了 annotation 定义），因此目前到底是哪个方案尚不明朗。

以下是 UDPA-DM 设计文档中描述的 UDPA-DM 的关键设计：

- 描述 L7 路由层，该层描述主要 L7 DPLB 之间的常见行为，包括 Envoy，HAproxy，Nginx，Google Cloud Platform URL mapping 和 Linkerd；
- 为代理 /LB 的特有扩展提供灵活性，用于不适合通用抽象的行为。即逃生舱口（escape hatch）（备注：类似 SQL 方言）；
- 提供 L7 路由表的可伸缩性和有效的对数评估（logarithmic evaluation）。例如，Envoy v2 xDS 是严格线性评估的路由表，具有明显的扩展限制。对于可以支持 UDPA-TP 这个特性的 DPLB，应该可以按需获取路由表段；
- 在 v2 Envoy xDS API 中支持线性匹配路由表的旧有用户；
- 删除多 xDS 样式 API 的需求，例如 RDS，VHDS 和 SRDS；
- 资源的可组合性；应该有可能支持 UDPA 联邦用例，带有诸如虚拟主机这种被独立管理的资源等；

下面重点看 L7 Routing 的设计。

### Routing API 设计

Routing API 中有三个术语：

- 服务/Service：描述后端服务的不透明字符串（或在 Envoy 的术语中，为集群/Cluster）。当前文档未提供有关服务表示的任何进一步详细说明，这留待以后的工作；
- 路由表/Route table：一组匹配条件，用于 HTTP 请求和相关操作。操作可以包括重定向或转发到特定服务；
- L7 路由/L7 routing：根据路由表评估给定的 HTTP 请求；

在 UDPA-DM 的 Routing API 设计中，针对请求匹配的方式，相比 xDS 做了重大的改动，主要体现在除了线性匹配之外，还支持分层匹配。

这里先解释一下线性匹配和分层匹配这两种路由时需要用到的请求匹配方式：

- 线性（Linear）：其中路由表类似于[([Match], Action)] 类型。在此模型中，路由表是匹配 criteria-action 条件的有序列表。每个匹配的 criteria 是匹配 criteria 的逻辑”与”，例如：
  - If :authority == foo.com AND path == / AND x-foo == bar THEN route to X
  - If :authority == bar.com AND x-baz == wh00t THEN route to Y
- 分层(Hierarchical)：其中路由表类似于树结构，每个节点具有(MatchCriteria, [(Value, Action)]) 类型。通过这种结构，任何给定的节点都会只评估单个匹配条件，例如:authority 的值。分层匹配能提供相对高效的实现。

目前 xDS v2 API 使用的是线性匹配方式，而 UDPA-DM 的 Routing API 会引入分层匹配，形成线性-分层的混合匹配方式，如下图所示：

![UDPA-DM Routing API 分层匹配](https://cdn.nlark.com/yuque/0/2020/png/226702/1585042889588-8bf59a22-4209-4db2-bc3b-5d5dd282d41b.png)

设计文档对这个混合匹配模型有如下说明：

> The model does not map directly to any given DPLB today but borrows from some Envoy concepts and should have an efficient realization. It may be possible to use HAproxy ACLs to model this topology.
> 目前该模型并没有直接映射到任何给定的 DPLB，而是借鉴了 Envoy 的一些概念，这个模型应该会有一个有效的实现。可能会使用 HAproxy ACL 对这种拓扑进行建模。

由于目前 Routing API 并没有完成设计，也没有正式成为 UDPA 的 API，而在最新刚定稿的 xDS v3 协议中，RoutesDiscoveryService 和 ScopedRoutesDiscoveryService 也都没有引入这个新的模型，因此预期这个模型将在2020年继续完成设计和定稿，可能在年底的 xDS v4 中会有所体现。然后，UDPA-DM 和 xDS 之间到底会是转换模型，还是子集模型，届时就清楚了。

由于 Routing API 尚未设计完成，所以这里不详细展开 Routing API 的定义了。Routing API 的相关资料如下，有兴趣的同学可以关注（然而已经很长时间没有新的进展了）：

- Issue 讨论 [WiP] L7 routing straw man；
- 在 PR 中提交的 Routing API 定义文件 udpa/config/v1alpha/routing.proto：可以自行和 xDS v3 的 API 做一个比较；

## 总结

UDPA 目前还处于早期设计阶段，关键的 UDPA-TP 和 UDPA-DM 的设计有推出草稿但是远未完成，内容也和我们期望的一个完整的通用数据平面 API 有很长的距离。而且项目进展并不理想，感觉重视程度和人力投入都有限。

## 附言

最近因为想了解一下 UDPA 的进展，所以做了 UDPA 的调研和学习，比较遗憾的是 UDPA 的资料非常匮乏，除了我本文列出来的几个官方网站和设计文档之外，基本就只有 Harvey 的演讲。

调研完成之后发现 UDPA 的进展不如人意，尤其是最近的工作几乎停滞，关键的 UDPA-TP 和 UDPA-DM 的设计未能完稿，xDS v3 中也只引用了极少的 UDPA API 定义。这篇总结文章差点因此难产，因为未知/待定/未完成的内容太多，而且由于缺乏资料输入，很多信息也只是我个人的理解和想法，按说这不是一个严谨的深度介绍文章应有的态度。

但考虑到目前 UDPA 的资料实在是太少，本着“有比没有好”的想法，我硬着头皮完成了这篇文章。后续如果有新的输入，我会及时完善或者修订本文，也欢迎对 UDPA 有兴趣和了解的同学联系我讨论和指导。

## 参考资料

- https://github.com/cncf/udpa ：UDPA 在 github 的项目，API 定义来自这里
- Universal Data Plane API Working Group (UDPA-WG): UDPA 设计文档，但是内容很少
- Universal Data Plane API Working Group (UDPA-WG)：CNCF 下的 UDPA 工作组，加入之后能看到一些资料
- UDPA-TP strawman: UDPA-TP 的设计文档
- UDPA-DM: L7 routing strawman: UDPA-DM 的设计文档
- Stable Envoy API versioning ：Envoy 官方文档，讲述 Envoy 的稳定API版本控制策略
- CNCF 正在筹建通用数据平面 API 工作组，以制定数据平面的标准 API：我去年写的 UDPA 介绍文章
- The Universal Dataplane API (UDPA): Envoy’s Next Generation APIs：Harvey Tuch 的演讲，帮助理解 xDS 和 UDPA 的关系
