---
title: "SOFA Weekly |本周 Contributor、QA 整理、新手任务计划"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly |本周 Contributor、QA 整理、新手任务计划
"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2022-02-11T15:00:00+08:00
cover: "https://gw.alipayobjects.com/zos/bmw-prod/5bcdff25-e21a-43ab-8e34-04305cd379ae.webp"
---

SOFA WEEKLY | 每周精选，筛选每周精华问答

同步开源进展，欢迎留言互动

![weekly.jpg](https://gw.alipayobjects.com/zos/bmw-prod/5bcdff25-e21a-43ab-8e34-04305cd379ae.webp)

SOFAStack（Scalable Open Financial Architecture Stack)是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

SOFAStack 官网: [https://www.sofastack.tech](https://www.sofastack.tech/)

SOFAStack: [https://github.com/sofastack](https://github.com/sofastack)

### SOFA&MOSN 社区 本周 Contributor

![img](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*zDpnRpkCdPMAAAAAAAAAAAAAARQnAQ)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动

我们会筛选重点问题

通过 " SOFA WEEKLY " 的形式回复

**@小楼** 提问：

>请问 session 是如何支持 Dubbo 的元数据的？

A：Registery 的元数据现在不是通用的，只针对 SOFARPC。

> session 之间应该是没有数据同步的吧，跨 session 节点怎么办呢？

A：现在会同步两个信息，一个是元数据，一个是接口级订阅，接口级订阅是用于兼容没升级的应用。同步的路径是通过存储，类似 K8 的 listwatch 机制，内部落地存储的插件实现是 db，这个块数据比较少，就几千行吧，而且变化很小。

「SOFARegistery」：[https://github.com/sofastack/sofa-registry](https://github.com/sofastack/sofa-registry)

**@来永国** 提问：

> 为什么我起了 RPC 服务端客户端和注册中心，然后连接调用是可以的，然后我把注册中心关了，它还是跑得通？

A：client 会有缓存的。

> 获取注册中心的服务有 API 接口吗?

A：有的，有个从单机 session 获取数据的接口 curl localhost:9603/digest/pub/data/query?dataInfoId=com.test.SimpleService#@#DEFAULT_INSTANCE_ID#@#DEFAULT_GROUP dataInfoId 参数需要进行 url encode 应该还没公开的 API 文档，获取数据的 HTTP 接口也不太易用，我最近会补一下文档还有方便使用的接口。

>那看样子这个相当于是指定搜索了吗？

A：是的，目前没有模糊查询的接口， curl localhost:9603/digest/getDataInfoIdList 你可以用这个 API grep 一下。

「SOFARegistry」：[https://github.com/sofastack/sofa-registry](https://github.com/sofastack/sofa-registry)

**@东仔** 提问：

> SOFABolt 的最新分支是哪个？

A：[https://github.com/sofastack/sofa-bolt](https://github.com/sofastack/sofa-bolt) master 就是最新分支。

「SOFABolt」：[https://github.com/sofastack/sofa-bolt](https://github.com/sofastack/sofa-bolt)

### SOFAStack&MOSN:新手任务计划

作为技术同学，你是否有过“想参与某个开源项目的开发、但是不知道从何下手”的感觉？

为了帮助大家更好的参与开源项目，SOFAStack 和 MOSN 社区会定期发布适合新手的新手开发任务，帮助大家 learning by doing!

Layotto

- Easy

为 actuator 模块添加单元测试

为 Java SDK 新增分布式锁、分布式自增 ID API

- Medium

让 Layotto 支持 Dapr API

开发 Rust、C、Python、SDK

「详细参考」：

[https://github.com/mosn/layotto/issues/108#issuecomment-872779356](https://github.com/mosn/layotto/issues/108#issuecomment-872779356)

SOFARPC

- Easy

优化 SOFARPC 使用文档

- Medium

优化 SOFARPC 的异步编程体验

「详细参考」：

[https://github.com/sofastack/sofa-rpc/issues/1127](https://github.com/sofastack/sofa-rpc/issues/1127)

### 本周推荐阅读  

[2021 大促 AntMonitor 总结 - 云原生 Prometheus 监控实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247500552&idx=1&sn=512a3babe84064d8ebd6ccbb65b25c12&chksm=faa32cd2cdd4a5c4981fb5aa3dbcd6d4fe2f6470eabd89053314e8ef51a271e28c3affa835d6&scene=21#)

[蚂蚁大规模 Sigma 集群 Etcd 拆分实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247500192&idx=1&sn=7ceb084796e30cb4d387ede22b45d7f5&chksm=faa32e7acdd4a76c94fa2b2bb022d85f3daa78b1b3c2d4dae78b9cc5d77011eecddfd12df1c2&scene=21#)

[Tengine + BabaSSL ，让国密更易用！](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247500065&idx=1&sn=2ffec7fa6a7dc6563f48f176ae2b9180&chksm=faa32efbcdd4a7ed31789e7752045cb0d632c64f13c9f46fedec24d3c733eb271dd82e4a0f72&scene=21#)

[服务网格定义企业上云新路径！ | Forrester X 蚂蚁集团 发布服务网格白皮书](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247499916&idx=1&sn=f68469b35cdb6d7e33589e724a2ed6c4&chksm=faa32f56cdd4a640cb8deb38b7a3eb046a858fb85485c4152f0302d37017d8cd1aba8f696473&scene=21#)

![img](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*tvfDQLxTbsgAAAAAAAAAAAAAARQnAQ)
