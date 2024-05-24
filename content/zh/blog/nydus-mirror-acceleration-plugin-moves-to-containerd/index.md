---
title: "Nydus 镜像加速插件迁入 Containerd 旗下"
author: "葛长伟"
authorlink: "https://github.com/sofastack"
description: "Nydus 镜像加速插件迁入 Containerd 旗下"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2022-03-22T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*iOV4R4U3YrgAAAAAAAAAAAAAARQnAQ"
---

文｜葛长伟（花名：川朗 )

蚂蚁集团技术专家

负责容器镜像加速项目 Nydus 的开发和维护，专注于容器镜像存储、持久存储和文件系统领域。

本文 1344 字 阅读 4 分钟

## 前言

今年 1 月 ，Containerd 社区通过投票接收 Nydus-snapshotter 成为 Containerd 社区的子项目。这是继 ttrpc-rust 之后，蚂蚁容器团队再次向 Containerd 捐赠子项目。

此举将方便 Nydus 和 Containerd 的开发协同，减少项目迭代过程中可能出现的不兼容问题，也让用户可以更容易地使用 Nydus 镜像加速服务。

目前 Nydus 已经将 Nydus-snapshotter 的代码迁移到了 Containerd 组织下的新仓库[1]。

## Nydus 简介

Nydus 是蚂蚁集团和阿里云共同开源的容器镜像加速项目，属于 CNCF Dragonfly 项目，是其中的镜像服务部分。

Nydus 是在最新的 OCI Image-Spec 基础之上设计的容器镜像加速服务，重新设计了镜像格式和底层文件系统，从而加速容器启动速度，提高大规模集群中的容器启动成功率。

Nydus 设计了一个为镜像优化的文件系统—Rafs。

Nydus 镜像可以推送和保存在标准的容器镜像中心，Nydus 镜像格式完全兼容 OCI Image Spec 和 Distribution Spec。成功转换或者创建镜像后，Nydus 镜像会生成一个元数据文件 Bootstrap、若干个数据文件 blob、manifest.json、config.json。

目前可以通过 Nydusify 、Acceld 或者 Buildkit 创建 Nydus 加速镜像。

其中，Acceld[2] 是 Nydus 和 eStargz 的开发者正在合作开发的 Harbor 开源企业级镜像中心的一个子项目，它提供了一个通用的加速镜像转换服务和框架。基于 Acceld，Nydus 和 eStargz 可以方便地从 Harbor 触发加速镜像转换。

与此同时，Nydus 也在开发 Buildkit 相关的支持，在未来也可以直接通过 Buildkit 从 Dockerfile 直接创建加速镜像。

Nydus-snapshotter 是 Containerd 的 Remote Snapshotter 插件，它是一个独立于 Containerd 的进程。

当集成 Nydus-snapshotter 到 Containerd 后，Nydus-napshotter 在容器镜像准备阶段，只会将 Nydus 镜像的元数据部分 Bootstrap 从镜像中心下载下来，并且创建了一个新的进程 Nydusd。Nydusd 是处理文件系统操作的用户态进程。通过配置，Nydusd 可以作为基于 Linux FUSE 的用户态文件系统 Virtio-fs Vhost-user Backend，甚至可以是 Linux Fscache 的用户态进程。

Nydusd 负责从镜像中心或者对象存储下载文件数据以响应读文件的请求，并可以将文件数据块缓存在 Host 的本地文件系统。

![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*WoD0QadciPEAAAAAAAAAAAAAARQnAQ)

## Nydus 特性

Nydus 有如下重要的特性：

1、镜像层间块级数据去重，可以减少镜像中心的存储成本，降低数据传输的带宽消耗。

2、Whiteout 文件不会再被打包进 Nydus 镜像。

3、端到端的数据完整性校验。

4、作为 CNCF 孵化项目 Dragonfly 的子项目，Nydus 可以接入 P2P 分发系统，以此降低对镜像中心的压力。

5、支持数据和元数据分离存储。可以将数据保存在 NAS、阿里云 OSS 或者 AWS S3。

6、支持文件访问行为记录，这样就可以审计和分析容器内应用的访问行为。增强安全能力、优化镜像数据排布。

除了以上的关键特性，Nydus 可以灵活地配置成 Linux FUSE 用户态文件系统、基于轻量虚拟化技术容器的 Virtio-fs daemon，或者 Linux 内核磁盘文件系统 EROFS 的用户态 on-demand 数据下载服务：

1、轻量化地集成到 vm-based 容器运行时。现在 KataContainers 正在考虑原生地支持 Nydus 作为容器镜像加速方案。

2、Nydus 和 EROFS 紧密合作，期望可以直接使用 EROFS 作为容器镜像的文件系统。相关修改的第一部分已经合并入 Linux Kernel v5.16。

## Nydus 部署形态

支持 Runc 时，Nydus 作为 FUSE 用户态文件系统进程：

![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*osChSKuvbQsAAAAAAAAAAAAAARQnAQ)

支持 KataContainers 时，Nydus 作为 Virtio-fs daemon：

![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*OhiJT60GYKUAAAAAAAAAAAAAARQnAQ)

目前 EROFS 正在尝试联合 Fscache 一起，以内核文件系统 EROFS 直接作为容器 Rootfs：

![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*jNQHQ6ViMiEAAAAAAAAAAAAAARQnAQ)

Nydus 将与 Containerd 社区紧密合作，致力于提供更优秀的容器镜像加速方案，提高镜像的存储和分发效率，提供安全可靠的容器镜像服务。

## 求贤若渴

关于蚂蚁集团可信原生技术部安全容器和存储团队

在蚂蚁集团内部主要负责公司内部容器运行时和云原生存储技术，是公司数据链路的守护者，运行时环境的看门人。我们团队也是 Kata Containers 的创立者，镜像加速服务 Nydus 的发起者，分布式事务服务 Seata 的维护者，也维护着公司内数据访问组件 ZDal/ZCache/XTS 等产品。

我们是开源精神的信徒，也是实现开源软件和公司业务双赢的践行者。我们是一个关注业务、关注业界前沿、关注基础设施技术，更关心成员成长的团队。目前我们正在招收 2023 届实习生，有兴趣的可以参考蚂蚁集团 2023 届实习生招聘。

联系邮箱：<liyuming.lym@antgroup.com>

### 本周推荐阅读  

[恭喜 李志强 成为 Layotto committer！](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247503983&idx=1&sn=853b65c3fdc213cc85f510dba463b84c&chksm=faa33fb5cdd4b6a3da2921ae51022910413f5e589024d620c4de5abe29deacc90eca52e8e5e2&scene=21)

[社区文章｜MOSN 路由框架详解](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247503655&idx=1&sn=dfb174aa2c09e65505c738e5105618ba&chksm=faa320fdcdd4a9eb65036678ea1507578ed639435b7ca8c670202dc2a7597614984d9c4d11aa&scene=21)

[HAVE FUN | SOFARegistry 源码解析](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247502760&idx=1&sn=2980bf857055853220934944c42fd2af&chksm=faa32472cdd4ad641cb062e0c3bb5ec5b46dafba1ea25b19d774ebdac2704ae610994511874b&scene=21)

[BabaSSL：支持半同态加密算法 EC-ElGamal](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247502645&idx=1&sn=efb490d530f4254a8b12dff89714ace7&chksm=faa324efcdd4adf9119222551a407da68e388fd1b3f652fc034860fee9d687311e2136bbd28c&scene=21)

![img](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*8G5NRZ7UEToAAAAAAAAAAAAAARQnAQ)
