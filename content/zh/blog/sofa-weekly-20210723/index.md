---
title: "SOFA Weekly | QA 整理"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly | QA 整理"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2021-07-23T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ"
---
SOFA WEEKLY | 每周精选，筛选每周精华问答
同步开源进展，欢迎留言互动
![weekly.jpg](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ)
SOFAStack（Scalable Open Financial Architecture Stack）是蚂蚁金服自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

SOFAStack 官网: [https://www.sofastack.tech](https://www.sofastack.tech/)

SOFAStack: [https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动

我们会筛选重点问题

通过 " SOFA WEEKLY " 的形式回复

1、@王辉 提问：

> SOFARegistry 的 data 节点，连接 meta 节点，为什么设计成随机选择一个节点连接，如果 meta 节点 3 个节点，其中有一个节点挂了，而 data 节点又随机选择到这个挂的节点，就启动失败了。

A：通过 slb 查询到主节点，然后所有的 session 和 data 都连接 meta 主节点。不是随机连接一个 meta。

SOFARegistry：[https://github.com/sofastack/sofa-registry](https://github.com/sofastack/sofa-registry)

2、@刚刚 提问：

> SOFARPC 是通过 MOSN 转发协议？SOFARPC 对外注册的 IP 在 k8 的容器是什么策略？

A：MOSN 支持 SOFARPC 协议的转发。服务发布订阅没有做啥特殊的，就和原来是一样的。

MOSN：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

3、@证道者 提问：

> Layotto 中 wasm 是怎么设置 cpu 和内存的？

A：目前官方提供的 Wasm 运行时还不支持对 cpu 内存等资源进行限制，不过我们已经在跟 WasmEdge 社区沟通了，他们是可以支持这种场景的，所以后面同时会支持 WasmEdge 作为 Layotto 的 Wasm 运行时。

Layotto：[https://github.com/mosn/layotto](https://github.com/mosn/layotto)

3、@Q 提问：

> 两个 tc 节点，就有两套 global，branch，lock 表，当一个事物的调用链中，不同的 rm 连接的是不同的 tc 节点时，是不是会在各自 tc 的 branch 表里生成分支事物啊，这个时候怎么保证一致性呢？

A：tc 集群无状态的，共用一套 db 数据。

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

### 本周推荐阅读

- [RFC8998+BabaSSL---让国密驶向更远的星辰大海](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247490428&idx=1&sn=8ca31baa5c99e0790cdee8a075a7c046&chksm=faa0f4a6cdd77db07f3fb1149b7f6505fe6b8eca5b2e2a724960aee76d9667e3e970c44eef5a&token=1804015466)

- [还在为多集群管理烦恼吗？OCM 来啦！](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247490574&idx=1&sn=791b8d49759131ea1feb5393e1b51e7c&chksm=faa0f3d4cdd77ac2316b179a24b7c3ac90a08d3768379795d97c18b14a9c69e4b82012c3c097&token=1804015466)

- [MOSN 子项目 Layotto：开启服务网格+应用运行时新篇章](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247488835&idx=1&sn=d645b9abc866048e679b56bfe3b72482&chksm=faa0fa99cdd7738ff1749ae75b1670f953c92b70dcf0358337977438fd74b632b21a7b17ece3&scene=21)

- [开启云原生 MOSN 新篇章 — 融合 Envoy 和 GoLang 生态](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247490185&idx=1&sn=cfc301e20a1ae5d0754fab3f05ea094a&chksm=faa0f553cdd77c450bf3c8e34cf3c27c3bbd89092ff30e6ae6b2631953c4886086172a37cb48&scene=21)

更多文章请扫码关注“金融级分布式架构”公众号

> ![](https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*s3UzR6VeQ6cAAAAAAAAAAAAAARQnAQ)
