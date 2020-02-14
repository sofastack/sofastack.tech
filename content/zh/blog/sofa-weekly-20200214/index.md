---
title: "SOFA Weekly | 2/13直播回顾、3/12直播预告、SOFATracer 发版"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "【02/10-02/14】| 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2020-02-14T16:00:00+08:00
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

**1、@乘疯破浪** 提问：

> 咨询一个性能问题，一个 2C 的业务场景：本地库操作多次 db，再调用分布式服务，再 TC 端注册多个分支事务耗时较多，用户 C 端等待时间较长，这种问题有处理方案吗？client 已设置 report 分支状态 =false。

A：确实比较长，个人建议从架构入手去改良，可以通过存入 redis 等一个消息，告诉用户正在插入->然后一步出力业务，出现异常同样 redis 里的信息改为异常。如果成功就为成功存储 id 或者其它看业务具体情况,然后用户端页面做个倒计时，或者转圈圈，或者直接告诉他正在插入稍等。比如以前用 MQ 削峰就差不多是这个思路吧。长事务尝试用用 Saga、AT 上手快，但是因为锁的存在，效率比较低，后续会逐步优化，性能高入侵也高的 TCC 如果能尝试也可以试试。

**2、@孟昊** 提问：

> 请问一下，我今天看了一下文档，好像 cloud 通过 feign 调用方式只能使用 AT 模式, 在并发量比较高的场景下会有问题么(小事务)。

A：微服务框架跟分布式事务模式没有绑定，还可以用 TCC、Saga。Saga 目前理论上支持所有 RPC 框架，只要是个 bean 即可。

**3、@小孟** 提问：

> MOSN 是否支持了 Dubbo 协议？

A：MOSN 在本周已通过 x-protocol 支持了 Dubbo 和 Tars 协议，具体可见：
[https://github.com/mosn/mosn/pull/950](https://github.com/mosn/mosn/pull/950)

**4、关于线上直播 SOFAChannel#11：从一个例子开始体验轻量级类隔离容器 SOFAArk 提问回答**

直播视频回顾：[https://tech.antfin.com/community/live/1096](https://tech.antfin.com/community/live/1096)

**@鸿关** 提问：

> 用 SOFAArk 的话，能直接集成到 SOFABoot 工程不？还是说必须要建个 SOFAArk 的工程？SOFAArk 可以运用于非 SOFABoot 的项目么？

A： 能直接继承到 SOFABoot 工程，不需要新建 SOFAArk 工程，也可以用于非 SOFABoot 工程，只要是 Spring Boot 工程即可，但是不引入 SOFA 相关依赖的话，@SofaService 及 @SofaReference 等注解就没法用了。

**@盲僧** 提问：

> 运行期间安装 biz，然后激活模块这一过程做了哪些事情 ，如果这个 biz jar 包放在远程仓库怎么加载里面的代码呢？是拉下来放到本地的一个磁盘用 classloader 去加载使用吗？

A：安装和激活是的两个操作，安装支持两种协议获取 biz 包：http 和 file，激活只是在内部调整了同 biz 不同版本的状态。

> 运行期间安装 biz 后，那个 execute jar 包里会有这个 biz 包吗？
A：可以尝试用插件打个包出来解压看下哦。

**@曾鹏** 提问：

> SOFAArk 有什么实际的应用场景吗？
> 
A：可以看下这个：[蚂蚁金服轻量级类隔离框架概述 | SOFAArk 源码解析](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247485740&idx=1&sn=2a4c3a87ad6721493a9d9deb6bc92a14&chksm=faa0e6f6cdd76fe0f3166199b30576b2078e367b8aaeb12a2a0d5419e141790c8a27f6307b4e&scene=21)

SOFAArk：[https://github.com/sofastack/sofa-ark](https://github.com/sofastack/sofa-ark)

### 本周推荐阅读

- [SOFAStack Community | 欢迎加入](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247485851&idx=1&sn=da03b7e342e6406e042d581bd384a691&chksm=faa0e641cdd76f57d3b7fcf381bb3503528d6cae537c58a36f5d59dd02b3af46964883822621&scene=21)
- [蚂蚁金服研发框架总览 | SOFABoot 框架剖析](/blog/sofa-boot-overview/)

### SOFA 项目进展

**本周发布详情如下：**

**1、发布 SOFATracer v2.4.5/3.0.9 版本，主要变更如下：**

i. 默认禁用上报数据到zipkin, 需要显式设置 com.alipay.sofa.tracer.zipkin.enabled=true 才能开启；
详细发布报告：
[https://github.com/sofastack/sofa-tracer/releases/tag/v2.4.5](https://github.com/sofastack/sofa-tracer/releases/tag/v2.4.5)
[https://github.com/sofastack/sofa-tracer/releases/tag/v3.0.9](https://github.com/sofastack/sofa-tracer/releases/tag/v3.0.9)

**2、发布 SOFATracer v2.4.6v/v3.0.10 版本，主要变更如下：**

i. 支持使用 JVM系统属性 或 环境变量 SOFA_TRACER_LOGGING_PATH 来定制 tracelog 的路径
详细发布报告：
[https://github.com/sofastack/sofa-tracer/releases/tag/v2.4.6](https://github.com/sofastack/sofa-tracer/releases/tag/v2.4.6)
[https://github.com/sofastack/sofa-tracer/releases/tag/v3.0.10](https://github.com/sofastack/sofa-tracer/releases/tag/v3.0.10)

### 社区直播预告

![detail banner12.jpg](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1581670095015-cc3cc59c-6f09-43fb-87c2-ce115f0c22a6.jpeg)

本期为 SOFAChannel 线上直播第 12 期，将邀请蚂蚁金服分布式事务核心开发仁空分享《蚂蚁金服分布式事务实践解析》。

软件开发模式从原来的单应用，到现在的微服务、分布式架构，一个大型分布式系统内，单业务链路往往需要编排多个不同的微服务，如何实现分布式场景下业务一致性，是摆在软件工程师面前的一个技术难题。

本期分享将介绍蚂蚁金服内部的分布式事务实践，包括 TCC（Try-Confirm-Cancel） 模式以及 FMT （Framework-Managerment-Transaction，框架管理事务）模式。同时也会与大家分享在面对双十一大促这种世界级的流量洪峰前，我们又是如何应对这个挑战。

**主题**：SOFAChannel#12：蚂蚁金服分布式事务实践解析

**时间**：2020年3月12日（周四）19:00-20:00

**嘉宾**：仁空，蚂蚁金服分布式事务核心开发

**形式**：线上直播

**报名方式**：点击“[这里](https://tech.antfin.com/community/live/1119)”，即可报名
