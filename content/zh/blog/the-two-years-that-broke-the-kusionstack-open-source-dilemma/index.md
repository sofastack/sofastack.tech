---
title: "KusionStack 开源有感｜历时两年，打破“隔行如隔山”困境"
authorlink: "https://github.com/sofastack"
description: "KusionStack 开源有感｜历时两年，打破“隔行如隔山”困境"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2022-06-07T15:00:00+08:00
cover: "https://img.alicdn.com/imgextra/i4/O1CN015yWboM1uc9jASecOU_!!6000000006057-2-tps-900-383.png"
---
![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/67f20987d1bf491bbacdeb80b162d739~tplv-k3u1fbpfcp-zoom-1.image)

文｜朵晓东（花名：奕杉 )

KusionStack 负责人、蚂蚁集团高级技术专家

在基础设施技术领域深耕，专注云原生网络、运维及编程语言等技术工作

本文 **2580** 字 阅读 **6** 分钟

### **｜前言｜**

本文撰写于 KusionStack 开源前夕，作者有感而发，回顾了团队从 Kusion 项目开发之初到现今成功走上开源之路的艰辛历程。当中既描述了作者及其团队做 Kusion 项目的初心和项目发展至今的成果，也表达了作者自身对团队的由衷感激，字里行间都散发着真情实感。

**KusionStack 是什么？**

**KusionStack 是开源的可编程云原生协议栈！**

Kusion 一词来源于 fusion *（意为融合）* ，希望通过一站式的技术栈融合运维体系的多个角色，提升运维基础设施的开放性、扩展性，从整体上降本增效。KusionStack 通过定义云原生可编程接入层，提供包括配置语言 KCL、模型界面、自动化工具、最佳实践在内的一整套解决方案，连通云原生基础设施与业务应用，连接定义和使用基础设施的各个团队，串联应用生命周期的研发、测试、集成、发布各个阶段，服务于云原生自动化系统建设，加速云原生落地。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d53b08f96c604fea86bb509a5dd718e6~tplv-k3u1fbpfcp-zoom-1.image)

## **PART. 1**

### **为了一个理想的运维体系**

2019 年秋，MOSN 的工作已持续了近两年，期间我们逐步完成了在支付宝核心链路的形态验证。整个过程中除了 MOSN 本身面对的种种技术挑战和困难，所谓的云原生技术红利，实际上也已经掣肘于运维系统固化所造成的效率制约。

有一天主管找我吃饭 *（下套）* ，期间向我描述了他理想中的运维体系：

他希望 SRE 能通过一种专用语言来编写需求，通过写代码来定义基础设施的状态，而不是花费极大的精力在检查、发现、修复的循环上。基础设施团队则通过提供开放的可编程语言和工具支撑不同诉求的 SRE 团队，达到更高的整体 ROI。

我立刻意识到这和 Hashicorp 的 Terraform 神之相似 *（后来 Hashicorp 在 2021 年底上市，以超过 150 亿美元的市值成为迄今为止市值最高的一次开源 IPO）* 。另一方面，不同于 IaaS 交付场景，蚂蚁面对着大量更规模化、复杂度更高的云原生 PaaS 场景，又让我想到了 Google 内部运用专用语言、工具等技术开放 Borg[1]运维能力的实践[2]，当时感觉这是一个既有意思又有挑战的事[3]。

饭桌上我们聊了一些思路以及一些还不太确定的挑战，他问我想不想搞一个试试，搞不成也没关系。当时没想太多，饭没吃完就答应了。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/279629e0e675451587307d8b63a41ec7~tplv-k3u1fbpfcp-zoom-1.image)

## **PART. 2**

### **漫长的学习、探索与实践**

**隔行如隔山。**

没有过语言设计研发的经验，也没有过开放自动化系统设计的经验，项目开展之初，我们就陷入了举步维艰的困境。

经历了一段漫长时间的学习、摸索和实践的反复循环之后，项目依旧没有大的起色，更困难的是我们不但要面对蚂蚁内部复杂又耦合的场景和问题，还要经受「这种高度工程化的方式在蚂蚁是否有生存土壤」的质疑。

屋漏偏逢连夜雨，期间又令人惋惜且无奈的经历了一些人事变化，同时由于种种原因，项目一度陷入了各种困境。整个 2020 年，我们在未知、纠结、无奈中度过…… 

感谢瓴熙、庭坚和我的主管，感谢你们当时没有放弃这个项目，依然与我一同坚守。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/48d64392c97943b1bad787c02a6c0cd1~tplv-k3u1fbpfcp-zoom-1.image)

## **PART. 3**

### **痛并快乐的孵化之旅**

通过持续地布道、交流和沟通，我们逐步在基础设施技术团队和 SRE 团队找到了更多有共识的朋友。

同时在技术上，我们亦脱离了迷茫，真正意义上地启动了 Kusion 项目，也成功地从 PoC 过渡到了 MVP 的阶段。

**最终，我们以“非标”应用为切入点，开始了痛并快乐着的孵化之旅。**

感谢零执、青河、子波、李丰、毋涯、向野、达远……在这里无法一一列举，感谢你们的坚持让这个想法逐步成为现实。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b9b8b44a4e7240e394988b26374e6780~tplv-k3u1fbpfcp-zoom-1.image)

## **PART. 4**

### **突破与进展**

略过中间的种种探索和实践，回顾这段历程，在这一年多的时间里我们结合了编译技术、运维及平台技术，成功建立了一个基于 Kusion 可编程技术栈的运维体系。

在业务场景上，项目覆盖了从 IaaS 到 SaaS 的大量运维场景，截至目前共接入了 **800+** 应用，覆盖 **9** 个 BG，**21** 个 BU，其中典型案例交付运维提效 **90%** 以上，这也是蚂蚁内部第一次将大量异构应用纳入到一整套运维技术栈。

在蚂蚁我们基于云原生容器和微服务技术深入探索了 DevOps、CICD 实践，完善了蚂蚁的云原生技术体系，逐步释放了云原生效率红利，同时形成了一个近 **300** 人的虚拟运维研发团队。

不同职能不同团队的参与者凝聚在一起解决各自所面对的问题，贡献了 3W+ commit 和 35W+ 行代码，有一些参与者自发成为 Kusion 的研发者 。我认为这些工程师文化理念和领域知识的积累带来了远超运维业务本身的价值。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/015dcf0d68fa42f88aea838bdfb68524~tplv-k3u1fbpfcp-zoom-1.image)

此外，Kusion 也成为了可编程基线产品、云原生运维产品、多云交付产品等新一代运维产品的基础技术，成为蚂蚁运维体系架构升级的一部分。

不忘初心，我们希望通过技术手段促进与运维参与方的合作关系的合理化、基于开放技术栈的自动化，以及运维数据与知识的沉淀积累，以达到整体协作运维效率的不断提升。

同时，因蚂蚁内部运维场景较多且链路复杂，每个环节都需要最懂运维业务的 SRE 密切参与，与平台、应用研发协同工作，最终各环节联合在一起形成了一套完整的运维体系，在这样的思路下开放技术也会越来越重要。

平台研发、SRE、应用研发等多种角色协同编写的代码是一种数据的沉淀，亦是一种业务知识的沉淀，基于这些数据和知识，未来会有更多的可能性。

## **PART. 5**

### **走上开源之路**

在历经了一段内部探索之后，我们希望把 KusionStack 开源到技术社区。因为我们意识到自身面对的问题，其他公司、团队其实也同样正在面对。借助开源这件事，我们希望团队的这些工作成果能对更多人有所帮助。

当然，也受限于自身能力以及精力和资源的投入，我们希望能有更多朋友参与进来，与我们共同去完善 KusionStack，不论你是工作在云原生、运维自动化、编程语言或者是编译器中的哪一个领域，我们都非常期待和欢迎你的加入。

## **PART. 6**

### **期待与你共成长**

这段经历对我来说异常宝贵，不仅仅是在于自身再一次在新的技术领域和蚂蚁的技术升级方面尝试了新的探索并实现了突破，更宝贵的是，自己还拥有了一段与一群人均 95 后的小伙伴一起将想法落地实现的奇幻历程。

在未来， Kusion 的朋友圈不再局限于蚂蚁内部，面向开源，我们期待着能有更多的社区朋友在 KusionStack 与我们共同成长！

**了解更多...**

**KusionStack Star 一下✨：**

*[https://github.com/KusionStack](https://github.com/KusionStack)*

KusionStack 的开源，希望能对大家有所帮助，也希望能跟更多朋友共同完善 KusionStack。欢迎对云原生、运维自动化、编程语言、编译器感兴趣的同学一起参与社区共建，在新的技术领域升级方面进行探索和突破，实现更多新的想法。

点击文末**[阅读原文](https://github.com/KusionStack)**直达项目地址。

**【参考链接】**

[1]《Large-scale cluster management at Google with Borg》：*[https://pdos.csail.mit.edu/6.824/papers/borg.pdf](https://pdos.csail.mit.edu/6.824/papers/borg.pdf)*

[2]Configuration Specifics：*[https://sre.google/workbook/configuration-specifics/](https://sre.google/workbook/configuration-specifics/)*

[3]《Borg, Omega, and Kubernetes》：*[https://queue.acm.org/detail.cfm?id=2898444](https://queue.acm.org/detail.cfm?id=2898444)*

**【本周推荐阅读】**

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5d1e4263e1ca44abb8b8651bbfa4ebea~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247491634&idx=1&sn=8359805abd97c598c058c6b5ad573d0d&chksm=faa30fe8cdd486fe421da66237bdacb11d83c956b087823808ddaaff52c1b1900c02dbf80c07&scene=21)

KCL：声明式的云原生配置策略语言

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b91385b64e694b9293a646177aef2115~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247509944&idx=1&sn=e0e45403aa4fab624a2147bae6397154&chksm=faa34862cdd4c1747bd6a419c4eb2c2cd0244d9587179aabbbf246946ed28a83636ab9cedc86&scene=21)

精彩回顾｜KusionStack 开源啦～

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3085c632f19b48d7a49b0a86074ffaaa~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247510027&idx=1&sn=43a8f240d7edd036307d0f1fdd616714&chksm=faa347d1cdd4cec7adf7762963a94617060d96decba99beffb44d5f940e5a7f076b0844c4ab0&scene=21)

【GLCC】编程夏令营 高校学生报名正式开始！

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d5c7629517a54a3481bb79c2af7ac851~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247509391&idx=1&sn=95883f61905cc4de15125ffd2183b801&chksm=faa34a55cdd4c3434a0d667f8ed57e59c2fc747315f947b19b23f520786130446b6828a68069&scene=21)

蚂蚁集团 Service Mesh 进展回顾与展望｜SOFAStack 四周年

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/741bdb3afb5c47fe908027dd2c75b43a~tplv-k3u1fbpfcp-zoom-1.image)
