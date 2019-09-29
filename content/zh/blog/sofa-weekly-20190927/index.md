---
title: "SOFA Weekly | 每周精选【9/23 - 9/27】"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2019-09-27T15:00:00+08:00
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
我们会筛选重点问题
通过 " SOFA WEEKLY " 的形式回复

**1、关于 SOFAJRaft 的提问：**

**@LoFi 提问：**

> 关于 SOFAJRaft，请教几个问题：不管 raft log 是并行，batch 还是 pipeline 复制，都是为了提高 throughput，但对 latency 没有好处，因为最终日志必须要顺序 commit 和顺序 Apply ，这是 Raft 论文的要求。但是在某些简单的 KV 场景，上层业务可以根据需求去乱序 commit 和 Apply 么？这样可以降低 latency 。

A：pipeline 对 latency 会有一些好处，总体上讲 batch 对吞吐有好处，SOFAJRaft 里的 batch 设计也不会对 latency 有坏处，所以它还是好的，乱序 apply 理论上影响一致性。

> 如果 raft log commit 成功，但是 apply 失败，系统目前的处理方式是什么？直接 crash?

A：apply 异常失败会阻塞住状态机，只有重启才可能恢复，为了保证一致性。

> 如果 leader 本地磁盘 error 或者本地 log flush 失败, 但收到了多数派的响应，日志会 commit 么？怎么处理这种情况？

A：你说的这种异常状态机就挂掉了，原因同上一条。

**关于扩容：**

> 扩容时，新节点的角色不能为 follow 吧？会影响 ballot，不应该先增加一个 Follow 角色，等 snapshot 加载成功后再变为 follow 么？

A：新加节点首先要求日志追上才行，你说的这个不存在。

> 扩容时，如果是 follow 的话，根据论文就会影响 leader 的投票吧

A：那首先得你说的这个 follower 在这个组里呀。首先要追上数据，才能变更配置，这个节点才会进入 group，另外再退一步，没有最新日志的 follower 也无法影响投票。SOFAJRaft 比 Raft 论文里面多了一个 preVote。

>明白，就是先追上数据，然后才能再走一遍 addpeer raftlog ?

A：不是额，是 addPeer 的流程里第一步就是要先追数据。

> 你的意思是：当新的节点加入集群时，会先追日志 , 然后再把这个节点加入到 raft goup 中，成为投票中的一员  是么？ 也就是说在追日志的过程中，这个新的节点是不会参与 raft log 的投票么？那如果说我只是为一个 raft goup 增加副本数，比如从 3 副本变成 4 副本时，这个时候是怎么处理的呢？反正就是不管哪种情况，都是先追数据，然后再加入到 Goup 里？

A：新加的 follower 一启动，就会 electiontimeout 发起选举，但是不会成功，然后 leader 会为这个节点新起一个 replicator 开始复制数据日志（通常包含 snapshot），等到数据追上后，leader 会再提交一条配置变更日志，此时这个节点就正式加入到 group 了。

**2、关于 Seata 的提问：**

**@姜伟锋 提问：**

> 最近在看 Seata 的源码，发现 rpc 相关的 Request、Response 网络传输对象太多了，在保证扩展性的基础上是不是可以优化下，因为主要参数也就是事务组 id、事务组 status、分支事务 id、分支事务 status，再加上附加信息字段，感觉这块设计还有相关序列化设计有点复杂了，这样设计的目的是什么呢，求大佬解。

A：是指字段冗余还是指外层的包装协议复杂了？

> rpc 传输对象感觉有点冗余，一些 request response 对象是不是可以合并，主要字段应该是固定的，这样设计的目的扩展性是很好，复用性是不是还有优化空间呢？

A： 这里是按照非事务消息（注册鉴权之类）和事务消息，事务消息又按照 RM，TM 角色以及传输的方向做了分类，你说的冗余能举个栗子嘛？

> 看到是按角色定义的 rpc req，res 传输对象，这些词传输对象中主要的字段是全库事务 id，全库事务状态，分支事务 id，分支事务状态，资源 id，还有一些附加字段，TM、TC、RM 交互时为什么不设计成一个 req res 对象公用或者是否可以在现有框架上提高下复用性，个人是觉得这块设计了好多传输对象，每个对象有对应的序列化和反序列化，有点复杂，这样设计扩展性这个点我明白，复用性不是太好，还有其他考虑吗？

A：每个消息都有一个名称（code），消息名对于整个事务的链路流程上理解比较清晰，结合着我们的事务流程图来看，每个阶段的 rpc 都有一个确切的含义，即使从字段上来说是相同的比如GlobalRollbackRequest，GlobalCommitRequest 从名称上来看不一样，但从传输层面来看除了code 不一样其他的是一样的。但是大部分消息的字段还是不一样的，对于这种通用字段比如 xid begin 消息就是空的，设计成通用这里只能是 null，非通用比如 lockkey 那这里如果使用通用消息就可能直接塞到一个 applicationData 的扩展字段里，这种写法我觉得不确切，同时有增加了我私有协议序列化时不必要的长度标识字段，每条消息都是由确切的所需的字段，宁愿复杂一些，也要从设计上更清晰些。

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

### SOFAJRaft 解析文章全系列

《剖析 | SOFAJRaft 实现原理》系列文章完结啦，感谢 SOFAStack 社区的核心贡献者们的编写，也欢迎更多感兴趣的技术同学加入。

SOFAJRaft：[https://github.com/sofastack/sofa-jraft](https://github.com/sofastack/sofa-jraft)

- [SOFAJRaft Snapshot 原理剖析 | SOFAJRaft 实现原理](https://www.sofastack.tech/blog/sofa-jraft-snapshot-principle-analysis/)
- [SOFAJRaft-RheaKV 分布式锁实现剖析　| SOFAJRaft 实现原理](https://www.sofastack.tech/blog/sofa-jraft-rheakv-distributedlock/)
- [SOFAJRaft 日志复制 - pipeline 实现剖析 | SOFAJRaft 实现原理](https://www.sofastack.tech/blog/sofa-jraft-pipeline-principle/)
- [SOFAJRaft-RheaKV MULTI-RAFT-GROUP 实现分析 | SOFAJRaft 实现原理](https://www.sofastack.tech/blog/sofa-jraft-rheakv-multi-raft-group/)
- [SOFAJRaft 选举机制剖析 | SOFAJRaft 实现原理](https://www.sofastack.tech/blog/sofa-jraft-election-mechanism/)
- [SOFAJRaft 线性一致读实现剖析 | SOFAJRaft 实现原理](https://www.sofastack.tech/blog/sofa-jraft-linear-consistent-read-implementation/)
- [SOFAJRaft-RheaKV 是如何使用 Raft 的 | SOFAJRaft 实现原理](https://www.sofastack.tech/blog/sofa-jraft-rheakv/)
- [生产级 Raft 算法库 SOFAJRaft 存储模块剖析 | SOFAJRaft 实现原理](https://www.sofastack.tech/blog/sofa-jraft-algorithm-storage-module-deep-dive/)

### SOFA 项目进展

**本周发布详情如下：**

**1、发布 SOFARegistry v5.3.0，主要变更如下：**

- session 和 data 数据一致性增强，定期数据比对和失效数据能力
- 支持 Publisher 和 Subscriber 黑名单顾虑和数据清理能力
- 修正 dataserver 启动期在节点数量较多时候无法达到 working 状态问题
- 修复 dataserver 启动期数据获取过程受 clean 任务干扰的问题
- 修复 dataserver 扩容内存上涨的问题，以及扩容数据同步不完全的问题
- 优化任务确认逻辑线程占用时间较大导致阻塞问题
- 优化 meta 启动期一些 leader 失败问题

详细发布报告：<https://github.com/sofastack/sofa-registry/releases/tag/v5.3.0>
