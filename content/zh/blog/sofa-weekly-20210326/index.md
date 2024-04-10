---
title: "SOFA Weekly | QA 整理"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | QA 整理"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2021-03-26T15:00:00+08:00
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

**1、@明惑** 提问：

> 使用 jraft 跨 IDC 搭建了集群，一旦读 follower 节点，有 13ms 的网络延迟，用了 lease read，读 leader 还好，直接返回。读 follower，要和 leader 通信，hreadb 有跨机房部署的场景吗？

A：ollower 节点提供读能力，属于额外赠送的能力，其实 readIndex 的实现必须要和 leader 现有一个通信，这个没办法；我们不开 follower 读，从 leader 读；etcd 的 read-index 也是一样的原理，都需要请求一次 leader，  zk 我了解貌似还不支持 follower 读；当然如果你不要求线性一致读，那么你绕开 raft 状态机，直接从你的存储里面读就好，如果你要的是最终一致性，那么你直接从 follower 节点上绕过 raft 直接读。</br>
A：核心就是：follower 节点必须知道 leader 此时的 applyIndex 到哪里，然后需要再等待自己状态机的 applyIndex 也到达这个位置了才能提供读，否则就有可能一个数据 leader 上有，follower 上没有，这就很明显违背了线性一致读，所以和 leader 的这一次通信必须有，不过数据包很小，通常应该很快。</br>
SOFAJRaft：[https://github.com/sofastack/sofa-jraft](https://github.com/sofastack/sofa-jraft)</br>
</br>
**2、@吴岳奇** 提问：

> 需求场景：AbstractRoutingDataSource 动态切换数据源，同一方法下，对两个不同服务器上数据表新增，涉及分布式事务。
问题: springboot 整合 Seata AT 模式 ，但无法动态代理数据源，一直代理的 yml 配置的默认的数据源。

A：多数据源关闭自动代理；bstractRoutingDataSource 内部的多个数据源手动代理后放进去。</br>
Seata：[https://github.com/seata/seata](https://github.com/seata/seata)</br>
</br>
**3、@彭勃** 提问：

> 我在启动 Seata server 的时候，日志里报告了这种找不到 zookeeper 相关节点的异常；KeeperErrorCode = NoNode for /seata/store.mode。

A：应该是用了 zk 当配置中心，但是又没有写配置进去。</br>
Seata：[https://github.com/seata/seata](https://github.com/seata/seata)</br>
</br>
### 本周推荐阅读

- [MOSN 的无人值守变更实践](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487479&idx=1&sn=e5972cbc1d8c04cff843380117158539&chksm=faa0e02dcdd7693b965e35014cfef4dc3be84e477e0c74694421658a2570162ad73883e7b054&scene=21)

- [SOFAGW 网关：安全可信的跨域 RPC/消息 互通解决方案](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487444&idx=1&sn=1d55a7c68e105f305198eae65f587e2e&chksm=faa0e00ecdd76918b5cf4b5f4102347581de6c6f5154551d57dabfbfe16b45309f021e150a6f&scene=21)

- [Serverless 给任务调度带来的变化及蚂蚁集团落地实践](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487387&idx=1&sn=aa5611c20ac32f5f58e12488f1285824&chksm=faa0e041cdd769575a8f5921fed99968277be197544ccd9246e2f1a675b7a275b42e07ac61de&scene=21)

- [Service Mesh 双十一后的探索和思考(上)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487314&idx=1&sn=55a6a84986290888e15719446365c986&chksm=faa0e088cdd7699e2a2a4594850699713cbd698531dba1f7309f755375232560f8f758230a85&scene=21)
