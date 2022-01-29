---
title: "SOFA Weekly |本周 Contributor、QA 整理、新手任务计划"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly |本周 Contributor、QA 整理、新手任务计划
"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2022-01-29T15:00:00+08:00
cover: "https://gw.alipayobjects.com/zos/bmw-prod/5bcdff25-e21a-43ab-8e34-04305cd379ae.webp"
---

SOFA WEEKLY | 每周精选，筛选每周精华问答

同步开源进展，欢迎留言互动

![weekly.jpg](https://gw.alipayobjects.com/zos/bmw-prod/5bcdff25-e21a-43ab-8e34-04305cd379ae.webp)

SOFAStack（Scalable Open Financial Architecture Stack)是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

SOFAStack 官网: [https://www.sofastack.tech](https://www.sofastack.tech/)

SOFAStack: [https://github.com/sofastack](https://github.com/sofastack)

### SOFA&MOSN 社区 本周 Contributor

![img](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*U9YiTZyHg_EAAAAAAAAAAAAAARQnAQ)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动

我们会筛选重点问题

通过 " SOFA WEEKLY " 的形式回复

**@李雪涛** 提问：

>请问 MOSN 插件的管理接口应该怎么调用，里面的 IP 和 port，IP 应该指的是 Pod 的 IP 吧，那 port 指的是什么呢?

>![img](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*o77dT7Ptr-8AAAAAAAAAAAAAARQnAQ)

A：通过 admin 得配置。
[https://www.github.com/mosn/mosn/tree/master/configs%2Fmosn_config.jso](https://www.github.com/mosn/mosn/tree/master/configs%2Fmosn_config.jso)

![img](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*GIaXQqW2TDQAAAAAAAAAAAAAARQnAQ)

「MOSN」：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

**@李雪涛** 提问：

>我的插件参考的：
[https://github.com/mosn/mosn/blob/istio-1.10/examples/codes/plugin/pluginfilter/pluginfilter.go](https://github.com/mosn/mosn/blob/istio-1.10/examples/codes/plugin/pluginfilter/pluginfilter.go)

但是我利用 admin 接口 enable 的时候输出的是插件未注册的错误，能帮我看一下我的插件注册部分哪里写的不对吗？

插件的 client 的注册相关的代码：
[https://www.codepile.net/pile/EK6Om3A6](https://www.codepile.net/pile/EK6Om3A6)

A：镜像的配置有这个 plugin 吗？或者你先别用那个 Istio，现本地打包测试下，直接二进制启动试试：
1. 看配置，有没有 paper 的 filter 配置
2. MOSN 的 main 文件需要 import 你的 paper 文件，因为注册用的 init
3. 看下启动日志：
[https://github.com/mosn/mosn/blob/master/cmd/mosn/main/mosn.go](https://github.com/mosn/mosn/blob/master/cmd/mosn/main/mosn.go)

「MOSN」：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

**@来永国** 提问：

>我把透传写在 SOFARPC 拦截器里，服务端接收不到客户端透传的参数。

A：确实是这样，baggage 处理在 filter 之前。

>还有什么更优雅的方式吗？那我非要只在 filter 里加透传 ，然后我现在的处理是：
[https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*Nyt0RbREWRcAAAAAAAAAAAAAARQnAQ](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*Nyt0RbREWRcAAAAAAAAAAAAAARQnAQ)

A：非要在 filter 里面处理 baggage 的话,可以直接操作 SOFARequest 对象的 RequestProp. RemotingConstants.RPC_REQUEST_BAGGAGE，可以参考 com.alipay.sofa.rpc.context.BaggageResolver#carryWithRequest 类。

「SOFARPC」：[https://github.com/sofastack/sofa-rpc](https://github.com/sofastack/sofa-rpc)

### SOFAStack&MOSN:新手任务计划

作为技术同学，你是否有过“想参与某个开源项目的开发、但是不知道从何下手”的感觉？

为了帮助大家更好的参与开源项目，SOFAStack 和 MOSN 社区会定期发布适合新手的新手开发任务，帮助大家 learning by doing!

**Layotto**

- Easy

为 actuator 模块添加单元测试

为 Java SDK 新增分布式锁、分布式自增 ID API

- Medium

让 Layotto 支持 Dapr API

开发 Rust、C、Python、SDK

「详细参考」：

[https://github.com/mosn/layotto/issues/108#issuecomment-872779356](https://github.com/mosn/layotto/issues/108#issuecomment-872779356)

**SOFARPC**

- Easy

优化 SOFARPC 使用文档

- Medium

优化 SOFARPC 的异步编程体验

「详细参考」：

[https://github.com/sofastack/sofa-rpc/issues/1127](https://github.com/sofastack/sofa-rpc/issues/1127)

### 本周推荐阅读  

[2021 大促 AntMonitor 总结 - 云原生 Prometheus 监控实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247500552&idx=1&sn=512a3babe84064d8ebd6ccbb65b25c12&chksm=faa32cd2cdd4a5c4981fb5aa3dbcd6d4fe2f6470eabd89053314e8ef51a271e28c3affa835d6&scene=21#)

[蚂蚁大规模 Sigma 集群 Etcd 拆分实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247500192&idx=1&sn=7ceb084796e30cb4d387ede22b45d7f5&chksm=faa32e7acdd4a76c94fa2b2bb022d85f3daa78b1b3c2d4dae78b9cc5d77011eecddfd12df1c2&scene=21#)

[Tengine + BabaSSL ，让国密更易用！](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247500065&idx=1&sn=2ffec7fa6a7dc6563f48f176ae2b9180&chksm=faa32efbcdd4a7ed31789e7752045cb0d632c64f13c9f46fedec24d3c733eb271dd82e4a0f72&scene=21#)

[服务网格定义企业上云新路径！ | Forrester X 蚂蚁集团 发布服务网格白皮书](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247499916&idx=1&sn=f68469b35cdb6d7e33589e724a2ed6c4&chksm=faa32f56cdd4a640cb8deb38b7a3eb046a858fb85485c4152f0302d37017d8cd1aba8f696473&scene=21#)
