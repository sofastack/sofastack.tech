
---
title: "SOFABoot 方式快速入门"
aliases: "/sofa-rpc/docs/Getting-Started-with-SOFA-Boot"
---
本文档将演示如何在 SOFABoot 环境下应用 SOFARPC 进行服务的发布和引用。
您可以直接在工程下找到本文档的[示例代码](https://github.com/sofastack-guides/sofa-rpc-guides)。注意，示例代码中需要本地安装 zookeeper 环境，如果没有安装。需要将`application.properties`中的`com.alipay.sofa.rpc.registry.address` 配置注释掉，走本地文件注册中心的方式。

## 创建工程

1. 环境准备：SOFABoot 需要 JDK7 或者 JDK8 ，需要采用 Apache Maven 2.2.5 或者以上的版本来编译。
2. 工程构建：SOFABoot 构建在 Spring Boot 之上。因此可以使用 [Spring&nbsp;Boot&nbsp;的工程生成工具](http://start.spring.io/)来生成一个标准的Spring Boot 工程。
3. 引入 SOFABoot 环境：生成的 Spring Boot 标准工程直接使用的 Spring Boot 的 parent 依赖，改为 SOFABoot 提供的 parent 依赖，该parent 提供并管控了多种 SOFABoot 提供的 starter。

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>${spring.boot.version}</version>
    <relativePath/>
</parent>
```

替换为：

```xml
<parent>
    <groupId>com.alipay.sofa</groupId>
    <artifactId>sofaboot-dependencies</artifactId>
    <version>${sofa-boot.version}</version>
</parent>
```

这里的 `${sofa-boot.version}` 指定具体的 SOFABoot 版本，参考[发布历史](https://github.com/sofastack/sofa-boot/releases)
4. 配置 application.properties ：application.properties 是 SOFABoot 工程中的配置文件。这里需要配置一个必不可少的配置项，即应用名。

```xml
spring.application.name=AppName
```

5. 引入 RPC Starter：

```xml
<dependency>
     <groupId>com.alipay.sofa</groupId>
     <artifactId>rpc-sofa-boot-starter</artifactId>
</dependency>
```

## 定义服务接口

```java
public interface AnnotationService {

    String sayAnnotation(String string);

}
```

## 服务端发布服务

通过 `@SofaService`注解发布服务，如下代码所示：

SOFABoot 扫描到该注解，就会将该服务实现发布到服务器，同时指定了 bolt 协议与客户端进行通信地址，并将地址等元数据发布到了注册中心（这里默认使用的本地文件作为注册中心）。

```java
import com.alipay.sofa.runtime.api.annotation.SofaService;
import com.alipay.sofa.runtime.api.annotation.SofaServiceBinding;
import org.springframework.stereotype.Service;

@SofaService(interfaceType = AnnotationService.class, bindings = { @SofaServiceBinding(bindingType = "bolt") })
@Service
public class AnnotationServiceImpl implements AnnotationService {
    @Override
    public String sayAnnotation(String string) {
        return string;
    }
}
```

## 客户端引用服务

通过`@SofaReference`注解引用服务，如下代码所示：
SOFABoot 会生成一个 `AnnotationService` RPC 的代理 bean，同时指定了 bolt 协议与服务端通信。这样就可以直接在代码中使用该 bean 进行远程服务的调用了。

```java
import com.alipay.sofa.runtime.api.annotation.SofaReference;
import com.alipay.sofa.runtime.api.annotation.SofaReferenceBinding;
import org.springframework.stereotype.Service;

@Service
public class AnnotationClientImpl {

    @SofaReference(interfaceType = AnnotationService.class, jvmFirst = false, 
            binding = @SofaReferenceBinding(bindingType = "bolt"))
    private AnnotationService annotationService;

    public String sayClientAnnotation(String str) {
        return annotationService.sayAnnotation(str);
    }
}
```

## 运行

在 SpringBoot 的启动类中编码如下：
启动服务端

```java
@SpringBootApplication
public class AnnotationServerApplication {

    public static void main(String[] args) {

        SpringApplication springApplication = new SpringApplication(
            AnnotationServerApplication.class);
        ApplicationContext applicationContext = springApplication.run(args);
    }
}
```

启动客户端，获取`AnnotationClientImpl`的实现 bean，并调用 sayClientAnnotation，间接通过`@SofaReference`生成的代理类调用远程服务 `AnnotationServiceImpl`。

```java
public class AnotationClientApplication {

    public static void main(String[] args) {
        //change port to run in local machine
        System.setProperty("server.port", "8081");
        SpringApplication springApplication = new SpringApplication(
            AnotationClientApplication.class)；
        ApplicationContext applicationContext = springApplication.run(args);

        AnnotationClientImpl annotationService = applicationContext
            .getBean(AnnotationClientImpl.class);
        String result = annotationService.sayClientAnnotation("annotation");
        System.out.println("invoke result:" + result);
    }
}
```

打印结果如下：

```java
invoke result:annotation
```

以上就完成了一次服务发布和服务引用。
