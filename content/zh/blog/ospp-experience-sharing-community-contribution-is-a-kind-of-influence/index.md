---
title: "开源之夏经验分享｜Dragonfly 社区 李从旺：社区贡献也是一种影响力"
authorlink: "https://github.com/sofastack"
description: "开源之夏经验分享｜Dragonfly 社区 李从旺：社区贡献也是一种影响力"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2023-11-07T15:00:00+08:00
cover: "https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*ddoFRafqrvkAAAAAAAAAAAAADrGAAQ/original"
---

今天，我们邀请到了开源之夏 2023 活动 Dragonfly 社区的中选学生李从旺同学，他此次承担的项目是——「PyTorch Serve 基于 Dragonfly P2P 技术分发模型」。希望通过他的开源故事，能让更多人了解到开源的魅力，也可以从不同的视角去认识 Dragonfly 项目。

## 关于 Dragonfly

Dragonfly 提供高效、稳定、安全的基于 P2P 技术的文件分发和镜像加速系统，并且是云原生架构中镜像加速领域的标准解决方案以及最佳实践。自 2017 年开源以来，Dragonfly 被许多大规模互联网公司选用并投入生产使用，并在 2018 年 10 月正式进入 CNCF，成为中国第三个进入 CNCF 沙箱级别的项目。2020 年 4 月，CNCF 技术监督委员会（TOC）投票决定接受 Dragonfly 作为孵化级别的托管项目。Dragonfly 在解决大规模文件分发场景下有着无可比拟的优势。P2P 技术在 AI 推理服务分发大模型场景现阶段应用较少，并且 P2P 技术经过证实也可以真正解决大文件分发过程中的性能瓶颈。在 AI 推理服务分发大模型场景，通过集成 Dragonfly P2P 技术减少源站压力，并且提高模型分发效率。结合 AI 推理领域生态拓展 Dragonfly 应用场景，服务 AI 领域并且成为重要基础设施。

## 项目信息

**项目名称**：PyTorch Serve 基于 Dragonfly P2P 技术分发模型

**项目导师**：戚文博

**项目描述**：本项目是在 PyTorch Serve 分发过程中解决推理模型拉取时，可能会存在性能带宽瓶颈的问题，所以本项目需要 Dragonfly 通过 P2P 能力提高 PyTorch Serve 模型拉取速度，主要供过 Plugin 方式将 Dragonfly P2P 能力集成到 PyTorch Serve 中。

**项目链接**：[https://github.com/dragonflyoss/dragonfly-endpoint](https://github.com/dragonflyoss/dragonfly-endpoint)

## 项目实现思路

无论你是需要安装或是升级，对 Dragonfly 各个组件的理解很重要，这是后期顺利进行性能测试的一个前提。

- Manager: 维护各 P2P 集群之间的关系，动态配置管理和 RBAC。它还包括一个前端控制台，方便用户直观地操作集群。
- Scheduler: 为下载对等体选择最优的下载父对等体。异常控制 Dfdaemon 的返回源。
- Seed Peer：Dfdaemon 开启的种子节点模式，可以作为 P2P 集群中的背向源下载节点，它是整个集群中下载的根节点。
- Peer: 与 Dfdaemon 一起部署，基于 C/S 架构，提供 dfget 命令下载工具，dfget 守护进程运行守护进程提供任务下载功能。

### 架构

![1](https://mmbiz.qpic.cn/sz_mmbiz_png/nibOZpaQKw096Tmltz66gQMUxaKscGOKo4pNu9HMia7jqq8h2XsibbMfa856x7H6z7v3JP9RubqDECynzzCMgjo2A/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

TorchServe 通过集成 Dragonfly Endpoint 插件，发送模型下载请求到 Dragonfly ，Dragonfly 作为代理去对应的 Object Storage 下载模型并返回。

![1](https://mmbiz.qpic.cn/sz_mmbiz_png/nibOZpaQKw096Tmltz66gQMUxaKscGOKoQdYoHaW63HianHF5IiacAOSvb6XfDlLoENSvFLNXfv4V0ID6auc4xX6A/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

模型下载步骤：

1、TorchServe 发起模型下载请求到 Dragonfly Peer。
2、Dragonfly Peer 会到 Dragonfly Scheduler 注册任务。
3、返回拥有资源的候选的父节点。

- Scheduler 服务发现本地 Cache 对这个任务是缓存未命中状态，就触发从 Seed Peer 进行文件下载。
- Seed Peer 如果对于任务也是缓存未命中状态，就会触发回源下载，即到对应的对象存储下载模型文件。
4、到对应的候选的父节点进行分片下载文件。
5、模型下载返回后，TorchServe 会进行模型注册。

在性能测试的步骤中，会对模型下载的几种情况分别进行测试，而结果显示下载性能在命中缓存的情况下确实有极大的提升。

![1](https://mmbiz.qpic.cn/sz_mmbiz_png/nibOZpaQKw096Tmltz66gQMUxaKscGOKo5WQ30mMEfLbYYqXHv54brwDGd62drOickkXhNnB01q5VpicWeUK5lO3g/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

## 开源之夏个人随访

### 自我介绍

大家好，我叫李从旺，是佐治亚理工学院电子与计算机工程专业研二的学生。去年就曾参加过开源之夏的活动，当时的任务是为 Apache APISIX 网关做插件。

### 参加活动的原因

我之前参与过开源之夏，发现这个活动非常适合学生去了解以及深入参与到开源社区。众多的开源项目与技术发现可以让我们了解到行业中的最新动态，比如去年的云原生和今年的 AI 基础设施、大模型等。

同时这种实践搭配的任务难度，在导师与社区的热心帮助之下，无论是为了磨练技术、建立社区连接，还是作为新手开源入门的起点都非常合适。对我来说，第二次参与活动的主要目的是了解并学习新技术。

### 申请本社区项目的原因

主要是我对 Dragonfly 的 P2P 技术很感兴趣，并且它也符合我的技术栈。我提前了解过 Dragonfly 在业界的使用情况与热度，得知它作为实用的基础设施广泛被各个公司使用，且仍然在迭代新功能，于是便有了申请的想法。其次就是我对于插件的编写比较有经验，上手本次的项目会更加顺利。

### 如何克服项目过程中的困难与挑战？

主要的困难在于，之前我没想到 TorchServe 官方对于前端的插件支持较少，因此在调研初期，花费了较多时间去了解 TorchServe 的架构细节与插件的实现机制等。在插件的设计方案上也踩了不少坑：比如起初只考虑增加模型加速下载的部分，而官方 API 模型的下载与注册却是同时进行的；同时官方的代码设计中许多内部方法是不对外开放的，这样一来插件编写的方案也会有限制。这一问题的克服方法主要是反复查看官方代码、文档以及和导师沟通，不合理的方案不断地被导师淘汰，最终我找到了代码侵入最小的实现方式。

还有开源项目从零开始搭建的困难，包括目录设计、工作流的设计、测试用例、文档编写（需要不断打磨）等工作。这些非 coding 的部分往往会占据更多的时间。我的建议是——积极参考社区优秀活跃的开源项目和直接询问导师，这样效率会比用搜索引擎快得多。因为很多规范是会随时间变化的，新项目当然要符合最新的规范。

困难还出现在测试环节！整个插件的使用涉及到不同的对象存储、Dragonfly 以及 TorchServe 等多个组件；多种环境的部署以及不同的配置细节也需要付出额外的关注。当然，最大的挑战是由我硬件资源不足的电脑带来的，解决的办法主要是详细地记录步骤以及利用一些云计算资源，这对后期使用文档的撰写也非常有帮助。

### 导师与社区带来的帮助

在整个开发的过程中，包括前期调研环节，导师给予我的帮助是巨大的。耐心、细心、负责是 Dragonfly 社区以及我的导师给我的最大感受了。他们不仅在技术上给出指导，在文档编写乃至后期的技术交流方面也都非常用心。开发周期内的每周例会和平时的信息反馈也都非常及时，我作为学生，体验也非常好。

### 你眼中的 Dragonfly 社区印象

Dragonfly 致力于提供高效、稳定、安全的基于 P2P 技术的文件分发和镜像加速系统，并且是云原生架构中镜像加速领域的标准解决方案以及最佳实践。目前社区还在不断壮大发展中，欢迎大家一起来参与开源共建。

### 超出预期的收获

在调研中，我学习到了 Dragonfly P2P 的实现原理以及 TorchServe 各个模块的实现方案。在每周例会中，也有许多来自其他社区的同学或嘉宾，让我了解到 P2P 的不同应用场景、利弊与发展；还有在业界推广中各种各样的复杂情况，如定制修改源码的方案、基于某些业界场景额外修改功能、与某些服务方案的比较等。

此外最重要的技能提升，是在规范撰写代码、细心编写文档、以及从无到有构建开源软件等方面。

本次参与项目对我个人的未来规划也十分有帮助。因为对社区的持续贡献也算是一种影响力，这一影响力的积累与提升，让我在未来的简历书写和择业方向选择上都有了更多底气。

### 寄语

开源之夏是一个非常适合新手入门开源社区的好机会。选好你喜欢的社区，就大胆地去参加吧！

Dragonfly Star 一下✨：
[https://github.com/dragonflyoss/Dragonfly2](https://github.com/dragonflyoss/Dragonfly2)
