---
title: "自定义资源 CAFEDeployment 的背景、实现和演进 | SOFAChannel#7 直播整理"
author: "枫晟"
description: "本文根据 SOFAChannel#7 直播分享整理，介绍了蚂蚁金服 SOFAStack 的 Kubernetes 自定义资源 CafeDeployment 的开发背景和功能特性。"
categories: "CafeDeployment"
tags: ["CafeDeployment","SOFAChannel"]
date: 2019-07-18T21:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563456011284-3294de2d-77a1-491d-9866-f74c8125cb84.png"
---

本文简单介绍了蚂蚁金服 SOFAStack 的 Kubernetes 自定义资源 CafeDeployment 的开发背景和功能特性。

[相关直播视频以及 PPT 查看地址](https://tech.antfin.com/community/live/737/data/863)

## 背景介绍

Kubernetes 原生社区 Deployment 和 StatefulSet 解决了“服务节点版本一致性”的问题，并且通过 Rolling Update 实现了滚动升级，提供了基本的回滚策略。对于高可用建设要求不高的“年轻”业务，是一个不错的选择。

但是，在金融场景下，要解决的场景复杂得多。因此我们在金融分布式架构-云应用引擎（**SOFAStack-CAFE**，参见《金融级云原生探索实践系列——开篇》）中提出了 **CafeDeployment **的云原生模型，致力于解决以下问题：

**1. IP 不可变**

对于很多运维体系建设较为早期的用户，使用的服务框架、监控、安全策略，大量依赖 IP 作为唯一标识而被广泛使用。迁移到 Kubernetes 最大的改变就是 IP 会飘，而这对于他们来说，无异于运维、服务框架的推倒重来。

**2.  金融体系下的高可用**

Deployment/StatefulSet 无法根据特定属性进行差异化部署。而在以同城双活为建设基础的金融领域，为了强管控  Pod 的部署结构（即保证每个机房/部署单元都有副本运行），若通过原生组件进行部署，我们不得不维护多个几乎一模一样的 Deployment/StatefulSet，来保证 Pod 一定会飘到指定机房/部署单元的 node 上。在规模上到一定程度后，这无疑加大了运维管控的复杂度和成本。

**3.  灵活的部署策略**

Deployment 无法控制发布步长，StatefulSet 虽然可以控制步长，但是每次都需要人工计算最新版本需要的副本数并修改 Partition，在多机房/部署单元的情况下，光想想发布要做的操作都脑袋炸裂。

在面对以上这些问题的时候，我们思考：能不能有一个类似 Deployment 的东西，不仅可以实现副本保持，并且能协助用户管控应用节点部署结构、做 Beta 验证、分批发布，减少用户干预流程，实现最大限度减少发布风险的目标，做到快速止损，并进行修正干预。这就是我们为什么选择定义了自己的资源——**CafeDeployment**。


## 模型定义

![CafeDeployment 模型定义](https://cdn.nlark.com/yuque/0/2019/png/226702/1560825115796-3ad14a6c-db48-4487-abea-0d25826a78a3.png)

CafeDeployment 主要提供跨部署单元的管理功能，其下管理多个 InPlaceSet。每个 InPlaceSet 对应一个部署单元。部署单元是逻辑概念，他通过 Node 上的 label 来划分集群中的节点，而 InPlaceSet 则通过 NodeAffinity 能力，将其下的 Pod 部署到同一个部署单元的机器上。由此实现 CafeDeployment 跨部署单元的管理。

CafeDeployment 作为多个部署单元的上层，除了提供副本保持，历史版本维护等基本功能，还提供了跨部署单元的分组扩容，分组发布，Pod 调度等功能。模型定义如下：

```yaml
apiVersion: apps.cafe.cloud.alipay.com/v1alpha1
kind: CafeDeployment
metadata:
  ......
spec:
  historyLimit: 20
  podSetType: InPlaceSet	# 目前支持底层PodSet：InPlaceSet，ReplicaSet，StatefulSet
  replicas: 10
  selector:
  matchLabels:
    instance: productpage
    name: bookinfo
  strategy:
    batchSize: 4	# 分组发布时，每组更新的Pod数目
    minReadySeconds: 30
    needWaitingForConfirm: true	# 分组发布中，每组结束时是否需要等待确认
    upgradeType: Beta	# 目前支持发布策略：Beta发布，分组发布
    pause: false
  template:
    ......
  volumeClaimTemplates:	# 用于支持statefulSet
  serviceName:		# 用于支持statefulSet
  topology:
    autoReschedule:
      enable: true	# 是否启动Pod自动重调度
      initialDelaySeconds: 10
    unitType: Cell	# 部署单元类型：Cell，Zone，None
    unitReplicas:
      CellA: 4		# 固定某部署单元的Pod数目
    values:		# 部署单元
      - CellA
      - CellB
```

因为我们将大部分的控制逻辑都抽取到上层 CafeDeployment 中，因此我们重新设计了 InPlaceSet，将它做得足够简单，只关注于“InPlace”相关的功能，即副本保持和原地升级，保持 IP 不变的能力，模型定义如下：

```yaml
spec:
  minReadySeconds: 30
  replicas: 6
  selector:
    matchLabels:
      instance: productpage
      name: bookinfo
      deployUnit: CellB
  strategy:
    partition: 6		# 控制发布时更新Pod的进度
  template:
    ......
```

## 功能特性

### 灵活的分组定义

CafeDeployment 支持跨部署单元的分组扩容，Pod 调度，分组发布。分组策略主要分为两种，Beta 分组和 Batch 分组：

- **Batch 分组**

即根据 BatchSize 将 Pod 分为多个批次，每批中的 Pod 会同时发布。待用户确认（needWaitingForConfirm=true时）无误时，或当前批次所有 Pod 都 ready 后（needWaitingForConfirm=false 时），则会开始进行下一组的发布。

在分组暂停时，CafeDeployment 会被打上 Annotation: cafe.sofastack.io/upgrade-confirmed=false，用户可通过将 Annotation 的值改为 true，确认当前分组。<br />

- **Beta 分组**

相比 Batch 发布，会在第一组发布之前多一步 Beta 分组。此组会在每个部署单元内选择一个 Pod 进行发布，以减小错误配置带来的影响。若用户确认无误，可以确认继续，以进入正常的 Batch 发布流程。

### 安全的分组扩容和发布能力

#### 分组扩容

为预防不正确的配置造成大量错误 Pod 同时创建，占用大量资源等意外情况出现，CafeDeployment 支持分组扩容，以降低风险。

在如下配置时，CafeDeployment 会创建两个 InPlaceSet 实例，并开始分组创建（扩容）Pod。

```yaml
spec:
	......
  replicas: 10								# 副本数为10
  strategy:
    upgradeType: Beta						# Beta发布
    batchSize: 4								# 每组Pod数为4
    needWaitingForConfirm: true	# 分组暂停
  topology:
    ......
    values:		# 两个部署单元，CellA和CellB
      - CellA
      - CellB
```

初始时，InPlaceSet 的 replicas 和 partition 都为 0，CafeDeployment 会在之后默认将 10 个 Pod 均分到两个部署单元中，并参考 Beta 发布和 BatchSize 配置，分成 3 组进行，如下图所示。

![CafeDeploymentController](https://cdn.nlark.com/yuque/0/2019/png/226702/1560825115780-1c362cbb-1122-457c-be8e-f65ebf228dff.png)

第一组，为 Beta 分组，会在两个部署单元中各创建一个 Pod。待 Pod 都 ready 后，会要求用户进行确认，方可继续第二组。

第二组，为普通发布，因为 BatchSize=4，所以会在两个部署单元中各创建 2 个 Pod。之后同样需要经过用确认才会继续进入第三组。若 CafeDeployment 中的配置 needWaitingForConfirm=false，则在当前批次的所有 Pod 都 ready 后，会自动进入下一组的发布。

第三组，为最后一组发布，当所有 Pod 都 ready 后，则会结束当前发布。

发布过程中若出现问题，可通过修改 CafeDeployment 的 replicas 值等方式结束当前发布。

#### 分组发布

当修改 CafeDeployment 中的 PodTemplate 里的相关配置后，就会触发发布流程。目前同样支持 Beta 发布和 Batch 发布两种类型。当 CafeDeployment 有如下配置时，CafeDeployment 的 10 个 Pod 会被分到三组中进行发布。

```yaml
spec:
	......
  replicas: 10								# 副本数为10
  strategy:
    upgradeType: Beta						# Beta发布
    batchSize: 4								# 每组Pod数为4
    needWaitingForConfirm: true	# 分组暂停
  topology:
    ......
    values:		# 两个部署单元，CellA和CellB
      - CellA
      - CellB
```

第一组为 Beta 分组，每个部署单元会选择一个 Pod 进行发布。

第二组和第三组各有 4 个 Pod。

若当前 Pod 在部署单元的分配不均匀，如下图所示，CafeDeploymentController 也会负责计算并分配对应的配额给两个部署单元，来对发布进度进行统一的调度。

如果配置了分组暂停，则每组结束后都会需要用户进行确认。

![CafeDeploymentController-2](https://cdn.nlark.com/yuque/0/2019/png/226702/1560825115772-02de6b0a-0b73-4fa7-9504-da4bbbba1eba.png)

#### Pod 发布与外部的通信机制

使用 Readiness Gate 作为 Pod 是否可以承载外部流量的标识。在发布前，通过将 Readiness Gate 设置为 False，使得当前 Pod IP 在 Endpoint 上从 addresses 列表转移到 notReadyAddresses 列表；在发布完成后，将 Readiness Gate 设置为 True，Pod IP 在 Endpoint 上又会从 notReadyAddresses 转移到 addresses。相关流量组件通过 Watch Endpoint 上地址变化完成切流和引流，并通过 finalizer 对 Pod 进行打标保护。

![pod-graceful-shutdown](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1560825115764-d5db7a23-f4f3-4145-ae6c-d1f6d235750b.jpeg)

### 自适应的 Pod 重调度

在创建 Pod 的过程中，可能会遇到某个部署单元资源不足的情况，新的 Pod 会一直 Pending。这时如果打开自动重调度功能（如下所示），则 CafeDeploymentController 会尝试将 Pod 分配到其他未出现资源紧张的部署单元上。

```yaml
spec:
  topology:
    autoReschedule:
      enable: true						# 是否启动Pod自动重调度
      initialDelaySeconds: 10	# Pod由于资源不足，10秒后会被尝试重调度
```

在 Pod 部署过程中，如下图所示，

![Pod 部署过程](https://cdn.nlark.com/yuque/0/2019/png/226702/1560825115857-0db06e56-6372-4529-8b21-fe0b8f7d9955.png)

如果在最后一批分组发布的时候，出现 Pod 因资源不足而无法启动的情况，则 CafeDeploymentController 会自动将此 Pod 的配额调度到其他的资源充足的部署单元中。

当然，CafeDeployment 也支持手动指定 Pod 的分配方案，通过修改如下相关配置可以进行精确的指定：

```yaml
spec:
  topology:
    ......
    unitReplicas:
      CellA: 4		# 固定某部署单元的Pod数目
      CellB: 10%	# 通过百分比指定
    values:
      - CellA
      - CellB
      - CellC
```

这时，CafeDeploymentController 会优先根据指定方案进行 Pod 分配。

### 可适配多种社区工作负载

CafeDeploymentController 本身只提供了发布策略和跨部署单元管理的一个抽象实现，它对底层的 Pod 集合是通过 PodSetControlInterface 接口来控制。因此，通过对此接口的不同实现，可以保证对接多种 workload。目前已经实现了与 InPlaceSet 和 ReplicaSet 的对接，对 StatefulSet 的对接也在进行中。

![CafeDeploymentController 可适配多种社区工作负载](https://cdn.nlark.com/yuque/0/2019/png/226702/1560825115774-aceb0f6f-f302-45cd-9cb0-ec86852acd6a.png)

因为 CafeDeployment 只负责各种策略的实现，所以并不会对 Kubernetes 原生的功能有任何入侵。ReplicaSetController，StatefulSetController 会继续履行他们之前的职责，保证各自的特性。

## 总结

CafeDeployment 的设计与实现，并非一日之功，我们走过弯路，也受到过质疑。但我们仍然坚信，在金融场景下需要这样的一种工作负载，因为无论是 Deployment、StatefulSet 还是 InPlaceSet，为了实现高可用和无损发布，都无疑需要付出比 apply yaml 更多的精力，而这些往往都不是一个业务开发所关心的。

目前，CafeDeployment所提供的各种发布策略，灵活的分组发布，高可用和无损升级的能力已成为了金融云应用发布的重要一环，为产品层提供容器云原生的部署能力，并给我们用户的生产力和效率带来极大提升。后续我们将会继续增强 CafeDeployment 的能力，比如提供更灵活的自定义拓扑结构、机房/部署单元内更灵活的部署策略以满足更多的高可用发布场景的需求等。