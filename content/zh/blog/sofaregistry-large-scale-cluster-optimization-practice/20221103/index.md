---
title: "SOFARegistry | 大规模集群优化实践"
authorlink: "https://github.com/sofastack"
description: "SOFARegistry | 大规模集群优化实践"
categories: "SOFARegistry"
tags: ["SOFARegistry"]
date: 2022-11-03T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ"
---

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e9de97a8e2d0469b95d8990621e3332c~tplv-k3u1fbpfcp-zoom-1.image)  

文｜李旭东

专注于 SOFARegistry 及其周边基础设施的开发与优化

本文 **7016** 字 阅读 **15** 分钟

## 1 前言

SOFARegistry 在蚂蚁内部迭代升级过程中，每年大促都会引来一些新的挑战，通过不断的优化这些在大规模集群遇到的性能瓶颈，我们总结出一些优化方案，来解决大规模集群遇到的性能问题。

通过阅读这篇文章，读者可以学习到一些 Java 和 Go 语言系统的优化技巧，在系统遇到瓶颈的时候，能够知道有哪些优化手段针对性的进行优化。

## 2 大规模集群的挑战

随着业务的发展，业务的实例数在不断增长，注册中心所需要承载的数据量也在快速的增长 ，以其中 1 个集群为例，2019 年的数据为基准数据，在 2020 年 pub 接近千万级。下图是该集群历年双 11 时的数据对比。  相比 2019 年双 11，2021 年双 11 接口级的 pub 增长 200%，sub 增长 80%。实例数和数据量的增长带来推送量的二次方形式的增长，SOFARegistry 每一年大促都会经历新的挑战。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/dacad9ffc03449c59772f4c2781a99da~tplv-k3u1fbpfcp-zoom-1.image)

比如，在某一年的新机房压测过程中，由于新机房规模特别大（普通机房的 4 倍），导致注册中心的推送压力变大了十倍多，出现了 ：  

**-** DataServer 的网络被打爆，导致大量数据变更没有及时通知到 Session ，推送延迟飙升；  

**-** 因为数据包过大， SessionServer 与客户端之间出现了大量的 channel overflow 推送失败，推送延迟飙升；  

**-** 由于实例数量过多，注册中心的推送包以及内部传输的数据包过大，很容易打满单机的网络处理上限，序列化数据也会占用大量的 CPU ；  

**-** 由于地址列表扩大了几倍，导致对应推送接收端 MOSN 也出现了问题，大量机器出现 OOM ， 出现大量 CPU 毛刺影响请求延迟；  

**-** 注册中心常见瞬间大量并发的请求，比如业务大规模重启，很容易导致瞬时注册中心自身处理能不足，如何进行限流，以及如何快速达到数据最终一致。

## 3 优化方案

针对上述大规模集群遇到的挑战，我们做了以下的优化方案：

### 3.1 横向扩展支撑大规模集群

在大规模集群场景下，单纯采用扩大机器规格的纵向扩展方式往往会遇到瓶颈，单机的配置是有上限的，超大的 heap gc 时也可能产生较高的暂停时间，而且恢复与备份会花费很长时间。

#### 3.1.1 双层数据架构进行数据分片

双层数据架构:  Session (会话层：分散链接)、Data （数据层：分散数据）来实现横线扩展的能力，通过对链接和数据进行分片，SOFARegistry 可以通过横向扩容很容易的支撑更大的集群。单机采用小规格的机器，在容灾以及恢复方面也可以取得很好的效果。  

SOFARegistry 的架构可以参见： *[https://www.sofastack.tech/blog/explore-sofaregistry-1-infrastructure/](https://www.sofastack.tech/blog/explore-sofaregistry-1-infrastructure/)*

### 3.2 应对瞬时大量请求

注册中心存在瞬时处理大量请求的场景，比如当在大量应用同时发生运维或者注册中心自身发生运维的时候，会有大量的注册请求发送到 Session 。  

同时有一些依赖注册中心的基础设施会通过变更发布数据到注册中心来通知到每一个订阅端。为了应对这种不可预见的瞬时大量请求变更，注册中心需要有一定的策略进行削峰。

#### 3.2.1 队列攒批处理

贴合蚂蚁的业务，为大规模集群而生，在大数据量，高并发写入下提供稳定的推送延迟，通过添加队列并进行攒批处理，提高吞吐量，对瞬间高并发请求进行削峰。  

举例：

**-** **Session 接收到大量 Publisher ，攒批发请求到 Data** **[1]**

a.利用 BlockingQueue 存储需要发送 的请求，同时会配置最大容量防止 OOM

b.独立的 Worker 线程从 BlockingQueue 中取出多个请求，创建多个 BlockingQueue 和 Worker 提高并发度

c.按照分片规则进行分组，打包成一个请求发往不同的 DataServer

**-** **Session 接收到大量 Subscriber ，聚合去重后创建推送任务** ****[2]****

a.Subscriber 存储到 Map<datainfoid, map> 的数据结构中，可以进行去重的避免短时间一个实例重复注册创建大量推送任务

b.定时从 Map 中取出 Subscribers ，进行分组创建推送任务

c.最大数据量是 Session 单机的所有 Subscriber ，容量可控 

**-** **用 Map 存储 DataServer 上发生变化数据的 DataInfoId ，聚合通知 Session 进行推送[3]**

a.短时间 DataServer 的数据可能变化多次，比如大量 Publisher ，数据修复定时任务等等

b.对这些数据变化记录 DataInfoId ， 短时间只会对 Session 通知一次变更创建推送任务

c.最大数据量是 Data 单机全部的 DataInfoId

**-** **用 Map 存储 PushTask 进行去重，避免数据连续变化触发大量推送任务[4]**

a.添加了 Map size 的检查，过多的推送任务会直接丢弃，防止 OOM

b.同样的推送任务高版本会替换掉低版本

### 3.3 减少网络通讯开销

#### 3.3.1 LocalCache

Session 和 Data 之间会有大量的数据通讯，通过添加 LocalCache 可以在不增加代码架构复杂度的前提下大幅度提升系统的性能。  

对于注册中心，服务数据可以通过 dataInfoId + version 唯一标识。Session 在创建推送任务时会从 Data 拉取最新的服务数据，利用 Guava 的 `LoadingCache` ,大量推送任务被创建时，缓存的利用率会比较高，可以减少很多从 Data 拉取数据的开销。

**-** **Session 利用 LoadingCache 从 Data 拉取数据[5]**

a.会传入创建推送任务时的版本（一般由 Data 的变更通知带过来）对比 Cache 内的数据是否足够新；

b.如果不够新，清理缓存后利用 LoadingCache 从 Data 拉取一次数据；

c. LoadingCache 会配置 maximumWeight 防止数据过多导致 OOM 。

#### 3.3.2 压缩推送

在集群规模比较大的时候，比如有一个应用发布了 100 个接口，每个接口的发布数据有 150B ，该应用有 8000 个实例，每个接口有 2w 订阅方。那么每次变更这个应用的机器造成的全量推送，每个推送包 1MB ， 累积需要发出 200w 个推送包，即使 Session 可以横向扩容到 100 台， Session 单机也需要在 7 秒内发出 20GB 的流量，严重阻塞 Session 的网络队列，也会很快打爆 netty buffer ，造成大量的推送失败，这么多推送包的序列化也会耗费 Session 大量的 CPU 。  

对于 Data ，如果 Session 的数量过多，每次变更需要给每台 Session 返回大量的大数据包，也会产生大量的出口流量，影响其他请求的成功率。  

由于每个实例发布的数据的相似度很高，几乎只有 IP 不一致，所以当采用压缩推送时压缩率会非常高，能压缩到 5% 的大小以下，此时 Session 的出口流量可以大幅度降低。  

SOFARegistry 内部有两个地方用到了压缩，并且都有压缩缓存，可以极大的减少序列化和压缩的 CPU 开销。  

Session 在开启压缩缓存后，压缩在 CPU 占比获得了大幅度的降低 (9% -> 0.5%）。  

对于 Data 由于数据包被提前序列化+压缩进行缓存，整体性能获得了大幅度的提升，可以轻松承载 300 台以上的 Session ，支撑亿级数据量的机房。  

**-** **Session 在创建推送包的时候进行了压缩加缓存[6]**  

**-** **Data 返回服务数据给 Session 的时候进行了压缩加缓存[7]**

### 3.4 面向错误设计

在实际生产环境中，机器故障是很常见的事情：物理机宕机、网络故障、 OOM ， 系统从设计上就需要考虑出错的场景能自动恢复。

#### 3.4.1 重试

在一个分布式系统中，失败是一个很常见的现象，比如因为网络或者机器变更等问题造成请求失败，通过添加重试队列，加入次数有限的重试可以极大程度上进行容错  

**-** **Data 变更通知 Session 失败会加入重试队列最多重试 3 次[8]**  

**-** **Session 推送给 Client 失败时会加入队列最多重试 3 次[9]**

#### 3.4.2 定时任务

然重试可以一定程度上提高成功率，但毕竟不能无限的重试。同时各个攒批操作本身也会有容量上限，瞬间大量的请求会造成任务被丢弃，因此就需要有定时任务来对因失败造成不一致的状态进行修复。  

简要介绍一下 SOFARegistry 内部相关的定时任务是如何设计，从而实现数据的最终一致性： 

**- 增量数据同步**

Session 作为客户端同步写入数据的角色，可以认为他的 pub/sub 数据是最最准确的整个数据的同步过程是一个单向流，利用定时任务做到最终一致性client -> Session -> dataLeader -> dataFollower

**-** **Data 定时 (默认 6s) 与所有的 Session 对比并同步 pub 数据[10]**    

a.作为 Session 发送到 Data 上的 pub、unpub、clientoff 等修改数据的请求失败的兜底措施

b.同时会在 slot leader 迁移到新的 Data 上或者 slot follower 升级成 slot leader 的时候主动发起一次同步，确保 slot 数据的完整性 

**-** **Data slot follower 定时(默认 3min) 与 Data slot leader 对比并同步 pub 数据[11]**

更详细的分析可以参考 *[https://www.sofastack.tech/projects/sofa-registry/code-analyze/code-analyze-data-synchronization/](https://www.sofastack.tech/projects/sofa-registry/code-analyze/code-analyze-data-synchronization/)*  

**- 推送补偿**

由于存在各种场景导致推送失败，下面每一个场景都会导致服务数据没有正确推送到每个客户端上    

a. Session 写入到 Data 失败

b. Data 写入数据后通知 Session 失败

c. Session 因为推送任务过多导致丢弃任务

d. Session 推送客户端失败，比如客户端 fgc ，或者网络波动  

**-** **Session 定时（默认 5s）与 Data 对比推送版本触发推送任务[12]**

a. Session 聚合所有 Subscriber 的 lastPushVersion ，发送到 Data

b. Data 会返回最新数据的 version

c. Session 通过对比 Data 的上数据的 version 来判断是否要触发推送任务

### 3.5 减少内存占用与分配

#### 3.5.1 WordCache

业务发送给注册中心的数据通常有大量的重复内容的 String ，比如接口名称，属性名称等等，这些字符串占用了注册中心很大一部分的内存空间。  

SOFARegistry 内会利用 WordCache 进行对这些字符串进行复用，采用 guava 的  WeakInterner 实现。通过 WordCache ，可以大大减轻常驻内存的压力。  

```java

public final class WordCache {
    private static final Interner < String > interners = Interners.newWeakInterner();
    public static String getWordCache(String s) {
        if (s == null) {
           return null;
        }
        return interners.intern(s);
    }
}
public final class PublisherUtils {
    public static Publisher internPublisher(Publisher publisher) {
        ...        
        publisher.setDataId(publisher.getDataId());
        ...
        return publisher;
     }
}
public abstract class BaseInfo implements Serializable, StoreData < String > {
    public void setDataId(String dataId) {
        this.dataId = WordCache.getWordCache(dataId);
    }
}
```

#### 3.5.2 临时对象复用*

对于高频使用场景，对象复用对内存优化是比较大的。 

举例：

**-** 使用了 ThreadLocal 来对 StringBuilder 进行复用，对于高并发场景，能减少很多临时内存的分配；  

**-** 下面的代码中 join 重载了多份，而没有使用 `join(String... es)` 这种的写法，也是因为避免函数调用的时候需要临时分配一个 array 。

```java

public final class ThreadLocalStringBuilder {
private static final int maxBufferSize = 8192;    
private static final transient ThreadLocal < StringBuilder > builder =        ThreadLocal.withInitial(() - > new StringBuilder(maxBufferSize));
    private ThreadLocalStringBuilder() {}
    public static StringBuilder get() {
    StringBuilder b = builder.get();
    if (b.capacity() > maxBufferSize) {
    b = new StringBuilder(maxBufferSize);
    builder.set(b);
    } 
    else {
    b.setLength(0);
    }
    return b;
    }
    public static String join(String e1, String e2) {
    StringBuilder sb = get();
    sb.append(e1).append(e2);
    return sb.toString();
    }
    public static String join(String e1, String e2, String e3) {
    StringBuilder sb = get();
    sb.append(e1).append(e2).append(e3);
    return sb.toString();
    }
...
}
```

### 3.6 线程池死锁

#### 3.6.1 独立 Bolt 线程池

根据请求类型不同拆分线程池可以大幅度提高抗并发的能力，SOFARegistry 内分了多个独立的线程池，不同请求和事件使用同一个线程池处理，造成死锁：

**- Session**    

a. accessDataExecutor : 处理来自注册中心客户端的请求

b. dataChangeRequestExecutor ：处理 data 通知变更

c. dataSlotSyncRequestExecutor : 处理 data 向 Session 发起同步的请求

...

**- data**

a. publishProcessorExecutor : 处理 Session 写数据的请求

b. getDataProcessorExecutor : 处理 Session 拉取数据的请求

...

#### 3.6.2 KeyedThreadPoolExecutor

代码[13]对于一个线程池内，可以对 task 添加 key ，比如推送用的线程池，按照推送的 IP 地址作为 key ， 避免对一个客户端短时间产生过多的推送。

```java

public class KeyedThreadPoolExecutor {
private static final Logger LOGGER = LoggerFactory.getLogger(KeyedThreadPoolExecutor.class);
private final AbstractWorker[] workers;
protected final String executorName;
protected final int coreBufferSize;
protected final int coreSize;
    public < T extends Runnable > KeyedTask < T > execute(Object key, T runnable) {
    KeyedTask task = new KeyedTask(key, runnable);
    AbstractWorker w = workerOf(key);
    // should not happen, 
    if (!w.offer(task)) { 
    throw new FastRejectedExecutionException( 
    String.format(
    "%s_%d full, max=%d, now=%d", executorName, w.idx, coreBufferSize, w.size()));
    }
   w.workerCommitCounter.inc();
    return task;
    }
}

```

### 3.7 其他常见优化

#### 3.7.1 倒排索引

SOFARegistry 内对部分数据需要按某些属性进行查找，比如根据 IP 查询发布和订阅的数据，用于业务运维时的提前摘流，Session 单机往往包含了接近百万的数据量，如果每次查询都需要遍历全量数据集，在高频场景，这个开销是无法接受的。  

因此 SOFARegistry 内设计了一个简单高效的倒排索引来做根据 IP 查询这件事，可以提高成千上万倍的摘流性能，能够支撑上千 Pod 同时运维。

详细分析可以参考：

*[https://www.sofastack.tech/projects/sofa-registry/code-analyze/code-analyze-data-inverted-index/](https://www.sofastack.tech/projects/sofa-registry/code-analyze/code-analyze-data-inverted-index/)*

#### 3.7.2 异步日志

SOFARegistry 内部的日志输出量是比较大的，每一个推送变更都在各个阶段都会有日志，各个组件之间的交互也有详细明确的错误日志，用于自动化诊断系统对系统进行自愈。

异步日志输出相对同步日志会带来很大的性能提升。

SOFARegistry 是一个基于 SpringBoot 的项目，之前是采用默认的 logback 作为日志输出组件，在某次故障注入压测后，发现 logback AsyncAppender 的一个 bug[14] ， 在磁盘注入故障时，logback 因为类加载失败导致异步输出线程挂掉了，在 Error 级别日志队列被打满整个进程进入卡死的状态，所有的线程全部卡在 Logger 上，所以在新版本中改成了采用 log4j2 async logger[15] 的实现。

### 3.8 异常带来的额外开销

#### 3.8.1 hessian 反序列化

下图为我们在某次压测中的火焰图，发现大量的 CPU 消耗在 hessian 解析失败触发的异常上：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e9815a92e7f343ff83051044efa61f08~tplv-k3u1fbpfcp-zoom-1.image)

经排查，是我们的响应包里的 List 使用了 `Collections.unmodifiableList`, hessian 无法构造 `UnmodifiableList` 会降级到 `ArrayList` ，但降级过程会抛出异常导致耗费了大量的 CPU 。

#### 3.8.2  fillInStackTrace

在某些高频调用的地方 throw Exception ,  Throwable 默认的 fillInStackTrace 开销很大：

```java

public class Throwable implements Serializable {
public synchronized Throwable fillInStackTrace() {
if (stackTrace != null ||
backtrace != null /* Out of protocol state */ ) {
fillInStackTrace(0);
stackTrace = UNASSIGNED_STACK;
} 
return this;
    }
}

```

建议 override 掉 fillInStackTrace 方法，比如线程池的 RejectedExecutionException ,  

```java

public class FastRejectedExecutionException extends RejectedExecutionException {
public FastRejectedExecutionException(String message) {
super(message);
  }
  @Override  public Throwable fillInStackTrace() {
  // not fill the stack trace    return this;
  }
}

```

### 3.9 Client 优化技巧

大规模集群时，不光是注册中心，注册中心客户端乃至更上层的逻辑也会遇到瓶颈，蚂蚁内部主要的场景是 MOSN ，下面介绍一些在 SOFARegistry 迭代过程中 Go 语言相关的优化技巧。

#### 3.9.1 对象复用

**- 解析 URL 参数优化**

SOFARPC 框架下，发布到注册中心的数据是 url 格式，MOSN 端在接收到注册中心推送的时候就需要解析 url 参数，采用 go 标准库的 `url.Values` 解析大量的 url 在 CPU 和 alloc 方面都不佳，替换成基于 sync.Pool 实现，可以进行对象复用的 `fasthttp.Args` 可以减少大量的 CPU 和 alloc 开销。

**- 局部 slice 内存复用**go 的 slice 设计十分精巧， 通过 `a = a[:0]`可以很轻松的复用一个 slice 底层 array 的内存空间，在高频场景下，一个局部变量的复用能节省很多的内存开销：

*[https://github.com/mosn/mosn/pull/1794/files](https://github.com/mosn/mosn/pull/1794/files)*

#### 3.9.2 string hash

代码中，很常见对一个 string 计算 Hash ，如果采用标准库，由于入参大多为为 `[]byte`，因此需要做 `[]byte(s)` 把 string 转化为 `[]byte`, 而这一步往往比部分 Hash 算法本身的开销还高。

可以通过开发额外的直接对 string 计算 Hash 的函数来优化，比如 fnv Hash 对应的优化库：*[https://github.com/segmentio/fasthash](https://github.com/segmentio/fasthash)*

#### 3.9.3 减少字符串拼接

在采用多个 string 共同作为 map 的 key 的时候，常见把这几个字符串拼接成一个字符串作为 key ，此时可以采用定义一个 struct 作为 key 的方式来减少临时的内存分配。

```java
key1 := s1 + s2 + s3

```

```java

type  Key struct{
s1 string 
s2 string
s3 string
}

```

#### 3.9.4 Bitmap

bitmap 作为一个很常见的优化手段，在合适的场景进行使用在 CPU 以及 memory 方面都会有比较大的改善。  

MOSN 的代码中就有利用 bitmap 优化用于路由匹配的 subsetLoadbalancer 的案例，大大降低了注册中心推送期间 MOSN 变更的开销，详细可以看：  

*[https://www.sofastack.tech/blog/build-subset-optimization/](https://www.sofastack.tech/blog/build-subset-optimization/)*  

*[https://github.com/mosn/mosn/pull/2010](https://github.com/mosn/mosn/pull/2010)*

#### 3.9.5 Random

golang 标准库 `math/rand` 提供的是一个非线程安全的随机种子，为了在并发场景使用他，需要加上互斥锁，而互斥锁会带来比较大的开销。

对于随机种子安全要求不高，但性能要求比较高的场景下，有其他的两个选择:  

**-** *[https://github.com/valyala/fastrand](https://github.com/valyala/fastrand)*  

使用 sync.Pool 实现，支持并发使用无需加锁;  

**-** *[https://github.com/golang/go/blob/master/src/runtime/stubs.go#L154](https://github.com/golang/go/blob/master/src/runtime/stubs.go#L154)*  

go runtime 的非导出方法，threadlocal 的实现，直接使用 runtime 内的 m.fastrand 属性

使用 link 指令可以进行导出

```java
//go:linkname FastRandN runtime.fastrandn
func FastRandN(n uint32) uint32
```

对比一下这 3 个 rand 的性能

```java

BenchmarkRand
BenchmarkRand/mutex_rand
BenchmarkRand/mutex_rand-12           16138432          75.3ns/op
BenchmarkRand/fast_rand
BenchmarkRand/fast_rand-12            227684223           5.32 ns/op
BenchmarkRand/runtime_rand
BenchmarkRand/runtime_rand-12         1000000000           0.561 ns/op
PASS

```

相比标准库的 math.rand ,  runtime.fastrandn 如此的快，因为他直接使用了go runtime 中 m.fastrand 作为种子，没有加锁操作，是 threadlocal 的实现，对于  randn 的取模操作也进优化，改用乘加移位实现 ： *[https://lemire.me/blog/2016/06/27/a-fast-alternative-to-the-modulo-reduction](https://lemire.me/blog/2016/06/27/a-fast-alternative-to-the-modulo-reduction)*

## 4 总结与展望

最新版本的 SOFARegistry ，通过上述优化，我们支撑起了千万级别数据量的集群的服务发现，整体资源开销相比于老版本也有了很大的下降，当然未来还有一些优化点：

**-** 由于大量的使用了固定延迟的批处理，导致推送延迟还是偏高，推送变更延迟会有 5s 左右，而市面上常见的注册中心 watch 的延迟一般在 1s 以下，未来希望可以通过识别数据量，减少批处理的固定延迟，减少整体变更推送延迟。

**-** 目前对于单机房注册中心的规模支撑已经完全无压力，但后续 SOFARegistry 会支持多机房数据同步的功能，这部分功能在生产落地还需要我们继续优化 SOFARegistry 的性能。

## 5 相关链接

[1]Session 接收到大量 Publisher ，攒批发请求到 Data：

*[https://github.com/sofastack/sofa-registry/blob/d9ca139595f6cc5b647f53297db7be8c14390c2b/server/server/session/src/main/java/com/alipay/sofa/registry/server/session/node/service/DataNodeServiceImpl.java#L108](https://github.com/sofastack/sofa-registry/blob/d9ca139595f6cc5b647f53297db7be8c14390c2b/server/server/session/src/main/java/com/alipay/sofa/registry/server/session/node/service/DataNodeServiceImpl.java#L108)*

[2]Session 接收到大量 Subscriber ，聚合去重后创建推送任务:

*[https://github.com/sofastack/sofa-registry/blob/d9ca139595f6cc5b647f53297db7be8c14390c2b/server/server/session/src/main/java/com/alipay/sofa/registry/server/session/push/RegProcessor.java#L54](https://github.com/sofastack/sofa-registry/blob/d9ca139595f6cc5b647f53297db7be8c14390c2b/server/server/session/src/main/java/com/alipay/sofa/registry/server/session/push/RegProcessor.java#L54)*

[3]用 Map 存储 DataServer 上发生变化数据的 DataInfoId ，聚合通知 Session 进行推送

*[https://github.com/sofastack/sofa-registry/blob/d9ca139595f6cc5b647f53297db7be8c14390c2b/server/server/data/src/main/java/com/alipay/sofa/registry/server/data/change/DataChangeEventCenter.java#L112](https://github.com/sofastack/sofa-registry/blob/d9ca139595f6cc5b647f53297db7be8c14390c2b/server/server/data/src/main/java/com/alipay/sofa/registry/server/data/change/DataChangeEventCenter.java#L112)*

[4]用 Map 存储 PushTask 进行去重，避免数据连续变化触发大量推送任务

*[https://github.com/sofastack/sofa-registry/blob/d9ca139595f6cc5b647f53297db7be8c14390c2b/server/server/session/src/main/java/com/alipay/sofa/registry/server/session/push/PushTaskBuffer.java#L51](https://github.com/sofastack/sofa-registry/blob/d9ca139595f6cc5b647f53297db7be8c14390c2b/server/server/session/src/main/java/com/alipay/sofa/registry/server/session/push/PushTaskBuffer.java#L51)*

[5]Session 利用 LoadingCache 从 Data 拉取数据

*[https://github.com/sofastack/sofa-registry/blob/d9ca139595f6cc5b647f53297db7be8c14390c2b/server/server/session/src/main/java/com/alipay/sofa/registry/server/session/push/FirePushService.java](https://github.com/sofastack/sofa-registry/blob/d9ca139595f6cc5b647f53297db7be8c14390c2b/server/server/session/src/main/java/com/alipay/sofa/registry/server/session/push/FirePushService.java)*

[6]Session 在创建推送包的时候进行了压缩加缓存

*[https://github.com/sofastack/sofa-registry/blob/d9ca139595f6cc5b647f53297db7be8c14390c2b/server/server/session/src/main/java/com/alipay/sofa/registry/server/session/converter/pb/ReceivedDataConvertor.java#L81](https://github.com/sofastack/sofa-registry/blob/d9ca139595f6cc5b647f53297db7be8c14390c2b/server/server/session/src/main/java/com/alipay/sofa/registry/server/session/converter/pb/ReceivedDataConvertor.java#L81)*

[7]Data 返回服务数据给 Session 的时候进行了压缩加缓存

*[https://github.com/sofastack/sofa-registry/blob/d9ca139595f6cc5b647f53297db7be8c14390c2b/server/server/shared/src/main/java/com/alipay/sofa/registry/server/shared/util/DatumUtils.java#L149](https://github.com/sofastack/sofa-registry/blob/d9ca139595f6cc5b647f53297db7be8c14390c2b/server/server/shared/src/main/java/com/alipay/sofa/registry/server/shared/util/DatumUtils.java#L149)*

[8]Data 变更通知 Session 失败会加入重试队列最多重试3次

*[https://github.com/sofastack/sofa-registry/blob/d9ca139595f6cc5b647f53297db7be8c14390c2b/server/server/data/src/main/java/com/alipay/sofa/registry/server/data/change/DataChangeEventCenter.java#L199](https://github.com/sofastack/sofa-registry/blob/d9ca139595f6cc5b647f53297db7be8c14390c2b/server/server/data/src/main/java/com/alipay/sofa/registry/server/data/change/DataChangeEventCenter.java#L199)*

[9]Session 推送给 Client 失败时会加入队列最多重试3次

*[https://github.com/sofastack/sofa-registry/blob/d9ca139595f6cc5b647f53297db7be8c14390c2b/server/server/session/src/main/java/com/alipay/sofa/registry/server/session/push/PushProcessor.java#L494](https://github.com/sofastack/sofa-registry/blob/d9ca139595f6cc5b647f53297db7be8c14390c2b/server/server/session/src/main/java/com/alipay/sofa/registry/server/session/push/PushProcessor.java#L494)*

[10]Data 定时 (默认 6s ) 与所有的 Session 对比并同步 pub 数据

*[https://github.com/sofastack/sofa-registry/blob/d9ca139595f6cc5b647f53297db7be8c14390c2b/server/server/data/src/main/java/com/alipay/sofa/registry/server/data/slot/SlotManagerImpl.java#L374](https://github.com/sofastack/sofa-registry/blob/d9ca139595f6cc5b647f53297db7be8c14390c2b/server/server/data/src/main/java/com/alipay/sofa/registry/server/data/slot/SlotManagerImpl.java#L374)*

[11]Data slot follower 定时(默认 3min) 与 Data slot leader 对比并同步 pub 数据

*[https://github.com/sofastack/sofa-registry/blob/d9ca139595f6cc5b647f53297db7be8c14390c2b/server/server/data/src/main/java/com/alipay/sofa/registry/server/data/slot/SlotManagerImpl.java#L376](https://github.com/sofastack/sofa-registry/blob/d9ca139595f6cc5b647f53297db7be8c14390c2b/server/server/data/src/main/java/com/alipay/sofa/registry/server/data/slot/SlotManagerImpl.java#L376)*

[12]Session 定时（默认 5s ）与 Data 对比推送版本触发推送任务

*[https://github.com/sofastack/sofa-registry/blob/d9ca139595f6cc5b647f53297db7be8c14390c2b/server/server/session/src/main/java/com/alipay/sofa/registry/server/session/registry/SessionRegistry.java#L360](https://github.com/sofastack/sofa-registry/blob/d9ca139595f6cc5b647f53297db7be8c14390c2b/server/server/session/src/main/java/com/alipay/sofa/registry/server/session/registry/SessionRegistry.java#L360)*

[13]代码

*[https://github.com/sofastack/sofa-registry/blob/d9ca139595f6cc5b647f53297db7be8c14390c2b/server/common/util/src/main/java/com/alipay/sofa/registry/task/KeyedThreadPoolExecutor.java#L176](https://github.com/sofastack/sofa-registry/blob/d9ca139595f6cc5b647f53297db7be8c14390c2b/server/common/util/src/main/java/com/alipay/sofa/registry/task/KeyedThreadPoolExecutor.java#L176)*

[14]bug

*[https://jira.qos.ch/projects/LOGBACK/issues/LOGBACK-1358?filter=allopenissues](https://jira.qos.ch/projects/LOGBACK/issues/LOGBACK-1358?filter=allopenissues)*

[15]log4j2 async logger

*[https://github.com/sofastack/sofa-registry/blob/d9ca139595f6cc5b647f53297db7be8c14390c2b/server/distribution/all/bin/base/start_base.sh#L24](https://github.com/sofastack/sofa-registry/blob/d9ca139595f6cc5b647f53297db7be8c14390c2b/server/distribution/all/bin/base/start_base.sh#L24)*

**本周推荐阅读**

[SOFARegistry 源码｜数据分片之核心-路由表 SlotTable 剖析](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247506478&idx=1&sn=ead477db9b27282d7d256e97a6dd0160&chksm=faa335f4cdd4bce24b9e388bb6456621628c056a87e141f761d2d51a4cd533ec82ad8167f8f7&scene=21#wechat_redirect)

[探索 SOFARegistry（一）｜基础架构篇](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247502139&idx=1&sn=015419fdc360c07030cf147cbfb1cf2f&chksm=faa326e1cdd4aff71d498bbdcdf3e2bf83e53a7a0cfc6c01ff123860e074d199411191b3ea13&scene=21#wechat_redirect)

[SOFARegistry 源码｜数据同步模块解析](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247511796&idx=1&sn=14045ed1b3e634061e719ef434816abf&chksm=faa3412ecdd4c83808c5945af56558fe157395b21bc0d56665e102edb92316c6f245f94d306c&scene=21#wechat_redirect)

[直播预告 | SOFAChannel#30《Nydus 开源容器镜像加速服务的演进与未来》](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247516955&idx=1&sn=85dbd9fae42df3c4a6d96eb712aac250&chksm=faa36cc1cdd4e5d74ee6aeaa887070b4854703dbe2ecc430e2af1acf11b9b1226d5d12a801af&scene=21#wechat_redirect)
