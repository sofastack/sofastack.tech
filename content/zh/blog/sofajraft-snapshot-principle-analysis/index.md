---
title: "SOFAJRaft Snapshot 原理剖析 | SOFAJRaft 实现原理"
author: "胡宗棠"
authorlink: "https://github.com/zongtanghu"
description: "本文为《剖析 | SOFAJRaft 实现原理》最后一篇，本篇作者胡宗棠。"
categories: "SOFAJRaft"
tags: ["SOFAJRaft","SOFALab","剖析 | SOFAJRaft 实现原理"]
date: 2019-09-23T18:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1569229317568-a8fe041b-1bfe-4448-8fca-d9b974015de0.jpeg"
---

> **SOFAStack**（**S**calable **O**pen **F**inancial **A**rchitecture Stack）是蚂蚁金服自主研发的金融级分布式架构，包含了构建金融级云原生架构所需的各个组件，是在金融场景里锤炼出来的最佳实践。

![SOFAJRaft Snapshot 原理剖析](https://cdn.nlark.com/yuque/0/2019/png/226702/1568785845326-d38f65f4-c0db-41b7-a53f-a76b31cb42f9.png)

SOFAJRaft 是一个基于 Raft 一致性算法的生产级高性能 Java 实现，支持 MULTI-RAFT-GROUP，适用于高负载低延迟的场景。

本文为《剖析 | SOFAJRaft 实现原理》最后一篇，本篇作者胡宗棠，来自中国移动。《剖析 | SOFAJRaft 实现原理》系列由 SOFA 团队和源码爱好者们出品，项目代号：<SOFA:JRaftLab/>，文末包含往期系列文章。

SOFAJRaft：[https://github.com/sofastack/sofa-jraft](https://github.com/sofastack/sofa-jraft)

## 导读

本文主要介绍 SOFAJRaft 在日志复制和管理中所采用的快照机制。考虑到单独介绍 SOFAJRaft 中的快照机制原理和实现或许有一些唐突，我会先通过一个读者都能够看得明白的例子作为切入点，让大家对快照这个概念、它可以解决的主要问题，先有一个比较深刻的理解。

## 一、快照的概念与特点

SOFAJRaft 是对 Raft 共识算法的 Java 实现。既然是共识算法，就不可避免的要对需要达成共识的内容，在多个服务器节点之间进行传输，一般将这些共识的内容称之为日志块（LogEntry）。如果读过《剖析 | SOFAJRaft 实现原理》系列前面几篇文章的同学，应该了解到在 SOFAJRaft 中，可以通过“节点之间并发复制日志”、“批量化复制日志”和“复制日志pipeline机制”等优化手段来保证服务器节点之间日志复制效率达到最大化。

但如果遇到下面的两个场景，仅依靠上面的优化方法并不能有效地根本解决问题：

1. 当对某个 SOFAJRaft Group 集群以新增节点方式来扩容，新节点需要从当前的 Leader 中获取所有的日志并重放到本身的状态机中，这对 Leader 和网络带宽都会带来不小的开销，还有其他方法可以优化或解决这个问题么？
1. 因为服务器节点需要存储的日志不断增加，但是磁盘空间有限，除了对磁盘卷大小扩容外，还有其他方式来解决么？

带着上面两个疑问，我们可以先来看一个大家日常生活中都会遇到的场景—重新安装操作系统，然后再通俗易懂地为大家介绍快照的概念与特点。

有一天，你的笔记本电脑的 Windows 操作系统因为某一些原因出现启动后多次崩溃问题，不管通过任何方式都没办法解决。这时候，我们想到解决问题的第一个方案就是为这台电脑重新安装操作系统。如果，我们平时偶尔为自己电脑的操作系统做过镜像，直接用之前的镜像文件即可快速还原系统至之前的某一时间点的状态，而无需从零开始安装 Windows 操作系统后，再花大量时间来重新安装一些自己所需要的系统软件（比如 Chrome 浏览器、印象笔记和 FoxMail 邮件客户端等）。

在上面的例子中，电脑操作系统的镜像就是系统某一时刻的“快照”，因为它包含了这一时刻，系统当前状态机的值（对于用户来说，就是安装了哪些的应用软件）。在需要重新安装操作系统时候，通过镜像这一“快照”，可以很高效地完成还原电脑操作系统这个任务，而无需从零开始安装系统和相应的应用软件。所以，我们这里可以为“快照”下一个简单的定义：一种通过某种数据格式文件来保存系统当前的状态值的一个副本。

“快照”的特点，就如同它字面意思一样，可以分为“快”和“照”：

- “快”：高效快捷，通过快照可以很方便的将系统还原至某一时刻的状态；
- “照”：通过快照机制是保存系统某一时刻的状态值；

## 二、SOFAJRaft 的 Snapshot 机制

### 2.1 SOFAJRaft Snapshot 机制的原理

读到这里，再去回顾第一节内容开头提出的两个问题，大家应该可以想到解决问题的方法就是通过引入快照机制。

#### 1. 解决日志复制与节点扩容的瓶颈问题

在 SOFAJRaft 中，Snapshot 为当前 Raft 节点状态机的最新状态打了一个“镜像”单独保存，保存成功后在这个时刻之前的日志即可删除，减少了日志文件在磁盘中的占用空间。而在 Raft 节点启动时，可以直接加载最新的  Snapshot 镜像，直接重放在此之后的日志文件即可。如果设置保存 Snapshot 的时间间隔比较合理，那么节点加载镜像后重放的日志文件较少，启动速度也会比较快。对于新 Raft 节点加入某个 SOFAJRaft Group 集群的场景，新节点可先从 Leader 节点上拷贝最新的 Snapshot 安装到本地状态机，然后拷贝后续的日志数据即可，这样可以在快速跟上整个 SOFAJRaft Group 集群进度的同时，又不会占用 Leader 节点较大的网络带宽资源。

#### 2. 解决 Raft 节点故障恢复中的时效问题

在一个正常运行的 SOFAJRaft Group 集群中，当其中某一个 Raft 节点出现故障了（假设该故障的原因不是由磁盘损坏等不可逆因素导致的），该 Raft 节点修复故障重新启动时，如果节点禁用 Snapshot 快照机制，那么会重放所有本地的日志到状态机以跟上最新的日志，这样节点启动和达到日志备份完整的耗时均会比较长。但是，如果此时节点开启了 Snapshot 快照机制，那么一切就会变得非常高效，节点只需要加载最新的 Snapshot 至状态机，然后以 Snapshot 数据的日志为起点开始继续回放日志至状态机，直到使得状态机达到最新状态。

![在 Snapshot 禁用情况下集群节点扩容](https://cdn.nlark.com/yuque/0/2019/png/439987/1568774493825-aa20861c-9324-4207-a535-9b1a043b7516.png)

图1 在 Snapshot 禁用情况下集群节点扩容

![image.png](https://cdn.nlark.com/yuque/0/2019/png/439987/1568774527638-51a77503-2614-454d-91d2-fa5e7be278a6.png)

图2 在 Snapshot 启用情况下集群节点扩容

从上面两张 SOFAJRaft 集群的结构图上，可以很明显地看出在开启和禁用 Snapshot 时，扩容的新 Raft 节点需要从 Leader 节点传输过来不同的日志数量。在禁用 Snapshot 情况下，新 Raft 节点需要把 Leade 节点内从起始的 T1 时刻至当前 T3 时刻这一时间范围内的所有日志都重新传至本地后提交给状态机。而在开启 Snapshot 情况下，新 Raft 节点则无需像 图1 中那么逐条复制 T1~T3 时刻内的所有日志，而只需先从 Leader 节点加载最新的镜像文件 Snapshot_Index_File 至本地，然后仅复制 T3 时刻以后的日志至本地并提交状态机即可。

在这里可能有同学会有疑问：“在 图 1 中，从 Leader 节点传给新扩容的 Raft 节点的数据是 T1~T3 的日志，而 图2 中取而代之的是 Snapshot_Index_File 快照镜像文件，似乎还是不可避免额外的数据传输么？”仔细看下图 2，会发现其中 Snapshot_Index_File 快照镜像文件是对 T1~T3 时刻内日志数据指令的合并（包括数集合[Add 1,Add 6,Add 4,Sub 3,Sub 4,Add 3]），也即为最终的数据状态值。

### 2.2 SOFAJRaft Snapshot 机制的实践应用

如果用户需开启 SOFAJRaft 的 Snapshot 机制，则需要在其客户端中设置配置参数类 NodeOptions 的“snapshotUri”属性（即为：Snapshot 文件的存储路径），配置该属性后，默认会启动一个定时器任务（“JRaft-SnapshotTimer”）自动去完成 Snapshot 操作，间隔时间通过配置类 NodeOptions 的“snapshotIntervalSecs”属性指定，默认 3600 秒。定时任务启动代码如下：

![定时任务启动代码](https://cdn.nlark.com/yuque/0/2019/png/439987/1569050293481-5c03d3e5-f2f7-4dfa-9d0b-c4b71bceeffe.png)

从上面源码中可以看出，除了依靠定时任务触发以外，SOFAJRaft 也支持用户实现自定义的 Closure 类的回调方法，通过 Node 接口主动触发 Snapshot，并将结果通过 Closure 回调。示例代码如下：

![snapshot closure 源码](https://cdn.nlark.com/yuque/0/2019/png/439987/1569050397240-5c508079-b0f1-4955-bebd-204f1867589b.png)

同时，用户在继承并实现业务状态机类“StateMachineAdapter”（该类为抽象类）时候需要，一并实现其中的  `onSnapshotSave()/onSnapshotLoad()`  方法：

- onSnapshotSave() 方法：定期保存 Snapshot；
- onSnapshotLoad() 方法：启动或者安装 Snapshot 后加载 Snapshot；

这里需要注意的是，上面的  `onSnapshotSave()`  和  `onSnapshotLoad()`  方法均会阻塞 Raft 节点本身的状态机，应该尽量通过异步或其他方式进行优化，避免出现阻塞的情况。对于  `onSnapshotSave()`  方法，需要在保存快照文件后调用传入的参数 `closure.run(status)`  通知调用者保存成功或者失败；具体的应用实践示例，可以参考 github 上的 Counter 计数器示例。

Counter 计数器示例：[https://www.sofastack.tech/projects/sofa-jraft/counter-example/](https://www.sofastack.tech/projects/sofa-jraft/counter-example/)

### 2.3 SOFAJRaft Snapshot 源码简析

上一节 `handleSnapshotTimeout`  方法的关键代码为最后一行  `doSnapshot(null)`  方法，深入代码后发现，最终调用的是 Snapshot 执行器（SnapshotExecutor）的  `doSnapshot(final Closure done)`  方法。顺着这条源码线路，接下来看最为核心的 SnapshotExecutor 快照执行器实现类：SnapshotExecutorImpl，并推出 Raft 节点生成快照、安装快照和加载快照的整体的框架结构图。

SOFAJRaft 中 Snapshot 机制的核心类是 SnapshotExecutorImpl。这个 SnapshotExecutor 快照执行器的核心方法是  `doSnapshot(...)`  和  `installSnapshot(...)` ：

 `doSnapshot(...)`  方法：该方法用于生成 Raft 节点的快照文件。在该方法中，要先完成以下几个前置状态的校验和检查：

- 是否处于 Stopped 状态；
- 是否正在加载另外一个 Snapshot 文件；
- 是否正在生成另外一个 Snapshot 文件；
- 当前业务状态机已经提交的 Index 索引是否等于 Snapshot 最后保存的日志 Index 索引（如果两个值相等则表示，业务数据没有新增，无需再生成一次没有意义的 Snapshot）；

在完成上面的状态校验和检查后，SOFAJRaft 调用了业务状态机实现的  `onSnapshotSave()`  方法，这里调用者可以通过参数传入的参数  `closure.run(status)`  通知自己保存 Snapshot 文件成功或者失败。该方法具体的源代码如下：

![ doSnapshot(...) 方法源码](https://cdn.nlark.com/yuque/0/2019/png/439987/1569050040573-de05d219-3606-4cb5-b169-a9ec4b8631bb.png)

 `installSnapshot(...)`  方法：该方法主要适用于 SOFAJRaft 集群中的 Follower 角色节点，在收到从 Leader 节点发送过来的安装 Snapshot 的 RPC 请求后，先会对当前节点的状态做一些前置状态的校验（这一点跟上面的 `doSnapshot(...)` 方法一样）：

- 是否处于 Stopped 状态；
- 是否正在生成 Snapshot 文件；
- 节点的 term 值是否跟 RPC 请求的 term 值一致；
- Leader 节点发送过来的待安装 Snapshot 文件中的数据是否为最新的；
- 是否正在安装前面的 Snapshot 文件；

在完成上面的状态校验和检查后，SOFAJRaft 在  `loadDownloadingSnapshot()`  中，调用了业务状态机实现的  `onSnapshotLoad()`  方法。该方法具体的源代码如下：

![ installSnapshot(...) 方法源码](https://cdn.nlark.com/yuque/0/2019/png/439987/1569050001149-35631aca-cd12-46cd-8a15-7915300e0625.png)

结合上文对 SnapshotExecutor 快照执行器两个核心方法的解读，可以推出 Raft 节点生成快照、安装快照和加载快照的整体的框架结构图：

![生成快照/安装快照/加载快照框架图](https://cdn.nlark.com/yuque/0/2019/png/439987/1568774816004-c660d5d5-8f1a-487f-9fa8-3757fed7a939.png)

图3 生成快照/安装快照/加载快照框架图

从上面的整体流程框架图中可以看到，在新扩容的 Raft 节点启动后（它为 Follower 角色），它获取到 Leader 节点发送的安装 Snapshot 的 RPC 请求（InstallSnapshotRequest）后，会在 T1 时刻先调用 SnapshotExecutor 执行器的  `installSnapshot()`  方法，本地生成如上图所示的“snapshot_1”数据文件。

然后，该 Follower 节点从 T2 时刻开始继续执行 SOFAJRaft 的日志复制流程，从 Leader 节点接收到后续的 LogEntry 日志文件（如上图所示的 [Add 5,Sub 2,Add 1] 日志数据集合）。

最后，在 T3 时刻，该 Follower 节点，调用 SnapshotExecutor 执行器的  `doSnapshot()`  方法，合并日志数据集合并生成如上图所示的“snapshot_2”文件，同时会对之前的日志进行一个裁剪。具体的做法是，本地清理删除上图中从“snapshot_1”文件最后的 index+1 位置前的日志。

有读者朋友可能会问裁剪日志时，为什么不删除从“snapshot_2”文件最后的 index+1 位置前的日志？这里考虑到的主要原因是，在Raft集群中， Leader 和 Follower 节点间做日志复制时，很可能会存在有部分 Follower 节点没有完全跟上 Leader 节点的情况，如果此时 Leader 节点裁剪了从“snapshot_2”文件最后的 index+1 位置前的日志，那剩余未完成日志复制的 Follower 节点就无法从 Leader 节点同步日志，而只能通过 Leader 发送过来的 installSnapshotRequest 来完成同步最新的状态了（感兴趣的同学可以参考着研究下 SOFAJRaft 源码 LogManagerImpl 类的  `setSnapshot()`  方法实现）。

## 三、总结

本文围绕 Snapshot 机制的概念、特点和原理，结合 SOFAJRaft 的 Snapshot 机制的实现细节详细阐述了 SOFAJRaft-Snapshot 基本流程，介绍了 Snapshot 的实践应用，并剖析用户的业务系统如何使用 SOFAJRaft-Snapshot 机制解决 Raft 日志体积增加占用磁盘空间和节点重启时重放所有日志过多占用网络带宽资源的问题。

### SOFAJRaft 源码解析系列阅读

本篇是《剖析 | SOFAJRaft 实现原理》系列的最后一篇，感谢 SOFAStack 社区的核心贡献者们的编写，也欢迎更多感兴趣的技术同学加入，项目地址：SOFAJRaft：[https://github.com/sofastack/sofa-jraft](https://github.com/sofastack/sofa-jraft)

欢迎阅读原理解析系列，系统学习 SOFAJRaft 并让它帮助到你的项目：

- [SOFAJRaft-RheaKV 分布式锁实现剖析 | SOFAJRaft 实现原理](https://www.sofastack.tech/blog/sofa-jraft-rheakv-distributedlock/)
- [SOFAJRaft 日志复制 - pipeline 实现剖析 | SOFAJRaft 实现原理](https://www.sofastack.tech/blog/sofa-jraft-pipeline-principle/)
- [SOFAJRaft-RheaKV MULTI-RAFT-GROUP 实现分析 | SOFAJRaft 实现原理](https://www.sofastack.tech/blog/sofa-jraft-rheakv-multi-raft-group/)
- [SOFAJRaft 选举机制剖析 | SOFAJRaft 实现原理](https://www.sofastack.tech/blog/sofa-jraft-election-mechanism/)
- [SOFAJRaft 线性一致读实现剖析 | SOFAJRaft 实现原理](https://www.sofastack.tech/blog/sofa-jraft-linear-consistent-read-implementation/)
- [SOFAJRaft 实现原理 - SOFAJRaft-RheaKV 是如何使用 Raft 的](https://www.sofastack.tech/blog/sofa-jraft-rheakv/)
- [SOFAJRaft 实现原理 - 生产级 Raft 算法库存储模块剖析原理](https://www.sofastack.tech/blog/sofa-jraft-algorithm-storage-module-deep-dive/)
