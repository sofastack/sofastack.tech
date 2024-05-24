---
title: "SOFA Weekly | C 位大咖说、本周 QA、本周 Contributor"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly | C 位大咖说、本周 QA、本周 Contributor"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2022-06-17T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ"

---

SOFAStack（Scalable Open Financial Architecture Stack)是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

SOFAStack 官网: [https://www.sofastack.tech](https://www.sofastack.tech/)

SOFAStack: [https://github.com/sofastack](https://github.com/sofastack)

### SOFAStack 社区本周 Contributor

![weekly.jpg](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/17764c1678824772bb81d5dcb77694da~tplv-k3u1fbpfcp-zoom-1.image)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动，我们会筛选重点问题，通过 " SOFA WEEKLY " 的形式回复

1.@魏顺利 提问：

> 生成的 ark-biz.jar 这个怎么打到 maven 仓库？

A：加上<attach>true</attach>配置然后 mvn install/deploy，参考：

[https://www.sofastack.tech/projects/sofa-boot/sofa-ark-ark-biz/](https://www.sofastack.tech/projects/sofa-boot/sofa-ark-ark-biz/)

「SOFAArk」：[https://github.com/sofastack/sofa-ark](https://github.com/sofastack/sofa-ark)

2.@寒鸦少年 提问：

> 请教个问题，SOFAStack 商业版里面，SOFABoot 在集成中间件的时候，中间件的客户端咱这边有自己封装的版本，还是纯走开源的那些客户端比如 Jedis 之类的。

A：SOFAStack 有些中间件会有自己的封装，也会有独立的客户端。

> 可以给个列表么，具体有哪些独立的客户端和开源版本的升级点对比之类的？

A：可以看下这个：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4f4329e9ac79467f8d3ffec28c7ce7da~tplv-k3u1fbpfcp-zoom-1.image)

「SOFABoot」[https://github.com/sofastack/sofa-boot](https://github.com/sofastack/sofa-boot)

### 本周推荐阅读

- 「开源之夏」SOFASTack & MOSN 社区项目中选结果

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/75baa076b23845ce8d63a3ed9ac0e126~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247511279&idx=1&sn=4d831229eee252064b4d940b2080d424&chksm=faa34335cdd4ca233573b12f5fc7e8b22a4e14a5ad003856fe246f7f6991645f774c590becb5&scene=21)

- SOFA 星球”闯关计划 2.0——Layotto 飞船焕新出发

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/eb25ccf615d2488faaf2c44a964bb1f2~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247511173&idx=1&sn=42ef288272494dd294f14af454e0cb6d&chksm=faa3435fcdd4ca495c5c27e6ef8b5d241ab012d24364e0adfc4eb8a596fb928c4f3aeae508d0&scene=21)

- Nydus —— 下一代容器镜像的探索实践

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8db66a2a6bfb45dfa5aca0cc4492c770~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247510940&idx=1&sn=b545e0836a6182abddd13a05b2f90ba9&chksm=faa34446cdd4cd50a461f071cdc4d871bd6eeef2318a2ec73968c117b41740a56a296c726aee&scene=21)

- GLCC 首届编程夏令营｜欢迎报名 Layotto、KusionStack、Nydus、Kata Containers

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/04f4b8844106499f8c0a4395601eb319~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247510027&idx=1&sn=43a8f240d7edd036307d0f1fdd616714&chksm=faa347d1cdd4cec7adf7762963a94617060d96decba99beffb44d5f940e5a7f076b0844c4ab0&scene=21)

更多文章请扫码关注“金融级分布式架构”公众号

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/60b9e97715b942ceac9fda038437e814~tplv-k3u1fbpfcp-zoom-1.image)
