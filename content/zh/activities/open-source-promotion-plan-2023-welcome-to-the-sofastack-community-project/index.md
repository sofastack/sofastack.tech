---
title: "【开源之夏 2023】欢迎报名 SOFAStack 社区项目！"
authorlink: "https://github.com/sofastack"
description: "【开源之夏 2023】欢迎报名 SOFAStack 社区项目！"
categories: "开源之夏"
tags: ["SOFAStack 开源之夏"]
date: 2023-05-05T15:00:00+08:00
cover: "https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*U9KLTJWBoOcAAAAAAAAAAAAADrGAAQ/original"
---

![图片](https://mmbiz.qpic.cn/mmbiz_gif/nibOZpaQKw09ARcsGuzib3ttcN4LZpdAC0n9KTQp7uibF8ia0ibk3Olf3sib50ExibicicOrzCOVrOyUD2dFib84f0fTx5uA/640?wx_fmt=gif&wxfrom=5&wx_lazy=1)

开源之夏是由“开源软件供应链点亮计划”发起并长期支持的一项暑期开源活动，旨在鼓励在校学生积极参与开源软件的开发维护，促进优秀开源软件社区的蓬勃发展，培养和发掘更多优秀的开发者。

活动联合国内外各大开源社区，针对重要开源软件的开发与维护提供项目任务，并面向全球高校学生开放报名。

2023 年，**SOFAStack 社区**再次加入中国科学院软件研究所的高校开源活动——“**开源之夏 2023**”，一共为大家准备了五个任务，涵盖 SOFARPC、SOFAArk、SOFAJRaft 和 Layotto 等核心项目，涉及 Golang、Java、Kubernetes、Cloud Native、Distributed System 等多个领域。

**SOFARPC 项目介绍**

SOFARPC 是由蚂蚁集团开源的一款 Java RPC 框架，具有高可扩展性、高性能和生产级特性。该框架旨在简化应用之间的 RPC 调用，并为应用提供便捷透明、稳定高效的点对点远程服务调用方案。为方便用户和开发者进行功能扩展，SOFARPC 提供了丰富的模型抽象和可扩展接口，包括过滤器、路由、负载均衡等。

**SOFAArk 项目介绍**

SOFAArk 是一款基于 Java 实现的轻量级类隔离容器，由蚂蚁集团开源贡献。该容器主要提供类隔离和应用（模块）合并部署能力。SOFAArk 提供多种方式来支持多应用（模块）合并部署，包括基于命令行的管控、基于 API 的管控等。

**SOFAJRaft 项目介绍**

SOFAJRaft 是一个基于 RAFT 一致性算法的生产级高性能 Java 实现，适用于高负载低延迟的场景，支持 MULTI-RAFT-GROUP。使用 SOFAJRaft 可专注于业务领域，由 SOFAJRaft 解决与 RAFT 相关的技术难题。并且 SOFAJRaft 易于使用，可以通过几个示例快速掌握它。

**Layotto 项目介绍**

Layotto(/leɪˈɒtəʊ/) 是一款使用 Golang 开发的应用运行时, 旨在帮助开发人员快速构建云原生应用，帮助应用和基础设施解耦。它为应用提供了各种分布式能力，例如状态管理、配置管理、事件发布订阅等，以简化应用的开发。

**活动规则**

开源之夏官网：

[*https://summer-ospp.ac.cn/*](https://summer-ospp.ac.cn/)

各位同学可以自由选择项目，与社区导师沟通实现方案并撰写项目计划书。被选中的学生将在社区导师指导下，按计划完成开发工作，并将成果贡献给社区。社区评估学生的完成度，主办方根据评估结果发放资助金额给学生。

**SOFAStack 社区项目**

项目链接：[*https://summer-ospp.ac.cn/org/orgdetail/95a9e459-a200-4a26-bc0a-81074c2d89be?lang=zh*](https://summer-ospp.ac.cn/org/orgdetail/95a9e459-a200-4a26-bc0a-81074c2d89be?lang=zh)

**SOFARPC**

Java、网络通信、RPC

**项目社区导师：EvenLiu**

**<evenljj@163.com>**

**SOFARPC 支持 Stream 流式处理方式**

**项目编号：2395a0260**

**项目难度：进阶/Advanced**

Stream 方式是一种异步的流式处理方式，可以在数据传输过程中逐个处理数据，避免一次性传输大量数据造成的性能问题。服务端 Stream 是指服务端在处理请求时，将数据分成多个部分逐个返回给客户端的过程；客户端 Stream 是指客户端在请求服务器时，将请求参数分成多个部分逐个发送给服务器的过程。Stream 方式可以让我们在处理大量数据时更高效地使用资源，提高系统的性能和响应速度。SOFARPC 中需要 Triple、Bolt 协议支持 Stream 方式流式处理。

- SOFARPC 中 Triple 协议支持 Stream 流式处理。

- SOFARPC 中 Bolt 协议支持 Stream 流式处理。

**SOFAArk**

Java、SOFAArk 源代码

**项目社区导师：卫恒**

**<glmapper_2018@163.com>**

**开发一个客户端，支持 Biz 模块的热部署和热卸载，初步实现 Serverless 体验**

**项目编号：2395a0267**

**项目难度：基础/Basic**

SOFAArk 从最初的一个类隔离框架，逐步演进为支持合并部署与热部署的 “Serverless” 运行时框架，尤其在去年我们完成了 SOFAArk1.0 到 2.0 架构的演进。但是为了让开发者真正享受 Serverless 的研发体验，我们还需要建设一个客户端框架，对接 SOFAArk 实现 Biz 模块的热部署和热卸载，并暴露 HTTP API 接口可以让上游系统或者开发者直接使用。

- 设计并开发一个新的 SDK（SOFALet），新的 SDK 也就是 SOFALet 暴露一组 HTTP 接口，底层调用 SOFAArk 原子能力实现模块的热部署和热卸载。SOFALet 未来还会有 Node.js 版，这一期先支持 Java 版也就是对接 SOFAArk。

- 理解 SOFAArk 源代码，尤其是关于 telnet 指令安装和卸载模块的部分。

**SOFAArk**

Go、K8s

**项目社区导师：流铄**

**<xujinle300@126.com>**

**开发一个 K8s Operator，编排客户端 API 实现 Biz 模块的热部署，初步达成 Serverless 研发体验**

**项目编号：2395a0392**

**项目难度：基础/Basic**

为了让开发者真正享受 Serverless 的研发体验，我们需要先建设一个简易的 K8s Operator 和 SOFA Module Deployment、SOFA Module ReplicaSet CRD，对接编排模块热装载和热卸载的客户端，实现模块秒级发布的初步能力，让开发者能初步体验到 Serverless 的发布运维能力。

- 理解 SOFAArk 模块安装和卸载部分的源代码，并且熟悉 K8s CRD 和 Operator 体系的设计与开发。

**SOFAJRaft**

Java、网络通信、RPC

**项目社区导师：刘源远**

**<gege87417376@qq.com>**

**结合 NWR 实现 Flexible RAFT，用于自定义 Quorum 的大小**

**项目编号：2395a0390**

**项目难度：进阶/Advanced**

JRaft 是一个基于 RAFT 一致性算法的生产级高性能 Java 实现，它运行过程分为两个阶段，即 Leader 选举和日志复制。在原始的 RAFT 算法中，Leader 选举和日志复制都需要获得多数派成员的支持。而 NWR 模型则可以在动态调整一致性强度的场景中使用，它需要满足 W+R>N，以保证强一致性。JRaft 将 RAFT 和 NWR 结合起来，使得用户可以根据不同的业务需求来动态调整 Quorum 的数量。例如，在一个写多读少的场景中，用户可以将多数派的数量从 3 调整为 2，以降低达成共识的条件，从而提高写请求的效率。同时，为了保证 RAFT 的正确性，写 Quorum 的调整需要付出代价，即读 Quorum 的数量也需要相应调整。JRaft 支持成员变更，因此用户可以配置 (0,1] 范围内的小数来计算 W 和 R 的具体值。通过使用 JRaft，用户可以根据自己的业务需求来灵活地调整一致性强度，使得分布式系统在不同场景下都可以获得最佳的性能和正确性。

- 为 JRaft 实现自定义 Quorum，动态调节 Quorum 的参数，为自定义 Quorum 的场景增加 Jepsen Case。

- 掌握 RAFT 算法协商过程；基于 RAFT 设计 NWR 模型，编写具体设计文档。

**Layotto**

Go、Kubernetes、K8s

**项目社区导师：刘训灼**

**<mixdeers@gmail.com>**

**Layotto 支持自动/手动注入 Pod 部署**

**项目编号：2395a0359**

**项目难度：进阶/Advanced**

Kubernetes 是 CNCF 下容器资源编排的一个实施标准，Layotto 也拥抱 K8s 环境，在 Kubernetes 集群中，常常以 Sidecar 方式运行。社区需提供方式，以便开发者 / 运维在 Kubernetes 环境中快速部署 Layotto。

- 提供命令行工具，支持手动注入 Layotto 至 Pod 中；提供 Webhook 插件，支持动态注入 Layotto 至 Pod 中；熟悉 Golang、熟悉 Cobra 编写 Golang 命令行工具。

- 了解 K8s 基本架构与原理，理解 Pod 生命周期；了解 K8s WebHook 机制；了解 Golang 模版化以及动态渲染模版相关知识。

**申请资格**

- 本活动面向年满 18 周岁在校学生。

- 暑期即将毕业的学生，只要在申请时学生证处在有效期内，就可以提交申请。

- 中国籍学生参与活动需提供身份证、学生证、教育部学籍在线验证报告（学信网）或在读证明。

- 外籍学生参与活动需提供护照，同时提供录取通知书、学生卡、在读证明等文件用于证明学生身份。

**活动流程**

![图片](https://mmbiz.qpic.cn/mmbiz_png/nibOZpaQKw0ibwuN3KvIWibDrrepiazQ7q4Cukibib96HSF6iawBYTapDs1omndGFTByo4fqibpxbGgia2UDBWK3F2DmicrA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

![图片](https://mmbiz.qpic.cn/mmbiz_jpg/nibOZpaQKw09bj5N6hwCP9lGYXTf5IrnK7OAAecFdVPJpVSA1FcoPyIldjpmh7qrpQfwavibrMLBENSEBd2gbD1w/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)

添加 SOFAGirl 微信

备注“开源之夏”进群交流
