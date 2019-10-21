---
title: "服务注册中心 MetaServer 功能介绍和实现剖析 | SOFARegistry 解析"
author: "Yavin"
authorlink: "https://github.com/imsunv"
description: " 本文为《剖析 |  SOFARegistry 框架》第三篇，作者 Yavin ，来自考拉海购。"
categories: "SOFARegistry"
tags: ["SOFARegistry","剖析 | SOFARegistry 框架","SOFALab"]
date: 2019-09-12T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1568277810087-8104b576-d797-4e6a-8f13-0e2ecefdf466.jpeg"
---

> SOFAStack （**S**calable **O**pen **F**inancial  **A**rchitecture Stack） 是蚂蚁金服自主研发的金融级分布式架构，包含了构建金融级云原生架构所需的各个组件，是在金融场景里锤炼出来的最佳实践。

![SOFARegistryLab-功能介绍和实现剖析](https://cdn.nlark.com/yuque/0/2019/png/226702/1568267855098-4417688f-b829-4545-a692-c4da3bbca715.png)

SOFARegistry 是蚂蚁金服开源的具有承载海量服务注册和订阅能力的、高可用的服务注册中心，在支付宝/蚂蚁金服的业务发展驱动下，近十年间已经演进至第五代。

本文为《剖析 | SOFARegistry 框架》第三篇，**本篇作者 Yavin，来自考拉海购**。《剖析 | SOFARegistry 框架》系列由 SOFA 团队和源码爱好者们出品，项目代号：<SOFA:RegistryLab/>，文末包含往期系列文章。

GitHub 地址：[https://github.com/sofastack/sofa-registry](https://github.com/sofastack/sofa-registry)

## 导读

集群成员管理是分布式系统中绕不开的话题。MetaServer 在 SOFARegistry 中，承担着集群元数据管理的角色，用来维护集群成员列表。本文希望从 MetaServer 的功能和部分源码切入剖析，为学习研究、或者项目中使用SOFARegistry 的开发者带来一些启发，分为三个部分：

- 功能介绍
- 内部架构
- 源码分析

## 功能介绍

MetaServer 作为 SOFARegistry 的元数据中心，其核心功能可以概括为集群成员管理。分布式系统中，如何知道集群中有哪些节点列表，如何处理集群扩所容，如何处理集群节点异常，都是不得不考虑的问题。MetaServer 的存在就是解决这些问题，其在 SOFARegistry 中位置如图所示：
![image.png](https://cdn.nlark.com/yuque/0/2019/png/338467/1568254454389-0cefa85d-131a-4c2d-a844-f66e2c9807b4.png)

MetaServer 通过 [SOFAJRaft](https://github.com/sofastack/sofa-jraft) 保证高可用和一致性，类似于注册中心，管理着集群内部的成员列表：

- 节点列表的注册与存储
- 节点列表的变更通知
- 节点健康监测

## 内部架构

内部架构如下图所示：

![内部架构图](https://cdn.nlark.com/yuque/0/2019/png/338467/1568254931660-96379e5d-2ed0-472d-affa-edfb99c6bf24.png)

MetaServer 基于 Bolt, 通过 TCP 私有协议的形式对外提供服务，包括 DataServer, SessionServer 等，处理节点的注册，续约和列表查询等请求。

同时也基于 Http 协议提供控制接口，比如可以控制 session 节点是否开启变更通知, 健康检查接口等。

成员列表数据存储在 Repository 中，Repository 被一致性协议层进行包装，作为 SOFAJRaft 的状态机实现，所有对 Repository 的操作都会同步到其他节点, 通过Rgistry来操作存储层。

MetaServer 使用 Raft 协议保证数据一致性， 同时也会保持与注册的节点的心跳，对于心跳超时没有续约的节点进行驱逐，来保证数据的有效性。

在可用性方面，只要未超过半数节点挂掉，集群都可以正常对外提供服务， 半数以上挂掉，Raft 协议无法选主和日志复制，因此无法保证注册的成员数据的一致性和有效性。整个集群不可用 不会影响 Data 和 Session 节点的正常功能，只是无法感知节点列表变化。

## 源码分析

### 服务启动

MetaServer 在启动时，会启动三个 Bolt Server，并且注册 Processor Handler，处理对应的请求, 如下图所示：

![meta-server](https://cdn.nlark.com/yuque/0/2019/png/338467/1568253181089-b7fa6993-af59-41c8-b0a7-fad01f5dc9d0.png)

- DataServer：处理 DataNode 相关的请求；
- SessionServer：处理 SessionNode 相关的请求；
- MetaServer：处理MetaNode相关的请求；

然后启动 HttpServer, 用于处理 Admin 请求，提供推送开关，集群数据查询等 Http 接口。

最后启动 Raft 服务， 每个节点同时作为 RaftClient 和 RaftServer, 用于集群间的变更和数据同步。

各个 Server 的默认端口分别为：

```java
meta.server.sessionServerPort=9610
meta.server.dataServerPort=9611
meta.server.metaServerPort=9612
meta.server.raftServerPort=9614
meta.server.httpServerPort=9615
```

### 节点注册

由上节可知，DataServer 和 SessionServer 都有处理节点注册请求的 Handler。注册行为由 Registry 完成。注册接口实现为：

```java
@Override
    public NodeChangeResult register(Node node) {
        StoreService storeService =          ServiceFactory.getStoreService(node.getNodeType());
        return storeService.addNode(node);
    }
```

Regitsry 根据不同的节点类型，获取对应的`StoreService`，比如`DataNode`，其实现为 `DataStoreService` 然后由 `StoreService`  存储到 `Repository`  中，具体实现为：

```java
// 存储节点信息
dataRepositoryService.put(ipAddress, new RenewDecorate(dataNode, RenewDecorate.DEFAULT_DURATION_SECS));
//...
// 存储变更事件
dataConfirmStatusService.putConfirmNode(dataNode, DataOperator.ADD);
```

调用 `RepositoryService#put`  接口存储后，同时会存储一个变更事件到队列中，主要用于数据推送，消费处理。

节点数据的存储，其本质上是存储在内存的哈希表中，其存储结构为：

```java
// RepositoryService 底层存储
Map<String/*dataCenter*/, NodeRepository> registry;

// NodeRepository 底层存储
Map<String/*ipAddress*/, RenewDecorate<T>> nodeMap;
```

将`RenewDecorate`存储到该 Map 中，整个节点注册的流程就完成了，至于如何和 Raft 协议进行结合和数据同步，下文介绍。

节点移除的逻辑类似，将节点信息从该 Map 中删除，也会存储一个变更事件到队列。

### 注册信息续约和驱逐

不知道有没有注意到，节点注册的时候，节点信息被 `RenewDecorate`  包装起来了，这个就是实现注册信息续约和驱逐的关键：

```java
    private T               renewal;  // 节点对象封装
    private long            beginTimestamp; // 注册事件
    private volatile long   lastUpdateTimestamp; // 续约时间
    private long            duration; // 超时时间
```

该对象为注册节点信息，附加了注册时间、上次续约时间、过期时间。那么续约操作就是修改`lastUpdateTimestamp`，是否过期就是判断`System.currentTimeMillis() - lastUpdateTimestamp > duration` 是否成立，成立则认为节点超时进行驱逐。

和注册一样，续约请求的处理 Handler 为`ReNewNodesRequestHandler`，最终交由 StoreService 进行续约操作。另外一点，续约的时候如果没有查询到注册节点，会触发节点注册的操作。

驱出的操作是由定时任务完成，MetaServer 在启动时会启动多个定时任务，详见`ExecutorManager#startScheduler`,，其中一个任务会调用`Registry#evict`，其实现为遍历存储的 Map, 获得过期的列表，调用`StoreService#removeNodes`方法，将他们从 `Repository`  中移除，这个操作也会触发变更通知。该任务默认每3秒执行一次。

### 节点列表变更推送

上文有介绍到，在处理节点注册请求后，也会存储一个节点变更事件，即：

```java
dataConfirmStatusService.putConfirmNode(dataNode, DataOperator.ADD);
```

`DataConfirmStatusService`  也是一个由 Raft 协议进行同步的存储，其存储结构为：

```java
BlockingQueue<NodeOperator>  expectNodesOrders = new LinkedBlockingQueue();

ConcurrentHashMap<DataNode/*node*/, Map<String/*ipAddress*/, DataNode>> expectNodes = new ConcurrentHashMap<>();
```

- `expectNodesOrders` 用来存储节点变更事件；
- `expectNodes` 用来存储变更事件需要确认的节点，也就是说 `NodeOperator`  只有得到了其他节点的确认，才会从 `expectNodesOrders` 移除；

那么事件存储到 BlockingQueue 里，哪里去消费呢？ 看源码发现，并不是想象中的使用一个线程阻塞的读。

在`ExecutorManager`中会启动一个定时任务，轮询该队列有没有数据。即周期性的调用`Registry#pushNodeListChange`方法，获取队列的头节点并消费。Data 和 Session 各对应一个任务。具体流程如下图所示：

![push_processor](https://cdn.nlark.com/yuque/0/2019/png/338467/1568256774231-1672888e-de2f-44fd-b9c5-45573f3d4b79.png)

1. 首先获取队列（expectNodesOrders）头节点，如果为Null直接返回；
1. 获取当前数据中心的节点列表，并存储到确认表（expectNodes）；
1. 提交节点变更推送任务（firePushXxListTask)；
1. 处理任务，即调用 XxNodeService 的 pushXxxNode 方法，即通过 ConnectionHandler 获取所有的节点连接，发送节点列表；
1. 收到回复后，如果需要确认，则会调用`StroeService#confirmNodeStatus` 方法，将该节点从expectNodes中移除；
1. 待所有的节点从 expectNodes 中移除，则将此次操作从 expectNodesOrders 移除，处理完毕；

### 节点列表查询

Data，Meta,Session Server 都提供 `getNodesRequestHandler` ，用于处理查询当前节点列表的请求，其本质上从底层存储 Repository 读取数据返回，这里不在赘述。返回的结果的具体结构见 `NodeChangeResult` 类，包含各个数据中心的节点列表以及版本号。

### 基于 Raft 的存储

后端 Repository 可以看作SOFAJRaft 的状态机，任何对 Map 的操作都会在集群内部，交由 Raft 协议进行同步，从而达到集群内部的一致。从源码上看，所有的操作都是直接调用的 `RepositoryService` 等接口，那么是如何和 Raft 服务结合起来的呢？

看源码会发现，凡是引用 `RepositoryService` 的地方，都加了 `@RaftReference`， `RepositoryService` 的具体实现类都加了 `@RaftService` 注解。其关键就在这里，其处理类为 `RaftAnnotationBeanPostProcessor`。具体流程如下：

![raft_process](https://cdn.nlark.com/yuque/0/2019/png/338467/1568272719176-050c7875-274d-45be-97b6-2ab0f62aea16.png)

在 `processRaftReference`  方法中，凡是加了 `@RaftReference` 注解的属性，都会被动态代理类替换，其代理实现见 `ProxyHandler` 类，即将方法调用，封装为 `ProcessRequest`，通过 RaftClient 发送给 RaftServer。

而被加了 `@RaftService` 的类会被添加到 `Processor` 类 中，通过 `serviceId`(interfaceName + uniqueId) 进行区分。RaftServer 收到请求后，会把它生效到 SOFAJRaft 的状态机，具体实现类为 `ServiceStateMachine`，即会调用 `Processor` 方法，通过 serviceId 找到这个实现类，执行对应的方法调用。

当然如果本机就是主节点, 对于一些查询请求不需要走Raft协议而直接调用本地实现方法。 

这个过程其实和 RPC 调用非常类似，在引用方发起的方法调用，并不会真正的执行方法，而是封装成请求发送到 Raft 服务，由 Raft 状态机进行真正的方法调用，比如把节点信息存储到 Map 中。所有节点之间的数据一致由Raft协议进行保证。

## 总结

在分布式系统中，集群成员管理是避不开的问题，有些集群直接把列表信息写到配置文件或者配置中心，也有的集群选择使用 zookeeper 或者 etcd 等维护集群元数据，SOFARegistry 选择基于一致性协议 Raft，开发独立的MetaServer，来实现集群列表维护和变更实时推送，以提高集群管理的灵活性和集群的健壮性。

## SOFARegistryLab 系列阅读

- [蚂蚁金服服务注册中心 SOFARegistry 解析 | 服务发现优化之路](/blog/sofa-registry-service-discovery-optimization/)
- [海量数据下的注册中心 - SOFARegistry 架构介绍](/blog/sofa-registry-introduction/)