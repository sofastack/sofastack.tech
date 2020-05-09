---
title: "SOFA Weekly | MOSN&amp;SOFARPC 发布、社区活动报名"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2020-05-08T17:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563524226806-e93607a3-1b77-4ca2-8c3c-0384ab966154.png"
---

**SOFA WEEKLY | 每周精选，筛选每周精华问答**

**同步开源进展，欢迎留言互动**

![weekly.jpg](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1562925824761-fc720f21-9622-437b-a783-0b0729eda119.jpeg)

SOFAStack（Scalable Open Financial Architecture Stack）是蚂蚁金服自主研发的金融级分布式架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

**SOFAStack 官网: **[https://www.sofastack.tech](https://www.sofastack.tech/)

**SOFAStack: **[https://github.com/sofastack](https://github.com/sofastack)

### 社区大事件

**MOSN 社区新认证一位 Committer**

孙福泽（[@peacocktrain](https://github.com/peacocktrain)）认证成为 MOSN Committer：

主要贡献： 贡献 3 个 feature PR

- 使 MOSN 支持 Istio 1.4；
- 协议支持 HTTP2 双向流式；
- 添加管道缓冲区；

MOSN：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)


### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动

我们会筛选重点问题通过 " SOFA WEEKLY " 的形式回复

**1、@chromosome **提问：

> 这个视频中提到因为 log server 中存储得到 commitedId 和 applyId 不是任意时刻都同步的，这样的话，如果说状态机的 apply 速度较慢，很可能 client 的 read request 并不能读取到状态机最新 committed 的操作的结果。
> [https://tech.antfin.com/community/live/821/data/902](https://tech.antfin.com/community/live/821/data/902)

A：commitedIndex 和 applyIndex 的不完全同步，并不影响 read request 的结果，所以上面的后半句理解还是有点问题，可以看一下 SOFAJRaft 线性一致读的原理介绍，参考这个链接线性一致读章节 [https://www.sofastack.tech/projects/sofa-jraft/consistency-raft-jraft/](https://www.sofastack.tech/projects/sofa-jraft/consistency-raft-jraft/)

> 所以 counter 例子中的 readindex 写法就是为了读线性一致性吗？例如 this.counterServer.getNode().readindex

A：是的。

SOFAJRaft：[https://github.com/sofastack/sofa-jraft](https://github.com/sofastack/sofa-jraft)

2、**@王勇 **提问：

> 在 AT 模式下，事务的回滚如何补偿三方的缓存操作呢？有没有额外的接口，还是只能是变成 TC 模式，或是自己写 aop？

A：TCC 嵌套 AT，TCC 二阶段行为做补充。

> TCC 内应该说是不存在 AT 吧。

A：AT 保证数据库的一致性，TCC 做来二阶段时的三方处理，比如发出 MQ 消息、缓存之类的。

> 就是 AT 和 TCC 在同一全局事务中一起使用是吧。这个 TCC 一阶段可以是空的，二阶段回滚时清理缓存嘛？

A：嗯。

> OK，我明白了。就是让 TCC 嵌套 AT，通常情况下 TCC 为空，需要补偿的时候向 TCC 里写入东西。

A：可以这么说，如果 TCC 触发二阶段是回滚，你就把缓存删掉，如果是提交就啥也不干，大概是这么个意思。

> TCC 模式下 AT 是默认的吗？对于大事务，Saga 模式，您用过吗？

A：一、首先需要创建状态机引擎的 bean。
1.2.0里，状态机引擎的 bean 需要自己创建的。
1.3.0里，spring-boot-starter-seata 里会提供自动配置类。（可以先参考我修改过的代码吧。[https://github.com/wangliang1986/seata）](https://github.com/wangliang1986/seata）)
二、需要创建 Saga 模式所需的三张表。github 上可以找到建表 SQL。
三、使用 Seata 的在线状态机设计器来定义流程。地址：[http://seata.io/saga_designer/index.html](http://seata.io/saga_designer/index.html)
四、将设计器生成的 json 文件放到自己项目的 resources 中，由状态机引擎去加载它。状态机配置类中有一个配置项可以配置 json 文件路径。
五、使用状态机引擎启动 Saga 事务即可。（要注意的是 1.2.0 版本中，Saga 无法与 AT 一起启用。1.3.0 将修复此问题。）
Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

### 本周推荐阅读

- [（含直播报名）Kata Containers 创始人：安全容器导论](/blog/kata-container-introduction-to-safe-containers/)
- [蚂蚁金服 SOFAJRaft 优先级选举剖析 | 特性解析](/blog/sofa-jraft-priority-election/)
- [Service Mesh 和 API Gateway 关系深度探讨](/blog/service-mesh-api-gateway-in-depth-discussion-of-relationships/)

### SOFA 项目进展

**本周发布详情如下：**

**1、发布SOFARPC v5.7.0,主要变更如下：**

- 支持基于 grpc 的 triple 协议；
- 重构项目模块结构；

详细发布报告：
[https://github.com/sofastack/sofa-rpc/releases/tag/v5.7.0](https://github.com/sofastack/sofa-rpc/releases/tag/v5.7.0)


**2、发布 SOFA MOSN v0.12.0，主要变更如下：**

- 支持 SkyWalking；
- 支持流式 HTTP2；
- 熔断功能、负载均衡逻辑优化，负载均衡新增 ActiveRequest 和 WRR 算法；
- 优化 HTTP 连接建立性能；
- 底层实现优化；
- Bug Fix；

详细发布报告：
[https://github.com/sofastack/sofa-mosn/releases/tag/v0.12.0](https://github.com/sofastack/sofa-mosn/releases/tag/v0.12.0)

### 社区直播报名

![SOFAChannel#16.jpg](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1587728387529-17191abc-9201-464f-ac0e-488668850c2c.jpeg)

本期为第一期 Service Mesh Virtual Meetup 线上系列直播第一期，邀请了四位来自不同公司的嘉宾，从四个角度对 Service Mesh 的应用实践展开分享。

本次线直播分享涵盖 Service Mesh 的可观察性和生产实践，为大家介绍 Service Mesh 中的可观察性与传统微服务中可观察性的区别，如何使用 SkyWalking 来观测 Service Mesh，还有来自百度和陌陌的 Service Mesh 生产实践。

本系列采用线上直播的形式，从 5 月 6 日开始到 5 月 14 日，每周三、周四晚上  19:00-20:00 我们相约进行一个主题分享。


| 时间 | 分享主题 | 分享嘉宾 | 嘉宾介绍 |
| --- | --- | --- | --- |
| 5/6 | 陌陌的 Service Mesh 实践 | 高飞航 | 陌陌中间件架构师 |
| 5/7 | Apache SkyWalking 在 Service Mesh 中的可观察性应用 | 高洪涛 | Tetrate 创始工程师 |
| 5/13 | Servicre Mesh 高可用在企业级生产中的实践 | 罗广明 | 百度高级研发工程师 |
| 5/14 | Servicre Mesh 中的可观察性实践 | 叶志远 | G7 微服务架构师 |

观看直播方式：点击“[这里](https://live.bilibili.com/21954520)”，关注直播间，即可观看直播
