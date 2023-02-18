---
title: "源码解析｜registry meta 选主"
author: "Webster-Yang"
authorlink: "https://github.com/Webster-Yang"
description: "源码解析｜registry meta选主"
categories: "SOFAStack"
tags: [“源码解析”]
date: 2022-05-11T15:00:00+08:00
---

## 背景

SOFARgeistry 分为 Session、Data 和 Meta 三个模块。Session 模块用于 client 交互，可以横向扩容，可以承受大量 client 连接请求；Data 是数据存储模块，利用 slot 分片机制来均衡负载，使用备份来解决高可用问题；Meta 是 Session、Data 的注册中心，采用分布式锁来选举 leader，本文详细阐述 Meta 如何选主。

## 基于 MySQL 的分布式锁

MySQL 表

```plain
drop table if exists distribute_lock;
CREATE TABLE distribute_lock (
  id bigint(20) NOT NULL AUTO_INCREMENT primary key,
  data_center varchar(128) NOT NULL,
  lock_name varchar(1024) NOT NULL,
  owner varchar(512) NOT NULL,
  duration bigint(20) NOT NULL,
  term     bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT '任期',
  term_duration    bigint(20) unsigned NOT NULL DEFAULT 0 COMMENT '租期',
  gmt_create timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  gmt_modified timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_data_center_lock` (`data_center`, `lock_name`),
  KEY `idx_lock_owner` (`owner`)
);
```

表的增改查等操作

```plain
public interface DistributeLockMapper {

  /**
   * query by dataCenter and lockName
   *
   * @param dataCenter
   * @param lockName
   * @return
   */
  public DistributeLockDomain queryDistLock(
      @Param("dataCenter") String dataCenter, @Param("lockName") String lockName);

  /**
   * compete lock, it will throw exception if lockName existed
   *
   * @param lock
   */
  public void competeLockOnInsert(DistributeLockDomain lock) throws Exception;

  /**
   * compete lock with cas
   *
   * @param competeLock
   * @return
   */
  public void competeLockOnUpdate(FollowCompeteLockDomain competeLock);

  /** renew lock last update time */
  public void ownerHeartbeat(DistributeLockDomain lock);

  /** force reset owner and duration */
  public void forceRefresh(DistributeLockDomain lock);
}
```

## 整体流程

step1：启动时创建锁记录，

```plain
<insert id="competeLockOnInsert" parameterType="com.alipay.sofa.registry.jdbc.domain.DistributeLockDomain">
        <![CDATA[
       INSERT /*+ QUERY_TIMEOUT(2000000) */ INTO distribute_lock
       (
           data_center,
           lock_name,
           owner,
           duration,
           gmt_create,
           gmt_modified,
           `term`,
           `term_duration`
       )
       VALUES
       (
           #{dataCenter},
           #{lockName},
           #{owner},
           #{duration},
           NOW(3),
           NOW(3),
           1,
           0
       )
       ON DUPLICATE KEY UPDATE lock_name = #{lockName}
       ]]>
    </insert>
```

step2：leader 每秒提交心跳，更新表

```plain
    <update id="ownerHeartbeat" parameterType="com.alipay.sofa.registry.jdbc.domain.DistributeLockDomain">
        <![CDATA[
          update /*+ QUERY_TIMEOUT(2000000) */ distribute_lock set owner = #{owner}, gmt_modified =  NOW(3), `term_duration` = (`term_duration` + 1)
          where data_center = #{dataCenter} and lock_name = #{lockName} and owner = #{owner} and term = #{term}  and `term_duration` = #{termDuration} and timestampdiff(SECOND, gmt_modified, NOW()) < #{duration}/1000
        ]]>
    </update>
```

step3：follower 每秒判断锁是否过期，如果过期，则 cas 竞选 leader

```plain
  public DistributeLockDomain onFollowWorking(DistributeLockDomain lock, String myself) {
    /** as follow, do compete if lock expire */
    if (lock.expire()) {
      LOG.info("lock expire: {}, meta elector start: {}", lock, myself);
      distributeLockMapper.competeLockOnUpdate(
          new FollowCompeteLockDomain(
              lock.getDataCenter(),
              lock.getLockName(),
              lock.getOwner(),
              lock.getGmtModified(),
              myself,
              lock.getDuration(),
              lock.getTerm(),
              lock.getTermDuration()));
      DistributeLockDomain newLock =
          distributeLockMapper.queryDistLock(lock.getDataCenter(), lock.getLockName());
      LOG.info("elector finish, new lock: {}", lock);
      return newLock;
    }
    return lock;
  }
  public boolean expire() {

    return gmtDbServerTime.getTime() > gmtModified.getTime() + duration;
  }
  <update id="competeLockOnUpdate">
        <!-- update cas with dataCenter,lockName,owner,gmtModified  -->
        <![CDATA[
       update /*+ QUERY_TIMEOUT(2000000) */ distribute_lock set owner = #{newOwner}, gmt_modified =  NOW(3), term = (term + 1) , `term_duration` = 0
       where data_center = #{dataCenter} and lock_name = #{lockName} and owner = #{owner} and term = #{term} and `term_duration` = #{termDuration} and timestampdiff(SECOND, gmt_modified, NOW()) > #{duration}/1000
       ]]>
    </update>
```

step4：如果 leader 发生切换，通知 xxx


## 时序图

💡 Tips：输入`/画板`或点击上方工具栏![img](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*Ab3yRqrz93MAAAAAAAAAAAAAARQnAQ)，选择「画板」、绘制流程图、架构图等各种图形。

![img](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*O_1BQ6Vp2NsAAAAAAAAAAAAAARQnAQ)

## 类图

![img](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*XtshQYseiH8AAAAAAAAAAAAAARQnAQ)

## 主要源代码解析

```plain
  public void elect() {
    synchronized (this) {
      if (isObserver) {//如果是Observer，不参与选主
        leaderInfo = doQuery();
      } else {
        leaderInfo = doElect();
      }

      if (amILeader()) {//我是leader
        onIamLeader();//我从follower变成leader，通知xxx
      } else {//我不是leader
        onIamNotLeader();//我从leader变成follower，通知xxx
      }
    }
  }
@Override
  protected LeaderInfo doElect() {
    //1、查询锁
    DistributeLockDomain lock =
        distributeLockMapper.queryDistLock(defaultCommonConfig.getClusterId(tableName()), lockName);
   //2、不存在则创建锁
    /** compete and return leader */
    if (lock == null) {
      return competeLeader(defaultCommonConfig.getClusterId(tableName()));
    }
   //3、判断角色
    ElectorRole role = amILeader(lock.getOwner()) ? ElectorRole.LEADER : ElectorRole.FOLLOWER;
    if (role == ElectorRole.LEADER) {
      lock = onLeaderWorking(lock, myself());//4、提交心跳
    } else {
      lock = onFollowWorking(lock, myself());//5、判断过期与否，如过期，则cas竞争锁
    }
    LeaderInfo result = leaderFrom(lock);//6、锁信息转换为LeaderInfo
    LOG.info("meta role : {}, leaderInfo: {}", role, result);
    return result;
  }
```

## Meta 集群 leader 变更

1、初始化

| ip             | 角色     | 备注 |
| -------------- | -------- | ---- |
| 10.177.41.99   | follower |      |
| 10.177.41.100  | leader   |      |
| 10.181.152.223 | follower |      |

![img](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*PieFQ7uw3eYAAAAAAAAAAAAAARQnAQ)

![img](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*y4UKRKevH3QAAAAAAAAAAAAAARQnAQ)

2、kill 10.177.41.100 节点后

| ip            | 角色     | 备注                                                         |
| ------------- | -------- | ------------------------------------------------------------ |
| 10.177.41.99  | follower | competeLockOnUpdate执行失败，即 term 、term_duration匹配不上，sql没有修改行数据 |
| 10.177.41.100 |          | kill                                                         |
| 10.181.160.18 | leader   | competeLockOnUpdate执行成功，即 term 、term_duration匹配的上，即当选leader，之后term 递增 |

![img](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*V0uGSqlpWD0AAAAAAAAAAAAAARQnAQ)

![img](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*ztYrQrX7O7gAAAAAAAAAAAAAARQnAQ)

3、kill 10.181.160.18 节点后

| ip            | 角色   | 备注                                    |
| ------------- | ------ | --------------------------------------- |
| 10.177.41.99  | leader | competeLockOnUpdate执行成功，当选leader |
| 10.177.41.100 |        | kill                                    |
| 10.181.160.18 |        | kill                                    |

![img](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*eOOGRpfWue4AAAAAAAAAAAAAARQnAQ)

![img](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*fOdxTrCkpFEAAAAAAAAAAAAAARQnAQ)
