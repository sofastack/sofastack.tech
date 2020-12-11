---
title: "SOFA Weekly | Seata 发布新版本， QA 整理"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2020-12-11T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563524226806-e93607a3-1b77-4ca2-8c3c-0384ab966154.png"
---

SOFA WEEKLY | 【12/07 - 12/11】每周精选，筛选每周精华问答
同步开源进展，欢迎留言互动

![weekly.jpg](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1562925824761-fc720f21-9622-437b-a783-0b0729eda119.jpeg)

SOFAStack（Scalable Open Financial Architecture Stack）是蚂蚁金服自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

SOFAStack 官网: [https://www.sofastack.tech](https://www.sofastack.tech/)

SOFAStack: [https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动
我们会筛选重点问题
通过 " SOFA WEEKLY " 的形式回复

**1、@bruce** 提问：

> SOFAJRaft  可以实现在三个节点中选出一个 leader , 其他逻辑由自己实现吗?

A：可以，可以不用状态机，也不用加载和持久化快照, 只需要选个 leader。
> 各个节点如何知道自己是主还是从?

A：示例
![image.png](https://cdn.nlark.com/yuque/0/2020/png/2883938/1607673338953-07cc1ecc-1ab5-445d-a971-91d17d210e2f.png#align=left&display=inline&height=635&margin=%5Bobject%20Object%5D&name=image.png&originHeight=635&originWidth=795&size=79429&status=done&style=none&width=795)

**2、@李明** 提问:

> 全局事务执行过程中，有其他线程操作数据库，这时全局事务执行失败，在回滚的时校验数据发现数据被修改过，导致回滚失败，这种情况怎么避免?

A：其他线程也加上 global transactional 注解。分布式事务下，没有单个分支是独立的个体存在，需要拿到全局事务中，让其他事务知晓他的存在，从而避免在分布式调用链路中，恰好遇到同一个数据进行修改时，发生的脏写脏读 globallock 是在更新前去 tc 看下这个时候这个数据有没有被其他事务锁定，没有的话就说明这个数据没有被其他事务使用，是提交的数据，所以这叫读分布式事务下的已提交。
但是他并没有去注册分支，也就是他没有去占有这个全局锁，来达到分布式事务下的排他性。他在得到 tc 响应的时候，去执行 update 是有时间的，此时有个分布式事务下的分支 update 后，拿到了全局锁，然后他的链路二阶段是回滚 ，但是数据就被你这个认为没有全局锁的本地线程给改了，这就导致被干扰无法回滚。
所以 globallock 需要配合 sql 语句，在 update 前，先做 for update 这个数据，拿到这个数据的本地锁，拿到本地锁之后，再去 tc 判断有没有全局锁，如果 tc 没有锁，因为本地已经拿到本地锁了，具有本地事务的排他性，其他分支事务拿不到该数据的本地锁，是无法去注册分支去拿到全局锁，也就是禁止了其他分支事务的干扰，所以不会脏写。
目前 tcc 下一般就是 globallock+select for update 来防止被其他 at 事务改动后，进行了脏写。

**3、@ 尚攀** 提问:

> Raft 是为了解决目前的什么问题？

A: 依赖外部存储。AT 有 before 镜像、after 镜像，after 镜像是在 undo_log 表里存储，那么 before 在哪里存着了？未来的 Raft 模式，集群支持动态扩缩容，事务信息存储在内存中（测试下来比 redis 快），现在的全局事务信息，分支事务信息，全局锁都是持久化到 db，或者 redis 去的。如果这个时候持久化用的 db 宕机了，Seata-Server会不可用，而集成了 Raft ，leader 宕机后自动选举新 leader，继续运转。所以，利用 raft 一致性算法，可以让多个Seata集群内存中的数据保持一致。
 
### 相关推荐阅读

- [基于 RAFT 的生产级高性能 Java 实现 - SOFAJRaft 系列内容合辑](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247486702&idx=1&sn=6fd48197893a8dd5546a8c7669430297&chksm=faa0e334cdd76a229640d3b3d8f779ada8ba706ccf1b0a89b8d0786e025e2f1da4400cb5bd35&scene=21)

- [蚂蚁集团生产级 Raft 算法库 SOFAJRaft 存储模块剖析 | SOFAJRaft 实现原理](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247485000&idx=1&sn=42b6f967b2ad43dd82983929d5800a33&chksm=faa0e992cdd7608499b5d58a65334653059acc2e35381157724c55d6a50743ba024298c63384&scene=21)

- [蚂蚁集团 SOFAJRaft 优先级选举剖析 | 特性解析](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247486054&idx=1&sn=a934c1c2d8a28a1d300ed1ebfbf25109&chksm=faa0e5bccdd76caaac35ad2a81a6bb5b98a3047fa8207b1aaff1acbae252f3d90115db55c763&scene=21)

- [剖析 | 蚂蚁集团生产级 Raft 算法 SOFAJRaft 合辑](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247485880&idx=2&sn=0e6821f9c567ade1d43cb87071c20508&chksm=faa0e662cdd76f74ce5b49e21b3c86c304993138030cdade661305d7fa367978ad802912c534&scene=21)

### Seata 项目进展

**本周发布详情如下：**
**发布 Seata 1.4.0 版本，主要变更如下**：

- 支持 yml 配置文件
- 支持 Oracle nclob 类型
- 支持客户端最少的活动负载均衡
- 支持客户端一致性哈希的负载均衡
- 支持 Spring Boot 使用自定义配置中心和注册中心
- 支持配置默认全局事务超时时间
- 多处 BUG 修复和功能优化

详细参考：[https://github.com/seata/seata/releases/tag/v1.4.0](https://github.com/seata/seata/releases/tag/v1.4.0)
