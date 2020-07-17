---
title: "Kubernetes: 微内核的分布式操作系统"
author: "沈凋墨"
authorlink: "https://github.com/sofastack"
description: "本文将专注于微内核（microkernel）这个概念及其对 Kubernetes 架构的影响分享。"
categories: "Kubernetes"
tags: ["Kubernetes"]
date: 2020-07-16T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1594976696343-4492553e-5423-44c2-a321-835ffb296481.jpeg"
---

如今，Kubernetes 已经成为分布式集群管理系统和公有云/私有云的事实标准。实际上，Kubernetes 是一个分布式操作系统，它是 Google 在分布式操作系统领域十余年工程经验和智慧的结晶，而 Google 一直以来都管理着世界上最大的分布式集群，在分布式操作系统领域的研究和认识领先于全世界。因此，2014年发布的 Kubernetes 能在短短几年时间内就超越了诸多前辈，大获成功。

作为分布式操作系统，Kubernetes（包括其前代产品 Google Borg）的出现远远晚于 UNIX、Linux、Windows 等著名的单机操作系统，Kubernetes 架构设计自然地继承了很多单机操作系统的珍贵遗产，微内核架构就是这些遗产中最重要的一份。在本文接下来的部分，我们将专注于微内核（microkernel）这个概念及其对 Kubernetes 架构的影响。

## 什么是微内核？

在介绍微内核的时候，我们有必要同时回顾一下单机操作系统的历史，以理解其价值所在。本章中以「操作系统」指代「单机操作系统」。

### UNIX 的兴起

电子计算机诞生之后，在上个世纪70年代以前，出现过许许多多的操作系统，DOS、OS/360、Multics 是其中的知名代表，这是操作系统领域的拓荒时代。20年来的拓荒孕育出了伟大的成果：随着 CPU 技术的发展，UNIX 于1969年诞生了，这是一个真正意义上的分时操作系统。

![UNIX](https://cdn.nlark.com/yuque/0/2020/png/226702/1594895064094-3e8cd731-db97-4a3a-8276-0c07ffb402bc.png)

图片来源：维基百科

借助新的 CPU 技术的支持，UNIX 将软件系统划分为**内核（kernel）**和**用户态程序（userland programs）**两部分。内核是一组中断处理程序的集合，把硬件的能力封装为操作系统功能调用（system calls），用户态程序通过系统调用使用硬件功能，用户态程序运行于各自的进程中，所有用户态进程都共享同一个内核，每当系统调用或中断发生，UNIX 便陷入（trap）内核，内核执行系统调用，与此同时，内核中的分时调度算法将决定把 CPU 交给哪个进程，并管理进程的上下文切换。另外，UNIX 把（几乎）所有硬件都封装为文件。UNIX 还提供了一个特殊的用户态程序 shell，供用户直接使用系统，通过内核提供的进程间通信能力，shell让 用户可以把一系列应用程序组合起来，处理复杂的需求，作者称这个设计思想为「KISS」（Keep It Simple and Stupld）。UNIX 的所有设计思想在当时是都是非常了不起的创举。

UNIX 不但自身对业界产生了巨大的直接贡献，还成为所有现代操作系统的蓝本，两位作者 Ken Tompson 和 Dennis Ritchie 因此荣获1983年度的图灵奖。

UNIX 诞生于贝尔实验室，该实验室属于美国国家电信电报公司（AT&T），见识到 UNIX 的强大威力之后，AT&T 做出了一个看似无私的决定：将 UNIX 开源（初期只对大学开源），这使得所有现代操作系统得以诞生。虽然 AT&T 最终被分拆，辉煌不再，但这个决定对人们的贡献绵延至今。在21世纪20年代的今天，无论是 MacOS、Windows、Linux，都直接受到 UNIX 的影响，而 iOS 来自 MacOS，Android 来自 Linux，因此 UNIX 的灵魂仍然活在每个人的手机中、活在每个手机 App 后台的服务中。

此外，UNIX 诞生之时，还附送了一项比操作系统本身价值更大的副产品：Dennis Ritchie 为开发 UNIX 设计了C语言，C语言成为了所有流行的现代编程语言的主要设计来源，不仅如此，C语言在其诞生近40年后的今天，仍然是最重要的编程语言之一。

值得一提的是，当时 UNIX 的主要开放对象是伯克利、卡内基梅隆等研究型大学，文理学院规模较小，没有研究生项目，不属于 AT&T 的主要开放目标，因此 Olivet College 毕业的一位小哥未受到 UNIX 思潮的影响。这位名叫 David Cutler 的软件天才于1975年在 DEC 设计了 VMS 操作系统，VMS 和最初的 UNIX 一样，运行在 PDP-11 上，但并不是基于 UNIX，而是独立设计的。VMS 在业界没有掀起大浪，以兼容 UNIX 告终。后来 David Cutler 离开 DEC，加入微软，在那里谱写了属于他自己的传奇。有趣的是，乔布斯也曾在文理学院就读，看来美国文理学院的学生是不走寻常路的。

### 微内核的兴起

UNIX「一切皆文件」的设计带来了用户程序设计的很多便利，但它要求所有对硬件的封装都要在内核态，因此内核中模块的 bug 会让整个系统受到影响，比如说，如果某个设备驱动有内存泄漏，所有使用该设备的用户态进程都会有内存泄漏，如果某个内核模块有安全漏洞，整个系统的安全性将不再可控。

为了解决这类问题，上个世纪70年代，操作系统研究者们开始发展「微内核」的概念，微内核的本质是让操作系统的内核态只保留内存地址管理、线程管理和进程间通讯（IPC）这些基本功能，而把其它功能如文件系统、设备驱动、网络协议栈、GUI 系统等都作为单独的服务，这类服务一般是单独的用户态 daemon 进程。

用户态应用程序通过 IPC 访问这些服务，从而访问操作系统的全部功能，如此一来，需要陷入内核的系统调用数量将大大减少，系统的模块化更加清晰。同时系统更加健壮，只有内核中的少量系统调用才有权限访问硬件的全部能力，如设备驱动的问题只会影响对应服务，而不是影响整个系统。和 micro kernel 相对，UNIX 的设计被称为 monolithic kernel。

UNIX 开放后，AT&T 继续着版本迭代，而各大学基于 AT&T 的 UNIX 开发了很多新的操作系统内核，其中较为知名的有：

1. BSD，monolithic，由伯克利的传奇人物 Bill Joy 于1974年发布（据说 Bill Joy 花三天便完成了 BSD 内核的第一个版本开发，Bill Joy 的作品还包含第一个 TCP/IP 协议栈、vi、Solaris、SPARK 芯片等等）。该内核对业界影响非常之大，后来发展为 FreeBSD、OpenBSD、NetBSD 等分支。现代操作系统如 Solaris、MacOS X、Windows NT 对其多有借鉴。
1. Mach，微内核，由卡内基梅隆大学于1984年发布，主要作者是 CMU 的两位研究生 Avie Tevanian 和 Rick Rashid。该内核对业界影响也很大，GNU Hurd、MacOS X 对其多有借鉴，但该项目本身以失败告终。
1. MINIX，微内核，由阿姆斯特丹自由大学（Vrije Universiteit Amsterdam）的 Andrew Tanenbaum 教授于1987年发布。无数计算机系学生通过 MINIX 及其配套教材掌握了操作系统的设计原理，Linux 的初始版本就是基于 MINIX 复刻的。MINIX 虽然著名，但主要用于教学，从未在工业界获得一席之地。

### 微内核的沉寂

从上世纪90年代至本世纪10年代，UNIX 和 VMS 的后裔们展开了一场混战，从结果来看，微内核的概念虽然美好，但现实非常残酷：

1. MINIX 仅限于教学，而基于 MINIX 设计的 Linux 是 monolithic 系统，反而大获成功。Mach 对业界影响深远，但本身并未得到大规模应用，其继承者 GNU Hurd 一直在开发中，从未能应用。
1. Windows 的 NTOS 内核是 David Cutler 基于他原来在 DEC 独立设计的系统 VMS 设计的（VMS 和 UNIX 无关）。NTOS 借鉴了微内核的思想和 BSD 的一些代码，但最终 David Cutler 决定将所有服务（如 GUI）都放到内核态而非用户态，因此 Windows NT 在软件架构上和微内核一致，而实际运行和 monolithic 内核一致，被称为 hybrid kernel。
1. MacOS X 基于 NextStep OS 设计，NextStep 是 Avie Tevanian 设计的，Avie Tevanian 是 Mach 的主要设计者，博士毕业后，盖茨和乔布斯都邀请过他，他去了 Next，他在 CMU 的好友 Rick Rashid 则去微软作为 David Cutler 的首席助手，据说 Avie Tevanian 在 Next 每天用计算器算自己没去微软而损失的股票增值。跟乔布斯回到苹果后，Avie 基于 NextStep 和 BSD 的代码设计了 OS X，巧的是，OS X 也采用了 hybrid kernel 的架构，最终大获成功，还能在 PowerPC 和 x86 两种指令架构间无缝切换。

在几位操作系统技术巨擎中，除 Linus Torvalds 外，无论是 David Cutler 和 Andrew Tanenbaum，还是 Avie Tevanian 和 Rick Rashid，都是微内核架构的领袖级人物，但最终他们都没有将微内核彻底落地，这是有原因的。

微内核操作系统访问系统服务的效率比 monolithic 操作系统要低得多，举例而言，在 Linux 中，系统调用（比如 open）只要陷入内核一次，也就是先切换 CPU 到高权限模式，再切回低权限模式。如果在一个微内核操作系统中，用户调用 open 就需要先拼装一条 IPC 请求消息，发送给对应的文件系统服务进程，随后从文件系统服务进程获取IPC响应消息并解包，拿到调用结果，这样一来，消息带来的数据拷贝和进程上下文切换都会带来很多开销。消息需要拷贝是因为用户态进程间不能相互访问内存地址，而内核的代码可以访问任何用户态进程的任何内存地址。
正是因为性能原因，OS X 和 Windows 都选择了 hybrid kernel 的架构，NTOS 甚至在内核中集成了 GUI 子系统，以带来更好的用户体验。

简单来说，在电脑性能不佳的情况下，我们会发现 Windows 的鼠标箭头更加“跟手”，即使系统接近死机，Windows 系统的鼠标箭头仍然可以活动。Windows XP 能在 Windows 98 这样「珠玉在前」的上代产品后获得更大的成功，和 NTOS 对性能的密切关注是分不开的，相比之下，苹果固然在1980年代中期就有初代 Machintosh 这样的壮举，但因为乔布斯无法说服销售团队换一根更强的内存条，因此初代 Mac 的性能较差，运行程序非常之慢，未能获得应得的蓝海成功。

## Kubernetes 和微内核

性能问题对单机操作系统来说可能是至关重要的，但对分布式操作系统并非如此，分布式操作系统作为「幕后功臣」，不需要直接面对用户，而单机性能上的小小损失可以用更多机器来弥补，在这个前提下，更好的架构往往更加重要。

### Borg 的诞生

在单机操作系统大战快要分出胜负之时，Google 这家行业新宠正准备 IPO，用现在的话来说，Google 那时是一家「小巨头」：已经初露锋芒，不容小觑，但巨头们彼时正陷入战争泥潭，无暇顾及之。2003年，为了更好地支持新版本的搜索引擎（基于MapReduce），使其能服务好亿万用户，Google 开始了大规模集群管理系统的开发，这个系统叫做 Borg，它的目标是管理以万台为单位的计算机集群。虽然刚开始只有3、4个人的小团队，但 Borg 还是跟上了 Google 的飞速发展，证明了它的潜力，最终 Google 的全部机器都由 Borg 管理，MapReduce、Pregel 等著名系统都建立于 Borg 之上。从操作系统的角度来看，Borg 是一个 monolithic 系统，任何对系统的功能升级都需要深入到 Borg 底层代码来修改支持。在 Google 这样成熟的技术型公司中，有很多优秀的工程师，因此这个问题在内部系统中并不算严重。但如果是公有云，必然要接入许多第三方应用的需求，一家公司的工程师团队再强大，也无法把业界所有其他系统都接入 Borg，这时系统的可扩展性将非常重要。

在2010年左右，随着 Google 中国部门的撤销，很多优秀的 Google 工程师加入了 BAT 等中国公司，其中一部分加入了腾讯搜搜。这些前 Googler 加入腾讯后，复刻了 Google 的许多系统，技术上也很出色，其中 Borg 的复制品叫做 TBorg，后来改名为 Torca。Torca 在搜搜的广告业务中起到了非常重要的作用，后来由于腾讯业务调整，搜搜与搜狗合并，Torca 在腾讯内部失去用户，逐渐停止了维护。

在 Borg 上线几年后，Google 意识到 monolithic 架构的问题和瓶颈，于是又一支小团队开始了 Omega 系统的研发。Omega 系统继承的是微内核的思想，新的功能升级几乎不需修改底层代码就能完成，它比 Borg 更加灵活，有更好的伸缩性。但因为当时 Google 的全部系统已经搭建在 Borg 之上了，由于 Borg 的 monolithic 特性，MapReduce 等系统都紧密绑定到 Borg 核心代码，不但无缝迁移到 Omega 系统是不可能的，迁移还要花巨大的人力、时间和试错成本，因此即使核心成员坚持不懈地推动，Omega 系统在 Google 仍未能取得成功。

有趣的是，Omega 项目的核心成员之一 Brendan Burns 的职业轨迹和操作系统领域的大前辈 David Cutler 有不少相似之处。

1. 他们同样毕业于文理学院：David Cutler 毕业于 Olivet College，Brendan Burns 毕业于 Williams College。
1. 他们同样在毕业后加入了一家传统行业的巨头：David Cutler 毕业后加入杜邦，Brendan Burns 毕业后加入汤姆森金融。
1. 正如教父所说，一个男人只能有一种命运，Cutler 和 Burns 在这两家传统巨头学会了写代码，也许就是在那时，他们发现了自己在软件上的天分，发现了自己的命运是构建新一代操作系统。因此他们同样在第二份工作中选择了当时最炙手可热的科技巨头：David Cutler 加入 DEC，Brendan Burns 加入 Google。
1. 他们同样在微软到达了职业生涯的顶峰：Brendan Burns 现如今已是微软的 Corporate VP，而 David Cutler 老爷子早已是微软唯一的 Senior Technical Fellow，据传微软甚至有条规定，Cutler 的技术职级必须是全公司最高的，任何人升到 Cutler 的 level，Cutler 就自动升一级。

### Kubernetes 的诞生

在单机操作系统时代，hybrid kernel 盛行一时，这证明了微内核在软件架构上的成功，但因为性能问题，又没有任何一个成功的内核采用「纯粹的」微内核架构，因此微内核从实用角度上来说是失败的。

和单机操作系统时代中微内核架构的失败原因不同，Omega 在 Google 公司内部的失败和性能问题无关，只是历史遗留问题的影响。对开源社区和大部分公司来说，尚无能和 Borg 相媲美的系统，也没有历史负担，因此几年后，Google 决定开源 Omega 这一超越 Borg 的新一代分布式操作系统，将其命名为 Kubernetes。

为了介绍清楚 Kubernetes 和微内核的关系，以及微内核架构为 Kubernetes 带来的优势，这里有必要引入一些技术细节。

上文中提到，单机操作系统的系统调用需要「陷入」内核，所谓的陷入（trap）也叫做中断（interrupt），无论内核是什么类型，单机操作系统都需要在启动时将系统调用注册到内存中的一个区域里，这个区域叫做中断向量（Interrupt Vector）或中断描述符表（IDT，Interrupt Descriptor Table）。当然，现代操作系统的中断处理非常复杂，系统调用也很多，因此除了IDT之外，还需要一张系统调用表（SCV，System Call Vector），系统调用通过一个统一的中断入口（如 INT 80）调用某个中断处理程序，由这个中断处理程序通过 SCV 把系统调用分发给内核中不同的函数代码。因此 SCV 在操作系统中的位置和在星际争霸中的位置同样重要。对微内核架构来说，除了 SCV 中的系统调用之外，用户态服务提供什么样的系统能力，同样需要注册到某个区域。

与此类似，Kubernetes 这样的分布式操作系统对外提供服务是通过 API 的形式，分布式操作系统本身提供的 API 相当于单机操作系统的系统调用，每个 API 也需要能够注册到某个位置。对 Kubernetes 来说，API 会注册到 ectd 里。Kubernetes 本身提供的相当于系统调用的那些 API，通过名为 Controller 的组件来支持，由开发者为 Kubernetes 提供的新的 API，则通过 Operator 来支持，Operator 本身和 Controller 基于同一套机制开发。这和微内核架构的思想一脉相承：Controller 相当于内核态中运行的服务，提供线程、进程管理和调度算法等核心能力，Operator 则相当于微内核架构中 GUI、文件系统、打印机等服务，在用户态运行。

![Kubernetes](https://cdn.nlark.com/yuque/0/2020/png/226702/1594895096915-fc137eb6-3e21-4d97-af97-a1ff409f3340.png)

图片来源：[https://mapr.com/products/kubernetes/](https://mapr.com/products/kubernetes/)

因此，Kubernetes 的工作机制和单机操作系统也较为相似，etcd 提供一个 watch 机制，Controller 和 Operator 需要指定自己 watch 哪些内容，并告诉 etcd，这相当于是微内核架构在 IDT 或 SCV 中注册系统调用的过程。

以 Argo 为例，Argo 是个 Operator，提供在 Kubernetes 中执行一个 DAG 工作流的能力。用户在使用 kubectl 命令提交 Argo 任务时，实际是让 kubectl 将 Argo 的 yaml 提交给 Kubernetes 的 API Server，API Server 将 yaml 中的 Key-Value 数据写入 etcd，etcd 将会提醒那些正在 watch 指定 Key 的服务。在我们的例子中，这个服务也就是 Argo。这正像是微内核架构里用户进程请求用户态服务的过程。

Argo 得到 etcd watch 的 http 请求，去 etcd 读出 yaml 中的数据并解析, 然后知道要去启动什么容器，并通过 API 要求 Kubernetes 启动相应的容器。Kubernetes scheduler 是一个 Controller，在收到启动容器请求后，分配资源，启动容器。这是微内核架构中用户进程通过系统调用启动另一个进程的过程。

当然，Kubernetes 和单机操作系统也有不同之处：Kubernetes 没有明确的「陷入」过程，而微内核架构的单机操作系统在访问系统调用时需要陷入，在访问用户态服务时则不需要陷入。但是，Kubernetes 可以为不同的服务设置不同的权限，这一点在一定程度上类似于单机操作系统中内核态和用户态的 CPU 权限的区别。

微内核在架构上的优势在 Kubernetes 中显露无遗：在 Borg 中，开发者想要添加新的子系统是非常复杂的，往往需要修改 Borg 底层代码，而新系统也因此会绑定到 Borg 上。而对 Kubernetes 来说，开发者只需要基于 Kubernetes 提供的 SDK 实现一个 Operator，就能够添加一组新的 API，而不需要关注 Kubernetes 的底层代码。Argo、Kubeflow 都是 Operator 的应用。任何已有软件都可以方便地通过 Operator 机制集成到 Kubernetes 中，因而 Kubernetes 非常适合作为公有云的底层分布式操作系统，正因如此，Kubernetes 在2014年年中发布，经过2015年一年的成长，在2016年便成为业界主流，对于没有历史负担的公司，也将 Kubernetes 作为内部云的底层系统使用。

## 尾声

在这篇文章中，我们介绍了单机操作系统的发展简史，介绍了微内核架构在这个历史进程中从兴起到衰落的过程，也介绍了微内核架构在 Kubernetes 中重新焕发生机的过程。总的来说，显著超前于时代的技术虽然未必能在被提出的时代取得成功，但一定会在多年后，在时代跟上来之后，拿回属于自己的荣耀。微内核架构在单机操作系统的时代和云计算的时代的不同遭遇证明了这一点，深度学习在低算力时代和高算力时代的不同遭遇也证明了这一点。

值得一提的是，在 Kubernetes 之后，Google 推出了 Fuchsia 作为 Android 可能的替代品。而 Fuchsia 基于 Zircon 内核开发，Zircon 基于 C++ 开发，正是微内核架构。在算力井喷的现代，除了在分布式操作系统领域，微内核能否也在手机/物联网操作系统领域复兴，让我们拭目以待。

_本文内容主要基于王益最近给_[SQLFlow](https://github.com/sql-machine-learning/sqlflow)_ 和_[ElasticDL](https://github.com/sql-machine-learning/elasticdl)_ 团队的分享。沈凋墨和章海涛、武毅、闫旭、张科等一起总结。这个总结解释了 SQLFlow 作为一个 Kubernetes-native 的分布式编译器的设计思路基础，也解释了 ElasticDL 只针对 Kubernetes 平台做分布式 AI 的原因。本文作者中包括百度 Paddle EDL 的作者。Paddle EDL 是基于 PaddlePaddle 和 Kubernetes 的分布式计算框架，于 2018 年贡献给 Linux Foundation._
