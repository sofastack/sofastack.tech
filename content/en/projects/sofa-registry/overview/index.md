---

title: "SOFARegistry overview"
aliases: "/sofa-registry/docs/Home"
---

## Product introduction

SOFARegistry is a production-level, low-latency, and highly available service registry powered by Ant Financial. SOFARegistry was developed on the basis ConfigServer of Taobao. After more than ten years of business development of Ant Financial, SOFARegistry has evolved into the fifth generation architecture. Currently, SOFARegistry not only provides full support to Ant Financial and its numerous partners, but also embraces the open source community. Built on an AP architecture, SOFARegistry support s message push in seconds. It also adopts a layered architecture to support infinite horizontal scaling.

## Features

### High scalability

SOFARegistry adopts a layered architecture and partition-based data storage to break the single machine performance and capacity bottleneck, and to support the theoretical "infinite horizontal scaling". It has been providing reliable services to the Ant Financial production environment which has a massive number of nodes and services.

### Low latency

By virtue of the [SOFABolt](https://github.com/sofastack/sofa-bolt) communication framework, SOFARegistry implements TCP long connection-based heartbeat detection among nodes, and the customized push mode to send service messages between upstream and downstream nodes in seconds.

### Highly available

Unlike CP-architecture based registry products such as ZooKeeper, Consul, and Etcd, SOFARegistry adopts the AP architecture based on the service characteristics of service discovery, which significantly improves the availability of the registry in the case of failures caused by network partitioning. SOFARegistry takes many measures, such as multi-replica clusters, to prevent service unavailability arising from node failures.

## Architecture

SOFARegistry has four roles: Client, SessionServer, DataServer, and MetaServer, each with unique capabilities and responsibilities. They are combined to provide external services. The relationships and structures of them are explained as follows.

![SOFARegistry.svg](https://gw.alipayobjects.com/zos/basement_prod/a9b69b25-836f-4bbe-a32c-ec6148084f93.svg)

### Client

A client provides basic APIs to allow applications to access SOFARegistry. The client provides JAR packages to application systems, so that they can call the service subscription and publishing features of SOFARegistry.

### SessionServer

The SessionServer grants clients access to SessionServer, and accepts service publishing and subscription requests from clients. It also serves as an intermediate layer to forward the published data to DataServer for storage. The SessionServer can be infinitely scaled up to support connection with large amounts of clients. 

### DataServer

The DataServer is responsible for storing data published by clients. The data is stored by dataId through consistent hashing. DataServer supports multi-replica backup to ensure high availability of the data. The Data can also be infinitely scaled up to support large amounts of data.

### MetaServer

The MetaServer is responsible for maintaining the consistency lists of the SessionServer and DataServer within the cluster, and immediately notify other nodes in the case of any node changes. MetaServer ensures high availability and consistency based on [SOFAJRaft](https://github.com/sofastack/sofa-jraft).

