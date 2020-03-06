---
title: "SOFA Weekly | SOFARegistry 发版以及源码系列合辑、SOFAArk 发版、3/12直播预告"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2020-03-06T16:00:00+08:00
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

**1、@水木今山** 提问：

> 请问下 SOFAJRaft 能否在日志复制到大多数后就响应客户端？我看 rhea 和 counter 的例子好像都是应用到状态机后才通过 closure 响应客户端。

A：SOFAJRaft 没有限制，可以在自己的 statemachine 里不直接返回客户端再应用， rheakv 不能。举个例子， compareAndSet 操作，需要先读取再设置，最后返回 client，那么怎么能做到不应用状态机就返回呢，对吧？

> 有道理，但直接返回客户端的逻辑只能在 StateMachine 提供的 onApply 方法里实现吗，因为 onApply 的调用应该会滞后许久吧？

A：onApply 里面实现就可以，onApply 就可以理解为和达成多数派之间没有延迟。

> 我在文档中有看到 TaskClosure 这么一个接口，在它的 onCommitted 方法里响应客户端会不会更高效？据我所知，raft 仅需写入日志就可保证强一致性，可以异步去 apply，所以在复制日志给大多数后就通过 onCommitted方法响应客户端（尽管还没有任何一个节点 apply 了该日志），这样效率好像会高一点，不知道我对这个接口理解有没有误。

A：com.alipay.sofa.jraft.core.FSMCallerImpl#doCommitted

可以看看这个方法，里面会在调用状态机之前调用 TaskClosure，想用 TaskClosure 也可以，不过两者没什么延迟区别。

SOFAJRaft：[https://github.com/sofastack/sofa-jraft](https://github.com/sofastack/sofa-jraft)

2、**@匿名** 提问：

> MOSN 支持 Istio 的什么版本？什么时候可以在 Istio 中可用？

A：目前 MOSN 可基于 Istio 1.1.4 跑通 bookinfo example，由于最新版本的 Istio 对 XDS 协议进行了升级以及部分能力增强，MOSN 当前正在适配中，预计 2020 年 10 月份会完整支持高版本 Istio 的 HTTP 系能力；同时我们一直在关注 UDPA 的发展，也在尝试参与到标准的制定中。控制平面方面，我们和社区一直保持紧密沟通与合作，大力发展控制平面，MOSN 也将与控制平面共同前进。

MOSN：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

**3、@孙俊** 提问：

> 请问下，全局事务开启后，全局事务锁未释放时，此时又来个操作同一个数据的本地请求，这个请求没有开启全局事务，是可以修改这个数据的呀。

A：全局事务的分支事务结束后，不在全局事务的本地数据请求可修改数据。

> 那这样，全局事务的其他分支出现异常，分支事务回滚，从undo里读，发现数据已经被修改了，就得人工处理了？

A：是，从业务设计上来说如果使用 AT 模式要把数据修改都交给 AT 来管理来避免这类问题。
Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

### 剖析 SOFARegistry 系列

- [服务注册中心数据一致性方案分析 | SOFARegistry 解析](/blog/sofa-registry-data-consistency/)
- [服务注册中心如何实现秒级服务上下线通知 | SOFARegistry 解析](/blog/sofa-registry-service-offline-notification/)
- [服务注册中心 Session 存储策略 | SOFARegistry 解析](/blog/sofa-registry-session-storage/)
- [服务注册中心数据分片和同步方案详解 | SOFARegistry 解析](/blog/sofa-registry-data-fragmentation-synchronization-scheme/)
- [服务注册中心 MetaServer 功能介绍和实现剖析 | SOFARegistry 解析](/blog/sofa-registry-metaserver-function-introduction/)
- [服务注册中心 SOFARegistry 解析 | 服务发现优化之路](/blog/sofa-registry-service-discovery-optimization/)
- [海量数据下的注册中心 - SOFARegistry 架构介绍](/blog/sofa-registry-introduction/)

### SOFA 项目进展

**1、发布 SOFARegistry v5.4.0 版本，主要变更如下：**

- SessionServer 与 DataServer 通讯性能优化；
- jraft 从 1.2.5 更新到 1.2.7.beta1；
- 解决 MethodHandle 在某些 jdk 版本存在内存泄露的 bug；
- Bug Fix；

详细发布报告：[https://github.com/sofastack/sofa-registry/releases/tag/v5.4.0](https://github.com/sofastack/sofa-registry/releases/tag/v5.4.0)

**2、发布 SOFAArk v1.1.1 版本，主要变更如下：**

- 优化biz 卸载，清理临时文件；
- 支持 biz 打包 指定 bizName -D 参数；

详细发布报告：[https://github.com/sofastack/sofa-ark/releases/tag/v1.1.1](https://github.com/sofastack/sofa-ark/releases/tag/v1.1.1)

### 社区直播预告

![SOFAChannel#12](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1581670095015-cc3cc59c-6f09-43fb-87c2-ce115f0c22a6.jpeg)

SOFAChannel#12 线上直播将邀请蚂蚁金服分布式事务核心开发仁空分享介绍蚂蚁金服内部的分布式事务实践，包括 TCC（Try-Confirm-Cancel） 模式以及 FMT （Framework-Managerment-Transaction，框架管理事务）模式。同时也会与大家分享在面对双十一大促这种世界级的流量洪峰前，我们又是如何应对这个挑战。

**主题**：SOFAChannel#12：蚂蚁金服分布式事务实践解析

**时间**：2020年3月12日（周四）19:00-20:00

**嘉宾**：仁空，蚂蚁金服分布式事务核心开发

**形式**：线上直播

**报名方式**：点击“[这里](https://tech.antfin.com/community/live/1119)”，即可报名
