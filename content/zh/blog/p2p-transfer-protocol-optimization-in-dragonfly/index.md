---
title: "Dragonfly 中 P2P 传输协议优化"
authorlink: "https://github.com/sofastack"
description: "Dragonfly"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2022-11-16T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*kgjOTrQiZBAAAAAAAAAAAAAAARQnAQ"
---

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/efe942fbc1f145a3b4618f426b0f8673~tplv-k3u1fbpfcp-zoom-1.image)  

文｜孙珩珂
  
上海交通大学  

本文**1987**字 阅读 **10** 分钟

### 01 优化背景

此前 Dragonfly 的 P2P 下载采用静态限流策略，相关配置项在 `dfget.yaml` 配置文件中：

```c
# 下载服务选项。
download:  
# 总下载限速。  
totalRateLimit: 1024Mi  
# 单个任务下载限速。  perPeerRateLimit: 512Mi
```

其中 `perPeerRateLimit` 为单个任务设置流量上限， `totalRateLimit` 为单个节点的所有任务设置流量上限。

静态限流策略的理想情况是： `perPeerRateLimit` 设置为20M ， `totalRateLimit` 设置为 100M ，且该节点目前运行了 5 个或更多的 P2P 下载任务，这种情况下可以确保所有任务总带宽不会超过 100M ，且带宽会被有效利用。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9961baec5df1458692eb084cf6b51538~tplv-k3u1fbpfcp-zoom-1.image)

这种限流策略的缺点是：若`perPeerRateLimit` 设置为 20M ， `totalRateLimit` 设置为 100M ，并且当前该节点只运行了一个下载任务，那么该任务的最大下载速度为 20M ，和最大带宽 100M 相比，浪费了 80% 的带宽。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5cbce33500ef462fa63615216e4a5712~tplv-k3u1fbpfcp-zoom-1.image)

因此，为了最大限度地利用带宽，需要使用动态限流来确保任务数量少时能能充分利用总带宽，而任务数量多时也能公平分配带宽。最终，我们设计出一套根据上下文进行动态限流的算法，其中上下文指各任务在过去一秒内使用的带宽，此外，算法还考虑到了任务数量、任务剩余大小、任务保底带宽等因素，性能相比原来的静态限流算法有显著提升。

### 02 相关代码分析

`perPeerRateLimit` 配置项最终赋值给 `peerTaskConductor` 的`pt.limiter` ，由 `peerTaskConductor` 的 `DownloadPiece()` 函数里进行限速，`pt.waitLimit()` 进行实际限流工作，底层调用 Go 自带的限流函数 `WaitN()` 。

`TotalRateLimit` 配置项则在创建 `Daemon` 时被赋值给 `pieceManager` 的`pm.limiter` ，在 `pieceManager` 的 `DownloadPiece()` 和 `processPieceFromSource()` 函数中用到的 `pm.limiter` ，而这两个函数都会由 `peerTaskConductor` 调用，也就是说 P2P 下载会先进行总限速，之后再进行每个任务单独限速。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/97596adf05ba40929d31e7a777e2280e~tplv-k3u1fbpfcp-zoom-1.image)

根据以上分析，Dragonfly 进行任务限速的逻辑为，每个peer task（`peerTaskConductor`）会有单独的限速 `perPeerRateLimit` ，同时 `pieceManager` 会有 `TotalRateLimit` 的总限速，以此达到单任务单独限流，同时限制所有任务总带宽的效果。

### 03 优化方案

为了解决此前静态限流算法总带宽利用率不佳的缺点，需要将其改进为动态限流算法，即总带宽限速仍恒定，但每个任务的单独带宽限速需要根据上下文适度、定期调整，已达到最大化利用总带宽、同时相对公平分配带宽的目的。

在经过数个改版后，最终我们确定了根据上下文进行限流的 sampling traffic shaper 动态限流算法。具体方案为，每个任务的单任务限流交由 `TrafficShaper` 组建进行统一管理， `TrafficShaper` 维护当前正在运行的所有任务，并且定期（每秒）更新这些任务的带宽。

具体来说，上下文指每个任务在上一秒使用的带宽、每个任务的剩余大小、任务数量、任务保底带宽（不能低于 `pieceSize` ）等因素， `TrafficShaper` 会根据这些上下文公平地、效率最大化地为每个任务分配其下一秒的带宽（具体分配方案详见下一小节），实现动态限流的效果。

### 04 优化实现

定义 `TrafficShaper` 接口如下：

```c
// TrafficShaper allocates bandwidth for running tasks dynamically
type TrafficShaper interface {
   // Start starts the TrafficShaper
   Start()   
   // Stop stops the TrafficShaper
   Stop()   
   // AddTask starts managing the new task
   AddTask(taskID string, ptc *peerTaskConductor)
   // RemoveTask removes completed task
   RemoveTask(taskID string)   
   // Record records task's used bandwidth
   Record(taskID string, n int)
   // GetBandwidth gets the total download bandwidth in the past second
   GetBandwidth() int64
}
```

该接口有两种实现，第一种是 `samplingTrafficShaper` 即基于上下文的 traffic shaper ，第二种是 `plainTrafficShaper` 只记录带宽使用情况，除此之外不做任何动态限流工作，用于和 `samplingTrafficShaper` 对比性能提升。

同时，将相关配置项修改为如下内容：

```c
# 下载服务选项。
download:  
# 总下载限速。
totalRateLimit: 1024Mi
# 单个任务下载限速。
perPeerRateLimit: 512Mi
# traffic shaper类型，有sampling和plain两种可选  trafficShaperType: sampling
```

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ba757d11dbf24c519474e9c885a1210a~tplv-k3u1fbpfcp-zoom-1.image)

Traffic shaper 的具体运行逻辑为，由`peerTaskManager`维护`trafficShaper`，在创建`peerTaskManager`时，根据配置初始化`trafficShaper`，并且调用`Start()`函数，启动`trafficShaper`，具体来说，新建`time.NewTicker`，跨度为 1 秒，也即每秒`trafficShaper`都会调用`updateLimit()`函数以动态更新所有任务的带宽限流。

`updateLimit()` 函数会遍历所有运行中的任务，得出每个任务上一秒消耗的带宽以及所有任务消耗的总带宽，随后根据任务上一秒使用的带宽、任务剩余大小等因素，按比例分配带宽，具体来说首先根据上一秒该任务使用带宽以及该任务剩余大小的最大值确定下一秒该任务带宽，接着所有任务带宽根据总带宽按比例缩放，得到下一秒的真实带宽；同时需要确保每个任务的带宽不低于该任务的 `pieceSize` ，以免出现持续饥饿状态。

在 `peerTaskManager` 的 `getOrCreatePeerTaskConductor()` 函数中，若新建任务，需要带宽，那么调用 `AddTask()` 更新所有任务的带宽，即按照已有任务的平均任务分配带宽，然后再根据总带宽上限将所有任务的带宽等比例进行缩放；根据平均带宽分配新任务带宽的优势为，避免了已经有一个任务占满了所有带宽，有新任务进来时，带宽会被压缩到很小 **的情况；同时，不是平均分配带宽，而是按需等比例分配，可以确保带宽需求量大的任务仍然带宽最多。在 `peerTaskManager` 的 `PeerTaskDone()` 函数中，任务完成，不再占用带宽，调用 `RemoveTask()` 按比例扩大所有任务的带宽。

最后， `peerTaskManager` 停止时，调用 `Stop` 函数，停止运行 traffic shaper 。

### 05 优化结果

测试 traffic shaper 相比原有的静态限流策略在单个任务、多个任务并发、多个任务交错等多种情况下的性能提升，测试结果如下：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cb7d9914142a4768a7f2c3ee943ebb5e~tplv-k3u1fbpfcp-zoom-1.image)
*注：若不特殊注明，单任务限流为4KB/s，总限流为10KB/s*

可以看到， traffic shaper 在单任务、多任务不相交、单任务低带宽等情况下相比静态限流策略性能提升明显，为 24%~59% 。在多个任务并发、多个任务交错等情况下和静态限流策略性能相当。综上，实验证明 sampling traffic shaper 能很好地解决任务数量较少时总带宽被大量浪费的情况，同时在任务数量较多以及其他复杂情况时依旧能保证和静态限流算法持平的效果。

PR 链接（已合并）：
*[https://github.com/dragonflyoss/Dragonfly2/pull/1654](https://github.com/dragonflyoss/Dragonfly2/pull/1654)*

**本周推荐阅读**

[Dragonfly 基于 P2P 的文件和镜像分发系统](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247510940&idx=1&sn=b545e0836a6182abddd13a05b2f90ba9&chksm=faa34446cdd4cd50a461f071cdc4d871bd6eeef2318a2ec73968c117b41740a56a296c726aee&scene=21#wechat_redirect)

[深入 HTTP/3（2）｜不那么 Boring 的 SSL](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247515730&idx=1&sn=185ccafb2e52b09b0c5746e5dd70f9ae&chksm=faa35188cdd4d89e014c71c1ebfdaa615eafca514443e40e923933df5e6ea32fe90ae50af74d&scene=21#wechat_redirect)

[Go 代码城市上云——KusionStack 实践](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247515572&idx=1&sn=8fffc0fb13ffc8346e3ab151978d947f&chksm=faa3526ecdd4db789035b4c297811524cdf3ec6b659e283b0f9858147c7e37c4fea8b14b2fc6&scene=21#wechat_redirect)

[MOSN 反向通道详解](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247513902&idx=1&sn=be00c5af2e9775a4039430bf187e16f4&chksm=faa358f4cdd4d1e23d7e9c93b4a94d6e6c377f51eb5e96b6dd5f74b840e48ebd3f518c4bf80a&scene=21#wechat_redirect)
