---
title: "SOFA Weekly | SOFARPC、Seata 组件发布以及社区 QA 整理、社区直播预告"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2020-07-17T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563524226806-e93607a3-1b77-4ca2-8c3c-0384ab966154.png"
---

**SOFA WEEKLY | 每周精选，筛选每周精华问答**
**同步开源进展，欢迎留言互动**

![weekly.jpg](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1562925824761-fc720f21-9622-437b-a783-0b0729eda119.jpeg)

**SOFA**Stack（**S**calable **O**pen Financial **A**rchitecture Stack）是蚂蚁集团自主研发的金融级分布式架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

- **SOFAStack 官网:** [https://www.sofastack.tech](https://www.sofastack.tech/)
- **SOFAStack:** [https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动
我们会筛选重点问题通过 " SOFA WEEKLY " 的形式回复

**1、@古月** 提问：

> 请问 SOFARPC 可以在 Spring MVC 环境 XML 配置使用?老项目 ssm，非 Spring Boot 环境。

A：可以的。和直接用 SOFARPC 没区别。
SOFARPC 相关 Demo：[https://www.sofastack.tech/projects/sofa-rpc/getting-started-with-rpc/](https://www.sofastack.tech/projects/sofa-rpc/getting-started-with-rpc/)

SOFARPC：[https://github.com/sofastack/sofa-rpc](https://github.com/sofastack/sofa-rpc)

**2、@伍月** 提问：

> 工程使用 OperatingSystemMXBean（osBean）类对系统 CPU 情况进行监控。
> osBean.getSystemCpuLoad() = -1 ？？？
> osBean.getProcessCpuLoad() = -1 ？？？
> 有没有人知道是怎么回事。
> 注：正常情况下 CPU 返回值在 0 到 1 之间。

A：抛出异常的时候会返回 -1，之前记得 arthas 也会返回 -1。

> 感谢回答。 工程在 Linux 服务器上运行时获取 CPU 数据正常。只是在本地 Windows 上运行时获取 CPU 数据返回 -1。后来百度得知可能由于本地 Windows 用户没有获取系统 CPU 数据的权限。

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

### 本周推荐阅读

- [我们需要什么样的端到端 AI 系统？蚂蚁 SQLFlow 的思考与答案](https://www.sofastack.tech/blog/end-to-end-ai-system-sqlflow/)
- [火了 2 年的服务网格究竟给微服务带来了什么？](https://www.sofastack.tech/blog/microservices-service-mesh/)
- [Kubernetes: 微内核的分布式操作系统](https://www.sofastack.tech/blog/microkernel-distributed-operating-system-kubernetes/)

### SOFA 项目进展

**本周发布详情如下：**

**1、发布 SOFARPC v5.7.4版本，主要变更如下：**

- 允许用户设置 Triple 服务的版本；
- protobuf 编译器升级到 0.0.2；
- hibernate-validator 升级到 5.3.5.Final；
- jackson-databind 升级到 2.9.10.5；
- 修复了 Hessian over triple 不支持基本类型的问题；

详细发布报告：[https://github.com/sofastack/sofa-rpc/releases/tag/v5.7.4](https://github.com/sofastack/sofa-rpc/releases/tag/v5.7.4)

**2、发布 Seata v1.3.0 版本，主要变更如下：**

- AT 模式支持了像多主键，自动升降级，redis 存储等大量 feature；
- TCC 模式支持了模式支持 Dubbo 和 SOFARPC 注解调用；
- Saga 模式支持 Groovy 脚本任务、支持 jackson 序列化、代码重构将内部扩展点 SPI 化；
- 整体性能得到大幅度提升，修复了旧版本的存量 bug；
- 本次 release 变动文件数：442，代码变动：+17062 −8419，参与代码 commit 人数：31，合并 PR 数：90，其中：feature：20，bugfix：29，代码优化重构：41；

详细发布报告：[https://github.com/seata/seata/releases/tag/v1.3.0](https://github.com/seata/seata/releases/tag/v1.3.0)

### 社区活动报名

![Service Mesh Webinar#2](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1594978284633-1514b803-7bb3-44d7-9abf-14edf8d5ac45.jpeg)

Service Mesh Webinar 是由 ServiceMesher 社区和 CNCF 联合发起的线上直播活动，活动将不定期举行，邀请社区成员为大家带来 Service Mesh 领域的知识和实践分享。

Service Mesh Webinar#2，邀请有米科技高级后端工程师姚昌宇，带来分享《基于 MOSN 和 Istio Service Mesh 的服务治理实践》。本期分享可以收获对 Service Mesh 技术以及如何落地有更多的认识。

**分享主题：**基于 MOSN 和 Istio Service Mesh 的服务治理实践

**分享嘉宾：**姚昌宇 有米科技高级后端工程师、MOSN committer

**你将收获：**

- 了解如何参与到 MOSN 开源社区共建中；
- 了解如何使用 MOSN 在 Istio 场景下的服务治理实践 ;
- 了解 MOSN 新版本的功能以及未来远景；
- 结合 Istio 各个场景的 Demo，分享 MSON 的多协议/私有协议实现；

**直播时间：**2020-07-22 20:00-21:00

**直播间地址：**关注[直播间](https://live.bilibili.com/21954520)，7月22日不见不散
