---
title: "SOFA Weekly | sofa-common-tools 发布、组件解析合辑、云原生活动推荐"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2020-08-28T15:00:00+08:00
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

1**、@晏伦** 提问：

> 请问 Seata 的全局锁粒度是数据库级别还是表级别？全局锁会带来并发的问题吧？如何权衡的呢？

A：全局锁是行级别的；如果2个事务在同时更新同一行，会出现锁竞争问题，所以 AT 模式的适用场景是并发请求较低，不会产生行锁竞争的业务场景。

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

### 本周推荐阅读

- [少年五年升阿里 P8，他如何从低谷登上“光明顶”？](/blog/five-years-to-ali-p8/)
- [支付宝资深技术专家尹博学：新一代金融核心突破之全分布式单元化技术架构](/blog/antgroup-yinboxue-fully-distributed-unitized-technology-architecture/)
- [Forrester中国首席分析师戴鲲：云原生技术趋向成熟，金融企业选择云原生平台需满足三大要求](/blog/forrester-daipeng-white-paper-cloud-native/)

### 组件解析部分合辑

- [基于 RAFT 的生产级高性能 Java 实现 - SOFAJRaft 系列内容合辑](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247486702&idx=1&sn=6fd48197893a8dd5546a8c7669430297&chksm=faa0e334cdd76a229640d3b3d8f779ada8ba706ccf1b0a89b8d0786e025e2f1da4400cb5bd35&scene=21)
- [生产级高性能 Java RPC 框架 - SOFARPC 系列内容合辑](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247486661&idx=1&sn=bdb81cff1b48750e66e066565336db6a&chksm=faa0e31fcdd76a0901d99af8455b4113c32f17f8fdad1c7810de5f940dc66593b4276d61a73c&scene=21)

### SOFA 项目进展

**发布 sofa-common-tools v1.2.0 版本，主要变更如下：**

- 修复多线程日期打印问题；
- SOFAThreadPool 支持一个 Runnable 在多个 thread 运行；
- 停止 JDK6 支持；

详细发布报告：[https://github.com/sofastack/sofa-common-tools/releases/tag/v1.2.0](https://github.com/sofastack/sofa-common-tools/releases/tag/v1.2.0)

### 社区活动预告

![CSDI summit](https://cdn.nlark.com/yuque/0/2020/png/226702/1598601873628-336c1d81-2c48-4121-9b8e-0ff56f706f4f.png)

CSDI summit 中国软件研发管理行业技术峰会（Software development management industry technology summit）是软件行业技术领域顶级盛会，协同国内外知名软件、互联网等企业研发一线技术专家从 AI 和大数据、产业变革、技术创新、生态发展、业务创新、商业模式等方面重点研讨软件研发趋势。**蚂蚁集团也受邀参与**本次峰会分享“**云原生**”相关主题。


**分享主题：金融级云原生 PaaS 实践之路**

**分享嘉宾：**成旻 蚂蚁集团高级技术专家

**分享时间：**2020-09-26 16:40-18:00

**听众收获**：

- 蚂蚁 PaaS 产品的缘起；
- 经典应用服务的能力和特色；
- 容器应用服务的进阶能力；
- 面向未来--混合云发展发向；

**活动地点：** 线上活动

**活动报名：** 点击“[**这里**](https://www.bagevent.com/event/6540795?aId=1693921)
