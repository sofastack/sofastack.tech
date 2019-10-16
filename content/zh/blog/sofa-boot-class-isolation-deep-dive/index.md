---
author: 善逝
date: 2018-06-04T10:12:34.000Z
title: "SOFABoot 类隔离原理剖析"
categories: "SOFABoot"
tags: ["SOFAArk","SOFABoot"]
aliases: "/posts/2018-06-04-01"
description: "本文将介绍 SOFABoot 类隔离组件 SOFAArk 的实现原理。"
cover: "/cover.jpg"
---

SOFABoot 是蚂蚁金服中间件团队开源的基于 Spring Boot 的一个开发框架，其在 Spring Boot 基础能力之上，增加了类隔离能力，以更好地解决随着工程应用变得臃肿庞大后带来的包冲突问题。类隔离能力天生带来模块化能力，同样给协作开发带来便利。

SOFABoot 的类隔离能力借助单独的组件 SOFAArk 实现，遵循 Spring Boot 依赖即服务的思想，只要工程中引入了 SOFAArk 组件依赖，类隔离能力即生效。

在上一篇文章 [《在 Spring Boot 中集成 SOFABoot 类隔离能力》](https://zhuanlan.zhihu.com/p/36909393)中，我们详细介绍了 SOFABoot 类隔离能力的使用背景及其使用方式。本文将介绍 SOFABoot 类隔离组件 SOFAArk 的实现原理。

## 理解 SOFAArk 三要素

SOFAArk 类隔离框架定义了三个概念，Ark Container，Ark Plugin，Ark Biz。

在介绍这三个主角之前，我们先来介绍另一个管家：Ark 包。我们都知道一个标准的 Spring Boot 应用可以借助 Spring 官方提供的打包插件：

```xml
<plugin>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-maven-plugin</artifactId>
</plugin>
```

将应用打包成一个可执行 FatJar。相对应的，Ark 包则是 SOFABoot 官方提供的打包插件：

```xml
<plugin>
    <groupId>com.alipay.sofa</groupId>
    <artifactId>sofa-ark-maven-plugin</artifactId>
</plugin>
```

将应用打包成一个具有类隔离能力的可执行 FatJar，称之为 Ark 包。下图是粗略地对比两者的目录结构差别：

![SOFABoot](https://gw.alipayobjects.com/zos/nemopainter_prod/1ee50e1e-931a-4959-bc79-42f26814e1f0/sofastack-blog/resources-2018-06-2018-06-04-01-01.png)

可以看到 Ark 包作为应用部署包的分发格式，它包含有 Ark Container，Ark Plugin 和 Ark Biz 三种格式模块。这里我们不对 Ark 包或者其他格式模块的目录结构作分析，感兴趣的同学可以点开文末附上的相关链接。我们重点介绍这三个角色的功能。

- Ark Container: Ark 容器，是组件 SOFAArk 的核心，运行 Ark 包时，Ark 容器会最先启动，负责应用运行时的管理，主要包括构建 Ark Plugin 和 Ark Biz 的类导入导出关系表、启动并初始化 Ark Plugin 和 Ark Biz、管理 Ark Plugin 服务的发布和引用等等。
- Ark Plugin: SOFAArk 定义的一种模块格式，由若干个 Jar 包组成的一个 FatJar，开发人员可以借助官方提供的 maven 打包插件将若干 Jar 包打包成一个 Ark Plugin 供应用依赖。运行时，由独立的类加载器加载，因此有隔离需求的 Jar 包建议打包成 Ark Plugin 供应用依赖。
- Ark Biz: SOFAArk 定义的一种模块格式，是应用及其依赖的所有三方包组成的一个 FatJar，需要注意的是，Ark Biz 不会包含应用依赖的 Ark Plugin。运行时，Ark Biz由独立的类加载器加载，借助类导入导出关系表，Ark Biz 可以使用 Ark Plugin 的导出类和资源。

## SOFAArk 运行时隔离

根据上一节的描述可以知道 SOFABoot 类隔离关键是理解 SOFAArk 定义的三个概念，Ark Container，Ark Plugin 和 Ark Biz。下图表示的是应用启动后，运行时 Ark Container，Ark Plugin，Ark Biz 的逻辑分层图：

![SOFAArk 运行时](https://gw.alipayobjects.com/zos/nemopainter_prod/60584df6-4359-45d0-8e7d-c7088119001e/sofastack-blog/resources-2018-06-2018-06-04-01-02.png)

我们将先以 Ark Plugin 入手来介绍 SOFABoot 类隔离的实现原理。

## Ark Plugin 隔离

开发者借助 SOFABoot 官方提供的插件：

```xml
<plugin>
    <groupId>com.alipay.sofa</groupId>
    <artifactId>sofa-ark-plugin-maven-plugin</artifactId>
</plugin>
```

可以将 Java 模块打包成一个 Ark Plugin，这里我们不讨论该打包插件的配置参数和使用方式，感兴趣的同学可以点开文末附上的相关链接以及学习 SOFABoot 类隔离能力使用篇。只需要知道，Ark Plugin 主要包含元信息有：插件启动器、导出类、导入类、导出资源、导入资源、优先级等，这些元信息保存在 Ark Plugin 中的 META-INF/MANIFEST.MF 中，一份典型的 MANIFEST.MF 文件样式如下：

```manifest
Manifest-Version: 1.0
groupId: com.alipay.sofa
artifactId: sample-ark-plugin
version: 0.3.0-SNAPSHOT
priority: 1000
pluginName: sample-ark-plugin
activator: com.alipay.sofa.ark.sample.activator.SamplePluginActivator
import-packages: 
import-classes: 
import-resources: 
export-packages: com.alipay.sofa.ark.sample.common.*,com.alipay.sofa.ark.sample
export-classes: com.alipay.sofa.ark.sample.facade.SamplePluginService
export-resources: Sample_Resource_Exported
```

在上面我们提到，运行 Ark 包时，类隔离容器 Ark Container 会最先启动，然后 Ark Container 会接管整个应用的启动过程。针对 Ark Plugin 处理逻辑如下：

- 首先解析 Ark 包中引入的所有 Ark Plugin，读取插件元信息，构建类/资源导入导出关系索引表。
- 提前生成所有插件类加载器，每个 Ark Plugin 都使用独立的类加载器，管理插件类加载逻辑，借助第一步生成的类导入导出关系表，突破 Java 原生的双亲委派模型，可以委托其他插件加载所需类，构建一个类 OSGi 的网状类加载模型。
- 根据插件优先级，依次调用插件启动器。在插件启动器中，插件开发者可以向容器注册服务以方便其他插件引用，也可以引用其他插件发布的服务，及插件启动所需的初始化操作。

需要明确一点，为了让类加载模型足够简单，Ark 容器在启动任何插件前，会把所有的插件类加载器提前构建完毕。Ark Plugin 可以相互委托加载，插件优先级只是影响插件的启动顺序，而且也不强制要求每个 Ark Plugin 都要有启动器。

启动完所有插件后，Ark Container 则开始负责启动 Ark Biz 模块。

## Ark Biz 隔离

Ark Container 在完成 Ark Plugin 的隔离和启动后，则开始准备 Ark Biz 的隔离和启动。

在上文中提到，应用打成 Ark 包后，Ark 包会包含 Ark Plugin 模块和 Ark Biz 模块。实际上 Ark Biz 其实就是应用及其所有的三方依赖打成的 FatJar 包，Ark Biz 不会包含应用引入的 Ark Plugin。开发者借助 SOFABoot 官方提供的插件：

```xml
<plugin>
    <groupId>com.alipay.sofa</groupId>
    <artifactId>sofa-ark-maven-plugin</artifactId>
</plugin>
```

可以将 Java（Spring Boot） 应用打包成一个 Ark Biz，这里我们不讨论该打包插件的配置参数和使用方式，感兴趣的同学可以点开文末附上的相关链接以及学习 SOFABoot 类隔离能力使用篇。只需要知道，Ark Biz 主要包含元信息有：应用启动入口、禁止导入类、禁止导入资源等。这些元信息保存在 Ark Biz 中的 META-INF/MANIFEST.MF 中，一份典型的 MANIFEST.MF 文件样式如下：

```manifest
Manifest-Version: 1.0
Archiver-Version: Plexus Archiver
Created-By: Apache Maven 3.2.5
Build-Jdk: 1.8.0_101
Built-By: qilong.zql
Ark-Biz-Name: sofa-ark-sample-springboot-ark
deny-import-resources:
deny-import-packages:
deny-import-classes:
Main-Class: com.alipay.sofa.ark.sample.springbootdemo.SpringbootDemoApplication
```

Ark Biz 和 Ark Plugin 有很大的不同，最明显的则是 Ark Biz 单向依赖 Ark Plugin，即 Ark Biz 只能单向委托 Ark Plugin 加载类和资源，反之则不可以。实际上在运行时，Ark Biz 是运行在 Ark Plugin 之上，Ark Container也是先启动所有 Ark Plugin 然后启动 Ark Biz。默认情况下，Ark Plugin 导出的所有类和资源都能被 Ark Biz 委托加载到，为了方便应用开发者能够自主控制类加载逻辑，允许在打包插件中配置禁止导入类和禁止导入资源，如此，对于配置的类和资源， Ark Biz 能够优先加载内部包含的类，而不会委托给 Ark Plugin 加载。Ark Container 针对 Ark Biz 处理逻辑如下：

- 首先解析 Ark 包中 Ark Biz 模块，读取元信息，构建类/资源导入导出关系索引表。
- 生成 Ark Biz 类加载器，管理 Ark Biz 类加载逻辑，借助第一步生成的类导入导出关系表，突破 Java 原生的双亲委派模型，可以委托 Ark Plugin 加载所需类和资源。
- 调用应用启动入口，启动应用。

如此，Ark 包即完成整个启动过程。

## 和 OSGi 对比

作为开源界早负盛名的动态模块系统，基于 OSGi 规范的 Equinox、Felix 等同样具备类隔离能力，然而他们更多强调的是一种编程模型，面向模块化开发，有一整套模块生命周期的管理，定义模块通信机制以及复杂的类加载模型。作为专注于解决依赖冲突的隔离框架，SOFAArk 专注于类隔离，简化了类加载模型，因此显得更加轻量。

其次在 OSGi 规范中，所有的模块定义成 Bundle 形式，作为应用开发者，他需要了解 OSGi 背后的工作原理，对开发者要求比较高。在 SOFAArk 中，定义了两层模块类型，Ark Plugin 和 Ark Biz，应用开发者只需要添加隔离的 Ark Plugin 依赖，对本身的开发没有任何影响，基本没有开发门槛。

## 正在做的事

全文读下来，读者可能会产生这样的一个疑惑：如果在应用中引入其他应用打包的 Ark Biz 会如何呢？

目前 SOFAArk 是可以启动多个 Ark Biz 的，比较遗憾的是，现在 Ark Biz 之间没法做到服务通信。如果你之前读完过上一篇 SOFABoot 类隔离使用篇及这篇原理篇，你也许会发现，虽然 SOFAArk 是一个纯粹的类隔离框架，但是基于 SOFAArk 之上，可以开发各具功能特色的 Ark Plugin，补充框架能力，供应用开发者按需依赖使用，比如已经推出的 SOFARPC Ark Plugin。回到上面的问题，为了解决多个 Ark Biz 合并部署的问题，我们正在开发一个新的 Ark Plugin，Jarslink2.0。

在蚂蚁内部，多个应用合并部署在同一个 JVM 之上，是一件常见的事情。这样带来的主要优势如下：

- 无关应用合并部署：有些应用在独立部署时，相互之间没有服务依赖，而且这些应用承担业务体量都偏小，单独占有一台物理机部署比较浪费资源。这些应用合并部署，能够节省成本。
- 相关应用合并部署：多个应用之间存在服务依赖，独立部署时，各应用之间使用 RPC 调用，虽然使用了分布式架构，稳定性高，但依然存在网络抖动导致的延时性问题。这些应用合并部署，RPC 调用转为JVM内部调用，缩减调用开销。 当然，作为蚂蚁内部非常重要的一项技术创新，合并部署在特定的业务背景下有着更为重要的意义，也远不止上面提到的两点优势，比如故障的隔离等等。

说回到 Jarslink2.0，这个 SOFABoot 官方开发的 Ark Plugin，主要是为了解决多个 Ark Biz 运行时管理问题。我们知道，每个 Java(Spring Boot) 应用，都可以通过我们的 maven 插件打包成 Ark Biz 供其他应用依赖。目前 SOFAArk 框架只能做到隔离 Ark Biz，作为框架能力的补充，Jarslink2.0 插件专门管理多个 Ark Biz 的运行时。这里默认每个 Ark Biz 都是一个 SOAFBoot/Spring Boot 工程，Jarslink2.0 提供的能力如下：

- 动态安装、卸载 Ark Biz。
- Ark Biz 之间使用注解和 xml 两种形式发布和引用 jvm 服务，解决多 Ark Biz 服务依赖问题。
- Ark Biz 如果使用了 SOFARPC 能力，可以自动完成 RPC 转 JVM 内部调用。

在这里特别感谢方腾飞， 蚂蚁内部花名 @清英 ，也是我们熟知的并发编程网([http://ifeve.com/](http://ifeve.com/))创始人。清英在蚂蚁内部开发的 Jarslink1.0 在网商银行已经落地使用很长一段时间，Jarslink2.0 是在 Jarslink1.0 基础之上，结合 SOFABoot 类隔离框架，提供了更加通用的应用(模块)隔离和通信的实现方案，敬请期待！

## 相关传送门

- SOFABoot 类隔离使用篇：<https://zhuanlan.zhihu.com/p/36909393>
- SOFAStack 知乎专栏：<https://zhuanlan.zhihu.com/sofastack>
