---
title: "SOFA Weekly | QA 整理"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | QA 整理"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2021-01-22T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563524226806-e93607a3-1b77-4ca2-8c3c-0384ab966154.png"

---

SOFA WEEKLY | 每周精选，筛选每周精华问答
同步开源进展，欢迎留言互动

![weekly.jpg](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1562925824761-fc720f21-9622-437b-a783-0b0729eda119.jpeg)

SOFAStack（Scalable Open Financial Architecture Stack）是蚂蚁金服自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

SOFAStack 官网: [https://www.sofastack.tech](https://www.sofastack.tech/)

SOFAStack: [https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动
我们会筛选重点问题
通过 " SOFA WEEKLY " 的形式回复

**@叶毅威** 提问：

> 请教下 SOFARegistry 数据持久化在哪里啊?

A：SOFARegistry 的元数据（注册中心自身的 IP 列表之类的数据）存储在 meta 角色内，使用 JRaft 进行存储。 应用的发布数据保存在 data 角色的内存中，采用三副本（可配置）的方式实现高可用。

SOFARegistry：[https://github.com/sofastack/sofa-registry](https://github.com/sofastack/sofa-registry)

**@叶毅威** 提问：

> 我用 SDK 调用注册了一个 datainfo 但是关掉之后 这个并没有下线，是哪里需要配置么，不是默认链接断开就下线么？

A：session 上采用 HTTP 方式获取的数据都是当前节点的注册数据，只有 data 上才会做数据聚合。 dataInfo 是不会被删除的，连接断开后对应 dataInfo 下的对应 Publisher 会被自动移除。

SOFARegistry：[https://github.com/sofastack/sofa-registry](https://github.com/sofastack/sofa-registry)

**@田冲** 提问：

> 现象：canal 监听到某个被分布式事务控制的表的 insert-binlog 日志后再去查询 MySQL 表里数据时发现这条数据不存在，延迟1秒钟左右再查询就能查询到。
> 疑问：seata-at 模式-两阶段提交的设计会出现 MySQL 先生成了 binlog 日志，后提交事务的情况吗？

A：这个问题其实很简单，你 canal 读不到，那你自己应用本地事务提交后马上读这个 insert 的数据看能不能读到；如果读到，理论上来说这个过程不可能超过一秒，所以如果你应用能查到，你canal查不到，排查canal的问题，而不是 Seata 的问题；Seata 最后也只不过做了 connection.commit；最后事务的提交落库是数据库方本地事务流程落库，Seata 不会起到任何干扰，Seata 代理的是 jdbc 层的处理；redo 后写 binlog 时马上就会广播的，而不是事务提交才把 binlog 广播出去；所以内 xa 的二阶段没提交你就去查主库，由于隔离级别不一定查得到。

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

### 本周推荐阅读

-  [Kubernetes 是下一代操作系统 | 面向 Kubernetes 编程](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247484759&idx=1&sn=25df16461d0ea9f49fd5c36101f8b2ea&chksm=faa0ea8dcdd7639b1e2439f2fc3ddbdd3c690ea016069b77a842ddb9b02b85f4a7ce5f5f6790&scene=21)

-  [蚂蚁集团生产级 Raft 算法库 SOFAJRaft 存储模块剖析 | SOFAJRaft 实现原理](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247485000&idx=1&sn=42b6f967b2ad43dd82983929d5800a33&chksm=faa0e992cdd7608499b5d58a65334653059acc2e35381157724c55d6a50743ba024298c63384&scene=21)

-  [蚂蚁集团服务注册中心 MetaServer 功能介绍和实现剖析 | SOFARegistry 解析](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247485415&idx=1&sn=7e006e90d8ca713fa560921a1c2c06e6&chksm=faa0e83dcdd7612b1d6269b25dcde34541a42782b519e4a9f942fbf0f8d7d7967dadbec8bfa9&scene=21)

-  [开箱即用的 Java Kubernetes Operator 运行时](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247485792&idx=1&sn=dd7201a60249b5c2946e2f398928f4a1&chksm=faa0e6bacdd76fac685ec5a202b217f5c6c14338f8fc37effdc001375a0942b18eca8091cc26&scene=21)
