---
title: "SOFA Weekly |社区开发者的搬砖日常、本周 Contributor、QA 整理"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly |社区开发者的搬砖日常、本周 Contributor、QA 整理
"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2022-02-25T15:00:00+08:00
cover: "https://gw.alipayobjects.com/zos/bmw-prod/5bcdff25-e21a-43ab-8e34-04305cd379ae.webp"
---

SOFA WEEKLY | 每周精选，筛选每周精华问答

同步开源进展，欢迎留言互动

![weekly.jpg](https://gw.alipayobjects.com/zos/bmw-prod/5bcdff25-e21a-43ab-8e34-04305cd379ae.webp)

SOFAStack（Scalable Open Financial Architecture Stack)是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

SOFAStack 官网: [https://www.sofastack.tech](https://www.sofastack.tech/)

SOFAStack: [https://github.com/sofastack](https://github.com/sofastack)

### SOFA&MOSN 社区 本周 Contributor

> ![img](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*07viQaDCJAEAAAAAAAAAAAAAARQnAQ)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动

我们会筛选重点问题

通过 " SOFA WEEKLY " 的形式回复

**@徐豪** 提问：

> 想了解 Ark 动态模块，如何在 IDEA 里面进行开发调试？

A：这个和普通工程基于 idea 调试没有什么区别的，你的 issue 里面提到要调试模块，那就在安装模块的时候，将断点打在你关注的代码行。

> 目前我没有看到相关的 guide，然后自行尝试，先启动容器，再手工启动模块，感觉没成功，不清楚问题出在哪？

A：～/logs/sofa-ark 看看有日志吗？

**@孙英雄** 提问：

> 请问伙伴们有在用 SOFA 技术栈在非金融的项目开发吗？

A：有的哈，可以看下使用者登记 
[https://github.com/sofastack/sofa-rpc/issues/375https://github.com/sofastack/sofastack.tech/issues/5](https://github.com/sofastack/sofa-rpc/issues/375https://github.com/sofastack/sofastack.tech/issues/5)

**@来永国** 提问：

> 升 SpringBoot to 2.4.x 还有计划吗？

A：GitHub 上有一些 exmaple，你可以先玩玩。这个今年在规划了，下个 SOFABoot 版本 3.11.0 将会升级到 Spring Boot 2.4.13。

[https://www.github.com/mosn/mosn/tree/master/examples%2Fcn_readme%2Fdubbo-examples](https://www.github.com/mosn/mosn/tree/master/examples%2Fcn_readme%2Fdubbo-examples)

### SOFAStack&MOSN:新手任务计划

作为技术同学，你是否有过“想参与某个开源项目的开发、但是不知道从何下手”的感觉？

为了帮助大家更好的参与开源项目，SOFAStack 和 MOSN 社区会定期发布适合新手的新手开发任务，帮助大家 learning by doing!

**Layotto**

- Easy

为 actuator 模块添加单元测试

为 Java SDK 新增分布式锁、分布式自增 ID API

开发 in-memory 组件

- Medium

让 Layotto 支持 Dapr API

开发 Rust、Python、SDK

「详细参考」：

[https://github.com/mosn/layotto/issues/108#issuecomment-872779356](https://github.com/mosn/layotto/issues/108#issuecomment-872779356)

**SOFARPC**

- Easy

优化 SOFARPC 使用文档

- Medium

优化 SOFARPC 的异步编程体验

「详细参考」：

[https://github.com/sofastack/sofa-rpc/issues/1127](https://github.com/sofastack/sofa-rpc/issues/1127)

### 本周推荐阅读  

[技术人聊开源：这并不只是用爱发电](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247501660&idx=1&sn=d39d1d2418c44a4b1a6da0128707baf3&chksm=faa32886cdd4a19089b46b029056ba4f032cf7cd53c52bc21ab16b6c51de147a710d84649b02&scene=21)

[应用运行时 Layotto 进入 CNCF 云原生全景图](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247501562&idx=1&sn=67f6fdf0d630ffefc1635b82651a1b2f&chksm=faa32920cdd4a03604cff93e9de80df78094a4211dee0d34409ec8a6edbf3d043615e9e7431d&scene=21)

[蚂蚁大规模 Kubernetes 集群无损升级实践指南【探索篇】](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247501311&idx=1&sn=ff1cbc49747a577475f6e0c3162ed5fb&chksm=faa32a25cdd4a3332a46ebacbd6e5d057a4b95582eec216275e35cd0a125e537e49b710cccb7&scene=21)

[喜迎虎年｜开源正当时！](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247500831&idx=1&sn=e91fff98af5bdc500f821951648420c3&chksm=faa32bc5cdd4a2d3aea8a4146d19411b065146b1a60fc0c27c0a8e3fd2040e5f6f23b5a33a0f&scene=21)
