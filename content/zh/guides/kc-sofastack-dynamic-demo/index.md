---
title: "SOFABoot 动态模块实践"
description: "本指南将基于 SOFADashboard 的 ARK 管控能力来实现 SOFAArk 提供的合并部署和动态模块推送的功能。"
github: "https://github.com/sofastack-guides/kc-sofastack-dynamic-demo"
projects: [{name: "SOFAMesh", link: "https://github.com/sofastack/sofa-boot"}, {name: "SOFADashboard", link: "https://github.com/sofastack/sofa-dashboard"}, {name: "SOFAArk", link: "https://github.com/sofastack/sofa-ark"}]
---
# SOFABoot 动态模块实践

**注意：您需要自行部署后端环境依赖，并修改示例中的服务依赖地址即可使用。**

* [实验背景](#%E5%AE%9E%E9%AA%8C%E8%83%8C%E6%99%AF)
* [实验内容](#%E5%AE%9E%E9%AA%8C%E5%86%85%E5%AE%B9)
* [任务](#%E4%BB%BB%E5%8A%A1)
    * [任务准备](#1%E4%BB%BB%E5%8A%A1%E5%87%86%E5%A4%87)
    * [将 SOFABoot 应用打包成 ark 包](#2%E5%B0%86-sofaboot-%E5%BA%94%E7%94%A8%E6%89%93%E5%8C%85%E6%88%90-ark-%E5%8C%85)
        * [修改动态模块名称](#step1--%E4%BF%AE%E6%94%B9%E5%8A%A8%E6%80%81%E6%A8%A1%E5%9D%97%E5%90%8D%E7%A7%B0)
        * [配置动态模块的打包插件](#step2--%E9%85%8D%E7%BD%AE%E5%8A%A8%E6%80%81%E6%A8%A1%E5%9D%97%E7%9A%84%E6%89%93%E5%8C%85%E6%8F%92%E4%BB%B6)
    * [构建宿主应用](#3%E6%9E%84%E5%BB%BA%E5%AE%BF%E4%B8%BB%E5%BA%94%E7%94%A8)
        * [引入动态模块依赖](#step1--%E5%BC%95%E5%85%A5%E5%8A%A8%E6%80%81%E6%A8%A1%E5%9D%97%E4%BE%9D%E8%B5%96)
        * [宿主应用配置](#step2--%E5%AE%BF%E4%B8%BB%E5%BA%94%E7%94%A8%E9%85%8D%E7%BD%AE)
    * [打包 & 启动宿主应用](#4%E6%89%93%E5%8C%85--%E5%90%AF%E5%8A%A8%E5%AE%BF%E4%B8%BB%E5%BA%94%E7%94%A8)
    * [SOFADashboard 添加版本&管理应用](#5sofadashboard-%E7%AE%A1%E6%8E%A7%E7%AB%AF%E6%B7%BB%E5%8A%A0%E7%89%88%E6%9C%AC)
    * [查看详情 & 推送安装命令](#6%E6%9F%A5%E7%9C%8B%E8%AF%A6%E6%83%85--%E6%8E%A8%E9%80%81%E5%AE%89%E8%A3%85%E5%91%BD%E4%BB%A4)

## 实验背景

[kc-sofastack-demo](https://github.com/sofastack-guides/kc-sofastack-demo) 分享中已经通过 SOFAStack 快速构建了一个电商微服务应用，
并且完成了对应用服务调用链路的跟踪及应用状态的监控。

在电商系统中，平台方往往不会满足商品的自然排序展示，必定会根据某种规则来将部分商品放置在列表最瞩目的地方，
当然也可能是平台方通过收集用户行为动态的为每个不同的用户推荐不同的商品展示列表。

本实验背景就是基于[kc-sofastack-demo](https://github.com/sofastack-guides/kc-sofastack-demo)的基础上，
根据现场同学对每个商品的购买总数（通过订单统计）来对商品列表进行动态排序。

## 实验内容

通过 SOFABoot 提供的动态模块能力及 SOFADashboard 的动态模块管控能力，实现商品列表排序策略的动态变更。通过在不重启宿主机，不更改应用配置的情况下实现
应用行为的改变。

* 项目工程架构图如下

![image.png](https://gw.alipayobjects.com/mdn/rms_565baf/afts/img/A*ECEjR5hY0h0AAAAAAAAAAABkARQnAQ)

## 任务

### 1、任务准备

从 github 上将 demo 工程克隆到本地

```bash
git clone https://github.com/sofastack-guides/kc-sofastack-dynamic-demo.git
```

然后将工程导入到 IDEA 或者 eclipse。

### 2、将 SOFABoot 应用打包成 ark 包



#### step1 : 修改动态模块名称

> 在实际的应用场景中，不需要对其进行任何修改

如下图所示，对 dynamic-module/pom.xml 中的 artifactId 进行修改，将 {your-number} 修改为当前座位上的编号

![image.png](https://gw.alipayobjects.com/mdn/rms_ff360b/afts/img/A*3aiqQpJL7VwAAAAAAAAAAABkARQnAQ)

#### step2 : 配置动态模块的打包插件

在 dynamic-provider/pom.xml 中，增加 ark 打包插件，并进行配置：

![image.png](https://gw.alipayobjects.com/mdn/rms_ff360b/afts/img/A*y2BvRKG14JUAAAAAAAAAAABkARQnAQ)


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

### 3、构建宿主应用

在已下载下来的工程中，dynamic-stock-mng 作为实验的宿主应用工程模型。通过此任务，将 dynamic-stock-mng  构建成为动态模块的宿主应用。

#### step1 : 引入动态模块依赖

> 动态模块是通过 SOFAArk 组件来实现的，因此次数需要引入 SOFAArk 相关的依赖即可。关于 SOFAArk 可以参考[SOFABoot 类隔离](https://www.sofastack.tech/projects/sofa-boot/sofa-ark-readme/)
一节进行了解。

![image.png](https://gw.alipayobjects.com/mdn/rms_565baf/afts/img/A*lM_1SoNIXIYAAAAAAAAAAABkARQnAQ)

* SOFAArk 相关依赖

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
         <artifactId>dynamic-provider-{your-number}</artifactId>
         <version>1.0.0</version>
         <classifier>ark-biz</classifier>
     </dependency>
    ```
  将此配置文件中的 {your-number} 替换为当前座位编号

* 宿主应用打包插件

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
        <bizName>stock-mng-{your-number}</bizName>
      </configuration>
    </plugin>
    ```

  将打包插件中的 {your-number} 替换为当前座位上的编号，同样在实际的场景中是不需要的。这里是希望通过应用名来进行隔离，已达到各位在实际操作中不会相互干扰。

#### step2 : 宿主应用配置

* 动态模块配置

  在当前项目的根目录 /conf/ark/bootstrap.properties 配置文件中添加配置如下：

    ```properties
    # 日志根目录
    logging.path=./logs
    # 配置服务器地址
    com.alipay.sofa.ark.config.address=zookeeper://116.62.20.143:2181,116.62.148.186:2181,121.43.174.16:2181
    # 宿主应用名
    com.alipay.sofa.ark.master.biz=stock-mng-{your-number}
    ```
  com.alipay.sofa.ark.master.biz 配置项为指定的动态模块宿主应用的名称，需与宿主应用打包插件中的 bizName 配置项保持一致。
  因此需要将 {your-number} 也替换为当前座位前的编号。

* SOFADashboard 客户端配置

  在 dynamic-stock-mng 的 resource/application.properties 配置文件中添加配置如下：

    ```properties
    management.endpoints.web.exposure.include=*
    com.alipay.sofa.dashboard.zookeeper.address=116.62.20.143:2181,116.62.148.186:2181,121.43.174.16:2181
    #skip jvm health check to startup host-app
    com.alipay.sofa.boot.skip-jvm-reference-health-check=true
    ```

  同时将此配置文件中的 {your-number} 替换为当前座位编号:

    ```properties
    # 替换 {your-number}  为当前座位编号
    spring.application.name=stock-mng-{your-number} 
    ```

### 4、打包 & 启动宿主应用

#### 执行 mvn clean package

配置完成之后，执行 mvn clean package 进行打包，此时 dynamic-provider 会被打包成动态模块包，如下图所示：

![image.png](https://gw.alipayobjects.com/mdn/rms_ff360b/afts/img/A*c5enTa0foPsAAAAAAAAAAABkARQnAQ)

> 比如如果你填写的 {your-number} 为 00 ，则打包成功之后，会生成 dynamic-module/target 目录下 生成 dynamic-provider-00-1.0.0-ark-biz.jar 文件

#### 启动宿主应用

```bash
 java -jar dynamic-stock-mng/target/dynamic-stock-mng-1.0.0.jar
```

启动成功之后日志信息如下：

![image.png](https://gw.alipayobjects.com/mdn/rms_565baf/afts/img/A*3N_nS6P223IAAAAAAAAAAABkARQnAQ)

### 5、SOFADashboard 管控端添加版本

在实际的操作中，一般需要手动录入动态模块信息，本次 workshop 中为了方便大家操作，已经事先将 00-99 100 个插件录入到了数据库中。

请先现场下载：`sofa-dashboard-web-1.0.0-SNAPSHOT.jar` 这个已经打包好的 sofa-dashborad 启动包。

然后运行 `java -jar sofa-dashboard-web-1.0.0-SNAPSHOT.jar` 将它启动起来。

我们访问 http://localhost:8099/ 看到 sofa-dashboard 界面。

我们打开「Ark 管控 - 模块列表」菜单，可以看下如下信息：

![image.png](https://gw.alipayobjects.com/mdn/rms_ff360b/afts/img/A*F-RGTLZJYj8AAAAAAAAAAABkARQnAQ)

在查询框中输入你当前座位的编号，（例如你的编号为 66）：

![image.png](https://gw.alipayobjects.com/mdn/rms_ff360b/afts/img/A*x836RaqJ9QkAAAAAAAAAAABkARQnAQ)

点击查询之后将会索引到你的插件，此时可以基于此插件进行应用关联和版本添加。

* 关联应用

点击关联应用，将插件绑定到宿主应用。此处的宿主应用名为 dynamic-stock-mng application.properties 中的 spring.application.name 的值，
如 spring.application.name=stock-mng-66，则你当前操作的宿主应用名即为 stock-mng-66

![image.png](https://gw.alipayobjects.com/mdn/rms_ff360b/afts/img/A*ZdXDS6YCQp4AAAAAAAAAAABkARQnAQ)

* 添加版本

  目前 SOFADashboard 支持两种协议的文件获取方式，一种是基于 http 协议的，一种是基于 file 协议的。基于 http 协议即你可以将自己的动态模块包放在一个 http
服务器上，例如：http://ip:port/filePth 类型路径；基于 file 协议则是直接从文件系统获取动态模块包，例如：file://filePath。这里因为都是基于本地打包，所以使用 file
  协议。

  ![image.png](https://gw.alipayobjects.com/mdn/rms_ff360b/afts/img/A*ce6hR79Z-eQAAAAAAAAAAABkARQnAQ)

  例如我打包之后的文件位于 /Users/guolei.sgl/Downloads/kubecon/kc-sofastack-dynamic-demo/dynamic-provider/target 目录下，则需要在添加版本中填入的文件地址为：
  file:///Users/guolei.sgl/Downloads/kubecon/kc-sofastack-dynamic-demo/dynamic-provider/target/dynamic-provider-00-1.0.0-ark-biz.jar

  ![image.png](https://gw.alipayobjects.com/mdn/rms_ff360b/afts/img/A*b0wcQbCFOasAAAAAAAAAAABkARQnAQ)

  > dynamic-provider-00-1.0.0-ark-biz.jar 中 00 为你当前座位的编号

### 6、查看详情 & 推送安装命令

在执行安装之前，可以 先访问下 http://localhost:8080 ，此处因为还没有模块提供 jvm 服务，因此展示的是默认的排序顺序，如下所示：

![image.png](https://gw.alipayobjects.com/mdn/rms_565baf/afts/img/A*cKbZQIpM7GkAAAAAAAAAAABkARQnAQ)

点击当前插件后面的详情，进入插件详情页

![image.png](https://gw.alipayobjects.com/mdn/rms_565baf/afts/img/A*9gkxSoxPnqUAAAAAAAAAAABkARQnAQ)

然后点击安装，延迟 1~2s 之后，状态变更为 ACTIVATED ，为激活状态

![image.png](https://gw.alipayobjects.com/mdn/rms_565baf/afts/img/A*Eft7SbV1xFEAAAAAAAAAAABkARQnAQ)

此时再次访问 http://localhost:8080 ，结果如下：

![image.png](https://gw.alipayobjects.com/mdn/rms_ff360b/afts/img/A*-34JS7hBxAcAAAAAAAAAAABkARQnAQ)


> 此结果仅供参考，排序结果随商品对应的订单量而动态改变


## 更多

- [下载本次 Demo 幻灯片](https://gw.alipayobjects.com/os/basement_prod/763325e6-81c9-4961-9d24-5a4ba9970b36.pdf)。
