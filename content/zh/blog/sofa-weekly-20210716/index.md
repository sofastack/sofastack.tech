---
title: "SOFA Weekly | SOFARPC 发布新版本，QA 整理"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly | SOFARPC 发布新版本，QA 整理"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2021-07-16T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ"
---
SOFA WEEKLY | 每周精选，筛选每周精华问答
同步开源进展，欢迎留言互动
![weekly.jpg](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ)
SOFAStack（Scalable Open Financial Architecture Stack）是蚂蚁金服自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

SOFAStack 官网: [https://www.sofastack.tech](https://www.sofastack.tech/)

SOFAStack: [https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动

我们会筛选重点问题

通过 " SOFA WEEKLY " 的形式回复

1、@陈拥军 提问：

>我想求教一个问题，非 Spring 工程中使用 SOFARPC 的泛化调用是否可行？

A：使用 SOFARPC 的 API 方式构造 泛化 Reference 就可以。

SOFARPC：[https://github.com/sofastack/sofa-rpc](https://github.com/sofastack/sofa-rpc)

2、@孙明 提问：

>请教大家，SOFARPC 可以相互依赖吗？比如 a 依赖 b，同时 b 也依赖 a。

A：只要不是应用启动期的循环依赖，都是可以的。

SOFARPC：[https://github.com/sofastack/sofa-rpc](https://github.com/sofastack/sofa-rpc)

3、@周杰慧 提问：

>请教个问题，使用 shardingsphere 与 Seata AT 模式结合，我看 Seata 源代码回滚时用主键更新，但对于数据库分片来讲更新时 where 条件需要带上分片的列，这样的话我应该怎么解决这个问题呢？

A：看他们的 demo 来集成。

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

4、@Q 提问：

>eureka 做注册中心，TC 高可用时，如何在 TC 端覆盖 eureka 属性？

A：在 seata\conf 目录下新增 eureka-client.properties 文件，添加要覆盖的 eureka 属性即可。例如，要覆盖 eureka.instance.lease-renewal-interval-in-seconds 和 eureka.instance.lease-expiration-duration-in-seconds添加如下内容：

eureka.lease.renewalInterval=1

eureka.lease.duration=2

属性前缀为 eureka，其后的属性名可以参考类 com.netflix.appinfo.PropertyBasedInstanceConfigConstants，也可研究 Seata 源码中的 discovery 模块的 seata-discovery-eureka 工程。

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

### 本周推荐阅读

- [开启云原生 MOSN 新篇章 — 融合 Envoy 和 GoLang 生态](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247490185&idx=1&sn=cfc301e20a1ae5d0754fab3f05ea094a&chksm=faa0f553cdd77c450bf3c8e34cf3c27c3bbd89092ff30e6ae6b2631953c4886086172a37cb48&scene=21)

- [RFC8998+BabaSSL---让国密驶向更远的星辰大海](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247490428&idx=1&sn=8ca31baa5c99e0790cdee8a075a7c046&chksm=faa0f4a6cdd77db07f3fb1149b7f6505fe6b8eca5b2e2a724960aee76d9667e3e970c44eef5a&scene=21)

- [MOSN 子项目 Layotto：开启服务网格+应用运行时新篇章](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247488835&idx=1&sn=d645b9abc866048e679b56bfe3b72482&chksm=faa0fa99cdd7738ff1749ae75b1670f953c92b70dcf0358337977438fd74b632b21a7b17ece3&scene=21)

- [蚂蚁云原生应用运行时的探索和实践 - ArchSummit 上海](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247488131&idx=1&sn=cd0b101c2db86b1d28e9f4fe07b0446e&chksm=faa0fd59cdd7744f14deeffd3939d386cff6cecdde512aa9ad00cef814c033355ac792001377&scene=21)

更多文章请扫码关注“金融级分布式架构”公众号

>![](https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*s3UzR6VeQ6cAAAAAAAAAAAAAARQnAQ)
