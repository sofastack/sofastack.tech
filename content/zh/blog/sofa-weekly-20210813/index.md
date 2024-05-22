---
title: "SOFA Weekly | SOFAStack & MOSN：新手任务计划，QA 整理"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly | SOFAStack & MOSN：新手任务计划，QA 整理"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2021-08-13T15:00:00+08:00
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

通过 " SOFA WEEKLY " 的形式回复

**1、@孙运盛** 提问：

> 我想咨询大家一个问题，假如二阶段提交或者回滚的方法里，再发生异常的话，应该如何处理呢？

A：这个异常后，重新捞取之前没结束的事务，重试就可以了吧，二阶段反正已经不阻塞其它一阶段的流程了。

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

**2、@胡希国** 提问：

> 我想请教一个问题，这里 New MOSN 收到 Old MOSN 传来的监听文件描述符之后，利用 filelistener 函数产生一个 listener 的作用是和 bind 一样么？就在 New MOSN 上开始监听了是吗？那这时候 Old MOSN 不也同时在监听么，这里的内部逻辑是什么样的？

A：跟 bind 不一样，这儿是同一个 fd，两个进程都监听，常规操作。你可以想象成 Nginx 的多个进程都可以监听一个 listen 一样。

MOSN：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

**3、@胡希国** 提问：

> MOSN 的 forkexec 是个怎么样的方式呢？它也和 Envoy 一样有一个独立的 python（envoy）进程来负责产生新的 MOSN 进程么？

A：MOSN 启动起来之后检查到有 socket 文件，然后和 Old MOSN 通信继承 fd，继承完了通知 Old MOSN 退出，所以你可以直接启动一个 MOSN 来。

MOSN：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

**4、@胡希国** 提问：

> 想请问下 MOSN 实现的过程为什么没有采用直接 fork 父进程的方式呢？

A：容器间升级是不能 fork 的。

MOSN：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

**5、@ch** 提问：

> 今天发生了一个 rollback status: TimeoutRollbacking 超时问题。
描述: Seata 提示 rollback status: TimeoutRollbacking。
出现原因：全局事务在执行 order 库和 account 库，因为 account 库被 IO 堵死 导致业务超时执行了 70s。
然后 Seata 就报 timeout 导致 order 库回滚了数据 account 没有回滚数据（account 已经被 IO 流撑死,无法读写数据）。
版本：client 1.3.0 server 1.3.0。

A：account 没有回滚诗句，tc 会重试。回滚事务，只要注册了的事务就一定能回滚，没注册的本地事务就会回滚，所以其实没有任何问题。

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

### SOFAStack & MOSN：新手任务计划

作为技术同学，你是否有过“想参与某个开源项目的开发，但是不知道从何下手“的感觉？

为了帮助大家更好的参与开源项目，SOFAStack 和 MOSN 社区会定期发布适合新手的新手开发任务，帮助大家 learning by doing！

Layotto 新手任务：

- 支持运行多个 Wasm 模块，以便让 Layotto 成为 FaaS 容器；

- 提供 Dockerfile，以便用户用 docker 部署 Layotto；

- 看懂 Wasm 模块的实现并为 Wasm 模块编写单元测试。

详见 ：

[https://github.com/mosn/layotto/issues/108#issuecomment-872779356](https://github.com/mosn/layotto/issues/108#issuecomment-872779356)

### 本周推荐阅读

- [蚂蚁集团 SOFATracer 原理与实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247491935&idx=1&sn=75421dd34ec84d5889d7a4306f1c6a03&chksm=faa30e85cdd4879335726d670e94c5b360e53a1f3f74f41c66c0c6221d5e8459c35a653e94b6&scene=21)

- [KCL：声明式的云原生配置策略语言](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247491634&idx=1&sn=8359805abd97c598c058c6b5ad573d0d&chksm=faa30fe8cdd486fe421da66237bdacb11d83c956b087823808ddaaff52c1b1900c02dbf80c07&scene=21)

- [蚂蚁集团万级规模 k8s 集群 etcd 高可用建设之路](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247491409&idx=1&sn=d6c0722d55b772aedb6ed8e34979981d&chksm=faa0f08bcdd7799dabdb3b934e5068ff4e171cffb83621dc08b7c8ad768b8a5f2d8668a4f57e&scene=21)

- [我们做出了一个分布式注册中心](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247491198&idx=1&sn=a4607e6a8492e8749f31022ea9e22b80&chksm=faa0f1a4cdd778b214403e36fb4322f91f3d1ac47361bf752c596709f8453b8482f582fe7e2e&scene=21)

更多文章请扫码关注“金融级分布式架构”公众号

> ![](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*5aK0RYuH9vgAAAAAAAAAAAAAARQnAQ)
