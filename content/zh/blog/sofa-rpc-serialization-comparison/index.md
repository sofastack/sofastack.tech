---
title: "【剖析 | SOFARPC 框架】之 SOFARPC 序列化比较"
author: "明不二"
authorlink: "https://www.simonming.com"
description: "本文为《剖析 | SOFARPC 框架》最后一篇，作者明不二，就职于华为。"
categories: "SOFARPC"
aliases: "/posts/__iyivm9"
tags: ["SOFARPC","剖析 | SOFARPC 框架","SOFALab"]
date: 2018-11-01T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563354968685-1ef6100b-3cee-4117-992a-f565652aef05.png"
---

> SOFA
> Scalable Open Financial Architecture
> 是蚂蚁金服自主研发的金融级分布式中间件，包含了构建金融级云原生架构所需的各个组件，是在金融场景里锤炼出来的最佳实践。
> 本文为《剖析 | SOFARPC 框架》最后一篇，作者明不二，就职于华为。
> 《剖析 | SOFARPC 框架》系列由 SOFA 团队和源码爱好者们出品，
> 项目代号：<SOFA:RPCLab/>，官方目录目前已经全部完成，感谢所有参与的源码爱好者！

## 前言

在应用服务化架构中，RPC 框架是非常重要的基础组件。而在 RPC 框架当中，序列化（以及反序列化）又是必不可少的一环。因为序列化的性能对整体框架性能有比较大的影响，之前的文章中，我们已经详细剖析了 SOFARPC 各个核心功能模块的实现原理，想必大家已经很清楚 RPC 的调用流程。

在整个 RPC 调用流程当中，序列化及反序列化起到了承上启下的作用。序列化时，RPC客户端把待调用的方法和参数对象转换为网络上可传输的字节序列，为进一步的编解码提供原料。反序列化时，把从网络上接收到且已经解码了的字节序列转换成对象，便于 RPC 服务端调用。

本文将从序列化概述、序列化协议特性、序列化使用方法分类、SOFARPC 序列化的设计及实现、几种序列化协议对比等方面介绍及对比序列化及其在 SOFARPC 中的应用。

![SOFARPC 序列话比较](https://cdn.nlark.com/yuque/0/2018/png/156644/1540949812958-721132f8-e497-4f3f-8ed9-04c8bc062899.png)

## 序列化概述

RPC 调用通过网络传输相关的调用方法及参数，在这个网络传输过程中，内存中的对象是无法直接传输的，只有二进制字节才能在网络上传输。而为了实现调用对象在网络上的传输，必须通过序列化实现对象 -> 字节的过程，以及反序列化实现字节 -> 对象的过程。在网络协议模型中，序列化属于应用层协议的一部分。

如下列定义：

序列化：将数据结构或者对象转换成二进制串的过程。

反序列化：将序列化过程中生成的二进制串转换成数据结构或者对象的过程。

在上述定义中，二进制字节数组专指 Java 语言中的 `byte[]`。

## 序列化协议特性

每种序列化协议都有其优点和缺点，在对一个序列化协议进行衡量评判时，通常由如下一些指标可以参考：

| 指标 | 说明 | 重要性 |
| --- | --- | --- |
| 通用性 | 是否跨平台，社区如何 | 中高 |
| 可读 | 序列化格式是否可读 | 中低 |
| 易用性 | 是否简单易用 | 中高 |
| 性能 | 序列化后的大小和压缩 CPU消耗 | 中高 |
| 可扩展性 | 是在允许字段修改 | 高 |
| 安全性 | 是否存在一些无法修复的漏洞 | 高 |

以下逐个来详细说明：

### 通用性

在通用性上，主要考察该序列化协议是否支持跨平台、跨语言的使用，同时兼顾考察业界的流行度及社区的活跃性。

### 可读/易用性

在可读、易用性上面，主要考察该序列化协议序列化之后是否人眼可读，如 XML 和 JSON 就是人眼可读的序列化框架，这会大大提高调试的效率。同时，需要考察序列化框架所提供的 API 是否容易学习、调用。当然，在远程调用 的场景下，可读性不是一个重要因素。或者说，我们更多希望不可读。来保证一定的安全性。

### 性能

性能指标，主要考虑序列化框架的时间复杂度和空间复杂度。

序列化之后的数据一般都是用于存储或者网络传输，空间占用大小决定了传输的效率。序列化通常情况下要在原有的数据上加上描述字段，如果这个过程中引入的额外开销过大，则在大规模分布式系统中，很可能会造成巨大的额外空间开销。

同时，为了提高系统的性能，是否耗费 CPU，解析和反解析二进制串的时间也是一个非常重要的指标。

### 可扩展性

主要考虑当系统准备升级，需要对实体的属性进行变更，此时序列化协议能否快速支持，并且不会对原有的系统造成影响。如作为服务提供方的 API 接口入参中，增加了一个字段，是否一定要强制所有的客户端进行升级。这个会涉及到线上兼容性的问题。一般我们要求新增字段，在客户端尚未使用的情况下，不应该有序列化问题。

### 安全性

需要考察序列化协议是否支持跨局域网之间的安全访问。是否存在一些安全漏洞。可以通过构造一些字节数组，使得服务端反序列化的时候，触发某些安全漏洞，执行一些系统调用，或者越权操作。

## 序列化使用方式分类

按照序列化的使用方式，可以分为自描述型序列化以及基于中间格式型序列化。

### 自描述型

所谓的自描述型，即在序列化的字节流里有着完整的对象类型信息和属性信息，可以在不依赖任何外界描述信息的前提下，只要拿到这个二进制流，就可以直接还原出原始对象。

类似的系列化产品有：`hessian`、`JSON`、`XML` 等。

例如，有如下一个对象 Person，Java 语言定义如下：

```java
package com.sofa.test.Person;

public class Person {
    private int age = 15;
    private String name = “sofa”;
}
```

则使用 `hessian` 序列化后的字节流如下：

`M**com.sofa.test.PersonS**nameS**sofaS**ageI**b3 b2 b1 b0 z`

上面的*和b3 b2 b1 b0都表示不可打印的二进制。从上面内容可以看出，按照相应规定就能从二进制串中反序列化出对象来。因为这里面已经描述了类型，类型的字段名，以及对应的值，这样就可以直接反序列化了。

### 基于中间描述型

一般这种类型的序列化主要用于跨语言当中，比如 `Protobuf`以及 `thrift `等等。在使用时都需要事先定义一个中间格式的文件（IDL 文件），然后根据不同语言的生成工具生成一个相应语言的可序列化类。以下是一个简单的 Proto的描述文件

```java
message SofaApp{
    string appName = 1;
    repeated string authList = 2;
    repeated string serviceList = 3;
}
```

然后当需要反序列化时，根据 IDL 文件及逆行相应的反序列化即可。格式是这样

![对象的 Protobuf 格式](https://cdn.nlark.com/yuque/0/2018/png/156121/1540946058625-8e7321f8-3302-4ada-9e49-e7e089f1cf42.png)

其中，图中的用户定义编号就是前面 proto中对每个字段定义的编号。

## SOFARPC 序列化的设计与实现

SOFARPC 支持及将要支持的序列化协议有：`hessian`、`Protobuf`、`Json`。

### 序列化接口定义

在目前的 SOFARPC  5.4 分支中，已经支持的序列化协议有 `hessian` 和 `Protobuf`。两个序列化实现类继承了 `AbstractSerializer `抽象类，该抽象类又实现了如下的 `Serializer `接口：

```java
/**
 * 序列化器接口
 *
 * @author <a href=mailto:zhanggeng.zg@antfin.com>GengZhang</a>
 */
@Extensible(coded = true)
@Unstable
public interface Serializer {

    /**
     * 序列化
     *
     * @param object  对象
     * @param context 上下文
     * @return 序列化后的对象
     * @throws SofaRpcException 序列化异常
     */
    public AbstractByteBuf encode(Object object, Map<String, String> context) throws SofaRpcException;

    /**
     * 反序列化，只有类型，返回对象
     *
     * @param data    原始字节数组
     * @param clazz   期望的类型
     * @param context 上下文
     * @return 反序列化后的对象
     * @throws SofaRpcException 序列化异常
     */
    public Object decode(AbstractByteBuf data, Class clazz, Map<String, String> context) throws SofaRpcException;

    /**
     * 反序列化，已有数据，填充字段
     *
     * @param data     原始字节数组
     * @param template 模板对象
     * @param context  上下文
     * @throws SofaRpcException 序列化异常
     */
    public void decode(AbstractByteBuf data, Object template, Map<String, String> context) throws SofaRpcException;
}
```

从上面的接口定义可以看出，序列化方法传入待序列化对象及相应的上下文参数，最后生成序列化的对象。

反序列化则是重载的两个方法，在传入字节数据及上下文的时候，分别还可以传入期望的类型或者模板。

序列化协议对象的获取则通过 `SerializerFactory` 序列化工厂传入序列化名称获取，获取到的序列化协议对象再对传入的数据进行相应的序列化与反系列化操作。

目前 SOFARPC 序列化支持协议，SOFA-Hessian，Protobuf，泛化调用序列化(hessian)，Jackson。

## 几种序列化协议对比

| 序列化协议 | 简要介绍 | 优点 | 缺点 |
| --- | --- | --- | --- |
| SOFA-Hessian | hessian2协议，安全改进 | Java友好，性能较高 | 跨语言支持一般 |
| Kryo | Kryo框架 | 速度快，序列化后体积小 | 跨语言支持较复杂
，有一个限制，就是如果服务端增删字段，客户端没有更新会失败，不支持无参构造函数 |
| Protobuf | 中间描述型 | 跨语言，性能高 | 使用不够友好，生成类可读性差，需要工具辅助。 |
| JDK | JVM原生序列化支持 | 使用方便，无需引入额外依赖 | 速度慢，占空间，有安全问题，已经不再使用 |
| JSON | 各种 json库直接使用 | 跨语言，使用简单，格式可读 | 序列化结果大小较大，性能一般，可能存在反序列化漏洞。 |

这里我们只介绍了几种常见的，或者大家使用比较多的。对于一些其他不常见的序列化框架的性能和优缺点，可以参看参考文档中的 wiki，非常见的序列化框架可能存在更多的潜在限制，如果选型，需要特别注意。

## 参考资料

- SOFARPC 框架之总体设计与扩展机制：[https://mp.weixin.qq.com/s/ZKUmmFT0NWEAvba2MJiJfA](https://mp.weixin.qq.com/s/ZKUmmFT0NWEAvba2MJiJfA)
- 序列化和反序列化：[http://www.infoq.com/cn/articles/serialization-and-deserialization](http://www.infoq.com/cn/articles/serialization-and-deserialization)
- 序列化性能比较：[https://github.com/eishay/jvm-serializers/wiki](https://github.com/eishay/jvm-serializers/wiki)
- 高效的数据压缩编码方式 Protobuf：[https://halfrost.com/protobuf_encode/](https://halfrost.com/protobuf_encode/)

## 结语

本文主要对 SOFARPC 序列化的内容进行了总括性的介绍。讲述了序列化的定义及序列化框架的基本特性，同时对 SOFARPC 框架序列化的流程进行了说明。 在设计和选择 RPC 框架序列化协议的时候，可以根据实际情况进行选择。