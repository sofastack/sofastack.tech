---
title: "SOFA Weekly | MOSN、Seata 发布新版本、MOSN 相关阅读整理"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2020-11-06T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563524226806-e93607a3-1b77-4ca2-8c3c-0384ab966154.png"
---

**SOFA WEEKLY | 每周精选，筛选每周精华问答**

**同步开源进展，欢迎留言互动**

![weekly](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1562925824761-fc720f21-9622-437b-a783-0b0729eda119.jpeg)

**SOFA**Stack（**S**calable **O**pen **F**inancial **A**rchitecture Stack）是蚂蚁集团自主研发的金融级分布式架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

- **SOFAStack 官网：**[https://www.sofastack.tech](https://www.sofastack.tech/)
- **SOFAStack：**[https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动
我们会筛选重点问题通过 " SOFA WEEKLY " 的形式回复

**1、《Service Mesh Webinar#4:阿里云 CDN 微服务架构演进之路》直播回顾以及 QA 整理**
视频回顾地址：[https://www.bilibili.com/video/BV13D4y1R7do/](https://www.bilibili.com/video/BV13D4y1R7do/)

**@道酉** 提问：
> 请问阿里云 MOSN 两个容器的热更新怎么实现的，就是怎么在pod内添加一个容器再去掉一个

A：我们其实也没用跨容器热升级的方式，两个 Pod 挂载相同目录的方式是支持的。

**@陈鹏** 提问：

> 请问一下同一个容器的热升级是怎么做的呢？

A：我们是通过 RPM 升级的方式，容器内 systemd 管理的进程。

**@梁昌泰** 提问：

> 重启不叫热升级吧？

A：没有重启哈，直接起来一个新的进程。

**2、@谢子华** 提问：

> Seata Saga 中，TC 的作用是什么？在 Saga 执行过程中 TM、TC、RM 和状态机的交互过程是怎样的？

A：1）发起重试。2）根据分支响应状态，判断是否切换重试方向。目前，Sage 的分支默认情况下不会注册到 TC 了的，因为 Saga 本地库里有各 RM 的数据。 只有全局事务注册和全局事务提交或回滚时，与 TC 交互。

> 现在二阶段重试失败不断发起重试在 1.4.0 版本解决了吗？判断是否切换重试方向是只有可能 TC 会决定向后或者向前重试？

A：是由 RM 端返回的状态为依据，由 TC 端切换重试方向，决定权在 RM 端。

![Seata RM 端返回状态为依据](https://cdn.nlark.com/yuque/0/2020/png/226702/1604649762043-76fd2556-1b86-4718-9521-fbf0e0b7e800.png)

> 我的理解是 RM 告诉 TC 回滚失败，然后有可回滚和不可回滚两个状态，TC 根据这个决定是否继续重试？那如何在 RM 进行配置？

A：我刚才的截图是 TC 端发起全局提交时，RM 返回“回滚”失败重试回滚，这种情况，默认情况下不存在了，因为 Saga 不会注册分支到 TC。 实际上，应该是在 SagaCore 的全局回滚时，RM 端如果返回“提交”失败，重试提交状态时，会切换到向前重试。

![Seata 返回状态提交失败](https://cdn.nlark.com/yuque/0/2020/png/226702/1604649762068-bee412b1-72be-4862-923f-14b49f08c827.png)

看了下源码，只有全局事务是因超时而进入全局回滚时，才会切换重试方向。

> 切换重试方向是指本来流程图配置是向后重试，然后超时了，TC 会切换为向前重试？

A：意思是全局事务正在运行时，因超时60秒，TC 端自动将全局事务标记为超时回滚状态，然后会异步发起全局回滚请求。 这种情况下，碰到回滚失败时，会切换为向前重试。

> 哦哦，原来是这个样子。默认情况下，本地只会把全局的 RM，状态发送给 TC?

A：默认情况下，RM 的数据只会存在本地。TC 端可以说是不管 Saga 分支的情况的。TC 只管接收 1）TM 的开始全局事务、完成全局事务；2）超时进入全局回滚；3）根据状态判断是否继续重试，还是切换重试方向。

> 1)是 TM 监测到所有 RM 都已完成然后告诉 TC 全局事务结束？3)TC 根据状态判断是否重试，现在 RM 不把状态发送给 TC，那这个状态是从哪里来?

A：1）是的。  3）这个请求是从 TC 向 RM 端发起的。RM 只是返回一个状态而已。

> 我在实践中的问题就是在二阶段执行出现异常会不断地重试，如之前跟你聊过的补偿触发后补偿服务执行异常会不断重试。上述 TC 发起的全局回滚如果回滚过程中出现异常是不是也会不断地重试？不断地重试感觉比较占用资源？是否有应对策略让他能够只是有限次重试？

A：重试策略的 PR 已经有了，但是因为 PR 依赖关系较多，暂时还没有合并，后续我会精简 PR 代码，单单引入重试策略的功能及其配置的功能。到时候会能够配置重试策略。目前，基本上是1秒钟就会发起一次重试。

> 现在没有重试策略的情况下，是否有其他的应对方法？

A：将重试时间间隔配置稍微大一些，默认1秒。

### 本周推荐阅读

- [云原生网络代理 MOSN 的进化之路](/blog/cloud-native-network-proxy-mosn-evolutionary-path/)
- [基于 MOSN 和 Istio Service Mesh 的服务治理实践](/blog/mosn-istio-service-mesh/)
- [记一次在 MOSN 对 Dubbo、Dubbo-go-hessian2 的性能优化](/blog/mosn-dubbo-dubbo-go-hessian2-performance-optimization/)
- [云原生网络代理 MOSN 透明劫持技术解读 | 开源](/blog/mosn-transparent-hijacking/)
- [云原生网络代理 MOSN 扩展机制解析 | SOFAChannel#14 直播整理](/blog/sofa-channel-14-retrospect/)
- [云原生网络代理 MOSN 多协议机制解析 | SOFAChannel#13 直播整理](/blog/sofa-channel-13-retrospect/)
- [云原生网络代理 MOSN 平滑升级原理解析 | 开源](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247485819&idx=1&sn=0c2e6603860e4690425864fc3350e07d&chksm=faa0e6a1cdd76fb7c5cedf83580bcd61b27516aa42dd7ed0693e62c318391139ee09644debb9&scene=21)

### SOFA 项目进展

**本周发布详情如下：**

**1、发布 MOSN v0.18.0 版本，主要变更如下：**

- 新增 MOSN 配置文件扩展机制；
- 新增 MOSN 配置工具，提升用户配置体验；
- 优化 HTTP 协议处理对内存的占用；
- TLS 模块优化，增加了客户端降级配置逻辑、降低了 TLS 内存占用；
- 支持大于 4M 的 XDS 消息；
- 部分 API 接口进行了重构；

详细发布报告：
[https://github.com/mosn/mosn/releases/tag/v0.18.0](https://github.com/mosn/mosn/releases/tag/v0.18.0)

**2、发布 Seata v1.4.0 版本，主要变更如下：**

- 支持 yml 配置文件；
- 支持 Oracle nclob 类型；
- 支持客户端最少的活动负载均衡；
- 支持客户端一致性哈希的负载均衡；
- 支持 Spring Boot 使用自定义配置中心和注册中心；
- 支持 Apollo 密钥 key 配置；
- 修复禁止执行更新主键值的 SQL；
- 重构 Redis 存储模式下 session 的存储结构；

详细发布报告：
[https://github.com/seata/seata/releases/tag/v1.4.0](https://github.com/seata/seata/releases/tag/v1.4.0)
