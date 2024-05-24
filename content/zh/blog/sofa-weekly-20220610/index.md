---
title: "SOFA Weekly | C 位大咖说、本周 QA、本周 Contributor"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly | C 位大咖说、本周 QA、本周 Contributor"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2022-06-10T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ"

---

SOFAStack（Scalable Open Financial Architecture Stack)是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

SOFAStack 官网: [https://www.sofastack.tech](https://www.sofastack.tech/)

SOFAStack: [https://github.com/sofastack](https://github.com/sofastack)

### SOFAStack 社区本周 Contributor

![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*izghQqcGhusAAAAAAAAAAAAAARQnAQ)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动，我们会筛选重点问题，通过 " SOFA WEEKLY " 的形式回复

1.@有时候 提问：

> SOFARPC 注册服务和订阅服务用到的 interface，Java 类文件内容是一样的，但如果包路径不是完全一样有问题么？

A：路径不一样就是不同接口，注册中心不感知到 method 这层。dataid 不一样的，[https://www.sofastack.tech/projects/sofa-rpc/rpc-config-xml-explain/](https://www.sofastack.tech/projects/sofa-rpc/rpc-config-xml-explain/) 。

「SOFARegistry」：[https://github.com/sofastack/sofa-registry](https://github.com/sofastack/sofa-registry)

2.@啥也不是 提问：

> 大佬们，在现有协议拓展框架下，在 choose host 以后根据节点信息动态选择上游的协议，实现起来感觉不是很方便，有大佬指点一下吗？

A：你是上下游协议不一样吗？

> 是的，而且同一个集群里面协议也可能不一样。我们自己的 RPC 协议存在多个版本，上下游的版本我们没办法控制，想着每个版本分别作为一种协议，利用框架能力，让协议版本的选择跟序列化解偶，每个 host 的版本是通过我们自己配置中心获取的。cluster 中 host 协议版本不受我们控制。

A：Upstream 的协议本来就是在 filter 里面转换，你在 choose host 之后进行 filter 设置就行了。这个是一个协议转换框架 filter，根据配置的协议转换，你可以复用这个，区别就是 upstream 的协议是动态指定的，但没有本质区别：[https://www.github.com/mosn/mosn/tree/master/pkg%2Ffilter%2Fstream%2Ftranscoder](https://www.github.com/mosn/mosn/tree/master/pkg%2Ffilter%2Fstream%2Ftranscoder)

「MOSN」[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

3.@曹飞 提问：

> 大佬，监控指标可以显示到应用维度吗？<br/>
![weekly2](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*GAOBTp1WtUoAAAAAAAAAAAAAARQnAQ)

A：Metric 可以自定义输出的。

「MOSN」：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

### SOFAStack&MOSN 新手任务计划

作为技术同学，你是否有过“想参与某个开源项目的开发、但是不知道从何下手”的感觉？

为了帮助大家更好的参与开源项目，SOFAStack 和 MOSN 社区会定期发布适合新手的新手开发任务，帮助大家 learning by doing!

Layotto

- Easy

为 actuator 模块添加单元测试

为 Java SDK 新增分布式锁、分布式自增 ID API

开发 in-memory configuration 组件

- Medium

让 Layotto 支持 Dapr API

开发 Rust、C、Python、SDK

用 mysql、consul 或 leaf 等系统实现分布式自增 ID API

- Hard

让 Layotto 支持通过接口调用的方式动态加载 Wasm，以支持 FaaS 场景动态调度

「详细参考」：[https://github.com/mosn/layotto/issues/108#issuecomment-872779356](https://github.com/mosn/layotto/issues/108#issuecomment-872779356)

SOFARPC

- Easy

优化 SOFARPC 使用文档

- Medium

优化 SOFARPC 的异步编程体验

「详细参考」：[https://github.com/sofastack/sofa-rpc/issues/1127](https://github.com/sofastack/sofa-rpc/issues/1127)

### 本周推荐阅读

- [蚂蚁集团获得 OpenInfra Superuser 2022 年度大奖！](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247510860&idx=1&sn=6b741ea8db4ccfaf30e4d793403b293c&chksm=faa34496cdd4cd805f826c0d6f61c496c539b84f1d16aa975b240a3998e5589c034651ca93fb&scene=21)

- [KusionStack 开源有感｜历时两年，打破“隔行如隔山”困境](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247510766&idx=1&sn=16d7ab76854829ee64211dd6b9f6915c&chksm=faa34534cdd4cc223422efda8872757cb2deb73d22fe1067e9153d4b4f28508481b85649e444&scene=21)

- [如何看待 Dapr、Layotto 这种多运行时架构？](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247510516&idx=1&sn=eff21915cd0ac1a8c8e3f126b549a605&chksm=faa3462ecdd4cf38ab6ab0c7201902fb53d54cea4865f9b7d7cdcdc7eaa00cf354d8b05e5393&scene=21)

- [GLCC 首届编程夏令营｜欢迎报名 Layotto、KusionStack、Nydus、Kata Containers！](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247510027&idx=1&sn=43a8f240d7edd036307d0f1fdd616714&chksm=faa347d1cdd4cec7adf7762963a94617060d96decba99beffb44d5f940e5a7f076b0844c4ab0&scene=21)

更多文章请扫码关注“金融级分布式架构”公众号

> ![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*8G5NRZ7UEToAAAAAAAAAAAAAARQnAQ)
