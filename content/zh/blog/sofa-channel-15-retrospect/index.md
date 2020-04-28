---
title: "分布式链路组件 SOFATracer 埋点机制解析 | SOFAChannel#15 直播整理"
author: "卫恒"
authorlink: "https://github.com/glmapper"
description: "SOFATracer 埋点机制解析直播文字回顾。"
categories: "SOFATracer"
tags: ["SOFATracer","SOFAChannel"]
date: 2020-04-28T18:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1587624983028-cf812798-a686-4ea4-87c3-00810d69aa94.jpeg"
---

> <SOFA:Channel/>，有趣实用的分布式架构频道。
> 回顾视频以及 PPT 查看地址见文末。欢迎加入直播互动钉钉群 : 21992058，不错过每场直播。

![SOFAChannel#15](https://cdn.nlark.com/yuque/0/2020/png/226702/1588040493255-bb751480-3b56-43e9-80fb-1e55716b9c57.png)

本文根据 SOFAChannel#15 直播分享整理，主题：分布式链路组件 SOFATracer 埋点机制解析。

大家好，我是宋国磊，花名卫恒，是 SOFATracer 的开源负责人。今天要和大家分享的是分布式链路组件 SOFATracer 埋点机制解析，将通过具体 Demo 演示快速上手 SOFATracer，同时介绍 SOFATracer 功能点，并详细介绍其核心关键「埋点机制」的原理。

SOFATracer 是蚂蚁金服开源的基于 [OpenTracing 规范](http://opentracing.io/documentation/pages/spec.html) 的分布式链路跟踪系统，其核心理念就是通过一个全局的 TraceId 将分布在各个服务节点上的同一次请求串联起来。通过统一的 TraceId 将调用链路中的各种网络调用情况以日志的方式记录下来同时也提供远程汇报到 [Zipkin](https://zipkin.io/) 进行展示的能力，以此达到透视化网络调用的目的。

SOFATracer：[https://github.com/sofastack/sofa-tracer](https://github.com/sofastack/sofa-tracer)

SOFATracer 作为 SOFAStack 中的分布式链路组件，也伴随着 SOFAStack 走过了两年的时间，在此首先对两年来对 SOFATracer 保持关注并且参与社区建设的同学表示感谢，也希望大家能够继续关注 SOFAStack 的发展，也欢迎更多的同学加入到 SOFAStack 的社区参与中来。

今天的分享内容主要将会围绕以下三个部分展开：

- SOFATracer 功能点详细介绍；
- SOFATracer 埋点机制原理详解；
- 快速上手 SOFATracer 演示；

关于 SOFATracer 更多的问题也欢迎在 Github 上跟我们交流。

## SOFATracer 简介

![SOFATracer 基本能力](https://cdn.nlark.com/yuque/0/2020/png/226702/1588040493284-cf12936c-46b8-456c-a8fb-79df54dfade4.png)

首先简单介绍一下 SOFATracer。上图展示的是 SOFATracer 目前所包括的基本能力和所支持的插件。下面虚线框中绿色背景部分，是 SOFATracer 提供的基本功能，具体可以参考[官方文档](https://www.sofastack.tech/projects/sofa-tracer/overview/)描述。上面虚线框中是 SOFATracer 目前所支持的组件，大概分了以下几种类型：客户端、Web、数据存储、消息、RPC、Spring Cloud。

之前社区也发起过 [剖析 | SOFATracer 框架](https://www.sofastack.tech/tags/%E5%89%96%E6%9E%90-sofatracer-%E6%A1%86%E6%9E%B6/) 的源码解析系列文章，在此系列中对 SOFATracer 所提供的能力及实现原理都做了比较全面的分析，有兴趣的同学可以看下。

今天主要聊一下埋点机制。不同组件的埋点机制也是有很大的差异，SOFATracer 是如何实现对上述组件进行埋点的，下面就详细分析下不同组件的埋点机制。

## 埋点机制

目前 SOFATracer 已经支持了对以下开源组件的埋点支持：Spring MVC、RestTemplate、HttpClient、OkHttp3、JDBC、Dubbo(2.6/2.7)、SOFARPC、Redis、MongoDB、Spring Message、Spring Cloud Stream (基于 Spring Message 的埋点)、RocketMQ、Spring Cloud FeignClient、Hystrix。

> 大多数能力提供在 3.x 版本，2.x 版本从官方 issue 中可以看到后续将不再继续提供新的功能更新；这也是和 SpringBoot 宣布不再继续维护 1.x 版本有关系。

## 标准 Servlet 规范埋点原理

SOFATracer 支持对标准 Servlet 规范的 Web MVC 埋点，包括普通的 Servlet 和 Spring MVC 等，基本原理就是基于 Servelt 规范所提供的 javax.servlet.Filter 过滤器接口扩展实现。

> 过滤器位于 Client 和 Web 应用程序之间，用于检查和修改两者之间流过的请求和响应信息。在请求到达 Servlet 之前，过滤器截获请求。在响应送给客户端之前，过滤器截获响应。多个过滤器形成一个 FilterChain，FilterChain 中不同过滤器的先后顺序由部署文件 web.xml 中过滤器映射的顺序决定。最先截获客户端请求的过滤器将最后截获 Servlet 的响应信息。

Web 应用程序一般作为请求的接收方，在 SOFATracer 中应用是作为 Server 存在的，其在解析 SpanContext 时所对应的事件为 sr (server receive)。

SOFATracer 在 sofa-tracer-springmvc-plugin 插件中解析及产生 Span 的过程大致如下：

- Servlet Filter 拦截到 request 请求；
- 从请求中解析 SpanContext；
- 通过 SpanContext 构建当前 MVC 的 Span；
- 给当前 Span 设置 tag、log；
- 在 Filter 处理的最后，结束 Span；

当然这里面还会设计到其他很多细节，比如给 Span 设置哪些 tag 属性、如果处理异步线程透传等等。本次分享就不展开细节探讨，有兴趣的同学可以自行阅读代码或者和我们交流。

## Dubbo 埋点原理

Dubbo 埋点在 SOFATracer 中实际上提供了两个插件，分别用于支持 Dubbo 2.6.x 和 Dubbo 2.7.x；Dubbo 埋点也是基于 Filter ，此 Filter 是 Dubbo 提供的 SPI 扩展-[调用拦截扩展](http://dubbo.apache.org/zh-cn/docs/dev/impls/filter.html) 机制实现。

像 Dubbo 或者 SOFARPC 等 RPC 框架的埋点，通常需要考虑的点比较多。首先， RPC 框架分客户端和服务端，所以在埋点时 RPC 的客户端和服务端必须要有所区分；再者就是 RPC 的调用方式包括很多种，如常见的同步调用、异步调用、oneway 等等，调用方式不同，所对应的 Span 的结束时机也不同，重要的是基本所有的 RPC 框架都会使用线程池用来发起和处理请求，那么如何保证 SOFATracer 在多线程环境下不串也很重要。

另外 Dubbo 2.6.x 和 Dubbo 2.7.x 在异步回调处理上差异比较大，Dubbo 2.7.x 中提供了 onResponse 方法（后面又升级为 Listener，包括 onResponse 和 onError 两个方法）；而 Dubbo 2.6.x 中则并未提供相应的机制，只能通过对 Future 的硬编码处理来完成埋点和上报。

> 这个问题 Zipkin Brave 对 Dubbo 2.6.x 的埋点时其实也没有考虑到，在做 SOFATracer 支持 Dubbo 2.6.x 时发现了这个 bug，并做了修复。

SOFATracer 中提供的 DubboSofaTracerFilter 类：

```java
@Activate(group = { CommonConstants.PROVIDER, CommonConstants.CONSUMER }, value = "dubboSofaTracerFilter", order = 1)
public class DubboSofaTracerFilter implements Filter {
    // todo trace
}
```

SOFATracer 中用于处理 Dubbo 2.6.x 版本中异步回调处理的核心代码：

> Dubbo 异步处理依赖 ResponseFuture 接口，但是 ResponseFuture 在核心链路上并非是以数据或者 list 的形式存在，所以在链路上只会存在一个 ResponseFuture，因此如果我自定义一个类来实现 ResponseFuture 接口是没法达到预期目的的，因为运行期会存在覆盖 ResponseFuture 的问题。所以在设计上，SOFATracer 会通过 ResponseFuture 构建一个新的 FutureAdapter出来用于传递。

```java
boolean ensureSpanFinishes(Future<Object> future, Invocation invocation, Invoker<?> invoker) {
    boolean deferFinish = false;
    if (future instanceof FutureAdapter) {
        deferFinish = true;
        ResponseFuture original = ((FutureAdapter<Object>) future).getFuture();
        ResponseFuture wrapped = new AsyncResponseFutureDelegate(invocation, invoker, original);
        // Ensures even if no callback added later, for example when a consumer, we finish the span
        wrapped.setCallback(null);
        RpcContext.getContext().setFuture(new FutureAdapter<>(wrapped));
    }
    return deferFinish;
}
```

## HTTP 客户端埋点原理

HTTP 客户端埋点包括 HttpClient、OkHttp、RestTemplate 等，此类埋点一般都是基于拦截器机制来实现的，如 HttpClient 使用的 HttpRequestInterceptor、HttpResponseInterceptor；OkHttp 使用的 okhttp3.Interceptor；RestTemplate 使用的 ClientHttpRequestInterceptor。

以 OkHttp 为例，简单分析下 HTTP 客户端埋点的实现原理：

```java
@Override
public Response intercept(Chain chain) throws IOException {
    // 获取请求
    Request request = chain.request();
    // 解析出 SpanContext ，然后构建 Span
    SofaTracerSpan sofaTracerSpan = okHttpTracer.clientSend(request.method());
    // 发起具体的调用
    Response response = chain.proceed(appendOkHttpRequestSpanTags(request, sofaTracerSpan));
    // 结束 span
    okHttpTracer.clientReceive(String.valueOf(response.code()));
    return response;
}
```

## DataSource 埋点原理

和标准 Servlet 规范实现一样，所有基于 javax.sql.DataSource 实现的 DataSource 均可以使用 SOFATracer 进行埋点。因为 DataSource 并没有提供像 Servlet 那样的过滤器或者拦截器，所以 SOFATracer 中没法直接通过常规的方式（Filter/SPI 扩展拦截/拦截器等）进行埋点，而是使用了代理模式的方式来实现的。

![](https://cdn.nlark.com/yuque/0/2020/png/226702/1588043471119-3e21d000-226c-4bc0-a553-83ef0b3b4e85.png)

上图为 SOFATracer 中 DataSource 代理类实现的类继承结构体系；可以看出，SOFATracer 中自定义了一个 BaseDataSource 抽象类，该抽象类继承 javax.sql.DataSource 接口，SmartDataSource 作为 BaseDataSource 的唯一子类，也就是 SOFATracer 中所使用的代理类。所以如果你使用了 sofa-tracer-datasource-plugin 插件的话，可以看到最终运行时的 Datasource 类型是 com.alipay.sofa.tracer.plugins.datasource.SmartDataSource。

```java
public abstract class BaseDataSource implements DataSource {
    // 实际被代理的 datasource
    protected DataSource        delegate;
    //  sofatracer 中自定义的拦截器，用于对连接操作、db操作等进行拦截埋点
    protected List<Interceptor> interceptors;
    protected List<Interceptor> dataSourceInterceptors;
}
```

Interceptor 主要包括以下三种类型：

![Interceptor 三种类型](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1588043502130-e887db71-a0d8-425e-a2fe-d816b74ef83e.jpeg)

以 StatementTracerInterceptor 为例 StatementTracerInterceptor 将将会拦截到所有 PreparedStatement 接口的方法，代码如下：

```java
public class StatementTracerInterceptor implements Interceptor {
    // tracer 类型为 client 
    private DataSourceClientTracer clientTracer;
    public void setClientTracer(DataSourceClientTracer clientTracer) {
        // tracer 对象实例
        this.clientTracer = clientTracer;
    }

    @Override
    public Object intercept(Chain chain) throws Exception {
        // 记录当前系统时间
        long start = System.currentTimeMillis();
        String resultCode = SofaTracerConstant.RESULT_SUCCESS;
        try {
            // 开始一个 span
            clientTracer.startTrace(chain.getOriginalSql());
            // 执行
            return chain.proceed();
        } catch (Exception e) {
            resultCode = SofaTracerConstant.RESULT_FAILED;
            throw e;
        } finally {
            // 这里计算执行时间 System.currentTimeMillis() - start
            // 结束一个 span
            clientTracer.endTrace(System.currentTimeMillis() - start, resultCode);
        }
    }
}
```

总体思路是，DataSource 通过组合的方式自定义一个代理类（实际上也可以理解为适配器模式中的对象适配模型方式），对所有目标对象的方式进行代理拦截，在执行具体的 SQL 或者连接操作之前创建 DataSource 的 Span，在操作结束之后结束 Span，并进行上报。

## 消息埋点

消息框架组件包括很多，像常见的 RocketMQ、Kafka 等；除了各个组件自己提供的客户端之外，像 Spring 就提供了很多消息组件的封装，包括 Spring Cloud Stream、Spring Integration、Spring Message 等等。SOFATracer 基于 Spring Message 标准实现了对常见消息组件和 Spring Cloud Stream 的埋点支持，同时也提供了基于 RocketMQ 客户端模式的埋点实现。

### Spring Messaging 埋点实现原理

spring-messaging 模块为集成 Messaging API 和消息协议提供支持。这里我们先看一个 pipes-and-filters 架构模型：

![pipes-and-filters 架构模型](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1588043513680-577ab2ad-db81-4327-b3a8-5d74acc6457d.jpeg)

spring-messaging 的 support 模块中提供了各种不同的 Message Channel 实现和 Channel Interceptor 支持，因此在对 spring-messaging 进行埋点时我们自然就会想到去使用 Channel Interceptor。

```java
// SOFATracer 实现的基于 spring-messaging 消息拦截器
public class SofaTracerChannelInterceptor implements ChannelInterceptor, ExecutorChannelInterceptor {
    // todo trace
}

// THIS IS ChannelInterceptor
public interface ChannelInterceptor {
    // 发送之前
    @Nullable
    default Message<?> preSend(Message<?> message, MessageChannel channel) {
        return message;
    }
    // 发送后
    default void postSend(Message<?> message, MessageChannel channel, boolean sent) {
    }
    // 完成发送之后
    default void afterSendCompletion(Message<?> message, MessageChannel channel, boolean sent, @Nullable Exception ex) {
    }
    // 接收消息之前
    default boolean preReceive(MessageChannel channel) {
        return true;
    }
    // 接收后
    @Nullable
    default Message<?> postReceive(Message<?> message, MessageChannel channel) {
        return message;
    }
    // 完成接收消息之后
    default void afterReceiveCompletion(@Nullable Message<?> message, MessageChannel channel, @Nullable Exception ex) {
    }
}
```

可以看到 ChannelInterceptor 实现了消息传递全生命周期的管控，通过暴露出来的方法，可以轻松的实现各个阶段的扩展埋点。

### RocketMQ 埋点实现原理

RocketMQ 本身是提供了对 Opentracing 规范支持的，由于其支持的版本较高，与 SOFATracer 所实现的 Opentracing 版本不一致，所以在一定程度上不兼容；因此 SOFATracer（opentracing 0.22.0 版本）自身又单独提供了 RocketMQ  的插件。

RocketMQ 埋点其实是通过两个 hook 接口来完成，实际上在 RocketMQ 的官方文档中貌似并没有提到这两个点。

```java
// RocketMQ 消息消费端 hook 接口埋点实现类
public class SofaTracerConsumeMessageHook implements ConsumeMessageHook {
}
// RocketMQ 消息发送端 hook 接口埋点实现类
public class SofaTracerSendMessageHook implements SendMessageHook {}
```

首先是 SendMessageHook 接口，SendMessageHook 接口提供了两个方法，sendMessageBefore 和 sendMessageAfter，SOFATracer 在实现埋点时，sendMessageBefore 中用来解析和构建 Span，sendMessageAfter 中用于拿到结果然后结束 Span。

同样的，ConsumeMessageHook 中也提供了两个方法（consumeMessageBefore 和 consumeMessageAfter），可以提供给 SOFATracer 来从消息中解析出透传的 SOFATracer 信息然后再将 SOFATracer 信息透传到下游链路中去。

## Redis 埋点原理

SOFATracer 中的 Redis 埋点是基于 spring-data-redis 实现的，没有针对具体的 Redis 客户端来埋点。另外  Redis 埋点部分参考的是开源社区 [opentracing-spring-cloud-redis-starter](https://github.com/opentracing-contrib/java-spring-cloud/tree/master/instrument-starters/opentracing-spring-cloud-redis-starter) 中的实现逻辑。

Redis 的埋点实现与 DataSource 的埋点实现基本思路是一致的，都是通过一层代理来是实现的拦截。sofa-tracer-redis-plugin 中对所有的 Redis 操作都通过 RedisActionWrapperHelper 进行了一层包装，在执行具体的命令前后通过 SOFATracer 自己提供的 API 进行埋点操作。代码如下：

```java
public <T> T doInScope(String command, Supplier<T> supplier) {
    // 构建 span
    Span span = buildSpan(command);
    return activateAndCloseSpan(span, supplier);
}

// 在 span 的生命周期内执行具体命令
private <T> T activateAndCloseSpan(Span span, Supplier<T> supplier) {
    Throwable candidateThrowable = null;
    try {
        // 执行命令
        return supplier.get();
    } catch (Throwable t) {
        candidateThrowable = t;
        throw t;
    } finally {
        if (candidateThrowable != null) {
            // ...
        } else {
            // ...
        }
        // 通过 tracer api 结束一个span
        redisSofaTracer.clientReceiveTagFinish((SofaTracerSpan) span, "00");
    }
}
```

除此之外 MongoDB 的埋点也是基于 Spring Data 实现，埋点的实现思路和 Redis 基本相同，这里就不在单独分析。

## 总结

本次分享主要对蚂蚁金服分布式链路组件 SOFATracer 以及其埋点机制做了简要的介绍；从各个组件的埋点机制来看，整体思路就是对组件操作进行包装，在请求或者命令执行的前后进行 Span 构建和上报。目前一些主流的链路跟踪组件像 Brave 也是基于此思路，区别在于 Brave 并非是直接基于 OpenTracing 规范进行编码，而是其自己封装了一整套 API ，然后通过面向 OpenTracing API 进行一层适配；另外一个非常流行的 SkyWalking 则是基于 Java agent 实现，埋点实现的机制上与 SOFATracer 和 Brave 不同。

以上就是本期分享的全部内容，如果大家对 SOFATracer 感兴趣，也可以在群内或者 Github 上与我们交流。

SOFATracer：[https://github.com/sofastack/sofa-tracer](https://github.com/sofastack/sofa-tracer)

本期 Demo 工程地址：[https://github.com/glmapper/tracers-guides](https://github.com/glmapper/tracers-guides)

### 本期视频回顾以及 PPT 查看地址

[https://tech.antfin.com/community/live/1167/data/986](https://tech.antfin.com/community/live/1167/data/986)
