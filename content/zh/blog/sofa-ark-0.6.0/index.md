---
title: "蚂蚁金服 SOFAArk 0.6.0 新特性介绍 | 模块化开发容器"
author: "善逝"
authorlink: "https://github.com/QilongZhang"
description: "本篇文章为 SOFAArk 0.6.0 的新特性介绍。"
categories: "SOFAArk"
tags: ["SOFAArk"]
date: 2019-03-20T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563883382891-ab2b2b2d-b13d-41dc-bb3c-42e1ffa336bf.png"
---

> **SOFAStack**
> **S**calable** O**pen **F**inancial  **A**rchitecture Stack 是蚂蚁金服自主研发的金融级分布式架构，包含了构建金融级云原生架构所需的各个组件，是在金融场景里锤炼出来的最佳实践。
> 
> 蚂蚁金服在 SOFAStack 体系内研发了一款基于 Java 实现的轻量级类隔离容器，主要提供类隔离和应用(模块)合并部署能力--SOFAArk。本篇文章为 SOFAArk 0.6.0 的新特性介绍。
> GitHub 地址：[https://github.com/alipay/sofa-ark](https://github.com/alipay/sofa-ark)

## 简介

在大型软件开发过程中，通常会推荐底层功能插件化、业务功能模块化的开发模式，以其达到低耦合、高内聚、功能复用的优点。基于此，SOFAArk 提供了一套较为规范化的插件化、模块化开发方案，产品能力主要包括：

- 定义插件开发规范，提供 Maven 打包工具，简单快速将多个二方包打包成插件（Ark Plugin，以下简称 Plugin）， 适用于将底层组件插件化输出，例如 RPC、富客户端等；
- 定义模块开发规范，提供 Maven 打包工具，简单快速将应用（Spring Boot/SOFABoot/普通 Java 应用）打包成模块 (Ark Biz，以下简称 Biz)，适用于将业务组件模块化输出，提升业务能力复用；
- 定义类加载模型，运行时 Plugin、Biz 之间均相互隔离，运行时由不同的 ClassLoader 加载，有效避免相互之间的包冲突，降低 Plugin 和 Biz 对运行环境的要求；
- 定义标准的编程界面，包括服务、事件、扩展点等机制，方便 Plugin、Biz 交互和扩展；
- 定义业务模块 (Biz) 生命周期，支持多 Biz 合并部署。开发阶段将多个 Biz 打包成 Executable Ark Jar 包(以下简称 Ark 包)，或者运行时使用 API 或配置中心(Zookeeper)动态地管理 Biz 安装和卸载，满足多应用合并部署及动态升级的需求。

基于以上能力，SOFAArk 可以帮助解决多应用(模块)合并部署、动态升级、依赖包冲突等场景问题。

## 场景

### 场景一：合并部署

复杂项目通常需要跨团队协作开发，各自负责不同的组件。协调跨团队合作开发会遇到不少问题：比如各自技术栈不统一导致的依赖冲突、往同一个 Git 仓库提交代码常常导致 merge 冲突、组件功能相互依赖影响测试进度。因此，如果能让每个团队将负责的功能组件当成一个个单独的应用开发和测试，运行时合并部署，那么将有助于提升开发效率及应用可扩展性。

SOFAArk 提出了一种特殊的包结构 -- Ark Biz，用户可以使用 Maven 插件将应用打包成 Biz，允许多 Biz 在 SOFAArk 容器之上合并部署，并通过统一的编程界面交互，如下：

![Ark Biz](https://cdn.nlark.com/yuque/0/2019/png/226702/1553048279009-dcd80828-177b-466b-89d4-4c3fddb04ca7.png)

Biz 对应用类型没有限制，可以是 Spring Boot/SOFABoot/Java 普通应用类型，Biz 之间采用统一的编程界面-[SOFA JVM服务](https://www.sofastack.tech/sofa-boot/docs/sofa-ark-ark-jvm)进行交互。发布和引用服务也非常简单，使用 API 或者 Spring 注解/XML 方式：

![发布和引用服务源码](https://cdn.nlark.com/yuque/0/2019/png/226702/1553048279015-030e16c6-c052-4000-8323-2e2c72062f24.png)

合并部署的形式，分为两种 -- 静态合并部署和动态合并部署。

#### 静态合并部署

在开发阶段，应用可以将其他应用打成的 Biz 包通过 Maven 依赖的方式引入，而当自身被打成 Ark 包时，会将引入的其他 Biz 包一并打入。通过 java -jar 启动 Ark 包时，则会根据优先级依次启动各 Biz，单个 Biz 使用独立的 BizClassLoader 加载，不需要考虑依赖包冲突问题，Biz 之间则通过 [SOFA JVM 服务](https://www.sofastack.tech/sofa-boot/docs/sofa-ark-ark-jvm)交互。

#### 动态合并部署

动态合并部署区别于静态合并部署最大的一点是，在运行时可以通过 API 或者配置中心（Zookeeper）来控制 Biz 的部署和卸载。动态合并部署的设计理念图如下：

![动态合并部署的设计理念图](https://cdn.nlark.com/yuque/0/2019/png/226702/1553048279020-5b152482-98eb-4897-a4e7-5d34afaafebc.png)

无论是静态抑或动态合并部署都有存在宿主应用 (master biz) 的概念，如果 Ark 包只打包了一个 Biz，则该 Biz 默认成为宿主应用；如果 Ark 包打包了多个 Biz 包，需要配置指定宿主应用。宿主 Biz 和其他 Biz 唯一不同在于，宿主 Biz 不允许被卸载。

一般而言，宿主应用会作为流量入口的中台系统，具体的服务实现会放在不同的动态 Biz 中，供宿主应用调用。宿主应用可以使用 SOFAArk 提供的客户端 API 实现动态应用的部署和卸载。除了 API， SOFAArk 提供了 Config Plugin，用于对接配置中心（目前支持 Zookeeper），运行时接受动态配置；Config Plugin 会解析下发的配置，控制动态应用的部署和卸载。

### 场景二：动态升级

SOFAArk 在蚂蚁内部也被用来解决动态升级的场景问题。有时候，因为业务迭代较快，应用依赖的某二方包需要频繁的变更，这将导致应用每次都因为升级二方包版本做变更发布，影响开发效率；而作为二方包的开发者，常常因为推动依赖方应用升级阻力较大，导致新特性无法按时上线，影响业务发展。

为了加快创新业务的迭代速度，会将需要频繁变更的二方包打包成 Biz 包，供其他应用依赖。作为依赖方，不会直接在 Pom 文件（假设是使用 Maven 构建）定义 Biz 包版本，而是通过配置中心（例如 Zookeeper）下发配置。如此，当应用启动时，会拉取 Biz 版本配置信息，进而拉取正确版本的 Biz 包并启动。如此，当需要依赖方升级 Biz 版本时，只需要在配置中心重新推送配置即可。

### 场景三：依赖隔离

日常使用 Java 开发，常常会遇到包依赖冲突的问题，尤其当应用变得臃肿庞大，包冲突的问题也会变得更加棘手，导致各种各样的报错，例如 LinkageError, NoSuchMethodError 等。实际开发中，可以采用多种方法来解决包冲突问题，比较常见的是类似 Spring Boot 的做法：统一管理应用所有依赖包的版本，保证这些三方包不存在依赖冲突。这种做法只能有效避免包冲突问题，不能根本上解决包冲突的问题。如果某个应用的确需要在运行时使用两个相互冲突的包，例如 protobuf2 和 protobuf3，那么类似 Spring Boot 的做法依然解决不了问题。

为了彻底解决包冲突的问题，需要借助类隔离机制，使用不同的 ClassLoader 加载不同版本的三方依赖，进而隔离包冲突问题。 OSGi 作为业内最出名的类隔离框架，自然是可以被用于解决上述包冲突问题，但是 OSGi 框架门槛较高，功能繁杂。为了解决包冲突问题，引入 OSGi 框架，有牛刀杀鸡之嫌，反而使工程变得更加复杂，不利于开发。

SOFAArk 采用轻量级的类隔离方案来解决日常经常遇到的包冲突问题，在蚂蚁金服内部服务于整个 SOFABoot 技术体系，弥补 Spring Boot 没有的类隔离能力。SOFAArk 提出了一种特殊的包结构 -- Ark Plugin，在遇到包冲突时，用户可以使用 Maven 插件将若干冲突包打包成 Plugin，运行时由独立的 PluginClassLoader 加载，从而解决包冲突。

假设如下场景，如果工程需要引入两个三方包：A 和 B，但是 A 需要依赖版本号为 0.1 的 C 包，而恰好 B 需要依赖版本号为 0.2 的 C 包，且 C 包的这两个版本无法兼容：

![包冲突问题解决方案](https://cdn.nlark.com/yuque/0/2019/png/226702/1553048279033-e8f37332-42b7-473e-86b2-4efef82802df.png)

此时，即可使用 SOFAArk 解决该依赖冲突问题：只需要把 A 和版本为 0.1 的 C 包一起打包成一个 Ark 插件，然后让应用工程引入该插件依赖即可。

不仅仅是在出现依赖包冲突时，可以通过打包 Ark Plugin 解决，对于复杂的底层组件，例如 RPC 组件，为了防止它和依赖方应用存在包冲突，常会将 RPC 或其他中间件组件单独打成 Plugin 输出。

其次，Ark Plugin 也被用于扩展 SOFAArk 容器能力，例如 runtime-sofa-boot-plugin 用于提供 [SOFA JVM 服务](https://www.sofastack.tech/sofa-boot/docs/sofa-ark-ark-jvm)通信能力; web-ark-plugin 用于提供多 web 应用合并部署能力等。

## 原理

在介绍完 SOFAArk 的使用场景之后，我们简单介绍其类加载模型。SOFAArk 包含三个概念，Ark Container, Ark Plugin 和 Ark Biz; 运行时逻辑结构图如下:

![SOFAArk 运行逻辑结构图](https://cdn.nlark.com/yuque/0/2019/png/226702/1553048279031-76fb0245-0f12-4478-bc0a-aad77c9396a9.png)

在介绍这三个概念之前，先介绍 Executable Ark Jar 包概念：Ark 包是 SOFAArk 定义的特殊格式的可执行 Jar 包。SOFAArk 提供的 Maven 插件 sofa-ark-maven-plugin 可以将单个或多个 Biz打包成 Ark 包，使用 java -jar命令即可在 SOFAArk 容器之上启动所有应用。Ark 包通常包含 Ark Container、Ark Plugin 和 Ark Biz。下面是一个简单的 Ark 包工程目录：

![Ark 包工程目录](https://cdn.nlark.com/yuque/0/2019/png/226702/1553048279029-4e454efe-8e63-473d-9505-5a74a567543d.png)

可以很直观的看到 Ark Container、Ark Plugin 和 Ark Biz 在 Ark 包的组织形式中。针对这三个概念我们简单做下名词解释：

- Ark Container: SOFAArk 容器，负责 Ark 包启动运行时的管理。Plugin 和 Biz 运行在 SOFAArk 容器之上，容器具备管理插件和应用的功能，容器启动成功后会自动解析 classpath 包含的 Plugin 和 Biz 依赖，完成隔离加载并按优先级依次启动。
- Ark Plugin: SOFAArk 定义的特定目录格式的 Fat Jar，使用 Maven 插件 sofa-ark-plugin-maven-plugin 可以将多个二方包打包成一个 Plugin 对外插件化输出。Plugin 会包含一份配置文件，通常包括插件类导入导出配置、资源导入导出配置、插件启动优先级等；运行时，SOFAArk 容器会使用独立的 PluginClassLoader 加载插件，并根据插件配置构建类加载索引表、资源加载索引表。插件和插件之间、插件和应用之间相互隔离。
- Ark Biz: SOFAArk 定义的特定目录格式的 Fat Jar，使用 Maven 插件 sofa-ark-maven-plugin 可以将应用打包成 Biz 包。Biz 是工程应用以及其依赖包的组织单元，包含应用启动所需的所有依赖和配置。一个 Ark 包中可以包含多个 Biz 包，按优先级依次启动，Biz 之间通过 [SOFA JVM 服务](https://www.sofastack.tech/sofa-boot/docs/sofa-ark-ark-jvm) 交互。

启动 Ark 包，Ark Container 优先启动，容器运行时自动解析 Ark 包中包含 Plugin 和 Biz，并读取他们的配置信息，构建类和资源的加载索引表；然后使用独立的 ClassLoader 加载并按优先级配置依次启动。需要指出的是，Plugin 优先 Biz 被加载启动。

SOFAArk 内部的类加载模型相对比较简单，Plugin 之间是双向类索引关系，即可以相互委托对方加载所需的类和资源；Plugin 和 Biz 是单向类索引关系，即只允许 Biz 索引 Plugin 加载的类和资源，反之则不允许。

## 总结

SOFAArk 定义了一套相对简单的类加载模型，并结合特殊的打包格式、统一的编程界面、易扩展的插件机制，从而提供了一套较为规范化的插件化、模块化的开发方案。更多内容可以参考[官方文档](https://www.sofastack.tech/sofa-boot/docs/sofa-ark-readme)。