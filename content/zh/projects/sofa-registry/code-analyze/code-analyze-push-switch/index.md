---
title: "源码解析｜推送开关"
author: "顾叶宸"
authorlink: "https://github.com/YechenGu"
description: "源码解析｜推送开关"
categories: "SOFAStack"
tags: [“源码解析”]
date: 2022-04-22T15:00:00+08:00
---

## 前言

某些场景下 SOFARegistry 需要暂时关闭推送功能，这样集群内的业务可以利用 client 的缓存继续工作，比如说 SOFARegistry 需要进行不兼容升级，需要全集群下线，更新版本后再拉起。

推送开关的状态存储在数据库中，通过 Meta 修改数据后，Session 可以通过读取到推送开关的变更通知，并在对应的推送流程上进行切断。

本文将聚焦推送开关功能的三个关键问题：

- meta 如何存储开关配置数据。
- session 如何获取到开关配置的变更并触发更新（通知、定时）。
- session 关闭推送功能的实现。

## 总体流程

关闭推送的请求，主要由 `StopPushDataResource`类下的`closePush`负责处理。我们来看看它的实现：

```java
public Result closePush() {
    boolean ret;
    Result result = new Result();
    // 1.重设灰度推送开关
    ret = resetGrayOpenPushSwitch();
    if (!ret) {
      result.setSuccess(false);
      return result;
    }

    PersistenceData persistenceData =
        PersistenceDataBuilder.createPersistenceData(
            ValueConstants.STOP_PUSH_DATA_SWITCH_DATA_ID, "true");

    try {
      // 2.重设全局推送开关
      ret = provideDataService.saveProvideData(persistenceData);
      ......
    } catch (Throwable e) {
      ......
    }

    if (ret) {
      // 3.发送数据变更通知
      fireDataChangeNotify(
          persistenceData.getVersion(), ValueConstants.STOP_PUSH_DATA_SWITCH_DATA_ID);
    }

    result.setSuccess(ret);
    return result;
  }
```

可以看到，`closePush`函数主要做了三件事：

1. 重设灰度推送开关

   灰度推送开关中，存储着一个 IP 列表。灰度推送允许 SOFARegistry  即使在全局推送关闭的情况下，仍满足特定 IP 的推送请求。因此想要完全关闭推送功能，需要重设该开关，清空其中的 IP 列表。

2. 重设全局推送开关

   关闭推送功能，需要重设全局推送开关，保存开关配置为关闭的新数据。

3. 发送数据变更通知

   数据变更通知将告诉 Session，开关配置已经改变，需要进行更新。

## Meta 存储开关配置数据

我们以重设全局推送开关中，开关数据的存储为例：

1. meta 首先从内存中读取旧的开关配置版本号，并与当前数据版本号进行比较。

       只有确定是更新的数据，才会进行后续存储。

2. 存储新的开关配置数据，并更新数据库中该数据的版本号。

3. 更新内存中的开关配置数据。

```java
public boolean saveProvideData(PersistenceData persistenceData, long expectVersion) {
    // 1.比较版本号
    if (persistenceData.getVersion() <= expectVersion) {
      ......
      return false;
    }

    // 2.更新数据库
    boolean success = provideDataRepository.put(persistenceData, expectVersion);

    if (success) {
      lock.writeLock().lock();
      try {
        // 3.更新内存
        provideDataCache.put(
            PersistenceDataBuilder.getDataInfoId(persistenceData), persistenceData);
      } catch (Throwable t) {
        ......
        return false;
      } finally {
        lock.writeLock().unlock();
      }
    }
    return success;
  }
```

重设灰度开关中的步骤与之类似，因此这里不再赘述。

## Session 获取开关配置

##### 通知更新

继续上文，`closePush`会调用`fireDataChangeNotify`函数，通知外界开关配置发生了更新。

```java
private void fireDataChangeNotify(Long version, String dataInfoId) {
    ......
    if (TASK_LOGGER.isInfoEnabled()) {
      ......
    }
    provideDataNotifier.notifyProvideDataChange(provideDataChangeEvent);
  }
```

1. 这一通知首先会进行判断，是哪一种事件类型。在本例中，开关配置的更新是与 Session 有关的事件。

```java
public void notifyProvideDataChange(ProvideDataChangeEvent event) {
    Set<Node.NodeType> notifyTypes = event.getNodeTypes();
    // 判断事件类型
    if (notifyTypes.contains(Node.NodeType.DATA)) {
      defaultDataServerService.notifyProvideDataChange(event);
    }
    if (notifyTypes.contains(Node.NodeType.SESSION)) {
      defaultSessionServerService.notifyProvideDataChange(event);
    }
  }
```

2. 随后，通知会被交付给 Session 相关的消息交换类，并进行`Request`请求。

```java
public void notifyProvideDataChange(ProvideDataChangeEvent event) {
    new NotifyTemplate<ProvideDataChangeEvent>().broadcast(event);
}


public void broadcast(E event) {
      ......
      getNodeExchanger().request(new NotifyRequest(event, connection, executors));
      ......
}
```

3. 在消息交换类中，系统使用`getClientHandlers`得到了负责消息响应的 handler。

```java
public Response request(Request request) throws RequestException {
    final URL url = request.getRequestUrl();
    ......
    connect(url);
    ......
}


public Channel connect(URL url) {
    Client client = getClient();
    ......
    client = boltExchange.connect(serverType,getConnNum(),url,
                getClientHandlers().toArray(new ChannelHandler[0]));
    ......
}
```

4. 负责消息响应的 handler，已经通过 bean 注册在了 Spring 之中。在推送开关数据变更的场景下，通知会交给`notifyProvideDataChangeHandler`进行处理。

```java
protected Collection<ChannelHandler> getClientHandlers() {
    return metaClientHandlers;
}


@Resource(name = "metaClientHandlers")
private Collection<ChannelHandler> metaClientHandlers;
```

```java
@Bean(name = "metaClientHandlers")
public Collection<AbstractClientHandler> metaClientHandlers() {
   Collection<AbstractClientHandler> list = new ArrayList<>();
   list.add(notifyProvideDataChangeHandler());
   ......
   return list;
}
```

5. `notifyProvideDataChangeHandler`在 `interest` 函数中，设定了自己可以处理 `ProvideDataChangeEvent` 类型消息。最后，通知最终会被转交给`AbstractFetchPersistenceSystemProperty`进行处理

```java
public Object doHandle(Channel channel, ProvideDataChangeEvent provideDataChangeEvent) {
    final String notifyDataInfoId = provideDataChangeEvent.getDataInfoId();

    systemPropertyProcessorManager.doFetch(notifyDataInfoId);
    return null;
  }

  public Class interest() {
    return ProvideDataChangeEvent.class;
  }
```

```java
public boolean doFetch(String dataInfoId) {
    private Collection<AbstractFetchPersistenceSystemProperty> systemDataPersistenceProcessors =
      new ArrayList<>();

    ......
    for (FetchSystemPropertyService systemDataProcessor : systemDataPersistenceProcessors) {
      if (systemDataProcessor.support(dataInfoId)) {
        return systemDataProcessor.doFetch();
      }
    }
    ......
  }
```

6. `AbstractFetchPersistenceSystemProperty`类，是最终负责更新的类

   让我们分析一下它的结构

```java
public boolean doFetch() {
    watchDog.wakeup();
    return true;
}


protected final class WatchDog extends WakeUpLoopRunnable {

    @Override
    public void runUnthrowable() {
      doFetchData();
    }

    @Override
    public int getWaitingMillis() {
      return getSystemPropertyIntervalMillis();
    }
}
```

当`doFetch`通知到达时，`watchDog`会被唤醒(wakeup)。

被唤醒后做了什么事呢？我们先对 watchDog 进行一番分析。

在功能上，它重写了父类的两个方法。

在结构上，它继承了`WakeUpLoopRunnable`父类。

<img title="" src="https://img-blog.csdnimg.cn/d0dabd391b9c49d0a463d414a72f2c63.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBA5YWz5bGx5Y-j5aSn5ZK46bG8,size_1,color_FFFFFF,t_7,g_se,x_16" alt="" width="300" data-align="center">

在父类`WakeUpLoopRunnable`中，维护了一个长度为 1 的阻塞队列`bell`。

> **阻塞队列（BlockingQueue）** 是一个支持两个附加操作的队列。这两个附加的操作是：在队列为空时，获取元素的线程会等待队列变为非空。当队列满时，存储元素的线程会等待队列可用。阻塞队列常用于生产者和消费者的场景，生产者是往队列里添加元素的线程，消费者是从队列里拿元素的线程。阻塞队列就是生产者存放元素的容器，而消费者也只从容器里拿元素。

```java
  // 阻塞队列
  private final ArrayBlockingQueue<Object> bell = new ArrayBlockingQueue<>(1);

  // 从队列中取出
  @Override
  public void waitingUnthrowable() {
    ConcurrentUtils.pollUninterruptibly(bell, getWaitingMillis(), TimeUnit.MILLISECONDS);
  }

  // 设置最长等待时间
  public abstract int getWaitingMillis();

  // 向队列中添加
  public void wakeup() {
    bell.offer(this);
  }
```

上文的唤醒（wakeup）操作，便是将自身加入到这个长度为 1 的阻塞队列之中。

而`waitingUnthrowable`函数，负责了等待功能的实现。它会尝试从阻塞队列中取出对象。如果队列中没有对象，它将进行等待------直到存在对象或者指定的时间耗尽。

```java
 public static <T> T pollUninterruptibly(BlockingQueue<T> queue, long wait, TimeUnit unit) {
    try {
      // 从队列中取出
      return queue.poll(wait, unit);
    } catch (InterruptedException ignored) {
      .......
    }
    return null;
  }
```

我们继续向下分析`WakeUpLoopRunnable`的父类`LoopRunnable`。它实现了`Runnable`接口，并重写了 run 方法。

可以看出，该线程一经启动，便会在循环中不休止地重复进行功能执行和等待。

```java
public void run() {
    ......
    for (; ; ) {
      .......
        try {
          // 执行功能
          runUnthrowable();
        } catch (Throwable unexpect) {
          ......
        }
        try {
          // 等待
          waitingUnthrowable();
        } catch (Throwable unexpect) {
          ......
        }
      } 
    ......
}
```

在正常情况下，阻塞队列`bell`中是没有对象的，因此等待函数无法从队列中取出对象，会进行等待。

而当推送通知传来，`watchDog`被`wakeup`之后，队列中会被添加对象。

因此，等待函数可以立即取出对象，从而开始下一轮循环，执行功能`runUnthrowable`。

在`watchDog`中，功能执行由`doFetchData`接管，具体体现为对内存开关配置进行更新。

```java
protected final class WatchDog extends WakeUpLoopRunnable {

    @Override
    public void runUnthrowable() {
      doFetchData();
    }

    ......
}


protected boolean doFetchData() {
    T expect = storage.get();
    E fetchData = fetchFromPersistence();

    if (fetchData == null) {
      ......
      return false;
    }

    if (fetchData.getVersion() < expect.getVersion()) {
      ......
      return false;
    } else if (fetchData.getVersion() == expect.getVersion()) {
      return true;
    }
    // do compare and set
    return doProcess(expect, fetchData);
  }
```

在`doFetchData`中，从内存得到的开关数据会和从数据库得到的数据进行比较。

只有当数据库的版本更新时，Session 才会进行 CompareAndSet 操作，更新内存中的开关配置。

##### 定时更新

当 Session 启动时，将开启对开关状态的监视。

一个 WatchDog 的守护线程将会被创建。

```java
public boolean start() {
    ......
      ConcurrentUtils.createDaemonThread(
              StringFormatter.format("FetchPersistenceSystemProperty-{}", dataInfoId), watchDog)
          .start();
    ......
}


public static Thread createDaemonThread(String name, Runnable r) {
    Thread t = new Thread(r, name);
    t.setDaemon(true);
    return t;
  }
```

守护线程被创建后，除非通知更新到来，否则上文中的`bell`队列一直会是空的。

因此，`LoopRunnable`便会重复执行更新操作，并等待一段规定时间。

```java
public void run() {
    ......
    for (; ; ) {
      .......
        try {
          // 更新
          runUnthrowable();
        } catch (Throwable unexpect) {
          ......
        }
        try {
          // 等待
          waitingUnthrowable();
        } catch (Throwable unexpect) {
          ......
        }
      } 
    ......
}
```

由此，定时更新得到了实现。

## 关闭推送的实现

`PushSwitchService`中，存在着以下两个类，它们会对内存中的全局开关配置和灰度开关配置进行读取。

```java
public boolean canPush() {
    return !fetchStopPushService.isStopPushSwitch()
        || CollectionUtils.isNotEmpty(fetchGrayPushSwitchService.getOpenIps());
  }

  public boolean canIpPush(String ip) {
    return !fetchStopPushService.isStopPushSwitch()
        || fetchGrayPushSwitchService.getOpenIps().contains(ip);
  }
```

当配置开关关闭后，依照上文所分析的，全局开关将会被关闭，而灰度开关的 IP 列表也会被清空。因此，这两个函数将会返回 false。

与推送相关的功能，例如 Data 的通知，Session 的兜底 check 等，会调用这两个函数判定是否可以推送。如果不可以推送，后续的流程就会被切断。

```java
public Object doHandle(.......) {
    if (!pushSwitchService.canPush()) {
      return null;
    }
    // 推送处理
    ......
}


void firePush(......) {
    if (!pushSwitchService.canIpPush(addr.getAddress().getHostAddress())) {
      return;
    }
    // 推送处理
    .......
}
```

由此，关闭推送得到了实现。
