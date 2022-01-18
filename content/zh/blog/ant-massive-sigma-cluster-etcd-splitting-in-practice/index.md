---
title: "蚂蚁大规模 Sigma 集群 Etcd 拆分实践"
author: "杜克伟"
authorlink: "https://github.com/sofastack"
description: "蚂蚁大规模 Sigma 集群 Etcd 拆分实践"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2022-01-18T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*L9IcQ530yN8AAAAAAAAAAAAAARQnAQ"
---

文｜杜克伟（花名：苏麟 )

蚂蚁集团高级开发工程师

负责蚂蚁 Kubernetes 集群的稳定性方面的工作，专注于集群组件变更、稳定性风险保障

本文 15738 字 阅读 20 分钟

### 前 言

为了支撑蚂蚁业务的迭代升级，蚂蚁基础设施今年启动了 Gzone 全面云化项目。要求 Gzone 需与已经云化的 Rzone 合并部署在同一个集群，Sigma 单集群实际管理的节点规模将超过万台，单集群承担的业务也将更加复杂。

因此我们启动了大规模 Sigma 集群的性能优化方案，在请求延迟上期望能够对齐社区标准，不因规模增长的原因下降。

etcd 作为 Sigma 集群的数据存储数据库，是整个集群的基石，能够直接决定性能天花板。社区建议的单 etcd 集群存储限制是 8G, 而蚂蚁 Sigma 集群的单 etcd 集群存储量早已超过了这个限制，Gzone 上云项目势必会加重 etcd 的负担。

首先，蚂蚁业务混合了流失计算、离线计算和在线业务，混合大量的生命周期在分钟级甚至是秒级的 Pod，单集群每天的 Pod 创建量也提升到了数十万, 都需要 etcd 来支撑；

其次，复杂的业务需求催生了大量的 List (list all、list by namespace、list by label)、watch、create、update、delete 请求，针对 etcd 的存储特性，这些请求性能均会随着 etcd 存储规模的增大而严重衰减，甚至导致 etcd OOM，请求超时等异常；

最后，请求量的增长也加剧了 etcd 由于 compact、defrag 操作对请求 RT P99 的暴涨，甚至请求超时，从而导致集群关键组件调度器、CNI 服务等 Operator 类组件间断性丢失，造成集群不可用。

根据前人的经验，针对 etcd 集群进行数据水平拆分是一个有效的优化手段，典型的拆分是把 Pod 等重要数据单独 etcd 集群来存储，从而降低单 etcd 存储和请求处理的压力，降低请求处理延迟。但是 Pod 资源数据针对 Kubernetes 集群具有特殊性，具有其他资源没有的高要求，尤其是针对已颇具规模正在服务的 K8s 集群进行拆分更是需要万分谨慎小心。

本文主要记录了蚂蚁集团在进行 Pod 资源数据拆分过程中一些实践经验和心得。

抛砖引玉，请大家多多指教！

### PART. 1 面临的挑战

从前人的 Pod 数据拆分经验了解到，Pod 数据拆分是一个高危且复杂的流程，原因来自于 Pod 数据自身的特殊性。

Pod 是一组容器的组合，是 Sigma 集群中可调度的最小单位，是业务 workload 的最终承载体。Sigma 集群的最核心最终的交付资源就是 Pod 资源。

Sigma 集群最核心的 SLO 也是 Pod 的创建删除升级等指标。Pod 资源数据可以说是 Sigma 集群最重要的资源数据。同时 Sigma 集群又是由事件驱动的，面向终态体系设计，所以 Pod 资源数据拆分除了考虑基本的前后数据一致性问题外，还要考虑拆分过程中对其他组件的影响。

前人的拆分经验流程中最核心的操作是数据完整性校验和关键服务组件停机。数据完整性校验顾名思义是为了保证数据前后的一致性，而关键服务组件停机是为了避免拆分过程中如果组件不停机造成的非预期后果，可能会有 Pod 非预期删除，Pod 状态被破坏等。但是如果照搬这套流程到蚂蚁 Sigma 集群，问题就来了。

蚂蚁 Sigma 作为蚂蚁集团核心的基础设施，经过 2 年多的发展已经成为拥有 80+ 集群、单集群节点数可达到 1.2w+ 规模的云底座。在如此规模的集群上，运行着蚂蚁内部百万级别的 Pod，其中短运行时长 Pod 每天的创建量在 20w+次。为了满足各种业务发展需求，Sigma 团队与蚂蚁存储、网络、PaaS 等多个云原生团队合作，截止目前 Sigma 共建的第三方组件量已经达到上百个。如果 Pod 拆分要重启组件，需要大量的与业务方的沟通工作，需要多人共同操作。如果操作不慎，梳理不完全漏掉几个组件就有可能造成非预期的后果。

![图片](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*hx-NR5L4t3EAAAAAAAAAAAAAARQnAQ)

从蚂蚁 Sigma 集群现状总结一下已有的 Pod 数据拆分经验流程的问题：

#### 1. 人工操作大量组件重启时间长、易出错

潜在需要重启的组件高达数十个，需要与各个组件 owner 进行沟通确认，梳理出需要重启的组件，需要耗费大量的沟通时间。万一遗漏就可能造成非预期的后果，比如资源残留、脏数据等。

#### 2. 完全停机持续时间长打破 SLO

数据拆分期间组件完全停机，集群功能完全不可用，且拆分操作极为耗时，根据前人经验，持续时间可能长达 1~2 小时，完全打破了 Sigma 集群对外的  SLO 承诺。

#### 3. 数据完整性校验手段薄弱

拆分过程中使用 etcd 开源工具 make-mirror 工具来迁移数据，该工具实现比较简单，就是读取一个 etcd 的 key 数据然后重新写到另一个 etcd，不支持断点续传，同时因重新写入 etcd 造成原有 key 的重要字段 revision 被破坏，影响 Pod 数据的 resourceVersion, 可能会造成非预期后果。关于 revision 后文会详细说明。最后的校验手段是检验 keys 的数量是否前后一致，如果中间 key 的数据被破坏，也无法发现。

### PART. 2 问题解析

#### 美好的期望 

作为一个懒人，不想和那么多的组件 owner 沟通重启问题，大量组件重启也易造成操作遗漏，造成非预期问题。同时是否有更好的数据完整性校验的手段呢？

如果组件不重启，那么整个过程后演变为下面的流程，预期将简化流程，同时保障安全性。

为了达成美好的期望，我们来追本溯源重新 review 整个流程。 

![图片](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*DD7ZT7CK6I4AAAAAAAAAAAAAARQnAQ)

#### 数据拆分是在做什么？

众所周知，etcd 存储了 Kubernetes 集群中的各种资源数据，如 Pod、Services、Configmaps、Deployment 等等。

Kube-apiserver 默认是所有的资源数据都存储在一套 etcd 集群中，随着存储规模的增长，etcd 集群会面临性能瓶颈。以资源维度进行 etcd 的数据拆分来提升 Kube-apiserver 访问 etcd 的性能是业内所共识的经验优化思路，本质是降低单 etcd 集群的数据规模，减少单 etcd 集群的访问 QPS。

针对蚂蚁 Sigma 集群自身的规模和需求，需拆分为 4 个独立的 etcd 集群，分别存储 Pods、Leases、event 和其他资源数据，下面分别简要说明这前三类(Pods、Lease、event)需要拆分出去的资源数据。

![图片](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*isrUTKVIdZQAAAAAAAAAAAAAARQnAQ)

#### Event 资源

K8s event 资源数据并不是 watch 中的 event，一般是表示关联对象发生的事件，比如 Pod 拉取镜像，容器启动等。在业务上一般是 CI/CD 需要流水式展示状态时间轴，需要频繁拉取 event 资源数据。

event 资源数据本身就是有效期的（默认是 2 小时），除了通过 event 观测资源对象生命周期变化外，一般没有重要的业务依赖，所以说 event 数据一般认为是可以丢弃，不需要保障数据前后一致性的。

因为上述的数据特点，event 的拆分是最为简单的，只需要修改 APIServer 的启动配置，重启 APIServer 即可，不需要做数据迁移，也不需要做老旧数据的清理。整个拆分过程除了 Kube-apiserver 外，不需要任何组件的重启或者修改配置。

#### Lease资源

Lease 资源一般用于 Kubelet 心跳上报，另外也是社区推荐的 controller 类组件选主的资源类型。

每个 Kubelet 都使用一个 Lease 对象进行心跳上报，默认是每 10s 上报一次。节点越多，etcd 承担的 update 请求越多，节点 Lease 的每分钟更新次数是节点总量的 6 倍，1 万个节点就是每分钟 6 万次，还是非常可观的。Lease 资源的更新对于判断 Node 是否 Ready 非常重要，所以单独拆分出来。

controller 类组件的选主逻辑基本上都是使用的开源的选主代码包，即使用 Lease 选主的组件都是统一的选主逻辑。Kubelet 的上报心跳的代码逻辑更是在我们掌控之中。从代码中分析可知 Lease 资源并不需要严格的数据一致性，只需要在一定时间内保障 Lease 数据被更新过，就不影响使用 Lease 的组件正常功能。 

Kubelet 判断 Ready 的逻辑是否在 controller-manager 中的时间默认设置是 40s，即只要对应 Lease 资源在 40s 内被更新过，就不会被判断为 NotReady。而且 40s 这个时间可以调长，只要在这个时间更新就不影响正常功能。使用选主的 controller 类组件的选主 Lease duration 一般为 5s~65s 可以自行设置。

因此 Lease 资源拆分虽和 event 相比要复杂一些，但也是比较简单的。多出来的步骤就是在拆分的过程中，需要把老 etcd 中的 Lease 资源数据同步到新的 etcd 集群中，一般我们使用 etcdctl make-mirror 工具同步数据。此时若有组件更新 Lease 对象，请求可能会落在老 etcd，也可能落在新的 etcd 中。落在老 etcd 中的更新会通过 make-mirror 工具同步到新的 etcd 中，因为 Lease 对象较少，整个过程持续时间很短，也不会存在问题。另外还需要迁移拆分完成后，删除老 etcd 中的 Lease 资源数据，以便释放锁占用的空间，虽然空间很小，但也不要浪费。类似 event 资源拆分，整个拆分过程除了 kube-apiserver 外，同样不需要任何组件的重启或者修改配置。

#### Pod 资源

Pod 资源可能是我们最熟悉的资源数据了，所有的 workload 最终都是由 Pod 来真实承载。K8s 集群的管理核心就在于 Pod 资源的调度和管理。Pod 资源数据要求严格的数据一致性，Pod 的任何更新产生的 watch event 事件，都不能错过，否则就有可能影响 Pod 资源交付。Pod 资源的特点也正是导致传统 Pod 资源数据拆分过程中需要大规模重启相关组件的原因，后文会解析其中的原因。

社区 kube-apiserver 组件本身早已有按照资源类型设置独立 etcd 存储的配置--etcd-servers-overrides。

、、、java
--etcd-servers-overrides strings
Per-resource etcd servers overrides, comma separated. The individual override format: group/resource#servers, where servers are URLs, semicolon separated. Note that this applies only to resources compiled into this server binary.
、、、

我们常见的资源拆分的简要配置示例如下：

、、、java
# events 拆分配置
--etcd-servers-overrides=/events#https://etcd1.events.xxx:2xxx;https://etcd2.events.xxx:2xxx;https://etcd3.events.xxx:2xxx
# leases 拆分配置
--etcd-servers-overrides=coordination.k8s.io/leases#https://etcd1.leases.xxx:2xxx;https://etcd2.leases.xxx:2xxx;https://etcd3.leases.xxx:2xxx
# pods 拆分配置
--etcd-servers-overrides=/pods#https://etcd1.pods.xxx.net:2xxx;https://etcd2.pods.xxx:2xxx;https://etcd3.pods.xxx:2xxx
、、、

#### 重启组件是必须的吗？

为了了解重启组件是否必须，如果不重启组件有什么影响。我们在测试环境进行了验证，结果我们发现在拆分完成后，新建 Pod 无法被调度，已有 Pod 的无法被删除，finalizier 无法摘除。经过分析后，发现相关组件无法感知到 Pod 创建和删除事件。

那么为什么会出现这种问题呢？要回答这个问题，就需要从 K8s 整个设计核心理念到实现具体细节全部理清楚讲透彻，我们细细道来。

如果 K8s 是一个普通的业务系统，Pod 资源数据拆分只是影响了 kube-apiserver 访问 Pod 资源的存储位置，也就是影响面只到 kube-apiserver 层面的话，就不会存在本篇文章了。

对于普通的业务系统来讲，都会有统一的存储访问层，数据迁移拆分运维操作只会影响到存储访问层的配置而已，更上层的业务系统根本不会感知到。

但， K8s 就是不一样的烟火！

![图片](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*ddBcTJKjzpAAAAAAAAAAAAAAARQnAQ)

K8s 集群是一个复杂的系统，是由很多扩展组件相互配合来提供多种多样的能力。

扩展组件是面向终态设计的。面向终态中主要有两个状态概念：期望状态(Desired State) 和当前状态（Current State），  集群中的所有的对象(object) 都有一个期望状态和当前状态。

- 期望状态简单来说就是我们向集群提交的 object 的 Yaml 数据所描述的终态；

- 当前状态就是 object 在集群中真实存在的状态。

我们使用的 create、update、patch、delete 等数据请求都是我们针对终态做的修改动作，表达了我们对终态的期望，执行这些动作后，当前集群状态和我们的期望状态是有差异的，集群中的各个 Operators(Controllers)扩展组件通过两者的差异进行不断的调谐(Reconclie) , 驱动 object 从当前状态达到最终状态。

![图片](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*1GcLQJa6Zq8AAAAAAAAAAAAAARQnAQ)

目前的  Operators 类组件基本上都是使用开源框架进行开发的，所以可以认为其运行组件的代码逻辑是一致统一的。在 Operator 组件内部，最终终态是通过向 kube-apiserver 发送 List 请求获取最终终态的 object yaml 数据，但为了降低 kube-apiserver 的负载压力，在组件启动时 List 请求只执行一次(如果不出现非预期错误)，若终态数据 object yaml 在之后有任何变化则是通过 kube-apiserver 主动向 Operator 推送 event(WatchEvent)消息。

从这点讲也可以说 K8s 集群是由 event 驱动的面向终态的设计。

![图片](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*3N3GQZZ9E_sAAAAAAAAAAAAAARQnAQ)

而 Operator 和 kube-apiserver 之间的 WatchEvent 消息流需要保障任何 event 都不能丢失， 最初的 List 请求返回的 yaml 数据，再加上 WatchEvent 的变更事件组合而成才是 Operator 应该看到的最终状态，也是用户的期望状态。而保障事件不丢失的重要概念则是 resourceVersion。

集群中的每个 object 都有该字段，即使是用户通过 CRD(CustomResourceDefinition) 定义的资源也是有的。

重点来了，上面提到的 resourceVersion 是与 etcd 存储本身独特特性(revision)息息相关的，尤其是针对 Operator 大量使用的 List 请求更是如此。数据的拆分迁移到新的 etcd 存储集群会直接影响到资源对象的 resourceVersion。

那么问题又来了，etcd revision 是什么？与 K8s 资源对象的 resourceVersion 又有什么关联呢？

#### Etcd 的 3 种 Revision

Etcd 中有三种 Revision，分别是 Revision、CreateRevision 和 ModRevision 下面将这三种 Revision 的关联关系以及特点总结如下：

key-value 写入或者更新时都会有 Revision 字段，并且保证严格递增, 实际上是 etcd 中 MVCC 的逻辑时钟。

![图片](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*ZO-pR52F7DIAAAAAAAAAAAAAARQnAQ)

#### K8s ResourceVersion 与 Etcd Revision

每个从 kube-apiserver 输出的 object 都必然有 resourceVersion 字段，可用于检测 object 是否变化及并发控制。

可从代码注释中看到更多信息：

、、、Java
// ObjectMeta is metadata that all persisted resources must have, which includes all objects
// users must create.
type ObjectMeta struct {  
    ...// omit code here
    // An opaque value that represents the internal version of this object that can
  // be used by clients to determine when objects have changed. May be used for optimistic
  // concurrency, change detection, and the watch operation on a resource or set of resources.
  // Clients must treat these values as opaque and passed unmodified back to the server.
  // They may only be valid for a particular resource or set of resources.
  //
  // Populated by the system.
  // Read-only.
  // Value must be treated as opaque by clients and .
  // More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#concurrency-control-and-consistency
  // +optional
  ResourceVersion string `json:"resourceVersion,omitempty" protobuf:"bytes,6,opt,name=resourceVersion"`
    ...// omit code here
}
、、、

kube-apiserver 的请求 verbs 中 create、update、 patch、delete 写操作都会更新 etcd 中的 Revision，更严格的说，会引发 revision 的增长。

现将 K8s 中的 resource object 中的 resourceVersion 字段与 etcd 中的各种 Revision 对应关系总结如下：

![图片](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*M1ZTRJosUIIAAAAAAAAAAAAAARQnAQ)

在所有的 kube-apiserver 请求响应中，需要特别注意 List 的响应。List 请求的 resourceVersion 是 etcd 的 Header.Revision, 该值正是 etcd 的 MVCC 逻辑时钟，对 etcd 任何 key 的写操作都是触发 Revision 的单调递增，接影响到 List 请求响应中的 resourceVersion的值。

举例来说，即使是没有任何针对 test-namespace 下面的 Pod 资源的修改动作，如果 List test-namespace 下面的 Pod，响应中的 resourceVersion 也很可能每次都会增长(因为 etcd 中其他 key 有写操作)。

在我们的不停组件 Pod 数据拆分中，我们只禁止了 Pod 的写操作，其他数据并未禁止，在 kube-apiserver 配置更新滚动生效过程中，势必会造成 old etcd 的 Revision 要远大于存储 Pod 数据的 new etcd。这就造成了 List resourceVersion 拆分前后的严重不一致。

resourceVersion 的值在 Operator 中是保障 event 不丢的关键。所以说 etcd 的数据拆分不仅影响到了 kube-apiserver，同时也影响到了众多的 Operator 类组件, 一旦出现变更事件丢失，会造成 Pod 无法交付、出现脏乱数据等问题故障。

![图片](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*L42oQq5K_vEAAAAAAAAAAAAAARQnAQ)

![图片](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*gLXSQK9P_1sAAAAAAAAAAAAAARQnAQ)

到现在为止，虽然我们了解到 Operator 拿到的 list resourceVersion 拆分前后不一致，从 old etcd 中返回的 list resourceVersion 要比从 new etcd 要大， 那么和 Operator 丢掉 Pod 更新事件有什么关系呢？

要回答这个问题，就需要从 K8s 的组件协作设计中的 ListAndWatch 说起，势必需要从客户端 Client-go 和服务端 kube-apiserver 来讲。

#### Client-go 中 ListAndWatch

我们都知道 Operator 组件是通过开源 Client-go 代码包进行事件感知的。

![图片](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*OXrcRJjRAf0AAAAAAAAAAAAAARQnAQ)

其中核心关键就是 ListAndWatch 方法，保障 client 不丢失 event 事件的 resourceVersion 就是在该方法中通过 List 请求获取的。

ListAndWatch 第一次会列出所有的对象，并获取资源对象的版本号，然后 watch 资源对象的版本号来查看是否有被变更。首先会将资源版本号设置为 0，list()可能会导致本地的缓存相对于 etcd 里面的内容存在延迟。Reflector 会通过 watch 的方法将延迟的部分补充上，使得本地的缓存数据与 etcd 的数据保持一致。

关键代码如下：

、、、Java
// Run repeatedly uses the reflector's ListAndWatch to fetch all the
// objects and subsequent deltas.
// Run will exit when stopCh is closed.
func (r *Reflector) Run(stopCh <-chan struct{}) {
  klog.V(2).Infof("Starting reflector %s (%s) from %s", r.expectedTypeName, r.resyncPeriod, r.name)
  wait.BackoffUntil(func() {
    if err := r.ListAndWatch(stopCh); err != nil {
      utilruntime.HandleError(err)
    }
  }, r.backoffManager, true, stopCh)
  klog.V(2).Infof("Stopping reflector %s (%s) from %s", r.expectedTypeName, r.resyncPeriod, r.name)
}
// ListAndWatch first lists all items and get the resource version at the moment of call,
// and then use the resource version to watch.
// It returns error if ListAndWatch didn't even try to initialize watch.
func (r *Reflector) ListAndWatch(stopCh <-chan struct{}) error {
  var resourceVersion string
  // Explicitly set "0" as resource version - it's fine for the List()
  // to be served from cache and potentially be delayed relative to
  // etcd contents. Reflector framework will catch up via Watch() eventually.
  options := metav1.ListOptions{ResourceVersion: "0"}

  if err := func() error {
    var list runtime.Object
      ... // omit code here
    listMetaInterface, err := meta.ListAccessor(list)
      ... // omit code here
    resourceVersion = listMetaInterface.GetResourceVersion()
        ... // omit code here
    r.setLastSyncResourceVersion(resourceVersion)
    ... // omit code here
    return nil
  }(); err != nil {
    return err
  }
    ... // omit code here
  for {
        ... // omit code here
    options = metav1.ListOptions{
      ResourceVersion: resourceVersion,
      ... // omit code here
    }
    w, err := r.listerWatcher.Watch(options)
        ... // omit code here
    if err := r.watchHandler(w, &resourceVersion, resyncerrc, stopCh); err != nil {
        ... // omit code here
      return nil
    }
  }
}
、、、

整理为流程图更为清楚：

![图片](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*rN1FTqrGi6UAAAAAAAAAAAAAARQnAQ)

#### kube-apiserver 中的 Watch 处理

看完客户端的处理逻辑，再来看服务端的处理，关键在 kube-apiserver 对 watch 请求的处理, 对每一个 watch 请求，kube-apiserver 都会新建一个 watcher，启动一个 goroutine watchServer 专门针对该 watch请求进行服务，在这个新建的 watchServer 中向 client 推送资源 event 消息。

![图片](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*paTDT5zUWAAAAAAAAAAAAAAAARQnAQ)

但是重点来了，client 的 watch 请求中参数 watchRV是从 Client-go 中的 List 响应而来，kube-apiserver 只向 client 推送大于 watchRV 的 event 消息，在拆分过程中 client 的 watchRV 有可能远大于 kube-apiserver 本地的 event 的 resourceVersion， 这就是导致 client 丢失 Pod 更新 event 消息的根本原因。

从这一点来说，重启 Operator 组件是必须的，重启组件可以触发 Client-go 的 relist，拿到最新的 Pod list resourceVersion，从而不丢失 Pod 的更新 event 消息。

![图片](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*7-ImSKoyS5wAAAAAAAAAAAAAARQnAQ)

### PART. 3 问题破局

#### 破解重启问题 

到了这里，我们似乎也难逃需要重启组件的命运，但是经过问题解析之后，我们理清了问题原因，其实也就找到了解决问题的方法。

重启组件问题主要涉及到两个主体：客户端 Client-go 和服务端 kube-apiserver，所以解决问题可以从这两个主体出发，寻求问题的突破点。

首先针对客户端 Client-go，关键就在于让 ListAndWatch 重新发起 List 请求拿到 kube-apiserver 的最新的 resourceVersion，从而不丢失后续的 event 消息。如果过能够让 Client-go 在某个特定的时机重新通过 List 请求刷新本地的 resourceVersion，也就解决了问题，但是如果通过更改 Client-go 代码，还是需要组件发布重启才能生效，那么问题就是如何不用修改 Client-go 的代码，就可以重新发起 List 请求。

我们重新 review ListAndWatch 的逻辑流程，可以发现判断是否需要发起 List 请求，关键在于 Watch 方法的返回错误的判断。而 watch 方法返回的错误是根据 kube-apiserver 对 watch 请求的响应决定的，让我们把目光放到服务端 kube-apiserver。

![图片](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*VPrBSZgxcL4AAAAAAAAAAAAAARQnAQ)

#### 不一样的 watch 请求处理

kube-apiserver 的 watch 请求处理前文已经介绍过，我们可以通过修改 kube-apiserver 的 watch 请求处理流程，实现与 Client-go 的相互配合，来达到我们的目的。

由上文我们知道 Client-go 的 watchRV 要远大于 kube-apiserver 本地 watch cache 中的 resourceVersion, 可以根据这个特点来实现 kube-apiserver 发送指定错误(TooLargeResourceVersionError)，从而触发 Client-go 的 relist 动作。kube-apiserver 组件无可避免的需要重启，更新配置后可以执行我们改造的逻辑。

改造逻辑示意如下：

![图片](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*LjbFRbXVpygAAAAAAAAAAAAAARQnAQ)

#### 技术保障数据一致 

前人的经验是通过 etcd make-mirror 工具来实现数据迁移的，优点是简单方便，开源工具开箱即用。缺点是该工作实现简单，就是从一个 etcd 中读取 key，然后重新写入另一个 etcd 中，不支持断点续传，对大数据量耗时长的迁移不友好。另外 etcd key 中的 createRevision 信息也被破坏掉。因此在迁移完成后，需要进行严格的数据完整性检测。

针对上面的问题我们可以换一个思路，我们本质是要做数据迁移的，etcd 本身的存储结构(KeyValue)具有特殊性，我们希望保留数据前后的完整性。所以想到了 etcd 的 snapshot 工具， snapshot 工具本来是用于 etcd 的容灾恢复的，即可以使用一个 etcd 的 snapshot 数据重新创建出新的 etcd 实例。而且通过 snapshot 的数据在新的 etcd 中是能够保持原有的 keyValue 的完整性的，而这正是我们所要的。

、、、Java
// etcd KeyValue 数据结构
type KeyValue struct {
  // key is the key in bytes. An empty key is not allowed.
  Key []byte `protobuf:"bytes,1,opt,name=key,proto3" json:"key,omitempty"`
  // create_revision is the revision of last creation on this key.
  CreateRevision int64 `protobuf:"varint,2,opt,name=create_revision,json=createRevision,proto3" json:"create_revision,omitempty"`
  // mod_revision is the revision of last modification on this key.
  ModRevision int64 `protobuf:"varint,3,opt,name=mod_revision,json=modRevision,proto3" json:"mod_revision,omitempty"`
  // version is the version of the key. A deletion resets
  // the version to zero and any modification of the key
  // increases its version.
  Version int64 `protobuf:"varint,4,opt,name=version,proto3" json:"version,omitempty"`
  // value is the value held by the key, in bytes.
  Value []byte `protobuf:"bytes,5,opt,name=value,proto3" json:"value,omitempty"`
  // lease is the ID of the lease that attached to key.
  // When the attached lease expires, the key will be deleted.
  // If lease is 0, then no lease is attached to the key.
  Lease int64 `protobuf:"varint,6,opt,name=lease,proto3" json:"lease,omitempty"`
}
、、、

#### 迁移数据裁剪

etcd snapshot 数据虽然有我们想要的保持 KeyValue 的完整性，但是重建的 etcd 中存储的数据是老 etcd的全部数据，这个并不是我们想要的。我们当然可以在新建 etcd 后，再来发起冗余数据的清楚工作，但这并不是最好的方法。

我们可以通过改造 etcd snapshot 工具在 snapshot 的过程中实现我们的数据裁剪。etcd 的存储模型中，是有一个 buckets 的列表的， buckets 是 etcd 一个存储概念，对应到关系数据库中可以认为是一个 table，其中的每个 key 就对应的 table 中的一行。其中最重要的 bucket 是名称为 key 的 bucket， 该 bucket 存储了 K8s 中所有资源对象。而 K8s 的所有资源对象的 key 都是有固定格式的，按照 resource 类别和 namespace 区别，每种 resource 都是有固定的前缀。比如 Pod 数据的前缀就是/registry/Pods/。我们在 snapshot 过程中可以根据这个前缀区分出 Pod 数据，把非 Pod 数据裁减掉。

另外根据 etcd 的特性，etcd 做 snapshot 数据的存储大小是 etcd 的硬盘文件大小，其中有两个值 db total size 和 db inuse size,  db total size 大小是 etcd 在硬盘中的所占用的存储文件的大小，其中包含了很多已经成为垃圾 key ，但未清理的数据。db inuse size 大小是所有可用的数据的总大小。在不经常使用 etcd defrag 方法整理存储空间时， total 的值一般来讲要远大于 inuse 的值。

在数据裁剪中即使我们裁剪掉非 Pod 数据，整个 snapshot 的数据也不会有任何改变，这时候我们需要通过 defrag 方法来释放掉冗余存储空间。

在下面的示意图中，可以看到 db total 的变化过程，最终我们得到的 snapshot 数据大小就是 Pod 数据的大小，这对我们节约数据传输时间来讲是非常重要的。

![图片](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*KErlRLFXj2UAAAAAAAAAAAAAARQnAQ)

![图片](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*lSCcRZqnmOAAAAAAAAAAAAAAARQnAQ)

#### Pod 禁写的小坑 

在前面的拆分流程中，我们提到 K8s 禁止写一类资源的时候，可以通过 MutatingWebhook 来实现，就是直接返回 deny 结果即可，比较简单。这里记录一下我们当时遇到的一个小坑点。

我们最初的 MutatingWebhookConfiguration 配置如下， 但是我们发现 apply 这个配置后，还是能够收到 Pod 的更新 event 消息。

、、、Java
// 第一个版本配置，有问题
apiVersion: admissionregistration.k8s.io/v1
kind: MutatingWebhookConfiguration
metadata:
  name: deny-pods-write
webhooks:
- admissionReviewVersions:
  - v1beta1
  clientConfig:
    url: https://extensions.xxx/always-deny
  failurePolicy: Fail
  name: always-deny.extensions.k8s
  namespaceSelector: {}
  rules:
  - apiGroups:
    - ""
    apiVersions:
    - v1
    operations:
    - "*"
    resources:
    - pods
    scope: '*'  
  sideEffects: NoneOnDryRun
、、、

经过排查后发现是 Pod 的 status 字段被更新，通过阅读 apiserver 的代码，我们发现与 Pod 存储有关的 resource 不仅仅只有 Pod 一个，还有下面的类型，Pod status 与 Pod 对于 apiserver 的存储来讲是不同的资源。

、、、Java
"pods":             podStorage.Pod,
"pods/attach":      podStorage.Attach,
"pods/status":      podStorage.Status,
"pods/log":         podStorage.Log,
"pods/exec":        podStorage.Exec,
"pods/portforward": podStorage.PortForward,
"pods/proxy":       podStorage.Proxy,
"pods/binding":     podStorage.Binding,
、、、

经过调整后，下面的配置是能够禁止 Pod 数据完全更新的配置，注意其中的 resource 配置字段。

这是一个小坑点，记录在此。

、、、java
apiVersion: admissionregistration.k8s.io/v1
kind: MutatingWebhookConfiguration
metadata:
  name: deny-pods-write
webhooks:
- admissionReviewVersions:
  - v1beta1
  clientConfig:
    url: https://extensions.xxx/always-deny
  failurePolicy: Fail
  name: always-deny.extensions.k8s
  namespaceSelector: {}
  rules:
  - apiGroups:
    - ""
    apiVersions:
    - v1
    operations:
    - "*"
    resources:
    - pods
    - pods/status
    - pods/binding
    scope: '*'  
  sideEffects: NoneOnDryRun
、、、

#### 最后的拆分流程 

在解决了前面的问题后，我们最后的拆分流程也就出来了。

示意如下：

![图片](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*KIkLTblOXOMAAAAAAAAAAAAAARQnAQ)

在数据拆分期间，仅有 Pod 数据不可以有写操作，读是可以的，其他资源可以正常读写。整个流程可以通过程序自动化的来实现。

Pod 的禁写操作的时间根据 Pod 数据的大小而所有变化，主要消耗在 Pod 数据 copy 过程上，基本整个过程在几分钟内即可完成。

除了 kube-apiserver 无法避免需要更新存储配置重启外，不需要任何组件重启。同时也节省了大量的与组件 owner 沟通时间，也避免了众多操作过程中的众多不确定性。 

整个拆分过程一个人完全可以胜任。

### PART. 4 最后的总结

本文从数据拆分的目标出发，借鉴了前人经验，但根据自身的实际情况和要求，突破了之前的经验窠臼，通过技术创新解决了组件重启和数据一致性保障问题，在提升效率的同时也在技术上保障了安全性。

现过程抽丝剥茧介绍了整个思考过程和实现关键点。

![图片](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*IHtXQLmCpU4AAAAAAAAAAAAAARQnAQ)

我们并没有发明创造了什么，只是在现有逻辑和工具基础上，稍加改良从而来完成我们的目标。然而改造和改良过程的背后是需要我们了解底层的细枝末节，这并不是画几个框框就能了解到的。

知其然知其所以然在大部分工作中都是必须的，虽然这会占用我们很多时间，但这些时间是值得的。

最后借用一句古话来结束：运用之妙，存乎一心，与诸君共勉。

「参考资料」

（1）[etcd storage limit](https://etcd.io/docs/v3.3/dev-guide/limit/)

（2）[etcd snapshot](https://etcd.io/docs/v3.3/op-guide/recovery/)

（3）[攀登规模化的高峰 - 蚂蚁集团大规模 Sigma 集群 ApiServer 优化实践](https://www.sofastack.tech/blog/climbing-to-the-top-of-scale-ant-groups-large-scale-sigma-cluster-apiserver-optimization-in-practice/)

### 本周推荐阅读  

[网商双十一基于 ServiceMesh 技术的业务链路隔离技术及实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247499337&idx=1&sn=a0f3965f5989858c7e50763e696c9c53&chksm=faa31193cdd49885045adfce40c76e7cde9b689203845f2f674c24f379c246868d272c8adcbd&scene=21)

[Prometheus on CeresDB 演进之路](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247497779&idx=1&sn=3c47ec0f1af6b5f0278010720c52a7fc&chksm=faa317e9cdd49eff0eb65e69e3ce40254100848556eca075ef24f3ce4527d906ce67c2487f94&scene=21)

[蚂蚁集团万级规模 k8s 集群 etcd 高可用建设之路](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247491409&idx=1&sn=d6c0722d55b772aedb6ed8e34979981d&chksm=faa0f08bcdd7799dabdb3b934e5068ff4e171cffb83621dc08b7c8ad768b8a5f2d8668a4f57e&scene=21)

![img](https://gw.alipayobjects.com/zos/bmw-prod/75d7bde6-1f48-4f28-80a4-215f8ec811bd.webp) 
