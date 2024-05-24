---
title: "SOFA Weekly | QA 整理"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly | QA 整理"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2021-06-18T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*Ig-jSIUZWx0AAAAAAAAAAAAAARQnAQ"
---
SOFA WEEKLY | 每周精选，筛选每周精华问答

同步开源进展，欢迎留言互动
![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*ARgKS6SuU7YAAAAAAAAAAAAAARQnAQ)
SOFAStack（Scalable Open Financial Architecture Stack)是蚂蚁金服自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

SOFAStack 官网: [https://www.sofastack.tech](https://www.sofastack.tech/)

SOFAStack: [https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动

我们会筛选重点问题

通过 " SOFA WEEKLY " 的形式回复

**1、@孙力** 提问：

> 请问和 MOSN 相关的健康检查有什么可行的方案吗？比如如何检查 MOSN 的健康状态，MOSN 检查业务容器健康，检查失败后有什么降级或动作？

A：MOSN 有获取运行状态的 API ，

[https://github.com/mosn/mosn/blob/master/pkg/admin/server/apis.go#L301](https://github.com/mosn/mosn/blob/master/pkg/admin/server/apis.go#L301)

检查业务容器健康通常来说需要自己扩展。

[https://github.com/mosn/mosn/blob/9a53d7239d8d5ca987410c15d791e780b5809558/pkg/upstream/healthcheck/factory.go#L53](https://github.com/mosn/mosn/blob/9a53d7239d8d5ca987410c15d791e780b5809558/pkg/upstream/healthcheck/factory.go#L53)

健康检查也有回调可以注册，可以实现自己的降级逻辑。

MOSN：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

**2、@许玉杰** 提问：

> AT 模式是怎么做到的空回滚、防悬挂和幂等的啊？

A：幂等是用户自己做的，防悬挂和空回滚有 undolog，AT 的幂等等于接口幂等，自己的接口保证即可。

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

**3、@jueming** 提问：

> Seata 支持 mybatis 的注解开发吗？目前用的 seata1.0 的版本，需要配置代理数据源，但是配置之后，影响了其他 sql 的执行，代理执行了 sql 的方法，打印了相关 sql 语句（数据库里有数据），但是得到的实体却为空。我把代理关闭以后则不影响 sql 的查询，这种情况应该怎么解决？

A：这里的问题是添加代理数据源的时候，使之前的 datasource 自动失效，没有读取 mybatis 的配置，解决方法是在设置新的 sqlsessionfactory 的时候，把需要配置的属性通过 ibatis 包下的 Configuration 注入进去。

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

### 本周推荐阅读

- [揭秘 AnolisOS 国密生态，想要看懂这一篇就够了](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247488577&idx=1&sn=172642c14cc511e27aa882ca7586a4c4&chksm=faa0fb9bcdd7728db0fdceec44b44bb93f36664cbb33e3c50e61fcc05dbc2647ff65dfcda3ee&scene=21)

- [蚂蚁云原生应用运行时的探索和实践 - ArchSummit 上海](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247488131&idx=1&sn=cd0b101c2db86b1d28e9f4fe07b0446e&chksm=faa0fd59cdd7744f14deeffd3939d386cff6cecdde512aa9ad00cef814c033355ac792001377&scene=21)

- [带你走进云原生技术：云原生开放运维体系探索和实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247488044&idx=1&sn=ef6300d4b451723aa5001cd3deb17fbc&chksm=faa0fdf6cdd774e03ccd9130099674720a81e7e109ecf810af147e08778c6582636769646490&scene=21)

- [稳定性大幅度提升：SOFARegistry v6 新特性介绍](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487799&idx=1&sn=3f2c120cd6d6e653e0d7c2805e2935ae&chksm=faa0feedcdd777fbebe262adc8ce044455e2056945460d06b5d3af3588dfd3403ca2a976fa37&scene=21)

更多文章请扫码关注“金融级分布式架构”公众号

> ![](https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*s3UzR6VeQ6cAAAAAAAAAAAAAARQnAQ)
>
