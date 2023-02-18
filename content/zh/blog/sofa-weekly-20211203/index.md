---
title: "SOFA Weekly | 社区本周 Contributor、QA 整理、新手任务计划"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly | 社区本周 Contributor、QA 整理、新手任务计划"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2021-12-03T15:00:00+08:00
cover: "https://gw.alipayobjects.com/zos/bmw-prod/5bcdff25-e21a-43ab-8e34-04305cd379ae.webp"
---

SOFA WEEKLY | 每周精选，筛选每周精华问答

同步开源进展，欢迎留言互动

![weekly.jpg](https://gw.alipayobjects.com/zos/bmw-prod/5bcdff25-e21a-43ab-8e34-04305cd379ae.webp)

SOFAStack（Scalable Open Financial Architecture Stack)是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

SOFAStack 官网: [https://www.sofastack.tech](https://www.sofastack.tech/)

SOFAStack: [https://github.com/sofastack](https://github.com/sofastack)

### SOFA&MOSN 社区 本周 Contributor

![img](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*BY4ISKHcjWcAAAAAAAAAAAAAARQnAQ)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动

我们会筛选重点问题

通过 " SOFA WEEKLY " 的形式回复

**@xj** 提问：

>请问在 UseNetpollMode 模式下，for 循环读取链接里面的数据，那么如果遇到链接数据源源不断的情况：比如刚 readOnce 读取完毕所有数据后，再下一个循环，又有数据被写入到链接接收缓冲区里面，那么又会继续读取到。此时会损耗很多时间处理这个链接的 io 事件，影响其他链接的处理。

![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*YfEIQbl7Tn4AAAAAAAAAAAAAARQnAQ)

A：执行久了这个协程会被 runtime 调度走哟,当然也可以多少次 read 就主动 schedule, 这个可能就要看压测数据了，配置多少合适。最开始 nginx 也是存在类似问题。

[https://github.com/nginx/nginx/commit/fac4c7bdf53ee7d8fec6568f1e9fecefcde6feba#diff-8f5c3450fb35200b97b96bb249ca15d6](https://github.com/nginx/nginx/commit/fac4c7bdf53ee7d8fec6568f1e9fecefcde6feba#diff-8f5c3450fb35200b97b96bb249ca15d6)

![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*jCGgSJhkOsMAAAAAAAAAAAAAARQnAQ)

「MOSN」：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

**@子旦** 提问：

>请教下群里的大佬，SOFARPC 相较于 Dubbo RPC 的优势在哪？有没有相关资料，求分享～

A：可以看下 FAQ 里面有描述。

[https://www.sofastack.tech/projects/sofa-rpc/faq/](https://www.sofastack.tech/projects/sofa-rpc/faq/)

「SOFARPC」：[https://github.com/sofastack/sofa-rpc](https://github.com/sofastack/sofa-rpc)

**@福自奇** 提问：

>5 个 jraft 节点，一个节点挂了没及时维修，剩下四个节点两两网络分区，2|2，此时集群是不是不可用了。

![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*JvpqR4IPBZUAAAAAAAAAAAAAARQnAQ)

A：是，因为已经多数派不可用了（最多只有 2 个节点可用）。

「SOFAJRaft」：[https://github.com/sofastack/sofa-jraft](https://github.com/sofastack/sofa-jraft)

**@福自奇** 提问：

>bolt 下面输出的日志，jraft 提供了归档或者自动删除的选项吗？现在发现 bolt 下面的日志占用内存 7g 了，是要自己写脚本定时删除吗？

A：日志没有自动删，可以自己用脚本删。

>这个如果没有节点异常，好像不会打？只有节点挂了才会打？

A：bolt 日志正常都会有，如果想关掉可以看下 GitHub 上最新被 close 的 issue。

「SOFAJRaft」：[https://github.com/sofastack/sofa-jraft](https://github.com/sofastack/sofa-jraft)

### SOFAStack&MOSN:新手任务计划

作为技术同学，你是否有过“想参与某个开源项目的开发、但是不知道从何下手”的感觉？

为了帮助大家更好的参与开源项目，SOFAStack 和 MOSN 社区会定期发布适合新手的新手开发任务，帮助大家 learning by doing!

**SOFARPC**

- Easy

优化集成 Nacos、ZK 注册中心的文档

- Medium

让用户使用@SOFAService 后不需要再写@Component

优化 SOFARPC 的异步编程体验

- Hard

JFR 埋点

「详细参考」：

[https://github.com/sofastack/sofa-rpc/issues/1127](https://github.com/sofastack/sofa-rpc/issues/1127)

**Layotto**

- Easy

开发 in-memory 组件

fail fast，让 Layotto 启动报错时自杀

为 Java SDK 新增分布式锁 API

为 Java SDK 新增分布式自增 ID API

- Medium

开发 Python 或 C++、SDK

开发 Spring-Boot-Laytto

- Hard

集成 Jaeger 等 tracing 系统

「详细参考」：

[https://github.com/mosn/layotto/issues/108#issuecomment-872779356](https://github.com/mosn/layotto/issues/108#issuecomment-872779356)

### 本周推荐阅读 

- [降本提效！注册中心在蚂蚁集团的蜕变之路](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247498209&idx=1&sn=7dbfd98e922d938ffce24986945badef&chksm=faa3163bcdd49f2d3b5dd6458a3e7ef9f67819d8a1b5b1cbb3d10ab3b7cda12dd7a3d2971a9e&scene=21#wechat_redirect)

- [如何在生产环境排查 Rust 内存占用过高问题](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247497371&idx=1&sn=8b98f9a7dad0ac99d77c45d12db626be&chksm=faa31941cdd49057ec6aa23b5541e0b1ce49574808f55068a0b3c0bc829ef281c47cfba53f59&scene=21)

- [新一代日志型系统在 SOFAJRaft 中的应用](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247497065&idx=1&sn=41cc54dbca1f9bb1d2e50dbd181f062d&chksm=faa31ab3cdd493a52bac26736b2d66c9fcda77c6591048ae758f9663ded0a1a068947a8488ab&scene=21)

- [终于！SOFATracer 完成了它的链路可视化之旅](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247496554&idx=1&sn=b6c292ee9b983a2344f2929390fe15c4&chksm=faa31cb0cdd495a6770720e631ff338e435998f294145da18c04bf34b82e49d2f028687cad7f&scene=21)

>![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*7h5NRow08IQAAAAAAAAAAAAAARQnAQ)
