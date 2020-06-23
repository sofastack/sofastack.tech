---
title: "镜像格式二十年：从 Knoppix 到 OCI-Image-v2"
author: "王旭"
authorlink: "https://github.com/gnawux"
description: "众所周知，Docker 始于2013年的 dotCloud，迄今刚刚七年，如果你刚好在圈中经历了2013-2015年这段早期岁月的话，自然应该知道，最初的 Docker = LXC + aufs，前者就是所谓的 Linux 容器了，而后者则是今天要聊的镜像。"
categories: "镜像"
tags: ["镜像"]
date: 2020-06-23T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2020/png/226702/1592909440630-84f63d0f-41be-4caf-a969-f8e3dbea84fd.png?"
---

> 众所周知，Docker 始于2013年的 dotCloud，迄今刚刚七年，如果你刚好在圈中经历了2013-2015年这段早期岁月的话，自然应该知道，最初的 Docker = LXC + aufs，前者就是所谓的 Linux 容器了，而后者则是我今天要聊的镜像。

## 千禧年：惊艳的 Live CD

说到 Linux distro，除了做差异化的界面主题之外，核心差异一般都在于：

- 如何更方便地安装；
- 如何更方便地升级；

而在 distro 界却有一股清流，超脱于这两件事情之外，它们就是 Live CD，它们装在一张光盘里，或者是一个 U盘上，**不需要安装、也不会改变**。之前创业的时候，我司的运维大佬——彤哥曾经说过：

> 第一次见到 liveCD 时我内心是震惊的。。

这我当然是赞同的，那时我也是震惊的同学之一，要知道 Knoppix 在 2000 千禧年就来到了世界，而它所基于的著名的 Debian，直到2005年6月，Sarge (3.1) 发布的时候才正式在 _stable release_ 里带上了图形界面的安装程序 debian-installer （简称 d-i），此前版本的安装还在用文本菜单。就在这个年代，这样一个开光盘即用、启动起来就是图形界面的系统，给我们这些玩家带来的震撼，当然是可想而知的。那时候的 Live CD 就是十三年后的 Docker，绝对配得上“惊艳”两个字。

![Knoppix](https://cdn.nlark.com/yuque/0/2020/png/226702/1592796166818-13a57aed-002f-4540-9a33-84ebf70f33a1.png)

要知道，一张 700MB 左右的光盘里塞下个完整的操作系统并不容易（当然有人开头之后也不太难，后来我爱的 DSL 可以做到 50MB）。Knoppix 有个很棒的想法——把装好的操作系统给压缩一下，放在光盘里， 随用随解压，这样，一张 700MB 光盘里可以放下大约 2GB 的根文件系统，这样就跑 KDE 桌面也就没啥问题了，当是时，distrowatch.com 上可以看到，一大片 distro 都是基于 Knoppix 魔改的，足见其影响力。

## 进化：可读写层与 UnionFS

Knoppix 在诞生之初的一个执念是“绝不碰本地存储一根指头”，而光盘，CD-ROM，所使用的 ISO9600 文件系统也是只读的，这无疑暗合了当今流行的“不可变基础设施”的潮流，但是，即使在今天，没有可写文件系统对于很多 Linux 软件仍然是非常困难的，毕竟随随便便一个程序也要写一点配置文件、状态信息、锁、日志之类的嘛。而诞生之初的 Knoppix 是不可写的，那么，要有什么东西要罗盘，就得手工挖掘出本地硬盘来挂上，或者是挂个 NAS 到 /home 或其他挂载点上来，当你不想只是做个紧急启动盘的时候，这就有点麻烦了。

如果我们从今天穿越回去，毫不费力就可以指出，用 overlayfs 加上一个 tmpfs 做可写层嘛。但是，overlayfs 要到2010年才首次提交 patchset，2014年才被合并到 3.18内核（这中间，当时的淘宝内核组也有不少贡献和踩坑呢）。当然，比 overlay 早的类似的 unionfs 还是有的，Docker 最早采用的 Aufs 就是其中之一，它是2006年出现的，这里 **A**UFS 的 A，可以理解成 Advanced，但它最早的意思实际是 Another——是的，“另一个 UFS”，而它的前身就是 UnionFS。

在2005年5月，也就是十五年前，Knoppix 创造性地引入了 UnionFS，而在一年半以后的 5.1 版本中，Knoppix 引入了当年诞生的更稳定的 aufs，此后，包括大家熟悉的 Ubuntu LiveCD、Gentoo LiveCD 全都使用了 aufs。可以说，正是 Live CD 们，提前了8年，为 Docker 和 Docker Image 的诞生，做好了存储上的准备。

这里简单说一句给不了解的人听，所谓 union fs，是指多个不同文件系统联合（堆叠）在一起，呈现为一个文件系统，它和一般的 FHS 规定的那种树装组织方式是不同的，如下图，对于左边的标准的目录树结构，任何一个文件系统，挂载在树上的一个挂载点，根据路径，就可以指到一个确定的文件系统，比如，下图中，所有的 `/usr/local/` 下面的路径都在一个文件系统上，而其他 `/usr` 就会在另一个文件系统上；而 UnionFS 是多层堆叠的，你写的文件会停留在最上层，比如图中，你修改过的 `/etc/passwd` 就会在最上的可写层，其他的文件就要去下面的层中去找，也就是说，它允许同一个目录中的不同文件在不同层中，这样，Live CD 操作系统跑起来就像真正的本地操作系统一样可以读写所有路径了。

![Live CD 操作系统](https://cdn.nlark.com/yuque/0/2020/png/226702/1592796166855-093700b9-e51d-46fd-8169-bb1317b1589d.png)

## 块或文件：Cloop 与 SquashFS

让我们把目光放在只读层上，这一层是 Live CD 的基础，在 Live CD 还没有 union FS 来做分层的时候就已经存在这个只读 rootfs 了。对 Knoppix 来说，这一层是不能直接放完整、无压缩的操作系统的，因为在21世纪初，大家都还在用 24x 到 40x 速光驱的时代，Knoppix Live CD 面临的一个大问题是 700MB 的光盘和庞大的桌面操作系统之间的矛盾。

开头我们提到了，Knoppix 的想法就是“把装好的操作系统给压缩一下，放在光盘里， 随用随解压”，这样精心选择后的 2GB 的 Distro 就可以压到一张光盘里了，不过“随用随解压“不是说有就有的，文件系统访问块设备，是要找到块的偏移量的，压缩了之后，这个偏移量就并不那么好找了，全解压到内存里再找偏移并不那么容易。

回到2000年，那时候还是2.2内核，Knoppix 的作者 Klaus Knopper 在创立 Knoppix 之初就引入了一种压缩的(compressed) loop 设备，称为 cloop，这种设备是一种特殊的格式，它包含了一个索引，从而让解压缩的过程对用户来说是透明的，Knoppix 的 cloop 设备看起来就是一个大约 2GB 大的块设备，当应用读写一个偏移的数据的时候，它只需要根据索引解压缩对应的数据块，并返回数据给用户就可以了，无需全盘解压缩。

尽管 Knoppix 把众多 distro 带上了 Live CD 的船，但是，众多后继者，诸如 arch、Debian、Fedora、Gentoo、Ubuntu 等等 distro 的 LiveCD，以及大家熟悉的路由器上玩的 OpenWrt，都并没有选择 cloop 文件，它们选择了和应用语义更接近的文件系统级的解决方案——Squashfs。Squashfs 压缩了文件、inode 和目录，并支持从 4K 到 1M 的压缩单元尺寸。同样，它也是根据索引按需解压的，和 cloop 的不同之处是，当用户访问一个文件的时候，它来根据索引解压相应的文件所在的块，而非再经过一层本地文件系统到压缩块的寻址，更加简单直接。事实上，Knoppix 里也一直有呼声想要切换到 squashfs，比如，[2004年就有开发者在转换 knoppix 到squashfs 上](http://knoppix.net/forum/threads/11443-remaster-knoppix-with-squashfs)，而且，[一些测试数据](https://elinux.org/Squash_Fs_Comparisons)似乎也表明 Squashfs 的性能似乎要更好一些，尤其在元数据操作方面。

[在 wiki 上是这么评价 cloop 的缺点的](https://en.wikipedia.org/wiki/Cloop#Limitations)：

> The design of the cloop driver requires that compressed blocks be read whole from disk. This makes cloop access inherently slower when there are many scattered reads, which can happen if the system is low on memory or when a large program with many shared libraries is starting. A big issue is the seek time for CD-ROM drives (~80 ms), which exceeds that of hard disks (~10 ms) by a large factor. On the other hand, because files are packed together, reading a compressed block may thus bring in more than one file into the cache. The effects of tail packing are known to improve seek times (cf. reiserfs, btrfs), especially for small files. Some performance tests related to cloop have been conducted.

我来画蛇添足地翻译一下：

> cloop 的设计要求从磁盘上以压缩块为单位读取数据。这样，当有很多随机的读操作时，cloop 就会显著地变慢，当系统内存不足或者一个有很多共享库的大型程序启动的时候都很可能发生。cloop 面临的一个很大的问题是 CD-ROM 的寻道时间（约80毫秒），这在很大程度上超过了硬盘的查找时间（约10毫秒）。另一方面，由于文件可以被打包在一起，因此读取压缩块实际可能可以将多个文件带入缓存。这样，那些支持 tail packing 的文件系统（比如 reiserfs，btrfs）可能可以显著改善 seek 操作的时间，尤其是对于小文件更是如此。已经有一些与 cloop 相关的性能测试也证明了这些观点。

当然，尽管有这些争论，cloop 也仍然在 Knoppix 上存在，不过，这个争论最终随着2009年 squashfs 被并入 2.6.29 主线内核，应该算是分出胜负了，进入 kernel 带来的开箱即用换来的是压倒性的占有率和更好的支持，Squashfs 的优势不仅在上述的 distro 用户之多，也在于支持了了各种的压缩算法，只用于不同的场景。

## Docker: Make Unionfs Great Again

斗转星移，不再年轻的 Live CD 也因为如此普及，而让人觉得并不新奇了。但是，技术圈也有轮回一般，当年被 Live CD 带红的 Union FS 们再一次被 Docker 捧红，焕发了第二春。一般地说，虽然 aufs 们支持多个只读层，但普通的 Live CD 只要一个只读镜像和一个可写层留给用户就可以了。然而， 以 Solomon 为首的 dotCloud 的朋友们充分发挥了他们卓越的想象力，把整个文件系统变成了“软件包”的基本单位，从而做到了 #MUGA (Make Unionfs Great Again)。

回想一下，从1993年的 Slackware 到今天的 RHEL，（服务端的）Distro 的所作所为，不外乎我开头提到的两件事情——安装和升级。从 rpm 到 APT/deb 再到 Snappy，初始化好系统之后的工作的精髓就在于怎么更平滑地安装和升级、确保没有依赖问题，又不额外占据太多的空间。解决这个问题的基础就是 rpm/deb 这样的包以及包之间的依赖关系，然而，类似“A 依赖 B 和 C，但 B 却和 C 冲突” 这样的事情仍然层出不穷，让人们不停地尝试解决了二十年。

但 Docker 跳出了软件包这个思路，他们是这么看的——

- 完整的操作系统就是一个包，它必然是自包含的，而且如果在开发、测试、部署时都保持同样完整、不变的操作系统环境，那么也就没有那么多依赖性导致的问题了；
- 这个完整的操作系统都是不可变的，就像 Live CD 一样，我们叫它镜像，可以用 aufs 这样的 union FS 在上面放一个可写层，应用可以在运行时写东西到可写层，一些动态生成的配置也可以放在可写层；
- 如果一些应用软件镜像，它们共用同一部分基础系统，那么，把这些公共部分，放在 Unionfs 的下层作为只读层，这样他们可以给不同的应用使用；当然，如果两个应用依赖的东西不一样，那它们就用不同的基础层，也不需要互相迁就了，自然没有上面的依赖性矛盾存在了；
- 一个镜像可以包含多个层，这样，更方便应用可以共享一些数据，节省存储和传输开销；

大概的示意图是这样的：

![镜像和容器 roofs 示意图](https://cdn.nlark.com/yuque/0/2020/png/226702/1592796166816-f09d40c3-2904-4624-a272-a13d1e8c977b.png)

这样，如果在同一台机器上跑这三个应用（容器），那么这些共享的只读层都不需要重复下载。

更进一步说，Docker 这种分层结构的另一个优点在于，它本身是非常开发者友好的，可以看到，下面这个是一个 Dockerfile 的示意，FROM 代表最底下的基础层，之后的 RUN, ADD 这样改变 rootfs 的操作，都会将结果存成一个新的中间层，最终形成一个镜像。这样，开发者对于软件依赖性的组织可以非常清晰地展现在镜像的分层关系中，比如下面这个 Dockerfile 是一个 packaging 用的 image，它先装了软件的依赖包、语言环境，然后初始化了打包操作的用户环境，然后拉源代码，最后把制作软件包的脚本放到镜像里。这个组织方式是从通用到特定任务的组织方式，镜像制作者希望让这些层可以尽量通用一些，底层的内容可以在其他镜像中也用得上，而上层则是和本镜像的工作最直接相关的内容，其他开发者在看到这个 Dockerfile 的时候已经可以基本知道这个镜像里有什么、要干什么，以及自己是否可以借鉴了。这个镜像的设计是 Docker 设计里最巧妙的地方之一，也是为什么大家都愿意认同，Solomon 要做的就是开发者体验(DX, Developer Experiences)。

```dockerfile
FROM       debian:jessie
MAINTAINER Hyper Developers <dev@hyper.sh>

RUN apt-get update &&\
	apt-get install -y autoconf automake pkg-config dh-make cpio git \
		libdevmapper-dev libsqlite3-dev libvirt-dev python-pip && \
	pip install awscli && \
	apt-get clean && rm -fr /var/lib/apt/lists/* /tmp/* /var/tmp/*
RUN curl -sL https://storage.googleapis.com/golang/go1.8.linux-amd64.tar.gz | tar -C /usr/local -zxf -

RUN useradd makedeb && mkdir -p ~makedeb/.aws && chown -R makedeb.makedeb ~makedeb && chmod og-rw ~makedeb/.aws
RUN mkdir -p /hypersrc/hyperd/../hyperstart &&\
	cd /hypersrc/hyperd && git init && git remote add origin https://github.com/hyperhq/hyperd.git && \
	cd /hypersrc/hyperstart && git init && git remote add origin https://github.com/hyperhq/hyperstart.git && \
	chown makedeb.makedeb -R /hypersrc

ENV PATH /usr/local/go/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
ENV USER makedeb
ADD entrypoint.sh /

USER makedeb
WORKDIR /hypersrc
ENTRYPOINT ["/entrypoint.sh"]
```

一个规范的 Docker Image 或者脱胎于其中的 OCI Image，实际上就是一组元数据和一些层数据，这些层数据每个都是一个文件系统内容的打包，从某种意义上说，典型的 Live CD 的 OS，基本上可以理解成一个只读层加上一个可写层的 Docker Container 的 rootfs。在 Docker 这里，Union FS 可以说是 Great Again 了。

## 未来：现代化的镜像系统

然而，尽管 Docker Image （或者说 OCI Image）的设计蕴含了“完整的操作系统就是一个包”的优秀思想，又利用 Union FS 实现了“分层”这种既实现漂亮的开发者体验，又能节约时间空间的精巧设计，但随着时间的推移，还是暴露出来了一些问题。从去年（2019年）年初，OCI 社区中开始有人[讨论下一代镜像格式的问题](https://groups.google.com/a/opencontainers.org/forum/#!msg/dev/icXssT3zQxE/Bznevo54AwAJ)，这个热烈的讨论中，集中讨论了 OCIv1（实际也是 Docker 的）镜像格式的一些问题，Aleksa Sarai 也专门写了[一篇博客](https://www.cyphar.com/blog/post/20190121-ociv2-images-i-tar)来讨论这个话题，具体说，除了 tar 格式本身的标准化问题外，大家对当前的镜像的主要不满集中在：

- 内容冗余：不同层之间相同信息在传输和存储时都是冗余内容，在不读取内容的时候无法判断到这些冗余的存在；
- 无法并行：单一层是一个整体，对同一个层既无法并行传输，也不能并行提取；
- 无法进行小块数据的校验，只有完整的层下载完成之后，才能对整个层的数据做完整性校验；
- 其他一些问题：比如，跨层数据删除难以完美处理；

上述这些问题用一句话来总结就是“**层是镜像的基本单位**”，然而，镜像的数据的实际使用率是很低的，比如 Cern 的[这篇论文](https://indico.cern.ch/event/567550/papers/2627182/files/6153-paper.pdf)中就提到，一般镜像只有**6%**的内容会被实际用到，这就产生了实质性的升级镜像数据结构，不再以层为基本单位的动力。

可见，下一代镜像的一个趋势就是打破层的结构来对这些只读进行更进一步的优化，是的，反应快的同学可能已经回想起了前面提到的 Live CD 里常用的 Squashfs，它可以根据读取的需要来解压相应的文件块来放入内存、供应用使用，这里是不是可以扩展一下，变成在需要的时候再去远端拉回镜像的内容来供应用使用呢——从文件的 Lazy decompress 到 Lazy Load，一步之遥，水到渠城。

是的，蚂蚁的镜像加速实践里就采取了这样的架构。在过去，庞大的镜像不仅让拉取过程变慢，而且如果这一过程同样风险重重，贡献了大半的 Pod 启动失败率，而今天，当我们把延迟加载的 rootfs 引入进来的时候，这些失败几乎被完全消灭掉了。在去年年末的第10届中国开源黑客松里，我们也演示了通过 virtio-fs 把[这套系统对接到 Kata Containers 安全容器里的实现](https://yuque.antfin-inc.com/wx203157/blogs/be37et)。

![新的 Image 格式](https://cdn.nlark.com/yuque/0/2020/png/226702/1592796166845-4a49f869-e3d8-42db-a526-d55cd973afc3.png)

如图，类似 Squashfs，这种新的 Image 格式中，压缩数据块是基本单位，一个文件可以对应0到多个数据块，在数据块之外，引入了一些附加的元数据来做目录树到数据块的映射关系，从而可以在没有下载完整镜像数据的时候也给应用呈现完整的文件系统结构，并在发生具体读取的时候，根据索引，去获取相应的数据来提供给应用使用。这个镜像系统可以带来这些好处：

- 按需加载，启动时无需完全下载镜像，同时对加载的不完全镜像内容可以进行完整性校验，作为全链路可信的一个部分；
- 对于 runC 容器，通过 fuse 可以提供用户态解决方案，不依赖宿主机内核变动；
- 对于 Kata 这样的虚拟化容器，镜像数据直接送给 Pod 沙箱内部使用，不加载在宿主机上；
- 使用体验上和之前的 Docker Image 并没有显著不同，开发者体验不会变差；

而且，这套系统在设计之初，我们就发现，因为我们可以获取到应用文件数据访问模式的，而基于文件的一个好处是，即使镜像升级了，它的数据访问模式也是倾向于不太变化的，所以，我们可以利用应用文件数据的访问模式做一些文件预读之类的针对性操作。

可以看到，系统存储这个领域二十年来发生了一个螺旋式的进化，发生在 Live CD 上的进化，在容器这里也又来了一次，恍如隔世。目前，我们正在积极地参与 OCI Image v2 的标准推动，也正在把我们的参考实现和 DragonFly P2P 分发结合在一起，并[成为 CNCF 的开源项目 Dragonfly 的一部分](https://github.com/dragonflyoss/community/issues/9)，希望在未来可以和 OCI 社区进一步互动，让我们的需求和优势成为社区规范的一部分，也让我们可以和社区保持一致、可平滑过渡，未来可以统一在 OCI-Image-v2 镜像之下。

## 作者介绍

王旭，蚂蚁金服资深技术专家，也是开源项目 Kata Containers 的架构委员会创始成员，在过去几年中活跃在国内的开源开发社区与标准化工作中。在加入蚂蚁金服之前，他是音速神童的联合创始人和 CTO，他们在 2015 年开源了基于虚拟化技术的容器引擎 runV，在 2017 年 12 月，他们和 Intel 一起宣布 runV 与 Clear Containers 项目合并，成为 Kata Containers 项目，该项目于 2019 年 4 月被董事会通过成为了 OpenStack 基金会 2012 年以来的首个新开放基础设施顶级项目。在创立音速神童之前，王旭曾工作于盛大云计算和中国移动研究院的云计算团队。2011 年王旭曾经主持过杭州 QCon 的云计算主题，同时，也曾经是一位活跃的技术作者、译者和老 blogger。
