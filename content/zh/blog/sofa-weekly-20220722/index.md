---
title: "SOFA Weekly | C 位大咖说、本周 QA、本周 Contributor"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly | C 位大咖说、本周 QA、本周 Contributor"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2022-07-22T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ"
---

## SOFA WEEKLY | 每周精选

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1e08fca65f7643c783d33f590bb41d5a~tplv-k3u1fbpfcp-zoom-1.image)

**筛选每周精华问答，同步开源进展，欢迎留言互动～**

**SOFA**Stack（**S**calable **O**pen **F**inancial **A**rchitecture Stack）是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

**SOFAStack 官网:** *[https://www.sofastack.tech](https://www.sofastack.tech)*

**SOFAStack:** *[https://github.com/sofastack](https://github.com/sofastack)*

### SOFAStack 社区本周 Contributor

![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*sV8eSbVe9L0AAAAAAAAAAAAAARQnAQ)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动，我们会筛选重点问题，通过 " SOFA WEEKLY " 的形式回复

**1. 罗坤** 提问：

>您好，请问一下可以用 SOFATracer 的摘要日志是 result.code 判断交易是否成功来告警么？result.code 有哪些状态？

A：是可以的，如果是监控，可以用 stat 日志。

「SOFATracer」： *[https://github.com/sofastack/sofa-tracer](https://github.com/sofastack/sofa-tracer)*

**2. xiaoyu** 提问：

>咨询一个问题，现在使用 MOSN 作为 Istio 数据面，还是只能使用 Istio 1.10.6 版本吗？

A：是的，目前支持的这个版本。

「MOSN」： *[https://github.com/mosn/mosn](https://github.com/mosn/mosn)*

**3. 高岩** 提问：

>请教下， MOSN 官网的集成 Istio 的例子，在 Katacoda 上练习 step 4 的测试 curl productpage 时失败，然后在我本地 Minikube 的环境测试结果也一样，请问下这个 demo 问题怎么排查？

A：我试了一下，这个 Katacode 上执行 grep 会报错，但是不执行就没问题。

![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*y2abQ6qNObwAAAAAAAAAAAAAARQnAQ)

>好的，我再试一下，感谢。

A：如果遇到问题，可以看一下 MOSN 的日志。kubectl logs $pod -c istio-proxy 就可以了，还有问题可以建个 issue。

「MOSN」：*[https://github.com/mosn/mosn](https://github.com/mosn/mosn)*

### 本周推荐阅读

Kusion 模型库和工具链的探索实践

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/674e94b22a0946e48dab4440139d158b~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247512283&idx=1&sn=b1a6218e9c396749846baaa9b6b38a2d&chksm=faa35f01cdd4d6177f00938c93b0c652533da148e5ecb888280205525f0e89e4636d010b64ee&scene=21)

Seata 多语言体系建设

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9119684d757b400c8b7ad63bd6a8297f~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247512283&idx=2&sn=179ef79e922a7c7475d5db288c9af96d&chksm=faa35f01cdd4d617ec9a818bdbe65b3581fa91e2f4b6162551bbacb93c11c0aef211bae8195e&scene=21)

Go 原生插件使用问题全解析

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6c955174e5944bccabab97ad54b1cfa2~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247512138&idx=1&sn=851abb8d07d47f703e33978c9c125c59&chksm=faa35f90cdd4d6869c6cd4934c042484dbe1063c3fb85462d2f33e936b96240ae33d02d18c3a&scene=21)

SOFARegistry 源码｜数据同步模块解析

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/88c5bcaa68ff4776a0ac8146547a941f~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247511796&idx=1&sn=14045ed1b3e634061e719ef434816abf&chksm=faa3412ecdd4c83808c5945af56558fe157395b21bc0d56665e102edb92316c6f245f94d306c&scene=21)

欢迎扫码关注：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6a0921ab22974961883f9499c9b6eac2~tplv-k3u1fbpfcp-zoom-1.image)
