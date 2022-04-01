---
title: "SOFA Weekly | 开源新知、本周 QA、新手任务"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly | 开源新知、本周 QA、新手任务"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2022-04-01T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ"
---

SOFA WEEKLY | 每周精选，筛选每周精华问答

同步开源进展，欢迎留言互动

![weekly.jpg](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ)

SOFAStack（Scalable Open Financial Architecture Stack)是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

SOFAStack 官网: [https://www.sofastack.tech](https://www.sofastack.tech/)

SOFAStack: [https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动，我们会筛选重点问题，通过 " SOFA WEEKLY " 的形式回复

**@ 毛晨斌** 提问：

>使用 Layotto 是不是客户端代码需要重新实现，全部调用 Layotto 提供的API？多少正式的项目正在使用 Layotto?

A：目前蚂蚁的落地用户将客户端 SDK，改成调用 Layotto；现在在搞无侵入方案。

>开源版服务器端支持哪些中间件，客户端无侵入支持哪些中间件？

A：1. 已经落地的方案是：将各种中间件的 Java SDK，改成调用 Layotto （比如把 xxx-MQ-sdk 内部逻辑改成调layotto pubsub API，但是对业务代码暴露的接口不变)。业务系统需要升级下 SDK，业务代码不用改。这部分没开源，因为是改内部中间件的 SDK，这些中间件本身没开源。

2. 开源版服务器端支持那些中间件：每类 API 有支持的组件列表。
[https://mosn.io/layotto/#/zh/component_specs/sequencer/common](https://mosn.io/layotto/#/zh/component_specs/sequencer/common)
其中 state API、pubsub API 因为复用了 Dapr 的组件，所有 Dapr 组件都支持。[https://docs.dapr.io/zh-hans/reference/components-reference/supported-state-stores/](https://docs.dapr.io/zh-hans/reference/components-reference/supported-state-stores/)

3.客户端支持哪些：目前有 .net java go 的 Layotto SDK，有个 layotto-springboot 刚合并。SDK 在 [https://github.com/layotto](https://github.com/layotto)

4. 关于无侵入方案：后面想把协议转换的事情放到 Layotto 做、让用户接入 Layotto 时不用改客户端 SDK，不过方案还在讨论，最近会写个 proposal。

5.现在还没有现成的客户端无侵入 SDK，老系统接入 Layotto 需要改原来的 SDK。

「SOFABolt」：[https://github.com/sofastack/sofa-boot](https://github.com/sofastack/sofa-boot)

**黄润良 ** 提问：

>RPC 序列化 Localdatetime 有问题，改为 Date 类型后正常, 你知道原因吗?upstream 的 ip access 日志怎么打印来访日志呢，主要是负载均衡后访问到后段的哪个 IP?

A：你要在 errorlog 打印吗？你可以配置 accesslog，一个请求一条的。你的 tracelog 也可以打印的。[https://github.com/mosn/mosn/blob/master/pkg/log/accesslog.go](https://github.com/mosn/mosn/blob/master/pkg/log/accesslog.go)

>[WARN][downStream]reset stream reason ConnectionTermination[proxy][downstream]processError=downstreamReset proxyld:2204350,reason:ConnectionTermination

A：downstream 的连接断链了。比如你 curl 访问 MOSN，在 reponse 回复之前 Ctrl+C 终止断链接，MOSN 就会打印这个日志，也就是还没有回复请求，client 就断链了。 然后 client 自己有超时，可能就断链了。

「MOSN」：[https://github.com/mosn](https://github.com/mosn)

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

### Holmes 本周发布

Holmes 发布 v1.0 版本

Holmes 是 MOSN 社区开源的 go 语言 continous profiling 组件，可以自动发现 cpu、 memory、goroutine 等资源的异常，并自动 dump 异常现场 profile，用于事后分析定位。也支持上传 profile 到自动分析平台，实现自动问题诊断、报警。

「发布报告」：[https://github.com/mosn/holmes/releases/tag/v1.0.0](https://github.com/mosn/holmes/releases/tag/v1.0.0)

「Holmes 原理介绍」：[https://mosn.io/blog/posts/mosn-holmes-design/](https://mosn.io/blog/posts/mosn-holmes-design/)

### 本周推荐阅读

- [HAVE FUN | Layotto 源码解析](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247504412&idx=1&sn=b4e09eca55af2eb83cb9dd5d9c0e3f08&chksm=faa33dc6cdd4b4d0513c986bd745b04b92f4539029ffca2131f3d7050b54d4c15f17d2cde820&scene=21#wechat_redirect)

- [异构注册中心机制在中国工商银行的探索实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247504244&idx=1&sn=59e32e2d4be5bbf6789da040eaaa1d4d&chksm=faa33eaecdd4b7b8a2f630944d6c7fd679bd1ecfef2c512111a61c02320dc78bb0ee560053f9&scene=21#wechat_redirect)

- [Nydus 镜像加速插件迁入 Containerd 旗下](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247504035&idx=1&sn=320b77bf5f3c6cf0da309f7527b98e64&chksm=faa33f79cdd4b66f184d273a2d7460c41320711eab47af849e386c359e71eeebc6c7f21c1e0f&scene=21#wechat_redirect)

- [社区会议｜MOSN 社区将会发布 1.0 版本，同时推动下一代架构演进](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247502035&idx=1&sn=7854ee79b923d5431903f787ff9edc73&chksm=faa32709cdd4ae1fce7b031a5ceed38018dbcc61da42024649d8ef0c5b39d823d508004239a8&scene=21)

更多文章请扫码关注“金融级分布式架构”公众号

>![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*8G5NRZ7UEToAAAAAAAAAAAAAARQnAQ)
