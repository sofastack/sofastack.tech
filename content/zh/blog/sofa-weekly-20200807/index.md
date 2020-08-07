---
title: "SOFA Weekly | MOSN & SOFARPC 发布、MOSN 社区活动报名"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2020-08-07T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563524226806-e93607a3-1b77-4ca2-8c3c-0384ab966154.png"
---

**SOFA WEEKLY | 每周精选，筛选每周精华问答**
**同步开源进展，欢迎留言互动**

![weekly](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1562925824761-fc720f21-9622-437b-a783-0b0729eda119.jpeg)

**SOFA**Stack（**S**calable **O**pen Financial **A**rchitecture Stack）是蚂蚁集团自主研发的金融级分布式架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

- **SOFAStack 官网：**[https://www.sofastack.tech](https://www.sofastack.tech/)
- **SOFAStack：**[https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动

我们会筛选重点问题通过 " SOFA WEEKLY " 的形式回复

**1、@丁浪** 提问：

> 这个跟 TCP 长链接的心跳没根本区别啊！也只能保证链路上的通畅，应用僵死或者苟延残喘了可能发现不了，可以补充从注册中心去主动探测 URL，反正现在 SpringBoot 和 SOFABoot 应用都可以开启 healthcheck 的 endpoint，为啥不从注册中心发探测请求，反正都有 healthcheck 的 endpoint。链路上的保活那只是基本生存需求，稍微高级一点就不行了，应用僵死或者苟延残喘那种可能还有心跳的。我看你们把这个问题交给 RPC 框架去做了，让 RPC 框架去做故障剔除和容错。
> ![SOFARegistry 的健康检测](https://cdn.nlark.com/yuque/0/2020/png/226702/1596782344601-52bea535-c593-47a9-b6d5-5bb4e25728dd.png)

A：SOFARegistry 目前设计是比较依赖网络连接的，网络连接只要出发了断链事件（这个目前监听是靠 Netty 的事件通知过来的）就会进行数据清理，这个敏感性也决定了服务发现比较快，但是对于抖动和其他大面积不稳定情况处理确实显得不足。我们说的 RPC 框架剔除是对于经常性的链接不通地址采取自动降级不进行调用处理，至于 Spring 那种心跳检测机制，我们开始实现也考虑过，因为这个健康检查机制和网络断连触发的敏感性差别较大，健康检是定期轮训的可能确定服务下线没有这么快速发现，所以没有采用，后续也想过兼容两种模式解决这个断链处理，引入类似 ZK 那种 Session 过期等机制可以在快速发现和稳定性做一个取舍。

> 那种应用进程僵死、较长时间 fullgc 之类的，长链接心跳还在注册中心发现不了流量过来就有问题的，RPC 框架的剔除机制我个人认为只能是种兜底降级。我目前是结合 K8s 探针去请求应用的 healthcheck 路径的，K8s 健康检查不通过就会杀进程重启 Pod，这样注册中心也会感知到 RPC 流量也就剔了。

SOFARegistry：[https://github.com/sofastack/sofa-registry](https://github.com/sofastack/sofa-registry)

**2、@倪美俭** 提问：

> 这是 AT 模式，store:db，rollback 的交互图，麻烦帮忙瞅瞅有问题吗？
> ![store:db rollback 交互图](https://cdn.nlark.com/yuque/0/2020/png/226702/1596782490958-1bc712b8-6fea-4197-897b-219ea973d039.png)

A：是的，一阶段都是提交的，二阶段如果是回滚就会把之前的本地 commit 回滚掉。

> 这种场景是否要优化下，直接发起二阶段回滚，就不再进行这个本地事务一阶段的提交呢？这里为什么会进入到本地事务的 commit 方法里，而不是 rollback 方法里呢？

A：这种你把本地的事务注解加到全局事务注解下面就好了，这样发起方所在的本地事务是直接走 rollback，其余参与方才是二阶段决议通知下来。

> 强一致性需求的场景，Seata 里只能用 XA，但 XA 是依赖数据库本身对 XA 协议的支持来实现的，那是不是这种模式下性能上会比 LCN 要逊色一些呢？

A：首先 LCN 的原理是通过 connection 的代理，使之做空提交，二阶段决议后，把 hold 住的 connection 进行真正的 commit 或者 rollback，然而这个方式的隔离性交由本地事务来实现，因为 connection 未提交，所以事务还未提交，强依赖了本地事务。其次除非你的服务不会宕机，否则不建议你使用 LCN 模式，因为如果在二阶段决议后，宕机了一个参与者，那么 LCN 是无法恢复之前的数据，导致数据丢失。

而 XA 你可以认为他跟 LCN 也很像，但是 LCN 面对的是数据源连接，而 XA 你会发现这个才是由数据库真正意义上去支持的一个协议，即使宕机了，Seata XA 也是做了 XA 的预提交，持久化提交数据在数据库层面，但未真正提交，从而可达到宕机后重启也可以提交事务。

这是我做在 Seata 中 LCN 原理实现的 PR：[https://github.com/seata/seata/pull/2772](https://github.com/seata/seata/pull/2772) ，你可以阅读下，很容易发现他的缺陷，LCN 的性能高是基于啥也基本没干，就多了个几个 RPC 通信的消耗，无需解析 SQL，做镜像校验，全局锁解锁等操作，他仅仅只是把本地事务的提交延迟到其余的参与者都完成了业务并且没发生异常的情况下。看过这个 PR 或者 LCN 的源码后，你就会真正的理解为什么 LCN 说自己不产生事务，而是事务的协调者而已。

> 去年看过 LCN 的源码，它也是代理了数据库连接，在一阶段会 hold 住所有的数据库连接，并不真正提交，二阶段会全部一起提交或回滚，那么有参与者宕机的话不应该会全部回滚吗？

A：因为是基于本地连接的回滚，连接断开会自动回滚，所以即使二阶段决议形成提交时，若应用或网络出问题，连接断开就自动回滚了，不能保证极端一致性。
Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

### 本周推荐阅读

- [少年五年升阿里 P8，他如何从低谷登上“光明顶”？](/blog/five-years-to-ali-p8/)
- [生产级高性能 Java RPC 框架 - SOFARPC 系列内容合辑](https://mp.weixin.qq.com/s/8BCpmAfdXxNd5-rSA70GFg)

### SOFA 项目进展

**本周发布详情如下：**

**1、发布 MOSN v0.15.0 版本，主要变更如下：**

- 新增 UDP Listener 的支持；
- 新增配置扩展能力，Dubbo 服务发现可通过扩展配置扩展，支持 Yaml 格式的配置解析；
- 新增流量镜像功能的扩展实现；
- 支持了更多路由配置；
- Skywalking 升级到 0.5.0 版本；
- 针对 Upstream 与 XProtocol 进行了优化与 Bug 修复；

详细发布报告：
[https://github.com/mosn/mosn/releases/tag/v0.15.0](https://github.com/mosn/mosn/releases/tag/v0.15.0)

同时，恭喜**邓茜（@dengqian）**成为 MOSN Committer，感谢她为 MOSN 社区所做的贡献。

**2、发布 SOFARPC v5.7.5 版本，主要变更如下：**

- 修复日志打印的问题；

详细发布报告：
[https://github.com/sofastack/sofa-rpc/releases/tag/v5.7.5](https://github.com/sofastack/sofa-rpc/releases/tag/v5.7.5)

### 社区活动报名

![GIAC](https://cdn.nlark.com/yuque/0/2020/png/226702/1596782702058-d6df6675-e00e-4aae-af5b-671ef1a368e2.png)

GIAC（GLOBAL INTERNET ARCHITECTURE CONFERENCE）是面向架构师、技术负责人及高端技术从业人员的年度技术架构大会，是中国地区规模最大的技术会议之一。**蚂蚁集团也受邀进行 CloudNative(云原生) 的主题分享。**

- **分享主题：云原生网络代理 MOSN 的进化之路**
- **分享嘉宾：**王发康（毅松）蚂蚁集团 可信原生技术部 技术专家
- **背景介绍：**网络通信代理 MOSN 在蚂蚁集团的 Service Mesh 大规模落地后，通过对接 UDPA 打造为 Istio 的数据面之一，增强 MOSN 服务治理及流量控制能力，对接云原生周边组件，实现 MOSN 开箱即用，MOSN 成为云原生 Service Mesh 的标准 Sidecar 之一，从而借力开源，反哺开源。
- **听众收益：**可快速基于 MOSN 和 Istio 进行 Service Mesh 实践，了解微服务的发展历程、遇到的痛点以及解决方案，获取 MOSN 的功能特性，解决微服务常见的问题。
- **分享时间**：2020-08-15 13:30-14:30
- **活动地点：**深圳
- **活动报名：**点击“[这里](http://giac.msup.com.cn/Giac/schedule/course?id=14579)”
