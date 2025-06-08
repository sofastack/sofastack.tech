---
title: "SOFA Weekly | C 位大咖说、本周 QA、本周 Contributor"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly | C 位大咖说、本周 QA、本周 Contributor"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2022-09-16T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ"
---

## SOFA WEEKLY | 每周精选

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1e08fca65f7643c783d33f590bb41d5a~tplv-k3u1fbpfcp-zoom-1.image)

**筛选每周精华问答，同步开源进展，欢迎留言互动～**

**SOFA**Stack（**S**calable **O**pen **F**inancial **A**rchitecture Stack）是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

**SOFAStack 官网:** *[https://www.sofastack.tech](https://www.sofastack.tech)*

**SOFAStack:** *[https://github.com/sofastack](https://github.com/sofastack)*

### SOFAStack 社区本周 Contributor

![图片](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*dI-eSpjt_Y0AAAAAAAAAAAAAARQnAQ)

### 每周读者问答提炼

***欢迎大家向公众号留言提问或在群里与我们互动，我们会筛选重点问题通过 " SOFA WEEKLY " 的形式回复***

**1.杜鑫** 提问：

>想问下 MOSN 的基于 Go plugin 实现的插件机制，有相关文档介绍嘛，源码大概在哪个部分呀？想接入下试试。

A：有好几种，有 Go plugin 独立进程的，有 Go so 编译的，我发你文档先看看。

>这个看啦，我看文档里说 so 的方式还在 beta，没有详细介绍，想了解下 so 方式的介绍。

A：so 的，我们最近有位同学才分享了，干货满满：[https://mp.weixin.qq.com/s/VAYrtYBdzvcAOa7G_cMZRg](https://mp.weixin.qq.com/s/VAYrtYBdzvcAOa7G_cMZRg) ，这里有个 demo，[https://github.com/mosn/mosn/tree/master/examples/cn_readme/mosn-extensions](https://github.com/mosn/mosn/tree/master/examples/cn_readme/mosn-extensions) 以及一些插件的实现，[https://github.com/mosn/extensions/tree/master/go-plugin](https://github.com/mosn/extensions/tree/master/go-plugin)

**「MOSN」**：*[https://github.com/mosn/mosn/](https://github.com/mosn/mosn/)*

**2.林楠** 提问：

>有一个问题，动态部署时报找不到 CommonLoggingApplicationListener 类，这个类在基座中有这个类 [https://github.com/sofastack/sofa-ark/issues/561](https://github.com/sofastack/sofa-ark/issues/561)

A：说明这个类没有成功委托给基座加载，可以断下 BizClassLoader.loadClassInternal 方法，看下模块类加载的寻找过程。

**「SOFAArk」**：*[https://github.com/sofastack/sofa-ark](https://github.com/sofastack/sofa-ark)*

### 本周推荐阅读

[MOSN｜Go 原生插件使用问题全解析](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247512138&idx=1&sn=851abb8d07d47f703e33978c9c125c59&chksm=faa35f90cdd4d6869c6cd4934c042484dbe1063c3fb85462d2f33e936b96240ae33d02d18c3a&scene=21)

[Go 内存泄漏，pprof 够用了么？](https://mp.weixin.qq.com/s/Br8iPafpfaSD8_oBJ4bUPw)

[如何看待 Dapr、Layotto 这种多运行时架构？](https://mp.weixin.qq.com/s/dmvx6rGSMkrurGWSVDHkMw)

[SOFAServerless 助力业务极速研发](https://mp.weixin.qq.com/s/s_qL4QoH4yrp2HMCcsuPBw)

欢迎扫码关注：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e19d0a6d7f734ad6a585cde82ae4f3bf~tplv-k3u1fbpfcp-zoom-1.image)
