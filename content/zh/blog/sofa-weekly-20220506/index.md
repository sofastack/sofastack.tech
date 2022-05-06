---
title: "SOFA Weekly | 神奇技术、本周贡献者、新手任务"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly | 神奇技术、本周贡献者、新手任务"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2022-05-06T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ"
---

SOFA WEEKLY | 每周精选，筛选每周精华问答

同步开源进展，欢迎留言互动

![weekly.jpg](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ)

SOFAStack（Scalable Open Financial Architecture Stack)是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

SOFAStack 官网: [https://www.sofastack.tech](https://www.sofastack.tech/)

SOFAStack: [https://github.com/sofastack](https://github.com/sofastack)

### SOFAStack 社区本周 Contributor  

![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*_tbvRZ7Ydo4AAAAAAAAAAAAAARQnAQ)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动，我们会筛选重点问题，通过 " SOFA WEEKLY " 的形式回复

@尚之 提问：

>SOFARegistry 和应用绑定有多深，Serverless 场景下有没有更动态的方案和应用解绑？

A：其实不需要和应用进行绑定，更准确的说法是节点级的服务发现，就算应用下面每个节点之间发布的服务不一样，应用级的这个方案也是可以支持的。而且目前蚂蚁的 Serverless 的场景实际上已经是应用级了，只是对于业务 owner 没有感知。

「SOFARegistry」：[https://github.com/sofastack/sofa-registry](https://github.com/sofastack/sofa-registry)

@沄澈|che 提问：

>RPC 序列化 Localdatetime 有问题，改为 Date 类型后正常, 你知道原因吗?

A：要看 SerializerFactory 对 Localdatetime 的支持了。

「SOFARPC」：[https://github.com/sofastack/sofa-rpc](https://github.com/sofastack/sofa-rpc)

### SOFAStack 新手任务计划

作为技术同学，你是否有过“想参与某个开源项目的开发、但是不知道从何下手”的感觉？

为了帮助大家更好的参与开源项目，SOFAStack 和 MOSN 社区会定期发布适合新手的新手开发任务，帮助大家 learning by doing!

Layotto

- Easy

为 actuator 模块添加单元测试

为 Java SDK 新增分布式锁、分布式自增 ID API

开发 in-memory configuration 组件

- Medium

让 Layotto 支持 Dapr API

开发 Rust、C、Python、SDK

用 mysql、consul 或 leaf 等系统实现分布式自增 id API

- Hard

让 Layotto 支持通过接口调用的方式动态加载 wasm，以支持 FaaS 场景动态调度

「详细参考」：[https://github.com/mosn/layotto/issues/108#issuecomment-872779356](https://github.com/mosn/layotto/issues/108#issuecomment-872779356)

SOFARPC

- Easy

优化 SOFARPC 使用文档

- Medium

优化 SOFARPC 的异步编程体验

「详细参考」：[https://github.com/sofastack/sofa-rpc/issues/1127](https://github.com/sofastack/sofa-rpc/issues/1127)

### 本周推荐阅读

- [MOSN 1.0 发布，开启新架构演进](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247506881&idx=1&sn=b61b931c11c83d3aceea93a90bbe8c5d&chksm=faa3341bcdd4bd0d1fb1348c99e7d38be2597dcb6767a68c69149d954eae02bd39bc447e521f&scene=21)

- [HAVE FUN | SOFABoot 源码解析活动](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247507044&idx=1&sn=13863725113d559c06b8b975c26973ab&chksm=faa333becdd4baa89ed8752c0c49ca116b02ee64f3ce2437ac0d3942b6b351a422f9d86752ff&scene=21)

- [SOFARegistry 源码｜数据分片之核心-路由表 SlotTable 剖析](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247506478&idx=1&sn=ead477db9b27282d7d256e97a6dd0160&chksm=faa335f4cdd4bce24b9e388bb6456621628c056a87e141f761d2d51a4cd533ec82ad8167f8f7&scene=21#wechat_redirect)

更多文章请扫码关注“金融级分布式架构”公众号

>![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*8G5NRZ7UEToAAAAAAAAAAAAAARQnAQ)
