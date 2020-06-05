---
title: "SOFA Weekly | MOSN 发版、Service Mesh 相关文章整理、社区直播预告"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2020-06-05T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563524226806-e93607a3-1b77-4ca2-8c3c-0384ab966154.png"
---

**SOFA WEEKLY | 每周精选，筛选每周精华问答**

**同步开源进展，欢迎留言互动**

![weekly.jpg](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1562925824761-fc720f21-9622-437b-a783-0b0729eda119.jpeg)

SOFAStack（Scalable Open Financial Architecture Stack）是蚂蚁金服自主研发的金融级分布式架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

- **SOFAStack 官网: **[https://www.sofastack.tech](https://www.sofastack.tech/)
- **SOFAStack: **[https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动
我们会筛选重点问题通过 " SOFA WEEKLY " 的形式回复

**1、@林尤庆** 提问：

> 请问 SOFARPC 支持 fegin 不？

A：SOFARPC 发的 rest 服务，feign 的方式是可以调用的，但是跟 ribbon 是没打通的。

> 有具体的例子不？

A：[https://github.com/sofastack/spring-cloud-sofastack-samples](https://github.com/sofastack/spring-cloud-sofastack-samples)

> 我想问下 SOFARegistry 能像 Nacos 那样注册的是整个服务的名称么，现在 SOFARegistry 是细到接口。Spring Cloud是以整个应用注册的，SOFARegistry 是以每一个SofaServicce 注册的。

A：SOFARegistry 和 Nacos 都是注册中心服务端产品，存的都是 key: list< string > 这样的数据结构，里面存什么数据是由他们的客户端决定的。SOFARPC 就算是注册中心的客户端。

> SOFARegistry 是以每一个 SofaServicce 注册的，fegin 访问的话也是每一个 SofaServicce 去访问的，不是整个应用访问的？

A：跟 SOFARegistry 没关系，是 SOFARPC 的实现，目前按接口维度注册的。

SOFARegistry：[https://github.com/sofastack/sofa-registry](https://github.com/sofastack/sofa-registry)

**2、@姜哲**  提问：

> SOFARPC 能发布一个 https 协议的服务吗？

A：https 不行，h2（http/2+tls）是可以的。

> SOFABoot 环境下怎么发布？有 Demo 吗？

A：基于 SOFABoot 可能没有适配， 可以先看下 API 方式的：
[https://github.com/sofastack/sofa-rpc/blob/master/example/src/test/java/com/alipay/sofa/rpc/http2/Http2WithSSLServerMain.java](https://github.com/sofastack/sofa-rpc/blob/master/example/src/test/java/com/alipay/sofa/rpc/http2/Http2WithSSLServerMain.java)

SOFARPC：[https://github.com/sofastack/sofa-rpc](https://github.com/sofastack/sofa-rpc)

### 本周推荐阅读

- [多点生活在 Service Mesh 上的实践 | 线上直播整理](/blog/service-mesh-webinar-duodian-istio-mosn-dubbo/)
- [Service Mesh 中的可观察性实践 | 线上直播整理](/blog/service-mesh-virtual-meetup1-service-mesh-observability-practice/)
- [Apache SkyWalking 在 Service Mesh 中的可观察性应用 | 线上直播回顾](/blog/service-mesh-virtual-meetup1-skywalking-observability-applications/)
- [Service Mesh 高可用在企业级生产中的实践 | 线上直播回顾](/blog/service-mesh-virtual-meetup1-practice-in-enterprise-production/)
- [陌陌的 Service Mesh 探索与实践 | 线上直播回顾](/blog/momo-service-mesh-exploration-and-practice/)

### SOFA 项目进展

**本周发布详情如下：**

**发布 MOSN v0.13.0 版本，主要变更如下：**

- 新增 Strict DNS Cluster、GZIP 处理、单机故障隔离；
- 集成 Sentinel 实现限流能力；
- 优化 EDF 算法，使用 EDF 算法重新实现 WRR 算法；
- 支持 Dubbo 服务发现 Beta 版本，优化 Dubbo Decode 性能；
- 部分实现优化与 Bug 修复；

详细发布报告：
[https://github.com/mosn/mosn/releases/tag/v0.13.0](https://github.com/mosn/mosn/releases/tag/v0.13.0)

### 社区活动报名

![SOFAChannel#17](https://cdn.nlark.com/yuque/0/2020/png/226702/1591346387297-036464d1-dc13-47b2-baa3-1b1362fcd072.png)

SOFABolt 是蚂蚁金服开源的一套基于 Netty 实现的，轻量、易用、高性能、易扩展的网络通信框架。在蚂蚁金服的分布式技术体系下，我们有大量的技术产品都需要在内网进行节点间的通信。每个产品都需要考虑高吞吐、高并发的通信，私有协议设计、连接管理、兼容性等问题。

为了将开发人员从通信框架的实现中解放出来，专注于自己产品的能力建设上，我们将在微服务与消息中间件在网络通信上解决的问题以及积累的经验进行了总结，设计并实现了 SOFABolt。

本期分享将邀请 SOFABolt 开源负责人丞一，介绍 SOFABolt 的基本功能和部分实现原理，并介绍协议框架的实现。

你将收获：

- 了解 SOFABolt 的基础使用及 SOFABolt 部分功能的实现原理；
- 了解 SOFABolt 协议框架的设计以及如何拓展实现自定义私有协议；
- 了解如何设计一个通信框架；

活动详情：

- **直播主题：**SOFAChannel#17：网络通信框架 SOFABolt 的功能介绍及协议框架解析
- **分享嘉宾：**丞一，蚂蚁金服技术专家，主要从事通信中间件相关的开发工作，SOFABolt 开源负责人。
- **直播时间：**2020/7/2（周四）19:00-20:00
- **直播间：**点击“[**这里**](https://tech.antfin.com/community/live/1265)”，即可报名
