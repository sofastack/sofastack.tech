---
author: "余淮"
date: 2018-05-31T10:12:34.000Z
aliases: "/posts/2018-05-31-01"
title: "蚂蚁金服分布式中间件开源第二弹：丰富微服务架构体系"
tags: ["SOFAStack"]
categories: "SOFAStack"
description: "本次 SOFA 中间件将继续开源微服务体系下的几个组件：包括分布式链路追踪（SOFATracer）客户端、Metrics监控度量（SOFALookout）客户端、SOFARPC 的 Nodejs 版实现。同时还开源了 SOFABoot 下的模块化开发框架，以及 SOFARPC 的 HTTP/2 能力等。"
cover: "/cover.jpg"
---

蚂蚁金服自主研发的分布式中间件（Scalable Open Financial Architecture，以下简称 SOFA 中间件），包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，是一套分布式架构的完整的解决方案，也是在金融场景里锤炼出来的最佳实践。

一个多月前，蚂蚁金服开源了 SOFABoot 和 SOFARPC 两个组件，受到了社区的热烈欢迎，也收到了很多社区的反馈，其中就有提到目前开源的组件太少。

本次 SOFA 中间件将继续开源微服务体系下的几个组件：包括分布式链路追踪（SOFATracer）客户端、Metrics 监控度量（SOFALookout）客户端、SOFARPC 的 Nodejs 版实现。同时还开源了 SOFABoot 下的模块化开发框架，以及 SOFARPC 的 HTTP/2 能力等。

下面将逐一进行简单介绍。

## SOFATracer

SOFATracer 是一个用于分布式系统调用跟踪的中间件，通过统一的 traceId 将调用链路中的各种网络调用信息以日志或者上报的方式记录下来，以达到透视化网络调用的目的。这些日志可用于故障的快速发现，数据统计，服务治理等。为了解决在实施大规模微服务架构时的链路跟踪问题，SOFATracer 基于 OpenTracing（<http://opentracing.io>） 规范并扩展其能力，包括基于 Disruptor 高性能无锁循环队列的异步落地磁盘的日志打印能力，自定义日志格式，日志自清除和滚动能力，基于 SLF4J MDC 的扩展能力，统一的配置能力等。同时 SOFATracer 也对接了开源生态，可以选择将 Tracer 数据对接到 Zipkin 等开源产品。

SOFATracer 的 Github 的地址是：<https://github.com/sofastack/sofa-tracer> ，欢迎大家使用反馈、贡献代码。（请将网址复制至浏览器中打开即可查看，下同。）

## SOFALookout

SOFALookout 是一个利用多维度的 Metrics 对目标系统进行度量和监控的中间件。Lookout 的多维度 Metrics 参考 Metrics 2.0（<http://metrics20.org/spec>） 标准，提供一整套 Metrics 的处理，包括数据埋点、收集、加工、存储与查询等。SOFALookout 包括客户端与服务器端服务两部分，本次先开源客户端部分，服务端部分代码在整理中。 SOFALookout 客户端提供了一套 Metrics API 标准，通过它可以方便地对 Java 应用的 Metrics 进行埋点统计。为了方便使用，SOFALookout 客户端默认提供一些扩展模块，它们提供 JVM，OS 等基本 Metrics 信息的统计，遵循该扩展机制，我们可以自定义或集成更多的 Metrics 数据。另外，SOFALookout 客户端除了支持向 SOFALookout 服务端上报数据外，还支持与社区主流的相关产品，包括 Dropwizard,（SpringBoot）Actuator 以及 Prometheus 等进行集成和数据适配。

SOFALookout 的 Github 的地址是：<https://github.com/sofastack/sofa-lookout> ，欢迎大家使用反馈、贡献代码。（请将网址复制至浏览器中打开即可查看，下同。）

## Eggjs 集成

每种语言都有自己最擅长的领域，跨语言友好性对于分布式架构也是非常重要的。在蚂蚁内部还有一套 Nodejs 版本的 SOFA 中间件的实现，包含了绝大部分 Java 版本的功能，并将它们集成到已经开源的企业级 Nodejs 框架 Eggjs（<https://eggjs.org>） 中，形成了一套完整的 Web MVC 和 BFF (Backend For Frontend) 解决方案。这套架构目前广泛应用于蚂蚁的 Web 开发和多端适配等场景，让各岗位有了更清晰的职责划分，服务端（一般是 Java）提供基于领域模型的 RPC 接口，前端调用接口拿到数据后进行剪裁和格式化，并实现人机交互。领域模型与页面数据是两种思维模式，通过分层可以很好地解耦，让彼此更专业高效。后面我们也会陆续开源 SOFA 中间件的 Nodejs 版本实现，本期会先放出 SOFARPC 相关的两个模块：

SOFARPC Node 的 Github 的地址是：<https://github.com/sofastack/sofa-rpc-node> ，
SOFABolt Node 的 Github 的地址是：<https://github.com/sofastack/sofa-bolt-node> ，
欢迎大家使用反馈、贡献代码。（请将网址复制至浏览器中打开即可查看，下同。）

## SOFABoot

在最新的 SOFABoot 2.4.0 版本中，SOFABoot 新增加了基于 Spring 上下文隔离的模块化开发能力。在企业级应用场景，随着应用系统模块的增多，每个业务模块之间的耦合也会越来越严重，业务模块的自测更加复杂，团队之间的沟通成本增加。模块化开发是该问题的有效解决方案，但是 Spring Boot 默认不支持模块化开发，所有 Bean 共用一个 Spring 上下文。为此，SOFABoot 提出 SOFABoot 模块的概念，每个业务团队专注于开发自己的 SOFABoot 应用模块，模块自包含模块的代码和配置，拥有独立的 Spring 上下文，便于开发及自测，减少团队间的沟通成本。SOFABoot 模块间通信使用 JVM 服务进行通信，避免模块之间的耦合；如果远程服务在本地其它本地模块中存在，可优先调本地提高性能。同时 SOFABoot 提供了模块并行启动及 Bean 异步初始化能力，大幅提高应用启动速度。

SOFABoot 的 Github 的地址是：<https://github.com/sofastack/sofa-boot> ，欢迎大家使用反馈、贡献代码。（请将网址复制至浏览器中打开即可查看，下同。）

## SOFARPC

在最新的 SOFARPC 5.4.0 版本中，SOFARPC 基于事件扩展机制，集成了 SOFATracer 和 SOFALookout 两个微服务体系产品，完善了自身的服务监控度量以及分布式跟踪功能。用户可以通过 SOFATracer 对接到 Zipkin 查看服务调用跟踪信息，也可以通过 SOFALookout 对接到 Prometheus 查看服务度量信息。新版本的 SOFARPC 中还增加了 HTTP/1.1 和 HTTP/2 协议的支持，在跨语言等场景下可以快速通过标准的 HTTP 协议进行通信。SOFARPC 也与 Eggjs 进行了打通了 Bolt 协议，方面用户在 Java 和 Nodejs 之间高效通信。

SOFARPC 的 Github 的地址是：<https://github.com/sofastack/sofa-rpc> ，欢迎大家使用反馈、贡献代码。（请将网址复制至浏览器中打开即可查看，下同。）

## Jarslink 2.0

JarsLink 是蚂蚁金服内部使用的一个基于 JAVA 的模块化开发框架，它提供在运行时动态加载模块（一个 JAR 包）、卸载模块和模块间调用的 API。

目前 Jarslink 2.0 在紧张开发之中，Jarslink2.0 是在 Jarslink1.0 基础之上，结合 SOFABoot 类隔离框架，提供了更加通用的应用(模块)隔离和通信的实现方案，敬请期待！

Jarslink 的 Github 的地址是：<https://github.com/alibaba/jarslink> ，欢迎大家使用反馈、贡献代码。（请将网址复制至浏览器中打开即可查看，下同。）

## 附录

附本文中提到的链接：

- SOFATracer: <https://github.com/sofastack/sofa-tracer>
- SOFALookout：<https://github.com/sofastack/sofa-lookout>
- SOFABoot: <https://github.com/sofastack/sofa-boot>
- SOFARPC Node：<https://github.com/sofastack/sofa-rpc-node>
- SOFABolt Node：<https://github.com/sofastack/sofa-bolt-node>
- Eggjs：<https://eggjs.org>
- SOFARPC: <https://github.com/sofastack/sofa-rpc>
- JarsLink：<https://github.com/alibaba/jarslink>
- SOFAStack 系列文章知乎专栏：<https://zhuanlan.zhihu.com/sofastack>

## 交流

最后，我们也为对 SOFA 中间件感兴趣的同学准备了微信的交流群，欢迎感兴趣的同学扫描下方二维码联系加群小助手加入我们 SOFA 交流群哦。

![undefined](https://cdn.yuque.com/lark/0/2018/png/9439/1527615171760-bb6e1719-89f8-4b59-bc3d-4954381d1ff2.png)

- 金融级分布式架构交流 1 群（已满）
- 金融级分布式架构交流 2 群（已满）
- 金融级分布式架构交流 3 群（已满）
- 金融级分布式架构交流 4 群 (430/500)
- 金融级分布式架构交流 5 群 (270/500)
