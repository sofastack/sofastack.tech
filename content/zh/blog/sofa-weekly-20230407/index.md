---
title: "SOFA Weekly｜SOFA 开源五周年活动报名、Layotto 会议预告、社区本周贡献 & issue 精选"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly｜SOFA 开源五周年活动报名、Layotto 会议预告、社区本周贡献 & issue 精选"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2023-04-07T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ"

---

## SOFA WEEKLY | 每周精选

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1e08fca65f7643c783d33f590bb41d5a~tplv-k3u1fbpfcp-zoom-1.image)

**筛选每周精华问答，同步开源进展，欢迎留言互动～**

**SOFA**Stack（**S**calable **O**pen **F**inancial **A**rchitecture Stack）是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

**SOFAStack 官网:** *[https://www.sofastack.tech](https://www.sofastack.tech)*

**SOFAStack:** *[https://github.com/sofastack](https://github.com/sofastack)*

**Layotto 会议预告**  

**Layotto：**

**主题：**Layotto 2023-04-12 社区会议

**时间：**4 月 12 日（下周三）14:00

**入会口令（钉钉）：**688 824 34655

**电话呼入：**+862759771621（中国大陆）+8657128356288（中国大陆）

**入会链接：**[dingtalk://dingtalkclient/page/videoConfFromCalendar?confId=1cebca80-e8cd-4f26-b529-79bac0ce7493&appendCalendarId=1&calendarId=2344343024](dingtalk://dingtalkclient/page/videoConfFromCalendar?confId=1cebca80-e8cd-4f26-b529-79bac0ce7493&appendCalendarId=1&calendarId=2344343024)

**议题：**

\- 2023开源之夏-课题/导师招募 #894；

\- Discussion: 自建各种 Component #902；

\- 希望 layotto 提供高性能的通信交互能力 #867。

「**Layotto**」：

[*https://github.com/mosn/layotto/issues/907*](https://github.com/mosn/layotto/issues/907)

 **社区本周贡献** 

![图片](https://mmbiz.qpic.cn/mmbiz_png/nibOZpaQKw0ic2YjalJGHD6heUMn87Ot7QVlx9uP7sc0w1gL6hD7pIDAt5zCWZFecOeeKw6SbSkAic9yqwQ3bpdEQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

 **SOFAStack GitHub issue 精选** 

**本周各项目回复 issue 共计 2 条**

欢迎大家在 GitHub 提交 issue 与我们互动

我们会筛选 issue 通过 

" SOFA WEEKLY " 的形式回复

**1.@LSQGUANLIVV** **#1322**

> 从 sofa2.3.5 升级到 3.6.3 的时候，启动应用报错，如下图所示。

![图片](https://mmbiz.qpic.cn/mmbiz_png/nibOZpaQKw0ic2YjalJGHD6heUMn87Ot7QJx6VRfa3eYJZmHNpGic23zuanp1L8DswrSiazZkV3A1yqMdFNFw2xZMA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

![图片](https://mmbiz.qpic.cn/mmbiz_png/nibOZpaQKw0ic2YjalJGHD6heUMn87Ot7QCxGNFZiaB2D17vmxns3ve8gibWMIke9ZbHa0c0fenDwKFVkHBuWjTUhQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

![图片](https://mmbiz.qpic.cn/mmbiz_png/nibOZpaQKw0ic2YjalJGHD6heUMn87Ot7QGMNxvvpyfLib8dia99Bo7iapYKbnbHdXJRTswrJn3YJFWysX726H4e2wg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

> 按照报错的点去找发现是 applicationContext 为 null，这里是需要新增加什么配置吗？还是原来的什么地方需要改呢？

A：有可能是 sofa-boot / sofa-rpc-starter / sofa-rpc 这三个包的兼容性问题。升级了 sofa-rpc，需要同时升级这三个包。可以通过 pom 依赖看下是否有版本冲突。

> 是用的 sofaboot-enterprise-dependencies 的父依赖的默认的，这个也会冲突吗？

A：使用默认的一般不会有问题，担心有些配置把默认配置覆盖了。另外商业版需要咨询商业版客服，开源社区这边能提供的帮助有限。

「**SOFARPC**」：[*https://github.com/sofastack/sofa-rpc/issues/1322*](https://github.com/sofastack/sofa-rpc/issues/1322)

**2.@hanzhihua** **#956**

> readCommittedUserLog 可能获得不到刚写入的数据。我在做 NodeTest 测试过程中，在测试 readCommittedUserLog 方法中，出现了错误。

![图片](https://mmbiz.qpic.cn/mmbiz_png/nibOZpaQKw0ic2YjalJGHD6heUMn87Ot7QNYoDXJszeYiaHV2Akwd4tKlJ61ib4Eyqjn89knGtLhMcJ4NpzPmCNvkw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

> 我发现主要是日志写入后，但 lastAppliedIndex 没有原子级别更新，造成了读取不到错误。

![图片](https://mmbiz.qpic.cn/mmbiz_png/nibOZpaQKw0ic2YjalJGHD6heUMn87Ot7QChuGFzqSNYeruSuqxRibCr3ILfe19S9sbpjcl0znFwqehJicWMckicmvw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

A：因为`onApply`中是可以回滚的，所以没法去实时更新 lastAppliedIndex，只有确认这一批次没有回滚或者回滚的正确 log index，才能去更新。如果你需要在`onApply`过程中去 commit，可以调用日志迭代器的`Iterator#commit`方法，将当前 apply 的 log index 确认提交。然后就可以调用`readCommittedUserLog`确保可以读取到，代价就是无法回滚到 commit 之前的位置了。

> 问一下，onApply 回滚是什么意思，是指状态机 apply 发生异常，还是获取日志为 null，另外怎么回滚呢？

A：这个方法：

![图片](https://mmbiz.qpic.cn/mmbiz_png/nibOZpaQKw0ic2YjalJGHD6heUMn87Ot7QVnK21qL5d6Ng7MvZyylWwFXbGxl2HnricYlgNBibM5SMKhMiaKicQJQtFA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

「**SOFAJRaft**」：[*https://github.com/sofastack/sofa-jraft/issues/956*](https://github.com/sofastack/sofa-jraft/issues/956)

  **本周推荐阅读** 

[《MoE 系列（一）｜如何使用 Golang 扩展 Envoy》](https://mp.weixin.qq.com/s/GF5Pr2aAOe6NAdJ5VgfMvg)

[《SOFAJRaft 在同程旅游中的实践》](https://mp.weixin.qq.com/s/6JwaGipPDIig4Z6LUNTs-Q)

[《Tongsuo/铜锁｜「开放原子开源基金会」拜访篇》](https://mp.weixin.qq.com/s/Dgw43is4SPW4T-1C3JW69w)

[《如何看待 Dapr、Layotto 这种多运行时架构？》](hhttps://mp.weixin.qq.com/s/dmvx6rGSMkrurGWSVDHkMw)

![图片](https://mmbiz.qpic.cn/mmbiz_jpg/nibOZpaQKw0icFMvfmJYE2gzNBePWwuuickPbVLQXdjXHytsPOr7fibEPjbYY2TZU8BcwsrJzoLVGQt7j9qJcF6aqw/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1)
