---
title: "SOFA Weekly | SOFARPC 发布新版本，QA 整理"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY |  SOFARPC 发布新版本，QA 整理"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2021-02-19T15:00:00+08:00
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

**@王盛** 提问：

>这个配置在 sidecar 里面怎么改，这个怎么配到 Istio 里面?
>
>![](https://cdn.nlark.com/yuque/0/2021/png/12405317/1613725206693-8ab5ef99-3fbe-4367-aa10-c7d107ef2b33.png)

A：在 Istio 中关于 tracing 这块的 driver 目前是通过配置 xxx_bootstrap.json 静态配置的，然后通过 istioctl 命令参数来选择使用哪个 driver。当前由于 skywalking 自身配置还没作为 bootstrap 的静态默认配置，所以需要你自己修改下 xxx_bootstrap.json，这个配置就好了（即把上面的那个配置加进去）。简单说就是修改下 sidecar 的静态默认配置文件，增加 skywalking 为 tracing 的 driver 配置。

MOSN：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

**@卞平超** 提问：
> TCC 多阶段；rollback 可以设置顺序吗？比如被调用的服务，先回滚，再回滚主服务的，A->B，想先回滚 B 的数据，commit 和 rollback；方法中的业务代码有异常，是会不断的重复执行。

A：TC 的表字段 datetime 看下精度，二阶段都决议了，没有从 commit 异常，直接到 rollback。如果 10 个参与方，就 1 个 commit 异常，不去重试保证最终一致的话，数据不就乱了；已经决议了，就要保证起码能最终一致，而不应该串改结果，参考消息队列设计，为什么消费异常要重试。

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

**@方舟** 提问：
> 请问一下，在 TCC 模式中，如果 TM 和 TC 断开连接，能够保证全局事务的回滚吗，重连超时后，全局事务会回滚吗？

A：会重连，然后重试；需要你自己保证幂等和悬挂，会等你连上之后再重试。

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

### 本周推荐阅读

- [蚂蚁集团轻量级类隔离框架概述 | SOFAArk 源码解析](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247485740&idx=1&sn=2a4c3a87ad6721493a9d9deb6bc92a14&chksm=faa0e6f6cdd76fe0f3166199b30576b2078e367b8aaeb12a2a0d5419e141790c8a27f6307b4e&scene=21)

- [蚂蚁集团研发框架总览 | SOFABoot 框架剖析](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247485850&idx=1&sn=10ed08b213697b77a1ea4d0c0eba5a9b&chksm=faa0e640cdd76f56763c008be3245e88aed4b82ae42c2dc53a663e1bf1140ff519f382037775&scene=21)

- [SOFAJRaft Snapshot 原理剖析 | SOFAJRaft 实现原理](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247485440&idx=1&sn=8311b55d7ee88b7702fd5d36a3a97858&chksm=faa0e7dacdd76ecce2d76c7f74621d38e810649144ad31238f9a43df7bd6ceb2ca6661837e1c&scene=21)

- [蚂蚁集团 API Gateway Mesh 思考与实践](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247485779&idx=1&sn=9947766a3728207160fc087b28722060&chksm=faa0e689cdd76f9fea4990ccf764311b145822daac644c93ea8cd6eb4735ec104a16a00bf61d&scene=21)

### 本周发布

**本周发布详情如下：**

**1、SOFARPC发布 v5.7.7版本，主要变更如下：**

- 使用 Github Action 替代 Travis 进行持续集成
- 升级 jackson-datebind 到 2.9.10.7
- 升级 junit 到 4.13.1
- 修复了Rest中，当请求经过代理源IP获取不准确的问题
- 修复了内置 Protobuf Compiler 的 BUG

详细参考：[https://github.com/sofastack/sofa-rpc/releases/tag/v5.7.7](https://github.com/sofastack/sofa-rpc/releases/tag/v5.7.7)

