---
title: "SOFA Weekly | Meetup 广州站参会指南、本周 QA、本周 Contributor"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly | Meetup 广州站参会指南、本周 QA、本周 Contributor"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2022-08-05T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ"
---

## SOFA WEEKLY | 每周精选

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1e08fca65f7643c783d33f590bb41d5a~tplv-k3u1fbpfcp-zoom-1.image)

**筛选每周精华问答，同步开源进展，欢迎留言互动～**

**SOFA**Stack（**S**calable **O**pen **F**inancial **A**rchitecture Stack）是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

**SOFAStack 官网:** *[https://www.sofastack.tech](https://www.sofastack.tech)*

**SOFAStack:** *[https://github.com/sofastack](https://github.com/sofastack)*

### SOFAStack 社区本周 Contributor

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9bebad7229b9454b8e0b135e043714af~tplv-k3u1fbpfcp-zoom-1.image)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动我们会筛选重点问题通过 " SOFA WEEKLY " 的形式回复

**1. 吴宇奇** 提问：

> 请问下，Bolt 协议里面的这个 cmdCode，除了心跳、request、response，还有别的用法吗？
![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7aab0097fa244d0ba7f0b5584677a748~tplv-k3u1fbpfcp-zoom-1.image)

A：举个例子，新增 goaway 扩展。*[https://github.com/sofastack/sofa-bolt/issues/278](https://github.com/sofastack/sofa-bolt/issues/278)*

**「SOFABolt」**：*[https://github.com/sofastack/sofa-bolt](https://github.com/sofastack/sofa-bolt)*

**2. bobtthp** 提问：

> 大佬们问下动态路由这块，有 example 可以看看嘛？
![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/02ddb6b7c1ee45b089990cc6ee1c97a8~tplv-k3u1fbpfcp-zoom-1.image)

A：这篇文章就是例子哟，*[https://mosn.io/blog/posts/how-use-dynamic-metadata/#%E5%8A%A8%E6%80%81%E8%B7%AF%E7%94%B1-cluster](https://mosn.io/blog/posts/how-use-dynamic-metadata/#%E5%8A%A8%E6%80%81%E8%B7%AF%E7%94%B1-cluster)* ，原理就是 route 的配置是变量，然后 streamfilter 根据业务逻辑修改这个变量的值，很方便试试。

> 好的，这个我有一个疑问。这个变量如何注入进去呢？我理解应该每一个节点的变量都不一样嘛？还有一个疑问是，如果需要和配置中心交互这块是怎么做的，可以借鉴一下吗？

A：变量就是 streamfilter 模块分配的，然后他来设置这个变量的值，值就是 cluster 的名字；后面那个问题指的是 cluster host 的更新吗？

> 指的是如果需要外部的配置中心那可能需要监听配置的动态变化；第一个这块我好像没理解好，我举个例子：如果是多个应用，那是不是我要设置多个变量？

A：比如你 A 应用的 cluster 名字是 A，B 应用的 cluster 名字是 B， 那么这个变量只需要一个，只是 value 你可以根据逻辑设置为 A 或者 B。

这个就是一些复杂的路由场景，用配置不能表达，就可以用代码的方式来做这个事。我们内部的一些复杂路由场景也是这样做的。

**「MOSN」**：*[https://github.com/mosn/mosn](https://github.com/mosn/mosn)*

### 本周推荐阅读

云原生 Meetup 广州站，等你来！

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8343a98f62524b508cf04f43b016b6a1~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247513017&idx=1&sn=918d92c4641e89e53d8d63816b081516&chksm=faa35c63cdd4d575ff1eda27785b6025df2b129eff88072a2912afe2e8ae1f4c8f11b77bbe9a&scene=21)

Go 原生插件使用问题全解析

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8bd6589b20424bcab1d715e055b183e1~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247512138&idx=1&sn=851abb8d07d47f703e33978c9c125c59&chksm=faa35f90cdd4d6869c6cd4934c042484dbe1063c3fb85462d2f33e936b96240ae33d02d18c3a&scene=21)

MOSN 反向通道详解

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/624f32532ead4dd2af955568d88ac88d~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247513902&idx=1&sn=be00c5af2e9775a4039430bf187e16f4&chksm=faa358f4cdd4d1e23d7e9c93b4a94d6e6c377f51eb5e96b6dd5f74b840e48ebd3f518c4bf80a&scene=21)

KusionStack｜Kusion 模型库和工具链的探索实践

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6ee6c5297fa148aba6e5e33afa749dd7~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247512283&idx=1&sn=b1a6218e9c396749846baaa9b6b38a2d&chksm=faa35f01cdd4d6177f00938c93b0c652533da148e5ecb888280205525f0e89e4636d010b64ee&scene=21)

欢迎扫码关注公众号：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0fc902534709497790cfb2f8097329bf~tplv-k3u1fbpfcp-zoom-1.image)
