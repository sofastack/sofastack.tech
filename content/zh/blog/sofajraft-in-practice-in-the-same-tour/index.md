---
title: "SOFAJRaft 在同程旅游中的实践"
author: "赵延"
authorlink: "https://github.com/sofastack"
description: "SOFAJRaft 在同程旅游中的实践"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2021-09-21T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*RzWkR4udP3gAAAAAAAAAAAAAARQnAQ"
---

文｜**赵延**（SOFAJRaft Committer)

校对｜**冯家纯**（SOFAJRaft Committer)

本文 **15717** 字 阅读 **23** 分钟

▼

**同程艺龙**作为对 Raft 研究较早的公司，早在 14 年算法的 paper 刚发布的时候，便已经对其进行了调研。同时也与 paxos 、zab 等算法进行了详细的对比，并在公司内部的计数器、任务调度元信息存储等场景进行试点。

不过早期对于 Raft 的尝试较多的是在 C++ 技术栈试水，在 Java 技术栈里却很少有涉及。

近期刚好有基于 etcd 的老项目由于需要自定义的数据结构需要重构，原有的 etcd 无法在底层数据结构层面满足需求，因此决定**采用 Java 技术栈结合开源项目** **SOFAJRaft 进行底层数据存储的开发**，以期解决多节点数据强一致的问题。

本文假设读者对 Raft 及强一致的概念已经有了较深的理解，详细介绍了**公司内部如何使用 \**JRaft\** 的进行老系统的改造以及使用过程中遇到的工程问题**，希望其他对 Raft 有兴趣的同学可以一起讨论。

***PART. 1***

**背 景**

公司内部原本存在一个系统 **mdb** (metadata database)，go 语言编写，用于管理所有的实例元数据信息，元数据的内容就是一个 map。

该组件提供对元数据增删改查的接口，并且使用  go 语言编写，在检索数据时引入了 K8s selector 的包，使用 K8s selector 的解析规则筛选特定标签的元数据信息。

数据持久化则是实用了强一致组件 etcd 进行存储，key 为元数据的 ID，保证唯一，value 为具体的元信息，包含各个标签以及对应的值。

该系统大体架构如图 -1 所示:

>![](https://gw.alipayobjects.com/zos/bmw-prod/3209e44f-b7c9-4c35-8583-73393222ccec.webp)

图-1：原来的架构

***「该架构的弊端」***

1. 每隔一段时间需要去拉取 etcd 的全量数据，担心单次请求数据量太大的情况，对数据 ID 进行了 hash 分片，依次获取每个分片下个 key，再通过 key 去获取 value，导致 etcd 的查询频率非常高。

2. 非 ID 查询条件的一致性查询，和上面的问题一样，也需要做拉取全量数据的操作。

3. 更新删除操作也是一样，需要拉取全量数据再操作。

分析以上问题可以发现，使用 etcd 作为强一致存储，但 etcd 是基于 KV 存储的组件，并且解析组件 mdb 和 etcd 是分离的，在需要保证数据最新的情况下，必须得去 etcd 拿最新的数据到本地再进行操作。

而 etcd 基于 KV，就得拿到 etcd 的全量数据都给拉到本地后再做操作。

如果有一个组件，提供强一致的存储能力，又能直接去解析 K8s selector 的规则，存储的数据结构和元数据信息更加亲和，那么中间的那一层 mdb 就可以直接去掉了，由这个组件来解析对应的 crud 规则，将解析过后的规则直接在本地查询，那么以上问题就能够直接解决了。

***PART. 2***

**改 造**

基于以上问题，我们准备自己开发一个强一致存储的组件，能够自己解析 K8s selector 的规则，并且将数据保存在自己本地。

因为个人对 Java 语言比较了解，并且之前使用 Nacos 时，对 SOFAJRaft 也有一定了解，最终选择了 SOFAJRaft 来构建强一致存储组件，将它命名为 **mdb-store**。

 ***主要改造点：***

1. 使用 SOFAJRaft 编程模型构建业务状态机，业务状态机中根据 Raft log 中的 data 类型，进行 crud 的操作。

2. mdb-store 提供与原来 mdb 相同的 api，让改造对用户透明，改造完成后只需要切换域名对应的实例即可。

3. 迁移 K8s selector 的解析逻辑，这里用 Java 写了一套和 go 版本 K8s selector 一样解析逻辑的组件 K8s-selector-Java。

改造过后的架构如图-2所示:

>![](https://mmbiz.qpic.cn/mmbiz_png/nibOZpaQKw0ib9Bgj8rrHtkKQnlBU7jNnVvmpZdaDtdw2ag2N2Z6fBibWfspnfkdWaibet2SlI7DmvDg8w1siaG4x5A/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

图-2：重构后的架构

通过改造过后，将 mdb 移除，让用户直接和 mdb-store 进行通信，中间的通信少了一跳，加快了访问效率。将 mdb 和 etcd 也进行了移除，减少了整个系统的组件，降低运维成本。

***PART. 3***

**SOFAJRaft 的具体使用**

 ***将写操作转换成 Raft log*** 

在 SOFAJRaft 中，编程模型和通常的 Spring MVC 的编程模式不太一样。

在 Spring MVC 中，一个请求到达了后端，通常会通过 Controller -> Service -> Processor 这么几层。Controller 负责本次 http 请求的资源映射， 再由 Controller 去调用特定的 Service 方法，在 Service 层中，对参数进行一些处理和转换，再交由 Processor 层去对请求做真正的处理。

大体逻辑如图 -3 所示，

>![](data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==)

图-3：通常的编程模型

在 SOFAJRaft 中，所有的写操作都要通过状态机去执行（读操作不需要经过状态机）。需要将写操作转换成 task，状态机去应用 task 然后再进行业务处理。

task 中包含两个属性是需要关注的，一个是 done，一个是 data。

**-** **done** 就是本次 task 被状态机处理完成后的回调，比如在 done 的回调逻辑中，将 response flush 到客户端。

**-** **data** 就是 Raft log 中的具体数据，比如要执行一条插入元数据的命令。data 就会包含本次操作的类型（插入），以及本次操作的具体数据。

public class Task implements Serializable {    private ByteBuffer        data             = LogEntry.EMPTY_DATA;    private Closure           done;    /// 省略部分代码}

大体逻辑如图 -4 所示，

>![](https://mmbiz.qpic.cn/mmbiz_png/nibOZpaQKw0ib9Bgj8rrHtkKQnlBU7jNnVrW6AbpYKa8DpJ7h7qlsGVG4trY1JISMoQR69fh8UwtSXiafEb57urng/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

图-4：SOFAJRaft 的编程模型

所有的操作都抽象成一个实体 Operation，在 Service 层，就根据业务把参数转换成不同的 Operation，然后再将 Operation 序列化，设置到 Task 中的 data 属性，再由 Node 将 task 提交。

这里可以将 task 看成是一个 Raft log，一旦 Raft log 被半数的机器给提交。状态机就会应用 Raft log，应用完成之后就会触发 done 中的回调。

**·** **抽象过后的实体类**

class Operation<T> {    //操作类型，比如增删改查    int type;    //操作的哪个表，某些类型不需要此字段    String table;    //具体的操作数据，根据 type 的不同，数据类型也会不同    T params;}

**·** **构建 task 并通过 node 提交给状态机**

final Task task = new Task();//定义回调的逻辑，当该 Raft log 被状态机应用后，会进行回调task.setDone(new StoreClosure(operation, status -> {    StoreStatus storageStatus = (StoreStatus) status;    closure.setThrowable(storageStatus.getThrowable());    closure.setResponse(storageStatus.getResponse());    closure.run(storageStatus);}));//将 operation 进行序列化，在状态机中会将该值反序列化还原，再交给 processor 处理task.setData(ByteBuffer.wrap(serializer.serialize(operation)));node.apply(task);

 ***状态机的实现*** 

**·** **onApply**

onApply 是状态机的核心功能，其目的就是接收入参中的 Raft log 以及 done，然后将 Raft log 中的数据反序列化，交由自己的业务处理器去进行处理。

处理完成之后，触发 done 的回调，这里就和 Node.apply(task) 关联上了。

  while (iter.hasNext()) {                Status status = Status.OK();                try {                    if (iter.done() != null) {                        // 说明当前状态机是 Leader，可以直接从 closure 中获取操作数据                        closure = (MdbStoreClosure) iter.done();                        operation = closure.getOperation();                    } else {                        // 当前状态机不是 Leader，通过对 Raft log 中的数据进行反序列化操作，还原操作数据                        ByteBuffer data = iter.getData();                        operation = serializer.deserialize(data.array(), Operation.class);                    }                    //业务处理器进行业务处理，业务处理器中会判断 operation 的类型，选择不同的处理逻辑                    OperationResponse result = mdbStoreProcessor.processOperation(operation);                    //将 result 序列化                    GrpcResponse response = GrpcResponse.newBuilder().setSuccess(true)                            .setData(ByteString.copyFrom(serializer.serialize(result))).build();                              Optional.ofNullable(closure)                            .ifPresent(closure1 -> closure1.setResponse(response));                } catch (Throwable e) {                    status.setError(RaftError.UNKNOWN, e.toString());                    Optional.ofNullable(closure).ifPresent(closure1 -> closure1.setThrowable(e));                    throw e;                } finally {                    //对 task 中的 done 进行回调                    Optional.ofNullable(closure).ifPresent(closure1 -> closure1.run(status));                }                //将 Raft log 的消费位置 +1，表示当前这个 Raft log 已经被成功应用了                iter.next();            }

**·** **onSnapshotSave**

**-** 在初始化 SOFAJRaft node 时，存在一个参数，**NodeOptions#snapshotUri**。

**-** 该参数设置后就会开启 snapshot 机制，一般是推荐设置。

**-** 开启完成之后，每隔 30 分钟 就会进行一次 **snapshot**（这里需要注意的是，30 分钟内有 Raft log 提交时，才会进行 snapshot）。

**-** 在进行 snapshot 的时候，需要把当前的数据进行持久化操作。

**-** 在 snapshot 完成后，就会将 snapshot 中最后一条 Raft log 之前的 raft-log 全部删除。其意义就是避免 Raft log 一直增加，导致磁盘占用飙高。

**snapshot 机制**可以这么去理解，在 SOFAJRaft 中，业务 processor 中的操作都是状态机驱动的，而状态机又是由 Raft log 驱动。**那么 processor 中数据的最终形态其实就是所有的 Raft log 应用的总和。**

比如存在一个 Raft log，其业务含义是 i++。10 条 Raft log 被状态机应用后，驱动 processor 进行 10 次 i++ 操作，最终的值就是为 10。应用就算崩溃重启后，重启时，他会去应用之前的 10 条 i++ 的Raft log，processor 中的值也还是 10。使用 snapshot 机制，在进行 snapshot 时，把 processor 中的 10 进行持久化，持久化完成过后，将前 10 条 Raft log 进行删除，后续再来 2 条 i++ 的 Raft log，processor 的值变为 12，存在 2 条 i++ 的 Raft log。应用就算崩溃重启，那么它首先也会读取 snapshot 中的数据 10，再去应用 2 条 i++ 的 Raft log，最终数据也是 12，和崩溃之前保持一致。

**Processor 的最终态 =** **snapshot + Raft log**

MdbStoreStoreSnapshotFileImpl mdbStoreStoreSnapshotFile = (MdbStoreStoreSnapshotFileImpl) snapshotFile;        String tempPath = snapshotPath + "_temp";        File tempFile = new File(tempPath);        FileUtils.deleteDirectory(tempFile);        FileUtils.forceMkdir(tempFile);        //记录总共的 table 数量        mdbStoreStoreSnapshotFile                .writeToFile(tempPath, "tailIndex", new TailIndex(persistData.size()));        //将每一个 table 中的数据都进行持久化        for (int i = 0; i < persistData.size(); i++) {            mdbStoreStoreSnapshotFile.writeToFile(tempPath, combineDataFile(i),                    new TablePersistence(persistData.get(i)));        }        File destinationPath = new File(snapshotPath);        FileUtils.deleteDirectory(destinationPath);        FileUtils.moveDirectory(tempFile, destinationPath);

**·** **onSnapshotLoad**

onSnapshotLoad 的几个触发场景。

1. 当一个节点重新启动时。

2. 当 Follower 中的 commit-index 都小于 Leader 中 snapshot 的最后一条 Raft log 时（Follower 太落后了，Follower 需要的 Raft log 已经被 Leader 的 snapshot 机制删除了）

onSnapshotLoad 和上面的 onSnapshotSave 是成对的，这里只需要把之前保存的文件中的内存读取，然后再进行反序列化，添加到 processor 中的数据容器即可。

        MdbStoreStoreSnapshotFileImpl mdbStoreStoreSnapshotFile = (MdbStoreStoreSnapshotFileImpl) snapshotFile;        //读取总共的文件数        TailIndex tailIndex = mdbStoreStoreSnapshotFile                .readFromFile(snapshotPath, TAIL_INDEX, TailIndex.class);
        int size = tailIndex.data();
        for (int i = 0; i < size; i++)             //挨个读取文件，将文件内容进行反序列化            TablePersistence tablePersistence = mdbStoreStoreSnapshotFile                    .readFromFile(snapshotPath, combineDataFile(i), TablePersistence.class);            TableDataDTO data = tablePersistence.data();                        Table table = new Table(data.getName(), new HashSet<>(data.getIndexNames()),                    data.getRetryCount());            for (Record dataData : data.getDatas()) {                table.addRecord(dataData);            }            //将数据丢给 processor 中的数据容器            dataComponent.putData(table.getName(), table);        }

**·** **状态机的其他状态变更的方法**

一般来说，节点的状态是不会发生变化的，一旦发生变化，就需要去分析应用的状态了，观察节点是否正常。

StateMachine 提供了状态回调的接口，我们在回调中对接内部的监控系统，当状态机的节点状态发生变化时，会实时通知到维护人员，维护人员再对应用进行分析排查。

 ***使用 read-index read 进行读操作*** 

按照 Raft 论文正常来说，读写操作都只能由 Leader 进行处理，这样能够保证读取的数据都是一致的。这样的话，读请求的吞吐就没办法增加。

关于这个 case，SOFAJRaft 提供了 read-index read，可以在 Follower 中进行读取操作，并且能保证在 Follower 中读的结果和在 Leader 中读的结果一致。

*关于 read-index read 可以参考 pingcap 的这篇博客：*

*[https://pingcap.com/zh/blog/lease-read](https://pingcap.com/zh/blog/lease-read)*

com.alipay.sofa.jraft.Node#readIndex(final byte[] requestContext, final ReadIndexClosure done)

第一个参数是发起 read-index read 时的上下文，可以在回调中使用。

第二个参数就是具体的回调逻辑，需要在 run 方法中实现读取逻辑。

**·** **read-index read 编程模型**

 CompletableFuture future = new CompletableFuture<>();            node.readIndex(BytesUtil.EMPTY_BYTES, new ReadIndexClosure() {                @Override                public void run(Status status, long index, byte[] reqCtx) {                    //状态 ok，说明可以通过 read-index 去进行读取                    if (status.isOk()) {                        try {                            //直接使用 processor 查询数据，不通过状态机                            OperationResponse<T> res = (OperationResponse<T>) mdbStoreProcessor                                    .processOperation(operation);                            future.complete(res);                        } catch (Throwable t) {                            future.completeExceptionally(                                    new IllegalStateException("Fail to read data from processor",                                            t));                        }                    } else {                        //状态不 ok，可能是超时，也可能是状态机异常等其他原因                        if (Operation.ALL_DATA == operation.getType()) {                            //这里判断是不是读取全量的数据，读取全量数据的话，需要快速失败，不能转到 leader 走 raft log读取，                                                        //原因见 4.3                            future.completeExceptionally(new IllegalStateException(                                    "Fail to get all data by read-index read, status: " + status                                            .getErrorMsg()));                        } else {                            //通过将本次请求转发到 Leader 中，走 raft log，在 Leader 的状态机中把本条 raft log 应用后，再                                                         //返回数据给 Follower                            LOGGER.warn("ReadIndex read failed, status: {}, go to Leader read.",                                    status.getErrorMsg());                            readFromLeader(operation, future);                        }                    }                }            }                               Object o = future.get(5_000L, TimeUnit.MILLISECONDS);        if (o instanceof GrpcResponse) {            //返回类型的 GrpcResponse，说明本次请求是通过 Raft log 转到 Leader 处理并返回的，需要将数据反序列化            return serializer                    .deserialize(((GrpcResponse) o).getData().toByteArray(), OperationResponse.class);        } else {            //直接在本地通过 read-index read 读本地内存            return (OperationResponse<T>) o;        }

 ***Follower 请求转发*** 

在 SOFAJRaft 中，所有的写请求都只能由 Leader 节点进行处理，当写请求落到了 Follower 中，有两种方式进行处理。

1. 直接拒绝该请求，并将 Leader 节点的地址返回给客户端，让客户端重新发起请求。

2. 将当前请求 hold 在服务端，并将该请求转发到 Leader 节点，Leader 节点处理完成后，将 response 返回给 Follower，Follower 再将之前 hold 住的请求返回给客户端。

这里使用第一种时，需要客户端也进行相应的改造，为了对客户端透明，我们选择了第二种，通过转发的方式，将请求转给 Leader。

在 SOFAJRaft 中，各个节点需要通过 RPC 来进行通信，比如发送心跳，投票等。

SOFAJRaft 默认提供了两种通信方式，一种是 sofa-bolt，还有一种是 grpc，考虑到组件的流行性，选择了grpc来作为通信方式。在构建 server 时，使用 GrpcRaftRpcFactory 在创建 RpcServer 。然后将 SOFAJRaft 中自带的处理器（心跳处理器，投票处理器等）注册到 RpcServer中。这些处理器都是实现了 RpcProcessor 接口，该接口的 handleRequest 方法会处理收到的请求。

使用 GrpcRaftRpcFactory 需要注意的是，需要引入依赖。

<dependency>    <groupId>com.alipay.sofa</groupId>    <artifactId>rpc-grpc-impl</artifactId>    <version>${jraft.grpc.version}</version></dependency>

并且需要通过 spi 指定使用 GrpcRaftRpcFactory。

**文件路径** /resources/META-INF.services/com.alipay.sofa.jraft.rpc.RaftRpcFactory，**文件内容** com.alipay.sofa.jraft.rpc.impl.GrpcRaftRpcFactory。

这里，可以定义一个自己的处理器，实现 RpcProcessor 接口，将该 Processor 也注册到 RpcServer 中，复用同一个 RpcServer。

**·** **创建 RpcServer 并注册处理器**

//获取 GrpcRaftRpcFactory        GrpcRaftRpcFactory raftRpcFactory = (GrpcRaftRpcFactory) RpcFactoryHelper.rpcFactory();        //GrpcRequest 是自己的 Processor 通信使用，这里使用 proto 去生成 GrpcRequest 和 GrpcResponse        raftRpcFactory.registerProtobufSerializer(GrpcRequest.class.getName(),                GrpcRequest.getDefaultInstance());        raftRpcFactory.registerProtobufSerializer(GrpcResponse.class.getName(),                GrpcResponse.getDefaultInstance());                MarshallerRegistry registry = raftRpcFactory.getMarshallerRegistry();         //注册 GrpcRequest 对应的 response 的默认对象        registry.registerResponseInstance(GrpcRequest.class.getName(),                GrpcResponse.getDefaultInstance());        //创建 GrpcServer        final RpcServer rpcServer = raftRpcFactory.createRpcServer(peerId.getEndpoint());         //注册 sofa-jraft 中自带的处理器        RaftRpcServerFactory.addRaftRequestProcessors(rpcServer, RaftExecutor.getRaftCoreExecutor(),                RaftExecutor.getRaftCliServiceExecutor());        //注册自己业务的处理器        rpcServer.registerProcessor(new GrpcRequestProcessor(server));
        return rpcServer;

**·** **proto file**

syntax = "proto3";option java_multiple_files = true;package com.xxx.mdb.store.raft.entity;
message GrpcRequest {  //这里的 data 保存的就是 Operation 序列化过后的二进制流  bytes data =1;}
message GrpcResponse {  //这里的 data 保存的是业务 Processor 处理完 Operation 过后，并且经过序列化后的二进制流  bytes data = 1;  //异常信息  string errMsg = 2;  //标志位，请求是否 ok  bool success = 3;}

**·** **自己的处理器，用于接收 Follower 过来的转发请求。**

  //如果当前节点不是 Leader，不进行处理        if (!jRaftServer.getNode().isLeader()) {            return;        }        //定义 done，状态机应用 Raft log 后，会回调这个 done        FailoverClosure done = new FailoverClosure() {
            GrpcResponse data;
            Throwable ex;
            @Override            public void setResponse(GrpcResponse data) {                //Follwer 在状态机中执行成功后，会将 result 封装成 GrpcResponse，然后在这里设置                this.data = data;            }
            @Override            public void setThrowable(Throwable throwable) {                //在异常时，会进行调用                this.ex = throwable;            }
            @Override            public void run(Status status) {                if (Objects.nonNull(ex)) {                    LOGGER.error("execute has error", ex);                    //ex 不为 null，说明发生了异常，将异常返回给 Follower                    rpcCtx.sendResponse(                            GrpcResponse.newBuilder().setErrMsg(ex.toString()).setSuccess(false)                                    .build());                } else {                    //将请求返回 Follower                    rpcCtx.sendResponse(data);                }            }        };        //将从 Follower 过来的请求提交给状态机，在内部会把 request 的 data 字段给反序列化为 Operation        jRaftServer.applyOperation(jRaftServer.getNode(), request, done);

**·** **Follower 中的转发逻辑**

  try {            //将 operation 序列化成 byte 数组，然后构建 GrpcRequest.            GrpcRequest request = GrpcRequest.newBuilder()                    .setData(ByteString.copyFrom(serializer.serialize(operation))).build();            //从缓存获取当前 Leader 节点的地址，如果 Leader 为空，抛出异常。这里的 Leader 需要动态刷新，每隔5秒中就去刷新一次                             //Leader，保证 Leader 是最新的。可以通过 RouteTable#refreshLeader 去定时刷新。            final Endpoint leaderIp = Optional.ofNullable(getLeader())                    .orElseThrow(() -> new IllegalStateException("Not find leader")).getEndpoint();            //通过 grpc 将请求发送给自己的处理器            cliClientService.getRpcClient().invokeAsync(leaderIp, request, new InvokeCallback() {                @Override                public void complete(Object o, Throwable ex) {                    if (Objects.nonNull(ex)) {                        //存在异常，将异常进行回调                        closure.setThrowable(ex);                        //进行 fail 的回调，回调中会将 exception 返回给客户端                        closure.run(new Status(RaftError.UNKNOWN, ex.getMessage()));                        return;                    }                    //将 grpc response 设置给回调类                    closure.setResponse((GrpcResponse) o);                    //进行 success 的回调，回调中会将数据返回给客户端                    closure.run(Status.OK());                }
                @Override                public Executor executor() {                    return RaftExecutor.getRaftCliServiceExecutor();                }            }, timeoutMillis);        } catch (Exception e) {            closure.setThrowable(e);            closure.run(new Status(RaftError.UNKNOWN, e.toString()));        }

***PART. 4***

**SOFAJRaft** **的一些实践**

 **read-index read** 

 **返回数据量过大导致 oom** 

在我们的业务场景中，有一个获取全量数据的接口，并且是通过 read-index read 去进行读数据的。在对这个接口进行压测时，会发现 CPU 飙高的情况，经过排查，是由于堆内存占满了，GC 线程一直在 work 导致的。经过 dump 堆内存后发现，是由于内部使用 Disruptor 导致的问题，该问题目前已被我们修复，并且也已反馈给社区，在 1.3.8 版本中进行了解决。

*具体问题见* ***issue#618***

 **read-index read** 

 **响应时间较长** 

在测试同学进行压测，发现读取接口的最大耗时偶尔会跑到 500ms，平均响应耗时大概在 100ms 左右。经过反复排查以及阅读代码，最终发现这个问题和 election timeout  有关。

在 SOFAJRaft 中，election timeout 就是选举超时的时间，一旦超过了 election timeout，Follwer 还没有收到 Leader 的心跳，Follower 认为当前集群中没有 Leader，自己发起投票来尝试当选 Leader。

正常情况下，Leader 给 Follower 发心跳的频率是 election timeout / 10，也就是说在 election timeout 期间内，Leader 会给 Follower 发 10 次心跳，Follower 10次都没有收到心跳的情况下，才会发生选举。

而恰巧的是，我设置的 election timeout 刚好就是 5s，5s / 10 刚好就是 500ms。

于是进一步分析 **read-index read** 的机制，当 Follower 使用 read-index read 时，首先要去 Leader 获取 Leader 当前的 commit index，然后需要等待 Follower 自己的状态机的 apply index 超过从 Leader 那边获取到的 commit index，然后才会进行 read-index read 的回调。

而 Follower 的状态机的 apply 操作是通过 Leader 的心跳请求驱动的，Leader 中能够知道 Raft log 是否被半数提交了，一旦某一条 Raft log 被半数提交，Leader 在下一次的心跳请求中就会发最新的 commit index 同步给 Follower，Follower 收到新的 commit index 后，才会驱动自己的状态机去 apply Raft log。

而心跳请求的频率又是 election timeout / 10，所有会存在 read-index read 偶尔的响应时间会是 election timeout / 10.

**如何解决：**

基于以上分析，将 election timeout 的时间调整为了 1s，心跳频率也就变成了 100ms，最大的响应耗时也就变低了，平均响应耗时也降低到了 4ms 左右。

read-index read 大概逻辑如图-5所示，

>![](https://gw.alipayobjects.com/zos/bmw-prod/338f3e81-da8b-4eed-86e2-fadf85098484.webp)

图-5：read-index read 处理逻辑

 **read-index read** 

**大响应接口失败后转发请求到** 

 **leader 导致状态机阻塞** 

在一次排查问题的过程中，怀疑网络存在问题。于是联系运维同学，运维同学对执行 tcpdump 命令，对网络进行了抓包。

整个集群分为 3 个机房，2+2+1 的模式进行部署，1 这个节点的网络偶尔会存在波动。在当时执行 tcpdump 过后 4 分钟，到1这个节点的读请求就开始发生 read-index timeout 了，而当时的逻辑是，只要 read-index read 回调状态不 ok，就将该请求转发到 Leader，走 Raft log 来进行处理。

这里存在一个接口，是去读所有的数据，数据量比较大。当 read-index read 超时时，会将这个请求转发到了 Leader 节点，走 Raft log 去读数据，走 Raft log 就会在状态机中去进行处理，而这个请求的 response 比较大，导致在获取完数据后，去序列化数据时比较耗时，大概需要消耗 1500ms，状态机中处理 Raft log 的吞吐就降低了。并且 Raft log 是会从 Leader 复制给 Follower 的，也就是说，Follower 的状态机也会去执行这个耗时 1500 ms的 Raft log，只是 Follower 不对 response 做处理而已。

在上面描述了 read-index read 的逻辑，Follower 要执行 read-index read，需要状态机的 apply-index 追上 Leader 的 commit index，当发生上述网络波动时，这个大接口走 Raft log 的方式，降低了状态机处理 Raft log 的吞吐，导致 Follwer 的 apply index 更难追上 Leader 的 commit index 了。

因此陷入了恶性循环，这个大接口一致通过 Raft log 转向 Leader 去读取数据，而这个 Raft log 处理非常耗时。

最终导致状态机的 apply index 远远小于 commit index，所有的客户端的读操作和写操作全部都超时。

**如何解决：**

将这个大接口的读取操作改成快速失败，一旦 read-index read 的回调不成功，不把请求通过 Raft log 转到 Leader 去，直接返回异常给客户端，让客户端重试。

 **snapshot 操作时，**

 **阻塞状态机应用 Raft log，****导致响应超时** 

系统在压测时，跑着跑着客户端偶尔会超时。经过反复排查，发现超时的时间点和 snapshot 的时间点重合。根据阅读代码发现，状态机的 apply 操作和 snapshot 操作默认是同步的，而 snapshot 比较耗时，导致了状态机 apply Raft log 时间被延长了，从而客户端请求超时。

**如何解决：**

在 snapshot 时，将 snapshot 的操作变为异步操作，使用 copy on write 把 snapshot 时的内存数据 copy 了一份，再异步进行持久化处理。

这里需要注意的是，copy on write 会消耗 2 倍的内存，这里需要确保不要导致 OOM 了。不同的场景需要考虑不同的异步 snapshot 的方式。

 **Raft中存在 Raft log 和 snapshot file，**

 **需要文件系统保证有状态** 

SOFAJRaft 需要保存 Raft log 以及 snapshot file。

在容器部署时，需要确保应用使用的 Raft 目录是持久化的。

 **开启 metrics 以及** 

 **利用 kill -s SIGUSR2 帮助问题分析** 

在 SOFAJRaft 中，存在 node 参数 enableMetrics，是否开启 metrics 统计指标数据。

我们将它打开，并且将指标数据输出到一个单独的日志文件，归档的日志可以在分析问题时提供线索。

**比如：**有时候的读取请求响应时间增大了，就可以通过观察指标数据 read-index 来帮助分析是否是线性读的机制导致请求响应飙升。

将指标输出到日志文件:

Node node = ...NodeOptions nodeOpts =  ...//打开监控指标nodeOpts.setEnableMetrics(true);node.init(nodeOpts);
Slf4jReporter reporter = Slf4jReporter         .forRegistry(node.getNodeMetrics().getMetricRegistry())         //获取到日志的输出对象         .outputTo(LoggerFactory.getLogger("com.jraft.metrics"))         .convertRatesTo(TimeUnit.SECONDS)         .convertDurationsTo(TimeUnit.MILLISECONDS)         .build();reporter.start(30, TimeUnit.SECONDS);

除此之外，还可以利用 **kill - s SIGUSR2 pid** 给 SOFAJRaft 进程发送信号量，进程收到信号量后，会在进程的启动目录中生成指标数据数据文件。

这里我个人比较关注 node_describe.log 中 log manager 的 diskId 和 appliedId，前者是 Raft log 写到磁盘中的位置，后者是状态机当前应用到 Raft log 的位置，可以通过对比这两个数据，用来观察状态机的吞吐是否正常，一旦两者相差很多，说明状态机出问题了。

**「后续演进」**

**·** 引入 Learner 节点，增加整个集群的读吞吐量。

**·** 持续关注社区，和社区共同发展。

***- END -***

以上就是 SOFAJRaft 在我们公司内的使用分享，有问题的小伙伴可以找到我的 GitHub 直接邮箱和我沟通。

感谢 SOFAStack 提供的一个如此优秀的 Java 框架。 

>![](https://mmbiz.qpic.cn/mmbiz_jpg/nibOZpaQKw0ib9Bgj8rrHtkKQnlBU7jNnVO71e92WBZqFYtauicNAj5JFctd626QUoibbiaiaqwMY1hQogdhMemNjf6w/640?wx_fmt=jpeg&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)

\-

「作 者」

**· 赵延 ｜**GitHub:horizonzy

同程艺龙高级开发，负责服务治理相关工作，关注 RPC、服务治理和分布式等领域。

**· 董春明** 

同程艺龙架构师，负责服务治理及云原生规划演进相关工作，分布式领域专家，Paper 爱好者。

\-

「参 考」

**·** alibaba Nacos 中关于 SOFAJRaft 的使用 

· JRaft-rheakv 中关于 SOFAJRaft 的使用 
