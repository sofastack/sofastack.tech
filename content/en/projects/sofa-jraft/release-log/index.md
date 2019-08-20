---

title: "Release notes"
---

---

## 1.2.5

April 1, 2019

* Bugs fixed
   * Fixed the conflict between jmh and the unit test code.
   * Fixed the installation failure bug that would occur when the snapshot is too large. This bug may affect the addition of new nodes.
* Features
   * Optimized part of the LogManagerImpl code to reduce CPU usage.
   * Corrected some spelling errors.
* Breaking changes
   * None

__We strongly recommend that you upgrade to this version.__

---

## 1.2.4

March 20, 2019

* Bugs fixed
   * [Fixed stale read of lease read in a circumstance.](https://github.com/alipay/sofa-jraft/pull/34)
   * [Modified part of timestamps to monotonic time.](https://github.com/alipay/sofa-jraft/issues/24)
   * [Fixed the problem of the replicator being blocked in one circumstance.](https://github.com/alipay/sofa-jraft/pull/19)
   * [Resolved directory creation failures for some unit tests on Windows.](https://github.com/alipay/sofa-jraft/pull/51)
   * [Resolved process crashes caused by improper rocksdb options settings on Windows.](https://github.com/alipay/sofa-jraft/pull/22)
* Features
   * [Made the RocksDB options available for users to set.](https://github.com/alipay/sofa-jraft/issues/20)
   * [Optimized the pre-vote process, and used the lease mechanism to avoid the current term's interruption on a disconnected node (caused by network partitioning or no writes in the cluster for a long time) to improve the system availability.](https://github.com/alipay/sofa-jraft/issues/15)
   * [Updated SOFABolt to 1.5.3.](https://github.com/alipay/sofa-jraft/issues/10)
   * [Modified ReadWriteLock of the BallotBox to StampedLock, and provided the OptimisticRead implementation.](https://github.com/alipay/sofa-jraft/pull/3)
   * Fixed a few spelling errors.
* Breaking changes
   * None
* Acknowledgements (in no particular order)
   * @pifuant @huangyunbin @shiftyman @slievrly

---

## 1.2.3

March 5, 2019
Released the first open source version.

---

## 1.2.2

February 21, 2019

* Bugs fixed
   * Made PeerId and Endpoint immutable, to avoid concurrency problems on APIs such as getLeaderId.
   * Upgraded sofa-common to 1.0.12. The earlier version 1.0.9 was not released to the public GitHub repository.
* Features
   * The JRaft-RheaKV implemented auto range split. When placementDriver(pd) is enabled, the pd can calculate and issue the range split command based on state information reported by each node. When pd is disabled, RheaKVCliService is provided to allow users to manually trigger range split by using the CLI service.
   * Provided LogExceptionHandler generic support.
   * Added MetricThreadPoolExecutor (an updated version of LogThreadPoolExecutor) to print the uncaught exception log and record the time for task.run() and replaced all ThreadPoolExecutors in JRaft with MetricThreadPoolExecutor to record time-consumption metric statistics. This metric can be used as an important reference for adjusting the thread pool configuration in actual application.
* Breaking changes
   * Removed the `reset` method of Endpoint/PeerId.

---

## V1.2.1

January 28, 2019

* Bugs fixed
   * Fixed a bug that RaftGroupService may mistakenly disable the shared rpcServer.
   * Fixed the bug of the apply-order change caused by batch write of the RheaKV state machine.
   * Fixed the time usage API error.
* Features
   * Merged the code of duplicate functions of Jraft and RheaKV.
   * Reduced memory usage of the log replication request handling process on followers.
   * Optimized the synchronized conf read/write of the RouteTable to the read/write lock.
   * Implemented [lock safe with fencing](http://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html) and the automatic lease renewal capability of the distributed lock in RheaKV.
   * Added the implementation of the memoryDB storage type. The default configuration is still rocksDB storage.
   * Implemented client batching of the get/put APIs in RheaKV, significantly improving the performance.
   * Added the jraft-example module, and provided extensive use cases.
   * Added Configured options to make configuration convenient without a configuration file.
   * Added the benchmark code, and updated default values of some configuration items based on the stress testing results. For more information of the stress testing results, click [here](https://github.com/sofastack/sofa-jraft/wiki/Benchmark-%E6%95%B0%E6%8D%AE).
* Breaking changes
   * Changed the groupId of the project from com.alipay.jraft to com.alipay.sofa, and changed the package name to com.alipay.sofa.jraft. As a result, JRaft 1.2.1 is no longer compatible with earlier versions in the communication layer. During the batch release process, the coexistence of the new and earlier versions may result in two leaders being elected at the same time. If you need to smoothly scale up your cluster, contact us for the smooth upgrade solution.

**We recommend that you upgrade to this version.**

---

## 1.1.0

November 20, 2018

1. Upgraded Bolt to 1.5.2 (**Important. The earlier Bolt version has the problem of deadlock caused by reconnection**).<br />
2. Added an embedded distributed KV component (RheaKV).<br />
3. The getLeader method of CliServiceImpl now automatically retries the next node when a node fails.<br />
4. Added the `NodeImpl#getCurrentConf()`method to get the configuration list of the current node. **You can call this method to view the configuration information during debugging**.<br />
5. Optimized the service shutdown process of the disruptor thread to gracefully close threads.<br />
6. Fixed the bug of failure to report configuration changes to the node memory.<br />
7. Upgraded RocksDB to 5.14.2.<br />
8. Enhanced parameter verification of API usage by users.<br />

---

## V1.0.1

October 9, 2018

1. The RocksDB log storage gives higher priority to the sync option of RaftOptions.<br />
2. Removed the strong dependency on the log4j class library.<br />
3. Fixed some spelling errors.<br />

---

## 1.0.0

September 13, 2018

1. Implemented asynchronous log compaction and accelerated snapshot processing.<br />
2. Optimized replicator pipeline.<br />
3. Added the `onCommitted` callback to the closure of tasks. The callback is executed after log entries are submitted to the Raft group and before they are applied to the state machine.<br />
4. Provided more detailed metrics statistics.<br />
5. Supported linearizable read. For details, see the document.<br />
6. Upgraded Bolt to 1.5.1, because the replicator pipeline feature depends on Bolt 1.5.1.<br />

---

## 0.0.2

August 23, 2018

1. Added metrics statistics. For more information, see the document. <br />
2. Improved the performance of log compaction and part of internal implementations.<br />

---

## 0.0.1

1. Released the basic version. Implemented all features of Braft except for the snapshot process control.<br />

