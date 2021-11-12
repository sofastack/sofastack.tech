---
title: "SOFA Weekly | SOFA Weekly | 社区本周 Contributor、QA 整理、新手任务计划"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | SOFA Weekly | 社区本周 Contributor、QA 整理、新手任务计划"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2021-11-12T15:00:00+08:00
cover: "https://gw.alipayobjects.com/zos/bmw-prod/5bcdff25-e21a-43ab-8e34-04305cd379ae.webp"
---
SOFA WEEKLY | 每周精选，筛选每周精华问答

同步开源进展，欢迎留言互动

![weekly.jpg](https://gw.alipayobjects.com/zos/bmw-prod/5bcdff25-e21a-43ab-8e34-04305cd379ae.webp)

SOFAStack（Scalable Open Financial Architecture Stack)是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

SOFAStack 官网: [https://www.sofastack.tech](https://www.sofastack.tech/)

SOFAStack: [https://github.com/sofastack](https://github.com/sofastack)

### SOFA&MOSN 社区本周 Contributor

![weekly.jpg](https://gw.alipayobjects.com/zos/bmw-prod/447adce8-6166-492e-bfb3-d95d1a4b5fa8.webp)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动

我们会筛选重点问题

通过 " SOFA WEEKLY " 的形式回复

**@zjw** 提问：

>请教个 SOFARegistry 的问题，sessionServer 启动后，地址是上报给 Meta 的吗？如果 sessionServer 意外关闭，地址是什么时候怎么摘除的？

A：session 会定时向 Meta 发送请求对自己的地址进行心跳续约，session 宕机后，Meta 端一段时间接收不到心跳就会摘除宕机的 session，然后广播给所有其他的 session。目前是靠心跳，超时之后 Meta 会把 session 或者 data 剔除。

「SOFARegistry」：[https://github.com/sofastack/sofa-registry](https://github.com/sofastack/sofa-registry)

**@滕川** 提问：

>如果 leader 节点挂了，新选举的 leader 节点如何知道各个 follower 节点的 match index。

A：leader 不需要知道，leader 节点就直接发 appendEtries 即可。如果哪个 follower 还缺更之前的 log，那么它拒绝掉这次 appendEntries 就可以了， leader 会有相应的回退处理逻辑。

「SOFAJRaft」：[https://github.com/sofastack/sofa-jraft](https://github.com/sofastack/sofa-jraft)

**@橙橙不是澄澄** 提问：

>Raft 里面为什么不要 observer 呢？恰好之前看到 ZooKeeper 里面有这个角色。

A：Raft 里面可以有类似的角色，叫 learner。learner 不参与选举，只接收 leader 日志，JRaft 也支持 learner。

「SOFAJRaft」：[https://github.com/sofastack/sofa-jraft](https://github.com/sofastack/sofa-jraft)

**@邓君武** 提问：

>SOFAJRaft 文档中说支持 MULTI-RAFT-GROUP，目前 SOFAJRaft-RheaKV 这个存储组件中用到了。那么如果我想根据 SOFAJRaft 实现一个分布式的业务系统，MULTI-RAFT-GROUP 该怎么用呢？

A：MULTI-RAFT-GROUP 主要用于解决 SIGLE-RAFT-GROUP 单点瓶颈问题（存储或是吞吐），多个 group 中每个 group 都有一个 leader，可以把 leader 打散到不同的机器上，提高并发度。JRaft 天然支持 MULTI-RAFT-GROUP ，使用的话可以参考 RheaKV。

「SOFAJRaft」：[https://github.com/sofastack/sofa-jraft](https://github.com/sofastack/sofa-jraft)

### SOFAStack&MOSN:新手任务计划

作为技术同学，你是否有过“想参与某个开源项目的开发、但是不知道从何下手”的感觉？

为了帮助大家更好的参与开源项目，SOFAStack 和 MOSN 社区会定期发布适合新手的新手开发任务，帮助大家 learning by doing!

**SOFARPC**

- Easy

在服务引用和发布时，使用枚举值替代字符串硬编码

优化集成 Nacos、ZK 注册中心的文档

- Medium

让用户使用@SOFAService 后不需要再写@Component

优化 SOFARPC 的异步编程体验

- Hard

JFR 埋点

「详细参考」：[https://github.com/sofastack/sofa-rpc/issues/1127]9](https://github.com/sofastack/sofa-rpc/issues/1127]9)

**Layotto**

- Easy

fail fast，让 Layotto 启动报错时自杀

为 Java SDK 新增分布式锁 API

为 Java SDK 新增分布式自增 ID API

- Medium

开发 Python SDK

升级由 Rust 开发的 Wasm demo

- Hard

集成 Jaeger 等 tracing 系统

支持 Dapr Config API

「详细参考」：[https://github.com/mosn/layotto/issues/108#issuecomment-872779356](https://github.com/mosn/layotto/issues/108#issuecomment-872779356)

#### 本周推荐阅读

- [如何在生产环境排查 Rust 内存占用过高问题](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247497371&idx=1&sn=8b98f9a7dad0ac99d77c45d12db626be&chksm=faa31941cdd49057ec6aa23b5541e0b1ce49574808f55068a0b3c0bc829ef281c47cfba53f59&scene=21#wechat_redirect)

- [新一代日志型系统在 SOFAJRaft 中的应用](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247497065&idx=1&sn=41cc54dbca1f9bb1d2e50dbd181f062d&chksm=faa31ab3cdd493a52bac26736b2d66c9fcda77c6591048ae758f9663ded0a1a068947a8488ab&scene=21#wechat_redirect)

- [终于！SOFATracer 完成了它的链路可视化之旅](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247496554&idx=1&sn=b6c292ee9b983a2344f2929390fe15c4&chksm=faa31cb0cdd495a6770720e631ff338e435998f294145da18c04bf34b82e49d2f028687cad7f&scene=21#wechat_redirect)

- [蚂蚁集团技术风险代码化平台实践（MaaS）](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247495808&idx=1&sn=88246170520e1e3942f069a559200ea4&chksm=faa31f5acdd4964c877ccf2a5ef27e3c9acd104787341e43b2d4c01bed01c91f310262fb0ec4&scene=21#wechat_redirect)

>![weekly.jpg](https://gw.alipayobjects.com/zos/bmw-prod/5f2e9662-eff8-4b6b-abb6-08799da42fcc.webp)
