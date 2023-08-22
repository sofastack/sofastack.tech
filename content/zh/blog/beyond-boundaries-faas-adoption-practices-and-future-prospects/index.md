---
title: "超越边界：FaaS 的应用实践和未来展望"
authorlink: "https://github.com/sofastack"
description: "超越边界：FaaS 的应用实践和未来展望"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2023-08-15T15:00:00+08:00
cover: "https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*wpD9R7kZYyAAAAAAAAAAAAAADrGAAQ/original"
---

# 作者简介

**邢奇（薯片）**

蚂蚁集团技术专家，云原生和 Service Mesh 领域专家

长期从事服务治理和服务发现等相关领域的研究和实践，在 RPC 框架（*Dubbo、Spring Cloud 和 SOFARPC 等*）方面有源码级的研究和贡献；在 Service Mesh、云原生、容器和 K8s 等方面有深入的研究和实践经验。

参与了多个开源项目的贡献，包括 MOSN、SOFA、Dubbo 和 Nacos 等。目前担任蚂蚁云开发技术负责人，负责支付宝云开发产品的研发和实践。

**本文 5689 字，预计阅读 16 分钟**

# 概述 

什么是 FaaS ？

在 ChatGPT 里面输入 FaaS 关键字，得到的结果是：*FaaS 是一种云计算服务模型*。它允许开发者编写和部署函数，而不需要管理底层基础设施的运行，即 Function as a Service。

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*gxRZT6D0NF4AAAAAAAAAAAAADrGAAQ/original)

同时通过 ChatGPT 可以生成对应的函数代码——

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*FITpRpOw3NMAAAAAAAAAAAAADrGAAQ/original)

# FaaS 的崛起

FaaS 的理念和函数研发模式，为传统的应用模式解决了许多问题，有着超前的优势。

## 传统应用模式的困境

在研发态，不管是单体应用还是微服务应用，亦或是 Mesh 架构或者应用运行时，在研发态，开发者除了要关注业务逻辑本身之外，经常会被中间件所打扰，需要配合去做 SDK 升级改造，性能或者功能优化等。同时在使用云产品或者云服务的时候，需要被迫去感知多云的差异。

在运维态，开发者面临着更重的运维压力。当一个应用上线，开发者需要对这个业务的未来发展进行一个复杂且不确定的容量评估，再去为这个容量去申请对应的资源，最后经过一个复杂的上线流程进行发布。在发布结束之后，开发者还得时刻关注线上流量的变化，去进行不断的扩容和缩容的调整。

总而言之，整个中间件和基础设施对开发者的打扰是非常严重的：

-   应用研发模式的代码耦合严重，复杂度高；
-   运维流程繁琐，效率低；
-   容量评估一般很难符合真实情况，线上的资源利用率一般都较低，存在着浪费。

于是 FaaS 函数的研发模式应运而生。

可以很直观地看到，在传统应用和微服务应用的改造和优化的基础之上，FaaS 希望做得更进一步，更面向未来。以函数为编程对象，用户无需关注应用、机器等数据和基础设施信息。

通过这样的改变，大大提升研发效能，做到快速开发；并且提高运维效率，提供一站式免运维的 Serverless 平台；最后，函数会随着流量进行创建和销毁，最终降低成本和资源的消耗。

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*fCwfTZVcEN8AAAAAAAAAAAAADrGAAQ/original)

## FaaS 使用场景

尽管 FaaS 具有许多优势，但并非所有场景都适合采用函数编程模式。下面介绍一些 FaaS 适用的普遍场景：

**1、BFF 的场景。** 即一些胶水代码（*对接多个接口、进行数据的组装和适配等*）。胶水代码的逻辑相对简单，但同时需求变化快、生命周期短。对应的应用场景如运营/营销活动等。活动结束之后，就不再有流量进入，也没有必要再进行代码和机器的维护。

**2、事件驱动的场景。** 例如音视频转码，用户上传文件触发任务，或者通过消息触发调度，或者业务上有明显的波峰和波峰的流量特征。

**3、中台型业务。** 例如算法平台的算子。算子计算是非常独立的业务逻辑，但是参与的研发人数非常多，逻辑相对来说不可控，需要有更高的隔离能力。

# FaaS 落地面临的技术问题

FaaS 技术产品的落地，可能会面临以下问题和挑战：

**性能问题：**

1、在传统的微服务架构下，开发者会为 RPC 调用性能进行了大量的优化；在 FaaS 的场景，也需要保证函数调用的性能。

2、弹性扩缩容的反应时效性。很多 FaaS 产品会采用弹性的模型去采集 CPU、QPS 并发等指标，再通过平台去计算指标，进而进行一些扩容和缩容的操作，时效性很低。

3、函数启动的速度。函数启动的速度在 FaaS 场景中至关重要，函数容器的创建和启动不仅仅是发布态的事情，而是一个数据面流量的依赖。

**安全问题：**

1、想要充分地利用计算资源以降低成本，其必要的前提就是有效地利用和隔离资源。

2、代码容器。用户的函数代码跑在容器里面，防止容器逃逸就是重中之重。

3、相较传统的编程模型而言，FaaS 的编程模型到底是如何屏蔽中间件以及云服务的干扰的呢？

# 蚂蚁 FaaS 技术架构 

蚂蚁在 FaaS 实践之初设定了 3 个 FaaS 技术架构实践的基本原则。

**原则 1：流量模型。** 蚂蚁的函数容器是随着流量进行创建和销毁的，而不是通过指标数据进行分析的弹性模型。

**原则 2：函数冷启动。** 尽管有 Warm Pool 或者 cache 技术可作选择，但为了最大程度降低成本和利用资源，蚂蚁将目标定为 100ms 以内的极致的冷启动。

**原则 3：安全隔离。** 用户的函数都跑在我们的容器里面，因此必须保证高水位的安全隔离特性。

其实，蚂蚁在实践 FaaS 技术架构时，有一个总的原则就是 **one request per instance**—极致的情况下，是创建一个函数容器去处理一个请求，类似编程模型创建一个线程去处理一个请求。在这里，创建函数容器就相当于创建一个线程，具有相似的快速、消耗低的优点，同时还有线程所不具备的安全隔离特性。

## 架构说明

### 组件介绍和功能说明

**函数网关**：负责对函数请求进行转发和控制，并为每一个请求发起一次容器调度任务。

**容器调度引擎**：负责对容器进行调度，维护容器的整个生命周期，并且可以对函数容器进行并发度和复用等状态控制，同时也负责管理整个集群的函数 Pod 资源池。（*函数 Pod 资源池是函数容器运行的一个环境，一个集群内会有 N 多个 Pod 资源池。* ）

**函数运行时**：函数运行时是 OCI 标准的实现，它负责快速地启动函数容器，并对容器的 runtime 进行有效的控制。

**函数容器**：函数容器可以理解为是函数运行时+runtime+用户代码的一个运行态，用户的函数代码就跑在函数容器中。

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*p0beQZf7qE8AAAAAAAAAAAAADrGAAQ/original)

### 数据面流量和调度流程说明

从上图可以看到，所有请求都会通过函数网关进入到函数集群，函数网关会发起一次调度任务：通过容器调度引擎 Scheduler 为这一请求快速分配一个 Pod 资源。然后网关就会把这个流量转发给这个 Pod 资源里面的节点网关，节点网关随即缓存对应的请求，并且等待函数容器启动。同时函数节点调度器会并发地创建函数容器并且为容器挂载函数代码。函数容器在启动完成之后，就会立刻作为一个客户端去节点网关上拉取请求，然后进行业务逻辑处理。

从上述流程中可以看到，蚂蚁 FaaS 场景中的 Serverless 有了第二层含义——no server（*没有 server*）。函数容器永远是作为一个 client 去处理请求。这样的方式从设计上就避免了对基础设施环境的依赖，同时减少了需要去打开一些网络端口、处理网络连接的损耗，也不需要像微服务应用那样去做一些 checkhealth 和 readliness 探针等之后才能进行注册，然后再进行服务发现和调用。

## 性能优化实践

### 函数网关

FaaS 函数网关采用 Go 语言进行编写，网络编程模型是通过一个 go routine 处理一个请求的同步编程，比较符合开发者的习惯。同时由于 Go 语言良好的垃圾回收机制和 GPM 调度模型，网关也有了不错的性能。但是随着业务的不断增长，整个网关在高并发下会出现毛刺现象，P99 长尾也比较严重。

基于以上情况，**新版的 FaaS 函数采用 Go 语言的 Gateway 运行在 C++ 语言的 Envoy 运行时上**。我们知道，越靠近 Linux 原生语言的方式性能越好。同时 Envoy 采用高性能的同步非阻塞网络编程模型，性能更优。所有的函数请求通过 Envoy 的网络接口进入，并且进行网络处理，然后通过 cgo 调用 Go 语言网关实现的 API 接口，这样 Gateway 网关就能在七层去做一些 filter 和路由的逻辑。最后将请求转发给对应的节点网关。节点网关会进行请求的缓存，同时可以收敛网关连接数。同时函数容器在 running 之后会通过 UDS 和节点网关进行交互。

通过上述优化，可以看到整个函数网关的吞吐上升，并且在同样吞吐的情况下，网关的 CPU 能够下降 50% 以上，而请求耗时下降 30% 左右。

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*MXSySoRPsJ4AAAAAAAAAAAAADrGAAQ/original)

### 容器调度引擎

HUSE 容器调度引擎，作为蚂蚁容器调度引擎的下一代架构，是专门面向高吞吐、低延迟、低成本、急速启动的 Serverleess 场景而设计的。目前应用在 FaaS 场景，以及一些 batch job、ODPS、大数据等场景。

为了能够实现高吞吐、低延迟等功能，HUSE 提供了如：多级自适应缓存、高速的协议通讯栈、智能包加载等性能优化，同时也支持高可用和自运维功能。

在性能上，可以看到 HUSE 容器调度引擎的性能数据，在全集群 1 万 QPS 吞吐压力下，整个 HUSE 的调度耗时 P50 基本上在 21ms 左右，P99 在 50ms 以内。相比于传统的容器调度引擎，有着数量级级别的提升。

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*orW8SqxQBxsAAAAAAAAAAAAADrGAAQ/original)

全集群 10000 QPS 调度吞吐下，HUSE 可以实现平均 21ms 的容器调度延迟  

### 100ms 函数容器冷启动 

最后也最重要的一部分，函数容器冷启动性能优化实践。虽然在服务端也做了一些优化，但是服务端整理的耗时本身也不过几毫秒，可优化空间很小。因此整个函数请求耗时的大头还是在函数容器的冷启动上。而关于函数容器冷启动，有四个方面可以进行性能优化。

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*UOiFRKX-y0EAAAAAAAAAAAAADrGAAQ/original)

第一，是**从 Warm P** **ool 模式变成完全的冷启动**。在并发的场景下，cache 技术本身也会占用 CPU 核数和计算资源，并不会有太多的性能提升。

第二，**容器资源实时分配改为缓存资源**。容器运行依赖一些资源，比如 IP，下载镜像，挂载 volume，设置 cgroup 和 namespace 等。这些资源分配都很慢，基本是分钟级别。而蚂蚁 FaaS 对容器所依赖的所有资源，只要不占用 CPU 和 Mem 的话，都会对其进行缓存，最终将资源分配的速度做到 0ms。

第三，传统的文件系统，创建、挂载以及访问都比较慢，蚂蚁 FaaS **采用 ROFS 的文件格式**，即 Read Only File System 的方式去进行优化。

第四，是**容器的启动方式**。标准的 OCI 容器的启动方式是 create+ start，启动速度很慢，而蚂蚁 FaaS 采用了 **checkpoint+restore** 技术进行性能优化。

#### 蚂蚁函数运行时介绍

容器运行时分为 runC、runD 和 runSC 等不同类型。runC 的安全隔离太差，runD 的启动速度太慢并且资源消耗太高，都不适合 FaaS 的场景。NanoVisor 是蚂蚁 runSC 安全容器。它是 Go 语言编写的安全容器，重构于开源的 gVisor 项目，是为云原生设计优化的、弹性安全容器。它也是轻量级 HyperVisor，进行 syscall interception 和 host syscall 加速。支持多个平台的运行，同时在性能方面尤为出色，可以支持一些火焰图性能分析，并且对 Go Runtime 进行优化，同时引入了高性能的用户态协议栈。目前应用在 FaaS 和一些增强安全的场景。

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*x4_qS5nV5YUAAAAAAAAAAAAADrGAAQ/original)

#### ROFS 文件系统优化 

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*GC4iRa3gfXMAAAAAAAAAAAAADrGAAQ/original)

上图中可以看到，一个容器会有两个进程， runSC Sandbox 进程和 Gofer 进程，容器镜像解压成 Rootfs 文件 bindmount 到 Gofer 进程中，用户函数代码也一样。Sandbox 需要访问函数和系统文件，需要经过 syscall 然后被 Gofer 进程拦截和控制。这种方式是为了保证安全，但是多了一个进程占用 CPU 核数，同时函数访问系统文件都需要进行 syscall ，拉低了速度。

ROFS 文件系统优化，就是将镜像和用户代码都编译成 ROFS 可以解析的格式，并且在沙箱外部打开。同时通过 mmap() 映射到沙箱进程中去。通过这样的方式，可以降低一半的 CPU 占用，同时所有文件的操作都变成了内存操作。不仅更加快速，而且更加安全。  

#### 容器启动方式优化 

一个标准的 OCI 容器会提供两个相关的接口：create 和 start。create 是根据容器镜像和配置文件创建容器运行的环境，对应 NanoVisor 容器沙箱的创建和应用程序内核的初始化；start 则是启动容器，对应 NanoVisor 容器沙箱内一号进程(*Nodejs Runtime*)的创建和启动。这个过程非常慢。

蚂蚁 FaaS 采用的是 checkpoint + restore 方式进行容器的恢复。首先按照传统方式创建、启动一个容器，等待容器内的 Nodejs Runtime 初始化完成之后，使用 checkpoint 技术对 Nodejs Runtime 进程和应用程序内核 sentry 进行状态、数据的保存。可以理解为对整个容器进行了一个内存快照，然后导出 checkpoint.img 的种子文件。这样的话，下一次有请求过来，直接从 checkpoint.img 种子恢复函数容器，也就是 restore 的过程。所以 restore 就是直接利用之前保存好的进程、内核状态和数据进行恢复，不再需要重新初始化 Nodejs Runtime。在恢复完成之后，Nodejs Runtime 就可以立刻进行业务逻辑处理。

通过以上的优化，目前 FaaS 函数容器落地的启动速度达到了 90ms 以内，额外的内存开销要小于一兆，这一提升相当可观。其中使用到的 NanoVisor 作为蚂蚁的第三代安全容器，始于安全。因此之后可以期待在性能提高和成本缩减上能够做到十倍甚至百倍的一个提升。

目前业界的类似产品中，AWS Lambda 函数的冷启动性能是比较好的：在 Node.js 运行时环境，平均冷启动时间为 200ms。

需要注意的是，此数据仅供参考，实际情况会受多种因素影响。

## 安全能力建设

性能优化的同时，安全功能也必须得到保障。以蚂蚁 FaaS 安全功能的建设为参考。函数容器(*runSC Sandbox*)是一个完全隔离的 runSC 沙箱环境，配置有 ACL 规则和虚拟的 veth pair 网卡。这个网卡是完全虚拟的，没有任何意义，而且在 FaaS 的场景下基础设施从设计上本身就是透明的。网卡的另一端插在 bridge 网桥设备上，并且通过 eBPF 进行高效的网络过滤、控制和转发。因此整个函数容器沙箱是完全隔离的。

### 纵向容器防逃逸 

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*sL-oTKdXefgAAAAAAAAAAAAADrGAAQ/original)

函数程序运行在虚拟化的 guest 态，它的系统调用会被 sentry（*运行在 Guest Kernel 态和 Host Kernel 态*) 也就是 NanoVisor 处理和响应。NanoVisor 运行在 Guest Kernel 态和 Host Kernel 态， 处理所有函数实例的系统调用，进行限制和管控。同时 NanoVisor sentry 本身的系统调用也会由 seccomp 进行限制。

FaaS 的场景基本隔离掉了基础设施信息，因此限制的接口会更多，攻击面会更小更安全。同时 NanoVisor 提供进程级别的 NanoVM 虚拟化技术，是一个轻量级的 VMM 管理，作为 host 上的一个内核模块，可以有效保障内核安全。  

### 横向安全能力 

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*CADWRYu8K9MAAAAAAAAAAAAADrGAAQ/original)

在横向控制上，NanoVisor 也做了很多能力建设，包括对所有的网络操作，包括 accept 一些端口、监听 DNS 请求等，都会进行网络审计。同时基于四层网络的五元组信息，都可以进行 ACL 控制。

### 免鉴权调用  

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*4v1mSo_cUQsAAAAAAAAAAAAADrGAAQ/original)

隔离之外，互通也值得关注。所有函数都通过函数网关进入，但是用户函数代码也需要访问其他的服务。一些场景比如函数代码里面可以访问其他的函数、访问云服务、访问 DB 和 OSS 等，或者访问公网，或者访问多云的 VPC 或者 IVS 的 VPC。

在这样的情况下，蚂蚁 FaaS 建设了对应的代理服务和网络设备，在四层为这些服务打开 ACL 控制，同时会在七层进行应用层的认证和授权。认证和授权的过程完全由 runtime 和代理服务实现，整个过程对开发者是完全透明和无感的。所以开发者也不需要设置 IP、账号/密码等信息，这样可以最大限制地屏蔽中间件、基础设施和多云的干扰。

# 体验 

有着这样的整体架构，再加上性能的优化实践和安全能力建设，蚂蚁 FaaS 的产品使用体验是什么样的呢？

**研发态的体验：** 从创建函数到编写函数到执行函数，基本上几秒钟就能够完成一个函数代码的上线。和传统应用模式对比鲜明，不需要去申请应用创建代码仓库，编写代码，编译打包等。曾经在 7 月的一次活动中，一个六年级的小朋友现场花 5 分钟，就完成了整个支付宝小程序+FaaS 云函数的开发。

**运维体验：** 由于整个蚂蚁 FaaS 的设计都是符合 Serverless 理念，所以这里看不到任何基础设施信息，但是可观测性相关的链路日志指标告警是完全具备的。作为 Serverless 的一站式免运维的平台，它能够自动集成监控和告警功能。

# 总结 

总之，蚂蚁 FaaS 的改变和优势在于：

-   从成本上来说，更小内存开销、更快启动速度。用户只用为流量付费，甚至只用为其函数代码的运行时间付费。（而运行时间可压缩至一个毫秒。）
-   更高保的安全隔离，能够进行免鉴权的调用。更快的研发速度、更高效的运维。
-   可以快速开发，没有复杂的流程，也没有碎片化的代码版本的困扰。
-   完全 Serverless 一站式免运维平台，能够集成监控和告警。

# 展望：FaaS + AI 开启编程新纪元 

蚂蚁 FaaS 对未来的展望包括对**极致性能**与**极致效能**的追求，将通过 fork 等技术去实现更高的性能，同时通过 AIGC 等智能化方式去达到极致研发效能。

## 极致性能 

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*Ztx3TL5_v90AAAAAAAAAAAAADrGAAQ/original)

在极致性能的实现中，蚂蚁目前正在调研的 fork 技术，函数冷启动时间已经达到了 3.5ms，稳定地跑进 10ms 以内。有着这样的启动速度，函数容器的创建跟创建一个线程一样又快、开销又低。同时 fork 技术还可以进行和 runtime、和 user code 的组合，让启动再加速。

## 极致效能 

追求极致效能的方式，就是 FaaS+AI。在文章最开始，可以看到 ChatGPT 生成的一段函数代码，只要十几行代码就可以完成一个业务逻辑的处理。所以 AIGC+FaaS 并非纸上谈兵，而是很有前景的，并且将会在不远的未来落地实践。AI+函数开发模式会结合一些低代码平台，并且利用蚂蚁集团的 NLP GPT/ Code GPT/ OpsGPT 等智能化平台，去演进和诞生一些新的产品形态和编程体验。想象未来 PD 或运营通过自然语言，和 AI 平台沟通，由 AI 平台生成一些格式化的 PRD，再输入到类似低代码/无代码的平台，平台一方面集成 AI 的代码生成能力，一方面集成 FaaS 的 Serverless 功能，这样将大大提高研发效能。

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*QgjqTJplFygAAAAAAAAAAAAADrGAAQ/original)

在过去的几年里，云原生技术已经改变了整个运维体验。但是直到今天，研发模式持续了二十多年，还是一成不变，开发者们还是在电脑面前苦哈哈地敲着键盘。希望未来 FaaS+AI 能开启编程新纪元，颠覆整个研发体验。

# FaaS 延伸支付宝云开发 

FaaS 技术体系在蚂蚁已经十分成熟，今年基于蚂蚁 FaaS 技术体系沉淀，打造了一款支付宝小程序云开发产品，欢迎大家了解试用。

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*fTDAS6IyYVsAAAAAAAAAAAAADrGAAQ/original)

欢迎大家扫描下方👇二维码，或搜索钉钉群号：*25600034150*，加入支付宝云开发钉钉支持群了解试用：

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*S_7nTb9cKq0AAAAAAAAAAAAADrGAAQ/original)

产品官网：[https://cloud.alipay.com/main/product/cloudbase](https://cloud.alipay.com/main/product/cloudbase)

# 推荐阅读

1、[如何看待 Dapr、Layotto 这种多运行时架构？](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247510516&idx=1&sn=eff21915cd0ac1a8c8e3f126b549a605&chksm=faa3462ecdd4cf38ab6ab0c7201902fb53d54cea4865f9b7d7cdcdc7eaa00cf354d8b05e5393&scene=21)

2、[Service Mesh 的下一站是 Sidecarless 吗？](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247517361&idx=1&sn=9a5947c97d2e6adffa3d066c4c599c7b&chksm=faa36b6bcdd4e27dac0d925ac6385de906b413944203519f7b9be627b0b708e87381f0bcad2b&scene=21)

3、[MoE 系列（七）｜ Envoy Go 扩展之沙箱安全](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247538840&idx=1&sn=62286a02933ffae587479586b39ce3c1&chksm=faa3b742cdd43e5427fd1b2a44e8ded825a413f867ed3eb62451c18e2a0ea9cfcf1d703c4513&scene=21)

4、[Seata-DTX｜分布式事务金融场景案例介绍](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247537905&idx=1&sn=a92e6aa6ac60fe23b6a21043777c7aa7&chksm=faa3bb2bcdd4323d2470977f715f383ec3bf10b610a7467ebb4ae6e6ddbb7cb2f8f87766de55&scene=21)
