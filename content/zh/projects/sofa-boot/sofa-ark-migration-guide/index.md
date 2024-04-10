---
title: "SOFAArk2.0 升级"
aliases: "/sofa-boot/docs/sofa-ark-migration-guide"
---

# 背景

SOFAArk 框架包含有三个概念，Ark Container, Ark Plugin 和 Ark Biz; 运行时逻辑结构图如下：

![image.png | center | 1310x1178](https://cdn.yuque.com/lark/2018/png/590/1523868989241-f50695ed-dca0-4bf7-a6a9-afe07c2ade76.png)

每次应用启动时，首先运行 Ark 包，Ark Container 优先启动，容器自动解析 Ark 包中含有的 Ark Plugin 和 Ark Biz，并读取他们的配置信息，构建类和资源的加载索引表；然后使用独立的 ClassLoader 加载并按优先级配置依次启动；需要指出的是，Ark Plugin 优先 Ark Biz 被加载启动。
详细介绍可阅读： [SOFAArk 介绍](https://www.sofastack.tech/projects/sofa-boot/sofa-ark-readme/)

在三层概念的基础上，衍生出复杂的类加载机制，如图：

![undefined](https://gw.alipayobjects.com/zos/skylark/7dfdc66f-a70d-4ef0-9de3-92b72bf2caf7/2018/png/77f10035-a6c3-4bab-bff3-a2c9a986561f.png)

详细介绍可阅读：[Ark 容器类加载机制](https://www.sofastack.tech/projects/sofa-boot/sofa-ark-classloader/)

## 问题一

由于 Ark Plugin 的存在，插件在依赖层面的强管控，造成了一些问题

- 业务使用的依赖是被插件管控导出的，但是插件管控导出的版本与业务实际期望的版本不符（比如插件管控的版本是 1.0，而业务需要的是 2.0）。
- 插件对于依赖的强管控，直接堵住了业务扩展插件能力的路；也存在部分依赖，当业务引入时会直接报错（其 package 被导出了，但是依赖不在插件中），那么对于业务来说就只能等框架发版解决。
- 业务接入成本，学习成本较高，问题排查困难，需要非常熟悉 Ark 类加载机制。
- 由于管控依赖的增长，Ark Plugin 难以持续维护

## 问题二

另外，由于 Ark Container 先于 master biz 启动，master biz 的启动入口和 springboot/sofaboot 不一致，导致 Ark master biz 的的启动在研发运维中需要定制镜像，定制启动入口，造成研发运维困难。

# SOFAArk2.0

针对这些问题，我们尝试从框架层面去优化三层结构，沉淀出了 SOFAArk2.0 方案，整体优化思路和原则是 Ark Master Biz 保持和原生 springboot/sofaboot 保持一致，弱化复杂的 Ark Plugin 类管控机制，将 Ark Plugin 与 master biz 合并。

SOFAArk2.0 方案整体优化点：

- 弱化 Ark Plugin 层，改为普通 pom 依赖；
- Ark master biz 和原生的 springboot/sofaboot 应用启动方式，类加载方式保持一致；
- 优化 Ark Biz 启动速度；

# 升级方式

## 版本升级

SOFAArk 版本号第一位为大版本号，当为 1.x.x 时为 SOFAArk1.0 版，当为 2.x.x 时是 SOFAArk2.0 版，当前 2.0 版本已正式 release，[Release-Notes](https://github.com/sofastack/sofa-ark/releases/tag/v2.0.0)

```xml
<properties>
    <sofa.ark.version>1.1.6</sofa.ark.version>
</properties>
```

改为

```xml
<properties>
    <sofa.ark.version>2.0.0</sofa.ark.version>
</properties>
```

## 打包插件

在 SOFAArk1.0 中使用 sofa-ark-maven-plugin 打包，在 SOFAArk2.0 中采用 spring-boot 原生打包插件 spring-boot-maven-plugin 打包

```xml
<build>
    <plugins>
        <plugin>
            <groupId>com.alipay.sofa</groupId>
            <artifactId>sofa-ark-maven-plugin</artifactId>
            <version>${sofa.ark.version}</version>
            <executions>
                <execution>
                    <id>default-cli</id>

                    <!--goal executed to generate executable-ark-jar -->
                    <goals>
                        <goal>repackage</goal>
                    </goals>

                    <configuration>
                        <!--specify destination where executable-ark-jar will be saved, default saved to ${project.build.directory}-->
                        <outputDirectory>./target</outputDirectory>

                        <!--default none-->
                        <arkClassifier>executable-ark</arkClassifier>
                    </configuration>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```

替换为：

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>
            <version>2.6.6</version>

            <configuration>
                <outputDirectory>target</outputDirectory>
                <classifier>ark-biz</classifier>
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

## 运行启动

### 方式一：IDEA 启动

本地启动需要加上启动参数

> -Dsofa.ark.embed.enable=true -Dcom.alipay.sofa.ark.master.biz=${bizName}

### 方式二：命令行启动

Ark 包是可执行 Jar，可直接使用 Java -jar 的方式启动，先使用 mvn clean package 进行打包，打包得到 ${bizName}-${bizVersion}-ark-biz.jar，命令行启动

> java -jar -Dsofa.ark.embed.enable=true -Dcom.alipay.sofa.ark.master.biz=${bizName} ${bizName}-${bizVersion}-ark-biz.jar

## 示例工程

[SOFAArk1.0 示例工程](https://github.com/sofastack-guides/sofa-ark-guides/tree/master/sample-ark-springboot) ：SOFAArk1.0 接入方式

[SOFAArk2.0 示例工程](https://github.com/sofastack-guides/sofa-ark-spring-guides) ：SOFAArk2.0 接入方式
