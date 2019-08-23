---
title: "SOFA Weekly | 每周精选【8/19 - 8/23】"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2019-08-23T15:00:00+08:00
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

**1、@廖春涛** 提问：

> 在 SOFAJRaft 中，snapshot load 后应该会有个日志重放的实现，但是我目前看代码没看到说 snapshot 和 LogEntry 有关联的地方，请问是什么关系呢？

A：snapshot 就是为了压缩日志，以及加快新节点加入。snapshot 后，会将上上次的 snapshot 当时对应的日志级之前的删掉，为什么是上上次？ 因为本次 snapshot 的日志，可能还没有复制到所有 follower，这是一个小优化。 具体到日志重放，如果启动是 leader，会写入一条当前配置的日志，触发 fsm caller 的 onCommitted，然后去重放从 snapshot 的日志到最新的 committed 的日志到状态机。如果是 follower，安装 snapshot 后， leader 会发送该 snapshot 对应的日志之后的日志，走正常的复制流程，因此也会重放到最新的状态机。

> SOFAJRaft 当 Leader 的 Node 执行 apply 后，将 LogEntry 提交给 follower 是通过通知来进行的吗？是不是在 LogManagerImpl 里面的这串代码
> ![代码](https://cdn.nlark.com/yuque/0/2019/png/226702/1566538533659-6904a8f2-72e2-497a-b3cc-dcdc09f77c7e.png)

A：这段是 wakeup replicators，复制日志到 follower 都是在 Replicator 中实现的。

**2、关于 Seata 的 grouplist 问题：**

> 什么时候会用到 file.conf 中的 default.grouplist？

A：当 registry.type=file 时会用到，其他时候不读。

>  default.grouplist 的值列表是否可以配置多个？

A：可以配置多个，配置多个意味着集群，但当 store.mode=file 时，会报错。原因是在 file 存储模式下未提供本地文件的同步，所以需要使用 store.mode=db，通过 db 来共享 TC 集群间数据

> 是否推荐使用 default.grouplist？

A：不推荐，如问题1，当 registry.type=file 时会用到，也就是说这里用的不是真正的注册中心，不具体服务的健康检查机制当tc不可用时无法自动剔除列表，推荐使用 nacos 、eureka、redis、zk、consul、etcd3、sofa。registry.type=file 或 config.type=file 设计的初衷是让用户再不依赖第三方注册中心或配置中心的前提下，通过直连的方式，快速验证 Seata 服务。

**3、关于 Seata 事务分组：**

> 什么是事务分组？

A：事务分组是 Seata 的资源逻辑，类似于服务实例。在 file.conf 中的 my_test_tx_group 就是一个事务分组。

> 通过事务分组如何找到后端集群？

A：首先程序中配置了事务分组（GlobalTransactionScanner 构造方法的 txServiceGroup 参数），程序会通过用户配置的配置中心去寻找 service.vgroup_mapping. 事务分组配置项，取得配置项的值就是 TC 集群的名称。拿到集群名称程序通过一定的前后缀+集群名称去构造服务名，各配置中心的服务名实现不同。拿到服务名去相应的注册中心去拉取相应服务名的服务列表，获得后端真实的 TC 服务列表。

> 为什么这么设计，不直接取服务名？

A：这里多了一层获取事务分组到映射集群的配置。这样设计后，事务分组可以作为资源的逻辑隔离单位，当发生故障时可以快速 failover。

### SOFA 项目进展

**本周发布详情如下：**

**1、发布 Seata v0.8.0 版本，主要变更如下：**

- 支持 oracle 数据库的 AT 模式
- 支持 oracle 数据库的批量操作
- 支持 undo_log 表名可配置
- 修复 xid 在 db 模式可重复的问题
- 优化数据镜像比对日志

详细参考发布报告：[https://github.com/seata/seata/releases/tag/v0.8.0](https://github.com/seata/seata/releases/tag/v0.8.0)

**2、发布 SOFAARK v1.0.0 版本，主要变更如下：**

- 支持插件批量导出资源和 ark-biz 禁止批量导入资源
- 支持指定版本调用，解决对于非激活状态的ark-biz服务访问问题（主要用于灰度验证，测试等）
- 支持打包时跳过打ark-executable 包的过程（优化）
- 支持从目录运行启动
- ArkClient api 支持指定 biz 的 arguments 参数
- 使用 netty 代替 java NIO 实现 telnet server
- 支持 SpringBoot testNG
- 优化示例工程
- 
详细发布报告：[https://github.com/sofastack/sofa-ark/releases/tag/v1.0.0](https://github.com/sofastack/sofa-ark/releases/tag/v1.0.0)

### SOFA 活动推荐

![SOFAChannel#8](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1566539399803-59889fa9-823a-4916-ab1f-42a32e8d53ef.jpeg)

<SOFA:Channel/>线上直播第 8 期报名中~
8 月 29 日周四晚 7 点，将邀请 SOFAJRaft 开源负责人力鲲，从一个 SOFAJRaft 实例出发，带大家体验 SOFAJRaft 的应用。

- **本期主题**：SOFAChannel#8：**从一个例子开始体验 SOFAJRaft**
**直播时间**：8 月 29 日下周四晚 7点
- **你将收获**：
  - 如何使用 SOFAJRaft 实现自己的分布式应用
  - 基于实例理解 SOFAJRaft 中的概念和术语
- **报名方式**：点击“[**这里**](https://tech.antfin.com/community/live/821)**”**
- **欢迎加入直播互动钉钉群**：23390449（搜索群号加入即可）