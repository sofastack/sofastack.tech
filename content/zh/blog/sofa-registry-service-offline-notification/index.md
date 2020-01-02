---
title: "服务注册中心如何实现秒级服务上下线通知 | SOFARegistry 解析"
author: "米麒麟"
authorlink: "https://github.com/SteNicholas"
description: " 本文为《剖析 | SOFARegistry 框架》第六篇，作者米麒麟"
categories: "SOFARegistry"
tags: ["SOFARegistry","剖析 | SOFARegistry 框架","SOFALab"]
date: 2020-01-02T17:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1577954736330-d5e1dc33-c58e-4b2f-9223-d79ed01810f7.jpeg"
---

> SOFAStack （**S**calable **O**pen **F**inancial  **A**rchitecture Stack） 是蚂蚁金服自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，是在金融场景里锤炼出来的最佳实践。

![SOFA：RegistryLab](https://cdn.nlark.com/yuque/0/2019/png/226702/1577264920254-b174e81d-d3cd-4e2a-90d3-d5f18cda6cad.png)

SOFARegistry 是蚂蚁金服开源的具有承载海量服务注册和订阅能力的、高可用的服务注册中心，在支付宝/蚂蚁金服的业务发展驱动下，近十年间已经演进至第五代。

本文为《剖析 | SOFARegistry 框架》第六篇，**本篇作者子懿，来自阿里云**。《剖析 | SOFARegistry 框架》系列由 SOFA 团队和源码爱好者们出品，项目代号：<SOFA:RegistryLab/>，文末包含往期系列文章。

GitHub 地址：[https://github.com/sofastack/sofa-registry](https://github.com/sofastack/sofa-registry)

## 前言

微服务架构为了保证所有服务可用，当服务发生问题时能及时摘除有问题的服务，需要定期检测服务可用性即健康检测。健康检测包括客户端心跳和服务端主动探测两种方式，定期发送 TCP 或 HTTP 请求根据响应确定服务是否正常。服务注册中心提供服务注册和订阅服务，在服务发布者服务信息发生变化、或者节点上下线时通知变更，动态更新消费方的服务地址列表信息，支持服务注册和下线的快速变更通知。

本文重点围绕服务的健康检测、SOFARegistry 的健康检测以及基于 SOFARegistry 实现秒级服务注册下线等方面剖析 SOFARegistry 如何实现秒级服务上下线通知原理，阐述如何使用 SOFARegistry 对于服务的注册下线场景通过推送机制快速实现端到端的传达功能：

- 如何实现服务的健康检测？业界服务注册中心的健康机制是怎样的？SOFARegistry 的健康检测实现方式？
- SOFARegistry 服务注册下线数据流转过程是怎样的？SOFARegistry 内部角色如何实现秒级服务上下线通知？

## 服务的健康检测

服务的健康检测是如何实现？健康检测分为客户端心跳和服务端主动探测两种方式：

- **客户端心跳**
  - 客户端采取每隔一定时间间隔主动发送心跳方式向服务端表明自己的服务状态正常，心跳是 TCP 或者 HTTP 的形式；
  - 通过维持客户端和服务端的 Socket 长连接自己实现客户端心跳的方式；
  - ZooKeeper 没有主动的发送心跳，而是依赖组件本身提供的临时节点的特性，通过 ZooKeeper 连接的 Session 维持临时节点；
  - 客户端心跳中长连接的维持和客户端的主动心跳偏重服务链路是否正常，不一定是服务状态正常；服务端主动调用服务健康检查是比较准确的方式，通过返回结果成功判断服务状态健康情况；
- **服务端主动探测**
  - 服务端调用服务发布者 HTTP 接口来完成健康检测；
  - 对于没有提供 HTTP 服务的 RPC 应用，服务端调用服务发布者的接口来实现健康检测；
  - 通过执行脚本形式来进行定时检测；
  - 服务端主动探测依然存在问题。服务注册中心主动调用 RPC 服务的某个接口无法做到通用性；在很多场景下服务注册中心到服务发布者的网络是不通的，服务端无法主动发起健康检查；

### 注册中心的健康检测

业界服务注册中心的健康检测机制：

- Eureka：定期有 Renew 心跳，数据具有 TTL（Time To Live）；并且支持自定义 HealthCheck 机制，当 HealthCheck 检测出系统不健康时主动更新 Instance 的状态；
- Zookeeper：定期发送连接心跳以保持会话 （Session），会话本身 （Session） 具有TTL；
- Etcd：定期通过 HTTP 对数据进行 Refresh，数据具有 TTL。申请 Lease 租约，设置服务生存周期TTL；
- Consul：Agent 定期对服务进行 healthcheck，支持 HTTP/TCP/Script/Docker；由服务主动定期向 agent 更新 TTL；

### SOFARegistry 的健康检测

业界服务注册中心的健康检测都有个共同的关键词：“定期”。定期检测的时间周期通常设置为秒级，比如 3 秒、5 秒或 10 秒，甚至更长，也就是说服务的健康状态总是滞后的。蚂蚁金服的注册中心从最初的版本设计开始，就把健康状态的及时感知，当做一个重要的设计目标，特别是需要做到“服务宕机能被及时发现”。因此 SOFARegistry 在健康检测的设计方面决定“服务数据与服务发布者的实体连接绑定在一起，断连马上清数据”，简称此特点叫做连接敏感性。连接敏感性是指在 SOFARegistry 里所有 Client 都与 SessionServer 保持长连接，每条长连接都设置基于 SOFABolt 的连接心跳，如果长连接断连客户端立即发起重新建连，时刻保持 Client 与 SessionServer 之间可靠的连接。

SOFARegistry 将服务数据 （PublisherRegister） 和服务发布者 （Publisher） 的连接的生命周期绑定在一起：每个 PublisherRegister 定义属性 connId，connId 由注册本次服务的 Publisher 的连接标识 （IP 和 Port）构成，也就是只要该 Publisher 和 SessionServer 断连，服务信息数据即失效。客户端重新建连成功后重新注册服务数据，重新注册的服务数据会被当成新的数据，考虑更换长连接后 Publisher 的 connId 是 Renew 新生成的。

譬如当服务的进程宕机时，一般情况下 OS 立刻断开进程相关的连接（即发送 FIN），因此 SessionServer 能够实时感知连接断开事件，然后把该 connId 相关的所有 PublisherRegister 都清除，并且及时推送给所有服务订阅者 （Subscriber）。如果只是网络问题导致连接断开，实际的服务进程没有宕机，此时客户端立即发起重新连接 SessionServer 并且重新注册所有服务数据。对服务订阅者本身来说接收到的是服务发布者经历短暂的服务下线后以及再次重新上线。假如此过程耗时足够短暂（例如 500ms 内发生断连和重连），服务订阅者可能感受不到服务下线，因为 DataServer 内部的数据通过 mergeDatum 延迟合并变更的 Publisher 服务信息，version 是合并后最新的版本号。

## 服务上下线过程

服务的上下线过程是指服务通过代码调用执行常规注册（Publisher#register） 和下线（Publisher#unregister）操作，不考虑因为服务宕机等意外情况导致的下线场景。

“一次服务注册过程”的服务数据在 SOFARegistry 内部流转过程：

![“一次服务注册过程”](https://cdn.nlark.com/yuque/0/2019/png/156670/1574156293130-a47d76e8-674e-486a-9ad0-36c34a3f5017.png)

1. 客户端 Client 调用服务发布者 Publisher 的 register 向 SessionServer 注册服务。
1. SessionServer 接收到服务数据即 PublisherRegister 写入内存 （SessionServer 存储 Client 的服务数据到内存，用于后续跟 DataServer 做定期检查），接着根据 dataInfoId 的一致性 Hash 寻找对应的 DataServer，将 PublisherRegister 发送给 DataServer。
1. DataServer 接收到 PublisherRegister 数据首先也是把数据写入内存 ，DataServer 以 dataInfoId 的维度汇总所有 PublisherRegister。同时 DataServer 将该 dataInfoId 的变更事件通知给所有 SessionServer，变更事件内容包括 dataInfoId 和版本号信息 version 等。
1. DataServer 同时异步以 dataInfoId 维度增量同步数据给其他副本，考虑到 DataServer 在一致性 Hash 分片的基础上对每个分片保存多个副本（默认是3个副本）。
1. SessionServer 接收到变更事件通知对比 SessionServer 内存中存储的 dataInfoId 的版本号 version，若发现比 DataServer 发送的版本号小则主动向 DataServer 获取 dataInfoId 的完整数据，即包含所有该 dataInfoId 具体的 PublisherRegister 服务列表。
1. SessionServer 把数据推送给对应的客户端 Client，Client 即接收到此次服务注册之后最新服务列表数据。

“一次服务下线过程”的服务数据在 SOFARegistry 内部流转过程：

![“一次服务下线过程”](https://cdn.nlark.com/yuque/0/2019/png/156670/1574229159529-dd59fa6c-fb46-4ee9-b56e-0b07c64c3794.png)

1. 客户端 Client 调用服务发布者 Publisher 的 unRegister 向 SessionServer 下线服务。
1. SessionServer 获取到服务数据 PublisherRegister 按照 Publisher 注册 Id 删除内存服务信息数据，然后根据 dataInfoId 的一致性 Hash 寻找对应的 DataServer，将 PublisherRegister 发送给 DataServer。
1. DataServer 获取到 PublisherRegister 数据首先删除内存服务信息数据，DataServer 以 dataInfoId 的维度汇总所有 PublisherRegister。同时 DataServer 将该 dataInfoId 的变更事件通知给所有 SessionServer，变更事件内容包括 dataInfoId 和版本号信息 version 等。
1. DataServer 同时异步以 dataInfoId 维度增量同步给其他副本数据。
1. SessionServer 接收到变更事件通知对比 SessionServer 内存中存储的 dataInfoId 的版本号 version，若发现比 DataServer 发送的版本号小则主动向 DataServer 获取 dataInfoId 的完整数据，即包含所有该 dataInfoId 具体的 PublisherRegister 服务列表。
1. SessionServer 推送服务数据给对应的客户端 Client，Client 即接收到这次服务下线之后最新服务列表数据。

“一次断连下线过程”的服务数据在 SOFARegistry 内部流转过程：

![“一次断连下线过程”](https://cdn.nlark.com/yuque/0/2019/jpeg/156670/1577663492808-1df7bc1f-9b95-4b48-ac66-0ead54ebe32b.jpeg)

1. 客户端 Client 节点断连下线调用连接处理器 fireCancelClient 触发取消客户端，通过连接客户端线程池检查连接缓存执行 SessionRegistry 取消客户端连接，避免阻塞连接 ConnectionEventExecutor 线程池。
1. SessionRegistry 通过 SessionDataStore 轮询注册中心服务发布者 Publisher 删除本地存储的连接，使用 SessionInterests 遍历服务订阅者 Subscriber 移除指定连接消费者，调用 SessionWatchers 失效连接监听者 Watcher。
1. WriteDataAcceptor 负责处理 DataServer 写操作包括 ClientOff，SessionRegistry 异步调用 WriteDataAcceptor 同步 DataServer 客户端断连数据。DataServer 新建写数据处理器 WriteDataProcessor 将 ClientOff 写请求放入队列处理。
1. WriteDataProcessor 根据写请求类型为 CLIENT_OFF 调用 doClientOffAsync 发送 CANCEL_DATA_TASK 事件，CancelDataTaskListener 监听取消数据任务事件创建 CancelDataTask 任务提交给 Dispatcher 攒批处理。SessionServer 通过 CancelDataTask 调用 clientOff 暂停客户端节点并且移除所有 DataServer 已经注册的数据，轮询本地 DataCenter 数据节点构建客户端下线请求提交给 DataNodeExchanger 获取 DataServer 客户端连接发起请求。
1. DataServer 接收 ClientOff 请求采用 DatumLeaseManager 停止连接对应任务，提交 DataChangeEventQueue 队列客户端断连事件。DataChangeEventQueue 启动线程调用 handleClientOff 处理客户端变更事件，通过 DatumCache 获取指定连接的服务发布者，轮询 Publisher 构建数据变更类型为 MERGE 且数据来源类型为 PUB 的 UnPublisher Datum，更新 Publisher 和 Datum 缓存。

基于 SOFARegistry 上下线服务数据流转流程，整理 SOFARegistry 内部角色之间的数据交互方式：

- SessionServer 和 DataServer 之间的通信采用基于推拉结合的机制
  - 推：DataServer 在服务数据有变化时主动通知 SessionServer，SessionServer 检查确认需要更新（对比版本号 version） 主动向 DataServer 获取数据。
  - 拉：除了上述的 DataServer 主动推以外，SessionServer 每隔一定的时间间隔（默认30秒）主动向 DataServer 查询所有 dataInfoId 的 version 信息，再对比 SessionServer 内存的版本号 version，若发现 version 有变化则主动向 DataServer 获取数据。这个“拉”的逻辑，主要是对“推”的一个补充，若在“推”的过程有错漏的情况可以在这个时候及时弥补。

- Client 与 SessionServer 之间的通信使用基于推的机制
  - SessionServer 在接收到 DataServer 的数据变更推送，或者 SessionServer 定期查询 DataServer 发现数据有变更并且重新获取之后，直接将 dataInfoId 的数据推送给 Client。如果此过程由于网络原因没能成功推送给 Client，SessionServer 尝试做指定次数（默认是5次）的重试，最终还是失败的话依然会在 SessionServer 定期每隔 30s 轮训 DataServer 时再次推送服务数据给 Client。

![服务数据流转流程](https://cdn.nlark.com/yuque/0/2019/png/156670/1574223950704-a89fbe25-3de2-4304-bd2d-4f97aea18895.png)

## 总结

本文围绕服务的健康检测，服务上下线过程以及基于 SOFARegistry 通知服务上下线方面阐述 SOFARegistry 实现秒级服务上下线通知基本原理，剖析服务的健康检测通过连接敏感的特性对服务宕机做到秒级发现，概括 SOFARegistry 内部角色之间的“推”和“拉”的机制，服务上下线流程以实时的“推”为主做到秒级通知机制。

## SOFARegistryLab 系列阅读

- [服务注册中心 Session 存储策略 | SOFARegistry 解析](/blog/sofa-registry-session-storage/)
- [服务注册中心数据分片和同步方案详解 | SOFARegistry 解析](/blog/sofa-registry-data-fragmentation-synchronization-scheme/)
- [服务注册中心 MetaServer 功能介绍和实现剖析 | SOFARegistry 解析](/blog/sofa-registry-metaserver-function-introduction/)
- [服务注册中心 SOFARegistry 解析 | 服务发现优化之路](/blog/sofa-registry-service-discovery-optimization/)
- [海量数据下的注册中心 - SOFARegistry 架构介绍](/blog/sofa-registry-introduction/)