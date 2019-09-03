---
title: "SOFA Weekly | 每周精选【8/26 - 8/30】"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2019-08-30T15:00:00+08:00
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

我们会筛选重点问题通过 " SOFA WEEKLY " 的形式回复

**1、@柴炜晨 **提问：

> 求问下 SOFAJRaft rhea split 后，原片1 [0,100) 分裂为 1 [0, 50) , 新片 2[50, 100)，新片 2 上的初始数据是从怎么来的呢？

A：一个 store 里的所有 region 实际上是共享一个存储，split 只是新增一个逻辑 region 并修改被分裂的和新 region 的 range，后续的 snoapshot ，副本迁移等就均以新的 region 为最小单位了。

SOFAJRaft：[https://github.com/sofastack/sofa-jraft](https://github.com/sofastack/sofa-jraft)

**2、关于 SOFARegistry 的几个问题：**

**@虞家成** 提问：

> 服务 Sub 数据的一致性问题，其中主要的机制是通过 client, session 对缓存的逐级回放和比对，再加上版本号机制来实现最终一致性，问题是：这个版本号的生成，与递增是由谁来管理与维护？client? session? 还是 data ? 

A：这个版本号主要是在 data 上产生，版本号和最终写入内存时间戳关联产生，所有数据是指服务发布数据保证一致性。

> 对于每条服务的 Pub 数据，是否需要维护一个 ttl 值，否则在某些情况下，这条数据不能释放？ 

A：如果你说的 ttl 值是指 pub 数据的生存时间，是有的，我们 pub 数据会有租约机制进行定时更新保证一致性，如果过期会进行清理释放。

> Data 节点是通过广播的方式来通知每个 session 节点？那每个 session 节点是否会存在所有服务的全量 Pub 数据？ 这对内存及网络资源消耗会不会过大？

A：Data 是通过广播方式通知每个 session 节点，session上有订阅关系按照自己订阅关系判断是否需要推送给客户端。每个 session 没有全量的 pub 数据，但会存在和其连接部分客户端发布数据作为一致性备份回放使用。这个堆内存目前看压力还是可以的。

SOFARegistry：[https://github.com/sofastack/sofa-registry](https://github.com/sofastack/sofa-registry)

**3、@黄剑 **提问：

> 关于 Seata 有一个问题，全局锁用进去之后，意思就是要等 2 阶段完成后，进行当前资源释放，全局锁那边的接口才进行调用到，如果业务有很多地方都操作到相同表的某一条数据，那岂不是每个业务上面加全局锁？可是我并不知道哪些业务可能会有冲突的哇！

A：目前只查锁不加锁。

> 我需要查到最终 2 阶段的那张表数据，意思自己的业务上面全部都要使用 @GlobalLock 注解？是这个意思么？

A：如果你查询的业务接口没有 GlobalTransactional 包裹，也就是这个方法上压根没有分布式事务的需求，这时你可以在方法上标注 @GlobalLock 注解，并且在查询语句上加 for update。如果你查询的接口在事务链路上外层有 GlobalTransactional 注解，那么你查询的语句只要加 for update 就行。设计这个注解的原因是在没有这个注解之前，需要查询分布式事务读已提交的数据，但业务本身不需要分布式事务。若使用 GlobalTransactional 注解就会增加一些没用的额外的 rpc 开销比如 begin 返回 xid，提交事务等。GlobalLock 简化了 rpc 过程，使其做到更高的性能。

> 好的，感谢回复，因为现在出现了一个业务，但是不同接口，上游有全局事务来调用，然后又有其他业务操作了相同的表，所以现在导致我现在根本不知道哪些业务要考虑使用 GlobalLock。

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

### 本周推荐阅读

- [Service Mesh 发展趋势(续)：棋到中盘路往何方 | Service Mesh Meetup 实录](https://www.sofastack.tech/blog/service-mesh-development-trend-2/)
- [Service Mesh 发展趋势：云原生中流砥柱](https://www.sofastack.tech/blog/service-mesh-development-trend-1/)

### SOFA 项目进展

**本周发布详情如下：**

**发布 SOFA Mosn v0.7.0，主要变更如下：**

- 新增 FeatureGates 的支持
- 新增一项 Metrics 统计:mosn_process_time
- 支持 Listener 重启
- 升级 Go 版本到 1.12.7
- 修改 XDS Client 启动时机，优先于 MOSN Server 的启动
- BUG 修复

详细发布报告：
[https://github.com/sofastack/sofa-mosn/releases/tag/0.7.0](https://github.com/sofastack/sofa-mosn/releases/tag/0.7.0)