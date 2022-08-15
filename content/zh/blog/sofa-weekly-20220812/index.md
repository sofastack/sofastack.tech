---
title: "SOFA Weekly | SOFARPC 5.8.6 版本发布、Meetup 合肥站、本周 Contributor & QA"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly | SOFARPC 5.8.6 版本发布、Meetup 合肥站、本周 Contributor & QA"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2022-08-12T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ"
---

## SOFA WEEKLY | 每周精选

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1e08fca65f7643c783d33f590bb41d5a~tplv-k3u1fbpfcp-zoom-1.image)

**筛选每周精华问答，同步开源进展，欢迎留言互动～**

**SOFA**Stack（**S**calable **O**pen **F**inancial **A**rchitecture Stack）是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

**SOFAStack 官网:** *[https://www.sofastack.tech](https://www.sofastack.tech)*

**SOFAStack:** *[https://github.com/sofastack](https://github.com/sofastack)*

### SOFAStack 社区本周 Contributor

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/06b67548218b4373bc43079c87e43442~tplv-k3u1fbpfcp-zoom-1.image)

### 每周读者问答提炼
欢迎大家向公众号留言提问或在群里与我们互动我们会筛选重点问题通过 " SOFA WEEKLY " 的形式回复

**1. 信广健** 提问：

>经过十分曲折的故事了解到了 Layotto ， 进群后想看看后续发展，有什么好的文档可以学习下吗？

A：目前还在活跃开发中，可以看下 *https://github.com/mosn/layotto* 了解下，相关的文档也在 *https://mosn.io/layotto/*

**「Layotto」**：*https://github.com/mosn/layotto*

**2. 清源** 提问：

>现在 MOSN 除了适配 XDS 做到动态规则下发之外？有没有其他的动态规则下发办法？

A：你可以自己实现的，XDS 也是调用 MOSN 的更新 API。

**「MOSN」**：*https://github.com/mosn/mosn*

**3. 樊志超** 提问：

>问一下，MOSN 与业务容器间的信息交互是采用 socket 方式吗？

A：这个看你怎么用了，自己选择。

>默认的是哪种方式呢？

A：TCP、UDS 都可以。

**「MOSN」**：*https://github.com/mosn/mosn*

### SOFARPC 5.8.6 版本发布

**SOFARPC 5.8.6 是一个功能优化、Bug 修复版本，建议使用 5.7.10 ~ 5.8.5 版本的用户都升级到 5.8.6。**

主要变更如下：

**- 功能优化：**

1.支持用户自定义 tracer 中 callerAppName

2.添加 DomainRegistry 订阅域名数据, 支持 direct url 功能

**- BUG 修复：**

1.修复了 Triple 协议在多 classLoader 环境下的序列化问题

**详细发布报告**：*https://github.com/sofastack/sofa-rpc/releases/tag/v5.8.6*

### 本周推荐阅读

蚂蚁开源：开放自研核心基础软件技术，携手探索技术高地

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/089538937f3e4d4e97cf8dfb33a791fa~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247514122&idx=1&sn=31668849c1b3fe718a0bea56bbdeb6b9&chksm=faa357d0cdd4dec6de2aec4b580dd0c6b461879a6a5dcfee11ea29e6f0cb10920776394ce010&scene=21)

Go 原生插件使用问题全解析

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e27b3c6a87ac471483076b38a67a52ea~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247512138&idx=1&sn=851abb8d07d47f703e33978c9c125c59&chksm=faa35f90cdd4d6869c6cd4934c042484dbe1063c3fb85462d2f33e936b96240ae33d02d18c3a&scene=21)

MOSN 反向通道详解

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d2cdf9e232c8482d9c0174835d7d9057~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247513902&idx=1&sn=be00c5af2e9775a4039430bf187e16f4&chksm=faa358f4cdd4d1e23d7e9c93b4a94d6e6c377f51eb5e96b6dd5f74b840e48ebd3f518c4bf80a&scene=21)

如何看待 Dapr、Layotto 这种多运行时架构

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/991aea2913904a519eb83b294cbe6a45~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247510516&idx=1&sn=eff21915cd0ac1a8c8e3f126b549a605&chksm=faa3462ecdd4cf38ab6ab0c7201902fb53d54cea4865f9b7d7cdcdc7eaa00cf354d8b05e5393&scene=21)

欢迎扫码关注：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7091a7c36cec45f292225f4e9c92161e~tplv-k3u1fbpfcp-zoom-1.image)
