---
title: "网络通信框架 SOFABolt 功能介绍及协议框架解析 | SOFAChannel#17 直播回顾"
author: "丞一"
authorlink: "https://github.com/dbl-x"
description: "开源网络通信框架 SOFABolt 首次线上直播文字回顾。"
categories: "SOFAChannel"
tags: ["SOFAChannel","SOFABolt"]
date: 2020-07-02T21:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2020/png/226702/1593658384563-9e1e47c1-35a1-4fe5-8043-36dfe494b7bc.png"
---

> <SOFA:Channel/>，有趣实用的分布式架构频道。
> 回顾视频以及 PPT 查看地址见文末。欢迎加入直播互动钉钉群 : 30315793，不错过每场直播。

![SOFAChannel#17](https://cdn.nlark.com/yuque/0/2020/png/226702/1593573337020-6e23c27b-3bc5-4a80-88b7-0e3a00b54c8d.png)

大家好，我是本期 SOFAChannel 的分享讲师丞一，来自蚂蚁集团，是 SOFABolt 的开源负责人。今天我们来聊一下蚂蚁集团开源的网络通信框架 SOFABolt 的框架解析以及功能介绍。本期分享将从以下四个方面展开：

- SOFABolt 简介；
- 基础通信能力解析；
- 协议框架解析；
- 私有协议实现解析；

## SOFABolt 是什么

### SOFABolt 产生背景

相信大家都知道 SOFAStack，SOFAStack(Scalable Open Financial Architecture Stack)是一套用于快速构建金融级云原生架构的中间件，也是在金融场景里锤炼出来的最佳实践。

SOFABolt 则是 SOFAStack 中的网络通信框架，是一个基于 Netty 最佳实践的轻量、易用、高性能、易扩展的通信框架，他的名字 Bolt 取自迪士尼动画《闪电狗》。他一开始是怎么在蚂蚁集团内部产生的，我们可以类比一下 Netty 的产生原因：

- 为了让 Java 程序员能将更多的精力放在基于网络通信的业务逻辑实现上，而不是过多的纠结于网络底层 NIO 的实现以及处理难以调试的网络问题，Netty 应运而生；
- 为了让中间件开发者能将更多的精力放在产品功能特性实现上，而不是重复地一遍遍制造通信框架的轮子，SOFABolt 应运而生；

这些年，在微服务与消息中间件在网络通信上，蚂蚁集团解决过很多问题、积累了很多经验并持续进行着优化和完善，我们把总结的解决方案沉淀到 SOFABolt 这个基础组件里并反馈到开源社区，希望能够让更多使用网络通信的场景受益。目前该组件已经运用在了蚂蚁集团中间件的微服务 (SOFARPC)、消息中心、分布式事务、分布式开关、以及配置中心等众多产品上。

同时，已有数家企业在生产环境中使用了 SOFABolt，感谢大家的肯定，也希望 SOFABolt 可以给更多的企业带来实践价值。

![SOFABolt 企业用户](https://cdn.nlark.com/yuque/0/2020/png/226702/1593573337094-b3c35d2f-1853-438e-993f-d0ce3ed77b3a.png)

以上企业信息根据企业用户 Github 上反馈统计 — 截止 2020.06。

SOFABolt：[https://github.com/sofastack/sofa-bolt](https://github.com/sofastack/sofa-bolt)

### SOFABolt 框架组成

SOFABolt 整体可以分为三个部分：

- 基础通信能力（基于 Netty 高效的网络 IO 与线程模型、连接管理、超时控制）；
- 协议框架（命令与命令处理器、编解码处理器）；
- 私有协议实现（私有 RPC 通信协议的实现）；

下面，我们分别介绍一下 SOFABolt 每个部分的具体能力。

## 基础通信能力

### 基础通信模型

![基础通信模型](https://cdn.nlark.com/yuque/0/2020/png/226702/1593573337043-0e656ce7-3a28-41f5-87d6-108235049434.png)

如上图所示，SOFABolt 有多种通信模型，分别为：oneway、sync、future、callback。下面，我们介绍一下每个通信模型以及他们的使用场景。

- oneway：不关注结果，即客户端发起调用后不关注服务端返回的结果，适用于发起调用的一方不需要拿到请求的处理结果，或者说请求或处理结果可以丢失的场景；
- sync：同步调用，调用线程会被阻塞，直到拿到响应结果或者超时，是最常用的方式，适用于发起调用方需要同步等待响应的场景；
- future：异步调用，调用线程不会被阻塞，通过 future 获取调用结果时才会被阻塞，适用于需要并发调用的场景，比如调用多个服务端并等待所有结果返回后执行特定逻辑的场景；
- callback：异步调用，调用线程不会被阻塞，调用结果在 callback 线程中被处理，适用于高并发要求的场景；

oneway 调用的场景非常明确，当调用方不需要拿到调用结果的时候就可以使用这种模式，但是当需要处理调用结果的时候，选择使用同步的 sync 还是使用异步的 future 和 callback？都是异步调用，又如何在 future、callback 两种模式中选择？

显然同步能做的事情异步也能做，但是异步调用会涉及到线程上下文的切换、异步线程池的设置等等，较为复杂。如果你的场景比较简单，比如整个流程就一个调用并处理结果，那么建议使用同步的方式处理；如果整个过程需要分几个步骤执行，可以拆分不同的步骤异步执行，给耗时的操作分配更多的资源来提升系统整体的吞吐。

在 future 和 callback 的选择中，callback 是更彻底的异步调用，future 适用于需要协调多个异步调用的场景。比如需要调用多个服务，并且根据多个服务端响应结果执行逻辑时，可以采用 future 的模式给多个服务发送请求，在统一对所有的 future 进行处理完成协同操作。

### 超时控制机制

在上一部分的通信模型中，除了 oneway 之后，其他三种（sync、future、callback）都需要进行超时控制，因为用户需要在预期的时间内拿到结果。超时控制简单来说就是在用户发起调用后，在预期的时间内如果没有拿到服务端响应的结果，那么这次调用就超时了，需要让用户感知到超时，避免一直阻塞调用线程或者 callback 永远得不到执行。

在通信框架中，超时控制必须要满足高效、准确的要求，因为通信框架是分布式系统的基础组件，一旦通信框架出现性能问题，那么上层系统的性能显然是无法提升的。超时控制的准确性也非常重要，比如用户预期一次调用最多只能执行3秒，因为超时控制不准确导致用户调用时线程被阻塞了4秒，这显然是不能接受的。

![超时控制](https://cdn.nlark.com/yuque/0/2020/png/226702/1593573337097-81dd7b4b-61b0-4eea-9e37-ce56c851748d.png)

SOFABolt 的超时控制采用了 Netty 中的 HashedWheelTimer，其原理如上图。假设一次 tick 表示100毫秒，那么上面的时间轮 tick 一轮表示800毫秒，如果需要在300毫秒后触发超时，那么这个超时任务会被放到'2'的 bucket 中，等到 tick 到'2'时则被触发。如果一个超时任务需要在900毫秒后触发，那么它会被放到如'0'的 bucket 中，并标记 task 的 remainingRounds=1，当第一次 tick 到'0'时发现 remainingRounds 不等于0，会对 remainingRounds 进行减1操作，当第二次 tick 到'0'，发现这个任务的 remainingRounds 是0，则触发这个任务。

如果将时间轮的一次 tick 设置为1秒，ticksPerWheel 设置为60，那么就是现实时钟的秒针，走完一圈代表一分钟。如果一个任务需要再1分15秒后执行，就是标记为秒针走一轮之后指向第15格时触发。关于时间轮的原理推荐阅读下面这篇论文：
《Hashed and Hierarchical Timing Wheels: data structures to efficiently implement a timer facility》。

### 快速失败机制

超时控制机制可以保证客户端的调用在一个预期时间之后一定会拿到一个响应，无论这个响应是由服务端返回的真实响应，还是触发了超时。如果因为某些原因导致客户端的调用超时了，而服务端在超时之后实际将响应结果返回给客户端了会怎么样？

这个响应结果在客户端会被丢弃，因为对应的请求已经因为超时被释放掉，服务端的这个响应会因为找不到对应的请求而被丢弃。既然响应在请求超时之后返回给客户端会被丢弃，那么在确定请求已经超时的情况下服务端是否可以不处理这个请求而直接返回超时的响应给客户端？——这就是 SOFABolt 的快速失败机制。

![快速失败机制](https://cdn.nlark.com/yuque/0/2020/png/226702/1593573337045-5216df2a-bcd2-429d-ad84-e8851f0acf6f.png)

快速失败机制可以减轻服务端的负担，使服务端尽快恢复服务。比如因为某些外部依赖的因素导致服务端处理一批请求产生了阻塞，而此时客户端还在将更多的请求发送到服务端堆积在 Buffer 中等待处理。当外部依赖恢复时，服务端因为要处理已经在 Buffer 中的请求（实际这些请求已经超时，处理这些请求将没有业务意义），而导致后续正常的请求排队阻塞。加入快速失败机制后，在这种情况下可以将 Buffer 中的请求进行丢弃而开始服务当前新增的未超时的请求，使的服务能快速的恢复。

![快速失败机制-2](https://cdn.nlark.com/yuque/0/2020/png/226702/1593573337140-418d0a2c-5c47-4d85-be65-06229feff947.png)

快速失败机制的前提条件是能判断出一个请求已经超时，而判断超时需要依赖时间，依赖时间则需要统一的时间参照。在分布式系统中是无法依赖不同的机器上的时间的，因为网络会有延迟、机器时间的时间会有偏差。为了避免参照时间的不一致（机器之间的时钟不一致），SOFABolt 的快速失败机制只依赖于服务端机器自身的时钟（统一的时间参照），判断请求已经超时的条件为：

**System.currentTimestamp - request.arriveTimestamp > request.timeout**

request.arriveTimestamp 为请求达到服务端时的时间，request.timeout 为请求设置的超时时间，因为请求从客户端发出到服务端需要时间，所以当以到达时间来计算时，如果这个请求已经超时，那么这个请求在客户端侧必然已经超时，可以安全的将这个请求丢弃。

具体分布式系统中时间和顺序等相关的文件推荐阅读《Time, Clocks, and the Ordering of Events in a Distributed System》，Lamport 在此文中透彻的分析了分布式系统中的顺序问题。

## 协议框架

![协议框架](https://cdn.nlark.com/yuque/0/2020/png/226702/1593573337122-f695ebe1-5712-4fb8-bc69-d25e56a1da11.png)

SOFABolt 中包含的协议命令如上图所示。在 RPC 版本的协议命令中只包含两类：RPC 请求/响应、心跳的请求/响应。RPC 的请求/响应负责携带用户的请求数据和响应数据，心跳请求用于连接的保活，只携带少量的信息（一般只包含请求 ID 之类的必要信息即可）。

有了命令之后，还需要有命令的编解码器和命令处理器，以实现命令的编解码和处理。RemotingCommand 的处理模型如下：

![emotingCommand 的处理模型](https://cdn.nlark.com/yuque/0/2020/png/226702/1593573337117-06f96684-bcfe-45ce-b91e-dd4cf32e58d2.png)

整个请求和响应的过程设计的核心组件如上图所示，其中：

- 客户端侧：
   - Connection 连接对象的封装，封装对底层网络的操作；
   - CommandEncoder 负责编码 RemotingCommand，将 RemotingCommand 按照私有协议编码成 byte 数据；
   - RpcResponseProcessor 负责处理服务端的响应；
- 服务端侧：
   - CommandDecoder 分别负责解码 byte 数据，按照私有协议将 byte 数据解析成 RemotingCommand 对象；
   - RpcHandler 按照协议码将 RemotingCommand 转发到对应的 CommandHandler 处理；
   - CommandHandler 按照 CommandCode 将 RemotingCommand 转发到对应的 RpcRequestProcessor 处理；
   - RpcRequestProcessor 按照 RemotingCommand 携带对象的 Class 将请求转发到用户的 UserProcessor 执行业务逻辑，并将结果通过 CommandDecoder 编码后返回给客户端；

## 私有协议实现

### 内置私有协议实现

SOFABolt 除了提供基础通信能力外，内置了私有协议的实现，可以做到开箱即用。内置的私有协议实现是经过实践打磨的，具备扩展性的私有协议实现。

![内置私有协议](https://cdn.nlark.com/yuque/0/2020/png/226702/1593573337235-fedea632-608d-46d1-bd43-5067b6d9c7df.png)

- proto：预留的协议码字段，当协议发生较大变更时，可以通过协议码进行区分；
- ver1：确定协议之后，通过协议版本来兼容未来协议的小调整，比如追加字段；
- type：标识 Command 类型：oneway、request、response；
- cmdcode：命令码，比如之前介绍的 RpcRequestCommand、HeartbeatCommand 就需要用不同的命令码进行区分；
- ver2：Command 的版本，用于标识同一个命令的不同版本；
- requestId：请求的 ID，用于唯一标识一个请求，在异步操作中通过此 ID 来映射请求和响应；
- codec：序列化码，用于标识使用哪种方式来进行业务数据的序列化；
- switch：协议开关，用于标识是否开启某些协议层面的能力，比如开启 CRC 校验；
- timeout：客户端进行请求时设置的超时时间，快速失败机制所依赖的超时时间；
- classLen：业务请求类的的类名长度；
- headerLen：业务请求头的长度；
- contentLen：业务请求体的长度；
- className：业务请求类的类名；
- header：业务请求头；
- content：业务请求体；
- CRC32：CRC校验码；

### 实现自定义协议

在 SOFABolt 中实现私有协议的关键是实现编解码器（CommandEncoder/CommandDecoder）及命令处理器(CommandHandler)。

![编解码器](https://cdn.nlark.com/yuque/0/2020/png/226702/1593573337236-9a28ac98-32a4-4e94-b906-977dd4526712.png)

上面是为了在 SOFABolt 中实现自定义私有协议锁需要编写的类。SOFABolt 将编解码器及命令处理器都绑定到 Protocol 对象上，每个 Protocol 实现都有一组自己的编解码器和命令处理器。

![Protocol 对象](https://cdn.nlark.com/yuque/0/2020/png/226702/1593573337187-70e8170e-ff79-4ff4-baf0-41f62f49c217.png)

在编解码器中实现自定义的私有协议。在设计私有协议时一定要考虑好协议的可拓展性，以便在未来进行功能增强时不会出现协议无法兼容的情况。

![可拓展性](https://cdn.nlark.com/yuque/0/2020/png/226702/1593573337166-b7c57539-2648-448e-9513-43ac295caaa0.png)

完成编解码之后剩余工作就是实现处理器。处理器分为两块：命令处理入口 CommandHandler 及具体的业务逻辑执行器 RemotingProcessor。

![命令处理入口 CommandHandler](https://cdn.nlark.com/yuque/0/2020/png/226702/1593573337203-7efefc62-20cd-432e-9d9f-9613626b992c.png)

![具体的业务逻辑执行器 RemotingProcessor](https://cdn.nlark.com/yuque/0/2020/png/226702/1593573337213-e0b91a6d-d3d1-495f-9ea6-fd6c292a9898.png)

完成以上工作后，使用 SOFABolt 实现自定义私有协议通信的开发工作基本完成了，但是在实际编写这部分代码时会遇到种种困难及限制，主要体现在以下一些方面：

- 扩展性不足：比如在 RpcClient 中默认使用了内置的编解码器，且没有预留接口进行设置，当使用自定义协议时只能继承 RpcClient 进行覆盖；
- 框架和协议耦合：比如默认提供了 CommandHandler->RemotingProcessor->UserProcessor 这样的处理模型，但是这个模型和协议耦合严重（依赖于 CommandCode 和 RequestCode），导致使用自定义协议时只能自己实现 CommandHandler，然后自己在实现请求的分发逻辑等，相当于要重写 CommandHandler->RemotingProcessor->UserProcessor 这个模型；
- 协议限制：虽然可以通过自定义 Encoder 和 Decoder 实现自定义协议，但是框架内部组织时都依赖 ProtocolCode，导致需要将 ProtocolCode 加入到协议中，限制了用户设计私有协议的自由；

总体而言，当前 SOFABolt 提供了非常强大的通信能力和多年沉淀的协议设计。如果用户需要去适配自己当前已经在运行的私有协议还有可以完善的地方，根本原因还是在于设计之初是贴合这 RPC 框架来设计的（从很多代码的命名上也能看出来），所以在协议和框架的分离上可以做的更好。

## 总结

本次分享从 SOFABolt 整体框架的实现开始，介绍了 SOFABolt 的基础通信模型、超时控制以及快速失败机制，着重分析了私有协议实现的示例，总结而言 SOFABolt 提供了：

- 基于 Netty 的最佳实践；
- 基础的通信模型和高效的超时控制机制、快速失败机制；
- 内置的私有协议实现，开箱即用；

欢迎 Star SOFABolt：[https://github.com/sofastack/sofa-bolt](https://github.com/sofastack/sofa-bolt)

以上就是本期分享的主要内容。因为直播时间有限，关于 SOFABolt 更详细的介绍，可以阅读「剖析 SOFABolt 框架」系列文章，由 SOFABolt 团队以及开源社区同学共同出品：

「剖析 SOFABolt 框架」解析：[https://www.sofastack.tech/blog/](https://www.sofastack.tech/blog/) 点击 tag 「剖析 ｜ SOFABolt 框架」

## one more thing

SOFABolt 目前也存在可以提升完善的地方，在尝试实现完全自定义的私有协议时是相对困难的，需要对代码做一些继承改造。

针对这个现状，我们在“阿里巴巴编程之夏”活动中提交了一个 SOFABolt 的课题：“[拆分 SOFABolt 的框架和协议](https://github.com/sofastack/sofa-bolt/issues/224)”，希望先通过拆分框架和协议，之后再进行模块化的处理，使 SOFABolt 成为一个灵活的、可拓展的通信框架最佳实践！

欢迎大家一起共建来解决这个问题，让 SOFABolt 变得更好：
[https://github.com/sofastack/sofa-bolt/issues/224](https://github.com/sofastack/sofa-bolt/issues/224)

SOFAStack 也欢迎更多开源爱好者加入社区共建，成为社区 Contributor、Committer（emoji 表情）

SOFACommunity：[https://www.sofastack.tech/community/](https://www.sofastack.tech/community/)

### 本期视频回顾以及 PPT 查看地址

<https://tech.antfin.com/community/live/1265>
