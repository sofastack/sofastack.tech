---
title: "SOFAJRaft 选举机制剖析 | SOFAJRaft 实现原理"
author: "力鲲"
authorlink: "https://github.com/masaimu/"
description: "本文为《剖析 | SOFAJRaft 实现原理》第四篇，本篇作者力鲲，来自蚂蚁金服"
categories: "SOFAJRaft"
tags: ["SOFAJRaft","SOFALab","剖析 | SOFAJRaft 实现原理"]
date: 2019-07-10T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563870717229-9271da3d-8aba-4e9c-bd19-ca66636f9cdc.png"
---

> **SOFA**Stack
> **S**calable **O**pen **F**inancial **A**rchitecture Stack
> 是蚂蚁金服自主研发的金融级分布式架构，包含了构建金融级云原生架构所需的各个组件，是在金融场景里锤炼出来的最佳实践。

![SOFAJRaft 选举机制剖析](https://cdn.nlark.com/yuque/0/2019/png/226702/1562658853121-9d38757a-0c4d-4c6f-902e-5c8ac83cf5b0.png)

本文为《剖析 | SOFAJRaft 实现原理》第四篇，本篇作者力鲲，来自蚂蚁金服。《剖析 | SOFAJRaft 实现原理》系列由 SOFA 团队和源码爱好者们出品，项目代号：<SOFA:JRaftLab/>，目前领取已经完成，感谢大家的参与。

SOFAJRaft 是一个基于 Raft 一致性算法的生产级高性能 Java 实现，支持 MULTI-RAFT-GROUP，适用于高负载低延迟的场景。

SOFAJRaft ：[https://github.com/sofastack/sofa-jraft](https://github.com/sofastack/sofa-jraft)

## 前言

在 Raft 算法中，**选举**是很重要的一部分，所谓选举也就是在多个节点中选出一个 Leader 节点，由他来对外提供写服务 （以及默认情况下的读服务）。

在剖析源码时，对选举机制的理解经常会遇到两极分化的情况，对于了解 Raft 算法基本原理的同学，阅读源码就是品味实现之巧妙的过程，而对初体验的同学，却会陷入丈二和尚的窘境，仿佛坠入云里雾里。

为了提升文章的可读性，我还是希望花一部分篇幅讲清楚选举机制的基本原理，以便后面集中注意力于代码实现。下面是一段图文比喻，帮助理解的同时也让整篇文章不至于过早陷入细节的讨论。

## 问题1：选举要解决什么

一个分布式集群可以看成是由多条战船组成的一支舰队，各船之间通过旗语来保持信息交流。这样的一支舰队中，各船既不会互相完全隔离，但也没法像陆地上那样保持非常密切的联系，天气、海况、船距、船只战损情况导致船舰之间的联系存在但不可靠。

舰队作为一个统一的作战集群，需要有统一的共识、步调一致的命令，这些都要依赖于旗舰指挥。各舰船要服从于旗舰发出的指令，当旗舰不能继续工作后，需要有别的战舰接替旗舰的角色。

![所有船有责任随时准备接替旗舰](https://cdn.nlark.com/yuque/0/2019/png/307286/1562208003160-14473ea8-f451-4c07-97f2-d79927b4f6f7.png)

图1 - 所有船有责任随时准备接替旗舰

如何在舰队中，选出一艘得到大家认可的旗舰，这就是 SOFAJRaft 中选举要解决的问题。

## 问题2：何时可以发起选举

何时可以发起选举？换句话说，触发选举的标准是什么？这个标准必须对所有战舰一致，这样就能够在标准得到满足时，所有舰船公平的参与竞选。在 SOFAJRaft 中，触发标准就是**通信超时**，当旗舰在规定的一段时间内没有与 Follower 舰船进行通信时，Follower 就可以认为旗舰已经不能正常担任旗舰的职责，则 Follower 可以去尝试接替旗舰的角色。这段通信超时被称为 Election Timeout （简称 **ET**）， Follower 接替旗舰的尝试也就是发起选举请求。

![ET 触发其他船竞选旗舰](https://cdn.nlark.com/yuque/0/2019/png/307286/1562208365997-2a3ffecc-f89c-4cb5-8fe0-ce0bc3153924.png)

图2 - ET 触发其他船竞选旗舰

## 问题3：何时真正发起选举

在选举中，只有当舰队中超过一半的船都同意，发起选举的船才能够成为旗舰，否则就只能开始一轮新的选举。所以如果 Follower 采取尽快发起选举的策略，试图尽早为舰队选出可用的旗舰，就可能引发一个潜在的风险：可能多艘船几乎同时发起选举，结果其中任何一支船都没能获得超过半数选票，导致这一轮选举无果，然后失败的 Follower 们再一次几乎同时发起选举，又一次失败，再选举 again，再失败 again ···

![同时发起选举，选票被瓜分](https://cdn.nlark.com/yuque/0/2019/png/307286/1562208741307-c0338d75-0d8c-476d-84a0-7d2ca17ff169.png)

图3 - 同时发起选举，选票被瓜分

为避免这种情况，我们采用随机的选举触发时间，当 Follower 发现旗舰失联之后，会选择等待一段随机的时间 Random(0, ET) ，如果等待期间没有选出旗舰，则 Follower 再发起选举。

![随机等待时间](https://cdn.nlark.com/yuque/0/2019/png/307286/1562208798537-4a1dfb79-32fe-4d0a-98fe-cc4aa0881012.png)

图4 - 随机等待时间

## 问题4：哪些候选者值得选票

SOFAJRaft 的选举中包含了对两个属性的判断：LogIndex 和 Term，这是整个选举算法的核心部分，也是容易让人产生困惑的地方，因此我们做一下解释：

1. Term：我们会对舰队中旗舰的历史进行编号，比如舰队的第1任旗舰、第2任旗舰，这个数字我们就用 Term 来表示。由于舰队中同时最多只能有一艘舰船担任旗舰，所以每一个 Term 只归属于一艘舰船，显然 Term 是单调递增的。
2.  LogIndex：每任旗舰在职期间都会发布一些指令（称其为“旗舰令”，类比“总统令”），这些旗舰令当然也是要编号归档的，这个编号我们用 Term 和 LogIndex 两个维度来标识，表示“第 Term 任旗舰发布的第 LogIndex 号旗舰令”。不同于现实中的总统令，我们的旗舰令中的 LogIndex 是一直递增的，不会因为旗舰的更迭而从头开始计算。

![总统令 Vs 旗舰令，LogIndex 稍有区别](https://cdn.nlark.com/yuque/0/2019/png/307286/1562209301850-6c00ed4e-8d27-44f1-b6c7-c76cab5a1c63.png)

图5 - 总统令 Vs 旗舰令，LogIndex 稍有区别

所有的舰船都尽可能保存了过去从旗舰接收到的旗舰令，所以我们选举的标准就是哪艘船保存了最完整的旗舰令，那他就最有资格接任旗舰。具体来说，参与投票的船 V 不会对下面两种候选者 C 投票：一种是 lastTermC < lastTermV；另一种是 (lastTermV == lastTermC) && (lastLogIndexV > lastLogIndexC)。

稍作解释，第一种情况说明候选者 C 最后一次通信过的旗舰已经不是最新的旗舰了，至少比 V 更滞后，所以它所知道的旗舰令也不可能比 V 更完整。第二种情况说明，虽然 C 和 V 都与同一个旗舰有过通信，但是候选者 C 从旗舰处获得的旗舰令不如 V 完整 (lastLogIndexV > lastLogIndexC)，所以 V 不会投票给它。

![Follower 船 b 拒绝了船 c 而投票给船 a，船 a 旗舰令有一个空白框表示“第 Term 任旗舰”没有发布过任何旗舰令](https://cdn.nlark.com/yuque/0/2019/png/307286/1562209931268-c9f2efb4-c03e-43df-bb34-4a889f78854b.png)

图6 - Follower 船 b 拒绝了船 c 而投票给船 a，船 a 旗舰令有一个空白框表示“第 Term 任旗舰”没有发布过任何旗舰令

## 问题5：如何避免不够格的候选者“捣乱”

如上一小节所说，SOFAJRaft 将 LogIndex 和 Term 作为选举的评选标准，所以当一艘船发起选举之前，会自增 Term 然后填到选举请求里发给其他船只 （可能是一段很复杂的旗语），表示自己竞选“第 Term + 1 任”旗舰。<br />这里要先说明一个机制，它被用来保证各船只的 Term 同步递增：当参与投票的 Follower 船收到这个投票请求后，如果发现自己的 Term 比投票请求里的小，就会自觉更新自己的 Term 向候选者看齐，这样能够很方便的将 Term 递增的信息同步到整个舰队中。

![Follower 船根据投票请求更新自己的 Term](https://cdn.nlark.com/yuque/0/2019/png/307286/1562210259544-45f855ba-7cec-4fad-84d9-a37f50592e34.png)

图7 - Follower 船根据投票请求更新自己的 Term

但是这种机制也带来一个麻烦，如果一艘船因为自己的原因没有看到旗舰发出的旗语，他就会自以为是的试图竞选成为新的旗舰，虽然不断发起选举且一直未能当选（因为旗舰和其他船都正常通信），但是它却通过自己的投票请求实际抬升了全局的 Term，这在 SOFAJRaft 算法中会迫使旗舰 stepdown （从旗舰的位置上退下来）。

![自以为是的捣乱者，迫使旗舰 stepdown](https://cdn.nlark.com/yuque/0/2019/png/307286/1562210401142-33bcb5bc-b2c6-411e-b74a-b4fa480fc207.png)

图8 - 自以为是的捣乱者，迫使旗舰 stepdown

所以我们需要一种机制阻止这种“捣乱”，这就是预投票 (pre-vote) 环节。候选者在发起投票之前，先发起预投票，如果没有得到半数以上节点的反馈，则候选者就会识趣的放弃参选，也就不会抬升全局的 Term。

![Pre-vote 预投票](https://cdn.nlark.com/yuque/0/2019/png/307286/1562210503223-b1274b28-5910-4c80-be04-dfa94951cbbc.png)

图9 - Pre-vote 预投票

## 选举剖析

在上面的比喻中，我们可以看到整个选举操作的主线任务就是：

1. Candidate 被 ET 触发
1. Candidate 开始尝试发起 pre-vote 预投票
1. Follower 判断是否认可该 pre-vote request
1. Candidate 根据 pre-vote response 来决定是否发起 RequestVoteRequest
1. Follower 判断是否认可该 RequestVoteRequest
1. Candidate 根据 response 来判断自己是否当选

这个过程可用下图表示：

![一次成功的选举](https://cdn.nlark.com/yuque/0/2019/png/307286/1562210693889-3f06c78d-0253-4032-8e08-e607afe70d3b.png)

图10 - 一次成功的选举

在代码层面，主要是由四个方法来处理这个流程：

```java
com.alipay.sofa.jraft.core.NodeImpl#preVote //预投票
com.alipay.sofa.jraft.core.NodeImpl#electSelf //投票
com.alipay.sofa.jraft.core.NodeImpl#handlePreVoteRequest //处理预投票请求
com.alipay.sofa.jraft.core.NodeImpl#handleRequestVoteRequest //处理投票请求
```

代码逻辑比较直观，所以我们用流程图来简述各个方法中的处理。

### 预投票和投票

![预投票 Vs 投票](https://cdn.nlark.com/yuque/0/2019/png/307286/1562655721001-b95d230a-1ff5-456b-b617-2e558eedf8e0.png)

图11 - 预投票 Vs 投票

图中可见，预投票请求 preVote 和投票请求 electSelf 的流程基本类似，只是有几个细节不太一样：

1. preVote 是由超时触发；
1. preVote 在组装 Request 的时候将 term 赋值为 currTerm + 1，而 electSelf 是先将 term ++；
1. preVote 成功后，进入 electSelf，electSelf 成功后 become Leader。

### 处理请求

处理预投票和投票请求的逻辑也比较类似，同样用图来表示。

![处理预投票请求](https://cdn.nlark.com/yuque/0/2019/png/307286/1562211497886-403e6492-dd0c-4319-a1ca-3e24a068a99f.png)

图12 - 处理预投票请求

![处理投票请求](https://cdn.nlark.com/yuque/0/2019/png/307286/1562656678570-8436d3d5-c175-469d-bb7a-ebe620c5e266.png)

图13 - 处理投票请求

图中可见，处理两种请求的流程也基本类似，只是处理投票请求的时候，会有 stepdown 机制，强制使 Leader 从其 Leader 的身份退到 Follower。在具体的实现中，Leader 会通过租约的机制来避免一些没有必要的 stepdown，关于租约机制，可以参见之前的系列文章《[SOFAJRaft 线性一致读实现剖析 | SOFAJRaft 实现原理](https://www.sofastack.tech/blog/sofa-jraft-linear-consistent-read-implementation/)》。

## 总结

我们在本文中采用了类比的方式来剖析源码，主要是为了让读者能更容易的理解如何在分布式环境中达成共识，其实这也是整个 SOFAJRaft 要实现的目标。

行文至此，作者感觉已经把选举说清楚了，如果还有没提到的地方，或者一些流程中的分支任务，欢迎从源码中进一步寻找答案。最后贴出上面提到的四个方法的源码。

![preVote 预投票](https://cdn.nlark.com/yuque/0/2019/png/307286/1562212402738-e062fcdc-07e8-4ac2-8ba3-4e0d6f58dd1f.png)

图14 - preVote 预投票

![electSelf 投票](https://cdn.nlark.com/yuque/0/2019/png/307286/1562212423509-ff81c4a1-cac5-4d12-bfb4-15fb8a4f8f94.png)

图15 - electSelf 投票

![handlePreVoteRequest 处理预投票](https://cdn.nlark.com/yuque/0/2019/png/307286/1562212448502-504e1c1d-b5bb-4d70-a0a9-2a26a42c9353.png)

图16 - handlePreVoteRequest 处理预投票

![handleRequestVoteRequest 处理投票](https://cdn.nlark.com/yuque/0/2019/png/307286/1562212463814-0dfc3228-55ce-4bcc-9161-db514845a1bb.png)

图17 - handleRequestVoteRequest 处理投票

## 《剖析 | SOFAJRaft 实现原理》系列文章回顾

- [SOFAJRaft 线性一致读实现剖析 | SOFAJRaft 实现原理](https://www.sofastack.tech/blog/sofa-jraft-linear-consistent-read-implementation/)
- [SOFAJRaft-RheaKV 是如何使用 Raft 的 | SOFAJRaft 实现原理](https://www.sofastack.tech/blog/sofa-jraft-rheakv/)
- [蚂蚁金服生产级 Raft 算法库 SOFAJRaft 存储模块剖析 | SOFAJRaft 实现原理](https://www.sofastack.tech/blog/sofa-jraft-algorithm-storage-module-deep-dive/)