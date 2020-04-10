---
title: "SOFA Weekly | SOFATracer 直播预告、SOFARegistry 解析系列合集、线上直播回顾合集"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2020-04-10T17:00:00+08:00
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


**1、@熊胜 提问：**

> 请教个问题，biz 卸载中的关闭 ApplicationContext 这一步是哪里处理的呢？我在 com.alipay.sofa.ark.container.model.BizModel#stop 方法中没看到相应的实现。

A： biz stop 会发出一个事件，这个时间会被 runtime 拿到处理，可以看下 sofa-boot runtime 里面有处理 biz 卸载事件的 handler。

SOFAArk：[https://github.com/sofastack/sofa-ark](https://github.com/sofastack/sofa-ark)

**2、@揭印泉 提问：**

> 请问 registry.conf 中的 registry 作用是向 Seata 服务器注册分支事务？

A：registry 是注册中心，seata server 和 client 都需要的，server 往注册中心注册服务，client 往注册中心找寻 server 服务。

> seata server 和 client 是共用 nacos-config.sh 脚本跑到 Nacos 配置？  如果他们都配置了 Nacos。

A：随你，你也可以分开，配置中心没约束，你可以 server 用 nacos，client 用 file，只要读取到即可。

> 服务器端配置了 store.mode="db",   启动参数需要加参数：-m db  ?

A：可以不加，优先级启动参数>配置。

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

### SOFARegistryLab 系列阅读

- [服务注册中心如何实现 DataServer 平滑扩缩容 | SOFARegistry 解析](/blog/sofa-registry-dataserver-smooth-expansion-contraction/)
- [服务注册中心数据一致性方案分析 | SOFARegistry 解析](/blog/sofa-registry-data-consistency/)
- [服务注册中心如何实现秒级服务上下线通知 | SOFARegistry 解析](/blog/sofa-registry-service-offline-notification/)
- [服务注册中心 Session 存储策略 | SOFARegistry 解析](/blog/sofa-registry-session-storage/)
- [服务注册中心数据分片和同步方案详解 | SOFARegistry 解析](/blog/sofa-registry-data-fragmentation-synchronization-scheme/)
- [服务注册中心 MetaServer 功能介绍和实现剖析 | SOFARegistry 解析](/blog/sofa-registry-metaserver-function-introduction/)
- [服务注册中心 SOFARegistry 解析 | 服务发现优化之路](/blog/sofa-registry-service-discovery-optimization/)
- [海量数据下的注册中心 - SOFARegistry 架构介绍](/blog/sofa-registry-introduction/)

### SOFAChannel 线上直播合集

- SOFAChannel#14：[云原生网络代理 MOSN 扩展机制解析 | SOFAChannel#14 直播整理](/blog/sofa-channel-14-retrospect/)
- SOFAChannel#13：[云原生网络代理 MOSN 多协议机制解析 | SOFAChannel#13 直播整理](/blog/sofa-channel-13-retrospect/)
- SOFAChannel#12：[蚂蚁金服分布式事务实践解析 | SOFAChannel#12 直播整理](/blog/sofa-channel-12-retrospect/)
- SOFAChannel#11：[从一个例子开始体验轻量级类隔离容器 SOFAArk | SOFAChannel#11 直播整理](/blog/sofa-channel-11-retrospect/)
- SOFAChannel#10：[Seata 长事务解决方案 Saga 模式 | SOFAChannel#10 回顾](/blog/sofa-channel-10-retrospect/)
- SOFAChannel#9：[Service Mesh 落地负责人亲述：蚂蚁金服双十一四大考题 | SOFAChannel#9 回顾](/blog/service-mesh-practice-antfinal-shopping-festival-big-exam/)
- SOFAChannel#8：[从一个例子开始体验 SOFAJRaft | SOFAChannel#8 直播整理](/blog/sofa-channel-8-retrospect/)
- SOFAChannel#7：[自定义资源 CAFEDeployment 的背景、实现和演进 | SOFAChannel#7 直播整理](/blog/sofa-channel-7-retrospect/)
- SOFAChannel#6：[蚂蚁金服轻量级监控分析系统解析 | SOFAChannel#6 直播整理](/blog/sofa-channel-6-retrospect/)
- SOFAChannel#5：[给研发工程师的代码质量利器 | SOFAChannel#5 直播整理](/blog/sofa-channel-5-retrospect/)
- SOFAChannel#4：[分布式事务 Seata TCC 模式深度解析 | SOFAChannel#4 直播整理](/blog/sofa-channel-4-retrospect/)
- SOFAChannel#3：[SOFARPC 性能优化实践（下）| SOFAChannel#3 直播整理](/blog/sofa-channel-3-retrospect/)
- SOFAChannel#2：[SOFARPC 性能优化实践（上）| SOFAChannel#2 直播整理](/blog/sofa-channel-2-retrospect/)
- SOFAChannel#1：[从蚂蚁金服微服务实践谈起 | SOFAChannel#1 直播整理](/blog/sofa-channel-1-retrospect/)

### SOFA 项目进展

**本周发布详情如下：**

**发布 SOFATracer v3.0.12 版本，主要变更如下：**

- 2个 Dubbo 插件融合, 新的用户请直接使用 sofa-tracer-dubbo-common-plugin；
- 修复 Dubbo 插件传递错误 spanId 的问题；

详细发布报告：
[https://github.com/sofastack/sofa-tracer/releases/tag/v3.0.12](https://github.com/sofastack/sofa-tracer/releases/tag/v3.0.12)

### 社区直播报名

![SOFAChannel#15](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1586514943305-3516609c-05db-4f69-b513-ae658173484c.jpeg)

SOFATracer 是蚂蚁金服开源的基于 OpenTracing 规范 的分布式链路跟踪系统，其核心理念就是通过一个全局的 TraceId 将分布在各个服务节点上的同一次请求串联起来。通过统一的 TraceId 将调用链路中的各种网络调用情况以日志的方式记录下来同时也提供远程汇报到 Zipkin 进行展示的能力，以此达到透视化网络调用的目的。

本期直播将通过具体 Demo 带你快速上手 SOFATracer，同时将介绍 SOFATracer 具体功能，并详细介绍其核心关键「埋点机制」的原理。

- 主题：SOFAChannel#15：分布式链路组件 SOFATracer 埋点机制解析
- 时间：2020年4月23日（周四）19:00-20:00
- 嘉宾：卫恒 SOFATracer 开源负责人
- 形式：线上直播
- 报名方式：点击“[这里](https://tech.antfin.com/community/live/1167)”，即可报名
