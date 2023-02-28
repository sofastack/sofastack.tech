---
title: "SOFA Weekly | 开源人、本周贡献 & issue 精选"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly |开源人、本周贡献 & issue 精选"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2023-02-24T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ"
---

## SOFA WEEKLY | 每周精选

![](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*hQu2QLAt_r8AAAAAAAAAAAAADrGAAQ/original)

**筛选每周精华问答，同步开源进展，欢迎留言互动～**

**SOFA**Stack（**S**calable **O**pen **F**inancial **A**rchitecture Stack）是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

**SOFAStack 官网:** *[https://www.sofastack.tech](https://www.sofastack.tech)*

**SOFAStack:** *[https://github.com/sofastack](https://github.com/sofastack)*

### SOFAStack 社区本周贡献

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*GxMvQb9s7owAAAAAAAAAAAAADrGAAQ/original)

### SOFAStack GitHub issue 精选

**本周各项目回复 issue 共计 3 条**

欢迎大家在 GitHub 提交 issue 与我们互动

我们会筛选 issue 通过 

" SOFA WEEKLY " 的形式回复

**1.@dbl-x #287**

>Publisher、UnPublisher、Subscriber、Watcher 这四个类的定义都在 model..common.model.Store 中，所以他们都是存储相关的模型吗？
但是他们中又带有业务逻辑，比如：

![](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*xin6TZ-SxEEAAAAAAAAAAAAADrGAAQ/original)

>如果他们是业务模型，但它们似乎又都用户数据传输相关的操作。另外 UnPublisher 作为一个模型对象本身是不合适的吧？

A：最早是 V5 的时候，有 Watcher、Publisher 和 Subscriber 等概念，作为几种不同类型的客户端，存储在不同的“Store”里面，这么设计也是最初 V5 使用了多个线程池，通过 task 对象进行解耦，所以，将元信息封装在“model”对象中。而 V6 我们改版时候，经过压测等手段，发现异步解耦有如下问题：

实战下来，过度地一步解耦导致对象之间的关系不明确，很容易混淆，加之没有单测，很容易出现问题；
性能大坑，无法很好处理 IO 类任务和计算类任务，以及优先级问题。
后面针对异步队列进行了解耦，但是留下了原有的对象，存储。

**「SOFARegistry」**
[https://github.com/sofastack/sofa-registry](https://github.com/sofastack/sofa-registry)

**2. @LinhuiG #845 ** 

>一个集群中创建多个 Raft 实例（通过 groupId 区分），对其进行压力的时候，总是会出现领导者转移现象（Raft node receives higher term RequestVoteRequest），CPU 负载不到 70%，网络未拥堵，状态机内部使用了线程池异步处理。是否因为业务队列满载导致领导者心跳失效？

A：这个问题可以通过一些限流来缓解, RaftOptions 里的：

- maxByteCountPerRpc 控制单个 RPC 请求大小
- maxEntriesSize 单次发送 log 数量
- maxBodySize 单次发送 log 字节数
- maxAppendBufferSize 强制刷写磁盘最大字节数这些参数来调节。

**「SOFAJRaft」**：
[https://github.com/sofastack/sofa-jraft](https://github.com/sofastack/sofa-jraft)

### 本周推荐阅读

[Go 代码城市上云——KusionStack 实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247515572&idx=1&sn=8fffc0fb13ffc8346e3ab151978d947f&chksm=faa3526ecdd4db789035b4c297811524cdf3ec6b659e283b0f9858147c7e37c4fea8b14b2fc6&scene=21#wechat_redirect)

[KusionStack 在蚂蚁集团的探索实践 (上)](https://mp.weixin.qq.com/cgi-bin/appmsg?t=media/appmsg_edit&action=edit&type=77&appmsgid=100040378&token=2119786069&lang=zh_CN)

[Wasm 原生时代已经来到](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247523985&idx=1&sn=73adc8410675e7419731f8267bfebfc5&chksm=faa3714bcdd4f85d310583346e02d1d3a10e5cf97d23cc469104bdd1bbee499446f0a709a7c2&scene=21#wechat_redirect)

[Go 内存泄漏，pprof 够用了么？](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247516046&idx=1&sn=c8ed0fbbc18b4377778c2ed06c7332ba&chksm=faa35054cdd4d9425b6780ae5ed1a6b83ab16afd9d870affba350c8002a2c4e2efdb85abc603&scene=21#wechat_redirect)

欢迎扫码关注：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e19d0a6d7f734ad6a585cde82ae4f3bf~tplv-k3u1fbpfcp-zoom-1.image)
