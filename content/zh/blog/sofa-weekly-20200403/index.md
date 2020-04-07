---
title: "SOFA Weekly | MOSN 直播预告 & 发布更新、Service Mesh 落地实践解析合辑"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "【03/30-04/03】| 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2020-04-03T18:00:00+08:00
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

**1、@王磊** 提问：

> SOFARPC 注册的 Dubbo 服务和通过 Dubbo 组件注册的服务可以互通的吧？

A：可以的， Dubbo 是桥接模式。

> 这个怎么配置的。现在注册的 Dubbo 服务 generic=false。
> ![问题截图](https://cdn.nlark.com/yuque/0/2020/png/226702/1585901791598-78311a98-31cb-4508-b201-63e882f6be37.png)

A：现在只支持泛化调用不支持泛化服务，可以关注一下这个 Issue，后期会排期做，也欢迎共建。
[https://github.com/sofastack/sofa-rpc/issues/894](https://github.com/sofastack/sofa-rpc/issues/894)

SOFARPC：[https://github.com/sofastack/sofa-rpc](https://github.com/sofastack/sofa-rpc)

**2、@黄振祥** 提问：

> 使用 SOFAStack 快速构建微服务的 Demo 时遇到的一些问题，可以怎么解决呢？
> [https://github.com/sofastack-guides/kc-sofastack-demo](https://github.com/sofastack-guides/kc-sofastack-demo)

A：可以详细看一下这个 issue：
[https://github.com/sofastack-guides/kc-sofastack-demo/issues/9](https://github.com/sofastack-guides/kc-sofastack-demo/issues/9)

**3、@哈哈哈** 提问：

> > AT 和 Saga 有什么区别吗，AT 我感觉是自动的 Saga。

A：也可以这么说，Saga 框架上没有加锁，AT 有加锁，事实上 Seata Saga 是一个具备“服务编排”和“Saga 分布式事务”能力的产品。

**4、@全 **提问：

> 麻烦问一下，Seata TCC 只支持 Dubbo、SOFARPC 吗？

A：还有 local，其他的 rpc 框架可以基于 local 包装一下或者扩展下 parser，也欢迎大家贡献。

> 如果通过 spring-cloud 整合的话需要扩展这个 Parser 是吧？

A：是的，但是像 resttemplate 这种 rest 请求没办法走 parser，需要你 local 包一下。
Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

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

**本周发布详情如下：**

**发布 SOFA MOSN v0.11.0 版本，主要变更如下：**

- 重构 XProtocol Engine，优化了协议层的实现；
- 支持 Listener Filter 的扩展，基于 Listener Filter 重新实现了透明劫持能力；
- 优化了 LDS 接口，修改了路由配置结构，完善了变量机制；
- 完善了 TraceLog 的实现；
- Bug Fix；

详细发布报告：
[https://github.com/sofastack/sofa-mosn/releases/tag/v0.11.0](https://github.com/sofastack/sofa-mosn/releases/tag/v0.11.0)

### 社区直播报名

![SOFAChannel#14](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1585293414983-ef3d97ea-460c-42b4-894a-a3cc6b72d6cd.jpeg)

MOSN 是一款使用 Go 语言开发的网络代理软件，由蚂蚁金服开源并经过几十万容器的生产级验证。

MOSN 作为云原生的网络数据平面，旨在为服务提供多协议，模块化，智能化，安全的代理能力。在实际的生产使用场景中，通用的网络代理总会与实际业务定制需求存在差异，MOSN 提供了一系列可编程的扩展机制，就是为了解决这种场景。

本次分享将向大家介绍 MOSN 的扩展机制解析以及一些扩展实践的案例。

本期直播包含 Demo，可以先下载 Demo，提前体验 MOSN 拓展机制的使用（报名页面有详细 Demo 链接）。

- 主题：SOFAChannel#14：云原生网络代理 MOSN 的扩展机制解析
- 时间：2020年4月9日（下周四）19:00-20:00
- 嘉宾：永鹏 蚂蚁金服高级开发工程师、MOSN Committer
- 形式：线上直播
- 报名方式：点击“[这里](https://tech.antfin.com/community/live/1152)”，即可报名
