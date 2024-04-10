---
title: "源码解析｜SlotTable"
author: "行动"
authorlink: "https://github.com/xingdong015"
description: "源码解析｜SlotTable"
categories: "SOFAStack"
tags: [“源码解析”]
date: 2022-04-08T15:00:00+08:00
---

SOFARegistry 对于服务数据是分片进行存储的，因此每一个 data server 只会承担一部分的服务数据，具体哪份数据存储在哪个 data server 是有一个称为 SlotTable 的路由表提供的，session 可以通过 SlotTable 对对应的 data derver 进行读写服务数据， slot 对应的 data follower 可以通过 SlotTable 寻址 leader 进行数据同步。

维护 SlotTable 是由 Meta 的 leader 负责的，Meta 会维护 data 的列表，会利用这份列表以及 data 上报的监控数据创建 SlotTable，后续 data 的上下线会触发 Meta 修改 SlotTable， SlotTable 会通过心跳分发给集群中各个节点。

### 1. DataServer 更新 SlotTable 路由表过程

![image.png](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*B7ydQ6LBu-IAAAAAAAAAAAAAARQnAQ)

如上图所示 session 和 data 节点定时会向 Meta 节点上报心跳、Meta 节点维护了 data 以及 session 节点列表信息、并且在心跳请求中将返回 SlotTable 路由表信息、data 节点将路由表 SlotTable 保存在本地中。

### 2. SlotTable 更新平衡算法

由前文可知、SOFARegistry 采用了数据分片存储在 DataServer 节点之上、那么随之而来的问题就是数据如何分片呢?  

SOFARegistry 采用预分配的方式。

传统的一致性 Hash 算法有数据分布范围不固定的特性，该特性使得服务注册数据在服务器节点宕机、下线、扩容之后，需要重新存储排布，这为数据的同步带来了困难。大多数的数据同步操作是利用操作日志记录的内容来进行的，传统的一致性 Hash 算法中，数据的操作日志是以节点分片来划分的，节点变化导致数据分布范围的变化。

在计算机领域，大多数难题都可以通过增加一个中间层来解决，那么对于数据分布范围不固定所导致的数据同步难题，也可以通过同样的思路来解决。

这里的问题在于，当节点下线后，若再以当前存活节点 ID 一致性 Hash 值去同步数据，就会导致已失效节点的数据操作日志无法获取到，既然数据存储在会变化的地方无法进行数据同步，那么如果把数据存储在不会变化的地方是否就能保证数据同步的可行性呢？答案是肯定的，这个中间层就是预分片层，通过把数据与预分片这个不会变化的层相互对应就能解决这个数据同步的难题。

目前业界主要代表项目如 Dynamo、Casandra、Tair、Codis、Redis cluster 等，都采用了预分片机制来实现这个不会变化的层。

事先将数据存储范围等分为 N 个 slot 槽位，数据直接与 slot 相对应，数据的操作日志与相应的 solt 对应，slot 的数目不会因为节点的上下线而产生变化，由此保证了数据同步的可行性。除此之外，还需要引进“路由表”的概念，如图 13，“路由表”负责存放每个节点和 N 个 slot 的映射关系，并保证尽量把所有 slot 均匀地分配给每个节点。这样，当节点上下线时，只需要修改路由表内容即可。保持 slot 不变，即保证了弹性扩缩容，也大大降低了数据同步的难度。

![image.png](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*KJSMRblolhsAAAAAAAAAAAAAARQnAQ)

实际上上述 **Slot** 和 **节点**的映射关系在源码中以 **SlotTable 和 Slot**的方式进行表达。源码如下代码块所示。

```java

public final class SlotTable implements Serializable {
  public static final SlotTable INIT = new SlotTable(-1, Collections.emptyList());
  // 最后一次更新的时间 epoch
  private final long epoch;
  //保存了 所有的 slot 信息； slotId ---> slot 对象的映射
  private final Map<Integer, Slot> slots;
}
public final class Slot implements Serializable, Cloneable {
  public enum Role {
    Leader,
    Follower,
  }
  private final int id;
  //当前slot的leader节点
  private final String leader;
  //最近更新时间
  private final long leaderEpoch;
  //当前slot的follow节点
  private final Set<String> followers;
}
```

由于节点在动态变化中、所以 Slot 和 节点的映射也在时刻变化中、那么我们接下来的重点就是 SlotTable 的变更过程。SlotTable 的变更是在 Meta 节点中触发、当有服务上下线的时候会触发 SlotTable 的变更、除此之外也会定期执执行 SlotTable 的变更。

SlotTable 的整个同步更新步骤如图所示。

代码参考
`com.alipay.sofa.registry.server.Meta.slot.arrange.ScheduledSlotArranger#arrangeSync.`

SlotTable 的定期变更是通过在初始化 ScheduledSlotArranger 时候实例化守护线程不断的 定期执行 内部任务 Arranger 的 arrangeSync 方法来实现 SlotTable 变更的。大致流程如下所示。

![image.png](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*IkASR5HfaOkAAAAAAAAAAAAAARQnAQ)

因为负责 SlotTable 的更新是在 MetaServer 中的主节点更新的。

所以更新 SlotTable 的第一步就是判断是否是主节点。主节点才负责真正的 SlotTable 变更步骤。

第二步是获取最新的 DataServer 节点，因为 重新分配 SlotTable 本质上是 对 DataServer 节点和 slot 槽位之间的映射关系进行重新分配。所以肯定需要获取到当前正在存活的 DataServer 节点信息，从而方便的对之进行 slot 分配。

(这里获取正在存活的 DataServer 也就是有和 MetaServer 维持心跳的 DataServer, 底层是从
`com.alipay.sofa.registry.server.Meta.lease.impl.SimpleLeaseManager`中获取，感兴趣可以查看相关源码) 。

第三部是分配前置校验，实际上一些边界条件的判断、例如 DataServer 是否为空、 DataServer 的大小是否大于配置的 minDataNodeNum，只有满足这些条件才进行变更。

第四步 执行 trayArrageSlot 方法、进入到该方法内部之中。

首先获取进程内部锁、实际上是一个 ReentrantLock，这里主要是为了避免定时任务多次同时执行 SlotTable 的分配工作。

```java
private final Lock lock = new ReentrantLock();
```

随后便是根据当前的 Data 节点信息创建 SlotTableBuilder、这里的 SlotTableBuilder 又是何方神圣呢？回到 SlotTable 更新的方式、一般是创建一个新的 SlotTable 对象、然后用这个新创建的对象去代替老的 SlotTable 对象、从而完成变更 SlotTable 操作、一般不会直接对老的 SlotTable 直接进行增删该 操作、这样并发导致的一致性问题很难控制。所以基于此、SlotTableBuilder 从它的名称就可以看出 它是 SlotTable 的创建者、内部聚合了 SlotBuilder 对象。其实和 SlotTable 类似的、SlotTable 内部聚合了 Slot 信息。

在查看 SlotTable 变更算法之前、我们先了解一下 SlotTableBuilder 的创建过程。SlotBuilder 的结构如下所示。

```java
public class SlotTableBuilder {
  //当前正在创建的 Slot 信息
  private final Map<Integer, SlotBuilder> buildingSlots = Maps.newHashMapWithExpectedSize(256);
  // 反向查询索引数据、通过 节点查询该节点目前负责哪些 slot 的数据的管理。
  private final Map<String, DataNodeSlot> reverseMap = Maps.newHashMap();
  //slot 槽的个数
  private final int slotNums;
  //follow 节点的数量
  private final int followerNums;
  //最近一次更新的时间
  private long epoch;
}
```

从 **SlotTableBuilder** 可以看出内部聚合了一个 **buildingSlots** 、标识正在创建的 **Slot**。因为 **SlotTable** 是由 **Slot** 构成的、这点也很容易理解。除此之外 SlotTableBuilder 内部也聚合了一个 reverseMap，代表反向查询索引，这个映射的 key 是 dataServer、value 是 DataNodeSlot 对象. DataNodeSlot 源码如下。

```java
/**
    通过 Slot 找 leader和follows.
    本质上是通过节点找 Slot，当前节点作为leaders的slot、和以当前节点作为 follower 的节点.
    也就是说 当前我这个节点、我在那些 slot 中作为 leader， 对应的是 Set<Integer> leaders.
    以及我当前这个节点在哪些 slot 中作为 follow，对应存储在 Set<Integer> follows.
**/
public final class DataNodeSlot  {
  private final String dataNode;
  private final Set<Integer> leaders = Sets.newTreeSet();
  private final Set<Integer> followers = Sets.newTreeSet();
}
```

用一张图来表达 DataNodeSlot 如下所示。可见它和图 1 是刚好相反的映射。通过节点查找 与该节点有关联的 slot 信息、因为后面要经常用到这一层查询、所以直接将这种关系保存下来。为了后面陈述方便、这里统计几种陈述方式。

1. 节点被作为 leader 的 slot 集合我们称为 : 节点 leader 的 slot 集合。
1. 节点被作为 follow 的 slot 集合我们称为  : 节点 follow 的 slot 集合。
1. SlotTable 关联的所有节点统称为:  SlotTable 的节点列表

![image.png](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*sjBXRqVWggMAAAAAAAAAAAAAARQnAQ)

再回到 **SlotTableBuilder** 创建

```java
private SlotTableBuilder createSlotTableBuilder(SlotTable slotTable, 
                                                List<String> currentDataNodeIps,
                                                int slotNum,int replicas) {
    //通过 NodeComparator 包装当前新增的、删除的的节点.
    NodeComparator comparator = new NodeComparator(slotTable.getDataServers(), currentDataNodeIps);
    SlotTableBuilder slotTableBuilder = new SlotTableBuilder(slotTable, slotNum, replicas);
    //执行 slotTableBuilder 的初始化
    slotTableBuilder.init(currentDataNodeIps);

    //在这里将已经下线的 data 节点删除掉、
    //其中已经删除的 是通过 NodeComparator 内部的getDiff方法 实现的。
    comparator.getRemoved().forEach(slotTableBuilder::removeDataServerSlots);
    return slotTableBuilder;
}
```

方法参数 SlotTable 是通过 SlotManager 对象获取到旧的的 SlotTable 对象。currentDataNodeIps 代表当前存活的 dataServer (通过心跳维持和 MetaServer 的连接) 然后传入 createSlotTableBuilder 方法内部。createSlotTableBuilder 方法内部通过  NodeComparator 对象计算并且包装了 旧的 "SlotTable 的节点列表" 与 传入的 currentDataNodeIps 之前的差异值。包括当前 CurrentDataNodeIps 中 新增和删除的 DataServer。随之调用 SlotTableBuilder 的 init 方法 。执行 SlotTableBuilder 的初始化。

SlotTableBuilder 的 init 源码如下。

```java
 public void init(List<String> dataServers) {
    for (int slotId = 0; slotId < slotNums; slotId++) {
      Slot slot = initSlotTable == null ? null : initSlotTable.getSlot(slotId);
      if (slot == null) {
        getOrCreate(slotId);
        continue;
      }
     //1. 重新新建一个 SlotBuilder 将原来的 Slot 里面的数据拷贝过来
     //2. 拷贝 leader节点
      SlotBuilder slotBuilder =
          new SlotBuilder(slotId, followerNums, slot.getLeader(), slot.getLeaderEpoch());
     //3. 拷贝 follow 节点。
      slotBuilder.addFollower(initSlotTable.getSlot(slotId).getFollowers())
      buildingSlots.put(slotId, slotBuilder);
    }
     //4. 初始化反向查询索引数据、通过 节点查询该节点目前管理哪些 slot
    initReverseMap(dataServers);
  }
```

由上面的代码可以看出实际上 init 做了这么一件事情: 初始化 SlotBuilder 内部的 slotBuilder 对象、并且将原来旧的 SlotTable  的 leader 和 follow 节点全部拷贝过去了。注意在实例化 SlotTableBuilder 的时候传入了旧的 SlotTable 也就是这里的 initSlotTable 对象。

init 方法最后一步的 initReverseMap 从名称可以看出构建了一个实例化反向路由表、反向查找表、从 Node 节点到 Slot 的查找功能、因为在之后的处理当中经常会用到 某一个 data 节点负责了那些 slot 的 leader 角色、以及哪些 slot 的 follow 角色. 所以这里做了一层索引处理。

再回到 ScheduledSlotArranger 类中 createSlotTableBuilder 方法最后一步，此时 SlotTableBulder 内部已经完成了 旧的 SlotTable 的数据拷贝。

```java
comparator.getRemoved().forEach(slotTableBuilder::removeDataServerSlots);  
```

上文我们说过  comparator 对象内部保存了 新的 dataServer 和旧的 'SlotTable 的节点列表' 比较信息。

所以在新的 dataServer 中已经删除的节点、我们需要从 SlotTableBuilder 中删除。内部的删除逻辑也是迭代所有的 SlotBuilder 比较 leader 和当前节点是否相同、相同则删除、follow 同理。

```java
public void removeDataServerSlots(String dataServer) {
    for (SlotBuilder slotBuilder : buildingSlots.values()) {
      //删除该 SlotBuilder  follow 节点中的 dataServer
      slotBuilder.removeFollower(dataServer)
      //如果该 SlotBuilder 的 leader 节点是 dataServer ，
      //那么设置该 slotBuilder 的leader节点为空、需要重新进行分配
      if (dataServer.equals(slotBuilder.getLeader())) {
        slotBuilder.setLeader(null);
      }
    }
    reverseMap.remove(dataServer);
}
```

总结来说创建 SlotTableBuilder 的过程就是根据旧的 SlotTable 实例化 SlotTableBuilder (内部的 SlotBuilder)、计算 旧的 'SlotTable 的节点列表' 和当前最新的 dataServer 的差异值、更新 SlotTableBuilder 内部的 SlotBuilder 相关的 leader 和 follow 值。

![image.png](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*_m4FSZ8rmnQAAAAAAAAAAAAAARQnAQ)

到这一步实际上已经做完了 SlotTableBuilder 的构建过程。到这里想想接下来该做什么呢？
可以想想，如果我们触发 SlotTable 重新分配的是某一个 dataA 节点下线了，那么在 slotTableBuilder::removeDataServerSlots 这一步会将我们正在创建的 SlotTableBuilder 中的 dataA 所管理的 Slot 的 leader 或者 follow 删除掉，那么该 Slot 的 leader 或者 follow 很可能就会变成空。也就是说该 Slot 没有 data 节点处理请求。于是我们根据当前 SlotBuilder 中是否有为完成分配的 Slot 来决定是否进行重新分配操作, 是否有未完成分配的 Slot 代码块如下。

```java
  public boolean hasNoAssignedSlots() {
    for (SlotBuilder slotBuilder : buildingSlots.values()) {
      if (StringUtils.isEmpty(slotBuilder.getLeader())) {
        //当前 Slot的leader节点为空
        return true;
      }
      if (slotBuilder.getFollowerSize() < followerNums) {
        //当前 Slot的follow节点的个数小于配置的 followerNums
        return true;
      }
    }
    return false;
  }
```

创建完成 SlotTableBuilder 并且有没有完成分配的 Slot, 执行真正的分配过程，如下图所示。

![image.png](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*lWp2QIWG9xwAAAAAAAAAAAAAARQnAQ)

由图可知分配过程最后委托给 DefaultSlotAssigner ，DefaultSlotAssigner 在构造方法中实例化了 当前正在创建的 **SlotTableBuilder /currentDataServers 的视图/MigrateSlotGroup**, 其中 **MigrateSlotGroup**

内部保存的是那些缺少 **leader**以及 **follow**的 **Slot**

```java
public class MigrateSlotGroup {
   //哪些 Slot 缺少 leader
  private final Set<Integer> leaders = Sets.newHashSet();
  //哪些Slot 缺少 follow 以及缺少的个数
  private final Map<Integer, Integer> lackFollowers = Maps.newHashMap();
}
```

assign 代码如下. 代码中先分配 缺少 leader 的 slot、随后分配缺少 follow 的 slot

```java
public SlotTable assign() {
    BalancePolicy balancePolicy = new NaiveBalancePolicy();
    final int ceilAvg =
        MathUtils.divideCeil(slotTableBuilder.getSlotNums(), currentDataServers.size());
    final int high = balancePolicy.getHighWaterMarkSlotLeaderNums(ceilAvg);
    
    //分配缺少leader的slot
    if (tryAssignLeaderSlots(high)) {
      slotTableBuilder.incrEpoch();
    } 
    //分配缺少 follow 的 slot
    if (assignFollowerSlots()) {
      slotTableBuilder.incrEpoch();
    } 
    return slotTableBuilder.build();
}
```

#### leader 节点分配

进入 tryAssignLeaderSlots 方法内部查看具体分配算法细节。通过代码注释的方式来解释具体实现。

```java
private boolean tryAssignLeaderSlots(int highWatermark) {
    //按照 follows 节点的数量 从大到小排序 0比较特殊排在最后面,0 为什么比较特殊呢、因为无论怎么分配、
    //最终选择出来的leader一定不是该slot的follow、因为该slot的follow为空
    //优先安排 follow节点比较少的 Slot
    //其实这点也可以想明白的。这些没有 leader 的 slot 分配顺序肯定是要根据 follow节点越少的优先分配最好
    //以防止这个 follow 也挂了、那么数据就有可能会丢失了。
    List<Integer> leaders =
        migrateSlotGroup.getLeadersByScore(new FewerFollowerFirstStrategy(slotTableBuilder));
    for (int slotId : leaders) {
      List<String> currentDataNodes = Lists.newArrayList(currentDataServers);
       //选择 nextLeader 节点算法?
      String nextLeader =
          Selectors.slotLeaderSelector(highWatermark, slotTableBuilder, slotId)
              .select(currentDataNodes);
      //判断nextLeader是否是当前slot的follow节点 将follow节点提升为主节点的。 
      boolean nextLeaderWasFollower = isNextLeaderFollowerOfSlot(slotId, nextLeader);
      // 将当前 slot 的 leader 节点用选择出来的 nextLeader 替换
      slotTableBuilder.replaceLeader(slotId, nextLeader);
      if (nextLeaderWasFollower) {
        //因为当前 Slot 将 follow节点提升为leader节点了、那么该 Slot 肯定 follows 个数又不够了、需要再次分配 follow 节点
        migrateSlotGroup.addFollower(slotId);
      }
    }
    return true;
  }
```

上面分配 leader 代码中核心选择 nextLeader 方法。

```java
 String nextLeader =
          Selectors.slotLeaderSelector(highWatermark, slotTableBuilder, slotId)
              .select(currentDataNodes);
```

通过 Selectors 选择一个 合适的 leader 节点。

继续追踪 DefaultSlotLeaderSelector.select 方法内部。同理我们采用代码注释的方式来解释具体实现。

```java
public String select(Collection<String> candidates) {
  //candidates: 当前所有的候选节点，也是 tryAssignLeaderSlots 方法传入的 currentDataServers
  Set<String> currentFollowers = slotTableBuilder.getOrCreate(slotId).getFollowers();
  Collection<String> followerCandidates = Lists.newArrayList(candidates);
  followerCandidates.retainAll(currentFollowers);
  //经过 followerCandidates.retainAll(currentFollowers)) 之后 followerCandidates 
  //仅仅保留 当前 Slot 的 follow 节点
  //并且采取了一个策略是 当前 follow 节点作为其他 Slot 的leader最少的优先、
  //用直白的话来说。
  //当前 follower 越是没有被当做其他 Slot 的leader节点、那么
  //证明他就是越 '闲' 的。必然优先考虑选择它作为leader 节点。
  String leader = new LeastLeaderFirstSelector(slotTableBuilder).select(followerCandidates);
  if (leader != null) {
    DataNodeSlot dataNodeSlot = slotTableBuilder.getDataNodeSlot(leader);
    if (dataNodeSlot.getLeaders().size() < highWaterMark) {
      return leader;
    }
  }
  //从其他的机器中选择一个，优先选择充当 leader 的 slot 个数最少的那一个 DataServer
  return new LeastLeaderFirstSelector(slotTableBuilder).select(candidates);
}
```

通过上面 select 方法源码注释相信可以很容易理解 SOFARegistry 的做法。总结来说，就是首先从 当前 slot 的 follow 节点中找出 leader，因为在此情况下不需要做数据迁移，相当于主节点挂了，提升备份节点为主节点实现高可用。但是具体选择哪一个，SOFARegistry 采取的策略是
在所有的 follow 节点中找出最 "闲"的那一个，但是如果它所有的 follow 节点作为 leader 节点管理的 Slot 个数大于 highWaterMark，那么证明该 Slot 的所有 follow 节点都太"忙"了，那么就会从全部存活的机器中选择一个 "当作为 leader 节点管理的 Slot 个数"最少的那一个，但是这种情况其实有数据同步开销的。

#### follow 节点分配

同理通过源码注解方式来详述

```java
  private boolean assignFollowerSlots() {
    //使用 FollowerEmergentScoreJury 排序得分策略表明
    // 某一个 slot 缺少越多 follow、排序越靠前。  
    List<MigrateSlotGroup.FollowerToAssign> followerToAssigns =
        migrateSlotGroup.getFollowersByScore(new FollowerEmergentScoreJury());
    int assignCount = 0;
    for (MigrateSlotGroup.FollowerToAssign followerToAssign : followerToAssigns) {
      // 当前待分配的 slotId
      final int slotId = followerToAssign.getSlotId();
      // 当前 slotId 槽中还有多少待分配的 follow 从节点。依次迭代分配。
      for (int i = 0; i < followerToAssign.getAssigneeNums(); i++) {
        final List<String> candidates = Lists.newArrayList(currentDataServers);
        // 根据上文中的 DataNodeSlot 结构、依据 节点被作为follow 的slot的个数从小到大排序。
        // follows 个数一样、按照最少作为 leader 节点进行排序。
        // 其实最终目的就是找到最 "闲" 的那一台机器。
        candidates.sort(Comparators.leastFollowersFirst(slotTableBuilder));
        boolean assigned = false;
        for (String candidate : candidates) {
          DataNodeSlot dataNodeSlot = slotTableBuilder.getDataNodeSlot(candidate);
          //跳过已经是它的 follow 或者 leader 节点的Node节点
          if (dataNodeSlot.containsFollower(slotId) || dataNodeSlot.containsLeader(slotId)) {
            continue;
          }
          //给当前 slotId 添加候选 follow 节点。
          slotTableBuilder.addFollower(slotId, candidate);
          assigned = true;
          assignCount++;
          break;
        }
      }
    }
    return assignCount != 0;
  }
```

如之前所述、MigrateSlotGroup 保存了 需要进行重新分配 leader 以及 follow 的 Slot 信息。算法的主要步骤如下。

1. 找到所有没有足够 follow 的 Slot 信息
2. 根据 缺少 follow 个数越多越优先原则排序
3. 迭代所有缺少 follow 的 Slot 信息 这里是 被 MigrateSlotGroup.FollowerToAssign 包装
4. 内部循环迭代缺少 follow 大小、添加给该 Slot 所需的 follow
5. 对候选 dataServer 进行排序、按照 “闲、忙“成都进行排序
6. 执行添加 follow 节点

到此、我么已经给缺少 leader 或者 follow 的 Slot 完成了节点分配。

#### SlotTable 平衡算法

了解完 SlotTable 的变更过程以及算法之后、相信大家对此有了自己的理解。那么 SlotTable 的平衡过程其实也是类似的。详情可以参考源码`com.alipay.sofa.registry.server.Meta.slot.balance.DefaultSlotBalancer。`

因为在节点的频繁上下线过程中、势必会导致某一些节点的负载(负责的 slot 管理数量)过高、某些节点的负载又很低、这样需要一种动态平衡机制来保证节点的相对负载均衡。

入口在 DefaultSlotBalancer.balance 方法内部

```java
public SlotTable balance() {
    //平衡 leader 节点
    if (balanceLeaderSlots()) {
      LOGGER.info("[balanceLeaderSlots] end");
      slotTableBuilder.incrEpoch();
      return slotTableBuilder.build();
    }
    if (balanceHighFollowerSlots()) {
      LOGGER.info("[balanceHighFollowerSlots] end");
      slotTableBuilder.incrEpoch();
      return slotTableBuilder.build();
    }
    if (balanceLowFollowerSlots()) {
      LOGGER.info("[balanceLowFollowerSlots] end");
      slotTableBuilder.incrEpoch();
      return slotTableBuilder.build();
    }
    // check the low watermark leader, the follower has balanced
    // just upgrade the followers in low data server
    if (balanceLowLeaders()) {
      LOGGER.info("[balanceLowLeaders] end");
      slotTableBuilder.incrEpoch();
      return slotTableBuilder.build();
    }
    return null;
}
```

由于篇幅限制、这里只分析 leader 节点平衡过程。如上源码中的 balanceLeaderSlots() 其余过程和 它类似、感兴趣的读者也可以自己查找源码分析。

进入 balanceLeaderSlots 方法内部。

```java
  private boolean balanceLeaderSlots() {
    //这里就是找到每一个节点 dataServer 作为leader的 slot 个数的最大天花板值----> 
    //容易想到的方案肯定是平均方式、一共有 slotNum 个slot、
    //将这些slot的leader归属平均分配给 currentDataServer
    final int leaderCeilAvg = MathUtils.divideCeil(slotNum, currentDataServers.size());
    if (upgradeHighLeaders(leaderCeilAvg)) {
      //如果有替换过 leader、那么就直接返回、不用进行 migrateHighLeaders 操作
      return true;
    }
    if (migrateHighLeaders(leaderCeilAvg)) {
      //经过上面的 upgradeHighLeaders 操作
      //不能找到 follow 进行迁移、因为所有的follow也都很忙、在 exclude 当中、
      //所以没法找到一个follow进行迁移。那么我们尝试迁移 follow。
      //因为 highLeader 的所有 follower 都是比较忙、所以需要将这些忙的节点进行迁移、期待给这些 highLeader 所负责的 slot 替换一些比较清闲的 follow
      return true;
    }
    return false;
  }

```

我们重点关注 upgradeHighLeaders 方法、同理采用源码注解的方式

```java
 private boolean upgradeHighLeaders(int ceilAvg) {
    //"如果一个节点的leader的slot个数大于阈值、那么就会用目标slot的follow节点来替换当前leader"  最多移动 maxMove次数
    final int maxMove = balancePolicy.getMaxMoveLeaderSlots();
    //理解来说这块可以直接将节点的 leader 个数大于 ceilAvg 的 节点用其他节点替换就可以了、为什么还要再次向上取整呢?
    //主要是防止slotTable出现抖动，所以设定了触发变更的上下阈值 这里向上取整、是作为一个不平衡阈值来使用、
    // 就是只针对于不平衡多少(这个多少可以控制)的进行再平衡处理
    final int threshold = balancePolicy.getHighWaterMarkSlotLeaderNums(ceilAvg);
    int balanced = 0;
    Set<String> notSatisfies = Sets.newHashSet();
    //循环执行替换操作、默认执行 maxMove 次
    while (balanced < maxMove) {
      int last = balanced;
      //1. 找到 哪些节点的 leader 个数 超过 threshold 、并对这些节点按照leader 的个数的从大到小排列。
      final List<String> highDataServers = findDataServersLeaderHighWaterMark(threshold);
      if (highDataServers.isEmpty()) {
        break;
      }
      // 没有任何 follow 节点能用来晋升到 leader 节点
      if (notSatisfies.containsAll(highDataServers)) {
        break;
      }
      //2. 找到可以作为新的leader的 节点，但是不包含已经不能添加任何leader的节点、因为这些节点的leader已经超过阈值了。
      final Set<String> excludes = Sets.newHashSet(highDataServers);
      excludes.addAll(findDataServersLeaderHighWaterMark(threshold - 1));
      for (String highDataServer : highDataServers) {
        if (notSatisfies.contains(highDataServer)) {
          //如果该节点已经在不满足替换条件队列中、则不在进行查找可替换节点操作
          continue;
        }
        //找到可以作为新的leader的 节点，但是不包含已经不能添加任何leader的节点、因为这些节点的leader已经超过阈值了。
        //算法过程是: 
        //1. 从 highDataServer 所负责的所有 slot 中找到某一个 slot、这个 slot 满足一个条件就是: 该 slot 的 follow 节点中有一个最闲(也就是 节点的leader的最小)
        //2. 找到这个 slot、我们只需要替换该 slot 的leader为找到的follow
        
        //其实站在宏观的角度来说就是将 highDataServer 节点leader 的所有slot的follow节点按照闲忙程度进行排序、
        //找到那个最闲的、然后让他当leader。这样就替换了 highDataServer 当leader了
        Tuple<String, Integer> selected = selectFollower4LeaderUpgradeOut(highDataServer, excludes);
        if (selected == null) {
          //没有找到任何 follow节点用来代替 highDataServer节点、所以该节点不满足可替换条件、加入到 notSatisfies 不可替换队列中. 以便于外层循环直接过滤。
          notSatisfies.add(highDataServer);
          continue;
        }
        //找到 highDataServer 节点的某一个可替换的 slotId
        final int slotId = selected.o2;
        // 找到 slotId 替换 highDataServer 作为leader 的节点 newLeaderDataServer
        final String newLeaderDataServer = selected.o1; 
        // 用 newLeaderDataServer 替换 slotId 旧的 leader 节点。
        slotTableBuilder.replaceLeader(slotId, newLeaderDataServer); 
        balanced++;
      }
      if (last == balanced) break;
    }
    return balanced != 0;
  }
```

进入关键查找可替换的 slotId 和新的 leader 节点的过程，同理采用源码注解的方式。

```java
  /*
    从 leaderDataServer 所leader的所有slot中、选择一个可以替换的slotId
    和新的leader来替换leaderDataServer
   */
  private Tuple<String, Integer> selectFollower4LeaderUpgradeOut(
      String leaderDataServer, Set<String> excludes) {
    //获取当前 leaderDataServer 节点 leader 或者 follow 的slotId 视图。DataNodeSlot 结构我们上文有说过。
    final DataNodeSlot dataNodeSlot = slotTableBuilder.getDataNodeSlot(leaderDataServer);

    Set<Integer> leaderSlots = dataNodeSlot.getLeaders();
    Map<String, List<Integer>> dataServers2Followers = Maps.newHashMap();
    //1. 从 dataNodeSlot 获取 leaderDataServer 节点leader的所有slotId: leaderSlots
    for (int slot : leaderSlots) {
      //2. 从slotTableBuilder 中找出当前 slot 的follow
      List<String> followerDataServers = slotTableBuilder.getDataServersOwnsFollower(slot);
      //3. 去掉excludes ，得到候选节点，因为 excludes 肯定不会是新的 leader 节点
      followerDataServers = getCandidateDataServers(excludes, null, followerDataServers);
      //4. 构建 候选节点到 slotId 集合的映射关系。
      for (String followerDataServer : followerDataServers) {
        List<Integer> followerSlots =
            dataServers2Followers.computeIfAbsent(followerDataServer, k -> Lists.newArrayList());
        followerSlots.add(slot);
      }
    }
    if (dataServers2Followers.isEmpty()) {
      //当 leaderDataServer 节点的follow 都是 excludes 中的成员时候、那么就有可能是空的。
      return null;
    }
    List<String> dataServers = Lists.newArrayList(dataServers2Followers.keySet());
    //按照 候选节点的 leader的 slot 个数升序排序、也就是也就是找到那个最不忙的，感兴趣可以查看 leastLeadersFirst 方法内部实现。
    dataServers.sort(Comparators.leastLeadersFirst(slotTableBuilder));
    final String selectedDataServer = dataServers.get(0);
    List<Integer> followers = dataServers2Followers.get(selectedDataServer);
    return Tuple.of(selectedDataServer, followers.get(0));
  }

```

至此我们完成了 高负载 leader 节点的替换、在此过程中如果有替换过、那么直接返回、如果没有替换过、我们会继续执行 DefaultSlotBalancer 中的 migrateHighLeaders 操作。因为如果经过 DefaultSlotBalancer 中的 upgradeHighLeaders 操作之后没有进行过任何 leader 的替换、那么证明 高负载的 leader 节点同样它的 follow 节点也很忙、所以需要做得就是对这些忙的 follow 节点也要进行迁移。我们继续通过源码注释的方式来查看具体的过程。

```java
private boolean migrateHighLeaders(int ceilAvg) {
    final int maxMove = balancePolicy.getMaxMoveFollowerSlots();
    final int threshold = balancePolicy.getHighWaterMarkSlotLeaderNums(ceilAvg);

    int balanced = 0;
    while (balanced < maxMove) {
      int last = balanced;
      // 1. find the dataNode which has leaders more than high water mark
      //    and sorted by leaders.num desc
      final List<String> highDataServers = findDataServersLeaderHighWaterMark(threshold);
      if (highDataServers.isEmpty()) {
        return false;
      }
      // 2. find the dataNode which could own a new leader
      // exclude the high
      final Set<String> excludes = Sets.newHashSet(highDataServers);
      // exclude the dataNode which could not add any leader
      excludes.addAll(findDataServersLeaderHighWaterMark(threshold - 1));
      final Set<String> newFollowerDataServers = Sets.newHashSet();
      // only balance highDataServer once at one round, avoid the follower moves multi times
      for (String highDataServer : highDataServers) {
        Triple<String, Integer, String> selected =
            selectFollower4LeaderMigrate(highDataServer, excludes, newFollowerDataServers);
        if (selected == null) {
          continue;
        }
        final String oldFollower = selected.getFirst();
        final int slotId = selected.getMiddle();
        final String newFollower = selected.getLast();
        slotTableBuilder.removeFollower(slotId, oldFollower);
        slotTableBuilder.addFollower(slotId, newFollower);
        newFollowerDataServers.add(newFollower);
        balanced++;
      }
      if (last == balanced) break;
    }
    return balanced != 0;
  }
```

### 3. session 和 data 节点如何使用路由表

上文我们 了解了 SlotTable 路由表在心跳中从 Meta 节点获取并且更新到本地中、那么 session 和 data 节点如何使用路由表呢。首先我们先看看 session 节点如何使用 SlotTable 路由表。 session 节点承担着客户端的发布订阅请求，并且通过 SlotTable 路由表对 data 节点的数据进行读写; session 节点本地 SlotTable 路由表保存在 SlotTableCacheImpl 。

```java
public final class SlotTableCacheImpl implements SlotTableCache {
  // 不同计算 slot 位置的算法抽象
  private final SlotFunction slotFunction = SlotFunctionRegistry.getFunc();

  //本地路由表、心跳中从 Meta 节点获取到。
  private volatile SlotTable slotTable = SlotTable.INIT;
    
    
  //根据 dataInfoId 获取 slotId
  @Override
  public int slotOf(String dataInfoId) {
    return slotFunction.slotOf(dataInfoId);
  }
}
```

源码中的 SlotFunctionRegistry 注册了两种算法实现。分别是 crc32 和 md5 实现、源码如下所示。

```java
public final class SlotFunctionRegistry {
  private static final Map<String, SlotFunction> funcs = Maps.newConcurrentMap();

  static {
    register(Crc32cSlotFunction.INSTANCE);
    register(MD5SlotFunction.INSTANCE);
  }

  public static void register(SlotFunction func) {
    funcs.put(func.name(), func);
  }

  public static SlotFunction getFunc() {
    return funcs.get(SlotConfig.FUNC);
  }
}

```

随便选择某一个算法、例如 MD5SlotFunction、根据 dataInfoId 计算 slotId 的实现如下。

```java
public final class MD5SlotFunction implements SlotFunction {
  public static final MD5SlotFunction INSTANCE = new MD5SlotFunction();

  private final int maxSlots;
  private final MD5HashFunction md5HashFunction = new MD5HashFunction();

  private MD5SlotFunction() {
    this.maxSlots = SlotConfig.SLOT_NUM;
  }
  //计算 slotId的最底层逻辑。可见也是通过取hash然后对 slot槽个数取余
  @Override
  public int slotOf(Object o) {
    // make sure >=0
    final int hash = Math.abs(md5HashFunction.hash(o));
    return hash % maxSlots;
  }
}
```

了解了具体根据 DataInfoId 来通过 SlotTable 获取具体的数据 slotId，我们来看看在 session 节点中何时触发计算 datInfoId 的 slotId。我们可以想想，一般 session 节点使用来处理客户端的发布订阅请求，那么当有发布请求的时候，发布的数据同时也会向 data 节点写入发布的元数据，那么肯定需要知道该数据保存在哪一台机器上，此时就需要根据 dataInfoId 找到对应的 slotId，进而找到对应的 leader 节点，通过网络通讯工具将发布请求转发给该节点处理，session 数据接收发布请求处理 handler 为 PublisherHandler。

![image.png](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*h_09T5C-RVkAAAAAAAAAAAAAARQnAQ)

如上面时序图所示、在 DataNodeServiceImpl 最后的 commitReq 方法中会将发布请求添加到内部的 BlockingQueue 当中去，DataNodeServiceImpl 内部的 Worker  对象会消费 BlockingQueue 中内部执行真正的数据写入过程。详细源码请参考 :

```java
private final class Worker implements Runnable {
    final BlockingQueue<Req> queue;
    Worker(BlockingQueue<Req> queue) {
      this.queue = queue;
    }

    @Override
    public void run() {
      for (; ; ) {
          final Req firstReq = queue.poll(200, TimeUnit.MILLISECONDS);
          if (firstReq != null) {
            Map<Integer, LinkedList<Object>> reqs =
                drainReq(queue, sessionServerConfig.getDataNodeMaxBatchSize());
            //因为 slot 的个数有可能大于 work/blockingQueue 的个数、所以
            //并不是一个 slot 对应一个 work、那么一个blockQueue 中可能存在发往多个slot的数据、这里
            //有可能一次发送不完这么多数据、需要分批发送、将首先进入队列的优先发送了。
            LinkedList<Object> firstBatch = reqs.remove(firstReq.slotId);
            if (firstBatch == null) {
              firstBatch = Lists.newLinkedList();
            }
            firstBatch.addFirst(firstReq.req);
            request(firstReq.slotId, firstBatch);
            for (Map.Entry<Integer, LinkedList<Object>> batch : reqs.entrySet()) {
              request(batch.getKey(), batch.getValue());
            }
          }
        }
     }
 }

private boolean request(BatchRequest batch) {
  final Slot slot = getSlot(batch.getSlotId());
  batch.setSlotTableEpoch(slotTableCache.getEpoch());
  batch.setSlotLeaderEpoch(slot.getLeaderEpoch());
  sendRequest(
      new Request() {
        @Override
        public Object getRequestBody() {
          return batch;
        }

        @Override
        public URL getRequestUrl() {
          //通过 slot 路由表找到对应的 leader data节点，这
          //个路由表是 心跳中从 Meta 节点获取来的。
          return getUrl(slot);
        }
      });
  return true;
}
```
