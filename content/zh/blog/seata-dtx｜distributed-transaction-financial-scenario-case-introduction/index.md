---
title: "Seata-DTX｜分布式事务金融场景案例介绍"
authorlink: "https://github.com/sofastack"
description: "Seata-DTX｜分布式事务金融场景案例介绍"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2023-06-27T15:00:00+08:00
cover: "https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*KDQNSqJ0FZgAAAAAAAAAAAAADrGAAQ/original"
---

![图片](https://mmbiz.qpic.cn/mmbiz_gif/nibOZpaQKw09ARcsGuzib3ttcN4LZpdAC0n9KTQp7uibF8ia0ibk3Olf3sib50ExibicicOrzCOVrOyUD2dFib84f0fTx5uA/640?wx_fmt=gif&wxfrom=5&wx_lazy=1)

文｜魏陈豪（花名：无陈 Sam)

蚂蚁集团 SOFAStack 产品专家

![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/nibOZpaQKw08ltoD5nlfBTezc8MhmiaB8EV018RJT5M1TAT6Hy4EwIiajXsibrzulqQKyeY6wdQ6kjq2LVRmZicB5bw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

**本文** **2966** **字 阅读 8** **分钟**

## 序言

今天给大家带来一篇 Seata-DTX[1] 商业版分布式事务在金融行业如何保证事务一致性的实践介绍。从一个全局视角出发看看一致性的保证、分别有哪些节点，事务组件在其中处在一个什么位置、担任什么工作。

## 分布式系统下的事务问题阐述

云原生应用以分布式系统为主，应用会被切分到多个分布式的微服务系统下。拆分一般分为水平拆分和垂直拆分，这并不仅仅单指对数据库或者缓存的拆分，主要是表达一种分而治之的思想和逻辑。

分布式系统的底层无法逃离“CAP 的不可能三角”*（C: Consistency，一致性；A: Availability，可用性；P: Partition Tolerance，分区容忍性）*。CAP 原理证明，任何分布式系统只可同时满足以上两点，无法三者兼顾。而分布式的服务化系统都需要满足分区容忍性，那么必须在一致性和可用性之间进行权衡。

如果网络发生异常情况，导致分布式系统中部分节点之间的网络延迟不断增大，可能会导致分布式系统出现网络分区。复制操作可能会被延后，如果这时我们的使用方等待复制完成再返回，则可能导致在有限时间内无法返回，就失去了可用性；如果使用方不等待复制完成，而在主分片写完后直接返回，则具有了可用性，但是失去了一致性。

![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/nibOZpaQKw08ltoD5nlfBTezc8MhmiaB8EeMf3ZYNIezLMh5he4sX3CGDK1u6BNFya1GpQN68iaSJIm5XKjIK1buw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

图 1 CAP 理论

图片出处：[https://lushunjian.github.io/blog/2018/06/20/CAP%E7%90%86%E8%AE%BA/](https://lushunjian.github.io/blog/2018/06/20/CAP%E7%90%86%E8%AE%BA/)

## 金融机构对一致性的诉求

对金融机构而言，架构层面的高可用和业务层面的强一致性，几乎同样重要。这就需要金融级云原生能够很好地平衡“CAP 的不可能三角”，需要尽可能兼顾业务强一致与系统高可用。

但是“一致性挑战”在分布式系统中绝不仅仅是一个数据库问题，而是一个大的话题。其涵盖分布式系统的各个层面：事务一致性、节点一致性、系统间业务一致性、消息幂等一致性、缓存一致性、跨 IDC 一致性等等。所以也需要云原生架构有一系列技术能够应对金融级对一致性的严苛挑战。

## 一致性控制的几个重要维度

这里挑选几个常见的金融场景下需要解决的一致性维度进行阐述。

**事务级**：事务级别的一致性控制需要根据不同的金融场景选择合适的分布式事务模式。在我们针对 Seata-DTX 的客户进行调研后，发现大多数客户在平衡成本和性能后，基于 SAGA 和 TCC 是目前金融机构比较常用的两种分布式事务模式。SAGA 模式对应用实现侵入性更小，但基于补偿事务来保障一致性的设计、前后步骤执行过程中不保证事务隔离性；而 TCC 模式能做到比较好的事务隔离性，但需要应用层感知更多的复杂度。

对于事务流程中部分不需要同步返回结果的节点，为提高执行效率可采用异步消息队列实现，对于一些事务流程较长的场景可明显降低事务实现复杂度、削峰填谷。典型场景如客户购买理财场景简化分为存款账户扣款和理财账户入账两个步骤，若选用 SAGA 模式，存款账户成功扣款后、理财账户入账失败，客户会看到“钱已付、货没到”的中间异常状态，需要系统进行冲正存款账户扣款来保障事务一致性。如选用 TCC 模式，先后完成存款账户扣款、理财账户入账的逻辑处理，各自需要存款系统和理财系统记录逻辑处理的状态，二者均成功后再发起统一提交。

**数据库级**：接下来是数据库层面，金融场景下对于数据不丢有着极致的要求：一方面需要在同城、异地多个机房保存多个副本，另一方面需要在多个副本之间实现数据同步，Seata-DTX 的高可用也是依赖数据库之间的数据同步进行保障的。整体作用是以防一个 Seata-DTX 事务集群宕机后，切换到另外一套 Seata-DTX 事务集群后，可以恢复到正在进行中的事务记录，保障同城分布式事务的 RPO 为零、异地 RPO 接近零。数据库同步中，如果使用的是分布式事务库，分布式数据库一般通过对 Paxos 的支持来实现跨多服务器，甚至跨多中心的数据一致性保证。

**机房级**：跨机房的路由能力、异常事务的跨机房恢复能力。发生机房故障时，数据库需要能够切到同城/异地的副本、并保障 RPO 为零，配合应用层的交易路由切换，完成机房级容灾切换、恢复业务。期间因机房故障导致的部分交易事务流程中断，分布式事务组件需要具备自动恢复能力，重新启动中断的事务流程按事先设定的业务规则向前完成或向后冲正。

## 真实金融客户案例

以某资产规模超过 2 万亿元的省级农信为例，来看一下在核心整体下移的过程中，如何使用事务、配合数据库，机房容灾进行一致性控制。

首先介绍一下整体的业务架构，在新核心平台中，大致可以分为产品服务层、交易中心层、交易中台层，如图 1 所示。交易中心收口所有的交易流程，对产品服务提供交易能力。最下面是交易原子能力层，主要包含 8 个中台，中台不直接对上提供服务，由交易中心统一处理。整个交易中心的能力，都基于服务编排构建，在编排流程中使用 SAGA 事务进行流程一致性控制。

![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/nibOZpaQKw08ltoD5nlfBTezc8MhmiaB8E7EVfATIib0NFsp0ZtGEbgZelicWHc9bjFcULodrybmwKdBibLM5ibPV6zQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

图 2 分布式新核心下移平台分层架构

以贷款产品为例：整体的贷款支取、还款等长流程在信贷产品系统中，由 SAGA 事务进行串联，核心的资金交换部分由 TCC 事务把控一致性，做到对整体长流程里多个应用实现较小的侵入性。但基于补偿事务来保障一致性的设计、前后步骤执行过程中不保证事务隔离性，因此用 TCC 模式来处理对隔离性有较强诉求的核心资金交换服务，如图 3 所示。

![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/nibOZpaQKw08ltoD5nlfBTezc8MhmiaB8E5Gh6NvVAkZOFfUoQoKO14Uhj2fWKZKyuGzUSMV4wdcqVgCZxhicMWnw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

图 3 核心下移智能贷款系统流程

如下图 4 是上述图 3 信贷产品中的还贷流程 TCC 流程示例。启动 TCC 事务后，使用 try 先尝试锁定客户账户余额，锁定成功后，等待二阶段提交。尝试 try 换贷款利息，锁定成功。整体提交事务，进行二阶段的扣账 confirm，以及还利息 confirm。

![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/nibOZpaQKw08ltoD5nlfBTezc8MhmiaB8ENmicbptTKE425oH7c7MHdDwjaRLsMvBIZfUV9QUlQXQKRva18qS44ag/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

图 4 核心下移智能贷款 TCC 流程

事务层面的一致性进行了保证后，针对客户的 2 地机房进行事务的高可用部署，如图 5 所示。

![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/nibOZpaQKw08ltoD5nlfBTezc8MhmiaB8ERk1Lmjk0IyPs72p5aTjmvd7m05WLlvynlYJUPsHEfsjtlC0Lwu7KicQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

图 5 金融级云原生分布式事务部署架构

Console 是分布式事务的配置控制台，用户访问时通过 VIP 路由到不同机房的 console，数据写入到主 DB，主备 DB 数据实时同步。

Seata-DTX Server 为分布式事务异库模式下的事务控制器和事务恢复器。其主要是记录事务日志，发起二阶段调用以及异常事务的恢复任务。

业务应用用过 VIP 获取 Seata-DTX Server 对应的 IP。事务发起方发起事务时，事务日志都写入到主 DB 中，数据同步到备 DB。

当福州 IDC 宕机或者断电时，流量会全部路由到上海 IDC。备数据库中因为有主 DB 的所有事务记录，当控制台查看事务数据和发起恢复事务任务时，仍然能正常执行。*（当然可能会有人问这个情况下会不会频繁出现跨机房的分布式事务影响性能，此处负载均衡会基于入口流量的单元信息，自动调拨流量到对应的机房。此处不过多进行阐述。）*

综上可以看出，当前 Seata-DTX 的架构设计中，不单单是在事务层面去控制一致性。当有多个地域，多个副本时，可能需要结合数据库保证事务数据的一致。在多机房的情况下，需要依赖容灾能力，保证交易事务的流程可恢复。

[1]Seata-DTX：

[https://help.aliyun.com/document_detail/132903.html?spm=a2c4g.132901.0.0.4bcb3c9b6bg9ik](https://help.aliyun.com/document_detail/132903.html?spm=a2c4g.132901.0.0.4bcb3c9b6bg9ik)

**Seata Star 一下** ✨

[https://github.com/seata/seata](https://github.com/seata/seata)

## 推荐阅读

1.[Seata Saga 模式快速入门和最佳实践](https://mp.weixin.qq.com/s/cGi2wzCroMVHhPgvqASlBQ)

2.[生产环境可用的 Seata-go 1.2.0 来啦！！！](https://mp.weixin.qq.com/s/T2GPFGNwseU2wLmwq8EdGw)

3.[Seata-go 1.1.0 发布，补齐 AT 模式支持](https://mp.weixin.qq.com/s/pawPQ9BU6SbG-rpGnQV0mQ)

4.[Seata AT 模式代码级详解](https://mp.weixin.qq.com/s/qicDuZPhbGbKgUAbvZNemQ)

![图片](https://mmbiz.qpic.cn/sz_mmbiz_jpg/nibOZpaQKw08ltoD5nlfBTezc8MhmiaB8EAE6NEfnbCibQZj7jppE9Do0un1DEsgsgrnzknvXp6Y1Wu3SaDlVgbnw/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)
