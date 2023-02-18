---
title: "降本增效：蚂蚁在 Sidecarless 的探索和实践"
authorlink: "https://github.com/sofastack"
description: "降本增效：蚂蚁在Sidecarless 的探索和实践"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2022-12-13T15:00:00+08:00
cover: "https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*_7u7TYpqVcMAAAAAAAAAAAAADrGAAQ/original"
---
![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/beac9cc229524ce0b025d67a1bad4525~tplv-k3u1fbpfcp-zoom-1.image)

文｜王发康 *（花名：毅松 ）*

蚂蚁集团技术专家、MOSN 项目核心开发者  

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6702b62873014dacbdf0bfd2dcf1aa9f~tplv-k3u1fbpfcp-zoom-1.image)

*深耕于高性能网络服务器研发，目前专注于云原生 ServiceMesh、Nginx、MOSN、Envoy、Istio 等相关领域。* 

本文 **5574** 字 阅读 **14** 分钟

## 前言

从单体到分布式，解决了日益增长的业务在单体架构下的系统臃肿问题；从分布式到微服务，解决了服务化后的服务治理问题；从微服务到服务网格，解决了应用和基础设施耦合下的研发效能及稳定性问题。

从微服务架构的演进历史来看，任何架构都不是一成不变，总是随着应用在不同阶段的痛点以及周边技术的发展而持续演进，而服务网格 *（ServiceMesh）* 概念从提出到生产落地至今已 6 年多了，那它的下一代架构应该是什么样？对此业界也有不同的声音 [Service Mesh 的下一站是 Sidecarless 吗](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247517361&idx=1&sn=9a5947c97d2e6adffa3d066c4c599c7b&chksm=faa36b6bcdd4e27dac0d925ac6385de906b413944203519f7b9be627b0b708e87381f0bcad2b&scene=21#wechat_redirect)[1] ，本文主要介绍蚂蚁在这方面的探索和实践，最终如何帮业务降本增效，提升安全保障水位。

## 一、 问题及挑战

谈起 ServiceMesh，大家的脑海中应该会呈现出下面这幅图，即 ServiceMesh 的 Sidecar 形态，它非常好的解决了应用和基础设施耦合下的系列问题，为业务的提效及稳定性等方面然禹功不可没。

但是随着 ServiceMesh 的规模化增大，Sidecar 架构也随之暴露了一些劣势，譬如应用和 Sidecar 资源耦合导致相互抢占、生命周期绑定，导致应用扩缩容涉及额外 Sidecar 容器的创建及销毁开销、Sidecar 数量随着应用 Pod 数等比增加，导致其资源无法充分复用等。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/28d018bc39c44cf892e1719498749cba~tplv-k3u1fbpfcp-zoom-1.image)

引用 *redhat.com/architect/why-when-service-mesh*

### 1.1 资源耦合

Sidecar 形态虽然从代码维度是解耦了基础设施与应用的耦合，但是在资源方面目前仍然是和应用 Pod 绑定在一起，这就导致其资源管理成为一个难题。对此蚂蚁 ServiceMesh 在 Sidecar 资源管理[2] 进行改善，解决了初期的资源分配及管理。但随着业务的发展也暴露一些隐患，一方面 Sidecar 和应用相互抢占 CPU 可能导致引发时延毛刺问题，另一方面固定的 1/4 内存资源可能无法满足机房规模增大引发的网络连接数膨胀等系列问题。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7010981542e44b07a0937615d5239dcf~tplv-k3u1fbpfcp-zoom-1.image)

### 1.2 生命周期绑定

Sidecar 和应用属于同一个 Pod，而 K8s 是以 Pod 为最小单位进行管理的。这导致应用在扩缩容操作时会涉及额外 Sidecar 容器的创建及销毁开销，而 Sidecar 中的进程是基础设施软件本不应该随着应用的销毁而销毁。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d0511218c057440f94f01fed405fea66~tplv-k3u1fbpfcp-zoom-1.image)

### 1.3 资源复用不充分

Sidecar 数量随着应用 Pod 数等比增加，而 Sidecar 上运行的都是基础设施通用能力，这将导致 Sidecar 中应用无关逻辑的 CPU 和内存等开销都在每个 Pod 中重复消耗。另外对于一些本能通过软件集中优化或硬件集中卸载的计数也无法充分施展。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d146175976a24f5fabbe3f97b7a74d13~tplv-k3u1fbpfcp-zoom-1.image)

### 1.4 安全及业务侵入性

Sidecar 同应用同属一个 Pod，这无论对于 Sidecar 还是应用自身都是增大了安全攻击切面，另一方面 Sidecar 形态的服务治理也不算是完全业务无感的，至少要做一次 Sidecar 的注入，然后重启应用 Pod 才生效。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5429a257340446e59ce95194b98f7524~tplv-k3u1fbpfcp-zoom-1.image)

## 二、思考及分析

对于上述 Sidecar 形态下的四个痛点：资源耦合、生命周期绑定、资源复用不充分、安全及业务侵入性，其实归根结底还是其架构导致。

如果将 Sidecar 从应用 Pod 中剥离出来，对于资源耦合、生命周期绑定、安全侵入性问题都会迎刃而解，而资源复用粒度取决于剥离后部署的集中化程度。对于剥离后的集中化程度也并不是越集中越好，因为中心化后会增加交互时延以及能力的完整性缺失，所以在中心化和  Sidecar 化之间做一次折中，即通过 Node 化部署形态来解决，这样既可以做到同 Node 上的 Mesh 资源复用，又可以做到网络交互不跨 Node 的相关优化。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8da496f20dea43449bed12daa8b9ef67~tplv-k3u1fbpfcp-zoom-1.image)

虽然解决了 Sidecar 形态下的痛点，但是 Node 化后也引入了一些新的 “问题”。对于问题我们需要用辩证的眼光去看待，有时问题的背后可能是一个新机会。

譬如 Sidecar 形态下的服务发现都是 Pod 级别，随着 Pod 规模的增大其服务条目成倍速增加，如果 Node 化后服务发现使用 Node IP 这样是不是可以成本的缩减服务条目，亦达到网络连接数的复用及收敛。

**- 隔离性、多租户：** 多个应用共享 Mesh 后，涉及的一些应用维度的配置、内存、CPU 等资源如何相互隔离，另外对于 Sidecar 中各种基础设施组件如果自身来支持多租户，则改造成本是不可预估的。

**- 服务 pub/sub：** 之前 Sidecar 形态下，Sidecar 和 APP 的 IP 是同一个 *（Container 网络模式）* ，Node 化后 IP 变成 Daemonset 容器的 IP，服务发现应如何管理？以及 Pod 和 Node 之间的流量如何管理。

**- 运维及安全合规**

   a. Node 化后涉及到 Daemonset 自身以及应用维度的配置升级发布流程如何管控，同时出现故障时如何缩小爆炸半径；  
   
   b. Node 化后涉及到的安全合规问题如何保证，如网络连通性如何隔离、身份等；

   c. Node 化后，Daemonset 所占用的机器成本如何规划 *（超卖？独占？）* 以及各个应用的资源消耗如何计算。

## 三、方案介绍

将应用 Pod 中的 Sidecar 下沉到 Node，以 Daemonset 方式在每个 Node 部署。我们将该 Daemonset 命名为 NodeSentry，其定位是作为 Node 的网络基础设施，承载网络安全、流量治理、Mesh 下沉、连接收敛等 Node 相关网络治理平台。

本文主要介绍 NodeSentry 承载 Mesh 下沉相关方案，Node 化后需要数据面 Proxy 能够高效、稳定的承载多个 Pod 的流量治理。这就要求数据面 Proxy 具备高处理性能及高研发效能，为此我们在 2021 年就其做了相关技术布局 MOSN2.0，详细介绍见 [开启云原生 MOSN 新篇章 — 融合 Envoy 和 GoLang 生态](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247490185&idx=1&sn=cfc301e20a1ae5d0754fab3f05ea094a&chksm=faa0f553cdd77c450bf3c8e34cf3c27c3bbd89092ff30e6ae6b2631953c4886086172a37cb48&scene=21#wechat_redirect)[3] 。

Mesh 下沉至 NodeSentry 其架构如上图所示，在新的架构下不仅能解决 Sidecar 形态的痛点，同时也具备了如下收益：

**- 资源解耦**：解耦应用和基础设施的资源配额，多应用的 Mesh 资源池化、削峰填谷；

**- 资源复用**：同 Node 同应用 Mesh 共享，ingress 方向连接收敛 、egress 方向连接共享、Node 级粒度 cache 命中率更高等；

**- Node 服务发现体系**：解决注册中心等基础设施服务端压力以及调用端的内存消耗；

**- 提升启动速度**：新架构下应用无需每次都启动 Mesh 的容器及镜像下载、SDK 初始化共享等额外操作；

**- 集中优化**：云原生 L7 网络协议栈，软硬件结合性能优化，支持 IPV6，蚂蚁卡，RDMA or QUIC 等；

**- 解耦应用和网络：** 同 Zero Trust Networking[4]  相关技术结合实现全局调度，有限互通等。

### 3.1 微隔离/多租户

利用 MOSN 2.0 的高性能网络处理能力，在其之上以动态库的方式拉起各个应用的 Mesh 实例 *（注：多个 Mesh 实例和 MOSN 2.0 是在同一个进程中，如下图所示）* 。

在资源上做到各个 Mesh 实例之间 runtime 级别的微隔离 *（如 GC、P、信号等资源）* ；在配置方面通过对 runtime 环境变量的劫持做到各个应用实例的差异化；在稳定性上通过劫持 runtime exit 来避免 APP1 的 Mesh 实例挂掉影响 APP2，缩小爆炸半径等。

同时也通过单进程多实例的方式支持了基础设施组件的多租户能力，更多细节见一种进程内的多租户插件隔离与通信技术[5]  。微隔离及多租户架构，如下图所示，当流量从 MOSN 2.0 进来后，通过一定的策略路由到各个应用的 Mesh 实例进行后续处理。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/af5bbdab1de14fe8b884e72af9bf90e3~tplv-k3u1fbpfcp-zoom-1.image)

### 3.2 同应用 Mesh 共享

对于同一个 Node 上同一个应用的多个 Pod 可以共享 NodeSentry 上面的 ServiceMesh 实例，如下图所示应用 A 和 B 各自两个 Pod 分别共享 NodeSentry 上的 2 个 Mesh 实例。

这样既解决了不同应用 Mesh 差异 *（如证书等配置、身份信息）* ，又达到资源共享，避免同一个应用依赖的资源多次初始化开销。当然共享后的收益也不止这些，比如网络连接复用收敛、资源池化削峰填谷以及降低基础设施服务端压力等等。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0d8050b3998846978831e61f1cf2cef7~tplv-k3u1fbpfcp-zoom-1.image)

### 3.3 流量劫持

流量转发这块分为 ingress 和 egress 场景 *（注：基于 APP 侧视角）* ，从 Sidecar 演进为 Node 形态后，应用 Pod 和 Mesh 之间的流量转发路径发生了改变。为了屏蔽该变化对业务的感知，我们通过流量劫持组件将其 Pod 流量劫持到 NodeSentry 上然后分发到对应的 Mesh 实例进行后续的处理。

关于流量劫持组件目前由于蚂蚁这边的容器有多种形态 *（runc、runsc、rund 等）* 所以单纯的 ebpf 或 tproxy 方案并不适用，当前阶段我们是通过在应用容器中注入相关的环境变量来显示指定流量转发到 Node 上，未来对于流量劫持这块我们会通过策略路由的方式来更透明的支持流量劫持及身份管理。

### 3.4 资源管理

对于 NodeSentry 资源这块，目前阶段我们是小规模试点阶段，相关资源是和同 Node 上的 Daemonset 共享的，但是随着接入应用的增多，这块资源是需要有一定保障的。当前业界 ambient-mesh[6] 通过将 L7 进一步从 Daemonset 剥离到中心化 Gateway 通过 HPA[7] 的思路来解决容量问题。

如下介绍的是 NodeSentry 后续如何通过 VPA[8] 方案进行 Daemonset 的容量规划。在应用扩容时 NodeSentry 资源如下做 VPA 弹性管理，缩容流程类似：  
1、在扩容 Mesh Node 化应用时，Kubectlscheduler 选择资源满足 A+B 的 Node 执行 Pod 调度。

**-** 代表应用自身需要的资源

**-** 代表该应用在 mesh 上需要消耗的资源

2、满足条件的 Node 在创建应用 Pod 的同时触发 NodeSentry 资源进行 VPA 弹性扩容。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/35def3e978df483aaea13b19cbeec2d4~tplv-k3u1fbpfcp-zoom-1.image)

### 3.5 运维管理

从 Sidecar 下沉为 Node 模式后，我们在应用发布运维流程上也做了一些适配，用来屏蔽其流程的变化导致的运维成本及用户体验问题。

对于应用扩缩容、应用重启、MOSN 重启、MOSN 版本升级等运维操作通过 Container Lifecycle Hooks[9] 提供的 postStart 和 preStop hook 点嵌入相关交互流程完成 NodeSentry 上的 Mesh 实例管理。

另外一块是 NodeSentry 自身底座升级，目前是通过 K8s console 触发 Node 上的相关应用关流，然后进行 NodeSentry 升级，待其过程就绪后再恢复 APP 引流。该流程虽然可以做到流量无损，但可能会导致个别应用的容量问题，这个我们后续会通过应用层协议支持 goaway 等方案来更优雅地做到底座的无损升级。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fc8df5e39b6c4e26b83a32dff2bdfdcd~tplv-k3u1fbpfcp-zoom-1.image)  

## 四、业务效果

当前 NodeSentry 正在试点阶段，其架构如下图所示。将某应用的 Sidecar 下沉到 NodeSentry 后应用启动提速 37%。

对于 Mesh 资源复用，目前一组 Mesh 裸启动内存占用 200MB~ ，通过亲和调度后目前可做到同应用同 Pod 的 Mesh 复用度为 3~  即每个 Node 可节省 2~ 个裸 Mesh 占用的资源，同时 Mesh 复用后相关的网络连接数也是成倍减少。而且随着接入的应用增多，复用的 Mesh 也会增多，资源节省也会更为客观。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/942e43fcf71f454eb1c37f700ecf11b1~tplv-k3u1fbpfcp-zoom-1.image)  

## 五、未来展望

NodeSentry 承载 Mesh 下沉只是开始，接下来除了支持更多的应用接入，也会支持更多场景下沉，譬如 ODP、Cache、Message 等，同时在方案上也会持续演进，做到更稳定、易用、安全、业务无感。

另外通过 NodeSentry 统一收口 Node 网络流量做相关安全审计、治理、集中优化等，进一步为业务降本增效、提升安全保障水位，结合身份体系，共同构建零信任网络。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5880ef32fad241a788c967c327d4e32d~tplv-k3u1fbpfcp-zoom-1.image)

MOSN 团队秉着标准、开放的态度，也将其底层通用能力贡献给 Envoy 官方[10]，方便开发者在 Envoy 之上使用 GoLang 来开发业务相关插件，从而获得高研发效能及高处理性能。同时接下来我们也会在其标准之上打通 MOSN L4/L7 filter 处理框架，让用户更方便地使用 MOSN filter 及更清爽研发体验。

## 参考文档

[1]  Service Mesh 的下一站是 Sidecarless 吗:*[https://mp.weixin.qq.com/s/v774kTV46dxBc6_n2c5A_w](https://mp.weixin.qq.com/s/v774kTV46dxBc6_n2c5A_w)*

[2] 蚂蚁 ServiceMesh 在 Sidecar 资源管理：*[https://www.sofastack.tech/blog/service-mesh-practice-in-production-at-ant-financial-part3-operation](https://www.sofastack.tech/blog/service-mesh-practice-in-production-at-ant-financial-part3-operation)*

[3] 开启云原生 MOSN 新篇章 — 融合 Envoy 和 GoLang 生态：*[https://www.sofastack.tech/blog/opening-a-new-chapter-of-cloud-native-mosn-converging-envoy-and-golang-ecosystems](https://www.sofastack.tech/blog/opening-a-new-chapter-of-cloud-native-mosn-converging-envoy-and-golang-ecosystems)*

[4] Zero Trust Networking：*[https://en.wikipedia.org/wiki/Zero_trust_security_model](https://en.wikipedia.org/wiki/Zero_trust_security_model)*

[5] 一种进程内的多租户插件隔离与通信技术：*[http://www.soopat.com](http://www.soopat.com)*

[6] ambient-mesh：*[https://istio.io/latest/blog/2022/introducing-ambient-mesh](https://istio.io/latest/blog/2022/introducing-ambient-mesh)*

[7] HPA：*[https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale)*

[8] VPA：*[https://www.kubecost.com/kubernetes-autoscaling/kubernetes-vpa](https://www.kubecost.com/kubernetes-autoscaling/kubernetes-vpa)*

[9] Container Lifecycle Hooks：*[https://kubernetes.io/docs/concepts/containers/container-lifecycle-hooks](https://kubernetes.io/docs/concepts/containers/container-lifecycle-hooks)*

[10] Envoy's L7 Go extension API：*[https://github.com/envoyproxy/envoy/pull/22573](https://github.com/envoyproxy/envoy/pull/22573)*

**了解更多**

**MOSN Star 一下✨：**  *[https://github.com/mosn/mosn/](https://github.com/mosn/mosn/)*

## 本周推荐阅读

[Service Mesh 的下一站是 Sidecarless 吗？](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247517361&idx=1&sn=9a5947c97d2e6adffa3d066c4c599c7b&chksm=faa36b6bcdd4e27dac0d925ac6385de906b413944203519f7b9be627b0b708e87381f0bcad2b&scene=21#wechat_redirect)

[社区文章｜MOSN 构建 Subset 优化思路分享](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247511573&idx=1&sn=86019e1570b797f0d4c7f4aa2bcf2ad3&chksm=faa341cfcdd4c8d9aea24212d29c31f2732ec88ee65271703d2caa96dabc114e873f975fec8f&scene=21#wechat_redirect)

[cgo 机制 - 从 c 调用 go](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247516398&idx=1&sn=2172b6f6ffe9c8b3263a15ef60ee3d54&chksm=faa36f34cdd4e622746582f922cd00798a1044c4f32a7ce058be6df91b58cbee725022a56525&scene=21#wechat_redirect)

[如何看待 Dapr、Layotto 这种多运行时架构？](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247510516&idx=1&sn=eff21915cd0ac1a8c8e3f126b549a605&chksm=faa3462ecdd4cf38ab6ab0c7201902fb53d54cea4865f9b7d7cdcdc7eaa00cf354d8b05e5393&scene=21#wechat_redirect)
