---
title: "SOFA Weekly | 我是开源人、本周 QA、本周 Contributor"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly | 我是开源人、本周 QA、本周 Contributor"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2022-05-20T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ"
---

SOFAStack（Scalable Open Financial Architecture Stack)是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

SOFAStack 官网: [https://www.sofastack.tech](https://www.sofastack.tech/)

SOFAStack: [https://github.com/sofastack](https://github.com/sofastack)

### SOFAStack 社区本周 Contributor  
![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*cAOWRow2KeIAAAAAAAAAAAAAARQnAQ)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动，我们会筛选重点问题，通过 " SOFA WEEKLY " 的形式回复

@林楠 提问：

>SOFARegistry 使用数据库做存储，未来有没有计划做一个简洁版，不依赖数据库？

A：v6 使用存储主要是存放元数据而不是服务数据，元数据存储接口未来计划使用 jraft 作为存储。这也是 v5—>v6 的过程中去掉的一个功能，因为在内部，引入 jraft 有一定运维成本，需要 operator 这种非标组件。

「SOFARegistry」：[https://github.com/sofastack/sofa-registry](https://github.com/sofastack/sofa-registry)

@jiaxin shan 提问：

>想知道 Layotto 的成熟案例，有没有一些大公司进行使用呢？体量是多少？1.miscro-service 方向 2.FaaS 方向也有一些落地实例吗？

A：目前蚂蚁在生产环境使用，另外也有某大厂准备上测试环境了。官网的 WASM 跑 FaaS 示例么？那个还没上过生产，还在探索阶段。

>我理解目前像 FaaS、WASM 等更多是从社区角度，开源侧进行牵引，慢慢孵化一些场景？

A：对，结合 WASM 做 FaaS 是开源社区探索方向；其他的 runtime、service mesh 属于生产需求驱动，更严肃一些。属于蚂蚁发起、社区共建，如果担心独裁，可以关注下 contributor 数、月活跃贡献者数这些指标，现在活跃贡献者有腾讯、同程等公司的朋友，3个 committor 都不是蚂蚁的。我们每周五有社区周会，你感兴趣可以来聊聊。钉钉群码：41585216

「Layotto」：[https://github.com/mosn/layotto](https://github.com/mosn/layotto)

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

- [【2022 开源之夏】欢迎报名 SOFAStack 社区项目！](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247508186&idx=1&sn=69dd9bb76f9d855f93a78e1c95e74304&chksm=faa34f00cdd4c616e2665aa82d786eb30abe031a1e8be2b050d41baf6daa00718506101e770b&scene=21)

- [恭喜 黄章衡 成为 SOFAJRaft committer！（附赠开源之夏攻略）](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247508648&idx=1&sn=8b95cf360715349bc27311b2b24344b8&chksm=faa34d72cdd4c464a24e173275d17ba682d71e7f57f3ace948d432fc7617b5c61dae2818946e&scene=21)

- [【2022 开源之夏】欢迎报名 MOSN 社区项目！](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247508230&idx=1&sn=ff326d1e46acb12c8a4f08e078bbe151&chksm=faa34edccdd4c7ca70cbcf8d79aa308fb4f8a627303fb31273db8a9ec11549a9655b82f8caa3&scene=21)

- [蚂蚁集团 Service Mesh 进展回顾与展望](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247509391&idx=1&sn=95883f61905cc4de15125ffd2183b801&chksm=faa34a55cdd4c3434a0d667f8ed57e59c2fc747315f947b19b23f520786130446b6828a68069&token=519723937&lang=zh_CN#rd)

更多文章请扫码关注“金融级分布式架构”公众号

>![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*8G5NRZ7UEToAAAAAAAAAAAAAARQnAQ)
