---
title: "SOFA Weekly | MOSN、SOFABoot、SOFATracer 发布新版本，QA 整理"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | MOSN、SOFABoot、SOFATracer 发布新版本，QA 整理"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2021-02-05T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563524226806-e93607a3-1b77-4ca2-8c3c-0384ab966154.png"
---

SOFA WEEKLY | 每周精选，筛选每周精华问答
同步开源进展，欢迎留言互动

![weekly.jpg](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1562925824761-fc720f21-9622-437b-a783-0b0729eda119.jpeg)

SOFAStack（Scalable Open Financial Architecture Stack）是蚂蚁金服自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

SOFAStack 官网: [https://www.sofastack.tech](https://www.sofastack.tech/)

SOFAStack: [https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动
我们会筛选重点问题
通过 " SOFA WEEKLY " 的形式回复

**@李明阳** 提问：

> SOFAArk 的项目里面 controller 层可以是 Biz 包么，这样 mng 里面引入 one，然后启动 mng 访问不到 one 里面的接口呢？
>![](https://cdn.nlark.com/yuque/0/2021/png/12405317/1612507471211-bdd714ba-1cc9-4976-a122-79ad8c59e939.png#align=left&display=inline&height=65&margin=%5Bobject%20Object%5D&originHeight=502&originWidth=1080&size=0&status=done&style=none&width=140)

A：SOFAArk 的项目里面 controller 层不限制的，biz 包部署普通的依赖包，它是一个可执行的 jar，ark包 = biz + plugin + container，动态部署你可以通过 telnet 指令的方式去动态安装，不建议直接塞到 pom 里面去。

SOFAArk：[https://www.sofastack.tech/projects/sofa-boot/sofa-ark-readme/](https://www.sofastack.tech/projects/sofa-boot/sofa-ark-readme/)

**@王盛** 提问：

> 请教个问题：--set 
> meshConfig.defaultConfig.binaryPath="/usr/local/bin/mosn" 这个不起作用，有谁碰见过这个情况？
>![](https://cdn.nlark.com/yuque/0/2021/png/12405317/1612507562168-75aaf910-e81c-4b37-8866-6f1225a2308c.png#align=left&display=inline&height=90&margin=%5Bobject%20Object%5D&originHeight=695&originWidth=1080&size=0&status=done&style=none&width=140)

A：你用的是 istio1.5.2 吧，这个是不行的，istio 代码写死了的。这种手动注入应该可以的。这一块儿有些细节没有说明，你可以重新提交一下 pr。
![](https://cdn.nlark.com/yuque/0/2021/png/12405317/1612507588789-3fb236ee-7c67-43f6-b700-83b01833c2df.png#align=left&display=inline&height=35&margin=%5Bobject%20Object%5D&originHeight=269&originWidth=1080&size=0&status=done&style=none&width=140)

MOSN：https://github.com/mosn/mosn

**@杨星** 提问：

> 如果 Seata 使用注册中心的话，Client 端的 registry.type，与 config.type 需要改成对应的注册中心吧，Client 端的这两项配置的作用是什么？SeataServer 的这两项配置倒好理解，Client 端的config.type 目的是读取client端的配置信息，那 registry.type 是干什么的呢？

A：我认为，registry.type 指的是注册中心的类型，config.type 指的是配置中心的类型。注册和配置中心是 2 个东西，我认为是从注册中心里拿 seata-server 实例，客户端找协调者。

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

### 本周推荐阅读

- [干货 | 蚂蚁集团是如何实现经典服务化架构往 Service Mesh 方向的演进的？](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247483953&idx=1&sn=6bda510464710137af209b61c0453088&chksm=faa0edebcdd764fd17260584805788db91b0170848f53d20baf5767a098979de49eed26cc143&scene=21#wechat_redirect)

- [开源 | SOFAMesh 的通用协议扩展](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247484175&idx=1&sn=5cb26b1afe615ac7e06b2ccbee6235b3&chksm=faa0ecd5cdd765c3f285bcb3b23f4f1f3e27f6e99021ad4659480ccc47f9bf25a05107f4fee2&scene=21#wechat_redirect)

- [【剖析 | SOFAMosn】系列之 SOFAMosn 的诞生和特性总览](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247484231&idx=1&sn=1cbc399976d9c558db3a0a36a4c3afc5&chksm=faa0ec9dcdd7658b9dffd68d04bbe47a2d757d66267a20141f16c6bcc9b9e329cf95722ceb16&scene=21#wechat_redirect)

- [Service Mesh 发展趋势：云原生中流砥柱](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247485099&idx=3&sn=9b8447230073c85ca7eb1d784afe6a19&chksm=faa0e971cdd76067866a6c045e4f23ecc79dfae3ec8efbdd8cfece2fea6cf30fbebcb694dd61&scene=21#wechat_redirect)

### MOSN 项目进展

本月我们还认证了一位新的 committer，是来自字节跳动的 郑泽超 同学，感谢 郑泽超 同学为 MOSN 社区做出的贡献。

**本周发布详情如下：**

**1、MOSN发布 v0.21.0 版本，主要变更如下：**

- 限流模块升级与优化，支持自定义过滤条件等能力
- 为适配路由支持变量机制对部分常量名进行了不兼容的删除和新增，可能会影响部分基于 MOSN 的代码编写
- 新增了 DSL(Domain-Specific Language)的路由支持
- StreamFilter 模块支持加载基于 Go 动态连接库编写的 Filter
- 基于 XProtocol 实现了 DubboThrift 协议的支持
- 其他 BUG Fix 与优化
详细参考：[https://github.com/mosn/mosn/releases/tag/v0.21.0](https://github.com/mosn/mosn/releases/tag/v0.21.0)

### SOFABoot 项目进展

**本周发布详情如下：**

**1、SOFABoot发布 v3.6.0 版本，主要变更如下：**

- 支持本地开发时自动将 SOFABoot 日志输出到控制台
- startup endpoint 采用新的数据格式，支持按时间轴分析
- 修复 baen 加载耗时的图形化展示问题
- 修复 ReadinessCheckListener 的启动顺序问题
- SOFARPC 升级版本至 5.7.7
- SOFATracer 升级版本至 3.1.0
- SOFA-common-tools 升级版本至 1.3.2
- Tomcat 升级版本至 9.0.37
- 使用 Github Action 进行CI
- 移除默认的 Maven Profile 配置
详细参考：[https://github.com/sofastack/sofa-boot/releases/tag/v3.6.0](https://github.com/sofastack/sofa-boot/releases/tag/v3.6.0)


### SOFATracer  项目进展

**本周发布详情如下：**

**1、SOFATracer 发布 v3.1.0 版本，主要变更如下：**

- 修复 flexible result.code 返回成功、失败 code 码
- 修复 DubboSofaTracerFilter Server span tag value error
- 修复 SofaTracerFeignClient 中 UnsupportedOperationException 问题
- 优化 spring mvc filter 的 error tag
- 支持 kafka
- 支持 RabbitMQ
- 支持 oracle rac JDBC URL
- 支持 hikari
详细参考：
[https://github.com/sofastack/sofa-tracer/releases/tag/v3.1.0](https://github.com/sofastack/sofa-tracer/releases/tag/v3.1.0)

