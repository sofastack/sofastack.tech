---
title: "SOFA Weekly | 明日活动信息、社区方案上线、落地系列阅读"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2019-12-27T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563524226806-e93607a3-1b77-4ca2-8c3c-0384ab966154.png"
---

**SOFA WEEKLY | 每周精选，筛选每周精华问答**

**同步开源进展，欢迎留言互动**

![weekly.jpg](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1562925824761-fc720f21-9622-437b-a783-0b0729eda119.jpeg)

SOFAStack（Scalable Open Financial Architecture Stack）是蚂蚁金服自主研发的金融级分布式架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

**SOFAStack 官网: **[https://www.sofastack.tech](https://www.sofastack.tech/)

**SOFAStack: **[https://github.com/sofastack](https://github.com/sofastack)

### 社区 Big News

SOFAStack 社区上线了 SOFA Community 试运行方案，欢迎社区内更多的同学参与我们，加入共建❤

社区随时都欢迎各种贡献，无论是**简单的错别字修正**、**bug 修复**还是**增加新功能**，欢迎提 issue 或 pull request 至 Github 社区。

SOFA Community 期待你的加入：[https://www.sofastack.tech/community/](/community/)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动
我们会筛选重点问题通过 " SOFA WEEKLY " 的形式回复

**1、@包和平 **提问：

> 请问 Seata Saga 状态机可以跨服务来配置吗？案例中的 springcloud-eureka-feign-mybatis-seata 这个和我们的情况类似。这个默认的不是 AT 模式吗？我想使用 Saga 的状态机来配置整个流程，这个情况就涉及了三个服务 storage   order  account，我看 demo 中都是在单个服务中配置的状态机，所以想询问一下怎么配置。
> ![image.png](https://cdn.nlark.com/yuque/0/2019/png/226702/1577429204441-8a4c9aa6-ddf8-40e1-88d1-0f23077af4f9.png)

A：可以跨服务调用，而且服务用不同的 RPC 框架也是可以的，Saga 的事例在 seata-sample 仓库有，Seata 仓库的 test 模块也有很多事例。文档地址：[http://seata.io/zh-cn/docs/user/saga.html](http://seata.io/zh-cn/docs/user/saga.html)

> 有 Saga 模式的 spring feign 方式的配置 demo 吗？

A：没有，不过 Seata Saga 只需要是一个 bean 就可以调用，理论上和什么 RPC 框架无关。

> A 服务的状态机 a_state.json 设置的子状态机是在 B 服务上配置的 b_state.json，可以这样设置吗？

A：A 服务如果是通过状态机实现的，例如 a_state.json，这个状态机可以调用 B 服务，B 服务也可以是状态机实现的，例如 b_state.json，这两个状态机都不是子状态机，而 a_state.json 其实只知道调到了一个服务，而它内部是什么实现的它不知道。子状态机是要再同一个应用内，才可以被其它状态机调用，跨了应用，则认为只是一个服务。

> Seata 还支持其他方式实现 Saga？ 我看好像都是状态机呢，是我遗漏了哪里吗?

A：目前是只有状态机。未来会有通过注解+拦截器实现。我所说的“A 服务如果是通过状态机实现的”，服务的实现是可以任何方式的，不是 Saga 的实现。实现一个服务，自己编码也能实现，和框架无关。

> 这个意思其实只是在 A 中调用了 feignClient 是这个意思吧?

A：是的。

**2、@李宇博** 提问：

> Saga 状态机设计器很多属性和文档不太一样呢。

A：没有和文档不一致的属性吧。你看到的设计器生成的 json，是因为它带了布局信息，它的 stateProps 是和文档是一致的，其它属性是设计器生成的，不需要关心。

> 我没有找到 startState 属性，然后我以为要自己写 next 属性，好像是连线解决了这个问题，还有一点不太明白，就是一个事务只用设计一个 compensationTrigger么？

A：是的，是用 Start 后面的连线解决，所以不需要 startState 属性了。 compensationTrigger 可以有任意多个，看怎么画好看就行。

> start、success、fail、choice 节点都省去了配置么？还有 compensationtrigger。

A： Start 里有配置状态机的名称，描述，版本什么的、fail 里可以配置错误码和错误信息，succed 和 choice 应该只有一个名称，没其他的了。

> 嗯嗯，compensationTrigger 是不是也不用配置了?

A：不用，也是 id 不重就行。

**3、@赵润泽** 提问：

> TCC 模式下的事务发起者和 AT 模式下的事务发起者，被代理后执行的操作是一样的吗？

A：TccActionInterceptor 拦截的是 TwoPhaseBusinessAction 注解也就是拦截的是分支事务，在之前 TM 已经做了 begin，这个是通过 GlobalTransactional 的 intercept 开启的。

> TCC 事务的开启和 AT 事务的开启流程是一样的吗，毕竟都是一个注解？

A： 是一样的，都是发起方加 GlobalTransactional 注解，对于 TCC 分支来说都要额外加一个 TwoPhaseBusinessAction 注解。

### 本周推荐阅读

- [将 Sidecar 容器带入新的阶段 | KubeCon NA 2019](/blog/sidacar-kubecon-na2019/)

### Mesh 化落地实践特辑阅读

- [蚂蚁金服 Service Mesh 大规模落地系列 - 控制面篇](/blog/service-mesh-practice-in-production-at-ant-financial-part7-control-plane/)
- [蚂蚁金服 Service Mesh 大规模落地系列 - Operator 篇](/blog/service-mesh-practice-in-production-at-ant-financial-part6-operator/)
- [蚂蚁金服 Service Mesh 大规模落地系列 - 网关篇](/blog/service-mesh-practice-in-production-at-ant-financial-part5-gateway/)
- [蚂蚁金服 Service Mesh 大规模落地系列 - RPC 篇](/blog/service-mesh-practice-in-production-at-ant-financial-part4-rpc/)
- [蚂蚁金服 Service Mesh 大规模落地系列 - 运维篇](/blog/service-mesh-practice-in-production-at-ant-financial-part3-operation/)
- [蚂蚁金服 Service Mesh 大规模落地系列 - 消息篇](/blog/service-mesh-practice-in-production-at-ant-financial-part2-mesh/)
- [蚂蚁金服 Service Mesh 大规模落地系列 - 核心篇](/blog/service-mesh-practice-in-production-at-ant-financial-part1-core/)
- [Service Mesh 落地负责人亲述：蚂蚁金服双十一四大考题](/blog/service-mesh-practice-antfinal-shopping-festival-big-exam/)

### 社区活动预告

![image.png](https://cdn.nlark.com/yuque/0/2019/png/226702/1576469907431-7bfc401e-fe31-46a7-9c90-391e8aace845.png)

就在明天，Service Mesh Meetup 第9期杭州站，本期与滴滴联合举办，将深入 Service Mesh 的落地实践，并带领大家探索 Service Mesh 在更广阔领域的应用，现场还有机会获得 **Istio 官方 T 恤** 以及 **相关技术书籍**。明天，不见不散~

**主题**：Service Mesh Meetup#9 杭州站：To Infinity and Beyond

**时间**：2019年12月28日（明天）13:00-17:30

**地点**：杭州西湖区紫霞路西溪谷G座8楼

**报名方式**：点击“[这里](https://tech.antfin.com/community/activities/1056)”，即可报名
