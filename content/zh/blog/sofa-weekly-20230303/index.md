---
title: "SOFA Weekly｜铜锁探「密」、本周贡献 & issue 精选"
authorlink: "https://github.com/sofastack"
description: ""
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2023-03-03T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*Rap6SJnP9f0AAAAAAAAAAAAAARQnAQ"
---

## SOFA Weekly｜铜锁探「密」、本周贡献 & issue 精选

![图片](https://mmbiz.qpic.cn/mmbiz_jpg/nibOZpaQKw09Nibva21kIShgVO0OFIOpzDwic5bUBIianAZUtQ5LxcVT2OQXgt7AjEf5mib6YazJdUibjpQhByqWdsow/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)

**筛选每周精华问答，同步开源进展，欢迎留言互动～**

**SOFA**Stack（**S**calable **O**pen **F**inancial **A**rchitecture Stack）是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

**SOFAStack 官网:** *[https://www.sofastack.tech](https://www.sofastack.tech)*

**SOFAStack:** *[https://github.com/sofastack](https://github.com/sofastack)*

### SOFAStack 社区本周贡献

![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/iaSYstiaicd4c5SCtxWgALrJoB0B2YKBHN51CxK8umBLThVFLnSdoJKNRccv973yliaVycToibSEz6G7tNBRgCJsyeA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

### SOFAStack GitHub issue 精选

**本周各项目回复 issue 共计 3 条**

欢迎大家在 GitHub 提交 issue 与我们互动

我们会筛选 issue 通过 

" SOFA WEEKLY " 的形式回复

**1.@ZhengweiHou** **#1313**

> 同一台机器启动两个 SOFA 进程，开启端口自适应（AdaptivePort），但是两个进程服务注册端口一致，但实际生效端口不一致。通过验证端口自适应逻辑发现我的机器上（ServerSocket.bind) 预期结果不一致。详细情况如图所示：

![图片](https://mmbiz.qpic.cn/mmbiz_png/nibOZpaQKw0icmKPeSTk1TEHZzYbGzwm6jb1Z6d7s82FK9oVGnLhsYBjCbxwHaTK7tEhSdLY9Z0a2FsSAibBYdPTg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

A：AdaptivePort 的逻辑在 可以看下这块代码。

com.alipay.sofa.rpc.server.ServerFactory#resolveServerConfig

和你理解的应该不太一样。

**「SOFARPC」:**  *[https://github.com/sofastack/sofa-rpc/issues/1313](https://github.com/sofastack/sofa-rpc/issues/1313)*

**2.@hanzhihua ** **#934**

> 咨询一个问题，Closure Threadpool 使用 SynchronousQueue 而不使用其他的有缓存的 Queue，是怎么考虑的呢？

A：主要是原因是希望在任务量大 Core Thread 饱和的时候尽快新增线程来更快的处理任务，中间加一个 Queue 会影响到，Java Threadpool 的策略你懂的，需要 Queue 满了后 MaximumThreads 参数的值才发挥作用。

**「SOFAJRaft」：** *[https://github.com/sofastack/sofa-jraft/issues/934](https://github.com/sofastack/sofa-jraft/issues/934)*

**3.@penglinzhang** **#612**

> 静态合并部署时，为什么宿主应用会把子业务应用中的 Bean 也会扫描注册到自己的 ApplicationContext 中，而不是仅仅把子应用作为一个特殊 Jar 包？

A：由于你的宿主应用 @ComPonentScan 扫描了 “com.alipay.sofa”，并且你的业务 Bean 也是 com/alipay/sofa 路径下的，你可以尝试将业务包 Spring-Boot-Ark-Biz 的路径改成自定义的。

**「SOFAArk」：** *[https://github.com/sofastack/sofa-ark/issues/612](https://github.com/sofastack/sofa-ark/issues/612)*

  **本周推荐阅读** 

[![图片](https://mmbiz.qpic.cn/mmbiz_png/nibOZpaQKw0ibMDeS5iaP4griao1E0Ga1gQF5G1ianh376RYpoicoehRFgiazkXLlRZhuFmPpZgZAzJn3DjpCWep71L7w/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247520348&idx=1&sn=459c9262761bd719a028c8ea27f56591&chksm=faa37f86cdd4f690cefbcb8564ab79b327512e409ada02870561ece96c6fc07c050fdc3b7f66&scene=21#wechat_redirect)
[SOFARegistry | 聊一聊服务发现的数据一致性](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247520348&idx=1&sn=459c9262761bd719a028c8ea27f56591&chksm=faa37f86cdd4f690cefbcb8564ab79b327512e409ada02870561ece96c6fc07c050fdc3b7f66&scene=21#wechat_redirect)

[![图片](https://mmbiz.qpic.cn/mmbiz_png/nibOZpaQKw09kbgMpeI4gOnmNpS4cYZB487SbfN9PBA9OWgJv8Xa5G8sCH6x4DXmkY0rAmfYb1QjBj02bI8eLHQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247517005&idx=1&sn=685cea90982f8ecec5ffc56880d63175&chksm=faa36c97cdd4e58163830407bd827838f6ecb0a5b0e22130b507141fe9a24b2e645666fc0571&scene=21#wechat_redirect)

[SOFARegistry | 大规模集群优化实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247517005&idx=1&sn=685cea90982f8ecec5ffc56880d63175&chksm=faa36c97cdd4e58163830407bd827838f6ecb0a5b0e22130b507141fe9a24b2e645666fc0571&scene=21#wechat_redirect)

[![图片](https://mmbiz.qpic.cn/mmbiz_jpg/nibOZpaQKw0icVic2YozAVFT3Glnb0kGOm9Itgia880Ug1iaAMicZVsrccXmGLmDPkIYRezMRcICZo7h84W0wVoVabvA/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247513902&idx=1&sn=be00c5af2e9775a4039430bf187e16f4&chksm=faa358f4cdd4d1e23d7e9c93b4a94d6e6c377f51eb5e96b6dd5f74b840e48ebd3f518c4bf80a&scene=21#wechat_redirect)

[MOSN 反向通道详解](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247513902&idx=1&sn=be00c5af2e9775a4039430bf187e16f4&chksm=faa358f4cdd4d1e23d7e9c93b4a94d6e6c377f51eb5e96b6dd5f74b840e48ebd3f518c4bf80a&scene=21#wechat_redirect)

[![图片](https://mmbiz.qpic.cn/mmbiz_jpg/nibOZpaQKw0ibHpzvqrKxBWoRa3dkfJfhOQjzuFuGqXxj4K4st1Y7ChGY6Fwvgic4koYYqUffcqSb5UjueianQ2d6g/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247510516&idx=1&sn=eff21915cd0ac1a8c8e3f126b549a605&chksm=faa3462ecdd4cf38ab6ab0c7201902fb53d54cea4865f9b7d7cdcdc7eaa00cf354d8b05e5393&scene=21#wechat_redirect)

[如何看待 Dapr、Layotto 这种多运行时架构？](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247510516&idx=1&sn=eff21915cd0ac1a8c8e3f126b549a605&chksm=faa3462ecdd4cf38ab6ab0c7201902fb53d54cea4865f9b7d7cdcdc7eaa00cf354d8b05e5393&scene=21#wechat_redirect)

欢迎扫码关注：

![图片](https://mmbiz.qpic.cn/mmbiz_jpg/nibOZpaQKw0icFMvfmJYE2gzNBePWwuuickPbVLQXdjXHytsPOr7fibEPjbYY2TZU8BcwsrJzoLVGQt7j9qJcF6aqw/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)
