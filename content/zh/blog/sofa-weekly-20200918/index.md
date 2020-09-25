---
title: "SOFAWeekly｜MOSN 支持 Istio、SOFAJRaft 发布、本周日您有一条待办日程"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2020-09-18T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563524226806-e93607a3-1b77-4ca2-8c3c-0384ab966154.png"
---

**SOFA WEEKLY | 每周精选，筛选每周精华问答**

**同步开源进展，欢迎留言互动**

![weekly.jpg](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1562925824761-fc720f21-9622-437b-a783-0b0729eda119.jpeg)

**SOFA**Stack（**S**calable **O**pen **F**inancial **A**rchitecture Stack）是蚂蚁集团自主研发的金融级分布式架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

- **SOFAStack 官网：**[https://www.sofastack.tech](https://www.sofastack.tech/)
- **SOFAStack：**[https://github.com/sofastack](https://github.com/sofastack)

### 社区大事件

**MOSN 支持 Istio 啦**～详见链接：

- 英文版：《[Using MOSN with Istio: an alternative data plane](https://istio.io/latest/blog/2020/mosn-proxy/)》
- 中文版：《[在 Istio 中使用 MOSN：另一个数据平面](https://istio.io/latest/zh/blog/2020/mosn-proxy/)》

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动
我们会筛选重点问题通过 " SOFA WEEKLY " 的形式回复

**1、@梓郁** 提问：

> 我最近刚刚接触分布式链路监控，看了 SOFATracer 的 slf4j 的 demo。现在有一个问题。就是我想在日志里面打印出 span 的 parentid，但是我不想在我自己的代码里面显性地用 MDC 添加，有什么其他方法吗？（我现在是打算在 MDCSpanExtension 里面用 mdc.put 添加;再重新打包添加依赖这样可行吗？）

A：自己扩展下这个接口 SpanExtension。

SOFATracer：[https://github.com/sofastack/sofa-tracer](https://github.com/sofastack/sofa-tracer)

**2、@石评** 提问：

> 我有个关于 Seata 的疑问：A -> B->C 的时候，不管 B 有没有本地事务，如果 C 失败了 B 的都会回滚，那么 B 的本地事务的作用是什么呢？

A：分布式事务认为由若干个分支事务（本地事务）构成的，如果加了 autocommit=false，那么 B 服务的几条 sql构成一个本地事务，如果不加那么每条 DML 语句都是一个本地事务。本地事务越少那么与 TC 的交互次数越少。

**3、@徐成阳** 提问：

> Seata 的 TCC 强一致的嘛？

A：AT、XA、TCC 应该都属于强一致性。 SAGA 无法保证事务隔离性，在部分情况下可能会存在无法回滚，而选择向前继续重试来保证事务最终一致性。 四种模式都是属于最终一致性。SAGA 性能更高，因为没有二阶段提交，而且分支数据都是保存在本地的。

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

### 本周推荐阅读

- [来了！2020 云栖大会 蚂蚁金融科技产品能力再升级](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247486989&idx=1&sn=185daf3cc79c8f42d53e3829fd473a66&chksm=faa0e1d7cdd768c153c345e97dd6d2ec34a579ca3914a28da467c9ae0d4a556a9463f23bf42c&scene=21)
- [企业数字化转型指南，《SOFAStack 解决方案白皮书》正式发布](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247486979&idx=1&sn=124e91279ebab25b6689cbfb47cb36ec&chksm=faa0e1d9cdd768cff25674daea1209904cfd956cad605e679ee6ffa212b7c8713cb30d83513a&scene=21)

### SOFA 项目进展

**本周发布详情如下：**

**发布 SOFAJRaft v1.3.4.bugfix_2 版本，主要变更如下：**

- 修复使用 grpc 时，在一定情况下无法自动重连的问题；

详细发布报告：
[https://github.com/sofastack/sofa-jraft/releases/tag/1.3.4.bugfix_2](https://github.com/sofastack/sofa-jraft/releases/tag/1.3.4.bugfix_2)

### 社区活动预告

这里有一个您的专属日程提醒，请查收：

![OBDev Meetup#1](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1599815543398-70aac1d7-69a2-4007-8016-78f942b25a08.jpeg)

**日程主题**：**OceanBaseDev Meetup#1 上海站「深入分布式数据库：事务·高可用·云原生」**

**出品人：**
- 杨传辉（花名：日照）蚂蚁集团研究员、OceanBase 总架构师
- 韩富晟（花名：颜然）蚂蚁集团资深技术专家、OceanBase 事务研发负责人

**日程时间：2020-09-20 本周日** 13:00-17:30

**日程地点：**上海市杨浦区政学路77号 InnoSpace+

**日程详情：**点击“[这里](https://www.huodongxing.com/event/5562442480600)”，了解日程详情
