---
title: "Dragonfly 发布 v2.1.0 版本！"
authorlink: "https://github.com/sofastack"
description: "Dragonfly 发布 v2.1.0 版本！"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2023-08-08T15:00:00+08:00
cover: "https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*4tMSTYU5lBwAAAAAAAAAAAAADrGAAQ/original"
---

**Dragonfly 最新正式版本 v2.1.0 已经发布！** 感谢赵鑫鑫[1]同学帮助重构 Console 代码，并且提供全新的 Console[2]控制台方便用户可视化操作 P2P 集群。欢迎访问 d7y.io[3]网站来了解详情，下面具体介绍 v2.1.0 版本带来了哪些更新。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6169c0485e0143588a9a43248c50e612~tplv-k3u1fbpfcp-zoom-1.image)

## 功能

- Console v1.0.0[4]已经发布，它是一个全新的可视化控制台，方便用户操作 P2P 集群。
- 新增虚拟网络拓扑探索功能，能够在 P2P 运行时探测节点之间的网络延迟，从而构建一个虚拟网络拓扑结构提供调度使用。
- Manager 提供控制 Scheduler 可以提供的服务，例如在 Manager 中设置 Scheduler 不提供预热功能，那么 Scheduler 实例就会拒绝预热请求。
- `Dfstore` 提供 `GetObjectMetadatas` 和 `CopyObject` 接口，支持 Dragonfly 作为 JuiceFS 的后端存储。
- 新增 `Personal Access Tokens` 功能，用户可以创建自己的 `Personal Access Tokens` 在调用 Open API 的时候鉴权使用。
- Manager REST 服务提供 TLS 配置。
- 修复当 Dfdaemon 没有可用的 Scheduler 地址时启动失败的现象。
- 新增 `Cluster` 资源单位，`Cluster` 代表一个 P2P 集群，其只包含一个 `Scheduler Cluster` 和一个 `Seed Peer Cluster`，并且二者关联。
- 修复 `Dfstore` 在 Dfdaemon 并发下载时，可能导致的对象存储下载失败。
- Scheduler 新增 Database 配置，并且把之前 Redis 的配置信息移入到 Database 配置中，并且兼容老版本。
- 在 Dfdaemon 中使用 gRPC 健康检查代替 `net.Dial`。
- 修复调度器过滤以及评估过程中 `candidateParentLimit` 可能影响到调度结果的问题。
- 修复 Scheduler 中的 Storage 在 `bufferSize` 为 0 的时候，导致的无法写入下载记录的问题。
- 日志中隐藏敏感信息，例如 Header 中的一些 Token 信息等。
- Manager 中 Scheduler、Seed Peer 等资源删除过程中，不再使用软删除。
- Scheduler 数据库表中新增 `uk_scheduler` 索引，Seed Peer 数据库表中新增 `uk_seed_peer` 索引。
- 由于初期功能设计定位不清晰的原因，删除 `Security Domain` 和 `Security` 的功能。
- Manager 和 Scheduler 新增 Advertise Port 配置，方便用户配置不同的 Advertise Port。
- 修复 Task 注册阶段状态机状态变更错误的问题。

## 破坏性变更

- 不再提供 Scheduler Cluster 和 Seed Peer Cluster 之间 `M:N` 的关系。提供了 Cluster 的概念，一个 Cluster 即表示一个 P2P 集群，并且一个 Cluster 只包含一个 Scheduler Cluster 和 Seed Peer Cluster，且二者是 `1:1` 的关联关系。

## 控制台

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/af38313a8e5c4806b29838143b99b934~tplv-k3u1fbpfcp-zoom-1.image)

更多的关于控制台的内容可以参考官网文档 Manager Console[5]。

## AI 基础设施

- Triton Inference Server[6]使用 Dragonfly 下载模型文件，可以参考 #2185[7]。如果有对集成 Triton Inference Server 项目 Drgaonfly Repository Agent[8]感兴趣的同学，可以联系 <gaius.qi@gmail.com>。
- TorchServer[9]使用 Dragonfly 下载模型文件，现正在开发，预计 v2.1.1 版本可以使用，项目仓库在  Dragonfly Endpoint[10]。
- Fluid[11]基于 JuiceFS[12]运行时通过 Dragonfly 下载数据，正在开发，预计 v2.1.1 版本可以使用。
- Dragonfly 助力火山引擎 AIGC [13]推理业务 P2P 镜像加速。
- 社区中已经有很多案例，基于 P2P 技术使用 Dragonfly 分发 AI 场景中的文件。在 AI 推理阶段，推理服务并发下载模型可以有效通过 Dragonfly P2P 缓解模型仓库的带宽压力，从而提高整体下载速度。在 KubeCon + CloudNativeCon + Open Source Summit China 2023[14]社区联合快手做一次分享，主题是《Dragonfly: Intro, Updates and AI Model Distribution in the Practice of Kuaishou - Wenbo Qi, Ant Group & Zekun Liu, Kuaishou Technology》[15]，感兴趣的同学可以关注。

## 维护者

社区新增四位 Maintainer，希望能够帮助更多的 Contributor 参与到社区的工作中。

- 黄逸炀[16]：就职于火山引擎，主要专注于社区代码工程方面。
- 温满祥[17]：就职于百度，主要专注于社区代码工程方面。
- Mohammed Farooq[18]：就职于 Intel，主要专注于社区代码工程方面。
- 许洲[19]：大连理工大学在读博士，主要专注于智能调度算法方面。

## 其他

版本更新包含的更多细节可以参考👇

CHANGELOG：[https://github.com/dragonflyoss/Dragonfly2/blob/main/CHANGELOG.md](https://github.com/dragonflyoss/Dragonfly2/blob/main/CHANGELOG.md)

## 相关链接

[1].Xinxin Zhao Github：

[https://github.com/1zhaoxinxin](https://github.com/1zhaoxinxin)

[2].Dragonfly Console Github：

[https://github.com/dragonflyoss/console](https://github.com/dragonflyoss/console)

[3].Dragonfly 官网：
[https://d7y.io](https://d7y.io)

[4].Dragonfly Console Release v1.0.0：
[https://github.com/dragonflyoss/console/tree/release-1.0.0](https://github.com/dragonflyoss/console/tree/release-1.0.0)

[5].Manager Console 文档：
[https://d7y.io/docs/reference/manage-console](https://d7y.io/docs/reference/manage-console)

[6].Triton Inference Server：
[https://github.com/triton-inference-server/server](https://github.com/triton-inference-server/server)

[7].issue #2185：
[https://github.com/dragonflyoss/Dragonfly2/issues/2185](https://github.com/dragonflyoss/Dragonfly2/issues/2185)

[8].Dragonfly Repository Agent Github：
[https://github.com/dragonflyoss/dragonfly-repository-agent](https://github.com/dragonflyoss/dragonfly-repository-agent)

[9].TorchServe：
[https://github.com/pytorch/serve](https://github.com/pytorch/serve)

[10].Dragonfly Endpoint Github：
[https://github.com/dragonflyoss/dragonfly-endpoint](https://github.com/dragonflyoss/dragonfly-endpoint)

[11].Fluid：
[https://github.com/fluid-cloudnative/fluid](https://github.com/fluid-cloudnative/fluid)

[12].JuiceFS：
[https://github.com/juicedata/juicefs](https://github.com/juicedata/juicefs)

[13].Volcano Engine AIGC：
[https://mp.weixin.qq.com/s/kY6DxRFspAgOO23Na4dvTQ](https://mp.weixin.qq.com/s/kY6DxRFspAgOO23Na4dvTQ)

[14].KubeCon + CloudNativeCon + Open Source Summit China 2023：
[https://www.lfasiallc.com/kubecon-cloudnativecon-open-source-summit-china/](https://www.lfasiallc.com/kubecon-cloudnativecon-open-source-summit-china/)

[15].《Dragonfly: Intro, Updates and AI Model Distribution in the Practice of Kuaishou - Wenbo Qi, Ant Group & Zekun Liu, Kuaishou Technology》：
[https://sched.co/1PTJb](https://sched.co/1PTJb)

[16].Yiyang Huang Github：
[https://github.com/hyy0322](https://github.com/hyy0322)

[17].Manxiang Wen Github：
[https://github.com/garenwen](https://github.com/garenwen)

[18].mfarooq-intel Github：
[https://github.com/mfarooq-intel](https://github.com/mfarooq-intel)

[19].Zhou Xu Github：
[https://github.com/fcgxz2003](https://github.com/fcgxz2003)

## Dragonfly Star 一下✨

[https://github.com/dragonflyoss/Dragonfly2](https://github.com/dragonflyoss/Dragonfly2)
