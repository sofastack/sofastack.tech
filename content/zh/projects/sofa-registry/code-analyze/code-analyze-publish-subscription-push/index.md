---
title: "源码解析｜发布订阅推送"
author: "范明柯"
authorlink: "https://github.com/MingkeVan"
description: "源码解析｜发布订阅推送"
categories: "SOFAStack"
tags: [“源码解析”]
date: 2022-05-09T15:00:00+08:00
---

## 前言

> 此次源码解析均在 sofa-registry:6.1.4-SNAPSHOT 版本下分析

## 一、架构流程图

![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*pfTcQpVwPHAAAAAAAAAAAAAAARQnAQ)

## 二、订阅流程

以客户端首次订阅，且服务发布方已注册的场景为例，订阅流程主要分为三步，

* 客户端发起订阅
* session server 处理订阅任务，从缓存（或 data server）拉取地址列表
* 向客户端推送地址列表

### 2.1 客户端发起订阅

客户端发起订阅的方式是异步的，首先将订阅注册的任务添加到客户端的内存队列中。

![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*M5N_QqId5wsAAAAAAAAAAAAAARQnAQ)

### 2.2 session server 处理订阅请求

![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*OaN_T4ycqbIAAAAAAAAAAAAAARQnAQ)

* session server 接收到订阅注册任务后，主要是通过 SessionRegistry#regsiter 方法处理的，判断当前是服务消费方，添加到订阅者缓存中；

```java
case SUBSCRIBER:
     Subscriber subscriber = (Subscriber) storeData;

     //
     if (!sessionInterests.add(subscriber)) {
       break;
     }

     sessionRegistryStrategy.afterSubscriberRegister(subscriber);
     break;
```

* 触发 RegProcessor#fireOnReg 方法，将订阅者放入 buffer 中，参考源码如下：

```java
boolean fireOnReg(Subscriber subscriber) {
  final String dataInfoId = subscriber.getDataInfoId();
  // 从若干个BufferWorker数组找到其中一个
  BufferWorker worker = indexOf(subscriber.getDataInfoId());
  // 将dataInfoId和subscriber存到BufferWorker线程中的subMap中
  // subMap的key为dataInfoId，value为SubBuffer
  SubBuffer buffer = worker.subMap.computeIfAbsent(dataInfoId, k -> new SubBuffer());
  return buffer.add(subscriber);
}
```

### 2.3 session server 拉取地址列表

![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*4pHlS7APsx8AAAAAAAAAAAAAARQnAQ)

BufferWorker 线程循环处理 map 缓存中的订阅注册任务，处理流程如下：

* 从 worker 的 subMap 取出所有 dataInfoId 和订阅者列表，并对每个 dataInfoId 分别处理
* 通过 RegProcessor#processBuffer 方法处理每个 dataInfoId 和对应的订阅者

```java
int processBuffer(Ref ref, int hitSize) {
  List<Subscriber> subscribers = Lists.newArrayListWithCapacity(hitSize);
  for (Map.Entry<String, Subscriber> e : ref.subscriberMap.entrySet()) {
    final Subscriber sub = e.getValue();
    // 若订阅者已经推送过，直接忽略
    if (!sub.hasPushed()) {
      subscribers.add(sub);
    }
    // 这里因为subscriberMap是引用，没有锁保护，所以sub可能已经被新的subscriber替换掉
    // try to remove the sub, but subs maybe changes
    ref.subscriberMap.remove(sub.getRegisterId(), sub);
  }
  if (!subscribers.isEmpty()) {
    // 从缓存中获取dataInfoId的地址列表，并推送给subscribers
    regHandler.onReg(ref.dataInfoId, subscribers);
  }
  // 返回推送地址列表的订阅者数量
  return subscribers.size();
}
```

* 通过 FirePushService#getDatum 方法从缓存中获取地址列表。该缓存使用 Guava Cache 的 LoadingCache，当缓存中没有 dataInfoId 的地址列表时，会自动从 data server 获取地址列表，并放在缓存中。

* 通过 FirePushService#processPush 方法将地址列表推送给所有订阅者
  * 首先通过 firePush 方法将 PushTas k 放入 buffer
  * 等待 PushTaskBuffer.BufferWorker 线程异步处理任务

### 2.4 session server 推送地址列表

![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*thtxR5v-o5cAAAAAAAAAAAAAARQnAQ)

* PushProcessor 初始化时默认创建 4 个 PushTaskBuffer.BufferWorker 线程；
* BufferWorker 线程循环执行 watchBuffer 方法，将 worker 中缓存的过期任务删除后进行处理，具体逻辑见下边源码；

```java
int watchBuffer(BufferWorker worker) {
  int bufferedSize = worker.bufferMap.size();
  if (bufferedSize >= MAX_BUFFERED_SIZE) {
    LOGGER.warn("arrived max buffered size: buffered={}", bufferedSize);
  }
  // 获取推送任务
  List<PushTask> pending = worker.transferAndMerge();
  int count = 0;
  for (PushTask task : pending) {
    // 将任务放进线程池执行
    if (task.commit()) {
      count++;
    }
  }
  if (pending.size() > 0 || count > 0) {
    LOGGER.info("buffers={},commits={}", pending.size(), count);
  }
  return count;
}
```

* 推送地址列表给客户端。

## 三、发布流程

服务发布流程主要分为下面 5 步：

* 客户端服务注册
* session server 处理服务发布请求
* data server 保存服务注册数据，并生成数据变更通知
* session server 接收数据变更通知，拉取数据
* session server 推送地址列表

### 3.1 服务注册

客户端进行发布注册，与上面客户端订阅的逻辑一样，都是先将请求放在队列里，等待异步处理，此处不再赘述。

### 3.2 session server 处理服务发布请求

![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*mwdARIc3Xd4AAAAAAAAAAAAAARQnAQ)

* SessionRegistry#register 方法判断请求来自服务发布方；
* 将服务发布方放进 SessionDataStore 缓存中；
* 由于服务发布的数据最终要写入 data server，这里首先通过 DataNodeService#register 方法放到阻塞队列中异步处理；

具体代码逻辑如下：

```java
case PUBLISHER:
    Publisher publisher = (Publisher) storeData;
    publisher.setSessionProcessId(ServerEnv.PROCESS_ID);
    
    // 放入缓存
    if (!sessionDataStore.add(publisher)) {
      break;
    }
    
    // 存入data服务器中
    // All write operations to DataServer (pub/unPub/clientoff/renew/snapshot)
    // are handed over to WriteDataAcceptor
    writeDataAcceptor.accept(
        new PublisherWriteDataRequest(
            publisher, WriteDataRequest.WriteDataRequestType.PUBLISHER));

    sessionRegistryStrategy.afterPublisherRegister(publisher);
    break;
```

### 3.3 data server 保存服务注册数据

#### 3.3.1 存储 publisher

![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*WJTkSqP3vTQAAAAAAAAAAAAAARQnAQ)

* 通过 DataNodeServiceImpl.Worker#run 循环处理队列中的请求

```java
public void run() {
  for (; ; ) {
    try {
        // 从队列中取出第一个
      final Req firstReq = queue.poll(200, TimeUnit.MILLISECONDS);
      if (firstReq != null) {
        // 批量获取请求,默认最多取100个
        Map<Integer, LinkedList<Object>> reqs =
            drainReq(queue, sessionServerConfig.getDataNodeMaxBatchSize());
        // send by order, firstReq.slotId is the first one
        LinkedList<Object> firstBatch = reqs.remove(firstReq.slotId);
        if (firstBatch == null) {
          firstBatch = Lists.newLinkedList();
        }
        firstBatch.addFirst(firstReq.req);
        request(firstReq.slotId, firstBatch);
        for (Map.Entry<Integer, LinkedList<Object>> batch : reqs.entrySet()) {
          // 批量发起请求
          request(batch.getKey(), batch.getValue());
        }
      }
      // check the retry
      // 重试逻辑
      if (!retryBatches.isEmpty()) {
        final Iterator<RetryBatch> it = retryBatches.iterator();
        List<RetryBatch> retries = Lists.newArrayList();
        while (it.hasNext()) {
          RetryBatch batch = it.next();
          it.remove();
          if (!DataNodeServiceImpl.this.request(batch.batch)) {
            retries.add(batch);
          }
        }
        for (RetryBatch retry : retries) {
          retry(retry);
        }
      }
    } catch (Throwable e) {
      LOGGER.safeError("failed to request batch", e);
    }
  }
}
```

* data server 的 BatchPutDataHandler 收到请求
* tryAddPublisher：当 registerId 对应服务没有发布过或传入发布方 version 最新时，存入 LocalDatumStorage；仅当新增发布方或已有发布方地址列表发生改变时，返回 true，并生成 DataChange 事件；

```java
private boolean tryAddPublisher(Publisher publisher) {
  PublisherEnvelope exist = pubMap.get(publisher.getRegisterId());
  final RegisterVersion registerVersion = publisher.registerVersion();
  if (exist == null) {
    PublisherEnvelope envelope = PublisherEnvelope.of(publisher);
    pubMap.put(publisher.getRegisterId(), envelope);
    // 当服务发布时，添加成功
    return envelope.isPub();
  }
  // 版本号没有变化，添加失败
  if (exist.registerVersion.equals(registerVersion)) {
    ...
    return false;
  }
  // 版本号是旧的，直接忽略，添加失败
  if (!exist.registerVersion.orderThan(registerVersion)) {
    ...
    return false;
  }
  PublisherEnvelope envelope = PublisherEnvelope.of(publisher);
  // 存储
  pubMap.put(publisher.getRegisterId(), envelope);

  if (exist.publisher == null) {
    // publisher is null after client_off
    ...
    // 首次发布，添加成功
    return envelope.isPub();
  }
  try {
    // 判断地址列表是否变化，未变化返回false
    boolean same =
        exist.publisher.getDataList() == null
            ? publisher.getDataList() == null
            : exist.publisher.getDataList().equals(publisher.getDataList());
.    
    ...
    return !same;
  } catch (Throwable t) {
    ... 
    return true;
  }
}
```

* 存储成功，产生 DataChange 事件，

```java
public Object doHandle(Channel channel, BatchRequest request) {
  final ProcessId sessionProcessId = request.getSessionProcessId();
  processSessionProcessId(channel, sessionProcessId);

  final SlotAccess slotAccess =
      checkAccess(request.getSlotId(), request.getSlotTableEpoch(), request.getSlotLeaderEpoch());
  if (slotAccess.isMoved() || slotAccess.isMisMatch()) {
    // only reject the when moved
    return SlotAccessGenericResponse.failedResponse(slotAccess);
  }
  final String slotIdStr = String.valueOf(request.getSlotId());
  final Set<String> changeDataInfoIds = Sets.newHashSetWithExpectedSize(128);
  try {
    for (Object req : request.getRequest()) {
      // contains publisher and unPublisher
      if (req instanceof Publisher) {
        Publisher publisher = (Publisher) req;
        DatumVersion updatedVersion = doHandle(publisher);
        if (updatedVersion != null) {
          // // 存储成功就加入列表，用于生成DataChange事件
          changeDataInfoIds.add(publisher.getDataInfoId());
        }
.       ...
      }
      ...
    }
  } finally {
    // if has exception, try to notify the req which was handled
    if (!changeDataInfoIds.isEmpty()) {
      // 生成DataChange事件
      dataChangeEventCenter.onChange(
          changeDataInfoIds, DataChangeType.PUT, dataServerConfig.getLocalDataCenter());
    }
  }
  
private DatumVersion doHandle(Publisher publisher) {
  publisher = Publisher.internPublisher(publisher);
  ...
  // 存储服务发布方地址
.  
  return localDatumStorage.put(publisher);
}
```

* DataChangeEventCenter#onChange 方法将 dataInfoId 列表加到缓存 map 中，每个数据中心对应一个 dataInfoId 列表，等待异步处理。

#### 3.3.2 生成数据变更通知

![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*cvF6Qr0eLg8AAAAAAAAAAAAAARQnAQ)

* dataServer 启动时创建了一个 DataChangeEventCenter.ChangeMerger 线程，用于处理数据变更通知的缓存；
* 获取服务发布方的最新版本号
* 生成变更通知交给线程池执行，发送给 session server

```java
boolean handleChanges(Map<String, List<Channel>> channelsMap) {
  // first clean the event
  final int maxItems = dataServerConfig.getNotifyMaxItems();
  final List<DataChangeEvent> events = transferChangeEvent(maxItems);
  if (events.isEmpty()) {
    return false;
  }
  if (channelsMap.isEmpty()) {
    LOGGER.error("session conn is empty when change");
    return false;
  }
  // for循环遍历处理所有events
  for (DataChangeEvent event : events) {
    final Map<String, DatumVersion> changes =
        Maps.newHashMapWithExpectedSize(event.getDataInfoIds().size());
    final String dataCenter = event.getDataCenter();
    for (String dataInfoId : event.getDataInfoIds()) {
      // 获取最新版本号
      DatumVersion datumVersion = datumCache.getVersion(dataCenter, dataInfoId);
      if (datumVersion != null) {
        changes.put(dataInfoId, datumVersion);
      }
    }
    if (changes.isEmpty()) {
      continue;
    }
    for (Map.Entry<String, DatumVersion> entry : changes.entrySet()) {
      LOGGER.info("datum change notify: {},{}", entry.getKey(), entry.getValue());
    }
    for (Map.Entry<String, List<Channel>> entry : channelsMap.entrySet()) {
      // 随机获取一个session server 推送数据变更通知
      Channel channel = CollectionUtils.getRandom(entry.getValue());
      try {
        // 放入线程池中执行
        notifyExecutor.execute(
            channel.getRemoteAddress(),
            new ChangeNotifier(channel, event.getDataCenter(), changes, event.getTraceTimes()));
        CHANGE_COMMIT_COUNTER.inc();
      } catch (FastRejectedExecutionException e) {
        CHANGE_SKIP_COUNTER.inc();
        LOGGER.warn("commit notify full, {}, {}, {}", channel, changes.size(), e.getMessage());
      } catch (Throwable e) {
        CHANGE_SKIP_COUNTER.inc();
        LOGGER.error("commit notify failed, {}, {}", channel, changes.size(), e);
      }
    }
  }
  return true;
}
```

* session server 收到数据变更通知，由 DataChangeRequestHandler#doHandle 方法处理；

```java
public Object doHandle(Channel channel, DataChangeRequest dataChangeRequest) {
  if (!pushSwitchService.canPush()) {
    return null;
  }
  final String dataNode = RemotingHelper.getRemoteHostAddress(channel);
  final String dataCenter = dataChangeRequest.getDataCenter();
  final long changeTimestamp = System.currentTimeMillis();
  for (Map.Entry<String, DatumVersion> e : dataChangeRequest.getDataInfoIds().entrySet()) {
    final String dataInfoId = e.getKey();
    final DatumVersion version = e.getValue();
    // 判断版本号，忽略旧版本数据
    Interests.InterestVersionCheck check =
        sessionInterests.checkInterestVersion(dataCenter, dataInfoId, version.getValue());
    if (!check.interested) {
      if (check != Interests.InterestVersionCheck.NoSub) {
        // log exclude NoSub
        LOGGER.info("[SkipChange]{},{}, ver={}, {}", dataInfoId, dataCenter, version, check);
      }
      continue;
    }
    final TriggerPushContext changeCtx =
        new TriggerPushContext(
            dataCenter,
            version.getValue(),
            dataNode,
            changeTimestamp,
            dataChangeRequest.getTimes());
    // 加入缓存map
    firePushService.fireOnChange(dataInfoId, changeCtx);
  }
  return null;
}
```

### 3.5 session server 拉取地址列表

同样地，此处采用生产者消费者模型，通过 worker 线程异步循环处理 ChangeTask，获取地址列表，更新地址列表缓存，推送给客户端，流程图如下。

![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*es1mSrFPzGQAAAAAAAAAAAAAARQnAQ)

doExecuteOnChange，获取地址列表源码：

```java
boolean doExecuteOnChange(String changeDataInfoId, TriggerPushContext changeCtx) {
  final long expectVersion = changeCtx.getExpectDatumVersion();
  // 获取地址列表
  final SubDatum datum = getDatum(changeCtx.dataCenter, changeDataInfoId, expectVersion);
  if (datum == null) {
    // datum change, but get null datum, should not happen
    LOGGER.error("[changeNil] {},{},{}", changeCtx.dataCenter, changeDataInfoId, expectVersion);
    return false;
  }
  // 判断版本号，获取到的最新版本号不应该比预期的小
  if (datum.getVersion() < expectVersion) {
    LOGGER.error(
        "[changeLessVer] {},{},{}<{}",
        changeCtx.dataCenter,
        changeDataInfoId,
        datum.getVersion(),
        expectVersion);
    return false;
  }
  onDatumChange(changeCtx, datum);
  return true;
}

// 获取地址列表
SubDatum getDatum(String dataCenter, String dataInfoId, long expectVersion) {
  Key key = new Key(DatumKey.class.getName(), new DatumKey(dataInfoId, dataCenter));
  Value value = sessionCacheService.getValueIfPresent(key);
  if (value != null) {
    SubDatum datum = (SubDatum) value.getPayload();
    // 缓存中的数据更新，以缓存中的数据为准
    if (datum != null && datum.getVersion() >= expectVersion) {
      // the expect version got
      CACHE_HIT_COUNTER.inc();
      return datum;
    }
  }
  CACHE_MISS_COUNTER.inc();
  // invalidate缓存中的数据
  // the cache is too old
  sessionCacheService.invalidate(key);
  // 获取并更新缓存
  value = sessionCacheService.getValue(key);
  return value == null ? null : (SubDatum) value.getPayload();
}
```

### 3.6 session server 推送地址列表

* 逻辑与发起订阅后的推送逻辑一样，这里不再展开。

## 四、性能优化

异步处理

* SOFARegistry 是 AP 的，订阅发布流程基本上都采用了异步处理的方式，牺牲了一部分一致性。内部大量采用了 Map 或队列作为缓存，解耦生产者和消费者，极大地提升了客户端 session server 和 data server 的性能；
缓存：

* SessionServer 通过 SessionCacheService 缓存地址列表，避免频繁请求给 data server 造成较大压力，影响存储稳定性；内部通过推拉结合的方式解决地址更新的问题，一方面通过数据变更通知 session server 更新地址列表，另一方面通过 VersionWatchDog 定时扫描版本号，拉取 data server 变更的地址列表；

合并 merge

* 发布服务写入 data server 时采用了批量处理的方式，减少与 data server 的网络交互，避免频繁请求给 data server 造成较大压力，影响存储稳定性。

## 五、并发控制

SOFARegistry 并发控制的方式主要有两种：

* 乐观并发控制：通过版本号避免旧版本数据写入，如 Publisher 的 registerVersion 可以防止 data server 将旧版本的 publisher 存入；Datum 的 version 可以防止将旧版本的地址列表写入缓存；
* 悲观并发控制：如 PublisherGroup 中通过读写锁在更改版本号，或增删发布者时进行写锁控制，防止并发写入；对查询等进行读锁控制。
