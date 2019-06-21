
---
title: "Local"
aliases: "/sofa-rpc/docs/Registry-Local"
---


To use local file as service registry center, you can configure it in `application.properties` as follows:
```
com.alipay.sofa.rpc.registry.address=local:///home/admin/registry/localRegistry.reg
```

The `/home/admin/registry/localRegistry.reg` is the directory of the local files to be used.

On windows OS, the above path indicates the following directory:

```
com.alipay.sofa.rpc.registry.address=local://c://users/localRegistry.reg
```