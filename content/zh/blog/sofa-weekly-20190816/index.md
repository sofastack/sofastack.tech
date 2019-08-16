---
title: "SOFA Weekly | 每周精选【8/12 - 8/16】"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2019-08-16T16:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563524226806-e93607a3-1b77-4ca2-8c3c-0384ab966154.png"
---

**SOFA WEEKLY | 每周精选，筛选每周精华问答**
**同步开源进展，欢迎留言互动**

![weekly.jpg](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1562925824761-fc720f21-9622-437b-a783-0b0729eda119.jpeg)

SOFAStack（Scalable Open Financial Architecture Stack）是蚂蚁金服自主研发的金融级分布式架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

**SOFAStack 官网: **[https://www.sofastack.tech](https://www.sofastack.tech/)

**SOFAStack: **[https://github.com/sofastack](https://github.com/sofastack)

### 本周推荐阅读

- [分布式事务 Seata Saga 模式首秀以及三种模式详解 |  Meetup#3 回顾](https://www.sofastack.tech/blog/sofa-meetup-3-seata-retrospect/)
- [中国移动苏州研发中心消息队列高可用设计之谈 | SOFAStack 用户说](https://www.sofastack.tech/blog/sofa-jraft-user-china-mobile/)
- [溢米教育推荐平台的效率与稳定性建设 | SOFAStack 用户说](https://www.sofastack.tech/blog/sofastack-user-yimi/)

### SOFA 项目进展

**本周发布详情如下：**

**发布 SOFAJRaft v1.2.6, 主要变更如下：**
- i. 修复 ReadIndex 并发情况下可能出现的读超时
- ii. 保存 raft meta 失败后终止状态机
- iii. 增加 LogEntry checksum validation
- iv. 优化 log replication 线程模型减少锁竞争
- v. 优化 RheaKV multi group snapshot
- vi. 致谢（排名不分先后）[@SteNicholas](https://github.com/SteNicholas) [@zongtanghu](https://github.com/zongtanghu)

详细参考发布报告：[https://github.com/sofastack/sofa-jraft/releases/tag/1.2.6](https://github.com/sofastack/sofa-jraft/releases/tag/1.2.6)

### SOFA 活动推荐 

![channel8](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1565935546514-0a0cad8d-7d94-4f97-8bd0-00dc24b8ddb3.jpeg)

<SOFA:Channel/>线上直播第 8 期《**从一个例子开始体验 SOFAJRaft》**报名中~

8 月 29 日周四晚 7 点，将邀请 SOFAJRaft 开源负责人力鲲，从一个 SOFAJRaft 实例出发，带大家体验 SOFAJRaft 的应用。
在本次直播中，我们将重点放在如何去使用这个工具上，用示例来说明如何使用 SOFAJRaft 实现自己的分布式应用。在此过程中，我们会对涉及到的一些 SOFAJRaft 经典概念进行讲解。

| 点击“[**这里**](https://tech.antfin.com/community/live/821)”即可报名

| 本期将带来：

- 如何使用 SOFAJRaft 实现自己的分布式应用
- 基于实例理解 SOFAJRaft 中的概念和术语

| 加入 SOFA 钉钉互动群
欢迎加入直播互动钉钉群：23390449（搜索群号加入即可）