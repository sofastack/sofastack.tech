---
title: "不得不说的云原生隔离性 | SOFAChannel#16 直播回顾"
author: "巴德"
authorlink: "https://github.com/bergwolf"
description: "本文根据线上直播整理，一起来看看云原生场景下容器隔离性的需求以及我们如何运用 Kata Containers 来提升容器的隔离性。欢迎阅读"
categories: "Kata Containers"
tags: ["Kata Containers","SOFAChannel"]
date: 2020-05-22T13:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1588146836458-cf1c9e0e-4c83-4780-8bc5-e524d4ee1f40.jpeg"
---

> <SOFA:Channel/>，有趣实用的分布式架构频道。
> 回顾视频以及 PPT 查看地址见文末。欢迎加入直播互动钉钉群 : 30315793，不错过每场直播。

![SOFAChannel#16](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1589955445177-9a5269dd-9ff0-49c6-8f99-7094cd12a0a4.jpeg)

本文根据 SOFAChannel#16 直播分享整理，主题：不得不说的云原生隔离性。

大家好，我是今天的讲师巴德，来自蚂蚁金服，主要从事 Kata 容器相关的开发，也是 Kata Containers 项目的维护者之一。今天我和大家分享一下云原生场景下容器隔离性的需求以及我们如何运用 Kata Containers 来提升容器的隔离性。

## 从 Kubernetes Pod 说起

在讲云原生隔离性之前，我们先来回顾一下历史。这张图是生产环境应用部署形态的变迁过程。从最左边的物理机上直接部署，到后来的虚拟化兴起，大家把应用部署在虚拟机里，再到 Docker 兴起，大家都把应用部署到容器里面，到现在 Kubernetes 成为主流，大家都把应用部署在 Pod 里面。

![Kubernetes Pod](https://cdn.nlark.com/yuque/0/2020/png/226702/1589955726455-56eb1e47-cacd-467c-ba00-2368af7c36fb.png)

我们看一下 Kubernetes 的一个基本架构，它本身是一个容器的编排系统，主要角色是管理和调度 Pod 以及相关的资源。今天我们主要关注的就是在节点上部署的 Pod，这也是 Kubernetes 资源调度的基本单位。

Kubernetes 官方对 Pod 的定义是一个应用的逻辑主机，其中包含了一个或者多个应用容器，这些容器在资源上是相对紧密的耦合在一起的。Pod 包含了这些容器共享的网络和存储以及如何运行这些容器的声明。Pod 中的内容总是放置在一起并且一同调度，并在共享的上下文中运行。

这段定义有些抽象，其目的是为了说明 Pod 是可以用不同的隔离技术来实现的。我们先来看一下一个经典的 Pod 实现，基于 Linux namespace 和 cgroups 做抽象的 Pod 实现。

![经典的 Pod 实现](https://cdn.nlark.com/yuque/0/2020/png/226702/1589955726774-1eb3d96a-12a8-48dd-97d5-9f7b9e925569.png)

这个示意图中，我们在一台主机上运行了两个 Pod，这两个 Pod 之间通过主机内核提供的 namespace 和 cgroups 能力来进行隔离。他们之间的所有 namespace 资源都是隔离的。然后在 pod 内部，不同容器之间的 IPC 和网络 namespace 是共享的，但是他们的 mnt/pid/user/uts namespace 又是相互隔离的。这就是一个经典的基于 Linux namespace 和 cgroups 来做隔离的 Pod 的实现。

对于这种 Pod 的实现，我们可以关注到这两个 Pod 虽然所有的 namespace 都是隔离的，但是他们共享了同一个内核。

## 共享内核引入的问题

那么，我们来看一下 Pod 共享同一个内核可能造成什么问题。

首先我们关注到的是安全问题。也就是说 Pod 中的容器应用会不会通过共享内核的漏洞逃逸出 Pod 的资源隔离？这里我们列了两个近几年的内核 bug，一个是 CVE-2016-5915，另外一个是 CVE-2017-5123，这两个 bug 都曾经造成容器应用通过触发内核 bug 获取宿主机 root 权限并逃逸出 Pod 资源隔离限制。

另外一个点是故障影响。这个好理解，如果一个 Pod 中的容器应用触发了一个严重的内核 bug，造成内核 panic，这时候同一台宿主机上的所有 Pod 都会被牵连。

![故障影响](https://cdn.nlark.com/yuque/0/2020/png/226702/1589955726692-b177efe4-5b01-4d86-9ffe-339c1264926b.png)

还有一个我们非常关注的点，是共享内核造成的内核资源竞争。同一个宿主机上的不同 Pod，实际上是不同的用户态进程的集合，这些用户态进程虽然在 namespace 上是相互隔离的，但他们还是会共享很多内核资源，比如调度器、某些内核线程或者对象。这种级别的资源共享会引入很多可以观测到的性能抖动，对在线业务的影响也很明显。

![共享内核造成的内核资源竞争](https://cdn.nlark.com/yuque/0/2020/png/226702/1589955726690-2a4e1844-f66a-41c1-81cf-bf8732bebe77.png)

如何避免共享内核造成的这些问题呢？大家最直接的想法就是，把 Kubernetes 装到虚拟机里不就可以更好的隔离起来了吗？如图所示，这本质上是通过增加一个 VM 间接层来解决隔离性问题。

![增加一个 VM 间接层来解决隔离性问题](https://cdn.nlark.com/yuque/0/2020/png/226702/1589955726729-6a3522a8-bf99-4567-a035-9d9649647999.png)

看起来问题解决了，不是吗？这时候我们就需要抛出计算机届大佬 David Wheeler 的一个名言，“计算机科学中的所有问题都可以通过增加一个间接层来解决，当然，除了间接层过多的问题”。

那么增加 VM 间接层的方案有什么问题呢？第一，同一个 VM 内的 Pod 之间还是共享内核的。第二，整个集群里出现了虚拟机和 Pod 两层调度系统。

## 上帝说，要有光；我们说，要有 Kata

面对这些问题，我们要怎么做呢？我们要部署 Kata 容器 ：)

Kata 容器的一个基本思路是，用虚拟机来作为 Pod 的一种隔离方式。我们把 Pod 中的多个容器资源，放到同一个虚拟机里面，利用虚拟机来实现不同 Pod 独占内核的目的。而 Pod 仍然是 Kubernetes 的基本调度单位，集群里也不会有虚拟机和 Pod 两层调度系统。

![Kata 容器](https://cdn.nlark.com/yuque/0/2020/png/226702/1589955726702-387444e3-5a64-4bfa-af28-eac94cad8a9c.png)

我们简单介绍一下 Kata Containers 这个项目，这是 Openstack 基金会管理下的开放基础设施顶级项目。Kata Containers 的 slogen 是 The speed of containers, the security of VMs。其设计是基于虚拟机完美符合 Pod 抽象这个理念，为用户提供强隔离，易用的容器基础设施。

Kata Containers：[https://github.com/kata-containers/kata-containers](https://github.com/kata-containers/kata-containers)

这是 Kata Containers 项目的发展历史概要。在 2015 年的五月，一帮国内的创业者(就是我们) 和 Intel 的同学们分别独立发布了两个叫 runV 和 Clear Containers 的虚拟化容器项目，这就是 Kata Containers 的前身。这两个项目互相有很多交流，在分别独立发展了两年半之后，在 2017 年底，合并成了 Kata Containers 项目，并把这个项目捐给 Openstack 基金会管理，这也是 Openstack 基金会的第一个 Pilot 项目，有一些探索转型的味道。在去年的四月，Kata Containers 被 Openstack 基金会认可为其第二个顶级项目，在这之前的十多年里，Openstack 基金会都只有 Openstack 一个顶级项目。

目前 Kata Containers 的稳定版本发布到了 1.10.0，而且 2.0 也正在紧锣密鼓地开发中。

![Kata Containers 发展历程](https://cdn.nlark.com/yuque/0/2020/png/226702/1589955726693-75a2119a-ed23-4cc3-b45f-941d4c78e0b3.png)

我们再简单介绍下 Kata Containers 的架构。左边蓝色部分是 Kata Containers 对接的上游组件，也就是 Kubernetes 通过 CRI 接口访问 CRI daemon，这里是用 containerd 做展示。 Containerd 通过一个 Shim API  来访问 Kata Containers。右边的就都是 Kata 的组件了。对每一个 Pod，我们有一个名叫 containerd-shim-kata-v2 的服务进程，这个服务进程会负责基于虚拟机的 Pod 的生命周期管理。最后边的 Pod Sandbox 就是我们基于虚拟机来实现的一个 Pod 抽象。在里面我们要运行一个叫 kata-agent 的服务进程，来负责 Pod 内容器的生命周期管理。

![kata-agent 的服务进程](https://cdn.nlark.com/yuque/0/2020/png/226702/1589955726706-9917fa34-20de-447e-b2db-86723cf75071.png)

## Kata 容器特性大放送

介绍了 Kata 的架构，我们来看一下 Kata 容器有哪些特性。作为一个中立项目，Kata 容器支持了多种体系结构，有 x86、arm、powerpc、s390x 等。Kata 也支持多种运行管理虚拟机的 hypervisor，包括 Qemu、Firecracker、Cloud-hypervisor、ACRN 等。在网络联通方面，Kata 支持多种网络模型。管控平面上，Kata 也支持多个管控通道，包括 Docker、containerd、CRI-O、podman 等。

为了做到 the speed of containers, Kata 的一个重要特点就是面向云原生的虚拟化。我们接下来重点介绍一下这个方面。

首先就是通过 DAX 和 模拟 nvdimm 设备，让同一台宿主机上的不同 Pod 之间只读共享了同一份 guest 镜像。这样 guest 镜像的内存开销被降到最低。

![通过 DAX 和 模拟 nvdimm 设备](https://cdn.nlark.com/yuque/0/2020/png/226702/1589955726721-52636590-1b9d-40d8-93b9-1814bd128b0d.png)

其次我们扩展了 QEMU 的本地迁移能力，通过只读共享同一份 guest 初始内存，实现了一个叫 VM template 的功能。通过 VM tempalte，我们在不破坏虚拟机独占内核的隔离性的前提下，实现了同一台宿主机上的所有 Pod 只读共享同一份 guest 内核以及 kata-agent 运行时内存。这一方面极大降低了 Kata Containers 由于引入虚拟化造成的内存额外开销，也让极速启动新的容器成为可能。我们的测试显示 VM template 能够让我们在 500ms 以内启动一个 Kata 容器，这个速度完全可以和基于 Linux namespace 的经典容器媲美。

![VM template](https://cdn.nlark.com/yuque/0/2020/png/226702/1589955726717-af26aa31-02ab-4678-b79f-b5bf6f6d2cb6.png)

在我们发布了 Kata Containers 之后，Redhat 的同学为 Kata 容器特别设计了一个叫做 virtiofs 的 virtio 设备类型。通过 virtiofs，Kata Containers 能够更安全、快速、兼容地访问宿主机上的文件资源。

![ virtiofs](https://cdn.nlark.com/yuque/0/2020/png/226702/1589955726752-8e4f1d99-16f4-4465-94b7-e77853178dd7.png)

同时，Intel 是一个虚拟化大厂，他们为 Kata Containers 提供了一个面向云原生的轻量化 VMM，Cloud-hypervisor。这是一个用 Rust 语言重写的 VMM，基于了开源项目 rust-vmm。而 rust-vmm 也是 Google chromium 的 crosvm 和 AWS Fargete 的 Firecracker 共享的基础库。相较于面向桌面的 crosvm 和面向函数计算的 Firecracker，Cloud-hypervisor 更专注于容器场景，是一个为容器而生的轻量化 VMM。

## 云原生的 Kata 容器

介绍了 Kata 容器的主要特性，我们再来看一下 Kata 容器是如何融入到 Kubernetes 生态的。

首先，我们的第一届架构委员会成员，Google 的 Tim Allclair 同学在 Kubernetes 中引入了 runtimeclass 特性。这个特性允许用户定义 runtimeclass 资源，用来定义 Pod 可以使用的运行时抽象，比如 runc 或者 Kata。然后用户可以在 Pod spec 里显示指定一个 Pod 应该用哪个 runtimeclass 来运行。

![Kata 容器是融入到 Kubernetes 生态](https://cdn.nlark.com/yuque/0/2020/png/226702/1589955726796-3bd9a774-a753-4d12-8a09-ff9701527c4e.png)

在 runtimeclass 之后，Kubernetes 社区又引入了 Runtime Class 调度，让节点暴露自己支持的 runtimeclass，从而让调度器在调度中同时考量 Pod spec runtimeclass 要求和节点的支持能力。

![引入 Runtime Class 调度](https://cdn.nlark.com/yuque/0/2020/png/226702/1589955726814-c5f1c5f9-b54f-4ec3-b2ed-d54350a7793a.png)

在这之后，Kata Containers 的另一位架构委员会成员 Eric，又给 Kubernetes 引入了一个叫 PodOverhead 的特性。无论是用 Linux namespace 还是虚拟机来做为 Pod 的实现，我们都不可避免地需要一些额外的资源开销。在 PodOverhead 特性之前，这部分开销一直是被遗忘了的，这也造成了 Kubernetes 调度器在做调度决策的时候，实际上并没有掌握准确的资源信息。而 PodOverhead 允许用户在 runtimeclass 资源上，附加一个 Pod 自身开销的声明。这样调度器在调度的时候会算上这部分开销，并在分配 Pod 资源的时候把这些开销分配给 Pod，同时在决策是否淘汰 Pod 的时候也考虑上这些开销。可见这是一个让 Kubernetes 调度器作出更好的调度策略的特性。

## 回顾一下

今天我们介绍了 Kubernetes Pod 的概念和实现，讨论了经典场景下 Pod 抽象共享内核造成的问题，然后我们介绍了 Kata Containers 的架构和特性，以及 Kubernetes 为更好地支持 Kata Containers 引入的特性。

以上就是本期分享的所有内容。下面是一些 Kata Containers 的相关资源链接，欢迎了解试用 Kata，也欢迎大家通过任何一种方式和 Kata 社区建立连接。谢谢！

- Kata 官网：[https://katacontainers.io/](https://katacontainers.io/)
- GitHub: [https://github.com/kata-containers](https://github.com/kata-containers)
- IRC freenode:#kata-dev
- Slack Invite (bridged to IRC): http://bit.ly/katacontainersslack
- Twitter: @katacontainers
- Mailing-list: lists.katacontainers.io

### 本期视频回顾以及 PPT 查看地址

[https://tech.antfin.com/community/live/1197](https://tech.antfin.com/community/live/1197)
