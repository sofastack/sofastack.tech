---
title: "SOFA Weekly | Committer 聊天室、SOFAJRaft 本周发布、新手任务"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly | Committer 聊天室、SOFAJRaft 本周发布、新手任务"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2022-03-18T15:00:00+08:00
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

**@rust-rust ** 提问：

>建议开发各种语言的 API。

A：Java 和 Python 在设计中，争取注册到 jsse 里。

BabaSSL：[https://github.com/BabaSSL](https://github.com/BabaSSL)

**@会飞的小胖子 ** 提问：

>tengine 现在可使用 BabaSSL 了吗？

A：tengine master 已经支持，稳定版还得等等。

BabaSSL：[https://github.com/BabaSSL](https://github.com/BabaSSL)

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

### SOFAJRaft 本周发布

发布 1.3.10 版本，主要变更如下：

#### Features：

优化 read-index 读，增加 maxReadIndexLag 参数设置快速失败阈值  

LogEntry 增加切片读取 API

在删除 rocksdb 大 range 数据时，优化空间回收速度

在节点过载时，将原有的快速失败策略修改为反压策略，依赖于这个特性的用户推荐升级 

#### Bug Fixes：

升级 Log4j 以解决安全漏洞

snapshot 文件使用 atomic move 避免文件重新命名是被损坏 

修复 Counter demo 不兼容 gRPC 的问题

修复对 snapshot 并行压缩/解压的配置项错误

修复在某种竞争条件下 Replicator 可能停止发送心跳的 bug 

「详细参考」：[https://github.com/sofastack/sofa-jraft/releases/tag/1.3.10](https://github.com/sofastack/sofa-jraft/releases/tag/1.3.10)

### 本周推荐阅读

- [SOFAArk Committer 专访｜看它不爽，就直接动手改！](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247503819&idx=1&sn=8dfd99fac47b7c9c6e4f507db5d7a11f&chksm=faa32011cdd4a9070e80c69d21fbab7a16047d307907b61ed7c3bdf588d7d57af2cd41fffa26&scene=21)

- [HAVE FUN | SOFARegistry 源码解析](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247502760&idx=1&sn=2980bf857055853220934944c42fd2af&chksm=faa32472cdd4ad641cb062e0c3bb5ec5b46dafba1ea25b19d774ebdac2704ae610994511874b&scene=21)

- [探索 SOFARegistry（一）｜基础架构篇](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247502139&idx=1&sn=015419fdc360c07030cf147cbfb1cf2f&chksm=faa326e1cdd4aff71d498bbdcdf3e2bf83e53a7a0cfc6c01ff123860e074d199411191b3ea13&scene=21)

- [社区会议｜MOSN 社区将会发布 1.0 版本，同时推动下一代架构演进](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247502035&idx=1&sn=7854ee79b923d5431903f787ff9edc73&chksm=faa32709cdd4ae1fce7b031a5ceed38018dbcc61da42024649d8ef0c5b39d823d508004239a8&scene=21)

更多文章请扫码关注“金融级分布式架构”公众号

>![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*8G5NRZ7UEToAAAAAAAAAAAAAARQnAQ)
