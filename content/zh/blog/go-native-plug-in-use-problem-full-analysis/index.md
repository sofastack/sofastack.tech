---
title: "Go 原生插件使用问题全解析"
authorlink: "https://github.com/sofastack"
description: "作者在主导设计和落地基于 Go 原生插件机制的扩展能力时遇到了很多问题，鉴于这方面的相关资料很少，因而就有了这个想法来做一个非常粗浅的总结，希望能对大家有所帮助。"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2022-07-12T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*5ZN7Toy5g00AAAAAAAAAAAAAARQnAQ"
---

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/441f29fc6ec4446585503a1a175add1b~tplv-k3u1fbpfcp-zoom-1.image)

文｜丁飞（花名：路德 )

蚂蚁集团高级工程师

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/619059c639fd4c3ca693f3f07b6384a5~tplv-k3u1fbpfcp-zoom-1.image)

*深耕于 SOFAMesh 产品的商业化落地*

*主要方向为基于服务网格技术的系统架构升级方案设计与落地*

**本文 4394 字 阅读 10 分钟**

## ｜前言｜

MOSN 作为蚂蚁集团在 ServiceMesh 解决方案中的数据面组件，从设计之初就考虑到了第三方的扩展开发需求。目前，MOSN 支持通过 gRPC、WASM、以及 Go 原生插件三种机制对其进行扩展。

我在主导设计和落地基于 Go 原生插件机制的扩展能力时遇到了很多问题，鉴于这方面的相关资料很少，因而就有了这个想法来做一个非常粗浅的总结，希望能对大家有所帮助。

*注：本文只说问题和解决方案，不读代码，文章最后会给出核心源码的 checklist。*

## PART. 1--文章技术背景

### 一、运行时

通常而言，在计算机编程语言领域，“运行时”的概念和一些需要使用到 VM 的语言相关。程序的运行由两个部分组成：目标代码和“虚拟机”。比如最为典型的 JAVA，即 Java Class + JRE。

对于一些看似不需要“虚拟机”的编程语言，就不太会有“运行时”的概念，程序的运行只需要一个部分，即目标代码。但事实上，即使是 C/C++，也有“运行时”，即它所运行平台的 OS/Lib。

Go 也是一样，因为运行 Go 程序不需要前置部署类似于 JRE 的“运行时”，所以它看起来似乎跟“虚拟机”或者“运行时”没啥关系。但事实上，Go 语言的“运行时”被编译器编译成了二进制目标代码的一部分。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e959bd1aff794e90ba61e20000748738~tplv-k3u1fbpfcp-zoom-1.image)

图 1-1. Java 程序、runtime 和 OS 关系

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c69de6ab22134e1bbd4290df1fc0ec3a~tplv-k3u1fbpfcp-zoom-1.image)

图 1-2. C/C++ 程序、runtime 和 OS 关系

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/54d57993595147a097dcfd6f5e4c68b9~tplv-k3u1fbpfcp-zoom-1.image)

图 1-3. Go 程序、runtime 和 OS 关系

### 二、Go 原生插件机制

作为一个看起来更贴近 C/C++ 技术栈的 Go 语言来说，支持类似动态链接库的扩展一直是社区中较为强烈的诉求。

如图 1-5，Go 在标准库中专门提供了一个 plugin 包，作为插件的语言级编程界面，src/plugin 包的本质是**使用 cgo 机制调用 unix 的标准接口：dlopen() 和 dlsym()** 。因此，它给 C/C++ 背景的程序员一种“这题我会”的错觉。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d9ba770798f648bea21dd2c747af46a3~tplv-k3u1fbpfcp-zoom-1.image)

图 1-4. C/C++ 程序加载动态链接库

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1e99d4607e054b4e8242fdceabdf9374~tplv-k3u1fbpfcp-zoom-1.image)

图 1-5. Go 程序加载动态链接库

## PART. 2--典型问题解决

很遗憾，与 C/C++ 技术栈相比，Go 的插件的产出物虽然也是一个动态链接库文件，但它对于插件的开发、使用有一系列很复杂的内置约束。更令人头大的是，Go 语言不但没有对这些约束进行系统性的介绍，甚至写了一些比较差的设计和实现，导致插件相关问题的排错非常反人类。

本章节重点跟大家一起看下，在开发、使用 Go 插件，主要是编译、加载插件的时候，最常见、但必须定位到 Go 标准库 *（主要包括编译器、链接器、打包器和运行时部分）* 源码才能完全弄明白的几个问题，及对应的解决方法。

简而言之，Go 的主程序在加载 plugin 时，会在“runtime”里对两者进行一堆约束检查，包括但不限于：

**-** go version 一致

**-** go path 一致

**-** go dependency 的交集一致

-   代码一致
-   path 一致

**-** go build 某些 flag 一致

### 一、不一致的标准库版本

主程序加载插件时报错：

plugin was built with a different version of package runtime/internal/sys

从这个报错的文本可以得知，具体有问题的库是 runtime/internal/sys ，很显然这是一个 go 的内置标准库。看到这里，你可能会有很大的疑惑：**我明明用的是同一个本地环境编译主程序和插件，为什么报标准库不是一个版本？**

答案是，**Go 的 error 日志描述不准确**。而这个报错出现的根本原因可以归结为：**主程序和插件的某些关键编译 flag 不一致**，跟“版本”没啥关系。

比如，你使用下面的命令编译插件：

GO111MODULE=on go build --buildmode=plugin -mod readonly -o ./codec.so ./codec.go

但是你使用 goland 的 debug 模式调试主程序，此时，goland 会帮你把 go build 命令按下面的例子组装好：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ae8c9866a99249ad93b709a78d7f0354~tplv-k3u1fbpfcp-zoom-1.image)

注意，goland 组装的编译命令里包含关键的 

-gcflags all=-N -l 参数，但是插件编译的命令里没有。此时，你在尝试拉起插件时就会得到一个有关 runtime/internal/sys 的报错。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e3f4047110074a5cb451d06d3db2838f~tplv-k3u1fbpfcp-zoom-1.image)

图 2-1. 编译 flag 不一致导致的加载失败

解决这一类标准库版本不一致问题的方案比较简单：**尽可能对齐主程序和插件编译的 flag**。事实上，有一些 flag 是不影响插件加载的，你可以在具体的实践中慢慢摸索。

### 二、不一致的第三方库版本

如果使用 vendor 来管理 Go 的依赖库，那么当解决上一节的问题之后，你 100% 会立即遇到以下这个报错：

plugin was built with a different version of package xxxxxxxx

其中，xxxxxxxx 指的是某一个具体的三方库，比如 [github.com/stretchr/testify](github.com/stretchr/testify)。这个报错有几个非常典型的原因，如果没有相关的排查经验，其中几个可能会烧掉开发人员不少时间。

**Case 1. 版本不一致**

如报错所示，似乎原因很明确，即**主程序和插件所共同依赖的某个第三方库版本不一致**，报错中会明确告诉你哪一个库有问题。此时，你可以对比排查主程序和插件的 go.mod 文件，分别找到问题库的版本，看看他们是否一致。如果这时候你发现主程和插件确实有 commitid 或 tag 的不一致问题，那解决的方法也很简单：**对齐它们**。

但是在很多场景下，你只会用到三方库的一部分：如一个 package，或者只是引了某些 interface。这一部分的代码在不同的版本里可能根本就没有变更，但其他没用到的代码的变更，同样会导致整个三方库版本的变更，进而导致你成为那个“版本不一致”的无辜受害者。

而且，此时你可能立即会遇到另一个问题：以谁为基准对齐？主程序？还是插件？

从常理上来说，以主程序为基线进行对齐是一个比较好的策略，毕竟插件是新添加的“附属品”，且主程序与插件通常是“一对多”的关系。但是，如果插件的三方库依赖因为任何原因就是不能和主程序对齐怎么办？在尝试了很久以后，我暂时没有找到一个完美解决这个问题的办法。

如果版本无法对齐，就只能从根本上放弃走插件这条路。

**Go 语言的这种对三方库的、几乎无脑的强一致性约束，从一方面来说，避免了运行时因为版本不一致带来的潜在问题；从另一方面来说，这种刻意不给程序员灵活度的设计，对插件化、定制化、扩展化开发非常的不友好。**

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4be97a4ecbc84fff829942c92ee9c485~tplv-k3u1fbpfcp-zoom-1.image)

图 2-2. 共同依赖的三方库版本不一致导致的加载失败

**Case 2. 版本号一致，代码不一致**

当你按照 case 1 的思路排查 go.mod 文件，但是惊讶的发现报错的库版本是一致的时候，事情就会变得复杂起来。你可能会拿出世界上最先进的文本查验工具，并花掉一个上午去 diff 三方库的 commitid，但它们就是一模一样，似乎陷入了薛定谔的版本。

出现这个问题可能的一个不是原因的原因是：有人直接修改了 vendor 目录下的代码，Go 插件机制会对代码内容的一致性进行校验。

这真的是一个非常令人头大，并难以排查的原因。除了修改代码的那个人，和已经在其他 case 中被“坑”过的那些人，没人会知道这件事情。如果修改的 vendor 代码出现在主程序里，你就几乎没有任何靠谱的办法让它们正常工作起来。

**不要直接在 vendor 里改代码！！！**

**不要直接在 vendor 里改代码！！！**

**不要直接在 vendor 里改代码！！！**

**回馈开源社区，或者 fork-replace！！！**

好消息是，你不需要解决这个问题。因为即使解决了，也还会有更大的问题等着你。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/366b846d2e1f4d45b4858d48828c85fe~tplv-k3u1fbpfcp-zoom-1.image)

图 2-3. 共同依赖的三方库代码被就地修改导致的加载失败

**Case 3. 路径不一致**

当按照 case 1 和 case 2 的思路都把问题排查、解决完，但它还是报 different version of package 的时候，可能你就会开始对 Go 的插件机制失去耐心了：**版本真的“一毛一样”，代码真的一行没动，为什么还报不同版本？？？**

原因是：**插件机制会校验依赖库源码的「路径」**，因此不能使用 vendor 管理依赖。

举个例子：你的主程序源码放在 /path/to/main 目录下，因此，你的某个三方库依赖的目录应该是：/path/to/main/vendor/some/thrid/part/lib；

同理，你的插件源码放在 /path/to/plugin 目录下，因此，同一个三方库依赖的目录应该是：/path/to/plugin/vendor/some/thrid/part/lib。

这些「**文件路径**」数据会被打包到二进制可执行文件里并用于校验，当主程序加载插件时，Go 的“运行时”“聪明的”通过「**文件路径**」的差异认定它和插件用的不是同一份代码，然后报了个 different version of package。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6b27c6133ec845d3aaeb529d7b911d8d~tplv-k3u1fbpfcp-zoom-1.image)

图 2-4. 使用 vendor 机制管理第三方库导致的加载失败

同样的问题也可能会出现在使用不同机器/用户，分别编译主程序、插件的场景下：用户名不同，go 代码的路径应该也会不一样。

解决这类问题的方法很暴力直接：**删掉主程序和插件的 vendor 目录，或者使用** -mod=readonly **编译 flag**。

到这里，如果你是使用同一台机器进行主程序和插件的编译，那么常见的问题应该都基本解决了，插件机制理应能够正常工作。另一方面，由于不再使用 vendor 管理依赖，因此 case 2 的问题也会在这里被强制解决：要么提 PR 给社区，要么 fork-replace。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/12d3b16f375c48f2a46c0eeb44a0cc71~tplv-k3u1fbpfcp-zoom-1.image)

图 2-5. 成功加载

### 三、不一致的 Go 版本

fatal error: runtime: no plugin module data

除了上面的那些问题以外，还有一个在多机器分别编译主程/插件场景下的常见报错。这个报错的一个可能原因是 **Go 版本不一致**，对齐它们即可。（如果从机器层面就是不能对齐怎么办？……）

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/26bbe38045544c978a4d2ca08c50e642~tplv-k3u1fbpfcp-zoom-1.image)

图 2-6. Go 版本不一致导致的加载失败

## PART. 3--统一解决方案

从第二 Part 中，我们看了一些既很难排查，也不是很好处理的问题。除此之外，其实还有一些问题没有被重点介绍进来。作为一个编程语言官方支持的扩展机制，做的如此用户不友好确实出人意料。

由于「**专有云 MOSN**」重点依赖 Go 的插件机制做定开，因此必须拿出一个系统化的方案把这些问题统统解决掉。在尝试直接修改 Go 源码无果以后 *（吐槽：Go 插件机制源码写的令人略感遗憾）* ，我们重点从“产品层”及外围基础设施入手开展了相关工作：

**-** 统一编译环境：

-   提供一个标准的 docker image 用来编译主程序和插件，规避任何 go 版本、gopath 路径、用户名等不一致所带来的问题；

-   预制 go/pkg/mod，尽可能减少因为没有使用 vendor 模式导致每次编译都要重新下载依赖的问题。

**-** 统一 Makefile：

-   提供一套主程序和插件的编译 Makefile，规避任何因为 go build 命令带来的问题。

**-** 统一插件开发脚手架：

-   由脚手架，而不是开发者拉齐插件与主程序的依赖版本。并由脚手架解决其他相关问题。

**-** 流水线化：

-   将编译部署流水线化，进一步避免出现错误。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c9973461c8894180b737cfeaaa52f061~tplv-k3u1fbpfcp-zoom-1.image)

图 3-1. 统一解决方案

## PART. 4--关键源码位置

如果真的想从根本上搞清楚插件校验的机制，那这里为你提供一些快速进入源码阅读状态的入口。我使用的 Go 源码为 1.15.2 版本。相关 Go 源码位置：

**-** **compiler**：go/src/cmd/compile/*

**-** **linker**：go/src/cmd/link/internal/ld/*

**-** **pkg loader**：go/src/cmd/go/internal/load/*

**-** **runtime**：go/src/runtime/*

### 一、go build 到底在做啥

你可以在 go build 命令里添加 -x 参数，以显式的打印出 Go 程序编译、链接、打包的全流程，例如：

go build -x -buildmode=plugin -o ../calc_plugin.so calc_plugin.go

### 二、目标代码生成

go/src/cmd/compile/internal/gc/obj.go:55 ：注意第 67 和第 72 行，这里是两个入口；

go/src/cmd/compile/internal/gc/iexport.go:244 ：注意 280 行，这里会记录 path 相关数据。

### 三、库哈希生成算法

go/src/cmd/link/internal/ld/lib.go:967：注意第 995-1025 行，这里计算 pkg 的 hash。

**四、库哈希校验**

go/src/runtime/symtab.go:392 ：关键数据结构；

go/src/runtime/plugin.go:52 ：链接期 hash 与运行时 hash 值校验点；

go/src/cmd/link/internal/ld/symtab.go:621 ：链接期 hash 赋值点；

go/src/cmd/link/internal/ld/symtab.go:521 ：运行时 hash 赋值点。

## PART. 5--总结

可以看到，即使 Go 的原生插件机制有各种各样令人头痛的问题，SOFAStack 团队依旧秉持“开源、开放、可扩展”的初衷，通过各种手段解决问题，并最终将此能力做到生产可用。

目前，专有云 MOSN 的协议编解码器和 logger 的定制化开发已经实现全面的插件化。接下来，我们将持续对 MOSN 架构进行升级，目标对包括路由逻辑、LB 逻辑、注册中心/配置中心对接等在内的多方面能力进行插件化支持。

## 了解更多……

**MOSN Star 一下✨：** *[https://github.com/mosn/mosn](https://github.com/mosn/mosn)*

点击阅读原文，和我们一起共建吧🧸

### 本周推荐阅读

MOSN 构建 Subset 优化思路分享

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b8964d9ce1cb4a958099a230630c93f9~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247511573&idx=1&sn=86019e1570b797f0d4c7f4aa2bcf2ad3&chksm=faa341cfcdd4c8d9aea24212d29c31f2732ec88ee65271703d2caa96dabc114e873f975fec8f&scene=21)

MOSN 文档使用指南

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9eebd11851fe4607bb6d7e32c46bd349~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247507103&idx=1&sn=e8da41af0ceaa18ae13f31ca2905da8e&chksm=faa33345cdd4ba5397a43adfe8cabdc85321d3f9f14066c470885b41e2f704ec505a9f086cec&scene=21)

MOSN 1.0 发布，开启新架构演进

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0b36c39819b54e61b4f04d40391e5019~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247506881&idx=1&sn=b61b931c11c83d3aceea93a90bbe8c5d&chksm=faa3341bcdd4bd0d1fb1348c99e7d38be2597dcb6767a68c69149d954eae02bd39bc447e521f&scene=21)

MOSN Contributor 采访｜开源可以是做力所能及的事

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/309f22a4b1b940e79137a62f3c8a5d41~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247508985&idx=1&sn=6cae1ea0e17720f38a7687f74b833c50&chksm=faa34c23cdd4c535c32debf5053cfa8d82e07aae46b24efcbb18b2f863044d7e80dc8b780dbf&scene=21)

欢迎关注：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2aebd02a07bb4ad5b1932fcacabee694~tplv-k3u1fbpfcp-zoom-1.image)
