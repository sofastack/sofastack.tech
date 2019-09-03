---
title: "【剖析 | SOFARPC 框架】之 SOFARPC 泛化调用实现剖析"
author: "莫那·鲁道"
authorlink: "https://github.com/stateIs0"
description: " 本文为《剖析 | SOFARPC 框架》第七篇，作者莫那·鲁道 ，来自 E签宝。"
categories: "SOFARPC"
tags: ["SOFARPC","剖析 | SOFARPC 框架"]
aliases: "/posts/__oqi4gw"
date: 2018-09-26T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563272762674-c4f3a637-e5a8-4284-a5e2-4abf8c460800.png"
---

> SOFA
> Scalable Open Financial Architecture
> 是蚂蚁金服自主研发的金融级分布式中间件，包含了构建金融级云原生架构所需的各个组件，是在金融场景里锤炼出来的最佳实践。
> 本文为《剖析 | SOFARPC 框架》第七篇，作者莫那·鲁道 ，来自 E签宝。
> 《剖析 | SOFARPC 框架》系列由 SOFA 团队和源码爱好者们出品，
> 项目代号：<SOFA:RPCLab/>，官方目录目前已经全部认领完毕。

## 前言

我们知道，在 RPC 调用中，客户端需要加载服务端提供的接口定义类，但是，很多情况下，这个并不总是可行的，于是，衍生了泛化调用的需求，一个成熟的，功能完善的 RPC 框架一般都会支持泛化调用，那么什么是泛化调用呢？SOFA RPC 又是如何支持泛化调用的？同时又是如何实现的？ 和其他的 RPC 泛化调用又有何不同？有何优势？我们将在本文一一解答这些问题。

## 泛化调用介绍

当客户端因为某种原因无法得到服务提供方的接口 jar 包时，或者是客户端是一个比较通用的系统，并不想依赖每个服务提供方提供的 facade接口，但是又需要进行调用，那么此时就需要进行泛化调用。

例如：
1. 当分布式系统由多个语言开发，假设是 Node Js ，同时 Node Js 需要调用 Java 语言的 RPC 服务，那么，我们就需要在两者之间架设适配层，让适配层处理 Node Js 的请求后再转发给 Java 的 RPC 服务。
2. 一些中间系统的功能，比如某些内部网关，需要以一个统一的方式实现对其他下游系统的调用（非 SPI的情况），逐个依赖下游的包显然是不可能的。
3. 一些流量回放类的线上系统，可以将数据采集拦截，之后，通过泛化调用回放，而不需要依赖全站的应用。

那么这种情况下，肯定不能包含所有接口的 jar 文件，否则就太臃肿了。实际上也是不现实的，总不能每增加一个服务端，就增加一个 jar 包依赖，然后应用进行发布重启。

这个时候就可以使用泛化调用，将相应的请求包装成泛化调用，就能够实现不依赖接口 jar 包，多语言调用 RPC 服务，避免重复开发。

## SOFA RPC 的泛化调用使用

SOFA RPC 的官方文档十分详细，在官方 wiki [泛化调用](http://www.sofastack.tech/sofa-rpc/docs/Generic-Invoke) 中，已有详细介绍。同时，在源码中的 example 模块中，也有现成的 demo 可以跑起来，读者可以自己 clone 源码阅读，这里我们简要说明一下使用方式，以便大家有一个直观的了解。

### 接口定义

总的来说，泛化调用有 2 个 API，包含 5 个方法，其中， 2 个方法已经废弃，也就是说，有 3 个主要方法。分别是：

```java
/**
 * 泛化调用
 * @return 正常类型（不能是GenericObject类型）
 */
Object $invoke(String methodName, String[] argTypes, Object[] args);

/**
 * 支持参数类型无法在类加载器加载情况的泛化调用
 * @return 除了JDK等内置类型，其它对象是GenericObject类型
 */
Object $genericInvoke(String methodName, String[] argTypes, Object[] args);

/**
 * 支持参数类型无法在类加载器加载情况的泛化调用
 * @return 返回指定的T类型返回对象
 */
<T> T $genericInvoke(String methodName, String[] argTypes, Object[] args, Class<T> clazz);
```

1. \$invoke 该方法使用场景：用户知道参数类型和返回值类型，那么就可以使用该方法。
2. \$genericInvoke 该方法是个重载方法，重载一的使用场景是：如果你的应用不知道接口的参数类型和返回值类型，这个时候，你就需要使用 GenericObject 类，来包装返回值和参数。
3. \$genericInvoke 重载二的使用场景是：如果应用不知道接口参数类型，但是知道接口返回值的类型，那么就不需要使用 GenericObject 作为返回值了。

基本上，已经覆盖了常用的集中场景，可以说功能相当全面。

### 泛化使用

由于篇幅有限，这里就不贴使用 demo 了，感兴趣的可以通过链接查看官方的 demo 或者源码，包含 SOFARPC 的 API 使用方式和 SOFABoot 的使用方式：

1. demo wiki 地址：[用户手册->基本特性->泛化调用](http://www.sofastack.tech/sofa-rpc/docs/Generic-Invoke)
2. 源码地址：[示例源码](https://github.com/alipay/sofa-rpc/tree/master/example/src/test/java/com/alipay/sofa/rpc/invoke/generic)

## SOFARPC 泛化调用的设计与实现

接下来我们重点来介绍 SOFARPC 是如何实现泛化调用的。

### 框架调用设计

简单来说，泛化调用的关键就是对象表示和序列化，SOFARPC 提供了 GenericObject 等对象来表示参数对象或者返回值对象，而将 GenericObject 对象序列化成目标对象，或者将返回值反序列化成 GenericObject 对象，是 SOFARPC 实现泛化的关键。

这里我们先来看一下 SOFARPC 泛化调用的流程图，有助于后面理解泛化实现。

![ SOFARPC 泛化调用流程图](https://cdn.nlark.com/yuque/0/2018/png/157705/1537837680758-1baf7949-5104-4b82-8b19-5213c559bef8.png)

我们来说一下这个图：
1. 泛化 API 调用时，会加载泛化过滤器，作用是做一些参数转换，同时设置序列化工厂类型。
2. SOFARPC 在使用 SOFABolt 进行网络调用前，会创建 context 上下文并传递给  SOFABolt，上下文中包含着序列化工厂类型信息，这个信息将决定使用何种序列化器，同时这个上下文将流转于整个调用期间。
3. 在 SOFABolt 正式发送数据之前，会将 GenericObject 对象序列化成普通对象的字节流，这样，服务提供方就不必关心是否为泛化调用，从图中可见，提供方不用对泛化调用做任何改变 —— **这是 SOFARPC 泛化区别于其他 RPC 泛化的关键**。
4. 当提供方成功接收请求后，使用普通序列化器即可反序列化数据，只需要正常调用并返回即可。
5. 当消费者的 SOFABolt 接收到响应数据后，便根据 context 的序列化类型，对返回值做反序列化，即将普通的字节流反序列化成 GenericObject 对象 —— 因为客户端有可能不知道返回值的  Class 类型。
6. 最终，泛化 API 即可得到 GenericObject 类型的返回值。

从上面的流程可以看出，序列化器在泛化调用中，占了极大的篇幅和作用。而 SOFARPC 针对泛化调用，对 hessian3 进行了改造，使其支持泛化调用所需要的序列化功能。[SOFA-Hessian](https://github.com/alipay/sofa-hessian)的改动可以参考这里。

### Hessian 泛化实现

SOFA-Hessian 在 hessian 的包中加入了 com.alipay.hessian.generic 包，此包的作用就是处理泛化调用，重写的关键是实现或继承 SerializerFactory 类和 Serializer、Deserializer 等接口。在这里，设计了一下几个类，来描述对应的类型信息，同时实现这几个类的序列化和反序列化。对应关系如下：

![Hessian 泛化实现](https://cdn.nlark.com/yuque/0/2018/png/156121/1537830528237-8f6c181f-ed46-4815-8e4c-42a38122e10e.png)

我们以 GenericObjectSerializer 为例，该序列化器重写了 writeObject 方法，该方法的作用就是将 GenericObject 对象序列化成目标对象字节流。即，拿出 GenericObject 的 type 字段和 fields 字段，组装成目标对象的字节流。

例如：
有一个类型是的 RPC 对象

```plain
public class TestObj {
    private String str;
    private int    num;
}
```

在泛化调用客户端，可以直接构造一个 GenericObject对象

```plain
  GenericObject genericObject = new GenericObject(
                    "com.alipay.sofa.rpc.invoke.generic.TestObj");
                genericObject.putField("str", "xxxx");
                genericObject.putField("num", 222);
```

此时，GenericObjectSerializer 就可以通过这些信息，将 GenericObject 对象转成 TestObj 对象的字节流。服务提供方就可以通过普通的 hessian2 反序列化得到对象。

相比较其他 RPC 框架两端都需要对泛化进行支持，SOFARPC 显得要友好的多。也就是说，如果应用想要支持泛化，只需要升级客户端（消费者）即可，服务端（提供者）是无感知的。因为在服务端看来，收到的对象是完全一致的。你可能觉得对于复杂类型，写出这样一个构造是很困难的。SOFA-Hessian中已经提供了一个工具类

```plain
com.alipay.hessian.generic.util.GenericUtils
```

来辅助使用者来生成，可以直接使用。

## SOFARPC 与 Dubbo 的泛化调用比较

下面我们来介绍下泛化调用和业界一些其他产品的比较，首先介绍一下序列化本身的一些性能和优势比较。

### 序列化本身的比较

在 github 上，有一个专门针对 [Java  序列化进行的 benchmark](https://github.com/eishay/jvm-serializers/wiki)，可以稍微做一下参考。虽然在实际的场景中， 每个序列化的场景不同，带来的结果可能和这里的 benchmark  结果不同，但还是有参考意义，从该项目的基准测试可以看出：Json 无论是压缩比还是序列化时间，相比 hessian 等都有相当大的__劣势__。

同时，虽然 hessian 相对于 protostuff、kryo 等在性能上有一点差距，但是 hessian 反序列化无需指定类型，这个优势是非常有价值的。

### Dubbo 的泛化调用

在众多的 RPC 框架中，Dubbo 也提供了泛化调用的功能，接下来我们再来说说 Dubbo 的泛化。Dubbo 泛化和 SOFARPC 泛化最大的不同就是：Dubbo 需要服务端也支持泛化，因此，如果想提供泛化功能，服务端也必须进行升级，这看起来可能没有 SOFARPC 友好。

Dubbo 的泛化调用流程如下图：

![Dubbo 泛化调用流程](https://cdn.nlark.com/yuque/0/2018/png/157705/1536551156594-fe5bfba9-7f86-4c50-92c5-7b2f387078d8.png)

可以看到，Dubbo 的服务端也需要泛化过滤器将 Map 解析成 POJO 来解析数据。

## 总结

本文主要讲解了 SOFARPC 泛化调用的设计与实现，介绍了泛化调用的场景，同时，提及了 SOFA RPC 泛化调用的 API 使用，也详细讲解了 SOFARPC 的泛化设计和实现。最后，对社区中的一些 RPC 框架的泛化调用做了简单的比较。

这里对SOFARPC 的泛化设计与实现做个小结：
1. 设计目标是：服务端无需感知是否泛化，一切都是由客户端进行处理。带来的好处是：应用如果想要支持泛化，不需要改动服务端，只需要修改客户端即可。这是和其他 RPC 框架泛化调用最大的区别。
2. 实现方式：通过SOFA-Hessian 序列化支持泛化序列化，在进行泛化调用时，bolt 会根据上下文的序列化标记来使用对应的序列化器，SOFA-Hessian 特有的泛化序列化器可将 GenericObject 对象序列化成目标对象的字节流，服务端按正常反序列化即可。SOFA-Hessian 特有的泛化反序列化器也可将目标返回值反序列化成 GenericObject 等对象。

## 参考

- [https://github.com/eishay/jvm-serializers](https://github.com/eishay/jvm-serializers)
- [https://github.com/alipay/sofa-hessian](https://github.com/alipay/sofa-hessian)
- [http://www.sofastack.tech/sofa-rpc/docs/Generic-Invoke](http://www.sofastack.tech/sofa-rpc/docs/Generic-Invoke)