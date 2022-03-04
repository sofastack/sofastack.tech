---
title: "SOFA Weekly |BabaSSL 发布新版本、本周 Contributor、QA 整理"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly |社区新年祝福、QA 整理、MOSN 本周发布"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2022-03-04T15:00:00+08:00
cover: "https://gw.alipayobjects.com/zos/bmw-prod/5bcdff25-e21a-43ab-8e34-04305cd379ae.webp"
---

SOFA WEEKLY | 每周精选，筛选每周精华问答

同步开源进展，欢迎留言互动

![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*Fbc6T6UeKyUAAAAAAAAAAAAAARQnAQ)

SOFAStack（Scalable Open Financial Architecture Stack)是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

SOFAStack 官网: [https://www.sofastack.tech](https://www.sofastack.tech/)

SOFAStack: [https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动

我们会筛选重点问题

通过 " SOFA WEEKLY " 的形式回复

**@冷建伟** 提问：

>启动 SOFABoot 报错：Can not found binding converter for binding type bolt。跟到源码发现：bindingTypeBindingConverterMap 只有 jvm，没有 bolt。跟到源码发现 SPI load 的 converter 只有 JVM。版本：runtime-sofa-boot-starter-3.1.4.jar。想问下是不是要升级我的 SOFA SDK 版本 ？

A：这个引入 rpc starter 即可。

**@leon** 提问：

>SOFARegistry  是不需要用 K8s 吗？

A：SOFARegistry 在内部是基于 K8s 部署的，提供更细粒度更高性能的服务发现。

>为什么不是想办法优化 K8s 服务发现性能，而是搞代码侵入性的方案？

A：基于 K8s 的实现的无侵入式服务发现是云原生下的一套较为后期和理想的方案，这也是 SOFARegistry 后续演进的规划之一。

目前依然采用侵入的发布订阅模式，一是性能的考量，现有的 K8s 很难支撑起数千万级别数量的服务以及稳定推送延迟的要求；二是迁移有一个过程，对大量现有应用进行服务发现的改造是一个很长周期，无侵入式服务发现会采用逐渐接入的方式。

目前重点还在于如何更好更稳定的支撑起超大规模集群的问题上。

**@来永国** 提问：

>SOFATracer 加了 sofa-tracer-rocketmq-plugin 扩展包，还需要做什么配置吗？

A：需要配置一下 SendMessageHook 和 ConsumeMessageHook 这两个 hook，分别是：SofaTracerSendMessageHook、SofaTracerConsumeMessageHook。

### 本周发布

BabaSSL 开源发布 8.3.0 版本，主要更新如下：

修复 CVE-2021-4160

openssl enc 命令支持 wrap 模式

ASYNC: 支持 job 的嵌套

支持 TLS 证书压缩 (RFC 8879)

发行版上游 patch 集合合并 [hustliyilin]

支持 NTLS session ticket

支持祖冲之消息完整性算法 128-EIA3

支持 NTLS 客户端认证

移除 ARIA 算法

支持国密合规的软随机数生成器

支持半同态加密算法 EC-ElGamal

在 NTLS 中支持 RSA_SM4 加密套件

ARM 平台上提供 SM3 和 SM4 的性能优化

SM4 算法逻辑优化以提升性能 [zzl360]

### SOFAStack&MOSN:新手任务计划 

作为技术同学，你是否有过“想参与某个开源项目的开发、但是不知道从何下手”的感觉？

为了帮助大家更好的参与开源项目，SOFAStack 和 MOSN 社区会定期发布适合新手的新手开发任务，帮助大家 learning by doing!

Layotto

- Easy

为 actuator 模块添加单元测试

为 Java SDK 新增分布式锁、分布式自增 ID API

- Medium

让 Layotto 支持 Dapr API

开发 Rust、Python、SDK

「详细参考」：[https://github.com/mosn/layotto/issues/108#issuecomment-872779356](https://github.com/mosn/layotto/issues/108#issuecomment-872779356)

SOFARPC

- Easy

优化 SOFARPC 使用文档

- Medium

优化 SOFARPC 的异步编程体验

「详细参考」：

[https://github.com/sofastack/sofa-rpc/issues/1127](https://github.com/sofastack/sofa-rpc/issues/1127)

### MOSN 本周发布

发布 MOSN V0.26.0 版本，主要变更如下：

主要更新如下：

1. XProtocol 进行了重构，XProtocol 不再是一种协议，而是便于协议扩展实现的框架

2. 新增 ip_access filter，基于来源 IP 的 ACL 控制器

3. 支持 go plugin 加载协议转化插件，并支持动态选择协议转换插件

4. 支持动态设置上游协议，使用 transcoder filter 来替换 Proxy 中的协议转换

5. 其他优化与BUG Fix

「详细参考」：

[https://mosn.io/blog/releases/v0.26.0/](https://mosn.io/blog/releases/v0.26.0/)

### 本周推荐阅读

[BabaSSL 发布 8.3.0｜实现相应隐私计算的需求](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247502271&idx=1&sn=861bcea32cc766721bb6fd95361ef6eb&chksm=faa32665cdd4af73dcc42c51f79e6c61035cddf95ecad822ea6e85cb188c60cb85c9b8027484&scene=21#wechat_redirect)

[探索 SOFARegistry（一）｜基础架构篇](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247502139&idx=1&sn=015419fdc360c07030cf147cbfb1cf2f&chksm=faa326e1cdd4aff71d498bbdcdf3e2bf83e53a7a0cfc6c01ff123860e074d199411191b3ea13&scene=21#wechat_redirect)

[社区会议｜MOSN 社区将会发布 1.0 版本，同时推动下一代架构演进](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247502035&idx=1&sn=7854ee79b923d5431903f787ff9edc73&chksm=faa32709cdd4ae1fce7b031a5ceed38018dbcc61da42024649d8ef0c5b39d823d508004239a8&scene=21#wechat_redirect)

[「网商双十一」基于 ServiceMesh 技术的业务链路隔离技术及实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247499337&idx=1&sn=a0f3965f5989858c7e50763e696c9c53&chksm=faa31193cdd49885045adfce40c76e7cde9b689203845f2f674c24f379c246868d272c8adcbd&scene=21t)

![img](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*tvfDQLxTbsgAAAAAAAAAAAAAARQnAQ)
