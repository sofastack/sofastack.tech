---
author: "水寒"
date: 2018-12-06T10:20:00.000Z
title: "蚂蚁金服开源通信框架SOFABolt解析之编解码机制"
description: "本篇我们会依次介绍编解码的概念， TCP 粘包拆包问题，SOFABolt 私有通信协议的设计，以及SOFABolt 编解码原理，最后还会介绍一下相较于 Netty，我们做出的优化。"
tags: ["SOFABolt","SOFALab","剖析 | SOFABolt 框架"]
categories: "SOFABolt"
aliases: "/posts/2018-12-06-04"
cover: "/cover.jpg"
---

## 基础介绍

SOFABolt 是蚂蚁金融服务集团开发的一套基于 Netty 实现的网络通信框架。

- 为了让 Java 程序员能将更多的精力放在基于网络通信的业务逻辑实现上，而不是过多的纠结于网络底层 NIO 的实现以及处理难以调试的网络问题，Netty 应运而生。
- 为了让中间件开发者能将更多的精力放在产品功能特性实现上，而不是重复地一遍遍制造通信框架的轮子，SOFABolt 应运而生。

Bolt 名字取自迪士尼动画-闪电狗，是一个基于 Netty 最佳实践的轻量、易用、高性能、易扩展的通信框架。 这些年我们在微服务与消息中间件在网络通信上解决过很多问题，积累了很多经验，并持续的进行着优化和完善，我们希望能把总结出的解决方案沉淀到 SOFABolt 这个基础组件里，让更多的使用网络通信的场景能够统一受益。 目前该产品已经运用在了蚂蚁中间件的微服务 ([SOFARPC](https://github.com/sofastack/sofa-rpc))、消息中心、分布式事务、分布式开关、以及配置中心等众多产品上。

# 前言

SOFABolt 提供了设计良好、使用便捷的编解码功能。本篇我们会依次介绍编解码的概念， TCP 粘包拆包问题，SOFABolt 私有通信协议的设计，以及SOFABolt 编解码原理，最后还会介绍一下相较于 Netty，我们做出的优化。欢迎大家与我们讨论交流。

# 编解码介绍

每个网络应用程序都必须定义如何解析在两个节点之间来回传输的原始字节，以及如何将其和目标应用程序的数据格式做相互转换。在一个成熟的通信框架中，我们通常都会通过私有通信协议来描述这种定义，通过编解码技术将理论上的私有通信协议转化为实践。

通过编解码技术，我们可以方便的做一些逻辑，例如双方可以方便的统一序列化与反序列化方式、解决 TCP 拆包粘包问题等。

下面，我们先来看一下 TCP 粘包拆包问题的产生，然后分析 Netty 是如何解决粘包拆包问题的，最后分析 SOFABolt 是如何解决粘包拆包问题的。

# TCP 粘包拆包问题

![拆包](https://cdn.nlark.com/yuque/0/2018/png/162694/1538900561051-e1cea1a0-9d57-4c67-9630-0d950485d699.png)

如上图所示，三种拆包原因见黄色标签说明；两种粘包原因见蓝色标签说明。<span data-type="color" style="color:rgb(61, 70, 77)"><span data-type="background" style="background-color:rgb(255, 255, 255)">TCP 本身是面向流的，它无法从源源不断涌来的数据流中拆分出或者合并出有意义的信息，通常可以通过以下几种方式来解决：</span></span>

- 基于分隔符协议：使用定义的字符来标记一个消息的结尾，在编码的时候我们在消息尾部添加指定的分隔符，在解码的时候根据分隔符来拆分或者合并消息。Netty 提供了两种基于分隔符协议的解码器 LineBasedFrameDecoder 和 DelimiterBasedFrameDecoder。LineBasedFrameDecoder 指定以 \n 或者 \r\n 作为消息的分隔符；DelimiterBasedFrameDecoder 使用用户自定义的分隔符来标记消息的结尾。
- 基于定长消息协议：每一个消息在编码的时候都使用固定的长度，在解码的时候根据这个长度进行消息的拆分和合并。Netty 提供了 FixedLengthFrameDecoder 解码器来实现定长消息解码。
- 基于变长消息协议：每一个消息分为消息头和消息体两部分，在编码时，将消息体的长度设置到消息头部，在解码的时候，首先解析出消息头部的长度信息，之后拆分或合并出该长度的消息体。Netty 提供了 LengthFieldBasedFrameDecoder 来实现变长消息协议解码。
- 基于私有通信协议：Netty 提供了 MessageToByteEncoder 和 ByteToMessageDecoder 两个抽象类，这两个抽象类提供了基本的编解码模板。用户可以通过继承这两个类来实现自定义的编解码器。SOFABolt 通过继承 MessageToByteEncoder 实现了自定义的编码器，通过继承修改版的 ByteToMessageDecoder 来实现了解码器。对于处理 TCP 粘包拆包问题，SOFABolt 实际上也是使用变长消息协议，SOFABolt 的私有通信协议将消息体分为三部分 className、header、body，在消息头对应的提供了 classLen、headerLen、bodyContent 分别标识三部分的长度，之后就可以基于这三个长度信息进行消息的拆分和合并。

对于一个成熟的 rpc 框架或者通信框架来讲，编解码器不仅仅是要处理粘包拆包问题，还要实现一些特有的需求，所以必须制定一些私有通信协议，下面来看一下 SOFABolt 的私有通信协议的设计。

# SOFABolt 私有通信协议的设计

> 以下分析以 SOFABolt 1.5.1 版本为例。SOFABolt 定义了两种协议 RpcProtocol 和 RpcProtocolV2。针对这两种协议，提供了两组不同的编解码器。

## RpcProtocol 协议定义

### 请求命令（协议头长度：22 byte）

![请求命令](https://cdn.nlark.com/yuque/0/2018/png/162694/1539871889980-8b0bf7db-4b9c-4e46-a5a5-aa60f5f194c9.png)

- ProtocolCode ：这个字段是必须的。因为需要根据 ProtocolCode 来进入不同的核心编解码器。该字段可以在想换协议的时候，方便的进行更换。
- RequestType ：请求类型，request / response / oneway 三者之一。oneway 之所以需要单独设置，是因为在处理响应时，需要做特殊判断，来控制响应是否回传。
- CommandCode ：请求命令类型，request / response / heartbeat 三者之一。
- CommandVersion ：请求命令版本号。该字段用来区分请求命令的不同版本。如果修改 Command 版本，不修改协议，那么就是纯粹代码重构的需求；除此情况，Command 的版本升级，往往会同步做协议的升级。
- RequestId ：请求 ID，该字段主要用于异步请求时，保留请求存根使用，便于响应回来时触发回调。另外，在日志打印与问题调试时，也需要该字段。
- Codec ：序列化器。该字段用于保存在做业务的序列化时，使用的是哪种序列化器。通信框架不限定序列化方式，可以方便的扩展。
- Timeout ：超时字段，客户端发起请求时，所设置的超时时间。
- ClassLen ：业务请求类名长度
- HeaderLen ：业务请求头长度
- ContentLen ：业务请求体长度
- ClassName ：业务请求类名。需要注意类名传输的时候，务必指定字符集，不要依赖系统的默认字符集。曾经线上的机器，因为运维误操作，默认的字符集被修改，导致字符的传输出现编解码问题。而我们的通信框架指定了默认字符集，因此躲过一劫。
- HeaderContent ：业务请求头
- BodyContent ：业务请求体

### 响应命令（协议头长度：20 byte）

![响应命令](https://cdn.nlark.com/yuque/0/2018/png/162694/1539871972923-7f014d24-082f-41ae-97c4-852b8d85a0c1.png)

- ResponseStatus ：响应码。从字段精简的角度，我们不可能每次响应都带上完整的异常栈给客户端排查问题，因此，我们会定义一些响应码，通过编号进行网络传输，方便客户端定位问题。

## RpcProtocolV2 协议定义

### 请求命令（协议头长度：24 byte）

![请求命令](https://cdn.nlark.com/yuque/0/2018/png/162694/1539872008024-b51774e7-cfb2-43b9-aba6-ad2ccdc1e754.png)

- ProtocolVersion ：确定了某一种通信协议后，我们还需要考虑协议的微小调整需求，因此需要增加一个 version 的字段，方便在协议上追加新的字段
- Switch ：协议开关，用于一些协议级别的开关控制，比如 CRC 校验，安全校验等。
- CRC32 ：CRC校验码，这也是通信场景里必不可少的一部分，而我们金融业务属性的特征，这个显得尤为重要。

### 响应命令（协议头长度：22 byte）

![响应命令](https://cdn.nlark.com/yuque/0/2018/png/162694/1539872048345-a72c9751-2123-4777-b719-a97ad3cc6e55.png)

SOFABolt 针对 RpcProtocol 和 RpcProtocolV2 这两种协议，提供了两组不同的编解码器。下面我们来看一下编解码器的设计原理。

# SOFABolt 编解码原理

![编解码](https://cdn.nlark.com/yuque/0/2018/png/162694/1538901311763-8e47825f-9580-47e8-b4be-4915be313123.png)

> 上图仅列出编解码中最主要的类。

- RpcCodec 是工厂类，创建 ProtocolCodeBasedEncoder 和 ProtocolCodeBasedDecoder（实际上是其子类），二者被设置为 netty 的编解码器 handler - 工厂模式
- MessageToByteEncoder 提供了编码模板，该类由 netty 本身提供；AbstractBatchDecoder 提供了解码模板，由 SOFABolt 提供，该类是 ByteToMessageDecoder 的 hack 版本，相较于 netty 提供了批量提交的功能 - 模板模式
- ProtocolCodeBasedEncoder 和 ProtocolCodeBasedDecoder 分别是 CommandEncoder 和 CommandDecoder 的代理类，通过不同的 protocol 协议，指定使用不同的编解码器 - 代理模式和策略模式
- 最下层的四个编解码器：Xxx 是 RpcProtocol 协议数据的编解码器；XxxV2 是RpcProtocolV2 协议数据的编解码器

## 编码原理

如上述类图所示，SOFABolt 的编码器 ProtocolCodeBasedEncoder 是继承 MessageToByteEncoder 的，MessageToByteEncoder 为 ProtocolCodeBasedEncoder 提供了编码模板。在 MessageToByteEncoder 中调用了子类 ProtocolCodeBasedEncoder 的实际编码代码，大致流程如下所示：

![编码](https://cdn.nlark.com/yuque/0/2018/png/162694/1539132600285-7b097201-3933-4870-9127-4068432fb7fc.png)

> 上图只列出了部分核心代码，详细代码见 SOFABolt 源码与 Netty 源码。

1. 判断传入的数据是否是 Serializable 类型（该类型由 MessageToByteEncoder 的泛型指定），如果不是，直接传播给 pipeline 中的下一个 handler；否则
1. 创建一个 ByteBuf 实例，用于存储最终的编码数据
1. 从 channel 的附加属性中获取协议标识 protocolCode，之后从协议管理器中获取相应的协议对象
1. 再从协议对象中获取相应的 CommandEncoder 实现类实例，使用 CommandEncoder 实现类实例按照上文所介绍的协议规则将数据写入到第二步创建好的 ByteBuf 实例中
1. 如果原始数据是 ReferenceCounted 实现类，则释放原始数据
1. 如果 ByteBuf 中有数据了，则传播给 pipeline 中的下一个 handler；否则，释放该 ByteBuf 对象，传递一个空的 ByteBuf 给下一个 handler

> 注意：
>
> - 由第一步可知，在 SOFABolt 中，数据要想经过编码器的处理，必须实现 Serializable 接口。
> - 编码器是无状态的，可以标注注解 @ChannelHandler.Sharable

## 解码原理

SOFABolt 的解码器 ProtocolCodeBasedDecoder 是继承 AbstractBatchDecoder 的，AbstractBatchDecoder 为 ProtocolCodeBasedDecoder 提供了解码模板。在 AbstractBatchDecoder 中调用了子类 ProtocolCodeBasedDecoder 的实际解码代码，如下所示：

![解码](https://cdn.nlark.com/yuque/0/2018/png/162694/1539135128561-35304bf9-1027-4533-8994-084a3ced302a.png)

> 上图只列出了部分核心代码

1. 创建或者从 netty 的回收池中获取一个 RecyclableArrayList 实例，用于存储最终的解码数据
1. 将传入的 ByteBuf 添加到 Cumulator 累加器实例中
1. 之后不断的从 ByteBuf 中读取数据：首先解码出protocolCode，之后从协议管理器中获取相应的协议对象，再从协议对象中获取相应的 CommandDecoder 实现类实例
1. 使用 CommandDecoder 实现类实例按照上文所介绍的协议规则进行解码，将解码好的数据放到 RecyclableArrayList 实例中，需要注意的是在解码之前必须先记录当前 ByteBuf 的 readerIndex，如果发现数据不够一个整包长度（发生了拆包粘包问题），则将当前 ByteBuf 的 readerIndex 复原到解码之前，然后直接返回，等待读取更多的数据
1. 为了防止发送端发送数据太快导致OOM，会清理 Cumulator 累加器实例或者其空间，将已经读取的字节删除，向左压缩 ByteBuf 空间
1. 判断 RecyclableArrayList 中的元素个数，如果是1个，则将这个元素单个发送给 pipeline 的下一个 handler；如果元素大于1个，则将整个 RecyclableArrayList 以 List 形式发送给 pipeline 的下一个 handler。后续的 handler 就可以以如下的方式进行消息的处理。

![消息处理](https://cdn.nlark.com/yuque/0/2018/png/162694/1539872080196-1a03b3ef-ba62-4dcb-bfa6-f87317d462ae.png)

7. 回收 RecyclableArrayList 实例

> 注意：解码器是有状态的，不可标注注解 @ChannelHandler.Sharable

最后我们介绍一下 SOFABolt 解码器相较于 Netty 作出的优化。

## SOFABolt 解码器相较于 Netty 作出的优化

![优化](https://cdn.nlark.com/yuque/0/2018/png/162694/1538901784309-408482cb-4c3c-43f3-838a-9dd0fb69a0f1.png)

（图片来自 [蚂蚁通信框架实践](https://mp.weixin.qq.com/s/JRsbK1Un2av9GKmJ8DK7IQ)）

Netty 提供了一个方便的解码工具类 ByteToMessageDecoder ，如图上半部分所示，这个类具备 accumulate 批量解包能力，可以尽可能的从 socket 里读取字节，然后同步调用 decode 方法，解码出业务对象，并组成一个 List 。最后再循环遍历该 List ，依次提交到 ChannelPipeline 进行处理。此处我们做了一个细小的改动，如图下半部分所示，即将提交的内容从单个 command ，改为整个 List 一起提交，如此能减少 pipeline 的执行次数，同时提升吞吐量。这个模式在低并发场景，并没有什么优势，而在高并发场景下对提升吞吐量有不小的性能提升。

# 参考文档

- [蚂蚁通信框架实践](https://mp.weixin.qq.com/s/JRsbK1Un2av9GKmJ8DK7IQ)
- [nio-trick-and-trap](http://jm.taobao.org/2013/11/25/java-nio-trick-and-trap/)
- 《netty实战》

