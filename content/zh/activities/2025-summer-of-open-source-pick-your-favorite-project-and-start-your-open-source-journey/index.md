---
title: "2025 开源之夏 | 快来 Pick 你心仪的项目，开启你的开源之旅吧！"
authorlink: "https://github.com/sofastack"
description: "这个暑期，SOFAStack 和 MOSN 社区再度启航开源之夏，4 个项目任务已发布，就等热爱开源的你加入！"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2025-06-03T15:00:00+08:00
cover: "https://img.alicdn.com/imgextra/i4/O1CN01NfNoIO1O4fMW6dwfg_!!6000000001652-2-tps-900-383.png"
---

# 2025 开源之夏 | 快来 Pick 你心仪的项目，开启你的开源之旅吧！

🌊这个暑期，SOFAStack 和 MOSN 社区再度启航开源之夏，4 个项目任务已发布，就等热爱开源的你加入！

## 一、活动介绍

开源之夏是由中国科学院软件研究所“开源软件供应链点亮计划”发起并长期支持的一项暑期开源活动，旨在鼓励在校学生积极参与开源软件的开发维护，培养和发掘更多优秀的开发者，促进优秀开源软件社区的蓬勃发展，助力开源软件供应链建设。

在开源之夏的活动中，学生们能够利用暑期时间参与到开源项目的建设，​**提高个人技术能力**​、​**了解开源**​、​**结识行业前辈**​。此外，对于成功入选并完成结项的同学，还有​**价值丰厚的现金奖励与荣誉证书**​！

## 二、社区介绍

本次开源之夏，将有 Koupleless、SOFARPC 及 MOSN 社区为大家发布任务。

期待各位同学踊跃参与共建🧐

### Koupleless

随着各行各业的信息化数字化转型，企业面临越来越多的研发效率、协作效率、资源成本和服务治理痛点，Koupleless 就是为解决这些痛点而生。

Koupleless 是一种模块化应用架构，相较于微服务架构的应用拆分方式，Koupleless 将传统应用同时进行纵向和横向切分，实现业务开发者资源无感，轻松独立维护，让传统应用以较低成本演进并享受到 Serverless 研发模式好处，包括快速构建、秒级部署、秒级调度伸缩等能力，为用户提供极致的研发运维体验，最终帮助企业实现倍级降本增效。

GitHub 地址：*https://github.com/koupleless/koupleless*

### SOFARPC

SOFARPC 是由蚂蚁集团开源的一款 Java RPC 框架，具有高可扩展性、高性能和生产级特性。该框架旨在简化应用之间的 RPC 调用，并为应用提供便捷透明、稳定高效的点对点远程服务调用方案。为方便用户和开发者进行功能扩展，SOFARPC 提供了丰富的模型抽象和可扩展接口，包括过滤器、路由、负载均衡等。

GitHub 地址：*https://github.com/sofastack/sofa-rpc*

### MOSN

MOSN*​（Modular Open Smart Network）​*是一款主要使用 Go 语言开发的云原生网络代理平台，由蚂蚁集团开源并经过双 11 大促几十万容器的生产级验证。 MOSN 为服务提供多协议、模块化、智能化、安全的代理能力，融合了大量云原生通用组件，同时也可以集成 Envoy 作为网络库，具备高性能、易扩展的特点。 MOSN 可以和 Istio 集成构建 Service Mesh，也可以作为独立的四、七层负载均衡，API Gateway、云原生 Ingress 等使用。 在 AI 大模型浪潮中，MOSN 社区也在积极打造 AI Gateway 产品，提供 AI 推理场景的流量管控，提升集群级别的资源利用率。

GitHub 地址：*https://github.com/mosn*

## 三、项目介绍

Koupleless、SOFARPC、MOSN 社区为同学们准备了 **4** 个项目。成功结项的同学将获得 **¥8000-12000 的奖金**与​**荣誉证书**​。

### SOFAStack 社区

#### Koupleless 模块运维调度链路增加心跳 Revision 版本控制

👨🏻‍🎓导师：​徐恩昊（冬喃）

📮导师邮箱：xuenhao.xeh@antgroup.com

👾任务难度：进阶难度

🗂️技术领域：Kubernetes、Spring Boot

Module-Controller 是 Koupleless 的运维调度核心组件，采用 Virtual-Kubelet 将基座进程映射成 K8s Node，模块实例映射成 K8s Pod，达到直接复用 K8s 完成模块安装、调度、扩缩容等能力，极大地降低企业内建设模块运维调度能力的成本，帮助更加平滑地往 Serverless 演进。然而，由于当前模块 Pod 实例缺乏 Revision 版本控制机制，在并发操作场景下易引发模块状态与预期不一致、出现非必要状态跳变等问题，导致模块实例运维调度异常。这一缺陷使得 ModuleController 组件难以在生产环境实现规模化应用，比如模块 Pod 替换时可能引发 JVM 进程内模块实例丢失。为此，亟需构建基于心跳机制的 Revision 版本控制，修正模块运维调度链路。

项目介绍视频：https://www.bilibili.com/video/BV1ea5kzaEJ1/?share\_source=copy\_web&vd\_source=802e089175dbc2ea677914f78683b18a

#### SOFARPC 超时控制支持 Deadline 机制

👨🏻‍🎓导师：：刘建军(EvenLiu)

📮导师邮箱：evenljj@163.com

👾任务难度：基础难度

🗂️技术领域：Spring Cloud

SOFARPC 支持为服务调用指定 timeout 时间，从而避免无限等待响应结果导致资源占用。在一个比较长的 RPC 链路中，每个链路单独设置超时时间，可以确保整个链路都能够执行下去。但是在有些场景下，最上层链路超时，后续的链路其实没必要继续执行。Deadline 机制就是为了解决这个问题，通过在调用链路中透传 Deadline，Deadline 消耗殆尽后，调用链路中其他尚未执行的任务将被取消。

项目介绍视频：https://www.bilibili.com/video/BV1Va5kzaECG/?share\_source=copy\_web&vd\_source=802e089175dbc2ea677914f78683b18a

### MOSN 社区

#### 为 HTNN 增加 AI 内容安全插件

👨🏻‍🎓导师：罗泽轩（沐辕）

📮导师邮箱：spacewanderlzx@gmail.com

👾任务难度：基础难度

🗂️技术领域：HTTP、LLM

HTNN（https://github.com/mosn/htnn）是一款基于 Envoy&Go 开发的 AI 网关。我们希望为这个网关增加一个 AI 内容安全插件。AI 内容安全插件是一种基于人工智能（AI）技术的工具，用于实时检测、过滤和管理数字化平台上的违规或有害内容。它通过机器学习等技术，自动识别敏感、违法或低俗内容，帮助企业或平台高效维护内容安全，降低法律风险，提升用户体验。这个插件只需要满足基本要求，即解析出请求内容​（如 OpenAI chat 接口中的 Prompt），调用第三方平台进行安全检测即可。

项目介绍视频：https://www.bilibili.com/video/BV1ea5kzaEtm/?share\_source=copy\_web&vd\_source=802e089175dbc2ea677914f78683b18a

#### 为 HTNN 增加 Token 智能限流能力

👨🏻‍🎓导师：王士猛（士猛）

📮导师邮箱：wangshimeng.wsm@antgroup.com

👾任务难度：基础难度

🗂️技术领域：HTTP、LLM、AI

HTNN 当前已具备传统的 QPS 限流与服务降级能力。为了更好地支持 LLM（大语言模型）的推理场景，亟需引入基于 Token 维度的智能限流能力。该功能将允许针对 AI API 进行基于特定键值的 Token 限流配置，而键值的来源可以灵活地从 URL 参数、HTTP 请求头、客户端 IP、消费者名称或者 Cookie 中的 Key 提取。通过细粒度的 Token 限流，能够有效提升下游 LLM 服务及整体业务的稳健性，同时对于被限流的请求可返回更具人性化的响应提示。此外，还支持基于预测的输出 Token 限流能力，专用于控制生成式 AI 模型的输出长度或频率，从而避免因资源过载导致系统不稳定，为整体资源保护与业务运行质量提供保障。

项目介绍视频：https://www.bilibili.com/video/BV1Va5kzaEZC/?share\_source=copy\_web&vd\_source=802e089175dbc2ea677914f78683b18a

## 四、 项目申报

🕤**报名时间**

**2025 年 05 月 09 日 - 2025 年 06 月 09 日**

📜流程事项学生挑选项目，与导师沟通并准备​**项目申请材料**​、提交项目申请。

📌注意事项学生报名与项目申请书提交截止时间为 ​**2025 年 06 月 09 日 18:00 UTC+8**​，请务必注意时间节点，千万不要错过哦！

📮对上述 Koupleless、SOFARPC、MOSN 项目感兴趣的同学，欢迎大家通过邮箱直接联系自己心仪项目的导师。

*👋🏼也可以扫码添加 SOFA 小编，一起开启我们的开源之夏！*

![图片](https://img.alicdn.com/imgextra/i3/O1CN01sOJzLN1ucA20X1Y3C_!!6000000006057-0-tps-1080-930.jpg)

期待在 SOFAStack、MOSN 社区与优秀的你相遇！

项目申请入口：https://summer-ospp.ac.cn/org/orglist

👆搜索 SOFAStack/MOSN，即可查看/报名 Koupleless、SOFARPC 及 MOSN 社区发布的项目任务！

