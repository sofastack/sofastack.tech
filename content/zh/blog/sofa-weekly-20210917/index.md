---
title: "SOFA Weekly | SOFAJRaft 发布新版本，QA 整理"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | sofa-common-tools 发布新版本，QA 整理"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2021-09-17T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*_ewiQbuzeOQAAAAAAAAAAAAAARQnAQ"
---
SOFA WEEKLY | 每周精选，筛选每周精华问答

同步开源进展，欢迎留言互动

> ![weekly.jpg](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ)

SOFAStack（Scalable Open Financial Architecture Stack)是蚂蚁金服自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

SOFAStack 官网: [https://www.sofastack.tech](https://www.sofastack.tech/)

SOFAStack: [https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动

我们会筛选重点问题通过

" SOFA WEEKLY " 的形式回复

**1、@证道者** 提问：

> 今天看了文章，好像蚂蚁 MOSN 结合 envoy，性能更好，不知道有没有开源这个？

A：有开源，有个镜像可以玩。

[https://mp.weixin.qq.com/s/ioewVcwiB5QA8w3A3gaikg](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247490185&idx=1&sn=cfc301e20a1ae5d0754fab3f05ea094a&scene=21#wechat_redirect)，

今年 GopherChina 的文字版, 可以了解下。我们内部已经落地，线上跑飞起来了，适合不同的场景了。目前我们用在南北和网关，比较大规模的场景。这个目前也在跟 envoy 官方共建合作，还有场景就是本来就是 envoy 的用户，也可以更简单的写扩展。

**2、@朱仕智** 提问：

> 请问这个限流在开源版本 MOSN 里面吗？

A：在开源，内部的做了一些业务相关的扩展。

**3、@Glennxu** 提问：

**请问下现在统一限流中心能使用么？**

> ![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*NZczR6FTwMAAAAAAAAAAAAAAARQnAQ)

A：现在开源版本还用不了集群限流，自适应限流的实现也和我们的有一些差异,后面我们会考虑移植到开源版本的。

**4、@朱仕智** 提问：

> 今天正好在看 kratos 里面限流的文章，那个限流就是自适应限流，这里提到统一限流中心，这个哪里能看到？

A：这个短期我们估计不会开源的，主要是这部分功能本身比较简单，而我们内部的规则和开源的模型也有所不同，加上现在我们跟自己的基础设施绑定了，不太方便直接开源。

**5、@魏小亮** 提问：

> 是不是简单理解为 MOSN 作为 cpp 的动态库，作为一个插件给 envoy 调用？

A：可以这么简单认为，对于一般用户的话就是用关心 MOSN 就行了，写 MOSN 的 filter，不需要了解底层机制。就像大家用 openresty，也很少去关心 nginx 和 luajit。

> 我以为要实现一个 envoy 的 filter 需要 c++ 代码来实现。

A：其实 lua 也可以， 比如用 go 你可以启动一个 zk，然后去调用 envoy 的 xds 做服务发现可以做的事情就很多了。

**6、@茄子** 提问：

请教一下，在使用 rheakv 的过程中出现这个问题要怎么排查?

> ![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*OLCrSbMK6XsAAAAAAAAAAAAAARQnAQ)

A：可以看下 bolt 怎么设置写入的高低水位线，这应该是触发了 netty 的 channel 写入水位线。

com.alipay.remoting.config.BoltGenericOption#NETTY_BUFFER_HIGH_WATER_MARK
com.alipay.remoting.config.BoltGenericOption#NETTY_BUFFER_LOW_WATER_MARK

刚才找了下，你看些这个类的 options。

> ![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*oHFPR7eiw78AAAAAAAAAAAAAARQnAQ)

com.alipay.sofa.jraft.rpc.impl.BoltRaftRpcFactory#CHANNEL_WRITE_BUF_LOW_WATER_MARK
com.alipay.sofa.jraft.rpc.impl.BoltRaftRpcFactory#CHANNEL_WRITE_BUF_HIGH_WATER_MARK

jraft 也开放了设置。

### 本周发布

**SOFABoot 开源发布 3.9.0 版本，**\主要更新如下\：

- SOFABoot 异常日志添加错误码；

- 去除 AbstractContractDefinitionParser 对 Autowire 注解的使用；

- 为 RPC 服务提供方添加开关，可以不注册到服务注册容器中；

- 添加健康检查进度；

- 去除 SOFARuntimeManager 对 Value 注解的使用；

- 优化 Spring 上下文并行启动的线程池配置。

**详细参考：**

[https://github.com/sofastack/sofa-boot/releases/tag/v3.9.0](https://github.com/sofastack/sofa-boot/releases/tag/v3.9.0)

**SOFARPC 发布 v5.7.10 版本代码，主要更新如下：

- SOFARPC 支持接口中静态方法的使用；

- 使用 TransmittableThreadLocal 解决 RpcInternalContext 中 ThreadLocal 值传递问题；

- 优化超时时间的获取与校；

- 反序列化过程中正确感知 header 变化；

- 修复 RpcInvokeContext 中线程安全问题；

- 修复 ProviderInfo 中 getAttr 类型转换问题。

**详细参考：**

[https://github.com/sofastack/sofa-rpc/releases/tag/v5.7.10](https://github.com/sofastack/sofa-rpc/releases/tag/v5.7.10)

### 本周推荐阅读

- [2021 年云原生技术发展现状及未来趋势](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247492248&idx=1&sn=c26d93b04b2ee8d06d8d495e114cb960&chksm=faa30d42cdd48454b4166a29efa6c0e775ff443f972bd74cc1eb057ed4f0878b2cb162b356bc&token=1414725197)

- [蚂蚁集团 SOFATracer 原理与实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247491935&idx=1&sn=75421dd34ec84d5889d7a4306f1c6a03&chksm=faa30e85cdd4879335726d670e94c5b360e53a1f3f74f41c66c0c6221d5e8459c35a653e94b6&token=1414725197)

- [KCL：声明式的云原生配置策略语言](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247491634&idx=1&sn=8359805abd97c598c058c6b5ad573d0d&chksm=faa30fe8cdd486fe421da66237bdacb11d83c956b087823808ddaaff52c1b1900c02dbf80c07&token=1414725197)

- [蚂蚁集团万级规模 K8s 集群 etcd 高可用建设之路](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247491409&idx=1&sn=d6c0722d55b772aedb6ed8e34979981d&chksm=faa0f08bcdd7799dabdb3b934e5068ff4e171cffb83621dc08b7c8ad768b8a5f2d8668a4f57e&token=1414725197)

更多文章请扫码关注“金融级分布式架构”公众号

> ![](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*5aK0RYuH9vgAAAAAAAAAAAAAARQnAQ)
