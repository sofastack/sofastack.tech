---

title: "源码解析｜数据表监听"
author: "连文湧"
authorlink: "https://github.com/lianwy11"
description: "源码解析｜数据表监听"
categories: "SOFAStack"
tags: [“源码解析”]
date: 2022-03-18T15:00:00+08:00

---

## 数据表结构要求

**以应用级服务发现元数据表为例**

| param          | type    | description       |
| -------------- | ------- | ----------------- |
| data_center    | String  | local data center |
| revision       | String  | revision          |
| app_name       | String  | appName           |
| client_version | String  | clientVersion     |
| base_params    | String  | base_params       |
| service_params | String  | service_params    |
| deleted        | boolean | delete or no      |
| gmt_create     | Date    | create time       |
| gmt_modified   | Date    | last update time  |

## 写入

### 写入缓存

**cachedExecutor.execute** 执行缓存写入操作防止无法瞬间处理大量相同数据写入操作。防止大量节点上报相同的应用级服务发现元数据。

```java
public V execute(K key, Callable<V> callable) throws Exception {
  V v = cache.getIfPresent(key);
  if (v != null) {
      //发现元素，命中+1
    hitCount.increment();
    return v;
  }
  return cache.get(
      key,
      () -> {
       //未发现元素，未命中+1
        missingCount.increment();
        onMiss(key);
        return callable.call();
      });
}
```

二参数的 **execute** 统计修订号 revision 的命中和未命中次数统计 **metrics**，在通讯数据压缩暴露到 **prometheus**。

### 写入数据

```java
protected void refreshEntryToStorage(AppRevisionDomain entry) {
  try {
    cachedExecutor.execute(
        entry.getRevision(),
        () -> {
            //判断是否执行replace写入数据
          if     (appRevisionMapper.heartbeat(entry.getDataCenter(), entry.getRevision()) == 0) {
            appRevisionMapper.replace(entry);
          }
         //省略日志操作
  }
}
```

**cachedExecutor** 默认指定 silentMs=10s，当缓存项在指定的时间段内没有更新就会被回收（移除 key），需要等待获取新值才会返回。10s 内没有更新说明数据量不大，也不需要进行写入缓存的操作。

通过 **hearbeat()** 底层通过 **update** 原子判断数据是否存在。刷新 **gmt_modified** 字段时间防止被误删。

```mysql
 update app_revision set gmt_modified=CURRENT_TIMESTAMP  where data_center = #{dataCenter}
    and revision=#{revision}
    and deleted = '0'
```

当 **update** 没有命中的时候，使用 **replace**，保证能生成一个新的 **id**，用于后续的 **watch** 方法监听表获取元素更新变化，并刷新 **gmt_modified** 防止字段超时被删除。

```mysql
replace into app_revision(
       data_center,
       revision,
       app_name,
       client_version,
       base_params,
       service_params,
       deleted,
       gmt_create,
       gmt_modified
   )
  values (
       #{dataCenter},
       #{revision},
       #{appName},
       #{clientVersion},
       #{baseParams},
       #{serviceParams},
       #{deleted},
       CURRENT_TIMESTAMP,
       CURRENT_TIMESTAMP
   )
```

## 获取数据增量改变

### Watch

数据库没有提供订阅的操作，**watch** 方法缓存最新 **id** 值，增量读取数据库中更新的 id 值并更新最新的 **id** 值保证 **lastLoadId** 一直保持最新的状态

```java
private void watch() {
  syncStart();
  try {
    long start = lastLoadId;
    if (listStableEntries(start, 1).size() == 0) {
      return;
    }
    logger.info("start watch from {}", start);
    long maxId =
        listToTail(
            (T entry) -> {
              container.onEntry(entry);
              logger.info("watch received entry: {}", entry);
            },
            start,
            100);
    logger.info("end watch to {}", maxId);
    lastLoadId = maxId;
  } finally {
    syncEnd();
  }
}
```

**listStableEntries** 提供从数据库获取最新数据的 id 值的方法，写入数据的方法底层通过 replace 写入，因此一定会有新的 id 生成。

机制存在问题：如果数据中间出现不连续的间断，无法得到更新后存在间隔的 id 值。

此方法主要列出所有创建完成 1s 后更新的元素。

```java
if (entry.getGmtCreate().getTime() >= now.getTime() - DB_INSERT_DELAY_MS) {
  break;
}
```

其中 **DB_INSERT_DELAY_MS=1s**

**为什么是 1s？**

内部是分布式数据库，表内数据会被拆分到多个机器上，每台机器批量获取 id 属性，此时如果大量并发插入，可能产生 id 值高的已经入库，而低 id 还没有完全写入，这时 watch 方式会出现问题，漏掉低 id 值的数据，直到 list 调用才能被重新填入。而这种问题产生的间隔很短，因此 1s 的间隔能保证 id 值较低的数据已经被填入。

**listToTail** 方法返回当前最大可靠 id 值

```java
private long listToTail(EntryCallable<T> callable, final long start, final int page) {
  long curStart = start;
  while (true) {
    List<T> entries = listStableEntries(curStart, page);
    if (CollectionUtils.isEmpty(entries)) {
      break;
    }
    for (T entry : entries) {
      callable.onEntry(entry);
      curStart = Math.max(curStart, entry.getId());
    }
    ConcurrentUtils.sleepUninterruptibly(10, TimeUnit.MILLISECONDS);
  }
  return curStart;
}
```

线程沉睡 10ms 为了防止某一时刻在进行读操作时有大量数据写入，提前先将数据放到 entries 进行更新。为下一个 **watch()** 减少数据的开销

### List

提供定时的全量修正

```java
private void list() {
  syncStart();
  try {
    C newContainer = containerFactory();
    long maxId = listToTail(newContainer::onEntry, 0, 1000);
    logger.info("end list to {}", maxId);
    preList(newContainer);
    this.container = newContainer;
    lastLoadId = maxId;
  } finally {
    syncEnd();
  }
}
```

**preList()** 将内存中全量数据和数据库中的数据进行一次对比，弥补了 **Watch** 对于非连续数据检测机制的不足。

ListLoop 周期：**在 15-30 分钟之间产生一个随机的时间**

```java
private final class ListLoop extends WakeUpLoopRunnable {
  @Override
  public int getWaitingMillis() {
    int base = listLoopIntervalMs / 2;
    return (int) (base + Math.random() * base);
  }
```

因为进行一次 preList() 的全量数据比较需要较长时间，并且发生外部操作使数据的 id 值中断的概率比较小，只是一种检测意外事件发生的机制，因此间隔远大于 watchLoop 的间隔周期。

## 清理失效数据

正常存活的数据定期刷新 **gmt_modified** 延长存活周期。

```java
public List<AppRevision> getExpired(Date beforeTime, int limit) {
  List<AppRevisionDomain> expired =
      appRevisionMapper.getExpired(
          defaultCommonConfig.getClusterId(tableName()), beforeTime, limit);
  return AppRevisionDomainConvertor.convert2Revisions(expired);
}
```

如果一个数据长时间得不到刷新，可以判断这个数据已经失效，更改 **deleted='1'**，**watch** 会立刻感知删除事件。

后续会定期清理 **deleted='1'** 和指定时间之前的数据。

```java
<delete id="cleanDeleted">
    <![CDATA[
    delete from app_revision where data_center=#{dataCenter} and gmt_modified < #{beforeTime} and deleted='1'
    limit #{limit}
    ]]>
</delete>
```

通过 **watch** 机制自动感知实时到期失效数据， **gmt_modified** 时间以及 **deleted** 的值共同判断，可以准确删除大量失效的数据，保证数据库的存储资源得到释放。

## 总结

**SOFARegistry** 内部的部分配置的更新需要及时感知，比如应用级服务发现的元数据变更，常见数据库并没有数据表变化通知的接口，**SOFARegistry** 实现了对于数据表更新实时 watch 的机制。

**watch** 通过更新缓存 id 实现实时检测增量变化，实时感知失效数据。**list** 提供定时全量修正机制，补足 **watch** 对于的不足，缓存机制能防止大量节点同时上传大量相同数据造成可能的宕机。
