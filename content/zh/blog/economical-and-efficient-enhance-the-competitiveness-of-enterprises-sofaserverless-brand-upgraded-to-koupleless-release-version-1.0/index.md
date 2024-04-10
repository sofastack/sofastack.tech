---
title: "成倍降本增效，提升企业竞争力！SOFAServerless 品牌升级为 Koupleless，重磅发布 1.0 版本"
authorlink: "https://github.com/sofastack"
description: "成倍降本增效，提升企业竞争力！SOFAServerless 品牌升级为 Koupleless，重磅发布 1.0 版本"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2024-02-06T15:00:00+08:00
cover: "https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*Qq3VRZ9oRgEAAAAAAAAAAAAADrGAAQ/original"
---

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c99aeb03ebbe450685b3827108cda237~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=638&h=90&s=206394&e=gif&f=120&b=ffffff)

-   如果你是企业经营者，在为企业降本增效而发愁；
-   如果你是企业的开发、运维或架构同学，在日常工作中被开发效率、交付问题等困扰……

欢迎来了解 Koupleless *（原 SOFAServerless）*！

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/79c9cc98a9ef4518b4baeef649d0fd07~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1080&h=192&s=49473&e=png&a=1&b=2157ee)

现在，Koupleless 重磅发布了[1.0 版本](https://github.com/koupleless/koupleless/releases/tag/v1.0.0)！（👈点击查看 release note） 

那么，Koupleless 是什么？又将如何为你解决以上问题？除了以上这几种情境，Koupleless 还有哪些能力呢？欢迎你来社区探索发现。

## Koupleless 是什么？

Koupleless 由 SOFAServerless 品牌升级而来，是一款模块化研发框架与运维调度平台。它从应用架构角度出发，帮助应用解决从需求、到研发、到交付再到运维的全生命周期痛点问题。其最核心的架构图如下👇。如果想了解更详细的原理介绍也可以查看官网页面：[https://koupleless.gitee.io/docs/introduction/architecture/arch-principle/](https://koupleless.gitee.io/docs/introduction/architecture/arch-principle/)。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e156f716d6424e9a9a6a54a78e6ab424~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1080&h=267&s=72658&e=png&a=1&b=fa9681)

它能帮助解决的问题包括：

- 应用拆分过度，机器成本和长期维护成本高；
- 应用拆分不够，多人协作互相阻塞；
- 应用构建、启动与部署耗时久，应用迭代效率不高；
- SDK 版本碎片化严重，升级成本高周期长；
- 平台、中台搭建成本高，业务资产沉淀与架构约束困难；
- 微服务链路过长，调用性能不高；
- 微服务拆分、演进成本高；

如果你也被以上问题所困扰，那么欢迎来了解 Koupleless 给出的解决方案。 本模式在蚂蚁集团内部历经 4-5 年时间孵化而成，当前已经帮助 70W 核业务量完成 10 倍级降本增效，可以帮助应用做到秒级启动，只占 20M 内存。 

性能对比示例如下图👇。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/68fd61fab1264194a6781eb8e997994f~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1080&h=199&s=69013&e=png&b=fefefe)

根据我们的模块化应用架构模型，可以看到我们是将传统应用从纵向和横向切分演变而来的。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/dbb50bdeca184abd99b3dbe3fed1e4a3~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1080&h=270&s=47845&e=png&a=1&b=f99981)

所以我们将 SOFAServerless 进行品牌升级成为 Koupleless，取自 Couple + less，寓意通过对应用进行拆分解耦，实现更好的职责分工，帮助业务降本增效。

## 我们为什么开源？

关注应用架构领域的同学，应该知道微服务很好地解决了组织分布式协作难题，但同时也带来了一些问题，并且这些问题正日益获得更多关注。 有人说，[2023 年是微服务的转折年](https://thenewstack.io/year-in-review-was-2023-a-turning-point-for-microservices/)[1]，其中一些科技巨头*（如 Amazon 和 Google ）*已经开始尝试去解决和完善微服务带来的问题，例如 [service weaver](https://serviceweaver.dev/)[2]，[amazon prime video](https://www.infoq.cn/article/nu2y3xiazg1cqianoxxa)[3]的架构改造，甚至直接回归单体。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/71a3103cb9f04d2e9b686705c5fa1cb6~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=299&h=219&s=112905&e=png&b=d6eddd)

而蚂蚁内部在 4-5 年前就开始着手解决微服务问题，并为此打造了 Koupleless 应用研发模式。 根据蚂蚁这些年的实践经验，我们相信模块化架构是一种有潜力的架构，真正能够较好地解决微服务问题；我们也希望通过模块化架构给行业内部提供一种新的解决方案，帮助更多企业降本增效。

## 开源提供了哪些能力？

自 2023 年下半年开源以来，经过这半年时间和社区的共同努力，我们已经开放了内部完整的能力，包括研发工具、框架、运维调度平台等；也沉淀了一些常用组件最佳实践和 samples 用例（具体查看 release note：[https://github.com/koupleless/koupleless/releases/tag/v1.0.0](https://github.com/koupleless/koupleless/releases/tag/v1.0.0)）。 具备了线上接入使用的能力，一些企业也已经可以按照官网和文档自主接入使用了。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0897b44fd2ec4522ad2784184dfacbad~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1080&h=381&s=77370&e=png&a=1&b=e5d8d8)

- 研发工具 Arkctl 一键构建、部署和发布模块，方便用于本地开发测试验证。
- Arklet、SOFAArk 和 Runtime 组件为多种研发框架如 Spring Boot、SOFABoot、Dubbo 提供多模块运行容器环境，适配 30+ 组件，沉淀 25+ samples 用例。
- 控制面组件 ModuleControllerModuleDeployment，提供模块发布与运维能力； ModuleScheduler，提供模块基础调度能力； ModuleScaler，提供模块扩缩容能力。

有了这些组件之后，从**开发验证 -> 交付上线 -> 日常运维**全流程的基本能力已经具备，1.0 版本实现生产可用级别。

## 挑战与亮点

这套模式最大的挑战来自于将多个应用或代码片段合并在一起，在隔离与共享上如何找到最佳的平衡点，使得在存量应用低成本接入的同时，能享受到隔离的带来稳定可靠的好处，也能享受到共享的高性能、低资源消耗的收益。 

隔离可以确保运行时的稳定可靠，但带来了性能的下降、资源利用率的损失；共享提升了性能和资源利用率，但也带来了运行时的一些问题，例如 static 变量可能带来互相影响的问题。我们采用了模块化技术来解决这类问题。在 Java 领域模块化技术并不是我们首创的，20 年前就有了 OSGl 技术，那为什么我们的模块化技术能在蚂蚁内部规模化落地呢？我们是做了哪些工作来解决存量应用低成本接入和共享后的一些问题的呢？ 

要解决这类问题，我们并没有太多可参考的行业案例，相当于是在无人区里摸索，除了解决隔离与共享的核心问题外，还要解决配套设施的建设、用户心智的培养等，这些都需要一个笃定的心力和持续的过程，这些问题就是这套模式的挑战所在。 好在最终，我们拨云见日探索了出来。我们在隔离和共享之间找到了一个最佳的平衡点，并且能让存量业务低成本的接入，这也是我们最自豪的地方。我们在蚂蚁集团用事实证明了模块化技术并不是停留在设计稿里的技术，或者小部分人才能使用的技术，它的问题和挑战并不可怕，是有固定模式的，可以通过工具和流程逐步治理、收敛的，现在将此模式进行开源分享，是希望可以帮助其他企业少走弯路，和社区一起把这套模式心智在行业里树立起来。

## Koupleless 已接入 15+ 企业

当前在统计内的，有 15+ 企业在使用 Koupleless 接入线上或者用于交付，还有 17+ 企业正在试用或者接入中，还有一些因为信息缺失未统计到的。详细企业接入列表可以查看[官网信息](https://koupleless.gitee.io/user-cases/all-users/)[4]。 很高兴 Koupleless 能帮助到他们，也十分欢迎这些企业探索的更多使用场景，也欢迎更多企业开发者一起参与社区建设，推广这套技术。

## Koupleless 未来的规划

我们希望能让模块化架构成为应用架构领域里的新模式，并能在行业里推广开来。这不仅是我们作为技术人的技术追求，也是我们做开源的持续动力来源。 当前我们虽然发布了 1.0 版本，但开源工作才只是刚刚开始，还有更多规划。比如，我们希望未来能把模块化技术做得更加完善，将我们想要做到的效果完整地提供出来：

Speed as you need, Pay as you need， Deploy as you need， Evolve as you need 。 需要的能力包括支持各种框架、运行时组件、中间件服务，还有非常多相关的配套设施；也希望这套模式能在更多语言里发挥出效果，例如 Go 语言，以此和更多的小伙伴们一起探索出微服务领域的下一站。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2d536eb32fdc48fc89539add7876ca44~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1080&h=714&s=162378&e=png&a=1&b=a5d3fb)

这里感谢所有参与贡献 Koupleless 1.0 的 51 位开发者： @QilingZhang @lvjing2 @glmapper @yuanyuancin @lylingzhen @yuanyuan2021 @straybirdzls @caojie09 @gaosaroma @khotyn @FlyAbner @zjulbj @hustchaya @sususama @alaneuler @compasty @wuqian0808 @nobodyiam @ujjboy @JoeKerouac @Duan-0916 @poocood @qixiaobo @lbj1104026847 @zhushikun @xingcici @Lunarscave @HzjNeverStop @AiWu4Damon @vchangpengfei @HuangDayu @shenchao45 @DalianRollingKing @lanicc @azhsmesos @KangZhiDong @suntao4019 @huangyunbin @jiangyunpeng @michalyao @rootsongjc @liu-657667 @CodeNoobKing @Charlie17Li @TomorJM @gongjiu @gold300jin @nmcmd @qq290584697 @ToviHe @yuhaiqun19892019

## 推荐阅读

[SOFAServerless 品牌升级为 Koupleless，重磅发布 1.0 版本](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==\&mid=2247548953\&idx=1\&sn=41accf0f98fe31e0985087f36826acaa\&chksm=faa3efc3cdd466d53fabc76e827a73ff2ead3411d4039d16460461d4e80158ae76557d7b91f0\&scene=21)

[线上应用 10 秒启动、只占 20M 内存！](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==\&mid=2247547389\&idx=1\&sn=48f6caf11829e9ada93791c9e20b0e6e\&chksm=faa3d627cdd45f31960ce0983c71894d62cfe0520a9f6b845a4aa6c512213c91e1bc82ec8503\&scene=21)

[大象转身：支付宝资金技术 Serverless 提效总结](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==\&mid=2247541695\&idx=1\&sn=70ea82d3e7fc9c2de5df9dc70ebcbc46\&chksm=faa3cc65cdd44573a00b4f092f42a5cdcc5519a466fcdf2638e8912594b4b6438bb8932faa83\&scene=21)

[Lunettes - 让 Kubernetes 服务运营更简单](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==\&mid=2247545565\&idx=1\&sn=bc25382475741cbd512bfcc78f7e89b2\&chksm=faa3dd07cdd454116d2646cc6034d01aa11757fea7efaf3fb32b0033e8f2d11e4ee4d3cf0896\&scene=21)
