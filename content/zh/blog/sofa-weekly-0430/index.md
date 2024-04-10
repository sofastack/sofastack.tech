---
title: "SOFA Weekly |QA 整理"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY |QA 整理"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2021-04-30T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*Ig-jSIUZWx0AAAAAAAAAAAAAARQnAQ"
---
SOFA WEEKLY | 每周精选，筛选每周精华问答
同步开源进展，欢迎留言互动
![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*ARgKS6SuU7YAAAAAAAAAAAAAARQnAQ)
SOFAStack（Scalable Open Financial Architecture Stack）是蚂蚁金服自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

SOFAStack 官网: [https://www.sofastack.tech](https://www.sofastack.tech/)
SOFAStack: [https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动
我们会筛选重点问题
通过 " SOFA WEEKLY " 的形式回复

**1、@李明** 提问：

> 请教一下： SOFATracer 用 3.1.0 版本对应 SOFABoot，应该使用 3.1. 版本吗？<br />
>![](https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*ulnNQaI9e5IAAAAAAAAAAAAAARQnAQ)

A：都可以，不依赖 SOFABoot 版本。<br />
SOFATracer：[https://github.com/sofastack/sofa-tracer](https://github.com/sofastack/sofa-tracer)<br />

**2、@黄海淇** 提问：

> 有没有 SOFABoot 从零开始的文档哇？这家公司用的 SOFA 相关的组件做的银行项目。<br />

A：[https://www.sofastack.tech/projects/sofa-boot/overview/](https://www.sofastack.tech/projects/sofa-boot/overview/)  ，在我们社区各个项目的主页介绍里面都是有文档的。<br />
SOFABoot：[https://github.com/sofastack/sofa-boot](https://github.com/sofastack/sofa-boot)<br />

**3、@陈承邦** 提问：

> undo_log 日志当时回滚删除，还是过一段时间批量删除？
>![](https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*60ryRJCVayoAAAAAAAAAAAAAARQnAQ)

A：回滚删除，status 为 1 的 7 天删除。<br />
Seata：[https://github.com/seata/seata](https://github.com/seata/seata)<br />

**4、@贾云森** 提问：

> @GlobalTransactional  这个注解下的，不同 Service 的数据库操作，都要加本地事务吗？<br />

A：AT 模式下不需要。<br />
Seata：[https://github.com/seata/seata](https://github.com/seata/seata)<br />

**5、@天成** 提问：

> 问下：生产跟预发感觉也得搭建 2 个 seata-server，不能共用一个对吧？<br />
>![](https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*xnrlSZ3GlOQAAAAAAAAAAAAAARQnAQ)

A：可以共用一个，因为锁需要共享才能排他；也可以分开，但是要用表共享，具体看官网事务分组。<br />
Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

### 本周推荐阅读

- [积跬步至千里：QUIC 协议在蚂蚁集团落地之综述](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487717&idx=1&sn=ca9452cdc10989f61afbac2f012ed712&chksm=faa0ff3fcdd77629d8e5c8f6c42af3b4ea227ee3da3d5cdf297b970f51d18b8b1580aac786c3&scene=21)

- [开发 Wasm 协议插件指南](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487618&idx=1&sn=c5018dc2ddf1671d3fa632358ed6be90&chksm=faa0ff58cdd7764e61940713ac7f16b149b917662e54ea7b2590a701e7ca2d7dea50a3babf1c)

- [Protocol Extension Base On Wasm——协议扩展篇](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487546&idx=1&sn=72c3f1ede27ca4ace7988e11ca20d5f9&chksm=faa0ffe0cdd776f6d17323466b500acee50a371663f18da34d8e4cbe32304d7681cf58ff9b45&scene=21)

- [WebAssembly 在 MOSN 中的实践 - 基础框架篇](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487508&idx=1&sn=4b725ef4d19372f1711c2eb066611acf&chksm=faa0ffcecdd776d81c3d78dbfff588d12ef3ec3c5607036e3994fee3e215695279996c045dbc&scene=21)
