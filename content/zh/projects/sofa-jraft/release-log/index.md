---
title: "版本发行日志"
---

---
## 1.3.0

2019-11-29

* Bug Fixes
    * [删除数据并重启且期间没有新的 task 提交的情况下 prev log index 紊乱的修复](https://github.com/sofastack/sofa-jraft/pull/255)
    * [修复一些选举和线性一致读相关的 corner case](https://github.com/sofastack/sofa-jraft/pull/361)
    * [Recyclers 多个线程 recycle 资源时的 NPE 修复](https://github.com/sofastack/sofa-jraft/pull/355)
* Features
    * [新增 Read-only member(learner) 角色，支持 learner 节点上的线性一致读](https://github.com/sofastack/sofa-jraft/pull/312)
    * [实现优先级选举](https://github.com/sofastack/sofa-jraft/pull/334)
    * [在 multi raft group 的场景中，随机打散每个 group 的第一次 snapshot timeout 时间，避免一个进程内多个 group 同时 snapshot](https://github.com/sofastack/sofa-jraft/pull/358)
    * [RheaKV 新增 containsKey API](https://github.com/sofastack/sofa-jraft/pull/302)
    * [RheaKV 实现 snapshot checksum 以及异步 snapshot](https://github.com/sofastack/sofa-jraft/pull/287)
    * [新增 replicator 的 state 监听器： ReplicatorStateListener](https://github.com/sofastack/sofa-jraft/pull/256)
    * [RepeatedTimer 的默认实现替换为 HashedWheelTimer](https://github.com/sofastack/sofa-jraft/pull/258)
    * [修复 windows 上定时器 CPU 消耗偏高的问题](https://github.com/sofastack/sofa-jraft/issues/311)
    * kill -s SIGUSR2 pid 中增加打印 rocksdb stats 和所有 ThreadPool 指标统计信息
    * 升级 rocksdb 版本到 5.18.3
    * [新增实验性质的 RocksDBSegmentLogStorage，适合 value 较大的数据存储](https://github.com/sofastack/sofa-jraft/pull/156)
    * Counter 例子改进，演示 ReadIndex 线性一致读
    * [当优化 checksum 中多余的 mem copy](https://github.com/sofastack/sofa-jraft/pull/293)
* Breaking Changes
    * 无
* 致谢（排名不分先后）
    * @zongtanghu @devYun @masaimu @SteNicholas @yetingsky

---

## 1.2.6

2019-08-15

* Bug Fixes
    * [修复 ReadIndex 并发情况下可能出现的读超时](https://github.com/alipay/sofa-jraft/pull/121)
    * [保存 raft meta 失败后终止状态机](https://github.com/alipay/sofa-jraft/pull/96)
    * [修复 windows 环境中无法原子 move 文件的问题](https://github.com/alipay/sofa-jraft/pull/104)
    * [当 RheaKV apply 失败时终止状态机避免出现数据不一致情况](https://github.com/alipay/sofa-jraft/pull/137)
* Features
    * [增加 LogEntry checksum validation](https://github.com/alipay/sofa-jraft/pull/123)
    * [优化 log replication 线程模型减少锁竞争](https://github.com/alipay/sofa-jraft/pull/170)
    * [优化 RheaKV multi group snapshot](https://github.com/alipay/sofa-jraft/pull/42)
    * [对于 multi-raft-group 场景，提供 manual rebalance API 在无 PD 模式手动平衡各节点 leader 数量](https://github.com/alipay/sofa-jraft/pull/176)
    * CliService 提供获取存活 follower 节点的 API
    * 引入 SPI 扩展机制，LogStorage、SnapshotStorage、RaftMetaStorage、LogEntryCodec 均可基于 SPI 扩展
    * [Linux 平台 SIGUSR2 信号输出节点状态以及 metric 信息](https://github.com/alipay/sofa-jraft/pull/208)
    * RheaKV 增加 CompareAndPut 原子更新 API
    * [新增 pooled buf allocator 解决 log replication 时大量分配 byte[] 频繁触发 fullgc](https://github.com/alipay/sofa-jraft/pull/161)
    * [默认关闭 RheaKV rocksdb 的 fsync 和 WAL，依靠 raft log 和 snapshot 确保数据一致性](https://github.com/alipay/sofa-jraft/pull/159)
    * [当 raft node 过载时拒绝新的请求](https://github.com/alipay/sofa-jraft/pull/144)
* Breaking Changes
    * 无
* 致谢（排名不分先后）
    * @SteNicholas @zongtanghu

---

## 1.2.5

2019-04-01

* Bug Fixes
    * 修复 jmh 与 unit test 代码冲突问题
    * 修复 snapshot 过大引起的安装失败 bug，会影响新增节点的加入
* Features
    * LogManagerImpl 中耗费 cpu 部分的代码优化
    * 修正一些单词拼写错误
* Breaking Changes
    * 无

__此版本强烈推荐升级__

---

## 1.2.4

2019-03-20

* Bug Fixes
    * [修复一种情况下 lease read 的 stale read](https://github.com/alipay/sofa-jraft/pull/34)
    * [部分 timestamp 修改为 monotonic time](https://github.com/alipay/sofa-jraft/issues/24)
    * [修复一种情况下 replicator 被 block 住的问题](https://github.com/alipay/sofa-jraft/pull/19)
    * [解决 windows 平台下某些单测无法创建目录](https://github.com/alipay/sofa-jraft/pull/51)
    * [解决 windows 平台下某些 rocksdb options 设置不当导致进程 crash](https://github.com/alipay/sofa-jraft/pull/22)
* Features
    * [开放 RocksDB options 的设置给用户层](https://github.com/alipay/sofa-jraft/issues/20)
    * [Pre-vote 优化，启用 lease 机制来规避网络分区+集群长时间无写入的情况下，游离节点回归后打断当前 term，提升系统可用性](https://github.com/alipay/sofa-jraft/issues/15)
    * [升级 bolt 到 1.5.3](https://github.com/alipay/sofa-jraft/issues/10)
    * [BallotBox 中的 ReadWriteLock 优化为 StampedLock 并对 lastCommittedIndex 提供乐观读实现](https://github.com/alipay/sofa-jraft/pull/3)
    * 修正几个单词拼写错误
* Breaking Changes
    * 无
* 致谢（排名不分先后）
    * @pifuant @huangyunbin @shiftyman @slievrly

---

## 1.2.3

2019-03-05
开源第一个版本

---

## 1.2.2

2019-02-21

* Bug Fixes
    * PeerId 以及 Endpoint 改为不可变对象，避免 getLeaderId 等 api 的并发问题
    * sofa-common 升级到 1.0.12，之前依赖的 1.0.9 版本没有发布到公网仓库
* Features
    * Jraft-rheakv 完成了 auto range split，在启用 placementDriver（pd）的情况下，pd 可根据每个节点上报的状态信息计算并下发 range split 指令；不启用 pd 的情况下也提供了 RheaKVCliService，可以使用 cli 手动触发 range split
    * LogExceptionHandler 泛型支持
    * 新增 MetricThreadPoolExecutor（继承 LogThreadPoolExecutor），用于打印 uncaught exception 日志并统计 task.run() 耗时，jraft 中所有 ThreadPoolExecutor 全部替换为 MetricThreadPoolExecutor 进行耗时指标统计，这个指标可作为实践中调整线程池配置的重要参考
* Breaking Changes
    * 移除了 Endpoint/PeerId 的 `reset` 方法。

---

## 1.2.1

2019-01-28

* Bug Fixes
    * 修复 RaftGroupService 关闭共享的 rpcServer。
    * 修复 RheaKV 状态机中的的 batch write 导致 apply 顺序变更。
    * 修复时间使用 API 错误。
* Features
    * 融合 jraft 与 rheakv 重复功能的代码。
    * 降低 Follower 复制请求处理过程中的内存消耗。
    * RouteTable 中的 conf 读写由原来的 synchronized 优化为读写锁。
    * RheaKV 实现 distributed lock 的 [lock safe with fencing](http://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html), 以及自动续租能力。
    * RheaKV 新增 memoryDB 存储类型的实现, 默认配置仍为 rocksDB 存储。
    * RheaKV 实现 get/put 接口的 client batching, 有很好的性能收益。
    * 新增 module: jraft-example, 添加了丰富的用例。
    * 新增 Configured options, 方便非配置文件使用方式。
    * 新增 benchmark 代码, 根据压测结果更新了部分配置的默认值, [压测结果见这里](https://github.com/sofastack/sofa-jraft/wiki/Benchmark-%E6%95%B0%E6%8D%AE)。
* Breaking Changes
    * 项目的 groupId 由 com.alipay.jraft 变更为 com.alipay.sofa, 包名变更为 com.alipay.sofa.jraft，所以在通信层 1.2.1 版本与之前的版本不能兼容，批量发布过程中新老版本同时存在可能导致出现两个 leader 的情况，如果需要平滑升级的同学请联系我们提供平滑升级方案

**此版本推荐升级。**

---

## 1.1.0

2018-11-20

1. 升级bolt到1.5.2（**重要， bolt 老版本存在重连引起的死锁问题**）。<br />
2. 新增了一个嵌入式的分布式 KV 组件(RheaKV)<br />
3. CliServiceImpl 的 getLeader 应该在某个节点失败情况下自动重试下一个节点<br />
4. 新增 `NodeImpl#getCurrentConf()` 方法用于获取当前节点的配置列表**，仅用于调试查看**。<br />
5. 改进 disruptor 线程使用，改进服务关闭过程，更友好地关闭线程。<br />
6. 修复 Configuration 变更没有反馈到 Node 内存状态的 bug<br />
7. 升级 RocksDB 到 5.14.2<br />
8. 加强了用户使用 API 的参数校验。<br />

---

## 1.0.1

2018-10-09

1. RocksDB log 存储尊重 RaftOptions 的 sync 选项。<br />
2. 移除 log4j 类库强依赖。<br />
3. 修复一些 typo<br />

---

## 1.0.0 

2018.09.13

1. 日志压缩异步化，加速 snapshot 处理。<br />
2. Replicator pipeline 优化。<br />
3. Task 的 closure 新增 `onCommitted` 回调，在日志提交到 RAFT group 之后，应用到状态机之前回调。<br />
4. 更加详细的 metrics 统计信息。<br />
5. 线性一致读支持，参见文档。<br />
6. 强制要求 bolt 升级到 1.5.1 版本及以上，因为 pipeline 特性依赖。<br />

---

## 0.0.2

2018-08-23:

1. 增加 metrics 统计，参见文档。 <br />
2. 改善日志压缩和内部实现部分性能。<br />

---

## 0.0.1

1. 基础版本发布，实现了 braft 除了 snapshot  流控之外的所有功能。<br />
