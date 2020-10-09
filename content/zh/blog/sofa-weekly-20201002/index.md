---
title: " SOFA Weekly | MOSN、SOFARPC 发版、Seata QA 整理"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "【09/28-10/02】 | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2020-10-02T15:00:00+08:00
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

**@周爽** 提问：
> 我现在基于springcloud 集成 nacos,sentinel,zipkin,jpa,shardingjdbc，昨天说的做了防止重复代理，如果我是多数据源呢？后续1.3.1是配置也需要开启，代码也需要写代理吗？

A：多数据源就关掉自动代理，自己手动

> 就在我多数据源里面加上右边的 DataSourceProxy 就可以了吗？
> @Primary 这个只需DataSource1Config加上，DataSource2Config是否需要加呢？

A：代理这个 reresult；

> AT 和 XA 1.3版本可以理解为代码“使用”上就一个 new poxy 不同吗？

A：一个是 new DataSourceProxy，一个是 new DataSourceXAProxy

> Seata “实现”一个是二阶，一个是基于 XA 事务规范？

A：都是二阶段，一个模式是自研，一个是基于数据库底层实现。
Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

### 本周推荐阅读

- [蚂蚁宣布开源 KubeTEE：让机密计算支持大规模 K8s 集群](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487020&idx=1&sn=fda0674ab5ba6ca08fe279178ffa2ea3&chksm=faa0e1f6cdd768e0eae59d2aa410c70ac9c89a67230b4824d697cb796e7199f1384663ea5644&scene=21)
- [人人都可以“机密计算”：Occlum 使用入门和技术揭秘 | 开源](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247486732&idx=1&sn=d379f362145a485f4c4e02e05697b001&chksm=faa0e2d6cdd76bc03a8a71fbf78395c12279dd491825b2b0b94401e5ac226b4db4b9dd041bae&scene=21)
- [SOFAEnclave：蚂蚁金服新一代可信编程环境，让机密计算为金融业务保驾护航102年](/blog/sofa-enclave-confidential-computing/)

### SOFA 项目进展

**本周发布详情如下：**

**1、发布 SOFARPC v5.7.6 版本，主要变更如下：**

- 支持精细化配置 Jackson 序列化；
- Triple 协议支持用户自定义元数据；
- Triple 协议支持 SPI 编程模式；
- 升级 hibernate-validator 版本到 5.3.6.Final；
- TripleServer 启动时发送启动事件；

详细发布报告：
[https://github.com/sofastack/sofa-rpc/releases/tag/v5.7.6](https://github.com/sofastack/sofa-rpc/releases/tag/v5.7.6)

**2、发布 MOSN v0.17.0 版本，主要变更如下：**

- 重构 XProtocol 连接池，支持 pingpong 模式、多路复用模式与连接绑定模式；
- 优化 XProtocol 多路复用模式，支持单机 Host 连接数可配置；
- Listener 配置新增对 UDS 的支持；
- 新增在 Dubbo 协议下通过 xDS HTTP 配置进行转换的过滤器；
- 部分框架实现优化与 Bug 修复；

详细发布报告：
[https://github.com/mosn/mosn/releases/tag/v0.17.0](https://github.com/mosn/mosn/releases/tag/v0.17.0)
