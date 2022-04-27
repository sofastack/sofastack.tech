---
title: "MOSN 1.0 发布，开启新架构演进"
author: "朱德江"
authorlink: "https://github.com/sofastack"
description: "MOSN 1.0 发布，开启新架构演进"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2022-04-26T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*VSMJT7-nwu0AAAAAAAAAAAAAARQnAQ"
---

文｜朱德江（花名：人德）

蚂蚁集团技术专家
*负责 MOSN 核心开发，关注云原生流量网关的演进*


以下内容整理自 SOFAStack 四周年的分享

**本文 5332字 阅读** **10 分钟**

## MOSN 1.0 发布

MOSN 是一款主要使用 Go 语言开发的云原生网络代理平台，由蚂蚁集团开源，经过双 11 大促几十万容器的生产级验证。

经过 4 年的蓬勃发展，在 11 位 commiter，100 多个 contributor 和整个社区的共同努力下，经历 27 个小版本的迭代，MOSN 1.0 版本正式发布了。

一个足够成熟稳定，有开源用户共建、有商业化落地、有社区，拥抱云原生生态的 MOSN 1.0 来了。

除了在蚂蚁集团的全面落地，MOSN 在业界也有较广泛的应用，比如有工商银行的商业化落地，还有阿里云、去哪儿网、时速云等企业的生产实践。

同时，随着 1.0 的发布，进入少年期的 MOSN 也将开启新一代 MOE 架构演进，奔向星辰大海。

## 发展历史

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1346ae0d606740edbcb253ace21e3f0f~tplv-k3u1fbpfcp-zoom-1.image)

MOSN 起源于 Service Mesh，原本在微服务之间的调用是通过比较重的 SDK 来完成的，当 SDK 升级的时候，需要应用配合一起升级，有比较强的打扰。

MOSN 为了解决这一痛点，向着把 SDK 剥离出来的方向演进。在应用所在的 Pod 内，单独有一个运行 MOSN 的 sidecar，那么应用本身只需要跟 MOSN 去通讯，就可以完成整个的服务调用的流程。把 SDK 剥离出来，相当于 MOSN 作为一个独立的组件去演进，其演进过程对应用本身没有打扰。这在蚂蚁内部的收益其实是非常明显的。

在整个演进的过程中，有两个比较深的体会：一个比较明显的是，有一个独立的 sidecar，可以去跟业务逻辑做解耦；另外一个标准化，在云原生的时代里，控制面和数据面被拆分为两个独立的组件，MOSN 作为数据面的组件，演进过程中要跟很多控制面的服务对接，这期间标准化是一个很重要的。在整个标准化的过程中，它并不像业务解耦那么直观，但是用的时间越长，对其越深有体会。

现在 MOSN 已经在蚂蚁内部全面的铺开，部署有几十万 Pod，峰值 QPS 千万级。

## MOSN 的演进历程

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1253d0197f8048b28dd70f76abebc03a~tplv-k3u1fbpfcp-zoom-1.image)

**2018 年：** 开始创建；

**2019 年：** 在双 11 完成了核心链路的覆盖，在 19 年底的时候，MOSN 开始独立运营；

**2020 年：** 7 月份获得 Istio 官方的推荐。同时，MOSN 开启了商业化的探索，年底完成了江西农信的落地；

**2021 年：** 对接了 Envoy、Dapr、WASM 生态，和主流的社区合作。同年 12 月份， 在工商银行完成了商业化的落地，树立了业界新标杆。

MOSN 除了在蚂蚁内部全面铺开，以及商业化的落地实践，还有逐渐完善的社区。MOSN 社区目前有 11 个 Committer，其中超过 70% 是非蚂蚁的 Committer，有 100 多位的 Contributor，经过了 28 个小版本的迭代。MOSN 还有很多开源的用户，他们将 MOSN 在自己公司落地，也对 MOSN 有很多的贡献。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f383080c77d64536929d71e773473c74~tplv-k3u1fbpfcp-zoom-1.image)

社区除了在 MOSN 项目的贡献之外，还有对其他项目/社区的贡献，包括Holmes、BabaSSL、Proxy-Wasm 等项目，以及跟其他生态项目的对接。

总体来说，MOSN 现在足够成熟稳定，有商业化的落地，有社区、有周边、有生态，所以我们选择这个时间点发布 MOSN 1.0 版本。

## 1.0 的核心能力以及扩展生态

MOSN 1.0 版本标志性的成果是已经集成了 Istio 的 1.10 版本。

MOSN 作为网络代理的软件，在核心转发方面已经支持了 TCP、UDP、透明劫持的模式。MOSN 所处在东西向网关场景下，有很多内部的、私有的非标协议，MOSN 除了支持 HTTP 标准协议以外，还有很重要的 XProtocol 框架，可以非常简单、方便支持私有的非标协议，内置的 Bolt、 Dubbo 协议，也是通过 XProtocol 框架来实现的。我们还支持了多协议的自动识别，也是在东西向流量网关里面比较核心的、比较特别的能力支持。

后端管理和负载均衡是在网络代理情况下，比较基本的常规能力。MOSN 也支持了连接池、主动健康检查、各种各样的负载均衡的策略。

在核心路由上，MOSN 支持基于 Domain 的 VirtualHost，引入了一个非常强大的变量支持，通过变量做复杂的路由规则，也支持了 Metadata 的分组路由。还有路由级别的超时、重试的配置，以及请求头、响应头的处理。

简单来说，作为一个网络代理的平台，通用的核心能力 MOSN 都已经完全具备了。

同时在网络代理的场景，通常需要做很多扩展，MOSN 的扩展生态做到了什么样的程度了呢？

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/56e2c9fa88e74fcfa5f29b0f87df9fe3~tplv-k3u1fbpfcp-zoom-1.image)

**RPC 协议：** 有 Dubbo 和 SOFABolt 的支持，同时基于 BabaSSL 做了国密的支持；

**控制面：** MOSN 已经做了  Istio 的支持；

**注册中心：** SOFARegistry；

**可观测性**：Skywalking 以及 Holmes 针对 Go 运行时期间，资源使用异常的自动分析和诊断。

在网关场景里，有很多的逻辑是需要做定制的。除了常规的用 Go 写一些 filter 扩展之外，还支持 Go Plugin 这种轻量级的模式，也支持 Proxy-Wasm 标准的 Wasm 扩展运行在 MOSN 中，服务治理方面也对接了 Sentinel。

## Istio 1.10

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ec9373542bac4e7593fdd83f32c42b51~tplv-k3u1fbpfcp-zoom-1.image)

MOSN 会通过标准的 xDS 协议和 Istio 通讯，这是一个非常标准的使用方式，同时我们也在积极的参与标准的建设。

我们在标准的制定过程中，积极提案参与讨论，比如说限流的和路由的 proto，也正是我们和 Istio 有非常多的合作，才能够获得 Istio 官方的推荐。

MOSN 起源于 ServiceMesh 东西向流量的场景，我们经过了四年的努力，选择在今天这个时间点发布 MOSN 1.0 版本，作为一个成熟稳定、有商业化落地、有社区、有生态的一个版本呈现出来，我们欢迎更多的人来使用 MOSN，也欢迎大家一起来共建和成长。

## 二、MoE 新架构

做这个的愿景初衷是什么？

这样做的优势是什么？

MoE 新架构的探索有什么新的进展？

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fff92a4e552d4aa58370204299bfbfee~tplv-k3u1fbpfcp-zoom-1.image)

首先 Enovy 和 MOSN 是作为目前市面上的两个数据面，它们都各有特点， Enovy 是 C++写的，处理性能会比较高。MOSN 的研发性和效能高，有很好的生态。

MoE 就是 MOSN 加 Enovy。我们希望能够做把两者的优势给融合起来，相互融合，各取所长，把高性能和高研发效能结合到一起，支持我们做大做强，走得更远。

MoE 架构在 Enovy 的角度来看，MOSN 作为 Enovy 的一个插件扩展，在所有的 Enovy 的扩展方式里面，做一个横向的对比。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a25826a564584cfd870b7992f4229860~tplv-k3u1fbpfcp-zoom-1.image)

**1.首先第一个是 Lua**

嵌入式的脚本语言有比较强的优势，它操作简单。但是作为相对小众的语言，劣势也很明显——生态不好。我们目的是为了提高研发效能， Lua 无法让我们达到目标。

**2.WASM 是比较诱人的方案**

WASM 在发展初期，有很多东西还只是停留在愿景上。很多的语言支持不友好，以及 runtime 性能不够好，这都是很现实的痛点。

**3.外部跨进程通讯**

外部跨进程通讯性能比较差，跟 CGo 比，相差将近一个数量级。其次管理很多其他外部进程比较复杂，如果有不同的语言，就需要有不同的进程，管理成本比较大。

相比， MoE 有两方面优势：

- MOSN 现有很多的服务治理的能力，可以最大化复用起来；

- Go 语言的生态，在未来的演进的路上需要写更多的扩展，可以沿用 Go 高效的研发效能。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a5e491178c424ec195d25b05f17b0030~tplv-k3u1fbpfcp-zoom-1.image)

回过头来看整个架构，站在 MOSN 这个角度上来说，Envoy 是作为 MOSN 的网络运行库的角色。请求会先经过网络运行库 *（Envoy）* ，然后再通过 CGo 这个桥梁，把请求信息交给 MOSN，MOSN 完成请求逻辑之后，再去把响应交回给网络层。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/af946294d77a4b1997b9e286bf6de06d~tplv-k3u1fbpfcp-zoom-1.image)

目前的 MoE 的架构在蚂蚁内部已经完成了落地，也拿到了我们预期的收益。

CGo 作为了 MOSN 和 Envoy 之间很重要桥梁，其性能很大程度决定了 MoE 的整体的性能表现。在 CGo 的具体实现里，包括了从 C 到 Go，以及 Go 到 C 这两个调用方向，两个调用方向有一些实现上的区别。具体到 MoE 架构，主要是从 Envoy 到 MOSN，也就是从 C 到 Go 这个方向。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/92cc9e1660434bf98091672a4ef5d48d~tplv-k3u1fbpfcp-zoom-1.image)

目前已经完成了一个数量级的优化提升——从 1600 纳秒到 140 纳秒。 *（通过本地最简单的测试，基本上只是覆盖到 CGo 本身的开销，不考虑掉到 Go 里面有很复杂的逻辑。* *）*

**140 纳秒是个什么概念？**

就差不多跟 Go 调 C 是一个量级，也就是目前官方的实现。 *（我们目前的优化也提给了 Go 的官方，通过了几轮的 review，还在等其他官方成员的 review。）*

因为 Go 是跨平台的，目前的实现还只支持 x86/64 体系，需要给不同的体系结构加对应的实现。

在 CGo 方面，还分析出了很多的优化空间。比如，搞一个 extra P 机制，对应于 extra M 的机制，解决高负载场景对 P 资源的争用。

另外一个就是寄存器传参，现在 C 和 Go 之间传参，把参数是放到一个结构体里，如果可以改用寄存器传参应该可以获得更好的性能。

目前已支持将 MOSN 部分 filter 运行在 Envoy 中，开源仓库可以找到这一部分，欢迎大家来试用。

*https://github.com/mosn/mosn/blob/master/pkg/networkextention/README-cn.md*

**MoE 开源计划**

把抽象的 API 提供给 Enovy 官方，再基于标准 API 实现 Go 的扩展，（大概会是在 8 月份完成）。下半年完成 MoE 的整体开源，也欢迎大家持续的关注。

## 2022 年 Roadmap

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cfd3bf23192641d9bbed6b5c0b3f8ce9~tplv-k3u1fbpfcp-zoom-1.image)

今年除了在东西向的持续演进迭代之外，还会做南北向的网关。

我们会结合 Istio 提供一个开源的产品，这是一个长远的规划，也是我们认为云原生的网关未来可能会演进的方向。

2022 年的 Roadmap 中，除了这种核心能力，比如说我们会做模块化结构， 优雅退出 *（这些已经在 1.0 版本里实现了）* 。还有各种微服务的生态，也会对接更多的注册中心这种配置中心、云原生、集成 Istio1.10。还特别增加了稳定性建设，随着 MOSN 的用户越来越多，大家对稳定性能力的呼声也越来越高。

我们把蚂蚁内部落地的 Holmes 集成到了开源的 MOSN 里，对于运行时的资源异常，可以捕捉异常现场来分析。关于 Holmes，我们之前有过一个分享，感兴趣的可以去阅读。

*https://mosn.io/blog/posts/mosn-holmes-design/*

**南北向网关接入**

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/52fd9a94cf37437d93f1a483ca0d3fa5~tplv-k3u1fbpfcp-zoom-1.image)

除了 Roadmap 中各种能力上的发展计划，有一个很重要的演进方向是南北向网关接入。MOSN 在 1.0 版本之后会升级到 MoE 的架构，南北向的接入网关是一个更大流量的场景，也将会用新架构的 MOSN 来支持。

由于历史原因，MOSN 有非常多的网关形态，比如内部的 Spanner 和 MobileGW。并且每个网关形态，网关数据面都是不同的实现。

我们的演进方向是，数据面统一用 MOSN 来做底层支持，控制面走标准的 xDS 协议，跟 Istio 对接。这样的话，无论是东西向还是南北向都能够用云原生的方式，以标准的方式去做对接。

基于传统的南北向网关架构，我们去做云原生的演进可能是一个艰难难的路子，我们更希望用 MOSN，用 MoE 新架构，这种更云原生的架构来演进。

**为什么要去做 MoE 架构的探索？**

MOSN 不局限于东西向流量，而放眼于统一的网络转发。以及在云原生的时代，多云已经是非常现实的需求了，这促使所有的网络要以标准的方式去对接。这是发力南北向接入网关的重要原因，我们希望把所有的网络转发都统一起来，去支持更多的应用场景。

当然，南北向网关也会面临很多的挑战，作为一个集中式的网关，它的配置规则也很多，稳定性和性能要求也会更高。包括我们选择的 Istio，也会面临一个规模挑战，以及怎么面对从老的数据面迁移过来的成本。

面对新的挑战，进行了 CGo 的优化保证性能，还有 TLS 协议能力的增强，目前 Envoy 在 TLS 协议的能力，还是比较适用于东西向网关。为了是适应于南北向网关，我们会去做一些增强，比如动态的证书签发，还有单域名多证书的支持。以及稳定性方面，基于 Enovy 的多线程模型，进程 crash 会比多进程的方案有更大的影响，我们首先会提升 crash 后的恢复速度。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ac810e2eb515459aa8424bfd16c365c9~tplv-k3u1fbpfcp-zoom-1.image)

我们的长远目标是希望跟社区共建，提供开源的完整产品，大家基于开源的方式协作，把产品做大做强。

MOSN 目前作为数据面的呈现，产品能够包含一整套解决方案，我们的第一目标是达到开箱即用的效果。

另外一个是双模支持，首先是 MOSN 会支持标准的 xDS，这是比较有潜力的演进方向。其次，在落地的过程中，MOSN 不会只保留 xDS 这一条路。MOSN 还是会去支持所有的注册中心、配置中心。这样在业务落地的过程中，两边可以同时运行。基于原有的高性能的研发效能，保持方便的定制开发能力。

最终，希望 MOSN 成为统一的网络转发平台，支持东西向、南北向的流量，以及在多云场景下的支持。

当数据面网络能够做到统一，MOSN 会在开源、商业化朝着这个方向持续的探索集中力量去做更长远的事情，也希望更多朋友能够参与进来，一起来共建。

欢迎大家使用 MOSN，共同成长

MOSN 官网：https://mosn.io/

MOSN GitHub 地址：https://github.com/mosn

### 本周推荐阅读

- [金融级应用开发｜SOFABoot 框架剖析(https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247505461&idx=1&sn=198480c36943e1b904ab88291b539057&chksm=faa339efcdd4b0f91810d2c2dc2a9536f5378973a67d03e98f5b6a813771d46bd9cb145ed4d1&scene=21#wechat_redirect)

- [“SOFA 星球”闯关计划 ——Layotto 飞船](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247505856&idx=1&sn=bbf95767a84de62d4bb2bdf46644ab30&chksm=faa3381acdd4b10c76825f7d3999fb4956ce0d24562a7a26af1732c70d28966b2f84f0457800&scene=21#wechat_redirect)

- [HAVE FUN | 飞船计划、源码解析活动最新进展](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247506596&idx=1&sn=20a8f689516c0252ac1957510c8156ba&chksm=faa3357ecdd4bc684c5f9d0d6f91f4b84b4e52da45c94c3907570a2e0b09b1d4df45fa505cc5&scene=21#wechat_redirect)

更多文章请扫码关注“金融级分布式架构”公众号

>![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*8G5NRZ7UEToAAAAAAAAAAAAAARQnAQ)
