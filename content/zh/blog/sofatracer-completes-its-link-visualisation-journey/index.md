---
title: "终于！SOFATracer 完成了它的链路可视化之旅"
author: "赵陈"
authorlink: "https://github.com/sofastack"
description: "终于！SOFATracer 完成了它的链路可视化之旅"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2021-10-19T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*HX85SKt0WX8AAAAAAAAAAAAAARQnAQ"
---

📄

文｜赵陈（SOFA 开源之夏链路项目组)

武汉理工大学计算机工程硕士在读

研究方向：唐卡线稿的自动上色

校对｜宋国磊（SOFATracer commiter)

本文 6971 字 阅读 18 分钟

▼

## 背 景

有幸参与开源软件供应链点亮计划——暑期 2021 支持的开源项目，目前 SOFATracer 已经能够将埋点数据上报到 Zipkin 中，本项目的主要目标是将产生的埋点数据上报给 Jaeger 和 SkyWalking 中进行可视化展示。

## PART. 1 SOFATracer

SOFATracer 是蚂蚁集团基于 OpenTracing 规范开发的分布式链路跟踪系统，其核心理念就是通过一个全局的 TraceId 将分布在各个服务节点上的同一次请求串联起来。通过统一的 TraceId 将调用链路中的各种网络调用情况以日志的方式记录下来，以达到透视化网络调用的目的，这些链路数据可用于故障的快速发现，服务治理等。

SOFATracer 提供了异步落地磁盘的日志打印能力和将链路跟踪数据上报到开源产品 Zipkin 做分布式链路跟踪展示的能力。这次参加开源之夏活动的任务是要把链路跟踪数据上报到 Jaeger 和 SkyWalking 中进行展示。

### SOFATracer 数据上报 

![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*Mg8STYZRA6UAAAAAAAAAAAAAARQnAQ)

上图是 SOFATracer 中的链路上报流程，Span#finish 是 span 生命周期的最后一个执行方法，这是整个数据上报的入口，SOFATracer 的 report span 方法中含有上报链路展示端和日志落盘两个部分。SOFATracer 中没有把上报数据采集器和日志落盘分开只是在日志落盘之前调用 SOFATracer#invokeReporListeners 方法，找到系统中所有实现了 SpanReportListener 接口并加入了 SpanReportListenersHolder 的实例，调用其 onSpanReport 方法完成链路数据上报至数据采集器。下面的代码片段是 invokeReportListeners 方法的具体实现。

```python
 protected void invokeReportListeners(SofaTracerSpan sofaTracerSpan) {
    List<SpanReportListener> listeners = SpanReportListenerHolder
        .getSpanReportListenersHolder();
    if (listeners != null && listeners.size() > 0) {
        for (SpanReportListener listener : listeners) {
            listener.onSpanReport(sofaTracerSpan);
        }
    }
}
```

SpanReportListenerHolder 中的实例在项目启动的时候加入，且分为 Spring Boot 应用和 Spring 应用两种情况：

- 在 Spring Boot 应用中自动配置类 SOFATracerSpanRemoteReporter 会将当前所有 SpanReportListener 类型的 bean 实例保存到 SpanReportListenerHolder 的 List 对象中。SpanReportListener 的实例对象会在各自的 AutoConfiguration 自动配置类中注入到 IOC 容器中。

- 在 Spring 应用中通过实现 Spring 提供的 bean 生命周期接口 InitializingBean，在 afterPropertiesSet 方法中实例化 SpanReportListener 的实例对象并且加入到 SpanReportListenerHolder 中。

要实现把 SOFATracer 中的 trace 数据上传到 Jaeger 和 SkyWalking 需要实现 SpanReportListener 接口并在应用启动的时候把对应实例加入到 SpanReportListenersHolder 中。

## PART. 2 Jaeger 数据上报 

下图是 Jaeger 中数据上报的部分图示，图中 CommandQueue 中存放的是刷新或添加指令，生产者是采样器和 flush 定时器，消费者是队列处理器。采样器判断一个 span 需要上报后向 CommandQueue 中添加一个 AppendCommand，flush 定时器根据设置的 flushInterval 不断向队列中添加 FlushCommand，队列处理器不断从 CommandQueue 中读取指令判断是 AppendCommand 还是 FlushCommand，如果刷新指令把当前 byteBuffer 中的数据发送到接受端，如果是添加指令把这个 span 添加到 byteBuffer 中暂存。

![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*yXSOQIb_JOYAAAAAAAAAAAAAARQnAQ)

在实现上报到 Jaeger 过程中主要工作是 Jaeger Span 和 SOFATracer Span 模型的转换，转换过后利用上面的逻辑发送 span 到后端。

![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*DbJ9RIcogPYAAAAAAAAAAAAAARQnAQ)

上图是 Jaeger 中 Sender 的 UML 图，从图中可以看到有两种类型的 Sender 分别是 HTTPSender 和 UDPSender 。分别对应用 HTTP 发送数据和 UDP 发送数据，在实现 SOFATracer 上报 Jaeger 中使用 UDPSender 发送 span 数据到 Jaeger Agent 中，使用 HTTPSender 直接发送数据到 Jaeger-Collector 中。

### Jaeger Span 与 SOFATracer Span 模型的转换 

#### 模型转换对照

![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*O2SoSpJO_xYAAAAAAAAAAAAAARQnAQ)

#### TraceId 和 SpanId 的处理

TraceId 的转换：

- 问题在 SOFATracer 中的 TracerId 的产生规则是：服务器 IP + ID 产生的时间 + 自增序列 + 当前进程号

>例如 ：0ad1348f1403169275002100356696 前 8 位 0ad1348f 即产生 TraceId 的机器的 IP，这是一个十六进制的数字，每两位代表 IP 中的一段，我们把这个数字，按每两位转成 10 进制即可得到常见的 IP 地址表示方式 10.209.52.143，您也可以根据这个规律来查找到请求经过的第一个服务器。后面的 13 位 1403169275002 是产生 TraceId 的时间。之后的 4 位 1003 是一个自增的序列，从 1000 涨到 9000，到达 9000 后回到 1000 再开始往上涨。最后的 5 位 56696 是当前的进程 ID，为了防止单机多进程出现 TraceId 冲突的情况，所以在 TraceId 末尾添加了当前的进程 ID。——TraceId 和 SpanId 生成规则

在 SOFATracer 中 TraceId 是 String 类型，但是在 Jaeger 中 TraceId 是使用的两个 Long 型的整数来构成最终的 TraceId。

#### 解决方案

在 Jaeger 中表示 TraceId 的是 TraceIdHigh 与 TraceIdLow 在内部再使用函数将两者转换成 String 类型的 TraceIdAsString 在拼接的过程中分别将两个 ID 转换为对应的 HexString，当  HexString 不够 16 位时头部加 0。

```private String padLeft(String id, int desiredLength) {
    StringBuilder builder = new StringBuilder(desiredLength);
    int offset = desiredLength - id.length();

    for (int i = 0; i < offset; i++)
        builder.append('0');
    builder.append(id);
    return builder.toString();
}
```

#### SpanId 的转化

- 问题在 Jaeger 中 SpanId 是 Long 型整数，在 SOFATracer 中是 String 类型。

- 解决办法这个问题的解决办法同之前已有的转化为 Zipkin 中的 SpanId 的解决办法一样，也是使用 FNV Hash 将 String 映射成冲突较小的 Long 型。

### 两种上传方式 

#### 配合 Jaeger Agent

>The Jaeger agent is a network daemon that listens for spans sent over UDP, which it batches and sends to the Collector. It is designed to be deployed to all hosts as an infrastructure component. The agent abstracts the routing and discovery of the Collectors away from the client.

Jaeger Agent 被设计成一种基本组件部署到主机上，能够将路由和发现 Collector 的任务从 client 中抽离出来。Agent 只能接受通过 UDP 发送的 Thrift 格式的数据，所以要使用 Jaeger Agent 需要使用 UDPSender。

#### 使用 HTTP 协议上报 Collector

当使用 UDP 上报到 Jaeger Agent 的时候为了保证数据不在传输过程中丢失应该把 Jaeger Agent 部署在服务所在的机器，但是有的情况不能满足前述要求，这时可以使用 HTTP 协议直接发送数据到 Collector，这时使用 HTTPSender。

## PART. 3 SkyWalking 数据上报

SkyWalking 是分布式系统的应用程序性能监视工具，专为微服务、云原生架构和基于容器架构而设计，提供分布式追踪、服务网格遥测分析、度量聚合和可视化的一体化解决方案。SkyWalking 采用字节码注入的方式实现代码的无侵入，且性能表现优秀。SkyWalking 的 receiver-trace 模块可以通过 gRPC 和 HTTPRestful 服务接受 SkyWalking 格式的 trace 数据，在实现上报 SkyWalking 中选择的上报方式是通过 HTTPRestful 服务上报。

**模型转换对照**  

>![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*CuTTQpIuL98AAAAAAAAAAAAAARQnAQ)

### SegmentId、SpanId、PatentSpanID 的转换  

SOFATracer 中的 SpanId 是一个字符串，但是在 SkyWalking 中 SpanId 和 ParentSpanId 是一个 int 整数并且每一个 segment 中的 SpanId 都是从 0 开始编号，SpanId 最大值由配置的一个 segment 中最多有多少 span 指定。在转换过程中需要指定 SpanId，因为现在每一个 segment 中只有一个 span，所以转换生成的 segment 中的 span 的 ID 可以固定成 0。

SegmentId 是用来唯一标识一个 segment 的，如果 segmentId 相同前一个 segment 会被后面的 segment 覆盖导致 span 丢失。最后使用的 segmentId 的构造方式是 segmentId = traceId + SpanId 哈希值 + 0/1，其中 0 和 1 分别代表 server 和 client。最后需要加上 client 和 server 的原因是在 Dubbo 和 SOFARPC 中存在 server -> server 的情况，其中 RPC 调用的 client、server span 的 SpanId 和 parentId 都一样，需要以此来区分它们，否则 client 端的 span 会被覆盖。

### Dubbo 与 SOFARPC 的处理 

基本的模型是 client-server-client-server-. 这种模式，但是在 Dubbo 和 SOFARPC 中存在 server -> server 的情况，其中 client span、server span 两个 span 除了 kind 类型不同之外，其他的信息是一样。

- **parentSegmentId**

要找出 parentSegmentId，在非 SOFARPC 和 Dubbo 情况下，遵循 server -> client， client -> server 也就是 client 的父 spa 只能是 server 类型的，server 类型的父 span 只能为空或 client 类型。转换方式是在 SOFARPC 和 Dubbo 中，根据使用 SkyWalking Java Agent 上报时两者的链路展示情况，转化按照：

server span：parentSegmentId = traceId + parentId 哈希值 + client(1)

client span：parentSegmentId = traceId + parentId 哈希值 + server(0)

server span：parentSegmentId = traceId + spanId 哈希值 + client(1)

client span ：parentSegmentId = traceId + parentId 哈希值 + server(0)

- **字段和 networkAddressUsedAtPeer 字段**:

**Peer 字段**

在 Dubbo 中 Peer 字段可以通过 remote.host、remote.port 两个 tag 组成 SOFARPC 中在 remote.ip 中包含了 IP 和 port，只使用 IP，因为在 server 端上报的 span 中无法获得 client 使用的是自己的哪个端。

**networkAddressUsedAtPeerDubbo**

可以通过 local.host、local.port 组成 SOFARPC 中不能直接从 span 中获取到本机的 IP，使用的是获取本机的第一个有效 IPv4 地址，但是没有端口号，所以在上面的 peer 字段中也只用了 IP。

### 展示拓扑图 

在构建链路的过程中几个比较关键的字段是 peer、networkAddressUsedAtPeer 、parentService、parentServiceInstance、parentEndpoint。其中 Peer 和 networkAddressUsedAtPeer 分别表示对端地址以及 client 端调用当前实例使用的地址，这两个字段的作用是将链路中的实例连接起来，如果这两个字段缺失会导致链路断开，在转换过程中这两个字段通过在 span 的 tag 中寻找或获取本机第一个合法的 IPv4 地址获得。后三个字段的作用是指出对应的父实例节点，如果不设置这三个字段会产生一个空的实例信息，如下图所示。目前 SOFATracer 中在能在上下文中传播的只有 TraceIdSpanId、parentId、sysBaggage、bizBaggage 从其中无法得到以上的三个字段，为了能展示拓扑图在 SOFATracer 的上下文中增加了七个字段 service、serviceInstance、endpoint、parentService、parentServiceInstance、parentEndpoint、peer 这样就能够在转换的过程中获得父服务的相关信息。

![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*_IeiRIIUV3QAAAAAAAAAAAAAARQnAQ)

### 异步上传 

使用 HTTP 上报 Json 格式的 segment 数据到后端，上报时以 message 为单位，多个 segment 组合成一个 message。

流程如下图，span 结束后将转换好的 segment 加入到 segment 缓冲数组中，另一个线程不断到数组中刷新数据到 message，当 message 的大小达到最大值或等待发送的时间达到设定值就发送一次数据，设置的 message 最大默认为 2MB。

![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*_IeiRIIUV3QAAAAAAAAAAAAAARQnAQ)

## PART. 4 压 测

### 测试配置 

- Windows 10

- Memory 16G

- Disk 500GB SSD

- Intel(R) Core(TM) i7-7700HQ CPU @2.80GHz  2.80GHz 

### 测试方式 

部署一个包含六个服务的调用链路。设置三组对照：

- 不采集 span

- 50% 采集

- 全量采集 

### Jaeger 测试结果 

测试中相关的几个参数设置如下：

![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*XudqRaAG44sAAAAAAAAAAAAAARQnAQ)

#### Jaeger Agent 方式

**全量采集**

![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*-S94QohKzBwAAAAAAAAAAAAAARQnAQ)

**50% 采集**

![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*tY6nTatUwJQAAAAAAAAAAAAAARQnAQ)

**不采集**

![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*UMeERop_3DUAAAAAAAAAAAAAARQnAQ)

#### 上报 Jaeger Collector

**全量采集**

![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*oKcwQKzqMyEAAAAAAAAAAAAAARQnAQ)

**50%采集**

![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*Pb-2RISuTmkAAAAAAAAAAAAAARQnAQ)

**不采集**

![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*uqB4RIFn5mAAAAAAAAAAAAAAARQnAQ)

### SkyWalking 测试结果 

**全集采集**

![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*Yj_9T4_Ic-UAAAAAAAAAAAAAARQnAQ)

**50% 采集**

![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*FVj2QL-sGaYAAAAAAAAAAAAAARQnAQ)

**不采集**

![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*KmlQQYSKHMgAAAAAAAAAAAAAARQnAQ)

**测试小结**

![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*3cfZSYRvFGcAAAAAAAAAAAAAARQnAQ)

在全采样时三种上报方式中上报 SkyWalking 的本机吞吐率是最低的只有 512.75/sec，相比于上报 Jaeger Agent 吞吐率下降了约 14%，相比于上传 Jaeger Agent 吞吐率减少了 11.89%。就每种方式对比全采样与不采样时吞吐率的变化：上报 Jaeger Agent 时因为全采样吞吐率下降了 14.6%，上报 Jaeger Collector 时因为全采样吞吐率下降了 17%，上报 SkyWalking 时因为全采样吞吐率下降了约 23%。

本次介绍的 SOFATracer 的链路可视化，将会在下个版本 release。

-

**「收获」**

很幸运能够参加这次的开源之夏活动，在阅读 SOFATracer 源码的过程中学习了很多优秀的设计思想与实现方式，实现的过程中会去模仿一些源码的实现方式在这个过程中自己学习到了很多。在项目实施过程中也发现了自己的一些问题，比如在解决问题时有一点思路就开始做，没有深挖这个思路是否可行，这个坏习惯浪费了许多时间。这是我第一次参与到开源社区的相关活动中，在这个过程中了解了开源社区的运作方式，在以后的学习过程中会更加努力提高自己的代码能力，争取能为开源社区做出一点贡献。

特别感谢感谢宋国磊老师对我的耐心指导，在项目过程中宋老师帮助我解开了很多疑惑，学到很多东西，感谢 SOFAStack 社区在整个过程中对我的诸多帮助，感谢活动主办方提供的平台。

-

**「参考资料」**

1. 蚂蚁集团分布式链路跟踪组件 SOFATracer 数据上报机制和源码分析 | 剖析

2. 使用 SkyWalking 实现全链路监控

3. Zipkin-SkyWalking Exporter

4. STAM：针对大型分布式应用系统的拓扑自动检测方法

### 本周推荐阅读  

- [攀登规模化的高峰 - 蚂蚁集团大规模 Sigma 集群 ApiServer 优化实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247495579&idx=1&sn=67d0abc1c513ba4f815550d235b7a109&chksm=faa30041cdd489577c0e3469348ebad2ab2cc12cdfebca3a4f9e8dcd5ba828a76f500e8c0115&scene=21)

- [SOFAJRaft 在同程旅游中的实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247495260&idx=1&sn=a56b0f82159e551dec4752b7290682cd&chksm=faa30186cdd488908a73792f9a1748cf74c127a792c5c484ff96a21826178e2aa35c279c41b3&token=1376607701&lang=zh_CN#rd)

- [蚂蚁集团技术风险代码化平台实践（MaaS）](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247495808&idx=1&sn=88246170520e1e3942f069a559200ea4&chksm=faa31f5acdd4964c877ccf2a5ef27e3c9acd104787341e43b2d4c01bed01c91f310262fb0ec4&scene=21)

- [下一个 Kubernetes 前沿：多集群管理](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247495694&idx=1&sn=0e2d5b03ac7320e8d1bcca3d547fdee8&chksm=faa31fd4cdd496c2d646e1c651b601fab83acfb5f4361ca340cde0b029b78e9c894ccb094107&scene=21)

![](https://gw.alipayobjects.com/zos/bmw-prod/337fd10f-76f2-4e08-b25f-3d23e3510cb9.webp)
