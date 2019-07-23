---
author: "颜洄、丞一"
date: 2018-12-06T10:20:00.000Z
title: "蚂蚁金服开源通信框架 SOFABolt 协议框架解析"
tags: ["SOFABolt"]
aliases: "posts/2018-12-06-01"
description: "本文是对蚂蚁金服开源通信框架 SOFABolt 的协议框架解析。"
cover: "/cover.jpg"
categories: "SOFABolt"
---

## 1. 前言

为了让中间件开发者们将更多的精力投入到产品的功能特性上，而不是重复的写通信层框架，蚂蚁中间件团队设计并实现了SOFABolt。 Bolt 名字取自迪士尼动画-闪电狗，是一个基于 Netty 最佳实践的轻量、易用、高性能、易扩展的通信框架。蚂蚁中间件的同学这些年在微服务和消息中间件上解决了很多网络通信的问题，积累了很多经验，并将这些经验、解决方案沉淀到了SOFABolt这个项目中，希望能让更多需要使用网络通信的团队、开发者受益。目前SOFABolt已经运行在蚂蚁中间件的微服务 ([SOFARPC](https://github.com/sofastack/sofa-rpc))、消息中心、分布式事务、分布式开关、以及配置中心等众多产品上。

## 2. 主要特性

SOFABolt核心功能包括三大块：

- 网络通信能力
- 协议框架
- 私有协议实现

**网络通信能力** 网络通信能力（remoting-core）可以理解为Netty的最佳实践，并额外进行了一些优化工作，包含：

- 基于Netty的高效的网络IO于线程模型的应用
- 链接管理（无锁建连、定时断连、自动重连）
- 通信模型（oneway、sync、callback、future）
- 超时控制
- 批量解包和批量提交处理
- 心跳于IDLE机制

**协议框架** 协议框架（protocol-skeleton）包含命令处理器、编解码器等，是底层通信能力之上，具体私有协议之下，连接通信能力和私有协议的中间层。网络通信层是SOFABolt对Netty的封装和功能增强，协议框架则是SOFABolt对网络请求处理流程的抽象，是用户可以不关心底层细节快速实现自己的处理器来完成网络请求的处理逻辑，是用户可以进行拓展来实现自定义的私有协议的基础，也是本篇文章分析的内容。

**私有协议实现** 由于性能、安全性等等的原因，很多中间件都会采用私有协议进行通信。SOFABolt除了提供基础的通信能力、协议框架之外，还提供了默认的RPC协议的实现，这样它就是一个完整的通信框架，用户可以不关心协议而直接上手使用。本篇文章主要分析SOFABolt的协议框架的设计和实现，不展开对SOFABolt中的RPC协议实现做介绍。

## 3. 协议框架

协议框架整体如下：

![image.png | left | 747x206](https://cdn.nlark.com/yuque/0/2018/png/172326/1542523832420-2304f719-ac43-455a-8f03-6d478a05865f.png)

- Command：协议命令，通讯数据的顶层抽象。从交互的角度可以分为Request（请求）于Response（响应），从功能的角度，分为负载命令（交换业务数据）和控制命令（进行系统的管理、协调等）。
- CommandEncoder/CommandDecoder：协议命令的编解码器，自定义协议实现的基础，编解码器完成对象和字节数组之间的相互转换。
- CommandHandler：协议命令的处理器，命令处理入口，负责分发、处理命令。
- CommandFactory：协议命令工厂类，负责创建协议命令对象。
- HeartbeatTrigger：心跳的处理器，用户用户拓展特定的心跳机制的处理。 下面以SOFABolt中默认实现的RPC协议为例来介绍SOFABolt协议框架的实现。

### 3.1 请求的处理流程

一个请求处理流程大致如下：

1. 通过CommandFactory构建请求对象
1. 通过CommandEncoder对请求对象进行编码，写入到网络连接
1. 服务端从连接中读取数据，通过CommandDecoder解析成请求对象
1. CommandHandler接收请求对象，进行分发和处理

![image.png | left | 632x534](https://cdn.nlark.com/yuque/0/2018/png/172326/1542535048013-bf091366-d7ab-489a-be0a-34d98459960c.png)

CommandFactory是一个工厂类，比较简单，不展开介绍。编解码相关内容见《SOFABolt编解码机制》。下面介绍一下CommandHandler对请求的分发和处理。

![carbon (1).png | left | 747x230](https://cdn.nlark.com/yuque/0/2018/png/172326/1542680035000-1a6585d4-cdbd-462e-908b-66be63355752.png)

上面是SOFABolt中RpcHandler的代码片段，这段代码是命令处理的入口：

1. 首先从连接的上下文中获取使用的协议的版本ProtocolCode
1. 再根据ProtocolCode从ProtocolManager中获取具体的协议
1. 之后从协议中获取CommandHandler，并构造请求的上下文信息和请求的对象（代码片段中的msg）提交处理

上面的处理逻辑中透露出一个信息：SOFABolt支持同时运行多个版本的协议，通过ProtocolCode来区分协议。这一点可以使得系统在做升级或重构时，需要同时支持新老系统不同协议时变得简单。

![carbon (2).png | left | 747x603](https://cdn.nlark.com/yuque/0/2018/png/172326/1542680327753-f10704cd-3dde-4588-924b-f40cd7d06cfe.png)

上面是CommandHandler的代码片段，透露出的信息是SOFABolt支持批量提交请求，这在[《SOFABolt编解码机制》](https://www.yuque.com/sofaboltlab/sofabolt/spza7y)一文中也有部分介绍。而具体的process流程如下：

![carbon (3).png | left | 747x256](https://cdn.nlark.com/yuque/0/2018/png/172326/1542680393299-4bde1ad6-d0a5-4672-958d-271c1274fe7c.png)

通过Command对象获取CommandCode，根据CommandCode获取对应的RemotingProcessor进行处理。 CommandCode是一个接口，只有一个返回short的value()方法，表示Command的具体类型，每个请求都需要有自己的CommandCode来标识自己的类型。框架通过一个Map来维护CommandCode和RemotingProcessor的关系，每个CommandCode需要有对应的RemotingProcessor进行处理，一个RemotingProcessor可以处理多个CommandCode的请求。

![carbon (4).png | left | 747x927](https://cdn.nlark.com/yuque/0/2018/png/172326/1542680714009-cd05d61a-04b5-4b1a-8405-0fe3d1215608.png)

再往下看一层，请求会被提交到RemotingProcessor中处理。上面是RpcRequestProcessor处理请求的代码片段，处理流程中会通过cmd.getRequestClass()来获取请求的对象的Class名称，再获取对应的UserProcess进行处理（具体处理不再上面的代码片段中）。 对用户来说，只需要实现自己的Command对象、实现自己的UserProcessor并注册到ProcessorManager中，就可以完成自己的网络通信。 以上是一个请求在SOFABolt的协议框架下的处理流程和核心代码的分析。

### 3.2 协议框架的拓展机制

通过对请求处理流程的分析可以感受到SOFABolt的协议框架是支持多协议版本运行，能直接使用，也支持进行拓展来实现更丰富和定制化的功能。下面具体介绍SOFABolt的拓展机制。

![image.png | left | 747x259](https://cdn.nlark.com/yuque/0/2018/png/172326/1542531912123-7d6bc491-c784-45b0-b9ee-6ef476d8ae62.png)

上图是RemotingCommand在处理过程中的路由示意图。第一层路由根据ProtocolCode进行，第二层路由根据CmdCode进行，第三层路由则根据RequestClass进行。用户可以在每一层进行扩展来实现自己的处理。 这种设计具有很好的拓展性和灵活性，ProtocolCode用于区分“大版本”的协议，适用于协议发生较大的变化的场景。CmdCode则标识请求类型，比如在RPC场景中CmdCode可能就两个：RPC_REQUEST、RPC_RESPONSE，而在消息场景中CmdCode可能会更丰富一些，比如有发送消息、批量发送消息、投递消息等等。RequestClass是Command上承载的数据的类型，用户根据不同的类名进行不同的业务逻辑的实行。

实际应用中，以RPC的场景为例，用户更多的是去实现UserProcessor来完成不同的业务逻辑的处理。而在消息的场景中，因为消息承载的是二进制的数据，所以请求的数据类型是固定的，系统更多的是拓展CmdCode来执行不同类型的请求的处理，比如心跳请求的处理、写入消息的处理、批量写入消息的处理等等。SOFABolt协议框架的设计和实现，具备较好的可拓展性，使其能应用于蚂蚁的RPC框架、消息中心、分布式开关、配置中心等多个中间件。

### 3.3 使用SOFABolt自定义协议

在了解了SOFABolt协议框架的基础结构、请求处理流程、拓展机制后，我们来尝试分析如何使用SOFABolt以更深入的理解它的协议框架。

下面以应用到RPC框架中为例进行分析。使用SOFABolt的第一步就是实现自己需要的Command。因为SOFABolt中已经包含了默认的RPC协议的实现，所以在RPC的场景中，并不需要拓展Command类。

![image.png | left | 747x662](https://cdn.nlark.com/yuque/0/2018/png/172326/1542593946459-8821e1c3-e09f-4e4f-bc1e-e94d81ef1454.png)

SOFABolt中也提供了CommandFactory的默认实现：RpcCommandFactory，所以这块也不需要进行拓展。

![image.png | left | 747x706](https://cdn.nlark.com/yuque/0/2018/png/172326/1542594055684-58959f82-718a-4ef3-8591-99031d170bd8.png)

同样的，SOFABolt中也包含了CommandEncoder和CommandDecoder的实现，所以对于一个RPC应用而言，唯一需要拓展实现的就是在服务端注册自己的UserProcessor：RpcServer#registerUserProcessor(UserProcessor）。

![image.png | left | 747x538](https://cdn.nlark.com/yuque/0/2018/png/172326/1542594199643-ec9b864b-3a79-4e8a-8c81-2ff0a7bd0d2e.png)

上面是UserProcessor相关的类图，主要分两类：注册到单一数据类型上的UserProcessor和支持注册到多个类型的MultiInterestUserProcessor。 MultiInterestUserProcessor在UserProcessor的基础上增加了multiInterest()方法，框架将此Processor注册到multiInterest()方法返回的多个数据类型上，这样便于一个Processor处理多种数据类型的请求的场景。 用户只需要根据自己的需求，选择是否使用MultiInterestUserProcessor。再进一步根据是否需要同步处理来选择继承Sync或者Async的UserProcessor子类即可。那么对于一个RPC的使用场景来说，实现UserProcessor并注册到RpcServer和RpcClient即是所有的开发工作。

## 4. 总结

本文首先对SOFABolt做了简要的介绍，之后介绍了SOFABolt协议框架的整体结构、Command的处理流程、拓展机制，之后通过分析如何使用SOFABolt来加深对SOFABolt协议框架及其拓展性的理解。本文没有展开说明SOFABolt中协议的细节，这个可以在《SOFABolt编解码机制》中找到对应的解析。
