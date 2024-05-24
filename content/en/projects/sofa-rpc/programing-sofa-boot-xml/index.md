
---

title: "Use XML in SOFABoot"
aliases: "/sofa-rpc/docs/Programing-SOFA-BOOT-XML"
---

## XML mode

Declare the xsd file of SOFABoot: In the XML configuration file to be used, configure the declaration of the header xsd file to the followings. This enables development using the XML elements defined by SOFABoot.

```xml
<?xml version="1.0" encoding="UTF-8"?> 
<beans xmlns="http://www.springframework.org/schema/beans" 
       xmlns:xsi="http://www .w3.org/2001/XMLSchema-instance" 
       xmlns:sofa="http://sofastack.io/schema/sofaboot" 
       xmlns:context="http://www.springframework.org/schema/context" 
       xsi:schemaLocation ="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd 
            http://sofastack.io/schema/sofaboot http://sofastack .io/schema/sofaboot.xsd"
```

The way to publish and reference services in xml mode is as follows. `sofa:service` represents publishing service, and `sofa:reference` represents referencing service. `sofa:binding` indicates the protocol for service publishing or reference.

```xml
<bean id="personServiceImpl" class="com.alipay.sofa.boot.examples.demo.rpc.bean.PersonServiceImpl"/>
<sofa:service ref="personServiceImpl" interface="com.alipay.sofa.boot.examples.demo.rpc.bean.PersonService">
    <sofa:binding.bolt/>
</sofa:service>
```

A service can also be published through multiple protocols, as follows:

```xml
<sofa:service ref="personServiceImpl" interface="com.alipay.sofa.boot.examples.demo.rpc.bean.PersonService">
    <sofa:binding.bolt/>
    <sofa:binding.rest/>
    <sofa:binding.dubbo/>
</sofa:service>
```

Service reference

```xml
<sofa:reference id="personReferenceBolt" interface="com.alipay.sofa.boot.examples.demo.rpc.bean.PersonService">
     <sofa:binding.bolt/>
</sofa:reference>
```

A service can also be referenced through other protocols:

```xml
<sofa:reference id="personReferenceRest" interface="com.alipay.sofa.boot.examples.demo.rpc.bean.PersonService">
     <sofa:binding.rest/>
</sofa:reference>
```
