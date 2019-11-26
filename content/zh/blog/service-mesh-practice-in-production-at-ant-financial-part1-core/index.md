---
title: "蚂蚁金服 Service Mesh 大规模落地系列 - 核心篇"
author: "烈元"
authorlink: "https://github.com/taoyuanyuan"
description: " 当 Service Mesh 遇到双十一又会迸发出怎样的火花？蚂蚁金服的 LDC 架构继续演进的过程中，Service Mesh 要承载起哪方面的责任？让我们一起来揭秘蚂蚁金服 Service Mesh 双十一实战。"
categories: "Service mesh"
tags: ["Service mesh","Service Mesh 落地实践"]
date: 2019-11-15T09:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1573812723435-55069daf-6efe-49ba-80d3-8785d83ed6ee.jpeg"
---

![Service Mesh 落地实践-核心篇](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1573714591702-61c57653-e199-40a0-b594-fb910e84213f.jpeg)

## 揭秘 2019 Service Mesh 双十一大考

蚂蚁金服很早开始关注 Service Mesh，并在 2018 年发起 ServiceMesher 社区，目前已有 4000+ 开发者在社区活跃。在技术应用层面，Service Mesh 的场景已经渡过探索期，今年已经全面进入深水区探索。

2019 年的双十一是我们的重要时刻，我们进行了大规模的落地。作为技术人能面对世界级的流量挑战，是非常紧张和兴奋的。当 Service Mesh 遇到双十一又会迸发出怎样的火花？蚂蚁金服的 LDC 架构继续演进的过程中，Service Mesh 要承载起哪方面的责任？让我们一起来揭秘蚂蚁金服 Service Mesh 双十一实战。

## Service Mesh 基础概念

Istio 清晰的描述了 Service Mesh 最核心的两个概念：数据面与控制面。数据面负责做网络代理，在服务请求的链路上做一层拦截与转发，可以在链路中做服务路由、链路加密、服务鉴权等，控制面负责做服务发现、服务路由管理、请求度量（放在控制面颇受争议）等。

Service Mesh 带来的好处不再赘述，我们来看下蚂蚁金服的数据面和控制面产品：

1. **数据面：SOFAMosn。**蚂蚁金服使用 Golang 研发的高性能网络代理，作为 Service Mesh 的数据面，承载了蚂蚁金服双十一海量的核心应用流量。

2. **控制面：SOFAMesh。**Istio 改造版，落地过程中精简为 Pilot 和 Citadel，Mixer 直接集成在数据面中避免多一跳的开销。

## 双十一落地情况概览

今年，蚂蚁金服的核心应用全面接入 SOFAMosn，生产 Mesh 化容器几十万台，双十一峰值 SOFAMosn 承载数据规模数千万 QPS，SOFAMosn 转发平均处理耗时 0.2ms。

![双十一落地数据](https://cdn.nlark.com/yuque/0/2019/png/226702/1573700732619-e9a60005-2f79-4cba-a25e-132ae2df744e.png)

在如此大规模的接入场景下，我们面对的是极端复杂的场景，同时需要多方全力合作，更要保障数据面的性能稳定性满足大促诉求，整个过程极具挑战。

同时，Service Mesh 的落地也是一个跨团队合作的典范案例，集合了核心、RPC、消息、无线网关、控制面、安全、运维、测试等团队的精诚合作，接下来我们会按照以上几个模块来解析 Service Mesh 的双十一落地情况，更多解析关注本网站。

本文为《蚂蚁金服 Service Mesh 落地实践系列》第一篇 - 核心篇，作者：田阳（花名：烈元），蚂蚁金服技术专家，专注于高性能网络服务器研发，Tengine 开源项目核心成员，蚂蚁金服开源 SOFAMosn 项目核心成员。

## 基础能力建设

### SOFAMosn 的能力大图

SOFAMosn 主要划分为如下模块，包括了网络代理具备的基础能力，也包含了 XDS 等云原生能力。

![SOFAMosn 的能力大图](https://cdn.nlark.com/yuque/0/2019/png/226702/1573700732557-8cbee731-113a-479a-a532-595aa9d87348.png)

### 业务支持

SOFAMosn 作为底层的高性能安全网络代理，支撑了 RPC，MSG，GATEWAY 等业务场景。

![业务支持](https://cdn.nlark.com/yuque/0/2019/png/226702/1573700732603-2044a13c-fc2d-4c4f-a153-80a70aaa9129.png)

### IO 模型

SOFAMosn 支持两种 IO 模型，一个是 Golang 经典模型，goroutine-per-connection；一个是 RawEpoll 模型，也就是 Reactor 模式，I/O 多路复用(I/O multiplexing) + 非阻塞 I/O(non-blocking I/O)的模式。

在蚂蚁金服内部的落地场景，连接数不是瓶颈，都在几千或者上万的量级，我们选择了 Golang 经典模型。而对于接入层和网关有大量长链接的场景，更加适合于 RawEpoll 模型。

![IO 模型](https://cdn.nlark.com/yuque/0/2019/png/226702/1573700732581-9ae58f16-5dc3-46ec-b63c-0fedfaa7ea19.png)

![RawEpoll 模型](https://cdn.nlark.com/yuque/0/2019/png/226702/1573700732590-c76fe44f-0811-40a3-896f-1c2764df450a.png)

### 协程模型

![协程模型](https://cdn.nlark.com/yuque/0/2019/png/226702/1573700732655-ab4984ac-6245-495f-b5ca-5ba4bb89cded.png)

- 一条 TCP 连接对应一个 Read 协程，执行收包，协议解析；
- 一个请求对应一个 worker 协程，执行业务处理，proxy 和 Write 逻辑；

常规模型一个 TCP 连接将有 Read/Write 两个协程，我们取消了单独的 Write 协程，让 workerpool 工作协程代替，减少了调度延迟和内存占用。

### 能力扩展

**协议扩展**

SOFAMosn 通过使用同一的编解码引擎以及编/解码器核心接口，提供协议的 plugin 机制，包括支持：

- SOFARPC；
- HTTP1.x/HTTP2.0；
- Dubbo；

**NetworkFilter 扩展**

SOFAMosn 通过提供 network filter 注册机制以及统一的 packet read/write filter 接口，实现了 Network filter 扩展机制，当前支持：

- TCP proxy；
- Fault injection；

**StreamFilter 扩展**

SOFAMosn 通过提供 stream filter 注册机制以及统一的 stream send/receive filter 接口，实现了 Stream filter 扩展机制，包括支持：

- 流量镜像；
- RBAC鉴权；

### TLS 安全链路

作为金融科技公司，资金安全是最重要的一环，链路加密又是其中最基础的能力，在 TLS 安全链路上我们进行了大量的调研测试。

通过测试，原生的 Go 的 TLS 经过了大量的汇编优化，在性能上是 Nginx(OpenSSL）的80%，Boring 版本的 Go(使用 cgo 调用 BoringSSL) 因为 cgo 的性能问题， 并不占优势，所以我们最后选型原生 Go 的 TLS，相信 Go Runtime 团队后续会有更多的优化，我们也会有一些优化计划。

![TLS 安全链路](https://cdn.nlark.com/yuque/0/2019/png/226702/1573700732612-e8ea5910-d680-49a5-bfd3-94bee142a8db.png)

- go 在 RSA 上没有太多优化，go-boring（CGO）的能力是 go 的1倍；
- p256 在 go 上有汇编优化，ECDSA 优于go-boring；
- 在 AES-GCM 对称加密上，go 的能力是 go-boring 的20倍；
- 在 SHA、MD 等 HASH 算法也有对应的汇编优化；

为了满足金融场景的安全合规，我们同时也对国产密码进行了开发支持，这个是 Go Runtime 所没有的。虽然目前的性能相比国际标准 AES-GCM 还是有一些差距，大概是 50%，但是我们已经有了后续的一些优化计划，敬请期待。

![能力对比](https://cdn.nlark.com/yuque/0/2019/png/226702/1573700732619-2df9b732-78ae-4d78-839e-5e5e3037e448.png)

### 平滑升级能力

为了让 SOFAMosn 的发布对应用无感知，我们调研开发了平滑升级方案，类似 Nginx 的二进制热升级能力，但是有个最大的区别就是 SOFAMosn 老进程的连接不会断，而是迁移给新的进程，包括底层的 socket FD 和上层的应用数据，保证整个二进制发布过程中业务不受损，对业务无感知。除了支持 SOFARPC、Dubbo、消息等协议，我们还支持 TLS 加密链路的迁移。

**容器升级**

基于容器平滑升级 SOFAMosn 给了我们很多挑战，我们会先注入一个新的 SOFAMosn，然后他会通过共享卷的 UnixSocket 去检查是否存在老的 SOFAMosn，如果存在就和老的 SOFAMosn 进行连接迁移，然后老的 SOFAMosn 退出。这一块的细节较多，涉及 SOFAMosn 自身和 Operator 的交互。

![容器升级](https://cdn.nlark.com/yuque/0/2019/png/226702/1573700732824-1831c6ee-c02f-4124-bebe-3906bcc70f81.png)

**SOFAMosn 的连接迁移**

连接迁移的核心主要是内核 Socket 的迁移和应用数据的迁移，连接不断，对用户无感知。

![SOFAMosn 连接迁移](https://cdn.nlark.com/yuque/0/2019/png/226702/1573700732605-52609020-45d0-4ead-9fba-27fcab67180e.png)

**SOFAMosn 的 metric 迁移**

我们使用了共享内存来共享新老进程的 metric 数据，保证在迁移的过程中 metric 数据也是正确的。

![SOFAMosn 的 Metric 迁移](https://cdn.nlark.com/yuque/0/2019/png/226702/1573700732636-0975a128-8e0b-43b9-8cfc-1e9e78e4f7a1.png)

### 内存复用机制

- 基于 sync.Pool；
- slice 复用使用 slab 细粒度，提高复用率；
- 常用结构体复用；

![内存复用机制](https://cdn.nlark.com/yuque/0/2019/png/226702/1573700732649-e33b8c83-42a0-4706-9ad0-22b8f09d5a9e.png)

线上复用率可以达到90%以上，当然 sync.Pool 并不是银弹，也有自己的一些问题，但是随着 Runtime 对 sync.Pool 的持续优化，比如 go1.13 就使用 lock-free 结构减少锁竞争和增加了 victim cache 机制，以后会越来越完善。

### XDS（UDPA）

支持云原生统一数据面 API，全动态配置更新。

![XDS（UDPA）](https://cdn.nlark.com/yuque/0/2019/png/226702/1573700732659-7a4c8870-f653-4179-bd15-89aa9f159e00.png)

## 前期准备

### 性能压测和优化

在上线前的准备过程中，我们在灰度环境针对核心收银台应用进行了大量的压测和优化，为后面的落地打下了坚实的基础。

从线下环境到灰度环境，我们遇到了很多线下没有的大规模场景，比如单实例数万后端节点，数千路由规则，不仅占用内存，对路由匹配效率也有很大影响，比如海量高频的服务发布注册也对性能和稳定性有很大挑战。

整个压测优化过程历时五个月，从最初的 CPU 整体增加20%，RT 每跳增加 0.8ms, 到最后 CPU 整体增加 6%，RT 每跳增加了 0.2ms，内存占用峰值优化为之前的 1/10 。

|  | **整体增加CPU ** | **每跳RT** | **内存占用峰值** |
| --- | --- | --- | --- |
| **优化前** | 20% | 0.8ms | 2365M |
| **优化后** | 6% | 0.2ms | 253M |

- 部分优化措施

![部分优化措施](https://cdn.nlark.com/yuque/0/2019/png/226702/1573700732644-88598124-8255-4fa6-902d-69c6942ab27f.png)

![性能提升](https://cdn.nlark.com/yuque/0/2019/png/226702/1573700732686-9f85210f-8cac-424f-b2eb-b0c2d8281d61.png)

在 618 大促时，我们上线了部分核心链路应用，CPU 损耗最多增加 1.7%，有些应用由于逻辑从 Java 迁移到 Go，CPU 损耗还降低了，有 8% 左右。延迟方面平均每跳增加 0.17ms，两个合并部署系统全链路增加 5~6ms，有 7% 左右的损耗。

在后面单机房上线 SOFAMosn，在全链路压测下，SOFAMosn 的整体性能表现更好，比如交易付款带 SOFAMosn 比不带 SOFAMosn 的 RT 还降低了 7.5%。

SOFAMosn 做的大量核心优化和 Route Cache 等业务逻辑优化的下沉，更快带来了架构的红利。

### Go 版本选择

版本的升级都需要做一系列测试，新版本并不是都最适合你的场景。我们项目最开始使用的 Go 1.9.2，在经过一年迭代之后，我们开始调研当时 Go 的最新版 1.12.6，我们测试验证了新版很多好的优化，也修改了内存回收的默认策略，更好的满足我们的项目需求。

- GC 优化，减少长尾请求

新版的自我抢占(self-preempt)机制，将耗时较长 GC 标记过程打散，来换取更为平滑的GC表现，减少对业务的延迟影响。

[https://go-review.googlesource.com/c/go/+/68574/](https://go-review.googlesource.com/c/go/+/68574/)
[https://go-review.googlesource.com/c/go/+/68573/](https://go-review.googlesource.com/c/go/+/68573/)

Go 1.9.2
![Go 1.9.2](https://cdn.nlark.com/yuque/0/2019/png/226702/1573700732724-71fbb7e0-1716-47d3-b651-0519427e51bb.png)

Go 1.12.6
![Go 1.12.6](https://cdn.nlark.com/yuque/0/2019/png/226702/1573700732647-1d1a5e66-b988-4f70-bbb4-74ec8f08a426.png)

- 内存回收策略

在 Go1.12，修改了内存回收策略，从默认的 MADV_DONTNEED 修改为了 MADV_FREE，虽然是一个性能优化，但是在实际使用中，通过测试并没有大的性能提升，但是却占用了更多的内存，对监控和问题判断有很大的干扰，我们通过 GODEBUG=madvdontneed=1 恢复为之前的策略，然后在 issue 里面也有相关讨论，后续版本可能也会改动这个值。

[runtime: use MADV_FREE on Linux if available](https://github.com/golang/go/commit/77f9b2728eb08456899e6500328e00ec4829dddf)

![内存回收策略](https://cdn.nlark.com/yuque/0/2019/png/226702/1573700732670-00f301c8-0d0a-4e30-b837-0a65e2cc7aaa.png)

使用 Go1.12 默认的 MADV_FREE 策略 ，Inuse 43M， 但是 Idle 却有 600M，一直不能释放。

![使用 Go1.12 默认的 MADV_FREE 策略](https://cdn.nlark.com/yuque/0/2019/png/226702/1573700732675-c4f876ae-ba72-481b-86c7-b79949cf0737.png)

### Go Runtime Bug 修复

在前期灰度验证时，SOFAMosn 线上出现了较严重的内存泄露，一天泄露了1G 内存，最终排查是 Go Runtime 的 Writev 实现存在缺陷，导致 slice 的内存地址被底层引用，GC 不能释放。

![Go Runtime Bug 修复](https://cdn.nlark.com/yuque/0/2019/png/226702/1573700732678-4bf7a376-28eb-4113-bded-8803f001b628.png)

我们给 Go 官方提交了 Bugfix，已合入 Go 1.13最新版。
[internal/poll: avoid memory leak in Writev](https://github.com/golang/go/pull/32138)

## 后序

SOFAMosn 在蚂蚁金服经历了双十一的大考，后续我们还有更多的技术演进和支撑场景，欢迎有兴趣的同学加入我们。

![SOFAMosn](https://cdn.nlark.com/yuque/0/2019/png/226702/1573700732680-3d416d08-24e8-42bf-b14e-760459813868.png)

SOFAMosn：[https://github.com/sofastack/sofa-mosn](https://github.com/sofastack/sofa-mosn?spm=ata.13261165.0.0.ecfa1faf6uv3vz)

更多关于蚂蚁金服 Service Mesh 的双十一落地情况解析，请继续关注本网站哟~
