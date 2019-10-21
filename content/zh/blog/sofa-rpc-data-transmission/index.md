---
title: "【剖析 | SOFARPC 框架】之 SOFARPC 数据透传剖析"
author: "水寒"
description: "本文为《剖析 | SOFARPC 框架》第八篇，作者水寒，目前就职于网易。"
categories: "SOFARPC"
aliases: "/posts/__dr07w9"
tags: ["SOFARPC","剖析 | SOFARPC 框架","SOFALab"]
date: 2018-10-03T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563274331359-e7803f14-caec-4d52-ac68-95deadf3f8ab.png"
---

> SOFA
> Scalable Open Financial Architecture
> 是蚂蚁金服自主研发的金融级分布式中间件，包含了构建金融级云原生架构所需的各个组件，是在金融场景里锤炼出来的最佳实践。
> 本文为《剖析 | SOFARPC 框架》第八篇，作者水寒，目前就职于网易。
> 《剖析 | SOFARPC 框架》系列由 SOFA 团队和源码爱好者们出品，
> 项目代号：<SOFA:RPCLab/>，官方目录目前已经全部认领完毕，文末提供了已完成的文章目录。

## 前言

在本系列之前的文章中，我们已经介绍了同步，异步，泛化调用等，也介绍了链路追踪的能力，本篇，我们将介绍一下 SOFARPC 中另一种内置的数据透传的能力。会依次介绍，数据透传的概念， SOFARPC 的设计原理，以及各种不同调用方式下的透传使用和详细说明，最后， 还会比较一下和 SOFATracer 的区别。欢迎大家与我们讨论交流。

## 数据透传介绍

首先，我们介绍一下数据透传的概念，我们知道，在 RPC调用中，数据的传递，是通过接口方法参数来传递的，需要接口方定义好一些参数允许传递才可以，在一些场景下，我们希望，能够更通用的传递一些参数，比如一些标识性的信息。业务方可能希望，在每一次调用请求中都能够传递一些自定义的信息到下游。甚至也希望下游能够将一些数据传递回来。

而数据透传功能，就是指数据不需要以作为方法参数的形式在调用链路中进行传递，而是直接存储到调用上下文中，之后通过 RPC 的内置对象，进行传递，调用双端可从上下文中获取数据而不需要去关注数据的传输过程。

SOFARPC 提供的数据透传支持请求数据透传（客户端向服务端）和响应数据透传（服务端向客户端）。

## SOFARPC 设计原理

这里主要是介绍一下，实现的核心原理，更加具体的每种调用方式的透传，在后文中都会详细介绍。

![SOFARPC 核心原理](https://cdn.nlark.com/yuque/0/2018/png/156121/1538258797228-473b83f6-dc88-4a9c-816f-baf6fa20df7d.png)

1. 用户通过 SOFARPC 提供的 API 进行数据传递设置

2. SOFARPC 在调用传输前，将透传的数据进行打包获取

3. 进行正常的序列化和反序列化

4. SOFARPC 在反序列化时将用户设置的透传数据写回 Context

5. 服务端用户即可进行获取使用

## 不同调用方式的透传

我们知道，SOFARPC 目前支持四种调用模式，如果没有阅读过之前文章的同学，可以阅读一下 [SOFARPC 同步异步实现剖析](https://www.sofastack.tech/blog/sofa-rpc-synchronous-asynchronous-implementation)，请求透传数据的原理都是一样的，服务端设置响应透传数据的原理也是一样的，只是客户端获取响应透传数据的方式有所不同（后三种模式只介绍客户端获取响应透传数据的原理）。因此我们会介绍下不同调用方式的透传细节，并介绍其使用方式，方便大家理解。以下为了方便说明，我们会使用如下的接口示例：

#### 接口服务

```
public interface HelloService {
    String sayHello(String string);
}
```

#### 服务实现

```
public class HelloServiceImpl implements HelloService {
    @Override
    public String sayHello(String string) {
        // 获取请求透传数据并打印
        System.out.println("service receive reqBag -> " + RpcInvokeContext.getContext().getRequestBaggage("req_bag"));
        // 设置响应透传数据到当前线程的上下文中
        RpcInvokeContext.getContext().putResponseBaggage("resp_bag", "s2c");
        return "hello " + string + " ！";
    }
}
```
后续的所有调用模式都使用`HelloServiceImpl`这个服务实现。(示例代码在 SOFARPC 的 测试 case 中都要对应的示例，大家可以对应阅读。)

对用户可见的操作 API 只有一个就是 `RpcInvokeContext`，在 SOFABoot 和 SOFARPC 下都适用，当然如果你了解 SOFARPC 的 Filter 机制，也可以通过扩展这个来实现。

## sync 调用下的透传

### 使用示例

![sync 使用示例](https://cdn.nlark.com/yuque/0/2018/png/156121/1538259838031-da3d272d-0c7b-4394-bd9e-5bb83a645e4a.png)

### 原理剖析

![sync 原理剖析](https://cdn.nlark.com/yuque/0/2018/png/162694/1536978343414-56d5f4e4-ab65-450f-a084-22f4a23924d3.png)

#### 请求透传数据

1. 客户端首先在 main 线程（图中的user thread）中设置请求透传数据到其调用上下文`RpcInvokeContext.requestBaggage`属性中，之后在调用过程中从`requestBaggage`中取出请求透传数据并设置到`SofaRequest.requestProps`属性中；
2. 服务端接收到请求`SofaRequest`对象后，在其调用链中的 `ProviderBaggageFilter#invoke` 方法中会先从`SofaRequest.requestProps`中取出请求透传数据并设置到当前服务端线程的调用上下文`RpcInvokeContext.requestBaggage`属性中，最后业务代码就可以从调用上下文中获取请求透传数据了。

#### 响应透传数据

1. 服务端设置响应透传数据到其调用上下文`RpcInvokeContext.responseBaggage`属性中，之后在`ProviderBaggageFilter#invoke` 方法中先从`responseBaggage`中取出响应透传数据并设置到`SofaResponse.responseProps`属性中；
2. 客户端main线程被唤醒后，先从`SofaResponse.responseProps`中获取响应透传数据，之后将响应透传数据设置到其调用上下文`RpcInvokeContext.responseBaggage`中，最后业务代码就可以从调用上下文中获取响应透传数据了。

## oneway 调用下的透传

### 使用示例

![oneway 使用示例](https://cdn.nlark.com/yuque/0/2018/png/156121/1538259868506-a85edb44-48e2-498d-976d-aba15add5b95.png)

### 原理剖析

![oneway 原理剖析](https://cdn.nlark.com/yuque/0/2018/png/162694/1536993457159-f26817ee-b744-47b0-a057-d641453abae2.png)

在 oneway 模式下，客户端不接受服务端响应，也不会获取响应透传数据。

## future 调用下的透传

### 使用示例

![future 调用下的透传 使用示例](https://cdn.nlark.com/yuque/0/2018/png/156121/1538259903190-f8c01cec-907f-4f76-b4e3-23a60dfaea93.png)

### 原理剖析

![future 调用下的透传 原理剖析](https://cdn.nlark.com/yuque/0/2018/png/162694/1536978568519-fdf6f770-9e2c-4727-a185-c3a48a0bfb41.png)

#### 客户端获取响应透传数据

future 模式在 SOFARPC 内部会被转化为 callback 的方式进行调用，在 callback 对象中会存储main线程的调用上下文；当客户端接收到响应时，会执行该 callback 对象的回调函数，在其回调函数中，对于响应透传数据，会做如下操作：

1. 从`SofaResponse.responseProps`中获取响应透传数据

2. 从 callback 对象中获取 main 线程的调用上下文

3. 设置响应透传数据到 main 线程的调用上下文

4. 将 main 线程上下文拷贝到当前的回调线程中


实际上，第三步与第四步在 SOFARPC 源码中顺序相反，本文这样解读是为了更容易理解。这样无论是 future 模式（从 main 线程的调用上下文获取响应透传数据）还是 callback 模式（从回调线程的调用上下文获取响应透传数据），都可以顺利的获取到响应透传数据。

## callback 调用下的透传

### 使用示例

![callback 调用下的透传 使用示例](https://cdn.nlark.com/yuque/0/2018/png/156121/1538260089520-a809db6b-da2a-49d6-a06c-075051086eb5.png)

### 原理剖析

![callback 调用下的透传 原理剖析](https://cdn.nlark.com/yuque/0/2018/png/162694/1536993542518-429b9e4e-d58c-4fbd-870b-a2f0d3c694f2.png)

与 future 模式原理一样，只是最终业务代码中是从回调线程而不是main线程的调用上下文中获取响应透传数据。

## 与 SOFATracer 的比较

如果了解过 SOFATracer 的同学会有疑问，这个跟 Tracer 是不是有功能上的重叠呢？实际上。

[SOFATracer](https://github.com/alipay/sofa-tracer/wiki) 是蚂蚁开源的一个分布式链路追踪系统，SOFARPC 目前已经和 Tracer 做了集成，默认开启。和 Tracer 进行数据传递不同的是

1. SOFARPC 的数据透传更偏向业务使用，而且可以在全链路中进行双向传递，调用方可以传给服务方（请求透传数据），服务方也可以传递信息给调用方（响应透传数据），SOFATracer 更加偏向于中间件和业务无感知的数据的传递，并且只能进行单向传递。也就是向下传递，调用方并不能获取服务提供方的透传数据

2. SOFARPC 的透传可以选择性地不在全链路中透传（主动清除调用上下文数据），而 Tracer 中如果传递大量信息，会在整个链路中传递。可能对下游业务会有影响。

所以整体来看,两种方式各有利弊,在有一些和业务相关的透传数据的情况下,可以选择 SOFARPC 的透传.

## 参考

- [SOFARPC 线程模型剖析](https://mp.weixin.qq.com/s/yEu1RedULcljHsyY--F0Ww)

- [SOFARPC 同步异步实现剖析](https://mp.weixin.qq.com/s/446N2dA0gA17EO0D5wteNw)