---
title: "SOFA Weekly |开源人、本周 QA、本周 Contributor"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly |开源人、本周 QA、本周 Contributor"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2022-09-23T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ"
---

## SOFA WEEKLY | 每周精选

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1e08fca65f7643c783d33f590bb41d5a~tplv-k3u1fbpfcp-zoom-1.image)

**筛选每周精华问答，同步开源进展，欢迎留言互动～**

**SOFA**Stack（**S**calable **O**pen **F**inancial **A**rchitecture Stack）是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

**SOFAStack 官网:** *[https://www.sofastack.tech](https://www.sofastack.tech)*

**SOFAStack:** *[https://github.com/sofastack](https://github.com/sofastack)*

### SOFAStack 社区本周 Contributor

![图片](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*KyU6RYZXTP0AAAAAAAAAAAAAARQnAQ)

### 每周读者问答提炼

***欢迎大家向公众号留言提问或在群里与我们互动，我们会筛选重点问题通过 " SOFA WEEKLY " 的形式回复***

**1.刘家燕** 提问：

> MOSN 现在支持 TCP 服务按照端口灰度么？譬如：应用场景：接入了一个 TCP 服务，分别暴露了三个端口是 60403，60269，60129，每一个端口对应不同的业务来源，调用之后会对应不同的业务处理。目的：现在对其中一个端口例如 60403 逻辑处理做了一些调整，发版验证是否顺利调用。因此，将该服务进行灰度，创建 v1，v2 版本。当监听到 60403 端口调用时，路由到 v2 ；其他端口，路由到 v1 。

A：最简单的就是你建两个 listener，不同端口的 listener 的路由对应不同的 cluster，比如 cluster_v1，cluster_v2。

> 意思是给创建灰度的版本各自创建一个 listener 吗？

A：因为本来就要监听不同的端口，所以不同端口的 listener 配置不同的 router 就行了哦。

**「MOSN」**：*[https://github.com/mosn/mosn/](https://github.com/mosn/mosn/)*

**2.Lewise Liu & 赵宇** 提问：

> 请问，MOSN 可以与新版本 Istio 控制面集成吗？

A：目前是支持的 1.10 ，新版本的话要做一些适配。

> 具体需要哪些适配？比如 1.14 。

A：我的理解，主要是新版本的 xDS 会新增一些 feature，如果依赖这些新 feature 的话，就需要做一些对应的适配或许也有一些在新版本里，被废弃或者调整了的（这些应该不多的）。

**「MOSN」**：*[https://github.com/mosn/mosn/](https://github.com/mosn/mosn/)*

### 本周推荐阅读

[Seata AT 模式代码级详解](https://mp.weixin.qq.com/s/qicDuZPhbGbKgUAbvZNemQ)

[Go 内存泄漏，pprof 够用了么？](https://mp.weixin.qq.com/s/Br8iPafpfaSD8_oBJ4bUPw)

[社区文章｜MOSN 构建 Subset 优化思路分享](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247511573&idx=1&sn=86019e1570b797f0d4c7f4aa2bcf2ad3&chksm=faa341cfcdd4c8d9aea24212d29c31f2732ec88ee65271703d2caa96dabc114e873f975fec8f&scene=21&token=560986722&lang=zh_CN)

[Go 代码城市上云——KusionStack 实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247515572&idx=1&sn=8fffc0fb13ffc8346e3ab151978d947f&chksm=faa3526ecdd4db789035b4c297811524cdf3ec6b659e283b0f9858147c7e37c4fea8b14b2fc6&scene=21&token=560986722&lang=zh_CN)

欢迎扫码关注：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e19d0a6d7f734ad6a585cde82ae4f3bf~tplv-k3u1fbpfcp-zoom-1.image)
