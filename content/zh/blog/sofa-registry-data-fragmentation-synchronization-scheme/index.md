---
title: "服务注册中心数据分片和同步方案详解 | SOFARegistry 解析"
author: "明不二"
authorlink: "https://github.com/mingxing47"
description: " 本文为《剖析 |  SOFARegistry 框架》第四篇，作者明不二"
categories: "SOFARegistry"
tags: ["SOFARegistry","剖析 | SOFARegistry 框架","SOFALab"]
date: 2019-10-10T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1570697312166-2572aeac-1f43-4136-b1f1-75caf0ee15b0.png"
---

> SOFAStack （**S**calable **O**pen **F**inancial  **A**rchitecture Stack） 是蚂蚁金服自主研发的金融级分布式架构，包含了构建金融级云原生架构所需的各个组件，是在金融场景里锤炼出来的最佳实践。

![SOFA：RegistryLab 数据分片和同步方案](https://cdn.nlark.com/yuque/0/2019/png/226702/1569817528652-6d2da01c-7494-4305-8609-67d4485cc879.png)

SOFARegistry 是蚂蚁金服开源的具有承载海量服务注册和订阅能力的、高可用的服务注册中心，在支付宝/蚂蚁金服的业务发展驱动下，近十年间已经演进至第五代。

本文为《剖析 | SOFARegistry 框架》第四篇，**本篇作者明不二**。《剖析 | SOFARegistry 框架》系列由 SOFA 团队和源码爱好者们出品，项目代号：<SOFA:RegistryLab/>，文末包含往期系列文章。

GitHub 地址：[https://github.com/sofastack/sofa-registry](https://github.com/sofastack/sofa-registry)

## 概述

在前面的章节中我们已经提到，SOFARegistry 与其他服务发现领域的产品相比，最大的不同点在于支持海量数据。本章即将讲述 SOFARegistry 在支撑海量数据上的一些特性。

本文将从如下几个方面进行讲解：

- **DataServer 总体架构**：对 SOFARegistry 中支持海量数据的总体架构做一个简述，讲解数据分片和同步方案中所涉及到的关键技术点；
- **DataServer 启动**：讲解 DataServer 启动的服务，从而为接下来更直观地理解数据分片、数据同步的触发时机以及触发方式等做一个铺垫；
-  **数据分片**：讲解 SOFARegistry 中采用的一致性 Hash 算法进行数据分片的缘由以及具体实现方法；
- **数据同步方案**：讲解 SOFARegistry 采用的数据同步方案；

## DataServer 总体架构

在大部分的服务注册中心系统中，每台服务器都存储着全量的服务注册数据，服务器之间通过一致性协议（paxos、Raft 等）实现数据的复制，或者采用只保障最终一致性的算法，来实现异步数据复制。这样的设计对于一般业务规模的系统来说没有问题，而当应用于有着海量服务的庞大的业务系统来说，就会遇到性能瓶颈。

为解决这一问题，SOFARegistry 采用了数据分片的方法。全量服务注册数据不再保存在单机里，而是分布于每个节点中，每台服务器保存一定量的服务注册数据，同时进行多副本备份，从理论上实现了服务无限扩容，且实现了高可用，最终达到支撑海量数据的目的。

在各种数据分片算法中，SOFARegistry 采用了业界主流的一致性 Hash 算法做数据分片，当节点动态扩缩容时，数据仍能均匀分布，维持数据的平衡。

在数据同步时，没有采用与 Dynamo、Casandra、Tair、Codis、Redis cluster 等项目中类似的预分片机制，而是在 DataServer 内存里以 dataInfoId 为粒度进行操作日志记录，这种实现方式在某种程度上也实现了“预分片”，从而保障了数据同步的有效性。

![图 1 SOFARegistry 总体架构图](https://cdn.nlark.com/yuque/0/2019/png/156644/1569732221022-027a06a7-69c9-4a6b-bb86-081704e42f24.png)

图 1 SOFARegistry 总体架构图

## DataServer 启动

### 启动入口

DataServer 模块的各个 bean 在 JavaConfig 中统一配置，JavaConfig 类为 DataServerBeanConfiguration， 启动入口类为 DataServerInitializer，该类不由 JavaConfig 管理配置，而是继承了 SmartLifecycle 接口，在启动时由 Spring 框架调用其 start 方法。

该方法中调用了 DataServerBootstrap#start 方法（图 2），用于启动一系列的初始化服务。

从代码中可以看出，DataServer 服务在启动时，会启动 DataServer、DataSyncServer、HttpServer 三个 bolt 服务。在启动这些 Server 之时，DataServer 注册了一系列 Handler 来处理各类消息。

![图2 DataServerBootstrap 中的 start 方法](https://cdn.nlark.com/yuque/0/2019/png/156644/1569713909310-c8ab9b3c-e76e-49b7-9818-abc345ceb2f3.png)

图2 DataServerBootstrap 中的 start 方法

这几个 Server 的作用如下：

- DataServer：数据服务，获取数据的推送，服务上下线通知等；
- DataSyncServer：数据同步服务；
- HttpServer：提供一系列 REST 接口，用于 dashboard 管理、数据查询等；

各 Handler 具体作用如图 3 所示：

![图 3 各 Handler 作用](https://cdn.nlark.com/yuque/0/2019/jpeg/156644/1570494168710-750a1389-995d-416c-937a-1b3a081e8488.jpeg)

图 3 各 Handler 作用

同时启动了 RaftClient 用于保障 DataServer 节点之间的分布式一致性，启动了各项启动任务，具体内容如图 4 所示：

![图 4 DataServer 各项启动任务](https://cdn.nlark.com/yuque/0/2019/png/156644/1570494987558-f75da46b-bfb9-46cc-a851-4ae7cf26dd48.png)

图 4 DataServer 各项启动任务

各个服务的启动监听端口如图 5 所示：

![图5 监听端口](https://cdn.nlark.com/yuque/0/2019/png/156644/1569832055473-fc0f2e95-a2b1-4a53-8399-a0f0de423a74.png)

图5 监听端口

### 其他初始化 Bean

除上述的启动服务之外，还有一些 bean 在模块启动时被初始化, 系统初始化时的 bean 都在 DataServerBeanConfiguration 里面通过 JavaConfig 来注册，主要以如下几个配置类体现（配置类会有变更，具体内容可以参照源码实现）：

- DataServerBootstrapConfigConfiguration：该配置类主要作用是提供一些 DataServer 服务启动时基本的 Bean，比如 DataServerConfig 基础配置 Bean、DataNodeStatus 节点状态 Bean、DatumCache 缓存 Bean 等；

- LogTaskConfigConfiguration：该配置类主要用于提供一些日志处理相关的 Bean；

- SessionRemotingConfiguration：该配置类主要作用是提供一些与 SessionServer 相互通信的 Bean，以及连接过程中的一些请求处理 Bean。比如 BoltExchange、JerseyExchange 等用于启动服务的 Bean，还有节点上下线、数据发布等的 Bean，为关键配置类；

- DataServerNotifyBeanConfiguration：该配置类中配置的 Bean 主要用于进行事件通知，如用于处理数据变更的 DataChangeHandler 等；

- DataServerSyncBeanConfiguration：该配置类中配置的 Bean 主要用于数据同步操作；

- DataServerEventBeanConfiguration：该配置类中配置的 Bean 主要用于处理与数据节点相关的事件，如事件中心 EventCenter、数据变化事件中心 DataChangeEventCenter 等；

- DataServerRemotingBeanConfiguration：该配置类中配置的 Bean 主要用于 DataServer 的连接管理；

- ResourceConfiguration：该配置类中配置的 Bean 主要用于提供一些 Rest 接口资源；

- AfterWorkingProcessConfiguration：该配置类中配置一些后处理 Handler Bean，用于处理一些业务逻辑结束后的后处理动作；

- ExecutorConfiguration：该配置类主要配置一些线程池 Bean，用于执行不同的任务；

## 数据分片讲解

数据分片机制是 SOFARegistry 支撑海量数据的核心所在，DataServer 负责存储具体的服务数据，数据按照 dataInfoId 进行一致性 Hash 分片存储，支持多副本备份，保证数据的高可用。

（对一致性 Hash 算法感兴趣想深入了解的同学可以阅读该算法的提出者 Karger 及其合作者的原始论文：[_Consistent hashing and random trees: distributed caching protocols for relieving hot spots on the World Wide Web_](https://www.akamai.com/us/en/multimedia/documents/technical-publication/consistent-hashing-and-random-trees-distributed-caching-protocols-for-relieving-hot-spots-on-the-world-wide-web-technical-publication.pdf)。）

在讲解 SOFARegistry 的数据分片之前，我们先看下最简单的传统数据分片 Hash 算法。

### 传统数据分片 Hash 算法

在传统的数据分片算法中，先对每个节点的 ID 进行 1 到 K 的标号，然后再对每个要存储到节点上的数据使用 Hash 算法，计算之后的值对 K 取模，所得结果就是要落在的节点 ID。

该算法简单且常用，很多场景中都使用该算法进行数据分片。

![图 6 传统 Hash 分片算法](https://cdn.nlark.com/yuque/0/2019/png/156644/1569716256070-8be4f8c3-bce4-4cf3-9dfd-8a7472965220.png)
图 6 传统 Hash 分片算法

在这种算法下，当某个节点下线（如图 6 中的 Node 2），该节点之后的所有节点需要重新标号。所有数据要重新求 Hash 值取模，再重新存储到相应节点中。（图 7）

在海量数据场景下，该方式将会带来很大的性能开销。

![图 7 传统 Hash 分片算法，某个节点下线后将影响全局数据分布](https://cdn.nlark.com/yuque/0/2019/png/156644/1569716828680-58e1e6e7-f314-461b-97fd-14d910664b67.png)

图 7 传统 Hash 分片算法，某个节点下线后将影响全局数据分布

### 传统一致性 Hash 进行数据分片

为了使服务节点上下线不会影响到全局数据的分布，在实际的生产环境中，很多系统使用的是一致性 Hash 算法进行数据分片。业界使用一致性 Hash 的代表项目有 Memcached、Twemproxy 等。

#### 数据范围

一致性 Hash 算法采用了 $$2^{32}$$ 个桶来存储所有的 Hash 值，0 ~ $$2^{32}-1$$ 作为取值范围，并且形成一个环。

#### 数据分片原则

在图 8 中，NodeA#1、NodeB#1、NodeC#1 分别为 A、B、C 三个节点的 ID 经过一致性 Hash 算法的计算后落在环上的位置。

三角形为不同的数据经过一致性 Hash 算法之后落在环上的位置。每个数据经过顺时针，找寻最近的一个节点，作为数据存储的节点。

![图 8 一致性 Hash 算法](https://cdn.nlark.com/yuque/0/2019/png/156644/1569718275433-54b56de6-c11e-4156-9d49-6d0288ca1ba3.png)

图 8 一致性 Hash 算法

从图 8 中不难想到，当有节点上下线时，仅仅影响到上下线节点与该节点逆时针方向最近的一个节点之间的数据分布。此时，只需要对掉落到这个区间内的数据重排即可。（如图 9）

![图 9 一致性 Hash 算法中 NodeB#1 下线](https://cdn.nlark.com/yuque/0/2019/png/156644/1569730734398-81bb1054-8380-4aae-8cb8-774b20355239.png)

图 9 一致性 Hash 算法中 NodeB#1 下线

#### 一致性 Hash 算法特点

该算法中，每个节点的 ID 需要通过一致性 Hash 算法计算后映射到圆环上，以此带来了一致性 Hash 算法的两个特点：

- 当节点总量较少时，可以虚拟多个虚拟节点（如图 10，实际中可能会交叉排布，在这里方便描述则放在一起），当虚拟节点足够多时，可以保障数据在真实节点上面能够均匀分散分布，这是一致性 Hash 算法的优点；
- 采用一致性 Hash 之后，数据在节点环中的分布范围不固定。当节点动态扩缩容之后，部分数据要重新分布，在数据同步时会带来一定的问题；

![图 10 虚拟节点排布](https://cdn.nlark.com/yuque/0/2019/png/156644/1569713380447-5193f0b3-0865-458e-9232-813461bd77d0.png)

图 10 虚拟节点排布

#### SOFARegistry 的一致性 Hash 代码实现

在 SOFARegistry 中，由 ConsistentHash 类来实现一致性 Hash 类图，如图 11 所示：

![图 11 SOFARegistry 的一致性 Hash 类图](https://cdn.nlark.com/yuque/0/2019/png/156644/1569733366164-0e20c2d8-2e21-4aba-969b-1354450aa3a7.png)

图 11 SOFARegistry 的一致性 Hash 类图

在该类中，SIGN 为 ID 的分隔符，numberOfReplicas 则是每个节点的虚拟节点数，realNodes 为节点列表，hashFunction 为采用的 Hash 算法，circle 为预分片机制中的 Hash 环。

ConsistentHash 默认采用了 MD5 摘要算法来进行 hash，同时构造函数支持 hash 函数定制化，用户可以定制自己的 Hash 算法。同时，该类中 circle 的实现为 TreeMap，巧妙地使用了 TreeMap 的 tailMap() 方法来实现一致性 Hash 的节点查找能力，数据最近的节点 hash 值计算代码如图 12 所示：

![图 12 数据最近节点 hash 值计算方法](https://cdn.nlark.com/yuque/0/2019/png/156644/1569733629003-d42cc055-99c2-41eb-a61a-99c2d9880bb4.png)

图 12 数据最近节点 hash 值计算方法

### 预分片机制

传统的一致性 Hash 算法有数据分布范围不固定的特性，该特性使得服务注册数据在服务器节点宕机、下线、扩容之后，需要重新存储排布，这为数据的同步带来了困难。大多数的数据同步操作是利用操作日志记录的内容来进行的，传统的一致性 Hash 算法中，数据的操作日志是以节点分片来划分的，节点变化导致数据分布范围的变化。

在计算机领域，大多数难题都可以通过增加一个中间层来解决，那么对于数据分布范围不固定所导致的数据同步难题，也可以通过同样的思路来解决。

这里的问题在于，当节点下线后，若再以当前存活节点 ID 一致性 Hash 值去同步数据，就会导致已失效节点的数据操作日志无法获取到，既然数据存储在会变化的地方无法进行数据同步，那么如果把数据存储在不会变化的地方是否就能保证数据同步的可行性呢？答案是肯定的，这个中间层就是预分片层，通过把数据与预分片这个不会变化的层相互对应就能解决这个数据同步的难题。

目前业界主要代表项目如 Dynamo、Casandra、Tair、Codis、Redis
cluster 等，都采用了预分片机制来实现这个不会变化的层。

事先将数据存储范围等分为 N 个 slot 槽位，数据直接与 slot 相对应，数据的操作日志与相应的 solt 对应，slot 的数目不会因为节点的上下线而产生变化，由此保证了数据同步的可行性。除此之外，还需要引进“路由表”的概念，如图 13，“路由表”负责存放每个节点和 N 个 slot 的映射关系，并保证尽量把所有 slot 均匀地分配给每个节点。这样，当节点上下线时，只需要修改路由表内容即可。保持 slot 不变，即保证了弹性扩缩容，也大大降低了数据同步的难度。

![图 13 预分片机制](https://cdn.nlark.com/yuque/0/2019/png/156644/1570500476736-95428b89-865c-484a-a8a6-7b01a177ec81.png)

图 13 预分片机制

### SOFARegistry 的分片选择

SOFARegistry 为了实现服务注册数据的分布式存储，采用了基于一致性 Hash 的数据分片。而由于历史原因，为了实现数据在节点间的同步，则采用了在 DataServer 之间以 dataInfoId 为粒度进行数据同步。

#### 节点分片

当 DataServer 节点初始化成功后，会启动任务自动去连接 MetaServer。该任务会往事件中心 EventCenter 注册一个 DataServerChangeEvent 事件，该事件注册后会被触发，之后将对新增节点计算 Hash 值，同时进行纳管分片。

DataServerChangeEvent 事件被触发后，由 DataServerChangeEventHandler 来进行相应的处理，分别分为如下一些步骤：

1. 初始化当前数据节点的一致性 Hash 值，把当前节点添加进一致性的 Hash 环中。（图 14）

![图 14 初始化一致性 Hash 环](https://cdn.nlark.com/yuque/0/2019/png/156644/1570681045318-4b807fc4-7396-4064-88dc-228c71f95e5e.png)

图 14 初始化一致性 Hash 环

2. 获取变更了的 DataServer 节点，这些节点在启动 DataServer 服务的时候从 MetaServer 中获取到的，并且通过 DataServerChangeEvent 事件中的 DataServerChangeItem 传入。（图 15）

![图 15 获取变更了的 DataServer 节点](https://cdn.nlark.com/yuque/0/2019/png/156644/1570684509325-abc9adab-e35b-4f23-a433-e24c135daaab.png)

图 15 获取变更了的 DataServer 节点

3. 获取了当前的 DataServer 节点之后，若节点列表非空，则遍历每个节点，建立当前节点与其余数据节点之间的连接，同时删除本地维护的不在节点列表中的节点数据。同时，若当前节点是 DataCenter 节点，则触发 LocalDataServerChangeEvent 事件。

至此，节点初始化以及分片入 Hash 环的工作已经完成。

数据节点相关数据，储存在 Map 中，相关的数据结构如图 16 所示。

![图 16 DataServer 节点一致性 Hash 存储结构](https://cdn.nlark.com/yuque/0/2019/png/156644/1570683526240-56e96bb3-6a77-48a9-a4d5-ad950b0dd961.png)

图 16 DataServer 节点一致性 Hash 存储结构

#### 数据分片

当服务上线时，会计算新增服务的 dataInfoId Hash 值，从而对该服务进行分片，最后寻找最近的一个节点，存储到相应的节点上。

前文已经说过，DataServer 服务在启动时添加了 publishDataProcessor 来处理相应的服务发布者数据发布请求，该 publishDataProcessor 就是 PublishDataHandler。当有新的服务发布者上线，DataServer 的 PublishDataHandler 将会被触发。

该 Handler 首先会判断当前节点的状态，若是非工作状态则返回请求失败。若是工作状态，则触发数据变化事件中心 DataChangeEventCenter 的 onChange 方法。

DataChangeEventQueue 中维护着一个 DataChangeEventQueue 队列数组，数组中的每个元素是一个事件队列。当上文中的 onChange 方法被触发时，会计算该变化服务的 dataInfoId 的 Hash 值，从而进一步确定出该服务注册数据所在的队列编号，进而把该变化的数据封装成一个数据变化对象，传入到队列中。

DataChangeEventQueue#start 方法在 DataChangeEventCenter 初始化的时候被一个新的线程调用，该方法会源源不断地从队列中获取新增事件，并且进行分发。新增数据会由此添加进节点内，实现分片。

## 数据同步方案讲解

SOFARegistry 是 Client、SessionServer、DataServer 三层架构，同时通过 MetaServer 管理 Session 和 Data 集群，在服务注册的过程中，数据既有层间的数据同步，也有层内的节点间同步。

### 层内同步 —— 数据回放

Client 端在本地内存内已经存储了需要订阅和发布的服务数据，在连接上 Session 后会回放订阅和发布数据给 Session，最终再发布到 Data。同时，Session 存储着客户端发布的所有 Pub 数据，定期通过数据比对保持和 Data 一致性。当数据发生变更时，持有数据一方的 Data 发起变更通知，需要同步的 SessionServer 进行版本对比，在判断出数据需要更新时，将拉取最新的数据操作日志。

操作日志存储采用堆栈方式，获取日志是通过当前版本号在堆栈内所处位置，把所有版本之后的操作日志同步过来执行。

### 层间同步 —— 多副本

为保障 Data 层数据的可用性，SOFARegistry 做了 Data 层的多副本机制。当有 Data 节点缩容、宕机发生时，备份节点可以立即通过备份数据生效成为主节点，对外提供服务，并且把相应的备份数据再按照新列表计算备份给新的节点。

当有 Data 节点扩容时，新增节点进入初始化状态，期间禁止新数据写入，对于读取请求会转发到后续可用的 Data 节点获取数据。在其他节点的备份数据按照新节点信息同步完成后，新扩容的 Data 节点状态变成 Working，开始对外提供服务。

## 总结

在海量服务注册场景下，为保障 DataServer 能否无限扩容面对海量数据的业务场景，与其他服务注册中心不同的是，SOFARegistry 采用了一致性 Hash 算法进行数据分片，保障了数据的可扩展性。同时，通过在 DataServer 内存里以 dataInfoId 的粒度记录操作日志，并且在 DataServer 之间也是以 dataInfoId 的粒度去做数据同步，保障了数据的一致性。

## SOFARegistryLab 系列阅读

- [服务注册中心 MetaServer 功能介绍和实现剖析 | SOFARegistry 解析](/blog/sofa-registry-metaserver-function-introduction/)
- [服务注册中心 SOFARegistry 解析 | 服务发现优化之路](/blog/sofa-registry-service-discovery-optimization/)
- [海量数据下的注册中心 - SOFARegistry 架构介绍](/blog/sofa-registry-introduction/)
