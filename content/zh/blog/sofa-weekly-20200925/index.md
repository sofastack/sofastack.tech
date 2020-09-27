---
title: "SOFA Weekly | SOFABolt 源码解析合辑、CSDI summit 活动预告"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2020-09-25T15:00:00+08:00
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

**@刘源远** 提问：

> 请教一下大家，这个本地事务提交，是指这个本地事务在分布式事务中提交，还是指在自己的事务中提交啊？
> 如果是指分布式事务中提交，那不就应该在分支事务提交之前，才存在回滚嘛？如果是指自己的事务中提交，那我断点下来，本地业务事务已经提交了，为什么还产生这条记录呢？
> ![提问](https://cdn.nlark.com/yuque/0/2020/png/226702/1601188821699-842c1b7e-e706-4d40-be78-c21032ede80e.png)

A：只要二阶段回滚的时候，发现你的 undolog 没插入就会做一条防御性的 undolog，你可以认为你没产生资源悬挂，但是二阶段确实没读到你的 undolog。所以才会插入一个防御性，你完全不需要理会 status=1 的记录。

> 奇怪的是，我断点下来，在一阶段会产生 undolog 记录（两条），然后抛异常回滚之后，一阶段的 undolog 记录（两条）被删除了，产生一条 status=1 的记录。会不会是因为某些原因，一阶段会产生 undolog 记录被删除了，所有二阶段没有查询到？

A： 多数据源？

> 对的，多数据源。

A：确认下是不是重复代理了？把自动代理关了，一般多数据源都是已经手动代理了，因为二阶段的时候，下发找 datasource，找到的不是你当时操作数据库的 datasource，导致没发现 undolog，就插了一条 status=1。

> 我现在手动配置代理，有两个数据源，一个用了 DataSourceProxy，一个没有。现在处于分布式事务中是使用了 DataSourceProxy 的数据源，但是回滚后还是会产生一条 status=1 的 undolog。

A： 自动代理关了吗，看下怎么代理的。

> 你指的自动代理是 springboot-start 吗？还是其他的？

A：Seata 的数据源自动代理，设置 Seata:
  enable-auto-data-source-proxy: false

> OK，好啦

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

### 本周推荐阅读

- [蚂蚁金服通信框架 SOFABolt 解析 | 超时控制机制及心跳机制](/blog/sofa-bolt-timeout-and-heart-beat-deep-dive/)
- [蚂蚁金服通信框架 SOFABolt 解析 | 连接管理剖析](/blog/sofa-blot-connection-management-deep-dive/)
- [蚂蚁金服通信框架 SOFABolt 解析 | 协议框架解析](/blog/sofa-bolt-framework-deep-dive/)
- [蚂蚁金服通信框架 SOFABolt 解析 | 序列化机制(Serializer)](/blog/sofa-bolt-serialization-deep-dive/)
- [蚂蚁金服通信框架 SOFABolt 解析 | 编解码机制](/blog/sofa-bolt-codec-deep-dive/)

### 社区活动预告

![CSDI summit 中国软件研发管理行业技术峰会](https://cdn.nlark.com/yuque/0/2020/png/226702/1601189501239-6958d749-c5d6-4584-b3e2-4d4410b9b4f7.png)

CSDI summit 中国软件研发管理行业技术峰会（Software development management industry technology summit）由国内专业咨询机构百林哲匠心打造的软件行业技术领域顶级盛会，将于2020年9月24-27日举办。
话题涵盖：组织数字化转型、研发效能、产品创新、用户增长、云原生、架构创新、微服务、AI 大数据、数据安全和云安全、AIOT 实践等方面。蚂蚁集团也应邀参与本次大会分享。

**分享主题**：**金融级云原生 PaaS 实践之路**

**分享嘉宾：**成旻 蚂蚁金服高级技术专家

**分享时间：**2020-09-26 16:40 - 18:00

**分享亮点：**

- 蚂蚁 PaaS 产品的缘起；
- 经典应用服务的能力和特色；
- 容器应用服务的进阶能力；
- 面向未来--混合云发展发向；

**活动形式：**线上峰会

**活动详情：**点击“[**这里**](https://www.bagevent.com/event/6540795?aId=1693921)”，了解日程详情
