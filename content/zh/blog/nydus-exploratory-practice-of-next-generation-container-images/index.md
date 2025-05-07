---
title: "Nydus —— 下一代容器镜像的探索实践"
authorlink: "https://github.com/sofastack"
description: "容器镜像是云原生的基础设施之一，虽然镜像生态众多，但自它诞生以来，镜像设计本身并没有多少改进。这篇文章要探讨的就是对容器镜像未来发展的一些思考，以及 Nydus 容器镜像的探索和实践。"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2022-06-14T15:00:00+08:00
cover: "https://img.alicdn.com/imgextra/i1/O1CN01RhFWZu1IEqAgomXg9_!!6000000000862-2-tps-900-383.png"
---

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d2a84f339ec146539772f2045504db92~tplv-k3u1fbpfcp-zoom-1.image)

文｜严松（花名：井守）

Nydus 镜像开源项目 Maintainer、蚂蚁集团技术专家

蚂蚁集团基础设施研发，专注云原生镜像与容器运行时生态

**本文 7060 字 阅读 15 分钟**

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bc2c06be5f6f41df8e91dfb388b25b7c~tplv-k3u1fbpfcp-zoom-1.image)

## **｜前言｜**

容器镜像是云原生的基础设施之一，作为容器运行时文件系统视图基础，从它诞生到现在，衍生出了镜像构建、存储、分发到运行时的整个镜像生命周期的各种生态。

然而，虽然镜像生态众多，但自它诞生以来，镜像设计本身并没有多少改进。这篇文章要探讨的就是对容器镜像未来发展的一些思考，以及 Nydus 容器镜像的探索和实践。

读完这篇文章，你能够了解到：

**-** 容器镜像的基本原理，以及它的组成格式；

**-** 目前的镜像设计有哪些问题，应该如何改进；

**-** Nydus 容器镜像做了哪些探索，以及怎么实践。

## **PART. 1**

## **容器镜像**

### **OCI 容器镜像规范**

容器提供给了应用一个快速、轻量且有着基本隔离环境的运行时，而镜像提供给了容器 RootFS，也就是容器内能看到的整个 Filesystem 视图，其中至少包括了文件目录树结构、文件元数据以及数据部分。镜像的特点如下：

**-** 易于传输，例如通过网络以 HTTP 的方式从 Registry 上传或下载；

**-** 易于存储，例如可以打包成 Tar Gzip 格式，存储在 Registry 上；

**-** 具备不可变特性，整个镜像有一个唯一 Hash，只要镜像内容发生变化，镜像 Hash 也会被改变。

早期的镜像格式是由 Docker 设计的，经历了从 Image Manifest V1[1]、V2 Scheme 1[2]到 V2 Scheme 2[3]的演进。后来出现了诸如 CoreOS 推出的其他容器运行时后，为了避免竞争和生态混乱，OCI 标准化社区成立。它定义了容器在运行时、镜像以及分发相关的实现标准，我们目前用的镜像格式基本都是 OCI 兼容的。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a2b59e12a83a412a800ab4ef5f2f16bc~tplv-k3u1fbpfcp-zoom-1.image)

**镜像主要是由镜像层和容器配置两大部分组成的。**

什么是镜像层？

可以回想下平时写的 Dockerfile 文件：每条 ADD、COPY、RUN 指令都可能会产生新的镜像层，新层包含的是在旧层的基础上，新增加或修改的文件 *（包含元数据和数据）* ，或被删除的文件 *（用称之为 * *Whiteout* ***[4]* *的特殊文件表示删除）* 。

所以简单来说镜像的每一层存储的是 Lower 与 Upper 之间的 Diff，非常类似 Git Commit。这层 Diff 通常会被压缩成 Tar Gzip 格式后上传到 Registry。

在运行时，所有 Diff 堆叠起来后，就组成了提供给容器的整个文件系统视图，也就是 RootFS。镜像的另外一部分是容器运行时配置，这部分包含了命令、环境变量、端口等信息。

镜像层和运行时配置各自有一个唯一 Hash *（通常是 SHA256）* ，这些 Hash 会被写进一个叫 Manifest[5]的 JSON 文件里，在 Pull 镜像时实际就是先拉取 Manifest 文件，然后再根据 Hash 去 Registry 拉取对应的镜像层/容器运行时配置。

### **目前的镜像设计问题**

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5996d85bec7a4a2caf916e2a58f798cf~tplv-k3u1fbpfcp-zoom-1.image)

**第一**，我们注意到镜像层需要全部堆叠后，容器才能看到整个文件系统视图，所以容器需要等到镜像的每一层都下载并解压之后才能启动。有一篇 FAST 论文研究分析[6]说镜像拉取占了大约容器 76% 的启动时间，但却只有 6.4% 的数据是会被容器读取的。这个结果很有趣，它激发了我们可以通过按需加载的方式来提高容器启动速度。另外，在层数较多的情况下，运行时也会有 Overlay 堆叠的开销。

**第二**，每层镜像是由元数据和数据组成的，那么这就导致某层镜像中只要有一个文件元数据发生变化，例如修改了权限位，就会导致层的 Hash 发生变化，然后导致整个镜像层需要被重新存储，或重新下载。

**第三**，假如某个文件在 Upper 层里被删除或者被修改，旧版本文件依然留存在 Lower 层里不会被删除。在拉取新镜像时，旧版本还是会被下载和解压，但实际上这些文件是容器不再需要的了。当然我们可以认为这是因为镜像优化做的不够好，但在复杂场景下却很难避免出现这样的问题。

**第四**，镜像 Hash 能够保证镜像在上传和下载时候的不可变，但在镜像被解压落盘后，很难保证运行时数据不被篡改，这也就意味着运行时的数据是不可信的。

**第五**，镜像是以层为基本存储单位，数据去重是通过层的 Hash，这也导致了数据去重的粒度较粗。从整个 Registry 存储上看，镜像中的层与层之间，镜像与镜像之间存在大量重复数据，占用了存储和传输成本。

### **镜像设计应该如何改进**

我们看到了 OCI 镜像设计的诸多问题，在大规模集群场景下，存储与网络负载压力会被放大，这些问题的影响尤为明显，因此镜像设计急需从格式、构建、分发、运行、安全等各方面做优化。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d6035b1f6cf64247bc21344d219fb449~tplv-k3u1fbpfcp-zoom-1.image)

**首先，我们需要实现按需加载。** 在容器启动时，容器内业务 IO 请求了哪些文件的数据，我们再从远端 Registry 拉取这些数据，通过这种方式，可以避免镜像大量数据拉取阻塞容器的启动。

**其次，我们需要用一个索引文件记录某个文件的数据块在层的 Offset 偏移位置。** 因为现在的问题是，Tar 格式是不可寻址的，也就是说需要某个文件时，只能从头顺序读取整个 Tar 流才能找到这部分数据，那么我们自然就想到了可以用这种方式来实现。

**接着，我们改造层的格式以支持更简单的寻址。** 由于 Tar 是会被 Gzip 压缩的，这导致了就算知道 Offset 也比较难 Unzip。

我们让原来的镜像层只存储文件的数据部分 *（也就是图中的 Blob 层）* 。Blob 层存储的是文件数据的切块 *（Chunk）* ，例如将一个 10MB 的文件，切割成 10 个 1MB 的块。这样的好处是我们可以将 Chunk 的 Offset 记录在一个索引中，容器在请求文件的部分数据时，我们可以只从远端 Registry 拉取需要的一部分 Chunks，如此一来节省不必要的网络开销。

另外，按 Chunk 切割的另外一个优势是细化了去重粒度，Chunk 级别的去重让层与层之间，镜像与镜像之间共享数据更容易。

**最后，我们将元数据和数据分离** **。** 这样可以避免出现因元数据更新导致的数据层更新的情况，通过这种方式来节省存储和传输成本。

元数据和 Chunk 的索引加在一起，就组成了上图中的 Meta 层，它是所有镜像层堆叠后容器能看到的整个 Filesystem 结构，包含目录树结构，文件元数据，Chunk 信息等。

另外，Meta 层包含了 Hash 树以及 Chunk 数据块的 Hash，以此来保证我们可以在运行时对整颗文件树校验，以及针对某个 Chunk 数据块做校验，并且可以对整个 Meta 层签名，以保证运行时数据被篡改后依然能够被检查出来。

如上所述，我们在 Nydus 镜像格式中引入了这些特性，总结下来如下：

**-** 镜像元数据和数据分离，用户态按需加载与解压；

**-** 更细粒度的块级别数据切割与去重；

**-** 扁平化元数据层 *（移除中间层）* ，直接呈现 Filesystem 视图；

**-** 端到端的文件系统元数据树与数据校验。

## **PART. 2**

## **Nydus 解决方案**

### **镜像加速框架**

Nydus 镜像加速框架是 Dragonfly[7] *（CNCF 孵化中项目）* 的子项目。它兼容了目前的 OCI 镜像构建、分发、运行时生态。Nydus 运行时由 Rust 编写，它在语言级别的安全性以及在性能、内存和 CPU 的开销方面非常有优势，同时也兼具了安全和高可扩展性。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c80d20ff6c4d477aae0f736ca5c7b1b2~tplv-k3u1fbpfcp-zoom-1.image)

Nydus 默认使用用户态文件系统实现 FUSE[8]来做按需加载，用户态的 Nydus Daemon 进程将 Nydus 镜像挂载点作为容器 RootFS 目录。当容器产生 read *（fd, count）* 之类的文件系统 IO 时，内核态 FUSE 驱动将该请求加入处理队列，用户态 Nydus Daemon 通过 FUSE Device 读取并处理该请求，从远端 Registry 拉取 Count 对应数量的 Chunk 数据块后，最终通过内核态 FUSE 回复给容器。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c7dbbba947424be1911933da63db8d43~tplv-k3u1fbpfcp-zoom-1.image)

Nydus 加速框架支持了三种运行模式，以支持不同场景下的镜像按需加载：

**1.** 通过 FUSE 提供给 RunC 这类容器运行时的按需加载能力，也是 Nydus 目前最常用的模式；

**2.** 通过 VirtioFS[9]承载 FUSE 协议，让基于 VM 的容器运行时，例如 Kata 等，为 VM Guest 里的容器提供 RootFS 按需加载能力；

**3.** 通过内核态的 EROFS[10]只读文件系统提供 RootFS，目前 Nydus 的 EROFS 格式支持已经进入了 Linux 5.16 主线，其内核态缓存方案 erofs over fscache 也已经合入 Linux 5.19-rc1 主线，内核态方案可以减少上下文切换及内存拷贝开销，在性能有极致要求的情况下可以用这种模式。

在存储后端侧，Nydus 可以接各种 OCI Distribution 兼容的 Registry，以及直接对接对象存储服务例如 OSS，网络文件系统例如 NAS 等。它也包含了本地 Cache 能力，在数据块从远端拉取下来后，它会被解压并存储到本地缓存中，以便在下一次热启动时提供更好的性能。

另外除了近端本地 Cache，它也可以接 P2P 文件分发系统 *（例如 Dragonfly）* 以加速块数据的传输。同时，它也能够最大程度降低大规模集群下的网络负载以及 Registry 的单点压力，实际场景测试在有 P2P 缓存的情况下，网络延迟能够降低 **80%**  以上。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f7bc681ecf7943bdada1bd12cffb09d1~tplv-k3u1fbpfcp-zoom-1.image)

从这张图的基准测试可以看到，OCI 镜像容器的端到端冷启动时间 *（从 Pod 创建到 Ready）* 随着镜像尺寸增大，耗时越来越越长，但 Nydus 镜像容器始终保持平稳，耗时在 2s 左右。

### **镜像场景性能优化**

目前仅在蚂蚁的落地场景下，都有每日百万级别的 Nydus 加速镜像容器创建，它在生产级的稳定性和性能方面得到了保障。在如此大规模的场景考验下，Nydus 在性能，资源消耗等方面做了诸多优化。

镜像数据性能方面，Rust 实现的运行时 *（nydusd）* 本身已经在内存及 CPU 方面做到了低开销。影响 Nydus 镜像容器启动性能的主要负载是来自网络，因此除了借助 P2P 分发从就近节点拉取 Chunk 块数据外，Nydus 还实现了一层本地 Cache，已经从远端拉取的 Chunk 会解压缩后缓存在本地，Cache 可以做到以层为单位在镜像之间共享，也可以做到 Chunk 级别的共享。

虽然 Nydus 可以配置集群内 P2P 加速，但按需加载在拉取每个 Chunk 时都可能会发起一次网络 IO。因此我们实现了 IO 读放大，将小块请求合并在一起发起一次请求，降低连接数。同时 Dragonfly 也实现了针对 Nydus 的 Chunk 块级别的 P2P 缓存和加速。

另外，我们通过观察容器启动时读取镜像文件的顺序，能够分析出访问模式，从而在容器 IO 读数据前预先加载这部分数据 *（预取）* ，能够提高冷启动性能。与此同时，我们通过在镜像构建阶段重新排布 Chunk 顺序，能够进一步降低启动延迟。

镜像元数据性能方面，例如对于一个几十 GB 大小且小文件较多的 Nydus 镜像，它的元数据层可能会达到 10MB 以上，如果一次性加载到内存中会非常不合算。因此我们改造了元数据结构，让它也实现了按需加载 *（ondisk mmap）* ，对函数计算这种内存敏感场景非常有用。

除了在运行时优化性能以外，Nydus 在构建时还做了一些优化工作。**在多数场景下相比 Tar Gzip 格式的 OCI 镜像，Nydus 镜像层导出时间优化到比其快 30%，未来目标是优化到 50% 以上**。

### **不止于镜像加速**

这些优化手段足以应对镜像加速场景，但 Nydus 不止能应用在镜像的加速上，它也正在演进为一个可以在其他领域同样适用的通用分发加速框架。总体呈现如下：

**1.** Nydus 除了原生集成 Kata 安全容器外，在函数计算场景，例如阿里云的代码包加速以及 Serverless 场景，**Runtime 镜像准备的冷启动耗时通过 Nydus 从 20s 降低到了 800ms**；

**2.** 软件依赖包管理场景，例如前端 NPM 包，在安装阶段有大量的小文件需要解压落盘。但小文件 IO 非常影响性能，通过 Nydus 可以实现免解压，**蚂蚁的** **TNPM 项目**[11]**为 Nydus 增加了 macOS 平台支持，将原生 NPM 的安装速度从 25s 降低到了 6s**；

**3.** 在镜像数据化场景，我们通过算法分析业务镜像之间的 Chunk 相似度，**通过构造 Nydus Chunk 字典镜像，降低了业务快速迭代导致的 50% 以上的存储消耗**，未来还会通过机器学习，帮助业务进一步优化镜像尺寸。

### **文件系统可扩展性**

业界也有基于用户态块设备的镜像加速方案设计 *（自定义块格式 > 用户态块设备 > 文件系统）* 。通过上面的介绍可以发现，Nydus 无论是 FUSE 用户态模式还是内核态 EROFS 模式，都是基于文件系统而非块设备，这样的设计使得 Nydus 无论是在构建还是运行时，都可以很容易地访问到文件级别的数据信息。这种天然能力为许多其他场景提供了可能，例如：

**1.** 在安全扫描场景，无需把整个镜像下载解压，就能预先通过分析元数据，发现其中的高危软件版本，再通过按需读取文件内容，扫描发现敏感与不合规数据，极大提高镜像扫描速度；

**2.** 镜像文件系统优化，通过 trace 运行时文件访问请求，告知用户访问过哪些文件，执行过哪些程序，这些记录可以提供给用户帮助优化镜像大小，提供给安全团队帮助审计可疑操作，提供给镜像构建阶段优化排布，以提高运行时预读性能等；

**3.** 运行时通过 hook 文件访问请求，拦截高危软件执行，阻断敏感数据读取，实现业务无感的漏洞资源替换与热修复；

### **端到端的内核态方案**

Nydus 在早期完全是一个用户态实现，但为了适应极致性能场景下的需求，例如函数计算与代码包场景，我们又将按需加载能力下沉到了内核态。相比于 FUSE 用户态方案，内核态实现可以减少随机小 I/O 访问造成的大量系统调用开销，减少 FUSE 请求处理的用户态与内核态的上下文切换以及内存拷贝开销。

依托于内核态 EROFS *（始于 Linux 4.19）* 文件系统，我们对其进行了一系列的改进与增强，拓展其在镜像场景下的能力，最终呈现为一个内核态的容器镜像格式——Nydus RAFS *（Registry Acceleration File System）* v6，相比于此前的格式，它具备块数据对齐，元数据更加精简，高可扩展性与高性能等优势。

如上所述，在镜像数据全部下载到本地的情况下，FUSE 用户态方案会导致访问文件的进程频繁陷出到用户态，并涉及内核态/用户态之间的内存拷贝。因此我们更进一步支持了 EROFS over fscache 方案  *(Linux 5.19-rc1)* 。

当用户态 nydusd 从远端下载 Chunk 后会直接写入 fscache 缓存，之后容器访问时，能够直接通过内核态 fscache 读取数据，而无需陷出到用户态，在容器镜像的场景下实现几乎无损的性能和稳定性。其表现优于 FUSE 用户态方案，同时与原生文件系统 *（未使用按需加载）* 的性能相近。

目前 Nydus 在构建、运行、内核态  *(Linux 5.19-rc1)*  均已支持了该方案，详细用法可以参见 Nydus EROFS fscache user guide[12]，另外想了解更多 Nydus 内核态实现细节，可以参见 Nydus 镜像加速之内核演进之路[13]。

## **PART. 3**

## **Nydus 生态系统与未来**

**Nydus 兼容了目前的 OCI 镜像构建、分发、运行时生态，除了提供自有的工具链外，Nydus 与社区主流生态做了兼容与集成。**

### **Nydus 工具链**

**-** Nydus Daemon *（nydusd[14]）* ：Nydus 用户态运行时，支持 FUSE，FUSE on VirtioFS 模式以及 EROFS 只读文件系统格式，目前也已支持 macOS 平台运行；

**-** Nydus Builder *（nydus-image[15]）* ：Nydus 格式构建工具，支持从源目录/eStargz TOC 等构建 Nydus 格式，可用于 OCI 镜像分层构建，以及代码包构建等场景，支持 Nydus 格式检查与校验；

**-** Nydusify *（nydusify[16]）* ：Nydus 格式镜像转换工具，支持从源 Registry 拉取镜像并转换为 Nydus 镜像格式并 Push 到目标 Registry 或对象存储服务，支持 Nydus 镜像校验和远端缓存加速转换；

**-** Nydus Ctl *（nydusctl[17]）* ：Nydus Daemon 管控 CLI，可用于查询 Daemon 状态，Metrics 指标以及运行时热更新配置；

**-** Ctr Remote *（ctr-remote[18]）* ：增强版 Contianerd CLI (Ctr) 工具以支持直接拉取与运行 Nydus 镜像；

**-** Nydus Backend Proxy *（nydus-backend-proxy[19]）* ：用于将本地目录映射为 Nydus Daemon 存储后端的 HTTP 服务，在没有 Registry 或对象存储服务的场景下可用；

**-** Nydus Overlayfs *（nydus-overlayfs[20]）* ：Containerd Mount Helper 工具，它可以被用于基于 VM 的容器运行时，例如 Kata Containers 等。

### **Nydus 生态集成**

**-** Harbor *（acceld[21]）* ：由 Nydus 发起的镜像转换服务 Acceld，让 Harbor 原生支持 eStargz, Nydus 等加速镜像的转换；

**-** Dragonfly *（dragonfly）* ：P2P 文件分发系统，为 Nydus 实现了块级别的数据缓存与分发能力；

**-** Nydus Snapshotter *（nydus snapshotter[22]）* ：Containerd 的子项目，以 Remote 插件机制为 Containerd 支持了 Nydus 容器镜像；

**-** Docker *（nydus graphdriver[23]）* ：以 Graph Driver 插件机制为 Docker 支持了 Nydus 容器镜像；

**-** Kata Containers *（kata containers[24]）* ：Nydus 为 Kata 安全容器提供原生的镜像加速方案；

**-** EROFS *（nydus with erofs[25]）* ：Nydus 兼容 EROFS 只读文件系统格式，可以内核态方式直接运行 Nydus 镜像，提升极限场景下的性能；

**-** Buildkit *（nydus compression type[26]）* ：从 Dockerfile 直接导出 Nydus 格式镜像。

### **Nydus 未来方向**

在逐步推进上游生态，扩展应用领域的同时，Nydus 也在进一步从性能，安全等如下几个方向上做了更多的探索：

**1.** Nydus 目前已经支持了内核态 EROFS 只读文件系统，我们将进一步在性能、原生集成方面做更多工作；

**2.** 目前 Nydus 在大部分场景下导出速度比 OCIv1 Tar Gzip 更快，接下来我们会让构建也实现按需加载，例如允许 Base 镜像指定为 Nydus 镜像，在做 Dockerfile 构建时就不需要先把整个 Base 镜像拉取下来，进一步提高构建速度；

**3.** 我们在用机器学习方法分析镜像与镜像间乃至整个镜像中心存储，利用运行时访问模式分析等手段进一步优化镜像数据去重效率，降低存储，提高运行时性能；

**4.** 与各大镜像安全扫描框架合作，原生支持更快的镜像扫描，支持在运行时拦截高危软件执行，阻断高危读写，业务无感的漏洞热修复与资源替换；

**5.** 除了按需加载外，Nydus 还可以解决海量小文件 IO 性能问题，蚂蚁即将开源的前端 tnpm 项目已经实践了方案，我们在考虑拓展到更多的场景。

Nydus 相较于社区其他按需加载方案，它在镜像场景为性能优化与低资源开销做了诸多工作，并且拓宽了按需加载技术在镜像扫描与审计，以及在非镜像场景下落地的可能性。

如标题所言，虽然它不一定代表了容器镜像的未来，但想必它也能为未来容器镜像在格式设计，优化方向，实践思路等方面提供具备核心竞争力的参考。Nydus 秉承了开源也开放的理念，期待着有更多的社区一同参与，为容器技术的未来贡献自己的力量。

Nydus 网站：*[https://nydus.dev/](https://nydus.dev/)*

深入 Nydus，与我们一起探索～

**了解更多...**

**Nydus Star 一下✨：**
*[https://github.com/dragonflyoss/image-service](https://github.com/dragonflyoss/image-service)*

### **【参考链接】**

[1]Image Manifest V1：*[https://github.com/moby/moby/tree/master/image/spec](https://github.com/moby/moby/tree/master/image/spec)*

[2]V2 Scheme 1：*[https://docs.docker.com/registry/spec/manifest-v2-1/](https://docs.docker.com/registry/spec/manifest-v2-1/)*

[3]V2 Scheme 2：*[https://docs.docker.com/registry/spec/manifest-v2-2/](https://docs.docker.com/registry/spec/manifest-v2-2/)*

[4]Whiteout：*[https://github.com/opencontainers/image-spec/blob/main/layer.md#representing-changes](https://github.com/opencontainers/image-spec/blob/main/layer.md#representing-changes)*

[5]Manifest：*[https://github.com/opencontainers/image-spec/blob/main/manifest.md](https://github.com/opencontainers/image-spec/blob/main/manifest.md)*

[6]《Slacker Fast Distribution with Lazy Docker Containers》：*[https://www.usenix.org/conference/fast16/technical-sessions/presentation/harter](https://www.usenix.org/conference/fast16/technical-sessions/presentation/harter)*

[7]Drafonfly：*[https://d7y.io/](https://d7y.io/)*

[8]FUSE：*[https://www.kernel.org/doc/html/latest/filesystems/fuse.html](https://www.kernel.org/doc/html/latest/filesystems/fuse.html)*

[9]VirtioFS：*[https://virtio-fs.gitlab.io/](https://virtio-fs.gitlab.io/)*

[10]EROFS：*[https://www.kernel.org/doc/html/latest/filesystems/erofs.html](https://www.kernel.org/doc/html/latest/filesystems/erofs.html)*

[11]TNPM：*[https://dev.to/atian25/in-depth-of-tnpm-rapid-mode-how-could-we-fast-10s-than-pnpm-3bpp](https://dev.to/atian25/in-depth-of-tnpm-rapid-mode-how-could-we-fast-10s-than-pnpm-3bpp)*

[12]《Nydus EROFS fscache user guide》：*[https://github.com/dragonflyoss/image-service/blob/fscache/docs/nydus-fscache.md](https://github.com/dragonflyoss/image-service/blob/fscache/docs/nydus-fscache.md)*

[13]《Nydus 镜像加速之内核演进之路》：*[https://mp.weixin.qq.com/s/w7lIZxT9Wk6-zJr23oBDzA](https://mp.weixin.qq.com/s/w7lIZxT9Wk6-zJr23oBDzA)*

[14]Nydusd：*[https://github.com/dragonflyoss/image-service/blob/master/docs/nydusd.md](https://github.com/dragonflyoss/image-service/blob/master/docs/nydusd.md)*

[15]Nydus Image：*[https://github.com/dragonflyoss/image-service/blob/master/docs/nydus-image.md](https://github.com/dragonflyoss/image-service/blob/master/docs/nydus-image.md)*

[16]Nydusify ：*[https://github.com/dragonflyoss/image-service/blob/master/docs/nydusify.md](https://github.com/dragonflyoss/image-service/blob/master/docs/nydusify.md)*

[17]Nydus Ctl：*[https://github.com/dragonflyoss/image-service/blob/master/docs/nydus-image.md](https://github.com/dragonflyoss/image-service/blob/master/docs/nydus-image.md)*

[18]Ctr Remote：*[https://github.com/dragonflyoss/image-service/tree/master/contrib/ctr-remote](https://github.com/dragonflyoss/image-service/tree/master/contrib/ctr-remote)*

[19]Nydus Backend Proxy：*[https://github.com/dragonflyoss/image-service/blob/master/contrib/nydus-backend-proxy/README.md](https://github.com/dragonflyoss/image-service/blob/master/contrib/nydus-backend-proxy/README.md)*

[20]Nydus Overlayfs：*[https://github.com/dragonflyoss/image-service/tree/master/contrib/nydus-overlayfs](https://github.com/dragonflyoss/image-service/tree/master/contrib/nydus-overlayfs)*

[21]Acceld：*[https://github.com/goharbor/acceleration-service](https://github.com/goharbor/acceleration-service)*

[22]Nydus Snapshotter：*[https://github.com/containerd/nydus-snapshotter](https://github.com/containerd/nydus-snapshotter)*

[23]Nydus Graphdriver：*[https://github.com/dragonflyoss/image-service/tree/master/contrib/docker-nydus-graphdriver](https://github.com/dragonflyoss/image-service/tree/master/contrib/docker-nydus-graphdriver)*

[24]Kata Containers：*[https://github.com/kata-containers/kata-containers/blob/main/docs/design/kata-nydus-design.md](https://github.com/kata-containers/kata-containers/blob/main/docs/design/kata-nydus-design.md)*

[25]Nydus with EROFS：*[https://static.sched.com/hosted_files/kccncosschn21/fd/EROFS_What_Are_We_Doing_Now_For_Containers.pdf](https://static.sched.com/hosted_files/kccncosschn21/fd/EROFS_What_Are_We_Doing_Now_For_Containers.pdf)*

[26]Nydus Compression Type：*[https://github.com/imeoer/buildkit/tree/nydus-compression-type](https://github.com/imeoer/buildkit/tree/nydus-compression-type)*

### **本周推荐阅读**

GLCC 首届编程夏令营 高校学生报名正式开始！

[![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1aea3ea4b18942918bf906e2020bc0a3~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247510027&idx=1&sn=43a8f240d7edd036307d0f1fdd616714&chksm=faa347d1cdd4cec7adf7762963a94617060d96decba99beffb44d5f940e5a7f076b0844c4ab0&scene=21)

Nydus 镜像加速插件迁入 Containerd 旗下

[![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d8b39c3c5f4343269094165de14a15be~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247504035&idx=1&sn=320b77bf5f3c6cf0da309f7527b98e64&chksm=faa33f79cdd4b66f184d273a2d7460c41320711eab47af849e386c359e71eeebc6c7f21c1e0f&scene=21)

技术人聊开源｜这并不只是用爱发电

[![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/dbee165ea3424850a9dd6512c4926802~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247501660&idx=1&sn=d39d1d2418c44a4b1a6da0128707baf3&chksm=faa32886cdd4a19089b46b029056ba4f032cf7cd53c52bc21ab16b6c51de147a710d84649b02&scene=21)

蚂蚁集团 Service Mesh 进展回顾与展望

[![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/74f79cfd82824718b130a6f3cc3e1060~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247509391&idx=1&sn=95883f61905cc4de15125ffd2183b801&chksm=faa34a55cdd4c3434a0d667f8ed57e59c2fc747315f947b19b23f520786130446b6828a68069&scene=21)

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8aa520399d21435793a475a3ad504c80~tplv-k3u1fbpfcp-zoom-1.image)
