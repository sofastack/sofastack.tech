---
title: "Nydus 加速镜像一致性校验增强"
authorlink: "https://github.com/sofastack"
description: "Nydus 加速镜像一致性校验增强"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2023-01-31T15:00:00+08:00
cover: "https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*mKvPQLAbptIAAAAAAAAAAAAADrGAAQ/original"
---

导言：

>GitLink 编程夏令营是在 CCF 中国计算机学会指导下，由 CCF 开源发展委员会（CCF ODC）举办的面向全国高校学生的暑期编程活动。这是去年（2022）的夏令营活动中，王瑞同学参加 Nydus 开源项目的总结，主要介绍了为 Nydus 支持镜像与文件系统一致性校验所做的相关工作。

## Nydus 简介 

Nydus 是 CNCF 孵化项目 Dragonfly 的子项目，它提供了容器镜像，代码包，数据分析按需加载的能力，无需等待整个数据下载完成便可开始服务。 

Nydus 在生产环境已经支撑了每日百万级别的加速镜像容器创建，在启动性能，镜像空间优化，网络带宽效率，端到端数据一致性等方面相比 OCIv1 格式有着巨大优势，并可扩展至例如 NPM 包懒加载等数据分发场景。 

目前 Nydus 由蚂蚁集团，阿里云，字节跳动联合开发，Containerd，Podman 社区接受了 Nydus 运行时作为其社区子项目，也是 KataContainers 以及 Linux v5.19 内核态原生支持的镜像加速方案。 

## Nydus 架构及原理 

OCI 容器镜像是当前容器镜像的实现标准。它采用了分层的设计，每个镜像可包含多个镜像层。新层包含的是在旧层的基础上，新增加或者修改的文件或者被删除的文件。这种设计方式比较简单，不过也有着一定的缺陷。如需要镜像层全部堆叠后才能看到整个文件系统的视图，但不是所有数据都会被读取;同时可能已经删除或者被修改旧层中的文件，但是仍需要完整地下载和解压旧层;文件元数据修改导致整个镜像层被重新存储等。 Nydus 兼容目前的 OCI 生态，旨在通过细粒度的数据分割、去重和按需加载机制加速容器 的启动和分发，同时降低资源的消耗。 

Nydus 的整体架构如下图所示。它可以通过 FUSE 给 runc 容器提供运行时的按需加载能力，也可以通过 virtiofs 承载 FUSE 协议，给 Kata Containers 等基于 VM 的容器运行时提供按需加载的能力。它可以从容器 Registry，OSS，NAS，Dragonfly supernode 等多个镜像源拉取镜像，同时内部会有本地的缓存加速容器的创建。 

![img](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/198629/1670840536290-09923ed1-72e2-421e-bd33-517b89fc1dff.png)

![img](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/198629/1670840550559-8b105a75-bb15-47ad-a847-5baa7b60c785.png)		

在用户空间文件系统，Nydus 采用了数据和元数据分离的设计思想，元数据的修改不会导致整个镜像层的更新。原先的镜像层只存储文件的数据部分，同时数据被分块存储。拉取镜像是不需要拉取整层，只需要拉取所需文件对应的数据块即可。这也使得层与层之间，镜像与镜像之间共享数据块更加容易。上图展示了 Nydus 数据和元数据的存储格式。其中元数据以 merkle tree 的形式存储在 bootstrap 中，包含了容器启动所需要的信息。数据以 1MB 分块存储，不同镜像可以共享同一数据块。 

## Nydus 镜像校验意义及流程 

Nydus 镜像在构建完成后，由于网络、磁盘等故障或者镜像被恶意修改，无法保证容器启动前镜像是合法的，所以需要对镜像的格式进行校验。当前的校验使用 nydusify 工具。主要分为三个部分:

1. 对 Nydus 镜像的 bootstrap 进行校验，会通过 BootstrapRule 调用 nydus-image 二进制文件。nydus-image 首先检查 bootstrap 的 SuperBlock 格式是否正确，然后会从根结点开始按照文件系统层级结构检查文件或者目录的 inode 是否合法或被修改。 

2. 对镜像的 manifest 进行校验，会通过 ManifestRule 检验 Nydus 的 manifest 是否合法，ImageConfig 是否与原始 OCI 镜像一致等。

3. 对镜像进行文件系统校验，会通过 FilesystemRule 分别挂载原始 OCI 镜像和 Nydus 镜像，然后进行校验。对于原始镜像，会使用 docker pull 拉取镜像，然后指定 lowerdir 和 upperdir，通过 OverlayFS 挂载 Rootfs；对于 Nydus 镜像，会使用 Nydusd 挂载。挂载完成后，会分别遍历两个目录，比较元数据和数据是否一致。 

目前 Nydus 的校验方式仍有一定的限制，如元数据检查不完全，需要 docker 拉取镜像等。该项目旨在增强 nydusify 和 nydus-image 的校验功能，使校验更加易用和全面。 

## 文件系统校验方案 

该项目当前分为以下三部分:

1. 当前 nydusify check 在应用 FilesystemRule 进行校验时，对于文件元数据只检查文件路径、大小、模式和权限位以及 xattrs 是否和原始镜像一致，同时对文件数据用 blake3 计算得到哈希值并进行比较。但是由于校验内容不完整，可能会出现元数据不一致校验通过的情况。故对该结构体添加 dev、rdev、symlink、project id、uid、gid、nlink、ctime 等字段，实现对文件元数据更全面的检查。 

![img](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/198629/1670840639353-05ea7cf7-0824-492c-aeec-4efe7f729e0b.png)

2. 当前 nydusify check 在应用 FilesystemRule 进行校验时，需要手动指定 source 和 Backend Type, Backend Config 才能成功应用 Nydusd 挂载并进行文件系统校验，在校验数据时，也会再次检查 Backend Type 是否指定。在大多数情况下，Backend Type 为 Registry，Backend Config 可以通过查看 Registry 的 config 文件获取相关信息，如 http.addr 字段获取地址，auth 字段获取认证信息等获取。因而用户在很多情况下并不需要手动输入上述参数。该任务旨在简化该命令，实现 Backend Type，Backend Config 的自动推断，使得用户更方便地进行校验。 

![img](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/198629/1670840653227-0d643367-a8bc-4ef2-9ba5-11c192a8ab29.png)

(3) 当前 nydusify check 在应用 FilesystemRule 进行校验时，需要用户安装 docker，因为要使用 docker pull 命令拉取镜像。在没有 docker 的环境下，无法完成校验。可以修改该部分代码，手动下载、解压镜像，并使用 OverlayFS 挂载，从而去除对 docker 的依赖。 

![img](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/198629/1670840665933-f5664cd2-6d94-48db-b256-4dc30e501a8f.png)

## 文件系统校验实现细节 

### 增加校验字段 

该部分的实现较为简单。首先在原 Node 结构体增加 rdev, symlink, uid, gid, mtime 等字段。 

![img](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/198629/1670840689102-eef88ce8-755b-47cb-b0e2-3aee9d26737b.png)

然后在遍历文件系统时，使用 Readlink 获取文件的软链接，通过 Lstat 系统调用获取 文件更详细的元数据信息（rdev, uid, gid, mtime 等），从而在进行比较时增加对上述字段的校验。值得注意的是 dev 不同是正常的，nlink 由于 OverlayFS 的问题无法进行校验。此外，还需要修改异常错误信息，从而遇到不一致时能够打印完整的文件元数据信息。 

![img](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/198629/1670840703230-481d6b39-b8b1-4498-a904-1f9c2f552cba.png)

### 简化校验参数 

该部分需要实现 Backend Type 和 Backend Config 的自动推断，即如果镜像存储在 registry 中，用户无需指定上述两个参数即可完成校验。 

![img](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/198629/1670840716350-3f775509-11e6-44d0-aaf8-8a7d6c0b7733.png)

首先，我们需要添加上述结构体，即镜像源为 Registry 时的 Backend Config。对于 FilesystemRule 结构体，还需添加 Target 和 TargetInsecure 字段，用于填充 Backend Config。 

![img](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/198629/1670840730422-82a976ff-19d3-4670-82db-5b3d167dc8cc.png)

在挂载 Nydus 镜像时，我们需要正确填充 Nydusd 的 config，其中便包含 Backend Config 和 Backend Type。因此我们对用户传入的参数进行判断，如果用户没有传入 Backend Type，那么我们默认镜像源为 registry，如果没有传入 Backend Config，那么我们通过 target 提取 host 和 repo，然后读取 docker 的 config 获取 auth 相关的信息，最后生成 Backend Config。 

除此之外，由于我们目前的测试代码中不涉及用户鉴权，所以额外添加了 testBasicAuth 测试样例，用于检验在用户不指定 Backend Config 时，我们是否能够正确提供 鉴权信息。在测试样例中，我们模拟生成了用户名、密码和 docker config，并正确设置了环境变量 。 启动 docker 时 ，额外指定REGISTRY_AUTH_HTPASSWD_PATH ， REGISTRY_AUTH 等用于鉴权。 

### 实现无需 docker 拉取镜像 

当前拉取原始镜像时，我们需要事先安装 docker，然后通过 docker pull 指令拉取。我们可以手动的拉取每个镜像层，然后解压、挂载，从而去除对 docker 的依赖。 

首先我们需要在 FilesystemRule 结构体中添加 SourceParsed, SourcePath, SourceRemote 等字段，指定原始镜像的相关信息和存储路径。在拉取原始镜像时，我们通过 SourceParsed 获取到镜像层的信息，然后多线程下载每个镜像层并解压。 

![img](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/198629/1670840765047-5815cbcc-5479-4336-a7a1-570263bb4838.png)

因为镜像的存储路径是事先确定的，同时我们也可以获取到每个镜像层的信息，所以在挂载镜像时，我们不需要运行 docker inspect 命令获取镜像的分层信息，可以直接拼接每一层的路径，使用 OverlayFS 进行挂载。 

![img](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/198629/1670840786171-8cff84c7-7cea-48d8-a6ab-4c6acdff2a31.png)

后续发现 OverlayFS 挂载单层镜像时存在一定的问题，因而上述代码进行了一定程度 的修改和重构。

## 收获与展望 

这个项目的代码量不是很大，但是我从中学习到了很多。首先通过阅读代码和跟踪调试，我了解了 Nydus 的设计思想和镜像的生成及校验的流程。在完成项目的过程中，我对 go 语言的使用更加熟练，对于容器镜像的分层存储格式及拉取、挂载的流程有了更加 细化的认识。通过解决测试过程中遇到的各种问题，我发现问题、定位问题、解决问题的能力也有了一定的提升。希望之后有机会可以继续参与到 Nydus 项目之中，为开源贡献力量。

## 作者有话说 

哈喽大家好，我是王瑞，本科毕业于北京邮电大学计算机科学与技术专业，现就读于多伦多大学，从事日志压缩相关研究。本科时曾在字节跳动公司实习，参与过自动化运维平台、存储系统内存管理相关的开发工作。也曾在 VMware 公司实习，为开源数据库 GreenPlum 贡献过代码。因为对云原生比较感兴趣，所以非常高兴可以参与到 Nydus 这个项目。感谢严松老师在过程中提供的指导和帮助。 

**Nydus Star 一下✨：**

*[github.com/dragonflyos…](https://link.juejin.cn/?target=https%3A%2F%2Fgithub.com%2Fdragonflyoss%2Fimage-service "https://github.com/dragonflyoss/image-service")*

**本周推荐阅读**

[Nydus 镜像扫描加速](https://link.juejin.cn/?target=http%3A%2F%2Fmp.weixin.qq.com%2Fs%3F__biz%3DMzUzMzU5Mjc1Nw%3D%3D%26mid%3D2247520024%26idx%3D1%26sn%3De87a70a49cabde775b3c6651db652404%26chksm%3Dfaa360c2cdd4e9d46b19c2cc037e7379ff40dc7c1b2fef98de37fc524f8931d9704046b36b4c%26scene%3D21%23wechat_redirect "http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247520024&idx=1&sn=e87a70a49cabde775b3c6651db652404&chksm=faa360c2cdd4e9d46b19c2cc037e7379ff40dc7c1b2fef98de37fc524f8931d9704046b36b4c&scene=21)

[Nydus 镜像加速插件迁入 Containerd 旗下](https://link.juejin.cn/?target=http%3A%2F%2Fmp.weixin.qq.com%2Fs%3F__biz%3DMzUzMzU5Mjc1Nw%3D%3D%26mid%3D2247504035%26idx%3D1%26sn%3D320b77bf5f3c6cf0da309f7527b98e64%26chksm%3Dfaa33f79cdd4b66f184d273a2d7460c41320711eab47af849e386c359e71eeebc6c7f21c1e0f%26scene%3D21%23wechat_redirect "http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247504035&idx=1&sn=320b77bf5f3c6cf0da309f7527b98e64&chksm=faa33f79cdd4b66f184d273a2d7460c41320711eab47af849e386c359e71eeebc6c7f21c1e0f&scene=21)

[Nydus | 容器镜像基础](https://link.juejin.cn/?target=http%3A%2F%2Fmp.weixin.qq.com%2Fs%3F__biz%3DMzUzMzU5Mjc1Nw%3D%3D%26mid%3D2247517164%26idx%3D1%26sn%3D28f50763db2883839908057125a7b497%26chksm%3Dfaa36c36cdd4e52050796d00f2f5bf357471692c2da8727cc44ae47856cd925e599b6e954314%26scene%3D21%23wechat_redirect "http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247517164&idx=1&sn=28f50763db2883839908057125a7b497&chksm=faa36c36cdd4e52050796d00f2f5bf357471692c2da8727cc44ae47856cd925e599b6e954314&scene=21)

[Dragonfly 和 Nydus Mirror 模式集成实践](https://link.juejin.cn/?target=http%3A%2F%2Fmp.weixin.qq.com%2Fs%3F__biz%3DMzUzMzU5Mjc1Nw%3D%3D%26mid%3D2247518517%26idx%3D1%26sn%3D74f6426f0b280cbd4aafd2d37eaaec04%26chksm%3Dfaa366efcdd4eff9b50d52dad855ab593034b4af94896c2386705a316f063a1825d1729da36a%26scene%3D21%23wechat_redirect "http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247518517&idx=1&sn=74f6426f0b280cbd4aafd2d37eaaec04&chksm=faa366efcdd4eff9b50d52dad855ab593034b4af94896c2386705a316f063a1825d1729da36a&scene=21)
