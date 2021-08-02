---
title: "SOFA Weekly | Layotto、SOFABoot 发布新版本、QA 整理"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly | Layotto、SOFABoot 发布新版本、QA 整理"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2021-07-30T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ"
---

SOFA WEEKLY | 每周精选，筛选每周精华问答

同步开源进展，欢迎留言互动

![weekly.jpg](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ)

SOFAStack（Scalable Open Financial Architecture Stack）是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

SOFAStack 官网: [https://www.sofastack.tech](https://www.sofastack.tech/)

SOFAStack: [https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动

我们会筛选重点问题

通过 " SOFA WEEKLY " 的形式回复

1、@张鹏 提问：

>比如我在新模块中添加 Service 实现，宿主应用没有调用相关的 Service 啊，我其实想实现代码的热部署通过 SOFAArk 可以？

A：可以动态部署的（所有的 bean 会刷新，服务会发布），跟宿主应用有没有调用没有关系的。

SOFAArk：[https://github.com/sofastack/sofa-ark](https://github.com/sofastack/sofa-ark)

2、@周永平 提问：

>我想请教下，SOFABoot 如果使用 Spring 的 event，跨模块会被通知到吗？

A：默认情况下，Spring 事件只在本模块中，不会传递的。

SOFABoot：[https://github.com/sofastack/sofa-boot](https://github.com/sofastack/sofa-boot)

3、@孙力 提问：

>蚂蚁内部与 MOSN 对应的应该是有统一的控制面吗？其中熔断限流组件是使用的 sentinel 吗？控制面与 MOSN 中的 sentinel-client 对接更新限流规则，使用的 sentienl 的 dynamic-rule，还是 xds 下发的？

A：我们内部是有统一的控制面的，我们的限流熔断算法是基于 sentinel 去扩展实现的，底层的限流框架是基于 sentinel 的，更新规则时我们用的是我们内部的一套配置管理中间件。

MOSN：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

4、@孟晓冬 提问：

>目前的问题是，Dubbo 应用在注入 MOSN 时，MOSN 启动时，要么报权限问题，要么报各种 not support，想请教一下是什么原因？

A：你用的 1.7.x 的 Istio 的话，那要用对应分支的 MOSN 版本镜像。

MOSN：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

### 本周发布

**本周 Layotto 发布了 v0.1.0**

**这是 Layotto 的第一次发布，包含功能：**

1. 支持 configuration API

2. 支持 pubsub API

3. 支持 state API

4. 支持 distributed lock API

5. 支持 sequencer API

6. 支持 rpc API

7. 支持通过 4 层或者 7 层进行流量治理（例如 dump 流量,限流等功能)

8. 支持 Actuator API，用于健康检查和运行时元数据查询

9. 支持集成 Istio

10. 支持基于 WASM 进行多语言编程

11. Go sdk

感谢各位贡献者这段时间的付出！

**详细参考：**[https://github.com/mosn/layotto/](https://github.com/mosn/layotto/)

**文章解读：**
[https://mosn.io/layotto/#/zh/blog/mosn-subproject-layotto-opening-a-new-chapter-in-service-grid-application-runtime/index](https://mosn.io/layotto/#/zh/blog/mosn-subproject-layotto-opening-a-new-chapter-in-service-grid-application-runtime/index)

**本周 SOFABoot 发布了 3.8.0 版本。主要更新如下：**

1. 支持 JDK11

2. 添加 proxyBeanMethods=false 字段在 @Configuration 类上

3. 调整 SOFARPC 注解的超时优先级

4. 修复 Ark 环境处理注解时抛出 TypeNotPresentExceptionProxy 异常的问题

**详细参考：**
https://github.com/sofastack/sofa-boot

### 本周推荐阅读

- [蚂蚁集团万级规模 k8s 集群 etcd 高可用建设之路](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247491409&idx=1&sn=d6c0722d55b772aedb6ed8e34979981d&chksm=faa0f08bcdd7799dabdb3b934e5068ff4e171cffb83621dc08b7c8ad768b8a5f2d8668a4f57e&scene=21)

- [我们做出了一个分布式注册中心](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247491198&idx=1&sn=a4607e6a8492e8749f31022ea9e22b80&chksm=faa0f1a4cdd778b214403e36fb4322f91f3d1ac47361bf752c596709f8453b8482f582fe7e2e&scene=21)

- [还在为多集群管理烦恼吗？OCM来啦！](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247490574&idx=1&sn=791b8d49759131ea1feb5393e1b51e7c&chksm=faa0f3d4cdd77ac2316b179a24b7c3ac90a08d3768379795d97c18b14a9c69e4b82012c3c097&token=1804015466)

- [MOSN 子项目 Layotto：开启服务网格+应用运行时新篇章](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247488835&idx=1&sn=d645b9abc866048e679b56bfe3b72482&chksm=faa0fa99cdd7738ff1749ae75b1670f953c92b70dcf0358337977438fd74b632b21a7b17ece3&scene=21)

更多文章请扫码关注“金融级分布式架构”公众号

>![](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*5aK0RYuH9vgAAAAAAAAAAAAAARQnAQ)
