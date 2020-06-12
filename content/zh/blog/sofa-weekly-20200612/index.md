---
title: "SOFA Weekly | 绝妙的机会与 SOFAStack 一起玩、社区直播预告"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2020-06-12T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563524226806-e93607a3-1b77-4ca2-8c3c-0384ab966154.png"
---

**SOFA WEEKLY | 每周精选，筛选每周精华问答**
**同步开源进展，欢迎留言互动**

![weekly.jpg](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1562925824761-fc720f21-9622-437b-a783-0b0729eda119.jpeg)

SOFAStack（Scalable Open Financial Architecture Stack）是蚂蚁金服自主研发的金融级分布式架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

- **SOFAStack 官网:** [https://www.sofastack.tech](https://www.sofastack.tech/)
- **SOFAStack:** [https://github.com/sofastack](https://github.com/sofastack)

### 这里有个机会和 SOFAStack 一起玩，你要不要来？

阿里巴巴编程之夏（Alibaba Summer of Code，以下简称 ASoC）是面向全球18岁及以上本科、硕士、博士高校学生的编程普惠计划，鼓励高校学生深度参与开源开发活动，以第一视角感受开源世界的魅力，成为开源社区新鲜“血液”。

**今年 SOFAStack 开源社区也加入了选题，有兴趣的同学可以尝试下以下 feature：**

**SOFAJRaft**

是基于 RAFT 一致性算法的生产级高性能 Java 实现，支持 MULTI-RAFT-GROUP，适用于高负载低延迟的场景。 使用 SOFAJRaft 你可以专注于自己的业务领域，由 SOFAJRaft 负责处理所有与 RAFT 相关的技术难题，并且 SOFAJRaft 非常易于使用。

- Feature1:当前 LogStorage 的实现，采用 index 与 data 分离的设计，我们将 key 和 value 的 offset 作为索引写入 rocksdb，同时日志条目（data）写入 Segnemt Log，因为使用 SOFAJRaft 的用户经常也使用了不同版本的 rocksdb，这就要求用户不得不更换自己的 rocksdb 版本来适应 SOFAJRaft， 所以我们希望做一个改进：移除对 rocksdb 的依赖，构建出一个纯 java 实现的索引模块。这个 feature 难度适中，[https://github.com/sofastack/sofa-jraft/issues/453](https://github.com/sofastack/sofa-jraft/issues/453)

-  Feature2:这个 feature 更有挑战些，在 multi raft group 场景中，可能有多个 raft node 在同一个进程中并且很多都是 leader，当他们各自向自己的 followers 发送心跳时会过多的消耗 CPU 和网络 IO。例如我们可以在同一个进程内共享心跳计时器并将这些 leaders 发往同一台机器的心跳请求合并起来发送出去，以此来减少系统消耗，当然你还可以提供更多的优化方案。欢迎尝试 [https://github.com/sofastack/sofa-jraft/issues/454](https://github.com/sofastack/sofa-jraft/issues/454)

**SOFABolt**

是基于 Netty 最佳实践的轻量、易用、高性能、易扩展的通信框架。 这些年我们在微服务与消息中间件在网络通信上解决过很多问题，我们把总结出的解决方案沉淀到 SOFABolt 这个基础组件里，让更多的使用网络通信的场景能够统一受益。

- Feature：当前的SOFABolt实现中私有协议是直接和整体框架耦合在一起的，在使用SOFABolt的同时需要使用提供的私有协议，当用户希望使用自己的自定义协议时需要进行比较有挑战的代码拓展才能实现。因此我们希望对SOFABolt的协议框架做一些重构以支持快速方便的集成用户的自定义协议。这个 feature 稍有难度，欢迎尝试，[https://github.com/sofastack/sofa-bolt/issues/224](https://github.com/sofastack/sofa-bolt/issues/224)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动

我们会筛选重点问题通过 " SOFA WEEKLY " 的形式回复

**1、@明詹** 提问：

> 问下 SOFATracer 现在支持 RabbitMQ 吗？

A：原生 RabbitMQ API ，Tracer 是没有埋点的；如果和 Spring 集成的，可以基于 Spring Message 方式埋点。使用最新版本即可。
SOFATracer：[https://github.com/sofastack/sofa-tracer](https://github.com/sofastack/sofa-tracer)

**2、@雷霆** 提问：

> 请问一下，如果 TCC 在提交全局事务时失败了，比如网络或者 TC 服务异常，导致 TC 压根没有收到全局事务提交的通知，此时 TM 会抛一个异常，导致整个业务处理失败，这个时候已经在一阶段冻结的资源还会回滚吗？看了 Seata 源码，对于这种情况没有看到有触发回滚的操作。

A：TCC 先注册分支再执行 Try，如果注册分支失败那么 Try 不会执行，如果注册分支成功了 Try 方法失败了，那应该抛出异常触发主动回滚或者触发 Server 超时回滚。

> 那如果分支已经注册成功，且 Try 也执行成功了，就是在 TM 向 TC 发起 global commit 时失败了，TM 多次重试失败后抛了异常，TC 没有收到 commit，这种情况下还会有 rollback 吗？

A：这种情况触发超时回滚，TC 主动来回滚超时的事务。

> 明白了 谢谢~

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

### 本周推荐阅读

- [记一次在 MOSN 对 Dubbo、Dubbo-go-hessian2 的性能优化](https://www.sofastack.tech/blog/mosn-dubbo-dubbo-go-hessian2-performance-optimization/)
- [Forrester 中国首席分析师戴鲲：云原生技术趋向成熟，金融企业选择云原生平台需满足三大要求](https://www.sofastack.tech/blog/forrester-daipeng-white-paper-cloud-native/)

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
