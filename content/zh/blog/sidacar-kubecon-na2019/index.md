---
title: " 将 Sidecar 容器带入新的阶段 | KubeCon NA 2019"
author: "徐迪、张晓宇"
description: " 本文主要介绍了什么是 Sidecar 容器，蚂蚁金服和阿里巴巴集团的通用场景，以及我们是如何解决这些挑战的。"
tags: ["Sidecar 容器"]
date: 2019-12-24T20:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1577254941129-2e0eef77-e672-434b-98ba-5dec2ade8447.jpeg"
---

![2019kubecon-圣地亚哥-照片](https://cdn.nlark.com/yuque/0/2019/png/226702/1577245310906-a101b27c-fe0e-477c-abb8-6edaa66bdcfd.png)
图为 KubeCon NA 2019 大会分享现场照

Speaker:

- 徐迪 蚂蚁金服技术专家：负责蚂蚁金融云PaaS平台建设，Kubernetes 社区老兵，核心代码库贡献量社区前50；
- 张晓宇 阿里云技术专家：负责阿里巴巴云原生应用容器平台的生态建设，主要设计和研发节点稳定性和资源利用率相关解决方案，同时也是 Kubernetes 社区热心的成员和贡献者。

本文根据徐迪和张晓宇在 KubeCon NA2019 大会分享整理。分享将会从以下几个方面进行切入：首先会简单介绍一下什么是 Sidecar 容器；其次，我们会分享几个蚂蚁金服和阿里巴巴集团的通用场景，以及我们是如何解决这些挑战的。当然，现在还是有很多的挑战需要后续继续解决，邀请大家与我们一同努力。

## Sidecar 简介

Sidecar 容器并不是一个新鲜事物。它是一种设计模式，主要用来做一些辅助的工作，比如网络连通性、下载拷贝文件之类的事情；如果大家熟悉 Docker Swarm 的话，就会发现 Docker Ambassador 其实就是 Sidecar。

![Sidecar 容器](https://cdn.nlark.com/yuque/0/2019/png/226702/1576647445029-9342f6df-c720-4fd2-a513-09e490d82e71.png)

看看如上这个例子，Service Consumer 和 Redis Provider 强耦合，部署在同一个节点上。如果这个时候，Redis Provider 出现问题，需要连接到另外一个 Redis 实例上，需要重新配置，并重启 Service Provider。

![Service Provider](https://cdn.nlark.com/yuque/0/2019/png/226702/1576647445057-2dbeed67-616d-49b7-85ac-9c1c3fb574ac.png)

那么在引入了 Ambassador 以后，问题变得相对简单些，只需要重启这里的 Redis Ambassador 即可，并不需要 Service Consumer 进行任何变动。

当然这种模式，还可以进行跨节点通信，比如下图。这样 Service Consumer 和 Redis Provider 就可以部署在不同的节点上。在某种程度上，很容易地就将两种服务进行了解耦。

![跨节点通信](https://cdn.nlark.com/yuque/0/2019/png/226702/1576647445026-2fb65a5b-1b59-42f0-97ad-f9826c9b1b11.png)

## Sidecar 案例分享

### Sidecar 容器能用来干什么？

一般来讲，Sidecar 容器可以：

- 日志代理/转发，例如 fluentd；
- Service Mesh，比如 Istio，Linkerd；
- 代理，比如 Docker Ambassador；
- 探活：检查某些组件是不是正常工作；
- 其他辅助性的工作，比如拷贝文件，下载文件等；
- ...

### 仅此而已？

事实上，Sidecar 越来越被大家接受，并且使用越来越广泛。Sidecar 容器通常和业务容器（非 Sidecar 容器）部署在同一个 Pod 里，共享相同的生命周期，为业务容器提供辅助功能。这是一个非常好的模式，能够极大程度解耦应用，并且支持异构组件，降低技术壁垒。

但目前 Kubernetes 对 Sidecar 的管理还不完善，越来越不满足我们的使用，尤其是在生产环境中使用 Sidecar。

### 几个典型案例

#### 1. 顺序依赖

假设我们在一个 Pod 内注入了多个 Sidecar，但是 Sidecar 之间或者 Sidecar 和业务容器之间有相互依赖关系。

如下这个例子，我们需要先启动 proxy Sidecar 容器用于建立网络连接，这样 mysql client 才能连接到远端的 mysql 集群，并在本地暴露服务。而后主的业务容器才能正常工作。

```yaml
   #1 proxy_container (sidecar)
   #2 mysql_client
   #3 svc_container
```

当然，有的人会觉得这个地方，可以通过诸如更改镜像启动脚本延迟启动等方法来解决。但是这些方法侵入性太强，不利于扩展，还很难进行准确的配置。

#### 2. Sidecar 管理

我们来看看另外一个案例。Sidecar 容器和业务容器耦合在同一个 Pod 内，共享相同的生命周期。因此，单独来管控 Sidecar 容器非常不方，比如更新 Sidecar 的镜像。

![Sidecar 管理](https://cdn.nlark.com/yuque/0/2019/png/226702/1576647445080-9d79659b-b946-4239-abcd-dd3f8e5fe997.png)

比如，我们已经给很多 Pod 注入了 Istio Proxy 这样的 Sidecar 容器，目前运行状态良好。但是如果这个时候我们想升级这个 Proxy 镜像的话，该怎么办？

如果按照 [Istio 社区官方的文档](https://istio.io/docs/setup/upgrade/steps/#sidecar-upgrade)，我们需要重新注入这些 Sidecar 容器。具体来说，需要删除原有 Pod，重新生成一份新的 Pod（有些 workload 关联的 Pod，会由相应的 workload 控制器自动生成）。

那如果我们有很多个这样的 Pod 需要处理的话，怎么办？通过命令行的话，太不方便，而且容易出错。通过自己单独写的代码的话，可扩展性是个问题，需要频繁更改这些代码。

而且这里还有另外一个问题，我们肯定不会一下子升级所有的 Sidecar，肯定要有个灰度的过程，也就是只升级一部分 Sidecar，这个时候又该怎么办呢？

## 社区进展

### 上游社区

这里我们非常感谢 Joseph Irving (@Joseph-Irving) 提出了一个 [Sidecar kep](https://github.com/kubernetes/enhancements/pull/919)，通过定义 LifecycleType 来区分是否是 Sidecar 容器。

```go
type Lifecycle struct {
  // Type
  // One of Standard, Sidecar.
  // Defaults to Standard
  // +optional
  Type LifecycleType `json:"type,omitempty" protobuf:"bytes,3,opt,name=type,casttype=LifecycleType"`
}

// LifecycleType describes the lifecycle behaviour of the container
type LifecycleType string

const (
  // LifecycleTypeStandard is the default container lifecycle behaviour
  LifecycleTypeStandard LifecycleType = "Standard"
  // LifecycleTypeSidecar means that the container will start up before standard containers and be terminated after
  LifecycleTypeSidecar LifecycleType = "Sidecar"
)
```

未来只需要在 Pod Spec 中，按如下方式标记即可：

```yaml
name: sidecarContainer
image: foo
lifecycle:
  type: Sidecar
```

Pod 内容器的启动顺序按照：初始化容器->Sidecar 容器->业务容器 的顺序依次启动。

其中[上述 kep](https://github.com/kubernetes/enhancements/pull/919) 的 [kubelet 端实现](https://github.com/kubernetes/kubernetes/pull/80744) 正在进行中。

为了支持 Sidecar 更多的使用场景，我们以此为基础提出了 PreSidecar 和 PostSidecar，分别用于在业务容器之前和之后启动。具体的使用场景见 [我们的 PR](https://github.com/kubernetes/enhancements/pull/1135/files#diff-053a4b80170c73fb99c6472a67b9e7d8)。

为什么我们觉得 Sidecar 应该区分前置和后置呢？

这是因为在一些场景下，我们需要 Sidecar 容器优先于应用容器启动，帮助做一些准备工作。例如分发证书，创建共享卷，或者拷贝下载一些其他文件等。

![Sidecar 容器优先于应用容器启动](https://cdn.nlark.com/yuque/0/2019/png/226702/1576647445052-8c09c229-39ab-4abb-8993-8294a000b42b.png)

而在另外一些场景下，我们需要一些 Sidecar 容器在应用容器之后启动。考虑到解耦和版本管理的因素，我们将应用分为两部分，应用容器专注于业务本身，而一些数据和个性化的配置放在 Sidecar 容器中。通常情况下，这两个容器将会共享一个存储卷，后置的 Sidecar 容器会更新替换掉一些默认和过时数据。

![Sidecar 容器在应用容器之后启动](https://cdn.nlark.com/yuque/0/2019/png/226702/1576647445058-91933e11-32ab-4ad0-8e5c-82b22f1ef8c8.png)

当然考虑到未来更复杂的场景，我们可能还会对容器的启动顺序做 DAG 编排，当然这个需要视生产实际需要而定。

![对容器的启动顺序做 DAG 编排](https://cdn.nlark.com/yuque/0/2019/png/226702/1576647445090-c7a2141f-953c-4475-9420-449c7de06986.png)

### 蚂蚁金服及阿里巴巴如何应对

为了解决 Sidecar 的管理工作，我们需要一个更**细粒度**的 workload 方便我们进行管理。这个 workload 我们命名为 SidecarSet，目前已经开源，生产可用。大家可以访问 [OpenKruise](https://openkruise.io/) 这个项目，可以在项目的 [roadmap](https://github.com/openkruise/kruise/projects) 里了解我们目前的一些新进展。OpenKruise 这个项目目前有三个生产可用的 workload，分别是 Advanced StatefulSet、
BroadcastJob、SidecarSet。另外2个 workload（AdvancedHPA 和 PodHealer）正在加紧开发中， 很快会开源出来，敬请期待。

相关使用 Demo，大家可以观看 [Lachlan Evenson](https://github.com/lachie83) 的[尝鲜视频](https://www.youtube.com/watch?v=elB7reZ6eAQ)。

以下是我们 SidecarSet 的定义，

```go
// SidecarSetSpec defines the desired state of SidecarSet
type SidecarSetSpec struct {
    // selector is a label query over pods that should be injected
    Selector *metav1.LabelSelector `json:"selector,omitempty"`

    // Containers is the list of sidecar containers to be injected into the selected pod
    Containers []SidecarContainer `json:"containers,omitempty"`

    // List of volumes that can be mounted by sidecar containers
    Volumes []corev1.Volume `json:"volumes,omitempty"`

    // Paused indicates that the sidecarset is paused and will not be processed by the sidecarset controller.
    Paused bool `json:"paused,omitempty"`

    // The sidecarset strategy to use to replace existing pods with new ones.
    Strategy SidecarSetUpdateStrategy `json:"strategy,omitempty"`
}

// SidecarContainer defines the container of Sidecar
type SidecarContainer struct {
    corev1.Container
}

// SidecarSetUpdateStrategy indicates the strategy that the SidecarSet
// controller will use to perform updates. It includes any additional parameters
// necessary to perform the update for the indicated strategy.
type SidecarSetUpdateStrategy struct {
    RollingUpdate *RollingUpdateSidecarSet `json:"rollingUpdate,omitempty"`
}

// RollingUpdateSidecarSet is used to communicate parameter
type RollingUpdateSidecarSet struct {
    MaxUnavailable *intstr.IntOrString `json:"maxUnavailable,omitempty"`
}
```

spec 中的 SidecarContainer 的定义就是 Kubernetes 代码库中的 corev1.Container 定义。通过额外的一个 labelSelector，可以很方便地对指定的容器组进行操作。通过我们支持 RollingUpdate ，方便用户一点点升级 Sidecar。同时提供了 pause 功能，可以在紧急情况下暂停 Sidecar 的升级。

如果只是简单升级 Sidecar 的镜像， SidecarSet 控制器仅仅会 patch 原有 pod 的，非常方便的就可以一键升级镜像。

## 其他的挑战

我们在生产实践过程中，还发现了一些其他的挑战，目前还在寻找比较好的解法。如果大家有什么好的方法或者建议，欢迎一起讨论共建。

### 1. Sidecar 容器的资源管理

一般来讲 Sidecar 容器占用的资源都比较小，那么这个资源要不要计算到整个 pod 当中？还是可以直接共享业务容器的资源即可？相同的 Sidecar 在和不同的应用容器搭配使用，如何准确给 Sidecar 容器分配资源这些都需要进行考虑。

![Sidecar 容器资源管理](https://cdn.nlark.com/yuque/0/2019/png/226702/1576647445072-45a320f0-4e1e-469f-9d71-d0e2cece1a1c.png)

### 2. Sidecar 容器的容错性

一般来讲，Sidecar 容器都是非主要容器，那么这类容器出现问题时，比如 liveness 探活，要不要对主容器的状态或者整个 pod 的状态也产生影响。再或者，Sidecar 镜像更新出现问题时，要不要直接标记整个 pod 出现问题。

当然，还有一些其他的挑战，我们只是列举了几个通用的。对于这些挑战，我们需要大家一起集思广益，找到比较合理的解法。

## 小结

随着 Sidecar 在生产环境使用越来越广泛，对其的管理愈发需要重视。Sidecar 虽然和业务容器部署在同一个 Pod 内，但是其本质上只是辅助性的容器。本文介绍了目前 Sidecar 的典型使用案例，以及面临的挑战，同时跟上游社区一起合作，将阿里经济体的技术解决方案在社区落地，帮助更多的用户。