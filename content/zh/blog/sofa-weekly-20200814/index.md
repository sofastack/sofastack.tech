---
title: "SOFA Weekly | SOFABoot 发布、SOFAJRaft 以及 SOFARPC 内容合辑、MOSN 活动报名"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2020-08-14T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563524226806-e93607a3-1b77-4ca2-8c3c-0384ab966154.png"
---

**SOFA WEEKLY | 每周精选，筛选每周精华问答**
**同步开源进展，欢迎留言互动**

![weekly](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1562925824761-fc720f21-9622-437b-a783-0b0729eda119.jpeg)

**SOFA**Stack（**S**calable **O**pen Financial **A**rchitecture Stack）是蚂蚁集团自主研发的金融级分布式架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

- **SOFAStack 官网：**[https://www.sofastack.tech](https://www.sofastack.tech/)
- **SOFAStack：**[https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动

我们会筛选重点问题通过 " SOFA WEEKLY " 的形式回复

**1、@陈亚兵** 提问：

> 我想单独使用注册中心 SOFARegistry，可能的服务有 Java 和 Python，SOFARegistry 支持 Python 服务接口的注册吗？

A：SOFARegistry 注册中心是支持各个语言的服务发现和订阅的，目前开源版中只有 Java client。实现其他语言的服务发现和订阅，需要自己实现相关语言的 Registry client。

> sofa-bolt-python 也有服务发现和发布，它和 sofa-registry 的发现有什么不同吗？

A：sofa-bolt-python 只做了使用 MOSN 的服务接口的客户端。sofa-registry 是服务端。
SOFARegistry：[https://github.com/sofastack/sofa-registry](https://github.com/sofastack/sofa-registry)

**2、@刘明** 提问：

> Seata 的 XA 模式做了一个压测，tps=1000，开始报错，ORA-24756：事务处理不存在。 看了下数据库global_table，状态是 3。 3 是 CommitRetrying ， 这说明 phase 1 阶段过了，2 阶段提交报事务不存在。 目前 global_table 里有700多条记录，95%是状态3，还有状态1的。

A：应该是一个原因，很可能就是2阶段提交失败了。begin 的你查看下他的分支事务状态是什么。

> begin 的分支表里没有数据，可能注册就失败了。

A：是的，有可能，TC 收到了，然后 TM 超时了，我建议你 1000tps 的测试，搞个 TC 集群，就一台可能撑不住。

> 我想在出错的时候，有个日志轨迹，可以知道数据目前是不是脏的？

A：select for update 或者 update x=x+n 这样写法一般没事。

> 会不会锁住记录呢？

A：不锁住怎么保证隔离性。这个 for update xa 没提交前会锁住的，这个锁由数据库方自己已经实现了。

> 是的，那1阶段已经过了，记录会一直锁在那里了吗？

A：二阶段没提交，锁在数据库肯定没释放。不过看起来你应该提交了吧，因为已经提示你事务不存在了。

> 是的，事务提示不存在，但是数据没有提交。 我研究下。

A：可以的，seata-xa 现在还不是特别完善，可以多研究下，发现问题可以提交 PR 来贡献，一起让 XA 更稳定更好。

> 并发情况下，事务已经提交，TCC 发起 global commit 请求超时导致了 commitRetry，因此事务不再存在，只是 TCC 会一直去重试。 这导致了性能下降很快，不断重复已经不存在事务的 commit 动作，使用 Oralce 测试下来耗时很大，MySQL 可能也不会更好。考虑在 RM 端做 xaCommit 的时候，引入一个 Redis 检查 xid 是否已经提交，已经提交返回提交成功。

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

### 本周推荐阅读

- [基于 RAFT 的生产级高性能 Java 实现 - SOFAJRaft 系列内容合辑](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247486702&idx=1&sn=6fd48197893a8dd5546a8c7669430297&chksm=faa0e334cdd76a229640d3b3d8f779ada8ba706ccf1b0a89b8d0786e025e2f1da4400cb5bd35&scene=21)
- [生产级高性能 Java RPC 框架 - SOFARPC 系列内容合辑](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247486661&idx=1&sn=bdb81cff1b48750e66e066565336db6a&chksm=faa0e31fcdd76a0901d99af8455b4113c32f17f8fdad1c7810de5f940dc66593b4276d61a73c&scene=21)
- [蚂蚁是如何改进 K8s 集群敏感信息的安全防护的？](/blog/antgroup-k8s-security-protection-of-cluster-sensitive-information/)

### SOFA 项目进展

**本周发布详情如下：**

**发布 SOFABoot v3.4.3 版本，主要变更如下：**

- 新增 endpoint，支持展示启动耗时信息；
- 升级 Tomcat 版本，修复安全隐患 CVE-2020-11996；

详细发布报告：[https://github.com/sofastack/sofa-boot/releases/tag/v3.4.3](https://github.com/sofastack/sofa-boot/releases/tag/v3.4.3)

### 社区活动报名

![A2M 架构与人工智能创新峰会](https://cdn.nlark.com/yuque/0/2020/png/226702/1597385488431-79adcb5c-ee99-40ba-a7ee-868044a6906f.png)

A2M 峰会旨在发现全球互联网领域在人工智能、大数据、互联网架构等领域的创新工程和杰出团队，整合国际最佳技术实践，构建行业案例研究智库，帮助中国企业在人工智能时代成功转型、升级。**蚂蚁集团受邀进行云原生构建之路的专题分享。**

**分享主题：****Dubbo 基于 MOSN 在 Service Mesh 场景下的落地实践**

**分享嘉宾：**曹春晖 蚂蚁集团 可信原生技术部技术专家

蚂蚁集团技术专家，对 Go 语言有深入的研究，《Go 语言高级编程》作者。在后端业务开发、数据平台等领域有多年的实践经验。目前正在领导 MOSN 社区进行 Dubbo 生态在 Service Mesh 场景下的落地工作。

**背景介绍：**过去一段时间，云原生和 Service Mesh 大火。很多公司希望借着东风推动公司的微服务架构演进到下一阶段。然而在实践过程中不会事事如意，问题接踵而至。

在使用 Dubbo 来做微服务框架的公司中，因为每个公司发展阶段不同，上云的进度不同，社区方案却要求必须要在完全上云之后才能沐浴 Service Mesh 的春风，这着实令人失望。

**解决思路：**借助前人的落地经验，在 MOSN 与 Dubbo 结合的探索中，我们思考出一些可供处于不同上云阶段的公司参考的落地方案。经过对数据面的简单改造，在控制风险的前提下，能够渐进地将 Service Mesh 落地到公司内。

**成果：**基于 MOSN 和 Dubbo-go，实现 Service Mesh 在 Dubbo 场景下的落地。

**听众收益：**

- 了解落地 Service Mesh 对于整体架构的收益；
- 了解 MOSN 社区的发展现状和规划；
- 了解 Dubbo 在各种业务场景和上云发展阶段中如何优雅落地 Service Mesh；

**分享时间**：2020-09-05 16:50-17:50

**活动地点：上海**

**活动报名：**点击“[这里](http://a2m.msup.com.cn/a2m2020/a2m2020/course?id=14751)”锁定席位
