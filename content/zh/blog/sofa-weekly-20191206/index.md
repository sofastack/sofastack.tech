---
title: "SOFA Weekly | 每周精选【12/2 - 12/6】"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2019-12-06T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563524226806-e93607a3-1b77-4ca2-8c3c-0384ab966154.png"
---

**SOFA WEEKLY | 每周精选，筛选每周精华问答**
**同步开源进展，欢迎留言互动**

![weekly](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1562925824761-fc720f21-9622-437b-a783-0b0729eda119.jpeg)

SOFAStack（Scalable Open Financial Architecture Stack）是蚂蚁金服自主研发的金融级分布式架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

**SOFAStack 官网: **[https://www.sofastack.tech](https://www.sofastack.tech/)

**SOFAStack: **[https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动
我们会筛选重点问题通过 " SOFA WEEKLY " 的形式回复

**1、@温明磊**  提问：

> 我们还是想用 redis 存状态机上下文一个大的实体，输入输出只放 id，我想问下，redis 宕机或者其它情况下，状态机 redis 宕机节点之前的节点都是幂等可重复的，那我怎样让它重新跑一边状态机？只能人工干预吗？

A：你的意思是因为参数没有了，所以你想重跑状态机回放参数？

> 是的。从最开始跑，因为之前的节点幂等， 也没有变更数据，或者数据已经被 catch 住然后补偿了。

A：我理解是你可以新启动一个状态机事例，把之前的生成的 id 传进上下文，这样和从新开始没有区别吧？不然你人工处理的话，需要把 state_inst 表里的数据删除。

> 嗯 ，我明白 ，通过定时就可以，因为在状态机开始之前 数据已经落库了。redis 宕机捕获异常后，可以给最开始的数据设置状态，然后定时开启状态机。但是 Saga 确实不能帮我完成定时重启状态机这个事情对吧，或者我就设置个补偿节点，专门用来重启新状态机实例的？这样可以？

A：我建议是不要搞个补偿节点来处理非补偿的事，我觉得可以自己做个定时任务，然后处理这种情况。

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

**2、@李林** 提问：

> 数据面默认是能感知到所有服务的变更么？

A：是的，因为对接了 SOFARegistry。

> 那当集群规模比较大的时候，是不是会出现感知较慢的情况呢？

A：SOFARegistry 里有全量的服务订阅信息，MOSN 和 SOFARegistry 对接只会感知当前 MOSN 必须的服务信息，所以 MOSN 内的数据总量不会很大。

> Istio 控制面占用的资源比较多，MOSN 是做了优化么？

A：你指的 Istio 控制面占用资源比较多指的是哪一部分？Mixer 么？

> 可以理解为只告知当前服务需要依赖的信息吧，这样的话数据量就小多了。

A：是的。

> Pilot 在我们自己的集群里部署了，占用资源也挺多的，不过比 Mixer 小。 另外我查看数据面 Envoy 从 Pilot 拿到的数据信息挺多的，config_dump 的信息有 30 万行左右。

A：我们暂时没有从 Pilot 拿服务注册数据，只有一些服务流量管控的配置从 Pilot 下发，Mixer 的能力是集成在 MOSN 内部的所以控制面的消耗还好，不是很重。

> 那应该是做了挺多优化调整的吧。

A：是的，集成后省去了 Mixer 的两跳，Metrics 数据可以直接被采集。

> 那服务的依赖关系需要通过配置提供才能做到只感知需要依赖的服务吧？Metrics 的直接采集是通过 prometheus 直接抓取每个数据面节点的数据么？

A：是的，通过 prometheus 协议定时有专门的 agent 抓取的数据。

MOSN：[https://github.com/sofastack/sofa-mosn](https://github.com/sofastack/sofa-mosn)

**3、@NameHaibinZhang** 提问：

> 将 MOSN 按照容器化的方式部署，通过读取默认配置，暴露 15001 端口，MOSN 能够同时在一个端口接收不同协议的请求么，如 Http、SOFARPC 请求。

A：MOSN 的默认配置都是一些 example，没有 15001 端口，你需要按照你的需求写你的配置。一个 listener 目前不能同时处理两种协议，listener 中 proxy 的配置指定了可以处理的协议。

> 15001 端口是按 Sidecar 方式部署的时候开启的端口，比如通过 Istio 来部署，iptables 中 Envoy 开启 15001 端口。

A：目前同一个端口支持 tls/明文自定识别， http1/http2 的自动识别，协议哪儿配置 Auto。Http 和 SOFA 的识别目前不支持，有需求的话支持也很方便。

> 嗯，因为作为 Sidecar 部署的时候，http 的接口和 SOFA 接口都希望能通过 Sidecar 来做流量劫持，Auto 可以做 rpc 协议的支持和识别不？

A：如果是做流量劫持的话，其实是不需要支持识别的，这个 15001 不会实际处理请求，会转发给正确的端口来处理。

> Sidecar 内部做一个转发是吧，开另外2个端口，那15001这个端口配置 TCP 协议了，然后接收到之前做判断是什么协议，转给对应的端口。

A：可以看一下这篇文章：《[SOFAMesh中的多协议通用解决方案x-protocol介绍系列（1）——DNS通用寻址方案](/blog/sofa-mesh-x-protocol-common-address-solution/)》。

### SOFA 项目进展

**本周发布详情如下：**

**发布 Occlum v0.7.0 版本，主要变更如下：**

- 重构了 ioctl 的实现；
- 增加了 socketpair；
- 实现了与Alpine Linux的二进制兼容性；
- 增加了 nanosleep；
- 增加了外部可调用命令的路径检查（即 occlum run 的）；
- 增加了 XGBoost 的 demo；

详细发布报告：
[https://github.com/occlum/occlum/releases/tag/0.7.0](https://github.com/occlum/occlum/releases/tag/0.7.0)

### 社区活动

#### 回顾：

11月24日 Kubernetes & Cloud Native X Service Mesh Meetup 活动回顾（含现场PPT以及视频回顾）：

- [Service Mesh 在『路口』的产品思考与实践：务实是根本](/blog/service-mesh-practice-in-production-at-ant-financial-wushi/)
- [深入Kubernetes 的“无人区” — 蚂蚁金服双十一的调度系统](/blog/kubernetes-practice-antfinal-shopping-festival/)

12月5日 SOFAChannel#9 直播回顾：

- https://tech.antfin.com/community/live/1021/data/957

#### 预告-专享福利：

![OSC 源创会](https://cdn.nlark.com/yuque/0/2019/png/226702/1575625658399-e8c74d62-13aa-4623-89a3-a7bd6e8bc8db.png)

“剑指源码，尖峰对话”2019 OSC源创会是由 OSCHINA 主办的线下技术沙龙，理念为“自由、开放、分享”，SOFAStack 也受邀参加本次年终盛会，并带来主题分享。

**主题**：《蚂蚁金服 Service Mesh 超大规模实践以及开源》

**嘉宾**：卓与，蚂蚁金服 Mesh 化落地负责人

**时间**：2019年12月15日下午14:05-14:40（架构分会场）

**专享福利：**点击“[**这里**](https://www.oschina.net/2019-shenzhen-ceremony)”，**验证码**填写“**SOFAStack**”即可获得大会**免费票**。

**Topic 简介**：Service Mesh 是蚂蚁金服下一代架构的核心，本主题主要分享在蚂蚁金服在 Service Mesh 领域落地的一些场景。

蚂蚁金服已在 Service Mesh 领域迈向深水区，今年在双十一落地可能是业内最大规模的 Service Mesh 集群，其中处处充满挑战，本主题将介绍 MOSN 在蚂蚁金服的落地情况以及 MOSN 在开源上的规划与思考，帮助更多的开发者们更好的实践 Service Mesh。
