---

title: "'Introduction to the Raft algorithm'"
---

### Novel features:

<div class="bi-table">
  <table>
    <colgroup>
      <col width="nullpx" />
      <col width="nullpx" />
    </colgroup>
    <tbody>
      <tr>
        <td rowspan="1" colSpan="1">
          <div data-type="p">Strong leader</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">Raft uses a stronger form of leadership than other consensus algorithms.</div>
          <div data-type="p">For example, log entries only flow from the leader to other servers. This simplifies the management of replicated logs and makes Raft easier to understand.</div>
        </td>
      </tr>
      <tr>
        <td rowspan="1" colSpan="1">
          <div data-type="p">Leader election</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">Raft uses randomized timers to elect leaders.</div>
          <div data-type="p">This reduces election conflicts simply and rapidly.</div>
        </td>
      </tr>
      <tr>
        <td rowspan="1" colSpan="1">
          <div data-type="p">Membership change</div>
        </td>
        <td rowspan="1" colSpan="1">
          <div data-type="p">Raft uses a new joint consensus approach.</div>
        </td>
      </tr>
    </tbody>
  </table>
</div>

### Replicated state machines

![image.png | left | 321x179](https://gw.alipayobjects.com/mdn/rms_da499f/afts/img/A*OiwGTZnO2uMAAAAAAAAAAABjARQnAQ)

#### 1. Replicated state machines are implemented based on logs.

* Each server stores a log.
* Each log entry contains a command.
* The state machine executes commands in order.

#### 2. Consensus algorithms for practical systems typically have the following properties:

* They ensure safety.
* They are highly available.
* They do not depend on the time sequence to ensure log consistency.
* A command can be completed as soon as a majority of the cluster has responded to a single round of remote procedure calls (RPCs).

### Drawbacks of Paxos

* Paxos is exceptionally difficult to understand.
* Paxos does not provide a good foundation for building practical implementations.

### Raft design principles

* Concept decomposition
   * Leader election
   * Log replication
   * Membership changes
* Raft reduces the number of states to simplify the state space.
   * Raft does not allow log holes and restricts the possibilities of log inconsistency.
   * Raft uses randomized timers to simplify the leader election.

### Raft consistency algorithm

#### __State__

---

__Persistent state on all servers (updated on stable storage before responding to RPCs):__

| currentTerm | The latest term that the server gets (initialized to 0 on initial boot, increasing monotonically) |
| :--- | :--- |
| votedFor | The candidateId that has received votes in the current term (or null if none). |
| Log[] | Log entries. Each entry contains a command for the state machine, and the term when the entry was received by the leader. |

__Volatile state on all servers:__

| commitIndex | The index of the highest log entry known to be committed. |
| :--- | :--- |
| lastApplied | The index of the highest log entry applied to the state machine. |

__Volatile state on leaders:__

| nextIndex[] | The index of the next log entry to be sent to each follower. |
| :--- | :--- |
| matchIndex[] | The index of the highest log entry known to have been replicated on each follower. |

#### AppendEntries RPC (log replication)

Called by the leader to replicate log entries or used as heartbeats.

---

__Arguments:__

| term | leader's term |
| :--- | :--- |
| leaderId | The leader's ID that can be used to redirect clients to the leader. |
| prevLogIndex | The index of the preceding log entry. |
| prevLogTerm | The term of the prevLogIndex entry. |
| entries[] | The log entries to be stored (empty for heartbeat, and the leader may send more than one for efficiency). |
| leaderCommit | The leader's commitIndex (for committed log entries). |

__Results:__

| term | The currentTerm for the leader to update. |
| :--- | :--- |
| success | True if the follower contains log entries matching prevLogIndex and prevLogTerm. |

__Receiver implementation:__

1. Reject the log entry and return false if term < currentTerm.
2. Reject the log entry and return false if the log does not contain an entry at prevLogIndex whose term matches prevLogTerm.
3. If an existing entry conflicts with a new one (same index but different terms), delete the existing entry and all that follow it.
4. Append any new entries that do not exist in the log.
5. If leaderCommit > commitIndex, set commitIndex = min(leaderCommit, index of last new entry).

#### RequestVote RPC (request for votes)

---

__Arguments__

| term | The candidate's term. |
| :--- | :--- |
| candidateId | The candidate initiating a vote request. |
| lastLogIndex | The index of the candidate's last log entry. |
| lastLogTerm | The term of the candidate's last log entry. |

__Results:__

| term | The currentTerm for the candidate to update. |
| :--- | :--- |
| voteGranted | True means the candidate has received votes. |

__Receiver implementation:__

1. Reject the vote and return false if term < currentTerm.
2. If votedFor is null or candidateId, and the candidate's log is at least as up-to-date as the receiver's log, the receiver grants a vote to the candidate, and returns true.

#### __Rules for servers__

* __All Servers:__
   * If commitIndex > lastApplied, increment lastApplied, and apply log[lastApplied] to state machine.
   * If the RPC request or response contains term T > currentTerm, set currentTerm to T and transit into a follower.
* __Follower__
   * Responds to RPCs from candidates and the leader.
   * If the election timeout elapses, and the follower fails to receive any AppendEntries RPCs from the current leader or any RequestVote RPCs from any candidate, the follower transits into a candidate.
* __Candidate__
   * Starts election after transiting into a candidate:
      * Increment currentTerm > Reset the election timer > Vote for itself > Send RequestVote RPCs to all other servers.
   * If the candidate receives votes from a majority of servers, it becomes the leader.
   * If a candidate receives an AppendEntries RPC from the new leader, it transits into a follower.
   * If the election timeout elapses, it starts a new election.
* __Leader__
   * Upon election, the leader sends empty AppendEntries RPCs (heartbeat) to each server, and repeats the step during idle periods to prevent the election from timeing out.
   * If the leader receives a command from a client, it appends an entry to the local log and sends AppendEntries RPCs to all servers. After receiving responses from a majority of the servers, it applies the entry to the state machine and replies responses to the clients.
   * If last log index >= nextIndex for a follower, the leader sends an AppendEntries RPC with log entries starting from the nextIndex. If it is successful, the leader updates the follower's nextIndex and matcheIndex. If AppendEntries fails because of log inconsistency, the leader decrements the nextIndex and resends the AppendEntries RPC to the follower.
   * If there is an N that N > commitIndex, a majority of matchIndex[i] >= N, and log]N[.term == currentTerm, the leader sets commitIndex to N.

#### Summary of the Raft consensus algorithm

| Election safety | At most one leader can be elected in a given term. |
| :--- | :--- |
| Leader append-only | A leader never overwrites or deletes entries in its log. It only appends new entries. |
| Log matching | If two logs contain an entry with the same index and term, then the logs are identical in all entries up through the given index. |
| Leader completeness | If a log entry is committed in a given term, that entry will be presented in the logs of the leaders for all higher-numbered terms. |
| State machine safety | If a server has applied a log entry at a given index to its state machine, no other server will ever apply a different log entry for the same index. |

### RPC communication in Raft

* RequestVote RPC
* AppendEntries RPC
   * Log entries
   * Heartbeat
* InstallSnapshot RPC

### Roles and states transition

![image.png | left | 352x137](https://gw.alipayobjects.com/mdn/rms_da499f/afts/img/A*eTJ3SZlSpsIAAAAAAAAAAABjARQnAQ)

* Follower: All followers are passive. They issue no requests on their own but simply respond to requests from the leader and candidates.
* Leader: The leader handles all client requests. If a client contacts a follower, the follower redirects the client to the leader.
*  Candidate: A candidate can be elected as a new leader.

### Terms (logical clock)

![image.png | left | 327x119](https://gw.alipayobjects.com/mdn/rms_da499f/afts/img/A*iKWRRabaMNEAAAAAAAAAAABjARQnAQ)

Raft divides time into terms of arbitrary length. Each term begins with an election. If a candidate wins the election, it becomes the leader and manages the cluster within the term. In the case of a split vote, the term will end with no leader. Different servers may observe the transitions between terms at different time.

### Leader election

* Follower > candidate (triggered by election timeout)
   * Candidate > leader
      * The candidate wins the election.
   * Candidate > follower
      * Another server wins the election.
   * Candidate > candidate
      * No server wins the election within the specified period.

### Prevention of multiple candidates starting leader election simultaneously

Randomized election timeouts

### Log replication

![image.png | left | 318x233](https://gw.alipayobjects.com/mdn/rms_da499f/afts/img/A*Bn5lR6TAWEwAAAAAAAAAAABjARQnAQ)

Once a leader has been elected, it begins receiving client requests. Each client request contains a command to be executed by the replicated state machines. The leader appends the command to its log as a new entry, and then issues AppendEntries RPCs in parallel to each of the other servers to replicate the entry. When the entry has been safely replicated, the leader applies the entry to its state machine and returns the result of that execution to the client. If followers crash or run slowly, or if network packets are lost, the leader retries AppendEntries RPCs indefinitely (even if it has responded to the client) until all followers eventually store all log entries.

__Features of the Raft log mechanism__

* If two entries in different logs share the same index and term, they store the same command.
   * A leader creates at most one entry with a given log index in a given term, and log entries never change their position in the log.
* If two entries in different logs have the same index and term, then the logs are identical in all preceding entries.
   * This is guaranteed by a simple consistency check performed by AppendEntries RPCs. When sending an AppendEntries RPC, the leader includes the index and term of the entry in its log. If the follower does not find an entry in its log with the same index and term, it refuses the new entries, and the consistency check acts as an induction step.
* The leader handles inconsistencies by forcing the followers' logs to duplicate its own.
   * To bring a follower's log into consistency with its own, the leader must find the latest log entry where the two logs agree, delete any entries in the follower's log after that point, and send the follower all of the leader's entries after that point. All of these actions happen in response to the consistency check performed by AppendEntries RPCs.
   * The leader maintains a nextIndex for each follower, which is the index of the next log entry the leader will send to that follower. When a leader first comes to power, it initializes all nextIndex values to the index just after the last one in its log. If a follower's log is inconsistent with the leader's, the AppendEntries consistency check will fail in the next AppendEntries RPC. After a rejection, the leader decrements nextIndex and retries the AppendEntries RPC. Eventually nextIndex will reach a point where the leader and follower logs match. When this happens, AppendEntries will succeed, which removes any conflicting entries in the follower's log and appends entries from the leader's log (if any). Then the follower's log is consistent with the leader's.

### Safety

* Election restriction
   * Raft uses a restriction on which servers may be elected the leader, which ensures servers with incomplete log entries do not win elections.
      * RequestVote RPC restriction: The RPC includes information about the candidate's log, and the voter denies its vote if its own log is more up-to-date than that of the candidate.
   * A leader never overwrites entries in its log.
   * Log entries only flow from the leader to followers.
* Submit entries from previous terms
   * Log entries maintain the same term number over time and across logs.
* Safety argument
   * Leader completeness
      * If a log entry is committed in a given term, then that entry will be presented in the logs of the leaders for all higher-numbered terms.
   * State machine safety
      * If a server has applied a log entry at a given index to its state machine, no other server will apply a different log entry for the same index.

###  Follower and candidate crashes

* Raft handles these failures by retrying indefinitely.
* Raft RPCs are idempotent.

### Timing and availability

__broadcastTime << electionTimeout << MTBF__

| broadcastTime | The average time it takes a server to send RPCs in parallel to every server in the cluster and receive their responses. |
| :--- | :--- |
| electionTimeout | The period of time that followers would wait for communication from the leader before they start an election. |
| MTBF | The average time between failures for a single server. |

* The broadcast time should be smaller than the election timeout period by a magnitude so that leaders can reliably send the heartbeat messages to keep followers from starting elections. Given the randomized approach used for election timeouts, this inequality also makes split votes unlikely. 
* The election timeout should be smaller than MTBF by a magnitude so that the system can run steadily. When the leader crashes, the system will be unavailable for roughly the election timeout period.

### Cluster membership changes

In the example shown in the following figure, the cluster grows from three servers to five. Directly doing so may cause the cluster to split into two independent majorities: an old group that consists of Server 1 and 2, and a new group that consists of Server 3, 4, and 5. They may cause conflicts in decisions.

![image.png | left | 392x232](https://gw.alipayobjects.com/mdn/rms_da499f/afts/img/A*YFTGRbfg8XIAAAAAAAAAAABjARQnAQ)

__A two-phase approach__

![image.png | left | 354x165](https://gw.alipayobjects.com/mdn/rms_da499f/afts/img/A*wcVDTo4CfrwAAAAAAAAAAABjARQnAQ)

Raft uses a joint consensus approach to make node changes safe. The cluster first switches to a transitional configuration which combines both the old and new configurations and is called joint consensus. The current leader stores the configuration for joint consensus (Cold and Cnew in the figure) as a log entry and replicates it to other nodes. Once this log entry has been committed, the system then transitions to the new configuration. The specific steps are as follows:

1. The current leader first replicates data to new nodes so that they can catch up.
2. After all new nodes have caught up with the rest of the cluster, the leader replicates the Cold,new log entry to both the old and new nodes.
3. When the majorities of the old and new nodes respond to Cold,new, the cluster switches to the Cold,new configuration. Then the leader replicates the log entry for the Cnew configuration to new nodes.
4. When the majority of the new nodes respond to Cnew, the cluster switches to the new configuration.

### Log compaction

![image.png | left | 396x242](https://gw.alipayobjects.com/mdn/rms_da499f/afts/img/A*77gySo2CTewAAAAAAAAAAABjARQnAQ)

* Each server takes snapshots independently, covering only committed entries in its log.
* A snapshot mainly covers:
   * The state machine state.
   * A small amount of metadata of the Raft group (as shown in the above figure). Such metadata is preserved to support the AppendEntries consistency check for the first log entry following the snapshot.
   * To enable cluster membership changes, the snapshot also includes the latest configuration in the log as of the last included index.

__InstallSnapshot RPC__

* Although servers normally take snapshots independently, the leader must occasionally send snapshots to followers that lag behind. This happens when the leader has already discarded the next log entry that it needs to send to a follower.

| term | The leader's term. |
| :--- | :--- |
| leaderId | The leader's ID that can be used to redirect clients to the leader. |
| lastIncludedIndex | Index of the last log entry in the snapshot. |
| lastIncludedTerm | The term of lastIncludedIndex. |
| offset | The byte offset where the chunk is positioned in the snapshot file. |
| data[] | The raw bytes of the snapshot chunk, starting from the offset. |
| done | True if this is the last chunk. |

__Receiver implementation:__

* Reply immediately if term < currentTerm.
* Create a new snapshot file if it is the first chunk (offset is 0).
* Write data into the snapshot file at a given offset.
* Reply and wait for more data chunks if done is false.
* Save the snapshot file, discard any existing or partial snapshot with a smaller index.
* If existing log entry has the same index and term as snapshot's last included entry, retain log entries following it and reply.
*  Discard the entire log.
* Reset the state machine using snapshot contents (and load snapshot's cluster configuration).

### Client interaction

* Clients of Raft send all of their requests to the leader.
* Linearizable reads
   * Write the Raft log and use the state machine.
   * The leader sends heartbeats to all nodes and receives responses from more than half of them to ensure it is still the leader. Then it can provide linearizable read.
   * The leader could also rely on the heartbeat mechanism to provide a form of lease (lease read), but this would rely on the accuracy of the local clock.

### References

[Braft document](https://github.com/brpc/braft/blob/master/docs/cn/raft_protocol.md)

[The Raft paper](https://ramcloud.atlassian.net/wiki/download/attachments/6586375/raft.pdf)

