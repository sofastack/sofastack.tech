---

title: "Terminology"
aliases: "/sofa-registry/docs/Terminology"
---

## General terminology

| Term | Description |
| --- | --- |
| Service | A software function provided over the network with specific business logic processing capabilities. |
| Service provider | A computer node that provides services over the network. |
| Service consumer | A computer node that receives services through the network. The same computer node can both be the service provider of some services and the service consumer of others. |
| Service discovery | The process in which the service consumer obtains the network address of the service provider. |
| Service registry | A software system that provides service discovery functions to help service consumers obtain network addresses of service providers. |
| Data center | An independent physical area with a fixed physical location, stable power supply, and reliable network. A data center is usually an important factor that you want to consider in high availability design. Generally, deployment in the same data center features higher network quality, lower latency, but limited disaster recovery capability. However, deployment across different data centers features lower network quality, higher latency, but better disaster recovery capability. |

## SOFARegistry terminology

| Terminology | Description |
| --- | --- |
| SOFARegistry | A registry product open sourced by Ant Financial to provide service discovery based on the "publishing-subscription" mode. In addition to service discovery, SOFARegistry is applicable to more general "publishing-subscription" scenarios.
| Data | In the context of service discovery, data specifically refers to the network address and some additional information of the service provider. In other circumstances, it also refers to information published to SOFARegistry. |
| Zone | The key concept of the zone-based architecture. In the context of service discovery, a zone is a collection of publishing and subscription requests. When you publish or subscribe to a service, you need to specify the zone name. For more information, see [Active geo-redundant zone-based architecture solution](https://tech.antfin.com/solutions/multiregionldc). |
| Publisher | A node that publishes data to SOFARegistry. In the context of service discovery, the service provider is the publisher of the "service provider's network address and additional information". |
| Subscriber | A node that subscribes to data from SOFARegistry. In the context of service discovery, the service consumer is the subscriber of the "service provider's network address and additional information". |
| Data ID | A string that is used to identify the data. In the context of service discovery, DataId usually consists of the service port name, protocol, and version number. It is used as an identifier of the service. |
| Group ID | A string that is used for grouping data. It can be used in conjunction with DataId and InstanceId as a namespace identifier of data. Two services may be considered one same service only when their DataIds, GroupIds, and InstanceIds are identical. |
| Instance ID | A string that can be used in conjunction with DataId and GroupId as a namespace identifier of data. Two services may be considered one same service only when their DataIds, GroupIds, and InstanceIds are identical. |
| Session server | A server role of SOFARegistry that establishes TCP long connections with clients for data interaction|
| Data server | A server role of SOFARegistry that is responsible for data storage. |
| Meta server | A server role of SOFARegistry that is responsible consensus coordination of the cluster based on the Raft protocol.  |

