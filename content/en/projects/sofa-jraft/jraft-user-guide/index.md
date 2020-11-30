---

title: "JRaft user guide"
---

## 0. Basic concepts

* Every request submitted by log index to a Raft group is serialized into a log entry. Each log entry has an ID, which monotonically increases within the Raft group, and the log entries are replicated to every Raft node in the group.
* Term is a long-type number that monotonically increases within the Raft group. You can simply take it as the number of votes. The term of an elected leader is called the leader term. Before this leader steps down, log entries submitted during this period have the same term.

## 1. Configuration and supporting classes

This topic mainly describes the configuration and utility methods and classes. The core objects are:

* Endpoint, which refers to a service address
* PeerId, which refers to ID of a Raft node
* Configuration, which refers to the configuration of a Raft group, or a node list in other words.

### 1.1 Endpoint

Endpoint refers to a service address, including the IP address and the port number. __Raft nodes must not be started on the IPv4 address 0.0.0.0. The startup IP address must be clearly specified__
Create a address, and bind it to port 8080 of the local host, as shown in the following example:

```java
  Endpoint addr = new Endpoint("localhost", 8080);
  String s = addr.toString(); // The result is localhost:8080
  PeerId peer = new PeerId();
  boolean success = peer.parse(s);  // Specifies whether parsing the endpoint from a string is supported. The result is true.
```

### 1.2 PeerId

A PeerId indicates a participant (leader, follower, or candidate) of the Raft protocol. It comprises three elements in the format of ip:port:index, where ip is the IP address of the node, port is the port number, and index is the serial number of the same port. Currently, the index is not used, and is always set to 0. This field is reserved to allow starting different Raft nodes from the same port and to differentiate them by index.

Create a PeerId and set the index to 0, the IP to localhost, and the port to 8080:

```java
PeerId peer = new PeerId("localhost", 8080);
EndPoint addr = peer.getEndpoint(); // Gets the endpoint of a node
int index = peer.getIdx(); // Gets the index of a node, which is always set to 0 currently

String s = peer.toString(); // The result is localhost:8080
boolean success = peer.parse(s);  // Specifies whether PeerId parsing from a string is supported. The result is true.
```

### 1.3 Configuration

It refers to the configuration of a Raft group, or a participant list in other words.

```java
PeerId peer1 = ...
PeerId peer2 = ...
PeerId peer3 = ...
// A Raft group that consists of three nodes
Configuration conf = new Configuration();
conf.addPeer(peer1);
conf.addPeer(peer2);
conf.addPeer(peer3);
```

### 1.4 JRaftUtils utility class

To enable users conveniently create objects such as Endpoint, PeerId, and Configuration, Jraft provides the JRaftUtils class to help users quickly create the required objects from strings.

```java
Endpoint addr = JRaftUtils.getEndpoint("localhost:8080");
PeerId peer = JRaftUtils.getPeerId("localhost:8080");
// A Raft group that consists of three nodes. Separate the nodes with commas (,).
Configuration conf = JRaftUtils.getConfiguration("localhost:8081,localhost:8082,localhost:8083");
```

### 1.5 Closure and status

Closure is a simple callback interface. Most methods provided by Jraft are asynchronous callbacks. The result is sent to users through this interface:

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

The status method `Status#isOk()` is used to get the status of the request, which can be a success or failure. You can use two other methods to get the error code and error messages:

```java
boolean success= status.isOk();
RaftError error = status.getRaftError(); // Gets the error code. RaftError is an enumeration class.
String errMsg = status.getErrorMsg(); // Gets the error message
```

Status provides some methods to:

```java
// Conveniently create a successful status
Status ok = Status.OK();
// Conveniently create an error for a failure. Error messages support string templates.
String filePath = "/tmp/test";
Status status = new Status(RaftError.EIO, "Fail to read file from %s", filePath);
```

### 1.6 Task

Task is one of the most important classes used by JRaft users. Users can use the Task class to submit a task from a Raft group. The task will then be submitted to the leader and replicated to the follower nodes. A task contains the following information:

* `ByteBuffer data` The task data to be submitted. The user should serialize the business data to be replicated into a ByteBuffer record by using a serialization method (such as Java and Hessian2), and place the record into the task.
* `long expected term =-1`The expected leader term when the task is submitted. If not specified (the default value -1 will be used), the client does not check whether the leader has changed before the task is applied to the state machine. If this field is specified (obtained from the state machine callback as described later in this topic), the client will check whether the term matches the actual leader term before the task is applied to the state machine. It will decline this task for a term mismatch.
* `Closure done` The callback of the task. Regardless of whether a task is successful or failed, the result of the task is sent to this object upon completion of the task. This closure can be get and called when the `StateMachine#onApply(iterator)` method is applied to the state machine. It is generally used for returning responses to the client.

Create a simple task:

```java
Closure done = ...;
Task task = new Task();
task.setData(ByteBuffer.wrap("hello".getBytes());
task.setClosure(done);
```

The closure of a task can also use the special `TaskClosure` interface, which provides an additional `onCommitted` callback method.

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

When JRaft detects a task's done callback is `TaskClosure`, JRaft will call the `onCommitted` method after the Raft log entry is submitted to the Raft group (and replicated to a majority of nodes) and before it is applied to the state machine.

## 2. Server

This section mainly describes the major interfaces and classes in JRaft server programming. The core interfaces and classes are:

* StateMachine: The main interface that implements users' business logic. The state machine is run on every Raft node. Generally, successfully submitted tasks will eventually be applied to the state machine on each node.
* Raft node: A Raft node that can be used to submit tasks and query for the Raft group information, such as the current state, the current leader, and the current term.
* RPC service: The remote control call (RPC) service which is responsible for communication (such as leader election and log replication) between Raft nodes.
* RaftGroupService: A supporting programming framework class that is used to conveniently assemble a Raft group node.

### 2.1 Iterator

Tasks submitted by clients to the Raft group are submitted in batches within JRaft, and then applied to the state machine in the form of a task iterator, which is represented by the `com.alipay.sofa.jraft.Iterator` interface. Here is a typical example:

```java
Iterator it = ....
// Traverse the iteration task list
while(it.hasNext()){
  ByteBuffer data = it.getData(); // Get the current task data
  Closure done = it.done();  // Get the closure callback of the current task
  long index = it.getIndex();  // Get the unique log number of the task, which monotonically increases, and is automatically assigned by JRaft
  long term = it.getTerm();  // Get the leader term of the task
  ... Logical processing... 
  it.next(); // Move to the next task
}
```

Note that if no closure is set for the task, done may be null. __In addition, done is null when it ends up on a follower node, because done will not be replicated to other Raft nodes except for the leader node__.

Here is an optimization solution. <strong>Generally, the Closure done obtained by the leader can be extended to wrap a closure class, which contains user requests that are not serialized. Therefore, the leader can directly get user requests from closure in the logical processing stage, without </strong><code><strong>data</strong></code><strong></strong> deserialization, which reduces the CPU overhead of the leader. For more information, see the counter example.

### 2.2 StateMachine

Tasks submitted to a Raft group will eventually be replicated and applied to the state machine of each Raft node. A state machine is represented by the `StateMachine` interface. Its core methods include:

* `void onApply(Iterator iter)` is the most important method that applies tasks to the state machine in their submission order. <strong>Note that when this method returns, we consider that this batch of tasks have been successfully applied to the state machine. If they are not completely applied (in the case of errors or exceptions), a critical error will be reported to the state machine's </strong><code><strong>onError</strong></code><strong> method, and the error type would be </strong><code><strong>ERROR_TYPE_STATE_MACHINE</strong></code><strong> </strong>. For more information about the handling of faults and errors, see Section 6 of this topic.
* `void onError(RaftException e)` This method is called when a critical error occurs. RaftException contains detailed error information such as the status. When this method is called, no new tasks will be allowed to be applied to the state machine until the error is fixed and the node is restarted. Therefore, all errors encountered during the development stage should be promptly fixed. Please let us know if there are any JRaft problems.
* `void onLeaderStart (long term)` This method is called when the Raft node of the state machine becomes a leader. The current term of the leader is passed through the parameter.
* `void onLeaderStop (Status status)` This method is called when the Raft node of the current state machine loses the leadership position. The `status` field describes the detailed reasons, such as proactive leadership transfer and re-election.
* `void onStartFollowing (LeaderChangeContext ctx)` This method is called when a Raft follower or candidate node starts to follow a leader. `LeaderChangeContext` contains contextual information of the leader, such as the PeerId, term, and status. In addition, the leaderId attribute of the current Raft node is then set as the PeerId of the new leader node.
* `void onStopFollowing (LeaderChangeContext ctx)` A Raft follower stops following a leader node. This is usually caused by a leadership transfer, for example, a new leader is elected, or an election starts. Likewise, `LeaderChangeContext` describes the event that the follower stops following the leader, and the status field describes the detailed reasons.
* `void onConfigurationCommitted (Configuration conf)`This method is called when a Raft group node configuration is submitted to the raft group log. It is usually unnecessary to implement this method, or this can be replaced with log printing.
* `void onShutdown ()` This method is called when the Raft node of the state machine is closed. It can be used for resource cleanup, such as closing files, on some state machines.
* `For more information about the snapshot saving and loading methods onSnapshotSave` and `onSnapshotLoad`, see Section 2.6.

The StateMachine interface has_many methods, and most of them are not required for business processing. Therefore, JRaft provides a StateMachineAdapter class to help users quickly adapt to the state machine. Except for the `onApply` method that must be implemented, other methods offer the default implementation, which is simply log printing. Users can choose specific methods to implement.

```java
public TestStateMachine extends StateMachineAdapter {
    private AtomicLong          leaderTerm = new AtomicLong(-1);
    @Override
    public void onApply(Iterator iter) {
        while(iter.hasNext()){
           // Apply a task to state machine
            iter.next();
        }
    }

    @Override
    public void onLeaderStart(long term) {
        // Save the leader term
        this.leaderTerm.set(term);
        super.onLeaderStart(term);
    }
    
}
```

### 2.3 Raft nodes

The Node interface refers to a Raft node, the role of which can be a leader, follower, or candidate. The role may change in the election progress.

The most important methods of the Node interface are:

* `void apply(Task task)` __Submits a new task to the Raft group. This method is thread safe and nonblocking__. Regardless of whether the task is successfully submitted to raft group, the result will be sent to the user through the Closure done callback associated with the task. If the current node is not the leader, a failure notification will be directly sent to the Closure done.
* `PeerId getLeaderId()` Gets the current leader peerId of the Raft group. If the peerId is unknown, null is returned.
* `shutdown` and `Join`. The former is used to stop a Raft node, and the latter can wait for the shutdown process to end after the shutdown call.
* `void snapshot (Closure done)` Triggers the current node to perform a snapshot save operation. The result is sent to the user through Closure done. For more information, see Section 2.6.

Other methods are used to query node information and changing the node configuration in a Raft group. For more information, see Section 5.

You can use the `RaftServiceFactory.createRaftNode(String groupId, PeerId serverId)` static method to create a Raft node, where

* the groupId is the Raft group ID of this Raft node.
* The serverId is the PeerId of this Raft node.

After you create the Raft node, you need to initialize it. To initialize the node, you can call the `boolean init (NodeOptions opts)` method and pass the `NodeOptions` configuration.

Main configuration items of NodeOptions are as follows:

```java
 // Specify a period of time, during which
 // the leader is expected to send AppendEntries RPCs for log replication or heartbeats (AppendEntries RPCs that carry no log entries) to followers. If a follower fails to receive communication within this period,
 // the follower transitions to the candidate state, starts a leader election, and remains in the candidate state until it wins the election or waits for a new leader to appear. Default value: 1s (1000 ms).
 private int           electionTimeoutMs      = 1000;

 // Specify the snapshot interval. Default value: 1 hour.
 private int           snapshotIntervalSecs   = 3600;
 
 // When a node is started from the empty state (no snapshots or log entries available), it uses this initial configuration as the startup configuration of the Raft group.
 // Otherwise, it loads existing configuration from the storage.
 private Configuration initialConf            = new Configuration();
 
 // Specify the most important component - the state machine instance of this Raft node.
 private StateMachine  fsm;

 // Required. Specify the log storage path of the Raft node.
 private String        logUri;
 // Required. Specify the meta information storage path of the Raft node.
 private String        raftMetaUri;
 // Optional. Specify the snapshot storage path of the Raft node. The snapshot feature is disabled if the path is not specified.
 private String        snapshotUri;
 // Specify whether to disable the CLI service. Default value: false. For more information, see Section 3.2.
 private boolean       disableCli = false; 
 // Specify the internal timer pool size. The default value is subject to the number of CPU cores. You need to adjust the value based on the actual situation.
 private int           timerPoolSize          = Utils.cpus() * 3 > 20 ? 20 : Utils.cpus() * 3;
 // Specify the configuration options of some internal Raft implementations, especially the performance related options. For more information, see Section 6.
 private RaftOptions   raftOptions            = new RaftOptions();
```

The most important configuration items in NodeOptions are the three storage paths (of the log, meta information, and snapshots) and the state machine instance. __When you start a node for the first time, you need to set the initialConf node list__.

Then you can initialize the node that you have created.

```java
NodeOptions opts = ...
Node node = RaftServiceFactory.createRaftNode(groupId, serverId);
if(!node.init(opts))
   throw new IllegalStateException("Unable to restart the Raft node. For more information about the error, see the log.") ;
```

You can also directly use the `createAndInitRaftNode` method to create and initialize a Raft node:

```java
Node node = RaftServiceFactory.createAndInitRaftNode(groupId, serverId, nodeOpts);
```

### 2.4 RPC service

One Raft node is not enough. You can test a single node, but generally, a Raft group should consist of at least three nodes. If remote disaster recovery is required, scale it up to five nodes.

Communication between different nodes is implemented by the RPC service of the SOFABolt framework.

First, you need to create Raft nodes, and add the endpoints of the nodes to the NodeManager.

```java
NodeManager.getInstance().addAddress(serverId.getEndpoint());
```

NodeManager's address collection consists of endpoints of Raft nodes to which the RPC service is provided.

Second, create a Raft-specific RPC server, which is built in with a set of processors to process communication protocols between internal nodes:

```java
RPCServer rpcServer = RaftRpcServerFactory.createRaftRpcServer(serverId.getEndPoint());
// Start the RPC service.
rpcServer.init(null);
```

You can combine the RPC server creation and startup steps into one operation.

```java
RPCServer rpcServer = RaftRpcServerFactory.createAndStartRaftRpcServer(serverId.getEndPoint());
```

You can call this operation to provide RPC Server service to the specified node. You can connect other nodes to this one for RPC-based communication. For example, issuing leader election RPCs, heartbeat RPCs, and log replication RPCs.

In actual practice, most application servers also provide the RPC service to end users. JRaft allows Raft nodes to use the RPCServer of the application, which means the RPC service and the application share the same server port. In this case, you need to register Raft protocol processors with the RPC server of the application:

```java
RpcServer rpcServer = ... // Specify the RPCServer object of the application.
...Register processors with the application...
// Register processors with the RPC server for processing Raft protocols.
RaftRpcServerFactory.addRaftRequestProcessors(rpcServer);
// Start the RPC server with the same server port as that of the application server.
rpcServer.init(null);
```

Service communication between application server nodes may also be implemented by RpcClient of SOFABolt. You can also directly use the rpcClient object of JRaft to meet this requirement:

```java
RpcClient rpcClient = ((AbstractBoltClientService) (((NodeImpl) node).getRpcService())).getRpcClient();
```

__This increases the resource usage efficiency and reduces the costs, but it also increases JRaft dependency and reduces custom configurations.__

### 2.5 RaftGroupService framework class

To sum up, main steps required for creating and starting a Raft group are as follows:

1. Implement and create a state machine instance.
2. Create and set the NodeOptions instance. Specify the storage paths of the log, meta information, and snapshots. In addition, specify the initial configuration for nodes that are started without configuration.
3. Create nodes and then initialize them by using NodeOptions.
4. Create and start the RpcServer to provide communication service between nodes.

If all these procedures are completely left to be implemented by the application, it would be rather complex. Therefore, JRaft provides the RaftGroupService utility class to simplify this process:

```java
String groupId = "jraft";
PeerId serverId = JRaftUtils.getPeerId("localhost:8080");
NodeOptions nodeOptions = ... // Configure the node options.

RaftGroupService cluster = new RaftGroupService(groupId, serverId, nodeOptions);
Node node = cluster.start();

// Use a node to apply a task.
Task task = ....
node.apply(task);
```

You can use the start method to implement Step 3 and Step 4, and return the created nodes.

`RaftGroupService` also offers some other constructors, for example, to allow shared use of the RpcServer with an application.

```java
public RaftGroupService(String groupId, PeerId serverId, NodeOptions nodeOptions, RpcServer rpcServer)
```

In this case, the passed RpcServer must be registered with Raft-protocol processors with the `RaftRpcServerFactory.addRaftRequestProcessors(rpcServer)` operation.

### 2.6 Snapshot service

When you restart a Raft node, all states of the state machine will be lost from the memory. During the startup, all log entries stored in the node's local log file is re-applied to the state machine to rebuild the state machine instance. This leads to the following problems:

* In scenarios where tasks are applied very frequently, for example, in the case of message oriented middleware, rebuilding the state machine will be time-consuming and result in a very slow startup.
* In scenarios with large amounts of log entries, storing all log entries on a node requires considerable storage space and is not sustainable.
* When a new node is added to an existing Raft group, the new node must replicate all log entries from the leader and apply them to the state machine, posing an unignorable burden on both the leader and the network bandwidth.

Therefore, JRaft introduces the snapshot mechanism to solve these problems. The basic idea is to create a snapshot of the latest state of a state machine, and save this snapshot separately. After that, you can delete all previous log entries to reduce the storage space usage. When you restart the node, you can directly load the latest snapshot, and then apply log entries written in the log after the time of the snapshot. If the snapshot interval is reasonable, the time required for reapplying the log entries should be short, and the startup process is sped up. When you add a new node to an existing Raft group, you can first replicate the latest snapshot from the leader, install the snapshot on the state machine of the new node, and then replicate the log entries newly added after the snapshot time. This allows the new node to quickly catch up the progress of the entire Raft group.

To start a snapshot, in NodeOptions, you need to set the `snapshotUri` parameter, which specifies the storage path of snapshots. A timer will be started to create snapshots. You can specify the interval of snapshots by setting the `snapshotIntervalSecs` parameter in NodeOptions. The default value is 3600s, or 1 hour.

You can also use the done closure to of the Node interface to proactively trigger snapshot creation.

```java
Node node = ...
Closure done = ...
node.snapshot(done);
```

The result will be sent to the closure.

You need to implement the following two methods on the state machine:

```java
// Save the snapshot of the latest state. You can write the information of the saved snapshot to the SnapshotWriter. Remember to call the done.run(status) method after the snapshot is saved.
void onSnapshotSave(SnapshotWriter writer, Closure done);
// Load or install the snapshot on the local state machine. Read the snapshot files from the SnapshotReader, and select the latest one.
boolean onSnapshotLoad(SnapshotReader reader);
```

For more information about the detailed implementation, see [Use case of a counter](https://github.com/sofastack/sofa-jraft/wiki/Counter-%E4%BE%8B%E5%AD%90%E8%AF%A6%E8%A7%A3).

## 3. Client

After creating a Raft group, clients need to interact with the Raft group. This section mainly describes some client services provided by JRaft.

### 3.1 RouteTable

The RouteTable class is used to maintain the route information for the access to the Raft group. It is a global singleton and is easy to use. For more information, see the example below:

```java
// Initialize the RPC service.
CliClientService cliClientService = new BoltCliClientService();
cliClientService.init(new CliOptions());
// Get the route table.
RouteTable rt = RouteTable.getInstance();
// Configure nodes of the Raft group.
Configuration conf =  JRaftUtils.getConfiguration("localhost:8081,localhost:8082,localhost:8083");
// Update the route table configuration.
rt.updateConfiguration("jraft_test", conf);
// Refresh the leader information, and return the success or error message after the timeout of 10s.
boolean success = rt.refreshLeader(cliClientService, "jraft_test", 10000).isOk();
if(success){
    // Get the leader information of the cluster, and return null if the leader is unknown.
    PeerId leader = rt.selectLeader("jraft_test");
}
```

If an application needs to raise requests to the leader or query the latest data from the leader, it needs to <strong>regularly call the</strong><code> <strong>refreshLeader</strong></code><strong> method to update the route table information, or proactively update the leader information when the server returns the redirect message (a custom protocol). For more information, see Use case of a counter.</strong>

The RouteTable class also provides methods to query and delete configuration. For more information, see the API section.

### 3.2 CLI service

In JRaft, the client command line (CLI) service provides some service interface methods to manage the Raft group, for example, to add or delete nodes, change the node configuration list, reset node configuration, and to transfer the leader. These methods can be called by the RPC service for Raft nodes.

The methods are very straight forward and are explained as follows:

```java
public interface CliService extends Lifecycle<CliOptions> {
    // Add a node to an existing Raft group
    Status addPeer(String groupId, Configuration conf, PeerId peer);
    // Remove a node from the Raft group
    Status removePeer(String groupId, Configuration conf, PeerId peer);
    // Smoothly change nodes of the Raft group
    Status changePeers(String groupId, Configuration conf, Configuration newPeers);
    // Reset the configuration of a specific node. Use this method only in special circumstances. For more information, see Section 4.
    Status resetPeer(String groupId, PeerId peer, Configuration newPeers);
    // Transfer the leadership of a leader to a peer (follower)
    Status transferLeader(String groupId, Configuration conf, PeerId peer);
    // Trigger the snapshot creation
    Status snapshot(String groupId, PeerId peer);
}
```

To use the CLI service, you need to first create a CliService instance:

```java
// Create and initialize a CliService instance
CliService cliService = RaftServiceFactory.createAndInitCliService(new CliOptions());
// Use the CliService instance
Configuration conf = JRaftUtils.getConfiguration("localhost:8081,localhost:8082,localhost:8083");
Status status = cliService.addPeer("jraft_group", conf, new PeerId("localhost", 8083));
if(status.isOk()){
   System.out.println ("Node added successfully");
}
```

### 3.3 RPC service

Communication of the clients is dependent on RpcClient of SOFABolt, which is encapsulated in the `CliClientService` interface. The implementation class is `BoltCliClientService`.
You can call the `getRpcClient` method of the BoltCliClientService class to get the underlying Bolt RpcClient instance, and use it for other communication services. This increases the resource usage efficiency.

You need to pass the `CliClientService` instance, when you refresh the RouteTable or leader information at the client side. <span data-type="color" style="color:#000000"><span data-type="background" style="background-color:#ffffff">You should do your best to reuse such underlying communication components, instead of repetitively creating new ones.</span></span>

## 4. Node configuration change

For more information, see Section 3.2. You can use either CliService or Node methods of the leader node to change node configuration. Actually, all CliService methods are forwarded to and implemented on the leader node.

## 5. Linearizable read

Here is a simple example. Assume that we write a value at the moment t1. We can certainly read this value after t1, but we cannot read values written earlier than t1.

The Raft consensus algorithm is designed to implement linear consensus in a distributed environment. Therefore, we can conveniently use Raft to implement linerizable read. We can go through the Raft log process for any read requests at any time. After a log entry of the read request is applied to the state machine, we can ensure that the result read from the state machine meets the linear consensus requirement.

However, as you know, if every read request needs to go through the Raft process, the efficiency can be very low. Therefore, this method is seldom used.

To solve this problem, JRaft implements the ReadIndex and Lease Read optimization solutions as mentioned in the Raft paper, to provide more efficient linearizable read solutions.

For more information about linearizable read, see the PingCap blog [https://www.pingcap.com/blog-cn/lease-read/](https://www.pingcap.com/blog-cn/lease-read/)

The following code shows how to initiate a linearizable read request in JRaft:

```java
// Implement linearizable read of KV data.
public void readFromQuorum(final String key, AsyncContext asyncContext) {
    // Pass the request ID as the context of the request.
    final byte[] reqContext = new byte[4];
    Bits.putInt(reqContext, 0, requestId.incrementAndGet());
    // Call the ReadIndex method, and wait for the execution of the ReadIndexClosure.
    this.node.readIndex(reqContext, new ReadIndexClosure() {

        @Override
        public void run(Status status, long index, byte[] reqCtx) {
            if (status.isOk()) {
                try {
                    // If the ReadIndexClosure returns a success message, the latest data can be read from the state machine and returned to the client.
                       // If your state implementation is subject to version control, you can read the data based on the log index ID.
                    asyncContext.sendResponse(new ValueCommand(fsm.getValue(key)));
                } catch (final KeyNotFoundException e) {
                    asyncContext.sendResponse(GetCommandProcessor.createKeyNotFoundResponse());
                }
            } else {
                // In special cases, for example a leader election, the read request fails.
                asyncContext.sendResponse(new BooleanCommand(false, status.getErrorMsg()));
            }
        }
    });
}
```

Use `Node#readIndex(byte [] requestContext, ReadIndexClosure done)` to initiate a linearizable read request. When the data can be securely read, the passed closure will be called. In normal circumstances, the data can be read from the state machine and returned to the client. This is how JRaft ensures linearizable read by using the readIndex method. The request context provided by `requestContext` to the user can be obtained in the done closure for follow-up processing.

__Note that linearizable reads can be initiated on any nodes within a Raft node cluster. You do not have to direct all read requests on the leader node. You can handle read requests on followers, too. This can significantly reduce the read stress of the leader.__

Linearizable read provided by JRaft is implemented based on ReadIndex of the Raft protocol by default. The performance of this solution is acceptable. When higher performance is required and CPU clock synchronization can be ensured, you can apply the clock-based LeaseRead optimization and further improve the performance. To implement this solution, set `ReadOnlyOption` to `ReadOnlyLeaseBased` in `RaftOptions`.

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

The LeaseRead solution improves the performance of the ReadIndex solution by approximately 15%. 

## 6. Failures and countermeasures

This section describes possible failures that a Raft group may encounter, and JRaft's countermeasures to ensure the distributed consensus and availability of the Raft group. Possible failures are:

1. Server power outage
2. App force-stop
3. Service unavailability caused by slow node operation, for example, in the case of OOM exceptions
4. Network failures such as network partitioning and slow network speed
5. Other issues that may hinder Raft nodes from normal operation

In this document, a raft group should consist of at least three nodes. The use of a single node cannot guarantee the availability and must be avoided in the production environment.

Moreover, we divide services that a Raft node provides to clients into two types:

* __Read service__: Clients can read data of the state machine from both the leader node and follower nodes. However, data read from a follower node may not be the latest because of the time gap, which may lead to stale read. JRaft enables linearizable read to ensure linear consensus, and supports reading data from follower nodes.
* __Write service__: Clients can send requests to the leader node only, to update data on the state machine.

### 6.1 Single node failure

In the case of a single node failure, the Raft group as a whole can continue providing the read service but cannot provide the write service temporarily. This does not affect data consistency:

1. If the failed node is the leader, the followers of the Raft group starts a new election to elect a new leader after the specified timeout. Before the new leader appears, the Raft group does not provide the write service, but continues to provide the read service. However, this may frequently cause stale read. Linearizable read cannot be provided either.
2. If the failed node is a follower, the Raft group continues to provide both read and write services. The only difference is that some read requests sent to the failed follower node will not be responded. The application should try sending these requests to other nodes.

### 6.2 Failures of a minority of nodes

In the case of failures of a minority of nodes, less than half of the nodes become unavailable. This situation is similar to that of single node failures.

### 6.3 Failures of a majority of nodes

In the case of failures of a majority of nodes, more than half of the nodes become unavailable. In this case, the Raft group as a whole becomes unavailable. Although some nodes continue to provide the read-only service, they cannot elect a new leader to recover the write service (because the remaining nodes cannot provide more than half of votes that are required to elect a new leader). You need to recover the unavailable nodes, and make sure that more than half of the nodes of the group are available.

If you cannot quickly recover unavailable nodes, you may use the `resetPeers(Configuration newPeers)` method of CliService to change the configuration of the remaining nodes and discard unavailable nodes to quickly elect a new leader. This may cause data loss and compromise data consistency. __Do not use this method unless in extremely urgent circumstances where availability is more important__.

### 6.4 Failures and the state machine

In the case of a single node failure without irrevertible storage failures such as disk damage, perform the following after restarting this node:

1. If snapshot is enabled, load the latest snapshot on the state machine, and re-apply log entries written after snapshot generation to the state machine, until it catches up with the progress of the Raft group.
2. If snapshot is disabled, reload all local log entries to the state machine, and catch up with the progress of the Raft group.

In the case of storage failures, such as disk damage, and storage failures of the log file and snapshots, fix the storage problem, reload the node, and pull the latest snapshot and log entries from the leader, load the snapshot on the state machine, and apply the log entries to it to ensure it reaches the latest state.

### 6.6 Failures and storage

NodeOptions provides the `raftOptions` configuration item to allow you to set parameters related to performance and data reliability. The

```java
/** call fsync when need*/
private boolean sync = true;
```

`sync` parameter specifies whether to call the fsync method to flush the data to the local disk of the node when you write log entries and meta information of the Raft group and snapshots to the local storage of a node. Generally, you should set this parameter to true. If not, you may __permanently lose the data when a majority of nodes fail.__

You can set it to false only when you are sure that data loss is acceptable.

## 7. Metrics monitoring

JRaft provides the performance metric statistics based on the [metrics](https://metrics.dropwizard.io/4.0.0/getting-started.html) class library. This function is disabled by default. You can call the `setEnableMetrics(true)` method in `NodeOptions` to enable it.

```java
Node node = ...
NodeOptions nodeOpts =  ...
nodeOpts.setEnableMetrics(true);
node.init(nodeOpts);

// Report the metrics to the console every 30s.
ConsoleReporter reporter = ConsoleReporter.forRegistry(node.getNodeMetrics().getMetricRegistry())
       .convertRatesTo(TimeUnit.SECONDS)
       .convertDurationsTo(TimeUnit.MILLISECONDS)
       .build();
   reporter.start(30, TimeUnit.SECONDS);
```

You can also make the reporter to report metrics to log libraries (such as Log4j) and time series databases. For more information, see the [Metrics document](https://metrics.dropwizard.io/4.0.0/manual/core.html#reporters).

Example:

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

The definitions of metrics are as follows (all metrics contain min, max, avg, p95, and p99):

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
          <div data-type="p">Metric</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">Definition</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">Unit and comment</div>
        </td>
      </tr>
      <tr height="34px">
        <td rowspan="1" colSpan="1">
          <div data-type="p">append-logs-bytes</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">The size of log entries to be appended to the Raft log file.</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">In bytes</div>
        </td>
      </tr>
      <tr height="34px">
        <td rowspan="1" colSpan="1">
          <div data-type="p">append-logs-count</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">The number of log entries to be appended to the Raft log file.</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">Count</div>
        </td>
      </tr>
      <tr height="34px">
        <td rowspan="1" colSpan="1">
          <div data-type="p">append-logs</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">The TPS and time consumption for appending log entries to the log file.</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">TPS in batch/s, and time consumption in ms</div>
        </td>
      </tr>
      <tr height="34px">
        <td rowspan="1" colSpan="1">
          <div data-type="p">replicate-entries-bytes</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">The size of log entries to be replicated to follower nodes in each batch.</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">In bytes</div>
        </td>
      </tr>
      <tr height="34px">
        <td rowspan="1" colSpan="1">
          <div data-type="p">replicate-entries-count</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">The number of log entries to be replicated to follower nodes in each batch.</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">Count</div>
        </td>
      </tr>
      <tr height="34px">
        <td rowspan="1" colSpan="1">
          <div data-type="p">replicate-entries</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">The TPS and time consumption for replicating log entries to follower nodes.</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">TPS in batch/s, and time consumption in ms</div>
        </td>
      </tr>
      <tr height="34px">
        <td rowspan="1" colSpan="1">
          <div data-type="p">fsm-apply-tasks</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">The TPS and time consumption for applying tasks the state machine.</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">TPS in batch/s, and time consumption in ms</div>
        </td>
      </tr>
      <tr height="34px">
        <td rowspan="1" colSpan="1">
          <div data-type="p">fsm-apply-tasks-count</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">The number of tasks to be applied to the state machine.</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">Count</div>
        </td>
      </tr>
      <tr height="34px">
        <td rowspan="1" colSpan="1">
          <div data-type="p">fsm-commit</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">The total TPS and time consumption for committing log entries and applying them to the state machine (including the time for internal processing and the time of fsm-apply-tasks).</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">TPS in batch/s, and time consumption in ms</div>
        </td>
      </tr>
      <tr height="34px">
        <td rowspan="1" colSpan="1">
          <div data-type="p">pre-vote</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">The TPS and time consumption for the pre-vote.</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">TPS in times/s, and time consumption in ms</div>
        </td>
      </tr>
      <tr height="34px">
        <td rowspan="1" colSpan="1">
          <div data-type="p">request-vote</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">The TPS and time consumption for leader election.</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">TPS in times/s, and time consumption in ms</div>
        </td>
      </tr>
      <tr height="34px">
        <td rowspan="1" colSpan="1">
          <div data-type="p">handle-append-entries</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">The TPS and time consumption for a follower to handle the log replication request.</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">TPS in batch/s, and time consumption in ms</div>
        </td>
      </tr>
      <tr height="34px">
        <td rowspan="1" colSpan="1">
          <div data-type="p">handle-append-entries-count</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">The number log entries to be replicated by the follower in each batch.</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">Count</div>
        </td>
      </tr>
      <tr height="34px">
        <td rowspan="1" colSpan="1">
          <div data-type="p">install-snapshot</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">The TPS and time consumption for a follower to handle a snapshot installation request.</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">TPS in times/s, and time consumption in ms</div>
        </td>
      </tr>
      <tr height="34px">
        <td rowspan="1" colSpan="1">
          <div data-type="p">truncate-log-prefix and </div>
          <div data-type="p">truncate-log-suffix</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">The TPS and time consumption for the log storage module to delete log entries.</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">TPS in times/s, and time consumption in ms</div>
        </td>
      </tr>
      <tr height="34px">
        <td rowspan="1" colSpan="1">
          <div data-type="p">replicate-inflights-count</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">The number of in-flight requests in the replicator pipeline.</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">Count</div>
        </td>
      </tr>
      <tr height="34px">
        <td rowspan="1" colSpan="1">
          <div data-type="p">read-index</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">The TPS and time consumption for a node to handle a ReadIndex request.</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">TPS in times/s, and time consumption in ms</div>
        </td>
      </tr>
      <tr height="34px">
        <td rowspan="1" colSpan="1">
          <div data-type="p">handle-read-index-entries</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">The number of ReadIndex requests to be handled in each batch.</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">Count</div>
        </td>
      </tr>
      <tr height="34px">
        <td rowspan="1" colSpan="1">
          <div data-type="p">handle-read-index</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">The TPS and time consumption for a node to handle a batch of ReadIndex requests.</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">TPS in batch/s, and time consumption in ms</div>
        </td>
      </tr>
      <tr height="34px">
        <td rowspan="1" colSpan="1">
          <div data-type="p">raft-rpc-client-thread-pool.{metric}</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">The number of RPC client thread pools.</div>
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
          <div data-type="p">The number of internal Closure thread pools.</div>
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
          <div data-type="p">Replicator statistics</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">append-entries-times: The number of log replication requests.</div>
          <div data-type="p">hearbeat-times: The number of heartbeat requests.</div>
          <div data-type="p">install-snapshot-times: The number of snapshot installation requests.</div>
          <div data-type="p">log-lags: The number of log entries that have not been replicated.</div>
          <div data-type="p">next-index: The index of the next log entry to be sent to a node</div>
        </td>
      </tr>
    </tbody>
  </table>
</div>

## 8. Performance optimization suggestions

### 8.1 Performance-related configuration of Raft nodes

NodeOptions provides the `raftOptions` configuration item to allow you to set parameters related to performance and data reliability, including

```java
/** Specifies the maximum size of each file replication RPC (snapshot replication) between the leader and followers. Default value: 128 KB. */
    private int     maxByteCountPerRpc      = 128 * 1024;
    /** Specifies whether to check file holes in replicated files. It is currently not supported. */
    private boolean fileCheckHole           = false;
    /** Specifies the largest number of log entries to be replicated from the leader to followers. Default value: 1024. */
    private int     maxEntriesSize          = 1024;
    /** Specifies the maximum size of the request body of AppendEntries RPCs to be sent from the leader to followers. Default value: 512 KB.*/
    private int     maxBodySize             = 512 * 1024;
    /** Specifies the maximum buffer size of log storage. Default value: 256 KB. */
    private int     maxAppendBufferSize     = 256 * 1024;
    /** Specifies the maximum election delay beyond the specified time. Default value: 1s.*/
    private int     maxElectionDelayMs      = 1000;
    /** 
* Specifies the ratio of the specified election timeout to the heartbeat interval between the leader and followers. 
     * Default value: 10.
    */
    private int     electionHeartbeatFactor = 10;
    /** Specifies the maximum number of requests submitted to the leader to write data to the log storage in each batch. Default value: 32.
    private int     applyBatch              = 32;
    /** Specifies whether to call fsync when writing log entries and meta information. Default value: true.*/
    private boolean sync                    = true;
    /** 
     * Specifies whether to call fsync when writing the snapshot or Raft meta information. Default value: false.
     * When sync is set to true, the sync mode is used.
     */
    private boolean syncMeta                = false;
    /**
     * Specifies the internal disruptor buffer size. Increase this value for applications with high write throughput. Default value: 16384.
     */
    private int     disruptorBufferSize     = 16384;
    /** Specifies whether to enable the replicator pipeline. Default value: true.*/
    private boolean  replicatorPipeline        = true;
    /** Specifies the maximum number of inflight requests in an enabled replicator pipeline. Default value: 256.*/
    private int            maxReplicatorInflightMsgs = 256;
    
    /** Specifies the ReadIndex request option. Default: ReadOnlySafe. For more information, see Section 5 Linearizable read*/
    private ReadOnlyOption readOnlyOptions           = ReadOnlyOption.ReadOnlySafe;
```

For applications with high throughput, you need to appropriately adjust the values of parameters such as the buffer size and batch size. The actual values should be subject to the actual performance of your servers based on tests.

### 8.2 Suggestions for applications

#### 8.2.1 Suggestions for state machine implementation

* We recommend that you first inherit the `StateMachineAdapter` instead of directly implementing the `StateMachine` interface. The adapter provides default implementations for most state machines.
* Before you start your state machine, be sure to clear data on it, because JRaft will load a snapshot on and re-apply Raft log entries to it. Legacy data and non-idempotent operations may lead to data inconsistency.
* Do your best to optimize the `onApply(Iterator)` method, avoid blocking the machine, and accelerate the log entry application performance of the state machine.
* We recommend that you enable the snapshot function to avoid re-applying all log entries every time you restart a node. In addition, log entries cannot be compressed, and they will take considerable storage space in the long run.
* The save and load methods of Snapshot both block the state machine, you should do your best to optimize them and avoid blocking the state machine. It will be the best if you can implement enhanced backup to save your snapshots.
* `onSnapshotSave` needs to call the `closure.run(status)` method after saving a snapshot, to indicate whether the snapshot is successfully saved. You can implement this as follows:

```java
@Override
    public void onSnapshotSave(SnapshotWriter writer, Closure done) {
       // Synchronously get the current snapshot state of the state machine.
       // Asynchronously save the state.
       // Send the result to JRaft regardless of whether the snapshot is successfully saved by calling the done.run(status) method.
    }
```

#### 8.2.2 Suggestions for RPC service

* We recommend that you enable CliService to conveniently query and manage the Raft cluster.
* You can decide on whether to share the RPC server based on your application. If your application uses Bolt RPC, we recommend that you share the RPC server with your application to control the resource usage.
* Use a task data serialization solution with relatively balanced performance and storage space, for example protobuf.
* The application RPC processor should not share the same thread pool with the JRaft RPC processor, which may affect the interaction between Raft nodes.

#### 8.2.3 Suggestions for clients

* Use `RouteTable` to manage the cluster information, and regularly call the `refreshLeader` and `refreshConfiguration` methods to get the latest state of the cluster.
* The service protocol should include the redirect protocol to allow the Raft group to return the latest leader information to the client when the client sends a write request to a non-leader node. Then the client can send the write request to the leader node. In addition to the redirect protocol, the clients can proactively refresh the leader information on a regularly basis. The combined use of the redirect protocol and proactive refresh can improve the clients' availability.
* We recommend that you implement linearizable read to distribute read requests to all nodes to shift burden from the leader.

