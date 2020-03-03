---
title: "服务注册中心数据一致性方案分析 | SOFARegistry 解析"
author: "明不二"
authorlink: "https://github.com/mingxing47"
description: " 本文为《剖析 | SOFARegistry 框架》第七篇，作者明不二"
categories: "SOFARegistry"
tags: ["SOFARegistry","剖析 | SOFARegistry 框架","SOFALab"]
date: 2020-03-03T16:30:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2020/png/226702/1583228665289-7787b23a-5892-4b20-9474-f17d7091e29c.png"
---

> SOFAStack （Scalable Open Financial  Architecture Stack） 是蚂蚁金服自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，是在金融场景里锤炼出来的最佳实践。

![SOFA：RegistryLab](https://cdn.nlark.com/yuque/0/2020/png/226702/1582538989711-172c549d-23d5-4095-b3df-c578a19d6008.png)

SOFARegistry 是蚂蚁金服开源的具有承载海量服务注册和订阅能力的、高可用的服务注册中心，在支付宝/蚂蚁金服的业务发展驱动下，近十年间已经演进至第五代。

本文为《剖析 | SOFARegistry 框架》第七篇，**本篇作者明不二**。《剖析 | SOFARegistry 框架》系列由 SOFA 团队和源码爱好者们出品，项目代号：<SOFA:RegistryLab/>，文末包含往期系列文章。

GitHub 地址：[https://github.com/sofastack/sofa-registry](https://github.com/sofastack/sofa-registry)

## 概述

在前面的文章已经做过介绍，与其他注册中心相比，SOFARegistry 主要特点在于支持海量数据、支持海量客户端、秒级的服务上下线通知以及高可用特性。本文将从如下几个方面来讲述 SOFARegistry 的一致性方案：

- MetaServer 数据一致性

为支持高可用特性，对于 MetaServer 来说，存储了 SOFARegistry 的元数据，为了保障 MetaServer 集群的一致性，其采用了 Raft 协议来进行选举和复制。

- SessionServer 数据一致性

为支持海量客户端的连接，SOFARegistry 在客户端与 DataServer 之间添加了一个 SessionServer 层，客户端与 SessionServer 连接，避免了客户端与 DataServer 之间存在大量连接所导致的连接数过多不可控的问题。客户端通过 SessionServer 与 DataServer 连接的时候，Publisher 数据同时会缓存在 SessionServer 中，此时就需要解决 DataServer 与 SessionServer 之间数据一致性的问题。

- DataServer 数据一致性

为支持海量数据，SOFARegistry 采用了一致性 Hash 来分片存储 Publisher 数据，避免了单个服务器存储全量数据时产生的容量瓶颈问题。而在这个模型中，每个数据分片拥有多个副本，当存储注册数的 DataServer 进行扩容、缩容时，MetaServer 会把这个变更通知到 DataServer 和 SessionServer，数据分片会在集群内部进行数据迁移与同步，此时就出现了 DataServer 内部数据的一致性问题。

## MetaServer 数据一致性

MetaServer 在 SOFARegistry 中，承担着集群元数据管理的角色，用来维护集群成员列表，可以认为是 SOFARegistry 注册中心的注册中心。当 SessionServer 和 DataServer 需要知道集群列表，并且需要扩缩容时，MetaServer 将会提供相应的数据。

![图1 MetaServer 内部结构](https://cdn.nlark.com/yuque/0/2020/png/156644/1582241958945-116ce065-dba1-479b-b208-8fbb102ef346.png)
图1 MetaServer 内部结构 
图源自 [《蚂蚁金服服务注册中心 MetaServer 功能介绍和实现剖析 | SOFARegistry 解析》](https://www.yuque.com/sofaregistrylab/plsrlw/rk82ky)

因为 SOFARegistry 集群节点列表数据并不是很多，因此不需要使用数据分片的方式在 MetaServer 中存储。如图 1 所示，集群节点列表存储在 Repository 中，上面通过 Raft 强一致性协议对外提供节点注册、续约、列表查询等 Bolt 请求，从而保障集群获得的数据是强一致性的。

### Raft 协议

关于 Raft 协议算法，具体可以参考 [The Raft Consensus Algorithm](https://raft.github.io/) 中的解释。在 SOFA 体系中，对于 Raft 协议有 [SOFAJRaft](https://www.sofastack.tech/tags/%E5%89%96%E6%9E%90-sofajraft-%E5%AE%9E%E7%8E%B0%E5%8E%9F%E7%90%86/) 实现。下面对 Raft 协议算法的原理进行简要介绍。

Raft 协议由三个部分组成，领导人选举（Leader Election）、日志复制（Log Replication）、安全性（Safety）。

- 领导人选举

通过一定的算法选举出领导人，用于接受客户端请求，并且把指令追加到日志中。

![图2 Raft 状态机状态转换图](https://cdn.nlark.com/yuque/0/2020/png/156644/1582242652562-2e68f284-dd45-4fc7-b711-c8ce7ab53ae9.png)
图2 Raft 状态机状态转换图
图源自[Understanding the Raft consensus algorithm: an academic article summary](https://www.freecodecamp.org/news/in-search-of-an-understandable-consensus-algorithm-a-summary-4bc294c97e0d/)

- 日志复制

领导人接受到客户端请求之后，把操作追加到日志中，同时与其他追随者同步消息，最终 Commit 日志，并且把结果返回给客户端。

![图3 复制状态机](https://cdn.nlark.com/yuque/0/2020/png/156644/1582243110825-8d9c8984-ddbb-4934-a602-9b54c7a807cc.png)
图3 复制状态机
图源自 [Raft一致性算法笔记](https://www.jianshu.com/p/096ae57d1fe0)

- 安全性

安全性保证了数据的一致性。

### 基于 Raft 协议的数据一致性保障

![图4 SOFARegistry 中的 Raft 存储过程](https://cdn.nlark.com/yuque/0/2020/png/156644/1582243699974-8709bcf4-bd79-44c2-b98f-53890c13e323.png)
图4 SOFARegistry 中的 Raft 存储过程
图源自 [《蚂蚁金服服务注册中心 MetaServer 功能介绍和实现剖析 | SOFARegistry 解析》](https://www.yuque.com/sofaregistrylab/plsrlw/rk82ky)

如图 4 所示，SOFARegistry 中的 Raft 协议数据存储经历了如上的一些流程。客户端发起 Raft 协议调用，进行数据注册、续约、查询等操作时，会通过动态代理实现 `ProxyHandler` 类进行代理，通过 `RaftClient` 把数据发送给 `RaftServer` ，并且通过内部的状态机 `Statemachine` ，最终实现数据的操作，从而保证了 MetaServer 内部的数据一致性。

## SessionServer 数据一致性

SessionServer 在 SOFARegistry 中，承担着会话管理及连接的功能。同时，Subscriber 需要通过 SessionServer 来订阅 DataServer 的服务数据，Publisher 需要通过 SessionServer 来把服务数据发布到 DataServer 中。

在这个场景下，SessionServer 作为中间代理层，缓存从 DataServer 中获取的数据成了必然。DataServer 的数据需要通过 SessionServer 推送到 Subscriber 中，触发 SessionServer 推送的场景有两个：一个是 Publisher 到 DataServer 的数据发生变化；另外一个是 Subscriber 有了新增。

而在实际的场景中，Subscriber 新增的情况更多，在这种场景下，直接把 SessionServer 缓存的数据推送到 Subscriber 中即可，能够大大减轻 SessionServer 从 DataServer 获取数据对 DataServer 的压力。因此，这也进一步确认了在 SessionServer 缓存数据的必要性。

![图5 两种场景的数据推送对比图](https://cdn.nlark.com/yuque/0/2020/png/156644/1582245578286-c75ac4ab-cd40-48e3-a3fa-0f5ff255247e.png)
图5 两种场景的数据推送对比图

### SessionServer 与 DataServer 数据对比机制

当服务 Publisher 上下线或者断连时，相应的数据会通过 SessionServer 注册到 DataServer 中。此时，DataServer 的数据与 SessionServer 会出现短暂的不一致性。为了保障这个数据的一致性，DataServer 与 SessionServer 之间通过 `推` 和 `拉` 两种方式实现了数据的同步。

- 数据推送模式

DataServer 在服务数据有变化时会主动通知到 SessionServer 中，此时 SessionServer 会比对两者数据的版本号 `version` ，对比之后若需要更新数据，则会主动向 DataServer 获取相应的数据。

- 数据拉取模式

SessionServer 会每隔一定的时间（默认 30s）主动向 DataServer 查询所有 `dataInfoId` 的 `version` 信息，若发现有版本号有变化，则会进行相应的同步操作。

  - SessionServer 从 DataServer 同步数据：常规情况下，一般是 DataServer 的数据要比 SessionServer 更新，此时，当 SessionServer 发现数据版本号有变化时，会主动拉取 DataServer 的数据进行同步。注意，此时缓存的数据只与当前 SessionServer 管理的客户端所订阅的服务信息有关，并不会缓存全量的数据，而且容量也不允许。

  - DataServer 从 SessionServer 同步数据：特殊情况下，DataServer 数据出现缺失，并且副本数据也出现问题之后，当 SessionServer 与 DataServer 数据进行版本号比对时，会触发数据恢复操作，能够把 SessionServer 内存中所存储的全量数据恢复到 DataServer 中，实现了数据的反向同步与补偿机制。

- 数据的缓存方式

SOFARegistry 中采用了 `LoadingCache<Key, Value>` 的数据结构来在 SessionServer 中缓存从 DataServer 中同步来的数据。每个 cache 中的 entry 都有过期时间，在拉取数据的时候可以设置过期时间（默认是 30s），使得 cache 定期去 DataServer 查询当前 session 所有 sub 的 dataInfoId，对比如果 session 记录的最近推送version（见`com.alipay.sofa.registry.server.session.store.SessionInterests#interestVersions` ）比 DataServer 小，说明需要推送，然后 SessionServer 主动从 DataServer 获取该 dataInfoId 的数据(此时会缓存到 cache 里)，推送给 client。

同时，当 DataServer 中有数据更新时，也会主动向 SessionServer 发请求使对应 entry 失效，从而促使 SessionServer 去更新失效 entry。

### SessionServer 与 Subscriber 之间的数据一致性同步

当 SessionServer 的数据发生变更时，会与 Subscriber 之间进行数据同步，把变化的 `dataInfoId` 数据推送到 Subscriber 中，保证客户端本地所缓存的数据与 SessionServer 中的一致。

## DataServer 数据一致性

DataServer 在 SOFARegistry 中，承担着核心的数据存储功能。数据按 dataInfoId 进行一致性 Hash 分片存储，支持多副本备份，保证数据高可用。这一层可随服务数据量的规模的增长而扩容。

如果 DataServer 宕机，MetaServer 能感知，并通知所有 DataServer 和 SessionServer，数据分片可 failover 到其他副本，同时 DataServer 集群内部会进行分片数据的迁移。

### DataServer 请求接收过程

在讲解一致性之前，先讲一下 DataServer 的启动之后关于数据同步方面做了哪些事情。DataServer 启动之时，会启动一个数据同步 Bolt 服务 openDataSyncServer ，进行相应的 DataServer 数据同步处理。

启动 DataSyncServer 时，注册了如下几个 handler 用于处理 bolt 请求 ：

![图5 DayaSyncServer 注册的 Handler](https://cdn.nlark.com/yuque/0/2020/png/156644/1583214883589-185b5242-0188-40c1-bee0-e0ba6bad4fc4.png)
图5 DayaSyncServer 注册的 Handler

- getDataHandler

该 Handler 主要用于数据的获取，当一个请求过来时，会通过请求中的 DataCenter 和 DataInfoId 获取当前 DataServer 节点存储的相应数据。

- publishDataProcessor \ unPublishDataHandler

当有数据发布者 publisher 上下线时，会分别触发 publishDataProcessor 或 unPublishDataHandler ，Handler 会往 dataChangeEventCenter 中添加一个数据变更事件，用于异步地通知事件变更中心数据的变更。事件变更中心收到该事件之后，会往队列中加入事件。此时 dataChangeEventCenter 会根据不同的事件类型异步地对上下线数据进行相应的处理。

与此同时，DataChangeHandler 会把这个事件变更信息通过 ChangeNotifier 对外发布，通知其他节点进行数据同步。

- notifyFetchDatumHandler

这是一个数据拉取请求，当该 Handler 被触发时，通知当前 DataServer 节点进行版本号对比，若请求中数据的版本号高于当前节点缓存中的版本号，则会进行数据同步操作，保证数据是最新的。

- notifyOnlineHandler

这是一个 DataServer 上线通知请求 Handler，当其他节点上线时，会触发该 Handler，从而当前节点在缓存中存储新增的节点信息。用于管理节点状态，究竟是 INITIAL 还是 WORKING 。

- syncDataHandler

节点间数据同步 Handler，该 Handler 被触发时，会通过版本号进行比对，若当前 DataServer 所存储数据版本号含有当前请求版本号，则会返回所有大于当前请求数据版本号的所有数据，便于节点间进行数据同步。

- dataSyncServerConnectionHandler

连接管理 Handler，当其他 DataServer 节点与当前 DataServer 节点连接时，会触发 connect 方法，从而在本地缓存中注册连接信息，而当其他 DataServer 节点与当前节点断连时，则会触发 disconnect 方法，从而删除缓存信息，进而保证当前 DataServer 节点存储有所有与之连接的 DataServer 节点。

### 最终一致性

SOFARegistry 在数据存储层面采用了类似 Eureka 的最终一致性的过程，但是存储内容上和 Eureka 在每个节点存储相同内容特性不同，采用每个节点上的内容按照一致性 Hash 数据分片来达到数据容量无限水平扩展能力。

SOFARegistry 是一个 AP 分布式系统，表明了在已有条件 P 的前提下，选择了 A 可用性。当数据进行同步时，获取到的数据与实际数据不一致。但因为存储的信息为服务的注册节点，尽管会有短暂的不一致产生，但对于客户端来说，大概率还是能从这部分数据中找到可用的节点，不会因为数据暂时的不一致对业务系统带来致命性的伤害。

### 集群内部数据迁移过程

SOFARegistry 的 DataServer 选择了“一致性 Hash分片”来存储数据。在“一致性 Hash分片”的基础上，为了避免“分片数据不固定”这个问题，SOFARegistry 选择了在 DataServer 内存里以 dataInfoId 的粒度记录操作日志，并且在 DataServer 之间也是以 dataInfoId 的粒度去做数据同步。

![图6 DataServer 之间进行异步数据同步](https://cdn.nlark.com/yuque/0/2020/png/156644/1583214062704-5afb2fab-0197-407a-bbf7-7fdb7705d28a.png)
图6 DataServer 之间进行异步数据同步

数据和副本分别分布在不同的节点上，进行一致性 Hash 分片，当时对主副本进行写操作之后，主副本会把数据异步地更新到其他副本中，实现了集群内部不同副本之间的数据迁移工作。

## 总结

在分布式系统的设计中，可用性、分区容错性、一致性是我们必须进行权衡的选项，CAP 理论告诉我们，这三者中只能同时满足两个的要求。在设计分布式系统时，如何进行权衡选择，是摆在每个系统设计者面前的一个难题。

SOFARegistry 系统分为三个集群，分别是元数据集群 MetaServer、会话集群 SessionServer、数据集群 DataServer。复杂的系统有多个地方需要考虑到一致性问题，SOFARegistry 针对不同模块的一致性需求也采取了不同的方案。对于 MetaServer 模块来说，采用了强一致性的 Raft 协议来保证集群信息的一致性。对于数据模块来说，SOFARegistry 选择了 AP 保证可用性，同时保证了最终一致性。

SOFARegistry 的设计给了我们启示，在设计一个多模块的分布式系统时，可以根据不同模块的需求选择不同的一致性方案，同时 CAP 三者的权衡也需要结合系统不同模块的目标作出合理的权衡，不必拘泥。

### SOFARegistryLab 系列阅读

- [服务注册中心如何实现秒级服务上下线通知 | SOFARegistry 解析](/blog/sofa-registry-service-offline-notification/)
- [服务注册中心 Session 存储策略 | SOFARegistry 解析](/blog/sofa-registry-session-storage/)
- [服务注册中心数据分片和同步方案详解 | SOFARegistry 解析](/blog/sofa-registry-data-fragmentation-synchronization-scheme/)
- [服务注册中心 MetaServer 功能介绍和实现剖析 | SOFARegistry 解析](/blog/sofa-registry-metaserver-function-introduction/)
- [服务注册中心 SOFARegistry 解析 | 服务发现优化之路](/blog/sofa-registry-service-discovery-optimization/)
- [海量数据下的注册中心 - SOFARegistry 架构介绍](/blog/sofa-registry-introduction/)
