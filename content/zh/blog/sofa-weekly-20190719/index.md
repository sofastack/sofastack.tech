---
title: "SOFA Weekly | 每周精选【7/15 - 7/19】"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2019-07-19T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563524226806-e93607a3-1b77-4ca2-8c3c-0384ab966154.png"
---

**SOFA WEEKLY | 每周精选，筛选每周精华问答**
**同步开源进展，欢迎留言互动**

<img src="https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1562925824761-fc720f21-9622-437b-a783-0b0729eda119.jpeg" width=100%>

SOFAStack（Scalable Open Financial Architecture Stack）是蚂蚁金服自主研发的金融级分布式架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

**SOFAStack 官网: **[https://www.sofastack.tech](https://www.sofastack.tech/)
**SOFAStack: **[https://github.com/sofastack](https://github.com/sofastack)

## 社区 Big News

**NO.1 社区新认证一位 Committer**

[@SteNicholas](https://github.com/SteNicholas) 成为 SOFAJRaft Committer。

**主要贡献**

一、贡献了 SOFAJRaft 源码剖析系列一共三篇文章

- 蚂蚁金服生产级 Raft 算法库 SOFAJRaft 存储模块剖析 | SOFAJRaft 实现原理
- SOFAJRaft-RheaKV 是如何使用 Raft 的 | SOFAJRaft 实现原理
- SOFAJRaft 线性一致读实现剖析 | SOFAJRaft 实现原理

二、贡献了 4 个 feature PR

- Multi-raft-group 的手动集群 Leader 平衡实现
- 实现了 RheaKV 的 CompareAndPut API
- 实现了 RheaKV 的 putIfAbsent batch 优化
- 实现了 RheaKV 的 batch delete API

目前，社区已经认证超过四十位 Committer。
感谢对 SOFAStack 的支持和帮助~

也欢迎你加入 SOFAStack community，指南：

[https://github.com/sofastack/community](https://github.com/sofastack/community)

## SOFARegistryLab 系列阅读

- [蚂蚁金服服务注册中心 SOFARegistry 解析 | 服务发现优化之路](https://www.sofastack.tech/blog/sofa-registry-service-discovery-optimization/)
- [海量数据下的注册中心 - SOFARegistry 架构介绍](/blog/sofa-registry-introduction/)
- [蚂蚁金服开源服务注册中心 SOFARegistry | SOFA 开源一周年献礼](https://www.sofastack.tech/blog/sofa-registry-deep-dive/)

## SOFAChannel 回顾集合

- SOFAChannel#7：[自定义资源 CAFEDeployment 的背景、实现和演进 | SOFAChannel#7 直播整理](https://www.sofastack.tech/blog/sofa-channel-7-retrospect/)
- SOFAChannel#6：[蚂蚁金服轻量级监控分析系统解析 | SOFAChannel#6 直播整理](https://www.sofastack.tech/blog/sofa-channel-6-retrospect/)
- SOFAChannel#5：[给研发工程师的代码质量利器 | SOFAChannel#5 直播整理](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247485058&idx=1&sn=ff5c79234a34b27f694630f70593789d&chksm=faa0e958cdd7604efe5ab3600b807d5e5580b283b799bb09b6386af314f5ace8ec166e3b54f0&scene=21)
- SOFAChannel#4：[分布式事务 Seata TCC 模式深度解析 | SOFAChannel#4 直播整理](https://www.sofastack.tech/blog/sofa-channel-4-retrospect/)
- SOFAChannel#3：[SOFARPC 性能优化实践（下）| SOFAChannel#3 直播整理](https://www.sofastack.tech/blog/sofa-channel-3-retrospect/)
- SOFAChannel#2：[SOFARPC 性能优化实践（上）| SOFAChannel#2 直播整理](https://www.sofastack.tech/blog/sofa-channel-2-retrospect/)
- SOFAChannel#1：[从蚂蚁金服微服务实践谈起 | SOFAChannel#1 直播整理](https://www.sofastack.tech/blog/sofa-channel-1-retrospect/)

## SOFA 项目进展

**本周发布详情如下**

SOFAActs 1.0.1 版本发布，主要变更如下：

- 插件兼容性问题修复

详细参考 [发布报告](https://github.com/sofastack/sofa-acts/releases/tag/1.0.1)
