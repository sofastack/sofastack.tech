---
title: "SOFA Weekly | SOFARPC 发布新版本，QA 整理"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly | SOFARPC 发布新版本，QA 整理"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2021-05-28T15:00:00+08:00
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

1、@非余 提问：

> 对于 Kata 我有些地方还是不太理解，我现在说说我的理解，麻烦你看对不 对，我的理解是 Kata 有两个缓存：
> 1. virtiofs 需要一个缓存。virtiofsd 和 guest 交互需要缓存做文件系统 buffer ，这个缓存的对应 qemu 的参数就是 memory-backend-file 。（这个缓存和 vhost-user 使用的 vring 是不是同一个？每一个 vm
> 有自己的缓存空间 ） 在 Kata 配置文件对应的是 default_memory。缓存策略是 virtio_fs_cache。
> 2. dax 缓存，对应的参数是 virtio_fs_cache_size，没有缓存策略控制。

A：1、是的；2、dax 的缓存控制是依靠 guest 的文件系统语义实现的。

SOFAStack：[https://github.com/sofastack](https://github.com/sofastack)

2、@张鹏科 提问：

> SofaReferenceBinding 这个注解有一个属性：serializeType，默认序列化协议使用的是
> Hessian2，我想替换成 protobuf，我看文档说这个目前不支持在注解中替换，只能以 xml 的方式。有点蒙，到底支持不支持？

A：支持。

SOFAStack：[https://github.com/sofastack](https://github.com/sofastack)

3、@jueming 提问：

> 请问一下 sofa-rpc 和 Dubbo 区别在哪呢，是不是可以无缝接入 mosn sidecar？

A: 核心差别目前主要是在协议上吧，协议的可扩展性双方都有，SOFARPC 的 Bolt 协议是基于最早 HSF 协议的一些痛点做了改良设计，整个协议的请求头是能包含更多信息，比如在 MOSN 里支持 Bolt 协议，整个请求在 MOSN 内只解析 header 就可以拿到足够信息做路由，header 的解析也是类似简单 kv 的方式，Dubbo 使用的协议在 Mosn 或者 Envoy 里需要做 Hessian 反序列化才能拿到足够的信息，性能损耗会稍微大一点，其他方面的扩展性上机制略有不同，但是都有比较强的扩展能力。

SOFARPC：[https://github.com/sofastack/sofa-rpc](https://github.com/sofastack/sofa-rpc)

4、@汪辉 提问

> Caused by:io.seata.core.exception.TmTransactionException:
> TransactionException[begin global request failed. xid=null,
> msg=Communications link failure. 请问这个 突然没有 xid 是什么情况？

A：因为是 begin 时的异常，所以没有 xid，begin 成功了才有 Communications link failure。

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)


5、@贾云森 提问

> 常见的就是并没有对 Select 语句进行 forupdate,如果你不开启 forupdate,Seata 默认是遇到并发性竞争锁并不会去尝试重试,导致拿不到 lock 当前事务进行回滚.不影响一致性,如果你想没 forupdate
也开启竞争锁 client.rm.lock.retryPolicyBranchRollbackOnConflict 设置为
false（有死锁风险）。 请问是参数开启会出现死锁风险，还是自己手动添加 forupdate ，也会出现死锁风险呢？

A：不加 for update，也会竞争锁。但是因为可能存在二阶段需要回滚的事务，所以 retryPolicyBranchRollbackOnConflict 为 true 的时候，优先会给需要回滚的事务进行回滚，所以需要放弃锁，这是 at 模式的一个缺陷。因为 at 就是 2 个锁，1 先获取数据库本地锁，2 获取全局，此事后如果获取全局锁后会释放本地锁，造成了死锁。所以 at 上出现 get global lock fail 是正常的，自己应该在业务上做好重试，当一个全局事务因为获取锁失败的时候，应该重新完整的发起，所谓的完整应该是从 globaltransational 的 tm 端重新发起。

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

### 本周推荐阅读

- [蚂蚁云原生应用运行时的探索和实践 - ArchSummit 上海](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247488131&idx=1&sn=cd0b101c2db86b1d28e9f4fe07b0446e&chksm=faa0fd59cdd7744f14deeffd3939d386cff6cecdde512aa9ad00cef814c033355ac792001377&scene=21)

- [带你走进云原生技术：云原生开放运维体系探索和实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247488044&idx=1&sn=ef6300d4b451723aa5001cd3deb17fbc&chksm=faa0fdf6cdd774e03ccd9130099674720a81e7e109ecf810af147e08778c6582636769646490&scene=21)

- [稳定性大幅度提升：SOFARegistry v6 新特性介绍](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487799&idx=1&sn=3f2c120cd6d6e653e0d7c2805e2935ae&chksm=faa0feedcdd777fbebe262adc8ce044455e2056945460d06b5d3af3588dfd3403ca2a976fa37&scene=21)

- [积跬步至千里：QUIC 协议在蚂蚁集团落地之综述](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487717&idx=1&sn=ca9452cdc10989f61afbac2f012ed712&chksm=faa0ff3fcdd77629d8e5c8f6c42af3b4ea227ee3da3d5cdf297b970f51d18b8b1580aac786c3&scene=21)

### 本周发布

**本周 sofa-rpc 发布 v5.7.8 版本代码。主要更新如下：**

1. 支持 Dubbo service version 设置
2. 修复 tracer 采样标志位无法正确透传的问题
3. 修复重试逻辑中丢失最初异常的问题

详细参考：
[https://github.com/sofastack/sofa-rpc/releases/tag/v5.7.8](https://github.com/sofastack/sofa-rpc/releases/tag/v5.7.8)


