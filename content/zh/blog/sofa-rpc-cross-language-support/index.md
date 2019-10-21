---
title: "【剖析 | SOFARPC 框架】之SOFARPC 跨语言支持剖析"
author: "鸥波"
authorlink: "https://github.com/SteNicholas"
description: "本文为《剖析 | SOFARPC 框架》第十二篇，作者鸥波。"
categories: "SOFARPC"
aliases: "/posts/__nuo9ph"
tags: ["SOFARPC","剖析 | SOFARPC 框架","SOFALab"]
date: 2018-10-31T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563353611064-bb8307b1-ebfc-4fc8-a7df-cc78665d6823.png"
---

> SOFA
> Scalable Open Financial Architecture
> 是蚂蚁金服自主研发的金融级分布式中间件，包含了构建金融级云原生架构所需的各个组件，是在金融场景里锤炼出来的最佳实践。
> 本文为《剖析 | SOFARPC 框架》第十二篇，作者鸥波。
> 《剖析 | SOFARPC 框架》系列由 SOFA 团队和源码爱好者们出品，
> 项目代号：<SOFA:RPCLab/>，官方目录目前已经全部认领完毕。

## 前言

随着 TIOBE 10月份的编程语言[排行](https://www.tiobe.com/tiobe-index/) 的发布，C++重回第三的位置，新兴的 Swift 和 Go 表现出强劲的上升趋势。与此同时，虽然目前 Java 的领头位置尚未出现有力挑战，我们希望能够在基础设施的建设上预留跨语言的可扩展设计。同时，跨语言的挑战也是工程实际面临的现状，蚂蚁内部如 AI、IoT，算法等缺少 JVM 原生支持的领域，往往不可避免地需要涉及到跨语言调用的问题。

本文将为大家介绍 基于 SOFARPC 的微服务应用在面临跨语言调用时的方案和实现。

## 总体设计

经过前面几篇对 SOFARPC 的 BOLT 协议和序列化这些的介绍，相信大家已经对 RPC 有了一些自己的理解，提到跨语言，我们会首先想到其他语言调用 Java，Java 调用其他语言，那么这里的跨，体现在代码上，到底跨在哪里？

从跨语言的实现上来说，主要解决两个方面的问题：

- 跨语言的通讯协议和序列化协议

- 跨语言服务发现

另外从跨语言的落地来说，还得解决一个平滑兼容的问题。

业界常见的做法是一般是通过 DNS 和 HTTP 来解决跨语言的问题，但是在内部已经有完善技术栈体系的情况下，直接切换一个新的方案显然是不合适的，所以蚂蚁内部是在已有的技术体系基础上进行改进。

蚂蚁内部使用的通讯协议是Bolt，序列化协议是Hessian。我们知道，服务端和客户端在请求和返回之间携带的结构化的业务数据，需要在传输到达对端后，被本地的语言能够易于解析消费。由于语言本身特性的差异，同一对象的在序列化和反序列化的转换后，结构可能有差异，但是需要保证其转换操作是可逆的。以上这点Hessian做的不是很好，其跨语言的兼容性不能满足跨语言的需求，所以另外一个可行的方案就是就是选择其它基于 IDL 的序列化协议，例如Protobuf。

现成的服务注册中心一般都有一些多语言解决方案，像Zookeeper、SOFARegistry、Consul、etcd等都有多语言客户端，所以服务发现这块问题不算太大。

例如下面就是一个基于注册中心 + Bolt 协议 + Protobuf 序列化的设计图。

![基于注册中心 + Bolt 协议 + Protobuf 序列化的设计图](https://cdn.nlark.com/yuque/0/2018/png/156121/1540814354303-c1d8fde9-4de6-44d7-bd3e-67f7f6fd0fe6.png)

## 通讯协议和序列化协议

通讯协议只要跨语言各方约定清楚，大家安装约定实现即可，而序列化协议则需要较多的考量。

序列化的协议选择列出一些考虑要点：

- 是否采用具备自我描述能力的序列化方案，如不需要借助一些 schema 或者接口描述文件。

- 是否为语言无关的，包括脚本语言在内。

- 是否压缩比例足够小，满足网络传输场景的要求。

- 是否序列化和反序列化的性能均足够优秀。

- 是否向前/向后兼容，能够处理传输对象的新增属性在服务端和客户端版本不一致的情况。

- 是否支持加密、签名、压缩以及扩展的上下文。

### JSON Over HTTP

首先，说到跨语言，序列化支持，肯定有同学会问，为什么不直接通过 Http的Json来搞定呢？

虽然得益于JSON和HTTP在各个语言的广泛支持，在多语言场景下改造支持非常便捷，能够低成本的解决网络通讯和序列化的问题。服务发现的过程则可以使用最简单的固定URL（协议+域名+端口+路径）的形式，负载均衡依赖于F5或者LVS等实现。

但是这个方案的有明显的局限性：

1. HTTP 作为无状态的应用层协议，在性能上相比基于传输层协议（TCP）的方案处于劣势。HTTP/1.1后可以通过设置keep-alive使用长连接，可以一定程度上规避建立连接的时间损耗；然而最大的问题是，客户端线程采用了 request-response 的模式，在发送了 request 之后被阻塞，直到拿到 response 之后才能继续发送。这一问题直到 HTTP/2.0 才被解决。

2. JSON 是基于明文的序列化，较二进制的序列化方案，其序列化的结果可读性强，但是压缩率和性能仍有差距，这种对于互联网高并发业务场景下，意味着硬件成本的提升。

3. 对于网络变化的响应。订阅端处理不够强大。

### Hessian Over BOLT

在否决了上一个方案后，我们继续看，蚂蚁内部，最开始的时候，SOFARPC 还没有支持 Protobuf 作为序列化方式，当时为了跨语言，NodeJs的同学已经在此基础上，用 js 重写了一个 hessian 的版本，完成了序列化。也已经在线上平稳运行。但是当我们要扩展给其他语言的时候，重写 hessian 的成本太高。而且 Java语言提供的接口和参数信息，其他语言也需要自己理解一遍，对应地转换成自己的语言对象。因此该方案在特定场景下是可行的。但不具备推广至其他语言的优势。

Node的实现版本可以参考：[https://github.com/alipay/sofa-rpc-node](https://github.com/alipay/sofa-rpc-node)

### Protobuf Over BOLT

Protobuf 基于IDL，本身具备平台无关、跨语言的特性，是一个理想的序列化方案。但是需要先编写proto文件，结构化地描述传输的业务对象，并生成中间代码。

由于要重点介绍一下这种方案，因此再次回顾一下SOFABolt的协议规范部分，便于后面的解释。

```
Request command protocol for v1
0     1     2           4           6           8          10           12          14         16
+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+
|proto| type| cmdcode   |ver2 |   requestId           |codec|        timeout        |  classLen |
+-----------+-----------+-----------+-----------+-----------+-----------+-----------+-----------+
|headerLen  | contentLen            |                             ... ...                       |
+-----------+-----------+-----------+                                                           +
|               className + header  + content  bytes                                            |
+                                                                                               +
|                               ... ...                                                         |
+-----------------------------------------------------------------------------------------------+

codec: code for codec 序列化,hessian 是1,pb 是11,java 是2

Response command protocol for v1
0     1     2     3     4           6           8          10           12          14         16
+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+-----+
|proto| type| cmdcode   |ver2 |   requestId           |codec|respstatus |  classLen |headerLen  |
+-----------+-----------+-----------+-----------+-----------+-----------+-----------+-----------+
| contentLen            |                  ... ...                                              |
+-----------------------+                                                                       +
|                         className + header  + content  bytes                                  |
+                                                                                               +
|                               ... ...                                                         |
+-----------------------------------------------------------------------------------------------+
respstatus: response status 服务端响应结果状态
```

对于现有的通信协议，我们改进时，将 content部分存储为入参对象和返回值，他们都是 pb序列化之后的值。这样将直接对接到现在的协议上。又利用了 BOLT的通信协议。

以下描述了跨语言中对 Protobuf 协议的使用：

![Protobuf 协议使用](https://cdn.nlark.com/yuque/0/2018/png/156121/1540814966719-289d3d32-3642-4178-a7f3-cce928ae6a5e.png)

首先我们看 header 部分，是简单的扁平化的 KV。默认会增加以下三个 Entry：

| Key | Value | 备注 |
| --- | --- | --- |
| sofa_head_method_name | 对方方法名 | 对应 SofaRequest#methodName |
| sofa_head_target_app | 对方的应用名 | 对应 SofaRequest#targetAppName |
| sofa_head_target_service | 对方的服务唯一命名 | 对应 SofaRequest#targetServiceUniqueName |
| sofa_head_response_error | true/false | 仅在响应中出现 |

我们再看 body 部分，根据 Protobuf 的实现，所有被序列化的对象均实现了 MessageLite 接口，然而由于多个Classloader 存在的可能，代码上为了避免强转 MessageList 接口的失败，并未直接调用 toByteArray 方法，而是通过反射机制调用 toByteArray 获得 byte 数组。

针对SofaRequest这个 RPC中的传输对象，由于 Protobuf 仅支持对于单个对象的序列化，因此 SofaRequest 类型的对象进行序列化，实际支持的是 SofaRequest#methodArgs 数组中的首个元素对象进行的序列化，也就是说目前我们仅支持一个入参对象。

针对 SofaResponse 这个响应对象，当出现框架异常或者返回对象是一个 Throwable 代表的业务异常时，直接将错误消息字符串序列化；并在响应头中设置 sofa_head_response_error=true，其他情况才序列化业务返回对象。这样可以避免比如 Java 语言的错误栈，由于含有 一些线程类和异常类，其他语言是无法解析的。

反序列化的过程稍复杂一些，上游调用传入SofaRequest/SofaResponse的实例，先要在空白的SofaRequest对象中填入前文中在 header 反序列化中的解析的头部信息，接着根据Header中接口+方法名找到等待反序列化对象的 class，并借助反射调用 parseFrom 接口生成对象，成为 SofaRequest#MethodArgs 的首个元素对象。

### Others Over BOLT

在上一个方案的基础上，我们也可以支持更多的语言，对JSON、Kyro的支持也分别处于开发和规划中。 JSON的支持已经开发完成待合并。这里不再做过多说明。

## 服务发现

跨语言各方约定了通讯协议和序列化协议后，就可以完成各自的服务端和客户端实现，跨语言已经能完成点对点的调用了。但在实际的线上场景下，我们还是需要通过注册中心等服务发现的形式，来保证跨语言调用的可用性。目前，有两种可选的方案。

### 各语言对接注册中心

对于服务发现，前面说到的最早进行跨语言的 NodeJs 实现了对接 SOFA Registry 的能力。直接通过对 Java原生序列化和一些 hessian 的重写，来操作完成了。在蚂蚁内部，这种方案在只有 Node的情况下是可以的，但是更通用的场景下。如果我们有了新的注册中心，要对接更多的注册中心，其他语言在语言表达上的差异性，使得这种方案很难推广到其他项目。NodeJs 版本的 hessian：[https://github.com/alipay/sofa-hessian-node](https://github.com/alipay/sofa-hessian-node)

### 各语言对接 SOFAMosn

由于每个语言都去对接对接中心存在一定的难度，也不具备可推广性，而在蚂蚁内部，我们已经在一些跨语言的场景下，运行 SOFAMosn，通过 SOFAMosn，我们对接了站内的注册中心，其他的语言，仅需要将自己需要订阅和发布的信息，通过 Http的接口形式，通知 SOFAMosn，SOFAMosn 将会将这些信息和注册中心进行注册和订阅，并维持地址信息。

这样对于其他语言来说，仅需要非常简单的 json请求，就完成了跨语言的服务注册和订阅。后续新注册中心的对接等等。其他语言都不再需要理解。相关的 sdk。我们已经开发并实现完成。对于 SOFAMosn 的更多介绍，可以参看 [SOFAMosn 文档](http://www.sofastack.tech/projects/sofa-mosn/overview)。

| 语言 | 实现 |
| --- | --- |
| python | [https://github.com/alipay/sofa-bolt-python](https://github.com/alipay/sofa-bolt-python) |
| node | [https://github.com/alipay/sofa-rpc-node](https://github.com/alipay/sofa-rpc-node) |
| c++ | [https://github.com/alipay/sofa-bolt-cpp](https://github.com/alipay/sofa-bolt-cpp) |

当然如果你并不需要进行服务寻址，或者能够接受硬负载或者固定 IP的调用方式。也可以直接使用。

## 参考资料

- SOFA 微服务多语言演进 [https://mp.weixin.qq.com/s/kfbDIq4GgdSU7KC2jqSRAw](https://mp.weixin.qq.com/s/kfbDIq4GgdSU7KC2jqSRAw)

- SOFARPC 框架之总体设计与扩展机制 [https://mp.weixin.qq.com/s/ZKUmmFT0NWEAvba2MJiJfA](https://mp.weixin.qq.com/s/ZKUmmFT0NWEAvba2MJiJfA)

- 蚂蚁通信框架实践 [https://mp.weixin.qq.com/s/JRsbK1Un2av9GKmJ8DK7IQ](https://mp.weixin.qq.com/s/JRsbK1Un2av9GKmJ8DK7IQ)

- JVM Serializers [https://github.com/eishay/jvm-serializers/wiki](https://github.com/eishay/jvm-serializers/wiki)

## 结语

至此，我们介绍了 SOFARPC 中对于 Protobuf 的跨语言实现，并介绍了一些 NodeJs 对跨语言的支持，最后介绍了我们用 SOFAMosn 实现通用的服务发现。

在大多数场景下，我们更推荐是使用 SOFAMosn来做服务寻址，这样之后 Mosn 层面的一些限流熔断。也可以在多语言上进行使用。

而对一些场景比较简单，能够容忍固定 IP调用，或者使用硬件负载均衡设备的。也可以直接使用各个跨语言客户端，进行直接开发调用。