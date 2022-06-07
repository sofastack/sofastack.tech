---
title: "源码解析｜推送延迟 trace"
author: "kuaile-zc"
authorlink: "https://github.com/kuaile-zc"
description: "源码解析｜推送延迟 trace"
categories: "SOFAStack"
tags: [“源码解析”]
date: 2022-03-23T15:00:00+08:00
---

- 大致代码流程
- 推送延迟的计算方式
- 首次订阅和后续推送延迟计算的区分
- 如何统计各个阶段的耗时

### 前言

>此次源码解析均在 sofa-registry:6.1.4-SNAPSHOT 版本下分析

### 1、大致代码流转流程

起源于此类 com.alipay.sofa.registry.server.session.push.PushProcessor
@PostConstruct 注解由 java 源码提供初始化类会运行此方法，那么就从 init() 函数开始我们今天的故事！

![image.png](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*5yIJT5iUY34AAAAAAAAAAAAAARQnAQ)

1.初始化 KeyedThreadPoolExecutor 类（com.alipay.sofa.registry.task.KeyedThreadPoolExecutor）

2.初始化 initTaskBuffer()

3.创建针对 push 的 cleaner 者创建过程中会将此线程设置为守护者线程 t.setDaemon(true)

守护者线程：是指在程序运行的时候在后台提供一种通用服务的线程，比如垃圾回收线程就是一个很称职的守护者，并且这种线程并不属于程序中不可或缺的部分。因此，当所有的非守护线程结束时，程序也就终止了，同时会杀死进程中的所有守护线程。反过来说，只要任何非守护线程还在运行，程序就不会终止。

源码给的默认值

coreSize = OsUtils.getCpuCount() *3 CPU 数量* 3

coreBufferSize = coreSize * 3000

让我们来看看初始 KeyedThreadPoolExecutor 会发生的故事。

![image.png](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*Xr1RRqtZIDcAAAAAAAAAAAAAARQnAQ)

1.设置基本参数，添加 Prometheus 监控。

2.通过配置创建 AbstractWorker[] workers 数组类型。

3.设置每个 worker 线程为

让我们来看一下 createWorkers（） 这个方法干了什么事。

![image.png](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*u0tpTLVyuUIAAAAAAAAAAAAAARQnAQ)

1.创建阻塞队列

2.创建多个 worker 数量根据 coreSize 并且所以的 worker 都共享所有队列

阻塞队列被包装了一层详解如下：

#### 前置知识原生阻塞队列具有以下特性

ArrayBlockingQueue：基于数组的阻塞队列实现，在 ArrayBlockingQueue 内部，维护了一个定长数组，以便缓存队列中的数据对象，这是一个常用的阻塞队列，除了一个定长数组外， ArrayBlockingQueue 内部还保存着两个整形变量，分别标识着队列的头部和尾部在数组中的位置。

LinkedBlockingQueue：基于链表的阻塞队列，同 ArrayListBlockingQueue 类似，其内部也维持着一个数据缓冲队列（该队列由一个链表构成），当生产者往队列中放入一个数据时，队列会从生产者手中获取数据，并缓存在队列内部，而生产者立即返回；只有当队列缓冲区达到最大值缓存容量时（LinkedBlockingQueue 可以通过构造函数指定该值），才会阻塞生产者队列，直到消费者从队列中消费掉一份数据，生产者线程会被唤醒，反之对于消费者这端的处理也基于同样的原理。而 LinkedBlockingQueue 之所以能够高效的处理并发数据，还因为其对于生产者端和消费者端分别采用了独立的锁来控制数据同步，这也意味着在高并发的情况下生产者和消费者可以并行地操作队列中的数据，以此来提高整个队列的并发性能。

![image.png](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*Z29fQpVctg0AAAAAAAAAAAAAARQnAQ)

com.alipay.sofa.registry.task.BlockingQueues 存储队列的变量是 BlockingQueue[] queues
因为入参 array（false）所以最终生成的是数组类型的 LinkedBlockingQueue 阻塞队列 coreSize 个数组 coreBufferSize 个初始队列大小。

我们可以看到 WorkerImpl 类的结构如下

![image.png](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*YgKkRZIPAoYAAAAAAAAAAAAAARQnAQ)

我们用图来解析一下 WorkerImpl 的工作原理

![image.png](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*FqkaRb9Gz_cAAAAAAAAAAAAAARQnAQ)

所以当有服务订阅之后会生成订阅任务 WorkerImpl 将会执行任务，然后在任务执行过程中延迟链路跟踪。整个推送结束之后会有回调函数进行统计。

### 2.推送延迟的计算方式

创建推送任务的时候 PushTask（）

PushProcessor 中的都 push（）开启 push 任务

![image.png](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*TbaIQJpUU2oAAAAAAAAAAAAAARQnAQ)

![image.png](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*CTp2TpOxtfsAAAAAAAAAAAAAARQnAQ)

1.检查是否是停止的推送任务和是否是灰度推送功能。

2.task.trace.startPush() 开始任务记录当前开始时间值 PushTrace.pushStartTimestamp

3.检查 push 任务运行情况 如果没有记录则表示正常， 如果已经有记录则：一种情况超时删除任务第二则是重试

4.task.createPushData() 创建 Push data

5.放入 push 记录为了未来重试或者异常情况获取记录做判断

6.创建回调函数，完成 push 任务之后回调函数生效

回调函数代码如下

PushClientCallback.onCallback

![image.png](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*br8pQ5YKSHEAAAAAAAAAAAAAARQnAQ)

回调函数 PushClientCallback(task) onCallback(Channel channel, Object message) 调用了 this.pushTask.trace.finishPush（）结束了整个 push 链路追踪。

最后算出大量的数据进行追踪 PushTrace.finish()

## 3.首次订阅和后续推送延迟计算的区分

见下表/图统计

## 4.如何统计各个阶段的耗时

此图为理解链路追踪过程：

![image.png](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*RVQlSaJdEcUAAAAAAAAAAAAAARQnAQ)

| 字段                                                        | 字段解释                                                     | 表达式                                                       | 根据上图分析步骤                                             | 首次订阅和后续推送计算方式是否有区别（默认不填为否） | 注解                                   |
| ----------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ---------------------------------------------------- | -------------------------------------- |
| subRegTimestamp                                             | 订阅者订阅请求的时候的时间戳                                 |                                                              |                                                              |                                                      |                                        |
| pushStartTimestamp                                          | push 推送开始的时间戳                                        | System.currentTimeMillis()                                   |                                                              |                                                      | 任务开始获取当前时间戳                 |
| pushFinishTimestamp                                         | push 推送完成的时间戳                                        | System.currentTimeMillis()                                   |                                                              |                                                      | 结束之后调用结束方法之后获取当前时间戳 |
| pushCause.triggerPushCtx.firstTraceTimes                    | 第一次通知 seesion 数据变更的时间                            |                                                              |                                                              |                                                      |                                        |
| lastTriggerSession(pushCause.triggerPushCtx.lastTraceTimes) | 最后一次触发session(SOFARegistry 的组件之一）进行变更推送    |                                                              |                                                              |                                                      |                                        |
| pushCause.datumTimestamp                                    | 主动 pub：那时间就是在 data 端触发修改 datum 的时间如果是主动 sub：那时间就是 sub 注册的当前时间 |                                                              |                                                              | 是                                                   |                                        |
| lastPushTimestamp                                           | 上一次 push 的时间首次订阅：如果是首次订阅，就是订阅注册的时间，用于后续的过滤，防止重复计算已经推送过的数据的延迟。后续推送：上一次 push 的时间 |                                                              |                                                              | 是                                                   |                                        |
| lastPushTimestamp                                           | 上一次 push 的时间首次订阅：如果是首次订阅，就是订阅注册的时间，用于后续的过滤，防止重复计算已经推送过的数据的延迟。后续推送：上一次 push 的时间 |                                                              |                                                              |                                                      |                                        |
| datumModifyPushSpanMillis                                   | 推送的版本之后的版本时间戳与 push 任务完成时间戳最大耗时当首次订阅：等效于 datumVersionPushSpanMillis 后续推送时：此次 push 最后一次推送数据结束之后 | 首次订阅：等效于 datumVersionPushSpanMillis 后续推送：max(datumPushedDelayList.get(0), datumVersionPushSpanMillis) | 获取数据修改中间的间隔时间（使用每次数据改变的Version版本记录并且获取当前10次如果有的话最近的时间间隔） | 是                                                   |                                        |
| datumVersionPushSpanMillis                                  | 此次数据版本 push 完成耗时首次订阅： 直接用这 push 结束时间戳减去首次订阅请求的时间戳后续推送： 直接用 push 结束时间戳减去数据更改时间戳 | 首次订阅：pushFinishTimestamp - subRegTimestamp 首次订阅 subRegTimestamp 代表订阅者访问服务端的时间戳后续推送：max(pushFinishTimestamp - pushCause.datumTimestamp, 0) 后续订阅pushCause.datumTimestamp 代表订阅的数据改变的时间戳 | 步骤首次：2-6后续：订阅数据改变的时间戳-6                    | 是                                                   |                                        |
| datumVersionTriggerSpanMillis                               | 数据中心此版本 push 中获取到最后一个数据的耗时首次订阅：直接注册服务最后一次数据请求时间减去首次订阅请求的时间（可能存在负数）后续推送：注册者最后一次数据会话时间戳减去注册中心数据的版本时间戳 | 首次订阅：lastTriggerSession - subRegTimestamp 首次订阅subRegTimestamp代表订阅者访问服务端的时间戳后续推送：max(lastTriggerSession - pushCause.datumTimestamp, 0) 后续订阅 pushCause.datumTimestamp 代表订阅的数据改变的时间戳 | 步骤首次：2-5后续：订阅数据改变的时间戳-5                    | 是                                                   |                                        |
| pushTaskPrepareSpanMillis                                   | 计算 task 准备时间耗时（从  session 收到的最早的变更通知到创建推送任务的时间间隔） | pushCreateTimestamp - pushCause.triggerPushCtx.getFirstTimes().getTriggerSession() | 步骤 1-4                                                     |                                                      |                                        |
| pushTaskQueueSpanMillis                                     | 计算任务在队列里面等待的时间                                 | pushStartTimestamp - pushCreateTimestamp                     | 步骤 1-2                                                     |                                                      |                                        |
| pushTaskClientIOSpanMillis                                  | 计算整个推送任务开始执行到结束的时间（严格意义上算push 的耗时） | pushFinishTimestamp - pushStartTimestamp                     | 步骤 3-6                                                     |                                                      |                                        |

源码阅读一些问题：

1.线程数量设置是否合理

coreSize = OsUtils.getCpuCount() *3 CPU 数量*3

coreBufferSize = coreSize * 3000

线程过多肯定会影响 CPU 本身性能，过多的线程会造成系统线程切换开销过大，是否大规模测试过认为这个参数比较合适或者是用了某些公式？

2.TraceTimes.dataChangeType 如果不使用枚举 enum 的话应该给出注解标明每个值的含义
