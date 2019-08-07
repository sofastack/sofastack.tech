---
title: "SOFAJRaft-RheaKV MULTI-RAFT-GROUP 实现分析 | SOFAJRaft 实现原理"
author: "袖扣"
authorlink: "https://github.com/homchou"
description: "本文为《剖析 | SOFAJRaft 实现原理》第五篇，本篇作者袖扣，来自蚂蚁金服。"
categories: "SOFAJRaft"
tags: ["SOFAJRaft","SOFALab","剖析 | SOFAJRaft 实现原理"]
date: 2019-07-24T16:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563966737437-a3c3f5d0-69ef-4a7d-9856-fa5ef2c7e41e.png"
---

> **SOFAStack**
> **S**calable **O**pen **F**inancial  **A**rchitecture Stack
> 是蚂蚁金服自主研发的金融级分布式架构，包含了构建金融级云原生架构所需的各个组件，是在金融场景里锤炼出来的最佳实践。

![SOFAJRaft#5](https://cdn.nlark.com/yuque/0/2019/png/226702/1563957468806-5f7be4ae-73aa-4206-9342-080a5fde85cd.png)

SOFAJRaft 是一个基于 Raft 一致性算法的生产级高性能 Java 实现，支持 MULTI-RAFT-GROUP，适用于高负载低延迟的场景。

本文为《剖析 | SOFAJRaft 实现原理》第五篇，本篇作者袖扣，来自蚂蚁金服。

《剖析 | SOFAJRaft 实现原理》系列由 SOFA 团队和源码爱好者们出品，项目代号：`<SOFA:JRaftLab/>`，文章尾部有参与方式，欢迎同样对源码热情的你加入。

SOFAJRaft ：[https://github.com/alipay/sofa-jraft](https://github.com/alipay/sofa-jraft)

## 前言

RheaKV 是首个以 JRaft 为基础实现的一个原生支持分布式的嵌入式键值（key、value）数据库，现在本文将从 RheaKV 是如何利用 MULTI-RAFT-GROUP 的方式实现 RheaKV 的高性能及容量的可扩展性的，从而进行全面的源码、实例剖析。

## MULTI-RAFT-GROUP

通过对 Raft 协议的描述我们知道：用户在对一组 Raft 系统进行更新操作时必须先经过 Leader，再由 Leader 同步给大多数 Follower。而在实际运用中，一组 Raft 的 Leader 往往存在单点的流量瓶颈，流量高便无法承载，同时每个节点都是全量数据，所以会受到节点的存储限制而导致容量瓶颈，无法扩展。

MULTI-RAFT-GROUP 正是通过把整个数据从横向做切分，分为多个 Region 来解决磁盘瓶颈，然后每个 Region 都对应有独立的 Leader 和一个或多个 Follower 的 Raft 组进行横向扩展，此时系统便有多个写入的节点，从而分担写入压力，图如下：

![multi-raft-group-开始图](https://cdn.nlark.com/yuque/0/2019/jpeg/325890/1557569369003-7d4762a0-2590-48bc-afc9-b4e53b520054.jpeg)

此时磁盘及 I/O 瓶颈解决了，那多个 Raft Group 是如何协作的呢，我们接着往下看。

## 选举及复制

RheaKV 主要由 3 个角色组成：PlacementDriver（以下成为 PD） 、Store、Region。由于 RheaKV 支持多组 Raft，所以比单组场景多出一个 PD 角色，用来调度以及收集每个 Store 及 Region 的基础信息。

![raft 相关图](https://cdn.nlark.com/yuque/0/2019/png/325890/1563956510930-911f3edf-137f-4e64-a685-131a85933217.png)
### PlacementDriver

PD 负责整个集群的管理调度、Region ID 生成等。此组件非必须的，如果不使用 PD，设置 PlacementDriverOptions 的 fake 属性为 true 即可。PD 一般通过 Region 的心跳返回信息进行对 Region 调度，Region 处理完后，PD 则会在下一个心跳返回中收到 Region 的变更信息来更新路由及状态表。

### Store

通常一个 Node 负责一个 Store，Store 可以被看作是 Region 的容器，里面存储着多个分片数据。Store 会向 PD 主动上报 StoreHeartbeatRequest 心跳，心跳交由 PD 的 handleStoreHeartbeat 处理，里面包含该 Store 的基本信息，比如，包含多少 Region，有哪些 Region 的 Leader  在该 Store 等。

### Region

Region 是数据存储、搬迁的最小单元，对应的是 Store 里某个实际的数据区间。每个 Region 会有多个副本，每个副本存储在不同的 Store，一起组成一个Raft Group。Region 中的 Leader 会向 PD 主动上报 RegionHeartbeatRequest 心跳，交由 PD 的 handleRegionHeartbeat 处理，而 PD 是通过 Region的Epoch 感知 Region 是否有变化。

## RegionRouteTable 路由表组件

MULTI-RAFT-GROUP 的多 Region 是通过 RegionRouteTable 路由表组件进行管理的，可通过 addOrUpdateRegion、removeRegion 进行添加、更新、移除 Region，也包括 Region 的拆分。目前暂时还未实现 Region 的聚合，后面会考虑实现。

### 分区逻辑与算法 Shard

![分区逻辑与算法 Shard](https://cdn.nlark.com/yuque/0/2019/png/325890/1557583992539-dcd16181-e2d2-49e6-94c7-1be10e45e6ef.png)

“让每组 Raft 负责一部分数据。”

数据分区或者分片算法通常就是 Range 和 Hash，RheaKV 是通过 Range 进行数据分片的，分成一个个 Raft Group，也称为 Region。这里为何要设计成 Range 呢？原因是 Range 切分是按照对 Key 进行字节排序后再做每段每段切分，像类似 scan 等操作对相近 key 的查询会尽可能集中在某个 Region，这个是 Hash 无法支持的，就算遇到单个 Region 的拆分也会更好处理一些，只用修改部分元数据，不会涉及到大范围的数据挪动。

当然 Range 也会有一个问题那就是，可能会存在某个 Region 被频繁操作成为热点 Region。不过也有一些优化方案，比如 PD 调度热点 Region 到更空闲的机器上，或者提供 Follower 分担读的压力等。

Region 和 RegionEpoch 结构如下：

```java
class Region {
        long              id;            // region id
    // Region key range [startKey, endKey)
        byte[]            startKey;      // inclusive
        byte[]            endKey;        // exclusive
        RegionEpoch       regionEpoch;   // region term
        List<Peer>        peers;         // all peers in the region
}
class RegionEpoch {
     // Conf change version, auto increment when add or remove peer
     long              confVer;
     // Region version, auto increment when split or merge
     long              version;
}
class Peer {
      long              id;
      long              storeId;
      Endpoint          endpoint;
}
```

Region.id：为 Region 的唯一标识，通过 PD 全局唯一分配。

Region.startKey、Region.endKey：这个表示的是 Region 的 key 的区间范围 [startKey, endKey)，特别值得注意的是针对最开始 Region 的 startKey，和最后 Region 的 endKey 都为空。

Region.regionEpoch：当 Region 添加和删除 Peer，或者 split 等，此时 regionEpoch 就会发生变化，其中 confVer 会在配置修改后递增，version 则是每次有 split 、merge（还未实现）等操作时递增。

Region.peers：peers 则指的是当前 Region 所包含的节点信息，Peer.id 也是由 PD 全局分配的，Peer.storeId 代表的是 Peer 当前所处的 Store。

### 读与写 Read / Write

由于数据被拆分到不同 Region 上，所以在进行多 key 的读、写、更新操作时需要操作多个 Region，这时操作前我们需要得到具体的 Region，然后再单独对不同 Region 进行操作。我们以在多 Region上 scan 操作为例, 目标是返回某个 key 区间的所有数据： 

**我们首先看 scan 方法的核心调用方法 internalScan 的异步实现：**

例如：com.alipay.sofa.jraft.rhea.client.DefaultRheaKVStore#scan(byte[], byte[], boolean, boolean)

![internalScan 的异步实现](https://cdn.nlark.com/yuque/0/2019/png/325890/1557631866139-b109dc80-e372-4058-bf3a-d8e5b0eb9618.png)

我们很容易看到，在调用 scan 首先让 PD Client 通过 RegionRouteTable.findRegionsByKeyRange 检索 startKey、endKey 所覆盖的 Region，最后返回的可能为多个 Region，具体 Region 覆盖检索方法如下：

![具体 Region 覆盖检索方法](https://cdn.nlark.com/yuque/0/2019/png/325890/1557624417185-0d35e2af-69c3-4fff-953e-afa709a15720.png)

检索相关变量定义如下：

![检索相关变量定义](https://cdn.nlark.com/yuque/0/2019/png/325890/1557631506444-49f08d69-1766-4c78-93dc-9fd2462677eb.png)

我们可以看到整个 RheaKV 的 range 路由表是通过 TreeMap 的进行存储的，正呼应我们前面讲过所有的 key 是通过对应字节进行排序存储。对应的 Value 为该 Region 的 RegionId，随后我们通过 Region 路由 regionTable 查出即可。

现在我们得到 scan 覆盖到的所有 `Region:List<Region>` 在循环查询中我们看到有一个“retryCause -> {}”的 Lambda 表达式很容易看出这里是加持异常重试处理，后面我们会讲到，接下来会通过 internalRegionScan 查询每个 Region 的结果。具体源码如下：

![查询每个 Region 的结果](https://cdn.nlark.com/yuque/0/2019/png/325890/1557635018508-ec082ace-0bba-4a69-bd3c-94edc1ef7629.png)

这里也同样有一个重试处理，可以看到代码中根据当前是否为 Region 节点来决定是本机查询还是通过RPC进行查询，如果是本机则调用 rawKVStore.scan() 进行本地直接查询，反之通过 rheaKVRpcService 进行 RPC 远程节点查询。最后每个 Region 查询都返回为一个 future，通过 FutureHelper.joinList 工具类 CompletableFuture.allOf 异步并发返回结果 `List<KVEntry>`。

**我们再看看写入具体流程。**相比 scan 读，put 写相对比较简单，只需要针对 key 计算出对应 Region 再进行存储即可，我们可以看一个异步 put 的例子。

例如：com.alipay.sofa.jraft.rhea.client.DefaultRheaKVStore#put(java.lang.String, byte[])

![异步 put](https://cdn.nlark.com/yuque/0/2019/png/325890/1563869613432-91149764-68c9-4527-be2a-d6420cc44928.png)

我们可以发现 put 基础方法是支持 batch 的，即可成批提交。如未使用 batch 即直接提交，具体逻辑如下：

![未使用 batch 即直接提交](https://cdn.nlark.com/yuque/0/2019/png/325890/1563869613425-93f050ec-c726-4d34-84a6-0a1c8e6e1a9e.png)

通过 pdClient 查询对应存储的 Region，并且通过 regionId 拿到 RegionEngine，再通过对应存储引擎 KVStore 进行 put，整个过程同样支持重试机制。我们再回过去看看 batch 的实现，很容易发现利用到了 Disruptor 的 RingBuffer 环形缓冲区，无锁队列为性能提供了保障，代码现场如下：

![无锁队列为性能提供了保障](https://cdn.nlark.com/yuque/0/2019/png/325890/1563869613412-33444cdc-2916-4c66-b85f-338444f0f6e4.png)

### Split / Merge

**什么时候 Region 会拆分？**

前面我们有讲过，PD 会在 Region 的 heartBeat 里面对 Region 进行调度，当某个 Region 里的 keys 数量超过预设阀值，我们即可对该 Region 进行拆分，Store 的状态机 KVStoreStateMachine 即收到拆分消息进行拆分处理。具体拆分源码如下：

KVStoreStateMachine.doSplit 源码如下：

![KVStoreStateMachine.doSplit 源码](https://cdn.nlark.com/yuque/0/2019/png/325890/1557751588134-958ae052-5473-4b08-8eaa-07dc0fff9863.png)

StoreEngine.doSplit 源码如下：

![StoreEngine.doSplit 源码](https://cdn.nlark.com/yuque/0/2019/png/325890/1557751899730-db55ee48-5f85-4505-99d6-378ae8f35f8a.png)

我们可以轻易的看到从原始 parentRegion 切分成 region 和 pRegion，并重设了 startKey、endKey 和版本号，并添加到 RegionEngineTable 注册到 RegionKVService，同时调用 pdClient.getRegionRouteTable().splitRegion() 方法进行更新存储在 PD 的 Region 路由表。

**什么时候需要对 Region 进行合并？**

既然数据过多需要进行拆分，那 Region 进行合并那就肯定是 2 个或者多个连续的 Region 数据量明显小于绝大多数 Region 容量则我们可以对其进行合并。这一块后面会考虑实现。

## RegionKVService 结构及实现分析

### StoreEngine

通过上面我们知道，一个 Store 即为一个节点，里面包含着一个或者多个 RegionEngine，一个 StoreEngine 通常通过 PlacementDriverClient 对 PD 进行调用，同时拥有 StoreEngineOptions 配置项，里面配置着存储引擎和节点相关配置。

1. 我们以默认的 DefaultRheaKVStore 加载 StoreEngine 为例，DefaultRheaKVStore 实现了 RheaKVStore 接口的基础功能，从最开始 init 方法，根据 RheaKVStoreOptions 加载了 pdClient 实例，随后加载 storeEngine。
1. 在 StoreEngine 启动的时候，首先会去加载对应的 StoreEngineOptions 配置，构建对应的 Store 配置，并且生成一致性读的线程池 readIndexExecutor、快照线程池 snapshotExecutor、RPC 的线程池 cliRpcExecutor、Raft 的 RPC 线程池 raftRpcExecutor，以及存储 RPC 线程池 kvRpcExecutor、心跳发送器 HeartbeatSender 等，如果打开代码，我们还能看到 metricsReportPeriod，打开配置可以进行性能指标监控。
1. 在 DefaultRheaKVStore 加载完所有工序之后，便可使用 get、set、scan 等操作，还包含对应同步、异步操作。

在这个过程中里面的 StoreEngine 会记录着 regionKVServiceTable、regionEngineTable，它们分别掌握着具体每个不同的 Region 存储的操作功能，对应的 key 即为 RegionId。

### RegionEngine

每个在 Store 里的 Region 副本中，RegionEngine 则是一个执行单元。它里面记录着关联着的 StoreEngine 信息以及对应的 Region 信息。由于它也是一个选举节点，所以也包含着对应状态机 KVStoreStateMachine，以及对应的 RaftGroupService，并启动里面的 RpcServer 进行选举同步。

这个里面有个 transferLeadershipTo 方法，这个可被调用用于平衡当前节点分区的 Leader，避免压力重叠。

DefaultRegionKVService 是 RegionKVService 的默认实现类，主要处理对 Region 的具体操作。

## RheaKV FailoverClosure 解读

需要特别讲到的是，在具体的 RheaKV 操作时，FailoverClosure 担任着比较重要的角色，也给整个系统增加了一定的容错性。假如在一次 scan 操作中，如果跨 Store 需要多节点 scan 数据的时候，任何网络抖动都会造成数据不完整或者失败情况，所以允许一定次数的重试有利于提高系统的可用性，但是重试次数不宜过高，如果出现网络堵塞，多次 timeout 级别失败会给系统带来额外的压力。这里只需要在 DefaultRheaKVStore 中，进行配置 failoverRetries 设置次数即可。

## RheaKV PD 之 PlacementDriverClient 

PlacementDriverClient 接口主要由 AbstractPlacementDriverClient 实现，然后 FakePlacementDriverClient、RemotePlacementDriverClient 为主要功能。FakePlacementDriverClient 是当系统不需要 PD 的时候进行 PD 对象的模拟，这里主要讲到 RemotePlacementDriverClient。

1. RemotePlacementDriverClient 通过PlacementDriverOptions 进行加载，并根据基础配置刷新路由表；
1. RemotePlacementDriverClient 承担着对路由表RegionRouteTable 的管控，例如获取Store、路由、Leader节点信息等；
1. RemotePlacementDriverClient 还包含着 CliService，通过 CliService 外部可对复制节点进行操作运维，如 addReplica、removeReplica、transferLeader。

## 总结

由于很多传统存储中间件并不原生支持分布式，所以一直少有体感，Raft 协议是一套比较比较好理解的共识协议，SOFAJRaft 通俗易懂是一个非常好的代码和工程范例，同时 RheaKV 也是一套非常轻量化支持多存储结构可分片的嵌入式数据库。写一篇代码分析文章也是一个学习和进步的过程，由此我们也可以窥探到了一些数据库的基础实现，祝愿社区能在 SOFAJRaft / RheaKV 基础上构建更加灵活和自治理的系统和应用。

### SOFAJRaft 源码解析系列阅读

- [SOFAJRaft 选举机制剖析 | SOFAJRaft 实现原理](https://www.sofastack.tech/blog/sofa-jraft-election-mechanism/)
- [SOFAJRaft 线性一致读实现剖析 | SOFAJRaft 实现原理](https://www.sofastack.tech/blog/sofa-jraft-linear-consistent-read-implementation/)
- [SOFAJRaft 实现原理 - SOFAJRaft-RheaKV 是如何使用 Raft 的](https://www.sofastack.tech/blog/sofa-jraft-rheakv/)
- [SOFAJRaft 实现原理 - 生产级 Raft 算法库存储模块剖析](https://www.sofastack.tech/blog/sofa-jraft-algorithm-storage-module-deep-dive/)
