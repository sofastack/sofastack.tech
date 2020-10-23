---
title: "SOFA Weekly | SOFAArk、SOFABoot 发版、10月28日线上直播预告"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "【10/19-10/23】 | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2020-10-23T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563524226806-e93607a3-1b77-4ca2-8c3c-0384ab966154.png"
---

**SOFA WEEKLY | 每周精选，筛选每周精华问答**
**同步开源进展，欢迎留言互动**

![weekly](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1562925824761-fc720f21-9622-437b-a783-0b0729eda119.jpeg)

**SOFA**Stack（**S**calable **O**pen **F**inancial **A**rchitecture Stack）是蚂蚁集团自主研发的金融级分布式架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

- **SOFAStack 官网：**[https://www.sofastack.tech](https://www.sofastack.tech/)
- **SOFAStack：**[https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动
我们会筛选重点问题通过 " SOFA WEEKLY " 的形式回复

**1、@廖虹剑** 提问：

> 我们想扩展一下 Dubbo 的 thrift 协议，遇到一个问题，consumer -> mosn-client -> provider，现在请求可以正常 decode -> encode 到达 provider，并且 provider 可以正常调用，在返回的时候，数据包已经发回 MOSN，并且成功 decode，但是会阻塞在 read 处直到超时，没办法 write 回 consumer。 请问有什么排查思路吗？MOSN 里面这个网络模型看得有点晕。

A：先 read 再 decode 的呀，你说的阻塞在 read 是阻塞在哪？

> read 方法已经正常调用，并且 decode了，但是没有触发写事件，consumer端 会一直在等待。 然后又会到这里卡住直到超时
> ![源码](https://cdn.nlark.com/yuque/0/2020/png/226702/1603443347425-b57afdc3-e2e6-43a6-a904-4caf22660a69.png)

A：数据 read 了没有新数据，这里就是会超时啊。你要看 decode 之后做了什么。

> 我打断点看到的 remote ip 和端口是 provider 端的。或者我换一个问法，MOSN 在获取到 upstream 的响应数据并且 decode 之后，是如何怎么触发 encodeResponse 并写回 writebuffer 的。我调试发现它 read 完数据之后无法进入到 endStream 方法。 也没看到什么异常日志。 我对 go 还不是特别了解，如果有什么问题还请多指正，辛苦了。

A：你从 Decode 的逻辑往下跟一下就可以了，Dubbo 目前是 xprotocol 协议的实现 Decode 以后会经过 proxy 的流程最后再 encode，然后 write。read 是异步的，这个有点简单的介绍：
[https://mosn.io/blog/code/mosn-eventloop/](https://mosn.io/blog/code/mosn-eventloop/)

> 找到问题了，是 encode 的时候 replace requestId 的时候出了点问题，导致找不到对应的 stream，感谢~

MOSN：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

**2、@Bernie G** 提问：

> 我这边项目是 Spring Boot，没有用 Dubbo， 这种情况可以用 Seata 做 Saga 事务吗？

A：你的服务调用是通过 feign，resttemplate？Saga 跟 RPC 框架不是强绑定的，你的远程服务可用在被调用方作为类似 reference bean 的形式调用就可以。

> 我们这边主要用的是 RestfulApi 还有 gRPC 来作为微服务之间的调用， Seata 能支持吗？ 如果能给个代码 Sample 最好。

A：Test 中有 gRPC 的实例，看下是否满足需求。
[https://github.com/seata/seata/tree/develop/integration/grpc](https://github.com/seata/seata/tree/develop/integration/grpc)

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

### 本周推荐阅读

- [开源项目是如何让这个世界更安全的？](https://mp.weixin.qq.com/s/dgjX__f6aH5j2X5W41hOWQ)
- [Hey，邀请你加入我们一起玩耍](https://mp.weixin.qq.com/s/WD6QT2-OETjP9R_6RHkdXg)

### SOFA 项目进展

**本周发布详情如下：**

**1、发布 SOFABoot v3.4.5 版本，主要变更如下：**

- 支持  triple 线程监控；
- 升级 sofa-ark 版本至 1.1.5；
- 升级 junit 版本至 4.13.1；
- 修复 jvm filter npe 问题；
- 修复http server 线程池配置问题；

详细发布报告：
[https://github.com/sofastack/sofa-boot/releases/tag/v3.4.5](https://github.com/sofastack/sofa-boot/releases/tag/v3.4.5)

**2、发布 SOFAArk v1.1.5 版本，主要变更如下：**

- 修复 web 模块并发安装问题；
- 修复支持 web 环境测试 webContext 默认为 null 导致的 NPE 问题；

详细发布报告：
[https://github.com/sofastack/sofa-ark/releases/tag/v1.1.5](https://github.com/sofastack/sofa-ark/releases/tag/v1.1.5)

### SOFA 直播预告

![Service Mesh Webinar#3](https://cdn.nlark.com/yuque/0/2020/png/226702/1603445005541-24fa183e-cf22-4d3e-9321-6c68fc66bc78.png)

在边缘计算和 5G 商业化风起云涌的当下，阿里云 CDN 开展了节点全面云原生化的改造，在此背景下，我们尝试利用 CDN 资源池为底座，在大规模复杂边缘场景下建设 Service Mesh 的基础能力，打造边缘 PaaS 平台。落地实践过程中我们使用了蚂蚁 SOFAStack–Service Mesh 体系中的 MOSN 作为数据面，Istio 作为控制面。本次分享将从 Service Mesh 技术以及 CDN 边缘场景介绍入手，重点分析 Istio 和 MOSN 结合的落地实战过程。

**分享主题：**《Service Mesh Webinar#3：Service Mesh 在 CDN 边缘场景的落地实践》

**分享嘉宾：**肖源（花名萧源），阿里云技术专家

**听众收获：**

- 了解 Service Mesh 技术；
- 了解 Service Mesh 在阿里云 CDN 边缘场景的落地实践；
- 给到想要落地 Service Mesh 的同学一些案例与建议；

**线上直播时间：**2020 年 10 月 28 日（周三）20:00-21:00

**欢迎报名**：点击“[**这里**](https://tech.antfin.com/community/live/1289)”，即可报名。
