---
title: "SOFA Weekly | SOFABoot、SOFAArk 发布、9/20 上海线下活动推荐"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2020-09-11T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563524226806-e93607a3-1b77-4ca2-8c3c-0384ab966154.png"
---

**SOFA WEEKLY | 每周精选，筛选每周精华问答**

**同步开源进展，欢迎留言互动**

![weekly.jpg](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1562925824761-fc720f21-9622-437b-a783-0b0729eda119.jpeg)

**SOFA**Stack（**S**calable **O**pen **F**inancial **A**rchitecture Stack）是蚂蚁集团自主研发的金融级分布式架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

- **SOFAStack 官网：**[https://www.sofastack.tech](https://www.sofastack.tech/)
- **SOFAStack：**[https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动
我们会筛选重点问题通过 " SOFA WEEKLY " 的形式回复

**1、@陈健斌** 提问：

> Seata 使用注册中心只存储个地址列表，引入 SOFAJRaft 后感觉注册中心没必要了？用户用起来就跟 zk 集群、kafka 集群一样，ip:port,ip:port 这样。

A：这个 看需求了，都可以啊。我感觉还是可以继续使用注册中心，然后 SOFAJRaft 的地址从注册中心回去，动态构建 SOFAJRaft 集群。

> 可以噢，这样 client 端不需要设置 server 的集群了，通过注册中心来就可以了，自动组装了。
> ![设计图](https://cdn.nlark.com/yuque/0/2020/png/226702/1599815186271-93a9eba9-ec0f-49d4-985e-eabb90764e2a.png)
> 我目前是这么设计的，有空的话还望指点一二。

A：Sesta server 经常会经常替换吗？

> 这个得看用户了，要不咱假设2个情况吧，如果不经常替换，此方案适用不。经常替换下要做哪些改进？

A：经常替换的话要考虑 raft 集群的替换，要处理 addpeer removepeer 这是要走 raft 协议的（用 cliservice 这个接口），就是换一台 server 不是换个地址就完事了，需要调用 addpeer把新机器加入 raftgroup 然后 SOFAJRaft 会自动同步数据，移除一个节点需要调用 removepeer。

> 也就是，如果我现在扩容，比如我原来的节点是127.0.0.1:7091，127.0.0.1:7092，127.0.0.1:7093 然后我现在要加一个127.0.0.1:7094，我能不能直接跟 zk 那边扩容一样，我新加入进来的节点设置的地址是127.0.0.1:7091，127.0.0.1:7092，127.0.0.1:7093，127.0.0.1:7094，先让他加入进去，然后手动挨个重启其余3台。目前这样的扩缩容，我的设计方案能满足吗？

A：不需要重启，需要 addpeer，参考第11小结，最有效的排查 SOFAJRaft 问题工具
[https://www.sofastack.tech/projects/sofa-jraft/jraft-user-guide/](https://www.sofastack.tech/projects/sofa-jraft/jraft-user-guide/)
SOFAJRaft：[https://github.com/sofastack/sofa-jraft](https://github.com/sofastack/sofa-jraft)

**2、@koutatu** 提问：
> 想咨询下，Seata Saga 模式下，TC 的作用是什么呢，回滚操作还是 TC 触发吗？感觉 Saga 状态机模式下，状态机可以控制回滚，TC 是不是只是记录下状态，不做什么实际处理了呢？

A：你说的应该是对的，Saga 脱离 TC 理论上都是可行的。

> 目前的回滚操作是不是也是状态机自身控制的，也就是链路里面的每一步都需要有一个状态机。TC 只负责接收消息，而不是像 TCC 或者拦截器式的 Saga 一样，回滚由 TC 统一控制。

A：TC 在 Saga 模式的作用就是记录全局事务分支事务状态。
Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

### 本周推荐阅读

- [蚂蚁金服研发框架总览 | SOFABoot 框架剖析](/blog/sofa-boot-overview/)
- [蚂蚁金服研发框架日志隔离解析 | SOFABoot 框架剖析](/blog/sofa-boot-log-isolation/)
- [SOFABoot 扩展点初体验 | SOFALab 实践系列](/blog/sofa-boot-extension-practice/)
- [剖析 | 详谈 SOFABoot 模块化原理](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247484113&idx=1&sn=21ea61a6feb801a5a95e728d234e2dad&chksm=faa0ed0bcdd7641d0a72dc35d5437fe4d4928ac181e007ad4f2d7a8e7f7c61757eae9181c9ee&scene=21)
- [实操 | 基于 SOFABoot 进行模块化开发](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247484017&idx=1&sn=f4ca7f563ad0ed6158282736a141a1f3&chksm=faa0edabcdd764bd7d8dda126f923d1b8653fc4f2e3d77b7873c1b288a35f0ff0ae79bf74321&scene=21)
- [开源 | SOFABoot 类隔离原理剖析](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247483929&idx=1&sn=d68a3cc20bad606ef5337ac3630b74f0&chksm=faa0edc3cdd764d57787aca5c40a05977c84549ac01c6c183340992e6c7ee48eb17f686b9787&scene=21)

### SOFA 项目进展

**1、发布 SOFAArk v1.1.4 版本，主要变更如下：**

- 支持动态替换 biz name；
- TestClassLoader 导出 mockito 包以支持 mockito 测试框架；
- 修复 AfterBizStopEvent 事件处理时机问题导致的 NPE；
- 修复 web 模块卸载问题；
- 支持 ark telnet 使用安全模式启动；

详细发布报告：[https://github.com/sofastack/sofa-ark/releases/tag/v1.1.4](https://github.com/sofastack/sofa-ark/releases/tag/v1.1.4)

**2、发布 SOFABoot v3.4.4 版本，主要变更如下：**

- 提供 jvm 调用拦截扩展；
- 修复若干测试用例；
- 修复在 ark 环境使用 sofa:reference 引用 jvm 服务出现 NPE bug；
- 修复健康检查通过但 ExtensionComponent activate 失败 bug；

详细发布报告：[https://github.com/sofastack/sofa-boot/releases/tag/v3.4.4](https://github.com/sofastack/sofa-boot/releases/tag/v3.4.4)

### 社区活动预告

![OceanBaseDev Meetup#1](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1599815543398-70aac1d7-69a2-4007-8016-78f942b25a08.jpeg)

近几年，越来越多的传统企业面临互联网化，IOT、区块链、AI、5G 等技术也在高速发展，任何一个技术的推广到成熟都会带来数据量的指数级增长，都会对存储带来巨大的冲击。相信随着这些技术的突破，未来越来越多的核心场景会走向分布式的领域。国内很多团队也在进行分布式数据库的探索与实践。

OceanBaseDev Meetup 是以城市站展开的数据库技术交流活动，旨在为关注**分布式数据库技术**的同学提供技术交流、分享、探讨的空间与平台。

OceanBaseDev Meetup#1 上海站，将邀请**蚂蚁集团** OceanBase 团队的三位核心研发专家以及**网易杭研**资深研发工程师，针对分布式数据库的分布式事务以及落地实践展开分享。现场更有外滩大会门票等你来拿～

**活动主题**：**OceanBaseDev Meetup#1 上海站「深入分布式数据库：事务·高可用·云原生」

**出品人：**
- 杨传辉（花名：日照）蚂蚁集团研究员、OceanBase 总架构师
- 韩富晟（花名：颜然）蚂蚁集团资深技术专家、OceanBase 事务研发负责人

**活动时间：**2020-09-20 13:00-17:30

**活动地点：**上海市杨浦区政学路77号 InnoSpace+

**活动报名：点击“[**阅读原文**](https://www.huodongxing.com/event/5562442480600)”，了解活动详细议题并锁定席位
