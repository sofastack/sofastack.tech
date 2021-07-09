---
title: "SOFA Weekly | QA 整理"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly | QA 整理"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2021-07-09T15:00:00+08:00
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

1、@xj 提问：

>Istio 官方的 tproxy 模式下对于 output 链还是需要 nat，目前我通过 mangle 表设置一个 remark，配合策略路由，让非 sidecar 进程发出的流量都通过 lO 发送到 prerouting 链，进而被 tproxy 到 sidecar 具体例子如下：

>iptables -t mangle -N DIVERTOUT

>iptables -t mangle -A OUTPUT -p TCP -m owner ! --uid-owner 0 -j DIVERTOUT

>iptables -t mangle -A DIVERTOUT -j MARK --set-mark 1

>iptables -t mangle -A DIVERTOUT -j ACCEPT

>ip rules：

>ip rule add fwmark 1 lookup 100

>ip route add local 0.0.0.0/0 dev lo table 100

>但是上面的例子有时候会拦截到 sidecar 进程的 output 流量，这个问题是什么原因?

A：和内核版本有关系的（主要就是区分 outbound 流量这块方案依赖内核 TCP 上的一些实现机制）。如果流量不大的可以直接使用 DNAT 方式。

MOSN：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

2、@Q 提问：

>为什么分支事务注册时, 全局事务状态不是 begin?

A：异常：Could not register branch into global session xid = status = Rollbacked（还有 Rollbacking、AsyncCommitting 等等二阶段状态）while expecting Begin ；

描述：分支事务注册时，全局事务状态需是一阶段状态 begin，非 begin 不允许注册。

属于 Seata 框架层面正常的处理，用户可以从自身业务层面解决。

出现场景：分支事务是异步，全局事务无法感知它的执行进度，全局事务已进入二阶段，该异步分支才来注册：

1、服务a rpc 服务 b 超时（ Dubbo、feign 等默认 1 秒超时），a 上抛异常给 tm，tm 通知 tc 回滚，但是 b 还是收到了请求（网络延迟或 RPC 框架重试），然后去 tc 注册时发现全局事务已在回滚；

2、tc 感知全局事务超时(@GlobalTransactional(timeoutMills = 默认 60 秒))，主动变更状态并通知各分支事务回滚，此时有新的分支事务来注册 。

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

3、@Q 提问：

>Seata 支持哪些 RPC 框架？

A：1. AT 模式支持 Dubbo、Spring Cloud、Motan、gRPC 和 sofa-RPC；

2. TCC 模式支持 Dubbo、Spring Cloud 和 sofa-RPC。

Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

### 本周推荐阅读

- [开启云原生 MOSN 新篇章 — 融合 Envoy 和 GoLang 生态](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247490185&idx=1&sn=cfc301e20a1ae5d0754fab3f05ea094a&chksm=faa0f553cdd77c450bf3c8e34cf3c27c3bbd89092ff30e6ae6b2631953c4886086172a37cb48&scene=21)

- [MOSN 多协议扩展开发实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247488899&idx=1&sn=5558ae0a0c23615b2770a13a39663bb3&chksm=faa0fa59cdd7734f35bea5491e364cb1d90a7b9c2c129502da0a765817602d228660b8fbba20&scene=21&token=1675156365&lang=zh_CN#wechat_redirect)

- [MOSN 子项目 Layotto：开启服务网格+应用运行时新篇章](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247488835&idx=1&sn=d645b9abc866048e679b56bfe3b72482&chksm=faa0fa99cdd7738ff1749ae75b1670f953c92b70dcf0358337977438fd74b632b21a7b17ece3&scene=21)

- [Protocol Extension Base On Wasm——协议扩展篇](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487546&idx=1&sn=72c3f1ede27ca4ace7988e11ca20d5f9&chksm=faa0ffe0cdd776f6d17323466b500acee50a371663f18da34d8e4cbe32304d7681cf58ff9b45&scene=21)

更多文章请扫码关注“金融级分布式架构”公众号

>![](https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*s3UzR6VeQ6cAAAAAAAAAAAAAARQnAQ)
