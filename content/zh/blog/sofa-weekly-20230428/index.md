---
title: "SOFA Weekly｜SOFAArk 社区会议预告、Layotto 社区会议回顾、社区本周贡献"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly｜SOFAArk 社区会议预告、Layotto 社区会议回顾、社区本周贡献"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2023-04-28T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ"

---

## SOFA WEEKLY | 每周精选

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1e08fca65f7643c783d33f590bb41d5a~tplv-k3u1fbpfcp-zoom-1.image)

**筛选每周精华问答，同步开源进展，欢迎留言互动～**

**SOFA**Stack（**S**calable **O**pen **F**inancial **A**rchitecture Stack）是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

**SOFAStack 官网:** *[https://www.sofastack.tech](https://www.sofastack.tech)*

**SOFAStack:** *[https://github.com/sofastack](https://github.com/sofastack)*

 **SOFA 社区会议预告**

**SOFAArk：**

**主题：**SOFAArk 社区会议

**时间：**5 月 8 日 20:00 - 21:30

**入会口令（钉钉）：**683 550 26227

**电话呼入：**+862759771614（中国大陆）+8657128356290（中国大陆）

**入会链接：**[https://meeting.dingtalk.com/j/hv0CVKasIgs](https://meeting.dingtalk.com/j/hv0CVKasIgs)

**议题：**

- 近期版本发布计划和内容。
- 非迭代 issue 处理同步。
- 开源之夏活动介绍。
- GPT 在 SOFA 工程领域的探索。

「**SOFAArk**」：[*https://github.com/sofastack/sofa-ark/issues/636*](https://github.com/sofastack/sofa-ark/issues/636)

每月一次的 SOFAArk 社区会议要开啦！有对议题感兴趣的同学不要错过哦～

**SOFA 社区会议回顾**  

**Layotto：**

**主题**：Layotto 社区会议

**时间**：4 月 26 日 14:00 - 15:00

**会议内容**：

本次社区会议根据议题同步了 2023 开源之夏申报的课题，并号召社区同学踊跃参与；对于自建各种组件，会议详细讲解了问题痛点与解决方案；Layotto 在升级 gRPC 版本时出现的前置依赖问题，会议中的同学提出了方案；在会议的最后，同步了 CLA 机器人解决的进展与办法。

「**Layotto**」：[*https://github.com/mosn/layotto/issues/915*](https://github.com/mosn/layotto/issues/915)

「**会议回放**」：[*https://www.bilibili.com/video/BV1Qg4y177dG/?vd_source=65cf108a3fb8e9985d41bd64c5448f63*](https://www.bilibili.com/video/BV1Qg4y177dG/?vd_source=65cf108a3fb8e9985d41bd64c5448f63)

 **社区本周贡献**  

![图片](https://mmbiz.qpic.cn/mmbiz_jpg/nibOZpaQKw0ibReXIsXXFticcwMFVCByseQfrAIo8LEXdjPFXPKcxm95a1vzoxOKicf3ic4SaCFZ2by13KiaHKIicCa1A/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)

**SOFAStack GitHub issue 精选**  

**本周各项目回复 issue 共计 2 条**

欢迎大家在 GitHub 提交 issue 与我们互动

我们会筛选 issue 通过

 " SOFA WEEKLY " 的形式回复

**1.@huayangchan** #914

> 下载 Layotto-0.5.0 源码，在本地 Windows 系统编译启动时，报一些函数和变量未定义错误，如 undefined: syscall.GetsockoptIPv 6Mreq，这应该是 Unix 系统才调用的函数，为什么在 Windows 系统运行会调 Unix 系统相关的函数，还说源码只能在 Unix 系统上便已启动?

A：Layotto 是基于 MOSN 为底座的，用到了 Linux 的系统函数，所以不支持 Windows 上的编译。可以参考：[*https://github.com/mosn/layotto/issues/801*](https://github.com/mosn/layotto/issues/801)

「**Layotto**」：[*https://github.com/mosn/layotto/issues/914*](https://github.com/mosn/layotto/issues/914)

**2.@shuangchengsun** #263

> 图片展示了实例（Client）的上下线过程， 假设这么一个场景，Client1 处于下线过程中，此时它已经和 Session Server 断链，但是 Session Server 在发出同步通知前因为某种原因挂了，此时 Client1 在路由表中的状态是如何维护的？
>
> ![图片](https://mmbiz.qpic.cn/mmbiz_png/nibOZpaQKw0ibReXIsXXFticcwMFVCByseQNos27Zic3qd2VWupmfJZ3ljZCDzpvfqmrQYib8oCTHvw5l15OAPOTObg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

A: Data 上有一个定时器去维护每个 Session 相关数据的。如果 Session 挂了，Data 大约 30s 后把挂掉的 Session 的数据清理掉，同时链接挂掉的 Client（除了要下线的那个）会自动重连到其他 Session 上。然后会把数据增长一个 Version 重新注册到 Session，Session 会再次发到那台 Data 上。

「**SOFARegistry**」：[*https://github.com/sofastack/sofa-registry/issues/263*](https://github.com/sofastack/sofa-registry/issues/263)

  **本周推荐阅读**

[缘起｜蚂蚁应用级服务发现的实践之路](https://mp.weixin.qq.com/s/-oVOeakwefgvlFyi6yYgKA)

[SOFARegistry 源码｜数据同步模块解析](https://mp.weixin.qq.com/s/UqsFzSuxuOfdVGJUGEid8g)

[MoE 系列（一）｜如何使用 Golang 扩展 Envoy](https://mp.weixin.qq.com/s/GF5Pr2aAOe6NAdJ5VgfMvg)

[MoE 系列（二）｜Golang 扩展从 Envoy 接收配置](https://mp.weixin.qq.com/s/xRt9qet-Dm3UMEVa3iDFrA)

![图片](https://mmbiz.qpic.cn/mmbiz_jpg/nibOZpaQKw0icFMvfmJYE2gzNBePWwuuickPbVLQXdjXHytsPOr7fibEPjbYY2TZU8BcwsrJzoLVGQt7j9qJcF6aqw/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)
