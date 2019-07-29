---
title: "深度剖析一站式分布式事务方案 Seata-Server"
author: "李钊"
description: "在这篇文章，将重点介绍 Seata 其中的核心角色 TC，也就是事务协调器。"
categories: "Seata"
tags: ["Seata"]
date: 2019-04-09T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1564390261585-2797b11c-6652-4102-ac30-b556548be203.png"
---

![Seata](https://cdn.nlark.com/yuque/0/2019/png/226702/1554783030924-cf469fe5-f8ca-4b27-b250-4ef0a26e7c50.png)

本文作者李钊，公众号「咖啡拿铁」作者，分布式事务 Seata 社区 Contributor。

## 1.关于 Seata

在前不久，我写了一篇关于分布式事务中间件 Fescar 的解析，没过几天 Fescar 团队对其进行了品牌升级，取名为 Seata(Simpe Extensible Autonomous Transcaction Architecture)，而以前的 Fescar 的英文全称为 Fast & EaSy Commit And Rollback。可以看见 Fescar 从名字上来看更加局限于 Commit 和 Rollback，而新的品牌名字 Seata 旨在打造一套一站式分布式事务解决方案。更换名字之后，我对其未来的发展更有信心。

这里先大概回忆一下 Seata 的整个过程模型：

![Seata 过程模型](https://cdn.nlark.com/yuque/0/2019/png/226702/1554712795916-70b699d0-3817-4483-8767-6ece98e1b9fe.png)

- TM：事务的发起者。用来告诉 TC，全局事务的开始，提交，回滚。
- RM：具体的事务资源，每一个 RM 都会作为一个分支事务注册在 TC。
- TC 事务的协调者。也可以看做是 Fescar-server，用于接收我们的事务的注册，提交和回滚。

在之前的文章中对整个角色有个大体的介绍，在这篇文章中我将重点介绍其中的核心角色 TC，也就是事务协调器。

## 2.Transaction Coordinator

为什么之前一直强调 TC 是核心呢？那因为 TC 这个角色就好像上帝一样，管控着芸芸众生的 RM 和 TM。如果 TC 一旦不好使，那么 RM 和 TM 一旦出现小问题，那必定会乱的一塌糊涂。所以要想了解 Seata，那么必须要了解他的 TC。

那么一个优秀的事务协调者应该具备哪些能力呢？我觉得应该有以下几个：

- 正确的协调：能正确的协调 RM 和 TM 接下来应该做什么，做错了应该怎么办，做对了应该怎么办。
- 高可用：事务协调器在分布式事务中很重要，如果不能保证高可用，那么他也没有存在的必要了。
- 高性能：事务协调器的性能一定要高，如果事务协调器性能有瓶颈，那么他所管理的 RM 和 TM 会经常遇到超时，从而引起回滚频繁。
- 高扩展性：这个特点是属于代码层面的，如果是一个优秀的框架，那么需要给使用方很多自定义扩展，比如服务注册/发现，读取配置等等。

下面我也将逐步阐述 Seata 是如何做到上面四点。

### 2.1 Seata-Server 的设计

![Seata-Server 整体模块图](https://cdn.nlark.com/yuque/0/2019/png/226702/1554712795921-d0f878a4-1f47-4b3d-b060-daa15fbb9da4.png)

Seata-Server 整体的模块图如上所示：

- Coordinator Core：最下面的模块是事务协调器核心代码，主要用来处理事务协调的逻辑，如是否 Commit、Rollback 等协调活动。
- Store：存储模块，用来将我们的数据持久化，防止重启或者宕机数据丢失。
- Discover：服务注册/发现模块，用于将 Server 地址暴露给 Client。
- Config：用来存储和查找服务端的配置。
- Lock：锁模块，用于给 Seata 提供全局锁的功能。
- Rpc：用于和其他端通信。
- HA-Cluster：高可用集群，目前还没开源。为 Seata 提供可靠的高可用功能。

### 2.2 Discover

首先来讲讲比较基础的 Discover 模块，又称服务注册/发现模块。我们将 Seata-Server 启动之后，需要将自己的地址暴露给其他使用者，那么就需要这个模块帮忙。

![核心接口 RegistryService](https://cdn.nlark.com/yuque/0/2019/png/226702/1554712795942-1f83e0b4-110d-41eb-bd57-c4cfcaf6d783.png)

这个模块有个核心接口 RegistryService，如上图所示：

- register：服务端使用，进行服务注册。
- unregister：服务端使用，一般在 JVM 关闭钩子，ShutdownHook 中调用。
- subscribe：客户端使用，注册监听事件，用来监听地址的变化。
- unsubscribe：客户端使用，取消注册监听事件。
- lookup：客户端使用，根据 Key 查找服务地址列表。
- close：都可以使用，用于关闭 Register 资源。

如果需要添加自己定义的服务注册/发现，那么实现这个接口即可。截止目前在社区的不断开发推动下，已经有四种服务注册/发现，分别是 redis、zk、nacos、eruka。下面简单介绍下 Nacos 的实现：

#### 2.2.1 register 接口

![register 接口](https://cdn.nlark.com/yuque/0/2019/png/226702/1554712795942-8c36fa4f-61ac-4ca9-80a1-dd35c09c7cee.png)

step1：校验地址是否合法；

step2：获取 Nacos 的 Name 实例，然后将地址注册到当前 Cluster 名称上面。

unregister 接口类似，这里不做详解。

#### 2.2.2 lookup 接口

![lookup 接口](https://cdn.nlark.com/yuque/0/2019/png/226702/1554712795966-5ce5a7f3-9f86-4c64-9458-8a152a7fd442.png)

step1：获取当前 clusterName 名字；

step2：判断当前 Cluster 是否已经获取过了，如果获取过就从 Map 中取；

step3：从 Nacos 拿到地址数据，将其转换成我们所需要的；

step4：将我们事件变动的 Listener 注册到 Nacos。

#### 2.2.3 subscribe 接口

![subscribe 接口](https://cdn.nlark.com/yuque/0/2019/png/226702/1554712795900-b870f451-d671-4a17-a6cd-60ad824acc22.png)

这个接口比较简单，具体分两步：

step1：将 Clstuer 和 Listener 添加进 Map 中；

step2：向 Nacos 注册。

### 2.3 Config

配置模块也是一个比较基础，比较简单的模块。我们需要配置一些常用的参数比如：Netty 的 Select 线程数量，Work 线程数量，Session 允许最大为多少等等，当然这些参数在 Seata 中都有自己的默认设置。

同样的在 Seata 中也提供了一个接口 Configuration，用来自定义我们需要的获取配置的地方：

![Config](https://cdn.nlark.com/yuque/0/2019/png/226702/1554712795936-03cb0753-2e0c-473c-b363-911d79f4e692.png)

- getInt/Long/Boolean/Config()：通过 DataId 来获取对应的值。
- putConfig：用于添加配置。
- removeConfig：删除一个配置。
- add/remove/get ConfigListener：添加/删除/获取 配置监听器，一般用来监听配置的变更。

目前为止有四种方式获取 Config：File（文件获取）、Nacos、Apollo、ZK。在 Seata 中首先需要配置 registry.conf，来配置 conf 的类型。实现 conf 比较简单这里就不深入分析。

### 2.4 Store

存储层的实现对于 Seata 是否高性能，是否可靠非常关键。

如果存储层没有实现好，那么如果发生宕机，在 TC 中正在进行分布式事务处理的数据将会被丢失。既然使用了分布式事务，那么其肯定不能容忍丢失。如果存储层实现好了，但是其性能有很大问题，RM 可能会发生频繁回滚那么其完全无法应对高并发的场景。

在 Seata 中默认提供了文件方式的存储，下面定义存储的数据为 Session，而 TM 创造的全局事务数据叫 GloabSession，RM 创造的分支事务叫 BranchSession，一个 GloabSession 可以拥有多个 BranchSession。我们的目的就是要将这么多 Session 存储下来。

在 FileTransactionStoreManager#writeSession 代码中：

![Store](https://cdn.nlark.com/yuque/0/2019/png/226702/1554712795941-0f1088d1-5c37-4f99-a21a-446bcd329bb6.png)

上面的代码主要分为下面几步：

step1：生成一个 TransactionWriteFuture。

step2：将这个 futureRequest 丢进一个 LinkedBlockingQueue 中。为什么需要将所有数据都丢进队列中呢？当然这里其实也可以用锁来实现，在另外一个阿里开源的 RocketMQ 中使用的锁。不论是队列还是锁，他们的目的是为了保证单线程写，这又是为什么呢？有人会解释说，需要保证顺序写，这样速度就很快，这个理解是错误的，我们的 FileChannel 其实是线程安全的，已经能保证顺序写了。保证单线程写其实是为了让这个写逻辑都是单线程的，因为可能有些文件写满或者记录写数据位置等等逻辑，当然这些逻辑都可以主动加锁去做，但是为了实现简单方便，直接再整个写逻辑加锁是最为合适的。

step3：调用 future.get，等待该条数据写逻辑完成通知。

我们将数据提交到队列之后，接下来需要对其进行消费，代码如下：

![调用 future.get](https://cdn.nlark.com/yuque/0/2019/png/226702/1554712795923-50ad4e8a-41f3-4b03-8df6-fcc4173dcf46.png)

这里将一个 WriteDataFileRunnable() 提交进线程池，这个 Runnable 的 run() 方法如下：

![Runnable 的 run() 方法](https://cdn.nlark.com/yuque/0/2019/png/226702/1554712795932-a480fa94-ed74-48a9-a2d5-a8e3d31e4025.png)

分为下面几步：

step1：判断是否停止，如果 stopping 为 true 则返回 null。

step2：从队列中获取数据。

step3：判断 future 是否已经超时了，如果超时，则设置结果为 false，此时我们生产者 get() 方法会接触阻塞。

step4：将数据写进文件，此时数据还在 pageCache 层并没有刷新到磁盘，如果写成功然后根据条件判断是否进行刷盘操作。

step5：当写入数量到达一定的时候，或者写入时间到达一定的时候，需要将当前的文件保存为历史文件，删除以前的历史文件，然后创建新的文件。这一步是为了防止文件无限增长，大量无效数据浪费磁盘资源。

在 writeDataFile 中有如下代码：

![writeDataFile](https://cdn.nlark.com/yuque/0/2019/png/226702/1554712795910-748af023-d2c6-44b4-b349-2a6b78c81588.png)

step1：首先获取 ByteBuffer，如果超出最大循环 BufferSize 就直接创建一个新的，否则就使用缓存的 Buffer。这一步可以很大的减少 GC。

step2：然后将数据添加进入 ByteBuffer。

step3：最后将 ByteBuffer 写入 fileChannel，这里会重试三次。此时的数据还在 pageCache 层，受两方面的影响，OS 有自己的刷新策略，但是这个业务程序不能控制，为了防止宕机等事件出现造成大量数据丢失，所以就需要业务自己控制 flush。下面是 flush 的代码：

![flush 的代码](https://cdn.nlark.com/yuque/0/2019/png/226702/1554712795934-6c9d38e1-e21e-4ba7-b58b-d2d6a3e31238.png)

这里 flush 的条件写入一定数量或者写的时间超过一定时间，这样也会有个小问题如果是停电，那么 pageCache 中有可能还有数据并没有被刷盘，会导致少量的数据丢失。目前还不支持同步模式，也就是每条数据都需要做刷盘操作，这样可以保证每条消息都落盘，但是性能也会受到极大的影响，当然后续会不断的演进支持。

Store 核心流程主要是上面几个方法，当然还有一些比如 Session 重建等，这些比较简单，读者可以自行阅读。

### 2.5 Lock

大家知道数据库实现隔离级别主要是通过锁来实现的，同样的再分布式事务框架 Seata 中要实现隔离级别也需要通过锁。一般在数据库中数据库的隔离级别一共有四种：读未提交、读已提交、可重复读、串行化。在 Seata 中可以保证写的互斥，而读的隔离级别一般是未提交，但是提供了达到读已提交隔离的手段。

Lock 模块也就是 Seata 实现隔离级别的核心模块。在 Lock 模块中提供了一个接口用于管理锁：

![ Lock 模块](https://cdn.nlark.com/yuque/0/2019/png/226702/1554712796093-777fef80-b8b2-42b7-8cc3-2848b6d09a78.png)

其中有三个方法：

- acquireLock：用于对 BranchSession 加锁，这里虽然是传的分支事务 Session，实际上是对分支事务的资源加锁，成功返回 true。
- isLockable：根据事务 ID，资源 ID，锁住的 Key 来查询是否已经加锁。
- cleanAllLocks：清除所有的锁。

对于锁我们可以在本地实现，也可以通过 redis 或者 mysql 来帮助我们实现。官方默认提供了本地全局锁的实现：

![本地全局锁的实现](https://cdn.nlark.com/yuque/0/2019/png/226702/1554712795923-3d584904-2eb1-469d-a42e-a13fcb252f36.png)

在本地锁的实现中有两个常量需要关注：

- BUCKET_PER_TABLE：用来定义每个 table 有多少个 bucket，目的是为了后续对同一个表加锁的时候减少竞争。
- LOCK_MAP：这个 Map 从定义上来看非常复杂，里里外外套了很多层 Map，这里用个表格具体说明一下：
| 层数 | key | value |
| --- | --- | --- |
| 1-LOCK_MAP | resourceId（jdbcUrl） | dbLockMap |
| 2- dbLockMap | tableName （表名） | tableLockMap |
| 3- tableLockMap | PK.hashcode%Bucket （主键值的 hashcode%bucket） | bucketLockMap |
| 4- bucketLockMap | PK | trascationId |

可以看见实际上的加锁在 bucketLockMap 这个 Map 中，这里具体的加锁方法比较简单就不作详细阐述，主要是逐步的找到 bucketLockMap ，然后将当前 trascationId 塞进去，如果这个主键当前有 TranscationId，那么比较是否是自己，如果不是则加锁失败。

### 2.6 RPC

保证 Seata 高性能的关键之一也是使用了 Netty 作为 RPC 框架，采用默认配置的线程模型如下图所示：

![线程模型](https://cdn.nlark.com/yuque/0/2019/png/226702/1554712795955-0bbdffe0-f9ab-4a97-bea4-56c2caf86675.png)

如果采用默认的基本配置那么会有一个 Acceptor 线程用于处理客户端的链接，会有 cpu x 2 数量的 NIO-Thread，再这个线程中不会做业务太重的事情，只会做一些速度比较快的事情，比如编解码，心跳事件和TM注册。一些比较费时间的业务操作将会交给业务线程池，默认情况下业务线程池配置为最小线程为 100，最大为 500。

这里需要提一下的是 Seata 的心跳机制，这里是使用 Netty 的 IdleStateHandler 完成的，如下：

![Seata 的心跳机制](https://cdn.nlark.com/yuque/0/2019/png/226702/1554712795931-dcbb5789-2e24-467a-90fb-ee4edb2eed4a.png)

在 Sever 端对于写没有设置最大空闲时间，对于读设置了最大空闲时间，默认为 15s，如果超过 15s 则会将链接断开，关闭资源。

![Seata 的心跳机制](https://cdn.nlark.com/yuque/0/2019/png/226702/1554712795936-5b62671d-8c75-4bf9-84d6-d68673aa590d.png)

step1：判断是否是读空闲的检测事件；

step2：如果是则断开链接，关闭资源。

### 2.7 HA-Cluster

目前官方没有公布 HA-Cluster，但是通过一些其他中间件和官方的一些透露，可以将 HA-Cluster 用如下方式设计：

![ HA-Cluster](https://cdn.nlark.com/yuque/0/2019/png/226702/1554712795934-98520eb5-afb3-45f1-8153-2adedf45124a.png)

具体的流程如下：

step1：客户端发布信息的时候根据 TranscationId 保证同一个 Transcation 是在同一个 Master 上，通过多个 Master 水平扩展，提供并发处理性能。

step2：在 Server 端中一个 Master 有多个 Slave，Master 中的数据近实时同步到 Slave上，保证当 Master 宕机的时候，还能有其他 Slave 顶上来可以用。

当然上述一切都是猜测，具体的设计实现还得等 0.5 版本之后。目前有一个 Go 版本的 Seata-Server 也捐赠给了 Seata (还在流程中)，其通过 Raft 实现副本一致性，其他细节不是太清楚。

### 2.8 Metrics & Tracing

这个模块也是一个没有具体公布实现的模块，当然有可能会提供插件口，让其他第三方 metric 接入进来。另外最近 Apache SkyWalking 正在和 Seata 小组商讨如何接入进来。

## 3.Coordinator Core

上面我们讲了很多 Server 基础模块，想必大家对 Seata 的实现已经有个大概，接下来我会讲解事务协调器具体逻辑是如何实现的，让大家更加了解 Seata 的实现内幕。

## 3.1 启动流程

启动方法在 Server 类有个 main 方法，定义了我们启动流程：

![启动流程](https://cdn.nlark.com/yuque/0/2019/png/226702/1554712795941-44550135-acd8-492c-9240-e88eeb7bce63.png)

step1：创建一个 RpcServer，再这个里面包含了我们网络的操作，用 Netty 实现了服务端。

step2：解析端口号和文件地址。

step3：初始化 SessionHoler，其中最重要的重要就是重我们 dataDir 这个文件夹中恢复我们的数据，重建我们的Session。

step4：创建一个CoorDinator,这个也是我们事务协调器的逻辑核心代码，然后将其初始化，其内部初始化的逻辑会创建四个定时任务：

- retryRollbacking：重试 rollback 定时任务，用于将那些失败的 rollback 进行重试的，每隔 5ms 执行一次。
- retryCommitting：重试 commit 定时任务，用于将那些失败的commit 进行重试的，每隔 5ms 执行一次。
- asyncCommitting：异步 commit 定时任务，用于执行异步的commit，每隔 10ms 一次。
- timeoutCheck：超时定时任务检测，用于检测超时的任务，然后执行超时的逻辑，每隔 2ms 执行一次。

step5： 初始化 UUIDGenerator 这个也是我们生成各种 ID(transcationId,branchId) 的基本类。

step6：将本地 IP 和监听端口设置到 XID 中，初始化 rpcServer 等待客户端的连接。

启动流程比较简单，下面我会介绍分布式事务框架中的常见的一些业务逻辑 Seata 是如何处理的。

### 3.2 Begin - 开启全局事务

一次分布式事务的起始点一定是开启全局事务，首先我们看看全局事务 Seata 是如何实现的：

![开启全局事务](https://cdn.nlark.com/yuque/0/2019/png/226702/1554712795957-945d679c-d333-409e-a0e9-ec65d6c31c38.png)

step1： 根据应用 ID，事务分组，名字，超时时间创建一个 GloabSession，这个再前面也提到过他和 branchSession 分别是什么。

step2：对其添加一个 RootSessionManager 用于监听一些事件，这里要说一下目前在 Seata 里面有四种类型的 Listener (这里要说明的是所有的 sessionManager 都实现了 SessionLifecycleListener)：

- ROOT_SESSION_MANAGER：最全，最大的，拥有所有的 Session。
- ASYNC_COMMITTING_SESSION_MANAGER：用于管理需要做异步 commit 的 Session。
- RETRY_COMMITTING_SESSION_MANAGER：用于管理重试 commit 的 Session。
- RETRY_ROLLBACKING_SESSION_MANAGER：用于管理重试回滚的 Session。
由于这里是开启事务，其他 SessionManager 不需要关注，我们只添加 RootSessionManager 即可。

step3：开启 Globalsession：

![开启 Globalsession](https://cdn.nlark.com/yuque/0/2019/png/226702/1554712795950-4ffc9045-28ee-489a-8a70-2774d9c514a7.png)

这一步会把状态变为 Begin，记录开始时间,并且调用 RootSessionManager的onBegin 监听方法，将 Session 保存到 Map 并写入到我们的文件。

step4：最后返回 XID，这个 XID 是由 ip+port+transactionId 组成的，非常重要，当 TM 申请到之后需要将这个 ID 传到 RM 中，RM 通过 XID 来决定到底应该访问哪一台 Server。

### 3.3 BranchRegister - 分支事务注册

当全局事务在 TM 开启之后，RM 的分支事务也需要注册到全局事务之上，这里看看是如何处理的：

![分支事务注册](https://cdn.nlark.com/yuque/0/2019/png/226702/1554712795959-81b1f164-be0c-4439-91e5-c78bda839b3a.png)

step1：通过 transactionId 获取并校验全局事务是否是开启状态。

step2：创建一个新的分支事务，也就是 BranchSession。

step3：对分支事务进行加全局锁，这里的逻辑就是使用锁模块的逻辑。

step4：添加 branchSession，主要是将其添加到 globalSession 对象中，并写入到我们的文件中。

step5：返回 branchId，这个 ID 也很重要，我们后续需要用它来回滚我们的事务，或者对我们分支事务状态更新。

分支事务注册之后，还需要汇报分支事务的后续状态到底是成功还是失败，在 Server 目前只是简单的做一下保存记录，汇报的目的是，就算这个分支事务失败，如果 TM 还是执意要提交全局事务，那么再遍历提交分支事务的时候，这个失败的分支事务就不需要提交。

### 3.4 GlobalCommit - 全局提交

当分支事务执行完成之后，就轮到 TM-事务管理器来决定是提交还是回滚，如果是提交，那么就会走到下面的逻辑：

![全局提交](https://cdn.nlark.com/yuque/0/2019/png/226702/1554712795948-66403baf-5745-4c47-afb8-d3fb4c5e925f.png)

step1：首先找到 globalSession。如果他为 Null 证明已经被 commit 过了，那么直接幂等操作，返回成功。

step2：关闭  GloabSession 防止再次有新的 branch 进来。

step3：如果 status 是等于 Begin，那么久证明还没有提交过，改变其状态为 Committing 也就是正在提交。

step4：判断是否是可以异步提交，目前只有AT模式可以异步提交，因为是通过 Undolog 的方式去做的。MT 和 TCC 都需要走同步提交的代码。

step5：如果是异步提交，直接将其放进 ASYNC_COMMITTING_SESSION_MANAGER，让其再后台线程异步去做  step6，如果是同步的那么直接执行 step6。

step6：遍历 BranchSession 进行提交，如果某个分支事务失败，根据不同的条件来判断是否进行重试，异步不需要重试，因为其本身都在 manager 中，只要没有成功就不会被删除会一直重试，如果是同步提交的会放进异步重试队列进行重试。

### 3.5 GlobalRollback - 全局回滚

如果我们的 TM 决定全局回滚，那么会走到下面的逻辑：

![全局回滚](https://cdn.nlark.com/yuque/0/2019/png/226702/1554712796004-71279d70-0422-4c44-b4c9-74a841d115a6.png)

这个逻辑和提交流程基本一致，可以看作是他的反向，这里就不展开讲了。

## 4.总结

最后在总结一下开始我们提出了分布式事务的关键四点，Seata 到底是怎么解决的：

- 正确的协调：通过后台定时任务各种正确的重试，并且未来会推出监控平台有可能可以手动回滚。
- 高可用: 通过 HA-Cluster 保证高可用。
- 高性能：文件顺序写，RPC 通过 netty 实现，Seata 未来可以水平扩展，提高处理性能。
- 高扩展性：提供给用户可以自由实现的地方，比如配置，服务发现和注册，全局锁等等。

最后希望大家能从这篇文章能了解 Seata-Server 的核心设计原理，当然你也可以想象如果你自己去实现一个分布式事务的 Server 应该怎样去设计？

## 文中涉及的相关链接

- Seata github 地址：<https://github.com/seata/seata>
- 延伸阅读：[蚂蚁金服分布式事务开源以及实践 | SOFA 开源一周年献礼](https://www.sofastack.tech/blog/sofa-meetup-1-seata/)