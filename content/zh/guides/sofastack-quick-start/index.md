---
title: "使用 SOFAStack 快速构建微服务"
description: "本指南将基于 SOFAStack 快速构建一个微服务。"
github: "https://github.com/sofastack-guides/kc-sofastack-demo"
projects: [
  {name: "SOFABoot", link: "https://github.com/sofastack/sofaboot"}, 
  {name: "SOFARPC", link: "https://github.com/sofastack/sofa-rpc"}, 
  {name: "SOFALookout", link: "https://github.com/sofastack/sofa-lookout"},
]
---

## 实验内容

本实验基于 SOFAStack 快速构建一个微服务，主要包括以下几个部分：

- 使用 SOFABoot + SOFARPC 发布服务
- 使用 SOFABoot + SOFARPC 调用服务
- 通过 ZipKin 查看 SOFATracer 上报的 Tracer 信息
- 通过 SOFALookout 查看上报的 Metrics 信息

## 架构图

![架构图](https://gw.alipayobjects.com/mdn/rms_c69e1f/afts/img/A*FiVrSoXTfsAAAAAAAAAAAABkARQnAQ)

## 任务

#### 1、任务准备

从 github 上将 demo 工程克隆到本地

```bash
git clone https://github.com/sofastack-guides/kc-sofastack-demo.git
```

然后将工程导入到 IDEA 或者 eclipse。导入之后界面如下：

![pic](https://gw.alipayobjects.com/mdn/rms_c69e1f/afts/img/A*vVDNR7FRmQsAAAAAAAAAAABkARQnAQ)

- balance-mng：账户管理系统，提供扣减余额服务
- stock-mng：账户系统，提供扣减库存服务

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

stock-mng 工程需要将依赖引入 stock-mng/pom.xml 文件：

![pic](https://gw.alipayobjects.com/mdn/rms_c69e1f/afts/img/A*z5mtSLaTuN4AAAAAAAAAAABkARQnAQ)

#### 3、添加配置

将如下配置复制到 balance-mng 和 stock-mng 工程模块的 application.properties 中。

```ini
# 1、添加服务注册中心地址
com.alipay.sofa.rpc.registry.address=sofa://118.31.43.62:9603
# 2、添加 tracer 数据上报的服务端 zipkin 地址
com.alipay.sofa.tracer.zipkin.base-url=http://139.224.123.199:9411
# 3、添加 metrics 数据上报的服务端地址
com.alipay.sofa.lookout.agent-host-address=139.224.123.35
```

balance-mng 工程需要将配置添加至 balance-mng/balance-mng-bootstrap/src/main/resources/application.properties 文件：

![pic](https://gw.alipayobjects.com/mdn/rms_c69e1f/afts/img/A*aI0nT4hu2sYAAAAAAAAAAABkARQnAQ)

stock-mng 工程需要将配置添加至 stock-mng/src/main/resources/application.properties 文件：

![pic](https://gw.alipayobjects.com/mdn/rms_c69e1f/afts/img/A*MVm1TIODuNYAAAAAAAAAAABkARQnAQ)

#### 4、修改 unique id

由于所有人共用一套服务发现，为区分不同用户发布的服务，需要为服务增加 unique id。

KubeCon workshop 会给每个用户准备一个 SOFAStack 账号，格式为 [user0@sofastack.io](mailto:user0@sofastack.io) 到 [user99@sofastack.io](mailto:user99@sofastack.io)，去掉 @sofastack.io 部分，账户前半部分的 user0 至 user99 即可作为 unique id。

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

运行 BalanceMngApplication 和 StockMngApplication 即可启动应用。应用启动之后，通过浏览器访问：[http://localhost:8080](http://localhost:8080/) 即可正常操作页面：

![pic](https://gw.alipayobjects.com/mdn/rms_c69e1f/afts/img/A*s_pATp7OFmAAAAAAAAAAAABkARQnAQ)

浏览器访问 [http://116.62.131.134:9411](http://116.62.131.134:9411)，查看链路数据上报以及链路关系图：

![pic](https://gw.alipayobjects.com/mdn/rms_c69e1f/afts/img/A*rUxWQJ2tARAAAAAAAAAAAABkARQnAQ)

浏览器访问 [http://121.43.187.56:9090](http://121.43.187.56:9090) 即可查看上报 metrics：

![pic](https://gw.alipayobjects.com/mdn/rms_c69e1f/afts/img/A*k1kVS5N4oCQAAAAAAAAAAABkARQnAQ)

- `jvm.threads.totalStarted{app="stock_mng"}`：可以查看 JVM 启动线程数
- `rpc.consumer.service.stats.total_count.count{app="stock_mng"}`：可以查看 stock_mng 应用的调用次数

关于 SOFALookout 的更多用法，。请参考: https://www.sofastack.tech/projects/sofa-lookout

## 更多

- [下载本次 Demo 幻灯片](https://gw.alipayobjects.com/os/basement_prod/b16fd217-b82b-436e-8b0d-452e636e072b.pdf)。