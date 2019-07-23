---
title: "快速开始"
aliases: "/sofa-acts/docs/GettingStarted"
---

本文档共分为四部分：

- 第一部分：在 Intellij IDEA 上安装 ACTS IDE 可视化编辑器；
- 第二部分：向您介绍如何在多模块工程中引入 ACTS 依赖；
- 第三部分：测试模块下一键搭建 ACTS 框架以管理后续 ACTS 用例；
- 第四部分：一键生成 ACTS 测试脚本；

## 1.安装 ACTS IDE

__推荐使用 Intellij IDEA 2017，为了您的安全，请仅从该下载源获取 ACTS IDE 安装包：__
[点击下载 ACTS IDE](https://gw.alipayobjects.com/os/basement_prod/5436d6bc-0390-4db1-9ec7-54e287c731f6.zip)，

本地磁盘安装：Preference -> Plugins -> Install plugin from disk -> Restart IDEA 即可。
![安装 ACTS IDE](install-acts-ide.png)

## 2.引入 ACTS 依赖

在引入依赖之前，需要您的应用是一个多模块工程（包含 test 模块），后续 ACTS 会将全部的测试代码放置在 test 模块下以便管理 ACTS 用例。

您可以依据应用的具体情况，选择性阅读以下内容：

应用已经是完整的多模块工程，可参考文档 2.1 部分，帮助您引入 ACTS 依赖；
应用是多模块工程但无 test 模块，可参考文档 2.2 部分，帮助您快速添加 test 模块；
应用不是一个多模块工程，可参考文档 2.3 部分，帮助您快速构建多模块工程。
如果还没有创建工程，可参考 SOFABoot 快速开始搭建应用。

### 2.1多模块应用-包含 test 模块

只需在 test 模块的 pom.xml 中引入 acts-bom 即可。

```xml
<dependency>
    <groupId>com.alipay.sofa.acts</groupId>
    <artifactId>acts-bom</artifactId>
    <version>${acts.version}</version>
    <type>pom</type>
</dependency>
```

### 2.2多模块应用-无 test 模块

这里是使用 Intellij IDEA 来创建子模块。

对着父工程右键 -> New -> Module -> 输入 test 模块名字（一般是 appname-test），分步示例图如下：

#### 第一步：新建 test 模块

![新建 Module](new-module.png)

![选择 Maven](select-maven.png)

![填写 ArtifactId](enter-artifactId.png)

![Module name](module-name.png)

#### 第二步：管理 test 模块

在父工程的 pom.xml 中管理刚刚新建的 test 模块。

![管理 test 模块](manage-test-module.png)

#### 第三步：依赖 ACTS 引入

最后，找到刚刚新建的 test 模块，并在其 pom.xml 中引入 acts-bom 即可。

```xml
<!-- 引入包含 SOFABootApplication 的 pom -->
<dependency>
    <groupId>com.example</groupId>
    <artifactId>example-service</artifactId>
</dependency>

<!-- 引入 ACTS 依赖 -->
<dependency>
    <groupId>com.alipay.sofa.acts</groupId>
    <artifactId>acts-bom</artifactId>
    <version>${acts.version}</version>
    <type>pom</type>
</dependency>
```

### 2.3非多模块应用

如果你已经有了一个不错的 SOFABoot 应用，但它不是一个多模块应用，下面的内容将帮助你快速地将现有工程构建为多模块工程。

#### 第一步：新建父工程

创建好一个 SOFABoot 工程，然后删除无关的文件，只需保留 pom.xml 文件。

![pom file.png](pom-file.png)

#### 第二步：新建子模块

新建子工程模块，将原有应用作为子工程并入父工程下，相关依赖管理提到父工程中。以新建 service 模块和 test 模块为例。

![new sub-modules](new-sub-modules.png)

![ArtifactId of service module](artifactId-service.png)

![ArtifactId of test module](artifactId-test.png)

#### 第三步：管理子模块

![manage sub-modules](manage-sub-modules.png)

#### 第四步：依赖引入

最后，在 test 模块的 pom.xml 文件中引入 acts-bom 即可。

```xml
<dependency>
    <groupId>com.alipay.sofa.acts</groupId>
    <artifactId>acts-bom</artifactId>
    <version>${acts.version}</version>
    <type>pom</type>
</dependency>
```

## 3.一键初始化 ACTS 测试框架

下面只需要你轻轻动动手指即可完成初始化工作。在图3.2中，您需要正确填写**应用名称**并选择适合应用的**编码格式**。

有关一键初始化生成的文件有何作用，可以参考 ACTS 使用手册的[框架准备](../usage-ready/#一键配置的说明)部分。

![一键初始化 ACTS](initialize-acts.png)

![确定初始化](confirm.png)

## 4.一键生成测试脚本

### 4.1启动类

将 service 模块中的启动类，如 SOFABootApplication 拷贝到 test 模块，并增加需要加载的配置文件：`classpath*:META-INF/spring/acts-core.xml`

![启动类](start-class.png)

### 4.2测试脚本

前提条件：务必 mvn 编译工程和生成对象模型，否则会造成 ACTS IDE 不可预料的错误，如无法编辑、数据不正确等。

接口定义的方法上点击，选择 ACTS 功能 -> 生成测试用例，并在刚生成的测试脚本中矫正 SOFABoot 启动类的 import 位置。

![生成测试用例](generate-test-case.png)

![测试脚本生成](test-script-generation-wizard.png)

![生成内容](generated-content.png)
