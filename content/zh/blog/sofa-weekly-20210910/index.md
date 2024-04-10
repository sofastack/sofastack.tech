---
title: "SOFA Weekly | QA 整理"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | QA 整理"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2021-09-10T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*_ewiQbuzeOQAAAAAAAAAAAAAARQnAQ"
---

SOFA WEEKLY | 每周精选，筛选每周精华问答

> ![weekly.jpg](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ)

同步开源进展，欢迎留言互动

SOFAStack（Scalable Open Financial Architecture Stack)是蚂蚁金服自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

SOFAStack 官网: [https://www.sofastack.tech](https://www.sofastack.tech/)

SOFAStack: [https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动

我们会筛选重点问题通过

" SOFA WEEKLY " 的形式回复

**1、@胡希国** 提问：

> 这个 start 函数在父进程执行完 WaitConnectionsDone()之后在哪调用的，新的子进程在迁移长连接的时候监听 conn.sock 等着老进程调 startRWloop 去连接和发送 connfd，看源码一直到 WaitConnectionsDone() 就断了，实在没找到接下来在哪执行的 ReadLoop 和 WriteLoop。

[https://github.com/mosn/mosn/blob/0ea3e3b4b2abfde2a845edc006a3e866ff0b1201/pkg/network/connection.go#L186](https://github.com/mosn/mosn/blob/0ea3e3b4b2abfde2a845edc006a3e866ff0b1201/pkg/network/connection.go#L186)

A：迁移连接之后，创建连接最后就会 start 了。

> ![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*lVjzSLZiztAAAAAAAAAAAAAAARQnAQ)

**2、@胡希国** 提问：

> 父进程的每个长连接 connection fd 里面都有一个 readloop 逻辑是吗？一旦 WaitConnectionsDone() 触发了 stopchan 那个条件，就自动做迁移了是吧。

A：是的，每个连接都有 readloop 的， WaitConnectionsDone 就是等他们迁移完。

[https://mosn.io/docs/concept/smooth-upgrade/](https://mosn.io/docs/concept/smooth-upgrade/)

这篇文章里面有写的。

> ![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*u4reRpA5n30AAAAAAAAAAAAAARQnAQ)

**3、@汪晓涛** 提问：

> 镜像地址有吗？可以对接 dapr 吗？

A：目前是七层扩展哈，对接 dapr 是四层，这个月底应该就可以支持了。

[https://github.com/mosn/mosn/issues/1563](https://github.com/mosn/mosn/issues/1563)

**4、@徐泽唯** 提问：

> 大佬帮我看下这是什么问题？xid in change during RPC from 192.168.2.115:8091:178170994535436288 to null。

A：不影响，直接升级最新的 spring-cloud-starter-alibaba-seata 和最新的 seata-all 或者 seata-spring-boot-starter 即可，只是一个日志警告。

**5、@北京 jht** 提问：

> 如果想了解一下这个组件对系统带来的开销和性能，可能会出现在哪个问题上。

A：没有实际的业务场景，结果出入比较大。RPC 开销应该是最大的消耗。

> 咱们这个 Seata-Server 的回查和提交都是异步的吧，会对 RPC 本身的耗时产生影响吗？

A：你算 RPC 一次 1ms tm begin 1ms rmregisty 1ms 如果有 3 个 rm，就是 4ms。然后 tm 决议发给 tc，5ms。如果是 tcc，那么就是 5ms + tc 下发到 3 个 rm 执行，rm 执行二阶段业务也要时间。

### 本周推荐阅读

- [2021 年云原生技术发展现状及未来趋势](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247492248&idx=1&sn=c26d93b04b2ee8d06d8d495e114cb960&chksm=faa30d42cdd48454b4166a29efa6c0e775ff443f972bd74cc1eb057ed4f0878b2cb162b356bc&token=1414725197)

- [蚂蚁集团 SOFATracer 原理与实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247491935&idx=1&sn=75421dd34ec84d5889d7a4306f1c6a03&chksm=faa30e85cdd4879335726d670e94c5b360e53a1f3f74f41c66c0c6221d5e8459c35a653e94b6&token=1414725197)

- [KCL：声明式的云原生配置策略语言](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247491634&idx=1&sn=8359805abd97c598c058c6b5ad573d0d&chksm=faa30fe8cdd486fe421da66237bdacb11d83c956b087823808ddaaff52c1b1900c02dbf80c07&token=1414725197)

- [蚂蚁集团万级规模 K8s 集群 etcd 高可用建设之路](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247491409&idx=1&sn=d6c0722d55b772aedb6ed8e34979981d&chksm=faa0f08bcdd7799dabdb3b934e5068ff4e171cffb83621dc08b7c8ad768b8a5f2d8668a4f57e&token=1414725197)

更多文章请扫码关注“金融级分布式架构”公众号

> ![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*weuLRqbBWEkAAAAAAAAAAAAAARQnAQ)
