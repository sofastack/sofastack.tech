---
title: "如何在一个基座上安装更多的 Koupleless 模块？"
authorlink: "https://github.com/sofastack"
description: "本文属于 Koupleless 进阶系列文章第五篇，默认读者对 Koupleless 的基础概念、能力都已经了解。如果还未了解过的可以查看官网"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2024-11-19T15:00:00+08:00
cover: "https://img.alicdn.com/imgextra/i1/O1CN01dTwGEx1m9I7KOmUlD_!!6000000004911-0-tps-1216-521.jpg"
---

# 如何在一个基座上安装更多的 Koupleless 模块？

**文 梁栎鹏（立蓬）** 
蚂蚁集团技术工程师

云原生领域工程师

就职于蚂蚁集团中间件团队，参与维护与建设蚂蚁 SOFAArk 和 Koupleless 开源项目，参与内部 SOFAServerless 产品的研发和实践。

**本文2773字，预计阅读 7 分钟**

本文属于 Koupleless 进阶系列文章第五篇，默认读者对 Koupleless 的基础概念、能力都已经了解。如果还未了解过的可以在文末**​「阅读原文」​**​​**查看官网**​ [*https://koupleless.io/​*](https://koupleless.io/)。

进阶系列一：[Koupleless 内核系列｜模块化隔离与共享带来的收益与挑战](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247552272&idx=1&sn=fa4b3336127fb8e391d43ff25f49a5f4&chksm=faa3e2cacdd46bdcb801a8fc948057b581574cff39c194e2f977842131d89ca273ba6c79fb5b&scene=21#wechat_redirect)

进阶系列二：[Koupleless 单进程多应用如何解决兼容问题](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247552463&idx=1&sn=945889ddc42baf19cb7c2311a613fc38&chksm=faa3e215cdd46b0308579a7558198fbd4e790bdf618a1b058c8b283649772671f7662def339c&scene=21#wechat_redirect)

进阶系列三：[Koupleless 内核系列 一台机器内 Koupleless 模块数量的极限在哪里？](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247552624&idx=1&sn=68663f07f8b79efe64ac9942f137e316&chksm=faa3e1aacdd468bc28edc9a449c452f516e7676e18968e39f26bbc41565d0251adfff2159dbe&scene=21#wechat_redirect)
进阶系列四：[Koupleless 可演进架构的设计与实践｜当我们谈降本时，我们谈些什么](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247553424&idx=1&sn=94db1883e3e0eed3f2cb0b19728030c0&chksm=faa3fe4acdd4775c2501457f064fe0473188e5a2fd24131ddc1c1cf4544d6605ec8d35e9ef05&scene=21#wechat_redirect)

在往期文章中，我们已经介绍了 Koupleless 的收益、挑战、应对方式及存量应用的改造成本，帮助大家了解到 Koupleless 是如何低成本地为业务研发提升效率和降低资源成本的。在实践中，开发者可以将多个 Koupleless 模块部署在同一个基座上，从而降低资源成本。***那么，如何在一个基座上安装更多的模块呢？***

通常来说，有三种方式：模块复用基座的类、模块复用基座的对象、模块卸载时清理资源。其中，最简单、最直接、最有效的方式是让模块复用基座的类，即**模块瘦身**。

所谓模块瘦身，就是让模块复用基座所有依赖的类，模块打包构建时移除基座已经有的 Jar 依赖，从而让基座中可以安装更多的模块。

在最初的模块瘦身实践中，模块开发者需要感知基座有哪些依赖，并且在开发时尽量使用这些依赖，从而复用基座依赖里的类。其次，开发者需要根据基座所有依赖，判断哪些依赖可以移除并进行手工移除。在依赖移除后，还可能会出现以下场景：

* 由于开发者误判，移除了基座没有的依赖，导致模块编译正常通过，而运行期出现❌​**ClassNotFound、LinkageError 等错误**​；
* 由于模块依赖的版本和基座不同，导致模块编译正常通过，而运行期出现​**❌依赖版本不兼容的错误**​。

由此，引申出了 3 个关键问题：

* 模块如何感知基座运行时的所有依赖，从而确定需要移除的依赖？
* 如何简单地移除依赖，降低普通应用和模块相互转换的改造成本？
* 如何保证在移除模块依赖后，模块编译时和模块运行在基座中的依赖是一样的？

下面，本文就将介绍模块瘦身原理、原则，并针对以上三个关键问题给出解决方式。

## 模块瘦身原理

Koupleless 底层借助 SOFAArk 框架，实现了模块与模块之间、模块和基座之间的类隔离。模块启动时会初始化各种对象，会优先使用模块的类加载器去加载构建产物 FatJar 中的 class、resource 和 Jar 包，找不到的类会委托基座的类加载器去查找。

![图片](https://img.alicdn.com/imgextra/i2/O1CN01d20KY71Yie4N431VQ_!!6000000003093-0-tps-1080-521.jpg)

基于这套类委托的加载机制，让基座和模块共用的 class、resource 和 Jar 包通通下沉到基座中，可以让模块构建产物非常小，从而使模块消耗的 Metaspace 非常少，基座上能安装的模块数量也更多，启动也更快。

其次，模块启动后 Spring 上下文中会创建很多对象。如果启用了模块热卸载，可能无法完全回收，且安装次数过多会造成 Old 区、Metaspace 区开销大，触发频繁 FullGC。所以需要控制单模块包大小 < 5MB，这样不替换或重启基座也能热部署热卸载数百次。

在模块瘦身后，能实现以下两个好处：

* 允许基座安装更多的模块数量，从而在合并部署场景下，​**进一步降低资源成本**​；在热部署热卸载场景下，不替换或重启基座就能热部署、热卸载模块更多次。
* ​**提高模块安装的速度**​，减少模块包大小，减少启动依赖，控制模块安装耗时 < 30秒，甚至 < 5秒。

## 模块瘦身原则

由上文模块瘦身原理可知，模块移除的依赖必须在基座中存在，否则模块会在运行期间出现 ClassNotFound、LinkageError 等错误。

因此，模块瘦身的原则是，**​在保证模块功能的前提下，将框架、中间件等通用的依赖包尽量放置到基座中，模块中复用基座的依赖。​**这样打出的模块包会更加轻量。如图：

![图片](https://img.alicdn.com/imgextra/i3/O1CN01L6sOf21jNXamjclFd_!!6000000004536-0-tps-1080-390.jpg)

## 关键一：可感知的基座运行时

在基座和模块协作紧密的情况下，模块应该在开发时就感知基座正使用的所有依赖，并按需引入需要的依赖，而无需指定版本。为此，我们提供了 “基座-dependencies-starter” 的打包功能，该包在中记录了基座当前所有运行时依赖的 GAV 坐标 *（GAV: GroupId、ArtifactId、Version）*。打包方式非常简单，在基座的打包插件中配置必要的参数即可：

```bash
<build>
  <plugins>
    <plugin>
      <groupId>com.alipay.sofa.koupleless</groupId>
      <artifactId>koupleless-base-build-plugin</artifactId>
      <configuration>
        <!-- ... -->
        <!--生成 starter 的 artifactId（groupId和基座一致），这里需要修改！！-->
        <dependencyArtifactId>${baseAppName}-dependencies-starter</dependencyArtifactId>
        <!--生成jar的版本号-->
        <dependencyVersion>0.0.1-SNAPSHOT</dependencyVersion>
      </configuration>
    </plugin>
  </plugins>
</build>
```

执行 mvn 命令：

```bash
mvn com.alipay.sofa.koupleless:koupleless-base-build-plugin::packageDependency -f ${基座 bootstrap pom 对于基座根目录的相对路径}
```

然后，模块配置项目的 parent 为 “基座-dependencies-starter”。

```bash
<parent>
    <groupId>com.alipay</groupId>
    <artifactId>${baseAppName}-dependencies-starter</artifactId>
    <version>0.0.1</version>
</parent>
```

这样一来，在模块的开发过程中，开发者就能感知到基座运行时的所有依赖。

## ​关键二：​低成本的模块瘦身

在应用中，最简单的移除依赖的方式是把依赖的 scope 设置为 provided。但这种方式会增加普通应用转换为模块的成本，同时也意味着，如果模块要转为普通应用，需要将这些依赖配置回 compile，改造成本较高。

为了降低模块瘦身的成本，我们提供了两种配置模块瘦身的方式：基于 “基座-dependencies-starter” 自动瘦身和基于配置文件瘦身。

### 基于 “基座-dependencies-starter” 自动瘦身

我们提供了基于 “基座-dependencies-starter” 的自动瘦身，自动排除和基座相同的依赖​*（GAV 都相同）*​，保留和基座不同的依赖。配置十分简单，在模块的打包插件中配置 baseDependencyParentIdentity 标识即可：

```bash
<build>
  <plugins>
    <plugin>
      <groupId>com.alipay.sofa</groupId>
      <artifactId>sofa-ark-maven-plugin</artifactId>
      <configuration>
        <!-- ... -->
        <!-- 配置 “基座-dependencies-starter” 的标识，规范为：'${groupId}:${artifactId}' -->
        <baseDependencyParentIdentity>${groupId}:${baseAppName}-dependencies-starter</baseDependencyParentIdentity>
      </configuration>
    </plugin>
  </plugins>
</build>
```

### 基于配置文件瘦身

在配置文件中，模块开发者可以主动配置需要排除哪些依赖，保留哪些依赖。

为了进一步降低配置成本，用户仅需配置需要排除的顶层依赖，打包插件会将该顶层依赖的所有间接依赖都排除，而无需手动配置所有的间接依赖。如：

```bash
# excludes config ${groupId}:{artifactId}:{version}, split by ','
excludes=org.apache.commons:commons-lang3,commons-beanutils:commons-beanutils
# excludeGroupIds config ${groupId}, split by ','
excludeGroupIds=org.springframework
# excludeArtifactIds config ${artifactId}, split by ','
excludeArtifactIds=sofa-ark-spi
```

### ​关键三：​保证瘦身的正确性

如果基座运行时没有模块被排除的依赖，或者基座运行时中提供的依赖版本和模块预期不一致，那么模块运行过程中可能会报错。为了保证瘦身的正确性，我们需要在**模块编译和发布**的环节做检查。

在模块编译时，模块打包插件会检查被瘦身的依赖是否在 “基座-dependencies-starter” 中，并在控制台输出检查结果，但检查结果不影响模块的构建结果。同时，插件允许更严格的检查：配置一定参数。如果基座中不存在模块被排除的依赖，那么模块构建失败，直接报错。

在模块发布时，在发布流程中拉取基座的运行时依赖，检查是否和 “基座-dependencies-starter” 一致。如果不一致，那么卡住发布流程，开发者可根据情况去升级模块的 “基座-dependencies-starter” 或跳过该卡点。

## 模块瘦身效果

以某个依赖了 16 个中间件的模块为例，将模块的 parent 配置为 “基座-dependencies-starter” 自动瘦身，下表是瘦身前后的 ark-biz.jar 大小和 Metaspace 占用的对比：

![图片](https://img.alicdn.com/imgextra/i1/O1CN01JTGK8z1S7BzCySALM_!!6000000002199-0-tps-1080-188.jpg)

## 总结

通过上文相信大家已经了解，我们可以通过简单的配置，让模块打包更小，从而在一个基座上安装更多的 Koupleless 模块，进一步降低资源成本。

最后，再次欢迎大家使用 Koupleless 和参与共建，我们期待您宝贵的意见！
