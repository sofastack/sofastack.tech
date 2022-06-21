---
title: "社区文章｜MOSN 构建 Subset 优化思路分享"
authorlink: "https://github.com/sofastack"
description: "MOSN 使用了 Subset 算法作为其标签匹配路由负载均衡的方式。本文主要介绍 Subset 的原理，包括了在超大规模集群下 MOSN 的 Subset 所遇到的一些性能瓶颈与采用的优化算法。"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2022-06-20T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*Rap6SJnP9f0AAAAAAAAAAAAAARQnAQ"
---

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f4a312d5f9df484881263af287d71bef~tplv-k3u1fbpfcp-zoom-1.image)

文｜李旭东（花名：向旭 )

蚂蚁集团技术专家

蚂蚁中间件研发，专注于 SOFARegistry 及其周边基础设施的开发与优化

本文 **2098** 字 阅读 **8** 分钟

## ｜前言｜

MOSN 使用了 Subset 算法作为其标签匹配路由负载均衡的方式。本文主要介绍 Subset 的原理，包括了在超大规模集群下 MOSN 的 Subset 所遇到的一些性能瓶颈与采用的优化算法。

首先，**为什么要优化 Subset 呢？**

总体而言，性能瓶颈往往会由于集群规模的增大逐渐暴露出来。在蚂蚁的超大规模的集群上，注册中心推送地址列表会对应用造成一定的开销。

在我所参与过的某一次大规模压测中，核心应用的机器数目非常庞大，当进行发布或者运维的时候，它的地址列表会被推送给所有调用它的应用。

而 MOSN 会接收这份地址列表重新构建自己的路由。当地址列表非常庞大的时候，MOSN 更新 cluster 的性能瓶颈逐渐地暴露出来，出现了较高的 CPU 毛刺，内存在短时间内出现了上涨，gc 频率也大幅度增加。

通过下方的火焰图，我们可以看到这次压测期间对某应用的 MOSN 的 pprof：

**-** Alloc：

![image.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7ed16bcb36a14a118c79afd52feba324~tplv-k3u1fbpfcp-watermark.image?)

**-** CPU：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/00101ccbc7764819825a241846b7033d~tplv-k3u1fbpfcp-zoom-1.image)

从 pprof 可以看到，无论是 CPU 还是 alloc 的开销， 构建 SubsetLoadBalancer 都明显占了大头，所以优化这部分的构建是亟待去做的一件事。

最终通过探索优化，**我们可以减少 SubsetLoadBalancer 构建过程中 95% 的 CPU 开销和 75% 的 alloc 开销。**

下面让我们一起回顾下本次优化的过程与思路。

## PART. 1--Subset 基本原理介绍

在一个集群里，通常机器会有不同的标签，那么如何将一个请求路由到指定标签的一组机器呢？

MOSN 的做法是把一个服务下的机器按照机标签组合进行预先分组，形成多个子集。在请求的时候，根据请求中的 metadata 信息可以快速查询到这个请求对应应该匹配到的子集。

如下图所示，可以看到当前有 4 个节点：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/888975908d98464b874e7ed04cee3fad~tplv-k3u1fbpfcp-zoom-1.image)

标签匹配规则会根据 zone 、mosn_aig 、mosn_version 这 3 个字段进行匹配路由，根据这 3 个 key 的排序进行组合得到以下匹配路径：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/01a6c126c2584b89a717f33ddcb5506f~tplv-k3u1fbpfcp-zoom-1.image)

相对应的匹配树如下：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/aeff6aaeb78245528ea803650833018e~tplv-k3u1fbpfcp-zoom-1.image)

假设需要访问 {zone: zone1, mosn_aig: aig1}，那么经过排序后查找顺序为 mosn_aig:aig1 -> zone:zone1，查找到 [h1, h2]。

以上就是 Subset 的基本原理介绍。

## PART. 2--MOSN 对 Subset 的构建

首先需要输入的参数有两个：

**-** 带标签的机器列表 hosts，比如 [h1, h2, h3, h4]；

**-** 用于匹配的 subSetKeys, 如下图：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/011da7067c114d2d8348af0cad1f5c7b~tplv-k3u1fbpfcp-zoom-1.image)

接着我们先带上思路，然后阅读源码来看一下 MOSN 的 SubsetLoadBalancer 是如何构建这棵树的。

核心思路如下：

**-** 遍历每一个 host 的 labels 和 subSetKeys 递归去创建一棵树；

**-** 对于树的每一个节点，都会遍历一次 hosts 列表，过滤出匹配这个节点的 kvs 的 subHosts，每个节点创建一个子 load balancer。

我们来看源码图：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/daf7f0828400464ba31e15b1fec12375~tplv-k3u1fbpfcp-zoom-1.image)

整体的构建复杂度是 O *(M*N*K)* *(M: Subset 树节点个数，N: Hosts 个数, K: 匹配的 Keys）*

## PART. 3--构建性能瓶颈分析

通过对生产的 profile 分析，我们发现 SubsetLoadBalancer 的 createSubsets 在 CPU 和 alloc 的火焰图中的占比都较高。所以下面我们开始编写 benchmark，来优化这一部分的性能。

我们的输入参数为：

**-** subSetKeys：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/033d8c9c22b3409482121d0a30c37637~tplv-k3u1fbpfcp-zoom-1.image)

**-** 8000 个 hosts *（每个 hosts 都有 4 个 label, 每个 label 对应 3 种 value）* ：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/951642a014e84d04984981ee4539a850~tplv-k3u1fbpfcp-zoom-1.image)

接着，我们来看 CPU 和 alloc_space 的占用情况。

**-** CPU：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8aacff3a03de4d94a15ae32df5c1d15e~tplv-k3u1fbpfcp-zoom-1.image)

**-** alloc_space：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e6be9c3afa894dbcbe9d25caf3c2fa05~tplv-k3u1fbpfcp-zoom-1.image)

从上面两张火焰图中，我们可以看出 HostMatches 和 setFinalHost 占用了较多的 CPU_time  和 alloc_space。我们首先来看下 HostMatches：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0acf58a3931a4e2a9dd05cc1de4cce9d~tplv-k3u1fbpfcp-zoom-1.image)

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4c05bb64f9674f92b72ac2f094006149~tplv-k3u1fbpfcp-zoom-1.image)

它的作用是判断一个 host 是不是完全匹配给定的键值对，且判断这个 host 是否匹配这个匹配树节点。

它的开销主要在于执行次数过多：treeNodes * len(hosts) ，所以在集群变大时，这边的运行开销会大幅度上升。

然后我们再来看一下 setFinalHost：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8db3478219ca4afabf33cdb83e3a95ae~tplv-k3u1fbpfcp-zoom-1.image)

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4882e756701a40a7957674076360c708~tplv-k3u1fbpfcp-zoom-1.image)

他的主要逻辑是按 IP 进行去重，同时会附带 copy。如果我们在 SubsetLoadBalancer 的顶层进行去重，那么它的任意 Subset 都不需要再次去重。因此，这边可以把它改成不去重。

## PART. 4--倒排索引优化构建

在 HostMatches 的这么多次匹配中，实际上有很多的重复操作，比如对 host label 中某个 kv 判断 equals，在构建过程中重复的次数相当之多。

所以优化的思路可以基于避免这部分重复的开销，从预先构建倒排索引出发。具体步骤展开如下：

**1.** 输入两项参数:

**-** subSetKeys：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7656810e31784a0c9441d2346e5d91f3~tplv-k3u1fbpfcp-zoom-1.image)

**-** hosts：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/754c6dc7e5ff4e978174945b3477b6a1~tplv-k3u1fbpfcp-zoom-1.image)

**2.** 遍历一次 hosts，针对每个 kv 我们用 bitmap 构建倒排索引：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9f9c44c1f9c243b2bb08bee494b3b3ba~tplv-k3u1fbpfcp-zoom-1.image)

**3.** 根据 subSetKeys 和倒排索引中的 kvs，构建出匹配树，因为索引中是去重的与 hosts 数目无关，这个操作开销占比很低；

**4.** 对于树的每个节点，利用倒排索引中的 bitmap 做交集快速得到匹配全部 kv 的 hosts 的索引 bitmap；

**5.** 使用 bitmap 中存储的 index 从 hosts 中取出对应 subHosts 构建子 load balancer，同时注意此处不需要使用 setFinalHosts 进行去重。

基于上述思路过程开发新的 Subset preIndex 构建算法，可以在 MOSN 的对应 Pull Request 页面查看详情：

*[https://github.com/mosn/mosn/pull/2010](https://github.com/mosn/mosn/pull/2010)*

再分享下添加 benchmark 进行测试的地址：

*[https://github.com/mosn/mosn/blob/b0da8a69137cea3a60cdc6dfc0784d29c4c2e25a/pkg/upstream/cluster/subset_loadbalancer_test.go#L891](https://github.com/mosn/mosn/blob/b0da8a69137cea3a60cdc6dfc0784d29c4c2e25a/pkg/upstream/cluster/subset_loadbalancer_test.go#L891)*

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/55e86e99c8154325b51d499d85796c65~tplv-k3u1fbpfcp-zoom-1.image)

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/eedadd7ce0bf46928d7bb40641b7b623~tplv-k3u1fbpfcp-zoom-1.image)

可以看到相对之前的构建方式，构建速度快了 **20** 倍，alloc_space 减小了 **75%** 。同时，alloc 次数出现了少量的上升，这是因为需要额外的构建一次倒排索引所致。

下面观察一下 gc：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/03bd8c2e8d744e009aaacf01fe1112cb~tplv-k3u1fbpfcp-zoom-1.image)

我们可以发现，相较于之前的构建方式，运行期间的内存更小了，而且 CPU 回收的内存也变少了，同时 gc 并行扫描的时长小幅上涨，STW 时间变的更短。

最后，测试一下在不同 hosts 数目下的优化程度，可以看到在 hosts 数目较多时 *（>100)* ， 新的构建算法都会大幅的优于旧的构建算法。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/da5fcaa8f03849b68a391795a61a1831~tplv-k3u1fbpfcp-zoom-1.image)

## PART. 5--总结

我们看到在大规模生产环境中，一些以前不会注意到的性能瓶颈往往会暴露出来，但通过压测，我们能提前发现并优化这些问题。

**目前，该构建算法已经合并到 MOSN master，作为 MOSN 默认的 SubsetLoadBalancer 构建方式。**

在这次优化过程中，我们用到了一些常见的优化手段，如：倒排索引、bitmap。不难看出，这些优化手段虽然基础常见， 但也取得了理想的优化效果，希望能对大家有所帮助。

## 了解更多

**MOSN Star 一下✨：**

*[https://github.com/mosn/mosn](https://github.com/mosn/mosn)*

### 本周推荐阅读

MOSN 文档使用指南

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8f22ffc4d6f7434da79c9c02c0c80c69~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247507103&idx=1&sn=e8da41af0ceaa18ae13f31ca2905da8e&chksm=faa33345cdd4ba5397a43adfe8cabdc85321d3f9f14066c470885b41e2f704ec505a9f086cec&scene=21)

MOSN 1.0 发布，开启新架构演进

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/451396778e004948979a2bb72e5842c5~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247506881&idx=1&sn=b61b931c11c83d3aceea93a90bbe8c5d&chksm=faa3341bcdd4bd0d1fb1348c99e7d38be2597dcb6767a68c69149d954eae02bd39bc447e521f&scene=21)

MOSN Contributor 采访｜开源可以是做力所能及的事

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ba2f4ce730aa4991a1c639b678da48f0~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247508985&idx=1&sn=6cae1ea0e17720f38a7687f74b833c50&chksm=faa34c23cdd4c535c32debf5053cfa8d82e07aae46b24efcbb18b2f863044d7e80dc8b780dbf&scene=21)

【2022 开源之夏】SOFAStack 和 MOSN 社区项目中选结果

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1f267ed1c24e4e9085e637412313faed~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247511279&idx=1&sn=4d831229eee252064b4d940b2080d424&chksm=faa34335cdd4ca233573b12f5fc7e8b22a4e14a5ad003856fe246f7f6991645f774c590becb5&scene=21)

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/14c2d6b24f0d47828f9280d83a540d09~tplv-k3u1fbpfcp-zoom-1.image)
