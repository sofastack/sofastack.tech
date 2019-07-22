---
title: "Knative：重新定义 Serverless | GIAC 实录"
author: "敖小剑"
authorlink: "https://skyao.io"
description: "本文根据敖小剑在 2018 年上海 GIAC 演讲内容整理，文中有 PPT 获取地址。"
categories: "Serverless"
tags: ["Serverless","Knative"]
date: 2019-01-03T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1562902599427-d421bc4c-ee82-416a-87a9-090ff3f85c98.png"
---

> Knative 是Google 发起的 Serverless 项目，希望通过提供一套简单易用的 Serverless 开源方案，将 Serverless 标准化。
> 本文根据敖小剑在 2018 年上海 GIAC 演讲内容整理，PPT 获取地址：[下载地址](https://gw.alipayobjects.com/os/basement_prod/6be92114-b951-4d8d-972f-c39142d5fb17.pdf)

![敖小剑简介](https://cdn.nlark.com/yuque/0/2018/png/156645/1546052299933-4c074292-7d29-4c3f-b71b-ecd073cf37d6.png)

## 前言

大家好，今天给大家来的演讲专题是“Knative：重新定义Serverless”, 我是来自蚂蚁金服中间件的敖小剑。

![敖小剑个人简介](https://cdn.nlark.com/yuque/0/2019/png/226702/1551860860234-ac20d30b-179c-4b0d-b062-c1fc933d942c.png)

这是我的个人资料，有兴趣的同学可以关注的我的个人技术博客网站 [https://skyao.io](https://skyao.io./)

![分享大纲](https://cdn.nlark.com/yuque/0/2019/png/226702/1551860869436-f2e62bcf-c35c-449f-9cfa-59319b9079c9.png)

这次演讲的内容将会有这些，首先给大家介绍一下 Knative 是什么，然后是 Knative 的主要组件，让大家对 Knative 有一个基本的了解。之后我会简单的对 Knative 做一些分析和探讨，以及介绍一下 Knative 后续的发展。希望本次的内容让大家能够对Knative有一个基本的认知。

## 什么是 Knative？

![什么是 Knative](https://cdn.nlark.com/yuque/0/2019/png/226702/1551860889326-3eceb611-31d8-4ec9-bb1c-a4ac59a16834.png)

Knative 是 Google 牵头发起的 Serverless 项目。

![Knative 的项目定位](https://cdn.nlark.com/yuque/0/2019/png/226702/1551860938736-689f4d2e-7617-4af1-84d7-9e435f830b75.png)

这是Knative的项目定义，注意这句话里面几个关键字：Kubernetes，Serverless，Workload。

![参与 Knative 项目的公司](https://cdn.nlark.com/yuque/0/2019/png/226702/1551860948976-f638c9a8-fc4b-43bc-91a9-0c7b7813f1a8.png )

这是最近几年 Google 做大型项目的常态：产品刚出来，阵营就已经很强大了，所谓先声夺人。

![Knative 项目进展](https://cdn.nlark.com/yuque/0/2019/png/226702/1551860967194-3f0b5487-4ec1-4730-9538-7d2e8f5b7c32.png )

是目前Knative项目的进展，可以看到这是一个非常新的项目，刚刚起步。

> 备注：这是截至2018-11-24演讲当天的情况，到2018年12月底，Knative已经发布了v0.2.2和v0.2.3两个bugfix版本。但也还只是 0.2 ……

![现有 Serverless 实现](https://cdn.nlark.com/yuque/0/2019/png/226702/1551861034069-6c3e12cb-e64d-42df-8f4b-cea394091efe.png)

我们来看一下，在Knative出来前， Serverless 领域已有的实现，包括云端提供的产品和各种开源项目。

![Serverless 调查](https://cdn.nlark.com/yuque/0/2019/png/226702/1551861112468-7624d0df-d26a-40e2-8387-51ae9756ef23.png)

这幅图片摘自 The New Stack 的一个 Serverless 调查，我们忽略调查内容，仅仅看看这里列出来的 Serverless 产品的数量——感受是什么？好多Serverless项目，好多选择！

那问题来了：到底该怎么选？

![目前 Serverless 的问题](https://cdn.nlark.com/yuque/0/2019/png/226702/1551861126303-5c117d38-27a5-4bda-95b7-73afdc2d62fa.png )

这就是目前 Serverless 的问题：由于缺乏标准，市场呈现碎片化。不同厂商，不同项目，各不相同，因此无论怎么选择，都面临一个风险：供应商绑定！

![Knative 官方介绍](https://cdn.nlark.com/yuque/0/2019/png/226702/1551861132771-f46de0cd-53e4-4b12-8289-ec95f41c3004.png)

这段话来自 Knative 的官方介绍，Google 推出 Knative 的理由和动机。其中第一条和第二条针对的是当前 Serverless 市场碎片的现状。而第四条多云战略，则是针对供应商绑定的风险。

![Knative](https://cdn.nlark.com/yuque/0/2019/png/226702/1551861148487-32c5a3fc-bf92-4228-99ac-06a23889e42a.png)

Google 描述 Knative 的动机之一，是将云原生中三个领域的最佳实践结合起来。

**小结：**

当前 Serverless 市场产品众多导致碎片化严重，存在厂商绑定风险，而 Google 推出 Knative，希望能提供一套简单易用的 Serverless 方案，实现 Serverless 的标准化和规范化。

## Knative 的主要组件

![Knative 的主要组件](https://cdn.nlark.com/yuque/0/2019/png/226702/1551861177242-263ded39-1cf1-4654-a7f6-89fd9c2634cd.png)

第二部分，来介绍一下Knative的主要组件。

![Knative 三大主要组件](https://cdn.nlark.com/yuque/0/2019/png/226702/1551861186927-439ee82b-33dd-4caf-b54e-e6ad3f51ea78.png)

前面提到，Google 推出 Knative ，试图将云原生中三个领域的最佳实践结合起来。反应到 Knative 产品中，就是这三大主要组件：Build，Serving，Eventing。

![Knative Build：从代码带容器](https://cdn.nlark.com/yuque/0/2019/png/226702/1551861193785-c418d201-60bd-42cc-8cf0-d3d6305bf4f4.png)

Knative Build 组件，实现从代码到容器的目标。为什么不直接使用 dockfile 来完成这个事情？

![Knative Build 与 Kubernetes CRD](https://cdn.nlark.com/yuque/0/2019/png/226702/1551861200585-5ef9d354-b664-4990-802d-fcaaf180e477.png)

Knative Build 在实现时，是表现为 Kubernetes 的 CRD，通过 yaml 文件来定义构建过程。这里引入了很多概念如：Build，Builder，Step，Template，Source等。另外支持用 Service Account 做身份验证。

![Knative Serving](https://cdn.nlark.com/yuque/0/2019/png/226702/1551861207601-61df9c7f-1cb6-4dac-97d9-04df3579a65d.png)

Knative Serving 组件的职责是运行应用以对外提供服务，即提供服务、函数的运行时支撑。

**注意定义中的三个关键：**

1. Kubernetes-based：基于 k8s，也仅支持 k8s，好处是可以充分利用k8s平台的能力
2. scale-to-zero：serverless 最重要的卖点之一，当然要强调
3. request-driven compute：请求驱动的计算

值得注意的是，除了k8s之外，还有另外一个重要基础：istio！后面会详细聊这个。

Knative Serving项目同样也提供了自己的中间件原语，以支持如图所示的几个重要特性。

![更高一层的 Knative 抽象](https://cdn.nlark.com/yuque/0/2019/png/226702/1551861215471-3bd2d3b4-cd85-4190-893d-2c246827ff9e.png)

Knative中有大量的概念抽象，而在这之后的背景，说起来有些意思：Knative 觉得 kubernetes 和 istio 本身的概念非常多，多到难于理解和管理，因此 Knative 决定要自己提供更高一层的抽象。至于这个做法，会是釜底抽薪解决问题，还是雪上加霜让问题更麻烦……

Knative的这些抽象都是基于 kubernetes 的 CRD 来实现，具体抽象概念有：Service、Route、Configuration 和 Revision。特别提醒的是，右边图中的 Service 是 Knative 中的 Service 概念，`service.serving.knative.dev`，而不是大家通常最熟悉的 k8s 的 service。

![Knative Serving Scaling](https://cdn.nlark.com/yuque/0/2019/png/226702/1551861226580-d2b981a1-122c-43d1-b0e8-5cbcc3a8bfb7.png)

对于 Knative Serving 组件，最重要的特性就是自动伸缩的能力。目前伸缩边界支持从0到无限，容许通过配置设置。

Knative 目前是自己实现的 Autoscaler ，原来比较简单：Revision 对应的pod由 k8s deployment 管理，pod上的工作负载上报 metrics，汇总到 Autoscaler 分析判断做决策，在需要时修改 replicas 数量来实现自动伸缩（后面会再讲这块存在的问题）。

当收缩到0，或者从0扩展到1时，情况会特别一些。Knative在这里提供了名为 Activator 的设计，如图所示：

1. Istio Route 控制流量走向，正常情况下规则设置为将流量切到工作负载所在的pod
2. 当没有流量，需要收缩到0时，规则修改为将流量切到 Activator ，如果一直没有流量，则什么都不发生。此时Autoscaler 通过 deployment 将 replicas 设置为0。
3. 当新的流量到来时，流量被 Activator 接收，Activator 随即拉起 pod，在 pod 和工作负载准备好之后，再将流量转发过去

![Knative Eventing](https://cdn.nlark.com/yuque/0/2019/png/226702/1551861234555-0a56721e-4845-4ec1-bb90-f018ff088c5a.png)

Knative Eventing 组件负责事件绑定和发送，同样提供多个抽象概念：Flow，Source，Bus，以帮助开发人员摆脱概念太多的负担（关于这一点，我保留意见）。

![Bus/总线](https://cdn.nlark.com/yuque/0/2019/png/226702/1551861242311-b0001a9f-c790-422c-93a9-a955d08bc88a.png)

Bus 是对消息总线的抽象。

![Source/事件源](https://cdn.nlark.com/yuque/0/2019/png/226702/1551861250375-98d87816-45c4-4020-9e0f-19767d921085.png)

Source 是事件数据源的抽象。

![CloudEvents](https://cdn.nlark.com/yuque/0/2019/png/226702/1551861258667-a5a90519-636a-4b20-892a-150220bc7474.png)

Knative 在事件定义方面遵循了 Cloudevents 规范。

**小结：**

简单介绍了一下 Knative 中的三大组件，让大家对 Knative 的大体架构和功能有个基本的认知。这次就不再继续深入 Knative 的实现细节，以后有机会再展开。

## Knative分析和探讨

![第三部分](https://cdn.nlark.com/yuque/0/2019/png/226702/1551861269911-88c84f87-6535-48c9-b2d5-9d140cc0d412.png)

在第三部分，我们来分析探讨一下 Knative 的产品定位，顺便也聊一下为什么我们会看好 Knative。

![Knative 的定位](https://cdn.nlark.com/yuque/0/2019/png/226702/1551861277018-b3ff55ba-ad45-4b58-88b4-80a7b539c3c5.png)

首先，最重要的一点是：Knative __不是__一个 Serverless 实现，而是一个 Serviceless 平台。

也就是说，Knative 不是在现有市场上的20多个 Serverless 产品和开源项目的基础上简单再增加一个新的竞争者，而是通过建立一个标准而规范的 Serverless 平台，容许其他 Serverless 产品在 Knative 上运行。

![Knative 带来的新东西](https://cdn.nlark.com/yuque/0/2019/png/226702/1551861284377-72ae8942-7745-45ce-a9e7-3c12f99e0a4d.png)

Knative 在产品规划和设计理念上也带来了新的东西，和传统 Serverless 不同。工作负载和平台支撑是 Knative 最吸引我们的地方。

![Istio](https://cdn.nlark.com/yuque/0/2019/png/226702/1551861291088-b0db07fa-0df6-4e6d-b99d-01004d705947.png)

要不要 Istio？这是 Knative 一出来就被人诟病和挑战的点：因为 Istio 的确是复杂度有点高。而 k8s 的复杂度，还有 Knative 自身的复杂度都不低，再加上 Istio……

关于这一点，个人的建议是：

* 如果原有系统中没有规划 Istio/Service mesh 的位置，那么为了 Knative 而引入 Istio 的确是代价偏高。可以考虑用其他方式替代，最新版本的 Knative 已经实现了对 Istio 的解耦，容许替换。
* 如果本来就有规划使用 Istio/Service mesh ，比如像我们蚂蚁这种，那么 Knative 对 Istio 的依赖就不是问题了，反而可以组合使用。

而 Kubernetes + Servicemesh + Serverless 的组合，我们非常看好。

![系统复杂度带来的挑战](https://cdn.nlark.com/yuque/0/2019/png/226702/1551861297831-6149e8a3-373a-4f4d-852d-537f78d75ebc.png)

当然，Knative 体系的复杂度问题是无法回避的：Kubernetes，Istio，Knative 三者都是复杂度很高的产品， 加在一起整体复杂度就非常可观了，挑战非常大。

## Knative后续发展

![第四部分](https://cdn.nlark.com/yuque/0/2019/png/226702/1551861304756-6c50e011-c511-4656-9b54-d2975dd3bd32.png)

第四个部分，我们来展望一下 Knative 的后续发展，包括如何解决一些现有问题。

![Knative 性能问题](https://cdn.nlark.com/yuque/0/2019/png/226702/1551861311937-774d9a6e-fc70-4e67-bd83-f4e55ef3ef6d.png)

第一个问题就是性能问题。

![Knative 解决方案](https://cdn.nlark.com/yuque/0/2019/png/226702/1551861319838-68ba74cd-c075-4698-abc3-84f454dda41a.png)

Queue Proxy也是一个现存的需要替换的模块。

![Autoscaler 的实现](https://cdn.nlark.com/yuque/0/2019/png/226702/1551861327082-563cc04a-4153-464f-b03d-6bd1443ffcef.png)

前面讲过 Knative 的 Autoscaler 是自行实现的，而 k8s 目前已经有比较健全原生能力： HPA 和 Custom Metrics。目前 Knative 已经有计划要转而使用 k8s 的原生能力。这也符合 Cloud Native 的玩法：将基础能力下沉到 k8s 这样的基础设施，上层减负。

![Autoscaler 的后续完善](https://cdn.nlark.com/yuque/0/2019/png/226702/1551861333958-b80f0187-28d6-481e-b9a8-7c3ef15ada53.png)

除了下沉到 k8s 之外，Autoscaler还有很多细节需要在后续版本中完善。

![Autoscaler 版本改善](https://cdn.nlark.com/yuque/0/2019/png/226702/1551861340261-62db7622-5b4a-4a9b-8847-8d5c4580e337.png)

对事件源和消息系统的支持也远不够完善，当然考虑到目前才 0.2.0 版本，可以理解。

![缺乏 Workflow](https://cdn.nlark.com/yuque/0/2019/png/226702/1551861347009-8583c695-ddc0-4ce4-933e-5adc50036642.png)

目前 Knative 还没有规划 Workflow 类的产品。

![Network Routing Requirements for Knative](https://cdn.nlark.com/yuque/0/2019/png/226702/1551861357758-5a47c7d4-df62-4bb5-b2fa-abd98a85910d.png)

在网络路由能力方面也有很多欠缺，上面是 Knative 在文档中列出来的需求列表。

![Knative 的可拔插设计](https://cdn.nlark.com/yuque/0/2019/png/226702/1551861364758-3ae8a9e7-7fb2-4773-949a-3a3fb5069357.png)

最后聊聊 Knative 的可拔插设计，这是 Knative 在架构设计上的一个基本原则：顶层松耦合，底层可拔插。

最顶层是 Build / Serving / Eventing 三大组件，中间是各种能力，通过 k8s 的 CRD 方式来进行声明，然后底层是各种实现，按照 CRD 的要求进行具体的实现。

在这个体系中，用户接触的是 Build / Serving / Eventing 通用组件，通过通过标准的 CRD 进行行为控制，而和底层具体的实现解耦。理论上，之后在实现层做适配，Knative 就可以运行在不同的底层 Serverless 实现上。从而实现 Knative 的战略目标：提供 Serverless 的通用平台，实现 Serverless 的标准化和规范化。

## 总结

![第五部分](https://cdn.nlark.com/yuque/0/2019/png/226702/1551861371042-7b1cfe8b-1f44-4e9d-b9ca-b7546a7b025c.png)

最后，我们对 Knative 做一个简单总结。

![Knative 优势](https://cdn.nlark.com/yuque/0/2019/png/226702/1551861378329-754e973e-e98c-4a69-9e55-d560a1ea7843.png)

先谈一下 Knative 的优势，首先是 Knative 自身的几点：

* 产品定位准确：针对市场现状，不做竞争者而是做平台
* 技术方向明确：基于 k8s，走 Cloud Native 方向
* 推出时机精准：k8s 大势已成，istio 接近成熟

然后，再次强调：Kubernetes + Service mesh + Serverless 的组合，在用好的前提下，应该威力不凡。

此外，Knative 在负载的支撑上，不拘泥于传统的FaaS，可以支持 BaaS 和传统应用，在落地时适用性会更好，使用场景会更广泛。（备注：在这里我个人有个猜测，Knative 名字中 native 可能指的是 native workload，即在 k8s 和 Cloud Native 语义下的原生工作负载，如果是这样，那么 Google 和 Knative 的这盘棋就下的有点大了。）

最后，考虑到目前 Serverless 的市场现状，对 Serverless 做标准化和规范化，出现一个 Serverless 平台，似乎也是一个不错的选择。再考虑到 Google 拉拢大佬和社区一起干的一贯风格，携 k8s 和 Cloud Native 的大势很有可能实现这个目标。

当然，Knative 目前存在的问题也很明显，细节不说，整体上个人感觉有：

* 成熟度：目前才 0.2 版本，实在太早期，太多东西还在开发甚至规划中。希望随着时间的推移和版本演进，Knative 能尽快走向成熟。
* 复杂度：成熟度的问题还好说，总能一步一步改善的，无非是时间问题。但是 Knative 的系统复杂度过高的问题，目前看来几乎是不可避免的。

最后，对 Knative 的总结，就一句话：__前途不可限量，但是成长需要时间__。让我们拭目以待。

![ServiceMesher 社区](https://cdn.nlark.com/yuque/0/2019/png/226702/1551861385309-6eb9ed6e-3f4e-4931-95ac-d9e1c22923db.png)


欢迎大家加入 servicemesher 社区，也可以通过关注 servicemesher 微信公众号来及时了解 service mesh 技术的最新动态。

欢迎大家共同打造 SOFAStack [https://github.com/sofastack](https://github.com/sofastack)


