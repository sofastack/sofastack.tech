---
title: "Seata 多语言体系建设"
authorlink: "https://github.com/sofastack"
description: "在诸如 gRPC 等微服务体系都在进行多语言建设的当下，分布式事务也应该有多种语言支持。所以在规划 2022 年 Seata  Roadmap 时，其中一个非常的关键点就是 Seata 的多语言技术体系建设。在经过半年的准备特别是完成了 Seata v1.5.2 发版后，社区在今年 （2022 年） 下半年的重点任务就是全力建设 Seata 的多语言实现。"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2022-07-19T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*bsyZTJzHmNkAAAAAAAAAAAAAARQnAQ"
---

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/81cc6c7880c84141acf2f6e9656d57bf~tplv-k3u1fbpfcp-zoom-1.image)

文｜赵新（花名：于雨 )

蚂蚁集团可信原生部工程师阿里开源先锋人物、阿里开源大使

负责蚂蚁可信原生技术部 DB Mesh 系统开发，以及容器和分布式事务开源工作

**本文 3846 字，阅读 10 分钟**

## ｜引语｜

分布式事务是微服务技术体系中非常关键的的一个技术节点，当下最流行且经过大规模生产验证的高质量分布式事务实现无疑是 Seata。Seata 社区过去四年长期专注于 Java 语言实现，在 Java 领域是事实上的分布式事务技术标准平台。

在诸如 gRPC 等微服务体系都在进行多语言建设的当下，分布式事务也应该有多种语言支持。所以在规划 2022 年 Seata  Roadmap 时，其中一个非常的关键点就是 Seata 的多语言技术体系建设。在经过半年的准备特别是完成了 Seata v1.5.2 发版后，社区在今年 *（2022年）* 下半年的重点任务就是全力建设 Seata 的多语言实现。

## PART. 1--关键技术点

Seata Java 版本经过四年建设后，已经形成了一个非常庞大的技术体系。在进行多语言建设时，想要在半年内让多语言版本 Seata 的功能与 Seata Java 完全对齐，是不可能的。社区需要综合考量当下的实际迫切需求以及未来的发展方向，先找出 Seata 多语言版本的关键技术点。

### 1. 事务模式

Seata 提供了 TCC、SAGA、AT 和 XA 四种经典事务模式。下图是四种模式的发布时间。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0853d436d64a42a5b687afb709a14587~tplv-k3u1fbpfcp-zoom-1.image)

**各种模式有其各样的特点：**

**AT 模式**

算是阿里体系独创的事务模式，其本质属于两阶段事务，其二阶段的 commit/rollback 由框架自动生成，对业务没有侵入，用户友好度高于 TCC 模式，可完美接续 Spring 事务，开发效率也较高，也是当前用户最多的一种模式。在 v1.5.2 已经发版的当下时间节点来看，AT 模式下通过全局锁来实现数据的隔离性，对于同一个资源的事务处理只能串行操作，性能一般。

**TCC 模式**

需要业务层参与者实现 prepare/commit/rollback 接口，其性能在四种模式下最好，数据可见性、隔离性也不错，流行程度仅次于 AT。特别适用于对吞吐、性能、隔离性要求都比较高的金融业务。

**SAGA 模式**

是一种长事务解决方案，其一阶段正向服务和二阶段补偿服务都由业务开发实现，可以很方便地与微服务框架进行结合，其性能仅次于 TCC 模式。因为其方便编排的特点，它在微服务编排领域有大量应用，当然使用时需要用户写 JSON 文件对服务进行编排。但其数据隔离性不好，业务数据有被脏写的风险。社区目前正在进行 SAGA 注解化工作（[https://github.com/seata/seata/pull/4577](https://github.com/seata/seata/pull/4577)），可进一步提升其性能与易用性。

**XA 模式**

不同于其他三种「补偿型」事务，它提供了最严格的隔离性：可以保证全局视角的数据一致性，即保证了用户不会出现脏读。Seata XA 模式的接口与 AT 模式基本一致，算是对用户比较友好的一种事务模式，它是对 XA 协议的严格实现。XA 模式的缺点是其事务范围比较长，其性能最低。

四种模式的发版顺序如下：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1cc1b2047b0e4d6885be14a85446e91d~tplv-k3u1fbpfcp-zoom-1.image)

每种事务模式在阿里体系内都有各自的业务场景，其出现与演进都是迎合了各自业务场景现有的痛点。AT 和 XA 是不需要理解业务语义的，作用于 DB driver + DB 层面，TCC 和 SAGA 则需要业务层面自实现回滚幂等类逻辑，按照数据面和业务面来切分，依据对业务的入侵程度，四种模式归类如下图。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/801188d24f774a6caa438ecf44143291~tplv-k3u1fbpfcp-zoom-1.image)

分布式事务的基石是通信框架、SQL 解析以及数据库连接驱动实现等。得益于 Java 语言丰富的生态，Seata Java 版本可以很方便地站在这些 “巨人” 肩上展开相应的工作，这也是其他语言无法望其项背的。例如，主流数据库都提供了其 Java 版本的 DB driver。但当把工作背景放到多语言场景下时，就需要考量各个语言相关技术点的实现程度了。

四种事务模式，AT 模式本质是应用层的事务，需要把数据库层面做过的 Redo/Undo 在应用层再做一遍，其中非常关键的一个技术点是：AT 模式需要介入数据源做 SQL 拦截，对 SQL 进行解析。单单考量 SQL 解析这个单技术点，Java 和 Python 语言有 antlr，Go 语言有 TiDB 提供的可自由使用的 pingcap/parser，但目前很多其他语言在这块都是空白的。

所以社区在考量现实情况后，除了 Go 和 Python 版本，在进行多语言版本建设时，没有 SQL 解析包的语言版本先不提供 AT 模式的实现。

### 2. 通信协议

**不论哪种事务模式，都构建在 Seata 独有的架构之上。**

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/93a0c96e99024f7c8d4d350413aa492c~tplv-k3u1fbpfcp-zoom-1.image)

图片来自 seata 官网

Seata 总体架构由如下角色构成：

**事务协调器 Transaction Coordinator**

简称 TC，维护全局事务和分支事务的状态，驱动全局事务提交或者回滚。

**事务管理器 Transaction Manager**

简称 TM，定义全局事务的范围，提交或者回滚全局事务。

**资源管理器 Resource Manager**

简称 RM，和分支事务在同一个应用，进行分支事务的注册，报告分支事务的状态，驱动分支事务的提交或者回滚。

TC 与 TM 以及各个 RM 之间使用 netty 框架进行长链接通信。具体而言，Seata Java 版本的通信协议是在四层 TCP 协议之上又定义了一套私有的二进制双向通信协议。其关键点在于 Seata Java 版本站在了 netty 这个巨人肩上。

回到多语言这个背景下，很多语言并没有提供一套成熟的 TCP 通信框架。譬如 Dubbo 在建设其 Go 版本 dubbo-go 时，为了在 TCP 之上实现与 Dubbo 的私有二进制协议通信，本人前期的工作重点是先实现 TCP 通信框架 getty（[https://github.com/apache/dubbo-getty](https://github.com/apache/dubbo-getty)），然后再实现其序列化协议 dubbo-go-hessian2（[https://github.com/apache/dubbo-go-hessian2](https://github.com/apache/dubbo-go-hessian2)）。如果把语言切换成 JS、PHP 或者 Python，相关通信协议建设需要耗费社区大量精力。

Seata 2019 年就在 API 层适配了 gRPC 的事务上下文传递，为了方便 Seata 多语言版本的建设，Seata Java 框架本身正在进行一项重要工作：Seata Client  *（包括 TM 和 RM）* 基于 gRPC 与 Seata Server *（TC）* 集群进行通信。希望借助于 gRPC 的多语言优势，节省多语言版本在通信层面的工作量。

### 3. 配置和注册中心

类似于其他微服务框架，Seata 自身除了上一节提到的内部组件外，还依赖于注册中心和配置中心。微服务上层的应用通过配置中心找到注册中心，再通过注册中心发现 Seata 的各个服务组件。一个典型的完备的 Seata 服务架构如下图。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7a42fae0d6664746a99da57fa44d7974~tplv-k3u1fbpfcp-zoom-1.image)

Seata Java 这套架构可以很方便的嵌入注入 Dubbo、SOFARPC 以及 Spring 等 Java 微服务框架中。其中两种非常重要的外部依赖组件是：

**Config Centre**

依据参考文档 1 和 3，配置中心的作用是 “放置着各种配置文件”，客户端通过配置中心的配置 “去读取全局事务开关, 事务会话存储模式” 等事务配置信息。

Seata Java 支持的配置中心类型有 File、Nacos 、Apollo、Zk、Consul、Etcd3 等。

**Registry Centre**

依据参考文档 2，注册中心记录了服务路由和寻址映射关系。服务会注册到这里，当服务需要调用其它服务时，就到这里找到服务的地址进行调用。比如 Seata Client 端 *（TM、RM）* 对 Seata Server *（TC）* 集群进行服务发现就是通过注册中心进行的。

Seata Java 支持的注册中心有 File 、Nacos 、Eureka、Redis、Zk、Consul、Etcd3、SOFA 等。

先不论这套体系的复杂程度与维护成本，在进行 Seata 多语言体系建设时，遇到的关键问题是：这些组件的多语言支持情况参差不齐。Seata 其他语言版本不可能为了支持这些组件，让 Seata 社区自己去构建起这些组件的多语言客户端实现。

愚以为，解决这个问题的手段，不是去裁剪 Seata Java 的现有实现，而是扩展 Seata Java 的功能支持新的更多的配置中心与注册中心。在云原生时代的当下，大部分云平台的底座是 Kubernetes，大部分微服务体系都在基于 K8s 构建其新技术形态。所以 Seata 多语言体系可以用如下形式构建起新的 name server：

**使用 K8s 的 ConfigMap 存储 Seata 的配置数据**

一般地，Seata 是作为其他微服务平台如 Spring Cloud Alibaba、Dubbo、HSF、SOFARPC 等框架的组件使用的。这些框架本身就有配置中心的概念，支持了 Nacos、Apollo、SOFARegistry 等流行的配置中心，Seata 可以复用这些框架现有的配置中心，减少维护成本。

多语言版本的 Seata 的配置类型可以先实现 File 类型，使用 Seata 的微服务应用运行在 Kubernetes 平台上时，通过 ConfigMap 挂载 Seata 的配置。

**使用 K8s 的 API server 或者 DNS 组件充当 Seata 的注册中心**

同理于配置中心，Seata 的注册中心也可以复用其所在的微服务框架的注册中心，如 Nacos、Etcd、Zookeeper 等。运行在 Kubernetes 平台上时，把 API server 当作注册中心，多语言版本的 Seata 优先实现 File 类型，配置 API server 地址即可。

Seata server *（就是 TC）* 可以多 namespace 部署，每个 namespace 下可以有多个 TC 集群，Seata Client *（包括 TM 和 RM）* 可以通过 service 形式获取 TC 集群地址，这样既达到了 TC 高可用的目的，也方便在客户端层面对 TC 集群进行负载均衡。 

## PART. 2--总结

通过对事务模式、通信协议以及配置与注册中心的讨论，可以看到，在进行 Seata 多语言体系建设时，并不是让 Seata 多语言实现完全以 Seata Java 版本为参照向其靠拢，而是 Seata Java 版本作为 Seata 多语言体系的一部分共同进化。

## PART. 3--整体工作进度

计算机行业有个 TIOBE 排行榜，定期更新各种主流计算机语言的流行度。参照这个排行榜中前 10 大流行语言，本人月初 *（2022 年 7 月）* 在 Seata 两大钉钉群发起了 Seata 多语言投票，统计结果如下：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/220942e3d91041ae8e1f77c0f7b8179f~tplv-k3u1fbpfcp-zoom-1.image)

根据投票结果以及社区相关人才技术储备情况，社区决定先重点投入 Go、Python、JS 三种语言建设上。几种语言当前工作推进情况如下：

**seata-go**

项目地址：*[https://github.com/seata/seata-go](https://github.com/seata/seata-go)*

社区钉群：33069364

**seata-python**

项目地址：*[https://github.com/opentrx/seata-python](https://github.com/opentrx/seata-python)*

社区钉群：44788121

**seata-js**

项目地址：*[https://github.com/seata/seata-js](https://github.com/seata/seata-js)*

社区钉群：44788119

**seata-rust**

项目地址：*[https://github.com/seata/seata-rust](https://github.com/seata/seata-rust)*

社区钉群：44791799

**seata-php**

项目地址：*[https://github.com/seata/seata-php](https://github.com/seata/seata-php)*

社区钉群：44788115

历史上，Seata 曾经有两个 Go 版本，分别是 2019 年由张旭贡献的 seata-go 和 2020 年由刘晓敏贡献的 seata-golang。为了统一建设，目前已经把这两个项目合并，seata-go 完成度是多语言版本中最高的，实现了 TCC 和 AT 模式。目前 XA 和 Saga 模式的实现也在推进中，预计秋季可发布第一个版本。其次完成度比较高的是 seata-python，提供了 AT 事务模式。

考虑到 Seata 目前大部分开发者和用户都在国内，Seata 社区建设了多个语言社区群，以推进语言版本的开发工作。

Seata 多语言体系建设工作目前正在如火如荼地展开中，欢迎行业同仁入群参与其中，与我们一起推动 Seata 各个语言版本的实现，提升各个语言微服务框架的事务技术水平，开创分布式技术建设新局面！

### 【参考文档】

1. Seata 应用侧启动过程剖析——注册中心与配置中心模块：

*[https://seata.io/zh-cn/blog/seata-client-start-analysis-02.html](https://seata.io/zh-cn/blog/seata-client-start-analysis-02.html)*

2. Seata 注册中心实现原理：

*[https://seata.io/zh-cn/blog/seata-config-center.html](https://seata.io/zh-cn/blog/seata-config-center.html)*

3. Seata 配置中心实现原理：

*[https://seata.io/zh-cn/docs/user/registry/index.html](https://seata.io/zh-cn/docs/user/registry/index.html)*

4. Seata 企业版：

*[https://developer.aliyun.com/article/928860](https://developer.aliyun.com/article/928860)*

### 本周推荐阅读

Go 原生插件使用问题全解析

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/fa95fc7c75a34c04875e937f2ead4bd1~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247512138&idx=1&sn=851abb8d07d47f703e33978c9c125c59&chksm=faa35f90cdd4d6869c6cd4934c042484dbe1063c3fb85462d2f33e936b96240ae33d02d18c3a&scene=21)

SOFARegistry 源码｜数据同步模块解析

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/00cbd8e3a4244594ae9b8c51d061cc2d~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247511796&idx=1&sn=14045ed1b3e634061e719ef434816abf&chksm=faa3412ecdd4c83808c5945af56558fe157395b21bc0d56665e102edb92316c6f245f94d306c&scene=21)

社区文章｜MOSN 构建 Subset 优化思路分享

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2d203c057943461fb63af35dd9509ae1~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247511573&idx=1&sn=86019e1570b797f0d4c7f4aa2bcf2ad3&chksm=faa341cfcdd4c8d9aea24212d29c31f2732ec88ee65271703d2caa96dabc114e873f975fec8f&scene=21)

Nydus —— 下一代容器镜像的探索实践

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c3cd60032e754393a6ce431afc4c96dc~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247510940&idx=1&sn=b545e0836a6182abddd13a05b2f90ba9&chksm=faa34446cdd4cd50a461f071cdc4d871bd6eeef2318a2ec73968c117b41740a56a296c726aee&scene=21)

欢迎扫码关注：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1432145b2d2a4bb1a3b3f78172b14cc4~tplv-k3u1fbpfcp-zoom-1.image)
