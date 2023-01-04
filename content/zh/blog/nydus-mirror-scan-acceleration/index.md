---
title: "Nydus 镜像扫描加速"
authorlink: "https://github.com/sofastack"
description: "Nydus 镜像扫描加速"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2022-12-27T15:00:00+08:00
cover: "https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*Nk8-RoLjjy4AAAAAAAAAAAAADrGAAQ/original"
---
![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/111d6f90271f41be85591102d86a8417~tplv-k3u1fbpfcp-zoom-1.image)  

文｜余硕

上海交通大学22届毕业生阿里云开发工程师

*从事云原生底层系统的开发和探索工作。*  

本文  **6369** 字 阅读 **16** 分钟

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/39459098704044578d070dde76b20a5c~tplv-k3u1fbpfcp-zoom-1.image)

> GitLink 编程夏令营是在 CCF 中国计算机学会指导下，由 CCF 开源发展委员会（CCF ODC）举办的面向全国高校学生的暑期编程活动。  

> 这是今年的夏令营活动中，余硕同学参加 Nydus 开源项目的总结，主要介绍了 Nydus 为支持镜像扫描与修复所做的研究与相关工作。

## PART. 1 课题背景  

### Nydus 开源镜像加速框架

Nydus 是 CNCF 孵化项目 Dragonfly 的子项目，它提供了容器镜像，代码包按需加载的能力。Nydus 应用时无需等待全部数据下载完成便可开始服务。

Nydus 在生产环境中已经支撑了每日百万级别的加速镜像容器创建。它在容器启动性能、镜像空间占用、网络带宽效率、端到端数据一致性等方面相比 OCI v1 格式有着巨大优势，并可扩展至其它数据分发场景，比如 NPM 包懒加载等。

目前 Nydus 由蚂蚁集团、阿里云、字节跳动联合开发。Containerd、Podman 社区已经接受了 Nydus 运行时作为其社区子项目，它也是 Kata Containers 以及 Linux v5.19 内核态原生支持的镜像加速方案。

有关 Nydus 镜像加速开源项目的详细介绍，可以参考：[Nydus——下一代容器镜像的探索实践](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247510940&idx=1&sn=b545e0836a6182abddd13a05b2f90ba9&chksm=faa34446cdd4cd50a461f071cdc4d871bd6eeef2318a2ec73968c117b41740a56a296c726aee&scene=21#wechat_redirect)。

### 项目描述

为 Nydus 镜像增加一个扫描和修复的命令行工具，包含以下功能：

- 提供一个 Nydus 镜像 url 和需要替换的文件列表；

- 使用工具拉取镜像 Bootstrap；

- 找到镜像中对应的文件并替换；

- 打包成新的镜像并上传回 Registry。

概括来说，原有项目目标是为 Nydus 镜像实现一个扫描和修复的命令行工具，其中这些功能是这个工具或者工具组的实现流程。

但此项目具有一定的实验性，其核心是为 Nydus 格式的镜像提供扫描和修复的功能或者指引。如果存在更好的方式，项目最终不一定要按照原有项目描述去实现。因此在接下来的课题完成过程中，我们首先对已有镜像扫描/修复的工具与服务进行了调研，来确定此课题方案的最终形态。

### 镜像扫描工具及服务

#### 扫描和修复

镜像扫描和修复可以被拆解为两个过程。扫描不更改原有的镜像内容，只需要寻找扫描目标是否存在某种缺陷；镜像修复则需要根据缺陷改动镜像，包括但不限于镜像内容，镜像层级组织等。我们调研发现，当前主流开源镜像扫描引擎包括云厂商镜像安全服务都只涉及镜像扫描的功能， 不会主动添加镜像修复的功能。

我们分析主要的原因有：

- 直接进行镜像修复可能引入新的安全问题；  

- 镜像扫描的内容存在不同种类，很可能需要为不同种类的镜像安全问题设计不同的修复方式；

- 镜像修复功能可以通过重新打包镜像替代。

所以，镜像安全服务暂时只是提供扫描结果的安全报告，具体的修复操作由用户自行决定。我们也准备沿用这样的思路：在本课题中，为镜像实现安全扫描的功能，并提供报告作为用户镜像修复的参考依据。  

> 我们也探索讨论了镜像修复的支持，或者 Nydus 特性在镜像修复场景下的增强，比如镜像内包替换后的去重与重组等，或许这些可以是未来 Nydus 中增加的功能特性。

### 镜像扫描介绍

#### 镜像扫描的原因与内容

容器镜像是当前容器/软件分发的基础，里面包含了容器隔离环境以及软件执行环境的相关内容。因此保障其安全性变得十分重要。镜像扫描即是要扫描镜像中的所有内容，及时发现可能包含的安全漏洞或者隐私泄露。

综合来看，镜像扫描需要关注镜像的安全性与健壮性，扫描的内容主要分为三类：

**1. 安全漏洞。** 包括系统软件包和应用软件库中可能存在的安全漏洞。可以通过比对镜像中这些库/软件包的来源、版本等与 CVE 数据库中报告的漏洞的包的来源、版本来定位可能存在的安全漏洞。

**2. 配置。** 包括镜像运行的环境配置和镜像中相关内容组合可能带来的问题。帮助尽早定位配置错误以及配置错误可能带来的安全风险。

**3. 隐私。** 需要扫描的是用户指定的一些隐私信息。比如用户不小心将密钥等信息存入镜像。如果在扫描配置中进行指定，扫描过程可能发现这些隐私信息，避免隐私泄露以及可能带来的安全问题。

#### 扫描引擎

常见的扫描引擎有 Trivy、Synk 等。Docker 官方使用的是 Synk，但它比较商业化；Trivy 是 CNCF 的项目，开放性较好。

#### 镜像扫描的使用方式

在我们的调研中，镜像扫描主要应用方式有三种：

**1. 基础使用。** 镜像扫描的过程可以直接通过集成了镜像扫描引擎的容器运行时或者镜像扫描引擎命令行触发。比如运行 `$ docker scan image-url` ，可以扫描镜像，并输出相应的报告。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/830327a301384e10be6454a2a51b597b~tplv-k3u1fbpfcp-zoom-1.image)

source：*[https://docs.docker.com/engine/scan/](https://docs.docker.com/engine/scan/)*

**2. 流程集成。** 镜像扫描的过程可以集成到镜像中心或者 CI/CD 流程中。比如将镜像扫描集成到数据中心，在每次镜像上传到数据中心时触发镜像扫描，可以保证从数据中心下载的镜像总是经过安全扫描的；集成在 CI/CD 流程中，设置触发条件，可以保证镜像生成，镜像部署等过程所使用的镜像的安全性。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5283c9c444404b5eac940f2122df32d3~tplv-k3u1fbpfcp-zoom-1.image)

source: *[https://www.containiq.com/post/container-image-scanning](https://www.containiq.com/post/container-image-scanning)*

**3. 扫描服务。** 云厂商提供了镜像安全的服务。它们背后可能是基于前两种使用方式实现，但是还可以有很多种功能的增强。用户想使用镜像扫描的功能也可以直接购买类似的安全服务，并进行灵活的配置。

source: *[https://cloud.google.com/container-analysis/docs/on-demand-scanning-howto](https://cloud.google.com/container-analysis/docs/on-demand-scanning-howto)*

## PART. 2 课题解决思路

### 基本思路

课题首先要解决的基本思路是，如项目描述一般为 Nydus 实现一个专属的镜像扫描工具；还是复用已有的镜像扫描引擎，在 Nydus 侧实现对接支持，从而完成 Nydus 镜像扫描的功能实现。

我们最终选择了结合已有镜像扫描引擎的实现思路。尽管为 Nydus 实现一个专属的镜像扫描工具可以更好的利用 Nydus 的特性，但是从镜像功能生态上考虑，这并不是一个很好的方式。复用或者集成到现有的镜像扫描工具，一方面可以直接使用已实现的镜像扫描引擎中全面的内容扫描能力；另一方面，与上层镜像安全服务的对接也不用再重写相关接口。这样也可以减少一些功能定制，减少用户使用的负担。因此此课题选择了后一种实现的基本思路。

### 扫描思路：FileSystem vs Image

#### Trivy 扫描功能实现的框架

**1. 控制路径。**

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cc90b074416d4de69041a6eecd71bdb2~tplv-k3u1fbpfcp-zoom-1.image)

Trivy 在镜像扫描上由以下路径控制，每触发一次命令，会由一个 Scanner 控制。其中关键的是 `artifact` 和 `driver` 。扫描引擎一般可以支持多种格式的扫描，比如 OCI v1 镜像或者镜像 Rootfs，同时一般也支持本地或者远端存储信息等。这些一般可由 `ScannerConfig` 配置或者自动解析。

`atifact` 存储着镜像 *(包括文件系统)* 元信息，如果已经扫描过其中的内容，还可以存储部分解析后的信息。另外，load 到本地的 CVE 数据等也可通过 Artifact 获取。Driver 里的 Scan 方法表示的则是应用在特定扫描过程中的检查方法。

**2. 关键动作。**

- local.Scanner

- Applier

Trivy 中 Local Scanner 是前文提到的本地进行扫描的控制结构。可以看出 Scanner 里定义的行为是 Apply Layer。也就是将对镜像逐层进行扫描。Applier 保存了 Artifact 信息，是联系具体扫描方法和存储信息的结构体。

**3. 解析镜像。**

上述两个过程理解了总体 Scan 的过程控制，以及具体针对镜像的扫描方法。与镜像相关的还有一个关键过程是如何针对性的解析扫描镜像信息。这一过程实现在 Artifact 中。

- Artifact

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/54ff55979bd2472f99ea8ab735baa710~tplv-k3u1fbpfcp-zoom-1.image)

- Walker-Analyzer

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4f25346ba7394c9691f2be908b59a1e7~tplv-k3u1fbpfcp-zoom-1.image)

Artifact 中有镜像元信息，还有保存解析镜像信息的 Cache 等。主要要考虑的是当前 Trivy 支持的不同种类镜像而进行不同的设置。

另一关键的是 Analyzer。Analyzer 对应的是镜像分层的操作。对不同种类的镜像操作不同。比如对于 OCI v1 的镜像，可能就是每层镜像拉取的完整数据流进行分析。对于 FileSystem，就是层次遍历文件树。

#### 方案选择

了解了 Trivy 的实现后，我们发现直接把 Nydus 打包成 OCI v1 类似的镜像去扫描并不合适。Nydus 镜像内容中层次组织已经发生了变化，也具有按需加载的特点。若直接拉取，不一定保证拉取信息的完备，想要完备支持镜像的拉取也会丢失 Nydus 的特性。

因此我们最终选择在 FS Artifact 方式下优先拓展 Nydus 的镜像扫描能力。

相关的指令是：

```Bash
$trivy image nydus-image-url  ✗
$trivy fs /path/to/nydus_imgae_mountpoint  ✓
```

这样做的好处一是可以利用 Nydus 按需加载的特性。我们发现对于很多软件包的扫描并不需要完整的文件内容的下载，很多时候一些局部信息甚至元信息即可判断。这一特点可以利用上 Nydus 的按需加载，从而加快整个镜像扫描的过程。二是特殊格式的镜像都会有挂载文件系统这一操作。这样的方式可以推广到更多的特殊格式镜像。

本课题最终是以工具形式为 Nydus 集成了加速镜像文件系统挂载的能力，这能够适配主流的镜像扫描框架，未来我们可以考虑为社区镜像扫描方案做更深度的集成，比如 Trivy、Clair、Anchore Engine 等，支持直接指定 Nydus 镜像 Reference 做扫描，优化端到端的用户体验。

#### 方案实现

在 Nydus 侧提供镜像扫描的支持，简单指令过程为：

```Bash
$ nydusify view localhost:5000/ubuntu:latest-nydus
/path/to/root_path
[比起容器简单，直接拿到文件树]

$ trivy fs /path/to/rootpath
```

Nydusify 是 Nydus 提供的镜像转换，校验与镜像文件系统挂载工具，使用方式可以参考：*[https://github.com/dragonflyoss/image-service/blob/master/docs/nydusify.md](https://github.com/dragonflyoss/image-service/blob/master/docs/nydusify.md)*。

上面实现在 Nydusify 中的核心功能由 `FileSystemViewer` 结构体控制：

此结构体需要保存的成员变量有此过程的一些输入信息和配置信息。`SourceParser` 用于解析镜像 url。`MountPath` 是可以指定的文件系统 Mount 的地址。`NydusdConfig` 是 Mount 过程 Nydus Daemon 的配置。`image-url` 是必须提供的输入信息。`View()` 是调用方法。

当 `nydusify view` 被调用时，主要将发生三个步骤：

1. 解析 `image-url` ；

2. 根据解析信息，拉取文件系统元数据 Bootstrap；

3. 根据 Bootstrap，Nydusd Mount 文件系统到指定路径。

之后 `trivy fs` 被调用时，可能发生：

1. 层次遍历挂载的文件系统；

2. 打开镜像挂载点中某个文件时，会触发 FUSE 请求到 Nydus Daemon *（Nydusd）* ，Nydusd 会从远端镜像中心按需拉取文件的 Chunk 数据，以提供给扫描引擎分析文件内容。

## PART. 3 课题展示

### Demo 展示

我们实现了这一功能，如 demo 中演示：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f194e88868e84c33962f6a8ce589cc8b~tplv-k3u1fbpfcp-zoom-1.image)

### 性能测试

我们在 Ubuntu、Wordpress、Tensorflow 等镜像上进行了测试。  

测试结果如下：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6b29b6bdf4c04fcebd9fa648b8e11e89~tplv-k3u1fbpfcp-zoom-1.image)

以扫描时延作为衡量标准，可以看出 Nydus 的安全扫描时间要显著少于基本 OCI v1 镜像。这其中优化的幅度与镜像文件系统复杂程度，测试网络环境等因素有关。  

我们还从实际镜像扫描场景了解到，很多时候出现安全问题时，例如一些 0day 漏洞，我们需要对大批量镜像进行特定的少量文件元数据或数据的侦测。这种情况就更能体现出 Nydus 镜像懒加载的优势，安全扫描速度能够大幅度提高。

当然，Trivy 对 OCI v1 镜像的扫描优化会影响对比结果。我们 Trivy Image 多次对同一镜像进行扫描，可得到下面的结果：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8da1082f09eb4d26a6c46e8e4942c4e8~tplv-k3u1fbpfcp-zoom-1.image)

可以看出，多次扫描之后花费的时延下降。如之前提到，扫描信息匹配会存到 local Cache 中。这是会根据 Blob ID 做为 key 来存储的。因此 Trivy 在扫描同一镜像时可以直接去查询 Cache 而不必重复拉取镜像形成优化。我们在未来也想集成类似的优化，这也是之后我们也想在扫描引擎社区推动更好的支持的原因。

## PART. 4 课题拓展

### 描述

除了扫描镜像内容的安全性，Nydus 本身提供了指令工具 `nydus-image inspect` 对 Nydus 镜像进行检查。 `nydus-image inspect` 指令通过检索 Nydus 镜像中包含的文件系统元数据信息，可以查看 Nydus 镜像的组织情况。进一步可以判断 Nydus 镜像是否损坏等。

随着 Nydus 的发展，它支持文件系统 Layout 也从 v5 扩展到 v6。RAFS v6 可以兼容 EROFS，由此获得性能上的进一步提升。 `nydus-image inspect` 在 RAFS v5 时已经设计，扩展到 RAFS v6 之后，一些子命令为了兼容进行了扩展。但是这样的扩展是为 v5/v6 分开写成的，也就是需要执行子命令时还需要对文件系统格式进行一次判断。

此外，还有一些子命令没有做到兼容性扩展。这样的不完全支持存在一定的遗留问题，没有做到功能的完备和统一。这样的代码组织也损失了易读性，不利于后续的维护，不同 RAFS 格式相关功能的迭代升级中也比较容易产生问题。

事实上，Nydus 已经为这两种格式的文件系统元数据实现了统一的 API 接口。

比如对 `RafsSuperInodes`, `RafsSuperBlock` 等结构有统一的方法进行信息的获取，对不同的底层实现进行了屏蔽。因此在此基础之上，有必要对 `nydus-image inspect` 指令的相关功能进行一次重构。

### 实现

原有的架构中，存在一个 `Executor` 结构根据子命令判断调用哪一个具体的方法。比如 `Executor` 收到子命令 stats 时会调用 cmd_stats 函数，执行并完成结果的输出显示。

我们需要重构的是针对每一条子命令所调用的方法，上层的调用逻辑保持不变，具体而言子命令方法有：

- cmd_stats  

- cmd_list_dir

- cmd_change_dir

- cmd_stat_file

- cmd_list_blobs

- cmd_list_prefetch

- cmd_show_chunk

- cmd_check_inode

这里不再对每一条子命令调用方法的修改进行详细描述。大概做法是使用 RAFS mod 中统一的 API 实现所有原本的功能逻辑。

### 测试

我们实现了两种测试。两种测试的目的都是为了保持重构前后功能实现的一致。

**测试一：** 交互形式比对输出结果。

这是一种功能测试。针对每条指令每种可能出现的情况，选取代表性镜像进行测试与比对。

**测试二：** 集成冒烟测试。

这是一项冒烟测试。`nydus-image inspect` 命令还有 `request mode` 可以将一条子命令的输出序列化成 json 格式的结果。我们将原有代码的结果序列化成 json 格式作为参考输出，再将重构后代码的输出与之一一比对。选取的镜像为 Nydus 仓库中用于冒烟测试的镜像。这一部分的测试也集成在 Nydus 仓库中，在以后的 CI 里也可以保证这项功能的正确性没被破坏。

### 成果

**Prompt Mode**

Stats

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/88a6c67e08a342bfaff4cfd89c9553b8~tplv-k3u1fbpfcp-watermark.image?)

ls

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/61f19bd77be24dc9bda260ea7d524488~tplv-k3u1fbpfcp-zoom-1.image)

Cd

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/336d6bac7175404fba7d57850b64507a~tplv-k3u1fbpfcp-zoom-1.image)

Stat File

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5b27653aeb1b40a1b13381c9c1b5b172~tplv-k3u1fbpfcp-zoom-1.image)

Blobs

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/72ebe530f3324e7c8ef2eb68a6a243a9~tplv-k3u1fbpfcp-zoom-1.image)

Prefetch

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8083fb6e88104b7eac75b94a51268172~tplv-k3u1fbpfcp-zoom-1.image)

Chunk Offset

![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d0e03a3286c34df39e9ab4ce2d350f4d~tplv-k3u1fbpfcp-watermark.image?)

Icheck Index

![image.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/974b051ad60b4b19bc1dbb7da83da5ba~tplv-k3u1fbpfcp-watermark.image?)

**Request Mode**

Stats
  
![image.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6874a00e1e1e4b4daf9e7caa599e947f~tplv-k3u1fbpfcp-watermark.image?)

Prefetch

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ea952c81acf7470fb2944e8f2478227f~tplv-k3u1fbpfcp-zoom-1.image)

Blobs

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5d8ae7f8338c4f41acc55913ce395187~tplv-k3u1fbpfcp-zoom-1.image)  

## PART. 5 收益与展望

### 收益

我非常荣幸能参加这次项目的开发，也要向项目组织老师赵新、项目指导助理姚胤楠、严松老师以及 Nydus 社区表示衷心的感谢。

通过这次项目的开发，我收获了许多：知识上，我复习并更深入了解了文件系统，学习了容器镜像格式的组织，还首次尝试了 Go 语言开发，也开始了解软件测试；技能上，我锻炼了协调时间，开放讨论，问题定位的能力。

更重要的是，我认为参与这次项目增加了我对容器场景应用的见识，也提升完整解决方案与系统设计的能力。当然，可能最大的收益是收获了一次快乐的体验！体会了开源合作的快乐，也体会到了开源价值产生的快乐。

### 展望

此次项目主要是为 Nydus 添加了镜像扫描功能的支持，另外重构了 Nydus 的 Inspect 分析工具。如前文所说，后续还要继续探索 Nydus 镜像扫描集成到扫描引擎的方式,镜像扫描和修复的优化也值得探索。关于 Nydus 镜像格式细节，用户态文件系统，EROFS 等，我还有很多需要学习。

希望能一直参与社区，不断丰富自己容器存储方面的知识，同时也能为社区做出更大的贡献。

**了解更多...**

**Nydus Star 一下✨：**  

*[https://github.com/dragonflyoss/image-service](https://github.com/dragonflyoss/image-service)*

**本周推荐阅读**

[Nydus —— 下一代容器镜像的探索实践](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247510940&idx=1&sn=b545e0836a6182abddd13a05b2f90ba9&chksm=faa34446cdd4cd50a461f071cdc4d871bd6eeef2318a2ec73968c117b41740a56a296c726aee&scene=21)

[Nydus 镜像加速插件迁入 Containerd 旗下](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247504035&idx=1&sn=320b77bf5f3c6cf0da309f7527b98e64&chksm=faa33f79cdd4b66f184d273a2d7460c41320711eab47af849e386c359e71eeebc6c7f21c1e0f&scene=21)

[Nydus | 容器镜像基础](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247517164&idx=1&sn=28f50763db2883839908057125a7b497&chksm=faa36c36cdd4e52050796d00f2f5bf357471692c2da8727cc44ae47856cd925e599b6e954314&scene=21)

[Dragonfly 和 Nydus Mirror 模式集成实践](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247518517&idx=1&sn=74f6426f0b280cbd4aafd2d37eaaec04&chksm=faa366efcdd4eff9b50d52dad855ab593034b4af94896c2386705a316f063a1825d1729da36a&scene=21)
