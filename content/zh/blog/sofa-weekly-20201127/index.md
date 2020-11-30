---
title: "SOFA Weekly | 每周精选【11/23 - 11/27】SOFA Weekly | SOFAJRaft 、SOFABoot发布新版本，SOFAStack 获优秀 Gitee 组织奖"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2020-11-27T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563524226806-e93607a3-1b77-4ca2-8c3c-0384ab966154.png"
---

**SOFA WEEKLY | 每周精选，筛选每周精华问答**

**同步开源进展，欢迎留言互动**

![weekly.jpg](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1562925824761-fc720f21-9622-437b-a783-0b0729eda119.jpeg)

**SOFA**Stack（**S**calable **O**pen **F**inancial **A**rchitecture Stack）是蚂蚁集团自主研发的金融级分布式架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

- **SOFAStack 官网：**[https://www.sofastack.tech](https://www.sofastack.tech/)

- **SOFAStack：**[https://github.com/sofastack](https://github.com/sofastack)

### 社区 Big News 

SOFAStack 获得 2020 年度 OSC 中国开源项目评选**「优秀 Gitee 组织」**，感谢所有开发者们的支持和喜爱，SOFA 团队会继续努力，提供更好的开源产品和服务，也期待大家的持续共建。
[2020 年度 OSC 中国开源项目评选结果公布](https://www.oschina.net/question/2918182_2320117)
### 
### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动
我们会筛选重点问题
通过 " SOFA WEEKLY " 的形式回复

**1、@张松** 提问：
> SOFARPC 支持提供者注册的时候配置一个标识，然后消费者根据这个标识来获取到对应的服务提供者吗？类似于对服务提供者做一个分组。

A：你是指 SOFARPC 的 unique-id 吧，支持的。
> 不是，类似于分组的配置，因为我这边现在需要多环境，要来区分同一个注册中心下的同一个接口的不同分组。

A：SOFARPC 就是用 uniqueId 来区分同一个接口，不同实现的。SOFARPC 没有 group 的概念，只有一个 uniqueId，需要服务方和调用方配置一样，强隔离的。
SOFARPC：[https://github.com/sofastack/sofa-rpc](https://github.com/sofastack/sofa-rpc)

**2、@徐泽唯** 提问：
> 自动降级以后如果调用的服务抛错了  数据是不是就不对了？

A：自动降级只是发起者那边发现 SeataServer 不可用后，不去走 begin 。你业务数据就完全没全局事务的允许运行，是会出现数据不一致。比如seata-server宕机了，后续的服务因为 Seata-Server 宕机，不走分布式事务，此时全局事务有部分数据是需要回滚的，但是由于Seata-Server宕机了，导致没法回滚，这个时候不经过全局事务的事务执行就会导致数据不一致。所以说，tc 最好集群搭建，以免宕机后，降级代表了你允许 at 模式下数据不一致。
Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

### 相关推荐阅读

- [蚂蚁金服微服务实践 | 开源中国年终盛典分享实录](https://www.sofastack.tech/blog/sofastack-oschina-2018/)
- [火了 2 年的服务网格究竟给微服务带来了什么？](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247486575&idx=1&sn=ad672eddce2ce3f745157cdee56c8a70&chksm=faa0e3b5cdd76aa390f623afb03c9fddd0c489618708089383ccbdd5c95b2fa96012c1a588d1&scene=21)
- [走出微服务误区：避免从单体到分布式单体](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247486495&idx=1&sn=73daf2aeb85b61e5d715a7e9f979dc3b&chksm=faa0e3c5cdd76ad3f93cf744e7ca156dbeef0347cde7f215415273782ba29526fb8c589bfeeb&scene=21)

### SOFA 项目进展

**本周发布详情如下：**
**1、SOFAJRaft 发布了 1.3.5 版本：**
- 增加对IPv6的支持＃526 ＃527
- 升级'rocksdb'到5.18.4以支持AArch64
- 优化：心跳响应不经过管道直接发送，避免管道影响心跳响应的及时性
- 
详细参考：[https://github.com/sofastack/sofa-jraft/releases/tag/1.3.5](https://github.com/sofastack/sofa-jraft/releases/tag/1.3.5)
**2、SOFABoot 发布 3.4.6 版本:**
- 支持手动 readiness 回调（健康检查二阶段）
- 扩展点失败反馈健康检查，默认为否
- 提供上下文隔离场景下获取所有 Spring 上下文的标准方法
- Bean 加载时间和层级树形分层显示

详细参考：[https://github.com/sofastack/sofa-boot/releases/tag/v3.4.6](https://github.com/sofastack/sofa-boot/releases/tag/v3.4.6)
