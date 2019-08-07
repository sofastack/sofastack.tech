---
author: "任展"
date: 2018-12-06T10:20:00.000Z
title: "蚂蚁金服开源通信框架SOFABolt解析之连接管理剖析"
description: "本文将重点分析 SOFABolt 的连接管理功能。"
tags: ["SOFABolt","SOFALab","剖析 | SOFABolt 框架"]
categories: "SOFABolt"
aliases: "/posts/2018-12-06-02"
cover: "/cover.jpg"
---

## 前言

SOFABolt 是一款基于 Netty 最佳实践，通用、高效、稳定的通信框架。目前已经运用在了蚂蚁中间件的微服务，消息中心，分布式事务，分布式开关，配置中心等众多产品上。

本文将重点分析 SOFABolt 的连接管理功能。

我们知道，一次 tcp 请求大致分为三个步骤：建立连接、通信、关闭连接。每次建立新连接都会经历三次握手，中间包含三次网络传输，对于高并发的系统，这是一笔不小的负担；关闭连接同样如此。为了减少每次网络调用请求的开销，对连接进行管理、复用，可以极大的提高系统的性能。

下面我们将介绍 SOFABolt 在连接管理的实现，包括连接生命周期管理、定时断连及自动重连等。

## 设计抽象

首先我们将会介绍 SOFABolt 对连接的封装抽象。

### 连接封装

SOFABolt 中定义了一个基础的连接类 -- `Connection`:

![Connection 类](https://cdn.nlark.com/lark/0/2018/png/590/1543354233180-1e4af92d-3553-408f-9e6f-c39b3fbe674c.png)

省去 AtributeKey 类型定义以及 Log 配置，以上是Connection中所有的成员变量。包括几个方面:

- 连接：Channel、Url
- 版本：protocolCode、version
- 调用：invokeFutureMap
- 附着：attributes
- 引用：referenceCount、id2PoolKey、poolKeys

这里提一下 protocolCode 和 version，版本信息会被携带至对端，用于连接的协商。总的来说，通过对于 Channel 的包装，Connection 提供了丰富的上下文及引用信息，是 SOFABolt 连接管理的直接对象。

### 连接事件

SOFABolt 定义了连接事件和事件监听器用于处理连接对象。ConnectionEventType 定义了三种事件类型：CONNECT, CLOSE 和 EXCEPTION. 针对不同的连接事件类型，我们可以通过事件监听器 -- ConnectionEventListener 来进行处理，下面来看一下 ConnectionEventListener 类：

![ConnectionEventListener 类](https://cdn.nlark.com/lark/0/2018/png/590/1543356793023-bd023f1d-6bd9-4fd6-baa8-b6da56eeb3d5.png)

监听器定义了两个方法 `onEvent` 和 `addConnectionEventProcessor`, 分别是触发事件和添加事件处理器。整个监听器采用一个 HashMap 来存储事件类型及其对应的处理器集合。在触发相关连接事件后，会遍历处理器集合并调用处理器执行。

SOFABolt 的连接管理集中在 `ConnectionEventHandler` 中处理，他继承了 `ChannelDuplexHandler`，是标准的用来处理Connection连接对象并进行日志打印的一个处理器。先来看一下成员组成：

![成员组成](https://cdn.nlark.com/lark/0/2018/png/590/1543357861168-4aaddd1a-0a07-44f1-82e6-15b1b8b4a4d6.png)

其中连接事件监听器上文已经提及，剩下的几个成员从名称上也通俗易懂，先简单介绍一下，后续会详细地展开：

- 连接管理器：管理连接对象，包括创建、添加、删除、检查是否可用等等
- 连接事件监听器：监听连接事件的触发，然后执行对应的逻辑
- 连接事件执行器：包装后的线程池，用于异步触发连接事件监听器来处理对应的连接事件，值得一提的是，这个线程池只有一个线程。
- 重连管理器：顾名思义，管理重连的Url对象以及执行重连任务
- 全局开关：全局的设置，比如是否需要管理连接对象、是否需要执行重连任务等等

代码中方法都比较简单，大部分的处理逻辑围绕 Connection 对象展开，主要是维护有关本 Channel 对象的 Connection 对象的生命周期(包括connect、close等事件)。下面着重分析两个方法：

![两个方法](https://cdn.nlark.com/lark/0/2018/png/590/1543358182342-acd25618-aa45-482a-839f-c1304dcf9dfc.png)

hannelInactive 方法是在连接断开前触发的方法，在 SOFABolt 里的处理逻辑中，会根据globalSwitch 中 CONN\_RECONNECT\_SWITCH 的开关状态来判定是否开启重连的任务。除此之外，会在最后触发该 Connection 对象的 CLOSE 事件。这个触发事件是在异步线程中执行的，也就是上文提到的连接事件执行器。

另一个是 userEventTriggered 方法， 用来触发自定义的用户事件，通过查看本方法的调用位置，可以得知，该方法是在连接建立的最初被触发的，一个简单的例子可以在RpcServer类中找到：

![RpcServer 类](https://cdn.nlark.com/lark/0/2018/png/590/1543359072937-37e9efc6-398f-4b35-a12e-8040f366608d.png)

在连接建立触发 fireUserEventTriggered 方法后，我们就开始执行对应此方法中的逻辑，也可以看到，在判定是 CONNECT 事件后，通过attr得到绑定在Channel的Connection对象，然后就同 channelInactive 方法一样，触发 CONNECT 事件异步执行对应的处理器逻辑。

## 连接管理

下面来介绍 ConnectionManager，SOFABolt 提供了默认的实现类 DefaultConnectionManager类。顾名思义，主要负责连接对象的管理：

- 通过工厂创建 Connection 连接对象
- 通过注入的选择策略进行 Connection 连接的选择
- 管理创建和添加的 Connection 对象和 ConnectionPool 连接池对象（包括检查 Connection 对象、维护 ConnectionPool 的健壮性）
- 控制 Connection 对象的心跳打开与关闭

### 创建连接

ConnectionFactory 用于创建连接对象，SOFABolt 提供了两个实现类： DefaultConnectionFactory 和 RpcConnectionFactory。这个工厂类执行了客户端所有 Connection 对象的创建工作，代码也比较简单：

![代码](https://cdn.nlark.com/lark/0/2018/png/590/1543359416713-cd4e8e92-84c4-4266-9858-8b20e2c57654.png)

注意到了吗，在创建完毕 Connection 对象后，执行了 fireUserEventTriggered 方法，这样就保证了每一个 Connection 对象在创建之后都会去触发 CONNECT 事件。

### 选择连接

ConnectionSelectStrategy 选择策略的默认实现是随机策略 RandomSelectStrategy, 在执行选择连接时大致分为两步：

- 在开启CONN\_MONITOR\_SWITCH监控时，会从该连接池所有的连接中做一个简单的filter操作，把CONN\_SERVICE\_STATUS为ON的连接挑选出来，作为选择池。如果没有开启监控，那么选择池就是连接池。
- 执行挑选策略，获取选择池中的一个连接。

### 管理连接和连接池

管理连接和连接池是 ConnectionManager 最主要的作用，用来进行连接和连接池的生命周期管理，包括添加、删除、检查健康、恢复连接数等功能。下面先看一个在添加中常见的方法，用来获取一个连接池对象或者创建一个，限于篇幅，这里不贴代码，有兴趣的同学可以在 GitHub 上查看源码。在执行创建连接池对象时，会有两种逻辑:

- 返回空的连接池
- 返回一个初始化过的连接池(有一定的连接数)

这两种逻辑其实对应的是两种需求，第一个对应连接已经创建好然后放入连接池的流程，第二个则是对应通过 Url 来创建一个连接池并且在连接池中做新建连接的流程。那么对于第二种情况，由于建立连接需要耗时且有可能抛出异常，所以 ConnectionManager 允许重试两次。

下面来说说对于连接和连接池的维护方面的功能，大概包含以下几个方面

- 检查单个连接的可用性
- 扫描检查所有连接池里的连接
- 维护并且修复连接池

ConnectionManager 提供了 check 方法用来检查单个连接对象是否健康(Channel是否正常、是否活跃、能否写入)。如果连接失效的话，就会在连接池中删除该连接，如果连接池为空或者该连接池最后访问的时间间隔超过了阈值，就会释放所有连接回收连接池内存。

![代码](https://cdn.nlark.com/lark/0/2018/png/590/1543363262730-7912af6e-b038-46dd-8613-44e43cb8df7a.png)

在维护连接池的工作上来说，SOFABolt 主要采用自动重连和定时断连两种方式。运行时对连接池的维护十分重要。其一，爆发式调用是不稳定因素，如果连接数一旦增多，在峰值流量过去后会产生大量冗余的连接数；其二，可调用的服务往往是会变化的，如果服务不可用那么我们就需要将这些连接清理掉；因此，对于这两种情况就需要我们能够检查出多余的连接并且进行释放，这也就是自动断连的适用场景。对于重连的情况，则是为了保证整个连接池中连接数量的稳定性，使得在调用连接的时候整个QPS是较为稳定的，不会出现很大的波动，这一点也是为了保证通信的稳定性。定时断连和自动重连两者互相平衡，使得连接池中的数量趋于稳定，整个通信系统也会十分稳定。

#### 自动重连

自动重连机制是通过 GlobalSwitch#CONN\_RECONNECT\_SWITCH 来控制开闭。具体的重连策略在 ReconnectManager 中实现，它的主要逻辑如下：

- 判断重连线程是否开启，这主要会考虑到 ReconnectManager 退出逻辑，在ReconnectManager对象销毁时会中断重连工作的线程
- 判断时间间隔，因为要控制重连任务的执行速度，所以需要对上一次重连的时间间隔和设定的阈值做比较，这个阈值是1s，如果上一次重连任务的执行速度没有超过1s，就会Sleep线程1s。
- 从重连任务的阻塞队列中尝试获取任务，如果没有获取到，线程会阻塞。
- 检查任务是否有效，是否已经取消，如果没有取消，就会执行重连任务。
- 如果捕捉到异常，不会取消这个重连任务，而是重新将它添加到任务队列里。

整个重连任务的添加是在每一次链接断开的 channelInactive 方法中执行。

#### 定时断连

定时重连机制是通过 DefaultConnectionMonitor 实现，通过特定的ConnectionMonitorStrategy 来对所有的链接池对象进行监控，内部维护了一个ScheduledThreadPoolExecutor来定时的执行MonitorTask。在 SOFABolt 里ConnectionMonitorStrategy的实现是ScheduledDisconnectStrategy类，顾名思义，这是一个每次调度会执行关闭连接的监控策略，它的主要逻辑如下：

- 通过filter方法来筛选出服务可用的连接和服务不可用的连接，并保存在两个List。
- 管理服务可用的连接，通过阈值 CONNECTION\_THRESHOLD 来执行两种不同的逻辑
  - 服务可用的连接数 > CONNECTION\_THRESHOLD ：接数过多，需要释放资源，此时就会从这些可用链接里随机将一个配置成服务不可用的连接
  - 服务的可用连接数 <= CONNECTION\_THRESHOLD：连接数尚未占用过多的资源，只需取出上一次缓存在该集合中的“不可用”链接，然后执行closeFreshSelectConnections方法
- 关闭服务不可用的链接

## 最后

SOFABolt 建立了一套完善的连接管理机制，从连接的创建到选择再到运行时监控都有着良好的实现。使用自动重连和定时断连机制，平衡运行时各个连接池的数量并且有效地优化资源占用，这些都为它的高性能打下了坚实的基础。