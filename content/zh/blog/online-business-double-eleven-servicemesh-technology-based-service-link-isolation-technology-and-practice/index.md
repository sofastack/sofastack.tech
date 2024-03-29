---
title: "网商双十一-基于 ServiceMesh 技术的业务链路隔离技术及实践"
author: "张化仁"
authorlink: "https://github.com/sofastack"
description: "网商双十一-基于 ServiceMesh 技术的业务链路隔离技术及实践"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2021-12-14T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*l9Q_TKUa-6UAAAAAAAAAAAAAARQnAQ"
---

文｜张化仁（花名：花伦 )

网商银行基础技术架构部架构师

校对｜阚广稳(花名：空门)

本文 4832 字 阅读 10 分钟

## ｜引言｜

微服务架构下，服务之间的调用错综复杂，一个应用可能会承载着多种不同的业务流量。由于运行在同一个应用进程内，多种业务流量之间势必会存在相互影响的情况。

如果某种业务流量陡增，导致应用进程负载激增，进而请求排队，其它业务流量也势必会受影响。多数时候这种相互影响的情况都是在容忍范围以内或者可以规避的，特定场景下我们可能就需要考虑通过隔离某些业务流量的方式，来消除业务之间相互影响的风险：

- 例如，当后台调度型的流量影响了在线用户请求；

- 再如，当低敏的甚至可失败的业务影响了高敏的需要重保的业务。

业务链路隔离的诉求是业内普遍存在的。通常的方案是新创建一个应用，然后将需要隔离的业务迁移到这个新应用上。

新建应用的方式，研发运维等都需要付出成倍的成本，相关应用还需要配合改造和迁移。对于只有单个应用需要创建的情况或许还能勉强接受，网商银行部分应用例如高保极简网关、高保客户视图等当前就是采用的这种方案。这种方式是非常笨重的，而且当我们期望特定业务关联的整条链路上的多个应用都进行业务隔离的话，这种方案的成本将非线性上升进而变得难以接受。

云原生架构下，对容器和流量可以进行更精细化的管控，对于上述业务流量隔离的场景，我们有了更简洁、更灵活、更通用的替代方案--我们称之为「业务单元隔离」，可以在不创建新应用的情况下实现上述诉求。此方案当前已在包括核心链路在内的网商多个业务场景得到应用，也顺利通过了今年双十一大促的考验。

那么「业务单元隔离」具体是什么？我们是如何借助「业务单元隔离」实现业务链路的隔离呢？本文将和大家细述。

## PART. 1 概念及基本原理

### 概念及运维模型 

「业务单元隔离」是一套流量染色和资源隔离的方案，可以帮助业务相对简单地实现业务链路隔离。在调研和验证的过程我们也提出了优化改进方案并推进落地，最终进一步减轻了业务接入的成本。

「业务单元隔离」需要结合两个新的概念来阐述：「AIG」和「业务单元」。

AIG 是某个应用为了支撑某些业务而隔离出来的一组资源。由一个或多个应用的 AIG 组成的、服务与某个或某类特定业务的业务链路我们称为一个业务单元。保证有且只有符合特征的流量引流到某个业务单元，我们称之为「业务单元的隔离部署」。

![AIG 运维模型简单示意](https://gw.alipayobjects.com/zos/bmw-prod/b99ff80c-2dad-4a32-b35e-bff4f1145a28.webp)

### 主要任务及配套设施 

从「业务单元隔离」的概念中我们不难看出：要实现某个业务链路的流量隔离，至少需要做有以下几件事情：

1.业务单元构建：给链路上的应用分别创建 AIG 组成一个业务单元，且须保证不能有流量流入新建的业务单元。

2.业务流量识别：需要通过某种方式识别出上游应用流入的特定业务的流量。

3.特定业务引流：对于识别到的特定业务的流量，需要有机制让这些流量流向新创建的业务单元。

很显然，上述的这些事情，必然需要基础设施侧和应用侧相互配合才可实现。如下图所示，相关的基础设施及作用如下：

1.业务单元构建：需要为 AIG 提供完整的研发/运维/监控支持；

2.流量识别（RPC）：链路中业务单元上游的应用（A）需要接入打标染色 SDK，以便通过染色管控平台下发打标染色规则；

3.流量识别（调度）：复杂调度（消息触发，应用单 LDC 内自主分发批任务）通过转换成基于 SOFARPC 的流式任务，从而实现染色和隔离。

4.特定业务引流：MOSN 侧的精细化路由需要支持 AIG，让流量可以流入到新特定的业务单元。

![业务单元隔离方案总览及周边配套设施](https://gw.alipayobjects.com/zos/bmw-prod/282e523b-6876-4acb-95f0-47ab98ae730e.webp)

### 业务单元构建 

业务单元实际是一个相对抽象的概念，对应一条业务链路。

网商的实践中，为了让业务单元更加具象化，我们规定一个业务单元内的多个应用，其 AIG 名称（appname-aigcode）中的 aigcode 部分必须尽可能一致。

因此，构建一个特定的业务单元，本质上是要给链路上相关的应用，都创建出服务于特定业务隔离的资源组（AIG）。

对于单个应用，构建 AIG 包含两部分：

一是初始化 AIG 元数据；

其次是围绕此 AIG 的各种运维操作（扩缩容、上下线、重启、sidecar 注入升级等）。

可以看到要支持 AIG，PaaS 侧几乎所有运维操作都需要适配，工作量非常很大。所以 PaaS 侧在支持 AIG 这件事情上也必须权衡取舍，决定只在终态的 workload 运维模式下支持了 AIG，这也导致 AIG 强依赖应用从现有的 image 的模式迁移到 workload 的模式。

workload 运维模式下，PaaS 将发布和运维的内容都编排成 CRD 资源，交给底层 sigma（K8s）做运维。切换到 workload 运维模式有利于集团统一发布运维体系，也可以更好的支持弹性扩缩容、自愈等场景。

但相比 image 模式，workload 模式对用户使用习惯和体验上冲击很大，初期相关的问题也非常多。因此尽管网商 workload 一直在有序推进，在后续核心业务接入 AIG 的项目中，为了避免强制切换到 workload 运维模式影响核心业务运维应急，我们也给 PaaS 提了支持仅对 AIG 机器开启了 workload 的诉求，并且针对这种情况做了完备的混合运维验证。

### RPC 流量隔离 

业务单元创建好之后，如何确保新的业务单元在不引流的情况下默认没有 RPC 流量流入呢？

应用的机器之所以有 RPC 流量流入，是因为注册中心（SOFARegistry）和跨机房负载均衡（AntVip）中挂载了机器 IP：应用进程启动成功 MOSN 感知到后，MOSN 会将服务信息注册到 SOFARegistry，发布运维过程机器健康检查通过后 PaaS 侧会调用接口往 AntVip 上挂载机器的 IP。

所以，要确保新的 AIG 机器默认没有流量流入，就需要 MOSN 和 PaaS 侧做出调整。

整体调整方案如下图所示：

![默认情况下没有 RPC 流量流入 AIG 原理](https://gw.alipayobjects.com/zos/bmw-prod/ddff0b03-43b2-4169-8872-327d57c7fa04.webp)

如何识别特定业务的 RPC 流量呢？

上游应用接入打标染色 SDK 之后，其在作为服务端被其它应用调用、作为客户端调用其它应用的时候，都可以被 SDK 中的 RPC 拦截器拦截，拦截器对比 RPC 请求和下发的打标染色规则，一旦 match 就会在 RPC Header 中增加业务请求标识。

![基于打标染色 SDK 的流量识别示意](https://gw.alipayobjects.com/zos/bmw-prod/6749e306-f563-4936-9e35-6025c67dd501.webp)

最后，就是将流量引流到特定业务单元。

借助 MOSN 强大的精细化路由能力，我们可以让流量路由到指定的业务单元,并在业务单元内部收敛。业务单元隔离主要用到了 MOSN 的客户端路由能力，在客户端应用发起调用、请求流经当前 Pod 的 MOSN 时，可以按我们下发的路由规则控制流量的走向。

![引流到特定业务单元 & 业务单元内流量收敛](https://gw.alipayobjects.com/zos/bmw-prod/a84f2f4f-e8c0-4737-a417-7d24393afbd0.webp)

### 调度流量隔离 

调度本质是消息，简单的调度场景通常也不会有隔离的诉求。很多有隔离诉求的场景当前都是“消息任务+三层分发”的模式，利用调度触发批处理逻辑。

三层分发协议是基于 tb-remoting 协议分发请求的，不是标准的 SOFARPC 协议，不经过 MOSN，因此 MOSN 也无法控制这种请求的走向。

为了解决这个问题，AntScheduler 推出了全新的流式调度模式，通过将三层分发模式转变成多次标准 SOFARPC 调用，从而和 MOSN 无缝配合，满足流量隔离的诉求。

对于希望调度流量直接路由到 AIG 的场景，AntScheduler 界面上可以直接配置，配置后平台会下发服务级别的 MOSN 客户端路由规则。

对于整条链路隔离的场景，调度平台对接了打标染色平台，发起的 RPC 流量会自动打标，下游应用可以选择基于此标定做进一步的染色和引流。

![“消息任务+三层分发” vs“流式任务”](https://gw.alipayobjects.com/zos/bmw-prod/d15239db-76c1-41a4-9102-43e9e96ebe1a.webp)

## PART. 2 异步补账链路隔离 

「业务单元隔离」基础设施落地后，先后有几个业务场景逐步接入。异步补账链路隔离是「业务单元隔离」首次应用在核心链路，实现了实时交易流量和异步补账流量的隔离，避免相互之间的影响。今年双十一大促异步补账业务单元承载了 10% 的异步补账流量，表现丝滑。

接下来我将以这个项目为载体，详述我们如何借助「业务单元隔离」实现业务链路的隔离。

### 项目背景 

项目相关的应用处于网商核心链路上，本就属于重保对象，而后续预期业务将急速发展，因此链路的高可用保障面临巨大挑战。

当前链路主要有两种流量，一种是实时类交易的流量，另一种是上游异步发起的补账流量。

对于补账类的流量，由于已经落库，对失败是容忍的。而实时交易的流量，是必须重保的对象。

后续业务发展异步补账流量将急剧增加，实时交易类的流量面临受影响的风险，因此业务侧期望能有一种方式，让异步补账流量和实时交易类的流量实现资源隔离，保障实时类交易的高可用性。

![图片](https://gw.alipayobjects.com/zos/bmw-prod/26c23c62-e97d-4498-a913-92cb835cb01b.webp)

### 总体方案 

由于链路涉及到多个核心应用，如果采用传统的新建应用的方案，初期改造及后续维护的成本都极高，故而业务希望采用「业务单元隔离」的方案。经过和业务方深入沟通，确认要新创建异步补账业务单元，并承载下述流量：

1.来自上游应用 U 的异步补账流量（RPC）；

2.来自上游应用 U 的补账调度的后续流量（调度->RPC）；

![图片](https://gw.alipayobjects.com/zos/bmw-prod/437474ee-a0e6-463c-9101-6c0789c2c6f1.webp)

### 异步补账 RPC 隔离 

上述异步补账单元上游应用 U 需要进行少许改造，接入流量打标染色 SDK，以便我们可以识别到异步补账的流量。

应用 U 接入 SDK 后，作为服务端被其它应用调用或者作为客户端调用其它应用的时候，都会被 SDK 中的 RPC 拦截器拦截，可以进行打标和染色处理。已染色的流量的 RPC 请求或响应 Header 中会带上流量标识，MOSN 路由时识别此标识即可实现将流量引到异步补账业务单元。

下图是异步补账的 RPC 流量的打标染色和引流逻辑示意：

![图片](https://gw.alipayobjects.com/zos/bmw-prod/805c9a22-eee1-4a56-9403-a298a4853ee7.svg)

### 异步补账调度隔离 

调度流量的识别需要应用从“消息任务+三层分发”模式切换到流式任务模式，转变成多次 SOFARPC 调用，进而可以借助 MOSN 精细化路由到指定的 AIG。

本项目中，补账调度 RPC 请求已经打好标识，因此仅需在上游应用 U 侧进行染色和 MOSN 引流规则的下发即可。

整个逻辑示意如下图：

![图片](https://gw.alipayobjects.com/zos/bmw-prod/86758e08-3d7e-4ec6-87ad-1c31f65772d7.svg)

### 压测及灰度机制 

打标染色 SDK 在对流量进行打标染色时是可以识别压测流量的，但本项目中我们没有使用这种方式，而是在 MOSN 路由规则中增加了限定条件。

一方面是由于 SDK 尚不支持网商压测流量识别；

另一方面 MOSN 规则下发流程上更加简单。

MOSN 路由规则支持配置多个规则，每个规则由生效范围 scope、限定条件 condition、路由目标 destination 组成，支持任何比例的灰度，也支持限定压测流量，可确保整个引流过程的安全。下图上游应用 U 灰度引流 1/1000 的压测流量（shadowTest=T）到应用 A 的异步补账 AIG（A-vostro）的 MOSN 路由规则示意：

![图片](https://gw.alipayobjects.com/zos/bmw-prod/ad97e243-070d-4cb2-9b0a-6fc90bb6a707.svg)

### 单元内流量自收敛 

流量流入到业务单元内后，后续还会继续调用其它应用，需要下发 MOSN 路由规则来保证流量收敛在业务单元内部，否则默认还是会流回默认的业务单元。

起初的方案是继续借助打标染色 SDK 写入的流量标识来路由，规则如：scope: app=U；condition: sl_biz_unit=xxx；destination: mosn_aig=A-vostro。

但是这种规则是和客户端应用、服务端应用强绑定的，对于复杂的场景如本项目来说，每一条调用关系都需要下发一条规则，整体的梳理及维护的工作量是非常大的。

调研和验证的时候我们识别到这个问题，和相关同学讨论后，最终提出了更简洁可行的方案（AIG 自收敛）。在 MOSN 侧支持识别自身的 aigcode，下发给所有调用此应用的应用，规则可以简化为只和当前应用以及 aigcode 相关，如：scope: aigcode=vostro；destination: mosn_aig=A-vostro。简化后，规则数量和单元内的应用数量一致。

本项目自收敛规则如下图：

![图片](https://gw.alipayobjects.com/zos/bmw-prod/525fb325-02cc-4c89-96fb-87c1b8c5bfda.webp)

## ｜总结及展望｜

本文主要介绍了网商在应对业务流量隔离场景的一种全新的解决方案以及业务实践过程。

相比传统的新增应用的笨重的方案，基于容器、ServiceMesh 等云原生技术的「业务单元隔离」的方案更加轻量和灵活。当前我们已经实现了  RPC、调度以及 HTTP 流量的隔离，后续还将进一步完善支持消息等流量的隔离。

欢迎有类似诉或对相关技术方案有兴趣的同学随时来交流探讨。

### 本周推荐阅读  

[云原生运行时的下一个五年](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247498935&idx=1&sn=7b9976f41a35eba7db6025ff42ba7086&chksm=faa3136dcdd49a7b67baf40f78cf50cbd45d560a249d2d94af85af9fb9cf63b9e7be59f3dcc8&scene=21#wechat_redirect)

[蚂蚁集团技术风险代码化平台实践（MaaS）](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247495808&idx=1&sn=88246170520e1e3942f069a559200ea4&chksm=faa31f5acdd4964c877ccf2a5ef27e3c9acd104787341e43b2d4c01bed01c91f310262fb0ec4&scene=21#wechat_redirect)

[还在为多集群管理烦恼吗？OCM来啦！](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247490574&idx=1&sn=791b8d49759131ea1feb5393e1b51e7c&chksm=faa0f3d4cdd77ac2316b179a24b7c3ac90a08d3768379795d97c18b14a9c69e4b82012c3c097&scene=21#wechat_redirect)

[Service Mesh 在中国工商银行的探索与实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247499122&idx=1&sn=9733d1c015e7b0e8e64bd5cf44118b10&chksm=faa312a8cdd49bbec97612e9756ef4372c446c410518a04bd0ae990a60fea9b8e78025e60c6d&scene=21#wechat_redirect)

![img](https://gw.alipayobjects.com/zos/bmw-prod/75d7bde6-1f48-4f28-80a4-215f8ec811bd.webp)
