---
title: "SOFA Weekly | SOFA 社区元旦快乐，MOSN 荣获 2020 中国优秀开源项目"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2020-12-31T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563524226806-e93607a3-1b77-4ca2-8c3c-0384ab966154.png"
---

SOFA WEEKLY | 每周精选，筛选每周精华问答
同步开源进展，欢迎留言互动

![weekly.jpg](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1562925824761-fc720f21-9622-437b-a783-0b0729eda119.jpeg)

SOFAStack（Scalable Open Financial Architecture Stack）是蚂蚁金服自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

SOFAStack 官网: [https://www.sofastack.tech](https://www.sofastack.tech/)

SOFAStack: [https://github.com/sofastack](https://github.com/sofastack)

### 社区 Big News 

SOFA 社群元旦快乐！新的一年我们也要在一起哦！

![image.png](https://cdn.nlark.com/yuque/0/2020/png/2883938/1609403224171-d6eb5706-916c-4fb5-940f-061373abc944.png)

同时，也有一个好消息要和大家共享：
MOSN 荣获 **「2020 年中国优秀开源项目」**，感谢所有开发者们的支持和喜爱，MOSN 团队会继续努力，提供更好的开源产品和服务，也期待大家的持续共建。

![](https://cdn.nlark.com/yuque/0/2020/jpeg/2883938/1609401405155-5cfde7b6-a3c3-4a53-9ac6-e257d61755ff.jpeg)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动
我们会筛选重点问题
通过 " SOFA WEEKLY " 的形式回复

**1、@苏榴结** 提问：

> 对于某个全局事务来说，向 tc 注册说你是 tm 也是 rm，但因为这个全局事务已经有了 tm，所以它就会被认定为rm 是吗？

A :服务起来的时候就跟 TC 说了你可以做 TM ，也可以做 RM (分别建立一个长连接与 TC 通信)，然后在需要进行某个全局事务的时候，如果他是发起全局事务的那个，那么他就发挥了他 TM 那部分职能，如果他是负责操作数据库，那他就发挥了 RM 那部分的职能。

**2、@刘亚飞** 提问：

> 为什么图 1 中描述用协程池来处理可读 conn，图 2 中，又说每一个 conn 有一个读协程呢？是因为图 1 描述的是 rawpoll 模型下的代码方式，而图 2 是 goroutine-per-connection 模式下的一个 write goroutine 池化吗？

![image.png](https://cdn.nlark.com/yuque/0/2020/png/2883938/1609401492371-d560c528-d0d7-4998-b1b2-cb8ef40aee96.png)
图1

![image.png](https://cdn.nlark.com/yuque/0/2020/png/2883938/1609401492363-3303e717-2dff-455f-9932-e0bd421f4040.png)
图2

A：图 1 图 2 属于两种模型。Rawpoll 模型的话就是自己做 epoll_wait，有可读事件从协程池拿一个协程来读取数据；协程模型的话就是一个连接一个协程，标准的 go 编码模式，runtime 来处理 epoll_wait，可配置选择不同模式。

### 本周推荐阅读

- [云原生网络代理 MOSN 的进化之路](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247486961&idx=1&sn=e2710328091c2a15283cd76527078c97&chksm=faa0e22bcdd76b3d5e4d65f738a51d560fd2f32cec8a081b253ad80d19cdaef9ca88cfca2862&scene=21)
- [基于 MOSN 和 Istio Service Mesh 的服务治理实践](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247486618&idx=1&sn=d52c67fba7d4e47bb69af50b83eb29dd&chksm=faa0e340cdd76a56d2dbea3b054eea96ea74e73d625c0f5bf041bc7dd857ba21dcfd2a4042ab&scene=21)
- [记一次在 MOSN 对 Dubbo、Dubbo-go-hessian2 的性能优化](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247486296&idx=1&sn=855f5ae48c4da2dace79f6956afdb646&chksm=faa0e482cdd76d94f3b59e6d7edcaebe316faac9e74c668dd33977f7705c208fe68d782e15d2&scene=21)
- [云原生网络代理 MOSN 透明劫持技术解读 | 开源](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247486145&idx=1&sn=e193044d2fc97d68621b588a8d08c4e0&chksm=faa0e51bcdd76c0d4e507dcabf81b5b67a2e03b4be4f9430a43af0c2a68e39d0d53212a5c093&scene=21)

### SOFA项目进展

**本周发布详情如下：**

**1、SOFA-Common-Tools 发布 1.3.1 版本：**

- 修复多 classloader 场景下 commons-logging 的兼容性
- 修复 SOFAThreadPoolExecutor 被删除的方法，提高向下兼容性

详细参考:
[https://github.com/sofastack/sofa-common-tools/releases/tag/v1.3.1](https://github.com/sofastack/sofa-common-tools/releases/tag/v1.3.1)

**2、SOFA-Ark 发布 1.1.6  版本：**

- 支持插件扩展，通过宿主动态扩展指定 plugin 依赖和导出关系
- SOFA-Ark-manve-plugin 支持打包按规则排除依赖（from file）

详细参考：
[https://github.com/sofastack/sofa-ark/releases/tag/v1.1.6](https://github.com/sofastack/sofa-ark/releases/tag/v1.1.6)
