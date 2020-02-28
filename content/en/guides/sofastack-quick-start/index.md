---
title: "Build microservices with SOFAStack"
description: "This guide introduces how to quickly build a microservice based on SOFAStack. "
github: "https://github.com/sofastack-guides/kc-sofastack-demo"
projects: [{name: "SOFABoot", link: "https://github.com/sofastack/sofa-boot"}, {name: "SOFARPC",link:"https://github.com/sofastack/sofa-rpc"}, {name: "SOFALookout",link:"https://github.com/sofastack/sofa-lookout"} ]
---

## Procedure

This guide introduces how to quickly build a microservice based on SOFAStack. It mainly includes the following steps.

- Publish service using SOFABoot and SOFARPC
- Call service using SOFABoot and SOFARPC
- View Tracer information reported by SOFATracer via ZipKin
- View Metrics information via SOFALookout

## Architecture

![Architecture](https://gw.alipayobjects.com/mdn/rms_c69e1f/afts/img/A*FiVrSoXTfsAAAAAAAAAAAABkARQnAQ)

## Tasks

#### 1. Preparation

Clone the project demo from GitHub to local

```bash
git clone https://github.com/sofastack-guides/kc-sofastack-demo.git
```

Import the project into IDEA or Eclipse. After import, the interface is as follows:

![imported project](https://gw.alipayobjects.com/mdn/rms_c69e1f/afts/img/A*vVDNR7FRmQsAAAAAAAAAAABkARQnAQ)

- balance-mng: account management system, providing deduction balance service
- stock-mng: account system, providing deduction inventory service

#### 2. Introduce dependencies

Add the following dependencies into the `pom.xml` files of balance-mng and stock-mng project modules.

```xml
<!--SOFARPC dependency-->
<dependency>
    <groupId>com.alipay.sofa</groupId>
    <artifactId>rpc-sofa-boot-starter</artifactId>
</dependency>
<!--SOFATracer dependency-->
<dependency>
    <groupId>com.alipay.sofa</groupId>
    <artifactId>tracer-sofa-boot-starter</artifactId>
</dependency>
<!--SOFARegistry dependency-->
<dependency>
    <groupId>com.alipay.sofa</groupId>
    <artifactId>registry-client-all</artifactId>
</dependency>
<!--runtime dependency-->
<dependency>
    <groupId>com.alipay.sofa</groupId>
    <artifactId>runtime-sofa-boot-starter</artifactId>
</dependency>
<!--SOFALookout dependency-->
<dependency>
    <groupId>com.alipay.sofa.lookout</groupId>
    <artifactId>lookout-sofa-boot-starter</artifactId>
</dependency>
```

For balance-mng project, you need to introduce the dependencies into the pom file of balance-mng-imp module.

![introduce dependencies in balance-mng](https://gw.alipayobjects.com/mdn/rms_c69e1f/afts/img/A*R475S7L1T3gAAAAAAAAAAABkARQnAQ)

For stock-mng project, you need to introduce the dependencies into the pom file of stock-mng module.

![introduce dependencies in stock-mng](https://gw.alipayobjects.com/mdn/rms_c69e1f/afts/img/A*z5mtSLaTuN4AAAAAAAAAAABkARQnAQ)

#### 3. Add configurations

Copy the following configurations into the application.properties file of balance-mng and stock-mng project module.

```ini
# 1、Add Service Registry address
com.alipay.sofa.rpc.registry.address=sofa://118.31.43.62:9603
# 2、Add the zipkin address where tracer data is reported
com.alipay.sofa.tracer.zipkin.base-url=http://139.224.123.199:9411
# 3、Add the server-side address where the metrics data is reported
com.alipay.sofa.lookout.agent-host-address=139.224.123.35
```

For balance-mng project, you need to add configurations to the application.properties file in balance-mng-bootstrap module.

![add configurations](https://gw.alipayobjects.com/mdn/rms_c69e1f/afts/img/A*aI0nT4hu2sYAAAAAAAAAAABkARQnAQ)

For stock-mng project, you need to add configurations to the application.properties file in stock-mng module.

![add configurations for stock-mng](https://gw.alipayobjects.com/mdn/rms_c69e1f/afts/img/A*MVm1TIODuNYAAAAAAAAAAABkARQnAQ)

#### 4. Modify unique id

Since everyone shares a set of service discoveries, to differentiate the services published by different users, it is required to add a unique id to the service.

KubeCon workshop will prepare a SOFAStack account for each user in the format of[user0@sofastack.io](mailto:user0@sofastack.io) to [user99@sofastack.io](mailto:user99@sofastack.io). The first half of the account, namely user0 to user99 without @sofastack.io, can be used as a unique id.

For balance-mng project, you need to modify the unique id in the application.properties file of balance-mng-bootstrap module.

![(uniqueid of balance-mng](https://gw.alipayobjects.com/mdn/rms_c69e1f/afts/img/A*6tsSQoNqZKQAAAAAAAAAAABkARQnAQ)

For stock-mng project, you need to modify the unique id in the application.properties file of stock-mng module.

![uniqueid of stock-mng](https://gw.alipayobjects.com/mdn/rms_c69e1f/afts/img/A*0dF6R6oKJTUAAAAAAAAAAABkARQnAQ)

#### 5. Publish SOFARPC service

Add the @SofaService and @Service annotations on BalanceMngImpl class to publish it as a SOFARPC service:

```java
@Service
@SofaService(interfaceType = BalanceMngFacade.class, uniqueId = "${service.unique.id}", bindings = { @SofaServiceBinding(bindingType = "bolt") })
```

The BalanceMngImpl class with annotations added is shown as the following screenshot:

![BalanceMngImpl](https://gw.alipayobjects.com/mdn/rms_c69e1f/afts/img/A*Hq4HSrGX3YsAAAAAAAAAAABkARQnAQ)

Add the @SofaService and @Service annotations on StockMngImpl class to publish it as a SOFARPC service:

```java
@Service
@SofaService(interfaceType = StockMngFacade.class, uniqueId = "${service.unique.id}", bindings = { @SofaServiceBinding(bindingType = "bolt") })
```

The StockMngImpl class with annotations added is shown as the following screenshot:

![StockMngImpl](https://gw.alipayobjects.com/mdn/rms_c69e1f/afts/img/A*s36WT6dxHcsAAAAAAAAAAABkARQnAQ)

#### 6. Reference SOFARPC service

Add @SofaReference annotation on the stockMngFacade variable in BookStoreControllerImpl class to reference SOFARPC service:

```java
@SofaReference(interfaceType = StockMngFacade.class, uniqueId = "${service.unique.id}", binding = @SofaReferenceBinding(bindingType = "bolt"))
```

Add @SofaReference annotation on the balanceMngFacade variable in BookStoreControllerImpl class to reference SOFARPC service:

```java
@SofaReference(interfaceType = BalanceMngFacade.class, uniqueId = "${service.unique.id}", binding = @SofaReferenceBinding(bindingType = "bolt"))
```

The BookStoreControllerImpl class with annotations added is as shown in the following screenshot:

![BookStoreControllerImpl](https://gw.alipayobjects.com/mdn/rms_c69e1f/afts/img/A*L2d6RLa8XzkAAAAAAAAAAABkARQnAQ)

#### 7. Verification

Run BalanceMngApplication and BalanceMngApplication to start the application. After the application is started successfully, you can access [http://localhost:8080](http://localhost:8080/) in the browser.

![Book list](https://gw.alipayobjects.com/mdn/rms_c69e1f/afts/img/A*s_pATp7OFmAAAAAAAAAAAABkARQnAQ)

To view the reported link data and link relation diagram, you can visit [http://zipkin-dev.sofastack.tech:9411](http://zipkin-dev.sofastack.tech:9411/) in the browser.

![Zipkin](https://gw.alipayobjects.com/mdn/rms_c69e1f/afts/img/A*rUxWQJ2tARAAAAAAAAAAAABkARQnAQ)

To view the reported merics, you can visit [http://zipkin-dev.sofastack.tech:9411](http://zipkin-dev.sofastack.tech:9411/) in the browser:

![zipkin](https://gw.alipayobjects.com/mdn/rms_c69e1f/afts/img/A*k1kVS5N4oCQAAAAAAAAAAABkARQnAQ)

- jvm.threads.totalStarted{app="stock_mng"}：Number of JVM startup threads
- jvm.memory.heap.used{app="stock_mng"}：JVM usage memory
- jvm.gc.old.count{app="stock_mng"}：JVM old-generation GC times
- rpc.consumer.service.stats.total_count.count{app="stock_mng"}：Number of calls of BalanceMngFacade interface
- rpc.consumer.service.stats.total_time.elapPerExec{app="stock_mng"}： Average calling duration of BalanceMngFacade
- rpc.consumer.service.stats.total_time.max{app="stock_mng"}：Maximum response time of BalanceMngFacade

For more usage about SOFALookout, see https://www.sofastack.tech/sofa-lookout/docs/Home
