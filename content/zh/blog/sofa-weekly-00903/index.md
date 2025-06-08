---
title: "SOFA Weekly | SOFAJRaft 发布新版本，QA 整理"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | sofa-common-tools 发布新版本，QA 整理"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2021-09-03T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*_ewiQbuzeOQAAAAAAAAAAAAAARQnAQ"
---
SOFA WEEKLY | 每周精选，筛选每周精华问答

同步开源进展，欢迎留言互动

SOFAStack（Scalable Open Financial Architecture Stack)是蚂蚁金服自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

SOFAStack 官网: [https://www.sofastack.tech](https://www.sofastack.tech/)

SOFAStack: [https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动

我们会筛选重点问题通过 

"SOFA WEEKLY" 的形式回复

**1、@黄润良** 提问：

> 在写 filter 扩展的时候，如何获取一些请求的信息？比如请求 ip 之类的。

A：***pkg/server/handler.go\***，这里面可以看到设置进去的。

>![](https://mmbiz.qpic.cn/mmbiz_jpg/nibOZpaQKw09kEd22ZjeedX2r4ktrj8EpjRWtNT7VDyss86vjqfJldfzSeJLbKPIJ1k79ObcfhIQmEzg3hvgwXA/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)<br/>
>![](https://mmbiz.qpic.cn/mmbiz_jpg/nibOZpaQKw09kEd22ZjeedX2r4ktrj8EpX1SCwvGiaAVy2M6jEZ8w7ibLtqfNficIahpE29s6I6WqYl08c0ibRNS9Hg/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

**2、@黄润良** 提问：

> 一些 filter 只能用于某些协议的，但从配置来看，filter 应该是对所有协议都生效的吧？那我在设计 filter 的是需要考虑协议的兼容性吗？

A：你配置的 listener 块里面有协议，就可以和 filter 对应上了。

如果你怕别人误用，可以简单处理绕过。比如 dubbofilter 就是 Dubbo 协议自有的，怕其他协议误配置了，可以在代码跳过。

>![](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

**3、@黄润良** 提问：

> 目前有方法可以控制 filter 的执行的先后顺序吗？

A：按照配置的顺序。

>![](https://mmbiz.qpic.cn/mmbiz_jpg/nibOZpaQKw09kEd22ZjeedX2r4ktrj8EpUXoRKSe3q1eyuI0Lt87Td9UVG0mNicd0u6BazrQMO39BOfbcG5vVxTQ/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

**4、@楼政浩** 提问：

> 往 raft 集群提交数据，都得通过 RPC 吗？
>
> **如果我的 raft 节点的 fsm 又输出了 log，我想往集群提交这个 log，可以通过什么接口？**

A：jraft 通过 raft log 将数据复制到你各个节点的 fsm，fsm 的输入数据全部来自 raft log，你说的 fsm 又输出了 log 如果我没理解错的话，就是说本质上 fsm log 的输入全部来自 raft log，那么你这个所谓 log 就存在你自己的 fsm 就行，本来就是每个节点都会有的，不要再提交。

**5、@陈华洋** 提问：

> SOFABoot 的模块化是怎么解决数据库链接的问题。
>
> **就是 SOFABoot 模块化之后，我把 mybatis 配置到了公共模块里面，然后其他模块父上下文指定为公共模块，但是其他模块内的 @Mapper 在项目启动的时候都扫描不到****。**

A：建议把所有数据库相关的操作都放同一个模块，封装成 dal 层。可以配一个配置,让一个 spring 上下文里的 bean 暴露出来、能给别的 Spring 上下文用。

**6、@Z** 提问：

> 请问在大数据量操作的时候，配置上有什么建议吗？

A：把 6000 多条数据的操作在一个本地事务中完成，合并成一个分支注册。

**7、@金箍** 提问：

> 请问全局事务提交成功或者失败之后，有回调方法可以用吗？

A：tm 有个 hook，其他没有。源码搜索***「transactionlHook」***有相关的文档。

**8、@仪式** 提问：

> 如果事务进行的过程中事务发起者（TM）宕机了，Seata 会怎么做故障处理呀。

A：超时回滚，如果 TM 是决议提交给了 TC，那么“是”提交，“否”就只能等待超时回滚。TC 里的定时任务来做超时回滚。

 **SOFAStack & MOSN：新手任务计划** 

作为技术同学，你是否有过“想参与某个开源项目的开发、但是不知道从何下手”的感觉？

为了帮助大家更好的参与开源项目，**SOFAStack** 和 **MOSN** 社区会定期发布适合新手的新手开发任务，帮助大家 learning by doing ！

 **SOFA-Boot**

设计实现一个新的配置项，用于判断 SOFA-Boot 是否由 IDE 启动。

[https://github.com/sofastack/sofa-boot/issues/861](https://github.com/sofastack/sofa-boot/issues/861)

 **Layotto**

减少 panic 风险，给所有创建新协程的代码加上 recover。
设计实现 actuator metrics API，用于统计、展示 metrics 指标 WASM 通过 State API 访问存储：

[https://github.com/mosn/layotto/issues/108#issuecomment-872779356](https://github.com/mosn/layotto/issues/108#issuecomment-872779356)
