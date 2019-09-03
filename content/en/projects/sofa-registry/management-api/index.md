---

title: "Management commands"
aliases: "/sofa-registry/docs/Management-API"
---

## 1. registry-meta

### 1.1 Push switch

When publishing new SOFARegistry versions, to minimize the impact on services, and avoid large amounts of push messages caused by large-scale service endpoint changes during the server restart process, we will temporarily turn off the push service at the management layer. After publishing the new SOFARegistry version, we can turn on the push service and restore the normal working conditions. Data subscription and service publication information generated for the period when the push service is turned off will be subject to global push for compensation.

Turn on the push service:

```shell
curl "http://<meta_ip>:9615/stopPushDataSwitch/close"
```

Turn off the push service:

```shell
curl "http://<meta_ip>:9615/stopPushDataSwitch/open"
```

### 1.2 Query the endpoint list

View the endpoint list of the meta cluster:

```shell
curl "http://<meta_ip>:9615/digest/META/node/query"
```

View the endpoint list of the data cluster:

```shell
curl "http://<meta_ip>:9615/digest/DATA/node/query"
```

View the endpoint list of the session cluster:

```shell
curl "http://<meta_ip>:9615/digest/SESSION/node/query"
```

### 1.3 Scale up/down the meta cluster

#### 1.3.1 Modify the cluster: changePeer

You can call this operation to modify the Raft cluster list when you have scaled up/down the cluster. This allows you to correctly add nodes to or remove nodes from the cluster:

```shell
curl -X POST "http://<meta_ip>:9615/manage/changePeer" -d "ipAddressList=<ip1>,<ip2>,<ip3>"
```

#### 1.3.2 Reset the cluster: resetPeer

When a cluster is unavailable, for example, two of three servers are not functional, the cluster can not carry out leader election. Here, you can call this operation to reset the cluster list. For example, you can reset the cluster to a one-server cluster (with the only functional server) to resume election and restore service.

```shell
curl -X POST "http://<meta_ip>:9615/manage/resetPeer" -d "ipAddressList=<ip1>,<ip2>,<ip3>"
```

## 2. registry-data

### 2.1 Query data

View the pub count:

```shell
curl "http://<data_ip>:9622/digest/datum/count"
```

You can call this operation to view data published by a client based on its IP address and port number.

```shell
curl -X POST "http://<data_ip>:9622/digest/connect/query" -H "Content-Type: application/json" -d '{"<clientIP>":"<client port>"}'
```

## 3. registry-session

### 3.1 Query data

You can call this operation to view data published by a client based on its IP address and port number.

```shell
curl -X POST "http://<session_ip>:9603/digest/pub/connect/query" -H "Content-Type: application/json" -d '["<clientIP>:<client port>"]'
```

You can call this operation to view data subscribed to by a client based on its IP address and port number.

```shell
curl -X POST "http://<session_ip>:9603/digest/sub/connect/query" -H "Content-Type: application/json" -d '["<clientIP>:<client port>"]'
```

### 3.2 Clear data of a client: clientOff

You can call this operation to clear all sub and pub data of a client based on its IP address and port number (without disconnecting the client):

```shell
curl -X POST "http://<session_ip>:9603/api/clients/off" -H "Content-Type: application/json" -d '{"connectIds": ["<clientIP>:<client port>"]}'
```

