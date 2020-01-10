---
title: "SOFA Weekly | SOFABoot 发版、直播回顾、SOFAArkLab共建启动"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "【01/05-01/10】 | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2020-01-10T16:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563524226806-e93607a3-1b77-4ca2-8c3c-0384ab966154.png"
---

**SOFA WEEKLY | 每周精选，筛选每周精华问答**
**同步开源进展，欢迎留言互动**

![weekly.jpg](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1562925824761-fc720f21-9622-437b-a783-0b0729eda119.jpeg)

SOFAStack（Scalable Open Financial Architecture Stack）是蚂蚁金服自主研发的金融级分布式架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

**SOFAStack 官网: **[https://www.sofastack.tech](https://www.sofastack.tech/)

**SOFAStack: **[https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动
我们会筛选重点问题通过 " SOFA WEEKLY " 的形式回复

**1、@李彦迎** 提问：

> TCC 模式我可以作为 Saga 模式使用不？譬如 try 为空，永远成功。

A：可以，不过应该是 confirm 为空，不是 try 为空。

> 请问 Seata 的 Saga 模式能支持 DB2 数据库吗？

A：可以支持 DB2。

> 请教基础问题：Gateway 调用微服务 A、B，B内部失败了，补偿交易应该回退A的，这个补偿交易应该定义在微服A里面还是微服务B里面？

A：原服务是谁提供的，补偿服务就应该谁提供。

> 请问能否 Client 用 DB2，Server 用 MySQL? Client 的必须和业务数据库保持一致吧？

A：也可以的。是的，Client端必须与业务数据库保持一致。

**2、@米晓飞** 提问：

> Saga 和现有框架有啥区别呢，优劣比较？

A：我们在实践中发现，长流程的业务场景，往往有服务编排的需求，同时又要保证服务之间的数据一致性。目前开源社区也有一些 Saga 事务框架，也有一些服务编排的框架，但是它们要么只有 Saga 事务处理能力、要么只有服务编排能力，Seata Saga 是将这两者能力非常优雅的结合在一起，为用户提供一个简化研发、降低异常处理难度、高性能事件驱动的产品。

**3、@张春雨** 提问：

> Saga 的模式补偿和 XA 回滚有啥区别呀？

A：XA 是数据库提交的两阶段提交协议，Saga 的是需要业务层来实现的。

> Seata server 端使用 mysql 去记录事务日志,感觉性能上不是很好、  有没有其他的可替代的持久化方案吗？

A：Seata 每个模块都设计有 SPI，持久化也一样，未来可以扩展更多持久化方式。
Seata：[https://github.com/seata/seata](https://github.com/seata/seata)
更多关于 Seata Saga 的内容可以看下文直播回顾。

**4、@FAN **提问：

> MOSN 的平滑升级原理是什么？跟 Nginx 和 Envoy 的区别是什么？

A：MOSN 的平滑升级方案和 Envoy 类似，都是通过 UDS 来传递 listener fd。但是其比 Envoy 更厉害的地方在于它可以把老的连接从 Old MOSN 上迁移到 New MOSN 上。也就是说把一个连接从进程 A 迁移到进程 B，而保持连接不断！Nginx 的实现是兼容性最强的。
可以详细阅读：[https://ms2008.github.io/2019/12/28/hot-upgrade/](https://ms2008.github.io/2019/12/28/hot-upgrade/)
MOSN：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

### SOFAArkLab 系列

- [蚂蚁金服轻量级类隔离框架概述 | SOFAArk 源码解析](/blog/sofa-ark-overview/)

本篇开始将正式启动<SOFA:ArkLab/>源码共建系列，在此对长期以来对 SOFAStack 关注的朋友表示感谢。文中附共建列表，欢迎领取共建~

### SOFAChannel 集锦

- [Seata 长事务解决方案 Saga 模式 | SOFAChannel#10 回顾](/blog/sofa-channel-10-retrospect/)
- [从一个例子开始体验 SOFAJRaft | SOFAChannel#8 直播整理](/blog/sofa-channel-8-retrospect/)
- [自定义资源 CAFEDeployment 的背景、实现和演进 | SOFAChannel#7 直播整理](/blog/sofa-channel-7-retrospect/)
- [蚂蚁金服轻量级监控分析系统解析 | SOFAChannel#6 直播整理](/blog/sofa-channel-6-retrospect/)
- [给研发工程师的代码质量利器 | SOFAChannel#5 直播整理](/blog/sofa-channel-5-retrospect/)
- [分布式事务 Seata TCC 模式深度解析 | SOFAChannel#4 直播整理](/blog/sofa-channel-4-retrospect/)
- [SOFARPC 性能优化实践（下）| SOFAChannel#3 直播整理](/blog/sofa-channel-3-retrospect/)
- [SOFARPC 性能优化实践（上）| SOFAChannel#2 直播整理](/blog/sofa-channel-2-retrospect/)
- [从蚂蚁金服微服务实践谈起 | SOFAChannel#1 直播整理](/blog/sofa-channel-1-retrospect/)

### SOFA 项目进展

**本周发布详情如下：**

**1、发布 MOSN v3.2.2 版本，主要变更如下：**

- ReadinessCheckListener 的 Order 过高
- 删除 jaxrs-api 依赖项

详细发布报告：<https://github.com/sofastack/sofa-boot/releases/tag/v3.2.2>