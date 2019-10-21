---
title: "【剖析 | SOFARPC 框架】之 SOFARPC 同步异步实现剖析"
author: "SOFARPCLab"
description: "本文为《剖析 | SOFARPC 框架》第四篇。"
categories: "SOFARPC"
aliases: "/posts/__ktnzp9"
tags: ["SOFARPC","剖析 | SOFARPC 框架","SOFALab"]
date: 2018-09-05T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563249691294-5265aab0-50ad-4391-aab6-7f6eede1f179.png"
---

> SOFA
> Scalable Open Financial Architecture
> 是蚂蚁金服自主研发的金融级分布式中间件，包含了构建金融级云原生架构所需的各个组件，是在金融场景里锤炼出来的最佳实践。
> 本文为《剖析 | SOFARPC 框架》第四篇。
> 《剖析 | SOFARPC 框架》系列由 SOFA 团队和源码爱好者们出品。

## 前言

这一篇，我们为大家带来了开发过程中，最常接触到的同步异步调用解析。本文会介绍下同步异步的使用场景，以及 SOFARPC 中的代码实现机制，为了方便大家理解和阅读代码。不会过多的设计代码实现细节，更多的还是希望大家从中有所收获，并能够独立阅读核心代码。

## 原理剖析

SOFARPC 以基于 Netty 实现的网络通信框架 SOFABolt 用作远程通信框架，使用者不用关心如何实现私有协议的细节，直接使用内置 RPC 通信协议，启动客户端与服务端，同时注册用户请求处理器即可完成远程调用：

SOFARPC 服务调用提供同步 Sync、异步 Future、回调 Callback 以及单向 Oneway 四种调用类型。

![来自 SOFABolt 官网](https://cdn.nlark.com/yuque/0/2018/png/156121/1533717366300-9862f989-2b92-423a-b3e2-ba8927066192.png)

这里我们先提供一张整体的图，后面每个方式原理介绍的时候，我会进行更加详细的解释。读者可以重点阅读以下部分的图示，根据阻塞时间的长短，会有不同的标识。

### Sync 同步调用

同步调用是指的客户端发起调用后，当前线程会被阻塞，直到等待服务端返回结果或者出现了超时异常，再进行后续的操作，是绝大多数 RPC 的默认调用方式，无需进行任何设置即可。

这种调用方式，当前线程发起调用后阻塞请求线程,需要在指定的超时时间内等到响应结果才能完成本次调用。如果超时时间内没有得到响应结果，那么抛出超时异常。Sync 同步调用模式最常用，注意要根据对端的处理能力合理设置超时时间。

![Sync 调用](https://cdn.nlark.com/yuque/0/2018/png/156121/1533729372167-a4066fbb-c699-411b-87f0-31aa7bbd54d0.png)

如上图所示，这里主要是描述了客户端的处理逻辑，其中客户端线程和 RPC 内部部分处理并不在一个线程里。所以这里客户端线程包含其中一部分操作，后文的图中也是类似。其中红色的树状框表示客户端的线程阻塞。

可以看到，客户端在代码片段2中，发起 RPC 调用，那么除非本次 RPC 彻底完成，或者 RPC 在指定时间内抛出超时异常，否则红框一直阻塞，代码片段3没有机会执行。

### Future  异步调用

客户端发起调用后不会同步等待服务端的结果，而是获取到 RPC框架给到的一个 Future 对象，调用过程不会阻塞线程，然后继续执行后面的业务逻辑。服务端返回响应结果被 RPC 缓存，当客户端需要响应结果的时候需要主动获取结果，获取结果的过程阻塞线程。

![Future 调用](https://cdn.nlark.com/yuque/0/2018/png/156121/1533729405581-e81af4d6-c046-4cf6-a0db-68a3c04bd2d1.png)

如上图所示，代码片段2发起 RPC 调用后，RPC 框架会立刻返回一个 Future 对象。给到代码片段2，代码片段2可以选择等待结果，或者也可以继续执行代码片段3，等代码片段3执行完成后，再获取 Future 中的值。

### Callback 回调调用

客户端提前设置回调实现类，在发起调用后不会等待结果，但是注意此时是通过上下文或者其他方式向 RPC 框架注册了一个 Callback 对象，结果处理是在新的线程里执行。RPC在获取到服务端的结果后会自动执行该回调实现。

![Callback 调用](https://cdn.nlark.com/yuque/0/2018/png/156121/1533729431591-6b0480ee-d40b-481d-ad7e-486bb840299b.png)

如图所示，客户端代码段2发起 RPC 调用后，并不关心结果，此时也不会有结果。只是将自己的一个 Callback 对象传递给 RPC 框架，RPC 框架发起调用后，立即返回。之后自己等待调用结果，在有了调用结果，或者超过业务配置的超时时间后，将响应结果或者超时的异常，进行 callback 的回调。一般的，一个 callback 的结果需要包含两个部分

```java
public interface InvokeCallback {

    /**
     * Response received.
     * 
     * @param result
     */
    public void onResponse(final Object result);

    /**
     * Exception caught.
     * 
     * @param e
     */
    public void onException(final Throwable e);
}
```

如果是正常返回，则 RPC 框架回调用户传入 callback 对象的 onResponse 方法，如果是框架层的异常，比如超时，那么会调用 onException 方法。

### Oneway 单向调用

客户端发送请求后不会等待服务端返回的结果，并且会忽略服务端的处理结果，

![Oneway 调用](https://cdn.nlark.com/yuque/0/2018/png/156121/1533729462571-296218b5-5a6d-41b6-bfb3-ead069fed12c.png)

当前线程发起调用后，用户并不关心调用结果，只要请求已经发出就完成本次调用。单向调用不关心响应结果，请求线程不会被阻塞，使用 Oneway 调用需要注意控制调用节奏防止压垮接收方。注意 Oneway 调用不保证成功，而且发起方无法知道调用结果。因此通常用于可以重试，或者定时通知类的场景，调用过程是有可能因为网络问题、机器故障等原因导致请求失败，业务场景需要能接受这样的异常场景才能够使用。

### 调用方式比较

| 调用方式 | 优点 | 不足 | 使用场景 |
| --- | --- | --- | --- |
| Sync | 简单 | 同步阻塞 | 大部分场景 |
| Oneway | 简单，不阻塞 | 无结果 | 不需要结果，业务不需要保证调用成功的场景 |
| Future | 异步，可获取结果 | 需要再次调用 get 方法获取结果 | 同线程内多次 RPC 调用。且没有先后关系 |
| Callback | 异步，不需要手动获取结果 | 使用稍微复杂。且不能在当前代码段直接操作结果 | 当前不关心结果。但是最终依赖结果做一些其他事情的场景 |

## 源码剖析

下面我们以 SOFARPC 中的 BOLT 协议为基础，介绍一些 RPC 框架下面的代码层面的设计。主要介绍代码结构和相互的调用关系。

对 BOLT 的包装主要在

```java
com.alipay.sofa.rpc.transport.bolt.BoltClientTransport
```

业务方并不直接使用 BOLT 定义的一些类型，而是使用 RPC 定义的一些类型。这些类型被适配到 BOLT 的类型上，使得 RPC 框架对用户提供了统一的 API，和底层是否采用 BOLT 不强相关。

### Sync 同步调用

SOFARPC 中的的同步调用是由 Bolt 通信框架来实现的。核心代码实现在

```java
com.alipay.remoting.BaseRemoting#invokeSync
com.alipay.remoting.rpc.protocol.RpcResponseProcessor#doProcess
```

使用时无需特殊配置。

![Sync 同步调用](https://cdn.nlark.com/yuque/0/2018/png/156121/1533737037981-a4a24a1c-2447-4ea7-8cb4-86a4e6c4edef.png)

### Future  异步调用

使用 Future 异步调用 SOFABoot 配置服务引用需要设置

```xml
<sofa:global-attrs type="future"/>
```

元素的 type 属性声明调用方式为 future：

![Future 异步调用](https://cdn.nlark.com/yuque/0/2018/png/156121/1533737068992-9e9cf303-e162-4429-bf59-f6006acaf69b.png)

如上设置为 Future 调用的方式。客户端获取响应结果有两种方式：

1.通过 SofaResponseFuture 直接获取结果。第一个参数是获取结果的超时时间，第二个参数表示是否清除线程上下文中的结果。

```java
String result =(String)SofaResponseFuture.getResponse(timeout,true);
```
2.获取原生 Futrue，该种方式获取JDK原生的 Future，参数表示是否清除线程上下文中的结果。因为响应结果放在JDK原生的 Future，需要通过JDK Future的get()方法获取响应结果。
```java
Future future = SofaResponseFuture.getFuture(true);
```
当前线程发起调用得到 RpcResponseFuture 对象，当前线程继续执行下一次调用。在任意时刻使用RpcResponseFuture 对象的 get() 方法来获取结果，如果响应已经回来此时就马上得到结果；如果响应没有回来则阻塞住当前线程直到响应回来或者超时时间到。

### Callback 回调调用

目前支持 bolt 协议。客户端回调类需要实现如下接口：

```java
com.alipay.sofa.rpc.core.invoke.SofaResponseCallback
```
使用 SOFABoot 的话配置

```xml
<sofa:global-attrs type="callback" callback-ref="callback"/>
```

![Callback 回调调用](https://cdn.nlark.com/yuque/0/2018/png/156121/1533737126698-a3e6d198-1f22-458d-af36-dd61a225af94.png)

如上设置是服务级别的设置，也可以进行调用级别的设置：

```java
RpcInvokeContext.getContext().setResponseCallback(sofaResponseCallbackImpl);
```

当前线程发起调用则本次调用马上结束执行下一次调用。发起调用时需要注册回调，该回调需要分配异步线程池以待响应回来后在回调的异步线程池来执行回调逻辑。

### Oneway 单向调用

使用 Oneway 单向调用 SOFABoot 配置服务引用需要设置

```xml
<sofa:global-attrs type="oneway"/>
```

元素的type属性声明调用方式 oneway

![Oneway 单向调用](https://cdn.nlark.com/yuque/0/2018/png/156121/1533737145316-35f516ae-45cc-4ad8-b54b-4b16b7750aa0.png)

## 技术实现

### 超时计算

在同步中，有个很重要的事情就是超时计算。同步 Sync /异步 Future /回调 Callback 三种通信模型，通过采用 HashedWheelTimer 进行超时控制，对这部分感兴趣的，可以参考[蚂蚁通信框架实践](https://mp.weixin.qq.com/s/JRsbK1Un2av9GKmJ8DK7IQ)，这里不再重复说明。

这里画出一张超时的时间图，对 SOFARPC 中 Tracer 中的超时中涉及到的时间点做一个介绍。

![超时时间图](https://cdn.nlark.com/yuque/0/2018/png/156121/1533731255015-090e2c9e-cd8c-4478-b58c-848cf21bf831.png)

通过这张图中的介绍，加上 SOFATracer 的日志打印，我们可以在实际的线上环境中，判断出来，哪一部分耗时比较严重，来定位一些超时的问题。

对于 SOFARPC 框架的使用方来说，很多时候是非常关心超时时间的，因为超时时间如果设置时间过长，会阻塞业务线程，极端场景下，可能会拖垮整个系统。RPC 框架允许用户设置不同级别的超时时间来控制。

```java
/**
 * 决定超时时间
 *
 * @param request        请求
 * @param consumerConfig 客户端配置
 * @param providerInfo   服务提供者信息
 * @return 调用超时
 */
private int resolveTimeout(SofaRequest request, ConsumerConfig consumerConfig, ProviderInfo providerInfo) {
    // 先去调用级别配置
    Integer timeout = request.getTimeout();
    if (timeout == null) {
        // 取客户端配置（先方法级别再接口级别）
        timeout = consumerConfig.getMethodTimeout(request.getMethodName());
        if (timeout == null || timeout < 0) {
            // 再取服务端配置
            timeout = (Integer) providerInfo.getDynamicAttr(ATTR_TIMEOUT);
            if (timeout == null) {
                // 取框架默认值
                timeout = getIntValue(CONSUMER_INVOKE_TIMEOUT);
            }
        }
    }
    return timeout;
}
```

目前，我们

1.先取调用级别，这个是通过调用线程上下文可以设置的。

2.然后取客户端配置的消费者超时时间，先取方法级别配置，如果没有，取接口级别。

3.如果还是没有取到，这时候，我们取服务提供方的超时时间，这个会通过注册中心传递下来。

4.最终，我们取默认的超时时间，目前这个超时时间是3s。

注意，在真实的场景下，超时控制实际上是一个比较有挑战的事情，一旦出现 JVM层面的 STW，时间控制就会变得不够准确。因此，如果系统层面存在某些性能问题，也会影响超时的计算，这时候，会看到，已经超过了超时时间，但是客户端并没有及时终止。

### 线程模型

在上面介绍同步异步等多种调用方式中，最重要的需要理解同步/异步、阻塞/非阻塞的几种组合情况，并且能知道什么事情在什么线程里操作，这会涉及到具体的线程模型，由于篇幅原因，本文不做介绍，我们会在下一篇中带来 SOFARPC 的线程模型剖析文章。

## 总结

SOFARPC 同步/异步/回调/单向调用通过引用调用类型(默认为同步调用)四种调用方式。

在 Sync 上，支持方法级别，接口级别，方法级别的超时设置。调用会阻塞请求线程，待响应返回后才能进行下一个请求。这是最常用的一种通信模型。

在 Callback 上，支持方法级别，接口级别，线程级别的回调设置。是真正的异步调用，永远不会阻塞线程，结果处理是在异步线程里执行。

在  Future 上，对用户提供了统一的 API 操作。支持原生 Future 和自定义 Future。用户 可以直接在当前线程上下文获取。在调用过程不会阻塞线程，但获取结果的过程会阻塞线程。

在 Oneway 上，设置简单。直接支持。为了防止应用出现类型转换异常，根据返回值设置不同的默认值。不关心响应，请求线程不会被阻塞，但使用时需要注意控制调用节奏，防止压垮接收方。

在超时控制上，结合 BOLT 和 Tracer，将一些关键的时间节点进行了整理。使得排查和判断超时问题更加方便。到这里，我们就对 RPC 框架中的同步异步实现进行了一些详细的分析，并深入介绍了 SOFARPC 中的实现细节，感谢大家。