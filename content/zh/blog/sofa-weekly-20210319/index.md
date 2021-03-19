---
title: "SOFA Weekly | QA 整理"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | QA 整理"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2021-03-19T15:00:00+08:00
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

>请教一下：JRaft 的 StateMachine 的 onApply 方法是线程安全的吗？如果在 onApply 里面有一些耗时操作的话，整个应用吞吐会下降很明显吧。

A：是，对于同一个 st，onApply 必须由 JRaft 的单线程去执行，因为 raft 算法本身需要保证 raft log 被顺序 apply，所以这里没有线程安全问题；把结果同步了就好了，计算别放里头。

SOFAJRaft：[https://github.com/sofastack/sofa-jraft](https://github.com/sofastack/sofa-jraft)

**2、@孙军超** 提问：

> 请教个问题：我现在直接跑 jraft-example 的 rheakv 的测试代码 PutExample，第一次调用 Rocksdb put 函数总会先阻塞整整 5 秒钟，server 端也没有任何报错。
>![]（https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*n0MIToHxoNgAAAAAAAAAAAAAARQnAQ)
A：猜测是 DefaultChannelId 里的 getProcessId() 太慢了，或者是 NetUtil 里获取 loopback 地址太慢，有一个办法可以证实：在 main 方法最开始提前 Class.forName 去加载这俩个类，应该会先卡住 5 秒，等到 rheakv 的逻辑执行时就不会卡住了；试一下我上面说的方法，猜测就是这两个类其中之一导致的：[https://stackoverflow.com/questions/33289695/inetaddress-getlocalhost-slow-to-run-30-seconds](https://stackoverflow.com/questions/33289695/inetaddress-getlocalhost-slow-to-run-30-seconds)； 配 etc/hosts 生效后可以解决。

SOFAJRaft：[https://github.com/sofastack/sofa-jraft](https://github.com/sofastack/sofa-jraft)

**3、@明惑** 提问：

>请教一下：状态机中 onApply 和 onSnapshot 的方式是线程安全的吗，我在这两个方法中操作同一个数据，会不会出现并发问题呢？

A：onSnapshot 会暂停其他线程；不会有影响，onApply 又是单线程执行的。

SOFAStack：[https://github.com/sofastack/sofastack.tech](https://github.com/sofastack/sofastack.tech)

**4、@胡志奇** 提问：

> Snapshot 的 save/load 方法都将阻塞状态机，应该尽力优化，避免阻塞。Snapshot 的保存如果可以做到增强备份更好。
onSnapshotSave 需要在保存后调用传入的参数 closure.run(status) 告知保存成功或者失败，推荐的实现类似：
> @Override
 >  public void onSnapshotSave(SnapshotWriter writer, Closure done) {
 >     // 同步获取状态机的当前镜像状态 state
 >     // 异步保存 state
 >    // 保存成功或者失败都通过 done.run(status) 通知到 jraft
 >  }
>官网上说的，异步保存也会阻塞？

A：没有问题，安全的；你截取的内容其实已经说得很清楚了，异步是指存储操作，同步是指获取当前状态机的镜像必须是同步操作；就是说：你必须在状态机被后续的 raft log 更改之前，拿到镜像，也就是拿镜像和 apply 是串行操作，一旦拿到镜像，你可以用异步的方式把镜像保存的磁盘上，甚至再压缩一下。

SOFAJRaft：[https://github.com/sofastack/sofa-jraft](https://github.com/sofastack/sofa-jraft)

**5、@闫文超** 提问：

> 问下大佬，SOFABoot 启动服务端暴露两个接口，但是 nacos 注册中心只注册了一个 RPC 端口，客户端调用接口报错

A：SOFARPC + NACOS 有实践案例：[https://www.sofastack.tech/projects/sofa-rpc/registry-nacos/](https://www.sofastack.tech/projects/sofa-rpc/registry-nacos/) 如果还是解决不了可以上传一个可以复现问题的 demo 工程到 GitHub。

SOFARPC：[https://github.com/sofastack/sofa-rpc](https://github.com/sofastack/sofa-rpc)

**6、@游侠** 提问：

> 请教一下：在 SOFAJRaft，Learner 这种复制器，怎么理解？表示这个节点，只读？

A：learner 不参与选举，可理解为冷备。

SOFAJRaft：[https://github.com/sofastack/sofa-jraft](https://github.com/sofastack/sofa-jraft)

### 本周推荐阅读

- [SOFAGW 网关：安全可信的跨域 RPC/消息 互通解决方案](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487444&idx=1&sn=1d55a7c68e105f305198eae65f587e2e&chksm=faa0e00ecdd76918b5cf4b5f4102347581de6c6f5154551d57dabfbfe16b45309f021e150a6f&scene=21)

- [可信原生负责人入选“2021年度全球青年领袖”名单](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487429&idx=1&sn=224bfffc83c539ff4e05e2b261abdc7f&chksm=faa0e01fcdd76909d34c27543f0c24786554f697351c83a38a2db41a5e4b3bab0ab51b82541b&scene=21)

- [Serverless 给任务调度带来的变化及蚂蚁集团落地实践](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487387&idx=1&sn=aa5611c20ac32f5f58e12488f1285824&chksm=faa0e041cdd769575a8f5921fed99968277be197544ccd9246e2f1a675b7a275b42e07ac61de&scene=21)

- [Service Mesh 双十一后的探索和思考(上)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487314&idx=1&sn=55a6a84986290888e15719446365c986&chksm=faa0e088cdd7699e2a2a4594850699713cbd698531dba1f7309f755375232560f8f758230a85&scene=21)
