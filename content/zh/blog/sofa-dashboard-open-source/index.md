---
title: "SOFADashboard 启动开源共建 | SOFAStack 一站式管控平台"
author: "卫恒"
authorlink: "http://www.glmapper.com/"
description: "为了建设更完整的 SOFAStack 微服务体系，我们计划发起 SOFADashboard 项目，计划通过社区的方式共建，将其打造为一站式的 SOFAStack 管控平台。欢迎共建~"
categories: "SOFADashboard"
tags: ["SOFADashboard"]
date: 2019-05-05T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563868284867-44971797-275e-4d71-a20e-bbdc89cba861.png"
---

> **SOFA**Stack 
> **S**calable **O**pen **F**inancial **A**rchitecture Stack 是蚂蚁金服自主研发的金融级分布式架构，包含了构建金融级云原生架构所需的各个组件，是在金融场景里锤炼出来的最佳实践。
> 为了建设更完整的 SOFAStack 微服务体系，我们计划发起 SOFADashboard 项目，计划通过社区的方式共建，将其打造为一站式的 SOFAStack 管控平台。欢迎共建~
> SOFADashboard：[https://github.com/sofastack/sofa-dashboard](https://github.com/sofastack/sofa-dashboard) 

## 背景

从 2018 年 4 月 19 日宣布开源至今，SOFAStack 目前已经开源了包括 SOFABoot、 SOFARPC、SOFALookout、SOFATracer、SOFARegistry 等在内的一系列微服务相关的项目，并投入分布式事务 Seata 进行重要贡献。随着 SOFAStack 架构体系的不断丰富和完善，外部对于 SOFAStack 的管控平台的需求也愈加强烈。

由于 SOFAStack 内部的管控平台依赖众多的内部基础设施，为了建设更完整的 SOFAStack 微服务体系，我们计划发起全新的 SOFADashboard 项目，计划通过社区的方式共建，将其打造为一站式的 SOFAStack 管控平台。

## 能力大图

SOFADashboard 作为一站式 SOFAStack 管控台，希望对 SOFAStack 各个组件的使用等进行统一管理。为此我们为 SOFADashboard 规划一版能力图，包含了微服务里的一些能力点，例如应用信息管理、服务治理、配置管控、动态模块等等。见下图所示：

![SOFADashboard 能力大图](https://cdn.nlark.com/yuque/0/2019/png/230565/1557039574234-9a4e6e5f-647e-4ce6-af0f-17f62185260f.png)

每个能力点对应的实现我们都做了一层抽象。例如服务查看需要从注册中心获取数据，我们封装了一层服务列表获取接口，底层可以是从 Zookeeper 或者 SOFARegistry 等不同的注册中心实现读取服务列表。

## 技术栈选择

为了最大限度的降低开发成本、部署成本及运维成本，SOFADashboard 会基于开源社区优秀的产品来进行开发构建。经过讨论，最终选择社区主流的前后端分离思路，具体的组件包括：

- Ant Design：基于 [React](http://facebook.github.io/react/)封装的一套 Ant Design 的组件库，主要用于研发企业级中后台产品。从产品成熟度、社区活跃度、框架上手难易程度等各个方面均有很好的表现。
- SOFABoot：蚂蚁金服开源的基于 Spring Boot 的研发框架，它在 Spring Boot 的基础上，提供了诸如 Readiness Check，类隔离，日志空间隔离等能力。在增强了 Spring Boot 的同时，SOFABoot 提供了让用户可以在 Spring Boot 中非常方便地使用 SOFA 中间件的能力。
- MyBatis：Mybatis 相对于 JPA 来说，上手难度略低，JPA 更加倾向于结合 DDD 使用(业务越复杂，对于DDD 的需求越高)；对于简单的增删改查业务操作，Mybatis  相对来说更灵活和可控。

## v1.0 发布

4 月 30 日，我们上传了第一个 SOFADashboard 版本，主要能力包括：应用信息、服务查看、动态模块管控等。

目前演示地址：[http://dashboard.dev.sofastack.tech:8000/](http://dashboard.dev.sofastack.tech:8000/) 

![SOFADashboard](https://cdn.nlark.com/yuque/0/2019/png/226702/1556525347731-24fa1d1e-555f-44f0-a275-f188e35cbba8.png)

### 详细设计图

![SOFADashboard 详细设计图](https://cdn.nlark.com/yuque/0/2019/png/226702/1556525347699-53469a8f-341e-448d-ad75-c4be1a7111ba.png)

### 基础依赖

从架构图中可以看到，目前 SOFADashboard 中的服务治理、SOFAArk 管控等需要依赖于 Zookeeper 和 MySQL；它们承担的解决如下：

| 外部依赖 | 作用 | 备注 |
| --- | --- | --- |
| Zookeeper | 注册中心 | SOFARPC 服务治理 |
|  | 配置推送 | SOFAArk 管控 |
| MySql | 资源存储 | 注册的 ark-biz 信息，插件与应用的关联信息，插件版本信息等 |

### 应用面板

SOFADashboard 支持查看应用的 IP、端口、健康检查状态等基本信息，此功能依赖 [SOFADashboard client](https://github.com/alipay/sofa-dashboard-client)。SOFADashboard client 用于向 SOFADashboard 服务端注册 IP、端口、健康检查状态等应用基本信息；SOFADashboard client 并非是直接通过 API 调用的方式将自身应用信息直接注册到 SOFADashboard 服务端 ，而是借助于 Zookeeper 来完成。

![SOFADashboard 写入节点](https://cdn.nlark.com/yuque/0/2019/png/226702/1556525347697-9e4e4952-2e38-4a10-9aeb-c7b49aa01608.png)

客户端向 Zookeeper 中如上图所示的节点中写入数据，每一个 ip:port 节点代表一个应用实例，应用本身信息将写入当前节点的 data 中。

如果一个应用需要将应用信息展示到 SOFADashboard 管控端，可以通过引入客户端依赖即可，具体使用参考 [SOFADashboard client 快速开始](https://github.com/alipay/sofa-dashboard-client) 。

### 服务治理

SOFADashboard 服务治理是对 SOFARPC 的服务进行管理，服务治理管控台部分，主要包括基于服务名查询和服务信息列表展示两个基础能力。在服务治理管控台界面，可以直观的看到当前服务的一些基本元数据信息：

![SOFADashboard 操作界面](https://cdn.nlark.com/yuque/0/2019/png/226702/1556525347748-3315818c-f358-42a8-a9df-3ff823827035.png)

当点击 服务 ID 对应的超链接时，会进入到当前服务的详情页；服务提供者详情页中，可以看到当前服务所有的提供方信息列表，每个 item 行对应一个服务提供方实例，通过此界面可以快速查看服务的 providers 信息。

![服务信息界面](https://cdn.nlark.com/yuque/0/2019/png/226702/1556525347758-27776727-a1af-441f-856c-1dacec04c381.png)

服务消费者详情页中，可以看到当前服务所有的消费方信息列表。

![消费信息界面](https://cdn.nlark.com/yuque/0/2019/png/226702/1556525347702-b296ec6f-0404-4fa5-afc7-bdaee0961bfb.png)

### SOFAArk 管控

[SOFAArk](https://www.sofastack.tech/sofa-boot/docs/sofa-ark-readme) 本身提供了多种方式来支持多应用(模块)合并部署 ，包括基于命令行的管控，基于 API 的管控等；SOFAArk 管控是 SOFADashboard 针对 API 管控的一种实现。通过面向 Zookeeper 进行命令的推送和命令的解析执行。SOFAArk 管控主要包括以下功能：

- 插件注册

将 ark-biz 插件注册到 SOFADashboard，作为基础数据，统一管控。

![插件注册](https://cdn.nlark.com/yuque/0/2019/png/226702/1556525347756-7fa6dd2d-a5c4-421f-a409-ee0c4af7baf9.png)

插件基本信息录入：

![插件基本信息录入](https://cdn.nlark.com/yuque/0/2019/png/226702/1556525347730-23f852c2-dd92-424e-8605-38812193745b.png)

插件列表：

![插件列表](https://cdn.nlark.com/yuque/0/2019/png/226702/1556525347721-407c33d4-a60f-45f4-8fb9-228f76e2198b.png)

- 关联应用

将 ark-biz 插件与宿主应用进行绑定，此关联信息在 SOFAArk 多应用（模块）合并部署中作为重要的基础信息存在。在后续的操作中，可以通过此关联关系查看到某个插件下挂载的应用信息。

![关联应用](https://cdn.nlark.com/yuque/0/2019/png/226702/1556525347759-c6eea941-123e-4e2d-99c5-7d32a9077a33.png)

- 插件详情

通过插件详情页，可以看下当前 ark-biz 插件下所有关联的宿主应用信息，以及宿主应用中的 ark-biz 状态信息，插件详情页中，可以查看所有关联此插件的应用中，插件的状态信息。

![插件详情](https://cdn.nlark.com/yuque/0/2019/png/226702/1556525347778-0ec57420-fc4b-4e3d-b59b-2dd2e78327b5.png)

- 命令推送

命令推送是 SOFADashboard 中提供 SOFAArk 管控的核心能力，通过面向 Zookeeper 编程的方式，将指令信息传递给各个宿主应用中的 ark-biz 模块，ark-biz 在接收到相关指令之后再进行相应的行为，如安装、切换、卸载等。

可以针对应用维度、IP 维度推送一些指令，比如 install、uninstall 等等，当这些命令被写入到 Zookeeper 的某个节点上时，所有监听此节点的宿主应用均会解析此指令，并进行相关的操作。

基于 IP 维度推送如图例所示，每个应用实例表单默认会有对应的操作，可以通过展示的命令按钮操作当前实例行为：

![命令推送](https://cdn.nlark.com/yuque/0/2019/png/226702/1556525347732-89d690e5-7c5d-4778-bfce-eca7f83f71ad.png)

点击 安装按钮，延迟 1~1.5s 之后 界面将会刷新新的状态：

![命令推送](https://cdn.nlark.com/yuque/0/2019/png/226702/1556525347770-02b79189-2f80-4c58-a261-9416216e0952.png)

> 基于应用维度此处不再赘述。

## 社区共建

SOFADashboard 作为整个 SOFA 体系的“管家”，目前在能力上还比较薄弱；与其他 SOFAStack 产品不同的是，SOFADashboard 是一款从一开始就希望社区共建的，天然定位开放到社区的产品。随着 SOFAStack 体系内产品的不断丰富，SOFADashboard 希望通过社区共建的方式来锤炼和完善功能，大家可以提出不同的需求，建设更多的能力，从而更好的服务整个 SOFAStack 技术体系。

待建设列表如下，欢迎大家参与贡献：

| 任务列表 | 进度 | 计划版本 | 说明 |
| --- | --- | --- | --- |
| 集成 SOFARegistry | 开发中 | 1.1.0 |  |
| 完善应用面板功能，支持多维度的应用信息展示 | -- | 1.1.0 |  |
| 完善服务治理能力，包括权重设置，服务降级等 | -- | 1.1.0 |  |
| 增加链路分析展示功能 | -- | 1.2.0 |  |
| 集成 Apollo  | -- | 1.3.0 |  |
| 支持 Docker  | -- | -- |  |
| 支持 Kubernetes | -- | -- |  |
| 前端优化 | 持续进行中 | -- |  |

## 小结

本文介绍了 SOFADashboard 产生的背景，并对 SOFADashboard 提供的功能进行了介绍。随着 SOFAStack 架构体系的不断完善，SOFADashboard 也将会承担更多的管控能力。在功能丰富和前端优化上，希望可以有更多的同学能够参与，一起打造一个功能完备、简单易用的 SOFADashboard。