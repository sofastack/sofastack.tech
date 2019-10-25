---
title: "OpenFeign 埋点接入"
aliases: "/sofa-tracer/docs/Usage_Of_openfeign"
---

在本文档将演示如何使用 SOFATracer 对 Spring Cloud OpenFeign 进行埋点。

## 基础环境

本案例使用的各框架组件的版本如下：

* Spring Cloud Greenwich.RELEASE
* SOFABoot 3.1.1/SpringBoot 2.1.0.RELEASE
* SOFATracer 3.0.4 
* JDK 8

本案例包括两个子工程：

* tracer-sample-with-openfeign-provider  服务提供方
* tracer-sample-with-openfeign-consumer  服务调用方

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

## 新建 tracer-sample-with-openfeign-provider

* 在工程模块的 pom 文件中添加 SOFATracer 依赖

    ```xml
    <dependency>
        <groupId>com.alipay.sofa</groupId>
        <artifactId>tracer-sofa-boot-starter</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-zookeeper-discovery</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-openfeign</artifactId>
    </dependency>
    ```
    > SOFATracer 版本受 SOFABoot 版本管控，如果使用的 SOFABoot 版本不匹配，则需要手动指定 tracer 版本，且版本需高于 3.0.4.

* 在工程的 `application.properties` 文件下添加相关参数

    ```properties
    spring.application.name=tracer-provider
    server.port=8800
    spring.cloud.zookeeper.connect-string=localhost:2181
    spring.cloud.zookeeper.discovery.enabled=true
    spring.cloud.zookeeper.discovery.instance-id=tracer-provider
    ```
* 简单的资源类

    ```java
    @RestController
    public class UserController {
        @RequestMapping("/feign")
        public String testFeign(HttpServletRequest request) {
            return "hello tracer feign";
        }
    }
    ```
## 新建 tracer-sample-with-openfeign-consumer

* 在工程模块的 pom 文件中添加 SOFATracer 依赖

    ```xml
    <dependency>
        <groupId>com.alipay.sofa</groupId>
        <artifactId>tracer-sofa-boot-starter</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-zookeeper-discovery</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-openfeign</artifactId>
    </dependency>
    ```

* 在工程的 `application.properties` 文件下添加相关参数

    ```properties
    spring.application.name=tracer-consumer
    server.port=8082
    spring.cloud.zookeeper.connect-string=localhost:2181
    spring.cloud.zookeeper.discovery.enabled=true
    spring.cloud.zookeeper.discovery.instance-id=tracer-consumer
    ```
* 定义 feign 资源

    ```java
    @FeignClient(value = "tracer-provider",fallback = FeignServiceFallbackFactory.class)
    public interface FeignService {
        @RequestMapping(value = "/feign", method = RequestMethod.GET)
        String testFeign();
    }
    ```
* 开启服务发现和feign注解

    ```java
    @SpringBootApplication
    @RestController
    @EnableDiscoveryClient
    @EnableFeignClients
    public class FeignClientApplication {
    
        public static void main(String[] args) {
            SpringApplication.run(FeignClientApplication.class,args);
        }
    
        @Autowired
        private FeignService feignService;
    
        @RequestMapping
        public String test(){
            return feignService.testFeign();
        }
    }
    ```

## 测试

先后启动 tracer-sample-with-openfeign-provider 和 tracer-sample-with-openfeign-consumer 两个工程; 然后浏览器访问：
http://localhost:8082/ 。然后查看日志：

在上面的 `application.properties` 里面，我们配置的日志打印目录是 `./logs` 即当前应用的根目录（我们可以根据自己的实践需要进行配置），在当前工程的根目录下可以看到类似如下结构的日志文件：

```
./logs
├── spring.log
└── tracelog
    ├── feign-digest.log
    ├── feign-stat.log
    ├── spring-mvc-digest.log
    ├── spring-mvc-stat.log
    ├── static-info.log
    └── tracer-self.log
```

示例中通过 SpringMvc 提供的 Controller 作为请求入口，然后使用 openfeign client 发起向下游资源的访问调用，日志大致如下：

```json
{"time":"2019-09-03 10:28:52.363","local.app":"tracer-consumer","traceId":"0a0fe9271567477731347100110969","spanId":"0.1","span.kind":"client","result.code":"200","current.thread.name":"http-nio-8082-exec-1","time.cost.milliseconds":"219ms","request.url":"http://10.15.233.39:8800/feign","method":"GET","error":"","req.size.bytes":0,"resp.size.bytes":18,"remote.host":"10.15.233.39","remote.port":"8800","sys.baggage":"","biz.baggage":""}
```