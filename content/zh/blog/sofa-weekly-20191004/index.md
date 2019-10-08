---
title: "SOFA Weekly | 每周精选【9/30 - 10/4】"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2019-10-04T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563524226806-e93607a3-1b77-4ca2-8c3c-0384ab966154.png"
---

**SOFA WEEKLY | 每周精选，筛选每周精华问答**
**同步开源进展，欢迎留言互动**

![weekly.jpg](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1562925824761-fc720f21-9622-437b-a783-0b0729eda119.jpeg)

SOFAStack（Scalable Open Financial Architecture Stack）是蚂蚁金服自主研发的金融级分布式架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

**SOFAStack 官网: **[https://www.sofastack.tech](https://www.sofastack.tech/)

**SOFAStack: **[https://github.com/sofastack](https://github.com/sofastack)

### SOFALab 系列文章

十一特刊带来 SOFALab 系列源码解析文章集合~

#### <SOFA:RPCLab/> 系列文章

- [【剖析 | SOFARPC 框架】系列之总体设计与扩展机制](https://www.sofastack.tech/blog/sofa-rpc-framework-overall-extension/)
- [【剖析 | SOFARPC 框架】系列之链路追踪剖析](https://www.sofastack.tech/blog/sofa-rpc-link-tracking/)
- [【剖析 | SOFARPC 框架】系列之连接管理与心跳剖析](https://www.sofastack.tech/blog/sofa-rpc-connection-management-heartbeat-analysis/)
- [【剖析 | SOFARPC 框架】系列之 SOFARPC 同步异步实现剖析](https://www.sofastack.tech/blog/sofa-rpc-synchronous-asynchronous-implementation/)
- [【剖析 | SOFARPC 框架】系列之 SOFARPC 线程模型剖析](https://www.sofastack.tech/blog/sofa-rpc-threading-model/)
- [【剖析 | SOFARPC 框架】系列之 SOFARPC 单机故障剔除剖析](https://www.sofastack.tech/blog/sofa-rpc-single-machine-fault-culling/)
- [【剖析 | SOFARPC 框架】系列之 SOFARPC 泛化调用实现剖析](https://www.sofastack.tech/blog/sofa-rpc-generalized-call-implementation/)
- [【剖析 | SOFARPC 框架】系列之 SOFARPC 数据透传剖析](https://www.sofastack.tech/blog/sofa-rpc-data-transmission/)
- [【剖析 | SOFARPC 框架】系列之 SOFARPC 优雅关闭剖析](https://www.sofastack.tech/blog/sofa-rpc-graceful-exit/)
- [【剖析 | SOFARPC 框架】系列之 SOFARPC 路由实现剖析](https://www.sofastack.tech/blog/sofa-rpc-routing-implementation/)
- [【剖析 | SOFARPC 框架】系列之 SOFARPC 注解支持剖析](https://www.sofastack.tech/blog/sofa-rpc-annotation-support/)
- [【剖析 | SOFARPC 框架】系列之 SOFARPC 跨语言支持剖析](https://www.sofastack.tech/blog/sofa-rpc-cross-language-support/)
- [【剖析 | SOFARPC 框架】系列之 SOFARPC 序列化比较](https://www.sofastack.tech/blog/sofa-rpc-serialization-comparison/)

#### <SOFA:BoltLab/> 系列文章

- [蚂蚁金服通信框架SOFABolt解析 | 编解码机制](https://www.sofastack.tech/blog/sofa-bolt-codec-deep-dive/)
- [蚂蚁金服通信框架SOFABolt解析 | 序列化机制(Serializer)](https://www.sofastack.tech/blog/sofa-bolt-serialization-deep-dive/)
- [蚂蚁金服通信框架SOFABolt解析 | 协议框架解析](https://www.sofastack.tech/blog/sofa-bolt-framework-deep-dive/)
- [蚂蚁金服通信框架SOFABolt解析 | 连接管理剖析](https://www.sofastack.tech/blog/sofa-blot-connection-management-deep-dive/)
- [蚂蚁金服通信框架SOFABolt解析 | 超时控制机制及心跳机制](https://www.sofastack.tech/blog/sofa-bolt-timeout-and-heart-beat-deep-dive/)

#### <SOFA:TracerLab/> 系列文章

- [蚂蚁金服分布式链路跟踪组件 SOFATracer 总览 | 剖析](https://www.sofastack.tech/blog/sofa-tracer-overview/)
- [蚂蚁金服分布式链路跟踪组件 SOFATracer 数据上报机制和源码分析 | 剖析](https://www.sofastack.tech/blog/sofa-tracer-response-mechanism/)
- [蚂蚁金服分布式链路跟踪组件链路透传原理与SLF4J MDC的扩展能力分析 | 剖析](https://www.sofastack.tech/blog/sofa-tracer-unvarnished-transmission-slf4j-mdc/)
- [蚂蚁金服分布式链路跟踪组件采样策略和源码 | 剖析](https://www.sofastack.tech/blog/sofa-tracer-sampling-tracking-deep-dive/)
- [蚂蚁金服分布式链路跟踪组件埋点机制 | 剖析](https://www.sofastack.tech/blog/sofa-tracer-event-tracing-deep-dive/)

#### <SOFA:JRaftLab/> 系列文章

- [SOFAJRaft Snapshot 原理剖析 | SOFAJRaft 实现原理](https://www.sofastack.tech/blog/sofa-jraft-snapshot-principle-analysis/)
- [SOFAJRaft-RheaKV 分布式锁实现剖析　| SOFAJRaft 实现原理](https://www.sofastack.tech/blog/sofa-jraft-rheakv-distributedlock/)
- [SOFAJRaft 日志复制 - pipeline 实现剖析 | SOFAJRaft 实现原理](https://www.sofastack.tech/blog/sofa-jraft-pipeline-principle/)
- [SOFAJRaft-RheaKV MULTI-RAFT-GROUP 实现分析 | SOFAJRaft 实现原理](https://www.sofastack.tech/blog/sofa-jraft-rheakv-multi-raft-group/)
- [SOFAJRaft 选举机制剖析 | SOFAJRaft 实现原理](https://www.sofastack.tech/blog/sofa-jraft-election-mechanism/)
- [SOFAJRaft 线性一致读实现剖析 | SOFAJRaft 实现原理](https://www.sofastack.tech/blog/sofa-jraft-linear-consistent-read-implementation/)
- [SOFAJRaft-RheaKV 是如何使用 Raft 的 | SOFAJRaft 实现原理](https://www.sofastack.tech/blog/sofa-jraft-rheakv/)
- [生产级 Raft 算法库 SOFAJRaft 存储模块剖析 | SOFAJRaft 实现原理](https://www.sofastack.tech/blog/sofa-jraft-algorithm-storage-module-deep-dive/)

### SOFA 项目进展

**本周发布详情如下：**

**1、发布 SOFARPC v5.5.8，主要变更如下：**

- 优化 log4j2 日志异步化
- 修复故障剔除模块的事件接收问题
- 修复 tracelog 日志 local 地址打印不正确的问题
- 优化泛化调用的方法名显示
- 修复特殊场景下的泛化调用超时设置

详细发布报告：[https://github.com/sofastack/sofa-rpc/releases/tag/v5.5.8](https://github.com/sofastack/sofa-rpc/releases/tag/v5.5.8)