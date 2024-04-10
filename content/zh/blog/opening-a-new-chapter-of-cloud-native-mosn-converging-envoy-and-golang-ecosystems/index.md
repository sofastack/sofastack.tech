---
title: "开启云原生 MOSN 新篇章 — 融合 Envoy 和 GoLang 生态"
author: "王发康"
authorlink: "https://github.com/sofastack"
description: "开启云原生 MOSN 新篇章 — 融合 Envoy 和 GoLang 生态"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2021-07-06T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*lKqNRIy3iDEAAAAAAAAAAAAAARQnAQ"
---

> 注：本文是王发康（毅松）在 2021 GopherChina 上演讲的文字稿，相关分享 PPT 可自行到 MOSN meetup 下载。[MOSN meetup 地址](https://github.com/mosn/meetup)；[MOSN 官方 Github 地址](https://github.com/mosn/mosn)；[GitHub 地址](https://github.com/sofastack)。

## 前言

MOSN 在 Service Mesh 领域作为东西向服务治理网络在蚂蚁集团双 11 、春节红包等活动及开源社区都得到了一定实践。为了能够让社区用户更好的享受到这一技术红利，MOSN 从 2018 年开源以来在社区开发者、用户的共同努力下，使得 MOSN 在云原生演进方面做了很多探索和实践。比如 [Istio 下另一个数据面 — MOSN](https://istio.io/latest/blog/2020/mosn-proxy)、[WebAssembly 在 MOSN 中的探索与实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487546&idx=1&sn=72c3f1ede27ca4ace7988e11ca20d5f9&chksm=faa0ffe0cdd776f6d17323466b500acee50a371663f18da34d8e4cbe32304d7681cf58ff9b45&scene=21)、[MOSN 子项目 Layotto：开启服务网格+应用运行时新篇章](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247488835&idx=1&sn=d645b9abc866048e679b56bfe3b72482&chksm=faa0fa99cdd7738ff1749ae75b1670f953c92b70dcf0358337977438fd74b632b21a7b17ece3&scene=21)、[MOSN 基于 Sentinel 的限流实践](https://github.com/mosn/mosn/pull/1111)、[MOSN 中玩转 Dubbo-go 等周边生态展开合作](https://mosn.io/blog/posts/mosn-dubbo-integrate/)。

2021 年为了更好的为业务提效，MOSN 开启了将云原生进行到底的决心。本文介绍了 MOSN 在网络扩展层的思考和技术选型，以及最终是如何通过使用 Envoy 作为 MOSN 的网络层扩展，从而实现 MOSN 和 Envoy 生态打通。使得网络层具备 C++ 高性能的同时，上层业务治理能力也能借助 GoLang 进行高效的定制化开发。

> ![](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*QeOgTaYP5qkAAAAAAAAAAAAAARQnAQ)

## 面临的问题及挑战

### 一、社区生态，如何最大化求同存异

最近几年 Service Mesh 技术在云原生社区也是百花齐放，虽然 MOSN 在开源社区也是备受开发者的关注，但是 Envoy 经过长久的发展其社区的活跃度和用户量的积累这点是不可忽略的。另外选择 MOSN 的用户都是看重其二次开发的便捷性以及 GoLang 的生态丰富，选择 Envoy 的用户主要是看重其高性能的网络处理能力及社区的活跃度。那我们是否能够通过技术的手段将其二者优势融为一体，发挥各自的特长，**不要让用户顾此失彼**。

### 二、单一的 Proxy，无法支撑其架构的演进

在 Proxy 层面，无论是 MOSN 还是 Envoy 都是在各自领域中发挥优势。随着云原生技术的快速发展和成熟以及业务的增长，既要 Proxy 能够具备高研发效能，还要具备高处理性能，而单一的 Proxy 已经无法满足当前业务架构上的持续演进。

东西向和南北向数据面 Proxy 逐步统一：两套数据面定位不同但功能上存在一定重叠，导致维护成本高，未来需要逐步收敛。这就要求 Proxy 不仅具备易扩展性方便业务方扩展东西向业务上的流量治理能力，而且还要具备抗高并发的能力满足南北向高流量转发。

Service Mesh 部署形态逐步向 Node 化架构演进：Service Mesh 规模化后，由于多出的 Proxy 势必会导致一定资源上的浪费，那在中心化和 Mesh 化之间做一次折中，即通过 Node 化部署形态来解决。Node 化后就要求 Proxy 能够高效、稳定的承载多个 POD 的流量治理。

Service Mesh 需要同时具备 Application Runtime 能力：虽然 Service Mesh 解决了微服务治理的痛点，但在实际业务开发中，缓存、数据库、消息队列、配置管理等，仍然需要维护一套重量级的 SDK 并且侵入应用代码。目前业界的解决方案是在 Service Mesh 的基础上多引入一个 Proxy 如 Dapr 来解决，这就导致应用的 POD 需要维护多个容器，所以如何让 Service Mesh 的 Proxy 具备快速复用 Dapr 能力成为解决该问题的关键。

## 我们的思考

针对上述问题分析过后，其实背后的原因是有共性的。比如将其统一为一个 sidecar，如果单纯的从一个数据面改为另一个，那其中的改造成本是巨大的。那是否可以换个思路，为 MOSN 的网络层增加可扩展性，即可以让 MOSN 的网络处理直接下沉至 Envoy，同时将这个能力剥离出来成为 Envoy 在 GoLang 上的一个标准能力，这样就能够让 Envoy 和 MOSN 互相复用已有的能力。二者相互融合，各取所长，使其同时具备高研发效能和处理性能高，自然而然就解决上述“单一的 Proxy，无法支撑架构的演进”和“社区生态，如何最大化求同存异”所面临的问题。相互融合后，不仅融合了各种的优势，而且也能够把两边的生态打通，借此 MOSN 社区和 Envoy 社区能形成双赢的局面。

> ![](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*QU0SRa5hP7oAAAAAAAAAAAAAARQnAQ)

## 方案调研与分析

知道当前面临问题的原因后，便有了一个宏观的解决方向。于是就对此展开了相关调研，梳理了业界针对此问题的一些解决方案，综合各种方案的优劣势并结合蚂蚁业务现状以及开源社区用户的痛点进行了分析和评估。

**扩展方案调研**

> ![](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*a-e6Ta173LQAAAAAAAAAAAAAARQnAQ)

**扩展方案评估**

> ![](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*pHEyQoGUkxEAAAAAAAAAAAAAARQnAQ)

通过上述方案优劣势的对比以及评估，MOE（MOSN on Envoy） 相比 ext-proc 无需跨进程 gRPC 通信，性能高，易管理；相比 Envoy WASM 扩展无需网络 IO 操作转换成本；相比 Lua 扩展生态好、能复用现有的 SDK，对于处理上层业务更合适。

同时我们将 Envoy 中增加 GoLang 扩展的这个方案也在 Envoy 社区进行了讨论，也得到了 Envoy 社区 Maintainer 的赞同。其中依赖的技术 CGO 是 GoLang 官方出品，该技术基本上在 GoLang 每个 release notes 中都有提到，说明也一直在维护的。另外业界也有很多项目在使用这项技术（比如：NanoVisor、Cilium、NginxUnit、Dragonboat、Badger、Go withOpenCV etc）其稳定性已经过一定的考验了，同时我们自己也测试了 CGO 自身的开销在 0.08 ~ 1.626 微秒，而且调用开销也是属于线性增长而非指数增长趋势。

> ![](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*khO3QJSyXSkAAAAAAAAAAAAAARQnAQ)
>![](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*D0boRphWsmYAAAAAAAAAAAAAARQnAQ)

所以综合稳定性、性能、改造成本以及社区生态等因素评估，MOE 解决方案无论在当前阶段还是未来都具备一定优势。

## 方案介绍

### 一、整体架构

如下是 MOE 的整体架构图，最下面是各种高性能数据面，目前我们主要适配的是 Envoy。在数据面之上剥离了一层 GoLang L7 extension filter 的抽象，用于和底层的数据面连通；然后在 MOSN 侧通过 GoLang L7 extension SDK 将 MOSN 连通；最后通过 CGO 这个通道将 Envoy 和 MOSN 打通。

> ![](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*IBp2SZKilbYAAAAAAAAAAAAAARQnAQ)

整体架构如上图所示，其核心包括如下三部分组成：

**1、GoLang L4/L7 extension filter**

使用 C++ 实现的 Envoy 侧的 GoLang L4/L7 filter ，该模块通过 CGO API 来调用 GoLang 实现的 L4/L7 extension filter。

**2、GoLang L4/L7 extension SDK**

GoLang L4/L7 extension SDK 会导出一些 CGO API，用于 Golang L4/L7 extension filter 和 L4/L7 extension GoLang filter 交互。

**3、L4/L7 extension filter via GoLang**

L4/L7 extension filter 是 GoLang 语言开发的，用于对 Envoy 的请求或者响应做一些处理，最终是运行在 Envoy 工作线程之中。

### 二、功能职责

通过上面对整体架构的介绍，应该对 MOE 有了一个宏观上的认识。接下来我们通过功能职责方面来介绍下 MOE 中 MOSN 和 Envoy 是如何各司其职的：整体思路就是充分发挥 GoLang 的高研发效能以及 Envoy 在网络层的高性能特性，所以在 MOSN 侧来扩展上层业务的服务治理能力，复用 Envoy 底层高效的 Eventloop 网络模型。

> ![](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*aChpTre1Tn4AAAAAAAAAAAAAARQnAQ)

**MOSN 侧做业务扩展**：扩展非 xDS 服务发现、扩展 L4/L7 filter、扩展 Xprotocol 支持、Debug 及 Admin 管理、Metrics 监控统计；

**Envoy 侧复用基础能力**：复用高效 Eventloop 模型、复用 xDS 服务元数据通道、复用 L4/L7 filter、复用 Cluster LB、复用 State 统计。

### 三、工作流程

通过使用 GoLang 在 Envoy 中实现的“TraceID 事例”来介绍 Envoy GoLang extension 的工作流程：

1、请求/响应到达 Envoy 后，通过 GoLang L7 extension filter 将请求/响应信息通过 API 封装为特定格式；

2、然后将其封装后的结构体通过 CGO API 传递给 GoLang extension framework；

3、该框架收到数据后将会执行 Trace ID filter（GoLang 实现的 Filter，用于生成一个 trace id 请求 header）；

4、当 GoLang filter 执行完成后，会把处理后的信息通过特定的结构体返回给 GoLang L7 extension filter；

5、GoLang L7 extension filter 收到返回的特定结构体信息后，将其操作生效到当前请求/响应。

> ![](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*Jo6eR4eikD0AAAAAAAAAAAAAARQnAQ)

其中在上述的(**1、2、4、5**)步骤中涉及到 Envoy 和 GoLang 的交互协议、(2、4)中涉及到 Envoy 和 GoLang 之间的内存如何管理、(2)中阻塞操作处理，接下来是这些问题的解决方案：

**交互协议（1、2、4、5）**

将 Envoy 的请求使用 GoLang L7 extension filter 的 proxy_golang API(GoLang L7 extension SDK)进行封装，然后通过 CGO 通知 GoLang 侧的 filter manager 进行处理，其流程如下图所示：

> ![](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*L5IWRbP4F9AAAAAAAAAAAAAAARQnAQ)
>![](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*rOpuQ5Z2qFcAAAAAAAAAAAAAARQnAQ)

当 Envoy 侧收到请求后，将请求的 header、body、trailer 封装为 CGO_Request 类型，然后调用 proxy_golang_on_request，GoLang filter 处理后的结果会封装为 CGO_Response 返回给 Envoy 继续处理。当 Envoy 侧收到响应后，将响应的 header、body、trailer 封装为 CGO_Resquest 类型，然后调用 proxy_golang_on_response，GoLang filter 处理后的结果会封装为 CGO_Response 返回给 Envoy 继续处理。同时我们也期望可以和 Envoy、Cilium、WASM 社区合作共建这套 API 规范，这样可以使得多个扩展方案底层依赖的 API 能够标准化。

**内存管理（2、4）**

请求链路（CGO Request）

问题：将 Envoy 中的请求信息如何高效的传送给 GoLang，应该避免无效的内存拷贝操作。

方案：将 GoLang 中使用的 header、body 等信息直接指向 Envoy 的请求 header、body 的指针，这样请求从 Envoy 到达 GoLang 就不需要拷贝。

响应链路（CGO Response）

问题：请求在 GoLang 侧执行完成后，将处理结果返回给 Envoy，如果直接使用 GoLang 返回的内存是不安全的，因为 GoLang 中的内存可能会被 GC。

方案：把 GoLang 中生成的 CGO_Response 对象储到全局的 map 中，通过请求 id 进行映射，待 Envoy 使用完后，在将其对应的结构体从 map 中删除。

> ![](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*4iynTLctZIoAAAAAAAAAAAAAARQnAQ)

**阻塞处理（2）**

首先 Envoy 的事件模型是异步非阻塞的，如果 GoLang 实现的 HTTP filter 存在阻塞操作需要如何处理？

对于纯计算(非阻塞)或请求链路中的旁路阻塞操作，按照正常流程执行即可。对于阻塞操作，通过 GoLang 的 goroutine（协程） 结合 Envoy 的 event loop callback 机制来解决：

1、当请求传递到 GoLang 侧后，如果发现 GoLang 实现的 filter 中有阻塞操作；

2、则 GoLang 侧会立刻启动一个 goroutine 用来执行阻塞操作，同时会立刻返回，并告知 Envoy 需要异步操作；

3、Envoy 收到该消息后，则会停止该请求上的 filter 处理，然后继续处理其他的请求；

4、当 Golang 侧的阻塞操作执行完成后，则会通过 dispatcher post 一个事件告诉 Envoy 继续处理该请求。

> ![](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*Jmc_TrpNIugAAAAAAAAAAAAAARQnAQ)

除了上述我们在 GoLang 侧自身程序出现同步导致的阻塞外，是否还有其他场景？

我们都知道 GoLang 程序是 GMP 模型的，CGO 也是要遵守的，当 Envoy 通过 CGO 执行 MOSN(GoLang)，此时 P 的数量如何管理？M 从哪来？

> ![](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*GJb7Qai4UfoAAAAAAAAAAAAAARQnAQ)

M 的问题比较好解决，由于宿主程序是 C 系列的，所以会把当前 Envoy 线程通过 GoLang runtime 的 needm 来伪装成一个 M。其次就是 P 这个资源比较关键，如果此时没有空闲的 P 此时就会卡主 CGO 执行，虽然目前我们生产上还未出现该问题，但是还是有这个可能性的。所以目前我们想到的解决方案就是为 Envoy 每个 worker thread 都预留对应的 P，保证每次 CGO 的时候都可以找到 P 资源。

## 服务相关元数据如何管理

**MOSN 和 Envoy 的相关服务元数据信息，是如何交互管理的**?通过扩展 Envoy 中的 Admin API 使其支持 xDS 同等功能的 API, MOSN 集成的 Service Discovery 组件通过该 API(rest http) 和 Envoy 交互。使其 MOE 的服务发现能力也具备“双模”能力，**可同时满足大规模及云原生的服务发现通道**。

> ![](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*EX7OQKUz2DIAAAAAAAAAAAAAARQnAQ)

## 如何 Debug

MOSN 和 Envoy 相互融合后，在运行时变为一个进程了，那之前的可观测性以及调试如何保障？关于可观测性方面这块可以直接复用 MOSN 和 Envoy 自带 admin API 及 metrics 功能，关于两者之间的交互层我们增加了每次交互的耗时以及异常下的容灾保护。最后就是关于一个程序即有 C++ 又有 GoLang 如何便捷性调试的问题，对此我们调研了相关方案，通过 net/rpc 网络库模拟  CGO 的调用，使得用户调试 GoLang 侧和之前 Native GoLang 一样的方式调试即可。

> ![](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*mnY7QLDfSH0AAAAAAAAAAAAAARQnAQ)

## 方案总结

MOE 借助 CGO 通道不仅将 Envoy 和 MOSN 二者优势融为一体，而且将 GoLang 生态集成进 Envoy 变成了可能。在研发效能方面通过将 MOSN 作为 Envoy 的动态库，上层业务改动只需编译 GoLang 代码即可，极大的提升了编译速度，同时也增强了 Envoy 的自身扩展能力，使其能够方便复用 MOSN 中现有的服务治理能力。性能方面，MOE 复用 Envoy 的高效网络通道，之间的数据拷贝实现了 Zero Copy 可为 Dapr、Layotto 等提供高效网络通道，同时 Envoy 使用 C++/C 系可方便的集成硬件加速能力。关于在服务元数据通道方面，MOE 即可复用 Envoy 原生的 xDS 又可以方便的集成 GoLang Discovery SDK 实现多种服务元数据通道支持。最后 MOE 不仅单纯的将两个软件的优势做了加法，更重要的是使得 MOSN/GoLang 可以和 Envoy 生态拉通，实现多社区技术共享。

> ![](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*YFP5TZ3vqiQAAAAAAAAAAAAAARQnAQ)

## 开源共建及展望

秉着借力开源，反哺开源的思路。当我们对 MOE 方案 POC 验证可行性后，我们也将这个思路在 MOSN 和 Envoy 社区展开了相关的 A proposal of high-performance L7 network GoLang extension for Envoy 讨论。在得到 Envoy maintainer 的认可后，我们也在主导关于使用 GoLang 来扩展 Envoy 的提案：Envoy's GoLang extension proposal ，欢迎大家参与进来讨论。

> ![](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NZpQQ7mXEAoAAAAAAAAAAAAAARQnAQ)

另外，近期我们也在设计 MOE 具备 L4 的 GoLang 扩展能力，这样可方便使得 Envoy 集成 Layotto 或 Dapr 能力，从而同一个 sidecar 可具备 Service Mesh 与 Application runtime 能力，解决一个应用部署多个 Sidecar 导致的运维复杂性问题。

> ![](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*397oTppOzB8AAAAAAAAAAAAAARQnAQ)

## 方案实施效果

### 踩坑记录

前面我们对 MOE 从整体架构、功能职责以及工作流程做了详细的介绍，看似整体流程是可以跑通了。但是在我们落地实践的过程中也是遇到了不少问题。

下面这个列子就是在 MOE 工程中剥离出来的一个问题的最小复现场景，当时我们在 CGO 传递数据的过程中，为了方便我们直接在 C++ 侧通过指针来保存 header 的长度，当其传递到 GoLang 侧的时候，运行着运行着就 panic 掉了，如下所示：

> ![](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*J1f6T7ArWKIAAAAAAAAAAAAAARQnAQ)

通过分析后，发现是由于 GoLang 的函数栈在运行时触发了栈扩容操作，从而会触发 GoLang runtime 对当前函数栈上的指针做了一系列操作。对上述问题有影响的操作包括两个：其一是会对当前栈上的指针指向的地址做判断，检查是否是一个安全的地址；其二是判断当前栈上的指针指向的地址是否位于即将要扩容或者缩容的函数栈空间范围内，如果在该范围，则会根据扩缩容函数栈后的偏移量直接修改指针指向的地址。然而在我们的场景中，直接使用指针来存储长度，这将导致 runtime 中的第一个操作检查不通过，直接抛异常。虽然当时我们通过调整 GoLang runtime invalidPtr 来绕过第一个检查报错，但一旦我们所记录的长度正好和函数栈地址空间有交集的话，那对应长度的值也是会被修改的，所以也是不能满足的。最后通过修改了长度的传递存储方式来解决该问题。

由于篇幅有限，本文就不对所有问题进行展开了，整体来说遇到的问题还是非常有趣的，对此感兴趣或有疑问的欢迎找我们交流。

> ![](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*szegQImgEE8AAAAAAAAAAAAAARQnAQ)

## 最佳实践

从 2021 年 1 月到 3 月期间我们进行了 MOE 的方案设计到编码实现，并在 2 月份在 gRPC 网关集群进行了小规模试点，各项指标都正常，MOE 雏形方案得到了线上真实流量的验证。于是 3 月份的时候我们就找到兄弟团队相关同学讨论：今年有一个目标需要全站资源成本优化，我们基础设施是不是可以做点什么？所以就顺利成章的引出了 MOE 合作契机，经过几轮讨论以及简单的 POC 验证后决定在经济体互通网关场景，将内部的一个 Native Go 实现的网关基于 MOE 架构来替代蚂蚁侧的互通网关。其部署架构如下图所示(目前互通网关蚂蚁侧已经在灰度中)：

> ![](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*RRpxRYeZNLUAAAAAAAAAAAAAARQnAQ)

双方目标达成一致后，就准备开干了。虽然 MOE 雏形之前已经踩过一些坑了，但是在实际适配的过程中还是多多少少遇到了一些问题，那最终我们也赶在了 6.18 这个时间点前进行了灰度上线。如下引自第一个基于 MOE 架构来替换网关的实践 —《融合 Envoy 和 Go 语言生态打造高性能网关》，后续会有相关文章，敬请关注。

经过这样一番“折腾”，最终新版本基于 MOE 的网关在 6.18 活动前上线，并承担了总体流量的 10%，整体表现平稳，符合预期，现在逐步扩大引流中（截止 7 月 2 号引进引流到 30% 左右）。从我们的压测数据上看，相较于老版本，CPU 使用率和请求 RT 都有显著下降，在 TCP 连接数越高的场景，优势越明显，总体上能够取得** 2.6~4.3 倍的 QPS 性能提升**。

## 总结

MOE 技术方案使得 MOSN/GoLang 和 Envoy 相互融合成为了可能，打破了 MOSN/GoLang 和 Envoy 割裂的社区生态现状，为将来 Proxy 的持续演进奠定了坚实的技术基础。随着在经济体互通蚂蚁侧网关的落地实践，其 MOE 技术方案的稳定性、可靠性、易用性等方面都得到了一定的考验。同时秉着对技术的高标准要求以及能够更好的服务好我们的用户，我们也会持续探索和优化 MOE，如果该方案能也够解决你业务上遇到的问题，欢迎联系我们，最后感谢正在关注此项技术的用户，欢迎和我们交流和讨论！MOSN 用户交流群钉钉群号：33547952。

### 本周推荐阅读

- [MOSN 多协议扩展开发实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247488899&idx=1&sn=5558ae0a0c23615b2770a13a39663bb3&chksm=faa0fa59cdd7734f35bea5491e364cb1d90a7b9c2c129502da0a765817602d228660b8fbba20&scene=21)

- [MOSN 子项目 Layotto：开启服务网格+应用运行时新篇章](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247488835&idx=1&sn=d645b9abc866048e679b56bfe3b72482&chksm=faa0fa99cdd7738ff1749ae75b1670f953c92b70dcf0358337977438fd74b632b21a7b17ece3&scene=21)

- [开发 Wasm 协议插件指南](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487618&idx=1&sn=c5018dc2ddf1671d3fa632358ed6be90&chksm=faa0ff58cdd7764e61940713ac7f16b149b917662e54ea7b2590a701e7ca2d7dea50a3babf1c&scene=21)

- [Protocol Extension Base On Wasm——协议扩展篇](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487546&idx=1&sn=72c3f1ede27ca4ace7988e11ca20d5f9&chksm=faa0ffe0cdd776f6d17323466b500acee50a371663f18da34d8e4cbe32304d7681cf58ff9b45&scene=21)

更多文章请扫码关注“金融级分布式架构”公众号

> ![](https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*s3UzR6VeQ6cAAAAAAAAAAAAAARQnAQ)
