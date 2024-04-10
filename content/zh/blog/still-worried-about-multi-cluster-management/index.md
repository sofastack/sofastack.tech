---
title: "还在为多集群管理烦恼吗？OCM来啦！"
author: ""
authorlink: "https://github.com/sofastack"
description: "还在为多集群管理烦恼吗？OCM来啦！"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2021-07-20T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*Bw1FSIjlWZcAAAAAAAAAAAAAARQnAQ"
---

> 作者简介：冯泳（花名鹿惊），资深技术专家，拥有西北工业大学计算机科学博士学位，在高性能计算，大数据和云计算领域拥有十多年的设计开发经验，专注于调度，资源和应用管理领域。也深度参与相关开源项目的开发和商业化，例如 OpenStack, Mesos, Swarm, Kubernetes, Spark 等，曾在 IBM 领导过相关的开发团队。

## 前言

在云计算领域如果还有人没听过 Kubernetes，就好像有人不知道重庆火锅必须有辣椒。Kubernetes 已经像手机上的 Android，笔记本上的 Windows 一样成为管理数据中心事实上的标准平台了。围绕着 Kubernetes，开源社区构建了丰富的技术生态，无论是 CI/CD、监控运维，还是应用框架、安全反入侵，用户都能找到适合自己的项目和产品。可是，一旦将场景扩展到多集群、混合云环境时，用户能够依赖的开源技术就屈指可数，而且往往都不够成熟、全面。

为了让开发者、用户在多集群和混合环境下也能像在单个 Kubernetes 集群平台上一样，使用自己熟悉的开源项目和产品轻松开发功能，RedHat 和蚂蚁、阿里云共同发起并开源了 OCM（Open Cluster Management）旨在解决多集群、混合环境下资源、应用、配置、策略等对象的生命周期管理问题。目前，OCM 已向 CNCF TOC 提交 Sandbox 级别项目的孵化申请。

项目官网：[https://open-cluster-management.io/](https://open-cluster-management.io/)

> ![](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*HmiPQ7LHmSAAAAAAAAAAAAAAARQnAQ)

## 多集群管理发展历史

让我们把时间拉回到几年前，当业界关注/争论的焦点还在 Kubernetes 是否生产级可用的时候，就出现了最早一批登陆“多集群联邦“技术的玩家。它们大都是体量上远超平均水准的 Kubernetes 实践先驱，从最早 Redhat、谷歌入场做了 KubeFed v1 的尝试，再到后来携手 IBM 吸取经验又推出 KubeFed v2。除了这些大型企业在生产实践 Kuberentes 的场景中探索多集群联邦技术，在商业市场上，各个厂商基于 Kubernetes 包装的服务产品也大多经历了从单集群产品服务到多集群形态、混合云场景进化的过程。其实，无论是企业自身还是商业用户都有共性的需求，聚焦在以下几个方面：

**多地域问题：当集群需要在异构基础设施上或者横跨更广地域进行部署**

Kubernetes 集群依赖 etcd 作为数据持久层，而 etcd 作为分布式系统对系统中各个成员之间的网络延迟上有要求，对成员的数量也有一些限制，虽然在延迟能够容忍的情况下可以通过调整心跳等参数适配，但是不能满足跨国跨洲的全球性部署需求，也不能保证规模化场景下可用区的数量，于是为了让 etcd 至少可以稳定运行，一般会按地域将 etcd 规划为多个集群。此外，以业务可用和安全性为前提，混合云架构越来越多地被用户接受。跨越云服务提供商很难部署单一 etcd 集群，随之对应的，Kubernetes 集群也被分裂为多个。当集群的数量逐渐增多，管理员疲于应对时，自然就需要一个聚合的管控系统同时管理协调多个集群。

**规模性问题：当单集群规模性遇到瓶颈**

诚然，Kubernetes 开源版本有着明显的规模性瓶颈，然而更糟糕是，我们很难真正量化 Kubernetes 的规模。社区一开始提供了 kubemark 套件去验证集群的性能，可是现实很骨感，kubemark 所做的事情基于局限于在不同节点数量下反复对 Workload 进行扩缩容调度。可是实践中造成 Kubernetes 性能瓶颈的原因复杂、场景众多，kubemark 很难全面客观描述多集群的规模性，只能作为非常粗粒度下的参考方案。后来社区支持以规模性信封来多维度衡量集群容量，再之后有了更高级的集群压测套件 perf-tests。当用户更清晰地认识到规模性的问题之后，就可以根据实际场景（比如 IDC 规模、网络拓扑等）提前规划好多个 Kubernetes 集群的分布，多集群联邦的需求也随之浮出水面。

**容灾/隔离性问题：当出现更多粒度的隔离和容灾需求**

业务应用的容灾通过集群内的调度策略，将应用部署到不同粒度的基础设施可用区来实现。结合网络路由、存储、访问控制等技术，可以解决可用区失效后业务的连续性问题。但是如何解决集群级别，甚至是集群管理控制平台自身的故障呢？

etcd 作为分布式系统可以天然解决大部分节点失败的问题，可是不幸的是实践中 etcd 服务也还是可能出现宕机的状况，可能是管理的操作失误，也可能是出现了网路分区。为了防止 etcd 出现问题时“毁灭世界”，往往通过缩小“爆炸半径”来提供更粒度的容灾策略。比如实践上更倾向于在单个数据中心内部搭建多集群以规避脑裂问题，同时让每集群成为独立的自治系统，即使在出现网络分区或者更上层管控离线的情况下可以完整运行，至少稳定保持现场。这样自然就形成了同时管控多个 Kubernetes 集群的需求。

另一方面，隔离性需求也来自于集群在多租户能力上的不足，所以直接采取集群级别的隔离策略。顺带一提的好消息是 Kubernetes 的控制面公平性/多租户隔离性正在一砖一瓦建设起来，通过在 1.20 版本进入 Beta 的 APIPriorityAndFairness 特性，可以根据场景主动定制流量软隔离策略，而不是被动的通过类似 ACL 进行流量的惩罚限流。如果在最开始进行集群规划的时候划分为多个集群，那么隔离性的问题自然就解决了，比如我们可以根据业务给大数据分配独占集群，或者特定业务应用分配独占请集群等等。

## OCM 的主要功能和架构

OCM 旨在简化部署在混合环境下的多 Kubernetes 集群的管理工作。可以用来为 Kubernetes 生态圈不同管理工具拓展多集群管理能力。OCM 总结了多集群管理所需的基础概念，认为在多集群管理中，任何管理工具都需要具备以下几点能力：

1.理解集群的定义；

2.通过某种调度方式选择一个或多个集群；

3.分发配置或者工作负载到一个或多个集群；

4.治理用户对集群的访问控制；

5.部署管理探针到多个集群中。

OCM 采用了 hub-agent 的架构，包含了几项多集群管理的原语和基础组件来达到以上的要求：

●通过 ManagedCluster API 定义被管理的集群，同时 OCM 会安装名为 Klusterlet 的 agent 在每个集群里来完成集群注册，生命周期管理等功能。

●通过 Placement API 定义如何将配置或工作负载调度到哪些集群中。调度结果会存放在 PlacementDecision API 中。其他的配置管理和应用部署工具可以通过 PlacementDecisiono 决定哪些集群需要进行配置和应用部署。

●通过 ManifestWork API 定义分发到某个集群的配置和资源信息。

●通过 ManagedClusterSet API 对集群进行分组，并提供用户访问集群的界限。

●通过 ManagedClusterAddon API 定义管理探针如何部署到多个集群中以及其如何与 hub 端的控制面进行安全可靠的通信。

架构如下图所示，其中 registration 负责集群注册、集群生命周期管理、管理插件的注册和生命周期管理；work 负责资源的分发；placement 负责集群负载的调度。在这之上，开发者或者 SRE 团队能够基于 OCM 提供的 API 原语在不同的场景下方便的开发和部署管理工具。

> ![](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NfxfTa0VAOoAAAAAAAAAAAAAARQnAQ)

通过利用 OCM 的 API 原语，可以简化许多其他开源多集群管理项目的部署和运维，也可以拓展许多 Kubernetes 的单集群管理工具的多集群管理能力。例如：

1.简化 submariner 等多集群网络解决方案的管理。利用 OCM 的插件管理功能将 submariner 的部署和配置集中到统一的管理平台上。

2.为应用部署工具（KubeVela, ArgoCD 等）提供丰富的多集群负责调度策略和可靠的资源分发引擎。

3.拓展现有的 kuberenetes 单集群安全策略治理工具（Open Policy Agent，Falco 等）使其具有多集群安全策略治理的能力。

OCM 还内置了两个管理插件分别用来进行应用部署和安全策略管理。其中应用部署插件采用了订阅者模式，可以通过定义订阅通道（Channel）从不同的源获取应用部署的资源信息，其架构如下图所示：

> ![](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*diCqSaZRkNgAAAAAAAAAAAAAARQnAQ)

同时为了和 kubernetes 生态系统紧密结合，OCM 实现了 kubernetes sig-multicluster 的多个设计方案，包括 KEP-2149 Cluster ID：
[https://github.com/Kubernetes/enhancements/tree/master/keps/sig-multicluster/2149-clusterid](https://github.com/Kubernetes/enhancements/tree/master/keps/sig-multicluster/2149-clusterid)

和 KEP-1645 Multi-Cluster Services API 中关于 clusterset 的概念：[https://github.com/Kubernetes/enhancements/tree/master/keps/sig-multicluster/1645-multi-cluster-services-api](https://github.com/Kubernetes/enhancements/tree/master/keps/sig-multicluster/1645-multi-cluster-services-api)

也在和其他开发者在社区共同推动 Work API[https://github.com/Kubernetes-sigs/work-api](https://github.com/Kubernetes-sigs/work-api) 的开发。

## OCM 的主要优势

**高度模块化 --- 可自由选择/剪裁的模块**

整个 OCM 架构很像是“微内核”操作系统，OCM 的底盘提供核心能力集群元数据抽象等等服务，而其他扩展能力都是作为独立组件可拆分的进行部署。如上图所示 OCM 的整个方案里除了最核心的能力部分之外，其他上层的能力都是可以根据实际需求进行裁剪的，比如如果我们不需要复杂集群拓扑关系，那么就可以剪裁掉集群分组相关的模块，如果我们不需要通过 OCM 下发任何资源仅作为元数据使用，那么甚至可以剪裁掉整个资源下发的 Agent 组件。这也有利于引导用户逐步登陆 OCM，在初期用户可能只需要用到很小的一部分功能，再随着场景拓展慢慢引入更多的特性组件，甚至同时支持在正在运行中的控制面上热插拔。

**更具有包容性 --- 复杂使用场景的瑞士军刀**

整个 OCM 方案在设计之初就考虑到通过集成一些第三方主流的技术方案进行一些复杂场景高级能力的建设。比如为了支持更复杂的应用资源渲染下发， OCM 支持以 Helm Chart 的形式安装应用且支持载入远程 Chart 仓库。同时也提供了 Addon 框架以支持使用方通过提供的扩展性接口定制开发自己的需求，比如 Submarine 就是基于 Addon 框架开发的多集群网络信任方案。

**易用性 --- 降低使用复杂性**

为了降低用户的使用复杂度以及迁移到 OCM 方案的简易度，OCM 提供了传统指令式的多集群联邦控制流程。值得注意的是以下提及功能尚在研发过程中，将在后续版本和大家正式见面：

●通过 ManagedClusterAction 我们可以向被纳管的集群逐个下发原子指令，这也是作为一个中枢管控系统自动化编排各个集群最直观的做法。一个 ManagedClusterAction 可以有自己的指令类型，指令内容以及指令执行的具体状态。

●通过 ManagedClusterView 我们可以主动将被纳管集群中的资源“投射”到多集群联邦中枢系统中，通过读取这些资源在中枢中的“投影”，我们可以在联邦系统中进行更动态准确的决策。

## OCM 在蚂蚁集团的实践

OCM 技术已经应用到蚂蚁集团的基础设施中，作为第一步，通过运用一些类似与社区 Cluster API 的运维手段将 OCM Klusterlet 逐个部署到被管理的集群中去，从而把蚂蚁域内几十个线上线下集群的元信息统一接入到了 OCM 中。这些 OCM Klusterlet 为上层的产品平台提供了多集群管理运维的基础能力方便以后的功能扩展。具体来讲 OCM 第一步的落地内容包括以下方面：

●无证书化：在传统的多集群联邦系统中，我们往往需要给各个集群的元数据配置上对应的集群访问证书，这也是 KubeFed v2 的集群元数据模型里的必需字段。由于 OCM 整体采用了 Pull 的架构，由部署在各个集群中的 Agent 从中枢拉取任务并不存在中枢主动访问实际集群的过程，所以每份集群的元数据都只是彻底“脱敏”的占位符。同时因为证书信息不需要进行存储所以在 OCM 方案中不存在证书被拷贝挪用的风险

●自动化集群注册：先前集群注册的流程中存在较多人工干预操作的环节拉长了协作沟通时间的同时又损失了变更灵活性，比如站点级别或者机房级别的弹性。在很多场景下人工的核验必不可少，可以充分利用 OCM 集群注册提供的审核和验证能力，并将他们集成进域内的批准流程工具，从而实现整个集群自动化的注册流程，达成以下目标：

（1）简化集群初始化/接管流程；

（2）更清晰地控制管控中枢所具备的权限。

●自动化集群资源安装/卸载：所谓接管主要包括两件事情（a）在集群中安装好管理平台所需的应用资源（b）将集群元数据录入管理平台。对于（a）可以进一步分为 Cluster 级别和 Namespace 级别的资源，而（b）一般对于上层管控系统是个临界操作，从元数据录入的那一刻之后产品就被认为接管了集群。在引入 OCM 前，所有的准备的工作都是需要人工推动一步一步准备。通过 OCM 整个流程可以自动化，简化人工协作沟通的成本。这件事情的本质是将集群纳管梳理成一个流程化的操作，在集群元数据之上定义出状态的概念让产品中枢可以流程化地自动化接管所要做的”琐事“。在 OCM 中注册好集群之后资源的安装与卸载流程都被清晰的定义了下来。

通过上述工作，蚂蚁域内的数十个集群都在 OCM 的管理范围内。在双十一等大促活动中，自动创建和删除的集群也实现了自动化的接入和删除。后面也计划了与 KubeVela 等应用管理技术集成，协同完成应用，安全策略等在蚂蚁域内的云原生化管理能力。

## OCM 在阿里云的实践

在阿里云，OCM 项目则是 KubeVela
[https://github.com/oam-dev/kubevela](https://github.com/oam-dev/kubevela)

面向混合环境进行无差别应用交付的核心依赖之一。KubeVela 是一个基于开放应用模型（OAM）的“一站式”应用管理与交付平台，同时也是目前 CNCF 基金会托管的唯一一个云原生应用平台项目。在功能上，KubeVela 能够为开发者提供端到端的应用交付模型，以及灰度发布、弹性伸缩、可观测性等多项面向多集群的运维能力，能够以统一的工作流面向混合环境进行应用交付与管理。在整个过程中，OCM 是 KubeVela 实现 Kubernetes 集群注册、纳管、应用分发策略的主要技术。

在公共云上，KubeVela 的上述特性结合阿里云 ACK 多集群纳管能力，则可以为用户提供了一个强大的应用交付控制平面，能够轻松实现：

●混合环境一键建站。例如，一个典型的混合环境可以是一个公共云的 ACK 集群（生产集群）加上一个被 ACK 多集群纳管的本地 Kubernetes 集群（测试集群）。在这两个环境中，应用组件的提供方往往各不相同，比如数据库组件在测试集群中可能是 MySQL，而在公共云上则是阿里云 RDS 产品。这样的混合环境下，传统的应用部署和运维都极其复杂的。而 KubeVela 则可以让用户非常容易的在一份部署计划中详细定义待部署制品、交付工作流、声明不同环境的差异化配置。这不仅免去了繁琐的人工配置流程，还能借助 Kubernetes 强大的自动化能力和确定性大幅降低发布和运维风险。

●多集群微服务应用交付：云原生架构下的微服务应用，往往由多样化的组件构成，常见的比如容器组件、Helm 组件、中间件组件、云服务组件等。KubeVela 为用户提供面向微服务架构的多组件应用交付模型，借助 OCM 提供的分发策略在多集群、混合环境中进行统一的应用交付，大大降低运维和管理微服务应用的难度。

在未来，阿里云团队会同 RedHat/OCM 社区、Oracle、Microsoft 等合作伙伴一起，进一步完善 KubeVela 面向混合环境的应用编排、交付与运维能力，让云原生时代的微服务应用交付与管理真正做到“既快、又好”。

## 加入社区

目前 OCM 社区还处在快速开发的早期，非常欢迎有兴趣的企业、组织、学校和个人参与。在这里，你可以和蚂蚁集团、RedHat、和阿里云的技术专家们以及 Kubernetes 核心 Contributor 成为伙伴，一起学习、搭建和推动 OCM 的普及。

●GitHub 地址：
[https://github.com/open-cluster-management-io](https://github.com/open-cluster-management-io)

●通过视频了解 OCM：
[https://www.youtube.com/channel/UC7xxOh2jBM5Jfwt3fsBzOZw](https://www.youtube.com/channel/UC7xxOh2jBM5Jfwt3fsBzOZw)

●来社区周会认识大家：
[https://docs.google.com/document/d/1CPXPOEybBwFbJx9F03QytSzsFQImQxeEtm8UjhqYPNg](https://docs.google.com/document/d/1CPXPOEybBwFbJx9F03QytSzsFQImQxeEtm8UjhqYPNg)

●在 Kubernetes Slack 频道# open-cluster-mgmt 自由交流：
[https://slack.k8s.io/](https://slack.k8s.io/)

●加入邮件组浏览关键讨论：
[https://groups.google.com/g/open-cluster-management](https://groups.google.com/g/open-cluster-management)

●访问社区官网获取更多信息：
[https://open-cluster-management.io/](<https://open-cluster-management.io/>](<https://open-cluster-management.io/>](<https://open-cluster-management.io/>)

今年 9 月 10 日 INCLUSION·外滩大会将如期举行，作为全球金融科技盛会，它将继续保持科技·让技术更普惠的初心。11 日下午的多集群、混合云架构开源专场，OCM 社区的主要开发人员会为大家带来围绕 OCM 构建的多集群、混合云最佳实践，欢迎你届时线下参加，面对面交流。
感谢你对 OCM 的关注与参与，欢迎分享给有同样需求的更多朋友，让我们共同为多集群、混合云的使用体验更进一步而添砖加瓦！

### 本周推荐阅读

- [RFC8998+BabaSSL---让国密驶向更远的星辰大海](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247490428&idx=1&sn=8ca31baa5c99e0790cdee8a075a7c046&chksm=faa0f4a6cdd77db07f3fb1149b7f6505fe6b8eca5b2e2a724960aee76d9667e3e970c44eef5a&scene=21)

- [MOSN 子项目 Layotto：开启服务网格+应用运行时新篇章](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247488835&idx=1&sn=d645b9abc866048e679b56bfe3b72482&chksm=faa0fa99cdd7738ff1749ae75b1670f953c92b70dcf0358337977438fd74b632b21a7b17ece3&scene=21)

- [开启云原生 MOSN 新篇章 — 融合 Envoy 和 GoLang 生态](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247490185&idx=1&sn=cfc301e20a1ae5d0754fab3f05ea094a&chksm=faa0f553cdd77c450bf3c8e34cf3c27c3bbd89092ff30e6ae6b2631953c4886086172a37cb48&scene=21)

- [MOSN 多协议扩展开发实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247488899&idx=1&sn=5558ae0a0c23615b2770a13a39663bb3&chksm=faa0fa59cdd7734f35bea5491e364cb1d90a7b9c2c129502da0a765817602d228660b8fbba20&scene=21)

更多文章请扫码关注“金融级分布式架构”公众号

> ![](https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*s3UzR6VeQ6cAAAAAAAAAAAAAARQnAQ)
