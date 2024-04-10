---
title: "蚂蚁集团万级规模 K8s 集群 etcd 高可用建设之路"
author: ""
authorlink: "https://github.com/sofastack"
description: "蚂蚁集团万级规模 K8s 集群 etcd 高可用建设之路"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2021-07-26T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*PhN5Sp2T9NYAAAAAAAAAAAAAARQnAQ"
---

蚂蚁集团运维着可能是全球最大的 K8s 集群：K8s 官方以 5k node 作为 K8s 规模化的顶峰，而蚂蚁集团事实上运维着规模达到 10k node 规模的 K8s 集群。一个形象的比喻就是，如果官方以及跟着官方的 K8s 使用者能想象到的 K8s 的集群规模是泰山，那么蚂蚁集团在官方的解决方案之上已经实现了一个珠穆朗玛峰，引领了 K8s 规模化技术的提升。

这个量级的差异，不仅仅是量的差异，更是 K8s 管理维护的质的提升。能维护有如此巨大挑战巨量规模的 K8s 集群，其背后原因是蚂蚁集团付出了远大于 K8s 官方的优化努力。

所谓万丈高楼平地起，本文着重讨论下蚂蚁集团的在 K8s 的基石 --- etcd 层面做出的高可用建设工作：只有 etcd 这个基石稳当了，K8s 这栋高楼大厦才保持稳定性，有 tidb 大佬黄东旭朋友圈佐证【图片已获黄总授权】。

> ![](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*cbuiSovI2zYAAAAAAAAAAAAAARQnAQ)

### 面临的挑战

etcd 首先是 K8s 集群的 KV 数据库。
从数据库的角度来看，K8s 整体集群架构各个角色如下：

1. etcd 集群的数据库

2. kube-apiserver etcd 的 API 接口代理、数据缓存层

3. kubelet 数据的生产者和消费者

4. kube-controller-manager 数据的消费者和生产者

5. kube-scheduler 数据的消费者和生产者

etcd 本质是一个 KV 数据库，存储了 K8s 自身资源 、用户自定义的 CRD 以及 K8s 系统的 event 等数据。每种数据的一致性和数据安全性要求不一致，如 event 数据的安全性小于 K8s 自身的资源数据以及 CRD 数据。

K8s 的早期拥护者在推广 K8s 时，宣称其比 OpenStack 的优势之一是 K8s 没有使用消息队列，其延迟比 OpenStack 低。这其实是一个误解，无论是 etcd 提供的 watch 接口，还是 K8s client 包中的 informer 机制，无不表明 K8s 是把 etcd 当做了消息队列，K8s 消息的载体很多，譬如 K8s event。

从消息队列的角度来看，K8s 整体集群架构各个角色如下：

1. etcd 消息路由器

2. kube-apiserver etcd 生产者消息代理和消息广播【或者成为次级消息路由器、消费者代理】

3. kubelet 消息的生产者和消费者

4. kube-controller-manager 消息的消费者和生产者

5. kube-scheduler 消息的消费者和生产者

etcd 是推模式的消息队列。etcd 是 K8s 集群的 KV 数据库和消息路由器，充当了 OpenStack 集群中的 MySQL 和 MQ 两个角色，这样的实现貌似简化了集群的结构，但其实不然。在 large scale 规模 K8s 集群中，一般经验，首先都会使用一个单独 etcd 集群存储 event 数据：把 KV 数据和一部分 MQ 数据物理隔离开，实现了 KV 和 MQ 角色的部分分离。 如 参考文档 2 中提到美团 “针对 etcd 的运营，通过拆分出独立的 event 集群降低主库的压力”。

当 K8s 集群规模扩大时，etcd 承载着 KV 数据剧增、event 消息暴增以及消息写放大的三种压力。
为了证明所言非虚，特引用部分数据为佐证：

1. etcd KV 数据量级在 100 万以上；

2. etcd event 数据量在 10 万以上；

3. etcd 读流量压力峰值在 30 万 pqm 以上，其中读 event 在 10k qpm 以上；

4. etcd 写流量压力峰值在 20 万 pqm 以上，其中写 event 在 15k qpm 以上；

5. etcd CPU 经常性飙升到 900% 以上；

6. etcd 内存 RSS 在 60 GiB 以上；

7. etcd 磁盘使用量可达 100 GiB 以上；

8. etcd 自身的 goroutine 数量 9k 以上；

9. etcd 使用的用户态线程达 1.6k 以上；

10. etcd gc 单次耗时常态下可达 15ms。

使用 Go 语言实现的 etcd 管理这些数据非常吃力，无论是 CPU、内存、gc、goroutine 数量还是线程使用量，基本上都接近 go runtime 管理能力极限：经常在 CPU profile 中观测到 go runtime 和 gc 占用资源超过 50% 以上。

蚂蚁的 K8s 集群在经历高可用项目维护之前，当集群规模突破 7 千节点规模时，曾出现如下性能瓶颈问题：

1. etcd 出现大量的读写延迟，延迟甚至可达分钟级；

2. kube-apiserver 查询 pods / nodes / configmap / crd 延时很高，导致 etcd oom；

3. etcd list-all pods 时长可达 30 分钟以上；

4. 2020 年 etcd 集群曾因 list-all 压力被打垮导致的事故就达好几起；

5. 控制器无法及时感知数据变化，如出现 watch 数据延迟可达 30s 以上。

如果说这种状况下的 etcd 集群是在刀锋上跳舞， 此时的整个 K8s 集群就是一个活火山：稍不留神就有可能背个 P 级故障， 彼时的整个 K8s master 运维工作大概是整个蚂蚁集团最危险的工种之一。

### 高可用策略

实现一个分布式系统高可用能力的提升，大概有如下手段：

1. 提升自身稳定性与性能；

2. 精细管理上游流量；

3. 保证服务下游服务 SLO。

etcd 经过社区与各方使用者这么多年的锤炼，其自身的稳定性足够。蚂蚁人能做到的，无非是使出周扒皮的本事，提高集群资源整体利用率，scale out 和 scale up 两种技术手段双管齐下，尽可能的提升其性能。

etcd 自身作为 K8s 的基石，其并无下游服务。如果说有，那也是其自身所使用的物理 node 环境了。下面分别从 etcd 集群性能提升、请求流量管理等角度阐述我们在 etcd 层面所做出的高可用能力提升工作。

### 文件系统升级

在山窝里飞出金凤凰，诚非易事。让 etcd 跑的更快这件事，没有什么手段比提供一个高性能的机器更短平快地见效了。

#### 1.使用 NVMe ssd

etcd 自身 = etcd 程序 + 其运行环境。早期 etcd 服务器使用的磁盘是 SATA 盘，经过简单地测试发现 etcd 读磁盘速率非常慢，老板豪横地把机器鸟枪换炮 --- 升级到使用了 NVMe SSD 的 f53 规格的机器：etcd 使用 NVMe ssd 存储 boltdb 数据后，随机写速率可提升到 70 MiB/s 以上。

参考文档 2 中提到美团 “基于高配的 SSD 物理机器部署可以达到日常 5 倍的高流量访问”，可见提升硬件性能是大厂的首选，能折腾机器千万别浪费人力。

#### 2.使用 tmpfs

NVMe ssd 虽好，理论上其读写极限性能跟内存比还是差一个数量级。我们测试发现使用 tmpfs【未禁止 swap out】替换 NVMe ssd 后，etcd 在读写并发的情况下性能仍然能提升 20% 之多。考察 K8s 各种数据类型的特点后，考虑到 event 对数据的安全性要求不高但是对实时性要求较高的特点，我们毫不犹豫的把 event etcd 集群运行在了 tmpfs 文件系统之上，将 K8s 整体的性能提升了一个层次。

#### 3.磁盘文件系统

磁盘存储介质升级后，存储层面能够进一步做的事情就是研究磁盘的文件系统格式。目前 etcd 使用的底层文件系统是 ext4 格式，其 block size 使用的是默认的 4 KiB。我们团队曾对 etcd 进行单纯的在单纯写并行压测时发现，把文件系统升级为 xfs，且 block size 为 16 KiB【在测试的 KV size 总和 10 KiB 条件下】时，etcd 的写性能仍然有提升空间。

但在读写并发的情况下，磁盘本身的写队列几乎毫无压力，又由于 etcd 3.4 版本实现了并行缓存读，磁盘的读压力几乎为零，这就意味着：继续优化文件系统对 etcd 的性能提升空间几乎毫无帮助。自此以后单节点 etcd scale up 的关键就从磁盘转移到了内存：优化其内存索引读写速度。

#### 4.磁盘透明大页

在现代操作系统的内存管理中，有 huge page 和 transparent huge page 两种技术，不过一般用户采用 transparent huge page 实现内存 page 的动态管理。在 etcd 运行环境，关闭 transparent huge page 功能，否则 RT 以及 QPS 等经常性的监控指标会经常性的出现很多毛刺，导致性能不平稳。

### etcd 调参

MySQL 运维工程师常被人称为 “调参工程师”，另一个有名的 KV 数据库 RocksDB 也不遑多让，二者可调整的参数之多到了令人发指的地方：其关键就在于针对不同存储和运行环境需要使用不同的参数，才能充分利用硬件的性能。etcd 随不及之，但也不拉人后，预计以后其可调整参数也会越来越多。

etcd 自身也对外暴露了很多参数调整接口。除了阿里集团 K8s 团队曾经做出的把 freelist 由 list 改进为 map 组织形式优化外，目前常规的 etcd 可调整参数如下：

1. write batch

2. compaction

#### 1.write batch

像其他常规的 DB 一样，etcd 磁盘提交数据时也采用了定时批量提交、异步写盘的方式提升吞吐，并通过内存缓存的方式平衡其延时。具体的调整参数接口如下：

1. batch write number 批量写 KV 数目，默认值是 10k；

2. batch write interval 批量写事件间隔，默认值是 100 ms。

etcd batch 这两个默认值在大规模 K8s 集群下是不合适的，需要针对具体的运行环境调整之，避免导致内存使用 OOM。一般地规律是，集群 node 数目越多，这两个值就应该成比例减小。

#### 2.compaction

etcd 自身由于支持事务和消息通知，所以采用了 MVCC 机制保存了一个 key 的多版本数据，etcd 使用定时的 compaction 机制回收这些过时数据。etcd 对外提供的压缩任务参数如下：

1. compaction interval 压缩任务周期时长；

2. compaction sleep interval 单次压缩批次间隔时长，默认 10 ms；

3. compaction batch limit 单次压缩批次 KV 数目，默认 1000。

（1）压缩任务周期

K8s 集群的 etcd compaction 可以有两种途径进行 compaction：

1. etcd 另外提供了 comapct 命令和 API 接口，K8s kube-apiserver 基于这个 API 接口也对外提供了 compact 周期参数；

2. etcd 自身会周期性地执行 compaction；

3. etcd 对外提供了自身周期性 compaction 参数调整接口，这个参数的取值范围是 (0, 1 hour]；

4. 其意义是：etcd compaction 即只能打开不能关闭，如果设置的周期时长大于 1 hour，则 etcd 会截断为 1 hour。

蚂蚁 K8s 团队在经过测试和线下环境验证后，目前的压缩周期取值经验是：

1. 在 etcd 层面把 compaction 周期尽可能地拉长，如取值 1 hour，形同在 etcd 自身层面关闭 compaction，把 compaction interval 的精细调整权交给 K8s kube-apiserver；

2. 在 K8s kube-apiserver 层面，根据线上集群规模取值不同的 compaction interval。

之所以把 etcd compaction interval 精细调整权调整到 kube-apiserver 层面，是因为 etcd 是 KV 数据库，不方便经常性地启停进行测试，而 kube-apiserver 是 etcd 的缓存，其数据是弱状态数据，相对来说启停比较方便，方便调参。至于 compaction interval 的取值，一条经验是：集群 node 越多 compaction interval 取值可以适当调大。

compaction 本质是一次写动作，在大规模集群中频繁地执行 compaction 任务会影响集群读写任务的延时，集群规模越大，其延时影响越明显，在 kube-apiserver 请求耗时监控上表现就是有频繁出现地周期性的大毛刺。

更进一步，如果平台上运行的任务有很明显的波谷波峰特性，如每天的 8:30 am ~ 21:45 pm 是业务高峰期，其他时段是业务波峰期，那么可以这样执行 compaction 任务：

1. 在 etcd 层面设定 compaction 周期是 1 hour；

2. 在 kube-apiserver 层面设定 comapction 周期是 30 minutes；

3. 在 etcd 运维平台上启动一个周期性任务：当前时间段在业务波谷期，则启动一个 10 minutes 周
期的 compaction 任务。

其本质就是把 etcd compaction 任务交给 etcd 运维平台，当发生电商大促销等全天无波谷的特殊长周期时间段时，就可以在平台上紧急关闭 compaction 任务，把 compaction 任务对正常的读写请求影响降低到最低。

（2）单次压缩

即使是单次压缩任务，etcd 也是分批执行的。因为 etcd 使用的存储引擎 boltdb 的读写形式是多读一写：可以同时并行执行多个读任务，但是同时刻只能执行一个写任务。

为了防止单次 compaction 任务一直占用 boltdb 的读写锁，每次执行一批固定量【compaction batch limit】的磁盘 KV 压缩任务后，etcd 会释放读写锁 sleep 一段时间【compaction sleep interval】。

在 v3.5 之前，compaction sleep interval 固定为 10 ms，在 v3.5 之后 etcd 已经把这个参数开放出来方便大规模 K8s 集群进行调参。类似于 batch write 的 interval 和 number，单次 compaction 的 sleep interval 和 batch limit 也需要不同的集群规模设定不同的参数，以保证 etcd 平稳运行和 kube-apiserver 的读写 RT 指标平稳无毛刺。

### 运维平台

无论是 etcd 调参，还是升级其运行的文件系统，都是通过 scale up 的手段提升 etcd 的能力。还有两种 scale up 手段尚未使用：

1. 通过压测或者在线获取 etcd 运行 profile，分析 etcd 流程的瓶颈，然后优化代码流程提升性能；

2. 通过其他手段降低单节点 etcd 数据量。

通过代码流程优化 etcd 性能，可以根据 etcd 使用方的人力情况进行之，更长期的工作应该是紧跟社区，及时获取其版本升级带来的技术红利。通过降低 etcd 数据规模来获取 etcd 性能的提升则必须依赖 etcd 使用方自身的能力建设了。

我们曾对 etcd 的单节点 RT 与 QPS 性能与 KV 数据量的关系进行过 benchmark 测试，得到的结论是：当 KV 数据量增加时，其 RT 会随之线性增加，其 QPS 吞吐则会指数级下降。这一步测试结果带来的启示之一即是：通过分析 etcd 中的数据组成、外部流量特征以及数据访问特点，尽可能地降低单 etcd 节点的数据规模。

目前蚂蚁的 etcd 运维平台具有如下数据分析功能：

1. longest N KV --- 长度最长的 N 个 KV

2. top N KV --- 段时间内访问次数最多的 N 个 KV

3. top N namespace --- KV 数目最多的 N 个 namespace

4. verb + resoure --- 外部访问的动作和资源统计

5. 连接数 --- 每个 etcd 节点的长连接数目

6. client 来源统计 --- 每个 etcd 节点的外部请求来源统计

7. 冗余数据分析 --- etcd 集群中近期无外部访问的 KV 分布

根据数据分析结果，可以进行如下工作：

1. 客户限流

2. 负载均衡

3. 集群拆分

4. 冗余数据删除

5. 业务流量精细分析

#### 1.集群拆分

前文提到，etcd 集群性能提升的一个经典手段就是把 event 数据独立拆分到一个独立的 etcd 集群，因为 event 数据是 K8s 集群一中量级比较大、流动性很强、访问量非常高的数据，拆分之后可以降低 etcd 的数据规模并减轻 etcd 单节点的外部客户端流量。

一些经验性的、常规性的 etcd 拆分手段有：

1. pod/cm

2. node/svc

3. event, lease

这些数据拆分后，大概率能显著提升 K8s 集群的 RT 与 QPS，但是更进一步的数据拆分工作还是有必要的。依据数据分析平台提供的热数据【top N KV】量级以及外部客户访问【verb + resource】情况，进行精细分析后可以作为 etcd 集群拆分工作的依据。

#### 2.客户数据分析

针对客户数据的分析分为 longest N KV 分析、top N namespace。

一个显然成立的事实是：单次读写访问的 KV 数据越长，则 etcd 响应时间越长。通过获取客户写入的 longest N KV 数据后，可以与平台使用方研究其对平台的使用方法是否合理，降低业务对 K8s 平台的访问流量压力和 etcd 自身的存储压力。

一般地，K8s 平台每个 namespace 都是分配给一个业务单独使用。前面提到 K8s 可能因为 list-all 压力导致被压垮，这些数据访问大部分情况下都是 namespace 级别的 list-all。从平台获取 top N namespace 后，重点监控这些数据量级比较大的业务的 list-all 长连接请求，在 kube-apiserver 层面对其采取限流措施，就可以基本上保证 K8s 集群不会被这些长连接请求打垮，保证集群的高可用。

#### 3.冗余数据分析

etcd 中不仅有热数据，还有冷数据。这些冷数据虽然不会带来外部流量访问压力，但是会导致 etcd 内存索引锁粒度的增大，进而导致每次 etcd 访问 RT 时延增加和整体 QPS 的下降。

近期通过分析某大规模【7k node 以上】 K8s 集群 etcd 中的冗余数据，发现某业务数据在 etcd 中存储了大量数据，其数据量大却一周内没有访问过一次，与业务方询问后获悉：业务方把 K8s 集群的 etcd 当做其 crd 数据的冷备使用。与业务方沟通后把数据从 etcd 中迁移掉后，内存 key 数目立即下降 20% 左右，大部分 etcd KV RT P99 延时立即下降 50% ~ 60% 之多。

#### 4.负载均衡

K8s 平台运维人员一般都有这样一条经验：etcd 集群如果发生了启停，需要尽快对所有 K8s kube-apiserver 进行一次重启，以保证 kube-apiserver 与 etcd 之间连接数的均衡。其原因有二：

1. kube-apiserver 在启动时可以通过随机方式保证其与 etcd 集群中某个节点建立连接，但 etcd 发生启停后，kube-apiserver 与 etcd 之间的连接数并无规律，导致每个 etcd 节点承担的客户端压力不均衡；

2. kube-apiserver 与 etcd 连接数均衡时，其所有读写请求有 2/3 概率是经过 follower 转发到 leader，保证整体 etcd 集群负载的均衡，如果连接不均衡则集群性能无法评估。

通过 etcd 运维平台提供的每个 etcd 的连接负载压力，可以实时获取集群连接的均衡性，进而决定运维介入的时机，保证 etcd 集群整体的健康度。

其实最新的 etcd v3.5 版本已经提供了 etcd 客户端和 etcd 节点之间的自动负载均衡功能，但这个版本才发布没多久，目前最新版本的 K8s 尚未支持这个版本，可以及时跟进 K8s 社区对这个版本的支持进度以及时获取这一技术红利，减轻平台运维压力。

### 未来之路

通过一年多的包括 kube-apiserver 和 etcd 在内的 K8s 高可用建设，目前 K8s 集群已经稳定下来，一个显著的特征是半年内 K8s 集群没有发生过一次 P 级故障，但其高可用建设工作不可能停歇 --- 作为全球 K8s 规模化建设领导力象限的蚂蚁集团正在挑战 node 量级更大规模的 K8s 集群，这一工作将推动 etcd 集群建设能力的进一步提升。

前面提到的很多 etcd 能力提升工作都是围绕其 scale up 能力提升展开的，这方面的能力还需要更深层次的加强：

1. etcd 最新 feature 地及时跟进，及时把社区技术进步带来的开源价值转换为蚂蚁 K8s 平台上的客户价值

2.及时跟进阿里集团在 etcd compact 算法优化、etcd 单节点多 multiboltdb 的架构优化以及 kube-apiserver 的服务端数据压缩等 etcd 优化工作【见参考文档 1】，对兄弟团队的工作进行借鉴和反馈，协同作战共同提升

3. 跟进蚂蚁自身 K8s 平台上 etcd 的性能瓶颈，提出我们自己的解决方案，在提升我们平台的技术价值的同时反哺开源

除了关注 etcd 单节点性能的提升，我们下一步的工作将围绕分布式 etcd 集群这一 scale out 方向展开。前面提到的 etcd 集群拆分工作，其本质就是通过分布式 etcd 集群的方式提升 etcd 集群整体的性能：该集群的数据划分方式是依据 K8s 业务层面的数据类型进行的。

该工作可以进一步拓展为：不区分 KV 的业务意义，从单纯的 KV 层面对把数据根据某种路由方式把数据写入后端多 etcd 子集群，实现 etcd 集群整体的冷热负载均衡。

分布式 etcd 集群的实现有两种方式：proxyless 和 proxy based：proxy based etcd 分布式集群的请求链路是 client[kube-apiserver] -> proxy -> etcd server，而谓的 proxyless 分布式 etcd 集群的请求链路是 client[kube-apiserver] -> etcd server。

proxy based etcd 分布式集群的好处是可以直接基于 etcd 社区提供的 etcd proxy 进行开发，后期亦可回馈社区，实现其开源价值、技术价值和客户价值的统一。但经过测试：按照测试发现，kube-apiserver 经过 proxy 向 etcd 发起读写请求后 RT  和 QPS 降低 20% ~ 25%。所以下一步的工作重点是开发 proxyless etcd 集群。

目前的拆分后的 etcd 分布式集群本质或者 67% 的概率是 proxy based 分布式集群：kube-apiserver 的请求大概有三分之二的概率是经过 follower 转发到 leader，此处的 follower 本质就是一个 proxy。如果 kube-apiserver 所有请求都是与 leader 直连后被处理，理论上当前的 K8s 集群的 RT 和 QPS 就有 67% * 20% ≈ 13.4% 的性能收益。

proxyless etcd 分布式集群的缺点是如果把 proxy 的路由逻辑放入 kube-apiserver 中，会造成 kube-apiserver 版本升级成本增加，但相比于至少 20% 【将来通过 etcd 集群规模扩充这个收益肯定会更大】的收益，这个仅仅影响了 kube-apiserver 单个组件的版本升级的成本是值得的。

除了 multiple etcd clusters 的思路外，数据中间件团队基于 OBKV 之上实现了 etcd  V3 API ，算是另一种比较好的技术路线，颇类似于本文开头黄东旭提到的在 tikv 之上 etcd  V3 API 接口层，可以称之为类 etcd 系统，目前相关工作也在推进中。

总之，随着我们 K8s 规模越来越大，蚂蚁集团 etcd 整体工作的重要性就日益凸显。 如果说前期 etcd 的高可用建设之路是在泥泞小道上蹒跚前行，那么以后的 etcd 高可用建设之路必是康庄大道 --- 道路越走越宽广！

#### 参看文档

参考文档 1：

[https://www.kubernetes.org.cn/9284.html](https://www.kubernetes.org.cn/9284.html)

参考文档 2：

[https://tech.meituan.com/2020/08/13/openstack-to-kubernetes-in-meituan.html](https://tech.meituan.com/2020/08/13/openstack-to-kubernetes-in-meituan.html)

#### 作者简介

于雨（github @AlexStocks），dubbogo 社区负责人，一个有十一年服务端基础架构和中间件研发一线工作经验的程序员。

陆续参与和改进过 Redis/Pika/Pika-Port/etcd/Muduo/Dubbo/dubbo-go/Sentinel-go 等知名项目，目前在蚂蚁金服可信原生部蚂蚁大规模 K8s 集群调度团队从事容器编排工作，参与维护全球规模最大的 Kubernetes 生产集群之一，致力于打造规模化、金融级、可信的云原生基础设施。

欢迎对 Serverless 自动伸缩技术、自适应混合部署技术以及 Kata/Nanovisor 等安全容器技术感兴趣的同行或者 2022 届应届毕业生加入我们。

联系邮箱 <xiaoyun.maoxy@antgroup.com> 或者 <yuyu.zx@antgroup.com>。

### 本周推荐阅读

- [我们做出了一个分布式注册中心](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247491198&idx=1&sn=a4607e6a8492e8749f31022ea9e22b80&chksm=faa0f1a4cdd778b214403e36fb4322f91f3d1ac47361bf752c596709f8453b8482f582fe7e2e&token=154358414)

- [还在为多集群管理烦恼吗？OCM 来啦！](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247490574&idx=1&sn=791b8d49759131ea1feb5393e1b51e7c&chksm=faa0f3d4cdd77ac2316b179a24b7c3ac90a08d3768379795d97c18b14a9c69e4b82012c3c097)

- [RFC8998+BabaSSL---让国密驶向更远的星辰大海](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247490428&idx=1&sn=8ca31baa5c99e0790cdee8a075a7c046&chksm=faa0f4a6cdd77db07f3fb1149b7f6505fe6b8eca5b2e2a724960aee76d9667e3e970c44eef5a)

- [MOSN 子项目 Layotto：开启服务网格+应用运行时新篇章](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247488835&idx=1&sn=d645b9abc866048e679b56bfe3b72482&chksm=faa0fa99cdd7738ff1749ae75b1670f953c92b70dcf0358337977438fd74b632b21a7b17ece3)

更多文章请扫码关注“金融级分布式架构”公众号

> ![](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*5aK0RYuH9vgAAAAAAAAAAAAAARQnAQ)
