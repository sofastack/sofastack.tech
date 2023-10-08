---
title: "SOFA Weekly｜SOFA 聊天室、issue 精选"
authorlink: "https://github.com/sofastack"
description: "SOFA 聊天室、issue 精选"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2023-10-06T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ"
---

## SOFA WEEKLY | 每周精选

![图片](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ)

**筛选每周精华问答，同步开源进展，欢迎留言互动～**

**SOFA**Stack（**S**calable **O**pen **F**inancial **A**rchitecture Stack）是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

**SOFAStack 官网:** *[https://www.sofastack.tech](https://www.sofastack.tech)*

**SOFAStack:** *[https://github.com/sofastack](https://github.com/sofastack)*

## **SOFAStack** **GitHub issue 精选**  

**本周各项目回复 issue 精选 3 条**

欢迎大家在 GitHub 提交 issue 与我们互动

**1.@****MOSN** **#2347**

@huayangchan

> 我们目前在调研阶段，想用 envoy 做来做流量代理，但是考虑到研发效能，所以想用 MOE 的方案看看。因为涉及到 L4 的流量处理，顺便再确认下，那对于企业内部自定义的 RPC 协议，涉及到四层的流量 filter 操作，基于目前开源版 MOSN 是做不‍到哈？只能基于原生 envoy 的 L4 extension 来做么？

A：这个我们内部的做法就是 MOSN 的 xprotocol 框架支持多协议，然后再用 L4 MOE 嫁接到 envoy 上。收益还是很可观，没有链接的常驻协程。如果直接用 envoy 的 L4 的话，你其实还是需要用 Go 搞一套 proxy 框架出来的。你可以先用纯 MOSN 支持你们的 RPC 协议，然后再用 MOE 移植到 envoy 上。

「**MOSN**」：[https://github.com/mosn/mosn/issues/2347](https://github.com/mosn/mosn/issues/2347)

**2.@****SOFABolt** **#332**

@tongtaodragonfly

> 在我们的环境中，连接事件日志文件中出现警告消息，如下所示：
>
> 未知协议代码：[ProtocolVersion{version=[3]}] 在 ProtocolDecoder 中解码时。]
> 为什么会报告此警告消息？什么样的情况可能会触发此警告消息？

A：协议版本是应用层网络帧的第一个字节。通常为 1*（对于 BoltV1）*和 2*（对于 BoltV2 协议）*。如果第一个字节是 3，bolt 找不到对应的协议，所以你会看到这个错误。

此问题可能有两个常见原因：

- 一些未知的客户端向您的端口发送错误的数据包；
- 解码器没有消耗掉一个数据包中的所有数据，因此存中留下了一些错误的数据。Decoder 下次消费数据时，读取到了错误的数据。

「**SOFARPC**」：[https://github.com/sofastack**/sof**a-registry/issues/332](https://github.com/sofastack**/sof**a-registry/issues/332)

**3.@****SOFAArk** **#741**

@jgslvwy

> 请问下 SOFAArk 子应用支持用 spring-boot-maven-plugin 吗？为什么示例里面子应用还用的 sofa-ark-maven-plugin？

A：子应用使用 sofa-ark-maven-plugin 构建产物是可以热部署到基座的 Jar 包，你要用 spring-boot-maven-plugin 也是可以，子应用本身也是独立的 Spring Boot，只是不能热部署到基座 JVM 上而已。

「**MOSN**」：[https://github.com/sofastack/sofa-ark/issues/741](https://github.com/sofastack/sofa-ark/issues/741)

## 本周推荐阅读

[MoE 系列（六）｜Envoy Go 扩展之并发安全](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247538519&idx=1&sn=c6b9c04abe6111a041b5b1c9c7f52f60&chksm=faa3b88dcdd4319bdeebd82f1c94789429f692b395411d23298378c0665eb8ade45c141e74ad&scene=21)

[Seata Saga 模式快速入门和最佳实践](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247537326&idx=1&sn=4507cf56bbf8f666ad6e8150c847b2ba&chksm=faa3bd74cdd43462a4f4cb55844caa4632ee56deef48708ea1da8b7090d3eab0ffd9731e9c30&scene=21)

[Go 语言，如何做逆向类型推导?](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247523846&idx=1&sn=001825b6396d817bb9c8c9fd8da388ec&chksm=faa371dccdd4f8ca4026523e5f6c109fb2368b0250f77ed9accb0d67e2e9085351840af177b5&scene=21)

[SOFABoot 4.0 正式发布，多项新特性等你来体验！](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247538370&idx=1&sn=d6dd2814c3341825fe9b3abc9d8158e7&chksm=faa3b918cdd4300e8a423e4018374b51bd55d1947235aa3efed0c3f0532401e37b7d04079e6e&scene=21)
