---
title: "社区文章｜MOSN 社区性能分析利器——Holmes 原理浅析"
author: "Junlong Liu"
authorlink: "https://github.com/sofastack"
description: "社区文章｜MOSN 社区性能分析利器——Holmes 原理浅析"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2022-04-05T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*KZNFTIMOxVgAAAAAAAAAAAAAARQnAQ"
---

文｜Junlong Liu

Shopee Digital Purchase & Local Services Engineering

本文1743字 阅读 6分钟

## 贡献者前言

我是在开发工作过程中了解到 Holmes 的，为了保障系统稳定性需要一个性能排查工具，因此也需要一个保留现场的性能监控工具。当我在网上查询该方面的开源库时，发现可用的并不多。后续找到 MOSN 社区的 Holmes ，发现这个开源库功能基本齐全、扩展性也高，特别是 GCHeapDump 这个业界领先的功能，对解决内存升高的问题十分有用。

2021 年年末了解到的 Holmes 组件，然后开始了解 Holmes 所在的 MOSN 社区。Holmes 作为性能排查工具，核心功能是及时发现性能指标异常，并对系统进行 Profiling。

由于 Holmes 还处于萌芽期，除了 Readme 之外的文档资料并不多。还有一些 Holmes 当时不支持的功能，比如动态配置调整与上报。Holmes 当时也还没发布第一个版本，但是自己对这方面也有兴趣和理解，于是在 GitHub 上提了几个 Issue 讨论，社区回复的速度十分快。后续在社区前辈们的指导下提了 PR，也因此通过 Holmes 的代码设计学习到了很多关于开源组件的设计理念。

因此我决定参与开源社区并贡献代码，以解决实际需求。有了一定的了解和经验之后，通过和人德前辈讨论，总结这样一篇分享文章。

本文将介绍 Holmes 的使用场景、快速开始案例、多个监控类型、设计原理、扩展功能与如何借助 Holmes 搭建起一套简单的性能排查系统，欢迎大家留言指导。

## Holmes 使用场景

对于系统的性能尖刺问题，我们通常使用 Go 官方内置的 pprof 包进行分析，但是难点是对于一闪而过的“尖刺”，开发人员很难及时保存现场：当你收到告警信息，从被窝中爬起来，打开电脑链接 VPN，系统说不定都已经重启三四趟了。

MOSN 社区的 Holmes 是一个基于 Golang 实现的轻量级性能监控系统，当应用的性能指标发生了异常波动时，Holmes 会在第一时间保留现场，让你第二天上班可以一边从容地喝着枸杞茶，一边追查问题的根因。

## Quick Start

使用 Holmes 的方式十分简单，只需要在您的系统初始化逻辑内添加以下代码：

```java

 // 配置规则
    h, _ := holmes.New(
        holmes.WithCollectInterval("5s"), // 指标采集时间间隔
        holmes.WithDumpPath("/tmp"),      // profile保存路径
    
        holmes.WithCPUDump(10, 25, 80, 2 * time.Minute),  // 配置CPU的性能监控规则
        holmes.WithMemDump(30, 25, 80, 2 * time.Minute),// 配置Heap Memory 性能监控规则
        holmes.WithGCHeapDump(10, 20, 40, 2 * time.Minute), // 配置基于GC周期的Heap Memory 性能监控规则
        holmes.WithGoroutineDump(500, 25, 20000, 100*1000, 2 * time.Minute),    //配置Goroutine数量的监控规则
    )

    // enable all
    h.EnableCPUDump().
    EnableGoroutineDump().
  EnableMemDump().
  EnableGCHeapDump().Start()
```

类似于 holmes.WithGoroutineDump(min, diff, abs,max,2 * time.Minute) 的 API 含义为:

当 Goroutine 指标满足以下条件时，将会触发 Dump 操作。

当 Goroutine 数大于 Max 时，Holmes 会跳过本次 Dump 操作，因为当 Goroutine 数过大时，Goroutine Dump 操作成本很高。

2 * time.Minute 是两次 Dump 操作之间最小时间间隔，避免频繁 Profiling 对性能产生的影响。

更多使用案例见文末的 Holmes 使用案例文档。

## Profile Types

Holmes 支持以下五种 Profile 类型，用户可以按需配置。

Mem: 内存分配    

CPU: CPU 使用率      

Thread: 线程数    

Goroutine: 协程数

GCHeap: 基于 GC 周期监控的内存分配

## 指标采集

Mem、CPU、Thread、Goroutine 这四种类型是根据用户配置的 CollectInterval，每隔一段时间采集一次应用当前的性能指标，而 gcHeap 时基于 GC 周期采集性能指标。

本小节会分析一下两种指标。

### 根据 CollectInterval 周期采集

Holmes 每隔一段时间采集应用各项指标，并使用一个固定大小的循环链表来存储它们。

![图片](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*oqHLQ4ukZEYAAAAAAAAAAAAAARQnAQ)

### 根据 GC 周期采集

在一些场景下，我们无法通过定时的 memory dump 保留到现场。比如应用在一个 CollectInterval 周期内分配了大量内存，又快速回收了它们。此时 Holmes 在周期前后的采集到内存使用率没有产生过大波动，与实际情况不符。

为了解决这种情况，Holmes 开发了基于 GC 周期的 Profile 类型，它会在堆内存使用率飙高的前后两个 GC 周期内各 Dump 一次 Profile，然后开发人员可以使用 pprof --base 命令去对比两个时刻堆内存之间的差异。

根据 GC 周期采集到的数据也会放在循环列表中。

## 规则判断

本小节介绍 Holmes 是如何根据规则判断系统出现异常的。

### 阈值含义

每个 Profile 都可以配置 min、diff、abs、coolDown 四个指标，含义如下:

当前指标小于 min 时，不视为异常。

当前指标大于 (100+diff)100% 历史指标，说明系统此时产生了波动，视为异常。

当前指标大于 abs (绝对值)时，视为异常。

CPU 和 Goroutine 这两个 Profile 类型提供 Max 参数配置，基于以下考虑：

CPU 的 Profiling 操作大约会有 5% 的性能损耗，所以当在 CPU 过高时，不应当进行 Profiling 操作，否则会拖垮系统。

当 Goroutine 数过大时，Goroutine Dump 操作成本很高，会进行 STW 操作，从而拖垮系统。（详情见文末参考文章）

### Warming up

当 Holmes 启动时，会根据 CollectInterval 周期采集十次各项指标，在这期间内采集到的指标只会存入循环链表中，不会进行规则判断。

## 扩展功能

除了基本的监控之外，Holmes 还提供了一些扩展功能：

### 事件上报

您可以通过实现 Reporter 来实现以下功能：

发送告警信息，当 Holmes 触发 Dump 操作时。

将 Profiles 上传到其他地方，以防实例被销毁，从而导致 Profile 丢失，或进行分析。

```java
  type ReporterImpl struct{}
        func (r *ReporterImple) Report(pType string, buf []byte, reason string, eventID string) error{
            // do something  
        }
        ......
        r := &ReporterImpl{} // a implement of holmes.ProfileReporter Interface.
      h, _ := holmes.New(
            holmes.WithProfileReporter(reporter),
            holmes.WithDumpPath("/tmp"),
            holmes.WithLogger(holmes.NewFileLog("/tmp/holmes.log", mlog.INFO)),
            holmes.WithBinaryDump(),
            holmes.WithMemoryLimit(100*1024*1024), // 100MB
            holmes.WithGCHeapDump(10, 20, 40, time.Minute),
)
```

### 动态配置

您可以通过 Set 方法在应用运行时更新 Holmes 的配置。它的使用十分简单，和初始化时的 New 方法一样。

有些配置时不支持动态更改的，比如 Core 数。如果在系统运行期间更改这个参数，会导致 CPU 使用率产生巨大波动，从而触发 Dump 操作。

```java
h.Set(
        WithCollectInterval("2s"),
        WithGoroutineDump(10, 10, 50, 90, time.Minute))
```

## 落地案例 

利用 Holmes 的 Set 方法，可以轻松地对接自己公司的配置中心，比如，将 Holmes 作为数据面，配置中心作为控制面。并对接告警系统(邮件/短信等)搭建一套简单的监控系统。

具体架构如下:

![图片](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*9l3sTKA3wJ4AAAAAAAAAAAAAARQnAQ)

## Holmes V1.0 版本发布

本文简单地介绍了 Holmes 的使用方法与原理。希望 Holmes 能在您提高应用的稳定性时帮助到你。

Holmes V1.0 在几周前正式发布了，作为贡献者和使用者，我十分推荐大家试用这个小巧的工具库，有任何问题和疑问欢迎大家来社区提问～

Holmes 是 MOSN 社区开源的 GO 语言 Continous Profiling 组件，可以自动发现 CPU、 Memory、Goroutine 等资源的异常，并自动 Dump 异常现场 Profile，用于事后分析定位。也支持上传 Profile 到自动分析平台，实现自动问题诊断、报警。

「发布报告」：[https://github.com/mosn/holmes/releases/tag/v1.0.0](https://github.com/mosn/holmes/releases/tag/v1.0.0)

「Holmes 原理介绍」：[https://mosn.io/blog/posts/mosn-holmes-design/](https://mosn.io/blog/posts/mosn-holmes-design/)

本文简单地介绍了 Holmes 的使用方法与原理。希望 Holmes 能在您提高应用的稳定性时帮助到你。

「参考资料」

[1]《Holmes 文档》[https://github.com/mosn/holmes](https://github.com/mosn/holmes)

[2]《无人值守的自动 dump(一)》[https://xargin.com/autodumper-for-go/](https://xargin.com/autodumper-for-go/)

[3]《无人值守的自动 dump(二)》[https://xargin.com/autodumper-for-go-ii/](https://xargin.com/autodumper-for-go-ii/)

[4]《go 语言 pprof heap profile 实现机制》[https://uncledou.site/2022/go-pprof-heap/](https://uncledou.site/2022/go-pprof-heap/)

[5]《goroutines pprofiling STW》[https://github.com/golang/go/issues/33250](https://github.com/golang/go/issues/33250)

[6]《Holmes 使用案例文档》[https://github.com/mosn/holmes/tree/master/example](https://github.com/mosn/holmes/tree/master/example)

[7]《go pprof 性能损耗》[https://medium.com/google-cloud/continuous-profiling-of-go-programs-96d4416af77b](https://medium.com/google-cloud/continuous-profiling-of-go-programs-96d4416af77b)

### 本周推荐阅读  

[邀请函｜SOFA 四周年，开源正当时！](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247504959&idx=1&sn=bbcedc8e4b0cda7938eccf5288482e47&chksm=faa33be5cdd4b2f3fd003540f263f318b554a3fdc830a163f00709e37831f2d366e10dd8985f&scene=21)

[Nydus 镜像加速插件迁入 Containerd 旗下](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247504035&idx=1&sn=320b77bf5f3c6cf0da309f7527b98e64&chksm=faa33f79cdd4b66f184d273a2d7460c41320711eab47af849e386c359e71eeebc6c7f21c1e0f&scene=21)

[异构注册中心机制在中国工商银行的探索实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247504244&idx=1&sn=59e32e2d4be5bbf6789da040eaaa1d4d&chksm=faa33eaecdd4b7b8a2f630944d6c7fd679bd1ecfef2c512111a61c02320dc78bb0ee560053f9&scene=21)

[SOFAArk Committer 专访｜看它不爽，就直接动手改！](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247503819&idx=1&sn=8dfd99fac47b7c9c6e4f507db5d7a11f&chksm=faa32011cdd4a9070e80c69d21fbab7a16047d307907b61ed7c3bdf588d7d57af2cd41fffa26&scene=21)

![img](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*8G5NRZ7UEToAAAAAAAAAAAAAARQnAQ) 
