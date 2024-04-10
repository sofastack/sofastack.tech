---
title: "Seata AT 模式代码级详解"
authorlink: "https://github.com/sofastack"
description: "Seata AT 模式代码级详解"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2022-09-20T15:00:00+08:00
cover: "https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/275e33798446427cb252de514e6b1656~tplv-k3u1fbpfcp-zoom-crop-mark:3024:3024:3024:1702.awebp?"
---

文｜

刘月财

seata-go 项目负责人

北京小桔科技有限公司【滴滴】开发工程师

赵新（花名：于雨 )

蚂蚁集团 Seata 项目开源负责人

本文**5343**字 阅读 **14**分钟

## 背景

Seata 四种事务模式中，AT 事务模式是阿里体系独创的事务模式，对业务无侵入，也是 Seata 用户最多的一种事务模式，兼具易用性与高性能。

目前，Seata 社区正大力推进其多语言版本建设，Go、PHP、JS 和 Python 四个语言版本基本完成了 TCC 事务模式的实现。参照 Seata v1.5.2 版本的 AT 模式的实现，并结合 Seata 官方文档，本文尝试从代码角度详解 Seata AT 事务模式的详细流程，目的是梳理 Seata Java 版本 AT 模式的实现细节后，在多语言版本后续开发中，优先实现 AT 事务模式。

## 1、什么是 AT 模式？

AT 模式是一种二阶段提交的分布式事务模式，它采用了本地 undo log 的方式来数据在修改前后的状态，并用它来实现回滚。从性能上来说，AT 模式由于有 undo log 的存在，一阶段执行完可以立即释放锁和连接资源，吞吐量比 XA 模式高。用户在使用 AT 模式的时候，只需要配置好对应的数据源即可，事务提交、回滚的流程都由 Seata 自动完成，对用户业务几乎没有入侵，使用便利。

## 2、AT 模式与 ACID 和 CAP

谈论数据库的事务模式，一般都会先谈论事务相关的 ACID 特性，但在分布式场景下，还需要考虑其 CAP 性质。

### 2.1 AT 与 ACID

数据库事务要满足原子性、一致性、持久性以及隔离性四个性质，即 ACID 。在分布式事务场景下，一般地，首先保证原子性和持久性，其次保证一致性，隔离性则因为其使用的不同数据库的锁、数据 MVCC 机制以及相关事务模式的差异， 具有多种隔离级别，如 MySQL 自身事务就有读未提交（Read Uncommitted）、读已提交（Read Committed）、可重复读（Repeatable Read）、序列化（Serializable）等四种隔离级别。

#### 2.1.1 AT 模式的读隔离

在数据库本地事务隔离级别**读已提交（Read Committed）** 或以上的基础上，Seata（AT 模式）的默认全局隔离级别是**读未提交（Read Uncommitted）** 。

如果应用在特定场景下，必须要求全局的**读已提交**，目前 Seata 的方式是通过 SELECT FOR UPDATE 语句的代理。

SELECT FOR UPDATE 语句的执行会查询**全局锁**，如果**全局锁**被其他事务持有，则释放本地锁（回滚 SELECT FOR UPDATE 语句的本地执行）并重试。这个过程中，查询是被 block 住的，直到**全局锁**拿到，即读取的相关数据是**已提交**的，才返回。

出于总体性能上的考虑，Seata 目前的方案并没有对所有 SELECT 语句都进行代理，仅针对 FOR UPDATE 的 SELECT 语句。

详细例子参考 Seata 官网：*[https://seata.io/zh-cn/docs/dev/mode/at-mode.html](https://seata.io/zh-cn/docs/dev/mode/at-mode.html)*

#### 2.1.2 AT 模式的写隔离

AT 会对写操作的 SQL 进行拦截，提交本地事务前，会向 TC 获取全局锁，未获取到全局锁的情况下，不能进行写，以此来保证不会发生写冲突：

**-** 一阶段本地事务提交前，需要确保先拿到**全局锁**；

**-** 拿不到**全局锁**，不能提交本地事务；

**-** 拿**全局锁**的尝试被限制在一定范围内，超出范围将放弃，并回滚本地事务，释放本地锁。

详细例子参考 Seata 官网：*[https://seata.io/zh-cn/docs/dev/mode/at-mode.html](https://seata.io/zh-cn/docs/dev/mode/at-mode.html)*

### 2.2 AT 与 CAP

Seata 所有的事务模式在一般情况下，是需要保证 CP，即一致性和分区容错性，因为分布式事务的核心就是要保证数据的一致性（包括弱一致性）。比如，在一些交易场景下，涉及到多个系统的金额的变化，保证一致性可以避免系统产生资损。

分布式系统不可避免地会出现服务不可用的情况，如 Seata 的 TC 出现不可用时，用户可能希望通过服务降级，优先保证整个服务的可用性，此时 Seata 需要从 CP 系统转换为一个保证 AP 的系统。

比如，有一个服务是给用户端提供用户修改信息的功能，假如此时 TC 服务出现问题，为了不影响用户的使用体验，我们希望服务仍然可用，只不过所有的 SQL 的执行降级为不走全局事务，而是当做本地事务执行。

AT 模式默认优先保证 CP，但提供了配置通道让用户在 CP 和 AP 两种模式下进行切换：

**-** 配置文件的 tm.degrade-check 参数，其值为 true 则分支事务保证 AP，反之保证 CP；

**-** 手动修改配置中心的 service.disableGlobalTransaction 属性为 true，则关闭全局事务实现 AP。

## 3、AT 数据源代理

在 AT 模式中，用户只需要配置好 AT 的代理数据源即可， AT 的所有流程都在代理数据源中完成，对用户无感知。

AT 数据源代理的整体类结构如下图：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6c080b82054b4f1aa46fe0e899f3bfc1~tplv-k3u1fbpfcp-zoom-1.image)

 AT 事务数据源代理类结构图【from *[https://seata.io/zh-cn/docs/dev/mode/xa-mode.html](https://seata.io/zh-cn/docs/dev/mode/xa-mode.html)*】

AT 的数据源代理中，分别对目标数据库的 DataSource 、 Connection 和 Statement  进行了代理，在执行目标 SQL 动作之前，完成了 RM 资源注册、 undo log 生成、分支事务注册、分支事务提交/回滚等操作，而这些操作对用户并无感知。

下面的时序图中，展示了 AT 模式在执行过程中，这几个代理类的动作细节：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/14654d9c71c5444899b66d1e53615e55~tplv-k3u1fbpfcp-zoom-1.image)

注：图片建议在 PC 端查看

## 4、AT 模式流程

以下是 AT 模式的整体流程，从这里可以看到分布式事务各个关键动作的执行时机，每个动作细节，我们后面来讨论：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/57696b4994cf4381b4560518fbac4b26~tplv-k3u1fbpfcp-zoom-1.image)

注：图片建议在 PC 端查看

### 4.1 一阶段

在 AT 模式的第一阶段， Seata 会通过代理数据源，拦截用户执行的业务 SQL ，假如用户没有开启事务，会自动开启一个新事务。如果业务 SQL 是写操作（增、删、改操作）类型，会解析业务 SQL 的语法，生成 SELECT SQL 语句，把要被修改的记录查出来，保存为 “before image” 。然后执行业务 SQL ，执行完后用同样的原理，将已经被修改的记录查出来，保存为 “after image” ，至此一个 undo log 记录就完整了。随后 RM 会向 TC 注册分支事务， TC 侧会新加锁记录，锁可以保证 AT 模式的读、写隔离。RM  再将 undo log 和业务 SQL 的本地事务提交，保证业务 SQL 和保存 undo log 记录 SQL 的原子性。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/446b6158d91540368bc8112559cd6d08~tplv-k3u1fbpfcp-zoom-1.image)

### 4.2 二阶段提交

AT 模式的二阶段提交，TC 侧会将该事务的锁删除，然后通知 RM 异步删除 undo log 记录即可。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/45a02844579b485e922580acade69d48~tplv-k3u1fbpfcp-zoom-1.image)

### 4.3 二阶段回滚

如果 AT 模式的二阶段是回滚，那么 RM 侧需要根据一阶段保存的 undo log 数据中的 before image 记录，通过逆向 SQL 的方式，对在一阶段修改过的业务数据进行还原即可。

但是在还原数据之前，需要进行脏数据校验。因为在一阶段提交后，到现在进行回滚的中间这段时间，该记录有可能被别的业务改动过。校验的方式，就是用 undo log 的 after image 和现在数据库的数据做比较，假如数据一致，说明没有脏数据；不一致则说明有脏数据，出现脏数据就需要人工进行处理了。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ef9c9baf1d1e48bf90d71971e3c1df37~tplv-k3u1fbpfcp-zoom-1.image)

## 5、关键代码模块

如下是 AT 模式整个流程的主要模块，我们从中可以了解开发 AT 模式需要做哪些事情：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bdfd453ba59e40e3b4781cd77c5f6fa2~tplv-k3u1fbpfcp-zoom-1.image)

### 5.1 Undo log 数据格式

undo log 存在表 undo_log 表中，undo_log 表的表结构如下：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/614de41ac4504a3c93c1fe97d0d968e4~tplv-k3u1fbpfcp-zoom-1.image)

rollback_info 存放了业务数据修改前后的内容，数据表存放的是经过压缩后的格式，他的明文格式如下：

```Go
{
    "branchId":2828558179596595558,
    "sqlUndoLogs":[
        {
            "afterImage":{
                "rows":[
                    {
                        "fields":[
                            {
                                "keyType":"PRIMARY_KEY",
                                "name":"id",
                                "type":4,
                                "value":3
                            },
                            {
                                "keyType":"NULL",
                                "name":"count",
                                "type":4,
                                "value":70
                            }
                        ]
                    }
                ],
                "tableName":"stock_tbl"
            },
            "beforeImage":{
                "rows":[
                    {
                        "fields":[
                            {
                                "keyType":"PRIMARY_KEY",
                                "name":"id",
                                "type":4,
                                "value":3
                            },
                            {
                                "keyType":"NULL",
                                "name":"count",
                                "type":4,
                                "value":100
                            }
                        ]
                    }
                ],
                "tableName":"stock_tbl"
            },
            "sqlType":"UPDATE",
            "tableName":"stock_tbl"
        }
    ],
    "xid":"192.168.51.102:8091:2828558179596595550"
}
```

### 5.2 UndoLogManager

UndoLogManager 负责 undo log 的新加、删除、回滚操作，不同的数据库有不同的实现（不同数据库的 SQL 语法会不同），公共逻辑放在了 AbstractUndoLogManager 抽象类中，整体的类继承关系如下图：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0c39c8fe64de41caa2d4d5e5ee196aec~tplv-k3u1fbpfcp-zoom-1.image)

注：图片建议在 PC 端查看

插入和删除 undo log 的逻辑都比较简单，直接操作数据表就行。这里重点看下回滚 undo log 的逻辑：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f34351668e76479084c1cab76edd38f0~tplv-k3u1fbpfcp-zoom-1.image)

源码分析如下：

备注：需要特别注意下，当回滚的时候，发现 undo log 不存在，需要往 undo_log 表新加一条记录，避免因为 RM 在 TM 发出回滚请求后，又成功提交分支事务的场景。

### 5.3 Compressor 压缩算法

Compressor 接口定义了压缩算法的规范，用来压缩文本，节省存储空间：

```Go
public interface Compressor {

    /**
     * compress byte[] to byte[].
     * @param bytes the bytes
     * @return the byte[]
     */
    byte[] compress(byte[] bytes);

    /**
     * decompress byte[] to byte[].
     * @param bytes the bytes
     * @return the byte[]
     */
    byte[] decompress(byte[] bytes);

}
```

目前已经实现的压缩算法有如下这些：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4acb59bd1443480abfe86d0d7a8e5e61~tplv-k3u1fbpfcp-zoom-1.image)

### 5.4 UndoLogParser 序列化算法

Serializer 接口定义了序列化算法的规范，用来序列化代码：

```Go
public interface UndoLogParser {

    /**
     * Get the name of parser;
     * 
     * @return the name of parser
     */
    String getName();

    /**
     * Get default context of this parser
     * 
     * @return the default content if undo log is empty
     */
    byte[] getDefaultContent();

    /**
     * Encode branch undo log to byte array.
     *
     * @param branchUndoLog the branch undo log
     * @return the byte array
     */
    byte[] encode(BranchUndoLog branchUndoLog);

    /**
     * Decode byte array to branch undo log.
     *
     * @param bytes the byte array
     * @return the branch undo log
     */
    BranchUndoLog decode(byte[] bytes);
}

```

目前已经实现的序列化算法有如下这些：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/76b40e00afcf4ef889002ca53cc36d02~tplv-k3u1fbpfcp-zoom-1.image)

### 5.5 Executor 执行器

Executor 是 SQL 执行的入口类， AT 在执行 SQL 前后，需要管理 undo log 的 image 记录，主要是构建 undo log ，包括根据不同的业务 SQL ，来组装查询 undo log 的 SQL 语句；执行查询 undo log 的 SQL ，获取到镜像记录数据；执行插入 undo log 的逻辑（未提交事务）。

```Go
​public interface Executor<T> {​    /**     * Execute t.     *     * @param args the args     * @return the t     * @throws Throwable the throwable     */    T execute(Object... args) throws Throwable;}
```

针对不同的业务 SQL ，有不同的 Executor 实现，主要是因为不同操作/不同数据库类型的业务 SQL ，生成 undo log 的 SQL 的逻辑不同，所以都分别重写了 beforeImage() 和 afterImage() 方法。整体的继承关系如下图所示：

![lQLPJxa0Js5RE3jNB7vNDLmwHf8cY0rctjYDKDoGXoCRAA_3257_1979.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/69c9ebc1fc7b4212b01d79d390b57181~tplv-k3u1fbpfcp-watermark.image?)

注：图片建议在 PC 端查看

为了直观地看到不同类型的 SQL 生成的 before image SQL 和 after iamge SQL ，这里做个梳理。假如目标数据表的结构如下：

```Go
public interface Executor<T> {

    /**
     * Execute t.
     *
     * @param args the args
     * @return the t
     * @throws Throwable the throwable
     */
    T execute(Object... args) throws Throwable;
}
```

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6b2c8cbfe19e4d3988cac1b7749d21aa~tplv-k3u1fbpfcp-zoom-1.image)

注：图片建议在 PC 端查看

### 5.6 AsyncWorker

AsyncWorker 是用来做异步执行的，用来做分支事务提交和 undo log 记录删除等操作。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/34297c63b8d640ebbc24d5bbada2a7bf~tplv-k3u1fbpfcp-zoom-1.image)

## 6、关于性能

并不存在某一种完美的分布式事务机制可以适应所有场景，完美满足所有需求。无论 AT 模式、TCC 模式还是 Saga 模式，本质上都是对 XA 规范在各种场景下安全性或者性能的不足的改进。Seata 不同的事务模式是在一致性、可靠性、易用性、性能四个特性之间进行不同的取舍。

近期  Seata 社区发现有同行，在未详细分析 Java 版本 AT 模式的代码的详细实现的情况下，仅对某个早期的 Go 版本的 Seata 进行短链接压测后，质疑 AT 模型的性能及其数据安全性，请具有一定思辨能力的用户朋友们在接受这个结论前仔细查阅其测试方法与测试对象，区分好 “李鬼” 与 “李逵”。

实际上，这个早期的 Go 版本实现仅参照了 Seata v1.4.0，且未严格把 Seata AT 模式的所有功能都予以实现。话说回来，即便其推崇的 Seata XA 模式，其也依赖于单 DB 的 XA 模式。而当下最新版本的 MySQL XA 事务模式的 BUG 依然很多，这个地基并没有其想象中的那样百分百稳固。

由阿里与蚂蚁集团共建的 Seata，是我们多年内部分布式事务工程实践与技术经验的结晶，开源出来后得到了多达 150+ 以上行业同行生产环境的验证。开源大道既长且宽，这个道路上可以有机动车道也有非机动车道，还可以有人行道，大家携手把道路拓宽延长，而非站在人行道上宣传机动车道危险性高且车速慢。

### 7、总结

Seata AT 模式依赖于各个 DB 厂商的不同版本的 DB Driver（数据库驱动），每种数据库发布新版本后，其 SQL 语义及其使用模式都可能发生改变。随着近年 Seata 被其用户们广泛应用于多种业务场景，在开发者们的努力下，Seata AT 模式保持了编程接口与其 XA 模式几乎一致，适配了几乎所有的主流数据库，并覆盖了这些数据库的主要流行版本的 Driver：真正做到了把分布式系统的 “复杂性”留在了框架层面，把易用性和高性能交给了用户。

当然，Seata Java 版本的 XA 和 AT 模式还有许多需要完善与改进的地方，遑论其它多语言版本的实现。欢迎对 Seata 及其多语言版本建设感兴趣的同行参与到 Seata 的建设中来，共同努力把 Seata 打造成一个标准化分布式事务平台。

## 本周推荐阅读

[Go 内存泄漏，pprof 够用了么？](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247516046&idx=1&sn=c8ed0fbbc18b4377778c2ed06c7332ba&chksm=faa35054cdd4d9425b6780ae5ed1a6b83ab16afd9d870affba350c8002a2c4e2efdb85abc603&scene=21)

[Go 原生插件使用问题全解析](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247512138&idx=1&sn=851abb8d07d47f703e33978c9c125c59&chksm=faa35f90cdd4d6869c6cd4934c042484dbe1063c3fb85462d2f33e936b96240ae33d02d18c3a&scene=21)

[Go 代码城市上云--KusionStack 实践](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247515572&idx=1&sn=8fffc0fb13ffc8346e3ab151978d947f&chksm=faa3526ecdd4db789035b4c297811524cdf3ec6b659e283b0f9858147c7e37c4fea8b14b2fc6&scene=21)

[Seata-php 半年规划](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247515039&idx=1&sn=e6068fc1b925e71eb8550c8c41296c6d&chksm=faa35445cdd4dd53b450c96f6077b161026a62e451c7c4b8288364b137b3786bbe3d5ea0340a&scene=21#wechat_redirect)
