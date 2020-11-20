---
title: "SOFA Weekly | 每周精选【11/16 - 11/20】SOFA-Common-Tools 项目发布新版本、Seata、MOSN 相关 QA 整理"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2020-11-20T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563524226806-e93607a3-1b77-4ca2-8c3c-0384ab966154.png"
---

**SOFA WEEKLY | 每周精选，筛选每周精华问答**
**同步开源进展，欢迎留言互动**

![weekly.jpg](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1562925824761-fc720f21-9622-437b-a783-0b0729eda119.jpeg)

**SOFA**Stack（**S**calable **O**pen **F**inancial **A**rchitecture Stack）是蚂蚁集团自主研发的金融级分布式架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

- **SOFAStack 官网：**[https://www.sofastack.tech](https://www.sofastack.tech/)

- **SOFAStack：**[https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动
我们会筛选重点问题通过 " SOFA WEEKLY " 的形式回复

**1、@小刘** 提问：
> 刚开始用 Seata ，方法上用了 [@GlobalTrasactional ](/GlobalTrasactional ) + mybatis 插入一条数据的时候返回的自增id不正确,取消@GlobalTrasactional用普通的事务[@Trasactiona ](/Trasactiona ) 插入数据的时候返回的自增 id 正常了。 

A: 这个基础是有问题的。全局锁的作用是锁定并发修改时的数据的，不是针对接口。接口并发肯定是多线程走的，不可能阻塞等待排队。
Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

**2、@初识** 提问：
> 防悬挂是怎么理解的？能简单说说吗？

A: 保证一致性，幂等用的。比如a->b，因为特殊原因，比如全局事务超时，b注册上了分支事务，本地事务的 commit 还没执行的时候，全局事务回滚下发到了，如果这个时候本地事务 commit 了，那么数据就不一致了，所以全局事务回滚下发到了，会插入一个 undolog ，让本地事务 commit 的时候因为 undolog 唯一索引冲突使本地事务提交失败，触发回滚，保证了当全局事务状态是回滚时，分支事务都是回滚的。
当然，如果是 commit 了，再收到下发回滚，因为 commit 了已经有 undolog了，那么会通过 undolog 回滚，这个针对的是没有 undolog 时的情况。

**3、@StevenCheney  **提问： 
> Nmosn 的版本 和 Istio 有对应关系吗？

A：目前的 Master 支持 1.5._，但是上次看1.5._的时候有一些注入的问题，你可以看一下 feature-istio_adapter 这个分支，最近应该会合并一些pr进来，到时候可以直接适配1.7._，理论上1.6._也是可以支持的，需要测试一下。
> Docker image 会同步更新吗？

A：主要是看你的需求，如果你是只要 MOSN ，不要 Envoy，就直接使用[https://github.com/istio/istio/issues/23753](https://github.com/istio/istio/issues/23753) 这个来打包，如果你都需要的话或者说不介意多一个 Envoy，就直接使用 proxyv2 打一个就好了。
MOSN：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

### 本周推荐阅读

- [蚂蚁智能运维：单指标异常检测算法初探](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247486956&idx=1&sn=e084eb2926957ed5496f624124fd3f9c&chksm=faa0e236cdd76b2073524c75c68da251222f46756f4de40608bee35800ceceec2516481629c2&scene=21)
- [蚂蚁宣布开源 KubeTEE：让机密计算支持大规模 K8s 集群](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487020&idx=1&sn=fda0674ab5ba6ca08fe279178ffa2ea3&chksm=faa0e1f6cdd768e0eae59d2aa410c70ac9c89a67230b4824d697cb796e7199f1384663ea5644&scene=21)
- [企业数字化转型指南，《SOFAStack 解决方案白皮书》正式发布](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247486979&idx=1&sn=124e91279ebab25b6689cbfb47cb36ec&chksm=faa0e1d9cdd768cff25674daea1209904cfd956cad605e679ee6ffa212b7c8713cb30d83513a&scene=21)

### SOFA 项目进展**
**本周发布详情如下：**
**1、SOFA-Common-Tools 发布1.2.1版本：**

- 重构了本地控制台输出日志逻辑；
- 移除了 log-sofa-boot-starter 相关代码；

详细参考：
[https://github.com/sofastack/sofa-common-tools/releases/tag/v1.2.1](https://github.com/sofastack/sofa-common-tools/releases/tag/v1.2.1)
