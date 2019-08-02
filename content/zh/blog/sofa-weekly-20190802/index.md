---
title: "SOFA Weekly | 每周精选【7/29- 8/2】"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2019-08-02T16:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563524226806-e93607a3-1b77-4ca2-8c3c-0384ab966154.png"
---

**SOFA WEEKLY | 每周精选，筛选每周精华问答**

**同步开源进展，欢迎留言互动**

![weekly](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1562925824761-fc720f21-9622-437b-a783-0b0729eda119.jpeg)

SOFAStack（Scalable Open Financial Architecture Stack）是蚂蚁金服自主研发的金融级分布式架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

**SOFAStack 官网: **[https://www.sofastack.tech](https://www.sofastack.tech/)

**SOFAStack: **[https://github.com/sofastack](https://github.com/sofastack)

## 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动

我们会筛选重点问题通过 

" SOFA WEEKLY " 的形式回复

**@屈冉** 提问：

> SOFAJRaft 目前支持 Multi-Raft 嘛?

A：支持的，可以参考 rheakv 实现，就是用的 multi raft group。

> 好的，另外想问一下，SOFAJRaft 有没有和 Braft 的性能比较数据，或者同类实现的？

A：这里有一份 Benchmark 数据可以参考一下，我们暂时没有计划和同类实现对比性能：

[https://github.com/sofastack/sofa-jraft/wiki/Benchmark-%E6%95%B0%E6%8D%AE](https://github.com/sofastack/sofa-jraft/wiki/Benchmark-%E6%95%B0%E6%8D%AE)

## SOFA 开源系列

- [SoloPi：支付宝 Android 专项测试工具 | 开源](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247485318&idx=1&sn=559faadf50084a40ec43d5b3a15042c8&chksm=faa0e85ccdd7614aea1f80f8c4e163bb262acdce18155223bf3eb9c8494475bf1b60fefe729d&scene)
- [蚂蚁金服开源服务注册中心 SOFARegistry | SOFA 开源](https://www.sofastack.tech/blog/sofa-meetup-1-registry/)
- [蚂蚁金服分布式事务开源以及实践 | SOFA 开源](https://www.sofastack.tech/blog/sofa-meetup-1-seata/)
- [蚂蚁金服开源自动化测试框架 SOFAACTS](https://www.sofastack.tech/blog/sofa-acts-automated-testing-framework/)
- [蚂蚁金服开源 SOFAJRaft：生产级 Java Raft 算法库](https://www.sofastack.tech/blog/sofa-jraft-production-level-algorithm-library/)

## SOFA 项目进展

**本周发布详情如下：**

**1、发布 SOFATracer 2.4.1/3.0.6, 主要变更如下：**

i.  升级 Dubbo 版本至 2.7.3.

ii. 修复 Dubbo 插件中相关埋点参数获取问题

iii. 修复 Datasource 埋点中的若干问题

iv. Cheery pick 代码优化至 3.x 分支

详细发布报告：

[https://github.com/sofastack/sofa-tracer/releases/tag/v2.4.1](https://github.com/sofastack/sofa-tracer/releases/tag/v2.4.1)

[https://github.com/sofastack/sofa-tracer/releases/tag/v3.0.6](https://github.com/sofastack/sofa-tracer/releases/tag/v3.0.6)

**2、发布 SOFA MOSN v0.6.0，主要变更如下：**

i. Listener 支持配置空闲连接超时关闭

ii. 日志新增 Alertf 接口

iii. 支持 SDS 方式获取证书

iv. Metrics统计与输出优化

v. IO 协程优化

vi. 后端模块实现重构，提升了动态更新性能，降低了内存的使用

vii. racer 模块实现重构，支持更完善的扩展机制

详细发布报告：

[https://github.com/sofastack/sofa-mosn/releases/tag/0.6.0](https://github.com/sofastack/sofa-mosn/releases/tag/0.6.0)

## SOFA 活动推荐

![SOFAMeetup#3](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1564729714652-f171355e-4c8d-408c-9e3d-ab287ec989e6.jpeg)

SOFA Meetup #3 广州站**《从开源技术到产品能力》**报名进行中~

本期 SOFA Meetup 将带来开源技术：SOFARPC、Seata 模式详解以及发展进程，并拓展分享云原生产品能力，更有无线自动化测试框架 SoloPi 的首秀分享~

8 月 11 日，我们广州见~

报名方式：点击“[**这里**](https://tech.antfin.com/community/activities/779)”即可报名。