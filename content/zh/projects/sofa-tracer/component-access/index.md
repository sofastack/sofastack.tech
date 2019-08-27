---
title: "快速开始指南"
aliases: "/sofa-tracer/docs/ComponentAccess"
---

SOFATracer 接入的组件列表参考：[SOFATracer 介绍](../overview)，在使用时请注意不同组件对应的SOFATracer 版本和 JDK 版本。

### 环境准备

要使用 SOFABoot，需要先准备好基础环境，SOFABoot 依赖以下环境：
- JDK7 或 JDK8 
- 需要采用 Apache Maven 3.2.5 或者以上的版本来编译

### 示例列表

下面所有 Samples 工程均为 SOFABoot 工程(同时支持 SpringBoot 工程中使用)，关于如何创建 SOFABoot 工程请参考 [SOFABoot 快速开始](/projects/sofa-boot/quick-start)。

* 组件接入
    * [Spring MVC 埋点接入](../usage-of-mvc)
    * [HttpClient 埋点接入](../usage-of-httpclient)
    * [DataSource 埋点接入](../usage-of-datasource)
    * [RestTemplate 埋点接入](../usage-of-resttemplate)
    * [OkHttp 埋点接入](../usage-of-okhttp)
    * [Dubbo 埋点接入](../usage-of-dubbo)
* [采样](../sampler)
* [上报数据到 Zipkin](../report-to-zipkin)