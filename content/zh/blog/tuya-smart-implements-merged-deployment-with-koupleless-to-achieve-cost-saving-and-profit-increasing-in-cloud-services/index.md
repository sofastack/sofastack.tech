---
title: "涂鸦智能落地 Koupleless 合并部署，实现云服务降本增效"
authorlink: "https://github.com/sofastack"
description: "涂鸦智能落地 Koupleless 合并部署，实现云服务降本增效"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2024-10-15T15:00:00+08:00
cover: "https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*drudT5lwAVAAAAAAAAAAAAAADrGAAQ/original"
---

## 作者简介

文｜八幡、朵拉

杭州涂鸦智能技术专家,主要研究微服务与可观测、消息引擎、任务调度、数据层中间件等领域。 

**本文 5389字 阅读 15分钟**

> 当前涂鸦通过 Koupleless 的静态合并部署能力，很好地解决了资源浪费问题。为了进一步提升研发效率，涂鸦与 Koupleless 正在开发动态合并部署能力，为公有云大规模合并部署打下基础，也为未来更长远的 Serverless 能力提供基座。

![](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*hqM3Qqikf60AAAAAAAAAAAAADrGAAQ/original)

Koupleless 在涂鸦智能的落地效果探讨

## **背景**

涂鸦智能是全球领先的云平台服务提供商，致力于构建智慧解决方案的开发者生态，赋能万物智能。基于全球公有云，涂鸦开发者平台实现了智慧场景和智能设备的互联互通，承载着每日数以亿计的设备请求交互；拥有亿级海量数据并发处理能力，为用户提供高稳定性的不间断计算服务。

![](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*KyYCQL-KpqwAAAAAAAAAAAAADrGAAQ/original\)

涂鸦智能不仅服务于公有云用户，同时也为大客户提供混合云及私有云解决方案，满足不同层次客户的需求。因此，涂鸦需要同时关注公有云和私有云服务中潜在的问题。

公有云用户基数大、设备多、核心业务服务实例多，但也符合二八原则——20%的服务承担了 80%的流量。还有大量的配套周边管理服务及正处于发展中的业务等，虽然服务实例数量少，但为了保障业务的稳定性及可用性，至少得部署 2 个实例。

私有云在服务刚落地时，通常规模较小，随着业务的逐步发展，接入的用户数和设备数才会随之上涨。如果一开始就生搬硬套公有云的交付模式，将上百个服务部署在私有云客户环境中，基础设施成本占比太大，不仅造成了硬件资源成本浪费，同时也提升了运维复杂度。 

综合考虑**公有云部分服务和私有云前期服务存在的硬件资源利用率低、弹性扩容慢**等问题，涂鸦开始着手调研解决方案。 

## **方案调研**

首先看下内存占用情况：

### **内存占用分析**

涂鸦绝大部分业务应用都是采用 Java 语言实现的，基于微服务架构，部署在 K8S 上。来看下内存占用情况：

- 每个 POD 都需要启动精简的 Linux 系统，约几十兆初始内存；

- K8S 节点一般会附带一些 POD 监控、日志收集 Agent，约几十兆初始内存；

- Java Agent 之类的字节码增强消耗的初始内存；

- JVM 类库，Spring、Netty、Dubbo 等框架，内嵌 WEB 容器，占用的 Metaspace 和堆栈空间；

- 业务应用代码启动占用的 Metaspace 和堆栈空间；

- 业务流量处理产生的堆栈空间。

从上面分析可以看出，除了业务应用代码本身和业务流量处理之外，其他的内存占用当然是越少越好。一个简单的控制台应用内存占用如下图所示：

![](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*GQ0vQ6WzZvsAAAAAAAAAAAAADrGAAQ/original\)

在微服务架构的视角下，Java 应用不但没有百多兆的 JRE 和框架之类的基础内存需要问题，更重要的是，单个微服务也不再需要再数十 GB 的内存。有了高可用的服务集群，也无须追求单个服务 7×24 小时不间断运行，在一天内随着业务流量的波动、高峰和低谷，服务随时可以进行弹性扩缩容。

但相应地，Java 的**启动时间相对较长、需要预热才能达到最高性能**等特点就显得相悖于这样的应用场景。在无服务架构中，矛盾则可能会更加突出，比起服务，一个函数的规模通常会更小，执行时间会更短。在这样的场景下，我们看下有哪些方案可以降本增效：

### **⭕️ 搁浅方案：Native Image**

> ⭕️无法支持全场景、Spring 支持不足、异常难预见、问题难排查。

提前编译 *（Ahead of Time Compilation，AOT）* 可以减少即时编译带来的预热时间，减少 Java 应用长期给用户带来的“第一次运行慢”的不良体验，让用户能放心地进行很多全程序的分析行为，使用更大的优化措施。而随着 Graal VM 技术的成熟，它能显著降低内存占用及启动时间。由于 HotSpot 本身就会有一定的内存消耗 *（通常约几十 MB）* ，根据 Oracle 官方给出的测试数据，运行在 Substrate VM 上的小规模应用，其内存占用和启动时间与运行在 HotSpot 相比有了 5 倍到 50 倍的下降。

但是提前编译的坏处也很明显，它破坏了 Java“一次编写，到处运行”的承诺，必须为每个不同的硬件、操作系统去编译对应的发行包。它也显著降低了 Java 链接过程的动态性，要求加载的代码必须在编译期就是全部已知的，而不能再是运行期才确定，大多数运行期对字节码的生成和修改操作也不再行得通。特别是在整个 Java 的生态系统中，数量庞大的第三方库要一一进行适配。随着 Graal VM 团队与来自 Pivotal 的 Spring 团队的紧密合作，解决了 Spring 全家桶在 Graal VM 上的运行适配问题。

为此，我们进行了 JDK17 升级，并将 SpringBoot 升至 3.x 版本，Dubbo 升至 3.x 版本。在验证过程中出现了许多组件的兼容性问题，如 Apollo、Guava、Jedis、MyBatis 等，也进行了逐一解决。

虽然该方案在简单的内部应用上验证通过，并上线试运行了一段时间，取得了一定的效果。但业务应用使用的第三方库数量众多，达到数百个，在如 GroovyShell、BouncyCastle、Agent 等场景上还无法很好地支持。同时 Spring 的支持不足，如 Spring XML Bean 的构造参数或 properties 配置出现 TypedStringValue 类型无法识别，Spring-AOT 不支持 setter-inject 方式的循环依赖等，导致需要对应用进行较大调整和修改，另外会出现一些无法预见的异常，且出现问题时不方便定位排查。最后涂鸦还是决定暂时搁浅该方案。

### **✅ 使用中：Koupleless**

Koupleless 是一种模块化的 Serverless 技术解决方案，它能让普通应用以比较低的代价演进为 Serverless 研发模式，让代码与资源解耦，轻松独立维护，与此同时支持秒级构建部署、合并部署、动态伸缩等能力为用户提供极致的研发运维体验，最终帮助企业实现降本增效。

不同模块支持完全类隔离加载，对于应用开发来说相对透明，当然 Koupleless 也提供了更多插件机制，还有进程间跨 ClassLoader 的 JVM 调用能力。主要有如下优势：

- **类隔离：** 通过对业务应用的类隔离加载，原有业务系统几乎无侵入支持合并部署；
- **插件机制：** 通过插件机制解决依赖冲突问题；
- **基座和模块：** 可以将中间件和基础框架下沉到基座，框架与中间件升级维护成本降低。通过进程内 JVM 调用替代远程调用，节省网络 IO 和序列化反序列化成本，提升性能和稳定性。见下图：

![ ](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*LrWRQYFn4MUAAAAAAAAAAAAADrGAAQ/original\)

- **静态合并部署：** 方便快速验证，简化部署，适合私有云环境；
- **动态合并部署：** 支持模块的热更新，提高发布效率，降低启动时间，适合公有云环境。

就内存节省效率方面来说，可以节省 POD 容器、Tomcat 容器、公共类库加载 Metaspace 等内存资源，主要是节省启动内存开销。**对于低流量业务**，几个应用合并部署到一个，**资源利用更充分**：10 个低流量 1C2G 应用，合并后仅需能一个 2C4G 就能搞定；单个应用突发的高流量可以有更大的水位池，**稳定性也会提升**。而**对于高流量业务**，虽然在内存方面优势不大，但**可以实现极速弹性**，更有利于 Serverless 架构。

**❌ 其他弃选方案**

- **代码合并：** 简单粗暴，降本优势明显，但同时也降低了开发和运维效率，不利于维护和业务快速发展
- **基于代码组织的模块化：** 服务打成 jar 包引入，但没有 ClassLoader 隔离，容易造成类库依赖冲突，beanName 冲突等
- **基于 Tomcat 的多 WAR 包部署：** 业务系统无任何侵入，也能一定程度上节省多个应用的 POD 和应用内置 Tomcat 内存。但脱离了主流的 DevOps 体系，需要针对这种部署方式提供额外支持，同时能节省的内存也非常有限。

**综合考虑，涂鸦决定使用 Koupleless 进行改造升级。**

## **改造升级**

Koupleless 是一种多应用的架构，而传统的中间件可能只考虑了一个应用的场景，故在一些行为上无法兼容多应用共存的行为，会发生**共享变量污染、ClassLoader 加载异常、Class 判断不符合预期**等问题。由此，在使用 Koupleless 中间件时，我们需要对一些潜在的问题做补丁，覆盖掉原有中间件的实现，使开源的中间件和自研的组件也能兼容多应用的模式，涉及到以下的使用方式，可能需要多模块化适配改造：

### **适配点**

#### **系统变量被共享**

在使用的时候，需要考虑到全局共享的情况下是否会与别的模块冲突，包括但不限于：Appid 、环境变量、System 配置等。

#### **静态变量、静态单例、静态缓存被共享**

正常情况下公共代码都是由基座进行加载，而基座的类加载器是唯一的，所以不同的模块对静态变量的操作都是施加在同一个对象上的，解决方案如下：

- 将公共包从**基座引用**改成**每个应用单独引入**；
- 将静态变量调整为按 ClassLoader 进行缓存，每次操作只对当前线程的 ClassLoader 对应的对象进行操作。

#### **类找不到异常**

一般存在于通过基座加载相应的类或者静态调用的情况下。由于基座类加载器无法访问到模块的类加载器，所以在公共代码中加载类时优先使用 Thread.currentThread().getContextClassLoader()

- XX Class Not Found
- XX Class No Defined
- ServiceLoader 异常

#### **日志适配**

- **logback 通过 condition 进行适配**

'''java
<if condition='property("sofa.ark.embed.enable").contains("true")'>        <then>            <springProperty scope="context" name="APP_NAME" source="spring.application.name" defaultValue="NO_APP_CONFIG"/>            <property name="BASE_PATH" value="${user.home}/logs/${APP_NAME}"/>        </then>
            <else>            <springProperty scope="context" name="loggingRoot" source="logging.file.path"/>            <property name="BASE_PATH" value="${loggingRoot}/"/>        </else>
        </if>
'''

- **log4j 通过 properties 进行适配**

'''java
    <Property name="loggingRoot">${sys:user.home}/logs/${spring:tuya.sofa.ark.app:-}</Property>
'''

- **log4j2 和 logback 日志在同一个基座中混用**

一般应用使用 logback，但是存在某些应用使用 log4j2 的情况，目前 Koupleless 不支持两种应用放在一个基座中，可以考虑在 Koupleless 上调整日志系统的判断，或在 Koupleless 上调整由模块决定某些 plugin 是否被加载。

#### **健康检查**

提供基座应用的健康检查实现：

- **静态部署模式：** 合并部署的所有应用的状态都健康，健康检查才会通过。
- **动态部署模式：** 提供配置，让用户自行决定模块热部署结果是否影响应用整体健康状态 *（默认配置为：不影响整体应用原本的健康状态）*

#### **Web 容器共享**

- **多 Host 模式**：使用多个 port 进行区分。该模式的问题首先在于重复创建了 Tomcat 相关的资源，造成资源的浪费；其次是每个 Biz 有自己的端口，不利于整个 Ark 包应用整体对外提供服务。
- **单 Host 模式**：Koupleless 提供了类似独立 Tomcat 部署多 webapp 的方式。所有 Biz 共用同一个 Server 及 Host，每个 Biz 只创建自己的 Context，通过 Context 中的 contextPath 将自身接口与其它 Biz 接口做区分。﻿

![](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*qwQwRomR8I4AAAAAAAAAAAAADrGAAQ/original)

考虑到资源共享及整体性，我们采用了单 Host 模式。

### **实践心得**

- 将下沉的组件配置抽离到父 POM 中，方便统一管控；
- 基座的 AutoConfig 被模块的依赖触发，但是初始化的时候报错，基座需要 exclude 相应的 AutoConfig。建议使用 Spring Boot 框架的自动装配功能时将相应组件下沉到基座；
- ContextPath：可以通过参数动态配置，方便应用运行在**单模块独占基座**和**多模块合并部署**场景中；

![](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*vmwLRaUAqRkAAAAAAAAAAAAADrGAAQ/original)

- 模块需要开启 https 协议时：用于支持自定义证书场景，可以在模块获取到 web server 并主动添加一个新的 Connector。

![](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*WzFeTaw4gr0AAAAAAAAAAAAADrGAAQ/original)

## **DevOps 改造**

测试应用验证通过后，涂鸦团队开始着手进行发布系统的改造。由于静态合并部署比较适合部署相对稳定不频繁的场景 *（如私有云）* ，而公有云更适合动态合并部署模式。但为了给私有云交付打前战，涂鸦一期先在公有云上实现静态合并部署，快速试点验证。而静态合并部署是需要所有模块和基座一起发布的，为了尽可能不影响开发同学效率，我们同时支持**单模块独占基座**和**多模块合并部署**两种发布模式，方便在开发、日常、预发、线上等环境进行实地试运行，完整验证业务链路。 

首先按业务域及流量情况将应用拆分为基座或模块：

![](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*1bgCRKafs3AAAAAAAAAAAAAADrGAAQ/original)

然后发布系统根据基座与模块的映射关系，进行打包发布。目前我们是通过 K8S 部署服务的，源代码经过编译打包成 Docker 镜像再进行发布，为复用原有流程，快速上线，模块和基座都打包为镜像。模块由模块负责人进行打包，基座由业务域负责人打包，并根据迭代节奏进行定期发布。

![](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*dlahSKrl1hsAAAAAAAAAAAAADrGAAQ/original)

InitContainert 先启动模块镜像，再将模块的 ark 包拷贝到/home/docker/module/biz目录下：

![](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*vbCbQ7bTu-4AAAAAAAAAAAAADrGAAQ/original)

通过-Dcom.alipay.sofa.ark.static.biz.dir 参数实现合并部署：

![](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*TcPITK2i9GMAAAAAAAAAAAAADrGAAQ/original)

### **日志目录**

日志路径由原来的 home/docker/logs，在合并模块部署后调整为 home/docker/logs/appname/，日志收集模板按此进行调整。std 输出的日志会打印在基座应用的 std 中，比如异常类的 printStackTrace，所以尽量避免使用 stdout 和 stderr。

### **域名切换**

由于应用合并，原来的域名需要切换到新的域名上来。由单一应用过渡到合并部署模式的发布过程中需要注意对等的流量切换。

有两种域名切换方式：  

**1、调用方切换到新域名。** ✅优点：简单，不需要路由。❌缺点：需要调用方配合调整，应用模块与基座关系调整时同样需要再次调整。

**2、域名路由。** 调用方还是访问原域名，通过内部网关路由到新域名。✅优点：灵活。❌缺点：多一次调用。

我们最终采用路由的方式来进行域名切换。 

## **上线实施**

目前一期按业务域划分为 18 个基座，60 多个模块在一些数据中心\*\* *（如中国区、美西区等）* \*\*进行合并部署后稳定运行。

![](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*6Eg3QYy6LOwAAAAAAAAAAAAADrGAAQ/original)

如某基座合并部署了 8 个模块：

![](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*ZNonQLcYErsAAAAAAAAAAAAADrGAAQ/original)

合并后，每个模块由原来的 1C2G 变为 2C4G，**节省资源 6C12G**。  

![](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*QvvHRbe7EMYAAAAAAAAAAAAADrGAAQ/original)

8 个模块非合并部署前的启动时间如下图前 8 条记录显示，在 1-3 分钟之间。 

![](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*K7zCS7cQtgkAAAAAAAAAAAAADrGAAQ/original)

而静态合并部署后的基座启动时间见下图最后一条记录，约 2 分 45 秒。8 个模块分别交付，每个 1-3 分钟，统一成 2 分 45 秒一次性完成交付，**大大提高了整体交付效率** **。**

![](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*K7zCS7cQtgkAAAAAAAAAAAAADrGAAQ/original)

总体来说，在内存方面，对于应用初始启动内存占总消耗内存比例较高、低流量的业务场景，应用合并部署的内存节省收益越大。60 个模块共节省 70G 内存。线上 POD 数约有 6000 多个，**预计可节省 6000 多 G 内存**。相应地在 CPU 资源利用率方面，大部分业务应用都是 IO 密集型，而合并部署能将 CPU 较为充足地利用起来，**线上 Pod 合并部署后能节省 3000 核**。\
在调用性能和网络 IO 优化上，大流量的业务场景从远程调用变成本地调用，**网络 IO、序列化反序列的 CPU 开销以及调用性能、稳定性上都能得到大幅度提升**。

## **后续演进**

当前我们完成的是静态合并部署能力，很好地解决了资源浪费问题。为了进一步提升研发效率，我们正在开发动态合并部署能力，为公有云大规模合并部署打下基础，也为未来更长远的 Serverless 能力提供基座。

为了打造对开发者更友好的 Serverless 能力和平台：

1、我们需要增强模块热卸载能力。

2、进一步的模块瘦身，将更多的通用组件下沉到基座中，减少公共类库和框架加载和初始化运行开销。不但节省内存，还能加速子模块的启动速度，如尝试复用基座数据源和基座拦截器。

3、弹性伸缩，目前依赖应用的 CPU、内存等指标对进程进行弹性伸缩，而合并部署后，可以通过预热基座的方式，让模块的扩缩容速度更快。另外由于模块级别资源的监控指标较难获取，也可以考虑 QPS 等其他维度的指标。 

在整个调研、升级改造及实施的过程中，社区同学多次和我们进行线上和线下交流讨论，提供了许多蚂蚁内部和其他外部企业的最佳实践， 给予了我们很多帮助与指导，在共同的努力下最终成功落地 Koupleless！

**希望后续社区在模块应用的卸载稳定性上有进一步的优秀表现，为我们的动态发布打下坚实的基础！**也欢迎更多同学加入社区，一起参与共建！****

## **Koupleless Star 一下✨：**

[https://github.com/koupleless/koupleless](https://github.com/koupleless/koupleless)
