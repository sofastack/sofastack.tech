---
title: "SOFA Weekly | Go 代码城市、本周 Contributor & QA"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly | Go 代码城市、本周 Contributor & QA"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2022-09-09T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ"
---

## SOFA WEEKLY | 每周精选

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1e08fca65f7643c783d33f590bb41d5a~tplv-k3u1fbpfcp-zoom-1.image)

**筛选每周精华问答，同步开源进展，欢迎留言互动～**

**SOFA**Stack（**S**calable **O**pen **F**inancial **A**rchitecture Stack）是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

**SOFAStack 官网:** *[https://www.sofastack.tech](https://www.sofastack.tech)*

**SOFAStack:** *[https://github.com/sofastack](https://github.com/sofastack)*

### SOFAStack 社区本周 Contributor

![图片](https://img.alicdn.com/imgextra/i4/O1CN01ay1RZb1jLFLuJ6wFy_!!6000000004531-2-tps-1080-1920.png)

### 每周读者问答提炼

***欢迎大家向公众号留言提问或在群里与我们互动，我们会筛选重点问题通过"SOFA WEEKLY"的形式回复***

**1.我是一个小胖子** 提问：

> MOSN 现在是已经完整支持 xDS 协议了吗？

A：支持 istio1.10。

> 如果要支持 istio1.14 是需要重新适配吗？还是说有其他简化的方式？

A：是需要适配下的，主要看新增了多少改动。

**「MOSN」**：*https://github.com/mosn/mosn/*

**2.林楠** 提问：

> 关在 uninstall biz 包的时候，没有从内嵌 Tomcat 卸载掉，接口仍能访问。看到 demo 中的提示是由于未注册 BeforeBizStopEvent，所以不具备动态卸载能力。想问下 SOFAArk 是否有计划做 Tomcat 的动态卸载，如果想自行实现的话，是不是调用 ArkTomcatWebServer 实例的 stop 方法就能够实现动态卸载？

A：Spring Boot 模块没有动态卸载能力：*https://github.com/sofastack/sofa-ark/issues/554#issuecomment-1207183454*

**「SOFAArk」**：*https://github.com/sofastack/sofa-ark*

### 本周推荐阅读

[MOSN｜Go 原生插件使用问题全解析](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247512138&idx=1&sn=851abb8d07d47f703e33978c9c125c59&chksm=faa35f90cdd4d6869c6cd4934c042484dbe1063c3fb85462d2f33e936b96240ae33d02d18c3a&scene=21)

[社区文章｜MOSN 反向通道详解](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247510516&idx=1&sn=eff21915cd0ac1a8c8e3f126b549a605&chksm=faa3462ecdd4cf38ab6ab0c7201902fb53d54cea4865f9b7d7cdcdc7eaa00cf354d8b05e5393&scene=21)

[MOSN 文档使用指南](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247507103&idx=1&sn=e8da41af0ceaa18ae13f31ca2905da8e&chksm=faa33345cdd4ba5397a43adfe8cabdc85321d3f9f14066c470885b41e2f704ec505a9f086cec&scene=21)

[SOFAServerless 助力业务极速研发](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247508394&idx=1&sn=280fad012f3e78765d1a63acac53ac6b&chksm=faa34e70cdd4c7662c183fc1188f8162a6c421e9bb781ef887dba917364281fc16d57e11c42c&scene=21)

欢迎扫码关注：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e19d0a6d7f734ad6a585cde82ae4f3bf~tplv-k3u1fbpfcp-zoom-1.image)
