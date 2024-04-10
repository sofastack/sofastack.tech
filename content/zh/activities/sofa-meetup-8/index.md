---
title: "SOFAStack Meetup#7 合肥站-SOFA 微服务架构技术生态与实践"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFAStack Meetup#7 合肥站-SOFA 微服务架构技术生态与实践"
categories: "SOFAMeetup"
tags: ["SOFAMeetup"]
date: 2021-07-24T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*IcnvSK-tBssAAAAAAAAAAAAAARQnAQ"
---

## 概要

- 活动主题：SOFAStack Meetup#7 合肥站-SOFA 微服务架构技术生态与实践

- 活动时间：2021 年 07 月 24 日（周六）13:30-17:30

- 活动地点：合肥高新区创新产业园 D8 栋一楼集思空间

- 活动形式：线下活动

- 资料下载：<br/>
[《蚂蚁注册中心 SOFARegistry 分享》](https://gw.alipayobjects.com/os/bmw-prod/7b73191a-0057-4f57-9570-fed0929b75d1.pdf)<br/>
[《基于 API 网关的微服务治理演进与架构实践》](https://gw.alipayobjects.com/os/bmw-prod/7f7c9a04-d5c9-487e-af1e-c746e896e5c7.pdf)<br/>
[《蚂蚁集团分布式链路组件 SOFATracer 原理与实践》](https://gw.alipayobjects.com/os/bmw-prod/a2186772-3ebc-42cb-8479-7d60ae5d8b67.pdf)<br/>
[《准实时的日志聚合平台》](https://gw.alipayobjects.com/os/bmw-prod/bc982c91-4706-4cc0-858c-2ea5c204b3ab.pdf)<br/>
[《Service Mesh 在蚂蚁集团的实践》](https://gw.alipayobjects.com/os/bmw-prod/e2a493d2-911f-4cd0-8204-1a00e374c6b0.pdf)

- 本次分享涉及的项目地址

sofa-registry 开箱即用计划
https://github.com/sofastack/sofa-registry/projects/5

sofa-registry 深度解析计划
https://github.com/sofastack/sofa-registry/projects/4

(这两个计划想帮助对参与开源项目感兴趣的同学由浅入深的上手，成为社区的一员)

sofa-tracer
https://github.com/sofastack/sofa-tracer

mosn
https://github.com/mosn/mosn


## 活动介绍

### 活动议程

![](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*weiZRLlOcA0AAAAAAAAAAAAAARQnAQ)

### 本期议题以及嘉宾详解

**《蚂蚁注册中心 SOFARegistry 分享》**

**嘉宾介绍**

祝辰（花名忘禅），蚂蚁集团技术专家，2020 年加入蚂蚁集团致力于服务发现领域的技术建设，开源项目 sofa-registry、x-pipe 核心开发人员。  

**议题简介**

大规模微服务场景下的注册中心：SOFARegistry v6 新特性介绍 SOFARegistry 是蚂蚁集团内部在使用的服务注册中心，它支撑起了蚂蚁集团海量规模的业务服务。
但随着蚂蚁集团业务规模的日渐庞大，SOFARegistry 在资源、容量、运维等方面也遇到了一些挑战，针对这一系列的挑战，我们对 SOFARegistry 进行了大量的改造，开发了 v6 版本的 SOFARegistry。

**项目地址**

sofa-registry 开箱即用计划
https://github.com/sofastack/sofa-registry/projects/5

sofa-registry 深度解析计划
https://github.com/sofastack/sofa-registry/projects/4

(这两个计划想帮助对参与开源项目感兴趣的同学由浅入深的上手，成为社区的一员)


**听众收获**

1、全面了解不同注册中心的设计及架构；

2、深入了解千万级别微服务场景下服务发现的问题和解法。

**《基于 API 网关的微服务治理演进与架构实践》**

**嘉宾介绍**

王晔倞，现任 API7 VP，Apache APISIX Contributor。公众号「头哥侃码」作者，曾在好买财富、大智慧、中通服软件、东方购物任职，21 年 IT 从业经验，对技术管理和架构设计有一定的经验。TGO 鲲鹏会上海理事会成员，腾讯云 TVP，QCon 北京 2017 明星讲师，QCon 北京 2018 优秀出品人。

**议题简介**

内容讲述随着业务的发展，规模扩大，服务颗粒越来越细，数量也越来越多。
我们在过程中有过很多经验和探索，并将系统从一个服务于单个业务方的后台系统逐渐改造成为一个支持海量内容，服务多个业务方，业务规则复杂多变的微服务治理架构。
通过 API 网关，我们有效协调线上运行的各个服务，保障服务的 SLA。基于服务调用的性能 KPI 数据进行容量管理，并通过对技术中台的升级，对故障进行降级、熔断、限流等一系列升级。

**听众收获**

1、微服务治理当前面临的问题；

2、API 网关在微服务治理中的价值；

3、从“单体“到”微服务“的转型过程中，该如何使用 API 网关实现微服务治理。

**《蚂蚁集团分布式链路组件 SOFATracer 原理与实践》**

**嘉宾介绍**

郑志雄（花名纶珥），SOFABoot 开源负责人，主要负责蚂蚁集团应用研发框架的开发。

**议题简介**

当下的微服务技术架构，应用的各种服务通常都比较复杂、分布在不同的机器上；同时，这些应用可能又构建在不同的软件模块上，这些软件模块有可能是由不同的团队开发，可能使用不同的编程语言来实现、有可能部署了几千台服务器。为了能够分析应用的线上调用行为以及调用性能，蚂蚁金服基于 OpenTracing 规范，提供了分布式链路跟踪 SOFATracer 的解决方案，帮助理解各个应用的调用行为，并可以分析远程调用性能的组件。

**项目地址**

https://github.com/sofastack/sofa-tracer


**听众收获**

1、了解微服务场景下分布式链路组件的作用及价值；

2、了解蚂蚁集团 SOFATracer 组件的基本原理。

**《准实时的日志聚合平台》**

**嘉宾介绍**

吕思泉是思科 Webex 产品线 MATS（媒体分析与问题诊断服务）团队的技术专家，热爱开源，热爱分享，热爱生活，在 MATS 团队主要工作方向为基础技术的研究与应用，在分布式系统和微服务方面有丰富的经验，由其本人编写并开源的 jgossip 项目解决了 MATS 分布式 Job Engine 的水平扩展难题，由其本人研究并实践的基于 Loki+Promtail+Grafana 的日志平台大幅度提高了 MATS 团队在分布式系统日志管理与监控方面的效率。

**议题简介**

简要介绍基于 Loki 的日志可视化套件，以及思科内部如何使用该技术进行监控和告警。

**听众收获**

通过讲师介绍，大家可以了解到一种轻巧灵活的日志聚合系统，帮助开发人员快速定位问题以及实时了解系统状况。

**《Service Mesh 在蚂蚁集团的实践》**

**嘉宾介绍**

李唯（良恩），蚂蚁集团技术专家。2017 年加入蚂蚁集团中间件团队。参与了 Service Mesh 在蚂蚁的落地建设，目前主要负责 MOSN 在蚂蚁内部的设计开发。

**议题简介**

随着业务发展，越来越多公司选择了微服务架构，它帮助业务解决了很多问题，但是在实践过程中也不免会遇到一些问题。在这些利与弊的权衡之中，Service Mesh 能够帮助到我们什么呢？本次内容分享 Service Mesh 在微服务的实践中解决的一些问题以及其背后的思考。

**项目地址**

https://github.com/mosn/mosn

**听众收获**

1、了解 Service Mesh 在微服务中的实践场景和意义；

2、了解 Service Mesh 在蚂蚁实践中为业务带来的价值。

## 了解更多技术干货

使用钉钉搜索群号：**34197075**，即可加入，获取一手开源技术干货；或微信扫码关注“金融级分布式架构”微信公众号👇
![](https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*s3UzR6VeQ6cAAAAAAAAAAAAAARQnAQ)
