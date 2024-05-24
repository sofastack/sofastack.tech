---
title: "SOFA Weekly | 本周贡献 & issue 精选"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly | 本周贡献 & issue 精选"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2023-03-31T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ"
---

## SOFA WEEKLY | 每周精选

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1e08fca65f7643c783d33f590bb41d5a~tplv-k3u1fbpfcp-zoom-1.image)

**筛选每周精华问答，同步开源进展，欢迎留言互动～**

**SOFA**Stack（**S**calable **O**pen **F**inancial **A**rchitecture Stack）是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

**SOFAStack 官网:** *[https://www.sofastack.tech](https://www.sofastack.tech)*

**SOFAStack:** *[https://github.com/sofastack](https://github.com/sofastack)*

### SOFAStack 社区会议

**SOFAArk**
背景：SOFAArk 在社区开源将近 5 年，从最初的一个类隔离框架，逐步演进为支持合并部署与热部署的 “Serverless” 运行时框架。尤其在去年我们完成了 SOFAArk 1.0 到 2.0 架构的演进，在蚂蚁也基于 SOFAArk 2.0 完成了 Serverless 研发模式初步的规模化落地。

主题：SOFAArk 社区化运作方式 KO（暨第一次月会）
时间：4 月 3 日（下周一）20:00
入会口令（钉钉）：683 550 26227
电话呼入：+862759771614（中国大陆）+8657128356290（中国大陆）
入会链接：[https://meeting.dingtalk.com/j/hv0CVKasIgs](https://meeting.dingtalk.com/j/hv0CVKasIgs)

议题：

- SOFAArk 社区化运作计划同步与讨论；
- 版本维护策略公告；
- 项目 CY23 开源规划（含新人培养计划）；
- 本次月会 issue 讨论。

欢迎感兴趣同学参加，有任何想交流讨论的议题可以直接留言。

「SOFAArk」：

[https://github.com/sofastack/sofa-ark/issues/635](https://github.com/sofastack/sofa-ark/issues/635)

### SOFAStack 社区本周贡献

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*MgstQrvozwUAAAAAAAAAAAAADrGAAQ/original)

### SOFAStack GitHub issue 精选

**本周各项目回复 issue 共计 2 条**

欢迎大家在 GitHub 提交 issue 与我们互动

我们会筛选 issue 通过

" SOFA WEEKLY " 的形式回复

**1.@Misakami  #1321**

> 请问 sofa-rpc 有支持 jdk 17 的计划么？现在虽然能正常使用，但是需要在启动参数加上 --add-opens java.base/java.lang=ALL-UNNAMED。

A：有的，近期也正在做兼容 jdk 17 的开发。

**「SOFARPC」**：*[https://github.com/sofastack/sofa-rpc/issues/1321](https://github.com/sofastack/sofa-rpc/issues/1321)*

**2.@googlefan  #939**

> jraft-spring-boot-starter || NodeManager 设计目的的作用?
看到 jraft-core 有提供 NodeManage.nodeMap 这个针对 Node 节点进行管理的实例，我以为可以通过 NodeManage.nodeMap 来获取所有集群节点的 RPC 服务，如果是这样的话，这个类的设计的目的是?

A：NodeManager 是 jraft 内部为了实现单个进程内多个 raft group 共享同一个网络端口设计的，不是给集成着或者用户使用的。

**「SOFAJRaft」**：*[https://github.com/sofastack/sofa-jraft/issues/939](https://github.com/sofastack/sofa-jraft/issues/939)*

### 本周推荐阅读

[应用运行时 Layotto 进入 CNCF 云原生全景图](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247501562&idx=1&sn=67f6fdf0d630ffefc1635b82651a1b2f&chksm=faa32920cdd4a03604cff93e9de80df78094a4211dee0d34409ec8a6edbf3d043615e9e7431d&scene=21)

[MOSN 子项目 Layotto：开启服务网格+应用运行时新篇章](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247488835&idx=1&sn=d645b9abc866048e679b56bfe3b72482&chksm=faa0fa99cdd7738ff1749ae75b1670f953c92b70dcf0358337977438fd74b632b21a7b17ece3&scene=21)

[降本增效：蚂蚁在 Sidecarless 的探索和实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247517989&idx=1&sn=1b49b68c9281d0c2514fa4caa38284fb&chksm=faa368ffcdd4e1e9fa5361d6ea376bbc426272c7a32250cc67ae27dcd84a6113b4a016a1518d&scene=21)

[如何看待 Dapr、Layotto 这种多运行时架构](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247510516&idx=1&sn=eff21915cd0ac1a8c8e3f126b549a605&chksm=faa3462ecdd4cf38ab6ab0c7201902fb53d54cea4865f9b7d7cdcdc7eaa00cf354d8b05e5393&scene=21)

欢迎扫码关注：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e19d0a6d7f734ad6a585cde82ae4f3bf~tplv-k3u1fbpfcp-zoom-1.image)
