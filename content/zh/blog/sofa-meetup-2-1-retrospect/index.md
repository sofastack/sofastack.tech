---
title: "当 Spring Cloud 遇上 SOFAStack | Meetup#2 回顾"
author: "玄北"
authorlink: "https://github.com/caojie09"
description: "本文根据 5月26日 SOFA Meetup#2 上海站 《当 Spring Cloud 遇上 SOFAStack》主题分享整理。"
categories: "SOFAStack"
tags: ["SOFAStack","SOFAMeetup"]
date: 2019-05-29T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563421066935-d18db741-90ee-4905-8609-3f02a39c11b5.png"
---

![SOFAStack Meetup#2 现场图](https://cdn.nlark.com/yuque/0/2019/png/226702/1560322261876-bbee1f1d-bfe0-4b5c-b148-7ff2eff728e2.png)

本文作者：玄北（曹杰），蚂蚁金服 SOFAStack 开源组核心成员。

本文根据 5月26日 SOFA Meetup#2 上海站 《当 Spring Cloud 遇上 SOFAStack》主题分享整理，主要来聊聊 spring-cloud-antfin 包含的主要特性及如何使用 SOFAStack 和 SpringCloud 快读构建微服务系统。

现场回顾视频以及 PPT 见文末链接。

## 概念

Spring Cloud 是 Spring 社区开源的一套微服务开发框架，帮助开发人员快速构建分布式应用，Spring Cloud 的官网介绍如下：

> Spring Cloud provides tools for developers to quickly build some of the common patterns in distributed systems (e.g. configuration management, service discovery, circuit breakers, intelligent routing, micro-proxy, control bus, one-time tokens, global locks, leadership election, distributed sessions, cluster state).

蚂蚁金服从 2007 年开始在公司内部使用 SOFAStack 框架，2014 年基于 Spring Boot 研发了 SOFABoot，2016 年将 SOFAStack 在公有云输出，2018 年 4 月，蚂蚁金服宣布开源 SOFAStack。SOFAStack（Scalable Open Financial Architecture Stack）是蚂蚁金服开源的，用于快速构建金融级分布式架构的一套中间件，也是在金融场景里锤炼出来的最佳实践。SOFAStack ：[https://github.com/sofastack](https://github.com/sofastack)

SOFAStack 包含以下主要特性：

- 全面：覆盖多种场景，让用户更加专注于业务开发；
- 可靠：经历过大规模场景的锤炼，特别是严苛的金融场景；
- 丰富：包含构建金融级云原生架构所需的各个组件，满足用户场景的现状和未来需求；
- 开放：兼容开源生态，组件可插拔， SOFAStack 组件与其它开源组件可相互集成或替换。

SOFAStack 开源全景图涵盖了微服务领域的各个方面，同时也积极和业界流行的开源组件结合，包括阿里巴巴集团开源的 Nacos、Sentinel 等，为用户提供更加广泛地选择。

![SOFAStack 开源全景图](https://cdn.nlark.com/yuque/0/2019/png/226702/1560322261885-80ef9efe-201a-407d-b6dd-cc4a3cb1ec1f.png)

SOFAStack 开源已经超过一年，Spring Cloud 作为当下流行的微服务框架，社区用户以及公司内部用户迫切希望能够将这两个优秀的框架进行整合，将 SOFAStack 中间件适配 Spring Cloud 规范也就产生了我们今天的主角——spring-cloud-antfin。

## spring-cloud-antfin 全景图

Spring 官网提供了一份 Spring Cloud 的架构图：

![Spring Cloud 的架构图](https://cdn.nlark.com/yuque/0/2019/png/226702/1560322261899-a7d671e8-8677-44e1-ab8f-947195af8227.png)

从 Spring Cloud 的架构图可以看到，Spring Cloud 框架涵盖了分布式应用开发的方方面面，包括：

- API 网关 
- 熔断与限流
- 服务发现
- 分布式配置
- 分布式链路

spring-cloud-antfin 是 Spring Cloud 微服务规范的 antfin 实现，同样的，我们也有一份 spring-cloud-antfin 全景图，涵盖了蚂蚁金服所有中间件：

![spring-cloud-antfin 全景图](https://cdn.nlark.com/yuque/0/2019/png/226702/1560322261889-e7d9c465-2c99-4baa-8eeb-91895ed1c3cb.png)

与 Spring Cloud 全景图不同，在 spring-cloud-antfin 中每种分布式组件都有具体的蚂蚁中间件实现：

- API 网关：SOFAGateway
- 熔断与限流：Guardian
- 服务发现：[SOFARegistry](https://github.com/sofastack/sofa-registry)
- 分布式配置：DRM
- 分布式链路：[SOFATracer](https://github.com/sofastack/sofa-tracer)

在 spring-cloud-antfin 适配 Spring Cloud 的过程中，我们发现 Spring Cloud 制定的规范并不完整，对于一些 Spring Cloud 规范并未涵盖的方面，spring-cloud-antfin 进行了扩展。

## 扩展 Spring Cloud

虽然 Spring Cloud 定义了很多微服务规范，但是在具体业务开发过程中，我们发现 Spring Cloud 还有很多不足，例如 Spring Cloud 对以下能力没有进行规范化：

- 属性级别动态配置
- 事务消息
- Big Table
- 分布式事务

### 属性级别动态配置

Spring Cloud 的动态配置基于 RefreshScope 接口，默认 RefreshScope 会对整个 Bean 进行刷新，而且实现自动刷新需要配合 spring-cloud-bus，我们认为与 Apollo、Nacos 等属性级别刷新相比，这个是明显的退步，所以 spring-cloud-antfin 定义一个 DynamicConfig 注解，对于打有这个注解的 Bean，spring-cloud-antfin 支持属性级别动态配置：

```java
@Target({ ElementType.TYPE })
@Retention(RetentionPolicy.RUNTIME)
public @interface DynamicConfig {
}
```

### 事务消息

spring-cloud-stream 默认不支持事务消息，但是在金融级场景中事务消息是必不可少的，所以 spring-cloud-antfin 扩展了 spring-cloud-stream 的定义，对事务消息进行了支持：

- MQ 支持事务：对于使用 MQ 本身就支持事务消息的，spring-cloud-antfin 会在 MessageHeaders 中增加 Transcation 相关属性，以此支持事务消息；
- MQ 不支持事务：对于使用 MQ 本身不支持事务的，spring-cloud-antfin 支持用本地事件表的模式支持事务消息。

![事务信息](https://cdn.nlark.com/yuque/0/2019/png/226702/1560322261889-fafb2228-c94a-4a3e-b4d8-8b95231141ff.png)

1. 消息发送端在同一个本地事务中记录业务数据和消息事件；
1. 事件恢复服务定时从事件表中恢复未发布成功的事件，重新发布成功后删除记录的事件。

通过事件恢复服务的不停执行，我们保证了本地事件和消息发送到 Message Broker 必定同时成功或者同时失败。

### Big Table

一些 SOFAStack 的使用者，一套代码会在多种技术栈使用，当使用开源技术栈时，Big Table 的实现会使用 HBase，在使用商业技术栈时，Big Table 会使用阿里云的 [TableStore](https://www.aliyun.com/product/ots)，为了让用户实现不修改代码在不同技术栈使用，spring-cloud-antfin 会定义一套统一接口，然后让用户针对 spring-cloud-antfin 的接口进行编程，这样在替换底层实现时用户代码不需要修改：

```java
public interface BigTableService {
    Result get(Get get) throws StoreException;
    Result[] get(List<Get> get) throws StoreException;  
    void put(Put put) throws StoreException;
    void put(List<Put> puts) throws StoreException;
    void delete(Delete delete) throws StoreException;    
    void delete(List<Delete> delete) throws StoreException;   
    ResultScanner getScaner(Scan scan) throws StoreException;
}
```

### 分布式事务

目前 Spring Cloud 规范不支持分布式事务，但是分布式事务又是在金融级场景中必不可少的，spring-cloud-antfin 将集成 [Seata](https://github.com/seata/seata) 框架，帮助用户更好的解决分布式场景下的数据一致性问题。

## spring-cloud-sofastack-samples

spring-cloud-antfin 目前已经在内部公测中，预计 7 月份发布，虽然 spring-cloud-antfin 还未发布，但是基于现有开源框架，SOFAStack 和 Spring Cloud 依然可以一起使用，我们提供了一个 Sample 工程用于演示使用 SOFAStack 和 SpringCloud 一起构建微服务系统 —— spring-cloud-sofastack-samples。

[spring-cloud-sofastack-samples](https://github.com/sofastack/spring-cloud-sofastack-samples) 是基于 SOFAStack 和 SpringCloud 构建的一套微服务系统，通过此案例工程提供了一个完整的基于 SOFAStack 和 SpringCloud 体系构建的基础工程模型。整个应用的架构图如下：

![应用架构图](https://cdn.nlark.com/yuque/0/2019/png/226702/1560322261900-ca082333-a1fc-4db1-9f18-8b7eece3ab7b.png)

通过此工程，可以帮助用户更好的理解和使用 SOFAStack 开源生态提供的一系列基础框架和组件。这个案例工程中包含了 SOFAStack 开源的大部分组件，包括 SOFABoot、SOFARPC、SOFATracer、SOFABolt 等。同时案例工程还集成了 Spring Cloud 的一些常用组件，包括 Feign、Hystrix、Ribbion、Zookeeper Discovery 等。对于业界的一些优秀开源框架，spring-cloud-sofastack-samples 也进行了整合，例如 Apollo。

## 小结

本文首先分享了 Spring Cloud 及 SOFAStack 的基本概念，然后介绍了这两个优秀框架碰撞之后的产生的全新框架 spring-cloud-antfin。对于 Spring Cloud 提供的一些优秀规范，spring-cloud-antfin 进行了适配，例如服务发现、熔断限流、分布式链路。对于 Spring Cloud 规范中未定义的，但是在开发中必不可少的方面，spring-cloud-antfin 进行了扩展，例如属性级动态配置、事务消息、Big Table、分布式事务。最后文章还分享了 SOFAStack 最近开源的新工程 spring-cloud-sofastack-samples，spring-cloud-sofastack-samples 是基于 SOFAStack 和 SpringCloud 构建的一套微服务系统，通过此案例工程提供了一个完整的基于 SOFAStack 和 SpringCloud 体系构建的基础工程模型。

## SOFA Meetup #2 上海站回顾资料

本文现场回顾视频以及 PPT 地址：[http://t.cn/AiKlmCmE](http://t.cn/AiKlmCmE)

## 相关 Workshop

![SOFAStack Cloud Native Workshop](https://cdn.nlark.com/yuque/0/2019/png/226702/1559287183237-44c03c7a-1fe0-49b0-838c-c582a57982fd.png)

6月24日（周一）KubeCon China 来了。KubeCon + CloudNativeCon + Open Source Summit China 2019，蚂蚁金服核心技术团队将举办一场全天的 Workshop，给大家分享分布式架构 SOFAStack、Service Mesh、Serverless、分布式事务 Seata 的实践案例，跟大家一起轻松上手云原生技术。

**主题：《蚂蚁金服 SOFAStack 云原生工作坊》（KubeCon China 2019 同场活动）**

**时间：**6 月 24 日 9:00-16:30

**地点：**上海世博中心

**注册费：**免费

本期活动中，本篇作者玄北也将带来**《使用 SOFAStack 快速构建微服务》**的主题 Workshop。

基于 SOFAStack 技术栈构建微服务应用。通过本 Workshop ，您可以快速了解并实践在 SOFAStack 体系中如何上报应用监控数据、服务链路数据以及发布、订阅服务。

**[欢迎点击](https://www.sofastack.tech/activities/sofastack-cloud-native-workshop)，**查看**活动详细安排**以及**报名方式**~
