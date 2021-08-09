---
title: "SOFA Weekly | MOSN 发布新版本、QA 整理"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly | MOSN 发布新版本、QA 整理"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2021-08-06T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ"
---
SOFA WEEKLY | 每周精选，筛选每周精华问答

同步开源进展，欢迎留言互动
![weekly.jpg](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ)
SOFAStack（Scalable Open Financial Architecture Stack）是蚂蚁金服自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

SOFAStack 官网: [https://www.sofastack.tech](https://www.sofastack.tech/)

SOFAStack: [https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动

我们会筛选重点问题

通过"SOFA WEEKLY"的形式回复

1、@叶翔宇 提问：

>我有个需求，就是我们有自己的配置中心，我的配置加载不想用默认的文件配置，这里如果我要开发的话应该怎么样加会比较漂亮？

>![](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*TI7LSazQwB4AAAAAAAAAAAAAARQnAQ)

A：把 config.Load 重写成你自己的配置解析，configmanager.RegisterConfigLoadFunc。

MOSN：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

2、@飒 提问：

>一个方法先 insert 而后另一个方法 update 事物回滚失败怎么解决？

A：不会，可能你没有保证写函数被 @GlobalTransactional 注解覆盖或建表语句不是最新的导致了你回滚顺序变了。

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

3、@小蜗牛 提问：

>A 服务使用了 @GlobalTransactional（rollbackFor = Exception.class），调用了 B 服务，B 服务报错了，结果都提交成功，数据库数据也更新了，一般是什么原因？

A：应该是你被调用的服务，没有加入到全局事务中去（也就是说，被调用的服务没加上@GlobalTransactional）。

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

4、@冯仁彬 提问：

>被调用的服务也必须添加 @GlobalTransactional?

A：被调用的服务如果自身不会有任何地方访问自己身的写库方法，那么仅需集成 Seata，如果自身有，那么自身的写库操作全部要被带有 @GlobalTransactional 注解的地方调用，至于这个入库你自己设计。

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

### 本周发布

本周 MOSN 发布了 v0.24.0 版本。主要更新如下：

1.支持 jaeger tracing；

2. grpc 框架支持热升级；

3. 变量机制支持 interface 类型的变量；

4. 路由模块优化，支持端口匹配、支持变量模式；

5.负载均衡模块多处优化；

6.其他优化与 Bug Fix。

详细发布报告：
[https://github.com/mosn/mosn/releases/tag/v0.24.0](https://github.com/mosn/mosn/releases/tag/v0.24.0)

本月我们还认证了一位新的 Commiter，是来自京东的付建豪同学，感谢付建豪同学为 MOSN 社区做出的贡献。

### 本周推荐阅读

- [KCL：声明式的云原生配置策略语言](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247491634&idx=1&sn=8359805abd97c598c058c6b5ad573d0d&chksm=faa30fe8cdd486fe421da66237bdacb11d83c956b087823808ddaaff52c1b1900c02dbf80c07&scene=21)

- [蚂蚁集团万级规模 k8s 集群 etcd 高可用建设之路](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247491409&idx=1&sn=d6c0722d55b772aedb6ed8e34979981d&chksm=faa0f08bcdd7799dabdb3b934e5068ff4e171cffb83621dc08b7c8ad768b8a5f2d8668a4f57e&scene=21)

- [我们做出了一个分布式注册中心](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247491198&idx=1&sn=a4607e6a8492e8749f31022ea9e22b80&chksm=faa0f1a4cdd778b214403e36fb4322f91f3d1ac47361bf752c596709f8453b8482f582fe7e2e&scene=21)

- [积跬步至千里：QUIC 协议在蚂蚁集团落地之综述](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487717&idx=1&sn=ca9452cdc10989f61afbac2f012ed712&chksm=faa0ff3fcdd77629d8e5c8f6c42af3b4ea227ee3da3d5cdf297b970f51d18b8b1580aac786c3&scene=21)

更多文章请扫码关注“金融级分布式架构”公众号

>![](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*5aK0RYuH9vgAAAAAAAAAAAAAARQnAQ)
