---
title: "SOFA Weekly | 每周精选【11/18 - 11/22】"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2019-11-22T15:00:00+08:00
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

**1、@J～杰 提问：**

> 帮我看个问题，标红的这个状态没执行是啥原因？
> ![i异常](https://cdn.nlark.com/yuque/0/2019/png/226702/1574381789634-51422a59-e826-47b1-89ab-eb299d08d265.png)

A：没有 Next 属性，可以下载 seata-sample，里面有例子，[https://github.com/seata/seata-samples](https://github.com/seata/seata-samples)。

> 好的，CompensateState 这个属性是正向失败后，重试这个状态？

A：正向失败后，触发这个补偿状态。
[https://github.com/seata/seata/tree/develop/test/src/test/java/io/seata/saga/engine](https://github.com/seata/seata/tree/develop/test/src/test/java/io/seata/saga/engine) 为里有很多单元测试案例，代码对应的json在：[https://github.com/seata/seata/tree/develop/test/src/test/resources/saga/statelang](https://github.com/seata/seata/tree/develop/test/src/test/resources/saga/statelang)。
正向失败后，触发这个 CompensateState 状态，但失败后并不会默认就触发补偿流程，需要在 Catch 属性里，Next 到一个 CompensateTrigger。

> 那 Saga 模式下，如果 TC 端发出回滚命令，Saga 怎么处理，没发现有回滚状态？

A：Saga 模式的 TCC 模式有点不一样的是，Saga 的回滚不是由 TC 来协调，而是只 TC 触发，回滚流程是由状态机执行的。
[https://github.com/seata/seata/blob/develop/test/src/test/resources/saga/statelang/simple_statelang_with_compensation.json](https://github.com/seata/seata/blob/develop/test/src/test/resources/saga/statelang/simple_statelang_with_compensation.json)

![catch 代码](https://cdn.nlark.com/yuque/0/2019/png/226702/1574382111440-3d2279c9-ee93-493c-9f0d-e22f508fc214.png)

这里是 Catch 到异常后，可以自定义捕获某些异常，然后 Next 到一个处理 state，这个 state 可以是任何 state，如果是 CompensateTrigger 则立即进行回滚。

> Saga 是通过检测异常来识别回滚命令？

A：Catch 属性是用来检测异常的，但异常的处理可能不仅仅是进行回滚，可能有别的处理逻辑，因业务不同而不同，catch 到这些异常处理，你可以 Next 到任何一个 state 来处理异常；如果希望回滚，框架提供了 CompensateTrigger 这种一个特定的 state，Next 到 CompensateTrigger，则立即进行回滚。

> 如果一个 Saga 状态失败后，RM 一直会重试，这个重试有没有次数限制的？

A：[https://github.com/seata/seata/blob/develop/server/src/main/resources/file.conf.example](https://github.com/seata/seata/blob/develop/server/src/main/resources/file.conf.example)
重试间隔和重试超时时间, -1是无限重试，比如可以配置成 1d ，只重度一天。

![代码](https://cdn.nlark.com/yuque/0/2019/png/226702/1574383118081-972d6971-62fd-492a-aa49-84d3036b3a3e.png)

> 还有个问题，发现 catch 没有捕捉到 RuntimeExcepeion 异常：
> ![catch 没有捕捉到 RuntimeExcepeion 异常](https://cdn.nlark.com/yuque/0/2019/png/226702/1574383152417-faf96097-244e-46a8-9d6f-44bf49ed9dc0.png)
> 
> ![状态](https://cdn.nlark.com/yuque/0/2019/png/226702/1574383191115-523bccad-860e-4c93-a482-912a11a076b6.png)

A：它走到 Fail 那个状态去了吗？另外就是 Status 是会执行的，catch 异常和状态判断是两个互不干扰的事情。

> 就是没有走到 Fail 那个状态才奇怪，刚开始我是把 Status 给去掉的，也没走，后来就加上的。这个重试是状态为 un 的时候，TC 就会一直发起重试的吧？

A：如果没有发起过回滚（补偿流程），失败后 TC 会重试继续完成状态机正向执行，如果发了回滚，回滚失败后 TC 会重试回滚。

> 那如果发生回滚，是从哪个状态节点开始回滚的？

A：从失败的节点开始。

> 是通过读这张表的数据 seata_state_inst？

A：对。

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

**2、@胡文伟 提问：**

> 双模微服务是指什么？

A：所谓双模，是指 SOFA 微服务和 Service Mesh 技术的双剑合璧，即“基于 SDK 的 SOFA 微服务”可以和“基于 Sidecar 的 Service Mesh 微服务”实现下列目标： 互联互通：两个体系中的应用可以相互访问； 平滑迁移：应用可以在两个体系中迁移，对于调用该应用的其他应用，做到透明无感知； 异构演进：在互联互通和平滑迁移实现之后，我们就可以根据实际情况进行灵活的应用改造和架构演进。

### 双十一落地实践特辑阅读

- [蚂蚁金服 Service Mesh 大规模落地系列 - 消息篇](/blog/service-mesh-practice-in-production-at-ant-financial-part2-mesh/)
- [蚂蚁金服 Service Mesh 大规模落地系列 - 核心篇](/blog/service-mesh-practice-in-production-at-ant-financial-part1-core/)
- [Service Mesh 落地负责人亲述：蚂蚁金服双十一四大考题](/blog/service-mesh-practice-antfinal-shopping-festival-big-exam/)

###  SOFA 项目进展

**本周发布详情如下：**

**1、发布 MOSN v0.8.1，主要变更如下：**

- 新增 MOSN 处理失败请求数的统计；
- 提升写共享内存时的性能；
- 优化内存占用与日志输出；
- 修复日志文件轮转的 Bug；

详细发布报告：[https://github.com/sofastack/sofa-mosn/releases/tag/0.8.1](https://github.com/sofastack/sofa-mosn/releases/tag/0.8.1)

### SOFAChannel 直播推荐

![Channel#9.jpg](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1574412687312-ce69fdbb-7b44-40b4-ab34-f02be89dbc37.jpeg)

Service Mesh 是蚂蚁金服下一代架构的核心，本期直播主要分享在蚂蚁金服当前的体量下，我们如何做到在奔跑的火车上换轮子，将现有的 SOA 体系快速演进至 Service Mesh 架构。聚焦 RPC 层面的设计和改造方案，**分享蚂蚁金服双十一核心应用如何将现有的微服务体系平滑过渡到 Service Mesh 架构下并降低大促成本**，并从核心、RPC、消息等模块展开分享本次双十一落地实践的实现细节。

你将收获：

- 蚂蚁金服 Service Mesh 架构双十一大规模落地实践案例分析；
- 从核心、RPC、消息等模块分享蚂蚁金服 Service Mesh 落地实践细节；

时间：2019年12月5日（周四）19:00-20:00
形式：线上直播
报名方式：点击“[这里](https://tech.antfin.com/community/live/1021)”即可报名