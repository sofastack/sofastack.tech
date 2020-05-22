---
title: "SOFA Weekly | Occlum 发布、技术直播回顾&预告"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2020-05-22T17:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563524226806-e93607a3-1b77-4ca2-8c3c-0384ab966154.png"
---

**SOFA WEEKLY | 每周精选，筛选每周精华问答**

**同步开源进展，欢迎留言互动**

![weekly.jpg](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1562925824761-fc720f21-9622-437b-a783-0b0729eda119.jpeg)

SOFAStack（Scalable Open Financial Architecture Stack）是蚂蚁金服自主研发的金融级分布式架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

- **SOFAStack 官网: **[https://www.sofastack.tech](https://www.sofastack.tech/)
- **SOFAStack: **[https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动
我们会筛选重点问题通过 " SOFA WEEKLY " 的形式回复

**1、@张晓明** 提问：

> 关于 SOFATracer 采样率的配置，只在请求经过的第一个服务配置采样率就可以吗，还是每个服务都需要配置采样率，每个服务都配置的话，要求各服务采样率必须一致吗？

A：第一个，只在请求经过的第一个服务配置采样率就可以。

> 上报 Zipkin 的话，也只在第一个服务配置就可以吧，其他服务只需要引入 tracer-sofa-boot-starter 就行吧？

A：上报每个服务节点都要配，不然你下游链路数据拿不到。

> 采样率支持动态更新吗，就是修改后需要重启服务吗？

A：可以通过自定义采样，配合个配置中心就可以。

> 采样模式用 PercentageBasedSampler，配合配置中心可以吗？

A：可以，比较麻烦，要反射去改配置类的值，配置类初始化时采样率就确定了，如果要动态改只能通过反射去改。或者通过拿到配置类对象去设置也行，思路差不多。

SOFATracer：[https://github.com/sofastack/sofa-tracer](https://github.com/sofastack/sofa-tracer)

**2、@李振鸿** 提问：

> 请问，分布式事务执行  (只插入两条数据)  执行时间 0.3  会不会比较慢？

A：嗯，Seata 是消耗了不少性能，尤其是跟 TC 通信、TC 那边的处理。
Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

### 本周推荐阅读

- [云原生网络代理 MOSN 透明劫持技术解读 | 开源](/blog/mosn-transparent-hijacking/)
- [不得不说的云原生隔离性 | SOFAChannel#16 直播回顾](/blog/sofa-channel-16-retrospect/)



### SOFA 项目进展

**本周发布详情如下：**

**1、发布 Occlum v0.12.0版，主要更新如下：**

- 支持 Go 语言，并增加了 Demo；
- 新增三个命令行子命令：start, exec 和 stop；
- 新增 signal 子系统；

详细发布报告：
[https://github.com/occlum/occlum/releases/tag/0.12.0](https://github.com/occlum/occlum/releases/tag/0.12.0)

### 社区直播报名

![Service Mesher Webinar#1.png](https://cdn.nlark.com/yuque/0/2020/png/226702/1590137479163-e284eec4-c1a9-4ce6-ab4b-9ef6ddd31f6d.png)

随着多点生活的业务发展，传统微服务架构的面临升级困难的问题。在云原生的环境下，Service Mesh 能给我们带来什么好处？如何使用社区解决方案兼容现有业务场景，落地成符合自己的 Service Mesh 成为一个难点？服务之间主要通过 Dubbo 交互。**本次分享将探索 Istio + MOSN 在 Dubbo 场景下的改造方案，结合现有业务场景和可切入点，明确需要修改的场景，制定符合自己业务场景的 Service Mesh 落地方案，介绍多点生活在 Dubbo 案例的探索及改造方案。**

将从以下几个方面，与大家交流分享：

1. 传统微服务架构与 Service Mesh 架构
- 传统微服务架构在多点遇到的痛点；
- Service Mesh 架构能带来的福利；
2. Istio 技术点介绍
3. 在 Dubbo 场景下的改造分析
- 对比 MOSN 和 Envoy 对现有场景的支持；
- Istio+MOSN 和 Istio+Envoy 在 Dubbo 场景下如何改造；
4. MOSN + Istio 具体实现探索
- MOSN 配置文件介绍、从一个流量进来到转发到具体的远端的流程分析；
- Provider 配置信息如何下发到 Sidecar；
- 从多点现在的实际场景对现有的 Dubbo 改造方案；
5. Demo 演示

**直播主题：** Service Mesh Webinar#1：多点生活在 Service Mesh 上的实践——Istio + MOSN 在 Dubbo 场景下的探索之路

**分享嘉宾**：陈鹏，多点生活平台架构组研发工程师，开源项目与云原生爱好者，有多年的网上商城、支付系统相关开发经验，2019年至今从事云原生和 Service Mesh 相关开发工作。

**直播时间：**2020/5/28（周四）20:00-21:00

**直播间：**点击“[**这里**](https://live.bilibili.com/21954520)”，关注直播间即可
