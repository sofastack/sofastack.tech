---
title: "JRaft RheaKV user guide"
---

## Introduction to RheaKV

RheaKV is a lightweight, distributed, and embedded KV storage library, which is included in the JRaft project as a submodule.

**Features**

1. Embedded: RheaKV is embedded in applications in the form of Jar files.
2. Strong consistency: RheaKV ensures data reliability and consistency based on the multi-raft distributed consensus protocol.
3. Self-driven (not fully implemented at present): RheaKV supports automatic diagnosis, optimization, decision making, and recovery.
4. Monitorable: RheaKV automatically reports meta information and state information by node to the PD.
5. Basic APIs: get, put, and delete; cross-region APIs: scan, batch put, and distributed lock.

## Architecture design

![Architecture design](https://gw.alipayobjects.com/mdn/rms_da499f/afts/img/A*6K1mTq0z-TkAAAAAAAAAAABjARQnAQ)

## Terms and definitions

* PD: The global central master node that is responsible for scheduling the entire cluster. A PD server can manage multiple clusters, with each of them isolated by clusterId. The PD server requires separate deployment. Actually, many scenarios do not need automatic cluster management, and RheaKV does not support PD.
* Store: A physical storage node within a cluster. A store may contain one or more regions.
* Region: The minimal KV data unit. Each region can be understood as a database partition or database shard, and has a left closed and right open interval [startKey, endKey).

## Storage design

* The storage layer adopts a pluggable design and supports both MemoryDB and RocksDB currently:
   * MemoryDB is implemented based on ConcurrentSkipListMap and provides better performance. However, its independent storage capacity is restricted by the memory.
   * [RocksDB](https://github.com/facebook/rocksdb) is suitable for scenarios with large data volumes, because its storage capacity is only restricted by the disk.
* Strong data consistency is ensured. RheaKV synchronizes data to other replicas with the help of JRaft, and each data change is recorded as a Raft log entry. The log replication feature of Raft ensures all data is securely and reliably synchronized to all nodes within the same Raft group.

## Scenarios

* Lightweight state/meta information storage and cluster synchronization
* Distributed lock service

## API description

Generally, RheaKV APIs are divided into two types: synchronous APIs and asynchronous APIs. Methods whose names start with letter b (block) are synchronous blocking APIs, and the rest are asynchronous APIs. All asynchronous APIs return the same `CompletableFuture` parameter. The read method may contain another important parameter, that is readOnlySafe. When this parameter is set to true, linearizable read is supported. Read methods that do not contain this parameter provide linearizable read by default.

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

1. For String type input parameters, RheaKV provides more efficient UTF-8 String encoder/decoder APIs for internal use. If the business key is String, we recommend that you directly use the API of the String parameter.
2. If linearizable read is not required, you can set the readOnlySafe parameter to false. Then the load balancer will make on-premises calls with priority. If the required service is not available locally, the load balancer will poll a remote server to send read requests.

### multiGet

```java
CompletableFuture<Map<ByteArray, byte[]>> multiGet(final List<byte[]> keys);
CompletableFuture<Map<ByteArray, byte[]>> multiGet(final List<byte[]> keys, final boolean readOnlySafe);
Map<ByteArray, byte[]> bMultiGet(final List<byte[]> keys);
Map<ByteArray, byte[]> bMultiGet(final List<byte[]> keys, final boolean readOnlySafe);
```

1. The multiGet API supports cross-region query. RheaKV automatically works out the region of each key internally, initiates parallel calls, and then combines the query results.
2. To place the byte[] in HashMap, we use a workaround to make the key of Map in the return value as a ByteArray object, which can be considered as a wrapper of byte[]. This achieves the same effect as hashing byte[].

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

1. Both scan and iterator contain two input parameters, which are `StartKey` and `EndKey`. Their ranges are left closed and right open intervals as `[StartKey, endKey)`
2. The difference between iterator and scan is that iterator can be considered a lazy mode. When calling the `HasNext ()` method, it triggers the data request operation only when no data is available in the local buffer (bufSize is the buffer size).
3. The scan API supports cross-region scanning. RheaKV automatically works out all regions covered by the range between the `StartKey` and the `EndKey`, and initiates parallel calls. The process is slow if regions that contain large amounts of data are to be scanned. Bear in mind that you should avoid scanning too many regions at one time.
4. `startKey` can be set to null, which indicates minStartKey. `endKey` can also be set to null, which indicates maxEndKey. However, as mentioned above, you should avoid large-range queries.

### getSequence & resetSequence

```java
// Get sequence
CompletableFuture<Sequence> getSequence(final byte[] seqKey, final int step);
CompletableFuture<Sequence> getSequence(final String seqKey, final int step);
Sequence bGetSequence(final byte[] seqKey, final int step);
Sequence bGetSequence(final String seqKey, final int step);
// Reset sequence
CompletableFuture<Boolean> resetSequence(final byte[] seqKey);
CompletableFuture<Boolean> resetSequence(final String seqKey);
Boolean bResetSequence(final byte[] seqKey);
Boolean bResetSequence(final String seqKey);
```

1. You can call the `getSequence` method to get a globally monotonically increasing sequence. For example, if the step is 10, the request result will be [n, n + 10), which is a left-closed and right-open interval. Sequence data is stored separately from common key-value data. Therefore, it cannot be deleted by common APIs, and you do not have to worry about sequence data being deleted by mistake. Sequence data can be reset manually by using the resetSequence method, which is described next.
2. Note that generally we do not recommend that you use the `resetSequence` methods. They are provided to help you manually reset sequence data in unexpected events.

### put

```java
CompletableFuture<Boolean> put(final byte[] key, final byte[] value);
CompletableFuture<Boolean> put(final String key, final byte[] value);
Boolean bPut(final byte[] key, final byte[] value);
Boolean bPut(final String key, final byte[] value);
```

1. This API is provided in all KV systems. For more information about the string-type input parameters, see description of the get API.

### getAndPut

```java
CompletableFuture<byte[]> getAndPut(final byte[] key, final byte[] value);
CompletableFuture<byte[]> getAndPut(final String key, final byte[] value);
byte[] bGetAndPut(final byte[] key, final byte[] value);
byte[] bGetAndPut(final String key, final byte[] value);
```

1. This API provides the atomic semantics of "getting the old value and putting the new value." For more information about the string-type input parameters, see description of the get API.

### merge

```java
CompletableFuture<Boolean> merge(final String key, final String value);
Boolean bMerge(final String key, final String value);
```

1. Currently, the merge API only supports String-type operations.
2. This API provides an atomic merge operation for the use in scenarios that require the initial use of the get API and then the put API. The following code shows how it works.

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

1. This API supports cross-region operations. RheaKV automatically works out the regions of each key internally and initiates parallel calls.
2. Note that this operation cannot provide a transaction guarantee for the time being. It can not guarantee "all successful or all failed". However, RheaKV supports failover retries to reduce the chances of this situation occurring.

### putIfAbsent

```java
CompletableFuture<byte[]> putIfAbsent(final byte[] key, final byte[] value);
CompletableFuture<byte[]> putIfAbsent(final String key, final byte[] value);
byte[] bPutIfAbsent(final byte[] key, final byte[] value);
byte[] bPutIfAbsent(final String key, final byte[] value);
```

1. This API provides the atomic semantics: If the key does not exist, put the key. If the key already exists, return only the existing value.

### delete

```java
CompletableFuture<Boolean> delete(final byte[] key);
CompletableFuture<Boolean> delete(final String key);
Boolean bDelete(final byte[] key);
Boolean bDelete(final String key);
```

1. This API deletes the value associated with a specified key.

### deleteRange

```java
CompletableFuture<Boolean> deleteRange(final byte[] startKey, final byte[] endKey);
CompletableFuture<Boolean> deleteRange(final String startKey, final String endKey);
boolean bDeleteRange(final byte[] startKey, final byte[] endKey);
boolean bDeleteRange(final String startKey, final String endKey);
```

1. This API deletes all data of keys that fall in the range `[startKey, endKey)`. Note that this range is a left-closed and right-open interval, which means it does not include the `endKey.`
2. This API also supports cross-region deletion. RheaKV automatically works out the regions covered by the key range, and initiate parallel calls. Bear in mind that this is a dangerous operation, and you should use it with caution.

### execute

```java
CompletableFuture<Boolean> execute(final long regionId, final NodeExecutor executor);
Boolean bExecute(final long regionId, final NodeExecutor executor);
```

1. This is the only API that is irrelevant to storage. NodeExecutor can perform some operations, for example updating the cache of the current node. Calling this API ensures all nodes in the cluster execute this executor.
2. This API is not directly available in RheaKVStore. If you need to use it, force switch to `DefaultRheaKVStore.`

### DistributedLock

```java
DistributedLock<byte[]> getDistributedLock(final byte[] target, final long lease, final TimeUnit unit);
DistributedLock<byte[]> getDistributedLock(final String target, final long lease, final TimeUnit unit);
DistributedLock<byte[]> getDistributedLock(final byte[] target, final long lease, final TimeUnit unit,
                                           final ScheduledExecutorService watchdog);
DistributedLock<byte[]> getDistributedLock(final String target, final long lease, final TimeUnit unit,
                                           final ScheduledExecutorService watchdog);
```

1. This API gets a distributed lock instance. distributedLock of RheaKV implements reentrantlock, automatic lease renewal, and fencing token.

2. target: You can consider the target as the key of a distributed lock, which must be unique for different locks. However, locks are stored separately from other KV data. Therefore, you only need to ensure the uniqueness of the keys within the "lock space".

3. lease: This API must contain a lease of the lock. If watchdog is empty, the lock will be automatically released upon expiration. In other words, the lease without a watchdog is a timeout.

4. watchdog: an automatic renewal scheduler, which must be created and destroyed by the user. The framework is not responsible for the life cycle management of the watchdog. If watchdog is not empty, it will periodically (taking 2/3 of the lease as a cycle) renew the lease of the current lock until the user releases the lock (unlock).

5. Note that: distributedLock is a reentrantlock, and therefore `lock ()` and `unlock ()` must appear in pairs. For example, when `lock ()` appears twice, but `unlock ()` appears only once, you cannot unlock it.

6. For more information about the string-type input parameters, see the description of the get API.

7. `boolean tryLock(final byte[] ctx)` contains a ctx input parameter, which is used as the custom context data of the current lock requester. If it acquires the lock, other threads and processes will be able to see its ctx.

8. The following pseudocode shows how it is used in a simple case:

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

**Note**: Here is another important method `long getFencingToken()`. When a client acquires a lock, it can call this method to get the fencing token of the lock. A fencing token is simply a number that increases every time a client acquires the lock. The fencing token can be used to solve the [following problem](http://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html).

![Distributed lock](https://gw.alipayobjects.com/mdn/rms_da499f/afts/img/A*ZKq8SrSGE90AAAAAAAAAAABjARQnAQ)

Figure source: [http://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html](http://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html)

## Quick start

### Startup yaml file configuration

```yaml
##RheaKVStoreOptions
---
# To connect to a PD, you need a clusterID. The PD isolates different services by clusterId. You can skip this step in the no-PD mode.
clusterId: 1
# Each store node contains one or more Raft groups. This field is the name prefix of all Raft group. All Raft group names must follow the prefix.
# [clusterName-regionId] naming rule
clusterName: rhea_test

# PD-related option settings
placementDriverOptions:
# Set fake to true, which means the cluster will be started in the no-PD mode. In the no-PD mode, the cluster does not have the automatic management ability, and all settings are based on this initial configuration file.
  fake: true

# store node-related option settings
storeEngineOptions:
  rocksDBOptions:
# Specify whether to use synchronous flush. Default value: true. Asynchronous flush provides better performance, but it has the risk of data loss in the case of server power outage.
    sync: true
# Specify the KV data storage directory
    dbPath: rhea_db/
 # Specify the Raft log storage directory
  raftDataPath: rhea_raft/
  serverAddress:
# Specify the local host. The local host name is automatically acquired by default. You can also set it by yourself.
    ip: 127.0.0.1
# Required. It specifies the listener port provided by the storage layer for the RPC service.
    port: 8181

# Specify the list of addresses of nodes in the cluster
initialServerList: 127.0.0.1:8181,127.0.0.1:8182,127.0.0.1:8183

# Specify whether to read data only from the leader node. Default value: true. If follower nodes can ensure linearizable reads, you can set it to false. However, if a follower node is far behind the leader at the time of data synchronization,
reading data from this node will cause the request to time out. Then the RheaKV client's failover logic is triggered to read data form the leader node. This causes a rather long read request delay.
onlyLeaderRead: true

# RPC-related option settings
# rpcOptions:

# Specify the number of retry attempts after a failure
failoverRetries: 2
```

### Startup code

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

In addition to configuring startup options based on the yaml file, RheaKV also provides a series of XXXConfigured classes to help you set the configuration parameters of RheaKV. For more information about the examples, see the demo of the JRaft-example module.

## Core design

### Internal process procedure of the KV module

![Internal process procedure of the KV module](https://gw.alipayobjects.com/mdn/rms_da499f/afts/img/A*VsIgSqmCSQUAAAAAAAAAAABjARQnAQ)

#### RheaKVStore

The top-level user API. The default implementation is the DefaultRheaKVStore. RheaKVStore is a pure asynchronous implementation. Therefore, technically, RheaKV will not encounter client bottlenecks caused by blocking calls. The implementation of DefaultRheaKVStore provides many features such as request routing, request split, response combination, and failover retry.

#### PlacementDriverClient

Optional. PlacementDriverClient is a client that communicates with the PlacementDriver Server cluster. You can use it to obtain the complete information of the cluster, including but not limited to the "request route table". For no-PD scenarios, RheaKV provides a fake PD client.

#### RegionRouteTable

As a local route table caching component, RegionRouteTable will determine whether or not to refresh data from the PD server cluster based on the specific cause of the KV request failure. It also supports computing the region ID of a single key, or region IDs of multiple key lists or a key range.

#### LoadBalancer

Takes effect while implementing linearizable reads at follower nodes. Currently, only the PR policy is supported.

#### RheaKVRpcService

The RPC client wrapper for KV services. This component implements the failover logic.

#### RegionKVService

The request processing service at the KV server end. A StoreEngine contains multiple RegionKVServices. Each RegionKVService corresponds to a region, and is only responsible for processing requests within its own region.

#### MetricsRawKVStore

Blocks requests for metric measurement.

#### RaftRawKVStore

The start of the Raft process in RheaKV.

#### KVStoreStateMachine

Implements the Raft state machine.

#### RocksRawKVStore

The raw RocksDB API encapsulation. Currently, RheaKV also supports the pluggable MemoryDB storage.

### Internal process procedure of the PD module

![Internal process procedure of the PD module](https://gw.alipayobjects.com/mdn/rms_da499f/afts/img/A*38DLRJ_YScUAAAAAAAAAAABjARQnAQ)

#### Overview

The PD module is designed mainly based on the [TiKV](https://github.com/tikv/tikv) design, especially the two types of heartbeats mentioned later in this topic. However, due to the lack of application scenarios, we have not fully implemented automatic management and self-driving of this module. Currently, we have managed to implement the automatic balancing of region leaders of all nodes and the automatic split.

#### PlacementDriverClient > MetadataClient

MetadataClient is responsible for obtaining cluster meta information and the registration meta information from PD.

#### StoreEngine > HeartbeatSender

* HeartbeatSender is responsible for sending the heartbeats of the current Store node. The heartbeats contain some state information, and there are two types of heartbeats: StoreHeartbeat and RegionHeartbeat.
* PD continuously receives these two types of heartbeat messages from the RheaKV cluster. PD issues specific scheduling instructions in the heartbeat response to the region leaders, and then uses this information as the decision-making basis. In addition, PD should be able to receive additional operation instructions through the management interface for more accurate manual decision making.
* The detailed content of state information contained in these two types of heartbeats is as follows:
   * StoreHeartbeat

      ```java
         public class StoreStats implements Serializable {
            private long            storeId;
            // Total capacity (disk) of the Store node
            private long            capacity;
            // Available capacity of the Store node
            private long            available;
            // The number of regions on the Store node
            private int             regionCount;
            // The number of snapshots being sent
            private int             sendingSnapCount;
            // The number of snapshots being received
            private int             receivingSnapCount;
            // The number of regions that are applying snapshots
            private int             applyingSnapCount;
            // The startup time of the Store node (unix timestamp in milliseconds)
            private long            startTime;
            // Whether the Store node is busy
            private boolean         isBusy;
            // The actual disk usage of the Store node
            private long            usedSize;
            // The amount of data written in the current heartbeat interval
            private long            bytesWritten;
            // The amount of data read in the current heartbeat interval
            private long            bytesRead;
            // The number of keys written in the current heartbeat interval
            private long            keysWritten;
            // The number of keys read in the current heartbeat interval
            private long            keysRead;
            // The specific length of the heartbeat interval
            private TimeInterval    interval;
         }
      ```

   * RegionHeartbeat

      ```java
      public class RegionStats implements Serializable {
            private long                regionId;
            // The region leader sends heartbeats
            private Peer                leader;
            // The list of offline peers
            private List<PeerStats>     downPeers;
            // Currently unavailable followers
            private List<PeerStats>     pendingPeers;
            // The amount of data written in the current heartbeat interval
            private long                bytesWritten;
            // The amount of data read in the current heartbeat interval
            private long                bytesRead;
            // The number of keys written in the current heartbeat interval
            private long                keysWritten;
            // The number of keys read in the current heartbeat interval
            private long                keysRead;
            // The (approximate) size of storage used by the region
            private long                approximateSize;
            // The (approximate) number of keys contained in the region
            private long                approximateKeys;
            // The specific length of the heartbeat interval
            private TimeInterval        interval;
        }
      ```

#### Pipeline

The computing and storage processing pipeline for states reported through heartbeats. The processing handlers are pluggable and are flexibly scalable.

#### MetadataStore

Responsible for storage and query of meta information of the cluster. The storage is based on the embedded RheaKV.

### Client routing

#### __Sharding logic: RegionRouteTable__

![Sharding logic](https://gw.alipayobjects.com/mdn/rms_da499f/afts/img/A*NySFTZrZ8l4AAAAAAAAAAABjARQnAQ)

As you can see, the most suitable data structure to implement the logic shown in the above figure is the skip list or the binary tree (closest to the matching query).

We choose the key of the RegionRouteTable for some reason. Which should we use, the starKey or endKey of the region? Why don't we use the endKey? This is mainly determined by the region split method:

* Assume that region2 [startKey2, endKey2) splits.
* It splits into two regions, region2 [startKey2, splitKey) and region3 [splitKey, endKey2).
* Take another look at the above figure, you will understand that we only need to add one element <region3, splitKey> to the RegionRouteTable. Data of the original region2 does not need to be modified.
   * __Write operation__
      * The routing logic of single-key<span data-type="color" style="color:rgb(38, 38, 38)"><span data-type="background" style="background-color:rgb(255, 255, 255)"> write requests is very simple: query for the region based on the key, and initiate a request to the region.</span></span>
      * A batch write request, for example __ __put(List), must perform the split operation on all keys, group them, and send parallel requests to their corresponding region engines. Note that transaction guarantee cannot be provided in this case.
   * __Read operation__
      * The routing logic of single-key read requests is very simple, too: <span data-type="color" style="color:rgb(38, 38, 38)"><span data-type="background" style="background-color:rgb(255, 255, 255)">query for the region based on the key, and initiate a request to the region.</span></span>
      * <span data-type="color" style="color:rgb(38, 38, 38)"><span data-type="background" style="background-color:rgb(255, 255, 255)">In the case of a batch read request, for example </span></span>scan(startKey, endKey),<span data-type="color" style="color:rgb(38, 38, 38)"><span data-type="background" style="background-color:rgb(255, 255, 255)"> it needs to perform the split operation on all keys, group them, and send parallel requests to their corresponding region engines.</span></span>

#### Failover

__RheaKV provides asynchronous APIs to clients, which means the failover process must also be asynchronous. It increases the design difficulty and implementation complexity.__

__RheaKV must solve the following problems:__

1. Retry after asynchronous failure.
2. In the case of membership change, RheaKV must refresh the membership before retry.
3. In the case of automatic region split during the operation on multiple keys (for example range scan), RheaKV must also be able to automatically split (increase) the requests during a retry, and asynchronously combine multiple responses.
4. The previous operation may be a local call, but the retry may involve a remote call, or the other way around. These two cases must both be considered and supported.

__RheaKV divides requests into two types, requiring different failover logic:__

* __Single-key operation requests (only one key)__:
Retry depends on a callback class named FailoverClosure, the general logic of which is as follows:

   ```java
   public void run(final Status status) {
        if (status.isOk()) {
            // Success
            success((T) getData());
        } else if (this.retriesLeft > 0 &&
                (isInvalidPeer(getError()) || (this.retryOnInvalidEpoch && isInvalidEpoch(getError())))) {
            // Retry
            this.retryRunner.run(getError());
        } else {
            // Failure
            failure(getError());
        }
    }
   ```

   Two types of errors (in Table 1 and Table 2) may trigger retryRunner. Before retryRunner is run, it first refreshes the region information and group peers (route table).

---

Table 1

| NOT\_LEADER | The current node is not the leader. |
| :--- | :--- |
| NO\_REGION\_FOUND | The specified region engine is not found on the current server. |
| LEADER\_NOT\_AVAILABLE | The current region group may have not elected a leader. |

---

Table 2

| INVALID\_REGION\_MEMBERSHIP | The current region group has undergone a membership change, for example a node is added or deleted. |
| :--- | :--- |
| INVALID\_REGION\_VERSION | The current region has been split. |
| INVALID\_REGION\_EPOCH | It can either be INVALID\_REGION\_MEMBERSHIP or INVALID\_REGION\_EPOCH. |

---

* __Multi-Key operation requests (multiple keys or a key range)__

   1. For a multi-key request, split the keys first. Each region contains some of the keys, and has a separate failover process. In this case, the FailoverClosure class can only handle error types in table 1, and the processing logic is the same as that of __single-key-operation requests__.

   2. The FailoverClosure class cannot handle the three errors listed in Table 2, because region split may have occurred upon epoch changes, which means the previous regions may have doubled. Now, the failover process has to not only request for the region information from the PD, but also deal with increased requests (requests increase with the regions). Therefore, a few __failover futures__ are introduced to deal with the logic with increased requests.

   3. The main logic of the failover future of __scan(startKey, endKey)__ is as follows. You can see that the entire process is fully asynchronous.

      ```java
      @Override
       public boolean completeExceptionally(final Throwable ex) {
            if (this.retriesLeft > 0 && ApiExceptionHelper.isInvalidEpoch(ex)) {
                LOG.warn("[InvalidEpoch-Failover] cause: {}, [{}] retries left.", StackTraceUtil.stackTrace(ex),
                        this.retriesLeft);
         // Encounter invalid epoch, retry, may split requests, and then return the entire future group.
                final FutureGroup<List<T>> futureGroup = this.retryCallable.run(ex);
                CompletableFuture.allOf(futureGroup.toArray()).whenComplete((ignored, throwable) -> {
                    if (throwable == null) {
                        final List<T> all = Lists.newArrayList();
                        for (final CompletableFuture<List<T>> partOf : futureGroup.futures()) {
                            all.addAll(partOf.join());
                        }
                        // The entire future group is complete.
                        super.complete(all);
                    } else {
                        // The exception handling is complete.
                        super.completeExceptionally(throwable);
                    }
                });
                return false;
            }
            if (this.retriesLeft <= 0) {
                LOG.error("[InvalidEpoch-Failover] cause: {}, {} retries left.", StackTraceUtil.stackTrace(ex),
                        this.retriesLeft);
            }
            // 0 retry attempts remain, or the current exception type does not require retries.
            return super.completeExceptionally(ex);
      }
      ```

#### For example: a scan procedure

* __Determine the list of regions covered by the key range [startKey, endKey).__
   * RegionRouteTable#findRegionsByKeyRange(startKey, endKey)
   * RegionRouteTable is a region routing table stored in a red/black tree structure. startKey is used as the key of the red/black tree. Look for the sub-view of [startKey, endKey) and then add a floorEntry (startKey).
   * As shown in the following example, RheaKV works out that the range [startKey, endKey) crosses three regions: region1, region2, and region3 (region1 is the floor entry, and region2 and region3 are the sub-views).

![Region list](https://gw.alipayobjects.com/mdn/rms_da499f/afts/img/A*5gBCRJZjEqAAAAAAAAAAAABjARQnAQ)

* __Request split: scan -> multi-region scan__
   * region1 -> regionScan(startKey, regionEndKey1)
   * region2 -> regionScan(regionStartKey2, regionEndKey2)
   * region3 -> regionScan(regionStartKey3, endKey)

![Request split](https://gw.alipayobjects.com/mdn/rms_da499f/afts/img/A*BLVgSaFlAgoAAAAAAAAAAABjARQnAQ)

* __Encounter region split (the sign of split is region epoch change)__
   * Refresh RegionRouteTable, and get the latest route table from the PD. For example, region 2 in the following figure has been split into region 2 and region 5.
      * region2 -> regnonScan(regionStartKey2, regionEndKey2) splits requests and retries
         * region2 -> regionScan(regionStartKey2, newRegionEndKey2)
         * region5 -> regionScan(regionStartKey5, regionEndKey5)

![Region split](https://gw.alipayobjects.com/mdn/rms_da499f/afts/img/A*Cr5gT4FFs3QAAAAAAAAAAABjARQnAQ)

* __Encounter Invalid Peer (errors such as NOT\_LEADER)__
   * This is simple. It requests for the information of the latest leader of the Raft group of the current key range, and initiates calls again.

