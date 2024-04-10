---
title: "SOFAMesh中的多协议通用解决方案x-protocol介绍系列（2）——快速解码转发"
author: "敖小剑"
authorlink: "https://skyao.io"
description: "在本系列文章中，我们将详解Service Mesh中的多协议解决方案x-protocol，本文介绍的是快速解码转发方案。"
categories: "SOFAMesh"
tags: ["SOFAMesh"]
date: 2018-10-10T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1564396463217-23b97788-77af-453f-8af2-7d0bd5cf79f8.png"
---

## 前言

在 Istio 和 Envoy 中，对通讯协议的支持，主要体现在 HTTP/1.1 和 HTTP/2 上，而我们 SOFAMesh，则需要支持以下几个 RPC 协议：

- SOFARPC：这是蚂蚁金服大量使用的 RPC 协议（已开源）
- HSF RPC：这是阿里集团内部大量使用的 RPC 协议（未开源）
- Dubbo RPC: 这是社区广泛使用的 RPC 协议（已开源）

### 更适合的平衡点：性能和功能

对于服务间通讯解决方案，性能永远是一个值得关注的点。而 SOFAMesh 在项目启动时就明确要求在性能上要有更高的追求，为此，我们不得不在 Istio 标准实现之外寻求可以获取更高性能的方式，比如支持各种 RPC 协议。

期间有两个发现：

1. Istio 在处理所有的请求转发如 REST/gRPC 时，会解码整个请求的 header 信息，拿到各种数据，提取为 Attribute，然后以此为基础，提供各种丰富的功能，典型如 Content Based Routing。
1. 而在测试中，我们发现：解码请求协议的 header 部分，对 CPU 消耗较大，直接影响性能。

因此，我们有了一个很简单的想法：是不是可以在转发时，不开启部分功能，以此换取转发过程中的更少更快的解码消耗？毕竟，不是每个服务都需要用到 Content Based Routing 这样的高级特性，大部分服务只使用 Version Based Routing，尤其是使用 RPC 通讯协议的服务，没有 HTTP 那么表现力丰富的 header，对 Content Based Routing 的需求要低很多。

此外，对于部分对性能有极高追求的服务，不开启高级特性而换取更高的性能，也是一种满足性能要求的折中方案。考虑到系统中总存在个别服务对性能非常敏感，我们觉得 Service Mesh 提供一种性能可以接近直连的方案会是一个有益的补充。为了满足这些特例而不至于因此整体否决 Service Mesh 方案，我们需要在 Service Mesh 的大框架下提供一个折中方案。

## 请求转发

在我们进一步深入前，我们先来探讨一下实现请求转发的技术细节。

有一个关键问题：当 Envoy/SOFA MOSN 这样的代理程序，接收到来自客户端的 TCP 请求时，需要获得哪些信息，才可以正确的转发请求到上游的服务器端？

### 最关键的信息：destination

首先，毫无疑问的，必须拿到 destination/目的地，也就是客户端请求必须通过某种方式明确的告之代理该请求的 destination，这样代理程序才能根据这个 destionation 去找到正确的目标服务器，然后才有后续的连接目标服务器和转发请求等操作。

![Destination信息](https://raw.githubusercontent.com/servicemesher/website/master/content/blog/x-protocol-rapid-decode-forward/006tNbRwly1fw2zu0jen9j30vs0d475q.jpg)

Destination 信息的表述形式可能有：

**1. IP 地址**

可能是服务器端实例实际工作的 IP 地址和端口，也可能是某种转发机制，如 Nginx/HAProxy 等反向代理的地址或者 Kubernetes 中的 ClusterIP。

举例：“192.168.1.1:8080”是实际 IP 地址和端口，“10.2.0.100:80”是 ngxin 反向代理地址，“172.168.1.105:80”是 Kubernetes 的 ClusterIP。

**2. 目标服务的标识符**

可用于名字查找，如服务名，可能带有各种前缀后缀。然后通过名字查找/服务发现等方式，得到地址列表（通常是 IP 地址+端口形式）。

举例：“userservice”是标准服务名， “com.alipay/userservice”是加了域名前缀的服务名， “service.default.svc.cluster.local”是 k8s 下完整的全限定名。

Destination 信息在请求报文中的携带方式有：

**1. 通过通讯协议传递**

这是最常见的形式，标准做法是通过 header 头，典型如 HTTP/1.1 下一般使用 host header，举例如“Host: userservice”。HTTP/2 下，类似的使用“:authority” header。

对于非 HTTP 协议，通常也会有类似的设计，通过协议中某些字段来承载目标地址信息，只是不同协议中这个字段的名字各有不同。如 SOFARPC，HSF 等。

有些通讯协议，可能会将这个信息存放在 payload 中，比如后面我们会介绍到的 dubbo 协议，导致需要反序列化 payload 之后才能拿到这个重要信息。

**2. 通过 TCP 协议传递**

这是一种非常特殊的方式，通过在 TCP option 传递，上一节中我们介绍 Istio DNS 寻址时已经详细介绍过了。

### TCP 拆包

如何从请求的通讯协议中获取 destination？这涉及到具体通讯协议的解码，其中第一个要解决的问题就是如何在连续的 TCP 报文中将每个请求内容拆分开，这里就涉及到经典的 TCP 沾包、拆包问题。

![TCP拆包](https://raw.githubusercontent.com/servicemesher/website/master/content/blog/x-protocol-rapid-decode-forward/006tNbRwly1fw2zuc1molj30vw0ayaax.jpg)

转发请求时，由于涉及到负载均衡，我们需要将请求发送给多个服务器端实例。因此，有一个非常明确的要求：就是必须以单个请求为单位进行转发。即单个请求必须完整的转发给某台服务器端实例，负载均衡需要以请求为单位，不能将一个请求的多个报文包分别转发到不同的服务器端实例。所以，拆包是请求转发的必备基础。

由于篇幅和主题限制，我们不在这里展开 TCP 沾包、拆包的原理。后面针对每个具体的通讯协议进行分析时再具体看各个协议的解决方案。

### 多路复用的关键参数：RequestId

RequestId 用来关联 request 和对应的 response，请求报文中携带一个唯一的 id 值，应答报文中原值返回，以便在处理 response 时可以找到对应的 request。当然在不同协议中，这个参数的名字可能不同（如 streamid 等）。

严格说，RequestId 对于请求转发是可选的，也有很多通讯协议不提供支持，比如经典的 HTTP1.1 就没有支持。但是如果有这个参数，则可以实现多路复用，从而可以大幅度提高 TCP 连接的使用效率，避免出现大量连接。稍微新一点的通讯协议，基本都会原生支持这个特性，比如 SOFARPC、Dubbo、HSF，还有 HTTP/2 就直接內建了多路复用的支持。

HTTP/1.1 不支持多路复用（http1.1 有提过支持幂等方法的 pipeline 机制但是未能普及），用的是经典的 ping-pong 模式：在请求发送之后，必须独占当前连接，等待服务器端给出这个请求的应答，然后才能释放连接。因此 HTTP/1.1 下，并发多个请求就必须采用多连接，为了提升性能通常会使用长连接+连接池的设计。而如果有了 requestid 和多路复用的支持，客户端和 Mesh 之间理论上就可以只用一条连接（实践中可能会选择建立多条）来支持并发请求：

![多路复用的关键参数：RequestId](https://raw.githubusercontent.com/servicemesher/website/master/content/blog/x-protocol-rapid-decode-forward/006tNbRwly1fw2zujxeh7j313x0dwtaz.jpg)

而 Mesh 与服务器（也可能是对端的 Mesh）之间，也同样可以受益于多路复用技术，来自不同客户端而去往同一个目的地的请求可以混杂在同一条连接上发送。通过 RequestId 的关联，Mesh 可以正确将 reponse 发送到请求来自的客户端。

![多路复用的关键参数：RequestId](https://raw.githubusercontent.com/servicemesher/website/master/content/blog/x-protocol-rapid-decode-forward/006tNbRwly1fw2zuxvz4lj310r0dzwgj.jpg)

由于篇幅和主题限制，我们不在这里展开多路复用的原理。后面针对每个具体的通讯协议进行分析时再具体看各个协议的支持情况。

### 请求转发参数总结

上面的分析中，我们可以总结到，对于 Sidecar，要正确转发请求：

1. 必须获取到 destination 信息，得到转发的目的地，才能进行服务发现类的寻址
1. 必须要能够正确的拆包，然后以请求为单位进行转发，这是负载均衡的基础
1. 可选的 RequestId，这是开启多路复用的基础

因此，这里我们的第一个优化思路就出来了：尽量只解码获取这三个信息，满足转发的基本要求。其他信息如果有性能开销则跳过解码，所谓“快速解码转发”。基本原理就是牺牲信息完整性追求性能最大化。

而结合上一节中我们引入的 DNS 通用寻址方案，我们是可以从请求的 TCP options 中得到 ClusterIP，从而实现寻址。这个方式可以实现不解码请求报文，尤其是 header 部分解码 destination 信息开销大时。这是我们的第二个优化思路：跳过解码 destination 信息，直接通过 ClusterIP 进行寻址。

具体的实现则需要结合特定通讯协议的实际情况进行。

## 主流通讯协议

现在我们开始，以 Proxy、Sidecar、Service Mesh 的角度来看看目前主流的通讯协议和我们前面列举的需要在 SOFAMesh 中支持的几个协议。

### SOFARPC/bolt 协议

SOFARPC 是一款基于 Java 实现的 RPC 服务框架，详细资料可以查阅 官方文档。SOFARPC 支持 bolt，rest，dubbo 协议进行通信。REST、dubbo 后面单独展开，这里我们关注 bolt 协议。

bolt 是蚂蚁金服集团开放的基于 Netty 开发的网络通信框架，其协议格式是变长，即协议头+payload。具体格式定义如下，以 request 为例（response 类似）：

![以request为例](https://raw.githubusercontent.com/servicemesher/website/master/content/blog/x-protocol-rapid-decode-forward/006tNbRwly1fw2zv3sqhij312j0833zq.jpg)

我们只关注和请求转发直接相关的字段：

**TCP 拆包**

bolt 协议是定长+变长的复合结构，前面 22 个字节长度固定，每个字节和协议字段的对应如图所示。其中 classLen、headerLen 和 contentLen 三个字段指出后面三个变长字段 className、header、content 的实际长度。和通常的变长方案相比只是变长字段有三个。拆包时思路简单明了：

1. 先读取前 22 个字节，解出各个协议字段的实际值，包括 classLen，headerLen 和 contentLen
1. 按照 classLen、headerLen 和 contentLen 的大小，继续读取 className、header、content

**Destination**

  Bolt 协议中的 header 字段是一个 map，其中有一个 key 为“service”的字段，传递的是接口名/服务名。读取稍微麻烦一点点，需要先解码整个 header 字段，这里对性能有影响。

**RequestId**

  Blot 协议固定字段中的`requestID`字段，可以直接读取。

SOFARPC 中的 bolt 协议，设计的比较符合请求转发的需要，TCP 拆包，读取 RequestID，都没有性能问题。只是 Destination 的获取需要解码整个 header，性能开销稍大。

总结：适合配合 DNS 通用解码方案，跳过对整个 header 部分的解码，从而提升性能。当然由于这个 header 本身也不算大，优化的空间有限，具体提升需要等对比测试的结果出来。

### HSF 协议

HSF 协议是经过精心设计工作在 4 层的私有协议，由于该协议没有开源，因此不便直接暴露具体格式和字段详细定义。

不过基本的设计和 bolt 非常类似：

- 采用变长格式，即协议头+payload
- 在协议头中可以直接拿到服务接口名和服务方法名作为 Destination
- 有 RequestID 字段

基本和 bolt 一致，考虑到 Destination 可以直接读取，比 bolt 还要方便一些，HSF 协议可以说是对请求转发最完美的协议。

总结：目前的实现方案也只解码了这三个关键字段，速度足够快，不需要继续优化。

### Dubbo 协议

Dubbo 协议也是类似的协议头+payload 的变长结构，其协议格式如下：

![Dubbo协议](https://raw.githubusercontent.com/servicemesher/website/master/content/blog/x-protocol-rapid-decode-forward/006tNbRwly1fw2zvfi4g9j30oh03gmxj.jpg)

其中 long 类型的`id`字段用来把请求 request 和返回的 response 对应上，即我们所说的`RequestId`。

这样 TCP 拆包和多路复用都轻松实现，稍微麻烦一点的是：Destination 在哪里？Dubbo 在这里的设计有点不够理想，在协议头中没有字段可以直接读取到 Destination，需要去读取 data 字段，也就是 payload，里面的 path 字段通常用来保存服务名或者接口名。method 字段用来表示方法名。

从设计上看，path 字段和 method 字段被存放在 payload 中有些美中不足。庆幸的是，读取这两个字段的时候不需要完整的解开整个 payload，好险，不然，那性能会没法接受的。

以 hession2 为例，data 字段的组合是：dubbo version + path + interface version + method + ParameterTypes + Arguments + Attachments。每个字段都是一个 byte 的长度+字段值的 UTF bytes。因此读取时并不复杂，速度也足够快。

基本和 HSF 一致，就是 Destination 的读取稍微麻烦一点，放在 payload 中的设计让人吓了一跳，好在有惊无险。整体说还是很适合转发的。

总结：同 HSF，不需要继续优化。

### HTTP/1.1

HTTP/1.1 的格式应该大家都熟悉，而在这里，不得不指出，HTTP/1.1 协议对请求转发是非常不友好的（甚至可以说是恶劣！）：

1. HTTP 请求在拆包时，需要先按照 HTTP header 的格式，一行一行读取，直到出现空行表示 header 结束
1. 然后必须将整个 header 的内容全部解析出来，才能取出`Content-Length header`
1. 通过`Content-Length` 值，才能完成对 body 内容的读取，实现正确拆包
1. 如果是 chunked 方式，则更复杂一些
1. Destination 通常从`Host` header 中获取
1. 没有 RequestId，完全无法实现多路复用

这意味着，为了完成最基本的 TCP 拆包，必须完整的解析全部的 HTTP header 信息，没有任何可以优化的空间。对比上面几个 RPC 协议，轻松自如的快速获取几个关键信息，HTTP 无疑要重很多。这也造成了在 ServiceMesh 下，HTTP/1.1 和 REST 协议的性能总是和其他 RPC 方案存在巨大差异。

对于注定要解码整个 header 部分，完全没有优化空间可言的 HTTP/1.1 协议来说，Content Based Routing 的解码开销是必须付出的，无论是否使用 Content Based Routing 。因此，快速解码的构想，对 HTTP/1.1 无效。

总结：受 HTTP/1.1 协议格式限制，上述两个优化思路都无法操作。

### HTTP/2 和 gRPC

作为 HTTP/1.1 的接班人，HTTP/2 则表现的要好很多。

> 备注：当然 HTTP/2 的协议格式复杂多了，由于篇幅和主题的限制，这里不详细介绍 HTTP/2 的格式。

首先 HTTP/2 是以帧的方式组织报文的，所有的帧都是变长，固定的 9 个字节+可变的 payload，Length 字段指定 payload 的大小：

![HTTP/2](https://raw.githubusercontent.com/servicemesher/website/master/content/blog/x-protocol-rapid-decode-forward/006tNbRwly1fw2zvsjz65j30jg0650tg.jpg)

HTTP2 的请求和应答，也被称为 Message，是由多个帧构成，在去除控制帧之外，Message 通常由 Header 帧开始，后面接 CONTINUATION 帧和 Data 帧（也可能没有，如 GET 请求）。每个帧都可以通过头部的 Flags 字段来设置 END_STREAM 标志，表示请求或者应答的结束。即 TCP 拆包的问题在 HTTP/2 下是有非常标准而统一的方式完成，完全和 HTTP/2 上承载的协议无关。

HTTP/2 通过 Stream 內建多路复用，这里的`Stream Identifier` 扮演了类似前面的`RequestId`的角色。

而 Destination 信息则通过 Header 帧中的伪 header `:authority` 来传递，类似 HTTP/1.1 中的`Host` header。不过 HTTP/2 下 header 会进行压缩，读取时稍微复杂一点，也存在需要解压缩整个 header 帧的性能开销。考虑到拆包和获取 RequestId 都不需要解包（只需读取协议头，即 HTTP/2 帧的固定字段），速度足够快，因此存在很大的优化空间：不解码 header 帧，直接通过 DNS 通用寻址方案，这样性能开销大为减少，有望获得极高的转发速度。

总结：HTTP/2 的帧设计，在请求转发时表现的非常友好。唯独 Destination 信息放在 header 中，会造成必须解码 header 帧。好在 DNS 通用寻址方案可以弥补，实现快速解码和转发。

## Service Mesh 时代的 RPC 理想方案

在文章的最后，我们总结并探讨一下，对于 Service Mesh 而言，什么样的 RPC 方案是最理想的？

1. 必须可以方便做 TCP 拆包，最好在协议头中就简单搞定，标准方式如固定协议头+length 字段+可变 payload。HSF 协议、 bolt 协议和 dubbo 协议表现完美，HTTP/2 采用帧的方式，配合 END_STREAM 标志，方式独特但有效。HTTP/1.1 则是反面典型。
2. 必须可以方便的获取 destination 字段，同样最好在协议头中就简单搞定。HSF 协议表现完美，dubbo 协议藏在 payload 中但终究还是可以快速解码有惊无险的过关，bolt 协议和 HTTP/2 协议就很遗憾必须解码 header 才能拿到，好在 DNS 通用寻址方案可以弥补，但终究丢失了服务名和方法名信息。HTTP/1.1 依然是反面典型。
3. 最好有 RequestId 字段，同样最好在协议头中就简单搞定。这方面 HSF 协议、dubbo 协议、bolt 协议表现完美，HTTP/2 协议更是直接內建支持。HTTP/1.1 继续反面典型。

因此，仅以方便用最佳性能进行转发，对 Service Mesh、sidecar 友好而言，最理想的 RPC 方案是：

**传统的变长协议**

  固定协议头+length 字段+可变 payload，然后在固定协议头中直接提供 RequestId 和 destination。

**基于帧的协议**

  以 HTTP/2 为基础，除了请求结束的标志位和 RequestId 外，还需要通过帧的固定字段来提供 destination 信息。

或许，在未来，在 Service Mesh 普及之后，对 Service Mesh 友好成为 RPC 协议的特别优化方向，我们会看到表现完美更适合 Service Mesh 时代的新型 RPC 方案。

## 系列阅读

[SOFAMesh 中的多协议通用解决方案 x-protocol 介绍系列（1）——DNS 通用寻址方案](https://www.sofastack.tech/blog/sofa-mesh-x-protocol-common-address-solution)