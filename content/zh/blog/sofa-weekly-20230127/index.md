---
title: "SOFA Weekly | SOFANews、本周贡献 & issue 精选"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly | SOFANews、本周贡献 & issue 精选"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2023-01-27T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ"
---

## SOFA WEEKLY | 每周精选

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1e08fca65f7643c783d33f590bb41d5a~tplv-k3u1fbpfcp-zoom-1.image)

**筛选每周精华问答，同步开源进展，欢迎留言互动～**

**SOFA**Stack（**S**calable **O**pen **F**inancial **A**rchitecture Stack）是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

**SOFAStack 官网:** *[https://www.sofastack.tech](https://www.sofastack.tech)*

**SOFAStack:** *[https://github.com/sofastack](https://github.com/sofastack)*

### SOFAStack GitHub issue 精选

**本周各项目回复 issue 共计 5 条**

欢迎大家在 GitHub 提交 issue 与我们互动

我们会筛选 issue 通过 

" SOFA WEEKLY " 的形式回复

**1. @fengjiachun #951**

> 怎么通过 GitHub Action 自动发布新版本 jar 到 maven 库？

A：把 autoReleaseAfterClose 设置为 true，可以非常方便。

**「SOFAJraft」**：*[https://github.com/sofastack/sofa-jraft/](https://github.com/sofastack/sofa-jraft/)*

**2. @canaan-wang #859** 

> Layotto 为什么要开发 SDK ？SDK 中的功能代码为什么不可以迁移到 Server 端？

A：对于一些熟悉 gRPC 的用户来说，Client 端直接裸用 gRPC 都可以，但这种方式对于应用开发者是有理解成本的，所以 Layotto 的 SDK 提供的更多的是接口定义，让用户编程的时候不需要直接面向裸漏的 gRPC。举个简单的例子：假设用户可以往 gRPC 的 header 里面塞一个字段 “rpc-remote-address” 该字段用来指定 RPC 访问的远端目标地址，那么如果没 SDK，用户就得知道两件事：字段名和如何塞字段到 gRPC 的 header。但如果有 SDK，你可以提供一个函数 SetRpcTargetAddress（Address String）来直接给用户使用。

**「Layotto」**：*[https://github.com/mosn/layotto/](https://github.com/mosn/layotto/)*

### 本周推荐阅读

[WASM 将引领下一代计算范式[译]](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247522326&idx=1&sn=f50a24144c3bbfa8b7e97b4b189e1712&chksm=faa377cccdd4fedae9882ec5ff55723b93edc6e3b4dd55deb5c1b7f6aa2d8a3f2dc16059edd6&scene=21)

[SOFARegistry | 大规模集群优化实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247517005&idx=1&sn=685cea90982f8ecec5ffc56880d63175&chksm=faa36c97cdd4e58163830407bd827838f6ecb0a5b0e22130b507141fe9a24b2e645666fc0571&scene=21)

[MOSN 反向通道详解](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247513902&idx=1&sn=be00c5af2e9775a4039430bf187e16f4&chksm=faa358f4cdd4d1e23d7e9c93b4a94d6e6c377f51eb5e96b6dd5f74b840e48ebd3f518c4bf80a&scene=21)

[如何看待 Dapr、Layotto 这种多运行时架构？](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247510516&idx=1&sn=eff21915cd0ac1a8c8e3f126b549a605&chksm=faa3462ecdd4cf38ab6ab0c7201902fb53d54cea4865f9b7d7cdcdc7eaa00cf354d8b05e5393&scene=21)

欢迎扫码关注：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e19d0a6d7f734ad6a585cde82ae4f3bf~tplv-k3u1fbpfcp-zoom-1.image)
