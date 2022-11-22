---
title: "SOFA Weekly | 开源人、本周 Contributor & QA"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly |开源人、本周 Contributor & QA"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2022-11-18T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ"
---

## SOFA WEEKLY | 每周精选

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1e08fca65f7643c783d33f590bb41d5a~tplv-k3u1fbpfcp-zoom-1.image)

**筛选每周精华问答，同步开源进展，欢迎留言互动～**

**SOFA**Stack（**S**calable **O**pen **F**inancial **A**rchitecture Stack）是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

**SOFAStack 官网:** *[https://www.sofastack.tech](https://www.sofastack.tech)*

**SOFAStack:** *[https://github.com/sofastack](https://github.com/sofastack)*

### SOFAStack 社区本周 Contributor

![图片](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*4ks0QJSI7dsAAAAAAAAAAAAAARQnAQ)

### 每周读者问答提炼

***欢迎大家向公众号留言提问或在群里与我们互动，我们会筛选重点问题通过 " SOFA WEEKLY " 的形式回复***

**1.卓俊良** 提问：

>Q: 22. AT 模式和 Spring @Transactional 注解连用时需要注意什么 ？

A：@Transactional 可与 DataSourceTransactionManager 和 JTATransactionManager 连用，分别表示本地事务和 XA 分布式事务，大家常用的是与本地事务结合。当与本地事务结合时， @Transactional 和 @GlobalTransaction 连用，@Transactional 只能位于标注在 @GlobalTransaction 的同一方法层次或者位于 @GlobalTransaction 标注方法的内层。这里分布式事务的概念要大于本地事务，若将 @Transactional 标注在外层会导致分布式事务空提交，当 @Transactional 对应的 connection 提交时会报全局事务正在提交或者全局事务的 xid 不存在。

>如果要支持 istio1.14 是需要重新适配吗？还是说有其他简化的方式？

A：是需要适配下的，主要看新增了多少改动。

**「Seata」**：*[https://github.com/seata/seata](https://github.com/seata/seata)*

**2.快叫我去学习** 提问：

>Q: 34.Seata 的 JDK 版本要求是什么？ 

A：目前 Seata 支持的 JDK 版本为 JDK8、11。其余版本不确保 100% 兼容。

**「Seata」**：*[https://github.com/seata/seata](https://github.com/seata/seata)*

### 本周推荐阅读

[Dragonfly 中 P2P 传输协议优化](https://mp.weixin.qq.com/s/LE1Sx8Ska-4WyHgTh-HFvw)

[Nydus | 容器镜像基础](https://mp.weixin.qq.com/s/F2hazt39rpMiEHIh6lckDQ)

[SOFARegistry | 大规模集群优化实践](https://mp.weixin.qq.com/s/63zveAnZIWf6W4UWmWpwww)

[开源项目文档社区化！Tongsuo/铜锁实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247516387&idx=1&sn=c2531d25caf6e9fe0eb560180a048320&chksm=faa36f39cdd4e62f3a9611a02e9a276d7c7e1530d7b9c06ff3eef5a4e7d0950655d9a2c8f67b&scene=21)

欢迎扫码关注：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e19d0a6d7f734ad6a585cde82ae4f3bf~tplv-k3u1fbpfcp-zoom-1.image)
