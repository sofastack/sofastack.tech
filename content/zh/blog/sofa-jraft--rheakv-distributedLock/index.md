---
title: "SOFAJRaft-RheaKV 分布式锁实现剖析　| SOFAJRaft 实现原理"
author: "米麒麟"
authorlink: "https://github.com/SteNicholas"
description: "本文为《剖析 | SOFAJRaft 实现原理》第七篇，本篇作者米麒麟。"
categories: "SOFAJRaft"
tags: ["SOFAJRaft","剖析 | SOFAJRaft 实现原理","SOFALab"]
date: 2019-09-17T20:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1568724694999-7ae0e484-4de4-43c7-91e7-4b1f9a38a602.jpeg"
---

> **SOFAStack**（**S**calable **O**pen **F**inancial  **A**rchitecture Stack）是蚂蚁金服自主研发的金融级分布式架构，包含了构建金融级云原生架构所需的各个组件，是在金融场景里锤炼出来的最佳实践。

![SOFAJRaft-RheaKV 分布式锁实现剖析](https://cdn.nlark.com/yuque/0/2019/png/226702/1568253373833-1a1fa26d-ff1c-4ead-9390-b833d568d9e9.png)

SOFAJRaft 是一个基于 Raft 一致性算法的生产级高性能 Java 实现，支持 MULTI-RAFT-GROUP，适用于高负载低延迟的场景。

本文为《剖析 | SOFAJRaft 实现原理》第七篇，本篇作者米麒麟，来自陆金所。《剖析 | SOFAJRaft 实现原理》系列由 SOFA 团队和源码爱好者们出品，项目代号：<SOFA:JRaftLab/>，文末包含往期系列文章。

SOFAJRaft ：[https://github.com/sofastack/sofa-jraft](https://github.com/sofastack/sofa-jraft)

## 前言

在分布式部署、高并发、多线程场景下，我们经常会遇到资源的互斥访问的问题，最有效、最普遍的方法是给共享资源或者对共享资源的操作加一把锁。在 JDK 中我们可以使用 ReentrantLock 重入锁或者 synchronized 关键字达成资源互斥访问目的，但是由于分布式系统的分布性（即多线程和多进程并且分布在不同机器中），使得两种锁失去原有锁的效果，需要用户自定义来实现分布式锁。

本文重点围绕分布式锁概览、实现方式以及基于 SOFAJRaft 实现等方面剖析 SOFAJRaft-RheaKV 基于 SOFAJRaft 实现分布式锁原理，阐述如何使用 SOFAJRaft 组件提供分布式锁服务功能：

- 什么是分布式锁？分布式锁具备哪些条件？分布式锁有哪些实现方式？
- RheaKV 基于 SOFAJRaft 如何实现分布式锁？解决分布式锁哪些问题？

## 分布式锁

分布式锁是控制分布式系统之间同步访问共享资源的一种方式，用于在分布式系统中协调他们之间的动作。如果不同的系统或是同一个系统的不同主机之间共享了一个或一组资源，那么访问这些资源的时候，往往需要互斥来防止彼此干扰来保证一致性，在这种情况下便需要使用到分布式锁。分布式锁通过共享标识确定其唯一性，对共享标识进行修改时能够保证原子性和对锁服务调用方的可见性。

### 分布式锁概览

Martin Kleppmann 是英国剑桥大学的分布式系统研究员，之前和 Redis 之父 Antirez 关于 RedLock 红锁是否安全的问题激烈讨论过。Martin 认为一般我们使用分布式锁有两个场景：

- 效率：使用分布式锁能够避免不同节点重复相同的工作导致浪费资源，譬如用户付款之后有可能不同节点发出多条短信；
- 正确性：添加分布式锁同样避免破坏正确性事件的发生，如果两个节点在同一条数据上面操作，譬如多个节点机器对同一个订单操作不同的流程有可能导致该笔订单最后状态出现错误造成资金损失；

分布式锁需要具备的条件包括：

- 获取锁和释放锁的性能要好；
- 判断获得锁是否是原子性的，否则可能导致多个请求都能获取到锁；
- 网络中断或者宕机无法释放锁时，锁必须被清除；
- 可重入一个线程中多次获取同一把锁，譬如一个线程在执行带锁的方法，该方法调用另一个需要相同锁的方法，则该线程直接执行调用的方法，而无需重新获得锁；
- 阻塞锁和非阻塞锁，阻塞锁即没有获取到锁，则继续等待获取锁；非阻塞锁即没有获取到锁，不继续等待直接返回获取锁失败；

### 分布式锁实现

分布式 CAP 理论告诉我们“任何一个分布式系统都无法同时满足一致性（Consistency）、可用性（Availability）和分区容错性（Partition Tolerance），最多只能同时满足两项。”，很多系统在设计之初就要对这三者做出取舍。在互联网领域的绝大多数的场景中，都需要牺牲强一致性来换取系统的高可用性，系统往往只需要保证“最终一致性”，只要这个最终时间是在用户可以接受的范围内即可。在很多场景中为了保证数据的最终一致性，需要很多的技术方案来支持，比如分布式事务、分布式锁等。有的时候需要保证一个方法在同一时间内只能被同一个线程执行。
分布式锁一般有三种实现方式：

- 基于数据库实现分布式锁；
- 基于缓存（Redis，Memcached，Tair）实现分布式锁；
- 基于 ZooKeeper 实现分布式锁；

#### 基于数据库实现分布式锁

基于数据库实现分布式锁的核心思想：在数据库中创建一张表，表里包含方法名等字段，并且在方法名字段上面创建唯一索引，执行某个方法需要使用此方法名向表中插入数据，成功插入则获取锁，执行结束则删除对应的行数据释放锁。

#### 基于缓存实现分布式锁

基于缓存通常选用 Redis 实现分布式锁，考虑到 Redis 有非常高的性能，Redis 命令对分布式锁支持友好，并且实现方便。基于单 Redis 节点的分布式锁在 Failover 的时候产生解决不了的安全性问题，Redlock 是 Redis 的作者 Antirez 提出的集群模式 Redis 分布式锁，基于 N 个完全独立的 Redis 节点（通常情况下 N 可以设置成5），运行 Redlock 算法依次执行下面各个步骤完成获取锁的操作

- 获取当前时间（毫秒数）；
- 按顺序依次向 N 个 Redis 节点执行获取锁的操作。此获取操作包含随机字符串 my_random_value，也包含过期时间(比如 PX 30000，即锁的有效时间)。为了保证在某个 Redis 节点不可用的时候算法能够继续运行，获取锁的操作还有超时时间(time out)，它要远小于锁的有效时间（几十毫秒量级）。客户端在向某个 Redis 节点获取锁失败以后应该立即尝试下一个Redis 节点。这里的失败包含任何类型的失败，比如该 Redis 节点不可用，或者该 Redis 节点上的锁已经被其它客户端持有（注：Redlock 原文中这里只提及 Redis 节点不可用的情况，但也应该包含其它的失败情况）；
- 计算整个获取锁的过程总共消耗了多长时间，计算方法是用当前时间减去第1步记录的时间。如果客户端从大多数 Redis 节点（>= N/2+1）成功获取到了锁，并且获取锁总共消耗的时间没有超过锁的有效时间（lock validity time），那么这时客户端才认为最终获取锁成功；否则认为最终获取锁失败；
- 如果最终获取锁成功了，那么此锁的有效时间应该重新计算，它等于最初锁的有效时间减去第3步计算出来的获取锁消耗的时间；
- 如果最终获取锁失败（可能由于获取到锁的 Redis 节点个数少于 N/2+1，或者整个获取锁的过程消耗的时间超过了锁的最初有效时间），那么客户端立即向所有 Redis 节点发起释放锁的操作；

#### 基于 ZooKeeper 实现分布式锁

ZooKeeper 是以 Paxos 算法为基础的分布式应用程序协调服务，为分布式应用提供一致性服务的开源组件，其内部是分层的文件系统目录树结构，规定同一个目录下只能有一个唯一文件名。基于 ZooKeeper 实现分布式锁步骤包括：

- 创建一个锁目录 lock；
- 希望获得锁的线程 A 在 lock 目录下创建临时顺序节点；
- 当前线程获取锁目录下所有的子节点，然后获取比自己小的兄弟节点，如果不存在表示当前线程顺序号最小，获得锁；
- 线程 B 获取所有节点，判断自己不是最小节点，设置监听（Watcher）比自己次小的节点（只关注比自己次小的节点是为了防止发生“羊群效应”）；
- 线程 A 处理完删除自己的节点，线程 B 监听到变更事件判断自己是否为最小的节点，如果是则获得锁；

## RheaKV 分布式锁实现

RheaKV 是基于 SOFAJRaft 和 RocksDB 实现的嵌入式、分布式、高可用、强一致的 KV 存储类库，RheaKV 提供 DistributedLock 实现可重入锁，自动续租以及 Fencing Token 功能特性。DistributedLock 是可重入锁， tryLock() 与 unlock() 必须成对出现。RheaKV 调用 getDistributedLock 接口获取分布式锁实例，其中参数：

-  target 理解为分布式锁的 key, 不同锁的 key 不能重复，但是锁的存储空间是与其他 KV 数据隔离的，所以只需保证 key 在 '锁空间' 内的唯一性即可；
- lease 必须包含锁的租约（lease）时间，在锁到期之前如果 watchdog 为空那么锁会被自动释放，即没有 watchdog 配合的 lease 就是 timeout 的意思；
- watchdog 表示自动续租的调度器，需要用户自行创建并销毁，框架内部不负责该调度器的生命周期管理，如果 watchdog 不为空定期（lease 的 2/3 时间为周期）主动为当前的锁不断进行续租，直到用户主动释放锁（unlock）；

```java
DistributedLock<byte[]> getDistributedLock(final byte[] target, final long lease, final TimeUnit unit);
DistributedLock<byte[]> getDistributedLock(final String target, final long lease, final TimeUnit unit);
DistributedLock<byte[]> getDistributedLock(final byte[] target, final long lease, final TimeUnit unit,
                                           final ScheduledExecutorService watchdog);
DistributedLock<byte[]> getDistributedLock(final String target, final long lease, final TimeUnit unit,
                                           final ScheduledExecutorService watchdog);
```

### RheaKV 分布式锁 Example

```java
DistributedLock<T> lock = ...;
if (lock.tryLock()) {
    try {
        // manipulate protected state
    } finally {
        lock.unlock();
    }
} else {
    // perform alternative actions
}
```

详情请参考 github 仓库中下面这个类：

```java
com.alipay.sofa.jraft.example.rheakv.DistributedLockExample
```

### Lock 流程

RheaKV 调用 tryLock(ctx) 方法尝试设置分布式锁，其中入参 ctx 作为当前的锁请求者的用户自定义上下文数据，如果锁请求者成功获取到锁，其他线程以及进程也能够看得到锁持有者的 ctx 上下文。RheaKV 尝试构建锁使用 DistributedLock 默认实现 DefaultDistributedLock 的 internalTryLock(ctx) 内部方法添加分布式锁：

- 获取分布式锁内部 key 和锁获取器 acquirer，调用 DefaultRheaKVStore 的 tryLockWith(key, keepLease,  acquirer) 方法进行设置分布式锁；
- 检查 RheaKVStore 状态是否为已启动或者已关闭，PlacementDriverClient 按照分布式锁 key 定位所对应的分区 region，根据分区 region 的 id 获取 Leader 节点分区引擎 ,基于分布式锁 key 和锁获取器 acquirer 生成重试器 retryRunner 组建 Failover 回调 failoverClosure；
- 判断分区引擎 regionEngine 是否为空，如果 regionEngine 为空表示 Leader 节点不在本地则构建 KeyLockRequest 给 RheaKVStore 分区 Leader 节点发起异步 RPC 调用请求加锁；如果 regionEngine 非空则确保当前分布式锁对应的分区 region 在合理 Epoch 期数范畴内，获取分区引擎 regionEngine 底层 MetricsRawKVStore 尝试添加锁；
- MetricsRawKVStore 使用基于 Raft 协议副本状态机的 RaftRawKVStore 设置分布式锁，其算法依赖于以下假设：尽管跨进程存在非同步时钟，但每个进程中的本地时间仍以大致相同的速率流动，并且与锁的自动释放时间相比其错误较小。锁获取器 acquirer 设置默认时钟为锁时间戳，申请基于分布式锁 key 的加锁 KEY_LOCK 操作 KVOperation；
- RheaKV 存储状态机 KVStoreStateMachine 按照操作类型为 KEY_LOCK 批量调用 RocksRawKVStore 的tryLockWith(key, fencingKey, keepLease, acquirer, closure) 基于 RocksDB 执行加锁操作。RocksRawKVStore 获取读写锁 readWriteLock 的读锁并且加读锁，查询 RocksDB 分布式锁 key 的锁持有者 prevBytesVal。创建分布式锁持有者构造器 builder，通过锁持有者构造器构造锁持有者 owner 并且回调 KVStoreClosure 返回其锁持有者 owner，读写锁 readWriteLock 的读锁进行解锁：
  - 检查此锁持有者 prevBytesVal 是否为空：
    - prevBytesVal 为空表示无其他锁请求者持有此锁即首次尝试上锁或者此锁已删除，锁持有者构造器设置锁持有者 id 为锁获取器 acquirer 的 id 即表示将持有此锁，指定新的截止时间戳，定义租约剩余时间为首次获取锁成功 FIRST_TIME_SUCCESS 即-1，按照 fencingKey 新建 fencing token，初始化锁重入 acquires 为1，设置锁持有者上下文为锁获取器 acquirer 的上下文，设置上锁成功构建锁持有者 owner 基于分布式锁 key 键值对方式插入 RocksDB 存储；
  - 锁持有者 prevBytesVal 非空检查其锁持有是否过期即使用序列化器读取其之前锁持有者 prevOwner，判断距离锁持有截止剩余时间是否小于0：
    - 小于0表示锁持有者已超出其租约，锁持有者构造器设置锁持有者 id 为锁获取器 acquirer 的 id 即表示将持有此锁，指定新的截止时间戳，定义租约剩余时间为新获取锁成功 NEW_ACQUIRE_SUCCESS 即-2，按照 fencingKey 新建 fencing token，初始化锁重入 acquires 为1，设置锁持有者上下文为锁获取器 acquirer 的上下文，设置上锁成功构建锁持有者 owner 基于分布式锁 key 键值对方式插入 RocksDB 存储；
  - 锁持有者未超出租约即剩余时间大于或者等于0，检查之前锁持有者的锁获取器与当前锁获取器 acquirer 是否相同：
    - 锁获取器相同表示此分布式锁为重入锁，锁持有者构造器设置锁持有者 id 为之前锁持有者 id，更新截止时间戳保持续租，指定租约剩余时间为重入成功 REENTRANT_SUCCESS 即-4，保持锁持有者 prevOwner 的 fencing token，修改锁重入 acquires 自增1，更新锁持有者上下文为锁获取器 acquirer 的上下文，设置上锁成功构建锁持有者 owner 基于分布式锁 key 键值对方式插入 RocksDB 存储；
    - 此锁已存在且之前锁持有者与当前锁请求者不同表示非重入锁，表示其他锁请求者在尝试上已存在的锁，锁持有者构造器设置锁持有者 id 为之前锁持有者 id，更新租约剩余时间为当前锁持有者的租约剩余时间，指定锁持有者上下文为锁持有者 prevOwner 的上下文，设置上锁失败构建锁持有者 owner；

![捕获](https://cdn.nlark.com/yuque/0/2019/png/156670/1568697945565-97c007fd-13b8-40c7-b0b8-1d681a4af1cc.png)

- 检查分布式锁持有者 owner 是否成功，获取锁持有者成功表示设置分布式锁成功，更新当前锁持有者的锁获取器 acquirer 的 fencing token，获取自动续租的调度器 watchdog 调用 scheduleKeepingLease(watchdog, internalKey, acquirer, period) 以租约 lease 的 2/3 时间为调度周期给当前的锁不断续租保持租约；
- 当成功上锁后通过 getFencingToken() 接口获取当前的 fencing token， 此为单调递增数字即其值大小代表锁拥有者们先来后到的顺序。在下面的时序图中假设锁服务本身是没有问题的，它总是能保证任一时刻最多只有一个客户端获得锁，客户端1在获得锁之后发生很长时间的 GC pause，在此期间其获得的锁已过期，而客户端2获得锁。当客户端1从 GC pause 中恢复过来时，它不知道自己持有的锁已过期，依然向共享资源即下图的存储服务发起写数据请求，而这时锁实际上被客户端2持有，因此两个客户端的写请求有可能冲突即锁的互斥作用失效，使用此 fencing token 解决下图此问题：

![冲突即锁](https://cdn.nlark.com/yuque/0/2019/png/156670/1568275339888-a0173bf0-1744-4155-a401-3623bd6b9486.png)

（此图来自 [http://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html](http://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html)）

### Unlock 流程

RheaKV 调用 unlock() 方法尝试释放分布式锁，使用分布式锁接口默认实现 DefaultDistributedLock 的  unlock() 方法尝试释放锁：

- 获取分布式锁内部 key 和锁获取器 acquirer，调用 DefaultRheaKVStore 的 releaseLockWith(key, acquirer) 方法释放分布式锁；
- 检查 RheaKVStore 状态是否为已启动或者已关闭，根据分布式锁 key 查找所对应的分区 region，根据分区 region 的 id 获取 Leader 节点分区引擎 regionEngine,基于分布式锁 key 和锁获取器 acquirer 创建重试器 retryRunner 构成 Failover 回调 failoverClosure；
- 检查分区引擎 regionEngine 是否为空，假如 regionEngine 为空则构建 KeyUnlockRequest 发起对RheaKVStore 分区 Leader 节点发起异步 RPC 调用请求解锁；如果 regionEngine 非空则确保当前分布式锁 key 所在的分区 region 在合理 Epoch 期数范围，获取分区引擎 regionEngine 底层 MetricsRawKVStore 尝试解除锁；
- MetricsRawKVStore 通过基于 Raft 协议副本状态机的 RaftRawKVStore 解除分布式锁，申请基于分布式锁 key 的解锁 KEY_LOCK_RELEASE 操作 KVOperation；
- RheaKV 存储状态机 KVStoreStateMachine 按照操作类型为 KEY_LOCK_RELEASE 批量调用 RocksRawKVStore 的 releaseLockWith(key, acquirer, closure) 基于 RocksDB 执行解锁操作。RocksRawKVStore 获取读写锁 readWriteLock 的读锁并且加读锁，查询 RocksDB 分布式锁 key 的锁持有者 prevBytesVal。创建分布式锁持有者构造器 builder，通过锁持有者构造器构造锁持有者 owner 并且回调 KVStoreClosure 返回其锁持有者 owner，读写锁 readWriteLock 的读锁进行解锁：
  - 检查此锁持有者 prevBytesVal 是否为空：
    - prevBytesVal 为空表示无其他锁请求者持有此锁即此锁不存在，锁持有者构造器设置锁持有者 id 为锁获取器 acquirer 的 id 即表示将持有此锁，指定 fencing token 为锁获取器 acquirer 的 fencing token，定义锁重入 acquires 为0，设置解锁成功构建锁持有者 owner；
  - 锁持有者 prevBytesVal 非空检查使用序列化器读取其之前锁持有者 prevOwner，检查之前锁持有者的锁获取器与当前锁获取器 acquirer 是否相同：
    - 锁获取器相同表示此分布式锁为重入锁，锁持有者构造器设置锁持有者 id 为之前锁持有者 id，更新截止时间戳为锁持有者 prevOwner 的截止时间戳，保持锁持有者 prevOwner 的 fencing token，修改锁重入 acquires 为之前锁持有减1，更新锁持有者上下文为锁持有者 prevOwner 的上下文，设置解锁成功构建锁持有者 owner，按照锁重入 acquires 是否小于或者等于0基于分布式锁 key 删除 RocksDB 锁持有者（锁重入 acquires 小于或者等于0）或者覆盖 RocksDB 更新锁持有者（锁重入 acquires 大于0）；
    - 锁持有者 prevOwner 的锁获取器与当前锁获取器 acquirer 不同表示当前锁获取器不合理不能进行解锁，锁持有者构造器设置锁持有者 id 为之前锁持有者 id 通知真正的锁持有者，保持锁持有者 prevOwner 的 fencing token，保持锁重入 acquires 为之前锁持有，更新锁持有者上下文为锁持有者 prevOwner 的上下文，设置解锁失败构建锁持有者 owner；

![捕获1](https://cdn.nlark.com/yuque/0/2019/png/156670/1568698722321-1c512f6a-1229-4e11-afd5-c52ab81ad6dd.png)

- 更新当前锁持有者 owner，检查锁持有者的锁获取器是否为当前锁获取器 acquirer，使用 tryCancelScheduling() 方法取消自动续租调度；

RheaKV 基于 DistributedLock 默认实现 DefaultDistributedLock 核心逻辑：

![RheaKV 核心逻辑](https://cdn.nlark.com/yuque/0/2019/png/156670/1568547670087-4635b74e-8d27-47ce-afac-04299d52ca91.png)

![carbon](https://cdn.nlark.com/yuque/0/2019/png/156670/1568547279204-f855e55f-91fd-4034-ade6-2eb413663ce8.png)

## 总结

本文围绕分布式锁原理，实现方式以及基于 SOFAJRaft 实现细节方面阐述 SOFAJRaft-RheaKV 分布式锁基本原理，剖析 SOFAJRaft-RheaKV 如何使用 SOFAJRaft 组件解决分布式锁实现问题，基于 DistributedLock 接口通过 Raft 分布式一致性协议提供分布式锁服务。

## 参考资料

- [分布式锁简单入门以及三种实现方式介绍](https://blog.csdn.net/xlgen157387/article/details/79036337)

- [基于Redis的分布式锁到底安全吗（上）？](http://zhangtielei.com/posts/blog-redlock-reasoning.html)

### SOFAJRaft 源码解析系列阅读

- [SOFAJRaft 日志复制 - pipeline 实现剖析 | SOFAJRaft 实现原理](https://www.sofastack.tech/blog/sofa-jraft-pipeline-principle/)
- [SOFAJRaft 选举机制剖析 | SOFAJRaft 实现原理](https://www.sofastack.tech/blog/sofa-jraft-election-mechanism/)
- [SOFAJRaft 线性一致读实现剖析 | SOFAJRaft 实现原理](https://www.sofastack.tech/blog/sofa-jraft-linear-consistent-read-implementation/)
- [SOFAJRaft 实现原理 - SOFAJRaft-RheaKV 是如何使用 Raft 的](https://www.sofastack.tech/blog/sofa-jraft-rheakv/)
- [SOFAJRaft 实现原理 - 生产级 Raft 算法库存储模块剖析](https://www.sofastack.tech/blog/sofa-jraft-algorithm-storage-module-deep-dive/)
- [SOFAJRaft-RheaKV MULTI-RAFT-GROUP 实现分析 | SOFAJRaft 实现原理](https://www.sofastack.tech/blog/sofa-jraft-rheakv-multi-raft-group/)
