---
author: "米麒麟"
authorlink: "https://github.com/SteNicholas"
date: 2019-05-05T14:30:00.000Z
aliases: "/posts/2019-05-05-01"
title: "SOFAJRaft 实现原理 - 生产级 Raft 算法库存储模块剖析"
tags: ["SOFAJRaft","SOFALab","剖析 | SOFAJRaft 实现原理"]
categories: "SOFAJRaft"
description: "本文为《剖析 | SOFAJRaft 实现原理》第一篇，本篇作者米麒麟，来自陆金所。。"
cover: "https://cdn.nlark.com/yuque/0/2019/png/156670/1556492476096-9300c652-29e2-4698-b5ef-435c294e00c6.png"
---

> **SOFA**Stack
> **S**calable **O**pen **F**inancial  **A**rchitecture Stack
> 是蚂蚁金服自主研发的金融级分布式架构，包含了构建金融级云原生架构所需的各个组件，是在金融场景里锤炼出来的最佳实践。
> 
> SOFAJRaft 是一个基于 Raft 一致性算法的生产级高性能 Java 实现，支持 MULTI-RAFT-GROUP，适用于高负载低延迟的场景。
> 
> 本文为《剖析 | SOFAJRaft 实现原理》第一篇，本篇作者米麒麟，来自陆金所。《剖析 | SOFAJRaft 实现原理》系列由 SOFA 团队和源码爱好者们出品，项目代号：<SOFA:JRaftLab/>，文章尾部有参与方式，欢迎同样对源码热情的你加入。
> 
> SOFAJRaft ：[https://github.com/sofastack/sofa-jraft](https://github.com/alipay/sofa-jraft)

# 前言

**SOFAJRaft 是一个基于 Raft 一致性算法的生产级高性能 Java 实现，支持 MULTI-RAFT-GROUP，适用于高负载低延迟的场景**。

SOFAJRaft 存储模块分为：

1. Log 存储记录 Raft 配置变更和用户提交任务日志；
1. Meta 存储即元信息存储记录 Raft 实现的内部状态；
1. Snapshot 存储用于存放用户的状态机 Snapshot 及元信息。

本文将围绕日志存储，元信息存储以及快照存储等方面剖析 SOFAJRaft 存储模块原理，阐述如何解决 Raft 协议存储问题以及存储模块实现：

- Raft 配置变更和用户提交任务日志如何存储？如何调用管理日志存储？
- SOFAJRaft Server 节点 Node 是如何存储 Raft 内部配置？
- Raft 状态机快照 Snapshot 机制如何实现？如何存储安装镜像？

![SOFAJRaft](https://cdn.nlark.com/yuque/0/2019/png/156670/1556492476096-9300c652-29e2-4698-b5ef-435c294e00c6.png)

# 日志存储

Log 存储，记录 Raft 配置变更和用户提交任务的日志，把日志从 Leader 复制到其他节点上面。

- LogStorage 是日志存储实现，默认实现基于 RocksDB 存储，通过 LogStorage 接口扩展自定义日志存储实现；
- LogManager 负责调用底层日志存储 LogStorage，针对日志存储调用进行缓存、批量提交、必要的检查和优化。

## LogStorage 存储实现

LogStorage 日志存储实现，定义 Raft 分组节点 Node 的 Log 存储模块核心 API 接口包括：

- 返回日志里的首/末个日志索引；
- 按照日志索引获取 Log Entry 及其任期；
- 把单个/批量 Log Entry 添加到日志存储；
- 从 Log 存储头部/末尾删除日志；
- 删除所有现有日志，重置下任日志索引。

Log Index 提交到 Raft Group 中的任务序列化为日志存储，每条日志一个编号，在整个 Raft Group 内单调递增并复制到每个 Raft 节点。LogStorage 日志存储实现接口定义入口：

```java
com.alipay.sofa.jraft.storage.LogStorage 
```

## RocksDBLogStorage 基于 RocksDB 实现

Log Structured Merge Tree 简称 LSM ，把一颗大树拆分成 N 棵小树，数据首先写入内存，内存里构建一颗有序小树，随着小树越来越大，内存的小树 Flush 到磁盘，磁盘中的树定期做合并操作合并成一棵大树以优化读性能，通过把磁盘的随机写转化为顺序写提高写性能，RocksDB 就是基于 LSM-Tree 数据结构使用 C++ 编写的嵌入式 KV 存储引擎，其键值均允许使用二进制流。RocksDB 按顺序组织所有数据，通用操作包括 get(key), put(key), delete(Key) 以及 newIterator()。RocksDB 有三种基本的数据结构：memtable，sstfile 以及 logfile。memtable 是一种内存数据结构--所有写入请求都会进入 memtable，然后选择性进入 logfile。logfile 是一种有序写存储结构，当 memtable 被填满的时候被刷到 sstfile 文件并存储起来，然后相关的 logfile 在之后被安全地删除。sstfile 内的数据都是排序好的，以便于根据 key 快速搜索。

LogStorage 默认实现 RocksDBLogStorage 是基于 RocksDB 存储日志，初始化日志存储 StorageFactory 根据 Raft节点日志存储路径和 Raft 内部实现是否调用 fsync 配置默认创建 RocksDBLogStorage 日志存储。基于 RocksDB 存储实现 RocksDBLogStorage 核心操作包括：

- init()：创建 RocksDB 配置选项调用 RocksDB#open() 方法构建 RocksDB 实例，添加 default 默认列族及其配置选项获取列族处理器，通过 newIterator() 生成 RocksDB 迭代器遍历 KeyValue 数据检查 Value 类型加载 Raft 配置变更到配置管理器 ConfigurationManager。RocksDB 引入列族 ColumnFamily 概念，所谓列族是指一系列 KeyValue 组成的数据集，RocksDB 读写操作需要指定列族，创建 RocksDB 默认构建命名为default 的列族。
- shutdown()：首先关闭列族处理器以及 RocksDB 实例，其次遍历列族配置选项执行关闭操作，接着关闭RocksDB 配置选项，最后清除强引用以达到 Help GC 垃圾回收 RocksDB 实例及其配置选项对象。
- getFirstLogIndex()：基于处理器 defaultHandle 和读选项 totalOrderReadOptions 方法构建 RocksDB 迭代器 RocksIterator，检查是否加载过日志里第一个日志索引，未加载需调用 seekToFirst() 方法获取缓存 RocksDB 存储日志数据的第一个日志索引。
- getLastLogIndex()：基于处理器 defaultHandle 和读选项 totalOrderReadOptions 构建 RocksDB 迭代器 RocksIterator，调用 seekToLast() 方法返回 RocksDB 存储日志记录的最后一个日志索引。
- getEntry(index)：基于处理器 defaultHandle 和指定日志索引调用 RocksDB#get() 操作返回 RocksDB 索引位置日志 LogEntry。
- getTerm(index)：基于处理器 defaultHandle 和指定日志索引调用 RocksDB#get() 操作获取 RocksDB 索引位置日志并且返回其 LogEntry 的任期。
- appendEntry(entry)：检查日志 LogEntry 类型是否为配置变更，配置变更类型调用 RocksDB#write() 方法执行批量写入，用户提交任务的日志基于处理器 defaultHandle 和 LogEntry 对象调用 RocksDB#put() 方法存储。
- appendEntries(entries)：调用 RocksDB#write() 方法把 Raft 配置变更或者用户提交任务的日志同步刷盘批量写入 RocksDB 存储，通过 Batch Write 手段合并 IO 写入请求减少方法调用和上下文切换。
- truncatePrefix(firstIndexKept)：获取第一个日志索引，后台启动一个线程基于默认处理器 defaultHandle 和配置处理器 confHandle 执行 RocksDB#deleteRange() 操作删除从 Log 头部以第一个日志索引到指定索引位置范围的 RocksDB 日志数据。
- truncateSuffix(lastIndexKept)：获取最后一个日志索引，基于默认处理器 defaultHandle 和配置处理器 confHandle 执行 RocksDB#deleteRange() 操作清理从 Log 末尾以指定索引位置到最后一个索引范畴的 RocksDB 未提交日志。
- reset(nextLogIndex)：获取 nextLogIndex 索引对应的 LogEntry，执行 RocksDB#close() 方法关闭 RocksDB实例，调用 RocksDB#destroyDB() 操作销毁 RocksDB 实例清理 RocksDB 所有数据，重新初始化加载 RocksDB 实例并且重置下一个日志索引位置。

![RocksDBLogStorage 基于 RocksDB 实现](https://cdn.nlark.com/yuque/0/2019/png/156670/1555857372818-23aeca92-cd8a-4a06-91e2-c0aae6447c65.png)

RocksDBLogStorage 基于 RocksDB 存储日志实现核心入口：

```java
com.alipay.sofa.jraft.storage.RocksDBLogStorage 
```

## LogManager 存储调用

日志管理器 LogManager 负责调用 Log 日志存储 LogStorage，对 LogStorage 调用进行缓存管理、批量提交、检查优化。Raft 分组节点 Node 初始化/启动时初始化日志存储 StorageFactory 构建日志管理器 LogManager，基于日志存储 LogStorage、配置管理器 ConfigurationManager、有限状态机调用者 FSMCaller、节点性能监控 NodeMetrics 等 LogManagerOptions 配置选项实例化 LogManager。根据 Raft 节点 Disruptor Buffer 大小配置生成稳定状态回调 StableClosure 事件 Disruptor 队列，设置稳定状态回调 StableClosure 事件处理器 StableClosureEventHandler 处理队列事件，其中 StableClosureEventHandler 处理器事件触发的时候判断任务回调 StableClosure 的 Log Entries 是否为空，如果任务回调的 Log Entries 为非空需积攒日志条目批量 Flush，空则检查 StableClosureEvent 事件类型并且调用底层存储 LogStorage#appendEntries(entries) 批量提交日志写入 RocksDB，当事件类型为SHUTDOWN、RESET、TRUNCATE_PREFIX、TRUNCATE_SUFFIX、LAST_LOG_ID 时调用底层日志存储 LogStorage 进行指定事件回调 ResetClosure、TruncatePrefixClosure、TruncateSuffixClosure、LastLogIdClosure 处理。

当 Client 向 SOFAJRaft 发送命令之后，Raft 分组节点 Node 的日志管理器 LogManager 首先将命令以 Log 的形式存储到本地，调用 appendEntries(entries, done) 方法检查 Node 节点当前为 Leader 并且 Entries 来源于用户未知分配到的正确日志索引时需要分配索引给添加的日志 Entries ，而当前为 Follower 时并且 Entries 来源于 Leader 必须检查以及解决本地日志和  Entries 之间的冲突。接着遍历日志条目 Log Entries 检查类型是否为配置变更，配置管理器 ConfigurationManager 缓存配置变更 Entry，将现有日志条目 Entries 添加到 logsInMemory 进行缓存，稳定状态回调 StableClosure 设置需要存储的日志，发布 OTHER 类型事件到稳定状态回调 StableClosure 事件队列，触发稳定状态回调 StableClosure 事件处理器 StableClosureEventHandler 处理该事件，处理器获取任务回调的 Log Entries 把日志条目积累到内存中以便后续统一批量 Flush，通过 appendToStorage(toAppend) 操作调用底层LogStorage 存储日志 Entries。同时 Replicator 把此条 Log 复制给其他的 Node 实现并发的日志复制，当 Node 接收集群中半数以上的 Node 返回的“复制成功”的响应将这条 Log 以及之前的 Log 有序的发送至状态机里面执行。

![当 Client 向 SOFAJRaft 发送命令后的流程](https://cdn.nlark.com/yuque/0/2019/png/156670/1555951491008-d5a34e7b-ff34-4428-9261-62b17f83da7f.png)

LogManager 调用日志存储 LogStorage 实现逻辑：

![LogManager](https://cdn.nlark.com/yuque/0/2019/png/156670/1555951687305-1f852f41-9b53-4ff6-a97b-44dd769ca62d.png)

# 元信息存储

Metadata 存储即元信息存储，用来存储记录 Raft 实现的内部状态，譬如当前任期 Term、投票给哪个 PeerId 节点等信息。

## RaftMetaStorage 存储实现

RaftMetaStorage 元信息存储实现，定义 Raft 元数据的 Metadata 存储模块核心 API 接口包括：

- 设置/获取 Raft 元数据的当前任期 Term；
- 分配/查询 Raft 元信息的 PeerId 节点投票。

Raft 内部状态任期 Term 是在整个 Raft Group 里单调递增的 long 数字，用来表示一轮投票的编号，其中成功选举出来的 Leader 对应的 Term 称为 Leader Term，Leader 没有发生变更期间提交的日志都有相同的 Term 编号。PeerId 表示 Raft 协议的参与者(Leader/Follower/Candidate etc.)， 由三元素组成： ip:port:index，其中 ip 是节点的 IP， port 是端口， index 表示同一个端口的序列号。RaftMetaStorage 元信息存储实现接口定义入口：

```java
com.alipay.sofa.jraft.storage.RaftMetaStorage
```

## LocalRaftMetaStorage 基于 ProtoBuf 实现

Protocol Buffers 是一种轻便高效的结构化数据存储格式，用于结构化数据串行化或者说序列化，适合做数据存储或 RPC 数据交换格式，用于通讯协议、数据存储等领域的语言无关、平台无关、可扩展的序列化结构数据格式。用户在 .proto 文件定义 Protocol Buffer 的 Message 类型指定需要序列化的数据结构，每一个 Message  都是一个小的信息逻辑单元包含一系列的键值对，每种类型的 Message 涵盖一个或者多个唯一编码字段，每个字段由名称和值类型组成，允许 Message 定义可选字段 Optional Fields、必须字段 Required Fields、可重复字段 Repeated Fields。

RaftMetaStorage 默认实现 LocalRaftMetaStorage 是基于 ProtoBuf  Message 本地存储 Raft 元数据，初始化元信息存储 StorageFactory 根据 Raft 元信息存储路径、 Raft 内部配置以及 Node 节点监控默认创建 LocalRaftMetaStorage 元信息存储。基于 ProtoBuf 存储实现 LocalRaftMetaStorage 主要操作包括：

- init()：获取 Raft 元信息存储配置 RaftMetaStorageOptions 节点 Node，读取命名为 raft_meta 的 ProtoBufFile 文件加载 StablePBMeta 消息，根据 StablePBMeta ProtoBuf 元数据缓存 Raft 当前任期 Term 和 PeerId 节点投票信息。
- shutdown()：获取内存里 Raft 当前任期 Term 和 PeerId 节点投票构建 StablePBMeta 消息，按照 Raft 内部是否同步元数据配置写入 ProtoBufFile 文件。
- setTerm(term)：检查 LocalRaftMetaStorage 初始化状态，缓存设置的当前任期 Term，按照 Raft 是否同步元数据配置把当前任期 Term 作为 ProtoBuf 消息保存到 ProtoBufFile 文件。
- getTerm()：检查 LocalRaftMetaStorage 初始化状态，返回缓存的当前任期 Term。
- setVotedFor(peerId)：检查 LocalRaftMetaStorage 初始化状态，缓存投票的 PeerId 节点，按照 Raft 是否同步元数据配置把投票 PeerId 节点作为 ProtoBuf 消息保存到 ProtoBufFile 文件。
- getVotedFor()：检查 LocalRaftMetaStorage 初始化状态，返回缓存的投票 PeerId 节点。

![RaftMetaStorage](https://cdn.nlark.com/yuque/0/2019/png/156670/1556046884813-c6c68808-afd6-4725-9446-d6aaf825793f.png)

LocalRaftMetaStorage 基于 ProtoBuf 本地存储 Raft 元信息实现入口。

# 快照存储

当 Raft 节点 Node 重启时，内存中状态机的状态数据丢失，触发启动过程重新存放日志存储 LogStorage 的所有日志重建整个状态机实例，此种场景会导致两个问题：

- 如果任务提交比较频繁，例如消息中间件场景导致整个重建过程很长启动缓慢；
- 如果日志非常多并且节点需要存储所有的日志，对存储来说是资源占用不可持续；
- 如果增加 Node 节点，新节点需要从 Leader 获取所有的日志重新存放至状态机，对于 Leader 和网络带宽都是不小的负担。 

因此通过引入 Snapshot 机制来解决此三个问题，所谓快照 Snapshot 即对数据当前值的记录，是为当前状态机的最新状态构建"镜像"单独保存，保存成功删除此时刻之前的日志减少日志存储占用；启动的时候直接加载最新的 Snapshot 镜像，然后重放在此之后的日志即可，如果 Snapshot 间隔合理，整个重放到状态机过程较快，加速启动过程。最后新节点的加入先从 Leader 拷贝最新的 Snapshot 安装到本地状态机，然后只要拷贝后续的日志即可，能够快速跟上整个 Raft Group 的进度。Leader 生成快照有几个作用：

- 当有新的节点 Node 加入集群不用只靠日志复制、回放机制和 Leader 保持数据一致，通过安装 Leader 的快照方式跳过早期大量日志的回放；
- Leader 用快照替代 Log 复制减少网络端的数据量；
- 用快照替代早期的 Log 节省存储占用空间。

Snapshot 存储，用于存储用户的状态机 Snapshot 及元信息：

- SnapshotStorage 用于 Snapshot 存储实现；
- SnapshotExecutor 用于管理 Snapshot 存储、远程安装、复制。

## SnapshotStorage 存储实现

SnapshotStorage 快照存储实现，定义 Raft 状态机的 Snapshot 存储模块核心 API 接口包括：

- 设置 filterBeforeCopyRemote 设置为 true 复制到远程之前过滤数据；
- 创建快照编写器；
- 打开快照阅读器；
- 从远程 Uri 复制数据；
- 启动从远程 Uri 复制数据的复制任务；
- 配置 SnapshotThrottle，SnapshotThrottle 用于重盘读/写场景限流的，比如磁盘读写、网络带宽。

## LocalSnapshotStorage 基于本地文件实现

SnapshotStorage 默认实现 LocalSnapshotStorage 是基于本地文件存储 Raft 状态机镜像，初始化元快照存储 StorageFactory 根据 Raft 镜像快照存储路径和 Raft 配置信息默认创建 LocalSnapshotStorage 快照存储。基于本地文件存储实现 LocalSnapshotStorage 主要方法包括：

- init()：删除文件命名为 temp 的临时镜像 Snapshot，销毁文件前缀为 snapshot_ 的旧快照 Snapshot，获取快照最后一个索引 lastSnapshotIndex。
- close()：按照快照最后一个索引 lastSnapshotIndex 和镜像编写器 LocalSnapshotWriter 快照索引重命名临时镜像 Snapshot 文件，销毁编写器 LocalSnapshotWriter 存储路径快照。
- create()：销毁文件命名为 temp 的临时快照 Snapshot，基于临时镜像存储路径创建初始化快照编写器 LocalSnapshotWriter，加载文件命名为 __raft_snapshot_meta 的 Raft 快照元数据至内存。
- open()：根据快照最后一个索引 lastSnapshotIndex 获取文件前缀为 snapshot_ 快照存储路径，基于快照存储路径创建初始化快照阅读器 LocalSnapshotReader，加载文件命名为 __raft_snapshot_meta 的 Raft 镜像元数据至内存。
- startToCopyFrom(uri, opts)：创建初始化状态机快照复制器 LocalSnapshotCopier，生成远程文件复制器 RemoteFileCopier，基于远程服务地址 Endpoint 获取 Raft 客户端 RPC 服务连接指定 Uri，启动后台线程复制 Snapshot 镜像数据，加载 Raft 快照元数据获取远程快照 Snapshot 镜像文件，读取远程指定快照存储路径数据拷贝到 BoltSession，快照复制器 LocalSnapshotCopier 同步 Raft 快照元数据。

## SnapshotExecutor 存储管理

快照执行器 SnapshotExecutor 负责 Raft 状态机 Snapshot 存储、Leader 远程安装快照、复制镜像 Snapshot 文件，包括两大核心操作：状态机快照 doSnapshot(done) 和安装快照 installSnapshot(request, response, done)。StateMachine 快照 doSnapshot(done) 获取基于临时镜像 temp 文件路径的 Snapshot 存储快照编写器 LocalSnapshotWriter，加载 __raft_snapshot_meta 快照元数据文件初始化编写器；构建保存镜像回调SaveSnapshotDone 提供 FSMCaller 调用 StateMachine 的状态转换发布 SNAPSHOT_SAVE 类型任务事件到 Disruptor 队列，通过 Ring Buffer 方式触发申请任务处理器 ApplyTaskHandler 运行快照保存任务，调用 onSnapshotSave() 方法存储各种类型状态机快照。远程安装快照 installSnapshot(request, response, done) 按照安装镜像请求响应以及快照原信息创建并且注册快照下载作业 DownloadingSnapshot，加载快照下载 DownloadingSnapshot 获取当前快照拷贝器的阅读器 SnapshotReader，构建安装镜像回调 InstallSnapshotDone 分配 FSMCaller 调用 StateMachine 的状态转换发布 SNAPSHOT_LOAD 类型任务事件到 Disruptor 队列，也是通过 Ring Buffer 触发申请任务处理器 ApplyTaskHandler 执行快照安装任务，调用 onSnapshotLoad() 操作加载各种类型状态机快照。

![SnapshotExecutor](https://cdn.nlark.com/yuque/0/2019/png/156670/1556106827604-1cbaebfc-8e92-46dc-ac8b-a65fca879450.png)

SnapshotExecutor 状态机快照和远程安装镜像实现逻辑：

![SnapshotExecutor](https://cdn.nlark.com/yuque/0/2019/png/156670/1556107235851-88eb8ee8-efb2-4575-a53f-cacd0a9f3bb8.png)

# 总结

本文从 Log 日志存储 LogStorage、Meta 元信息存储 RaftMetaStorage 以及 Snapshot 快照存储 SnapshotStorage 三个方面详述 SOFAJRaft 存储模块实现细节，直观刻画 SOFAJRaft Server 节点 Node 之间存储日志、Raft 配置和镜像流程。

# 欢迎加入，参与 SOFAJRaft 源码解析 

![SOFALab](https://cdn.nlark.com/yuque/0/2019/png/226702/1556166838486-44c2acc2-e0c3-4557-9dfb-881617ad2bb1.png)

本文为《剖析 | SOFAJRaft 实现原理》系列的第一篇， SOFAJRaft 存储模块的介绍，本系列也会逐步详细介绍各个部分的代码设计和实现，预计按照如下的目录进行：

- 【已领取】SOFAJRaft 选举实现剖析
- 【已完成】SOFAJRaft 存储模块剖析
- 【待领取】SOFAJRaft replication-pipeline 实现剖析
- 【已领取】SOFAJRaft batch 优化剖析
- 【已领取】SOFAJRaft 线性一致读实现剖析
- 【已领取】SOFAJRaft snapshot 实现剖析
- 【已领取】SOFAJRaft-RheaKV 是如何使用 Raft 的
- 【已领取】SOFAJRaft-RheaKV 分布式锁实现剖析
- 【已领取】SOFAJRaft-RheaKV multi-raft-group 实现分析

如果有同学对以上某个主题特别感兴趣的，可以留言讨论，我们会适当根据大家的反馈调整文章的顺序，谢谢大家关注 SOFA ，关注 SOFAJRaft，我们会一直与大家一起成长的。

**领取方式：**

直接回复本公众号想认领的文章名称，我们将会主动联系你，确认资质后，即可加入，It's your show time！

除了源码解析，也欢迎提交 issue 和 PR：

**SOFAJRaft：**[https://github.com/sofastack/sofa-jraft](https://github.com/alipay/sofa-jraft)
