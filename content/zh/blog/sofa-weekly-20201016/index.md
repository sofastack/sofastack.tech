---
title: "SOFA Weekly | SOFAJRaft 发布、SOFAJRaft 源码解析文章合集"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "【10/12-10/16】 | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2020-10-16T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563524226806-e93607a3-1b77-4ca2-8c3c-0384ab966154.png"
---

**SOFA WEEKLY | 每周精选，筛选每周精华问答**

**同步开源进展，欢迎留言互动**

![weekly](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1562925824761-fc720f21-9622-437b-a783-0b0729eda119.jpeg)

**SOFA**Stack（**S**calable **O**pen **F**inancial **A**rchitecture Stack）是蚂蚁集团自主研发的金融级分布式架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

- **SOFAStack 官网：**[https://www.sofastack.tech](https://www.sofastack.tech/)
- **SOFAStack：**[https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动
我们会筛选重点问题通过 " SOFA WEEKLY " 的形式回复

**1、@谢子华** 提问：

> > SOFARPC 客户端A调用服务端 B，B在方法中想异步调用C（不同步等结果），在callback里面才响应结果返回给A。这种有 Demo 吗？

A：链路异步吗？ 可直接看测试用例  [https://github.com/sofastack/sofa-rpc/blob/master/test/test-integration/src/test/java/com/alipay/sofa/rpc/test/async/AsyncChainTest.java](https://github.com/sofastack/sofa-rpc/blob/master/test/test-integration/src/test/java/com/alipay/sofa/rpc/test/async/AsyncChainTest.java)

> 谢谢，看了下用例。我理解是 服务端接口执行时在 RpcInvokeContext 设置了 SendableResponseCallback 类型的 callback。SOFA 就会忽略接口的返回值。然后在 callback 中主动调用 sendAppResponse 返回结果。对吗？

A：对的。

SOFARPC：[https://github.com/sofastack/sofa-rpc](https://github.com/sofastack/sofa-rpc)

2、**@明丽** 提问：

> 有没有存在经常锁表的童鞋？lock_table 里存在锁表数据和 undo_log 里面有历史几天的数据没有被删除掉？

A：locktable 如果没删除，说明可能遇到脏数据导致分支事务无法回滚，此时就会有锁无法释放，这时候要根据 locktable 的信息去找对应的分支事务是那个应用，去看下日志提示，如果是脏数据会说镜像校验不通过

> 这里的脏数据具体是指什么样的数据？

A：全局事务是回滚时，需要回滚的数据被改动。

> 通常报错的就是并发情况下扣减库存，操作同一条 update 库存数量语句。

A：比如 a=1，update 后时 a=2。此时其他的分支事务异常，导致全局事务决议时回滚，这个时候 a 被改为了3，这个 a 的数据脏了，隔离性没被保证。此时回滚的时候会校验 a 还是不是当前事务修改的值，如果不是，说明这个数据脏了，已经不正确了，不能盲目的直接回滚成1，说明隔离性没保证，有数据被 Seata 全局事务外的地方修改了，如果想保证隔离性，就需要保证任何一个写场景，都被全局事务注解覆盖。

> 我们这边的更新场景都有加全局事务的注解，好像没有起作用，还有别的不起作用的情况吗？

A：那就检查是否都覆盖了，比如定时任务，或者会不会有认为的去数据库层面直接修改。

> 另外一个问题，我在订单服务下单的时候发起扣库存请求，这个时候只需要在订单服务的方法加上全局注解就可以了，对吗？不需要在库存服务被调用的方法加注解？

A：只要保证 xid 传递跟数据源代理即可，但是如果有订单服务之外，没有被全局事务注解覆盖的地方操作了库存，一样会脏。这个文章我借鉴了清铭、屹远、煊意的博客，总结了一下 XA 跟 AT 的关系，也谈到了隔离性方面的问题，希望你看过后可以理解 AT 的隔离性是如何保证的。
[https://blog.csdn.net/qq_35721287/article/details/108982806](https://blog.csdn.net/qq_35721287/article/details/108982806)

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

### 剖析 SOFAJRaft 实现原理合集

- [SOFAJRaft 实现原理 - 生产级 Raft 算法库存储模块剖析原理](/blog/sofa-jraft-algorithm-storage-module-deep-dive/)
- [SOFAJRaft 实现原理 - SOFAJRaft-RheaKV 是如何使用 Raft 的](/blog/sofa-jraft-rheakv/)
- [SOFAJRaft 线性一致读实现剖析 | SOFAJRaft 实现原理](/blog/sofa-jraft-linear-consistent-read-implementation/)
- [SOFAJRaft 选举机制剖析 | SOFAJRaft 实现原理](/blog/sofa-jraft-election-mechanism/)
- [SOFAJRaft-RheaKV MULTI-RAFT-GROUP 实现分析 | SOFAJRaft 实现原理](/blog/sofa-jraft-rheakv-multi-raft-group/)
- [SOFAJRaft 日志复制 - pipeline 实现剖析 | SOFAJRaft 实现原理](/blog/sofa-jraft-pipeline-principle/)
- [SOFAJRaft-RheaKV 分布式锁实现剖析 | SOFAJRaft 实现原理](/blog/sofa-jraft-rheakv-distributedlock/)
- [SOFAJRaft Snapshot 原理剖析 | SOFAJRaft 实现原理](/blog/sofa-jraft-snapshot-principle-analysis/)

### SOFA 项目进展

**本周发布详情如下：**

**发布 SOFAJRaft v1.3.5.Alpha1 版本，主要变更如下：**

- 升级 'rocksdb' 到 5.18.4 以支持 AArch64；
- 优化：心跳响应不经过 pipeline 直接发送，避免 pipeline 影响心跳响应的及时性；
- 修复使用 grpc 时，在一定情况下无法自动重连的问题；
- 修复使用 grpc 时，在 error response 处理的错误；
- 致谢（排名不分先后）：[@cmonkey](https://github.com/cmonkey) [@odidev](https://github.com/odidev)

详细发布报告：[https://github.com/sofastack/sofa-jraft/releases/tag/1.3.5.Alpha1](https://github.com/sofastack/sofa-jraft/releases/tag/1.3.5.Alpha1)

### SOFA 团队欢迎你加入

蚂蚁集团招聘技术运营专家啦～欢迎加入我们一起为可信技术带来更多的想象。

**岗位名称：可信原生技术运营专家**

**岗位描述：**

1. 挖掘技术内容和业务价值，并形成体系，构建传播矩阵，形成并提高产品和技术的行业美誉度；
1. 完整策划并执行线上、线下的技术活动、大赛，构建围绕可信原生技术的开发者活跃群体，并有更多创造性的技术玩法，使技术可感知；
1. 维护重点 KOL，并吸纳行业专业意见，加大行业贡献，并深化行业影响力。

**岗位要求：**

1. 具备用户细分、市场定位、产品规划、产品包装的能力中的一项或多项；
1. 具备良好的创新思维、有技术前瞻性；
1. 良好的沟通协作能力，及横向驱动能力；
1. 有线上市场推广经验，或线下活动策划经验者优先考虑；
1. 对于云计算领域有较深入的了解，有相关工作背景者优先考虑。

欢迎简历投递至：[khotyn.huangt@antgroup.com](khotyn.huangt@antgroup.com)
