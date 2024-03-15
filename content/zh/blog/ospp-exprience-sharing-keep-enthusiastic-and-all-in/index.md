---
title: "开源之夏经验分享｜Layotto 社区 陈亦昺：保持热情、全力以赴！"
authorlink: "https://github.com/sofastack"
description: "开源之夏经验分享｜Layotto 社区 陈亦昺：保持热情、全力以赴！"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2023-11-21T15:00:00+08:00
cover: "https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*ddoFRafqrvkAAAAAAAAAAAAADrGAAQ/original"
---

今天 SOFAStack 邀请到了开源之夏 2023 Layotto 社区的中选学生陈亦昺同学！在本项目中，他负责可插拔式组件的开发。希望他分享的这段经历，能让更多人了解到 Layotto 开源社区，感受开源的魅力～

项目链接：[https://summer-ospp.ac.cn/org/prodetail/23f080194?list=org&navpage=org](https://summer-ospp.ac.cn/org/prodetail/23f080194?list=org&navpage=org)

## 项目名称

Layotto support pluggable components

## 项目导师

王文学

## 项目背景描述

Layotto 是一款基于云原生的应用运行时，旨在帮助开发人员快速构建云原生应用，帮助应用和基础设施解耦。它为应用提供了各种分布式能力，比如状态管理、配置管理、事件发布订阅等能力，以简化应用的开发。同时，它以 MOSN 项目为底座，在提供分布式能力以外，还提供了 Service Mesh 的流量管控能力。

Layotto 对用户程序暴露 API，用户程序可以通过 API 调度对应的运行时服务。例如 Layotto 支持 config 服务，其内部会使用含有各种 component (如 Nacos，Apollo，Etcd 等) 的 SDK 来提供 config API 能力。

当前 Layotto 的 component 都是实现在 Layotto 的工程里面的。这也就使得用户在想要使用新的 component 时，必须使用 Golang 语言开发，同时必须在 Layotto 工程中实现，再进行统一编译。这种体验对于多语言用户来说非常不友好。

因此 Layotto 需要提供 pluggable components 的能力，允许用户通过任何语言实现自己的 component，而 Layotto 则通过 gRPC 协议和外部的 component 进行通信。

## 项目实现思路

### 方案

- 基于 UDS（Unix Domain Socket）实现本地跨语言组件服务发现，降低通信开销。

- 基于 proto 实现组件跨语言实现能力。

### 数据流架构

![img](https://mmbiz.qpic.cn/sz_mmbiz_png/nibOZpaQKw0ib863eTavUxtwJh1kWmMNjU6Q6WJRAJ8QJPibl9OVkE9WlMGaglBmLD7Sk9tztl343mBYRuwvkfmjg/640?wx_fmt=png&from=appmsg&wxfrom=5&wx_lazy=1&wx_co=1)

### 组件发现

![img](https://mmbiz.qpic.cn/sz_mmbiz_png/nibOZpaQKw0ib863eTavUxtwJh1kWmMNjUMkEvj2Z8aIqVicIeQf8YBmBvtFfhtGEX7A3jrfs9wEMNxmTaTicnzAvA/640?wx_fmt=png&from=appmsg&wxfrom=5&wx_lazy=1&wx_co=1)

如上图所示，用户自定义组件启动 socket 服务，并将 socket 文件放到指定目录中。Layotto 启动时，会读取该目录中的所有 socket 文件（跳过文件夹），并建立 socket 连接。

目前，Layotto 向 Dapr 对齐，不负责用户组件的生命周期。这就意味着在服务期间，用户组件下线后不会进行重连，则该组件服务无法使用。后面会根据社区使用情况，来决定 Layotto 是否需要支持进程管理模块，或是使用一个单独的服务来管理。

由于 Windows 对于 UDS 的支持还不是很完善，且 Layotto 本身取消了对 Windows 的兼容，所以新特性采用的 UDS 发现模式未对 Windows 系统做兼容。

### 组件注册

![img](https://mmbiz.qpic.cn/sz_mmbiz_png/nibOZpaQKw0ib863eTavUxtwJh1kWmMNjU6Q6WJRAJ8QJPibl9OVkE9WlMGaglBmLD7Sk9tztl343mBYRuwvkfmjg/640?wx_fmt=png&from=appmsg&wxfrom=5&wx_lazy=1&wx_co=1)

如上面的数据流架构图所示，用户注册的组件需要实现 pluggable proto 定义的 gRPC 服务。Layotto 会根据 gRPC 接口，实现 Go interface 接口，这里对应于数据流图中的 wrapper component。wrapper component 与 built-in component 对 Layotto Runtime 来说没有任何区别，用户也不会有特殊的感知。

Layotto 通过 gRPC reflect 库，获取到用户提供服务实现了哪些组件，然后注册到全局的组件注册中心，以供用户使用。

## 开源之夏个人随访

### 自我介绍

大家好，我是陈亦昺，目前就读于杭州电子科技大学，大三学生。自从大二开始，我对开源产生了浓厚的兴趣，特别是在云原生和微服务领域。

起初，我主要为我个人感兴趣的项目提供使用案例和文档支持，随后逐渐开始贡献一些简单的功能。例如，我为 Kratos 贡献了一个简单的 toml 配置文件解析器，并向 go-zero 提供了一些建议，改进了它的优雅关闭（Graceful Shutdown）功能。

之后，我接触到了服务网格领域，认识了 MOSN 社区，并开始为其中的子项目 Layotto 做开源贡献：我修复了一些 makefile 脚本使用中的 bug、编写了 Go SDK 的使用文档、并尝试对 Nacos 组件进行封装。

### 申请本社区项目的原因

SOFAStack 是一个金融级的云原生架构，内部孵化了许多吸引我的微服务项目。接触 SOFAStack 社区以来，我发现他们对开源贡献十分重视，仓库中有丰富的文档来帮助用户了解项目的背景、功能、代码模块等。

👉SOFAStack 仓库地址：[https://github.com/sofastack](https://github.com/sofastack)

MOSN 项目也组织过源码阅读活动，将 MOSN 核心组件的代码设计整理成文档；仓库所有者也会为新人提供适合入手的 issue 作为开始。所以在 OSPP 活动开始之前，我其实就先认识了 SOFAStack 社区，并对其新兴项目 Layotto 做了一定的贡献。OSPP 开始后，我很快与导师取得联系，并得知可以参考 Layotto 对标项目 Dapr 的设计实现。于是，我翻阅了 Dapr 的相关文档、该功能实现时的 issues，阅读了该块功能的源码，最终得出适合移植到 Layotto 的方案。

### 如何克服项目过程中的困难与挑战？

在项目开发的初期阶段，导师会引导我了解项目的愿景、业务背景和代码结构；当我在开发过程中遇到困难时，导师为我提供了很多实质性的建议和改进方向；此外，社区每周三定期举行社区会议，让我们可以同步项目开发进度、讨论遇到的问题，共同寻求解决方案。

在开发过程中我其实遇到了不少问题，其中一个让我印象深刻的是 Go 依赖冲突问题。早期，Layotto 参考了 Dapr 的一些组件接口设计，并直接引入了 Dapr 仓库的代码，这样直接复用了 Dapr 组件的功能，也避免了重复劳动。但是早期的 Dapr 并没有实现可插拔组件的功能，为了让新功能与 Dapr 组件保持兼容，我必须将 Dapr 升级到能够实现该功能的版本。

然而，这两个版本之间存在许多不兼容的变化（尽管对外提供的服务接口并没有改变），所以一旦我升级了依赖，Layotto 就会出现大量错误。最终在与导师的沟通中，我们一致认为这部分兼容性工作的收益不大，只需实现新的接口供用户使用即可。

### 你眼中的社区印象

SOFAStack 是一个充满开源精神的、热情的社区，欢迎并鼓励学生和开源爱好者积极参与其中。同时，SOFAStack 社区也是专业的，它专注于云原生和金融领域的技术创新和解决方案，旨在帮助开发者快速构建和管理云原生应用，提高应用的可伸缩性、弹性以及可靠性。

### 一些收获

参加这次开源之夏项目使我获益匪浅。我对云原生有了进一步的深刻理解，并在实际业务操作中积累了宝贵的经验。同时，参加这个活动还扩展了我的知识技能，激发了我对开源项目做出贡献的热情。

通过与导师和社区的合作，我学会了如何与其他开发者协作、如何提出和解决问题，并且还掌握了使用开源工具和资源的技巧。通过阅读 Layotto 和 Dapr 的源代码，我掌握了许多关于程序设计的经验，例如编写可测试的代码、命名规范、如何构建单元测试用例等等。这些经验和技能不仅提高了我的竞争力，在将来的求职和就业中也为我打开了更多机会。

在开发过程中，我遇到了很多出乎意料的挑战，但是当我一一克服它们时，它们都成为了我编码人生中的宝贵经验。

### 寄语

不要惧怕项目中的困难，只需时刻保持对开源的热情，全力以赴！相信投身开源之后，你也将获得一段独特难忘的经历。

Layotto Star 一下✨：[https://github.com/mosn/layotto](https://github.com/mosn/layotto)
