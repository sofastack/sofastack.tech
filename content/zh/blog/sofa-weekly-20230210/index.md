---
title: "SOFA Weekly | 本周贡献 & issue 精选"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly | 本周贡献 & issue 精选"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2023-02-10T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ"
---

## SOFA WEEKLY | 每周精选

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1e08fca65f7643c783d33f590bb41d5a~tplv-k3u1fbpfcp-zoom-1.image)

**筛选每周精华问答，同步开源进展，欢迎留言互动～**

**SOFA**Stack（**S**calable **O**pen **F**inancial **A**rchitecture Stack）是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

**SOFAStack 官网:** *[https://www.sofastack.tech](https://www.sofastack.tech)*

**SOFAStack:** *[https://github.com/sofastack](https://github.com/sofastack)*

### SOFAStack 社区本周贡献

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*k4GmTZBT5K0AAAAAAAAAAAAADrGAAQ/original)

### SOFAStack GitHub issue 精选

**本周各项目回复 issue 共计 8 条**

欢迎大家在 GitHub 提交 issue 与我们互动

我们会筛选 issue 通过 

" SOFA WEEKLY " 的形式回复

**1.@shuangchengsun  #266**

>我想知道对于 SOFARegistry 这样的系统是如何定义 SLA 的，以及有没有一个参考值。

A：一般 SLA 的定义和系统的关键指标相关，类似 Registry 的核心就是 Pub Sub 模型，Pub 列表变化后及时推送给 Sub；那么 SLA 的定义就可以从类似 Pub 变更后在多长的周期内能推送给所有的 Sub，这个成功率应该高于多少。参考值这个看系统维护者对这个系统的要求吧，这个没什么标准值。

**「SOFARegistry」**：*[https://github.com/sofastack/sofa-registry/](https://github.com/sofastack/sofa-registry/)*

**2.@郑长青  #2197** 

>我在宿主应用使用 Ark Biz，采用 Maven 依赖方式静态合并部署，但是通过 biz-a 查看，没有启动业务应用，这个问题遇到过吗？

A：是打包业务 Biz 的 declared-libraries 赋值问题，所以动态部署和静态部署使用 2.1.0 版本的 sofa-ark-maven-plugin 插件无法正常运行。Bug 修复的 PR 已经合并，预计周五（2 月 10 日）发布新 2.1.1 版本。

**「SOFAArk」**：*[https://github.com/sofastack/sofa-ark/](https://github.com/sofastack/sofa-ark/)*

### 本周推荐阅读

[Special Weekly | 瑞兔送福，Live Long and Prosper](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247522322&idx=1&sn=bbc21ffd3a8b05569a6c0e61099acad0&chksm=faa377c8cdd4fede06c7cda96fb462710172801c682e7df5affdd6fef408da3ecaf4b508fd1c&scene=21)

[SOFARegistry | 大规模集群优化实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247517005&idx=1&sn=685cea90982f8ecec5ffc56880d63175&chksm=faa36c97cdd4e58163830407bd827838f6ecb0a5b0e22130b507141fe9a24b2e645666fc0571&scene=21)

[Nydus 加速镜像一致性校验增强](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247522977&idx=1&sn=2db9751af8bf68cc43d900f34e2cce3e&chksm=faa3757bcdd4fc6d6343fb900d4fe414f0ca7ae276d7f69a6b04f0cb4770c2e1423081e05e70&scene=21)

[一个 go-sql-driver 的离奇 bug](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247522005&idx=1&sn=724ab40baf32952ffcced317d5a5f642&chksm=faa3790fcdd4f0194a6ab0b92369fc64aad5bd108b9969ebfb318d814116f9a8b4c8c64ac831&scene=21)

欢迎扫码关注：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e19d0a6d7f734ad6a585cde82ae4f3bf~tplv-k3u1fbpfcp-zoom-1.image)
