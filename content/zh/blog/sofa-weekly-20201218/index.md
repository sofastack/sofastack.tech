---
title: "SOFA Weekly | 线上直播合辑整理，QA 整理"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2020-12-18T15:00:00+08:00
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
通过 " SOFA WEEKLY " 的形式回复

**1、@缪文** 提问:

> SOFA-Boot 框架，模块隔离时，子 module 中引入 mybatis 框架，@MapperScan 注解是在RootContext 中扫描，还是在子 module 中扫描？

A:  非 auto 的 configuration 都是在对应模块进行解析的。

SOFABoot：[https://github.com/sofastack/sofa-boot](https://github.com/sofastack/sofa-boot)

**2、@李扬** 提问：

> 分支事务被回滚是同步还是异步的,如果是异步的,能加监听方法吗?

A：可以实现 transactionhook 这个类，然后在 tm 发起者里加入到 Transaction HookManager#registerHook 。这样在二阶段决议后，可以做一些小动作，比如二阶段提交的时候，再执行 redis ，mongo 的数据插入。

**3、@吴国柱** 提问：

> 本地事务与全局事务一起开启会有问题吗？

A：全局事务要在本地事务的外层,就是包裹本地事务，不能由本地事务包裹全局事务。本地事务出异常都不会进行注册，也就代表本地事务如果出问题本地事务自行会回滚(基础知识)，如果本地事务提交了，其它服务的本地事务出现异常，或者业务代码出现异常，将有 Seata来负责把已提交的事务回滚。

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

### SOFAChannel 部分合辑

- [人人都可以“机密计算”：Occlum 使用入门和技术揭秘 | 开源](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247486732&idx=1&sn=d379f362145a485f4c4e02e05697b001&chksm=faa0e2d6cdd76bc03a8a71fbf78395c12279dd491825b2b0b94401e5ac226b4db4b9dd041bae&scene=21)
- [蚂蚁集团网络通信框架 SOFABolt 功能介绍及协议框架解析 | 开源](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247486515&idx=1&sn=243e63a0d53433ebc118a27b9de2bb0c&chksm=faa0e3e9cdd76affad2357f98ebf1362743f5eb595720169a46dba8ce60dc8aba2884a6432af&scene=21)
- [不得不说的云原生隔离性 | SOFAChannel#16 直播回顾](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247486164&idx=1&sn=0d299c622a4d9f59ef476d36aa08fc56&chksm=faa0e50ecdd76c18bf6a03ad1323b5cae9137eb3112ba6cab2454e9569bab3de8ceb1ed7f9b4&scene=21)
- [蚂蚁集团分布式链路组件 SOFATracer 埋点机制解析 | SOFAChannel#15 直播整理](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247486024&idx=1&sn=60d1e1f4178330f679028be4c3b056b9&chksm=faa0e592cdd76c847c9340588a4ba178293d37bc8b09881c2fa8d9c4a81c80e432d0164e4ef4&scene=21)
- [云原生网络代理 MOSN 扩展机制解析 | SOFAChannel#14 直播整理](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247485989&idx=1&sn=bdca1b8925df5655c5c036c450da5a06&chksm=faa0e5ffcdd76ce92f9918457233b105e3d7598740f5bf81f1882b551436fed99538babf182d&scene=21)
- [云原生网络代理 MOSN 多协议机制解析 | SOFAChannel#13 直播整理](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247485968&idx=1&sn=d0574663fc1c165e6166f02da93a4db9&chksm=faa0e5cacdd76cdc79a4843817e9a2c7266136565cbd94e0da3a940eacf9a6440db87307c712&scene=21)
- [蚂蚁集团分布式事务实践解析 | SOFAChannel#12 直播整理](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247485925&idx=1&sn=77fe4ee2caae2b09d3c97ea3fddaebe6&chksm=faa0e63fcdd76f297754c999ef87cc4ddd1aebfeaf71d41c9112322d25040bcefec31814e847&scene=21)
- [从一个例子开始体验轻量级类隔离容器 SOFAArk | SOFAChannel#11 直播整理](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247485891&idx=1&sn=01728f274bc860dfbc90ae2501dc4dd3&chksm=faa0e619cdd76f0fca29dda2e479260446d1082bf9a0d708c9e23bb5ce30a73c49196b24df17&scene=21)

### 相关推荐阅读

- [剖析 | 详谈 SOFABoot 模块化原理](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247484113&idx=1&sn=21ea61a6feb801a5a95e728d234e2dad&chksm=faa0ed0bcdd7641d0a72dc35d5437fe4d4928ac181e007ad4f2d7a8e7f7c61757eae9181c9ee&scene=21)
- [蚂蚁集团研发框架日志隔离解析 | SOFABoot 框架剖析](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247485873&idx=1&sn=63d3917508529cb586528976cf20db74&chksm=faa0e66bcdd76f7d0b3ac6d334cedc15a9c86d34de642196567f649613ceb4f6cdd2d05f7a03&scene=21)
- [蚂蚁集团研发框架总览 | SOFABoot 框架剖析](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247485850&idx=1&sn=10ed08b213697b77a1ea4d0c0eba5a9b&chksm=faa0e640cdd76f56763c008be3245e88aed4b82ae42c2dc53a663e1bf1140ff519f382037775&scene=21)
