---
title: "Dubbo 埋点接入"
aliases: "/sofa-tracer/docs/Usage_Of_Dubbo"
---


在本文档将演示如何使用 SOFATracer 对 Dubbo 进行埋点，本示例[工程地址](https://github.com/sofastack-guides/sofa-tracer-guides/tree/master/tracer-sample-with-dubbo)。

## 基础环境

本案例使用的各框架组件的版本如下：

* SOFABoot 3.1.1/SpringBoot 2.1.0.RELEASE
* SOFATracer 2.4.0/3.0.4 
* JDK 8

本案例包括三个子模块：

* tracer-sample-with-dubbo-consumer     服务调用方
* tracer-sample-with-dubbo-provider     服务提供方
* tracer-sample-with-dubbo-facade       接口

## 原理

SOFATracer 对象 Dubbo 的埋点实现依赖于 Dubbo 的 SPI 机制来实现，Tracer 中基于 [调用拦截扩展](https://dubbo.apache.org/zh-cn/docs/dev/impls/filter.html) 
自定义了 DubboSofaTracerFilter 用于实现对 Dubbo 的调用埋点。由于 DubboSofaTracerFilter 并没有成为 Dubbo 的官方扩展，因此在使用 SOFATracer 时需要安装 [调用拦截扩展](https://dubbo.apache.org/zh-cn/docs/dev/impls/filter.html) 中
所提供的方式进行引用，即：

```xml
<!-- 消费方调用过程拦截 -->
<dubbo:reference filter="dubboSofaTracerFilter" />
<!-- 消费方调用过程缺省拦截器，将拦截所有reference -->
<dubbo:consumer filter="dubboSofaTracerFilter"/>

<!-- 提供方调用过程拦截 -->
<dubbo:service filter="dubboSofaTracerFilter" />
<!-- 提供方调用过程缺省拦截器，将拦截所有service -->
<dubbo:provider filter="dubboSofaTracerFilter"/>
```

## 新建 SOFABoot 工程作为父工程

在创建好一个 Spring Boot 的工程之后，接下来就需要引入 SOFABoot 的依赖，首先，需要将上文中生成的 Spring Boot 工程的 `zip` 包解压后，修改 Maven 项目的配置文件 `pom.xml`，将

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
    <version>${sofa.boot.version}</version>
</parent>
```
这里的 ${sofa.boot.version} 指定具体的 SOFABoot 版本，参考[发布历史](https://github.com/sofastack/sofa-build/releases)。

## 新建 tracer-sample-with-dubbo-facade

提供一个接口

```java
public interface HelloService {
    String SayHello(String name);
}
```
## 新建 tracer-sample-with-dubbo-provider

* 在工程模块的 pom 文件中添加 SOFATracer 依赖

    ```xml
    <dependency>
        <groupId>com.alipay.sofa</groupId>
        <artifactId>tracer-sofa-boot-starter</artifactId>
    </dependency>
    ```
    > SOFATracer 版本受 SOFABoot 版本管控，如果使用的 SOFABoot 版本不匹配，则需要手动指定 tracer 版本，且版本需高于 2.4.0.

* 在工程的 `application.properties` 文件下添加相关参数，

    ```properties
    # Spring boot application
    spring.application.name=dubbo-provider
    # Base packages to scan Dubbo Component: @org.apache.dubbo.config.annotation.Service
    dubbo.scan.base-packages=com.alipay.sofa.tracer.examples.dubbo.impl
    ##  Filter 必须配置
    dubbo.provider.filter=dubboSofaTracerFilter
    # Dubbo Protocol
    dubbo.protocol.name=dubbo
    ## Dubbo Registry
    dubbo.registry.address=zookeeper://localhost:2181
    logging.path=./logs
    ```
* 使用注解方式发布 Dubbo 服务

    ```java
    @Service
    public class HelloServiceImpl implements HelloService {
        @Override
        public String SayHello(String name) {
            return "Hello , "+name;
        }
    }
    ```

## 新建 tracer-sample-with-dubbo-consumer

* 在工程模块的 pom 文件中添加 SOFATracer 依赖

    ```xml
    <dependency>
        <groupId>com.alipay.sofa</groupId>
        <artifactId>tracer-sofa-boot-starter</artifactId>
    </dependency>
    ```

* 在工程的 `application.properties` 文件下添加相关参数

    ```properties
    spring.application.name=dubbo-consumer
    dubbo.registry.address=zookeeper://localhost:2181
    # Filter 必须配置
    dubbo.consumer.filter=dubboSofaTracerFilter
    logging.path=./logs
    ```
* 服务引用

    ```java
    @Reference(async = false)
    public HelloService helloService;
    
    @Bean
    public ApplicationRunner runner() {
        return args -> {
            logger.info(helloService.SayHello("sofa"));
        };
    }
    ```

## 测试

先后启动 tracer-sample-with-dubbo-provider 和 tracer-sample-with-dubbo-consumer 两个工程; 然后查看日志：

* dubbo-client-digest.log
```json
{"time":"2019-09-02 23:36:08.250","local.app":"dubbo-consumer","traceId":"1e27a79c156743856804410019644","spanId":"0","span.kind":"client","result.code":"00","current.thread.name":"http-nio-8080-exec-2","time.cost.milliseconds":"205ms","protocol":"dubbo","service":"com.glmapper.bridge.boot.service.HelloService","method":"SayHello","invoke.type":"sync","remote.host":"192.168.2.103","remote.port":"20880","local.host":"192.168.2.103","client.serialize.time":35,"client.deserialize.time":5,"req.size.bytes":336,"resp.size.bytes":48,"error":"","sys.baggage":"","biz.baggage":""}
```

* dubbo-server-digest.log
```json
{"time":"2019-09-02 23:36:08.219","local.app":"dubbo-provider","traceId":"1e27a79c156743856804410019644","spanId":"0","span.kind":"server","result.code":"00","current.thread.name":"DubboServerHandler-192.168.2.103:20880-thread-2","time.cost.milliseconds":"9ms","protocol":"dubbo","service":"com.glmapper.bridge.boot.service.HelloService","method":"SayHello","local.host":"192.168.2.103","local.port":"62443","server.serialize.time":0,"server.deserialize.time":27,"req.size.bytes":336,"resp.size.bytes":0,"error":"","sys.baggage":"","biz.baggage":""}
```

* dubbo-client-stat.log
```json
{"time":"2019-09-02 23:36:13.040","stat.key":{"method":"SayHello","local.app":"dubbo-consumer","service":"com.glmapper.bridge.boot.service.HelloService"},"count":1,"total.cost.milliseconds":205,"success":"true","load.test":"F"}
```

* dubbo-server-stat.log
```json
{"time":"2019-09-02 23:36:13.208","stat.key":{"method":"SayHello","local.app":"dubbo-provider","service":"com.glmapper.bridge.boot.service.HelloService"},"count":1,"total.cost.milliseconds":9,"success":"true","load.test":"F"}
```

## 对 Dubbo 2.6.x 版本的兼容

SOFATracer 中 2.4.1/3.0.6 版本开始也提供了对于 Dubbo 2.6.x 版本系列的支持。详细使用见：[tracer-dubbo-2.6.x](https://github.com/glmapper/glmapper-boot-dubbo/tree/use-spring-boot-2.x)

注意点：

* 默认情况下，tracerlog 日志将会打在用户根目录下
* SOFATracer 日志目录依赖 log-sofa-boot-starter 来根据 application.properties 配置的 logging.path 来决定，因此如果是 springboot 工程，请引入 log-sofa-boot-starter
