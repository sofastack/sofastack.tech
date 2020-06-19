---
title: "SOFA Weekly | SOFAJRaft、Occlum 发布、社区直播预告"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2020-06-19T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563524226806-e93607a3-1b77-4ca2-8c3c-0384ab966154.png"
---

**SOFA WEEKLY | 每周精选，筛选每周精华问答**

**同步开源进展，欢迎留言互动**

![weekly](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1562925824761-fc720f21-9622-437b-a783-0b0729eda119.jpeg)

SOFAStack（Scalable Open Financial Architecture Stack）是蚂蚁金服自主研发的金融级分布式架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

- **SOFAStack 官网:** [https://www.sofastack.tech](https://www.sofastack.tech/)
- **SOFAStack:** [https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动
我们会筛选重点问题通过 " SOFA WEEKLY " 的形式回复

**1、@雷霆 提问：**

> 各位大佬 请问 TCC 拦截器这块为什么 xid 要先解绑，再绑定呢，这样做是有什么考虑吗？
> ![image.png](https://cdn.nlark.com/yuque/0/2020/png/226702/1592550771257-7cb0da87-2976-4b44-a4a8-ad5899e840e2.png)

A：执行 TCC 分支时，首先会解绑 xid，这是因为在 TCC 分支内，是不需要执行 AT 的 SQL 解析和自动补偿的（可以在 seata-rm-datasource 的 ExecuteTemplate 里看下实现），同时需要绑定下当前的拦截类型 TCC，这个拦截器类型在跨服务传递时也有特殊处理，建议也看下跨服务传递的源码。最后然后执行完 TCC 分支后的解绑、还原 xid 的操作，就是一个事务上下文的还原了。你目前看到的这个源码，后续我们还会优化下，更方便理解。这一系列操作是为了根据分支类型来区分分支事务的行为：AT 分支的行为是自动补偿，会走 SQL 解析和 undo 回滚，TCC 分支的行为是手动补偿，不会走 undo，而是执行用户自定义的 try 和 confirm。

**2、@taking 提问：**

> 为何 TCC 模式的分支事务 commit 需要同步呢？

A：因为如果异步 commit 会存在，退款的问题，如果没有 commit 那么事务没有完成，这时来了一笔退款交易，则原交易状态没有完成，会失败。当然也可以异步化，但是需要能够容忍一些反向交易的失败，或对反向交易做特殊处理。

> 如果 commit 被阻塞，退款请求也一样还是会失败吧？

A：commit 被阻塞，说明支付还没有成功，前面不会发起退款的。

> 可以考虑在 LocalTCC 注解上加个属性表示是否允许异步执行。

A：也可以的，然后在反向交易时需要能判断这个正交易是否已经完成，没有完成，触发一次事务恢复，进行 commit，然后再执行反交易。

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

### 本周推荐阅读

- [蚂蚁金服智能监控云原生可观测大盘设计概览](/blog/antfin-monitoring-cloud-native-observable-market-design-overview/)
- [再启程，Service Mesh 前路虽长，尤可期许](/blog/service-mesh-the-road-ahead-long/)
- [蚂蚁金服在 Service Mesh 监控落地经验分享](/blog/antfin-service-mesh-monitor-landing-experience/)

### SOFA 项目进展

**本周发布详情如下：**

**1、发布 SOFAJRaft v1.3.2 版本，主要变更如下：**

- 抽象出网络通信层，增加 GRPC 实现并支持 Replication Pipeline，用户亦可自行对通信层进行其他实现的扩展；
- RheaKV 增加 reverseScan API ；
- 提供 Replicator 与 RPC 的线程池隔离，避免相互影响；
- read-index 线性一致读请求提供请求超时（timeout）配置；
- 几个 corner case 修复，比如 replicate logs 如果比 appliedIndex（follower）更小，那么可以认为是成功的；
- 致谢（排名不分先后）
[@shibd ](https://github.com/shibd)、[@SteNicholas ](https://github.com/SteNicholas)、[@killme2008 ](https://github.com/killme2008)、[@zongtanghu ](https://github.com/zongtanghu)

详细发布报告：
[https://github.com/sofastack/sofa-jraft/releases/tag/1.3.2](https://github.com/sofastack/sofa-jraft/releases/tag/1.3.2)

**2、发布 Occlum v0.13.0 版本，主要变更如下：**

- 扩展了Occlum.json的配置格式，更强大，更易读；
- 增加了3个新的系统调用；
- 增强了编程语言支持：支持了 Rust、改进了 Python 和 Go 的 demo；

详细发布报告：
[https://github.com/occlum/occlum/releases/tag/0.13.0](https://github.com/occlum/occlum/releases/tag/0.13.0)

### 社区活动报名

![SOFAChannel#17](https://cdn.nlark.com/yuque/0/2020/png/226702/1591346387297-036464d1-dc13-47b2-baa3-1b1362fcd072.png)

SOFABolt 是蚂蚁金服开源的一套基于 Netty 实现的，轻量、易用、高性能、易扩展的网络通信框架。在蚂蚁金服的分布式技术体系下，我们有大量的技术产品都需要在内网进行节点间的通信。每个产品都需要考虑高吞吐、高并发的通信，私有协议设计、连接管理、兼容性等问题。

为了将开发人员从通信框架的实现中解放出来，专注于自己产品的能力建设上，我们将在微服务与消息中间件在网络通信上解决的问题以及积累的经验进行了总结，设计并实现了 SOFABolt。

本期分享将邀请 SOFABolt 开源负责人丞一，介绍 SOFABolt 的基本功能和部分实现原理，并介绍协议框架的实现。

你将收获：

- 了解 SOFABolt 的基础使用及 SOFABolt 部分功能的实现原理；
- 了解 SOFABolt 协议框架的设计以及如何拓展实现自定义私有协议；
- 了解如何设计一个通信框架；

活动详情：

- **直播主题：**SOFAChannel#17：网络通信框架 SOFABolt 的功能介绍及协议框架解析
- **分享嘉宾：**丞一，蚂蚁金服技术专家，主要从事通信中间件相关的开发工作，SOFABolt 开源负责人。
- **直播时间：**2020/7/2（周四）19:00-20:00
- **直播间：**点击“[**这里**](https://tech.antfin.com/community/live/1265)”，即可报名
