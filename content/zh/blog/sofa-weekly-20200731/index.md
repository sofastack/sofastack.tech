---
title: "SOFA Weekly | SOFAJRaft 以及 SOFABoot 发布、MOSN 社区活动预告"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2020-07-31T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563524226806-e93607a3-1b77-4ca2-8c3c-0384ab966154.png"
---

**SOFA WEEKLY | 每周精选，筛选每周精华问答**

**同步开源进展，欢迎留言互动**

![weekly.jpg](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1562925824761-fc720f21-9622-437b-a783-0b0729eda119.jpeg)

**SOFA**Stack（**S**calable **O**pen Financial **A**rchitecture Stack）是蚂蚁集团自主研发的金融级分布式架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

- **SOFAStack 官网: **[https://www.sofastack.tech](https://www.sofastack.tech/)
- **SOFAStack: **[https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动
我们会筛选重点问题通过 " SOFA WEEKLY " 的形式回复

**@刘明** 提问

> 请问，分支事务在回滚过程中，服务器宕机了，重新启动后，TC 如果发送过来的回滚请求，是否还能继续回滚？

A：可以。

> 是使用 XA 模式的 Oracle 数据库，分支服务器即使宕机了，回滚日志还在 Oracle 上是么？

A：是的，xa_prepare 在 DB 实现 XA 层面做了持久化，MySQL 要求 5.7.7+。

> 刚测试了下 Oracle 的，xid 就像一个字符串 key 一样，任何时候只要告诉 Oracled 对 xid 做 rollback 都可以成功。我以为需要在 start/end 同一个连接里才行，是我理解错了。

A：lcn 才需要这样，xa 不需要一个连接，所以 lcn 那种宕机了数据就没了。

> LCN 没有了解，他难道不是基于数据库自带的 XA 实现的？

A：lcn 是 lcn 框架的一个原理，就是通过 connection 来统一提交和回滚。

> 我是用 jdbc 直接操作 Oracle 测试的，用 Oracle 的 XAResource。 这个特性是数据库自带的？

A：XA 协议本来就是由数据库方进行的支持。

> 使用 DatabaseSessionManager 去存储 globalsession，这个 lockAndExecute 方法没有 lock 的逻辑，多个进程在获取 global 会话做超时、重试提交等时，会有资源冲突吗？

A：多个 TC 会出现资源争抢冲突，倒是不影响一致性。

> 多个 TC 会对同一个 XID 做 retryCommitingg 操作吧，2个 TC 会做2次，3个 TC 会做3次？

A：是的，没有分布式任务调度。

> 2个事务分支，TC 在发起提交请求后，分支一正常提交，分支二网络波动没有收到提交请求。 这个时候 TC 会尝试重试提交。 如果一直重试失败，会因为全局事务 timeout 发起回滚请求吗？

A：提交一阶段就是持久化了，不会影响。

> 但是全局事务会有个超时检查，超时的事务处理方式就是回滚，会不会这样？分支二的提交重试一直不能成功，最后global 会话超时的吧？这时候分支一已经 commit，再做 rollback 肯定不行了。

A：二阶段结果已经出现了，已经决议好了的，二阶段的提交只不过是空提交而已，异步的。

> 二阶段 TC 成功发送 commit，RM 接收到了后，执行 XA 提交动作，这时候数据才真正可以看到，如果 RM 接收不到 commit 请求，他本地数据时没有提交的吧？

A：XA 模式确实是这样的。

> 那参与者中有人收到 commit 请求了，有人没收到，最后 global 超时，是不是也没法回滚了？

A：XA 一阶段只是做了预备数据的持久化，保持操作，并没有真正入库，等到 commit 的时候才会入库，每个模式2阶段都不一样。
Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

### 本周推荐阅读

- [Kata Containers 2.0 的进击之路](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247486638&idx=1&sn=e684736dac39b1c23ceb1b1346cf52e3&chksm=faa0e374cdd76a62b3fbec88e00d284229710fe37f1f476d69f78451d3f9d53aba6a49b837ed&scene=21)
- [Kata Containers 创始人：安全容器导论](/blog/kata-container-introduction-to-safe-containers/)
- [Kata创始人王旭：远程工作可以从开源中借鉴哪些经验？](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247485887&idx=1&sn=ae5efe4c0903ce642779c91a3d87e9f0&chksm=faa0e665cdd76f7343067d9a569aba6f599cd942e4b1b2753d6e50ef63debf5b031d3478c6d7&scene=21)

### SOFA 项目进展

**本周发布详情如下：**

**1、发布 SOFABoot v3.4.2 版本，主要变更如下**：

- 修复 ServiceComponent 和 ReferenceComponent 的健康检查结果不包含抛出的内部异常；
- 修复默认情况下 SOFA runtime 忽略组件抛出的内部异常；
- 增加引流操作的阻断性，fail fast；

详细发布报告：[https://github.com/sofastack/sofa-boot/releases/tag/v3.4.2](https://github.com/sofastack/sofa-boot/releases/tag/v3.4.2)

**2、发布 SOFAJRaft v1.3.4 版本，主要变更如下：**

- 升级 SOFABolt 到 1.6.2（支持异步非阻塞建连机制）；
- 移除对 log4j 的直接依赖；
- RouteTable、RegionEngine、StoreEngine 实现 Describer 以提供更详细的调试信息；
- 修复 snapshot 文件创建漏洞，禁止跳出 snapshot 目录之外创建文件；

详细发布报告：[https://github.com/sofastack/sofa-jraft/releases/tag/1.3.4](https://github.com/sofastack/sofa-jraft/releases/tag/1.3.4)

### 社区活动报名

![GIAC](https://cdn.nlark.com/yuque/0/2020/png/226702/1593767327848-6b0d42f2-2cc8-479b-8375-3d375dba618a.png)

GIAC（GLOBAL INTERNET ARCHITECTURE CONFERENCE）是面向架构师、技术负责人及高端技术从业人员的年度技术架构大会，是中国地区规模最大的技术会议之一。**蚂蚁集团也受邀进行 CloudNative(云原生) 的主题分享。**

- **分享主题：云原生网络代理 MOSN 的进化之路**
- **分享嘉宾：**王发康（毅松）蚂蚁集团 可信原生技术部 技术专家
- **背景介绍：**网络通信代理 MOSN 在蚂蚁集团的 Service Mesh 大规模落地后，通过对接 UDPA 打造为 Istio 的数据面之一，增强 MOSN 服务治理及流量控制能力，对接云原生周边组件，实现 MOSN 开箱即用，MOSN 成为云原生 Service Mesh 的标准 Sidecar 之一，从而借力开源，反哺开源。
- **听众收益：**可快速基于 MOSN 和 Istio 进行 Service Mesh 实践，了解微服务的发展历程、遇到的痛点以及解决方案，获取 MOSN 的功能特性，解决微服务常见的问题。
- **分享时间**：2020-08-15 13:30-14:30
- **活动地点：**深圳
- **活动报名：**点击“[这里](http://giac.msup.com.cn/Giac/schedule/course?id=14579)”
