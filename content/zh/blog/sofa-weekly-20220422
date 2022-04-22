---
title: "SOFA Weekly | 年度优秀 Committer 、本周 Contributor、本周 QA"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly | 年度优秀 Committer 、本周 Contributor、本周 QA"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2022-04-22T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ"
---

SOFA WEEKLY | 每周精选，筛选每周精华问答

同步开源进展，欢迎留言互动

![weekly.jpg](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ)

SOFAStack（Scalable Open Financial Architecture Stack)是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

SOFAStack 官网: [https://www.sofastack.tech](https://www.sofastack.tech/)

SOFAStack: [https://github.com/sofastack](https://github.com/sofastack)

### SOFAStack 社区本周 Contributor  
![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*6Hm4SpN2FWUAAAAAAAAAAAAAARQnAQ)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动，我们会筛选重点问题，通过 " SOFA WEEKLY " 的形式回复

**@黄昊 ** 提问：

>同一个网格里，不同的 Pod 可以注入不同版本的 Sidecar 吗？

A：去改 inject 程序可以实现，相关资料可以搜索：K8s准入控制。

>利用 webhook，动态匹配返回 sidecar-image 是这个意思吗？看代码，貌似 Istio 里面可以通过sidecar.istio.io/proxyImage 这个 annotation 来指定。

A：是的。

「MOSN」：[https://github.com/mosn](https://github.com/mosn)

**@service mesh ** 提问：

>gateway 有开源计划吗？

A：有考虑，但是目前还没有具体的时间点，可以看下这个初期的 issue，有个demo[https://github.com/mosn/mosn/issues/1563 ](https://github.com/mosn/mosn/issues/1563 )

「MOSN」：[https://github.com/mosn](https://github.com/mosn)

**@Tom ** 提问：

>Wasm 还有啥好玩的待实现的特性吗？

A：目前关于 Wasm 主要想尝试两个方向：

1. 以 Wasm 作为用户开发函数的载体，可以参考下：[https://github.com/mosn/layotto/issues/191](https://github.com/mosn/layotto/issues/191)

2. 以 Wasm 作为开发 Layotto 各个组件的载体，可以参考下：[https://github.com/mosn/layotto/issues/476](https://github.com/mosn/layotto/issues/476)

第二个应该需要尝试使用 Rust 为 Layotto 的 API 开发一个组件然后编译成 Wasm。

「Layotto」：[https://github.com/layotto](https://github.com/layotto)

### SOFAStack 新手任务计划

作为技术同学，你是否有过“想参与某个开源项目的开发、但是不知道从何下手”的感觉？

为了帮助大家更好的参与开源项目，SOFAStack 和 MOSN 社区会定期发布适合新手的新手开发任务，帮助大家 learning by doing!

Layotto

- Easy

为 actuator 模块添加单元测试

为 Java SDK 新增分布式锁、分布式自增 ID API

开发 in-memory configuration 组件

- Medium

让 Layotto 支持 Dapr API

开发 Rust、C、Python、SDK

用 mysql、consul 或 leaf 等系统实现分布式自增 id API

- Hard

让 Layotto 支持通过接口调用的方式动态加载 wasm，以支持 FaaS 场景动态调度

「详细参考」：[https://github.com/mosn/layotto/issues/108#issuecomment-872779356](https://github.com/mosn/layotto/issues/108#issuecomment-872779356)

SOFARPC

- Easy

优化 SOFARPC 使用文档

- Medium

优化 SOFARPC 的异步编程体验

「详细参考」：[https://github.com/sofastack/sofa-rpc/issues/1127](https://github.com/sofastack/sofa-rpc/issues/1127)

### 本周推荐阅读

- [金融级应用开发｜SOFABoot 框架剖析(https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247505461&idx=1&sn=198480c36943e1b904ab88291b539057&chksm=faa339efcdd4b0f91810d2c2dc2a9536f5378973a67d03e98f5b6a813771d46bd9cb145ed4d1&scene=21#wechat_redirect)

- [“SOFA 星球”闯关计划 ——Layotto 飞船](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247505856&idx=1&sn=bbf95767a84de62d4bb2bdf46644ab30&chksm=faa3381acdd4b10c76825f7d3999fb4956ce0d24562a7a26af1732c70d28966b2f84f0457800&scene=21#wechat_redirect)

- [HAVE FUN | 飞船计划、源码解析活动最新进展](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247506596&idx=1&sn=20a8f689516c0252ac1957510c8156ba&chksm=faa3357ecdd4bc684c5f9d0d6f91f4b84b4e52da45c94c3907570a2e0b09b1d4df45fa505cc5&scene=21#wechat_redirect)

更多文章请扫码关注“金融级分布式架构”公众号

>![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*8G5NRZ7UEToAAAAAAAAAAAAAARQnAQ)
