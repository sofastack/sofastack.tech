
---
title: "最佳实践"
aliases: "/sofa-boot/docs/sofa-ark-best-practice"
---

在蚂蚁内部不断打磨，总结了一套面向应用研发运维的最佳实践，已经打包成 SOFAArk 2.0进行发布，该版本相对 SOFAArk 1.0版本有如下几个差别：
1. 内嵌启动Ark Container模式
2. 不建议使用 Ark Plugin
3. Biz类查找不到，默认委托给基座
4. 性能提升：锁阻塞修复、增加类查找缓存，用户不需感知

针对这里的前两点进行介绍说明：
### 内嵌启动
由于SOFAArk 1.0 在非本地环境需要通过 ArkLuncher 启动，导致使用 SOFAArk 的应用启动方式和部署脚本无法普通应用相同，导致在运维过程需要一套不一样的配置，无法长期维护和规模化推广。

通过借鉴 Tomcat 在 Spring 到 SpringBoot 的启动过程的变化，引入内嵌模式的 SOFAArk Luncher，从而使使用了 SOFAArk 的应用能与普通应用启动方式一致。详细请查看
```java
com.alipay.sofa.ark.support.startup.EmbedSofaArkBootstrap
```

### 不建议使用 Ark Plugin
通过 Ark Plugin 进行版本强管控，在业务接入和后续研发和问题过程中产生了较多的困难。

在接入过程中，由于业务方与 Ark Plugin 的维护者一般不是同一个团队，导致业务方在接入过程中，特别是存量应用接入过程中，业务方不清楚Ark Plugin的设计和原理也不清楚哪些依赖被 Ark Plugin 强管控，接入过程会遇到在毫无感知的情况下版本被修改需要不断修改或者删除 Ark Plugin 里管控的依赖。运行时也会遇到一些的报错，排查也非常困难。

### 默认委托给 Master Biz
新增默认委托 Hook `com.alipay.sofa.ark.support.common.DelegateToMasterBizClassLoaderHook`， 存量应用接入SOFAArk后，存量应用会成为 Master Biz，Mater Biz 将包含存量应用的所有依赖，将后续新建的 SOFAArk 模块在类查找不到的时候，统一从基座查找符合存量应用的类查找路线，同时也符合模块同学开始的经验习惯。

[//]: # (![best-pratice]&#40;resource/Best-Practice.png&#41;)
