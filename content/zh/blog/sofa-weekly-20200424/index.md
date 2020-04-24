---
title: "SOFA Weekly | Service Mesh 系列直播预告、Seata 发布"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "【04/20-04/24】 | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2020-04-24T18:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563524226806-e93607a3-1b77-4ca2-8c3c-0384ab966154.png"
---

**SOFA WEEKLY | 每周精选，筛选每周精华问答**

**同步开源进展，欢迎留言互动**

![weekly.jpg](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1562925824761-fc720f21-9622-437b-a783-0b0729eda119.jpeg)

SOFAStack（Scalable Open Financial Architecture Stack）是蚂蚁金服自主研发的金融级分布式架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

**SOFAStack 官网: **[https://www.sofastack.tech](https://www.sofastack.tech/)

**SOFAStack: **[https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动
我们会筛选重点问题通过 " SOFA WEEKLY " 的形式回复

**@闫圣哲** 提问：

> 请问：关于 SOFAJRaft 线性读，为什么读失败了要应用到状态机呢，是为了拉齐 readindex 吗？

A：线性一直读不走 raft log （应该是你说的状态机的意思），在 rheakv 里面，如果线性一直读失败了，那么会和write操作一样通过 raft log 达成一致再走状态机读，这是个兜底策略，否则 readIndex 失败了能怎么办呢？ 另一只方式就是直接返回用户失败了。可以具体看一下「JRaft 实现细节解析之高效的线性一致读」这一小节的内容～

[https://www.sofastack.tech/projects/sofa-jraft/consistency-raft-jraft/](https://www.sofastack.tech/projects/sofa-jraft/consistency-raft-jraft/)

SOFAJRaft：[https://github.com/sofastack/sofa-jraft](https://github.com/sofastack/sofa-jraft)

### SOFA 项目进展

**本周发布详情如下：**

**发布 Seata v1.2.0 版本，主要变更如下：**

- 支持 XA 事务模式；
- 支持事务传播机制；
- 支持批量更新和删除 SQL；
- TCC 模式支持 hsf 服务调用；
- Saga 模式性能优化默认不注册分支事务等；

本次发布涉及代码改动文件数 324个，代码行 +11,907 −3,437。   
此版本在 feature 和稳定性相对 1.1.0 版本都有较大幅度增强，强烈推荐大家验证和升级到此版本。 

详细发布报告：[https://seata.io/zh-cn/blog/download.html](https://seata.io/zh-cn/blog/download.html)

### Service Mesh 大规模落地系列

- [蚂蚁金服 Service Mesh 大规模落地系列 - 质量篇](/blog/service-mesh-practice-in-production-at-ant-financial-part8-quantity/)
- [蚂蚁金服 Service Mesh 大规模落地系列 - 控制面篇](/blog/service-mesh-practice-in-production-at-ant-financial-part7-control-plane/)
- [蚂蚁金服 Service Mesh 大规模落地系列 - Operator 篇](/blog/service-mesh-practice-in-production-at-ant-financial-part6-operator/)
- [蚂蚁金服 Service Mesh 大规模落地系列 - 网关篇](/blog/service-mesh-practice-in-production-at-ant-financial-part5-gateway/)
- [蚂蚁金服 Service Mesh 大规模落地系列 - RPC 篇](/blog/service-mesh-practice-in-production-at-ant-financial-part4-rpc/)
- [蚂蚁金服 Service Mesh 大规模落地系列 - 运维篇](/blog/service-mesh-practice-in-production-at-ant-financial-part3-operation/)
- [蚂蚁金服 Service Mesh 大规模落地系列 - 消息篇](/blog/service-mesh-practice-in-production-at-ant-financial-part2-mesh/)
- [蚂蚁金服 Service Mesh 大规模落地系列 - 核心篇](/blog/service-mesh-practice-in-production-at-ant-financial-part1-core/)
- [Service Mesh 落地负责人亲述：蚂蚁金服双十一四大考题](/blog/service-mesh-practice-antfinal-shopping-festival-big-exam/)

### 社区直播报名

![Detail Banner#.jpg](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1587728387529-17191abc-9201-464f-ac0e-488668850c2c.jpeg)

本期为第一期 Service Mesh Virtual Meetup 线上系列直播第一期，邀请了四位来自不同公司的嘉宾，从四个角度对 Service Mesh 的应用实践展开分享。

本次线上 meetup 分享涵盖 Service Mesh 的可观察性和生产实践。为大家介绍 Service Mesh 中的可观察性与传统微服务中可观察性的区别，如何使用 SkyWalking 来观测 Service Mesh，还有来自百度和陌陌的 Service Mesh 生产实践。

本系列采用线上直播的形式，从 5 月 6 日开始到 5 月 14 日，每周三、周四晚上  19:00-20:00 我们相约进行一个主题分享。

观看直播方式：保存图片扫码 或 点击“[这里](https://live.bilibili.com/21954520)”，关注直播间，即可观看直播

![活动议程.jpg](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1587728453641-e8fb215b-5a05-4684-b258-7c04293c4873.jpeg)
