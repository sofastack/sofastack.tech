---
title: "SOFA Weekly | SOFAJRaft 发布、CNCF 旗舰会议活动预告"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2020-07-10T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563524226806-e93607a3-1b77-4ca2-8c3c-0384ab966154.png"
---

**SOFA WEEKLY | 每周精选，筛选每周精华问答**

**同步开源进展，欢迎留言互动**

![weekly.jpg](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1562925824761-fc720f21-9622-437b-a783-0b0729eda119.jpeg)

**SOFA**Stack（**S**calable **O**pen Financial **A**rchitecture Stack）是蚂蚁集团自主研发的金融级分布式架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

- **SOFAStack 官网:**[https://www.sofastack.tech](https://www.sofastack.tech/)
- **SOFAStack:**[https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动
我们会筛选重点问题通过 " SOFA WEEKLY " 的形式回复

**@郝连帅** 提问：
> 如果回滚失败有没有告警机制实现？比如钉钉告警。

A：可以的，实现 FailureHandler 接口。

![image.png](https://cdn.nlark.com/yuque/0/2020/png/226702/1594370310595-803c3550-105a-44d6-8673-d89e61166bfc.png)

### 本周推荐阅读

- [支付宝资深技术专家尹博学：新一代金融核心突破之全分布式单元化技术架构](/blog/antgroup-yinboxue-fully-distributed-unitized-technology-architecture/)
- [走出微服务误区：避免从单体到分布式单体](/blog/microservices-misunderstanding-avoid-monolith-to-distributed-monolith/)

### SOFA 项目进展

**本周发布详情如下：**

**发布 SOFAJRaft v1.3.3，主要变更如下：**

- RheaKV 允许不同分片各自配置不同的 learner 节点；
- 在只有一个成员变更的情况下，仍然使用 raft 联合一致性算法；
- 替换基于 GPL-2.0 licence 的 Bits.java；
- 升级 jackson.databind 版本到 2.10.4 已修复安全漏洞；
- 修复在 node panic 后可能因为未及时刷盘导致快照元数据丢失的 bug；

致谢（排名不分先后）：@zongtanghu

**此版本强烈建议升级**
详细发布报告：[https://github.com/sofastack/sofa-jraft/releases/tag/1.3.3](https://github.com/sofastack/sofa-jraft/releases/tag/1.3.3)

### 社区活动报名

![CNCF 旗舰会议](https://cdn.nlark.com/yuque/0/2020/png/226702/1594373415395-8298f123-9847-47e3-bbda-351fb9df4f9c.png)

CNCF 的旗舰会议聚集了全球领先开源社区和云原生社区的使用者和技术大咖参加线上峰会。相约 2020 年 7 月 30 日 - 8 月 1 日三天的线上峰会，共同探讨云原生计算的未来和方向。蚂蚁集团也受邀进行两个云原生主题分享。

**分享主题**：在大规模 Kubernetes 集群上实现高 SLO 的方法

- **分享嘉宾：**霜林 蚂蚁集团技术专家、散樗 蚂蚁集团高级开发工程师
- **议题介绍：**随着 Kubernetes 集群的规模和复杂性的增加，集群越来越难以提供高成功率和低延迟的合格 pod。在本次演讲中，蚂蚁集团的工程师将分享他们在设计 SLO架构和实现高服务水平目标的方法的经验。他们将引入适当的指标，首先衡量 Kubernetes 集群是否健康。然后，他们将解释如何设计和实现跟踪和分析平台，以收集有效的度量和计算这些指标。有了跟踪分析平台，pod 提供过程中出现的问题可以很容易的被诊断出来。最后，他们将展示如何沉淀人工体验到自我修复系统，以自动修复已知的问题。
- **分享时间：**2020-07-30 20:10-20:40
- **报名方式**：点击“[这里](https://cnosvschina20cn.sched.com/event/cpCR/nanomao-kuberneteszhong-shi-jiong-pan-slozha-kang-fanrejingghua-yaodaelskuang-yan-shu)”，即可报名


**分享主题**：为 Kubernetes 的秘密披上无形的盾牌

- **分享嘉宾**：柯粟 蚂蚁集团高级开发工程师
- **议题介绍**：K8s 的秘密广泛应用于生产中，用于对敏感信息进行存储管理。与 KMS 的集成，甚至与基于硬件的插件，确实增强了保护，但还远远不够，特别是对于财务级的安全需求。由于缺乏端到端的秘密加固解决方案，攻击面在很大程度上在 K8s 集群中其他关键元素/流的威胁中仍然不受保护。通过聚合可信执行环境（TEE）和增强的身份验证，本讲座探索在使用、静止和传输中保护 K8s 秘密的答案。对 kubectl、K8S主节点和节点进行了更改，以保证可用性和机密性。TEE 对开发人员和用户的透明性将通过一个演示进行阐述和演示。最后，将分享在蚂蚁集团的实践经验和 KEP 给社区。
- **分享时间**：2020-07-31 20:10-20:40
- **报名方式**：点击“[这里](https://cnosvschina20cn.sched.com/event/cpDh/kuberneteszha-ji-zha-gou-wu-kailun-qindaelskuang-yan-shu)”，即可报名
