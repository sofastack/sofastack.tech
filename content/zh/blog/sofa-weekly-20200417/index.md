---
title: "SOFA Weekly | SOFATracer 直播预告、SOFAJRaft 组件发布"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2020-04-17T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563524226806-e93607a3-1b77-4ca2-8c3c-0384ab966154.png"
---

**SOFA WEEKLY | 每周精选，筛选每周精华问答**

**同步开源进展，欢迎留言互动**

![SOFA weekly](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1562925824761-fc720f21-9622-437b-a783-0b0729eda119.jpeg)

SOFAStack（Scalable Open Financial Architecture Stack）是蚂蚁金服自主研发的金融级分布式架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

**SOFAStack 官网: **[https://www.sofastack.tech](https://www.sofastack.tech/)

**SOFAStack: **[https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动
我们会筛选重点问题通过 " SOFA WEEKLY " 的形式回复

**1、@杨俊 提问：**

> AT 模式下，当 seata-server 挂掉之后，有未完成的全局事务还在 undo_log 表中，这里有两个问题问一下：
> 1. seata-server 再次重启后，之前未完成的全局事务偶尔会出现回滚失败的问题，就是一直重试，但始终回滚失败，这个问题如何解决？
> 1. seata-server 再次重启后，大多数情况下会成功回滚，但是等待时间过长，感觉要至少3-5分钟才会回滚，这期间涉及到的相关业务服务无法处理其他请求，直至之前的未完成全局事务成功回滚了，才能处理其他请求，请问这个问题如何解决，还有回滚时间在哪里配置能够缩短？
> ※上述两个问题都是基于 seata-sample 产生的。

A：1.  要确认下客户端日志中回滚失败的原因，重启后会恢复重启前未完成的事务。一般是出现脏写数据了，需要人工订正。如果单纯跳过可以删除 server 或 undo_log 对应记录。
2. server.recovery.rollbackingRetryPeriod , 是不是重启前未完成事务过多？

> 好的，谢谢。
> 1. seata-sample 中三个服务，Account、Order 回滚成功，Storage 回滚失败，然后 seata-server 就一直反复重试，seata 和 storage 及其他服务重启也无用，然后手工将日志删除，依然不停重试，最后重启 seata 服务，系统把删掉的日志又给重写到日志表了，但是 log_status 为1，至此不再重试，但是事务未能成功回滚。
> 1. 重启未完成的事务只有那么三个而已，并不多。

A：问题1，你还是要看下回滚失败的原因，客户端日志会打印。 问题2，你提个 issue ，我们排查下。

**2、@吕布 提问：**

> 请教一下, AT 下分支事务提交后释放资源, 虽然资源释放了, 但别的事务操作它时还是被全局锁了, 这种释放的好处体现在哪些方面？
> ![Seata AT](https://cdn.nlark.com/yuque/0/2020/png/226702/1587118952505-68cf797a-b8e3-493d-bdf5-f69f4c5495f5.png)

A：即使你数据库本地事务也是排队执行的，全局锁是 AT 模式的排队机制，所以如果是相同数据主键的这个与连接无关。释放连接是因为数据库连接资源是宝贵的，不会因为连接池连接数不够导致的其他数据无关的事务得不到执行，从更大的层面认为是一定程度提高了吞吐。

> 明白了，一方面就是说提高吞吐, 然后一方面是避免本地事务的间隙锁和表锁, 导致其他不相关数据被锁, 可以说锁粒度变小了。谢谢。

Seata：<https://github.com/seata/seata>

### SOFATracerLab 系列阅读

- [蚂蚁金服分布式链路跟踪组件 SOFATracer 总览 | 剖析](/blog/sofa-tracer-overview/)
- [蚂蚁金服分布式链路跟踪组件 SOFATracer 数据上报机制和源码分析 | 剖析](/blog/sofa-tracer-response-mechanism/)
- [蚂蚁金服分布式链路跟踪组件链路透传原理与SLF4J MDC的扩展能力分析 | 剖析](/blog/sofa-tracer-unvarnished-transmission-slf4j-mdc/)
- [蚂蚁金服分布式链路跟踪组件采样策略和源码 | 剖析](/blog/sofa-tracer-sampling-tracking-deep-dive/)
- [蚂蚁金服分布式链路跟踪组件埋点机制 | 剖析](/blog/sofa-tracer-event-tracing-deep-dive/)

### **SOFA 项目进展**

**本周发布详情如下：**

**发布 SOFAJRaft v1.3.1 版本，主要变更如下：**

- multi raft group 之间共享 timer 和 scheduler 等较重的线程资源，优化 multi group 场景中的多余资源占用；
- 提供 RPC adapter，用户可基于 SPI 扩展不同的 RPC 实现；
- 正式提供稳定的 RocksDBSegmentLogStorage，适合 value 较大的数据存储；
- SOFABolt 升级到 1.6.1，支持 SSL 以及具有更好的小数据包传输能力；
- 引入一个新的数据结构 segment list 来解决 LogManager 中过多的 log memory copy；
- 采纳 nacos 建议，对 raft Task 增加 join API；
- 修复 learner 启动晚于 leader 选举成功时无法复制日志的 bug；
- 致谢（排名不分先后）

[@jovany-wang](https://github.com/jovany-wang) 、[@SteNicholas](https://github.com/SteNicholas) 、[@zongtanghu](https://github.com/zongtanghu) 、[@OpenOpened](https://github.com/penOpened)

详细发布报告：[https://github.com/sofastack/sofa-jraft/issues/420](https://github.com/sofastack/sofa-jraft/issues/420)

### 社区直播报名

![SOFAChannel#15](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1586514943305-3516609c-05db-4f69-b513-ae658173484c.jpeg)

SOFATracer 是蚂蚁金服开源的基于 OpenTracing 规范 的分布式链路跟踪系统，其核心理念就是通过一个全局的 TraceId 将分布在各个服务节点上的同一次请求串联起来。通过统一的 TraceId 将调用链路中的各种网络调用情况以日志的方式记录下来同时也提供远程汇报到 Zipkin 进行展示的能力，以此达到透视化网络调用的目的。

本期直播将通过具体 Demo 带你快速上手 SOFATracer，同时将介绍 SOFATracer 具体功能，并详细介绍其核心关键「埋点机制」的原理。

- 主题：SOFAChannel#15：分布式链路组件 SOFATracer 埋点机制解析
- 时间：2020年4月23日（周四）19:00-20:00
- 嘉宾：卫恒 SOFATracer 开源负责人
- 形式：线上直播
- 报名方式：点击“[这里](https://tech.antfin.com/community/live/1167)”，即可报名
