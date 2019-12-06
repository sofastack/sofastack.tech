---
title: "SOFA Weekly | 每周精选【11/11 - 11/15】"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2019-11-15T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563524226806-e93607a3-1b77-4ca2-8c3c-0384ab966154.png"
---

**SOFA WEEKLY | 每周精选，筛选每周精华问答**

**同步开源进展，欢迎留言互动**

![weekly](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1562925824761-fc720f21-9622-437b-a783-0b0729eda119.jpeg)

SOFAStack（Scalable Open Financial Architecture Stack）是蚂蚁金服自主研发的金融级分布式架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

**SOFAStack 官网: **[https://www.sofastack.tech](https://www.sofastack.tech/)

**SOFAStack: **[https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动
我们会筛选重点问题通过 " SOFA WEEKLY " 的形式回复

**1、@瀚墨** 提问：

> 请问 SOFARPC 本地多人开发有没有最佳实践分享一下了？

A：你说的多人开发具体是指啥协作场景？

> 开发人员开发本地的服务时，需要依赖的服务可以来自一个开发环境！这样的开发人员就不需要启动自己本地所有的服务了。我们已经有一个开发环境，会部署所有的服务，但是当开发人员开发某一个功能时，可能只希望其中几个接口走本地，其他的接口走开发环境！

A：你的这个开发环境是一组不确定的机器，还是一台指定 IP 的机器？

SOFARPC：[https://github.com/sofastack/sofa-rpc](https://github.com/sofastack/sofa-rpc)

> 指定的 IP 地址。

A：一种方法本地调用方直接配开发环境的机器直连调用， 另外一个方法就是开发环境统一使用一个 uniqueId，和本地用不同的uniqueId。

**2、@温明磊** 提问：

> Seata Saga 向前重试状态机 json 该怎么配置，节点代码内部和节点 json 的 catch 都不捕获异常吗，这样就会一直调用该节点。

A：运行过程中向前重试：通过 Catch 到异常然后 Next 到当前节点（这种实现了 Retry 配置之后就不需要了），事后向前重试：直接调 forward 方法即可（一般不需要自己调，server 端会自动触发）。

> Retry 配置什么时候实现，事后向前重试是一定会发生的吗？

A：Retry 配置正在做了。事后向前重试目前 server 端的逻辑是这样的：失败时，如果没有触发回滚，那么 server 端会不断发起重试，如果触发过回滚（也就是回滚失败了）server 端会不断触发 compensate。

> 这个没用触发回滚，是不是像我上面说的这个出错节点，代码内部没用捕获异常，json 也没有 catch 异常，然后就不断重试了。

A：是的。

**3、@金雷-上海** 提问：

> 看代码，Saga 二阶段提交成功不删分支事务？回滚也是不删，有特殊原因？

A：你是 server 端的分支事务吗？客户端的状态机日志不会删，server 端没有显示删除分支事务，只是提交或回滚全局事务。

> 嗯，我看了代码是这样，不清楚为什么这么操作。
全局事务表删了，分支事务不删。

A：是这样的，Saga 模式的回滚是在客户端状态机协调的，不是用 TC 协调的，TC 只是触发，客户端回滚或成功后会调 server 端上报回滚成功。所以我理解是 server 端这时会删除全局事务记录，而没有删除分支事务记录。因为是客户端协调，所以 TC 也没有循环去调每一个分支事务的 rollback，所以分支事务实际上是留下了，没有被删除。

> 既然全局事务都删除了，如果留着没有什么意义，我觉得可以删除分支事务。

A：是的。提个 issue，修改一下。

你提的那个 issue 修复了 ，[https://github.com/seata/seata/pull/1893](https://github.com/seata/seata/pull/1893) 同时做了一个优化，重试和补偿服务不向 Seata server 注册分支事务，仅原始服务注册分支事务，重试和补偿服务执行完成时向原始服务注册的分支事务上报成功与否的状态。

Retry 功能，"BackoffRate": 1.5，表示重试间隔增量，1.5表示本次重试间隔是上次的1.5倍：[https://github.com/seata/seata/issues/1899](https://github.com/seata/seata/issues/1899)

还有一个点，当重试过程中生了别的异常，框架会重新匹配这个异常对应的重试规则，并按新规则来重试，但同一种规则的总次数的不会超过它配置的 MaxAttempts，避免不同异常来回切换而一直重试。

> 新规则就是下面这个配置吗？
>
> ![配置](https://cdn.nlark.com/yuque/0/2019/png/226702/1573814648046-242639d4-7213-4c5d-862a-5be0c91e9101.png)

A： 就是你可以配置多个重试规则，根据 Exceptions 属性来匹配，下面那个没有带 Exceptions 表示框架自动匹配网络超时异常。

> 配置了 Exceptions，不只是可以匹配节点的异常，还可以匹配重试的异常，执行新的重试规则。 

A：对的。

**4、@J～杰**   提问： 

> 我看整个 Saga 流程引擎都是自己开发的，那个 json 的参数属性含义哪里可以参考？

A：这是官网文档，每个属性的含义，可以看 State language referance 节。
[http://seata.io/zh-cn/docs/user/saga.html](http://seata.io/zh-cn/docs/user/saga.html)

> 如果用了 @GlobalTransactional，在并发场景中，是不是还要用 @GlobalLock 保证数据的隔离性？

A：@GlobalLock 是用于非分布式事务场景下的读分布式事务中数据。在分布式事务的场景本身有全局锁来隔离。

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

### 双十一落地实践特辑阅读

- [蚂蚁金服 Service Mesh 大规模落地系列 - 核心篇](/blog/service-mesh-practice-in-production-at-ant-financial-part1-core/)
- [万字长文丨1分36秒，100亿，支付宝技术双11答卷：没有不可能](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247485556&idx=1&sn=7eb759d359ded477aee58ed287b5bf98&chksm=faa0e7aecdd76eb891bed7c82e91849a3b7560108147ebd7aab2dfed0e0cad2e6d874a5ada2e&scene=21)

### SOFA 项目进展

**本周发布详情如下：**

**发布 SOFATracer v2.4.2/3.0.8，主要变更如下：**

- 迁移 samples 到 [sofastack-guides](https://github.com/sofastack-guides)空间下
- 修复 Server Receive 阶段出现 spanId 增长问题
- 优化 Zipkin 远程上报问题

详细发布报告：
[https://github.com/sofastack/sofa-tracer/releases/tag/v2.4.2](https://github.com/sofastack/sofa-tracer/releases/tag/v2.4.2)
[https://github.com/sofastack/sofa-tracer/releases/tag/v3.0.8](https://github.com/sofastack/sofa-tracer/releases/tag/v3.0.8)

### 云原生活动推荐  

![Service Mesh Meetup#8](https://cdn.nlark.com/yuque/0/2019/png/226702/1573814844098-ad9746c9-a153-4c8b-94e6-cd8a3300ebb0.png)

本期为 **Service Mesh Meetup#8 特别场**，联合 CNCF、阿里巴巴及蚂蚁金服共同举办。

不是任何一朵云都撑得住双 11。

成交 2684 亿，阿里巴巴核心系统 100% 上云。

蚂蚁金服的核心交易链路大规模上线 Service Mesh。

这次，让双 11 狂欢继续，让云原生经得起双 11 大考，也让云原生走到开发者身边。

你将收获 3 大经验加持：

- 双 11 洗礼下的阿里巴巴 K8s 超大规模实践经验
- 蚂蚁金服首次 Service Mesh 大规模落地经验
- 阿里巴巴超大规模神龙裸金属 K8s 集群运维实践经验

时间：2019年11月24日（周日）9:30-16:30

地点：北京市朝阳区大望京科技商务园区宏泰东街浦项中心B座2层多功能厅

报名方式：点击“[这里](https://tech.antfin.com/community/activities/985)”即可锁定席位