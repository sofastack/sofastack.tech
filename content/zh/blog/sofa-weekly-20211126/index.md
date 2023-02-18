---
title: "SOFA Weekly | SOFA Weekly | 社区本周 Contributor、QA 整理、新手任务计划"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly | 社区本周 Contributor、QA 整理、新手任务计划"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2021-11-26T15:00:00+08:00
cover: "https://gw.alipayobjects.com/zos/bmw-prod/5bcdff25-e21a-43ab-8e34-04305cd379ae.webp"
---

SOFA WEEKLY | 每周精选，筛选每周精华问答

同步开源进展，欢迎留言互动

![weekly.jpg](https://gw.alipayobjects.com/zos/bmw-prod/5bcdff25-e21a-43ab-8e34-04305cd379ae.webp)

SOFAStack（Scalable Open Financial Architecture Stack)是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

SOFAStack 官网: [https://www.sofastack.tech](https://www.sofastack.tech/)

SOFAStack: [https://github.com/sofastack](https://github.com/sofastack)

### SOFA&MOSN 社区 本周 Contributor

![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*5bqdQ7uM54gAAAAAAAAAAAAAARQnAQ)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动
我们会筛选重点问题
通过 " SOFA WEEKLY " 的形式回复

**@洪艺辉** 提问：

>无损迁移 TCP Listener 之后，在新 MOSN 上重新 server.Serve(net.Listener)，老 MOSN 那个 Listenr 能马上死掉的 API?

A：New MOSN 启动成功之后，就关闭老的。

![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*T9WTSqHDyFoAAAAAAAAAAAAAARQnAQ)

「MOSN」：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

**@大白** 提问：

>MOSN 借助 FastHTTP 解析，是不是就没考虑大的请求了。这边不做处理的考虑是什么呢？

A：MOSN 有个地方限制太大的请求，好像还可以配置来着。

>是的，注意到有限制最大 body 大小，但是遇到一些大请求对 Sidecar 压力会很大吧。

A：RPC 场景一般没有大包，我们有个 issue 是直接 Stream。FastHTTP 也支持流式，要适配下，有兴趣可以一起来搞搞。

[https://github.com/mosn/mosn/issues/1676](https://github.com/mosn/mosn/issues/1676)

「MOSN」：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

**@xj** 提问：

>咨询下 MOSN 在做 gRPC 代理的时候，如何解决代理识别客户端新增的 proto ？难道客户端多一个 proto  代理也要增加？ 还是说直接在 HTTP2.0 层面做？

A：就是 HTTP2.0 层面，代理一般不需要识别 body。

「MOSN」：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

**@TyCoding** 提问：

>请问 SOFARPC 不使用 SOFABoot 的话，就只能用这种方式发布服务和消费吗？那如果多个接口呢?

![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*rOg-SpVtySUAAAAAAAAAAAAAARQnAQ)

A：多个接口，就多个 providerconfig 即可。

「SOFARPC」：[https://github.com/sofastack/sofa-rpc](https://github.com/sofastack/sofa-rpc)

**@王金鹏** 提问：

>有个问题想请教一下 SOFABoot 和 bolt 之间版本兼容的问题，SOFABoot 版本 2.3.4，bolt 原版本 1.4.2 升级到 1.5.8 会不会有兼容性的问题？

A：最好不要这么升级，bolt 不同版本 API 可能存在差异，最好直接把 SOFABoot 版本升级上去，对应的依赖都是我们测试过的。

「SOFABoot」：[https://github.com/sofastack/sofa-boot](https://github.com/sofastack/sofa-boot)

### SOFAStack&MOSN:新手任务计划

作为技术同学，你是否有过“想参与某个开源项目的开发、但是不知道从何下手”的感觉？

为了帮助大家更好的参与开源项目，SOFAStack 和 MOSN 社区会定期发布适合新手的新手开发任务，帮助大家 learning by doing!

**SOFARPC**

- Easy

优化集成 Nacos、ZK 注册中心的文档

- Medium

让用户使用@SOFAService 后不需要再写@Component

优化 SOFARPC 的异步编程体验

- Hard

JFR 埋点

「详细参考」：

[https://github.com/sofastack/sofa-rpc/issues/1127](https://github.com/sofastack/sofa-rpc/issues/1127)

Layotto

- Easy

开发 in-memory 组件

fail fast，让 Layotto 启动报错时自杀

为 Java SDK 新增分布式锁 API

为 Java SDK 新增分布式自增 ID API

- Medium

开发 Python 或 C++、SDK

开发 Spring-Boot-Laytto

- Hard

集成 Jaeger 等 tracing 系统

支持 Dapr Config API

「详细参考」：

[https://github.com/mosn/layotto/issues/108#issuecomment-872779356](https://github.com/mosn/layotto/issues/108#issuecomment-872779356)

### 本周推荐阅读 

- [降本提效！注册中心在蚂蚁集团的蜕变之路](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247498209&idx=1&sn=7dbfd98e922d938ffce24986945badef&chksm=faa3163bcdd49f2d3b5dd6458a3e7ef9f67819d8a1b5b1cbb3d10ab3b7cda12dd7a3d2971a9e&scene=21#wechat_redirect)

- [如何在生产环境排查 Rust 内存占用过高问题](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247497371&idx=1&sn=8b98f9a7dad0ac99d77c45d12db626be&chksm=faa31941cdd49057ec6aa23b5541e0b1ce49574808f55068a0b3c0bc829ef281c47cfba53f59&scene=21)

- [新一代日志型系统在 SOFAJRaft 中的应用](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247497065&idx=1&sn=41cc54dbca1f9bb1d2e50dbd181f062d&chksm=faa31ab3cdd493a52bac26736b2d66c9fcda77c6591048ae758f9663ded0a1a068947a8488ab&scene=21)

- [终于！SOFATracer 完成了它的链路可视化之旅](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247496554&idx=1&sn=b6c292ee9b983a2344f2929390fe15c4&chksm=faa31cb0cdd495a6770720e631ff338e435998f294145da18c04bf34b82e49d2f028687cad7f&scene=21)

>![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*7h5NRow08IQAAAAAAAAAAAAAARQnAQ)
