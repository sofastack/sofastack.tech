---
author: "Yu Shuqiang"
date: 2019-03-27T14:30:00.000Z
title:  "蚂蚁金服开源分布式链路跟踪组件 SOFATracer 埋点机制剖析"
description: "本文为《剖析 | SOFATracer 框架》最后一篇，本篇作者 Yu Shuqiang，来自小象生鲜。"
tags: ["SOFATracer","SOFALab","剖析 | SOFATracer 框架"]
categories: "SOFATracer"
aliases: "/posts/2019-02-21-05"
cover: "/cover.jpg"
---

> **SOFA** **S**calable **O**pen **F**inancial **A**rchitecture 是蚂蚁金服自主研发的金融级分布式中间件，包含了构建金融级云原生架构所需的各个组件，是在金融场景里锤炼出来的最佳实践。
> 
> SOFATracer 是一个用于分布式系统调用跟踪的组件，通过统一的 TraceId 将调用链路中的各种网络调用情况以日志的方式记录下来，以达到透视化网络调用的目的，这些链路数据可用于故障的快速发现，服务治理等。
> 
> 本文为《剖析 | SOFATracer 框架》最后一篇，本篇作者yushuqiang，来自小象生鲜。《剖析 | SOFATracer 框架》系列由 SOFA 团队和源码爱好者们出品，项目代号：[SOFA:TracerLab/]，目前领取已经完成，感谢大家的参与。
> 
> **SOFATracer**：<https://github.com/sofastack/sofa-tracer>

![SOFATracer-埋点.jpg](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1550721767785-3fb17b31-aaa0-4748-82eb-b36e734458d0.jpeg)

## 前言

自 Google[《Dapper，大规模分布式系统的跟踪系统》](https://bigbully.github.io/Dapper-translation/)论文发表以来，开源 Tracer 系统如雨后春笋般相继面市，各显神通，但都是用于分布式系统调用跟踪的组件，通过统一的 traceId 将调用链路中的各种网络调用情况记录下来，以达到透视化网络调用的目的。本文介绍的 SOFATracer 是以日志的形式来记录的，这些日志可用于故障的快速定位，服务治理等。目前来看 SOFATracer 团队已经为我们搭建了一个完整的 Tracer 框架内核，包括数据模型、编码器、跨进程透传 traceId、采样、日志落盘与上报等核心机制，并提供了扩展 API 及基于开源组件实现的部分插件，为我们基于该框架打造自己的 Tracer 平台提供了极大便利。

作为一个开源实现，SOFATracer 也尽可能提供大而全的插件实现，但由于多数公司都有自己配套的技术体系，完全依赖官方提供的插件可能无法满足自身的需要，因此如何基于 SOFATracer 自身 API 的组件埋点机制进行扩展，实现自己的插件是必须掌握的一项本领。

本文将根据 SOFATracer 自身 AP I的扩展点及已提供的插件源码来分析下 SOFATracer 插件的埋点机制。

## SOFATracer 的插件埋点机制

对一个应用的跟踪要关注的无非就是 客户端->web 层->rpc 服务->dao 后端存储、cache 缓存、消息队列 mq 等这些基础组件。SOFATracer 插件的作用实际上也就是对不同组件进行埋点，以便基于这些组件采集应用的链路数据。

不同组件有不同的应用场景和扩展点，因此对插件的实现也要因地制宜，SOFATracer 埋点方式一般是通过 Filter、Interceptor 机制实现的。

### 组件扩展入口之 Filter or Interceptor

SOFATracer 目前已实现的插件中，像 SpringMVC 插件是基于 Filter 进行埋点的，httpclient、resttemplate 等是基于 Interceptor 机制进行埋点的。在实现插件时，要根据不同插件的特性和扩展点来选择具体的埋点方式。正所谓条条大路通罗马，不管怎么实现埋点，都是依赖 SOFATracer 自身 API 的扩展机制来实现。

### API 扩展点之 AbstractTracer API

SOFATracer 中所有的插件均需要实现自己的 Tracer 实例，如 SpringMVC 的 SpringMvcTracer 、HttpClient 的 HttpClientTracer 等。

- 基于 SOFATracer API 埋点方式插件扩展如下：

![image.png](https://cdn.nlark.com/yuque/0/2019/png/236836/1550332686660-52ddc403-fd3c-4839-aed0-cc0f2fea03b4.png)

AbstractTracer 是 SOFATracer 用于插件扩展使用的一个抽象类，根据插件类型不同，又可以分为 clientTracer 和 serverTracer，分别对应于 AbstractClientTracer 和 AbstractServerTracer；再通过 AbstractClientTracer 和 AbstractServerTracer 衍生出具体的组件 Tracer 实现，比如上图中提到的 HttpClientTracer 、RestTemplateTracer 、SpringMvcTracer 等插件 Tracer 实现。

#### AbstractTracer

这里先来看下 AbstractTracer 这个抽象类中具体提供了哪些抽象方法，也就是对于 AbstractClientTracer 和 AbstractServerTracer 需要分别扩展哪些能力。

![image.png](https://cdn.nlark.com/yuque/0/2019/png/236836/1550331690680-f18576a5-f99f-48bc-bae3-70b10013795e.png)

从上图  AbstractTracer 类提供的抽象方法来看，不管是 client 还是 server，在具体的 Tracer 插件实现中，都必须提供以下实现：

- DigestReporterLogName ：当前组件摘要日志的日志名称
- DigestReporterRollingKey : 当前组件摘要日志的滚动策略
- SpanEncoder：对摘要日志进行编码的编码器实现
- AbstractSofaTracerStatisticReporter : 统计日志 reporter 类的实现类

基于 SOFATracer 自身 API 埋点最大的优势在于可以通过上面的这些参数来实现不同组件日志之间的隔离，上述需要实现的这些点是实现一个组件埋点常规的扩展点，是不可缺少的。

上面分析了 SOFATracer API 的埋点机制，并且对于一些需要扩展的核心点进行了说明。SOFATracer 自身提供的内核非常简单，其基于自身 API 的埋点扩展机制为外部用户定制组件埋点提供了极大的便利。下面以 Thrift 扩展，具体分析如何实现一个组件埋点。

> PS : Thrift 是外部用户基于 SOFATracer API 扩展实现的，目前仅用于其公司内部使用，SOFATracer 官方组件中暂不支持，请知悉；后续会沟通作者提供 PR ，在此先表示感谢。

## Thrift 插件埋点分析

这里我们以 Thrift RPC 插件实现为例，分析如何实现一个埋点插件。

**1、实例工程的分包结构**

![image.png](https://cdn.nlark.com/yuque/0/2019/png/236836/1550567519779-8d83f912-e07f-44f5-bb1e-3a69fd4fb770.png)

从上图插件的工程的包结构可以看出，整个插件实现比较简单，代码量不多，但从类的定义来看，直观的体现了SOFATracer 插件埋点机制所介绍的套路。下面将进行详细的分析与介绍。

**2、实现 Tracer 实例**

RpcThriftTracer 继承了 AbstractTracer 类，是对 clientTracer、serverTracer 的扩展。

| AbstractTracer | RpcThriftTracer |
| --- | --- |

> PS：如何确定一个组件是 client 端还是 server 端呢？就是看当前组件是请求的发起方还是请求的接受方，如果是请求发起方则一般是 client 端，如果是请求接收方则是 server 端。那么对于 RPC 来说，即是请求的发起方也是请求的接受方，因此这里实现了 AbstractTracer 类。

**3、扩展点类实现**

| DigestReporterLogName               | RpcTracerLogEnum                                             | 当前组件摘要日志的日志名称     | 目前 SOFATracer 日志名、滚动策略 key 等都是通过枚举类来定义的，也就是一个组件会对应这样一个枚举类，在枚举类里面定义这些常量。 |      |
| ----------------------------------- | ------------------------------------------------------------ | ------------------------------ | ------------------------------------------------------------ | ---- |
| DigestReporterRollingKey            | RpcTracerLogEnum                                             | 当前组件摘要日志的滚动策略     |                                                              |      |
| SpanEncoder                         | AbstractRpcDigestSpanJsonEncoder<br />RpcClientDigestSpanJsonEncoder<br />RpcServerDigestSpanJsonEncoder | 对摘要日志进行编码的编码器实现 | 这个决定了摘要日志打印的格式，和在统计日志里面的实现要有所区分。 |      |
| AbstractSofaTracerStatisticReporter | AbstractRpcStatJsonReporter<br />RpcClientStatJsonReporter<br />RpcServerStatJsonReporter | 统计日志 reporter 类的实现类   | 这里就是就是将统计日志添加到日志槽里，等待被消费(输出到日志)。具体可以参考：SofaTracerStatisticReporterManager.StatReporterPrinter。 |      |
| RpcSpanTags                         |                                                              |                                | 要采集数据 key 的取值定义                                    |      |


> PS:上面表格中SpanEncoder和AbstractSofaTracerStatisticReporter的实现中，多了一层AbstractRpcDigestSpanJsonEncoder和AbstractRpcStatJsonReporter的抽象，主要是由于client和server端有公共的逻辑处理，为了减少冗余代码，而采用了多继承模式处理。

**4、数据传播格式实现**

| ThriftRequestCarrier |
| --- |

SOFATracer 支持使用 OpenTracing 的内建格式进行上下文传播。

**5、Thrift Rpc 自身扩展点之请求拦截埋点**

| FilterThriftBase     |
| -------------------- |
| ConsumerTracerFilter |
| ProviderTracerFilter |

> 我们内部 Thrift 支持 SPI Filter 机制，因此要实现对请求的拦截过滤，示例插件埋点的实现就是基于 SPI Filter 机制完成的。其中FilterThriftBase抽象也是为了便于处理consumerFilter和providerFilter公共的逻辑抽象。

## 插件扩展基本思路总结

对于一个组件来说，一次处理过程一般是产生一个 Span；这个 Span 的生命周期是从接收到请求到返回响应这段过程。

但是这里需要考虑的问题是如何与上下游链路关联起来呢？在 Opentracing 规范中，可以在 Tracer 中 extract 出一个跨进程传递的 SpanContext 。然后通过这个 SpanContext 所携带的信息将当前节点关联到整个 Tracer 链路中去，当然有提取（extract）就会有对应的注入（inject）；更多请参考 [蚂蚁金服分布式链路跟踪组件链路透传原理与SLF4J MDC的扩展能力分析 | 剖析](https://www.sofastack.tech/blog/sofa-tracer-unvarnished-transmission-slf4j-mdc/) 。

链路的构建一般是 client-server-client-server 这种模式的，那这里就很清楚了，就是会在 client 端进行注入（inject），然后再 server 端进行提取（extract），反复进行，然后一直传递下去。

在拿到 SpanContext 之后，此时当前的 Span 就可以关联到这条链路中了，那么剩余的事情就是收集当前组件的一些数据；整个过程大概分为以下几个阶段：

- 从请求中提取 spanContext
- 构建 Span，并将当前 Span 存入当前 tracer上下文中（SofaTraceContext.push(Span)） 。
- 设置一些信息到 Span 中
- 返回响应
- Span 结束&上报

下面结合 SOFATracer 自身 API 源码来逐一分析下这几个过程。

### 从请求中提取 spanContext

Thrift 插件中的 Consumer 和 Provider 分别对应于 client 和 server 端存在的，所以在 client 端就是将当前请求线程的产生的 traceId 相关信息 Inject 到 SpanContext，server 端从请求中 extract 出 spanContext，来还原本次请求线程的上下文。

相关处理逻辑在FilterThriftBase抽象类中，如下图:

![image.png](https://cdn.nlark.com/yuque/0/2019/png/236836/1550500090382-54a106e9-5364-4116-bb20-fb2bda8dc57d.png)

- inject 实现代码

![image.png](https://cdn.nlark.com/yuque/0/2019/png/230565/1550543988556-dec724ef-f07c-47b4-bec7-e21d99aa50ea.png)

- extract 实现代码

![image.png](https://cdn.nlark.com/yuque/0/2019/png/230565/1550544112889-b54b47cf-48e9-4767-b5d3-30b947091e69.png)

### 获取 Span & 数据获取

serverReceive 这个方法是在 AbstractTracer 类中提供了实现，子类不需要关注这个。在 SOFATracer 中也是将请求大致分为以下几个过程：

- 客户端发送请求 clientSend cs
- 服务端接受请求 serverReceive sr
- 服务端返回结果 serverSend ss
- 客户端接受结果 clientReceive cr

无论是哪个插件，在请求处理周期内都可以从上述几个阶段中找到对应的处理方法。因此，SOFATracer 对这几个阶段处理进行了封装。见下图:

![image.png](https://cdn.nlark.com/yuque/0/2019/png/236836/1550566722325-5e0df98a-a297-4114-9775-c0b60f4b57c6.png)

这四个阶段实际上会产生两个 Span，第一个 Span 的起点是 cs，到 cr 结束；第二个 Span 是从 sr 开始，到 ss 结束。

```yaml
clientSend
		serverReceive
    ...
    serverSend
clientReceive   
```

来看下 Thrift Rpc 插件中 Consumer 和 Provider 的实现

- ConsumerTracerFilter

![1-1.jpg](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1550562486309-15ff0874-b0b8-46ea-9104-a786e75f9207.jpeg)

红色框内对应的客户端发送请求，也就是 cs 阶段，会产生一个 Span。

- ProviderTracerFilter

![1-2.jpg](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1550562880070-9ccb839f-de48-467a-be91-cec841cac936.jpeg)

服务端接收请求 sr 阶段，产生了一个 Span 。上面appendProviderRequestSpanTags这段代码是为当前这个 Span 设置一些基本信息，包括当前应用的应用名、当前请求的 service、当前请求的请求方法以及请求大小等。

### 返回响应与结束 Span

在 Filter 链执行结束之后，ConsumerTracerFilter（见图一）和 ProviderTracerFilter（见图二） 分别在 finally 块中又补充了当前请求响应结果的一些信息到 Span 中去。然后分别调用 clientReceive 和 serverSend 结束当前 Span。

- 图一

![image.png](https://cdn.nlark.com/yuque/0/2019/png/236836/1550568149395-8ec8212a-6a20-43b0-bb21-58241389e35b.png)

- 图二

![image.png](https://cdn.nlark.com/yuque/0/2019/png/236836/1550568092408-2dcc5b51-6319-43b8-bfad-817e2c804a56.png)

关于 clientReceive 和 serverSend 里面调用 Span.finish 这个方法( opentracing 规范中，Span.finish 的执行标志着一个 Span 的结束（见图一)，当调用finish执行逻辑时同时会进行span数据的上报(见图二)和当前请求线程MDC资源的清理操作(见图三)等。

- 图一：

![image.png](https://cdn.nlark.com/yuque/0/2019/png/236836/1550395955392-1642ff56-de68-40bc-848b-ca1b967f30f2.png)

当前 Span 数据上报，代码如下：

- 图二：

![image.png](https://cdn.nlark.com/yuque/0/2019/png/236836/1550396157629-fadbbe7a-fb2f-4d7b-be6e-7f3db99c6b33.png)

清理当前请求线程的 MDC 资源的一些逻辑处理等，代码如下：

- 图三:

![image.png](https://cdn.nlark.com/yuque/0/2019/png/236836/1550396215642-b46aa47f-cab4-45b6-a61d-33d2d0647847.png)

### 插件编写流程总结

上述以自定义 Thrift RPC 插件为例，分析了下 SOFATracer 插件埋点实现的一些细节。前面不仅总结了编写插件的基本埋点思路而且还对 SOFATracer 自身 API 实现做了相应的分析。基于此本节则从整体思路上来总结如何编写一个 SOFATracer 的插件：

1. 确定所要实现的插件，理解该组件的使用场景和扩展点，然后确定以哪种方式来埋点，比如：是 Filter or Interceptor
2. 实现当前插件的 Tracer 实例，这里需要明确当前插件是以 client 存在还是以 server 存在
3. 实现一个枚举类，用来描述当前组件的日志名称和滚动策略 key 值等
4. 实现插件摘要日志的 Encoder ，实现当前组件的定制化输出
5. 实现插件的统计日志 Reporter 实现类，通过继承 AbstractSofaTracerStatisticReporter 类并重写doReportStat
6. 定义当前插件的传播格式
7. 要明确我们需要收集哪些数据

## 小结

本文通过对 SOFATracer 插件的埋点机制进行分析介绍，并结合自定义 Thrift RPC 插件的埋点实现进行了分析。希望通过本文能够让更多的同学理解基于 SOFATracer 自身 API 的埋点实现，能根据自身需要实现自己的插件。

**文中涉及到的所有链接：**

- 《Dapper，大规模分布式系统的跟踪系统》：<https://bigbully.github.io/Dapper-translation/>
- 蚂蚁金服分布式链路跟踪组件链路透传原理与SLF4J MDC的扩展能力分析 | 剖析： <https://mp.weixin.qq.com/s/DQNOz6QnfKCJ0rhbx1cJLw>

![加入钉钉群.png](https://cdn.nlark.com/yuque/0/2019/png/226702/1550721734815-7fecd598-f7b8-4ae6-a5eb-809a7f13b8a4.png)

**欢迎大家共同打造 SOFAStack <https://github.com/alipay>**