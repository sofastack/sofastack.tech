---
title: "Lunettes - 让 Kubernetes 服务运营更简单"
authorlink: "https://github.com/sofastack"
description: "Lunettes - 让 Kubernetes 服务运营更简单"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2023-10-31T15:00:00+08:00
cover: "https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*J6s1RpIvMfwAAAAAAAAAAAAADrGAAQ/original"
---

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/837e0d1ea58d470ab2154bf53d097824~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=638&h=90&s=206394&e=gif&f=120&b=ffffff)

文｜谭崇康（*花名：见云*）

蚂蚁集团高级技术专家

**本文 3781 字 阅读 10 分钟**

## 问题：K8s 服务运营需要更好的可观测能力

云原生系统以 Kubernetes*（K8s）*为基石，业界很多公司的基础设施也构建在 K8s 平台之上。作为公司的关键基础设施，K8s 平台的运营效率直接影响业务的稳定与效率。

然而，将 K8s 作为服务运营与单纯的使用 K8s 存在很大的区别。在使用 K8s 时，我们关注是形形色色的功能，而在 K8s 服务运营过程中我们将更加聚焦 **K8s 服务的质量以及效率**。运营一个 K8s 服务需要关注的典型问题例如：

- 问题诊断及其效率：K8s 链路长、组件多、概念丰富、状态复杂等，如何快速诊断日常失败问题原因是一个很关键的能力；
- 服务质量衡量问题：如何衡量 K8s 平台服务整体资源交付效率以及调度、镜像拉取、IP 分配等各个环节的服务质量，进而引导服务能力的提升；
- 链路性能问题：如何发现、定位集群中的性能瓶颈，提升集群的资源交付吞吐；
- 运营体系化问题：当前社区的可观测服务更多关注的还是某些孤立的功能点，服务运营需要的是数字化、性能、效率、体系化等。

## Lunettes：K8s 平台运营可观测工作空间

K8s 集群构成的容器服务平台，并努力提升平台服务的质量。在这个过程中，我们沉淀了很多运营工具以及相关的运营经验。基于这些工具及经验，我们构建了容器可观测服务 **Lunettes**，希望帮助大家更简单地运营 Kuberntes 服务。Lunettes 项目代码已经在 GitHub 平台开放，欢迎大家参与！

**项目链接：**[https://github.com/alipay/container-observability-service](https://github.com/alipay/container-observability-service)

**Lunettes 服务提供的一些特性，包括：**

- 定义了 K8s 资源交付效率的 SLO，并基于 SLO 产出了成功率相关的可观测数据，用户基于 SLO 衡量 K8s 整体及子服务的质量，同时发现服务能力受损等问题；
- 提供了容器一键诊断能力，Lunettes 分析 K8s 资源交付过程的各个阶段，产出当前运维过程中的问题，帮助用户快速定位及解决问题；
- 建设了一套无侵入的资源交付 Trace 能力，基于 Lunettes 分析的 HyperEvent 事件，用户可以看到资源交付链路中各个子阶段的耗时及错误，及时发现性能瓶颈点。

**其他的一些易用特性包括：**

- 统一的操作界面，支持多集群管理，一站式服务体验；
- 多维信息的聚合能力，提供日志、监控、Trace 等多维数据融合的能力。

Lunettes 是一个一站式的 K8s 容器可观测服务，能够为原生的 K8s 集群构建一个为服务运营打造的可观测工作空间，大幅降低了 K8s 服务运营的难度：

- 基于可扩展的多维可观测数据构建：Lunettes 将不同维度的可观测数据抽象为 HyperEvent，并在 HyperEvent 之上构建其他服务能力。我们可以方便地通过配置化封装能力将新的可观测数据维度封装成 HyperEvent 从而扩展 Lunettes 的数据聚合能力。
- 面向原生 K8s 集群，一键拉起：Lunettes 各个核心功能都具备灵活的配置能力，并且默认配置为原生 K8s 版本设计。Lunettes 可以采用普通 YAML 或 helm charts 部署，用户可以方便地在 K8s 集群一键拉起 Lunettes 服务。
- 构建 K8s 运营的完整的可观测工作空间*（workspace）*：Lunettes 提供了包含资源交付 SLO、容器生命周期诊断、容器生命周期 Trace、多维数据融合等常用的功能，为 K8s 集群提供一站式运营工作空间。

### 软件架构

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*iY3dT56Hph8AAAAAAAAAAAAADrGAAQ/original)

**Lunettes 服务的软件架构分为四层，分别为：**

- **用户接口层** *（User-Portal）*：图形化交互基于 Grafana 构建，此外我们也提供 OpenAPI 接口；
- **可观测服务层** *（Observability-Services）*：包含阶段耗时分析、资源交付 SLO、资源交付诊断、资源交付 Trace 等多个可观测特性；
- **数据处理层** *（Data- Processing）*：Lunettes 具有可观测数据源扩展能力，支持 Operations、Events 等多种可观测数据，并将可观测数据统一封装为 HyperEvent，经由上层的 SharedProcessor 统一处理。在 Lunettes 中，可观测数据的处理是高度可配置化的，ConfigCenter 负责配置的管理。
- **存储层** *（Storage）*：Lunettes 的存储层支持多种存储服务，包含 Prometheus、ElasticSearch、SLS 等。

### 基础功能介绍

#### 资源交付 SLO

K8s 的核心功能是将资源以容器的形式交付出去。如何定义容器平台的资源交付质量是一个核心的话题。Lunettes 首先根据可观测数据定义容器生命周期中的各个阶段，区分基础设施阶段以及用户应用阶段，从而统计容器平台容器交付所花费的时间。进一步，Lunettes 根据容器交付的时间定义资源交付 SLO。下图中展示了集群的 1 分钟级以及 1 小时级 Pod 创建成功率的 SLO 数据。

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*86M3S7jMA-EAAAAAAAAAAAAADrGAAQ/original)

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*-PcNRpVNqCwAAAAAAAAAAAAADrGAAQ/original)

#### **容器生命周期诊断**

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*Sy2fT7yWrnoAAAAAAAAAAAAADrGAAQ/original)

Lunettes 将诊断 Pod 创建流程中各个阶段的错误，形成典型容器创建错误码，例如 FailedScheduling 对应调度失败、FailedPullImage 对应镜像拉取失败等。典型的错误码将具备以下功能：

- 错误信息形成一个标准的错误集合，每个错误类型以可理解的方式代表特定的一类错误，给用户提供当前交付失败的诊断结果；
- 形成标准的 ErrorCode，作为上下游问题传递的依据，构建端到端的诊断链路；
- 当集群故障时，诊断结果作为聚合信息，当大量错误聚合时，方便我们快速定位到集群中的错误组件及错误原因。

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*AKAUTK9aJZsAAAAAAAAAAAAADrGAAQ/original)

在诊断过程中，Lunettes 将从底层的可观测数据中抽取生命周期中的关键事件，涵盖了 Operation、Events 等，帮助用户根据关键事件快速定位容器生命周期中的各种问题。

#### **资源交付 Trace**

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*qOQ2QqNm0sIAAAAAAAAAAAAADrGAAQ/original)

Lunettes 设计了一套无侵入的资源交付*（创建、删除等）*过程 Trace 体系，基于 Lunettes 分析的 HyperEvent 事件，以用户可理解的方式分析资源交付过程中的各个阶段，例如 IP 分配、镜像拉取、Volume 绑定等，并基于这些分析构建了资源交付 Trace。通过资源交付 Trace，用户可以方便地找到资源交付过程中各个阶段的耗时及错误，从而掌握整个资源交付过程中的热点问题。Trace 与 Log、Event 等关联，帮助用户快速找到问题的根因。

#### **多维信息聚合能力**

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*gdEESpdiIaAAAAAAAAAAAAAADrGAAQ/original)

基于我们在过去多年积累的 K8s 运营经验，Lunettes 为日常运营活动中的多个典型场景设计，聚合了 YAML 信息、Event 信息、审计信息、Trace 信息、SLO 信息等多维度的可观测信息，为用户提供一个完整的 K8s 运营可观测工作空间。

## **实践：几个典型的使用场景**

### **Case1：诊断 Pod 创建失败**

以镜像拉取失败为例，我们来看一下在 Lunettes 中，如何诊断一个 Pod 是因为镜像拉取时间太长而导致失败的案例。

1、通过容器诊断，首先看到 Pod 的创建结果是 ImagePullTooMuchTime。通过这个结果，我们可以判断当前的错误是镜像拉取时间太长。

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*XJTQSbaDVFkAAAAAAAAAAAAADrGAAQ/original)

2、通过容器拓扑，可以看到是哪个镜像有问题。

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*EndwRb-vaz4AAAAAAAAAAAAADrGAAQ/original)

3、通过容器交付 Trace，可以看到镜像拉取花了多长时间。

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*q7lJTrp9gjsAAAAAAAAAAAAADrGAAQ/original)

### **Case2：诊断服务问题导致 SLO 下跌**

1、通过上文提到的 Pod 创建 SLO 下跌告警，可以快速地发现当前集群的 Pod 创建链路受损；

2、诊断对应集群的容器创建 SLO，我们可以看到当前造成 SLO 下跌的核心错误是 IP 相关，FailedAllocateIP 以及 AllocateIPTimeout，如下图所示。同时，Lunettes 提供了各个错误的历史变化情况，方便用户找到问题的突变事件点。

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*rrZoTYtVRdUAAAAAAAAAAAAADrGAAQ/original)

3、诊断 FailedAllocateIP，我们可以看到有部分错误在一些节点上聚集，进而可以推断可能是节点上的系统组件有问题，或者是某些节点创建的频率高。

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*jwSrQr4vqcMAAAAAAAAAAAAADrGAAQ/original)

4、为了进一步定位问题，我们可以获取相应错误的 Pod 列表，分析各个典型 Pod 的错误情况。

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*7KReR5xaK4MAAAAAAAAAAAAADrGAAQ/original)

### **Case3：分析容器创建链路的性能问题**

在生产级 K8s 中，用户对资源的交付效率有很强的诉求，尤其在 Job 级短任务场景下，由于任务的运行时间短，Pod 创建耗时作为基础设施耗时对任务的吞吐有较大的影响。因此，我们会持续关注资源交付链路的性能。Lunettes 提供了资源交付 Trace 功能来帮助发现这类问题。

例如，当某一个 Pod 虽然创建成功了，但是耗时比较长，不符合预期，用户可以通过 Trace 知道哪个阶段的耗时影响了整体耗时。下图中，通过容器交付 Trace 我们可以看到，容器在 sandbox 创建 /init 容器以及容器 start 阶段都消耗了比较长的时间。

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*sCRzS7Ijd08AAAAAAAAAAAAADrGAAQ/original)

同时，通过 Trace 的统计信息，我们可以看到每个阶段的平均以及长尾耗时，这将指导整个资源交付链路的性能优化。

## **Lunettes****让 K8s 平台的运营更简单**

Lunettes 旨在为 K8s 平台构建一个数字化、高效的服务运营可观测工作空间，提供了跨集群统一操作界面、资源交付 SLO、容器诊断、容器交付 Trace、多维数据聚合等，提供了 K8s 平台运营过程中的不同场景下的多个实用的可观测服务。Lunettes 项目现已开源，欢迎大家参与 Lunettes 社区！

## **欢迎持续关注和 Star Lunettes！**

**Lunettes Star 一下✨：**  
[https://github.com/alipay/container-observability-service](https://github.com/alipay/container-observability-service)

## 本周推荐阅读

[大象转身：支付宝资金技术 Serverless 提效总结](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247541695&idx=1&sn=70ea82d3e7fc9c2de5df9dc70ebcbc46&chksm=faa3cc65cdd44573a00b4f092f42a5cdcc5519a466fcdf2638e8912594b4b6438bb8932faa83&scene=21)

[DLRover：蚂蚁开源大规模智能分布式训练系统](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247526048&idx=1&sn=3b15877be6c51d7faf0cb0def8dd8f2c&chksm=faa3897acdd4006c3d4e9984ff8d2c48198aca74115e03ac0becddbbe649a2494ba66f81e26f&scene=21)

[Docker 环境基于 Dragonfly 的 Kubernetes 多集群镜像分发实践](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247542411&idx=1&sn=7e866f2b38b2296887b18d0fb991eb1b&chksm=faa3c951cdd4404742d0f34997d5ed79627b78478437547c0418b979c79fefd4fba9427695f3&scene=21)

[MoE 系列（七）｜ Envoy Go 扩展之沙箱安全](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247538840&idx=1&sn=62286a02933ffae587479586b39ce3c1&chksm=faa3b742cdd43e5427fd1b2a44e8ded825a413f867ed3eb62451c18e2a0ea9cfcf1d703c4513&scene=21)

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/37be4edf79154eca82cd1d43ecc9fe24~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1080&h=792&s=66454&e=jpg&b=fefefe)
