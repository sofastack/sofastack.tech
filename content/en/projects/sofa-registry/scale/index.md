---

title: "Scaling"
aliases: "/sofa-registry/docs/Scale"
---

## 1. Integrated deployment

### 1.1 Scale up registry-integration

Assume that three registry-integration servers have been deployed currently, which are namely node1, node2, and node 3. The new node to be added to the cluster is node 4.

**Operation steps:**

**Step 1. Deploy the new registry-integration node**

First, deploy `registry-integration.tgz` on node4 by referencing the [Deployment](../deployment) topic. Note that you need to set the nodes.metaNode configuration item on node4 to a 4-server endpoint list:

```bash
nodes.metaNode=DefaultDataCenter:<node1>,<node2>,<node3>,<node4>
```

In this step, after node4 is started, visit `curl http://<node4>:9615/health/check`. The status will be unhealthy, because node4 has not been added to the cluster yet. To add it to the cluster, perform the next step.

**Step 2. Call the changePeer operation to add a new node to a cluster**

Run the changePeer command on one of the existing servers (node1, node2, and node3), to modify the current cluster from a three-node cluster (node1, node2, and node3) to a four-node cluster (node1, node2, node3, and node4):

```bash
curl -X POST "http://<node1>:9615/manage/changePeer" -d "ipAddressList=<node1>,<node2>,<node3>,<node4>"
```

After completing this step, visit `curl http://<node4>:9615/health/check`. The status will be healthy.

### 1.2 Scale down registry-integration

Assume that you have three servers in one cluster, which are respectively node1, node2, and node3, and you want to scale down node3.

#### 1.2.1 Smooth scale-down

**Operation steps:**

**Step 1. Call the changePeer operation to remove a node**

Run the changePeer command on either node1 or node2 to change the cluster list from "node1, node2, node3" to "node1,node2". This removes node3 from the endpoint list of the cluster:

```bash
curl -X POST "http://<node1>:9615/manage/changePeer" -d "ipAddressList=<node1>,<node2>"
```

After completing this step, visit `curl http://<node3>:9615/health/check`. The status will be unhealthy, because node3 has already been removed from the cluster.

**Step 2. Close node3**

This step is optional, because node3 has already been removed from the cluster, and it does not affect the cluster even if it is still running.

#### 1.2.2 Handling of node failure

If node3 is no longer functional, you need to remove it from the cluster.

**Operation steps:**

**Step 1. Call the changePeer operation to remove a node**

Run the changePeer command on either node1 or node2 to change the cluster list from "node1, node2, node3" to "node1,node2". This removes node3 from the endpoint list of the cluster:

```bash
curl -X POST "http://<node1>:9615/manage/changePeer" -d "ipAddressList=<node1>,<node2>"
```

## 2. Independent deployment

### 2.1 Scale up registry-meta

Assume that you have already deployed three registry-meta servers, which are respectively metaNode1, metaNode2, and metaNode3. The new node to be added to the cluster is node 4.

**Operation steps:**

**Step 1. Deploy the new registry-meta node**

First, deploy `registry-meta.tgz` on metaNode4 by referencing the [Deployment](../deployment) topic. Note that you need to set the nodes.metaNode configuration item on metaNode4 to a 4-server endpoint list:

```bash
nodes.metaNode=DefaultDataCenter:<metaNode1>,<metaNode2>,<metaNode3>,<metaNode4>
```

In this step, after metaNode4 is started, visit `curl http://localhost:9615/health/check`. The status will be unhealthy, because metaNode4 has not been added to the cluster yet. To add it to the cluster, perform the next step.

**Step 2. Call the changePeer operation to add a new node to a cluster**

Run the changePeer command on metaNode1, metaNode2, or metaNode3, to change a legacy cluster (metaNode1,metaNode2,metaNode3) to a new cluster (metaNode1,metaNode2,metaNode3,metaNode4):

```bash
curl -X POST "http://<metaNode1>:9615/manage/changePeer" -d "ipAddressList=<metaNode1>,<metaNode2>,<metaNode3>,<metaNode4>"
```

After completing this step, visit `curl http://localhost:9615/health/check`. The status will be healthy.

### 2.2 Scale down registry-meta

Assume that you have three servers in one cluster, which are respectively metaNode1, metaNode2, and metaNode3. Now you need to scale down metaNode3.

#### 2.2.1 Smooth scale-down

**Operation steps:**

**Step 1. Call the changePeer operation to remove a node**

Run the changePeer command on either metaNode1 or metaNode2, to change the cluster list from "metaNode1, metaNode2, metaNode3" to "metaNode1,metaNode2". This removes metaNode3 from the endpoint list of the cluster:

```bash
curl -X POST "http://<metaNode1>:9615/manage/changePeer" -d "ipAddressList=<metaNode1>,<metaNode2>"
```

After completing this step, visit `curl http://<metaNode3>:9615/health/check`. The status will be unhealthy, because metaNode3 has already been removed from the cluster.

**Step 2. Close metaNode3**

This step is optional, because metaNode3 has already been removed from the cluster, and it does not affect the cluster even if it is still running.

#### 2.2.2 Handling of node failure

If metaNode3 is no longer functional, you need to remove it from the cluster.

**Operation steps:**

**Step 1. Call the changePeer operation to remove a node.**

Run the changePeer command on either metaNode1 or metaNode2, to change the cluster list from "metaNode1, metaNode2, metaNode3" to "metaNode1,metaNode2". This removes metaNode3 from the endpoint list of the cluster:

```bash
curl -X POST "http://<metaNode1>:9615/manage/changePeer" -d "ipAddressList=<metaNode1>,<metaNode2>"
```

### 2.3 Scale up registry-data

Scaling up registry-data is simple. You can simply add a node to the cluster by configuring the metaNode list, without having to call the changePeer operation.

**Operation steps:**

**Step 1. Deploy the new registry-data node**

First, deploy `registry-data.tgz` on the newDataNode by referencing the [Deployment](../deployment) topic. You can simply set the nodes.metaNode configuration item on the newDataNode to the same metaNode server list as that of other registry-data nodes. 

```bash
nodes.metaNode=DefaultDataCenter:<metaNode1>,<metaNode2>,<metaNode3>
```

### 2.4 Scale down registry-meta

Scaling down registry-data is simple. You can simply close the data node, which will then be automatically removed from the cluster (due to a heartbeat timeout). You do not have to call the changePeer operation.

### 2.5 Scale up registry-session

Scaling up registry-session is simple. You can simply add a node to the cluster by configuring the metaNode list, without having to call the changePeer operation.

**Operation steps:**

**Step 1. Deploy the new registry-session node**

First, deploy `registry-session.tgz` on the newSessionNode by referencing the [Deployment](../deployment) topic. You can simply set the nodes.metaNode configuration item on the newSessionNode to the same metaNode server list as that of other registry-session nodes. 

```bash
nodes.metaNode=DefaultDataCenter:<metaNode1>,<metaNode2>,<metaNode3>
```

### 2.6 Scale down registry-session

Scaling down registry-session is simple. You can simply close the corresponding session node, which will then be automatically removed from the cluster (due to a heartbeat timeout). You do not have to call the changePeer operation.

