---
title: "SOFA Weekly | 1.9直播预告、MOSN 发版、Saga 状态机设计器视频教程"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "【12/31-01/03】 | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2020-01-03T16:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563524226806-e93607a3-1b77-4ca2-8c3c-0384ab966154.png"
---

**SOFA WEEKLY | 每周精选，筛选每周精华问答**

**同步开源进展，欢迎留言互动**

![weekly](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1562925824761-fc720f21-9622-437b-a783-0b0729eda119.jpeg)

SOFAStack（Scalable Open Financial Architecture Stack）是蚂蚁金服自主研发的金融级分布式架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

**SOFAStack 官网: **[https://www.sofastack.tech](https://www.sofastack.tech/)

**SOFAStack: **[https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动
我们会筛选重点问题通过 " SOFA WEEKLY " 的形式回复

Seata：Simple Extensible Autonomous Transaction Architecture，是一套一站式分布式事务解决方案，提供了 AT、TCC、Saga 和 XA 事务模式，其中长事务解决方案 Saga 模式有着无锁高性能、异步架构高吞吐的优势。

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

Saga 状态机在线设计器：[http://seata.io/saga_designer/index.html](http://seata.io/saga_designer/index.html)

Saga 状态机设计器视频教程：[http://seata.io/saga_designer/vedio.html](http://seata.io/saga_designer/vedio.html)

**1、@李宇博 **提问：

> 您好，我这边看视频直接把 Catch 直接拖到 serviceTask 上，好像没有生效，需要连线还是配置什么属性吗？

A：没有生效是指什么？Catch 要连一个线到一个其它的 state，意思是捕获到异常后，去执行一个分支，这个 state可以是任何类型的 state，比如 CompensationTrigger、ServiceTask，通常是 CompensationTrigger，立即触发补偿。

> 我是直接连接到 compensateTrigger 上的，然后我手动抛出异常，并没有执行补偿方法，而是在不停的重试调用之前抛出异常的方法。

A：需要在线上配置异常类型：

![线上配置异常类型](https://cdn.nlark.com/yuque/0/2020/png/226702/1578042062031-8058a9ce-50cc-4527-bac1-56d882703abb.png)

**2、@J～杰** 提问：

> 咨询一个问题，AT 模式分支事物注册的时候会获取锁，锁名就是和 table+主键有关系的，由于压力测试的时候，有个 check 去数据库查询同一个 rowkey，导致直接获取锁失败，在业务上就是业务失败回滚了，这种有啥办法？

A：你的意思是热点数据问题吗？

> 可以理解成热点数据，我这边的测试场景就是下单减库存，2个微服务，库存由于基本上是同一行库存数据。

A：热点数据撞锁是正常的，你可以用自旋锁，让其它事务等待一下再获取锁，而不是立即失败。[http://seata.io/zh-cn/docs/user/configurations.html](http://seata.io/zh-cn/docs/user/configurations.html)

![配置](https://cdn.nlark.com/yuque/0/2020/png/226702/1578042062041-af363e5d-16c1-41ab-a6c2-f2f18e52b2f5.png)

> 本地调用 Dubbo 微服务是可以的，用 Saga 状态机就报这个问题，报服务没有提供者。

A：你的 Service 是用的 XML 注册的还是用的注解注册的？

> 注解的方式。

A：嗯嗯。你尝试用 XML 方法注册一个 Bean 看看行不行，机制上可能有不一样，因为 Saga 状态机是通过 getBean 反射去调方法。而 Dubbo 的注解是通过代理的方式来注入一个对象，这个对象是不是一个有完全成功的 Bean，不确定。之前我遇到过 TCC 用注解不好使，用 XML 好使的问题。

### 本周推荐阅读

- [基于 Knative 打造生产级 Serverless 平台 | KubeCon NA2019](/blog/knative-serverless-kubecon-na2019/)
- [将 Sidecar 容器带入新的阶段 | KubeCon NA 2019](/blog/sidacar-kubecon-na2019/)

### SOFARegistryLab 系列

- [服务注册中心如何实现秒级服务上下线通知 | SOFARegistry 解析](/blog/sofa-registry-service-offline-notification/)
- [蚂蚁金服服务注册中心 Session 存储策略 | SOFARegistry 解析](/blog/sofa-registry-session-storage/)
- [蚂蚁金服服务注册中心数据分片和同步方案详解 | SOFARegistry 解析](/blog/sofa-registry-data-fragmentation-synchronization-scheme/)
- [蚂蚁金服服务注册中心 MetaServer 功能介绍和实现剖析 | SOFARegistry 解析](/blog/sofa-registry-metaserver-function-introduction/)
- [蚂蚁金服服务注册中心 SOFARegistry 解析 | 服务发现优化之路](/blog/sofa-registry-service-discovery-optimization/)
- [海量数据下的注册中心 - SOFARegistry 架构介绍](/blog/sofa-registry-introduction/)

### SOFA 项目进展

**本周发布详情如下：**

**1、发布 MOSN v0.9.0 版本，主要变更如下：**
i. 重构了包引用路径，从 sofastack.io/sofa-mosn 变更为 mosn.io/mosn；
ii. 支持变量机制，accesslog 修改为使用变量机制获取信息；
iii. 修复在 proxy 协程 panic 时导致的内存泄漏；
iv. 修复在特定的场景下，读写协程卡死导致的内存泄漏；
v. 修复 HTTP2 Stream 计数错误的 bug；

详细发布报告：[https://github.com/mosn/mosn/releases/tag/0.9.0](https://github.com/mosn/mosn/releases/tag/0.9.0)

### 社区直播预告

![SOFAChannel#10](https://cdn.nlark.com/yuque/0/2020/png/226702/1578042193692-cf1f9429-7dcb-44b7-93fc-fa335c7eeb02.png)

新年快乐~2020年第一期线上直播来啦，SOFAChannel#10 将和大家一起探讨 《分布式事务 Seata 长事务解决方案 Saga 模式详解》，将从金融分布式应用开发的痛点出发，结合 Saga 分布式事务的理论和使用场景，讲解如何使用 Seata Saga 状态机来进行服务编排和分布式事务处理，构建更有弹性的金融应用，同时也会从架构、原理、设计、高可用、最佳实践等方面剖析 Saga 状态机的实现。

**主题**：SOFAChannel#10：分布式事务 Seata 长事务解决方案 Saga 模式详解

**时间**：2020年1月9日（下周四）19:00-20:00

**嘉宾**：陈龙（花名：屹远） 蚂蚁金服分布式事务核心研发、Seata Committer

**形式**：线上直播

**报名方式**：点击“[这里](https://tech.antfin.com/community/live/1076)”，即可报名