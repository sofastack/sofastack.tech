---
title: "JRaft 用户指南"
---

## 1. 基本概念说明

* log index 提交到 raft group 中的任务都将序列化为一条日志存储下来，每条日志一个编号，在整个 raft group 内单调递增并复制到每个 raft 节点。
* term 在整个 raft group 中单调递增的一个 long 数字，可以简单地认为表示一轮投票的编号，成功选举出来的 leader 对应的 term 称为 leader term，在这个 leader 没有发生变更的阶段内提交的日志都将拥有相同的 term 编号。

## 2. 配置和辅助类

本节主要介绍 jraft 的配置和辅助工具相关接口和类。核心包括：

* Endpoint 表示一个服务地址。
* PeerId 表示一个 raft 参与节点。
* Configuration 表示一个 raft group 配置，也就是节点列表。

### 2.1 地址 Endpoint

Endpoint 表示一个服务地址，包括 IP 和端口， __raft 节点不允许启动在 0.0.0.0  所有的 IPv4 上，需要明确指定启动的 IP__
创建一个地址，绑定在 localhost 的 8080 端口上，如下例：

```java
  Endpoint addr = new Endpoint("localhost", 8080);
  String s = addr.toString(); // 结果为 localhost:8080
  boolean success = addr.parse(s);  // 可以从字符串解析出地址，结果为 true
```

### 2.2 节点 PeerId

PeerId 表示一个 raft 协议的参与者（leader/follower/candidate etc.)， 它由三元素组成： ip:port:index， IP 就是节点的 IP， port 就是端口， index 表示同一个端口的序列号，目前没有用到，总被认为是 0。预留此字段是为了支持同一个端口启动不同的 raft 节点，通过  index 区分。

创建一个 PeerId,  index 指定为 0， ip 和端口分别是 localhost 和 8080:

```java
PeerId peer = new PeerId("localhost", 8080);
EndPoint addr = peer.getEndpoint(); // 获取节点地址
int index = peer.getIdx(); // 获取节点序号，目前一直为 0

String s = peer.toString(); // 结果为 localhost:8080
boolean success = peer.parse(s);  // 可以从字符串解析出 PeerId，结果为 true
```

### 2.3 配置 Configuration

Configuration 表示一个 raft group 的配置，也就是参与者列表：

```java
PeerId peer1 = ...
PeerId peer2 = ...
PeerId peer3 = ...
// 由 3 个节点组成的 raft group
Configuration conf = new Configuration();
conf.addPeer(peer1);
conf.addPeer(peer2);
conf.addPeer(peer3);
```

### 2.4 工具类 JRaftUtils

为了方便创建 Endpoint/PeerId/Configuration 等对象， jraft 提供了 JRaftUtils 来快捷地从字符串创建出所需要的对象：

```java
Endpoint addr = JRaftUtils.getEndpoint("localhost:8080");
PeerId peer = JRaftUtils.getPeerId("localhost:8080");
// 三个节点组成的 raft group 配置，注意节点之间用逗号隔开
Configuration conf = JRaftUtils.getConfiguration("localhost:8081,localhost:8082,localhost:8083");
```

### 2.5 回调 Closure 和状态 Status

Closure 就是一个简单的 callback 接口， jraft 提供的大部分方法都是异步的回调模式，结果通过此接口通知：

```java
public interface Closure {

    /**
     * Called when task is done.
     *
     * @param status the task status.
     */
    void run(Status status);
}

```

结果通过 Status 告知，`Status#isOk()` 告诉你成功还是失败，错误码和错误信息可以通过另外两个方法获取：

```java
boolean success= status.isOk();
RaftError error = status.getRaftError(); // 错误码，RaftError 是一个枚举类
String errMsg = status.getErrorMsg(); // 获取错误详情
```

Status 提供了一些方法来方便地创建：

```java
// 创建一个成功的状态
Status ok = Status.OK();
// 创建一个失败的错误，错误信息支持字符串模板
String filePath = "/tmp/test";
Status status = new Status(RaftError.EIO, "Fail to read file from %s", filePath);
```

### 2.6 任务 Task

Task 是用户使用 jraft 最核心的类之一，用于向一个 raft 复制分组提交一个任务，这个任务提交到 leader，并复制到其他 follower 节点， Task 包括：

* `ByteBuffer data`  任务的数据，用户应当将要复制的业务数据通过一定序列化方式（比如 java/hessian2) 序列化成一个 ByteBuffer，放到 task 里。
* `long expectedTerm = -1` 任务提交时预期的 leader term，如果不提供(也就是默认值 -1 )，在任务应用到状态机之前不会检查 leader 是否发生了变更，如果提供了（从状态机回调中获取，参见下文），那么在将任务应用到状态机之前，会检查 term 是否匹配，如果不匹配将拒绝该任务。
* `Closure done` 任务的回调，在任务完成的时候通知此对象，无论成功还是失败。这个 closure 将在 `StateMachine#onApply(iterator)` 方法应用到状态机的时候，可以拿到并调用，一般用于客户端应答的返回。

创建一个简单 Task 实例：

```java
Closure done = ...;
Task task = new Task();
task.setData(ByteBuffer.wrap("hello".getBytes());
task.setClosure(done);
```

任务的 closure 还可以使用特殊的 `TaskClosure` 接口，额外提供了一个 `onCommitted` 回调方法：

```java
public interface TaskClosure extends Closure {

    /**
     * Called when task is committed to majority peers of the RAFT group but before it is applied to state machine.
     * 
     * <strong>Note: user implementation should not block this method and throw any exceptions.</strong>
     */
    void onCommitted();
}

```

当 jraft 发现  task 的 done 是 `TaskClosure` 的时候，会在 RAFT 日志提交到 RAFT group 之后（并复制到多数节点），应用到状态机之前调用 `onCommitted` 方法。

## 3. 服务端

本节主要介绍 jraft 服务端编程的主要接口和类，核心是:

* 状态机 StateMachine ：业务逻辑实现的主要接口，状态机运行在每个 raft 节点上，提交的 task 如果成功，最终都会复制应用到每个节点的状态机上。
* Raft 节点 Node ： 表示一个 raft 节点，可以提交 task，以及查询 raft group 信息，比如当前状态、当前 leader/term 等。
* RPC 服务： raft 节点之间通过 RPC 服务通讯（选举、复制等）
* RaftGroupService：一个辅助编程框架类，方便地“组装”起一个 raft group 节点。

### 3.1 迭代器 Iterator

提交的 task ，在 jraft 内部会做累积批量提交，应用到状态机的是一个 task 迭代器，通过  `com.alipay.sofa.jraft.Iterator` 接口表示，一个典型的例子：

```java
Iterator it = ....
//遍历迭代任务列表
while(it.hasNext()){
  ByteBuffer data = it.getData(); // 获取当前任务数据
  Closure done = it.getDone();  // 获取当前任务的 closure 回调
  long index = it.getIndex();  // 获取任务的唯一日志编号，单调递增， jraft 自动分配
  long term = it.getTerm();  // 获取任务的 leader term
  ...逻辑处理... 
  it.next(); // 移到下一个task
}
```

请注意， 如果 task 没有设置 closure，那么 done 可能会是 null，__另外在 follower 节点上， done 也是 null，因为 done 不会被复制到除了 leader 节点之外的其他 raft 节点__。

这里有一个优化技巧，<strong>通常 leader 获取到的 done closure，可以扩展包装一个 closure 类 包含了没有序列化的用户请求，那么在逻辑处理部分可以直接从 closure 获取到用户请求，无需通过 </strong><code><strong>data</strong></code><strong> 反序列化得到，减少了 leader 的 CPU 开销</strong>，具体可参见 counter 例子。

### 3.2 状态机 StateMachine

提交的任务最终将会复制应用到所有 raft 节点上的状态机，状态机通过 `StateMachine` 接口表示，它的主要方法包括：

* `void onApply(Iterator iter)` 最核心的方法，应用任务列表到状态机，任务将按照提交顺序应用。<strong>请注意，当这个方法返回的时候，我们就认为这一批任务都已经成功应用到状态机上，如果你没有完全应用（比如错误、异常），将会被当做一个 critical 级别的错误，报告给状态机的 </strong><code><strong>onError</strong></code><strong> 方法，错误类型为 </strong><code><strong>ERROR_TYPE_STATE_MACHINE</strong></code><strong> </strong>。关于故障和错误处理参见下面的第 7 节。
* `void onError(RaftException e)`  当 critical 错误发生的时候，会调用此方法，RaftException 包含了 status 等详细的错误信息__；当这个方法被调用后，将不允许新的任务应用到状态机，直到错误被修复并且节点被重启__。因此对于任何在开发阶段发现的错误，都应当及时做修正，如果是 jraft 的问题，请及时报告。
* `void onLeaderStart(long term)` 当状态机所属的 raft 节点成为 leader 的时候被调用，成为 leader 当前的 term 通过参数传入。
* `void onLeaderStop(Status status)` 当前状态机所属的 raft 节点失去 leader 资格时调用，`status` 字段描述了详细的原因，比如主动转移 leadership、重新发生选举等。
* `void onStartFollowing(LeaderChangeContext ctx)` 当一个 raft follower 或者 candidate 节点开始 follow 一个 leader 的时候调用，`LeaderChangeContext` 包含了 leader 的 PeerId/term/status 等上下文信息。并且当前 raft node 的 leaderId 属性会被设置为新的 leader 节点 PeerId。
* `void onStopFollowing(LeaderChangeContext ctx)` 当一个 raft follower 停止 follower 一个 leader 节点的时候调用，这种情况一般是发生了 leadership 转移，比如重新选举产生了新的 leader，或者进入选举阶段等。同样 `LeaderChangeContext` 描述了停止 follow 的 leader 的信息，其中 status 描述了停止 follow 的原因。
* `void onConfigurationCommitted(Configuration conf)` 当一个 raft group 的节点配置提交到 raft group 日志的时候调用，通常不需要实现此方法，或者打印个日志即可。
* `void onShutdown()` 当状态机所在 raft 节点被关闭的时候调用，可以用于一些状态机的资源清理工作，比如关闭文件等。
* `onSnapshotSave` 和 `onSnapshotLoad` Snapshot 的保存和加载，见 3.6 小节。

因为 StateMachine 接口的方法比较多，并且大多数方法可能不需要做一些业务处理，因此 jraft 提供了一个 StateMachineAdapter 桥接类，方便适配实现状态机，除了强制要实现 `onApply` 方法外，其他方法都提供了默认实现，也就是简单地打印日志，用户可以选择实现特定的方法：

```java
public TestStateMachine extends StateMachineAdapter {
    private AtomicLong          leaderTerm = new AtomicLong(-1);
    @Override
    public void onApply(Iterator iter) {
        while(iter.hasNext()){
           //应用任务到状态机
            iter.next();
        }
    }

    @Override
    public void onLeaderStart(long term) {
        //保存 leader term
        this.leaderTerm.set(term);
        super.onLeaderStart(term);
    }
    
}
```

### 3.3 Raft 节点 Node

Node 接口表示一个 raft 的参与节点，他的角色可能是 leader、follower 或者 candidate，随着选举过程而转变。

Node 接口最核心的几个方法如下：

* `void apply(Task task)` __提交一个新任务到 raft group，此方法是线程安全并且非阻塞__，无论任务是否成功提交到 raft group，都会通过 task 关联的 closure done 通知到。如果当前节点不是 leader，会直接失败通知 done closure。
* `PeerId getLeaderId()` 获取当前 raft group 的 leader peerId，如果未知，返回 null
* `shutdown` 和 `join` ，前者用于停止一个 raft 节点，后者可以在 shutdown 调用后等待停止过程结束。
* `void snapshot(Closure done)` 触发当前节点执行一次 snapshot 保存操作，结果通过 done 通知，参见 3.6 节。

其他一些方法都是查询节点信息以及变更 raft group 节点配置，参见第 6 节。

创建一个 raft 节点可以通过 `RaftServiceFactory.createRaftNode(String groupId, PeerId serverId)` 静态方法，其中

* groupId 该 raft 节点的 raft group Id。
* serverId 该 raft 节点的  PeerId 。

创建后还需要初始化才可以使用，初始化调用 `boolean init(NodeOptions opts)` 方法，需要传入 `NodeOptions` 配置。

NodeOptions 主要配置如下：

```java
 // 一个 follower 当超过这个设定时间没有收到 leader 的消息后，变成 candidate 节点的时间。
 // leader 会在 electionTimeoutMs 时间内向 follower 发消息（心跳或者复制日志），如果没有收到，
 // follower 就需要进入 candidate状态，发起选举或者等待新的 leader 出现，默认1秒。
 private int           electionTimeoutMs      = 1000;

 // 自动 Snapshot 间隔时间，默认一个小时
 private int           snapshotIntervalSecs   = 3600;
 
 // 当节点是从一个空白状态启动（snapshot和log存储都为空），那么他会使用这个初始配置作为 raft group
 // 的配置启动，否则会从存储中加载已有配置。
 private Configuration initialConf            = new Configuration();
 
 // 最核心的，属于本 raft 节点的应用状态机实例。
 private StateMachine  fsm;

 // Raft 节点的日志存储路径，必须有
 private String        logUri;
 // Raft 节点的元信息存储路径，必须有
 private String        raftMetaUri;
 // Raft 节点的 snapshot 存储路径，可选，不提供就关闭了 snapshot 功能。
 private String        snapshotUri;
 // 是否关闭 Cli 服务，参见 3.2 节，默认不关闭
 private boolean       disableCli = false; 
 // 内部定时线程池大小，默认按照 cpu 个数计算，需要根据应用实际情况适当调节。
 private int           timerPoolSize          = Utils.cpus() * 3 > 20 ? 20 : Utils.cpus() * 3;
 // Raft 内部实现的一些配置信息，特别是性能相关，参见第6节。
 private RaftOptions   raftOptions            = new RaftOptions();
```

NodeOptions 最重要的就是设置三个存储的路径，以及应用状态机实例，__如果是第一次启动，还需要设置 initialConf 初始配置节点列表__。

然后就可以初始化创建的 Node:

```java
NodeOptions opts = ...
Node node = RaftServiceFactory.createRaftNode(groupId, serverId);
if(!node.init(opts))
   throw new IllegalStateException("启动 raft 节点失败，具体错误信息请参考日志。");
```

创建和初始化结合起来也可以直接用 `createAndInitRaftNode` 方法：

```java
Node node = RaftServiceFactory.createAndInitRaftNode(groupId, serverId, nodeOpts);
```

### 3.4 RPC 服务

单纯一个 raft node 是没有什么用，测试可以是单个节点，但是正常情况下一个 raft grup 至少应该是三个节点，如果考虑到异地多机房容灾，应该扩展到5个节点。

节点之间的通讯使用 bolt 框架的 RPC 服务。

首先，创建节点后，需要将节点地址加入到 NodeManager:

```java
NodeManager.getInstance().addAddress(serverId.getEndpoint());
```

NodeManager 的 address 集合表示本进程提供的 RPC 服务地址列表。

其次，创建 Raft 专用的 RPCServer，内部内置了一套处理内部节点之间交互协议的 processor：

```java
RPCServer rpcServer = RaftRpcServerFactory.createRaftRpcServer(serverId.getEndPoint());
// 启动 RPC 服务
rpcServer.start();
```

上述创建和 start 两个步骤可以合并为一个调用：

```java
RPCServer rpcServer = RaftRpcServerFactory.createAndStartRaftRpcServer(serverId.getEndPoint());
```

这样就为了本节点提供了 RPC Server 服务，其他节点可以连接本节点进行通讯，比如发起选举、心跳和复制等。

但是大部分应用的服务端也会同时提供 RPC 服务给用户使用，__ jraft 允许 raft 节点使用业务提供的 RPCServer 对象，也就是和业务共用同一个服务端口__，这就需要为业务的 RPCServer 注册 raft 特有的通讯协议处理器：

```java
RpcServer rpcServer = ... // 业务的 RPCServer 对象
...注册业务的处理器...
// 注册 Raft 内部协议处理器
RaftRpcServerFactory.addRaftRequestProcessors(rpcServer);
// 启动，共用了端口
rpcServer.start();
```

同样，应用服务器节点之间可能需要一些业务通讯，会使用到 bolt 的 RpcClient，你也可以直接使用 jraft 内部的 rpcClient:

```java
RpcClient rpcClient = ((AbstractBoltClientService) (((NodeImpl) node).getRpcService())).getRpcClient();
```

__这样可以做到一些资源复用，减少消耗，代价就是依赖了 jraft 的内部实现和缺少一些可自定义配置。__

如果基于 Bolt 依赖支持 raft node 之间 RPC 服务 SSL/TLS，需要下面的步骤:

* 服务端 `RpcServer` 配置以下环境变量：

```
// RpcServer init
bolt.server.ssl.enable = true // 是否开启服务端 SSL 支持，默认为 false
bolt.server.ssl.clientAuth = true // 是否开启服务端 SSL 客户端认证，默认为 false
bolt.server.ssl.keystore = bolt.pfx // 服务端 SSL keystore 文件路径
bolt.server.ssl.keystore.password = sfbolt // 服务端 SSL keystore 密码
bolt.server.ssl.keystore.type = pkcs12 // 服务端 SSL keystore 类型，例如 JKS 或者 pkcs12
bolt.server.ssl.kmf.algorithm = SunX509 // 服务端 SSL kmf 算法

// RpcServer stop
bolt.server.ssl.enable = false
bolt.server.ssl.clientAuth = false 
```

* 客户端 `RpcClient` 配置环境变量如下：

```
// RpcClient init
bolt.client.ssl.enable = true // 是否开启客户端 SSL 支持，默认为 false
bolt.client.ssl.keystore = cbolt.pfx // 客户端 SSL keystore 文件路径
bolt.server.ssl.keystore.password = sfbolt // 客户端 SSL keystore 密码
bolt.client.ssl.keystore.type = pkcs12 // 客户端 SSL keystore 类型，例如 JKS 或者 pkcs12
bolt.client.ssl.tmf.algorithm = SunX509 // 客户端 SSL tmf 算法

// RpcClient stop
bolt.client.ssl.enable = false
```

其中服务端 SSL keystore 文件 `bolt.pfx` 和客户端 SSL keystore 文件 `cbolt.pfx` 按照以下步骤生成：

* 首先生成 keystore 并且导出其认证文件。
  
```sh
keytool -genkey -alias securebolt -keysize 2048 -validity  365 -keyalg RSA -dname "CN=localhost" -keypass sfbolt -storepass sfbolt -keystore bolt.pfx -deststoretype pkcs12
  
keytool -export -alias securebolt -keystore bolt.pfx -storepass sfbolt -file bolt.cer
```

* 接着生成客户端 keystore。
  
```sh
keytool -genkey -alias smcc -keysize 2048 -validity 365 -keyalg RSA -dname "CN=localhost" -keypass sfbolt -storepass sfbolt -keystore cbolt.pfx -deststoretype pkcs12
```

* 最后导入服务端认证文件到客户端 keystore。
  
```sh
keytool -import -trustcacerts -alias securebolt -file bolt.cer -storepass sfbolt -keystore cbolt.pfx
```

### 3.5 框架类 RaftGroupService

总结下上文描述的创建和启动一个 raft group 节点的主要阶段：

1. 实现并创建状态机实例
2. 创建并设置好 NodeOptions 实例，指定存储路径，如果是空白启动，指定初始节点列表配置。
3. 创建 Node 实例，并使用 NodeOptions 初始化。
4. 创建并启动 RpcServer ，提供节点之间的通讯服务。

如果完全交给应用来做会相对麻烦，因此 jraft 提供了一个辅助工具类 RaftGroupService 来帮助用户简化这个过程：

```java
String groupId = "jraft";
PeerId serverId = JRaftUtils.getPeerId("localhost:8080");
NodeOptions nodeOptions = ... // 配置 node options

RaftGroupService cluster = new RaftGroupService(groupId, serverId, nodeOptions);
Node node = cluster.start();

// 使用 node 提交任务
Task task = ....
node.apply(task);
```

在 start 方法里会帮助你执行 3 和 4 两个步骤，并返回创建的 Node 实例。

`RaftGroupService` 还有其他构造函数，比如接受一个业务的 RpcServer 共用等:

```java
public RaftGroupService(String groupId, PeerId serverId, NodeOptions nodeOptions, RpcServer rpcServer) 
```

这个传入的 RpcServer 必须调用了 `RaftRpcServerFactory.addRaftRequestProcessors(rpcServer)` 注册了 raft 协议处理器。

### 3.6 Snapshot 服务

当一个 raft 节点重启的时候，内存中的状态机的状态将会丢失，在启动过程中将重放日志存储中的所有日志，重建整个状态机实例。这就导致 3 个问题：

* 如果任务提交比较频繁，比如消息中间件这个场景，那么会导致整个重建过程很长，启动缓慢。
* 如果日志很多，节点需要存储所有的日志，这对存储是一个资源占用，不可持续。
* 如果增加一个节点，新节点需要从 leader 获取所有的日志重放到状态机，这对 leader 和网络带宽都是不小的负担。

因此，通过引入 snapshot 机制来解决这 3 个问题，所谓 snapshot 就是为当前状态机的最新状态打一个”镜像“单独保存，在保存成功后，在这个时刻之前的日志就可以删除，减少了日志存储占用；启动的时候，可以直接加载最新的 snapshot 镜像，然后重放在此之后的日志即可，如果 snapshot 间隔合理，那么整个重放过程会比较快，加快了启动过程。最后，新节点的加入，可以先从 leader 拷贝最新的 snapshot 安装到本地状态机，然后只要拷贝后续的日志即可，可以快速跟上整个 raft group 的进度。

启用 snapshot 需要设置 NodeOptions 的 `snapshotUri` 属性，也就是 snapshot 存储的路径。默认会启动一个定时器自动做 snapshot，间隔通过 NodeOptions 的 `snapshotIntervalSecs` 属性指定，默认 3600 秒，也就是一个小时。

用户也可以主动触发 snapshot，通过 Node 接口的

```java

Node node = ...
Closure done = ...
node.snapshot(done);
```

结果将通知到 closure 回调。

状态机需要实现下列两个方法：

```java
// 保存状态的最新状态，保存的文件信息可以写到 SnapshotWriter 中，保存完成切记调用 done.run(status) 方法。
// 通常情况下，每次 `onSnapshotSave` 被调用都应该阻塞状态机（同步调用）以保证用户可以捕获当前状态机的状态，如果想通过异步 snapshot 来提升性能，
// 那么需要用户状态机支持快照读，并先同步读快照，再异步保存快照数据。
void onSnapshotSave(SnapshotWriter writer, Closure done);
// 加载或者安装 snapshot，从 SnapshotReader 读取 snapshot 文件列表并使用。
// 需要注意的是:
//   程序启动会调用 `onSnapshotLoad` 方法，也就是说业务状态机的数据一致性保障全权由 jraft 接管，业务状态机的启动时应保持状态为空，
// 如果状态机持久化了数据那么应该在启动时先清除数据，并依赖 raft snapshot + replay raft log 来恢复状态机数据。
boolean onSnapshotLoad(SnapshotReader reader);
```

更具体的实现请参考[counter 例子](https://github.com/sofastack/sofa-jraft/wiki/Counter-%E4%BE%8B%E5%AD%90%E8%AF%A6%E8%A7%A3)。

## 4. 客户端

在构建完成 raft group 服务端集群后，客户端需要跟 raft group 交互，本节主要介绍 jraft 提供的一些客户端服务。

### 4.1 路由表 RouteTable

首先要介绍的是 RouteTable 类，用来维护到 raft group 的路由信息。使用很简单，它是一个全局单例，参见下面例子：

```java
// 初始化 RPC 服务
CliClientService cliClientService = new BoltCliClientService();
cliClientService.init(new CliOptions());
// 获取路由表
RouteTable rt = RouteTable.getInstance();
// raft group 集群节点配置
Configuration conf =  JRaftUtils.getConfiguration("localhost:8081,localhost:8082,localhost:8083");
// 更新路由表配置
rt.updateConfiguration("jraft_test", conf);
// 刷新 leader 信息，超时 10 秒，返回成功或者失败
boolean success = rt.refreshLeader(cliClientService, "jraft_test", 10000).isOk();
if(success){
    // 获取集群 leader 节点，未知则为 null
    PeerId leader = rt.selectLeader("jraft_test");
}
```

应用如果需要向 leader 提交任务或者必须向 leader 查询最新数据，<strong>就需要定期调用 </strong><code><strong>refreshLeader</strong></code><strong> 更新路由信息，或者在服务端返回 redirect 重定向信息（自定义协议，参见 counter 例子）的情况下主动更新 leader 信息。</strong>

RouteTable 还有一些查询和删除配置的方法，请直接查看接口注释。

### 4.2 CLI 服务

CLI 服务就是 Client CommandLine Service，是 jraft 在 raft group 节点提供的 RPC 服务中暴露了一系列用于管理 raft group 的服务接口，例如增加节点、移除节点、改变节点配置列表、重置节点配置以及转移 leader 等功能。

具体接口都比较明显，不重复解释了：

```java
public interface CliService extends Lifecycle<CliOptions> {
    // 增加一个节点到 raft group
    Status addPeer(String groupId, Configuration conf, PeerId peer);
    // 从 raft group 移除一个节点
    Status removePeer(String groupId, Configuration conf, PeerId peer);
    // 平滑地迁移 raft group 节点列表
    Status changePeers(String groupId, Configuration conf, Configuration newPeers);
    // 重置某个节点的配置，仅特殊情况下使用，参见第 4 节
    Status resetPeer(String groupId, PeerId peer, Configuration newPeers);
    // 让leader 将 leadership 转给 peer
    Status transferLeader(String groupId, Configuration conf, PeerId peer);
    // 触发某个节点的 snapshot
    Status snapshot(String groupId, PeerId peer);
    // 获取某个 replication group 的 leader 节点
    Status getLeader(final String groupId, final Configuration conf, final PeerId leaderId);
    // 获取某个 replication group 的所有节点
    List<PeerId> getPeers(final String groupId, final Configuration conf);
    // 获取某个 replication group 的所有存活节点
    List<PeerId> getAlivePeers(final String groupId, final Configuration conf);
    // 手动负载均衡 leader 节点
    Status rebalance(final Set<String> balanceGroupIds, final Configuration conf, final Map<String, PeerId> balancedLeaderIds);
}
```

使用例子，首先是创建  CliService  实例：

```java
// 创建并初始化 CliService
CliService cliService = RaftServiceFactory.createAndInitCliService(new CliOptions());
// 使用CliService
Configuration conf = JRaftUtils.getConfiguration("localhost:8081,localhost:8082,localhost:8083");
Status status = cliService.addPeer("jraft_group", conf, new PeerId("localhost", 8083));
if(status.isOk()){
   System.out.println("添加节点成功");
}
```

### 4.3 RPC 服务

客户端的通讯层都依赖 Bolt 的 RpcClient，封装在 `CliClientService` 接口中，实现类就是 `BoltCliClientService` 。
可以通过 BoltCliClientService 的 `getRpcClient` 方法获取底层的 bolt RpcClient 实例，用于其他通讯用途，做到资源复用。

RouteTable 更新 leader 信息同样需要传入 `CliClientService` 实例，<span data-type="color" style="color:#000000"><span data-type="background" style="background-color:#ffffff">用户应该尽量复用这些底层通讯组件，而非重复创建</span></span>用。

## 5. 节点配置变更

参见 4.2 节。可以通过 CliService，也可以通过 Leader 节点 Node 的系列方法来变更，实质上 CliService 都是转发到 leader 节点执行。

## 6. 线性一致读

所谓线性一致性，一个简单的例子就是在 t1 的时间我们写入了一个值，那么在 t1 之后，我们的读一定能读到这个值，不可能读到 t1 之前的值。

因为 raft 本来就是一个为了实现分布式环境下面线性一致性的算法，所以我们可以通过 raft 非常方便的实现线性 read，也就是将任何的读请求走一次 raft log，等这个 log 提交之后，在 apply 的时候从状态机里面读取值，我们就一定能够保证这个读取到的值是满足线性要求的。

当然，大家知道，因为每次 read 都需要走 raft 流程，所以性能是非常的低效的，所以大家通常都不会使用。

所以 jraft 还实现了 RAFT 论文中提到 ReadIndex 和 Lease Read 优化，实现更高效率的线性一致读实现。

关于线性一致读可以参考 pingcap 的这篇博客 [https://www.pingcap.com/blog-cn/lease-read/](https://www.pingcap.com/blog-cn/lease-read/)

在 jraft 中发起一次线性一致读请求的调用如下：

```java
// KV 存储实现线性一致读
public void readFromQuorum(final String key, AsyncContext asyncContext) {
    // 请求 ID 作为请求上下文传入
    final byte[] reqContext = new byte[4];
    Bits.putInt(reqContext, 0, requestId.incrementAndGet());
    // 调用 readIndex 方法，等待回调执行
    this.node.readIndex(reqContext, new ReadIndexClosure() {

        @Override
        public void run(Status status, long index, byte[] reqCtx) {
            if (status.isOk()) {
                try {
                    // ReadIndexClosure 回调成功，可以从状态机读取最新数据返回
                       // 如果你的状态实现有版本概念，可以根据传入的日志 index 编号做读取。
                    asyncContext.sendResponse(new ValueCommand(fsm.getValue(key)));
                } catch (final KeyNotFoundException e) {
                    asyncContext.sendResponse(GetCommandProcessor.createKeyNotFoundResponse());
                }
            } else {
                // 特定情况下，比如发生选举，该读请求将失败
                asyncContext.sendResponse(new BooleanCommand(false, status.getErrorMsg()));
            }
        }
    });
}

```

使用 `Node#readIndex(byte [] requestContext, ReadIndexClosure done)` 发起线性一致读请求，当可以安全读取的时候， 传入的 closure 将被调用，正常情况下可以从状态机中读取数据返回给客户端， jraft 将保证读取的线性一致性。其中 `requestContext` 提供给用户作为请求的附加上下文，可以在 closure 里再次拿到继续处理。

__请注意线性一致读可以在任何集群内的节点发起，并不需要强制要求放到 Leader 节点上，也可以在 Follower 执行，因此可以大大降低 Leader 的读取压力。__

默认情况下，jraft 提供的线性一致读是基于 RAFT 协议的 ReadIndex 实现的，性能已经可以接受，在一些更高性能的场景下，并且可以保证集群内机器的 CPU 时钟同步，那么可以采用 Clock + Heartbeat 的 Lease Read 优化，这个可以通过服务端设置 `RaftOptions` 的 `ReadOnlyOption` 为 `ReadOnlyLeaseBased` 来实现。

```java
public enum ReadOnlyOption {
    // ReadOnlySafe guarantees the linearizability of the read only request by
    // communicating with the quorum. It is the default and suggested option.
    ReadOnlySafe,
    // ReadOnlyLeaseBased ensures linearizability of the read only request by
    // relying on the leader lease. It can be affected by clock drift.
    // If the clock drift is unbounded, leader might keep the lease longer than it
    // should (clock can move backward/pause without any bound). ReadIndex is not safe
    // in that case.
    ReadOnlyLeaseBased;
}
```

两个实现的性能差距大概在 15% 左右。

## 7. 故障和保证

这里说明下 raft group 可能遇到的故障，以及在各种故障情况下的一致性和可用性保证。这里的故障包括:

1. 机器断电。
2. 强杀应用。
3. 节点运行缓慢，比如 OOM ，无法正常提供服务。
4. 网络故障，比如缓慢或者分区。
5. 其他可能的导致 raft 节点无法正常工作的问题。

这里讨论的情况是 raft group 至少 3 个节点，单个节点没有任何可用性的保证，也不应当在生产环境出现。

并且我们将节点提供给客户端的服务分为两类：

* __读服务__，可以从 leader，也可以从 follower 读取状态机数据，但是从 follower 读取的可能不是最新的数据，存在时间差，也就是存在脏读。启用线性一致读将保证线性一致，并且支持从 follower 读取，具体参见第 6 节。
* __写服务__，更改状态机数据，只能提交到 leader 写入。

### 7.1 单个节点故障

单个节点故障，对于整个 raft group 而言，可以继续提供读服务，短暂无法提供写服务，数据一致性没有影响：

1. 如果节点是 leader，那么 raft group 在最多 election timeout 时间后开始选举，产生新的 leader。在产生新 leader 之前，写入服务终止，读服务继续提供，但是可能频繁遇到脏读。线性一致读也将无法服务。
2. 如果节点是 follower，对读和写都没有影响，只是发往某个 follower 的读请求将失败，应用应当重试这些请求到其他节点。

### 7.2 少数节点故障

不大于半数节点的故障称为少数节点故障，这种情况与单个节点的故障情况类似，不再重复讨论。

### 7.3 多数节点故障

超过半数节点的故障称为多数节点故障，这种情况下，整个 raft group 已经不具有可用性，少数节点仍然能提供只读服务，但是无法选举出新的 leader（因为不够半数以上），写入服务就无法恢复，需要尽快恢复故障节点，达到过半数。

在故障节点无法快速恢复的情况下，可以通过 CliService 提供的 `resetPeers(Configuration newPeers)` 方法强制设定剩余存活节点的配置，丢弃故障节点，让剩余节点尽快选举出新的 leader，代价可能是丢失数据，失去一致性承诺，__只有在非常紧急并且可用性更为重要的情况下使用__。

### 7.4 故障与状态机

当一个  raft 节点故障的时候，如果没有发生磁盘损坏等不可逆的存储故障，那么在重新启动该节点的情况下：

1. 如果启用了 snapshot，加载最新 snapshot 到状态机，然后从 snapshot 数据的日志为起点开始继续回放日志到状态机，直到跟上最新的日志。
2. 如果没有启用 snapshot，会重放所有的本地日志到状态机，然后跟上最新的日志。

如果发生磁盘损坏，日志、snapshot 等存储被损坏，那么必须在修正磁盘错误后，该节点在重新启动后从 leader 重新拉取 snapshot 和日志，回放日志，使得状态机达到最新状态。

### 7.5 故障与存储

NodeOptions 有一个 `raftOptions` 选项，用于设置跟性能和数据可靠性相关的参数，其中

```java
/** call fsync when need*/
private boolean sync = true;
```

`sync` 指定了写入日志、raft 和 snapshot 元信息到节点的存储是否调用 fsync，强制刷入磁盘，通常都应该设置为 true，如果不设置为 true，那么可能在多数节点故障的情况下，__永久地丢失数据。__

只有当你确信这个情况可以容忍的时候，才可以设置为 false。

## 8. Metrics 监控

JRaft 内置了基于 [metrics](https://metrics.dropwizard.io/4.0.0/getting-started.html) 类库的性能指标统计，默认不开启，可以通过  `NodeOptions` 的 `setEnableMetrics(true)` 来启用。

```java
Node node = ...
NodeOptions nodeOpts =  ...
nodeOpts.setEnableMetrics(true);
node.init(nodeOpts);

// 将指标定期 30 秒间隔输出到 console
ConsoleReporter reporter = ConsoleReporter.forRegistry(node.getNodeMetrics().getMetricRegistry())
       .convertRatesTo(TimeUnit.SECONDS)
       .convertDurationsTo(TimeUnit.MILLISECONDS)
       .build();
   reporter.start(30, TimeUnit.SECONDS);

```

Reporter 也可以选择输出到 log4j 等日志库或者 tsdb 时序数据库等，具体见 [metrics 类库文档](https://metrics.dropwizard.io/4.0.0/manual/core.html#reporters)。

输出类似：

```plain
-- Histograms ------------------------------------------------------------------
append-logs-bytes
             count = 4
               min = 0
               max = 42
              mean = 17.50
            stddev = 15.52
            median = 18.00
              75% <= 42.00
              95% <= 42.00
              98% <= 42.00
              99% <= 42.00
            99.9% <= 42.00
append-logs-count

......

-- Timers ----------------------------------------------------------------------
append-logs
             count = 4
         mean rate = 44.24 calls/second
     1-minute rate = 0.00 calls/second
     5-minute rate = 0.00 calls/second
    15-minute rate = 0.00 calls/second
               min = 0.00 milliseconds
               max = 3.00 milliseconds
              mean = 1.25 milliseconds
            stddev = 1.09 milliseconds
            median = 1.00 milliseconds
              75% <= 3.00 milliseconds
              95% <= 3.00 milliseconds
              98% <= 3.00 milliseconds
              99% <= 3.00 milliseconds
            99.9% <= 3.00 milliseconds
```

指标含义如下：(所有指标都包含min/max/avg/p95/p99等)

<div class="bi-table">
  <table>
    <colgroup>
      <col width="auto" />
      <col width="auto" />
      <col width="auto" />
    </colgroup>
    <tbody>
      <tr height="34px">
        <td rowspan="1" colSpan="1">
          <div data-type="p">指标名称</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">含义</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">单位</div>
        </td>
      </tr>
      <tr height="34px">
        <td rowspan="1" colSpan="1">
          <div data-type="p">append-logs-bytes</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">每批写入 RAFT 日志的大小</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">字节</div>
        </td>
      </tr>
      <tr height="34px">
        <td rowspan="1" colSpan="1">
          <div data-type="p">append-logs-count</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">每批写入 RAFT 日志的数量</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">个</div>
        </td>
      </tr>
      <tr height="34px">
        <td rowspan="1" colSpan="1">
          <div data-type="p">append-logs</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">写入 RAFT 日志 TPS 和耗时统计</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">批/秒，耗时是毫秒</div>
        </td>
      </tr>
      <tr height="34px">
        <td rowspan="1" colSpan="1">
          <div data-type="p">replicate-entries-bytes</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">每批从 leader 复制日志到 follower的大小</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">字节</div>
        </td>
      </tr>
      <tr height="34px">
        <td rowspan="1" colSpan="1">
          <div data-type="p">replicate-entries-count</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">每批从 leader 复制日志到 follower 的数量</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">个</div>
        </td>
      </tr>
      <tr height="34px">
        <td rowspan="1" colSpan="1">
          <div data-type="p">replicate-entries</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">复制日志到 follower 的 TPS 和耗时统计</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">批/秒，耗时是毫秒</div>
        </td>
      </tr>
      <tr height="34px">
        <td rowspan="1" colSpan="1">
          <div data-type="p">fsm-apply-tasks</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">状态机应用 task 的 TPS 和耗时统计</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">批/秒，耗时是毫秒</div>
        </td>
      </tr>
      <tr height="34px">
        <td rowspan="1" colSpan="1">
          <div data-type="p">fsm-apply-tasks-count</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">状态机每批应用 task 数量 </div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">个</div>
        </td>
      </tr>
      <tr height="34px">
        <td rowspan="1" colSpan="1">
          <div data-type="p">fsm-commit</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">状态机提交总 TPS 和耗时统计（包括了fsm-apply-tasks以及内部处理时间)。</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">批/秒，耗时是毫秒</div>
        </td>
      </tr>
      <tr height="34px">
        <td rowspan="1" colSpan="1">
          <div data-type="p">pre-vote</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">预选举协议 TPS 和耗时统计</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">次/秒，耗时是毫秒</div>
        </td>
      </tr>
      <tr height="34px">
        <td rowspan="1" colSpan="1">
          <div data-type="p">request-vote</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">选举协议 TPS 和耗时统计</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">次/秒，耗时是毫秒</div>
        </td>
      </tr>
      <tr height="34px">
        <td rowspan="1" colSpan="1">
          <div data-type="p">handle-append-entries</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">Follower 处理复制请求的 TPS 和耗时统计</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">批/秒，耗时是毫秒</div>
        </td>
      </tr>
      <tr height="34px">
        <td rowspan="1" colSpan="1">
          <div data-type="p">handle-append-entries-count</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">Follower 处理复制请求每批日志数量</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">个</div>
        </td>
      </tr>
      <tr height="34px">
        <td rowspan="1" colSpan="1">
          <div data-type="p">install-snapshot</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">Follower 处理 snapshot 安装请求 TPS 和耗时统计</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">次/秒，耗时是毫秒</div>
        </td>
      </tr>
      <tr height="34px">
        <td rowspan="1" colSpan="1">
          <div data-type="p">truncate-log-prefix 和 </div>
          <div data-type="p">truncate-log-suffix</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">日志模块删除日志 TPS 和耗时统计</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">次/秒，耗时是毫秒</div>
        </td>
      </tr>
      <tr height="34px">
        <td rowspan="1" colSpan="1">
          <div data-type="p">replicate-inflights-count</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">复制 pipeline in-flight请求数</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">个</div>
        </td>
      </tr>
      <tr height="34px">
        <td rowspan="1" colSpan="1">
          <div data-type="p">read-index</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">处理 ReadIndex 请求的 TPS 和耗时</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">次/秒，耗时是毫秒</div>
        </td>
      </tr>
      <tr height="34px">
        <td rowspan="1" colSpan="1">
          <div data-type="p">handle-read-index-entries</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">处理 ReadIndex每个批次的请求数量</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">个</div>
        </td>
      </tr>
      <tr height="34px">
        <td rowspan="1" colSpan="1">
          <div data-type="p">handle-read-index</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">节点处理 ReadIndex 批量请求的 TPS 和耗时</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">批/秒，耗时是毫秒</div>
        </td>
      </tr>
      <tr height="34px">
        <td rowspan="1" colSpan="1">
          <div data-type="p">raft-rpc-client-thread-pool.{metric}</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">RPC 客户端线程池统计</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p"></div>
        </td>
      </tr>
      <tr height="34px">
        <td rowspan="1" colSpan="1">
          <div data-type="p">raft-utils-closure-thread-pool.{metric}</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">内部 Closure 处理线程池统计</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p"></div>
        </td>
      </tr>
      <tr height="34px">
        <td rowspan="1" colSpan="1">
          <div data-type="p">replicator-{node}.{metric}</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">Replicator 统计</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">append-entries-times:  复制请求次数</div>
          <div data-type="p">heartbeat-times:            心跳请求次数</div>
          <div data-type="p">install-snapshot-times: 安装snapshot请求次数</div>
          <div data-type="p">log-lags:    日志复制延迟个数</div>
          <div data-type="p">next-index: 正在复制的 log index</div>
        </td>
      </tr>
    </tbody>
  </table>
</div>

## 9. 性能优化建议

### 9.1 Raft 节点性能相关配置

NodeOptions 有一个 `raftOptions` 选项，用于设置跟性能和数据可靠性相关的参数，包括：

```java
    /** 节点之间每次文件 RPC (snapshot拷贝）请求的最大大小，默认为 128 K */
    private int     maxByteCountPerRpc      = 128 * 1024;
    /** 是否在拷贝文件中检查文件空洞，暂时未实现 */
    private boolean fileCheckHole           = false;
    /** 从 leader 往 follower 发送的最大日志个数，默认 1024 */
    private int     maxEntriesSize          = 1024;
    /**从 leader 往 follower 发送日志的最大 body 大小，默认 512K*/
    private int     maxBodySize             = 512 * 1024;
    /** 日志存储缓冲区最大大小，默认256K */
    private int     maxAppendBufferSize     = 256 * 1024;
    /** 选举定时器间隔会在指定时间之外随机的最大范围，默认1秒*/
    private int     maxElectionDelayMs      = 1000;
    /** 
     * 指定选举超时时间和心跳间隔时间之间的比值。心跳间隔等于 
     * electionTimeoutMs/electionHeartbeatFactor，默认10分之一。
    */
    private int     electionHeartbeatFactor = 10;
    /** 向 leader 提交的任务累积一个批次刷入日志存储的最大批次大小，默认 32 个任务*/
    private int     applyBatch              = 32;
    /** 写入日志、元信息的时候必要的时候调用 fsync，通常都应该为 true*/
    private boolean sync                    = true;
    /** 
     * 写入 snapshot/raft 元信息是否调用 fsync，默认为 false，
     * 在 sync 为 true 的情况下，优选尊重 sync
     */
    private boolean syncMeta                = false;
    /**
     * 内部 disruptor buffer 大小，如果是写入吞吐量较高的应用，需要适当调高该值，默认 16384
     */
    private int     disruptorBufferSize     = 16384;
    /** 是否启用复制的 pipeline 请求优化，默认打开*/
    private boolean replicatorPipeline      = true;
    /** 在启用 pipeline 请求情况下，最大 in-flight 请求数，默认256*/
    private int   maxReplicatorInflightMsgs = 256;
    /** 是否启用 LogEntry checksum*/
    private boolean enableLogEntryChecksum  = false;
    
    /** ReadIndex 请求级别，默认 ReadOnlySafe，具体含义参见线性一致读章节*/
    private ReadOnlyOption readOnlyOptions  = ReadOnlyOption.ReadOnlySafe;
```

对于重度吞吐量的应用，需要适当调整缓冲区大小、批次大小等参数，以实际测试性能为准。

### 9.2 针对应用的建议

#### 9.2.1 状态机实现建议

* 优先继承 `StateMachineAdapter` 适配器，而非直接实现 `StateMachine` 接口，适配器提供了绝大部分默认实现。
* 启动状态机前，需要清空状态机数据，因为 jraft 将通过 snapshot 以及 raft log 回放来恢复状态机，如果你的状态机存有旧的数据并且有非幂等操作，那么将出现数据不一致
* 尽力优化 `onApply(Iterator)` 方法，避免阻塞，加速状态机 apply 性能。
* 推荐实现 snapshot，否则每次重启都将重新重放所有的日志，并且日志不能压缩，长期运行将占用空间。
* Snapshot 的 save/load 方法都将阻塞状态机，应该尽力优化，避免阻塞。Snapshot 的保存如果可以做到增强备份更好。
* `onSnapshotSave` 需要在保存后调用传入的参数 `closure.run(status)` 告知保存成功或者失败，推荐的实现类似：

```java
  @Override
    public void onSnapshotSave(SnapshotWriter writer, Closure done) {
       // 同步获取状态机的当前镜像状态 state
       // 异步保存 state
       // 保存成功或者失败都通过 done.run(status) 通知到 jraft
    }
```

#### 9.2.2 RPC 建议

* 建议开启 CliService 服务，方便查询和管理 RAFT 集群。
* 是否复用 RPC Server取决于应用，如果都使用 bolt RPC，建议复用，减少资源占用。
* Task 的 data 序列化采用性能和空间相对均衡的方案，例如 protobuf 等。
* 业务 RPC processor 不要与 JRaft RPC processor 共用线程池，避免影响 RAFT 内部协议交互。

#### 9.2.3 客户端建议

* 使用 `RouteTable` 管理集群信息，定期 `refreshLeader` 和 `refreshConfiguration` 获取集群最新状态。
* 业务协议应当内置 Redirect 重定向请求协议，当写入到非 leader 节点，返回最新的 leader 信息到客户端，客户端可以做适当重试。通过定期拉取和 redirect 协议的结合，来提升客户端的可用性。
* 建议使用线性一致读，将请求散列到集群内的所有节点上，降低 leader 的负荷压力。

## 10. 如何基于 SPI 扩展

如果基于 SPI 扩展支持适配新 LogEntry 编/解码器，需要下面的步骤:

* 实现 `com.alipay.sofa.jraft.JRaftServiceFactory` 创建服务工厂接口。
* 添加注解 `@SPI` 到 `LogEntryCodecFactory` 实现类，设置优先级 `priorty` 注解属性。

```java
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target({ ElementType.TYPE })
public @interface SPI {

    String name() default "";

    int priority() default 0;
}
```

* 需要在自己的工程目录(META-INF.services)添加 `com.alipay.sofa.jraft.JRaftServiceFactory` 指定自定义实现。
* 实现 `com.alipay.sofa.jraft.entity.codec.LogEntryCodecFactory` LogEntry 编/解码工厂接口。
* `JRaftServiceFactory` 自定义实现指定新的 `LogEntryCodecFactory` 。

## 11. 排查故障工具

在程序运行时，可以利用 Linux 平台的 SIGUSR2 信号输出节点的状态信息以及 metric 数据，具体执行方式: `kill -s SIGUSR2 pid`
相关信息会输出到指定目录，默认在程序工作目录（cwd:  lsof -p $pid | grep cwd）生成 2 个文件：node_metrics.log 和 node_describe.log，其中 node_metrics.log 存储节点 metric 数据，node_describe.log 存储节点状态信息。

<div class="bi-table">
  <table>
    <colgroup>
      <col width="auto" />
      <col width="auto" />
      <col width="auto" />
    </colgroup>
    <tbody>
      <tr height="34px">
        <td rowspan="1" colSpan="1">
          <div data-type="p">目录变量</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">默认目录</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">文件名称</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">文件描述</div>
        </td>
      </tr>
      <tr height="34px">
        <td rowspan="1" colSpan="1">
          <div data-type="p">jraft.signal.node.metrics.dir</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">cwd:  lsof -p $pid | grep cwd</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">node_metrics.log</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">节点 metric 数据</div>
        </td>
      </tr>
     <tr height="34px">
        <td rowspan="1" colSpan="1">
          <div data-type="p">jraft.signal.node.describe.dir</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">cwd:  lsof -p $pid | grep cwd</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">node_describe.log</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">节点状态信息</div>
        </td>
      </tr>
    </tbody>
  </table>
</div>

```text
nodeId: <rhea_example--1/127.0.0.1:8181>
state: STATE_FOLLOWER
term: 16
conf: ConfigurationEntry [id=LogId [index=59, term=16], conf=127.0.0.1:8181,127.0.0.1:8182,127.0.0.1:8183, oldConf=]
electionTimer: 
  RepeatedTimer [timerTask=com.alipay.sofa.jraft.util.RepeatedTimer$1@519d2775, stopped=false, running=true, destroyed=false, invoking=false, timeoutMs=1000]
voteTimer: 
  RepeatedTimer [timerTask=null, stopped=true, running=false, destroyed=false, invoking=false, timeoutMs=1000]
stepDownTimer: 
  RepeatedTimer [timerTask=null, stopped=true, running=false, destroyed=false, invoking=false, timeoutMs=500]
snapshotTimer: 
  RepeatedTimer [timerTask=com.alipay.sofa.jraft.util.RepeatedTimer$1@3a3b5443, stopped=false, running=true, destroyed=false, invoking=false, timeoutMs=3600000]
logManager: 
  storage: [1, 136]
  diskId: LogId [index=136, term=16]
  appliedId: LogId [index=136, term=16]
  lastSnapshotId: LogId [index=0, term=0]
fsmCaller: 
  StateMachine [Idle]
ballotBox: 
  lastCommittedIndex: 136
  pendingIndex: 0
  pendingMetaQueueSize: 0
snapshotExecutor: 
  lastSnapshotTerm: 0
  lastSnapshotIndex: 0
  term: 16
  savingSnapshot: false
  loadingSnapshot: false
  stopped: false
replicatorGroup: 
  replicators: []
  failureReplicators: []
```

```text
-- rheakv 19-7-13 15:28:15 ===============================================================

-- rheakv -- Timers ----------------------------------------------------------------------
rhea-db-timer_BATCH_PUT
             count = 2
         mean rate = 0.10 calls/second
     1-minute rate = 0.31 calls/second
     5-minute rate = 0.38 calls/second
    15-minute rate = 0.39 calls/second
               min = 0.06 milliseconds
               max = 2.12 milliseconds
              mean = 1.09 milliseconds
            stddev = 1.03 milliseconds
            median = 2.12 milliseconds
              75% <= 2.12 milliseconds
              95% <= 2.12 milliseconds
              98% <= 2.12 milliseconds
              99% <= 2.12 milliseconds
            99.9% <= 2.12 milliseconds
rhea-db-timer_PUT
             count = 10
         mean rate = 0.87 calls/second
     1-minute rate = 1.84 calls/second
     5-minute rate = 1.97 calls/second
    15-minute rate = 1.99 calls/second
               min = 0.01 milliseconds
               max = 0.58 milliseconds
              mean = 0.09 milliseconds
            stddev = 0.17 milliseconds
            median = 0.03 milliseconds
              75% <= 0.04 milliseconds
              95% <= 0.58 milliseconds
              98% <= 0.58 milliseconds
              99% <= 0.58 milliseconds
            99.9% <= 0.58 milliseconds
rhea-rpc-request-timer_-1
             count = 0
         mean rate = 0.00 calls/second
     1-minute rate = 0.00 calls/second
     5-minute rate = 0.00 calls/second
    15-minute rate = 0.00 calls/second
               min = 0.00 milliseconds
               max = 0.00 milliseconds
              mean = 0.00 milliseconds
            stddev = 0.00 milliseconds
            median = 0.00 milliseconds
              75% <= 0.00 milliseconds
              95% <= 0.00 milliseconds
              98% <= 0.00 milliseconds
              99% <= 0.00 milliseconds
            99.9% <= 0.00 milliseconds

...


```

## 12. Rocksdb 配置更改

SOFJRaft 的 log storage 默认实现基于 rocksdb 存储，默认的 rocksdb 配置为吞吐优先原则，可能不适合所有场景以及机器规格，比如 4G 内存的机器建议缩小 block_size 以避免过多的内存占用。


```java
final BlockBasedTableConfig conf = new BlockBasedTableConfig() //
            // Begin to use partitioned index filters
            // https://github.com/facebook/rocksdb/wiki/Partitioned-Index-Filters#how-to-use-it
            .setIndexType(IndexType.kTwoLevelIndexSearch) //
            .setFilter(new BloomFilter(16, false)) //
            .setPartitionFilters(true) //
            .setMetadataBlockSize(8 * SizeUnit.KB) //
            .setCacheIndexAndFilterBlocks(false) //
            .setCacheIndexAndFilterBlocksWithHighPriority(true) //
            .setPinL0FilterAndIndexBlocksInCache(true) //
            // End of partitioned index filters settings.
            .setBlockSize(4 * SizeUnit.KB)//
            .setBlockCacheSize(64 * SizeUnit.MB) //
            .setCacheNumShardBits(8);

StorageOptionsFactory.registerRocksDBTableFormatConfig(RocksDBLogStorage.class, conf);
```

## 13. 只读成员（Learner）

从 [1.3.0 版本](https://github.com/sofastack/sofa-jraft/releases/tag/1.3.0)开始， SOFAJRaft 引入了只读成员（学习者：Learner）支持，只读的节点类似 Follower，将从 Leader 复制日志并应用到本地状态机，但是不参与选举，复制成功也不被认为是多数派的一员。简而言之，除了复制日志以外，只读成员不参与其他任何 raft 算法过程。一般应用在为某个服务创建一个只读服务的时候，实现类似读写分离的效果，或者数据冷备等场景。

为一个 raft group 设置一个只读节点非常容易，任何以 `/learner` 为后缀的节点都将被认为是只读节点：

```java
// 3 节点 raft group 带一个只读节点
Configuration conf = JRaftUtils.getConfiguration("localhost:8081,localhost:8082,localhost:8083,localhost:8084/learner");
```

上面就创建了一个 raft 分组，其中普通成员是 `localhost:8081,localhost:8082,localhost:8083`，而 `localhost:8084` 就是一个 learner 只读节点，它带有 `/learner` 后缀。你可以指定任意多个只读节点，但是由于日志复制都是从 leader 到 follower/learner，如果有大量学习者的话，可能 leader 的带宽会是一个问题，需要适当留意。

Learner 节点的启动和其他 raft node 没有区别，同样可以有 `StateMachine` 和 Snapshot 机制。同时，只读节点也同样支持线性一致读 `readIndex` 调用。

除了静态配置之外，你还可以通过 `CliService` 动态地增加或者移除只读节点：

```java
    // 增加只读节点
    Status addLearners(final String groupId, final Configuration conf, final List<PeerId> learners);

    // 移除只读节点
    Status removeLearners(final String groupId, final Configuration conf, final List<PeerId> learners);

    // 重新设置所有只读节点
    Status resetLearners(final String groupId, final Configuration conf, final List<PeerId> learners);
```
