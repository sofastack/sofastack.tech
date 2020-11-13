---
title: "SOFA Weekly | Service Mesh 相关阅读合集、SOFABoot 以及 Seata QA 整理"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "【11/9-11/13】| 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2020-11-13T16:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563524226806-e93607a3-1b77-4ca2-8c3c-0384ab966154.png"
---

**SOFA WEEKLY | 每周精选，筛选每周精华问答**

**同步开源进展，欢迎留言互动**

![weekly](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1562925824761-fc720f21-9622-437b-a783-0b0729eda119.jpeg)

**SOFA**Stack（**S**calable **O**pen **F**inancial **A**rchitecture Stack）是蚂蚁集团自主研发的金融级分布式架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

- **SOFAStack 官网：**[https://www.sofastack.tech](https://www.sofastack.tech/)
- **SOFAStack：**[https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动
我们会筛选重点问题通过 " SOFA WEEKLY " 的形式回复

**1、@杨文鹏** 提问：

> 感觉 SOFAArk 在静态合并部署情况下,和 SOFABoot 的类隔离起到的作用是一样的？不知道我理解对不对。

A：SOFABoot 没类隔离，它的类隔离就是继续 SOFAArk。
> 比如新建一个 SOFABoot 应用，需要再手动集成 SOFAArk 吗？

A：需要的。

- SOFABoot：[https://github.com/sofastack/sofa-boot](https://github.com/sofastack/sofa-boot)
- SOFAArk：[https://github.com/sofastack/sofa-ark](https://github.com/sofastack/sofa-ark)

2、**@倪绍东** 提问：

> 如果是提交阶段有数据库失败了，其他成功的怎么办呢，没办法了吧？

A：一阶段提交,二阶段不可能提交的情况下还失败，XA 本地事务一阶段持久化在数据库层面不可能丢失，本地事务undolog跟redolog了解一下。对 Seata-server 来说保存了事务状态，如果二阶段有节点执行失败，就重试，直到成功。也就是你节点二阶段执行失败，自己了解下为什么你数据库出问题了，而不是分布式事务有什么问题。
> 会不会出现重试过程中，其他事务修改了现有数据，而最终又被重试成功的情况?

 A：二阶段提交代表了什么？代表了整个调用链是成功的，一个成功的分布式事务，一阶段已经持久化了，你再去改，这个数据又不是脏的有什么问题？XA 来说，本地事务的本地锁先了解一下，一阶段不提了，锁被本地持有，如何修改？本地排它锁都没释放，何来脏写。

3、**@李艺渊** 提问：

> Seata TCC 模式下，订单微服务和库存微服务。订单微服务try阶段添加订单信息，现阶段可以支持在库存微服务try阶段获取订单信息吗？或者说能把创建好的订单信息存储到 Seata-server ，然后在其他微服务可以获取到吗？

 A：我理解 Server只负责全局事务的流转，try 出错就 cancel ，成功就 commit。Try 里面对两个库操作，正常是可以拿到数据吧。
 
> 这2个微服务是分开部署的，数据库也是分开的。像订单微服务的 try 阶段，把订单信息存储到 order 数据库了。那库存微服务是不会去访问 order 数据库的。现在就是看库存微服务如何获取到新增的订单信息，看有没有什么 好的方式。

- Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

### Service Mesh 相关推荐阅读

- [Service Mesh 中的可观察性实践](/blog/service-mesh-virtual-meetup1-service-mesh-observability-practice/)
- [陌陌的 Service Mesh 探索与实践 - 直播回顾](/blog/momo-service-mesh-exploration-and-practice/)
- [Service Mesh Webinar#1：多点生活在 Service Mesh 上的实践](/activities/service-mesh-webinar-1/)
- [Service Mesh 高可用在企业级生产中的实践 | 线上直播回顾](/blog/service-mesh-virtual-meetup1-practice-in-enterprise-production/)
- [Apache SkyWalking 在 Service Mesh 中的可观察性应用](/blog/service-mesh-virtual-meetup1-skywalking-observability-applications/)
