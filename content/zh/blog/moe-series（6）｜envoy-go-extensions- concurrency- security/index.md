---
title: "MoE 系列[六] - Envoy Go 扩展之并发安全"
authorlink: "https://github.com/sofastack"
description: "MoE 系列[六] - Envoy Go 扩展之并发安全"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2023-07-18T15:00:00+08:00
cover: "https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*19BBQZkmADQAAAAAAAAAAAAADrGAAQ/original"
---

![图片](https://mmbiz.qpic.cn/mmbiz_gif/nibOZpaQKw09ARcsGuzib3ttcN4LZpdAC0n9KTQp7uibF8ia0ibk3Olf3sib50ExibicicOrzCOVrOyUD2dFib84f0fTx5uA/640?wx_fmt=gif&wxfrom=5&wx_lazy=1)

文｜朱德江（GitHub ID：doujiang24)

MOSN 项目核心开发者

蚂蚁集团技术专家

![图片](https://mmbiz.qpic.cn/mmbiz_png/nibOZpaQKw08VNbtYZicic5Nog5MV3VxrPUbpSOe4Pn693qzEiacbqxwuqcyhl24RbPibibbgxhIwZmRG36CzjZicDRUA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

*专注于云原生网关研发的相关工作*

***本文*** **1313** **字 阅读 4** **分钟**

前一篇介绍了 Envoy Go 扩展的内存安全，相对来说，还是比较好理解的，主要是 Envoy C++ 和 Go GC 都有自己一套的内存对象的生命周期管理。这篇聊的并发安全，则是专注在并发场景下的内存安全，相对来说会复杂一些。

## 并发的原因

首先，为什么会有并发呢🤔️

本质上因为 Go 有自己的抢占式的协程调度，这是 Go 比较重的部分，也是与 Lua 这类嵌入式语言区别很大的点。

细节的话，这里就不展开了，感兴趣的可以看这篇👉[*cgo 实现机制 - 从 C 调用 Go*](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247516398&idx=1&sn=2172b6f6ffe9c8b3263a15ef60ee3d54&chksm=faa36f34cdd4e622746582f922cd00798a1044c4f32a7ce058be6df91b58cbee725022a56525&scene=21#wechat_redirect)

这里简单交代一下，因为 C 调用 Go，入口的 Go 函数的运行环境是，Goroutine 运行在 Envoy worker 线程上，但是这个时候，如果发生了网络调用这种可能导致 Goroutine 挂起的，则会导致 Envoy worker 线程被挂起。

所以，**解决思路**🪄就是像 Go 扩展的异步模式[1]中的示例一样，新起一个 Goroutine，它会运行在普通的 Go 线程上。

那么此时，对于同一个请求，则会同时有 Envoy worker 线程和 Go 线程，两个线程并发在处理这个请求，这个就是并发的来源。

但是，我们并不希望用户操心这些细节，而是在底层提供并发安全的 API，把复杂度留在 Envoy Go 扩展的底层实现里。

## 并发安全的实现

接下来，我们就针对 **Goroutine 运行在普通的 Go 线程上**这个并发场景，来聊一聊如何实现并发安全。

对于 Goroutine 运行在 Envoy 线程上，因为并不存在并发冲突，这里不做介绍。

### 写 header 操作

我们先聊一个简单的，比如在 Go 里面通过 `header.Set` 写一个请求头。

核心思路是，是通过 `dispatcher.post`，将写操作当做一个事件派发给 Envoy worker 线程来执行，这样就避免了并发冲突。

### 读 header 操作

读 header 则要复杂不少，因为写不需要返回值，可以异步执行，读就不行了，必须得到返回值。

为此，我们根据 Envoy 流式的处理套路，设计了一个类似于所有权的机制。

Envoy 的流式处理，可以看这篇👉 搞懂 http filter 状态码[2]。

简单来说，我们可以这么理解，当进入 `decodeHeaders` 的时候，header 所有权就交给 Envoy Go 的 C++ 侧了，然后，当通过 cgo 进入 Go 之后，我们会通过一个简单的状态机，标记所有权在 Go 了。

通过这套设计/约定，就可以安全地读取 header 了，本质上，还是属于规避并发冲突。

为什么不通过锁来解决呢？因为 Envoy 并没有对于 header 的锁机制，C++ 侧完全不会有并发冲突。

### 读写 data 操作

有了这套所有权机制，data 操作就要简单很多了。

因为 header 只有一份，并发冲突域很大，需要考虑 Go 代码与 C++ 侧的其他 filter 的竞争。

data 则是流式处理，我们在 C++ 侧设计了两个 buffer 对象，一个用于接受 filter manager 的流式数据，一个用于缓存交给 Go 侧的数据。

这样的话，交给 Go 来处理的数据，Go 代码拥有完整的所有权，不需要考虑 Go 代码与 C++ 侧其他 filter 的竞争，可以安全地读写，也没有并发冲突。

### 请求生命周期

另外一个很大的并发冲突，则关乎请求的生命周期，比如 Envoy 随时都有可能提前销毁请求，此时 Goroutine 还在 Go thread 上继续执行，并且随时可能读写请求数据。

**处理的思路是：**

并没有有效的办法，能够立即 kill Goroutine，所以，我们允许 Goroutine 可能在请求被销毁之后继续执行。

但是，Goroutine 如果读写请求数据，Goroutine 会被终止，panic + recover（*recover 细节我们下一篇会介绍*）。

那么，我们要做的就是，所有的 API 都检查当前操作的请求是否合法，这里有两个关键：

每请求有一个内存对象，这个对象只会由 Go 来销毁，并不会在请求结束时，被 Envoy 销毁，但是这个内存对象中保存了一个 weakPtr，可以获取 C++ filter 的状态。

通过这个机制，Go 可以安全地获取 C++ 侧的 filter，判断请求是否还在。

同时，我们还会在 `onDestroy`，也就是 C++ filter 被销毁的 Hook 点；以及 Go thread 读写请求数据，这两个位置都加锁处理，以解决这两个之间的并发冲突。

## 最后

对于并发冲突，其实最简单的就是，通过加锁来竞争所有权，但是 Envoy 在这块的底层设计并没有锁，因为它根本不需要锁。

所以，基于 Envoy 的处理模型，我们设计了一套类似所有权的机制，来避免并发冲突。

所有权的概念也受到了 Rust 的启发，只是两者工作的层次不一样，Rust 是更底层的语言层面，可以作用于语言层面，我们这里则是更上层的概念，特定于 Envoy 的处理模型，也只能作用于这一个小场景。

但是某种程度上，解决的问题，以及其中部分思想是一样的。

**了解更多…**

**MOSN Star 一下🌟：**

*https://github.com/mosn/mosn*

## 参考链接

[1]Go 扩展的异步模式:

*https://uncledou.site/2023/moe-extend-envoy-using-golang-4/*

[2]搞懂 http filter 状态码:

*https://uncledou.site/2022/envoy-filter-status/*

## 推荐阅读

[MoE 系列（二）｜Golang 扩展从 Envoy 接收配置](https://mp.weixin.qq.com/s/xRt9qet-Dm3UMEVa3iDFrA)

[MoE 系列（三）｜使用 Istio 动态更新 Go 扩展配置](https://mp.weixin.qq.com/s/gvbvAZEUbjtD-UpKziHmBA)

[MoE 系列（四）｜Go 扩展的异步模式](https://mp.weixin.qq.com/s/to6U_5UfU1LUSj6vGsQQuQ)

[MoE 系列（五）｜Envoy Go 扩展之内存安全](https://mp.weixin.qq.com/s/zAT1yFhE8IQX0Mb3ghs04Q)

![图片](https://mmbiz.qpic.cn/sz_mmbiz_jpg/nibOZpaQKw08Wic9WKwiaVicaKu0OKmdhj0nXubpDsc8JCjo3IKfMAf5QRiaRmXEoAUwZbaXzJG3ZbFDa4GEhXLkujg/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)
