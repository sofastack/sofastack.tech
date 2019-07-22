---
title: "蚂蚁金服 3 个项目进入 CNCF 云原生全景图 | 开源"
author: "SOFAStack"
authorlink: "https://github.com/sofastack"
description: "近期，CNCF 发布了最新版本的 Cloud Native Landscape，蚂蚁金服金融级分布式架构 SOFAStack 中有 3 个项目被纳入。"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2019-07-08T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563434064351-472db69f-36f7-4955-8925-c068cb16aac7.png"
---

> 2019 年 6 月 25 日，全球知名开源组织云原生计算基金会 CNCF 宣布，蚂蚁金服正式成为 CNCF 黄金会员，蚂蚁金服表示将持续加大对开源项目的支持，包括 Kubernetes，ServiceMesh，Serverless，安全容器等方向，并发挥自己的力量。SOFAStack 作为蚂蚁金服重要的开源项目，最近也与 CNCF 有故事发生。

近期，CNCF 发布了最新版本的 Cloud Native Landscape，蚂蚁金服金融级分布式架构 SOFAStack 中有 3 个项目被纳入，分别是 Service Mesh 数据平面代理 SOFAMosn、分布式链路跟踪系统 SOFATracer 和 RPC 服务框架 SOFARPC。

## CNCF & CNCF Cloud Native Landscape

CNCF(Cloud Native Computing Foundation)，是由 Google 牵头创立的云原生计算开源软件基金会。它致力于云原生(Cloud Native)技术的普及和可持续发展。2016 年 11 月，CNCF 开始维护 Cloud Native Landscape，汇总流行热门的云原生技术与工具，并加以分类，为企业构建云原生体系提供参考，在云生态研发、运维领域具有广泛影响力。

## SOFAStack & CNCF Cloud Native Landscape

蚂蚁金服金融级分布式架构 SOFAStack 中的 3 个项目加入这次最新版本的 Cloud Native Landscape，分别是 Service Mesh 数据平面代理 **SOFAMosn** 、分布式链路跟踪系统 **SOFATracer** 和 RPC 服务框架 **SOFARPC**。

![landscape.png](https://cdn.nlark.com/yuque/0/2019/png/226702/1562219713962-38216a3f-76f7-4ae2-af7c-5cca87f82aaa.png)

### SOFAMosn

<img src="https://cdn.nlark.com/yuque/0/2019/png/226702/1562558785955-ab9590fd-a383-4830-85fa-35633599b07a.png" width=10% alt="SOFAMosn">  

Star 一下✨：[https://github.com/sofastack/sofa-mosn](https://github.com/sofastack/sofa-mosn)

SOFAMosn(Modular Observable Smart Network)，是一款采用 GoLang 开发的 Service Mesh 数据平面代理， 功能和定位类似 [Envoy](https://www.envoyproxy.io/) ，旨在提供分布式，模块化，可观察，智能化的代理能力。 SOFAMosn 支持 Envoy 和 Istio 的 API，可以和 Istio 集成，在 [SOFAMesh](https://github.com/sofastack/sofa-mesh) 中，我们使用 SOFAMosn 替代 Envoy。 SOFAMosn 初始版本由蚂蚁金服和阿里大文娱 UC 事业部携手贡献，期待社区一起来参与后续开发，共建一个开源精品项目。

### SOFARPC

<img src="https://cdn.nlark.com/yuque/0/2019/png/226702/1562558811258-09e926eb-3863-4679-9875-868a06669813.png" width=10% alt="SOFARPC">  

Star 一下✨：[https://github.com/sofastack/sofa-rpc](https://github.com/sofastack/sofa-rpc)

SOFARPC 是蚂蚁金服开源的一款基于 Java 实现的 RPC 服务框架，为应用之间提供远程服务调用能力，具有高可伸缩性，高容错性，目前蚂蚁金服所有业务相互间的 RPC 调用都是采用 SOFARPC。SOFARPC 为用户提供了负载均衡，流量转发，链路追踪，链路数据透传，故障剔除等功能。

SOFARPC 还支持不同的协议，目前包括[Bolt](https://www.sofastack.tech/projects/sofa-rpc/bolt/)， [RESTful](https://www.sofastack.tech/projects/sofa-rpc/restful) ， [Dubbo](https://www.sofastack.tech/projects/sofa-rpc/dubbo) ， [H2C](https://www.sofastack.tech/projects/sofa-rpc/h2c) 协议进行通信。其中 Bolt 是蚂蚁金融服务集团开放的基于 Netty 开发的网络通信框架。

### SOFATracer

<img src="https://cdn.nlark.com/yuque/0/2019/png/226702/1562558834212-1876f2d1-48ae-49ae-9e9a-4e2f88fdb790.png" width=10% alt="SOFATracer">  

Star 一下✨：[https://github.com/sofastack/sofa-tracer](https://github.com/sofastack/sofa-tracer)

SOFATracer 是蚂蚁金服开发的基于 [OpenTracing 规范](http://opentracing.io/documentation/pages/spec.html) 的分布式链路跟踪系统，其核心理念就是通过一个全局的 TraceId 将分布在各个服务节点上的同一次请求串联起来。通过统一的 TraceId 将调用链路中的各种网络调用情况以日志的方式记录下来同时也提供远程汇报到 [Zipkin](https://zipkin.io/) 进行展示的能力，以此达到透视化网络调用的目的。

## SOFAStack 开源家族

SOFAStack™（Scalable Open Financial Architecture Stack）是用于快速构建金融级分布式架构的一套中间件，也是在金融场景里锤炼出来的最佳实践。

![SOFAStack 开源全景图](https://cdn.nlark.com/yuque/0/2019/png/156645/1562157948733-4c673075-94df-4c53-8702-266b24694820.png)

图为 SOFAStack 开源全景图，其中橙色部分为 SOFAStack 包含的开源组件，白色部分为兼容或集成开源社区其它优秀的开源产品

## 特别感谢 SOFAStack 开源社区的每一个你

**2018 年 4 月 19 日正式宣布逐步开源 SOFAStack，开源的策略是 Open Core，也就是把核心的接口和实现都开源出来，内部保留老的兼容代码。**到现在为止差不多 1 年 2 个月的时间，已经开源了十几个项目，累计超过 25,600  Star，120 多位贡献者， 以及 30 多家生产用户，近期认证了两位社区 Committer，再次感谢开发者和企业的信任和认可，因为你们，SOFAStack 社区才能会更好。

**文中涉及的相关链接：**

- SOFAMosn：[https://github.com/sofastack/sofa-mosn](https://github.com/sofastack/sofa-mosn)
- SOFARPC：[https://github.com/sofastack/sofa-rpc](https://github.com/sofastack/sofa-rpc)
- SOFATracer：[https://github.com/sofastack/sofa-tracer](https://github.com/sofastack/sofa-tracer)
- SOFAMesh：[https://github.com/sofastack/sofa-mesh](https://github.com/sofastack/sofa-mesh)