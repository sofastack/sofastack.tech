---
title: "【开源之夏 2023】欢迎报名 MOSN 社区项目！"
authorlink: "https://github.com/sofastack"
description: "【开源之夏 2023】欢迎报名 MOSN 社区项目！"
categories: "开源之夏"
tags: ["开源之夏"]
date: 2023-05-09T15:00:00+08:00
cover: "https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*NipNSYsjl6sAAAAAAAAAAAAADrGAAQ/original"
---

![图片](https://mmbiz.qpic.cn/mmbiz_gif/nibOZpaQKw09ARcsGuzib3ttcN4LZpdAC0n9KTQp7uibF8ia0ibk3Olf3sib50ExibicicOrzCOVrOyUD2dFib84f0fTx5uA/640?wx_fmt=gif&wxfrom=5&wx_lazy=1)

开源之夏是由“开源软件供应链点亮计划”发起并长期支持的一项暑期开源活动，旨在鼓励在校学生积极参与开源软件的开发维护，促进优秀开源软件社区的蓬勃发展，培养和发掘更多优秀的开发者。

活动联合国内外各大开源社区，针对重要开源软件的开发与维护提供项目任务，并面向全球高校学生开放报名。

2023 年，**MOSN 社区**再次加入中国科学院软件研究所的高校开源活动——**“开源之夏 2023”**，为大家准备了三个任务，涉及 Go、HTTP、Security、Software-Defined Networking、Container 等多个领域。

**MOSN 项目介绍**

MOSN*（Modular Open Smart Network）*是一款基于 Go 语言开发的云原生网络代理平台，由蚂蚁集团开源并在双 11 大促期间经过几十万容器的生产级验证。MOSN 为服务提供多协议、模块化、智能化、安全的代理能力，融合了大量云原生通用组件，同时也可以集成 Envoy 作为网络库，具备高性能、易扩展的特点。另外，MOSN 可以集成 Istio 构建 Service Mesh，也可以作为独立的四、七层负载均衡，API Gateway、云原生 Ingress 等使用。

**Layotto 项目介绍**

Layotto*（/leɪˈɒtəʊ/）* 是一款使用 Golang 开发的应用运行时, 旨在帮助开发人员快速构建云原生应用，帮助应用和基础设施解耦。它为应用提供了各种分布式能力，例如状态管理、配置管理、事件发布订阅等，以简化应用的开发。

**活动规则**

开源之夏官网：

[*https://summer-ospp.ac.cn/*](https://summer-ospp.ac.cn/)

各位同学可以自由选择项目，与社区导师沟通实现方案并撰写项目计划书。被选中的学生将在社区导师指导下，按计划完成开发工作，并将成果贡献给社区。社区评估学生的完成度，主办方根据评估结果发放资助金额给学生。

![图片](https://mmbiz.qpic.cn/mmbiz_png/nibOZpaQKw09bj5N6hwCP9lGYXTf5IrnKV6NHiaiapNDshic0hogpbAEO4oaK5F6Ufx8F6KNf6zRicQTT42I2xvvQeQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

**MOSN 社区项目**

项目链接：[*https://summer-ospp.ac.cn/org/orgdetail/f0813e66-fa19-4302-a3e3-e6f2d210c83d?lang=zh*](https://summer-ospp.ac.cn/org/orgdetail/f0813e66-fa19-4302-a3e3-e6f2d210c83d?lang=zh)

 **MOSN** 

Go、HTTP、Security

**项目社区导师：罗泽轩**

spacewanderlzx@gmail.com

**基于 Coraza 和 MOSN on Envoy 开发 Envoy 的 WAF 插件**

**项目编号：23f080212**

**项目难度：进阶/Advanced**

Coraza 是一个用 Go 实现的 WAF 引擎，我们希望能够借助 MOSN on Envoy 的能力，让 Coraza 运行在 Envoy 当中，并与官方的基于 Wasm 的实现*（[https://github.com/corazawaf/coraza-proxy-wasm](https://github.com/corazawaf/coraza-proxy-wasm)）*进行比较。

- 实现一个基本可用的 WAF 插件*（需要有详尽的文档+测试）*，并与 Wasm 版本做对比，输出一份比较报告。
- 了解 MOSN、Envoy 和 WAF，能够用 Go 写代码。

 **MOSN** 

Go、Software-Defined Networking

**项目社区导师：纪卓志**

jizhuozhi.george@gmail.com

**为 Envoy Go 扩展建设插件市场**

**项目编号：23f080259**

**项目难度：进阶/Advanced**

Envoy 是当前最流行的网络代理之一，Go 扩展是 MOSN 社区为 Envoy 增加的 Go 生态基础，也是 MOSN 社区 MoE 框架的基础。

受益于 Golang 生态系统，研发可以轻松在 Envoy 实现插件用于更多的长尾场景，其中很多场景都是通用的。

本项目是为 Envoy Go 扩展构建插件市场。在插件市场中，人们可以在插件市场中分享插件，选用已经存在的插件。通过插件市场，可以让 Envoy、MoE 生态变得更加开放、共享、丰富。

- 提供一个 Envoy Go 插件的内容平台，在这里可以发布经过社区 Review 的优秀插件，需要拥有服务端与前端页面。

- 不自建账号体系，通过 GitHub OAuth2.0 完成用户认证与授权。

- 进阶——对接 GitHub OpenAPI，支持动态获取插件所在仓库信息，包括 README、分支版本以及 Star 数。

- 能够使用 Go 语言*（框架不限）*开发出带前端页面的小型站点。

- 对认证与授权及 OAuth2.0 有基本的了解。

- 熟悉 Git 和 GitHub 工作流程*（分支、版本、合并请求等）*。

 **Layotto** 

Go、gRPC

**项目社区导师：wenxuwan**

wangwenxue.wwx@antgroup.com

**Layotto Support Pluggable Components**

**项目编号：23f080194**

**项目难度：进阶/Advanced**

当前 Layotto 的 Components 都是实现在 Layotto 的工程里面的。用户若要想使用新的 Component，就必须使用 Golang 语言开发，同时必须在 Layotto 工程中实现，然后统一编译。对于多语言用户来说非常不友好，因此 Layotto 需要提供 Pluggable Components 的能力，允许用户可以通过任何语言实现自己的 Components，Layotto 通过 gRPC 协议和外部的 Components 进行通信。

- 完成 Pluggable Components 框架设计。

- 提供 Pluggable Components 接入文档和示例。

- 熟悉 Golang 和 gRPC，熟悉 Dapr 和 Layotto 运行时架构。

![图片](https://mmbiz.qpic.cn/mmbiz_jpg/nibOZpaQKw0ibXeSMws9mUg6S8htuWqabON0mTZQFZuyHUgtwLYvgfayrD16XuEb4qfW26PNUx4snOPBNDHQLhtg/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)

**申请资格**

- 本活动面向年满 18 周岁在校学生。

- 暑期即将毕业的学生，只要在申请时学生证处在有效期内，就可以提交申请。

- 中国籍学生参与活动需提供身份证、学生证、教育部学籍在线验证报告（学信网）或在读证明。

- 外籍学生参与活动需提供护照，同时提供录取通知书、学生卡、在读证明等文件用于证明学生身份。

**活动流程**

![图片](https://mmbiz.qpic.cn/mmbiz_png/nibOZpaQKw0ibwuN3KvIWibDrrepiazQ7q4Cukibib96HSF6iawBYTapDs1omndGFTByo4fqibpxbGgia2UDBWK3F2DmicrA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

![图片](https://mmbiz.qpic.cn/mmbiz_jpg/nibOZpaQKw09bj5N6hwCP9lGYXTf5IrnK7OAAecFdVPJpVSA1FcoPyIldjpmh7qrpQfwavibrMLBENSEBd2gbD1w/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)

添加 SOFAGirl 微信

备注“开源之夏”进群交流
