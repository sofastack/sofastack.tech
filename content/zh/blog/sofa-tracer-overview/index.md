---
author: "卫恒"
date: 2019-02-21T10:20:00.000Z
title: "蚂蚁金服分布式链路跟踪组件 SOFATracer 总览|剖析"
description: "本文为《剖析 | SOFATracer 框架》第一篇。"
tags: ["SOFATracer","SOFALab","剖析 | SOFATracer 框架"]
categories: "SOFATracer"
aliases: "/posts/2019-02-21-01"
cover: "/cover.jpg"
---

> **SOFA** **S**calable **O**pen **F**inancial **A**rchitecture 是蚂蚁金服自主研发的金融级分布式中间件，包含了构建金融级云原生架构所需的各个组件，是在金融场景里锤炼出来的最佳实践。
> 
> SOFATracer 是一个用于分布式系统调用跟踪的组件，通过统一的 TraceId 将调用链路中的各种网络调用情况以日志的方式记录下来，以达到透视化网络调用的目的，这些链路数据可用于故障的快速发现，服务治理等。
>
> **SOFATracer**：<https://github.com/sofastack/sofa-tracer>
>
> 本文为《剖析 | SOFATracer 框架》第一篇。《剖析 | SOFATracer 框架》系列由 SOFA 团队和源码爱好者们出品，项目代号：**<SOFA:TracerLab/>**，目前领取已经完成，感谢大家的参与。

## 0、前言

在单体应用时代，我们不需要花费时间去关心调用链路这个东西。但是链路跟踪不仅仅是在分布式场景下才会有，即使是单体应用，同样也会存在调用链路。例如，我们把应用中的每个服务接口作为一个链路节点，那么从请求进来到返回响应，把这个过程中多历经的所有的方法接口串联起来，就能组成一条完整的链路，如下图所示：

![image.png](https://cdn.nlark.com/yuque/0/2018/png/230565/1545721651795-b68225a5-6984-4611-bd5e-daa39ad9b12d.png)

对于单体应用而言，如果访问一个资源没有成功，那么我们可以很快的锁定是哪一台机器，然后通过查询这台机器上的日志就能定位问题。

但是在微服务体系架构下，这种方式会显得非常无力。对于一个稍具规模的应用来说，一次请求可能会跨越相当多的服务节点，在这种情况下，如果一个请求没有得到成功的响应，就不能确定到底是哪个节点出了问题。

![image.png](https://cdn.nlark.com/yuque/0/2018/png/230565/1545722681335-235fb45d-d12a-43a8-bd8d-15ff594a27ee.png)

因此在面对这种复杂的大规模分布式集群来实现的服务体系来说，就需要一些可以帮助理解各个应用的线上调用行为、并可以分析远程调用的组件。

基于上述背景，蚂蚁金服开源了基于 [OpenTracing 规范](http://opentracing.io/documentation/pages/spec.html)实现的 `SOFATracer` 分布式链路跟踪组件，为实施大规模服务化体系架构场景下提供了链路跟踪的解决方案。

在介绍 `SOFATracer` 之前，先来了解一下 `Opentracing` 规范。

## 1、Opentracing 简介

首先来解释下 `OpenTracing` 是什么`OpenTracing` 致力于为分布式跟踪创建更标准化的API和工具，它由完整的API规范、实现该规范的框架、库以及项目文档组成。

`OpenTracing` 提供了一套平台无关、厂商无关的 `API`，这样不同的组织或者开发人员就能够更加方便的添加或更换追踪系统的实现。 `OpenTracing API` 中的一些概念和术语，在不同的语言环境下都是共享的。

### 1.1、数据模型

`Opentracing` 规范中，一条 `trace` 链路是由多个与之关联的 `span` 组成，一条链路整体可以看做是一张有向无环图，各个`span`之间的边缘关系被称之为“`References`”。下面是官方提供的示例：

![image.png](https://cdn.nlark.com/yuque/0/2018/png/230565/1545823143569-d51faa50-c92a-417a-a706-fae685c15254.png)

如果已时间轴维度来看的话，也可以表现为下面的形式(官方示例)：

![image.png](https://cdn.nlark.com/yuque/0/2018/png/230565/1545823169389-13231c3e-f4d6-451e-8266-9607327378c9.png)

- `root span` : 当前链路中的第一个 `span`
- `ChildOf` 和 `FollowFrom` 是目前被定义的两种 `References` 类型
  - `ChildOf` : 父级 span某种程度上取决于子span （子span的结果可能会对父span产生影响）
  - `FollowFrom` : 父 `Span`不以任何方式依赖子 `Span`

但是为了简化 `span` 之间的这种依赖关系，在具体实现时通常会将具有嵌套关系的作为 `ChildOf`，平行执行的作为`FollowFrom`，比如：

__a、ChildOf 示例__

在 `methodA` 中调用了 `method` B : 

```java
methodA(){            // spanA start
    methodB();            
}                     // spanA finish
methodB(){            // spanB start
}                     // spanB finish
```

产生的 `span `在时间维度上展现的视角如下：

![image.png](https://cdn.nlark.com/yuque/0/2018/png/230565/1545823843007-cf30f4e9-1b5f-4405-bd39-c08b44d00599.png)

这种关系一般会 表示为 `SpanB ChildOf SpanA` 。

__b、FollowFrom 示例__

`method` 方法中，`methodA `执行之后 `methodB` 执行 :

```java
method(){
    methodA();
    methodB();
}
```

产生的 `span `在时间维度上展现的视角如下：

![image.png](https://cdn.nlark.com/yuque/0/2018/png/230565/1545823870929-bf7d3af0-3c72-4ac7-909d-74f064c58c3b.png)

这种关系一般会 表示为 `SpanB FollowFrom SpanA` 。

### 1.2、API 

`Opentracing API` 是对分布式链路中涉及到的一些列操作的高度抽象集合。`Opentracing` 中将所有核心的组件都声明为接口，例如 `Tracer`、`Span`、`SpanContext`、`Format`（高版本中还包括 `Scope` 和 `ScopeManager`）等。`SOFATracer` 使用的版本是 0.22.0 ，主要是对 `Tracer`、`Span`、`SpanContext` 三个概念模型的实现。下面就针对这三个组件结合 `SOFATracer` 来分析。

## 1.3、SOFATracer 标准实现

下图为 `SOFATracer` 中对于这三个核心接口实现的类图结构：

![image.png](https://cdn.nlark.com/yuque/0/2018/png/230565/1545807361481-6dc77271-3c0e-4588-b4b4-37674ed0b5f9.png)

> 由于篇幅原因，下面的介绍过程中一些点不会展开说明，有兴趣的同学可以自行官网查看完整的 [OpenTracing-api 规范](http://opentracing.io/documentation/pages/spec.html) （[https://opentracing.io/specification/](https://opentracing.io/specification/)）。

**a、Tracer & SofaTracer**

`Tracer` 是一个简单、广义的接口，它的作用就是构建 `span` 和传输 `span` 。核心接口列表如下：

| 接口                                                         | 描述                                             |
| ------------------------------------------------------------ | ------------------------------------------------ |
| SpanBuilder buildSpan(String operationName)                  | 根据指定的operationName构建一个新的span          |
|void inject(SpanContext spanContext, Format format, C carrier); | 将 spanContext 以 format 的格式注入到 carrier 中 |
| SpanContext extract(Format  format, C carrier);        | 以 format 的格式从carrier中解析出 SpanContext    |

`SofaTracer` 实现了 `Tracer` 接口，并扩展了采样、数据上报等能力。

**b、Span & SofaTracerSpan**

`Span` 是一个跨度单元，在实际的应用过程中，`Span` 就是一个完整的数据包，其包含的就是当前节点所需要上报的数据。核心接口列表如下：

| 接口                                               | 描述                       |
| -------------------------------------------------- | -------------------------- |
| SpanContext context()                              | 从 span 中获取 SpanContext |
| void finish()/void finish(long finishMicros)       | 结束一个 span              |
| void close()                                       | 关闭 span                  |
| Span setTag(String key, value)                     | 设置 tags                  |
| Span log(long timestampMicroseconds, String event) | 设置 log 事件              |
| Span setOperationName(String operationName)        | 设置span的operationName    |
| Span setBaggageItem(String key, String value)      | 设置 BaggageItem           |
| String getBaggageItem(String key)                  | 获取 BaggageItem           |

> 关于`tags`和`log`的解释：如果把从进入公司到离开公司这段时间作为一个 `span`，那么 `tags` 里面可以是你写的代码，你喝的水，甚至你讲过的话；`log` 则更关注某个时刻的事，比如在12:00 去吃了个饭，在15:00 开了个会。
> 如果说 `tags` 里面都是和公司有关的，那么 `Baggage` 里面则不仅仅是局限于你在公司的事，比如你口袋里的手机。

 `SofaTracerSpan` 在实现 `Span` 接口，并扩展了对 `Reference`、`tags`、线程异步处理以及插件扩展中所必须的 `logType `和产生当前 `span `的 `Tracer `类型等处理的能力。

**c、SpanContext & SofaTracerSpanContext**

`SpanContext` 对于 `OpenTracing` 实现是至关重要的，通过 `SpanContext` 可以实现跨进程的链路透传，并且可以通过 `SpanContext` 中携带的信息将整个链路串联起来。

> 官方文档中有这样一句话：“在 `OpenTracing` 中，我们强迫 `SpanContext` 实例成为不可变的，以避免 `Span` 在`finish` 和 `reference` 操作时会有复杂的生命周期问题。” 这里是可以理解的，如果 `SpanContext` 在透传过程中发生了变化，比如改了 `tracerId`，那么就可能导致链路出现断缺。

`SpanContext` 中只有一个接口：

| 接口                                                  | 描述                            |
| :---------------------------------------------------- | :------------------------------ |
| `Iterable<Map.Entry<String, String>> baggageItems();` | 拿到所有的baggageItems 透传数据 |

`SofaTracerSpanContext` 实现了 `SpanContext` 接口，扩展了构建 `SpanContext`、序列化 `baggageItems` 以及`SpanContext`等新的能力，除此之外，`SpanContext` 在跨进行透传时携带的信息进行了规范：

| 携带信息   | 描述                 |
| ---------- | -------------------- |
| traceId    | 全链路唯一的标识信息 |
| spanId     | spanId               |
| parentId   | 父 spanId            |
| isSampled  | 采样标记             |
| sysBaggage | 系统透传数据         |
| bizBaggage | 业务透传数据         |

## 2、SOFATracer 扩展

为了满足在复杂场景下的链路跟踪需求，`SOFATracer` 在 `Opentracing` 规范基础上又提供了丰富的扩展能力。

### 2.1、SOFATracer 架构及功能扩展

![image.png](https://cdn.nlark.com/yuque/0/2018/png/230565/1545726398274-7a93d437-3dad-4608-a175-5e408685a05b.png)

`SOFATracer` 基于 [OpenTracing 规范](http://opentracing.io/documentation/pages/spec.html)实现，并且通过 [Disruptor](https://github.com/LMAX-Exchange/disruptor)组件实现了日志的无锁异步打印能力。

- 基于 [SLF4J 的 MDC](https://www.slf4j.org/manual.html#mdc) 扩展能力

应用在通过面向日志编程接口 SLF4J 打印应用日志时，可以只在对应的日志实现配置文件的 PatternLayout 中添加相应的参数即可，如添加 [%X{SOFA-TraceId},%X{SOFA-SpanId}] ，那么应用日志就可以在发生链路调用时打印出相应的 TraceId 和 SpanId，而无论应用具体的日志实现是 Logback、Log4j2 或者 Log4j。关于这部分的实现原理，期待大家一起编写，领取方式见文末。

- `SOFATracer` 的埋点机制

SOFATracer 目前仅提供了基于自身 API 埋点的方式。SOFATracer 中所有的插件均需要实现自己的 Tracer 实例，如 Mvc 的 SpringMvcTracer 、HttpClient 的 HttpClientTracer 等，如下图所示：

![image.png](https://cdn.nlark.com/yuque/0/2018/png/230565/1545727208409-6fc5d6d0-d46e-479e-8747-c7d07d86025f.png)

`SOFATracer` 将不同的扩展组件分为 `AbstractClientTracer` 和 `AbstractServerTracer`，再通过`AbstractClientTracer` 和 `AbstractServerTracer` 衍生出具体的组件 `Tracer` 实现。这种方式的好处在于，所有的插件实现均有 `SOFATracer` 本身来管控，对于不同的组件可以轻松的实现差异化和定制化。

但是为了能够拥抱社区，我们在后续的版本中将会提供基于 `Opentracing API` 的埋点扩展实现，从而实现与 [opentracing-contrib](https://github.com/opentracing-contrib) 的无缝对接。基于 `Opentracing API` 的插件埋点方案如下图所示：

![image.png](https://cdn.nlark.com/yuque/0/2018/png/230565/1545727742309-7df2a10a-9ca8-49d1-bac1-ce532cbfbfcb.png)

 关于 `SOFATracer` 基于特有 `API` 埋点的实现以及如何实现对接 `OT-api` 埋点，期待大家一起编写，领取方式见文末。

- `SOFATracer` 的数据上报机制

`SOFATracer` 中并没有将不同的 `Reporter` 设计成不同的策略，然后根据不同的策略来实现具体的上报操作，而是使用了一种类似组合的方式，并且在执行具体上报的流程中通过参数来调控是否执行具体的上报。

![image.png](https://cdn.nlark.com/yuque/0/2018/png/230565/1545729496348-ff16a735-a708-463b-9a00-a64b528eb85d.png)

从流程图中可以看到，此过程中涉及到了三个上报点，首先是上报到 `zipkin`，后面是落盘；在日志记录方面，`SOFATracer` 中为不同的组件均提供了独立的日志空间，除此之外，`SOFATracer` 在链路数据采集时提供了两种不同的日志记录模式：摘要日志和统计日志，这对于后续构建一些如故障的快速发现、服务治理等管控端提供了强大的数据支撑。关于数据上报，期待大家一起编写，领取方式见文末。

- `SOFATracer` 的采样机制

对于链路中的数据，并非所有的数据都是值得关注的。一方面是可以节约磁盘空间，另一方面可以将某些无关数据直接过滤掉。基于此，`SOFATracer` 提供了链路数据采样能力。目前我们提供了两种策略，一种是基于固定比率的采样，另一种是基于用户扩展实现的自定义采样；在自定义采样设计中，我们将 `SofaTracerSpan` 实例作为采样计算的条件，用户可以基于此实现丰富的采样规则。关于采样机制，期待大家一起编写，领取方式见文末。

- `SOFATracer` 链路透传机制

关于透传机制，我们不仅需要考虑线程内传递，还需要考虑跨线程以及异步线程场景，对于分布式链路来说，最核心还有如何实现跨进程的数据透传。关于 `SOFATracer` 链路透传 以及 `OpenTracing` 新规范中对线程传递的支持，期待大家一起编写，领取方式见文末。

### 2.2、SOFATracer RoadMap

首先介绍下目前的现状和一些正在做的事情。

![image.png](https://cdn.nlark.com/yuque/0/2018/png/230565/1545730590137-3a4b3219-8d1e-4c2e-be46-a4d090baa693.png)

SOFATracer 版本说明：

- 3.x 版本支持 `webflux` 等，基于分支发布。
- 2.x 版本基于`master` 发布，目前版本是 2.3.0 。

欢迎对相关功能和 `feature` 有兴趣的同学，一起参与开发~

## 3、欢迎加入 <SOFA:TracerLab/>，参与 SOFATracer 源码解析

本文作为《剖析 | `SOFATracer` 组件系列》第一篇，主要还是希望大家对`SOFATracer` 组件有一个认识和了解，之后，我们会逐步详细介绍每部分的代码设计和实现，预计会按照如下的目录进行：

- 分布式链路跟踪组件概述
- `SOFATracer` 数据上报机制和源码分析
- `SOFATracer API `组件埋点机制和源码分析
- `SOFATracer `链路透传原理与 `SLF4J MDC` 的扩展能力分析
- `SOFATracer` 的采样策略和源码分析

如果有同学对以上某个主题特别感兴趣的，可以留言讨论，我们会适当根据大家的反馈调整文章的顺序，谢谢大家关注，关注 SOFATracer，我们会一直与大家一起成长的。

**领取方式：**
直接回复本公众号想认领的文章名称，我们将会主动联系你，确认资质后，即可加入 <SOFA:TracerLab/>，It's your show time！

除了源码解析，也欢迎提交 issue 和 PR：

SOFATracer: <https://github.com/sofastack/sofa-tracer>