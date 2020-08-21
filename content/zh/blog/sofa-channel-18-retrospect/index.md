---
title: "人人都可以“机密计算”：Occlum 使用入门和技术揭秘 | SOFAChannel#18 直播回顾"
author: "樱桃"
authorlink: "https://github.com/tatetian"
description: "本文分享如何使用 Occlum 的轻松开发机密计算应用以及 Occlum 技术架构和特色。"
categories: "Occlum"
tags: ["Occlum","SOFAchannel"]
date: 2020-08-20T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1597997728744-f5ed8ba3-8900-42ea-8455-ce76b3af0e8c.jpeg"
---

> < SOFA:Channel/ >，有趣实用的分布式架构频道。
> 回顾视频以及 PPT 查看地址见文末。欢迎加入直播互动钉钉群 : 30315793，不错过每场直播。

![SOFAChannel#18](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1597833229151-66c041ef-9d50-4ea5-ab38-0e7b2d016bd3.jpeg)

本文根据 SOFAChannel#18 直播分享整理，主题：零门槛的机密计算：Occlum LibOS 使用入门和技术揭秘。

大家好，我是今天的讲师田洪亮（花名：樱桃），蚂蚁集团技术专家，也是 Occlum 开源负责人。今天我和大家分享一下如何使用 Occlum 的轻松开发机密计算应用以及 Occlum 技术架构和特色。

## 前言

云计算、大数据、人工智能，我们正处在一个数据爆炸的时代。如何能够在享受和利用海量数据所产生的价值的同时，保证数据的安全和用户的隐私呢？这无异是一个用户、企业和监管部门共同关注的问题。

近年来兴起的机密计算（Confidential Computing），正是为了解决这个问题而来。利用可信执行环境（Trusted Execution Environments，简称 TEE）技术，机密计算使得数据始终保持加密和强隔离状态，从而确保了用户数据的安全和隐私。机密计算可以解决诸多应用场景中“信任”难题，比如多个不互信组织之间的数据融合与联合分析、区块链上的智能合约的机密性保护、公有云平台对外部或内部攻击的防御、高敏感信息（比如密码学材料、医疗档案等）的安全保护等等。

但是，机密计算底层依赖的 TEE 技术——比如目前最成熟的云端 TEE 技术 [Intel SGX](https://software.intel.com/content/www/us/en/develop/topics/software-guard-extensions.html)——也带来了额外的功能限制和兼容问题。这使得机密计算的开发者面领一个巨大的阻碍：应用开发难。

在本文中，我们会首先分析当前 SGX 应用开发者会遇到的各种挑战和痛点，然后介绍[蚂蚁集团自研的开源 TEE OS 系统 Occlum](https://github.com/occlum/occlum) 如何大幅降低 SGX 应用开发的门槛，真正做到人人都可以玩转机密计算。

## 为什么 SGX 应用开发难？

![SGX 应用程序的“二分”架构](https://cdn.nlark.com/yuque/0/2020/png/226702/1597833229130-d7911652-fb6c-4d52-8a3f-1b9a1612da9e.png)

SGX 应用程序是一种基于划分的模型：在用户态的（不可信）应用程序（上图红色部分）可以嵌入 SGX TEE 保护的区域（上图绿色部分），被称为 Enclave。支持 SGX 的 Intel CPU 保证 Enclave 中的受保护内容是在内存中加密的，并且与外界强隔离。外界的代码如果想进入 Enclave 中执行其中的可信代码必须通过指定的入口点，后者可以实施访问控制和安全检查以保证 Enclave 无法被外界滥用。

由于 SGX 应用程序是基于这种划分的架构，应用开发者通常需要使用某种 SGX SDK，比如 Intel SGX SDK、Open Enclave SDK、Google Asylo 或 Apache Rust SGX SDK。但无论使用上述哪种 SDK，开发者会遭遇下面的开发困境：

- 必须将目标应用做二分：开发者需要决定哪些组件应该置于 Enclave 内部，哪些置于 Enclave 外部，以及双方如何通信。对于复杂的应用，确定高效、合理且安全的划分方案本身就是一件颇具挑战的工作，更不要说实施划分所需的工程量。
- 被限定在某个编程语言：无论使用上述哪种 SDK 开发，一个开发者都将被限定在该 SDK 所支持的语言，这通常意味着 C/C++（当使用 Intel SGX SDK、Open Enclave SDK 或 Google Asylo 时），而无法使用 Java、Python、Go 等更加友好的编程语言。
- 只能获得很有限的功能：处于硬件限制和安全考虑，Enclave 中是无法直接访问 Enclave 外的（不可信）OS 的。由于 Enclave 中缺乏 OS 的支持，各种 SDK 只能提供普通不可信环境下的一个很小的功能子集，这使得很多现有的软件库或工具都无法在 Enclave 中运行。

上述困境使得为 SGX 开发应用成为一件十分痛苦的事，制约了 SGX 和机密计算的普及度和接受度。

## 学会 Occlum 的“三板斧”

![Occlum](https://cdn.nlark.com/yuque/0/2020/png/226702/1597833229145-cdaf1baf-3016-4cc1-8366-6e3b9d905855.png)

Occlum 是一款蚂蚁集团开源的 TEE OS，可以大幅降低 SGX 应用的开发门槛。那到底多低呢？只需要学会 Occlum的三条命令：`new`、`build`和`run`。本节我们以利用 Occlum 在 SGX 中运行一个 Hello World 程序为例进行说明。

这里有一个非常简单的 Hello World 程序。

```
$ cat hello_world.c
#include <stdio.h>

int main() {
    printf("Hello World!\n");
    return 0;
}
```

首先，我们用 Occlum 提供的 GCC 工具链（`occlum-gcc`）编译这个程序，并验证它在 Linux 上能正常工作。

```
$ occlum-gcc hello_world.c -o hello_world
$ ./hello_world
Hello World!
```

然后，我们为这个程序创建一个 Occlum 的实例目录（使用 `occlum new` 命令）。

```
$ occlum new occlum_hello
$ cd occlum_hello
```

该命令会创建一个名为 `occlum_hello` 的目录，并在该目录中准备一些必要的文件（如 `Occlum.json` 配置文件）子目录（如 `image/`）。

接下来，我们基于刚刚编译好的 `hello_world` 制作一个 Occlum 的 Enclave 文件和可信镜像（使用 `occlum build` 命令）。

```
$ cp ../hello_world image/bin
$ occlum build
```

最后，我们在 SGX 中运行 `hello_world`（使用 `occlum run` 命令）。

```
$ occlum run /bin/hello_world
Hello World!
```

更复杂的程序也可以用类似上面的流程通过 Occlum 移植进 SGX 中。用户无需理解 SGX 的二分编程模型，无需或只需少量修改应用代码，还可以自由选择编程语言（比如 Java、Python、Go 等）。使用 Occlum，应用开发者可以将宝贵的精力集中在编写应用上，而非为 SGX 做应用移植。

## 用起来像 Docker 的 TEE OS

![Occlum 的系统架构](https://cdn.nlark.com/yuque/0/2020/png/226702/1597833229164-aa6745a5-00a6-4c0d-94a5-c52990e7b349.png)

在了解了 Occlum 的基本用法和体验之后，很自然地会好奇 Occlum 的技术原理：Occlum 的用户接口为什么这样设计？而简单接口背后的技术架构又是怎样的？本节就试图回答这些问题。

Occlum 的一个设计理念是 Enclave-as-a-Container。在云原生时代，容器至关重要，容器无处不在。容器最常见的实现方式是基于 Linux 的 cgroup 和 namespace（比如 Docker），但也有基于虚拟化的实现（比如 Kata）。我们观察到，TEE 或者 Enclave 也可以作为一种容器的实现手段。因此，为了传达这种理念，同时给用户提供一种熟悉的体验，我们特意将 Occlum 的用户接口设计成与 Docker 和 OCI 标准接近。除了前面提到的 `new`、`build`和`run` 三个命令，Occlum 还提供 `start`、`exec`、`stop`、`kill` 等命令，其语意与 Docker 同名命令类似。

简单的用户接口隐藏着复杂的实现细节。为了高层次地描述 Occlum 的技术原理，我们分可信的开发环境和不可信的部署环境两个视角来讨论。

在可信的开发环境（上图中的上半部分），用户使用 `occlum build` 命令打包和制作可信镜像，该可信镜像是利用 Merkel Hash Tree 来保证镜像在上传到不可信的部署环境之后，无法被攻击者篡改。可信镜像的内容是 Occlum 启动时所载入的 rootfs，组织结构与通常的 Unix 操作系统类似，具体内容由用户决定。

在不可信的部署环境（上图中的下半部分），用户使用 `occlum run` 命令启动一个新的 Occlum Enclave，该 Enclave 中的 Occlum TEE OS 会从可信镜像中载入并执行相应的应用程序。Occlum 向应用程序提供与 Linux 兼容的系统调用，因此应用程序无需修改（或只需少量修改）即可运行在 Enclave 中。应用程序的内存状态由 Enclave 保护，应用程序的文件 I/O 由 Occlum 做自动的加解密，因此可以同时保护应用在内存和外存中数据的机密性和完整性。

## 更高效、更强大、更安全和更多内容

除了提供类容器的、用户友好的接口以外，Occlum 还有三个主要特色：

- **高效多进程支持**：Occlum 实现了一种轻量级的进程，相比此前最先进的开源 TEE OS（Graphene-SGX），进程启动提速 10-1000 倍，进程间通信的吞吐量提升 3 倍（详见我们的论文，链接见文末）；
- **强大文件系统**：Occlum 支持多种文件系统，比如保护完整性的文件系统、保护机密性的文件系统、内存文件系统、主机文件系统等等，满足应用的各种文件 I/O 需求；
- **内存安全保障**：作为全球首个使用 [Rust 语言](https://www.rust-lang.org/)开发的 TEE OS，Occlum 极大降低了内存安全问题的几率（据统计，Linux 有 50% 的安全漏洞都与内存安全有关），因此更值得信赖；

下面的传送门提供了更多资料：

- Occlum 官方网站：[https://occlum.io](https://occlum.io)
- Occlum 项目地址：[https://github.com/occlum/occlum](https://github.com/occlum/occlum)
- Occlum 学术论文：[https://arxiv.org/abs/2001.07450](https://arxiv.org/abs/2001.07450)
- SOFAChannel 直播回顾视频：[https://www.bilibili.com/video/BV1S5411a7gr](https://www.bilibili.com/video/BV1S5411a7gr)
