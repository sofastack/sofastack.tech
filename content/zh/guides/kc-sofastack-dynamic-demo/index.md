---
title: "SOFABoot 动态模块实践"
description: "本指南将基于 SOFADashboard 的 ARK 管控能力来实现 SOFAArk 提供的合并部署和动态模块推送的功能。"
github: "https://github.com/sofastack-guides/kc-sofastack-dynamic-demo"
projects: [{name: "SOFAMesh", link: "https://github.com/sofastack/sofa-boot"}, {name: "SOFADashboard", link: "https://github.com/sofastack/sofa-dashboard"}, {name: "SOFAArk", link: "https://github.com/sofastack/sofa-ark"}]
---

## 实验背景

[kc-sofastack-demo](https://github.com/sofastack-guides/kc-sofastack-demo) 分享中已经通过 SOFAStack 快速构建了一个电商微服务应用， 并且完成了对应用服务调用链路的跟踪及应用状态的监控。

在电商系统中，平台方往往不会满足商品的自然排序展示，必定会根据某种规则来将部分商品放置在列表最瞩目的地方， 当然也可能是平台方通过收集用户行为动态的为每个不同的用户推荐不同的商品展示列表。

本实验背景就是基于[kc-sofastack-demo](https://github.com/sofastack-guides/kc-sofastack-demo)的基础上， 根据现场同学对每个商品的购买总数（通过订单统计）来对商品列表进行动态排序。

## 实验内容

通过 SOFABoot 提供的动态模块能力及 SOFADashboard 的动态模块管控能力，实现商品列表排序策略的动态变更。通过在不重启宿主机，不更改应用配置的情况下实现 应用行为的改变。

- 项目工程架构图如下

[![image.png](https://camo.githubusercontent.com/b22fa0a55b59b6e403b0180d6f06b4336496e94d/68747470733a2f2f67772e616c697061796f626a656374732e636f6d2f6d646e2f726d735f3536356261662f616674732f696d672f412a4543456a523568593068304141414141414141414141426b4152516e4151)](https://camo.githubusercontent.com/b22fa0a55b59b6e403b0180d6f06b4336496e94d/68747470733a2f2f67772e616c697061796f626a656374732e636f6d2f6d646e2f726d735f3536356261662f616674732f696d672f412a4543456a523568593068304141414141414141414141426b4152516e4151)

## 任务

### 1、任务准备

从 github 上将 demo 工程克隆到本地

```
git clone https://github.com/sofastack-guides/kc-sofastack-dynamic-demo.git
```

然后将工程导入到 IDEA 或者 eclipse。

### 2、将 SOFABoot 应用打包成 ark 包

在下图所示的工程 pom 配置中，增加 ark 打包插件，并进行配置：

[![image.png](https://camo.githubusercontent.com/eabfb284fb831eba43eb6fa2b098681bf9f510be/68747470733a2f2f67772e616c697061796f626a656374732e636f6d2f6d646e2f726d735f3536356261662f616674732f696d672f412a32637058514a4d5a3858384141414141414141414141426b4152516e4151)](https://camo.githubusercontent.com/eabfb284fb831eba43eb6fa2b098681bf9f510be/68747470733a2f2f67772e616c697061796f626a656374732e636f6d2f6d646e2f726d735f3536356261662f616674732f696d672f412a32637058514a4d5a3858384141414141414141414141426b4152516e4151)

#### step1 : 将 ark 打包插件及配置粘贴在上图指定位置中

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

#### step2 : 配置完成之后，执行 mvn clean package 进行 打包，成功之后如下图所示

[![image.png](https://camo.githubusercontent.com/9d84ecd6fd3464330fa7a88fa27c5d81ac6d87aa/68747470733a2f2f67772e616c697061796f626a656374732e636f6d2f6d646e2f726d735f3536356261662f616674732f696d672f412a5831657854624d337233634141414141414141414141426b4152516e4151)](https://camo.githubusercontent.com/9d84ecd6fd3464330fa7a88fa27c5d81ac6d87aa/68747470733a2f2f67772e616c697061796f626a656374732e636f6d2f6d646e2f726d735f3536356261662f616674732f696d672f412a5831657854624d337233634141414141414141414141426b4152516e4151)

### 3、构建宿主应用

在已下载下来的工程中，dynamic-stock-mng 作为实验的宿主应用工程模型。通过此任务，将 dynamic-stock-mng 构建成为动态模块的宿主应用。

#### step1 : 引入 ark 动态配置依赖金和配置打包插件

[![image.png](https://camo.githubusercontent.com/9adfc49d58286d3a180881532feac23be08bfd0c/68747470733a2f2f67772e616c697061796f626a656374732e636f6d2f6d646e2f726d735f3536356261662f616674732f696d672f412a6c4d5f31536f4e495849594141414141414141414141426b4152516e4151)](https://camo.githubusercontent.com/9adfc49d58286d3a180881532feac23be08bfd0c/68747470733a2f2f67772e616c697061796f626a656374732e636f6d2f6d646e2f726d735f3536356261662f616674732f696d672f412a6c4d5f31536f4e495849594141414141414141414141426b4152516e4151)

1、SOFAArk 相关依赖

```xml
<dependency>
  <groupId>com.alipay.sofa</groupId>
  <artifactId>sofa-ark-springboot-starter</artifactId>
</dependency>
<dependency>
  <groupId>com.alipay.sofa</groupId>
  <artifactId>web-ark-plugin</artifactId>
</dependency>
<dependency>
  <groupId>com.alipay.sofa</groupId>
  <artifactId>config-ark-plugin</artifactId>
</dependency>
<dependency>
  <groupId>io.sofastack</groupId>
  <artifactId>dynamic-provider</artifactId>
  <version>1.0.0</version>
  <classifier>ark-biz</classifier>
</dependency>
```

2、宿主应用打包插件

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
    <priority>100</priority>
    <baseDir>../</baseDir>
    <bizName>stock-mng</bizName>
  </configuration>
</plugin>
```

#### step2 : 宿主应用配置

**1、动态模块配置**

在 /conf/ark/bootstrap.properties 配置文件中添加配置如下：

```ini
# 日志根目录
logging.path=./logs
# 配置服务器地址
com.alipay.sofa.ark.config.address=zookeeper://zookeeper-1-dev.sofastack.tech:2181
# 宿主应用名
com.alipay.sofa.ark.master.biz=stock-mng
```

**2、 Dashboard 客户端配置**

在 dynamic-stock-mng 的 resource/application.properties 配置文件中添加配置如下：

```ini
management.endpoints.web.exposure.include=*
com.alipay.sofa.dashboard.zookeeper.address=zookeeper-1-dev.sofastack.tech:2181
#skip jvm health check to startup host-app
com.alipay.sofa.boot.skip-jvm-reference-health-check=true
```

#### 4、打包宿主应用 & 启动

- step 1 ： mvn clean package 打包
- step 2 ： 启动宿主应用

```bash
 java -jar dynamic-stock-mng/target/dynamic-stock-mng-1.0.0.jar
```

启动成功之后日志信息如下：

[![image.png](https://camo.githubusercontent.com/fd141e2d5c7df5349c1acbd272151197c21135fa/68747470733a2f2f67772e616c697061796f626a656374732e636f6d2f6d646e2f726d735f3536356261662f616674732f696d672f412a334e5f6e533650323233494141414141414141414141426b4152516e4151)](https://camo.githubusercontent.com/fd141e2d5c7df5349c1acbd272151197c21135fa/68747470733a2f2f67772e616c697061796f626a656374732e636f6d2f6d646e2f726d735f3536356261662f616674732f696d672f412a334e5f6e533650323233494141414141414141414141426b4152516e4151)

#### 5、Dashboard 管控端注册插件信息

点击新建，弹出注册插件框，输入插件信息和描述信息，执行确定

[![image.png](https://camo.githubusercontent.com/dfd50cf333fdf97e9a1d39a355b7b3e042b43d52/68747470733a2f2f67772e616c697061796f626a656374732e636f6d2f6d646e2f726d735f3536356261662f616674732f696d672f412a5849644f537263517746384141414141414141414141426b4152516e4151)](https://camo.githubusercontent.com/dfd50cf333fdf97e9a1d39a355b7b3e042b43d52/68747470733a2f2f67772e616c697061796f626a656374732e636f6d2f6d646e2f726d735f3536356261662f616674732f696d672f412a5849644f537263517746384141414141414141414141426b4152516e4151)

#### 6、Dashboard 管控端添加版本

此处需要填写文件的绝对路径或者对应的 url 资源地址，这里以 file 协议为例

[![image.png](https://camo.githubusercontent.com/14d46d1bdec60a6f162d12705e0229a7bb233c94/68747470733a2f2f67772e616c697061796f626a656374732e636f6d2f6d646e2f726d735f3536356261662f616674732f696d672f412a4d633649544c4f4554344d4141414141414141414141426b4152516e4151)](https://camo.githubusercontent.com/14d46d1bdec60a6f162d12705e0229a7bb233c94/68747470733a2f2f67772e616c697061796f626a656374732e636f6d2f6d646e2f726d735f3536356261662f616674732f696d672f412a4d633649544c4f4554344d4141414141414141414141426b4152516e4151)

#### 7、Dashboard 管控端关联应用

[![image.png](https://camo.githubusercontent.com/e72e8ee5b6c7c680ddb5605c8f67cf422ce5c104/68747470733a2f2f67772e616c697061796f626a656374732e636f6d2f6d646e2f726d735f3536356261662f616674732f696d672f412a50766e51523730306751384141414141414141414141426b4152516e4151)](https://camo.githubusercontent.com/e72e8ee5b6c7c680ddb5605c8f67cf422ce5c104/68747470733a2f2f67772e616c697061796f626a656374732e636f6d2f6d646e2f726d735f3536356261662f616674732f696d672f412a50766e51523730306751384141414141414141414141426b4152516e4151)

#### 8、查看详情 & 推送安装命令

点击上图中的 详情，进入插件详情页

[![image.png](https://camo.githubusercontent.com/688738d54a5425a53eae68f8ed7ccf9b25f2c0b7/68747470733a2f2f67772e616c697061796f626a656374732e636f6d2f6d646e2f726d735f3536356261662f616674732f696d672f412a39676b78536f78506e71554141414141414141414141426b4152516e4151)](https://camo.githubusercontent.com/688738d54a5425a53eae68f8ed7ccf9b25f2c0b7/68747470733a2f2f67772e616c697061796f626a656374732e636f6d2f6d646e2f726d735f3536356261662f616674732f696d672f412a39676b78536f78506e71554141414141414141414141426b4152516e4151)

在执行安装之前，可以 先访问下 [http://localhost:8080](http://localhost:8080/) ，此处因为还没有模块提供 jvm 服务，因此展示的是默认的排序顺序，如下所示：

[![image.png](https://camo.githubusercontent.com/0b1dcf9621780fe06de8c5165beb8e3921f7f04e/68747470733a2f2f67772e616c697061796f626a656374732e636f6d2f6d646e2f726d735f3536356261662f616674732f696d672f412a634b625a5149704d37476b4141414141414141414141426b4152516e4151)](https://camo.githubusercontent.com/0b1dcf9621780fe06de8c5165beb8e3921f7f04e/68747470733a2f2f67772e616c697061796f626a656374732e636f6d2f6d646e2f726d735f3536356261662f616674732f696d672f412a634b625a5149704d37476b4141414141414141414141426b4152516e4151)

然后点击安装，延迟1~2s之后，状态变更为 ACTIVATED ，为激活状态

[![image.png](https://camo.githubusercontent.com/da83c6f08fbd8b1f2a5a73ea106f989a74b2241d/68747470733a2f2f67772e616c697061796f626a656374732e636f6d2f6d646e2f726d735f3536356261662f616674732f696d672f412a45667437536256317846454141414141414141414141426b4152516e4151)](https://camo.githubusercontent.com/da83c6f08fbd8b1f2a5a73ea106f989a74b2241d/68747470733a2f2f67772e616c697061796f626a656374732e636f6d2f6d646e2f726d735f3536356261662f616674732f696d672f412a45667437536256317846454141414141414141414141426b4152516e4151)

此时再次访问 [http://localhost:8080](http://localhost:8080/) ，结果如下：

[![image.png](https://camo.githubusercontent.com/2202e8c2cab3574d6eb1c8ee81bcd141d3605746/68747470733a2f2f67772e616c697061796f626a656374732e636f6d2f6d646e2f726d735f3536356261662f616674732f696d672f412a72473861544b6c3767364d4141414141414141414141426b4152516e4151)](https://camo.githubusercontent.com/2202e8c2cab3574d6eb1c8ee81bcd141d3605746/68747470733a2f2f67772e616c697061796f626a656374732e636f6d2f6d646e2f726d735f3536356261662f616674732f696d672f412a72473861544b6c3767364d4141414141414141414141426b4152516e4151)

 