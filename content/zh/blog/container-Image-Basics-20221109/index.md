---
标题: " Nydus | 容器镜像基础"
作者链接：“ https://github.com/sofastack ”
描述: " Nydus | 容器镜像基础"
类别：“ Nydus ”
标签：[“Nydus”]
日期：2022-11-09T15:00:00+08:00
封面："https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*KNCeQrAlJtMAAAAAAAAAAAAAARQnAQ"
---

文｜唐斌

字节跳动基础架构研发工程师  

Nydus 与 Nydus snapshotter 社区贡献者，专注存储，云原生技术。  

本文 **6964** 字 阅读 **15** 分钟

***

## 1 Nydus

### 1.1 存在的问题

**对于容器镜像使用者**

**问题一：** 启动容器慢：容器启动慢的情况普遍发生在当用户启动一个很大的容器镜像时，由于在容器准备阶段需要三步（以 overlayfs 为例）：

**-** 下载镜像；

**-** 解压镜像；

**-** 使用 overlayfs 将容器可写层和镜像中的只读层聚合起来提供容器运行环境。

其中，下载镜像阶段需要下载整个镜像文件，不能实现文件数据按需加载。再加上下载镜像本身受限于网络带宽，当容器镜像达到 GB 级别时，下载时间会较长，破坏了容器原本优秀的用户体验。

**问题二：** 较高的本地存储成本：不同镜像之间可以共享的最小单位是镜像中的层，缺点之一是重复数据的处理效率较低。

原因如下：

**-** 首先，层内部存在重复的数据；

**-** 其次，层与层之间可能存在大量重复的数据，即使有微小的差别，也会被作为不同的层；

**-** 再次，根据 OCI imagespec 对删除文件和 hardlink 的设计，镜像内部已经被上层删除的文件可能仍然存在于下层，并包含在镜像中。

**对于镜像提供者**

这里的提供者主要指容器服务的镜像中心。

**问题一：** 巨大的存储资源浪费。

**-** **存在大量相似镜像，造成这种情况有两个原因：**

- 首先，上面提到的层的缺点，导致在容器镜像中心存在许多相似镜像；

- 其次，OCI image 使用了 tar+gzip 格式来表示镜像中的层，而 tar 格式并不区分 tar archive entries ordering，这带来一个问题，如果用户在不同机器上 build 同一个镜像，最终可能会因为使用了不同的文件系统而得到不同的镜像，用户上传之后，镜像中心中会存在若干不同镜像的实质内容是完全相同的情况。

**- 镜像去重效率低**

虽然镜像中心有垃圾回收机制来实现去重功能，但其仍然以层为单位，所以只能在有完全相同 hash value 的层之间去重。

**问题二：** 云原生软件供应链带来的新需求。

随着时间推移，和软件供应链一起发展的还有对软件供应链环节的多样性攻击手段。安全防护是软件供应链中非常重要的组成，不光体现在对软件本身的安全增强，也体现在对供应链的安全增强。因为应用运行环境被前置到了容器镜像中，所以对容器镜像的安全，包括对镜像的漏洞扫描和签名成为了容器服务提供者的必要能力。

**OCI 镜像规范的缺陷**

主要的缺陷有两点：

**- tar 格式标准**

- tar 格式并不区分 tar archive entries ordering，这带来一个问题，即如果用户在不同机器上 ；build 同一个镜像，最终可能会因为使用了不同的文件系统而得到不同的镜像，比如在文件系统 A 上的 order 是 foo 在 bar 之前进入 tar ，在文件系统 B 上的 order 是 bar 在 foo 之前进入tar ，那么这两个镜像是不同的；

- 当 tar 被 gzip 压缩过之后不支持 seek ，导致运行之前必须先下载并解压 targz 的 image layers，而不能实现文件数据按需加载。

**- 以层为镜像的基本单位**

- 内容冗余：不同层之间相同信息在传输和存储时都是冗余内容，在不读取内容的时候无法判断到这些冗余的存在；

- 无法并行：每一层是一个整体，对同一个层既无法并行传输，也不能并行提取；

- 无法进行小块数据的校验，只有完整的层下载完成之后，才能对整个层的数据做完整性校验；

- 其他一些问题：比如，跨层数据删除难以完美处理。

### 1.2 Nydus 基础

在容器的生产实践中，偏小的容器镜像能够很快部署启动。当应用的镜像达到 GB 级以上的时候，在节点上下载镜像通常会消耗大量的时间。Dragonfly 通过引入 P2P 网络有效地提升了容器镜像大规模分发的效率。然而，用户必须等待镜像数据完整下载到本地，然后才能创建自己的容器。

Nydus 是在最新的 OCI Image-Spec 基础之上设计的容器镜像加速服务，重新设计了镜像格式和底层文件系统，从而加速容器启动速度，提高大规模集群中的容器启动成功率。Nydus 由阿里云和蚂蚁集团的工程师合作开发，并大规模部署在内部的 生产环境中。

Nydus 优化了现有的 OCI 镜像标准格式，并以此设计了一个用户态的文件系统。通过这些优化，Nydus 能够提供这些特性：

- 容器镜像按需下载，用户不再需要下载完整镜像就能启动容器

- 块级别的镜像数据去重，最大限度为用户节省存储资源

- 镜像只有最终可用的数据，不需要保存和下载过期数据

- 端到端的数据一致性校验，为用户提供更好的数据保护

- 兼容 OCI 分发标准和 artifacts 标准，开箱即可用

支持不同的镜像存储后端，镜像数据不只可以存放在镜像仓库，还可以放到 NAS 或者类似 S3 的对象存储上

- 与 Dragonfly 的良好集成

### 1.3 Nydus 架构

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d5503e590f504aaaa3bc42f80ac0ba29~tplv-k3u1fbpfcp-zoom-1.image)

Nydus 的架构主要包含两部分内容：

**- 新的镜像格式（Rafs）**

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b83352225c1449f2bb9ed1eb84bc9c47~tplv-k3u1fbpfcp-zoom-1.image)

**- 负责解析容器镜像的 FUSE 用户态文件系统进程**

Nydus 兼容多种文件系统，能够解析 FUSE 和 virtiofs 协议来支持传统的 runc 容器、 Kata容器。对于存储后端，支持使用容器仓库（ Registery ）、OSS 对象存储 、NAS、Dragonfly 的超级节点和 Peer 节点作为 Nydus 的镜像数据存储后端。此外，为了加速启动速度，Nydus 还可以配置一个本地缓存，避免每次启动容器时都从远端数据源拉取数据。

### 1.4 Nydus 特性

**容器启动速度变快**

用户部署了 Nydus 镜像服务后，由于使用了按需加载镜像数据的特性，容器的启动时间明显缩短。在官网的测试数据中，Nydus 能够把常见镜像的启动时间，从数分钟缩短到数秒钟。理论上来说，容器镜像越大，Nydus 体现出来的效果越明显。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a10475df4ec04aa9807279000e84dcae~tplv-k3u1fbpfcp-zoom-1.image)

**提供运行时数据一致校验**

在传统的镜像中，镜像数据会先被解压到本地文件系统，再由容器应用去访问使用。解压前，镜像数据是完整校验的。但是解压之后，镜像数据不再能够被校验。这带来的一个问题就是，如果解压后的镜像数据被无意或者恶意地修改， 用户是无法感知的。而 Nydus 镜像不会被解压到本地，同时可以对每一次数据访问进行校验，如果数据被篡改，则可以从远端数据源重新拉取。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5dfd14c9369f4bf7a59421a45e04c1e4~tplv-k3u1fbpfcp-zoom-1.image)

从图中可以看出，对容器镜像数据进行运行时一致性校验是通过对每个数据块计算 SHA 256 实现的，这得益于 Nydus 采用分块的方式管理镜像数据。如果在镜像文件非常大的时候，对整个镜像文件计算哈希值非常不现实。

### 1.5 Nydus 镜像格式：RAFS

RAFS 是对 EROFS 文件系统的增强，拓展在云原生场景下的能力，使其适应容器镜像存储场景。RAFS v6 是内核态的容器镜像格式，除了将镜像格式下沉到内核态，还在镜像格式上进行了一系列优化，例如块对齐、更加精简的元数据等。

**RAFS v6 镜像格式**

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/33307b9e5f8746e29071091ba034b866~tplv-k3u1fbpfcp-zoom-1.image)


### 1.6 Nydus -snapshotter

Nydus snapshotter 是 containerd 的一个外部插件，使得 containerd 能够使用 Nydus 镜像加速服务。在 containerd 中， snapshot 的工作是给容器提供 rootfs，Nydus snapshotter 实现了 containerd 的 snapshot 的接口，使得 containerd 可以通过 Nydus 准备 rootfs 以启动容器。由于 nydus-snapshotter 实现了按需加载的特性，在 containerd 启动容器时，只需要根据容器镜像的元数据信息准备 rootfs ，部分目录对应的数据并未存储在本地，当在容器中访问到（本地访问未命中）这部分数据时，通过 Nydusd 从镜像 registry 拉取对应数据内容。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/90bbf50038494c83af3fc17c59a24714~tplv-k3u1fbpfcp-zoom-1.image)

## 02 FUSE

用户态文件系统（ filesystem in userspace， 简称 FUSE ）使得用户无需修改内核代码就能创建自定义的文件系统。FUSRE 催生了著名的 fuse-overlayfs，其在 rootless 容器化中扮演重要的角色。

用户态文件系统并不完全在用户态实现，由两部分组成：内核模块和用户态进程。

- 内核模块：文件系统数据流程的功能实现，负责截获文件访问请求和返回用户态进程处理请求的结果

- 用户态进程：负责处理具体的数据请求，对应处理函数由内核模块触发

FUSE 的工作流程如下图：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/82bbd988241949aca91b65c7df4dc9bb~tplv-k3u1fbpfcp-zoom-1.image)

其中，fuse_user 是运行在用户态的文件系统进程，该程序会在启动时注册实现的数据请求处理接口，如 ls 、cd 、mkdir 等，同时，程序在某个路径挂载 fuse 文件系统 /tmp/fuse_fs ，当对 /tmp/fuse_fs 执行相关操作时：  

- 请求会经过 VFS（虚拟文件系统） 到达 fuse 的内核模块

- 内核模块根据请求类型，调用用户态进程注册的函数

- 当程序完成对请求的处理后，将结果通过 VFS 返回给系统调用

## 03 Containerd

Containerd 最开始是 Docker Engine 中的一部分，后来，containerd 被分离出来作为独立的开源项目，目标是提供更开放、稳定的容器运行基础设施。分离出来的 containerd 将具有更多的功能，涵盖整个容器运行时管理的所有需求。

Containerd 是一个行业标准的容器运行时，强调简单性、健壮性和可移植性，可以作为守护进程运行在系统中。

Containerd 的功能主要包括以下内容：

- 管理容器的生命周期（从创建容器到销毁容器）

- 拉取/推送容器镜像

- 存储管理（管理镜像及容器数据的存储）

- 调用 runc 运行容器（与 runc 等容器运行时交互）

- 管理容器网络接口及网络

Containerd 采用 C/S 架构，服务端通过 unix domain socket 暴露低层 gRPC 接口，客户端通过这些 gRPC 接口管理节点上的容器，containerd 负责管理容器的镜像、生命周期、网络和存储，实际运行容器是由容器运行时（runc 是其中一种）完成。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8764fa487d274aebbb131c1ac3e152a3~tplv-k3u1fbpfcp-zoom-1.image)

Containerd 将系统划分成不同的组件，每个组件由一个或多个模块协作完成（Core 部分），不同模块都以插件的形式集成到 containerd 中，插件之间相互依赖。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/dab409fe3770449f82172f1b6eb6e69f~tplv-k3u1fbpfcp-zoom-1.image)

Containerd 的组件可以分成三类：Storage、Metadata 和 Runtimes，snapshot 属于 Storage 组件中的一个插件，用来管理容器镜像的文件系统快照，镜像中的每一层都会被解压成文件系统快照。在使用 Nydus 的 containerd 环境中，Nydus-snapshotter 负责完成这部分工作。

## 04 Erofs + fsache

**Erofs over fscache 基本概念**

Erofs over fscache 是 Linux 内核原生的镜像按需加载特性，于 5.19 版本合入 Linux 内核主线。

已有的用户态方案会涉及频繁的内核态/用户态上下文切换，以及内核态/用户态之间的内存拷贝，从而造成性能瓶颈。这一问题在容器镜像已经全部下载到本地的时候尤其突出，容器运行过程中涉及的文件访问，都会陷出到用户态的服务进程。

事实上我们可以将按需加载的

（1）缓存管理和 

（2）缓存未命中的时候通过各种途径 (例如网络) 获取数据，这两个操作解耦开。缓存管理可以下沉到内核态执行，这样当镜像在本地 ready 的时候，就可以避免内核态/用户态上下文的切换。而这也正是 erofs over fscache 技术的价值所在。

fscache/cachefiles  (以下统称 fscache ) 是 Linux 系统中相对成熟的文件缓存方案，广泛应用于网络文件系统，erofs over fscache 技术使得 fsache 能够支持 erofs 的按需加载特性。

容器在访问容器镜像的时候，fscache 会检查当前请求的数据是否已经缓存，如果缓存命中 ( cache hit )，那么直接从缓存文件读取数据。这一过程全程处于内核态之中，并不会陷出到用户态。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a58a7d6051ba4219ad4f101cb9fb8d9d~tplv-k3u1fbpfcp-zoom-1.image)

缓存未命中 ( cache miss )时 需要通知用户态的 Nydusd 进程以处理这一访问请求，此时容器进程会陷入睡眠等待状态；Nydusd 通过网络从远端获取数据，通过 fscache 将这些数据写入对应的缓存文件，之后通知之前陷入睡眠等待状态的进程该请求已经处理完成；之后容器进程即可从缓存文件读取到数据。

**Erofs over fscache 优势**

**- 异步预取**

容器创建之后，当容器进程尚未触发按需加载 (cache miss) 的时候，用户态的 Nydusd 就可以开始从网络下载数据并写入缓存文件，之后当容器访问的文件位置恰好处于预取范围内的时候，就会触发 cache hit 直接从缓存文件读取数据，而不会再陷出到用户态。用户态方案则无法实现该优化。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/edc7f3c7d4e24d9ba73cca565213e40c~tplv-k3u1fbpfcp-zoom-1.image)

**- 网络 IO 优化**  

当触发按需加载 (cache miss) 时，Nydusd 可以一次性从网络下载比当前实际请求的数据量更多的数据，并将下载的数据写入缓存文件。例如容器访问 4K 数据触发的 cache miss，而 Nydusd 实际一次性下载 1MB 数据，以减小单位文件大小的网络传输延时。之后容器访问接下来的这 1MB 数据的时候，就**不必再陷出到用户态**。

用户态方案则无法实现该优化，因为即使触发 cache miss 的时候，用户态的服务进程同样实现了该优化，下一次容器访问位于读放大范围内的文件数据的时候，同样会陷出到用户态。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ab51a57b66ac40e7b308fa90a80da897~tplv-k3u1fbpfcp-zoom-1.image)

**- 更佳的性能表现**

当镜像数据已经全部下载到本地的时候 (即不考虑按需加载的影响)， erofs over fscache 的性能表现显著优于用户态方案，同时与原生文件系统的性能相近，从而实现与原生容器镜像方案 (未实现按需加载) 相近的性能表现。

## 05 环境安装

**nerdctl 安装**

```rust
# git clone https://github.com/rootless-containers/rootlesskit.git
# cd rootlesskit
# make && sudo make install

wget https://github.com/containerd/nerdctl/releases/download/v0.22.2/nerdctl-full-0.22.2-linux-amd64.tar.gz
sudo tar -zxvf nerdctl-full-0.22.2-linux-amd64.tar.gz -C /usr/local

sudo systemctl enable --now containerd
sudo systemctl enable --now buildkit

# sudo apt-get install uidmap -y
# containerd-rootless-setuptool.sh install

sudo nerdctl version    # 需要使用sudo，不然会提示安装 rootless
```

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d5ccc931c8b4468d9e9ea47bf405097c~tplv-k3u1fbpfcp-zoom-1.image)

**Nydus 安装**

装主要的3个工具（也可以直接下载所有工具的二进制文件，编译安装时默认没有没有 Nydusify ）：

- `nydusify` 将 OCI 格式的容器镜像转换为 Nydus 格式（ RAFS ）容器镜像的工具。

- `nydus-image`将解压后的容器镜像转换为 Nydus 格式镜像的工具。

- `nydusd` 解析 Nydus 格式镜像并提供 FUSE 挂载点以供容器访问的守护程序。`nydusd` 也可以用作 virtiofs 后端，使得 Guest 可以访问 Host 的文件。

```rust
git clone https://github.com/dragonflyoss/image-service.git

cd image-service

make && make install

# 默认没有安装 nydusify
wget https://github.com/dragonflyoss/image-service/releases/download/v2.1.0-rc.1/nydus-static-v2.1.0-rc.1-linux-amd64.tgz
mkdir nydus-static
tar -zxvf nydus-static-v2.1.0-rc.1-linux-amd64.tgz -C nydus-static
sudo cp nydus-static/nydusify /usr/local/bin
sudo cp nydus-static/nydus-overlayfs /usr/local/bin

nydus-image --version
nydusify --version
nydusd --version
```

**安装 Nydus-snapshotter**

```rust
git clone github.com/containerd/nydus-snapshotter.git
cd nydus-snapshotter
make && make install

sudo systemctl enable nydus-snapshotter
sudo systemctl start nydus-snapshotter
systemctl status nydus-snapshotter
```

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6265954c8784483d812548844f7e2e6d~tplv-k3u1fbpfcp-zoom-1.image)

Nydus-snapshotter 以 service 的形式运行 /usr/local/bin/containerd-nydus-grpc 可执行文件，配置信息位于 /etc/nydus/config.json 文件。

默认 address 位置：

/run/containerd-nydus/containerd-nydus-grpc.sock

默认工作目录：

/var/lib/containerd-nydus-grpc

默认缓存目录：

/var/lib/containerd-nydus-grpc/cache

**部署本地镜像仓库（测试用）**

```rust
# sudo docker run -d -p 5000:5000 \
# --restart=always \
# --name registry \
# -v /var/lib/registry:/var/lib/registry \
# -d registry

sudo docker run -d --name=registry --restart=always -p 5000:5000 registry
sudo docker logs registry -f
```

**将 OCI 格式的镜像转换为 RAFS 格式镜像**

```rust
sudo nydusify convert \
  --nydus-image $(which nydus-image) \
  --source ubuntu:16.04 \
  --target localhost:5000/ubuntu:16.04-nydus
```

Nydusify 基本命令：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ae6a97362cf64cc8bef438970e74e1b3~tplv-k3u1fbpfcp-zoom-1.image)

转换后的镜像层文件位于当前目录下的 tmp 文件夹：

```rust
sudo tree tmp -L 4
```

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/369fad74865b45659f6473d8239340a0~tplv-k3u1fbpfcp-zoom-1.image)

将 OCI 标准的镜像格式转换为 Nydus 使用的 RAFS 镜像格式后，可以使用 Nydusd 解析并提供 fuse 挂载点供容器使用。编写配置文件 registry.json，使得 Nydus 使用 容器镜像 registry （已经搭建本地容器镜像 register 用于测试）作为存储后端。

```rust
{
  "device": {
    "backend": {
      "type": "registry",
      "config": {
        "scheme": "http",
        "host": "localhost:5000",
        "repo": "ubuntu"
      }
    },
    "digest_validate": false
  },
  "mode": "direct"
}
```

挂载  RAFS 镜像 为 fuse 挂载点，--bootstrap 参数传递位于 tmp/bootstraps 下的文件路径：

```rust
sudo nydusd \
  --config ./registry.json \
  --mountpoint /mnt \
  --bootstrap ./tmp/bootstraps/4-sha256:fb15d46c38dcd1ea0b1990006c3366ecd10c79d374f341687eb2cb23a2c8672e \
  --log-level info
```

查看挂载情况：  

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/142cb2d18c2246b1b740f482ffc893ed~tplv-k3u1fbpfcp-zoom-1.image)

输出日志信息：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a08490e7e6364e64bbb93b7201cae64d~tplv-k3u1fbpfcp-zoom-1.image)

除了使用 Nydusify 直接将 OCI 标准格式镜像转换为 Nydus 格式镜像，Nydus-image 工具也支持直接对已经解压的 OCI 容器镜像文件层转换为 Nydus 格式镜像。

**（1）获取 OCI 镜像元数据信息：**

```rust
docker pull ubuntu:16.04
sudo docker inspect -f "{{json .GraphDriver }}" ubuntu:16.04  | jq .
```

Docker 使用 overlay2 存储驱动，通过所需的 lowerdir 、upperdir 、merged 和 workdir 结构自动创建 overlay 挂载点。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1f8d1bad88df47a1851c6ee12f174ef1~tplv-k3u1fbpfcp-zoom-1.image)

对于 Nydus 来说，目录树（通常是一个镜像层）由两部分组成：

- bootstrap：存储目录的文件系统元数据信息

- blob：存储目录中的所有文件数据

**（2）建立生成 Nydus 镜像的目录：**

```rust
mkdir -p nydus-image/{blobs,layer1,layer2,layer3,layer4}
```

**（3）转换最底层的镜像层：**

```rust
sudo nydus-image create \
  --bootstrap ./nydus-image/layer1/bootstrap \
  --blob-dir ./nydus-image/blobs \
  --compressor none /var/lib/docker/overlay2/78f2b3506072c95ca3929a0a797c1819e8966b8bbf5ce8427b671296ca1ad35a/diff

tree -L 2 ./nydus-image
```

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1e97e15adc12424e830fbf223fd11c73~tplv-k3u1fbpfcp-zoom-1.image)

**（4）转换第 2 底层镜像层，--parent-bootstrap 指父层，即刚才转换好的镜像层：**

```rust
sudo nydus-image create \
  --parent-bootstrap ./nydus-image/layer1/bootstrap \
  --bootstrap ./nydus-image/layer2/bootstrap \
  --blob-dir ./nydus-image/blobs \
  --compressor none /var/lib/docker/overlay2/373ea430abb0edd549583f949ec8259806d9eb7d0a0416ec1494d2fc7efeeedc/diff
```

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/45140d9871cb4c2eb99a221fad6e265b~tplv-k3u1fbpfcp-zoom-1.image)

**（5）转换第 3 层和第 4 层，每次都需要指定 --parent-bootstrap 为上一次生成的镜像层：**

```rust
sudo nydus-image create \
  --parent-bootstrap ./nydus-image/layer2/bootstrap \
  --bootstrap ./nydus-image/layer3/bootstrap \
  --blob-dir ./nydus-image/blobs \
  --compressor none /var/lib/docker/overlay2/05424b8c067c59368c11ad5674d68d95365e87487bdf10e3d9842b1016583369/diff

sudo nydus-image create \
  --parent-bootstrap ./nydus-image/layer3/bootstrap \
  --bootstrap ./nydus-image/layer4/bootstrap \
  --blob-dir ./nydus-image/blobs \
  --compressor none /var/lib/docker/overlay2/942c712e7276be5bde4fb7b30f72583c4a9cf0b2aaa14215cd690daf893a630e/diff
```

将 Nydus 镜像挂载到目录：

```rust
sudo nydusd \
  --config  ./localfs.json \
  --mountpoint /mnt \
  --bootstrap ./nydus-image/layer4/bootstrap \
  --log-level info
```

其中， localfs.json 文件的内容为：

```rust
{
  "device": {
    "backend": {
      "type": "localfs",
      "config": {
        "dir": "/<YOUR-WORK-PATH>/nydus-image/blobs"
      }
    }
  },
  "mode": "direct"
}
```

Dir 为生成的 Nydus 镜像文件中 blobs 目录的绝对路径。

## 06 通过 Nydus+snapshotter 启动容器

**添加配置文件**

Nydus 提供了 containerd 远程快照管理工具 containerd-nydus-grpc 用于准备 Nydus 镜像格式的容器 rootfs ，首先将 Nydusd 配置保存到  /etc/nydus/config.json 文件。

```rust
sudo tee /etc/nydus/config.json > /dev/null << EOF
{
  "device": {
    "backend": {
      "type": "registry",
      "config": {
        "scheme": "http",
        "skip_verify": false,
        "timeout": 5,
        "connect_timeout": 5,
        "retry_limit": 2,
        "auth": ""
      }
    },
    "cache": {
      "type": "blobcache",
      "config": {
        "work_dir": "cache"
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

containerd-nydus-grpc 会自动从 $HOME/.docker/config.json 中读取 docker login auth ，如果不想使用这个值，需要直接替换配置文件中的内容。

直接从终端启动 containerd-nydus-grpc，如果已经通过 containerd-nydus-grpc service 启动，则可以跳过此步骤：

```rust
sudo /usr/local/bin/containerd-nydus-grpc \
    --config-path /etc/nydus/config.json \
    --shared-daemon \
    --log-level info \
    --root /var/lib/containerd/io.containerd.snapshotter.v1.nydus \
    --cache-dir /var/lib/nydus/cache \
    --address /run/containerd-nydus/containerd-nydus-grpc.sock \
    --nydusd-path /usr/local/bin/nydusd \
    --nydusimg-path /usr/local/bin/nydus-image \
    --log-to-stdout
```

**修改 containerd 配置文件**

proxy_plugins.nydus 的 address 和 containerd-nydus-grpc 的对应。

```rust
sudo tee -a /etc/containerd/config.toml << EOF
[proxy_plugins]
  [proxy_plugins.nydus]
    type = "snapshot"
    address = "/run/containerd-nydus/containerd-nydus-grpc.sock"

[plugins.cri]
  [plugins.cri.containerd]
    snapshotter = "nydus"
    disable_snapshot_annotations = false
EOF

sudo systemctl restart containerd
sudo ctr -a /run/containerd/containerd.sock plugin ls | grep nydus
```

**通过 Nydus 启动容器**

```rust
# 转换镜像并上传到本地 registry
sudo nydusify convert --nydus-image /usr/local/bin/nydus-image --source ubuntu --target localhost:5000/ubuntu-nydus

sudo nerdctl --snapshotter nydus pull localhost:5000/ubuntu-nydus:latest
sudo nerdctl --snapshotter nydus run --rm -it localhost:5000/ubuntu-nydus:latest bash
```

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/91871b2863ab489e9dbc595364dda254~tplv-k3u1fbpfcp-zoom-1.image)

**重启主机之后启动环境**

```rust
sudo systemctl restart nydus-snapshotter
sudo systemctl restart containerd

sudo docker rm -f registry
sudo docker run -d --name=registry --restart=always -p 5000:5000 registry && sudo docker logs registry -f
```

## 07参考资料

[1]OCI 镜像标准格式: 
*[https://github.com/opencontainers/image-spec](https://github.com/opencontainers/image-spec)*

[2]自校验的哈希树: 
*[https://en.wikipedia.org/wiki/Merkle_tree](https://en.wikipedia.org/wiki/Merkle_tree)*

[3]FUSE: 
*[https://www.kernel.org/doc/html/latest/filesystems/fuse.html](https://www.kernel.org/doc/html/latest/filesystems/fuse.html)*

[4]virtiofs:
*[https://virtio-fs.gitlab.io/](https://virtio-fs.gitlab.io/)*

[5]runc 容器: 
*[https://github.com/opencontainers/runc](https://github.com/opencontainers/runc)*

[6]Kata 容器: 
*[https://katacontainers.io/](https://katacontainers.io/)*

[7]OSS 对象存储: 
*[https://www.alibabacloud.com/product/oss](https://www.alibabacloud.com/product/oss)*

[8]Nydus-snapshotter: 
*[https://github.com/containerd/nydus-snapshotter](https://github.com/containerd/nydus-snapshotter)*

[9]fuse-overlayfs: 
*[https://github.com/containers/fuse-overlayfs](https://github.com/containers/fuse-overlayfs)*

[10]5.19 版本:
*[https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=65965d9530b0c320759cd18a9a5975fb2e098462](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=65965d9530b0c320759cd18a9a5975fb2e098462)*

[11]对于容器镜像使用者:
*[https://mp.weixin.qq.com/s/yC-UmMSDja959K9i_jSucQ](https://mp.weixin.qq.com/s/yC-UmMSDja959K9i_jSucQ)*

## 本周推荐阅读

[Nydus —— 下一代容器镜像的探索实践](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247510940&idx=1&sn=b545e0836a6182abddd13a05b2f90ba9&chksm=faa34446cdd4cd50a461f071cdc4d871bd6eeef2318a2ec73968c117b41740a56a296c726aee&scene=21#wechat_redirect)

[Nydus 镜像加速插件迁入 Containerd 旗下](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247504035&idx=1&sn=320b77bf5f3c6cf0da309f7527b98e64&chksm=faa33f79cdd4b66f184d273a2d7460c41320711eab47af849e386c359e71eeebc6c7f21c1e0f&scene=21#wechat_redirect)

[cgo 机制 - 从 c 调用 go](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247516398&idx=1&sn=2172b6f6ffe9c8b3263a15ef60ee3d54&chksm=faa36f34cdd4e622746582f922cd00798a1044c4f32a7ce058be6df91b58cbee725022a56525&scene=21#wechat_redirect)

[从规模化平台工程实践，我们学到了什么？](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247516354&idx=1&sn=804c45c191a9e319d4a47135e301f91a&chksm=faa36f18cdd4e60e445dd9b4acfe51e40e2060349199e6160811ca069c2c54270d42ec0ca2b7&scene=21#wechat_redirect)
