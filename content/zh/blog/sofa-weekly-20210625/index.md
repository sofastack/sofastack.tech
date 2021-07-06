---
title: "SOFA Weekly | QA 整理"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly | QA 整理"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2021-06-25T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*Ig-jSIUZWx0AAAAAAAAAAAAAARQnAQ"
---
SOFA WEEKLY | 每周精选，筛选每周精华问答
同步开源进展，欢迎留言互动
![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*ARgKS6SuU7YAAAAAAAAAAAAAARQnAQ)
SOFAStack（Scalable Open Financial Architecture Stack）是蚂蚁金服自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

SOFAStack 官网: [https://www.sofastack.tech](https://www.sofastack.tech/)

SOFAStack: [https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动

我们会筛选重点问题

通过 " SOFA WEEKLY " 的形式回复

1、@证道者 提问：

>应用调用端多语言可以，Layotto 服务能力是不是目前只能 golang 开发，java 可以开发服务能力集成到 Layotto 里吗？还有就是 Layotto 底座是 MOSN 可以不用这个吗？我目前有一个需要处理，就是数据库单表 crud，跨表的 crud，自己分页检索这个能力可以用 Layotto 吗？

A：如果想用别的语言给 Layotto 做扩展的话，目前感觉可行的方法就是借助 wasm，但具体的方案我们还得调研一下，目前是只能用 golang 开发。 至于你说的这个需求，可应该以作为 Layotto state API 的一种实现组件。

Layotto：[https://github.com/mosn/layotto](https://github.com/mosn/layotto)


2、@证道者 提问：

>目前提供 pub/sub 能力，流 stream 能力，状态能力，以后也会将一些通用的业务能力抽象下移到 Layotto 吗？我觉得有点像组件化，面向能力编程。

A：是的，主要就是希望业务同学可以面向能力编程，比如只需要考虑自己是否需要 pub/sub 能力就行，而不需要管背后是 kafka 还是 rocketMQ 之类的，我们目前在规划的有分布式锁、可观测性能力的下沉，其他的能力会参考社区的反馈。

Layotto：[https://github.com/mosn/layotto](https://github.com/mosn/layotto)

3、@证道者 提问：

>所有的都在 Layotto 里面跑，pubsub PRC 不会相互干扰吗?

A：你指的是资源使用上的互相争抢是吧，目前我们 Service Mesh 落地，Sidecar 也是集成的有 RPC 和 消息能力的，Sidecar 本身主要还是一个转发通道，本身资源占用还是极少的，目前生产上也没有因为同时 Run RPC 和 消息导致互相干扰的现象产生。在 Layotto 这也是类似的场景，大部分业务在单机维度很难跑到极限性能峰值，基本上不会有互相干扰的情况出现。

Layotto：[https://github.com/mosn/layotto](https://github.com/mosn/layotto)

### 本周推荐阅读

- [MOSN 子项目 Layotto：开启服务网格+应用运行时新篇章](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247488835&idx=1&sn=d645b9abc866048e679b56bfe3b72482&chksm=faa0fa99cdd7738ff1749ae75b1670f953c92b70dcf0358337977438fd74b632b21a7b17ece3&scene=21)

- [揭秘 AnolisOS 国密生态，想要看懂这一篇就够了](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247488577&idx=1&sn=172642c14cc511e27aa882ca7586a4c4&chksm=faa0fb9bcdd7728db0fdceec44b44bb93f36664cbb33e3c50e61fcc05dbc2647ff65dfcda3ee&scene=21)

- [蚂蚁云原生应用运行时的探索和实践 - ArchSummit 上海](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247488131&idx=1&sn=cd0b101c2db86b1d28e9f4fe07b0446e&chksm=faa0fd59cdd7744f14deeffd3939d386cff6cecdde512aa9ad00cef814c033355ac792001377&scene=21)

- [带你走进云原生技术：云原生开放运维体系探索和实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247488044&idx=1&sn=ef6300d4b451723aa5001cd3deb17fbc&chksm=faa0fdf6cdd774e03ccd9130099674720a81e7e109ecf810af147e08778c6582636769646490&scene=21)


更多文章请扫码关注“金融级分布式架构”公众号

>![](https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*s3UzR6VeQ6cAAAAAAAAAAAAAARQnAQ)
