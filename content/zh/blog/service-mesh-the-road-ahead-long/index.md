---
title: "再启程，Service Mesh 前路虽长，尤可期许"
author: "涵畅"
authorlink: "https://github.com/Xhhoho"
description: "本文将结合蚂蚁金服内部实际场景以及思考，讲述继 2019 双十一之后，蚂蚁金服在 Service Mesh 路上的规划和持续演进。"
categories: "Service Mesh"
tags: ["Service Mesh","源创会"]
date: 2020-06-16T17:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2020/png/226702/1592300030127-902436b0-f735-4caa-9514-ed66a3e83f0f.png"
---

## 前言

![Service Mesh 漫画](https://cdn.nlark.com/yuque/0/2020/png/226702/1592200446427-37e9f3dc-47d4-49db-af9c-32620b3e49cd.png)

几乎所有人都在说 Service Mesh；貌似没人知道怎么落地 Service Mesh；但是大家都觉得其他人在大力做 Service Mesh；所以大家都宣称自己在做 Service Mesh。

上面只是开一个玩笑，但是从某种程度反映了一些实际情况：Service Mesh 是一种设计思想和理念，而不是具体的架构或者实现方式，虽然 Istio+Envoy 的配置似乎已经成了事实标准，当我们环顾四周，却发现理想太丰满，现实太骨感，因为各企业当前切实原因，导致各种形态的 Service Mesh 百花齐放。

蚂蚁金服的 Service Mesh 就属于上面提到的百花齐放中的一员，我们已经渡过探索期，全面进入生产应用。去年的双十一完成了交易支付核心链路，几十万容器规模的生产级验证。但是业界对于 Service Mesh 仍然有很多种不同的声音，一方面是众星捧月式的支持，另一方面是困惑和质疑，包括对价值、架构以及性能的质疑。那么我们对此是什么态度？双十一深度实践之后蚂蚁金服的 Service Mesh 路又在何方？Service Mesh 架构是终点吗？

本文将结合蚂蚁金服内部实际场景以及思考，讲述继 2019 双十一之后，蚂蚁金服在 Service Mesh 路上的规划和持续演进。

## 蚂蚁金服 Service Mesh 实践回顾

![蚂蚁金服双十一 Service Mesh 实践架构](https://cdn.nlark.com/yuque/0/2020/png/226702/1592200446452-4b4c9729-8631-484d-8722-edbb3a0df29c.png)

上图是 2019 年蚂蚁金服双十一的实践架构，云原生网络代理 MOSN（[https://github.com/mosn](https://github.com/mosn)）作为蚂蚁金服自研数据面产品，承载了 Mesh 架构的东西向流量。对于控制平面，基于务实的前提我们探索出一套当前阶段切实可行的方案，基于传统服务发现体系落地了 Service Mesh 架构。

![service Mesh 实践](https://cdn.nlark.com/yuque/0/2020/png/226702/1592200446489-68f0fe1c-e3c1-4372-bbc4-f1918566edf2.png)

这里是数据化的落地总结，在满足业务的同时，我们真正做到了对业务的低侵入：极低的资源消耗以及快速迭代能力，业务和基础技术都享受到云原生 Mesh 化所带来的红利。

## Service Mesh 前路漫漫

![Software Architecture and Design 趋势报告](https://cdn.nlark.com/yuque/0/2020/png/226702/1592200446479-7bebbc46-0e7f-43c9-a49a-9e154e98e154.png)

我们再来看看 InfoQ 发布的 2020 年 4 月份 Software Architecture and Design 趋势报告，Service Mesh 目前处于 Early Adoption 代，在云原生技术圈仍处于大热阶段，各种技术论坛我们都能见到 Mesh 架构的专场，本篇文章我们不过多讨论 Service Mesh 的选型、使用场景、合理性等等问题，需要的同学可以参考一下文末历史文章，有很多蚂蚁金服对 Service Mesh 的思考。

对于我们来说，既然在深度思考后选择了这条路，并且在去年双十一进行了深度实践，那么棋到中盘，下一步应该如何落子，除了务实落地之外，我们还要仰望星空，必须知道离诗和远方还有哪些 Gap： 

### 非全面云原生

前面提到我们落地 Service Mesh 时，仍然采用了传统微服务体系，虽然整体架构基于 K8s，但在控制面上并没有采用社区的方案，当然这些是有考虑的，但是随着整体架构的演进，非全面云原生化势必会成为我们持续享受云原生红利的最大障碍。

### 平台能力不足

Service Mesh 的定位是解耦基础设施与业务，但是目前看来，不管是社区 Istio+Envoy 的组合，还是蚂蚁金服传统微服务+MOSN 的实践，均是把东西流量的治理作为了重点，离诗和远方还有很长的路。目前还有大量的基础设施逻辑作为 SDK 镶嵌在业务系统中，我们仍然要面临基础设施升级对业务带来的影响。

### 边界流量覆盖不全

随着云原生在数据中心内部愈演愈烈，但是对于数据中心边界以及边缘网络，七层应用网络流量仍然没有形成一个全局体系，由于体系的缺失我们不得不在边界网关与 Mesh 网络两者之间各自分裂发展，均有独立的流量调度体系以及安全可信体系。

### 生态融合度低

传统服务体系发展了这么多年，积累了大量宝贵的财富，Service Mesh 作为新贵出现，从两个方面来说：Service Mesh 需要传统服务体系的融入支撑，才能使现有业务迁移到 Mesh 体系；同时传统服务体系的组件也需要有和 Mesh 体系融合的能力才能持续保持竞争力。

### 性能

性能是一个老生常谈的问题，Mesh 架构中质疑性能的声音也层出不穷 ，包括 Mixer 控制面，还有引入 Sidecar 造成的额外网络消耗、编解码消耗等等。不过我们可以看到社区一直在解决这些问题，包括对 Mixer 架构的重构，引入 ebpf 来加速流量劫持等等。

综上所述，我们在 Service Mesh 上任重道远。

## 将 Service Mesh 进行到底

今年我们的目标是 Mesh 全面覆盖主要业务，这将面临非常大的挑战：

- 金融级安全可信的要求，需要我们做到全链路加密与服务鉴权；
- 统一 Sidecar 与 Ingress Web Server；
- 云原生控制面的落地；
- 透明劫持能力；
- 需要承载更多的中间件能力下沉；

上面分析了目前存在的各种问题，同时结合蚂蚁金服自身的业务发展需求，那么我们可以很清晰的对症下药了，我们将上述问题抽象成三类，并进行专项攻坚：

- 以开源生态建设，来应对生态融合问题；
- 通过云原生标准演进，来解决非全面云原生问题；
- 最后通过基础核心能力增强，来治理平台能力，覆盖场景以及性能的不足的问题；

### 开源生态建设

我们再来回顾一下双十一之后我们做的第一个动作：在 2019 年 12 月 28 日由蚂蚁金服主办的第九期 Service Mesh Meetup 上，我们对外宣布了 MOSN 完成在 SOFAStack 的孵化，开始独立运营，以更加开放的姿态寻求合作共建伙伴：

_我们认为，未来会更多地属于那些告别大教堂、拥抱集市的人们。《大教堂与集市》_

在宣布独立运营的同时，我们也做了一系列措施：

- 独立的项目域名：mosn.io
- 项目地址：github.com/mosn/mosn
- 社区组织：MOSN Community Organization
- 项目管理条例：PMC、Committer 选举晋升机制等等

接下来，开源社区我们也持续做了非常多的事情，包括专题 Working Group的创建，例如 Isito WG， Dubbo WG 等等。

![MOSN 开源社区现况](https://cdn.nlark.com/yuque/0/2020/png/226702/1592200446476-75d58920-6511-4d17-bcc8-f1ef99e57c92.png)

同时也寻求了非常多的外部合作，超过一半的 contributor 均来自外部，接受了第一个来自 BOSS 直聘的 Committer 等等，针对生态融合，我们同Skywalking，Sentinel和Dubbo-go社区进行了深度合作。

#### Skywalking

![Skywalking](https://cdn.nlark.com/yuque/0/2020/png/226702/1592200446542-9c2b7ec8-1578-4537-abe6-b9093e5ee32e.png)

调用依赖以及服务与服务之间的调用状态，是微服务管理中一个重要指标。Skywalking 是该领域非常优秀的一款 APM 软件，MOSN 与 Skywalking 社区展开了合作，进行了两个系统的深度整合工作，目前支持：

- 调用链路拓扑展示；
- QPS 监控；
- 细粒度 RT 展示；

在今年五月份，SkyWalking 8.0 版本进行了一次全面升级，采用新的探针协议和分析逻辑，探针将更具互感知能力，更好的在 Service Mesh 下使用探针进行监控。同时，SkyWalking 将开放之前仅存在于内核中的 Metrics 指标分析体系。Prmoetheus、Spring Cloud Sleuth、Zabbix 等常用的 Metrics 监控方式，都会被统一的接入进来，进行分析。此外，SkyWalking 与 MOSN 社区将继续合作：支持追踪 Dubbo 和 [SOFARPC](https://github.com/sofastack/sofa-rpc)，同时适配 Sidecar 模式下的链路追踪。

更详细的信息参考：[http://skywalking.apache.org/zh/blog/2020-04-28-skywalking-and-mosn.html](http://skywalking.apache.org/zh/blog/2020-04-28-skywalking-and-mosn.html)

#### Sentinel

![Sentinel](https://cdn.nlark.com/yuque/0/2020/png/226702/1592200446501-95a7efdf-140f-45e9-8c19-85065db933f9.png)

Sentinel 是由阿里巴巴开源，面向微服务的轻量级流量控制框架，从流量控制、熔断降级、系统负载保护等多个维度保护服务的稳定性。MOSN 目前仅有简单的限流功能，所以我们与 Sentinel 社区进行合作，将多种不同的限流能力融入 MOSN，进一步提高 MOSN 的流量管理能力，同时大幅降低业务限流接入及配置成本。

![MOSN 与 Sentinel 合作](https://cdn.nlark.com/yuque/0/2020/png/226702/1592200446606-c4f6e13a-1645-44f6-a221-c3c4276e804f.png)

对于长期规划方面，后面会提到，我们将以此作为切入点，提出新的基于 UDPA 的统一限流标准。

#### Dubbo

![Dubbo](https://cdn.nlark.com/yuque/0/2020/png/226702/1592200446545-f8456b45-1836-4285-92a7-7d6064966475.png)

对于支持 Dubbo ，我们主要是基于以下背景：

- Dubbo 是服务实现框架，Service Mesh 是框架理念，Dubbo 也需要享受 Service Mesh 带来的红利，企业适配、扩展需求客观存在，Dubbo 社区同样有这样的用户需求；
- 很多用户和企业无法一步到位云原生，需要渐进落地；
- 当前开源方案无法支持 Dubbo 服务发现；

![MOSN 支持 Dubbo 协议](https://cdn.nlark.com/yuque/0/2020/png/226702/1592200446549-3c5aa083-3e29-4f0b-baad-f103ae909a22.png)

此前我们基于 MOSN 的 xprotocol 架构支持了 Dubbo 协议，但是并没有整体实现基于 Dubbo 的服务体系，这次我们设计了两个方案来满足用户对 Dubbo 的需求，也同样是双模微服务架构：左边是基于传统的 Dubbo 注册中心，集成 Dubbo-go SDK 来满足在传统架构下的 Mesh 化：

- MOSN 提供 Subscribe、Unsubscribe、Publish、Unpublish 的 HTTP 服务；
- SDK 发送请求到 MOSN 提供的这些服务，让 MOSN 代为与真正的注册中心交互；
- MOSN 通过 Dubbo-go直接和注册中心连接；

右图是直接通过 Istio 扩展，以云原生的方式进行 Mesh 支持，该方案是社区合作伙伴多点生活进行了能力贡献，详细的技术方案和使用方式可以阅读[《多点生活在 Service Mesh 上的实践 -- Istio + Mosn 在 Dubbo 场景下的探索之路》](https://www.sofastack.tech/activities/service-mesh-webinar-1/)。

### 云原生标准演进

在前面我们提过无论是蚂蚁金服，还是其他公司，虽然生产级实践了 Mesh，但是均是以传统方式进行的落地，当然这也是基于各个公司当前现状的选择。随着技术的探索，云原生服务治理系统 Istio 的可运维性和架构的合理性也逐渐迎来积极的变化，其功能的完善、性能的提升、部署和运维的复杂性等问题将得到解决，同时随着云原生的全面深度规模化演进，非云原生的架构势必阻碍我们的前进。所以我们通过与 Istio 社区的紧密合作建设一个全局的 Service Mesh 控制平面，同时与云原生网络代理 MOSN 紧密协作推动我们从传统向云原生 Mesh 化的演进，为此我们进行了以下方面的工作：

- 云原生标准 Sidecar 的打造；
- 标准化参与和建设；

针对第一点，MOSN 持续在进行 Istio 能力的对齐工作，包括 Istio 侧多 Sidecar 支持以及 MOSN 侧功能对齐  Istio，控制面方面支持注入 MOSN Sidecar、Pilot-agent 的适配以及 Istio 编译构建的适配、负载均衡算法、流量管理体系、流量检测、服务治理、Gzip等，整个 Milestone：

- 2020年4月完成相关需求任务拆解，可在 Istio-1.4.x 版运行 Bookinfo；
- 2020年6月完成 HTTP 系强依赖功能开发，兼容新架构下的 Istio-1.5.x；
- 2020年8月 HTTP 系功能对齐 Istio；
- 2020年9月支持 Istio 版本预发布；

标准化方面，我们参与了 UDPA 相关规范讨论，并提出限流通用 API 规范[讨论](https://github.com/cncf/udpa/issues/27)，社区会议讨论组织中。

![UDPA 讨论](https://cdn.nlark.com/yuque/0/2020/png/226702/1592200446568-74ffa5c1-a02a-4fe3-92a2-a1bac23abd69.png)

另外 MOSN 一直积极地在与 Istio 社区进行沟通以及寻求合作，我们的目标是希望能成为 Istio 官方推荐的 Sidecar 产品，对此我们在 Istio github 上提了相关 ISSUE，引发了比较大的关注，也非常高兴官方 Member 成员对此问题进行了非常详细的回答和探讨。

![MOSN 与 Istio 社区合作](https://cdn.nlark.com/yuque/0/2020/png/226702/1592200446593-6ce70742-c23b-4618-aa14-59794b85bd57.png)

他们对此提出了一些问题和顾虑，并在 Istio 的例会上进行了专项讨论。

![与 Istio 社区合作相关讨论](https://cdn.nlark.com/yuque/0/2020/png/226702/1592200446580-7f875958-54e0-4efe-8c46-8b78fc8d7907.png)

![讨论记录](https://cdn.nlark.com/yuque/0/2020/png/226702/1592200446650-6040b0e2-1500-4dd5-89f9-e39ebb90f49e.png)

讨论记录详见：[https://github.com/istio/istio/issues/23753](https://github.com/istio/istio/issues/23753)

有过此次沟通后，我们得到了官方对此的想法和建议，让我们也有了非常明确的目标和动力。另一方面针对 Istio 提出的几点问题，我们也有了相应的想法和 Action：

- 对于测试用例覆盖成本，可以通过解耦 Istio 中测试用例和 Envoy 的绑定，或者制定数据面测试集标准套件来降低维护成本；
- 另外 MOSN 社区的同学可以一起加入来进行维护，从而降低维护成本；

我们会持续投入资源专注在自身能力的打造上，同时保持与社区的协作关系，相信在今后时机成熟时，双方会进行深度的合作。

### 基础核心能力增强

Service Mesh 未来路在何方，会发展到何种形态？MOSN 应该具备什么能力才能支撑 Service Mesh 的持续演进？前文中我们通过开源生态建设，云原生标准演进去解决非全面云原生、生态融合度低的问题。那么对于其他问题，再结合蚂蚁金服自身场景的需要，我们做了非常多的能力建设：

- 灵活便捷的多协议扩展支持；
- 多形态的可扩展能力；
- 消息与 P2P 通信模型；
- OpenSSL 支持；
- 透明劫持能力；

#### 协议扩展

![阿喀琉斯之踵](https://cdn.nlark.com/yuque/0/2020/png/226702/1592200446635-43f18c5e-1675-4d6a-ae02-6c96a1b5924c.png)

阿喀琉斯之踵

我用了阿喀琉斯之踵来形容对协议扩展的痛之切，足以见在这块踩过的坑吃过的苦。不管是“远古时代”的 Apache httpd、“中古时代”的 Nginx、还是“现代化”的 Envoy，都是针对 HTTP 或者其他通用协议设计的框架，虽然很多延伸产品做了非常多的扩展，但是对于私有协议扩展仍然比较困难，除了协议本身的转发支持，无法做到通用的框架治理。因此我们需要对每一种协议行为做独立的体系支持，框架需要理解整个请求生命周期、连接复用、路由策略等等，研发成本非常大。基于这些实践痛点，我们设计了 MOSN 多协议框架，希望可以降低私有协议的接入成本，加快普及 ServiceMesh 架构的落地推进，更详细的内容可以看看当时的视频分享：《[云原生网络代理 MOSN 的多协议机制解析](https://www.sofastack.tech/blog/sofa-channel-13-retrospect/)》

![MOSN 多协议框架](https://cdn.nlark.com/yuque/0/2020/png/226702/1592200446652-666da00b-3bcb-49e3-91c6-ca280f72503d.png)

MOSN 多协议框架

![MOSN 多协议框架-2](https://cdn.nlark.com/yuque/0/2020/png/226702/1592200446660-2191b742-4212-4c36-b167-3532f34809c1.png)

#### 可扩展模块化能力

随着业务的发展以及我们对Service Mesh的规划，MOSN需要承载越来越多的基础能力下沉，只有提供灵活高效且稳定的可扩展机制，才能保持其竞争力以及长久生命力。

MOSN 在设计初期就借鉴了 Nginx 和 Envoy 的优秀设计，提供了基于 Filter 的可扩展机制，通过 Network Filter 可以创建自定义的 Proxy 逻辑，通过 Stream Filter 可以提供限流、认证鉴权、注入等等功能，通过 Listener Filter 可以支持透明劫持的能力。

但是这里会发现一个问题，就是有时候我们需要的扩展能力已经有现成可用的实现了，那么我们是否可以做简单的改造就让 MOSN 可以获取对应的能力，哪怕目前可用的实现不是 Go 语言的实现，比如现成的限流能力的实现、注入能力的实现等；又或者对于某些特定的能力，它需要有更严格的控制，更高的标准，比如安全相关的能力。

类似这样的场景，我们引入了 MOSN 的 Plugin 机制，它支持我们可以对 MOSN 需要的能力进行独立开发或者我们对现有的程序进行适当的改造以后，就可以将它们引入到 MOSN 当中来。

![可扩展模块化能力](https://cdn.nlark.com/yuque/0/2020/png/226702/1592200446875-647f0ac3-acff-42a8-85b5-26b43c7bb5e7.png)

MOSN 的 Plugin 机制包含了两部分内容：

- 一是 MOSN 自定义的 Plugin 框架，它支持通过在 MOSN 中实现 agent 与一个独立的进程进行交互来完成 MOSN 扩展能力的实现；
- 二是基于 Golang 的 Plugin 框架，通过动态库（SO）加载的方式，实现 MOSN 的扩展。其中动态库加载的方式目前还存在一些局限性，还处于 beta 阶段；

另外目前大热的 WebAssembly 也是未来发展的方向，在很多场景已经有了比较成熟的支持，Golang 官方目前也有了 WASM 的分支，相信在不久的将来我们也能享受到 WASM 的红利。

#### 消息通信模式

随着 Service Mesh 袭来以及实践的浪潮愈发猛烈，除了传统的服务通信 RPC 外，DB、cache 等形态的 Mesh 需求也日益浮出水面，但好在这些通信模式与 RPC 类似，我们不需要对 Sidecar 进行太多的改造就能支持。但是对于消息通信就不一样了：

- 有状态网络模型；
- 消息顺序性；
- Partitions 为负载原子；

![消息通信模式](https://cdn.nlark.com/yuque/0/2020/png/226702/1592200446652-99cd8748-548f-44b6-add4-9fe82133f392.png)

这使得消息 SDK 无法使用 Partitions 顺序消息，导致 Mesh 化后的消息无法保证正常发送和接受。消息的  Pull/Push Consumer 中 Partitions 是负载均衡的基本单位，原生的 Consumer 中其实是要感知与自己处于同一  ConsumerGroup 下消费同一 Partitions 的 Consumer 数目的，每个 Consumer 根据自己的位置来选择相应的 Partitions 来进行消费，这使得消息中的负载均衡策略已经不再适用于 Service Mesh 体系。

![消息通信模式-1](https://cdn.nlark.com/yuque/0/2020/png/226702/1592293812311-335f496e-3ad2-4250-b9c9-2a6f3996e300.png)

#### OpenSSL 支持

在今年的规划里，我们将基于 Service Mesh 全面实施东西向流量加密，提供更强的传输流量加密保护。同时还会引入国密算法提升安全合规能力，基于安全硬件实现全方位的可信能力。这一切的基石都是需要有一个高效强大且稳定的密码基础设施，MOSN 的原生 Go-TLS 有很多问题：

- 安全能力弱：尚未有任何软/硬件的密钥安全机制；
- 迭代周期长：Go-TLS 到版本 1.15+ 才完全支持 TLS1.3 的安全特性；
- 套件支持差：仅支持典型的 ECDHE、RSA、ECDSA 等算法；
- 性能弱：典型如 RSA、Go 版本性能不到 C 版本的 1/5；

OpenSSL 作为密码基础设施的老大哥，成为了我们的不二选择。OpenSSL 有广泛的使用、丰富的硬件加速引擎、专职的社区人员维护、大而全的套件支持以及高度优化的算法性能。当然对于如何支持 OpenSSL 我们也做了充分的测试和思考，如果使用传统 Cgo 接管所有 TLS 流程，虽然我们享受到了一次集成，终身受用的便捷，但是 Cgo 带来的性能损耗我们无法接受，所以最终我们采用的方案是混合使用，实现特定的安全能力。

![OpenSSL 支持](https://cdn.nlark.com/yuque/0/2020/png/226702/1592200446701-8735ffd2-2938-4454-a035-ac77b17cbc99.png)

#### 透明劫持

虽然社区提供了无侵入接入 Service Mesh 方案，但是原生社区方案带来的性能损失和运维成本都非常大，所以我们在实践中其实并没有做到无侵入地接入。但是随着业务的更大范围的铺开，无侵入式能力迫在眉睫，我们需要要解决多环境适配、可运维性以及性能问题。我们仍然是基于 Iptables 作为数据面来实现流量的劫持，但是针对不同情况作了优化：

- Tproxy 替代 DNAT 解决 Conntrak 连接跟踪问题；
- Hook Connet 系统调用解决 outbond 流量两次穿越协议栈带来的性能损失；
- 模糊匹配黑白名单降低整体规则的管理成本；

流量劫持技术的发展与 Service Mesh 的落地密切相关，后续我们将围绕环境适配性、低时延、低管理成本等方面持续演进，构建由 DNAT、TProxy、TC redirect、Sockmap 等技术组成的多模单体底座，在不同内核环境、不同性能要求、不同管理成本的场景中自适应选取最合适的劫持技术，不断降低 Service Mesh 的接入成本。

## Service Mesh 尤可期许

以上便是我们去年双十一之后，在 MOSN 以及 Service Mesh 下的持续探索，整体的 Milestone 如下：

![MOSN 整体规划](https://cdn.nlark.com/yuque/0/2020/png/226702/1592200446676-e34af2a1-9b62-4293-a373-433aaeeca673.png)

在我看来，Service Mesh架构对于云原生架构，就像高铁之于国民经济。我们经历了云计算的十年，在这个过程中，看似牢固的行业和技术壁垒被不断打破，经典的理念也经常受到质疑和挑战，那么Service Mesh在未来一定也有大的变革。小剑老师其实对此做了深入的分析[《Mecha：将Mesh进行到底》](https://www.sofastack.tech/blog/mecha-carry-mesh-to-the-end/)。这里我就不再重复，主要说说我个人的一些见解。首先我们在发展趋势中，业务与基础技术持续解耦、协同；中间件持续下沉，业务基础层下沉；基础业务需更好的与 Mesh 架构整合，形成生态，有非常高度的一致。同时我认为随着云原生网络的边界扩大，势必带来规模化效应，我们需要解决性能、资源消耗、延迟等各种基础问题，所以需要通过 Kernel Bypaas，Sidecar as Node，引入硬件优化等手段解决以上问题。同时我们相信在云原生的演进中，容器网络将与 Service Mesh 融合，网络从面向 IP 到面向 Identity 与服务，可以将 Sidecar 向下沉淀为系统基础设施，成为安全容器网络栈，智能硬件设备基本网络单元。

当 Sidecar 下沉作为系统的一部分后，开始从框架往平台发展，提供分布式原语抽象像 Dapr 一样提供远程 API 的方式对外提供服务是一种实现，另外我们正在尝试基于共享内存的接口通信方案，最后业务会发展为面向 Mesh 编程，Mesh 架构最终形成分布式微服务 OS。

但是 No Silver Bullet，分布式系统虽然已经成为新型业务的主流形态，但在很多传统领域，集中式架构仍然存在于许多核心系统中。这种系统最重要的就是运维效率，高可用等稳定性诉求。这正是成熟的集中式架构的强项。而业务中前台，更多的挑战是如何应对市场的快速变化，进行快速迭代，抢占市场。分布式架构，特别是微服务框架正是帮助用户能够进行快速迭代，推出业务能力而生的，Service Mesh 目前来看将成为这种架构的助推器。

## 作者简介

肖涵，花名涵畅，2011年加入蚂蚁金服，一直从事四/七层网络负载均衡，高性能代理服务器以及网络协议相关的研发工作。目前是蚂蚁金服可信原生技术部应用网络组负责人，蚂蚁金服开源项目云原生网络代理 MOSN 负责人。

## 蚂蚁金服 Service Mesh 双十一落地系列文章

- [蚂蚁金服 Service Mesh 大规模落地系列 - 质量篇](https://www.sofastack.tech/blog/service-mesh-practice-in-production-at-ant-financial-part8-quantity/)
- [蚂蚁金服 Service Mesh 大规模落地系列 - 控制面篇](https://www.sofastack.tech/blog/service-mesh-practice-in-production-at-ant-financial-part7-control-plane/)
- [蚂蚁金服 Service Mesh 大规模落地系列 - Operator 篇](https://www.sofastack.tech/blog/service-mesh-practice-in-production-at-ant-financial-part6-operator/)
- [蚂蚁金服 Service Mesh 大规模落地系列 - 网关篇](https://www.sofastack.tech/blog/service-mesh-practice-in-production-at-ant-financial-part5-gateway/)
- [蚂蚁金服 Service Mesh 大规模落地系列 - RPC 篇](https://www.sofastack.tech/blog/service-mesh-practice-in-production-at-ant-financial-part4-rpc/)
- [蚂蚁金服 Service Mesh 大规模落地系列 - 运维篇](https://www.sofastack.tech/blog/service-mesh-practice-in-production-at-ant-financial-part3-operation/)
- [蚂蚁金服 Service Mesh 大规模落地系列 - 消息篇](https://www.sofastack.tech/blog/service-mesh-practice-in-production-at-ant-financial-part2-mesh/)
- [蚂蚁金服 Service Mesh 大规模落地系列 - 核心篇](https://www.sofastack.tech/blog/service-mesh-practice-in-production-at-ant-financial-part1-core/)
- [Service Mesh 落地负责人亲述：蚂蚁金服双十一四大考题](https://www.sofastack.tech/blog/service-mesh-practice-antfinal-shopping-festival-big-exam/)
