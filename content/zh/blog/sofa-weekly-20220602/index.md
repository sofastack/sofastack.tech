---
title: "SOFA Weekly | C 位大咖说、本周 QA、本周 Contributor"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly | C 位大咖说、本周 QA、本周 Contributor"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2022-06-02T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ"
---

SOFAStack（Scalable Open Financial Architecture Stack)是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

SOFAStack 官网: [https://www.sofastack.tech](https://www.sofastack.tech/)

SOFAStack: [https://github.com/sofastack](https://github.com/sofastack)

### SOFAStack 社区本周 Contributor  

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动，我们会筛选重点问题，通过 " SOFA WEEKLY " 的形式回复

@魏顺利 提问：

>怎么实现，等 SOFAArk 容器启动完成，做初始化的动作，需要实现什么监听?

A：在这里有描述，
![图片](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*RUyzRZOp__cAAAAAAAAAAAAAARQnAQ)

「SOFAArk」：[https://github.com/sofastack/sofa-ark](https://github.com/sofastack/sofa-ark)

@红烧肉 提问：

>有按照官网单节点启动 SOFARegistry，端口被占用的问题吗?

A：报的是哪个端口被占用，可以先把 SOFARegistry 关掉，然后看看对应端口有没有被占用。

「SOFARegistry」：[https://github.com/sofastack/sofa-registry](https://github.com/sofastack/sofa-registry)

@证道者 提问：

>每一次都要通过 gRPC 通信吗，多了很多次序列化反序列化，直接内存操作可以吗？举个例子，就是 Java 里面 mybatis 比较好用，能将这个扩展到 Layotto 里面，作为数据库操作方案。

A：这样就是 DB Mesh 了，业界有几个 DB Mesh 项目，Layotto 也正在开发这个功能。

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

- [如何看待 Dapr、Layotto 这种多运行时架构？](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247510516&idx=1&sn=eff21915cd0ac1a8c8e3f126b549a605&chksm=faa3462ecdd4cf38ab6ab0c7201902fb53d54cea4865f9b7d7cdcdc7eaa00cf354d8b05e5393&scene=21)

- [深入 HTTP/3（2）｜不那么 Boring 的 SSL](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247509738&idx=1&sn=6ad1f938181797999e003458fcc57dcc&chksm=faa34930cdd4c0262d79902d293ec15c6ce74903073a642fa28ab8d2272c25271b5347997e89&scene=21#wechat_redirect)

- [【2022 开源之夏】欢迎报名 MOSN 社区项目！](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247508230&idx=1&sn=ff326d1e46acb12c8a4f08e078bbe151&chksm=faa34edccdd4c7ca70cbcf8d79aa308fb4f8a627303fb31273db8a9ec11549a9655b82f8caa3&scene=21)

- [蚂蚁集团 Service Mesh 进展回顾与展望](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247509391&idx=1&sn=95883f61905cc4de15125ffd2183b801&chksm=faa34a55cdd4c3434a0d667f8ed57e59c2fc747315f947b19b23f520786130446b6828a68069&token=519723937&lang=zh_CN#rd)

更多文章请扫码关注“金融级分布式架构”公众号

>![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*8G5NRZ7UEToAAAAAAAAAAAAAARQnAQ)
