---
title: "SOFA Weekly | 3/26 直播预告、多个组件发布、云原生团队校招社招信息汇总"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "【03/09-03/13】| 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2020-03-13T16:00:00+08:00
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

**1、@胡秋林** 提问：

> 请教一个问题，服务拆分然后使用分布式事务，会不会事务链路过长，然后整体性能下降很大呢？

A：用了分布式事务性能肯定会下降，这是大家对一致性和性能的取舍。在性能对比这块我建议大家去和同类的分布式事务框架对比，而不是只和不用分布式事务去对比。分布式事务很大一部分是处理的系统异常时的一致性，如果针对系统异常这个点，大家如果相信自己的框架 100% 正常的，不会出现超时，网络和宕机等问题，那可以不使用分布式事务，所以保证一致性的很多场景是极端情况下的一致性，在同类框架的对比中，一定是看框架一致性场景的覆盖，如果场景覆盖不全的基础上和我们对比性能我觉得这个没太大意义。这就好比我系统有 1% 几率出现极端情况，我不用 Seata 和使用 Seata 的对比是一样的。

**2、@吴攀** 提问：

> 麻烦问下，我现在做的一个销售订单的流程。需要监听审批的状态变化，然后状态机才往下进行流转。Saga 能否满足呢？ 

A：目前是不支持的，因为 Saga 的状态机定位是服务编排的事务处理，不应该包含人工审批动作，建议做成两个流程，包含人工审批动作，中间状态时间会很长。

> 我来状态想能否把“状态”配置成“IsAsync = true”来实现，然后异步任务来监听审批状态的变化。感觉有些负责。所以来咨询下？有没有更好其他的推荐的方案呢？Netflix Conductor 能满足这个场景么？我现在的场景是：一个销售单出库的流程。销售单建立成功后，要经过审批流程进行审批，然后进入仓库进行库存分配。分配成功后，进行分拣，然后进行打包。最后进行出库。老板想把这些状态流转编制成一个 Saga 支持的状态机。

A：isAsync 是这个服务异步调用，应该解决不了你这个问题。我的建议是把这个流程差分一下，拆分成两个，或者，销售订单不要纳入状态机，只是插入一条记录，审批通过后，把后面的流程配置成状态机，而且我理解你们这流程是每一步都是人工做完，然后在系统里点一下，然后继续，如果是这样，这不是服务编排的需求，为是工作流的需求。

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

3、**@兴元** 提问：

> SOFABoot 版本 v3.3.0，目前官网文档里只有整合 Nacos 0.6.0 版本的，请问怎么使用 Nacos 的命名空间功能？SOFABoot 版本 v3.3.0，maven 引用里 nacos-client 版本是 1.0.0，请问现在支持 nacos 最新版本是多少。

A：Nacos 配置格式参考：https://www.sofastack.tech/projects/sofa-rpc/registry-nacos/
对于 namespace 的，可以配置成这样即可：namespace nacos://yyy:8848/namespaceNacos 
客户端应该是兼容的，你可以直接升级这个包的版本。

> 命名空间问题解决了，感谢。因为我使用的时候指定了 nacos client 版本为0.6.0，升级到 0.8.0 以上nacos://yyy:8848/namespace 这种形式是可以的，而且只能使用 nacos://yyy:8848/namespace 这种形式，nacos://yyy:8848 是不行的。还望官方文档可以及时更新一下。

A：这里应该是要配置成：nacos://yyy:8848/ 后面有个/。好的，最近我们升级一下 Nacos 的 client 版本。文档我们同步修改下。

> 刚试了nacos://yyy:8848/，服务依然无法发布到默认命名空间。Nacos server 是1.2.0，客户端是使用SOFABoot v3.3.0。

A：不会发到默认的，这个会发到的是 SOFARPC 这个 Namespace：`private static final String DEFAULT_NAMESPACE = "sofa-rpc";`

SOFARPC：[https://github.com/sofastack/sofa-rpc](https://github.com/sofastack/sofa-rpc)

### 期待见到，每一个精彩的你

- [蚂蚁金服云原生团队实习生招聘开始啦](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247485919&idx=1&sn=be3d6d2971be64be7bb6fc26f3b2dc48&chksm=faa0e605cdd76f13594d02e2855a85e60f5111d57620597574cfe3c9660c80bbf8220724afb4&scene=21)
- [【岗位继续增了】蚂蚁金服云原生团队招聘~欢迎加入我们](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247485712&idx=2&sn=7a310e8958dbdf825542ee7180efb14b&chksm=faa0e6cacdd76fdc13fd53960576d148ae6d94c1212d349966b275f4f9bdfd1baa25e5ba1369&scene=21)

### SOFAChannel 直播回顾

- SOFAChannel#12：[蚂蚁金服分布式事务实践解析 | SOFAChannel#12 直播整理](/blog/sofa-channel-12-retrospect/)
- SOFAChannel#11：[从一个例子开始体验轻量级类隔离容器 SOFAArk | SOFAChannel#11 直播整理](/blog/sofa-channel-11-retrospect/)
- SOFAChannel#10：[Seata 长事务解决方案 Saga 模式 | SOFAChannel#10 回顾](/blog/sofa-channel-10-retrospect/)
- SOFAChannel#9：[Service Mesh 落地负责人亲述：蚂蚁金服双十一四大考题 | SOFAChannel#9 回顾](/blog/service-mesh-practice-antfinal-shopping-festival-big-exam/)
- SOFAChannel#8：[从一个例子开始体验 SOFAJRaft | SOFAChannel#8 直播整理](/blog/sofa-channel-8-retrospect/)
- SOFAChannel#7：[自定义资源 CAFEDeployment 的背景、实现和演进 | SOFAChannel#7 直播整理](/blog/sofa-channel-7-retrospect/)
- SOFAChannel#6：[蚂蚁金服轻量级监控分析系统解析 | SOFAChannel#6 直播整理](/blog/sofa-channel-6-retrospect/)
- SOFAChannel#5：[给研发工程师的代码质量利器 | SOFAChannel#5 直播整理](/blog/sofa-channel-5-retrospect/)
- SOFAChannel#4：[分布式事务 Seata TCC 模式深度解析 | SOFAChannel#4 直播整理](/blog/sofa-channel-4-retrospect/)
- SOFAChannel#3：[SOFARPC 性能优化实践（下）| SOFAChannel#3 直播整理](/blog/sofa-channel-3-retrospect/)
- SOFAChannel#2：[SOFARPC 性能优化实践（上）| SOFAChannel#2 直播整理](/blog/sofa-channel-2-retrospect/)
- SOFAChannel#1：[从蚂蚁金服微服务实践谈起 | SOFAChannel#1 直播整理](/blog/sofa-channel-1-retrospect/)

### SOFA 项目进展

**本周发布详情如下：**

**1、发布 SOFABoot v3.3.1 版本，主要变更如下：**

- 升级 Spring Boot 至 2.1.13.RELEASE；
- 修复 Tomcat AJP 漏洞；
- 修复 MultiApplicationHealthIndicator 引发的栈溢出 bug；
- 修复 sofa-boot-gradle-plugin 上传 bug；
- 取消 StandardSofaRuntimeManager 的自动关闭；

详细发布报告：
[https://github.com/sofastack/sofa-boot/releases/tag/v3.3.1](https://github.com/sofastack/sofa-boot/releases/tag/v3.3.1)

**2、发布 SOFA RPC v5.6.5 版本，主要变更如下：**

- 新增远程 Mock 和本地 Mock 功能；
- 新增将 Apollo 作为动态配置组件的功能；
- 新增通过广播进行服务发现和服务注册的功能；
- 新增根据动态配置组件自动选择负载均衡策略的功能；
- 新增 Tracer 集成 micrometers 的功能；
- 新增 Bolt 协议定义的接口暴露 swagger 服务的功能；
- 优化单元测试执行速度和稳定性；

详细发布报告：
[https://github.com/sofastack/sofa-rpc/releases/tag/v5.6.5](https://github.com/sofastack/sofa-rpc/releases/tag/v5.6.5)

**3、发布了 Occlum v0.10.0 版本，主要更新如下：**

- 支持 SGX 模拟模式，今后无需 SGX 机器即可运行 Occlum；
- 支持 SGX 本地证明，提升 Occlum 与 SGX SDK 的互操作性；
- 支持 GDB，方便客户调试应用；
- 增加内置 profiler，用于性能分析和优化；
- 增加广泛使用的数据库 SQLite 的 Demo；
- 完善和改进多个系统调用；

详细发布报告：
[https://github.com/occlum/occlum/releases/tag/0.10.0](https://github.com/occlum/occlum/releases/tag/0.10.0)

### 社区直播报名

![detail banner13#13.jpg](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1584084552217-83f5c143-d1b1-4d5c-ac65-08e0156af21f.jpeg)

作为云原生网络代理，Service Mesh 是 MOSN 的重要应用场景。随着 Service Mesh 概念的日益推广，大家对这套体系都已经不再陌生，有了较为深入的认知。但是与理论传播相对应的是，生产级别的大规模落地实践案例却并不多见。这其中有多方面的原因，包括社区方案饱受诟病的“大规模场景性能问题”、“配套的运维监控基础设施演进速度跟不上”、“存量服务化体系的兼容方案”等等。

现实场景中，大部分国内厂商都有一套自研 RPC 的服务化体系，属于「存量服务化体系的兼容方案」中的协议适配问题。为此，MOSN 设计了一套多协议框架，用于降低自研体系的协议适配及接入成本，加速 Service Mesh 的落地普及。**SOFAChannel#13，将向大家介绍 MOSN 实现多协议低成本接入的设计思路以及相应的快速接入实践案例**。

**主题**：SOFAChannel#13：云原生网络代理 MOSN 的多协议机制解析

**时间**：2020年3月26日（周四）19:00-20:00

**嘉宾**：无钩，蚂蚁金服技术专家、MOSN Committer

**形式**：线上直播

**报名方式**：点击“[这里](https://tech.antfin.com/community/live/1131)”，即可报名
