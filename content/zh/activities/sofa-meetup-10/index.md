---
title: "【活动回顾】SOFAMeetup#8 成都站 云原生基础设施建设的现在及未来"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "【活动回顾】SOFAMeetup#8 成都站 云原生基础设施建设的现在及未来"
categories: "SOFAMeetup"
tags: ["SOFAMeetup"]
date: 2021-09-11T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*kvWHQ5NzzsUAAAAAAAAAAAAAARQnAQ"
---

## 概要

- 活动主题：SOFA x Erda Meetup#8 成都站，云原生基础设施建设的现在及未来

- 活动时间：2021 年 09 月 11 日（周六）13:30-17:00

- 活动地点：四川省成都市武侯区蚂蚁 C 空间 101 猎户座

- 活动形式：线下活动

- 资料下载：<br/>
[《从云原生视角，解读 Erda 微服务观测系统的实现》](https://gw.alipayobjects.com/os/bmw-prod/75201cac-3aff-499b-8715-8809c00ae977.pdf)<br/>
[《Service Mesh落地之后：为 sidecar 注入灵魂》](https://gw.alipayobjects.com/os/bmw-prod/ce6c26b1-c98e-4d9f-b9ef-21ad42e012c7.pdf)<br/>
[《技术风口上的限流—蚂蚁集团的 Mesh 限流落地与实践 》](https://gw.alipayobjects.com/os/bmw-prod/82be6ceb-89e0-4d4e-9cc9-42128fc2491f.pdf)<br/>
[《Erda 关于云原生数据开发平台的思考和实践》](https://gw.alipayobjects.com/os/bmw-prod/26189392-95ec-403c-9187-b8af6a22ee95.pdf)

## 活动议程

>![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*OEPXQoXiFB0AAAAAAAAAAAAAARQnAQ)

## 活动回顾 

**《从云原生视角，解读 Erda 微服务观测系统的实现》**

**嘉宾介绍**

刘浩杨，Erda 微服务和监控团队负责人，主要负责云原生 PaaS 的架构设计、微服务观测治理平台的产品技术规划等工作，对分布式、可观察性、云原生等方向有深入的研究和实践经验。同时也是开源爱好者，Apache SkyWalking PMC 成员，在 Apache SkyWalking 的多语言生态和社区建设中起到重要作用。 

**议题简介**

- 在云原生架构下，基于 DevOps、微服务、容器化等云原生的能力，可以帮助业务团队快速、持续、可靠和规模化地交付系统，同时也使得系统的复杂度成倍提升，由此带来了前所未有的运维挑战。<br/>
在此背景下，对分布式系统的“可观测性”应运而生，可观察性提供了一套理念来监控、诊断云原生应用系统。和监控相比，可观察性从单一的度量扩展为 Metrics、Tracing、Logging 三大支柱，Erda MSP (MicroService Platform) 中的 APM 系统也在逐渐演进为以可观察性分析诊断为核心的微服务观测平台，本次主题将会解读 Erda 对微服务观测系统的探索和实践。

**听众收获**

可快速了解监控和可观测性技术的发展历程，了解云原生场景下可观测性的痛点和解决方案，及获取 Erda 微服务观测平台的功能特性。

**《Service Mesh落地之后：为 sidecar 注入灵魂》**

**嘉宾介绍**

周群力（花名：仪式），开源爱好者, co-founder of Layotto，Dapr contributor。目前在蚂蚁中间件团队工作，对SOFAStack和MOSN的开源影响力负责。虽然工作是做云原生基础设施，但业余时间也喜欢折腾前端和数据。

**议题简介**

- 随着Service Mesh在蚂蚁集团内部的大规模落地，我们逐渐遇到了新的挑战，这让我们迫切的寻找新的解决方案。<br/>
Service Mesh通过引入sidecar来简化服务治理，但是随着探索实践，我们发现 sidecar 能做的事情远不止于此。一方面，给 sidecar 添加 Multi-Runtime 能力可以帮助基础设施团队更好的和业务团队解耦，简化多语言治理；另一方面，中立的 Runtime API 可以抽象基础设施、简化编程，帮助 K8s 生态成为真正的“分布式操作系统”，也帮助应用彻底和厂商解绑，保证多云环境的可移植性；与此同时，在 WebAssembly 日益火爆的当下，WASM 也能帮助 sidecar 实现 FaaS、业务系统 sdk 下沉等功能。<br/>
那么，Service Mesh落地之后，架构演进的思路是什么？我们的思路是：为sidecar注入灵魂。

**听众收获**

- 了解蚂蚁集团在Service Mesh大规模落地以后遇到的新问题以及对于如何解决这些问题的思考。
- 了解Multi-Runtime解决的问题及实践经验。
- 了解中立的Runtime API解决什么问题，以及相关实践经验
- 了解WASM在FaaS等方向的探索。

**《技术风口上的限流—蚂蚁集团的 Mesh 限流落地与实践 》**

**嘉宾介绍**

张稀虹，蚂蚁集团技术专家，专注于云原生相关技术在业务生产中的落地与实践，开源项目 MOSN 核心成员，目前关注云原生 ServiceMesh、Serverless 等相关领域。

**议题简介**

- ServiceMesh 可谓是站在风口上的技术热点，流量控制正是 Mesh 架构下的核心功能。Mesh 的架构优势使得业务可以更低成本的使用上通用的限流熔断能力，本次分享为大家介绍蚂蚁集团的 Mesh 限流能力的建设以及业务落地推广的实践经验。

**听众收获**

- 了解 Mesh 架构下的限流熔断技术优势
- 分享蚂蚁集团 Mesh 限流熔断能力建设经验
- 拓宽思路了解限流熔断未来的探索方向

**《Erda 关于云原生数据开发平台的思考和实践》**

**嘉宾介绍**

侯璐瑶，高级技术专家，Erda 数据团队负责人，主要负责基于云原生的数据平台的架构设计、负责数据应用产品架构和产品演进，对于大数据领域数据组件和数据应用等方向有比较深入的研究和实践经验。

**议题简介**

- 数据 on 云原生是必然的路径，云原生对于数据平台带来了比传统平台更容易的扩展性和便捷性。本次分享主要介绍 Erda 数据开发平台在云原生上的建设和实战经验。

**听众收获**

- 了解云原生的整体数据架构；
- 分享 Erda 的落地实践经验。

## 了解更多技术干货

使用钉钉搜索群号：**34197075**，即可加入，获取一手开源技术干货；

或微信扫码关注“金融级分布式架构”微信公众号👇

>![](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*5aK0RYuH9vgAAAAAAAAAAAAAARQnAQ)
