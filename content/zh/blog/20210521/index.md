---
title: "SOFA Weekly | SOFAJRaft 发布新版本，QA 整理"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | sofa-common-tools 发布新版本，QA 整理"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2021-05-17T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*Ig-jSIUZWx0AAAAAAAAAAAAAARQnAQ"
---
SOFA WEEKLY | 每周精选，筛选每周精华问答
同步开源进展，欢迎留言互动
![weekly.jpg](/Users/lihe/Desktop/weekly.png)
SOFAStack（Scalable Open Financial Architecture Stack)是蚂蚁金服自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

SOFAStack 官网: [https://www.sofastack.tech](https://www.sofastack.tech/)
SOFAStack: [https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动
我们会筛选重点问题
通过 " SOFA WEEKLY " 的形式回复

**@姚远** 提问：

>请问下 SOFAArk，master-biz 是个 Spring Boot 应用，A-biz 是个普通的Spring，一起打成一个 Executable-Ark 包。那么 Spring 相关的 Jar 是不是就要加载 2 次。
A：如果没有下沉插件的话，是会加载两次。

SOFAArk：[https://github.com/sofastack/sofa-ark](https://github.com/sofastack/sofa-ark)

**@colin** 提问：

> 内部服务之间的路由策略，是推荐用 service-mesh 来做吗？还是内部服务之间也用服务网关？
A：内部东西向流量推荐走 mesh ，一般来说网关更适合做南北向网络边界上的出入口。

MOSN：[https://github.com/mosn/mosn/](https://github.com/mosn/mosn/)

**@colin** 提问：

>这种场景，推荐用网关还是 service-mesh？目前我们是自己的内部网关来做的，网络不隔离，只是 jvm 进程隔离。
>![](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*iZ-6QaXysYUAAAAAAAAAAAAAARQnAQ)
A：如果逻辑上也不隔离，互相能够服务发现，互相信任不需要额外鉴权的话，可以认为是内部流量，走 mesh 比走集中式的网关更合适。如果逻辑隔离，那么走网关比较合理。

MOSN：[https://github.com/mosn/mosn/](https://github.com/mosn/mosn/)

**@骆伟康** 提问：

> 请问一下 这里我使用 dynamic 多数据源 结合 Seata 但是为啥只回滚了主库的数据 另外的库回滚失败？
A：看官网 FAQ，关闭 Seata 的自动代理，mp 的 dynamic 组件你开启他的 Seata 开关他自己会代理的。

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

**@贾云森** 提问：

> Could not commit JDBC transaction; 
>nested exception is io.seata.rm.datasource.exec.LockConflictException: get global lock fail, xid:192.168.3.239:8092:138223831620784128, lockKeys:outpat_medical:135231296034705408,135231296034705409,135231296034705410,135231296034705411,135231296034705412,135231296034705413)","code":85550,"data":null,"time":"2021-05-19 10:12:10"
想问一下为什么会发生这种异常啊？
A：正常输出，竞争锁没竞争到。

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

**@winyQ** 提问：

> 项目里 Seata 用 AT 模式，可以在项目里再集成 JTA 吗，两个并存有没有什么问题？
A：JTA 是 XA ，无法跟 AT 兼容。

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

### 本周推荐阅读

- [带你走进云原生技术：云原生开放运维体系探索和实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247488044&idx=1&sn=ef6300d4b451723aa5001cd3deb17fbc&chksm=faa0fdf6cdd774e03ccd9130099674720a81e7e109ecf810af147e08778c6582636769646490&scene=21)

- [稳定性大幅度提升：SOFARegistry v6 新特性介绍](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487799&idx=1&sn=3f2c120cd6d6e653e0d7c2805e2935ae&chksm=faa0feedcdd777fbebe262adc8ce044455e2056945460d06b5d3af3588dfd3403ca2a976fa37&scene=21)

- [金融级能力成核心竞争力，服务网格驱动企业创新](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487660&idx=1&sn=d5506969b7eb25efcbf52b45a864eada&chksm=faa0ff76cdd77660de430da730036022fff6d319244731aeee5d41d08e3a60c23af4ee6e9bb2&scene=21)

- [WebAssembly 在 MOSN 中的实践 - 基础框架篇](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487357&idx=1&sn=f9a8d34452c4b777fe8094cddb17ad7e&chksm=faa0e0a7cdd769b1c767cf15ca736ceca6fb5626b0363db908f4ead7e814e275fecd3037a13e&scene=21)

### 本周发布

**本周发布详情如下：**

**本周 SOFAJRaft 发布 1.3.7 版本，主要更新如下：**

- 1.修复 TCP 建连被 block 导致选主超时
- 2.升级 commons.io 到 2.8.0 以修复安全漏洞

    详细参考：<br />[https://github.com/sofastack/sofa-jraft/releases/tag/1.3.7](https://github.com/sofastack/sofa-jraft/releases/tag/1.3.7)
