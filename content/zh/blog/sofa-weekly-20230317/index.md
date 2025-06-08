---
title: "SOFA Weekly | 本周贡献 & issue 精选"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly | 本周贡献 & issue 精选"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2023-03-17T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ"
---

## SOFA WEEKLY | 每周精选

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1e08fca65f7643c783d33f590bb41d5a~tplv-k3u1fbpfcp-zoom-1.image)

**筛选每周精华问答，同步开源进展，欢迎留言互动～**

**SOFA**Stack（**S**calable **O**pen **F**inancial **A**rchitecture Stack）是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

**SOFAStack 官网:** *[https://www.sofastack.tech](https://www.sofastack.tech)*

**SOFAStack:** *[https://github.com/sofastack](https://github.com/sofastack)*

### SOFAStack 社区会议

**MOSN**
主题：MOSN 2023 社区会议
时间：3 月 23 号（下周四）晚上 19 点
钉钉会议号：689 448 86753
电话呼入：+862759771614（中国大陆）
钉钉入会链接：[https://meeting.dingtalk.com/j/vvE0uCA0vQT](https://meeting.dingtalk.com/j/vvE0uCA0vQT)

议题：
- 回顾 MOSN 去年进展及今年的规划。
- 邀请部分 MOSN 用户来分享落地经验、发展规划。
- 共商 MOSN 2023 发展大计。

另外，还邀请了 Higress 社区来互动交流，探讨合作空间。
Service Mesh、Gateway、Envoy、Istio、ztunnel 等等大家关注的话题，也可以在这里交流。欢迎大家参会讨论~

「 MOSN 」：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

**Layotto**
主题：Layotto 社区会议
时间：3 月 22 号（下周三）下午 14 点
钉钉会议令：688 824 34655
电话呼入：+862759771621（中国大陆）+8657128356288（中国大陆）
钉钉入会链接：[dingtalk://dingtalkclient/page/videoConfFromCalendar?confId=1cebca80-e8cd-4f26-b529-79bac0ce7493&appendCalendarId=1&calendarId=2299840541](dingtalk://dingtalkclient/page/videoConfFromCalendar?confId=1cebca80-e8cd-4f26-b529-79bac0ce7493&appendCalendarId=1&calendarId=2299840541)

议题：
- Discussion: 自建各种 Component  #902
- 希望 Layotto 提供高性能的通信交互能力 #867

欢迎感兴趣同学参加，有任何想交流讨论的议题可以直接留言。
想要参加社区建设的同学可以关注社区的新手任务列表，总有一个适合你。

「Layotto」： 

https://github.com/mosn/layotto/issues/902

https://github.com/mosn/layotto/issues/867


### SOFAStack 社区本周贡献

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*nN_FTIfeLu0AAAAAAAAAAAAADrGAAQ/original)

### SOFAStack GitHub issue 精选

**本周各项目回复 issue 共计 2 条**

欢迎大家在 GitHub 提交 issue 与我们互动

我们会筛选 issue 通过 

" SOFA WEEKLY " 的形式回复

**1.@LY1806620741  #1061**

>com.alipay.sofa.rpc.enable-swagger 在 3.16.3 是否已经废弃?
配置使用了 Objectway 的 asm，与 Springboot 的 asm 冲突。另外，没有在 SOFABoot 文档上找到所有的属性说明。
重现该行为的步骤：
- 运动单 SOFABoot；
- 配置 com.alipay.sofa.rpc.enable-swagger=true
- 启动并访问 http://localhost:8341/swagger/bolt/api
- debug 可以看到找不到 class objectway.classvisitor
- 引入 asm.jar 后会与 sping 框架的 asm org.springframework.asm.ClassVisitor 冲突

A：看起来是 [https:/github.com/sofastack/sofa-rpc/blob/5.8.3.1/all/pom.xml](https:/github.com/sofastack/sofa-rpc/blob/5.8.3.1/all/pom.xml) 少添加了一个 asm 的依赖，导致出现上面的问题。

**「SOFABoot」**：*[https://github.com/sofastack/sofa-boot/issues/1061](https://github.com/sofastack/sofa-boot/issues/1061)*

**2.@springcoco  #589** 

>关于多部网站代码解析的一些疑问，在多网站这一章节，发现这样说：
我的疑惑是 Spring 是如何判定 ArkTomcatEmbeddedWebappClassLoader 类存在呢？
在加载 ArkTomcatServletWebServerFactory 的时候，我发现也会加载 Tomcat 默认的 Server Factory，如何最终判定周 WebServer 使用 ArkWebServerFacticServletTomcat 使用 Ark。
![](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*IO0LTpFto7sAAAAAAAAAAAAADrGAAQ/original)

A：ArkTomcatEmbeddedWebappClassLoader 作为一个判断条件，如果没有使用 web-ark-plugin，意味着没有 ArkTomcatEmbeddedWebappCl。

**「SOFAArk」**：*[https://github.com/sofastack/sofa-ark/issues/589](https://github.com/sofastack/sofa-ark/issues/589)*

### 本周推荐阅读

[SOFARegistry｜聊一聊服务发现的数据一致性](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247520348&idx=1&sn=459c9262761bd719a028c8ea27f56591&chksm=faa37f86cdd4f690cefbcb8564ab79b327512e409ada02870561ece96c6fc07c050fdc3b7f66&scene=21)

[SOFARegistry | 大规模集群优化实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247517005&idx=1&sn=685cea90982f8ecec5ffc56880d63175&chksm=faa36c97cdd4e58163830407bd827838f6ecb0a5b0e22130b507141fe9a24b2e645666fc0571&scene=21)

[降本增效：蚂蚁在 Sidecarless 的探索和实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247517989&idx=1&sn=1b49b68c9281d0c2514fa4caa38284fb&chksm=faa368ffcdd4e1e9fa5361d6ea376bbc426272c7a32250cc67ae27dcd84a6113b4a016a1518d&scene=21)

[如何看待 Dapr、Layotto 这种多运行时架构](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247510516&idx=1&sn=eff21915cd0ac1a8c8e3f126b549a605&chksm=faa3462ecdd4cf38ab6ab0c7201902fb53d54cea4865f9b7d7cdcdc7eaa00cf354d8b05e5393&scene=21)

欢迎扫码关注：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e19d0a6d7f734ad6a585cde82ae4f3bf~tplv-k3u1fbpfcp-zoom-1.image)
