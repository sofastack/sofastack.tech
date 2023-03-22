---
title: "SOFA Weekly | MOSN、Layotto 社区会议通知、Seata 版本发布"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly | MOSN、Layotto 社区会议通知、Seata 版本发布"
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

**SOFA 社区会议** 

**MOSN**

**主题：**MOSN 2023 社区会议
**时间：**3 月 23 号（下周四）晚上 19 点
**钉钉会议号**：689 448 86753
**电话呼入**：+862759771614（中国大陆）
**钉钉入会链接**：*[https://meeting.dingtalk.com/j/vvE0uCA0vQT](https://meeting.dingtalk.com/j/vvE0uCA0vQT)*

**议题**：
回顾 MOSN 去年进展及今年的规划。
邀请部分 MOSN 用户来分享落地经验、发展规划。
共商 MOSN 2023 发展大计。

另外，还邀请了 Higress 社区来互动交流，探讨合作空间。
Service Mesh、Gateway、Envoy、Istio、ztunnel 等等大家关注的话题，也可以在这里交流。欢迎大家参会讨论~

**「 MOSN 」**：*[https://github.com/mosn/mosn](https://github.com/mosn/mosn)*

**Layotto**

**主题**：Layotto 社区会议
**时间**：3 月 22 号（下周三）下午 14 点
**钉钉会议令**：688 824 34655
**电话呼入**：+862759771621（中国大陆）+8657128356288（中国大陆）
**钉钉入会链接**：dingtalk://dingtalkclient/page/videoConfFromCalendar?confId=1cebca80-e8cd-4f26-b529-79bac0ce7493&appendCalendarId=1&calendarId=2299840541

**议题**：
Discussion: 自建各种 Component  #902
希望 Layotto 提供高性能的通信交互能力 #867

欢迎感兴趣同学参加，有任何想交流讨论的议题可以直接留言。
想要参加社区建设的同学可以关注社区的新手任务列表，总有一个适合你。

**「Layotto」**： 
*[https://github.com/mosn/layotto/issues/902](https://github.com/mosn/layotto/issues/902)*
*[https://github.com/mosn/layotto/issues/867](https://github.com/mosn/layotto/issues/867)*

### SOFAStack 社区本周贡献

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*76b-TpmBiEAAAAAAAAAAAAAADrGAAQ/original)

### SOFAStack GitHub issue 精选

**本周各项目回复 issue 共计 2 条**

欢迎大家在 GitHub 提交 issue 与我们互动

我们会筛选 issue 通过 

" SOFA WEEKLY " 的形式回复

1.@LY1806620741 #1061

com.alipay.sofa.rpc.enable-swagger 在 3.16.3 是否已经废弃

配置使用了 Objectway 的 asm，与 Springboot 的 asm 冲突。
另外，没有在 SOFABoot 文档上找到所有的属性说明。

重现该行为的步骤：

运动单 SOFABoot

配置 com.alipay.sofa.rpc.enable-swagger=true

启动并访问*[http://localhost:8341/swagger/bolt/api](http://localhost:8341/swagger/bolt/api) *

debug 可以看到找不到 class objectway.classvisitor

引入 asm.jar 后会与 sping 框架的 asm org.springframework.asm.ClassVisitor 冲突

A：看起来是 *[https:/github.com/sofastack/sofa-rpc/blob/5.8.3.1/all/pom.xml](https:/github.com/sofastack/sofa-rpc/blob/5.8.3.1/all/pom.xml)* 少添加了一个 asm 的依赖，导致出现上面的问题。

**「SOFABoot」**：*[https://github.com/sofastack/sofa-boot/issues/1061](https://github.com/sofastack/sofa-boot/issues/1061)*

2.@springcoco #589

关于多部网站代码解析的一些疑问，在多网站这一章节，发现这样说：
我的疑惑是 Spring 是如何判定 ArkTomcatEmbeddedWebappClassLoader 类存在呢？
在加载 ArkTomcatServletWebServerFactory 的时候，我发现也会加载 Tomcat 默认的 Server Factory，如何最终判定周 WebServer 使用 ArkWebServerFacticServletTomcat 使用 Ark。
![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*8jEtSYT5p78AAAAAAAAAAAAADrGAAQ/original)

A：ArkTomcatEmbeddedWebappClassLoader 作为一个判断条件，如果没有使用 web-ark-plugin，意味着没有 ArkTomcatEmbeddedWebappCl

**「SOFAArk」**：*[https://github.com/sofastack/sofa-ark/issues/589](https://github.com/sofastack/sofa-ark/issues/589)*

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*3DQISba9huMAAAAAAAAAAAAADrGAAQ/original)

*[MOSN 1.0 发布，开启新架构演进](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247506881&idx=1&sn=b61b931c11c83d3aceea93a90bbe8c5d&chksm=faa3341bcdd4bd0d1fb1348c99e7d38be2597dcb6767a68c69149d954eae02bd39bc447e521f&scene=21&token=2070487715&lang=zh_CN)*

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*2GkQQobryCMAAAAAAAAAAAAADrGAAQ/original)

*[社区文章｜MOSN 社区性能分析利器——Holmes 原理浅析](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247504968&idx=1&sn=4f7034cd1732860e3ca6b808f6ad7d53&scene=21&token=2070487715&lang=zh_CN)*

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*uL4PQr5GZeUAAAAAAAAAAAAADrGAAQ/original)

*[MOSN 反向通道详解](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247513902&idx=1&sn=be00c5af2e9775a4039430bf187e16f4&chksm=faa358f4cdd4d1e23d7e9c93b4a94d6e6c377f51eb5e96b6dd5f74b840e48ebd3f518c4bf80a&scene=21&token=2070487715&lang=zh_CN#wechat_redirect)*

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*Iy4dQK7wdmgAAAAAAAAAAAAADrGAAQ/original)

*[蚂蚁集团境外站点 Seata 实践与探索](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247512945&idx=1&sn=006cc63f41c96a73b60ea7a11477310d&chksm=faa35cabcdd4d5bd910d44550bda12642de3baa61eea1a7c966387d53ca62afa63cc9f76ad66&scene=21&token=2070487715&lang=zh_CN)*
