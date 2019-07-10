
---
title: "使用 Consul 作为注册中心"
aliases: "/sofa-rpc/docs/Registry-Consul"
---


使用 Consul 作为服务注册中心需要添加如下依赖

```
<dependency>
  <groupId>com.ecwid.consul</groupId>
  <artifactId>consul-api</artifactId>
  <version>1.4.2</version>
</dependency>
```


然后在 application.properties 中如下配置：

```
com.alipay.sofa.rpc.registry.address=consul://127.0.0.1:8500
```
其中后面的值为 consul 的连接地址，如果需要设置一些其他参数，也可以通过

```
com.alipay.sofa.rpc.registry.address=consul://127.0.0.1:8500?a=1&b=2

```
进行设置
