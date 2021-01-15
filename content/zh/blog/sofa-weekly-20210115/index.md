---
title: "SOFA Weekly | Occlum 发布新版本，Seata QA 整理"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | Occlum 发布新版本，Seata QA 整理"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2021-01-15T15:00:00+08:00
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

**@吴小彬** 提问：

> 请教下，如果分支事务中使用了分库分表中间件（shardingsphere-proxy、mycat 等），Seata-AT 模式是不是不能用的？是只可以用 TCC 模式吗？现在的 shardingsphereProxy 中间件（不是 shardingsphereJdbc ）用 AT 模式，它对微服务来说就是一个 MySQL 连接，它是怎么知道微服务调用链中的 xid 的？

A：可以用，shardingsphere 4.1 支持 Seata AT， proxy 我估摸着有点悬，因为他属于一个代理层。Jdbc 是直接在应用的 Jdbc 层提供服务的，所以 AT 可以很好的支持。

**@谭玖朋** 提问：

> 在关于 AT 模式，第一阶段执行完后生成行锁然后注册分支事务，其中的行锁具体是指什么锁呢？因为发现第一阶段执行完后，其实再查数据的话是已经改变了。所以关于这个行锁这么解释？

A：Select for update 的时候，首先 Seata 会代理这个语句，去查询 TC 这个行有没有锁住，如果没锁住，客户端业务用了 for update 那么就拿到了本地锁，此时因为本地锁排他，这个时候没有全局锁的 for update 就是分布式下的读已提交。
不是允许脏读，是读已提交。读未提交是默认的，所以只有在你 update 的时候（update 是当前读），但是如果你的 update 是基于快照度的 select 结果，可能会出现事与愿违的结果，如果你要基于某个数据来 update，要么 for update 来读分布式下的已提交，要么就用 update x=x-1 之类的写法，因为提交时会抢占全局锁，没抢到会 rollback，释放当前锁进行重试，这样就能保证抢到锁的时候，update 的数据当前读是分布式下的读已提交并修改
目前好像没人写关于 AT 行锁及全局锁部分源码有分析讲解的资料，如果感兴趣可以去阅读一下，写出来投稿给我们。

Seata：https://github.com/seata/seata

### 本周推荐阅读

- [Mecha：将 Mesh 进行到底](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247486103&idx=1&sn=43596d43e95439fdcdb3843726b13267&chksm=faa0e54dcdd76c5bdfd901f2812dd158011bb5dc4860a5d6d9b00f0073e0074d5e5a2ef94529&scene=21)
- [记一次在 MOSN 对 Dubbo、Dubbo-go-hessian2 的性能优化](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247486296&idx=1&sn=855f5ae48c4da2dace79f6956afdb646&chksm=faa0e482cdd76d94f3b59e6d7edcaebe316faac9e74c668dd33977f7705c208fe68d782e15d2&scene=21)
- [Service Mesh 和 API Gateway 关系深度探讨](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247486032&idx=1&sn=733afe0fa68fc4bda5b52e9a523017a5&chksm=faa0e58acdd76c9c4c134bb99f8766a86051d0f5a16ff4002d5462138582941744016f9e94ba&scene=21)
- [Service Mesh 通用数据平面 API（UDPA）最新进展深度介绍](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247485961&idx=1&sn=2425bf90ec108d669feb8475f1334e97&chksm=faa0e5d3cdd76cc5bf50d98fbd4fea7f3c131cd926714f138641836cae1410c2b9e343af0a2c&scene=21)

### Occlum 项目进展

**Occlum 发布 v0.19.1 版本，主要变更如下：**

i.同时兼容 Glibc 和 musl libc的应用

ii. 支持基于 DCAP (Intel SGX Data Center Attestation Primitives) 的远程验证

iii. 修复了内存泄漏问题

详细发布报告：
[https://github.com/occlum/occlum/releases/tag/0.19.1](https://github.com/occlum/occlum/releases/tag/0.19.1)
