---
title: "SOFA Weekly | MOSN 直播预告、SOFAArk&SOFATracer 解析文章合集"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "【03/16-03/20】 | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2020-03-20T16:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563524226806-e93607a3-1b77-4ca2-8c3c-0384ab966154.png"
---

**SOFA WEEKLY | 每周精选，筛选每周精华问答**

**同步开源进展，欢迎留言互动**

![weekly.jpg](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1562925824761-fc720f21-9622-437b-a783-0b0729eda119.jpeg)

SOFAStack（Scalable Open Financial Architecture Stack）是蚂蚁金服自主研发的金融级分布式架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。
**SOFAStack 官网: **[https://www.sofastack.tech](https://www.sofastack.tech/)
**SOFAStack: **[https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动
我们会筛选重点问题通过 " SOFA WEEKLY " 的形式回复

**1、@木易** 提问：

> 请问，这个并发隔离是怎么做到的？二阶段是一阶段的最后去做的对吧，在 TCC 模式下的，RPC 调用二阶段失败了或者 MQ 异步调二阶段失败了，那二阶段失败了可咋整？
> ![image.png](https://cdn.nlark.com/yuque/0/2020/png/226702/1584687532635-a656a195-885e-46ee-ae5f-3df8975eb931.png)

A：一阶段如果都成功了，说明所有分支的事务的“资源”已经预留成功了，这时候的失败都是“技术上”的失败比如网络抖动，这时会要重试提交。举个例子，如果二阶段一部份服务 commit 成功了，然后有一个失败了，这时只能重试提交，不能回滚，因为那些二阶段已经成功的服务，不能回滚了。

> 是不是一阶段的发起方还得根据业务编号记录一条 response，然后参与方定时去扫状态未更新的记录，然后根据业务编号去查 response 中的状态再更新自己的状态？

A：业务流水是肯定要记的。

> 有行锁可用余额肯定没问题，就是这个预扣冻结字段如果放这行数据里，一阶段一释放锁，另一个事务给他改了就不对了，所以我感觉表里加这个字段不行啊，还是得用业务流水加这个预扣字段形成一条记录，这样事务之间的这个才是隔离的 。

A：是的，是在业务上还要记录一条流水，一来为是业务上的要求，二来可以做幂等和防悬挂控制，三也是在回滚的时候需要这条流水才知道要回滚多少金额。

相关阅读：[蚂蚁金服分布式事务实践解析 | SOFAChannel#12 直播整理](/blog/sofa-channel-12-retrospect/)

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

**2、@邓从宝** 提问：

> 您好，合并部署是个什么概念？什么时候会用到合并部署？

A： 就是将原本独立开发的应用部署在一起，比如资源有限要高密度部署的时候，比如两个微服务应用频繁 rpc 交互想要部署到一个进程里提高性能的时候。

**3、@苏东东** 提问：

> SOFAJRaft 能不能不通过 rpcserver 注册 GetValueRequestProcessor，我想用自己的 RPC 框架。

A：暂时不能，请关注这个 pr 合并以后就可以了
[https://github.com/sofastack/sofa-jraft/pull/402](https://github.com/sofastack/sofa-jraft/pull/402)
详细 issue：
[https://github.com/sofastack/sofa-jraft/issues/268](https://github.com/sofastack/sofa-jraft/issues/268)
SOFAJRaft：[https://github.com/sofastack/sofa-jraft](https://github.com/sofastack/sofa-jraft)

### SOFAArk 解析文章集合

- [蚂蚁金服轻量级类隔离框架 Maven 打包插件解析 | SOFAArk 源码解析](/blog/sofa-ark-maven-packaging-plugins/)
- [蚂蚁金服轻量级类隔离框架概述 | SOFAArk 源码解析](/blog/sofa-ark-overview/)
- [从一个例子开始体验轻量级类隔离容器 SOFAArk | SOFAChannel#11 直播整理](/blog/sofa-channel-11-retrospect/)

### SOFATracer 解析文章集合

- [蚂蚁金服分布式链路跟踪组件 SOFATracer 中 Disruptor 实践（含源码）](/blog/sofa-trcaer-disruptor-practice/)
- [蚂蚁金服开源分布式链路跟踪组件 SOFATracer 埋点机制剖析](/blog/sofa-tracer-event-tracing-deep-dive/)
- [蚂蚁金服开源分布式链路跟踪组件 SOFATracer 采样策略和源码剖析](/blog/sofa-tracer-sampling-tracking-deep-dive/)
- [蚂蚁金服开源分布式链路跟踪组件 SOFATracer 链路透传原理与SLF4J MDC 的扩展能力剖析](/blog/sofa-tracer-unvarnished-transmission-slf4j-mdc/)
- [蚂蚁金服分布式链路跟踪组件 SOFATracer 数据上报机制和源码剖析](/blog/sofa-tracer-response-mechanism/)
- [蚂蚁金服分布式链路跟踪组件 SOFATracer 总览|剖析](/blog/sofa-tracer-overview/)

### 社区直播报名

![detail banner13#13.jpg](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1584084552217-83f5c143-d1b1-4d5c-ac65-08e0156af21f.jpeg)

作为云原生网络代理，Service Mesh 是 MOSN 的重要应用场景。随着 Service Mesh 概念的日益推广，大家对这套体系都已经不再陌生，有了较为深入的认知。但是与理论传播相对应的是，生产级别的大规模落地实践案例却并不多见。这其中有多方面的原因，包括社区方案饱受诟病的“大规模场景性能问题”、“配套的运维监控基础设施演进速度跟不上”、“存量服务化体系的兼容方案”等等。

现实场景中，大部分国内厂商都有一套自研 RPC 的服务化体系，属于「存量服务化体系的兼容方案」中的协议适配问题。为此，MOSN 设计了一套多协议框架，用于降低自研体系的协议适配及接入成本，加速 Service Mesh 的落地普及。SOFAChannel#13，将向大家介绍 MOSN 实现多协议低成本接入的设计思路以及相应的快速接入实践案例。

- 主题：SOFAChannel#13：云原生网络代理 MOSN 的多协议机制解析
- 时间：2020年3月26日（周四）19:00-20:00
- 嘉宾：无钩，蚂蚁金服技术专家、MOSN Committer
- 形式：线上直播
- 报名方式：点击“[这里](https://tech.antfin.com/community/live/1131)”，即可报名

欢迎参与投票 MOSN Logo 社区投票，在本期直播结束将公布投票结果，确定最新 Logo。

- 投票方式：回复 [issue](https://github.com/mosn/community/issues/2) 你喜欢的方案编号以及原因
