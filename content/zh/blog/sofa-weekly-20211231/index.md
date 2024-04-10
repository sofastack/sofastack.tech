---
title: "SOFA Weekly |社区新年祝福、QA 整理、MOSN 本周发布"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly |社区新年祝福、QA 整理、MOSN 本周发布"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2021-12-31T15:00:00+08:00
cover: "https://gw.alipayobjects.com/zos/bmw-prod/5bcdff25-e21a-43ab-8e34-04305cd379ae.webp"
---

SOFA WEEKLY | 每周精选，筛选每周精华问答

同步开源进展，欢迎留言互动

![weekly.jpg](https://gw.alipayobjects.com/zos/bmw-prod/5bcdff25-e21a-43ab-8e34-04305cd379ae.webp)

SOFAStack（Scalable Open Financial Architecture Stack)是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

SOFAStack 官网: [https://www.sofastack.tech](https://www.sofastack.tech/)

SOFAStack: [https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动

我们会筛选重点问题

通过 " SOFA WEEKLY " 的形式回复

**@东仔** 提问：

> SOFARegistry 的 client、meta、data、session 的四个模块间怎么交互的？

A：client API 参考 :

[https://www.sofastack.tech/projects/sofa-registry/java-sdk/](https://www.sofastack.tech/projects/sofa-registry/java-sdk/)

meta、data、session 没有提供 API 文档, 相关介绍可以看下:

[https://github.com/sofastack/sofa-registry/releases/tag/v6.1.4](https://github.com/sofastack/sofa-registry/releases/tag/v6.1.4)

「SOFARegistry」：[https://github.com/sofastack/sofa-registry](https://github.com/sofastack/sofa-registry)

**@刚刚** 提问：

> 获取有效链接，这个方法不是每次 new 一个 TCP 链接？

![img](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*Z9DZTawcyHUAAAAAAAAAAAAAARQnAQ)

A：会复用的，为 0 的时候才新建，不为 0 的时候我看是去到一个，直接把那个位置重置为 nil 了。

> 复用是体现在？还是我 down 大代码不是最新的。

A：用完了会放回这个 avliableclients 的数组里，你的代码不是最新，但大致逻辑也就这样。

![img](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*gSYSQ5zbdbMAAAAAAAAAAAAAARQnAQ)

「MOSN」：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

3、之前有同学问到 OpenKruise 怎么热升级 MOSN，欢迎大家阅读这篇文档试用反馈！

[https://mosn.io/blog/posts/mosn-sidecarset-hotupgrade/](https://mosn.io/blog/posts/mosn-sidecarset-hotupgrade/)

「MOSN」：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

### SOFAStack&MOSN:新手任务计划

作为技术同学，你是否有过“想参与某个开源项目的开发、但是不知道从何下手”的感觉？

为了帮助大家更好的参与开源项目，SOFAStack 和 MOSN 社区会定期发布适合新手的新手开发任务，帮助大家 learning by doing!

Layotto

- Easy

为 actuator 模块添加单元测试

为 Java SDK 新增分布式锁、分布式自增 ID API

- Medium

让 Layotto 支持 Dapr API

开发 Rust、Python、SDK

「详细参考」：[https://github.com/mosn/layotto/issues/108#issuecomment-872779356](https://github.com/mosn/layotto/issues/108#issuecomment-872779356)

SOFARPC

- Easy

优化 SOFARPC 使用文档

- Medium

优化 SOFARPC 的异步编程体验

「详细参考」：

[https://github.com/sofastack/sofa-rpc/issues/1127](https://github.com/sofastack/sofa-rpc/issues/1127)

### MOSN 本周发布

发布 MOSN V0.26.0 版本，主要变更如下：

主要更新如下：

1. XProtocol 进行了重构，XProtocol 不再是一种协议，而是便于协议扩展实现的框架

2. 新增 ip_access filter，基于来源 IP 的 ACL 控制器

3. 支持 go plugin 加载协议转化插件，并支持动态选择协议转换插件

4. 支持动态设置上游协议，使用 transcoder filter 来替换 Proxy 中的协议转换

5. 其他优化与 BUG Fix

「详细参考」：

[https://mosn.io/blog/releases/v0.26.0/](https://mosn.io/blog/releases/v0.26.0/)

### 本周推荐阅读

[一行降低 100000kg 碳排放量的代码！](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247499661&idx=1&sn=7c609883a7fd3b6f738bd0c13b82d8e5&chksm=faa31057cdd49941e00d39e0df6dd2e8c91050c0cb33bad124983cd8d732c6f5f2fc0bbdba49&scene=21)

[SOFAStack 背后的实践和思考｜新一代分布式云 PaaS 平台，打造企业上云新体验](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247499590&idx=1&sn=14b9652c41e39bd06e4511b632b16fd2&chksm=faa3109ccdd4998a0d0495638fa53f38d5d062d80fdb0d2524e965aa3dea8a289150ddcec456&scene=21)

[深入 HTTP/3（一）｜从 QUIC 链接的建立与关闭看协议的演进](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247499565&idx=1&sn=00a26362451ee3bbc8ee82588514eb52&chksm=faa310f7cdd499e15e39f1cfc32644cb175340f26148cab50ca90f973e786c5ef4d8cb025580&scene=21)

[「网商双十一」基于 ServiceMesh 技术的业务链路隔离技术及实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247499337&idx=1&sn=a0f3965f5989858c7e50763e696c9c53&chksm=faa31193cdd49885045adfce40c76e7cde9b689203845f2f674c24f379c246868d272c8adcbd&scene=21t)

![img](https://gw.alipayobjects.com/zos/bmw-prod/75d7bde6-1f48-4f28-80a4-215f8ec811bd.webp)
