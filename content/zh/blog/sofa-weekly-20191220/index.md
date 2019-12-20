---
title: "SOFA Weekly | MOSN 配置文档、SOFABolt 等组件发布、社区活动预告"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2019-12-20T15:00:00+08:00
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

**1、@番番** 提问：

> MOSN 的配置信息在哪里呢？

A：MOSN 配置信息已更新到文档中：[https://www.sofastack.tech/projects/sofa-mosn/configuration/overview/](https://www.sofastack.tech/projects/sofa-mosn/configuration/overview/)

**2、@古月** 提问：

> 请问 SOFARPC 服务注册 ip 怎么使用主机 ip，不使用分配给容器的 ip？开发时调用容器内的服务调用不到，容器内的服务注册 ip 为 docker 分配的 ip。

A：[https://www.sofastack.tech/projects/sofa-rpc/application-rpc-config/](https://www.sofastack.tech/projects/sofa-rpc/application-rpc-config/)
com.alipay.sofa.rpc.enabled.ip.range # 多网卡 ip 范围
com.alipay.sofa.rpc.bind.network.interface # 绑定网卡
可以通过网卡/ip段过滤；

SOFARPC：[https://github.com/sofastack/sofa-rpc](https://github.com/sofastack/sofa-rpc)

> SOFABoot 的服务运行在容器内，注册到注册中心的 ip 为容器的 ip，开发机器的调用不到。

A：下面的两个参数，容器内端口映射到宿主机，virtual.host 用宿主机的去注册，
com.alipay.sofa.rpc.virtual.host
com.alipay.sofa.rpc.virtual.port

SOFABoot：[https://github.com/sofastack/sofa-boot](https://github.com/sofastack/sofa-boot)

**3、@聂风** 提问：

> SpringCloud 的项目怎么迁移到 SOFA 有这方面的教程文档吗？

A：可以先参考下这个工程 [https://github.com/sofastack/spring-cloud-sofastack-samples](https://github.com/sofastack/spring-cloud-sofastack-samples) ，SOFAStack 集成 SpringCloud 的案例工程，不知道是不是对你有帮助。

**4、@周小斌** 提问：

> Seata 以后会考虑集成分库分表和读写分离功能吗（无业务入侵的方式）？

A：一般是分库分表组件内部中集成 Seata，负载均衡本质上是在切换数据源，一种是通过 DB URL 这种对外是个黑盒，Seata 不需要关注。另外一种是分库分表组件中使用配置中心做对等库物理库配置，这种需要通过 Resource 的 Group 来定义，比如我在一个节点上执行完一阶段，但是在进行二阶段的时候进行了主备切换，这时候需要在新主节点完成回滚。

**5、@温明磊** 提问：

> Saga 项目开启时间长了后，会报 java.sql.SQLException: No operations allowed after statement closed.  这个错误。这个类 DbAndReportTcStateLogStore 方法 recordStateMachineStarted。

A：是不是因为你的数据源连接池配置有问题呢？可能没有配置 testOnBorrow 或者 testOnReturn。

> 是没有。

A：你配置一个 testOnBorrow。

> 那能不能在数据库连接的代码里判断，还是必须配置 testOnBorrow？Seata Saga 的数据库连接那代码处理异常。

A：testOnBorrow 是数据源连接池的配置，和 Seata Saga 无关的，连接池你可以用任何连接池，比如 durid，dbcp。

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

### 本周推荐阅读

- [蚂蚁金服 ZSearch 在向量检索上的探索](/blog/antfin-zsearch-vector-search/)

### Mesh 化落地实践特辑阅读

- [蚂蚁金服 Service Mesh 大规模落地系列 - Operator 篇](/blog/service-mesh-practice-in-production-at-ant-financial-part6-operator/)
- [蚂蚁金服 Service Mesh 大规模落地系列 - 网关篇](/blog/service-mesh-practice-in-production-at-ant-financial-part5-gateway/)
- [蚂蚁金服 Service Mesh 大规模落地系列 - RPC 篇](/blog/service-mesh-practice-in-production-at-ant-financial-part4-rpc/)
- [蚂蚁金服 Service Mesh 大规模落地系列 - 运维篇](/blog/service-mesh-practice-in-production-at-ant-financial-part3-operation/)
- [蚂蚁金服 Service Mesh 大规模落地系列 - 消息篇](/blog/service-mesh-practice-in-production-at-ant-financial-part2-mesh/)
- [蚂蚁金服 Service Mesh 大规模落地系列 - 核心篇](/blog/service-mesh-practice-in-production-at-ant-financial-part1-core/)
- [Service Mesh 落地负责人亲述：蚂蚁金服双十一四大考题](/blog/service-mesh-practice-antfinal-shopping-festival-big-exam/)

### SOFA 项目进展

**本周发布详情如下：**

**1、发布 Occlum v0.8.0 版本，主要变更如下：**

- 重构 futex 实现，增加 FUTEX_REQUEUE 支持
- 支持 SGX 远程证明
- 增加 sendmsg 和 recvmsg 系统调用
- 增加 gRPC demo
- 增加 Intel OpenVINO demo
- 增加 SGX 远程证明 demo

详细发布报告：
[https://github.com/occlum/occlum/releases/tag/0.8.0](https://github.com/occlum/occlum/releases/tag/0.8.0)

**2、发布 SOFABolt v1.6.1 版本，主要变更如下：**

- 支持 SSL
- 支持 UserProcessor 生命周期的方法
- 支持用户自定义 SO_SND_BUF 和 SO_RCV_BUF
- 支持 RejectedException 的处理策略
- 优化了生命周期的检查，避免组件在关闭或启动前后仍然能够提供服务
- 优化了 DefaultConnectionManager 的构造方法以及其它的部分代码
- 修复 DefaultConnectionManager#check(Connection) 异常信息不完整的问题
- 修复 AbstractLifeCycle 启动/关闭的并发问题

详细发布报告：
[https://github.com/sofastack/sofa-bolt/releases/tag/v1.6.1](https://github.com/sofastack/sofa-bolt/releases/tag/v1.6.1)

### 社区活动预告

![Service Mesh Meetup#9](https://cdn.nlark.com/yuque/0/2019/png/226702/1576469907431-7bfc401e-fe31-46a7-9c90-391e8aace845.png)

下周六 Service Mesh Meetup 第9期杭州站来啦，本期与滴滴联合举办，将深入 Service Mesh 的落地实践，并带领大家探索 Service Mesh 在更广阔领域的应用。欢迎参加~

**主题**：Service Mesh Meetup#9 杭州站：To Infinity and Beyond

**时间**：2019年12月28日（下周六）13:00-17:30

**地点**：杭州西湖区紫霞路西溪谷G座8楼

**报名方式**：点击“[这里](https://tech.antfin.com/community/activities/1056)”，即可报名
