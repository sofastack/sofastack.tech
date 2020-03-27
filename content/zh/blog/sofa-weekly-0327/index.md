---
title: "SOFA Weekly | MOSN 直播预告、本周直播回顾整理、SOFARegistry 发布"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "【03/23-03/27】 | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2020-03-27T17:00:00+08:00
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

**1、@John Deng** 提问：

> 现在 MOSN 对 Dubbo 协议支持怎样？

A：这儿，协议支持了：[https://github.com/mosn/mosn/tree/master/pkg/protocol/xprotocol/dubbo](https://github.com/mosn/mosn/tree/master/pkg/protocol/xprotocol/dubbo)
完整的支持，我们已经创建了 Dubbo WG 专门来做这个事情，[https://github.com/mosn/community/blob/master/wg-dubbo.md](https://github.com/mosn/community/blob/master/wg-dubbo.md)

> 已经生产就绪了吗？

A：如果是 Dubbo 的话，目前还没有生产可用，主要是相关生态还没对齐，我们正在推进 Dubbo WG kick off，有兴趣可以加入一起完善。
如果指 MOSN 的话，我们去年双11已经线上部署几十万容器，生产可用。
MOSN：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

**2、@Liang** 提问：

> SOFAJRaft 的 Leader 节点执行完状态机，把这次的 index 提交之后，什么时候通知的 Follower 节点也提交呢？ 我看现象是 Follower 也立刻跟着提交了，但是这块代码没有找到。想问下具体是怎么实现的，谢谢~

A：Leader 会往 Follower 发送 lastCommittedIndex， 详情见：

```java
com.alipay.sofa.jraft.core.NodeImpl#handleAppendEntriesRequest
com.alipay.sofa.jraft.core.BallotBox#setLastCommittedIndex
```

SOFAJRaft：[https://github.com/sofastack/sofa-jraft](https://github.com/sofastack/sofa-jraft)

**3、@琦玉** 提问：

> 这种情况下，状态机怎么确定是执行回滚，还是执行重试呢？
> ![Saga 模式](https://cdn.nlark.com/yuque/0/2020/png/226702/1585292923673-187799ae-07b1-464c-8dd2-3b48290528e2.png)

A：这个是由开发者决定的。
Server 事务恢复的逻辑是：

1. 当提交失败时，重试提交；
1. 补偿失败时，重试补偿；
1. 如果超时默认是进行重试补偿，如果配置了这个"RecoverStrategy": "Forward"则进行重试向前执行；

这个"RecoverStrategy": "Forward"配置是告诉状态机默认的事务恢复策略。如果发现这条事务无法向前，也可以通过手动调状态机“补偿”。

!["RecoverStrategy": "Forward"](https://cdn.nlark.com/yuque/0/2020/png/226702/1585292923696-03586ef2-b19c-4329-9346-680ba697a274.png)

> 这种是否最终成功可能有其它业务上的条件，比如取决于另外一个步骤的成功与否。没法在状态语言里面定义。如果 A 充值成功，事务失败，B 就不能回退，必须重试到最终成功。如果 A 充值失败，事务失败，B 就可以回退。这种具体是要怎么去处理呢？分布式事务内先给用户 A 充值, 然后给用户 B 扣减余额, 如果在给 A 用户充值成功, 在事务提交以前, A 用户把余额消费掉了, 如果事务发生回滚, 这时则没有办法进行补偿了

A：不允许这样设计，业务流水，必须先扣，再充，必须要遵循“宁可长款，不可短款”的原则。

> 意思是分成两个独立的事务，Saga 模式中不定义在同一个状态机流程里？先把B的扣钱流程执行完，再去执行 A 的充值流程 ？

A：不是，是在同一个事务里，同一个流程，要先进行扣 B 的款，再给 A 充值，那和如果充值失败，可以回滚 B。

> 假如同时给 B 和 C 充值呢？

A：那就都向前重试，因为充钱业务上不会失败。

> 如果做重试的话，是不是整个流程其它做回退的动作都要在充值动作之前完成?在重试动作之后的动作都只能做重试?

A：也不是完全只能这样，要根据业务场景来吧。做一个合理的流程设计。
相关阅读：[Seata 长事务解决方案 Saga 模式 | SOFAChannel#10 回顾](https://www.sofastack.tech/blog/sofa-channel-10-retrospect/)
Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

### 本周推荐阅读

- [Service Mesh 通用数据平面 API（UDPA）最新进展深度介绍](/blog/service-mesh-api-udpa-follow-up/)
- [云原生网络代理 MOSN 多协议机制解析 | SOFAChannel#13 直播整理](/blog/sofa-channel-13-retrospect/)

### SOFA 项目进展

**本周发布详情如下：**

**发布 SOFARegistry v5.4.2 版本，主要变更如下：**

- 修复 cloud 模式推送时客户端 cell 设置错误的问题；

详细发布报告：
[https://github.com/sofastack/sofa-registry/releases/tag/v5.4.2](https://github.com/sofastack/sofa-registry/releases/tag/v5.4.2)

### 社区直播报名

![channel#14](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1585293414983-ef3d97ea-460c-42b4-894a-a3cc6b72d6cd.jpeg)

MOSN 是一款使用 Go 语言开发的网络代理软件，由蚂蚁金服开源并经过几十万容器的生产级验证。

MOSN 作为云原生的网络数据平面，旨在为服务提供多协议，模块化，智能化，安全的代理能力。在实际的生产使用场景中，通用的网络代理总会与实际业务定制需求存在差异，MOSN 提供了一系列可编程的扩展机制，就是为了解决这种场景。

本次分享将向大家介绍 MOSN 的扩展机制解析以及一些扩展实践的案例。

本期直播包含 Demo，可以先下载 Demo，提前体验 MOSN 拓展机制的使用（报名页面有详细 Demo 链接）。

- 主题：SOFAChannel#14：云原生网络代理 MOSN 的扩展机制解析
- 时间：2020年4月9日（周四）19:00-20:00
- 嘉宾：永鹏 蚂蚁金服高级开发工程师、MOSN Committer
- 形式：线上直播
- 报名方式：点击“[这里](https://tech.antfin.com/community/live/1152)”，即可报名
