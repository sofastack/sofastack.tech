---
title: "SOFA Weekly | Service Mesh 系列直播回顾、SOFARPC 剖析回顾"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | 每周精选，筛选每周精华问答，同步开源进展，欢迎留言互动。"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2020-05-29T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563524226806-e93607a3-1b77-4ca2-8c3c-0384ab966154.png"
---

**SOFA WEEKLY | 每周精选，筛选每周精华问答**

**同步开源进展，欢迎留言互动**

![weekly.jpg](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1562925824761-fc720f21-9622-437b-a783-0b0729eda119.jpeg)

SOFAStack（Scalable Open Financial Architecture Stack）是蚂蚁金服自主研发的金融级分布式架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

- **SOFAStack 官网:** [https://www.sofastack.tech](https://www.sofastack.tech/)
- **SOFAStack:** [https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动
我们会筛选重点问题通过 " SOFA WEEKLY " 的形式回复

**1、@钱德鹏** 提问：

> 官网的泛化调用 Demo 地址为[https://www.sofastack.tech/projects/sofa-rpc/generic-invoke](https://www.sofastack.tech/projects/sofa-rpc/generic-invoke%EF%BC%8C%E4%BB%A3%E7%A0%81%E5%A6%82%E4%B8%8B%EF%BC%9A)，代码如下：
> 这段代码里 consumerConfig 没有指定 directUrl，那么是如何获取服务地址的？自己测试时，如果不指定 directUrl，那么会报找不到服务的错误；如果指定 directUrl，可以正常调用。所以想问一下到底需不需要指定？

```java
ConsumerConfig consumerConfig = new ConsumerConfig()
.setInterfaceId("com.alipay.sofa.rpc.quickstart.HelloService")
.setGeneric(true);
GenericService testService = consumerConfig.refer();
String result = (String) testService.$invoke("sayHello", new String[] { "java.lang.String" },new Object[] { "1111" });
```

A：你这个跟是否跟泛化调用没关系。 RPC 调用肯定是要拿到对方的服务端地址的，这里要么走注册中心去做服务发现，要么走指定直连地址。

> 明白，我的意思是官网的 Demo 里面没指定 URL，那么他是怎么调用成功的？既然官网没有指定，为什么我不指定就调用不到？另外附加一个问题，如果说一定要指定地址，那么我指定成 SLB 地址，由 SLB 去分发，是否可行？

A：你说官网的 Demo 是哪个？

> [https://www.sofastack.tech/projects/sofa-rpc/generic-invoke](https://www.sofastack.tech/projects/sofa-rpc/generic-invoke)

A：这里应该是代码片段，不是完整 Demo。Example 可以参加 [https://github.com/sofastack/sofa-rpc/blob/master/example/src/test/java/com/alipay/sofa/rpc/invoke/generic/GenericClientMain.java](https://github.com/sofastack/sofa-rpc/blob/master/example/src/test/java/com/alipay/sofa/rpc/invoke/generic/GenericClientMain.java)
指定成 SLB 地址是可以的，不过是 slb 跟服务端是长连接，建立了就不断了，服务端负载不一定会均衡。

> 好的，是否可以认为如果像 Demo 里这样调用，就必须指定 directUrl？

A：对，使用 ZK 为注册中心的例子就是：
[https://github.com/sofastack/sofa-rpc/blob/master/example/src/test/java/com/alipay/sofa/rpc/zookeeper/start/ZookeeperBoltClientMain.java](https://github.com/sofastack/sofa-rpc/blob/master/example/src/test/java/com/alipay/sofa/rpc/zookeeper/start/ZookeeperBoltClientMain.java)

SOFARPC：[https://github.com/sofastack/sofa-rpc](https://github.com/sofastack/sofa-rpc)

**2、@王振** 提问：

> 请问，配置 Nacos，如果 Nacos 是集群部署的话，那 Seata 配置 Nacos 地址的时候是不是只需要填写 Nacos 集群地址就行了，不要三个都填的吧？

A：Nacos 集群不是填3个地址嘛？你自己做了前端负载？

> 用 Nginx 去做了，在 Nacos 之上加入了 Nginx 做了负载均衡，那在 Seata 配置上是不是只需要配置负载均衡的地址就可以了是吗？如果不做负载的话，那填三个地址是逗号隔开吗？

A：是的，跟直接使用 Nacos 集群写法一致，我们把这个属性透传给 Nacos。

> 是 ip:port,ip:port,ip:port 这种形式对吧？

A：是的。

> 另外，请问 Seata 对服务器有最低要求吗？

A：server 推荐 2C4G+ 吧，jvm 内存2G+。

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

### 本周推荐阅读

- [Apache SkyWalking 在 Service Mesh 中的可观察性应用](/blog/service-mesh-virtual-meetup1-skywalking-observability-applications/)
- [Service Mesh 高可用在企业级生产中的实践 | 线上直播回顾](/blog/service-mesh-virtual-meetup1-practice-in-enterprise-production/)
- [陌陌的 Service Mesh 探索与实践 - 直播回顾](/blog/momo-service-mesh-exploration-and-practice/)

### 剖析 SOFARPC 框架

- [【剖析 | SOFARPC 框架】系列之SOFARPC 序列化比较](/blog/sofa-rpc-serialization-comparison/)
- [【剖析 | SOFARPC 框架】系列之SOFARPC跨语言支持剖析](/blog/sofa-rpc-cross-language-support/)
- [【剖析 | SOFARPC 框架】系列之 SOFARPC 注解支持剖析](/blog/sofa-rpc-annotation-support/)
- [【剖析 | SOFARPC 框架】系列之 SOFARPC 路由实现剖析](/blog/sofa-rpc-routing-implementation/)
- [【剖析 | SOFARPC 框架】系列之 SOFARPC 优雅关闭剖析](/blog/sofa-rpc-graceful-exit/)
- [【剖析 | SOFARPC 框架】系列之 SOFARPC 数据透传剖析](/blog/sofa-rpc-data-transmission/)
- [【剖析 | SOFARPC 框架】系列之 SOFARPC 泛化调用实现剖析](/blog/sofa-rpc-generalized-call-implementation/)
- [【剖析 | SOFARPC 框架】系列之 SOFARPC 单机故障剔除剖析](/blog/sofa-rpc-single-machine-fault-culling/)
- [【剖析 | SOFARPC 框架】系列之 SOFARPC 线程模型剖析](/blog/sofa-rpc-threading-model/)
- [【剖析 | SOFARPC 框架】系列之 SOFARPC 同步异步实现剖析](/blog/sofa-rpc-synchronous-asynchronous-implementation/)
- [【剖析 | SOFARPC 框架】系列之连接管理与心跳剖析](h/blog/sofa-rpc-connection-management-heartbeat-analysis/)
- [【剖析 | SOFARPC 框架】系列之链路追踪剖析](/blog/sofa-rpc-link-tracking/)
- [【剖析 | SOFARPC 框架】系列之总体设计与扩展机制](/blog/sofa-rpc-framework-overall-extension/)
