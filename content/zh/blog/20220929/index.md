---
title: "开源项目文档社区化！Tongsuo/铜锁实践"
authorlink: "https://github.com/sofastack"
description: "开源项目文档社区化！Tongsuo/铜锁实践"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2022-09-29T15:00:00+08:00
cover: "https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8751bce7c2484ee79b7b21b566735d25~tplv-k3u1fbpfcp-watermark.image?"
---

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fb410a00ee1942ecb8699aa8d97dbab6~tplv-k3u1fbpfcp-zoom-1.image)  

文｜杨洋（花名：凯申 )

铜锁开源密码库创始人蚂蚁集团高级技术专家  

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4f7361f2198c4342bd48c4cf8b7e432c~tplv-k3u1fbpfcp-zoom-1.image)

本文 **1284** 字 阅读 **5** 分钟

**1 前言**

如大家所见，针对铜锁开源密码库（ *[https://github.com/Tongsuo-Project](https://github.com/Tongsuo-Project)*）的文档，我们正在逐步地进行一些改革。

其中，最大的一个变化是：**我们把原来放在 readthedocs.org（简记 rtfd.io）上的教程和说明文档转移到了语雀上**。

为此有必要和大家解释一下，这其中的原因以及背后的一些想法。

**2 说说历史原因**

铜锁开源项目自诞生以来，其文档管理不是那么的严格和统一。

铜锁派生自 OpenSSL ，而 OpenSSL 的文档则是以 perldoc 体系为核心，且混合了一部分的纯文本和 markdown 。OpenSSL 的这些文档内容均散落在 OpenSSL 源代码仓库的各个目录中。

对于 perldoc 所支持的 pod 格式的文件，可以被编译成多种不同最终格式的文档，这其中以 man 手册和 html 文件为主。  

综上所述，所以铜锁项目在早期延续了编写 pod 文件并编译成 html 和 man 手册的这种模式，随着项目的发展，我们发现此模式存在若干不足，例如： 

1. perldoc 这套体系过于古老，文档的编写依旧停留在“非可视化”的状态。且编译过程较为复杂，和 markdown 等相比不具备优势，也不够通用； 

2. man 手册也比较古老，是单机的本地模式。查询文档的功能较弱，效率较低，不如 readthedocs 这种可视化的查询文档的方式来得便捷； 
 
3. OpenSSL 的文档组织形式更多的是以 API 为出发点，而不是以“教程”为出发点，这对于很多新手用户来说无从下手。  

**3 早前的一些改进**

为了解决这些不足之处，铜锁项目将文档的重心从 API 视角切换到了教程视角，即以教会用户如何通过使用铜锁来完成某种功能为核心目标，重新组织了文档的形态，并以 markdown 写了若干教程类的文档。

这些文档需要一个呈现平台，因此我们选择了成熟的 readthdocs.org 作为铜锁文档的发布地（*[https://tongsuo.rtfd.io](https://tongsuo.rtfd.io)* ），并持续运行了一段时间。

在这之后，我们又发现了一些问题：

1.访问不便。readthedocs.org 是海外的文档托管网站，国内会出现访问比较慢甚至无法访问的状况；  

2.不容易交互。更多的是单方面的信息展示，用户真有问题还是要到 Github 上提交 issue，效率比较低。  

**4 “文档社区化”的诞生**

前段时间，我机缘巧合的参与了一档播客节目的录制

*（[https://www.ximalaya.com/zhubo/343307074](https://www.ximalaya.com/zhubo/343307074)）*。

在录制过程中，大家也讨论到：**是否可以将互动引入到开源社区的文档体系中，将开源项目的文档“社区化”，进而形成除了代码托管平台之外的、更加贴近最终用户的社区交流讨论形式**。

受此启发，我们最后决定尝试将铜锁的全部文档迁移到语雀上，利用语雀的社区化能力，增强铜锁和其用户间的互动。具体来说有如下几点：

1.新的文档网站地址为：*[https://yuque.com/tsdoc](https://yuque.com/tsdoc)* 。目前有两个知识库，铜锁的各种文档均分类到这些知识库中，而且都是对全网公开的，后续我们也会根据需要对知识库去做一些调整；  

2.用户可以在这些文档中进行评论；3.上述知识库的文档会每天同步备份到 Github 的指定仓库中；  

4.现有的 *[https://tongsuo.rtfd.io](https://yuque.com/tsdoc)* 将不再更新。

此外，对于 API ，我们也会重新进行梳理，将铜锁特有的 API 整理后供用户检索查询。希望大家能和我们一起参与这场“文档社区化”的试验，欢迎伙伴们充分发表自己的意见、建议以及想法，一起将这次试验更好地落地。

**本周推荐阅读**

[你好，我的新名字叫“铜锁/Tongsuo”](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247513818&idx=1&sn=e0884180a5401d4972bd9a8d3ed150be&chksm=faa35900cdd4d01669f732eb662e7c644caa663f6ae41dd3e3f8b28e77d72763e34c1935fe0d&scene=21)

[BabaSSL：支持半同态加密算法 EC-ElGamal](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247502645&idx=1&sn=efb490d530f4254a8b12dff89714ace7&chksm=faa324efcdd4adf9119222551a407da68e388fd1b3f652fc034860fee9d687311e2136bbd28c&scene=21) 

[BabaSSL 发布 8.3.0｜实现相应隐私计算的需求](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247502271&idx=1&sn=861bcea32cc766721bb6fd95361ef6eb&chksm=faa32665cdd4af73dcc42c51f79e6c61035cddf95ecad822ea6e85cb188c60cb85c9b8027484&scene=21)

[Seata AT 模式代码级详解](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247516247&idx=1&sn=f57bb355cef6b823a32cd8b30c0b53ee&chksm=faa36f8dcdd4e69b91a9231330f82af5558de9349425b97e2e88e6fb3f8b33845d93af156fb1&scene=21)
