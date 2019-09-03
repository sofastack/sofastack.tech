---

title: "Application scenarios"
---

1. RheaKV: an embedded, distributed, highly available, and strongly consistent KV storage class library that is implemented based on JRaft and RocksDB.
2. AntQ Streams QCoordinator: uses JRaft to implement elections and meta information storage in the Coordinator cluster.
3. Metadata management module of SOFARegistry: an IP address registration. The data held by all nodes must be consistent, and the normal data storage must not be affected when a minority of nodes fail.
4. AntQ NameServer leader election

