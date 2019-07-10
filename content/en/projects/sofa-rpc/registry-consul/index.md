
---
title: "Consul"
aliases: "/sofa-rpc/docs/Registry-Consul"
---


To use Consul as service registry center, you need to add this dependency

```
<dependency>
  <groupId>com.ecwid.consul</groupId>
  <artifactId>consul-api</artifactId>
  <version>1.4.2</version>
</dependency>
```


and need to configure it in `application.properties` as follows:

```
com.alipay.sofa.rpc.registry.address=consul://127.0.0.1:8500
```
The value after `consul:` is the connection address of the consul. If you need to set some other parameters, you can also configure as follows:

```
com.alipay.sofa.rpc.registry.address=consul://127.0.0.1:8500?a=1&b=2

```
