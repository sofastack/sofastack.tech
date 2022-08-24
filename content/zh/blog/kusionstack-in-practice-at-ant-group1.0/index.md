---
title: "KusionStack 在蚂蚁集团的探索实践 (上)"
authorlink: "https://github.com/sofastack"
description: "KusionStack 在蚂蚁集团的探索实践 (上)"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2022-08-23T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*6LWmTJsryI4AAAAAAAAAAAAAARQnAQ"
---

![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*hTloRpjaIwsAAAAAAAAAAAAAARQnAQ)

文｜史贵明（花名：莫城)

蚂蚁集团技术专家

蚂蚁集团多云配置管理系统技术负责人

![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*6LWmTJsryI4AAAAAAAAAAAAAARQnAQ)

云原生基础设施领域，容器服务、配置管理、IaC、PaC、GitOps 等方向

**本文 2369 字 阅读 7 分钟**

**背景**

要讲 Kusion 在蚂蚁集团的实践，我们首先来了解下蚂蚁集团在此之前的配置管理状况。

![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*a72bQaaHmG0AAAAAAAAAAAAAARQnAQ)

如上图所示，图中展示的是在结合 Kusion 之前的应用基线配置管理系统。这里提到的 “应用基线配置” 非应用动态开关，而是注入应用依赖的软件版本、中间件配置、网络数据库等基础设施配置。

从上图可以看到，应用基线管理系统是标准 BS 架构，对用户提供 Console 和 API，历经 6、7 年发展历史，承担起蚂蚁集团历史上绝大多数应用基线配置需求，功能丰富且拥有极其复杂的配置计算能力。目前已经支撑了 15000+ 应用、近 400 项应用配置、50+ 全局配置。

在这个架构下，最上层用户通过表单或者集成系统 API 来与系统交互，以 RDBMS 为存储介质，将应用的配置以类 Key-Value 形式存储。能力层主要包含通用的角色管理、认证鉴权、版本与配置审计等通用能力，还提供模板化的方式来计算应用配置，如将 Deployment 模板化，最终将用户的基线配置渲染为 Deployment，同时模板与基线配置都存在非常复杂而又灵活的继承能力，举个例子，可以给应用配置 Zone_（逻辑机房）_级别的基线，也可以配置环境级别的基线，或者应用级别的基线，前者可以继承后者，就像子类和父类的集成关系。

除了应用本身的基线配置，同时也管理了全局配置，如全局的 DNS 配置、Load Balance、网路配置等等。这个架构非常经典，并且有效支持了历史上各种配置需求及各种 618、双 11 等场景，这些都是毋庸置疑的。**但是随着蚂蚁集团云原生化进程的推进，上面的经典架构也逐渐出现一些瓶颈。** 不知道大家对于这种架构的配置管理，或者架构有没有遇到这样的问题？我来举几个例子：

● **灵活性：** 业务越来越多，应用的基础设施配置也更加的灵活，各种定制化需求越来越多，原有架构主要解决标准应用的场景和通用场景；

● **开放性：** 基线系统的核心能力主要代码在 PaaS 同学这边负责，对于多种多样的需求需要内部排期支持，开放性不足，无法复用和沉淀强大的 SRE 团队的经验；

● **透明性：** 配置计算黑盒，很多配置的计算逻辑都 hardcoding 在代码中，一个配置的变更最终会影响什么、影响有多大无法确定。比如修改了全局 sidecar 版本，导致线上应用批量异常。

**业界对标**

带着上面这些问题，我们在业界做了一些对标和学习:

1.在 Google的《The Site Reliability Workbook》这本书中，Google 同学从自身的实践中总结出一些常见问题，其中非常重要的一点是：**在做配置管理过程中，没有意识到，大规模配置管理问题的本质是编程语言问题。**配置需求的声明、校验都可以通过语言来解决。

![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*UypxQboOiFQAAAAAAAAAAAAAARQnAQ)

2.从 Google 自身的实践来讲，K8s 是基于 Google 多年大规模集群管理经验贡献的开源产品，但是其内部主要使用的是 Borg，Borg 团队是在 Borg master 之上研发的，Borg 接入的三件套分别是：

● **BCL：** 用户通过编写 BCL 代码实现对基础设施需要的配置；

● **Borgcfg：** 通过 Borgcfg 将配置执行到 Borg 集群；

● **Webconsole：** 通过 Webconsole 查看发布情况。

经过调研，我们了解到 Google 大量的运维能力、产品、质量生态都是基于上述三件套演进多年。

基于上述的一些总结，我们推演出类 Borg 的思路来解决蚂蚁集团的基础设施配置管理，我们尝试用语言和工具及服务实现蚂蚁集团下一代配置管理架构。

**下一代配置管理架构**

![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*u3weRKyr63cAAAAAAAAAAAAAARQnAQ)

在这个新的架构下，我们可以看到整体架构不仅仅是一个简单的 BS 架构，配置的用户界面也从浏览器 Form 表单演进为中央开放配置大库。而配置大库所使用的就是 Kusion，Kusion 的用户使用前面的同学已经讲过了，对于配置大库本身的技术细节我不做过多的展开，这里强调的是大库在设计上支持多站点交付的架构。

**新配置管理架构主要分为以下几个特点：**

● 基于配置代码化理念抽象建设统一的应用配置模型，沉淀可重用模型组件，实现配置代码一次编写多站点可迁移。抽象领域模型：Stack 是配置的最小集合，Project 是一组 Stack 的抽象，不仅囊括 App 的应用基线配置, 也支持其他如 DataBase 配置、负载均衡配置，甚至 Network Policy 等非应用配置。

● 通过策略控制器机制，创建与组织独特的安全性，合规性和治理要求相对应的防护规则。

● 声明式自动化，持续监控运行状态并确保符合 Git 中定义的期望状态。

**应用发布案例**

接下来结合一个具体产品案例做阐述，在这个案例中以应用迭代发布为例：

![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*lgzVQK5R_AEAAAAAAAAAAAAAARQnAQ)

1.用户在业务迭代中，修改业务代码、提交代码、CI 测试、构建镜像，并将构建的镜像推送到远程镜像中心。然后通过配置管理服务层——这里是 auto-image-updater 组件——自动将配置更新到配置大库对应的配置文件中。

2.触发大库的变更扫描、测试、审核等一些列的质保手段，同时触发一次应用发布流程，应用发布流程是具有风险体系的、可视化的发布流程，包括推进流程要从预发、仿真、灰度逐步推进，最后进入生产环境。

在每个推进阶段，需要从配置大库获取到配置代码并同时使用配置管理服务层获取 KCL 的编译结果，也就是 Spec 模型，然后通过产品化方式将 Spec 与生产环境中真实的 Runtime 进行“Live Diff”以供参与人更好地识别变更内容和变更范围，然后以分组发布等具有风险防控的手段变更到对应环境，如 apply 到 K8s 集群。

3.我们看下过程中的具体可视化产品，可以看到发布进度、应用配置的 Diff，以及可以看到历史版本的配置。

![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*lgzVQK5R_AEAAAAAAAAAAAAAARQnAQ)

**问题与展望**

回顾下我们开始提到的几个问题：

**1. 灵活性：** 即对各种灵活定制化需求的支持; 

**2. 开放性：** 通过 KCL 语言及开放配置大库，用户的基础设施配置通过新的用户界面即可自主完成，不需要等待配置管理平台开发人员进行开发；

**3. 透明性：** 变更过程可以通过产品化的“Live Diff”来识别变更风险；

我们通过上述的一些探索，一定程度上解决了蚂蚁集团在推进云原生进程中的问题，过程中也遇到了方方面面的困难，比如如何从老架构切换到新架构？架构代际演进时新老系统并存问题是必须要解决的，可以通过如双写等方式解决。**在新架构下更值得探讨的有如下问题，全局配置如何管理以及如何更好的扩展配置的维度。**

![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*HExKRrVbENkAAAAAAAAAAAAAARQnAQ)

站点的全局配置，在老的基线配置的全局配置不仅仅是简单的 Key-Value， 在使用上是非常复杂的，比如 DNSConfig 配置，按照租户、环境、Zone 等做了不同的优先级编排，对于这些的描述比较复杂，使用 KCL 描述如此复杂的配置很困难。

针对于配置的继承和扩展，以 APP 基线配置为例，目前更多的是支持应用和应用环境级别的配置，针对 Zone 等细粒度的配置需要在 KCL 代码中通过写 if else 来实现，这对于其他粒度的扩展及通过 API 自动化都带来新的难题。

对于这些问题内部有一些方案，期望在后续的开放性讨论中与大家持续交流。

**相关链接**

**Kusion 工具链和引擎：** *[http://github.com/KusionStack/kusion](http://github.com/KusionStack/kusion)*

**Kusion 模型库：** *[http://github.com/KusionStack/konfig](http://github.com/KusionStack/konfig)*

**Roadmap：** *[http://KusionStack.io/docs/governance/intro/roadmap](http://KusionStack.io/docs/governance/intro/roadmap)*

**了解更多**

**KusionStack Star 一下✨：** *[https://github.com/KusionStack/Kusion](https://github.com/KusionStack/Kusion)*

**本周推荐阅读**

[KCL：声明式的云原生配置策略语言](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247491634&idx=1&sn=8359805abd97c598c058c6b5ad573d0d&chksm=faa30fe8cdd486fe421da66237bdacb11d83c956b087823808ddaaff52c1b1900c02dbf80c07&scene=21)

[KusionStack 开源｜Kusion 模型库和工具链的探索实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247512283&idx=1&sn=b1a6218e9c396749846baaa9b6b38a2d&chksm=faa35f01cdd4d6177f00938c93b0c652533da148e5ecb888280205525f0e89e4636d010b64ee&scene=21&token=95908034&lang=zh_CN)

[精彩回顾｜KusionStack 开源啦～](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247509944&idx=1&sn=e0e45403aa4fab624a2147bae6397154&chksm=faa34862cdd4c1747bd6a419c4eb2c2cd0244d9587179aabbbf246946ed28a83636ab9cedc86&scene=21&token=95908034&lang=zh_CN)

[KusionStack 开源有感｜历时两年，打破“隔行如隔山”困境](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247510766&idx=1&sn=16d7ab76854829ee64211dd6b9f6915c&chksm=faa34534cdd4cc223422efda8872757cb2deb73d22fe1067e9153d4b4f28508481b85649e444&scene=21&token=95908034&lang=zh_CN)

**欢迎扫码关注我们的公众号**

![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*OvOsRLqjPgQAAAAAAAAAAAAAARQnAQ)

