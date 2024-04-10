---
title: "SOFA Weekly | QA 整理"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | QA 整理"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2021-02-26T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*Ig-jSIUZWx0AAAAAAAAAAAAAARQnAQ"
---

SOFA WEEKLY | 每周精选，筛选每周精华问答
同步开源进展，欢迎留言互动

![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*ARgKS6SuU7YAAAAAAAAAAAAAARQnAQ)

SOFAStack（Scalable Open Financial Architecture Stack）是蚂蚁金服自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

SOFAStack 官网: [https://www.sofastack.tech](https://www.sofastack.tech/)

SOFAStack: [https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动
我们会筛选重点问题
通过 " SOFA WEEKLY " 的形式回复

**@宓文明** 提问：

> 请教：大家有没有遇到过 SOFAArk 工程这样的情况：双机房集群部署（检查模块 jar 大小相同、MD5 相同、部署时间相同），其中一台服务器中报错 NoClassDefFoundError（调用模块工具类的静态方法时，工具类找不到），其余的服务器都 OK。
>![](https://cdn.nlark.com/yuque/0/2021/png/12405317/1614323320115-d2f5a67b-c548-47c5-86df-c5a387c6a689.png)

A：你们登录到机器上去，堆栈是有的；这种问题可能是因为底层有 class 没找到，两个思路：
- 版本冲突 ，不一定局限在你的 JsonUtil 这个类，里面的类也有可能引发 。
- 通过 arthas ，分析下不同 bizClassLoader 加载 JsonUtil 的情况。

SOFAArk:[https://github.com/sofastack/sofa-ark](https://github.com/sofastack/sofa-ark)

**@郭强** 提问：

> MOSN 是如何保证一定是先于业务容器启动，并且保证是后于业务容器销毁呢？

A：启动就是按 pod 里的容器顺序启动，MOSN 容器在 APP 容器前。APP 容器内的应用进程启动前会检查 MOSN 的端口是否存活，得等到 MOSN 进程启动完成才能继续。销毁 pod 的时候没有特别处理，就是摘了 pod 的流量整个销毁。

MOSN:[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

**@郭强** 提问：

> APP 容器内的应用进程启动前会检查 MOSN 的端口是否存活。
> 这个是怎么做到的呢，是自动修改应用容器的 command 配置？还是说需要应用进程的 dockerfile 保证一定规范吗？

A：蚂蚁内部的 Kubernetes 有针对性的做一些定制改造支持，标准 k8s 目前是控制不了容器启动顺序的； 最好的方式还是 k8s 原生支持 sidecar lifecycle，没有这个的话，相对折中的方式就是在应用启动脚本前 check 下了。

MOSN:[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

**@饶文强** 提问：

> 请教一下：我不是很理解这一步锁撤销的步骤：线程 A 进入同步代码块方法，尝试获取偏向锁，此时若 CAS 线程 id 替换失败，为什么涉及一个偏向锁撤销，线程 A 不是没有获取到锁。我的理解是此时锁对象的偏向锁线程 id 不是线程 A 本身，为什么还需要偏向锁撤销？
>![](https://cdn.nlark.com/yuque/0/2021/png/12405317/1614323402397-fb5a94e5-d4a1-44fa-bfbd-418e30a1f600.png)

A：因为偏向锁可以被降级，其他的不可以，这个时候需要升级锁或降级锁；偏向锁持有者是不会做降级操作的，只有前来竞争锁的线程会去判断。

Seata:[https://github.com/seata/seata](https://github.com/seata/seata)

**@莹** 提问：

> 有个场景：tcc 模式，try 方法创建订单记录，插入到数据库，然后异常回滚，在 rollback 方法中把这个订单记录根据主键删除，请问数据库主键字段怎么传过去？

A：可以通过一阶段把 xid 对应业务信息存在 redis 中，二阶段通过 xid 拿出来使用。

Seata:[https://github.com/seata/seata](https://github.com/seata/seata)

**@敲跃** 提问：

> 问个问题：Seata 的 at 和 saga 模式 一阶段本地事务已提交，为了防止这部分数据被其他事务读到，文档给的解决方案 
>> 脏读 select 语句加 for update，代理方法增加 @GlobalLock+@Transactional 或 @GlobalTransaction ；
>>
> 实际操作的时候：涉及到本地事务的表的所有 sql 和方法都要这么改造，会不会成本太大，有没有其他好点的解决方案？

A：涉及到所有的写入口加上 @GlobalTransaction 即可；只读场景 @GlobalLock +for update 即可；读了就写场景一定要 @GlobalTransaction，只读了给前端展示之类的。

Seata:[https://github.com/seata/seata](https://github.com/seata/seata)

### 本周推荐阅读

- [Service Mesh 双十一后的探索和思考(上)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487314&idx=1&sn=55a6a84986290888e15719446365c986&chksm=faa0e088cdd7699e2a2a4594850699713cbd698531dba1f7309f755375232560f8f758230a85&scene=21)

- [Service Mesh 双十一后的探索和思考(下)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487357&idx=1&sn=f9a8d34452c4b777fe8094cddb17ad7e&chksm=faa0e0a7cdd769b1c767cf15ca736ceca6fb5626b0363db908f4ead7e814e275fecd3037a13e&scene=21)

- [蚂蚁 Service Mesh 大规模落地实践与展望](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487233&idx=1&sn=f2b4ff05edf64f3a32033d5b1013717d&chksm=faa0e0dbcdd769cd7cdf292e3c341012004a8963cc26547069a2b96dfd4a769423a95849cf2c&scene=21)

- [基于 MOSN 和 Istio Service Mesh 的服务治理实践](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247486618&idx=1&sn=d52c67fba7d4e47bb69af50b83eb29dd&chksm=faa0e340cdd76a56d2dbea3b054eea96ea74e73d625c0f5bf041bc7dd857ba21dcfd2a4042ab&scene=21)

