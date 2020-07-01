---
title: "走出微服务误区：避免从单体到分布式单体"
author: "敖小剑"
authorlink: "https://skyao.io"
description: "本文从“分布式单体”问题出发，介绍通过引入非侵入式方案和引入Event/EDA 来走出微服务实践误区：从单体到微服务，却最后沦为分布式单体。"
categories: "微服务"
tags: ["微服务","分布式"]
date: 2020-06-29T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1593574413420-3054d578-c219-4ae7-9f45-f9dfbd47cb65.jpeg"
---

> 最近社区频繁出现的对微服务的各种质疑和反思的声音，甚至放弃微服务回归单体。本文从“分布式单体”问题出发，介绍通过引入非侵入式方案和引入Event/EDA 来走出微服务实践误区：从单体到微服务，却最后沦为分布式单体。

## 回顾：从单体到微服务到 Function

在过去几年间，微服务架构成为业界主流，很多公司开始采用微服务，并迁移原有的单体应用迁移到微服务架构。从架构上，微服务和单体最大的变化在于微服务架构下应用的粒度被“拆小”：将所有业务逻辑都在一起的单体应用，按照领域模型拆分为多个内聚而自治的“更小”的应用。而 Function 则在拆分上更进一步，拆分粒度变成了“单个操作”，基于 Function 逐渐演进出现 FaaS 形态和 Serverless 架构。

![evolation](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1593404046625-a6d6fa26-6345-49c1-adfc-247ea3f3cc2e.jpeg)

在微服务和 Serverless 的喧嚣中，也逐渐出现了很多质疑和反对的声音：越来越多的人发现，当他们兴冲冲的迁移单体应用到微服务和 Serverless 架构之后，得到的收益并没有期望中的那么理想。最近，出现了对微服务的各种质疑、反思的声音，甚至放弃微服务回归单体。举例，我在 [InfoQ 中国网站](https://www.infoq.cn/) 简单搜索关键字“微服务”，前三页中就出现了如下的内容：

- [我们为什么停用微服务？](https://www.infoq.cn/article/zpi6lLdKaKB3MCLdPiAB)
- [这些公司为什么放弃微服务？](https://www.infoq.cn/article/KSzctluch2ijbRbKYBgO)
- [什么？你的团队没有100人，那就不要用微服务了！](https://mp.weixin.qq.com/s?__biz=MzIzNjUxMzk2NQ==&mid=2247495266&idx=1&sn=d968d7cf2c67c8a56ab55bfa70ab671e&chksm=e8d411a0dfa398b67726e8d859c26ce86c968e90922e148bfcead2095109f47ab5f5bb366d2f&scene=27)
- [致传统企业朋友：不够痛就别微服务，有坑](https://www.infoq.cn/article/Nd0RofAUp0WtlvlQArbu)
- [微服务带来的心理阴影](https://mp.weixin.qq.com/s?__biz=MzI4MTY5NTk4Ng==&mid=2247493913&idx=3&sn=157abdc9f5f78cf24925fb24c058e61c&chksm=eba7ea84dcd06392cb0b59437e032cdc60f10942b1fb1eefeb2a74e9fbe00df5d51fe363a442&scene=27)
- [微服务到底该多大？如何设计微服务的粒度？](https://mp.weixin.qq.com/s?__biz=MzIzNjUxMzk2NQ==&mid=2247494671&idx=1&sn=5a61a5e99f706c9cf5416bd7ff2b140a&chksm=e8d413cddfa39adb5ec1ee71cf024b2bf2a6b4cf2a36ff1c58d81e96b015b79b465e0b7ddc77&scene=27)
- [Uber 团队放弃微服务改用宏服务，网友评论炸锅了](https://mp.weixin.qq.com/s?__biz=MzIzNjUxMzk2NQ==&mid=2247493824&idx=2&sn=3e0b7c1019892d01d81b8c915f9bc9de&chksm=e8d41702dfa39e14eec73a424188fcdd069e12242968930efef3b60594ba925f91d1905dd0c6&scene=21)
- [为什么 Segment 从微服务回归单体](https://mp.weixin.qq.com/s?__biz=MzIzNjUxMzk2NQ==&mid=2247494317&idx=2&sn=440bb04225806538a146fa1b7e4e394b&chksm=e8d4156fdfa39c792772f9e130d1efe10b6f093ce589c80efccbfb3665141464133944326db0&scene=27)

无论是支持还是反对微服务的声音，大多都是着眼于组织架构（康威定律，对应用和代码的 ownership）、微服务拆分（粒度大小，如何识别领域模型和业务边界）、分布式事务（跨多个微服务调用时维持一致性），工具（自动化构建、部署，可测试性，监控，分布式链路跟踪，CI/CD），数据库分离（避免多个微服务尤其是领域模型外的微服务共享数据库）等方面进行合理性分析和观点阐述，相信大家都对这些问题都有了解。

而我今天的文章，将从另外一个角度来看待微服务（也包括 Serverless）实践中存在的误区——辛辛苦苦从单体走到微服务，却最后沦为**分布式单体**。

## 分布式单体

“Distributed Monolith”，分布式单体，这真是一个悲伤的技术术语。而这偏偏是企业采用微服务后通常最容易踏进去的一个“陷阱”，事实上我看到的很多微服务落地最终都是以"分布式单体"收场，无法获得微服务的完整收益。

问题源于微服务实施的方式 —— 按照业务逻辑拆解单体，划分为多个微服务，定义 API 接口，然后通过 REST 或者 RPC 进行远程调用，最终把这些微服务组合起来提供各种业务功能。简单说，就是在业务拆分的基础上，用进程间的**远程调用**简单替代原来进程内的**方法调用**。期间，对于原来使用的各种分布式能力，继续沿用之前的方式，简单说：方式不变，只是粒度变小。

从方法论说这样做无可厚非，这也是微服务采用过程中非常标准的做法。但问题在于，止步于此是不够的 —— 至少存在两个有待继续努力改进的地方。

### 分布式单体起因之一：通过共享库和网络客户端访问分布式能力

分布式能力的共享库和网络客户端是造成分布式单体问题的原因之一，关于这一点，来自 verizon 的 Mohamad Byan 在他的名为 [Avoid the Distributed Monolith!!](https://www.slideshare.net/DevOpsDaysDFW/avoid-the-distributed-monolith) 的演讲中有详细的阐述，我这里援引他的图片和观点：

![shared-library-1](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1593408942900-483a3ae0-4bb5-4e34-8f2a-ad692d079741.jpeg)

上图是微服务体系的逻辑架构，由两部分组成：

1. 内层架构（图上浅蓝色部分），是每个微服务的实现架构；
1. 外层架构（图上黄色部分），是构建强大微服务架构所需要的各种能力，这里通常有大家熟悉的各种分布式能力；

> 特别提示：这里说的“网络客户端”是各种分布式能力的客户端，如服务注册发现/ MQ 中间件/ Redis 等 key-value 存储/数据库/监控日志追踪系统/安全体系等，不是服务间通讯如 RPC 的客户端。

而内层的微服务是通过 **共享类库** 和 **网络客户端** 来访问外层架构提供的分布式能力：

![shared-library-2](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1593408966232-393fda8e-31f8-45dc-adc9-ae8495cbcccf.jpeg)

分布式能力的 **共享类库** 和 **网络客户端** 会迫使内层微服务和外层架构的各种分布式能力之间产生强耦合，增加运维的复杂性（如升级困难造成版本碎片化），多语言受限于类库和网络客户端支持的语言，各种组件（如消息中间件）往往使用自定义数据格式和通讯协议 —— 所有这些迫使内层微服务不得不实质性受限于外层架构的技术选型。

对于 Function，这个问题就更加明显了：Function 的粒度更小，更专注业务逻辑。某些简短的 Function 可能只有几百行代码，但是，为了让这几百行代码运转起来而需要引入的共享类库和网络客户端可能相比之下就规模惊人了。援引一张网上图片作为示意：

![too-many-sdk-dependencies](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1593408988743-7e99a192-460d-45b5-8a3b-ce717454818b.jpeg)

### 分布式单体起因之二：简单用远程调用替代进程内方法调用

在微服务架构改造过程中，熟悉单体系统和架构的开发人员，习惯性的会将这些单体时代的知识和经验重用到新的微服务架构之中。其中最典型的做法就是：在遵循领域模型将现有单体应用按照业务边界拆分为多个微服务时，往往选择用 REST 或者 RPC 等远程调用方式**简单替代**原有的进程内方法调用。

当两个逻辑上的业务模块存在协作需求时：

![invoke](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1593409657310-1e77eece-c498-43c2-b28d-fba9b69be7ee.jpeg)

从单体到微服务，直接方法调用被替换为远程调用（REST 或者 RPC），即使采用 Service Mesh 也只是在链路中多增加了 Sidecar 节点，并未改变远程调用的性质：

![invoke2](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1593409671582-2c21f6b6-e6ac-4f17-9008-d89837a96d8f.jpeg)

这导致了前面所说的 “分布式单体”：

- 在微服务之前：应用程序由多个耦合在一起的**模块**组成，这些模块通过内存空间进行方法调用…..
- 在微服务之后：应用程序由多个耦合在一起的**微服务**组成，这些微服务通过网络进行远程调用…..

抛开调用方式的差异来看采用微服务前后的系统架构，会发现：两者几乎是完全一样的！！

![same-architecture](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1593409700883-183e89a2-2fe8-4118-8368-ee337ac985d1.jpeg)

而微服务版本在某些情况下可能表现的更糟糕：因为调用方式更脆弱，因为网络远比内存不可靠。而我们将网络当成 “胶水” 来使用，试图把分散的业务逻辑模块（已经拆分为微服务）按照单体时代的同样方式简单粘在一起，这当然比单体在同一个进程内直接方法调用更加的不可靠。

> 关于这一点，在 ["The Eight Fallacies of Distributed Computing/分布式计算的8个谬论"](https://www.red-gate.com/simple-talk/blogs/the-eight-fallacies-of-distributed-computing/) 一文中有详细阐述。

类似的，在采用 Function 时，如果依然沿用上面的方式，以单体或微服务架构的思维方式和设计模式来创建 FaaS/Serverless 架构：

![invoke3](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1593409713977-a552573d-62ca-4c1c-bf02-09fc063a127d.jpeg)

其本质不会发生变化 —— 不过是将微服务变成粒度更小的函数，导致系统中的远程调用数量大为增加：

![same-architecture2](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1593409732856-147da7b5-1f23-43f3-a5a9-3a66a41abcc9.jpeg)

系统内的耦合并没有发生变化，Serverless 并不能改变微服务中存在的这个内部耦合问题：调用在哪里，则耦合就在哪里！只是把将组件的粒度从 “微服务“换成了 “Function/函数”。

**耦合的存在是源于系统不同组件之间的通讯模式，而不是实现通讯的技术。**

如果让两个组件通过“调用”（后面再展开讲何为**调用**）进行远程通信，那么不管调用是如何实现的，这两个组件都是紧密耦合。因此，当系统从单体到微服务到 Serverless，如果止步于简单的用远程调用替代进程内方法调用，那么系统依然是高度耦合的，从这个角度来说：

**单体应用 ≈ 分布式单体 ≈ Serverless 单体**

### 分布式单体起因小结

上面我们列出了微服务和 Serverless 实践中容易形成“分布式单体”的两个主要原因：

- 通过共享库和网络客户端访问分布式能力；
- 简单用远程调用替代进程内方法调用；

下面我们针对这两个问题探讨解决的思路和对策。

## 引入非侵入式方案：物理隔离+逻辑抽象

前面谈到分布式单体产生的一个原因是“通过共享库和网络客户端访问分布式能力”，造成微服务和 Lambda 函数和分布式能力强耦合。以 Service Mesh 为典型代表的非侵入式方案是解决这一问题的有效手段，其他类似方案有  RSocket / Multiple Runtime Architecture，以及数据库和消息的 Mesh 化产品，其基本思路有两点：

1. **委托**：通过 Sidecar 或者 Runtime 来进行对分布式能力的访问，避免应用和提供分布式能力的组件直接通讯造成强绑定 —— **通过物理隔离进行解耦**；
1. **抽象**：对内层微服务隐藏实现细节，只暴露网络协议和数据契约，将外围架构的各种分布式能力以 API 的方式暴露出来，而屏蔽提供这些能力的具体实现 —— **通过逻辑抽象进行解耦**；

以 Service Mesh 的 Sidecar 为例，在植入 Sidecar 之后，业务应用需要直接对接的分布式能力就大为减少（物理隔离）：

![servicemesh-sidecar](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1593409806413-9a9a9507-73b0-4677-b153-8dfb0a0d008f.jpeg)

最近出现的 Multiple Runtime / Mecha 架构，以及遵循这一架构思想的微软开源产品 Dapr ，则将这个做法推进到服务间通讯之外更多的分布式能力。

![dapr-overview](https://cdn.nlark.com/yuque/0/2020/png/226702/1593410126278-c99e7494-820e-4d64-8a18-56290b81aeac.png)

此外在委托之外，还提供对分布式能力的抽象。比如在 Dapr 中，业务应用只需要使用 Dapr 提供的标准 API，就可以使用这些分布式能力而无法关注提供这些能力的具体产品（逻辑抽象）：

以 pub-sub 模型中的发消息为例，这是 Dapr 提供的 Java 客户端 SDK API：

```java
public interface DaprClient {
	Mono<Void> publishEvent(String topic, Object event);
   Mono<Void> publishEvent(String topic, Object event, Map<String, String> metadata);
}
```

可见在发送事件时，Dapr 完全屏蔽了底层消息机制的具体实现，通过客户端 SDK 为应用提供发送消息的高层抽象，在 Dapr Runtime 中对接底层 MQ 实现——完全解耦应用和 MQ：

![dapr-publish-event](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1593410147489-76c09949-7c79-45ef-ab7f-aa07f3e13bd6.jpeg)

关于 Multiple Runtime / Mecha 架构的介绍不在这里深入展开，有兴趣的同学可以浏览我之前的博客文章 [“Mecha：将 Mesh 进行到底”](https://skyao.io/talk/202004-mecha-mesh-through-to-the-end/) 。

稍后我会有一篇深度文章针对上面这个话题，详细介绍在消息通讯领域和 EDA 架构下如何实现消息通讯和事件驱动的抽象和标准化，以避免业务应用和底层消息产品绑定和强耦合，敬请关注。

## 引入 Event：解除不必要的强耦合

在解决了微服务/ Serverless 系统和外部分布式能力之间紧耦合的问题之后，我们继续看微服务/Serverless 系统内部紧耦合的问题。前面讨论到，从单体到微服务到 Function/Serverless，如果只是简单的将直接方法调用替换为远程调用（REST 或者 RPC），那么两个通讯的模块之间会因为这个紧密耦合的调用而形成依赖，而且依赖关系会伴随调用链继续传递，导致形成一个树形的依赖关系网络，表现为系统间的高度耦合：

![dependency](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1593410167530-cc32f3c8-5fbc-47c4-818b-f15df1651abc.jpeg)

要解决这个问题，基本思路在于审视两个组件之间通讯行为的**业务语义**，然后据此决定两者之间究竟是应该采用 Command/命令模式还是 Event/事件模式。

### 温故而知新：Event 和 Command

首先我们来温习一下 Event 和 Command 的概念和差别，借用一张图片，总结的非常到位：

![event-command](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1593410179366-7659c166-caf7-4247-803b-a50600cb67a9.jpeg)

#### 什么是 Event？

> Event: “A significant change in state” — K. Mani Chandy.

Event 代表领域中**已经发生**的事情：通常意味着有行为（Action）已经发生，有状态（Status）已经改变。

因为是**已经发生**的事情，因此：

- Event 可以被理解为是对已经发生的事实的客观陈述；
- 这意味着 Event 通常是不可变的：Event 的信息（代表着客观事实）不能被篡改，Event 的产生不能逆转；
- 命名：Event 通常以动词的完成时态命名，如 UserRegistredEvent；

产生 Event 的目标是为了接下来的 Event 传播：

- 将已经发生的 Event 通知给对此感兴趣的观察者；
- 收到 Event 的观察者将根据 Event 的内容进行判断和决策：可能会有接下来的动作（Action），有些动作可能需要和其他模块通讯而触发命令（Command），这些动作执行完毕可能会造成领域状态的改变从而继续触发新的事件（Event）；

Event 传播的方式：

- Event 有明确的“源/source”，即 Event 产生（或者说状态改变）的发生地；
- 但由于生产者并不知道（不愿意/不关心）会有哪些观察者对 Event 感兴趣，因此 Event 中并不包含“目的地/Destination”信息；
- Event 通常是通过 MessageQueue 机制，以 pub-sub 的方式传播；
- Event 通常不需要回复（ reply）或者应答（response）；
- Event 通常用发布（publish）；

#### 什么是 Command？

Command 用于传递一个要求执行某个动作（Action）的请求。

Command 代表**将要发生**的事情：

- 通常意味着行为（Action）还未发生但即将发生（如果请求被接受和执行）；
- 存在被拒绝的可能：不愿意执行（参数校验失败，权限不足），不能执行（接收者故障或者资源无法访问）；
- 命名：Command 通常以动词的普通形态命名，如 UserRegisterCommand；

产生 Command 的目标是为了接下来的 Command 执行：

- 将 Command 发送给期望的执行者；
- 收到 Command 的执行者将根据 Command 的要求进行执行：在执行的过程中内部可能有多个动作（Action），有些动作可能需要和其他模块通讯而触发命令（Command），这些动作执行完毕可能会造成领域状态的改变从而继续触发新的事件（Event）；

Command 的传播方式：

- Command 有明确的源（Source），即 Command 的发起者；
- Command 也有非常明确的执行者（而且通常是一个），因此命名通常包含“目的地/Destination”信息；
- Command 通常是通过 HTTP / RPC 这样的点对点远程通讯机制，通常是同步；
- Command 通常需要应答（Response）：回应 Command 是否被执行（因为可能被拒绝），执行结果（因为可能执行失败）；
- Command 通常用发送（Send）；

#### Command 和 Event 总结

总结 —— Command 和 Event 的本质区别在于他们的意图：

- Command 的意图是 **告知希望发生的事情**；
- Event 的意图是 **告知已经发生的事情**；

意图上的差异最终会在服务间依赖关系上有特别的体现：

![denpendency-direction](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1593410197309-4d95877b-8aba-4ea1-bdcb-b835f840f070.jpeg)

- Command 的发起者必须明确知晓 Command 的接收者并明确指示需要做什么（所谓的命令、指示、操纵、编排），尤其当发起者连续发出多个 Command 时，通常这些 Command 会有非常明确的顺序和逻辑关系，以组合为特定的业务逻辑；

Command 的依赖关系简单明确: 发起者 “**显式依赖**” 接收者；

- Event 的发起者只需负责发布 Event，而无需关注 Event 的接收者，包括接收者是谁（一个还是多个）以及会做什么（所谓的通知、驱动、协调）。即使 Event 实际有多个接收者，这些接受者之间往往没有明确的顺序关系，其处理过程中的业务逻辑也往往是彼此独立的。

Event 的依赖关系稍微复杂一些：发起者明确**不依赖**接收者，接收者则存在对发起者 “**隐式的反向依赖**” ——反向是指和 Command 的依赖关系相比方向调转，是接受者反过来依赖发起者；隐式则是指这种依赖只体现于 “接受者依赖 Event，而 Event 是由发起者发布” 的间接关系中，接受者和发起者之间并不存在直接依赖关系。

### 从业务视角出发：关系模型决定通讯行为

在温习完 Command 和 Event 之后，我们再来看我们前面的问题：为什么简单的将直接方法调用替换为远程调用（REST 或者 RPC）会出问题？主要原因是在这个替换过程中，所谓**简单**是指不假思索直接选择远程调用，也就是选择全程 Command 方式：

![dependency-command](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1593410225623-d783e2f2-1c29-4423-9620-7223a01ff78b.jpeg)

真实业务场景下各个组件（微服务或者 Function）的业务逻辑关系，通常不会像上图这么夸张，不应该全是  Command （后面会谈到也不应该全是 Event） ，而应该是类似下图描述的两者结合，以微服务为例（Function 类推）：

![busness-handling](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1593410240430-675dd285-e94e-4736-9640-f4c91e951e90.jpeg)

1. 业务输入：图上微服务A接收到业务请求的输入（可能是 Command 方式，也可能是 Event 方式）
1. 业务逻辑 “**实现**” 的执行过程：
   - 微服务 A 在执行 Command（或者被 Event 触发）的过程中，会有很多动作（Action）；
   - 有些是微服务 A 内部的动作，比如操作数据库，操作 key-value 存储，内存中的业务逻辑处理等；
   - 有些是和外部微服务进行通讯，如执行查询或要求对方进行某些操作，这些通讯方式是以 Command 的形式，如图上和微服务 B 的通讯；
   - 在这些内部和外部动作完成之后，执行过程完成；
   - 如果是 Command，则需要以应答的形式给回 Command 操作的结果；
3. 业务状态变更 **触发** 的后续行为：
   - 在上面的执行过程完成后，如果涉及到业务状态的变更，则需要为此发布事件；
   - 事件通过 event bus 分发给对该事件感兴趣的其他微服务：注意这个过程是解耦的，微服务A不清楚也不关心哪些微服务对此事件感兴趣，事件也不需要应答；

上面微服务 A 的业务逻辑执行处理过程中，需要以 Command 或者 Event 方式和其他微服务通讯，如图中的微服务 B/C/D/E。而对于这些微服务 B/C/D/E（视为微服务 A 的下游服务），他们在接受到业务请求后的处理流程和微服务A的处理流程是类似的。

因此我们可以简单推导一下，当业务处理逻辑从微服务 A 延展到微服务 A 的下游服务（图中的微服务 B/C/D/E）时的场景：

![busness-handling-deeper](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1593410261985-20fbeb1d-4be6-462c-95ec-bf160da7ae78.jpeg)

将图中涉及的微服务 A/B/C/D/E 在处理业务逻辑的行为总结下来，通讯行为大体是一样的：

![busness-handling-cases](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1593410272801-0e79a9e5-19c8-4aa0-8899-6e79b5c0d484.jpeg)

抽象起来，一个典型的微服务在业务处理流程中的通讯行为可以概括为以下四点：

![microservice-abstraction](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1593410292370-c138a743-794e-45ce-a81d-0dd7d0558913.jpeg)

1. **输入**：以一个 Command 请求或者一个 Event 通知为输入，这是业务处理流程的起点；
1. **内部 Action**：微服务的内部逻辑，典型如数据库操作，访问 redis 等 key-value 存储（对应于 Multiple Runtime/Mecha 架构中的各种分布式能力）。可选，通常为 0-N 个；
1. **外部访问**：以 Command 形式访问外部的其他微服务。可选，通常为 0-N 个；
1. **通告变更**：以 Event 形式对外发布事件，通告上述操作产生的业务状态的变更。可选，通常为 0-1 个；

在这个行为模式中，2 和 3 是没有顺序的，而且可能交错执行，而 4 通常都是在流程的最后：只有当各种内部 Action 和外部 Command 都完成，业务逻辑实现结束，状态变更完成，“木已成舟”才能以 Event 的方式对外发布：“操作已完成，状态已变更，望周知”。

这里我们回顾一下前面的总结 —— Event 和 Command 的本质区别在于他们的意图：

- Event 的意图是告知**已经发生**的事情；
- Command 的意图是告知**希望发生**的事情；

从业务逻辑处理的角度来看，外部访问的 Command 和内部操作的 Action 是业务逻辑的 “**实现**” 部分：这些操作组成了完整的业务逻辑——如果这些操作失败，则业务处理将会直接影响（失败或者部分失败）。而发布事件则是业务逻辑完成之后的后续 “**通知**” 部分：当业务逻辑处理完毕，状态变更完成后，以事件的方式驱动后续的进一步处理。注意是**驱动**，而不是直接操纵。

从时间线的角度来看整个业务处理流程如下图所示：

![microservice-timeline](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1593410320229-63fc0786-3e00-42c1-9f35-526c6633c6b6.jpeg)

### 全程 Command 带来的问题：不必要的强耦合

全程 Command 的微服务系统，存在的问题就是在上述最后阶段的“状态变更通知”环节，没有采用 Event 和 pub-sub 模型，而是继续使用 Command 逐个调用下游相关的其他微服务：

![all-commands](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1593410338286-cffe1b13-8247-4e32-b758-be05c32cffab.jpeg)

Event 可以解耦生产者和消费者，因此图中的微服务 A 和微服务 C/D/E 之间没有强烈的依赖关系，彼此无需锁定对方的存在。但是 Command 不同，在采用 Command 方式后微服务 A 和下游相关微服务 C/D/E 会形成强依赖，而且这种依赖关系会蔓延，最终导致形成一颗巨大而深层次的依赖树，而 Function 由于粒度更细，问题往往更严重：

![dependency-command](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1593410494684-9d19e04b-fc7b-4739-b9d2-88b1cd980d00.jpeg)

而如果在“状态变更通知”环节引入 Event，则可以解耦微服务和下游被通知的微服务，从而将依赖关系解除，避免无限制的蔓延。如下图所示，左边图形是使用 Event 代替 Command 来进行状态变更通知之后的依赖关系，考虑到 Event 对生产者和消费者的解耦作用，我们“斩断”绿色的 Event 箭头，这样就得到了右边这样一个被分解为多个小范围依赖树的系统依赖关系图：

![event-decouple-system](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1593410528782-e02d4019-6e22-43e6-b480-868969583fca.jpeg)

对 Event 和 Command 使用的建议：

- 在单体应用拆分为微服务时，不应该简单的将原有的方法调用替换为 Command；
- 应该审视每个调用在业务逻辑上的语义：是业务逻辑执行的组成部分？还是执行完成之后的状态通知？
- 然后据此决定采用 Command 还是 Event；

#### 编排和协调

在 Command 和 Event 的使用上，还有两个概念：编排和协调。

这里强烈推荐一篇博客文章， [Microservices Choreography vs Orchestration: The Benefits of Choreography](https://solace.com/blog/microservices-choreography-vs-orchestration/)，作者 [Jonathan Schabowsky](https://solace.com/blog/author/jonathan-schabowsky/) ，Solace 的 CTO。他在这边博客中总结了让微服务协同工作的两种模式，并做了一个生动的比喻：

1. 编排（Orchestration）：需要主动控制所有的元素和交互，就像指挥家指挥乐团的乐手一样——对应 Command；
1. 协调（Choreography）：需要建立一个模式，微服务会跟随音乐起舞，不需要监督和指令——对应 Event；

![Orchestration-VS-Choreography](https://cdn.nlark.com/yuque/0/2020/png/226702/1593410552260-4e4e37ea-e24d-4f42-9640-93acb1e0cd83.png)

也曾看到很多持类似观点的文章，其中有一张图片印象深刻，我摘录过来：

![what-you-want-what-you-get](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1593410570918-b9940203-929a-4e14-a498-b3080b76213e.jpeg)

左边是**期望**通过编排（Orchestration）方式得到的整齐划一的理想目标，右边是**实际**得到的大型翻车现场。

### 全程 Event 带来的问题：开发困难和业务边界不清晰

在 Command 和 Event 的使用上，除了全程使用 Command 之外，还有一个极端是全程使用 Event，这一点在 Lambda（FaaS）中更常见一些：

![all-events](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1593410584164-c5422e29-beec-4905-8d8a-360f1ffde9af.jpeg)

这个方式首当其冲的问题就是在适用 Command 语义的地方采用了 Event 来替代，而由于 Command 和 Event 在使用语义上的差异，这个替代会显得别扭：

- Command 是一对一的，替代他的 Event 也不得不从 “1:N” 退化为 “1:1”，pub-sub 模型不再存在；
- Command 是需要返回结果的，尤其是 Query 类的 Command 必须要有查询结果，使用 Event 替代之后，就不得不实现 “支持 Response 的 Event”，典型如在消息机制中实现 Request-Reply 模型的；
- 或者引入另外一个 Event 来反向通知结果，即用两个异步 Event 来替代一个同步的 Command —— 这需要让发起者进行额外的订阅和处理，开发复杂性远远超过使用简单的 Command；
- 而且还引入了一个非常麻烦的状态问题：即服务间通讯的上下文中通常是有状态的，Reply Event 必须准确的发送给 Request Event 的发起者的实例，而不能任意选择一个。这使得 Reply Event 不仅仅要 1:1 的绑定订阅者服务，还必须绑定这个服务的特定实例 —— 这样的 Reply Event 已经没法称为 Event 了；

![two-events-as-one-command](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1593410605467-0f7ae7eb-ab61-4c41-b220-7fa90914b082.jpeg)

- 绕开这个状态问题的常见方案是选择无状态的场景，如果处理 Reply Event 时无需考虑状态，那么 Event Reply 才能简单的发送给任意的实例；

对于粒度较大的微服务系统，通常很难实现无状态，所以在微服务中全程采用 Event 通常会比较别扭的，事实上也很少有人这样做。而在粒度非常小的 Function/FaaS 系统中，全程采用 Event 方式比较常见。

关于全程使用 Event，我个人持保留态度，我倾向于即使是在 FaaS 中，也适当保留 Command 的用法：如果某个操作是“业务逻辑”执行中不可或缺的一部分，那么 Command 方式的紧耦合反而更能体现出这个“业务逻辑”的存在：

![command-event-in-faas](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1593410636833-6e749ab8-26bd-45f2-8288-a40ccaac5860.jpeg)

如果完全采用 Event 方式，“彻底”解耦，则产生新的问题（且不论在编码方面额外带来的复杂度） —— 在海量细粒度的 Event 调用下，业务逻辑已经很难体现，领域模型（Domain Modeling）和有界上下文（Bounded Context）则淹没在这些 Event 调用下，难于识别：

![all-command-in-faas](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1593410653468-26c008a4-d4ff-40af-9e91-29bdffada4e6.jpeg)

> 备注：这个问题被称为“Lambda Pinball”，这里不深入展开，后续计划会有一篇文章单独详细探讨“Lambda Pinball”的由来和解决的思路。

### Command 和 Event 的选择：实事求是不偏不倚

总结一下 Command 和 Event 的选择，我个人的建议是不要一刀切：全程 Command 方式的缺点容易理解，但简单替换为全程 Event 也未必合适。

我的个人观点是倾向于从实际“业务逻辑”处理的语义出发，判断：

- 如果是业务逻辑的 “**实现**” 部分：倾向于选择使用 Command；
- 如果是业务逻辑完成之后的后续 “**通知**” 部分：强烈建议选择使用 Event；

![microservice-timeline](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1593410671522-5763d1bb-308e-419b-b183-93612570d30c.jpeg)

## 总结与反思

### 警惕：不要沦为分布式单体

上面我们列出了微服务和 Serverless 实践中容易形成 “分布式单体” 的两个主要原因和对策：

- 通过共享库和网络客户端访问分布式能力：引入非侵入方案解耦应用和各种分布式能力；
- 简单用远程调用替代进程内方法调用：区分 Command 和 Event，引入 Event 来解除微服务间不必要的强耦合；
前者在技术上目前还不太成熟，典型如 Istio/Dapr 项目都还有待加强，暂时在落地上阻力比较大。但后者已经是业界多年的成熟实践，甚至在微服务和 Serverless 兴起之前就广泛使用，因此建议可以立即着手改进。


关于如何更方便的将 Event 和 Event Driven Architecture 引入到微服务和 Serverless中，同时又不与提供 Message Queue 分布式能力的具体实现耦合，我将在稍后文章中详细展开，敬请期待。

### 反思：喧闹和谩骂之外的冷静思考

如果我们在微服务和 Serverless 实践中，始终停留在“用远程调用简单替代进程内方法调用”的程度，并固守单体时代的习惯引入各种 SDK，那么**分布式单体**问题就必然不可避免。我们的微服务转型、Serverless 实践最后得到的往往是：

**把单体变成…… 更糟糕的分布式单体。**

当然，微服务可能成为分布式单体，但这并不意味着微服务架构是个谎言，也不意味着比单体架构更差。Serverless  可能同样遭遇分布式单体（还有后续要深入探讨的 Lambda Pinball），但这也不意味着 Serverless 不可取 —— 微服务和 Serverless 都是**解决特定问题的工具**，和所有的工具一样，在使用工具之前，我们需要先研究和了解它们，学习如何正确的使用它们：

- 需要为微服务创建正确的架构，和单体架构必然会有很大的不同：一定不是“原封不动”的将方法调替换为远程调用，最好不要用共享类库和网络客户端的方式直接使用各种分布式能力；
- **Serverless 更是需要我们对架构进行彻底的反思**，需要改变思维方式，才能保证收益大于弊端；

## 参考资料和推荐阅读

- [Avoid the Distributed Monolith!!](https://www.slideshare.net/DevOpsDaysDFW/avoid-the-distributed-monolith)：来自 verizon 的 Mohamad Byan 在2018年9月的一个演讲，描述微服务实践中的分布式单体陷阱和解决的方式。
- [“Mecha：将Mesh进行到底”](https://skyao.io/talk/202004-mecha-mesh-through-to-the-end/) ：我前段时间的文章，详细介绍 Multiple Runtime / Macha 架构，将更多的分布式能力进行Mesh化。
- [The Eight Fallacies of Distributed Computing](https://www.red-gate.com/simple-talk/blogs/the-eight-fallacies-of-distributed-computing/): 分布式计算领域的经典文章，中文翻译请见 [分布式计算的八大谬论](http://www.xumenger.com/the-eight-fallacies-of-distributed-computing-20180817/)
- [Opportunities and Pitfalls of Event-driven Utopia](https://www.youtube.com/watch?v=jjYAZ0DPLNM): Bernd Rücker 在QCon上的一个演讲，讲述“事件驱动乌托邦的机遇与陷阱”，本文的部分图片来自这份PPT。
- [Practical DDD: Bounded Contexts + Events => Microservices](https://www.infoq.com/presentations/microservices-ddd-bounded-contexts/): Indu Alagarsamy的一个演讲，介绍领域驱动开发（DDD）和 Messaging 的交集。推荐使用消息技术在干净、定义良好的有界上下文之间进行通信，以去除时空耦合。
- [Building Event-Driven Cloud Applications and Services](https://medium.com/@ratrosy/building-event-driven-cloud-applications-and-services-ad0b5b970036): 讨论构建事件驱动的应用和服务的通用实践和技术，是一个序列教程。中文翻译看 [构建事件驱动的云应用和服务](https://skyao.io/post/202004-building-event-driven-cloud-applications-and-services/)
- [The Architect’s Guide to Event-Driven Microservices](https://go.solace.com/wp-download-eventdrivenmicroservices.html): 来自Solace公司网站上的一份PDF格式的小册子,副标题为 “The Architect’s Guide to Building a Responsive, Elastic and Resilient Microservices Architecture / 架构师指南，用于建立响应式的，灵活而弹性的微服务架构。” 中文翻译见 [事件驱动微服务架构师指南](https://skyao.io/post/202004-event-driven-microservices/)
- [致传统企业朋友：不够痛就别微服务，有坑](https://www.infoq.cn/article/Nd0RofAUp0WtlvlQArbu)：网易云刘超刘老师的超级好文章，极其实在而全面的讲述微服务落地需要考虑的方方面面以及各种问题，强烈推荐阅读。
