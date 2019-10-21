---
title: "海量数据下的注册中心 - SOFARegistry 架构介绍"
author: "琪祥"
authorlink: "https://github.com/atellwu"
description: "本文为《剖析 | SOFARegistry 框架》第一篇，本篇作者琪祥。"
categories: "SOFARegistry"
tags: ["SOFARegistry","剖析 | SOFARegistry 框架","SOFALab"]
date: 2019-04-25T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563516448245-2113c18e-d1a2-4700-ab03-d7e70a9ec23f.png"
---

> SOFAStack
> **S**calable **O**pen **F**inancial **A**rchitecture Stack 是蚂蚁金服自主研发的金融级分布式架构，包含了构建金融级云原生架构所需的各个组件，是在金融场景里锤炼出来的最佳实践。 
> SOFARegistry 是蚂蚁金服开源的具有承载海量服务注册和订阅能力的、高可用的服务注册中心，最早源自于淘宝的初版 ConfigServer，在支付宝/蚂蚁金服的业务发展驱动下，近十年间已经演进至第五代。
> GitHub 地址：[https://github.com/sofastack/sofa-registry ](https://github.com/sofastack/sofa-registry)

3 月 31 日，蚂蚁金服正式开源了内部演进了近 10 年的注册中心产品-SOFARegistry。先前的文章介绍了 SOFARegistry 的演进之路，而本文主要对 SOFARegistry 整体架构设计进行剖析，并着重介绍一些关键的设计特点，期望能帮助读者对 SOFARegistry 有更直接的认识。

如有兴趣，也欢迎加入《剖析 | SOFARegistry  实现原理》系列的共建，认领列表见文末。

## 服务注册中心是什么

不可免俗地，先介绍一下服务注册中心的概念。对此概念已经了解的读者，可选择跳过本节。

![RPC 调用的服务寻址](https://cdn.nlark.com/yuque/0/2019/png/226702/1556089042588-bf7954a2-55c2-411a-8111-5bd9f95932c2.png)

如上图，服务注册中心最常见的应用场景是用于 RPC 调用的服务寻址，在 RPC 远程过程调用中，存在 2 个角色，一个服务发布者（Publisher）、另一个是服务订阅者（Subscriber）。Publisher 需要把服务注册到服务注册中心（Registry），发布的内容通常是该 Publisher 的 IP 地址、端口、调用方式 （协议、序列化方式）等。而 Subscriber 在第一次调用服务时，会通过 Registry 找到相应的服务的 IP 地址列表，通过负载均衡算法从 IP 列表中取一个服务提供者的服务器调用服务。同时 Subscriber 会将 Publisher 的服务列表数据缓存到本地，供后续使用。当 Subscriber 后续再调用 Publisher 时，优先使用缓存的地址列表，不需要再去请求Registry。

![RPC 调用服务寻址-1](https://cdn.nlark.com/yuque/0/2019/png/226702/1556089042577-8c96ebea-f584-4fb3-9fa4-2120dbdb3079.png)

如上图，Subscriber 还需要能感知到 Publisher 的动态变化。比如当有 Publisher 服务下线时， Registry 会将其摘除，随后 Subscriber 感知到新的服务地址列表后，不会再调用该已下线的 Publisher。同理，当有新的 Publisher 上线时，Subscriber 也会感知到这个新的 Publisher。

## 初步认识

![服务注册中心](https://cdn.nlark.com/yuque/0/2019/png/300999/1556122372167-ea48951f-8e6f-4895-8837-2c957a9b0c3b.png)

在理解了常见的服务注册中心的概念之后，我们来看看蚂蚁金服的 SOFARegistry 长什么样子。如上图，SOFARegistry 包含 4 个角色：

1. Client

提供应用接入服务注册中心的基本 API 能力，应用系统通过依赖客户端 JAR 包，通过编程方式调用服务注册中心的服务订阅和服务发布能力。

2. SessionServer

会话服务器，负责接受 Client 的服务发布和服务订阅请求，并作为一个中间层将写操作转发 DataServer 层。SessionServer 这一层可随业务机器数的规模的增长而扩容。

3. DataServer

数据服务器，负责存储具体的服务数据，数据按 dataInfoId 进行一致性 Hash 分片存储，支持多副本备份，保证数据高可用。这一层可随服务数据量的规模的增长而扩容。

4. MetaServer

元数据服务器，负责维护集群 SessionServer 和 DataServer 的一致列表，作为 SOFARegistry 集群内部的地址发现服务，在 SessionServer 或 DataServer 节点变更时可以通知到整个集群。

## 产品特点

![服务注册中心的特性对比](https://cdn.nlark.com/yuque/0/2019/png/226702/1556089042580-169958d4-b325-4b9a-8182-21d71cd70536.png)

（图片改编自 [https://luyiisme.github.io/2017/04/22/spring-cloud-service-discovery-products](https://luyiisme.github.io/2017/04/22/spring-cloud-service-discovery-products) ）

首先放一张常见的服务注册中心的特性对比，可以看出，在这些 Feature 方面，SOFARegistry 并不占任何优势。那么，我们为什么还开源这样的一个系统？SOFARegistry 开源的优势是什么？下面将着重介绍 SOFARegistry 的特点。

### 支持海量数据

大部分的服务注册中心系统，每台服务器都是存储着全量的服务注册数据，服务器之间依靠一致性协议（如 Paxos/Raft/2PC 等）实现数据的复制，或者只保证最终一致性的异步数据复制。“每台服务器都存储着全量的服务注册数据”，在一般规模下是没问题的。但是在蚂蚁金服庞大的业务规模下，服务注册的数据总量早就超过了单台服务器的容量瓶颈。

SOFARegistry 基于一致性 Hash 做了数据分片，每台 DataServer 只存储一部分的分片数据，随数据规模的增长，只要扩容 DataServer 服务器即可。这是相对服务发现领域的其他竞品来说最大的特点，详细介绍见后面《如何支持海量数据》一节。

### 支持海量客户端

SOFARegistry 集群内部使用分层的架构，分别为连接会话层（SessionServer）和数据存储层（DataServer）。SessionServer 功能很纯粹，只负责跟 Client 打交道，SessionServer 之间没有任何通信或数据复制，所以随着业务规模（即 Client 数量）的增长，SessionServer 可以很轻量地扩容，不会对集群造成额外负担。

相比之下，其他大多数的服务发现组件，如 eureka，每台服务器都存储着全量的数据，依靠 eurekaServer 之间的数据复制来传播到整个集群，所以每扩容 1 台 eurekaServer，集群内部相互复制的数据量就会增多一份。再如 Zookeeper 和 Etcd 等强一致性的系统，它们的复制协议（Zab/Raft）要求所有写操作被复制到大多数服务器后才能返回成功，那么增加服务器还会影响写操作的效率。

### 秒级的服务上下线通知

对于服务的上下线变化，SOFARegistry 使用推送机制，快速地实现端到端的传达。详细介绍见后面《秒级服务上下线通知》一节。

接下来，我将围绕这些特点，讲解 SOFARegistry 的关键架构设计原理。

### 高可用

各个角色都有 failover 机制：

- MetaServer 集群部署，内部基于 Raft 协议选举和复制，只要不超过 1/2 节点宕机，就可以对外服务。
- DataServer 集群部署，基于一致性 Hash 承担不同的数据分片，数据分片拥有多个副本，一个主副本和多个备副本。如果 DataServer 宕机，MetaServer 能感知，并通知所有 DataServer 和 SessionServer，数据分片可 failover 到其他副本，同时 DataServer 集群内部会进行分片数据的迁移。
- SessionServer 集群部署，任何一台 SessionServer 宕机时 Client 会自动 failover 到其他 SessionServer，并且 Client 会拿到最新的 SessionServer 列表，后续不会再连接这台宕机的 SessionServer。

## 数据模型

### 模型介绍

![模型介绍](https://cdn.nlark.com/yuque/0/2019/png/226702/1556089042608-4cd03b6a-df50-45b6-8d28-5d3719c7142a.png)

注意：这里只列出核心的模型和字段，实际的代码中不止这些字段，但对于读者来说，只要理解上述模型即可。

**服务发布模型（PublisherRegister）**

- dataInfoId：服务唯一标识，由`<dataId>`、`<分组 group>`和`<租户 instanceId>`构成，例如在 SOFARPC 的场景下，一个 dataInfoId 通常是 `com.alipay.sofa.rpc.example.HelloService#@#SOFA#@#00001`，其中SOFA 是 group 名称，00001 是租户 id。group 和 instance 主要是方便对服务数据做逻辑上的切分，使不同 group 和 instance 的服务数据在逻辑上完全独立。模型里有 group 和 instanceId 字段，但这里不额外列出来，读者只要理解 dataInfoId 的含义即可。
- zone：是一种单元化架构下的概念，代表一个机房内的逻辑单元，通常一个物理机房（Datacenter）包含多个逻辑单元（zone），更多内容可参考 [异地多活单元化架构解决方案](https://tech.antfin.com/solutions/multiregionldc)。在服务发现场景下，发布服务时需指定逻辑单元（zone），而订阅服务者可以订阅逻辑单元（zone）维度的服务数据，也可以订阅物理机房（datacenter）维度的服务数据，即订阅该 datacenter 下的所有 zone 的服务数据。
- dataList：服务注册数据，通常包含“协议”、“地址”和“额外的配置参数”，例如 SOFARPC 所发布的数据类似`bolt://192.168.1.100:8080?timeout=2000`”。这里使用 dataList，表示一个 PublisherRegister 可以允许同时发布多个服务数据（但是通常我们只会发布一个）。

**服务订阅模型（SubscriberRegister）**

- dataInfoId：服务唯一标识，上面已经解释过了。
- scope： 订阅维度，共有 3 种订阅维度：zone、dataCenter 和 global。zone 和 datacenter 的意义，在上述有关“zone”的介绍里已经解释。global 维度涉及到机房间数据同步的特性，目前暂未开源。

关于“zone”和“scope”的概念理解，这里再举个例子。如下图所示，物理机房内有 ZoneA 和 ZoneB 两个单元，PublisherA 处于 ZoneA 里，所以发布服务时指定了 zone=ZoneA，PublisherB 处于 ZoneB 里，所以发布服务时指定了 zone=ZoneB；此时 Subscriber 订阅时指定了 scope=datacenter 级别，因此它可以获取到 PublisherA 和 PublisherB （如果 Subscriber 订阅时指定了 scope=zone 级别，那么它只能获取到 PublisherA）。

![服务订阅模型](https://cdn.nlark.com/yuque/0/2019/png/226702/1556089042599-31e919e5-60e7-4818-9d45-c445998a9b99.png)

服务注册和订阅的示例代码如下 （详细可参看官网的《[客户端使用](https://www.sofastack.tech/sofa-registry/docs/Client-QuickStart)》文档）：

```java
// 构造发布者注册表，主要是指定dataInfoId和zone
PublisherRegistration registration = new PublisherRegistration("com.alipay.test.demo.service");
registration.setZone("ZoneA");

// 发布服务数据，dataList内容是 "10.10.1.1:12200?xx=yy"，即只有一个服务数据
registryClient.register(registration, "10.10.1.1:12200?xx=yy");
```

发布服务数据的代码示例

```java
// 构造订阅者，主要是指定dataInfoId，并实现回调接口
SubscriberRegistration registration = new SubscriberRegistration("com.alipay.test.demo.service",
                (dataId, userData) -> System.out
                        .println("receive data success, dataId: " + dataId + ", data: " + userData));
// 设置订阅维度，ScopeEnum 共有三种级别 zone, dataCenter, global
registration.setScopeEnum(ScopeEnum.dataCenter);

// 将注册表注册进客户端并订阅数据，订阅到的数据会以回调的方式通知
registryClient.register(registration);
```

订阅服务数据的代码示例

SOFARegistry 服务端在接收到“服务发布（PublisherRegister）”和“服务订阅（SubscriberRegister）”之后，在内部会汇总成这样的一个逻辑视图。

![SOFARegistry 服务端逻辑视图](https://cdn.nlark.com/yuque/0/2019/png/300999/1556122550983-1ebf9b1d-c38e-4e55-b921-8b503927af8a.png)

注意，这个树形图只是逻辑上存在，实际物理上 publisherList 和 subscriberList 并不是在同一台服务器上，publisherList 是存储在 DataServer 里，subscriberList 是存储在 SessionServer 里。

### 业界产品对比

可以看出来，SOFARegistry 的模型是非常简单的，大部分服务注册中心产品的模型也就这么简单。比如 eureka 的核心模型是应用（Application）和实例（InstanceInfo），如下图，1 个 Application 可以包含多个 InstanceInfo。eureka 和 SOFARegistry 在模型上的主要区别是，eureka 在语义上是以应用（Application）粒度来定义服务的，而SOFARegistry 则是以 dataInfoId 为粒度，由于 dataInfoId 实际上没有强语义，粗粒度的话可以作为应用来使用，细粒度的话则可以作为 service 来使用。基于以上区别，SOFARegistry 能支持以接口为粒度的 SOFARPC 和 Dubbo，也支持以应用为粒度的 SpringCloud，而 eureka 由于主要面向应用粒度，因此最多的场景是在springCloud 中使用，而 Dubbo 和 SOFAPRC 目前均未支持 eureka。

另外，eureka 不支持 watch 机制（只能定期 fetch），因此不需要像 SOFARegistry 这样的 Subscriber 模型。

![eureka 的核心模型](https://cdn.nlark.com/yuque/0/2019/png/226702/1556089042666-6bd10df3-6040-45e4-a59a-3436b249cf9f.png)

（图片摘自简书）

最后再展示一下 SOFARPC 基于 Zookeeper 作为服务注册中心时，在 Zookeeper 中的数据结构（如下图），Provider/Consumer 和 SOFARegistry 的 Publisher/Subscriber 类似，最大的区别是 SOFARegistry 在订阅的维度上支持 scope（zone/datacenter），即订阅范围。

![SOFARegistry 订阅范围](https://cdn.nlark.com/yuque/0/2019/png/226702/1556089042625-afe5a1f8-fac9-4d85-b2a8-0a795433179d.png)

## 如何支持海量客户端

从前面的架构介绍中我们知道，SOFARegistry 存在数据服务器（DataServer）和会话服务器（SessionServer）这 2 个角色。为了突破单机容量瓶颈，DataServer 基于一致性 Hash 存储着不同的数据分片，从而能支持蚂蚁金服海量的服务数据，这是易于理解的。但 SessionServer 存在的意义是什么？我们先来看看，如果没有SessionServer的话，SOFARegistry 的架构长什么样子：

![SOFARegistry 架构](https://cdn.nlark.com/yuque/0/2019/png/226702/1556089042636-3abbe47a-b698-4d6f-8482-3f35bfb89ff8.png)

如上图，所有 Client 在注册和订阅数据时，根据 dataInfoId 做一致性 Hash，计算出应该访问哪一台 DataServer，然后与该 DataServer 建立长连接。由于每个 Client 通常都会注册和订阅比较多的 dataInfoId 数据，因此我们可以预见每个 Client 均会与好几台 DataServer 建立连接。这个架构存在的问题是：“每台 DataServer 承载的连接数会随 Client 数量的增长而增长，每台 Client 极端的情况下需要与每台 DataServer 都建连，因此通过 DataServer 的扩容并不能线性的分摊 Client 连接数”。

讲到这里读者们可能会想到，基于数据分片存储的系统有很多，比如 Memcached、Dynamo、Cassandra、Tair 等，这些系统都也是类似上述的架构，它们是怎么考虑连接数问题的？其实业界也给出了答案，比如 twemproxy，twitter 开发的一个 memcached/redis 的分片代理，目的是将分片逻辑放到 twemproxy 这一层，所有 Client 都直接和 twemproxy 连接，而 twemproxy 负责对接所有的 memcached/Redis，从而减少 Client 直接对memcached/redis 的连接数。twemproxy 官网也强调了这一点：“It was built primarily to reduce the number of connections to the caching servers on the backend”，如下图，展示的是基于 twemproxy 的 redis 集群部署架构。类似 twemproxy 的还有 codis，关于 twemproxy 和 codis 的区别，主要是分片机制不一样，下节会再谈及。

![基于 twemproxy 的 redis 集群部署架构](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1556089042632-5db00416-4327-406f-b60f-b488fc84a85b.jpeg)

（图片摘自 `http://www.hanzhicaoa.com/1.php`）

当然也有一些分布式 KV 存储系统，没有任何连接代理层。比如 Tair （Alibaba 开源的分布式 KV 存储系统），只有 Client、DataServer、ConfigServer 这 3 个角色，Client 直接根据数据分片连接多台 DataServer。但蚂蚁金服内部在使用 Tair 时本身会按业务功能垂直划分出不同的 Tair 集群，所部署的机器配置也比较高，而且 Tair 的 Client 与 data server 的长连接通常在空闲一段时间后会关闭，这些都有助于缓解连接数的问题。当然，即便如此，Tair 的运维团队也在时刻监控着连接数的总量。

经过上面的分析，我们明白了为数据分片层（DataServer）专门设计一个连接代理层的重要性，所以 SOFARegistry 就有了 SessionServer 这一层。如图，随着 Client 数量的增长，可以通过扩容 SessionServer 就解决了单机的连接数瓶颈问题。

![数据分片层（DataServer）](https://cdn.nlark.com/yuque/0/2019/png/226702/1556089042679-0854d8eb-2e0b-49fb-840b-a79f668baa3d.png)

## 如何支持海量数据

面对海量数据，想突破单机的存储瓶颈，唯一的办法是将数据分片，接下来将介绍常见的有 2 种数据分片方式。

### 传统的一致性 Hash 分片

传统的一致性 Hash 算法，每台服务器被虚拟成 N 个节点，如下图所示（简单起见虚拟份数 N 设为 2 ）。每个数据根据 Hash 算法计算出一个值，落到环上后顺时针命中的第一个虚拟节点，即负责存储该数据。业界使用一致性 Hash 的代表项目有 Memcached、Twemproxy 等。

![传统的一致性 Hash 分片](https://cdn.nlark.com/yuque/0/2019/png/226702/1556089042646-d34cea36-1bde-4063-832d-ba60dcc70428.png)

一致性 Hash 分片的优点：在虚拟节点足够多的情况下，数据分片在每台节点上是非常分散均匀的，并且增加或减少节点的数量，还是能维持数据的平衡。比如当 Memcached 单机遇到内存瓶颈时，通过扩容 Memcached 机器，数据将会被重新均匀地分摊到新的节点上，因此每台 Memcached 服务器的内存就能得到降低。当某台服务器宕机时，数据会被重新均匀地分摊到剩余的节点上，如下图所示，A 机器宕机，原先在 A 机器上的数据会分别重新分摊到 B 机器和 C 机器。

![传统的一致性 Hash 分片优点](https://cdn.nlark.com/yuque/0/2019/png/226702/1556089042637-15da604b-142b-4798-8567-b26e0d761430.png)

一致性 Hash 分片的缺点：分片范围不固定（一旦节点数发生变化，就会导致分片范围变化）。严格来说，这不是一致性 Hash 的缺点，而是它的特点，这个特点在追求数据分散的场景下是优点，但在谈及数据复制的这个场景下它是个缺点。从上面的机器宕机过程，可以看到，仅扩缩容少量节点，就会影响到其他大部分已有节点的分片范围，即每台节点的分片范围会因为节点数变化而发生变化。如下图，当 A 宕机时，分片 6 和 1 合并成 7，分片 3 和 4 合并成 8，就是说，A 宕机后，B 和 C 的分片范围都发生了变化。

![传统的一致性 Hash 分片](https://cdn.nlark.com/yuque/0/2019/png/300999/1556153292075-253fa02c-16a3-4a12-a63f-1d78b0af0559.png)

“分片范围不固定”，带来的问题是：难以实现节点之间数据多副本复制。这个结论可能不太好理解，我举个例子：如果要实现节点之间数据能够复制，首先每个节点需要对数据分片保留操作日志，节点之间依靠这些操作日志进行增量的日志同步。比如上图的左半边，B 节点负责分片 1 和 5，因此 B 节点需要使用 2 个日志文件（假设叫做 data-1.log 和 data-5.log）记录这 2 个分片的所有更新操作。当 A 宕机时（上图的右半边），B 节点负责的分片变成 7 和 5，那么 data-1.log 日志文件就失效了，因为分片 1 不复存在。可见，在分片范围易变的情况下，保存数据分片的操作日志，并没有意义。这就是为什么这种情况下节点之间的日志复制不好实现的原因。

值得一提的是，Twemproxy 也是因为“分片范围不固定（一旦节点数发生变化，就会导致分片范围变化）”这个问题，所以不支持平滑的节点动态变化。比如使用 Twemproxy + Redis，如果要扩容 Redis 节点，那么需要用户自己实现数据迁移的过程，这也是后来 Codis 出现的原因。当然，对于不需要数据多副本复制的系统，比如 Memcached，由于它的定位是缓存，不保证数据的高可靠，节点之间不需要做数据多副本复制，所以不存在这个顾虑。

思考：对于那些需要基于数据多副本复制，来保证数据高可靠的 kv 存储系统，比如 Tair、dynamo 和 Cassandra，它们是怎么做数据分片的呢？

### 预分片机制 Pre-Sharding

预分片机制，理解起来比一致性 Hash 简单，首先需要从逻辑上将数据范围划分成 N 个大小相等的 slot，并且 slot 数量（即 N 值）后续不可再修改。然后，还需要引进“路由表”的概念，“路由表”负责存放这每个节点和 N 个slot 的映射关系，并保证尽量把所有 slot 均匀地分配给每个节点。在对数据进行路由时，根据数据的 key 计算出哈希值，再将 hash 值对 N 取模，这个余数就是对应 key 的 slot 位置。比如 Codis 默认将数据范围分成 1024 个 slots，对于每个 key 来说，通过以下公式确定所属的 slotId：`s_lotId = crc32（key） % 1024_`，根据 slotId 再从路由表里找到对应的节点。预分片机制的具体原理如下图。

![预分片机制的具体原理](https://cdn.nlark.com/yuque/0/2019/png/300999/1556096579961-897935d5-b0e3-47d3-a18f-ec94a55f6647.png)

可以看出来，相对传统的一致性 Hash 分片，预分片机制的每个 slot 的大小（代表数据分片范围）是固定的，因此解决了“分片范围不固定”的问题，现在，节点之间可以基于 slot 的维度做数据同步了。至于 slot 之间数据复制的方式，比如“采取异步复制还是同步复制”，“复制多少个节点成功才算成功”，不同系统的因其 cap 定位不同，实现也大有不同，这里无法展开讲。

接下来，我们看看节点增删的过程。

- 节点宕机：如下图，副本数为 2，路由表里每个 slot id 需要映射到 2 个节点，1 个节点存储主副本，1 个节点存储备副本。对于 S1 的所有写操作，需要路由到 nodeA，然后 nodeA 会将 S1 的操作日志同步给 nodeB。如果 nodeA 发生宕机，则系统需要修改路由表，将 nodeA 所负责的 slot （ 如图中的 S1和 S3 ） 重新分配给其他节点，如图，经过调整，S1 的节点变为 nodeB 和 nodeC，S3 的节点变为 nodeC 和 nodeE。然后系统会命令 nodeC 和 nodeE 开始做数据复制的工作，复制过程不会影响到 S1 和 S3 对外服务，因为 nodeC 和 nodeE 都属于备副本（读写都访问主副本）。复制完成后方可结束。

![节点宕机](https://cdn.nlark.com/yuque/0/2019/png/226702/1556089042646-c19e7056-e9ec-44fd-9e1b-90a2a8df87d0.png)

- 节点扩容：节点扩容的过程比节点宕机稍微复杂，因为新节点的加入可能导致 slot 迁移，而迁移的过程中需要保证系统仍可以对外服务。以下图为例，扩容 nodeF 之后，系统需要对路由表的重新平衡，S1 的主节点由 nodeA 变为 nodeF，S12 的备节点由 nodeC 变为 nodeF。我们讲一下 S1 的数据迁移过程：首先客户端所看到的路由表还不会发生变化，客户端对 S1 的读写请求仍然会路由到 nodeA。与此同时  nodeA 开始将 S1 的数据复制给 nodeF；然后，当 nodeF 即将完成数据的备份时，短暂地对 S1 禁写，确保 S1 不会再更新，然后 nodeF 完成最终的数据同步；最后，修改路由表，将 S1 的主节点改为 nodeF，并将最新的路由表信息通知给 Client，至此就完成 S1 的迁移过程。Client 后续对 S1 的读写都会发送给 nodeF。 

![节点扩容](https://cdn.nlark.com/yuque/0/2019/png/226702/1556089042662-bb3efcf2-5aef-4138-a2c6-8fea91bc97e1.png)

![节点扩容](https://cdn.nlark.com/yuque/0/2019/png/226702/1556089042656-0b6b2363-df6c-4a6d-bcdf-0bfae3651685.png)

一般来说，管理路由表、对 Client 和 所有node 发号施令的功能（可以理解成是“大脑”），通常由单独的角色来承担，比如 Codis 的大脑是 codis-conf + Zookeeper/Etcd，Tair 的大脑是 ConfigServer。下图是 Tair 官方展示的部署架构图，ConfigServer 由 2 台服务器组成，一台 master，一台 slave。

![Tair（Alibaba 开源的分布式 KV 存储系统）架构图](https://cdn.nlark.com/yuque/0/2019/png/226702/1556089042686-22675546-c4cc-4e3d-be88-bfc8a2ea19b6.png)

### SOFARegistry 的选择

总结一下，“一致性 Hash 分片机制” 和 “预分片机制” 的主要区别：

- **一致性 Hash 分片机制**

在虚拟节点足够多的情况下，数据分片在每台节点上是非常分散均匀的，即使增加或减少节点的数量，还是能维持数据的平衡，并且不需要额外维护路由表。但是，由于“分片范围不固定（一旦节点数发生变化，就会导致分片范围变化）”的特点，导致它不适用于需要做数据多副本复制的场景。目前业界主要代表项目有 Memcached、Twemproxy 等。

- **预分片机制**

通过事先将数据范围等分为 N 个 slot，解决了“分片范围不固定”的问题，因此可以方便的实现数据的多副本复制。但需要引进“路由表”，并且在节点变化时可能需要做数据迁移，实现起来也不简单。目前业界主要代表项目有 Dynamo、Casandra、Tair、Codis、Redis cluster 等。

SOFARegistry 的 DataServer 需要存储多个副本的服务数据，其实比较适合选择“预分片机制”，但由于历史原因，我们的分片方式选择了“一致性 Hash分片”。在“一致性 Hash分片”的基础上，当然也不意外地遇到了 “分片数据不固定”这个问题，导致 DataServer 之间的数据多副本复制实现难度很大。最后，我们选择在 DataServer 内存里以 dataInfoId 的粒度记录操作日志，并且在 DataServer 之间也是以 dataInfoId 的粒度去做数据同步。聪明的读者应该看出来了，其实思想上类似把每个 dataInfoId 当做一个 slot 去对待。这个做法很妥协，好在，服务注册中心的场景下，dataInfoId 的总量是有限的（以蚂蚁金服的规模，每台 DataServer 承载的 dataInfoId 数量也就在数万的级别），因此也勉强实现了 dataInfoId 维度的数据多副本。

![预分片机制](https://cdn.nlark.com/yuque/0/2019/png/300999/1556159575535-c1935445-794e-492f-989a-ad68e3a56edf.png)

如上图，A-F 代表 6 个 dataInfoId 数据。使用一致性 Hash 分片后，DataServer1 负责 A 和 D，DataServer2 负责 B 和 E，DataServer3 负责 C 和 F。并且每个数据均有 3 个副本。对 A 的写操作是在 DataServer1 即主副本上进行，随后 DataServer1 将写操作异步地复制给 DataServer2 和 DataServer3，DataServer2 和 DataServer3 将写操作应用到内存中的 A 备副本，这样就完成了多副本间的数据复制工作。

## 秒级服务上下线通知

### 服务的健康检测

首先，我们简单看一下业界其他注册中心的健康检测机制：

- Eureka：定期有 renew 心跳，数据具有 TTL（Time To Live）；并且支持自定义 healthcheck 机制，当 healthcheck 检测出系统不健康时会主动更新 instance 的状态。
- Zookeeper：定期发送连接心跳以保持会话 （Session），会话本身 （Session） 具有TTL。
- Etcd：定期通过 http 对数据进行 refresh，数据具有 TTL。
- Consul：agent 定期对服务进行 healthcheck，支持 http/tcp/script/docker；也可以由服务主动定期向 agent 更新 TTL。

**SOFARegistry 的健康检测**

我们可以看到上述其他注册中心的健康检测都有个共同的关键词：“定期”，定期检测的时间周期通常设置为秒级，比如 3 秒、5 秒或 10 秒，甚至更长，也就是说服务的健康状态总是滞后的。蚂蚁金服的注册中心从最初的版本设计开始，就把健康状态的及时感知，当做一个重要的设计目标，特别是需要做到“服务宕机能被及时发现”。为此， SOFARegistry 在健康检测的设计上做了这个决定：“服务数据与服务发布者的实体连接绑定在一起，断连马上清数据”，我简称这个特点叫做连接敏感性。

连接敏感性：在 SOFARegistry 里，所有 Client 都与 SessionServer 保持长连接，每条长连接都会有基于 [bolt](https://github.com/alipay/sofa-bolt) 的连接心跳，如果连接断开，Client 会马上重新建连，时刻保证 Client 与 SessionServer 之间有可靠的连接。

SOFARegistry 将服务数据 （PublisherRegister） 和服务发布者 （Publisher） 的连接的生命周期绑定在一起：每个 PublisherRegister 有一个属性是 connId，connId 由注册本次服务的 Publisher 的连接标识 （IP 和 Port）构成， 意味着，只要该 Publisher 和 SessionServer 断连，数据就失效。Client 重新建连成功后，会重新注册服务数据，但重新注册的服务数据会被当成新的数据，因为换了连接之后，Publisher 的 connId 不一样了。

比如，当服务的进程宕机时，一般情况下 os 会马上断开进程相关的连接（即发送 FIN），因此 SessionServer 能马上感知连接断开事件，然后把该 connId 相关的所有 PublisherRegister 都清除，并及时推送给所有订阅者 （Subscriber）。当然，如果只是网络问题导致连接断开，实际的进程并没有宕机，那么 Client 会马上重连 SessionServer 并重新注册所有服务数据。对订阅者来说它们所看到的，是发布者经历短暂的服务下线后，又重新上线。如果这个过程足够短暂（如 500ms 内发生断连和重连），订阅者也可以感受不到，这个是 DataServer 内部的数据延迟合并的功能，这里不展开讲，后续在新文章里再介绍。

需要承认的是，SOFARegistry 太过依赖服务所绑定的连接状态，当网络不稳定的情况下，大量服务频繁上下线，对网络带宽会带来一些没必要的浪费，甚至如果是 SessionServer 整个集群单方面存在网络问题，那么可能会造成误判，这里也缺乏类似 eureka 那样的保护模式。另外，SOFARegistry 目前不支持自定义的 healthcheck 机制，所以当机器出现假死的情况（服务不可用，但连接未断且有心跳），是无法被感知的。

### 服务上下线过程

![一次服务的上线（注册）过程](https://cdn.nlark.com/yuque/0/2019/png/226702/1556089042678-f3f2f994-046a-404f-8f6d-68953a15acb0.png)

服务的上下线过程，是指服务通过代码调用做正常的注册（publisher.register） 和 下线（publisher.unregister），不考虑因为服务宕机等意外情况导致的下线。如上图，大概呈现了“一次服务注册过程”的服务数据在内部流转过程。下线流程也是类似，这里忽略不讲。

1. Client 调用 publisher.register 向 SessionServer 注册服务。
1. SessionServer 收到服务数据 （PublisherRegister） 后，将其写入内存 （SessionServer 会存储 Client 的数据到内存，用于后续可以跟 DataServer 做定期检查），再根据 dataInfoId 的一致性 Hash 寻找对应的 DataServer，将  PublisherRegister 发给 DataServer。
1. DataServer 接收到 PublisherRegister 数据，首先也是将数据写入内存 ，DataServer 会以 dataInfoId 的维度汇总所有 PublisherRegister。同时，DataServer 将该 dataInfoId 的变更事件通知给所有 SessionServer，变更事件的内容是 dataInfoId 和版本号信息 version。
1. 同时，异步地，DataServer 以 dataInfoId 维度增量地同步数据给其他副本。因为 DataServer 在一致性 Hash 分片的基础上，对每个分片保存了多个副本（默认是3个副本）。
1. SessionServer 接收到变更事件通知后，对比 SessionServer 内存中存储的 dataInfoId 的 version，若发现比 DataServer 发过来的小，则主动向 DataServer 获取 dataInfoId 的完整数据，即包含了所有该 dataInfoId 具体的 PublisherRegister 列表。
1. 最后，SessionServer 将数据推送给相应的 Client，Client 就接收到这一次服务注册之后的最新的服务列表数据。

基于对上下线流程的初步认识后，这里对 SOFARegistry 内部角色之间的数据交互方式做一下概括：

- SessionServer 和 DataServer 之间的通信，是基于推拉结合的机制
  - 推：DataServer 在数据有变化时，会主动通知 SessionServer，SessionServer 检查确认需要更新（对比 version） 后主动向 DataServer 获取数据。
  - 拉：除了上述的 DataServer 主动推以外，SessionServer 每隔一定的时间间隔（默认30秒），会主动向 DataServer 查询所有 dataInfoId 的 version 信息，然后再与 SessionServer 内存的 version 作比较，若发现 version 有变化，则主动向 DataServer 获取数据。这个“拉”的逻辑，主要是对“推”的一个补充，若在“推”的过程有错漏的情况可以在这个时候及时弥补。

- Client 与 SessionServer 之间，完全基于推的机制
  - SessionServer 在接收到 DataServer 的数据变更推送，或者 SessionServer 定期查询 DataServer 发现数据有变更并重新获取之后，直接将 dataInfoId 的数据推送给 Client。如果这个过程因为网络原因没能成功推送给 Client，SessionServer 会尝试做一定次数（默认5次）的重试，最终还是失败的话，依然会在 SessionServer 定期每隔 30s 轮训 DataServer 时，会再次推送数据给 Client。

总结，本节介绍了 SOFARegistry 实现秒级的服务上下线通知的原理，主要是 2 个方面，第一是服务的健康检测，通过连接敏感的特性，对服务宕机做到秒级发现，但为此也带来“网络不稳定导致服务频繁上下线”的负面影响；第二是内部角色之间的“推”和“拉”的机制，整个服务上下线流程都以实时的“推”为主，因此才能做到秒级的通知。

### 欢迎加入，参与 SOFARegistry 源码解析 

![SOFALab](https://cdn.nlark.com/yuque/0/2019/png/226702/1556166838486-44c2acc2-e0c3-4557-9dfb-881617ad2bb1.png)

本文为 SOFARegistry 的架构介绍，希望大家对 SOFARegistry 有一个初步的认识和了解。同时，我们开启了《剖析 | SOFARegistry  实现原理》系列，会逐步详细介绍各个部分的代码设计和实现，预计按照如下的目录进行：
- 【已完成】海量数据下的注册中心 - SOFARegistry 架构介绍
- 【待领取】SOFARegistry 分片存储的实现详解
- 【待领取】SOFARegistry 数据推送机制详解
- 【待领取】SOFARegistry Meta 实现剖析
- 【待领取】SOFARegistry 最终一致性详解

如果有同学对以上某个主题特别感兴趣的，可以留言讨论，我们会适当根据大家的反馈调整文章的顺序，谢谢大家关注 SOFA ，关注 SOFARegistry，我们会一直与大家一起成长。

### 领取方式

关注公众号：金融级分布式架构，直接回复公众号想认领的文章名称，我们将会主动联系你，确认资质后，即可加入，It's your show time！

除了源码解析，也欢迎提交 issue 和 PR：

**SOFARegistry：**[https://github.com/alipay/sofa-registry ](https://github.com/alipay/sofa-registry)