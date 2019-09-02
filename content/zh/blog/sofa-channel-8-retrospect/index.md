---
title: "从一个例子开始体验 SOFAJRaft | SOFAChannel#8 直播整理"
author: "力鲲"
authorlink: "https://github.com/masaimu/"
description: "本文根据 SOFAChannel#8 直播分享整理，以 Counter 为例，介绍 SOFAJRaft 的概念，并从需求提出开始，一步步完善架构，明确业务要实现哪些接口，最后启动日志观察 SOFAJRaft 如何支撑业务执行。"
categories: "SOFAJRaft"
tags: ["SOFAJRaft","SOFAChannel"]
date: 2019-09-02T13:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1567402146443-3b98269c-d69c-4f83-b827-35c9d6f72d86.jpeg"
---

> <SOFA:Channel/>，有趣实用的分布式架构频道。
> 
> 本文根据 SOFAChannel#8 直播分享整理，主题：从一个例子开始体验 SOFAJRaft。
> 回顾视频以及 PPT 查看地址见文末。
> 欢迎加入直播互动钉钉群：23390449，不错过每场直播。

![channel8-banner](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1567389663053-5838db7b-13ff-4920-8c8d-0d2c1a56214b.jpeg)

大家好，我是力鲲，来自蚂蚁金服， 现在是 SOFAJRaft 的开源负责人。今天分享主题是《从一个例子开始体验 SOFAJRaft》，其实从这个题目大家也能看出来，今天是要从一个用户而非 owner 的视角来了解 SOFAJRaft。这么设计题目的原因是 SOFAJRaft 作为一种共识算法的实现，涉及到了一些概念和术语，而这些内容更适合通过一系列文章进行阐述，而在直播中我们希望能够分享对用户更有用、更容易理解的信息——SOFAJRaft 是什么，以及我们怎么去用它。

首先介绍一下 SOFAJRaft 的背景知识，接下来说说这个例子源于什么需求，第三部分是架构的选型，第四部分来看看我们如何使用 SOFAJRaft，最后运行代码，看看 SOFAJRaft 是如何支撑业务运行的。

欢迎加入社区成为 Contributor，[SOFAJRaft](https://github.com/sofastack/sofa-jraft)。

## Raft 共识算法

Raft 是一种共识算法，其特点是让多个参与者针对某一件事达成完全一致：一件事，一个结论。同时对已达成一致的结论，是不可推翻的。可以举一个银行账户的例子来解释共识算法：假如由一批服务器组成一个集群来维护银行账户系统，如果有一个 Client 向集群发出“存 100 元”的指令，那么当集群返回成功应答之后，Client 再向集群发起查询时，一定能够查到被存储成功的这 100 元钱，就算有机器出现不可用情况，这 100 元的账也不可篡改。这就是共识算法要达到的效果。

Raft 算法和其他的共识算法相比，又有了如下几个不同的特性：

- Strong leader：Raft 集群中最多只能有一个 Leader，日志只能从 Leader 复制到 Follower 上；
- Leader election：Raft 算法采用随机选举超时时间触发选举来避免选票被瓜分的情况，保证选举的顺利完成；
- Membership changes：通过两阶段的方式应对集群内成员的加入或者退出情况，在此期间并不影响集群对外的服务；

共识算法有一个很典型的应用场景就是复制状态机。Client 向复制状态机发送一系列能够在状态机上执行的命令，共识算法负责将这些命令以 Log 的形式复制给其他的状态机，这样不同的状态机只要按照完全一样的顺序来执行这些命令，就能得到一样的输出结果。所以这就需要利用共识算法保证被复制日志的内容和顺序一致。

![图1 - 复制状态机](https://cdn.nlark.com/yuque/0/2019/jpeg/307286/1567322241949-064625c5-2919-4853-8c2a-b9b8a62ff688.jpeg)
图1 - 复制状态机

## SOFAJRaft

SOFAJRaft 是基于 Raft 算法的生产级高性能 Java 实现，支持 MULTI-RAFT-GROUP。应用场景有 Leader 选举、分布式锁服务、高可靠的元信息管理、分布式存储系统。

![图2 - SOFAJRaft 结构](https://cdn.nlark.com/yuque/0/2019/jpeg/307286/1567322241943-83dd58b1-4a98-44ba-9dea-90ebbe18e4af.jpeg)
图2 - SOFAJRaft 结构

这张图就是 SOFAJRaft 的设计图，Node 代表了一个 SOFAJRaft Server 节点，这些方框代表他内部的各个模块，我们依然用之前的银行账户系统举例来说明 SOFAJRaft 的各模块是如何工作的。

当 Client 向 SOFAJRaft 发来一个“存 100 元”的命令之后，Node 的 Log 存储模块首先将这个命令以 Log 的形式存储到本地，同时 Replicator 会把这个 Log 复制给其他的 Node，Replicator 是有多个的，集群中有多少个 Follower 就会有多少个 Replicator，这样就能实现并发的日志复制。当 Node 收到集群中半数以上的 Follower 返回的“复制成功” 的响应之后，就可以把这条 Log 以及之前的 Log 有序的送到状态机里去执行了。状态机是由用户来实现的，比如我们现在举的例子是银行账户系统，所以状态机执行的就是账户金额的借贷操作。如果 SOFAJRaft 在别的场景中使用，状态机就会有其他的执行方式。

Snapshot 是快照，所谓快照就是对数据当前值的一个记录，Leader 生成快照有这么几个作用：

- 当有新的 Node 加入集群的时候，不用只靠日志复制、回放去和 Leader 保持数据一致，而是通过安装 Leader 的快照来跳过早期大量日志的回放；
- Leader 用快照替代 Log 复制可以减少网络上的数据量；
- 用快照替代早期的 Log 可以节省存储空间；

![图3 - 需要用户实现：StateMachine、Client](https://cdn.nlark.com/yuque/0/2019/png/307286/1567322241952-23bb3aa9-d9aa-4c35-8491-50082799126d.png)
图3 - 需要用户实现：StateMachine、Client

SOFAJRaft 需要用户去实现两部分：StateMachine 和 Client。

因为 SOFAJRaft 只是一个工具，他的目的是帮助我们在集群内达成共识，而具体要对什么业务逻辑达成共识是需要用户自己去定义的，我们将用户需要去实现的部分定义为 StateMachine 接口。比如账务系统和分布式存储这两种业务就需要用户去实现不同的 StateMachine 逻辑。而 Client 也很好理解，根据业务的不同，用户需要去定义不同的消息类型和客户端的处理逻辑。

![图4 - 需要用户实现一些接口](https://cdn.nlark.com/yuque/0/2019/png/307286/1567322241970-91c2ee85-e9a7-424a-b273-fb8f0f45bf5b.png)
图4 - 需要用户实现一些接口

前面介绍了这么多，我们引出今天的主题：如何用 SOFAJRaft 实现一个分布式计数器？

## 需求

我们的需求其实很简单，用一句话来说就是：提供一个 Counter，Client 每次计数时可以指定步幅，也可以随时发起查询。

我们对这个需求稍作分析后，将它翻译成具体的功能点，主要有三部分：

- 实现：Counter server，具备计数功能，具体运算公式为：Cn = Cn-1 + delta；
- 提供写服务，写入 delta 触发计数器运算；
- 提供读服务，读取当前 Cn 值；

除此之外，我们还有一个可用性的可选需求，需要有备份机器，读写服务不能不可用。

## 系统架构

根据刚才分析出来的功能需求，我们设计出 1.0 的架构，这个架构很简单，一个节点 Counter Server 提供计数功能，接收客户端发起的计数请求和查询请求。

![图5 - 架构 1.0](https://cdn.nlark.com/yuque/0/2019/png/307286/1567322241939-c5f843d0-b882-4635-86ab-a9400b01c518.png)
图5 - 架构 1.0

但是这样的架构设计存在这样两个问题：一是 Server 是一个单点，一旦 Server 节点故障服务就不可用了；二是运算结果都存储在内存当中，节点故障会导致数据丢失。

![图6 - 架构 1.0 的不足：单点](https://cdn.nlark.com/yuque/0/2019/png/307286/1567322241957-646f6263-4fb3-473d-bcfc-2a715c2b5532.png)
图6 - 架构 1.0 的不足：单点

针对第二个问题，我们优化一下，加一个本地文件存储。这样每次计数器完成运算之后都将数据落盘，当节点故障之时，我们要新起一台备用机器，将文件数据拷贝过来，然后接替故障机器对外提供服务。这样就解决了数据丢失的风险，但是同时也引来另外的问题：磁盘 IO 很频繁，同时这种冷备的模式也依然会导致一段时间的服务不可用。

![图7 - 架构 1.0 的不足：冷备](https://cdn.nlark.com/yuque/0/2019/png/307286/1567322241965-df884fad-b9aa-4506-9b5d-0b5ee1d91528.png)
图7 - 架构 1.0 的不足：冷备

所以我们提出架构 2.0，采用集群的模式提供服务。我们用三个节点组成集群，由一个节点对外提供服务，当 Server 接收到 Client 发来的写请求之后，Server 运算出结果，然后将结果复制给另外两台机器，当收到其他所有节点的成功响应之后，Server 向 Client 返回运算结果。

![图8 - 架构 2.0](https://cdn.nlark.com/yuque/0/2019/png/307286/1567322241959-9696804a-803f-483c-9450-a8d0c57e9951.png)
图8 - 架构 2.0

但是这样的架构也存在这问题：

- 我们选择哪一台 Server 扮演 Leader 的角色对外提供服务；
- 当 Leader 不可用之后，选择哪一台接替它；
- Leader 处理写请求的时候需要等到所有节点都响应之后才能响应 Client；
- 也是比较重要的，我们无法保证 Leader 向 Follower 复制数据是有序的，所以任一时刻三个节点的数据都可能是不一样的；

保证复制数据的顺序和内容，这就有了共识算法的用武之地，所以在接下来的 3.0 架构里，我们使用 SOFAJRaft 来助力集群的实现。

![图8 - 架构 3.0：使用 SOFAJRaft](https://cdn.nlark.com/yuque/0/2019/png/307286/1567322241957-0a6e9e90-70b2-4f36-8c56-25d1d8c46802.png)
图8 - 架构 3.0：使用 SOFAJRaft

3.0 架构中，Counter Server 使用 SOFAJRaft 来组成一个集群，Leader 的选举和数据的复制都交给 SOFAJRaft 来完成。在时序图中我们可以看到，Counter 的业务逻辑重新变得像架构 1.0 中一样简洁，维护数据一致的工作都交给 SOFAJRaft 来完成，所以图中灰色的部分对业务就不感知了。

![图9 - 架构 3.0：时序图](https://cdn.nlark.com/yuque/0/2019/png/307286/1567322241967-aa09111c-875a-45e9-a05b-fef3243fcb94.png)
图9 - 架构 3.0：时序图

在使用 SOFAJRaft 的 3.0 架构中，SOFAJRaft 帮我们完成了 Leader 选举、节点间数据同步的工作，除此之外，SOFAJRaft 只需要半数以上节点响应即可，不再需要集群所有节点的应答，这样可以进一步提高写请求的处理效率。

![图10 - 架构 3.0：SOFAJRaft 实现 Leader 选举、日志复制](https://cdn.nlark.com/yuque/0/2019/png/307286/1567322241973-263d22ab-624c-45d8-9602-b0a021ac795c.png)
图10 - 架构 3.0：SOFAJRaft 实现 Leader 选举、日志复制

## 使用 SOFAJRaft

那么怎么使用 SOFAJRaft 呢？我们之前说过，SOFAJRaft 主要暴露了两个地方给我们去实现，一是 Cilent，另一个是 StateMachine，所以我们的计数器也就是要去做这两部分。

在 Client 上，我们要定义具体的消息类型，针对不同的消息类型，还需要去实现消息的 Processor 来处理这些消息，接下来这些消息就交给 SOFAJRaft 去完成集群内部的数据同步。

在 StateMachine 上，我们要去实现状态机暴露给我们待实现的几个接口，最重要的是 onApply 接口，要在这个接口里将 Cilent 的请求指令进行运算，转换成具体的计数器值。而 onSnapshotSave 和 onSnapshotLoad 接口则是负责快照的生成和加载。

![图11 - 模块关系](https://cdn.nlark.com/yuque/0/2019/png/307286/1567322241989-2abdacb8-6718-43db-9882-18e86cd33599.png)
图11 - 模块关系

下面这张图是最终实现的模块关系图，其实他已经是代码实现之后的产物了，在这里并没有贴出具体的代码，因为代码已经随我们的项目一起开源了。我们实现了两种消息类型 IncrementAndGetRequest 和 GetValueRequest，分别对应写请求和读请求，因为两种请求的响应都是计数器的值，所以同用一个 ValueResponse。两种请求，所以对应两种 Processor：IncrementAndGetRequestProcessor 和 GetValueRequestProcessor，状态机 CounterStateMachine 实现了之前提到的三个接口，除此之外还实现了 onLeaderStart 和 onLeaderStop，用来在节点成为 leader 和失去 leader 资格时做一些处理。这个地方在写请求的处理中使用了 IncrementAndAddClosure ，这样就可以通过 callback 的方式来实现响应。

![图12 - 类关系图](https://cdn.nlark.com/yuque/0/2019/png/307286/1567322241975-8c16dd32-ca0c-4ebf-8bd5-9778f7420c41.png)
图12 - 类关系图

## 启动运行

来看看整个的启动过程。首先来看 Follower 节点的启动 (当然，在启动之前，我们并不知道哪个节点会是 Leader)，Counter 在本地起三个进程用来模拟三个节点，它们分别使用 8081、8082、8083 三个端口，标记其为 A、B、C 节点。

A 节点率先启动，然后开始向 B 和 C 发送 preVote 请求，但是这时候另外两个节点都尚未启动，所以 A 节点通信失败，然后等待，再重试，如此往复。在 A 节点某次通信失败后的等待之中，它突然收到了 B 节点发来的 preVote 请求，在经过一系列 check 之后，它认可了这个 preVote 请求，并且返回成功响应，随后又对 B 节点发来的 vote 请求成功响应，然后我们可以看到，B 节点成功当选 Leader。这就是 Follower A 的启动、投票过程。

![图13 - Follower 启动日志](https://cdn.nlark.com/yuque/0/2019/png/307286/1567322241978-320750dd-30af-4d9e-b798-a0f9652acb22.png)
图13 - Follower 启动日志

我们再看看 B 节点的启动，B 节点在启动之后，刚好处于 A 节点的一次等待间隙之中，所以它没有收到其他节点发来的 preVote 请求，因此它向另外两个节点发起了 preVote 请求，试图竞选。接下来它收到了 A 节点发来的确认响应，接着 B 节点又发起了 vote 请求，依然收到了 A 节点的响应。这样 B 节点就收到了超过集群半数以上的投票并成功当选 (A 节点和 B 节点自己，达到 2/3) 。在此过程中，C 节点一直没有启动，但是由于 A 和 B 构成半数以上，所以共识算法已经可以正常 work。

![图14 - Leader 启动日志](https://cdn.nlark.com/yuque/0/2019/png/307286/1567322241991-329d9a8a-415a-48a2-85c4-d7335a5bddd2.png)
图14 - Leader 启动日志

在刚才的过程中，我们提到了两个关键词：preVote 和 vote，这是选举中的两个阶段，之所以要设置 preVote，是为了应对网络分区的情况。关于 [SOFAJRaft 的选举](https://www.sofastack.tech/blog/sofa-jraft-election-mechanism/)，我们有专门的文章去解析 ，大家可以进一步了解。在这里我们将选举的评选原则粗略的描述为：哪个节点保存的日志最新最完整，它就更有资格成为 leader。

接下来我们看看 Client 发起的一次写请求。Client 共发起了三次写请求，分别是 "+0"、"+1"、"+2"。从日志上我们可以看到，Leader 在收到这些请求之后，先把他们以日志的形式发送给其他节点 (并且是批量的)，当它收到其他节点对日志复制的成功响应之后，再更新 committedIndex，最后调用 onApply 接口，执行 counter 的计数运算，将 client 发来的指令加到计数器当中。在这个过程中，可以看到 Leader 在处理写请求的时候一个很重要的步骤就是将日志复制给其他节点。来详细看下这个过程，以及当中提到的 committedIndex。

![图15 - Leader 处理写请求](https://cdn.nlark.com/yuque/0/2019/png/307286/1567322241986-c4012d06-c401-4685-81e2-20f8beef2bec.png)
图15 - Leader 处理写请求

CommittedIndex 标志了一个位点，它标志在此之前的所有日志都已经复制到了集群半数以上的节点之中。图中可以看到，committedIndex 初始指在 "3" 这个位置上，表示 "0-3" 的日志都已经复制到了半数以上节点之中 (在 Follower 上我们也已经看到)，接下来 Leader 又把 "4"、"5" 两条日志批量的复制到了 Follower 上，这是就可以把 committedIndex 右滑动到 "5" 的位置，表示 "0-5" 的日志都已经复制到了半数以上节点之中。

![图16 - 日志复制](https://cdn.nlark.com/yuque/0/2019/png/307286/1567322242007-47d93c46-21e9-4863-bc47-8066eea020d1.png)
图16 - 日志复制

这时又产生了另一个问题：我们如何知道 StateMachine 执行到哪一条日志了？通过 committedIndex 我们可以知道哪些日志已经成功复制到集群其他节点之中了，但是 StateMachine 中此刻的状态代表哪一条日志执行之后的结果呢？这就要用 applyIndex 来表示。在图中，applyIndex 指向 "3"，这表示："0-3" 的日志代表的指令都已经被 StateMachine 执行，状态机此刻的状态代表 "3" 日志执行完毕之后的结果，当 committedIndex 向右滑动之后，applyIndex 就可以伴随状态机的执行继续向右滑动了。[ApplyIndex 和 committedIndex 就可以支持线性一致性读](https://www.sofastack.tech/blog/sofa-jraft-linear-consistent-read-implementation/)，关于这个概念，我们也已经有文章去专门解析了，可以在文末链接中了解。

![图17 - ApplyIndex 更新](https://cdn.nlark.com/yuque/0/2019/png/307286/1567322242023-4f74d010-d896-4c5d-b87e-45080ebfdfcc.png)
图17 - ApplyIndex 更新

## 小结

今天以 Counter 为例，先介绍了 SOFAJRaft 的概念，然后从需求提出开始，一步步完善架构，明确业务要实现哪些接口，最后启动日志观察 SOFAJRaft 如何支撑业务执行。在此过程中涉及到了一些 SOFAJRaft 的在直播中没有继续深入的概念，也给出了相关的解析文章。

如果大家对于 [Counter 例子](https://www.sofastack.tech/projects/sofa-jraft/counter-example/)还想要有更多的了解，欢迎在官网浏览相关文章 ，或者在项目中查看[具体代码](https://github.com/sofastack/sofa-jraft/tree/master/jraft-example)。

## 文中提到的相关链接

- [SOFAJRaft 选举机制剖析 | SOFAJRaft 实现原理](https://www.sofastack.tech/blog/sofa-jraft-election-mechanism/)
- [SOFAJRaft 线性一致读实现剖析 | SOFAJRaft 实现原理](https://www.sofastack.tech/blog/sofa-jraft-linear-consistent-read-implementation/)
- [Counter 例子详解](https://github.com/sofastack/sofa-jraft/tree/master/jraft-example)
- [SOFAJRaft 源码解析系列](https://www.sofastack.tech/categories/sofajraft/)
- [SOFAJRaft GitHub](https://github.com/sofastack/sofa-jraft/)

### 本期视频回顾以及 PPT 查看地址

[https://tech.antfin.com/community/live/821](https://tech.antfin.com/community/live/821)

### 往期直播精彩回顾

- 探秘金融级云原生发布工作负载 CafeDeployment：[https://tech.antfin.com/community/live/737](https://tech.antfin.com/community/live/737)
- 蚂蚁金服轻量级监控分析系统解析 | SOFAChannel#6 直播整理：[https://tech.antfin.com/community/live/687](https://tech.antfin.com/community/live/687)
- 给研发工程师的代码质量利器 | SOFAChannel#5 直播整理：[https://tech.antfin.com/community/live/552](https://tech.antfin.com/community/live/552)
- 分布式事务 Seata TCC 模式深度解析 | SOFAChannel#4 直播整理：[https://tech.antfin.com/community/live/462](https://tech.antfin.com/community/live/462)
- SOFAChannel#3 SOFARPC 性能优化实践（下）：[https://tech.antfin.com/community/live/245](https://tech.antfin.com/community/live/245)
- SOFAChannel#2 SOFARPC 性能优化实践（上）：[https://tech.antfin.com/community/live/244](https://tech.antfin.com/community/live/244)
- SOFAChannel#1 从蚂蚁金服微服务实践谈起：[https://tech.antfin.com/community/live/148](https://tech.antfin.com/community/live/148)
