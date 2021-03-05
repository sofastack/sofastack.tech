---
title: "SOFA Weekly | QA 整理"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY |  QA 整理"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2021-03-05T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*Ig-jSIUZWx0AAAAAAAAAAAAAARQnAQ"
---

SOFA WEEKLY | 每周精选，筛选每周精华问答
同步开源进展，欢迎留言互动

![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*ARgKS6SuU7YAAAAAAAAAAAAAARQnAQ)

SOFAStack（Scalable Open Financial Architecture Stack）是蚂蚁金服自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

SOFAStack 官网: [https://www.sofastack.tech](https://www.sofastack.tech/)

SOFAStack: [https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动
我们会筛选重点问题
通过 " SOFA WEEKLY " 的形式回复

**@刘嘉伟** 提问：
>请教一下：我在纯 TCC 事务 a、b、c个服务调用中 c 服务异常了，b 服务回滚日志是
> rm handle undo log process:
> UndoLogDeleteRequest{resourceId='insert', saveDays=7, branchType=AT}
> 明明是纯 TCC 事务，怎么 AT 都出来了，导致了一个问题：TCC 数据源也没有代理的，也没有相应的 undo log表，然后 AT 事务回滚肯定无效的，TCC 的 cancel 也没有执行。

A：这个理论上来说是没影响的，定时触发的，跟你本身的回滚逻辑应该没关系；这个 pr 会优化这个点：[https://github.com/seata/seata/pull/3501](https://github.com/seata/seata/pull/3501)。

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

**@刘嘉伟** 提问：
> 请问 AT 模式中如何防止事务回滚时，系统中一闪而过的脏数据，有时页面刚好打开，被用户感知到这些脏数据了；人工处理很麻烦，触发异常因为回滚操作有耗时，脏数据通常怎么处理；TCC 就没有这个问题，隔离的资源用户感知不到。

A：数据在数据库，在数据库写被隔离的；前端本身就会有脏读出现，要靠后端保证。

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

**@赵勇** 提问：
> 比如这个图：A、B、C 各自都有自己的代码、自己的数据库，分开部署的；A 调用 B、C 提供的服务，那 undo_log 要在 db-a、db-b、db-c 里都建一份，然后 A、B、C 的代码里都要引入全局事务相关的类、包， 再加上把 GlobalTransaction 标到 A 的代码上，是这样实现吗；我看 GTS 的文档，感觉 undo_log 是 A 的代码引入的类包去写的，不是 B、C 自己写的，B、C 的代码还是该怎么写怎么写，不需要接全局事务相关的东西。
>![](https://cdn.nlark.com/yuque/0/2021/png/12405317/1614935011044-ea523d0e-dbd4-43ff-ac91-97686c4bbe4f.png)

A：Undo_log 是每一个微服务的业务数据库都要建立，各自维护自己的 Undo_log；如果刚入门了解的话，先看看官网和跑一跑 demo。

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

**@吴宗杰** 提问：
> 2020 年 4 月份 Seata 从 1.2.0 支持 XA 协议，Mycat 支持 XA 分布式事务，是不是说明 Seata 和 Mycat 可以一起用？不过看到 19 年 slievrly 有和 Mycat 方沟通，后面应该也会支持的吧。

A：可以试试，因为 Seata 所谓的 XA 模式是对支持了 XA 协议的数据库的 API 进行自动化的，XA 事务开启和统一提交回滚，Mycat 是属于一种 proxy，伪装的数据库层来代理背后的数据库，不知道这种结合会不会有什么问题存在，特别是 XA 这种出现中间层和 Seata 的兼容问题导致 XA 死锁就麻烦大了。

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

**@谭玖鹏** 提问：
> 请教一个问题，这个 LoadLevel 注解有什么作用
> 
> ![](https://cdn.nlark.com/yuque/0/2021/png/12405317/1614935011072-8fbfd6e6-ce2a-46a6-85a5-092f68ee1978.png)

A：看一下
EnhancedServiceLoader#getUnloadedExtensionDefinition 这个函数，跟一下 spi 那块加载的代码就知道了，跟 dubbo 那边差不多，dubbo 有个博客解析：[https://dubbo.apache.org/zh/docs/v2.7/dev/source/dubbo-spi/](https://dubbo.apache.org/zh/docs/v2.7/dev/source/dubbo-spi/)。

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

**@winyQ** 提问：
> 不用 Seata 事务的数据操作方法里用的 datasource 还是代理数据源对象，这个没办法改吗，一旦设置 datasourceproxy，好像就一直只能用这个了。

A：虽然拿到的都是 datasourceproxy，但是没有 globaltransational 和线程中没有 xid 的时候都是不会干预的；内部还是原来的 datasource 做操作，如果你确定没有 2 个服务以上参与的函数，可以用 globallock+ 对要修改的数据进行 for update 先再做写操作，会比直接加 globaltransational 注解效率高，但是相对而言入侵也高了。

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

### 本周推荐阅读

- [Serverless 给任务调度带来的变化及蚂蚁集团落地实践](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487387&idx=1&sn=aa5611c20ac32f5f58e12488f1285824&chksm=faa0e041cdd769575a8f5921fed99968277be197544ccd9246e2f1a675b7a275b42e07ac61de&scene=21)

- [Service Mesh 双十一后的探索和思考(上)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487314&idx=1&sn=55a6a84986290888e15719446365c986&chksm=faa0e088cdd7699e2a2a4594850699713cbd698531dba1f7309f755375232560f8f758230a85&scene=21)

- [Service Mesh 双十一后的探索和思考(下)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487357&idx=1&sn=f9a8d34452c4b777fe8094cddb17ad7e&chksm=faa0e0a7cdd769b1c767cf15ca736ceca6fb5626b0363db908f4ead7e814e275fecd3037a13e&scene=21)

- [蚂蚁 Service Mesh 大规模落地实践与展望](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487233&idx=1&sn=f2b4ff05edf64f3a32033d5b1013717d&chksm=faa0e0dbcdd769cd7cdf292e3c341012004a8963cc26547069a2b96dfd4a769423a95849cf2c&scene=21)
