---

title: "Roadmap"
---

## Development plans of SOFAJRaft from April to July 2019

1. **(p1)** Implement the Telnet service (or similar equivalents, the simpler the better) as an online troubleshooting means. It should be able to provide the following functions:
   - Raft_stat: List most or all stats of a Raft node.
   - Metrics: Uniformly display the latest values of all metrics for the current node (the related data is scattered in the log).
2. **(p1)** Extension points: introduce the SPI mechanism. Some of the extension points are listed as follows:
   - LogStorage
   - LogEntry codec
   - RaftMetaStorage
   - Metrics
3. **(p1)** Provide a manual rebalance API for the multi-raft-group scenario to balance the number of leaders on each node.
4. **(p2)** Translate the document into multiple languages.
5. **(p2)** Add a learner role that only replicates data and does not vote.
6. **(p3)** Complete jepsen tests for RheaKV.

