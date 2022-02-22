---
title: "SOFAStack Meetup#5 上海站 容器沙箱专场"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFAStack Meetup#5 上海站 容器沙箱专场"
categories: "SOFAMeetup"
tags: ["SOFAMeetup"]
date: 2021-05-07T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*XB9ESa8q8PwAAAAAAAAAAAAAARQnAQ"
---

## 概要

- 活动主题：SOFAStack Meetup#5 上海站 容器沙箱专场

- 活动时间：2021 年 05 月 22 日（周六）14:00-17:00

- 活动地点：上海市浦东新区蚂蚁 S 空间 南泉北路 447 号 201

- 活动形式：线下活动

- 资料下载：<br/>
[《边缘计算中的 Kata Containers>](https://gw.alipayobjects.com/os/bmw-prod/30959033-63c5-43a4-93a4-75cbbb921296.pdf)<br/>
[《快速闪电：Nydus 镜像加速服务》](https://gw.alipayobjects.com/os/bmw-prod/aec94883-3d3e-47cc-974f-e85a90fb66ff.pdf)<br/>
[《WebAssembly Micro Runtime：云原生时代的超轻量级新型沙箱》](https://gw.alipayobjects.com/os/bmw-prod/dfadad7f-b3f0-48e7-b7b0-14a4fad65efc.pdf)<br/>
[《WebAssembly 在 MOSN 中的探索与实践》](https://gw.alipayobjects.com/os/bmw-prod/fbf09bcb-3c0f-4b66-af74-9dfa69966405.pdf)

## 活动介绍

### 活动议程

![](https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*gtzbRpciFa8AAAAAAAAAAAAAARQnAQ)

### 本期议题以及嘉宾详解

**《边缘计算中的 Kata Containers》**

**嘉宾介绍**

李枫，先后就职于摩托罗拉, 三星等IT公司, 现为独立开发者。在移动平台上积累了十年以上的研发经验, 近几年主要专注于云计算/边缘计算基础设施领域。是《灰帽黑客 第4版：正义黑客的道德规范、渗透测试、攻击方法和漏洞分析技术》和《恶意网络环境下的Linux防御之道 》中文版的主要译者。对技术创新具有浓厚的兴趣和实践能力，热心参与开源社区的各种活动，多次参加各种IT会议并作技术分享。

**议题简介**

- Kata Containers 具有的轻量和高安全等特性使它在资源受限和安全性需求的物联网/边缘计算领域有很好的应用前景, 并且可以与其他轻量级解决方案（如 K3S 等）进一步结合使用。本话题包含下列子话题：
1) LF Edge（由 Akraino 和 EdgeX 合并而成）中的 Kata Containers；
2) 打造轻量级 K8S 集群--Kata-Containers 与 K3S 的结合；
3) 在 ACRN 中运行 Kata Containers；
4) 将 Kata Containers 应用于边缘云。

**听众收获**

- 了解 Kata Containers 的基本情况
- 了解 Kata Containers 在边缘计算场景的应用前景

**《快速闪电：Nydus 镜像加速服务》**

**嘉宾介绍**

彭涛，蚂蚁集团可信原生技术部高级技术专家，Linux 内核和文件系统开发者，近年来主要关注容器运行时相关技术，是 Kata Containers 维护者和架构委员会成员，Dragonfly 镜像服务 nydus 的作者之一，云原生技术浪潮的坚定支持者。

徐佶辉，蚂蚁集团可信原生技术部技术专家，Dragonfly 镜像服务 nydus 的作者之一，负责 nydus 在蚂蚁的落地。

**议题简介**

- 有研究表明，容器镜像拉取占据了容器启动时间的 70%，而容器启动实际上只需要访问容器镜像不到 6% 的数据量。基于此，我们设计实现了可以按需加载容器镜像的 nydus 镜像加速服务，在内部大规模部署，并开源贡献给 Dragonfly 社区。本话题将向大家介绍 nydus 项目的背景，架构和技术细节，以及我们对容器镜像生态的展望。

**听众收获**

- 了解当前 OCI 容器镜像格式优缺点
- 了解 nydus 项目的背景，架构和技术细节
- 了解容器镜像生态的发展趋势

**《WebAssembly Micro Runtime：云原生时代的超轻量级新型沙箱》**

**嘉宾介绍**

王鑫，英特尔高级工程经理，WAMR(WebAssembly Micro Runtime)项目的创建者，主要工作集中在管理语言运行时和Web技术，2009年以来领导了Java和WebAssembly虚拟机运行时开发、V8 JavaScript引擎的性能优化等相关工作。加入英特尔之前，在摩托罗拉主要作为技术Leader，负责无线基站系统相关的工作。

**议题简介**

- 近年来WebAssembly在服务器侧及云原生场景中越来越流行，WAMR(WebAssembly Micro Runtime)是字节码联盟(Bytecode Alliance)旗下的WebAssembly独立运行时开源项目，支持多种软硬件平台，支持解释器/AOT/JIT等多种执行方式，性能优异，资源占用少，对多线程和SIMD也有良好的支持。这次分享将介绍WAMR的架构、特性、社区合作及在云原生场景中的应用。

**听众收获**

- 了解WebAssembly这一新兴技术 
- 了解WAMR开源项目的架构、特性及社区合作 
- 了解WAMR在云原生场景中的应用实例

**《WebAssembly 在 MOSN 中的探索与实践》**

**嘉宾介绍**

叶永杰，蚂蚁集团可信原生技术部软件工程师，开源项目 MOSN 核心成员，目前关注云原生 ServiceMesh、WebAssembly 等相关领域。

**议题简介**

- 随着云原生数据面 MOSN 在蚂蚁金服内部的大规模落地，安全隔离逐渐成为急需解决的问题之一。为此，我们利用 WebAssembly 基于给定资源的安全模型，依托于社区 Proxy-Wasm 开源规范，为 MOSN 中的扩展插件提供了一个独立隔离的沙箱环境。这次分享将介绍 MOSN 的背景，WebAssembly 在 MOSN 中的实践、以及我们在 Proxy-Wasm 开源规范上的贡献。

**听众收获**

- 了解云原生数据平面 MOSN 的基本情况
- 了解 Proxy-Wasm 开源规范的基本情况
- 了解 WebAssembly 技术在云原生数据平面的实践案例

## 了解更多技术干货

使用钉钉搜索群号：**34197075**，即可加入，获取一手开源技术干货；或微信扫码关注“金融级分布式架构”微信公众号👇
![](https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*s3UzR6VeQ6cAAAAAAAAAAAAAARQnAQ)
