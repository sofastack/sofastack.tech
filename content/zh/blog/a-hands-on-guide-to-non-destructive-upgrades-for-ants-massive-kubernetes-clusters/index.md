---
title: "蚂蚁大规模 Kubernetes 集群无损升级实践指南【探索篇】"
author: "王连平"
authorlink: "https://github.com/sofastack"
description: "蚂蚁大规模 Kubernetes 集群无损升级实践指南【探索篇】"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2022-02-08 T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*xAmyQbhZR8wAAAAAAAAAAAAAARQnAQ"
---

文｜王连平（花名：烨川 )

蚂蚁集团高级开发工程师

负责蚂蚁 Kubernetes 集群容器交付，专注于集群交付能力、交付性能及交付 Trace 等相关领域

本文 12623 字 阅读 20 分钟

—— 庖丁解牛，让升级不再烦恼

## PART. 1 背 景

蚂蚁 Sigma 作为蚂蚁集团核心的基础设施，经过多年的发展其规模已经处于业界领先位置，大规模集群对 Kubernetes 的稳定性及功能性提出更高的要求。蚂蚁 Sigma 力争在万级规模的云原生环境下，挑战高效稳定、无损无感的云原生操作系统升级，给用户带来极致稳定的、功能新颖的云原生服务。 

### 为什么要持续迭代升级 ？

Kubernetes 社区的活跃度非常高，众多的云原生爱好者为社区贡献智慧，推动社区版本不断更新。升级是为了紧跟社区的步伐，及时享用社区沉淀下来的优秀特性，进而给公司带来更大利益。

### 为什么升级那么难 ？

按照蚂蚁 Sigma 的规模，升级对我们来讲是一件非常不容易的事情，主要体现在：

- 在升级准备阶段，要全量推动客户端进行升级，业务方要安排专门的人投入进来，耗时耗力；

- 在升级过程中，为了规避版本滚动时对 Kubernetes 资源操作可能带的来不可预期后果，升级过程中一般会关停流量，业务体感不好；

- 对于升级时间窗口选择，为了给用户更好的服务体验，升级要放到业务量少的时间进行，这对平台运维人员不太友好。

因此，升级过程中如何提升用户、研发、SRE 的幸福感是我们想要达成的目标。我们期望实现无损升级来降低升级风险，解耦用户来提升幸福感，高效迭代来提供更强大的平台能力，最终实现无人值守。

本文将结合蚂蚁 Sigma 系统升级实践，从 Kubernetes 系统升级的目标、挑战开始，逐步剖析相关的 Kubernetes 知识，针对这些挑战给出蚂蚁 Sigma 的一些原则和思考。

### 【两种不同的升级思路】

在介绍挑战和收益前，我们先了解下当前集群升级的方式。Kubernetes 升级与普通软件升级类似，主要有以下两种常见的升级方式：替换升级和原地升级。

- 替换升级：将应用运行的环境切换到新版本，将旧版本服务下线，即完成替换。在 Kubernetes 升级中，即升级前创建新版本的 Kubernetes 集群，将应用迁移到新的 Kubernetes 集群中，然后将旧版本集群下线。当然，这种替换升级可以从不同粒度替换，从集群为度则是切换集群；从节点维度，则管控节点组件单独升级后，kubelet 节点升级时迁移节点上的 Pod 到新版本节点，下线旧版本节点。

- 原地升级：将升级的软件包原地替换，旧服务进程停止，用新的软件包重新运行服务。在 Kubernetes 升级中，apiserver 和 kubelet 采用原地软件包更新，然后重启服务，这种方式与替换升级最大的区别在于节点上的 workload 不用迁移，应用不用中断，保持业务的连续性。

上述两种方式各有优缺点，蚂蚁 Sigma 采用的是原地升级。

### 方法论-庖丁解牛

采用原地升级时也必然会遇到原地升级的问题，其中最主要问题就是兼容性问题，主要包含两个方面：Kubernetes API 和组件内部的控制逻辑兼容性。

Kubernetes API 层面包含 API 接口、resource 结构和 feature 三方面变化，而组件内部控制逻辑变化主要是 resource 在 Kubernetes 内部流转行为的变化。

前者是影响用户及集群稳定性最重要的因素，也是我们重点解决的问题。

![图片](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*Nb0VS46XghAAAAAAAAAAAAAAARQnAQ)

API 接口的变化固然要涉及到客户端的升级，特别是对于 deprecated 和 removed 的 API，客户端无法再使用旧版本的 API 接口。resource 接口的变化主要指 resource 字段变化，字段的调整意味着 API 能力的变化，同一 resource 在新旧版本中存在字段上的差异会导致 API 能力上差异，主要体现在新增某个字段、废弃某个字段和字段默认值变化。feature 方面，主要是一些 feature 的 GA 导致 featrue 开关能力被移除，以及一些新的 feature 的加入。

面对上述的核心问题，我们将升级中遇到的兼容性问题按照升级阶段分为“升级前”、“升级中”和“升级后”三个阶段。

- 升级前，将面临大量客户端升级推动问题，通过探索版本之间的差异和多版本客户端并存的问题，我们来制定一些规则，这将大大减少客户端升级的数量，提升升级的效率。

- 升级中，将面临多版本 apiserver 并存的问题，以及数据的存储版本转换问题，当然还会有可回滚性的问题，这些问题我们将采用精细化流量控制能力避免篡改，压制 resource 存储版本和 GVK 版本保证可回滚，同时对于 etcd 中的数据进行版本迁移，如此实现无损升级和回滚。

- 升级后，对于少量的可能引发不可接受故障的客户端，我们通过识别资源修改请求意图，降低篡改的风险。

![图片](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*p3-jRJDr-QMAAAAAAAAAAAAAARQnAQ)

还有一个重要的环节，整个过程我们要做到自动化、可视化，在升级过程中流量的充分灰度是很有必要的，升级节奏的自动化推进和应急场景下的人工可控性也是非常重要的，这些将在另一篇文章中详细介绍。

整体来看，我们通过客户端最小化升级和滚动自动化升级能力、提升升级的效率，通过精细化流量控制、灰度可回滚能力以及长效的字段管控能力，提升整个升级过程的可靠性、稳定性。

## PART. 2 升级前

集群升级必然会有 API 的更新和迭代，主要体现在 API 新增、演进和移除，在 Kubernetes 中 API 的演进一般是 Alpha、beta、GA，一个 resouce 的 API version 会按照上述版本进行迭代，当一个 API 新增时，最开始是 Alpha 阶段，例如"cert-manager.io/v1alpha3"，经过若干次迭代，新特性进入 beta 版本，最后进入稳定的 GA 版本，这个过程可能跨若干个大的社区版本，一些版本会在 GA 版本稳定运行一定时间后被 deprached 掉，并且被 deprached 的 API 版本在一段时间后会被直接移除，这就对我们的客户端有了升级的刚性需求。

在介绍客户端升级前，先介绍下一般 resource API 变化有哪些方面。

### Schema 变化

不同版本的 Kubernetes 资源的 Schema 字段可能存在差异，主要表现在以下两个方面：

- 字段的增加/删除/修改
- 字段的默认值调整

#### 字段增删改

Kubernetes 的 resource 如果对某个字段的调整，包括：增加、删除、修改三种。对于“增加”操作，可以在新 GV(GroupVersion)出现也可以在旧 GV 中出现。对于“删除”和“修改”，一般只会在新的 GV 中出现。

基于以上条件，对于新版本 APISever 引入的 resource 字段调整，可以得出以下结论：

![图片](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*Eg7JR6w4WgEAAAAAAAAAAAAAARQnAQ)

#### 字段默认值变化

字段默认值变化是指，在新旧 apiserver 中 resource 某个字段默认值填充不一致。字断默认值变化可能带来的两个问题：

- container hash 变化，会导致容器重启

- 影响控制组件的控制动作

字段变化带来的影响主要在客户端新旧版本交叉访问和 apiserver 多版本并存交叉访问上，具体影响在下文中介绍。

### 客户端升级

客户端升级是为了兼容新版本 API，保证在升级后不出现问题，同时实现 operator 精确化、差异化升级，提升升级效率。低版本客户端不升级会遇到的如下问题：

#### 核心问题

按照新旧版本 GVK(GroupVersionKind)的变化梳理一下升级过程中低版本客户端可能出现的各种情况：

![图片](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*sZZgR5GDaUgAAAAAAAAAAAAAARQnAQ)

如上图所示，核心问题主要有以下三种：

1.低版本客户端访问已经被 depreached/removed 的 GroupVersionKind

2.低版本客户端操作的 resource 存在字段增加问题

3.低版本操作的 resource 存在字段默认值变化问题

针对第一个问题，访问已经被 depreached 特别是被 removed 的 GVK 时，服务器端直接返回类 404 错误，表示此 rest url 或者次 GVK 已经不存在。

针对第二个和第三个问题，都出现在低版本客户端的 Update 操作，为什么对于 patch 操作不会出现问题呢？因为 Update 操作是全量更新，patch 操作是局部更新，全量更新的情况下，如果客户端版本低没有新增字段或者没默认值变化的字段，此时去 Update 此 resource，提交的请求数据中不会出现此字段，但是此字段在 apiserver 内部会被补全和填充，如此此字段的值就完全依赖 apiserver 内部的逻辑了。

针对字段增加的情况，我们做了一个实验，如下：

1.18 版本中 Ingress 中多了一个 patchType 的字段，我们首先通过 1.18 的客户端进行创建，并设定 pathType=Prefix，然后通过 1.16 版本的客户端进行 Update，发现此职被修改为 pathType 的默认值。如下：

![图片](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*56wWTZymG4MAAAAAAAAAAAAAARQnAQ)

#### 思考与解决

针对第一个问题，处理方式比较明确，客户端必须升级，因为 GVK 已经从新版本的 apiserver 中移除了。按照 Kubernetes 社区的 API 废弃规则（给定类别的 API 版本在新的、稳定性未降低的 API 版本发布之前不可被废弃；除了每类 API 版本中的最新版本，旧的 API 版本在其被宣布被废弃之后至少一定时长内仍需被支持），我们可以显式地控制一些 API 向下兼容，来满足一些低版本客户端的需求，但是此方式不是无限的，在某个高版本中总是会被移除掉的，所以不推荐这么做来延迟或容忍客户端的升级。

针对第二个和第三个问题，都涉及到 Update 操作，因为 Update 操作会出现误操作的情况。如果用户客户端版本较低，但是用户并不关心 resource 的新增字段，也不想使用这些新功能，他可以完全不理会此字段，对于 create/delete/patch 都没有问题，同时 patch 操作也不会针对此字段进行。所以控制好 Update 操作的客户端就可以避免新增字段的篡改行为。

## PART. 3 升级中

Kubernetes 集群的升级主要包含客户端升级、核心组件升级，核心组件包括 apiserver、controller-manger、scheduler 和 kubelet。

这里的客户端是广义上的客户端，即业务的 operator 及管控的 operator 都称为客户端。客户端的升级由客户端自行做流量灰度，大版本升级过程中最核心的是 apiserver 升级过程中可能会出现脏数据问题。

这里提到的脏数据问题主要体现在以下两个方面：

- 多版本 apiserver 交叉操作同一资源

是高低版本 apiserver 中对有 Schema 变化资源的操作会出现篡改问题，其问题本质与多版本客户端操作同一有 Schema 变化的资源时发生的篡改一致。只不过这里是 apiserver 版本不一样，客户端版本是否一致都会引起篡改问题。

- 存储在 etcd 中的数据如何保证正确更新

是大家一般不太注意的问题，因为 apiserver 升级过程中会帮我们很好的处理，但也不是百分百完美处理，这里单独拿出来讲一下也有助于大家对 Kubernetes 数据存储有更深入的了解。

脏数据的问题在升级过程中很容易联想到可回滚性，我们无法保证升级百分百成功，但是我们一定要有可回滚能力，按照社区的建议 Kubernetes 在升级过程中不建议回滚，它会带来更多的兼容性问题。

上述这些问题将在下文详细讲述。

### 多版本 apiserver 并存

从升级的过程中可以看到，在流量管控时主要管控的流量有两项：

- Updateu/patch 动作的流量

- 剩余其他所有流量

这里重点提到的是 Update 流量，作为管控的主要原因也同低版本客户端篡改字段原因一样。

客户端的问题是，当 apiserver 都是高版本时，客户端存在高低版本同时操作同一 resource 时会出现篡改，所以我们会推动具有 Update 动作的客户端进行升级。

升级 apiserver 时另外一个问题出现了，从流程上看，升级过程中流量会同时打到 1.16 和 1.18 版本的客户端上，这样即使客户端高版本，通过不同版本的 apiserver 写操作同一 resource 同样会出现篡改现象。

#### 多版本 apiserver 交叉访问

此问题，我们同样按照前文提到的 resource 变化的类型来讲述。

- 字段变化

字段变化包含增加、删除和修改三种，对于删除和修改会在新的 GVK 中出现，所以我们只考虑增加的情形。如下图所示，Kubernetes 的 Pod 在 1.18 版本比 1.16 版本中多了一个字段"NewFiled"，升级过程中如果交叉访问同一 PodA 则会出现 PodA 存储的数据不断不断变化，首先通过 1.18 版本 apiserver 创建 PodA，然后通过 1.16 的 apiserver Update 后 PodA 的新增字段会被删除，再通过 1.18 版本的 apiserver Update 字段又被填充回来。

![图片](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*_cYAQ70fulAAAAAAAAAAAAAAARQnAQ)

针对此此问题，有以下结论：

（1）对于字段增加情况，当通过旧版本 apiserver 更新带有新字段的资源时存在字段默认值被删除的风险；对于字段删除和修改两种情况，无此风险；

（2）如果新增字段被用于计算 container hash，但由于 apiserver 升级时 kubelet 还处于 1.16 版本，所以依旧按照 1.16 版本计算 hash，apiserver 交叉变化不会导致容器重建。

- 字段默认值变化

字段默认值变化是指，在新旧 apiserver 中，对某个资源字段默认值填充不一致。如下图所示，1.16 版本的 Kubernetes 中 Pod 字段"FiledKey"默认值为"default_value_A"，到 1.18 版本时该字段默认值变为"default_value_B"，通过 1.18 apiserver 创建 PodA 后，再通过 1.16 版本 apiserver 更新会出现默认值被篡改的问题。这种情况的发生条件相对苛刻，一般 Update 之前会拉下集群中当前的 Pod 配置，更改关心的字段后重新 Update 回去，这种方式会保持默认值变化的字段值，但是如果用户不拉取集群 Pod 配置，直接 Update 就会出现问题。

![图片](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*-jRpSrkNwUwAAAAAAAAAAAAAARQnAQ)

针对此此问题，有以下结论：

- 某个字段在使用默认填充功能时，其值将依赖 apiserver 中 defaulting 值进行变化。

- 如果新增字段被用于计算 container hash，将引发容器重建风险。

思考与解决

前面介绍了多版本 apiserver 交叉访问的问题，接下来我们如何解此问题。

解决这个问题的本质是管控 Update/patch 两种操作的流量，说到这里可能有人会有疑问，通过多版本 apiserver 获取 resource 岂不是也有字段不同的问题？如果有，那么 get/watch 流量也需要管控。

这里有个前置事实需要讲一下，升级 apiserver 之前会存在多个版本的客户端，这些客户端有些能看到字段变化有些看不到，但是升级前是他们是一个稳定状态。高版本客户端看不到新增字段时也可以稳定运行，对新增字段带来的新特性并没有很强的依赖，对于低版本客户端压根儿看不到新增字段更不关心新特性。我们核心目标是保证升级过程中没有字段篡改的问题来规避升级过程中同一 resource 视图频繁切换，带来的不可控的管控行为。

蚂蚁 Sigma 已经落地管控层面的 Service Mesh 能力，那么在升级过程中利用强大的 mesh 能力来做精细化流量管控，规避了交叉访问的问题我们升级过程中的黑暗地带也会变得越来越窄，心里会踏实很多。

### etcd 数据存储更新

Kubernetes 中的数据存储有一套自己完整的理论，这里我们先简单介绍下 Kubernetes 中一个资源从请求进入到存入 etcd 的几次变换，之后再详细介绍升级过程中可能遇到的问题及我们的思考。

#### Kubernetes资源版本转换

- apiserver 中的资源版本

Kubernetes 中的 resource 都会有一个 internal version，因为在整个迭代过程中一个 resource 可能会对应多个 version，比如 deployment 会有extensions/v1beta1，apps/v1。

为了避免出现问题，kube-apiserver 必须要知道如何在每一对版本之间进行转换（例如，v1⇔v1alpha1，v1⇔v1beta1，v1beta1⇔v1alpha1），因此其使用了一个特殊的 internal version，internal version 作为一个通用的 version 会包含所有 version 的字段，它具有所有 version 的功能。Decoder 会首先把 creater object 转换到 internal version，然后将其转换为 storage version，storage version 是在 etcd 中存储时的另一个 version。

- apiserver request 处理

一次 request 请求在 apiserver 中的流转：

、、、Go
http filter chain          |  =>  |       http handler 

  auth ⇒ sentinel ⇒ apf         =>          conversion ⇒ admit ⇒ storage
、、、

一个资源读取/存储的过程如下：

![图片](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*rt3IR7OEnF8AAAAAAAAAAAAAARQnAQ)

#### 数据存储兼容性

本文将侧重讲解 Kubernetes 中 API resource 存储的数据在升级过程中如何保证兼容性的。主要回答以下两个问题：

问题一：Kubernetes 中存储在 etcd 中的 API resource 长什么样？

Kubernetes 中的 resource 都会有一个 internal version，这个 internal version 只用作在 apiserver 内存中数据处理和流转，并且这个 Internal version 对应的数据是当前 apiserver 支持的多个 GV 的全集，例如 1.16 中支持 apps/v1beta1 和 apps/v1 版本的 deployments。

但是存储到 etcd 时，apiserver 要先将这个 internal 版本转换为 storage 版本 storage 版本怎么确定的呢？

如下，分为两种情况：

- core resource

存储版本在 apiserver 初始化时确定，针对某个 GroupVersion 分两步确定其存储版本：

(1)确定与本 GV 使用同一存储版本 group resource ---> StorageFactory 中静态定义的 overrides

(2)在 group 中选择优先级最高的 version 作为存储版本---> Schema 注册时按照静态定义顺序获取

- custom resource

自定义 CR 的存储版本确定在 CRD 的配置中（详见：CRD 配置) [https://kubernetes.io/zh/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definition-versioning/](https://kubernetes.io/zh/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definition-versioning/)

问题二：不同版本的 Kubernetes 中 如何做到存储数据兼容？

storage version 在 Kubernetes 版本迭代更新中不是一成不变的，也会不断的更新。首先我们看一个 Kubernetes 中的存储版本的升级规则：给定 API 组的 “storage version（存储版本）”在既支持老版本也支持新版本的 Kubernetes 发布 版本出来以前不可以提升其版本号。

这条规则换句话说，当某个 Kubernetes 版本中某个 resource 的 storage version 有变化时，此版本的 Kubernetes 一定是同时支持新旧两个 storage version 的。如此加上 Schema 中多个 version 之间的转换能力，就能轻松做到版本的升级和降级了。

对于升级或者降级，apiserver 可以动态的识别当前 etcd 中存储的是什么版本的数据，并将其转换为 Internal 版本，然后写入到 etcd 时再转换为当前升级后的最新的 Storage Version 进行存入。

![图片](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*FnkDQrWbXiQAAAAAAAAAAAAAARQnAQ)

思考与解决

从上文可以看到，apiserver 具备动态转换存储版本的的能力，但是要对旧版本的数据进行一次读写操作。动态转换的能力也不是无限的，在某个 Kubernetes 版本中转换的版本是当前版本兼容支持的几个版本。

假设某个 resource 数据在 etcd 中一直没有读取，此时 Kubernetes的版本已经升了好几个版本，并且 apiserver 已经不再兼容 etcd 中的版本，当读取到此数据时就会报错，首先这条数据是无法再访问到了，严重的可能导致 apiserver crash。

因此我们需要在版本升级过程中保证把 etcd 中的数据都转换为最新版本。很自然的，大家会想到通过自己实现一个转换器来解决这个问题，思路没有问题，但这会给人一种重复造轮子的感觉，因为 apiserver 在各个版本中已经有了转换器的能力，我们只需要把原生的转换能力利用好就行，每次升级后用 apiserver 原有存储数据转换能力把数据做一下更新，这样可以轻松规避多次版本升级后数据残留或不兼容问题。不要小看这个动作，很容易被忽略，可以想象一下在原本就紧张的升级过程中突然出现 apiserver crash 的诡异现象，这个时候内心一定是崩溃的。

### 升级可回滚

提到升级大家自然地会想到回滚，Kubernetes 集群的升级类似业务应用的迭代发布，如果过程出现问题怎么办，最快速的止血方式就回退版本。

一个单体的应用服务很容易做到版本回退，但对于数据中心操作系统的回滚没有那么容易，其问题涉及到很多方面，这里我们认为以下几个问题是 Kubernetes 升级回滚中遇到的常见的棘手问题：

- API 不兼容，导致回退后组件调用失败

- etcd 中数据存储不兼容问题

### API 不兼容

API 兼容性问题前面已经详细讲述了 API 变化的几种类型，这里再提下主要为 API 接口的变化和 Schema 的字段变化。

对于 API 接口的变化问题并不大，原因是升级前所有控制器与客户端与低版本的 apiserver 已经达到一个稳定的状态，也就是说 API 接口是可用的，所以回退后问题不大。但是通常在升级到高的 apiserver 版本后会有一些新的 GVK 出现，如一些 Alpha 的能力出现或者 Beta 版本的 GV 变成了 GA 版本。

一个真实的例子：1.16 到 1.18 升级过程中新增了 v1beta1.discovery.k8s.io 这个 GV，这种情况下低版本的 apiserver 是不识别新版的 GV 的，apiserver 回滚后虽然能正常启动，但是在执行涉及到这个 GV 的操作时就会出问题，比如删除一个 namespace 时会删除这个 ns 下所有的资源，将遍历所有的 GV，此时会出现卡壳 ns 删不掉的现象。

另外一个是 Schema 的变化，对于回滚其实可以看成另外一种升级，从高版本“升级”到低版本，这个过程遇到的问题与低版本“升级”到高版本是一致的，即高低版本客户端访问篡改问题和多版本 apiserver 并存交叉访问问题，但是客户端问题在回滚过程中并不存在，因为高版本的客户端向下是兼容的。对于交叉访问的问题，交叉访问的问题同样会利用精细化流量控制做规避。

### etcd 数据存储不兼容

数据存储问题在升级过程中遇到，在回滚过程中同样遇到，其核心在当一个 resource 的存储版本在高版本的 apiserver 中发生了变化，并且新的存储 GV 在低版本的 apiserver 中不识别，导致回退后通过旧版本的 apiserver 获取对应资源时发生错误，这个错误就是发生在 Storagte Version 到 Internel Version 转换过程中。

一个例子：在 1.16 中 csinodes 的存储版本为 v1beta1，到 1.18 中升级成了 v1 版本，如果从 1.18 直接回退到 1.16，csinode 这个资源获取会出错，原因是 1.16 的 apiserver 中压根儿没有这个 v1 版本的 csinode。

![图片](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*oa1DTaHuBRkAAAAAAAAAAAAAARQnAQ)

讲到这里可能会有人问，为什么要跨版本升级呢？

上述这个问题如果是从 1.16 到 1.17 再到 1.18 逐个版本升级就不会出现了，这个想法非常好，但对于蚂蚁 Sigma Kubernetes 这种体量来讲频繁的升级难度较大，这也是我们做此事的原生动力，将升级变得更自动化、效率更高，当这个目标实现后此问题也就不复存在了，在当前阶段回退存储版本不兼容问题仍然棘手。

思考与解决

升级本身就是一次引入众多变量的操作，我们尽量做到在变化中找到一条能把控的路子，最基本的方法论就是控制变量，所以对于 API 兼容性问题，我们核心的原则为：新特性没有必要开启的先进性压制，保证可回滚。

压制的主要目标有两个：

- 高版本 apiserver 中新增的 GVK

保证它们在升级的这个版本中不会出现

- etcd 中的数据的存储版本

存储版本对用户是透明的，我们也要保证压制调整对用户也是无感的，调整和压制的手段可以通过对 apiserver 代码做兼容性调整来实现。

对于其他兼容性问题，目前没有很好的方案解决，当前我们的主要通过升级回滚 e2e 测试暴露问题，针对不兼容的问题做相应兼容性修改。

兼容性压制的手段只存在于升级过程中，也是升级过程中临时现象。压制调整的时候我们需要充分的考量是否会引入其他不可控问题，这个要具体看 GVK 自身的变化来定。当然，一切还要从理论回到实践，充分的 e2e 测试也是需要的。有了理论和测试两把利刃的加持，我相信兼容性问题会迎刃而解。

以上是升级过程中遇到的三个棘手的问题，以及相关的解决思路，接下来介绍下升级后的保障工作。

## PART. 4 升级后

大版本升级时无法保证 100% 的客户端都升级到对应的最新版本。虽然升级前我们会推动 Update 流量的客户端进行升级，但是可能做不到 100% 升级，更重要的，升级后可能也会出现某个用户用低版本的客户端进行访问。我们期望通过 webhook 能够避免升级后低版本客户端意外篡改 resource 字段，达到真正的升级无损的目的。

字段管控主要原则一句话总结：防止默认值变化的字段，被用户使用低版本客户端以 Update 的方式修改为新的 default 值。

### 字段管控

残留问题

字段管控的最大挑战是，如何准确的识别出用户是否是无意篡改字段。判断用户是否无意篡改需要拿到两个关键信息：

- 用户原始请求内容

用户原始请求内容是判断用户是否无意篡改的关键，如果原始请求中有某个字段的内容，说明用户是明确要修改，此时不需要管控。

- 用户客户端版本信息

否则，要看用户客户端版本是否低于当前集群版本，如果不低于集群版本说明用户有此字段明确修改不需要管控，如果低于集群版本这个字段用户可能看不到就需要管控了。

那么问题来了，如何拿到这两个信息呢？先说用户原始请求内容，这个信息按照 Kubernetes 的能力，我们无法通过 webhook 或者其他插件机制很轻松的拿到请求内容，apiserver 调用 webhook 时的内容已经是经过版本转换后的内容。

再说用户客户端版本信息，这个信息虽然可以从 apiserver 的监控中拿到，当然我们为了与管控链路对接，并不是直接拉取的监控信息，而是在 apiserver 中做了信息补充。

思考与解决

解决此问题本质上是理解“用户原始意图”，能够识别出哪些动作是无意的篡改哪些是真正的需求，此动作需要依赖以下两个信息：

- 用户原始请求信息

- 用户客户端版本信息

上述两个信息存在的获取和准确性问题是我们后续的工作方向之一，当前我们还没很好的办法。理解用户的意图并且是实时理解是非常困难的，折中办法是定义一套规则，按照规则来识别用户是否在使用低版本的客户端篡改一些核心字段，我们宁可误杀一千也不放过一个坏操作，因为造成业务容器的不符合预期，意外行为很轻松就会带来一个 P 级故障。

![图片](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*JFEHT5xWR68AAAAAAAAAAAAAARQnAQ)

## PART. 5 提升效果

以上的这些探索在蚂蚁 Sigma 已经实战，升级效率得到了很大的提升，主要体现在以下几个方面：

- 升级过程不用再停机了，发布时间缩短为 0，整个过程避免了大量 Pod 延迟交付，平台用户甚至没有任何体感，即使升级过程中排查问题也可以从容地应对，让升级过程更安静、更放松、更顺滑；

- 升级前期推动的客户端升级数量得到了大幅降低，数量减少了 80%，整体升级推动时间减少了约 90%，减少了 80% 的业务方人力投入，整个升级工作轻松了许多；

- 升级的过程实现了自动化推进，为了防止意外发生升级过程还可以随时实现人工介入，升级过程解放了 Sigma 研发和 SRE 的双手，可以端起咖啡看进度了；

- 升级过程实现流量精准化控制，针对集群上千个命名空间的流量按照规则实现了灰度测试，针对新版本实例进行几十次 BVT 测试，从两眼一抹黑到心中有底气的转变还是挺棒的。

![图片](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*VXfVS7vTcJ0AAAAAAAAAAAAAARQnAQ)

## PART. 6 未来之路

整体来讲，做好升级核心就是要做好兼容性这件事，同时也要把整个过程做的更自动化一些，观测性做的更好一些，接下来有几个方向的工作要继续进行：

1.更精准

当前在管控的信息获取上还有缺失，在流量的管控上当前采用 namespace 的维度来处理，这些都存在精度不够的问题。前面也提到过，我们正在进行管控组件 Mesh 化能力建设，未来会有更灵活的细粒度流量管控和数据处理能力。同时，借助 Mesh 能力，实现管控组件升级过程中多版本流量灰度测试，对升级做到精确、可控。

2.平台化

本文介绍的这些挑战和技术方案，其实都是升级过程中的一部分，整个过程包含了前期的客户端最小化升级、核心组件滚动升级和后续的管控，这个过程繁琐且易出错，我们期望把这些过程规范化、平台化，把类似差异化比对、流量管控、流量监控等的工具集成到平台中，让升级更方便。

3.更高效

社区迭代速度非常快，当前的迭代速度是无法跟上社区，我们通过上述更智能、平台化的能力，提升基础设施的升级速度。当然，升级的速度也与集群的架构有非常大的关系，后续蚂蚁会走向联邦集群的架构，在联邦架构下可以对特定的用户 API 做向前兼容和转换，由此可以极大地解耦客户端与 apiserver 的升级关系。

对于蚂蚁 Sigma 规模级别的 Kubernetes 集群来讲升级不是一件容易的事，Sigma 作为蚂蚁最核心的运行底座，我们想做到通过技术手段让基础设施的迭代升级达到真正的无感、无损，让用户不再等待，让自己不再焦虑。面对 Kubernetes 这个庞然大物要实现上述目标颇有挑战性，但这并不能阻止我们探索的步伐。道长且阻，行则将至，作为全球 Kubernetes 规模化建设头部的蚂蚁集团将继续向社区输出更稳定、更易用的技术，助力云原生成为技术驱动发展的核心动力。

![图片](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*PUPxQ4kmKUMAAAAAAAAAAAAAARQnAQ)

蚂蚁 Sigma 团队致力于规模化云原生调度平台的建设，为业务提供更快更好更稳的容器资源交付，近期我们在集群稳定性、高性能方面也取得了显著的成果，欢迎大家相互交流。

「参考资料」

[Kubernetes API 策略](https://kubernetes.io/docs/reference/using-api/deprecation-policy/)

[Kubernetes 1.16 版本介绍](https://kubernetes.io/blog/2019/07/18/api-deprecations-in-1-16/)

[Kubernetes 集群正确升级姿势](https://www.cnblogs.com/gaorong/p/11266629.html)

求贤若渴：

蚂蚁集团 Kubernetes 集群调度系统支撑了蚂蚁集团在线、实时业务的百万级容器资源调度, 向上层各类金融业务提供标准的容器服务及动态资源调度能力, 肩负蚂蚁集团资源成本优化的责任。我们有业界规模最大 Kubernetes 集群，最深入的云原生实践，最优秀的调度技术。

欢迎有意在 Kubernetes/云原生/容器/内核隔离混部/调度/集群管理深耕的同学加入，北京、上海、杭州期待大家的加入。

联系邮箱:  xiaoyun.maoxy@antgroup.com

### 本周推荐阅读  

[攀登规模化的高峰 - 蚂蚁集团大规模 Sigma 集群 ApiServer 优化实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247495579&idx=1&sn=67d0abc1c513ba4f815550d235b7a109&chksm=faa30041cdd489577c0e3469348ebad2ab2cc12cdfebca3a4f9e8dcd5ba828a76f500e8c0115&scene=21#)

[蚂蚁集团万级规模 k8s 集群 etcd 高可用建设之路](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247491409&idx=1&sn=d6c0722d55b772aedb6ed8e34979981d&chksm=faa0f08bcdd7799dabdb3b934e5068ff4e171cffb83621dc08b7c8ad768b8a5f2d8668a4f57e&scene=21#)

[蚂蚁大规模 Sigma 集群 Etcd 拆分实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247500192&idx=1&sn=7ceb084796e30cb4d387ede22b45d7f5&chksm=faa32e7acdd4a76c94fa2b2bb022d85f3daa78b1b3c2d4dae78b9cc5d77011eecddfd12df1c2&scene=21#)

[Service Mesh 在中国工商银行的探索与实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247499122&idx=1&sn=9733d1c015e7b0e8e64bd5cf44118b10&chksm=faa312a8cdd49bbec97612e9756ef4372c446c410518a04bd0ae990a60fea9b8e78025e60c6d&scene=21#)

![img](https://gw.alipayobjects.com/zos/bmw-prod/75d7bde6-1f48-4f28-80a4-215f8ec811bd.webp) 
