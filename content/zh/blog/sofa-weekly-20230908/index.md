---
title: "SOFA Weekly｜SOFAServerless 社区会议回顾、Layotto 社区会议回顾与预告、SOFA 聊天室"
authorlink: "https://github.com/sofastack"
description: "SOFAServerless 社区会议回顾、Layotto 社区会议回顾与预告、SOFA 聊天室"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2023-09-08T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ"
---

## SOFA WEEKLY | 每周精选

![图片](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ)

**筛选每周精华问答，同步开源进展，欢迎留言互动～**

**SOFA**Stack（**S**calable **O**pen **F**inancial **A**rchitecture Stack）是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

**SOFAStack 官网:** *[https://www.sofastack.tech](https://www.sofastack.tech)*

**SOFAStack:** *[https://github.com/sofastack](https://github.com/sofastack)*

## **SOFA**社区会议预告

***\*Layotto：\****

**主题：** Layotto 社区会议

**时间：** 09 月 13 日 14:00 - 15:00

**入会口令（钉钉）：** 688 824 34655

**电话呼入：** +02162681677（中国大陆）+057128095818（中国大陆）

**入会链接：** [https://meeting.dingtalk.com/j/MkM4YQVrEE3](https://meeting.dingtalk.com/j/MkM4YQVrEE3)

**议题：**

- Layotto 项目规划和展望 #976
- 2023 开源之夏-课题汇总 #894

  - OSPP | Layotto 支持 plugable component 组件 #959
  - Support Pod Injection to deploy Layotto as a sidecar in Kubernetes #910

- Develop a new component for sms API；为“短信 API”开发新的组件 #830

「**Layotto**」：[https://github.com/mosn/layotto/issues/986](https://github.com/mosn/layotto/issues/986)

## **SOFA** **社区会议回顾**  

**SOFAServerless：**

**主题**：SOFAServerless 社区会议
**时间**：09 月 04 日 14:00 - 15:00

**会议内容**：

- **8月回顾**

  - Arklet 新增健康状态管理能力；biz 运维指令支持异步执行；bizVersion 维度锁机制；统一 Starter 管控系列依赖等能力
  - ModuleController 完成各项参数校验、单测达到 80/60、8+ 集成测试、CI 自动化、开发者指南
  - 各组件的发版 release：ModuleController 0.3，Arklet 0.3，SOFAArk 2.2.2

- **9 月迭代规划讨论**

  - SOFAArk

    - 基座模块 1:1 复用 ClassLoader
    - 支持 JDK 17+SOFABoot 4

  - SOFAServerless

    - 支持中间件列表与优先级，排摸支持情况，设计评测标准
    - 基座 Starter，Arklet 的打包发布

  - ModuleController

    - 新扩后缩
    - 模块回滚
    - 模块流量 Service

  - Arklet

    - 基于纯 Spring Boot 环境的服务的跨 Spring Context 发现与调用 
    - 完善代码注释、单元测试、面向社区共建同学的设计文档
    - Arklet mode 移动至 SOFAStack-guides

  - Arkctl

    - 项目初始化、框架搭建
    - Arkctl build、Arkctl deploy 功能一期

- **人员晋升**

  - 将 @TomorJM 提名为 PMC，直接参与技术方案决策、辅导提拔 Contributor、并且参与 RoadMap 制定

「**SOFAServerless**」：[https://github.com/sofastack/sofa-serverless/issues/44](https://github.com/sofastack/sofa-serverless/issues/44)

**Layotto：**

**主题**：Layotto 社区会议
**时间**：09 月 06 日 14:00 - 15:00

**会议内容**：

- 下半年规划与展望

  - 基于运维体系建设的部署至阿里云以及提供 Layotto SDK 的规划对齐

- 开源之夏

  - 本月内完成插件式组件的规划对齐
  - Layotto K8s 集成：关于动态配置验证中遇到的问题的解决方案讨论

- CSDI Summit 社区成员分享同步

「**Layotto**」：[https://github.com/mosn/layotto/issues/986](https://github.com/mosn/layotto/issues/986)

「**会议回放**」：[https://www.bilibili.com/video/BV1qp4y1L7Cn](https://www.bilibili.com/video/BV1qp4y1L7Cn)

## **SOFAStack** **社区本周贡献**  

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*McwxQ4CKREIAAAAAAAAAAAAADrGAAQ/original)

## 本周推荐阅读

[大象转身：支付宝资金技术 Serverless 提效总结](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247541695&idx=1&sn=70ea82d3e7fc9c2de5df9dc70ebcbc46&chksm=faa3cc65cdd44573a00b4f092f42a5cdcc5519a466fcdf2638e8912594b4b6438bb8932faa83&scene=21)

[蚂蚁 SOFAServerless 微服务新架构的探索与实践](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247539145&idx=1&sn=43b537588aaba43e96dfaecc0559f90d&chksm=faa3b613cdd43f0556902c4836b2734f5c7fa0c5e291453171cf288f1d424aaa8fb7fa081502&scene=21)

[Seata-DTX｜分布式事务金融场景案例介绍](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247537905&idx=1&sn=a92e6aa6ac60fe23b6a21043777c7aa7&chksm=faa3bb2bcdd4323d2470977f715f383ec3bf10b610a7467ebb4ae6e6ddbb7cb2f8f87766de55&scene=21)

[SOFAStack 的下一个五年](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247537465&idx=1&sn=0b8bde29e8631437f8aa813c3481f144&chksm=faa3bce3cdd435f57264a152134ca2c6c2a2acf1e178a40f797dc4750ca54f215ee6fc96bd49&scene=21)
