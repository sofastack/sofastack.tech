---
title: "SOFA Weekly | Layotto 本周新晋 Contributor、QA 整理、新手任务）"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly | Layotto 本周新晋 Contributor、QA 整理、新手任务）"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2021-10-01T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*_ewiQbuzeOQAAAAAAAAAAAAAARQnAQ"
---

SOFA WEEKLY | 每周精选，筛选每周精华问答

同步开源进展，欢迎留言互动

![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*_ewiQbuzeOQAAAAAAAAAAAAAARQnAQ)

SOFAStack（Scalable Open Financial Architecture Stack）是蚂蚁金服自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

SOFAStack 官网: [https://www.sofastack.tech](https://www.sofastack.tech/)

SOFAStack: [https://github.com/sofastack](https://github.com/sofastack)

### Layotto 本周新晋 Contributor

> ![](https://gw.alipayobjects.com/zos/bmw-prod/e3e93aa6-efd2-4e84-acd4-d3485944b6e6.webp)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动

我们会筛选重点问题

通过 " SOFA WEEKLY " 的形式回复

**@郑楚齐** 提问：

> 我们在 Istio 环境下，因为 MOSN 是自动 sidecar 注入的，我怎么控制他读取我的配置文件内容呢？而且我看官方的 Istio 案例也是可以通过 virsual service 进行流量控制的，我们这个 config.json 也是可以进行流量控制的，是不是我理解的 config.json 是在 virsualService.yaml 的功能上进行拓展的功能(比如这种 tag 路由是 virsualService 不能控制的)。

A：Istio 场景下对应的 sidecar 的静态配置是一些通用的模板（如 pilot 地址渲染等）。关于 service 相关的路由及治理控制都是通过 Istio 定义的 CRD 控制： 

[https://istio.io/latest/docs/reference/config/networking/](https://istio.io/latest/docs/reference/config/networking/)

MOSN：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

**@郑楚齐** 提问：

> MOSN 执行的这个 config.json 是如何使用呢？因为目前 Istio 的这个配置 DestinationRule VirsualService 是不满足需求的，或者说 MOSN 收到我们订制的 DestinationRule VirsualService，会自动转为 config.json 供给 MOSN 使用呢？

A：cluster subset 配置目前 Istio 的 Destination Rule 还不支持，不过目前是可以通过 Envoy Filter 来给对应的 cluster 打 patch 实现（比较麻烦点）。

MOSN：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

**@郑楚齐** 提问：

> 如果是在 Envoy Filter 打 patch 的话，有没有什么例子吗?

A：这个就是上面说的 cluster subset 配置。目前 Istio 的 Destination Rule 里面还不支持这个（详细见上面的那个讨论 issue），目前唯一的方法就是使用 Envoy Filter 的这个 CRD 打 patch 实现。

可参考文档：[https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-ClusterMatch](https://istio.io/latest/docs/reference/config/networking/envoy-filter/#EnvoyFilter-ClusterMatch)

MOSN：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

**@郑楚齐** 提问：

> 看了官方的 EnvoyFilter，不过感觉跟我们 MOSN 的 config.json 里面的内容想对照匹配起来确实很难。

A：你可以用 xds 动态更新或者扩展用我们的 API 更新，不需要直接用这个配置文件。直接调用 MOSN 自己的 API，xds 其实也是 adapt 到这些 API 接口的，如果你们不用 Istio 的话，自己封装可能更简单，主要就 route 和 cluster 两个 API 就行了。

这是一个用 zk 更新 Dubbo 的例子：

[https://github.com/mosn/mosn/blob/38b3b922b59500acc082e0ac9d705e41944c94ee/pkg/upstream/servicediscovery/dubbod/common.go#L99](https://github.com/mosn/mosn/blob/38b3b922b59500acc082e0ac9d705e41944c94ee/pkg/upstream/servicediscovery/dubbod/common.go#L99)

MOSN：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

**@孤若** 提问：

> 当空回滚时，如果是因为远程方法调用 try 响应超时，怎么解决终止 try 执行？比如 rollback 执行远比 try 阶段快，rollback 结束 try 还在执行。

A：我之前有参考这个，有提到 TCC 异常控制：

[https://www.infoq.cn/article/g33hcc-qosjplkt4e64e](https://www.infoq.cn/article/g33hcc-qosjplkt4e64e)

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

**@林祥标** 提问：

> Seata 1.3.0 jdk 1.8 使用 jackson 对 localDateTime 进行序列化时报错，有大佬知道怎么解决吗？

A：如果数据库用 datetime，实体又是 localdatetime，目前我发现只能 spi、替换序列化方式、依赖等等都没用。通过 spi 定义三个序列化方式就行了：LocalDate、LocalDateTime、LocalTime...反正如果数据库不是时间戳，目前给的适配方式是无用的(个人用下来的结果)。

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

### SOFAStack：新手任务计划

作为技术同学，你是否有过“想参与某个开源项目的开发、但是不知道从何下手”的感觉？

为了帮助大家更好的参与开源项目，社区会定期发布适合新手的新手开发任务，帮助大家 learning by doing ！

**Easy**

为 Layotto 中的关键模块添加注释（例如限流/分布式锁等模块）、添加 nodejs sdk。

**Medium**

用某种存储实现 File API 组件（例如本地文件系统、minio、hdfs、ftp 等）。

**「详见」：**

[https://github.com/mosn/layotto/issues/108#issuecomment-872779356](https://github.com/mosn/layotto/issues/108#issuecomment-872779356)

### 本周推荐阅读

- [攀登规模化的高峰 - 蚂蚁集团大规模 Sigma 集群 ApiServer 优化实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247495579&idx=1&sn=67d0abc1c513ba4f815550d235b7a109&chksm=faa30041cdd489577c0e3469348ebad2ab2cc12cdfebca3a4f9e8dcd5ba828a76f500e8c0115&scene=21)

- [MOSN 子项目 Layotto：开启服务网格+应用运行时新篇章](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247488835&idx=1&sn=d645b9abc866048e679b56bfe3b72482&chksm=faa0fa99cdd7738ff1749ae75b1670f953c92b70dcf0358337977438fd74b632b21a7b17ece3&scene=21#wechat_redirect)

- [蚂蚁智能监控](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247494372&idx=1&sn=bb10a77c657251ee29d5fcc19c058ce7&chksm=faa3053ecdd48c28c35e262d04659766d8c0b411f1d5605b2dd7981b4345e1d4bf47cc977130&scene=21)

- [2021 年云原生技术发展现状及未来趋势](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247492248&idx=1&sn=c26d93b04b2ee8d06d8d495e114cb960&chksm=faa30d42cdd48454b4166a29efa6c0e775ff443f972bd74cc1eb057ed4f0878b2cb162b356bc&scene=21)
