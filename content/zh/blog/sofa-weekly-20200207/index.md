---
title: "SOFA Weekly | Service Mesh 落地系列文章、2/13直播预告"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "【02/03 - 02/07】 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2020-02-07T17:00:00+08:00
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

**@张一心 **提问：

> 建议 Seata 全局加锁时候支持快速抢占机制，在不同重要程度事务处理中优先满足重要业务的加锁处理以优先保证紧急重要逻辑的处理，实现方式有多种的，可以根据情况直接回滚干掉非紧急事务也可以在等待加锁队列中做插队处理。

A：不是通用场景，这个不是通过 API 来实现，后续添加控制台后，在控制台页面对活动事务可以进行控制，可单个事务降级或 redo。

> 之前我是通过改造其值来源于 Nacos 配置的全局事务注解完成的，有了单独事务控制台能起到各司其职更好，既然后续补充了控制台，是不是事务处理的各类统计也能在控制台上面看得到，作为一系列资源分配的参考指标。

A：控制台主要包括监控统计和事务控制介入，你说的应该是动态降级，这个是全局的，细化不到刚才说的那种抢占机制比如手动在控制台的具体某个事务进行降级释放锁，直接通过 API 这个数据破坏性无法控制，对于这种需要人工去介入并且有 trace。

> 实际生产中涉及金钱交易的优先级往往高于非金钱交易的优先级。破坏性来源主要是加锁中的破坏性回滚，实际业务中往往会存在不能锁刚好被加在队列中等待一阵的现象，这时候完全可以根据全局标记做全局性插队，在处理中加快相关业务处理。监控粒度不应该忽视锁的名称，全局业务的加锁顺序和持有时间，不然当业务量大且相互交叉发生全局性死锁也是会存在的。确切说是业务量大并且分布在不同 TC 上加锁情况下可能会产生哲学家就餐问题带来的死锁。

A：这里不存在死锁，先拿的是数据库的 X 锁，在拿的是全局锁，你可以举个栗子。一种优先级是处理前优先级类似于 mq 的优先级队列，这种是哪个事务优先被处理，这种是需要兼顾顺序和锁优先级排序，高优先级事务分支优先被处理。 一种是处理中的锁被剥夺，这种是破坏性的，如果在一个不重要的事务中分支1执行完成，另外一个重要事务请求分支1同样的锁，这个锁这时可被剥夺，不重要事务释放锁降级非分布式事务。大多数冲突的情况应该属于处理中而不是处理前。

> 根据测试经验，量小的时候会等，量大的时候会直接碰撞，量进一步加大则除了碰撞而且跑队列里一起挤挤的概率就会飙上去。这时候会遇到几个难点，1队列下是不是插队（这个通过认为设置比较好解决）2抢占是否必要，这时候需要通过对之前加锁的统计（包括业务处理时间与网络通信等综合指标）和潜在破坏性做评估，如果破坏性较小或无且不抢占下对业务预等待时间较长且其他回滚表较为独立则直接回滚抢占，最典型场景就是扣钱的时候充值，或者出货的时候补货。

A：第2中的破坏性来源于不重要事务锁被剥夺降级为非分布式事务，但是由于后续事务分支出现异常，会导致这个事务分支无法参与回滚，若参与回滚必会导致重要事务全局回滚时数据校验不通过而无法回滚。

> 对，校验不通过关键在于目前采用的是全量型业务，而不是基于对 sql 语句解析之后的增量型业务（即 TCC 的 cancel 步骤里反向对冲）。

A：对于 AT 模式都是基于数据的不是基于 sql 的，与 binlog 同步方式类型同理。

> 下面问题来了，数据破坏是因为先去 TC 报道还是先去数据库加锁造成的。如果先去 TC 报道，等报道成功再去 DB 加锁就不会发生数据破坏的问题，因为报道失败就直接返回了不会对 DB 造成影响。

A：那个锁的范围更大些，肯定是 DB 的 X 锁。服务是操作 DB 的，如果连 DB 锁拿不到，拿全局锁有什么意义，假设先拿全局锁，数据库锁拿不到时是不是又需要 RPC 去释放全局锁？

> 不知道有没必要添加对全局读写锁的支持，这个个人未实践过，纯属个人观点，也不知道现在是否已经实现了？

A：这个说的是类似 JUC 的读写锁嘛？如果单纯这样没什么实际意义，现在是类似数据库 select for update 的 X 锁上升到全局锁。

### Service Mesh 大规模落地系列

- [蚂蚁金服 Service Mesh 大规模落地系列 - 质量篇](/blog/service-mesh-practice-in-production-at-ant-financial-part8-quantity/)
- [蚂蚁金服 Service Mesh 大规模落地系列 - 控制面篇](/blog/service-mesh-practice-in-production-at-ant-financial-part7-control-plane/)
- [蚂蚁金服 Service Mesh 大规模落地系列 - Operator 篇](/blog/service-mesh-practice-in-production-at-ant-financial-part6-operator/)
- [蚂蚁金服 Service Mesh 大规模落地系列 - 网关篇](/blog/service-mesh-practice-in-production-at-ant-financial-part5-gateway/)
- [蚂蚁金服 Service Mesh 大规模落地系列 - RPC 篇](/blog/service-mesh-practice-in-production-at-ant-financial-part4-rpc/)
- [蚂蚁金服 Service Mesh 大规模落地系列 - 运维篇](/blog/service-mesh-practice-in-production-at-ant-financial-part3-operation/)
- [蚂蚁金服 Service Mesh 大规模落地系列 - 消息篇](/blog/service-mesh-practice-in-production-at-ant-financial-part2-mesh/)
- [蚂蚁金服 Service Mesh 大规模落地系列 - 核心篇](/blog/service-mesh-practice-in-production-at-ant-financial-part1-core/)
- [Service Mesh 落地负责人亲述：蚂蚁金服双十一四大考题](/blog/service-mesh-practice-antfinal-shopping-festival-big-exam/)

### SOFA 项目进展

本周发布详情如下：

1、发布 Occlum v0.9.0 版本，主要变更如下：

- 引入嵌入模式；
- 升级 SGX SDK 依赖到最新版；
- 大幅提升网络 I/O 的性能；
- 正式支持 Python 语言的应用；
- 正式支持 Ubuntu 18.04 和 CentOS 7.2；
- 修复了多个 bug；

详细发布报告：
[https://github.com/occlum/occlum/releases/tag/0.9.0](https://github.com/occlum/occlum/releases/tag/0.9.0)

### 社区直播预告

![SOFAChannel#11](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1579250928699-3e807134-c0df-4138-8967-a71e5eb9bcc9.jpeg)

春节后直播预告来啦～本期为 SOFAChannel 线上直播第 11 期，将从 SOFAArk 的特性出发，了解轻量级类隔离容器 SOFAArk 的主要功能，并通过一个 Demo 案例，跟讲师一起操作，实际体验 SOFAArk 具体操作以及功能实现。

SOFAArk 是一款基于 Java 实现的轻量级类隔离容器，主要提供类隔离和应用(模块)合并部署能力，由蚂蚁金服公司开源贡献。截止 2019 年底，SOFAArk 已经在蚂蚁金服内部 Serverless 场景下落地实践，并已经有数家企业在生产环境使用 SOFAArk ，包括网易云音乐、挖财、溢米教育等。

**主题**：SOFAChannel#11：从一个例子开始体验轻量级类隔离容器 SOFAArk

**时间**：2020年2月13日（周四）19:00-20:00

**嘉宾**：玄北，蚂蚁金服技术专家 SOFAArk 开源负责人

**形式**：线上直播

**报名方式**：点击“[**这里**](https://tech.antfin.com/community/live/1096)”，即可报名
