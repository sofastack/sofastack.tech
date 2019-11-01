---
title: "SOFA Weekly | 每周精选【10/28 - 11/01】"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2019-11-01T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563524226806-e93607a3-1b77-4ca2-8c3c-0384ab966154.png"
---

**SOFA WEEKLY | 每周精选，筛选每周精华问答**
**同步开源进展，欢迎留言互动**

![weekly.jpg](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1562925824761-fc720f21-9622-437b-a783-0b0729eda119.jpeg)

SOFAStack（Scalable Open Financial Architecture Stack）是蚂蚁金服自主研发的金融级分布式架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

**SOFAStack 官网: **[https://www.sofastack.tech](https://www.sofastack.tech/)

**SOFAStack: **[https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动
我们会筛选重点问题通过 " SOFA WEEKLY " 的形式回复

**1、@罗健** 提问：
> SOFAJRaft 跨机房支持吗？

A： 跨机房不需要特殊支持，只是网络延时大一点而已。

> 延时大了，读写性能就会降低了吧？ 像 ZooKeeper 一样。

A：1. SOFAJRaft 支持 transfer leader，把 leader transfer 到和业务就近的机房（目前需要手动调用 cli 服务）；
2. SOFAJRaft 1.3.0 会增加一个选举优先级特性，可以将指定机房节点优先级调高，尽量保证 leader 在指定机房。
SOFAJRaft：[https://github.com/sofastack/sofa-jraft](https://github.com/sofastack/sofa-jraft)

**2、@阮仁照** 提问：
> SOFAArk 在打多个 ark-biz 包时，如果有多个 biz 包之间互相调用，默认是会走 injvm 协议的，这是如何做到的。我看了 SOFABoot 那块对 injvm 的支持，是通过 sofaRuntimeContext 来查找实现类，sofaRuntimeContext 是被 spring 容器管理的 bean，这就要求多个 biz 包之间是共用一套 spring 环境（或者说有个统一的父容器），是这样的吗？还是有什么其他实现的思路？

A：可以看下 com.alipay.sofa.runtime.invoke.DynamicJvmServiceProxyFinder 这个类。

> 懂了，原来在这之上还有个 SofaFramework维护一个静态变量，真巧妙，用这个来解决多个 spring 容器里的 rpc 调用问题吗？

A：多个 spring 容器之间的调用，不是 rpc 调用，是进程内调用。

> 对的， 这里不是 rpc 调用了， 所以这里也是 filter 会失效的原因。这样的话，那 SofaFramework 这个类就要被所有子容器都共享才对，但是我看打出来的 executable-ark 包，并没有在 classpath 下加载这个类啊，子容器咋共享的？

A：这个会打包成一个插件，放在 ark plugin 层。
![image.png](https://cdn.nlark.com/yuque/0/2019/png/226702/1572587349035-310c5ab8-b760-411c-86f9-a8f5cc4d5e02.png)

> 既然说插件之间是隔离的，那你把 SofaFramework 打在插件里，别的 biz 包启动时从会从 plugin里拿一个 SofaFramework ，互相不可见，这不是有问题吗？

A：不同 biz 会共享同一个。
SOFAArk：[https://github.com/sofastack/sofa-ark](https://github.com/sofastack/sofa-ark)

**3、@温明磊 **提问：
> Seata 的 Saga 模式的 json 文件，支持热部署吗？

A：支持，stateMachineEngine.getStateMachineConfig().getStateMachineRepository().registryByResources()。不过 Java 代码和服务需要自己实现支持热部署。

> Seata 服务部署集群是需要怎么配置? 还是现在不支持

A：异步执行一个服务，已实现。[https://github.com/seata/seata/issues/1843](https://github.com/seata/seata/issues/1843)

> Saga 的参数是不是只能在状态机启动时定义。如果第二个服务，依赖第一个服务返回的信息，或者里面组装好的信息怎么办？

A：有个 Output 参数定义，可以把服务返回的参数映射到状态机上下文，然后在下一个服务的 Input 里定义参数引用。

> 异步执行服务的话，需要在 file 加上这个配置吗?
> ![image.png](https://cdn.nlark.com/yuque/0/2019/png/226702/1572587563575-07ebc028-b381-421f-822b-0fe39289d7b6.png)

A：这个是状态机定义的 Json 文件，不是 Seata 的客户端配置文件。
Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

### 本周推荐阅读

- [备战双 11！蚂蚁金服万级规模 K8s 集群管理系统如何设计？](/blog/ant-financial-managing-large-scale-kubernetes-clusters/)

- [K8s 1.14 发布了，Release Note 该怎么读？](/blog/k8s-1.14-release-note/)

### SOFA 项目进展

**本周发布详情如下：**

**发布 SOFAMosn v0.8.0，主要变更如下：**
i.  内存占用优化，优化在连接数、并发数较多的场景下的内存占用
ii. Metrics 统计优化，RPC 心跳场景不计入 QPS 等 Metrics 统计
iii. XDS 处理优化，修改为完全无阻塞启动，并且降低了重试的频率
详细发布报告，请见：
[https://github.com/sofastack/sofa-mosn/releases/tag/0.8.0](https://github.com/sofastack/sofa-mosn/releases/tag/0.8.0)