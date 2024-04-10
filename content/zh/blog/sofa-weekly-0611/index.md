---
title: "SOFA Weekly | QA 整理"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly | QA 整理"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2021-06-11T15:00:00+08:00
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

1、@孙军超 提问：

> 实际项目中，怎么动态的配置 # 集群列表中所有节点的地址列表 initialServerList: 127.0.0.1:8181,127.0.0.1:8182,127.0.0.1:8183 比如加一个节点 这个列表怎么自动刷新 。

A：通过 CliService 动态增上改节点。

SOFAJraft：[https://github.com/sofastack/sofa-jraft](https://github.com/sofastack/sofa-jraft)


2、@王国鑫 提问：

> 请教一下，其中一个 follow 机器，在状态机 onApply 里执行任务，有一些异常，这个异常状态如何上报给 leader？

A：异常分两种，跟上不上报 leader 没什么关系，也不需要上报 leader。leader 只负责感知对应 follower 能不能跟上 raft log， 不论 raft 还是 paxos，都可以理解为分布式日志状态机，你这个异常是你自己的业务状态机里的事情了，raft 只保证 raft log 一致，你自己需要保证相同的 raft log 你要产生相同的结果。

SOFAJraft：[https://github.com/sofastack/sofa-jraft](https://github.com/sofastack/sofa-jraft)

3、@陈泽胜 提问：

> 我想问一下我这个是什么问题？
>![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*thKoRKrD4FQAAAAAAAAAAAAAARQnAQ)
>这是偶发的，两三天会出现一次，有时候一小时内会出现多次。

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

### 本周推荐阅读

- [揭秘 AnolisOS 国密生态，想要看懂这一篇就够了](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247488577&idx=1&sn=172642c14cc511e27aa882ca7586a4c4&chksm=faa0fb9bcdd7728db0fdceec44b44bb93f36664cbb33e3c50e61fcc05dbc2647ff65dfcda3ee&scene=21)

- [助力数据安全：蚂蚁携手英特尔共同打造验证 PPML 解决方案](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247488532&idx=1&sn=11952dbe5c4483a16ce806f3dc636802&chksm=faa0fbcecdd772d859405491fdaf8260d17d9549bff3206840c68b96b248531d789993c85942&scene=21)


- [蚂蚁云原生应用运行时的探索和实践 - ArchSummit 上海](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247488131&idx=1&sn=cd0b101c2db86b1d28e9f4fe07b0446e&chksm=faa0fd59cdd7744f14deeffd3939d386cff6cecdde512aa9ad00cef814c033355ac792001377&scene=21)

- [带你走进云原生技术：云原生开放运维体系探索和实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247488044&idx=1&sn=ef6300d4b451723aa5001cd3deb17fbc&chksm=faa0fdf6cdd774e03ccd9130099674720a81e7e109ecf810af147e08778c6582636769646490&scene=21)


更多文章请扫码关注“金融级分布式架构”公众号

> ![](https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*s3UzR6VeQ6cAAAAAAAAAAAAAARQnAQ)
