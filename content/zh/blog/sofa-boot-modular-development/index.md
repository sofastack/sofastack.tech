---
author: "玄北"
date: 2018-07-21T12:12:34.000Z
title: "基于 SOFABoot 进行模块化开发"
tags: ["SOFABoot"]
description: "本文是对蚂蚁金服开源的 SOFABoot 模块化开发的介绍。"
aliases: "/posts/2018-07-21-01"
cover: "/cover.jpg"
categories: "SOFABoot"
---

SOFABoot 是蚂蚁金服中间件团队开源的基于 Spring Boot 的一个开发框架，SOFABoot 从 2.4.0 版本开始支持基于 Spring 上下文隔离的模块化开发能力，SOFABoot 模块除了包括 Java 代码外，还会包含 Spring 配置文件，每个 SOFABoot 模块都是独立的 Spring 上下文。

## 1. 背景

为了更好的理解 SOFABoot 模块化开发的概念，我们来区分几个常见的模块化形式：

- 基于代码组织上的模块化：这是最常见的形式，在开发期，将不同功能的代码放在不同 Java 工程下，在编译期被打进不同 jar 包，在运行期，所有 Java 类都在一个 classpath 下且使用同一个 Spring 上下文，没做任何隔离；
- 基于 Spring 上下文隔离的模块化：使用 Spring 上下文来做不同功能模块的隔离，在开发期和编译期，代码和配置也会分在不同 Java 工程中，但在运行期，不同的 Spring Bean 相互不可见，IoC 只在同一个上下文内部发生，但是所有的 Java 类还是在一个 ClassLoader 下；
- 基于 ClassLoader 隔离的模块化：借用 ClassLoader 来做隔离，每个模块都有独立的 ClassLoader，模块与模块之间的 classpath 不同，[SOFAArk](/blog/sofa-boot-class-isolation-deep-dive/) 就是这种模块化的实践方式。

以上三种模块化形式的隔离化程度逐次递进，但模块化就像一把双刃剑，在降低模块间耦合的同时也给模块间交互增加了成本，本文介绍第二种模块化形式 —— 基于 Spring 上下文隔离的模块化。

与基于代码组织上的模块化相比，每个 SOFABoot 模块不仅仅包括 Java 代码，还会包含 Spring 配置文件，这种全新的包组织方式大大降低了用户接入成本，用户只需要简单的引入 Jar 包即可，由 SOFABoot 框架负责刷新模块上下文，无需在原来 Spring 配置文件中新增任何 Bean 定义，简化了接入流程，降低了出错几率。

每个 SOFABoot 模块的 Spring 上下文都是隔离的。在 Spring 开发中，保证 Spring BeanId 不冲突是 Spring 运行的基础，这个限制在应用规模较小时很容易解决，只需用户在定义 BeanId 时稍加注意即可。但是随着系统规模越来越大，一个系统的开发往往涉及多个团队，保证每个业务定义 BeanId 不重复的成本也越来越高。在 SOFABoot 中，每个 SOFABoot 模块使用独立的 Spring 上下文，避免了不同 SOFABoot 模块间 BeanId 冲突，有效降低企业级多模块开发时团队间的沟通成本。

## 2. 基本原理

在介绍 SOFABoot 模块化开发使用之前，我们简单了解下其背后的实现原理。下图是应用运行时的逻辑视图：

![SOFABoot 模块化开发](https://gw.alipayobjects.com/zos/nemopainter_prod/f6372d29-cb2f-488f-a858-46f97a610e7c/sofastack-blog/resources-2018-07-2018-07-21-01-01.png)

SOFABoot 模块是模块化开发的最小单元，每个 SOFABoot 模块是一个独立的 Spring 上下文，在 SOFABoot 模块中我们可以定义 Bean、发布 RPC 服务、连接数据库等等。

由于上下文隔离，模块与模块之间的 Bean 无法通过 @Autowired 依赖注入，我们提供了 JVM Service/Reference 的方式进行模块间通信。SOFABoot 提供了两种形式的服务发布和引用，用于解决不同级别的模块间调用问题：

- JVM 服务发布和引用：解决一个 SOFABoot 应用内部各个 SOFABoot 模块之间的调用问题
- RPC 服务发布和引用：解决多个 SOFABoot 应用之间的远程调用问题

Spring Boot 应用在调用 SpringApplication.run 时会创建一个 Spring Context，我们把它叫做 Root Application Context，它是每个 SOFABoot 模块创建的 Spring Context 的 Parent。这样设计的目的是为了保证每个 SOFABoot 模块的 Spring Context 都能发现 Root Application Context 中创建的 Bean，这样当应用新增 Starter 时，不仅 Root Application Context 能够使用 Starter 中新增的 Bean，每个 SOFABoot 模块的 Spring Context 也能使用这些 Bean。

下面我们来演示如何开发一个简单的 SOFABoot 模块。

## 3. 编写 SOFABoot 模块

### 3.1 新建工程

DEMO [工程地址](https://github.com/caojie09/sofaboot-module-demo)

运行需要 JDK 6 及以上、 Maven 3.2.5 以上。

首先我们在 IDE 里新建一个普通 Maven 工程，并创建两个普通的 Maven 模块：

- service-facade: 定义服务接口
- service-provide: 演示新建 SOFABoot 模块并发布 JVM 服务

### 3.2 定义服务接口

service-facade 模块包含用于演示 SOFABoot 模块发布与引用服务接口:

```java
public interface SampleService {
    String message();
}
```

### 3.3 定义 SOFABoot 模块

service-provider 是一个 SOFABoot 模块，它会发布一个 JVM 服务供其他模块使用。首先需要为 service-provider 模块增加 sofa-module.properties 文件，将其定义为 SOFABoot 模块，sofa-module.properties 文件放置在 resources 目录:

```properties
Module-Name=com.alipay.sofa.service-provider
```

### 3.4 发布服务

SOFABoot 支持三种形式的服务发布，分别是： XML 方式、Annotation 方式以及 API 编码方式，这里演示的是 XML 方式发布服务。

首先增加 SampleServiceImpl 类，实现 SampleService 接口：

```java
public class SampleServiceImpl implements SampleService {
    private String message;

    public String message() {
        return message;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
```

增加 META-INF/spring/service-provide.xml 文件，将 SampleServiceImpl 发布为 JVM 服务:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:sofa="http://sofastack.io/schema/sofaboot"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
            http://sofastack.io/schema/sofaboot http://sofastack.io/schema/sofaboot.xsd"
       default-autowire="byName">
    <bean id="sampleService" class="com.alipay.sofa.isle.sample.SampleServiceImpl">
        <property name="message" value="Hello, SOFABoot module."/>
    </bean>

    <sofa:service ref="sampleService" interface="com.alipay.sofa.isle.sample.SampleService">
        <sofa:binding.jvm/>
    </sofa:service>
</beans>
```

到此为止，我们就成功新建了一个 SOFABoot 模块，并在模块中发布了一个 JVM 服务，可以看到，一个 SOFABoot 模块不仅仅包括代码，还包括 Spring 配置文件。

下面，我们演示下如何在 Spring Boot 工程中，快速集成 SOFABoot 的模块化开发能力，并使用刚刚新建的模块发布的服务。

## 4. Spring Boot 工程集成模块化开发组件

### 4.1 新建工程

Demo [工程地址](https://github.com/caojie09/sofaboot-module-run)

在 Spring Boot 官网 [https://start.spring.io](https://start.spring.io) 新建一个 web 工程，请选择 Spring Boot 版本号为 1.X，目前不支持 Spring Boot 2。修改 maven 项目的配置文件 pom.xml，将

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>1.5.14.RELEASE</version>
    <relativePath/> 
</parent>
```

替换为:

```xml
<parent>
    <groupId>com.alipay.sofa</groupId>
    <artifactId>sofaboot-dependencies</artifactId>
    <version>2.4.2</version>
</parent>
```

并添加如下依赖：

```xml
<dependency>
    <groupId>com.alipay.sofa</groupId>
    <artifactId>isle-sofa-boot-starter</artifactId>
</dependency>
```

这样，一个 Spring Boot 工程便集成了 SOFABoot 模块化开发能力。

### 4.2 添加 SOFABoot 模块

添加 SOFABoot 模块很简单，只需要把 SOFABoot 模块的坐标加在当前 maven 工程即可，对于这个例子，只需要在启动类模块添加上面创建的 service-provider 模块：

```xml
<dependency>
    <groupId>com.alipay.sofa</groupId>
    <artifactId>service-provide</artifactId>
    <version>1.0.0</version>
</dependency>
```

与传统的 JAR 包代码分发方式相比，SOFABoot 模块不仅仅包括代码，还包括 Spring 配置文件，用户在使用 SOFABoot 模块时，只需增加依赖即可。

### 4.3 引用服务

为了直观演示，我们在演示工程增加了一个 Rest 接口，在 Rest 接口中引用上文 SOFABoot 模块发布的 JVM 服务。这里演示的是 Annotation 方式引用服务，只需在类的字段上增加 @SofaReference 注解即可：

```java
@RestController
public class HelloController {
    @SofaReference
    private SampleService sampleService;

    @RequestMapping("/hello-sofamodule")
    public String hello() throws IOException {
        return sampleService.message();
    }
}
```

访问 <http://localhost:8080/hello-sofamodule> ，可以看到 HelloController 成功调用到了 service-provide 发布的服务。

## 5. 总结

本文主要介绍了使用 SOFABoot 进行上下文隔离的模块化开发，通过两个简单的用例工程，分别介绍了如何开发一个 SOFABoot 模块以及如何在 Spring Boot 快速集成模块化开发能力。每个 SOFABoot 模块都是独立的 Spring 上下文，SOFABoot 模块不仅仅包括代码，还包括 Spring 配置文件，用户在引用 SOFABoot 模块时，只需简单增加依赖即可，由框架负责刷新模块上下文，无需在 Spring 中新增任何 Bean 定义，简化了接入流程，降低了出错几率。
