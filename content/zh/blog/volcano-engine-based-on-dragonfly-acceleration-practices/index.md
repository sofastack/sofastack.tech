---
title: "火山引擎基于 Dragonfly 加速实践"
authorlink: "https://github.com/sofastack"
description: "火山引擎基于 Dragonfly 加速实践"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2023-03-21T15:00:00+08:00
cover: "https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*jR46Q5l39RkAAAAAAAAAAAAADrGAAQ/original"

---

![图片](https://mmbiz.qpic.cn/mmbiz_gif/nibOZpaQKw09ARcsGuzib3ttcN4LZpdAC0n9KTQp7uibF8ia0ibk3Olf3sib50ExibicicOrzCOVrOyUD2dFib84f0fTx5uA/640?wx_fmt=gif&wxfrom=5&wx_lazy=1)

文｜黄逸炀 

Dragonfly Maintainer

字节跳动火山引擎软件工程师

专注于镜像存储及镜像 P2P 分发

**PART. 0**

**背景**

火山引擎镜像仓库 CR 使用 TOS 来存储容器镜像。目前在一定程度上能满足并发大规模的镜像拉取。然而最终拉取的并发量受限于 TOS 的带宽和 QPS。

这里简单介绍一下目前针对于大规模拉镜像遇到的两个场景的问题：

1、客户端数量越来越多，镜像越来越大，TOS 带宽最终无法满足需求。
2、如果客户端使用了 Nydus 对镜像格式做转换之后，对 TOS 的请求量会有数量级的增加，TOS API 的 QPS 限制导致无法满足需求。

不论是镜像仓库服务本身还是背后的存储，最终肯定是有带宽和 QPS 限制的。如果单纯依赖服务端提供的带宽和 QPS，很容易就无法满足需求。因此需要引入 P2P ，减轻服务端压力，进而满足大规模并发拉取镜像的需求。

**PART. 1**

**基于 P2P 技术镜像分发系统调研**

目前开源社区有几个 P2P 项目，这里对这些项目进行简单介绍。

**Dragonfly**

**架构图**

![图片](https://mmbiz.qpic.cn/mmbiz_png/nibOZpaQKw08g4b8VzZ3YJtheJicaoOOhpSJ87kBXVKEib1OV2hsPSenk6fibxI2F44BzHHYCs55bvib7kaD6m0rbog/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

**术语**

**Manager**

1、存储动态配置供 Seed Peer 集群、Scheduler 集群以及 Dfdaemon 消费。

2、维护 Seed Peer 集群和 Scheduler 集群之间关联关系。

3、提供统一异步任务管理，用作预热等功能。

4、监听各模块是否健康运行。

5、为 Dfdaemon 筛选最优 Scheduler 集群调度使用。

6、提供可视化控制台，方便用户操作管理 P2P 集群。

**Scheduler**

1、基于机器学习的多场景自适应智能 P2P 节点调度, 为当前下载节点选择最优父节点。

2、构建 P2P 下载网络的有向无环图。

3、根据不同特征值评估节点下载能力, 剔除异常节点。

4、当下载失败情况，主动通知 Dfdaemon 进行回源下载。

**Dfdaemon**

1、基于 gRPC 提供下载功能, 并提供多源适配能力。

2、开启 Seed Peer 模式可以作为 P2P 集群中回源下载节点, 也就是整个集群中下载的根节点。

3、为镜像仓库或者其他 HTTP 下载任务提供代理服务。

4、下载任务基于 HTTP 或 HTTPS 或其他自定义协议。

**Kraken**

**架构图**

![图片](https://mmbiz.qpic.cn/mmbiz_png/nibOZpaQKw08g4b8VzZ3YJtheJicaoOOhpH6fW1GHQiaribm5rCd4XIWvE9LVYmvZkjP2MDVJg7T9zG7hokFibqquJA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

**术语**

**Agent**

1、是 P2P 网络中的对等节点，需要在每个节点上部署。

2、实现了 Docker Registry interface。

3、通知 tracker 自己拥有的数据。

4、下载其他 agent 的数据（tracker 会告诉该 agent 需要下载这块数据需要到哪个 agent 上下载）

**Origin**

1、负责从存储中读取数据做种。

2、支持不同的存储。

3、通过 Hash 环的形式保证高可用。

**Tracker**

1、P2P 网络中的协调者，追踪谁是 Peer，谁是 Seeder。

2、追踪 Peer 拥有的数据。

3、提供有序的 Peer 节点供 Peer 下载数据。

4、通过 Hash 环的形式保证高可用。

**Proxy**

1、实现了 Docker Registry Interface。

2、将镜像层传给 Origin 组件。

3、将 Tag 传给 BUILD INDEX 组件。

**Build-Index**

1、Tag 和 digest 映射，agent 下载对应 Tag 数据时向 Build-Index 获取对应的 Digest 值。

2、集群之间镜像复制。

3、保存 Tag 数据在存储中。

4、通过 Hash 环的形式保证高可用。

**Dragonfly vs Kraken**

![图片](https://mmbiz.qpic.cn/mmbiz_png/nibOZpaQKw08g4b8VzZ3YJtheJicaoOOhpibmVicmzAQfObd7VP6Aiaz3UxzA9JPELY3oyjlZtVpFtibyCNSTAzwCZ2g/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

**PART. 2**

**方案**

在火山引擎上，主要考虑 VKE 和 VCI 通过 CR 拉取镜像。

1、VKE 的产品特点是基于 ECS 部署的 K8S，因此十分适合每个节点部署 Dfdaemon，充分利用每个节点的带宽，进而充分利用 P2P 的能力。

2、VCI 的产品特点是底层有一些资源很充足虚拟节点。上层的服务是以 POD 为载体，因此无法像 VKE 那样每个节点部署 Dfdaemon，所以部署的形式部署几个 Dfdaemon 作为缓存，利用缓存的能力。

3、VKE 或 VCI 客户端拉取经过 Nydus 格式转化过的镜像。在该场景下，需要使用 Dfdaemon 作为缓存，不宜使用过多的节点，避免对 Scheduler 造成过大的调度压力。

基于火山引擎对于以上产品的需求，以及结合 Dragonfly 的特点，需要设计一套兼容诸多因素的部署方案。部署 Dagonfly 的方案设计如下。

**PART. 3**

**整体架构图**

![图片](https://mmbiz.qpic.cn/mmbiz_png/nibOZpaQKw08g4b8VzZ3YJtheJicaoOOhpzbjGZ6M9ORrV5LEH5SNBp2wQnfP7wc6AakTy6BdgO60J9MpFhPibSDw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

1、火山引擎上的资源都是归属于主账号下。P2P 控制组件以主账号级别隔离，每个主账号下一套 P2P 控制组件。服务端实现 P2P Manager Controller，通过该 Controller 来管控控制面所有 P2P 控制组件。

2、P2P 控制组件部署在镜像仓库数据面 VPC，通过 LB 与用户集群打通。

3、在 VKE 集群上，Dfdaemon 以 DaemonSet 方式部署，每个节点上部署一个 Dfdaemon。

4、在 VCI 上，Dfdaemon 以 Deployment 方式部署。

5、ECS 上 Containerd 通过 127.0.0.1:65001 访问本节点上的 Dfdaemon。

6、通过在用户集群部署一个 controller 组件，基于 PrivateZone 功能，在用户集群生成.p2p.volces.com 域名， controller 会根据一定的规则挑选特定节点*（包括 VKE、VCI）*的 Dfdaemon pod，以 A 记录的形式解析到上述域名。

- ECS 上 Nydusd 通过.p2p.volces.com 域名访问 Dfdaemon。
- VCI 上镜像服务客户端和 Nydusd 通过.p2p.volces.com 域名访问 Dfdaemon。

**PART. 4**

**压测数据**

**环境**

镜像仓库：带宽 10Gbit/s。

ECS: 4C8G，挂载本地盘，带宽 6Gbit/s。

**镜像**

Nginx (500M)

TensorFlow (3G)

**组件版本**

Dragonfly v2.0.8。

**Quota**

Dfdaemon: Limit 2C6G。

Scheduler: 2 Replicas，Request 1C2G，Limit 4C8G。

Manager: 2 Replicas，Request 1C2G，Limit 4C8G。

**POD 启动时间对比**

Nginx Pod 分别并发 50、100、200、500 的所有 Pod 从创建到启动消耗时间。

![图片](https://mmbiz.qpic.cn/mmbiz_png/nibOZpaQKw08g4b8VzZ3YJtheJicaoOOhpL5Or9CyvnpKQiaQD2CM1Lu8UQibq6XuqwK6Qa67vpQBjljoy0gmtTrpg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

TensorFlow Pod 分别并发 50、100、200、500 的所有 Pod 从创建到启动消耗时间。

![图片](https://mmbiz.qpic.cn/mmbiz_png/nibOZpaQKw08g4b8VzZ3YJtheJicaoOOhpAXU4nu7H9UFcYcYquQLtB3VEYj87BL4ej6rI9HCYmGE2guF3JXNRzw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

在大规模拉镜像的场景下，在使用 Dragonfly 和 Dragonfly & Nydus 场景对比 OCIv1 场景能够节省 90% 以上的容器启动时间。使用 Nydus 之后启动时间更短是因为镜像 lazyload 的特性，只需要拉取很小的一部分元数据 Pod 就能启动。

**存储源端带宽峰值对比**

Nginx Pod 分别并发 50、100、200、500 的存储端峰值流量。

![图片](https://mmbiz.qpic.cn/mmbiz_png/nibOZpaQKw08g4b8VzZ3YJtheJicaoOOhpP9NYZRB6ETjwC2O93sOia3s7Cz0xaP8aywHmYLtfas9jHPTickLhGujQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

TensorFlow Pod 分别并发 50、100、200、500 的存储端峰值流量。

![图片](https://mmbiz.qpic.cn/mmbiz_png/nibOZpaQKw08g4b8VzZ3YJtheJicaoOOhpogPasEkCmCUp2nqMdWY8flz1s9ul8vicS8JTo8DxOa2licXQRX1HD1Og/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

**回源流量对比**

Nginx Pod 分别并发 50、100、200、500 的回源流量。

![图片](https://mmbiz.qpic.cn/mmbiz_png/nibOZpaQKw08g4b8VzZ3YJtheJicaoOOhpLsEWDrZIwF7xfdQCJlP9pLiaphiclwRwZuAGm9pMx12TxvCQH2IGzAnQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

TensorFlow Pod 分别并发 50、100、200、500 的回源流量。

![图片](https://mmbiz.qpic.cn/mmbiz_png/nibOZpaQKw08g4b8VzZ3YJtheJicaoOOhpP3omRADmYiaWRuoaux5veiaicINicqlxalBS2z1FYUn8T4Ss0YR43fZwTA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

在大规模场景下，使用 Dragonfly 回源拉取镜像的数量很少。OCIv1 的场景所有的镜像拉取都要回源，因此使用 Dragonfly 回源峰值和回源流量相比 OCIv1 的场景少很多。并且使用 Dragonfly 后随着并发数提高，回源峰值和流量不会显著提高。

**PART. 5**

**总结**

基于项目整体成熟度，社区活跃度、用户数量、架构复杂度，是否针对 Nydus 优化。未来发展趋势等因素综合考虑，Dragonfly 是 P2P 项目中最优的选型。

**PART. 6**

**术语及定义**

**OCI**

Open Container Initiative，开放容器计划是一个 Linux 基金会项目，由Docker在2015年6月启动，旨在为操作系统级虚拟化（*最重要的是 Linux 容器）*设计开放标准。

**OCI Artifact**

遵循 OCI image spec 的制品。

**镜像**

本文中的镜像指 OCI Artifact，因此也包括 Helm Chart 等其他 OCI Artifact。

**镜像仓库**

遵循 OCI distribution spec 实现的制品仓库。

**ECS**

是一种由CPU、内存、云盘组成的资源集合，每一种资源都会逻辑对应到数据中心的计算硬件实体。

**CR**

火山引擎镜像仓库服务。

**VKE**

火山引擎通过深度融合新一代云原生技术，提供以容器为核心的高性能 Kubernetes 容器集群管理服务，助力用户快速构建容器化应用。

**VCI**

火山一种 Serverless 和容器化的计算服务。当前 VCI 可无缝集成容器服务 VKE，提供 Kubernetes 编排能力。

使用 VCI，可以专注于构建应用本身，而无需购买和管理底层云服务器等基础设施，并仅为容器实际运行消耗的资源付费。VCI 还支持秒级启动、高并发创建、沙箱容器安全隔离等能力。

**TOS**

火山引擎提供的海量、安全、低成本、易用、高可靠、高可用的分布式云存储服务。

**Private Zone**

基于专有网络VPC*（Virtual Private Cloud）*环境的私有DNS服务。该服务允许在自定义的一个或多个VPC中将私有域名映射到IP地址。

**P2P**

点对点技术，当 P2P 网络中某一个 peer 从 server 下载数据的时候，下载完数据后也能当作服务端供其他 peer 下载。当大量节点同时下载的时候，能保证后续下载的数据，可以不用从 server 端下载。从而减轻 server 端的压力。

**Dragonfly**

Dragonfly 是⼀款基于 P2P 技术的文件分发和镜像加速系统，并且是云原生架构中镜像加速领域的标准解决方案以及最佳实践。现在为云原生计算机基金会*（CNCF）*托管作为孵化级项目。

**Nydus**

Nydus 简介: Nydus 镜像加速框架是 Dragonfly 的子项目，它提供了容器镜像按需加载的能力，在生产环境支撑了每日百万级别的加速镜像容器创建，在启动性能，镜像空间优化，端到端数据一致性，内核态支持等方面相比 OCIv1 有巨大优势。

**Dragonfly 社区官网网站**:

Volcano Engine: [*https://www.volcengine.com/*](https://www.volcengine.com/)

Volcano Engine VKE: [*https://www.volcengine.com/product/vke*](https://www.volcengine.com/product/vke)

Volcano Engine CR: [*https://www.volcengine.com/product/cr*](https://www.volcengine.com/product/cr)

Dragonfly 官网: [*https://d7y.io/*](https://d7y.io/)

Dragonfly Github Repo: [*https://github.com/dragonflyoss/Dragonfly2*](https://github.com/dragonflyoss/Dragonfly2)

Nydus 官网: [*https://nydus.dev/*](https://nydus.dev/)

Nydus Gihtub Repo: [*https://github.com/dragonflyoss/image-service*](https://github.com/dragonflyoss/image-service)

**Dragonfly Star 一下✨：**
[*https://github.com/dragonflyoss/Dragonfly2*](https://github.com/dragonflyoss/Dragonfly2)
