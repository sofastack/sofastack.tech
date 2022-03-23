---

title: "源码解析｜数据倒排索引"
author: "行动"
authorlink: "https://github.com/xingdong015"
description: "源码解析｜数据倒排索引"
categories: "SOFAStack"
tags: [“源码解析”]
date: 2022-03-23T15:00:00+08:00
---

> SOFAStack （**S**calable **O**pen **F**inancial **A**rchitecture Stack） 是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，是在金融场景里锤炼出来的最佳实践。
> SOFARegistry 是蚂蚁集团开源的具有承载海量服务注册和订阅能力的、高可用的服务注册中心，在支付宝/蚂蚁集团的业务发展驱动下，近十年间已经演进至第五代。

本文为《源码解析｜数据倒排索引》，**作者行动，来自高德**。

> 《源码解析》系列由 SOFA 团队和源码爱好者们出品。

GitHub 地址：[https://github.com/sofastack/sofa-registry](https://github.com/sofastack/sofa-registry)

### SOFARegistry 分层设计

我们知道一个典型的服务发布流程是这样的。

>图1 服务发布流程
>
>![image.png](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*H5z1S6vRN20AAAAAAAAAAAAAARQnAQ)

如上图、服务注册中心在RPC远程调用中的通常是中间协调者的角色，服务发布者Publisher将服务的发布信息（服务名称、ip、端口号等信息)）发布到注册中心 Registry 中、通常保存在 Registry 内部的数据结构中。服务订阅者在第一次调用服务的时候、会通过 Registry 找到所要调用服务的提供者列表。缓存在本地然后通过负载均衡算法找到一个具体的服务提供者。调用这个具体的服务提供者接口。

了解了一个典型的 RPC 调用的流程、我们来看看 SOFARegistry 作为一个注册中心内部包含哪几种角色。

1. Client

提供应用接入服务注册中心的基本 API 能力，应用系统通过依赖客户端 JAR 包，通过编程方式调用服务注册中心的服务订阅和服务发布能力。

1. SessionServer

会话服务器，负责接受 Client 的服务发布和服务订阅请求，并作为一个中间层将写操作转发 DataServer 层。SessionServer 这一层可随业务机器数的规模的增长而扩容。

1. DataServer

数据服务器，负责存储具体的服务数据，数据按 dataInfoId 进行一致性 Hash 分片存储，支持多副本备份，保证数据高可用。这一层可随服务数据量的规模的增长而扩容。

1. MetaServer

元数据服务器，负责维护集群 SessionServer 和 DataServer 的一致列表，作为 SOFARegistry 集群内部的地址发现服务，在 SessionServer 或 DataServer 节点变更时可以通知到整个集群。

>图2  SOFARegistry 分层设计
![image.png](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*v38WSr06IZwAAAAAAAAAAAAAARQnAQ)

如图 2 所示、在 SOFARegistry 中、客户端 client 直接和 session 通讯，而不是传统意义上的Data节点、这种添加中间一层隔离 DataServer 和客户端的做法。主要是为了处理客户端连接风暴。对这种分层设计。

感兴趣的可以参考  《[海量数据下的注册中心 - SOFARegistry 架构介绍](https://www.sofastack.tech/blog/sofa-registry-introduction/)》的 “如何支持海量客户端” 章节，这里不再赘述。文章下面也是主要围绕 Session层展开。

### SessionServer 启动过程

SessionServer 模块的各个 bean 在 JavaConfig 中统一配置，JavaConfig 类为 SessionServerConfiguration，启动入口类为 SessionServerInitializer，该类不由 JavaConfig 管理配置，而是继承了 SmartLifecycle 接口，在启动时由 Spring 框架调用其 start 方法。
该方法中调用了 SessionServerBootstrap#start 方法（图 3），用于启动一系列的初始化服务。
从代码中可以看出，SessionServer 服务在启动时，会启动 SessionServer、SessionSyncServer、HttpServer 三个 bolt 服务。在启动这些 Server 之时，DataServer 注册了一系列 bolt Handler 来处理各类消息。

```java
  public void start() {
    try {
      openSessionSyncServer();
      startupRetryer.call(
          () -> {
            connectMetaServer();
            return true;
          });

      startupRetryer.call(
          () -> systemPropertyProcessorManager.startFetchPersistenceSystemProperty());

      startScheduler();
      openHttpServer();

      startupRetryer.call(
          () -> {
            connectDataServer();
            return true;
          });

      sessionRegistryStrategy.start();
      configProvideDataWatcher.start();
      openSessionServer();
    } catch (Throwable e) {
      LOGGER.error("Cannot bootstrap session server :", e);
      throw new RuntimeException("Cannot bootstrap session server :", e);
    }
  }

```

### SessionServer 保存了哪些数据

在了解了 SessionServer 的启动过程、明白 SessionServer 作为 DataServer 的代理层、有着非常重要的位置。能够分摊一部分对 DataServer 的压力。那么在 SessionServer 在注册的时候会保存了哪些数据呢? 

1. SessionCacheService

从名称可以看出是缓存数据，当 Subscriber 注册到 SessionServer 中的时候、我们会给 Client 推送 Client 感兴趣的服务提供者信息列表。但是我们不可能在每次 Client 有变化的时候都去 Data层获取数据、这样对 Data 层的压力会很大。在 SessionServer 上缓存数据服务提供者信息可以对 DataServer 层屏蔽 Client 的变化，从而有效减轻 DataServer 的压力。SessionCacheService 内部的 readWriteCacheMap 缓存了服务提供者列表信息。使用 guava cache 缓存数据。数据有 ttl ，除此之外 Data 层有数据变化也会通知 cache 数据失效。

2. Subscriber 和 Publisher 会话缓存信息正排索引信息。

SessionServer 的设计之初就是为了和 Client 直接通讯。通过 SessionServer 来负责与 Client 的连接，将每个 Client 的连接数收敛到 1，每个 SessionServer 负责与若干个 Client 连接，这样当 Client 数量增长时，只需要扩容 SessionServer 集群就可以了。所以 SessionServer 必须保存与客户端 Client 的会话信息。同时这部分数据也会定期和 DataServer 中保存的发布订阅信息进行同步。
SessionServer 中保存会话信息的实现是 SessionInterests、SessionDataStore 分别对应 订阅、发布的会话数据。

3. ConnectId (ip-port) 到会话信息的索引数据

SOFARegistry 有一些场景需要根据 ip:port 反查改连接所对应的所有数据，比如断链清理数据，因此需要一个倒排索引建立 ConnectId(ip:port) 到到该 ConnectId 所有会话的映射关系表。方便数据的快速定位。

### 会话数据和索引数据表示

客户端的发布订阅会话信息保存在 SlotStore 或者 SimpleStore 中、其中 发布会话数据保存在SlotStore 中、订阅会话信息保存在 SimpleStore 中、SlotStore 和 SimpleStore 的区别在于 SlotStore 会将数据分成不同的 Slot 存储。不同的 Slot 主要是为了做数据多副本拷贝、以及方便与 DataStore 做数据校对。 抛开 SlotStore 抽象、这两种对象底层数据保存格式都是如下数据结构:
> Map<String /*dataInfoId*/, Map<String /*registerId*/, T>> stores;

外层 key 是 dataInfoId，dataInfoId 是代表发布订阅信息的唯一标识、例如、

```java
com.alipay.test.demo.service:1.0@DEFAULT#@#DEFAULT_INSTANCE_ID#@#TEST_GROUP 
```

内层结构中的 key 为 registerId, 代表一次发布订阅请求的唯一id，每次 client 发起发布订阅会随机生成一个不一样的 id

```java
this.REGIST_ID = UUID.randomUUID().toString()
```

具体关系如下图所示:

>图3 SessionServer 会话数据存储结构
![image.png](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*Jh7XS6zcnTMAAAAAAAAAAAAAARQnAQ)

在一些场景中、例如客户端断连，我们通过底层的通讯框架感知到这一变化。我们需要将该 条连接上所有的发布订阅会话数据清除掉。如果用上面的 存储结构 我们需要迭代查找、这样对于客户端频繁的断开连接场景来说，这样会过于消耗 CPU 资源、基于此 SessionServer 在保存 Store 数据的时候也保存一份倒排索引数据、方便通过 ConnectId 快速找到所有的注册订阅会话信息。数据结构如下:

```java
public abstract class DataIndexer<K, V> {
    private volatile Map<K, Set<V>> index = new ConcurrentHashMap<>(1024);
    private volatile Map<K, Set<V>> tempIndex = new ConcurrentHashMap<>(1024);
    private volatile Term lastTerm = new Term();
    private volatile boolean doubleWrite = false;

    private final IndexerRefresher indexerRefresher = new IndexerRefresher();
    
    public DataIndexer(String name) {
        ConcurrentUtils.createDaemonThread(name + "-IndexerRefresher", indexerRefresher).start();
    }
    .......
}
```

在源码中类图如下

>图4 DateStore 类图
![image.png](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*K81eTrug-w4AAAAAAAAAAAAAARQnAQ)

### 倒排索引数据和发布订阅数据如何一致性如何保证?

如上文所述、服务在发布或者订阅时，SessionServer 保存了完整的发布订阅会话信息之外还保存了额外的索引数据。 既然数据保存了两份、那么两份数据的一致性就是一个不得不考虑的问题。
DataStore 数据 和索引数据在新增的时候都是同步写入的、如果没有删除、那么理论上来说这两份数据是不存在不一致的情况的。

```java
protected Tuple<T, Boolean> addData(T data) {
    return connectDataIndexer.add(data.connectId(), DataPos.of(data), () -> addDataToStore(data));
}
public <R> R add(K key, V val, UnThrowableCallable<R> dataStoreCaller) {
    Term term = lastTerm;
    term.start.incrementAndGet();
    try {
      if (doubleWrite) {
        insert(tempIndex, key, val);
      }
      insert(index, key, val);
      return dataStoreCaller.call();
    } finally {
      term.done.incrementAndGet();
    }
  }
```

那么我们为什么还要单独讨论这两份数据的一致性呢？正如上文所示，索引数据存在的一部分原因是当客户端断开和 SessionServer 的某个会话连接的时候、需要将该条连接对应的所有会话数据清理掉。所以必然有删除操作。删除操作在源码中 AbstractDataManager#deleteByConnectId 方法。

```java
  public Map<String, T> deleteByConnectId(ConnectId connectId) {
    Store<T> store = getStore();
    Map<String, T> ret = Maps.newHashMapWithExpectedSize(128);
    for (DataPos pos : connectDataIndexer.queryByKey(connectId)) {    
      Map<String, T> dataMap = store.get(pos.getDataInfoId());
      if (CollectionUtils.isEmpty(dataMap)) {
        continue;
      }
      T data = dataMap.get(pos.getRegisterId());
      if (data == null || !data.connectId().equals(connectId)) {
        continue;
      }
      if (dataMap.remove(pos.getRegisterId(), data)) {
        ret.put(data.getRegisterId(), data);
      }
    }
    return ret;
  }
```

断连删除会话逻辑是通过 倒排索引查找到所有的会话 dataInfoId 和 registerId (这里会话通过 DataPos 包装会话 dataInfoId 和 registId) ，然后逐个回查会话 dataStore 并删除对应信息。

细心的读者应该发现方法执行完成也没有删除索引数据、这样会导致执行完删除逻辑 索引数据是多于 DataStore 数据。思考一下这里为什么不直接删除索引数据呢?  我们不妨来假设这里有删除索引数据逻辑。

在刚好准备执行删除 索引时刻 (还未执行)，该条会话又重新建立了 (可能是客户端的短时间的网络原因导致的断开连接又重新连接上) 重新写入了DataStore和索引数据，随后执行索引删除操作继续执行、那么就会把新写入的索引数据删除掉。那么新写入的 dataStore 会话数据就没有索引指向之、导致 DataStore 数据残留、无任何索引数据引用这部分数据，也没有办法通过索引删除。 

基于此 SofaRegistry 在删除时保留了索引数据，只删除会话数据。而且在针对数据的查询以及删除场景中 SofaRegistry 做了很多的检查、保证就算是索引数据多于 dataStore 数据的情况下也不会出现问题。 例如 AbstractDataManager#queryByConnectId 通过索引查出来的 registerId 和 dataInfoId 也会重新回查 dataStore 去重新检查一次的、所以数据最终还是以dataStore为准. 不会产生问题。

虽然说索引数据多余 dataStore 数据不会有数据污染问题、但是也不能一直让索引数据持续变大、这样对内存也是一种极大的浪费。那么这部分多余的索引数据何时进行清理呢。 这里 SOFARegistry 通过一种简单的方式来保证数据的最终一致性，也就是定时任务修正数据的不一致情况。

通常来说在业务开发中、如果有数据迁移需求、我们往往会有一个不一致的窗口期间、这个期间我们会执行双写的逻辑，也就是一次数据写入请求、会同步写入两个库。同时会记录打开双写的时间  t1，从 t1 时刻之后的数据新库都存在、我们只需要同步 t1 时刻之前的数据到新库中。同理这里索引数据的修正也是通过类似的方式。

写入 Store 以及索引代码

```java
public <R> R add(K key, V val, UnThrowableCallable<R> dataStoreCaller) {
    Term term = lastTerm;
    term.start.incrementAndGet();
    try {
 ①   if (doubleWrite) {											
 ②     insert(tempIndex, key, val);
      }
 ③   insert(index, key, val);
 ④   return dataStoreCaller.call();
    } finally {
      term.done.incrementAndGet();
    }
}
```

后台定时修正代码

```java
  private void refresh() {
    tempIndex = new ConcurrentHashMap<>(this.index.size());
    Term prevTerm = lastTerm;
①   doubleWrite = true;①
    try {
②     lastTerm = new Term();
③     boolean timeout = !prevTerm.waitAllDone();
④     dataStoreForEach(
          (key, val) -> {
            insert(tempIndex, key, val);
          });
      index = tempIndex;
    } finally {
      doubleWrite = false;
    }
  }
```

这里我们思考一个问题、一般来说在做数据迁移的时候、我们只需要有一个是否 "双写" 标识就可以了。打开双写开关、执行数据的双向写入。关闭开关、停止双写。这里为什么有了双写开关还要有一个 Term 标识呢？

假如我们只有一个 双写开关。线程1 执行 add 方法执行到 ③ 或者 ④ 的时因为 gc 或者线程调度停止运行、此时后台任务线程在 refresh 方法的 ① 处 开启了双写，也就是说打开双写的时候、线程1 执行 add 方法刚好执行到一半，因为线程1 没有执行 doubleWrite 双写、所以 tempIndex 中肯定没有线程1 所添加的服务发布订阅数据，同理 Store 中也没有添加成功。因为线程1 还没执行完成  add 方法执行，此时如果后台线程执行 refresh 方法后续步骤、也就是 refresh 方法的第 ④ 步。那么最终的 tempIndex 索引数据肯定缺少线程1 添加的发布订阅数据信息。

为了避免这种场景导致的不一致。我们需要了解 add 方法执行的过程。所以我们引入 Term 、在 add 方法执行开始和接收分别对 Term 的内部源自变量 start 和 done 进行自增++。当我们开启双写、随后替换老的 Term 为一个新的 Term (代码 refresh ②处)、相当于开启了新一轮的统计。这样后来的基于新的 Term 的统计肯定都会写到 TempIndex (voiltile 内存语义决定的)、基于之前老的 Term 的写入、我们只需要在 refresh 执行到 ③ 处等待执行完成即可。这样 Store 中就有了基于上一个 Term 中的全量 Session 会话信息了、这样回放的时候才不会丢失索引数据。

### 总结

SOFARegistry 使用后台定时修正的方式保持 session 数据和索引数据的一致性、是一种比较简单的方式、省去了加锁逻辑，不会影响到写入性能。在定时修正过程中所以引入 Term 最终目的还是为了索引数据不丢失。大家可以参考源码细细体会。
