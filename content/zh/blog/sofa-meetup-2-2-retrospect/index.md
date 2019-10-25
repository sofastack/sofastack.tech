---
title: "基于 SOFAArk 和 SOFADashboard 实现动态模块管控 | Meetup#2 回顾"
author: "卫恒"
authorlink: "http://www.glmapper.com/"
description: "本文根据 5月26日 SOFA Meetup#2上海站 《使用 SOFAStack 快速构建微服务》主题分享整理，着重分享如何使用 SOFADashboard 来管控 SOFAArk ，对于 SOFAArk 中的一些基础概念和知识不过多涉及。"
categories: "SOFAMeetup"
tags: ["SOFAMeetup","SOFAArk","SOFADashboard"]
date: 2019-05-31T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563874034945-7e7f9e20-215a-44b2-9de3-2f8752f6b689.png"
---

作者：卫恒（宋国磊），SOFATracer 以及 SOFADashboard 开源负责人。

本文根据 5月26日 SOFA Meetup#2上海站 《使用 SOFAStack 快速构建微服务》主题分享整理，着重分享如何使用 SOFADashboard 来管控 SOFAArk ，对于 SOFAArk 中的一些基础概念和知识不过多涉及；建议大家在阅读之前，先了解下 SOFAArk 的相关基本知识。

现场回顾视频以及 PPT 见文末链接。

![SOFAMeetup#2 现场图](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1559117310833-d6012c29-5b4a-4288-8cda-f82170ccb949.jpeg)

## 前言

[SOFAArk](https://www.sofastack.tech/sofa-boot/docs/sofa-ark-readme) 是一款基于 Java 实现的轻量级类隔离容器，主要提供类隔离和应用（模块）合并部署能力，由蚂蚁金服开源贡献。[SOFAArk](https://www.sofastack.tech/sofa-boot/docs/sofa-ark-readme) 在 [0.6.0 版本](https://github.com/alipay/sofa-ark/releases/tag/v0.6.0) 提供了非常丰富的功能特性，其中最核心的当属多应用（模块）合并部署这个能力。[SOFAArk](https://www.sofastack.tech/sofa-boot/docs/sofa-ark-readme) 本身提供了多种方式来支持多应用（模块）合并部署 ，包括基于命令行的管控，基于 API 的管控等。本篇将结合 SOFA 开源的管控端组件 [SOFADashboard](https://github.com/sofastack/sofa-dashboard)，来实现 [SOFAArk](https://www.sofastack.tech/sofa-boot/docs/sofa-ark-readme) 提供的合并部署和动态模块推送的功能。

[案例工程地址](https://github.com/sofastack-guides/sofastack-dashboard-guides)

## 背景

复杂项目通常需要跨团队协作开发，各自负责不同的组件，而众所周知，协调跨团队合作开发会遇到不少问题；比如各自技术栈不统一导致的依赖冲突，又比如往同一个 Git 仓库提交代码常常导致 merge 冲突。因此，如果能让每个团队将负责的功能组件当成一个个单独的应用开发，运行时合并部署，通过统一的编程界面交互，那么将极大的提升开发效率及应用可扩展性。SOFAArk 提出了一种特殊的包结构 -- Ark Biz，用户可以使用 Maven 插件将应用打包成 Biz，允许多 Biz 在 SOFAArk 容器之上合并部署，并通过统一的编程界面交互。

![Ark Biz](https://cdn.nlark.com/yuque/0/2019/png/226702/1559114004491-659c9266-8b44-42db-bcc2-bcded3b54531.png)

## 案例模型

本篇所演示案例是上图的一个简化版，从整体上可以体现 SOFAArk多应用合并部署的能力。主要包括已经几个工程：

- sofa-dashboard-ark-hostapp : 宿主应用
- sofa-dashboard-ark-facade   : 提供接口 API
- sofa-dashboard-ark-provider ：提供接口 API 的具体实现，将发布一个 JVM 服务

sofa-dashboard-ark-hostapp 和 sofa-dashboard-ark-provider 均作为 SOFAArk 中的 ark-biz 存在；sofa-dashboard-ark-hostapp 作为宿主应用对外提供服务。

![模型](https://cdn.nlark.com/yuque/0/2019/png/226702/1559114004478-40141c52-1009-479e-bcac-16be47000927.png)

上图的模型中，在宿主应用不重启的情况下，实现  provider 模块的动态替换，从而实现版本升级。

> 在宿主应用启动时，provider 1.0.0 以静态合并部署方式“寄宿”到宿主应用中，这部分实际上与 SOFADashboard 管控是没有什么关系的，为了案例效果，在下面的案例中，关于静态合并部署的操作也会涉及到。

最终的工程结构图如下：

![工程结构图](https://cdn.nlark.com/yuque/0/2019/png/226702/1559114004468-373cc8a3-b54d-4f8b-9378-7bfe549211ac.png)

## 环境准备

本文需要启动 SOFADashboard 服务端，具体请参考 : [Quick Start](https://www.sofastack.tech/sofa-dashboard/docs/QuickStart) ；其他基础设施环境如 Zookeeper 、Mysql 等需提前准备。

## 工程构建

本篇将通过 step by step 的方式来构建整个工程，为大家在实际的应用过程中提供一种简单的思路，同时也帮助大家更好的理解 SOFAArk 中的一些点。

### sofa-dashboard-ark-facade

基础 API 提供模块，不需要依赖任何其他二方或者三方 JAR，这里仅提供一个接口。

```java
public interface SofaJvmService {
    String test();
}
```

### sofa-dashboard-ark-provider

这个模块是 JVM 服务的提供方，也是后面需要在宿主应用中进行替换演示的模块包，这个模块本身也是一个 Web 应用。这里就来一步步分解下，如何将一个普通的 SpringBoot 工程改造成一个 ark-biz 工程。

#### 1、新建一个 SpringBoot 工程

新建 SpringBoot 工程推荐的方式有两种，一种是在 [https://start.spring.io/](https://start.spring.io/)  进行下载，另外一种是基于 IDEA 的 Spring 插件来生成；此处不在过多描述过程。

#### 2、工程基本能力实现

- 引入 sofa-dashboard-ark-facade 依赖，先将需要提供的 JVM 服务实现：

```java
@SofaService
@Service
public class SofaJvmServiceImpl implements SofaJvmService {
    @Override
    public String test() {
        return "first version biz";
    }
}
```

> NOTE: SofaService 的作用是将一个 Bean 发布成一个 JVM 服务， 所以这里需要加上 Spring 提供的 @Service 注解将 SofaJvmServiceImpl 标注为一个 Bean。

- 配置文件：

```java
spring.application.name=biz-ark-test
server.port=8800
logging.path=./logs
```

#### 3、配置打包插件，将应用打包成 ark-biz  

根据官方文档，可以使用 sofa-ark-maven-plugin 插件将一个普通的工程打包成一个 ark biz 包。这里直接给出本篇中工程的配置：

```xml
 <plugin>
   <groupId>com.alipay.sofa</groupId>
   <artifactId>sofa-ark-maven-plugin</artifactId>
   <version>0.6.0</version>
   <executions>
     <execution>
       <!--goal executed to generate executable-ark-jar -->
       <goals>
         <goal>repackage</goal>
       </goals>
         <!--ark-biz 包的打包配置  -->
       <configuration>
         <!--是否打包、安装和发布 ark biz，详细参考 Ark Biz 文档，默认为false-->
         <attach>true</attach>
         <!--ark 包和 ark biz 的打包存放目录，默认为工程 build 目录-->
         <outputDirectory>target</outputDirectory>
         <!--default none-->
         <arkClassifier>executable-ark</arkClassifier>
         <!-- ark-biz 包的启动优先级，值越小，优先级越高-->
         <priority>200</priority>
         <!--设置应用的根目录，用于读取 ${base.dir}/conf/ark/bootstrap.application 配置文件，默认为 ${project.basedir}-->
         <baseDir>../</baseDir>
       </configuration>
     </execution>
   </executions>
</plugin>
```

#### 4、工程依赖

从前面背景介绍中的设计理念图中可以看出，动态合并部署需要依赖的插件核心有两个，一个是 runtime plugin，一个是 config plugin（没有涉及到 RPC 服务相关）；由于 provider 并不是作为宿主应用，其本身不需要具备动态配置的能力，因此这里仅需要引入 runtime plugin 来为当前 ark-biz 工程提供运行时环境即可。

```xml
<!-- runtime plugin -->
<dependency>
        <groupId>com.alipay.sofa</groupId>
        <artifactId>runtime-sofa-boot-plugin</artifactId>
</dependency>

<!-- 其他依赖 -->
<dependency>
    <groupId>com.alipay.sofa</groupId>
    <artifactId>healthcheck-sofa-boot-starter</artifactId>
</dependency>

<dependency>
        <groupId>com.glmapper.bridge.boot</groupId>
        <artifactId>sofa-dashboard-ark-facade</artifactId>
</dependency>

```

#### 5、编译打包

执行 mvn clean package ，之后会在当前模块的 target 目录下生成 xxx-ark-biz.jar 的包。

![target 目录下生成 xxx-ark-biz.jar 的包](https://cdn.nlark.com/yuque/0/2019/png/226702/1559114004476-6c7f9aa6-caff-48fa-971b-29322ffc1c88.png)

### sofa-dashboard-ark-host

前面已经构建好了所需要的一些基础工程，sofa-dashboard-ark-host 作为宿主应用，期望其具备的能力有以下几个：

- 提供可以直观的 check 模块变更后的结果
- 提供能够给 provider 1.0.0 版本 ark-biz 包运行的宿主环境
- 能够通过 SOFAArk 提供的状态 endpoint 查看插件状态
- 能够支持 Zookeeper 下发指令，控制 Biz 的生命周期

基于以上几点功能，下面来分步骤实现。

#### 1、提供一个简单的 Rest 接口来 check 结果

sofa-dashboard-ark-host 本身也是一个 Web 应用，所以在这个提供一个 Rest 接口，具体实现是通过@SofaReference 调用 provider ark-biz 包中发布的 JVM 服务。

```java
@RestController
public class TestController {

    @SofaReference
    SofaJvmService sofaJvmService;

    @RequestMapping("test")
    public String test(){
        return sofaJvmService.test();
    }
}
```

#### 2、作为宿主应用

- ARK 容器配置

这部分可以先参考阅读 [SOFAArk 配置](https://www.sofastack.tech/sofa-boot/docs/sofa-ark-ark-config)。本案例中简单配置了一份 ARK 容器的配置文件。

```xml
# log 日志目录
logging.path=./logs
# 指定zookeeper 服务地址
com.alipay.sofa.ark.config.address=zookeeper://localhost:2181
# 指定宿主应用名
com.alipay.sofa.ark.master.biz=host-app
```

com.alipay.sofa.ark.master.biz 默认情况下是宿主应用的 artifactId。如果这里指定了名字，则在宿主应用的插件配置里面需要使用此名字。

- 依赖引入

引入 sofa-ark-springboot-starter 、web-ark-plugin 以及 provider ark biz 包。

```xml
<!-- 引用ark starter-->
<dependency>
    <groupId>com.alipay.sofa</groupId>
    <artifactId>sofa-ark-springboot-starter</artifactId>
</dependency>
<!-- 引用ark web插件-->
<dependency>
    <groupId>com.alipay.sofa</groupId>
    <artifactId>web-ark-plugin</artifactId>
</dependency>
<!-- 引入 sofa-dashboard-ark-provider ark-biz ，这里属于静态合并部署情况-->
<dependency>
    <groupId>com.glmapper.bridge.boot</groupId>
    <artifactId>sofa-dashboard-ark-provider</artifactId>
    <version>1.0.0</version>
    <classifier>ark-biz</classifier>
</dependency>
```

- 插件配置

```xml
<plugin>
  <groupId>com.alipay.sofa</groupId>
  <artifactId>sofa-ark-maven-plugin</artifactId>
  <version>0.6.0</version>
  <executions>
    <execution>
      <id>default-cli</id>
      <goals>
        <goal>repackage</goal>
      </goals>
    </execution>
  </executions>
  <configuration>
    <!--指定优先级-->
    <priority>100</priority>
    <!--指定baseDir-->
    <baseDir>../</baseDir>
    <!--bizName,这里需要和 bootstrap 中指定的master.biz 配置保持一致，默认为 artifactId-->
    <bizName>host-app</bizName>
  </configuration>
</plugin>
```

#### 3、状态查看

SOFAArk 提供了 /bizState 这样一个 endpoint 用来获取当前插件的版本及状态信息。这里就在宿主应用中引入actuator 依赖并进行相关配置。

```xml
 <!-- 引用 actuator -->
 <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-actuator</artifactId>
 </dependency>
```

application.properties 中配置暴露所有端点。

```xml
management.endpoints.web.exposure.include=*
```

#### 4、提供动态配置插件能力

SOFAArk 提供了 config-ark-plugin 对接 Zookeeper 配置中心，用于运行时接受配置，达到控制 Biz 生命周期，引入如下依赖：

```xml
<!-- 引用ark 配置推送扩展插件-->
<dependency>
        <groupId>com.alipay.sofa</groupId>
        <artifactId>config-ark-plugin</artifactId>
</dependency>
```

参考 [SOFAArk 配置](https://www.sofastack.tech/sofa-boot/docs/sofa-ark-ark-config)，在 SOFAArk 配置文件 conf/ark/bootstrap.properties 增加如下配置：

```xml
com.alipay.sofa.ark.config.address=zookeeper://localhost:2181
```

## 静态合并部署演示

基于上述所有的配置，将 host-app 打包，然后运行。

- mvn clean install 
- java -jar sofa-dashboard-ark-hostapp-1.0.0.jar

下面可以通过 SOFAArk 提供的 endpoint 来查看下当前应用的 biz state 信息：

![当前应用的 biz state 信息](https://cdn.nlark.com/yuque/0/2019/png/226702/1559114004479-ddc33d4d-b913-408a-87d1-1ebf5fd31436.png)

这里只有宿主应用自身的 ark biz 状态信息，实际上我们使用了静态合并部署。但是貌似 ark-biz 合并部署的包插件没有在 bizState 中体现出来。访问下 [http://localhost:8085/test](http://localhost:8085/test) 我们的 check  rest 服务：

![提示信息](https://cdn.nlark.com/yuque/0/2019/png/226702/1559114004466-fa50a30b-47ff-438c-9985-e35da24c8a57.png)

提示出来没有可用的 JVM 服务。

这里有个点是并不会去激活里面的 ark biz 包，需要通过通过 终端或者 API 的方式来进行激活，实际上只是激活了宿主应用本身的 ark-biz。

## 通过 SOFADashboard 进行动态推送

SOFADashboard 进行推送的原理可以参考前面背景介绍中的描述。下面主要来介绍如何使用 SOFADashboard 进行动态模块切换。

### 注册插件

将 sofa-dashboard-ark-provider 这个 ark-biz 插件注册到 SOFADashboard：

![注册插件](https://cdn.nlark.com/yuque/0/2019/png/226702/1559114004485-6324ba8e-f25f-4cc0-ba24-86224abc0aed.png)

填写插件的基本信息：

![填写插件的基本信息](https://cdn.nlark.com/yuque/0/2019/png/226702/1559114004486-b120c6fe-bfff-44bf-a2a0-e8ce187014f9.png)

注册成功之后，模块列表如下：

![模块列表](https://cdn.nlark.com/yuque/0/2019/png/226702/1559114004525-9f856ea1-f67b-4106-9d31-299ad548dfe4.png)

### 增加版本

点击添加版本，弹出新增版本表单，输入版本信息及当前版本对应的 ark biz 包文件地址；支持从文件服务器（http 协议）上拉取，也支持从本地文件（File 协议）系统获取。下面为了方便，使用从文件系统中获取，配置如下：

![增加版本](https://cdn.nlark.com/yuque/0/2019/png/226702/1559114004507-bc08d3db-e774-4b5b-b54a-ed6b0a3e81a4.png)

添加成功之后，插件列表如下：

![插件列表](https://cdn.nlark.com/yuque/0/2019/png/226702/1559114004523-eab53cf4-cc80-4497-8b1a-cf8856490848.png)

### 关联应用

![关联应用](https://cdn.nlark.com/yuque/0/2019/png/226702/1559114004504-808e289f-14f0-4c52-b591-e08f7a1d6855.png)

点击插件列表后面的 关联应用案例，将插件与应用进行关联，如下：

![将插件与应用进行关联](https://cdn.nlark.com/yuque/0/2019/png/226702/1559114004511-13602632-623a-40b7-a240-bc78f42c19e4.png)

### 详情查看

点击插件列表后面的详情按钮，可以查看当前插件下所有应用信息和应用实例信息。

![详情查看](https://cdn.nlark.com/yuque/0/2019/png/226702/1559114004518-e84a9a5f-a875-4b6a-a4d2-b54b71ba1f9b.png)

### 命令推送

SOFADashboard 提供两种维度的命令推送：

- 基于应用维度，当前应用所有的实例都会监听到此命令变更；
- 基于 IP 维度，分组维度的单 IP 场景。

下面演示基于 IP 维度的推送：

#### 1、安装

点击安装，安装过程中，插件状态会发生变化， RESOLVED 状态为正在解析。

![RESOLVED 状态为正在解析](https://cdn.nlark.com/yuque/0/2019/png/226702/1559114004513-ea466fa1-9dbc-46c7-85d6-2ae1a65b9315.png)

延迟 1~3s 之后，状态变为 ACTIVATED 状态

![状态变为 ACTIVATED 状态](https://cdn.nlark.com/yuque/0/2019/png/226702/1559114004518-b72af822-fc1c-4f8b-a2ec-df1a92d7e3f9.png)

再次访问下 [http://localhost:8085/test](http://localhost:8085/test) 我们的 check rest 服务：

![访问 check rest 服务](https://cdn.nlark.com/yuque/0/2019/png/226702/1559114004531-226fe510-d20c-448b-9ca7-9fe549d282e9.png)

实现了在不重启宿主应用的情况下，实现了内部业务逻辑的变更。

#### 2、版本切换

模块版本 1 运行一段时间之后，出现新的需求，希望更改下模块版本 1 中的一些逻辑。在未使用动态模块的情况下，一般就需要新拉一个迭代，然后将原有的逻辑修改，然后发布上线。可能是一个非常小的功能点，但是却需要走复杂的发布流程。

这个就可以借助动态模块的方式来实现版本的动态切换。修改 sofa-dashboard-ark-provider  模块逻辑实现，升级版本，重新打包 sofa-dashboard-ark-provider 。

在 SOFADashboard ，新增 2.0.0 版本，并且配置指定的版本 ark-biz 包的文件地址。添加成功之后如下：

![添加成功之后](https://cdn.nlark.com/yuque/0/2019/png/226702/1559114004559-58d9ff51-7a44-4a08-9956-c5077479cdf1.png)

进入详情界面，切换版本到 2.0.0：

![切换版本到 2.0.0](https://cdn.nlark.com/yuque/0/2019/png/226702/1559114004530-912005d1-ec49-429e-9b87-ce7b07533f15.png)

执行安装，此时版本 2.0.0 状态将会变为非激活状态：

![此时版本 2.0.0 状态将会变为非激活状态](https://cdn.nlark.com/yuque/0/2019/png/226702/1559114004547-88bd8c45-ba50-411e-bf1e-baa6d6d14ec1.png)

执行点击激活按钮进行激活，延迟 1~3s 之后，状态变更为激活状态：

![状态变更为激活状态](https://cdn.nlark.com/yuque/0/2019/png/226702/1559114004559-3c0802ae-38bf-4b8c-9bf2-efc9ff9ab218.png)

再次访问下 [http://localhost:8085/test](http://localhost:8085/test) 我们的 check  rest 服务：

![访问 check rest 服务](https://cdn.nlark.com/yuque/0/2019/png/226702/1559114004563-1a43b7e7-ad36-4233-bbce-dce18bd7991f.png)

可以看到，版本 2.0.0 中的逻辑已经生效了；切回到 1.0.0 ，此时 1.0.0 的状态变成了非激活状态：

![此时 1.0.0 的状态变成了非激活状态](https://cdn.nlark.com/yuque/0/2019/png/226702/1559114004555-7b2ce3a9-eab0-4fc9-9570-ae64acf16241.png)

## 小结

本文分享了基于 SOFAArk 和 SOFADashboard 实现动态模块管控的能力。动态模块在实际业务中有非常丰富的场景，对主应用不发版，不重启的情况下实现具体模块的功能变更；在此基础上也可以实现版本灰度的能力。

本案例中，provider 也是一个独立的应用，其作为一个子模块在宿主应用 hostapp 中启动，因此也可以基于 SOFABoot 这种能力来实现多 Web 应用的合并部署的能力。

以上就是本次分享的全部内容。

## SOFA Meetup 上海站回顾资料

现场回顾视频以及 PPT ：[下载地址](http://t.cn/AiKlmCmE)