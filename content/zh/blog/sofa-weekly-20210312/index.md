---
title: "SOFA Weekly | sofa-common-tools 发布新版本，QA 整理"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | sofa-common-tools 发布新版本，QA 整理"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2021-03-12T15:00:00+08:00
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

**@孙军超** 提问：
>请教一下  jraft-rheakv  rocksdb 的 get put 操作，耗时要 5 秒钟，是服务端配置需要优化吗？ 以下是我的服务端配置截图。
>![](https://cdn.nlark.com/yuque/0/2021/png/12405317/1615535598083-51de4a9b-7780-494a-889f-2e6f2c46653b.png#align=left&display=inline&height=89&margin=%5Bobject%20Object%5D&originHeight=689&originWidth=1080&size=0&status=done&style=none&width=140)

A：kill -s sigusr2 可以看到性能指标度量，官方文档请看一下有相关说明。
SOFAJRaft：[https://github.com/sofastack/sofa-jraft](https://github.com/sofastack/sofa-jraft)

**@戚金奎** 提问：
> 请教一个问题：如图，目前服务都是通过 openfeign 远程调用，如果 setScore 所在的服务抛出了异常，是能直接出发事务回滚吗（我本地的无法出发回滚），还是需要在这个 seata1 里面接受一下返回值然后抛出异常才可以回滚吗（目前我这边是这种可以回滚）？
>![](https://cdn.nlark.com/yuque/0/2021/png/12405317/1615535598078-b203d86d-02a5-40fa-8d2d-ff25cf8088c2.png)

A：决议全局提交/回滚的只能是<br />@GlobalTransactional 注解的发起者，它 catch 到异常才会触发回滚；远端的异常应该是没抛给调用者，或者被框架拦截了异常。
Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

**@谭玖朋** 提问：
>这两个地方调用 rollback 有特殊意义吗？我发现在此之前没有更新操作啊。
>![](https://cdn.nlark.com/yuque/0/2021/png/12405317/1615535598071-49f4ba0c-bcc7-41bb-8a3b-162a254c2209.png)

A：这个地方应该是一个编码的习惯，在 autocommit=false 的时候，返回前都做一次 commit 或者 rollback 操作，确保当前的事务能够提交或者回滚，同时释放数据库的锁（哪怕前面并没有事务和锁）。
Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

**@戚金奎** 提问：
> 请教一个问题：如果出现如图的这种情况， 执行的这个全局事务在获取全局锁之后，会获取 m 字段最新的值，再和自己的 before_image 里面记录的值去比较，发现不一致，全局事务失败并回滚。
> ![](https://cdn.nlark.com/yuque/0/2021/png/12405317/1615535598140-8a4e2599-2625-495f-aac0-c2fa961ef07a.png)

A：所有写场景要被 globaltransational 覆盖，不允许直接去数据库改数据。否则就会出现在全局事务被决议回滚的时候，别的地方把这个数据改了。
Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

**@姜世存** 提问：
> 请教一个问题，这个 LoadLevel 注解有什么作用

A：所以别的业务要继承 Seata，写入口加入 globaltransational 注解，只读无需加注解。
Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

**@winyQ** 提问：
> 项目里 Seata 用 AT 模式，可以在项目里再集成 JTA 吗，两个并存有没有什么问题？

A：JTA 是 XA ，无法跟 AT 兼容。
Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

### 本周推荐阅读

- [可信原生负责人入选“2021年度全球青年领袖”名单](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487429&idx=1&sn=224bfffc83c539ff4e05e2b261abdc7f&chksm=faa0e01fcdd76909d34c27543f0c24786554f697351c83a38a2db41a5e4b3bab0ab51b82541b&scene=21#wechat_redirect)

- [Serverless 给任务调度带来的变化及蚂蚁集团落地实践](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487387&idx=1&sn=aa5611c20ac32f5f58e12488f1285824&chksm=faa0e041cdd769575a8f5921fed99968277be197544ccd9246e2f1a675b7a275b42e07ac61de&scene=21)

- [Service Mesh 双十一后的探索和思考(上)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487314&idx=1&sn=55a6a84986290888e15719446365c986&chksm=faa0e088cdd7699e2a2a4594850699713cbd698531dba1f7309f755375232560f8f758230a85&scene=21)

- [Service Mesh 双十一后的探索和思考(下)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487357&idx=1&sn=f9a8d34452c4b777fe8094cddb17ad7e&chksm=faa0e0a7cdd769b1c767cf15ca736ceca6fb5626b0363db908f4ead7e814e275fecd3037a13e&scene=21)

### 本周发布
**本周发布详情如下：
**1**、**sofa-common-tools** 发布 v**1.3.3 版本，主要变更如下：**

- 修复 log space factory 的懒初始化模型问题

    详细参考：<br />[https://github.com/sofastack/sofa-common-tools/releases/tag/v1.3.3](https://github.com/sofastack/sofa-common-tools/releases/tag/v1.3.3)
