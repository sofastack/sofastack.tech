---
title: "SOFA Weekly | Layotto v0.4.0 版本发布、开源之夏项目讲解、本周 Contributor"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly | Layotto v0.4.0 版本发布、开源之夏项目讲解、本周 Contributor"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2022-05-13T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ"
---

SOFA WEEKLY | 每周精选，筛选每周精华问答

同步开源进展，欢迎留言互动

![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*_B3MTI6EAlYAAAAAAAAAAAAAARQnAQ)

SOFAStack（Scalable Open Financial Architecture Stack)是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

SOFAStack 官网: [https://www.sofastack.tech](https://www.sofastack.tech/)

SOFAStack: [https://github.com/sofastack](https://github.com/sofastack)

### SOFAStack 社区本周 Contributor  
![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*aJxqToFjIlsAAAAAAAAAAAAAARQnAQ)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动，我们会筛选重点问题，通过 " SOFA WEEKLY " 的形式回复

@曹飞提问：

>MOSN 集成 prometheus 是怎么使用呢？看到读取相应配置，是在自定义配置里面吗？

A：你可以自定义收集指标，然后通过 promoetheus 格式输出。在配置加这个 metric 的就行了。[https://github.com/mosn/mosn/blob/f3248bf2ed6c5d13635e8ce4af921f665ccdf96c/configs/mosn_config_dev.json#L69](https://github.com/mosn/mosn/blob/f3248bf2ed6c5d13635e8ce4af921f665ccdf96c/configs/mosn_config_dev.json#L69)

「MOSN」：[https://github.com/mosn](https://github.com/mosn)

@沈冰 提问：

>SOFAArk 2.0 怎么创建 ark-plugin? 使用的场景是做类隔离。

A：当前这个还和 1.0 的使用方式一致的，完全按照 1.0 的方式来。[https://developer.aliyun.com/article/625338](https://developer.aliyun.com/article/625338)

「SOFAArk」：[https://github.com/sofastack/sofa-rpc](https://github.com/sofastack/sofa-rpc)

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

### Layotto v0.4.0 版本

发布 Layotto v0.4.0 版本，主要变更如下：

1.文件能力增加了七牛云 oss、hdfs、腾讯云 oss 的实现；

  同时增加了Java SDK 的实现

2.支持 API 插件和自定义组件能力

3.支持 SkyWalking

4.支持基于内存的和 mongo 的分布式锁和分布式自增 ID

5.支持 secret 接口

6.支持 Dapr 的 state、InvokeService、InvokeBinding API

7.优化了当前 CI 流程

7.修复及优化若干 bug

详细发布报告:[https://github.com/mosn/layotto/releases/tag/v0.4.0](https://github.com/mosn/layotto/releases/tag/v0.4.0)

### 本周推荐阅读

- [【2022 开源之夏】欢迎报名 SOFAStack 社区项目！](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247508186&idx=1&sn=69dd9bb76f9d855f93a78e1c95e74304&chksm=faa34f00cdd4c616e2665aa82d786eb30abe031a1e8be2b050d41baf6daa00718506101e770b&scene=21)

- [恭喜 黄章衡 成为 SOFAJRaft committer！（附赠开源之夏攻略）](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247508648&idx=1&sn=8b95cf360715349bc27311b2b24344b8&chksm=faa34d72cdd4c464a24e173275d17ba682d71e7f57f3ace948d432fc7617b5c61dae2818946e&scene=21)

- [SOFAServerless 体系助力业务极速研发](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247508394&idx=1&sn=280fad012f3e78765d1a63acac53ac6b&chksm=faa34e70cdd4c7662c183fc1188f8162a6c421e9bb781ef887dba917364281fc16d57e11c42c&scene=21)

更多文章请扫码关注“金融级分布式架构”公众号

>![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*8G5NRZ7UEToAAAAAAAAAAAAAARQnAQ)
