---
title: "SOFA Weekly｜SOFAServerless、Layotto 社区会议回顾与预告、C 位大咖说、社区本周贡献"
authorlink: "https://github.com/sofastack"
description: "SOFAServerless、Layotto 社区会议回顾与预告、C 位大咖说、社区本周贡献"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2023-09-22T15:00:00+08:00
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

**时间：** 09 月 27 日 14:00 - 15:00

**入会口令（钉钉）：** 688 824 34655

**电话呼入：** +02162681677（中国大陆）+057128095818（中国大陆）

**入会链接：** [https://meeting.dingtalk.com/j/1YVn7ufR5ob](https://meeting.dingtalk.com/j/1YVn7ufR5ob)

**议题：**

- Layotto 项目规划和展望 *#976*
  
- 2023 开源之夏-课题汇总 *#894*

  - OSPP | Layotto 支持 plugable component 组件 *#959*
    
  - Support Pod Injection to deploy Layotto as a sidecar in Kubernetes *#910*

- 2023 CSDI SUMMIT *#987*

「**Layotto**」：[https://github.com/mosn/layotto/issues/992](https://github.com/mosn/layotto/issues/992)

**SOFAServerless：**

**主题：** SOFAServerless 社区会议

**时间：** 09 月 27 日 19:30 - 20:30

**入会口令（钉钉）：** 909 575 00367

**电话呼入：** +02162681677（中国大陆）+057128095818（中国大陆）

**入会链接：** [https://meeting.dingtalk.com/j/z825JrGbwXa](https://meeting.dingtalk.com/j/z825JrGbwXa)

**议题：**

- 9 月 27 日发布 0.5 版本，说明单测与文档的重要性、功能代码的合并；官网内容同步完成更新

- 待迭代事项

  - SOFAArk

    - 基座模块 1:1 复用 ClassLoader
    - 支持 SOFABoot 4.0 和 JDK 17

  - SOFAServerless

    - 支持中间件列表与优先级，排摸支持情况，设计评测标准
    - 官网已完成搭建和部署，待补充与完善内容

  - ModuleController

    - 先扩后缩
    - 单测达到 80/60、8+ 集成测试、CI 自动化、开发者指南 *#72 #73*
    - ModuleController 各项参数校验
    - replicas = -1 表示对等架构 *#94*
    - 发布的分组策略，扩缩容的分组策略

  - Arklet

    - 服务的跨 Spring Context 发现与调用
    - 普通 SpringBoot 改造成基座报错 *#109*
    - 【Feature】关于 Arklet 健康检查解决方案 *#25*
    - 模块安装支持远程协议
    - Arklet 支持 JDK 17  *#48*
    - 【spring-boot-ark-plugin】*#74*
    - 【Arklet】指令耗时统计和资源消耗统计设计 *#77*

  - Arkctl

    - Arkctl 增加模块对应实例与状态查询
    - Arkctl 增加模块代码初始化能力 *#83*
    - Arkctl 增加模块部署能力 *#82*

  - Arkctl、Arklet、ModuleController 0.5 发版本

「**SOFAServerless**」：[https://github.com/sofastack/sofa-serverless/issues/117](https://github.com/sofastack/sofa-serverless/issues/117)

## **SOFA** **社区会议回顾**  

**Layotto：**

**主题**：Layotto 社区会议
**时间**：09 月 20 日 14:00 - 15:00

**会议内容**：

- 开源之夏

- 组件开发

- 组件开发向前兼容问题讨论
- Hello 组件的实现讨论

- K8s 注入

- 部署流程、文档演示以及 K8s 配置方案讨论

- 本周六 CDSI SUMMIT 同步 

「**Layotto**」：[https://github.com/mosn/layotto/issues/992](https://github.com/mosn/layotto/issues/992)

「**会议回放**」：[https://www.bilibili.com/video/BV1xH4y1m79S](https://www.bilibili.com/video/BV1xH4y1m79S)

**SOFAServerless：**

**主题**：SOFAServerless 社区会议
**时间**：09 月 19 日 19:30 - 20:30

**会议内容**：

- 9月第一次双周会迭代进展对焦

  - Arklet 0.3、基座 Starter 发布-已完成
  - 官网初版发布-已完成
  - 模块安装支持远程协议-已完成
  - 其余正在开发中

- 讨论工程结构问题，未来新名称可用后，会统一更新到新 Group 里，并且仓库可以拆出多个来

「**SOFAServerless**」：[https://github.com/sofastack/sofa-serverless/issues/117](https://github.com/sofastack/sofa-serverless/issues/117)

## **SOFAStack** **社区本周贡献**  

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*fM5yTqKpmWIAAAAAAAAAAAAADrGAAQ/original)

## 本周推荐阅读

[降本增效: 蚂蚁在 Sidecarless 的探索和实践](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247517989&idx=1&sn=1b49b68c9281d0c2514fa4caa38284fb&chksm=faa368ffcdd4e1e9fa5361d6ea376bbc426272c7a32250cc67ae27dcd84a6113b4a016a1518d&scene=21)

[Go 原生插件使用问题全解析](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247512138&idx=1&sn=851abb8d07d47f703e33978c9c125c59&chksm=faa35f90cdd4d6869c6cd4934c042484dbe1063c3fb85462d2f33e936b96240ae33d02d18c3a&scene=21)

[生产环境可用的 Seata-go 1.2.0 来啦！！！](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247537106&idx=1&sn=2b33fca8772ca1071b49abf47f76c8be&chksm=faa3be08cdd4371ef7ae0db8221ed7b6b497643fa71357b57f943dcec2c9fe77dc8f495cc941&scene=21)

[Seata-DTX｜分布式事务金融场景案例介绍](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247537905&idx=1&sn=a92e6aa6ac60fe23b6a21043777c7aa7&chksm=faa3bb2bcdd4323d2470977f715f383ec3bf10b610a7467ebb4ae6e6ddbb7cb2f8f87766de55&scene=21)
