---
title: "Serverless 市场观察和落地挑战"
author: "隐秀"
authorlink: "https://github.com/Matthew-Dong"
description: "KubeCon China 2019 大会上， Serverless 应用服务正式亮相，在 SOFAStack 工作坊吸引了百余名参与者同场体验。"
categories: "SOFAStack"
tags: ["SOFAStack","Serverless"]
date: 2019-07-11T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563421921621-46a00ca1-a30c-468b-a0f9-3ce8747bd103.png"
---

![5.jpg](https://cdn.nlark.com/yuque/0/2019/jpeg/156645/1562033324537-92398b5f-450d-4784-b3fe-d482af13a1f9.jpeg)
> KubeCon China 2019 大会上， Serverless 应用服务正式亮相，在 SOFAStack 工作坊吸引了百余名参与者同场体验。

## 市场观察

当我们回顾云计算的发展历程，会看到基础架构经历了从物理机到虚拟机，从虚拟机再到容器的演进过程。在这大势之下，应用架构也在同步演进，从单体过渡到多层，再到当下的微服务。在变化的背后，有一股持续的动力，它来自于三个不变的追求：**提高资源利用率**，**优化开发运维体验**，以及**更好地支持业务发展**。

目前， **Serverless** 已成为云原生社区关注的重点之一，它的发展也不例外。相比容器技术，Serverless 可以将资源管理的粒度更加细化，使开发者更快上手云原生，并且倡导事件驱动模型支持业务发展。从而帮助用户解决了资源管理复杂、低频业务资源占用等问题；实现面向资源使用，以取代面向资源分配的模式。根据 CNCF 在2018年底基于 2400 人的一份统计报告，已有 38% 的组织正在使用 Serverless 技术，相比 2017 同期增长了 22%。(数据来源：[CNCF Survey](https://www.cncf.io/blog/2018/08/29/cncf-survey-use-of-cloud-native-technologies-in-production-has-grown-over-200-percent/))

![CNCF 统计报告](https://cdn.nlark.com/yuque/0/2019/png/156645/1562033324529-b653130f-66a7-4d9f-88ce-fcd9fb42c34e.png)
> 图片来源：Gartner Report: China Summary Translation Evolution of Server Computing - VMs to Containers to Serverless - Which to Use When

目前市场上，云厂商提供了多种 Serverless 产品和解决方案，大致可划分为：

1. **函数计算服务**：如 AWS Lambda，特点是以代码片段为单位运行，并对代码风格有一定要求。
1. **面向应用的 Serverless 服务**：如 Knative，特点是基于容器服务，并提供了从代码包到镜像的构建能力。
1. **容器托管服务**：如 AWS Fargate，特点是以容器镜像为单元运行，但用户仍需感知容器。

从社区来看，CNCF 云原生基金会正通过 **Serverless 工作组**协调社区讨论并促进规范和标准的形成，工作组产出了 Serverless [**白皮书**](https://github.com/cncf/wg-serverless/blob/master/whitepapers/serverless-overview/cncf_serverless_whitepaper_v1.0.pdf)和[**全景图**](https://github.com/cncf/wg-serverless#landscape)等重要内容。其中，全景图将目前的生态划分为了平台层，框架层，工具链层和安全层这四个模块。

![Serverless 工作组](https://cdn.nlark.com/yuque/0/2019/png/156645/1562033324539-64e5a120-cd4d-450d-bc05-cb38f47d9704.png)
> 图片来源：[https://landscape.cncf.io/](https://landscape.cncf.io/)

## 落地挑战

在交流过程中，我们发现 Serverless 很好地解决了客户的一些诉求：包括通过 0-1-0 的伸缩能力来提高资源时用率，降低成本；支持代码包出发，从而让客户无感化实现云原生，历史应用无需经过容器化改造；支持灵活的触发器配置，引导用户对应用进行事件驱动的改造，从而适应业务的高速发展等。这些优势，使得 Serverless 在小程序开发的场景下大放异彩。

同时，对于在企业级应用的生产环境落地 Serverless，各方也有了很多探索和突破。在本周刚结束的 KubeCon China 2019 大会上，Serverless 工作组会议也以此为话题展开了讨论。目前的核心挑战可归纳为：

**平台可迁移**

目前众多平台都推出了自己的 Serverless 标准，包括代码格式、框架和运维工具等，用户既面临较高的学习成本和选择压力，也担心无法在平台之间灵活迁移 Serverless 应用。

**0-M-N 性能**

线上应用对控制请求延迟有严格的要求，因此，用户需要谨慎地验证 Serverless 0-1 冷启动速度、M-N 扩容速度以及稳定性都达到了生产要求。

**调试和监控**

用户对底层资源无感知，只能借助平台能力对应用进行调试和监控，用户需要平台提供强大的日志功能进行排错，和多维度的监控功能时刻了解应用状态。

**事件源集成**

采用 Serverless 架构后，应用往往进行更细粒度的拆分，并通过事件串联。因此用户希望平台能集成大多数通用的事件源，并支持自定义事件，使得触发机制更加灵活。

**工作流支持**

完成某个业务，往往涉及多个 Serverless 应用之间的配合，当数目较多时，用户希望可以用工作流工具来进行统一编排和状态查看，提高效率。

## 蚂蚁金服实践

**SOFAStack** 致力于通过产品技术解决云上客户实际痛点，沉淀蚂蚁金服技术实践，帮助用户以高效、低成本的方式迁移到云原生架构。[**Serverless 应用服务**](https://tech.antfin.com/products/SAS)（Serverless Application Service，简称 SOFA SAS）是一款源自蚂蚁金服实践的一站式 Serverless 平台。SAS 基于 SOFAStack CAFE 云应用引擎 （Cloud Application Fabric Engine 简称 CAFE），CAFE 的容器服务已经通过了 CNCF 的一致性认证，是一个标准的 Kubernetes。

![cafe k8s certified](https://cdn.nlark.com/yuque/0/2019/jpeg/156645/1562033324528-7638d27e-5561-4b24-9a08-3cc3c07d0dad.jpeg)

[**Serverless 应用服务**](https://tech.antfin.com/products/SAS)**产品**在兼容标准 Knative 同时，融入了源自蚂蚁金服实践的应用全生命周期管理能力，提供了 Serverless 引擎管理、应用与服务管理、版本管理与流控、根据业务请求或事件触发较快的 0-M-N-0 自动伸缩、计量、日志及监控等配套能力。同时结合金融云上客户实际痛点，产品独居匠心的提供独占版与共享版两种形态，以及传统代码包、容器镜像与纯函数三种研发模式，以解决用户的不同需求，降低客户准入门槛。

![sas.png](https://cdn.nlark.com/yuque/0/2019/png/156645/1562033324522-50f59ad4-a3c2-47a9-a5a9-9b0f9cf6d446.png)

- **一键部署**：用户可以通过代码包或容器镜像的方式一键部署应用并在任意时刻测试执行。
- **引擎管理**：SAS 提供了丰富的引擎全生命周期管理、诊断、监测等能力，为独占版客户赋能 Serverless 引擎数据面的全方位管理与运维运营能力。
- **服务及版本**：SAS 提供应用管理、应用服务管理以及版本管理。版本可以采用容器镜像方式部署也可以采用传统VM发布模式下的代码包部署，很多情况下用户代码无需修改也无需编写维护 Dockerfile 即可迁移。
- **0-M-N**：SAS 提供 0-M-N-M-0 的 Serverelss 快速伸缩能力，支持事件触发或流量触发的 0-M，多种指标的 M-N（如 QPS、CPU、MEM 等等）
- **日志监控计量**：产品内置了日志、监控、计量等配套设施能力，帮助用户进行调试和应用状态监控。
- **流量控制**：基于 SOFAMesh，SAS提供基本流控能力，后续会与服务网格进一步深度集成提供大规模多维跨地域及混合云的流控能力。
- **触发器管理**：产品支持基于常见周期以及秒级精度的cron表达式触发器，可关联并触发无服务器应用，后续将支持更多 IaaS、PaaS 管控型与数据型事件。

![性能解析](https://cdn.nlark.com/yuque/0/2019/gif/156645/1562033324541-97e42fe2-e478-4bfa-8331-bab063e850d8.gif)

> 性能简析：横轴为完全在同一时刻触发冷启的Java应用个数，纵轴为冷启应用的平均与最小耗时。随着压力增大，50个Java应用同一时刻调度加冷启平均耗时2.5秒左右，100个Java应用同一时刻调度冷启平均耗时3-4秒，最短耗时1.5到2秒。

![性能解析-2](https://cdn.nlark.com/yuque/0/2019/png/156645/1562033324543-b87ab116-19af-47cc-96c3-9337a3488d61.png)

> 性能简析：Pooling 快弹慢缩时序算法，池容量和实际单位时间申请量关系可做到如图所示（蓝色为实际申请量，绿色为池容量）

目前产品已顺利支撑**生产环境**小程序 Serverless 模式。同时通过 0-M-N-M-0 的能力在很大程度上降低了小程序的运营成本。在行业客户领域，某保险公司决定近期迁移部分日结前置和长尾应用到 Serverless 产品平台，这也是我们产品又一个重要突破。未来，我们致力于将 SAS 打造成为一个金融级的 Serverless 平台。

更多产品功能介绍可见[这篇文章](https://developer.alipay.com/article/9008)。

## 关注我们

**Serverless 应用服务**于近期开始正式内测，欢迎大家关注产品主页（[https://tech.antfin.com/products/SAS](https://tech.antfin.com/products/SAS)），及时了解最新动态。

KubeCon China 2019 大会上， **Serverless 应用服务**正式亮相**，**在 SOFAStack 工作坊吸引了百余名参与者，一同体验基于 Serverless 轻松构建云上应用。

![KubeCon China 2019 大会现场图](https://cdn.nlark.com/yuque/0/2019/jpeg/156645/1562033324529-b1a35893-ebb6-480e-8b3d-470a2dec2881.jpeg)
