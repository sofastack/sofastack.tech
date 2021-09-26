---
title: "SOFA Weekly | QA 整理"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly | QA 整理"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2021-09-24T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ"
---

SOFA WEEKLY | 每周精选，筛选每周精华问答

同步开源进展，欢迎留言互动
![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*_ewiQbuzeOQAAAAAAAAAAAAAARQnAQ)

SOFAStack（Scalable Open Financial Architecture Stack）是蚂蚁金服自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

SOFAStack 官网: [https://www.sofastack.tech](https://www.sofastack.tech/)

SOFAStack: [https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动<br/>

我们会筛选重点问题<br/>

通过 " SOFA WEEKLY " 的形式回复

**@证道者** 提问：

>MOSN 怎么将 HTTP 转到 Dubbo 的数据,怎么实现新的协议？

A：这个你要写个 filter ，因为每个 HTTP 字段怎么对应 Dubbo 的字段，是没有固定标准的。

A：「HTTP 转 SOFA 的例子」
[https://www.github.com/mosn/mosn/tree/master/pkg%2Ffilter%2Fstream%2Ftranscoder%2Fhttp2bolt](https://www.github.com/mosn/mosn/tree/master/pkg%2Ffilter%2Fstream%2Ftranscoder%2Fhttp2bolt)

A：这个需要 client 满足这个字段对应规范，所以一般就自己实现了。

>公司很多这种 RPC 的接口，每一个接口都要写一下 filter 吗？没有通用的转换吗？

A：一个协议就一个吧，比如 HTTP 的 header：service 对应 Dubbo 的 service。你也可以用其他的 HTTP header 来对应，比如用 dubbo-service，所以没有一个标准，就需要自己简单做个对应关系。

MOSN：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

**@王夕** 提问：

>咨询一个问题，TCC 的嵌套子事务，如果发生重试的话，如下图中的 2、6，会产生不同的 branch 记录吗？<br/>
>![](https://gw.alipayobjects.com/zos/bmw-prod/da0db886-3ee6-4211-82cf-c8701685af95.webp)

A：有可能,要么关了重试,要么做幂等

>也就是说根据 xid 做幂等，而不要根据 branchid 做幂等对吗？

A：branchid 进来一次就变一次,肯定不行,该分支同入参同 xid 一般就可以作为幂等的校验条件。

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

**@江培泉** 提问：

>请教下，oracle 用户没获取到行信息，导致 undo_log 无法插入，也无法回滚。<br/>
>![](https://gw.alipayobjects.com/zos/bmw-prod/6a31f501-f439-4e31-b627-30978e8dfab3.webp)<br/>
>主键字段类型和 JAVA 的类型：<br/>
>![](https://gw.alipayobjects.com/zos/bmw-prod/e6f4d8c1-5eec-42a8-963d-ae2bd79e7e49.webp)
>![](https://gw.alipayobjects.com/zos/bmw-prod/c7a152da-57c8-4994-a628-5b40ad6b9c6c.webp)

A：主键的 Long 改成 BigDecimal，Oracle 的 number 长度超过 19 之后，用 Long 的话，setObject 会查不出数据来。

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

### 本周推荐阅读

- [SOFAJRaft 在同程旅游中的实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247495260&idx=1&sn=a56b0f82159e551dec4752b7290682cd&chksm=faa30186cdd488908a73792f9a1748cf74c127a792c5c484ff96a21826178e2aa35c279c41b3&scene=21)

- [技术风口上的限流](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247494701&idx=1&sn=f9a2b71de8b5ade84c77b87a8649fa3a&chksm=faa303f7cdd48ae1b1528ee903a0edc9beb691608efd924189bcf025e462ea8be7bc742772e1&scene=21)

- [蚂蚁智能监控](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247494372&idx=1&sn=bb10a77c657251ee29d5fcc19c058ce7&chksm=faa3053ecdd48c28c35e262d04659766d8c0b411f1d5605b2dd7981b4345e1d4bf47cc977130&scene=21)

- [2021 年云原生技术发展现状及未来趋势](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247492248&idx=1&sn=c26d93b04b2ee8d06d8d495e114cb960&chksm=faa30d42cdd48454b4166a29efa6c0e775ff443f972bd74cc1eb057ed4f0878b2cb162b356bc&scene=21)
