---
author: "鲁直"
date: 2018-05-04T10:12:34.000Z
title:  "在 Kubernetes 中使用 SOFABoot 的 Readiness Check 能力"
description: "在本文中，我们将通过 Kubernetes 来演示 SOFABoot 的 Readiness Check 的能力。"
tags: ["SOFABoot","Kubernetes"]
categories: "SOFABoot"
aliases: "/posts/2018-05-04-01"
cover: "/kubernetes-logo.jpg"
---

[SOFABoot](https://github.com/sofastack/sofa-boot) 是蚂蚁金服中间件团队开源的基于 Spring Boot 的一个开发框架，其在 Spring Boot 的健康检查的基础上，加上了 Readiness Check 的能力，以更好地适应大规模金融级的服务化场景，防止在应用启动有问题的情况下让外部流量进入应用。在本文中，我们将通过 Kubernetes 来演示 SOFABoot 的 Readiness Check 的能力，主要涉及到两个部分的能力的演示：

1. [SOFABoot](https://github.com/sofastack/sofa-boot) 的 Readiness Check 失败之后，SOFABoot 不会将发布的 RPC 服务的地址注册到 ZooKeeper 上面，防止 RPC 的流量进入。
2. Kubernetes 通过 `http://localhost:8080/health/readiness` 访问到 SOFABoot 的 Readiness 检查的结果之后，不会将 Pod 挂到对应的 Service 之上，防止 Kubernetes 上的流量进入。

## 准备一个 Kubernetes 的环境

为了演示在 Kubernetes 中使用 SOFABoot 的 Readiness Check 的能力，首先需要准备好一个 Kubernetes 的环境，在这个例子中，我们直接选择在本机安装一个 minikube，minikube 是 Kubernetes 为了方便研发人员在自己的研发机器上尝试 Kubernetes 而准备的一个工具，对于学习 Kubernetes 的使用非常方便。关于如何在本机安装 minikube，大家参考这个官方的安装教程即可。

安装完成以后，大家可以直接终端中使用 `minikube start`来启动 minikube。

<em>需要注意的是，由于国内网络环境的问题，直接用 </em><code><em>minikube start</em></code><em> 可能会无法启动 minikube，如果遇到无法启动 minikube 的问题，可以尝试加上代理的设置，大家可以参考以下的命令来设置代理服务器的地址：</em>

```powershell
minikube start --docker-env HTTP_PROXY=http://xxx.xxx.xxx.xxx:6152 --docker-env HTTPS_PROXY=http://xxx.xxx.xxx.xxx:6152
```

## 在 Kubernetes 上安装一个 ZooKeeper

在准备好了 Kubernetes 的环境之后，我们接下来需要在 Kubernetes 上安装一个 ZooKeeper 作为 SOFARPC 的服务自动发现的组件。首先我们需要有一个 ZooKeeper 的 Deployment：

```yaml
apiVersion: apps/v1beta1
kind: Deployment
metadata:
  name: zookeeper-deployment
  labels:
    app: zookeeper
spec:
  replicas: 1
  selector:
    matchLabels:
      app: zookeeper
  template:
    metadata:
      labels:
        app: zookeeper
    spec:  
      containers:
        - name: zookeeper
          image: zookeeper
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 2181
```

这个 Deployment 会部署一个 ZooKeeper 的实例，并且将 2181 端口暴露出来。

有了这个 YAML 文件之后，我们再部署一个 Service 来作为 ZooKeeper 的负载均衡，这样我们在应用中就可以直接通过域名来访问，而不用 IP 来访问 ZooKeeper 了。这个 Service 的 Yaml 文件如下：

```yaml
apiVersion: v1
kind: Service
metadata:
  name: zookeeper-service
spec:
  selector:
    app: zookeeper
  ports:
  - protocol: TCP
    port: 2181
    targetPort: 2181
```

这个 Service 直接将 2181 端口映射到 ZooKeeper 的 2181 端口上，这样，我们就可以在应用中直接通过 __`zookeeper-service:2181`__ 来访问了。

## 准备一个 SOFABoot 的应用

在前面的两步都 OK 之后，我们需要准备好一个 SOFABoot 的应用，并且在这个应用中发布一个 SOFARPC 的服务。首先，我们需要从 start.spring.io 上生成一个工程，例如 GroupId 设置为 <span data-type="color" style="color: rgb(36, 41, 46);">com.alipay.sofa，ArtifactId 设置为 rpcserver。</span>

<span data-type="color" style="color: rgb(36, 41, 46);">生成好了之后，接下来，我们需要把 SOFABoot 的依赖加上，将 pom.xml 中的 parent 修改成：</span>

```xml
<parent>
    <groupId>com.alipay.sofa</groupId>
    <artifactId>sofaboot-dependencies</artifactId>
    <version>2.3.1</version>
</parent>
```

然后，增加一个 SOFARPC 的 Starter 的依赖：

```xml
<dependency>
    <groupId>com.alipay.sofa</groupId>
    <artifactId>rpc-sofa-boot-starter</artifactId>
</dependency>
```

接着，在 application.properties 里面加上我们的配置，包括应用名和 ZooKeeper 的地址：

```plain
# Application Name
spring.application.name=SOFABoot Demo
# ZooKeeper 的地址
com.alipay.sofa.rpc.registry.address=zookeeper://127.0.0.1:2181
```

上面的事情准备好之后，我们可以在应用中发布一个服务，首先，我们需要分别声明好一个接口和一个实现：

```java
package com.alipay.sofa.rpcserver;

public interface SampleService {
    String hello();
}
```

```java
package com.alipay.sofa.rpcserver;

public class SampleServiceImpl implements SampleService {
    @Override
    public String hello() {
        return "Hello";
    }
}
```

接下来，将这个接口和实现发布成一个 SOFARPC 的服务，我们可以新建一个 `src/main/resources/spring/rpc-server.xml` 的文件：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:sofa="http://sofastack.io/schema/sofaboot"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
            http://sofastack.io/schema/sofaboot   http://sofastack.io/schema/sofaboot.xsd">
    <bean class="com.alipay.sofa.rpcserver.SampleServiceImpl" id="sampleService"/>
    <sofa:service ref="sampleService" interface="com.alipay.sofa.rpcserver.SampleService">
        <sofa:binding.bolt/>
    </sofa:service>
</beans>
```

需要注意的是，通过 XML 定义好上面的服务之后，我们还需要在 Main 函数所在的类里面增加一个 `@Import`，将 XML Import 进去：

```java
package com.alipay.sofa.rpcserver;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ImportResource;

@SpringBootApplication
@ImportResource("classpath*:spring/*.xml")
public class RpcServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(RpcServerApplication.class, args);
    }
}
```

然后，为了演示 Readiness Check 的能力，我们还需要增加一个 HealthIndicator 来控制 Readiness Check 的结果：

```java
package com.alipay.sofa.rpcserver;

import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

@Component
public class SampleHealthIndicator implements HealthIndicator {
    @Override
    public Health health() {
        return Health.up().build();
    }
}
```

这里，我们首先直接返回成功，先演示 Readiness Check 成功的场景。

## 将应用部署到 Kubernetes 里面

在前面的步骤完成之后，应用的代码都已经准备好了，现在可以准备将应用部署到 Kubernetes 里面。首先，需要将应用打包成一个 Docker 镜像，需要注意的是，为了让 Kubernetes 能够找到这个 Docker 镜像，在打包镜像之前，要先将 Docker 环境切成 Minikube 的环境，运行以下的命令即可：

```plain
eval $(minikube docker-env)
```

然后准备一个 Dockerfile：

```plain
FROM openjdk:8-jdk-alpine
ARG JAR_FILE
ADD ${JAR_FILE} app.jar
ENTRYPOINT [ "java", "-jar", "/app.jar"]
```

最后，运行如下的命令来进行打包：

```plain
docker build --build-arg JAR_FILE=./target/rpcserver-0.0.1-SNAPSHOT.jar . -t rpc-server-up
```

其中 JAR\_FILE 参数 SOFABoot 应用程序的 JAR 包路径。镜像打包出来后，我们就可以准备一个 YAML 来部署应用了：

```yaml
apiVersion: apps/v1beta1
kind: Deployment
metadata:
  name: rpc-server-deployment
  labels:
    app: rpc-server
spec:
  replicas: 1
  selector:
    matchLabels:
      app: rpc-server
  template:
    metadata:
      labels:
        app: rpc-server
    spec:  
      containers:
        - name: rpc-server
          image: rpc-server-up
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 8080
          readinessProbe:
            httpGet:
              path: /health/readiness
              port: 8080
```

注意在上个面的 YAML 中，我们定义了一个 Kubernetes 的 Readiness Probe，访问 `localhost:8080/health/readiness` 来获取 SOFABoot Readiness Check 的结果。

打包完成之后，可以运行如下的命令来将应用部署到 Kubernetes 中：

```powershell
kubectl apply -f rpcserver.xml
```

部署完成后，我们再通过一个 Service，将应用的实例挂到一个 Service 下面去，这样就可以通过查看 Service 下的 EndPoint 节点的数量来看 Readiness Check 是否起作用了：

```yaml
apiVersion: v1
kind: Service
metadata:
  name: rpc-server-service
spec:
  selector:
    app: rpc-server
  ports:
  - protocol: TCP
    port: 8080
    targetPort: 8080
```

运行如下命令将 Service 部署到 Kubernetes 里面去：

```powershell
kubectl apply -f rpc-server-service.yml
```

## Readiness Check 成功的节点挂载情况

由于上面我们写的 HealthIndicator 直接返回了一个 Up，所以 Readiness Check 应该成功，我们可以分别从 ZooKeeper 和 Service 里面查看节点的情况。

首先看下 ZooKeeper 里面，为了查看 ZooKeeper 里面的节点的情况，需要在本地有一个 ZooKeeper 的程序在，这个可以直接从 ZooKeeper 的官网上下载。

然后，我们需要拿到在 Kubernetes 里面部署的 ZooKeeper 的对外暴露的地址，通过如下命令拿到地址：

```powershell
kubectl expose deployment zookeeper-deployment --type=NodePort && minikube service zookeeper-deployment --url
```

在我本机拿到的地址是 `192.168.99.100:30180`

然后，就可以通过本地的 ZooKeeper 程序里面的 zkCli.sh 来查看 ZooKeeper 里面的节点了，运行如下的命令：

```plain
./zkCli.sh -server 192.168.99.100:30180
......
[zk: 192.168.99.100:30180(CONNECTED) 5]ls /sofa-rpc/com.alipay.sofa.rpcserver.SampleService/providers
```

就可以看到里面有一个节点的信息，就是我们的 rpcserver 部署在 Kubernetes 里面的节点。

也可以去看下 rpcserver 的 Service 里面的节点的信息，运行如下的命令：

```plain
kubectl describe service rpc-server-service
```

也可以看到红框中有一个节点的信息。

## Readiness Check 失败的节点挂载情况

在上面，我们已经看到了 Readiness Check 成功之后，可以在 ZooKeeper 里面和 Service 的 EndPoints 里面都可以看到节点的信息，现在来看下 Readiness Check 失败后的情况。

为了让 Readiness Check 失败，要将之前写的 SampleHealthIndicator 改成 Down，代码如下：

```java
package com.alipay.sofa.rpcserver;

import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

@Component
public class SampleHealthIndicator implements HealthIndicator {
    @Override
    public Health health() {
        return Health.down().build();
    }
}
```

然后使用 `mvn clean install` 重新打包程序，打包之后，我们需要重新构建镜像，为了跟前面的 Readiness Check 成功的镜像以示区分，我们将镜像的名称换成 `rpc-server-down`：

```plain
docker build --build-arg JAR_FILE=./target/rpcserver-0.0.1-SNAPSHOT.jar . -t rpc-server-down
```

然后我们再将之前的应用的 Deployment 的 YAML 文件中的镜像名称换成新的镜像名称，其他保持不变：

```yaml
apiVersion: apps/v1beta1
kind: Deployment
metadata:
  name: rpc-server-deployment
  labels:
    app: rpc-server
spec:
  replicas: 1
  selector:
    matchLabels:
      app: rpc-server
  template:
    metadata:
      labels:
        app: rpc-server
    spec:  
      containers:
        - name: rpc-server
          image: rpc-server-down
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 8080
          readinessProbe:
            httpGet:
              path: /health/readiness
              port: 8080
```

最后，通过 `kubectl apply -f rpcserver.yml` 来更新 Kubernetes 里面的 RPCServer 这个应用。

更新之后，我们再去 ZooKeeper 里面看下服务发布的情况，就只能看到一个空的列表了：

通过 kubectl describe 查看新的 Pod 的情况，也可以看到 Readiness Check 失败：

通过 `kubectl describe service rpc-server-service` 也可以看到 Service 下面的 EndPoint 还是之前的那个，新的并没有挂载上去。

## 总结

本文中，我们演示了如何通过 Readiness Check 来控制应用的流量，在 Readiness Check 失败的情况下，让流量不进入应用，防止业务受损。在上面的例子中，我们通过 Readiness Check 完成了两个部分的流量的控制，一个是 Readiness Check 失败之后，SOFARPC 不会将服务的地址上报到对应的服务注册中心上，控制通过自动服务发现进入的流量，另一个方面，Kubernetes 也不会将 Pod 挂到对应额 Service 之上，防止负载均衡器进入的流量。

虽然 SOFABoot 提供了 Readiness Check 的能力，并且对应的中间件也已经实现了根据 SOFABoot 的 Readiness Check 的结果来控制流量，但是完整的流量控制，还需要外围的平台进行配合，比如负载均衡的流量就需要 Kubernetes 的 Readiness Check 的能力来一起配合才可以完成控制。

本文中所有涉及到的代码以及 Kuberentes 的 YAML 配置文件都已经放到了 Github 上，欢迎大家参考下载：[https://github.com/khotyn/sofa-boot-readiness-check-demo](https://github.com/khotyn/sofa-boot-readiness-check-demo)。
