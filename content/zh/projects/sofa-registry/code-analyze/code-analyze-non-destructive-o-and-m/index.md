---
title: "源码解析｜无损运维"
author: "周书伟"
authorlink: "https://github.com/zswaaa"
description: "源码解析｜无损运维"
categories: "SOFAStack"
tags: [“源码解析”]
date: 2022-05-06T15:00:00+08:00
---

## 源码解析：无损运维
> SOFARegistry 是一个基于内存存储的分布式注册中心，数据是分散存储在各个节点，为了做到注册中心自身运维期间依然能够对外正常提供服务，需要进行节点下线快速感知和数据迁移。

> - session 存储 client 发送的发布和订阅数据，由于 client 断连重放的特性，session 单机下线后 client 会重放数据到其他节点。

> - data 会接收 session 发送的发布数据，data 单机下线后，meta 会通过 SlotTable 的变更把对应 Slot 的所有权移交其他 data，data 启动后会进行数据同步到达数据完整可对外提供服务的状态。

### session、data 下线的过程，如何避免下线期间数据丢失和抖动

SessionServer 和 DataServer 下线的相关代码都位于各自 bootstrap 类的 dostop 方法中。

首先讨论 SessionServer 的下线过程：

```java
private void doStop() {
  try {
    LOGGER.info("{} Shutting down Session Server..", new Date().toString());
    stopHttpServer();
    clientNodeConnectionHandler.stop(); // stop process disconnect event
    stopServer();
    // stop http server and client bolt server before add blacklist
    // make sure client reconnect to other sessions and data
    gracefulShutdown();
    stopDataSyncServer();
    stopConsoleServer();
    executorManager.stopScheduler();
  } catch (Throwable e) {
    LOGGER.error("Shutting down Session Server error!", e);
  }
  LOGGER.info("{} Session server is now shutdown...", new Date().toString());
}
```

从代码中可以看出，SessionServer 服务在下线时，首先会停掉 HttpServer，HttpServer 提供一系列 REST 接口，用于 dashboard 管理、数据查询等；然后停掉 clientNodeConnectionHandler，clientNodeConnectionHandler 是 Exchange 设置的一系列 ChannelHandler 之一，Exchange 作为 Client / Server 连接的抽象，负责节点之间的连接。gracefulShutdown 方法则是通知 Meta（元数据服务器）将本节点加入 Meta 的黑名单中。HttpServer 和客户端的 bolt Server 是在本节点加入黑名单前关停，以保证 client 已经重连到了其他 session 节点上。这样就保证了运维的 session 节点下线期间，client 的数据不会因为 session 节点的不可用，导致数据丢失和抖动。接下来又依次关停了 DataSyncServer，ConsoleServer。

DataServer 下线过程的代码如下：

```java
private void doStop() {
  try {
    LOGGER.info("{} Shutting down Data Server..", new Date().toString());

    gracefulShutdown();

    stopHttpServer();
    stopServer();
    stopDataSyncServer();
    stopNotifyServer();
  } catch (Throwable e) {
    LOGGER.error("Shutting down Data Server error!", e);
  }
  LOGGER.info("{} Data server is now shutdown...", new Date().toString());
}
```

DataServer 的下线则和 Session 的下线有些区别，由于 DataServer 数据服务器，负责存储具体的服务数据，而且 Slot 均匀地分配给每个节点上，所以下线前需要检测 DataServer 上的插槽状态，所以 doStop 的方法中，首先调用了如下的优雅下线的方法，其中代码中的主要内容如下：

```java
addBlacklistRetryer.call(
    () -> {
      LOGGER.info("[GracefulShutdown] add self to blacklist");
      metaServerService.addSelfToMetaBlacklist();
      return true;
    });
addBlacklistRetryer.call(
    () -> {
      if (fetchStopPushService.isStopPushSwitch()) {
        return true;
      }
      SlotTableStatusResponse statusResponse = metaServerService.getSlotTableStatus();
      if (statusResponse.isProtectionMode()) {
        return true;
      }
      LOGGER.info("[GracefulShutdown] wait no slot");
      if (slotManager.hasSlot()) {
        throw new RuntimeException("current data server still own slot, waiting...");
      }
      return true;
    });
LOGGER.info("add data self to blacklist successfully");
```

首先节点通知 Meta 加入黑名单，stopmetaServerService.getSlotTableStatus() 获取节点上 SlotTable 的状态，当 Slot 重新分配给其他节点后，该 Data 节点才会成功加入黑名单，并进行接下来 HttpServer、DataSyncServer、NotifyServer 的下线动作。

整体流程是 Data 上的 Slot 逐步迁移，期间仍然对外提供服务。

迁移完成后主动从列表中剔除并设置节点黑名单并下线。

以下图为例，假设要下线的节点是 DataServer-1：将 Data-server 添加到注册中心迁移名单中；再将 Slot-2 对应的 follower（DataServer-2）提升为 Leader；等待 Data 节点达到稳定；继续将 Slot-3 对应的 follower（DataServer-3) 提升为 Leader；按照以上步骤分配掉剩余的 follower Slots；Slot 迁移完毕，Data-server 从 Data 列表中剔除，同时添加为黑名单；从迁移名单中设置为 succeed。

![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*YPGYTbeqg3IAAAAAAAAAAAAAARQnAQ)

![img.png](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*iCZhSLsRoVUAAAAAAAAAAAAAARQnAQ)


Session 和 Data 下线中的优雅关闭和数据迁移保证了下线期间数据丢失和抖动，期间仍然对外提供服务。

### Meta 如何处理 Session、Data 主动下线的请求通知

Meta 集群服务于 SOFARegistry 内部的 Session 集群和 Data 集群，Meta 层能够感知到 Session 节点和 Data 节点的变化，并通知集群的其它节点。RegistryForbiddenServerHandler 注册在 sessionServerHandlers、dataServerHandlers ：

```java
@Bean(name = "sessionServerHandlers")
public Collection<AbstractServerHandler> sessionServerHandlers() {
  Collection<AbstractServerHandler> list = new ArrayList<>();
  list.add(heartbeatRequestHandler());
  list.add(fetchProvideDataRequestHandler());
  list.add(fetchSystemPropertyRequestHandler());
  list.add(registryForbiddenServerHandler());
  list.add(getSlotTableStatusRequestHandler());
  return list;
}

@Bean(name = "dataServerHandlers")
public Collection<AbstractServerHandler> dataServerHandlers() {
  Collection<AbstractServerHandler> list = new ArrayList<>();
  list.add(heartbeatRequestHandler());
  list.add(fetchProvideDataRequestHandler());
  list.add(registryForbiddenServerHandler());
  list.add(fetchSystemPropertyRequestHandler());
  list.add(getSlotTableStatusRequestHandler());
  return list;
}
```

当有 Data 和 Session 上下线时，会触发 registryForbiddenServerHandler，具体的 doHandle 方法将下线的节点添加到黑名单中：

```java
boolean success = false;
switch (operation) {
  case ADD:
    success = registryForbiddenServerManager.addToBlacklist(ip);
    break;
  case REMOVE:
    success = registryForbiddenServerManager.removeFromBlacklist(ip);
    break;
  default:
    break;
}
```

Meta 的心跳检测 HeartbeatRequestHandler 会在心跳检测时，获取 Session 的状态，

```java
@Override
public VersionedList<SessionNode> getSessionServerMetaInfo() {
  VersionedList<Lease<SessionNode>> leaseMetaInfo = getLeaseMeta();
  List<SessionNode> sessionNodes = Lists.newArrayList();
  leaseMetaInfo
      .getClusterMembers()
      .forEach(
          lease -> {
            sessionNodes.add(lease.getRenewal());
          });
  return new VersionedList<>(leaseMetaInfo.getEpoch(), sessionNodes);
}
```

获取 Meta 租约中最新的 Session 节点的信息，更新 Session 节点的信息。

Data 的节点信息也会通过类似的过程更新到 Meta 中，MetaServerManager 会根据节点类型，同步节点的在线信息：

```java
@Override
public VersionedList<DataNode> getDataServerMetaInfo() {
  VersionedList<Lease<DataNode>> leaseMetaInfo = getLeaseMeta();
  List<DataNode> dataNodes = Lists.newArrayList();
  leaseMetaInfo
      .getClusterMembers()
      .forEach(
          lease -> {
            dataNodes.add(lease.getRenewal());
          });
  return new VersionedList<>(leaseMetaInfo.getEpoch(), dataNodes);
}
```

### client 重连回放机制

```java
public void ensureConnected() throws InterruptedException {
  if (isConnected()) {
    return;
  }
  while (!connect()) {
    Thread.sleep(ClientConnection.RECONNECTING_DELAY);
  }
}
```

在 client 的工作线程中，会通过上述代码以 5s 为间隔时间，反复检查链接状态，client 的检查函数位于工作线程的一个无限循环的检查语句中:

```java
/** Handle. */
@Override
public void handle() {
  //noinspection InfiniteLoopStatement
  while (true) {
    try {
      // check connection status, try to reconnect to the server when connection lose
      client.ensureConnected();

      if (requestQueue.isEmpty()) {
        await(config.getRecheckInterval());
        continue;
      }

      Iterator<TaskEvent> lt = requestQueue.iterator();

      while (lt.hasNext()) {
        client.ensureConnected();
        TaskEvent ev = lt.next();
        lt.remove();
/**.........**/
```

### Data 启动期以及 Data 的启动过程的状态转化，如何确保新分配的 Slot 的数据完整性

##### ***<u>启动入口</u>***

Data 启动的过程代码位于 com.alipay.sofa.registry.server.data.bootstrap.DataServerBootstrap#start

```java
/** start dataserver */
public void start() {
  try {
    LOGGER.info("begin start server");
    LOGGER.info("release properties: {}", ServerEnv.getReleaseProps());
    LOGGER.info("the configuration items are as follows: " + dataServerConfig.toString());

    ReporterUtils.enablePrometheusDefaultExports();

    openDataServer();

    openDataSyncServer();

    openHttpServer();

    renewNode();
    fetchProviderData();

    systemPropertyProcessorManager.startFetchMetaSystemProperty();

    startScheduler();

    TaskMetrics.getInstance().registerBolt();

    postStart();
    Runtime.getRuntime().addShutdownHook(new Thread(this::doStop));

    LOGGER.info("start server success");
  } catch (Throwable e) {
    throw new RuntimeException("start server error", e);
  }
}
```

DataServer 模块的各个 bean 在 JavaConfig 中统一配置，JavaConfig 类为 DataServerBeanConfiguration， 启动入口类为 DataServerInitializer，该类不由 JavaConfig 管理配置，而是继承了 SmartLifecycle 接口，在启动时由 Spring 框架调用其 start 方法。

该方法中调用了 DataServerBootstrap#start 方法（如上述代码所示），用于启动一系列的初始化服务。

sofaRegistry V6 版本引入了“路由表”（SlotTabel）的概念，“路由表”负责存放每个节点和 N 个 Slot 的映射关系，并保证尽量把所有 Slot 均匀地分配给每个节点。这样，当节点上下线时，只需要修改路由表内容即可。

从代码中可以看出，DataServer 服务在启动时，会启动 DataServer、DataSyncServer、HttpServer 三个 bolt 服务。在启动这些 Server 之时，DataServer 注册了一系列 Handler 来处理各类消息。启动这些 Server 后，调用了 renewNode（）方法，renewNode 调用 metaServerService 的 renewNode，通过获取在心跳请求中将返回 SlotTable 路由表信息、Data 节点将路由表 SlotTable 保存在本地中，具体代码可以参考 com.alipay.sofa.registry.server.meta.remoting.meta.MetaServerRenewService#renewNode，下一步又刷新了 Session 的信息，并创建了一个 renew meta 的守护进程，用来持续刷新节点上存储的集群信息：

```java
  private void renewNode() {
    metaServerService.renewNode();
    // init session lease with first renew
    for (ProcessId processId : metaServerService.getSessionProcessIds()) {
      sessionLeaseManager.renewSession(processId);
    }
    metaServerService.startRenewer();
  }
```

slotManagerImpl 是 DataServer 的一个单例 ConditionalOnMissingBean 对象。当 Data 启动时，SlotManage 负责 Slot 数据的更新和迁移（com.alipay.sofa.registry.server.data.slot.SlotManagerImpl#syncMigrating）：

```java
private void syncMigrating(
    SlotState slotState,
    Collection<String> sessions,
    int syncSessionIntervalMs,
    long slotTableEpoch) {
  final Slot slot = slotState.slot;
  if (slotState.migratingStartTime == 0) {
    slotState.migratingStartTime = System.currentTimeMillis();
    slotState.migratingTasks.clear();
    observeLeaderMigratingStart(slot.getId());
    LOGGER.info(
        "start migrating, slotId={}, sessionSize={}, sessions={}",
        slotState.slotId,
        sessions.size(),
        sessions);
  }
  final int notSyncedCount = sessions.size() - slotState.countSyncSuccess(sessions);
  for (String sessionIp : sessions) {
    MigratingTask mtask = slotState.migratingTasks.get(sessionIp);
    if (mtask == null) {
      KeyedTask<SyncSessionTask> ktask =
          commitSyncSessionTask(slot, slotTableEpoch, sessionIp, null, true);
      mtask = new MigratingTask(sessionIp, ktask);
      slotState.migratingTasks.put(sessionIp, mtask);
      LOGGER.info("migrating start,slotId={},session={}", slot.getId(), sessionIp);
      continue;
    }

    if (mtask.task.isFailed() && !mtask.forceSuccess) {
      // failed and not force Success, try to trigger emergency
      if (triggerEmergencyMigrating(slotState, sessions, mtask, notSyncedCount)) {
        LOGGER.info("[emergency]{},session={}", slotState.slotId, mtask.sessionIp);
      } else {
        KeyedTask<SyncSessionTask> ktask =
            commitSyncSessionTask(slot, slotTableEpoch, sessionIp, null, true);
        mtask.task = ktask;
        mtask.tryCount++;
        LOGGER.error(
            "migrating retry,slotId={},try={},session={},create={}/{}",
            slot.getId(),
            mtask.tryCount,
            sessionIp,
            mtask.createTimestamp,
            System.currentTimeMillis() - mtask.createTimestamp);
        continue;
      }
    }
    // force success or migrating finish. try to sync session
    // avoid the time of migrating is too long and block the syncing of session
    if (mtask.task.isOverAfter(syncSessionIntervalMs)) {
      if (syncSession(slotState, sessionIp, null, syncSessionIntervalMs, slotTableEpoch)) {
        LOGGER.info("slotId={}, sync session in migrating, session={}", slot.getId(), sessionIp);
      }
    }
  }
}
```

Slot 的数据的同步是一个 watchDog 的模式，获取 slotTabel 的变化，会自动同步节点上的 Slot 数据：

```java
  void syncWatch() {
    final int syncSessionIntervalMs =
        dataServerConfig.getSlotLeaderSyncSessionIntervalSecs() * 1000;
    final int syncLeaderIntervalMs =
        dataServerConfig.getSlotFollowerSyncLeaderIntervalSecs() * 1000;
    final long slotTableEpoch = slotTableStates.table.getEpoch();
    for (SlotState slotState : slotTableStates.slotStates.values()) {
      try {
        sync(slotState, syncSessionIntervalMs, syncLeaderIntervalMs, slotTableEpoch);
      } catch (Throwable e) {
        SYNC_ERROR_LOGGER.error(
            "[syncCommit]failed to do sync slot {}, migrated={}",
            slotState.slot,
            slotState.migrated,
            e);
      }
    }
  }
```

由于节点上线后，Meta 会感知并获取最新的 DataServer 节点，leader Meta 对路由表进行了刷新，因为重新分配 SlotTable 本质上是 对 DataServer 节点和 Slot 槽位之间的映射关系进行重新分配。获取到当前存活的 DataServer 节点信息，从而方便的对之进行 Slot 分配。接下来对 Server 节点的 Slot 数据进行了同步。

上面的两部分代码总体可以概括为以下两个层次：

- Data 和 Session 通过心跳的机制在 Meta 上进行续约，当 Data 发生节点变更的时候，Meta 此时会重新进行分配，生成新的 SlotTable，并通过广播和心跳的方式返回所有的节点，Session 就会用这份 SlotTable 寻址新的 Data 节点。存在一个时刻，集群中存在两份 SlotTable，分裂时间最大(1s)。

- Session 上会缓存 Client 的 Pub 和 Sub 数据作为基准数据，在增量发送给 Data 的同时，Slot 的 leader 节点会定时和 Session 进行数据比对，Slot 的 follower 和 leader 也会定时进行数据对比，这样做到整个集群数据能快速达到最终一致，减少异常场景的不可服务时间。

Slot 数据完整度校验的作用在于当一个 Slot 数据所有副本所在节点全部宕机，数据发生丢失时，只能通过 Session 上的缓存数据进行数据回放。但在完全回放完成时，Slot 是不可对外提供读取服务的，以此避免推空或者推错，从而保证了数据的完整性。

流程如下图：

![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*RlJOTpAqdGgAAAAAAAAAAAAAARQnAQ)

server 启动的最后一步，是通知 Meta 将上线的 Data 节点从 blacklist 移除：

```java
private void postStart() throws Throwable {
  startupRetryer.call(
      () -> {
        LOGGER.info("successful start data server, remove self from blacklist");
        metaServerService.removeSelfFromMetaBlacklist();
        return true;
      });
}
```

至此，Server 的启动完成，Data 节点的 Slot 数据也根据变更后的 slotTable 同步完成，Data 节点开始在集群内工作。

