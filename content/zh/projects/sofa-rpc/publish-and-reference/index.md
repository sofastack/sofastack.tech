
---
title: "服务发布与引用"
aliases: "/sofa-rpc/docs/Publish-And-Reference"
---
SOFARPC 的服务发布和引用的基本配置已经在「编程界面」章节中说明，这里主要介绍服务发布和引用的一些特性。

### 同一服务发布多种协议

在 SOFARPC 中，可以将同一个服务发布成多个协议，让调用端可以使用不同的协议调用服务提供方。

如果使用 Java API，可以按照如下的代码构建多个 ServerConfig，不同的 ServerConfig 设置不同的协议，然后将这些 ServerConfig 设置给 ProviderConfig：

```java
ServerConfig serverConfigA = new ServerConfig();
ServerConfig serverConfigB = new ServerConfig();
        
 List<ServerConfig> serverConfigs = new ArrayList<ServerConfig>();
 serverConfigs.add(serverConfigA);
 serverConfigs.add(serverConfigB);
 providerConfig.setServer(serverConfigs);
```

如果使用 XML 的方式，直接在 `<sofa:service>` 标签中增加多个 binding 即可：

```xml
<sofa:service ref="sampleFacadeImpl" interface="com.alipay.sofa.rpc.bean.SampleFacade">
    <sofa:binding.bolt/>
    <sofa:binding.rest/>
    <sofa:binding.dubbo/>
</sofa:service>
```

如果使用 Annotation 的方式，在 `@SofaService` 中增加多个 binding 即可：

```java
@SofaService(
        interfaceType = SampleService.class,
        bindings = {
                @SofaServiceBinding(bindingType = "rest"),
                @SofaServiceBinding(bindingType = "bolt")
        }
)
public class SampleServiceImpl implements SampleService {
    // ...
}
```

### 同一服务注册多个注册中心

如果使用 API 的方式，构建多个 RegistryConfig 设置给 ProviderConfig 即可：

```java
RegistryConfig registryA = new RegistryConfig();
RegistryConfig registryB = new RegistryConfig();
        
List<RegistryConfig> registryConfigs = new ArrayList<RegistryConfig>();
registryConfigs.add(registryA);
registryConfigs.add(registryB);
providerConfig.setRegistry(registryConfigs);
```

如果是使用 XML 的方式

需要在properties里配置注册中心

```java
com.alipay.sofa.rpc.registries.zookeeper=zookeeper://127.0.0.1:2181
com.alipay.sofa.rpc.registries.nacos=nacos://127.0.0.1:8848
```

```xml
<bean id="sampleFacadeImpl" class="com.alipay.sofa.rpc.bean.SampleFacadeImpl"/>
<sofa:service ref="sampleFacadeImpl" interface="com.alipay.sofa.rpc.bean.SampleFacade">
    <sofa:binding.bolt>
        <sofa:global-attrs registry="nacos,zookeeper"/>
    </sofa:binding.bolt>
</sofa:service>
```

如果使用 Annotation 的方式

需要在properties里配置注册中心

```java
com.alipay.sofa.rpc.registries.zookeeper=zookeeper://127.0.0.1:2181
com.alipay.sofa.rpc.registries.nacos=nacos://127.0.0.1:8848
```

```java
@SofaService(bindings = {@SofaServiceBinding(registry = "nacos"),
        @SofaServiceBinding(registry = "zookeeper")})
public class SampleServiceImpl implements SampleService {
    // ...
}
```

### 方法级参数设置

在 Java API 方式中，调用 MethodConfig 对象相应的 set 方法即可设置对应的参数，如下所示：

```java
MethodConfig methodConfigA = new MethodConfig();
MethodConfig methodConfigB = new MethodConfig();

List<MethodConfig> methodConfigs = new ArrayList<MethodConfig>();
methodConfigs.add(methodConfigA);
methodConfigs.add(methodConfigB);

providerConfig.setMethods(methodConfigs);  //服务端设置
consumerConfig.setMethods(methodConfigs);  //客户端设置
```

使用 XML 的方式，在对应的 binding 里面使用 `<sofa:method>` 标签即可设置对应的参数：

```xml
<sofa:reference id="personReferenceBolt" interface="com.alipay.sofa.boot.examples.demo.rpc.bean.PersonService">
    <sofa:binding.bolt>
        <sofa:global-attrs timeout="3000" address-wait-time="2000"/>  <!-- 调用超时；地址等待时间。 -->
        <sofa:route target-url="127.0.0.1:22000"/>  <!-- 直连地址 -->
        <sofa:method name="sayName" timeout="3000"/> <!-- 方法级别配置 -->
    </sofa:binding.bolt>
</sofa:reference>

<sofa:service ref="sampleFacadeImpl" interface="com.alipay.sofa.rpc.bean.SampleFacade">
    <sofa:binding.bolt>
        <sofa:global-attrs timeout="3000"/>
        <sofa:method name="sayName" timeout="2000"/>
    </sofa:binding.bolt>
</sofa:service>
```

目前 Annotation 的方式暂不支持设置方法级别的参数，将在后续版本中支持。

### 配置覆盖

SOFARPC 里面的某些配置在服务提供方可以设置，在服务调用方也可以设置，比如调用的超时的 timeout 属性，这些配置的优先级为：

线程调用级别设置 >> 服务调用方方法级别设置 >> 服务调用方 Reference 级别设置 >> 服务提供方方法级别设置 >> 服务提供方 Service 级别设置
