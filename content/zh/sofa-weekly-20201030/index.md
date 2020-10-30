---
title: "SOFA Weekly | MOSN 项目更新及直播预告"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "【10/26-10/30】 | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2020-10-30T15:00:00+08:00
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

**1、@王钢** 提问：
> [https://github.com/sofastack-guides/kc-sofastack-dynamic-demo/issues/11](https://github.com/sofastack-guides/kc-sofastack-dynamic-demo/issues/11) 基于 SOFAArk 和 SOFADashboard 实现动态模块管控时遇到宿主应用能够下载biz安装成功，但是不能在zookeeper下生成对应的/apps/biz节点，导致管理端不能更新状态，不知道应该怎么排查解决。使用的 ZK 版本是 3.4.10。

A：可以 debug 下写 /apps/biz 的逻辑，这里是不是宿主客户端没有连接上来，具体可以看一下：[https://github.com/sofastack/sofa-dashboard-client](https://github.com/sofastack/sofa-dashboard-client)
SOFADashboard 之前只做了一个简单的模型，后面陆续其他同学也在上面做了一些开发，如果有兴趣可以一起参与共建哈。

SOFADashboard：[https://github.com/sofastack/sofa-dashboard](https://github.com/sofastack/sofa-dashboard)

**2、@钟文豪** 提问：
> SOFAJRaft 是如何计算 commitIndex 的呢？

A：可以看看这个文档：[https://www.sofastack.tech/projects/sofa-jraft/raft-introduction/](https://www.sofastack.tech/projects/sofa-jraft/raft-introduction/)

SOFAJRaft：[https://github.com/sofastack/sofa-jraft](https://github.com/sofastack/sofa-jraft)

**3、@张潇** 提问：
> 各位好 问个概念的问题。我三个服务 A,B,C，在 A 服务方法加了 @GlobalTransactional，调用 B ，C。启动三个服务的时候看 Seata 日志  ,A,B,C 服务每一个都是 RM 也是 TM。是这样的吗？不是 A 服务才是 TM 吗？

A：在你这个事务当中，A 是对应着 TM，B、C 对应着 RM。 但是在注册的时候，他们都同时向 seata-server 注册了 TM 和 RM，意味着他们可以作为 TM，也可以作为 RM。 比如你有一个全局事务从 B 发起的，那这个时候他就是 TM。如果你认为你的业务场景中 B、C 这两个服务不会作为 TM 存在，你也可以把 TM 相关的配置删了，然后他就不会去注册 TM 了。可以从定义上去看 TM 和 RM，会发起全局事务的就是 TM，对应着数据库资源的就是 RM。一个服务可能只是 TM，也可能只是 RM，也可能都是。

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

### 本周推荐阅读

- [网商银行是如何建设金融级云原生分布式架构的？](https://mp.weixin.qq.com/s/POvppHGNQiD2RVoi2apYKA)
- [开源项目是如何让这个世界更安全的？](https://mp.weixin.qq.com/s/dgjX__f6aH5j2X5W41hOWQ)

### SOFA 项目进展

**本周发布详情如下：**

**开源 MOSN Golang 系统诊断工具 holmes beta 版：**

- 支持基于 goroutine 波动的自动 goroutine profile dump；
- 支持基于 RSS 统计的 heap profile dump；
- 支持基于 CPU 使用率的自动 cpu profile dump；

详细参考：
[https://github.com/mosn/holmes/blob/master/readme.md](https://github.com/mosn/holmes/blob/master/readme.md)


### SOFA 直播预告
![Service Mesh Webinar#4](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1604051618877-1f760465-fd0e-483f-b9a4-9f02e31e7248.jpeg)

传统 CDN 节点内组件间通信通过 IP 分组渲染的方式实现，当更多参差不齐的异构节点资源出现的时候则不再能很好地满足我们的需求。

本期主要分享阿里云将传统的 CDN 节点改造成微服务架构的落地过程，主要使用了蚂蚁 SOFAStack–Service Mesh 的数据面  MOSN，主要分为两个阶段，第一个阶段是由传统 CDN 节点到数据面先行的微服务架构，通过数据面  MOSN+coredns 实现服务发现；第二个阶段是由数据面先行到数据面+控制面的标准 Service Mesh 架构。根据我们的落地和改造经验，介绍基于 MOSN+coredns/Istio 的 Service Mesh 架构改造的实际案例。上期分享了《Service Mesh 在 CDN 边缘场景的落地实践》，大家也可以温故一下～
视频回顾地址：[https://tech.antfin.com/community/live/1289](https://tech.antfin.com/community/live/1289)

**分享主题：**《Service Mesh Webinar#4:阿里云 CDN 节点微服务架构演进之路》

**分享嘉宾：**邓茜（花名沐沂），阿里云高级开发工程师

**听众收获：**

- 了解边缘场景下，使用 Service Mesh 架构的好处；
- 了解如何利用 MOSN + coredns 实现简单的服务发现；
- 了解如何利用 MOSN+ Istio 配置 http/tcp/udp 的转发规则以及如何动态配置持久化；

**线上直播时间：**2020 年 11 月 4 日（周三）20:00-21:00

**欢迎报名**：点击“[**这里**](https://tech.antfin.com/community/live/1290)”，即可报名。
