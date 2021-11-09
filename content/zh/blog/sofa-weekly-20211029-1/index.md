---
title: "SOFA Weekly | Layotto 本周 Contributor、QA 整理、 SOFARPC 本周发布"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY |Layotto 本周 Contributor、QA 整理、 SOFARPC 本周发布"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2021-10-09T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*_ewiQbuzeOQAAAAAAAAAAAAAARQnAQ"
---

SOFA WEEKLY | 每周精选，筛选每周精华问答

同步开源进展，欢迎留言互动

>![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*_ewiQbuzeOQAAAAAAAAAAAAAARQnAQ)

SOFAStack（Scalable Open Financial Architecture Stack）是蚂蚁金服自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

SOFAStack 官网: [https://www.sofastack.tech](https://www.sofastack.tech/)

SOFAStack: [https://github.com/sofastack](https://github.com/sofastack)

### Layotto 本周 Contributor

>![weekly.jpg](https://gw.alipayobjects.com/zos/bmw-prod/4466b21f-de4d-4ff4-87cc-0cca015cf36f.webp)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动

我们会筛选重点问题

通过 " SOFA WEEKLY " 的形式回复

1.**@崔伟协** 提问：

>PingPong 是类似 HTTP 的 req/resp 吗? Multiplex 是类似 HTTP2.0 的没有队头阻塞吗？
>![weekly.jpg](https://gw.alipayobjects.com/zos/bmw-prod/ac9c0a46-5061-45f8-a418-44a1fddbb4d1.webp)

A：是的。

>自己实现的 xprotocol 自定义子协议，要怎么配置 downstream 是 PingPong 还是 Multiplex 呢，PoolMode() api.PoolMode 这个方法似乎只影响 upstream 的 conn pool?

A：downstream 不用感知，这个访问你的 client 就决定他的行为。

「MOSN」：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

2.**@玄灭** 提问：

>请教下 MOSN 可以同时支持多个协议吗？比如同时支持 HTTP1.1、rocketmq 协议。

A：可以的，一个端口都可以。协议可以做自动识别，协议配置就可以配置 Auto。

「MOSN」：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

3.**@玄灭** 提问：

>业务层的 SDK 用的什么协议呢？比如 mq 用的是私有协议，还是和 RPC 统一是一个协议啊？

A：我们两种模式，一种是私有协议，一种是统一协议都有再用，统一协议是用 Layotto 支持的。

>你们的大方向是统一协议，还是私有协议啊？我理解的私有协议对于上游改造成本，会比较小吧；统一协议的话，成本比较大。

A：私有协议你认为是 Mesh 了，现有业务的支持；统一协议就是类似 Dapr 这种，新业务使用不同场景。

「MOSN」：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

4.**@晓辰** 提问：

>请问一下 MOSN 有支持 windows 的计划吗？

A：Go 语言跨平台应该支持的，你提个 pr 看看，是不是有些 Linux 需要跳过？

「MOSN」：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

5.**@王磊** 提问：

>MOSN 目前支持的 Istio 版本是 1.5.2 吗？更高的 Istio 版本支持有计划吗？

A：这个分支，近期会合到 Master。

[https://github.com/mosn/mosn/tree/istio-1.10](https://github.com/mosn/mosn/tree/istio-1.10)

「MOSN」：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

6.**@孙力** 提问：

>MOSN 有剔除上游故障节点的功能吗? 比如上游服务有 5 台服务器，访问其中一台总报错，下次就不选这台了。

[https://www.github.com/mosn/mosn/tree/master/pkg%2Ffilter%2Fstream%2Ffaulttolerance](https://www.github.com/mosn/mosn/tree/master/pkg%2Ffilter%2Fstream%2Ffaulttolerance)

>这个 stream_filter 应该是只要上游 host 返回的状态码代表异常就会统计，达到一定比例就会 healthFlag 置为 false。但我们其实想做接口 + host 的，比如访问上游的某个 HTTP 接口总失败，只是针对下次访问这个接口时，才剔除节点，这样是不是需要自己定制一下 InvocationKey ？

A：还是有区别的，这个是把 host 置为失败了，是全局的，其他接口也会失败。删除了之后，其他访问这个接口请求也不会访问这个 host 了。

「MOSN」：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

#### SOFAStack&MOSN:新手任务计划

作为技术同学，你是否有过“想参与某个开源项目的开发、但是不知道从何下手”的感觉？

为了帮助大家更好的参与开源项目，SOFAStack 和 MOSN 社区会定期发布适合新手的新手开发任务，帮助大家 learning by doing!

**Layotto**

- Easy

为 Java SDK 新增分布式锁 API

为 Java SDK 新增分布式自增 ID API

- Medium

开发 Python SDK

用某种存储实现 File API 组件（例如本地文件系统、hdfs、ftp 等）

升级由 rust 开发的 wasm demo

### SOFARPC 本周发布

本周 SOFARPC 发布 v5.8.0 版本代码。

主要更新如下：

1. RpcInvokeContext 中增加调用时精细化耗时埋点信息

2. Java 集合的使用优化

3. 修复 RouterChain 加入不存在的 Router 时 NPE 问题

4. 增加泛型修复配置类中类型传递问题

5. bolt 版本从 1.5.6 升级到 1.5.9

6. hessian 版本从 3.3.7 升级到 3.3.13

7. nacos 版本从 1.0.0 升级到 2.0.3

8. httpclient 版本从 4.5.11 升级到 4.5.13

9. commons-io 版本从 2.4 升级到 2.7

「详细参考」：[https://github.com/sofastack/sofa-rpc/releases/tag/v5.8.0](ttps://github.com/sofastack/sofa-rpc/releases/tag/v5.8.0)

### 本周推荐阅读

- [蚂蚁集团技术风险代码化平台实践（MaaS）](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247495808&idx=1&sn=88246170520e1e3942f069a559200ea4&chksm=faa31f5acdd4964c877ccf2a5ef27e3c9acd104787341e43b2d4c01bed01c91f310262fb0ec4&scene=21#wechat_redirect)

- [下一个 Kubernetes 前沿：多集群管理](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247495694&idx=1&sn=0e2d5b03ac7320e8d1bcca3d547fdee8&chksm=faa31fd4cdd496c2d646e1c651b601fab83acfb5f4361ca340cde0b029b78e9c894ccb094107&scene=21)

- [攀登规模化的高峰 - 蚂蚁集团大规模 Sigma 集群 ApiServer 优化实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247495694&idx=1&sn=0e2d5b03ac7320e8d1bcca3d547fdee8&chksm=faa31fd4cdd496c2d646e1c651b601fab83acfb5f4361ca340cde0b029b78e9c894ccb094107&scene=21)

- [MOSN 子项目 Layotto：开启服务网格+应用运行时新篇章](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247488835&idx=1&sn=d645b9abc866048e679b56bfe3b72482&chksm=faa0fa99cdd7738ff1749ae75b1670f953c92b70dcf0358337977438fd74b632b21a7b17ece3&scene=21#wechat_redirect)

>![weekly.jpg](https://gw.alipayobjects.com/zos/bmw-prod/337fd10f-76f2-4e08-b25f-3d23e3510cb9.webp)
