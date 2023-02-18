---
title: "SOFA Weekly | MOSN v1.3.0 版本发布、公众号半自助投稿、本周 Contributor & QA"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly | MOSN v1.3.0 版本发布、公众号半自助投稿、本周 Contributor & QA"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2022-12-09T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ"
---

## SOFA WEEKLY | 每周精选

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1e08fca65f7643c783d33f590bb41d5a~tplv-k3u1fbpfcp-zoom-1.image)

**筛选每周精华问答，同步开源进展，欢迎留言互动～**

**SOFA**Stack（**S**calable **O**pen **F**inancial **A**rchitecture Stack）是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

**SOFAStack 官网:** *[https://www.sofastack.tech](https://www.sofastack.tech)*

**SOFAStack:** *[https://github.com/sofastack](https://github.com/sofastack)*

### SOFAStack 社区本周 Contributor

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*BDoKQJ8FoBoAAAAAAAAAAAAADrGAAQ/original)

### 每周读者问答提炼

***欢迎大家向公众号留言提问或在群里与我们互动，我们会筛选重点问题通过 " SOFA WEEKLY " 的形式回复***

**1.小白** 提问：

>这个配置是起到什么作用？<declaredMode>true</declaredMode>

A：declaredMode 是指：如果 biz 和宿主 biz 依赖相同的包，biz 会使用宿主 biz 内的包。即：biz 该包设置成 provided 时，安装 biz 至宿主 biz 可以正常使用，从而减小了 biz 的体积。

**「SOFAArk」**：*[https://github.com/sofastack/sofa-ark](https://github.com/sofastack/sofa-ark)*

**2.肖才稳** 提问：

>Seata 的回滚模式，如果数据库被其他应用改了，是不是不能回滚了？Seata 必须保证数据库只有自己一个应用用了是吗？

A：那你可以用 XA，AT 是要保证所有操作数据库的动作都在 Seata 事务的全局事务覆盖下。也就是说，如果你这个库的这个表被其他应用用了，让这个应用也集成 Seata 就行了。

**「Seata」**：*[https://github.com/seata/seata](https://github.com/seata/seata)*

### 本周推荐阅读

[cgo 机制 - 从 c 调用 go](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247516398&idx=1&sn=2172b6f6ffe9c8b3263a15ef60ee3d54&chksm=faa36f34cdd4e622746582f922cd00798a1044c4f32a7ce058be6df91b58cbee725022a56525&scene=21)

[Go 内存泄漏，pprof 够用了么?](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247516046&idx=1&sn=c8ed0fbbc18b4377778c2ed06c7332ba&chksm=faa35054cdd4d9425b6780ae5ed1a6b83ab16afd9d870affba350c8002a2c4e2efdb85abc603&scene=21)

[Seata AT 模式代码级详解](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247516247&idx=1&sn=f57bb355cef6b823a32cd8b30c0b53ee&chksm=faa36f8dcdd4e69b91a9231330f82af5558de9349425b97e2e88e6fb3f8b33845d93af156fb1&scene=21)

[SOFA 飞船 Layotto 星球登陆计划最新进展](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247517277&idx=1&sn=b455dd163575bab9c4ca457bdd266290&chksm=faa36b87cdd4e291103881503bcc130b9ec6dc651b3fd3c9813aaa0d77377d867ee8d870ccb8&scene=21)

欢迎扫码关注：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e19d0a6d7f734ad6a585cde82ae4f3bf~tplv-k3u1fbpfcp-zoom-1.image)
