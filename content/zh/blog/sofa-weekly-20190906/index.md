---
title: "SOFA Weekly | 每周精选【9/2 - 9/6】"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2019-09-06T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563524226806-e93607a3-1b77-4ca2-8c3c-0384ab966154.png"
---

**SOFA WEEKLY | 每周精选，筛选每周精华问答**
**同步开源进展，欢迎留言互动**

![weekly.jpg](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1562925824761-fc720f21-9622-437b-a783-0b0729eda119.jpeg)

SOFAStack（Scalable Open Financial Architecture Stack）是蚂蚁金服自主研发的金融级分布式架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

**SOFAStack 官网: **[https://www.sofastack.tech](https://www.sofastack.tech/)

**SOFAStack: **[https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动

我们会筛选重点问题通过 " SOFA WEEKLY " 的形式回复

**1、@王冰 **提问：

> 请问个问题，SOFATracer 在采样计算时 rootSpan 为什么会计算两次，第一次是生成 span 时，第二次是在上报前又计算了一次？

A：这种是考虑到产生 span 的逻辑是业务自己来构建，非正常逻辑情况下的一种兼容处理。对于 Tracer 来说，所有的上报是必须 SOFATracer 的行为，因此在 report 之前也会基于当前采样策略计算一次计算。默认情况下产生跟 span 时的计算更多是 span 或者说 span context 的，这个会作为向下透传的。另外产生不一致的情况不会出现，上报那段逻辑会先检查当前 span 的父 span，如果父 span 是 null 也就意味着当前 span 是 root span，所以也必须要计算。

**2、@迟广文** 提问：

> 在使用 Seata 的时候，使用了 restful 框架，我的 TCC 调通了，是在接口上加了 @LocalTCC，实现类加 @Component，本以为会冲突，结果没有。

A：TCC 的代理会代理二种类型的分支：在本地标注为 localTcc，第二种是 RPC 框架（dubbo、sofa-rpc）当 consumer 端使用作为 reference bean 且在 provider 端标注了二阶段注解时，这二种类型时互斥的，一个 TCC 分支只属于其一类型。

### SOFAChannel 回顾集合

- SOFAChannel#8：[从一个例子开始体验 SOFAJRaft | SOFAChannel#8 直播整理](https://www.sofastack.tech/blog/sofa-channel-8-retrospect/)
- SOFAChannel#7：[自定义资源 CAFEDeployment 的背景、实现和演进 | SOFAChannel#7 直播整理](https://www.sofastack.tech/blog/sofa-channel-7-retrospect/)
- SOFAChannel#6：[蚂蚁金服轻量级监控分析系统解析 | SOFAChannel#6 直播整理](https://www.sofastack.tech/blog/sofa-channel-6-retrospect/)
- SOFAChannel#5：[给研发工程师的代码质量利器 | SOFAChannel#5 直播整理](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247485058&idx=1&sn=ff5c79234a34b27f694630f70593789d&chksm=faa0e958cdd7604efe5ab3600b807d5e5580b283b799bb09b6386af314f5ace8ec166e3b54f0&scene=21#wechat_redirect)
- SOFAChannel#4：[分布式事务 Seata TCC 模式深度解析 | SOFAChannel#4 直播整理](https://www.sofastack.tech/blog/sofa-channel-4-retrospect/)
- SOFAChannel#3：[SOFARPC 性能优化实践（下）| SOFAChannel#3 直播整理](https://www.sofastack.tech/blog/sofa-channel-3-retrospect/)
- SOFAChannel#2：[SOFARPC 性能优化实践（上）| SOFAChannel#2 直播整理](https://www.sofastack.tech/blog/sofa-channel-2-retrospect/)
- SOFAChannel#1：[从蚂蚁金服微服务实践谈起 | SOFAChannel#1 直播整理](https://www.sofastack.tech/blog/sofa-channel-1-retrospect/)

### SOFA 项目进展

**本周发布详情如下：**

**1、SOFATracer v2.4.1/v3.0.6 版本发布，主要变更如下：**

- 支持自定义埋点 (FlexibleTracer)
- 支持 Dubbo 2.6.x 
- 日志输出支持非 json 格式(xstringbuilder)

- 支持自定义扩展 Repoter 上报
- Dubbo 2.7.x 系列支持 2.7.3 版本
- 修复 BasePreparedStatement 初始化问题
- 修复 SQLException 被覆盖问题
- 优化常量命名及代码注释等
- 更新案例及官方文档

详细发布报告：

[https://github.com/sofastack/sofa-tracer/releases/tag/v2.4.1](https://github.com/sofastack/sofa-tracer/releases/tag/v2.4.1) 

 [https://github.com/sofastack/sofa-tracer/releases/tag/v3.0.6](https://github.com/sofastack/sofa-tracer/releases/tag/v3.0.6)

官方文档：

[https://www.sofastack.tech/projects/sofa-tracer/overview/](https://www.sofastack.tech/projects/sofa-tracer/overview/)

**2、SOFABoot v3.2.0 版本发布，主要变更如下：**

- 升级 sofa-bolt 版本至 1.5.6
- 根据 Spring Boot 官方文档建议重构工程代码和组织结构

详细发布报告：

[https://github.com/sofastack/sofa-boot/releases/tag/v3.2.0](https://github.com/sofastack/sofa-boot/releases/tag/v3.2.0)

官方文档：

[https://www.sofastack.tech/projects/sofa-boot/overview/](https://www.sofastack.tech/projects/sofa-boot/overview/)

### SOFA 用户召集

如果您已经在生产环境使用了 SOFAStack 相关组件，请在下方链接登记告诉我们，方便我们更好地为您服务，我们将会把您加入到 “SOFAStack金牌用户服务群【邀约制】”里面，以便更加快捷的沟通和更加高效的线上使用问题支持。
[https://github.com/sofastack/sofastack.tech/issues/5](https://github.com/sofastack/sofastack.tech/issues/5) 

已有用户查看：
[https://www.sofastack.tech/awesome](https://www.sofastack.tech/awesome)
