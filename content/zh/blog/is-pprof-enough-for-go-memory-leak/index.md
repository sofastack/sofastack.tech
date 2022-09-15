---
title: "Go 内存泄漏，pprof 够用了吗？"
authorlink: "https://github.com/sofastack"
description: "Go 内存泄漏，pprof 够用了吗？"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2022-09-13T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*EvZlQbIx3cEAAAAAAAAAAAAAARQnAQ"
---

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0f9763d214ac4a2bb684e5ea9f4713fd~tplv-k3u1fbpfcp-zoom-1.image)

文｜朱德江（GitHub ID：doujiang24)

MOSN 项目核心开发者、蚂蚁集团技术专家

*专注于云原生网关研发的相关工作*

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/87dcc4b074a44dfdb7e393faa5abacc7~tplv-k3u1fbpfcp-zoom-1.image)

***本文 2651 字 阅读 8 分钟***

*MOSN 是主要使用 Go 语言开发的云原生网络代理平台，在蚂蚁集团有着几十万容器的大规模生产应用。在这种大规模的应用中，经常会遇到各种内存问题，通常情况下 pprof heap profile 可以很好帮助分析问题。不过，有时候 pprof 也不够用，也就需要我们有更合适的工具了。*

## Part.1--出生证 vs 暂住证

首先 pprof 确实很好用，设计实现也都很精巧，有兴趣的可以查看这篇《Go 语言 pprof heap profile 实现机制》[1]。

用 pprof 来分析内存泄漏，通常情况下是够用了，不过有时候，也会不够用。

这是为什么呢？因为 **pprof 只是记录了内存对象被创建时的调用栈，并没有引用关系**。也就是说，没有办法知道，内存对象是因为被谁引用了而导致没有被释放。对此，我的同事--烈元同学有一个很形象的比喻，pprof 只能看到出生证，却查不了暂住证。

## Part.2--需要引用关系

有些场景下，我们知道了泄漏的内存是从哪里申请的，但是翻了半天代码，也搞不清楚内存为什么没有释放。比如，内存对象经过复杂的调用传递，或者复杂的内存池复用机制，又或者传给了某个不熟悉的第三方库，在第三方库中有非预期的使用……

在这些情况下，我们会有一个很直觉的想法是，想看看这些内存对象的引用关系。

## Part.3--内存引用关系火焰图

内存引用关系火焰图，是一种内存对象引用关系的可视化方式，最早应用于 OpenResty XRay 产品。这个工具确实是内存分析神器，给不少的客户定位过内存问题，感兴趣的可以移步 OpenResty 官方博客[2]。

下图是由一个 MOSN 服务产生的，自下而上表示的是从 GC root 到 GC object 的引用关系链，宽度表示的是对象大小 *（也包括其引用的对象的大小之和）* 。

有了这样的可视化结果，我们就可以直观的看到内存对象的引用关系。

比如下图最宽的部分，表示的是 MOSN 中 cluster_manager 全局变量中引用的 cluster 内存对象：

*[https://github.com/mosn/mosn/blob/aecc93c4b2b4801e7992387f245fe9eefa45733d/pkg/upstream/cluster/cluster_manager.go#L82](https://github.com/mosn/mosn/blob/aecc93c4b2b4801e7992387f245fe9eefa45733d/pkg/upstream/cluster/cluster_manager.go#L82)*

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6aa635e17d6e48d1b55819ec52102c7b~tplv-k3u1fbpfcp-zoom-1.image)

## Part.4--实现原理

在生成火焰图之前，首先我们需要提取两个关键信息：

**-** 每个内存对象之间的引用关系；

**-** 每个内存对象的类型。

### 引用关系

获取引用关系比较简单，首先，我们可以在 heap 中找到所有的 GC 对象。然后遍历所有的对象，再结合 bitmap 信息，获取这个对象引用的其他对象。基本原理跟 GC mark 是类似的，虽然实现上很不一样，但因为这个是离线工具，可以简单粗暴的实现。

### 类型推导

Go 语言作为编译型静态语言，是不需要为每个内存对象存储类型信息的 *（有点例外的是 interface）* 。如果是动态类型语言，比如 Lua，则会方便很多，每个 GC 对象都存储了对象的类型。

所以，要获取每个对象的类型，还是比较麻烦的，也是投入时间最多的一块。当然，还是有解决办法的，简单来说就是做逆向类型推导，根据已知内存的类型信息，推导被引用的内存对象的类型信息。

这块还是比较复杂的，有兴趣的可以看这篇《Go 语言，如何做逆向类型推导》[3]的介绍。

### 生成过程

有了这两个关键信息之后，生成过程如下还是比较清晰的：

**1.** 获取所有的内存对象，包括类型、大小，以及他们之间的引用关系，形成一个图；

**2.** 从 root 对象出发，按照层次遍历，形成一棵树 *（也就是剪枝过程，每个对象只能被引用一次）* ；

**3.** 将这棵树的完整引用关系，当做 backtrace dump 下来，count 是当前节点的总大小 *（包括所有子节点）* ，也就是火焰图上的宽度；

**4.** 从 bt 文件生成 svg，这一步是 brendangregg 的 FlameGraph 标准工具链。

## Part.5--使用方式

这个工具是基于 Go 官方的 viewcore 改进来的。不过，鉴于 Go 官方不那么热心维护 viewcore 了，MOSN 社区先 fork 了一份，搞了个 mosn 分支，作为 MOSN 社区维护的主分支。

之前也给 Go 官方 debug 提交了好几个 bugfix，等后面有空，我们再去提交这个 feature。

所以，使用方式如下：

```text
# 编译 mosn 维护的 viewcore
git clone git@github.com:mosn/debug.git
cd debug/cmd/viewcore
go build .

# 假设已经有了一个 core 文件（CORE-FILE）
# 以及对应的可执行程序文件（BIN-FILE）
viewcore CORE-FILE --exe BIN-FILE objref ref.bt

# 下载 FlameGraph 工具
git clone git@github.com:brendangregg/FlameGraph.git
../FlameGraph/stackcollapse-stap.pl ref.bt | ../FlameGraph/flamegraph.pl> ref.svg

# 浏览器打开 ref.svg 即可看到火焰图
```

如果使用碰到问题，可以随时联系我们或提交 issue（[https://github.com/mosn/mosn/issues](https://github.com/mosn/mosn/issues)）。

当然，倘若你成功定位了某个问题，也欢迎与我们共同分享，Let's have fun together！

MOSN 用户钉钉群：**33547952**

### 相关链接

[1] 《Go 语言 pprof heap profile 实现机制》：*[https://uncledou.site/2022/go-pprof-heap/](https://uncledou.site/2022/go-pprof-heap/)*

[2] OpenResty 官方博客：*[https://blog.openresty.com.cn/cn/openresty-xray-case-yundun/](https://blog.openresty.com.cn/cn/openresty-xray-case-yundun/)*

[3] 《Go 语言，如何做逆向类型推导》：*[https://uncledou.site/2022/go-type-derivation/](https://uncledou.site/2022/go-type-derivation/)*

### 了解更多…

**MOSN Star 一下✨：** *[https://github.com/mosn/mosn](https://github.com/mosn/mosn)*

**插播一条好消息！🤩**

对 Go 语言开发感兴趣的小伙伴们,欢迎大家参与到近期正热的 **GoCity** 项目体验

[点击此处查看演示视频](https://b23.tv/91Jb1Be)，快速入门吧🥳

### 本周推荐阅读

[MOSN 反向通道详解](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247513902&idx=1&sn=be00c5af2e9775a4039430bf187e16f4&chksm=faa358f4cdd4d1e23d7e9c93b4a94d6e6c377f51eb5e96b6dd5f74b840e48ebd3f518c4bf80a&scene=21)

[Go 原生插件使用问题全解析](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247512138&idx=1&sn=851abb8d07d47f703e33978c9c125c59&chksm=faa35f90cdd4d6869c6cd4934c042484dbe1063c3fb85462d2f33e936b96240ae33d02d18c3a&scene=21)

[Go 代码城市上云--KusionStack 实践](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247515572&idx=1&sn=8fffc0fb13ffc8346e3ab151978d947f&chksm=faa3526ecdd4db789035b4c297811524cdf3ec6b659e283b0f9858147c7e37c4fea8b14b2fc6&scene=21)

[MOSN 文档使用指南](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247507103&idx=1&sn=e8da41af0ceaa18ae13f31ca2905da8e&chksm=faa33345cdd4ba5397a43adfe8cabdc85321d3f9f14066c470885b41e2f704ec505a9f086cec&scene=21)

欢迎扫码关注：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9c573c68b15c47cab2a0012215229961~tplv-k3u1fbpfcp-zoom-1.image)
