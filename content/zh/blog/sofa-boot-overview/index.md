---
title: "蚂蚁金服研发框架总览 | SOFABoot 框架剖析"
author: "纶珥"
authorlink: "https://github.com/alaneuler/"
description: "本文为《剖析 | SOFABoot 框架》第一篇，主要介绍 SOFABoot 的基础特效。"
categories: "SOFALab"
tags: ["SOFALab","剖析 | SOFABoot 框架","SOFABoot"]
date: 2020-02-10T16:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1581406634429-5b05c174-c48e-4d86-83b9-2e89369b5e42.jpeg"
---

> **SOFA**Stack（**S**calable **O**pen **F**inancial **A**rchitecture Stack）是蚂蚁金服自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，是在金融场景里锤炼出来的最佳实践。

![SOFABoot 总览](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1580792540251-7775f63c-5cb6-4b12-9731-4a9b5fa6298c.jpeg)

本文为《剖析 | SOFABoot 框架》第一篇，本篇作者纶珥，来自蚂蚁金服。《剖析 | SOFABoot 框架》系列由 SOFA 团队和源码爱好者们出品，项目代号：[SOFA:BootLab/]()，文章尾部有参与方式，欢迎同样对源码热情的你加入。

SOFABoot 是蚂蚁金服开源的基于 SpringBoot 的研发框架，提供了诸如 Readiness Check、类隔离、日志空间隔离等能力，用于快速、敏捷地开发 Spring 应用程序，特别适合构建微服务系统。

[SpringBoot](https://spring.io/projects/spring-boot) 基于 Spring 的按条件配置（Conditional Configuration），结合 starter 依赖机制提供了快捷、方便开发 Spring 项目的体验，获得了极大的成功；[SOFABoot](https://github.com/sofastack/sofa-boot) 同样在这两个能力上基于 SpringBoot 扩展出适应于金融级应用开发框架。作为脱胎于蚂蚁金服内部对于 SpringBoot 的实践，SOFABoot 补充了 SpringBoot 在大规模金融级生产场景下一些不足的地方，例如 Readiness 检查、类隔离和日志空间隔离等等能力。在增强了 SpringBoot 的同时，SOFABoot 还提供了让用户可以在 SpringBoot 中非常方便地使用 SOFAStack 中间件的能力。

SOFABoot ：[https://github.com/sofastack/sofa-boot](https://github.com/sofastack/sofa-boot)

## 功能点概览

SOFABoot 完全兼容 SpringBoot，SpringBoot 技术栈可以快速切换到 SOFABoot 技术栈：修改项目 pom 依赖的 `<parent/>` 节点，例如将：

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>${spring.boot.version}</version>
    <relativePath/> 
</parent>
```

替换为：

```xml
<parent>
    <groupId>com.alipay.sofa</groupId>
    <artifactId>sofaboot-dependencies</artifactId>
    <version>${sofa.boot.version}</version>
</parent>
```

当前 SOFABoot 的最新版本为 v3.2.2。

## 应用 Readiness 检查

一个应用启动之后，是否是“准备”好能够处理外部请求呢？作为应用流量入口的组件是否可以接收外部连接？这就很有必要引入应用 Readiness 的检查，SOFABoot 提供除 SpringBoot 健康检查之外的应用 Readiness 检查能力，保证应用组件的正常启动、应用安全上线。

SOFABoot 通过 HealthChecker 检查各组件的 ready 情况。在 Spring 上下文刷新完成之后（所有的 Spring Bean 已经实例化完成），SOFABoot 会获取 IoC 容器中所有的 HealthChecker 实现类，检查其返回的组件健康状况；在应用开启了模块化隔离之后，模块 HealthChecker 还会 kicks in，检查模块的健康状况。Spring 原生的 HealthIndicator 作为 Readiness 的一部分也会纳入 Readiness 的结果中，若 HealthIndicator 出现了失败的情况，那么应用的 Readiness 也是不通过。

Readiness 检查包含组件的后置检查，流量入口组件（例如：RPC、REST）需要保证后置检查通过之后能接受外部流量的请求，应用才是真正 ready 了。

应用 Readiness 与 Liveliness 不同的是 Readiness 表示的是应用启动完成之后是否“准备”好的状态，启动完成之后是不变的；两次部署间的 Readiness 的所有请求结果是一致的。

## 应用模块化

应用模块化的方案多种多样。传统方案是以应用功能为边界做模块划分；研发期间，不同职责的类放在不同的模块下，但在运行期间都在同一个 classpath 下，没有任何隔离。而与传统的模块划分方案不同，人们发现可以利用 Java 的 ClassLoader 机制，将模块与模块间的类完全隔离；当某个模块需要与另一个模块通信时，可以通过类的导入和导出来实现。[OSGi](https://www.osgi.org/) 和 [SOFAArk](https://github.com/sofastack/sofa-ark) 都是基于 ClassLoader 隔离的模块化实践方案。

传统的模块化方案没有任何的隔离手段，模块间的边界得不到保障，容易出现模块间的紧耦合；而基于 ClassLoader 的模块化方案则过于彻底，研发人员必须十分清楚类的导入与导出、Java 的类加载体系，模块划分的负担转嫁到了普通研发人员身上。

SOFABoot 综合以上两种方案的利弊，引入了介于两者之间的模块化方案：每个模块有独立的 Spring 上下文，通过上下文的隔离，让不同模块之间的 Bean 的引用无法直接进行，达到模块在运行时的隔离。这样既保证了不引入过多的复杂性，也避免了没有任何隔离措施的模块边界保障。如下图所示：

![SOFABoot 模块化开发](https://cdn.nlark.com/yuque/0/2019/png/226702/1575861720582-04f3ada7-073f-424a-b603-b95ec01a17ef.png)

所有的 SOFABoot 模块都会有一个相同的 Spring Context 的 Parent，称之为 Root Application Context。对于所有模块都需要引入的 Bean，可以选择将其放置于 Root Application Context 中，在所有的模块间共享。此外，SOFABoot 框架提供两种 Spring 上下文隔离方案后的模块间通信能力：

- JVM 服务的发布和引用：同一个应用内不同模块间的通信

```java
// Publish a JVM service
@Component
@SofaService
public class MyServiceImpl implements MyService {
    // implementation goes here
}
// Reference a JVM service
public class AnyClass {
    @SofaReference
    private MyService myService;
}
```

- RPC 服务的发布和引用：不同应用间的通信

```java
// Publish a RPC service
@Component
@SofaService(interfaceType = MyService.class, bindings = { @SofaServiceBinding(bindingType = "bolt") })
public class MyServiceImpl implements MyService {
    // implementation goes here
}
// Reference a RPC service
public class AnyClass {
    @SofaReference(binding = @SofaReferenceBinding(bindingType = "bolt"))
    private MyService myService;
}
```

除了通过注解的方式，SOFABoot 还支持 XML 文件和编程 API 的配置方式。除了模块间通信能力，SOFABoot 还提供：

1. Module-Profile：模块级 Profile 能力，指定模块是否启动；
1. 扩展点：利用 [Nuxeo Runtime](https://github.com/nuxeo-archives/nuxeo-runtime) 为 Bean 提供扩展点入口；
1. Require-Module：声明模块间依赖关系；

## 应用并行化启动

### 模块并行化启动

SOFABoot 模块之间的依赖关系可以通过 Require-Module 指定，SOFABoot 会计算模块间的依赖形成一个有向无环图（DAG，若是有环图则无法正常启动）。SOFABoot 按照拓扑关系顺序启动依赖模块，并行启动自由模块。例如有如下的模块间依赖：

![模块间依赖](https://cdn.nlark.com/yuque/0/2019/png/226702/1575861720549-4871c6d8-dddc-4b3f-bd09-ef4ee25bfddd.png)

从图中可知，模块 A 必须在 模块 B 和 C 之前启动，模块 D 必须在模块 E 之前启动；模块 A 和 D 是可以并行启动的（开始起点的自由模块）。相对于所有模块共享一个 Spring 上下文的应用，SOFABoot 应用的并行启动能显著加快应用启动速度。

### Spring Bean 异步初始化

实际的 Spring/SpringBoot 开发中，Spring Bean 常常需要在初始化过程中执行准备操作，如拉取远程配置、初始化数据源等等；并且，这些准备操作在 Bean 初始化过程中占据了大量的时间，显著拖慢速度 Spring 上下文刷新速度。然而，Bean 初始化的准备操作与 Bean 的后置处理往往没有强制的前后顺序，是能够并行的！SOFABoot 敏锐地捕捉到了这个特点，提供了可配置选项，将 Bean 的 init-method 方法的执行异步化，从而加快 Spring 上下文刷新过程。

![Spring Bean 异步初始化](https://cdn.nlark.com/yuque/0/2019/png/226702/1575861720432-48e23d95-4a7b-4a76-8952-784cdaa58b24.png)

如图所示，Spring 在异步发射自定义 init-method 方法之后，马上进行 BeanPostProcessor 的后置处理，相当于“跳过”了最耗时的 init-method 环节。

Spring Bean 异步初始化配置方法：

```xml
<!-- 通过将 async-init 设为 true，开启对应 bean 的异步化初始化 -->
<bean id="testBean" class="com.alipay.sofa.beans.TimeWasteBean" init-method="init" async-init="true"/>
```

## 中间件集成管理

SOFABoot 通过 starter 机制管理了中间件依赖，一个中间件的使用不用再引入一长串 JAR 包依赖，而只需要一个 starter 依赖，将中间件当作可独立插拔的插件；starter 依赖负责传递中间件需要的 JAR 包依赖。中间件 starter 版本与 SOFABoot 版本关联，并且保证这些中间件 starter 版本的传递依赖经过严格测试是互相兼容的。不过 SOFABoot 的依赖管理依然是弱管理，如果用户想要指定某个 JAR 包的版本，那么也可以覆盖 starter 中配置的版本。SOFABoot 支持 Maven 和 Gradle 的依赖配置方式。

## 日志隔离

SOFABoot 通过 [sofa-common-tools](https://github.com/sofastack/sofa-common-tools) 集成了日志空间的隔离能力，框架自动发现应用中的日志实现，避免中间件和应用日志实现的绑定。

二方包或者引入的中间件面向日志编程接口 SLF4J 去编程，具体的日志实现交给 SOFABoot 应用开发者去选择；同时二方包或者中间件针对每一个日志实现提供配置以输出日志到相对固定目录下的文件。应用选择的日志实现，框架都能够自动感知并选择相应的配置文件日志输出。

## 应用类隔离

SOFABoot 通过 [SOFAArk](https://github.com/sofastack/sofa-ark) 提供类隔离能力和应用合并部署能力。SOFAArk 使用隔离的类加载模型，运行时底层插件、业务应用之间均相互隔离，单一插件和应用由不同的 ClassLoader 加载，可以有效避免相互之间的包冲突，提升插件和模块功能复用能力。支持多应用的合并部署，开发阶段将多个应用打包成可执行 Fat Jar，运行时使用 API 或配置中心动态地安装卸载应用。

## 欢迎加入，参与 SOFABoot 源码解析

本文为 SOFABoot 的初步介绍，希望大家对 SOFABoot 有一个初步的认识和了解。同时，我们开启了《剖析 | SOFABoot 框架》系列，会逐步详细介绍各个部分的代码设计和实现，预计按照如下的目录进行：

- **【已完成】SOFABoot 总览**
- 【已领取】SOFABoot HealthCheck 机制解析	
- 【已领取】SOFABoot 日志隔离解析
- 【待领取】SOFABoot runtime 机制解析	
- 【待领取】SOFABoot 上下文隔离机制解析

如果有同学对以上某个主题特别感兴趣的，可以留言讨论，我们会适当根据大家的反馈调整文章的顺序，谢谢大家关注 SOFA ，关注 SOFABoot，我们会一直与大家一起成长的。

**领取方式**：
回复【金融级分布式架构】本公众号想认领的文章名称，我们将会主动联系你，确认资质后，即可加入，It's your show time！

除了源码解析，也欢迎提交 issue 和 PR：
SOFABoot：[https://github.com/sofastack/sofa-boot](https://github.com/sofastack/sofa-boot)
