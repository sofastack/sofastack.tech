---
title: "KusionStack 开源｜Kusion 模型库和工具链的探索实践"
authorlink: "https://github.com/sofastack"
description: "KusionStack 最早是为了解决蚂蚁内部复杂的运维场景而诞生的解决方案。思路是通过自研的 DSL（KCL）沉淀运维模型（Kusion Model），将基础设施部分能力的使用方式从白屏转为代码化，同时结合 DevOps 工具链（Kusion CLI）实现配置快速验证和生效，以此提升基础设施的开放性和运维效率。"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2022-07-19T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*8_qGTpKAoKkAAAAAAAAAAAAAARQnAQ"
---

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ccda21a048c443bda54fa26f5ba4c33a~tplv-k3u1fbpfcp-zoom-1.image)

文｜杨英明（花名：向野)

KusionStack 核心贡献者、蚂蚁集团高级研发工程师

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/29f5ef0ac52942deb6f535055f0f45df~tplv-k3u1fbpfcp-zoom-1.image)

在基础设施技术领域深耕，专注 IaC/XaC、GitOps 等方向

**本文 4912 字 阅读 12 分钟**

## 前言

KusionStack 最早是为了解决蚂蚁内部复杂的运维场景而诞生的解决方案。思路是通过自研的 DSL *（KCL）* 沉淀运维模型 *（Kusion Model）* ，将基础设施部分能力的使用方式从白屏转为代码化，同时结合 DevOps 工具链 *（Kusion CLI）* 实现配置快速验证和生效，以此提升基础设施的开放性和运维效率。

其中，Kusion Model 就是题中所说的 Kusion 模型库，而 Kusion CLI 就是 Kusion 工具链了。具体概念如下：

### Kusion 模型库

Kusion 模型库是基于 KCL 抽象的配置模型。它的特点包括了开箱即用、用户友好、以及业务抽象。其实模型库最初朴素的出发点就是改善 YAML 用户的编写效率和体验，因为目前其实有不少配置是基于 YAML 描述的，比如 Kubernetes 在成为容器编排的事实标准之后，基于 K8s 的声明式配置就越来越多了起来。

但是由于 K8s 本身的复杂性导致 YAML 配置越来越冗长、复杂。我们希望通过将复杂的配置描述通过 KCL 这门配置语言抽象封装到统一的模型中，从而简化用户侧配置代码的编写。

### Kusion 工具链

Kusion 工具链是基于 KCL 的 DevOps 工具集合，它是用来辅助用户在 Kusion 生态里更好的生成、驱动他们的 KCL 配置。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/de8f81ca78c7417db006c78cecba6864~tplv-k3u1fbpfcp-zoom-1.image)

简单来说，Kusion 模型库是用 KCL 语言沉淀下来的可复用组件，工具链是 Kusion 模型的驱动器。

本文主要介绍 KusionStack 中 Kusion 模型库和工具链在蚂蚁内部的实践探索和总结，重点阐述了如何利用 KusionStack 提升复杂基础设施的开放性和运维效率，希望对同样面临此类困境的伙伴有所启示。

### PART. 1--为什么要做 Kusion 模型库和工具链？

我们可以先来看一张“现象--问题”图：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/db81e985f4934fc59c165a52d82f4d5f~tplv-k3u1fbpfcp-zoom-1.image)

在这张图中，我们列出了一些在内部大规模场景下的实践过程中会遇到的问题。

举个应用部署的例子，应用 A 有 10+ 组件，内部对于这种非标应用没有提供很好的支持，每次部署需要经历繁多的步骤，比如元数据准备、申请证书、VIP、域名、手动部署 CRD、RBAC、Webhook、监控配置等。这个过程没有自动化，交付部署复杂，定制程度高，其中任何一个步骤出现问题，都需要找对应的研发同学沟通，应用部署的人工成本很高。

总体来说，当时蚂蚁内部在大规模场景下利用现有基础设施进行运维的困境，主要就是来源于以上列出的这些现象，所以去解决这些现象背后的问题，成了亟待我们去做的事情。

## PART. 2--困境中的应对思路

经过反复的探讨和一致认同，我们最终摸索出一套解决方案，即通过 Kusion 模型库和工具链，从以下几个方面解决上述复杂基础设施运维困境的问题。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7747bc43fc104fd89d7a8dcc24ac645e~tplv-k3u1fbpfcp-zoom-1.image)

### 可读性

**面向业务 & 屏蔽底层实现**

我们基于 KCL 抽象了 Kusion 模型库，其中包含一些开箱即用的模型，这些模型针对业务进行了抽象和提炼，面向用户的这层模型界面暴露的都是用户关心的属性，一些实现的细节被屏蔽掉了，所以它是面向业务的，也更容易被用户所接受和上手使用。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6e78a46ad81643c6aacda5bafeab45c6~tplv-k3u1fbpfcp-zoom-1.image)

**符合工程直觉**

Kusion 模型库作为用 KCL 编写的模型集合，更加符合工程直觉。因为 KCL 既然作为一门语言，它支持定义变量，编写条件判断，比如你可以通过 if-else 编写一些差异化的配置。

**解决的问题**

本节介绍的可读性的提升主要分为两个方面。一方面是 KCL 这门 KusionStack 自研的配置语言本身足够强的表达力，使得通过 KCL 描述配置和抽象模型更加丝滑；另一方面，使用 KCL 定义的 Kusion Model 封装了复杂的配置转换逻辑，屏蔽业务细节，抽象出清晰易懂的用户界面。这两方面的带来的可读性的优势可以比较好的解决使用传统配置语言维护困难的问题。

### 工程性

**前后端模型解耦**

我们对 Kusion 模型库根据功能，区分了前端模型和后端模型。为什么要区分前端模型和后端模型？直接目的是将「用户界面」和「模型实现」进行分离：

**前端模型**

**前端模型即「用户界面」**。包含平台侧暴露给用户的所有可配置属性，其中省略了一些重复的、可推导的配置，抽象出必要属性暴露给用户。

用户只需要像实例化一个类 *（Class）* 一样，传入必要参数构成一份应用的「配置清单」，再经过工具链编译即可得到完整的面向基础设施的配置描述，比如说 K8s 的 YAML；

**后端模型**

**后端模型是「模型实现」**。后端模型和前端模型不同，是对用户不感知，刚才提到前端模型可以构成用户的配置清单，那么怎么让用户的配置清单生效呢？

我们将属性的渲染逻辑全部下沉到后端模型中，后端模型中可借助 KCL 编写校验、逻辑判断、代码片段复用等逻辑，提高配置代码复用性和健壮性。

**Mixin 复用**

Mixin 是 KCL 提供的一种复用代码片段的方式。举个具体的例子，比如说有个模型的属性叫做超卖，开启超卖开关可以将 Pod 调度到可以超卖的机器当中，应用一般在发布线下环境的时候会开启超卖，以充分利用集群的资源。这段超卖配置生效的逻辑可能会被不同的应用运维模型使用，那么就可以借助 Mixin 机制实现一个 OverQuotaMixin，OverQuotaMixin 可以被不同后端模型引用，解决复用性的问题，无需重复造轮子。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/78a8f14060c54a6a8b2ba056c6c279cd~tplv-k3u1fbpfcp-zoom-1.image)

**AppConfiguration 沉淀**

我们针对不同应用运维场景或者部署场景抽象为不同的应用运维模型，这些应用运维模型我们叫做 AppConfiguration。

它们暴露的属性是不一样的，比如适应于标准基础设施的标准应用模型，适应于网络应用的网络应用模型。这些不同的应用运维模型暴露给用户可配置的属性是不同的，这些模型沉淀下来可以描述越来越多场景的应用运维配置，沉淀为在推动配置代码化过程中重要的资产。

**解决的问题**

本节介绍的是团队在建设蚂蚁的 Kusion 模型库过程中形成的一套最佳实践，它是推动建设 Kusion 模型库和工具链的一站式和开放性的基础。

### 一站式

**全生命周期配置描述 & Single Source of Truth**

我们在完善可读性和工程性的过程中实现了**全生命周期配置描述**。我们将应用的部署配置、网络配置、监控配置等等和应用生命周期相关的配置尽可能的放到了一个模型中。

这样做的好处是，将散落在各个系统的配置片段收集到了一起，用户可以在一个统一界面中维护他的应用配置，同时对于第三方系统，也不需要对接不同系统，他只需要运维一份统一的配置即可。

「全生命周期配置描述」其实在做一件事情，就是业界经常提到的 **Single Source of Truth**，也就是所谓的“唯一真实来源”。这是实现 IaC 的重要前提之一。

从下图可以看到，Kusion 模型库中的前后端模型将不同维度的运维能力通过 KCL 模块化，并灵活组织在各种 AppConfiguration 模型中。同时基于 AppConfiguration 实例化出的配置清单作为业务配置落到配置大库中进行统一运维，最终通过 Kusion 工具链和 PaaS 平台进行配置的快速验证/生效。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/335ce3cb650a4c98b536924e6086f8f6~tplv-k3u1fbpfcp-zoom-1.image)

**CICD**

在内部一些实践中，我们搭建了针对 IaC 配置的流水线。可以参考下面这张图，流水线会对每一次 KCL 配置变更进行依赖分析、单元测试、集成测试、配置代码上传等等步骤，以保证每次用户配置变更的质量和稳定性。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/89b8c30f80ad4131bb26bd99e0551af3~tplv-k3u1fbpfcp-zoom-1.image)

**解决的问题**

借助一站式特性，像我们之前提到的，像配置难以被完整定义、散落在各处，以及应用 A 部署困难的问题就可以得到比较好的解决。

### 开放性

**MonoRepo**

针对之前提到的配置散落在各处的问题，KusionStack 推荐使用配置大库 *（MonoRepo）* 进行集中式的配置管理。

在内部的落地实践中，配置大库不仅存放抽象模型本身的 KCL 定义，还存放各种类型的配置清单。也就是说，主要包含基础配置和业务配置两部分，业务配置比如应用的运维配置、策略配置等。配置大库推荐托管在各类版本控制系统当中，以方便做配置的回滚和漂移检查。

配置大库其实是一种组织配置的方式，可以参考下面这张图，在内部的实践中，是通过架构域、项目、环境等维度组织配置文件。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a95e5608b52a43f899a3020dd0d51a03~tplv-k3u1fbpfcp-zoom-1.image)

其中，应用的业务配置部分可以引用任意基础配置，基础配置之间也可以相互引用。

比如说用户的应用配置是按照环境维度去分发的，每个环境的配置不一样。这其实是一个比较普遍的划分，那基于配置大库和 KCL 本身的特性，就可以做到环境通用配置和环境特有配置的隔离。同时在编译某个具体的环境配置时，借助 KCL 的语法糖，能够做到自动合并配置，并也能支持细粒度的覆盖规则。

**工程规范**

上面提到的工程目录结构的划分其实可以作为一种工程规范的约定，通过工具规范起来。

同时，因为配置大库本身是通过版本控制系统托管起来的，所以可以天然的做到配置代码的变更可评审。同时结合 CICD 系统，将上述工程目录结构检查以及 KCL Linter、Test 工具集成到流水线当中，就可以搭建起一套规范的工作流程。

**协同共建**

基于这些工作，我们可以 involve 更多的人进来共建配置大库，包括应用运维的修改、模型库本身的描述。这些都是对所有人可见，并且可以参与共建的。

下面列了两张图，是不同的开发者在配置大库中评审、交流的截图：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/235b985335984ed19aa4daf9e30268ea~tplv-k3u1fbpfcp-zoom-1.image)![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3e55f6f73e584ec3a903d200698aed9c~tplv-k3u1fbpfcp-zoom-1.image)

**解决的问题**

通过实现了刚刚提到的这几个点，就可以一定程度上将基础设施的能力通过模型层沉淀到配置大库中。

带来的好处可以举个例子，之前想在网络工单上添加一个参数，都要走一个完整的研发迭代，但是现在网络相关的配置和渲染逻辑下沉到模型库后，需求方只需要在配置大库中提交一个后端模型的变更评审，而且这个变更评审仅需通过相关 Owner Review 和所有的流水线检查，就可以完成上线了。

以上提到的几个点可以解决之前提到的基础设施封闭、需求方无法做到自服务的问题，随之而来的，新特性上线时间也会大大缩短。

需要注意的是，配置代码化能在一定程度上释放基础设施的开放性，但它不是银弹，不能解决所有问题。

## PART. 3--Kusion 工具链和引擎架构介绍

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/193b9a089aee4b3688946f6fdd725345~tplv-k3u1fbpfcp-zoom-1.image)

### Kusion 工具链

**一致的工作流**

在 Kusion 工具链中，我们定义了一致的工作流：init -> write -> preview -> apply，来帮助用户管理一份 KCL 代码的生命周期。

比如最开始 KCL 配置是这样来的：

**-** 用户肯定可以自己去编写，不过为了更好的解决这个问题，甚至帮助一些第三方的系统更快的初始化出 KCL 代码，我们提供了脚手架模板仓库和 Kusion Converter。

**-** 脚手架仓库中存储了各种场景中的 KCL 模板，它和 Kusion 工程本身的代码是隔离开的，任何人都可以在这个仓库贡献代码。

Kusion Converter 是为了解决存量配置快速接入 KCL 而诞生的。用户之前可能已经用其它配置语言编写了一些配置代码，那么借助 Kusion Converter 工具集可以一键转换成 KCL 的代码。

**统一视图**

Kusion 工具链也可以比较方便的集成到第三方系统中，做到系统的输出和本地的 Console UI 视图一致。比如开源配置大库中的流水线就集成了 Kusion 工具链，可以在 apply 那一步的流水线日志输出中看到和本地 Console 一样的输出界面。

**生态集成**

目前我们在内部集成了 Kusion 服务化产品、代码服务以及内部的一些加解密服务。对外的生态集成我们也正在建设，目前我们集成了 Github Action、ArgoCD，未来也期待能与更多的平台和开源产品进行结合，帮助大家更好的解决问题。

### Kusion 引擎

Kusion 引擎介于 KCL 与底层基础设施之间，用于解释 KCL 的编译结果，并对底层各种异构基础设置进行操作。

在 Kusion 引擎中，我们充分拥抱了 Terraform 的生态。通过无缝集成 Terraform 生态中的 Provider，可以将配置下发到不同的 Runtime 中，屏蔽基础设施复杂性。

同时 Kusion 引擎也提供了一些精细化的 Resource Lifecycle 管理，比如资源依赖解析等等。

## PART. 4--阶段性成果

首先是我们在内部推广 KusionStack 之后的一些阶段性成果 *（截至 2022.7.15）* ：

**-** 配置大库中针对不同的应用运维场景总共沉淀了 10 多个 AppConfiguration 模型定义，给不同的维护团队去描述他们的应用模型；

**-** 配置大库每天有 100+ 配置变更评审；

**-** 有 300+ 贡献者，涉及 20 多个 BU，这里面包含 SRE、应用 Owner、大库模型研发者等等；

**-** 有 1000 多个 Project ，每个应用都是一个 Project，但是 Project 不仅包含应用，还包含其它类型的配置，比如网络策略，建站配置等；

**-** 配置大库有 10000 多个 MR，50000 多个 Commit，450000 行 KCL 代码 *（里面有相当一部分是机器提交和维护的）* 。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/741acfc6a36447e7b063a562a6f19a84~tplv-k3u1fbpfcp-zoom-1.image)

然后是一些业务效能提升的数据展示：

**-** 单应用 SLO 监控配置生效时间从 1 天缩短至 0.5 小时；

**-** 应用运维需求上线时间从 25 天 缩短至 5 天；

**-** 应用 A 部署时间从 1 个月缩短至 0.5 小时；

**-** 网络相关工单数量由原先的 7 种缩短至 1 种，实现：1 种工单，1 次审批。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6f5eab1ee44e44a68433da15402f70e6~tplv-k3u1fbpfcp-zoom-1.image)

## PART. 5--总结与展望

通过 KusionStack 在蚂蚁内部的推行，我们已经有了一些实践经验，虽然不一定适用所有公司，但对同样面临此类困境的伙伴应该能有所帮助。

KusionStack 一方面要不断解决蚂蚁内部的一些运维问题；另一方面，我们也希望能开阔视野，借助开源这片沃土，拓展出更多场景并持续打磨整个技术栈。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b7b07a7cf94a402a8fac588db0b02c45~tplv-k3u1fbpfcp-zoom-1.image)

KusionStack 目前处于十分早期的开源阶段，还有许多工作是亟待要做的。鉴于我们自身人力有限，只靠我们是很难建设出让所有人都满意的技术方案的。上图是 Kusion 工具链和模型库相关的路线规划以及一些挑战，供大家参考和探讨，欢迎提 issue 和拍砖，谢谢大家！

### 相关链接

**Kusion 工具链和引擎：** *[http://github.com/KusionStack/kusion](http://github.com/KusionStack/kusion)*

**Kusion 模型库：** *[http://github.com/KusionStack/konfig](http://github.com/KusionStack/konfig)*

**Roadmap：** *[http://KusionStack.io/docs/governance/intro/roadmap](http://KusionStack.io/docs/governance/intro/roadmap)*

### 了解更多…

**KusionStack Star 一下✨：** *[https://github.com/KusionStack/Kusion](https://github.com/KusionStack/Kusion)*

KusionStack 的开源，希望能对大家有所帮助，也希望能跟更多朋友共同完善 KusionStack。欢迎对云原生、运维自动化、编程语言、编译器感兴趣的同学一起参与社区共建，在新的技术领域升级方面进行探索和突破，实现更多新的想法。

### 本周推荐阅读

KusionStack 开源有感｜历时两年，打破“隔行如隔山”困境

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b0c56108373d48f8ac981ced8fddeb90~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247510766&idx=1&sn=16d7ab76854829ee64211dd6b9f6915c&chksm=faa34534cdd4cc223422efda8872757cb2deb73d22fe1067e9153d4b4f28508481b85649e444&scene=21)

KCL：声明式的云原生配置策略语言

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/333c7e8e625c4375bd2bc4ee94492897~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247491634&idx=1&sn=8359805abd97c598c058c6b5ad573d0d&chksm=faa30fe8cdd486fe421da66237bdacb11d83c956b087823808ddaaff52c1b1900c02dbf80c07&scene=21)

精彩回顾｜KusionStack 开源啦～

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ad8dae743aad4835b3a592ad841ada34~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247509944&idx=1&sn=e0e45403aa4fab624a2147bae6397154&chksm=faa34862cdd4c1747bd6a419c4eb2c2cd0244d9587179aabbbf246946ed28a83636ab9cedc86&scene=21)

Go 原生插件使用问题全解析

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5f3de7118a3b4f2a9f8163d8a867ebda~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247512138&idx=1&sn=851abb8d07d47f703e33978c9c125c59&chksm=faa35f90cdd4d6869c6cd4934c042484dbe1063c3fb85462d2f33e936b96240ae33d02d18c3a&scene=21)

欢迎扫码关注：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/93133e93978c46a096cd25a4b7620a60~tplv-k3u1fbpfcp-zoom-1.image)
