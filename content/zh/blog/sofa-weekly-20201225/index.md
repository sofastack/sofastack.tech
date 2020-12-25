---
title: "SOFA Weekly | SOFA-Common-Tools 发布新版本， QA 整理"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2020-12-25T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563524226806-e93607a3-1b77-4ca2-8c3c-0384ab966154.png"
---

SOFA WEEKLY | 每周精选，筛选每周精华问答
同步开源进展，欢迎留言互动

![weekly.jpg](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1562925824761-fc720f21-9622-437b-a783-0b0729eda119.jpeg)

SOFAStack（Scalable Open Financial Architecture Stack）是蚂蚁金服自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

SOFAStack 官网: [https://www.sofastack.tech](https://www.sofastack.tech/)

SOFAStack: [https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼


欢迎大家向公众号留言提问或在群里与我们互动
我们会筛选重点问题
通过 " SOFA WEEKLY " 的形式回复

**1、@薛帅领** 提问：

> 多数据源切换后，增加事务但不起作用（切数据源是执行方法后才切换的），本地事务及 Seate 分布式事务也不行，这个有什么好的解决方案吗？

A：Spring 本地事务注解本身就不支持多数据源事务，且如果你开启了本地事务，之后并不会进入你的切换数据源的切面。 在多数据源下，去掉本地事务注解就好了。用 globaltransactional 注解在多数据源的入口加上，多个数据源都被 Seata 代理的话，就会保证多数据源的事务。

**2、@李天宇** 提问

> 如果在分布式事务中，另一个线程做批处理 update 之类的，是否会锁住呢?

A：不会，另一个线程也要记得加上 globaltransactional 注解就行了。在 a 线程要提交之前要去尝试拿到它修改数据的全局锁的，如果 a 拿到了，但是还没到二阶段提交，b 也是要去尝试拿，拿不到就会不执行 SQL，等待全局锁释放了，也就是 a 发起的事务结束了，b 才能执行 SQL 提交。这样就保证了利用全局锁（粒度行级），来达到隔离性。

Seata：https://github.com/seata/seata

### 相关推荐阅读

- [Kubernetes: 微内核的分布式操作系统](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247486583&idx=1&sn=de15ec3224bc4f00b7e77c9f7481eee0&chksm=faa0e3adcdd76abb1b771514c09a486483f008dd911c27295b52da7979cf7509858134ffaf01&scene=21)
- [走出微服务误区：避免从单体到分布式单体](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247486495&idx=1&sn=73daf2aeb85b61e5d715a7e9f979dc3b&chksm=faa0e3c5cdd76ad3f93cf744e7ca156dbeef0347cde7f215415273782ba29526fb8c589bfeeb&scene=21)

- [网商银行是如何建设金融级云原生分布式架构的？](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487074&idx=1&sn=8db3c74c5b4c024314a3f1743998d545&chksm=faa0e1b8cdd768aebe339efc0c24f093d6cdc2d8bfc1f4c548312090e4cb3b165201c84361be&scene=21)

- [支付宝资深技术专家尹博学：新一代金融核心突破之全分布式单元化技术架构](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247486545&idx=1&sn=c122ff92cbf74f077850f472aadc3359&chksm=faa0e38bcdd76a9d7da64a43f270d06302d95220b4a1d26fae3fc2224c63a5038140a0587ca0&scene=21)

### SOFA 项目进展

**本周发布详情如下：**

**SOFA-Common-Tools 发布1.3.0 版本，主要变更如下：**

- SOFA 线程池支持 ScheduledThreadPoolExecutor 与 ThreadPoolTaskScheduler
- 新增 SofaConfigs 支持统一的配置获取
- 新增 LogCode2Description 支持统一的错误码获取
- 重构线程池实现，支持更丰富的监控数据
- 所有组件统一 spce 属性获取逻辑
- 修复配置日志输出到控制台时不生效的问题

详细参考：[https://github.com/sofastack/sofa-common-tools/releases/tag/v1.3.0](https://github.com/sofastack/sofa-common-tools/releases/tag/v1.3.0)

![image.png](https://cdn.nlark.com/yuque/0/2020/png/2883938/1608884712024-bd98053b-d84d-4b4d-b06e-ac13504d0e59.png)

祝大家圣诞节快乐！
