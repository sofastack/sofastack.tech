---
title: "基于 MOSN 和 Istio Service Mesh 的服务治理实践"
author: "姚昌宇"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "Service Mesh"
tags: ["Service Mesh","MOSN"]
date: 2020-07-23T18:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1595586118880-cd902cce-f484-43aa-9474-d8b6e12ad0a3.jpeg"
---

> Service Mesh Webinar 是由 ServiceMesher 社区和 CNCF 联合发起的线上直播活动，活动将不定期举行，为大家带来 Service Mesh 领域的知识和实践分享。

![Service Mesh Webinar#2](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1595505317715-2f108d91-4018-414c-833c-cbfc907c7880.jpeg)

本文根据7月22日晚 Service Mesh Webinar#2 有米科技高级后端工程师、MOSN Committer 姚昌宇，线上主题分享《基于 MOSN 和 Istio Service Mesh 的服务治理实践》整理，文末包含本次分享的视频回顾链接以及 PPT 下载地址。

## 前言

大家好, 欢迎大家参加第二期 Service Mesh Webinar。本期的分享主题是《基于 MOSN 和 Istio  Service Mesh  的服务治理实践》。我是今天的分享嘉宾姚昌宇，来自有米科技，目前在公司也是负责服务治理相关的工作，我本身也是一名云原生爱好者，在空余时间关注和参与 Service Mesh 社区，最近参与了 MOSN 新版本的开发，也是有了很多收获。这次受社区邀请来给大家做这次分享，希望能给大家带来收获。

今天的分享将从以下几个方面进行：

- 第一部分会简单介绍一下什么是 Service Mesh、Service Mesh 可以给我们带来什么红利以及我参与社区的过程和一些收获；
- 第二部分是这次分享的重点，我会从一个开发者的角度，说说如何基于 MOSN 和 Istio 去做服务治理，中间会包括 MOSN 源码的分析和 Istio 功能的实操，也是比较多 Service Mesh 爱好者关注的如何落地的问题，比如流量的控制啊、服务监控等等的功能；
- 第三部分会总结一下今天的分享以及 MOSN 一些近况和未来愿景的介绍；

## Service Mesh 简介以及社区共建实践分享

### Service Mesh 简介

首先，什么是 Service Mesh 呢？相信这是众多爱好者刚接触 Service Mesh 时的最初疑问。Service Mesh 发展了这么多年，网上介绍和分析的文章也是很多，在这里我也再啰嗦一句。如果用一句话来概括 Service Mesh，我会说，它是一种微服务的通信方案，是不断演进而成的。

大家都知道，服务端架构经历了一系列的演进，从最开始的单体服务到 SOA，再到微服务，服务间通信也从最开始的无需通信、到集成在代码里、再到胖客户端库，再演进为 Service Mesh 的 network stub 模式，又或者称为 sidecar 模式。

![幻灯片5.jpeg](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1595493587232-e1523e32-55d9-4c47-8134-dc361c61ceaf.jpeg)

Service Mesh 主要解决了之前的服务间通信方案的几个问题：

1. 语言绑定；
1. 升级困难；
1. 重复开发、标准不一；

语言绑定：在将服务治理逻辑抽离到 Sidecar 之前，这些治理逻辑需要集成在代码里面。这就容易导致业务要么要绑死在同一种开发语言上，要么就要相同的逻辑不同语言维护多份。这样既不灵活，维护起来成本也比较大。

![服务端架构演进](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1595502652062-9d6ee605-5f22-4f2c-ae61-c700dadcf119.jpeg)

升级困难：企业里的基础设施团队，在升级服务治理逻辑之后，需要推动各个业务去重启他们的服务，这样一个周期通常会拖的非常长，重启过程也会有各种问题，导致线上各个版本的治理功能不一致，落地起来相当费劲。

重复开发、标准不一：每个公司都会根据他们的实际情况落地微服务，有的会使用各个语言比较成熟的微服务框架，比如 Java 的 Spring Cloud、Dubbo；或者 Golang 的 go-micro 之类的框架。有的团队或者会使用集成组件的方式，在各个语言的基础上，加上一些成熟的服务治理组件，比如 Consul、Zookeeper、Hytrix、Vault 等。通常，通过对接这些组件来抽象出一个类似于微服务控制平面需要一定的开发成本，而且这些框架和组件标准也是不一致的，维护起来也会有不少成本。

![语言绑定](https://cdn.nlark.com/yuque/0/2020/png/226702/1595504981106-200d564e-dcfa-4819-8991-ad38e2b3fa1c.png9)

那么，Service Mesh 是如何解决这些问题的呢？

![重复开发、标准不一](https://cdn.nlark.com/yuque/0/2020/png/226702/1595494060185-80877fcd-b3bc-4050-bc04-9f7cc925c29b.png)

首先，Service Mesh 架构将服务治理的逻辑抽离到一个单独的 Sidecar 进程中，而 Sidecar 进程是与语言无关的。Sidecar 通过代理的形式劫持业务进程的流量，从而做到与具体的业务开发语言解耦。

其次，Sidecar 通过边车模式和业务进程部署在一起，但是又与业务进程分离。Sidecar 进程可以随时重启更新，业务进程无需感知这个过程。这样可以加速治理逻辑更新换代的过程，解决了传统服务治理，升级困难的问题。

最后，Service Mesh 定义了控制面和数据面的概念。控制面提供 UI 给操作者去控制整个集群的流量，数据面，顾名思义就是数据流动的平面，负责接收这些配置信息，表现出对应的代理行为。控制面和数据面通过统一的协议进行通信，也就是 Service Mesh 里的 xDS 协议来交换配置信息。通过这样的方式，理论上实现了 xDS 协议的控制面/数据面可以互相插拔替换，这就统一了标准，解决了第三点重复开发和标准不一的问题。

### 社区共建经历分享

那了这么多，那我是如何从关注 Service Mesh 社区，到参与到 MOSN 开源共建的呢？觉得整个过程可以概括成3点：

- 找到组织；
- 知识积累；
- 参与贡献；

其实一开始我也是一个初学者，刚接触到 Service Mesh 也会被一大堆不知名的名词砸得晕头转向的，像是 xDS、控制面、metrics tracing 之类的名词。所幸的是，ServiceMesher 的中文社区相当完善和活跃。我相信有了解过 Service mesh 的同学，肯定有加过2个微信 -- 一个就是宋净超宋大的微信，一个就是 ServiceMesher 社区的微信群。也是得益于众多的前辈将 ServiceMesher 中文社区维护的这么好，将各种内部实践分享出去，以及外部一手资讯搬运甚至翻译过来，乃至是这样子的不定期的线上线下分享。这些都是非常好的资源。只要你想去学，就肯定有方法的。而对于新人的疑问，社区里的大神们也是非常乐意解答。

既然有了目标和资源，那就差去做了。接下来我通过不断的去理解这些新领域的概念，理解它们的含义和背后的设计目的以及应用场景，再加上源码分析和动手实践，慢慢也就搭建起了整个关于 Service Mesh 的知识体系。

在摸清门道之后，其实参与开发也不是什么难事了。那为什么我会选择 MOSN 呢？其实蚂蚁集团有整个 SOFAStack，也就是金融级云原生架构的开源共建计划，其中有服务注册、流量跟踪、rpc 协议、分布式事务等等的项目。我选择 MOSN 主要是有两点考虑：

1. 第一是 MOSN 是使用 Golang 实现的，这一点和个人的技术栈比较吻合；
1. 那第二点，我认为 Sidecar 在 Mesh 的位置是比较关键的。在大型的集群里，上百万的 Sidecar 在集群里互相通信，为业务进程转发处理数据包，其稳定性、性能要求和灵活性都是比较高的；

近期我也参与到了 MOSN 的 Istio Roadmap 开发中，主要目标是将 MOSN无 缝地接入到 Istio 里，成为在里面可以工作的 Sidecar。我主要做的几个功能是pilot-agent 的适配以及一致性哈希负载均衡功能的开发。其实和做业务需求是类似的，首先要知道功能要达到什么目的，然后预演改动的地方，最后实践：fork 一份 MOSN、开发代码、完善单元测试、提交 PR。在做一致性哈希功能预演的时候，由于会用到 Google 的 maglev 算法，我还去看了一遍这个算法的细则。后期实践的时候，发现了一个用到的第三方的库，有一些的性能问题。由于这个功能工作在一个请求的--路由处理的过程，一定不能给请求增加太长的 RTT，我还把第三方库做了一轮性能优化，最后达到可用的状态，给第三方库提了个 PR。

最大的收获，我觉得是和大神们共事带来的技术提升以及成就感。

总结一下，以上就是我对 Service Mesh 的理解以及我自己参与社区的一些过程。

## 基于 MOSN 和 Istio 的服务治理实操

接下来是本次分享的第二部分，如何结合 MOSN 和 Istio 去做服务治理。

实操的第一步，首先是把环境跑起来。我的开发环境选择的是 Linux。我主要考虑的点是，Linux 环境和生产环境更相似，而且可以直接使用宿主机跑 Docker 和 K8s，直接运行宿主机打包出来的镜像。而 Mac 和 Windows  平台下 Docker 和宿主机是隔了一层虚拟机的，而且 K8s 环境也比较难安装。这样只要打包好 MOSN 镜像，配置好 MOSN 结合 Istio 的 yaml 配置，对 MOSN 的调试就只剩下编译和执行两个步骤了，可以省去在 Mac 和 Windows 平台还要 push、pull 镜像的耗时过程。

对于编译 MOSN，我 hack 了一句 MOSN 的 makefile，主要是加了 me 这样的一个任务，首先他会去 build-local， 也就是将 MOSN 的 go 源码编译成 MOSN 二进制文件，然后将二进制文件打包进 MOSN proxyv2 的镜像里面。这个 proxyv2 和 Isito的 proxyv2 镜像是类似的，只不过里面的 Sidecar 换成了 MOSN。

第三步，编译一遍 pilot-agent。由于 MOSN 在 Istio 里面是由 pilot-agent 启动的，在调试 MOSN 结合 Istio 的功能时，有时也需要在 pilot-agent 里打日志，比如看一下 pilotagent 有没有正常启动 MOSN。所以我也将 Isito 的源码克隆了下来，并且在需要的时候重新编译 pilot-agent。

最后是第四步，重启对应的 pod。比如这里就将 ingressgateway 删掉重新启动。由于需要调试 MOSN 的功能，在安装好 Istio 后我会将 ingressgateway 的镜像也改为我调试 MOSN 的镜像。

MOSN 目前支持 Istio1.5 的版本，所以我这次演示的本地环境也是 1.5 版本的。我们还需要修改一下 Isito Sidecar 注入的 configmap，这样我们在执行 Istioctl kube-inject 给业务注入 Sidecar 的时候，也能用上 MOSN 作为 Sidecar 代理。具体是在这里，加上 binaryPath 的参数，以及将这里的 tag 改成我编译出来的镜像tag，1.5.2-mosn-dist。

那么经过上面的步骤，一个 MOSN 结合 Istio 的环境就跑起来了。

这次代码实操的相关服务和镜像以及对应的 yaml 配置，我会放到 webinar2 democode 这个 git 仓库里面，需要的小伙伴也可以自行去克隆下来看看。

Demo：[https://github.com/trainyao/webinar2_democode](https://github.com/trainyao/webinar2_democode)

那接下来，我会展示一下，如何使用 MOSN 结合 Istio 来实现以下功能：

- 流量管理；
- gRPC 路由功能；
- 限流；
- 故障注入；
- 可观察性；
- 请求跟踪；
- 指标收集；

具体的实际 Demo 演示可以看视频详解。以上就是 MOSN 结合 Istio 服务治理的一些实践，希望对你有一些启发和帮助。

## 总结

本次 Webinar 也差不多接近尾声了。最后来总结一下这次分享的内容，首先简单介绍 Service Mesh de基本概念以及诞生是为了解决什么具体问题：微服务治理的语言绑定、更新困难、以及标准不统一的问题。后面还介绍了我从关注到参与社区开发的过程和一些思考。

然后到了现场撸码的部分，展示了如何将 MOSN 结合 Istio 运行起来并且搭建一个本地的开发调试环境。之后还展示了然后使用 MOSN 在 Istio 里实现服务治理的功能，包括流量管理和服务可视化的功能。

希望上面的分享内容对你有所帮助！

那么在最后还想分享一下 MOSN 的近况，也就是新版本的功能以及未来计划。

MOSN 最近发布了0.14.0版本，具体信息大家也可以在 MOSN 的 github release note 看到。

![MOSN v0.14.0](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1595504088467-939d58b3-b045-4989-a5b1-01a17c9f2253.jpeg)

[https://github.com/mosn/mosn/releases/tag/v0.14.0](https://github.com/mosn/mosn/releases/tag/v0.14.0)


这个版本主要是做了比较多支持 Istio 的工作，比如支持 Istio 1.5 版本，升级了 go-control-plane，sourcelabel 支持，一致性哈希负载均衡等等，也优化了性能和修复了已知的 bug。同时，我们也在推动 Istio 官方去促进通用数据面标准的制定，在不久的将来，Isito 或者是 Service Mesh 用户也不再会受限于 Envoy，在数据面上会有更多的选择。

接下来，MOSN 也会继续对齐 Istio 的功能，成为可以在 Service Mesh 里工作的安全、稳定、功能强大的云原声数据面代理。也如前面的分享内容所见，MOSN 还有很多可以完善的地方，也欢迎各位有想法有兴趣的小伙伴加入，给 MOSN 提 issue 和 PR 吧。

本次的分享就到这里了，感谢你的聆听。更多有关于 Service Mesh 和活动的信息，大家可以关注 SOFAStack“金融级分布式架构”和“ ServiceMesher”的微信公众号，里面有各种 Service Mesh 的一手资讯。另外在8月15号在深圳，蚂蚁集团的 MOSN 负责人毅松会带来一场主题分享《云原生网络代理MOSN的进化之路》，感兴趣的小伙伴也可以了解一下。

活动详情：[http://giac.msup.com.cn/Giac/schedule/course?id=14579](http://giac.msup.com.cn/Giac/schedule/course?id=14579)

### 作者介绍

姚昌宇，有米科技高级后端工程师、MOSN Committer，多年后端开发经验、云原生爱好者。目前负责公司内部数据和算法能力接口的服务治理相关的开发工作，2018年起关注并参与 ServiceMesher 社区发起的各种活动，近期参与 MOSN v0.14.0 版本功能的开发。

### 本期直播视频回顾地址

没赶上直播的同学也可以看回顾视频，在看完视频后欢迎填写本期视频的有奖问卷调研，给到我们关于本期直播的反馈，支持社区直播越来越好～

- 本期视频回顾：[https://www.bilibili.com/video/BV1AZ4y1g7nF/](https://www.bilibili.com/video/BV1AZ4y1g7nF/)
- 有奖问卷调研：[http://sofastack.mikecrm.com/N6eWjyX](http://sofastack.mikecrm.com/N6eWjyX)
