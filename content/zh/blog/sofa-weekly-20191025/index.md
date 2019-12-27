---
title: "SOFA Weekly | 每周精选【10/21 - 10/25】"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2019-10-25T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563524226806-e93607a3-1b77-4ca2-8c3c-0384ab966154.png"
---

SOFA WEEKLY | 每周精选，筛选每周精华问答
同步开源进展，欢迎留言互动

![weekly.jpg](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1562925824761-fc720f21-9622-437b-a783-0b0729eda119.jpeg)

SOFAStack（Scalable Open Financial Architecture Stack）是蚂蚁金服自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

SOFAStack 官网: [https://www.sofastack.tech](https://www.sofastack.tech/)
SOFAStack: [https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动
我们会筛选重点问题
通过 " SOFA WEEKLY " 的形式回复

**1、@罗健** 提问：

> 请问，SOFAJRaft 跨机房支持吗？

A：跨机房不需要特殊支持，只是网络延时大一点而已。

> 延时大了，读写性能就会降低了吧？ 像 ZooKeeper 一样。

A：1. SOFAJRaft 支持 transfer leader，把 leader transfer 到和业务就近的机房（目前需要手动调用 cli 服务） 2. SOFAJRaft 1.3.0 会增加一个选举优先级特性，可以将指定机房节点优先级调高，尽量保证 leader 在指定机房。

**2、@梁开心** 提问：

> 使用 Seata 的时候，现在是 AT 模式 如果改成 Saga 模式的话，改造会大吗？

A：AT 模式完全是透明的，Saga 是有侵入性的，要配置状态机 json，如果服务多改造会比较大。

> Saga 模式是不是基于 AT 来加强的长事务处理呢？

A：没有基于 AT，客户端完全是两套，Server 端是复用的。你也可以看 Saga 的单元测试，那里有很多示例：[https://github.com/seata/seata/tree/develop/test/src/test/java/io/seata/saga/engine](https://github.com/seata/seata/tree/develop/test/src/test/java/io/seata/saga/engine)

> Saga 服务流程可以不配置吗，使用全局事务 id 串起来，这样省去配置的工作量，再加上人工配置难免会配置错误。

A：Saga 一般有两种实现，一种是基于状态机定义，比如 apache camel saga、eventuate，一种是基于注解+拦截器实现，比如 service comb saga，后者是不需要配置状态图的。由于 Saga 事务不保证隔离性, 在极端情况下可能由于脏写无法完成回滚操作, 比如举一个极端的例子, 分布式事务内先给用户 A 充值, 然后给用户B扣减余额, 如果在给 A 用户充值成功, 在事务提交以前, A 用户把余额消费掉了, 如果事务发生回滚, 这时则没有办法进行补偿了，有些业务场景可以允许让业务最终成功, 在回滚不了的情况下可以继续重试完成后面的流程, 基于状态机引擎除可以提供“回滚”能力外, 还可以提供“向前”恢复上下文继续执行的能力, 让业务最终执行成功, 达到最终一致性的目的，所以在实际生产中基于状态机的实现应用更多。后续也会提供基于注解+拦截器实现。

**3、@温明磊** 提问：

> 关于 Saga 的使用，有两个问题咨询下
> 1、比如有服务 A 在系统1里面，服务 B 在系统2里面。全局事务由 A 开启，流程调用 B 开启子事务，那系统2也需要维护 Saga 状态机的三个表吗，也需要在 Spring Bean 配置文件中配置一个 StateMachineEngine 吗？
> 
> 2、如果 系统1和系统2里面的服务，可以相互调用。系统12都可以开启全局事务，可以这样使用吗。那1和2 都需要维护Saga状态机的三个表，也需要在Spring Bean配置文件中配置一个StateMachineEngine。

A：1、不需要，只在发起方记录日志。由于只在发起方记录日志同时对参与者服务没有接口参数的要求，使得Saga可以方便集成其它机构或遗留系统的服务。
2、可以这样使用，如果两个系统都开启 Saga 事务，那就要记录那三个表配置 StateMachineEngine。

> 这个 EventQueue 只是开启分布式事务的系统  来进行事件驱动，调用其它系统服务像调用本地一样。系统之间还是 RPC 调用是吧，而不是系统之前也是纯事件驱动的？
> ![image.png](https://cdn.nlark.com/yuque/0/2019/png/226702/1571986864418-51532d55-8b29-4470-b4a6-7358795fbbd6.png)

A：是的。你指的"系统之间也是纯事件驱动的" 是不是说 RPC 也是非阻塞的？

> 是的，也可以是异步的。

A：那 RPC 的非阻塞需要 rpc client 支持，理论上也是可以的。rpc client 如果也是非阻塞 IO，那么所有环节都是异步了。

> 就是考虑一个业务流程， 它后续的子流程， 不管谁先运行都不会相互影响，可以异步调用。子流程是其它系统服务。Seata Saga 是不是实现了这点，其实我没看明白 ，Seata Saga 异步调用具体是不是各个节点异步了。是不是两个 ServiceTask 类型，可以同时 process ？

A：你说的是并发节点类型，还未实现，接下来会实现。目前的事件驱动是指的节点的执行是事件驱动的，流程的顺序是同步的。上一个节点执行完成后，产生事件，触发下一个节点执行。如果要满足你刚说的需求要扩展并发节点。

> 那目前区分同步 BUS 和异步 BUS 是什么作用？

A：同步 BUS 是线程阻塞的，等整个状态机执行完毕才返回，异步 BUS 是非线程阻塞的，调用后立即返回，状态机执行完毕后回调你的 Callback。

> IsPersist: 执行日志是否进行存储，默认是 true，有一些查询类的服务可以配置在 false，执行日志不进行存储提高性能，因为当异常恢复时可以重复执行？

A：是的，可以配置成 false, 不过建议先保持默认，这样在查询执行日志比较全，真的要做性能调优再配，一般不会有性能问题。

### 每周推荐阅读

- [蚂蚁金服开源背后的“有意思”工程师 | 1024快乐](/blog/ant-financial-happy-1024/)
- [蚂蚁金服云原生专家招聘 | 1024有你更快乐](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247485512&idx=2&sn=2fb125b1bc0f363fb581538f88821782&chksm=faa0e792cdd76e84c71e7084481872e3fd53d358e0e18ad1532c5848dd5d73314bcf3055327c&scene=21)

### SOFA 项目进展

**本周发布详情如下：**

**1、Occlum 是一个多任务、内存安全的库操作系统，专门针对可信执行环境（如 Intel SGX）。**

**发布 Occlum v0.6.0，主要变更如下**：
i. 支持 release 模式运行 enclave，轻松发布基于 Occlum 的 SGX 应用；
ii. 给 SEFS 增加额外的 MAC 和权限检查，保证 Occlum 的 FS 镜像的完整性；
iii. 重构底层错误处理机制，使得报错对用户友好，且附带详细的调试信息；
iv. 增加3个新 demo，包括 Bazel、HTTPS file server 和 Tensorflow Lite；
v. 在 Docker 镜像中默认安装 Occlum，使得用户开箱即用；
详细发布报告：
[https://github.com/occlum/occlum/releases/tag/0.6.0](https://github.com/occlum/occlum/releases/tag/0.6.0)

**2、发布SOFARPC v5.5.9，主要变更如下：**
i. 修改建联默认超时时间为1s，防止异常情况下建联时间过长
详细发布报告：
[https://github.com/sofastack/sofa-rpc/releases/tag/v5.5.9](https://github.com/sofastack/sofa-rpc/releases/tag/v5.5.9)

### 云原生活动推荐

![sm#7-sm](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1571384698338-771b8dde-11f4-4967-9e3f-63ff2535ff6d.jpeg)

**就在明天！**Service Mesh Meetup 成都站，期待您的带来～

Service Mesh Meetup 是由**蚂蚁金服联合 CNCF 官方共同出品**，ServiceMesher 社区主办，主题围绕服务网格、Kubernetes 及云原生，在全国各地循环举办的技术沙龙。

本期 Meetup 邀请社区大咖，从服务网格下微服务架构设计、在 5G 时代的应用、构建云原生边缘路由及蚂蚁金服的服务网格代理演进角度给大家带来精彩分享。

时间：2019年10月26日（周六）13:00-17:0
0地点：成都武侯区蚂蚁C空间-101猎户座
报名方式：点击[这里](https://tech.antfin.com/community/activities/949)，即可锁定席位