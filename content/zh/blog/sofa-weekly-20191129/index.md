---
title: "SOFA Weekly | 每周精选【11/25 - 11/29】"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2019-11-29T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563524226806-e93607a3-1b77-4ca2-8c3c-0384ab966154.png"
---

**SOFA WEEKLY | 每周精选，筛选每周精华问答**
**同步开源进展，欢迎留言互动**

![weekly.jpg](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1562925824761-fc720f21-9622-437b-a783-0b0729eda119.jpeg)

SOFAStack（Scalable Open Financial Architecture Stack）是蚂蚁金服自主研发的金融级分布式架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

**SOFAStack 官网: **[https://www.sofastack.tech](https://www.sofastack.tech/)

**SOFAStack: **[https://github.com/sofastack](https://github.com/sofastack)

### 社区 Big News

**NO.1 社区新认证一位 Committer**

**Github ID **[**@zongtanghu**](https://github.com/zongtanghu) 成为 SOFAJRaft Committer：

主要贡献：

1. 贡献了两个重要 Feature：
- 基于优先级配置的自动选举；
- 为 Replicator 日志复制实现 ReplicatorStateListener 监听器；
2. 添加一些优化功能和 Bugfix：
- 优化 SOFAJRaft 的工具类，减少冗余代码，增加单元测试用例代码；
- 优化常量类，实现 Copiable 接口；
3. 原创文章贡献
- 《[SOFAJRaft Snapshot 原理剖析 | SOFAJRaft 实现原理](/blog/sofa-jraft-snapshot-principle-analysis/)》;
- 《[中国移动苏州研发中心消息队列高可用设计之谈 | SOFAStack 用户说](/blog/sofa-jraft-user-china-mobile/)》;

目前，社区已经认证超过四十位 Committer。

感谢对 SOFAStack 的支持和帮助，也欢迎你加入 SOFAStack community~
SOFAStack 社区：[https://www.sofastack.tech/awesome/](/awesome/)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动
我们会筛选重点问题通过 " SOFA WEEKLY " 的形式回复

**@kaka19ace** 提问：

> 为什么 MOSN 热重启机制需要新老进程，两个 unix domain socket server 通信交互?
> 目前分为 旧进程 reconfigerServer 新进程 transferServer,
> 1. reconfigerServer 只是新进程主动判断 isReconfigure() 就结束了连接；
> 1. 迁移 listener fd 以及 connection fd 让旧进程作为 client 角色；
> 
> 如果仅使用 reconfigerServer 作为交互通信会存在哪些问题？

A：你的意思就是旧进程 reconfigerServer在收到 isReconfigure() 后，直接传输旧进程的fd给新进程。原理上也是可以的。这儿其实有个历史原因，最开始支持信号 fork 子进程的方式，是不需要 isReconfigure() 来判断是否存在旧进程的，通过环境变量就可以了，后来为了支持容器升级的方式，单独启一个新的进程，才需要一个机制来判断是否存在旧进程，为了改动更小，之前的逻辑不受影响，才加了这个新的 us 来通讯。

> 翻了老版本代码阅读：
> reconfigure 这块是基于环境变量设置 fd. fork exec 参数使用 sys.ProcAttr 继承 fd 信息。
> 这块有一个问题确认，老版本场景里如果升级新版的二进制文件，也是基于同目录下替换了相同的 bin 文件，然后再给老进程 hup 信号触发重启吧？

A：是的，老版本是发送 hup 信号，然后 fork 一个子进程来做二进制升级，这个适用于虚拟机升级。而基于容器的话，是重新拉起一个容器，一个新的进程，就需要跟老的进程来交互。

> 早期版本和 Envoy uds 迁移方式不同，当时设计是有什么考虑吗？后续基于 SCM_RIGHTS 传输 fd 方式与 Envoy 类似，这块重构原因有哪些?想了解代码演进的过程。

A：你看到代码是 listen fd 的迁移，和 Envoy 最大的不同是我们会把存量的长链接也做迁移。
代码演进是：
第一阶段， 只支持 listen fd 的迁移。
第二阶段， 支持存量长链接的迁移，hup 信号，然后 fork 的方式。
第三阶段， 支持容器间存量长链接的迁移，通过 uds 查找子进程。

> 非常感谢丰富的演进说明。重新拉起容器这块不太明白，对 Envoy 的场景理解：
> - 热重启是同一个容器内，Sidecar 新老进程的交接，业务进程继续运行；
> - Sidecar 进程管理是由 pilot-agent 进行管理，当前容器内 agent 发送热重启信号，非重新拉起容器；
> 
> MOSN 这里指的是拉起新容器, 容器间迁移数据？uds 的路径是挂载盘?

A：Envoy 的方式不能用镜像来管理二进制了。MOSN 除了支持 Envoy 这种容器内热升级，也支持容器间。MOSN 会拉起新容器，然后做容器间的连接迁移，uds 的路径是共享卷，2个 container 共享。

> 容器间迁移是否和业务场景有关，为何不是让旧容器自己销毁（摘掉服务发现, 并延迟一段时间自己销毁）？

A：是的，就是为了 Sidecar 的发布对用户无感知，连接不断，升级 Sidecar 的时候服务也一直在运行。
MOSN：[https://github.com/sofastack/sofa-mosn](https://github.com/sofastack/sofa-mosn)

### 双十一落地实践特辑阅读

- [蚂蚁金服 Service Mesh 大规模落地系列 - 运维篇](/blog/service-mesh-practice-in-production-at-ant-financial-part3-operation/)
- [蚂蚁金服 Service Mesh 大规模落地系列 - 消息篇](/blog/service-mesh-practice-in-production-at-ant-financial-part2-mesh/)
- [蚂蚁金服 Service Mesh 大规模落地系列 - 核心篇](/blog/service-mesh-practice-in-production-at-ant-financial-part1-core/)
- [Service Mesh 落地负责人亲述：蚂蚁金服双十一四大考题](/blog/service-mesh-practice-antfinal-shopping-festival-big-exam/)

###  SOFA 项目进展

**本周发布详情如下：**

**1、发布 SOFAJRaft v1.3.0 版本，主要变更如下：**

- 新增 Read-only member(learner) 角色，支持 learner 节点上的线性一致读
- 实现优先级选举
- 在 multi-raft-group 的场景中，随机打散每个 group 的第一次 snapshot timeout 时间，避免一个进程内多个 group 同时 snapshot
- RheaKV 实现 snapshot checksum 以及异步 snapshot
- 致谢（排名不分先后）：[@zongtanghu](https://github.com/zongtanghu)  [@devYun](https://github.com/devYun)  [@masaimu](https://github.com/masaimu)  [@SteNicholas](https://github.com/SteNicholas)  [@yetingsky](https://github.com/yetingsky)

详细发布报告：
[https://github.com/sofastack/sofa-jraft/issues/362](https://github.com/sofastack/sofa-jraft/issues/362)

### 社区活动

#### 回顾

11月24日 Kubernetes & Cloud Native X Service Mesh Meetup 活动回顾：

- [蚂蚁金服 Service Mesh 大规模落地系列 - RPC 篇](/blog/service-mesh-practice-in-production-at-ant-financial-part4-rpc/)（文末含分享视频回顾以及 PPT 查看地址）

#### 预告

![Channel#9.jpg](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1574412687312-ce69fdbb-7b44-40b4-ab34-f02be89dbc37.jpeg)

Service Mesh 是蚂蚁金服下一代架构的核心，本期直播主要分享在蚂蚁金服当前的体量下，我们如何做到在奔跑的火车上换轮子，将现有的 SOA 体系快速演进至 Service Mesh 架构。**分享蚂蚁金服双十一核心应用如何将现有的微服务体系平滑过渡到 Service Mesh 架构下并降低大促成本**，并从核心、RPC、消息等模块展开分享本次双十一落地实践的实现细节。

你将收获：

- 蚂蚁金服 Service Mesh 架构双十一大规模落地实践案例分析；
- 从核心、RPC、消息等模块分享蚂蚁金服 Service Mesh 落地实践细节；

时间：2019年12月5日（周四）19:00-20:00

形式：线上直播

报名方式：点击“[这里](https://tech.antfin.com/community/live/1021)”即可报名