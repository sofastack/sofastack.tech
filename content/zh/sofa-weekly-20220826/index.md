---
title: "SOFA Weekly | MOSN v1.1.0 版本发布、C 位大咖说、本周 Contributor & QA"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly | MOSN v1.1.0 版本发布、C 位大咖说、本周 Contributor & QA"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2022-08-26T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ"
---

## SOFA WEEKLY | 每周精选

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1e08fca65f7643c783d33f590bb41d5a~tplv-k3u1fbpfcp-zoom-1.image)

**筛选每周精华问答，同步开源进展，欢迎留言互动～**

**SOFA**Stack（**S**calable **O**pen **F**inancial **A**rchitecture Stack）是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

**SOFAStack 官网:** *[https://www.sofastack.tech](https://www.sofastack.tech)*

**SOFAStack:** *[https://github.com/sofastack](https://github.com/sofastack)*

**SOFAStack 社区本周 Contributor**

![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*1vP6T4tTWncAAAAAAAAAAAAAARQnAQ)

**每周读者问答提炼**

欢迎大家向公众号留言提问或在群里与我们互动,我们会筛选重点问题通过 " SOFA WEEKLY " 的形式回复

**1. 孙春明** 提问：

>请问这个 mosnd 是做什么的？我如果想重新做 mosnio/proxyv2:v1.0.0-1.10.6 镜像，需要怎么处理呢？

![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*hsZEQL7rsygAAAAAAAAAAAAAARQnAQ)

A：这个 mosnd 只是 mosn 的拷贝，可以看下这个文档：[https://mosn.io/docs/user-guide/start/istio/#mosn-%E4%B8%8E-istio-%E7%9A%84-proxyv2-%E9%95%9C%E5%83%8F-build-%E6%96%B9%E6%B3%95](https://mosn.io/docs/user-guide/start/istio/#mosn-%E4%B8%8E-istio-%E7%9A%84-proxyv2-%E9%95%9C%E5%83%8F-build-%E6%96%B9%E6%B3%95)

**「MOSN」**：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

**2. 胡** 提问：

>请问这边有现成用 SOFAStack 搭建的框架包吗，内容涉及 SOFABoot、SOFARegistry、SOFARPC 的？

A：现成的框架包的话，你可以从 SOFABoot 开始，参考这个：[https://www.sofastack.tech/projects/sofa-boot/quick-start/](https://www.sofastack.tech/projects/sofa-boot/quick-start/)

**「SOFABoot」**：[https://github.com/sofastack/sofa-boot](https://github.com/sofastack/sofa-boot)

**「SOFARegistry」**： [https://github.com/sofastack/sofa-registry](https://github.com/sofastack/sofa-registry)

**「SOFARPC」**：[https://github.com/sofastack/sofa-rpc](https://github.com/sofastack/sofa-rpc)

**MOSN v1.1.0 版本发布**

**发布 MOSN v1.1.0 版本，主要变更如下：**

1. 支持反向建连，云边互联场景，细节可以参考博客： [https://mosn.io/blog/posts/mosn-tunnel/](https://mosn.io/blog/posts/mosn-tunnel/)

2. 支持自定义 xDS 解析扩展

3. trace 支持 zipkin 扩展

4. 优化创建 subset 负载均衡的算法，降低内存占用

**详细发布报告**：[https://github.com/mosn/mosn/blob/master/CHANGELOG_ZH.md](https://github.com/mosn/mosn/blob/master/CHANGELOG_ZH.md)

**本周推荐阅读**

[MOSN 构建 Subset 优化思路分享](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247511573&idx=1&sn=86019e1570b797f0d4c7f4aa2bcf2ad3&chksm=faa341cfcdd4c8d9aea24212d29c31f2732ec88ee65271703d2caa96dabc114e873f975fec8f&scene=21#wechat_redirect)

[MOSN 1.0 发布，开启新架构演进](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247506881&idx=1&sn=b61b931c11c83d3aceea93a90bbe8c5d&chksm=faa3341bcdd4bd0d1fb1348c99e7d38be2597dcb6767a68c69149d954eae02bd39bc447e521f&scene=21#wechat_redirect)

[MOSN 社区性能分析利器——Holmes 原理浅析](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247504968&idx=1&sn=4f7034cd1732860e3ca6b808f6ad7d53&scene=21#wechat_redirect)

[MOSN 反向通道详解](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247513902&idx=1&sn=be00c5af2e9775a4039430bf187e16f4&chksm=faa358f4cdd4d1e23d7e9c93b4a94d6e6c377f51eb5e96b6dd5f74b840e48ebd3f518c4bf80a&scene=21#wechat_redirect)

**欢迎扫码关注**

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7091a7c36cec45f292225f4e9c92161e~tplv-k3u1fbpfcp-zoom-1.image)
