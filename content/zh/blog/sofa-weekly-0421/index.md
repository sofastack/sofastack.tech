---
title: "SOFA Weekly｜SOFARPC 5.10.0 版本发布、SOFA 五周年回顾、Layotto 社区会议回顾与预告"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly｜SOFARPC 5.10.0 版本发布、SOFA 五周年回顾、Layotto 社区会议回顾与预告"
categories: "SOFA WEEKLY"
tags: ["SOFA WEEKLY"]
date: 2023-04-21T15:00:00+08:00
cover: "https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*ZhNJQqxZo7YAAAAAAAAAAAAADrGAAQ/original"

---

## SOFA WEEKLY | 每周精选

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1e08fca65f7643c783d33f590bb41d5a~tplv-k3u1fbpfcp-zoom-1.image)

**筛选每周精华问答，同步开源进展，欢迎留言互动～**

**SOFA**Stack（**S**calable **O**pen **F**inancial **A**rchitecture Stack）是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

**SOFAStack 官网:** *[https://www.sofastack.tech](https://www.sofastack.tech)*

**SOFAStack:** *[https://github.com/sofastack](https://github.com/sofastack)*

**SOFA社区会议回顾**  

**Layotto：**

**主题**：Layotto 社区会议

**时间**：4 月 19 日 14:00 - 15:00

**会议内容**：

本次社区会议根据议题探讨了 2023 开源之夏申报课题的具体方式和内容，并号召同学踊跃参与报名；对于自建组件问题，方案已经敲定，感兴趣的同学可以尝试；Layotto 在升级 gRPC 版本时出现前置依赖问题，并在会议中同步进展；关于 CLA 机器人出现的问题，社区同学共同讨论了提供解决的思路。

「**Layotto**」：[*https://github.com/mosn/layotto/issues/907*](https://github.com/mosn/layotto/issues/907)

「**会议回放**」：[*https://www.bilibili.com/video/BV1aT411p7cr/?share_source=copy_web&vd_source=802e089175dbc2ea677914f78683b18a*](https://www.bilibili.com/video/BV1aT411p7cr/?share_source=copy_web&vd_source=802e089175dbc2ea677914f78683b18a)

**SOFA 社区会议预告** 

**Layotto：**

**主题：**Layotto 2023-04-26 社区会议

**时间：**4 月 26 日（下周三）14:00

**入会口令（钉钉）：**688 824 34655

**电话呼入：**+862759771621（中国大陆）+8657128356288（中国大陆）

**入会链接：**[dingtalk://dingtalkclient/page/videoConfFromCalendar?confId=1cebca80-e8cd-4f26-b529-79bac0ce7493&appendCalendarId=1&calendarId=2344343024](dingtalk://dingtalkclient/page/videoConfFromCalendar?confId=1cebca80-e8cd-4f26-b529-79bac0ce7493&appendCalendarId=1&calendarId=2344343024)

**议题：**

- 2023 开源之夏-课题/导师招募#894

- Discussion：自建各种 Component#902

- 希望 Layotto 提供高性能的通信交互能力#867

「**Layotto**」：[*https://github.com/mosn/layotto/issues/907*](https://github.com/mosn/layotto/issues/907)

SOFA 五周年资料已上传 SOFAStack 官网

回复公众号：“**SOFA 五周年**”

即可获取链接啦～

还可戳“**阅读原文**”跳转哦！

 **SOFAStack 社区本周贡献**  

![图片](https://mmbiz.qpic.cn/mmbiz_png/nibOZpaQKw08NwpGuoGmKUQpXq3QG7jibC55Uz1aaSbicTicvLcvNzEjJ5DwE3buD6bh21bGNEHyD52XKsYGxBoH8A/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

 **SOFARPC 5.10.0 版本发布**  

发布 **SOFARPC 5.10.0** **版本**，主要变更如下:

- 重构了自定义序列化器的注册模式，使得主站版可以覆盖开源版的注册#1296

- 修改了反序列化时 Request Header 的处理逻辑#1325

- 更新了 Javassist Proxy 构造 class 时的 API 使之能在 JDK17 环境下运行#1316

详细发布报告：*https://github.com/sofastack/sofa-rpc/compare/v5.9.2...v5.10.0*

  **SOFAStack GitHub issue 精选**  

**本周各项目回复 issue 共计 2 条**

欢迎大家在 GitHub 提交 issue 与我们互动

我们会筛选 issue 通过

 " SOFA WEEKLY " 的形式回复

1. @LY1806620741 #1061

> com.alipay.sofa.rpc.enable-swagger 是否已经废弃？在 3.16.3

> com.alipay.sofa.rpc.enable-swagger=true 配置使用了 Objectway 的 ASM，与 Spring Boot 的 ASM 冲突。

A：可以手动增加一个依赖。

```
<dependency>
    <groupId>org.ow2.asm</groupId>
    <artifactId>asm</artifactId>
    <version>9.1</version>
</dependency>
```

看起来是 [*https://github.com/sofastack/sofa-rpc/blob/5.8.3.1/all/pom.xml*](https://github.com/sofastack/sofa-rpc/blob/5.8.3.1/all/pom.xml) 少添加了一个 ASM 的依赖，导致出现上面的问题。

「**SOFABoot**」：[*https://github.com/sofastack/sofa-boot/issues/1061*](https://github.com/sofastack/sofa-boot/issues/1061)

2. @Estom#642

> 多 Host 模式下，动态部署，无法启动第二个 Tomcat。需要添加特殊的配置吗？

A：多 Host 模式配置建议看一下这份文档 [*https://www.sofastack.tech/projects/sofa-boot/sofa-ark-spring-boot-demo/*](https://www.sofastack.tech/projects/sofa-boot/sofa-ark-spring-boot-demo/)中的“6.多 Host 与单 Host 模式”。

「**SOFAArk**」：[*https://github.com/sofastack/sofa-ark/issues/642*](https://github.com/sofastack/sofa-ark/issues/642)

![图片](https://mmbiz.qpic.cn/mmbiz_jpg/nibOZpaQKw0icFMvfmJYE2gzNBePWwuuickPbVLQXdjXHytsPOr7fibEPjbYY2TZU8BcwsrJzoLVGQt7j9qJcF6aqw/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)
