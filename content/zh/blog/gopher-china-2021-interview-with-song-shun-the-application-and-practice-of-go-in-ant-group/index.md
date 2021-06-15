---
title: "Gopher China 2021 专访之宋顺：Go 在蚂蚁集团的应用、实践"
author: "SOFAStack"
authorlink: "https://github.com/sofastack"
description: "Gopher China 2021 专访之宋顺：Go 在蚂蚁集团的应用、实践"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2021-06-15T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*24RYSZWmV5gAAAAAAAAAAAAAARQnAQ"
---

>![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*GeGWTLnKpUIAAAAAAAAAAAAAARQnAQ)

GoCN：贵司从什么时候开始用 Go，基于什么原因，还记得第一个用 Go 的项目是什么吗?

宋顺：早在 2015 年，蚂蚁的基础设施团队就已经使用 Go 来尝试优化资源调度能力，当时还是基于 Docker Swarm 做的一些调度平台，这个时期没有持续太长就逐步切换到了 Kubernetes，蚂蚁内部的版本叫 Sigma，当前 Sigma 已经承担起了蚂蚁内部所有集群的资源调度，并且也在逐年提升资源利用率，为公司节省了不少的成本。

GoCN：现在有多少人用 Go，或者 Go 开发比例占到多少？

宋顺：目前 Go 主要用于蚂蚁的基础设施团队，在资源调度、弹性伸缩、安全容器、日志无盘、Service Mesh、Serverless 等场景中广泛应用，Go 的开发人员在基础设施团队内部占比高达 50% 以上，业务团队大部分还是以 Java 为主。

GoCN：Go 有哪些特性是非常匹配贵司业务和开发需求的，有哪些是让人很抓马的，希望有哪些改进？

宋顺：Go 的简单易学、安全编码、研发效率、活跃生态等特性是非常符合我们的需求的。抓马的主要还是性能，如大规模下 gc 抖动，调度延迟等。改进方面希望能够有比 channel 更轻量的 Go block/wake 机制，这块我们也在和社区讨论中：[https://github.com/golang/go/issues/46431](https://github.com/golang/go/issues/46431)

GoCN：目前来看 Go 在项目中普及的难度是什么，在招聘方面有困难吗?

宋顺：在基础设施层面普及没有太大难度，后续如果在业务团队中也能顺畅的使用 Go 还是需要我们的  Service Mesh 体系对多语言体系的支撑更加完善，让业务能更少的感知底层能力从而专注业务开发。我们即将开源的 Layotto 就是希望在 Runtime 层面通过统一的 API 定义，从而可以让各种语言都非常简单的享受到分布式架构的红利，为业务提效。
在招聘方面由于目前 Go 主要用于基础设施，所以我们需要的是对网络、系统内核、高性能有较多经验的人才，不过眼下这类人才还是比较稀缺的。

GoCN：希望招到具备哪方面能力的 Go 工程师？

宋顺：有高性能网络编程和性能优化经验，对分布式系统有较深理解，对 Go Runtime 有一定研究的 Gopher 工程师。

GoCN：对本次大会的期待是什么？

宋顺：希望了解 Go 在更多公司的实践经验、学习 Go 语言自身的特性演进以及和更多的 Gopher 现场交流。

### 本周推荐阅读

- [揭秘 AnolisOS 国密生态，想要看懂这一篇就够了](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247488577&idx=1&sn=172642c14cc511e27aa882ca7586a4c4&chksm=faa0fb9bcdd7728db0fdceec44b44bb93f36664cbb33e3c50e61fcc05dbc2647ff65dfcda3ee&scene=21)

- [蚂蚁云原生应用运行时的探索和实践 - ArchSummit 上海](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247488131&idx=1&sn=cd0b101c2db86b1d28e9f4fe07b0446e&chksm=faa0fd59cdd7744f14deeffd3939d386cff6cecdde512aa9ad00cef814c033355ac792001377&scene=21)

- [带你走进云原生技术：云原生开放运维体系探索和实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247488044&idx=1&sn=ef6300d4b451723aa5001cd3deb17fbc&chksm=faa0fdf6cdd774e03ccd9130099674720a81e7e109ecf810af147e08778c6582636769646490&scene=21)

- [稳定性大幅度提升：SOFARegistry v6 新特性介绍](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487799&idx=1&sn=3f2c120cd6d6e653e0d7c2805e2935ae&chksm=faa0feedcdd777fbebe262adc8ce044455e2056945460d06b5d3af3588dfd3403ca2a976fa37&scene=21)

更多文章请扫码关注“金融级分布式架构”公众号

>![](https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*s3UzR6VeQ6cAAAAAAAAAAAAAARQnAQ)
