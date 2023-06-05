---
title: "MoE 系列（五）｜Envoy Go 扩展之内存安全"
authorlink: "https://github.com/sofastack"
description: "MoE 系列（五）｜Envoy Go 扩展之内存安全"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2023-05-30T15:00:00+08:00
cover: "https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*0kzhRbFN4HcAAAAAAAAAAAAADrGAAQ/original"

---

**前面几篇介绍了 Envoy Go 扩展的基本用法，接下来几篇将介绍实现机制和原理。**

Envoy 是 C++ 实现的，那 Envoy Go 扩展，本质上就相当于把 Go 语言嵌入 C++ 里了。

在 Go 圈里，将 Go 当做嵌入式语言来用的，貌似并不太多见，这里面细节还是比较多的。比如：

1. Envoy 有一套自己的内存管理机制，而 Go 又是一门自带 GC 的语言。
2. Envoy 是基于 libevent 封装的事件驱动，而 Go 又是包含了抢占式的协程调度。

为了降低用户开发时的心智负担，我们提供了三种安全保障。有了这三层保障，用户写 Go 来扩展 Envoy 的时候，就可以像平常写 Go 代码一样简单，而不必关心这些底层细节。

## 三种安全

### 1. 内存安全

用户通过 API 获取到的内存对象，可以当做普通的 Go 对象来使用。

比如，通过 Headers.Get 得到的字符串，在请求结束之后还可以使用，而不用担心请求已经在 Envoy 侧结束了，导致这个字符串被提前释放了。

### 2. 并发安全

当启用协程的时候，我们的 Go 代码将会运行在另外的 Go 线程上，而不是在当前的 Envoy worker 线程上，此时对于同一个请求，则存在 Envoy worker 线程和 Go 线程的并发。

但是，用户并不需要关心这个细节，我们提供的 API 都是并发安全的，用户可以不感知并发的存在。

### 3. 沙箱安全

这一条是针对宿主 Envoy 的保障，因为我们并不希望某一个 Go 扩展的异常，把整个 Envoy 进程搞崩溃。

目前我们提供的是，Go Runtime 可以 recover 的有限沙箱安全，这通常也足够了。

更深度的，Runtime 不能 recover 的，比如 Map 并发访问，则只能将 Go So 重载，重建整个 Go Runtime 了，这个后续也可以加上。

## 内存安全实现机制

要提供安全的内存机制，最简单的办法，也是*（几乎）*唯一的办法，就是复制。但是，什么时候复制、怎么复制，还是有一些讲究的。这里权衡的目标是降低复制的开销，提升性能。

这里讲的内存安全，还不涉及并发时的内存安全，只是 Envoy*（C++）*和 Go 这两个语言运行时之间的差异。

PS：以前用 OpenResty 的时候，也是复制的玩法，只是有一点区别是，Lua String 的 Internal 归一化在大内存场景下，会有相对较大的开销；Go String 则没有这一层开销，只有 Memory Copy + GC 的开销。

### 复制时机

首先是复制时机，我们选择了按需复制，比如 Header，Body Data 并不是一开始就复制到 Go 里面，只有在对应的 API 调用时，才会真的去 Envoy 侧获取&复制。

如果没有被真实需要，则并不会产生复制，这个优化对于 Header 这种常用的，效果倒是不太明显，对于 Body 这种经常不需要获取内容的，效果则会比较的明显。

### 复制方式

另一个则是复制方式，比如 Header 获取上，我们采用的是在 Go 侧预先申请内存，在 C++ 侧完成赋值的方式，这样我们只需要一次内存赋值即可完成。

这里值得一提的是，因为我们在进入 Go 的时候，已经把 Header 的大小传给了 Go，所以我们可以在 Go 侧预先分配好需要的内存。

不过呢，这个玩法确实有点 tricky，并不是 Go 文档上注明推荐的用法，但是也确实是我们发现的最优的解法了。

如果按照 Go 常规的玩法，我们可能需要一次半或两次内存拷贝，才能保证安全，这里有个半次的差异，就是我们下回要说的并发造成的。

另外，在 API 实现上，我们并不是每次获取一个 Header，而是直接一次性把所有的 Header 全复制过来，在 Go 侧缓存了。这是因为大多数场景下，我们需要获取的 Header 数量会有多个，在权衡了 CGO 的调用开销和内存拷贝的开销之后，我们认为一次性全拷贝是更优的选择。

## 最后

相对来说，不考虑并发的内存安全，还是比较简单的，只有复制最安全，需要权衡考虑的则更多是优化的事情了。

比较复杂的还是并发时的安全处理，这个我们下回再聊。

## MOSN Star 一下✨：

[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

## 推荐阅读

[MoE 系列（一）｜如何使用 Golang 扩展 Envoy](https://mp.weixin.qq.com/s/GF5Pr2aAOe6NAdJ5VgfMvg)

[MoE 系列（二）｜Golang 扩展从 Envoy 接收配置](https://mp.weixin.qq.com/s/xRt9qet-Dm3UMEVa3iDFrA)

[MoE 系列（三）｜使用 Istio 动态更新 Go 扩展配置](https://mp.weixin.qq.com/s/gvbvAZEUbjtD-UpKziHmBA)

[MoE 系列（四）｜Go 扩展的异步模式](
