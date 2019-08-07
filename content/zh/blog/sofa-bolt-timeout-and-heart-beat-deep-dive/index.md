---
author: "胡萝卜、丞一"
date: 2018-12-06T10:20:00.000Z
title: "蚂蚁金服开源通信框架SOFABolt解析之超时控制机制及心跳机制"
description: "本篇我们会依次介绍编解码的概念， TCP 粘包拆包问题，SOFABolt 私有通信协议的设计，以及SOFABolt 编解码原理，最后还会介绍一下相较于 Netty，我们做出的优化。"
tags: ["SOFABolt","SOFALab","剖析 | SOFABolt 框架"]
categories: "SOFABolt"
aliases: "/posts/2018-12-06-03"
cover: "/cover.jpg"
---

## 前言

SOFABolt 是一个基于 Netty 最佳实践的轻量、易用、高性能、易扩展的通信框架。目前已经运用在了蚂蚁中间件的微服务，消息中心，分布式事务，分布式开关，配置中心等众多产品上。

本文将分析SOFABolt的超时控制和心跳机制。

## 超时

在程序中，超时一般指的是程序在特定的等待时间内没有得到响应，网络通信问题、程序BUG等等都会引起超时。系统引入超时机制往往是为了解决资源的问题，比如一个同步RPC请求，在网络不稳定的情况下可能一直无法得到响应，那么请求线程将一直等待结果而无法执行其它任务，最终导致所有线程资源耗尽。超时机制正是为了解决这样的问题，在特定的等待时间之后触发一个“超时事件”来释放资源。

在一个网络通信框架中，超时问题无处不在，连接的建立、数据的读写都可能遇到超时问题。并且网络通信框架作为分布式系统的底层组件，需要管理大量的连接，如何建立一个高效的超时处理机制就成为了一个问题。

## 时间轮（TimeWheel）

在网络通信框架中动辄管理上万的连接，每个连接上都有很多的超时任务，如果每个超时任务都启动一个java.util.Timer，不仅低效而且会占用大量的资源。George Varghese 和 Tony Lauck在1996年发表了一篇论文：[《Hashed and Hierarchical Timing Wheels: EfficientData Structures for Implementing a Timer Facility》](http://www.cs.columbia.edu/~nahum/w6998/papers/ton97-timing-wheels.pdf)来高效的管理和维护大量的定时任务。

![时间轮](https://cdn.nlark.com/yuque/0/2018/jpeg/172326/1543904924736-30fc7d36-3ad3-494c-9992-fbede9b2e1f8.jpeg)

时间轮其实就是一种环形的数据结构，可以理解为时钟，每个格子代表一段时间，每次指针跳动一格就表示一段时间的流逝（就像时钟分为60格，秒针没跳动一格代表一秒钟）。时间轮每一格上都是一个链表，表示对应时间对应的超时任务，每次指针跳动到对应的格子上则执行链表中的超时任务。时间轮只需要一个线程执行指针的“跳动”来触发超时任务，且超时任务的插入和取消都是O(1)的操作，显然比java.util.Timer的方式要高效的多。

## SOFABolt的超时控制机制

![SOFABolt 的超时控制机制](https://cdn.nlark.com/yuque/0/2018/png/172326/1543906537277-2d04ec2d-ddf9-4238-a645-70d1b7411e32.png)

如上图所示，SOFABolt中支持四中调用方式：

- oneway：不关心调用结果，所以不需要等待响应，那么就没有超时
- sync：同步调用，在调用线程中等待响应
- future：异步调用，返回future，由用户从future中获取结果
- callback：异步调用，异步执行用户的callback
  在oneway调用中，因为并不关心响应结果，所以没有超时的概念。下面具体介绍SOFABolt中同步调用（sync）和异步调用（future\callback）的超时机制实现。

### 同步调用的超时控制实现

同步调用中，每一次调用都会阻塞调用线程等待服务端的响应，这种场景下同一时刻产生最大的超时任务取决于调用线程的数量。线程资源是非常昂贵的，用户的线程数是相对可控的，所以这种场景下，SOFABolt使用简单的java.util.concurrent.CountDownLatch来实现超时任务的触发。

![同步调用的超时控制实现](https://cdn.nlark.com/yuque/0/2018/png/172326/1543907762569-831f6e96-1264-4e0a-98c6-36ac247a03a6.png)

SOFABolt同步调用的代码如上，核心逻辑是：

1. 创建InvokeFuture
1. 在Netty的ChannelFuture中添加Listener，在写入操作失败的情况下通过future.putResponse方法修改Future状态（正常服务端响应也是通过future.putResponse来改变InvokeFuture的状态的，这个流程不展开说明）
1. 写入出现异常的情况下也是通过future.putResponse方法修改Future状态
1. 通过future.waitResponse来执行等待响应
   其中和超时相关的是future.waitResponse的调用，InvokeFuture内部通过java.util.concurrent.CountDownLatch来实现超时触发。

![超时控制](https://cdn.nlark.com/yuque/0/2018/png/172326/1543908625875-ba9d1779-d590-42b5-8b02-01280e5fa677.png)

`java.util.concurrent.CountDownLatch#await(timeout, timeoutUnit)` 方法实现了等待一段时间的逻辑，并且通过countDown方法来提前中断等待，SOFABolt中InvokeFuture通过构建new CountDownLatch(1)的实例，并将await和countDown方法包装为awaitResponse和putResponse来实现同步调用的超时控制。

### 异步调用的超时控制实现

相对于同步调用，异步调用并不会阻塞调用线程，那么超时任务的数量并不受限于线程对的数量，用户可能通过一个线程来触发量大的请求，从而产生大量的定时任务。那么我们需要一个机制来管理大量的定时任务，并且作为系统底层的通信框架，需要保证这个机制尽量少的占用资源。上文已经提到TimeWheel是一个非常适合于这种场景的数据结构。

Netty中实现了TimeWheel数据结构：io.netty.util.HashedWheelTimer，SOFABolt异步调用的超时控制直接依赖于Netty的io.netty.util.HashedWheelTimer实现。

Future模式和Callback模式在超时控制机制上一致的，下面以Callback为例分析异步调用的超时控制机制。

![异步调用的超时控制实现](https://cdn.nlark.com/yuque/0/2018/png/172326/1543909805826-4331eb01-0bd5-46a2-a31e-a1368db14f41.png)

SOFABolt异步调用的代码如上，核心逻辑是：

1. 创建InvokeFuture
1. 创建Timeout实例，Timeout实例的run方法中通过future.putResponse来修改InvokeFuture的状态
1. 在Netty的ChannelFuture中添加Listener，在写入操作失败的情况下通过future.cancelTimeout来取消超时任务，通过future.putResponse来修改InvokeFuture的状态
1. 在写入异常的情况下同样通过future.cancelTimeout来取消超时任务，通过future.putResponse来修改InvokeFuture的状态
   在异步调用的实现中，通过Timeout来触发超时任务，相当于同步调用中的`java.util.concurrent.CountDownLatch#await(timeout, timeoutUnit)`。`Future#cancelTimeout()`方法则是调用了Timeout的cancel来取消超时任务，相当于同步调用中通过 `java.util.concurrent.CountDownLatch#countDown()` 来提前结束超时任务。具体超时任务的管理则全部委托给了Netty的Timer实现。
   另外值得注意的一点是SOFABolt在使用Netty的Timer时采用了单例的模式，因为一般情况下使用一个Timer管理所有的超时任务即可，这样可以节省系统的开销。

### Fail-Fast机制

以上关于SOFABolt的超时机制介绍都是关于SOFABolt客户端如何完成高效的超时任务管理的，其实在SOFABolt的服务端同样针对超时的场景做了优化。

客户端为了应对没有响应的情况，增加了超时机制，那么就可能存在服务端返回一个响应但是客户端在收到这个响应之前已经认为请求超时了，移除了相关的请求上下文，那么这个响应对客户端来说就没有意义了。既然这个响应对客户端来说是没有意义的，那么服务端其实可以进一步优化：在确认请求已经超时的情况下，服务端可以直接丢弃请求来减轻服务端的处理负担，SOFABolt把这个机制称为Fail-Fast。

![Fail-Fast机制](https://cdn.nlark.com/yuque/0/2018/png/172326/1543915691509-33fd55b6-a07d-429d-8ead-a83185670046.png)

如上图所示，请求可能在服务端积压了一段时间，此时这些请求在客户端看来已经超时了，如果服务端继续处理这些超时的请求，第一请求的响应最终会被客户端丢弃；第二可能加剧服务端的压力导致后续更多请求超时。通过Fail-Fast机制直接丢弃掉这批请求能减轻服务端的负担使服务端尽快恢复并提供正常的服务能力。

Fail-Fast机制是一个明显的优化手段，唯一面临的问题是如何确定一个请求已经超时。注意，一定不要依赖跨系统的时钟，因为时钟可能不一致，从而导致未超时的请求被误认为超时而被服务端丢弃。

SOFABolt采用了请求被处理时的时间和请求到达服务端的时间来判定请求是否已经超时，如下图所示：

![超时控制机制](https://cdn.nlark.com/yuque/0/2018/png/172326/1543916153205-742acbc1-efed-4061-b1a8-a9dadaecf648.png)

这样会有一小部分客户端认为已经超时的请求服务端还会处理（因为网络传输是需要时间的），但是不会出现误判的情况。

## SOFABolt的心跳机制

除了上文提供的超时机制外，在通信框架中往往还有另一类超时，那就是连接的超时。

<span data-type="color" style="color:rgb(38, 38, 38)"><span data-type="background" style="background-color:rgb(255, 255, 255)">我们知道，一次 tcp 请求大致分为三个步骤：建立连接、通信、关闭连接。每次建立新连接都会经历三次握手，中间包含三次网络传输，对于高并发的系统，这是一笔不小的负担。所以在通信框架中我们都会维护一定数量的连接，其中一个手段就是通过心跳来维持连接，避免连接因为空闲而被回收。</span></span>

Netty提供了IdleStateHandler，如果连接空闲时间过长，则会触发IdleStateEvent。SOFABolt基于IdleStateHandler的IdleStateEvent来触发心跳，一来这样可以通过心跳维护连接，二来基于IdleStateEvent可以减少不必要的心跳。

SOFABolt心跳相关的处理有两部分：客户端发送心跳，服务端接收心跳处理并返回响应。

![SOFABolt的心跳机制](https://cdn.nlark.com/yuque/0/2018/png/172326/1543921939599-07266d64-0020-4325-939d-a335860d64bd.png)

上面是客户端触发心跳后的代码，当客户端接收到IdleStateEvent时会调用上面的heartbeatTriggered方法。
在Connection对象上会维护心跳失败的次数，当心跳失败的次数超过系统的最大次时，主动关闭Connection。如果心跳成功则清除心跳失败的计数。同样的，在心跳的超时处理中同样使用Netty的Timer实现来管理超时任务（和请求的超时管理使用的是同一个Timer实例）。

![SOFABolt的心跳机制](https://cdn.nlark.com/yuque/0/2018/png/172326/1543922386426-1d444437-3d52-4174-af36-91a644335961.png)

RpcHeartbeatProcessor是SOFABolt对心跳处理的实现，包含对心跳请求的处理和心跳响应的处理（服务端和客户端复用这个类，通过请求的数据类型来判断是心跳请求还是心跳响应）。

如果接收到的是一个心跳请求，则直接写回一个HeartbeatAckCommand（心跳响应）。如果接收到的是来自服务端的心跳响应，则从Connection取出InvokeFuture对象并做对应的状态变更和其他逻辑的处理：取消超时任务、执行Callback。如果无法从Connection获取InvokeFuture对象，则说明客户端已经判定心跳请求超时。

另外值得注意的一点是，SOFABolt中心跳请求和心跳响应对象都只包含RequestCommand和ResponseCommand的必要字段，没有额外增加任何属性，这也是为了减少不必要的网络带宽的开销。

## 总结

本文简单的介绍了TimeWheel的原理，SOFABolt的超时控制机制和心跳机制的实现。SOFABolt基于高效的TimeWheel实现了自己的超时控制机制，同时增加Fail-Fast策略优化服务端对超时请求的处理。另外SOFABolt默认实现了连接的心跳机制，以保持系统空闲时连接的可用性，这些都为SOFABolt的高性能打下了坚实的基础。
