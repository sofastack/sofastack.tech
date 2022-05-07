---
title: "【2022 开源之夏】欢迎报名 SOFAStack 社区和 MOSN 社区项目！"
authorlink: "https://github.com/sofastack"
description: "【2022 开源之夏】欢迎报名 SOFAStack 社区和 MOSN 社区项目！"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2022-05-07 T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*lboCQplrH-IAAAAAAAAAAAAAARQnAQ"
---

开源之夏是由“开源软件供应链点亮计划”发起并长期支持的一项暑期开源活动，旨在鼓励在校学生积极参与开源软件的开发维护，促进优秀开源软件社区的蓬勃发展，培养和发掘更多优秀的开发者。

活动联合国内外各大开源社区，针对重要开源软件的开发与维护提供项目任务，并面向全球高校学生开放报名。

![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*w1DUTLCCnzkAAAAAAAAAAAAAARQnAQ)

2022 年，SOFAStack 和 MOSN 社区再次加入中国科学院软件研究所的高校开源活动——“开源之夏 2022”，为大家准备了六个任务，涉及 Cloud Native、Micro Service、Distributed System、Kubernetes、Container 等多个领域。

## 活动规则

进入：[https://summer-ospp.ac.cn/#/homepage](https://summer-ospp.ac.cn/#/homepage)

各位同学可以自由选择项目，与社区导师沟通实现方案并撰写项目计划书。被选中的学生将在社区导师指导下，按计划完成开发工作，并将成果贡献给社区。社区评估学生的完成度，主办方根据评估结果发放资助金额给学生。

## 项目任务

**1.SOFARegistry 客户端负载均衡**

SOFARegistry 的客户端目前采用长连接与其中一台 Session 相连，随后会用这根链接注册和订阅服务，在注册中心进行运维期间，客户端会断链重连到别的机器上，经过一轮滚动升级，就会造成 Session 上链接分布的不均衡，一是数据不均衡，二是推送压力不均衡，严重的时候会造成单机热点，影响推送的效率。

由于长连接快速检测节点宕机的机制，主动断链会造成节点数据下线，因此客户端链接的稳定性也是一个很重要的考虑。

对服务发现来说，发布和订阅对链接稳定性的要求不同：

- 对发布，链接断开会造成服务数据下线

- 对订阅，会造成轻微的数据推送延迟，延迟时间通常是重连间隔

项目社区导师：dzdx[dzidaxie@gmail.com](dzidaxie@gmail.com)

**2.增强 layotto-java-sdk 和 layotto-spring-boot**

项目编号：2295a0213

任务难度：基础/Basic

1.增强 Layotto 的 java-sdk 的功能，使其与 go-sdk 对齐。现在的 java-sdk 有 file、lock、pubsub、sequencer、state 的 API，缺少 secret、config 等 API。

2. 完善 layotto-sdk-springboot, 将 Layotto 的更多功能集成进 spring-boot。layotto-sdk-springboot 的设计目标是帮助 spring-boot 的用户低成本接入 Layotto，比如用户在代码中添加一个 Java 注解后，就能方便的进行消息监听、收到新消息后自动调用方法。

3. 在 layotto-sdk-springboot 的基础上，开发 layotto-sdk-sofaboot, 方便 SOFABoot 用户使用 Layotto。

项目社区导师：张立斌[1098294815@qq.com](1098294815@qq.com)

**3.Layotto 中实现 ceph 文件系统，同时打通 SOFABoot**

项目编号：2295a0214

任务难度：基础/Basic

用 ceph 实现 Layotto 的 file API 组件，并通过 SOFABoot 调通。

- 首先熟悉 Layotto 的架构设计，基于现在的 file 接口实现 ceph 文件系统。（此处需要调研 Layotto 的 file 组件的可移植性以及 ceph 文件系统，判断当前的 Layotto 接口能否满足 ceph 文件系统）

- 通过 SOFABoot 和 Layotto 打通，可以通过 SOFABoot 应用调通 Layotto 的 file 接口。

项目社区导师：wenxuwan[wangwx_junction@163.com](wangwx_junction@163.com)

**4.SOFATracer upgrade opentracing api version & adapter opentelemetry api.**

项目编号：2295a0196 

任务难度：进阶/Advanced

Currently, sofa-tracer relies on the openTracing version 0.22.0. This version has been out of date for a long time and we need to update to the official recommended stable version. In addition, we need to provide an API layer to accommodate OpentElemetry.

Tasks:

1、upgrade opentracing version torelease-0.33.0

2、adapter [https://opentelemetry.io/docs/migration/opentracing/](https://opentelemetry.io/docs/migration/opentracing/)

3、provide intergration doc and guides

项目社区导师：卫恒（宋国磊）[glmapper_2018@163.com](glmapper_2018@163.com)

**5.为 MOSN 适配社区 Proxy-Wasm v2 开源规范**

项目编号：22f080190

任务难度：进阶/Advanced

WebAssembly(Wasm) 是近几年从 Web 领域诞生，并快速出圈的一项虚拟机指令格式，是一种可移植的、语言无关并兼容 Web 的全新格式，支持在浏览器和非 Web 环境运行不同语言编写的应用程序。

MOSN 是一款主要使用 Go 语言开发的网络代理 (类似 Envoy、Nginx)，融合了大量云原生通用插件，为服务提供了多协议、模块化、智能化、安全的代理能力。

如何为这些插件提供一个安全隔离的运行环境，甚至支持不同语言编写的插件，成为了一个非常具有挑战性的课题。Wasm 技术和 Proxy-Wasm 规范的诞生为解决上述问题提供了一种全新的思路。

本题目将基于 MOSN 中已有的 Wasm 框架，适配开源社区专门为网络代理场景提出的 Proxy-Wasm v2 规范，使 MOSN 具备运行符合 v2 规范的 Wasm 插件的能力。

项目社区导师：叶永杰[yongjie.yyj@antgroup.com](yongjie.yyj@antgroup.com)

**6.Layotto 集成 Istio**

项目编号：22f080198

任务难度：进阶/Advanced

1.Istio 是 ServiceMesh 方向上一个非常火热的解决方案，默认使用 envoy 作为数据面。

2. MOSN 作为一个对标 envoy 的另一种数据面实现，也可以跟 Istio 集成，作为 envoy 的一种替代方案。

3. Layotto 作为 Application Runtime 的一种实现，基于 MOSN 开发，期望可以结合 Service Mesh 跟 Application Runtime 两种思想。

既然 Istio 可以集成 MOSN ，且 Layotto 跟 MOSN 是一体的，因此本次的任务是把 Layotto 作为数据面跟 Istio 进行集成，以服务调用为例，在应用通过 Layotto 的 invokeService API 去调用目标服务时可以直接复用 Istio 强大的治理能力，比如流量控制、故障注入等等。

Layotto 之前就已经可以跟 Istio 1.5.x 集成，由于落后当时的 Istio 版本太多，最终没有合并到主干，本次任务希望可以集成 1.10.x 之后的Istio。

项目社区导师：marco[gujin.mzj@antgroup.com](gujin.mzj@antgroup.com)

### 申请资格

- 年满 18 周岁在校学生

- 暑期即将毕业的学生:申请时学生证处在有效期内

- 海外学生:提供录取通知书、学生卡、在读证明等文件

### 活动流程

![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*I-1FT4ifgJIAAAAAAAAAAAAAARQnAQ)

![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*Dc30R4il5BsAAAAAAAAAAAAAARQnAQ)

微信扫码备注“开源之夏”进群交流

与导师沟通时间：4.21-5.20

>![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*8G5NRZ7UEToAAAAAAAAAAAAAARQnAQ)
