---
title: "使用 SOFAStack 快速构建微服务"
description: "本指南将基于 SOFAStack 快速构建一个微服务。"
github: "https://github.com/sofastack-guides/kc-sofastack-demo"
projects: [
  {name: "SOFABoot", link: "https://github.com/sofastack/sofa-boot"},
  {name: "SOFARPC", link: "https://github.com/sofastack/sofa-rpc"},
  {name: "SOFALookout", link: "https://github.com/sofastack/sofa-lookout"},
]
---


# 使用 SOFAStack 快速构建微服务

## 前置条件

注意：您需要自行部署后端环境依赖，并修改示例中的服务依赖地址即可使用。

- [必选]部署注册中心：<https://www.sofastack.tech/projects/sofa-registry/server-quick-start/>
- [必须]部署数据库：本地自行搭建数据库，然后导入 [DDL.sql](https://github.com/sofastack-guides/kc-sofastack-demo/blob/master/DDL.sql)
- [可选]部署 LookoutServer：<https://www.sofastack.tech/projects/sofa-lookout/quick-start-metrics-server/>
- [可选]部署 Zipkin：<https://zipkin.io/pages/quickstart.html>

## 实验内容

本实验基于 SOFAStack 快速构建一个微服务，主要包括以下几个部分：

- 使用 SOFABoot + SOFARPC 发布服务
- 使用 SOFABoot + SOFARPC 调用服务
- 通过 ZipKin 查看 SOFATracer 上报的 Tracer 信息
- 通过 SOFALookout 查看上报的 Metrics 信息

## 架构图

![pic](https://gw.alipayobjects.com/mdn/rms_c69e1f/afts/img/A*FiVrSoXTfsAAAAAAAAAAAABkARQnAQ)

## 任务

#### 1、任务准备

从  github 上将 demo 工程克隆到本地

```bash
git clone https://github.com/sofastack-guides/kc-sofastack-demo.git
```

然后将工程导入到 IDEA 或者 eclipse。导入之后界面如下：

![pic](https://gw.alipayobjects.com/mdn/rms_c69e1f/afts/img/A*vVDNR7FRmQsAAAAAAAAAAABkARQnAQ)

- balance-mng：余额管理系统，提供扣减余额服务
- stock-mng：库存管理系统，提供扣减库存服务

#### 2、引入依赖

将下面的依赖引入到 balance-mng 和 stock-mng 工程模块的 pom.xml 文件中。

```xml
<!--SOFARPC 依赖-->
<dependency>
    <groupId>com.alipay.sofa</groupId>
    <artifactId>rpc-sofa-boot-starter</artifactId>
</dependency>
<!--SOFATracer 依赖-->
<dependency>
    <groupId>com.alipay.sofa</groupId>
    <artifactId>tracer-sofa-boot-starter</artifactId>
</dependency>
<!--SOFARegistry 依赖-->
<dependency>
    <groupId>com.alipay.sofa</groupId>
    <artifactId>registry-client-all</artifactId>
</dependency>
<!--runtime 依赖-->
<dependency>
    <groupId>com.alipay.sofa</groupId>
    <artifactId>runtime-sofa-boot-starter</artifactId>
</dependency>
<!--SOFALookout 依赖-->
<dependency>
    <groupId>com.alipay.sofa.lookout</groupId>
    <artifactId>lookout-sofa-boot-starter</artifactId>
</dependency>
```

balance-mng 工程需要将依赖引入 balance-mng/balance-mng-impl/pom.xml 文件：

![pic](https://gw.alipayobjects.com/mdn/rms_c69e1f/afts/img/A*R475S7L1T3gAAAAAAAAAAABkARQnAQ)

stock-mng 工程直接将依赖引入 stock-mng/pom.xml 文件：

![pic](https://gw.alipayobjects.com/mdn/rms_c69e1f/afts/img/A*z5mtSLaTuN4AAAAAAAAAAABkARQnAQ)

#### 3、添加配置

将如下配置复制到 balance-mng 和 stock-mng 工程模块的 application.properties 中。

```properties
# 1、添加服务注册中心地址
com.alipay.sofa.rpc.registry.address=sofa://localhost:9603
# 2、添加 tracer 数据上报的服务端 zipkin 地址
# 如果上面前置条件未搭建 tracer，可以不配置
com.alipay.sofa.tracer.zipkin.base-url=http://localhost:9411
# 3、添加 metrics 数据上报的服务端地址
# 如果上面前置条件未搭建 lookout-server，可以不配置
com.alipay.sofa.lookout.agent-host-address=localhost
```

balance-mng 工程需要将配置添加至 balance-mng/balance-mng-bootstrap/src/main/resources/application.properties 文件：

![pic](https://gw.alipayobjects.com/mdn/rms_c69e1f/afts/img/A*aI0nT4hu2sYAAAAAAAAAAABkARQnAQ)

另外数据库配置修改为自己的数据库信息：

```plain
# database config
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.url=jdbc:mysql://localhost:3306/stock_db
spring.datasource.username=root
spring.datasource.password=root
```

stock-mng 工程需要将配置添加至 stock-mng/src/main/resources/application.properties 文件：

![pic](https://gw.alipayobjects.com/mdn/rms_c69e1f/afts/img/A*MVm1TIODuNYAAAAAAAAAAABkARQnAQ)

另外数据库配置修改为自己的数据库信息：

```plain
# database config
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.url=jdbc:mysql://localhost:3306/stock_db
spring.datasource.username=root
spring.datasource.password=root
```

#### 4、修改 unique id

由于所有人共用一套服务发现，为区分不同用户发布的服务，需要为服务增加 unique id。

KubeCon workshop 会给每个用户准备一个 SOFAStack 账号，格式为 <user0@sofastack.io> 到 <user99@sofastack.io>，去掉 @sofastack.io 部分，账户前半部分的 user0 至 user99 即可作为 unique id。

> 注意：balance-mng 和 stock-mng 里的 unique id 需要一致。

balance-mng 工程需要在 balance-mng/balance-mng-bootstrap/src/main/resources/application.properties 文件修改：

![pic](https://gw.alipayobjects.com/mdn/rms_c69e1f/afts/img/A*6tsSQoNqZKQAAAAAAAAAAABkARQnAQ)

stock-mng 工程需要在 stock-mng/src/main/resources/application.properties 文件修改：

![pic](https://gw.alipayobjects.com/mdn/rms_c69e1f/afts/img/A*0dF6R6oKJTUAAAAAAAAAAABkARQnAQ)

#### 5、发布 SOFARPC 服务

在 BalanceMngImpl 类上加上 @SofaService 注解 和 @Service 注解，将其发布成一个 SOFARPC 服务：

```java
import org.springframework.stereotype.Service;
import com.alipay.sofa.runtime.api.annotation.SofaService;
import com.alipay.sofa.runtime.api.annotation.SofaServiceBinding;

@Service
@SofaService(interfaceType = BalanceMngFacade.class, uniqueId = "${service.unique.id}", bindings = { @SofaServiceBinding(bindingType = "bolt") })
```

增加之后的 BalanceMngImpl 类如下图所示：

![pic](https://gw.alipayobjects.com/mdn/rms_c69e1f/afts/img/A*Hq4HSrGX3YsAAAAAAAAAAABkARQnAQ)

在 StockMngImpl 类上加上 @SofaService 注解 和 @Service 注解，将其发布成一个 SOFARPC 服务：

```java
import org.springframework.stereotype.Service;
import com.alipay.sofa.runtime.api.annotation.SofaService;
import com.alipay.sofa.runtime.api.annotation.SofaServiceBinding;

@Service
@SofaService(interfaceType = StockMngFacade.class, uniqueId = "${service.unique.id}", bindings = { @SofaServiceBinding(bindingType = "bolt") })
```

增加之后的 StockMngImpl 类如下图所示：

![pic](https://gw.alipayobjects.com/mdn/rms_c69e1f/afts/img/A*s36WT6dxHcsAAAAAAAAAAABkARQnAQ)

#### 6、引用 SOFARPC 服务

在 BookStoreControllerImpl 类中的 stockMngFacade 变量上方加 @SofaReference 注解，用于引用 SOFARPC 服务:

```java
import com.alipay.sofa.runtime.api.annotation.SofaReference;
import com.alipay.sofa.runtime.api.annotation.SofaReferenceBinding;

@SofaReference(interfaceType = StockMngFacade.class, uniqueId = "${service.unique.id}", binding = @SofaReferenceBinding(bindingType = "bolt"))
```

在 BookStoreControllerImpl 类中的 balanceMngFacade 变量上方加 @SofaReference 注解，用于引用 SOFARPC 服务:

```java
import com.alipay.sofa.runtime.api.annotation.SofaReference;
import com.alipay.sofa.runtime.api.annotation.SofaReferenceBinding;

@SofaReference(interfaceType = BalanceMngFacade.class, uniqueId = "${service.unique.id}", binding = @SofaReferenceBinding(bindingType = "bolt"))
```

增加之后的 BookStoreControllerImpl 类如下图所示：

![pic](https://gw.alipayobjects.com/mdn/rms_c69e1f/afts/img/A*L2d6RLa8XzkAAAAAAAAAAABkARQnAQ)

#### 7、实验验证

运行 BalanceMngApplication 和 StockMngApplication 即可启动应用。应用启动之后，通过浏览器访问：[http://localhost:8080](http://localhost:8080) 即可正常操作页面:

![pic](https://gw.alipayobjects.com/mdn/rms_c69e1f/afts/img/A*s_pATp7OFmAAAAAAAAAAAABkARQnAQ)

浏览器访问 [http://localhost:9411](http://localhost:9411)，查看链路数据上报以链路关系图：

![pic](https://gw.alipayobjects.com/mdn/rms_c69e1f/afts/img/A*rUxWQJ2tARAAAAAAAAAAAABkARQnAQ)

浏览器访问 [http://localhost:9090](http://localhost:9090) 即可查看上报 metrics：

![pic](https://gw.alipayobjects.com/mdn/rms_c69e1f/afts/img/A*k1kVS5N4oCQAAAAAAAAAAABkARQnAQ)

- `jvm.threads.totalStarted{app="stock_mng"}`：可以查看 JVM 启动线程数
- `rpc.consumer.service.stats.total_count.count{app="stock_mng"}`：可以查看 stock_mng 应用的调用次数

关于 SOFALookout 的更多用法，请参考: [https://www.sofastack.tech/sofa-lookout/docs/Home](https://www.sofastack.tech/sofa-lookout/docs/Home)

## 更多

- [下载本次 Demo 幻灯片](https://gw.alipayobjects.com/os/basement_prod/b16fd217-b82b-436e-8b0d-452e636e072b.pdf)。
