---
title: "SOFARPC 5.5.X 新版发布 | 集成 Nacos 与 Hystrix"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "最新的 SOFARPC 5.5.1 已经发布啦，本文给大家介绍下 SOFARPC v5.5.x 系列主要提供的特性以及使用方式。"
categories: "SOFARPC"
tags: ["SOFARPC"]
date: 2019-03-05T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1564392994334-a78d9821-c561-45a0-a960-2d1670ad5d4e.png"
---

> **SOFA**
> **S**calable **O**pen **F**inancial **A**rchitecture
> 是蚂蚁金服自主研发的金融级分布式中间件，包含了构建金融级云原生架构所需的各个组件，是在金融场景里锤炼出来的最佳实践。
> 
> SOFA 文档: <http://www.sofastack.tech/>
> SOFA: <https://github.com/alipay>

![SOFARPC & Nacos & Hystrix](https://cdn.nlark.com/yuque/0/2019/png/226702/1551773737627-2d027afc-9b4c-4983-9eae-c4811cca5f37.png)

最新的 SOFARPC 5.5.1 已经发布啦，本文给大家介绍下 SOFARPC v5.5.x 系列主要提供的特性以及使用方式。

SOFARPC 作为成熟的 RPC 框架，一直致力于给用户提供稳定可靠的 RPC 框架 以及最自主的选择权。SOFARPC 的插件扩展机制可以支持各类实现的可插拔实现。

SOFARPC 5.5 主要给开发者们带来了服务发现的新选择：Nacos 的集成 与 服务容错对 Hystrix 的集成。

## 服务注册 Nacos 新选择

Nacos 是阿里巴巴开源的一个更易于构建云原生应用的动态服务发现、配置管理和服务管理平台。根据 Nacos 的 Roadmap，0.8.0 已具备生产使用的能力，截止笔者撰稿时间，Nacos 已发布 0.9.0，距离 1.0.0 越来越近了。

SOFARPC 5.5.0 开始提供对 Nacos 的集成，以下介绍两种使用方式：

### 1、SOFABoot 集成 Nacos

SOFABoot 从 2.5.3 开始已集成 SOFARPC 对 Nacos 的配置支持，假如开发者本机已经根据 [Nacos 快速开始](https://nacos.io/zh-cn/docs/quick-start.html)安装并启动 Nacos Server。

根据 RPC 的[示例工程](https://github.com/alipay/sofa-rpc-boot-projects/tree/master/sofa-boot-samples)创建一个 SOFABoot 工程，SOFABoot 工程使用 2.5.3。

```bash
$ git clone git@github.com:alipay/sofa-rpc-boot-projects.git
$ git checkout 5.x
```

在 application.properties 中配置服务注册中心地址信息，就能够使用 Nacos 作为注册中心。

```bash
$ vi sofa-boot-samples/src/main/resources/application.properties
com.alipay.sofa.rpc.registry.address=nacos://127.0.0.1:8848
```

启动 RPC 服务端实例工程：

```bash
run com.alipay.sofa.rpc.samples.invoke.InvokeServerApplication
```

启动成功后即可在 Nacos 服务端看到服务注册信息：[Nacos 服务列表](http://127.0.0.1:8848/nacos/#/serviceManagement?dataId=&group=&appName=&namespace=) （注：如果用户自己部署了nacos 的服务端，可以通过这个地址访问）

![Nacos 服务端](https://cdn.nlark.com/yuque/0/2019/png/153624/1551615172121-bf7d15c6-c8a8-450a-ab72-b2960589571e.png)

启动 RPC 客户端调用工程：

```bash
run com.alipay.sofa.rpc.samples.invoke.InvokeClientApplication
```

可以看到调用成功结果，分别代表同步、异步、回调调用成功：

```bash
sync
future
callback client process:callback
```

### 2、SOFARPC 独立集成 Nacos

SOFARPC 独立使用集成 Nacos 也很简单，只需要将注册中心地址设置为 Nacos 服务地址即可。

引入 SOFARPC：

```xml
<dependency>
    <groupId>com.alipay.sofa</groupId>
    <artifactId>sofa-rpc-all</artifactId>
    <version>5.5.1</version>
</dependency>
```

API 方式发布服务：

```java
# 构造服务注册中心配置
RegistryConfig registryConfig = new RegistryConfig()
    .setProtocol("nacos")
    .setSubscribe(true)
    .setAddress("127.0.0.1:8848")
    .setRegister(true);

# 构造服务端口配置
ServerConfig serverConfig = new ServerConfig()
    .setProtocol("bolt")
    .setHost("0.0.0.0")
    .setPort(12200);

# 构造服务发布者
ProviderConfig<HelloService> providerConfig = new ProviderConfig<HelloService>()
    .setInterfaceId(HelloService.class.getName())
    .setRef(new HelloServiceImpl())
    .setServer(serverConfig)
       .setRegister(true)
    .setRegistry(Lists.newArrayList(registryConfig));
providerConfig.export();
```

即可发布服务至 Nacos Server。

## 服务容错支持 Hystrix

在大规模的分布式系统中，一个完整的请求链路会跨越多个服务，其中每一个节点出现故障都将放大到全局，轻则造成执行逻辑崩溃，重则消耗掉所有资源拖垮整个系统。

Hystrix 是 Netflix 开源的容错组件，提供以下功能以解决该问题：

1. 通过线程池或是信号量对资源进行隔离，避免依赖服务在故障时使用大量资源拖垮整个应用
2. 使用熔断器模式（Circuit Breaker pattern）实现请求故障服务的快速失败（fail-fast），避免故障服务所造成的延时影响整体请求的延时
3. 提供故障降级（Fallback）使用户可以编写优雅降级的策略，防止故障传递到上层
4. 提供准实时的监控指标，使每一个依赖服务的请求结果和延时可观测

### 在 SOFARPC 中使用 Hystrix

Hystrix 本身使用命令模式（Command pattern）实现了 API，我们在 SOFARPC 中对其进行了封装，只需要简单配置即可开启相关功能。

Hystrix 作为 SOFARPC 的可选模块默认不会进行加载，所以首先需要显式在项目中添加 Hystrix 依赖：

```xml
<dependency>
    <groupId>com.netflix.hystrix</groupId>
    <artifactId>hystrix-core</artifactId>
    <version>1.5.12</version>
</dependency>
```

然后通过开关选择开启全局的 Hystrix 支持，或是只对一部分 Consumer 开启：

```java
// 全局开启
RpcConfigs.putValue(HystrixConstants.SOFA_HYSTRIX_ENABLED, true);

// 对特定 Consumer 开启
ConsumerConfig<HelloService> consumerConfig = new ConsumerConfig<HelloService>()
        .setInterfaceId(HelloService.class.getName())
        .setParameter(HystrixConstants.SOFA_HYSTRIX_ENABLED, String.valueOf(true));
```

开启后， Consumer 发起的所有请求都将在 Hystrix 的包裹下运行，可以通过 Hystrix 的配置对这些请求设置超时、隔离、熔断、降级等策略。

### 配置降级策略

Hystrix 支持在出现执行失败、超时、熔断和请求拒绝等场景时进行降级策略，如果要在 SOFARPC 中启动降级，只需要设置一个对应接口的实现类即可。

```java
public class HelloServiceFallback implements HelloService {
    @Override
    public String sayHello(String name, int age) {
        return "fallback " + name + " from server! age: " + age;
    }
}

SofaHystrixConfig.registerFallback(consumerConfig, new HelloServiceFallback());
```

如果需要更复杂的降级策略，例如通过执行的异常，或是 SofaRequest 中的信息进行降级逻辑，也可以使用 FallbackFactory 在运行时动态创建一个 Fallback 对象。

```java
public class HelloServiceFallbackFactory implements FallbackFactory<HelloService> {
    @Override
    public HelloService create(FallbackContext context) {
        return new HelloServiceFallback(context.getException(), context.getRequest());
    }
}

SofaHystrixConfig.registerFallbackFactory(consumerConfig, new HelloServiceFallbackFactory());
```

### 和 Spring Cloud 集成

SOFARPC Hystrix 可以很好的与 Spring Cloud Netflix 中默认的 Hystrix 相关组件结合，为 SOFARPC Hystrix 提供额外的配置管理和监控功能。

Hystrix 默认使用 Archaius 作为配置管理，当 Spring Cloud Netflix 也存在时，Archaius 便可以通过 Spring Boot 的配置文件读取 Hystrix 的配置，这样使用者可以很轻松的使用 Spring Boot 强大的配置管理方式（多 Profile 维度、多数据源）以及集成丰富的第三方配置中心支持（Spring Cloud Config、Apollo）。

此外如果项目中使用了 Spring Boot Actuator，Hystrix 就可以通过 Actuator 内置的 /metrics Endpoint 暴露出 RPC 调用的相关指标，包括请求数、成功率和延时等信息，可以非常方便的集成于现有的监控系统中。

如果使用了 Hystrix Dashboard 或是 Turbine，可以获得一个开箱即用的使用了 Hystrix Dashboard 或是 Turbine将这些指标展示出来，如下图所示。

![使用了 Hystrix Dashboard 或是 Turbine](https://cdn.nlark.com/yuque/0/2019/jpeg/280280/1551704450755-2b501398-f9aa-435e-a11e-c68a4ff3094f.jpeg)

与 Spring Cloud 集成的 Example 可以在 [https://github.com/ScienJus/sofa-rpc-hystrix-with-spring-cloud-example](https://github.com/ScienJus/sofa-rpc-hystrix-with-spring-cloud-example) 中查看。

### 和 Fault Tolerance 组件的区别

最后回答一个大家最关心的话题：「SOFARPC 中已经有了一个容错组件 Fault Tolerance，为什么还要引入 Hystrix？这两个组件之间有什么区别？」

Fault Tolerance 和 Hystrix 最大的区别在于它们所解决的问题不同， Fault Tolerance 提供的是一个负载均衡级别的容错策略，而 Hystrix 提供的是接口级别的容错策略。

举个例子，如果一个接口有三个 Provider 实例，其中一个实例出现了故障，Fault Tolerance 的容错会在 Consumer 侧将出现故障的 Provider 进行降权，让 Consumer 尽量访问健康的节点。而 Hystrix 则会计算整个接口的调用成功率，如果错误率超出了熔断的标准，所有请求都会快速失败并降级。

在一个复杂的分布式系统中，实例级别的容错和接口级别的容错都是有必要的，所以同时使用 Hystrix 和 Fault Tolerance 并不会有什么冲突。

## 更多的序列化和代理方式

本次发布支持了 bytebuddy 作为动态代理生成的方式，如果有特殊需求的同学，可以通过 API 的方式来使用。

```java
ConsumerConfig<HelloService> consumerConfig = new ConsumerConfig<HelloService>()
        .setInterfaceId(HelloService.class.getName())
        .setProxy("bytebuddy");
```

同时支持 jackson 作为序列化方式，对于一些简单的场景或者测试的场景，可以使用。注意：限制入参只能是一个对象。

可以通过在 SOFABoot 的服务引用和发布配置中，设置

```java
serialize-type="json"
```

来进行启用。

## Zookeeper 支持 Auth

对于对 Zookeeper 有安全诉求的同学， 我们在这个版本中支持了 Auth 的能力，可以通过 SOFABoot 的配置来开启。

```xml
com.alipay.sofa.rpc.registry.address=zookeeper://xxx:2181?file=/home/admin/registry&scheme=digest&addAuth=sofazk:rpc1
```

## 更多特性

更多特性和增强可以查看：

Release Note：[https://github.com/alipay/sofa-rpc/releases](https://github.com/alipay/sofa-rpc/releases)

## 致谢

感谢下列同学对本版本发布代码的贡献，排名不分先后。

 [@ScienJus](https://github.com/ScienJus)，[@jewin](https://github.com/jewin) ，[@huangyunbin](https://github.com/huangyunbin) ，[@zhaojigang](https://github.com/zhaojigang)，[@leyou240](https://github.com/leyou240)，[@tiansxx](https://github.com/tiansxx)，[@liangyuanpeng](https://github.com/liangyuanpeng)，[@Moriadry](https://github.com/Moriadry)，[@OrezzerO](https://github.com/OrezzerO)，[@315157973](https://github.com/315157973)，[@hqq2023623](https://github.com/hqq2023623)，[@wudidapaopao](https://github.com/wudidapaopao)

特别感谢 [@ScienJus](https://github.com/ScienJus) 对本文的贡献。