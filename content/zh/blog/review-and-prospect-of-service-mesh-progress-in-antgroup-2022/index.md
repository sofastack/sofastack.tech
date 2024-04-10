---
title: "蚂蚁集团 Service Mesh 进展回顾与展望"
author: "石建伟"
authorlink: "https://github.com/jervyshi"
description: "继 2019 年的 《蚂蚁金服 Service Mesh 落地实践与挑战》之后，蚂蚁集团在 Service Mesh 方向已经继续探索演进近 3 年，这 3 年里有哪些新的变化，以及对未来的思考是什么，值此 SOFAStack 开源 4 周年之际，欢迎大家一起进入《蚂蚁集团 Service Mesh 进展回顾与展望》章节探讨交流。"
categories: "SOFAStack"
tags: ["SOFAStack", "Service mesh"]
date: 2022-05-17T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2022/png/153624/1652759667758-9ac6d8d5-e820-4d63-aa99-cc17faa5dc64.png?x-oss-process=image%2Fresize%2Cw_1440%2Climit_0"
---
## 一、引言

继 2019 年的 《[蚂蚁金服 Service Mesh 落地实践与挑战](https://www.sofastack.tech/blog/service-mesh-giac-2019/)》之后，蚂蚁集团在 Service Mesh 方向已经继续探索演进近 3 年，这 3 年里有哪些新的变化，以及对未来的思考是什么，值此 SOFAStack 开源 4 周年之际，欢迎大家一起进入《蚂蚁集团 Service Mesh 进展回顾与展望》章节探讨交流。

本次交流将以如下次序展开：

![image.png](https://cdn.nlark.com/yuque/0/2022/png/153624/1652758504322-f5e9c9d7-d6ec-45bb-8590-772849c7b20a.png#clientId=u1f24bd9c-2055-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=254&id=u8804a9b3&margin=%5Bobject%20Object%5D&name=image.png&originHeight=254&originWidth=2134&originalType=binary&ratio=1&rotation=0&showTitle=false&size=46667&status=done&style=none&taskId=u8ee57630-40b3-4947-aece-e2d7fcac2c5&title=&width=2134)
## 二、蚂蚁集团 Service Mesh 发展史

![image.png](https://cdn.nlark.com/yuque/0/2022/png/153624/1652758504429-b3368bc7-6df3-4c6a-a3c6-9bf8323bc9bf.png#clientId=u1f24bd9c-2055-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=690&id=Y4dW7&margin=%5Bobject%20Object%5D&name=image.png&originHeight=690&originWidth=2094&originalType=binary&ratio=1&rotation=0&showTitle=false&size=244332&status=done&style=none&taskId=u96235ef7-f046-4a20-89ba-9e6995b4330&title=&width=2094)

- 2018 年 3 月份蚂蚁集团的 Service Mesh 起步，MOSN 数据面诞生，起步就坚持走核心开源，内部能力走扩展的道路。
- 2019 年 6.18 我们在三大合并部署应用上接入了 MOSN 并且顺利支撑了 6.18 大促。
- 2019 年双 11 蚂蚁所有大促应用平稳的度过双大促。
- 2020 年 MOSN 对内沉稳发展把接入应用覆盖率提升至 90%，对外商业化开始展露头角。蚂蚁集团全站 90% 标准应用完成 Mesh 化接入。在商业版本中，SOFAStack“双模微服务”架构也在江西农信、中信银行等众多大型金融机构成功落地实践。
- 2021 年随着 Mesh 化的逐步成熟，多语言场景的逐步丰富，Mesh 化的对中间件协议的直接支撑带来的扩展性问题也逐步凸显，Dapr 的应用运行时概念也逐步崛起，这一年我们开源了 Layotto，期望通过对应用运行时 API 的统一来解决应用和后端中间件具体实现耦合的问题，进一步解耦应用和基础设施，解决应用在多云运行时的厂商绑定问题。
- 2022 年随着 Mesh 化落地的基础设施能力逐步完善，我们开始考虑 Mesh 化如果给业务带来更多价值，在 Mesh 1.0 时代，我们把中间件相关的能力尽可能做了下沉，提升了基础设施的迭代效率，在 Mesh 2.0 时代，我们期望能有一种机制可以让业务侧相对通用的能力，也可以做到按需下沉，并且具备一定的隔离性，避免下沉的能力影响 Mesh 数据代理主链路。这部分将在看未来部分做一些介绍。

图示的方式简诉一下 Service Mesh 架构演进的几个阶段：

1. SOA 时代，中间件的客户端均直接集成在业务进程内：

![image.png](https://cdn.nlark.com/yuque/0/2022/png/153624/1652758504332-0f553974-0153-458e-b830-bccdbe018ca2.png#clientId=u1f24bd9c-2055-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=1118&id=sLzGe&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1118&originWidth=1710&originalType=binary&ratio=1&rotation=0&showTitle=false&size=116303&status=done&style=none&taskId=u4b10a2f6-b5d0-47a3-bd5a-b0b324be027&title=&width=1710)

2. Mesh 化阶段一：中间件能力下沉，应用和基础设施实现部分解耦：

![image.png](https://cdn.nlark.com/yuque/0/2022/png/153624/1652758504261-4763cdec-2b3c-49f6-acd3-ea305e984335.png#clientId=u1f24bd9c-2055-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=559&id=H06L1&margin=%5Bobject%20Object%5D&name=image.png&originHeight=559&originWidth=855&originalType=binary&ratio=1&rotation=0&showTitle=false&size=56231&status=done&style=none&taskId=u14b84bca-3e1d-4799-ac6e-8ffb25ba300&title=&width=855)

3. 应用运行时阶段：将应用和具体基础设施的类型解耦，仅依赖标准 API 编程：

![image.png](https://cdn.nlark.com/yuque/0/2022/png/153624/1652758504319-72804307-117c-431e-9ad8-fb3828195c97.png#clientId=u1f24bd9c-2055-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=1120&id=pXRe9&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1120&originWidth=1710&originalType=binary&ratio=1&rotation=0&showTitle=false&size=123638&status=done&style=none&taskId=u99d70eb8-6ad0-4bed-ba07-5d06167b087&title=&width=1710)
## 三、东西向流量规模化挑战

Mesh 化后的数据面 MOSN 承载了应用间非常核心的东西向通信链路，目前在蚂蚁集团内部覆盖应用数千，覆盖容器数十 W+，海量的规模带来了如长连接膨胀、服务发现数据量巨大、服务治理困难等问题。接下来我们来聊一聊我们在演进的过程中遇到并解决掉的一些经典问题。

### 3.1 长连接膨胀问题

在海量规模的应用背后存在着复杂的调用关系，部分基础性服务被大部分应用所依赖，由于调用方全连服务提供方的机制存在，一个基础性服务的单 Pod 需要日常承载近 10W 长连接，单机 QPS 一般还是有上限的，我们以 1000 QPS 的 Pod 举例，10w 长连接的场景下，每条长连接上的 QPS 是非常低的，假设所有连接的请求均等，平均每条长连接每 100s 仅有一次请求产生。

为了保证长连接的可用性，SOFA RPC 的通信协议 Bolt 有定义心跳包，默认心跳包是 15s 一次，那么一条长连接上的请求分布大概如下图所示：

![image.png](https://cdn.nlark.com/yuque/0/2022/png/153624/1652758504912-73aa62d2-7c07-4723-8c29-620192065ead.png#clientId=u1f24bd9c-2055-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=340&id=ub3d07bb2&margin=%5Bobject%20Object%5D&name=image.png&originHeight=340&originWidth=2132&originalType=binary&ratio=1&rotation=0&showTitle=false&size=43789&status=done&style=none&taskId=u42d25cfc-bc46-4f92-a32d-8831ed6adb4&title=&width=2132)
在上诉场景中，一条长连接上，心跳包的请求数量远大于业务请求的数量，MOSN 在日常运行中，用于维护长连接可用句柄持有内存的开销，还有心跳包发送的 CPU 开销，在海量规模集群下不可忽视。

基于以上问题，我们找到了两个解法：

1. 在保证连接可用的前提下减少心跳频率
1. 在保证负载均衡的前提下降低应用间的连接数

#### 3.1.1 心跳退避

由于心跳的主要作用是尽可能早的发现长连接是否已不可用，通常我们认为经过 3 次心跳超时即可判定一条长连接不可用，在一条长连接的生命周期里，不可用的场景占比是非常低的，如果我们把长连接的检测周期拉长一倍就可以减少 50%的心跳 CPU 损耗。为了保障检测的及时性，当出现心跳异常（如心跳超时等）场景时，再通过降低心跳周期来提高长连接不可用时的判定效率，基于以上思路我们设计了 MOSN 里的长连接心跳退避策略：

1. 当长连接上无业务请求且心跳正常响应时，逐步将心跳周期拉长 15s -> 90s 

![image.png](https://cdn.nlark.com/yuque/0/2022/png/153624/1652758505136-96b8bf3d-8ce5-4f68-a486-5389c8046711.png#clientId=u1f24bd9c-2055-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=214&id=u850213f2&margin=%5Bobject%20Object%5D&name=image.png&originHeight=214&originWidth=2132&originalType=binary&ratio=1&rotation=0&showTitle=false&size=26942&status=done&style=none&taskId=u3bd1beae-ebd7-4d9c-b9f3-26710bd6371&title=&width=2132)

2. 当长连接上出现请求失败或心跳超时的场景时，将心跳周期重置回 15s

![image.png](https://cdn.nlark.com/yuque/0/2022/png/153624/1652758505368-a0f7ba00-025f-441e-89d4-45670a43e42c.png#clientId=u1f24bd9c-2055-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=270&id=ucc822a62&margin=%5Bobject%20Object%5D&name=image.png&originHeight=270&originWidth=2132&originalType=binary&ratio=1&rotation=0&showTitle=false&size=41675&status=done&style=none&taskId=uabbb4cc5-6899-48d5-aedb-ad3d0e1910d&title=&width=2132)

3. 当长连接上存在正常业务请求时，降级本次心跳周期内的心跳请求

![image.png](https://cdn.nlark.com/yuque/0/2022/png/153624/1652758505453-1203ad34-eba8-4252-bc2b-abb63f2e2fee.png#clientId=u1f24bd9c-2055-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=338&id=u32fa25bf&margin=%5Bobject%20Object%5D&name=image.png&originHeight=338&originWidth=2132&originalType=binary&ratio=1&rotation=0&showTitle=false&size=38868&status=done&style=none&taskId=u3f674bc2-ac76-470b-872f-8393d81c780&title=&width=2132)
通过以上心跳退避的手段，MOSN 的常态心跳 CPU 消耗降低至原来的 25%。

#### 3.1.2 服务列表分片

从心跳退避的优化可以看出，在海量长连接的场景下，单长连接上的请求频率是很低的，那么维护这么多长连接除了对负载均衡比较友好之外，其他的收益并不大，那么我们还有另外一个优化方向，就是减少客户端和服务端之间建立的长连接数量。

MOSN 使用一致性哈希的策略对服务端机器进行分组：在客户端的内存中，首先将全量的服务端机器列表加入到一致性哈希环中，然后基于配置计算预期分片情况下的机器列表数 N，随后根据客户端机器 IP，从一致性哈希环中获取 N 个机器列表作为本机器的分片列表。每个客户端计算的哈希环都是一样的，不同的机器 IP 使得最终选择的机器分片列表是不同的。实现了不同客户端机器持有不同的服务端集群分片的效果。

![image.png](https://cdn.nlark.com/yuque/0/2022/png/153624/1652758505474-85386683-7310-48fb-bc8e-5782ac04a3d4.png#clientId=u1f24bd9c-2055-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=342&id=ua0d809b0&margin=%5Bobject%20Object%5D&name=image.png&originHeight=381&originWidth=817&originalType=binary&ratio=1&rotation=0&showTitle=false&size=44879&status=done&style=none&taskId=u64288137-6634-47e3-a93b-78b73c3356b&title=&width=733.5)
通过对服务列表的分片优化，客户端向服务端建立的长连接数量急剧减小，在 6w 长连接且采用 50% 的负载均衡分片的场景下：单机 CPU 降低约 0.4 Core，内存降低约 500M。

### 3.2 海量服务发现问题

MOSN 的服务发现能力没有使用 Pilot，而是在内部直接和 SOFARegistry（服务注册中心） 对接，使用这种架构的原因之一就是 RPC 的接口级服务发现，节点的 Pub、Sub 量巨大，海量应用的频繁运维产生的节点变更推送对 Pilot 的性能和及时性挑战都很大，社区有使用 Pilot 在稍大规模下做 CDS 下发的过程中也发现非常多的性能问题并提交 PR 解决，但对于蚂蚁集团一个机房就有 200W Pub，2000W Sub 的规模下，Pilot 是完全无法承载的。SOFARegistry 的架构是存储和连接层分离，存储为内存分片存储，连接层也可以无限水平扩容，在内部海量节点变更下也能实现秒级变更推送。

虽然 SOFARegistry 的推送能力没什么问题，不过海量节点变更后产生的推送数据，会导致 MOSN 内有大量的 Cluster 重构，列表下发后到 Cluster 构建成功的过程中，会有大量的临时内存产生，以及 CPU 计算消耗。这些尖刺型内存申请和 CPU 占用，是可能直接影响请求代理链路稳定性的。为了解决这个问题，我们也考虑过两个优化方向：

1. SOFARegistry 和 MOSN 之间把全量推送改造为增量推送
1. 服务发现模型从接口级切换为应用级

其中第一点能带来的效果是每次列表推送变化为原推送规模的 1/N，N 取决于应用变更时的分组数。第二点能带来的变化是更加明显的，我们假设一个应用会发布 20 个接口，100 个应用的 Pod 产生的服务发现数据是 `20*100=2000` 条数据，接口粒度服务发现的数据总量会随着应用接口数量的增长数倍于应用节点数的规模持续增长；而应用级服务发现可以把节点总量控制在应用 Pod 数这个级别。

#### 3.2.1 应用级服务发现演进

接口级服务发现示例（相同节点中多个服务中重复出现）：
![image.png](https://cdn.nlark.com/yuque/0/2022/png/153624/1652758506184-312b86a0-f717-464d-9471-33929e016254.png#clientId=u1f24bd9c-2055-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=456&id=GkMLc&margin=%5Bobject%20Object%5D&name=image.png&originHeight=531&originWidth=871&originalType=binary&ratio=1&rotation=0&showTitle=false&size=164012&status=done&style=none&taskId=u77003095-5792-408f-bf6f-756e76c5021&title=&width=747.5)
应用级服务发现示例（结构化表示应用、服务、地址列表间的关系）：
![image.png](https://cdn.nlark.com/yuque/0/2022/png/153624/1652758506274-b58b079b-ccc1-40d0-91a8-4224ca980cc8.png#clientId=u1f24bd9c-2055-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=609&id=VlmxG&margin=%5Bobject%20Object%5D&name=image.png&originHeight=680&originWidth=798&originalType=binary&ratio=1&rotation=0&showTitle=false&size=120393&status=done&style=none&taskId=ueed7331d-dc1d-4a2e-9406-6b3fe0f83a8&title=&width=715)
通过对应用和接口关联信息的结构化改变，服务发现的节点数量可以下降一到两个数量级。

接口级服务发现演进到应用级服务发现对于 RPC 框架来讲是一个巨大的变化，社区中有 Dubbo 3.0 实现了应用级服务发现，但这种跨大版本的升级兼容性考量很多，对于在奔跑的火车上换轮子这件事情，在框架层演进是比较困难的。由于蚂蚁集团内部的 Service Mesh 已经覆盖 90% 的标准应用，所以在服务发现演进方面我们可以做的更加激进，结合 MOSN + SOFARegistry 6.0，我们实现了接口级服务发现和应用级服务发现的兼容性以及平滑切换的方案，通过 MOSN 版本的迭代升级，目前已经完成接口级到应用级服务发现的切换。

通过上述改进，生产集群的服务发现数据 Pub 数据量下降 90%，Sub 数据量下降 80%，且整个过程对应用完全无感，这也是 Mesh 化业务和基础设施解耦后带来的实际便利体现。

#### 3.2.2 MOSN Cluster 构造优化

通过应用级服务发现解决数据量变更过大的问题之后，我们还需要解决下在列表变更场景下产生的 CPU 消耗和临时内存申请尖刺问题，在这个问题中通过对内存申请的分析，Registry Client 在收到服务端推送的列表信息之后需要经历反序列化，构造 MOSN 需要的 Cluster 模型并更新 Cluster 内容，其中比较重的就是构建 Cluster 过程中的 Subset 构建。通过使用对象池，并且尽量减少 byte[] 到 String 的拷贝，降低了内存分配，另外通过 Bitmap 优化 Subset 的实现，让整个 Cluster 的构造更加高效且低内存申请。

经过上述优化，在超大集群应用运维时，订阅方列表变更临时内存申请降低于原消耗的 30%，列表变更期间 CPU 使用量降低为原消耗的 24%。

### 3.3 服务治理智能化演进

MOSN 把请求链路下沉之后，我们在服务治理方面做了非常多的尝试，包括像客户端精细化引流、单机压测引流、业务链路隔离、应用级别的跨单元容灾、单机故障剔除、各种限流能力等，篇幅关系我这里仅介绍下我们在限流场景下做的智能化探索。

开源社区的 Sentinel 项目在限流方向做了一个非常好的实践，MOSN 在做限流早期就和 Sentinel 团队沟通，希望能基于 Sentinel 的 Golang 版本 SDK 来做扩展，站在巨人的肩膀上，我们做了更多的尝试。
![image.png](https://cdn.nlark.com/yuque/0/2022/png/153624/1652758506322-e62b64b6-6add-43a3-8ec0-31c94723bd87.png#clientId=u1f24bd9c-2055-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=112&id=u05af0241&margin=%5Bobject%20Object%5D&name=image.png&originHeight=167&originWidth=1086&originalType=binary&ratio=1&rotation=0&showTitle=false&size=28286&status=done&style=none&taskId=u98510c44-8292-490f-aada-5057021e00c&title=&width=731)
基于 Sentinel 可插拔的 Slot Chain 机制，我们在内部扩展了很多限流模块的实现，如自适应限流 Slot、集群限流 Slot、熔断 Slot、日志统计 Slot 等。
![image.png](https://cdn.nlark.com/yuque/0/2022/png/153624/1652758506434-9728af1d-72ca-4d73-8b31-1042b1686364.png#clientId=u1f24bd9c-2055-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=276&id=u5f71f9bd&margin=%5Bobject%20Object%5D&name=image.png&originHeight=551&originWidth=1752&originalType=binary&ratio=1&rotation=0&showTitle=false&size=130567&status=done&style=none&taskId=u03b1ae76-4aa2-41a2-8a38-034676c2821&title=&width=876)
在 MOSN 做限流能力之前，Java 进程内也是存在限流组件的，业务常用的是单机限流，一般会有一个精确的限流值，这个值需要经过反复的压测，才能得到单机的最大可健康承载的 TPS，这个值会随着业务应用本身的不断迭代，功能增加，链路变的更复杂而逐步变化，所以每年大促前，都会准备多轮全链路压测，来确保每个系统都能在满足总 TPS 的情况下对自身应用所应该配置的限流值有一个精确的预估。

为了解决限流配置难的问题，我们尝试在 MOSN 内实现了自适应限流，根据对容器当前的接口并发、CPU、Load1 信息采集上报，再结合最近几个滑动窗口中，每个接口的请求量变化，可以自动识别是什么接口的并发量增加导致了 CPU 资源占用的提升，当负载超过一定的基线之后，限流组件可以自动识别出哪些接口应该被限流以避免资源使用超过健康水位。
![image.png](https://cdn.nlark.com/yuque/0/2022/png/153624/1652758506754-86ffeaf5-a44e-46df-8be3-42a76193b2ad.png#clientId=u1f24bd9c-2055-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=368&id=u450479b4&margin=%5Bobject%20Object%5D&name=image.png&originHeight=509&originWidth=1037&originalType=binary&ratio=1&rotation=0&showTitle=false&size=83000&status=done&style=none&taskId=u38945225-ed6b-41b8-97e8-575b803df18&title=&width=750.5)

在实际的生产环境中，自适应限流可以迅速精准的定位异常来源，并秒级介入，迅速止血，同时也可以识别流量类型，优先降低压测流量来让生产流量尽可能成功。大促前再也不需要每个应用 Owner 去给自己应用的每个接口配置限流值，大幅度提升研发幸福感。
![image.png](https://cdn.nlark.com/yuque/0/2022/png/153624/1652758507194-28b592d7-47eb-4a97-a829-f815523dc987.png#clientId=u1f24bd9c-2055-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=374&id=u0c60d8c8&margin=%5Bobject%20Object%5D&name=image.png&originHeight=520&originWidth=1045&originalType=binary&ratio=1&rotation=0&showTitle=false&size=86086&status=done&style=none&taskId=u58794872-3810-4fb2-b5b5-62e44b0cc32&title=&width=751.5)
## 四、南北向流量打通

MOSN 作为 Service Mesh 的数据面主要在东西向流量上发力，除了东西向流量之外，还有南北向流量被多种网关分而治之。
![image.png](https://cdn.nlark.com/yuque/0/2022/png/153624/1652758508034-26ad5b69-15bf-4bdd-8643-908c90584da4.png#clientId=u1f24bd9c-2055-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=581&id=u8b39d1d8&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1162&originWidth=4448&originalType=binary&ratio=1&rotation=0&showTitle=false&size=277463&status=done&style=none&taskId=ub9bd596b-3822-4db4-9c8b-0aa1439497d&title=&width=2224)
蚂蚁集团下有许多不同的公司主体，分别服务于不同的业务场景，各主体有与之对应的站点来部署应用对外提供服务，南北向流量最常见的是互联网流量入口，这个角色在蚂蚁集团由 Spanner 承载。除了互联网流量入口之外，多个主体公司间也可能存在信息交互，在同一个集团内的多公司主体如果信息交互需要绕一道公网，稳定性会大打折扣，同时带宽费用也会更贵。为了解决跨主体的高效互通问题，我们通过 SOFAGW 搭建起了多主体间的桥梁，让跨主体的应用间通信和同主体内的 RPC 通信一样简单，同时还具备链路加密、鉴权、可审计等能力，保障多主体间调用合规。

![image.png](https://cdn.nlark.com/yuque/0/2022/png/153624/1652758507902-9bf69b1b-dfd8-44ce-9ee9-22d8442e7f53.png#clientId=u1f24bd9c-2055-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=292&id=u99a1d485&margin=%5Bobject%20Object%5D&name=image.png&originHeight=583&originWidth=2223&originalType=binary&ratio=1&rotation=0&showTitle=false&size=129476&status=done&style=none&taskId=u8055e83d-37ec-4ab5-84aa-a79a237a0cc&title=&width=1111.5)
SOFAGW 基于 MOSN 2.0 架构打造，既能使用 Golang 做高效研发，同时也能享受 Envoy 在 Http2 等协议处理上带来的超高性能。
![image.png](https://cdn.nlark.com/yuque/0/2022/png/153624/1652758508226-198d983d-6a6b-47c2-9f99-661c26858d9e.png#clientId=u1f24bd9c-2055-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=85&id=u223e7f33&margin=%5Bobject%20Object%5D&name=image.png&originHeight=123&originWidth=1089&originalType=binary&ratio=1&rotation=0&showTitle=false&size=30871&status=done&style=none&taskId=udc87e123-ae68-4ab5-b14f-cb11936906e&title=&width=751.5)
简单介绍一下 MOSN 2.0 架构，Envoy 提供了可扩展的 Filter 机制，来让用户可以在协议处理链路中插入自己的逻辑，MOSN 通过实现一层基于 CGO 的 Filter 扩展层，将 Envoy 的 Filter 机制进行了升级，我们可以用 Golang 来写 Filter 然后嵌入 Envoy 被 CGO 的 Filter 调用。
![image.png](https://cdn.nlark.com/yuque/0/2022/png/153624/1652758508198-288f8de3-740f-4975-86e2-274fd59a6a60.png#clientId=u1f24bd9c-2055-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=349&id=u9422a228&margin=%5Bobject%20Object%5D&name=image.png&originHeight=518&originWidth=1112&originalType=binary&ratio=1&rotation=0&showTitle=false&size=108857&status=done&style=none&taskId=u2c68fa54-2209-448f-b903-9eb97b11bc5&title=&width=749)
SOFAGW 在 MOSN 2.0 之上构建了自己的网关代理模型，通过 SOFA 的 Golang 客户端和控制面交互获取配置信息、服务发现信息等，然后重组成 Envoy 的 Cluster 模型通过 Admin API 插入 Envoy 实例中。通过 Golang 的 Filter 扩展机制，SOFAGW 实现了蚂蚁集团内部的 LDC 服务路由、压测流量识别、限流、身份认证、流量复制、调用审计等能力。由于 Envoy 的 Http2 协议处理性能相比纯 Golang GRPC 实现高出 2～4 倍，SOFAGW 选择将 Triple （Http2 on GRPC）协议处理交给 Envoy 来处理，将 Bolt （SOFA RPC 私有协议）协议的处理依然交给 MOSN 来处理。

通过上述架构，SOFAGW 实现了蚂蚁集团内部的全主体可信互通，在高性能和快速迭代开发间也取得了不错的平衡。

## 五、应用运行时探索

随着 Service Mesh 化的探索进入深水区，我们把很多能力沉淀到 Mesh 的数据面之后，也感受到每种协议直接下沉的便利性与局限性，便利在于应用完全不用改造就可以平滑接入，局限性是每种私有协议均需要独立对接，且使用了 A 协议的应用，并不能直接在 B 协议上运行。在多云的环境下，我们希望可以做到让应用 `Write Once，Run on any Cloud！`想要实现这一愿景，我们需要将应用与基础设施间进一步解耦，让应用不直接感知底层的具体实现，而是使用分布式语义 API 来编写程序。这种思想在社区已经有 Dapr 作为先行者在探索：

![image.png](https://cdn.nlark.com/yuque/0/2022/png/153624/1652758508317-b61c58e8-fb10-472d-91bf-c6a2ea60aeba.png#clientId=u1f24bd9c-2055-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=350&id=u767e27ac&margin=%5Bobject%20Object%5D&name=image.png&originHeight=495&originWidth=1049&originalType=binary&ratio=1&rotation=0&showTitle=false&size=127687&status=done&style=none&taskId=uada4b60b-9767-4152-b4b6-7d88155b052&title=&width=742.5)
（上图来自 Dapr 官方文档）
Dapr 提供了分布式架构下的各种原子 API，如服务调用、状态管理、发布订阅、可观测、安全等，并且实现了不同分布式原语在不同云上的对接实现组件。

![image.png](https://cdn.nlark.com/yuque/0/2022/png/153624/1652758509350-d42634c2-021c-4df8-8216-5fbfc0fd00e9.png#clientId=u1f24bd9c-2055-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=419&id=u39fcfc24&margin=%5Bobject%20Object%5D&name=image.png&originHeight=604&originWidth=1075&originalType=binary&ratio=1&rotation=0&showTitle=false&size=105791&status=done&style=none&taskId=u3c1331d5-3e78-42e6-b168-99112ace7e7&title=&width=745.5)
（上图来自 Dapr 官方文档）
Dapr 相当于是在 Service Mesh 之上提供给应用更加无侵入的分布式原语，2021 年中，我们基于 MOSN 开源了应用运行时 Layotto，Layotto 相当于是 Application Runtime 和 Service Mesh 的合集：
![image.png](https://cdn.nlark.com/yuque/0/2022/png/153624/1652758509359-ef68ee18-954d-4c76-825e-3cd3cf0f11ac.png#clientId=u1f24bd9c-2055-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=423&id=u792e6adf&margin=%5Bobject%20Object%5D&name=image.png&originHeight=605&originWidth=1075&originalType=binary&ratio=1&rotation=0&showTitle=false&size=111148&status=done&style=none&taskId=u8106c1b3-cbd8-45df-ab03-f4eea9ddb7e&title=&width=751.5)
我们通过 Layotto 抽象出应用运行时 API 将内部的 Service Mesh 演进至如下架构：

![image.png](https://cdn.nlark.com/yuque/0/2022/png/153624/1652758509468-cb09ecc0-24f1-4a2d-b426-dca3ec47994b.png#clientId=u1f24bd9c-2055-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=490&id=u0880b169&margin=%5Bobject%20Object%5D&name=image.png&originHeight=559&originWidth=855&originalType=binary&ratio=1&rotation=0&showTitle=false&size=51917&status=done&style=none&taskId=u56355195-fd60-47d6-8566-3d092db1b34&title=&width=749.5)

当然应用运行时是一个新的概念，如果这一层 API 抽象做不到足够中立，那么依然需要面临使用方需要 N 选 1 的局面，所以我们也在和 Dapr 社区一起制定 Application Runtime API 的标准，组织 Dapr Sig API Group 用于推进 API 的标准化，也期望能有更多感兴趣的同学一同加入。

![image.png](https://cdn.nlark.com/yuque/0/2022/png/153624/1652758509626-107774b6-980b-4aa8-bb15-f05739e773b8.png#clientId=u1f24bd9c-2055-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=490&id=u628e2bd1&margin=%5Bobject%20Object%5D&name=image.png&originHeight=606&originWidth=955&originalType=binary&ratio=1&rotation=0&showTitle=false&size=156432&status=done&style=none&taskId=ud7950787-5b0f-464c-a544-63c85be7f08&title=&width=772.5)
期待未来大家的应用都可以 `Write once, Run on any Cloud！`。

## 六、Mesh 2.0 探索

2022 年我们继续向前探索，基于 MOSN 2.0 我们有了高性能的网络底座、易于扩展的 Mesh 数据面，基于 Layotto 我们有了无厂商绑定的应用运行时。

![image.png](https://cdn.nlark.com/yuque/0/2022/png/153624/1652758509653-8caf90f3-8ed1-487c-8065-05e0116aad30.png#clientId=u1f24bd9c-2055-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=113&id=u4fe80ee7&margin=%5Bobject%20Object%5D&name=image.png&originHeight=225&originWidth=1708&originalType=binary&ratio=1&rotation=0&showTitle=false&size=71794&status=done&style=none&taskId=ubf9ddf95-e940-422b-add9-99c4a92f098&title=&width=854)
下一步我们期望基于 eBPF 实现 Mesh 数据面的进一步下沉，从 Pod 粒度下沉到 Node 粒度，同时服务于更多场景，如 Function、Serverless，另外基于 MOSN 2.0 的良好扩展能力，我们希望能进一步尝试将业务应用相对通用的能力也可以沉淀下来，作为 Mesh 数据面的自定义插件来为更多应用提供服务，帮助业务实现相对通用的业务能力也可以快速迭代升级。

![image.png](https://cdn.nlark.com/yuque/0/2022/png/153624/1652758510352-7f4ce350-8371-401a-bf54-50de9dea8b18.png#clientId=u1f24bd9c-2055-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=503&id=u1a3a0068&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1006&originWidth=1616&originalType=binary&ratio=1&rotation=0&showTitle=false&size=108379&status=done&style=none&taskId=u4bb43ade-50a0-4f60-9b5d-ff3fb8b6648&title=&width=808)

相信在不远的未来，Mesh 2.0 可以在蚂蚁集团内部服务众多通用场景，也能给社区带来一些新的可能。以上是本次分享的所有内容，希望大家能从对蚂蚁集团 Service Mesh 的发展过程的交流中有所收获。
