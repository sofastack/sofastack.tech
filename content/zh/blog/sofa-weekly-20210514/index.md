---
title: "SOFA Weekly | SOFARegistry 发布新版本，QA 整理"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | SOFARegistry 发布新版本，QA 整理"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2021-05-14T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*Ig-jSIUZWx0AAAAAAAAAAAAAARQnAQ"
---
SOFA WEEKLY | 每周精选，筛选每周精华问答
同步开源进展，欢迎留言互动
![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*ARgKS6SuU7YAAAAAAAAAAAAAARQnAQ)

SOFAStack（Scalable Open Financial Architecture Stack）是蚂蚁金服自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

SOFAStack 官网: [https://www.sofastack.tech](https://www.sofastack.tech/)<br/>

SOFAStack: [https://github.com/sofastack](https://github.com/sofastack)

**每周读者问答提炼 **

欢迎大家向公众号留言提问或在群里与我们互动
我们会筛选重点问题通过 
" SOFA WEEKLY " 的形式回复

**1、@张思雨**提问：

> 我配置中心里加了 
> transport.threadFactory.clientSelectorThreadSize...设置了个 100，这个值是不是一般设置成 cpu 核数*2 就够了啊？ 
> 我之前遇到了 tc 调客户端的 commit 超时。我就把这种值都调大了试试效果 ，
> transport.threadFactory.clientSelectorThreadSize 100 
> transport.threadFactory.workerThreadSize 3000

A：线程数这个东西这不该开放出去，很危险，对 netty 了解一点应该也知道 NioEventLoopGroup 的最多应该就核心数的两倍。<br/>
Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

**2、@林南行**提问：

> 大家好，请教一个问题：我现在用的 seata-server 的 1.3.0 的版本，客户端用的是 1.4.1 版本。当同时启动 10+个微服务连接 seata-server 的时候，只有 10 个能注册成功，剩余的必须重启后才能重新注册成功，这个是什么问题呢？

A：试一下把 logSerialization 改成 kyro。<br/>
Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

**3、@林南行**提问：

> seata-server-1.3.0 和 seata-server-1.4.2 在配置上有什么区别吗？
> 两边的 registry.conf 配置是一样的，但是 1.3.0 能正常启动，1.4.2 就报错，global_table 找不到。

A：没区别，说明配置有问题，看看 global_table 写了没，写了的话，写的是什么，配置中心是什么，检查清除。<br/>
Seata：https://github.com/seata/seata(https://github.com/seata/seata)

**4、@潘顾昌**提问：

> 请问什么情况这个状态会是 Finished？现在导致这部分数据没有提交，但是也没有报错，正常的数据提交后看到的都是这个。
> ![](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*HIE8T5HyI-4AAAAAAAAAAAAAARQnAQ)
> ![](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*oR2_S6ncqnkAAAAAAAAAAAAAARQnAQ)
> 现在有些情况会返回 Finished，导致没有正常提交。

A：事务结束了不就是 Finished，自己服务降级了吧，导致没回滚，部分插入部分没插入了。<br/>
Seata：https://github.com/seata/seata(https://github.com/seata/seata)

**5、@潘顾昌**提问：

> Finished 已经插入的数据会回滚丢失吗？我们后台实时监控到，一开始是插入到数据库的，确实是有的，但是结束以后数据就丢失了

A：seata 没有执行二阶段回滚，不会消失数据，数据丢失要么是本地事务发生异常，你们捕获异常了，用 spring API 来回滚了本地事务，导致异常没抛出去，事务回滚了，要么发生异常，被你们的全局异常捕获器捕获了，导致决议了提交，实际上数据已经被本地事务回滚，seata 在二阶段不是 rollback 相关状态的时候不会干预业务数据。<br/>
Seata：https://github.com/seata/seata(https://github.com/seata/seata)

**本周推荐阅读 **

- [稳定性大幅度提升：SOFARegistry v6 新特性介绍](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487799&idx=1&sn=3f2c120cd6d6e653e0d7c2805e2935ae&chksm=faa0feedcdd777fbebe262adc8ce044455e2056945460d06b5d3af3588dfd3403ca2a976fa37&scene=21)

- [Rust 大展拳脚的新兴领域：机密计算](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487576&idx=1&sn=0d0575395476db930dab4e0f75e863e5&chksm=faa0ff82cdd77694a6fc42e47d6f20c20310b26cedc13f104f979acd1f02eb5a37ea9cdc8ea5&scene=21)

- [开源项目是如何让这个世界更安全的？](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487060&idx=1&sn=48ed2ad1c75daecdbf8bf5f8fb71451e&chksm=faa0e18ecdd768989197c482dda02be2a3eb0f3e3dcac40e1de14229bfb782d4984a150ff19b&scene=21)

- [积跬步至千里：QUIC 协议在蚂蚁集团落地之综述](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487717&idx=1&sn=ca9452cdc10989f61afbac2f012ed712&chksm=faa0ff3fcdd77629d8e5c8f6c42af3b4ea227ee3da3d5cdf297b970f51d18b8b1580aac786c3&scene=21)

###**本周发布**###<br/>
**本周发布详情如下：**

**本周 sofa-registry 发布 V6-alpha 代码，本版本不建议生产使用，正式版本会在近期 release。主要更新如下：**

1. 支持应用级服务发现
2. 基于 slot 分配的数据分片存储

**详细参考**：https://github.com/sofastack/sofa-registry/tree/v6-alpha1 <br/>
**文章解读**：[https://mp.weixin.qq.com/s/-5oK-EuZWpvIATvTzSMRAw]
