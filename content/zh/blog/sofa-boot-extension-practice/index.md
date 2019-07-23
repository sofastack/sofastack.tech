---
title: "SOFABoot 扩展点初体验 | SOFALab 实践系列"
author: "卫恒"
authorlink: "http://www.glmapper.com/"
description: "本文根据 SOFAChannel#5 直播分享整理，主题：给研发工程师的代码质量利器 —— 自动化测试框架 SOFAActs。"
categories: "SOFABoot"
tags: ["SOFABoot"]
date: 2019-02-14T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1563455530059-b90e96a5-b1e8-4d0c-b2fe-2f7fba9bd6cf.jpeg"
---

> SOFABoot 是基于 Spring Boot 的一套研发框架。
> 在完全兼容 Spring Boot 的基础上，SOFABoot 还提供了启动期监控检查，上下文隔离，模块化开发，类隔离，日志空间隔离等等能力
> SOFABoot 地址：[https://github.com/alipay/sofa-boot](https://github.com/alipay/sofa-boot)
> 本文工程案例：[https://github.com/glmapper/glmapper-sofa-extension](https://github.com/glmapper/glmapper-sofa-extension)

春节小长假还没感觉就过去了，对于“热爱工作”的我，也早早的回到了工作岗位；感受下假期中的我和上班时的我。

> 后面拿枪的就是"逼着"我写文章的五花肉，上次 SOFATracer 采样用的是刀，这次用了枪！


## 模块化与扩展点

言归正传，节前 SOFABoot 发布了 [2.6.x 系列版本](https://github.com/alipay/sofa-boot/releases)，新特性也是相当给力，这里简单罗列下新特性：

- 支持扩展和扩展点
- 在刷新上下文期间支持 spring bean 的并行初始化
- 支持使用注解方式发布 JVM 服务

之前的文章中有 @玄北 写过的模块化的文章( 传送门 : [剖析 | 详谈 SOFABoot 模块化原理](https://mp.weixin.qq.com/s/7WAClC-f9mM7-_WIa10M_g)  & [基于 SOFABoot 进行模块化开发](https://www.sofastack.tech/blog/sofa-boot-modular-development/) )，这两篇文章中介绍了模块化的几种实现方案（PS：当然主要还是为了宣传一下 SOFABoot 提供的基于 Spring 上下文隔离的模块化能力）。SOFABoot 的模块隔离方案是为了解决传统的模块化方案模块化不彻底的问题，从 2.4.0 版本开始支持基于 Spring 上下文隔离的模块化能力，每个 SOFABoot 模块使用独立的 Spring 上下文，每个模块自包含，模块与模块之间通过 JVM Service 进行通信，从而避免模块间的紧耦合。

在 Spring 上下文隔离的情况下，各个上下文之间的 bean 是互不可见；SOFABoot 中通过发布 JVM 服务的方式使得不同模块 bean 之间的访问得以实现。但是同时又带来了另外一个问题，如果一个模块以独立 jar 的方式对外提供 api ，那么对于其他依赖此模块的模块来说，就无法去改变这个模块中的 bean 实例行为。

在实际的使用场景中，一个模块中的 bean 有时候需要开放一些入口，供另外一个模块扩展。SOFABoot 借鉴和使用了 [Nuxeo Runtime](https://github.com/nuxeo-archives/nuxeo-runtime) 项目 以及 [nuxeo](https://github.com/nuxeo/nuxeo) 项目，并在上面扩展，与 Spring 融合，提供了扩展点的能力。

**本篇将针对 SOFABoot 2.6.x 版本中提供的扩展点进行简单尝试，结合官方文档提供的示例，一步一步实现我们自定义的一个扩展点功能（本文过于简单，可能会引起极度舒适，请备好被子和热水袋）。**

## 案例背景

这里先抛出一个例子，现在有一个三方 jar ，它定义了获取数据源接口的顶层抽象；不同的业务方如果依赖这个 jar，则需要自己提供一个数据源的实现，当然其本身提供了默认实现（假设是 mysql）。基于此我们大概能够想到的方式就是基于 SPI 来提供这种扩展能力，但是对于在 Spring 上下文隔离的情况下，业务方的 Spring 上下文是无法与引入 jar 的上下文共享 bean 的，这样自然也就无法实现对原有数据源实现的扩展。

那么这里我们就可以选择使用 SOFABoot 扩展点来实现，这里有两个比较重要的概念，也是扩展点区别于 SPI 的主要特性：

- 可以在基于 Spring 上下文隔离的情况下实现扩展
- 扩展的是 Spring Bean 

下面基于这两个点，来完成自定义扩展点的一个案例。在实现上述案例之前我们需要先构建一个基于 Spring 上下文隔离的模块化工程，然后再简单介绍下扩展点的基本使用方式。

## 构建模块化工程

SOFABoot 开源版本中并没有给出扩展点相关的案例工程，只是在测试用例中进行了详细的测试，有兴趣的同学可以看下相关测试用例代码。实际上测试用例中也没有涉及到在模块化的场景下使用扩展点，测试用例都是基于同一个Spring 上下文来完成的。本篇文章将先搭建一个简单的模块化工程，然后基于此工程来实现扩展点的能力。

本工程主要包括 4 个模块：

- glmapper-sofa-facade         // JVM 服务发布与引用的 API 包
- glmapper-sofa-provider      // Annotation 方式发布 JVM 服务
- glmapper-sofa-consumer    // Annotation 方式引用 JVM 服务
- glmapper-sofa-web             // 启动包含 SOFABoot 模块的 SOFA Boot 应用

[官方文档及案例](https://www.sofastack.tech/sofa-boot/docs/QuickStart) 中给的比较复杂，包含了多种使用服务发布和引用的方式，这里我使用了最新提供的基于注解的方式来实现；获取[本文工程案例](https://github.com/glmapper/glmapper-sofa-extension)。

## 扩展点基本使用

在 SOFABoot 中使用扩展点能力，需要以下三个步骤：

- 定义提供扩展能力的 bean
- 定义扩展点
- 定义扩展并使用

这三步中前两步都是由服务提供方来完成，最后一步由具体的业务使用方式来定义。

### 定义提供扩展能力的 bean

本案例工程中，是将 glmapper-sofa-provider 作为服务提供方，因此也在此模块下定义一个具有扩展能力的 bean 。

![定义 bean 源码](https://cdn.nlark.com/yuque/0/2019/png/226702/1550127041890-808d472b-a5fe-43f0-85c3-32819ada99d0.png)

定义这个接口的实现：

![定义接口实现源码](https://cdn.nlark.com/yuque/0/2019/png/226702/1550127041928-cc6e28f4-a3d9-4c6e-824d-d71d8506c7f4.png)

在模块的 Spring 配置文件 resources/META-INF/service-provider.xml  中，我们把这个 bean 给配置起来：

![扩展点配置源码](https://cdn.nlark.com/yuque/0/2019/png/226702/1550127041928-bf045e96-42a8-4a21-80c8-994aa6ceef29.png)

### 定义扩展点

在上面的 bean 中有一个字段 word ，在实际中，我们希望这个字段能够被其他的模块自定义进行覆盖，这里我们将其以扩展点的形式暴露出来。这里先定义一个类去描述这个扩展点：

![定义类源码](https://cdn.nlark.com/yuque/0/2019/png/226702/1550127041911-528bee16-f763-4518-9503-6840cd032d49.png)

然后在模块的 Spring 配置文件 resources/META-INF/service-provider.xml  中定义扩展点：

![定义扩展点源码](https://cdn.nlark.com/yuque/0/2019/png/226702/1550127041926-250e85bb-da99-4516-b011-385e3720881e.png)

- name：为扩展点的名字
- ref：为扩展点所作用在的 bean
- object：为扩展点的贡献点具体的描述，这个描述是通过 XMap 的方式来进行的（XMap 的作用是将 Java 对象和 XML 文件进行映射，这里建议通过在网上搜索下 XMap 的文档来了解 XMap）

至此服务提供端已经暴露出了扩展点，那么在服务使用端，也就是需要扩展这个 bean 的使用方就可以扩展这个bean 了。

### 定义扩展

上述已经将扩展点定义好了，此时我们就可以对这个 bean 进行扩展了。扩展是具体业务使用方来做的事，在本案例中，glmapper-sofa-web 模块作为使用服务使用方，因此在 resources/META-INF/spring/web-home.xml 下进行扩展定义：

![扩展定义源码](https://cdn.nlark.com/yuque/0/2019/png/226702/1550127041930-90fa0de2-f0fa-493e-9532-a773c5f33e5b.png)

- bean：为扩展所作用在的 bean
- point：为扩展点的名字
- content  里面的内容为扩展的定义，会通过 XMap 将内容解析为：扩展点的贡献点具体的描述对象，在这里即为 com.glmapper.bridge.extension.ExtensionDescriptor 对象

> 需要注意一点，glmapper-sofa-web 模块不是一个 SOFABoot 模块，这里留坑。

编写一个 TestController 类，这里最先参考的是 SOFABoot 测试用例中的写法，如下：

![编写 TestController 类](https://cdn.nlark.com/yuque/0/2019/png/226702/1550127041934-bf6c98c4-f317-49a9-88ba-71d7e11d856f.png)

启动运行，结果抛了一个错:

![报错](https://cdn.nlark.com/yuque/0/2019/png/226702/1550127041932-de5235d4-2aaf-49bc-987c-e43f41b63ab0.png)

没有找到 extension 这个 bean ，但是实际上我们在前面 **定义提供扩展能力的 bean **小结中已经将 extension 配置成一个 bean 了。

> 原因在于，glmapper-sofa-provider 是一个 SOFABoot 模块，它有自己独立的 Spring 上下文环境，web 模块这里作为根上下文无法感知到这个 bean 的存在，所以这里还需要将 extension 这个发布成一个 JVM 服务，然后才能正常启动。具体就是在 IExtensionImpl 类上加上 @SofaService 注解。然后在 TestController 中，将@Autowired 改成 @SofaReference 。

另外，因为 glmapper-sofa-web 不是一个 SOFABoot 模块（这里特指的是 isle 模块），在  resources/META-INF/spring/web-home.xml 定义的扩展无法直接被 spring 扫到，因此还要在启动类上使用 @ImportResource 来指定当前 web 模块的 xml 文件位置，否则工程可以正常运行，但是基于此工程扩展点扩展的能力是无效的。

### registerExtension 

细心的同学可以注意到了一个点，就是前面扩展点实现 IExtensionImpl 这个类中有一个特殊的方法，在整个案例演示中其实都是没有用到的。

![registerExtension  源码](https://cdn.nlark.com/yuque/0/2019/png/226702/1550127041963-047dab4b-c8a4-402c-b7af-57d7ebff4fe3.png)

最开始对这个方法我也很迷糊，因为我并没有用到。既然自己没用到，那一定是框架自己用到了。有兴趣的同学可以自己断点下这段逻辑。实际上 SOFABoot 在解析到贡献点时，会调用被扩展 bean 的 registerExtension 方法，其中包含了用户定义的贡献点处理逻辑。在上述的例子中，获取用户定义的 value 值，并将其设置到 word 字段中覆盖 bean 中原始定义的值，最后调用 extension.say() 方法，可以看到返回扩展中定义的值： newValue 。

## XMap 支持和扩展

上述的例子中只是一个很简单的扩展，其实 XMap 包含了非常丰富的描述能力，包括 `List`, `Map` 等，这些可以通过查看 [XMap 的文档](http://community.nuxeo.com/api/nuxeo/5.4/javadoc/org/nuxeo/common/xmap/XMap.html) 来了解。在 SOFABoot 中，除了 XMap 原生的支持以外，还扩展了跟 Spring 集成的能力：

- 通过 XNode        扩展出了 XNodeSpring
- 通过 XNodeList  扩展出了 XNodeListSpring
- 通过 XNodeMap 扩展出了 XNodeMapSpring

这部分的扩展能力，让扩展点的能力更加丰富，描述对象中可以直接指向一个 SpringBean （用户配置 bean 的名字，SOFABoot 会根据名字从 Spring 上下文中获取到 bean）。

## Datasource 扩展点案例

基于前小结对于 XMAP 的扩展的介绍以及开篇的案例， 这里举一个使用 XNodeSpring 的例子，来实现 Spring 上下文隔离场景对于数据源 bean 的扩展。依然是前文描述的三个步骤：

### 辅助接口和类

1、定义一个 DatasourceBean ，并且提供一个 getDatasource 方法，用于获取 数据源实例。

```java
public interface DatasourceBean {
    void getDatasource();
}
```

2、定义一个 DefaultDataSourceBean ，作为 DatasourceBean 接口的默认实现。

```java
public class DefaultDataSourceBean implements DatasourceBean {
    @Override
    public void getDatasource() {
        System.out.println("mysql datasource");
    }
}
```

### 定义提供扩展能力的 DatasourceExtension Bean

新建 DatasourceExtension 接口

```java
public interface DatasourceExtension {
    /**
     * 获取数据源 Bean 实例
     * @return
     */
    DatasourceBean getDatasourceBean();
}
```

新建 DatasourceExtensionImpl 实现类，并且实现 DatasourceExtension 中的 getDatasourceBean 方法，且里面通过 datasourceBean 去执行获取数据源实例。

![获取数据源实例源码](https://cdn.nlark.com/yuque/0/2019/png/226702/1550127041942-d0abe89e-ca0a-4119-ac21-393f90accb0c.png)

### 定义扩展点

定义并且暴露扩展点，这里还需要一个扩展点描述。

![扩展点描述源码](https://cdn.nlark.com/yuque/0/2019/png/226702/1550127041940-34908856-0a8f-494b-b37b-b8f8c77fbed5.png)

下面在 xml 文件中将此扩展点通过 xml 暴露出去，并配置相关默认实现。

![扩展点描述源码](https://cdn.nlark.com/yuque/0/2019/png/226702/1550127041979-f297c7b4-011e-4183-8d76-d7ed4a5df09e.png)

以上几步在此案例工程包括定义提供扩展能力的 bean、包括扩展点等均在 glmapper-sofa-provider 中完成，作为扩展点的提供方。

### 定义扩展

这部分实现是需要由业务方来完成，这里就需要对于 provider 中提供的扩展点进行扩展，以改变其本身提供的 bean 实例的行为。

扩展扩展点，这里我们希望能够扩展对于 oracle 数据源的支持，那么对于 provider 中提供的默认对 mysql 的支持的 bean 实例就需要被“扩展”，此处的扩展本身上就是 bean 实例的替换。

首先定义一个 OracleDatasourceBean ，同样实现 DatasourceBean 这个接口，getDatasource 方法中返回 oracle 的数据源实例：

```java
public class OracleDatasourceBean implements DatasourceBean {
    @Override
    public void getDatasource() {
        System.out.println("oracle datasource");
    }
}
```

然后在业务模块（本案例在 glmapper-sofa-web 模块下）的 resources/META-INF/spring/web-home.xml 中配置扩展的 bean 并且对扩展点进行扩展。如下：

![image.png](https://cdn.nlark.com/yuque/0/2019/png/226702/1550127041949-71915754-c633-41a2-b370-971cd4a68098.png)

> 详细代码见：[glmapper-sofa-extension](https://github.com/glmapper/glmapper-sofa-extension) 。

下面开始启动项目工程，首先将扩展部分注释掉，执行 http://localhost:8080/extension ，查看控制台打印结果如下：

```
mysql datasource
```

打开扩展部分注释，重新启动，刷新地址，查看控制台打印结果如下：

```
oracle datasource
```

那么这里可以看到，provider 中提供的数据源 bean 被自定义的 数据源 bean 替换了。实现了在 Spring 上下文隔离情况下，替换 bean 的操作。

## 小结

扩展点的存在很好的解决了这样一个问题：**需要在另一个模块中对依赖的模块中定义的组件进行定制化。**在模块化的场景下，如果能够允许改变另外一个模块中 bean 的行为，无疑会解决很多棘手的问题。

本文通过一个简单的 Demo 对 SOFABoot 中扩展点进行了演示，本篇基于 SOFABoot 官方文档，补充了一些使用上的细节以及需要注意的一些坑，希望通过本篇文章可以帮助大家对 SOFABoot 扩展点的能力及使用有初步了解。

未出正月都是年，这里给大家拜个晚年，祝大家新年快乐、升职加薪！