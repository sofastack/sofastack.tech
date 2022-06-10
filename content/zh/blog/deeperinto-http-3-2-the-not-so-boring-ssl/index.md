---
title: "深入 HTTP/3（2）｜不那么 Boring 的 SSL"
author: "曾柯"
authorlink: "https://github.com/sofastack"
description: "深入 HTTP/3（2）｜不那么 Boring 的 SSL"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2022-05-24T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*XrIoRauVcO4AAAAAAAAAAAAAARQnAQ"
---

文｜曾柯（花名：毅丝 )

蚂蚁集团高级工程师\*负责蚂蚁集团的接入层建设工作* *主要方向为高性能安全网络协议的设计及优化*

**本文 10924 字，阅读 20 分钟**

## PART. 1 引言

从前一篇文章[《深入 HTTP/3（1）｜从 QUIC 链接的建立与关闭看协议的演进》](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247499565&idx=1&sn=00a26362451ee3bbc8ee82588514eb52&chksm=faa310f7cdd499e15e39f1cfc32644cb175340f26148cab50ca90f973e786c5ef4d8cb025580&scene=21#wechat_redirect)对于 QUIC 的浅述中我们了解到，QUIC 的优化很大程度上是一种基于 TLS 流程的优化，由此也可见 TLS 对于 QUIC 的重要性，那么今天我们就来聊一聊 QUIC-TLS。为了表述尽量没有歧义，我们先来规范下文章中各个术语的意义。

本文目前既然已经提到了 SSL、TLS 这两个术语，我们不妨先来简短回顾下安全协议的发展史，这既可以帮我们理清两个术语的关系，也能帮助我们对这项技术的进化有一个简短的概念。

SSL *(Secure Sockets Layer)* 协议本身是网景公司为了保证互联网上数据传输的安全性，在 1994 年设计的一套协议。这套协议在当时被广泛使用在各大浏览器上，但 SSL 协议最初的几个版本安全性都非常堪忧，初期的更迭非常频繁，从 1994 年到 1995 年连续迭代了 3 个大版本，而现在大家最耳熟能详的应该就是 SSLv3.0 了。可惜 SSLv3.0 也没有逃脱更迭的厄运，由于硬件算力的迭代，大量 SSLv3.0 中广泛使用的加密算法不再安全，并且协议交互流程也存在不安全之处。1999 年，IETF 正式介入安全协议的设计及开发，并推出了 TLS *(Transport Layer Security)* 协议的第一个版本 TLS1.0，随后 TLS 协议的发展开始变得迟缓，在 2006 年 IETF 组织推出了 TLS1.1，并在 2008 年再次发布了 TLS1.2，两个版本都是针对一些握手交互过程中的细节的安全提升，握手流程其实是没有大的变化的。

直到 2013 年，Google 在推出 gquic 的同时，也推出了其设计的安全交互流程 quic-crypto，quic-crypto 是一次交互流程的重大创新，也以此成为了 TLS1.3 的前身。TLS1.3 从某种意义上来说，应该被称作 TLS2.0，因为其革新力度非常大，当然这也导致其标准化流程非常长，TLS1.3 的标准化整整历经了 4 年，直到 2018 年才正式成为 RFC。而 TLS1.3 本身也成为了 IETF-QUIC 的安全交互技术的基础，所以这条时间线里也揉杂了 QUIC-TLS 的设计历程，我们来简单理一下：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/eef10bca9dcc409bbe0e9ec7708ea622~tplv-k3u1fbpfcp-zoom-1.image)

*图 1. TLS 发展简史*

当然 DTLS 等相关安全技术的进化也融合在这条时间线中，限于篇幅问题，这里暂时不表。说了这么多废话，我们现在来正式标准化一下我们的名词：

**【SSL、TLS】** ：*在本文中都指安全传输协议，后续的文章中只会使用 TLS 作为相关技术的代名词*

**【QUIC-crypto】** ：*Google quic 中使用的握手流程，本文不对其进行具体分析*

**【QUIC-TLS】** ：*本文指 IETF-QUIC 使用的安全交互流程，即 RFC9001 中标准化的流程，也是本文详细描述的重点*

**【PTO】** ：*全称为 Probe Timeout，定义于 RFC9002 中，留待下一篇文章来对其进行详细分析，本文将其理解成一个通信端设置的针对报文的超时重传的时间即可*

**【DTLS】** ：*全称为 Datagram Transport Layer Security，即面向报文的 TLS 协议，限于篇幅的问题，本文并不详细对其分析，而 DTLS 中存在有很多和 QUIC-TLS 类似思路的设计，感兴趣的同学可以参见 RFC9147*

“make infrastructure boring”是 Google 一直以来的口号，BoringSSL 这个开源产品则是他们在安全通信领域的行动，而文章的标题既然叫“不那么 Boring 的 SSL”，除了蹭一蹭 BoringSSL 和 OpenSSL 这些著名的 SSL 开源项目的热度之外，也是想给文章制造一点悬念：Boring 往往意味着相关技术简单好用到了令人发指的地步，而 QUIC 到底遇见了什么问题，才让本身相对成熟的 TLS 协议用起来不再 Boring？

本文后续也将围绕这个话题展开，来看看 **QUIC-TLS** 设计中那些值得玩味的地方。

## PART. 2 浅看 TLS

本着由浅入深的思路，在开始介绍 QUIC-TLS 之前，我们也先浅析一下 TLS，这也非常有助于我们后面对于 QUIC-TLS 的理解。

TLS 协议从某种程度上来说解决了几个哲学问题：**你是谁？你怎么证明你是你？**

当然这些问题的答案还不足以保证整个的安全...

**1.** 我们还需要一种技术来**保证中间人无法获取到我们的数据**，这也就是我们相对比较熟悉的 **「对称加密技术」**，比如 AES、SM4 等加密技术；

**2.** 为了**加密的数据也能证明通信一端的身份**，我们引入了 **「AEAD 加密即认证的模式」**；

**3.** 为了协商出这种**对称加密的密钥**，TLS 引入了 **「非对称密钥交换技术」**，典型如 ECDHE、RSA 等密钥交换算法；

**4.** 为了**身份管理的统一及身份的有效携带**，TLS 引入了 **「数字证书技术」**，包括整个 pki 公钥体系及 X509 数字证书标准；

**5.** 为了**数据的不可篡改**，TLS 引入了 **「数字签名技术」**，典型如 ECDSA、RSA 等签名算法；

**6.** 为了**各个阶段的加密密钥独立及签名流程的简洁**，TLS 引入了 **「Hash 算法」**，典型如 SHA 系列算法。

上述的各种机制再整个 TLS 协议中被抽象为两部分协议：

一层是 **Handshake 协议**，负责核心密钥的交互及身份认证；一层是 **Record 协议**，负责数据的安全，完整性及握手完成后数据的可信证明，而 Handshake 协议则坐落于 Record 协议之上，这也就形成了这样的协议栈。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/018e0ccdd76f48afb2a1f064e0c74f8e~tplv-k3u1fbpfcp-zoom-1.image)

*图 2. TLS 协议栈简图*

简而言之，Handshake 过程中的数据也依赖 Record 层来进行数据加密，而 Record 层加密的 key 则依赖 Handshake 层进行交互得到。这看似是个逻辑死锁，实际上是通过一个层层递进的状态机完成的，抛开繁琐的 TLS 状态机本身，这个流程基本可以用下图来表述：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9daacc8dcbaa4ed6bd209851f7341869~tplv-k3u1fbpfcp-zoom-1.image)

*图 3. TLS 密钥状态更新流程图*

至于 TLS 的初始阶段使用明文传输的数据，也并不违背这个流程，我们可以将其理解为 TLS 初始阶段对应一个值为空的 key。而从上图中我们也可以看到，实现和虚线部分对应的两个阶段切换，必须有严格的先后顺序，如果发生乱序，一端是无法完成数据的解析的，所以 TLS 协议非常依赖底层传输协议来保证数据的有序到达，而这也是 TLS 的设计区别于 DTLS 和 QUIC-TLS 的最大根因之一。有了这部分知识储备，我们再来看 TLS 的握手 *(以 TLS1.3 的 0-RTT 交互场景为例)* ，就会清晰很多：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/89986ae1e1dd4ddb87e1bc5d5d3e0758~tplv-k3u1fbpfcp-zoom-1.image)

图 4. TLS 握手流程图

可以看到，明文"()","{}","[]"对应的加密状态的切换，和上面的图的流程基本是一致的，而典型如 EndOfEarlyData 这种标示数据，就是用来通知对端的密钥状态切换的，这部的理解对于我们后面理解 QUIC-TLS 的设计大有用处。

在这一章的最后，我们对 TLS 做一个简单总结：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/93b51161346f4a98bcce8728c43f5f9e~tplv-k3u1fbpfcp-zoom-1.image)

*图 5. TLS 小结*

而在使用层面来说，TLS 通过一层安全的抽象，让应用层可以直接通过一个简单的 SSL_read/SSL_write *(以 OpenSSL/BoringSSL 为例)* 读写接口，就可以直接使用安全通信的能力，而完全不需要关注 TLS 握手，状态转换的细节。

从这个角度来说，使用 TLS 已经足够 Boring 了，而从安全诉求上来说，本身 QUIC-TLS 和 TLS 是一致的，也不应该会有大的出入，那么**又是什么让 QUIC-TLS 变得如此复杂呢？**

## PART. 3 深入 QUIC-TLS 的不同之处

在我们上一篇文章里，我们已经对 QUIC 建联进行了分析，为了保证 QUIC 建联的高效，QUIC 将有序和安全融合在了一起。而我们知道，TLS 本身是基于 TCP 设计的协议，两者之间有严格的分层，而 TCP 协议保证了所有数据都被成功，且有序的传输到了对面，所以 TLS 便不需要再考虑丢包和乱序的问题。而 QUIC-TLS 则需要将两者合在一起考虑，回顾前文，我们知道 QUIC 为了不协商即可在第一个报文开始有序传输，引入了 pkt number 和每个帧的 offset 机制，并且两个标示均从 0 开始，然后由 TLS 来保证其安全性，细心的读者可能已经发现这其中逻辑的循环依赖了。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/43608b04b3e3453f9ead611292fbed49~tplv-k3u1fbpfcp-zoom-1.image)

*图 6. TLS 的协议依赖*

为了解开这个死循环，QUIC-TLS 必须将安全层面的交互做更细粒度的拆分，才能够实现既安全又可靠的传输，因此在 RFC9001 中我们可以看到，QUIC 的协议栈看起来会是这个样子：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/17c1cd0b17174ae4af54f8bbef72beaa~tplv-k3u1fbpfcp-zoom-1.image)

*图 6. QUIC-TLS 协议栈*

这个图和前面 TLS 协议栈有点像，但又不那么像。我们已经知道，协议栈层层分层的效果就是上层协议生成的报文会按照 payload 的形式塞在其下一层的协议中，QUIC Packet Protection 协议作为保护数据安全的协议，那么其职责和 TLS Record 是类似的，而 QUIC Transport 协议 *(保证 QUIC 可靠有序传输)* 这部分则和 TCP 类似，可以看到 QUIC 协议栈的下半部分是完全和 TLS+TCP 的协议栈相反的，这也就意味这 QUIC-TLS 的设计在底层上必然和 TLS 的设计不尽相同，我们来深入拆解一下。

**1. 以包为基本单位的加密策略**

我们已经知道了 Record 层的功能靠的是对称加密算法来保证安全，并用 AEAD 的加密模式来保证数据的可信，以一个典型的实例算法 AES-128-GCM 为例，AES-128 表示对称加密算法为 AES-128，GCM 其对应的 AEAD 算法，AES-128-GCM 加密拥有四个输入：

(1) 待加密明文 plaintext; \
(2) 加密的密钥 key; \
(3) 加密的随机数 Nonce; \
(4) 认证的关联数据 Associate Data。

其解密也基本一致，仅将明文换成加密后的密文 ciphertext 即可。对于 Nonce 这个值，在 TLS 中由于本身不用考虑数据的有序传输，Nonce 是通过 client 和 server 自己为每个 Record 报文维护一个技术器来实现的，即 Nonce 从 0 开始，每收到一个对端的 Record 报文自加 1。

对于 QUIC-TLS，通过加密算法实现数据的安全传输也逃不开这一套机制。然而对于 QUIC-TLS 而言，由于安全和有序已经融合在了一起，我们每收到一个报文，需要先解密才知道报文是不是乱序，所以我们不能通过维护计数器的方式来实现自增 Nonce 的这个功能，怎么办呢？

我们恰好看到有 packet number 这样一个单调自增的值 *(注意 packet number 的功能并不是为了作为 Nonce，其具体的作用我们留到后面 QUIC 的丢包检测部分再深入分析)* ，非常适合作为 Nonce。但 packet number 本身又是需要加密的，这要怎么处理呢？解决方案也不复杂，那就是 packet number 使用较为弱的加密模式，即最简单的 ECB 模式来加密，以 AES-128-ECB 为例，这种模式加/解密只需要两个输入：

(1) 待加密明文 plaintext/待解密的密文 ciphertext; (2) 加密的密钥 key。

再次回顾之前关于 TLS 的状态转换的图，只要我们能按照这样的状态转换不断的更新 key，我们就可以按照下面的流程去解开 pkt number，并以此为基础进一步解密得到握手/应用层的信息。 *(注意其中的步骤 3、4 并不一定有严格的顺序之分，因为 QUIC 的丢包检测等不仅是依赖 pkt number，也依赖一些特殊的控制帧。关于这部分，我们留到后面关于 QUIC 的丢包检测的相关文章中进行分享。）*

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8f7b7ae53a8b4b1baf4c4bf1839daff3~tplv-k3u1fbpfcp-zoom-1.image)

*图 7. QUIC-TLS 的包处理*

了解了这一步，我们也就明确了为什么 QUIC 在安全层面会选择以 QUIC packet 作为基本单位的原因。当然，一次 QUIC-TLS 握手过程中会有多个状态，也就是有多个不同加密的 key，为了让 QUIC 的交互过程更清晰，QUIC 也定了 6 中不同类型的 Packet，用来对应 6 种状态，也就是 6 种加密的 key。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2420197f5e5c41469d72e410bddfdb69~tplv-k3u1fbpfcp-zoom-1.image)

*图 8. QUIC-TLS 的包加密等级*

其中 Initial 部分对应的则是 TLS 过程中明文传输的部分，这部分数据虽然在名义上也是加密了的，但其加密的 key 是一个写死在 RFC 里的，人人都知道的值，也就相当于明文传输了。这种做法倒不能说是多此一举，因为这确实也在某种程度上提升了攻击者的攻击成本，但它的确不能保证 ClientHello 这部分数据的安全。为此，QUIC-V2 也准备引入 Encrypted-ClientHello 等安全技术来对这部分数据进行保护，这个我们在后文再慢慢分享。

这种区分了 pkt type 的包加密模式，让数据有了更清晰的状态转移标识。我们再来回头看一看 TLS 的状态转移图，可以发现每次通知对端从 key1 切换到 key2 时，一定是会先发送一个用 key1 加密的通知消息 *(即 TLS 中的 ChangeCipherSpec)* ，才会再去发 key2 加密的数据的，这样才能从理论上保证对端能够成功处理通知消息，完成 key 状态的变化。而在 QUIC-TLS 中，包的 pkt type 则成为了这样一个显式的通知状态转移的标识，比如对端开始响应 Handshake 包了，就说明状态就是要转移到 Handshake 状态了，而这也就让 QUIC-TLS 不再需要 ChangeCipherSpec 以及 EndofEarlyData 这一类的显式通知对端的机制，并且这对于握手过程的乱序处理有很大帮助。有了这些储备知识，我们再来深入看看 QUIC-TLS 握手的细节，就更容易把握其本质。

**2. 不严格的分层，带来更加严格的 0-RTT 使用限制**

0-RTT 功能的雏形来自于 QUIC-crypto，并在 TLS1.3 中被正式标准化，也成为了一个 TLS1.3 非常吸引用户的点，然而该功能的使用条件却非常苛刻。

首先，0-RTT 依赖 TLS 的会话复用的成功，这也就意味着其使用流程必须存在着交互确认的机制，否则 client 初始阶段一股脑的发 0-RTT 数据过去，却又无法被 server 确认接收，那么这就是对资源的一种浪费；

其次，0-RTT 数据本身涉及到密钥状态的转换，那么也就需要为其设计相应的状态转换机制 *(及前文的 EndOfEarlyData)* ；

最后，0-RTT 数据本身是不安全的，因为其完全不能避免重放攻击，只能依靠应用层协议自己保证幂等。

对于第一个问题，QUIC-TLS 和 TLS1.3 并无太大差别，都是通过 server 的响应里的扩展来说明是否接收 0-RTT 数据的，而第二个问题前文我们也已经分析过，QUIC-TLS 依靠包的显式加密等级，也不需要 EndOfEarlyData 这种机制来通知密钥状态需要转换。但到了问题 3，要考虑的情况就会复杂很多，我们先从 QUIC 层面出发来看，我们知道 QUIC 通过 STREAM 类型的帧来承载应用层数据，但除了承载数据之外，QUIC 也提供了诸如 RESET_STREAM, STOP_SENDING 这一类用于控制应用层数据传输的控制帧，而这些都是重放不安全的。

那么在 **QUIC 的角度**上来看，除非你知道自己的应用层协议如何在操作 QUIC 的 stream，并且有明确的能力去保证这些行为的重放安全，你才能去用这个能力，否则干脆将其束之高阁，RFC9001 中对此也是提出了明确的建议。

而我们再站到 **HTTP/3 的角度**来看一下，上一篇文章里我们提到过，HTTP/3 并不是 QUIC+HTTP/2，而是将 HTTP/2 中流这部分的抽象交给了 QUIC，然后在 HTTP/3 里去控制这些流。从这一点来看，HTTP/3 原生的符合了 QUIC-TLS 中对于 0-RTT 能力使用的要求，但我们仍有诸多问题需要考虑，因为 QUIC 本身是一个对于链接以及链接上的流有诸多可配置参数的协议。当 client 要开始传应用层数据的时候，往往就意味着底层的传输条件已经协商好了 *(而由于 HTTP/3 和 QUIC 的绑定关系，这些传输参数还包含着 HTTP/3 的一些语义)* ，而 client 传输 0-RTT 数据时，我们无法通过协商去获取这些参数，而只能通过之前的链接参数来继续传输，所以对于集群化的 QUIC 场景，保证集群内机器配置的一致性以及变更的兼容性，也是 QUIC 使用者需要注意的一大问题。

**3. QUIC-TLS 握手，乱序带来的复杂度提升**

我们先来看下 RFC9001 中对于 QUIC-TLS 的交互示意图：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ed6b08e571604f8dbd3f4f60b78633e4~tplv-k3u1fbpfcp-zoom-1.image)

*图 9. QUIC-TLS 的握手交互*

仅从这个握手协议图来看，如果我们先简单的：

(1) 将 Init 报文当 ClientHello/ServerHello；

(2) 0-RTT 报文对应 TLS 的 0-RTT 数据；

(3) HandShake 数据对应 ServerFinish/ClientFinish。

那么这个握手流程似乎和 TLS 并没有什么不同，事实上仅从握手原理来看，也确实如此。然而当我们引入乱序的考虑之后，问题复杂度就要高出不少了，我们已经在前面分析过，TLS 是依赖 TCP 的有序传输来保证状态 *(或者说当前加解密的 key)* 的层层递进的，也正因为数据严格有序，TLS 也只需要维护当前一个 key 就行。而到了 QUIC-TLS 这里，问题就不再如此简单了，我们可以分成两种典型情况来讨论：

**一、下一阶段的包提前到来**

这个问题虽然在 QUIC-TLS 握手过程中有共性，但也要分阶段来看，每个阶段也有每个阶段自己的问题特点，目前触发这个问题其实有好几种可能性：

- client 的 0-RTT 报文早于 Init 报文到来

- Server 的 Handshake 报文早于 Init 报文到来

- Server 的 1-RTT 报文早于 Server 的 Handshake 报文到来

- client 的 1-RTT 报文 client 的 Handshake 报文到来

对于第一种情况，其实解决方案非常简单，由于 ClientHello 本身并不会很大，并且在首包我们只会发 1 个 0-RTT 报文 *(因为并不知道 server 是否会接收 0-RTT 报文，所以先发一个尝试一下)* ，我们可以通过将 QUIC 包聚合在一个 UDP 包内发送 *(这是标准允许并且推荐的)* 来从根源上解决乱序的问题。

然而后续的问题就较为复杂了，在情况 2 的条件下，由于服务端的证书可能比较大，Server 的 Handshake 包也就会很大，光靠聚合 Server 的 Init 是不能满足要求的。试想一下，如果客户端对于乱序的情况选择全部缓存的策略的话，中间攻击人可以直接通过不断发送 HandShake 报文，来将客户端的缓存吃完的。

而 QUIC 的巧妙之处也就在这里，协议层的耦合可以使得其他层次安全机制在当前层面也可以服用，还记得上一篇文章讲的放大攻击的防范吗？客户端握手完成前，服务端不允许发送 3 倍以上的数据，直到收到客户端的响应，客户端可以以此为标示来应对这种场景防范。当然，从实现层面来讲，大部分实现者还是会选择直接丢弃这种乱序报文，因为维护这种缓存队列本身就是一个复杂的事。对此，RFC 也有相应的建议，服务端实现握手过程中的数据有限次的早于 PTO 结束的重传，来加速握手的完成。

情况 3 和 4 从原理上来看，和情况 2 面临的问题似乎也没有很大差别，但其中涉及到的细节问题还是需要 case by case 的讨论：

首先，在真实应用场景下，情况 3 却往往不存在，而其为什么不存在，则需要看情况 4 的问题。仅从 TLS 交互图来看，client 的 1-RTT 数据早于 client Handshake 报文到来，server 其实此时是有 1-RTT 的 key 的，可以完成数据的解密。

但考虑这两种情况：

(1) **在双向认证的场景下**，此时 client Handshake 中携带的是 client 的身份数据，server 不应该在身份验证完成前响应用层的数据，也就不应该在握手完成前，发送 1-RTT 的数据；

(2) **在 0-RTT 场景下**，首先我们知道，0-RTT 数据对应的响应都是通过 1-RTT 报文携带的，但 0-RTT 数据本身由于安全问题，只能依靠应用层的幂等性来实现重放攻击的保护。在握手没有成功前，server 无法确认是否收完了所有 0-RTT 数据，而没有全量数据的情况下应用层也无法确认是否数据是否是重放攻击，所以在握手完成前，服务端也不能直接响应 0-RTT 的报文。

总的来说，出于应用层面的考虑，情况 4 有了更明确的限制，RFC9001 则直接明确规定服务端不应当在握手完成前处理 1-RTT 报文，但至于本身 UDP 层面的缓存怎么实现，就交给实现者根据自己的网络情况去斟酌了。

**二、收到之前加密阶段的包**

刚刚我们讨论的是如何处理新状态数据的问题，那么现在我们再看看如何维护老的状态的问题。从 TLS 的经验来看，似乎从直觉上来说我们并没有维护之前加密状态数据的必要，而 QUIC-TLS 和 TLS 也类似，如果通信某一端成功进入了下个握手阶段，那么也意味着其已经收到了所有必要的握手消息，那么如果它再次之前阶段的数据，这些数据要么就是重传，要么就是攻击，似乎也没有处理的必要？

的确，如果仅从握手来看，维护上一阶段的 key 是浪费的，但把 0-RTT 功能考虑进来，则就不一定了。对于 client 来说，正常情况下 0-RTT 数据的应当是早于 client 的 Handshake 报文发送的，但由于中间网络设备的不可控，0-RTT 数据是可能晚于 1-RTT 数据到来的，如果 server 能维持 0-RTT 的加密状态，那么就可以避免这些乱序包的重传。而我们前面已经讨论过，0-RTT 本身并不是一个很安全的机制，在 QUIC-TLS 中 client 应当在 1-RTT 密钥生成后马上将其废除，所以 server 也没有必要长时间维护 0-RTT 对应的加密状态，而对于具体维护的时间的选择，RFC9001 建议了一种类似 TCP Time_wait 的方案，即 server 只需维护 0-RTT 密钥为 3 个 PTO，确保乱序数据在网络中自然消亡。

除了 0-RTT 的 Key 的处理，QUIC-TLS 中还有一个 Key Update 的机制，用于在握手完成后，对当前状态的密钥进行更新，这个机制也面临着和乱序和新旧状态的 key 的维护的问题，但其原理和 0-RTT 是一致的，这里就不再赘述了。

## PART. 4 再看 QUIC-TLS 协议栈

至此，我们已经了解了 QUIC-TLS 是如何通过各种细节机制来保证其状态能成功层层演进了，我们不妨再回头看下图 6 中的 QUIC-TLS 的协议栈，可以看到，QUIC Packet Protection 这部分通过维护当前阶段的 key，以及显式加密等级的 QUIC 报文机制，可以清晰的得到明文的数据，而 QUIC Transport 这一层则提供了功能上相对独立的可靠传输机制。

如此来看，上层 TLS Handshake 这部分就可以拆的很细而且实现功能上的独立了，出于工程上的懒人思维，也是对于安全稳定性的考量，现有的 TLS 沉淀的各种能力能复用的当然要尽可能复用起来。所以我们可以看到 QUIC-TLS 里定义了如何去设计 TLS 的 API，让其刚好能和底层的 QUIC 交互使用。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b83cdfbfef6b4bd79b20b96d19ad7b10~tplv-k3u1fbpfcp-zoom-1.image)

*图 10. QUIC-TLS 和现有 TLS 的交互流程*

至此，本文差不多完成了对 QUIC-TLS 握手阶段的所有分析。可以看到，QUIC-TLS 的设计中充斥着大量层间耦合的考虑，任何一个功能点，并不是简简单单满足诉求就行，既需要向上考虑上层应用协议，也需要向下考虑本身协议栈的适配。而这样的设计，充斥着 QUIC 协议栈的各个点，我想这也就是 QUIC 历经这么多年才终成标准的原因之一吧。

文章写到这里确实有点长了，感谢各位读者可以看到这里。本文对于 QUIC-TLS 中涉及的很多细节流程比如 Head 保护的算法，Retry token 的加密等，都没有提及。

在我个人的视角来看，这些都是相对独立，并且较为容易理解的功能，读者自行看 RFC9001 应该就可以理解了，并不需要有什么特殊的分析说明。

**当然如果各位读者期望对这一类技术有一个总结的话，可以在文章最后留言**，后面再出一期关于这些技术的总结性文章。

## PART. 5 对于 QUIC-TLS 的展望

前文说了一圈 QUIC-TLS 和 TLS 的不同，反而到展望这里，QUIC-TLS 倒是和 TLS 的演进出奇的一致，当然这也是一个符合逻辑的结论。因为无论是 QUIC-TLS 还是 TLS，终究都是在为用户的安全提供保障，而下一代的安全技术也往往都是在加解密等技术细节上发力，在我们肉眼可见的未来，我们也许可以在 QUIC-V2 看到这些技术的落地：

**- Encrypted ClientHello**：这部分已经在前文讨论过，为了使 QUIC 的 Init 报文更加安全，我们可以通过公钥加密技术和带外公钥同步的方式，来实现首包的加密，感兴趣的读者可见相关草案。

**- Certificate Compression**：证书链过长一致是导致弱网环境握手成功率低的重要原因之一，而对证书进行有效压缩，会使交互数据大幅降低，提高握手成功率，感兴趣的读者可见相关标准。

**- Delegated Credential**：公有云、混合云环境的安全性一直受到各种挑战，而私钥作为如此重要的数据，部署在公有云上也有很大的风险，通过对叶子证书签发短期的委派凭证，可以有效的减少攻击窗口，感兴趣的读者可见相关标准。

**- 国密交互**：在当前局势下，密码安全已经上升到了一个很高的高度，我们也在尝试将国密算法标准化到 QUIC-TLS 流程中，以满足合规性和安全性的诉求。

当然各种新兴技术是层出不穷的，我们也会持续不断的跟进，以保证蚂蚁相关产品的用户在享受良好网络体验的条件下，也能得到极致的安全保障。

## PART. 6 最后带个货

最后的最后，看完技术分享，不如再来点产品分享及八卦时刻，OpenSSL 确实是一个不可多得的开源届良心产品，但它在 QUIC-TLS 这个事情上确实搞的有点令人迷糊。

很早前，Akamai 的贡献者就针对 QUIC-TLS 的功能做了 PR 提交，但是 OpenSSL 一直以 QUIC 还没有标准化作为理由，不给予合并考虑，等到 QUIC 标准化了之后，OpenSSL 官方社区又说自己不满足于只有 QUIC-TLS 的库支持，要自己搞个 QUIC 的完整实现 *(包**括 s_client，s_server 等测试客户端/服务端对于 QUIC 的支持)* ，虽然社区充斥着大量质疑的声音，但最终还是没能动摇他们的决心，当然这并不说明 OpenSSL 的抉择是错的，因为从 OpenSSL 组织的思考来看，OpenSSL 不太满足于当前想一个简单的为 QUIC 提供 TLS 库的能力的角色，他们想更进一步转变成一个为产品提供 QUIC 库的角色，而目前的选择也是他们的必由之路。

当然他们的理想是远大的，而苦的是我这种 OpenSSL 重度用户，OpenSSL 初期开源的 PR 其实在使用过程中还是有不少小问题，社区的不支持会让大量用户对这部分功能持观望态度，那么这些细节问题就会更难暴露出来，使用者们提交 PR 的动力也会弱不少。并且由于 OpenSSL 官方的这种不支持的态度，导致大部分开源 QUIC 库也选择了 BoringSSL，而这对于一些既有的，已经基于 OpenSSL 实现的产品则是一种灾难，这些产品想要切换到 BoringSSL 以集成相应 QUIC 库绝不是一件容易的事。

不过好就好在，有问题总有解法，我们在我们开源的 BabaSSL 库对 QUIC-TLS 做了全量实现，除了帮助社区原始 PR 完善其对应的功能之外，同时也兼容了部分 BoringSSL 的 API 使用，这部分也经过了蚂蚁的生产考验，欢迎各位读者来体验一下，当然不仅如此，对于前文 QUIC-TLS 展望中提到的技术，我们也正在或者已经完成了实现，欢迎各位读者前来尝鲜。

了解更多...

**BabaSSL Star 一下✨：**[https://github.com/BabaSSL/BabaSSL](https://github.com/BabaSSL/BabaSSL)

【参考链接】

【1】[https://datatracker.ietf.org/doc/html/draft-ietf-tls-esni-14](https://datatracker.ietf.org/doc/html/draft-ietf-tls-esni-14)

【2】[https://datatracker.ietf.org/doc/html/rfc8879](https://datatracker.ietf.org/doc/html/rfc8879)

【3】[https://datatracker.ietf.org/doc/html/draft-ietf-tls-subcerts-12](https://datatracker.ietf.org/doc/html/draft-ietf-tls-subcerts-12)

### 本周推荐阅读  

[深入 HTTP/3（一）｜从 QUIC 链接的建立与关闭看协议的演进](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247499565&idx=1&sn=00a26362451ee3bbc8ee82588514eb52&chksm=faa310f7cdd499e15e39f1cfc32644cb175340f26148cab50ca90f973e786c5ef4d8cb025580&scene=21)

[蚂蚁集团 Service Mesh 进展回顾与展望](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247509391&idx=1&sn=95883f61905cc4de15125ffd2183b801&chksm=faa34a55cdd4c3434a0d667f8ed57e59c2fc747315f947b19b23f520786130446b6828a68069&scene=21)

[【2022 开源之夏】欢迎报名 SOFAStack 社区项目！](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247508186&idx=1&sn=69dd9bb76f9d855f93a78e1c95e74304&chksm=faa34f00cdd4c616e2665aa82d786eb30abe031a1e8be2b050d41baf6daa00718506101e770b&scene=21#wechat_redirect)

[【2022 开源之夏】欢迎报名 MOSN 社区项目！](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247508230&idx=1&sn=ff326d1e46acb12c8a4f08e078bbe151&chksm=faa34edccdd4c7ca70cbcf8d79aa308fb4f8a627303fb31273db8a9ec11549a9655b82f8caa3&scene=21)

![img](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*8G5NRZ7UEToAAAAAAAAAAAAAARQnAQ) 
