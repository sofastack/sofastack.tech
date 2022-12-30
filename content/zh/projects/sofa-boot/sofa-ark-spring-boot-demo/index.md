---
title: "Spring Boot 应用如何结合 SofaArk"
aliases: "/sofa-boot/docs/sofa-ark-spring-boot-demo"
---

借助 SofaArk 框架，一个普通的 Java 应用可拆分为一个宿主应用（master biz，又称“基座”）与多个业务应用（普通 biz，又称“模块”）的模式，细化研发粒度，以此实现更快速的研发运维。本文将介绍 Spring Boot 应用如何结合 SofaArk 框架，以此构建宿主应用与业务应用。文章由以下七点展开：

1. 简介
2. 如何构建 Spring Boot 业务应用
3. 如何构建 Spring Boot 宿主应用
4. 如何执行 Spring Boot 宿主应用
5. 如何执行 Spring Boot 业务应用
6. 多 Host 与单 Host 模式
7. 如何动态卸载 Spring Boot 业务应用

## 1. 简介

宿主应用（master biz）负责沉淀通用的逻辑，为业务应用提供计算和环境，为业务应用的开发者屏蔽基础设施，更新迭代较慢。各个业务应用（普通 biz）是独立的代码仓库，可以进行独立的研发运维，粒度小，更新迭代较快。业务应用将通用的依赖下沉至宿主应用，依赖宿主应用的环境运行，不是一个 可执行 Jar，因此业务应用自身的 jar 包可以不包含该通用依赖，以此得到轻量化的业务应用 jar 包。

宿主应用与业务应用的运行关系是：宿主应用首先启动，拥有与普通应用相同的类加载器；业务应用 jar 包以热拔插的模式在宿主应用中动态部署，通用依赖通过宿主应用的类加载器加载，其它依赖使用业务自己的BizClassLoader进行加载。

本文中宿主应用和业务应用均为 Web 应用，采用了单 host 模式，其样例代码地址如下：

- Spring Boot 宿主应用：[Spring Boot 宿主应用](https://github.com/sofastack-guides/sofa-ark-spring-guides)
- Spring Boot 业务应用：[Spring Boot 业务应用](https://github.com/sofastack-guides/spring-boot-ark-biz.git)

## 2. 如何构建 Spring Boot 业务应用

业务应用是一种普通 Biz，换而言之，“如何构建业务应用”即为“如何构建普通 Ark Biz”，`Ark Biz`的介绍请详见[Ark Biz](https://www.sofastack.tech/projects/sofa-boot/sofa-ark-ark-biz/)。

### 2.1 依赖配置

首先，我们需要把业务应用构建成一种 SofaArk 框架可识别的`Ark Biz`，即：使用`Ark Biz`打包构建的依赖，配置如下：

```xml
  <build>
    <plugins>
      <plugin>
        <groupId>com.alipay.sofa</groupId>
        <artifactId>sofa-ark-maven-plugin</artifactId>
        <version>{sofa.ark.version}</version> <!-- 建议使用最新版本-->
        <executions>
          <execution>
            <id>default-cli</id>
            <goals>
              <goal>repackage</goal>
            </goals>
          </execution>
        </executions>
        <configuration>
          <skipArkExecutable>true</skipArkExecutable> <!-- 不生成可执行 fat jar-->
          <outputDirectory>./target</outputDirectory> <!-- 生成的 Ark Biz 所在目录-->
          <bizName>spring-boot-ark-biz</bizName> <!-- Ark Biz 名字-->
<!-- webContextPath 是单 host 模式下的必要配置，详细配置见 5. 多 host 模式与单 host 模式 -->
          <webContextPath>biz</webContextPath>  <!-- 同一个host中设置不同的webContextPath-->
<!-- declaredMode 开启后，业务应用可以使用自己声明过的、且宿主应用拥有的通用依赖-->
          <declaredMode>true</declaredMode> <!-- 使用宿主应用的通用依赖-->
        </configuration>
      </plugin>
<!--  此处不使用 spring boot 应用的原有构建依赖-->      
<!--      <plugin>-->
<!--        <groupId>org.springframework.boot</groupId>-->
<!--        <artifactId>spring-boot-maven-plugin</artifactId>-->
<!--      </plugin>-->
    </plugins>
  </build>
```

其次，由于业务应用运行时使用宿主应用的通用依赖，因此业务应用需要“排除”通用依赖，即：把 scope 设置成 provided。[本样例代码](https://github.com/sofastack-guides/spring-boot-ark-biz)中，业务应用直接使用宿主应用的 spring boot 各项依赖，配置如下：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter</artifactId>
    <scope>provided</scope>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
    <scope>provided</scope>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-logging</artifactId>
    <scope>provided</scope>
</dependency>
```

### 2.2 打包

首先，使用 maven 打包业务应用，如下：

```shell
mvn clean package -Dmaven.test.skip=true
```

在之前设定的 outputDirectory 目录下，后缀为ark-biz.jar的包是业务应用的 Ark Biz，如：

- spring-boot-ark-biz-0.0.1-SNAPSHOT-ark-biz.jar

## 3. 如何构建 Spring Boot 宿主应用

Spring Boot 宿主应用和 Spring Boot 普通应用没有任何区别，打包插件保持不变。宿主应用包含多个业务应用的通用依赖（包括 SofaArk 依赖），为业务应用提供通用逻辑和环境。首先我们介绍Ark相关的依赖配置，然后以样例代码介绍通用依赖。

Ark相关的依赖配置如下：

```xml
<dependency>
    <groupId>com.alipay.sofa</groupId>
    <artifactId>sofa-ark-springboot-starter</artifactId> <!-- spring boot 宿主应用的必要依赖-->
    <version>${sofa.ark.version}</version>
</dependency>
<dependency>
    <groupId>com.alipay.sofa</groupId>
    <artifactId>sofa-ark-all</artifactId>
    <version>${sofa.ark.version}</version>
</dependency>
<dependency>
    <groupId>com.alipay.sofa</groupId>
    <artifactId>sofa-ark-api</artifactId>
    <version>${sofa.ark.version}</version>
</dependency>
```

由于业务应用将通用依赖下沉至宿主应用，因此宿主应用必须包含这些通用依赖，否则启动业务应用将因找不到对应依赖而失败。[本样例代码](https://github.com/sofastack-guides/sofa-ark-spring-guides)中，宿主应用的 spring boot 通用依赖配置如下：

```xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter</artifactId>
</dependency>
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-logging</artifactId>
</dependency>
```

另外，由于本宿主应用样例使用单 host 模式，因此需要添加 web-ark-plugin 依赖。配置如下：

```xml
  <dependency>
    <groupId>com.alipay.sofa</groupId>
    <artifactId>web-ark-plugin</artifactId>
    <version>${sofa.ark.version}</version>
  </dependency>
```

## 4. 如何执行 Spring Boot 宿主应用

宿主应用作为一种普通应用有两种执行方式：一是 IDEA 运行，二是打包运行可执行 jar 包。

### 4.1 IDEA 运行

IDEA 运行需要先在 IDEA 的启动配置（Run Configurations）中添加虚拟机参数（VM Options）`-Dsofa.ark.embed.enable=true`，然后再运行。

正常运行的截图为：

- Ark Container 成功启动

![](https://gw.alipayobjects.com/mdn/rms_10eaa2/afts/img/A*po9CSo832lQAAAAAAAAAAAAAARQnAQ#crop=0&crop=0&crop=1&crop=1&id=o7Q2h&originHeight=564&originWidth=1840&originalType=binary&ratio=1&rotation=0&showTitle=false&status=done&style=none&title=)

- 宿主应用正常启动

![](https://gw.alipayobjects.com/mdn/rms_10eaa2/afts/img/A*grssQq4_N04AAAAAAAAAAAAAARQnAQ#crop=0&crop=0&crop=1&crop=1&id=iXWfz&originHeight=1042&originWidth=1676&originalType=binary&ratio=1&rotation=0&showTitle=false&status=done&style=none&title=)

### 4.2 打包运行

打包运行先使用`spring-boot-maven-plugin`打包 Spring boot 宿主项目为 Fat Jar，然后通过命令行运行。首先，使用构建配置如下：

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
            <version>2.6.6</version>

            <configuration>
                <outputDirectory>target</outputDirectory> <!-- 生成的 可执行 Jar 包所在目录-->
                <classifier>ark-biz</classifier> <!-- 可执行 Jar 包的后缀-->
            </configuration>
            <executions>
                <execution>
                    <id>package</id>
                    <goals>
                        <goal>repackage</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```

然后，使用 maven 命令打包：

```shell
mvn clean package -Dmaven.test.skip=true
```

打包成功后，在之前设定的 outputDirectory 目录下，后缀为ark-biz.jar的包是宿主应用的 Fat Jar，如：

- sofa-ark-spring-guides-0.0.1-SNAPSHOT-ark-biz.jar

最后，通过命令行运行：

```shell
java -jar -Dsofa.ark.embed.enable=true sofa-ark-spring-guides-0.0.1-SNAPSHOT-ark-biz.jar
```

正常运行的截图同 IDEA 运行。

## 5. 如何执行 Spring Boot 业务应用

业务应用依赖宿主应用执行，因此需要在宿主应用成功运行之后，利用 Telnet 工具进行安装执行。Telnet 工具的详细介绍见 [Telnet 指令](https://www.sofastack.tech/projects/sofa-boot/sofa-ark-ark-telnet/)。

在宿主应用运行后，连接 Telnet ，以`file:\\\`（Win）或`file:///`（Mac）为前缀，通过业务应用 ark-biz.jar 包的本地地址安装，如下：

```bash
## 连接 SOFAArk telnet
> telnet localhost 1234

## 安装新模块 spring-boot-ark-biz
# win 系统安装
sofa-ark>biz -i file:\\\{本地目录}\\spring-boot-ark-biz\\target\\spring-boot-ark-biz-0.0.1-SNAPSHOT-ark-biz.jar
# mac 系统安装
sofa-ark>biz -i file:///{本地目录}/spring-boot-ark-biz/target/spring-boot-ark-biz-0.0.1-SNAPSHOT-ark-biz.jar
Start to process install command now, pls wait and check.

## 查看安装的模块信息
sofa-ark>biz -a
sofa-ark-spring-guides:1.0.0:activated          // 宿主应用
spring-boot-ark-biz:0.0.1-SNAPSHOT:activated    // 动态安装的模块应用
biz count = 2
```

此时 JVM 中运行了两个 Spring Boot 应用，均采用宿主应用的 Spring Boot 依赖加载，因此业务应用成功启动后的输出为：

```bash
SpringBootArkBizApplication start!
SpringBootArkBizApplication spring boot version: 2.6.6
SpringBootArkBizApplication classLoader: com.alipay.sofa.ark.container.service.classloader.BizClassLoader@366c5b
```

## 6. 多 host 模式与单 host 模式

当多个合并部署的 Spring Boot 应用为 Web 应用时，对外提供服务有两种模式，分别是多 host 模式和单 host 模式，其含义如下：

- 多 host 模式是指：每个 Biz 应用拥有各自的 Server 和 Host，使得一个 Jvm 进程中包含了多个 Server 及其 Host，用多个 Host 对外提供服务。这种模式下重复创建了 Tomcat 等相关资源，造成了资源浪费；
- 单 host 模式是指：多个 Biz 应用共用单个 Server 和 Host，一个 Jvm 进程中仅包含一个 Server 及其 Host，用单个 Host 多个 WebContextPath 对外提供服务。

在 Spring Boot 应用中，始终建议宿主应用与业务应用使用相同版本的 Spring Boot 依赖。在此前提下，我们在此分别介绍多 host 模式和单 host 模式。

### 6.1 多 host 模式

在配置上，多 host 模式相较于 单 host 模式有两个区别，一是每个应用需要配置不同端口，二是宿主应用无需 web-ark-plugin 依赖。此处首先介绍配置，然后介绍运行。

**端口配置**

由于不同的 Biz 应用拥有各自的端口，因此需要在每个 Web 应用（包括 Web 业务应用及 Web 宿主应用）指定不同的端口号。接下来，我们结合样例仓库代码介绍：

对于[业务应用样例](https://github.com/sofastack-guides/spring-boot-ark-biz)，配置 application.properties 如下：

```properties
spring.application.name=biz
logging.file.path=./logs
# 指定端口为8081
server.port=8081 
```

对于[宿主应用样例](https://github.com/sofastack-guides/sofa-ark-spring-guides)，application.properties 如下：

```properties
spring.application.name=base
logging.file.path=./logs
# 不指定端口，默认端口号为8080
```

**依赖配置**

只需要修改宿主应用的依赖配置，即：**保证无 web-ark-plugin 依赖**。配置如下：

```xml
<!--   <dependency>
    <groupId>com.alipay.sofa</groupId>
    <artifactId>web-ark-plugin</artifactId>
    <version>${sofa.ark.version}</version>
  </dependency> -->
```

**运行宿主应用与业务应用**

按照[第4节](#jfVbQ)和[第5节](#edkzZ)运行，此时宿主应用以8080端口提供服务，业务应用以8081端口提供服务。因此，可以通过 [http://localhost:8081/](http://localhost:8081/) 访问到业务应用，可以看到返回 `hello to ark dynamic deploy`。

### 6.2 单 host 模式

在单 host 模式下，所有应用使用相同端口，不同的`WebPathContext`，因此在配置上，需要为每个业务应用配置不同`WebPathContext`，然后为宿主应用添加 web-ark-plugin 依赖。此处首先介绍配置，然后介绍运行。

**WebPathContext 配置**

以[业务应用样例](https://github.com/sofastack-guides/spring-boot-ark-biz)为例，配置 sofa-ark-maven-plugin 中的`WebPathContext`，如下：

```xml
<build>
  <plugins>
    <plugin>
      <groupId>com.alipay.sofa</groupId>
      <artifactId>sofa-ark-maven-plugin</artifactId>
      <version>{sofa.ark.version}</version> <!-- 建议使用最新版本-->
      <!-- ... -->
      <configuration>
        <!-- ... -->
        <!-- 同一个host中设置不同的webContextPath  -->
        <webContextPath>biz</webContextPath>  <!-- 该业务应用的 webContextPath 为 biz-->
      </configuration>
    </plugin>
  </plugins>
</build>
```

**依赖配置**

为宿主应用**添加 web-ark-plugin 依赖**。配置如下：

```xml
<dependency>
  <groupId>com.alipay.sofa</groupId>
  <artifactId>web-ark-plugin</artifactId>
  <version>${sofa.ark.version}</version>
</dependency>
```

**运行宿主应用与业务应用**

按照[第4节](#jfVbQ)和[第5节](#edkzZ)运行，此时宿主应用和业务应用共用8080端口，宿主应用以`/`为 `WebContextPath`向外提供服务，业务应用以`/biz/`为`WebContextPath`向外提供服务。因此，可以通过 [http://localhost:8080/biz](http://localhost:8080/biz) 访问到业务应用，可以看到返回 `hello to ark dynamic deploy`。

## 7. 如何动态卸载 Spring Boot 业务应用

目前 Spring boot 不支持动态卸载。如果要动态卸载，需要注册一个卸载的事件handler，请参考 sofaboot 的代码：[SofaBizUninstallEventHandler](https://github.com/sofastack/sofa-boot/blob/master/sofa-boot-project/sofa-boot-core/runtime-sofa-boot/src/main/java/com/alipay/sofa/runtime/SofaBizUninstallEventHandler.java)。