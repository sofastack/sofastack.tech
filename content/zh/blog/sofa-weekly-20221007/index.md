---
title: "SOFA Weekly | C 位大咖说 & QA"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly | C 位大咖说 & QA"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2022-10-07T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ"
---

## SOFA WEEKLY | 每周精选

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1e08fca65f7643c783d33f590bb41d5a~tplv-k3u1fbpfcp-zoom-1.image)

**筛选每周精华问答，同步开源进展，欢迎留言互动～**

**SOFA**Stack（**S**calable **O**pen **F**inancial **A**rchitecture Stack）是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

**SOFAStack 官网:** *[https://www.sofastack.tech](https://www.sofastack.tech)*

**SOFAStack:** *[https://github.com/sofastack](https://github.com/sofastack)*

**每周读者问答提炼**

欢迎大家向公众号留言提问或在群里与我们互动,我们会筛选重点问题通过 " SOFA WEEKLY " 的形式回复

**1. greedying** 提问：

>我发现 MOSN 去 cookie 时候，如果取不到，则返回中横线。这里万一 cookie 值就是中横线怎么办呢？

A：你用啥接口取的？

>用变量取的,前缀加 cookie 的 key。
>>![](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*pFrBQLPKPT8AAAAAAAAAAAAADrGAAQ/original)
>>MOSN 代码就是这么写的，那个 ValueNotFound 是一个短横，这是一个 feature 还是 bug？

A：哦 确实，这儿应该返回 error 就行了，不然任何值都有可能不对。
![](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*3neXRYi9msgAAAAAAAAAAAAADrGAAQ/original)
要这样处理才合理，通过 error 来判断了。

**「MOSN」**：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

**2. 卿同学** 提问：

>我看 Layotto 也在推动和 Envoy 的融合，这一块现在有进展吗？

A：今年我们首先会开源 Envoy 的 cgo 插件，然后基于这个插件，可以把 Layotto 跑在 Envoy 上。

**「Layotto」**：[https://github.com/mosn/layotto](https://github.com/mosn/layotto)

**本周推荐阅读**

[cgo 机制 - 从 c 调用 go](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247516398&idx=1&sn=2172b6f6ffe9c8b3263a15ef60ee3d54&chksm=faa36f34cdd4e622746582f922cd00798a1044c4f32a7ce058be6df91b58cbee725022a56525&scene=21#wechat_redirect)

[开源项目文档社区化！Tongsuo/铜锁实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247516387&idx=1&sn=c2531d25caf6e9fe0eb560180a048320&chksm=faa36f39cdd4e62f3a9611a02e9a276d7c7e1530d7b9c06ff3eef5a4e7d0950655d9a2c8f67b&scene=21#wechat_redirect)

[Go 内存泄漏，pprof 够用了么？](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247516046&idx=1&sn=c8ed0fbbc18b4377778c2ed06c7332ba&chksm=faa35054cdd4d9425b6780ae5ed1a6b83ab16afd9d870affba350c8002a2c4e2efdb85abc603&scene=21#wechat_redirect)

[Seata AT 模式代码级详解](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247516247&idx=1&sn=f57bb355cef6b823a32cd8b30c0b53ee&chksm=faa36f8dcdd4e69b91a9231330f82af5558de9349425b97e2e88e6fb3f8b33845d93af156fb1&scene=21#wechat_redirect)

**欢迎扫码关注**

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7091a7c36cec45f292225f4e9c92161e~tplv-k3u1fbpfcp-zoom-1.image)
