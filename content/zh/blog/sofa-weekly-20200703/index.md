---
title: "SOFA Weekly | MOSN 版本发布以及社区活动预告、SOFABolt 直播回顾整理"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "【06/29-07/03】 | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2020-07-03T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563524226806-e93607a3-1b77-4ca2-8c3c-0384ab966154.png"
---

**SOFA WEEKLY | 每周精选，筛选每周精华问答**

**同步开源进展，欢迎留言互动**

![weekly](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1562925824761-fc720f21-9622-437b-a783-0b0729eda119.jpeg)

**SOFA**Stack（**S**calable **O**pen Financial **A**rchitecture Stack）是蚂蚁集团自主研发的金融级分布式架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

- **SOFAStack 官网:** [https://www.sofastack.tech](https://www.sofastack.tech/)
- **SOFAStack:** [https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动

我们会筛选重点问题通过 " SOFA WEEKLY " 的形式回复

**1、@[guotaisu](https://github.com/guotaisu)** 提问：

> 根据 jraft-example, 使用“fake PD”, 怎样手动 rebalance。使用 PD 自管理体现在哪？

A：手动 API： 
[https://github.com/sofastack/sofa-jraft/blob/master/jraft-core/src/main/java/com/alipay/sofa/jraft/CliService.java#L190](https://github.com/sofastack/sofa-jraft/blob/master/jraft-core/src/main/java/com/alipay/sofa/jraft/CliService.java#L190)

PD 目前只实现了 leader 平衡和自动分裂，支持很容易基于 SPI 扩展增加自己的逻辑(增加并实现自己的 com.alipay.sofa.jraft.rhea.util.pipeline.Handler 即可)，文档见：[https://www.sofastack.tech/projects/sofa-jraft/jraft-rheakv-user-guide/](https://www.sofastack.tech/projects/sofa-jraft/jraft-rheakv-user-guide/)

> regionEngineOptionsList 配置：实例中的 regionId 的 startKey：01000000-endKey：23000000 根据什么来定义的，假设我一个 store 节点只部署 1-3 个 region，可以自定义上下界是吗，依据什么来定义？

A：rheakv multi group 按照 range 分片，左闭右开，可以自定义，怎么定义取决于你对自己场景 key 分布的评估。

> yaml 配置中 regionEngineOptionsList.RegionEngineOptions 中的 serverAddress、initialServerList 等配置和外部与 regionEngineOptionsList 平级的 serverAddress 配置以及与 storeEngineOptions 平级的 initialServerList 是什么关系，谁覆盖谁？

A：store 和 region 为1：n， region 包含在 store 中，store 的参数会 copy 传递到 region。

> jraft-example 展示，Rhea-kv 是客户端+服务端模式，其中 benchmark 使用分片集群部署模式，需要先同时使用 BenchmarkClient、BenchmarkServer 拉启后台服务，而后面的 rheakv 使用分节点配置和启动，如何区分二者的场景和使用姿势。

A：rheakv 可以作为 client+server 部署，也可以单独作为 client 部署，通常你不想在每个节点提供服务但是还需要调用服务，那么就只 client 部署即可（配置的区别就在于是否配置了 StoreEngineOptions）。

> 本人项目使用 SOFAJRaft 场景是分布式单体服务快速便捷存储业务元数据，实现一致性访问。请问后台需要拉取这么多服务如何还能保证我的应用轻量快捷？另外，这些后台 jraft-kv 选举和存储服务启动后，是独立进程吗，整合到自己到项目中后，可否一个进程并且其服务生命周期随同我的母体应用的生命周期。

A：SOFAJRaft 是一个 jar 包，是不是独立进程完全取决于你自己的意愿，都可以。

> 参考 jraft-example 实例，基于 rheakv 部署 multi group，加减 learnner 节点等，应该是以分组为单位操作，目前只看到 NodeOptions 中有 groupId 属性，多组时怎么配置和分别操作。

A：这应该是两个问题。
问题1（groupId 多组如何配置）：在 rheakv 里，groupId 是 clusterName + ‘-’ regionId。
问题2（多组如何配置 learner）：目前没有很灵活，我们内部使用还是单独指定几台机器，上面的节点全部是 learner 节点，只要配置 initialServerList: 127.0.0.1:8181,127.0.0.1:8182,127.0.0.1:8183/learner 即所有 group 的 learner 都在 127.0.0.1:8183/learner 一个节点上，你的需求收到了，下个版本会增加每个 region 单独指定 learner，需要修改 RegionEngineOptions.initialServerList 在不为空的时候不被 StoreEngineOptions 的值覆盖即可。

SOFAJRaft：[https://github.com/sofastack/sofa-jraft](https://github.com/sofastack/sofa-jraft)

### 本周推荐阅读

- [网络通信框架 SOFABolt 功能介绍及协议框架解析 | SOFAChannel#17 直播回顾](/blog/sofa-channel-17/)
- [走出微服务误区：避免从单体到分布式单体](/blog/microservices-misunderstanding-avoid-monolith-to-distributed-monolith/)

### SOFA 项目进展

**本周发布详情如下：**

**发布 MOSN v0.14.0，主要变更如下：**

- 支持 Istio 1.5.x 版本；
- 升级了一些依赖库，如 FastHTTP、Dubbo-go、Tars；
- 支持 Maglev 负载均衡、支持 HostRewrite Header；
- 新增了一些 Metrics 输出与查询接口；
- 部分实现优化与 Bug 修复；

详细发布报告：[https://mosn.io/zh/blog/releases/v0.14.0/](https://mosn.io/zh/blog/releases/v0.14.0/)

同时，恭喜**姚昌宇（@trainyao）**成为 MOSN Committer，感谢他为 MOSN 社区所做的贡献。

### 社区活动报名

![GIAC](https://cdn.nlark.com/yuque/0/2020/png/226702/1593767327848-6b0d42f2-2cc8-479b-8375-3d375dba618a.png)

GIAC（GLOBAL INTERNET ARCHITECTURE CONFERENCE）是面向架构师、技术负责人及高端技术从业人员的年度技术架构大会，是中国地区规模最大的技术会议之一。**蚂蚁集团也受邀进行 CloudNative(云原生) 的主题分享。**

- **分享主题：云原生网络代理 MOSN 的进化之路**
- **分享嘉宾：**王发康（毅松）蚂蚁集团 可信原生技术部 技术专家
- **背景介绍：**网络通信代理 MOSN 在蚂蚁集团的 Service Mesh 大规模落地后，通过对接 UDPA 打造为 Istio 的数据面之一，增强 MOSN 服务治理及流量控制能力，对接云原生周边组件，实现 MOSN 开箱即用，MOSN 成为云原生 Service Mesh 的标准 Sidecar 之一，从而借力开源，反哺开源。
- **听众收益：**可快速基于 MOSN 和 Istio 进行 Service Mesh 实践，了解微服务的发展历程、遇到的痛点以及解决方案，获取 MOSN 的功能特性，解决微服务常见的问题。
- **分享时间**：2020-08-01 13:30-14:30
- **活动地点：**深圳
- **活动报名：**点击“[这里](http://giac.msup.com.cn/Giac/schedule/course?id=14579)”
