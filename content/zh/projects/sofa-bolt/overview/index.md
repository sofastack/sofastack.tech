---
title: "SOFABolt 概述"
aliases: "/sofa-bolt/docs/Home"
---

# 介绍

SOFABolt 是蚂蚁金融服务集团开发的一套基于 Netty 实现的网络通信框架。

* 为了让 Java 程序员能将更多的精力放在基于网络通信的业务逻辑实现上，而不是过多的纠结于网络底层 NIO 的实现以及处理难以调试的网络问题，Netty 应运而生。
* 为了让中间件开发者能将更多的精力放在产品功能特性实现上，而不是重复地一遍遍制造通信框架的轮子，SOFABolt 应运而生。

Bolt 名字取自迪士尼动画-闪电狗，是一个基于 Netty 最佳实践的轻量、易用、高性能、易扩展的通信框架。
这些年我们在微服务与消息中间件在网络通信上解决过很多问题，积累了很多经验，并持续的进行着优化和完善，我们希望能把总结出的解决方案沉淀到 SOFABolt 这个基础组件里，让更多的使用网络通信的场景能够统一受益。
目前该产品已经运用在了蚂蚁中间件的微服务 ([SOFARPC](https://github.com/alipay/sofa-rpc))、消息中心、分布式事务、分布式开关、以及配置中心等众多产品上。

## 多语言

* [node](https://github.com/alipay/sofa-bolt-node)
* [python](https://github.com/alipay/sofa-bolt-python)
* [cpp](https://github.com/alipay/sofa-bolt-cpp)

