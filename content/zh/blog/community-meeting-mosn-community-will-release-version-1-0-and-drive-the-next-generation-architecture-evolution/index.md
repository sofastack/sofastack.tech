---
title: "社区会议｜MOSN 社区将会发布 1.0 版本，同时推动下一代架构演进"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "社区会议｜MOSN 社区将会发布 1.0 版本，同时推动下一代架构演进"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2022-02-28T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*lAtuRplti7AAAAAAAAAAAAAAARQnAQ"
---

2 月 24 日，MOSN 举办了 2022 年首次的社区会议。

MOSN 社区在会议上提出了新一年的 Roadmap，社区成员分享了 MOSN 在不同场景下落地实践的经验，以及大家一起大开脑洞，探讨了更多我们可以创造的可能性。

## MOSN 社区 Roadmap

MOSN 在 2022 年主要的目标是发布 MOSN 1.0，以及开源一个新的开箱即用的产品。同时推动 MOE （ MOSN 2.0 架构）演进，对接更多的生态组件。

![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*Ixb6RJN2vcQAAAAAAAAAAAAAARQnAQ)

随着 MOSN 的落地用户越来越多，稳定性建设也是今年的重点发展方向，让大家用得放心。

## 社区会议分享嘉宾

来自探探科技、阿里云、去哪儿网的用户，在本次会议中都积极分享了自己的使用案例，供大家借鉴参考。

### 探探科技

谢正尧同学详细地列出了 MOSN 落地过程中遇到的问题和踩到的坑，给 MOSN 的后续优化提供了很好的思路。

有不少坑我们都已经安排上了日程，MOSN 的开发者都赶在填坑的路上。

![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*DQpOQouC6vQAAAAAAAAAAAAAARQnAQ)

### 阿里云

沐沂同学列出了新财年的规划，和大家分享了边缘的跨集群服务发现场景的租户拆分，以及新的部署形式。

![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*qCmcSYa11wYAAAAAAAAAAAAAARQnAQ)

### 去哪儿网

佳龙同学比较关注 Roadmap 中的 GC 方面，希望可以引入一些高性能的网络框架，对性能优化方面有更多的需求。

以及很期待 MOSN 社区的 holmes，希望可以解决查问题时的难题。

![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*OdzYSrl4So4AAAAAAAAAAAAAARQnAQ)

## QA 回顾

1.Q：MOE 的落地场景、最佳实践的博客有哪些？

A：具体内容我们会在 Service Mesh Summit 2022 首届服务网格峰会进行分享。今年会有更多的落地场景，在尝试替换接入层网关，也会试点上线的，可以期待一下！

![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*VIqdR54MUsoAAAAAAAAAAAAAARQnAQ)

2.Q：我可不可以理解为——假如 MOE 在 Envoy 被接收后，可以通过 Go 代码去写一个 filter，让它跑在 Envoy 上，之后我的数据链直接用 Envoy 就可以？

A：是的，就这个意思。现在我们的 demo 就可以玩起来了，只是有些接口还没标准化，现在我们内部落地的 sofagw 就是这个架构。

「demo 文档」⬇️：
[https://github.com/mosn/mosn/blob/master/pkg/networkextention/README-cn.md](https://github.com/mosn/mosn/blob/master/pkg/networkextention/README-cn.md)

3.关于 GC 优化方式的讨论 

A：（1）降低 GC 频率确实是有效的，可以减少长期存活对象的重复 mark。（2）不过这种预分配的，其实不是很灵活，最好的还是动态调整 GC Percent，保持 GC goal 在预期的水位。

本质上是一个内存换 CPU 的方案，在内存够用的时候，提高 GC goal 的水位。

我们搞 holmes 内存异常捕获的时候，也考虑过这种情况。[https://uncledou.site/2022/go-pprof-heap/](https://uncledou.site/2022/go-pprof-heap/)

大家在本次会议中畅所欲言，大开脑洞。也正是与使用用户的沟通交流，让 MOSN 的发展规划和用户需求相辅相承。  

感谢大家的积极配合，在你们的帮助下，MOSN 社区会持续推动性能优化、技术落地，与用户共同成长。

我们之后还会举办社区会议，比如在 MOSN 发布新版本或者有大进展时。听取用户反馈，同步业界动态，期待下次会议啦～

想要预定下次的社区会议,了解更多 MOSN 社区动态,钉钉搜索:21992058

## 本周推荐阅读

[开启云原生 MOSN 新篇章 — 融合 Envoy 和 GoLang 生态](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247490185&idx=1&sn=cfc301e20a1ae5d0754fab3f05ea094a&chksm=faa0f553cdd77c450bf3c8e34cf3c27c3bbd89092ff30e6ae6b2631953c4886086172a37cb48&scene=21)

[MOSN 多协议扩展开发实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247488899&idx=1&sn=5558ae0a0c23615b2770a13a39663bb3&chksm=faa0fa59cdd7734f35bea5491e364cb1d90a7b9c2c129502da0a765817602d228660b8fbba20&scene=21)

[Service Mesh 在中国工商银行的探索与实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247499122&idx=1&sn=9733d1c015e7b0e8e64bd5cf44118b10&chksm=faa312a8cdd49bbec97612e9756ef4372c446c410518a04bd0ae990a60fea9b8e78025e60c6d&scene=21#wechat_redirect)

[云原生运行时的下一个五年](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247498935&idx=1&sn=7b9976f41a35eba7db6025ff42ba7086&chksm=faa3136dcdd49a7b67baf40f78cf50cbd45d560a249d2d94af85af9fb9cf63b9e7be59f3dcc8&scene=21#wechat_redirect)

![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*tvfDQLxTbsgAAAAAAAAAAAAAARQnAQ)
