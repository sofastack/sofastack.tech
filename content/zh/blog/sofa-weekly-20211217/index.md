---
title: "SOFA Weekly | SOFA Weekly | 本周 Contributor、QA 整理、SOFARegistry 本周发布"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "开发者的搬砖日常、社区本周 Contributor、QA 整理"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2021-12-17T15:00:00+08:00
cover: "https://gw.alipayobjects.com/zos/bmw-prod/5bcdff25-e21a-43ab-8e34-04305cd379ae.webp"
---

SOFA WEEKLY | 每周精选，筛选每周精华问答

同步开源进展，欢迎留言互动

![weekly.jpg](https://gw.alipayobjects.com/zos/bmw-prod/5bcdff25-e21a-43ab-8e34-04305cd379ae.webp)

SOFAStack（Scalable Open Financial Architecture Stack)是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

SOFAStack 官网: [https://www.sofastack.tech](https://www.sofastack.tech/)

SOFAStack: [https://github.com/sofastack](https://github.com/sofastack)

### SOFA&MOSN 社区 本周 Contributor

![img](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*kvlmQL0cy3QAAAAAAAAAAAAAARQnAQ)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动

我们会筛选重点问题

通过 " SOFA WEEKLY " 的形式回复

**@孙军超** 提问：

>请教一下 JRaft 里， Bolt 的 logback 日志怎么关掉 ?

![img](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*8nOfTYiNSfIAAAAAAAAAAAAAARQnAQ)

A：可以参考这个文件。[https://github.com/sofastack/sofa-jraft/issues/724](https://github.com/sofastack/sofa-jraft/issues/724)

「SOFAJRaft」：[https://github.com/sofastack/sofa-jraft](https://github.com/sofastack/sofa-jraft)

**@超** 提问：

>这种方式运行 Wasm 的时候，Layotto 自身加上运行时部分初始化需要加载 Dapr 组件时间可能总共要 1-2s（还没有实测，因为目前只用过 Dapr，后面会实际运行一下）。这方面冷启动延迟一方面可以精简 Wasm 的 runtime 仅包括 Dapr 或者 Layotto 的 SDK 通过网络来通信；另一方面就是优化运行时的启动时间。作者对这方面问题有想法吗？ 

A:这个问题属于 Layotto 自身如何快速初始化，目前我们也在这方面做一些尝试，比如优化调度算法，让某些特征的函数调度到特定的 Layotto 上，这样就可以让 Layotto 提前初始化好资源。不过这只是函数急速调度中的一个环节，实际落地过程中还有调度算法执行耗时，Pod 启动耗时，函数自身启动耗时等等因素，这也是我们目前正在努力的方向。

「Layotto」：[https://github.com/mosn/layotto](https://github.com/mosn/layotto)

### SOFAStack&MOSN:新手任务计划

作为技术同学，你是否有过“想参与某个开源项目的开发、但是不知道从何下手”的感觉？

为了帮助大家更好的参与开源项目，SOFAStack 和 MOSN 社区会定期发布适合新手的新手开发任务，帮助大家 learning by doing!

**Layotto**

- Easy

为 actuator 模块添加单元测试

为 Java SDK 新增分布式锁、分布式自增 ID API

- Medium

让 Layotto 支持 Dapr API

开发 Python 或 C++ 、SDK

开发 Spring-Boot-Layotto

- Hard

集成 Jaeger 等 tracing 系统

「详细参考」：[https://github.com/mosn/layotto/issues/108#issuecomment-872779356](https://github.com/mosn/layotto/issues/108#issuecomment-872779356)

**SOFARPC**

- Easy

优化 SOFARPC 使用文档

- Medium

让用户使用@SofaService 后不需要再写@Component

优化 SOFARPC 的异步编程体验

- Hard

JFR 埋点

「详细参考」：[https://github.com/sofastack/sofa-rpc/issues/1127](https://github.com/sofastack/sofa-rpc/issues/1127)

### SOFARegistry 本周发布

SOFARegistry V6 正式发布的第一个版本。

主要更新如下：

1. 运维难度大幅度降低

自身元数据存储插件化，如果不希望引入 raft 运维的复杂性，支持基于 db 实现。meta、session 无状态化，data 弱状态化。

2. 性能和可扩展能力大幅提升

横向扩展能力大幅度提升，能够横向扩展至 300+ session 节点，能够承载亿级服务数据。

「详细参考」：[https://github.com/sofastack/sofa-registry/releases/tag/v6.1.4](https://github.com/sofastack/sofa-registry/releases/tag/v6.1.4)

[网商双十一基于 ServiceMesh 技术的业务链路隔离技术及实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247499122&idx=1&sn=9733d1c015e7b0e8e64bd5cf44118b10&chksm=faa312a8cdd49bbec97612e9756ef4372c446c410518a04bd0ae990a60fea9b8e78025e60c6d&scene=21#wechat_redirect)

[Service Mesh 在中国工商银行的探索与实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247499122&idx=1&sn=9733d1c015e7b0e8e64bd5cf44118b10&chksm=faa312a8cdd49bbec97612e9756ef4372c446c410518a04bd0ae990a60fea9b8e78025e60c6d&scene=21#wechat_redirect)

[Service Mesh 双十一后的探索和思考(上)](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487314&idx=1&sn=55a6a84986290888e15719446365c986&chksm=faa0e088cdd7699e2a2a4594850699713cbd698531dba1f7309f755375232560f8f758230a85&scene=21#wechat_redirect)

[降本提效！注册中心在蚂蚁集团的蜕变之路](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247498209&idx=1&sn=7dbfd98e922d938ffce24986945badef&chksm=faa3163bcdd49f2d3b5dd6458a3e7ef9f67819d8a1b5b1cbb3d10ab3b7cda12dd7a3d2971a9e&scene=21#wechat_redirect)

![img](https://gw.alipayobjects.com/zos/bmw-prod/75d7bde6-1f48-4f28-80a4-215f8ec811bd.webp)
