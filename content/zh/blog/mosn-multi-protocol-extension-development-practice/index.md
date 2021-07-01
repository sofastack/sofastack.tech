---
title: "MOSN 多协议扩展开发实践"
author: "永鹏"
authorlink: "https://github.com/sofastack"
description: "MOSN 多协议扩展开发实践"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2021-06-29T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*hSLqSp82nXIAAAAAAAAAAAAAARQnAQ"
---

>Service Mesh 是当今云原生的关键部分，蚂蚁已经在生产环境完成了大规模的落地，但是业界整体 Service Mesh 改造程度还不高。其中平稳的进行 Mesh 化改造是可以对已上线的业务进行 Mesh 化改造的前提，在平稳改造过程中，协议的支持又是最基础的部分。MOSN 提供的多协议扩展开发框架旨在降低使用私有协议的场景进行 Mesh 化改造的成本，帮助业务快速落地。

MOSN 是蚂蚁自研的一款高性能网络代理，主要用于 Service Mesh 的数据面 Sidecar。Service Mesh，是近几年来云原生方向比较热门的话题，其主旨就是构建一个基础设施层，用来负责服务之间的通信。主要就是有一个和服务应用共同部署的 Sidecar 来实现各种中间件的基础能力，实现基础设施的标准化、和业务逻辑解耦，做到业务无感知的基础能力快速演进。目前国内很多公司都开始拥抱 Service Mesh，和蚂蚁合作的一些企业，如中信银行、江西农信等也基于 MOSN 完成了 Mesh 化的改造。

Service Mesh 架构的目的就是为了降低基础设施改造升级对业务造成的影响，但是如何平滑的从传统微服务架构转向 Service Mesh 架构也是一个非常有挑战的工作，这里涉及的细节很多，但是无论如何有一个最基础的问题就是我们在进行灰度 Mesh 化改造的时候，已经 Mesh 化的节点需要能和没有 Mesh 化的节点维持正常通信。而不同的公司选择的通信协议都有所不同，这就直接导致在技术选型的时候，选择的 Sidecar 需要能够支持所使用的协议。一些受到广泛应用的协议可能还会被陆续的支持，而有的协议可能还是公司自己定制的，因此不可避免的是需要基于 Sidecar 的扩展能力，进行二次开发以支持私有的协议。

>![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*d-41RbTxDtcAAAAAAAAAAAAAARQnAQ)

### 多协议扩展框架

谈到 Service Mesh 的 Sidecar，就不得不提到 Envoy，这是一款被广泛应用的 Service Mesh Sidecar 代理。Envoy 的扩展框架支持开发者进行二次开发扩展，其中 Envoy 目前支持的不少协议就是基于其扩展框架开发实现的。在 Envoy 的扩展框架下，要扩展一个协议可以参考 Envoy 中 HTTP 协议处理的流程，包括 4 层 Filter 实现编解码部分与 Connection Manager 部分，在 Connection Manager 的基础上再实现 7 层的 Filter 用于支持额外的业务扩展、路由的能力、和 Upstream 的连接池能力。可以看到一个协议处理的流程几乎是贯穿了各种模块，实现一个协议扩展成本还是比较高的。

>![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*2TlaRJSx1sgAAAAAAAAAAAAAARQnAQ)

再来看一下 MOSN 的框架。MOSN 在一次协议处理上可以划分为四个层次，除开基本的从网络 IO 中获取数据的网络层以外，还可以划分为 protocol 层、stream 层与 proxy 层。其中 protocol 层负责协议解析相关编解码的工作，负责将数据流解析成 MOSN 可以理解的协议帧，或者将协议帧编码成二进制流；stream 层负责的内容就比较多了，包括处理不同的请求类型，初始化请求的上下文，关联事件，响应与请求之间的关联，还有 upstream 连接池相关的处理等，不同的协议处理的细节也会有所不同；proxy 层是一个协议无关的代理转发层，负责请求的路由与负责均衡等能力，同时也具备七层的扩展能力用于不同业务实现的扩展。根据这个架构，可以看到协议处理的核心就在于 protocol 层和 stream 层，相比于 Envoy 的设计来说，路由、七层扩展等部分是具备多协议复用的能力的。但是同时也可以看到 stream 层涉及的细节比较多，实现起来难度也是比较大的，为此 MOSN 在此基础上又提出了一个多协议扩展的框架，用于简化协议的实现。

>![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*pzA6R7sGaQkAAAAAAAAAAAAAARQnAQ)

MOSN 的多协议框架主要就是针对 stream 层的复用扩展能力，在 MOSN 的协议处理分层设计中， network 层和 proxy 层在设计上就是协议无关可复用的，如果能做到 stream 层也进行复用，那么协议实现就只需要关注 protocol 层的编解码本身，实现难度就会大大降低了。那么 stream 层是不是具备可复用的能力的呢，我们认为对于大部分协议，尤其是 RPC 协议来说是可以的。首先我们对协议进行一个抽象，定义成 XProtocol 接口，表示任意的协议。每个协议实现都是实现一个 XProtocol 接口，它包括基础的编解码接口、一些特殊请求响应的构造接口（如心跳、异常）、还有协议的模型（如类似 HTTP 的 pingpong 模型，常见的 RPC 多路复用模型等），以及协议匹配的接口。所有的 XProtocol 协议实现通过 XProtocol Engine 关联起来，除了通过配置指定使用哪种协议进行处理以外，对于实现了协议匹配接口的协议来说，可以基于请求特征进行自动识别。然后我们对于 XProtocol 解析出的协议帧也进行统一的抽象，包括多路复用相关的接口、协议类型的判断（是请求，还是响应，或者是类似 Goaway 一类的控制帧，请求又可以细分为心跳请求、无响应的 oneway 请求等）、支持对协议帧的数据进行修改（Header/Body 的修改）、还有统一的状态码管理映射等。

>![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*2zJgT5bN4m4AAAAAAAAAAAAAARQnAQ)

在 MOSN 的协议处理分层机制下，以及有了以 XProtocol 和 XFrame 的抽象定义为核心的多协议扩展框架以后，我们在 stream 层就可以完全基于接口进行协议的处理，而不同的协议扩展实现者只需要专注于协议编解码本身，以及对编解码后的结果进行简单的接口适配，就可以完成在 MOSN 中的接入，由此获得 MOSN 中各种通用能力的支持，如限流扩展、路由引流等。对比 Envoy 中扩展协议实现部分可以看到是简化了不少的。当然 MOSN 这个多协议框架不能满足所有的协议情况，但是对于目前我们看到的大部分 RPC 协议，在配合上 proxy 层中七层 stream filter 扩展的基础上，都是可以很好的满足的。

### 实践案例

下面以 MOSN 在社区合作伙伴中 Dubbo 协议落地的案例来详细的了解 MOSN 的多协议扩展。这里很多代码也是 MOSN 社区的同学贡献的。
在这个案例中，除了要求协议需要支持 Dubbo 以外，还希望使用像限流等这些基础的扩展能力，同时需要蓝绿分组等路由的能力，选择的控制面是 Istio，用于动态配置的下发。那这些需求在 MOSN 中是如何实现的呢？

首先是协议解析部分，这里采用了基于开源的 dubbo-go 框架做协议实现，基于 dubbo-go 封装出了 MOSN 的 XProtocol 和 XFrame 模型；限流、xDS 等能力直接复用 MOSN 已有的实现，无需额外实现。但是这里有一个问题点就是 Istio 动态下发的路由配置是 HTTP 相关的，HTTP 的路由配置模型与 Dubbo 还是存在一定差异的，而修改 Istio 的成本会比较高，在这里就做了另外一层扩展。基于 MOSN 七层的 StreamFilters，在进行路由匹配之前对 Dubbo 协议进行定制化的处理，用来满足 HTTP 的路由格式。主要有两个点，一个是 HTTP 的 Host，使用 Dubbo 的 Service 对应到 Host，另外一个是 HTTP 的 Path，这部分就直接添加一个默认的 Path 进行通配；同时在这个扩展 Filter 中，还会获取机器的 Labels 添加到 Header 中，用于匹配路由的蓝绿分组功能。通过 MOSN Filter 扩展的配合，我们在实现了标准的 Dubbo 协议支持的基础上，满足了使用 HTTP 路由配置方式满足 Dubbo 路由的功能。

>![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*7SO9SoprsYcAAAAAAAAAAAAAARQnAQ)

### 插件化扩展

通过 MOSN 多协议框架的介绍，可以了解到当一个场景需要接入 MOSN 还不支持的自定义协议的时候，就需要进行扩展实现，然后和 MOSN 的框架代码一起进行编译，获得一个支持自定义协议的 MOSN。虽然已经尽量简化了协议扩展实现的复杂度，但是依然会存在一些问题，比如我们商业版的代码中，不同的合作伙伴，对应不同的场景，使用的都是不同的协议，那么随着业务的发展，协议这部分相关的代码就会越来越多，对应的开发维护代价也会变大。这都还好说，还有一些场景，客户协议一些细节出于某些需求可能并不想把相关的实现代码提交到 MOSN 的仓库中，而商业版代码不同于开源的，可能也不能直接将源代码交给客户，那这里编译就会遇到问题。为了解决这种矛盾，也为了更进一步让协议扩展变得简单，MOSN 还做了基于插件模式扩展协议的能力。

>![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*HhXER6Ra3VkAAAAAAAAAAAAAARQnAQ)

MOSN 插件扩展模式架构如图，MOSN 提供统一的插件扩展框架能力，MOSN 独立编译成二进制以后，利用插件机制动态加载不同的协议扩展插件，来获得对应的协议支持能力。这样协议扩展的实现也可以以插件的形式独立维护，甚至更进一步还可能支持非 Go 语言的扩展，比如基于 WASM 扩展能力对接其他语言实现的协议扩展。MOSN 的插件扩展能力有两种模式，一个是基于 Go Plugin 机制的扩展，一个是基于 WASM 的扩展。

>![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*Vy1FTYGE48UAAAAAAAAAAAAAARQnAQ)

首先来看一下 Go Plugin 的机制。这是 Go 语言提供的一种 SO 的加载能力，我们可以把 Go 编写的代码编译成 SO，然后可以被其他 Go 文件加载。但是这个机制有一些比较大的局限性，首先一点就是主程序与扩展插件编译的 Go 环境必须一致，包括 Go 的版本，GoPath 等环境变量；另外一点就是主程序与扩展插件依赖的库必须一致，这个是精确到 Hash 的，就是说不是两个库接口是兼容就可以，而是必须一模一样，这个限制就比较大了。因为我们预期是 MOSN 的代码和协议扩展的代码互相独立维护，协议扩展代码是需要依赖 MOSN 框架的，按照 Go Plugin 的机制每次 MOSN 框架的代码改动都会要求插件的代码也同步更新再重新编译插件，这个太麻烦了。

为此，我们将 MOSN 框架进行了拆解，拆分出一些相对稳定的接口和通用能力，作为 MOSN 主程序和协议扩展共同依赖的基础，如 XProtocol 和 XFrame 相关的 interface 定义单独定义到了 API 这个库中，然后在插件加载的时候，只需要将对应的一些接口注册到 MOSN 框架中就可以了。由于 API 定义和工具变动相对较少，协议扩展插件依赖从 MOSN 框架变成 MOSN 的 API 定义，最大程度的减少 MOSN 框架代码更新导致的插件代码必须更新的情况。而对于编译环境这个就好办了，我们提供了一个统一的、用于编译的 docker 环境，只需要让 MOSN 和插件都基于同样的 docker 编译就可以。通过 Go Plugin 实现的插件扩展和直接将代码合并然后编译的结果是一样的，只是让协议扩展的代码可以独立进行维护。

>![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*gLx2QoAGjYkAAAAAAAAAAAAAARQnAQ)

再来看一下 WASM 的扩展机制。简单介绍一下 WASM，它是一个开发、高效、安全，并且拥有社区统一标准的一种扩展能力，WASM 理论上是语言无关的一种能力，而且有一个被广泛认可的网络代理场景的 ABI 规范，因为 MOSN 也支持了 WASM 的扩展能力，它也能用于 MOSN 的协议扩展。

MOSN 的 WASM 扩展详细介绍可以参考[【WebAssembly 在 MOSN 中的实践 - 基础框架篇】](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487508&idx=1&sn=4b725ef4d19372f1711c2eb066611acf&chksm=faa0ffcecdd776d81c3d78dbfff588d12ef3ec3c5607036e3994fee3e215695279996c045dbc&scene=21&token=2058084434&lang=zh_CN#wechat_redirect)

基于 WASM 的协议扩展方式，与之前提到的协议扩展有所区别。WASM 插件需要实现的是 proxy-wasm 的 ABI 标准，而不用关心 MOSN 的多协议框架，也就是说这个 WASM 插件理论上是还可以被用于其他遵循 proxy-wasm ABI 规范的应用的。而在 MOSN 侧，则是实现了一个名为 WASM Protocol 的胶水层，这个胶水层实现了 MOSN 多协议框架的封装，然后通过 WASM ABI 与 WASM 插件进行交互。在 MOSN 多协议框架的视角下，看到的是一个由 WASM Protocol 封装的 XProtocol 实现，多协议框架也不理解 WASM ABI 交互的部分。和 GoPlugin 扩展不同，目前 MOSN 的 WASM 框架也还处于初级阶段，基于 WASM 的协议扩展也还只有 POC，而出于稳定性、性能等多方面因素的考虑，还没有正式应用在生产环境中，还需要更多的优化和测试。

>![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*4ohnR6i7fxIAAAAAAAAAAAAAARQnAQ)

### 展望

最后谈一下 MOSN 在协议支持上后续的一些展望和计划，主要就是包括更多类型的协议支持，如存在流式、双工形式的 gRPC 协议、消息类型的协议如卡夫卡、MQ 等，还有就是将 WASM 的协议扩展在生产环境落地可用。

### 本周推荐阅读

- [MOSN 子项目 Layotto：开启服务网格+应用运行时新篇章](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247488835&idx=1&sn=d645b9abc866048e679b56bfe3b72482&chksm=faa0fa99cdd7738ff1749ae75b1670f953c92b70dcf0358337977438fd74b632b21a7b17ece3&scene=21)

- [开发 Wasm 协议插件指南](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487618&idx=1&sn=c5018dc2ddf1671d3fa632358ed6be90&chksm=faa0ff58cdd7764e61940713ac7f16b149b917662e54ea7b2590a701e7ca2d7dea50a3babf1c&scene=21)

- [Protocol Extension Base On Wasm——协议扩展篇](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487546&idx=1&sn=72c3f1ede27ca4ace7988e11ca20d5f9&chksm=faa0ffe0cdd776f6d17323466b500acee50a371663f18da34d8e4cbe32304d7681cf58ff9b45&scene=21)

- [WebAssembly 在 MOSN 中的实践 - 基础框架篇](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487508&idx=1&sn=4b725ef4d19372f1711c2eb066611acf&chksm=faa0ffcecdd776d81c3d78dbfff588d12ef3ec3c5607036e3994fee3e215695279996c045dbc&scene=21&token=2058084434&lang=zh_CN#wechat_redirect)

更多文章请扫码关注“金融级分布式架构”公众号

>![](https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*s3UzR6VeQ6cAAAAAAAAAAAAAARQnAQ)
