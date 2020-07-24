---
title: "SOFA Weekly | SOFABolt 发布新版本、MOSN 相关文章整理"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2020-07-24T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563524226806-e93607a3-1b77-4ca2-8c3c-0384ab966154.png"
---

**SOFA WEEKLY | 每周精选，筛选每周精华问答**
**同步开源进展，欢迎留言互动**

![weekly.jpg](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1562925824761-fc720f21-9622-437b-a783-0b0729eda119.jpeg)

**SOFA**Stack（**S**calable **O**pen Financial **A**rchitecture Stack）是蚂蚁集团自主研发的金融级分布式架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

- **SOFAStack 官网**[https://www.sofastack.tech](https://www.sofastack.tech/)
- **SOFAStack:**[https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动

我们会筛选重点问题通过 " SOFA WEEKLY " 的形式回复

**@Zhengguang**  提问：

> 想问下，默认的 RMClient.init(applicationId, txServiceGroup);  这个方式启动 RM 的时候有个问题，它传递的 resourceId 为 null 也就是说 RM 初始化的时候虽然在 TC 注册了，但是注册的信并非之前断开始后那个 resourceId，所以 RM 重启后并不会立即收到来自 TC 的 retry。  
> 
> 以下是日志，可以看到默认 RM 初始化的时候 resourceIds 是空的：
> [timeoutChecker_2] INFO io.seata.core.rpc.netty.NettyPoolableFactory - NettyPool create channel to transactionRole:RMROLE,address:127.0.0.1:8091,msg:< RegisterRMRequest{resourceIds='null', applicationId='api', transactionServiceGroup='my_test_tx_group'} >
> 
> 使用 API 方式，跑的是 seata-sample-api 这个 demo，AT 模式。

A：1.其实 RMClient.init 的时候，并不会进行注册，真正进行注册的是初始化 DataSourceProxy的 时候。
2.如果注册的时候 resourceIds='null'，很有可能你的 DataSourceProxy 没有初始化，也即是数据源没代理成功。

> 是的我观察到的就是这个现象，我这边项目更希望在 API 模式下使用 Seata，所以并没有通过 spring 启动，可能 DataSourceProxy 没有自动初始化，所以这里是不是应该有什么方式可以手动触发 DataSourceProxy 初始化的过程。

A：手动配置一样就可以了，像这样子：
```
<bean id="dataSourceProxy" class="io.seata.rm.datasource.DataSourceProxy">
    <constructor-arg ref="dataSource" />
</bean>
```

> 哦哦，所以我要在 RMClient.init 启动后，马上手动获取一次 DataSourceProxy。Demo 中的这个 DataSourceUtil 要在第一次 getDataSource 的时候才会初始化 proxy，所以我要在 RMClient.init 启动后马上  get 一次数据源就好了， 测试通过。

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

### 本周推荐阅读

- [基于 MOSN 和 Istio Service Mesh 的服务治理实践](/blog/mosn-istio-service-mesh/)
- [再启程，Service Mesh 前路虽长，尤可期许](/blog/service-mesh-the-road-ahead-long/)
- [记一次在 MOSN 对 Dubbo、Dubbo-go-hessian2 的性能优化](/blog/mosn-dubbo-dubbo-go-hessian2-performance-optimization/)
- [云原生网络代理 MOSN 透明劫持技术解读 | 开源](/blog/mosn-transparent-hijacking/)

### SOFA 项目进展

**本周发布详情如下：**

**发布 SOFABolt v1.6.2 版本，主要变更如下：**

- 支持检查连接并异步创建连接；
- 支持用户设置 UserProcessor 的 ClassLoader；
- 修复 URL 对象默认连接数为0导致不创建连接的问题；
- 修复无可用连接的 ConnectionPool 无法被回收的问题；

详细发布报告：[https://github.com/sofastack/sofa-bolt/releases/tag/v1.6.2](https://github.com/sofastack/sofa-bolt/releases/tag/v1.6.2)

### 社区活动报名

![SOFAChannel#18](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1595586930012-b60cdc2c-60da-44cc-b1d8-1c2f219e7e19.jpeg)

机密计算（Confidential Computig）是近年来发展迅速的一种安全技术，它利用可信执行环境（TEE）——如 Intel SGX——来保证内存数据始终处于加密状态，因而将安全性提高到前所未有的程度，并赋能了诸多新型应用场景，比如多方联合数据分析、隐私保护的机器学习、保证机密性的区块链合约等等。虽然技术本身令人兴奋，但机密计算对应用开发者有比较高的门槛，令人望而却步。

针对上面的问题，蚂蚁集团开源了 Occlum 项目，一款使用 Rust 语言开发的、面向机密计算的 TEE OS，可使得任何语言的任何应用程序轻松地移植进 TEE 环境。**本次分享既会从用户角度介绍如何使用 Occlum 的轻松开发机密计算应用，也会从技术角度分享 Occlum 技术架构和特色。**

Occlum 网站：[https://occlum.io](https://occlum.io)

Occlum Github：[https://github.com/occlum/occlum](https://github.com/occlum/occlum)

**本期主题：**《**SOFAChannel#18：零门槛的机密计算：Occlum LibOS 使用入门和技术揭秘》**

**分享嘉宾**：田洪亮（花名：樱桃） 蚂蚁集团技术专家 Occlum 开源负责人

**你将收获：**

- 了解机密计算领域的最新进展；
- 了解 Occlum 的技术架构；
- 了解使用 Rust 语言开发安全软件的一手经验；
- 了解如何将创新工作转化为实用系统；

**直播时间：**2020-07-30 19:00-20:00

**报名方式：**点击“[这里](https://tech.antfin.com/community/live/1280)”，即可报名
