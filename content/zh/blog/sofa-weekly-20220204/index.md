---
title: "SOFA Weekly |社区开发者的搬砖日常、QA 整理、新手任务计划"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly |社区开发者的搬砖日常、QA 整理、新手任务计划"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2022-02-04T15:00:00+08:00
cover: "https://gw.alipayobjects.com/zos/bmw-prod/5bcdff25-e21a-43ab-8e34-04305cd379ae.webp"
---

SOFA WEEKLY | 每周精选，筛选每周精华问答

同步开源进展，欢迎留言互动

![weekly.jpg](https://gw.alipayobjects.com/zos/bmw-prod/5bcdff25-e21a-43ab-8e34-04305cd379ae.webp)

SOFAStack（Scalable Open Financial Architecture Stack)是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

SOFAStack 官网: [https://www.sofastack.tech](https://www.sofastack.tech/)

SOFAStack: [https://github.com/sofastack](https://github.com/sofastack)

### SOFA&MOSN 社区 本周 Contributor

![img](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*XX1xTpi-zUoAAAAAAAAAAAAAARQnAQ)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动

我们会筛选重点问题

通过 " SOFA WEEKLY " 的形式回复

**@来永国** 提问：

> 想问下，发现在 SOFA 的 spi 加载扩展的时候，是有做到 getExtensionLoader 遍历 META-INF 的，但是没搞懂是怎么做到的。br/
>![img](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*eHKJSaw91Y8AAAAAAAAAAAAAARQnAQ)

A：在这个方法里: com.alipay.sofa.rpc.ext.ExtensionLoader#loadFromFile，getResource 这边可以获得多个文件。

**@半个馒头** 提问：

> 多次提交 raft 日志会自动触发 jraft 的 leader 转移吗？

A：不会，可能是其他场景触发的。

> steps down when alive nodes don't satisfy quorum.

A：是 leader 中发现半数节点在心跳周期内没有心跳了。

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

[喜迎虎年｜开源正当时！](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247500831&idx=1&sn=e91fff98af5bdc500f821951648420c3&chksm=faa32bc5cdd4a2d3aea8a4146d19411b065146b1a60fc0c27c0a8e3fd2040e5f6f23b5a33a0f&token=557486901&lang=zh_CN#rd)

[2021 大促 AntMonitor 总结 - 云原生 Prometheus 监控实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247500552&idx=1&sn=512a3babe84064d8ebd6ccbb65b25c12&chksm=faa32cd2cdd4a5c4981fb5aa3dbcd6d4fe2f6470eabd89053314e8ef51a271e28c3affa835d6&scene=21#)

[蚂蚁大规模 Sigma 集群 Etcd 拆分实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247500192&idx=1&sn=7ceb084796e30cb4d387ede22b45d7f5&chksm=faa32e7acdd4a76c94fa2b2bb022d85f3daa78b1b3c2d4dae78b9cc5d77011eecddfd12df1c2&scene=21#)

[Tengine + BabaSSL ，让国密更易用！](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247500065&idx=1&sn=2ffec7fa6a7dc6563f48f176ae2b9180&chksm=faa32efbcdd4a7ed31789e7752045cb0d632c64f13c9f46fedec24d3c733eb271dd82e4a0f72&scene=21#)
