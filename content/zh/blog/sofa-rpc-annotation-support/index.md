---
title: "【剖析 | SOFARPC 框架】系列之 SOFARPC 注解支持剖析"
author: "敏古"
description: "本文为《剖析 | SOFARPC 框架》第十一篇，作者敏古。"
categories: "SOFARPC"
aliases: "/posts/__xcon7k"
tags: ["SOFARPC","剖析 | SOFARPC 框架"]
date: 2018-10-25T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563351799427-65a125ce-a514-48e3-857f-f3f39615e66c.png"
---

> **SOFA**
> **S**calable **O**pen **F**inancial **A**rchitecture
> 是蚂蚁金服自主研发的金融级分布式中间件，包含了构建金融级云原生架构所需的各个组件，是在金融场景里锤炼出来的最佳实践。
> 本文为《剖析 | SOFARPC 框架》第十一篇，作者敏古。
> 《剖析 | SOFARPC 框架》系列由 SOFA 团队和源码爱好者们出品，
> 项目代号：<SOFA:RPCLab/>，官方目录目前已经全部认领完毕。
> SOFARPC：<https://github.com/sofastack/sofa-rpc>

## 1、前言

在 SOFABoot 环境下，SOFARPC 提供三种方式给开发人员发布和引用 RPC 服务：

1. XML 方式（配置）

2. Annotation 方式（注解）

3. 编程 API 方式（动态）

编程 API 方式与Spring 的 `ApplicationContextAware` 类似。XML的方式依赖于在xml中引入 SOFA 命名空间，利用 Bean 的生命周期管理，进行 Bean 的注入。相比这两种方式，通过 Annotation 方式发布 JVM 服务更加灵活方便，只需要在实现类上加 `@SofaService`、`@SofaRefernce` 注解即可进行服务的发布和引用。本文针对 SOFARPC 在注解的支持和使用分原理、源码两部分进行一一介绍。

## 2、原理介绍

### 2.1、注解是什么

注解又称为元数据，可以对代码中添加信息，这是一种形式化的方法，可以在稍后的某个时刻非常方便地使用这些数据。这个时刻可能是编译时，也可能是运行时。

注解是JDK1.5版本开始引入的一个特性，用于对代码进行说明，可以对包、类、接口、字段、方法参数、局部变量等进行注解。注解的本质就是一个继承了 Annotation 接口的接口。一个注解准确意义上来说，只不过是一种特殊的注释而已，如果没有解析它的代码，它可能连注释都不如。

一般常用的注解可以分为三类：

1. Java自带的标准注解，包括`@Override`（标明重写某个方法）、`@Deprecated`（标明某个类或方法过时）和`@SuppressWarnings`（标明要忽略的警告）。

2. 元注解，元注解是用于定义注解的注解。

3. 自定义注解，可以根据自己的需求定义注解。

### 2.2、元注解

元注解是用于修饰注解的注解，通常用在注解的定义上。JAVA 中有以下几个元注解：

1. @Target：注解的作用目标，也就是指明，你的注解到底是用来修饰方法的？修饰类的？还是用来修饰字段属性的，有以下几种类型：

  - ElementType.TYPE：允许被修饰的注解作用在类、接口和枚举上
  - ElementType.FIELD：允许作用在属性字段上
  - ElementType.METHOD：允许作用在方法上
  - ElementType.PARAMETER：允许作用在方法参数上
  - ElementType.CONSTRUCTOR：允许作用在构造器上
  - ElementType.LOCAL_VARIABLE：允许作用在本地局部变量上
  - ElementType.ANNOTATION_TYPE：允许作用在注解上
  - ElementType.PACKAGE：允许作用在包上

2. @Retention：指定了被修饰的注解的生命周期，分以下三种类型：

  - RetentionPolicy.SOURCE：该注解只保留在一个源文件当中，当编译器将源文件编译成class文件时，它不会将源文件中定义的注解保留在class文件中。
  - RetentionPolicy.CLASS：该注解只保留在一个class文件当中，当加载class文件到内存时，虚拟机会将注解去掉，从而在程序中不能访问。
  - RetentionPolicy.RUNTIME：该注解在程序运行期间都会存在内存当中。此时，我们可以通过反射来获得定义在某个类上的所有注解。

3. @Documented：当我们执行 JavaDoc 文档打包时会被保存进 doc 文档，反之将在打包时丢弃。

4. @Inherited：解修饰的注解是具有可继承性的，也就说我们的注解修饰了一个类，而该类的子类将自动继承父类的该注解。

以 `@Override` 为例子：

![@Override 例子](https://cdn.nlark.com/yuque/0/2018/png/163217/1540130591987-c67a035a-7229-4b1d-874b-f5e46e17dded.png)

当编译器检测到某个方法被修饰了 `@Override` 注解，编译器就会检查当前方法的方法签名是否真正重写了父类的某个方法，也就是比较父类中是否具有一个同样的方法签名。

`@Override` 仅被编译器可知，编译器在对 java 文件进行编译成字节码的过程中，一旦检测到某个方法上被修饰了该注解，就会去匹对父类中是否具有一个同样方法签名的函数，否则不能通过编译。

### 2.3、注解解析方式

解析一个类或者方法的注解通常有两种形式，一种是编译期直接的扫描，一种是运行期反射。

#### 2.3.1、编译器的扫描

指的是编译器在对 java 代码编译字节码的过程中会检测到某个类或者方法被一些注解修饰，这时它就会对于这些注解进行某些处理。典型的就是注解 `@Override`，一旦编译器检测到某个方法被修饰了 `@Override` 注解，编译器就会检查当前方法的方法签名是否真正重写了父类的某个方法，也就是比较父类中是否具有一个同样的方法签名。

这一种情况只适用于那些编译器已经熟知的注解类，比如 JDK 内置的几个注解，而你自定义的注解，编译器是不知道你这个注解的作用的，

#### 2.3.1、运行期反射

首先对虚拟机的几个注解相关的属性表进行介绍，先大体了解注解在字节码文件中是如何存储的。虚拟机规范定义了一系列和注解相关的属性表，也就是说，无论是字段、方法或是类本身，如果被注解修饰了，就可以被写进字节码文件。属性表有以下几种：

- RuntimeVisibleAnnotations：运行时可见的注解
- RuntimeInVisibleAnnotations：运行时不可见的注解
- RuntimeVisibleParameterAnnotations：运行时可见的方法参数注解
- RuntimeInVisibleParameterAnnotations：运行时不可见的方法参数注解
- AnnotationDefault：注解类元素的默认值

`java.lang.reflect.AnnotatedElement` 接口是所有程序元素（Class、Method和Constructor）的父接口，程序通过反射获取了某个类的 AnnotatedElemen t对象之后，利用 Java 的反射机获取程序代码中的注解，然后根据预先设定的处理规则解析处理相关注解以达到主机本身设定的功能目标。

本质上来说，反射机制就是注解使用的核心，程序可以调用该对象的以下方法来访问 Annotation信息：

- getAnnotation：返回指定的注解
- isAnnotationPresent：判定当前元素是否被指定注解修饰
- getAnnotations：返回所有的注解
- getDeclaredAnnotation：返回本元素的指定注解
- getDeclaredAnnotations：返回本元素的所有注解，不包含父类继承而来的

## 3、源码解析

### 3.1、注解说明

以 `com.alipay.sofa.runtime.api.annotation.SofaReference` 为例子（SofaService 类似），源码如下：

![例子2](https://cdn.nlark.com/yuque/0/2018/png/163217/1540130625068-a828e0fa-d88a-4114-99a1-c897e8c0a066.png)

基于元注解的含义，可以了解到：

1. `@SofaReference` 生命周期为 RetentionPolicy.RUNTIME，代表永久保存，可以反射获取；

2. 注解的作用目标 ElementType.FIELD，ElementType.METHOD，说明允许作用在方法和属性字段上；

3. RPC 的绑定方式有 JVM、BOLT、REST 三种；

4. 默认服务绑定关系为 JVM 方式；

### 3.2、服务发布与引用解析

通过 `ServiceAnnotationBeanPostProcesso` 类中 `postProcessAfterInitialization`、`postProcessBeforeInitialization` 方法分别进行服务的发布和引用，其中通过反射对于注解的解析步骤大体相似，主要包含：

1. 获取 SofaService.class、SofaReference.class 指定注解

2. 获取的 SOFA 引用的类型，默认为 void

3. 获取的 SOFA 引用的 uniqueId

#### 3.2.1、总体流程

首先看下服务发布和引用整体流程图，主要包含注解解析、组件生成、组件注册几个步骤，后面对每个步骤进行更加详细的解释。

![服务发布和引用整体流程图](https://cdn.nlark.com/yuque/0/2018/png/163217/1540234052305-10698bc7-79c2-40cb-b47d-61847d1311eb.png)

#### 3.2.2、服务发布

`@SofaService` 的目标是将一个类注册到 SOFA Context 中。发布到 SofaRuntimeContext 的过程其实就是把服务组件对象塞到 `ConcurrentMap`_`<`_`ComponentName, ComponentInfo`_`> `_`registry` 对象中，当有其他地方需要查找服务组件的时候，可以通过 registry 进行查找。主要包含以下几个步骤：

1. 会遍历 SOFA 绑定关系，通过 handleSofaServiceBinding 方法进行不同类型的 RPC Binding。

2. 生成 ServiceComponent 服务组件对象。

3. 调用 ServiceComponent 服务组件的 register、resolve、activate方法，逐一调用对应 BindingAdapter 对外暴露服务。

4. 不同的 BindingAdapter，对应的 outBinding 服务处理策略不一样。对于 JvmBindingAdapter 直接返回空，因为服务不需要暴露给外部，当其他模块调用该服务，直接通过 registry 对象进行查找。其他 RPC BindingAdapter 则将服务信息推送到注册中心 Confreg。

5. 将 ServiceComponent 注册到 sofa 的上下文sofaRuntimeContext 中。

#### 3.2.3、服务引用

`@SofaReference` 的目标则是将 SOFA Context 中的一个服务注册成为 Spring 中的一个bean。基于以上注解解析基础上，主要通过 `ReferenceRegisterHelper.registerReference()` 方法从SOFA上下文中，拿到服务对应的代理对象。在 `registerReference()` 方法内部，主要包含以下操作：

1. 当注解的 `jvmFirst()` 为 true 时，会为服务自动再添加一个本地 JVM 的 binding，这样能够做到优先本地调用，避免跨机调用。

2. 生成 ReferenceComponent 服务组件对象。

3. 与 ServiceComponent 处理方式类似，ReferenceComponent 也会添加到 `ConcurrentMap`_`<`_`ComponentName, ComponentInfo`_`> `_`registry` 对象中，分别执行组件的register、resolve、activate 三个方法。其中 register、resolve 方法主要是改变组件的生命周期，代理对象的生成就是在 activate 方法中完成的。

4. ReferenceComponent 组件通过不同类型的 binding 生成不同类型的代理对象。如果只有一个binding，使用当前 binding 生成代理对象。如果有多个 binding，优先使用 jvm binding 来生成本地调用的代理对象，若本地代理对象不存在，使用远程代理对象。

5. 对于JvmBindingAdapter 的 inBinding 方法，直接借助于动态代理技术进行生成代理对象，对于 RpcBindingAdapter 的 inBinding，在构造的过程存在向注册中心订阅的逻辑。

## 4、总结

通过 XML 的方式去配置 SOFA 的 JVM 服务和引用非常简洁，但是多了一定的编码工作量。因此，除了通过 XML 方式发布 JVM 服务和引用之外，SOFA 还提供了 Annotation 的方式来发布和引用 JVM 服务。`@SofaService` 注解省去了 `<sofa:service>` 声明，但 bean 的定义还是必须要有的。SOFA 实际上是注册了一个BeanPostProcessor 来处理 `@SofaService` 和 `@SofaReference` 注解。 

需要发布引用的对象属于当前 bean 的实例变量，使用 xml 的方式进行服务发布和引用，可以直接通过 Bean 生命周期的 `InitializingBean#afterPropertiesSet` 方法进行扩展。在工程中注解扫描是一个对所有 bean 的操作，只能通过实现 spring 的 beanpostprocessor 这个接口，另外有些属性可能在发布时需要用到。因此使用注解的方式进行服务发布和引用，分别基于 Bean 生命周期的 `BeanPostProcessor#postProcessAfterInitialization`、`#postProcessBeforeInitialization`方法进行扩展。

对比服务的发布和引用的两种常用方式，XML 是一种集中式的元数据，与源代码无绑定，注解是一种分散式的元数据，与源代码紧绑定。SOFARPC 初始的版本，并不支持通过注解进行 RPC 服务的发布和引用，需要使用 XML 的方式进行配置。后来在开源 SOFARPC 版本中增加这个功能的注解支持，对服务发布和引用做了一个使用方式的补充，而对于 XML 与注解的优劣取舍，大家可以团队的规范和个人的评估进行相应的使用。

## 5、参考文档

1. [Java annotation](https://en.wikipedia.org/wiki/Java_annotation)

2. [SOFASTACK 服务发布/服务引用](http://www.sofastack.tech/sofa-rpc/docs/Publish-And-Reference)