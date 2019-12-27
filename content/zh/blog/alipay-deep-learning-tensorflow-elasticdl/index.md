---
title: "ElasticDL：蚂蚁金服开源基于 TensorFlow 的弹性分布式深度学习系统"
author: "Oschina"
description: "业界首个基于 TensorFlow 实现弹性深度学习的开源系统 ElasticDL 项目的技术细节全面介绍。"
categories: "ElasticDL"
tags: ["ElasticDL"]
date: 2019-09-16T20:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1568628857282-feb91b30-12de-47c1-b8e8-79be8d66e731.png"
---

9 月 11 日，蚂蚁金服在2019谷歌开发者大会上海站上开源了 ElasticDL 项目，这是业界首个基于 TensorFlow 实现弹性深度学习的开源系统。

开源地址为：[https://github.com/sql-machine-learning/elasticdl/](https://github.com/sql-machine-learning/elasticdl/)

开源中国采访了 ElasticDL 项目负责人王益，对该深度学习系统的技术细节进行了全面介绍。

![019谷歌开发者大会上海站-王益](https://cdn.nlark.com/yuque/0/2019/png/226702/1568628377315-e172d617-981e-45c4-b17b-30ccfb092e7f.png)

## 基于 TensorFlow 2.0 和 Kubernetes实现弹性深度学习

这个基于 Eager Execution 模式的开源项目名为“ElasticDL”，它是一个Kubernetes 原生深度学习框架，根据介绍，ElasticDL 主要有四大特点：

- 容错性
- 弹性调度
- 易用性
- 高效

其中又以容错与弹性调度特性最具特色。

ElasticDL 实现了容错和弹性调度的分布式深度学习，可以极大提升集群的总体利用率，同时显著减少用户提交作业之后等待作业启动的时间（pending time）。

王益介绍：“ElasticDL 是我们知道的第一个基于 TensorFlow 实现弹性深度学习的开源系统。具体地说，ElasticDL 是基于 TensorFlow 2.0 和 Kubernetes 实现弹性深度学习的。”

### 集群效用从 1/N 到 N/N

在深度学习技术研发的早期，公用一个计算集群的人相对少， 计算作业之间的协调可以通过口头交流实现。开发者更关心缩短运行时间，也就是从作业启动到结束的这段时间。高性能计算技术（HPC）是解决这个问题的有效途径，比如 NVIDIA 的 cuBLAS 和 cuDNN 优化高性能数学计算、NCCL 优化 GPU 之间的通信效率。

随着深度学习技术的大规模应用，在许多工程师和研究员公用一个集群的情况下，通过商量来协调调度显然不可行，于是大家开始使用集群管理系统调度分布式作业。

Kubernetes 近年来已经逐渐成为集群管理的重要工具，目前已经在各大公有云中广泛采用。因此，让 TensorFlow 能更好地运行在 Kubernetes 集群上，同时提升利用集群进行深度学习的效率和资源利用率（效用），显得非常具有实际意义。

关于提升集群资源利用率，王益举了一个比较极端的例子：假设一个集群有 N 个 GPU，而一个任务只使用其中一个，现在有一个任务占用了一个 GPU。当没有弹性调度机制时，一个要求所有 N 个 GPU 的任务需要等待前一个任务结束才能开始，这个等待时间可能高达数天甚至数周，在等待期间，集群的效用是 1/N；而拥有弹性调度能力之后，新的任务可以在 N-1 个 GPU 上立即运行，并且 Kubernetes 可以在第一个任务完成后将占用的 GPU 赋予这个任务，这种情况下，集群整体效用是 100%。

ElasticDL 在容错与弹性调度上都有不错的表现，它的现实意义便是高效解决集群效用问题。

### ElasticDL 如何实现？

前边讲到集群资源利用率提高的前提其实就是ElasticDL 的“弹性调度”特性带来的，而弹性调度依赖于容错能力。

容错是指作业不受其中进程数量变化的影响，在弹性调度过程中，作业里的进程数量会随集群 workload 情况相应增减，所以作业必须是容错的，才能配合调度系统，实现弹性调度。

在这个过程中，容错通常由分布式框架实现，比如 Spark 和 ElasticDL 都可以做到当有进程挂掉，或者新的进程加入时，作业不会暂停或者重启，而是平滑地继续。而弹性调度是由分布式框架和分布式操作系统（集群管理系统）一起实现的。比如，当有进程挂掉的时候，分布式框架应该通知集群管理系统新启进程来补位 —— 至于集群管理系统能不能启动起来，取决于用户剩余 quota 和集群的忙碌情况。

#### 1. 基于 Kubernetes-native

通常使用 Keras 的 model-fit API 和 Estimator，开发者只需要调用 API 即可进行分布式训练或预测，然而 ElasticDL 不依赖于 TensorFlow runtime 实现分布式计算，它的实现在 runtime 之外。

ElasticDL 通过 Kubernetes-native 机制来完成分布式计算，而这也为其带来了容错性与弹性调度的能力。

所谓 Kubernetes-native指的是一个程序调用 Kubernetes API 来起止进程，它与 Google MapReduce 的机制类似。MapReduce 是一个 Borg-native 的分布式计算框架，用户通过运行一个 Borg 客户端程序启动一个 MapReduce 作业；Borg 客户端调用 Borg API 提交作业，并且启动一个 master 进程；这个 master 调用 Borg API 启动其它 workers 进程。

在 ElasticDL 中，用户调用 ElasticDL 的命令行客户端程序启动作业；这个客户端程序调用Kubernetes API 启动 master 进程，master进程继续调用 Kubernetes API 启动其它进程。

“ElasticDL 的整个容错和弹性调度机制都依赖于 Kubernetes-native 架构”，王益介绍：“如果 worker 挂了，按照分布式深度学习训练算法的数学特性，可以不用处理，即可确保训练过程继续。如果一个 parameter server 进程挂了，master会选择一个 worker 进程，让它转换角色替补上挂掉的parameter server 进程。”

在这两种情况下，master 都会调用 Kubernetes API，请它再启动一个额外的 worker 进程。如果启动成功，master 会带其加入到与其它进程的协作中。master 进程的状态（主要是三个 task queues：todo、doing与 done）可以保留在 Kubernetes 集群的 etcd 存储系统中。

“这样，万一 master 挂了，重启的 master 进程可以从 etcd 继承前世的状态。任何进程挂了，master 都会请 Kubernetes 去启动一个新的进程代替挂掉的进程。而 Kubernetes 是否能完成使命取决于用户剩余 quota 和集群剩余资源情况。”

#### 2. 基于 TensorFlow 2.0 EagerExecution

为什么 ElasticDL 又基于 TensorFlow 2.0 呢？王益介绍，这是因为 TensorFlow 2.0 带来了 Eager Execution 特性，正是针对这一特性的尝试，让开发团队实现了Kubernetes-native 的调度方式，从而让 ElasticDL 支持容错和弹性调度。

分布式学习需要了解每个进程根据局部训练数据计算得到的 gradients，才能汇总这些 gradients 来更新模型。

TensorFlow 1.x 的执行方式被称为 Graph Mode —— 深度学习计算步骤被表示成一个 graph 数据结构，TensorFlow runtime 会解释执行这个 graph。其中，gradients 的计算过程是 graph 的一部分，所以为了得到 gradients，分布式深度学习系统需要 hack 进入 graph 的执行过程“偷取”gradients。

这个做法需要用户写程序的时候写一些帮助“偷取”的代码，增加了程序的复杂度，也增加了对编程者的要求。

TensorFlow 2.0 提供的 Eager Execution Mode 中，通过一个叫 tape 的数据结构，它可以把获取 gradients 的能力以 API 的方式暴露给开发者，ElasticDL 正是以这样的方式将其实现。

通过这种对比，其实也反映了业界基于TensroFlow 进行分布式深度学习的不同设计思路。王益介绍，当前基于 TensorFlow 的分布式训练系统大致可以分为四类：

其中需要修改 TensorFlowruntime 的工作主要由 Google TensorFlow 团队完成。因为 TensorFlow runtime 是用 C++ 写的，把网络通信和同步功能实现在这个层次里，运行效率很高。而且，理论上 C++ 代码可以通过感知 TCP/IP 链接是否中断，来判断进程是否挂掉，从而实现容错。

“但是 TensorFlow runtime 应该是平台无关的，所以不应该包含访问特定集群管理系统，请它重启挂掉的进程的代码，所以不易实现弹性调度”，王益指出了二者的区别：“与之相对应的，通过调用 TensorFlow API 实现分布式计算的思路，通信性能往往受到 Python 语言性能以及不能在 runtime 内部实现‘微操作’的限制。但它的好处是可以自由调用集群管理系统 API 来管理进程。”

很明显，ElasticDL 通过 TensorFlow 2.0 带来的新特性实现了 TensorFlow runtime外直接调用集群管理 API 而完成了弹性调度。

## ElasticDL 替代 Kubeflow 的使用

Kubernetes 本来是一个用来管理无状态应用的容器平台，但是当前越来越多公司用它来运行各种各样的工作负载，特别是使用它来运行机器学习相关任务。

Kubeflow 基于 Kubernetes，它把模型训练、超参数训练与模型部署等机器学习任务类型进行组合并以容器化的方式部署，提供了整个机器学习流程各个系统的高可用与便捷性，使用 Kubeflow 就可以进行各种各样的机器学习任务。

目前 Kubeflow 是在 Kubernetes 上启动分布式 TenosrFlow 作业的主流操作，这可能也是开发者更为熟悉的模式。

“具体来讲，Kubeflow 会询问 Kubernetes 计划分配哪几台机器来运行一个分布式作业中的各个进程，随后告知每个进程所有其它进程的 IP 地址和 port，从而保证一个作业里各个进程之间互相知道对方。”

为什么需要让所有进程互相知道对方呢？这是TensorFlow ps-based distribution 方式要求的。（也就是前边提到的对比基于TensorFlow 的分布式训练系统表格中左上角的类型）

王益解释：“TenosrFlow 1.x原生的分布式训练功能让一个作业中所有进程都执行 TensorFlow 1.x runtime 程序。这些进程互相通信，互相协调成为一个‘分布式 runtime’来解释执行表示深度学习计算过程的 graph。在开始分布式训练之初，graph 被 TensorFlow runtime 拆解成若干子 graph；每个进程负责执行一个子 graph —— 任何一个进程失败 （可能是被更高优先级作业抢占），则整个大graph 的执行就失败了。所以 TensorFlow 原生的分布式训练能力不是容错的（fault-tolerant）。”

不过，TensorFlow PythonAPI 提供了 checkpoint 的能力：如果一个作业失败了，可以重启作业，从最近的 checkpoint 开始继续执行。所以它可以从错误中恢复（fault-recoverable）。

Kubeflow 可以在 Kubernetes 上发挥 TensorFlow 原生的分布式计算能力，但是因为后者并不能容错，所以Kubeflow 并不能无中生有。不能容错，也意味着不能弹性调度，而这正是 ElasticDL 的特长。

## 与 SQLFlow 联动

前边介绍了 ElasticDL 的实现机制与现实意义，总结起来主要是因为 ElasticDL 通过 TensorFlow 2.0 提供的新特性 Eager Execution 实现了 TensroFlow runtime 外直接调用集群管理 API，从而实现了 Kubernetes-native 机制来完成分布式计算，继而实现容错与弹性调度，最终达到极大提升集群总体利用率的目标。

除此之外，ElasticDL 还有一个重要的特性——易用性。ElasticDL 的易用性与另一个工具密不可分。

几个月前，蚂蚁金服开源了一个机器学习工具 SQLFlow，这个工具旨在让开发者调用 AI 像写 SQL 一样简单。据介绍，SQLFlow 能够抽象出端到端从数据到模型的研发过程，配合底层的引擎及自动优化，具备基础 SQL 知识的开发者即可完成大部分机器学习模型训练及预测任务。

通过与 SQLFlow 联动，开发者可以用扩展后的 SQL 语法，非常精炼地描述整个数据流和 AI 流程。SQLFlow 把一个 SQL 程序翻译成一个实现整个 end-to-end machine learning 的程序，这个程序可以调用xgboost、PyTorch，或者 ElasticDL、TensorFlow 实现训练任务。

王益举例，在有 SQLFlow 之前，如果要为一个电子商务网站构造一个推荐系统，需要开发日志收集、在线数据清洗、特征工程、模型训练、验证与预测等模块，每个模块可能需要投入一个团队数周甚至数月的时间。

而 SQLFlow 出现之后，这个流程可以用 SQL 语言描述成一个很简短的程序，SQLFlow 可以把它翻译成上述数据和 AI 流。

因为 SQL 是一种只描述意图，不描述过程的语言，所以 SQL 程序通常都很简短。但是也因为这个原因，SQL 程序里包含的信息量有限。比如，用户不会通过 SQL 指定分布式调度和训练算法。“这些部分需要 ElasticDL 根据模型特点自主决定”，王益补充：“这也是为什么说 ElasticDL 也可以反过来为 SQLFlow 提供易用性。”

SQLFlow 开源地址：[https://github.com/alipay/SQLFlow](https://github.com/alipay/SQLFlow)[](https://github.com/alipay/SQLFlow)

## ElasticDL 开源的下一步计划

关于开源后接下来的发展，王益表示，ElasticDL项目目前处于早期探索阶段，API 还在演化过程中。“此次开源的版本，尚不包括自动选择分布策略和算法的代码，相比在 TensorFlow runtime 中实现分布式计算，基于 TensorFlow2.0 Eager Mode 的 Python API 实现的分布式训练性能差距还很大”，他介绍：“ElasticDL 团队在和 Google Brain 团队合作，开发上述 asynchronous SGD +delayed model update 能力、以及 Kubernetes-native AllReduce，希望在下一个版本中可以提供给大家使用。”

随后王益又具体介绍，上述两种分布式训练策略，一种会用于模型中有较大的参数的情况，比如分布式 embedding table，另一种用于模型参数较小的情况。而这也是ElasticDL 自动决断分布式训练算法的一个例子。

另一方面，在 SQLFlow 中，如果要让用户能提供尽量少的参数，AI 引擎还需要更加智能，提供包括 AutoML 等功能。

王益感叹：“ElasticDL 项目任重道远。”

## 受访嘉宾

王益，目前在蚂蚁金服负责 AI 基础架构工作。他于 2007 年从清华大学计算机系博士毕业，先后在 Google（中国）、腾讯、LinkedIn（美国总部）与百度硅谷研究院工作，期间在硅谷和北京各有一次创业经历。参加工作以来，王益一直专注于 AI 基础架构工作，参与和领导了多个核心 AI 系统的研发。
