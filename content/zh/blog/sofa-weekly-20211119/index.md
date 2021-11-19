---
title: "SOFA Weekly | SOFA Weekly | 社区本周 Contributor、QA 整理、新手任务计划"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly | 社区本周 Contributor、QA 整理、新手任务计划"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2021-11-19T15:00:00+08:00
cover: "https://gw.alipayobjects.com/zos/bmw-prod/5bcdff25-e21a-43ab-8e34-04305cd379ae.webp"
---

SOFA WEEKLY | 每周精选，筛选每周精华问答

同步开源进展，欢迎留言互动

![weekly.jpg](https://gw.alipayobjects.com/zos/bmw-prod/5bcdff25-e21a-43ab-8e34-04305cd379ae.webp)

SOFAStack（Scalable Open Financial Architecture Stack)是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

SOFAStack 官网: [https://www.sofastack.tech](https://www.sofastack.tech/)

SOFAStack: [https://github.com/sofastack](https://github.com/sofastack)

### SOFA&MOSN 社区 本周 Contributor

![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*T-I6RY_hT9gAAAAAAAAAAAAAARQnAQ)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动
我们会筛选重点问题
通过 " SOFA WEEKLY " 的形式回复

**@黄润良** 提问：

>有什么办法可以获取日志的这两个值吗？

>![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*9ve_QatXBYEAAAAAAAAAAAAAARQnAQ)

A：可以参考下图

>![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*w00zSLw8IKUAAAAAAAAAAAAAARQnAQ)

MOSN：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

**@爱德华** 提问：

>请教一下，SOFAJRaft 在 leader 晋升后，给每个 follower 发送的探测请求是什么？是 Raft 论文中，为了“提交上一个 term 日志项”，才发送的空请求吗？

A：是为了探测该 follower 与 leader 的日志差异。找对 nextIndex 对吧？提交上一个 term 要通过 noop 日志。Raft 论文里有个 nextIndex，你可以看看相关内容， 日志复制那个小节。

SOFAJRaft：[https://github.com/sofastack/sofa-jraft](https://github.com/sofastack/sofa-jraft)

**@Bazingga** 提问：

>源码里面是怎么支持的呀，RheaKV 是使用了这个功能是吧。

A：可以参考下这个
[https://blog.csdn.net/SOFAStack/article/details/91458041](https://blog.csdn.net/SOFAStack/article/details/91458041)

SOFAJRaft：[https://github.com/sofastack/sofa-jraft](https://github.com/sofastack/sofa-jraft)

**@爱德华** 提问：

>我请教一下关于 follower 截断日志的问题。
leader 拥有日志：101,102,103，它们的 term 为 2
follower 拥有日志：101,102,103,104，它们的 term 为 2
按照正常逻辑，follower 应该截断 104 的日志。
根据上面的代码，在探测消息中，这种情况，follower 会返回了 success=true，并携带 lastLogIndex=104。那么 follower 是在什么时候截断 104 的呢？

>![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*lJZfTpxjNkoAAAAAAAAAAAAAARQnAQ)

A：checkAndResolveConflict 方法。

SOFAJRaft：[https://github.com/sofastack/sofa-jraft](https://github.com/sofastack/sofa-jraft)

### SOFAStack&MOSN:新手任务计划

作为技术同学，你是否有过“想参与某个开源项目的开发、但是不知道从何下手”的感觉？

为了帮助大家更好的参与开源项目，SOFAStack 和 MOSN 社区会定期发布适合新手的新手开发任务，帮助大家 learning by doing!

**SOFARPC**

- Easy

在服务注册时，使用枚举值替代字符串硬编码

优化集成 Nacos、ZK 注册中心的文档

- Medium

让用户使用@SOFAService 后不需要再写@Component

优化 SOFARPC 的异步编程体验

- Hard

JFR 埋点

「详细参考」：

[https://github.com/sofastack/sofa-rpc/issues/1127](https://github.com/sofastack/sofa-rpc/issues/1127)

**Layotto**

- Easy

fail fast，让 Layotto 启动报错时自杀

为 Java SDK 新增分布式锁 API

为 Java SDK 新增分布式自增 ID API

- Medium

开发 Python SDK

开发 spring-boot-laytto

- Hard

集成 Jaeger 等 tracing 系统

支持 Dapr Config API

「详细参考」：

https://github.com/mosn/layotto/issues/108#issuecomment-872779356

### 本周推荐阅读 

- [rometheus on CeresDB 演进之路](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247497779&idx=1&sn=3c47ec0f1af6b5f0278010720c52a7fc&chksm=faa317e9cdd49eff0eb65e69e3ce40254100848556eca075ef24f3ce4527d906ce67c2487f94&token=709289858&lang=zh_CN#rd)

- [如何在生产环境排查 Rust 内存占用过高问题](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247497371&idx=1&sn=8b98f9a7dad0ac99d77c45d12db626be&chksm=faa31941cdd49057ec6aa23b5541e0b1ce49574808f55068a0b3c0bc829ef281c47cfba53f59&scene=21)

- [新一代日志型系统在 SOFAJRaft 中的应用](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247497065&idx=1&sn=41cc54dbca1f9bb1d2e50dbd181f062d&chksm=faa31ab3cdd493a52bac26736b2d66c9fcda77c6591048ae758f9663ded0a1a068947a8488ab&scene=21)

- [终于！SOFATracer 完成了它的链路可视化之旅](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247496554&idx=1&sn=b6c292ee9b983a2344f2929390fe15c4&chksm=faa31cb0cdd495a6770720e631ff338e435998f294145da18c04bf34b82e49d2f028687cad7f&scene=21)

>![weekly.jpg](https://gw.alipayobjects.com/zos/bmw-prod/5f2e9662-eff8-4b6b-abb6-08799da42fcc.webp)
