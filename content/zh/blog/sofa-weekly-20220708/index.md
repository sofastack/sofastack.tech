---
title: "SOFA Weekly | C 位大咖说、本周 QA、本周 Contributor"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly | C 位大咖说、本周 QA、本周 Contributor"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2022-07-08T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ"
---

## SOFA WEEKLY | 每周精选

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1e08fca65f7643c783d33f590bb41d5a~tplv-k3u1fbpfcp-zoom-1.image)

**筛选每周精华问答，同步开源进展，欢迎留言互动～**

**SOFA**Stack（**S**calable **O**pen **F**inancial **A**rchitecture Stack）是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

**SOFAStack 官网:** *[https://www.sofastack.tech](https://www.sofastack.tech)*

**SOFAStack:** *[https://github.com/sofastack](https://github.com/sofastack)*

### SOFAStack 社区本周 Contributor

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/31a2cb606bc94f41b018a2b47df8c95e~tplv-k3u1fbpfcp-zoom-1.image)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动我们会筛选重点问题通过 " SOFA WEEKLY " 的形式回复

**1. 何烨** 提问：

>请问一下这个配置现在支持 Nacos 了吗？

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/16d02a814f4448b693a0f9b2c184957a~tplv-k3u1fbpfcp-zoom-1.image)

A：SOFABoot 已经支持 Nacos 了。

**「SOFABoot」：** *[https://github.com/sofastack/sofa-boot](https://github.com/sofastack/sofa-boot)*

**2. 鲍之知** 提问：

>下图中这个 SOFATracer 日志默认是生成在哪里呀？

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fd6d2926b64742c6b10b0a714feff0ed~tplv-k3u1fbpfcp-zoom-1.image)

A：~/logs。

**「SOFATracer」：** *[https://github.com/sofastack/sofa-tracer](https://github.com/sofastack/sofa-tracer)*

**3. Philip Guan** 提问：

>请问 biz 可以独立引入 master biz 中没有的依赖吗？例如 Hutool、master biz 没有，希望在 biz 里使用。

A：可以的，打包完后可以 check 一下是否 /biz/ 里有这个包。如果没有的话，可以在 master biz 里引入这个依赖，在 biz 里引入但设置 <scope> 为 provided 也可以使用。

>期望是 master biz 不引入 Hutool 的情况下，在 biz 里使用 Hutool。

A：可以的。

**「SOFAArk」：** *[https://github.com/sofastack/sofa-ark](https://github.com/sofastack/sofa-ark)*

### 本周推荐阅读

- KusionStack 开源有感｜历时两年，打破“隔行如隔山”困境

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b4d1da132a824a05852964b81ee7aa29~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247510766&idx=1&sn=16d7ab76854829ee64211dd6b9f6915c&chksm=faa34534cdd4cc223422efda8872757cb2deb73d22fe1067e9153d4b4f28508481b85649e444&scene=21)

- GLCC｜Kata Containers、Nydus、Layotto、KusionStack 中选名单公示！

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4959650fcf454cf6a81c004a4804b5d0~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247512057&idx=1&sn=187009d258fb584e70f7bd232bff57a9&chksm=faa34023cdd4c935ea09be2c6d309ed07c4d979fae841182c55740cddadc6c8c69de32922e70&scene=21)

- SOFARegistry 源码｜数据同步模块解析

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/82377034a83544d3b56a909ab4a30569~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247511796&idx=1&sn=14045ed1b3e634061e719ef434816abf&chksm=faa3412ecdd4c83808c5945af56558fe157395b21bc0d56665e102edb92316c6f245f94d306c&scene=21)

- 社区文章｜MOSN 构建 Subset 优化思路分享

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c266735a2167495d959fb9c77355dcf6~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247511573&idx=1&sn=86019e1570b797f0d4c7f4aa2bcf2ad3&chksm=faa341cfcdd4c8d9aea24212d29c31f2732ec88ee65271703d2caa96dabc114e873f975fec8f&scene=21)

更多文章请扫码关注“金融级分布式架构”公众号

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4c2863f0dee84912908961cfb90b939d~tplv-k3u1fbpfcp-zoom-1.image)
