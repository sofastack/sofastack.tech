---
title: "下一个 Kubernetes 前沿：多集群管理"
author: "金敏、邱见"
authorlink: "https://github.com/sofastack"
description: "下一个 Kubernetes 前沿：多集群管理"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2021-10-04T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*J5XDSZ7Bmm0AAAAAAAAAAAAAARQnAQ"
---

文｜金敏（蚂蚁集团技术专家)\邱见（Red Hat)

校对｜  冯泳（蚂蚁集团资深技术专家)

本文 3311 字 阅读 6 分钟

从最初 Kubernetes 技术问世，业界一遍一遍的质疑它能否能经得住生产级的考验，到今天许多大型企业已经采用 Kubernetes 技术“云化”之前大规模的基础设施，在企业内部创建了数十个甚至数百个集群。

Kubernetes 原生的管理能力目前仍然停留在单集群级别。每一个集群可以稳定地自治运行，但是却缺乏横贯多个集群的统筹管理能力。基础设施的建立者需要协调分散在各处的管理组件，形成一个统一的管理平台。

通过它，运维管理人员能够获知多集群水位的变化，节点健康状态的震荡等信息；业务应用负责人能够决策如何调配应用服务在各个集群中的部署分布；应用的运维人员能够获知服务状态，下发腾挪的策略。

与多集群相关的创新正在不断涌现。例如 ClusterAPI 和 Submariner 就是处理特定多集群管理问题比较成功的项目。

而本文要讨论的是那些试图解决企业在面对多集群管理时遇到的所有问题的技术探索。

在过去五年中，中国的技术公司蚂蚁集团在多集群管理的思考、使用和实施等方面学习到了很多宝贵的经验。

蚂蚁集团管理着遍布全球的数十个 Kubernetes 集群，每个集群平均拥有数千个节点（服务器）。他们将应用程序及其所需组件（包括中间件，数据库，负载均衡等等）在架构层面组织成逻辑数据中心（LDC）的弹性逻辑单元中，并将它们规划部署到物理基础设施上。这种架构设计帮助他们实现基础设施运维的两个关键目标：高可用性和事务性。

- 首先，部署在某个 LDC 上的业务应用的可用性在所属 LDC 内能够得到保障。

- 其次，部署在 LDC 内的应用组件可以被验证，并在故障发生时，可以被回滚。

蚂蚁集团 PaaS 团队的资深技术专家冯泳表示：

>“蚂蚁集团拥有数十个 Kubernetes 集群、数十万个节点和数千个关键应用的基础设施。在这样的云原生基础设施中，每天都会有数以万计的 Pod 被创建和删除。构建一个高度可用、可扩展且安全的平台来管理这些集群和应用程序是一项挑战。”

### PART. 1 始于 KubeFed

在 Kubernetes 项目生态中，多集群功能主要由与之同名的 SIG-Multicluster 团队处理。这个团队在 2017 年开发了一个集群联邦技术叫做 KubeFed。

联邦最初被认为是 Kubernetes 的一个内置特性，但很快就遇到了实现以及用户诉求分裂的问题，Federation v1 可以将服务分发到多个 Kubernetes 集群，但不能处理其他类型的对象，也不能真正的以任何方式“管理”集群。一些有相当专业需求的用户——尤其是几个学术实验室——仍在使用它，但该项目已被 Kubernetes 归档，从未成为核心功能。

然后，Federation v1 很快被一种名为“ KubeFed v2 ”的重构设计所取代，世界各地的运营人员都在使用该设计。它允许单个 Kubernetes 集群将多种对象部署到多个其他 Kubernetes 集群。KubeFed v2 还允许“控制平面”主集群管理其他集群，包括它们的大量资源和策略。这是蚂蚁集团多集群管理平台的第一代方案。

蚂蚁集团使用多集群联邦的首要任务之一是资源弹性，不止包括节点级别弹性也包括站点级别弹性。通过在需要时添加节点和整个集群起到提高效率和扩展系统的能力。例如年度性的资源弹性，每年 11 月 11 日是中国一年一度的光棍节，蚂蚁集团通常需要快速部署大量额外容量来支持高峰在线购物工作负载。然而，可惜的是正如他们发现的那样 KubeFed 添加新集群的速度很慢，而且在管理大量集群方面效率低下。

在 KubeFed v2 集群中，一个中枢 Kubernetes 集群会充当所有其他集群的单一“控制平面”。蚂蚁集团发现，在管理托管集群和托管集群中应用程序的时候，中枢集群的资源使用率都非常高。

在管理仅占蚂蚁集团总量 3% 的应用程序工作负载的测试中，他们发现由中等规模的云实例构成的中枢集群就已经饱和了，并且响应时间很差。因此，他们从未在 KubeFed 上运行全部工作负载。

第二个限制与 Kubernetes 的扩展功能有关，称为自定义资源定义或 CRD。类似蚂蚁集团这样的“高级用户”往往会开发众多的自定义资源来扩充管理能力。为了要在多集群间分发 CRD，KubeFed 要求为每个 CRD 都创建一个“联合 CRD”。这不仅使集群中的对象数量增加了一倍，也为在集群间维护 CRD 版本和 API 版本一致性方面带来了严重的问题，并且会造成应用程序因为不能兼容不同的 DRD 或者 API 版本而无法顺利升级。

CRD 的这种数量激增也导致了严重的故障排除问题，同时 CRD 的使用定义不规范/字段变更随意等坏习惯会使 KubeFed 控制面的鲁棒性雪上加霜。在本地集群有自定义资源的地方，联邦控制平面上也有一个代表该本地集群资源的图形聚合视图。但是如果本地集群出现问题，很难从联邦控制平面开始知道问题出在哪里。本地集群上的操作日志和资源事件在联邦级别也是不可见的。

### PART. 2 转向 Open Cluster Management

Open Cluster Management 项目（OCM）是由 IBM 最初研发，并由红帽在去年开源。OCM 在蚂蚁集团和其他合作伙伴的经验基础上，改进了多集群管理的方法。它将管理开销从中枢集群下放到每个被管理集群上的代理（Agent）上，让它在整个基础设施中分布式自治并维护稳定。这使得 OCM 理论上能管理的集群数量至少比 KubeFed 多一个数量级。到目前为止，用户已经测试了同时管理多达 1000 个集群。

OCM 还能够利用 Kubernetes 本身的发展来提高自身的能力。例如，那些以 CRD 封装的能力扩展可以使用 OCM 的 WorkAPI（一个正在向 SIG-Multicluster 提议的子项目）在集群之间分发 Kubernetes 对象。WorkAPI 将本地 Kubernetes 资源的子集嵌入其中，作为要部署的对象的定义，并将其留给代理进行部署。此模型更加灵活，并且最大限度地减少了对任何中央控制平面的部署需求。WorkAPI 可以一起定义一个资源的多个版本，支持应用程序的升级路径。同时 WorkAPI 兼顾了中枢集群和被管理集群网络链接故障时的状态保持问题，并可以在重连的情况下保障资源状态的最终一致性。

最重要的是，OCM 在集群部署中实现了更多的自动化。在 KubeFed 中，集群的纳管是一个“双向握手”的过程，以中枢集群和被管理集群之间“零信任”作为基础，在此过程中涉及许多手动步骤来保障安全性。新平台能够简化这一过程。例如，因为它在 “PULL” 的基础上运行，不再需要多阶段手动证书注册，也不需要任何明文的 KubeConfig 证书的流通，就可以做到让被管理集群获取中枢集群的管理命令。

尽管注册的流程注重双向的“信任性”，但是在 OCM 中添加新集群只需要很少的操作；工作人员可以简单地在目标 Kubernetes 集群上部署 “Klusterlet” 代理实现自动纳管。这不仅对管理员来说更加容易，而且也意味着蚂蚁集团为双十一准备更多新集群的部署更加快速。

### PART. 3 Kubernetes 多集群的下一步是什么？

在短短四年内，Kubernetes 社区的多集群管理能力迅速发展，从 Federation v1 到 KubeFed v2 再到 Open Cluster Management。

通过在内部兴趣组 SIG-Multicluster 和外部项目（OCM、Submariner 等）工作的那些才华横溢的工程师的技术能力，多集群支持的管理规模和管理功能都比以前提高了很多。

未来是否还会有一个新的平台来进一步发展多集群功能，或者 OCM 就是最终的实现方式？

冯泳是这么认为的：

>“展望未来，在红帽、蚂蚁集团、阿里云等参与者的共同努力下，Open Cluster Management 项目将成为构建基于 Kubernetes 的多集群解决方案的标准和背板”。

无论如何，有一件事很清楚：您现在可以在 Kubernetes 上运行整个星球 

要了解有关云原生主题的更多信息，请在KubeCon+CloudNativeCon North America ，2021 – 2021 年 10 月 11-15 日加入云原生计算基金会和云原生社区。

🔗「原文链接」：
[https://containerjournal.com/features/the-next-kubernetes-frontier-multicluster-management/](https://containerjournal.com/features/the-next-kubernetes-frontier-multicluster-management/)

### 本周推荐阅读

- [攀登规模化的高峰 - 蚂蚁集团大规模 Sigma 集群 ApiServer 优化实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247495579&idx=1&sn=67d0abc1c513ba4f815550d235b7a109&chksm=faa30041cdd489577c0e3469348ebad2ab2cc12cdfebca3a4f9e8dcd5ba828a76f500e8c0115&scene=21)

- [SOFAJRaft 在同程旅游中的实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247495260&idx=1&sn=a56b0f82159e551dec4752b7290682cd&chksm=faa30186cdd488908a73792f9a1748cf74c127a792c5c484ff96a21826178e2aa35c279c41b3&token=1376607701&lang=zh_CN#rd)

- [MOSN 子项目 Layotto：开启服务网格+应用运行时新篇章](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247488835&idx=1&sn=d645b9abc866048e679b56bfe3b72482&chksm=faa0fa99cdd7738ff1749ae75b1670f953c92b70dcf0358337977438fd74b632b21a7b17ece3&scene=21#wechat_redirect)

- [蚂蚁智能监控](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247494372&idx=1&sn=bb10a77c657251ee29d5fcc19c058ce7&chksm=faa3053ecdd48c28c35e262d04659766d8c0b411f1d5605b2dd7981b4345e1d4bf47cc977130&scene=21)
