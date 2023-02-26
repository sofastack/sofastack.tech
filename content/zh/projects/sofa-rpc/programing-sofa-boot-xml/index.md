
---
title: "SOFABoot 环境 XML 配置使用"
aliases: "/sofa-rpc/docs/Programing-SOFA-BOOT-XML"
---
声明 SOFABoot 的 xsd 文件：在要使用的 XML 配置文件中将头部 xsd 文件的声明设置为如下。这样就能够使用 SOFABoot 定义的 XML 元素进行开发。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:sofa="http://sofastack.io/schema/sofaboot"
       xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
            http://sofastack.io/schema/sofaboot   http://sofastack.io/schema/sofaboot.xsd"
       default-autowire="byName">
```

在xml方式中发布和引用服务的方式如下。 sofa:service 元素表示发布服务， sofa:reference 元素表示引用服务。 sofa:binding 表示服务发布或引用的协议。

```xml
<bean id="personServiceImpl" class="com.alipay.sofa.boot.examples.demo.rpc.bean.PersonServiceImpl"/>
<sofa:service ref="personServiceImpl" interface="com.alipay.sofa.boot.examples.demo.rpc.bean.PersonService">
    <sofa:binding.bolt/>
</sofa:service>
```

一个服务也可以通过多种协议进行发布，如下：

```xml
<sofa:service ref="personServiceImpl" interface="com.alipay.sofa.boot.examples.demo.rpc.bean.PersonService">
    <sofa:binding.bolt/>
    <sofa:binding.rest/>
    <sofa:binding.dubbo/>
</sofa:service>
```

服务引用

```xml
<sofa:reference id="personReferenceBolt" interface="com.alipay.sofa.boot.examples.demo.rpc.bean.PersonService">
     <sofa:binding.bolt/>
</sofa:reference>
```

也可以是其他的协议

```xml
<sofa:reference id="personReferenceRest" interface="com.alipay.sofa.boot.examples.demo.rpc.bean.PersonService">
     <sofa:binding.rest/>
</sofa:reference>
```
