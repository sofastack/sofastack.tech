---
title: "SOFA Weekly |社区开发者的搬砖日常、本周 Contributor、QA 整理"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly |社区开发者的搬砖日常、本周 Contributor、QA 整理"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2021-12-24T15:00:00+08:00
cover: "https://gw.alipayobjects.com/zos/bmw-prod/5bcdff25-e21a-43ab-8e34-04305cd379ae.webp"
---

SOFA WEEKLY | 每周精选，筛选每周精华问答

同步开源进展，欢迎留言互动

![weekly.jpg](https://gw.alipayobjects.com/zos/bmw-prod/5bcdff25-e21a-43ab-8e34-04305cd379ae.webp)

SOFAStack（Scalable Open Financial Architecture Stack)是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

SOFAStack 官网: [https://www.sofastack.tech](https://www.sofastack.tech/)

SOFAStack: [https://github.com/sofastack](https://github.com/sofastack)

### SOFA&MOSN 社区 本周 Contributor

![img](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*07zSSoPDYaEAAAAAAAAAAAAAARQnAQ)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动

我们会筛选重点问题

通过 " SOFA WEEKLY " 的形式回复

**@微光** 提问：

> 有一个嵌入式分布式 KV 存储需求，JRaft RheaKV 能用在生产吗？

A：我们的时序数据库集群基于 RheaKV  做元数据存储和集群调度。

有关内容可以参考这个文件：《"使用组件及场景：时序数据库集群基于 RheaKV  做元数据存储和集群调度"》

[https://github.com/sofastack/sofa-jraft/issues/524](https://github.com/sofastack/sofa-jraft/issues/524)

「SOFAJRaft」：[https://github.com/sofastack/sofa-jraft](https://github.com/sofastack/sofa-jraft)

**@微光** 提问：

> RheaKV 中这样移除一个节点 Node，好像不行。在 DefaultRheaKVCliService 中是否可以提供动态上线 Node 和下线 Node 的 API？

![img](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*gSWGQYuwwmkAAAAAAAAAAAAAARQnAQ)

A：你提的都支持。所谓动态，不是说 JRaft 决定的，是你的运维系统可以使用 JRaft API 动态执行。

issue 详细回复：[https://github.com/sofastack/sofa-jraft/issues/747](https://github.com/sofastack/sofa-jraft/issues/747)

「SOFAJRaft」：[https://github.com/sofastack/sofa-jraft](https://github.com/sofastack/sofa-jraft)

**@苏泽东** 提问：

> 哪位老师帮我解答下这个 Endstream 方法?

![img](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*t4j4Q5U36WEAAAAAAAAAAAAAARQnAQ)

A：这个主要是请求发出去后，一直等到收到响应后，记录下 RT 时间等监控数据。

「MOSN」：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

**@火种** 提问：

> 咨询一个问题：看 MOSN 的源码，如果非 netpoll，是通过在 startRWLoop 来实现的，如果是使用 netpoll 的情况下，长链接是怎么迁移的？

A：[https://mp.weixin.qq.com/s/ts_qsUee6mUFv0FpykaOXQ](https://mp.weixin.qq.com/s/ts_qsUee6mUFv0FpykaOXQ)
推荐你看下这个文件。

> startRWloop 会调用 startreadloop 和 startwriteloop，在这两个函数中进行了长链接的数据的交换，但是使用 netpoll 后，代码分支就变成 netpoll 相应的分支了，不会进入上述两个函数了。

A：没有支持 netpoll 模式的迁移。

「MOSN」：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

### SOFAStack&MOSN:新手任务计划 

作为技术同学，你是否有过“想参与某个开源项目的开发、但是不知道从何下手”的感觉？

为了帮助大家更好的参与开源项目，SOFAStack 和 MOSN 社区会定期发布适合新手的新手开发任务，帮助大家 learning by doing!

Layotto

- Easy

为 actuator 模块添加单元测试

为 Java SDK 新增分布式锁、分布式自增 ID API

开发 in-memory 组件

- Medium

让 Layotto 支持 Dapr API

开发 Rust、Python、SDK

「详细参考」：

[https://github.com/mosn/layotto/issues/108#issuecomment-872779356](https://github.com/mosn/layotto/issues/108#issuecomment-872779356)

SOFARPC

- Easy

优化 SOFARPC 使用文档

- Medium

优化 SOFARPC 的异步编程体验

「详细参考」：

[https://github.com/sofastack/sofa-rpc/issues/1127](https://github.com/sofastack/sofa-rpc/issues/1127)

### 本周推荐阅读

[SOFAStack 背后的实践和思考｜新一代分布式云 PaaS 平台，打造企业上云新体验](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247499590&idx=1&sn=14b9652c41e39bd06e4511b632b16fd2&chksm=faa3109ccdd4998a0d0495638fa53f38d5d062d80fdb0d2524e965aa3dea8a289150ddcec456&scene=21)

[深入 HTTP/3（一）｜从 QUIC 链接的建立与关闭看协议的演进](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247499565&idx=1&sn=00a26362451ee3bbc8ee82588514eb52&chksm=faa310f7cdd499e15e39f1cfc32644cb175340f26148cab50ca90f973e786c5ef4d8cb025580&scene=21)

[网商双十一基于 ServiceMesh 技术的业务链路隔离技术及实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247499122&idx=1&sn=9733d1c015e7b0e8e64bd5cf44118b10&chksm=faa312a8cdd49bbec97612e9756ef4372c446c410518a04bd0ae990a60fea9b8e78025e60c6d&scene=21)

[Service Mesh 在中国工商银行的探索与实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247499122&idx=1&sn=9733d1c015e7b0e8e64bd5cf44118b10&chksm=faa312a8cdd49bbec97612e9756ef4372c446c410518a04bd0ae990a60fea9b8e78025e60c6d&scene=21)

![img](https://gw.alipayobjects.com/zos/bmw-prod/75d7bde6-1f48-4f28-80a4-215f8ec811bd.webp)
