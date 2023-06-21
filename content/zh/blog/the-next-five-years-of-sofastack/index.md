---
title: "SOFAStack 的下一个五年"
authorlink: "https://github.com/sofastack"
description: "下一个五年，让我们保持初心，一起把 SOFAStack 社区建设得更开放、更有趣！"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2023-06-20T15:00:00+08:00
cover: "https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*ZYb2R7aplbkAAAAAAAAAAAAADrGAAQ/original"
---  


![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f178aee24a3e442dae5c826a3830ad99~tplv-k3u1fbpfcp-zoom-1.image)  

文｜宋顺（*GitHub ID：nobodyiam*)

SOFAStack 社区开源负责人

蚂蚁集团高级技术专家  

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/92d375cf8f6c4f198582b67aa9505d1e~tplv-k3u1fbpfcp-zoom-1.image)

<p align=center> 本文 3861 字 阅读 11 分钟 </p>


# 01

## 回顾开源这五年 ##

回想起 2018 年 4 月 19 日 SOFAStack 首次开源，当时的官宣文章中就提到了我们开源的初心：

期望通过逐步向社区开源 SOFA 中各个组件，从而一方面帮助更多机构和合作伙伴完成金融分布式转型，帮助大家更加快速构建稳定的金融级云原生的架构，另一方面也是期望 SOFA 在蚂蚁体系之外的更大场景下去应用，来进一步锻造改进这套体系，使其更加完善和稳固。

所以这几年我们也是围绕着这个初心把 SOFAStack 体系的各个产品逐渐开源，包括首批开源的 SOFABoot、SOFARPC、SOFAArk，以及后来的 SOFARegistry、SOFAJRaft、Seata 等。同时我们也孵化了 MOSN 社区，开源了云原生网络代理 MOSN 以及应用运行时 Layotto。这些产品也是代表着 SOFAStack 在金融级云原生领域的沉淀和积累，目前已经在上百家企业中生根发芽。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/25a8792173a046d4a3d7663e1d19c0b0~tplv-k3u1fbpfcp-zoom-1.image)
图 1 - 产品开源时间线

我们再来看几个数字，在这 5 年中，我们举办了 18 场 Meetup，开展了 32 场直播分享，目前在 GitHub 组织层面有 438 名贡献者以及 3W 的 Star。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/67b4d9bcfcd14504aeecece96088d4ea~tplv-k3u1fbpfcp-zoom-1.image)
图 2 - 开源 5 年的几个数字

除了在项目上收获了不少贡献者和 Star 外，我们也逐渐地对开源有了更为深刻的认识。

以开源指标为例，我们的初心是为了帮助更多机构和合作伙伴完成金融分布式转型，我们一开始最为关注的指标是用户数；但因开源的特殊性，我们无法直接获取实际的用户数，所以采用了 GitHub 的 Star 作为衡量指标。

我相信这也是很多开源项目常见的第一反应，后期大家其实也发现了一些问题。举例来说，有些开源项目为了完成指标，采取了点 Star 送礼物等行为。这些虽然没有在我们的项目上发生，我们仍觉得有违开源初心，就放弃了 Star 数作为核心的指标。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3ffe506cf61a47df88fe120ecff9c1d2~tplv-k3u1fbpfcp-zoom-1.image)
图 3 - Star 数作为衡量指标

另一个开源项目常用的衡量指标是贡献者数量，很多开源项目是没有商业公司支撑的。为了项目的长期发展，需要持续的吸引新的贡献者加入，从而为社区带来活力。

我们在放弃 Star 数指标后，把重心放在了贡献者数量上，会为新贡献者提供一些简单的任务，使他们能更快的融入社区，成为潜在的长期贡献者。

不过和 Star 指标类似，在过程中我们也发现其它社区中出现了一些不好的现象。比如故意留一些明显的 bug，或者提供一些修改错别字的任务来刷贡献者数量，我们认为这些也是有违开源初心的。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3a96b63ed0784052803c0801378b6306~tplv-k3u1fbpfcp-zoom-1.image)
图 4 - Contributor 数作为衡量指标

那么，我们该如何对待开源呢？

我脑海中想起了 Envoy 作者 Matt Klein 在 Envoy 开源五周年时说的一句话：成功的开源软件就像创办一个企业。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3bbaf1cbff2d4e0ead017c2931d097c3~tplv-k3u1fbpfcp-zoom-1.image)
图 5 - 成功的开源软件就像创办一个企业

其实开源项目和创业很类似，首先你需要有一个好的点子，然后去吸引人才一起加入来提升产品能力，再通过一些营销手段对项目做推广来获取客户，而后持续迭代改进。

对企业而言，员工和客户固然很重要，不过我认为最核心的还是产品，只有一个定位准确、解决实际问题的产品才能受到市场欢迎，从而获取资金维持公司的运营。

在开源项目上，用户对应着企业的客户，是提供场景的驱动力来源；贡献者对应着企业的员工，属于资源投入，是推动力来源；而产品才是真正能解决用户问题的，是整个开源飞轮中最为核心的部分。所以 Star 数和贡献者数量都只是过程指标，核心还是要提升产品力，不能本末倒置。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/15f210abdfe8431493602df2c6a696f3~tplv-k3u1fbpfcp-zoom-1.image)
图 6 - 开源飞轮


# 02

## 展望下一个五年 ##

聊完了过去五年的过程和收获，对 SOFAStack 而言，下一个五年的主要方向就比较明确：我们还是会着重放在产品力的提升上，希望能持续解决分布式场景中的核心问题。

那核心问题究竟是哪些呢？我想起了泛在计算的提出者 Mark Weiser 曾经说过的一句话：最卓越的技术是那些“消失不见的”技术。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/53a059e3d3594f2dbe7506901d734403~tplv-k3u1fbpfcp-zoom-1.image)
图 7 - 消失不见的技术

对这个判断，我也是深以为然。在日常生活中，这类案例也是比比皆是：比如电，我们现在都是即插即用，以至于已经不感知电力背后的复杂基础设施，类似的还有水、煤气等。它们背后都有着复杂的基础设施在支撑，经过了数十年的技术发展之后，已经非常稳定可靠，交互也非常简单，所以这些技术就像是“消失不见”一样。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/89bd1b5036c143cbbc244f856050a29c~tplv-k3u1fbpfcp-zoom-1.image)
图 8 - 水电煤随开随用

然而在我们实际的研发场景中，业务研发对基础设施的感知还远没有达到无感的地步。

比如在研发态，我们除了要关注业务逻辑之外，还会经常被中间件 SDK 升级所打扰，在使用云产品时还得感知多云的差异。

在运维态，除了要关注发布时的业务表现，还要时刻去关注资源状况。在其容量不足的时候要申请资源做扩容，在业务低峰的时候要缩容服务来节约成本。

可以说，技术基础设施的存在感越强，研发运维的效率就越低，无法把精力集中在业务的创新上。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b463cae8b12146f6bfa67e555deba0d6~tplv-k3u1fbpfcp-zoom-1.image)
图 9 - 实际研发场景

那么，我们该如何才能让技术基础设施也消失不见呢？

我们知道对微服务而言，可以通过服务网格来解耦业务逻辑和 RPC 通用能力，从而实现独立演进、透明升级。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/da083ed4d12f4b30a9235aef0d1c6d55~tplv-k3u1fbpfcp-zoom-1.image)
图 10 - Service Mesh 演进架构

项目地址：[https://github.com/mosn/mosn](https://github.com/mosn/mosn) 

在实际场景中，除了微服务之外，业务往往还会使用其它的中间件能力。例如动态配置、消息、缓存、数据库等，如何降低这些中间件和业务应用的耦合是一个新的问题。另外，在多语言场景，我们仍然要为每种语言开发一套轻量 SDK 来实现通信协议和编解码逻辑，这部分也有很高的成本。所以我们如何进一步去降低多语言的支持成本是另一个亟待解决的问题。

为此，我们也是借鉴了 Dapr 的应用运行时思路，基于 MOSN 设计开发了 Layotto，在下层对接了各种基础服务；在上层为应用提供了统一的、具备各种分布式能力的 API。

开发者不需要再关心底层各种组件的实现差异，只需要关注应用本身需要哪些能力。比如调用 RPC、发送消息，然后通过 gRPC 调用对应的 API 即可。这样就可以彻底和底层基础服务解绑，同时也是极大地降低了多语言的支持成本。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d23c4585bdbc484a9f696b9ab6ca6f66~tplv-k3u1fbpfcp-zoom-1.image)
图 11 - Layotto 架构

项目地址：[https://github.com/mosn/layotto](https://github.com/mosn/layotto)

通过服务网格和应用运行时，我们解决了研发态对中间件 SDK 升级、多云差异感知等负担，我们再来看下如何通过 Serverless 技术来降低运维态的负担。

我们知道业务研发一般是从需求到设计、开发、测试，最后发布生产的一个循环过程，其中不少业务还会出现多个迭代并行开发的场景。然而发布生产要求是串行的，就会导致迭代堵车的现象，后一个迭代必须得等前一个迭代发完才能开始发布，整体效率比较低。

除此之外，随着业务重要性的提升，发布流程也会变重，发布周期短则几个小时，长则几天甚至几周也屡见不鲜。同时，业务逻辑的增加也会导致应用启动变慢，启动一个系统往往需要几十分钟，导致应用扩容等操作响应迟缓。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f40769c9bae643ecb7c99ec5a16dbc5c~tplv-k3u1fbpfcp-zoom-1.image)
图 12 - 研发迭代形式

我们经过分析，发现不少应用代码本质上是可以分成两层的。一层是公共逻辑和核心模型，这部分是比较稳定的，很少有变化。另一层是基于公共部分之上的逻辑，我们把它抽象为模块，模块和业务逻辑紧密相关，变化也较为频繁。

因此我们首先考虑把代码拆分成基座和模块，在基座代码库中沉淀通用逻辑，为模块提供计算支撑，同时为每个模块也创建独立的代码仓库。

在运行时通过 SOFAArk 技术实现基座和模块在同一个进程中展开，同时开发了热部署的能力从而模块可以独立于基座运维。

这样，我们就区分了基座开发者和模块开发者。基座开发者和传统的应用开发没什么区别，而模块开发者由于不再需要关注容量、资源，同时可以独立于基座运维，实现了 Serverless，具备了快速迭代和快速伸缩能力。

这个方案也存在一些不足：比如因为依赖 SOFAArk，所以主要针对 Java 场景，另外由于多个模块是在同一进程中运行，因此隔离性较差，会互相影响。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b415a909a54d4a20af9ce74185d0920c~tplv-k3u1fbpfcp-zoom-1.image)
图 13 - SOFAArk 热部署

项目地址：[https://github.com/sofastack/sofa-ark](https://github.com/sofastack/sofa-ark)

由于 Serverless 方案存在上述提到的技术栈、隔离性等问题，在覆盖面上还是有一些盲区。结合业界的实践，我们决定继续向 FaaS 迈进。

图 14 直观地展示了应用研发粒度的演变过程：最早从单体应用到微服务，是把粒度降低到服务级别，从而解开了业务团队之间的耦合。

我们现在是继续把粒度降低到函数级别，以此来实现快写快发、免运维，从而进一步提升研发和运维效率。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/63b3be0eff5d4a269d8346e241548295~tplv-k3u1fbpfcp-zoom-1.image)
图 14 - 应用粒度演变

图片来源：[https://www.cloudflare.com/zh-cn/learning/serverless/glossary/function-as-a-service-faas/](https://www.cloudflare.com/zh-cn/learning/serverless/glossary/function-as-a-service-faas/)

考虑到函数粒度是非常小的，FaaS 的应用范围是相对有限的。我们认为下面这些场景是比较适合 FaaS 研发模式的：

-   碎片化需求场景：例如 BFF，大多是胶水代码，逻辑简单，不过需求变化快，通过函数实现组装式开发，从而助力业务创新
-   事件驱动场景：例如音视频转码，大多是 CPU 密集型，对处理时间不是特别敏感，而且有着比较明显的波峰和波谷
-   中台业务场景：例如算法平台，它的的算子逻辑比较独立，但是参与研发人数多，所以代码逻辑不可控，需要更好的隔离能力

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b2ff86b186f948e09f1da4a362a160d0~tplv-k3u1fbpfcp-zoom-1.image)
图 15 - FaaS 适用场景

目前我们也在公司内部探索 FaaS ，整体产品架构如图 16 所示，未来我们也会逐步地去开源相应的组件。

-   触发源支持 RPC、HTTP、Message、Cron 等
-   冷启动采用了 Cache pool、 Fork 等技术实现加速，对简单的 Node.js 和 Java 函数可以实现几百毫秒冷启动
-   提供了 Layotto 作为 Sidecar 帮助函数轻松访问各类 BaaS 服务，同时具备完善的治理能力

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2905feb8fe1f492eb163d6b63b0623be~tplv-k3u1fbpfcp-zoom-1.image)
图 16 - SOFA Function 产品架构


# 03

## 致谢 ##

最后，值此 SOFAStack 开源五周年，还是要对大家表示感谢。

首先，我要感谢所有 SOFAStack 项目的贡献者们，无论是提交代码、撰写文档、解答问题，还是组织活动、传播理念，正是因为有了你们的不懈努力和无私奉献，才让 SOFAStack 能够不断完善和进步，使更多用户受益。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9c7f1b9abecb46a7b163478e74dab8af~tplv-k3u1fbpfcp-zoom-1.image)
图 17 - SOFAStack 的贡献者

其次，我要感谢所有选择使用 SOFAStack 产品的合作伙伴和用户们，无论是金融机构、互联网企业还是个人开发者，正是因为有了你们的信任和支持，才让 SOFAStack 能够在各种复杂的场景中得到验证和应用，持续提升产品能力。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/be264f7cb7614272b264955ec74aae8f~tplv-k3u1fbpfcp-zoom-1.image)
图 18 - SOFAStack 的用户

最后，我还要感谢所有关注和关心 SOFAStack 社区的朋友们，正是因为有了你们的鼓励和期待，才让 SOFAStack 社区持续保持活力。

那让我们保持初心，一起把 SOFAStack 社区建设得更开放、更有趣！ 

观看现场 live 的请点击 👇🏻 

[SOFAStack 的下一个五年](https://mp.weixin.qq.com/s/5aVtoQzJoyblBcbEDg0vXA) 


## 了解更多... ##

### Layotto Star  一下 ###

[https://github.com/mosn/layotto](https://github.com/mosn/layotto)


### 本周推荐阅读 ###

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/65cbbd221f5f4404844f671d42713072~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247520348&idx=1&sn=459c9262761bd719a028c8ea27f56591&chksm=faa37f86cdd4f690cefbcb8564ab79b327512e409ada02870561ece96c6fc07c050fdc3b7f66&scene=21)

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7a33334d038e4290a881c330f3473faf~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247523846&idx=1&sn=001825b6396d817bb9c8c9fd8da388ec&chksm=faa371dccdd4f8ca4026523e5f6c109fb2368b0250f77ed9accb0d67e2e9085351840af177b5&scene=21)

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1a4e9dd7a5c14224a111bc26636b14e7~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247536378&idx=1&sn=1704a4160d8ca2d4e5b898efe2a41b6a&chksm=faa3a120cdd4283667f9d312dc5af6e04021516f8fe7d9dce39ec5992b33ceda0e917d53b614&scene=21)

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6792714649a94abfb9d68f9fe9cbfd92~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247533275&idx=1&sn=6a45e4566c60999dd1571af4798518a8&chksm=faa3ad01cdd42417afdb452430c7d3465774d64f815bf98b592150c3f1b7a6b9e27b5b1633c3&scene=21)

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/62bdd4b300ff47a4b3c1fe6854a02299~tplv-k3u1fbpfcp-zoom-1.image)
