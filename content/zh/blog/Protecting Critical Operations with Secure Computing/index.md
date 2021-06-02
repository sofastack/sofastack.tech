---
title: "用安全计算保护关键业务"
author: "顾宗敏"
authorlink: "https://github.com/sofastack"
description: "用安全计算保护关键业务"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2021-06-01T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*TSIGQ7MiwSAAAAAAAAAAAAAAARQnAQ"
---

### 什么是安全计算？   

Linux 基金会旗下的安全计算联盟对安全计算下了一个定义：
>Confidential Computing protects data in use by performing computation in a hardware-based Trusted Execution Environment.
Confidential Computing Consortium

在这个定义中强调了这么几点：

1.安全计算保护的是运算过程中的数据安全;
2.安全计算需要借助硬件的能力。

下面就对这两点做一个阐述：
在云计算场景，我们可以把云计算简化为三个部分：数据的传输，数据的运算和数据的存储。

>![](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*nBdvRIoRVXEAAAAAAAAAAAAAARQnAQ)

这个三个部分的安全解决方案的完整度是有差别的。在数据的传输环节，业界有很完整的安全标准和实现比如 SSL， TLS。在数据存储环节，密码学也提供了非常好的解决方案，我们可以将数据用恰当的方式加密以后保存，防止在存储环节泄密。在数据的运算环节，还没有和其他两个环节那样完整的解决方案。安全计算正是以解决这个问题为目标的。

### 安全计算是如何实现的呢？    

我们以英特尔的 SGX 技术为例来看一下具体的技术方案。

>![](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*VXtTSJ-O9goAAAAAAAAAAAAAARQnAQ)

英特尔的 SGX 技术是将 CPU 作为运算的信任起点，在应用程序中构建安全的运算环境（飞地）。从计算机发明的那一天起，我们就假设 CPU 会按照软件的指令正确地执行，只是没有强调这一点。在软件大发展的今天，各种软件在一台硬件上协作运行，整个生态越来越复杂，恶意软件也出现了。为了防止恶意软件的破坏，CPU 为需要保护的应用隔离出一个独立的飞地环境。飞地外的应用既不能观察也不能修改飞地中的代码和数据，从而保证了飞地中的数据安全。CPU 对飞地的保护非常强，即使是拥有高特权的操作系统和虚拟化管理软件也无法突破这种保护。事实上，不仅仅可以防软件的攻击，哪怕是外围硬件提供者（比如：主板制造者，内存提供者）都无法突破这个保护。

英特尔 SGX 是目前最成熟的安全计算产品，但并不是唯一的安全计算产品。其他硬件厂商如 AMD，ARM，Nvidia 都在推出安全计算产品。所有这些产品都是软硬件一体的解决方案，总结起来有以下这些特点：

>![](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*qhNzR7MAOYsAAAAAAAAAAAAAARQnAQ)

在了解了安全计算的概念后，介绍一些安全计算的典型场景：

>![](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*kZLuQLWj6fIAAAAAAAAAAAAAARQnAQ)

有了安全计算环境，用户可以放心地将应用放到共有云计算环境中，计算中用到的数据和计算的结果都可以加密传输。这样可以统一基础设施的架构，避免复杂的混合云部署方式。

>![](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*snJnSIFT1-oAAAAAAAAAAAAAARQnAQ)

云上的数据交易和数据服务也成为了可能。数据拥有方和算法提供方可以分别提供数据和算法至安全计算平台完成计算而不用担心机密泄露的问题。

>![](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*9bpOT6JaC5MAAAAAAAAAAAAAARQnAQ)

安全计算也可以促成更多的数据合作。各方数据可以在一个安全的环境中做融合运算，让数据产生更大的价值。

>![](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*8iw9R6EK8n0AAAAAAAAAAAAAARQnAQ)

在边缘计算场景中，计算节点部署在非常复杂的环境中，机器不受控。安全计算可以有效地保护用户数据和隐私。

安全计算这么多的应用场景，为什么还没有看到大规模部署呢？这是因为安全计算目前还有一个非常大的短板：易用性不强。具体表现为3点：

**应用分割难：**将一个现有的应用改造为一个安全计算应用的改造难度很大。需要做代码分割。

**场景部署难：**安全计算是要依托于硬件的。在实际部署中需要对应用调度系统做改造。

**安全分析难：**一个应用使用了安全计算是不是就一定安全了呢？答案是不确定。这需要对整个应用做非常细致的安全分析。

针对这些难题，蚂蚁集团和阿里巴巴集团的工程师提出了独到的解决方案。
首先是解决应用分割难的问题。

>![](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*yqzJQJTyfHUAAAAAAAAAAAAAARQnAQ)

蚂蚁集团开源的 Occlum 项目在飞地中开发了 LibOS 适配层，让 Linux 下的应用可以无修改地运行在 SGX 环境中，彻底解决了应用分割的问题。Occlum 使用 Rust 语言开发，保证内存了安全性；支持多进程和加密文件系统，应用无需修改。
例如：基于蚂蚁集团金融级云原生框架 SOFABoot 开发的应用可以完全无修改的运行在 Occlum 环境中。

👇网站链接🔗：
[https://github.com/occlum/occlum/tree/master/demos/sofaboot](https://github.com/occlum/occlum/tree/master/demos/sofaboot)

针对部署难的问题，阿里云推出了 Inclavare 开源项目。

>![](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*vVYgTZ2CxbgAAAAAAAAAAAAAARQnAQ)

Inclavare 基于 Occlum，为用户提供了安全计算容器。用户只需将关注的重点放在应用本身即可，Inclavare 会将计算调度至合适的计算节点。
针对安全分析难，蚂蚁集团的 MORSE 多方安全计算引擎和 MYTF 区块链计算平台分别为不同的计算场景提供了解决方案。用户无需再承担高昂的安全分析成本。

>![](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*3W1qQ60TN9cAAAAAAAAAAAAAARQnAQ)

>![](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*7_UWQLOnt9QAAAAAAAAAAAAAARQnAQ)

蚂蚁集团在安全计算领域持续投入，用科技的力量来保护数据安全，保护用户隐私，给用户提供更安全的服务。蚂蚁集团开源了 TEE 安全 LibOS Occlum。
用户可以在 [https://github.com/occlum/occlum]( https://github.com/occlum/occlum) 找到所有的实现代码。用户既可以审查 Occlum 的源代码，以确保整体方案的安全性；也可以参考已有的 demo 来学习 Occlum 的使用方法，快速上手安全计算。

### 本周推荐阅读

- [蚂蚁云原生应用运行时的探索和实践 - ArchSummit 上海](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487717&idx=1&sn=ca9452cdc10989f61afbac2f012ed712&chksm=faa0ff3fcdd77629d8e5c8f6c42af3b4ea227ee3da3d5cdf297b970f51d18b8b1580aac786c3&scene=21)

- [带你走进云原生技术：云原生开放运维体系探索和实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247488044&idx=1&sn=ef6300d4b451723aa5001cd3deb17fbc&chksm=faa0fdf6cdd774e03ccd9130099674720a81e7e109ecf810af147e08778c6582636769646490&scene=21)

- [稳定性大幅度提升：SOFARegistry v6 新特性介绍](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247488131&idx=1&sn=cd0b101c2db86b1d28e9f4fe07b0446e&chksm=faa0fd59cdd7744f14deeffd3939d386cff6cecdde512aa9ad00cef814c033355ac792001377&scene=21)

- [金融级能力成核心竞争力，服务网格驱动企业创新](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487660&idx=1&sn=d5506969b7eb25efcbf52b45a864eada&chksm=faa0ff76cdd77660de430da730036022fff6d319244731aeee5d41d08e3a60c23af4ee6e9bb2&scene=21)

更多文章请扫码关注“金融级分布式架构”公众号

>![](https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*s3UzR6VeQ6cAAAAAAAAAAAAAARQnAQ)
