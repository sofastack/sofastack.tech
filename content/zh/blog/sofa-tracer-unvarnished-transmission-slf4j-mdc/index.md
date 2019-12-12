---
author: "J. Queue"
date: 2019-02-21T10:20:00.000Z
title:  "蚂蚁金服开源分布式链路跟踪组件 SOFATracer 链路透传原理与SLF4J MDC 的扩展能力剖析"
description: "本文为《剖析 | SOFATracer 框架》第三篇。"
tags: ["SOFATracer","SOFALab","剖析 | SOFATracer 框架"]
categories: "SOFATracer"
aliases: "/posts/2019-02-21-03"
cover: "/cover.jpg"
---

> **SOFA** **S**calable **O**pen **F**inancial **A**rchitecture 是蚂蚁金服自主研发的金融级分布式中间件，包含了构建金融级云原生架构所需的各个组件，是在金融场景里锤炼出来的最佳实践。
>
> SOFATracer 是一个用于分布式系统调用跟踪的组件，通过统一的 TraceId 将调用链路中的各种网络调用情况以日志的方式记录下来，以达到透视化网络调用的目的，这些链路数据可用于故障的快速发现，服务治理等。
>
本文为《剖析 | SOFATracer 框架》第三篇。《剖析 | SOFATracer 框架》系列由 SOFA 团队和源码爱好者们出品，项目代号：SOFA:TracerLab/**，**目前领取已经完成，感谢大家的参与。 
SOFATracer：<https://github.com/sofastack/sofa-tracer>

![SOFATracer-数据上报.jpg](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1550742047257-362367aa-5c4a-45bc-ab40-cd6fdfe74c09.jpeg)

SOFATracer 是一个用于分布式系统调用跟踪的组件，其核心作用就是能够在分布式场景下将请求经过的各个的链路环节的相关数据记录下来，通过这些数据将各个调用链路相关的组件串联起来。

在日常的开发中，我们除了跟踪链路外，可能还会遇到一些场景：

例如在线压测，我们在已有的系统中，模拟一些请求（压测流量）对我们的系统进行压力测试，那么在整个链路中我们是如何让所有的系统都识别出当前的请求是压测流量而不是正式流量的呢？压测流量的标记又是如何在整个链路传递的呢？

又例如我们已经有了链路数据分析能力，能够快速定位到某个请求是在 A 系统里出的问题，那么我们怎么从 A 系统的业务日志里找到当前请求对应的业务日志呢？

带着这些问题，让我们先来看看 SOFATracer 的链路透传以及支持 SLF4J MDC 扩展能力。

## SOFATracer 链路透传原理

SOFATracer 的链路透传具体包括两个点：

- 跨进程的透传，即如何将链路数据从一个进程传递到下游进程中
- 线程中的透传
  - 当前请求跨进程调用结束之后，当前如何恢复 tracer 上下文信息
  - 如何实现跨线程的透传，如在当前线程中起一个异步线程的场景

### 跨进程链路透传原理

跨进程透传就是将上游系统的链路数据透传到下游系统中，以便于提取出全局的链路标记，如 TracerId 、采样标记等，来实现将服务串联起来并且保持传输过程中某些属性的一致性。SOFATracer 基于 Opentracing 规范实现，因此在链路透传部分，也是基于此规范；下面就先从 Opentracing 规范中的透传开始说起。

#### Opentracing 中的定义

在 OT 原文有这么一段描述 [传送门](https://opentracing.io/docs/overview/inject-extract/)

> Programmers adding tracing support across process boundaries must understand the `Tracer.Inject(...)`and `Tracer.Extract(...)` capabilities of [the OpenTracing specification](https://opentracing.io/specification). They are conceptually powerful, allowing the programmer to write *correct_general* cross-process propagation code **without being bound to a particular OpenTracing implementation**; that said, with great power comes great opportunity for confusion.

大概意思就是：如果开发者要给应用添加跨进程的追踪能力, 首先要理解 OpenTracing 规范中的 `Tracer.Inject(...)`和 `Tracer.Extract(…)`的功能。它们在概念抽象上非常强大，而且允许开发者编写正确的、通用的跨进程传输的代码，而不需要绑定到特定的 OpenTracing 实现上去。

总的来说就是 Opentracing 的 `Tracer` 接口定义了跨进程的能力，但是就是没具体实现，不同的基于此规范实现的组件，需要遵循此规范来实现具体的透传逻辑，下面是 `Tracer` 接口定义的用于透传的两个方法：

| 接口                                                         | 描述                                                   |
| :----------------------------------------------------------- | :----------------------------------------------------- |
| void inject(SpanContext spanContext, Formatformat, C carrier); | 把 spanContext 以指定的 format 的格式注入到 carrier 中 |
| SpanContext extract(Format format, C carrier);               | 以指定的 format 的格式从 carrier 中解析出 SpanContext  |

#### 进程透传实现分析

SOFATracer 的 Tracer 的实现类是 SofaTracer， UML 图如下：

![img](https://cdn.nlark.com/yuque/0/2019/jpeg/111154/1547518277497-796df39e-3888-41e1-b5b9-a899c30fdd55.jpeg)

从图中可以看出 SofaTracer 除了有跨进程传输的能力，还扩展了数据上报的能力( Reporter )和采样能力( Sampler )。数据上报能力可以参考《SOFATracer 数据上报机制和源码分析|剖析》这篇文章；采样将在下一篇文章中进行剖析。

跨进程透传的就是 SpanContext 的内容， carrier 为传输的载体， SpanContext 的实现类为 SofaTracerSpanContext， UML 图：

![image.png](https://cdn.nlark.com/yuque/0/2019/png/230565/1548139911703-100f709b-9878-4fab-a0d1-dfc6d486b0d8.png)

#### 跨进程透传处理流程

SOFATracer 中跨进程传输的总体流程如下图所示：

![img](https://cdn.nlark.com/yuque/0/2019/jpeg/111154/1547518277537-0a1c103a-dd02-4313-a9f0-d33724c0519a.jpeg)

透传原理的实质就是：**调用方编码将指定内容传输到被调方， 被调方解码获取内容的过程。**

跨进程透传的方式有很多， 在这里以客户端向服务端发起 HTTP 请求的方式来演示跨进程传输， fork [代码](https://github.com/sofastack/sofa-tracer)， 打开 sample/tracer-sample-with-httpclient 示例工程运行 HttpClientDemoApplication ，打开 logs/tracelog/spring-mvc-stat.log 即可看到链路日志， 运行结果 ：

```json
{"time":"2019-01-07 19:42:50.134","stat.key":{"method":"GET","local.app":"HttpClientDemo","request.url":"http://localhost:8080/httpclient"},"count":1,"total.cost.milliseconds":1563,"success":"true","load.test":"F"}
{"time":"2019-01-07 20:09:46.285","stat.key":{"method":"GET","local.app":"HttpClientDemo","request.url":"http://localhost:8080/httpclient"},"count":1,"total.cost.milliseconds":71,"success":"true","load.test":"F"}
{"time":"2019-01-07 20:14:52.628","stat.key":{"method":"GET","local.app":"HttpClientDemo","request.url":"http://localhost:8080/httpclient"},"count":2,"total.cost.milliseconds":111,"success":"true","load.test":"F"}
```

透传链路如下： 
![img](https://cdn.nlark.com/yuque/0/2019/jpeg/111154/1547518277511-75574ab0-6f9e-4d7e-9bc7-431710822416.jpeg)

##### 1、客户端

首先找到客户端拦截的入口类 com.alipay.sofa.tracer.plugins.httpclient.interceptor.SofaTracerHttpInterceptor & com.alipay.sofa.tracer.plugins.httpclient.interceptor.SofaTracerAsyncHttpInterceptor
以 SofaTracerHttpInterceptor 为例:

```java
// 拦截请求
  public void process(HttpRequest httpRequest, HttpContext httpContext) throws HttpException, IOException {
      //lazy init
      RequestLine requestLine = httpRequest.getRequestLine();
      String methodName = requestLine.getMethod();
      // 生成SpanContext和Span
      SofaTracerSpan httpClientSpan = httpClientTracer.clientSend(methodName);
      // 把 SpanContext inject到Carrier中
      super.appendHttpClientRequestSpanTags(httpRequest, httpClientSpan);
  }
```

生成 Span 的最后一步是 com.alipay.common.tracer.core.SofaTracer.SofaTracerSpanBuilder#start

```java
public Span start() {
      SofaTracerSpanContext sofaTracerSpanContext = null;
      // 判断当前Span是否为链路中的root节点, 如果不是则创建子Span上下文, 否则创建一个RootSpan上下文
      if (this.references != null && this.references.size() > 0) {
          sofaTracerSpanContext = this.createChildContext();
      } else {
          sofaTracerSpanContext = this.createRootSpanContext();
      }
      long begin = this.startTime > 0 ? this.startTime : System.currentTimeMillis();
      // 构建Span
      SofaTracerSpan sofaTracerSpan = new SofaTracerSpan(SofaTracer.this, begin,
                   this.references, this.operationName, sofaTracerSpanContext, this.tags);
      // 采样行为计算
      boolean isSampled = calculateSampler(sofaTracerSpan);
      sofaTracerSpanContext.setSampled(isSampled);
      return sofaTracerSpan;
  }
```

最后就是把 SpanContext 注入到 Carrier 中以 HTTP HEAD 的方式透传到下游。

> 关于数据注入载体和从载体中提取数据可以参考 com.alipay.common.tracer.core.registry.AbstractTextB3Formatter 类的实现。

##### 2、服务端

找到服务端的拦截入口 SpringMvcSofaTracerFilter ，功能很简单：

- 获取上游传来的 SpanContext
- 构建服务端的 Span，在这里和客户端做了同样的判断， 判断当前 Span 是否为 RootSpan，这个操作很重要，如果是 RootSpan 则意味着一条新的链路要被构建；如果不是 RootSpan ，则会将当前服产生的 Span 通过 tracerId 关联到当前链路中来。

### 线程透传原理

在介绍线程透传原理之前先来看个例子；对于 MVC 组件来说，如果我们想使用一个 Span 来记录 mvc 的执行过程。一般我可以把 Span 的开始放在 Filter 中，filterChain.doFilter 方法执行之前产生，然后再 finally 块中来结束这个 Span，大概如下：

```java
 // Span span = null      //  1
try{
  // to create a new span
  span = serverReceive()
  // do something
  filterChain.doFilter(servletRequest, responseWrapper);
  // do something
 }finally{
  // to finish current span
  serverSend();
 }
```

假如现在有个问题是，在 serverReceive 和 serverSend 这段过程中涉及到了其他组件也产生了 Span，比如说发起了一次 httpclient 调用。大概对应的 tracer 如下：

```java
|mvcSpan|
    .
    |httpclientSpan|
          ...
    |httpclientSpan|
  .
|mvcSpan|
```

这是典型的 child_of 关系， httpclientSpan 、 child_of mvcSpan 且都在同一个线程中执行。OK，解法：

- 1、显示的申明一个 Span ，如上面代码段中 1 的位置。这样 Span 的作用域足够大，可以在 finally 中通过显示调用 span#finish 来结束。
- 2、使用 ThreadLocal 机制，在 serverReceive 中将当前 Span 放到 ThreadLocal 中，httpclientSpan 作用时，从 ThreadLocal 中先拿出 mvcSpan，然后作为 httpclientSpan 的父 Span 。此时将 httpclientSpan 塞到 ThreadLocal 中。当 httpclientSpan 结束时，再将 mvcSpan 复原到 ThreadLocal 中。

对于解法1 ，如果想在 httpclientSpan 的处理逻辑中使用 mvcSpan 怎么办呢？通过参数传递？那如果链路很长呢？显然这种方式是不可取的。因此 SOFATracer 在实现上是基于 解法2 的方案来实现的。

综合上面的案例，线程透传可以从以下两个角度来理解：

- 1、当前线程中如果发生了跨进程调用(如 RPC 调用)，那么跨进程调用结束之后如何恢复 Tracer 上下文信息
- 2、当前线程执行过程中，又起了异步线程来执行一些子任务(如任务调度)，如何将当前线程 Tracer 上下文传递到子线程中

下面就针对这两个问题，来分析下 SOFATracer 的线程透传实现。

#### 线程透传实现分析

在 SOFATracer 中定义了一个 SofaTraceContext 接口，允许应用程序访问和操纵当前 Span 的状态，默认实现是 SofaTracerThreadLocalTraceContext； UML 图：

![image.png](https://cdn.nlark.com/yuque/0/2019/png/230565/1548134663408-e56ec764-cac9-44fe-8d89-97a6cd03a034.png)

SofaTracerThreadLocalTraceContext 实际上就是使用了 ThreadLocal 来存储当前线程 Tracer 上下文信息的。下面以 AbstractTracer#serverReceive 代码片段来看下 SOFATracer 中存入 Span 的逻辑：

```java
public SofaTracerSpan serverReceive(SofaTracerSpanContext sofaTracerSpanContext) {
      // 省略 ...
      SofaTraceContext sofaTraceContext = SofaTraceContextHolder.getSofaTraceContext();
      try {
          // ThreadLocal 初始化, 存入当前的Span
          sofaTraceContext.push(sofaTracerSpanServer);
      } catch (Throwable throwable) {
          // 省略 ...
      } finally {
          // 省略 ...
      }
      return sofaTracerSpanServer;
  }
```

- 通过 SofaTraceContextHolder 或到 SofaTraceContext  的实例对象，本质上就是 SofaTracerThreadLocalTraceContext 的单例对象
- 将当前 Span 放入到 SofaTracerThreadLocalTraceContext，也就是存入 ThreadLocal 中

如果在后面的业务处理过程中需要用到此 Span ，那么就可以通过SofaTraceContextHolder.getSofaTraceContext().getCurrentSpan() 这样简单的方式获取到当前 Span 。

那么既然是通过 ThreadLocal 来进行 tracer 上下文的存储，为了保证 ThreadLocal 不被污染，同时防止内存泄漏，需要在当前 Span 结束时清理掉当前 线程上下文 中的数据。下面通过 AbstractTracer#serverSend 代码片段来看下 SOFATracer 中清理线程上下文中透传数据的逻辑：

```java
public void serverSend(String resultCode) {
  try {
    // 或取当前 SofaTraceContext 实例
    SofaTraceContext sofaTraceContext = SofaTraceContextHolder.getSofaTraceContext();
    // 取出 span 信息，这里相当于就是恢复 tracer上下文状态信息
    SofaTracerSpan serverSpan = sofaTraceContext.pop();
    if (serverSpan == null) {
        return;
    }
    //log
    serverSpan.log(LogData.SERVER_SEND_EVENT_VALUE);
    // 结果码
    serverSpan.setTag(CommonSpanTags.RESULT_CODE, resultCode);
    serverSpan.finish();	
    } finally {
      //处理完成要清空 TL
      this.clearTreadLocalContext();
  }
}
```

所以在整个线程处理过程中，SOFATracer 在 tracer 上下文 处理上均是基于 Threadlocal 来完成的。

> PS：SofaTraceContext  中封装了一系列用于操作 threadlocal 的工具方法，上面提到的 getCurrentSpan 和 pop 的区别在于，getCurrentSpan 从 threadlocal 中取出 Span 信息之后不会清理，也就是后面还可以通过getCurrentSpan 拿到当前线程上下文中的 Span 数据，因此在业务处理过程中，如果需要向 Span 中添加一些链路数据，可以通过 getCurrentSpan 方法进行设置。pop 方法与 getCurrentSpan 实际上都是通过 threadlocal#get 来取数据的，当时 pop 取完之后会进行 clear 操作，因此 pop 一般用于在请求结束时使用。 SpringMvcSofaTracerFilter 中在 finally 块中调用了 serverSend ，serverSend 中就是使用的 pop 方法。

#### 跨线程透传

前一小节介绍了 tarcer 上下文 如何实现在线程中透传及恢复，那么对于另外一种场景，即在当前线程处理过程中新起了子线程的情况，父线程如何将当前 tracer 上下文信息传递到子线程中去呢？对于这种情况，SOFATracer 也提供了支持，下面就来看下，SOFATracer 是如何实现跨线程传递的。

跨线程传递相对于跨进行传递来说要简单的多，我们不需要考虑载体、格式化方式等；无论是父线程还是子线程，在存储 tracer 上下文 信息的实现上都是一样的，都是基于 ThreadLocal 来存储。但是为了保证当前 tracer 上下文的状态能够在不同的线程中保持一致，不受干扰，SOFATracer 在将 tracer 上下文传递到子线程中时，可以选择使用的是当前父线程  tracer 上下文 的克隆版本：

```java
public SofaTracerSpanContext cloneInstance() {
  // 重新构建一个 SofaTracerSpanContext 对象实例
  // 这里会以当前父线程中的 tracerId,spanId,parentId以及采样信息 作为构建构建参数
  SofaTracerSpanContext spanContext = new SofaTracerSpanContext(this.traceId, this.spanId,
  this.parentId, this.isSampled);
  // 系统透传数据
  spanContext.addSysBaggage(this.sysBaggage);
  // 业务透传数据
  spanContext.addBizBaggage(this.bizBaggage);
  spanContext.childContextIndex = this.childContextIndex;
  return spanContext;
}
```

这里会根据当前 SofaTracerSpanContext 实例的基本信息，重新 new 一个新的对象出来，是一种深拷贝的方式，实现了不同线程 tracer 上下文处理的隔离。

另外，SOFATracer 还提供了 SofaTracerRunnable&SofaTracerCallable 这两个类 ，封装了底层手动将 Span 复制到被调线程的 ThreadLocal 中去的过程；需要注意的是这个传递的是 Span ，并非是 SpanContext，因此也就没有上面隔离一说，具体使用参考官方文档：[异步线程处理](https://www.sofastack.tech/sofa-tracer/docs/Async)。这里以 SofaTracerRunnable 类来进行具体实现分析，SofaTracerCallable 大家可以自己去研究下。

![image.png](https://cdn.nlark.com/yuque/0/2019/png/230565/1548134524159-659cb2d3-bd01-49c4-8fd3-fc47677d9fe3.png)

> 关于异步线程处理的案例，可以参考 [SOFATracer 的测试用例](https://github.com/sofastack/sofa-tracer/tree/master/tracer-core/src/test/java/com/alipay/common/tracer/core/async) 。

```java
private void initRunnable(Runnable wrappedRunnable, SofaTraceContext traceContext) {
	// 任务 runnable
  this.wrappedRunnable = wrappedRunnable;
  // tracer 上下文，可以由外部指定，如果没有指定则使用 SofaTraceContextHolder 获取
  this.traceContext = traceContext;
  if (!traceContext.isEmpty()) {
    // 将当前上下文中的 span 赋值给子线程
    this.currentSpan = traceContext.getCurrentSpan();
  } else {
    this.currentSpan = null;
  }
}
```

这上面这段代码片段来看，在构建 SofaTracerRunnable 对象实例时，会把当前父线程中的 traceContext 、currentSpan 等传递到子线程中。SofaTracerRunnable#run 方法中，会根据线程 ID 进行判断，如果与父线程的线程ID不等，则会将 currentSpan push 到 traceContext (注：currentSpan 和 traceContext 均是子线程属性)，run 方法则是委托给用户传递进来的 wrappedRunnable 来执行。

#### Opentracing 0.30.x 版本对于线程透传的支持

> 对于在低版本 Opentracing 规范中并没有对线程传递的支持，但是在 0.30.0 版本以后有支持。SOFATracer 目前是基于 Opentracing 0.22.0 版本实现的；但是对于 Opentracing 新 API 中提供的线程透传的特性的理解也会有助于 SOFATracer 在线程透传方面的改进

在之前的文章中对于 Span 的层级关系有过介绍，如果按照时序关系来展示大概如下：

![image.png](https://cdn.nlark.com/yuque/0/2019/png/230565/1548136627435-746b3489-9286-4002-95c0-3614ca16d965.png)

这里以 A、B、D 来看，三个 Span 是逐级嵌套的；如果把这个模型理解成为一个栈的话，那么各个 Span 的产生过程即为入栈的过程，如下：

![image.png](https://cdn.nlark.com/yuque/0/2019/png/230565/1548137154446-c401fa31-05ae-4dda-bf11-f5b716cbc6e9.png)

由于栈的特性是 FILO ，因此当 span C 出栈时就意味着 span C 的生命周期结束了，此时会触发 Span 数据的上报。这里其实也很好的解释了 ChildOf 这种关系的描述：父级 Span 某种程度上取决于子 Span  (子 Span 的结果可能会对父 Span 产生影响) ；父 Span 的生命周期时间是包含了子 Span 生命周期时间的。

在 SOFATracer 0.30.x 版本中提供了对上述思路的封装，用于解决 Span 在线程中传递的问题。两个核心的接口是Scope 和 ScopeManager ，Opentracing 中对这两个接口均提供了默认的实现类：ThreadLocalScope 和 ThreadLocalScopeManager 。

- 使用 ThreadLocal 来存储不同线程的 Scope 对象，在多线程环境下可以通过获取到当前线程的 Scope 来获取当前线程的活动的 Span。
- 管理着当前线程所有曾被激活还未释放的 Span（处于生命周期内的 Span ）

##### ThreadLocalScopeManager & ThreadLocalScope 的设计

ScopeManager 解决的是 Span 在线程中传递的问题。但是 ScopeManager 本身直接操作 Span 又会显得有些不彻底。这个不彻底怎么理解呢？结合 SOFATracer 的实现，我的理解是：

- SOFATracer 中也是使用 ThreadLocal 的机制实现 Span 在线程中传递的。ThreadLocal 中就是 set & get 。Span 之间的父子关系以及当前 ThreadLocal 中应该存哪个 Span 都需要我们自己在代码中来管理。这种方式完全 OK，但是如果对于一个标准/规范来说，如果只是定义一个这样的 ThreadLocal 完全是没有意义的。
- 自己管理 ThreadLocal 中 Span 的关系是一个复杂的过程，尤其是在链路较长的情况下。

基于上述两点，ot-api 没有采用直接在 ScopeManager 中基于 ThreadLocal 使用 set&get span 的操作方案。而是使用了 Scope，对应的实现类是 ThreadLocalScope；那么好处在哪呢？

ThreadLocalScope 的设计使用了栈的思想，这个怎么理解呢？在一个线程中，每一个 Span 的产生到结束，里面在嵌套子 Span 的产生到结束，这种嵌套关系可以很容器联想到栈的概念；参考上图，这个过程很好理解，栈的操作，有进有出，一进一出就是一个 Span 的生命周期。

相比于 SOFATracer 的实现来看，Opentracing 提供的线程透传实现更具有全局性；ThreadLocalScope 为 Span 在线程中传递提供了新的设计思路，但是如果仅基于 Span + ThreadLocal 来实现，是很难的。

## MDC 的扩展能力分析

SLF4J 提供了 MDC（Mapped Diagnostic Contexts）功能，可以支持用户定义和修改日志的输出格式以及内容。SOFATracer 集成了 SLF4J MDC 功能，方便用户在只简单修改日志配置文件的情况下就可以输出当前 Tracer 上下文的 TraceId 和 SpanId。

### SLF4J MDC 机制

MDC ( Mapped Diagnostic Contexts )，这个接口是为了便于我们诊断线上问题而出现的方法工具类。 MDC 的实现也是利用了 ThreadLocal 机制。 在代码中，只需要将指定的值 put 到线程上下文的 Map 中，然后在对应的地方使用 get 方法获取对应的值。

先看一个 logback.xml 的输出模板配置：

```xml
<appender name="console" class="ch.qos.logback.core.ConsoleAppender">
  <encoder charset="UTF-8">
    <pattern>[%d{yyyy-MM-dd HH:mm:ss} %highlight(%-5p) %logger.%M\(%F:%L\)] %X{THREAD_ID} %msg%n</pattern>
  </encoder>
</appender>
```

在日志模板 logback.xml 中，使用 %X{} 来占位，内容替换为对应的 MDC 中 key 的值，在模板解析时会从 MDC 中去取 key 对应的 value 来替换占位符以达到自定义日志格式的效果。

### MDC 在 SOFATracer 中的应用

SOFATracer 对 MDC 的扩展在 com.alipay.common.tracer.extensions.log.MDCSpanExtension，这个类利用了 SpanExtension 的扩展功能来实现。MDC 扩展的代码也比较简单，就是对 MDC 线程上下文值的存储和删除操作，看两段主要的：

```java
  // span 开始时的MDC操作
  public void logStartedSpan(Span currentSpan) {
      if (currentSpan != null) {
          SofaTracerSpan span = (SofaTracerSpan) currentSpan;
          SofaTracerSpanContext sofaTracerSpanContext = span.getSofaTracerSpanContext();
          if (sofaTracerSpanContext != null) {
              // 把当前span的traceId 和 spanId 放到 MDC 中
              MDC.put(MDCKeyConstants.MDC_TRACEID, sofaTracerSpanContext.getTraceId());
              MDC.put(MDCKeyConstants.MDC_SPANID, sofaTracerSpanContext.getSpanId());
  }}}
  // Span结束时的MDC操作
  public void logStoppedSpan(Span currentSpan) {
      // 把当前span的traceId 和 spanId 从 MDC 中移除
      MDC.remove(MDCKeyConstants.MDC_TRACEID);
      MDC.remove(MDCKeyConstants.MDC_SPANID);
      if (currentSpan != null) {
          SofaTracerSpan span = (SofaTracerSpan) currentSpan;
          SofaTracerSpan parentSpan = span.getParentSofaTracerSpan();
          if (parentSpan != null) {
              SofaTracerSpanContext sofaTracerSpanContext = parentSpan.getSofaTracerSpanContext();
              if (sofaTracerSpanContext != null) {
                  // 把父span的traceId 和 spanId 放入 MDC 中
                  MDC.put(MDCKeyConstants.MDC_TRACEID, sofaTracerSpanContext.getTraceId());
                  MDC.put(MDCKeyConstants.MDC_SPANID, sofaTracerSpanContext.getSpanId());
  }}}}
```

然后修改 logback.xml 的格式表达式：

```xml
<appender name="console" class="ch.qos.logback.core.ConsoleAppender">
  <encoder charset="UTF-8">
    <!-- %X{SOFA-TraceId} %X{SOFA-SpanId} 对应的就是tracerId和spanId的占位符-->
    <pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level [%X{SOFA-TraceId},%X{SOFA-SpanId}]  %logger{50} - %msg%n</pattern>
  </encoder>
</appender>
```

## 小结

回头看文章开头的两个问题，基于 SOFATracer 的数据透传和 MDC 扩展能力已经有了解决方案：

在线压测的时候，我们只需要在入口往 SOFATracer 内设置一个压测标识，通过 SOFATracer 的链路数据透传能力，将压测标识透传到整个调用链路，每个调用链路相关的组件识别这个压测标识进行对应的处理即可。

在业务日志中找到请求相关的日志，只需要在业务日志输出的时候，同步输出 SpanId 和  TracerId，就能标记业务日志的位置，再通过和 Tracer 信息的结合，快速定位问题。

本篇主要剖析了 SOFATracer 在数据透传和 Slf4j MDC 扩展功能两个点；在链路数据透传部分，又分别对 跨进程透传、线程透传和 Opentracing 提供的线程透传等分别作了详细的介绍和分析。Slf4j MDC 扩展部分介绍了 MDC 机制以及 MDC 在 SOFATracer 中的应用。通过本篇，希望可以帮助大家更好的理解 SOFATracer 在链路透传方面的基本原理和实现。

**文中涉及到的所有链接：**

- 在 OT 原文描述 传送门 <https://opentracing.io/docs/overview/inject-extract/>
- SOFATracer 源码：<https://github.com/sofastack/sofa-tracer>
- SOFAtrace的异步处理：<https://www.sofastack.tech/sofa-tracer/docs/Async>
- SOFATracer 的测试用例 :<https://github.com/sofastack/sofa-tracer/tree/master/tracer-core/src/test/java/com/alipay/common/tracer/core/async>