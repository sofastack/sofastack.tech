---
title: "SOFA Weekly | MOSN 发布新版本，QA 整理"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2021-01-08T15:00:00+08:00
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

**1、@梁俊** 提问：

> 有一台物理服务器，没有安装 OS，是不是可以把 Occlum LibOS 像通用操作系统一样当做 host OS 用，运行 Occlum LibOS，需不需要在物理服务器上安装 host OS?

A：Occlum 对硬件也是有要求的。这个机器需要支持 Intel SGX 技术。简单得说，就是必须可以安装 SGX 驱动。 Guest OS 是虚拟机的概念，从 guest OS 的角度看，OS 依然运行在 kernel 态。简单来说，如果想使用 Occlum，那么建议方案：
1 . 找一台 SGX 机器 （比如 W55）；
2. 安装一个OS，并且装上 SGX 驱动；
3. 安装 Occlum；

> Occlum 相对于 Docker 有哪些优势，比 Docker 快吗?

 A：Occlum 的优势是安全。外界无法探测运行在 Occlum 中的程序和这个程序使用的内存以及寄存器。也就是说，可以把机密信息（比如密钥）放在 Occlum 中而不用担心信息泄露。
 
Occlum：[https://github.com/occlum/occlum](https://github.com/occlum/occlum)

**2、@李天宇** 提问：

> 可不可以定义一个这样的准则每个 RPC 后面，必须得有一个 TM，每个 TM 维护一个 TM 块，RPC +1，就应该等于 TM 块？![image.png](https://cdn.nlark.com/yuque/0/2021/png/2883938/1610097783709-8b04869f-1857-48db-9e22-de80cc68cc7f.png)

A：这样一个完整的链路有多少个参与者，发起者可以获得，校验规则就是 spanid 是否与参与者数量 +1，是否相等？认为 RPC 向下的服务资源都是一个完整的事务，不管它是否与 db 交互，即可以无 RM ，我的想法就是让 TM 发起者，可以随着链路信息感知所有的 TM。
Tm 可以在每个微服务上都标注下 注解，默认是加入到之前的事务中。TraceId 可以塞到 Seata 的协议中传递到 RPC 下游。

**3、@李天宇** 提问：

> 支持不同 branch 不同的 type 吗？

A：AT 和 TCC 可以共存，Saga 不行。比如 a 数据在 AT 下被改，又被 Saga 或者 xa 分支改动，因为它们不是 AT 无法通过全局锁保证隔离性，除非所有的模式只要内部含有 AT 分支，都去获取全局锁，这样带来了一个问题，如何提前知晓某个 TM 的调用链路中有 AT 分支，靠用户注解上写，那入侵性就有点大了。

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

### 本周推荐阅读

- [SOFAEnclave：蚂蚁机密计算如何解决现实挑战？](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487180&idx=1&sn=65a2967f13f1b578e5e2313b8876b6d7&chksm=faa0e116cdd76800677b9d086b4aee924d2b356d4ae080786cb0565d9f499efcd08a2ccff298&scene=21)
- [蚂蚁集团宣布开源 KubeTEE：让机密计算支持大规模 K8s 集群](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487020&idx=1&sn=fda0674ab5ba6ca08fe279178ffa2ea3&chksm=faa0e1f6cdd768e0eae59d2aa410c70ac9c89a67230b4824d697cb796e7199f1384663ea5644&scene=21)
- [开源项目是如何让这个世界更安全的？](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487060&idx=1&sn=48ed2ad1c75daecdbf8bf5f8fb71451e&chksm=faa0e18ecdd768989197c482dda02be2a3eb0f3e3dcac40e1de14229bfb782d4984a150ff19b&scene=21)
- [网商银行是如何建设金融级云原生分布式架构的？](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487074&idx=1&sn=8db3c74c5b4c024314a3f1743998d545&chksm=faa0e1b8cdd768aebe339efc0c24f093d6cdc2d8bfc1f4c548312090e4cb3b165201c84361be&scene=21)

### MOSN 项目进展

**本周发布详情如下：**

**1、MOSN 发布  v0.20.0 版本，主要变更如下：**

-  路由模块进行了优化与重构，支持变量机制与可配置的扩展模式
- 使用的 Go 版本升级到了 1.14.13
- 支持 XDS 非持久化模式下配置的热升级
- 完善支持了 Netpoll 模式
- 其他一些新功能、优化与 Bug Fix

详细参考：[https://github.com/mosn/mosn/releases/tag/v0.20.0](https://github.com/mosn/mosn/releases/tag/v0.20.0)
