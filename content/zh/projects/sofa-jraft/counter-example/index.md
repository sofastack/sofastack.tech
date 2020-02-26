---
title: "Counter 例子详解"
---

本文档主要介绍一个基于 jraft 的分布式计数器的例子。

## 场景

在多个节点（机器）组成的一个 raft group 中保存一个分布式计数器，该计数器可以递增和获取，并且在所有节点之间保持一致，任何少数节点的挂掉都不会影响对外提供的两个服务：

1. incrmentAndGet(delta) 递增 delta 数值并返回递增后的值。
2. get() 获取最新的值

## RPC 请求

jraft 底层使用 [bolt](https://github.com/alipay/sofa-bolt) 作为通讯框架，定义两个请求

* IncrementAndGetRequest，用于递增

```java
public class IncrementAndGetRequest implements Serializable {

    private static final long serialVersionUID = -5623664785560971849L;

    private long              delta;

    public long getDelta() {
        return this.delta;
    }

    public void setDelta(long delta) {
        this.delta = delta;
    }
}
```

* GetValueRequest，用于获取最新值：

```java
public class GetValueRequest implements Serializable {
    private static final long serialVersionUID = 9218253805003988802L;

    public GetValueRequest() {
        super();
    }

}
```

应答结果 ValueResponse，包括：

1. success　是否成功
2. value 成功情况下返回的最新值
3. errorMsg 失败情况下的错误信息
4. redirect　发生了重新选举，需要跳转的新的leader节点。

```java
public class ValueResponse implements Serializable {

    private static final long serialVersionUID = -4220017686727146773L;

    private long              value;
    private boolean           success;
    /**
     * redirect peer id
     */
    private String            redirect;

    private String            errorMsg;

    public String getErrorMsg() {
        return this.errorMsg;
    }

    public void setErrorMsg(String errorMsg) {
        this.errorMsg = errorMsg;
    }
    ......
}
```

* IncrementAndAddClosure 用于 Leader 服务端接收 
* IncrementAndGetRequest 请求后的回调处理：

```java
public class IncrementAndAddClosure implements Closure {
    private CounterServer          counterServer;
    private IncrementAndGetRequest request;
    private ValueResponse          response;
    private Closure                done; // 网络应答callback

    public IncrementAndAddClosure(CounterServer counterServer, IncrementAndGetRequest request, ValueResponse response,
                                  Closure done) {
        super();
        this.counterServer = counterServer;
        this.request = request;
        this.response = response;
        this.done = done;
    }

    @Override
    public void run(Status status) {
        // 返回应答给客户端
        if (this.done != null) {
            done.run(status);
        }
    }

    public IncrementAndGetRequest getRequest() {
        return this.request;
    }

    public void setRequest(IncrementAndGetRequest request) {
        this.request = request;
    }

    public ValueResponse getResponse() {
        return this.response;
    }

}
```

## 服务端

### 状态机 CounterStateMachine

首先持有一个初始值：

```java
public class CounterStateMachine extends StateMachineAdapter {
    /**
     * counter value
     */
    private AtomicLong          value      = new AtomicLong(0); 
```

实现核心的 `onApply(iterator)` 方法，应用用户提交的请求到状态机：

```java
  @Override
    public void onApply(Iterator iter) {
        // 遍历日志
        while (iter.hasNext()) {
            long delta = 0;

            IncrementAndAddClosure closure = null;
            // done 回调不为null，必须在应用日志后调用，如果不为 null，说明当前是leader。
            if (iter.done() != null) {
                // 当前是leader，可以直接从 IncrementAndAddClosure 中获取 delta，避免反序列化
                closure = (IncrementAndAddClosure) iter.done();
                delta = closure.getRequest().getDelta();
            } else {
                // 其他节点应用此日志，需要反序列化 IncrementAndGetRequest，获取 delta
                ByteBuffer data = iter.getData();
                try {
                    IncrementAndGetRequest request = Codecs.getSerializer(Codecs.Hessian2).decode(data.array(),
                        IncrementAndGetRequest.class.getName());
                    delta = request.getDelta();
                } catch (CodecException e) {
                    LOG.error("Fail to decode IncrementAndGetRequest", e);
                }
            }
            long prev = this.value.get();
            // 更新状态机
            long updated = value.addAndGet(delta);
            // 更新后，确保调用 done，返回应答给客户端。
            if (closure != null) {
                closure.getResponse().setValue(updated);
                closure.getResponse().setSuccess(true);
                closure.run(Status.OK());
            }
            LOG.info("Added value={} by delta={} at logIndex={}", prev, delta, iter.getIndex());
            iter.next();
        }
    }
```

### CounterServer

启动一个 raft node节点，提供分布式计数器服务，内部使用 jraft 提供的 `RaftGroupService` 服务框架：

```java
public class CounterServer {
    // jraft 服务端服务框架
    private RaftGroupService    raftGroupService;
    // raft 节点
    private Node                node;
    // 业务状态机
    private CounterStateMachine fsm;

    public CounterServer(String dataPath, String groupId, PeerId serverId, NodeOptions nodeOptions) throws IOException {
        // 初始化路径
        FileUtils.forceMkdir(new File(dataPath));
        // 初始化全局定时器
        TimerManager.init(50);

        // 这里让 raft RPC 和业务 RPC 使用同一个 RPC server, 通常也可以分开.
        RpcServer rpcServer = new RpcServer(serverId.getPort());
        RaftRpcServerFactory.addRaftRequestProcessors(rpcServer);
        // 注册业务处理器
        rpcServer.registerUserProcessor(new GetValueRequestProcessor(this));
        rpcServer.registerUserProcessor(new IncrementAndGetRequestProcessor(this));
        // 初始化状态机
        this.fsm = new CounterStateMachine();
        // 设置状态机到启动参数
        nodeOptions.setFsm(this.fsm);
        // 设置存储路径
        // 日志, 必须
        nodeOptions.setLogUri(dataPath + File.separator + "log");
        // 元信息, 必须
        nodeOptions.setRaftMetaUri(dataPath + File.separator + "raft_meta");
        // snapshot, 可选, 一般都推荐
        nodeOptions.setSnapshotUri(dataPath + File.separator + "snapshot");
        // 初始化 raft group 服务框架
        this.raftGroupService = new RaftGroupService(groupId, serverId, nodeOptions, rpcServer);
        // 启动
        this.node = this.raftGroupService.start();
    }

    public CounterStateMachine getFsm() {
        return this.fsm;
    }

    public Node getNode() {
        return this.node;
    }

    public RaftGroupService RaftGroupService() {
        return this.raftGroupService;
    }

    /**
     * 生成重定向请求
     */
    public ValueResponse redirect() {
        ValueResponse response = new ValueResponse();
        response.setSuccess(false);
        if (node != null) {
            PeerId leader = node.getLeaderId();
            if (leader != null) {
                response.setRedirect(leader.toString());
            }
        }

        return response;
    }

    public static void main(String[] args) throws IOException {
        if (args.length != 4) {
            System.out
                .println("Useage : java com.alipay.jraft.example.counter.CounterServer {dataPath} {groupId} {serverId} {initConf}");
            System.out
                .println("Example: java com.alipay.jraft.example.counter.CounterServer /tmp/server1 counter 127.0.0.1:8081 127.0.0.1:8081,127.0.0.1:8082,127.0.0.1:8083");
            System.exit(1);
        }
        String dataPath = args[0];
        String groupId = args[1];
        String serverIdStr = args[2];
        String initConfStr = args[3];

        NodeOptions nodeOptions = new NodeOptions();
        // 为了测试, 调整 snapshot 间隔等参数
        nodeOptions.setElectionTimeoutMs(5000);
        nodeOptions.setDisableCli(false);
        nodeOptions.setSnapshotIntervalSecs(30);
        // 解析参数
        PeerId serverId = new PeerId();
        if (!serverId.parse(serverIdStr)) {
            throw new IllegalArgumentException("Fail to parse serverId:" + serverIdStr);
        }
        Configuration initConf = new Configuration();
        if (!initConf.parse(initConfStr)) {
            throw new IllegalArgumentException("Fail to parse initConf:" + initConfStr);
        }
        // 设置初始集群配置
        nodeOptions.setInitialConf(initConf);

        // 启动
        CounterServer counterServer = new CounterServer(dataPath, groupId, serverId, nodeOptions);
        System.out.println("Started counter server at port:"
                           + counterServer.getNode().getNodeId().getPeerId().getPort());
    }
}
```

启动三个节点的参数类似：

 **windows 用户请注意第一个参数的数据目录设置** 

```sh
/tmp/server1 counter 127.0.0.1:8081 127.0.0.1:8081,127.0.0.1:8082,127.0.0.1:8083
/tmp/server2 counter 127.0.0.1:8082 127.0.0.1:8081,127.0.0.1:8082,127.0.0.1:8083
/tmp/server3 counter 127.0.0.1:8083 127.0.0.1:8081,127.0.0.1:8082,127.0.0.1:8083
```

分别为 server1/server2/server3三个目录，raft group名称为 counter，节点ip也分别为

```text
127.0.0.1:8081,127.0.0.1:8082,127.0.0.1:8083
```

注册的网络请求处理器，我们看下 IncrementAndGetRequestProcessor 实现，一个普通的 bolt processor ：

```java
public class IncrementAndGetRequestProcessor extends AsyncUserProcessor<IncrementAndGetRequest> {
    private static final Logger LOG = LoggerFactory.getLogger(IncrementAndGetRequestProcessor.class);

    private CounterServer       counterServer;

    public IncrementAndGetRequestProcessor(CounterServer counterServer) {
        super();
        this.counterServer = counterServer;
    }

    @Override
    public void handleRequest(BizContext bizCtx, AsyncContext asyncCtx, IncrementAndGetRequest request) {

　　　　　// 非leader，生成跳转请求
        if (!counterServer.getFsm().isLeader()) {
            asyncCtx.sendResponse(counterServer.redirect());
            return;
        }

        // 构建应答回调
        ValueResponse response = new ValueResponse();
        IncrementAndAddClosure closure = new IncrementAndAddClosure(counterServer, request, response, new Closure() {

            @Override
            public void run(Status status) {
                // 提交后处理
                if (!status.isOk()) {
                    // 提交失败，返回错误信息
                    response.setErrorMsg(status.getErrorMsg());
                    response.setSuccess(false);
                }
                // 成功，返回ValueResponse应答
                asyncCtx.sendResponse(response);

            }
        });

        try {
            // 构建提交任务
            Task task = new Task();
            task.setDone(closure); // 设置回调
            // 填充数据，将请求用 hessian２序列化到 data　字段
            task.setData(ByteBuffer.wrap(Codecs.getSerializer(Codecs.Hessian2).encode(request)));

            // 提交到 raft group
            counterServer.getNode().apply(task);
        } catch (CodecException e) {
            // 处理序列化异常
            LOG.error("Fail to encode IncrementAndGetRequest", e);
            ValueResponse responseObject = response;
            responseObject.setSuccess(false);
            responseObject.setErrorMsg(e.getMessage());
            asyncCtx.sendResponse(responseObject);
        }
    }

    @Override
    public String interest() {
        return IncrementAndGetRequest.class.getName();
    }

}

```

## 客户端

客户端 CounterClient 比较简单，主要使用 jraft 提供的 `RouteTable` 来刷新获取最新的 leader 节点，然后发送请求到 leader节点即可：

```java
public class CounterClient {
    public static void main(String[] args) throws Exception {        
        if (args.length != 2) {
            System.out.println("Useage : java com.alipay.jraft.example.counter.CounterClient {groupId} {conf}");
            System.out
                .println("Example: java com.alipay.jraft.example.counter.CounterClient counter 127.0.0.1:8081,127.0.0.1:8082,127.0.0.1:8083");
            System.exit(1);
        }
        String groupId = args[0];
        String confStr = args[1];

        Configuration conf = new Configuration();
        if (!conf.parse(confStr)) {
            throw new IllegalArgumentException("Fail to parse conf:" + confStr);
        }
        // 更新raft group配置
        RouteTable.getInstance().updateConfiguration(groupId, conf);

```

接下来初始化 RPC 客户端并更新路由表:

```java
BoltCliClientService cliClientService = new BoltCliClientService();
cliClientService.init(new CliOptions());

if (!RouteTable.getInstance().refreshLeader(cliClientService, groupId, 1000).isOk()) {
    throw new IllegalStateException("Refresh leader failed");
}

```

获取 leader 后发送请求：

```java
PeerId leader = RouteTable.getInstance().selectLeader(groupId);
System.out.println("Leader is " + leader);
int n = 1000;
CountDownLatch latch = new CountDownLatch(n);
long start = System.currentTimeMillis();
for (int i = 0; i < n; i++) {
    incrementAndGet(cliClientService, leader, i, latch);
}
latch.await();
System.out.println(n + " ops, cost : " + (System.currentTimeMillis() - start) + " ms.");
System.exit(0);
```

incrementAndGet 方法实现比较简单了：

```java
private static void incrementAndGet(BoltCliClientService cliClientService, PeerId leader, long delta,
                                    CountDownLatch latch) throws RemotingException, InterruptedException {
    // 构建 IncrementAndGetRequest 请求并发送到 leader
    IncrementAndGetRequest request = new IncrementAndGetRequest();
    request.setDelta(delta);
    cliClientService.getRpcClient().invokeWithCallback(leader.getEndpoint().toString(), request,
        new InvokeCallback() {

            @Override
            public void onResponse(Object result) {
                latch.countDown();
                System.out.println("incrementAndGet result:" + result);
            }

            @Override
            public void onException(Throwable e) {
                e.printStackTrace();
                latch.countDown();

            }

            @Override
            public Executor getExecutor() {
                return null;
            }
        }, 5000);
}

```

## Snapshot 实现

为了避免每次节点重启的时候，重新应用一遍所有的日志，并且避免保存所有的日志，可以使用 snapshot 机制，也就是为状态机做一个 checkpoint，保存当时状态机的状态，删除在此之前的所有日志，核心是实现 StateMachine的两个方法：

1. `onSnapshotLoad`，启动或者安装 snapshot 后加载 snapshot
2. `onSnapshotSave` ，定期保存 snapshot

我们先为 Counter实现一个snapshot数据文件：

```java
public class CounterSnapshotFile {
    private static final Logger LOG = LoggerFactory.getLogger(CounterSnapshotFile.class);
    private String              path;

    public CounterSnapshotFile(String path) {
        super();
        this.path = path;
    }

    public String getPath() {
        return this.path;
    }

    /**
     * Save value to snapshot file.
     * @param value
     * @return
     */
    public boolean save(long value) {
        try {
            FileUtils.writeStringToFile(new File(path), String.valueOf(value));
            return true;
        } catch (IOException e) {
            LOG.error("Fail to save snapshot", e);
            return false;
        }
    }

    public long load() throws IOException {
        String s = FileUtils.readFileToString(new File(path));
        if (!StringUtils.isBlank(s)) {
            return Long.parseLong(s);
        }
        throw new IOException("Fail to load snapshot from " + path + ",content: " + s);
    }
}
```

保存到指定的 `path` 。

然后实现 StateMachine的两个方法：

```java
    public boolean onSnapshotLoad(SnapshotReader reader) {
        // leader不用从 snapshot 加载，他不会接受 snapshot 安装请求
        if (isLeader()) {
            LOG.warn("Leader is not supposed to load snapshot");
            return false;
        }
        // 未找到数据文件，忽略
        if (reader.getFileMeta("data") == null) {
            LOG.error("Fail to find data file in {}", reader.getPath());
            return false;
        }
        // 将 snapshot 保存在 reader.getPath()/data 文件里
        CounterSnapshotFile snapshot = new CounterSnapshotFile(reader.getPath() + File.separator + "data");
        try {
            this.value.set(snapshot.load());
            return true;
        } catch (IOException e) {
            LOG.error("Fail to load snapshot from {}", snapshot.getPath());
            return false;
        }

    }

      public void onSnapshotSave(final SnapshotWriter writer, final Closure done) {
        // 获取此刻状态机状态
        final long currVal = this.value.get();
        // 异步保存，避免阻塞状态机
        Utils.runInThread(new Runnable() {

            @Override
            public void run() {
                CounterSnapshotFile snapshot = new CounterSnapshotFile(writer.getPath() + File.separator + "data");
                if (snapshot.save(currVal)) {
                    if (writer.addFile("data")) {
                        done.run(Status.OK());
                    } else {
                        done.run(new Status(RaftError.EIO, "Fail to add file to writer"));
                    }
                } else {
                    done.run(new Status(RaftError.EIO, "Fail to save counter snapshot %s", snapshot.getPath()));
                }
            }
        });
    }
```

snapshot 的间隔可以通过 NodeOptions 的 snapshotIntervalSecs 控制，默认一个小时。
