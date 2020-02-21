---
title: "SOFA Weekly | 3/12直播预告、SOFARPC、SOFABoot 组件发布"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "【02/17-02/23】| 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2020-02-21T15:00:00+08:00
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

**1、@朱楠 **提问：

> 请教下，我看文档上有说json可以热部署，有demo吗，没怎么看明白如何热部署
> ![image.png](https://cdn.nlark.com/yuque/0/2020/png/226702/1582270528773-c95ddf2a-cf84-43a1-a063-feeef533d096.png)

A：就是用这个回答里的这个方法 registerByResource，Java 代码的热部署可以用 SOFAArk，stateMachineEngine 是一个 bean，可以在代码里注入这个 bean，然后你可以实现一个 web 页面，可以上传 json 文件和 jar 包，调用图片中的方法注册状态机，用 SOFAArk 注册 jar 包。

> 我在看 registryByResources 这个方法的源码，注册状态机是不是就不需要修改本地的 json 文件了？

A：注册了 json，如果数据库里有名称相同的，它会对比字节码，如果不一样，则创建新版本，一样则不注册，新启动的状态机实例用新版本，已启动的状态机实例用老的。

> 懂了，你这里说的上传 jar 包是什么意思？

A：因为状态机里定义了要调用服务，这个服务可能是目前在系统里没有引用，所以需要上传 jar。

2、**@刘川江 **提问：

> Seata Saga 模式服务（ServiceTask）之间如何在运行时传递业务参数？如将服务A运行后的生成的业务对象传递到后续的服务中进行处理。

A：用 Output 和 Input 属性：
Input: 调用服务的输入参数列表, 是一个数组, 对应于服务方法的参数列表, $.表示使用表达式从状态机上下文中取参数，表达使用的 SpringEL, 如果是常量直接写值即可；
Ouput: 将服务返回的参数赋值到状态机上下文中, 是一个 map 结构，key 为放入到状态机上文时的 key（状态机上下文也是一个 map），value 中$.是表示 SpringEL 表达式，表示从服务的返回参数中取值，#root 表示服务的整个返回参数。

> 是否支持根据业务参数中的某些值作为条件判断状态机中的服务（ServiceTask）是否执行？

A: 支持的，可以用 Status 属性来判断 Service 是否执行成功。
Status: 服务执行状态映射，框架定义了三个状态，SU 成功、FA 失败、UN 未知, 我们需要把服务执行的状态映射成这三个状态，帮助框架判断整个事务的一致性，是一个 map 结构，key 是条件表达式，一般是取服务的返回值或抛出的异常进行判断，默认是 SpringEL 表达式判断服务返回参数，带 $Exception{ 开头表示判断异常类型。value 是当这个条件表达式成立时则将服务执行状态映射成这个值。

> 是否支持状态机中的部分服务开启事务。如状态机配置了服务流程A->B->C，只在服务B和C上开启分布式事务。

A：可以，比如 A 是一个查询类的服务，可以将 A 设置成 IsForUpdate=false，如果这个服务不想记录执行日志，可以设置这个服务为 IsPersist=false。

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

**3、@SUNBIAO **提问：

> 请问 SOFA 消费者端可以同时配置多个注册中心嘛？例如一个 web 控制器接入端当作消费者，配置连接多个注册中心，订阅不同注册中心上的生产者服务，但是这个消费者端不同的具体消费者调用不同注册中心的服务，前提是注册中心不能合成一个，现实有多个不同的注册中心。

A：可以的，可以看这个类 com.alipay.sofa.rpc.config.AbstractInterfaceConfig#registry， 是个 list。

SOFARPC：[https://github.com/sofastack/sofa-rpc](https://github.com/sofastack/sofa-rpc)

4、**@七美 **提问：

> SOFATracer 目前落盘的摘要 log 是固定格式的，能否直接以 zipkin 的 json 数据格式落盘？如果可以如何操作？

A：使用自定义 reporter ： [https://www.sofastack.tech/projects/sofa-tracer/reporter-custom/](/projects/sofa-tracer/reporter-custom/) + ZipkinV2SpanAdapter 来实现。

SOFATracer：[https://github.com/sofastack/sofa-tracer](https://github.com/sofastack/sofa-tracer)

### 每周读者问答提炼

- [蚂蚁金服研发框架日志隔离解析 | SOFABoot 框架剖析](/blog/sofa-boot-log-isolation/)
- [蚂蚁金服研发框架总览 | SOFABoot 框架剖析](/blog/sofa-boot-overview/)

### SOFA 项目进展

**本周发布详情如下：**

**1、发布 Seata v1.1.0 版本，主要变更如下：**

- 支持 postgreSQL；
- 支持自定义 Saga 恢复策略超时时间；
- 支持 Saga 模式跳过成功分支事务的 report；
- 支持httpClient 自动集成；

详情发布报告：[https://seata.io/zh-cn/blog/download.html](https://seata.io/zh-cn/blog/download.html)

**2、发布 SOFARPC v5.6.4 版本，主要变更如下：**

- 试验性支持 RPC 可能的多版本发布；
- 升级 Dubbo 依赖版本到2.6.7；
- 优化 gRPC 支持代码；
- 升级 Netty 版本4.1.44.final，解决安全问题；
- 修复 Tracer 采样兼容问题；
- 修复注册中心虚拟端口的问题；

详细发布报告：[https://github.com/sofastack/sofa-rpc/releases/tag/v5.6.4](https://github.com/sofastack/sofa-rpc/releases/tag/v5.6.4)

**3、发布 SOFABoot v3.3.0 版本，主要变更如下：**

- 健康检查页面显示组件的具体绑定类型；
- RPC XML 超时配置支持字符串变量；
- 修复无法使用 zk 以外注册中心的 bug；
- 修复控制台大量输出的 bug；
- 升级 Spring Boot 依赖版本至 2.1.11.RELEASE；
- 升级 RPC 版本至 5.6.4；
- 升级 sofa-common-tools 版本至 1.0.21；

详细发布报告：[https://github.com/sofastack/sofa-boot/releases/tag/v3.3.0](https://github.com/sofastack/sofa-boot/releases/tag/v3.3.0)

**4、发布 sofa-common-tools v1.0.21 版本，主要变更如下：**

- 修复类隔离情况下 classloader 加载问题；

详细发布报告：[https://github.com/sofastack/sofa-common-tools/releases/tag/v1.0.21](https://github.com/sofastack/sofa-common-tools/releases/tag/v1.0.21)

### 社区直播预告

![SOFAChannel#12](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1581670095015-cc3cc59c-6f09-43fb-87c2-ce115f0c22a6.jpeg)

本期为 SOFAChannel 线上直播第 12 期，将邀请蚂蚁金服分布式事务核心开发仁空分享《蚂蚁金服分布式事务实践解析》。

本期分享将介绍蚂蚁金服内部的分布式事务实践，包括 TCC（Try-Confirm-Cancel） 模式以及 FMT （Framework-Managerment-Transaction，框架管理事务）模式。同时也会与大家分享在面对双十一大促这种世界级的流量洪峰前，我们又是如何应对这个挑战。

**主题**：SOFAChannel#12：蚂蚁金服分布式事务实践解析

**时间**：2020年3月12日（周四）19:00-20:00

**嘉宾**：仁空，蚂蚁金服分布式事务核心开发

**形式**：线上直播

**报名方式**：点击“[这里](https://tech.antfin.com/community/live/1119)”，即可报名
