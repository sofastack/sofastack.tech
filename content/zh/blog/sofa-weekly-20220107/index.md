---
title: "SOFA Weekly |SOFA 社区插话小剧场、本周 Contributor、QA 整理"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly |SOFA 社区插话小剧场、本周 Contributor、QA 整理
"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2022-01-07T15:00:00+08:00
cover: "https://gw.alipayobjects.com/zos/bmw-prod/5bcdff25-e21a-43ab-8e34-04305cd379ae.webp"
---

SOFA WEEKLY | 每周精选，筛选每周精华问答

同步开源进展，欢迎留言互动

![weekly.jpg](https://gw.alipayobjects.com/zos/bmw-prod/5bcdff25-e21a-43ab-8e34-04305cd379ae.webp)

SOFAStack（Scalable Open Financial Architecture Stack)是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

SOFAStack 官网: [https://www.sofastack.tech](https://www.sofastack.tech/)

SOFAStack: [https://github.com/sofastack](https://github.com/sofastack)

### SOFA&MOSN 社区 本周 Contributor

![img](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*eAqRQJs9WBIAAAAAAAAAAAAAARQnAQ)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动

我们会筛选重点问题

通过 " SOFA WEEKLY " 的形式回复

**@王勇旭** 提问：

> com.alipay.sofa.rpc.boot.runtime.adapter.processor.ConsumerConfigProcessor 没有提供注解上的支持，自己实现来处理吗？Cluster 指定 failover、failfast 或者自己实现，这种在 SOFA 中是怎么使用的呢？<br/>
![img](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*Po9JTL2ggu4AAAAAAAAAAAAAARQnAQ)

A：这种的话，单个注解的 API 是不支持的。不过可以通过调整整体的 RPC 的配置，来实现切换到你想使用的 Cluster 上。具体如何配置可以看代码这里，支持自定义的配置文件，也支持 -D 环境变量的方式传入，key 为 consumer.Cluster。

![img](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*jSmlQbm9FN4AAAAAAAAAAAAAARQnAQ)

> 为啥不支持单个 API 的配置啊，是出于某种考虑吗?

A：单个 API 的话，可以单独通过 ConsumerConfig 的 setCluster(String Cluster)去设置。但是不是通用功能，所以没加到 annotation 上。

> 感觉和 loadbalance 是差不多同一级的，注解上 lD 支持，Cluster 不支持...

A：这个功能感觉更偏全局一些，当然也是有单个 API 自定义的需求，之前的设计可能也是基于这个考量。

「SOFARPC」：[https://github.com/sofastack/sofa-rpc](https://github.com/sofastack/sofa-rpc)

**@崔伟协** 提问：

> 所有整个流程里的异常返回（那些没转发到 Upstream/或者转发失败的，直接返回给 client)都会经过这里吗？<br/>
[https://github.com/mosn/mosn/blob/master/pkg/proxy/downstream.go#L1359](https://github.com/mosn/mosn/blob/master/pkg/proxy/downstream.go#L1359)

A：也不一定，你的诉求是啥呢？但是所有请求基本都会走 filter，你可以在 append filter 劫持返回的请求。

> 就是捕获一波没转发的或者转发失败的，不包括已经转发的然后返回失败的。

A：这个可能还不太好区分，超时也算是转发的了，但超时之后也会调用 hijack。返回的包是不是 Upstream 发过来是可以判断的， 你写一个 append filter，然后判断 types.VarProxyIsDirectResponse 这个变量。

「MOSN」：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

**@我是一个小胖子** 提问：

> 这个统一路由框架，已经 ready，还是在计划中？

A：[https://mosn.io/blog/posts/how-use-dynamic-metadata/](https://mosn.io/blog/posts/how-use-dynamic-metadata/)

可以参考这篇文章，是更加灵活的方案。还有一部分没在文档里，就是路由的 match 规则也支持变量和 DSL。

「MOSN」：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

**@Noob Xu** 提问：

> 请问一下，MOSN 的国密 TLS 支持，是不是先用 --prefix=/usr/local/BabaSSL/linux_BabaSSL_lib 构建 BabaSSL，然后用 CGO_ENABLED=1 go build -tags BabaSSL 构建 MOSN，是不是就支持 TLS 1.3 + 国密单证书了 ？

A：在/usr/local/BabaSSL/linux_BabaSSL_lib 这个路径下放上 BabaSSL 的 lib，比如/usr/local/BabaSSL/linux_BabaSSL_lib，然后 CGO_ENABLED=1 go build -tags=BabaSSL 之后配置里 TLS 的 CipherSuite 按照 MOSN 支持的几种格式配置，比如 ECDHE-RSA-SM4-SM3 就可以了。在 MOSN 和 MOSN 之间的 TLS 通信就可以走 1.3 和国密了。

![img](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*pWMFSZFAc5oAAAAAAAAAAAAAARQnAQ)

「MOSN」：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

### SOFAStack&MOSN:新手任务计划

作为技术同学，你是否有过“想参与某个开源项目的开发、但是不知道从何下手”的感觉？

为了帮助大家更好的参与开源项目，SOFAStack 和 MOSN 社区会定期发布适合新手的新手开发任务，帮助大家 learning by doing!

**Layotto**

- Easy

为 actuator 模块添加单元测试

为 Java SDK 新增分布式锁、分布式自增 ID API

开发 in-memory 组件

- Medium

让 Layotto 支持 Dapr API

开发 Rust、Python、SDK

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

[叮，你有一份开发者问卷到了](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247499930&idx=1&sn=e50701d19fbb7a5b9f5442216416f3f0&chksm=faa32f40cdd4a656e79525ee1de867f6f539fcf73d4fff8011e1ab57972951f045d750a6cc11&scene=21)

[一图看懂 SOFAStack 社区的 2021 ｜文末有“彩蛋”](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247499732&idx=1&sn=cb27880b02df1f0a55aeb27836be7834&chksm=faa3100ecdd499180030f9b12041a4275954f393ab7bbedb2672599247451544847e3caf71f8&scene=21)

[服务网格定义企业上云新路径！ | Forrester X 蚂蚁集团 发布服务网格白皮书](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247499916&idx=1&sn=f68469b35cdb6d7e33589e724a2ed6c4&chksm=faa32f56cdd4a640cb8deb38b7a3eb046a858fb85485c4152f0302d37017d8cd1aba8f696473&scene=21)

[一行降低 100000kg 碳排放量的代码](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247499661&idx=1&sn=7c609883a7fd3b6f738bd0c13b82d8e5&chksm=faa31057cdd49941e00d39e0df6dd2e8c91050c0cb33bad124983cd8d732c6f5f2fc0bbdba49&scene=21)
