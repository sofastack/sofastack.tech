---
title: "SOFA Weekly | 开发者的搬砖日常、社区本周 Contributor、QA 整理"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "开发者的搬砖日常、社区本周 Contributor、QA 整理"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2021-12-10T15:00:00+08:00
cover: "https://gw.alipayobjects.com/zos/bmw-prod/5bcdff25-e21a-43ab-8e34-04305cd379ae.webp"
---

SOFA WEEKLY | 每周精选，筛选每周精华问答

同步开源进展，欢迎留言互动

![weekly.jpg](https://gw.alipayobjects.com/zos/bmw-prod/5bcdff25-e21a-43ab-8e34-04305cd379ae.webp)

SOFAStack（Scalable Open Financial Architecture Stack)是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

SOFAStack 官网: [https://www.sofastack.tech](https://www.sofastack.tech/)

SOFAStack: [https://github.com/sofastack](https://github.com/sofastack)

### SOFA&MOSN 社区 本周 Contributor

![img](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*AtcYSKkUo5oAAAAAAAAAAAAAARQnAQ)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动
我们会筛选重点问题
通过 " SOFA WEEKLY " 的形式回复

**@证道者** 提问：

>MOSN 的网络性有做新的技术尝试吗?

A：这个是我们今年在网络性能上的尝试，内部也在网关场景落地，后续也会开源出来。iouringv 之前我们做过测试，在我们的场景提升有限。

[https://mp.weixin.qq.com/s/ioewVcwiB5QA8w3A3gaikg](https://mp.weixin.qq.com/s/ioewVcwiB5QA8w3A3gaikg)

「MOSN」：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

**@赵一凡** 提问：

>问下 SOFALookout 的客户端可以直接把默认已有度量指标推送到 ES 吗？

A：一般客户端是上报到 lookout 服务端, 再由服务端决定要写到哪。

「SOFALookout」：[https://github.com/sofastack/sofa-lookout](https://github.com/mosn/mosn)

**@开发者** 提问：

>这个 Test 模块是用来开发者做测试的还是做自动化测试的？

![img](https://gw.alipayobjects.com/zos/bmw-prod/d72444fa-733f-452c-9fa9-90e11f4ce17e.webp)

A：用于 jraft 的 jepsen 验证，参考这个项目： 

[https://github.com/sofastack/sofa-jraft-jepsen](https://github.com/sofastack/sofa-jraft-jepsen)

jraft 每次发版前要确保通过 jepsen 验证。

「SOFAJRaft」：[https://github.com/sofastack/sofa-jraft](https://github.com/sofastack/sofa-jraft)

**@小楼** 提问：

>请问 session 是如何支持 Dubbo 的元数据的？

A：Registery 的元数据现在不是通用的，只针对 SOFARPC。

>session 之间应该是没有数据同步的吧，跨 session 节点怎么办呢？

A：现在会同步两个信息，一个是元数据，一个是接口级订阅，接口级订阅是用于兼容没升级的应用。同步的路径是通过存储，类似 K8 的 listwatch 机制，内部落地存储的插件实现是 db，这个块数据比较少，就几千行吧，而且变化很小。

「SOFARegistery」：[https://github.com/sofastack/sofa-jraft](https://github.com/sofastack/sofa-jraft)

**@小楼** 提问：

>是用什么 db 存储的?

A：蚂蚁内部的 db 普遍都是 ob，不过代码是兼容 mysql 的。

「SOFARegistery」：[https://github.com/sofastack/sofa-jraft](https://github.com/sofastack/sofa-jraft)

### SOFAStack&MOSN:新手任务计划

作为技术同学，你是否有过“想参与某个开源项目的开发、但是不知道从何下手”的感觉？

为了帮助大家更好的参与开源项目，SOFAStack 和 MOSN 社区会定期发布适合新手的新手开发任务，帮助大家 learning by doing!

**Layotto**

- Easy

fail fast，让 Layotto 启动报错时自杀

为 Java SDK 新增分布式锁 API、分布式自增 ID API

- Medium

开发 Python 或 C++、SDK

开发 Spring-Boot-Laytto

- Hard

集成  Jaeger 等 tracing 系统

「详细参考」：

[https://github.com/mosn/layotto/issues/108#issuecomment-872779356](https://github.com/mosn/layotto/issues/108#issuecomment-872779356)

**SOFARPC**

- Easy

优化集成 Nacos、ZK 注册中心的文档

- Medium

让用户使用@SOFAService 后不需要再写@Component

优化 SOFARPC 的异步编程体验

- Hard

JFR 埋点

「详细参考」：

[https://github.com/sofastack/sofa-rpc/issues/1127](https://github.com/sofastack/sofa-rpc/issues/1127)

### 本周推荐阅读  

[Service Mesh 在中国工商银行的探索与实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247499122&idx=1&sn=9733d1c015e7b0e8e64bd5cf44118b10&chksm=faa312a8cdd49bbec97612e9756ef4372c446c410518a04bd0ae990a60fea9b8e78025e60c6d&scene=21#wechat_redirect)

[Service Mesh 双十一后的探索和思考(上)](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487314&idx=1&sn=55a6a84986290888e15719446365c986&chksm=faa0e088cdd7699e2a2a4594850699713cbd698531dba1f7309f755375232560f8f758230a85&scene=21#wechat_redirect)

[Service Mesh 双十一后的探索和思考(下)](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487357&idx=1&sn=f9a8d34452c4b777fe8094cddb17ad7e&chksm=faa0e0a7cdd769b1c767cf15ca736ceca6fb5626b0363db908f4ead7e814e275fecd3037a13e&scene=21#wechat_redirect)

[蚂蚁 Service Mesh 大规模落地实践与展望](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487233&idx=1&sn=f2b4ff05edf64f3a32033d5b1013717d&chksm=faa0e0dbcdd769cd7cdf292e3c341012004a8963cc26547069a2b96dfd4a769423a95849cf2c&scene=21#wechat_redirect)

![img](https://gw.alipayobjects.com/zos/bmw-prod/75d7bde6-1f48-4f28-80a4-215f8ec811bd.webp)
