---
title: "SOFA Weekly | 新年礼包已就位、本周 Contributor & QA"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly | 新年礼包已就位、本周 Contributor & QA"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2022-12-23T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ"
---

## SOFA WEEKLY | 每周精选

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1e08fca65f7643c783d33f590bb41d5a~tplv-k3u1fbpfcp-zoom-1.image)

**筛选每周精华问答，同步开源进展，欢迎留言互动～**

**SOFA**Stack（**S**calable **O**pen **F**inancial **A**rchitecture Stack）是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

**SOFAStack 官网:** *[https://www.sofastack.tech](https://www.sofastack.tech)*

**SOFAStack:** *[https://github.com/sofastack](https://github.com/sofastack)*

### SOFAStack 社区本周贡献

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*SuOjTbieSIUAAAAAAAAAAAAADrGAAQ/original)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动

我们会筛选重点问题通过 

" SOFA WEEKLY " 的形式回复

**1. 小白**

>SOFAArk 可以把 2 个端口不一样的 Spring Boot 微服务合并到一起部署吗？比如一个是 8080 另一个端口是 8081，2 个服务都有各自的接口， 合并部署后还可以通过对应的端口来进行访问嘛？

A：不使用 Web-Ark-Plugin 插件，每个模块会启动新的 Tomcat 实例，可以让服务用不同的 port。

**「SOFAArk」**：*[https://github.com/sofastack/sofa-ark](https://github.com/sofastack/sofa-ark)*

**2. 肖文璧 提问** 

>Seata 对 Java17 的版本有支持吗？

A：A：需要 v1.6.0 版本。

**「Seata」**：*[https://github.com/seata/seata](https://github.com/seata/seata)*

### 本周推荐阅读

[Nerdctl 原生支持 Nydus 加速镜像](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247521257&idx=1&sn=38ffb30b7967e37d52862af7c2199d68&chksm=faa37c33cdd4f525dcf147a971d77588e985700fc43de4f1b982e98a439a4a2d5cd3dfbafcdf&scene=21)

[SOFARegistry | 大规模集群优化实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247517005&idx=1&sn=685cea90982f8ecec5ffc56880d63175&chksm=faa36c97cdd4e58163830407bd827838f6ecb0a5b0e22130b507141fe9a24b2e645666fc0571&scene=21)

[降本增效: 蚂蚁在 Sidecarless 的探索和实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247517989&idx=1&sn=1b49b68c9281d0c2514fa4caa38284fb&chksm=faa368ffcdd4e1e9fa5361d6ea376bbc426272c7a32250cc67ae27dcd84a6113b4a016a1518d&scene=21)

[如何看待 Dapr、Layotto 这种多运行时架构？](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247510516&idx=1&sn=eff21915cd0ac1a8c8e3f126b549a605&chksm=faa3462ecdd4cf38ab6ab0c7201902fb53d54cea4865f9b7d7cdcdc7eaa00cf354d8b05e5393&scene=21)

欢迎扫码关注：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e19d0a6d7f734ad6a585cde82ae4f3bf~tplv-k3u1fbpfcp-zoom-1.image)
