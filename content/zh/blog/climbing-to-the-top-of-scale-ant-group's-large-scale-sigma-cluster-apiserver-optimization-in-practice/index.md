---
title: "攀登规模化的高峰 - 蚂蚁集团大规模 Sigma 集群 ApiServer 优化实践"
author: "唐博、谭崇康"
authorlink: "https://github.com/sofastack"
description: "攀登规模化的高峰 - 蚂蚁集团大规模 Sigma 集群 ApiServer 优化实践"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2021-09-28T15:00:00+08:00
cover:"https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*9RzaQYsl9pYAAAAAAAAAAAAAARQnAQ"
---

文｜唐博（花名：**博易** 蚂蚁集团技术专家)

​ 谭崇康（花名：**见云** 蚂蚁集团高级技术家)

本文 10316 字 阅读 18 分钟

▼

蚂蚁集团运行着全球最大的 Kubernetes（内部称为 Sigma) 集群之一。Kubernetes 社区官方以 5K node 作为 Kubernetes 规模化的事实标准，而蚂蚁集团在 2019 年的时候，就已经维护着单集群规模超过 1W node 的 Kubernetes 集群。

这不仅仅是单集群节点量级上的差异，更是业务规模的差异，业务多样化和复杂度上的差异。

一个形象化的比喻就是，如果官方以及跟着官方的 Kubernetes 使用者能想象到的 Kubernetes 的集群规模是泰山，那么蚂蚁集团在官方的解决方案之上已经实现了一个珠穆朗玛峰。

蚂蚁集团的 Kubernetes 的演进，从 2018 年至今已经走过了 3 年多的岁月，虽然在 2019 年的时候就构建了万台集群的规模，但时至今日，无论是业务形态还是集群的服务器都发生了巨大的变化。

**-** 首先，当时的集群万台节点，主要还是偏小规格的服务器，而如今都是大机型，虽然机器的数量也是万台，实际管理的 CPU 数量已经成倍增长。

**-** 其次是当时集群里面几乎全量是 Long running 的在线业务，Pod 的创建频率每天只有几千个，如今我们的集群上几乎跑满了流式计算和离线计算业务等按需分配的 Pod，因此在 Pod 数量上成倍增长，实际管理的 Pod 数量超过了百万。

**-** 最后，是 Serverless 的业务快速发展，Serverless Pod 的生命周期基本在分钟级甚至是秒级，集群每天的 Pod 创建量也超过了几十万，伴随着大量的 Kubernetes list watch 和 CRUD 请求，集群的 apiserver 承受了数倍于以往的压力。

因此在业务 Serverless 的大背景下，我们在蚂蚁启动了大规模 Sigma 集群的性能优化方案，根据业务的增长趋势，我们设定的目标是，构建 1.4W 个节点规模的集群，同时通过技术优化，期望达成在请求延迟上不会因为规模的原因有所下降，能够对齐社区标准，即 create/update/delete 请求的天级别 P99 RT 在 1s 之内。

可想而知，挑战是非常巨大的。

## PART. 1 大规模集群的挑战

毋庸置疑，大规模集群带来了很多挑战：

**-** 随着集群规模增大，故障的爆炸半径也将扩大。Sigma 集群承载了蚂蚁集团诸多重要应用，保障集群的稳定和业务的稳定是最基础也是优先级最高的要求。

**-** 用户大量的 list 操作，包括 list all，list by namespace，list by label 等，均会随着集群的规模增大而开销变大。这些合理或者不合理的 list 请求，将让 apiserver 的内存在短时间内快速增长，出现 OOM 异常，无法对外响应请求。此外，业务方的 list 请求也会因为 apiserver 无法处理请求而不断重试，造成 apiserver 重启后因过载不可恢复服务能力，影响整个集群的可用性。

**-** 大量 List 请求透过 apiserver 直接访问 etcd 服务，也会让 etcd 实例的内存剧增而出现 OOM 异常。

**-** 随着业务量的增长，特别是离线任务的增多，create/update/delete 等请求的数量也迅速增加，导致客户端请求 apiserver 的 RT 极速上升，进而使得调度器和一些控制器因为选主请求超时而丢主。

**-** 业务量增长将加剧 etcd 由于 compact 等操作自身存在的性能问题，而使 etcd 的 P99 RT 暴涨，进而导致 apiserver 无法响应请求。

**-** 集群中的控制器服务，包括 Kubernetes 社区自带的控制器例如 service controller，cronjob controller 以及业务的 operator 等，自身存在的性能问题都将在大规模集群面前被进一步放大。这些问题将进一步传导到线上业务，导致业务受损。

如计算机学科的古老格言所说：

「 All problems in computer science can be solved by another level of indirection, except for the problem of too many layers of indirection... and the performance problems. 」

大规模集群既是照妖镜，也是试金石。

## PART. 2 大规模集群的收益

诚然，构建一个大规模的 Kubernetes 集群也提供了诸多收益：

**-** 为运行大型服务提供更为便利的基础设施 ，便于应对业务扩容时大幅飙升的资源需求。例如在双十一等电商大促活动期间，可以通过扩展现有集群而不是新建其它小集群来应对业务的增长。同时集群管理者可以管理更少的集群，并且以此来简化基础架构管理 。

**-** 为大数据和机器学习的离线计算任务提供更多的资源，为分时复用/分时调度等调度手段提供更大的施展空间，让离线的计算任务在在线业务的低峰期时可以使用更多的资源进行计算，享受极致弹性和极速交付。

**-** 还有非常重要的一点，在更大的集群中可以通过更加丰富的编排调度手段来更为有效地提升集群整体的资源利用率。

## PART. 3 SigmaApiServer性能优化

Sigma apiserver 组件是 Kubernetes 集群的所有外部请求访问入口，以及 Kubernetes 集群内部所有组件的协作枢纽。apiserver 具备了以下几方面的功能:

**-** 屏蔽后端数据持久化组件 etcd 的存储细节，并且引入了数据缓存，在此基础上对于数据提供了更多种类的访问机制。

**-** 通过提供标准 API，使外部访问客户端可以对集群中的资源进行 CRUD 操作。

**-** 提供了 list-watch 原语，使客户端可以实时获取到资源中资源的状态。

我们对于 apiserver 性能提升来说可以从两个层面进行拆解，分别是 apiserver 的启动阶段和 apiserver 的运行阶段。

**apiserver** **启动阶段** **的性能优化有助于**：

**-** 减少升级变更影响时长/故障恢复时长，减少用户可感知的不可用时间，给 Sigma 终端用户提供优质的服务体验（面向业务的整体目标是 Sigma 月度可用性 SLO 达到 99.9%，单次故障不可用时间 < 10min）。

**-** 减少因为发布时客户端重新 list 全量资源而导致的 apiserver 压力过大情况出现。

**apiserver** **运行阶段** **的性能优化的意义在于：**

**-** 稳定支持更大规模的 Kubernetes 集群。

**-** 提高 apiserver 在正常平稳运行的状态中，单位资源的服务能力；即提高可以承受的请求并发和 qps， 降低请求 RT。

**-** 减少客户端的超时以及超时导致的各种问题；在现有资源下提供更多的流量接入能力；

 **整体优化思路** 

构建一个大规模的 Kubernetes 集群以及性能优化不是一件容易的事，如 Google Kubernetes Engine K8s 规模化文章所言：

「The scale of a Kubernetes cluster is like a multidimensional object composed of all the cluster’s resources—and scalability is an envelope that limits how much you can stretch that cube. The number of pods and containers, the frequency of scheduling events, the number of services and endpoints in each service—these and many others are good indicators of a cluster’s scale. 

The control plane must also remain available and workloads must be able to execute their tasks.

What makes operating at a very large scale harder is that there are dependencies between these dimensions. 」

也就是说，集群的规模化和性能优化需要考虑集群中各个维度的信息，包括 pod、node，configmap、service、endpoint 等资源的数量，pod 创建/调度的频率，集群内各种资源的变化率等等，同时需要考虑这些不同维度之间的互相的依赖关系，不同维度的因素彼此之间构成了一个多维的空间。

>![图片](https://gw.alipayobjects.com/zos/bmw-prod/56328339-77a8-4a9c-90d2-7fa2805cd195.webp)

为了应对如此多的变量对大规模集群带来的复杂影响，我们采用了探索问题本质以不变应万变的方法。为了可以全面而且系统化地对 apiserver 进行优化，我们由下到上把 apiserver 整体分为三个层面，分别为存储层（storage）、缓存层（cache）、访问层（registry/handler）。

**-** 底层的 etcd 是 Kubernetes 元数据的存储服务，是 apiserver 的基石。存储层提供 apiserver 对 etcd 访问功能，包括 apiserver 对 etcd 的 list watch，以及 CRUD 操作。

**-** 中间的缓存层相当于是对 etcd 进行了一层封装，提供了一层对来自客户端且消耗资源较大的 list-watch 请求的数据缓存，以此提升了 apiserver 的服务承载能力。同时，缓存层也提供了按条件搜索的能力。

**-** 上面的访问层提供了处理 CRUD 请求的一些特殊逻辑，同时对客户端提供各种资源操作服务。

针对上面提出的不同层面，一些可能的优化项如下：

>![图片](https://gw.alipayobjects.com/zos/bmw-prod/d861fe12-8f4b-4004-957f-a4d2961ec5a8.webp)

同时，为了更好地衡量 apiserver 的性能，我们为 Kubernetes apiserver 制定了详细的 SLO，包括 create/update/delete 等操作的 P99 RT 指标，list 在不同规模资源情况下的 P99 RT 指标等。

同时，在 SLO 的牵引下对 apiserver 进行优化，让我们可以在一个更大规模的 Kubernetes 集群下依然为用户提供更好的 API 服务品质。

### 缓存层优化 

**「List 走 watchCache」**

由于 apiserver 在从 etcd list 数据时会获取大量数据，并且进行反序列化和过滤操作，因此会消耗大量内存。一些用户的客户端包含了不规范的访问 apiserver 的行为，例如某些客户端可能每隔几秒就会 list 一次，并且不带有 resourceversion。这些客户端对于 apiserver 造成了很大的内存压力，也曾经险些造成集群故障。为了应对这些不规范的用户访问，以及减少 apiserver 的 CPU/memory 消耗，我们对 list 操作进行了修改，让用户的不规范 list 操作全部走 watchCache。也就是说，用户在进行 list 操作时，请求将不会透传到后端的 etcd 服务。

在我们的一个大规模集群中，apiserver 内存会飙升到 400G 导致几十分钟便会出现 OOM，期间 apiserver 对于 etcd 的访问的 RT 也会高达 100s 以上，几乎不可用。在让用户全部 list 操作走 apiserver 的 watchCache 之后，apiserver 的内存基本稳定在 100G 左右，有 4 倍的提升，RT 也可以稳定在 50ms 量级。List 走 watchCache 也是出于 list-watch 原语的最终一致性考虑的，watch 会持续监听相关资源的信息，因此不会有数据一致性的影响。

后续我们也在考虑是否可以把 get 操作也从 watchCache 进行操作，例如等待 watchCache 一定毫秒的时间进行数据同步，以此进一步减小 apiserver 对 etcd 的压力，同时也可以继续保持数据一致性。

**「watchCache size 自适应」**

在资源变化率（ churn rate）比较大的集群中，apiserver 的 watchCache 大小对 apiserver 的整体稳定性和客户端访问量多少起着很大的作用。

太小的 watchCache 会使得客户端的 watch 操作因为在 watchCache 里面查找不到相对应的 resource vesion 的内容而触发 too old resource version 错误，从而触发客户端进行重新 list 操作。而这些重新 list 操作又会进一步对于 apiserver 的性能产生负面的反馈，对整体集群造成影响。极端情况下会触发 **list -> watch -> too old resource version -> list** 的恶性循环。相应地，太大的 watchCache 又会对于 apiserver 的内存使用造成压力。

因此，动态地调整 apiserver watchCache 的大小，并且选择一个合适的 watchCache size 的上限对于大规模大规模集群来说非常重要。

我们对于 watchCache size 进行了动态的调整，根据同一种资源（pod/node/configmap) 的变化率(create/delete/update 操作的频次)* 来动态调整 watchCache 的大小；并且根据集群资源的变化频率以及 list 操作的耗时计算了 watchCache size 大小的上限。

在这些优化和改动之后，客户端的 watch error（too old resource version）几乎消失了。

>![图片](https://gw.alipayobjects.com/zos/bmw-prod/55fee62e-a37f-4594-8d11-0abfdb4c3967.webp)

**「增加 watchCache index」**

在分析蚂蚁集团的业务之后发现，新计算（大数据实时/离线任务，机器学习离线任务）的业务对于各种资源的 list 有特定的访问模式，spark 和 blink 等业务方有大量的 list by label 操作，也就是通过标签来查找 pod 的访问量很多。

通过对 apiserver 日志进行分析，我们提取出了各个业务方 list by label 比较多的操作，并且在 watchCache 增加了相应地增加了相关 label 的索引。在对同等规模的资源进行 list by label 操作时，客户端 RT 可以有 4-5 倍的提升。

下图为上述 watchCache 优化内容简介:

>![图片](https://gw.alipayobjects.com/zos/bmw-prod/846c757e-1660-40f2-8cc9-2dafc6981070.webp)

### 存储层优化 

在资源更新频率比较快的情况下，GuaranteedUpdate 会进行大量的重试，同时造成不必要的 etcd 的压力。Sigma 给 GuaranteedUpdate 增加了指数退避的重试策略，减少了 update 操作的冲突次数，也减少了 apiserver 对于 etcd 的更新压力。

在大规模高流量集群中，我们发现  apiserver 的一些不合理的日志输出会造成 apiserver 严重的性能抖动。例如，我们调整了 GuaranteedUpdate/delete 等操作在更新或者删除冲突时的日志输出级别。这减少了磁盘 io 操作，降低了客户端访问 apiserver 的请求响应时间。此外，在集群资源变化率很高的情况下，" fast watch slow processing" 的日志也会非常多。这主要是表明 apiserver 从 etcd watch 事件之后，在缓存里面构建 watchCache 的速率低于从 etcd watch 到事件的速率，在不修改 watchCache 数据结构的情况下暂时是无法改进的。因此我们也对 slow processing 日志级别进行了调整，减少了日志输出。

### 接入层优化 

Golang profiling 一直是用于对 Go 语言编写的应用的优化利器。在对 apiserver 进行线上 profiling 的时候，我们也发现了不少热点，并对其进行了优化。

例如：

**-** 在用户 list event 时可以看到 events.GetAttrs/ToSelectableFields 会占用很多的 CPU，我们修改了 ToSelectableFields， 单体函数的 CPU util 提升 30%，这样在 list event 时候 CPU util 会有所提升。

>![图片](https://gw.alipayobjects.com/zos/bmw-prod/11c89953-0858-49cf-b140-53f3a0e99081.webp)

**-** 另外，通过 profiling 可以发现，当 metrics 量很大的时候会占用很多 CPU，在削减了 apiserver metrics 的量之后，大幅度降低了 CPU util。

>![图片](https://gw.alipayobjects.com/zos/bmw-prod/2f42ffbc-9357-44d1-aee8-e7a821442588.webp)

**-** Sigma apiserver 对于鉴权模型采用的是 Node、RBAC、Webhook，对于节点鉴权，apiserver 会在内存当中构建一个相对来说很大的图结构，用来对 Kubelet 对 apiserver 的访问进行鉴权。

当集群出现大量的资源（pod/secret/configmap/pv/pvc）创建或者变更时，这个图结构会进行更新；当 apiserver 进行重启之后，图结构会进行重建。在大规模集群中，我们发现在 apiserver 重启过程中，Kubelet 会因为 apiserver 的 node authorizer graph 还在构建当中而导致部分 Kubelet 请求会因为权限问题而受阻。定位到是 node authorizer 的问题后，我们也发现了社区的修复方案，并 cherry-pick 回来进行了性能上的修复提升。

etcd 对于每个存储的资源都会有 1.5MB 大小的限制，并在请求大小超出之后返回 etcdserver: request is too large；为了防止 apiserver 将大于限制的资源写入 etcd，apiserver 通过 limitedReadBody 函数对于大于资源限制的请求进行了限制。我们对 limitedReadBody 函数进行了改进，从 http header 获取 Content-Length 字段来判断 http request body 是否超过了 etcd 的单个资源（pod，node 等）的 1.5MB 的存储上限。

当然也不是所有方案都会有所提升。例如，我们进行了一些其它编码方案测试，把 encoding/json 替换成为了 jsoniter。相比之下，apiserver 的 CPU util 虽有降低但是 memory 使用有很大的增高，因此会继续使用默认的 encoding/json。

### etcd 拆分相关优化

除此之外，etcd 拆分对于客户端访问 apiserver 的请求的 RT 也有很大提升。在大规模集群中，我们采用了多份拆分方式，其中一份 etcd 是 Pod。在 etcd 拆分的过程中，我们发现拆分出来的 etcd 的 resource version 会小于原有 apiserver 的resource version，因此会导致客户端 list-watch apiserver 时长时间 hang ，无法收到新的 Pod 相关的事件。

为了解决这个 etcd 拆分时遇到的问题，我们对 apiserver 的 watch 接口进行了修改，增加了 watch 操作的 timeout 机制。客户端的 watch 操作最多等待 3s，如果 resource version 不匹配，直接返回 error 让 客户端进行重新 list ，以此避免了在 etcd 拆分过程中造成的客户端因 resource version hang 住的问题。

### 其它优化

除此之外为了保障 apiserver 的高可用，蚂蚁 Kubernetes apiserver 进行了分层分级别的限流，采用了 sentinel-go 加 APF 的限流方案。其中 sentinel-go 来限制总量，进行了 ua 维度，verb 维度等多维度混合限流，防止服务被打垮，APF 来保障不同业务方之间的流量可以公平介入。然而，sentinel-go 中自带了周期性内存采集功能，我们将其关闭之后带来了一定的 CPU 利用率的提升。

另外，我们也在和客户端一起优化 apiserver 的访问行为。截止目前，Sigma 和业务方一起对 blink operator（flink on K8s）/ tekton pipeline / spark operator 等服务进行了 apiserver 使用方式方法上的代码优化。

### 优化效果

下图分别为我们两个集群分钟级别流量的对比，其中一个集群的业务由于业务合并有了一个跨越式的增长，集群的节点规模范围，超过万台。可以看出来，随着业务的逐渐上升，集群的压力出现了数倍的压力提升。各类写请求都有明显的上升。其中 create 和 delete 请求比较明显，create 请求由每分钟 200 个左右上升到了每分钟 1000 个左右，delete 请求由每分钟 2.7K 个 上升到了 5.9K 个。经过我们的优化，随着业务方面的迁移逐步推进，在规模和负载持续上升的背景下，整体集群运行平稳，基本上达成了集群优化的预期。

>![图片](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*tEIXQq8h7x4AAAAAAAAAAAAAARQnAQ)

### 基础资源 

在各类型的流量随着业务增长有不同程度的上升的情况下，经过优化，apiserver CPU 利用率下降了约 7%。但是在内存上，增多了 20% 左右，这是因为 watchCache 在开启动态调整后相比之前缓存了更多的不同类别资源（node/pod等）的对象。

缓存更多资源对象带来的收益是，减少了客户端的重连并且降低了 list 操作个数，同时也间接减少了客户端各类操作的 RT，提升了整体集群和运行的业务的稳定性。当然后续也会继续针对减少 apiserver 的内存使用量进行优化。

>![图片](https://gw.alipayobjects.com/zos/bmw-prod/76129a02-be81-4bde-9ef7-2a4c123a7394.webp)

### RT

写请求的 RT 对于集群和业务的稳定性是最关键的指标之一。经优化过后，客户端访问 apiserver 的各类写请求的 P99，P90，P50 RT 均有明显的下降，并且数值更加趋于平稳，表明 apiserver 在向着高效且稳定的方向发展。

>![图片](https://gw.alipayobjects.com/zos/bmw-prod/34482827-5e0f-40af-8de7-8b94d7aaa0b2.webp)

（注：RT 对比在包括 etcd 拆分之后进行）

### Watch error 和 list 个数

不合理的 watchCache 大小会使得客户端的 watch 操作因为在 watchCache 里面查找不到相对应的 resource vesion 的内容而触发 too old resource version 错误，也就是下面的 watch error，进而会引发客户端对 apiserver 的重新 list。

在优化之后，pod 的每分钟 watch error 的个数下降约 25%，node 的 watch error 下降为 0；相应的 list 操作个数每分钟也下降了 1000 个以上。

>![图片](https://gw.alipayobjects.com/zos/bmw-prod/8ffedb09-78b7-435f-8313-3d27d54fa0ee.webp)

## PART. 4 未来之路

总体来说，提升一个分布式系统整体的能力，我们可以从以下方面入手：

1.提升系统自身架构，提高稳定性与性能

2.管理系统接入方的流量，优化系统接入方的使用方法和架构

3.对系统依赖的服务进行优化

对应到 apiserver 的性能优化来说，未来我们还将从以下几个方面继续深入：

>![图片](https://gw.alipayobjects.com/zos/bmw-prod/82717309-8f99-45c2-9031-4136e65f5a15.webp)

1. 针对 apiserver 自身，一些可能的优化点包括：优化 apiserver 启动总时间，提升 watchCache 构建速度；threadSafeStore 数据结构优化；对 get 操作采用缓存；对 apiserver 存入 etcd 的数据进行压缩，减小数据大小，借此提升 etcd 性能 等等。

2. 除了优化 apiserver 本身之外，蚂蚁 Sigma 团队也在致力于优化 apiserver 上下游的组件。例如 etcd 多 sharding，异步化等高效方案；以及对于各种大数据实时和离线任务的 operator 的整体链路的优化。

3. 当然 SLO 的牵引必不可少，同时也会在各个指标的量化上进行增强。只有这些协调成为一个有机的整体，才能说我们有可能达到为运行在基础设施上面的业务方提供了优质的服务。

构建大规模集群道阻且长。

后续我们会继续在上面列举的各方面进一步投入，并且为更多的在线任务、离线任务、新计算任务提供更好的运行环境。

同时，我们也将进一步提升方法论，从缓存、异步化、水平拆分/可扩展性、合并操作、缩短资源创建链路等大方向上进行下一步的优化。随着集群规模的继续增长，性能优化的重要性也会日益凸显，我们将朝着构建和维护对于用户来说高效可靠高保障的大规模 Kubernetes 集群这一目标继续努力，就像 Kubernetes 这个名字的寓意一样，为应用程序保驾护航！

「参考资料」

.【Kubernetes Scalability thresholds】

[https://github.com/kubernetes/community/blob/master/sig-scalability/configs-and-limits/thresholds.md](https://github.com/kubernetes/community/blob/master/sig-scalability/configs-and-limits/thresholds.md)

.【Kubernetes scalability and performance SLIs/SLOs】

[https://github.com/kubernetes/community/blob/master/sig-scalability/slos/slos.md](https://github.com/kubernetes/community/blob/master/sig-scalability/slos/slos.md)

.【Watch latency SLI details】

[https://github.com/kubernetes/community/blob/master/sig-scalability/slos/watch_latency.md](https://github.com/kubernetes/community/blob/master/sig-scalability/slos/watch_latency.md)

.【Bayer Crop Science seeds the future with 15000-node GKE clusters】

[https://cloud.google.com/blog/products/containers-kubernetes/google-kubernetes-engine-clusters-can-have-up-to-15000-nodes](https://cloud.google.com/blog/products/containers-kubernetes/google-kubernetes-engine-clusters-can-have-up-to-15000-nodes)

.【Openstack benchmark】

[https://docs.openstack.org/developer/performance-docs/test_results/container_cluster_systems/kubernetes/API_testing/index.html](https://docs.openstack.org/developer/performance-docs/test_results/container_cluster_systems/kubernetes/API_testing/index.html)


「求贤若渴」

蚂蚁集团 Kubernetes 集群调度系统支撑了蚂蚁集团在线、实时业务的百万级容器资源调度, 向上层各类金融业务提供标准的容器服务及动态资源调度能力, 肩负蚂蚁集团资源成本优化的责任。我们有业界规模最大 Kubernetes 集群，最深入的云原生实践，最优秀的调度技术。欢迎有意在 Kubernetes/云原生/容器/内核隔离混部/调度/集群管理深耕的同学加入，北京、上海、杭州期待大家的加入。

联系邮箱 ***xiaoyun.maoxy@antgroup.com***

 **本周推荐阅读** 

[SOFAJRaft 在同程旅游中的实践](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247495260&idx=1&sn=a56b0f82159e551dec4752b7290682cd&chksm=faa30186cdd488908a73792f9a1748cf74c127a792c5c484ff96a21826178e2aa35c279c41b3&scene=21#wechat_redirect)

[技术风口上的限流](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247494701&idx=1&sn=f9a2b71de8b5ade84c77b87a8649fa3a&chksm=faa303f7cdd48ae1b1528ee903a0edc9beb691608efd924189bcf025e462ea8be7bc742772e1&scene=21#wechat_redirect)

[蚂蚁集团万级规模 k8s 集群 etcd 高可用建设之路](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247491409&idx=1&sn=d6c0722d55b772aedb6ed8e34979981d&chksm=faa0f08bcdd7799dabdb3b934e5068ff4e171cffb83621dc08b7c8ad768b8a5f2d8668a4f57e&scene=21#wechat_redirect)

[2021 年云原生技术发展现状及未来趋势](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247492248&idx=1&sn=c26d93b04b2ee8d06d8d495e114cb960&chksm=faa30d42cdd48454b4166a29efa6c0e775ff443f972bd74cc1eb057ed4f0878b2cb162b356bc&scene=21#wechat_redirect)

![图片](https://gw.alipayobjects.com/zos/bmw-prod/6cea061a-33ed-4997-a022-640132d7fa13.webp)
