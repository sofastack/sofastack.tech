---
title: "蚂蚁金服轻量级监控分析系统解析 | SOFAChannel#6 直播整理"
author: "响风"
authorlink: "https://github.com/xzchaoo"
description: "本文根据 SOFAChannel#6 直播分享整理，主题：轻量级监控分析系统 SOFALookout 原理讲解和功能演示。"
categories: "SOFALookout"
tags: ["SOFALookout","SOFAChannel"]
date: 2019-06-28T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/png/226702/1563420074562-4edb7587-1564-473a-97d8-20e84a0e15c5.png"
---

> <SOFA:Channel/>，有趣实用的分布式架构频道。
> 本文根据 SOFAChannel#6 直播分享整理，主题：轻量级监控分析系统 SOFALookout 原理讲解和功能演示。
> **回顾视频以及 PPT 查看地址见文末。**
> 欢迎加入直播互动钉钉群：**23195297**，不错过每场直播。

![SOFAChannel#6](https://cdn.nlark.com/yuque/0/2019/png/226702/1561626725872-78e81698-4086-4082-a8ea-7887a14fd49d.png)

大家好，我是响风，来自蚂蚁金服， 现在是 SOFALookout 的开源负责人。本期 SOFAChannel 我给大家带来主题是《轻量级监控分析系统 SOFALookout 原理讲解和功能演示》的分享。本期的讲解内容如下将从以下四个部分展开：

- 监控预警基本概念介绍
- SOFALookout 的客户端使用（包括系统设计简介与实现）
- SOFALookout 的服务端使用（包括系统设计简介与实现）
- SOFALookout 发展规划

欢迎大家 Star 我，SOFALookout：[https://github.com/sofastack/sofa-lookout](https://github.com/sofastack/sofa-lookout)

## 1 监控预警基本概念介绍

### 1.1 什么是 SOFALookout

现在我们开始第一部分，先介绍一些基本概念。6 月初，SOFALookout 服务端开源，具体内容可以查看相关文章：[蚂蚁金服轻量级监控分析系统 SOFALookout 服务端开源](https://mp.weixin.qq.com/s/Ql34eGaUrpm9St0yb1-hFw)，SOFALookout 客户端在之前也已经开源。目前整个系统是真正地可以玩转起来的，这里先介绍一下 SOFALookout。

SOFALookout 是蚂蚁金服开源的一款解决系统的度量和监控问题的轻量级中间件服务。开源版本只提供对 Metrics 的处理部分：涵盖 Metrics 数据的产生，也就是 Metrics 的埋点、收集、加工、存储与查询等一系列服务。

### 1.2 Metrics 的前置知识

介绍一些 Metrics 的前置知识：

第一是时序数据，比较正式的解释是“基于稳定频率持续产生的一系列指标监测数据”。简单说横轴是时间，纵轴是数值的情况下，第一印象可以做成走势图的数据通常就是时序数据。比如 2009 年到 2018 年每年双十一天猫的成交额，就构成了时序数据。

第二是标签（Tag），它用于表明指标项监测针对的具体对象。还是以刚才的成交额为例子，其实我们要监测的指标是“成交额”，但是“成交额”并没有标明要监测的对象，即谁的成交额，哪个省的成交额，也就是缺少“定语”。标签的作用就相当于是“定语”。比如“天猫的 浙江省的 成交额”，在代码中通常会有键值对来描述，比如 type="天猫"，province="浙江"。

第三是时序数据库，即专门为存查时序数据而设计的数据管理系统。主要有以下几个特点：

1. 写多读少
1. 数据多维度，无 schema，需要多维度查询或聚合
1. 通常无删除和更新操作， 或受限

以下是一些常见的开源时序数据库，由于篇幅关系，就不一一介绍了。

- Graphite
- InfluxDB
- OpenTSDB
- Prometheus

### 1.3 传统 Metrics 和 Metrics 2.0 的对比

下面再来看一下传统 Metrics 和 Metrics 2.0 的对比。

#### 1.3.1 传统 Metrics

传统 Metrics 是我对它的称呼，简单来说它只有 Name 和 Value，没有显式的 Tags 概念。比如 "temperature = 29"，温度=29，当然这里都省略了时间戳。这个表达式并没有指出监测对象，传统 Metrics 的做法是，将监测对象的信息编码到 Name 里，因此可能就变成了 "temperature.hangzhou=29"。这里是有一些隐式的 Tags 信息的，只是被编码到 Name 里了。

这种做法很快会导致一个问题，我们来看下一个例子： `shanghai.host1.foo.exporter.bar` 。 只看这个名字的话几乎很难知道这个 Metrics 统计的是什么。这是因为它并没有把字段对应的 Key 编码到名字里，所以在缺少一些上下文的情况下，我们很难读懂它的含义。

另外，字段的顺序也是很重要的，不能写错，这是因为编码到 Name 里的只有 Tag 的 Value，Key 不在里面，于是又有了另外一种编码方式：`zone.shanghai.host.host1.app.foo.counters.exporter.bar` 。这种方式将 Tag 的 Key 也编码在Name 里。但带来的问题也很明显：Name 越来越长。

我们再看下一个例子： `login.success.h5`，它想表达来自 H5 平台登录成功的次数。假设我们还有其他平台，比如安卓、IOS，我们想求所有平台的总登录成功次数，那么就需要做一个聚合操作。通常时序数据库会提供型号来匹配所有值。

其实上面这些都是旧版本 `Graphite` 的例子, 不过它在 2017 年底的版本支持了 Tags 概念，所以已经不能拿新版来当反面教材了。

这是 Dropwizard 客户端的一个简单 Demo，它是一个很流行的 Metrics 埋点客户端，但是只能支持传统 Metrics 的概念。

```java
MetricRegistry registry = new MetricRegistry();
Counter h5Counter = registry.counter("login.success.h5");
h5Counter.inc();
```

#### 1.3.2 Metrics 2.0

我们再来看 Metrics 2.0，其实 Metrics 2.0 也就只是多了 Tags 的概念，这里同样省略了 Timestamp。

这是 OpenTSDB 风格的数据描述。

```java
{  "metric": "login.counter",
   "tags": {
   "result": "success",
   "platform": "h5"
   },
   "timestamp": 1560597254000,
   "value": 100
}
```

这是 Prometheus 的描述方式。

```java
temperature{city="hangzhou"}=29
```

这是对应的 lookout-client 的埋点代码。

```java
Registry registry = …;
Id loginCounter = registry.createId("login.counter");
Id id = loginCounter.withTags(
   "result", "success",
   "platform", "ios"
);
registry.counter(reqId).increment();
```

可以看到它们都显式支持了 Metrics 2.0 的概念。

这里我们花了点时间强调传统 Metrics 与 Metrics 2.0版本的区别，主要是想强调合理使用 Name 和 Tags，避免将 Tags 都编码在 Name 里的传统做法。现在基本上流行的开源时序数据库都通过自己的方式支持了Metrics 2.0 的概念。

## 2 SOFALookout 的客户端使用

介绍完前置知识之后，我们开始第二部分：SOFALookout 的客户端使用。

lookout-client 是 JVM 平台上的 Metrics 埋点客户端。下图是 lookout-client 的包结构：

![lookout-client 的包结构](https://cdn.nlark.com/yuque/0/2019/png/226702/1561626725872-d9cc12b5-8c12-40f4-9b8c-e5a9d655b06f.png)

API 包包含接口模型和空实现。API 包列出了一些重要的类，前 4 个是常见的 Metrics 数据模型。Registry 用于直接管理 Metrics，是 Metrics 的容器。Observer 负责观察 Registry，比如定期将 Registry 的整个快照数据导出到控制台或者是存储层，仅依赖 API 包就可以编程。此时用的是空实现，需要引入实现包，这样才能真正导出数据。最后，扩展包里则包含收集常见指标的实现， 比如 CPU 内存信息。

接下来我将演示 SOFALookout 客户端的使用。我会使用开源的 lookout-client，介绍 SOFALookout 里几个基本概念和它们的使用，在整个过程中还会讨论 Tags 的合理使用。

SOFALookout 客户端的相关演示操作可以在**文末获取 Demo 地址以及演示视频查看地址**。

## 3 SOFALookout 的服务端使用

第三部分是 SOFALookout 的服务端使用。整个服务端有 2 个应用：Gateway（多协议的数据收集与处理设计与实实现）和 Server（PromQL 与多种存储层的设计与实现）。各个客户端将数据上报到 Gateway，Gateway 进行处理，然后落库。Server 则负责对外提供查询服务。

### 3.1 Gateway - 多协议的数据收集与处理设计与实现

我们来仔细看一下 Gateway 的设计与实现，下图表明了数据的流动方向：

![Gateway 数据流动方向](https://cdn.nlark.com/yuque/0/2019/png/226702/1561626725858-fe81f731-d1e9-4267-ac66-0b027e0a8044.png)

Gateway 负责收集数据，适配了多种协议。通常只要是支持 Metrics2.0 概念的协议都可以进行适配。这部分是由 Importer 负责的，目前主要是客户端主动上报数据为主。如果是像普罗米修斯的拉模式的话，则需要和服务发现系统或部署平台打通，这个目前暂时没有支持。

Gateway 还会负责数据的基本清洗，比如过滤掉一些已知的坏数据。这里使用的是管道过滤器模式, 所以我们可以很容易加入一个新的切面逻辑.

经过各种过滤器之后, 数据到达了 exporter 适配器，它负责将数据写入多种存储。

### 3.2 Server - PromQL 与多种存储层的设计与实现

下面是 Server 的设计与实现，下图表明了数据的流动方向：

![Server 数据流动方向](https://cdn.nlark.com/yuque/0/2019/png/226702/1561626725874-28cca842-8202-4178-8cea-823157d8344a.png)

Server 提供了与普罗米修斯一致的 HTTP API，它负责分析收到的 PromQL 语句，然后执行，在取数据的地方适配底层存储。

由于 Server 是计算与存储分离的架构，因此需要注意将一些聚合计算下推到存储层，而不是将原始数据取到内存里再进行计算，否则会很慢。

这里我提一下为什么我们选择适配普罗米修斯的 API，而不是其他时序数据库的 API：其中一个重要原因是它的查询能力明显比其他时序数据库的查询能力强大，也比较简洁，特别是在跨多个 Metrics 查询时。

举一个例子，假设我们有一个 Metrics 记录了成功数，有另一个 Metrics 记录了总数，想求成功率。显然就是两个Metrics 除一下就行了，比如下方的代码，就是表达了这个意思：

```java
sum(success{zone="..."}) by(service{zone="..."}) / sum(total{zone="..."}) by(service)
```

InfluxDB 的话，其实也可以做到，但前提是它需要将成功数和总数放在同一个 measurement 下，因此并不能对任意两个指标做四则运算。

OpenTSDB 的聚合查询能力则明显比较弱了，但好在它能支持同时查多个查询，实在无法处理的情况下可以取回来然后自己做计算。但是这个步骤前端的 grafana 并不能帮我们做掉。

当然 PromQL 的强大，这只是其中一方面，并不代表它就全面优与其他的 QL。

### 3.3 SOFALookout 服务端演示

下面，我来演示一下 SOFALookout 服务端的部署流程，以及演示整套系统从数据收集到展示的玩法。

为了演示流畅, 使用 Docker 来部署软件，我已经事先将要用到镜像拉到本地了。

预先拉取镜像：

```bash
docker image pull grafana/grafana && \
docker image pull elasticsearch:5.6 && \
docker image pull docker.io/xzchaoo/lookout-allinone:1.6.0-SNAPSHOT
```

再启动存储层, 这里用的是 ES：

```bash
docker run -d --name es -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" elasticsearch:5.6
```

执行 `docker logs -f es` 查看 es 的启动情况。

启动 SOFALookout，因为演示机是 mac， Docker 的 host 网络模式无法正常工作，而 SOFALookout 默认连接到 localhost 的 es，这会导致错误，因此需要覆盖参数。

我们需要创建一个配置文件, 比如 foo.properties，有如下内容：

```properties
gateway.metrics.exporter.es.host=es
metrics-server.spring.data.jest.uri=http://es:9200
```

然后启动SOFALookout容器, 将该配置文件挂到指定路径, 并且使用 Docker 的 link 参数来引用 es 容器的地址：

```bash
docker run -it \
--name allinone \
--link es:es \
-e TZ='Asia/Shanghai' \
-p 7200:7200 \
-p 9090:9090 \
-v $PWD/foo.properties:/home/admin/deploy/foo.properties \
-e JAVA_OPTS="-Duser.timezone=Asia/Shanghai -Dlookoutall.config-file=/home/admin/deploy/foo.properties" \
docker.io/xzchaoo/lookout-allinone:1.6.0-SNAPSHOT
```

最后启动 grafana，同样使用了 link 参数：

```bash
docker run --name grafana -d -p 3000:3000 --link allinone:allinone grafana/grafana
```

SOFALookout 启动之后可以访问其 9090 端口，我们打开 <http://localhost:9090> ，有一个简单的控制台, 我们搜索一个 Metrics： `jvm.classes.loaded{app="*"}`，这是 lookout-client 扩展包自动采集的数据。执行之前写的 lookut-client demo 程序，此时应该有几个点的数据了，需要等一段时间数据点才会更多，这段时间内我们可以先到 grafana 上探索一下。

## 4 SOFALookout 发展规划

最后是 SOFALookout 的发展规划：

![SOFALookout 发展规划](https://cdn.nlark.com/yuque/0/2019/png/226702/1561626725874-7ed270d4-b489-4448-a31b-7fbfcee30b65.png)

近期，对于 SOFALookout 开源版本主要是以完善适配为主，包括计算下推到 E，和适配其他时序数据库。之后，我们也会开源关于 Trace 数据的处理模块。

以上内容由 SOFAChannel#6 直播分享整理，如果大家有疑问可以在钉钉群（搜索群号即可加入：23195297）或者 Github 上与我们讨论交流，我们将进行解答。也欢迎大家一起参与共建呀~

SOFALookout：[https://github.com/sofastack/sofa-lookout](https://github.com/sofastack/sofa-lookout)

## 文中提到的相关链接

- [蚂蚁金服轻量级监控分析系统 SOFALookout 服务端开源](https://mp.weixin.qq.com/s/Ql34eGaUrpm9St0yb1-hFw)
- SOFALookout Demo [下载地址](https://github.com/sofastack/sofa-lookout/tree/master/samples/metrics/client)

### 本期视频回顾以及 PPT 查看地址

[https://tech.antfin.com/community/live/687](https://tech.antfin.com/community/live/687)

### 往期直播精彩回顾

- 给研发工程师的代码质量利器 | SOFAChannel#5 直播整理：[https://tech.antfin.com/community/live/552](https://tech.antfin.com/community/live/552)
- 分布式事务 Seata TCC 模式深度解析 | SOFAChannel#4 直播整理：[https://tech.antfin.com/community/live/462](https://tech.antfin.com/community/live/462)
- SOFAChannel#3 SOFARPC 性能优化实践（下）：[https://tech.antfin.com/community/live/245](https://tech.antfin.com/community/live/245)
- SOFAChannel#2 SOFARPC 性能优化实践（上）：[https://tech.antfin.com/community/live/244](https://tech.antfin.com/community/live/244)
- SOFAChannel#1 从蚂蚁金服微服务实践谈起：[https://tech.antfin.com/community/live/148](https://tech.antfin.com/community/live/148)