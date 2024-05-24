---
title: "告别复杂性！用正确的工具轻松应对 K8s 管理挑战"
authorlink: "https://github.com/sofastack"
description: "告别复杂性！用正确的工具轻松应对 K8s 管理挑战"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2023-11-14T15:00:00+08:00
cover: "https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*1pwwS6iXw38AAAAAAAAAAAAADrGAAQ/original"
---

文｜王连平（花名：烨川)

蚂蚁集团容器团队专家

本文 3441 字  阅读 9 分钟

## 技术背景

Kubernetes 是容器编排的标杆平台，其标准化、插件化特性促使其拥有巨大的生态体系。众所周知，Kubernetes 是由其众多管控组件共同驱动容器交付的，但这种特性可会给开发人员和 SRE 在开发和运维过程中带来更高复杂性。

当容器在交付过程出现错误，通常会使用 Kubectl 命令行工具查看 Pod 相关的事件，进而查看相关组件的日志定位具体的错误。这种方式存在效率低、信息少的缺点，导致问题排查耗时耗力。另外，容器在交付过程中会经历诸多阶段，比如调度、IP 分配、挂卷、容器创建和启动等，当此过程变得很慢时，需要精准定位到哪里是瓶颈点，最直接的方法是在所有管控组件做埋点，然后逐阶段分析问题。这种埋点方式带来了巨大的工作量，不易推进实施。

针对这些问题，蚂蚁集团围绕 Kubernetes 平台构建了一套综合的容器观测服务——Lunettes。它利用 Kubernetes 多维度的交付信息（例如 API Server 请求、Audit 审计）构建了一套容器交付全生命周期观测服务，可以跟踪和诊断容器交付过程，并且基于诊断能力提供容器交付 SLI/SLO 服务，实现了数字化方式监控和管理 Kubernetes 容器服务。

## 整体方案

![img](https://mmbiz.qpic.cn/sz_mmbiz_png/nibOZpaQKw0ibTsDorhwvuic1GGFrcEDsKNFyNLPFyW2HJ61eK5npPXCSGic8sK70kAQoyQlzqvJTz3LvHWEusY6vg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

在 Kubernetes 系统中，大量的管控组件在容器交付的过程中分工协作，为交付出来一个正常运行的容器不断的重试调和，过程中会产出大量的中间请求动作、日志等信息，Kubernetes 系统这种异步终态特性是容器交付可观测服务的一个关键挑战。那么在此类系统中观测容器交付过程，应该具备哪些特性呢？

我们希望 Lunettes 应该具备：

- 提供多维度的容器交付信息，并且能优雅处理面向终态的机制

- 提供便捷的组件接入方式，尽可能小的侵入组件代码

- 提供较灵活的定制化或者配置方式

- 给用户提供简单易用的交互接口

Lunettes 基于上述特性的考虑，整体采用旁路数据采集、数据分析和数据服务思路，围绕 Kubernetes 的审计日志做容器交付相关业务的分析，包括 Pod 基本信息、Pod 交付关键生命周期、Pod 交付诊断、Pod 交付跟踪和 Pod 交付 SLO 共 5 部分的交付数据。在数据分析链路上抽象出多个通用的模型，让用户灵活定制容器交付 Trace 及 SLO 诊断能力。同时，向上提供了 OpenAPI 和 Grafana UI 两种用户交互接口，便于用户信息消费。

## 系统架构

![1](https://mmbiz.qpic.cn/sz_mmbiz_png/nibOZpaQKw0ibTsDorhwvuic1GGFrcEDsKNicDzLNKav27ptw4KKXv7FR3ExFMN2mdK9CBAg1Xv4gMUI5LcucbMOWw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

上图示意了 Lunettes 系统的系统架构和数据链路，除了 Kubernetes API Server 审计数据源、数据采集和数据存储组件外，Lunettes 整体包括用户接口层和数据处理层两部分，其中数据处理层是 Lunettes 的核心业务逻辑所在。其处理流程如下：

1. 从数据流向看，Filebeat 从 Kubernetes API Server 采集审计日志后，存储到 Elastic Search 中，在审计采集过程中使用 Filebeat Processor 进行冗余信息过滤，在数据存储 Elastic Search 时使用 Pipeline 增加必要时间序列，如此使得存储到 ES 中的数据量小而丰富。

2. Lunettes 会近实时从 ES 拉取审计数据，审计进入 Lunettes 后首先会被 Share Processor 处理，这里处理主要分为 Pod 元数据信息提取、超事件（HyperEvent）抽象、以及并发反序列化审计请求中的 Raw Data，前置反序列化是为了减少后续  SLO、Trace 等业务处理时重复处理，提升性能。

3. 数据经过 Share Processor 之后，进入核心的交付分析模块，核心包括交付生命周期 Trace、交付 SLO 分析、交付原因分析及容器基础信息搜集，数据在模块之前按照需求做依赖 DAG，最终将产出 OTel、ES Table、Metrics 三种数据写入相关的数据服务。

4. 存储到 ES、jaeger 和 prometheus 的数据，会被 Lunettes Rest API 和 Grafana di 处理，转换为 OpenAPI 数据接口和 Grafana Portal 上的数据进行展示。Grafana Portal 中一站式集成了 Lunettes 所有的功能，用户使用更便捷。

## Lunettes 核心能力

### 交付 SLO

交付 SLO 目的是基于 Kubernetes 交付链路能力对用户承诺交付保障。那么“交付 SLO”是什么呢？可以概括为：在一定时间内保障用户的容器可以成功交付。这个时间就是给用户的承诺，自然地 SLO 时间如何来定是非常关键的。Lunettes 主要从 Pod Spec 中获取资源规格、资源亲和配置等属性，计算出 Pod 的 SLO 时间。另外，Lunettes 也会根据 Pod 选择的不同交付链路（可以简单的理解为高速交付链路和普通低速链路）来给出保障时间。

![1](https://mmbiz.qpic.cn/sz_mmbiz_png/nibOZpaQKw0ibTsDorhwvuic1GGFrcEDsKNPxWXGxTIcEKicw1cPoq12w7Pof3VXWJthgibqCuaV0KibF6gMt3P6EvRA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

有了 SLO 超时计算标准，另一个挑战是如何计算 SLO 时间。如前文所述，容器交付链路中包含了多个阶段，Lunettes 将其区分为 Kubernetes 平台自身耗时和用户耗时两大类，通过 overlay 时间轴，去除用户时间后作为整体 SLO 时间保障。如此，对外承诺的 SLO 时间不会因为用户错误行为（配置、代码 bug 等）导致承诺失败。

### 交付诊断

交付过程中出错是必然的，从庞大的 Kubernetes 系统快速定位容器交付过程中的问题是用户非常关心的。Lunettes 另一个重要的能力是从大量的容器交付行为信息中分析出容器交付的错误原因，用户通过 Portal 或者 OpenAPI 可以轻松获取容器交付的结果，如下图所示，Lunettes 在诊断结果中积累沉淀了 30 余种错误类型，帮用户快速定位问题。

![1](https://mmbiz.qpic.cn/sz_mmbiz_png/nibOZpaQKw0ibTsDorhwvuic1GGFrcEDsKNj3T69RFIZjiaiaKocMeO5lTrSqoQlC82YmAdTiaWLzECZnFtTAO0HAyRw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

诊断过程中，Lunettes 采用回放审计日志技术，通过模拟容器交付过程抽象定义出原因分析 DAG 框架。审计日志回放输入 DAG 诊断框架后，各模块将分析自己阶段的交付是否完成，如果出错则抛出异常。最终，经过回放分析给出 Pod 出错位置，当然各分析模块是面向终态的分析过程。DAG 的框架既保证了分析过程行为的正确性，也提升了诊断流程的可扩展性。

![1](https://mmbiz.qpic.cn/sz_mmbiz_png/nibOZpaQKw0ibTsDorhwvuic1GGFrcEDsKNwlAYoSqUFDtcfSkQiatZYw4PNDDwsFM5gs4IhLtaPZO3RuN5qX2k2vQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### 交付 Trace

交付 Trace 核心目的是跟踪每个 Pod 的交付过程，记录 Pod 交付过程中各阶段的耗时，以及对出错的阶段进行日志记录。一般地，在微服务系统中面向请求的 Trace 都是打桩，正如前文所述 Kubernetes 这种终态异步系统中，打桩每个管控组件是非常大的一个工程量，而且在组件之间异步分布式传递 Trace Context 很有挑战性。Lunettes 另辟蹊径，基于审计日志，抽象出 HyperEvent 概念，其包含了 Pod 交付过程中发生在 Pod 身上所有的 Verb 和 Event 两类信息，比如 Patch 一个 Condition 表示某个交付阶段完成，透出一个 Event 表示某个阶段结束。这两种信息被进一步用于定义交付 Trace 过程中每个阶段的开始和结束标志，Lunettes 根据每个阶段的开始和结束标志在 Pod 交付过程中实时跟踪交付过程。当然 HyperEvent 也会用于 Trace 整体的开始和结束识别。

![1](https://mmbiz.qpic.cn/sz_mmbiz_png/nibOZpaQKw0ibTsDorhwvuic1GGFrcEDsKNhfKTX21t3oiaAq6tWZQ1Fo1sRlpDLHpVdXZkK7CtmnO7RHz7qdMJiauA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

Lunettes 交付 Trace 定义是开放给用户灵活定义的，用户可根据自身 Kubernetes 集群的实际情况定义符合自己的 Trace 过程。Trace 过程中，遇到的中间态错误，Lunettes 将自动识别并透出，同时也会规避大量冗余信息和错误的跟踪发生。

## 总结&未来计划

Lunettes 目前已在蚂蚁容器平台大规模使用，每天在为业务用户、SRE 及研发提供日均 K 次级别交付诊断支持，是一线运营支持人员核心工具。另外，基于 Lunettes，推动了诸多交付链路性能优化、故障 RCA 能力建设，我们希望通过 Lunettes 开源能够帮助更多同行一起推动容器交付运营领域向前迈进，提高公司的运营效率降低运营成本。

当前 Lunettes 在诸多方面还在进行着探索，比如在零侵入 Trace 方面，如何将 Trace 过程传递到 Kubernetes 平台下游，如何做到 Controller 函数级的 Trace。我们希望 Lunettes 开源后，更多有想法的伙伴参与进来，在容器可观测技术领域进行更多有价值的探索。

## 欢迎加入

当前 Lunettes 已经开源，欢迎大家共享共建！

Lunettes 社区：[https://github.com/alipay/container-observability-service](https://github.com/alipay/container-observability-service)
