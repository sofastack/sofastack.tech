---
title: "使用 SOFARegistry 作为注册中心"
aliases: "/sofa-rpc/docs/Registry-SOFA"
---

SOFARPC 已支持使用 SOFARegistry 作为服务注册中心。假设你已经根据 SOFARegistry 的[快速开始](../../sofa-registry/server-quick-start)在本地部署好 SOFARegistry Server，服务发现的端口默认设置在 `9603`。

在 SOFARPC 中使用 SOFARegistry 作为服务注册中心首先要添加如下的依赖：

```xml
<dependency>
  <groupId>com.alipay.sofa</groupId>
  <artifactId>registry-client-all</artifactId>
  <version>5.2.0</version>
</dependency>
```

然后在 application.properties 中加入如下配置即可：

```
com.alipay.sofa.rpc.registry.address=sofa://127.0.0.1:9603
```

当前支持 SOFARegistry 的版本：

SOFARPC: [5.5.2](https://github.com/sofastack/sofa-rpc/releases), SOFABoot: [2.6.3](https://github.com/sofastack/sofa-boot/releases/)。

由于本次发布的时间问题，暂时需要用户指定SOFARPC Starter的版本

```xml
<dependency>
    <groupId>com.alipay.sofa</groupId>
    <artifactId>rpc-sofa-boot-starter</artifactId>
    <version>5.5.2</version>
</dependency>
```


SOFARPC 集成验证 SOFARegistry 服务端版本：5.2.0
