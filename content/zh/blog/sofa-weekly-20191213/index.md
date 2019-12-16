---
title: "活动报名、本周 QA、组件发布 | SOFA Weekly"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2019-12-13T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563524226806-e93607a3-1b77-4ca2-8c3c-0384ab966154.png"
---

**SOFA WEEKLY | 每周精选，筛选每周精华问答**

**同步开源进展，欢迎留言互动**

![weekly](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1562925824761-fc720f21-9622-437b-a783-0b0729eda119.jpeg)

SOFAStack（Scalable Open Financial Architecture Stack）是蚂蚁金服自主研发的金融级分布式架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

**SOFAStack 官网: **[https://www.sofastack.tech](https://www.sofastack.tech/)

**SOFAStack: **[https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动

我们会筛选重点问题通过 " SOFA WEEKLY " 的形式回复

**1、@温明磊** 提问：

> 我用的 ShardingSqhere 分库分表，按照各个业务方分库。> 所以我们项目里所有分库的表都带了业务方字段biz_code，这个字段的值也就是虚库的名字，都是写在配置里的。
A：从你的需求看，比较简单只是需要按业务方进行分库，而 biz_code 不在状态机日志表的字段里，你可以考虑先算好分库位，然后用 ShadingJDBC 的 hint 功能来设置分库位即可。

A：我看了一下 ShardingJDBC 也是用的 ThreadLocal 来设置 hint：[https://shardingsphere.apache.org/document/current/cn/manual/sharding-jdbc/usage/hint/](https://shardingsphere.apache.org/document/current/cn/manual/sharding-jdbc/usage/hint/)

> ShadingJDBC 的 hint 功能是基于 ThreadLocal 的，Saga 异步的方式不能用 sharding jdbc 的吗?

A：有一个优雅的办法：你实现 StateLogStore 接口，然后代理 Seata Saga 的DbAndReportTcStateLogStore，在每个方法前后加上：hintManager.addDatabaseShardingValue();、hintManager.close()，这样就和同步异步没有关系了，因为设置 hint 和 sql 执行都在同一个线程。

另外，DbAndReportTcStateLogStore 如何传到你自己实现的 StateLogStore 里，你需要继承 DbStateMachineConfig，然后在 afterProperties 方法，先调 super.afterProperties 方法，然后 getStateLogStore()，传入你自己实现的 StateLogStore 里，然后把自己实现的 StateLogStore 调 setStateLogStore 覆盖。

**2、@Purge yao** 提问：

> Saga 状态机在线设计器： [http://seata.io/saga_designer/index.html](http://seata.io/saga_designer/index.html)  这个状态机可以让流程引擎用吗？

A：不可以当工作流用，没有人工节点。

> Seata  用这个流程是干嘛用的？

A：事实上 Seata Saga 模式 是一个具备“服务编排”和“Saga 分布式事务”能力的产品，总结下来它的适用场景是：

- 适用于微服务架构下的“长事务”处理；
- 适用于微服务架构下的“服务编排”需求；
- 适用于金融核心系统以上的有大量组合服务的业务系统（比如在渠道层、产品层、集成层的系统）；
- 适用于业务流程中需要集成遗留系统或外部机构提供的服务的场景（这些服务不可变不能对其提出改造要求）。

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

**3、@anorqiu9 **提问：

> 关于 MOSN 我们目前遇到一个架构方面的问题，就是原基于 Dubbo 的服务和现在基于 Spring Cloud 的服务互调如何做？一种方案设计服务同时开启两个服务框架的服务接口为两个框架的服务同时提供服务;另一种方案是异构系统基于网关交互.这两种方案有什么优缺点？大家有没有碰到过类似的场景，是如何处理的？谢谢！

A：Dubbo 和 Spring Cloud 互相调用，需要使用的是 http 接口来调用，个人推荐用网关来做交互，这样 API 的管理上更方便，当然也可以通过 Sidecar 来解决。

> 是的，我也倾向于网关交互，由网关完成协议的转换，进行包括流量控制、安全访问控制等在内的 API 管理工作。如果一个服务同时处于两种服务框架治理之下，就意味着对这个服务的治理（如限流、熔断及安全访问等）必须在两个地方进行，这将会是一个挑战。
> 当然，如果使用 Service Mesh 架构，通过 Sidecar 如 MOSN 来实现多 RPC 协议的支持，同时又能通过 Service  Mesh 的控制平面实现服务治理的统一，这样就不存在上述说的挑战。
MOSN：[https://github.com/sofastack/sofa-mosn](https://github.com/sofastack/sofa-mosn)

### 本周推荐阅读

- [蚂蚁金服 DB Mesh 的探索与实践](/blog/ant-financial-db-mesh-explore-practice/)

### Mesh 化落地实践特辑阅读

- [蚂蚁金服 Service Mesh 大规模落地系列 - 网关篇](/blog/service-mesh-practice-in-production-at-ant-financial-part5-gateway/)
- [蚂蚁金服 Service Mesh 大规模落地系列 - RPC 篇](/blog/service-mesh-practice-in-production-at-ant-financial-part4-rpc/)
- [蚂蚁金服 Service Mesh 大规模落地系列 - 运维篇](/blog/service-mesh-practice-in-production-at-ant-financial-part3-operation/)
- [蚂蚁金服 Service Mesh 大规模落地系列 - 消息篇](/blog/service-mesh-practice-in-production-at-ant-financial-part2-mesh/)
- [蚂蚁金服 Service Mesh 大规模落地系列 - 核心篇](/blog/service-mesh-practice-in-production-at-ant-financial-part1-core/)
- [Service Mesh 落地负责人亲述：蚂蚁金服双十一四大考题](/blog/service-mesh-practice-antfinal-shopping-festival-big-exam/)

### SOFA 项目进展

**本周发布详情如下：**

**1、发布SOFARPC v5.6.3，主要变更如下：**

- 试验性支持 grpc；
- 试验性支持 H2 的 tls；
- 序列化方式支持 msgpack；
- 修复直接通过线程上下文指定的地址调用；
- 扩展加载过程日志改为 debug，防止错误信息过多；
- 升级 jackson 和 netty 的小版本；

详细发布报告：
[https://github.com/sofastack/sofa-rpc/releases/tag/v5.6.3](https://github.com/sofastack/sofa-rpc/releases/tag/v5.6.3)

**2、发布 SOFAArk v1.1.0，主要变更如下：**

- 支持在 Biz 中使用 Ark 扩展点机制；
- 修复遗漏处理加载 ark spi 类资源 bug；
- 提供全新的biz/plugin 生命周期事件；
- 优化SOFAArk 自身日志输出；
- 优化 SOFAArk 与 SOFABoot 日志依赖管控；
- telnet 服务支持退出指令；
- 升级 netty 版本到 4.1.42.Final；
- 迁移 sofa-ark-samples 到 [https://github.com/sofastack-guides/sofa-ark-samples](https://github.com/sofastack-guides/sofa-ark-samples)

详细发布报告：
[https://github.com/sofastack/sofa-ark/releases/tag/v1.1.0](https://github.com/sofastack/sofa-ark/releases/tag/v1.1.0)

**3、发布 SOFABoot v3.2.1，主要变更如下：**

- 版本升级：
  - Upgrade resteasy to 3.6.3；
  - Upgrade SOFARPC to 5.6.3；
  - Upgrade hessian to 3.3.7；
  - Upgrade SOFAArk  to 1.1.0；
  - Upgrade fastjson to 1.2.61；
  - Upgrade jackson to 2.9.10；
  - Upgrade SOFATracer to 3.0.8；
- 修复子模块初始化将父容器的相关 Processor 都注册到子容器的问题；
- 修复 runtime-sofa-boot-plugin 无法在 3.2.x 版本使用问题；
- 修复 跳过 jvm 调用问题；

详细发布报告：
[https://github.com/sofastack/sofa-boot/releases/tag/v3.2.1](https://github.com/sofastack/sofa-boot/releases/tag/v3.2.1)

### 社区活动预告

![Service Mesh Meetup#9](https://cdn.nlark.com/yuque/0/2019/png/226702/1576469907431-7bfc401e-fe31-46a7-9c90-391e8aace845.png)

本期为 Service Mesh Meetup 第9期，将与滴滴联合举办，将深入 Service Mesh 的落地实践，并带领大家探索 Service Mesh 在更广阔领域的应用。诚邀您参加~

**主题**：Service Mesh Meetup#9 杭州站：To Infinity and Beyond

**时间**：2019年12月28日13:00-17:30

**地点**：杭州西湖区紫霞路西溪谷G座8楼

**报名方式**：点击“[这里](https://tech.antfin.com/community/activities/1056)”，即可报名