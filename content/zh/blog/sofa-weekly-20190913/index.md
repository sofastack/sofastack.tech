---
title: "SOFA Weekly | 每周精选【9/9 - 9/13】"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2019-09-12T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563524226806-e93607a3-1b77-4ca2-8c3c-0384ab966154.png"
---

**SOFA WEEKLY | 每周精选，筛选每周精华问答**
**同步开源进展，欢迎留言互动**

![weekly](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1562925824761-fc720f21-9622-437b-a783-0b0729eda119.jpeg)

SOFAStack（Scalable Open Financial Architecture Stack）是蚂蚁金服自主研发的金融级分布式架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

**SOFAStack 官网: **[https://www.sofastack.tech](https://www.sofastack.tech/)

**SOFAStack: **[https://github.com/sofastack](https://github.com/sofastack)

### 中秋特辑推荐阅读

- [【中秋特辑】（含视频回顾）SOFAStack 活动回顾整理集合](/blog/sofa-activity-retrospect-collection/)

### SOFARegistry 系列解析文章

- [服务注册中心 MetaServer 功能介绍和实现剖析 | SOFARegistry 解析](/blog/sofa-registry-metaserver-function-introduction)
- [蚂蚁金服服务注册中心 SOFARegistry 解析 | 服务发现优化之路](/blog/sofa-registry-service-discovery-optimization/)
- [海量数据下的注册中心 - SOFARegistry 架构介绍](/blog/sofa-registry-introduction/)

### SOFA 项目进展

**本周发布详情如下：**

**发布 SOFARPC v5.6.1，主要变更如下：**

- 升级 sofa-bolt 的版本到 1.5.6
- 修复 com.alipay.sofa.rpc.log.LoggerFactory 提供的 Logger 实现方案在多 classloader 场景下存在会出现类型不匹配的问题
- 修复 providerInfo 中可能出现的 staticAttrs 空指针问题

详细发布报告：
[https://github.com/sofastack/sofa-rpc/releases/tag/v5.6.1](https://github.com/sofastack/sofa-rpc/releases/tag/v5.6.1)

### Hey，中秋快乐呀

![中秋快乐](https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*WWRkR7J5VyEAAAAAAAAAAABkARQnAQ)