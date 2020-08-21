---
title: "SOFA Weekly | 线上直播合辑整理、Seata QA 整理"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2020-08-21T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563524226806-e93607a3-1b77-4ca2-8c3c-0384ab966154.png"
---

**SOFA WEEKLY | 每周精选，筛选每周精华问答**

**同步开源进展，欢迎留言互动**

![weekly.jpg](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1562925824761-fc720f21-9622-437b-a783-0b0729eda119.jpeg)

**SOFA**Stack（**S**calable **O**pen Financial **A**rchitecture Stack）是蚂蚁集团自主研发的金融级分布式架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

- **SOFAStack 官网：**[https://www.sofastack.tech](https://www.sofastack.tech/)
- **SOFAStack：**[https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动

我们会筛选重点问题通过 " SOFA WEEKLY " 的形式回复

**1、@谢小东** 提问：

> 请教一个问题，在使用 AT 模式的时候，新增的一条数据，回滚之前我在 db 改了我刚新增的数据，这个时候如果我抛出异常，但是就不发回滚，该怎么处理？

A：不要在全局事务包裹之外进行对数据的并发操作，如果你这样做，就跳过了 AT 的全局锁，隔离性无法保证，如果你有这方面需求的，可以用 XA 模式，并且使用数据库自身带有排它锁的操作，数据库的自身支持了 XA 模式，就可以帮你保证隔离性。

> 你的意思就是我在这种情况下 XA 模式适合？XA 模式是行锁么？

A：XA 是数据库自身实现的隔离机制，AT 是统一到 TC 去竞争行锁，而没用到 AT 的地方修改数据库当然就不会去 TC 竞争行锁，隔离性只能保证再全局事务注解下的操作生效。

2、**@彭兴家** 提问：

> 请问 Seata 里说的全局锁和本地锁对应 MySQL 的什么锁呀？

A：全局锁就是从 TC 竞争的锁，本地锁就是参与方自己本地的 MySQL 连接，比如 update 不就有排他锁的作用吗，因为一阶段提交，连接释放了，这个本地数据库的锁就解开了。而全局锁是从 TC 拿的，这个锁保证了你的入口只要是分布式事务注解下，就会去竞争这个全局锁。保证了再分布式事务注解下的全局事务间的隔离性

> 谢谢，明白了。但这样的话，Seata 通过前置镜像回滚。在全局事物执行的过程中，要是其他项目(没在全局事物下的项目)对该条数据进行了修改，那么按照 Seata 的机制，前置镜像对比不同了就不能回滚，需要手动处理？

A：是的，需要人工介入，因为只有人为分析才能校准数据了。对 Seata 来说他只知道要把数据回滚到发生前，但是数据被干扰了，就无法回滚了。

> 理论上来说这种情况出现的几率很大呀，多个不同项目操作同一条数据。

A：全局事务，字面意思要理解一下。你让他不全局了，让它不覆盖到，如何保证隔离性？要么涉及到的库对应的应用全局使用 Seata AT，要么就换 XA，修改的数据，用 select for update，这个本地锁在二阶段下发通知前不会释放，保证了隔离性。

3、**@苏龙飞** 提问：

> 请问，现在我们的 cloud 项目中用了 Seata，数据库只有一个，然后发现性能不够，所以想换成多主从数据库，并且能和 Seata 兼容，有没有好的方案呀？

A：主从方案本就应该是允许暂时的不一致，只要你保证读写都需要的时候，一定是主库，并把主库的 datasource 代理掉就好了，保证需要读后马上写的，一定要是主库操作。
Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

### SOFAChannel 部分合辑

- [人人都可以“机密计算”：Occlum 使用入门和技术揭秘 | 开源](/blog/sofa-channel-18-retrospect/)
- [蚂蚁集团网络通信框架 SOFABolt 功能介绍及协议框架解析 | 开源](/blog/sofa-channel-17/)
- [不得不说的云原生隔离性 | SOFAChannel#16 直播回顾](/blog/sofa-channel-16-retrospect/)
- [链接]()[蚂蚁金服分布式链路组件 SOFATracer 埋点机制解析 | SOFAChannel#15 直播整理](/blog/sofa-channel-15-retrospect/)
- [云原生网络代理 MOSN 扩展机制解析 | SOFAChannel#14 直播整理](/blog/sofa-channel-14-retrospect/)
- [云原生网络代理 MOSN 多协议机制解析 | SOFAChannel#13 直播整理](/blog/sofa-channel-13-retrospect/)
- [蚂蚁金服分布式事务实践解析 | SOFAChannel#12 直播整理](/blog/sofa-channel-12-retrospect/)
- [从一个例子开始体验轻量级类隔离容器 SOFAArk | SOFAChannel#11 直播整理](/blog/sofa-channel-11-retrospect/)

### 本周推荐阅读

- [蚂蚁集团如何在大规模 Kubernetes 集群上实现高 SLO？](/blog/antgroup-kubernetes-high-slo/)
- [蚂蚁是如何改进 K8s 集群敏感信息的安全防护的？](/blog/antgroup-k8s-security-protection-of-cluster-sensitive-information/)
