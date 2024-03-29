---
title: "SOFAServerless 体系助力业务极速研发"
author: "赵真灵、刘晶"
description: "SOFAServerless 体系助力业务极速研发"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2022-05-10T15:00:00+08:00
cover: "https://oscimg.oschina.net/oscnet/up-4b32f58df2c03b26ef4258950210a51f421.png"
---

文｜赵真灵（花名：有济）蚂蚁集团技术专家、刘晶（花名：飞廉）   蚂蚁集团技术专家

以下内容整理自 SOFAStack 四周年的分享

**本文 5332 字 阅读 10 分钟**

SOFAServerless 研发运维平台是蚂蚁集团随着业务发展、研发运维的复杂性和成本不断增加的情况下，为帮助应用又快又稳地迭代而研发。从细化研发运维粒度和屏蔽基础设施的角度出发，演进出的一套解决方案。

核心方式是通过类隔离和热部署技术，将应用从代码结构和开发者阵型拆分为两个层次：业务模块和基座，基座为业务模块提供计算环境并屏蔽基础设施，模块开发者不感知机器、容量等基础设施，专注于业务研发帮助业务快速向前发展。

## PART. 1 背 景

当前 Serverless 的发展有两个演进方向，一个是从面向**函数计算的架构往在线应用**演进，另一种是面向**在线应用的架构往类函数计算**方向演进。

SOFAServerless 体系选择了后者，是从面向应用研发运维过程中遇到的一些问题展开的。在应用架构领域，不可避免的问题是应用随着业务的复杂度不断增加，研发运维的过程中的问题会不断暴露出来。

首先我们先看一下对于普通应用，研发和运维过程中的流程是什么样的？

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ccfabcaa89ba4cb1a8c62012de8f5c76~tplv-k3u1fbpfcp-zoom-1.image)

如图所示，从需求到设计、开发、线下测试，再到发布线上的研发运维不断反馈、循环迭代的过程。可以简化为开发同学提交代码到代码仓库，在线下做并行的验证测试，测试通过之后在线上发布，发布过程是串行的，只能够有一个发布窗口，这样的过程在应用体量业务还不太复杂的情况下问题，并不是很明显。

但当业务复杂度不断增加，普通应用迭代过程在会出现一些新的问题，如下图：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4a0532215be74967808b3ceaa22495fe~tplv-k3u1fbpfcp-zoom-1.image)

**1.管理成本高**：需求管理、代码管理、人员管理

**2.时间成本高**：线上验证与发布互相阻塞；单次启动慢

**3.变更风险高：** 一次变更涉及所有代码；一次变更涉及所有机器

**4.可扩展性不够**

另外，由于这些问题是因为多业务单元与研发任务耦合在某些单点上导致的，这些研发运维的成本随着业务的复杂度，呈现出指数增长的特点。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e2b07015a1d644f2a6475dddaf8349e1~tplv-k3u1fbpfcp-zoom-1.image)

## PART. 2 SOFAServerless 研发运维体系

**解决方案介绍**

对于这些问题，业界已经发展并演进出了多种应用架构，从单体架构 -> 垂直架构 -> SOA 架构 -> 分布式微服务架构 -> 服务网格架构等，我们分析这些演进过程为解决遇到的研发运维问题提出 SOFAServerless 研发运维体系，主要的核心思路是：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8a030d5871d94507b17e0d6c57fd4f0a~tplv-k3u1fbpfcp-zoom-1.image)

1.  **研发运维力度的细化**

通过细化的方式，让多人协作之间不互相 block；

迭代的范围变小，速度变快。

2.  **屏蔽基础设施**

屏蔽基础设施，让业务开发同学只关注代码服务和流量。

对于这两点，我们采用了 SOFAArk ClassLoader 类隔离和热部署能力，将应用拆分成基座和模块。

### 基座和模块

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/52849b5c3d2c4145affbd01a32f71d54~tplv-k3u1fbpfcp-zoom-1.image)

从这张图里面可以看到我们拆分的形态，把一个普通的 JVM 应用拆出多个模块，进一步对模块进行了一些分工：基座和模块，对应的研发人员也分为基座开发者和模块开发者。

基座沉淀通用的逻辑，为模块提供计算和环境，并会模块开发者屏蔽基础设施，让模块开发者不需要关心容量、资源、环境。各个模块是独立的代码仓库，可以进行独立的研发运维，这样研发运维粒度得到细化，并且由于基座为模块屏蔽了环境与基础设施，模块开发者可以专注业务开发，提高整体效率。

### 如何共享和通信

应用如果只是做拆分，没有共享和通信能力是不完整的方案也难以解决实际问题。对于共享和通信，基座作为共享的一层，能帮模块预热 RPC 数据库缓存通用类、通用方法、通用逻辑，可以供安装一些模块去复用。这样模块实现的比较轻，所以模块的部署密度也可以做得很高。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1f0d3e7661724ce2ba8a0fb14adae4d0~tplv-k3u1fbpfcp-zoom-1.image)

对于模块通信，当前模块之间的通信可以支持任意的通信方式，比如说基座调模块、模块调基座模块和模块之间调用。由于模块通信是 JVM 内跨 ClassLoader 调用，与普通 JVM 内方法调用增加了序列化与反序列化的开销，目前这部分开销已经优化到约等于 JVM 内部的方法调用。

在这一能力建设之后，可以较大降低模块的接入改造成本并扩大可适用的业务范围。

### 如何解决业务痛点

**管理成本**

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4dd6c4510b0547d3a84ce69fadeca86f~tplv-k3u1fbpfcp-zoom-1.image)

相较于原来的研发模式，研发人员拆分成不同小组，代码仓库也拆分出多个模块仓库，并且可以独立并行的发布到线上，整个 pipelien 都可以做到独立进行。

如此一来，需求管理、代码管理、人员管理的成本就得到下降了，线上发布过程中也不会再有互相阻塞的问题存在。

当然这些成本下降不代表这些问题完全没有了，只是从原来的指数增长转变成了这种线性增长。随业务的复杂度不断增加，它的收益会更加的明显。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/40cc57ca534c4dc79a09ffe47fc91ae6~tplv-k3u1fbpfcp-zoom-1.image)

### 时间成本

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/979015e331ab4823829ea08ac8360745~tplv-k3u1fbpfcp-zoom-1.image)

相对于普通应用的镜像构建需要 3 分钟，发布需要镜像下载、启动、挂载流量大概 3 分钟，总共平均需要 6 分钟；模块构建只需要 10 秒，启动大概 1~10 秒 **（模块大小可大可小，对于较小的模块，速度可以做到毫秒级别）** 。

把一次发布耗时从原来的 6 分钟下降到 15 秒，一次迭代从原来 2 周下降到了 2 天，最快可以 5 分钟上线的。

### 可扩展性

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1836102237ca4d41bd35d10c8b196adc~tplv-k3u1fbpfcp-zoom-1.image)

对于线上集群的部署形态，不同的机器上部署的模块不尽相同。例如对于模块 1，只安装在了第一第二台机器上，那么模块升级时只会涉及到这两台机器本身，变更的机器范围就比较小了。另外，模块 1 如果要扩容的话，可以从集群内筛选出较空闲的机器进行模块热部署即可，一般也就是 10s 级别，所以能做大快速的水平扩展能力。

### 变更风险

对于一次模块的升级变更，只会涉及模块自身的代码本身不会设计整个应用代码。模块变更需要更新的机器也只是模块安装过的机器本身，不会涉及到整个集群，所以变更范围大大缩小，变更风险也相较普通应用能得到明显减少。

### 高可用和配套能力

SOFAServerless 体系在解决业务研发运维痛点基础上，建设了高可用和配套的能力。

### 资源隔离

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/776ff8fc9b954731a9f32aeaec540625~tplv-k3u1fbpfcp-zoom-1.image)

资源隔离体现在单个 JVM 内部的，这里采用了我们公司内部 AliJDK 多租户隔离能力，每一个模块可以指定自己的资源使用的上限。

比如说，其中一个模块的逻辑有一些问题，消耗的资源比较大，不会影响到其他的模块，相当于得到了故障的隔离。

### 流量隔离能力

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a02fda7858c4446d8be68df59f4ecc1e~tplv-k3u1fbpfcp-zoom-1.image)

对于单个集群内部，我们做了一些精细化的流量路由。主要是因为发服务时能够动态增加 tag，流量路由时能够配一些规则，推送到 MOSN、Layotto 里，能让流量根据对应的 tag 进行一些精细化路由，这样就具备了流量的精细化路由和流量隔离能力。

### 可观测性能力与变更防御能力

具备模块粒度的健康检查、资源监控、日志监控还有排障能力，在此基础上建设模块粒度的变更防御。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/046a1bddbb9444a6a14474e1878e0def~tplv-k3u1fbpfcp-zoom-1.image)

一个模块可以同时存在多个版本，可以做一些快速的 A/B 测试、灰度、回滚这些能力。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b6395a67c6064d4599766ff89af8063e~tplv-k3u1fbpfcp-zoom-1.image)

## PART. 3 业务的落地形态**

SOFAServerless 发展到现在，已经在蚂蚁内部接入了 700 多个 Java、nodejs 应用，基本涵盖了蚂蚁所有业务线，支撑了 1 万多次的完整的生产研发迭代。线下可以做到秒级发布，支付宝应用内很多业务就是跑在 SOFAServerless 上的，比如投放展位、公益游戏、营销玩法。

去年 SOFAServerless 成功支撑了 618、双 12、五福等重量级大促和活动，经受住了大流量高并发场景下的考验，托管在 SOFAServerless 的资源规模峰值在 22 万核左右。

SOFAArk 的核心能力有两个：

**一、把应用拆分成更细粒度的基座和模块**

各自生命周期独立，研发运维操作解耦，提高协作效率。

**二、分离了『代码部署』、『服务注册』**

实现了类似 FaaS 触发器的概念，即可以先安装模块，但不发布任何服务，而是在运行时接收指令，动态完成服务的发布/注销，整个过程不需要代码改动、应用重启，耗时只有几秒。

这样一来，『服务』自身变成了独立灵活轻量的运维单元，业务可以按需快速『拆分』服务，围绕『服务』进行更精细化的治理，比如将一个流量大的服务按来源拆成多个小服务隔离部署，或将一些次要的、离线的服务从原来应用中拆出来，专门部署到一个集群，避免影响线上正式业务。如果基于之前『应用』的研发运维模型要实现上述效果是相当繁琐的，可能还会涉及到代码变更，而现在成本大大下降，业务同学只需在界面上简单配置一下即可。

基于这两个能力，不同的业务的落地形态是不一样的。根据我们的经验，一般来说有三种，从简单到复杂依次是：『代码片段』、『模块应用』和『中台型业务』。

在职责划分、研发流程上均有较大差异。 

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f9c9f18727974b71b0737490031500d6~tplv-k3u1fbpfcp-zoom-1.image)

**代码片段**

这种形态下模块非常简单，极简情况下可能只有一小段代码、一个类，承载一小段计算逻辑。基座对外暴露统一接口，所有流量进来之后会先由基座承载，进而分发到不同模块执行。同时基座还会提供一些通用的底层能力供模块调用。这种形态和目前主流 FaaS 产品比较接近，适合形态比较简单的业务，如计算型业务、BFF，它的研发流程相对比较简单，甚至可能没有迭代的概念，可以随时改动测试一把，立马发布上线。 

**模块应用**

顾名思义，每个模块独立承载一个稍微复杂、比较独立的业务，直接对外提供服务。基座一般不暴露服务，只为上层模块提供基础能力。模块应用适合同一个业务域内的多个小业务，大量的底层能力可以共享。研发模式上跟传统应用类似，只不过研发对象变成了轻量的模块，而不是一整个大的应用。不同模块之间的研发流程完全解耦，避免了发布卡点、等待、环境抢占等协作上的问题。

**中台型业务**

模块不会直接对外提供服务，只会提供原子组件，组件是对基座暴露的扩展点的实现。基座会承接所有的流量，通过统一的对外接口暴露服务，收到调用后再串联编排模块里的组件，完成一次完整的业务逻辑的执行。

中台业务是目前最复杂的形态，一方面它需要模块成组做发布运维，业务和模块是多对多关系，研发过程中涉及到多个模块同时发布、一个模块同时发布到多个业务，需要好好设计相关流程体验；另一方面它用到了动态拆分服务的特性，不同业务基于基座提供的同一套接口，各自独立发布服务。

## PART. 4 案例-模块应用-社交游戏

社交游戏是模块应用的典型案例，模块承载不同的小游戏，具有不同的生命周期，业务上可以快速试错频繁迭代，又不会互相影响。不同游戏通用的逻辑、基础设施下沉到基座，比如通用模型、统一的存储依赖/下游依赖、事件驱动框架等等，相对稳定，迭代较慢。资源层面每个小游戏有一套独立集群部署，集群内的 Pod 不会安装其他模块。

模块应用不管从研发还是运维层面，都相对简单。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ede06697bbab42439f0c0aaeb880d6e9~tplv-k3u1fbpfcp-zoom-1.image)

## PART. 5 案例-中台业务-营销玩法

营销玩法是一个典型的中台系统，它负责营销整个支付宝 APP 内的日常、大促的营销活动，整体架构如下：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d802058f5ef54352930a444d63493d9e~tplv-k3u1fbpfcp-zoom-1.image)

从下往上看，基座除了提供营销相关的通用服务，最核心的是流程引擎，它根据一笔调用的业务属性定位到对应流程模板，编排模块内的组件执行。模块按玩法组织，提供原子组件，由不同的业务团队开发，其中通用模块是中台同学维护的，提供不同玩法都可能会用到的通用组件，这样划分下来模块变得非常轻量，构建后的 Jar 小于 1M，启动时间 5s 内。

最后，上层业务按需要将多个模块组合起来，并通过基座的统一接口发布自己的服务。

以『助力玩法』为例，它需要的组件由助力玩法模块、通用模块提供，同时会基于基座提供的接口 *（PlayTriggerFacade）* 发布打上了『助力玩法』标签的 RPC 服务。更具体一点，当我们发布『助力玩法』这个业务时，可以简单理解成将助力玩法、通用模块两个模块安装到基座上，再推送指令给基座，发布带有『助力玩法』标签的 RPC 服务。

一旦我们在研发、服务层面，按照业务进行了拆分，就可以很方便地做业务之间的资源隔离和资源调度。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d01aceeea6ab467ba952ed6b6102b4d1~tplv-k3u1fbpfcp-zoom-1.image)

线上划分两个业务集群，『网商银行集群』只安装网商助力玩法相关模块，发布网商助力玩法的服务，『日常营销集群』则部署夏至玩法、翻牌玩法两个业务。

同时我们在上游应用的 sidecar *（MOSN）* 里实现了业务解参和服务路由能力，这样上游调用时看到的是统一的 PlayTriggerFacade 接口，不用任何代码改造。但最终在 MOSN 按配置的业务规则，将流量正确路由到玩法中台相应集群。

Ark 技术栈下，集群间的资源腾挪是个很轻量的操作。如果要从『网商银行集群』腾挪 Pod 到『日常营销集群』，不需要重启进程，只需要将 Pod 上的模块、服务都卸载掉变成空基座，更改 Pod 和集群的归属关系，再将新模块、服务部署上去即可，整个过程耗时在 10s 内。如果的确需要从 0 到 1 拉起新 Pod，我们也提供了一个 buffer 池来绕过基座重启的耗时，集群缩容的资源会先进入 buffer 池，并不直接销毁，其他集群扩容时可以直接从 buffer 池借调资源。

目前集群伸缩需要人工决策和触发，还不够智能。**今年，我们会重点建设自动化弹性伸缩、非对等部署模式、机器冷启动优化等能力**，让业务只关注服务的实例数和伸缩策略，提供更 Serverless 的体验。

玩法中台双 12 期间完全接入了 SOFAServerless，从大促研发开始到活动结束，相关模块线上发布 15 次，线下发布了 737 次，平均耗时小于 10 秒，做到了『改完即发，发完即测』，这对业务的开发联调是一个极大的提效。同时整个研发周期内只改动了双 12 玩法相关的模块，对其他玩法没有影响。

## PART. 6 总结 

最后再简单总结一下 SOFAServerless 相对其他 Serverless 产品的核心技术优势：

**1.迁移成本低** 

普通的 SOFABoot、SpringBoot 应用只需增加一些 starter 依赖即可接入 SOFAServerless 体系，拥有热部署模块、动态发布服务的能力，而如果要将存量 Java 应用迁移到其他 FaaS 产品，将面临极大的改造成本；

**2.进程内多模块合并部署的形态，更适合表达复杂业务逻辑**

**3.秒级研发部署，通信开销几乎零增加，部署密度更高，成本降低**

相对其他 Serverless 产品，我们实现了进程内多模块的合并部署，并没有采用 1 Pod 1 模块的方式，好处是模块间是进程内通信，无通信开销，拆分后一笔调用可能涉及到模块、基座间几十次调用。如果走 Pod 间跨进程通信或者远程 RPC，带来的开销是不可接受的。此外还能做到更高的部署密度，一些长尾、流量很低的业务可以密集地部署到同一批 Pod 上，成本更低；

**4.低成本精细化流量隔离，路由对上游无感** 

可以利用动态发布服务的能力，在不改代码的前提下将原来粗粒度的服务拆的更细，低成本实现业务资源隔离，更精细化地治理流量，而这一切对上游是无感的，无需任何改造。

## SOFAArk 关于开源

SOFAArk 2.0 框架已经发布了，相对于 1.0 我们在 ClassLoader 体系、运行时性能、启动速度等诸多方面都做了较大的升级和优化，有兴趣的同学可以访问 GitHub 仓库翻阅源码。

同时 SOFAServerless 整套研发运维体系相关的组件也在逐渐的开源中，我们将在 10 月份落地第一个开源版本，包括 Serverless 管控平台、Ark Scheduler 两个系统。

我们也在积极拥抱开源社区，开源版本将支持 SpringBoot 应用模块化热部署的发布运维能力，能够对接部署在原生 Kubernetes Deployment 之上的基座应用。

最后，希望大家踊跃参与到 SOFAServerless 技术体系的开源能力建设，一起帮助业界应用平滑开启 Serverless 研发体验！

![](https://oscimg.oschina.net/oscnet/up-7f4d032b34a467c3960bc6eaf831b755103.gif)
