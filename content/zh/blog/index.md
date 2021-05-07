---
title: "SOFA Weekly |QA 整理"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY |QA 整理"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2021-05-07T15:00:00+08:00
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

**1、@Chrosing** 提问：

> Seata 被锁的 xid 数据 一直卡住的时候， 为啥丢失了一部分 undo_log 语句？导致直接删除 lock_table 的 xid 时候，没有回滚数据回去，当前版本 1.3.0。<br />

A：不会丢 undolog，只可能回滚了部分，部分因为脏写了导致没法回滚，这部分的 undolog 留着；所以看起来 undolog 少了，其实是分支回滚调了，留着的都是没有回滚的。<br />
Seata：[https://github.com/seata/seata](https://github.com/seata/seata)<br />

**2、@洪波森** 提问：

>这算一个 bug 吗，永远跑不进来？<br />
>![](https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*XOvFQoDU2SwAAAAAAAAAAAAAARQnAQ)

A：不是，读不到你事务分组对应的值，就是 null。<br />
Seata：[https://github.com/seata/seata](https://github.com/seata/seata)<br />

**3、@陈承邦** 提问：

>sharding-transaction-base-seata-at 这个包只对 Seata 做了代理，我看了一早上源码，直接用 Seata 包 好像也不影响 分布式事务

A：Seata 无法找到具体那个 datasource，Seata 只能代理 sharding-jdbc 最外层的 datasource，这个 datasource 里面有 N 个 datasource 来实现分库分表的功能，这个才是真正对数据库的 <br />
Seata：[https://github.com/seata/seata](https://github.com/seata/seata)<br />

**4、@杨政伟** 提问：

>请教一个问题，如果 A 方法调用 B 方法，B 方法启用了事务，并发生异常时，但 B 方法并没有回滚，怎么能实现 B 方法的回滚？<br />
>![](https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*BBW6RIUrAtgAAAAAAAAAAAAAARQnAQ)

A：在同一个类里面被其他方法调用，是不能开启事务的，看一下 aop 的机制。a 是个实例  cglib 代理了 a 成为了一个包装了它的实例，此时你直接调了内部的实例，怎么走到它的切面去呢？<br />
Seata：[https://github.com/seata/seata](https://github.com/seata/seata)<br />

### 本周推荐阅读

- [下一代机密计算即将到来：性能比肩普通应用](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487748&idx=1&sn=938d59ac5cad9a17ac531e4e6e431a8c&chksm=faa0fedecdd777c86c3ffef61dcd605c7e985d5c54412ece50e541881a272415aef4a0838db1&scene=21)

- [积跬步至千里：QUIC 协议在蚂蚁集团落地之综述](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487717&idx=1&sn=ca9452cdc10989f61afbac2f012ed712&chksm=faa0ff3fcdd77629d8e5c8f6c42af3b4ea227ee3da3d5cdf297b970f51d18b8b1580aac786c3&scene=21)

- [Rust 大展拳脚的新兴领域：机密计算](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487576&idx=1&sn=0d0575395476db930dab4e0f75e863e5&chksm=faa0ff82cdd77694a6fc42e47d6f20c20310b26cedc13f104f979acd1f02eb5a37ea9cdc8ea5&scene=21)

- [WebAssembly 在 MOSN 中的实践 - 基础框架篇](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487508&idx=1&sn=4b725ef4d19372f1711c2eb066611acf&chksm=faa0ffcecdd776d81c3d78dbfff588d12ef3ec3c5607036e3994fee3e215695279996c045dbc&scene=21)

