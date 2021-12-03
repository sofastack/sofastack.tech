---
title: "SOFA Weekly |Layotto 本周 Contributor、QA 整理、新手任务"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly |Layotto 本周 Contributor、QA 整理、新手任务"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2021-11-05T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*_ewiQbuzeOQAAAAAAAAAAAAAARQnAQ"
---

SOFA WEEKLY | 每周精选，筛选每周精华问答

同步开源进展，欢迎留言互动

>![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*_ewiQbuzeOQAAAAAAAAAAAAAARQnAQ)

SOFAStack（Scalable Open Financial Architecture Stack）是蚂蚁金服自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

SOFAStack 官网: [https://www.sofastack.tech](https://www.sofastack.tech/)

SOFAStack: [https://github.com/sofastack](https://github.com/sofastack)

### Layotto 本周 Contributor

>![weekly.jpg](https://gw.alipayobjects.com/zos/bmw-prod/44fd2e9d-05a5-412d-8ec0-68df68f9859d.webp)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动

我们会筛选重点问题

通过 " SOFA WEEKLY " 的形式回复

**@玄灭** 提问：

>大佬，关于 downStream 和 upStream，你看看我这个理解对不对哈？一个 MOSN 进程，既会代理当前 pod 的业务进程流量请求，此时 downStream 是当前 pod 进程；同时，这个 MOSN 进程也会代理其他 pod 请求当前 pod 的流量，此时当前 pod 就不能成为 downStream；也就是说，角色会互换。从另一个角度，从 server 端口进来的，都是 downStream，使用 client 向外其他进程发送数据，都是 upStream。<br/>
>![weekly.jpg](https://gw.alipayobjects.com/zos/bmw-prod/7637545e-57bf-43d8-9a65-02aebbb0c44c.webp)

A：一般来说，downStream 就是 server listen 请求，upStream 是 client，发送请求。你说的第一种，一般用 Ingress、Egress 来区分。

>在 MOSN 里，downStream 永远是 side 进程吗？

A：MOSN 里面，downStream 就是 server 端，接收请求的。

>MOSN 两个端口的话，server 端可能是 side 进程，也可能是其他 MOSN 进程。所以 downStream 可以是 side 进程的请求，也可以是其他 MOSN 进程的请求。

A：站在 MOSN 角度，给我发请求的就是 downStream。

「MOSN」：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

**@zzzZ** 提问：

>怎么将实现的 Eventhandler 注册进容器中，监听容器启动和停止事件？

A：这里有具体讲解，[https://www.sofastack.tech/projects/sofa-boot/sofa-ark-ark-event/](https://www.sofastack.tech/projects/sofa-boot/sofa-ark-ark-event/)

>事件能传播吗？比如 master 传播给子模块内。<br/>
A：容器级别的会传播。

「SOFABoot」：[https://github.com/sofastack/sofa-boot](https://github.com/sofastack/sofa-boot)

**@苏千** 提问：

>如何让 Layotto 打印日志，将 metadata 打印出来，我传递了没有生效，想看看是否传递错误。

A：Layotto 现在默认 log 就是打印的，但没打印 metadata 里面的值，现在 oss 的实现就没传 prefix，所以不生效吧。

可以试一下这个方法，如果这样的话，你 SDK 测需要适配一下。[https://github.com/mosn/layotto/issues/98#issuecomment-957479097](https://github.com/mosn/layotto/issues/98#issuecomment-957479097)

「Layotto」：[https://github.com/mosn/layotto](https://github.com/mosn/layotto)

#### SOFAStack&MOSN:新手任务计划

作为技术同学，你是否有过“想参与某个开源项目的开发、但是不知道从何下手”的感觉？

为了帮助大家更好的参与开源项目，SOFAStack 和 MOSN 社区会定期发布适合新手的新手开发任务，帮助大家 learning by doing!

**Layotto**

- Easy

为 Java SDK 新增分布式锁 API

为 Java SDK 新增分布式自增 ID API

- Medium

开发 Python SDK

升级由 Rust 开发的 Wasm demo

- Hard

集成 Skywalking、Jaeger 等系统

支持 Dapr Config API

「详细参考」：

[https://github.com/mosn/layotto/issues/108#issuecomment-872779356](https://github.com/mosn/layotto/issues/108#issuecomment-872779356)

### 本周推荐阅读

- [如何在生产环境排查 Rust 内存占用过高问题](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247497371&idx=1&sn=8b98f9a7dad0ac99d77c45d12db626be&chksm=faa31941cdd49057ec6aa23b5541e0b1ce49574808f55068a0b3c0bc829ef281c47cfba53f59&scene=21#wechat_redirect)

- [下一个 Kubernetes 前沿：多集群管理](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247495694&idx=1&sn=0e2d5b03ac7320e8d1bcca3d547fdee8&chksm=faa31fd4cdd496c2d646e1c651b601fab83acfb5f4361ca340cde0b029b78e9c894ccb094107&scene=21)

- [攀登规模化的高峰 - 蚂蚁集团大规模 Sigma 集群 ApiServer 优化实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247495694&idx=1&sn=0e2d5b03ac7320e8d1bcca3d547fdee8&chksm=faa31fd4cdd496c2d646e1c651b601fab83acfb5f4361ca340cde0b029b78e9c894ccb094107&scene=21)

- [MOSN 子项目 Layotto：开启服务网格+应用运行时新篇章](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247488835&idx=1&sn=d645b9abc866048e679b56bfe3b72482&chksm=faa0fa99cdd7738ff1749ae75b1670f953c92b70dcf0358337977438fd74b632b21a7b17ece3&scene=21#wechat_redirect)

>![weekly.jpg](https://gw.alipayobjects.com/zos/bmw-prod/337fd10f-76f2-4e08-b25f-3d23e3510cb9.webp)
