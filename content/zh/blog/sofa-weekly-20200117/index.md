---
title: " SOFA Weekly | 2.13直播预告、KubeCon NA2019 回顾"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "【01/13-01/17】 | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2020-01-17T16:00:00+08:00
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

**1、@J~杰 **提问：

> 咨询一下，Seata TCC 中这个 BusinessActivityContext 是用于做什么的？

A：比如说在 rollback 服务里需要用到 try 服务里的参数时，可以放到 BusinessActivityContext，然后在 rollback 和 comfirm 服务里可以取到这个参数。

> 那是要自己在 try 阶段需要手动实例化 BusinessActivityContext？

A：不需要，可以在 try 方法上的参数加注解，它会自动把这个参数放入 BusinessActivityContext。

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

**2、王国柱 **提问：

> 有一个问题想要请教一下：
> HBX：如果是 spanner - > gateway -> app1 这种架构，每次上新的应用，应该是需要在 geteway 中配置新应用的 ip 地址路由信息。
> 如果是 spanner ->  gateway.jar,app1 这种架构，如果新增加 app2， spanner 如何知道新的应用地址在哪里。
> 
> HBX：我理解集中式的 gateway，应该会把后端 app 的应用地址信息配置在集中式的 gateway 中。如果做成 jar，那 app 和 jar 的地址信息，该如何被 spanner 知道？

A：Spanner 其实就是 ingress，不管是 gateway 还是 app x，都可以通过服务发现来发现服务器的 ip 信息。

> 那像这种的话，就是后台服务上线，可以自己注册到 spanner 上，然后外部应用就可以直接访问了。

A：是的。
MOSN：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

### KubeCon NA2019 回顾

- [开箱即用的 Java Kubernetes Operator 运行时](/blog/java-kubernetes-operator-kubecon-na2019/)
- [基于 Knative 打造生产级 Serverless 平台 | KubeCon NA2019](/blog/knative-serverless-kubecon-na2019/)
- [将 Sidecar 容器带入新的阶段 | KubeCon NA 2019](/blog/sidacar-kubecon-na2019/)

### 本周推荐文章

- [10年后，阿里给千万开源人写了一封信](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247485785&idx=1&sn=1baf4886ae680cdc018f39ec6c5643c4&chksm=faa0e683cdd76f9568ea394ee387dc12b1df5bdf00e2de5c5642e2c814dae0a6b2c921d56c29&scene=21)
- [蚂蚁金服消息队列 SOFAMQ 加入 OpenMessaging 开源标准社区](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247485771&idx=1&sn=e76fc52d9dfe71fcd2832e41298c159e&chksm=faa0e691cdd76f87374992934ef6d0cf41e11e2aa6d9f7f8dc156e8f2885921922fcc9eb8b7f&scene=21)
- [蚂蚁金服 API Gateway Mesh 思考与实践](/blog/service-mesh-meetup-9-retrospect-api-gateway-mesh/)

### 社区直播预告

![SOFAChannel#11](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1579250928699-3e807134-c0df-4138-8967-a71e5eb9bcc9.jpeg)

春节后直播预告来啦～本期为 SOFAChannel 线上直播第 11 期，将从 SOFAArk 的特性出发，了解轻量级类隔离容器 SOFAArk 的主要功能，并通过一个 Demo 案例，跟讲师一起操作，实际体验 SOFAArk 具体操作以及功能实现。

SOFAArk 是一款基于 Java 实现的轻量级类隔离容器，主要提供类隔离和应用(模块)合并部署能力，由蚂蚁金服公司开源贡献。截止 2019 年底，SOFAArk 已经在蚂蚁金服内部 Serverless 场景下落地实践，并已经有数家企业在生产环境使用 SOFAArk ，包括网易云音乐、挖财、溢米教育等。

**主题**：SOFAChannel#11：从一个例子开始体验轻量级类隔离容器 SOFAArk

**时间**：2020年2月13日（周四）19:00-20:00

**嘉宾**：玄北，蚂蚁金服技术专家 SOFAArk 开源负责人

**形式**：线上直播

**报名方式**：点击“[**这里**](https://tech.antfin.com/community/live/1096)”，即可报名