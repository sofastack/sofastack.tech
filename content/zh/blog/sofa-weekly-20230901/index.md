---
title: "SOFA Weekly｜SOFAChannel#35 直播预告、SOFARPC/SOFAHessian 新版本发布、社区会议"
authorlink: "https://github.com/sofastack"
description: "SOFAChannel#35 直播预告、SOFARPC/SOFAHessian 新版本发布、社区会议"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2023-09-01T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ"
---

## SOFA WEEKLY | 每周精选

![图片](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ)

**筛选每周精华问答，同步开源进展，欢迎留言互动～**

**SOFA**Stack（**S**calable **O**pen **F**inancial **A**rchitecture Stack）是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

**SOFAStack 官网:** *[https://www.sofastack.tech](https://www.sofastack.tech)*

**SOFAStack:** *[https://github.com/sofastack](https://github.com/sofastack)*

## SOFAChannel#35 预告

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*iZZ7Qoh2LbUAAAAAAAAAAAAADrGAAQ/original)

SOFABoot 是蚂蚁集团开源的基于 Spring Boot 的研发框架。近期，SOFABoot 更新了 4.0 版本，带来了更多新特性。不仅正式支持了 Spring Boot 3 版本，也同时做出了包括历史功能演进在内的一系列调整优化，使得框架自身更加易用。

本期 SOFAChannel#35 邀请到了蚂蚁集团技术专家、SOFABoot 项目 Maintainer 胡子杰跟大家分享 《SOFABoot 4.0 — 迈向 JDK 17 新时代》。

## SOFA 社区会议预告

**SOFAServerless：**

主题：SOFAServerless 社区会议

时间：09 月 04 日 19:30 - 20:30

入会口令（钉钉）：909 575 00367

电话呼入：+057128095818（中国大陆） +02162681677（中国大陆）

入会链接：[https://meeting.dingtalk.com/j/EQzqQVtJoro](https://meeting.dingtalk.com/j/EQzqQVtJoro)

**议题：**

- 8 月回顾

  - Arklet 待完成的动作

    - 增加影响基座健康状态的能力，查询健康状态指令

  - ModuleController 的功能

    - 各项参数校验、单测达到 80/60、8+ 集成测试、CI 自动化、开发者指南

  - 各组件的发版 release

    - ModuleController 0.3

    - Arklet 0.3

    - SOFAArk 2.2.2

- 9 月迭代规划讨论

  - SOFAArk

    - 基座模块 1:1 复用 ClassLoader
  
    - 支持 SOFABoot 4
   
  - SOFAServerless

    - 支持中间件列表与优先级，排摸支持情况，设计评测标准

    - 基座 Starter，Arklet 的打包发布
   
  - ModuleController
    
    - 新扩后缩
      
    - 模块回滚
    
    - 模块流量 Service
   
  - Arklet

    - 服务的跨 Spring Context 发现与调用
  
  - Arkctl、Arklet、ModuleController 0.5 发版本

「*SOFAServerless*」：[https://github.com/sofastack/sofa-serverless/issues/44](https://github.com/sofastack/sofa-serverless/issues/44)

**Layotto：**

主题：Layotto 社区会议

时间：09 月 06 日 14:00 - 15:00

入会口令（钉钉）：688 824 34655

电话呼入：+02162681677（中国大陆）+057128095818（中国大陆）

入会链接：[https://meeting.dingtalk.com/j/MkM4YQVrEE3](https://meeting.dingtalk.com/j/MkM4YQVrEE3)

**议题：**

- Layotto 项目规划和展望 #976

- 2023 开源之夏-课题汇总 #894

  - OSPP | Layotto 支持 plugable component 组件 #959
  
  - Support Pod Injection to deploy Layotto as a sidecar in Kubernetes #910
  
  - Develop a new component for sms API；为“短信 API”开发新的组件 #830

「*Layotto*」：[https://github.com/mosn/layotto/issues/984](https://github.com/mosn/layotto/issues/984)

## SOFA 社区会议回顾 

**Layotto：**

主题：Layotto 社区会议

时间：08 月 30 日 14:00 - 15:00

会议内容：

- 下半年规划与展望

  - SDK 模式、公有云部署的两个方向明确
    
- 开源之夏
  
  - Layotto K8s 集成：关于动态配置注入思路的讨论
    
  - 短信邮件 API：API 适配不同云厂商的组件具体开发

「*Layotto*」：[https://github.com/mosn/layotto/issues/984](https://github.com/mosn/layotto/issues/984)

「*会议回放*」：[https://www.bilibili.com/video/BV1bz4y1K7RG](https://www.bilibili.com/video/BV1bz4y1K7RG)

## SOFARPC 5.11.0 版本发布  

发布 SOFARPC 5.11.0 版本，主要变更如下:

- 支持 SOFARPC 在 Mac M1 芯片环境编译

- 修复直连调用时，url 拼接错误的问题

- 升级 Hessian 到 3.5.0

- 升级 Bolt 到 1.6.6

- 升级 gRPC 到 1.53.0

- 升级 SOFARegistry 到 6.3.0

- 升级 Dubbo 到 3.1.8

- 升级 Javassist 到 3.29，引入新版 API，支持在 JDK 17 环境下使用

- 解决部分 SOFABoot 4.0 下的兼容性问题，现在 SOFARPC 支持基于 SOFABoot 4.0 运行

详细发布报告：[https://github.com/sofastack/sofa-rpc/releases/tag/v5.11.0](https://github.com/sofastack/sofa-rpc/releases/tag/v5.11.0)

## SOFAHessian 3.5.0 版本发布  

发布 SOFAHessian 3.5.0 版本，主要变更如下:

- 新增了 Currency、 Atomic、Throwable、StackTraceElement 类的定制序列化器，支持在 JDK 17 环境下运行

- 针对内部的反射逻辑做了一定的调整，支持在 JDK 17 环境下运行

详细发布报告：[https://github.com/sofastack/sofa-hessian/releases/tag/v3.5.0](https://github.com/sofastack/sofa-hessian/releases/tag/v3.5.0)

## SOFAStack 社区本周贡献 

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*CCrZQb3SEekAAAAAAAAAAAAADrGAAQ/original)

## 本周推荐阅读

[SOFABoot 4.0 正式发布，多项新特性等你来体验！](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247538370&idx=1&sn=d6dd2814c3341825fe9b3abc9d8158e7&chksm=faa3b918cdd4300e8a423e4018374b51bd55d1947235aa3efed0c3f0532401e37b7d04079e6e&scene=21)

[蚂蚁 SOFAServerless 微服务新架构的探索与实践](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247539145&idx=1&sn=43b537588aaba43e96dfaecc0559f90d&chksm=faa3b613cdd43f0556902c4836b2734f5c7fa0c5e291453171cf288f1d424aaa8fb7fa081502&scene=21)

[Seata-DTX｜分布式事务金融场景案例介绍](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247537905&idx=1&sn=a92e6aa6ac60fe23b6a21043777c7aa7&chksm=faa3bb2bcdd4323d2470977f715f383ec3bf10b610a7467ebb4ae6e6ddbb7cb2f8f87766de55&scene=21)

[SOFARegistry | 大规模集群优化实践](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247517005&idx=1&sn=685cea90982f8ecec5ffc56880d63175&chksm=faa36c97cdd4e58163830407bd827838f6ecb0a5b0e22130b507141fe9a24b2e645666fc0571&scene=21)
