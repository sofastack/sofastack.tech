---
title: "Service Mesh 的下一站是 Sidecarless 吗？"
authorlink: "https://github.com/sofastack"
description: "Service Mesh 的下一站是 Sidecarless 吗？"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2022-11-29T15:00:00+08:00
cover: "https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*6AMLS6prg-gAAAAAAAAAAAAADrGAAQ/original"
---

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b739484118204387bea70b72fdae124a~tplv-k3u1fbpfcp-zoom-1.image)  

文｜田阳 *（花名：烈元）*

MOSN Maintainer

专注云原生等技术领域

本文**3042**字 阅读 **10** 分钟

## 1. 背景

Service Mesh 被越来越多的公司认可并实践，在实际落地过程中也遇到了形形色色的问题，同时架构也在持续演进去解决这些问题：有的从初始的 DaemonSet mode 转变为 Sidecar mode，如 Linkerd ；有的从做 CNI 延伸到 Service Mesh 场景， 结合 eBPF 使用 DaemonSet mode，如 Cilium ；如今 Istio 也新增了 Ambient Mesh ，支持 DaemonSet mode 作为其主推模式。

不难看出一个演进趋势就是围绕着是否需要 Sidecar 而展开，那么 Service Mesh 的下一站将会是 Sidecarless 吗？本文将对目前的社区趋势做一个简要分析， 最后也将介绍蚂蚁在这方面的探索和实践。

## 2. 社区趋势

### 2.1 Cilium

Cilium[1] 是目前最火的云原生网络技术之一，基于革命性的内核技术 eBPF，提供、保护和观察容器工作负载之间的网络连接。

在 6 月份，Cilium 发布了 1.12 版本，其中发布了 Service Mesh 能力、Sidecarless 架构，它提供了两种模式：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1144f5f261e34b3b96109f84cf0c3d83~tplv-k3u1fbpfcp-zoom-1.image)

通过图表我们可以发现：针对 L3/L4 的能力，Cilium 使用内核的 eBPF 直接支持；对于 L7 的部分能力，将使用 DaemonSet 部署的 Envoy 来支持。Cilium 认为大部分能力都不需要 L7 的参与，通过 eBPF 就能满足，所以 Cilium 也称自己为内核级服务网格。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/94397c061843411c9cb606d531769e61~tplv-k3u1fbpfcp-zoom-1.image)

针对于此 Cilium 也有一个解释，结合应用程序 TCPD 最终被合入 linux kernel 发展为 iptables 为例，认为 Mesh 也应该作为基础能力下沉到 linux kernel 作为网络的基础组件，就类似于 TCP，作为 Linux 的一部分透明地提供的服务。

在当需要 L7 代理能力的时候，会构建 DaemonSet Envoy 处理 L7 的能力。Envoy 也已经有了 Namespace 的初步概念，它们被称为监听器。监听器可以携带单独的配置并独立运行，从而可以支持多租户的配置隔离 *(但目前还做不到资源和故障的隔离）* 。

Cilium 认为 DaemonSet 相比 Sidecar 最明显的好处就是代理数大大减少，减少资源和管理成本。

可以看出 Cilium Service Mesh 的发展历程是由下而上，从内核层慢慢向业务层扩展自己的服务边界，由 eBPF 来支持服务网络也是有一定的立场因素。但 eBPF 并不是银弹，DaemonSet mode 也是有一些其他的问题，收益和损失都是相对的。

#### 2.2 Linkerd

当然，Cilium 这个架构也不乏有挑战者，其中来头最大的就是 Linkerd[2] *（Service Mesh 概念的提出者）* 的创始人 William Morgan ，比较有意思的是 Linkerd 最开始的架构是 DaemonSet mode ，在后面的版本才换成 Sidecar mode ，对于此，作为逆行者的他应该最有发言权。

在 William Morgan 的最新文章[3] 中也客观提出了 eBPF 的一些局限性，为了保证  eBPF  的安全执行而不影响 kernel ，需要通过验证器验证是否有不正确的行为，这就导致 eBPF 的编写存在一定的潜规则，比如不能有无界循环；不能超过预设的大小等，代码的复杂性也就受到了一定限制。所以较复杂的逻辑用 eBPF 来实现也是有较高的成本的。

文章中也提到了 DaemonSet 的一些弊端：

**- 资源管理不可评估**：这取决于 K8s 调度多少 Pod 到该 Node；  

**- 隔离性**：所有应用公用一个 Proxy ，相互影响稳定性；

**- 爆炸半径变大**：影响整个 Node 的 Pod 实例；

**- 安全问题更复杂**：比如 Proxy 保存有整个 Node 的秘钥。

简而言之，Sidecar 模式继续贯彻了容器级别的隔离保护 —— 内核可以在容器级别执行所有安全保护和公平的多租户调度。容器的隔离仍然可以完美的运行，而 DaemonSet 模式却破坏了这一切，重新引入了争抢式的多租户隔离问题。

当然他也认为 eBPF 可以更好的促进 Mesh 的发展，eBPF+Sidecar 的结合是 Mesh 的未来。

> 我们也比较认可他对于 eBPF 的看法， eBPF 就像是一把瑞士军刀，小巧精湛，作为胶水把各种网络数据面连接起来，提供基础网络能力，比如提供访问加速，透明劫持，网络可观察性等能力。但要开发复杂的业务能力，在实操之后，感觉还是有点力不从心。目前我们团队也正在使用 eBPF 开发 K8s Service 和透明拦截等基础网络能力。

William Morgan 的说法看着也不无道理，我们先不急着站队，再来看看 Istio 是怎么做的，看是否会有新的想法~ 

### 2.3 Istio

在 9 月份，Service Mesh 领域的当家花旦 Istio 毫无征兆的发布了 Ambient Mesh ，并作为自己后续的主推架构，简单来讲就是把数据面从 Sidecar 中剥离出来独立部署，Sidecarless 架构，以彻底解决 Mesh 基础设施和应用部署耦合的问题。

> 比较好奇 Istio 在没有经过社区讨论和落地案例的情况下，是怎样决策笃定这个新的架构方向的呢？

Istio 认为 Sidecar mode 存在如下三个问题：

**- 侵入性**  

必须通过修改应用程序的 Kubernetes pod spec 来将 Sidecar 代理 “注入” 到应用程序中，并且需要将 Pod 中应用的流量重定向到 Sidecar 。因此安装或升级 Sidecar 需要重新启动应用 Pod ，这对工作负载来说可能是破坏性的。

**- 资源利用不足**  

由于每个 Sidecar 代理只用于其 Pod 中相关的工作负载，因此必须针对每个 Pod 可能的最坏情况保守地配置 Sidecar 的 CPU 和内存资源。这导致了大量的资源预留，可能导致整个集群的资源利用不足。

**- 流量中断**  

流量捕获和 HTTP 处理 通常由 Sidecar 完成，这些操作的计算成本很高，并且可能会破坏一些实现和 HTTP 协议不完全兼容的应用程序。

Envoy 的创始人也来凑了个热闹，他对 Sidecar 架构也是颇有微词。

我们在落地过程中也是遇到了类似的痛点，比如随着机房规模和应用规模的变大，应用的连接数继续膨胀导致 CPU 和 MEM 资源占用也在持续增加，但这一切都不是应用本身想去关心的。

那么让我们来解开 Ambient Mesh 架构真面目，是怎样来解决 Sidecar mode 的问题， 架构主要提出了分层：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e7251fce10284976a2031f4907ec57ee~tplv-k3u1fbpfcp-zoom-1.image)

从图中可以看出，跟 Cilium 有一些类似，这儿的两层数据面都是基于 Envoy 来构建的，Secure Overlay Layer 主要处理 L4 场景，DaemonSet 部署，L7 processing Layer 主要处理 L7 场景，以 gateway 形式通过 Pod 部署，一个应用部署一个 gateway。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4090371414c7457a9138017d984592ca~tplv-k3u1fbpfcp-zoom-1.image)

图中的 ztunnel 就是 L4 *（DaemonSet 部署）* ，waypoint 就是 L7 *（Pod 部署）* ，L4 和 L7 都是可选的，可以根据业务场景灵活组合，比如没有 L7 的场景，直接就用 L4 即可。

注：图中的 ztunnel 就是L4 *（*DaemonSet* 部署）* ，waypoint 就是 L7 *（Pod 部署）* 。

无形之中，Ambient Mesh 架构对 William Morgan 评论中的问题也做了一定的解决和反驳：

**- 资源评估**

Istio 认为 L4 资源占用少，然后 L7 的资源占用是通过 Pod 部署，可以更好的弹性。

**- 隔离性**

每个应用都将有一个 L7 集群，相互不影响。

**- 爆炸半径**

L4 逻辑简单相对比较稳定，L7 独立部署，也只影响自身应用。

**- 安全问题**

Istio 认为 Envoy 作为被世界上最大的网络运营商使用的久经考验的成熟软件，它出现安全漏洞的可能性远低于与它一起运行的应用程序。DaemonSet 模式下，出现安全问题时的影响范围并不比任何其他依赖每节点密钥进行加密的 CNI 插件差。有限的 L4 攻击面和 Envoy 的安全特性，Istio 觉得这种风险是有限和可以接受的。

针对 William Morgan 提到的 DaemonSet 增加了安全风险，我们也持保留意见，就拿证书场景为例，在没有统一接入层 *（南北向接入网关）* 这个产品之前 *（15 年前，还没有 K8s ）* ，应用的 HTTPS 证书和私钥都是放在跟应用一起部署的 Tengine 上，就类似于 Sidecar 模式，但接入层诞生的一个原因恰恰就是为了集中管理证书和私钥来减少安全风险，通过证书和私钥的分离架构，私钥单独存放在更加安全的 key 集群，并且通过 QAT 硬件加速，HTTPS 性能也更加高效。

**把 HTTPS 和 L7 服务治理能力从应用空间解耦出来下沉为基础设施，也让我们有更多的机会去做集中的优化和演进，同时也对应用更加透明，那个时代的以应用为中心。**

**统一接入层和目前 Service Mesh 的 DaemonSet mode 有着不少相似之处，DaemonSet mode 也可以认为是一个东西流量的 Node 接入层。**

**网络通信作为基础设施，和应用完全解耦后，可以更好的优化和演进，也能更加透明高效的为应用提供相关基础能力，比如网络连接治理，可信身份，链路加密，流量镜像，安全隔离，服务治理等，更好的以应用为中心。**

从 Cilium 到 Linkerd，再到 Istio，几大社区相互切磋，归根结底还是大家的业务场景不一样，也或者是立场不一样。在安全性，稳定性，管理成本，资源占用上，总是会有一个侧重点，这是需要根据不同的业务场景去选择，脱离业务场景谈架构，还是比较空洞。  

## 3. 下一站

没有最好的架构，只有最适合自己的架构，在大家的业务场景，你会选择 Sidecar ，还是 Sidecarless ，你认为的下一站是什么呢？

下周我们即将发布 《降本增效: 蚂蚁在 Sidecarless 的探索和实践》，一起来聊聊蚂蚁在这个方向的探索和演进，期待和大家的交流~

## 4. 引用

[1]Cilium :

*[https://istio.io/latest/blog/2022/introducing-ambient-mesh/](https://istio.io/latest/blog/2022/introducing-ambient-mesh/)*

[2]Linkerd :

*[https://isovalent.com/blog/post/cilium-service-mesh/](https://isovalent.com/blog/post/cilium-service-mesh/)*

[3]William Morgan 的最新文章:

*[https://buoyant.io/blog/ebpf-sidecars-and-the-future-of-the-service-mesh](https://buoyant.io/blog/ebpf-sidecars-and-the-future-of-the-service-mesh)*

**MOSN Star 一下✨：**  

**[https://github.com/mosn/mosn](https://github.com/mosn/mosn)**

## 本周推荐阅读

[蚂蚁集团 Service Mesh 进展回顾与展望](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247509391&idx=1&sn=95883f61905cc4de15125ffd2183b801&chksm=faa34a55cdd4c3434a0d667f8ed57e59c2fc747315f947b19b23f520786130446b6828a68069&scene=21)

[顺丰科技 Service Mesh：落地半年，最初目标已经实现，将在更多场景进行大规模探索
](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247514453&idx=1&sn=1a1a3edb14cc1e9f9a2afc2ac1cc939c&chksm=faa3568fcdd4df998340a1cc1dbd0e9c5cc3c762fed1ff2ede263ebc7af86aa4d86bb23fb0e3&scene=21)

[「网商双十一」基于 ServiceMesh 技术的业务链路隔离技术及实践](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247499337&idx=1&sn=a0f3965f5989858c7e50763e696c9c53&chksm=faa31193cdd49885045adfce40c76e7cde9b689203845f2f674c24f379c246868d272c8adcbd&scene=21)

[MOSN 反向通道详解](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247513902&idx=1&sn=be00c5af2e9775a4039430bf187e16f4&chksm=faa358f4cdd4d1e23d7e9c93b4a94d6e6c377f51eb5e96b6dd5f74b840e48ebd3f518c4bf80a&scene=21)
