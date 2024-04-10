---
title: "SOFA Weekly | SOFAJRaft 发布新版本,QA 整理"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | SOFAJRaft 发布新版本,QA 整理"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2021-08-20T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ"
---

SOFA WEEKLY | 每周精选，筛选每周精华问答

同步开源进展，欢迎留言互动
![weekly.jpg](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ)
SOFAStack（Scalable Open Financial Architecture Stack)是蚂蚁金服自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

SOFAStack 官网: [https://www.sofastack.tech](https://www.sofastack.tech/)

SOFAStack: [https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动

我们会筛选重点问题

通过 " SOFA WEEKLY " 的形式回复

**1、@胡希国** 提问：

> 想和大家请教一下 MOSN 的热升级方案，就是我看到 MOSN 也是通过接收到 hup 信号然后 fork 的方式生成的一个新的子进程，（确切来说是 forkexec），和 Envoy 的解决方案应该是相同的，那为什么说和 Nginx 不一样呢？这种也是存在父子进程关系的吧（我看到 Envoy 是存在的），那为什么说没有继承 listenerfd 而需要通过 uds 来传递呢？

A：Nginx reload 的过程是 master 不会退出，只是新 fork 了子进程。MOSN 是先启动一个 MOSN 进程，然后通过 socket 把 fd 继承过去之后，老的 MOSN 会退出。

MOSN：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

**2、@鹏程万里** 提问：

> FailureHandler 怎么实现自定义类呢？需要做回滚失败的通知。

A：自己创建一个 Failurehandler bean return 一个实现类。

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

**3、@随风** 提问：

> 请问下，如果 A 方法和 B 方法上都有注解 GlobalTransactional，那么 A 方法可以直接调用 B 方法吗？

A：可以的，用的还是一个 xid。

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

**4、@zero** 提问：

> 有分布式数据库了还需要用 Seata 吗？

A：分布式数据库解决的是单个 connection 中每个 SQL 请求到了不同的库上的事务。一个分布式数据库背后可能有 N 个数据库被操作，内部用 xa 保证了事务。

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

### 本周发布

本周 SOFAJRaft 发布 1.3.8v 版本。主要更新如下：

- Snapshot 支持并行压缩/解压缩，充分利用多核，加速在 snapshot 较大的时的 load 和 save 速度；

- CliService 提供 learner 到 follower 的转换 API；

- 修复 install snapshot retry 失败的 bug；

- 修复 RheaKV 在成员发生变更时没有刷新路由表的 bug。

详细参考：

[https://github.com/sofastack/sofa-jraft/releases/tag/1.3.8](https://github.com/sofastack/sofa-jraft/releases/tag/1.3.8)

### 新手任务计划

作为技术同学，你是否有过“想参与某个开源项目的开发、但是不知道从何下手”的感觉？

为了帮助大家更好的参与开源项目，SOFAStack 和 MOSN 社区会定期发布适合新手的新手开发任务，帮助大家 learning by doing ！

**SOFA-Boot**

- 发布服务时 增加 interfaceType 校验；

- 增加 SOFATracer 插件。

详见：

[https://github.com/sofastack/sofa-boot/issues/841](https://github.com/sofastack/sofa-boot/issues/841)

**Layotto**

- 选择喜欢的组件实现分布式锁和分布式自增 id；

- 让 Layotto 能够简单方便的部署在 Kubernetes 上；

- 提供 Dockerfile，以便用户用 docker 部署 Layotto 。

详见：

[https://github.com/mosn/layotto/issues/108#issuecomment-872779356](https://github.com/mosn/layotto/issues/108#issuecomment-872779356)

### 本周推荐阅读

- [2021 年云原生技术发展现状及未来趋势](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247492248&idx=1&sn=c26d93b04b2ee8d06d8d495e114cb960&chksm=faa30d42cdd48454b4166a29efa6c0e775ff443f972bd74cc1eb057ed4f0878b2cb162b356bc&token=1414725197)

- [蚂蚁集团 SOFATracer 原理与实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247491935&idx=1&sn=75421dd34ec84d5889d7a4306f1c6a03&chksm=faa30e85cdd4879335726d670e94c5b360e53a1f3f74f41c66c0c6221d5e8459c35a653e94b6&token=1414725197)

- [KCL：声明式的云原生配置策略语言](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247491634&idx=1&sn=8359805abd97c598c058c6b5ad573d0d&chksm=faa30fe8cdd486fe421da66237bdacb11d83c956b087823808ddaaff52c1b1900c02dbf80c07&token=1414725197)

- [蚂蚁集团万级规模 K8s 集群 etcd 高可用建设之路](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247491409&idx=1&sn=d6c0722d55b772aedb6ed8e34979981d&chksm=faa0f08bcdd7799dabdb3b934e5068ff4e171cffb83621dc08b7c8ad768b8a5f2d8668a4f57e&token=1414725197)

更多文章请扫码关注“金融级分布式架构”公众号

> ![](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*5aK0RYuH9vgAAAAAAAAAAAAAARQnAQ)
