---
title: "SOFA Weekly | QA 整理、SOFAStack&MOSN 新手任务"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly | QA 整理、SOFAStack&MOSN 新手任务"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2021-10-15T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*_ewiQbuzeOQAAAAAAAAAAAAAARQnAQ"
---

SOFA WEEKLY | 每周精选，筛选每周精华问答

同步开源进展，欢迎留言互动

>![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*_ewiQbuzeOQAAAAAAAAAAAAAARQnAQ)

SOFAStack（Scalable Open Financial Architecture Stack）是蚂蚁金服自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

SOFAStack 官网: [https://www.sofastack.tech](https://www.sofastack.tech/)

SOFAStack: [https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动

我们会筛选重点问题

通过 " SOFA WEEKLY " 的形式回复

**@崔伟协** 提问：

>我们的项目基于 MOSN，请问这里 panic了，要怎么解决？

[https://github.com/mosn/mosn/blob/master/pkg/proxy/downstream.go#L393-L399](https://github.com/mosn/mosn/blob/master/pkg/proxy/downstream.go#L393-L399)

A：有异常的时候可以直接返回一个异常的数据包，m.receiveHandler.SendHijackReply(api.SuccessCode, m.headers) 在 filter 里面可以直接返回一个包。

「MOSN」：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

**@玄灭** 提问：

>请问 MOSN 有计划支持 eureka 注册中心吗？

A：目前没有，欢迎 pr，有个 zk 的例子，实现起来也简单。

[https://www.github.com/mosn/mosn/tree/master/pkg%2Fupstream%2Fservicediscovery%2Fdubbod](https://www.github.com/mosn/mosn/tree/master/pkg%2Fupstream%2Fservicediscovery%2Fdubbod)

「MOSN」：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

**@张昊** 提问：

>仓库中 /jarslink-samples/spring-boot-transform-sample 对照文档启动后，telnet 中 install -b *ark-biz.jar，控制台报错，大家有遇到类似问题嘛？

A：这个项目不维护了，相关功能已经 merge 到 SOFAArk 里面去了，以后建议直接用 SOFAArk。

SOFAArk 有相关的适应样例：[https://github.com/sofastack-guides](https://github.com/sofastack-guides)

「SOFAArk」：[https://github.com/sofastack/sofa-ark](https://github.com/sofastack/sofa-ark)

**@春少** 提问：

>这一段逻辑，是为了避免在执行 add peer 的时候，出现 raft 选举的情况吗？

>![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*UKtPTJkE_qwAAAAAAAAAAAAAARQnAQ)

A：是的，所以这个时候就交给新的 leader 负责继续推进新的成员节点变更。

「SOFAJRaft」：[https://github.com/sofastack/sofa-jraft](https://github.com/sofastack/sofa-jraft)

### SOFAStack&MOSN : 新手任务计划

作为技术同学，你是否有过“想参与某个开源项目的开发、但是不知道从何下手”的感觉？

为了帮助大家更好的参与开源项目，SOFAStack 和 MOSN 社区会定期发布适合新手的新手开发任务，帮助大家 learning by doing!

**Layotto**

-Easy

为 Layotto 中的关键模块添加注释（例如限流/分布式锁等模块）

添加 nodejs sdk

-Medium

用某种存储实现 File API 组件（例如本地文件系统、hdfs、ftp 等）

升级由 rust 开发的 wasm demo

升级由 AssemblyScript 开发的 wasm demo

**详见：**
[https://github.com/mosn/layotto/issues/108#issuecomment-872779356](https://github.com/mosn/layotto/issues/108#issuecomment-872779356)

另外最近更新了社区晋升规则，大家贡献 pr 后只要满足条件即可晋升，成为社区的维护者之一。

**详见：**
[https://mosn.io/layotto/#/zh/community/promote](https://mosn.io/layotto/#/zh/community/promote)

### 本周推荐阅读

- [蚂蚁集团技术风险代码化平台实践（MaaS）](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247495808&idx=1&sn=88246170520e1e3942f069a559200ea4&chksm=faa31f5acdd4964c877ccf2a5ef27e3c9acd104787341e43b2d4c01bed01c91f310262fb0ec4&scene=21)

- [攀登规模化的高峰 - 蚂蚁集团大规模 Sigma 集群 ApiServer 优化实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247495694&idx=1&sn=0e2d5b03ac7320e8d1bcca3d547fdee8&chksm=faa31fd4cdd496c2d646e1c651b601fab83acfb5f4361ca340cde0b029b78e9c894ccb094107&scene=21)

- [MOSN 子项目 Layotto：开启服务网格+应用运行时新篇章](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247488835&idx=1&sn=d645b9abc866048e679b56bfe3b72482&chksm=faa0fa99cdd7738ff1749ae75b1670f953c92b70dcf0358337977438fd74b632b21a7b17ece3&scene=21#wechat_redirect)

>![weekly.jpg](https://gw.alipayobjects.com/zos/bmw-prod/337fd10f-76f2-4e08-b25f-3d23e3510cb9.webp)
