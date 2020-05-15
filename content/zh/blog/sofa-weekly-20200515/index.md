---
title: "SOFA Weekly | SOFABoot&SOFAHessian 发布、5/21 社区直播预告"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2020-05-15T17:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563524226806-e93607a3-1b77-4ca2-8c3c-0384ab966154.png"
---

**SOFA WEEKLY | 每周精选，筛选每周精华问答**

**同步开源进展，欢迎留言互动**

![weekly](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1562925824761-fc720f21-9622-437b-a783-0b0729eda119.jpeg)

SOFAStack（Scalable Open Financial Architecture Stack）是蚂蚁金服自主研发的金融级分布式架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

- **SOFAStack 官网: **[https://www.sofastack.tech](https://www.sofastack.tech/)
- **SOFAStack: **[https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动
我们会筛选重点问题通过 " SOFA WEEKLY " 的形式回复

**1、@黄泽宏 **提问：

> SOFAJRaft 中 rheakv 不实现 region 新增删除，是因为分片迁移比较复杂么？

A：不知道您说的新增删除是指什么？ 分裂与合并？ 分裂是有的，合并没有，不过分裂还没有经过严格的验证，也暂时不建议使用，分裂和合并确实比较复杂，复杂的不是分片迁移，分片迁移只要 raft 协议实现的没问题就是很自然的事情了。

> 对，sharding 合并分裂迁移，代码大概在哪个位置呢，想先看下实现。

A：com.alipay.sofa.jraft.rhea.StoreEngine#applySplit 从这里看吧。
SOFAJRaft：[https://github.com/sofastack/sofa-jraft](https://github.com/sofastack/sofa-jraft)

**2、@廖景楷** 提问：

> 请教 Seata 在做超时处理时怎么协调多个节点不会同时对某个事务做多次处理？还是说要求业务容许多次commit，rollback，Seata 就不协调了？
> 我在测试 seata-server 多节点 HA 部署，用 MySQL 存储，看代码貌似所有节点都是无差别无状态的，在多个实例的 DefaultCoordiantor 里头有定时器去扫描超时的事务进行重试或者回滚，打开 general log 也发现有多个客户端 IP 在用同样的语句在扫描 global_table 表进行超时等处理。想确认一下多节点间是否有协调机制？
> 我在 K8s下面部署3节点的 seata-server statefulset，镜像 docker.io/seataio/seata-server:latest 使用 Nacos 作为 registry。

A：目前没有，多次不会导致数据问题，不过确实浪费资源，可以考虑引入分布式 job。

> 也就是说比如同一个超时的未 commit Global Session 被多个节点同时扫描到，可能会调用业务做多次 commit，然后由业务自己去重？

A：是的，不过不是业务处理，框架会处理。

**3、@Cheng cheng** 提问：

> 最近正在做 Seata 跟我们产品集成到研究，问一个小白问题，我们需要把 Seata 部署到 K8s 里，那么如果 Seata server 的一个 pod 突然挂了，那在途的调用会突然中断，这样依然可以完美控制事务达成数据一致性吗？

A：如果 Server 是公用的一个 DB，理论上没问题的。

> 没有理解你说的公用 DB.... Seata Server 在 K8s 上用独立的几个 pod 部署，那相应的我们会给它单独创建数据库。

A：Seata 高可用要求就是需要 server 的集群共用同一个 Seata 库，不然无法数据共享，也就是无法知晓当前运作的事务信息。首先你要保证 Server 集群用的同一个注册中心集群，并且共用同一个 Seata 库，这样才能保障数据共享、高可用。

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

### 本周推荐阅读

- [Mecha：将 Mesh 进行到底](https://www.sofastack.tech/blog/mecha-carry-mesh-to-the-end/)
- [陌陌的 Service Mesh 探索与实践 | 线上直播回顾](https://www.sofastack.tech/blog/momo-service-mesh-exploration-and-practice/)
- [《Service Mesh Virtual Meetup#1》：视频回顾](https://space.bilibili.com/228717294)

### ****SOFA 项目进展****

**本周发布详情如下：**

**1、发布 SOFABoot v3.4.0 版本，主要变更如下：**

- 支持基于 gRPC 的 triple 协议；
- 修复 bolt callback 方式的兼容问题；

详细发布报告：[https://github.com/sofastack/sofa-boot/releases/tag/v3.4.0](https://github.com/sofastack/sofa-boot/releases/tag/v3.4.0)

**2、发布 SOFAHessian v4.0.4 版本，主要变更如下：**

- 修复 JDK 判断逻辑有锁问题；
- 修复 _staticTypeMap 为 ConcurrentMap，和 v3.x 对齐；

详细发布报告：
[https://github.com/sofastack/sofa-hessian/releases/tag/v4.0.4](https://github.com/sofastack/sofa-hessian/releases/tag/v4.0.4)

### 社区直播报名

![detail banner#16](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1589526954817-688c4814-e4b2-43e8-9ad3-11cc80de4286.jpeg)

在云原生时代，容器和 Kubernetes 在日常工作和实际生产中越来越普遍，随之而来的隔离性问题在不断被提起同时也受到了越来越多的关注。

SOFAChannel#16 线上直播带来《不得不说的云原生隔离性》分享，将邀请 Kata Containers 维护者彭涛（**花名：巴德**）带我们走近云原生基础设施 -- Kata Containers，详细分享它是如何在云原生框架下解决容器隔离性问题的。

将从以下几个方面，与大家交流分享：

- 从 Kubernetes Pod 说起，经典容器场景下的 Pod 分享；
- 共享内核存在的问题以及解决办法；
- 上帝说，要有光；我们说，要有 Kata；
- The speed of containers, the security of VMs；
- Kata Containers 特性大放送；
- What? 你刚说过增加一个 VM 间接层的问题？

活动详情：

- **直播主题：**SOFAChannel#16：不得不说的云原生隔离性
- **直播时间：**2020/5/21（周四）19:00-20:00
- **报名方式：**点击“[这里](https://tech.antfin.com/community/live/1197)”，即可报名
