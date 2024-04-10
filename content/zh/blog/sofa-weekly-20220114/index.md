---
title: "SOFA Weekly |社区开发者的搬砖日常、本周 Contributor、QA 整理"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly |社区开发者的搬砖日常、本周 Contributor、QA 整理"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2021-01-14T15:00:00+08:00
cover: "https://gw.alipayobjects.com/zos/bmw-prod/5bcdff25-e21a-43ab-8e34-04305cd379ae.webp"
---

SOFA WEEKLY | 每周精选，筛选每周精华问答

同步开源进展，欢迎留言互动

![weekly.jpg](https://gw.alipayobjects.com/zos/bmw-prod/5bcdff25-e21a-43ab-8e34-04305cd379ae.webp)

SOFAStack（Scalable Open Financial Architecture Stack)是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

SOFAStack 官网: [https://www.sofastack.tech](https://www.sofastack.tech/)

SOFAStack: [https://github.com/sofastack](https://github.com/sofastack)

### SOFAStack 社区本周 Contributor 

![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*qJt2Rbr8e-AAAAAAAAAAAAAAARQnAQ)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动

我们会筛选重点问题

通过 " SOFA WEEKLY " 的形式回复

**@王家爵** 提问：

> SOFABoot 项目要一两分钟才能启动，目前这边有监控工具可以看到启动过程中各个步骤的耗时吗？

A：3.6.0 之后可以通过 actuator/startup 查看启动的耗时分布。

「SOFABoot」：[https://github.com/sofastack/sofa-boot](https://github.com/sofastack/sofa-boot)

**@东仔** 提问：

> SOFABolt 的最新分支是哪个？

A：master 就是最新分支。[https://github.com/sofastack/sofa-bolt](https://github.com/sofastack/sofa-bolt)

「SOFABolt」：[https://github.com/sofastack/sofa-bolt](https://github.com/sofastack/sofa-bolt)

**我是一个小胖子** 提问：

> 请问现在已经支持自适应限流了吗？

A：开源版本里有基于 sentinel 的自适应限流，这个你可以看看 sentinel-golang 的文档，但是和我们内部用的自适应限流有一些差异。

> 你们内部不用 sentinel 是吗？

A：也用，我们基于 sentinel 做了一些扩展。

「MOSN」：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

**来永国** 提问：

> 为什么我起了 RPC 服务端客户端和注册中心，然后连接调用是可以的，然后我把注册中心关了，它还是跑得通？

A：client 会有缓存的。

> 获取注册中心的服务有 API 接口吗?

A：有的，有个从单机 session 获取数据的接口 curl localhost:9603/digest/pub/data/query?dataInfoId=com.test.SimpleService#@#DEFAULT_INSTANCE_ID#@#DEFAULT_GROUP dataInfoId 参数需要进行 url encode 应该还没公开的 API 文档，获取数据的 HTTP 接口也不太易用，我最近会补一下文档还有方便使用的接口。

> 那看样子这个相当于是指定搜索了吗？

A：是的，目前没有模糊查询的接口， curl localhost:9603/digest/getDataInfoIdList 你可以用这个 API grep 一下。

「SOFARegistry」：[https://github.com/sofastack/sofa-registry](https://github.com/sofastack/sofa-registry)

### SOFAStack&MOSN:新手任务计划

作为技术同学，你是否有过“想参与某个开源项目的开发、但是不知道从何下手”的感觉？

为了帮助大家更好的参与开源项目，SOFAStack 和 MOSN 社区会定期发布适合新手的新手开发任务，帮助大家 learning by doing!

**Layotto**

- Easy

为 actuator 模块添加单元测试

为 Java SDK 新增分布式锁、分布式自增 ID API

开发 in-memory 组件

- Medium

让 Layotto 支持 Dapr API

开发 Rust、Python、SDK

「详细参考」：

[https://github.com/mosn/layotto/issues/108#issuecomment-872779356](https://github.com/mosn/layotto/issues/108#issuecomment-872779356)

**SOFARPC**

- Easy

优化 SOFARPC 使用文档

- Medium

优化 SOFARPC 的异步编程体验

「详细参考」：

[https://github.com/sofastack/sofa-rpc/issues/1127](https://github.com/sofastack/sofa-rpc/issues/1127)

### 本周推荐阅读  

[服务网格定义企业上云新路径！ | Forrester X 蚂蚁集团 发布服务网格白皮书](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247499916&idx=1&sn=f68469b35cdb6d7e33589e724a2ed6c4&chksm=faa32f56cdd4a640cb8deb38b7a3eb046a858fb85485c4152f0302d37017d8cd1aba8f696473&scene=21)

[一行降低 100000kg 碳排放量的代码](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247499661&idx=1&sn=7c609883a7fd3b6f738bd0c13b82d8e5&chksm=faa31057cdd49941e00d39e0df6dd2e8c91050c0cb33bad124983cd8d732c6f5f2fc0bbdba49&scene=21)

[深入 HTTP/3（一）｜从 QUIC 链接的建立与关闭看协议的演进](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247499565&idx=1&sn=00a26362451ee3bbc8ee82588514eb52&chksm=faa310f7cdd499e15e39f1cfc32644cb175340f26148cab50ca90f973e786c5ef4d8cb025580&scene=21)

[「网商双十一」基于 ServiceMesh 技术的业务链路隔离技术及实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247499337&idx=1&sn=a0f3965f5989858c7e50763e696c9c53&chksm=faa31193cdd49885045adfce40c76e7cde9b689203845f2f674c24f379c246868d272c8adcbd&scene=21t)

![img](https://gw.alipayobjects.com/zos/bmw-prod/75d7bde6-1f48-4f28-80a4-215f8ec811bd.webp)
