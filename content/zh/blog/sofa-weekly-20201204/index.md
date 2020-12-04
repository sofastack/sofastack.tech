---
title: "SOFA Weekly | MOSN 发布新版本、 Seata QA 整理"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | 【11/30 - 12/04】每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2020-12-04T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563524226806-e93607a3-1b77-4ca2-8c3c-0384ab966154.png"
---

SOFA WEEKLY | 每周精选，筛选每周精华问答
同步开源进展，欢迎留言互动

![weekly.jpg](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1562925824761-fc720f21-9622-437b-a783-0b0729eda119.jpeg)

- SOFAStack（Scalable Open Financial Architecture Stack）是蚂蚁金服自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

  SOFAStack 官网: [https://www.sofastack.tech](https://www.sofastack.tech/)

  SOFAStack: [https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动
我们会筛选重点问题
通过 " SOFA WEEKLY " 的形式回复

**1、@刘江涛** 提问：
> 已知在同一个分布式事务中，各个 RM 的模式都应该与对应 TM 模式相同。那同一个微服务可以多种模式并存吗？比如 AT , XA , Saga 并存，然后 A 业务使用 AT 模式，B 业务使用其他模式之类的。

A：不可以，隔离性无法得到保证。如果要一起用，就要保证一条调用链路中所有数据的隔离性，也就是跟 AT 一样都得去竞争锁，而且 Saga，TCC 之类的对 SQL 没要求，可能在跟 AT  一起使用的时候就有要求了，得不偿失。

> 如果公司要引入多种模式的话，微服务之间的关系是这样的吗？

![image.png](https://cdn.nlark.com/yuque/0/2020/png/2883938/1607065750357-e7602f91-9660-48cb-b30d-bce5d44f675f.png)
A ：是的，当然 AT 集群是可以调 Saga 集群的，但是他们不能属于同一个全局事务,也就是 AT 那个事务提交了，Saga 的如果回滚了，是 Saga 集群的问题，等于有 2 个全局事务的诞生。
Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

### 相关推荐阅读

- [记一次在 MOSN 对 Dubbo、Dubbo-go-hessian2 的性能优化](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247486296&idx=1&sn=855f5ae48c4da2dace79f6956afdb646&chksm=faa0e482cdd76d94f3b59e6d7edcaebe316faac9e74c668dd33977f7705c208fe68d782e15d2&scene=21)

- [云原生网络代理 MOSN 透明劫持技术解读 | 开源](https://www.sofastack.tech/blog/mosn-transparent-hijacking/)

- [基于 MOSN 和 Istio Service Mesh 的服务治理实践](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247486618&idx=1&sn=d52c67fba7d4e47bb69af50b83eb29dd&chksm=faa0e340cdd76a56d2dbea3b054eea96ea74e73d625c0f5bf041bc7dd857ba21dcfd2a4042ab&scene=21)

- [云原生网络代理 MOSN 的进化之路](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247486961&idx=1&sn=e2710328091c2a15283cd76527078c97&chksm=faa0e22bcdd76b3d5e4d65f738a51d560fd2f32cec8a081b253ad80d19cdaef9ca88cfca2862&scene=21)

### MOSN 项目进展

**本周发布详情如下：**
**1、MOSN 发布了 v0.19.0 版本：**
- 重构了 StreamFilter 框架，提供更强的可复用的能力
- 支持 MaxProcs 可基于 CPU 使用限制自动识别的能力
- 支持指定 Istio cluster 的网络
- 针对高并发场景的内存使用进行了优化
- 多处BUG修复

详细参考：[https://github.com/mosn/mosn/releases/tag/v0.19.0](https://github.com/mosn/mosn/releases/tag/v0.19.0)
