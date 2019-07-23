---
title: "Kubernetes 1.14 发布了，Release Note 该怎么读？"
author: "张磊、心贵、临石、徙远、衷源、浔鸣"
description: "在本篇文章中，我们将 1.14 的 Release Note 按照主题进行了重新归纳和梳理，按照类别对重要变更进行了技术剖析和讨论。希望这种“分类解读”的方式，能够帮助大家更好的理解 1.14 这个发布的核心内容。"
categories: "Kubernetes"
tags: ["Kubernetes"]
date: 2019-03-28T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563847319489-1e2c8604-c980-4107-910b-d4a16fc257f1.png"
---

本文由张磊、心贵、临石、徙远、衷源、浔鸣等同学联合撰写。

Kubernetes 1.14.0 Release 已经于 3 月 25 日正式发布。相信你也已经注意到，相比于1.13 和 1.12 版本，这次发布包含的重要变非常多，其对应的 [Release Note](https://github.com/kubernetes/kubernetes/blob/master/CHANGELOG-1.14.md#kubernetes-v114-release-notes) 的篇幅长度也创下了“新高”。

面对这样一份“海量信息”的 Release Note，我们该如何从这份文档里进行高效的信息过滤和挖掘，帮助团队更精准、快速的梳理出这次发布最主要的技术脉络呢？

在本篇文章中，我们将 1.14 的 Release Note 按照主题进行了重新归纳和梳理，按照类别对重要变更进行了技术剖析和讨论。希望这种“分类解读”的方式，能够帮助大家更好的理解 1.14 这个发布的核心内容。

## Windows Node 正式生产可用

随着1.14的发布，Kubernetes 对windows节点的生产级支持无疑是一个重要的里程碑。具体来说，1.14 版本针对 Windows 做了大量增强；

- Pod：Pod内支持 readiness 和 liveness 探针；支持进程隔离和 volume 共享的多容器 Pod；Pod 支持原生configmap 和 sercret；Pod 支持emptyDir；支持对 Pod 进行资源配额等；但是像优雅删除、Termination message、Privileged Containers、HugePages、Pod 驱逐策略等部分特性还未在 1.14 版本提供；
- Service：支持服务环境变量提供 DNS 解析；支持 NodePort、ClusterIP、LoadBalancer、Headless service；暂不支持 Pod 的 hostnetwork 模式；
- 常规 Workload controller：RS、deployment、statefulset、daemonset、job、cronjob 均支持 windows 容器；
- 除此之外，支持 Pod 和 container 维度的metrics、HPA、“kubectl exec”、调度抢占、resource quotas、CNI 网络支持等多种特性让 windows workload 更加云原生；由于 windows 的特殊兼容性，目前 host OS 的版本必须和容器镜像 OS 版本一致，1.14 版本支持 win server 2019；未来版本中会考虑使用 Hyper-V 隔离机制来解决版本兼容性问题。

而伴随着  Windows 容器的生态正在慢慢壮大，能够在生产级别支持 Windows 节点的容器服务开始见诸各大云厂商。阿里云容器服务（ACK）近期已经推出了 Windows Container 的支持，提供了 linux/windows 应用混合部署的统一管理能力。

参见：Support for Windows Nodes is Graduating to Stable ([#116](https://github.com/kubernetes/enhancements/issues/116) )

## 本地持久化数据卷（Local PV） 正式可用

长期以来，能够让 Kubernetes 直接用宿主机的本地存储设备（比如：本地 SSD 硬盘）来提供持久化数据卷（即：Local PV 功能），一直是社区里非常强烈的一个诉求。这个原因很容易理解：相对于远程存储（网络存储），Local PV 在时延性、易用性、稳定性和费用上具有独特的优势，尤其是对于相关特性比较敏感的应用，如数据库应用和搜索引擎应用来说，有着重要的意义。

而在 1.14 中，Local PV 终于正式宣布 GA，为云上的持久化存储选择增加了一种重要的的可能。

不过，必须要明确的是， 选择使用 Local PV，也意味着用户必须自己承担一些潜在的风险，这包括：

- 目前社区的开源方案无法动态创建卷
- 调度器需要由额外的调度逻辑工作，以确保调度的节点可以分配出足够的磁盘容量
- 容错性差，如果 Pod 正在运行的宿主机宕机或者磁盘发生异常，那么它的持久化卷里的信息可能丢失

第一个问题，可以通过比如阿里云的 local-volume-provisioner 实现本地 SSD Nvme 实例自动创建数据卷来解决，但对于容错性和健壮性的问题，就是比较棘手的了。

参见：Durable Local Storage Management is Now GA ([#121](https://github.com/kubernetes/enhancements/issues/121#issuecomment-457396290))

## Pod 优先级与抢占机制稳定可用

Kubernetes 里的任务优先级（priority）和抢占机制（preemption）的目的十分明确：保证高优先级的任务可以在需要的时候通过抢占低优先级任务的方式得到运行。

这其中，优先级定义了一个 Pod 在集群中的重要程度，这个重要程度体现且仅体现在两个地方：
1. 高优先级的Pod 在调度阶段更容易被优先调度（K8s 采用队列调度模型），注意这里并不保证高优先级 Pod 永远被优先调度，实际影响调度顺序的因素有很多；
2. 在集群整体负载较高时，如果出现高优先级 Pod 无法被调度的情况（集群中没有满足条件的 Node 供 Pod 运行），K8s 会启动抢占机制，通过抢占已经运行的低优先级的 Pod 的方式，让高优先级的 Pod 可以运行起来。抢占机制便是在这里引入的。

抢占机制指当调度器发现某个Pod（如 Pod-A）无法在集群中找到合适的节点部署时（所有节点 Predicates 全部失败），会试图通过删除一些优先级低于 Pod-A 的 Pod 来“腾出空间”部署 Pod-A，这样 Pod-A 就可以被调度了。这样一个“看似简单”的需求在分布式环境中实施起来有很多细节，例如：如何决定删除哪个节点的哪些 Pod、如何保证为 Pod-A 腾出的空间不被其它 Pod 占用、如何保证 Pod-A 不被饿死（Starvation）、如何处理有亲和性需求的 Pod 调度约束、是否需要支持跨节点 Preemption 以支持某些特定的约束（例如某 Failure Domain 的反亲和约束）等等。

参见：Pod Priority and Preemption in Kubernetes ([#564](https://github.com/kubernetes/enhancements/issues/564)) 

## 你一定要知道什么是 Pod Ready++

在 1.14 版本之前，Kubernetes 判断一个 Pod 是否 Ready，就是检查这个 Pod 的容器是否全部正常运行。但是这里有个问题，那就是容器或者说里面的主进程 Ready，并不一定意味着这个应用副本就一定是就绪的。为了确认 Pod 确实可以正常可用，我们希望给它增加一些外部指标（比如，该 Pod 需要的 Service，DNS，存储等服务全部就绪），来反应这个Pod是否“真正”Ready。

这个特性，就是1.14 里一个叫做“Pod Readiness Gates”、也叫做 Pod Ready ++ 的特性。它为pod的“Ready 状态” 提供了一个非常强大的扩展点。需要注意的是，用户需要编写一个外部控制器（Controller）来为这个Pod Readiness Gates 字段对应的指标设置值。

参见：Pod Ready++ ([#580](https://github.com/kubernetes/enhancements/issues/580)) 

## Kubernetes 原生应用管理能力

1.14之后，Kubernetes 项目本身开始具备了原生的应用管理能力，这其中最重要的一个功能，就是 Kustomize。

Kustomize 允许用户从一个基础  YAML 文件，通过 overlay 的方式生成最终部署应用所需的 YAML 文件，而不是像 Helm 那样通过字符串替换的方式来直接修改基础 YAML 文件（模板）。这样，在一个用户通过 overlay 生成新的 YAML 文件的同时，其他用户可以完全不受影响的使用任何一个基础 YAML 或者某一层生成出来的 YAML 。这使得每一个用户，都可以通过 fork/modify/rebase 这样 Git 风格的流程来管理海量的 YAML 文件。这种 PATCH 的思想跟 Docker 镜像是非常类似的，它既规避了“字符串替换”对 YAML 文件的入侵，也不需要用户学习蹩脚的 DSL 语法（比如 Lua）。

在1.14之后，Kustomize 已经成为了 kubectl 的一个内置命令。不难看到，Kubernetes 社区正在探索一种 Helm 之外的、更加 Kubernetes 原生的应用管理方法。具体效果如何，我们不妨拭目以待。

参见：Added Kustomize as a subcommand in kubectl ([#73033](https://github.com/kubernetes/kubernetes/pull/73033), [@Liujingfang1](https://github.com/Liujingfang1))

## 用户友好度进一步提升

随着大家对 Kubernetes 越来越熟悉，对 kubectl 依赖也越来越强烈，需求也越来越多样化。而在 1.14 中，kubectl 着重在以下几个方面，提升用户体验，加强对日常运维能力的支持。

- 之前 kubectl cp 操作每次只能 copy 一个文件，没办法使用通配符拷贝一批文件，非常不方便。在 1.14 中，蚂蚁金服的工程师提交了一个拷贝操作的通配符功能，方便对容器中的文件进行操作。参见：[#72641](https://github.com/kubernetes/kubernetes/pull/72641)
- 以往，用户通常无法方便的知道自己被管理员通过 RBAC 配置的权限到底有哪些。而从 v1.14 开始，用户可以通过 `kubectl auth can-i --list --namespace=ns1`  来查看自己在 ns1 这个 namespace 下可以访问哪些资源 （比如 Pod，Service 等），并有哪些操作的权限（比如 Get，List，Patch，Delete 等）了。参见：[#64820](https://github.com/kubernetes/kubernetes/pull/64820)
- Kubernetes 用户需要删除的 API 资源，往往分散在多个 namespace 中，删除非常不方便。在 v1.14 新版本中，用户终于可以借助于 `kubectl delete xxx --all-n``amespaces`  来进行统一的删除操作了（这里 XXX 可以是 Pod，Services，Deployment，自定义的 CRD 等等），并且还可以配合 `-l` 和 `--field-selector` 可以更精确地删除满足特定条件的资源。参见：[#73716](https://github.com/kubernetes/kubernetes/pull/73716)

## 稳定性进一步提升

和之前每个版本一样，Kubernetes 的新版本发布对稳定性和可靠性增强的关注一直是重中之重，下面我们列举出一些值得注意的修复和升级。

- 在做 Pod 驱逐时，会优先尝试使用优雅删除模式，而不是暴力删除 etcd 内的 Pod 数据。这个修复能够使被驱逐的 Pod 更加优雅的退出。参见：[#72730](https://github.com/kubernetes/kubernetes/pull/72730)
- Kubelet 要重建 Pod 的容器时，如果旧容器是 unknown 状态，现在 Kubelet 会首先尝试 Stop 容器。这避免了一个 Pod 的同一个容器申明会有多个实例同时运行的风险。参见：[#73802](https://github.com/kubernetes/kubernetes/pull/73802)
- 在大规模集群中，节点因为个别Pod使用了大量磁盘 IO，可能会导致节点频繁的在Ready/NotReady状态之间变化。这种状态会引起大规模的、不可预期的 Pod Eviction，导致线上故障。蚂蚁金服的工程师针对 Docker 环境下的这个问题提交了修复，建议大家也排查一下其它运行时的集群里是否有同样的问题。参见：[#74389](https://github.com/kubernetes/kubernetes/pull/74389)
- 当 Kubelet 在压力较大情况下，可能会发生 Kubelet 的 Pod 生命周期事件消费频次弱于事件产生频次，导致负责这个事件的 Channel 被占满，这种情况持续一段时间后会直接导致 Kubelet 死锁。阿里巴巴的工程师针对修这个问题提交了修复。参见：[#72709](https://github.com/kubernetes/kubernetes/pull/72709)

## 大规模场景下的性能提升与优化

在 Kubernetes 的主干功能日趋稳定之后，社区已经开始更多的关注大规模场景下 Kubernetes 项目会暴露出来的各种各样的问题。在 v1.14 中，Kubernetes 社区从面向最终用户的角度做出了很多优化，比如：

- kubectl 在实现中会顺序遍历 APIServer 暴露出的全部资源的 Group/Version/Kind，直到查找到需要处理的资源。这种遍历方式导致了用户在大规模集群下使用 kubectl 的性能体验受到很大影响。在 v1.14 版本中，kubectl 的顺序遍历行为终于参见： [#73345](https://github.com/kubernetes/kubernetes/pull/73345)
- 在 1.14 中，APIServer 里的一个重要变更，是对单次 PATCH 请求内容里的操作个数做出了限制，不能超过10000个，否则就不处理此请求。这样做的目的，是防止 APIServer 因为处理海量的甚至是恶意 PATCH 请求导致整个集群瘫痪。这也其实也是社区的 CVE-2019-1002100 主要的修复方法。参见：[#74000](https://github.com/kubernetes/kubernetes/pull/74000)
- Kubernetes 的 Aggregated API 允许 k8s 的开发人员编写一个自定义服务，并把这个服务注册到 k8s 的 API 里面像原生 API 一样使用。在这个情况下，APIServer 需要将用户自定义 API Spec 与原生的 API Spec 归并起来，这是一个非常消耗 CPU 的性能痛点。而在 v1.14 中，社区大大优化了这个操作的速率，极大地提升了APIServer 归并 Spec 的性能（提升了不止十倍）。参见：[#71223](https://github.com/kubernetes/kubernetes/pull/71223)