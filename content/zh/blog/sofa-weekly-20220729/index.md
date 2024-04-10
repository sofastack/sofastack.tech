---
title: "SOFA Weekly | Meetup 广州站、本周 QA、本周 Contributor"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly | Meetup 广州站、本周 QA、本周 Contributor"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2022-07-29T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ"
---

## SOFA WEEKLY | 每周精选

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1e08fca65f7643c783d33f590bb41d5a~tplv-k3u1fbpfcp-zoom-1.image)

**筛选每周精华问答，同步开源进展，欢迎留言互动～**

**SOFA**Stack（**S**calable **O**pen **F**inancial **A**rchitecture Stack）是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

**SOFAStack 官网:** *[https://www.sofastack.tech](https://www.sofastack.tech)*

**SOFAStack:** *[https://github.com/sofastack](https://github.com/sofastack)*

### SOFAStack 社区本周 Contributor

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c73953cec00844cbb22ecf63358c00ae~tplv-k3u1fbpfcp-zoom-1.image)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动我们会筛选重点问题通过 " SOFA WEEKLY " 的形式回复

**1. bobtthp** 提问：

> 请教下 MOSN 转发 HTTP/2 协议，listener filter 和 router match 两个部分要怎么写呀？

A：就用这个 exmple 就行了。

*[https://github.com/mosn/mosn/blob/master/configs/mosn_config_dev.json](https://github.com/mosn/mosn/blob/master/configs/mosn_config_dev.json)*

「MOSN」：*[https://github.com/mosn/mosn](https://github.com/mosn/mosn)*

**2. 黄大宇** 提问：

> Biz 版本更新时，如果不卸载旧版本，安装新版本时会报 webContextPath 冲突异常。比如现在运行 1.0.0，而我要升级到 2.0.0，那么能否先安装 2.0.0，然后再切换，再把 1.0.0 卸载。目前是这一过程出现了 webContextPath 冲突的问题。

A：有两种解法，一种是让流量走宿主，然后分发给 Biz。另一种是 context path 挂钩版本，调用时带上版本，类似 v1，v2 这样。

「SOFAArk」：*[https://github.com/sofastack/sofa-ark](https://github.com/sofastack/sofa-ark)*

**3. 黄润良** 提问：

> Cluster Manager 这块配置，如果要实现动态配置，有没有什么最佳实践之类的？MOSN 有开放 API 或者接入配置中心的案例吗？

A：直接使用 XDS 协议就行了，获取你也可以直接调用 MOSN 的 API，这里有个 ZK 的例子：

*[https://github.com/mosn/mosn/tree/master/pkg/upstream/servicediscovery/dubbod](https://github.com/mosn/mosn/tree/master/pkg/upstream/servicediscovery/dubbod)*

「MOSN」：*[https://github.com/mosn/mosn](https://github.com/mosn/mosn)*

### 本周推荐阅读

Go 原生插件使用问题全解析

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/73b7f85cff8d4a89b14d6d7aeae5c335~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247512138&idx=1&sn=851abb8d07d47f703e33978c9c125c59&chksm=faa35f90cdd4d6869c6cd4934c042484dbe1063c3fb85462d2f33e936b96240ae33d02d18c3a&scene=21)

SOFARegistry 源码｜数据同步模块解析

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1d2e1dcf97454e229f5e80e45992e88d~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247511796&idx=1&sn=14045ed1b3e634061e719ef434816abf&chksm=faa3412ecdd4c83808c5945af56558fe157395b21bc0d56665e102edb92316c6f245f94d306c&scene=21)

SOFAServerless 助力业务极速研发

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/60a3b7fcd9074ea58f4ba28b75741777~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247508394&idx=1&sn=280fad012f3e78765d1a63acac53ac6b&chksm=faa34e70cdd4c7662c183fc1188f8162a6c421e9bb781ef887dba917364281fc16d57e11c42c&scene=21)

Seata 在蚂蚁国际银行业务落地实践

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/06b70be069f749aa95f6b290a5c6988c~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247512945&idx=1&sn=006cc63f41c96a73b60ea7a11477310d&chksm=faa35cabcdd4d5bd910d44550bda12642de3baa61eea1a7c966387d53ca62afa63cc9f76ad66&scene=21)

欢迎扫码关注公众号：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0fc902534709497790cfb2f8097329bf~tplv-k3u1fbpfcp-zoom-1.image)
