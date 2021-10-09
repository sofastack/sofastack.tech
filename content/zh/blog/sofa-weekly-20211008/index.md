---
title: "SOFA Weekly | Layotto 本周 Contributor、QA 整理、Layotto 发布新版本
"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly | Layotto 本周 Contributor、QA 整理、Layotto 发布新版本"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2021-10-08T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*_ewiQbuzeOQAAAAAAAAAAAAAARQnAQ"
---

SOFA WEEKLY | 每周精选，筛选每周精华问答

同步开源进展，欢迎留言互动

>![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*_ewiQbuzeOQAAAAAAAAAAAAAARQnAQ)

SOFAStack（Scalable Open Financial Architecture Stack）是蚂蚁金服自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

SOFAStack 官网: [https://www.sofastack.tech](https://www.sofastack.tech/)
SOFAStack: [https://github.com/sofastack](https://github.com/sofastack)

### Layotto 本周 Contributor

>![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*7_MlSqxOxEEAAAAAAAAAAAAAARQnAQ)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动

我们会筛选重点问题

通过 " SOFA WEEKLY " 的形式回复

**@风** 提问：

>麻烦问下 SOFA 中的 consumerConfig 的 uniqueId 和 application 分别起什么作用，有什么区别呀？

A：发布 RPC 服务的时候做配置，uniqueId 是服务的唯一标识，比如你想同一个 service 类发两个服务，就起两个 uniqueId。

「SOFARPC」：[https://github.com/sofastack/sofa-rpc](https://github.com/sofastack/sofa-rpc)

**@郑楚齐** 提问：

>我在 K8s 上测试将使用 spring-cloud-feign 的服务接入 MOSN Proxy，但是目前 consumer 端一直访问不到 provider，我还在排查问题，想问一下，如果要调用的话，FeignClient 这边是不是需要直接将 URL 指向代理？

>![weekly.jpg](https://gw.alipayobjects.com/zos/bmw-prod/1c4d440e-0972-4a13-82fb-8d3237966e6b.webp)

>![weekly.jpg](https://gw.alipayobjects.com/zos/bmw-prod/457a5411-41a6-4e37-9b37-50589987e639.webp)

A：不是透明劫持的话，就要直接指向 Proxy 的端口。

「MOSN」：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

**@东仔** 提问：

>MOSN 在 Linux 上的 idea 如何启动？

A：参考下图，

>![weekly.jpg](https://gw.alipayobjects.com/zos/bmw-prod/db92b023-2934-4042-8838-4ae58ec2f7a4.webp)

>![weekly.jpg](https://gw.alipayobjects.com/zos/bmw-prod/b7110a54-fee9-429d-95bf-acd7656c91f1.webp)

「MOSN」：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

**@王逸飞** 提问：

>A -> B, A 没有问题，执行到 B 的更新操作时候， Could not found global transaction xid = 192.168.0.112:8091:1893025023560908，会是什么原因产生的？

A：debug 到 b 的时候看下 TC 的 global table 里面数据存不存在。可能是服务重试或者网络超时造成，自己看下 tm 的决议是什么?

> java.time.LocalDateTime 序列化失败，这样的情况一般如何解决呢?

>![weekly.jpg](https://gw.alipayobjects.com/zos/bmw-prod/71154451-798b-4730-b5e1-90e3f6a4d803.webp)

A：改数据库类型，mkyro + datatime 改为时间戳类型，或者等 1.5。

「Seata」：[https://github.com/seata/seata](https://github.com/seata/seata)

### 本周发布

**Layotto 发布了0.2.0 版本，包括以下功能：**

1. 支持 File API

2. 支持 Binding API

3. Tracing 和 metrics

4. 为已有 API 添加更多组件

5. 修复安全问题以及减少 panic 风险

6. 不同组件之间保证数据隔离、代码复用

7. WASM 模块支持热加载

8. go sdk 添加更多 feature

9. 一个简单的 Java sdk

10. 添加更多文档、修复文档错误

11. 添加社区治理和晋升规则

**详细参考：**

[https://github.com/mosn/layotto/releases/tag/v0.2.0](https://github.com/mosn/layotto/releases/tag/v0.2.0)

### 本周推荐阅读

- [下一个 Kubernetes 前沿：多集群管理](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247495694&idx=1&sn=0e2d5b03ac7320e8d1bcca3d547fdee8&chksm=faa31fd4cdd496c2d646e1c651b601fab83acfb5f4361ca340cde0b029b78e9c894ccb094107&scene=21)

- [攀登规模化的高峰 - 蚂蚁集团大规模 Sigma 集群 ApiServer 优化实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247495579&idx=1&sn=67d0abc1c513ba4f815550d235b7a109&chksm=faa30041cdd489577c0e3469348ebad2ab2cc12cdfebca3a4f9e8dcd5ba828a76f500e8c0115&scene=21)

- [MOSN 子项目 Layotto：开启服务网格+应用运行时新篇章](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247488835&idx=1&sn=d645b9abc866048e679b56bfe3b72482&chksm=faa0fa99cdd7738ff1749ae75b1670f953c92b70dcf0358337977438fd74b632b21a7b17ece3&scene=21#wechat_redirect)

- [蚂蚁智能监控](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247494372&idx=1&sn=bb10a77c657251ee29d5fcc19c058ce7&chksm=faa3053ecdd48c28c35e262d04659766d8c0b411f1d5605b2dd7981b4345e1d4bf47cc977130&scene=21)

