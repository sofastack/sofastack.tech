---
author: "余淮"
date: 2018-04-26T10:12:34.000Z
title: "SOFARPC 集成 Zookeeper 注册中心"
tags: ["SOFARPC"]
categories: "SOFARPC"
description: "本文是 SOFARPC 集成 Zookeeper 的介绍。"
cover: "/cover.jpg"
aliases: "/posts/2018-04-26-01"
---

[SOFARPC](https://github.com/sofastack/sofa-rpc) 是近期蚂蚁金服开源的一个高可扩展性、高性能、生产级的 Java RPC 框架。在蚂蚁金服 SOFARPC 已经经历了十多年及五代版本的发展。SOFARPC 致力于简化应用之间的 RPC 调用，为应用提供方便透明、稳定高效的点对点远程服务调用方案。为了用户和开发者方便的进行功能扩展，SOFARPC 提供了丰富的模型抽象和可扩展接口，包括过滤器、路由、负载均衡等等。

SOFARPC 可以集成多种注册中心实现，其中一种就是常用的 [ZooKeeper](http://zookeeper.apache.org/)。

ZooKeeper 作为一个开源的分布式应用协调系统，已经用到了许多分布式项目中，用来完成统一命名服务、状态同步服务、集群管理、分布式应用配置项的管理等工作。

本文将介绍 SOFARPC 是使用 ZooKeeper 作为注册中心的用法。

## 1. ZooKeeper 注册中心安装

这里介绍下 Zookeeper 单机模式两种安装方式，集群模式请参考下其他文档。

### 1.1 基于压缩包安装

第一步：去官网下载 [http://zookeeper.apache.org/releases.html#download](http://zookeeper.apache.org/releases.html#download)
例如目前最新版是 v3.4.11，我们下载压缩包`zookeeper-3.4.11.tar.gz`，然后解压到文件夹下，例如 `/home/admin/zookeeper-3.4.11`。

第二步：设置配置文件，可以直接从样例复制一份。

```bash
cd /home/admin/zookeeper-3.4.11
cp conf/zoo_sample.cfg conf/zoo.cfg
```

第三步：到 Zookeeper 安装目录下直接启动 Zookeeper。

```bash
$ cd /home/admin/zookeeper-3.4.11
$ sh bin/zkServer.sh start
ZooKeeper JMX enabled by default
Using config: /Users/zhanggeng/dev/zookeeper/bin/../conf/zoo.cfg
-n Starting zookeeper ...
STARTED
```

第四步：我们使用四字命令检查下。

```bash
$ echo stat | nc 127.0.0.1 2181
Zookeeper version: 3.4.11-37e277162d567b55a07d1755f0b31c32e93c01a0, built on 11/01/2017 18:06 GMT
...
```

第五步：如果需要查看数据，直接运行 `zkCli.sh`，连接后执行 `ls /`即可。

```bash
$ sh bin/zkCli.sh
Connecting to localhost:2181
......
WatchedEvent state:SyncConnected type:None path:null
[zk: localhost:2181(CONNECTED) 0] ls /
[zookeeper]
```

### 1.2 基于 Docker 安装

如果您已安装了 `Docker`，那么可以选择使用镜像启动 Zookeeper。

```bash
docker image pull zookeeper:3.4.11
docker run -i -t  --name my_zookeeper -p2181:2181 -d zookeeper:3.4.11
```

我们查看下启动日志：

```bash
$ docker logs -f my_zookeeper
ZooKeeper JMX enabled by default
Using config: /conf/zoo.cfg
2018-04-16 07:38:59,373 [myid:] - INFO  [main:QuorumPeerConfig@136] - Reading configuration from: /conf/zoo.cfg
......
2018-04-16 07:23:41,187 [myid:] - INFO  [main:NIOServerCnxnFactory@89] - binding to port 0.0.0.0/0.0.0.0:2181
```

可以看到端口已经启动并发布，我们使用四字命令检查下。

```bash
$ echo stat | nc 127.0.0.1 2181
Zookeeper version: 3.4.11-37e277162d567b55a07d1755f0b31c32e93c01a0, built on 11/01/2017 18:06 GMT
...
```

我们可以查看启动的容器运行状态、关闭、重启，参考命令如下：

```bash
$ docker container ls
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                                        NAMES
30b13a744254        zookeeper:3.4.11    "/docker-entrypoin..."   23 hours ago        Up 42 seconds       2888/tcp, 0.0.0.0:2181->2181/tcp, 3888/tcp   my_zookeeper
## 关闭重启的话
$ docker container stop 30b13a744254
$ docker container start 30b13a744254
```

如果需要使用 ZooKeeper 客户端查看查看数据，参考命令如下：

```bash
$ docker exec -it 30b13a744254 zkCli.sh
Connecting to localhost:2181
......
WatchedEvent state:SyncConnected type:None path:null
[zk: localhost:2181(CONNECTED) 0] ls /
[zookeeper]
```

## 2. SOFARPC 集成 Zookeeper 注册中心

Demo 工程参见: [sofa-rpc-zookeeper-demo](https://github.com/ujjboy/sofa-rpc-zookeeper-demo)

### 2.1 新建工程

运行需要 JDK 6 及以上、 Maven 3.2.5 以上。

首先我们在 IDE 里新建一个普通 Maven 工程，然后在 `pom.xml` 中引入如下 RPC 和 Zookeeper 相关依赖：

```xml
<dependencies>
    <dependency>
        <groupId>com.alipay.sofa</groupId>
        <artifactId>sofa-rpc-all</artifactId>
        <version>5.3.1</version>
    <dependency>
    <dependency>
        <groupId>org.apache.curator</groupId>
        <artifactId>curator-recipes</artifactId>
        <version>2.9.1</version>
    </dependency>
</dependencies>
```

### 2.2 编写服务提供端

第一步：创建接口

```java
package org.howtimeflies.sofa.rpc;
public interface HelloService {
    public String sayHello(String name);
}
```

第二步：创建接口实现

```java
package org.howtimeflies.sofa.rpc;
public class HelloServiceImpl implements HelloService {
    public String sayHello(String name) {
        return "hello " + name;
    }
}
```

第三步：编写服务端代码

```java
package org.howtimeflies.sofa.rpc;

import com.alipay.sofa.rpc.config.ProviderConfig;
import com.alipay.sofa.rpc.config.RegistryConfig;
import com.alipay.sofa.rpc.config.ServerConfig;

public class ServerMain {
    public static void main(String[] args) {
        // 指定注册中心
        RegistryConfig registryConfig = new RegistryConfig()
                .setProtocol("zookeeper")
                .setAddress("127.0.0.1:2181");
        // 指定服务端协议和地址
        ServerConfig serverConfig = new ServerConfig()
                .setProtocol("bolt")
                .setPort(12345)
                .setDaemon(false);
        //　发布一个服务
        ProviderConfig<HelloService> providerConfig = new ProviderConfig<HelloService>()
                .setInterfaceId(HelloService.class.getName())
                .setRef(new HelloServiceImpl())
                .setRegistry(registryConfig)
                .setServer(serverConfig);
        providerConfig.export();
    }
}
```

### 2.3 编写服务调用端

我们拿到了服务端的接口，就可以编写服务端调用端代码

```java
package org.howtimeflies.sofa.rpc;

import com.alipay.sofa.rpc.config.ConsumerConfig;
import com.alipay.sofa.rpc.config.RegistryConfig;

public class ClientMain {

    public static void main(String[] args) {
        // 指定注册中心
        RegistryConfig registryConfig = new RegistryConfig()
                .setProtocol("zookeeper")
                .setAddress("127.0.0.1:2181");
        // 引用一个服务
        ConsumerConfig<HelloService> consumerConfig = new ConsumerConfig<HelloService>()
                .setInterfaceId(HelloService.class.getName())
                .setProtocol("bolt")
                .setRegistry(registryConfig);
        // 拿到代理类
        HelloService service = consumerConfig.refer();
        
        // 发起调用
        while (true) {
            System.out.println(service.sayHello("world"));
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
            }
        }
    }
}
```

### 2.4 运行

我们先运行服务提供端程序 `ServerMain`，然后去 ZooKeeper 上看下服务订阅情况。

```bash
$ sh bin/zkCli.sh
Connecting to localhost:2181
......
WatchedEvent state:SyncConnected type:None path:null
[zk: localhost:2181(CONNECTED) 4] ls /sofa-rpc/org.howtimeflies.sofa.rpc.HelloService/providers
[bolt%3A%2F%2F10.15.232.61%3A12345%3FuniqueId%3D%26version%3D1.0%26timeout%3D0%26delay%3D-1%26id%3Drpc-cfg-0%26dynamic%3Dtrue%26weight%3D100%26accepts%3D100000%26startTime%3D1523967648457%26pid%3D17664%26language%3Djava%26rpcVer%3D50301]
```

然后在运行服务端调用端 `ClientMain`，

运行结果如下：

```plain
hello world
hello world
hello world
hello world
```

我们也可以去 ZooKeeper 上看下服务订阅情况，

```bash
sh bin/zkCli.sh
Connecting to localhost:2181
......
WatchedEvent state:SyncConnected type:None path:null
[zk: localhost:2181(CONNECTED) 5] ls /sofa-rpc/org.howtimeflies.sofa.rpc.HelloService/consumers
[bolt%3A%2F%2F10.15.232.61%2Forg.howtimeflies.sofa.rpc.HelloService%3FuniqueId%3D%26version%3D1.0%26pid%3D17921%26timeout%3D3000%26id%3Drpc-cfg-0%26generic%3Dfalse%26serialization%3Dhessian2%26startTime%3D1523968102764%26pid%3D17921%26language%3Djava%26rpcVer%3D50301]
```

至此，使用 ZooKeeper 作为 SOFARPC 的注册中心介绍完了。

## 3. 在 SOFABoot 使用 SOFARPC 及 ZooKeeper 注册中心

[SOFABoot](https://github.com/sofastack/sofa-boot) 是蚂蚁金服开源的基于 Spring Boot 的研发框架，它在增强了 Spring Boot 的同时，SOFABoot 提供了让用户可以在 Spring Boot 中非常方便地使用 SOFAStack 相关中间件的能力。

SOFARPC 也实现以一个 `rpc-sofa-boot-starter` 可以方便的集成到 SOFABoot 应用。目前只支持 Spring XML 方式发布和引用服务，下一个版本将支持 Annotation 方式发布和引用服务。

Demo 工程参见: [sofa-rpc-sofa-boot-zookeeper-demo](https://github.com/ujjboy/sofa-rpc-sofa-boot-zookeeper-demo)

### 3.1 创建 SpringBoot 工程

SOFABoot 运行需要 JDK 7 及以上、 Maven 3.2.5 以上。

我们可以使用 Spring Boot 的[工程生成工具](http://start.spring.io/) 来生成一个标准的 Spring Boot 工程。

![undefined](https://cdn.yuque.com/lark/0/2018/png/9439/1523969432790-d0c3cb6d-dd2d-4c45-8dd5-d595e2395c1b.png)

### 3.2 引入 SOFABoot 和 rpc-sofa-boot-starter

我们将工程导入到 IDE 中，然后在 `pom.xml` 将 Spring Boot 工程转为一个 SOFABoot 工程，很简单，只要加入依赖管控即可。

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>com.alipay.sofa</groupId>
            <artifactId>sofaboot-dependencies</artifactId>
            <version>2.3.1</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

然后再在 `pom.xml` 中引入 `rpc-sofa-boot-starter` 的依赖：

```xml
<dependencies>
 <dependency>
  <groupId>com.alipay.sofa</groupId>
  <artifactId>rpc-sofa-boot-starter</artifactId>
  <version>5.3.1</version>
 </dependency>
</dependencies>
```

### 3.3 编写服务提供端

第一步：创建接口

```java
package org.howtimeflies.sofa.rpc;
public interface HelloService {
    public String sayHello(String name);
}
```

第二步：创建接口实现

```java
package org.howtimeflies.sofa.rpc;
public class HelloServiceImpl implements HelloService {
    public String sayHello(String name) {
        return "hello " + name;
    }
}
```

第三步：发布服务

我们通过 SpringBean 的方式发布服务，新建一个 Spring 的 xml，例如 `src/main/resource/rpc-server.xml`，注意文件头要保持一致。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:sofa="http://sofastack.io/schema/sofaboot"
       xsi:schemaLocation="http://www.springframework.org/schema/beans 
            http://www.springframework.org/schema/beans/spring-beans.xsd
            http://sofastack.io/schema/sofaboot
            http://sofastack.io/schema/sofaboot.xsd"
       default-autowire="byName">

    <bean id="helloServiceImpl" class="org.howtimeflies.sofa.rpc.HelloServiceImpl"/>
    <sofa:service interface="org.howtimeflies.sofa.rpc.HelloService" ref="helloServiceImpl">
        <sofa:binding.bolt/>
    </sofa:service>

</beans>
```

### 3.4 编写服务调用端

同样服务端调用端也通过 SpringBean 的方式引用一个服务。新建一个 Spring 的 xml，例如 `src/main/resource/rpc-client.xml`，注意文件头要保持一致。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:sofa="http://sofastack.io/schema/sofaboot"
       xsi:schemaLocation="http://www.springframework.org/schema/beans 
            http://www.springframework.org/schema/beans/spring-beans.xsd
            http://sofastack.io/schema/sofaboot
            http://sofastack.io/schema/sofaboot.xsd"
       default-autowire="byName">

    <sofa:reference id="helloServiceRef" interface="org.howtimeflies.sofa.rpc.HelloService">
        <sofa:binding.bolt/>
    </sofa:reference>

</beans>
```

### 3.5 指定注册中心地址

我们需要在 `src/main/resource/application.properties` 里指定我们的应用名和注册中心地址

```ini
# 指定应用名
spring.application.name=test
# 指定日志路径
logging.path=./logs
# 注册中心地址
com.alipay.sofa.rpc.registry.address=zookeeper://127.0.0.1:2181
```

### 3.6 运行

我们在生成代码里找到了默认的启动类 `XXXApplication.java`，名字自动生成的，例如本例是为：`org.howtimeflies.sofa.rpc.SofaRpcSofaBootZookeeperDemoApplication`。

它的原始内容如下：

```java
package org.howtimeflies.sofa.rpc;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SofaRpcSofaBootZookeeperDemoApplication {
 public static void main(String[] args) {
  SpringApplication.run(SofaRpcSofaBootZookeeperDemoApplication.class, args);
 }
}
```

可以看到里面并未指定加载的文件，我们将启动类改造下，引入 Spring XML 的配置，以及我们的调用代码，如下:

```java
package org.howtimeflies.sofa.rpc;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.ImportResource;

@SpringBootApplication
@ImportResource({"rpc-server.xml","rpc-client.xml"}) // 引入加载的 Spring XML
public class SofaRpcSofaBootZookeeperDemoApplication {

    public static void main(String[] args) {
        ApplicationContext context = 
                SpringApplication.run(SofaRpcSofaBootZookeeperDemoApplication.class, args);
  // 等待ZooKeeper下发地址
        try {
            Thread.sleep(2000);
        } catch (Exception e) {
        }

        // 拿到调用端 进行 调用
        HelloService helloService = (HelloService) context.getBean("helloServiceRef");
        String hi = helloService.sayHello("world");
        System.out.println(hi);
    }
}
```

直接运行 `SofaRpcSofaBootZookeeperDemoApplication`，结果如下：

```plain
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::        (v1.4.2.RELEASE)
......
2018-04-17 21:42:13.249  INFO 20211 --- [           main] .SofaRpcSofaBootZookeeperDemoApplication : Started SofaRpcSofaBootZookeeperDemoApplication in 5.958 seconds (JVM running for 6.75)
hello world
```

## 4. 资源下载

DEMO：

- [sofa-rpc-zookeeper-demo](https://github.com/ujjboy/sofa-rpc-zookeeper-demo)
- [sofa-rpc-sofa-boot-zookeeper-demo](https://github.com/ujjboy/sofa-rpc-sofa-boot-zookeeper-demo)

源码：

- [sofa-rpc](https://github.com/sofastack/sofa-rpc)
- [sofa-boot](https://github.com/sofastack/sofa-boot)
