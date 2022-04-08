---
title: "SOFA Weekly |开源新知、本周 QA、Layotto Java-sdk 本周发布"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly |开源新知、本周 QA、Layotto Java-sdk 本周发布"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2022-04-08T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ"
---

SOFA WEEKLY | 每周精选，筛选每周精华问答

同步开源进展，欢迎留言互动

![weekly.jpg](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ)

SOFAStack（Scalable Open Financial Architecture Stack)是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

SOFAStack 官网: [https://www.sofastack.tech](https://www.sofastack.tech/)

SOFAStack: [https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动，我们会筛选重点问题，通过 " SOFA WEEKLY " 的形式回复

**@ 尚之** 提问：

>SOFARegistry 和应用绑定有多深，Serverless 场景下有没有更动态的方案和应用解绑？

A：其实不需要和应用进行绑定，更准确的说法是节点级的服务发现，就算应用下面每个节点之间发布的服务不一样，应用级的这个方案也是可以支持的。而且目前蚂蚁的 Serverless 的场景实际上已经是应用级了，只是对于业务 owner 没有感知。

「SOFARegistry」：[https://github.com/sofastack/sofa-registry](https://github.com/sofastack/sofa-registry)

**黄润良 ** 提问：

![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*GwwxQ48em3QAAAAAAAAAAAAAARQnAQ)

>两个组合为什么不生效呢？按照时间轮转，就不需要管理日志数量了吗？

A：按照时间轮转还没有支持这个日志数量。

>按时间轮转的，轮转后的文件名应该是带日期时间字符串的把，配个定制任务清理一下就可以了吗？

A：我们也是用的这个库，然后根据时间轮转是我们扩展的，我们是统一平台做这个事，就没在 MOSN 里实现。

「MOSN」：[https://github.com/mosn](https://github.com/mosn)

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

### Layotto Java-sdk  本周发布

Layotto Java-sdk 发布 v1.1.0 版本，主要变更如下：

- 支持 File API

- 支持 Sequencer API

- 新增 layotto-springboot

「发布报告」：[https://github.com/layotto/java-sdk/releases/tag/v1.1.0](https://github.com/layotto/java-sdk/releases/tag/v1.1.0)

### 本周推荐阅读

- [HAVE FUN | Layotto 源码解析](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247504412&idx=1&sn=b4e09eca55af2eb83cb9dd5d9c0e3f08&chksm=faa33dc6cdd4b4d0513c986bd745b04b92f4539029ffca2131f3d7050b54d4c15f17d2cde820&scene=21#wechat_redirect)

- [异构注册中心机制在中国工商银行的探索实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247504244&idx=1&sn=59e32e2d4be5bbf6789da040eaaa1d4d&chksm=faa33eaecdd4b7b8a2f630944d6c7fd679bd1ecfef2c512111a61c02320dc78bb0ee560053f9&scene=21#wechat_redirect)

- [社区会议｜MOSN 社区将会发布 1.0 版本，同时推动下一代架构演进](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247502035&idx=1&sn=7854ee79b923d5431903f787ff9edc73&chksm=faa32709cdd4ae1fce7b031a5ceed38018dbcc61da42024649d8ef0c5b39d823d508004239a8&scene=21)

更多文章请扫码关注“金融级分布式架构”公众号

>![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*8G5NRZ7UEToAAAAAAAAAAAAAARQnAQ)
