---
title: "蚂蚁金服 Service Mesh 大规模落地系列 - 质量篇"
author: "柑橘、西经、柏翘"
description: " 本文为《蚂蚁金服 Service Mesh 大规模落地系列》最后 一篇 - 质量篇，结合蚂蚁金服 Mesh 化落地质量保障落地的思考，给大家带来一些质量保障的分享。"
categories: "Service mesh"
tags: ["Service mesh","Service Mesh 落地实践"]
date: 2020-01-20T18:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1579512529612-53c5cff4-8efe-4cd9-b84a-8d27308f9249.jpeg"
---

![Service Mesh-质量篇-01.jpg](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1578910155127-356384f1-1dcd-48a0-9b76-e1c0b14c1548.jpeg)

本文为《蚂蚁金服 Service Mesh 大规模落地系列》最后 一篇 - 质量篇，该系列从核心、RPC、消息、无线网关、控制面、安全、运维、测试等模块对 Service Mesh 双十一大规模落地实践进行详细解析。文末包含往期系列文章。

## 前言

Service Mesh 在蚂蚁金服内部已经大规模落地，经历刚刚双十一的检阅，将现有的体系快速演进至 Service Mesh 架构，无异于给飞机换发动机。本主题主要分享在蚂蚁金服当前的体量下，我们如何做到给飞机换发动机，还确保不出问题。同时在 Mesh 对外客户输出同样有高质量的保障。

本文结合蚂蚁金服 Mesh 化落地质量保障落地的思考，给大家带来如下三个方面的一些质量保障的分享：

- Mesh 化质量保障体系；
- Mesh 化测试技术；
- Mesh 化双十一大规模落地的性能保障；

## 质量保障体系

首先给大家介绍下我们的质量保障体系。

![测试保障体系](https://cdn.nlark.com/yuque/0/2020/png/226702/1578910155182-f7a5ced8-dc9a-4027-86ee-202dbee140ea.png)

测试保障体系

我们从测试环境、测试用例、基础功能测试原子镜像能力、测试工具平台、测试场景组合调度、测试方案制定、线上巡检监控、灰度发布三板斧、交付验证、性能、自动化测试等多个方面进行系统性测试保障。通过内外部的质量数据度量和双十一大促来检阅我们的质量能力。

## Mesh 测试技术

在开始介绍测试技术之前，我们先了解一下什么是 Service Mesh 以及 Service Mesh 是如何工作的，在蚂蚁金服的技术架构中是以什么形式存在，发挥着怎样的作用。

简单的说 Service Mesh 存在两个面，一个面叫数据面（比如 MOSN），就是处理应用数据请求的一个独立代理模块，脱离于应用，为应用提供请求代理及一些复杂通信逻辑处理，另外一个叫控制面（比如 SOFAMesh），管理应用配置及业务规则等（比如业务开关/服务路由规则），通过下发配置“指挥”数据面去执行，满足不同阶段实现不同的业务支持。

![Mesh 框架简图](https://cdn.nlark.com/yuque/0/2020/png/226702/1578910155197-c2b5cd47-1571-436f-9924-9c3cdd19bbc6.png)

Mesh 框架简图

我们先简单介绍下经典微服务请求路由。

![经典微服务模式请求路由](https://cdn.nlark.com/yuque/0/2020/png/226702/1578910155188-3ce12227-c60b-48a2-aa73-5f6db42ac017.png)

经典微服务模式请求路由

经典微服务模式下 Docker 镜像化服务在一个 Pod 一般只有一个业务应用容器在运行，这种情况下测试框架只要关心业务应用即可。

![经典微服务测试架构](https://cdn.nlark.com/yuque/0/2020/png/226702/1578910155217-eaaafa81-e997-49b6-844a-ba366920618b.png)

经典微服务测试架构

### Mesh 测试架构改进

Mesh 测试架构在经典微服务测试架构上也做了新的演进。MOSN 作为 Sidecar 与业务容器共存在一个 Pod，资源与业务应用容器共享，每个业务逻辑都需要通过 MOSN 去处理，因而只关心业务应用肯定不够，需要再扩展支持到 MOSN 这类 Sidecar 的测试验证。在 MOSN 中集成了控制面 xds client，与控制面 pilot 建立通信，用于接收 pilot 下发的配置信息。在蚂蚁金服技术架构存在三地五中心/同城双活等容灾能力，因而产生了 LDC，一个集群多个 zone 情况，控制面 pilot下发是可以配置集群+zone+应用+ip 组合粒度，要验证这个多 zone 下发规则准确性，那就需要创建多个 xds client（或者 MOSN）。另外 Sidecar 是不能直接访问的，通过测试应用暴露出接口，给上层测试。

![Mesh 化测试架构](https://cdn.nlark.com/yuque/0/2020/png/226702/1578910155186-3df6c3a5-d50b-4433-afef-8391e84a54a3.png)

Mesh 化测试架构

### 构建高仿真测试环境

那么，我们测试环境要做到足够仿真，面临哪些挑战呢？首先看下我们自研的 MOSN 具备的能力和技术复杂性。

![ MOSN 能力大图](https://cdn.nlark.com/yuque/0/2020/png/226702/1578910155201-4417c52f-0858-4c4c-a8b2-e2b064cc1978.png)

 MOSN 能力大图

应对 MOSN 测试场景复杂性，我们搭建了一套高仿真测试环境，这里以 MOSN 中的 RPC 功能为例，阐述这套环境的构成要素及环境部署架构。

![集成测试环境构成要素](https://cdn.nlark.com/yuque/0/2020/png/226702/1580709153122-933ae3f6-2105-4064-884d-73a5a6fbb0ad.png)

集成测试环境构成要素

这里可以举一个 RPC 路由的例子来详细讲述。我们知道，业务在做跨 IDC 路由时，主要通过跨域 VIP 实现，这就需要业务在自己的代码中设置 VIP 地址，例如：

```go
     <sofa:reference interface="com.alipay.APPNAME.facade.SampleService" id="sampleRpcService">
        <sofa:binding.tr>
            <sofa:vip url="APPNAME-pool.zone.alipay.net:12200"/>
        </sofa:binding.tr>
     </sofa:reference>
```

这时候假如业务配置了不合法的 URL，如：

```go
    <sofa:reference interface="com.alipay.APPNAME.facade.SampleService" id="sampleRpcService">
        <sofa:binding.tr>
            <sofa:vip url="http://APPNAME-pool.zone.alipay.net:12200?_TIMEOUT=3000"/>
        </sofa:binding.tr>
    </sofa:reference>
```

上述 VIP URL 指定了 12200 端口，却又同时指定了 http，这种配置是不合法的，就会出现问题，这时候测试环境就需要跨 zone、跨  LDC 的测试环境。我们在多数复杂产品测试里都会遇到，极度复杂测试场景无法 100% 分析充分。一般对于这种场景，我们可以借助于线上流量回放的能力，将线上的真实流量复制到线下，作为我们测试场景的补充。这也需要非常仿真的测试环境做 MOSN 的流量回放支撑。

### 兼容性测试

![MOSN 兼容性验证](https://cdn.nlark.com/yuque/0/2020/png/226702/1580709153098-54637945-923a-4670-8e8c-a343c7dd29df.png)

MOSN 兼容性验证

我们通过一个例子来详细阐述：老版本的 RPC 中我们支持 TR 协议，后续的新版支持 BOLT 协议，应用升级过程中，存在同时提供 TR 协议和 BOLT 协议服务的情况，如下图：

![应用升级过程中，相同接口提供不同协议的服务](https://cdn.nlark.com/yuque/0/2020/png/226702/1578910155241-0e064778-e37c-440b-8d3a-7039ad2b3bb3.png)

应用升级过程中，相同接口提供不同协议的服务

首先，应用向 MOSN 发布服务订阅的请求，MOSN 向配置中心订阅，配置中心返回给 MOSN 两个地址，分别支持 TR 和 BOLT，MOSN 从两个地址中选出一个返回给应用 APP。

这里兼容性风险是：MOSN 返回给 APP 的地址是直接取配置中心返回的第一条数据，这里可能是 TR 也可能是 BOLT。

如果 MOSN 返回给应用的地址是支持 BOLT 协议的服务端，那么后续应用发起服调用时，会直接以 BOLT 协议请求 MOSN，MOSN 选址时，会以轮询的方式两个服务提供方，如果调用到 Server1，就会出现协议不支持的报错。
因此我们针对各种兼容性具体场景都要做好分析和相应的测试。

### MOSN 的鲁棒测试（稳定性、健壮性）

从 MOSN 的视角来看，其外部依赖如下：

![MOSN 外部依赖图](https://cdn.nlark.com/yuque/0/2020/png/226702/1580813967171-d1a2985a-e158-4e9e-8148-69191b383a2e.png)

MOSN 外部依赖图

除了验证 MOSN 自身的功能外，我们还通过故障注入的方式，对 MOSN 的外部依赖做了专项测试。通过这种方式，我们发现了一些上述功能测试未覆盖的场景，这里以应用和 MOSN 之间的 12199 端口举例。

应用 APP 接入 MOSN 后，原先应用对外提供的 12200 端口改由 MOSN 去监听，应用的端口修改为 12199，MOSN 会向应用的 12199 端口发送心跳，检测应用是否存活。

如果应用运行过程中出现问题，MOSN 可以通过心跳的方式及时感知到。

![MOSN 与 APP 心跳断连处理示意图](https://cdn.nlark.com/yuque/0/2020/png/226702/1578910155241-f699cadb-9375-4d86-8937-c0b6689b8d41.png)

MOSN 与 APP 心跳断连处理示意图

如图所示，如果 MOSN 感知到心跳异常后，会向配置中心取消服务注册，同时关闭对外提供的 12200 端口服务。这样做的目的是防止服务端出现问题后，仍收到客户端的服务调用，导致请求失败。

测试该场景，我们通过自动化故障注入系统 drop 掉 APP 返回给 MOSN 的响应数据，人为制造应用 APP 异常的场景。通过这种方式，自动对比期望结果，判断是否异常，后自动进行故障恢复，继续下一个故障注入测试。

## Service Mesh 双十一大规模落地的性能保障

Mesh 在落地过程中首先遇到的问题就是，蚂蚁金服如此大体量下，如何不出性能问题。MOSN 从能力上集成了中间件多种能力，因此线下压测比较复杂，在线上全链路压测开始之前，线下我们基于中间件的压测能力做了一轮自身的压测，上线后从业务角度再做全链路压测，问题就会少很多，蚂蚁全链路压测部分，是非常成熟的技术，各种材料也介绍过多次，相信大家都已经非常熟悉。蚂蚁金服中间件线下压测部分介绍比较少，因此我总结归纳给大家介绍下，如下图：

![蚂蚁金服中间件线下压测](https://cdn.nlark.com/yuque/0/2020/png/226702/1578910155281-14e906a2-46e0-442e-8757-bc10a6c69fb0.png)

举个控制面 gc 压测分析的例子：

CRD 下发能力是控制面核心，加密通信也是基于 CRD 下发开关触发，而下发的关键性能点在于以下几个因素：

- pilot 支持的 client 并发数；
- 另外对配置下发实时性比较高，因而配置下发到 client 的耗时也是重要指标；

在压测过程中，没有足够资源来创建那么多 xds client，因而开发了 mock client（简化版 xds client），只保留核心通信模块，单 pod 可以支持万级的 client 模拟。在持续压测一段时间，我们发现内存频繁在 GC，导致耗时很高，pprof 分析内存。

![控制面 gc 压测分析](https://cdn.nlark.com/yuque/0/2020/png/226702/1578910155273-67ea90ff-7118-4da6-b0cb-2675e7ec726f.png)

MessageToStruct  和 FromJsonMap 最占内存，都是在对数据进行转换，MessageToStruct 之前有过同类优化，因此很快解决，但是 CRD 数据转换的核心 FromJsonMap，需要将数据转成 K8s 能识别的 yaml 信息。我们进行了改造，将一部分内存进行重用，并优化转换函数，耗时下降了好几倍，降到了毫秒级别。

## 总结

本文分享了 MOSN 落地过程中，我们的测试开发技术。Service Mesh 在蚂蚁金服还将持续演进，我们的质量防控体系还需持续建设，我们面临的挑战还很大。热烈欢迎有兴趣的同学加入蚂蚁金服中间件质量团队。

**关于作者：**

- 张伟（花名：柑橘） 蚂蚁金服中间件质量团队负责人，关注领域：中间件测试开发技术。
- 王斌（花名：西经）蚂蚁金服 Service Mesh 质量主要负责人，主要 Focus 领域：MOSN。
- 吕超才（花名：柏翘）蚂蚁金服 Service Mesh 控制面质量负责人，主要 Focus 领域：SOFAMesh。

## 蚂蚁金服 Service Mesh 大规模落地系列文章

- [蚂蚁金服 Service Mesh 大规模落地系列 - 控制面篇](/blog/service-mesh-practice-in-production-at-ant-financial-part7-control-plane/)
- [蚂蚁金服 Service Mesh 大规模落地系列 - Operator 篇](/blog/service-mesh-practice-in-production-at-ant-financial-part6-operator/)
- [蚂蚁金服 Service Mesh 大规模落地系列 - 网关篇](/blog/service-mesh-practice-in-production-at-ant-financial-part5-gateway/)
- [蚂蚁金服 Service Mesh 大规模落地系列 - RPC 篇](/blog/service-mesh-practice-in-production-at-ant-financial-part4-rpc/)
- [蚂蚁金服 Service Mesh 大规模落地系列 - 运维篇](/blog/service-mesh-practice-in-production-at-ant-financial-part3-operation/)
- [蚂蚁金服 Service Mesh 大规模落地系列 - 消息篇](/blog/service-mesh-practice-in-production-at-ant-financial-part2-mesh/)
- [蚂蚁金服 Service Mesh 大规模落地系列 - 核心篇](/blog/service-mesh-practice-in-production-at-ant-financial-part1-core/)
- [Service Mesh 落地负责人亲述：蚂蚁金服双十一四大考题](/blog/service-mesh-practice-antfinal-shopping-festival-big-exam/)
