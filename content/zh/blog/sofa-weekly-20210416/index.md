---
title: "SOFA Weekly | SOFATracer 发布新版本，QA 整理"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY |SOFATracer 发布新版本，QA 整理"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2021-04-16T15:00:00+08:00
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

**1、@藜蒿** 提问：

>请问一下，SOFATracer+SpringBoot 如何在 spring-mvc-digest.log 增加 rest 请求的请求体数据在 json 日志中。需要打印 request 数据，不单单是 url 上的，可能是 post 请求放在 body 里面的。A：可以用这里的命名空间：<br />

A：这个暂时不行，不过你可以通过手动埋点的方式去拿这些信息，可以提个 issue ，详细描述下场景诉求。<br />
SOFATracer：[https://github.com/sofastack/sofa-tracer](https://github.com/sofastack/sofa-tracer)<br />

**2、@南桥** 提问：

> 请问下 select * for update,  在 Seata 的事务中，除了会加一个全局的锁，还会加数据库锁吗？
> 如果一条记录在分布式事务中，已经加了 for update 读。 那么这条记录再在数据库本地事务中，不加 @GlobalLock，加 for update 读，能读到吗？<br />

A：不会加全局锁，先加本地锁。<br />
A：如果要根据读的结果来写，为了得到分布式事务下的已提交数据，需要 for update。数据库层面可以快照读，但是无法当前读（for update 会阻塞），上了分布式事务后，结果都是二阶段后才是准确的，因为有了分布式事务的概念，在此之下的所有本地事务，也就是数据库方的数据已经不能算是准确的了，因为在 AT 模式下随时都有会回滚数据。<br />
Seata：[https://github.com/seata/seata](https://github.com/seata/seata)<br />

**3、@姜广兴** 提问：

>saga 模式 demo 中的服务都有对应的补偿服务，如果对接外部系统，没有提供相应的补偿服务，还可以使用 saga 模式吗？

A：可以，没有补偿服务就不补偿，可以向前重试。<br />
Seata：[https://github.com/seata/seata](https://github.com/seata/seata)<br />

**4、@彭勃** 提问：

>看到这段，我请教一下。目前，我们自己通过再加一个 mysql MGR 集群去回避这个外部持久化单点故障的问题请问有人有过相关实践吗？您觉得可行吗？<br />
![](https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*TzGXS558iF0AAAAAAAAAAAAAARQnAQ)

A：可以这么做，MGR 的话性能应该就比单 DB 要下降了，但是比主备要靠谱，主备的话还是有可能丢数据，MGR 有一致性协议存在，理论上没什么大问题。<br />
Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

### 本周推荐阅读

- [Rust 大展拳脚的新兴领域：机密计算](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487576&idx=1&sn=0d0575395476db930dab4e0f75e863e5&chksm=faa0ff82cdd77694a6fc42e47d6f20c20310b26cedc13f104f979acd1f02eb5a37ea9cdc8ea5&scene=21)

- [Protocol Extension Base On Wasm——协议扩展篇](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487546&idx=1&sn=72c3f1ede27ca4ace7988e11ca20d5f9&chksm=faa0ffe0cdd776f6d17323466b500acee50a371663f18da34d8e4cbe32304d7681cf58ff9b45&scene=21)

- [WebAssembly 在 MOSN 中的实践 - 基础框架篇](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487508&idx=1&sn=4b725ef4d19372f1711c2eb066611acf&chksm=faa0ffcecdd776d81c3d78dbfff588d12ef3ec3c5607036e3994fee3e215695279996c045dbc&scene=21)

- [MOSN 的无人值守变更实践](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487479&idx=1&sn=e5972cbc1d8c04cff843380117158539&chksm=faa0e02dcdd7693b965e35014cfef4dc3be84e477e0c74694421658a2570162ad73883e7b054&scene=21)

### 本周发布

**本周发布详情如下：**<br />**1**、SOFATracer **** 发布 **v3.1.1 版本，主要变更如下：**

- 添加数据脱敏扩展点，默认无对应的开源实现，用户可以自定义；商业版则提供了该实现 。<br />
详细参考：<br />https://github.com/sofastack/sofa-tracer/releases/tag/v3.1.1
