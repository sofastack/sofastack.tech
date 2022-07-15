---
title: "SOFA Weekly | 开源人—牛学蔚、本周 QA、本周 Contributor"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly | 开源人—牛学蔚、本周 QA、本周 Contributor"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2022-07-15T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ"
---

## SOFA WEEKLY | 每周精选

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1e08fca65f7643c783d33f590bb41d5a~tplv-k3u1fbpfcp-zoom-1.image)

**筛选每周精华问答，同步开源进展**

**欢迎留言互动～**

**SOFA**Stack（**S**calable **O**pen **F**inancial **A**rchitecture Stack）是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

**SOFAStack 官网:** *[https://www.sofastack.tech](https://www.sofastack.tech)*

**SOFAStack:** *[https://github.com/sofastack](https://github.com/sofastack)*

### SOFAStack 社区本周 Contributor

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5c471aa8d3f84e87b8ae389f348cf0ff~tplv-k3u1fbpfcp-zoom-1.image)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动，我们会筛选重点问题，通过 " SOFA WEEKLY " 的形式回复

**1. 清源** 提问：

>咨询个问题，MOSN 能做协议转换吗？类似于 API 网关那种功能，像 HTTP 调 Dubbo 的服务。

A：可以的哈，这里是一个 HTTP 到 SOFA 的例子，

*[https://github.com/mosn/mosn/tree/master/pkg/filter/stream/transcoder/http2bolt](https://github.com/mosn/mosn/tree/master/pkg/filter/stream/transcoder/http2bolt)*

>我看了下，例子中并没有对 buf 做编解码，是 Bolt 自动识别 HTTP 的报文吗？

A：这个 filter 就是把 HTTP 的字段转换为 Bolt 的哟，这还有个 Spring Cloud 到 Dubbo 的转换，MOSN 已经对 buf 解码好了，暴露给你的是 HTTP 解码之后的 header 和 body，

*[https://www.github.com/mosn/extensions/tree/master/go-plugin%2Fplugins%2Ftranscoders%2Fspringcloud2dubbo%2Fmain](https://www.github.com/mosn/extensions/tree/master/go-plugin%2Fplugins%2Ftranscoders%2Fspringcloud2dubbo%2Fmain)*

「MOSN」：

*[https://github.com/mosn/mosn](https://github.com/mosn/mosn)*

**2. 国奇** 提问：

>你好，请问有能用的 SOFARegistry 安装步骤吗？

A：用 start_dev 启动 integrate 模式，registry-run.sh 是给其他脚本调用的：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6be7f7385a2f4dca94da0976d5ea7445~tplv-k3u1fbpfcp-zoom-1.image)

也可以参考下面这个文档，fatjar docker 的部署模式都可以：

*[https://www.sofastack.tech/projects/sofa-registry/deployment/](https://www.sofastack.tech/projects/sofa-registry/deployment/)***

「SOFARegistry」：

*[https://github.com/sofastack/sofa-registry](https://github.com/sofastack/sofa-registry)*

**3. 国奇** 提问：

>你好，发现一个问题，比如 A 应用 1.0 升级到 2.0 得改 webContextPath 才可以。也就是说要升级版本，要改版本号，还需要改 webContextPath 对吧？

A：按这里文章介绍的，不引入 web-ark-plugin 的话，就用不同的端口来部署多个 web 服务。你们可以保留这个使用方式，就不需要改 webContextPath，

*[https://github.com/WuHang1/sofa-ark/blob/code_analyse_multi_web_deploy/doc/CODE_ANALYSE_MULTI_WEB.md](https://github.com/WuHang1/sofa-ark/blob/code_analyse_multi_web_deploy/doc/CODE_ANALYSE_MULTI_WEB.md)*

>发布就会更改不同的端口号，否则端口号被占用。可不可以，我自己不用改端口号，也不用改 webContextPath？

A：目前不可以，你可以看下之前介绍 SOFAArk Web 插件的文档，里面介绍了必须要改这两个中的其中一个。如果有方案能做到这点那是挺好的，可以提个 proposal。

「SOFAArk」：*[https://github.com/sofastack/sofa-ark](https://github.com/sofastack/sofa-ark)*

### 本周推荐阅读

Go 原生插件使用问题全解析

[![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/11ae7e08c0794e5e9c48dc401f1e31a7~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247512138&idx=1&sn=851abb8d07d47f703e33978c9c125c59&chksm=faa35f90cdd4d6869c6cd4934c042484dbe1063c3fb85462d2f33e936b96240ae33d02d18c3a&scene=21)

SOFARegistry 源码｜数据同步模块解析

[![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cb9a7d6c9a874f599d6b09fc9ad811cd~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247511796&idx=1&sn=14045ed1b3e634061e719ef434816abf&chksm=faa3412ecdd4c83808c5945af56558fe157395b21bc0d56665e102edb92316c6f245f94d306c&scene=21)

社区文章｜MOSN 构建 Subset 优化思路分享

[![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5f482b93dca44eefa26becdf9e85584f~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247511573&idx=1&sn=86019e1570b797f0d4c7f4aa2bcf2ad3&chksm=faa341cfcdd4c8d9aea24212d29c31f2732ec88ee65271703d2caa96dabc114e873f975fec8f&scene=21)

Nydus —— 下一代容器镜像的探索实践

[![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0e85cbce8aa2498e916dcce8bdc07242~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247510940&idx=1&sn=b545e0836a6182abddd13a05b2f90ba9&chksm=faa34446cdd4cd50a461f071cdc4d871bd6eeef2318a2ec73968c117b41740a56a296c726aee&scene=21)

欢迎关注：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0d2aa8e86858404d948c9215feba37a3~tplv-k3u1fbpfcp-zoom-1.image)
