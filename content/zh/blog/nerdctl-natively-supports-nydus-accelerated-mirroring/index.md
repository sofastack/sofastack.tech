---
title: "Nerdctl 原生支持 Nydus 加速镜像"
authorlink: "https://github.com/sofastack"
description: "Nerdctl 原生支持 Nydus 加速镜像"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2023-01-10T15:00:00+08:00
cover: "https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*aV5STZZYd9sAAAAAAAAAAAAADrGAAQ/original"
---

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ae3fe33e0148417fa455e2e749764819~tplv-k3u1fbpfcp-zoom-1.image)  

文｜李楠（GitHub ID : @loheagn）

北京航空航天大学 21 级研究生  

*云原生底层系统的开发和探索工作。*  

本文 **6369** 字 阅读 **16** 分钟

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c19f61e3b4134ae8a9631ff337baa583~tplv-k3u1fbpfcp-zoom-1.image)

OSPP 开源之夏是由中科院软件研究所“开源软件供应链点亮计划”发起并长期支持的一项暑期开源活动。旨在鼓励在校学生积极参与开源软件的开发维护、促进优秀开源软件社区的蓬勃发展、培养和发掘更多优秀的开发者。  

这是去年（2022）的开源活动中，李楠同学参加 Nydus 容器开源生态集成课题的相关工作。

**| 作者有话说 |**

> 大家好！我是来自北京航空航天大学的 2021 级研究生李楠，对云原生技术很感兴趣，GitHub ID 是 @loheagn。在今年上半年，我参加了 Linux 基金会的春季实习，完成了 CNCF - Kubevela: Management of Terraform state 项目的工作，并因此培养了对开源工作的兴趣。在开源之夏 2022 开放题目后，我了解到了 Nydus 项目，感觉这是一个很酷的项目，由于我之前对容器和镜像的底层技术并不是很熟悉，觉得这是个很不错的学习机会。于是便尝试投递了简历申请，最终很幸运地通过了筛选，并在严松老师的帮助下顺利完成了题目。

## PART. 1 项目背景

### Nerdctl

Nerdctl 是一个对标 Docker CLI 和 Docker Compose 的、用于与 Containerd *（当下最流行的容器运行时，Docker 的后端也是调用的 Containerd，通常作为守护进程出现）* 交互的命令行工具。

用户可以像使用 Docker CLI 一样使用 Nerdctl 与 Containerd 进行交互，比如使用 `nerdctl pull <image_name>` 来拉取镜像、使用 `nerdctl run <image_name>` 来运行容器等等。

相比于 Containerd 本身提供的 CTR 工具，Nerdctl 默认提供了更友好的用户体验，并尽量保持其使用方式与 Docker 一致。对于从 Docker 迁移到 Containerd 的用户，往往只需要 `alias docker=nerdctl` 就可以与之前获得一致的使用体验。

### OCI 镜像格式

OCI 镜像格式是 OCI *（Open Container Initiative，开放容器计划）* 的重要组成部分。它给出了一个厂商无关的镜像格式规范，即一个镜像应该包含哪些部分、每个部分的数据结构是如何的、这些各个部分应该以怎样的方式进行组织等等。

OCI 镜像格式脱胎于 Docker 镜像格式，它与 Docker 镜像格式有着非常类似的结构；但它比 Docker 镜像格式有更好的兼容性，并得到了各个厂商的普遍认同。

因此，在这里主要介绍一下 OCI 镜像格式的主要内容。

通常所说的镜像文件其实指的是一个包含了多个文件的“包”，“包”中的这些文件提供了启动一个容器所需要的所有需要信息，其中包括但不限于，容器所使用的文件系统等数据文件，镜像所适用的平台、数据完整性校验信息等配置文件。当我们使用 `docker pull` 或 `nerdctl pull` 从镜像中心拉取镜像时，其实就是在依次拉取该镜像所包含的这些文件。

例如，当我们使用 `nerdctl pull` 拉取一个 OCI 镜像时：

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7a789044ce6b4f20b6891cc5659f00d8~tplv-k3u1fbpfcp-watermark.image?)

从 Log 中可以清晰地看到，Nerdctl 依次拉取了一个 index 文件、一个 manifest 文件、一个 config 文件和若干个 layer 数据文件。实际上，一个标准的 OCI 镜像通常就是由这几部分构成的。

其中，layer 文件一般是 tar 包或者压缩后的 tar 包，其包含着镜像具体的数据文件。这些 layer 文件会共同组成一个完整的文件系统（*也就是从该镜像启动容器后，进入容器中看到的文件系统）* 。

config 文件是一个 JSON 文件。其中包含镜像的一些配置信息，比如镜像时间、修改记录、环境变量、镜像的启动命令等等。

manifest 文件也是一个 JSON 文件。它可以看作是镜像文件的清单，即说明了该镜像包含了哪些 layer 文件和哪个 config 文件。

下面是一个 manifest 文件的典型例子：

```JSON
{
  "schemaVersion": 2,
  "mediaType": "application/vnd.oci.image.manifest.v1+json",
  "config": {
    "mediaType": "application/vnd.oci.image.config.v1+json",
    "digest": "sha256:0584b370e957bf9d09e10f424859a02ab0fda255103f75b3f8c7d410a4e96ed5",
    "size": 7636
  },
  "layers": [
    {
      "mediaType": "application/vnd.oci.image.layer.v1.tar+gzip",
      "digest": "sha256:214ca5fb90323fe769c63a12af092f2572bf1c6b300263e09883909fc865d260",
      "size": 31379476
    },
    {
      "mediaType": "application/vnd.oci.image.layer.v1.tar+gzip",
      "digest": "sha256:50836501937ff210a4ee8eedcb17b49b3b7627c5b7104397b2a6198c569d9231",
      "size": 25338790
    },
    {
      "mediaType": "application/vnd.oci.image.layer.v1.tar+gzip",
      "digest": "sha256:d838e0361e8efc1fb3ec2b7aed16ba935ee9b62b6631c304256b0326c048a330",
      "size": 600
    },
    {
      "mediaType": "application/vnd.oci.image.layer.v1.tar+gzip",
      "digest": "sha256:fcc7a415e354b2e1a2fcf80005278d0439a2f87556e683bb98891414339f9bee",
      "size": 893
    },
    {
      "mediaType": "application/vnd.oci.image.layer.v1.tar+gzip",
      "digest": "sha256:dc73b4533047ea21262e7d35b3b2598e3d2c00b6d63426f47698fe2adac5b1d6",
      "size": 664
    },
    {
      "mediaType": "application/vnd.oci.image.layer.v1.tar+gzip",
      "digest": "sha256:e8750203e98541223fb970b2b04058aae5ca11833a93b9f3df26bd835f66d223",
      "size": 1394
    }
  ]
}
```

index 文件也是一个 JSON 文件。它是可选的，可以被认为是 manifest 的 manifest。试想一下，一个 tag 标识的镜像，比如 `docker.io/library/nginx:1.20` ，会针对不同的架构平台 *（比如 linux/amd、linux/arm64 等等）* 有不同的镜像文件，每个不同平台的镜像文件都有一个 manifest 文件来描述，那么我们就需要有个更高层级的文件来索引这多个 manifest 文件。

比如，`docker.io/library/nginx:1.20` 的 index 文件就包含一个 manifests 数组，其中记录了多个不同平台的 manifest 的基本信息：

```JSON
{
  "manifests": [
    {
      "digest": "sha256:a76df3b4f1478766631c794de7ff466aca466f995fd5bb216bb9643a3dd2a6bb",
      "mediaType": "application\/vnd.docker.distribution.manifest.v2+json",
      "platform": {
        "architecture": "amd64",
        "os": "linux"
      },
      "size": 1570
    },
    {
      "digest": "sha256:f46bffd1049ef89d01841ba45bb02880addbbe6d1587726b9979dbe2f6b556a4",
      "mediaType": "application\/vnd.docker.distribution.manifest.v2+json",
      "platform": {
        "architecture": "arm",
        "os": "linux",
        "variant": "v5"
      },
      "size": 1570
    },
    {
      "digest": "sha256:d9a32c8a3049313fb16427b6e64a4a1f12b60a4a240bf4fbf9502013fcdf621c",
      "mediaType": "application\/vnd.docker.distribution.manifest.v2+json",
      "platform": {
        "architecture": "arm",
        "os": "linux",
        "variant": "v7"
      },
      "size": 1570
    },
    {
      "digest": "sha256:acd1b78ac05eedcef5f205406468616e83a6a712f76d068a45cf76803d821d0b",
      "mediaType": "application\/vnd.docker.distribution.manifest.v2+json",
      "platform": {
        "architecture": "arm64",
        "os": "linux",
        "variant": "v8"
      },
      "size": 1570
    },
    {
      "digest": "sha256:d972eee4f12250a62a8dc076560acc1903fc463ee9cb84f9762b50deed855ed6",
      "mediaType": "application\/vnd.docker.distribution.manifest.v2+json",
      "platform": {
        "architecture": "386",
        "os": "linux"
      },
      "size": 1570
    },
    {
      "digest": "sha256:b187079b65b3eff95d1ea02acbc0abed172ba8e1433190b97d0acfddd5477640",
      "mediaType": "application\/vnd.docker.distribution.manifest.v2+json",
      "platform": {
        "architecture": "mips64le",
        "os": "linux"
      },
      "size": 1570
    },
    {
      "digest": "sha256:ae93c7f72dc47dbd984348240c02484b95650b8b328464c62559ef173b64ce0d",
      "mediaType": "application\/vnd.docker.distribution.manifest.v2+json",
      "platform": {
        "architecture": "ppc64le",
        "os": "linux"
      },
      "size": 1570
    },
    {
      "digest": "sha256:51f45f5871a8d25b65cecf570c6b079995a16c7aef559261d7fd949e32d44822",
      "mediaType": "application\/vnd.docker.distribution.manifest.v2+json",
      "platform": {
        "architecture": "s390x",
        "os": "linux"
      },
      "size": 1570
    }
  ],
  "mediaType": "application\/vnd.docker.distribution.manifest.list.v2+json",
  "schemaVersion": 2
}
```

综上，组成镜像的各个文件相互之间形成了一个树状结构，树的上层节点持有对下层节点的引用。从最上层的 index 文件或 manifest 文件开始，就可以“顺藤摸瓜”地索引到镜像的所有文件。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/95f79fb6123043f884ff03f4a8709ee2~tplv-k3u1fbpfcp-zoom-1.image)

需要注意的是，OCI 镜像规范是一个开放的格式，它只规定了文件的组织形式，但没规定数据文件的具体内容。我们完全可以将一些其他类型的文件打包成一个 OCI 镜像的格式，当做 OCI 镜像进行分发，从而充分利用 DockerHub 等镜像注册中心的能力。

## PART. 2 关于 Nydus

Nydus 是 CNCF 孵化项目 Dragonfly 的子项目，它提供了容器镜像、代码包、数据分析按需加载的能力，无需等待整个数据下载完成便可开始服务。

Nydus 在生产环境已经支撑了每日百万级别的加速镜像容器创建，在启动性能、镜像空间优化、网络带宽效率、端到端数据一致性等方面相比 OCI v1 格式有着巨大优势，并可扩展至例如 NPM 包懒加载等数据分发场景。

目前 Nydus 由蚂蚁集团、阿里云、字节跳动联合开发，Containerd、Podman 社区接受了 Nydus 运行时作为其社区子项目，也是 Kata Containers 以及 Linux v5.19 内核态原生支持的镜像加速方案。

### Nydus 镜像格式

Nydus 镜像格式是对下一代 OCI 镜像格式的探索。它的出现是基于以下的事实：在用户启动容器时，容器运行时会首先从远程 Registry 中下载完整的镜像文件 *（通常这一过程是容器启动时最耗时的部分）* ，然后才能对镜像的文件系统进行解包和挂载，最后完成容器的启动。

但实际上，用户在运行容器过程中，并不会用到文件系统中的全部文件，数据使用率通常只有 6% 左右；也就是说，花费大量时间拉取的镜像文件，却大概率最终不会用到。

因此，如果能在容器运行时，不提前拉取完整镜像，而只是在需要访问某些文件再动态拉取，将大大提高容器的启动效率，并带来网络带宽效率、镜像空间优化等更多好处。

下图是相同内容的 Nydus 镜像和 OCI 镜像在创建容器时的耗时对比：

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5d3cc4a9d7e84036beedd1d055b826cb~tplv-k3u1fbpfcp-watermark.image?)

Nydus 镜像格式并没有对 OCI 镜像格式在架构上进行修改，而主要优化了其中的 layer 数据层的数据结构。Nydus 将原本统一存放在 layer 层的文件数据和元数据 *（文件系统的目录结构、文件元数据等）* 分开，分别存放在 “Blob layer” 和 “Bootstrap layer” 中。并对 Blob layer 中存放的文件数据进行分块 *（chunk）* ，以便于懒加载 *（在需要访问某个文件时，只需要拉取对应的 chunk 即可，不需要拉取整个 Blob layer）* 。

同时，这些分块信息，包括每个 chunk 在 Blob layer 的位置信息等也被存放在 Bootstrap layer 这个元数据层中。这样，容器启动时，仅需拉取 Bootstrap layer 层，当容器具体访问到某个文件时，再根据 Bootstrap layer 中的元信息拉取对应 Blob layer 中的对应的 chunk 即可。

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/670b8fce234d4a6ea7c248101ee7817f~tplv-k3u1fbpfcp-watermark.image?)

从更上层的视角上，Nydus 镜像格式相比于 OCI 镜像格式的变化：

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b9bebf009a6542bea5f41d45c8325a40~tplv-k3u1fbpfcp-watermark.image?)

可以看到，Nydus 镜像对外依旧可以表现出 OCI 镜像格式的组织形式，因此，Nydus 镜像可以充分利用原有的 Docker 镜像和 OCI 镜像的存储分发的生态。

### Nydus Daemon

从前文的讨论中可以看出，从 Nydus 镜像生成的容器，当其访问文件系统中的文件时，实际上访问的不是文件系统，而是一个“网络文件系统”——实际访问的是这个“网络文件系统”在本地的缓存或 Registry 等存储后端中的数据。

Nydus 中作为这个“网络文件系统”中的“本地客户端”的工具是 Nydus Daemon *（简称 Nydusd）* 。

下图中的 Nydus Framework 中起主要作用的就是 Nydusd。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8bfd70d68f50434f952249c43ba45354~tplv-k3u1fbpfcp-zoom-1.image)

Nydusd 是一个用户态进程，它可以通过 FUSE、VirtioFS 或 EROFS 等方式将网络文件系统挂载到容器的 Rootfs 上。

下图是使用 FUSE 的情况：

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/85ca9d08fb06469284d4e8068a87fd3f~tplv-k3u1fbpfcp-watermark.image?)

### Nydus Snapshotter

Nydus 镜像格式虽然在架构上与 OCI 格式保持一致，但对数据的解析、具体的 layer 文件的 MediaType 等方面与 OCI 格式有很大区别。现有的容器运行时 *（典型的如 Containerd、Podman、CRI-O 等）* 及其配套的工具并不能直接与拉取和运行 Nydus 镜像。

例如，对于 Containerd：

在 Containerd 拉取镜像时，会根据镜像的 manifest 中的描述将所有的层文件都拉取下来。这首先就失去了 Nydus 按需加载的意义。

Containerd 在完成镜像每个层文件的拉取后，会调用 Snapshot 服务将每一层解包，以读取其中的文件。但 Nydus 镜像的 Blob layer 使用了自定义的 MediaType，Containerd 在处理时会直接报错。

Containerd 在运行容器时，会将镜像所属的各个解包后的 Snapshot 目录作为 OverlayFS 的 Lower Dir，挂载到容器的 Rootfs 上。Nydus 必须能够 hack 这一过程，将 Nydusd 提供的网络文件系统作为 OverlayFS 的 Lower Dir 挂载。

幸运的是，Containerd 在设计之初就考虑到了对多种文件系统的支持，支持用户自定义 Snapshot 插件，并在拉取和运行镜像时指定使用对应的 Snapshot 插件，以实现用户所期望的功能。Nydus 所提供的这样的 Snapshot 插件就是 Nydus Snapshotter。

**PART. 3**  

**我的工作**

**Nerdctl 支持运行 Nydus 镜像**

在开源之夏的题目发布时，当需要使用 Nerdctl 来运行 Nydus 镜像时，不能像普通的 OCI 镜像或 Docker 镜像一样，直接使用 `nerdctl run` 等来运行 *（执行 `nerdctl run` 会直接报错）* ，必须首先使用 Nydus 自己提供的工具 ctr-remote 拉取镜像，然后才能进一步使用 `nerdctl run` 运行。

通过阅读和调试 Nerdctl 的代码发现，当本地没有要运行的镜像时，Nerdctl 会执行 pull 命令从 Registry 中拉取镜像，而直接使用 `nerdctl run` 引发的报错正是在这个 pull 阶段产生的。因此，问题转化为解决 `nerdctl pull` 的报错。同时，想到 ctr-remote 其实主要就是在做 pull 镜像的功能。于是，进一步阅读 ctr-remote 的代码可以发现，ctr-remote 通过在镜像的拉取过程中，对 manifest 包含的各个 layer 添加相应的 annotation，使 Nydus Snapshotter 可以正确处理拉取的镜像。因此，只需要将 ctr-remote 中的这部分逻辑抽离出来，并添加到 `nerdctl pull` 的工作流程中即可。

**Nerdctl 支持转换 Nydus 镜像**

相比于 Docker CLI，Nerdctl 原生支持一些更多样化的命令，比如 `nerdctl image convert` 。顾名思义，该命令的作用是将一种格式的镜像转换为另一种格式。其最基础的用法是使用 `nerdctl image convert --oci <src_image_tag> <target_image_tag>` 将一个常见的 Docker v2 格式的镜像 *（也就是大家平常用的镜像格式）* 转换为一个标准的 OCI 格式的镜像。

除了 Docker v2 和 OCI，截止到开源之夏题目发布时，`nerdctl image convert` 还支持将镜像转换到 eStargz 格式。因此，“ `nerdctl image convert` 支持 Nydus” 这个题目的含义就是，拓展 `nerdctl image convert` 命令，使其支持将常见的 Docker V2 格式和 OCI 格式的镜像转换为 Nydus 格式的镜像。这个题目是本次项目最重要的一部分工作。

`nerdctl image convert` 的实现主要是借助  Containerd 本身对外开放的 API 中的 Convert 能力实现的。Containerd 对镜像转换的处理流程是，按照镜像组织的树形结构，从基础的 layer 和 config 开始，到 index 层结束，一层层进行转换，从而最终生成一个新的镜像；其中，调用者可以自定义数据层的转换逻辑，`nerdctl image convert` 已有的对 eStargz 格式 的支持就是通过这种方式实现的。

但目前类似 eStargz 格式的这种实现其实是默认转换后的镜像和转换前的镜像的各层之间一一对应，而 Nydus 镜像除了有与转换前的 OCI 镜像中的数据层一一对应的 Blob layer 之外，还有一个 Bootstrap layer。幸好 Containerd 的处理流程中，在完成了每一层的转换后，会调用一个回调函数，给调用者机会做进一步的处理。因此，可以利用 Containerd 对 manifest 层处理完的回调，在该回调中，额外生成一个 Bootstrap layer，并相应地修改 manifest 层和 config 层中的内容，从而最终构建出一个合法的 Nydus 镜像。

在开发完基本逻辑后，测试过程中发现了转换后的 Nydus 镜像文件生成后又被意外删除的现象。甚至在一步步调试时，在函数返回前，转换后的 Nydus 镜像文件依旧存在，但函数返回后文件奇迹般的消失了。

对此，我依次尝试了以下排查思路：

Nydus 镜像文件的删除是在另一个协程中进行的，因此我在当前协程的断点没有调试到删除操作。但多次调试后发现，删除动作一定会发生在函数返回前，这与协程的不可预测性不符。

Nydus 镜像文件触发了 Containerd 守护进程的某种 GC 操作。我使用 Inotify 监控镜像文件的创建和删除操作对应的进程，发现确实是 Containerd 守护进程的操作。

**但问题是，Nerdctl 执行的代码也会与 Containerd 进行 RPC 通信，这一操作是 Containerd 进程自己的内置逻辑呢，还是 Nerdctl 通知 Containerd 做的呢？不得而知。**

在花费了一周时间排查 bug 后，发现是函数返回前执行了函数体前部分的 Defer 操作触发了 Nydus 镜像文件的删除操作，而在 Defer 的函数体中没有设置断点，因此没有调试到。最终，通过分析 Defer 函数体中的逻辑，问题得以解决。

总结下来，还是具体的编程经验不足，没有在一开始就想到所有可能得方面，导致绕了很大的弯路。

**小结**

上述两项工作的 PR 都已合入了 Nerdctl 的主分支 *（>=0.22）* ，基本实现了 Nerdctl 原生支持 Nydus 镜像加速的能力。
  
大家可以移步文档作进一步了解： *[https://github.com/containerd/nerdctl/blob/master/docs/nydus.md](https://github.com/containerd/nerdctl/blob/master/docs/nydus.md)*。

## PART. 4 项目总结与展望

Containerd 是当前最流行的容器运行时之一，Nerdctl 作为 Containerd 的社区中的核心项目提供了完善的使用体验。它们都是容器领域中非常重要的基础项目。

通过本次项目的开发工作，我逐渐了解了 OCI 镜像的组成部分，每部分的作用和基本格式；知道了以及 Nydus 镜像和 OCI 镜像之间的差异，并且理解了 Nydus镜像中 Blob layer 和 Bootstrap layer 之间的区别；能够通过检查本地镜像相关文件排查一些简单的程序 bug。

在项目进行的过程中，我阅读了 Nerdctl 和 Containerd 的代码，学到了一些实用的编程技巧，并最终向 Nerdctl 提交并成功合入了两个 PR。在向 Nerdctl 提交和修改 PR 的过程中，Nerdctl 的 Maintainer 们对待代码的严谨态度让我大受裨益———他们甚至会 review `go.sum` 每一行改动！

不仅如此，这些的开源工作经历为我揭开了“顶级开源项目的神秘的面纱”，增强了我的信心，让我更有自信和兴趣进一步参与到云原生项目的相关工作中。

本次项目的完成，将使得用户能非常方便地使用 Nerdctl 和 Containerd 来构造、拉取、运行 Nydus 镜像，这无疑会对 Nydus 镜像格式的普及和进一步发展起到非常好的推动作用。

**| 致谢 |**

非常感谢项目组织老师赵新、本题目 Mentor 严松老师和项目指导助理姚胤楠同学在本次项目进行过程指导和帮助，特别是严松老师细致入微的解答和指导，每次我的一个看起来很简单甚至很愚蠢的问题都能得到严松老师详细的解答，并且言辞中经常包含着肯定和鼓励，让人如沐春风。  

在后续的学习和工作中，我希望能持续参与到 Nydus 相关的开发工作中，继续为社区贡献 issue 和代码。

**了解更多...**

**Nydus Star 一下✨：**  

*[https://github.com/dragonflyoss/image-service](https://github.com/dragonflyoss/image-service)*

**更多福利...**

[**《SOFAStack 社区 2022 年报》**](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247520052&idx=1&sn=add38b62aad83c73d14d3acca6090e45&chksm=faa360eecdd4e9f80f448eebecb4c7a085c3750f36ac298568ddf687acf76438d7cc2780090b&scene=21#wechat_redirect)已发出

扫描下方二维码填写问卷

有机会获得 SOFAStack **新年限定周边** 哦！

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bdfb00ea22ff4325b82db1794fbab97e~tplv-k3u1fbpfcp-zoom-1.image)

**本周推荐阅读**

[Nydus 镜像扫描加速](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247520024&idx=1&sn=e87a70a49cabde775b3c6651db652404&chksm=faa360c2cdd4e9d46b19c2cc037e7379ff40dc7c1b2fef98de37fc524f8931d9704046b36b4c&scene=21)

[Nydus 镜像加速插件迁入 Containerd 旗下](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247504035&idx=1&sn=320b77bf5f3c6cf0da309f7527b98e64&chksm=faa33f79cdd4b66f184d273a2d7460c41320711eab47af849e386c359e71eeebc6c7f21c1e0f&scene=21)

[Nydus | 容器镜像基础](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247517164&idx=1&sn=28f50763db2883839908057125a7b497&chksm=faa36c36cdd4e52050796d00f2f5bf357471692c2da8727cc44ae47856cd925e599b6e954314&scene=21)

[Dragonfly 和 Nydus Mirror 模式集成实践](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247518517&idx=1&sn=74f6426f0b280cbd4aafd2d37eaaec04&chksm=faa366efcdd4eff9b50d52dad855ab593034b4af94896c2386705a316f063a1825d1729da36a&scene=21)
