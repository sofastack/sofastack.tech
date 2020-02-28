---
title: "SOFA Weekly | MOSN 发布、直播系列整理、0312直播预告"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "【02/24-02/28】| 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2020-02-28T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563524226806-e93607a3-1b77-4ca2-8c3c-0384ab966154.png"
---

**SOFA WEEKLY | 每周精选，筛选每周精华问答**

**同步开源进展，欢迎留言互动**

![weekly](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1562925824761-fc720f21-9622-437b-a783-0b0729eda119.jpeg)

SOFAStack（Scalable Open Financial Architecture Stack）是蚂蚁金服自主研发的金融级分布式架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

**SOFAStack 官网: **[https://www.sofastack.tech](https://www.sofastack.tech/)

**SOFAStack: **[https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动
我们会筛选重点问题通过 " SOFA WEEKLY " 的形式回复

**1、@朱楠 **提问：

> SpringBoot 集成 Seata Saga 模式后启动报了这个错，有谁知道是什么情况吗？不知道问题出在哪，我就参照Saga 的 demo 来配置的。
> ![部分代码](https://cdn.nlark.com/yuque/0/2020/png/226702/1582871098524-c92690e9-49c5-47be-b141-65c12b8f85f6.png)

A：这个事务异常了，然后 server 端出发了事务恢复，但是这条事务在客户端已经没有了。

> @Reference 这个注解没有 id 或者 name 的属性，试了几次还是不行，实在不行我就用配置文件的方式主入 Dubbo 服务了。
> ![部分代码](https://cdn.nlark.com/yuque/0/2020/png/226702/1582871098544-c72e14c1-7ae9-408f-aa9f-f7f5cdc8552b.png)

A：其实这也合理，因为 @Reference 是作用在一个类的 field 或 method 上面的，而状态机引擎它不是一个 field 或 method，所以状态机引擎不应该用访问这个类的 reference，而是应该访问一个 spring 上下文作用域的 reference 。我看了一下 Dubbo 的源码 @Reference 这种它并不会注册成为一个 bean，只是生成一个代理然后注入到这个引用它的属性里。所以状态机默认是取 bean 的形式拿不到 bean，你用 xml 的方式引用一个服务。状态机的编排本来就不是用 Java 代码上编排的，而 @Reference 是用于编程方式使用的。
Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

**2、@魏敏** 提问：

> 请问一下，关于 tomcat 的 ajp 漏洞，使用的 SOFABoot 是否受影响呢？[https://www.cnvd.org.cn/webinfo/show/5415](https://www.cnvd.org.cn/webinfo/show/5415)

A：针对此次 Tomcat 的 AJP 协议漏洞，SOFABoot 内置的 Tomcat 默认是不会打开 AJP Connector 的，也就是说默认情况下所有版本的 SOFABoot 都是安全的。但是如果你自行打开了 AJP Connector，或者认为风险较大，可以通过覆盖 SOFABoot 管控的 Tomcat 版本进行升级，在主 pom 中的 properties section 指定 Tomcat 版本：

```java
<properties>
    <!-- other properties goes here -->
    <tomcat.version>9.0.31</tomcat.version>
    <!-- Tomcat 升级规则如下：
        - 9.x 版本升级至 9.0.31 及以上
        - 8.x 版本升级至 8.5.51 及以上
        - 7.x 版本升级至 7.0.100 及以上 -->
</properties>
```

SOFABoot：[https://github.com/sofastack/sofa-boot](https://github.com/sofastack/sofa-boot)

**3、@jinn** 提问：

> MOSN 与  Envoy 不同点是什么？优势在哪里？

A：简单描述一下：

- 语言栈的不同：MOSN 使用 Go 语言技能栈对于使用 Java 语言的公司和个人心智成本更低。
- 核心能力的差异化：
  - MOSN 支持多协议框架，用户可以比较容易的接入私有协议，具有统一的路由框架；
  - 多进程的插件机制，可以通过插件框架很方便的扩展独立 MOSN 进程的插件，做一些其他管理，旁路等的功能模块扩展；
  - 具备中国密码合规的传输层国密算法支持；

MOSN：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

### SOFAChannel 线上直播集锦

- SOFAChannel#11：[从一个例子开始体验轻量级类隔离容器 SOFAArk | SOFAChannel#11 直播整理](/blog/sofa-channel-11-retrospect/)
- SOFAChannel#10：[Seata 长事务解决方案 Saga 模式 | SOFAChannel#10 回顾](/blog/sofa-channel-10-retrospect/)
- SOFAChannel#9：[Service Mesh 落地负责人亲述：蚂蚁金服双十一四大考题 | SOFAChannel#9 回顾](/blog/service-mesh-practice-antfinal-shopping-festival-big-exam/)
- SOFAChannel#8：[从一个例子开始体验 SOFAJRaft | SOFAChannel#8 直播整理](/blog/sofa-channel-8-retrospect/)
- SOFAChannel#7：[自定义资源 CAFEDeployment 的背景、实现和演进 | SOFAChannel#7 直播整理](/blog/sofa-channel-7-retrospect/)
- SOFAChannel#6：[蚂蚁金服轻量级监控分析系统解析 | SOFAChannel#6 直播整理](/blog/sofa-channel-6-retrospect/)
- SOFAChannel#5：[给研发工程师的代码质量利器 | SOFAChannel#5 直播整理](/blog/sofa-channel-5-retrospect/)
- SOFAChannel#4：[分布式事务 Seata TCC 模式深度解析 | SOFAChannel#4 直播整理](/blog/sofa-channel-4-retrospect/)
- SOFAChannel#3：[SOFARPC 性能优化实践（下）| SOFAChannel#3 直播整理](/blog/sofa-channel-3-retrospect/)
- SOFAChannel#2：[SOFARPC 性能优化实践（上）| SOFAChannel#2 直播整理](/blog/sofa-channel-2-retrospect/)
- SOFAChannel#1：[从蚂蚁金服微服务实践谈起 | SOFAChannel#1 直播整理](/blog/sofa-channel-1-retrospect/)

### SOFA 项目进展

**本周发布详情如下：**

**发布 MOSN v0.10.0 版本，主要变更如下：**

- 分离部分 MOSN 基础库代码到 mosn.io/pkg；
- 分离部分 MOSN 接口定义到 mosn.io/api；
- 支持多进程插件模式；
- 部分代码实现细节优化；
- Bug Fix；

详细发布报告：
[https://github.com/mosn/mosn/releases/tag/v0.10.0](https://github.com/mosn/mosn/releases/tag/v0.10.0)

### 社区直播预告

![detail banner12](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1581670095015-cc3cc59c-6f09-43fb-87c2-ce115f0c22a6.jpeg)

SOFAChannel#12 线上直播将邀请蚂蚁金服分布式事务核心开发仁空分享介绍蚂蚁金服内部的分布式事务实践，包括 TCC（Try-Confirm-Cancel） 模式以及 FMT （Framework-Managerment-Transaction，框架管理事务）模式。同时也会与大家分享在面对双十一大促这种世界级的流量洪峰前，我们又是如何应对这个挑战。

**主题**：SOFAChannel#12：蚂蚁金服分布式事务实践解析

**时间**：2020年3月12日（周四）19:00-20:00

**嘉宾**：仁空，蚂蚁金服分布式事务核心开发

**形式**：线上直播

**报名方式**：点击“[这里](https://tech.antfin.com/community/live/1119)”，即可报名
