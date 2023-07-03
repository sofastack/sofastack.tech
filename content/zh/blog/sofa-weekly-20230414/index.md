---
title: "SOFA Weekly｜SOFA 开源五周年来自社区家人的祝福、社区本周贡献 & issue 精选"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly｜SOFA 开源五周年来自社区家人的祝福、社区本周贡献 & issue 精选"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2023-04-14T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ"

---

## SOFA WEEKLY | 每周精选

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1e08fca65f7643c783d33f590bb41d5a~tplv-k3u1fbpfcp-zoom-1.image)

**筛选每周精华问答，同步开源进展，欢迎留言互动～**

**SOFA**Stack（**S**calable **O**pen **F**inancial **A**rchitecture Stack）是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

**SOFAStack 官网:** *[https://www.sofastack.tech](https://www.sofastack.tech)*

**SOFAStack:** *[https://github.com/sofastack](https://github.com/sofastack)*

**社区本周贡献** 

![图片](https://mmbiz.qpic.cn/mmbiz_jpg/nibOZpaQKw09t9c3svD0QAtJibIL9KtH4AicXF6iaLNkW1qR3n5uHydbmJ9zLfnVicGiab0oN0ljmR7ou6yOOVX2sFaQ/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)

 **SOFAStack GitHub issue 精选** 

**本周各项目回复 issue 共计 2 条**

欢迎大家在 GitHub 提交 issue 与我们互动

我们会筛选 issue 通过 

" SOFA WEEKLY " 的形式回复

**1.@SOFAJRaft **#965 提问：

@a364176773

> RheaKV 中的 RocksDB 为何不支持选择其他压缩方式和压缩风格？
>
> 貌似可以靠`StorageOptionsFactory.registerRocksDBOptions`注册进去，这样就不会走 default 了？

A：是的，可以设置自己的选项。

「**SOFAJRaft**」：[https://github.com/sofastack/sofa-jraft/issues/965](https://github.com/sofastack/sofa-jraft/issues/965)

**2.@SOFARPC**#1320

@Misakami

> Spring Boot 3.1 + JDK 17 SOFARPC 显示发布成功但是客户端获取不到服务。

A：看上去获取不到服务和 JDK17 并没有直接的联系。可以先确认:

1. 服务端是否将自身地址发布到注册中心；

2. 客户端是否接收到注册中心的推送。

「**SOFARPC**」：[https://github.com/sofastack/sofa-rpc/issues/1320](https://github.com/sofastack/sofa-rpc/issues/1320)

  **本周推荐阅读** 

[缘起｜蚂蚁应用级服务发现的实践之路](https://mp.weixin.qq.com/s/-oVOeakwefgvlFyi6yYgKA)

[SOFARegistry | 聊一聊服务发现的数据一致性](https://mp.weixin.qq.com/s/nPHSYWk74lJuRrHe7SlWdw)

[Go 语言，如何做逆向类型推导](https://mp.weixin.qq.com/s/dDrOd3C1tnDVdmWbRFx3ug)

[降本增效：蚂蚁在 Sidecarless 的探索和实践](https://mp.weixin.qq.com/s/7sGSm3kZ2P2Q8mMo3OCxQA)

![图片](https://mmbiz.qpic.cn/mmbiz_jpg/nibOZpaQKw0icFMvfmJYE2gzNBePWwuuickPbVLQXdjXHytsPOr7fibEPjbYY2TZU8BcwsrJzoLVGQt7j9qJcF6aqw/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)
