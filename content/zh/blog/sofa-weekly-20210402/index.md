---
title: "SOFA Weekly | QA 整理"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | QA 整理"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2021-04-02T15:00:00+08:00
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

**1、@明惑** 提问：

>请教一下：为什么 KVStoreStateMachine#onSnapshotLoad 是 leader 的时候，不去做；leader 节点如果之前进行过 snapshot 之后，raft log 应该会被删除吧；后续集群重启的时候，leader 不用 snapshot 怎么保证数据还原呢？<br />
![](https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*zOtRRLQNpy8AAAAAAAAAAAAAARQnAQ)

A：想一下，如果它还需要 load snapshot 的话，它是怎么变成 leader 的，如果已经是 leader 了，肯定不需要 load snapshot；理论上不会走到这个分支，只是防御性的代码，如果走到这个分支，就直接报错停止状态机了。<br />
SOFAJRaft：[https://github.com/sofastack/sofa-jraft](https://github.com/sofastack/sofa-jraft)<br />

**2、@明惑** 提问：

> 现在创建 Grpc Server 的时候，只提供了 port 配置，考虑放开一些参数可以用户配置吗？比如 grpc 的 messageSize。<br />
![](https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*ohErQJnomq8AAAAAAAAAAAAAARQnAQ)

A：helper.config看一下。<br />
SOFAJRaft：[https://github.com/sofastack/sofa-jraft](https://github.com/sofastack/sofa-jraft)<br />

**3、@刘明明** 提问：

>请教一下：我现在想用 Go 去写一个组件当一个简易的 Sidecar 去对其他服务做健康检查。这个 Go 组件要整合 nacos 注册发现和元数据管理，后期也会整合 Istio，这个组件干的事情应该和 MOSN 类似，Go 这边 0 基础，我是写 JAVA 的，就比如这个用 JAVA 实现只需要 springboot 就好了，Go 这边我调研了下准备用  go-Micro，请问各位这个方向是否正确？<br />

A：可以参考这个实现： [https://github.com/mosn/mosn/issues/1087](https://github.com/mosn/mosn/issues/1087) 这个是直接对接 zk 做的。<br />
MOSN：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

**4、@彭勃** 提问：

>请教一下，关于 TCC 模式下，会有发生空回滚，资源悬挂，幂等性等问题，需要通过事务控制表去管理。我此前看到同学介绍它们会将事务控制表变成 TCC 模式的一部分（2020 年初），让业务开发者不用自己关注这些问题，请问现在 TCC 模式已经做了吗？<br />

A：目前只能支持单数据源下的防悬挂，直接利用开启 spring 本地事务，然后做一些前置操作来预防。<br />
Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

**5、@王译锌** 提问：

>请教一下：既然回滚依赖于异常上报给 TM，那为什么分支事务的状态还要上报给 TC 呢？一直没想通这个问题。<br />

A：1.方便以后出控制台可以实时查看分支事务状态； 2.比如某些分支吞了异常后，有 report 的情况下方便判断。比如：a 调 b 再调 c，b 其实已经出现异常并且本地事务下已经回滚了，此时 c 响应给 a，a 做后续处理的时候异常，此时 TC 发现 b 已经由本地事务回滚了，就无需驱动了，这样就减少了下发的数量。<br />
Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

### 本周推荐阅读

- [WebAssembly 在 MOSN 中的实践 - 基础框架篇](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487508&idx=1&sn=4b725ef4d19372f1711c2eb066611acf&chksm=faa0ffcecdd776d81c3d78dbfff588d12ef3ec3c5607036e3994fee3e215695279996c045dbc&scene=21)

- [MOSN 的无人值守变更实践](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487479&idx=1&sn=e5972cbc1d8c04cff843380117158539&chksm=faa0e02dcdd7693b965e35014cfef4dc3be84e477e0c74694421658a2570162ad73883e7b054&scene=21)

- [SOFAGW 网关：安全可信的跨域 RPC/消息 互通解决方案](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487444&idx=1&sn=1d55a7c68e105f305198eae65f587e2e&chksm=faa0e00ecdd76918b5cf4b5f4102347581de6c6f5154551d57dabfbfe16b45309f021e150a6f&scene=21)

- [Serverless 给任务调度带来的变化及蚂蚁集团落地实践](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487387&idx=1&sn=aa5611c20ac32f5f58e12488f1285824&chksm=faa0e041cdd769575a8f5921fed99968277be197544ccd9246e2f1a675b7a275b42e07ac61de&scene=21)

