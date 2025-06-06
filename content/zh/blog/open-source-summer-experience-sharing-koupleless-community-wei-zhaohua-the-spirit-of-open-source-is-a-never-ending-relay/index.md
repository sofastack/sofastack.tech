---
title: "开源之夏经验分享｜Koupleless 社区魏照华：开源精神是场永不停歇的接力"
authorlink: "https://github.com/sofastack"
description: "SOFAArk 打包插件就是将传统 Maven 工程打包成 SOFAArk 模块 jar 包的插件，并且支持设置类的隔离与共享的配置能力（对象的隔离与共享不在该插件里配置）。但是当前 SOFAArk 打包插件只支持 Maven 版本，不支持 Gradle 版本，导致很多 Gradle 的用户无法使用 SOFAArk 来享受到 Koupleless 模块化研发框架的收益。"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2025-02-18T15:00:00+08:00
cover: "https://img.alicdn.com/imgextra/i1/O1CN01tgLCeN1Hv9PsqFE6B_!!6000000000819-0-tps-1217-516.jpg"
---

# 开源之夏经验分享｜Koupleless 社区魏照华：开源精神是场永不停歇的接力

> 魏照华
> 
> Computer Science
> Koupleless 社区贡献者
> 
> 就读于 University of Wolloging，Computer Science 专业研究生。
> 
>  **本文 5428 字，预计阅读 14 分钟**

今天 SOFAStack 邀请到了开源之夏 2024 Koupleless 社区的中选学生**魏照华**同学！在本项目中，他参与完成了 ​**Koupleless 模块打包插件 Gradle 版本**​。希望他分享的这段经历，能让更多人了解到 Koupleless 开源社区，感受开源的魅力～

​**项目链接**​：[https://summer-ospp.ac.cn/org/prodetail/2495a0374?lang=zh&list=pro](*https://summer-ospp.ac.cn/org/prodetail/2495a0374?lang=zh&list=pro*)

## 项目信息

​**项目名称**​：Koupleless 模块打包插件 Gradle 版本

​**项目导师**​：梁栎鹏

​**项目背景**​：

在 Koupleless 模块化研发框架里，模块是普通 SpringBoot 或者 Java 代码工程，通过使用 SOFAArk 模块打包插件构建出 jar 包，这个 jar 包就是我们的模块构建产物，通过在一个基座 JVM 里部署多个这样的模块 jar 包，运行起来的时候，​**1 个模块 = 1 个 ClassLoader + 1 个 SpringContext**​，通过多 ClassLoader 和 SpringContext 的隔离和共享来为模块开发提供最极致的研发效能和资源效能。

而 SOFAArk 打包插件就是将传统 Maven 工程打包成 SOFAArk 模块 jar 包的插件，并且支持设置类的隔离与共享的配置能力*（对象的隔离与共享不在该插件里配置）*。但是当前 SOFAArk 打包插件只支持 Maven 版本，不支持 Gradle 版本，导致很多 Gradle 的用户无法使用 SOFAArk 来享受到 Koupleless 模块化研发框架的收益。

## 项目实现思路

SOFAArk 目前拥有两种打包插件，分别为 sofa-ark-maven-plugin 和 sofa-ark-plugin-maven-plugin。前者负责将普通的 Java 工程或者 SpringBoot 工程打包成标准格式的 Ark 包或者 Ark Biz 包，后者是将一个或者多个普通的 jar 包打包成标准格式的 Ark Plugin。这三类 jar 包都有自己特定的格式和内容。具体的内容可以参考如下：

* Ark ：[*https://www.sofastack.tech/projects/sofa-boot/sofa-ark-ark-jar/*](https://www.sofastack.tech/projects/sofa-boot/sofa-ark-ark-jar/)
* Ark Biz：[*https://www.sofastack.tech/projects/sofa-boot/sofa-ark-ark-biz/*](https://www.sofastack.tech/projects/sofa-boot/sofa-ark-ark-biz/)
* Ark Plugin:[*https://www.sofastack.tech/projects/sofa-boot/sofa-ark-ark-plugin/*](*https://www.sofastack.tech/projects/sofa-boot/sofa-ark-ark-plugin/*)

这三类包从包含类别上而言，Ark 包是包含种类最多的包，除了 MANIFEST.MF 文件之外，还包含了业务的 Ark Biz 包、Ark 容器，以及启动相关的内容。Ark 包的 Maven 打包过程，在 SOFAArk 的官方文档^​[1]​^中，已经有了详细的解析。

从这份文档中可以了解到，通过自定义 Maven 插件，按照 SOFAArk 中所定义的格式，重新编排后的 jar 包，就是我们想要得到的目标产物。

回到 Gradle 打包插件上，通过了解 Maven 插件打包的具体实现过程，使用 Gradle 提供的插件 API，来实现上述过程即可。为此，需要去了解 Gradle 的生命周期，依赖管理，自定义插件等内容，进行后续开发工作。

总览整个项目，实现过程中主要处理如下内容：

* 用户的配置项
* 项目依赖项
* 启动类和容器类
* 插件调试

### 用户配置项

SOFAArk 打包插件提供了非常丰富的用户配置选项，通过设置这些配置选项，能够打包出满足不同需求的产物内容。不同的配置项会对应不同的特性，这些特性极大地增强了项目构建的灵活性与定制性。并且使得用户能够根据项目实际的运行环境、性能需求以及部署要求等因素，精细地调整打包产物的内容与形式。

Gradle 提供了 extensions 来让插件实现可配置，这一机制提供了一种优雅且强大的方式来定制插件行为。通过自定义 extension 类或者接口，声明需要的配置属性，便可以在插件中使用配置项。

```bash
//定义extensions
abstract public class ArkExtension {
   abstract public Property<Boolean> getAttach();
    // 定义一个字符串集合类型的属性excludes，用于指定需要在打包过程中排除的依赖
   abstract public SetProperty<String> getExcludes();
}
//在插件中使用
class ArkPlugin implements Plugin<Project> {
    void apply(Porject project){
      ArkExtension arkExtension = project.getExtensions().create("arkPlugin", ArkPluginExArkExtension.class);
 }
}
```

这里需要注意的是，使用 extensions 的扩展方式，如果对插件的属性设置了默认值，那么在配置结束阶段，是没有办法获取到用户的自定义配置的。这里考虑到我们需要对 sofa-ark-all 包进行配置，装载进入 runtimeClasspath，以便再后续进行处理。可以通过设置 `<span>afterEvaluate</span>` 来解决这个问题。`<span>afterEvaluate</span>` 是 Gradle 提供的一个非常重要的机制，它允许我们在项目的配置阶段完成之后执行相应的操作，这样可以确保用户的自定义配置被完全考虑在内。当我们将自定义逻辑放在 `<span>afterEvaluate</span>` 中时，Gradle 会先完成对所有用户配置的解析和应用，包括那些在 `<span>build.gradle</span>` 或其他配置文件中显式指定的属性，然后再执行自定义的操作。

### 项目依赖项

在打包过程中，需要对不同 scope 的依赖进行处理，这涉及到 Gradle 的依赖管理。Gradle 中通常用两个 Classpath 来进行管理：

* ​**compileClasspath**​：编译依赖项，此路径下的依赖主要用于项目编译阶段。例如，项目使用特定的数据库连接库进行数据访问层代码的编写，在编译时，需要将该数据库连接库的相关 jar 包包含在 compileClasspath 中，这样编译器才能识别并正确编译涉及数据库操作的代码。编译依赖项确保了代码在编译期间能够顺利通过语法检查和类型校验，为后续的运行奠定基础。
* ​**runtimeClasspath**​：运行时依赖项，这些依赖是项目在实际运行过程中所必需的。以一个基于 Web 的应用为例，在运行时可能需要 Servlet 容器相关的依赖，这些依赖并不一定在编译阶段就绝对必要，但在应用启动和处理用户请求时是不可或缺的。运行时依赖项保证了项目在运行环境中能够正常执行各项功能。

在 Gradle 配置文件中通过 implementation、runtimeOnly 等声明的依赖项，最终会根据不同的阶段分类到上述的两个 classpath 中。例如，使用 implementation 'com.example:library:1.0.0' 声明的依赖，会在编译阶段添加到 compileClasspath，同时也会在运行时存在于 runtimeClasspath，因为 implementation 配置表示该依赖对于编译和运行都至关重要。而像 runtimeOnly 'com.example:runtime-only-library:1.0.0' 声明的依赖，则只会被添加到 runtimeClasspath，因为它仅在运行时才需要。

在 Gradle 中的 Action 中，通过获取 runtimeClasspath 配置，可以对运行时的依赖项进行分类、筛选、过滤等操作。例如，项目在运行时可能依赖多个日志库，但由于某些原因，需要对日志库进行优化，只保留特定的日志库进行打包。我们便可以在 SOFAArk 打包过程中，通过自定义配置 exclude 设置依赖项的标识​*（groupId、artifactId 和 version）*​，去除不需要的日志库依赖。

### 启动类和容器类

在 Ark 包的打包过程中，会对所有的依赖项进行分类，根据不同的类别，分为 Biz 包、Container 包，以及 Container 包的启动类相关的内容。用户在使用之前，如果没有指定相关包的配置项，会启用默认配置，从远程仓库或者本地仓库中获取到 sofa-ark-all 内容，并在配置阶段进行处理。此外，涉及到 Biz 包时，需要先将项目的所有 Biz 包打包出来后，再将这些 Biz 包写入到 Ark 包中。

想要实现上述的这些内容，并不需要自己去另外编写太多的代码，Gradle 提供了 Copy 和 CopySpec 两个工具。通过它们，我们可以极为方便地将依赖、配置项等各种内容输出到指定的目录。在使用这些工具时，我们只需要编写相应的过滤和操作规则，就能够精确地控制哪些内容需要被复制，哪些内容需要被排除，以及如何将它们按照我们期望的方式组织到目标目录中。

```bash
//定义目标目录为包的根目录
this.bootInfSpec = project.copySpec().into("");
bootInfSpec.into("", 定义过滤规则));
bootInfSpec.into("lib", 定义lib下面的过滤规则));
```

除了 Copy 和 CopySpec，Gradle 还提供了 CopyAction 对文件进行复制操作。CopyAction 的核心功能是将文件从一个位置复制到另一个位置，这是构建系统中常见的操作，尤其是在将资源、依赖项或生成的输出文件部署到相应的目录时。它不仅仅是简单的文件复制，还可以根据复制细节*​（CopySpec​）*来决定哪些文件需要复制，如何复制，以及复制时需要进行哪些处理。再最终将资源和内容写入到 jar 包时的操作，便可以集中到自定义的 CopyAction 中来实现。

### 插件调试

初步完成插件的编写工作后，想要在本地调试需要三步:

* 发布到 Maven 仓库
* 项目引入
* 断点调试

本地发布需要在插件项目的 `<span>build.gradle</span>` 中设置如下：

```bash
plugins {
//    本地调试用，发布到maven
    id 'maven-publish'
}
```

另外还需要对 publish 进行配置，配置完成发布到本地仓库后，就可以在想要测试的 Gradle 项目中进行引入，这里一般要设置测试项目中的 `<span>setting.gradle</span>` 和 `<span>build.gradle</span>` 文件，指定插件仓库和版本。最后，通过打断点启动插件，就可以对插件进行调试。

### 项目未来

目前，Gradle 打包依然还有一些特性亟待解决和优化，包括即将支持的 declared 模式，优化 Ark 打包过程，抽离公用代码等内容。后续，我会进一步优化以上内容，使 Gradle 版本打包体验完成从可用到优雅的跃迁。

## 开源之夏个人随访

### 自我介绍

大家好，我是​**魏照华**​。第一次了解到开源活动，是看到身边同学参加谷歌开源之夏的经历，当时为我推开了通往新世界的大门。我在随后也参与了一些国内外的活动，在此过程中，逐渐感受到开源精神和开源项目对世界产生的深刻影响。

### 参与该项目的原因​

本次能参与 SOFAArk 打包插件项目，于我而言是份特别的缘分——三年前在社区发起的 SOFAArk 源码解析活动中，我注意到一个关于支持 Netty 插件的 issue，当时利用闲暇时间尝试提交了 PR，并幸运地被合并到主分支。未曾想两年后的今天，可以再次参与 SOFAArk 项目。

### 如何克服项目过程中的困难与挑战

就个人成长而言，我想分享以下两点：**技术沟通的艺术**与​**时间管理的哲学**​。

我本身并不擅长沟通，但是在项目实施中，我愈加体会到沟通是贯穿项目全周期的生命线。从前期与导师反复推敲项目目标、确定交付标准，到开发阶段针对方案的多轮技术探讨，直至后期维护方案的持续演变，每个环节都印证着一个事实——高质量的沟通本身就是技术实现的重要组成部分。这种认知让我开始有意识地培养自己的技术表达和沟通能力。

而在时间管理维度上，由于此次项目的实施阶段，我已经毕业参加工作，平衡全职工作与开源贡献的挑战远超预期。特别是程序开发的工作时间往往随着项目的进度“灵活安排”，面对职业任务与开源承诺的双重时间需求，我不得不直面资源分配的残酷现实：前期因在 Gradle 插件 API 上面花费了大量精力，恍然间发现时间竟已悄悄过半；中期在昼夜颠倒的编码调试中，又不得不妥协于某些有趣构想只能置于脑海。这种“时间赤字”的困境，最终转化为对敏捷规划和碎片时间利用上的重新审视和思考。

### 有哪些感想

站在这个节点回望，非常感谢这次社区给予的机会。我会重新出发，继续深耕开源这片土壤。​**因为真正的开源精神，本就是场永不停歇的接力——我们既是前人智慧结晶的继承者，也是未来技术图景的脚手架搭建者**​。

参考链接

[1]：[*https://www.sofastack.tech/projects/sofa-boot/sofa-ark-build-package-plugin/*](https://www.sofastack.tech/projects/sofa-boot/sofa-ark-build-package-plugin/)
