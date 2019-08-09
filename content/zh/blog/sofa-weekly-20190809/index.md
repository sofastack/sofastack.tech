---
title: "SOFA Weekly | 每周精选【8/5 - 8/9】"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2019-08-09T16:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563524226806-e93607a3-1b77-4ca2-8c3c-0384ab966154.png"
---

**SOFA WEEKLY | 每周精选，筛选每周精华问答**
**同步开源进展，欢迎留言互动**

![weekly.jpg](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1562925824761-fc720f21-9622-437b-a783-0b0729eda119.jpeg)

SOFAStack（Scalable Open Financial Architecture Stack）是蚂蚁金服自主研发的金融级分布式架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。
**SOFAStack 官网: **[https://www.sofastack.tech](https://www.sofastack.tech/)
**SOFAStack: **[https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动
我们会筛选重点问题通过 
" SOFA WEEKLY " 的形式回复

关于 [SOFAJRaft 日志复制 - pipeline 实现剖析 | SOFAJRaft 实现原理](https://www.sofastack.tech/blog/sofa-jraft-pipeline-principle/) 的讨论：
**@龚小涛** 提问：
> 对于快照部分讲解是对某一刻时间点的数据做的快照吗，然后此快照最新的记录下 logindex term 等信息？

A：快照里记录的数据不是日志复制的数据，而是状态机执行的结果，这个快照数据保存的动作是由用户通过实现这个接口来实现的：
com.alipay.sofa.jraft.StateMachine#onSnapshotSave 。当然，里面的快照里面还包括了一些 index、term 等元信息。所以如果你理解的数据是由状态机执行的结果，那理解是对的。

> 关于快照的解决方案中是对数据集合的快照，这里可以细说下吗？

A：快照中保存的是用户自定义的状态机的当前的状态，具体内容需要用户自己去实现，你可以看下这个接口：
com.alipay.sofa.jraft.StateMachine#onSnapshotSave，比如 Counter 这个 example 中，保存的就是计数器当前的 value。

### SOFAJRaftLab 系列阅读

- [SOFAJRaft 日志复制 - pipeline 实现剖析 | SOFAJRaft 实现原理](https://www.sofastack.tech/blog/sofa-jraft-pipeline-principle/)
- [SOFAJRaft-RheaKV MULTI-RAFT-GROUP 实现分析 | SOFAJRaft 实现原理](https://www.sofastack.tech/blog/sofa-jraft-rheakv-multi-raft-group/)
- [SOFAJRaft 选举机制剖析 | SOFAJRaft 实现原理](https://www.sofastack.tech/blog/sofa-jraft-election-mechanism/)
- [SOFAJRaft 线性一致读实现剖析 | SOFAJRaft 实现原理](https://www.sofastack.tech/blog/sofa-jraft-linear-consistent-read-implementation/)
- [SOFAJRaft-RheaKV 是如何使用 Raft 的 | SOFAJRaft 实现原理](https://www.sofastack.tech/blog/sofa-jraft-rheakv/)
- [生产级 Raft 算法库 SOFAJRaft 存储模块剖析 | SOFAJRaft 实现原理](https://www.sofastack.tech/blog/sofa-jraft-algorithm-storage-module-deep-dive/)

### SOFA 项目进展

**本周发布详情如下：**

**发布 SOFARegistry 5.2.1, 主要变更如下：**
i. 安全修改，升级 Jettyserver 版本到 9.4.17.v20190418.
ii. jraft bug 修正版本到1.2.5
iii. 修复 dataServer 启动没有 working 时刻一些操作延迟处理问题
iv. data 重连 meta 逻辑 bug 导致所有 data 无法连接 meta 修改
v. data 从 working 状态变回 init 状态 bug 修改
详细发布报告：
[https://github.com/sofastack/sofa-registry/releases/tag/v5.2.1](https://github.com/sofastack/sofa-registry/releases/tag/v5.2.1)

### SOFA 活动推荐

![SOFAMeetup#3](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1564110550075-7e78ec32-dbf1-4970-8bfc-bd3bcf7e47c1.jpeg)

SOFA Meetup #3**《从开源技术到产品能力》，**本周日我们在广州等你~

本期活动将为大家带来蚂蚁金服在这些方面的探索和实践，解析 SOFARPC、分布式事务 Seata、无线自动化测试框架 SoloPi 等开源项目的内部大规模落地和社区发展，并且通过可观察性的理念，实现对微服务，Service Mesh 以至未来的 Serverless 架构的应用进行监控，帮助大家应对从应用架构过渡到云原生架构的挑战。

报名方式：点击“[**这里**](https://www.sofastack.tech/activities/sofa-meetup-3/)”了解活动详情。