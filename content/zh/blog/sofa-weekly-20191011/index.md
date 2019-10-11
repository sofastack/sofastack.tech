---
title: "SOFA Weekly | 每周精选【10/7 - 10/11】"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2019-10-11T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563524226806-e93607a3-1b77-4ca2-8c3c-0384ab966154.png"
---

SOFA WEEKLY | 每周精选，筛选每周精华问答
同步开源进展，欢迎留言互动

![weekly.jpg](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1562925824761-fc720f21-9622-437b-a783-0b0729eda119.jpeg)

SOFAStack（Scalable Open Financial Architecture Stack）是蚂蚁金服自主研发的金融级分布式架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

SOFAStack 官网: [https://www.sofastack.tech](https://www.sofastack.tech/)

SOFAStack: [https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动
我们会筛选重点问题
通过 " SOFA WEEKLY " 的形式回复

@陈文龙 提问：

>请问一下，使用 Seata 时，undo_log 表的 rollback_info 字典的内容为｛｝（相当于空），事务回滚后记录又没被清除，而服务的日志打出的是成功回滚，log_status 是 1，这是什么原因呢？

A：1 是防御性的，是收到 globalrollback 回滚请求，但是不确定某个事务分支的本地事务是否已经执行完成了，这时事先插入一条 branchid 相同的数据，插入的假数据成功了，本地事务继续执行就会报主键冲突自动回滚。假如插入不成功说明表里有数据这个本地事务已经执行完成了，那么取出这条 undolog 数据做反向回滚操作。

相关阅读：[分布式事务 Seata Saga 模式首秀以及三种模式详解 | Meetup#3 回顾](/blog/sofa-meetup-3-seata-retrospect/)

### SOFARegistryLab 系列阅读

- [服务注册中心数据分片和同步方案详解 | SOFARegistry 解析](/blog/sofa-registry-data-fragmentation-synchronization-scheme/)
- [服务注册中心 MetaServer 功能介绍和实现剖析 | SOFARegistry 解析](/blog/sofa-registry-metaserver-function-introduction/)
- [服务注册中心 SOFARegistry 解析 | 服务发现优化之路](/blog/sofa-registry-service-discovery-optimization/)
- [海量数据下的注册中心 - SOFARegistry 架构介绍](/blog/sofa-registry-introduction/)

### SOFA 活动推荐

![image.png](https://cdn.nlark.com/yuque/0/2019/png/226702/1570777281065-62b951e9-f720-425c-9612-66405f2257a6.png)

**2019中国开源年会 (COSCon'19)** 正式启动啦~

**时间：** 2019-11-02 09:00 ~ 11-03 17:00

**地址：** 上海普陀区中山北路3663号华东师范大学（中北校区）

本次大会的主题是“**开源无疆、携手出航**”（**Let’s Cross the Boundaries Together!**），这也代表主办方对于中国开源，走向世界，走向辉煌的殷切期望。

SOFAStack 开源社区也受到主办方的邀请参加此次开源年会。

更多重磅议题与开源嘉宾，点击“[**这里**](https://www.bagevent.com/event/5744455?from=groupmessage&isappinstalled=0)”，即可了解。