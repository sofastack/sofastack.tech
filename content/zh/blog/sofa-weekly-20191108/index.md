---
title: "SOFA Weekly | 每周精选【11/04 - 11/08】"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2019-11-08T15:00:00+08:00
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

**@温明磊** 提问：
> 出参入参都放在 Saga 的上下文中，如果参数内容较多较大，业务量又大的话，对内存有限制吗?

A: 没有做限制，建议无关的参数不要放到上下文。下一个服务需要用的参数、或用于分支判断的参数可以放入上下文。

> 确认个事情：每个节点，要么自己方法内部 Catch 异常处理，使最终有返回信息。要么自己内部可以不处理，交由状态机引擎捕获异常，在 json 中定义 Catch 属性。 而不是补偿节点能够自动触发补偿，需要补偿必须手动在 json，由 Catch 或者 Choices 属性路由到 CompensationTrigger。

A：对的，这个是为了提高灵活性。用户可以自己控制是否进行回滚，因为并不是所有异常都要回滚，可能有一些自定义处理手段。

> 所以 Catch 和 Choices 可以随便路由到想要的 state  对吧？

A：是的。这种自定义出发补偿的设计是参考了 bpmn2.0 的。

> 还有关于 json 文件，我打算一条流程，就定义一个 json，虽然有的流程很像，用 Choices，可以解决。但是感觉 json 还是要尽量简单。这样考虑对吗？

A：你可以考虑用子状态机来复用，子状态机会多生成一行 stateMachineInstance 记录，但对性能影响应该不大。

### Service Mesh 相关阅读

- [从网络接入层到 Service Mesh，蚂蚁金服网络代理的演进之路](/blog/antfin-service-mesh-network-agents/)

- [诗和远方：蚂蚁金服 Service Mesh 深度实践 | QCon 实录](/blog/service-mesh-antfin-deep-practice-qcon/)

- [Service Mesh 发展趋势(续)：棋到中盘路往何方 | Service Mesh Meetup 实录](/blog/service-mesh-development-trend-2/)

- [蚂蚁金服 Service Mesh 落地实践与挑战 | GIAC 实录](/blog/service-mesh-giac-2019/)

- [Service Mesh 发展趋势：云原生中流砥柱](/blog/service-mesh-development-trend-1/)

- [企业服务行业如何试水 Istio | Service Mesh Meetup 分享实录](/blog/service-mesh-meetup-5-istio-retrospect/)

- [蚂蚁金服Service Mesh新型网络代理的思考与实践 | GIAC 分享实录](/blog/service-mesh-giac-2018/)

- [蚂蚁金服 Service Mesh 渐进式迁移方案|Service Mesh Meetup 实录](/blog/service-mesh-meetup-5-retrospect/)

- [蚂蚁金服 Service Mesh 实践探索 | Qcon 实录](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247484395&idx=1&sn=0210fa2fd78828a05ea29e5eff074e20&chksm=faa0ec31cdd76527ad5c123511b1b5e684db1954920c36c794ee5c7391c867979946ed0f3b77&scene=21)

- [干货 | 蚂蚁金服是如何实现经典服务化架构往 Service Mesh 方向的演进的？](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247483953&idx=1&sn=6bda510464710137af209b61c0453088&chksm=faa0edebcdd764fd17260584805788db91b0170848f53d20baf5767a098979de49eed26cc143&scene=21)

### 活动推荐

![image.png](https://cdn.nlark.com/yuque/0/2019/png/226702/1573200539515-4cdbff5c-3fa9-4d98-a610-a1f123e3c0f1.png)

2019年度TOP100全球软件案例研究峰会即将举行，蚂蚁金服也受邀参与本次案例分享。

Service Mesh 是蚂蚁金服下一代架构的核心，本主题主要分享在蚂蚁金服当前的体量下，我们如何做到在奔跑的火车上换轮子，将现有的 SOA 体系快速演进至 Service Mesh 架构。RPC、消息、DB、安全、运维等每一个环节均充满挑战。**本次实战分享蚂蚁金服双十一核心应用如何大规模落地 Service Mesh 架构并降低大促成本。**

主题：《**蚂蚁金服 Service Mesh 双十一实战**》

嘉宾：石建伟，花名：卓与，蚂蚁金服中间件技术专家，主要负责蚂蚁金服服务注册中心、配置中心与 Service Mesh 的研发与架构。当前专注在蚂蚁金服 Service Mesh 内部落地。

时间：2019年11月15日（周五）16:50-17:50

地点：北京国际会议中心

报名方式：点击“[这里](https://www.top100summit.com/Detail?id=14140&share=f1c455e6093fa1dede1eeb35826fe24f%7C7701)”即可锁定席位