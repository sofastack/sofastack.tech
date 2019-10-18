---
title: "SOFA Weekly | 每周精选【10/14 - 10/18】"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2019-10-18T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563524226806-e93607a3-1b77-4ca2-8c3c-0384ab966154.png"
---

SOFA WEEKLY | 每周精选，筛选每周精华问答
同步开源进展，欢迎留言互动

![weekly.jpg](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1562925824761-fc720f21-9622-437b-a783-0b0729eda119.jpeg)

SOFAStack（Scalable Open Financial Architecture Stack）是蚂蚁金服自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

SOFAStack 官网: [https://www.sofastack.tech](https://www.sofastack.tech/)

SOFAStack: [https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动
我们会筛选重点问题
通过 " SOFA WEEKLY " 的形式回复

**@温明磊** 提问：
> 最近在选型 Zeebe  还是  Seata Saga 来实现微服务编排。Zeebe 使用了基于行业标准 BPMN 2.0 的可视工作流。 但是考虑到 Seata 的开源和生态，如果 Seata 能实现流程可视就好了。

A：未来我们会做可视化的也可以社区贡献。另外给一个调研服务编排选型的建议，遵循 bpmn 2.0 行业标准没有问题的，不过 bmpn2.0 xml 格式太复杂了，我们微服务的编排不需要那么多标签，另外微服务的编排里有很重要一块就是要保证编排的服务的事务一致性，所以需有能支持分布式事务的处理能力，这里面就会涉及服务的状态判断定义，异常处理定义，复杂服务参数的映射，这些在 bpmn 2.0 标准里是没有定义的（当然框架可以在扩展节点里自己扩展）。用 json 定义之后，你会发现其实有没有可视化开发工具没有那么重要了，只是如果有个可视化监控更好。

> 是的，json 我们都可以自己组装。只要把业务接口做成可视可配，完全可以用配置信息组装 json。这样说不知道对不对。但是像您说的，有个可视化的工具 肯定要更好点。

A：是的，json 还有一个好处是，服务调用的参数可以直接在 json 里组织好。

### SOFARegistryLab 系列阅读

- [服务注册中心 Session 存储策略 | SOFARegistry 解析](/blog/sofa-registry-session-storage/)
- [服务注册中心数据分片和同步方案详解 | SOFARegistry 解析](/blog/sofa-registry-data-fragmentation-synchronization-scheme/)
- [服务注册中心 MetaServer 功能介绍和实现剖析 | SOFARegistry 解析](/blog/sofa-registry-metaserver-function-introduction/)
- [服务注册中心 SOFARegistry 解析 | 服务发现优化之路](/blog/sofa-registry-service-discovery-optimization/)
- [海量数据下的注册中心 - SOFARegistry 架构介绍](/blog/sofa-registry-introduction/)

### 云原生推荐阅读

- [云原生时代，什么是蚂蚁金服推荐的金融架构？](/blog/ant-financial-native-cloud-financial-architecture/)
- [当金融科技遇上云原生，蚂蚁金服是怎么做安全架构的？](/blog/ant-financial-native-cloud-security-architecture/)

### SOFA 项目进展

**发布 Seata v0.9.0，主要变更如下**：

i. 长事务解决方案: Saga 模式（基于状态机实现）
ii. 支持自定义配置和注册中心类型
iii. 支持 spring cloud config 配置中心
iv. 修复对象锁和全局锁可能造成的死锁和优化锁的粒度
v. 修复 oracle 的批量获取问题
vi. 优化了一些基于 java5 的语法结构
vii. 抽象 undologManager 的通用方法

详细发布报告：
[https://github.com/seata/seata/releases/tag/v0.9.0](https://github.com/seata/seata/releases/tag/v0.9.0)

### 云原生活动推荐

![sm#7-sm](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1571384698338-771b8dde-11f4-4967-9e3f-63ff2535ff6d.jpeg)

Service Mesh Meetup 是由**蚂蚁金服联合 CNCF 官方共同出品**，ServiceMesher 社区主办，主题围绕服务网格、Kubernetes 及云原生，在全国各地循环举办的技术沙龙。

本期 Meetup 邀请社区大咖，从服务网格下微服务架构设计、在 5G 时代的应用、如何使用开源的 Traefik 构建云原生边缘路由及蚂蚁金服的服务网格代理演进角度给大家带来精彩分享。

时间：2019年10月26日（周六）13:00-17:0
0地点：成都武侯区蚂蚁C空间
报名方式：点击[这里](https://tech.antfin.com/community/activities/949)，即可锁定席位
