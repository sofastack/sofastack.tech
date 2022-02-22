---
title: "SOFA Weekly |社区开发者的搬砖日常、QA 整理、新手任务计划"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly |社区开发者的搬砖日常、QA 整理、新手任务计划
"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2022-01-21T15:00:00+08:00
cover: "https://gw.alipayobjects.com/zos/bmw-prod/5bcdff25-e21a-43ab-8e34-04305cd379ae.webp"
---

SOFA WEEKLY | 每周精选，筛选每周精华问答

同步开源进展，欢迎留言互动

![weekly.jpg](https://gw.alipayobjects.com/zos/bmw-prod/5bcdff25-e21a-43ab-8e34-04305cd379ae.webp)

SOFAStack（Scalable Open Financial Architecture Stack)是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

SOFAStack 官网: [https://www.sofastack.tech](https://www.sofastack.tech/)

SOFAStack: [https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动

我们会筛选重点问题

通过 " SOFA WEEKLY " 的形式回复

**@王辉** 提问：

>那 6.x 版本相比 5.x 版本，缺失了哪些功能，有列表么？

A：providedata 的功能还在，但通过 session 透出的 watcher 还没有支持，其他的功能没有缺失。

「SOFARegistry」：[https://github.com/sofastack/sofa-registry](https://github.com/sofastack/sofa-registry)

**@李雪涛** 提问：

>请问自定义一个 streamfilter，可以在这个 filter 中获取当前请求的目的 IP 吗?

A：可以的哈，通过变量就可以获取 。

具体内容可以参考下方文档：

[https://www.github.com/mosn/mosn/tree/master/pkg%2Fproxy%2Fvar.go](https://www.github.com/mosn/mosn/tree/master/pkg%2Fproxy%2Fvar.go)

「MOSN」：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

**@王宇阳** 提问：

>请教一下 MOSN 做网关会对 HTTP 协议中没有带 content-type 的请求头做处理吗，比如加一个默认的这样？

A：如果响应 header 没有携带 content-type 的话则默认加一个 “text/plain; charset=utf-8” 的 content-type。

（注：MOSN 中的 HTTP 解析这块使用的 fasthttp 的库，目前这块会有这个默认操作。）

「MOSN」：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

### SOFAStack&MOSN:新手任务计划

作为技术同学，你是否有过“想参与某个开源项目的开发、但是不知道从何下手”的感觉？

为了帮助大家更好的参与开源项目，SOFAStack 和 MOSN 社区会定期发布适合新手的新手开发任务，帮助大家 learning by doing!

**Layotto**

- Easy

为 actuator 模块添加单元测试

为 Java SDK 新增分布式锁、分布式自增 ID API

- Medium

让 Layotto 支持 Dapr API

开发 Rust、C、Python、SDK

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

[叮，你有一份开发者问卷到了](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247499930&idx=1&sn=e50701d19fbb7a5b9f5442216416f3f0&chksm=faa32f40cdd4a656e79525ee1de867f6f539fcf73d4fff8011e1ab57972951f045d750a6cc11&scene=21)

[一图看懂 SOFAStack 社区的 2021 ｜文末有“彩蛋”](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247499732&idx=1&sn=cb27880b02df1f0a55aeb27836be7834&chksm=faa3100ecdd499180030f9b12041a4275954f393ab7bbedb2672599247451544847e3caf71f8&scene=21)

[服务网格定义企业上云新路径！ | Forrester X 蚂蚁集团 发布服务网格白皮书](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247499916&idx=1&sn=f68469b35cdb6d7e33589e724a2ed6c4&chksm=faa32f56cdd4a640cb8deb38b7a3eb046a858fb85485c4152f0302d37017d8cd1aba8f696473&scene=21)

[一行降低 100000kg 碳排放量的代码](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247499661&idx=1&sn=7c609883a7fd3b6f738bd0c13b82d8e5&chksm=faa31057cdd49941e00d39e0df6dd2e8c91050c0cb33bad124983cd8d732c6f5f2fc0bbdba49&scene=21)
