---
title: "SOFA Weekly | C 位大咖说、本周 Contributor & QA"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly | C 位大咖说、本周 Contributor & QA"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2022-08-19T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ"
---

## SOFA WEEKLY | 每周精选

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1e08fca65f7643c783d33f590bb41d5a~tplv-k3u1fbpfcp-zoom-1.image)

**筛选每周精华问答，同步开源进展，欢迎留言互动～**

**SOFA**Stack（**S**calable **O**pen **F**inancial **A**rchitecture Stack）是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

**SOFAStack 官网:** *[https://www.sofastack.tech](https://www.sofastack.tech)*

**SOFAStack:** *[https://github.com/sofastack](https://github.com/sofastack)*

### SOFAStack 社区本周 Contributor

![图片](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*Jk1rRZdQ8u4AAAAAAAAAAAAAARQnAQ)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动我们会筛选重点问题通过 " SOFA WEEKLY " 的形式回复

**1. 卿同学** 提问：

> 想咨询一下，目前蚂蚁内部使用 MOSN 外有使用到 Envoy 吗？

A：目前蚂蚁的东西向网关是 MOSN on Envoy 的，Layotto on Envoy 也在试点中，所以没有直接使用 Envoy，不过很多场景是跑在 Envoy 上的。

> 那在 RPC、MQ、DB 流量这块都走 MOSN 流量拦截的方式吗？还是基于 Layotto API 的方式呢？

A：目前主要是 MOSN，多语言和多云场景在走 Layotto 的方式。

> 我看 Layotto 也在推动和 Envoy 的融合，这一块现在有进展吗？

A：今年我们首先会开源 Envoy 的 cgo 插件，然后基于这个插件，可以把 Layotto 跑在 Envoy 上。

**「MOSN」**：*[https://github.com/mosn/mosn](https://github.com/mosn/mosn)*

**「Layotto」**：*[https://github.com/mosn/layotto](https://github.com/mosn/layotto)*

**2. 古寒** 提问：

> 咨询下， MOSN 部署有指导文档嘛？

A：有的，看下这个文档，[https://mosn.io/docs/user-guide/start/proxy/](https://mosn.io/docs/user-guide/start/proxy/)

**「MOSN」**：*[https://github.com/mosn/mosn](https://github.com/mosn/mosn)*

### 本周推荐阅读

[社区文章｜MOSN 构建 Subset 优化思路分享](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247511573&idx=1&sn=86019e1570b797f0d4c7f4aa2bcf2ad3&chksm=faa341cfcdd4c8d9aea24212d29c31f2732ec88ee65271703d2caa96dabc114e873f975fec8f&scene=21)

[如何看待 Dapr、Layotto 这种多运行时架构](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247510516&idx=1&sn=eff21915cd0ac1a8c8e3f126b549a605&chksm=faa3462ecdd4cf38ab6ab0c7201902fb53d54cea4865f9b7d7cdcdc7eaa00cf354d8b05e5393&scene=21)

[MOSN 文档使用指南](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247507103&idx=1&sn=e8da41af0ceaa18ae13f31ca2905da8e&chksm=faa33345cdd4ba5397a43adfe8cabdc85321d3f9f14066c470885b41e2f704ec505a9f086cec&scene=21)

[MOSN 社区性能分析利器——Holmes 原理浅析](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247504968&idx=1&sn=4f7034cd1732860e3ca6b808f6ad7d53&chksm=faa33b92cdd4b28471859a646f1eb8be8db65853711aedbdb1cd9932f6fce89939036074527a&scene=21)

欢迎扫码关注：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7091a7c36cec45f292225f4e9c92161e~tplv-k3u1fbpfcp-zoom-1.image)
