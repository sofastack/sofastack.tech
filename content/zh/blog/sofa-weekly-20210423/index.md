---
title: "SOFA Weekly |QA 整理"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY |QA 整理"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2021-04-23T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*Ig-jSIUZWx0AAAAAAAAAAAAAARQnAQ"
---
SOFA WEEKLY | 每周精选，筛选每周精华问答
同步开源进展，欢迎留言互动
![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*ARgKS6SuU7YAAAAAAAAAAAAAARQnAQ)
SOFAStack（Scalable Open Financial Architecture Stack）是蚂蚁金服自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

SOFAStack 官网: [https://www.sofastack.tech](https://www.sofastack.tech/)
SOFAStack: [https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动
我们会筛选重点问题
通过 " SOFA WEEKLY " 的形式回复

**1、@谭新宇** 提问：

>请教 SOFAJRaft 的问题：默认的 election timeout 这么小嘛？业务压力比较大的话感觉很可能发生超过 1s 的 STW GC 吧，这时会不会导致频繁换主。<br />

A：最好调整下默认参数，不过 1s 的 STW 实际上也不太正常，需要优化。<br />
SOFAJRaft：[https://github.com/sofastack/sofa-jrafta](https://github.com/sofastack/sofa-jraft)<br />

**2、@刚刚** 提问：

> SOFARPC 是通过 MOSN 转发协议？SOFA RPC 对外注册的 IP 在 k8 的容器是什么策略？<br />

A：：MOSN 支持 SOFARPC 协议的转发。<br />A：服务发布订阅没有做啥特殊的，就和原来是一样的。<br />
MOSN:[https://github.com/mosn/mosn](https://github.com/mosn/mosn)<br />

**3、@王哲** 提问：

>问下 MOSN 对 Kubernetes 版本有限制么？

A：MOSN 对 K8s 没有强制版本要求，不过 Istio 是对其有版本要求的，具体可以看文档：[https://istio.io/latest/about/supported-releases/#support-status-of-istio-releases](https://istio.io/latest/about/supported-releases/#support-status-of-istio-releases)。<br />
MOSN:[https://github.com/mosn/mosn](https://github.com/mosn/mosn)<br />

**4、@王哲** 提问：

>我试了下 mosn bookinfo出现了这个问题：那个 demo Istio 注入后 yaml 文件是 OK 的，但是运行时 describe pod 看 binaryPath 又变成了 envoy，下面是运行时的，不知道是不是因为这个问题？<br />
>![](https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*cbZ7TodQ6WAAAAAAAAAAAAAAARQnAQ)
>![](https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*4jQOQb6d0FcAAAAAAAAAAAAAARQnAQ)
>![](https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*H69VTamyMxoAAAAAAAAAAAAAARQnAQ)

A：看起来是你修改的路径没有生效，可以先在 configmap 里面修改下这个 binarypath 。<br />
MOSN:[https://github.com/mosn/mosn](https://github.com/mosn/mosn)<br />

**5、@朱闯** 提问：

>请教个问题：saga 模式下是无锁的，一阶段就提交了本地事务，那么也会出现脏写而导致没法正常回滚事务的情况吧。<br />

A：所以允许向前重试，最终一致。向前是最终一致，没有脏写。<br />
Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

**6、@何凯博** 提问：

>请教下各位大佬，xa 模式下 Seata 是怎么实现事务隔离的？<br />

A：xa 就是本地事务隔离，把本地事务 prepare，到二阶段再提交或者回滚。<br />
Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

**7、@谢太阳** 提问：

>A 项目独立库，B 项目用 sharding jdbc 分库分表，A 项目发起分布式事务，出现异常，B 项目不回滚，请教这个一般是什么问题呢？上面是 A 调用 B 的日志，没有分支的回滚记录。下面 B 调用 A 是正常的。<br />
>![](https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*cLaoQoWOaX0AAAAAAAAAAAAAARQnAQ)

A：xid 传递检查一下，数据源代理没成功，或者 xid 没传递。<br />
Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

### 本周推荐阅读

- [Rust 大展拳脚的新兴领域：机密计算](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487576&idx=1&sn=0d0575395476db930dab4e0f75e863e5&chksm=faa0ff82cdd77694a6fc42e47d6f20c20310b26cedc13f104f979acd1f02eb5a37ea9cdc8ea5&scene=21)

- [开发 Wasm 协议插件指南](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487618&idx=1&sn=c5018dc2ddf1671d3fa632358ed6be90&chksm=faa0ff58cdd7764e61940713ac7f16b149b917662e54ea7b2590a701e7ca2d7dea50a3babf1c)

- [Protocol Extension Base On Wasm——协议扩展篇](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487546&idx=1&sn=72c3f1ede27ca4ace7988e11ca20d5f9&chksm=faa0ffe0cdd776f6d17323466b500acee50a371663f18da34d8e4cbe32304d7681cf58ff9b45&scene=21)

- [WebAssembly 在 MOSN 中的实践 - 基础框架篇](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487508&idx=1&sn=4b725ef4d19372f1711c2eb066611acf&chksm=faa0ffcecdd776d81c3d78dbfff588d12ef3ec3c5607036e3994fee3e215695279996c045dbc&scene=21)

### 本周发布

**本周发布详情如下：**<br />
**1、Occlum 发布了 0.22.0 版本，主要变更如下：**<br />

- **三个新的 demo：redis，Flink 和 Enclave RA_TLS**
- **支持 /dev/shm 文件子系统**
- **支持 golang1.16.3**

详细参考：<br />[https://github.com/occlum/occlum/releases/tag/0.22.0](https://github.com/occlum/occlum/releases/tag/0.22.0)
