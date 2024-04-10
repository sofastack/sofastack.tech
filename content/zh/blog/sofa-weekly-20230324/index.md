---
title: "SOFA Weekly | 本周贡献 & issue 精选"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly | 本周贡献 & issue 精选"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2023-03-24T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ"
---

## SOFA WEEKLY | 每周精选

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1e08fca65f7643c783d33f590bb41d5a~tplv-k3u1fbpfcp-zoom-1.image)

**筛选每周精华问答，同步开源进展，欢迎留言互动～**

**SOFA**Stack（**S**calable **O**pen **F**inancial **A**rchitecture Stack）是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

**SOFAStack 官网:** *[https://www.sofastack.tech](https://www.sofastack.tech)*

**SOFAStack:** *[https://github.com/sofastack](https://github.com/sofastack)*

### SOFAStack 社区会议

**Layotto**
主题：Layotto 社区会议
时间：3 月 29 号（下周三）下午 14 点
钉钉会议令：688 824 34655
电话呼入：+862759771621（中国大陆）+8657128356288（中国大陆）
钉钉入会链接：[dingtalk://dingtalkclient/page/videoConfFromCalendar?confId=1cebca80-e8cd-4f26-b529-79bac0ce7493&appendCalendarId=1&calendarId=2316789049](dingtalk://dingtalkclient/page/videoConfFromCalendar?confId=1cebca80-e8cd-4f26-b529-79bac0ce7493&appendCalendarId=1&calendarId=2316789049)

议题：

- 2023 开源之夏-课题/导师招募 #894
- Discussion: 自建各种 Component #902
- 希望 Layotto 提供高性能的通信交互能力 #867

欢迎感兴趣同学参加，有任何想交流讨论的议题可以直接留言。
想要参加社区建设的同学可以关注社区的新手任务列表，总有一个适合你。

「Layotto」：

[https://github.com/mosn/layotto/issues/907](https://github.com/mosn/layotto/issues/907)

### SOFAStack 社区本周贡献

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*IRkqSKufVB4AAAAAAAAAAAAADrGAAQ/original)

### SOFAStack GitHub issue 精选

**本周各项目回复 issue 共计 2 条**

欢迎大家在 GitHub 提交 issue 与我们互动

我们会筛选 issue 通过

" SOFA WEEKLY " 的形式回复

**1.@kunple-w  #916**

> SpringBoot 2.2 废弃了 logging.path，2.3 已删除该属性，应使用 logging.file.pat。
Steps to reproduce the behavior：

- 使用 SOFA 3.10.0，按照 SOFA guides 配置 logging.path，启动后并没有出现文档中的一些日志文件。
- 降级为 sample 中的 3.2.0 版本，日志文件出现。
截图如下（2 个属性同时配置）:
![](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*5dIhTbzK7KcAAAAAAAAAAAAADrGAAQ/original)
![](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*5dIhTbzK7KcAAAAAAAAAAAAADrGAAQ/original)

A：SOFA 中间件中使用 sofa-common-tools 打印的日志，日志空间和 SOFABoot 应用程序是隔离的。因此可以同时使用 logging.path 以及 logging.file.path 属性分别定义 SOFA 中间件和 SOFABoot 应用程序的日志路径。

**「SOFABoot」**：*[https://github.com/sofastack/sofa-boot/issues/1061](https://github.com/sofastack/sofa-boot/issues/1061)*

**2.@shuangchengsun  #263**

> 客户端的上下线，Client1 处于下线过程，此时 Client1 在路由表中的状态是如何维护的？
![](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*dsAsSK7YdF8AAAAAAAAAAAAADrGAAQ/original)

A：data 上有一个定时器去维护每个 Session 相关数据的，如果 Session 挂了，data 大约 30s 后把挂掉的 Session 的数据清理掉，同时链接挂掉的 Session 上的的 Client（除掉了下的 Client） 会自动重新连接到其他 Session 上，然后会把数据增加一个版本重新注册到 Session 上，Session 会再发到那台数据上。

**「SOFARegistry」**：*[https://github.com/sofastack/sofa-registry/issues/263](https://github.com/sofastack/sofa-registry/issues/263)*

### 本周推荐阅读

[应用运行时 Layotto 进入 CNCF 云原生全景图](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247501562&idx=1&sn=67f6fdf0d630ffefc1635b82651a1b2f&chksm=faa32920cdd4a03604cff93e9de80df78094a4211dee0d34409ec8a6edbf3d043615e9e7431d&scene=21)

[MOSN 子项目 Layotto：开启服务网格+应用运行时新篇章](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247488835&idx=1&sn=d645b9abc866048e679b56bfe3b72482&chksm=faa0fa99cdd7738ff1749ae75b1670f953c92b70dcf0358337977438fd74b632b21a7b17ece3&scene=21)

[降本增效：蚂蚁在 Sidecarless 的探索和实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247517989&idx=1&sn=1b49b68c9281d0c2514fa4caa38284fb&chksm=faa368ffcdd4e1e9fa5361d6ea376bbc426272c7a32250cc67ae27dcd84a6113b4a016a1518d&scene=21)

[如何看待 Dapr、Layotto 这种多运行时架构](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247510516&idx=1&sn=eff21915cd0ac1a8c8e3f126b549a605&chksm=faa3462ecdd4cf38ab6ab0c7201902fb53d54cea4865f9b7d7cdcdc7eaa00cf354d8b05e5393&scene=21)

欢迎扫码关注：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e19d0a6d7f734ad6a585cde82ae4f3bf~tplv-k3u1fbpfcp-zoom-1.image)
