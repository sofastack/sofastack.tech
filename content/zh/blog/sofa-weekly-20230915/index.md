---
title: "SOFA Weekly｜SOFAServerless 社区会议预告、Layotto 社区会议回顾与预告、C 位大咖说"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly｜SOFAServerless 社区会议预告、Layotto 社区会议回顾与预告、C 位大咖说"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2023-09-15T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ"

---

## SOFA WEEKLY | 每周精选

![图片](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ)

**筛选每周精华问答，同步开源进展，欢迎留言互动～**

**SOFA**Stack（**S**calable **O**pen **F**inancial **A**rchitecture Stack）是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

**SOFAStack 官网:** *[https://www.sofastack.tech](https://www.sofastack.tech)*

**SOFAStack:** *[https://github.com/sofastack](https://github.com/sofastack)*

## SOFA 社区会议预告

**Layotto：**

**主题：** Layotto 社区会议

**时间：** 09 月 20 日 14:00 - 15:00

**入会口令（钉钉）：** 688 824 34655

**电话呼入：** +02162681677（中国大陆）+057128095818（中国大陆）

**入会链接：** [https://meeting.dingtalk.com/j/r3Nq5pEd730](https://meeting.dingtalk.com/j/r3Nq5pEd730)

**议题：**

- Layotto 项目规划和展望 #976
- 2023 开源之夏-课题汇总 #894

  - OSPP | Layotto 支持 plugable component 组件 #959
  - Support Pod Injection to deploy Layotto as a sidecar in Kubernetes #910

- 2023 CSDI SUMMIT #987
- add uds support for Java SDK

「**Layotto**」：[https://github.com/mosn/layotto/issues/989](https://github.com/mosn/layotto/issues/989)

**SOAFServerless：**

**主题：** SOFAServerless 社区会议

**时间：** 09 月 19 日 19:30 - 20:30

**入会口令（钉钉）：** 909 575 00367

**电话呼入：** +02162681677（中国大陆）+057128095818（中国大陆）

**入会链接：** [https://meeting.dingtalk.com/j/eU7EoXJYiHK](https://meeting.dingtalk.com/j/eU7EoXJYiHK)

**议题：**

- 已完成部分

  - 健康状态检查方案 review

  - 基座引用的 starter，支持 Spring Boot、SOFABoot，Arklet 版本推到 Maven 中央仓库

  - 增加锁控制

  - 修复 ModuleController 使用 Arklet 遇到的问题

  - 基座 Starter，Arklet 0.4 版本打包发版

- 待迭代事项

  - SOFAArk

    - 基座模块 1:1 复用
    - 支持 SOFABoot 4

  - SOFAServerless

    - 支持中间件列表与优先级，排摸支持情况，设计评测标准
    - 官网搭建

  - ModuleController

    - 先扩后缩
    - 模块回滚
    - 模块流量 Service
    - 强推基线
    - 单测达到 80/60、8+ 集成测试、CI 自动化、开发者指南 *#72 #73*
    - ModuleController 各项参数校验
    - replicas = -1 表示对等架构

  - Arklet

    - 服务的跨 Spring Context 发现与调用
    - 健康状态检查方案 review
    - 增加影响基座健康状态的能力，查询健康状态指令模块安装支持远程协议
    - 【spring-boot-ark-plugin】*#74*
    - 【Arklet】指令耗时统计和资源消耗统计设计 *#77*

  - Arkctl

    - Arkctl 增加模块对应实例与状态查询
    - Arkctl 增加模块代码初始化能力 *#83*
    - Arkctl 增加模块部署能力 *#82*

  - Arkctl、Arklet、ModuleController 0.5 发版本

「**SOFAServerless**」：[https://github.com/sofastack/sofa-serverless/issue/100](https://github.com/sofastack/sofa-serverless/issue/100)

## SOFA 社区会议回顾

**Layotto：**

**主题**：Layotto 社区会议

**时间**：09 月 13 日 14:00 - 15:00

**会议内容**：

- 项目规划方向补充

  - Wasm 组件的规划
  - 资源隔离

- 开源之夏

  - Dapr component 升级的讨论
  - 集成 K8s 注入的进度分享和思路讨论

- CSDI Summit 社区成员分享同步
- add uds support for Java SDK 的同步

「**Layotto**」：[https://github.com/mosn/layotto/issues/989](https://github.com/mosn/layotto/issues/989)

「**会议回放**」：[https://www.bilibili.com/video/BV1UF411D77o](https://www.bilibili.com/video/BV1UF411D77o)

## SOFAStack 社区本周贡献

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*hkXHRKOUynoAAAAAAAAAAAAADrGAAQ/original)

## 本周推荐阅读

[SOFABoot 4.0 正式发布，多项新特性等你来体验！](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247541695&idx=1&sn=70ea82d3e7fc9c2de5df9dc70ebcbc46&chksm=faa3cc65cdd44573a00b4f092f42a5cdcc5519a466fcdf2638e8912594b4b6438bb8932faa83&scene=21)

[蚂蚁 SOFAServerless 微服务新架构的探索与实践](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247539145&idx=1&sn=43b537588aaba43e96dfaecc0559f90d&chksm=faa3b613cdd43f0556902c4836b2734f5c7fa0c5e291453171cf288f1d424aaa8fb7fa081502&scene=21)

[Seata-DTX｜分布式事务金融场景案例介绍](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247537905&idx=1&sn=a92e6aa6ac60fe23b6a21043777c7aa7&chksm=faa3bb2bcdd4323d2470977f715f383ec3bf10b610a7467ebb4ae6e6ddbb7cb2f8f87766de55&scene=21)

[SOFARegistry | 大规模集群优化实践](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247537465&idx=1&sn=0b8bde29e8631437f8aa813c3481f144&chksm=faa3bce3cdd435f57264a152134ca2c6c2a2acf1e178a40f797dc4750ca54f215ee6fc96bd49&scene=21)
