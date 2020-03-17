---
title: "蚂蚁金服分布式链路跟踪组件 SOFATracer 中 Disruptor 实践（含源码）"
author: "卫恒"
authorlink: "http://www.glmapper.com/"
description: "本文将对 SOFATracer 中使用 Disruptor 来进行日志输出的代码进行了具体的分析。"
categories: "SOFATracer"
tags: ["SOFATracer"]
date: 2020-03-17T18:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2020/png/226702/1584441374916-be2fe746-58fe-4bcb-8129-3b9f3e3e5541.png"
---

> **SOFA**Stack（**S**calable **O**pen **F**inancial **A**rchitecture Stack）是蚂蚁金服自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，是在金融场景里锤炼出来的最佳实践。
> 
> SOFATracer 是一个用于分布式系统调用跟踪的组件，通过统一的 TraceId 将调用链路中的各种网络调用情况以日志的方式记录下来，以达到透视化网络调用的目的，这些链路数据可用于故障的快速发现，服务治理等。
> 
> SOFATracer：[https://github.com/sofastack/sofa-tracer](https://github.com/sofastack/sofa-tracer)

## Disruptor 简介

Disruptor 旨在在异步事件处理体系结构中提供低延迟，高吞吐量的工作队列。它确保任何数据仅由一个线程拥有以进行写访问，因此与其他结构相比，减少了写争用。目前，包括 Apache Storm、Camel、Log4j 2 在内的很多知名项目都应用了 Disruptor 以获取高性能。

SOFATracer 也是基于 [Disruptor](https://github.com/LMAX-Exchange/disruptor) 高性能无锁循环队列来提供异步打印日志到本地磁盘能力的，SOFATracer 提供两种类似的日志打印类型即摘要日志和统计日志，摘要日志：每一次调用均会落地磁盘的日志；统计日志：每隔一定时间间隔进行统计输出的日志；无论是哪种日志的输出，对于 SOFATracer 来说都需要保证较高的性能，以降低对于业务整体流程耗时的影响。

关于 Disruptor 的 一些原理分析可以参考：[Disruptor](https://ifeve.com/disruptor/) 。

> A High Performance Inter-Thread Messaging Library 高性能的线程间消息传递库

## 案例

先通过 Disruptor 的一个小例子来有个直观的认识；先看下它的构造函数：

```java
public Disruptor(
        final EventFactory<T> eventFactory,
        final int ringBufferSize,
        final ThreadFactory threadFactory,
        final ProducerType producerType,
        final WaitStrategy waitStrategy)
{
    this(
        RingBuffer.create(producerType, eventFactory, ringBufferSize, waitStrategy),
        new BasicExecutor(threadFactory));
}
```

- eventFactory : 在环形缓冲区中创建事件的 factory；
- ringBufferSize:环形缓冲区的大小，必须是2的幂；
- threadFactory：用于为处理器创建线程；
- producerType：生成器类型以支持使用正确的sequencer和publisher创建RingBuffer；枚举类型，SINGLE、MULTI两个项。对应于 SingleProducerSequencer和MultiProducerSequencer两种Sequencer；
- waitStrategy : 等待策略；

如果我们想构造一个 disruptor，那么我们就需要上面的这些组件。从 eventFactory 来看，还需要一个具体的 Event 来作为消息事件的载体。【下面按照官方给的案例进行简单的修改作为示例】

### 消息事件 LongEvent ，能够被消费的数据载体

```java
public class LongEvent {
    private long value;
    public void set(long value) {
        this.value = value;
    }
    public long getValue() {
        return value;
    }
}
```

### 创建消息事件的 factory

```java
public class LongEventFactory implements EventFactory<LongEvent> {
    @Override
    public LongEvent newInstance() {
        return new LongEvent();
    }
}
```

### ConsumerThreadFactory

```java
public class ConsumerThreadFactory implements ThreadFactory {
    private final AtomicInteger index = new AtomicInteger(1);
    @Override
    public Thread newThread(Runnable r) {
        return new Thread(r, "disruptor-thread-" + index.getAndIncrement());
    }
}
```

OK ，上面的这些可以满足创建一个 disruptor 了：

```java
private int ringBufferCapacity = 8;
//消息事件生产Factory
LongEventFactory longEventFactory = new LongEventFactory();
//执行事件处理器线程Factory
ConsumerThreadFactory consumerThreadFactory = new ConsumerThreadFactory();
//用于环形缓冲区的等待策略。
WaitStrategy waitStrategy = new BlockingWaitStrategy();

//构建disruptor
Disruptor<LongEvent> disruptor = new Disruptor<>(
    longEventFactory,
    ringBufferCapacity,
    longEventThreadFactory,
    ProducerType.SINGLE,
    waitStrategy);
```

现在是已经有了 disruptor 了，然后通过：start 来启动：

```java
//启动 disruptor
 disruptor.start();
```

到这里，已经构建了一个disruptor；但是目前怎么使用它来发布消息和消费消息呢？

### 发布消息

下面在 for 循环中 发布 5 条数据：

```java
RingBuffer<LongEvent> ringBuffer = disruptor.getRingBuffer();
for (long l = 0; l < 5; l++)
{
    long sequence = ringBuffer.next();
    LongEvent event = ringBuffer.get(sequence);
    event.set(100+l);
    System.out.println("publish event :" + l);
    ringBuffer.publish(sequence);
    Thread.sleep(1000);
}
```

消息已经发布，下面需要设定当前 disruptor 的消费处理器。前面已经有个 LongEvent 和 EventFactory ; 在 disruptor 中是通过 EventHandler 来进行消息消费的。

### 编写消费者代码

```java
public class LongEventHandler implements EventHandler<LongEvent> {
    @Override
    public void onEvent(LongEvent event, long sequence, boolean endOfBatch) throws Exception {
        System.out.println("Event: " + event.getValue()+" -> " + Thread.currentThread().getName());
        Thread.sleep(2000);
    }
}
```

将 eventHandler 设置到 disruptor 的处理链上：

```java
//将处理事件的事件处理程序 -> 消费事件的处理程序
LongEventHandler longEventHandler = new LongEventHandler();
disruptor.handleEventsWith(longEventHandler);
```

### 运行结果（这里）

```
publish event :0
Event: 0 -> disruptor-thread-1
-------------------------------->
publish event :1
Event: 1 -> disruptor-thread-1
-------------------------------->
publish event :2
Event: 2 -> disruptor-thread-1
-------------------------------->
publish event :3
Event: 3 -> disruptor-thread-1
-------------------------------->
publish event :4
Event: 4 -> disruptor-thread-1
-------------------------------->
```

## 基本概念和原理

### Disruptor

整个基于 ringBuffer 实现的生产者消费者模式的容器。主要属性：

```java
private final RingBuffer<T> ringBuffer;
private final Executor executor;
private final ConsumerRepository<T> consumerRepository = new ConsumerRepository<>();
private final AtomicBoolean started = new AtomicBoolean(false);
private ExceptionHandler<? super T> exceptionHandler = new ExceptionHandlerWrapper<>();
```

- ringBuffer：内部持有一个 RingBuffer 对象，Disruptor 内部的事件发布都是依赖这个 RingBuffer 对象完成的；
- executor：消费事件的线程池；
- consumerRepository：提供存储库机制，用于将 EventHandler 与 EventProcessor 关联起来；
- started : 用于标志当前 Disruptor 是否已经启动；
- exceptionHandler : 异常处理器，用于处理 BatchEventProcessor 事件周期中 uncaught exceptions；

### RingBuffer

环形队列【实现上是一个数组】，可以类比为 BlockingQueue 之类的队列，ringBuffer 的使用，使得内存被循环使用，减少了某些场景的内存分配回收扩容等耗时操作。

```java
public final class RingBuffer<E> extends RingBufferFields<E> 
implements Cursored, EventSequencer<E>, EventSink<E>
```

- E：在事件的交换或并行协调期间存储用于共享的数据的实现 -> 消息事件；

### Sequencer

RingBuffer 中生产者的顶级父接口，其直接实现有 SingleProducerSequencer 和 MultiProducerSequencer；对应 SINGLE、MULTI 两个枚举值。

![Sequencer](https://cdn.nlark.com/yuque/0/2020/png/226702/1584325942316-c50296fc-41b9-4b59-b8e0-34ffaa3da763.png#align=left&display=inline&height=768&originHeight=768&originWidth=1046&size=0&status=done&style=none&width=1046)

### EventHandler

事件处置器，改接口用于对外扩展来实现具体的消费逻辑。如上面 Demo 中的 LongEventHandler ;

```java
//回调接口，用于处理{@link RingBuffer}中可用的事件
public interface EventHandler<T> {
    void onEvent(T event, long sequence, boolean endOfBatch) throws Exception;
}
```

- event : RingBuffer 已经发布的事件；
- sequence : 正在处理的事件的序列号；
- endOfBatch : 用来标识否是来自 RingBuffer 的批次中的最后一个事件；

### SequenceBarrier

消费者路障，规定了消费者如何向下走。事实上，该路障算是变向的锁。

```java
final class ProcessingSequenceBarrier implements SequenceBarrier {
    //当等待（探测）的需要不可用时，等待的策略
    private final WaitStrategy waitStrategy;
    //依赖的其它Consumer的序号，这个用于依赖的消费的情况，
    //比如A、B两个消费者，只有A消费完，B才能消费。
    private final Sequence     dependentSequence;
    private volatile boolean   alerted = false;
    //Ringbuffer的写入指针
    private final Sequence     cursorSequence;
    //RingBuffer对应的Sequencer
    private final Sequencer    sequencer;
    //exclude method
}
```

waitStrategy 决定了消费者采用何种等待策略。

### WaitStrategy

> Strategy employed for making {[@link ]() EventProcessor}s wait on a cursor {[@link ]() Sequence}.


EventProcessor 的等待策略；具体实现在 disruptor 中有 8 种：

![在 disruptor 的8中具体实现](https://cdn.nlark.com/yuque/0/2020/png/226702/1584325942359-de8e1e42-6e96-468d-a67b-5bb2dd619649.png)

这些等待策略不同的核心体现是在如何实现 waitFor 这个方法上。

### EventProcessor

事件处理器，实际上可以理解为消费者模型的框架，实现了线程 Runnable 的 run 方法，将循环判断等操作封在了里面。该接口有三个实现类:

**1、BatchEventProcessor**

```java
public final class BatchEventProcessor<T> implements EventProcessor {
    private final AtomicBoolean           running          = new AtomicBoolean(false);
    private ExceptionHandler<? super T>   exceptionHandler = new FatalExceptionHandler();
    private final DataProvider<T>         dataProvider;
    private final SequenceBarrier         sequenceBarrier;
    private final EventHandler<? super T> eventHandler;
    private final Sequence                sequence         = new Sequence(                                      Sequencer.INITIAL_CURSOR_VALUE);
    private final TimeoutHandler          timeoutHandler;
    //exclude method
}
```

- ExceptionHandler：异常处理器；
- DataProvider：数据来源，对应 RingBuffer；
- EventHandler：处理 Event 的回调对象；
- SequenceBarrier：对应的序号屏障；
- TimeoutHandler：超时处理器，默认情况为空，如果要设置，只需要要将关联的 EventHandler 实现 TimeOutHandler 即可；

如果我们选择使用 EventHandler 的时候，默认使用的就是 BatchEventProcessor，它与 EventHandler 是一一对应，并且是单线程执行。

如果某个 RingBuffer 有多个 BatchEventProcessor，那么就会每个 BatchEventProcessor 对应一个线程。

**2、WorkProcessor**

```java
public final class WorkProcessor<T> implements EventProcessor {
    private final AtomicBoolean running = new AtomicBoolean(false);
    private final Sequence sequence = new Sequence(Sequencer.INITIAL_CURSOR_VALUE);
    private final RingBuffer<T> ringBuffer;
    private final SequenceBarrier  sequenceBarrier;
    private final WorkHandler<? super T> workHandler;
    private final ExceptionHandler<? super T> exceptionHandler;
    private final Sequence workSequence;

    private final EventReleaser eventReleaser = new EventReleaser() {
            @Override
            public void release() {
                sequence.set(Long.MAX_VALUE);
            }
    };
    private final TimeoutHandler timeoutHandler;
}
```

基本和 BatchEventProcessor 类似，不同在于用于处理 Event 的回调对象是 WorkHandler。

### 原理图

![原理图](https://cdn.nlark.com/yuque/0/2020/png/226702/1584325942377-8e0666a6-bd2c-40ee-b1b7-df4f9d5ae46f.png)

无消费者情况下，生产者保持生产，但是 remainingCapacity 保持不变。

在写 Demo 的过程中，本来想通过不设定消费者来观察 RingBuffer 可用容量变化的。但是验证过程中，一直得不到预期的结果，(注：没有设置消费者，只有生产者)，先看结果：

```
publish event :0
bufferSie:8
remainingCapacity:8
cursor:0
-------------------------------->
publish event :1
bufferSie:8
remainingCapacity:8
cursor:1
-------------------------------->
publish event :2
bufferSie:8
remainingCapacity:8
cursor:2
-------------------------------->
publish event :3
bufferSie:8
remainingCapacity:8
cursor:3
-------------------------------->
publish event :4
bufferSie:8
remainingCapacity:8
cursor:4
-------------------------------->
publish event :5
bufferSie:8
remainingCapacity:8
cursor:5
-------------------------------->
publish event :6
bufferSie:8
remainingCapacity:8
cursor:6
-------------------------------->
publish event :7
bufferSie:8
remainingCapacity:8
cursor:7
-------------------------------->
publish event :8
bufferSie:8
remainingCapacity:8
cursor:8
-------------------------------->
publish event :9
bufferSie:8
remainingCapacity:8
cursor:9
-------------------------------->
```

从结果来看，remainingCapacity 的值应该随着 发布的数量 递减的；但是实际上它并没有发生任何变化。

来看下 ringBuffer.remainingCapacity() 这个方法：

```java
/**
 * Get the remaining capacity for this ringBuffer.
 *
 * @return The number of slots remaining.
 */
public long remainingCapacity()
{
    return sequencer.remainingCapacity();
}
```

这里面又使用 sequencer.remainingCapacity() 这个方法来计算的。上面的例子中使用的是 ProducerType.SINGLE，那来看 SingleProducerSequencer 这个里面 remainingCapacity 的实现。

```java
@Override
public long remainingCapacity()
{
    //上次申请完毕的序列值
    long nextValue = this.nextValue;
    //计算当前已经消费到的序列值
    long consumed = Util.getMinimumSequence(gatingSequences, nextValue);
    //当前生产到的序列值
    long produced = nextValue;
    return getBufferSize() - (produced - consumed);
}
```

来解释下这段代码的含义：

假设当前 ringBuffer 的 bufferSize 是 8 ；上次申请到的序列号是 5，其实也就是说已经生产过占用的序列号是5；假设当前已经消费到的序列号是 3，那么剩余的容量为： 8-（5-2） = 5。

![代码解读](https://cdn.nlark.com/yuque/0/2020/png/226702/1584325942392-6516acd0-ccfe-4a87-8fa6-bfd786147479.png)

因为这里我们可以确定 bufferSize 和 produced 的值了，那么 remainingCapacity 的结果就取决于 getMinimumSequence 的计算结果了。

```java
public static long getMinimumSequence(final Sequence[] sequences, long minimum)
{
    for (int i = 0, n = sequences.length; i < n; i++)
    {
        long value = sequences[i].get();
        minimum = Math.min(minimum, value);
    }
    return minimum;
}
```

这个方法是从 Sequence 数组中获取最小序列 。如果 sequences 为空，则返回 minimum。回到上一步，看下 sequences 这个数组是从哪里过来的，它的值在哪里设置的。

```java
long consumed = Util.getMinimumSequence(gatingSequences, nextValue);
```

gatingSequences是 SingleProducerSequencer 父类  AbstractSequencer 中的成员变量：

```java
protected volatile Sequence[] gatingSequences = new Sequence[0];
```

gatingSequences 是在下面这个方法里面来管理的。

```java
/**
 * @see Sequencer#addGatingSequences(Sequence...)
 */
@Override
public final void addGatingSequences(Sequence... gatingSequences)
{
    SequenceGroups.addSequences(this, SEQUENCE_UPDATER, this, gatingSequences);
}
```

这个方法的调用栈向前追溯有这几个地方调用了：

![调用栈](https://cdn.nlark.com/yuque/0/2020/png/226702/1584325942367-a24899bc-63ca-4272-9afa-de1d379e93ab.png)

WorkerPool 来管理多个消费者；hangdlerEventsWith 这个方法也是用来设置消费者的。但是在上面的测试案例中我们是想通过不设定消费者只设定生成者来观察环形队列的占用情况，所以 gatingSequences 会一直是空的，因此在计算时会把 produced 的值作为 minimum 返回。这样每次计算就相当于：

```java
return getBufferSize() - (produced - produced) === getBufferSize();
```

也就验证了为何在不设定消费者的情况下，remainingCapacity 的值会一直保持不变。

## SOFATracer 中 Disruptor 实践

SOFATracer 中，AsyncCommonDigestAppenderManager 对 Disruptor 进行了封装，用于处理外部组件的Tracer摘要日志。该部分借助 AsyncCommonDigestAppenderManager 的源码来分析下 SOFATracer 如何使用Disruptor 的。

SOFATracer 中使用了两种不同的事件模型，一种是 SOFATracer 内部使用的 StringEvent , 一种是外部扩展使用的 SofaTacerSpanEvent。这里以 SofaTacerSpanEvent 这种事件模型来分析。StringEvent 消息事件模型对应的是 AsyncCommonAppenderManager 类封装的disruptor。

### SofaTracerSpanEvent ( -> LongEvent)

定义消息事件模型，SofaTacerSpanEvent 和前面 Demo 中的 LongEvent 基本结构是一样的，主要是内部持有的消息数据不同，LongEvent 中是一个 long 类型的数据，SofaTacerSpanEvent 中持有的是 SofaTracerSpan 。

```java
public class SofaTracerSpanEvent {
    private volatile SofaTracerSpan sofaTracerSpan;
    public SofaTracerSpan getSofaTracerSpan() {
        return sofaTracerSpan;
    }
    public void setSofaTracerSpan(SofaTracerSpan sofaTracerSpan) {
        this.sofaTracerSpan = sofaTracerSpan;
    }
}
```

### Consumer ( -> LongEventHandler)

Consumer 是 AsyncCommonDigestAppenderManager 的内部类；实现了 EventHandler 接口，这个 consumer 就是作为消费者存在的。

在 AsyncCommonAppenderManager 中也有一个，这个地方个人觉得可以抽出去，这样可以使得AsyncCommonDigestAppenderManager/AsyncCommonAppenderManager 的代码看起来更干净。

```java
private class Consumer implements EventHandler<SofaTracerSpanEvent> {
       //日志类型集合，非该集合内的日志类型将不会被处理
        protected Set<String> logTypes = Collections.synchronizedSet(new HashSet<String>());
        @Override
        public void onEvent(SofaTracerSpanEvent event, long sequence, boolean endOfBatch)
                                throws Exception {
            // 拿到具体的消息数据 sofaTracerSpan
            SofaTracerSpan sofaTracerSpan = event.getSofaTracerSpan();
            // 如果没有数据，则不做任何处理
            if (sofaTracerSpan != null) {
                try {
                    String logType = sofaTracerSpan.getLogType();
                    // 验证当前日志类型是否可以被当前consumer消费
                    if (logTypes.contains(logType)) {
                        // 获取编码类型
                        SpanEncoder encoder = contextEncoders.get(logType);
                        //获取 appender
                        TraceAppender appender = appenders.get(logType);
                        // 对数据进行编码处理
                        String encodedStr = encoder.encode(sofaTracerSpan);
                        if (appender instanceof LoadTestAwareAppender) {
                            ((LoadTestAwareAppender) appender).append(encodedStr,
                                TracerUtils.isLoadTest(sofaTracerSpan));
                        } else {
                            appender.append(encodedStr);
                        }
                        // 刷新缓冲区，日志输出
                        appender.flush();
                    }
                } catch (Exception e) {
                   // 异常省略
                }
            }
        }

        public void addLogType(String logType) {
            logTypes.add(logType);
        }
    }
```

### SofaTracerSpanEventFactory （-> LongEventFactory）

用于产生消息事件的 Factory。

```java
public class SofaTracerSpanEventFactory implements EventFactory<SofaTracerSpanEvent> {
    @Override
    public SofaTracerSpanEvent newInstance() {
        return new SofaTracerSpanEvent();
    }
}
```

### ConsumerThreadFactory (-> LongEventThreadFactory )

用来产生消费线程的 Factory。

```java
public class ConsumerThreadFactory implements ThreadFactory {
    private String workName;
    public String getWorkName() {
        return workName;
    }
    public void setWorkName(String workName) {
        this.workName = workName;
    }
    @Override
    public Thread newThread(Runnable runnable) {
        Thread worker = new Thread(runnable, "Tracer-AsyncConsumer-Thread-" + workName);
        worker.setDaemon(true);
        return worker;
    }
}
```

### 构建 Disruptor

Disruptor 的构建是在 AsyncCommonDigestAppenderManager 的构造函数中完成的。

```java
public AsyncCommonDigestAppenderManager(int queueSize, int consumerNumber) {
    // 使用这个计算来保证realQueueSize是2的次幂（返回当前 大于等于queueSize的最小的2的次幂数 ）
    int realQueueSize = 1 << (32 - Integer.numberOfLeadingZeros(queueSize - 1));
    //构建disruptor，使用的是 ProducerType.MULTI
    //等待策略是 BlockingWaitStrategy
    disruptor = new Disruptor<SofaTracerSpanEvent>(new SofaTracerSpanEventFactory(),
        realQueueSize, threadFactory, ProducerType.MULTI, new BlockingWaitStrategy());
    //消费者列表
    this.consumers = new ArrayList<Consumer>(consumerNumber);
    
    for (int i = 0; i < consumerNumber; i++) {
        Consumer consumer = new Consumer();
        consumers.add(consumer);
        //设置异常处理程序
        disruptor.setDefaultExceptionHandler(new ConsumerExceptionHandler());
        //绑定消费者
        disruptor.handleEventsWith(consumer);
    }

    //是否允许丢弃，从配置文件获取
    this.allowDiscard = Boolean.parseBoolean(SofaTracerConfiguration.getProperty(
        SofaTracerConfiguration.TRACER_ASYNC_APPENDER_ALLOW_DISCARD, DEFAULT_ALLOW_DISCARD));
    
    if (allowDiscard) {
        //是否记录丢失日志的数量
        this.isOutDiscardNumber = Boolean.parseBoolean(SofaTracerConfiguration.getProperty(
            SofaTracerConfiguration.TRACER_ASYNC_APPENDER_IS_OUT_DISCARD_NUMBER,
            DEFAULT_IS_OUT_DISCARD_NUMBER));
        //是否记录丢失日志的TraceId和RpcId
        this.isOutDiscardId = Boolean.parseBoolean(SofaTracerConfiguration.getProperty(
            SofaTracerConfiguration.TRACER_ASYNC_APPENDER_IS_OUT_DISCARD_ID,
            DEFAULT_IS_OUT_DISCARD_ID));
        //丢失日志的数量达到该阈值进行一次日志输出
        this.discardOutThreshold = Long.parseLong(SofaTracerConfiguration.getProperty(
            SofaTracerConfiguration.TRACER_ASYNC_APPENDER_DISCARD_OUT_THRESHOLD,
            DEFAULT_DISCARD_OUT_THRESHOLD));
        if (isOutDiscardNumber) {
            this.discardCount = new PaddedAtomicLong(0L);
        }
    }
}
```

### 启动 Disruptor

Disruptor 的启动委托给了 AsyncCommonDigestAppenderManager 的 start 方法来执行。

```java
public void start(final String workerName) {
    this.threadFactory.setWorkName(workerName);
    this.ringBuffer = this.disruptor.start();
}
```

来看下，SOFATracer 中具体是在哪里调用这个 start 的：

![调用 start](https://cdn.nlark.com/yuque/0/2020/png/226702/1584325942382-ba1fdf89-bc8b-4f9d-8f9e-7fe61f916306.png)

- CommonTracerManager : 这个里面持有了 AsyncCommonDigestAppenderManager 类的一个单例对象，并且是 static 静态代码块中调用了 start 方法；这个用来输出普通日志；
- SofaTracerDigestReporterAsyncManager：这里类里面也是持有了AsyncCommonDigestAppenderManager 类的一个单例对像，并且提供了 getSofaTracerDigestReporterAsyncManager 方法来获取该单例，在这个方法中调用了 start 方法；该对象用来输出摘要日志；

### 发布事件

前面的 Demo 中是通过一个 for 循环来发布事件的，在 SOFATracer 中的事件发布无非就是当有 Tracer 日志需要输出时会触发发布，那么对应的就是日志的 append 操作，将日志 append 到环形缓冲区。

```java
public boolean append(SofaTracerSpan sofaTracerSpan) {
    long sequence = 0L;
    //是否允许丢弃
    if (allowDiscard) {
        try {
            //允许丢弃就使用tryNext尝试申请序列，申请不到抛出异常
            sequence = ringBuffer.tryNext();
        } catch (InsufficientCapacityException e) {
            //是否输出丢失日志的TraceId和RpcId
            if (isOutDiscardId) {
                SofaTracerSpanContext sofaTracerSpanContext = sofaTracerSpan
                    .getSofaTracerSpanContext();
                if (sofaTracerSpanContext != null) {
                    SynchronizingSelfLog.warn("discarded tracer: traceId["
                                              + sofaTracerSpanContext.getTraceId()
                                              + "];spanId[" + sofaTracerSpanContext.getSpanId()
                                              + "]");
                }
            }
             //是否输出丢失日志的数量
            if ((isOutDiscardNumber) && discardCount.incrementAndGet() == discardOutThreshold) {
                discardCount.set(0);
                if (isOutDiscardNumber) {
                    SynchronizingSelfLog.warn("discarded " + discardOutThreshold + " logs");
                }
            }

            return false;
        }
    } else {
        // 不允许丢弃则使用next方法
        sequence = ringBuffer.next();
    }

    try {
        SofaTracerSpanEvent event = ringBuffer.get(sequence);
        event.setSofaTracerSpan(sofaTracerSpan);
    } catch (Exception e) {
        SynchronizingSelfLog.error("fail to add event");
        return false;
    }
    //发布
    ringBuffer.publish(sequence);
    return true;
}
```

SOFATracer 事件发布的调用逻辑：

![发布调用逻辑](https://cdn.nlark.com/yuque/0/2020/png/226702/1584325942410-394e84f5-3a86-42ce-8c2d-d4ea204fef42.png)

追溯调用的流程，可以知道当前 span 调用 finish 时或者 SOFATracer 中调用 reportSpan 时就相当于发布了一个消息事件。

## 小结

本文对 SOFATracer 中使用 Disruptor 来进行日志输出的代码进行了简单的分析，更多内部细节原理可以自行看下SOFATracer 的代码。SOFATracer 作为一种比较底层的中间件组件，在实际的业务开发中基本是无法感知的。但是作为技术来学习，还是有很多点可以挖一挖。

SOFATracer：[https://github.com/sofastack/sofa-tracer](https://github.com/sofastack/sofa-tracer)

> 如果有小伙伴对中间件感兴趣，欢迎加入我们团队，欢迎来撩；对 SOFA 技术体系有兴趣的可以关注 [SOFAStack 社区](https://www.sofastack.tech/community/)：[https://www.sofastack.tech/community/](https://www.sofastack.tech/community/)
