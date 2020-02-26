---
title: "从一个例子开始体验轻量级类隔离容器 SOFAArk | SOFAChannel#11 直播整理"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "本文根据 SOFAChannel#11 直播分享整理。"
categories: "SOFAArk"
tags: ["SOFAArk","SOFAChannel"]
date: 2020-02-26T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1579428984201-7e413fcb-3741-4475-aebf-2172706aac39.jpeg"
---

> <SOFA:Channel/>，有趣实用的分布式架构频道。
> 
> 本文根据 SOFAChannel#11 直播分享整理，主题：从一个例子开始体验轻量级类隔离容器 SOFAArk。
> 回顾视频以及 PPT 查看地址见文末。欢迎加入直播互动钉钉群：23372465，不错过每场直播。

![SOFAChannel#11](https://cdn.nlark.com/yuque/0/2020/png/226702/1582616549443-7a6bf44f-302e-43e5-a302-5d077031a4d4.png)

大家好，我是玄北，SOFAArk 开源负责人，今天跟大家分享的主题是《从一个例子开始体验轻量级类隔离容器 SOFAArk》，会跟大家一起解读 SOFAArk ，也会讲解一个 Demo 案例，希望大家可以跟我一起实际操作，体验 SOFAArk 具体操作以及功能实现。

SOFAArk：[https://github.com/sofastack/sofa-ark](https://github.com/sofastack/sofa-ark)

今天的分享将从一下面三个方面展开：

- 初识 SOFAArk；
- 组件运行时；
- 动手实践；

今天的重点是最后一个部分的动手实践，前面两部分会跟大家简单介绍一下 SOFAArk 的基础概念，希望在最后一个实践部分，大家可以跟着我一起通过 Demo 实际操作体验 SOFAArk，也可以在实践过程中帮助大家更好得了解前面介绍到的概念。

## 一、初识 SOFAArk

现在我们就开始了解 SOFAArk，在实践之前，我们先来了解一下什么是 SOFAArk。SOFAArk 是蚂蚁金服开源的一款基于 Java 实现的轻量级类隔离容器，欢迎大家关注并 Star SOFAArk。

SOFAArk：[https://github.com/sofastack/sofa-ark](https://github.com/sofastack/sofa-ark)

在大型软件开发过程中，通常会推荐底层功能插件化，业务功能模块化的开发模式，以期达到低耦合、高内聚、功能复用的优点。基于此，SOFAArk 提供了一套较为规范化的插件化、模块化的开发方案。产品能力主要包括：

- 定义类加载模型，运行时底层插件、业务应用(模块)之间均相互隔离，单一插件和应用(模块)由不同的 ClassLoader 加载，可以有效避免相互之间的包冲突，提升插件和模块功能复用能力；
- 定义插件开发规范，提供 maven 打包工具，简单快速将多个二方包打包成插件（Ark Plugin，以下简称 Plugin）；
- 定义模块开发规范，提供 maven 打包工具，简单快速将应用打包成模块 (Ark Biz，以下简称 Biz)；
- 针对 Plugin、Biz 提供标准的编程界面，包括服务、事件、扩展点等机制；
- 支持多 Biz 的合并部署，开发阶段将多个 Biz 打包成可执行 Fat Jar，或者运行时使用 API 或配置中心(Zookeeper)动态地安装卸载 Biz；

SOFAArk 可以帮助解决依赖包冲突、多应用(模块)合并部署等场景问题。

SOFAArk 中有三个最主要的概念，分别是 Ark 包、Ark Biz 包、Ark Plugin 包：

![SOFAArk 三要素](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1582616549485-f61b3960-9f5b-4429-8de9-154c7e5f2e34.jpeg)

Ark 包：类似 Spring Boot 的打包产物，是一个 Fat Jar，即应用交付终态，一个 Ark 包，可以通过 Java-jar 的方式把它运行起来。

Ark Biz 包: 简称 Biz，是组件的交付终态，大家通过名字也可以理解，里面主要封装了一些业务逻辑。

Ark Plugin 包: 简称 Plugin，提供把非业务基础组件下沉的能力，比如 RPC、消息等。

接下来按照上述三个的顺序，我们来看一下这三个包里主要是什么。

### Ark 包目录结构

下图是 **Ark 包的目录结构**，Ark 包下有 Biz 目录，Container 目录，Plugin 目录，Biz 目录中就是一个一个的 Ark Biz，Plugin 目录保存了所有的 Ark Plugin，Container 是 Ark 容器，Ark 容器会负责启动 Ark Plugin 及 Ark Biz。

![Ark 包目录结构](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1582616549438-120ec36e-969b-40f5-833e-6553e733bb6b.jpeg)

### Ark Biz 包目录格式

介绍完 Ark 包的目录格式，接下来介绍 Ark Biz 包的格式：

![Biz 包目录结构](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1582616549452-5a6de047-20ac-447c-98e7-666cd4d37bba.jpeg)

在 Ark Biz 包的目录格式里同样有几个比较关键的目录格式，分别是：

- application.properties：标准 Spring Boot/SOFABoot 工程配置文件；
- lib 目录：应用依赖目录；
- META-INF/MANIFEST：Biz 配置文件。

### Ark Plugin 包目录结构

接下来跟大家介绍 **Ark Plugin 包，**Ark Plugin 包的目录结构与 Ark Biz 包的目录结构类似，但是 Ark Plugin 包的 META-INF/MANIFEST.MF 文件会比 Ark Biz 包复杂一点，Ark Plugin 支持在 META-INF/MANIFEST.MF 文件中定义 Import package、Export package、Import classes 以及 Export classes 等属性，这些属性支持 Plugin ClassLoader 在加载类或者资源文件时可以委托给其他 Plugin 加载。

![Plugin 包目录结构](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1582616549444-9d0c9877-9b4a-4060-bf03-9af2cf21fed3.jpeg)

上文介绍了 Ark 包、Ark Biz 包、Ark Plugin 包的目录结构，接下来我们介绍下 Ark 包运行时的整个运行时结构。通过下面这张图我们可以看到，在整个运行时，Ark 包分为三层，底层是 Ark Container，中间层是 Ark Plugin，上层是 Ark Biz。Ark Container 负责启动所有 Ark Plugin 及 Ark Biz，Ark Plugin 支持类导入导出能力，所以 Ark Plugin 之间有双向箭头相互委托。为了简化 Ark Biz 的使用，Ark Biz 不支持导入导出类，Ark Biz默认会导入所有 Ark Plugin 的类。

![Ark 包运行时结构](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1582616549454-9d47eea6-7d16-419b-945c-d2ef66e3416a.jpeg)

SOFAArk 的不同 Plugin 相互委托类加载的能力可以帮助我们解决一个文件场景，那就是依赖冲突：

![依赖冲突](https://cdn.nlark.com/yuque/0/2020/png/226702/1582616549491-1185eaa1-b7f2-425e-8981-8223a983dbd9.png)

以上图的场景为例，有一个 Project，依赖了 Dependency A 以及 Dependency B，这两个依赖依赖了不同版本的 Hessian，Dependency A 依赖了 Hessian 3，Dependency B 依赖了 Hessian 4，Hessian 3 与 Hessian 4 是不兼容的，会出现冲突，那么要如何解决这个问题呢？

SOFAArk 就给出了一个解决方案。如果我们的 Dependency A 跟 Dependency B 的 Hessian 依赖有冲突的话，我们可以把 Dependency A 作为一个整体打包成一个 Ark Plugin， Dependency B 作为一个整体打包成一个 Ark Plugin，每个 Ark plugin 都是一个单独的 Classloader，这样 Dependency A 使用的 Hessian 3 和 Dependency B 使用的 Hessian 4 将不再冲突。

解决依赖冲突是 SOFAArk 的一个主要使用场景，但是今天我们不详细介绍这个场景，今天主要介绍 SOFAArk 的另一个能力，即组件运行时能力。

## 二、组件运行时

组件运行时提供了一种能力，它能够在不重启应用的前提下，通过动态安装、卸载、切换 Biz 模块，实现修改应用运行方式的目的。下图展示了组件运行时的运行时结构，整个运行时结构与上文的 Ark 包运行时结构很相似，不同的是我们扩展了 Ark Biz 的类型，在组件运行时结构中，Ark Biz 有两种类型，分别是 Master App Biz 和 Dynamic Biz。 Master App Biz 我们把他叫做宿主应用，不可动态安装、卸载，Dynamic Biz 就是动态模块，可以在运行时进行动态安装、卸载。

![组件运行时](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1582616549463-255eb09f-a2c6-498b-b36f-f09f735c8b56.jpeg)

在动态安装、卸载组件的过程中，SOFAArk 提供了丰富的生命周期管理：

![SOFAArk 生命周期管理](https://cdn.nlark.com/yuque/0/2020/png/226702/1582616550281-0884cec9-a2ac-4690-9e10-50f02249813b.png)

安装一个 Biz 主要需要经过：解析模块-注册模块-启动模块-健康检查-切换状态，其中任何一个步骤失败，都会导致 Biz 安装失败。

卸载模块的时候也会有一些流程，首先需要把它切换成 deactivated - 关闭 applicationcontext - 注销 JVM 服务 - 发送卸载事件 - 清楚缓存 - 切换 unresolved。

不同的模块并不是孤岛，模块与模块之间肯定需要通信。下面来介绍一下模块之间是如何通信的。两个 Ark Biz 之间可以通过 JVM、RPC/Dubbo/Rest、扩展点进行通信。这样每个模块可以互相感知其他模块。

![幻灯片14.jpeg](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1582616550380-b1d0a8d3-7e7b-4eba-a91c-01187f69864c.jpeg)

例如左边的 Biz 是一个宿主 Biz，右边这个 Biz 是一个动态 Biz，宿主 Biz 去调用动态 Biz 的服务，如果这个动态 Biz 有 bug 需要修复时，我们可以不重启宿主 Biz，而是通过给他装一个新版本动态 Biz 解决。

## 三、动手实践

前面带大家快速介绍了 SOFAArk 中的基础概念以及组件运行时中的基础概念，接下来我们来动手实践操作一下组件运行时的使用。

![动手实践](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1582616550366-b5db0878-93e5-4a46-9214-0aa6d1611f16.jpeg)

这里先介绍一下今天要演示的场景，如上图，Scene 1 中主管觉得现在商品的列表展示毫无规则，需要修改算法，常规来说如果修改算法的话，一般需要重启应用，这样就显得比较繁重。Scene 2 中主管同样觉得需要修改算法，不过此时我们使用了 SOFAArk 的组件运行时能力，可以做到不重启应用修改算法的目的。

最终实现的效果就是在默认情况下，应用启动是如下图这样的排列顺序：

![实现效果](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1582616550393-b90660c1-375d-480c-8dd0-14df75573834.jpeg)

在实践完成之后，我们安装了新的模块之后，它的排序顺序会发生变化，如下图所示：

![实验结果](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1582616550375-7d6c59de-b0c2-41d4-a1fe-82cfdcc81194.jpeg)

这就是我们今天主要要实现的效果，接下来我们就进入 Demo 实践，进行一步步操作，带大家更好地了解 SOFAArk 组件运行时。

本期的实验内容是通过 [SOFAArk](https://github.com/sofastack/sofa-ark) 提供的动态模块能力，实现商品列表排序策略的动态变更。通过在不重启宿主机，不更改应用配置的情况下实现应用行为的改变。

目前我们已经将 Demo 工程上传到 Github，大家可以跟着 README 一步步操作即可看到最终效果。
Demo：[https://github.com/caojie09/sofachannel-demo](https://github.com/caojie09/sofachannel-demo)

## 总结

以上就是我们本期 SOFAChannel 的全部分享内容，本次分享首先带大家快速了解了 SOFAArk 中比较重要的三个基础知识点，分别是 Ark 包、Ark Biz 包以及 Ark Plugin 包。在了解了 SOFAArk 基础知识点之后又带大家熟悉了 SOFAArk 组件运行时概念以及 SOFAArk 组件运行时需要解决的问题。最后通过一个实操例子，帮助大家快速上手 SOFAArk 组件运行时。

有任何问题，欢迎留言或在 Github 上与我们交流。

SOFAArk：[https://github.com/sofastack/sofa-ark](https://github.com/sofastack/sofa-ark)

### 本期视频回顾以及 PPT 查看地址

[https://tech.antfin.com/community/live/1076](https://tech.antfin.com/community/live/1076)

### 本期直播 QA 回顾

#### @鸿关 Q1：

> 用 SOFAArk 的话，能直接集成到 SOFABoot 工程不？还是说必须要建个 SOFAArk 的工程？SOFAArk 可以运用于非 SOFABoot 的项目么？

A： 能直接集成到 SOFABoot 工程，不需要新建 SOFAArk 工程，也可以用于非 SOFABoot 工程，只要是 Spring Boot 工程即可，但是不引入 SOFA 相关依赖的话，@SofaService 及 @SofaReference 等注解就没法用了。

> 宿主包刚开始是指定的1.0版本，如果我线上我已经升到2.0的版本，万一线上机器挂掉重启，那我的算法都变了吧，就有问题。

A：这个需要进行一些集群管理，重启的时候自动安装模块，目前我们开源了 [sofa-dashboard](https://github.com/sofastack/sofa-dashboard) 可以帮助大家进行集群管理。
SOFADashboard：[https://github.com/sofastack/sofa-dashboard](https://github.com/sofastack/sofa-dashboard)

#### @陈鑫杰 Q2：

> 重启应用排序会发生变化吗？

A：可以在 Ark Biz 中指定 priority，保证启动顺序。 

#### @Tower Q3：

> 如果是多副本的情况下怎么更新？

A：多副本指的就是集群管理？目前我们开源了 [sofa-dashboard](https://github.com/sofastack/sofa-dashboard) 可以帮助大家进行集群管理。

#### @祁路 Q4：

> Biz 的安装可以通过 Api 吗？

A：sofa-ark 工程中提供 com.alipay.sofa.ark.api.ArkClient 类，用于支持 API 方式安装 Biz。

#### @盲僧 Q5：

> 运行期间安装 biz，然后激活模块这一过程做了哪些事情 ，如果这个 biz jar 包放在远程仓库怎么加载里面的代码呢？是拉下来放到本地的一个磁盘用 classloader 去加载使用吗？

A：运行期安装会动态创建一个 ClassLoader 将 Biz 代码加载起来，激活只是在内部修改了模块状态，同一时刻一个模块只能有一个版本是激活态。如果 Biz Jar 在远程仓库，会下载到本地后再用 classloader 加载的。

> 运行期间安装 biz 后，那个 execute jar 包里会有这个 biz 包吗？

A：不会。

#### @曾鹏 Q6：

> SOFAArk 有什么实际的应用场景吗？

A：可以看下这个：[https://mp.weixin.qq.com/s/PmB72OB3iALsyqRJztbpWA](https://mp.weixin.qq.com/s/PmB72OB3iALsyqRJztbpWA)

## 欢迎参与《剖析 | SOFAArk 源码》系列共建

同时，我们开启了《剖析 | SOFAArk 源码》系列，会逐步详细介绍各个部分的代码设计和实现，预计按照如下的目录进行：

- 【已完成】[轻量级类隔离框架 SOFAArk 简介](https://www.sofastack.tech/blog/sofa-ark-overview/)
- **【已认领】**SOFAArk 容器模型解析
- **【已认领】**SOFAArk 类加载模型机制解析
- **【已认领】**SOFAArk 合并部署能力解析
- **【已认领】**SOFAArk SPI 机制和 ClassLoaderHook 机制解析
- 【待认领】SOFAArk 动态配置机制解析
- 【待认领】SOFAArk maven 打包插件解析
- 【待认领】（实践）SOFAArk 插件化机制解析与实践

### 领取方式

欢迎参与共建，在【金融级分布式架构】公众号后台回复【想认领的文章名称】，我们将会主动联系你，确认资质后，即可加入，It's your show time！
