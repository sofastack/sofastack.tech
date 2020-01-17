---
title: " 开箱即用的 Java Kubernetes Operator 运行时"
author: "何子波、金敏"
description: " 本文介绍了如何快速上手使用 Java 开发 Operator，感兴趣的读者可以根据官方实例在本地开发环境体验。"
tags: ["Kubernetes"]
date: 2020-01-16T20:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1579248978867-b6f341d3-0f1c-40dc-afd2-b076e57d5ec6.jpeg"
---

本篇分享的内容难度为“初学者/Beginner”级别，以下是阅读本文前推荐您了解的背景知识：

- Java 语言编程基础；
- 了解过 Kubernetes 平台上的 Operator/Controller 工作机制；

也可以同步参考 Kubernetes 官方博客内容：[https://kubernetes.io/blog/2019/11/26/develop-a-kubernetes-controller-in-java](https://kubernetes.io/blog/2019/11/26/develop-a-kubernetes-controller-in-java/)

![图为何子波和金敏在 KubeCon NA2019 大会分享后的交流](https://cdn.nlark.com/yuque/0/2020/png/226702/1578553929422-b77aa94e-1a8a-4f57-a405-e3be6b9a50e7.png)

图为何子波和金敏在 KubeCon NA2019 大会分享后的交流

**何子波 蚂蚁金服技术专家**：
_(adohe@github) _Kubernetes 维护者，SIG CLI Co-Chair（包括 Kubectl 及其扩展插件，Kustomize 以及客户端运行时），同时关注安全容器，多租户等领域。

**金敏 蚂蚁金服软件工程师**：
_(yue9944882@github) _Kubernetes SIG API-Machinery 维护者及其子领域 Owner（CRD 服务实现，APIAggregation SDK 套件，控制面流控，OpenAPIv2/3，Java SDK 等），同时也是 OpenAPI 开源生态工具链`openapitools.org` 的 Techincal Committee。

本文根据两位在 KubeCon NA2019 的分享内容整理。本次演讲与大家分享蚂蚁金服金融科技扩展云原生 Java 能力到云的实践和改造，并将收获的产出回馈开放给 Kubernetes 社区。

### 分享概要

在 Kubernetes 平台上开发部署运行 Operator 已经是在 Kubernetes 上拓展开发能力的默认范式。最早是 CoreOS 的工程师们创新提出了 Operator 的开发理念并且在社区收获了良好的反响，在经过一段时间的波折、打磨和实践之后，我们今天才看到丰富多样的 Operator 层出不穷。实际上 Operator 的效力往往要结合 Kubernetes API 的扩展能力才能更好发挥。所以其广泛传播反过来锤炼演进了 Kubernetes 上 CustomResourceDefinition 承载第三方 API 模型的能力。水涨船高，这也是社区集中投入人力从 v1.14 开始启动 Extensibility GA Sprint 小组冲刺 Kubernetes 扩展性建设的推动原因。

![何子波和金敏在 KubeCon NA2019 大会现场演示](https://cdn.nlark.com/yuque/0/2020/png/226702/1578554457661-8df4cf61-1d71-4b24-9b6f-421708d1dda7.png)
图为何子波和金敏在 KubeCon NA2019 大会现场演示

随着 Operator 的受众越来越多，社区也衍生出了面向 Operator 开发提效的工具链项目比如 [operator-sdk](https://github.com/operator-framework/operator-sdk)、[kubebuilder](https://github.com/kubernetes-sigs/kubebuilder)、[metacontroller](https://github.com/GoogleCloudPlatform/metacontroller) 等等优秀的开源项目。可是这些项目大都是面向 Go 语言研发者的，虽然越来越多的研发者向 Go 靠扰已是事实，但是 Go 语言尚不及其他主流编程语言成熟，倒是慢慢铺开的 Kubernetes 等其他开源项目的工业实践在“倒逼”Go 语言底层库的修复和稳固，比如 http2 的底层网络库[1]。与此相似的，我们最早内部孵化的 Java 语言的 Operator 运行时框架也是被实际业务“倒逼”出来的，并在 Kubernetes 社区露头试水之初便收获了许多反馈推动发展直到今天走到全面开放。

### 你为什么需要使用 Java 开发 Operator

如果你在犹豫不决是否要使用 Java 开发 Operator 并应用到实际中来，我们从以下几个方面进行对比看看哪一点是足够吸引你尝鲜：

- **适配存量系统**：如果在登陆 Kubernetes 之前你的基础设施底层系统都是通过 Java 开发的，那么恭喜你已经有了使用 Java Operator 的天然土壤。反过来把存量系统接口逐个“翻译”为 Go 语言既消耗大量人力又引出持续同步维护 Go 语言库的成本。
- **堆内存快照**：相比于 Java，Go 语言很难将运行中的程序的内存进行完整的快照分析，PProf 相关工具链能做的只是将内存的使用概况汇总输出，虽然也可以帮助分析锁定出泄漏的对象类型，但是粒度有限。反过来 Java 程序的堆内存进行快照分析已经具有成熟的工具链支持，研发者通过一份完整的堆快照可以直接锁定出比如 WorkQueue 中积压的内容，甚至限流器中逐个 Key 的瞬时状态，也可以在 Operator 静默不响应的场景下快速锁定问题。
- **性能诊断/在线调试**：结合比如 JMX Exporter 等工具链的帮助，我们直接将 Java 虚拟机的细节运行状态以 Prometheus Metrics 的形式收集起来，虽然 Go 程序也可以暴露出其运行时的 Metrics，但是对比后我们发现 Java 的 Metrics 在分析 GC 状态和堆分布上更加强大。除此之外，Java Operator 的远程调试更加方便上手。
- **线程模型**：与 Java 显著不同的是，Go 语言中的 Routine 不具有直接从外部“杀死”的功能，你需要结合 Channel/Context 等模型间接实现。而在 Java 虚拟机上的线程模型有和操作系统类似的生命周期管理，开发者可以白盒的操作干涉线程的生命周期。这对于某些业务场景是重要的。
- **OOP 范型编程接口**： Go 语言本身的设计哲学是不认可面向对象编程的，尽管好处很多但是在 API 模型繁多的 Kubernetes 项目中，维护者不得己转向使用代码生成器批量为这些模型生成大量模版代码。Java 的优势之一是范型编程，这可以彻底取代代码生成器的工作，同一套代码可以自由地适配在各种模型，比如 Pod 到 Service 等等。
- **第三方研发者库生态**：经过数十年的演进，Java 积累的第三方工具库远比 Go 语言丰富的多，至少目前而已可以算得上是一个优势。

### 示例代码速览

下面两张代码片段为你展示了具体开发 Java Operator 所需要的全部工作，相信接触过 Kubernetes Client-Go 的开发者通过名字大致了解如何使用了：

（如何构造出一个 Informer 实例） [https://github.com/kubernetes-client/java/blob/master/examples/src/main/java/io/kubernetes/client/examples/InformerExample.java](https://github.com/kubernetes-client/java/blob/master/examples/src/main/java/io/kubernetes/client/examples/InformerExample.java)

![构造出一个 Informer  实例](https://cdn.nlark.com/yuque/0/2020/png/226702/1578553929435-cd157b5f-2c4d-4029-9a52-49ee4ca108c1.png)

（如何构造出一个 Operator 实例） [_https://github.com/kubernetes-client/java/blob/master/examples/src/main/java/io/kubernetes/client/examples/ControllerExample.java_](https://github.com/kubernetes-client/java/blob/master/examples/src/main/java/io/kubernetes/client/examples/ControllerExample.java)

![如何构造出一个 Operator 实例](https://cdn.nlark.com/yuque/0/2020/png/226702/1578553929451-9eae04df-faaa-40e7-b9d6-4cf7a8162acf.png)

### 开发 Java Operator 需要额外注意什么

仅仅是通过代码开发 Operator 显然不是大结局，你还需要注意其他的问题，以下是我们在实际运用的获得的经验总结：

- **严谨管理 CRD Yaml 定义**：如最开始提到的，当 Java Operator 操作的是自定义资源比如 CRD 时，我们自然需要操作/维护该 CRD 对应的 Java 模型。这首先引入了 CRD Yaml 的良好维护的问题（具体细则这里暂不赘述），另外还有如何将 CRD Yaml 映射为 Java 模型的问题。关于后者我们既可以手动维护管理，也可以通过代码生成器将你的 CRD Yaml 一步转换为严丝合缝对应的 Java 模型。Kubernetes 的核心是 API 模型。社区自身对于 API 的变更是作为最高优先级进行审核，当我们自行拓展管理 API 模型时更应当谨慎细致。
- **关注 Operator 的关停步骤**：目前 Go 语言的 Operator 是不存在优雅退出的，然而这不代表我们不需要。在 Java 的线程管理模型下我们可以更细粒度地调整 Operator 关停时的行为，比如完整释放队列中的任务后再下线。
- **把 Operator 解耦为独立部署的组件**：开发 Java 程序时开发者往往倾向于将 Operator 声明为例如 “Spring Bean”并注入到某个 RPC 服务中。但这其实是不推荐的，因为 Operator 的生命周期应该是在其续约“Lease 租期”中断时退出重启，而 RPC 服务的重启操作往往成本更高。两者并不对拍。

### 未来的拓展/行进路线

除了不断的将 Client-Go 现有的能力平行移植到 Java 客户端之外，我们还规划了以下内容作为未来的行进路线：

- 大规模集群下的 Operator 拓展能力；
- 适配 Kuberentes 社区标准的多集群的扩展能力；
- Operator 下的分布式对象/任务追踪；

### 结束语

本文介绍了如何快速上手使用 Java 开发 Operator，感兴趣的读者可以根据官方实例在本地开发环境体验。Kubernetes 社区的 Java 客户端可以发展至今离不开社区的贡献和反馈，也感谢红帽的 Fabric8 客户端的协助得以让开发者收获更流畅的开发接口体验。对 Kubernetes 社区的 Java 未来发展有更多想法和建议朋友欢迎在我们的仓库留下足迹：[https://github.com/kubernetes-client/java](https://github.com/kubernetes-client/java) 。同时也欢迎致力于云原生领域的小伙伴们加入我们，我们一起探索和创新！

![现场图](https://cdn.nlark.com/yuque/0/2020/png/226702/1578553929450-5042a25c-9f6c-4b62-a667-6906da0f5195.png)

[1] 更多上下文参考：[https://github.com/kubernetes/client-go/issues/374](https://github.com/kubernetes/client-go/issues/374)

[2] 通过 CRD Yaml 生成 Java 模型参考：[https://github.com/kubernetes-client/java/blob/master/docs/generate-model-from-third-party-resources.md](https://github.com/kubernetes-client/java/blob/master/docs/generate-model-from-third-party-resources.md)