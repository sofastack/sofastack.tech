---
title: "铺天盖地的「云原生」究竟是什么？"
author: "togettoyou"
authorlink: "https://github.com/sofastack"
description: "铺天盖地的「云原生」究竟是什么？"
categories: "SOFA STACK"
tags: ["SOFA STACK"]
date: 2021-11-09T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ"
---

📄

文｜**togettoyou**

目前主要负责云原生服务管理平台的研发

日常致力于 Go 、云原生领域

本文 **3164** 字 阅读 **5** 分钟

▼

**云原生**似乎已经是一个老生常谈的概念了，相关的文章层出不穷。

本人现在工作中负责云原生服务管理平台的研发（主要管理各类云原生基础设施，平台服务和第三方托管应用），但即便如此，常被问起云原生是什么时，我也很难简洁的向人表述清楚，导致自我也经常问一遍，云原生究竟是什么，我又在做什么。

### PART. 1 云原生究竟是什么

云原生是一个组合词，即 **Cloud Native** 。

Pivotal（已被 VMware 收购）官网的 **What is cloud native?**[1] 一文中提到云原生是一种构建和运行应用程序的方法，**云原生开发融合了 DevOps、持续交付、微服务和容器的概念在里面**。

CNCF（云原生计算基金会）在 **cncf/toc**[2] 给出了云原生 V1.0 的定义：

*云原生技术有利于各组织在公有云、私有云和混合云等新型动态环境中，构建和运行可弹性扩展的应用。云原生的代表技术包括容器、服务网格、微服务、不可变基础设施和声明式 API。*

*这些技术能够构建容错性好、易于管理和便于观察的松耦合系统。结合可靠的自动化手段，云原生技术使工程师能够轻松地对系统作出频繁和可预测的重大变更。*

*云原生计算基金会（CNCF）致力于培育和维护一个厂商中立的开源生态系统，来推广云原生技术。我们通过将最前沿的模式民主化，让这些创新为大众所用。*

结合官方的定义，我个人对云原生简洁的理解就是：**云原生并不是某种具体技术，而是一类思想的集合，用来帮助快速构建和运行应用程序，其中既涵盖着一整套技术体系**（容器、服务网格、微服务、不可变基础设施和声明式 API），**也包含着应用开发的管理要点**（DevOps、持续交付、康威定律[3]），**只要符合这类思想的应用就可以称为云原生应用。**

![图片](https://gw.alipayobjects.com/zos/bmw-prod/a3ef8103-db8d-45c2-b6c2-4482050ee0ac.webp)

### PART. 2 云原生技术体系

云原生的一整套技术体系其实是紧密联系的，这得从软件架构的逐步演进说起。

即 ：**单体 -> 微服务 -> 基于 K8s 上的微服务 -> 服务网格** 

单体架构，将所有的功能集成在一个工程里，项目发展早期，应用的开发相对简单，即使需要对应用进行大规模更改、测试、部署也很容易，甚至是横向扩展。运行多个实例后，一个负载均衡器就可以搞定。

随着时间推移，一个成功的应用必然变得越来越臃肿，代码库随之膨胀，团队管理成本不断提高，即俗话说的陷入单体地狱。面对单体地狱，开发者难以理解代码全部，开发速度变缓慢，部署周期变长，而且横向扩展也会遇到挑战，因为应用不同模块对资源的需求是互相冲突的，有些可能需要的是更大内存，有些可能需要的是高性能 CPU，作为单体应用，就必须都满足这些需求。

当出现一个问题，自然会有针对该问题的解决方案，云原生技术体系之一的**微服务架构**就是针对单体地狱的解决方案。既然单体应用是将全部功能都集成在一个工程里去编译部署，那现在只要把各个功能拆分出来（通常是根据**业务能力**或者根据**子域**分解，子域围绕 **DDD** 来组织服务），将每个拆分的模块作为一个单独的服务，独立部署（服务之间通常通过 **REST+JSON** 或 **gRPC+ProtoBuf** 进行通信），使这一个个的服务共同提供整个应用的功能。

但微服务也不是银弹，引入微服务架构后，分布式系统也带来了各种复杂性。诸如配置中心、服务发现、网关、负载均衡等业务无关的基础设施层面都需要开发者自行在业务层面实现。

比如一个常见的微服务架构解决方案（图源**凤凰架构**[4]），就需要开发者自行引入各种组件:

![图片](https://gw.alipayobjects.com/zos/bmw-prod/0828f31d-e122-46bf-8b39-51dc51291e64.webp)

项目开发完成后终归要到部署流程的，早期的传统做法是把应用程序直接部署到服务器上，但服务器的系统、环境变量等是会不断变化的，甚至安装了新的应用，就会引起和其他应用的冲突，导致应用本身需要跟着用户系统环境的改变而做出改变。为了解决这个问题，不可变**基础设施**的口号就喊响了。

- 第一阶段是将服务部署为虚拟机，将作为虚拟机镜像打包的服务部署到生产环境中，每一个服务实例都是一个虚拟机。
- 第二阶段，为了减少开销，将服务部署为**容器**，作为容器镜像打包的服务部署到生产环境中，这样每一个服务实例都是一个容器。

不可变基础设施：

*任何基础设施的实例一旦创建之后变为只读状态，如需要修改或升级，需要使用新的实例替换旧的。容器镜像就是一种不可变基础设施的具体实现。*

现在容器已然成为了微服务的好搭档，服务实例隔离，资源也可以方便控制，但成千上百的容器，管理起来过于麻烦。于是，容器编排工具又出来了，**Kubernetes** 目前基本统一了容器编排的市场，实现了容器集群的自动化部署、扩缩容和维护等功能。但 Kubernetes 可不只局限于容器编排，上文的微服务架构中，需要开发者自行在应用层面解决业务无关的基础设施层面的一系列问题，现在 Kubernetes 就可以解决大部分，如图（图源**凤凰架构**[5]）：

![图片](https://gw.alipayobjects.com/zos/bmw-prod/fd4f0142-4542-4b39-9a4b-69f7a33dfd10.webp)

Kubernetes 的编码方式其实就是一种**声明式 API**（指通过向工具描述自己想要让事物达到的目标状态，然后由这个工具内部去计算如何令这个事物达到目标状态）。

目前为止，我已经提到了云原生技术体系中容器、服务网格、微服务、不可变基础设施和声明式 API 里面的四种了，还有一个**服务网格**。

一步步发展下来，都是为了把**业务和基础设施解耦** ，让开发者可以快速开发自己的业务，无需关心底层基础设施。服务网格也是想干这事的，希望将更多业务无关的功能下沉到基础设施，号称微服务 2.0 。

服务网格核心在于将客户端 SDK 剥离，以 Proxy 组件方式独立进程运行，每个服务都额外部署这个 Proxy 组件，所有出站入站的流量都通过该组件进行处理和转发，这个组件被称为 Sidecar（边车应用）。

Sidecar 只负责网络通信，还需要有个组件来统一管理所有 Sidecar 的配置。在服务网格中，负责配置管理的部分叫控制平面（control plane），负责网络通信的部分叫数据平面（data plane）。数据平面和控制平面一起构成了服务网格的基本架构。

![图片](https://gw.alipayobjects.com/zos/bmw-prod/6cf725c8-08c9-4c83-86e7-db010ee4964a.webp)

听说再更进一步就是无服务（Serverless）了。

**「云原生管理要点」**

DevOps（Development 和 Operations 的组合词）是一组过程、方法与系统的统称，用于促进开发（应用程序/软件工程）、技术运营和质量保障（QA）部门之间的沟通、协作与整合。

——百度百科

DevOps 的两个核心理念是 CI（持续集成）和 CD（持续交付/部署）。

**「结 尾」**

感谢阅读到这里，本文较为粗糙的描述了云原生作为一种思想，其技术体系之间的联系，如果有误欢迎探讨和指正！

**「参考资料」**

[1] **What is cloud native?:** 

[https://tanzu.vmware.com/cloud-native](https://tanzu.vmware.com/cloud-native)

[2 ] **cncf/toc:**

[https://github.com/cncf/toc/blob/main/DEFINITION.md](https://github.com/cncf/toc/blob/main/DEFINITION.md)

[3] **康威定律:**

[https://zh.wikipedia.org/zhmy/%E5%BA%B7%E5%A8%81%E5%AE%9A%E5%BE%8B](https://zh.wikipedia.org/zhmy/%E5%BA%B7%E5%A8%81%E5%AE%9A%E5%BE%8B)

[4] **凤凰架构:**

[http://icyfenix.cn/exploration/projects/microservice_arch_springcloud.html](http://icyfenix.cn/exploration/projects/microservice_arch_springcloud.html)

[5] **凤凰架构:**

[http://icyfenix.cn/exploration/projects/microservice_arch_kubernetes.html](http://icyfenix.cn/exploration/projects/microservice_arch_kubernetes.html)

  ***\本周推荐阅读\***

[如何在生产环境排查 Rust 内存占用过高问题](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247497371&idx=1&sn=8b98f9a7dad0ac99d77c45d12db626be&chksm=faa31941cdd49057ec6aa23b5541e0b1ce49574808f55068a0b3c0bc829ef281c47cfba53f59&scene=21)

[新一代日志型系统在 SOFAJRaft 中的应用](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247497065&idx=1&sn=41cc54dbca1f9bb1d2e50dbd181f062d&chksm=faa31ab3cdd493a52bac26736b2d66c9fcda77c6591048ae758f9663ded0a1a068947a8488ab&scene=21)

[终于！SOFATracer  完成了它的链路可视化之旅](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247496554&idx=1&sn=b6c292ee9b983a2344f2929390fe15c4&chksm=faa31cb0cdd495a6770720e631ff338e435998f294145da18c04bf34b82e49d2f028687cad7f&scene=21)

[蚂蚁集团技术风险代码化平台实践（MaaS）](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247495808&idx=1&sn=88246170520e1e3942f069a559200ea4&chksm=faa31f5acdd4964c877ccf2a5ef27e3c9acd104787341e43b2d4c01bed01c91f310262fb0ec4&scene=21)

![图片](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*gT8sT7fFmNoAAAAAAAAAAAAAARQnAQ)
