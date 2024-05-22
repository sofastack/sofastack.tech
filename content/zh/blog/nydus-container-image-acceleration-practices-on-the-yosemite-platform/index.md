---
title: "Nydus 在约苗平台的容器镜像加速实践"
authorlink: "https://github.com/sofastack"
description: "Nydus 在约苗平台的容器镜像加速实践"
categories: "SOFAStack"
tags: ["SOFAStak"]
date: 2023-02-28T15:00:00+08:00
cover: "https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*oRtfRJ9ZGDgAAAAAAAAAAAAADrGAAQ/original"
---

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c2c467481d7844019332576418b5093c~tplv-k3u1fbpfcp-zoom-1.image)

> 文 | 向申
> 约苗平台运维工程师 关注云原生领域
>
> **本文字数 9574 阅读时间 24 分钟**

本文是来自向申同学的分享，介绍了其在 K8s 生产环境集群部署 Nydus 的相关实践。

Nydus 是蚂蚁集团，阿里云和字节等共建的开源容器镜像加速项目，是 CNCF Dragonfly 的子项目，Nydus 在 OCI Image Spec 基础上重新设计了镜像格式和底层文件系统，从而加速容器启动速度，提高大规模集群中的容器启动成功率。详情文档请参考如下地址：

* Nydus 官方网站：*<https://nydus.dev/>*

* Nydus Github：*<https://github.com/dragonflyoss/image-service>*

**PART.1**

### 容器镜像的概念

#### 1. 容器镜像

容器镜像有一个官方的类比，"生活中常见的集装箱"，虽然拥有不同的规格，但箱子本身是不可变的（*Immutable*），只是其中装的内容不同。

对于镜像来说，不变的部分包含了运行一个应用软件（*如 MySQL* ）所需要的所有元素。开发者可以使用一些工具（*如 Dockerfile*）构建出自己的容器镜像，签名并上传到互联网上，然后需要运行这些软件的人可以通过指定名称（*如 example.com/my-app*）下载、验证和运行这些容器。

#### 2. OCI 标准镜像规范

在 OCI 标准镜像规范出台之前，其实有两套广泛使用的镜像规范，分别是 Appc 和 Docker v2.2，但“合久必分，分久必合”，有意思的是两者的内容已经在各自的发展中逐步同化了，所以 OCI 组织顺水推舟地在 Docker v2.2 的基础上推出了 OCI Image Format Spec，规定了对于符合规范的镜像，允许开发者只要对容器打包和签名一次，就可以在所有的容器引擎上运行该容器。

这份规范给出了 OCI Image 的定义：

This specification defines an OCI Image, consisting of a manifest, an Image Index (*optional*), a set of filesystem layers, and a Configuration.

#### 3. 容器的工作流程

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fa673cca7c6c47d486d073ab1ec694ed~tplv-k3u1fbpfcp-zoom-1.image)

一个典型的容器工作流程是从由 Developers 制作容器镜像开始的（*Build*），然后上传到镜像存储中心（*Ship*），最后部署在集群中（*RUN*）。

**PART.2**

#### OCI 镜像格式

通常所说的镜像文件其实指的是一个包含了多个文件的“包”，“包”中的这些文件提供了启动一个容器所需要的所有需要信息，其中包括但不限于，容器所使用的文件系统等数据文件，镜像所适用的平台、数据完整性校验信息等配置文件。当我们使用 Docker pull 或者 Nerdctl pull 从镜像中心拉取镜像时，其实就是在依次拉取该镜像所包含的这些文件。

Nerdctl 依次拉取了一个 Index 文件、一个 Manifest 文件、一个 Config 文件和若干个 Layer 数据文件。实际上，一个标准的 OCI 镜像通常就是由这几部分构成的。

其中，Layer 文件一般是 tar 包或者压缩后的 tar 包，其包含着镜像具体的数据文件。这些 Layer 文件会共同组成一个完整的文件系统（*也就是从该镜像启动容器后，进入容器中看到的文件系统*） 。

Config 文件是一个 JSON 文件。其中包含镜像的一些配置信息，比如镜像时间、修改记录、环境变量、镜像的启动命令等等。

Manifest 文件也是一个 JSON 文件。它可以看作是镜像文件的清单，即说明了该镜像包含了哪些 Layer 文件和哪个 Config 文件。

下面是一个 Manifest 文件的典型例子：

```text
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

Index 文件也是一个 JSON 文件。它是可选的，可以被认为是 Manifest 的 Manifest。试想一下，一个 tag 标识的镜像，比如 Docker.io/library/nginx:1.20 ，会针对不同的架构平台 （*比如 Linux/amd、Linux/arm64 等等*） 有不同的镜像文件，每个不同平台的镜像文件都有一个 Manifest 文件来描述，那么我们就需要有个更高层级的文件来索引这多个 Manifest 文件。

比如，Docker.io/library/nginx:1.20 的 Index 文件就包含一个 Manifests 数组，其中记录了多个不同平台的 Manifest 的基本信息：

```text
{  
 "manifests": [  
   {  
     "digest": "sha256:a76df3b4f1478766631c794de7ff466aca466f995fd5bb216bb9643a3dd2a6bb",  
     "mediaType": "application/vnd.docker.distribution.manifest.v2+json",  
     "platform": {  
       "architecture": "amd64",  
       "os": "linux"  
     },  
     "size": 1570  
   },  
   {  
     "digest": "sha256:f46bffd1049ef89d01841ba45bb02880addbbe6d1587726b9979dbe2f6b556a4",  
     "mediaType": "application/vnd.docker.distribution.manifest.v2+json",  
     "platform": {  
       "architecture": "arm",  
       "os": "linux",  
       "variant": "v5"  
     },  
     "size": 1570  
   },  
   {  
     "digest": "sha256:d9a32c8a3049313fb16427b6e64a4a1f12b60a4a240bf4fbf9502013fcdf621c",  
     "mediaType": "application/vnd.docker.distribution.manifest.v2+json",  
     "platform": {  
       "architecture": "arm",  
       "os": "linux",  
       "variant": "v7"  
     },  
     "size": 1570  
   },  
   {  
     "digest": "sha256:acd1b78ac05eedcef5f205406468616e83a6a712f76d068a45cf76803d821d0b",  
     "mediaType": "application/vnd.docker.distribution.manifest.v2+json",  
     "platform": {  
       "architecture": "arm64",  
       "os": "linux",  
       "variant": "v8"  
     },  
     "size": 1570  
   },  
   {  
     "digest": "sha256:d972eee4f12250a62a8dc076560acc1903fc463ee9cb84f9762b50deed855ed6",  
     "mediaType": "application/vnd.docker.distribution.manifest.v2+json",  
     "platform": {  
       "architecture": "386",  
       "os": "linux"  
     },  
     "size": 1570  
   },  
   {  
     "digest": "sha256:b187079b65b3eff95d1ea02acbc0abed172ba8e1433190b97d0acfddd5477640",  
     "mediaType": "application/vnd.docker.distribution.manifest.v2+json",  
     "platform": {  
       "architecture": "mips64le",  
       "os": "linux"  
     },  
     "size": 1570  
   },  
   {  
     "digest": "sha256:ae93c7f72dc47dbd984348240c02484b95650b8b328464c62559ef173b64ce0d",  
     "mediaType": "application/vnd.docker.distribution.manifest.v2+json",  
     "platform": {  
       "architecture": "ppc64le",  
       "os": "linux"  
     },  
     "size": 1570  
   },  
   {  
     "digest": "sha256:51f45f5871a8d25b65cecf570c6b079995a16c7aef559261d7fd949e32d44822",  
     "mediaType": "application/vnd.docker.distribution.manifest.v2+json",  
     "platform": {  
       "architecture": "s390x",  
       "os": "linux"  
     },  
     "size": 1570  
   }  
 ],  
 "mediaType": "application/vnd.docker.distribution.manifest.list.v2+json",  
 "schemaVersion": 2  
}
```

**PART.3**

### OCI 镜像所面临的问题

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2e34e9f48f0543969607a98377623d9b~tplv-k3u1fbpfcp-zoom-1.image)

#### 1. 启动容器慢

我们注意到镜像层需要全部堆叠后，容器才能看到整个文件系统视图，所以容器需要等到镜像的每一层都下载并解压之后才能启动。有一篇 FAST 论文研究分析\[1] 说镜像拉取占了大约容器 76% 的启动时间，但却只有 6.4% 的数据是会被容器读取的。这个结果很有趣，它激发了我们可以通过按需加载的方式来提高容器启动速度。另外，在层数较多的情况下，运行时也会有 Overlay 堆叠的开销。

一般来说容器启动分为三个步骤：

* 下载镜像；
* 解压镜像；
* 使用 Overlayfs 将容器可写层和镜像中的只读层聚合起来提供容器运行环境。

#### 2. 较高的本地存储成本

每层镜像是由元数据和数据组成的，那么这就导致某层镜像中只要有一个文件元数据发生变化，例如修改了权限位，就会导致层的 Hash 发生变化，然后导致整个镜像层需要被重新存储，或重新下载。

#### 3. 存在大量相似镜像

镜像是以层为基本存储单位，数据去重是通过层的 Hash，这也导致了数据去重的粒度较粗。从整个 Registry 存储上看，镜像中的层与层之间，镜像与镜像之间存在大量重复数据，占用了存储和传输成本。

**PART.4**

### Nydus 镜像解决方案

Nydus 镜像加速框架是 Dragonfly[2]（*CNCF 孵化中项目*）的子项目。它兼容了目前的 OCI 镜像构建、分发、运行时生态。Nydus 运行时由 Rust 编写，它在语言级别的安全性以及在性能、内存和 CPU 的开销方面非常有优势，同时也兼具了安全和高可扩展性。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/117eba1b0fab4ec495b5c527f6a1c194~tplv-k3u1fbpfcp-zoom-1.image)

#### 1. Nydus 基础架构

Nydus 主要包含一个新的镜像格式，和一个负责解析容器镜像的 FUSE 用户态文件系统进程。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4a082f1101974cec99bddc9a69fa1894~tplv-k3u1fbpfcp-zoom-1.image)

#### 2. Nydus 工作流程

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6b139713ee05485db35314f1c295494b~tplv-k3u1fbpfcp-zoom-1.image)

Nydus 镜像格式并没有对 OCI 镜像格式在架构上进行修改，而主要优化了其中的 Layer 数据层的数据结构。

Nydus 将原本统一存放在 Layer 层的文件数据和元数据 （文件系统的目录结构、文件元数据等） 分开，分别存放在 “Blob Layer” 和 “Bootstrap Layer” 中。并对 Blob Layer 中存放的文件数据进行分块 （Chunk） ，以便于懒加载 （在需要访问某个文件时，只需要拉取对应的 Chunk 即可，不需要拉取整个 Blob Layer） 。

同时，这些分块信息，包括每个 Chunk 在 Blob Layer 的位置信息等也被存放在 Bootstrap Layer 这个元数据层中。这样，容器启动时，仅需拉取 Bootstrap Layer 层，当容器具体访问到某个文件时，再根据 Bootstrap Layer 中的元信息拉取对应 Blob Layer 中的对应的 Chunk 即可。

#### 3. Nydus 优势

* 容器镜像按需下载，用户不再需要下载完整镜像就能启动容器。
* 块级别的镜像数据去重，最大限度为用户节省存储资源。
* 镜像只有最终可用的数据，不需要保存和下载过期数据。
* 端到端的数据一致性校验，为用户提供更好的数据保护。
* 兼容 OCI 分发标准和 artifacts 标准，开箱即可用。
* 支持不同的镜像存储后端，镜像数据不只可以存放在镜像仓库，还可以放到 NAS 或  者类似 S3 的对象存储上。
* 与 Dragonfly 的良好集成。

**PART.5**

### Nydus 在约苗生产实际运用

约苗平台作为国内领先的疾病预防信息与服务平台，以疫苗预约服务为核心，提供包括疫苗预约、疾病防控科普、“宫颈癌&乳腺癌”筛查预约等专业、全面的疾病预防信息与服务。

截止 2023 年 2 月约苗平台累计注册用户 3700 万+ 人，覆盖 28 个省及直辖市， 200+ 地级市，关联全国社区公共卫生服务机构 4000+ 家，提供疫苗预约&订阅服务  1.1  亿 + 次。

约苗业务全部基于 Kubernetes 进行微服务构建，在 Kubernetes 平台上已经平稳运行了超过 4 年时间，并且紧随 Kubernetes 的版本迭代及时更新。约苗的集群规模超过 60 个 Node 节点，目前相关服务容器 POD 已经超过了 1000+，同时每天更有上万个临时 Cronjob 类型的 POD 进行创建和销毁。对平台的运维发布的效率有较高的要求。

#### 1. 问题

Kubernetes 拉取镜像时间非常慢，在沿用 OCI 镜像时通过观察，镜像拉去时间可达 30s。

#### 2. 容器启动慢

通过线上观察，一个 POD 从创建到准备就绪需要等待 30s 甚至更多，甚至节点没有缓存，时间将会更久。

#### 3. 更新迭代块

在更新迭代中，每次批量更新多个服务，迭代周期短而频繁，在更新多个服务时镜像仓库压力大。\
随着以上问题的产生，经过多方面的调研以及相关测试，公司决定采用开源项目 Nydus 进行对当前业务优化。

**PART.6**

### Nydus 部署实践

Nydus 镜像加速，可以直接对接 OCI 镜像，同时 Containerd 也支持 Nydus 插件，识别 Nydus 镜像，一般在微服务场景下，使用 CICD ，我们需要在 Docker 打包镜像上部署 Nydus 转换镜像的服务，镜像转换后直接会在 Harboar 仓库生成 Nydus 的镜像，我们这里是用的 CICD 使用的 Jenkins，这里我就直接把服务部署在 Jenkins 的物理机上。

#### 1. 下载相关组件

下载链接：*<https://github.com/dragonflyoss/image-service/releases>*

`nydusify convert --source dockerharboar/nginx:1.2 --target dockerharboar/nginx:1.2-nydus`

#### 2. OCI 镜像转换 Nydus

`nydusify convert --source dockerharboar/nginx:1.2 --target dockerharboar/nginx:1.2-nydus`

注意:

* Source 这里表示源 Docker-Harboar 仓库的镜像，这个镜像必须私有仓库已经存在。
* Target 这里表示将源仓库镜像转换为 Nydus 镜像。

当使用这条命令后，镜像仓库在同一个目录层级会生成两份镜像，一份源 OCI 镜像，一份 Nydus 镜像。

**PART. 7**

### Nydus 对接 K8s 集群

K8s 集群使用的运行时为 Containerd ，而 Containerd 也支持使用插件 Nydus Snapshotter 来识别 Nydus 镜像，同时在使用 Nydus 功能时, Nydus 也是支持原生的  OCI 镜像，只是没有按需加载相关功能。

#### 1. K8s 集群节点部署 Nydus

官方说明：[https://github.com/dragonflyoss/image-service/blob/master/docs/containerd-env-setup.md](https://github.com/dragonflyoss/image-service/blob/master/docs/containerd-env-setup.md)

注意：要使用 Nydus 功能，K8s 的每个 Node  节点都需要部署 Nydus Snapshotter，除开 K8s-Master 节点。

下载安装包：

 [https://github.com/dragonflyoss/image-service/releases](https://github.com/dragonflyoss/image-service/releases)

 [https://github.com/containerd/nydus-snapshotter/releases](https://github.com/containerd/nydus-snapshotter/releases)

```text
   tar -xf nydus-snapshotter-v0.5.1-x86_64.tgz  
   tar -xf nydus-static-v2.1.4-linux-amd64.tgz
```

<!---->

```text
    安装相关软件  
    sudo install -D -m 755  nydusd nydus-image nydusify nydusctl nydus-overlayfs /usr/bin  
    sudo install -D -m 755 containerd-nydus-grpc /usr/bin
```

<!---->

```text
创建必要目录  
mkdir -p /etc/nydus  && mkdir -p /data/nydus/cache  && mkdir -p $HOME/.docker/
```

<!---->

```text
创建nydus配置文件  
sudo tee /etc/nydus/nydusd-config.fusedev.json > /dev/null << EOF  
{  
 "device": {  
   "backend": {  
     "type": "registry",  
     "config": {  
       "scheme": "",  
       "skip_verify": true,  
       "timeout": 5,  
       "connect_timeout": 5,  
       "retry_limit": 4  
     }  
   },  
   "cache": {  
     "type": "blobcache",  
     "config": {  
       "work_dir": "/data/nydus/cache"  
     }  
   }  
 },  
 "mode": "direct",  
 "digest_validate": false,  
 "iostats_files": false,  
 "enable_xattr": true,  
 "fs_prefetch": {  
   "enable": true,  
   "threads_count": 4  
 }  
}  
EOF
```

<!---->

```text
增加docker-harboar认证  
sudo tee $HOME/.docker/config.json << EOF  
{  
"auths": {  
"docker-harboarxxx": {  
"auth": "xxxxxx"  
}  
}  
}  
EOF

chmod 600 $HOME/.docker/config.json

docker-harboarxx  #私有仓库地址  
auth 里是 base64 编码的 user:pass
```

#### 2. 启动 Nydus 服务

```text
cd /data/nydusnohup /usr/bin/containerd-nydus-grpc --config-path /etc/nydus/nydusd-config.fusedev.json --log-to-stdout &
```

#### 3. 验证 Containerd 是否支持 Nydus

```text
验证nydus是否支持ctr -a /run/containerd/containerd.sock plugin ls | grep nydus
```

#### 4. 修改 Containerd 配置支持 Nydus

```text
containerd配置文件新增  
[proxy_plugins]  
 [proxy_plugins.nydus]  
   type = "snapshot"  
   address = "/run/containerd-nydus/containerd-nydus-grpc.sock"

[plugins."io.containerd.grpc.v1.cri".containerd]  
  snapshotter = "nydus"  
  disable_snapshot_annotations = false
```

#### 5. 重启 Containerd

```text
sudo systemctl restart containerd
```

**PART.8**

### 最终数据测试结果

#### 使用原生 OCI 镜像

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a54fef2a209344f5ba407dab9f29600d~tplv-k3u1fbpfcp-zoom-1.image)

#### 使用 Nydus 镜像

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/35c2c98cb7b84db1acc0b41697106b28~tplv-k3u1fbpfcp-zoom-1.image)

POD 从 Create 到 Ready：OCI -> 20s

POD 从 Create 到 Ready：Nydus -> 13s

目前业务镜像尺寸并不大，大约 200MB，使用 Nydus 已有提升效果，在使用超大镜像的场景，例如 AI 计算等，Nydus 能带来的加速效果会非常的明显。

**PART.9**

### 总结与未来期望

Nydus 是来自 CNCF 的优秀开源项目，更进一步说，约苗也将继续对该项目进行更多投入，并与社区展开深入合作，使得约苗平台变得更加强大和可持续。云原生技术是基础设施领域的一场革命，尤其是在弹性和无服务器方面，我们相信 Nydus 一定会在云原生生态中扮演重要角色。

### 相关链接

[1] 《Fast Distribution With Lazy Docker Containers》
[https://www.usenix.org/conference/fast16/technical-sessions/presentation/harter](https://www.usenix.org/conference/fast16/technical-sessions/presentation/harter)
[2] Dragonfly
[https://github.com/dragonflyoss/Dragonfly2](https://github.com/dragonflyoss/Dragonfly2)

## 了解更多

**Nydus Star 一下：**
[https://github.com/dragonflyoss/image-service](https://github.com/dragonflyoss/image-service)
