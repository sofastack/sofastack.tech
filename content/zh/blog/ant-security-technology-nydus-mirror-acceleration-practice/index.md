---
title: "蚂蚁安全科技 Nydus 镜像加速实践"
authorlink: "https://github.com/sofastack"
description: "蚂蚁安全科技 Nydus 镜像加速实践"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2023-04-26T15:00:00+08:00
cover: "https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*TeNQQ77YtGYAAAAAAAAAAAAADrGAAQ/original"
---

文｜蚂蚁集团 ZOLOZ 团队

**使用全球领先安全科技，为用户和机构提供安全、便捷的安全风控解决方案。**

本文 **6386** 字 阅读 **12** 分钟

**背景简介**

ZOLOZ[1]是蚂蚁集团旗下的全球安全风控平台，通过业内领先的生物识别、大数据分析和人工智能技术，为用户和机构提供安全又便捷的安全风控解决方案。ZOLOZ 已为中国、印尼、马来西亚、菲律宾等 14 个国家和地区的 70 余家合作伙伴提供数字化转型过程中的安全风控技术支持。目前，已经覆盖金融、保险、证券、信贷、电信、公众服务等领域，累计服务用户超 12 亿。

随着 Kubernetes 和云原生的大爆发，ZOLOZ 应用开始在公有云上进行大规模容器化部署。ZOLOZ 业务的镜像经过长期维护和更新，无论是镜像层数还是整体大小都达到了一个较大的量级 *（数百 MB 或者几个 GB）* 。特别是 ZOLOZ AI 算法推理应用的基础镜像大小要远大于一般应用镜像 *（Docker Hub 上 PyTorch/PyTorch：1.13.1-CUDA 11.6-cuDNN 8-Runtime 有 4.92GB，同比 CentOS：latest 只有约 234MB）* ，对于容器冷启动，即在本地无镜像的情况下，需要先从 Registry 下载镜像才能创建容器，在生产环境中，容器的冷启动往往耗时数分钟，并且随规模扩大会导致 Registry 因集群内网络拥堵而无法快速地下载镜像，如此庞大的镜像给应用的更新和扩容等操作都带来了不少挑战。在公有云上容器化持续推进的当下，ZOLOZ 应用主要遇到了三大挑战：

1. 算法镜像大，推送到云上镜像仓库耗时长，开发过程中，在使用测试环境进行测试时，往往希望快速迭代，快速验证，但是每次改完一个分支发布验证都要经过几十分钟，开发效率十分低下。

2. 拉取算法镜像耗时长，在集群扩容大量机器拉取镜像文件会容易导致集群网卡被打满，影响业务正常运行。

3. 集群机器拉起时间长，难以满足流量突增时，弹性自动扩缩容。

虽然也尝试过各种折中的解决方案，但这些方案都有缺陷，现在结合蚂蚁、阿里云、字节跳动等多个技术团队打造了一套更通用的公有云上解决方案，该方案改造成本低，性能好，目前看来是比较理想的方案。

**术语及定义**

**OCI**：Open Container Initiative，开放容器计划是一个 Linux 基金会项目，由 Docker 在 2015 年 6 月启动，旨在为操作系统级虚拟化 *（最重要的是 Linux 容器）* 设计开放标准。

**OCI Manifest**：遵循 OCI Image Spec 的制品。

**BuildKit**：是 Docker 公司出品的一款更高效、Dockerfile 无关、更契合云原生应用的新一代 Docker 构建工具。

**镜像**：本文中的镜像指 OCI Manifest，也包括 Helm Chart 等其他 OCI Manifest。

**镜像仓库**：遵循 OCI Distribution Spec 实现的制品仓库。

**ECS**：是一种由 CPU、内存、云盘组成的资源集合，每一种资源都会逻辑对应到数据中心的计算硬件实体。

**ACR**：阿里云镜像仓库服务。

**ACK**：阿里云容器服务 Kubernetes 版提供高性能可伸缩的容器应用管理能力，支持企业级容器化应用的全生命周期管理。

**ACI**：ACI 全称 Ant Continuous Integration *（AntCI）* ，是蚂蚁集团研发效能旗下一款以流水线 *（Pipeline）* 为核心的 CI/CD 效能产品。使用智能自动化构建、测试和部署，提供了以代码流为输入的轻量级持续交付解决方案，提高团队研发的工作效率。

**Private Zone**：基于专有网络 VPC *（Virtual Private Cloud）* 环境的私有 DNS 服务。该服务允许在自定义的一个或多个 VPC 中将私有域名映射到 IP 地址。

**P2P**：点对点技术，当 P2P 网络中某一个 Peer 从 Server 下载数据的时候，下载完数据后也能当作服务端供其他 Peer 下载。当大量节点同时下载的时候，能保证后续下载的数据，可以不用从 Server 端下载。从而减轻 Server 端的压力。

**Dragonfly**：Dragonfly 是⼀款基于 P2P 技术的文件分发和镜像加速系统，并且是云原生架构中镜像加速领域的标准解决方案以及最佳实践。现在为云原生计算机基金会 *（CNCF）* 托管作为孵化级项目。

**Nydus**：Nydus 镜像加速框架是 Dragonfly 的子项目，它提供了容器镜像按需加载的能力，在生产环境支撑了每日百万级别的加速镜像容器创建，在启动性能，镜像空间优化，端到端数据一致性，内核态支持等方面相比 OCIv1 有巨大优势。

**LifseaOS**：面向容器场景，阿里云推出轻量、快速、安全、镜像原子管理的容器优化操作系统，相比传统操作系统软件包数量减少 60%，镜像大小减少 70%，OS 首次启动从传统 OS 的 1min 以上下降到了 2s 左右。支持镜像只读和 OSTree 技术，将 OS 镜像版本化管理，更新操作系统上的软件包、或者固化的配置时，以整个镜像为粒度进行更新。

**方案设计**

**解决镜像大的问题**

**1. 精简基础** **镜像** **大小**

基础 OS 从 CentOS 7 改为 AnolisOS 8，精简运维工具的安装，只默认安装一些必须的工具列表 *（基础运维工具、运行时通用依赖、日志清理、安全基线等组件）* ，并简化安全加固的配置，基础镜像从 1.63GB 减少到 300MB。  

AnolisOS 仓库：[*https://hub.docker.com/r/openanolis/anolisos/tags*](https://hub.docker.com/r/openanolis/anolisos/tags)

**2. Dockerfile 优化**

通过 Dockerfile 编写约束、镜像检测等手段减少不必要的构建资源和时间。  

Dockerfile 最佳实践原则: [*https://docs.docker.com/develop/develop-images/dockerfile_best-practices/*](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)

**3. 并行构建和构建缓存**

蚂蚁构建中心采用 Nydus 社区优化版的 BuildKit[2]，BuildKit 支持 layer 级别缓存，准确引用先前的产出物并进行缓存匹配，使用方法与普通镜像并无区别，对于 Multistage 类型 Dockerfile，BuildKit 可以实现不同 stage 之间的并行执行。  

**推送到云上镜像仓库耗时长**

**1. 使用 Nydus 镜像进行块级别数据去重**

传统 OCI 镜像，不同镜像之间可以共享的最小单位是镜像中的层，在 deduplication 上的效率是非常低的，层内部存在重复的数据，层与层之间可能存在大量重复的数据，即使有微小的差别，也会被作为不同的层，根据 OCI Image Spec 对删除文件和 Hard Link 的设计，一个镜像内部可能存在已经被上层删除的文件仍然存在于下层中，并包含在镜像中。另外 OCI Image 使用了 tar+gzip 格式来表达镜像中的层，而 tar 格式并不区分 tar archive entries ordering，这带来一个问题即如果用户在不同机器上 build 去同一个镜像，最终可能会因为使用了不同的文件系统而得到不同的镜像，但若干不同镜像的实质内容是完全相同的情况，导致上传下载数据量飙增。   

OCIv1 存在的问题与 OCIv2 提案：[*https://hackmd.io/@cyphar/ociv2-brainstorm*](https://hackmd.io/@cyphar/ociv2-brainstorm)

Nydus 镜像文件以文件 Chunk 为粒度分割，扁平化元数据层 *（移除中间层* *）* ，每一个 Chunk 在镜像中只会保存一次，可指定 Base Image , 用作其他 Nydus Image 的 Chunk dictionary，基于 Chunk level deduplication 提供了在不同镜像之间低成本的 data 去重能力，大大降低了镜像的上传和下载数据量。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ae9ef891d3a441b7b4f3286a83e6416d~tplv-k3u1fbpfcp-zoom-1.image)

Nydus 镜像块共享

如上图 Nydus 镜像 1 和镜像 2 存在相同的数据块 B2、C、E1、F，镜像 2 新增 E2、G1、H1、H2，如果镜像仓库已经存在镜像 1，那么镜像 2 可以基于镜像 1 进行镜像构建，仅需要将 E2、G1、H1、H2 构建在一层，在上传的时候仅需要将这一层上传到镜像仓库，达到仅文件差异上传、拉取的效果，缩短研发周期。  

**2. 直接构建云上 Nydus 镜像**

目前在大多数加速镜像的落地场景中，加速镜像的生产都是基于镜像转换的。目前落地的 Nydus 转换方案主要为以下两种：  

i. 镜像仓库转换

普通镜像构建完成并 push 到镜像仓库后，触发镜像仓库的转换动作，完成镜像转换。这种方案的缺点在于，构建和转换往往在不同机器上进行。镜像构建并 push 后，还需要 pull 到转换机并将产出 push 到镜像仓库，需要增加一次完整的镜像流转过程，延迟较高，而且还占用镜像仓库的网络资源。在加速镜像转换完成前，应用发布并无法享受加速效果，仍需要完整 pull 镜像。 

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9c6763a9f63b41bdb8e961fb101ff31b~tplv-k3u1fbpfcp-zoom-1.image)

ii. 双版本构建

在普通镜像构建完成后，在构建机本地直接转换。为提高效率，可以在每层构建完成后即开始对该层进行转换，加速镜像生成延迟可以大幅降低。这个方案，无需等待普通镜像上传即可开始转换，而且在本地转换，相比较方案 1，可以省掉的转换机镜像传输的开销。如果基础镜像对应的加速镜像不存在，则将其转换出来；如果存在，pull 可以忽略不计，但是无可避免的是 push 总是需要双份。 

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d04dea6f79e4453f8de63f8ed9d1ad42~tplv-k3u1fbpfcp-zoom-1.image)

iii. 直接构建

上述两种基于转换的方案，与直接构建 Nydus 加速镜像相比，都有明显的生产延迟。一是基于 OCI 的镜像构建速度明显慢于 Nydus 镜像构建；二是转换是事后行为，都存在或多或少的滞后；三是都存在额外的数据传输。而直接构建，流程少，速度快，又节约资源：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/180b1184c91e421d8a1565d750e86744~tplv-k3u1fbpfcp-zoom-1.image)

可以看出，加速镜像构建，步骤明显减少，数据传输量明显减少，构建完成后即可直接享受加速镜像的能力，应用发布速度可以大幅提升。

**镜像启动慢**

**1. Nydus 镜像按需加载**

在容器启动时，容器内业务 IO 请求哪些文件的数据，再从远端 Registry 拉取这些数据，这样避免镜像大量数据拉取阻塞容器的启动，镜像的数据的实际使用率是很低的，比如 Cern 的这篇论文[3]中就提到，一般镜像只有 6% 的内容会被实际用到。按需加载的目的是让容器运行时有选择地从 Blob 中的镜像层 *（layer）* 下载和提取文件，但 OCI[4]/ Docker[5]镜像规范将所有的镜像层打包成一个 tar 或 tar.gz 存档，这样即使你要提取单个文件也要扫描整个 Blob。如果镜像使用 gzip 进行压缩，就更没有办法提取特定文件了。  

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/21904b91059542f293c37c5f6e9fe0dd~tplv-k3u1fbpfcp-zoom-1.image)

Nydus 镜像格式

RAFS 镜像格式[6]是 Nydus 提出的存档压缩格式。其中将容器镜像文件系统的数据 *（* *Blobs）* 和元数据 *（* *Bootstrap）* 分离，让原来的镜像层只存储文件的数据部分。并且把文件以 Chunk 为粒度分割，每层 Blob 存储对应的 Chunk 数据；因为采用了 Chunk 粒度，这细化了去重粒度，Chunk 级去重让层与层之间，镜像与镜像之间共享数据更容易，也更容易实现按需加载。原来的镜像层只存储文件的数据部分 *（也就是图中的 Blob 层）* 。Blob 层存储的是文件数据的切块 *（Chunk）* ，例如将一个 10MB 的文件，切割成 10 个 1MB 的块，于是就可以将 Chunk 的 Offset 记录在一个索引中，容器在请求文件的部分数据时，通过结合 OCI/Docker 镜像仓库规范支持的 HTTP Range Request，容器运行时可以有选择地从镜像仓库中获取文件，如此一来节省不必要的网络开销。关于 Nydus 镜像格式的更多细节，请参考 Nydus Image Service 项目[7]。 

元数据和 Chunk 的索引加在一起，就组成了上图中的 Meta 层，它是所有镜像层堆叠后容器能看到的整个 Filesystem 结构，包含目录树结构，文件元数据，Chunk 信息 *（块的大小和偏移量，以及每个文件的元数据（名称、文件类型、所有者等））* 。有了 Meta 之后，就可以在不扫描整个存档文件的情况下提取需要的文件。另外，Meta 层包含了 Hash 树以及 Chunk 数据块的 Hash，以此来保证我们可以在运行时对整颗文件树校验，以及针对某个 Chunk 数据块做校验，并且可以对整个 Meta 层签名，以保证运行时数据被篡改后依然能够被检查出来。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/dc85339e743f40ad85bc959630fc9804~tplv-k3u1fbpfcp-zoom-1.image)

Nydus 按需加载

Nydus 默认使用用户态文件系统实现 FUSE[8]来做按需加载，用户态的 Nydus Daemon 进程将 Nydus 镜像挂载点作为容器 RootFS 目录，当容器产生 `read(fd,count)` 之类的文件系统 IO 时，内核态 FUSE 驱动将该请求加入处理队列，用户态 Nydus Daemon 通过 FUSE Device 读取并处理该请求，从远端 Registry 拉取 Count 对应数量的 Chunk 数据块后，最终通过内核态 FUSE 回复给容器。Nydus 还实现了一层本地 Cache，已经从远端拉取的 Chunk 会解压缩后缓存在本地，Cache 可以做到以层为单位在镜像之间共享，也可以做到 Chunk 级别的共享。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/153eb1452499489ab98209b58171446a~tplv-k3u1fbpfcp-zoom-1.image)

从 Pod 创建到容器启动

利用 Nydus 做镜像加速后，不同应用的启动时间都有了质的飞跃，能够在非常短的时间内拉起应用，满足云上快速伸缩的要求。

**2. 只读文件系统 EROFS**

当容器镜像中存在大量文件时，频繁的文件操作会产生大量的 FUSE 请求，造成内核态/用户态上下文的频繁切换，造成性能瓶颈；依托于内核态 EROFS *（* *始于 Linux 4.19）* 文件系统，Nydus 对其进行了一系列的改进与增强，拓展其在镜像场景下的能力，最终呈现为一个内核态的容器镜像格式，Nydus RAFS *（Registry Acceleration File System）* v6，相比于此前的格式，它具备块数据对齐，元数据更加精简，高可扩展性与高性能等优势。在镜像数据全部下载到本地的情况下，FUSE 用户态方案会导致访问文件的进程频繁陷出到用户态，并涉及内核态/用户态之间的内存拷贝，更进一步支持了 EROFS over FS-Cache 方案 *（Linux 5.19-rc1）* ，当用户态 Nydusd 从远端下载 Chunk 后会直接写入 FS-Cache 缓存，之后容器访问时，能够直接通过内核态 FS-Cache 读取数据，而无需陷出到用户态，在容器镜像的场景下实现几乎无损的性能和稳定性，其表现优于 FUSE 用户态方案，同时与原生文件系统 *（未使用按需加载）* 的性能相近。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ffc82a5d43044cb69326bea80af5e3e3~tplv-k3u1fbpfcp-zoom-1.image)

不同文件系统方案耗时对比

目前 Nydus 在构建，运行，内核态 *（* *Linux 5.19-rc1）* 均已支持了该方案，详细用法可以参见 Nydus EROFS FS-Cache user guide[9]，另外想了解更多 Nydus 内核态实现细节，可以参见 Nydus 镜像加速之内核演进之路[10]。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a4785cdcb3c14d279c3b219d0447b355~tplv-k3u1fbpfcp-zoom-1.image)

Nydus 内核实现细节

**3. Dragonfly P2P 加速镜像下载**

不论是镜像仓库服务本身还是背后的存储，最终肯定是有带宽和 QPS 限制的。如果单纯依赖服务端提供的带宽和 QPS，很容易就无法满足需求。因此需要引入 P2P，减轻服务端压力，进而满足大规模并发拉取镜像的需求。在大规模拉镜像的场景下，在使用 Dragonfly&Nydus 场景对比 OCIv1 场景能够节省 90% 以上的容器启动时间。  

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ef364f01f81244b1a0e2add3e418e3d8~tplv-k3u1fbpfcp-zoom-1.image)

Dragonfly P2P 镜像加速拉取

使用 Nydus 之后启动时间更短是因为镜像 Lazyload 的特性，只需要拉取很小的一部分元数据 Pod 就能启动。在大规模场景下，使用 Dragonfly 回源拉取镜像的数量很少。OCIv1 的场景所有的镜像拉取都要回源，因此使用 Dragonfly 回源峰值和回源流量相比 OCIv1 的场景少很多。并且使用 Dragonfly 后随着并发数提高，回源峰值和流量不会显著提高。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/41a4e7c52d39425c90e57564f3bedbca~tplv-k3u1fbpfcp-zoom-1.image)

1G 大小的随机文件测试

**集群伸缩时间长**

**1. ACR 镜像仓库全球同步**

为了满足客户优质的体验以及数据合规需求，需要就近接入，因此 ZOLOZ 在全球多个站点进行云上部署。借助 ACR 镜像仓库进行跨境同步加速，全球多地域间同步，提高容器镜像分发效率。上传和下载镜像都在本区域机房内进行，特别是在一些网络不太好的国家内，也能够像本地机房一样进行部署，真正做到应用的一键部署到全球各地。  

**2. 采用 ContainerOS 极速启动**

借助云原生满足客户急速增长资源扩容，利用弹性降低成本，在云上需要极速伸缩虚拟机，并将其加入到集群内部。ContainerOS 通过简化 OS 启动流程，预置集群管控必备组件的容器镜像以减少节点启动过程中因镜像拉取而带来的耗时，极大地提高了 OS 启动速度，降低了 ACK 链路中的节点扩容时间。ContainerOS 从如下几个方面进行了优化：

-   ContainerOS 通过简化 OS 启动流程，有效降低 OS 启动时间。ContainerOS 的定位是跑在云上虚拟机的操作系统，不会涉及到太多的硬件驱动，因此 ContainerOS 将必要的内核驱动模块修改为 built-in 模式。此外，ContainerOS 去除了 initramfs，且 udev 规则也被大大简化，此时 OS 启动速度得到了大幅提升。以 ecs.g7.large 规格的 ECS 实例为例，LifseaOS 的首次启动时间保持在 2s 左右，而 Alinux3 则需要 1min 以上。

-   ContainerOS 通过预置集群管控必备组件的容器镜像以减少节点启动过程中因镜像拉取而带来的耗时。ECS 节点启动完成后需要拉取部分组件的容器镜像，这些组件负责在 ACK 场景下执行一些基础性的工作。例如 Terway 组件负责网络，节点必须在 Terway 组件的容器就绪的情况下才能转换为就绪状态。因此，既然网络拉取的长尾效应会带来极大的耗时，那么可以通过预置的方式提前将此组件提前安装在 OS 内部，此时可直接从本地目录获取，避免网络拉取镜像耗时。

-   ContainerOS 也会通过结合 ACK 管控链路优化，提高节点弹性性能。

最终，统计了从空的 ACK 节点池扩容的端到端的 P90 耗时，从下发扩容请求开始计时，到 90% 的节点处于就绪状态结束计时，并对比了 CentOS、Alinux2 Optimized-OS[11]方案，ContainerOS 性能优势明显，具体数据如下图所示。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/706f4ff45dce49dd8264a9eeb131048e~tplv-k3u1fbpfcp-zoom-1.image)

<p align=center>ecs.c6.xlarge 并发启动数据</p>

**整体链路**

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0c29d27c0be0402587e164c1e073e91a~tplv-k3u1fbpfcp-zoom-1.image)

<p align=center>ZOLOZ 公有云应用部署整体方案</p>

-   通过精简基础镜像以及遵循 Dockerfile 规约，对镜像大小进行精简。

-   利用蚂蚁托管的 BuildKit 对镜像进行 Multistage 并行构建，在重复构建时采用缓存加快镜像构建。直接构建 Nydus 加速镜像时通过镜像之间重复分析进行去重，仅上传镜像之间差异的块到远程镜像仓库。

-   通过 ACR 全球加速同步的能力，将镜像分发到全球不同的镜像仓库中，进行就近拉取。

-   通过 Dragonfly P2P 网络对 Nydus 镜像块进行按需加速拉取。

-   节点上使用 ContainerOS 操作系统，提高 OS 启动速度以及镜像启动速度。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5cbf06446ed840b5b36819ac98a0135d~tplv-k3u1fbpfcp-zoom-1.image)

容器研发流程

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/acb67f7330714d188c552ab1c06b0b2c~tplv-k3u1fbpfcp-zoom-1.image)

以 3G 镜像为例

*调度时间：该时间是指从阿里云创建一台 ECS，到节点加入到 K8s 集群并 Ready 的时间，得益于 ContainerOS 的优化，该耗时降低非常明显。

通过对研发全流程各个环节进行极致的优化，可以发现优化后，研发效率和线上稳定性都得到了质的提升，目前整套方案已经在阿里云和 AWS 都完成了部署，线上稳定运行 3 个月，未来将在云厂商提供标准的部署环境，满足更多类型的业务场景。

**使用指南**

**镜像构建**

代码资产都在蚂蚁域内，利用蚂蚁镜像构建中心托管的 BuildKit 集群，通过自定义的 ACI 组件进行构建 Nydus 镜像。

```bash
镜像构建:  stage: 镜像构建  id: build-image  component: nydus-image-build  inputs:    imageName: ${{parameters.imageName}} #构建的镜像 name    imageTag: ${{vcs.commitSha}} # 构建的镜像 tag，这里的 ${{vcs.commitSha}} 是 ACI 内置参数    dockerfile: Dockerfile # dockerfile文件位置（默认相对代码根目录）    chunkDictImage: ${{parameters.chunkDictImage}}    timeoutInSec: 1200
```

可以指定 Chunk Dict Image 按 Chunk 去重粒度，如果构建的镜像和 Chunk Dict Image。Image Name 可以直接指定阿里云 ACR 仓库，构建的 Nydus 镜像直接推送到云上，减少镜像中转耗时。

**Dragonfly 安装**

```bash
$ helm repo add dragonfly https://dragonflyoss.github.io/helm-charts/$ helm install --wait --timeout 10m --dependency-update --create-namespace --namespace dragonfly-system dragonfly dragonfly/dragonfly --set dfdaemon.config.download.prefetch=true,seedPeer.config.download.prefetch=trueNAME: dragonflyLAST DEPLOYED: Fri Apr  7 10:35:12 2023NAMESPACE: dragonfly-systemSTATUS: deployedREVISION: 1TEST SUITE: NoneNOTES:1. Get the scheduler address by running these commands:  export SCHEDULER_POD_NAME=$(kubectl get pods --namespace dragonfly-system -l "app=dragonfly,release=dragonfly,component=scheduler" -o jsonpath={.items[0].metadata.name})  export SCHEDULER_CONTAINER_PORT=$(kubectl get pod --namespace dragonfly-system $SCHEDULER_POD_NAME -o jsonpath="{.spec.containers[0].ports[0].containerPort}")  kubectl --namespace dragonfly-system port-forward $SCHEDULER_POD_NAME 8002:$SCHEDULER_CONTAINER_PORT  echo "Visit http://127.0.0.1:8002 to use your scheduler"
2. Get the dfdaemon port by running these commands:  export DFDAEMON_POD_NAME=$(kubectl get pods --namespace dragonfly-system -l "app=dragonfly,release=dragonfly,component=dfdaemon" -o jsonpath={.items[0].metadata.name})  export DFDAEMON_CONTAINER_PORT=$(kubectl get pod --namespace dragonfly-system $DFDAEMON_POD_NAME -o jsonpath="{.spec.containers[0].ports[0].containerPort}")  You can use $DFDAEMON_CONTAINER_PORT as a proxy port in Node.
3. Configure runtime to use dragonfly:  https://d7y.io/docs/getting-started/quick-start/kubernetes/
```

更多详情参考：[*https://d7y.io/zh/docs/setup/integration/nydus*](https://d7y.io/zh/docs/setup/integration/nydus)

**Nydus 安装**

```bash
$ curl -fsSL -o config-nydus.yaml https://raw.githubusercontent.com/dragonflyoss/Dragonfly2/main/test/testdata/charts/config-nydus.yaml$ helm install --wait --timeout 10m --dependency-update --create-namespace --namespace nydus-snapshotter nydus-snapshotter dragonfly/nydus-snapshotter -f config-nydus.yamlNAME: nydus-snapshotterLAST DEPLOYED: Fri Apr  7 10:40:50 2023NAMESPACE: nydus-snapshotterSTATUS: deployedREVISION: 1TEST SUITE: NoneNOTES:Thank you for installing nydus-snapshotter.
Your release is named nydus-snapshotter.
To learn more about the release, try:
  $ helm status nydus-snapshotter  $ helm get all nydus-snapshotter
```

更多详情参考：[*https://github.com/dragonflyoss/helm-charts/blob/main/INSTALL.md*](https://github.com/dragonflyoss/helm-charts/blob/main/INSTALL.md)

**ContainerOS 使用**

ContainerOS 针对 ACK 集群节点池的弹性扩容场景，实现了极速扩容的特性。一方面，LifseaOS 通过简化 OS 本身的启动流程提高了 OS 启动速度。它裁剪掉了大量云上场景无需的硬件驱动，必要的内核驱动模块修改为 built-in 模式，去除了 initramfs，udev 规则也被大大简化，OS 首次启动时间从传统 OS 的 1min 以上下降到了 2s 左右。另一方面，ContainerOS 结合 ACK 场景进行了定制优化。它通过预置集群管控必备组件的容器镜像以减少节点启动过程中因镜像拉取而带来的耗时，并结合 ACK 管控链路优化（例如调节关键逻辑的检测频率、调整高负载下系统瓶颈中的限流值等），极大地提高了节点扩容速度。在阿里云控制台上为 ACK 集群建立托管节点池[12]时，在配置菜单中可以选择 ECS 实例的操作系统，下拉选择 ContainerOS 即可，OS 镜像名字中的 1.24.6 对应的是集群的 K8s 版本。另外，如果您需要高性能的节点池弹性扩容能力，为了实现最佳的节点扩容性能，更多信息请参见使用 ContainerOS 实现节点极速扩容[13]。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4f3b26fa56e64084807d7dcd59c3daf0~tplv-k3u1fbpfcp-zoom-1.image)

**注意事项**

ContainerOS 目前仅支持 Kubernetes 1.24.6 及以上版本，需要在创建 ACK 集群，或升级 ACK 集群的 K8s 版本[14]为 1.24.6 及以上版本方可使用。ContainerOS 预置了影响 Node Ready 和 Pod Ready 的必备的组件，如 Flannel、Terway 等网络插件。原本节点启动后需要拉取并启动这些组件的容器镜像，节点才会处于就绪状态，预置之后便无需从网络上拉取。但是，为了防止集群的组件版本与预置的组件版本不一致的情况，请参考注意事项[15]。  

**参考资料**

-   [*https://github.com/containerd/containerd*](https://github.com/containerd/containerd)

-   [*https://github.com/dragonflyoss/Dragonfly2*](https://github.com/dragonflyoss/Dragonfly2)

-   [*https://d7y.io/*](https://d7y.io/)

-   [*https://github.com/dragonflyoss/image-service*](https://github.com/dragonflyoss/image-service)

-   [*https://nydus.dev/*](https://nydus.dev/)

-   [*https://github.com/goharbor/harbor*](https://github.com/goharbor/harbor)

-   [*https://www.alibabacloud.com/help/zh/container-registry*](https://www.alibabacloud.com/help/zh/container-registry)

-   [*https://github.com/moby/moby/tree/master/image/spec*](https://github.com/moby/moby/tree/master/image/spec)

-   [*https://docs.docker.com/registry/spec/manifest-v2-1/*](https://docs.docker.com/registry/spec/manifest-v2-1/)

-   [*https://docs.docker.com/registry/spec/manifest-v2-2/*](https://docs.docker.com/registry/spec/manifest-v2-2/)

-   [*https://github.com/opencontainers/image-spec/blob/main/layer.md#representing-changes*](https://github.com/opencontainers/image-spec/blob/main/layer.md#representing-changes)

-   [*https://github.com/opencontainers/image-spec/blob/main/manifest.md*](https://github.com/opencontainers/image-spec/blob/main/manifest.md)

-   [*https://www.usenix.org/conference/fast16/technical-sessions/presentation/harter*](https://www.usenix.org/conference/fast16/technical-sessions/presentation/harter)

-   [*https://www.kernel.org/doc/html/latest/filesystems/fuse.html*](https://www.kernel.org/doc/html/latest/filesystems/fuse.html)

-   [*https://virtio-fs.gitlab.io/*](https://virtio-fs.gitlab.io/)

-   [*https://www.kernel.org/doc/html/latest/filesystems/erofs.html*](https://www.kernel.org/doc/html/latest/filesystems/erofs.html)

-   [*https://github.com/dragonflyoss/image-service/blob/fscache/docs/nydus-fscache.md*](https://github.com/dragonflyoss/image-service/blob/fscache/docs/nydus-fscache.md)

-   [*https://mp.weixin.qq.com/s/w7lIZxT9Wk6-zJr23oBDzA*](https://mp.weixin.qq.com/s/w7lIZxT9Wk6-zJr23oBDzA)

-   [*https://static.sched.com/hosted_files/kccncosschn21/fd/EROFS_What_Are_We_Doing_Now_For_Containers.pdf*](https://static.sched.com/hosted_files/kccncosschn21/fd/EROFS_What_Are_We_Doing_Now_For_Containers.pdf)

-   [*https://github.com/imeoer/buildkit/tree/nydus-compression-type*](https://github.com/imeoer/buildkit/tree/nydus-compression-type)

**参考链接**

[1]ZOLOZ：[*https://www.zoloz.com/*](https://www.zoloz.com/)

[2]BuildKit：[*https://github.com/moby/buildkit/blob/master/docs/nydus.md*](https://github.com/moby/buildkit/blob/master/docs/nydus.md)

[3]Cern 的这篇论文：[*https://indico.cern.ch/event/567550/papers/2627182/files/6153-paper.pdf*](https://indico.cern.ch/event/567550/papers/2627182/files/6153-paper.pdf)

[4]OCI：[*https://github.com/opencontainers/image-spec/*](https://github.com/opencontainers/image-spec/)

[5]Docker：[*https://github.com/moby/moby/blob/master/image/spec/v1.2.md*](https://github.com/moby/moby/blob/master/image/spec/v1.2.md)

[6]RAFS 镜像格式：[*https://d7y.io/zh/blog/2022/06/06/evolution-of-nydus/#rafs-v6-镜像格式*](https://d7y.io/zh/blog/2022/06/06/evolution-of-nydus/#rafs-v6-镜像格式)

[7]Nydus Image Service 项目：[*https://github.com/dragonflyoss/image-service*](https://github.com/dragonflyoss/image-service)

[8]FUSE：[*https://www.kernel.org/doc/html/latest/filesystems/fuse.html*](https://www.kernel.org/doc/html/latest/filesystems/fuse.html)

[9]Nydus EROFS fscache user guide：[*https://github.com/dragonflyoss/image-service/blob/master/docs/nydus-fscache.md*](https://github.com/dragonflyoss/image-service/blob/master/docs/nydus-fscache.md)

[10]Nydus 镜像加速之内核演进之路：[*https://mp.weixin.qq.com/s/w7lIZxT9Wk6-zJr23oBDzA*](https://mp.weixin.qq.com/s/w7lIZxT9Wk6-zJr23oBDzA)

[11]Alinux2 Optimized-OS：[*https://help.aliyun.com/document_detail/206271.html*](https://help.aliyun.com/document_detail/206271.html)

[12]托管节点池：[*https://help.aliyun.com/document_detail/190616.html*](https://help.aliyun.com/document_detail/190616.html)

[13]使用 ContainerOS 实现节点极速扩容：[*https://www.alibabacloud.com/help/zh/container-service-for-kubernetes/latest/add-containeros-nodes-to-autoscale*](https://www.alibabacloud.com/help/zh/container-service-for-kubernetes/latest/add-containeros-nodes-to-autoscale)

[14]升级 ACK 集群的 K8s 版本：[*https://help.aliyun.com/document_detail/86497.html*](https://help.aliyun.com/document_detail/86497.html)

[15]注意事项：[*https://help.aliyun.com/document_detail/607514.html#section-832-c5w-8gy*](https://help.aliyun.com/document_detail/607514.html#section-832-c5w-8gy)

**了解更多...**

**Nydus Star 一下✨：**[*https://github.com/dragonflyoss/image-service*](https://github.com/dragonflyoss/image-service)
