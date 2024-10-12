---
title: "SOFA Weekly｜SOFAServerless 社区会议回顾、Layotto 社区会议回顾与预告、社区本周贡献"
authorlink: "https://github.com/sofastack"
description: "SOFAServerless 社区会议回顾、Layotto 社区会议回顾与预告、社区本周贡献"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2023-08-25T15:00:00+08:00
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

主题：Layotto 社区会议

时间：08 月 30 日 14:00 - 15:00

入会口令（钉钉）：688 824 34655

电话呼入：+057128095818（中国大陆）+02162681677（中国大陆）

入会链接：[https://meeting.dingtalk.com/j/Wv0wyrJyDhA](https://meeting.dingtalk.com/j/Wv0wyrJyDhA)

**议题：**

- Layotto 项目规划和展望 #976

- 2023 开源之夏-课题汇总 #894

  - OSPP | Layotto 支持 plugable component 组件 #959

  - Support Pod Injection to deploy Layotto as a sidecar in Kubernetes #910
    
- Develop a new component for sms API；为“短信 API” 开发新的组件 #830

「*Layotto*」：[https://github.com/mosn/layotto/issues/983](https://github.com/mosn/layotto/issues/983)

## SOFA 社区会议回顾 

**SOFAServerless：**

主题：SOFAServerless 社区会议

时间：08 月 21 日 19:30 - 20:30

**会议内容：**

- 8月回顾

  - Arklet 待完成的动作

    - 增加影响基座健康状态的能力，查询健康状态指令
      
    - 健康状态检查方案 review
      
    - 模块安装支持远程协议
      
    - 修复 ModuleController 使用 Arklet 遇到的问题 #17
      
    - 增加锁控制 #39
      
    - 基座引用的 starter，支持 Spring Boot、SOFABoot，推到 Maven 中央仓库

- 9 月迭代规划讨论

  - 支持中间件列表与优先级
    
  - 支持 SOFABoot 4.0
    
  - 回滚，先扩后缩，模块流量 Service
    
  - Arkctl Arklet ModuleController 0.5 发版本
 
「*SOFAServerless*」：[https://github.com/sofastack/sofa-serverless/issues/38](https://github.com/sofastack/sofa-serverless/issues/38)

「*会议回放*」：[https://www.bilibili.com/video/BV19r4y1R761](https://www.bilibili.com/video/BV19r4y1R761)

**Layotto：**

主题：Layotto 社区会议

时间：08 月 23 日 14:00 - 15:00

**会议内容：**

- Layotto 社区下半年规划

- 开源之夏

  - 自定义插件：等待同步动作

  - 集成 K8s

    - 此前遗留问题的讨论、动态配置的思路

    - 在 K8s 上已跑通的 demo 分享

  - 短信 API

    - API 已完成，关闭 issue，将跟进开发各自组件

「*Layotto*」：[https://github.com/mosn/layotto/issues/983](https://github.com/mosn/layotto/issues/983)

「*会议回放*」：[https://www.bilibili.com/video/BV15j411q7As](https://www.bilibili.com/video/BV15j411q7As)

## SOFAStack 社区本周贡献 

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*CJGnQqSAY2cAAAAAAAAAAAAADrGAAQ/original)

## 本周推荐阅读

[蚂蚁 SOFAServerless 微服务新架构的探索与实践](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247539145&idx=1&sn=43b537588aaba43e96dfaecc0559f90d&chksm=faa3b613cdd43f0556902c4836b2734f5c7fa0c5e291453171cf288f1d424aaa8fb7fa081502&scene=21)

[超越边界：FaaS 的应用实践和未来展望](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247539068&idx=1&sn=df83153437d75a7c0b12360066480b49&chksm=faa3b6a6cdd43fb0159ecd2152dc4614c9c9d8003a3423c6c9833c7f19afbfadade59641edae&scene=21)

[MoE 系列（七）｜ Envoy Go 扩展之沙箱安全](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247538840&idx=1&sn=62286a02933ffae587479586b39ce3c1&chksm=faa3b742cdd43e5427fd1b2a44e8ded825a413f867ed3eb62451c18e2a0ea9cfcf1d703c4513&scene=21)

[Seata-DTX｜分布式事务金融场景案例介绍](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247537905&idx=1&sn=a92e6aa6ac60fe23b6a21043777c7aa7&chksm=faa3bb2bcdd4323d2470977f715f383ec3bf10b610a7467ebb4ae6e6ddbb7cb2f8f87766de55&scene=21)
