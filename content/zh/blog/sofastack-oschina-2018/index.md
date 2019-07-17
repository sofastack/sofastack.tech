---
title: "蚂蚁金服微服务实践- 2018 开源中国年终盛典分享实录"
author: "余淮"
authorlink: "https://github.com/ujjboy"
description: "本文根据余淮在 2018 开源中国年终盛典的演讲内容整理，完整的分享 PPT 获取方式见文章底部。"
categories: "SOFAStack"
tags: ["微服务","开源","实践"]
date: 2018-12-17T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1550642831191-6bc3631d-a183-49bf-b9bc-5b2d42c9612f.jpeg"
---

> 章耿，花名余淮，蚂蚁金服高级技术专家。
> 2007 年毕业后一直从事服务化相关的工作，最早在国家电网做电子商务平台 SOA 化的工作，之后在京东负责京东的服务化框架 JSF，目前在蚂蚁金服中间件服务与框架组负责应用框架及 SOFAStack 相关的工作。
> 
> 本文根据余淮在 2018 开源中国年终盛典的演讲内容整理，完整的分享 PPT 获取方式见文章底部。

![2018开源中国-余淮](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1550642831191-6bc3631d-a183-49bf-b9bc-5b2d42c9612f.jpeg)

## 本次分享主要分为三部分：

- 蚂蚁金服服务化架构演进
- 蚂蚁金服微服务体系
- 蚂蚁金服 SOFAStack 的开源情况

## 1、蚂蚁金服服务化架构演进

在开始讲架构演进之前，我们先来看一组数据。
![双十一数据](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1550642849919-3c33f148-53ef-41a4-8d58-2852a513a0e0.jpeg)

这是历年来的双十一数据图，柱状是双十一的交易额，从最初到20亿到去年的1682亿，今年是2135亿。而这个橙色的折线则是支付宝双十一 0 点的交易峰值，去年是 26.5w笔每秒，今年更高。从这两组数据可以看出蚂蚁的业务每年都是在高速增长，那技术面临的压力更是在不断的增长。但是最近几年，峰值虽然越来越大，但是大家有个体感，就是大促的购物体验更好了，再也不像以前系统会被大促搞挂，系统反而越来越稳了。

而支撑这些数字的背后，是蚂蚁金融科技的一些核心技术，我们可以看到有三地五中心多活架构，分布式数据库 OceanBase，**金融级分布式架构 SOFAStack**，还有更多的一些黑科技，例如 Zoloz 生物识别，蚂蚁区块链，第五代智能风控引擎。

![蚂蚁金服科技](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1550643494212-ac857647-f190-4911-93a6-ddd230b2f37d.jpeg)

相信大家都听过一句话 “罗马不是一天建成的”。蚂蚁金服科技的技术也不是最早就设计成这样，和所有的大公司发展一样，目前这些技术架构也是随着业务发展、系统的壮大，一步一步演进而来的。

下面给大家介绍下蚂蚁金服的演进。

![单应用模块化](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1550643518029-6c799836-d190-4285-b7c3-8dc2ad6dc984.jpeg)

这个是支付宝最早的架构示意图，可以看到当时支付宝只是电商后台的一个支付系统，是一个单体应用，里面简单的分了几个业务模块，连的也是一个数据库。但随着业务规模的不断扩展，单系统架构已经无法满足业务需求。

![微服务化](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1550643610482-de3f1d7d-a62e-43ca-b5a2-d08a515a2b98.jpeg)

所以支付宝就对大系统进行了拆分，将原来的一个单体应用内部的多个模块变成了多个独立的子系统，这算是典型的 SOA 化的架构。最开始系统之间是使用 F5 的硬件负载设备来做系统间的负载均衡，但由于 F5 设备存在单点的问题，所以后面就在中间引入一个注册中心的组件。服务提供者去**注册中心**注册服务，服务消费者去注册中心订阅服务列表，服务消费者通过软负载方式通过 **RPC 框架**直接调用服务提供者。这在现在看来是一种非常显而易见的服务化架构，但当时 07 年就采用这样的架构还是算比较超前的。 支付宝在做系统拆分的同时，对数据库也按子系统进行了垂直拆分。数据库的拆分就会引入分布式事务的问题，蚂蚁金服中间件就提供了基于 TCC 思想的 **分布式事务组件 DTX**。

![同城多机房](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1550643627417-34598012-2022-4060-b3f4-a7c1b5f0f8d4.jpeg)

业务还是不断扩展，系统也越来越多，当系统节点到一定数量的时候，单个物理机房已经无法承受。另外考虑到同城容灾的问题，支付宝就在同城再扩建另外一个机房，通过专线部署为一个内部网络，然后将应用部署上去。同城多机房会引入一个跨机房远程访问的问题，相比同机房调用，这个延迟损耗一定是更高的。远程访问主要包括两种：RPC 调用和数据库访问。为了解决 RPC 跨机房调用的问题，支付宝的工程师选择的方案是在每个机房都部署注册中心，同机房优先调用本机房服务的方式，也就变成图中的部署模式。但是数据库跨机房访问的问题，在这个阶段并没有解决。

![单元化](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1550643640110-e9a70c50-2501-4307-afde-934c7e2ac56b.jpeg)

为了解决上面的跨机房数据访问、数据库连接数瓶颈以及未来数据水平扩展的问题，蚂蚁的工程师们设计了一套单元化的架构，这是单元化的一个示意图。在没有单元化的时候，用户请求进入内部后，所有请求链路都是随机走的，例如图里的 S0 到 B1 到 C2 到 D0。首先蚂蚁的请求都是跟用户相关的，所以我们将数据按用户的维度进行水平分片，例如这张示意图我们将所有用户分为三组。然后我们将我们的应用也部署成三组独立的逻辑单元，每个逻辑单元的应用和数据都是独立的，相当于每个逻辑单元都处理1/3总量用户的数据。

这个时候我们的三个不同终端的用户，不管是在PC端或者手机端或者扫二维码，当请求进入统一接入层的时候，接入层会按上面逻辑单元的分组规则，将用户请求转发到对应的逻辑单元，例如 user0 的请求转到 S0，后面的应用之间的调用、数据都只在逻辑单元 0 内。统一的 user1 只在逻辑单元 1，user2 也只到逻辑单元 2。

![IDC&LDC](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1550643649731-778d2ce8-a038-4b0d-b28c-141e95e2fd1c.jpeg)

我们把这种逻辑单元称之为 RegionZone。在实际的部署过程中，物理数据中心 IDC 和 逻辑单元的数量没有完全的对等关系。例如图中我们物理机房可以是两地三中心，而 RegionZone 则是分为五个。

两地三中心是国家对金融机构的一个容灾指导方案，要求在同城或相近区域内 （ ≤ 200K M ）建立两个数据中心 : 一个为数据中心，负责日常生产运行 ; 另一个为灾难备份中心，负责在灾难发生后的应用系统运行。同时在异地（＞ 200KM ) 建立异地容灾中心。

有了这套单元化的架构做指导思想，蚂蚁进行大规模的改造，包括应用改造、基础框架改造、数据中心的建设。

![两地三中心](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1550643660153-e34b729e-4308-40d7-beeb-9e44d6172e78.jpeg)

机房建设完成后，同时蚂蚁金服将自己的用户分成了若干份，划了几个逻辑单元，分别部署进了不同的物理机房，同时完成大规模的数据迁移。

![三地五中心](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1550643669079-2642436a-b8d2-44ad-950f-870873028a6e.jpeg)

从两地三中心到容灾能力更强大的三地五中心，我们只需要先进行第三个城市的机房建设，然后将部分 RegionZone 部署到第三个城市，最后再完成数据迁移和引流即可。

每一个 RegionZone 在异地都有备份，当发生城市级的故障时，我们通过统一的管控中心将新的逻辑规则推送到统一接入层以及异地的备 RegionZone 时，就可以做到城市级的整体容灾切换。

再后面我们基于单元化的思想做了更多弹性调度等能力，这里就不展开了。

![蚂蚁金融科技](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1550643676313-96c506d2-3204-4db4-aa73-98f3f8a8bbcb.jpeg)

2015 年 9 月蚂蚁金融云对外正式发布，在今年 9 月的云栖大会，蚂蚁金融云正式升级为蚂蚁金融科技，并宣布技术全面对外开放，其中就包括金融级分布式架构 SOFAStack，左上角就是网址，感兴趣的朋友可以看下：https://tech.antfin.com/sofa

云上的 SOFAStack 继承了蚂蚁金服内部的能力，有三大特点，分别是开放（全栈开放、开源共建）、云原生（异地多活、无限扩展）、金融级（资金安全、无损容灾），下面是一些核心能力大家可以看下。这一切就使得蚂蚁金服的微服务体系不仅仅在蚂蚁内部玩得转，也需要适应云上例如云原生、多租户等更复杂的场景。

##  2、蚂蚁微服务体系
讲到微服务，大家就会看到或者脑子就跳出各种各样的词，例如 RPC 框架、服务安全、路由寻址等等。
![微服务](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1550643701314-5b1d9536-8af5-4593-a7a4-8a471724e5fa.jpeg)

除了这些以外，其实还有更多的服务归属、服务测试、服务编排等更多概念。

那蚂蚁内部围绕微服务体系，也建设了很多的组件和框架对应这些微服务的概念点。

![蚂蚁微服务架构](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1550643709477-ee423c40-6a16-466c-bd91-ac9e666a711e.jpeg)

这是一张蚂蚁内部微服务体系的一张简图，只列了部分主要组件，这些组件都是自研的，部分已经开源。可以看到有**配置中心 DRM**、**注册中心 SOFARegistry**，**应用开发框架 SOFABoot**，应用里的 **RPC 框架**、**分布式链路跟踪组件 Tracer**、**监控度量组件 Lookout** 等微服务组件，应用旁边是我们的 **SOFAMosn**，也就是 ServiceMesh 里的数据平面 SideCar，会将 RPC 里的路由、限流、鉴权等一些能力集成到这个组件里，下面的 **OCS **是我们的可观测性平台，可以在上面看 tracer 和 metrics 信息，两边的两个组件是 **Edge Proxy**，主要是在跨机房或者跨 BU 的远程服务访问的 Proxy。

下面我会逐一介绍各个组件：

![SOFABoot](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1550643717463-4c4e3ec6-e327-4472-a7cb-b07a6ceb5d90.jpeg)

SOFABoot 是我们的开发框架，目前已经开源。开源地址是：[https://github.com/sofastack/sofa-boot](https://github.com/sofastack/sofa-boot)

SOFABoot 是基于 Spring Boot 的，我们对其做了功能扩展，同时也保持完全兼容。SOFABoot 提供了基于 Spring 上下文隔离的模块化开发、基于 SOFAArk 的类隔离/动态模块、中间件和业务日志框架隔离等能力。由于 Spring Cloud 也是基于 Spring Boot 的，所以 SOFABoot 和 Spring Cloud 体系也是完全兼容的。我们将 SOFAStack 下的中间件都作为 SOFABoot Starter，同时一些会员、安全等基础业务我们也作为 Starter 供各个应用方便的集成使用。

![SOFARPC](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1550643726494-bcf36b34-b067-4a4b-ab64-7969b96dd1f1.jpeg)

SOFARPC 是内部的 RPC 框架，目前也已经开源，开源地址是：[https://github.com/sofastack/sofa-rpc](https://github.com/sofastack/sofa-rpc)

SOFARPC 和其它的开源的 RPC 框架一样，做了很多分层很多的模型抽象，例如图中的 Filter/Router/Cluster/Loadbalance/Serilization/Protocol/Transport 等这些模型。

它的特点如下：

- 透明化、高性能

- 丰富的扩展机制、事件机制

- 支持自定义Filter和自定义Router

- 支持多种负载均衡策略，随机/权重/轮询/一致性hash 等

- 支持多种注册中心，zookeeper/consul/etcd/nacos 等

- 支持多协议， Bolt/Rest/HTTP/H2/gRPC/dubbo 等

- 支持多种调用方式，同步、单向、回调、泛化等

- 支持集群容错、服务预热、自动故障隔离


SOFARPC 基于Java Proxy 机制实现透明的，默认的基于二进制协议 Bolt 和 NIO 异步非阻塞实现高性能通讯。SOFARPC 基于其 ExtensionLoader 扩展机制和 EventBus 的事件总线机制可以进行非常方便集成各种各样的扩展。例如注册中心，我们内置支持了 ZooKeeper 和 nacos 的实现，社区帮我们共享了 consul 和 etcd 等实现。

SOFARPC 还支持多协议，Bolt 是蚂蚁内部使用多年的内部协议，也已开源，地址是：[https://github.com/sofastack/sofa-bolt](https://github.com/sofastack/sofa-bolt)

![SOFARegistry](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1550643737613-b9b56d06-8ad9-4c2e-a8f4-51a6ec0257b2.jpeg)

SOFARegistry 是自研的注册中心。

SOFARegistry 和 Zookeeper、etcd 注册中心不同的是，它是属于 AP 架构，保证高可用和数据的最终一致。注册中心客户端和注册中心之间是长连接，当订阅数据发生变化的时候，注册中心是推送数据给注册中心客户端的。为了保持大量的长连接，我们将注册中心分为了两种角色，Session 节点和 Data 节点，Session 节点保持与客户端的长连接，Data 节点存储数据。SOFARegistry 还原生支持多数据中心以及单元化场景。在蚂蚁金融云上，SOFARegistry 新增加了 Meta 节点角色用于支持多租户以及数据分片，这就使其拥有了支持海量服务注册信息存储的能力。

![DRM](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1550643747097-a237180d-2f14-4796-92fa-3362fab5d551.jpeg)

DRM 是我们内部的分布式配置中心。

配置中心客户端和配置中心服务端数据交互是采用长连接推模式，而不是 HTTP 短轮询或者长轮询。配置中心客户端在本地磁盘存储配置以数据防止配置中心服务端不可用，同时客户端也会定时检查数据一致性；在服务端Nginx、服务端内存中设计缓存增加性能，没有的数据才会请求到数据库。配置中心的管控台支持单点、灰度、分组、全局等多种推送模式，并会读对推送结果做一致性检查。

![Guardian](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1550643755271-d19044ff-7c9d-4037-bffe-b4730cec552f.jpeg)

Guardian 是我们内部的熔断限流组件。

它支持监控模式（只记录不拦截）和拦截模式。支持多种场景的限流例如RPC请求、Web请求等。支持令牌桶、漏桶等多种限流算法。支持限时熔断、降级等多种熔断规则。支持空处理、固定返回值、抛出异常等降级策略。有时候如果这些规则过于复杂，用户可以在管理端配置自定义 groovy 脚本，规则将通过配置中心下发到各个拦截点。Guardian 同时还支持故障注入操作，用于日常的一些应急演练，检测系统的健壮性等等。

![SOFALookout](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1550643762748-8aa7e782-f23b-40bf-9a81-6252c1ba72c8.jpeg)

SOFALookout 是我们内部的监控度量组件，目前客户端已经开源，地址是[https://github.com/sofastack/sofa-lookout](https://github.com/sofastack/sofa-lookout)

SOFALookout 的客户端基于 Mectrics 2.0 标准，内置多种度量规则例如 JVM/cpu/mem/load 等，用户也可以自定义度量。Lookout-gateway 是一个度量数据收集端，可对接多种数据采集端（例如来自 Lookout 客户端上报的、agent上报的或者来自 Queue 里的事件），同时内置一定的计算能力，将处理后的数据丢到消息队列中，最后分发到 OB/HBase/ES 等不同的数据存储中。不同后端数据展示平台可以直接从数据存储中捞出数据进行展示。OCS 就是我们的可观测平台，可以查 Tracer 和 Metrics 信息。

![SOFATracer](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1550643771180-0bee13fc-19a5-4899-811b-164b1c691d88.jpeg)

SOFATracer 是我们内部的分布式链路跟踪组件，目前客户端已经开源，地址是[https://github.com/sofastack/sofa-tracer](https://github.com/sofastack/sofa-tracer)

SOFATracer 基于 OpenTracing 规范，提供了丰富的组件支持，例如 Servlet/SpringMVC/HTTPClient/RPC/JDBC 等组件，同时也支持 OpenTracing 官方已经集成的实现。SOFATracer 提供了底层多种存储实现，可以落地到磁盘或者直接汇报到远程服务端。同时 SOFATracer 还提供了链路数据透传的能力，广泛用于全链路压测等场景。

![DTX](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1550643782071-8a721515-46af-4b77-b867-0f7be98c3123.jpeg)

DTX 是分布式事务组件，是蚂蚁金服重度依赖的一个组件，保障在大规模分布式环境下业务活动的数据一致性。

DTX 支持 TCC/FMT/XA 三种模式，用的最多的还是 TCC 这种柔性事务的模式。TCC 模式简单介绍下，它其实是一个两阶段提交的思想，将事务分成两个阶段，try阶段和 cofirm/cancel 两个阶段，用户在业务代码中实现各阶段要做的事情。事务开始的时候，事务发起者通知所有事务参与者执行 try 的操作，try 的时候做预留业务资源或者数据校验操作，如果都 try 成功，则执行 confirm 确认执行业务操作，否则执行 cancel 取消执行业务操作。另外也提供了 FMT 模式，它是另外一种易于用户快速接入、无业务侵入的较自动化的分布式事务模式。

DTX 还支持幂等控制、防悬挂等特性，事务日志兼容多种日志存储实现，事务也支持从本地异步恢复或者远程服务端恢复。

![SOFAActs](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1550643791594-f7a882a6-a363-4604-bad6-6b38ee40d251.jpeg)

ACTS 是我们的一个测试框架。

大家知道对于开发来说，写测试用例其实是一个比较复杂的事情，特别在开发人员水平参差不齐、业务系统又比较复杂的时候。ACTS 是数据对象模型驱动测试引擎的新一代测试框架，致力于提高开发测试人员编写测试用例的效率，给开发人员一个更好的测试体验。ACTS 支持了 IDEA 和 Eclipse 两种 IDE 插件，开发人员可以在 IDE 里直接生成标准化的测试用例，然后再通过可视化的测试数据编辑，对结果可以精细化校验，测试数据也会自动清理。另外支持 API 重写提高测试代码的可拓展可复用性，提供特有注解提高测试代码编排的灵活性。

![SOFAMosn](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1550643800268-9589dad1-10fb-4195-b54e-9a7d5b5728f2.jpeg)

SOFAMosn 是我们使用 Golang 语言开发的 sidecar，目前已经开源，地址是：[https://github.com/sofastack/sofa-mosn](https://github.com/sofastack/sofa-mosn)

这张图其实是 istio 官方的一种图，只是我们把 Envoy 换成了 SOFAMosn。SOFAMosn 可以与 istio 无缝集成，完全兼容它的 API。SOFAMosn 也支持多种协议，除了 Envoy 支持的之外，还额外支持 SOFARPC 和 Dubbo 协议，当然您也可以非常方便的去扩展支持自定义协议。 SOFAMosn 内置了可观测组件，用户可以监控其网络、请求压力等信息。SOFAMosn 还能支持平滑 reload、平滑升级。

##  3、SOFAStack 开源
SOFAStack 中的 SOFA 其实是 Scalable Open Financial Architecture 的首字母缩写，它是用于快速构建金融级分布式架构的一套中间件，也是在金融场景里锤炼出来的最佳实践。

目前 SOFAStack 采用的开源策略我们称之为是「**Open Core**」，就是将 API 层、接口层以及核心实现逻辑通通开源，内部实现保留的是一些兼容内部系统，兼容老的 API，或者是一些历史包袱比较重的代码。

![SOFAStack 开源时间轴](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1550643935707-9ca85569-8cd2-4554-b734-9d80a0222a85.jpeg)

这是今年 SOFAStack 开源的时间轴，在今年的 4 月 19 日，SOFAStack 正式宣布开源，我们第一批主要开了SOFABoot 和 SOFARPC 框架，以及 SOFABolt、SOFAArk、SOFAHessian 等周边组件；

在 5 月 31 日我们第二批开源了 SOFATracer 和 SOFALookout 的客户端，完善了微服务组件；在 6 月 28 日我们的开源官网正式上线，域名就是 [http://sofastack.tech](http://sofastack.tech) ；在 7 月 16 日我们第三批开源了 ServiceMesh 领域的两个项目 SOFAMesh 和SOFAMosn。截止到今年的双十一，这些项目的总 Star 数已经破万，单个工程最高的是 2700 多。

![开源大图](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1550643926797-b8153f4a-6cd6-47d0-92bc-efa296df2be1.jpeg)

这是我们内部的 Landscape，可以看到微服务领域各个功能点我们都有对应的内部系统或者组件。部分前面已经介绍过了，不做过多介绍。

![OS Landscape](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1550643919412-96263934-ac1b-4843-a01a-c14373e2344f.jpeg)

另外这张是我们的 OpenSource Landscape，目前只开源了部分组件，部分组件还在开源准备中，虽然不少内部组件没有开源，但是在每个微服务领域我们都会打通当前已经开源的比较成熟的组件。例如微服务里的服务发现，我们没有开源内部的 SOFARegistry，但是我们对接了 ZooKeeper/etcd/nacos 等业界成熟的注册中心产品，又例如分布式跟踪，我们虽然开源了自己的 SOFATracer，但是在 SOFARPC 我们也提供 skywalking 作为我们的分布式跟踪的实现。通过保持和业界众多优秀开源产品的兼容性，使得 SOFAStack 有更多可能。

![开源数据](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1550643911212-8728dfd5-6457-465e-aa8e-26ed6d05f0eb.jpeg)

目前 SOFAStack 的源码托管在 Github 和 Gitee 上面，欢迎感兴趣的朋友上去看看，也欢迎给我们 Star。

SOFAStack 下的项目大概有 30 来个，每天的 PV 在 10000 以上，总 Star 数一万多，到 12 月初已经有 80 多位小伙伴给我们贡献过代码或者文章。另外我们也和其它一些国内社区保持了良好的交流与合作，包括 ServiceMesher、Skywalking、AntDesign、Eggjs、K8S 中国社区等。

![社区参与方式](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1550643902258-76ba1e39-bf67-41bf-b22c-0229ef5e3481.jpeg)

**那如果大家对 SOFAStack 感兴趣，可以通过这些方式参与到我们的 SOFAStack 社区活动，我们也为贡献者们准备了定制的丰富礼物：**

1. 您可以使用我们的组件给我们反馈，或者查看改进我们的文档，或者为 SOFAStack 写技术分享或者实践类文章，我们会同步到我们微信公众号（金融级分布式架构）里；

2. 当然最好可以贡献 PR，不管是改错别字、修复 Bug 还是提 Feature；

3. 也欢迎来见我们，目前我们已经在北京上海深圳杭州举办过四次 ServiceMesh  Meetup，下一次 1月 6 日在广州，欢迎感兴趣的同学可以参加，历届活动可参考：[https://www.servicemesher.com/](https://www.servicemesher.com/)

### PPT 下载和相关地址

**PPT 地址：** [下载地址](https://gw.alipayobjects.com/os/basement_prod/ce56bcaa-7f46-46e2-99e0-a02c7cb8f980.pdf)

**SOFAStack 文档:**  [http://www.sofastack.tech/](http://www.sofastack.tech/)

**SOFAStack 开源整体地址: ** [https://github.com/sofastack](https://github.com/sofastack)

![开源中国现场图](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1550643892784-2013a459-a998-4d8b-9561-f974f2269dcf.jpeg)

欢迎大家共同打造 SOFAStack  [https://github.com/alipay](https://github.com/alipay) 
