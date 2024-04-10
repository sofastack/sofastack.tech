---
title: "SOFA Weekly | 开源人-于雨、本周 QA、本周 Contributor"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly | 开源人-于雨、本周 QA、本周 Contributor"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2022-06-24T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ"

---

SOFAStack（Scalable Open Financial Architecture Stack)是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

SOFAStack 官网: [https://www.sofastack.tech](https://www.sofastack.tech/)

SOFAStack: [https://github.com/sofastack](https://github.com/sofastack)

### SOFAStack 社区本周 Contributor 

![weekly.jpg](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/81221d08a1e54ccd8b0847c8d9932fc9~tplv-k3u1fbpfcp-zoom-1.image)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动，我们会筛选重点问题，通过 " SOFA WEEKLY " 的形式回复

1.@魏顺利 提问：

> runtime-sofa-boot-starter 和 rpc-sofa-boot-starter 区别是什么？

A：runtime-sofa-boot-starter 是 SOFA 的核心能力 starter，rpc-sofa-boot-starter 是 SOFARPC 能力的 starter。

「SOFABoot」：[https://github.com/sofastack/sofa-boot](https://github.com/sofastack/sofa-boot)

2.@寒鸦少年 提问：

> 请问 Plugin 是一个微服务的概念吗，是否提供 HTTP 接口呢？

A：Plugin 自己管理的依赖，通过 ark 中提到的 导出机制，将其自己管理的类能够暴露给 biz 使用 *（多 biz 可以共享某个 plugin 导出的类）* ；plugin 和 biz 之间更多说的是类加载的委托关系，biz 之间是通信。

> 那 biz 的 class loader 的加载逻辑应该很复杂吧，因为它要区分什么类自己加载，什么类委托 plugin 加载。

A：可以看下这个，*[https://www.sofastack.tech/projects/sofa-boot/sofa-ark-migration-guide/](https://www.sofastack.tech/projects/sofa-boot/sofa-ark-migration-guide/)*

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a469d3145e1c4f1da0babf360e345543~tplv-k3u1fbpfcp-zoom-1.image)

「SOFAArk」[https://github.com/sofastack/sofa-ark](https://github.com/sofastack/sofa-ark)

### 本周推荐阅读

- 社区文章｜MOSN 构建 Subset 优化思路分享

[![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ef719407100b44a2bc79a4bf7773e17f~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247511573&idx=1&sn=86019e1570b797f0d4c7f4aa2bcf2ad3&chksm=faa341cfcdd4c8d9aea24212d29c31f2732ec88ee65271703d2caa96dabc114e873f975fec8f&scene=21)

- SOFA 星球”闯关计划 2.0——Layotto 飞船焕新出发

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/eb25ccf615d2488faaf2c44a964bb1f2~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247511173&idx=1&sn=42ef288272494dd294f14af454e0cb6d&chksm=faa3435fcdd4ca495c5c27e6ef8b5d241ab012d24364e0adfc4eb8a596fb928c4f3aeae508d0&scene=21)

- Nydus —— 下一代容器镜像的探索实践

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8db66a2a6bfb45dfa5aca0cc4492c770~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247510940&idx=1&sn=b545e0836a6182abddd13a05b2f90ba9&chksm=faa34446cdd4cd50a461f071cdc4d871bd6eeef2318a2ec73968c117b41740a56a296c726aee&scene=21)

- GLCC 首届编程夏令营｜欢迎报名 Layotto、KusionStack、Nydus、Kata Containers

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/04f4b8844106499f8c0a4395601eb319~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247510027&idx=1&sn=43a8f240d7edd036307d0f1fdd616714&chksm=faa347d1cdd4cec7adf7762963a94617060d96decba99beffb44d5f940e5a7f076b0844c4ab0&scene=21)

更多文章请扫码关注“金融级分布式架构”公众号

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/60b9e97715b942ceac9fda038437e814~tplv-k3u1fbpfcp-zoom-1.image)
