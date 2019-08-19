---
title: "JRaft RheaKV 用户指南"
---

RheaKV 是一个轻量级的分布式的嵌入式的 KV 存储 lib， rheaKV 包含在 jraft 项目中，是 jraft 的一个子模块。

**定位与特性**

1. 嵌入式: jar 包方式嵌入到应用中
2. 强一致性: 基于 multi-raft 分布式一致性协议保证数据可靠性和一致性
3. 自驱动 （目前未完全实现）: 自诊断, 自优化, 自决策, 自恢复
4. 可监控: 基于节点自动上报到PD的元信息和状态信息
5. 基本API: get/put/delete 和跨分区 scan/batch put, distributed lock 等等

## 架构设计

![架构设计](https://gw.alipayobjects.com/mdn/rms_da499f/afts/img/A*6K1mTq0z-TkAAAAAAAAAAABjARQnAQ)

## 功能名词

* PD: 全局的中心总控节点，负责整个集群的调度，一个 PD server 可以管理多个集群，集群之间基于 clusterId 隔离；PD server 需要单独部署，当然，很多场景其实并不需要自管理，rheaKV 也支持不启用 PD
* Store: 集群中的一个物理存储节点，一个 store 包含一个或多个 region
* Region: 最小的 KV 数据单元，可理解为一个数据分区或者分片，每个 region 都有一个左闭右开的区间 [startKey, endKey)

## 存储设计

* 存储层为可插拔设计， 目前支持 MemoryDB 和 RocksDB 两种实现：
    * MemoryDB 基于 ConcurrentSkipListMap 实现，有更好的性能，但是单机存储容量受内存限制
    * [RocksDB](https://github.com/facebook/rocksdb) 在存储容量上只受磁盘限制，适合更大数据量的场景
* 数据强一致性， 依靠 jraft 来同步数据到其他副本, 每个数据变更都会落地为一条 raft 日志, 通过 raft 的日志复制功能, 将数据安全可靠地同步到同 group 的全部节点中

## 使用场景

* 轻量级的状态/元信息存储以及集群同步
* 分布式锁服务

## API 说明

整体上 rheaKV apis 分为异步和同步两类， 其中以 b （block）开头的方法均为同步阻塞方法， 其他为异步方法，异步方法均返回一个 `CompletableFuture`，对于 read method， 还有一个重要参数 readOnlySafe，为 true 时表示提供线性一致读， 不包含该参数的 read method 均为默认提供线性一致读

### get

```java
CompletableFuture<byte[]> get(final byte[] key);
CompletableFuture<byte[]> get(final String key);
CompletableFuture<byte[]> get(final byte[] key, final boolean readOnlySafe);
CompletableFuture<byte[]> get(final String key, final boolean readOnlySafe);
byte[] bGet(final byte[] key);
byte[] bGet(final String key);
byte[] bGet(final byte[] key, final boolean readOnlySafe);
byte[] bGet(final String key, final boolean readOnlySafe);
```

1. String 类型入参，rheaKV 内部提供了更高效的 Utf8String encoder/decoder， 业务 key 为 String 时， 推荐的做法是直接使用 String 参数的接口
2. 不需要线性一致读语义的场景可以将 readOnlySafe 设置为 false， 负载均衡器会优先选择本地调用，本地不能提供服务则轮询选择一台远程机器发起读请求

### multiGet

```java
CompletableFuture<Map<ByteArray, byte[]>> multiGet(final List<byte[]> keys);
CompletableFuture<Map<ByteArray, byte[]>> multiGet(final List<byte[]> keys, final boolean readOnlySafe);
Map<ByteArray, byte[]> bMultiGet(final List<byte[]> keys);
Map<ByteArray, byte[]> bMultiGet(final List<byte[]> keys, final boolean readOnlySafe);
```

1. multiGet 支持跨分区查询，rheaKV 内部会自动计算每个 key 的所属分区（region）并行发起调用， 最后合并查询结果
2. 为了可以将 byte[] 放进 HashMap，这里曲线救国，返回值中 Map 的 key 为 ByteArray 对象，是对 byte[] 的一层包装，实现了 byte[] 的 hashCode

### scan & iterator

```java
CompletableFuture<List<KVEntry>> scan(final byte[] startKey, final byte[] endKey);
CompletableFuture<List<KVEntry>> scan(final String startKey, final String endKey);
CompletableFuture<List<KVEntry>> scan(final byte[] startKey, final byte[] endKey, final boolean readOnlySafe);
CompletableFuture<List<KVEntry>> scan(final String startKey, final String endKey, final boolean readOnlySafe);
List<KVEntry> bScan(final byte[] startKey, final byte[] endKey);
List<KVEntry> bScan(final String startKey, final String endKey);
List<KVEntry> bScan(final byte[] startKey, final byte[] endKey, final boolean readOnlySafe);
List<KVEntry> bScan(final String startKey, final String endKey, final boolean readOnlySafe);

RheaIterator<KVEntry> iterator(final byte[] startKey, final byte[] endKey, final int bufSize);
RheaIterator<KVEntry> iterator(final String startKey, final String endKey, final int bufSize);
RheaIterator<KVEntry> iterator(final byte[] startKey, final byte[] endKey, final int bufSize, final boolean readOnlySafe);
RheaIterator<KVEntry> iterator(final String startKey, final String endKey, final int bufSize, final boolean readOnlySafe);
```

1. scan 和 iterator 都会包含两个入参 `startKey`， `endKey`，范围是一个左闭右开的区间： `[startKey, endKey)`
2. iterator 与 scan 的不同点在于 iterator 是懒汉模式，在调用 `hasNext()` 时如果本地缓冲区无数据 （bufSize 为缓冲区大小）才会触发请求数据操作
3. 支持跨分区扫描，rheaKV 内部会自动计算 `startKey` ~ `endKey` 所覆盖的所有分区（region），并行发起调用， 对于单个分片数据量较大的情况，扫描整个分区一定是很慢的， 一定注意避免跨过多的分区
4. `startKey` 可以为 null， 代表 minStartKey， 同理 `endKey` 也可以为 null，代表 maxEndKey，但如上一条所说，应尽量避免大范围的查询行为

### getSequence & resetSequence

```java
// 获取
CompletableFuture<Sequence> getSequence(final byte[] seqKey, final int step);
CompletableFuture<Sequence> getSequence(final String seqKey, final int step);
Sequence bGetSequence(final byte[] seqKey, final int step);
Sequence bGetSequence(final String seqKey, final int step);
// 重置
CompletableFuture<Boolean> resetSequence(final byte[] seqKey);
CompletableFuture<Boolean> resetSequence(final String seqKey);
Boolean bResetSequence(final byte[] seqKey);
Boolean bResetSequence(final String seqKey);
```

1. 通过 `getSequence` 可以获取一个全局的单调递增序列，step 作为步长， 比如一个 step 为 10 的请求结果为 [n, n + 10)， 结果是一个左闭右开的区间，对于 sequence 的存储，是与普通 key-value 数据隔离的，所以无法使用普通 api 删除之， 所以不用担心 sequence 数据被误删除， 但是也提供了手动重置 sequence 的方法，见下一条说明
2. 需要强调的是，通常是不建议使用 `resetSequence` 系列方法的，提供这个 api 只是为了用于一些意外场景的 sequence 重置

### put

```java
CompletableFuture<Boolean> put(final byte[] key, final byte[] value);
CompletableFuture<Boolean> put(final String key, final byte[] value);
Boolean bPut(final byte[] key, final byte[] value);
Boolean bPut(final String key, final byte[] value);
```

1. 这个不做过多解释了，任何 kv 系统都会提供的 api，对于 String 类型的入参，请参考 get 相关说明。

### getAndPut

```java
CompletableFuture<byte[]> getAndPut(final byte[] key, final byte[] value);
CompletableFuture<byte[]> getAndPut(final String key, final byte[] value);
byte[] bGetAndPut(final byte[] key, final byte[] value);
byte[] bGetAndPut(final String key, final byte[] value);
```

1. 提供一个原子的 'get 旧值并 put 新值' 的语义,  对于 String 类型的入参，请参考 get 相关说明。

### compareAndPut

```java
CompletableFuture<Boolean> compareAndPut(final byte[] key, final byte[] expect, final byte[] update);
CompletableFuture<Boolean> compareAndPut(final String key, final byte[] expect, final byte[] update);
Boolean bCompareAndPut(final byte[] key, final byte[] expect, final byte[] update);
Boolean bCompareAndPut(final String key, final byte[] expect, final byte[] update);
```

1. 提供一个原子的 'compare 旧值并 put 新值' 的语义, 其中 compare 语义表示 equals 而不是 ==。 对于 String 类型的入参，请参考 get 相关说明。

### merge

```java
CompletableFuture<Boolean> merge(final String key, final String value);
Boolean bMerge(final String key, final String value);
```

1. 目前只支持 String 类型的操作
2. 提供一个原子的 merge 操作, 代替某些先 get 再 put 的场景, 效果见下面代码:

```java
// Writing aa under key
db.put("key", "aa");
// Writing bb under key
db.merge("key", "bb");
    
assertThat(db.get("key")).isEqualTo("aa,bb");
```

### batch put

```java
CompletableFuture<Boolean> put(final List<KVEntry> entries);
boolean bPut(final List<KVEntry> entries);
```

1. 支持跨分区操作的一个 batch put, rheakv 内部会自动计算每个 key 的所属分区并行发起调用
2. 需要注意的是， 这个操作暂时无法提供事务保证，无法承诺 ‘要么全部成功要么全部失败’，不过由于 rheaKV 内部是支持 failover 自动重试的， 可以一定程度上减少上述情况的发生

### putIfAbsent

```java
CompletableFuture<byte[]> putIfAbsent(final byte[] key, final byte[] value);
CompletableFuture<byte[]> putIfAbsent(final String key, final byte[] value);
byte[] bPutIfAbsent(final byte[] key, final byte[] value);
byte[] bPutIfAbsent(final String key, final byte[] value);
```

1. 提供一种原子语义： 如果该 key 不存在则 put 如果该 key 已经存在， 那么只返回这个已存在的值

### delete

```java
CompletableFuture<Boolean> delete(final byte[] key);
CompletableFuture<Boolean> delete(final String key);
Boolean bDelete(final byte[] key);
Boolean bDelete(final String key);
```

1. 删除指定 key 关联的值

### deleteRange

```java
CompletableFuture<Boolean> deleteRange(final byte[] startKey, final byte[] endKey);
CompletableFuture<Boolean> deleteRange(final String startKey, final String endKey);
boolean bDeleteRange(final byte[] startKey, final byte[] endKey);
boolean bDeleteRange(final String startKey, final String endKey);
```

1. 移除 `[startKey, endKey)` 范围内所有的数据， 注意 key的 范围是一个左闭右开的区间，即不包含`endKey`
2. 同样支持跨分区删除， rheaKV 内部会自动计算这个 key 区间的所覆盖的分区然后并行发起调用， 同样需要强调，这是个较危险的操作，请慎重使用

### execute

```java
CompletableFuture<Boolean> execute(final long regionId, final NodeExecutor executor);
Boolean bExecute(final long regionId, final NodeExecutor executor);
```

1. 唯一一个跟存储无关的接口, NodeExecutor 可以执行一些操作（比如更新当前节点的缓存），调用这个 api 能保证最终集群中所有节点都会执行这个 executor
2. 这个 api 没有直接在 RheaKVStore 中开放，确实有类似使用场景的需要强转 `DefaultRheaKVStore`

### DistributedLock

```java
DistributedLock<byte[]> getDistributedLock(final byte[] target, final long lease, final TimeUnit unit);
DistributedLock<byte[]> getDistributedLock(final String target, final long lease, final TimeUnit unit);
DistributedLock<byte[]> getDistributedLock(final byte[] target, final long lease, final TimeUnit unit,
                                           final ScheduledExecutorService watchdog);
DistributedLock<byte[]> getDistributedLock(final String target, final long lease, final TimeUnit unit,
                                           final ScheduledExecutorService watchdog);
```

1. 获取一个分布式锁实例，rheaKV 的 distributedLock 实现了: 可重入锁、自动续租以及 fencing token
2. target：可以为理解为分布式锁的 key, 不同锁的 key 不能重复，但是锁的存储空间是与其他 kv 数据隔离的，所以只需保证 key 在 '锁空间' 内的唯一性即可
3. lease：必须包含一个锁的租约（lease）时间，在锁到期之前，如果 watchdog 为空，那么锁会被自动释放，即没有 watchdog 配合的 lease，就是 timeout 的意思
4. watchdog：一个自动续租的调度器，需要用户自行创建并销毁，框架内部不负责该调度器的生命周期管理，如果 watchdog 不为空，会定期（lease 的 2/3 时间为周期）主动为当前的锁不断进行续租，直到用户主动释放锁（unlock）
5. 还有一个需要强调的是：因为 distributedLock 是可重入锁，所以 `lock()` 与 `unlock()` 必须成对出现，比如 `lock()` 2 次却只 `unlock()` 1 次是无法释放锁成功的
6. String 类型入参: 见 get 相关说明
7. 其中 `boolean tryLock(final byte[] ctx)` 包含一个 ctx 入参， 作为当前的锁请求者的用户自定义上下文数据，如果它成功获取到锁，其他线程、进程也可以看得到它的 ctx
8. 一个简单的使用例子见下面伪代码:

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

**Note**: 还有一个重要的方法 `long getFencingToken()`，当成功上锁后，可以通过该接口获取当前的 fencing token， 这是一个单调递增的数字，也就是说它的值大小可以代表锁拥有者们先来后到的顺序，可以用这个 fencing token 解决下图[这个问题](http://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html)：

![分布式锁](https://gw.alipayobjects.com/mdn/rms_da499f/afts/img/A*ZKq8SrSGE90AAAAAAAAAAABjARQnAQ)

上图来自 [http://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html](http://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html)

## 快速开始

### 启动yaml配置

```yaml
##RheaKVStoreOptions
---
# 与PD连接需要一个 clusterId, PD 依靠 clusterId 来隔离不同业务, 无 PD 模式不需要配置
clusterId: 1
# 每个 store 节点包含一个或多个 raft-group 复制组, 这个字段是所有复制组的名称前缀, 所有的 raft-group name 遵循
# [clusterName-regionId]的命名规则
clusterName: rhea_test

# PD 相关选项设置
placementDriverOptions:
# fake==true 表示在无 PD 模式下启动, 无 PD 模式将失去"自管理"能力, 所有设置都基于当前这个初始的配置文件
  fake: true

# store存储节点的相关选项设置
storeEngineOptions:
  rocksDBOptions:
# 是否同步刷盘, 默认为 true, 异步刷盘性能更好, 但是在机器掉电时有丢数据风险
    sync: true
# kv数据存储目录
    dbPath: rhea_db/
  # raft log存储目录
  raftDataPath: rhea_raft/
  serverAddress:
# 本机地址, 默认自动获取本机host name, 也可以自己设置
    ip: 127.0.0.1
# 端口, 这个是必须配置的选项, 存储层提供rpc服务的监听端口
    port: 8181

# 集群列表中所有节点的地址列表
initialServerList: 127.0.0.1:8181,127.0.0.1:8182,127.0.0.1:8183

# 是否只从 leader 节点读取数据, 默认为true, 当然从follower节点读也能保证线性一致读, 但是如果一个 follower 节点在同步数据时落后较多的情况下
# 将导致读请求超时, 从而导致 rheaKV 客户端 failover 逻辑启动重新从 leader 节点上尝试读取, 最终结果就是读请求延时较长
onlyLeaderRead: true

# RPC组件相关选项设置
# rpcOptions:

# 失败重试次数
failoverRetries: 2
```

### 启动代码

```java
final ObjectMapper mapper = new ObjectMapper(new YAMLFactory());
final RheaKVStoreOptions opts = mapper.readValue(new File("rheakv_conf"), RheaKVStoreOptions.class);
final RheaKVStore rheaKVStore = new DefaultRheaKVStore();
if (rheaKVStore.init(opts)) {
    rheaKVStore.bPut("hello", "hello world!!!")
    byte[] bytesVal = rheaKVStore.get("hello");
    System.out.println(new String(bytesVal);
    // ...
    // Have fun !!!
}
```

除了基于 yaml 配置启动，rheaKV 也提供了一系列 XXXConfigured 类来方便设置 rheaKV 的配置参数，具体 example 可以参考 jraft-example 模块中的 demo

## 核心设计

### KV模块内部处理流程

![KV 模块内部处理流程](https://gw.alipayobjects.com/mdn/rms_da499f/afts/img/A*VsIgSqmCSQUAAAAAAAAAAABjARQnAQ)

#### RheaKVStore

最上层 User API，默认实现为 DefaultRheaKVStore， RheaKVStore 为纯异步实现，所以通常阻塞调用导致的客户端出现瓶颈，理论上不会在RheaKV上遭遇，DefaultRheaKVStore 实现了包括请求路由、request 分裂、response 聚合以及失败重试等功能

#### PlacementDriverClient

非必须，作为与 PlacementDriver Server 集群沟通的客户端，可以通过它获取集群完整信息，包括但不仅限于"请求路由表"，对于无 PD 场景， rheaKV 提供一个 fake pd client

#### RegionRouteTable

作为一个本地路由表缓存组件，RegionRouteTable 会根据 kv 请求的具体失败原因来决策是否从 PD Server 集群刷新数据，还提供对单个 key、多个 key 列表以及一个key range进行计算，返回对应的分区 ID

#### LoadBalancer

在提供 follower 线性一致读的配置下有效，目前仅支持RR策略

#### RheaKVRpcService

针对 kv 服务的 rpc client包装，实现了 failover 逻辑

#### RegionKVService

KV server 端的请求处理服务，一个 StoreEngine 中包含很多 RegionKVService, 每个 RegionKVService 对应一个region，只处理自己 region 范围内的请求

#### MetricsRawKVStore

拦截请求做指标度量

#### RaftRawKVStore

RheaKV 的 raft 入口，从这里开始 raft 流程

#### KVStoreStateMachine

实现了 raft 状态机

#### RocksRawKVStore

原始的 rocksdb api 封装， 目前 rheaKV 也支持可插拔的 memoryDB 存储实现

### PD 模块内部处理流程

![PD 模块内部处理流程](https://gw.alipayobjects.com/mdn/rms_da499f/afts/img/A*38DLRJ_YScUAAAAAAAAAAABjARQnAQ)

#### 概述

PD 模块主要参考 [tikv](https://github.com/tikv/tikv) 的设计理念，尤其是下面会提到的两类 Heartbeat 内容，不过由于目前这部分的应用场景缺失，并没有完全实现自管理自驱动，目前只实现了自动平衡所有节点的分区 leader 以及自动分裂

#### PlacementDriverClient -> MetadataClient

MetadataClient 负责从 PD 获取集群元信息以及注册元信息

#### StoreEngine -> HeartbeatSender

* HeartbeatSender 负责发送当前存储节点的心跳，心跳中包含一些状态信息，心跳一共分为两类：StoreHeartbeat 和 RegionHeartbeat
* PD 不断接受 rheaKV 集群这两类心跳消息，PD 在对 region leader 的心跳回复里面包含了具体调度指令，再以这些信息作为决策依据。除此之外，PD 还应该可以通过管理接口接收额外的运维指令，用来人为执行更准确的决策
* 两类心跳包含的状态信息详细内容如下：

**StoreHeartbeat**

```java
   public class StoreStats implements Serializable {
       private long            storeId;
       // Store总容量(磁盘)
       private long            capacity;
       // Store可用容量
       private long            available;
       // Store承载的region数量
       private int             regionCount;
       // 正在发送的snapshot数量
       private int             sendingSnapCount;
       // 正在接收的snapshot数量
       private int             receivingSnapCount;
       // 有多少region正在apply snapshot
       private int             applyingSnapCount;
       // Store的启动时间 (unix timestamp in milliseconds)
       private long            startTime;
       // Store是否忙碌
       private boolean         isBusy;
       // 被Store实际使用的磁盘大小
       private long            usedSize;
       // 当前一个周期内的写入数据量
       private long            bytesWritten;
       // 当前一个周期内的读取数据量
       private long            bytesRead;
       // 当前一个周期内写入的key的个数
       private long            keysWritten;
       // 当前一个周期内读取的key的个数
       private long            keysRead;
       // 一个周期的具体时间长度
       private TimeInterval    interval;
   }
```

**RegionHeartbeat**

```java
        public class RegionStats implements Serializable {
            private long                regionId;
            // Region的leader位置, 负责发送心跳
            private Peer                leader;
            // 掉线的peer列表
            private List<PeerStats>     downPeers;
            // 暂时还不能work的follower
            private List<PeerStats>     pendingPeers;
            // 当前一个周期内的写入数据量
            private long                bytesWritten;
            // 当前一个周期内的读取数据量
            private long                bytesRead;
            // 当前一个周期内写入的key的个数
            private long                keysWritten;
            // 当前一个周期内读取的key的个数
            private long                keysRead;
            // Region占用空间的大小(近似值即可)
            private long                approximateSize;
            // Region包含key的个数(近似值即可)
            private long                approximateKeys;
            // 一个周期的具体时间长度
            private TimeInterval        interval;
        }
```

#### Pipeline

是针对心跳上报 Stats 的计算以及存储处理流水线，处理单元 (Handler) 可插拔，非常方便扩展

#### MetadataStore

负责集群元信息存储以及查询，存储方面基于内嵌的 RheaKV

### 客户端路由

#### __分片逻辑：RegionRouteTable__

![分片逻辑](https://gw.alipayobjects.com/mdn/rms_da499f/afts/img/A*NySFTZrZ8l4AAAAAAAAAAABjARQnAQ)

可以看到，实现上图最适合的数据结构便是跳表或者二叉树（最接近匹配项查询）

选择 region 的 startKey 还是 endKey 作为 RegionRouteTable 的 key 也是有讲究的，比如为什么没有使用endKey? 这主要取决于 region split 的方式：

* 假设 id 为 2 的 region2 [startKey2, endKey2) 分裂
* 它分裂后的两个 region 分别为 id 继续为 2 的 region2 [startKey2, splitKey) 和 id 为 3 的 region3 [splitKey, endKey2)
* 可以再看上图会发现，此时只需要再往 regionRouteTable 添加一个元素 `<region3, splitKey>` 即可，原来region2 对应的数据是不需要修改的
    * __Write-Operation__
        * 单 key 写请求路由逻辑很简单，根据 key 查询对应的 region，再对该 region 发起请求即可。
        * 如果是一个批量操作写请求，比如 `put(List)`，那么会对所有 keys 进行 split，分组后再并行分别请求所属的regionEngine，要注意的是此时无法提供事务保证。
    * __Read-Operation__
        * 单 key 读请求路由逻辑也很简单，根据 key 查询对应的 region，再对该 region 发起请求即可。
        * 如果是一个批量读请求，比如 scan(startKey, endKey)，那么会对所有 keys 进行 split，分组后并行再分别请求所属的 regionEngine。

#### Failover

__RheaKV 对用户端提供的是异步 api, 这就要求 failover 的处理流程必须也得是异步, 这对设计增加了一些难度，实现会绕一点__

__以下问题是RheaKV必须要解决的:__

1. 异步失败 retry
2. 调用时遇到 membership change，需要刷新 membership 重试
3. 一次操作多个 key (比如range scan) 时遭遇 region 自动 split，需要在 retry 时也能自动分裂(放大)请求，并异步合并多个响应结果
4. 前一次操作可能是本地调用，retry 时却可能需要发起远程调用，也可能是反过来的情况，两种情况都需要兼容

__RheaKV 可以划分为两种类型的请求，两种类型需要不同的 failover 逻辑：__

* __Single-Key-Operation (只操作一个 key)__
    Retry 依赖一个叫做 FailoverClosure 的 callback类，大体逻辑如下:

```java
    public void run(final Status status) {
        if (status.isOk()) {
            // 成功
            success((T) getData());
        } else if (this.retriesLeft > 0 &&
                (isInvalidPeer(getError()) || (this.retryOnInvalidEpoch && isInvalidEpoch(getError())))) {
            // 重试
            this.retryRunner.run(getError());
        } else {
            // 失败
            failure(getError());
        }
    }
```

其中有以下两大类错误(表①、表②)会触发 retryRunner 运行，运行之前会先刷新 region 信息以及 group peers(路由表)

---

表①

| NOT\_LEADER | 当前节点不是Leader |
| :--- | :--- |
| NO\_REGION\_FOUND | 当前机器未找到指定的RegionEngine |
| LEADER\_NOT\_AVAILABLE | 当前的Region Group可能还未选举出Leader |

---

表②

| INVALID\_REGION\_MEMBERSHIP | 当前Region Group已经发生了成员变化, 比如新增或删除了节点 |
| :--- | :--- |
| INVALID\_REGION\_VERSION | 当前Region分裂(split)了 |
| INVALID\_REGION\_EPOCH | 表示可能为INVALID\_REGION\_MEMBERSHIP或INVALID\_REGION\_EPOCH任意一个 |

---

**Multi-Keys-Operation (操作多个key或一个key区间)**

1. 对于多个 key 的请求，还要先对 keys 做 split，每个 region 包含一部分数量的 keys，对于每个 region 有单独 failover 处理，此时 FailoverClosure 类只能处理表①中的作为类型，处理逻辑同 __Single-Key-Operation__
2. 对于表②中三个 region epoch 发生变更的错误，FailoverClosure 无法处理，因为在epoch发生变化时，很有可能是发生了 region split，对于先前定位的 region，分裂成了 2 个，此时不光需要重新从 PD 刷新region 信息，failover 还要处理请求的放大(多个 region 就会产生多个请求)，所以新增了几类 __FailoverFuture__ 来处理这种请求放大的逻辑
3. 其中 __scan(startKey, endKey)__ 的 FailoverFuture 主要逻辑如下图, 可以看到整个流程是完全异步的

```java
        @Override
        public boolean completeExceptionally(final Throwable ex) {
            if (this.retriesLeft > 0 && ApiExceptionHelper.isInvalidEpoch(ex)) {
                LOG.warn("[InvalidEpoch-Failover] cause: {}, [{}] retries left.", StackTraceUtil.stackTrace(ex),
                        this.retriesLeft);
                // 遇到 invalid epoch，重试，可能会请求分裂，所以返回一个 FutureGroup
                final FutureGroup<List<T>> futureGroup = this.retryCallable.run(ex);
                CompletableFuture.allOf(futureGroup.toArray()).whenComplete((ignored, throwable) -> {
                    if (throwable == null) {
                        final List<T> all = Lists.newArrayList();
                        for (final CompletableFuture<List<T>> partOf : futureGroup.futures()) {
                            all.addAll(partOf.join());
                        }
                        // 整个 group 均已完成
                        super.complete(all);
                    } else {
                        // 异常完成
                        super.completeExceptionally(throwable);
                    }
                });
                return false;
            }
            if (this.retriesLeft <= 0) {
                LOG.error("[InvalidEpoch-Failover] cause: {}, {} retries left.", StackTraceUtil.stackTrace(ex),
                        this.retriesLeft);
            }
            // 剩余重试为 0，或者当前的异常类型不需要重试
            return super.completeExceptionally(ex);
        }
```

#### 举例: 一次 scan 的流程

* __确定 key 区间 [startKey, endKey) 覆盖的 region list__
    * RegionRouteTable#findRegionsByKeyRange(startKey, endKey)
    * RegionRouteTable 是一个红黑树结构存储的 region 路由表，startKey 为作为红黑树的key，只要查找 [startKey, endKey) 的子视图再加上一个 floorEntry(startKey) 即可
    * 如下图例子，计算得出 [startKey, endKey) 横跨 region1, region2, region3 一共 3 个分区(region1 为 floor entry, region2 和 region3 为子视图部分)

![region list](https://gw.alipayobjects.com/mdn/rms_da499f/afts/img/A*5gBCRJZjEqAAAAAAAAAAAABjARQnAQ)

* __请求分裂: scan -> multi-region scan__
    * region1 -> regionScan(startKey, regionEndKey1)
    * region2 -> regionScan(regionStartKey2, regionEndKey2)
    * region3 -> regionScan(regionStartKey3, endKey)

![请求分裂](https://gw.alipayobjects.com/mdn/rms_da499f/afts/img/A*BLVgSaFlAgoAAAAAAAAAAABjARQnAQ)

* __遭遇 region split (分裂的标志是 region epoch 发生变化)__
    * 刷新 RegionRouteTable，需要从 PD 获取最新的路由表，比如当前示例中 region2 分裂变成了 region2 + region5
        * region2 -> regnonScan(regionStartKey2, regionEndKey2)  请求分裂并重试
            * region2 -> regionScan(regionStartKey2, newRegionEndKey2)
            * region5 -> regionScan(regionStartKey5, regionEndKey5)

![region split](https://gw.alipayobjects.com/mdn/rms_da499f/afts/img/A*Cr5gT4FFs3QAAAAAAAAAAABjARQnAQ)

* __遭遇 Invalid Peer (NOT\_LEADER 等错误)__
    * 这个就很简单了, 重新获取当前 key 区间所属的 raft-group 的最新 leader，再次发起调用即可

