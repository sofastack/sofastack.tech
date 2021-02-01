---
title: "SOFA Weekly | SOFABolt、 sofa-common-tools 发布新版本，QA 整理"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | SOFABolt、 sofa-common-tools 发布新版本，QA 整理"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2021-01-29T15:00:00+08:00
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

**@潘麒安** 提问：

> 请教下 session-server 报这个错，是需要扩更多的 session 么，但是 session进程本身 CPU 和内存占用不高。
>  ![](https://cdn.nlark.com/yuque/0/2021/png/12405317/1611911810538-0a3d61c9-11fc-4398-9dbe-b1d1033e79d8.png)

A：看错误是把 session 发向 data 的处理队列打满了，可以排查一下，检查一下使用的版本，data 的资源使用和common-error.log 下的错误日志。

SOFARegistry：[https://github.com/sofastack/sofa-registry](https://github.com/sofastack/sofa-registry)

**@刘达** 提问：

> MOSN 怎么配置监听一个端口，这个端口上会接受有多种协议的数据，根据协议转发到不同的集群地址。ISTIO+MOSN， 用户 http 请求 gateway，通过 gateway 调 dubbo，每个应用自动注入 sidecar，测试没跑起来。
>  ![](https://cdn.nlark.com/yuque/0/2021/png/12405317/1611911810599-43c28bd7-b920-4bf1-b5b7-07f3c625a17c.png)

A：配置 Auto，支持协议自动识别，转发不同的集群，那就看路由了；用新版本，然后这样配置。
![](https://cdn.nlark.com/yuque/0/2021/png/12405317/1611911810600-e3ddbdee-0077-4f94-bc67-b9c9afcc5243.png)

MOSN：https://github.com/mosn/mosn

### 本周推荐阅读

- [剖析 | 详谈 SOFABoot 模块化原理](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247484113&idx=1&sn=21ea61a6feb801a5a95e728d234e2dad&chksm=faa0ed0bcdd7641d0a72dc35d5437fe4d4928ac181e007ad4f2d7a8e7f7c61757eae9181c9ee&scene=21#wechat_redirect)

- [网商银行是如何建设金融级云原生分布式架构的？](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487074&idx=1&sn=8db3c74c5b4c024314a3f1743998d545&chksm=faa0e1b8cdd768aebe339efc0c24f093d6cdc2d8bfc1f4c548312090e4cb3b165201c84361be&scene=21)

- [实操 | 基于 SOFABoot 进行模块化开发](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247484017&idx=1&sn=f4ca7f563ad0ed6158282736a141a1f3&chksm=faa0edabcdd764bd7d8dda126f923d1b8653fc4f2e3d77b7873c1b288a35f0ff0ae79bf74321&scene=21)

- [开源 | SOFABoot 类隔离原理剖析](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247483929&idx=1&sn=d68a3cc20bad606ef5337ac3630b74f0&chksm=faa0edc3cdd764d57787aca5c40a05977c84549ac01c6c183340992e6c7ee48eb17f686b9787&scene=21)

### SOFABolt 项目进展

**本周发布详情如下：**

**1、SOFABolt 发布 v1.5.7 版本，主要变更如下：**

- 优化 log4j2 日志配置，解决在异常场景下的性能问题

详细参考：[https://github.com/sofastack/sofa-bolt/releases/tag/v1.5.7](https://github.com/sofastack/sofa-bolt/releases/tag/v1.5.7)

### sofa-common-tools  项目进展

**本周发布详情如下：**

**1、sofa-common-tools 发布 v1.3.2 版本，主要变更如下：**

- 修复 LogCode2Description 性能问题

详细参考：[https://github.com/sofastack/sofa-common-tools/releases/tag/v1.3.2](https://github.com/sofastack/sofa-common-tools/releases/tag/v1.3.2)
