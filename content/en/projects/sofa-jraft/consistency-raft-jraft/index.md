---

title: "Distributed consensus - Raft and JRaft"
---

# Distributed consensus algorithm

## Understand distributed consensus

* **Multiple participants** reach a **complete consensus** on **one thing**: one conclusion for one thing.
* The conclusion cannot be overthrown.

## Typical distributed consensus algorithms

* Paxos: It is considered as the foundation of distributed consensus algorithms. Other algorithms are its variants. However, the Paxos paper only provides the process of a single proposal, without describing the details of multi-paxos that is required for state machine replication. Paxos implementation involves high engineering complexity, for example, multiple-point writes and log hole tolerance.
* Zab: It is applied in ZooKeeper and widely used in the industry. However, it is not available as a universal library.
* Raft: It is known for being easy to understand. There are many renowned Raft implementations in the industry, such as etcd, Braft, and TiKV.

# Introduction to Raft

[Raft](https://raft.github.io/) is in nature a Paxos-based distributed consensus algorithm that is much easier to understand than Paxos. Unlike Paxos, Raft divides the protocols into independent modules, and uses a streamlined design, making the Raft protocol easier to implement.

Specifically, Raft divides consensus protocols into almost completely decoupled modules, such as leader election, membership change, log replication, and snapshot.

Raft adopts a more streamlined design by preventing reordering commits, simplifying roles (it has only three roles: leader, follower, and candidate), allowing only the leader to write, and using randomized timeout values to design leader election.

## Feature: strong leader

1. The system can have only one leader at the same time, and only the leader can accept requests sent by clients.
2. The leader is responsible for communication with all followers, sending proposals to all followers, and receiving responses from the majority of followers.
3. The leader also needs to send heartbeats to all followers to maintain its leadership.

To summarize, a strong leader tells its followers: **"Do not say anything. Do what I said and let me know when you finish!"**
In addition, a leader must always remain active by sending heartbeats to followers. Otherwise, a follower will take its place.

![strong-leader.png | left | 350x250](https://gw.alipayobjects.com/mdn/rms_da499f/afts/img/A*5Cw5Qp1oyYQAAAAAAAAAAABjARQnAQ)

##  Replicated state machine

Assume we have an infinitely incrementing sequence (system) a[1, 2, 3…]. If for any integer i, the value of a[i] meets the distributed consensus requirement, the system meets the requirement of a consensus state machine.
Basically, all real life systems are subject to continuous operations, and reaching consensus on a single value is definitely not enough. To make sure all replicas of a real life system are consistent, we usually convert the operations into entries of a [write-ahead-log](https://en.wikipedia.org/wiki/Write-ahead_logging)(WAL). Then, we make sure all replicas of the system reach a consensus on the WAL entries, so that each replica performs operations of the WAL entries in order. As a result, the replicas are in consistent states.

![st.png | left | 450x250](https://gw.alipayobjects.com/mdn/rms_da499f/afts/img/A*OiwGTZnO2uMAAAAAAAAAAABjARQnAQ)

1. A client sent a write (operation) request to the leader.
2. The leader converts the "operation" request into a WAL entry, and appends the entry to local log. When doing so, the leader replicates the log entry to all followers.
3. After receiving responses from the majority of followers, the leader applies the corresponding "operation" of the log entry to the state machine.
4. The leader then returns the result to client.

## Basic concepts of Raft

### Three roles/states of a Raft node

![raft-node | left | 400x250](https://gw.alipayobjects.com/mdn/rms_da499f/afts/img/A*EK6gQYwiBXkAAAAAAAAAAABjARQnAQ)

1. A follower is completely passive and cannot issue any requests. It simply responds to remote procedure calls (RPCs) from the leader and the candidate. When servers start up, they begin as followers.
2. A leader handles all client requests and replicates log entries to all followers.
3. A candidate can be elected as a new leader. A follower becomes a candidate when the election times out.

### Three types of RPCs

1. RequestVote RPC: A candidate issues RequestVote RPCs to other nodes to request for votes.
2. AppendEntries (heartbeat) RPC: A leader issues AppendEntries RPCs to replicate log entries to followers or send heartbeats (AppendEntries RPCs that carry no log entries).
3. InstallSnapshot RPC: A leader issues InstallSnapshot RPCs to send chunks of a snapshot to followers. Although in most cases each server creates snapshots independently, the leader must send snapshots to some followers that are too far behind. This usually happens when the leader has discarded the next log entry to be sent to a follower (removed during log compaction).

### Terms (logical clock)

1. Raft divides time into terms of arbitrary length. Terms are numbered with monotonically incrementing integers (term IDs).
2. Each term starts with a new leader election. If a candidate wins an election, it serves as the leader and manages the entire cluster within the term. Therefore, a term comprises **leader election + normal operations.**
3. There is at most one leader in a given term. In some situations, an election will result in a split vote, which will end with no leader.

![term.png | left | 500x200](https://gw.alipayobjects.com/mdn/rms_da499f/afts/img/A*CTpYRa_CB_4AAAAAAAAAAABjARQnAQ)

## Raft function breakdown

### Leader election

* Timeout-driven: Heartbeat/election timeout
* Randomized election timeout: This reduces the chances of split votes in the case of election conflicts.
* Election process:
   * Follower &gt; Candidate (triggered by election timeout)
      * The candidate wins the election: Candidate &gt; Leader
      * Another node wins the election: Candidate &gt; Follower
      * Election ends with no winner: Candidate &gt; Candidate
* Election actions:
   * A follower increments its current term and transitions to candidate state.
   * The candidate votes for itself and issues RequestVote RPCs in parallel to each of other nodes.
* New leader election principles (maximum commit principle)
   * Candidates include log information in RequestVote RPCs(index & term of last log entry).
   * During elections, choose a candidate with logs which are most likely to contain all committed entries.
   * Voting server V denies a vote if its log is “more complete”:
(lastTermV &gt; lastTermC) ||
((lastTermV == lastTermC) &amp;&amp; (lastIndexV &gt; lastIndexC))
   * The leader will have the “most complete” log among the electing majority.
* Election safety: At most one leader can be elected in a given term. A term can end up with no leaders. Candidates can start a new election in the next term.

![safe-term | left | 450x80](https://gw.alipayobjects.com/mdn/rms_da499f/afts/img/A*vC1PR4snguoAAAAAAAAAAABjARQnAQ)

* Time parameters that affect the rate of success of Raft leader election:
   * Round trip time (RTT): network latency.
   * Heartbeat timeout: heartbeat interval. Generally, the heartbeat interval should be in a smaller magnitude than the election timeout period, so that the leader can constantly send heartbeats to prevent followers from transitioning to candidates and initiating elections.
   * Election timeout: The period of time that followers would wait for communication from the leader before they start an election.
   * Meantime between failures (MTBF): The mean time between failures of a system during normal system operation.
`RTT << Heartbeat timeout < Election timeout (ET) << MTBF`
* Randomized election timeouts: `Random (ET, 2 ET)`

### Log replication

![log-replication | left | 450x200](https://gw.alipayobjects.com/mdn/rms_da499f/afts/img/A*dY0aTYArhPIAAAAAAAAAAABjARQnAQ)

* Raft log format
   * `(TermId, LogIndex, and LogValue)`
   * `TermId and LogIndex` determine a unique log entry.
* Log replication key points
   * Continuity: Log holes are not allowed.
   * Validity:
      * If two logs of different nodes contain an entry with the same logindex and term, the logs are identical in log values.
      * Log entries on the leader are always valid.
      * The validity of a follower's log is determined based on the result of comparison with the log on the leader.
* Validity check of followers' logs.
   * An AppendEntries RPC carries a unique identifier of the previous log entry `(prevTermId, prevLogIndex).`
   * Recursive derivation
* Recovery of followers' logs
   * The leader progressively decreases the nextIndex and re-issues AppendEntries RPCs until followers' logs are consistent with the leader's log.

![log-replication-2.png | left | 400x150](https://gw.alipayobjects.com/mdn/rms_da499f/afts/img/A*8xqPR7ZR7EsAAAAAAAAAAABjARQnAQ)

### Working mechanism of commitIndex

* CommitIndex `(TermId, LogIndex)`:
   * Simply put, commitIndex is the position of a log entry in the log which the leader has replicated to a majority of servers and decides to apply to the state machine.
   * When a log entry is replicated to followers, it is persisted, but cannot be immediately applied to the state machine.
   * Only the leader knows whether this log entry has been stored on a majority of servers and is ready to be applied to the state machine.
   * Followers record the current commitIndex sent by the leader, and all log entries whose indexes are smaller than or equal to the commitIndex can be applied to the state machine.
* How commitIndex works?
   * The leader carries the current commitIndex in the next AppendEntries RPC (including heartbeats).
   * Followers check the validity of the log entry. If the log entry is valid, they accept the AppendEntries RPC and simultaneously update their local commitIndexes. Then they apply log entries whose indexes are smaller than or equal to the commitIndex to the state machine. 

### AppendEntries RPC

* A complete RPC contains the following information: currentTerm, logEntries[], prevTerm, prevLogIndex, commitTerm, and commitLogIndex.
* currentTerm and logEntries[]: log information. For the sake of efficiency, multiple log-entries are processed at a time.
* prevTerm and prevLogIndex: used for log validity check.
* commitTerm and commitLogIndex: position of the latest committed log entry (commitIndex).

### Summary: What can we do with Raft now?

* Continuously determine multiple proposals to ensure that the states of all system nodes in the cluster are completely consistent.
* Automatically elect the leader, and ensure the availability of the system when only a minority of nodes are down.
* Logs of all servers are highly synchronized, which ensures zero data loss after any server in the cluster is down.

# Introduction to JRaft

JRaft a production-level high-performance Java implementation based on the [RAFT](https://raft.github.io/) the consensus algorithm. It supports MULTI-RAFT-GROUP and is suitable for high-load and low-latency scenarios. JRaft allows you to focus on your own business area, and leave all RAFT-related technical problems to JRaft. JRaft is easy to use, and you can master it in a very short period by reading a few examples.

JRaft was transplanted from Baidu's [Braft](https://github.com/brpc/braft), upon which we have made some optimization and improvement. Many thanks to the Baidu Braft team for opening source such an excellent C++ RAFT implementation.

## Overall features and performance optimization of JRaft

![feature | left | 500x450](https://gw.alipayobjects.com/mdn/rms_da499f/afts/img/A*68HaTJZQxVUAAAAAAAAAAABjARQnAQ)

### Supported features

* Leader election: We have already introduced the leader election mechanism of Raft earlier in this topic.
* Log replication and recovery:
   * Log replication ensures that committed data is not lost and is successfully replicated to a majority of servers.
   * Log recovery involves two types:
      * Current term log recovery
         * It mainly deals with log recovery of some follower nodes that join the cluster after a restart or new follower nodes that have recently joined the cluster.
      * Prev term log recovery
         * It mainly deals with the log consistency problem caused by leader change.
* Snapshot and log compaction: JRaft regularly generates snapshots to implement log compaction, which speeds up the startup of servers and their log recovery. It issues InstallSnapshot RPCs to send chunks of a snapshot to followers, as shown in the following figure.

![snapshot.png | left | 250x200](https://gw.alipayobjects.com/mdn/rms_da499f/afts/img/A*a3xDT5mfSP4AAAAAAAAAAABjARQnAQ)

* Membership change: used for online cluster configuration changes, such adding, deleting, and replacing nodes.

* Transfer leader: a proactive leader change when you restart a node for maintenance or leader load balancing.

* Partition tolerance of Symmetric network:

   ![symmetric-net-partition-tolerance | left | 200x150](https://gw.alipayobjects.com/mdn/rms_da499f/afts/img/A*N_rBQ6oKsv4AAAAAAAAAAABjARQnAQ)

   As shown in the above figure, S1 is the current leader. Due to a communication failure caused by network partitioning, follower S2 did not receive heartbeats from the current leader. It transitions to a candidate and constantly increments its term in attempts to start a new election in the cluster. Once the communication is recovered with network recovery, S2 will start a new election in the cluster, force the current leader to step down, and cause service interruption. To avoid this problem, JRaft introduces a pre-vote mechanism.
   - In JRaft, a follower must issue pre-vote RPCs (currentTerm + 1, lastLogIndex, lastLogTerm) and obtain votes from a majority of nodes before it can turn into a candidate and issue real RequestVote RPCs. Due to a network failure, a partitioned follower node cannot issue pre-vote RPCs to other nodes, and cannot win the pre-vote. Therefore, it will not be able to transition to a candidate to start a new election. This reduces the chance of service interruptions caused by unnecessary leader election.

* Asymmetric network partition tolerance:

   ![asymmetric-net-partition-tolerance | left | 200x150](https://gw.alipayobjects.com/mdn/rms_da499f/afts/img/A*sHgoQa2jywwAAAAAAAAAAABjARQnAQ)

   As shown in the above figure, S1 is the current leader. The communication between S1 and S2 fails due to network partitioning, but S2 is still able to communicate with follower S3. Therefore, S2's pre-vote RPC is responded by S3, and wins the majority vote to transition to a candidate. S2 constantly triggers timeout elections and increments its term, while sending RequestVote RPCs to S3. As a result, S3 increments its term to keep consistent with the term of S2, which is higher than the leader's term. This causes S3 to reject log replication from the leader.
   - Every follower in JRaft maintains a local timestamp to record the time of AppendEntries RPCs (including heartbeats) from the leader. A follower can only accept pre-vote RPCs after the election timeout.

* Fault tolerance: Failures on a minority of servers do not impact the service availability of the overall system. Such server failures include but are not limited to:
   * Server power outage
   * App force-stop
   * Slow responses on servers (due to garbage collection or out-of-memory errors)
   * Network failures
   * Other problems that prevent a Raft node from working normally

* Workaround when quorate peers are dead: When the majority of servers fail, the entire cluster is no longer available. The safe way is to wait for most servers to recover, so that data security can be guaranteed. However, if you prefer maximum system availability and accepts certain degrees of data inconsistency, you can use the reset_peers command of JRaft to quickly reset the entire cluster and resume cluster availability.

* Metrics: JRaft offers a variety of built-in statistical performance metrics based on the [metrics](https://metrics.dropwizard.io/4.0.0/getting-started.html) class library. These metrics can help you quickly and easily find out your system performance bottlenecks.

* Jepsen: In addition to hundreds of unit tests and some chaos tests, JRaft also uses a distributed verification and fault injection testing framework [Jepsen](https://github.com/jepsen-io/jepsen) to simulate many situations, and has passed all these tests:
   * Randomized partitioning with two partitions: a big one and a small one
   * Randomly adding and removing nodes
   * Randomly stopping and starting nodes
   * Randomly kill -9 and starting nodes
   * Randomly dividing a cluster into two groups, with one node connection the two to simulate network partitioning
   * Randomly dividing a cluster into different majority groups

### Performance optimization

In addition to functional integrity, JRaft has done a lot of performance optimization. Here is some [benchmark](https://github.com/alipay/sofa-jraft/wiki/Benchmark-%E6%95%B0%E6%8D%AE) data of a KV scene (get/put). With small data packets and a read/write ratio of 9:1, when linearizable reads are guaranteed, a three-replica cluster can achieve up to 400,000+ ops.

The following describes themajor optimizations:

* Batch: We know that the secrets to the success of the Internet are "cache" and "batch". JRaft has done a lot of work on batch operations, and almost the entire workflow is implemented with batch operations. JRaft significantly improves the overall performance through batch consumption of the disruptor's MPSC module, including but not limited to:
   * Batch task submitting
   * Batch network sending
   * Local I/O batch writes
      * To ensure zero log loss, every log entry is subject to fsync flush, which is time consuming. In JRaft, log entries are written in batches.
   * Batch applying log entries to state machine
Although a lot of batch operations are used in JRaft, these operations do not delay any single request for batching.
* Replication pipeline: Generally, log synchronization between the leader and the follower nodes is implemented through a serial batch operation. After a batch is sent, the leader needs to wait for the batch to be synchronized before it can send another batch (ping-pong ), causing a rather long delay. In JRaft, log entries are replicated through the pipeline between the leader and follower nodes, which significantly reduces the data synchronization delay and improves the throughput. Based on our test result, scenarios with pipeline replication enabled can have 30% higher throughput. For more information, see [benchmark](https://github.com/alipay/sofa-jraft/wiki/Benchmark-%E6%95%B0%E6%8D%AE).
* Append log in parallel: In JRaft, the leader replicates log entries to followers in parallel with writing log entries to the local log.
* Fully concurrent replication: The leader sends log entries to all followers independently and concurrently.
* Asynchronous: The entire workflow of JRaft is free of congestions and is completely asynchronous. It is a typical callback programming model.
* ReadIndex: Raft handles read requests by converting the requests into log entries, and follows the log handling process as described above, which increases the costs and reduces the performance. To solve this problem, in JRaft, the leader records only the commitIndex for each read request, and then sends heartbeats to all peers (followers) to indicate the leader's identity. After the leader's identity is verified, if appliedIndex >= commitIndex, the leader can return the read result to the client. ReadIndex also allows followers to easily implement linearizable reads, but the commitIndex must be obtained from the leader, which requires one more round of RPCs. Linearizable reads will be discussed later in this document.
* Lease read: JRaft also supports maintenance of leader authority through a lease, during which the leader does not have to send heartbeats consecutively to the followers. This reduces the communication overhead and improves the performance. However, due to the timer drift problem, using a timer to maintain a lease is not always safe. Therefore, ReadIndex is used by JRaft by default, because it is safe and its performance is good enough in most cases.

## JRaft architecture

![jraft-design | left | 700x550](https://gw.alipayobjects.com/mdn/rms_da499f/afts/img/A*b3tDQoaFCNkAAAAAAAAAAABjARQnAQ)

* Node: A node in a Raft cluster connects to and encapsulates all underlayer service modules, and main service interfaces that are visible to users. Specifically, the leader node of a raft group calls `apply(task)` to commit new tasks to the state machine replication cluster made up by the Raft group, which will then apply the task to the business state machine.
* Storage: Modules at the lower part of the preceding figure are storage-related modules.
   * Log storage stores log entries converted from requests that are submitted by Raft users, and replicates log entries from the leader's log to followers' logs.
      * LogStorage implements the storage feature and is based on RocksDB by default. You can easily scale up your log storage.
      * LogManager is responsible for calling the underlayer storage, caching and batch submitting storage calls, and conducting necessary checks and optimization.
   * MetaStorage stores the metadata and records the internal states of the Raft implementation, for example, the current term of the node and the node to vote for.
   * Snapshot storage (optional) is used to store users' state-machine snapshots and meta information.
      * SnapshotStorage stores snapshots.
      * SnapshotExecutor manages the actual storage, remote installation, and replication of snapshots.
* State machine
   * StateMachine is the implementation of users' core logic. It calls the `onApply(Iterator)` method to apply log entries that are submitted with `Node#apply(task)` to the business state machine.
   * FSMCaller encapsulates state transition calls that are sent to the User StateMachine, writes log entries, implements a finite-state machine (FSM), conducts necessary checks, and merges requests for batch submission and concurrent processing.
* Replication
   * Replicator is used by the leader to replicate log entries to followers. It does the same thing as an AppendEntries RPC of Raft. Without log entries, it is sent by the leader as heartbeats.
   * ReplicatorGroup is used by a Raft group to manage all replicators, and to perform necessary permission checks and dispatches.
* RPC: The remote procedure call (RPC) module is used for network communication between nodes.
   * RPC Server: The RPC server is built in a node to receive requests from other nodes or clients, and to redirect such requests to the corresponding service modules.
   * RPC Client: The RPC Client is used to issue requests to other nodes, such as requests for votes, log replication requests, and heartbeats.
* KV Store: The KV Store is a typical application scenario of various Raft implementations. JRaft contains an embedded distributed KV storage service (JRaft-RheaKV).

### JRaft Group

A single JRaft node is meaningless. See the architecture diagram of a three-replica JRaft cluster as follows.

![jraft-group | left | 700x550](https://gw.alipayobjects.com/mdn/rms_da499f/afts/img/A*1wYDQJvcbSEAAAAAAAAAAABjARQnAQ)

### JRaft Multi Group

A single raft group cannot solve the read/write bottleneck of large traffic. Therefore, JRaft supports multi-raft-group.

![jraft-multi-group | left | 700x550](https://gw.alipayobjects.com/mdn/rms_da499f/afts/img/A*DFDHRbIAh0sAAAAAAAAAAABjARQnAQ)

## JRaft implementation details analysis - highly efficient linearizable reads

Introduction to linearizable reads Here is a simple example. Assume that we write a value at the moment t1. We can certainly read this value after t1, but we cannot read values that are written earlier than t1. Think about the Java volatile keyword. Simply put, linearizable reads are an implementation of the Java volatile semantics on a distributed system.

![read-only-safe | left | 700x250](https://gw.alipayobjects.com/mdn/rms_da499f/afts/img/A*hVE6RZ9SElEAAAAAAAAAAABjARQnAQ)

As shown in the above figure, clients A, B, C, and D all satisfy the requirement of linearizable reads. Client D may seem to be a stale read, but it is not. The request of client D crosses three stages, but the read can occur at any time, so it can either read one or two.

**Important: The following discussion is based on a precondition that the implementation of the business state machine meets the requirement of linearizable reads, or the Java volatile semantics.**

* To implement linearizable reads, we may want to be straight forward and directly read from the current leader node.
   * It does not work, because you do not know whether this "leader" is still the leader. For example, in the case of network partitioning, it may have lost its leadership position without noticing it.

* The simplest implementation is to undergo the Raft protocol (Raft log process) like "writing" requests.

   ![raft-log | left | 400x160](https://gw.alipayobjects.com/mdn/rms_da499f/afts/img/A*ofC8QJB_2McAAAAAAAAAAABjARQnAQ)
   * It surely works, if you accept undermined performance. The Raft log process involves log I/O overhead, network overhead of log replication, and disk usage overhead of Raft "log reads", which are usually unacceptable in read-intensive systems.

* ReadIndex Read
   * This is an optimization that is mentioned in the Raft paper. Specifically,
      * (1) The leader records the current commitIndex of its log in a local variable ReadIndex.
      * (2) The leader sends a round of heartbeats to followers. If more than a half of the nodes respond to the heartbeats, the leader is sure that it is still the leader.
      * (3) The leader keeps waiting until the applyIndex is greater than the ReadIndex, when it can safely provide linearizable reads without worrying about its leadership position. (Think why the leader has to wait for its applyIndex to become greater than the ReadIndex.)
      * (4) The leader executes the read request, and returns the result to the client.
   * ReadIndex also allows followers to easily implement linearizable reads:
      * A follower requests for the latest ReadIndex from the leader.
      * The leader executes the first three steps to make sure it is still the leader and returns the ReadIndex to the follower.
      * The follower waits until its applyIndex is greater than the ReadIndex.
      * The follower executes the read request, and returns the result to the client.
You can configure whether clients can read from the followers in JRaft. This option is disabled by default.
   * Summary of ReadIndex
      * Compared with the Raft log method, ReadIndex saves disk overhead and can greatly improve the throughput. When you use ReadIndex in combination with JRaft's batch + pipeline ack + full asynchronous mechanisms, in the case of a three-replica cluster, the read throughput of the leader is approximate to the maximum RPC throughput.
      * The latency is determined by the slowest heartbeat response of the majority of nodes. Therefore, technically, this method does not significantly reduce the latency.

* Lease read
   * Lease read is similar to ReadIndex, but it does more. It not only makes logs unnecessary, but also the network communication. It significantly reduces the latency and in the meantime improves the throughput.
   * The basic idea is that the leader takes a lease period that is smaller than election timeout (preferably one order of magnitude smaller). There will be no election during the lease period, which means the leadership does not change in this period. Therefore, the second step of ReadIndex can be skipped to reduce the delay. You can see that the accuracy of lease read is connected with the time. Therefore, the time is vitally important to this mechanism. In the case of a serious timer drift, the mechanism may cause problems.
   * Implementation method:
      * The leader sends timed heartbeats and receives responses from a majority of the nodes to ensure the validity of its leadership. In JRaft, the default interval of heartbeats is one tenth of the election timeout.
      * During a validity lease period, the current leader is the one and only legitimate leader within the Raft group, and the second step of the ReadIndex mechanism, that is, heartbeat-based identity verification, can be ignored.
      * The leader keeps waiting until the applyIndex is greater than the ReadIndex before it safely provides linearizable reads.

* One step further: wait free
   * So far, lease read has skipped the second step of ReadIndex. Actually, it can do more by skipping the third step.
   * Think about the nature of the preceding implementation:
      * First, we define two states: log state (log_state) and state machine state (st_state). log_state of the leader reflects the latest data state of the current Raft group, because all write requests must first be written to the leader's Raft log.
      * When the leader receives a read request, it takes the log_state as a reference logical time point. When st_state catches up with the log_state, we can be sure that all existing data available at the time of the log state has been completely applied to the state machine. Therefore, the linearizability is guaranteed as long as your business state machine remains visible.
      * **Therefore, the nature of the preceding implementation is to wait for the st_state to catch up with or surpass the state when the leader receives the read request (applyIndex >= commitIndex).**
   * Based on above analysis, we can see that the condition applyIndex >= commitIndex is actually very conservative. **Technically, we only need to ensure that the st_state is the latest at the current time point.**
   * The problem is whether we can ensure that the st_state of the leader node is always the latest.
      * First of all, the log of the leader state is surely the latest. Even a new leader is elected, the log of the new leader must still contain all committed log entries. However, the state machine of the new leader may lag behind that of the former leader.
      * However, when the leader applies the first log entry to its state machine within its current term, its state machine becomes the latest.
      * Therefore, we can conclude that, when a leader successfully applies the first log entry to its state machine within its current term, it can immediately execute the read request, which is surely linearizable, without obtaining the commitIndex or waiting for the state machine.
   * Summary: The wait-free mechanism will minimize the read delay. Although this mechanism has not been implemented in JRaft, it is in our plan.

Example code for initiating a linearizable read request in JRaft:

```text
// Implement linearizable read of KV data.
public void readFromQuorum(String key, AsyncContext asyncContext) {
    // Pass the request ID as the context of the request.
    byte[] reqContext = new byte[4];
    Bits.putInt(reqContext, 0, requestId.incrementAndGet());
    // Call the ReadIndex method, and wait for the callback.
    this.node.readIndex(reqContext, new ReadIndexClosure() {

        @Override
        public void run(Status status, long index, byte[] reqCtx) {
            if (status.isOk()) {
                try {
                    // The ReadIndexClosure callback is successful. The latest data can be read from the state machine and returned to the client.
                    // If your state implementation is subject to version control, you can read the data based on the log index ID.
                    asyncContext.sendResponse(new ValueCommand(fsm.getValue(key)));
                } catch (KeyNotFoundException e) {
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

# Application scenarios

1. Leader election
2. Distributed lock services such as ZooKeeper have provided complete distributed lock implementation in the RheaKV module of JRaft
3. Highly reliable meta information management based on JRaft-RheaKV
4. Distributed storage system, such as distributed message queue, distributed file system, and distributed block system

## Use cases

1. RheaKV: an embedded, distributed, highly available, and strongly consistent KV storage class library implemented based on JRaft.
2. AntQ Streams QCoordinator: a coordinator using JRaft to implement elections in the Coordinator cluster and using JRaft-RheaKV for meta information storage.
3. Schema Registry: a very reliable schema management service (similar to Kafka Schema Registry) with its storage module implemented based on JRaft-RheaKV.
4. Metadata management module of SOFARegistry: a IP address registration system. The data held by all nodes must be consistent, and the normal data storage must not be affected when a minority of nodes fail.

## Practices

### 1. Design a simple KV Store based on JRaft

![kv | left | 700x550](https://gw.alipayobjects.com/mdn/rms_da499f/afts/img/A*D1N5TZSqQlgAAAAAAAAAAABjARQnAQ)

### 2. JRaft-based architecture of RheaKV

![rheakv | left | 700x550](https://gw.alipayobjects.com/mdn/rms_da499f/afts/img/A*6K1mTq0z-TkAAAAAAAAAAABjARQnAQ)

#### Terms and definitions

**PD**: The global central master node that is responsible for scheduling the entire cluster. You do not need to enable PD for clusters that do not require automatic management. A PD can manage multiple clusters, with each of them isolated by clusterid.

**Store**: A physical storage node within a cluster. A store may contain one or more regions.

**Region**: The minimal KV data unit. Each region has a left closed and right open interval [startKey, endKey), which supports automatic split and automatic backup migration by metrics such as request traffic, load, and data volume.

#### Characteristics

* Embedded
* Strong consistency
* Self-driven
   * Automatic diagnosis, optimization, and decision making

The above characteristics, especially the second and the third, are basically implemented based on JRaft's own features. For more information, see JRaft documentation.

# [JRaft documentation](https://github.com/alipay/sofa-jraft/wiki)

# Acknowledgement

Many thanks to outstanding Raft implementations, including [Braft](https://github.com/brpc/braft), [Etcd](https://github.com/etcd-io/etcd), and [TiKV](https://github.com/tikv/tikv), which have benefited JRaft a lot.

# Recruitment

Ant Financial Middleware has been looking for talents who have a passion for basic middleware (such as message service, data middleware, and distributed computing) and the next generation high-performance time-series database for real-time analysis. If you are interested, feel free to contact boyan@antfin.com.

# References

* [JRaft source code](https://github.com/alipay/sofa-jraft)
* [https://raft.github.io/](https://raft.github.io/)
* [https://raft.github.io/slides/raftuserstudy2013.pdf](https://raft.github.io/slides/raftuserstudy2013.pdf)
* [Paxos/Raft: Theoretical analysis and practical use of distributed consensus algorithms](https://github.com/hedengcheng/tech/tree/master/distributed)
* [Braft documentation](https://github.com/brpc/braft/blob/master/docs/cn/raft_protocol.md)
* [https://pingcap.com/blog-cn/linearizability-and-raft/](https://pingcap.com/blog-cn/linearizability-and-raft/)
* [https://aphyr.com/posts/313-strong-consistency-models](https://aphyr.com/posts/313-strong-consistency-models)
* [https://zhuanlan.zhihu.com/p/51063866](https://zhuanlan.zhihu.com/p/51063866)

