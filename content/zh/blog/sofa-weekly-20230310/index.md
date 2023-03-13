---
title: "SOFA Weekly | SOFANews、开源人 & issue 精选"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly | SOFANews、开源人 & issue 精选"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2023-03-10T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ"
---

## SOFA WEEKLY | 每周精选

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1e08fca65f7643c783d33f590bb41d5a~tplv-k3u1fbpfcp-zoom-1.image)

**筛选每周精华问答，同步开源进展，欢迎留言互动～**

**SOFA**Stack（**S**calable **O**pen **F**inancial **A**rchitecture Stack）是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

**SOFAStack 官网:** *[https://www.sofastack.tech](https://www.sofastack.tech)*

**SOFAStack:** *[https://github.com/sofastack](https://github.com/sofastack)*

### SOFAStack 社区本周贡献

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*eP5zTZS9Mh0AAAAAAAAAAAAADrGAAQ/original)

### SOFAStack GitHub issue 精选

**本周各项目回复 issue 共计 2 条**

欢迎大家在 GitHub 提交 issue 与我们互动

我们会筛选 issue 通过 

" SOFA WEEKLY " 的形式回复

**1.@linkoog #602**

>首先我使用了 Ark-Guides 和 Ark-biz 的示例进行操作。
可以正常加载模板，但配置文件加载不到。
Start 是启动模块，
Config 是配置的存储释放模块。
试了下面两种方式，都读到不到配置文件
1、直接打包 Config 的 Jar 中
2、在 Start 模板下面放 Conf/Ark/
环境
沙发方舟版本：2.0.8
JVM 版本（例如 Java -Version ）：1.8.333
操作系统版本（例如 Uname -a ）：macOS
行家版本：
集成开发环境版本

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*rW_5RJmVm2gAAAAAAAAAAAAADrGAAQ/original)

A：配置文件的配置应和 Spring Boot 应用保持一致，建议把配置文件放至 Resources 目录下。

**「SOFAArk」**：[https://github.com/sofastack/sofa-ark/issues/602](https://github.com/sofastack/sofa-ark/issues/602)

**2.@SpringLin97 #928**

>Jraft 支持 IPV6 组建集群吗？

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*kCp0RKmQYLgAAAAAAAAAAAAADrGAAQ/original)

A：1.3.5 以后版本支持 IPV6。

**「SOFAJRaft」**：[https://github.com/sofastack/sofa-jraft/issues/928](https://github.com/sofastack/sofa-jraft/issues/928)

### 本周推荐阅读

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*qbJsQZiTXaEAAAAAAAAAAAAADrGAAQ/original)

[DLRover：蚂蚁开源大规模智能分布式训练系统](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247526048&idx=1&sn=3b15877be6c51d7faf0cb0def8dd8f2c&chksm=faa3897acdd4006c3d4e9984ff8d2c48198aca74115e03ac0becddbbe649a2494ba66f81e26f&scene=21&token=628094533&lang=zh_CN)

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*5lk5T4GC6HwAAAAAAAAAAAAADrGAAQ/original)

[Nydus 在约苗平台的容器镜像加速实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247525374&idx=1&sn=61ff3ed2ee956148fb0ad065fe50d1bb&chksm=faa38c24cdd405322bf73139edb9b82804fa424b560d4162755c02b83e5fc5bbd91fcfa582f1&scene=21&token=628094533&lang=zh_CN)

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*hu0bQZt1HNsAAAAAAAAAAAAADrGAAQ/original)

[Wasm 原生时代已经来到](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247523985&idx=1&sn=73adc8410675e7419731f8267bfebfc5&chksm=faa3714bcdd4f85d310583346e02d1d3a10e5cf97d23cc469104bdd1bbee499446f0a709a7c2&scene=21&token=628094533&lang=zh_CN)

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*u3a9QLLk8DIAAAAAAAAAAAAADrGAAQ/original)

[Go 语言，如何做逆向类型推导?](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247523846&idx=1&sn=001825b6396d817bb9c8c9fd8da388ec&chksm=faa371dccdd4f8ca4026523e5f6c109fb2368b0250f77ed9accb0d67e2e9085351840af177b5&scene=21&token=628094533&lang=zh_CN)
