---

title: "Use case of a counter"
---

This topic mainly describes a JRaft-based distributed counter.

## Scenario

Save a distributed counter in a raft group of multiple nodes (servers). The counter can increment and be called while remaining consistent among all nodes. The counter can normally provide two external services when a minority of nodes fail:

1. incrmentAndGet(delta): increments the value of delta and returns the incremented value.
2. get(): gets the latest value.

## Remote procedure calls (RPCs)

JRaft adopts the [Bolt](https://github.com/alipay/sofa-bolt) communication framework at the underlayer, and defines two requests:

* IncrementAndGetRequest: used for incrementing the value

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

* GetValueRequest: used for getting the latest value

```java
public class GetValueRequest implements Serializable {
    private static final long serialVersionUID = 9218253805003988802L;

    public GetValueRequest() {
        super();
    }

}
```

ValueResponse responses include:

1. success: indicates that the request was successful
2. value: the latest value returned by a successful request
3. errorMsg: the error message of a failed request
4. redirect: indicates that a leader election occurred and the request needs to be sent to the new leader node

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

* IncrementAndAddClosure: used for receiving requests at the leader node
* IncrementAndGetRequest: used for handling callbacks of the request

```java
public class IncrementAndAddClosure implements Closure {
    private CounterServer          counterServer;
    private IncrementAndGetRequest request;
    private ValueResponse          response;
    private Closure                done; // The network response callback

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
        // Return the response to the client
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

## Server

### CounterStateMachine

First hold an initial value:

```java
public class CounterStateMachine extends StateMachineAdapter {
    /**
     * counter value
     */
    private AtomicLong          value      = new AtomicLong(0);
```

Implement the core `onApply(iterator)` method, and apply the user request to the state machine:

```java
@Override
    public void onApply(Iterator iter) {
        // Traverse the log
        while (iter.hasNext()) {
            long delta = 0;

            IncrementAndAddClosure closure = null;
            // If the done callback is not null, it must be called after the log entry application. If it is not null, the current load is the leader.
            if (iter.done() != null) {
                // If the current node is the leader, the delta value can be directly obtained from IncrementAndAddClosure to avoid deserialization.
                closure = (IncrementAndAddClosure) iter.done();
                delta = closure.getRequest().getDelta();
            } else {
                // If another node applies this log entry, it needs to deserialize IncrementAndGetRequest to get the delta value.
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
            // Update the state machine.
            long updated = value.addAndGet(delta);
            // Be sure to call done after the update and return the response to the client.
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

Start a Raft node to provide the distributed counter service, and use the `RaftGroupService` framework provided by JRaft internally.

```java
public class CounterServer {
    // JRaft server service framework
    private RaftGroupService    raftGroupService;
    // Raft node
    private Node                node;
    // Business state machine
    private CounterStateMachine fsm;

    public CounterServer(String dataPath, String groupId, PeerId serverId, NodeOptions nodeOptions) throws IOException {
        // Initialize the path.
        FileUtils.forceMkdir(new File(dataPath));
        // Initialize the global timer.
        TimerManager.init(50);

        // Here Raft RPC and business RPC share the same RPC server. They can use different RPC servers, too.
        RpcServer rpcServer = new RpcServer(serverId.getPort());
        RaftRpcServerFactory.addRaftRequestProcessors(rpcServer);
        // Register the business processor.
        rpcServer.registerUserProcessor(new GetValueRequestProcessor(this));
        rpcServer.registerUserProcessor(new IncrementAndGetRequestProcessor(this));
        // Initialize the state machine.
        this.fsm = new CounterStateMachine();
        // Set the state machine to the startup parameters.
        nodeOptions.setFsm(this.fsm);
        // Set the storage path.
        // Required. Specify the log.
        nodeOptions.setLogUri(dataPath + File.separator + "log");
        // Required. Specify the metadata.
        nodeOptions.setRaftMetaUri(dataPath + File.separator + "raft_meta");
        // Recommended. Specify the snapshot.
        nodeOptions.setSnapshotUri(dataPath + File.separator + "snapshot");
        // Initialize the Raft group service framework.
        this.raftGroupService = new RaftGroupService(groupId, serverId, nodeOptions, rpcServer);
        // Startup
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
     * Generate the redirect request.
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
        // Adjust arguments such as the snapshot interval for testing.
        nodeOptions.setElectionTimeoutMs(5000);
        nodeOptions.setDisableCli(false);
        nodeOptions.setSnapshotIntervalSecs(30);
        // Parse the parameter.
        PeerId serverId = new PeerId();
        if (!serverId.parse(serverIdStr)) {
            throw new IllegalArgumentException("Fail to parse serverId:" + serverIdStr);
        }
        Configuration initConf = new Configuration();
        if (!initConf.parse(initConfStr)) {
            throw new IllegalArgumentException("Fail to parse initConf:" + initConfStr);
        }
        // Set the initial cluster configuration.
        nodeOptions.setInitialConf(initConf);

        // Startup
        CounterServer counterServer = new CounterServer(dataPath, groupId, serverId, nodeOptions);
        System.out.println("Started counter server at port:"
                           + counterServer.getNode().getNodeId().getPeerId().getPort());
    }
}
```

Parameters for starting three nodes are similar:

**If you use Windows, exercise caution when you set the data directory for the first parameter.**

```sh
/tmp/server1 counter 127.0.0.1:8081 127.0.0.1:8081,127.0.0.1:8082,127.0.0.1:8083
/tmp/server2 counter 127.0.0.1:8082 127.0.0.1:8081,127.0.0.1:8082,127.0.0.1:8083
/tmp/server3 counter 127.0.0.1:8083 127.0.0.1:8081,127.0.0.1:8082,127.0.0.1:8083
```

There are three directories: server1, server2, and server3. The name of the Raft group is counter. The IP addresses of these three nodes are respectively:

```text
127.0.0.1:8081,127.0.0.1:8082,127.0.0.1:8083
```

The implementation of the registered network request processor IncrementAndGetRequestProcessor, a general Bolt processor, is as follows:

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

　　　　　// Generate a redirect request if the node is not the leader.
        if (!counterServer.getFsm().isLeader()) {
            asyncCtx.sendResponse(counterServer.redirect());
            return;
        }

        // Create a response callback.
        ValueResponse response = new ValueResponse();
        IncrementAndAddClosure closure = new IncrementAndAddClosure(counterServer, request, response, new Closure() {

            @Override
            public void run(Status status) {
                // Responses
                if (!status.isOk()) {
                    // Return the error message if the request fails.
                    response.setErrorMsg(status.getErrorMsg());
                    response.setSuccess(false);
                }
                // Return the ValueResponse if the request is successful.
                asyncCtx.sendResponse(response);

            }
        });

        try {
            // Create a task.
            Task task = new Task();
            task.setDone(closure); // Set the callback
            // Serialize the request by using Codecs.Hessian2, and fill in the serialized data in the data field.
            task.setData(ByteBuffer.wrap(Codecs.getSerializer(Codecs.Hessian2).encode(request)));

            // Submit the task to the Raft group.
            counterServer.getNode().apply(task);
        } catch (CodecException e) {
            // Serialization exception
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

## Client

The CounterClient is relatively simple. It mainly uses the `RouteTable` provided by JRaft to refresh and obtain the latest leader node, and then send the request to the leader node:

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
        // Update the Raft group configuration.
        RouteTable.getInstance().updateConfiguration(groupId, conf);
```

Next, initialize the RPC client and update the route table:

```java
BoltCliClientService cliClientService = new BoltCliClientService();
cliClientService.init(new CliOptions());

if (!RouteTable.getInstance().refreshLeader(cliClientService, groupId, 1000).isOk()) {
    throw new IllegalStateException("Refresh leader failed");
}
```

Obtain the latest leader and send the request:

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

The implementation of the incrementAndGet method is simple:

```java
private static void incrementAndGet(BoltCliClientService cliClientService, PeerId leader, long delta,
                                    CountDownLatch latch) throws RemotingException, InterruptedException {
    // Create an IncrementAndGetRequest request and send it to the leader.
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

## Snapshot implementation

To avoid applying all log entries again and again after starting up each node and to avoid storing all log entries, we can use the snapshot mechanism. Simply put, we create a checkpoint for the state machine to save its current state, and delete all previous logs. The core of this mechanism is to implement two StateMachine methods:

1. `onSnapshotLoad` is used to start or install a snapshot and load the snapshot.
2. `onSnapshotSave` is used to regularly save snapshots.

First, we need to create a snapshot data file for the counter:

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

Save the file to the specified `path`.

Then we implement the above two methods:

```java
public boolean onSnapshotLoad(SnapshotReader reader) {
        // The leader does not load snapshots or accept the snapshot installation request.
        if (isLeader()) {
            LOG.warn("Leader is not supposed to load snapshot");
            return false;
        }
        // Ignore it if the data file is not found.
        if (reader.getFileMeta("data") == null) {
            LOG.error("Fail to find data file in {}", reader.getPath());
            return false;
        }
        // Save snapshots in the reader.getPath()/data file.
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
        // Obtain the current state of the state machine.
        final long currVal = this.value.get();
        // Asynchronously save the snapshot to avoid blocking the state machine.
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

You can set the snapshot interval by using the snapshotIntervalSecs method of NodeOptions. The default interval is one hour.

