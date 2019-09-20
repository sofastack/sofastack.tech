---
title: "SOFA Weekly | 每周精选【9/16 - 9/20】"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2019-09-20T15:00:00+08:00
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
我们会筛选重点问题
通过 " SOFA WEEKLY " 的形式回复

**@wy223170** 提问：

> 你好，请问下 SOFAJRaft 如何在虚拟化环境下使用，比如部署三个实例，三个实例都是 docker 的。因为虚拟化实例可能漂移，怎么保证 snapshot 的迁移呢？另外怎么控制多个实例的同时漂移，导致集群不可用的问题？

A：SOFAJRaft 本身是有状态的，你说的实例漂移就可以理解为这个节点挂掉并新拉起了一个节点，我们内部的做法是通过一个 manager 节点监听容器上下线并执行 `CliService` removePeer 和 addPeer，利用 raft 协议本身的能力达到数据迁移的目的，但是对于半数以上节点同时漂移是无解的，可能出现丢数据的情况。这是 etcd 的一个解决类似问题的方式，供参考：[https://github.com/coreos/etcd-operator](https://github.com/coreos/etcd-operator)

> 感谢回答，是不是只要 manager 节点监听到容器变化就会立刻进行 removePeer 或 addPeer，需不需等待容器已经达到某种状态，比如迁移完 snapshot 等才进行 addPeer 之类的，这可能就需要实例迁移后完成一个打标记的功能标志迁移完成了。

A：流程是先 addPeer 成功以后再 removePeer。其中 addPeer 在追数据成功后才会返回成功。看到你多次强调  snapshot，其实这里你不用关注 snapshot，这是 SOFAJRaft 内部会考虑的 raft 层的东西，不需要额外做特殊处理。

### 开源项目

- [ElasticDL：蚂蚁金服开源基于 TensorFlow 的弹性分布式深度学习系统](/blog/alipay-deep-learning-tensorflow-elasticdl/)
- [蚂蚁金服开源机器学习工具 SQLFlow，技术架构独家解读](/blog/sqlflow-open-source/)

### SOFA 项目进展

**本周发布详情如下：**

**发布 Seata v0.8.1，主要变更如下：**

- 支持配置文件使用绝对路径
- 支持 DataSource 的自动代理
- 支持通信协议的 kryo 编解码
- 修复 file 存储模式的 selectForUpdate lockQuery exception
- 修复数据库连接使用后的 autocommit 问题
- 优化 etcd3 中 watcher 订阅的效率
- 优化当数据表无索引时抛出显式异常

详细发布报告：
[https://github.com/seata/seata/releases/tag/v0.8.1](https://github.com/seata/seata/releases/tag/v0.8.1)

### SOFAJRaftLab 系列阅读

- [SOFAJRaft-RheaKV 分布式锁实现剖析　| SOFAJRaft 实现原理](/blog/sofa-jraft-rheakv-distributedlock/)
- [SOFAJRaft 日志复制 - pipeline 实现剖析 | SOFAJRaft 实现原理](/blog/sofa-jraft-pipeline-principle/)
- [SOFAJRaft-RheaKV MULTI-RAFT-GROUP 实现分析 | SOFAJRaft 实现原理](/blog/sofa-jraft-rheakv-multi-raft-group/)
- [SOFAJRaft 选举机制剖析 | SOFAJRaft 实现原理](/blog/sofa-jraft-election-mechanism/)
- [SOFAJRaft 线性一致读实现剖析 | SOFAJRaft 实现原理](/blog/sofa-jraft-linear-consistent-read-implementation/)
- [SOFAJRaft-RheaKV 是如何使用 Raft 的 | SOFAJRaft 实现原理](/blog/sofa-jraft-rheakv/)
- [生产级 Raft 算法库 SOFAJRaft 存储模块剖析 | SOFAJRaft 实现原理](/blog/sofa-jraft-algorithm-storage-module-deep-dive/)
