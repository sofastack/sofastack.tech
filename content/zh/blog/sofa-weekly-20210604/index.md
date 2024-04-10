---
title: "SOFA Weekly |MOSN 发布新版本，QA 整理"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly | MOSN 发布新版本，QA 整理"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2021-06-04T15:00:00+08:00
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

1、@郭晶晶 提问：

> 蚂蚁内部的 SOFAMesh 对 Istio 的 pilot 进行了哪些扩展？是不是内部的 SOFAMesh 才支持 zk 注册中心。

A：蚂蚁内部用的注册中心是 [https://github.com/sofastack/sofa-registry](https://github.com/sofastack/sofa-registry) 在服务发现这块是有跟 SOFARegistry 做对接，内部的模块更多还是适应内部的各种配套设置和架构做的一些定制。

MOSN：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

2、@王庆振 提问：

> [https://github.com/sofastack/sofa-bolt/issuse/257](https://github.com/sofastack/sofa-bolt/issuse/257)
Connection 对象不应该是对应一个 poolkey（ip:port）吗？为什么 Connection 中还会持有 poolkey 的集合

A：这个是因为 Bolt 还要服务消息中间件的，消息这边有一个 Connection 对应多个上层对象的场景，poolKey 不是 ip:port 的形式。

SOFABolt：[https://github.com/sofastack/sofa-bolt](SOFABolt：https://github.com/sofastack/sofa-bolt)

3、@jueming 提问：

> 这一步如果抛出异常，那么是不是不会释放 connection 连接？导致长期占有数据库连接。
> ![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*zVudSLWTnlYAAAAAAAAAAAAAARQnAQ)

A: 会释放，close 是框架层面出现异常自动就会调，如果你自己写 jdbc，你也肯定捕获一次做 rollback close 了，这属于框架和业务上的处理，Seata 只不过把异常抛出去。

Seata：[https://github.com/seata/seata](Seata：https://github.com/seata/seata)


### 本周推荐阅读

- [助力数据安全：蚂蚁携手英特尔共同打造验证 PPML 解决方案](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247488532&idx=1&sn=11952dbe5c4483a16ce806f3dc636802&chksm=faa0fbcecdd772d859405491fdaf8260d17d9549bff3206840c68b96b248531d789993c85942&scene=21)

- [用安全计算保护关键业务](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247488532&idx=2&sn=db66969566704cf14c8e604632c2026c&chksm=faa0fbcecdd772d89f06ddd61b66fa746c983522e72610b66cf8a6440861788eaeef8b91598a&scene=21)


- [蚂蚁云原生应用运行时的探索和实践 - ArchSummit 上海](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247488131&idx=1&sn=cd0b101c2db86b1d28e9f4fe07b0446e&chksm=faa0fd59cdd7744f14deeffd3939d386cff6cecdde512aa9ad00cef814c033355ac792001377&scene=21)

- [带你走进云原生技术：云原生开放运维体系探索和实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247488044&idx=1&sn=ef6300d4b451723aa5001cd3deb17fbc&chksm=faa0fdf6cdd774e03ccd9130099674720a81e7e109ecf810af147e08778c6582636769646490&scene=21)

### 本周发布

**本周发布详情如下**：

**本周发布 MOSN v0.23.0 版本，主要变更如下**：
1.新增基于 networkfilter 的 grpc server 扩展实现能力；

2.新增 TLS 连接的证书缓存，降低内存占用；

3.修复 HTTP1 协议的 URL 编码与大小写敏感问题；

4.新增 so plugin 扩展协议实现的示例；

5.其他 BUG Fix 与优化。

详细发布报告：
[https://github.com/mosn/mosn/releases/tag/v0.23.0](https://github.com/mosn/mosn/releases/tag/v0.23.0)

更多文章请扫码关注“金融级分布式架构”公众号

> ![](https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*s3UzR6VeQ6cAAAAAAAAAAAAAARQnAQ)
