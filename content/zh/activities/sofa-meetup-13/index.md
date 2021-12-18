---
title: "【活动回顾】《WebAssembly Open Day》"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "【活动回顾】《WebAssembly Open Day》"
categories: "SOFA"
tags: ["SOFA"]
date: 2021-12-18T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*P_EnQbF8D3QAAAAAAAAAAAAAARQnAQ"
---

## 概要

- 活动主题：SOFA x 字节码联盟 WAMR 社区「WebAssembly Open Day」

- 活动时间：2021 年 12 月 18 日（周六）13:00-17:00

- 活动形式：线上直播

- 资料下载：<br/>

[《蚂蚁集团 WASM 编译器虚拟机基础能力建设》 ](https://gw.alipayobjects.com/os/bmw-prod/8bf7483e-baaa-4119-bd4b-210aeea2d632.pdf)<br/>

[《WebAssembly Micro Runtime 开源技术解析与展望》](https://gw.alipayobjects.com/os/bmw-prod/f7644e54-ff38-4794-8cc7-bd6889b591f4.pdf)<br/>

[《Waft: 基于 WebAssembly 的 AIoT 应用框架实践》](https://gw.alipayobjects.com/os/bmw-prod/601c494f-9c97-4c75-9575-42ca5141f7cf.pdf)<br/>

[《WASM 中的 GC 遐想》](https://gw.alipayobjects.com/os/bmw-prod/0c9a2462-ac26-4d59-997b-b84d1eea0d40.pdf)<br/>

[《WebAssembly 在区块链中的实践》](https://gw.alipayobjects.com/os/bmw-prod/29cf9887-8e6e-4210-ab20-5be5efa37f28.pdf)<br/>

[《Wasm & WAMR 在 AIOT 领域的应用》](https://gw.alipayobjects.com/os/bmw-prod/1e8efe05-8f1c-4f37-baac-63634bdba88d.pdf)<br/>

## 活动议程

>![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*ahidQ56SGgoAAAAAAAAAAAAAARQnAQ)

## 活动回顾 

嘉宾简介：

《字节码联盟与 WAMR 开源社区进展介绍》

王鑫
intel 技术经理
任职英特尔公司，关注计算机语言与运行引擎，可信计算和物联网等技术领域。开发与创建开源项目 WebAssembly Micro Runtime，参与推动英特尔、微软、Mozilla 等公司成立字节码联盟（Bytecode-Alliance），任字节码联盟技术管理委员会（TSC）成员。

杨斌（花名：凯撒）
蚂蚁集团技术总监
任职蚂蚁集团技术总监，关注操作系统，计算机语言与运行引擎等技术领域。

Till Schneidereit
字节码联盟董事会主席

Ralph Squillace
微软高级总监
字节码联盟董事会成员



汤伟              
蚂蚁集团资深技术专家     

《蚂蚁集团 WASM 编译器虚拟机基础能力建设》   

嘉宾简介：

汤伟，一直从事编译器和虚拟机相关工作，2020年11月加入蚂蚁金服，主导webassembly相关工具链的设计与开发。

议题简介：
作为面向蚂蚁的 wasm 编译器、虚拟机基础平台团队，面向蚂蚁 wasm 用户核心诉求，针对开发效率、性能提升以及生态拓展，确定 wasm 编译器、虚拟机上的技术选型，探索未来编译器、虚拟机协同设计空间。

听众收益：
了解wasm在蚂蚁的业务场景中的需求和我们的编译器、虚拟机技术能力建设上的一些探索。


何良              
intel 资深软件工程师            

《WebAssembly Micro Runtime 开源技术解析与展望》

嘉宾简介：何良，INTEL 资深软件工程师， WAMR开源项目核心开发者

议题简介：主要介绍 WebAssembly Micro Runtime(WAMR) 的技术特性，发展历程以及路线图。面对嵌入式设备独特的资源条件和使用场景，WAMR进行了有针对性的特性开发，比如选用不同的运行模式适应不同的资源水平，利用XIP在文件系统中直接执行，在RUNTIME中支持 Sensor API 等。此外，WAMR努力打造高效的开发环境，提供源码级调试的功能框架和VSCODE插件。目前，支持高级语言（比如JAVA,KOTLIN等）和SOCKET APIs的功能开发正在有序展开。


唐兹源              
阿里巴巴前端技术专家        

《Waft: 基于 WebAssembly 的 AIoT 应用框架实践》

嘉宾简介：

唐兹源，天猫精灵工程技术前端团队负责人，在智能硬件应用研发领域拥有超过 4 年的经验，专注于 AIoT 体验技术创新

议题简介：

本次分享将为大家带来天猫精灵技术团队基于 WAMR 和自研渲染引擎打造的应用框架实践经验，介绍 WebAssembly 在天猫精灵智能音箱以及生态硬件（如电视大屏、投影仪等）的应用场景，以及 Waft 应用框架体系的设计和思考

听众收益：

了解 WebAssembly 在智能音箱及电视大屏中的应用场景
了解天猫精灵技术团队如何结合 WAMR 和自研渲染引擎设计动态化容器
了解如何运用 AssemblyScript 设计适合 Web 开发者的应用框架及工具链建设

臧琳       
腾讯云高级工程师            

《WASM中的GC遐想》

嘉宾简介：腾讯云编程语言团队高级工程师，OpenJDK committer，专注于编程语言 Runtime 技术在云计算领域的优化与应用。

议题简介：内存管理及垃圾回收技术是现代高级语言的核心技术之一，也是webassembly承载多语言支持的必经之路， wasm社区已经将GC proposal提上日程，本话题和大家一起进行一次头脑风暴，探讨未来wasm的内存管理及垃圾收集技术可能的发展方向。


张磊              
蚂蚁集团技术专家            

《WebAssembly在区块链中的实践》

嘉宾简介：毕业于北京大学，曾就职于华为编译器实验室。目前在蚂蚁链智能合约团队，从事编译器和虚拟机相关研发工作。

议题简介：Wasm 的安全性、高性能和跨平台等优点，使其天然适合用作区块链智能合约的执行环境。另一方面，区块链对于安全性和确定性的极致要求，也对 Wasm 本身提出了一些技术挑战。本次分享将会结合蚂蚁链的实践经验，介绍 Wasm与区块链之间的各种奇妙“化学反应”。

听众收益：将会了解到wasm在区块链领域的应用现状和面临的技术挑战。

黄齐       
小米软件工程师/Vela OS 框架业务技术负责人           

《Wasm & WAMR在AIOT领域的应用》

嘉宾简介：负责小米Vela OS内核、中间件的研发和在不同架构上的落地，带领团队完成了基于Wasm的应用开发框架的开发和落地，支撑了小米内部多项业务发展

议题简介：Wasm 作为诞生于浏览器的技术，为何能在 IoT 领域大放异彩？在内存只有数十 KB 级别的运行环境里使用 Wasm，我们将面临怎样的挑战和困难？本次向大家分享小米对 Wasm 技术在 IoT 应用中的实践与思考

## 了解更多技术干货

使用钉钉搜索群号：**34197075**，即可加入，获取一手开源技术干货；

或微信扫码关注“金融级分布式架构”微信公众号👇

>![](https://gw.alipayobjects.com/zos/bmw-prod/75d7bde6-1f48-4f28-80a4-215f8ec811bd.webp)
