---
title: "SOFA Weekly | MOSN QA 整理、SOFAChannel 线上直播合集"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "【10/05-10/09】 | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2020-10-09T15:00:00+08:00
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

**1、@叶翔宇** 提问：
> 想请教一个问题，使用 MOSN 的过程中，我们想通过 request 的 header 中带的 version 信息来实现灰度的机制。比如：目标 service 有 3 个 host，其中一台版本1.0，其他两个版本2.0。

A：你这个加一个 route 的判断就可以路由到不同的 cluster 了。

> 我们的是同一个 cluster 里面的不同 hosts...

A：你就把不同版本的 hosts 归为不同的 cluster 就可以啦。

**2、@李样兵** 提问：
> 我们现在生产环境中没有使用 K8s, 只使用 MOSN+自定义配置和注册中心，可行吗？

A：你们是 Dubbo 么？

> 对，dubbo+http， 生产环境是 docker 还没有 K8s。

A：你可以用这个方案，MOSN 直接连接注册中心。
[https://github.com/mosn/mosn/issues/1087](https://github.com/mosn/mosn/issues/1087)
MOSN：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

### 线上直播 SOFAChannel 合集

- [人人都可以“机密计算”：Occlum 使用入门和技术揭秘 | 开源](/blog/sofa-channel-18-retrospect/)
- [蚂蚁集团网络通信框架 SOFABolt 功能介绍及协议框架解析 | 开源](/blog/sofa-channel-17-retrospect/)
- [不得不说的云原生隔离性 | SOFAChannel#16 直播回顾](/blog/sofa-channel-16-retrospect/)
- [蚂蚁金服分布式链路组件 SOFATracer 埋点机制解析 | SOFAChannel#15 直播整理](/blog/sofa-channel-15-retrospect/)
- [云原生网络代理 MOSN 扩展机制解析 | SOFAChannel#14 直播整理](/blog/sofa-channel-14-retrospect/)
- [云原生网络代理 MOSN 多协议机制解析 | SOFAChannel#13 直播整理](/blog/sofa-channel-13-retrospect/)
- [蚂蚁金服分布式事务实践解析 | SOFAChannel#12 直播整理](/blog/sofa-channel-12-retrospect/)
- [从一个例子开始体验轻量级类隔离容器 SOFAArk | SOFAChannel#11 直播整理](/blog/sofa-channel-11-retrospect/)
- [Seata 长事务解决方案 Saga 模式 | SOFAChannel#10 回顾](/blog/sofa-channel-10-retrospect/)
- [从一个例子开始体验 SOFAJRaft | SOFAChannel#8 直播整理](/blog/sofa-channel-8-retrospect/)
- [蚂蚁金服轻量级监控分析系统解析 | SOFAChannel#6 直播整理](/blog/sofa-channel-6-retrospect/)
- [给研发工程师的代码质量利器 | SOFAChannel#5 直播整理](/blog/sofa-channel-5-retrospect/)
- [分布式事务 Seata TCC 模式深度解析 | SOFAChannel#4 直播整理](/blog/sofa-channel-4-retrospect/)
- [SOFARPC 性能优化实践（下）| SOFAChannel#3 直播整理](/blog/sofa-channel-3-retrospect/)
- [SOFARPC 性能优化实践（上）| SOFAChannel#2 直播整理](/blog/sofa-channel-2-retrospect/)
- [从蚂蚁金服微服务实践谈起 | SOFAChannel#1 直播整理](/blog/sofa-channel-1-retrospect/)
