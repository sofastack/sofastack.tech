---
title: "Dragonfly 在 Kubernetes 多集群环境下分发文件和镜像"
authorlink: "https://github.com/sofastack"
description: "Dragonfly 在 Kubernetes 多集群环境下分发文件和镜像"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2023-08-29T15:00:00+08:00
cover: "https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*ZvQpQ5TnMiEAAAAAAAAAAAAADrGAAQ/original"
---

## 作者简介

**戚文博（百蓦）**

Dragonfly Maintainer，蚂蚁集团软件工程师

*主要负责「基于 P2P 的文件分发以及镜像加速系统」。*

**本文 2036 字 阅读 8 分钟**

Dragonfly 提供高效、稳定、安全的基于 P2P 技术的文件分发和镜像加速系统，并且是云原生架构中镜像加速领域的标准解决方案以及最佳实践。现在为云原生计算机基金会（*CNCF*）托管作为孵化级（*Incubating*）项目。

文章主要阐述如何在多集群环境下部署 Dragonfly。一个 Dragonfly 集群管理一个单独网络环境的集群，如果有两个集群是相互隔离的网络环境，就需要有两个 Dragonfly 集群管理各自的集群。

推荐用户在多 Kubernetes 集群场景下，使用一个 Dragonfly 集群管理一个 Kubernetes 集群，二者 1:1 关系。并且使用一个中心化的 Manager 服务去管理多个 Dragonfly 集群。因为对于 Dragonfly，一个 Dragonfly 集群中的所有 Peers 只能在当前 Dragonfly 集群内 P2P 传输数据，所以一定要保证一个 Dragonfly 集群中的所有 Peers 网络是互通的。那么如果一个 Dragonfly 集群管理一个 Kubernetes 集群，那么代表集群内的 Peers 只在 Kubernetes 集群维度进行 P2P 传输数据。

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*xL1xT4nIOgAAAAAAAAAAAAAADrGAAQ/original)

## **准备 Kubernetes 集群**

如果没有可用的 Kubernetes 集群进行测试，推荐使用 Kind\[1]。

创建 Kind 多节点集群配置文件 kind-config.yaml，配置如下:

```go
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  - role: control-plane
  - role: worker
    extraPortMappings:
      - containerPort: 30950        
        hostPort: 8080    
    labels:      
      cluster: a  
  - role: worker    
    labels:      
      cluster: a  
  - role: worker    
    labels:      
      cluster: b  
  - role: worker    
    labels:      
      cluster: b
```

使用配置文件创建 Kind 集群：

```go
    kind create cluster --config kind-config.yaml    
````

切换 Kubectl 的 context 到 Kind 集群：

```go
    kubectl config use-context kind-kind
```

## **Kind 加载 Dragonfly 镜像**

下载 Dragonfly latest 镜像：

```go
    docker pull dragonflyoss/scheduler:latest
    docker pull dragonflyoss/manager:latest
    docker pull dragonflyoss/dfdaemon:latest
```

Kind 集群加载 Dragonfly latest 镜像：

```go
    kind load docker-image dragonflyoss/scheduler:latest
    kind load docker-image dragonflyoss/manager:latest
    kind load docker-image dragonflyoss/dfdaemon:latest
````

## **创建 Dragonfly 集群 A**

创建 Dragonfly 集群 A，应该使用 Helm 在当前集群内安装中心化的 Manager、Scheduler、Seed Peer、Peer。

### 基于 Helm Charts 创建 Dragonfly 集群 A

创建 Helm Charts 的 Dragonfly 集群 A 的配置文件 charts-config-cluster-a.yaml，配置如下：

```go
    containerRuntime:
      containerd:
        enable: true
        injectConfigPath: true
        registries:     
          - 'https://ghcr.io'
    
    scheduler:  
      image: dragonflyoss/scheduler  
      tag: latest  
      nodeSelector:    
        cluster: a  
      replicas: 1  
      metrics:    
        enable: true  
      config:    
        verbose: true   
        pprofPort: 18066
    
    seedPeer:  
      image: dragonflyoss/dfdaemon  
      tag: latest  
      nodeSelector:    
        cluster: a  
      replicas: 1  
      metrics:    
        enable: true  
      config:    
        verbose: true   
        pprofPort: 18066
    
    dfdaemon:  
      image: dragonflyoss/dfdaemon  
      tag: latest  
      nodeSelector:    
        cluster: a  
      metrics:    
        enable: true  
      config:    
        verbose: true    
        pprofPort: 18066
    
    manager:  
      image: dragonflyoss/manager  
      tag: latest  
      nodeSelector:   
        cluster: a  
      replicas: 1  
      metrics:   
        enable: true 
      config:   
        verbose: true  
        pprofPort: 18066
    
    jaeger: 
      enable: true
````

使用配置文件部署 Helm Charts 的 Dragonfly 集群 A：

```go
    $ helm repo add dragonfly https://dragonflyoss.github.io/helm-charts/
    $ helm install --wait --create-namespace --namespace cluster-a dragonfly dragonfly/dragonfly -f charts-config-cluster-a.yaml
    NAME: dragonfly
    LAST DEPLOYED: Mon Aug  7 22:07:02 2023
    NAMESPACE: cluster-a
    STATUS: deployed
    REVISION: 1
    TEST SUITE: None
    NOTES:
    1. Get the scheduler address by running these commands:  
      export SCHEDULER_POD_NAME=$(kubectl get pods --namespace cluster-a -l "app=dragonfly,release=dragonfly,component=scheduler" -o jsonpath={.items[0].metadata.name})   
      export SCHEDULER_CONTAINER_PORT=$(kubectl get pod --namespace cluster-a $SCHEDULER_POD_NAME -o jsonpath="{.spec.containers[0].ports[0].containerPort}")  
      kubectl --namespace cluster-a port-forward $SCHEDULER_POD_NAME 8002:$SCHEDULER_CONTAINER_PORT  
      echo "Visit http://127.0.0.1:8002 to use your scheduler"
      
    2. Get the dfdaemon port by running these commands:  
      export DFDAEMON_POD_NAME=$(kubectl get pods --namespace cluster-a -l "app=dragonfly,release=dragonfly,component=dfdaemon" -o jsonpath={.items[0].metadata.name})  
      export DFDAEMON_CONTAINER_PORT=$(kubectl get pod --namespace cluster-a $DFDAEMON_POD_NAME -o jsonpath="{.spec.containers[0].ports[0].containerPort}") 
      You can use $DFDAEMON_CONTAINER_PORT as a proxy port in Node.
      
    3. Configure runtime to use dragonfly:  
      https://d7y.io/docs/getting-started/quick-start/kubernetes/

    4. Get Jaeger query URL by running these commands:  
      export JAEGER_QUERY_PORT=$(kubectl --namespace cluster-a get services dragonfly-jaeger-query -o jsonpath="{.spec.ports[0].port}")  
      kubectl --namespace cluster-a port-forward service/dragonfly-jaeger-query 16686:$JAEGER_QUERY_PORT  
      echo "Visit http://127.0.0.1:16686/search?limit=20&lookback=1h&maxDuration&minDuration&service=dragonfly to query download events"
```

检查 Dragonfly 集群 A 是否部署成功：

```go
    $ kubectl get po -n cluster-a
    NAME                                 READY   STATUS    RESTARTS      AGE
    dragonfly-dfdaemon-7t6wc             1/1     Running   0             3m18s
    dragonfly-dfdaemon-r45bk             1/1     Running   0             3m18s
    dragonfly-jaeger-84dbfd5b56-fmhh6    1/1     Running   0             3m18s
    dragonfly-manager-75f4c54d6d-tr88v   1/1     Running   0             3m18s
    dragonfly-mysql-0                    1/1     Running   0             3m18s
    dragonfly-redis-master-0             1/1     Running   0             3m18s
    dragonfly-redis-replicas-0           1/1     Running   1 (2m ago)    3m18s
    dragonfly-redis-replicas-1           1/1     Running   0             96s
    dragonfly-redis-replicas-2           1/1     Running   0             45s
    dragonfly-scheduler-0                1/1     Running   0             3m18s
    dragonfly-seed-peer-0                1/1     Running   1 (37s ago)   3m18s
```

### 创建 Manager REST 服务的 NodePort Service 资源

创建 Manager REST 服务的配置文件 manager-rest-svc.yaml，配置如下：

```go
    apiVersion: v1
    kind: Service
    metadata:  
      name: manager-rest  
      namespace: cluster-a
    spec:  
      type: NodePort   
      ports:    
        - name: http     
        nodePort: 30950 
        port: 8080 
      selector:  
        app: dragonfly  
        component: manager 
        release: dragonfly
```

使用配置文件创建 Manager REST 服务的 Service 资源：

```go
    kubectl apply -f manager-rest-svc.yaml -n cluster-a
```

### 访问 Manager 控制台

使用默认用户名 root，密码 dragonfly 访问 localhost:8080 的 Manager 控制台地址，并且进入控制台。

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*p7T0TaG7jxQAAAAAAAAAAAAADrGAAQ/original)

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*eUVySY_circAAAAAAAAAAAAADrGAAQ/original)

在 Dragonfly Manager 部署成功后，默认情况下 Dragonfly Manager 在第一次启动的时候，如果没有任何集群，那么会自动创建集群 A 的记录。用户可以点击 Manager 控制台看到集群 A 的详细信息。

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*Bg9_QZ9HRm0AAAAAAAAAAAAADrGAAQ/original)

## **创建 Dragonfly 集群 B**

创建 Dragonfly 集群 B，需要在 Manager 控制台首先创建 Dragonfly 集群记录，然后再使用 Helm 安装 Scheduler、Seed Peer 和 Peer。

### Manager 控制台创建 Dragonfly 集群 B 的记录

点击 `ADD CLUSTER` 按钮创建集群 B 的记录，注意 IDC 设置为 cluster-2 使其能够跟后面 Peer 配置文件中 IDC 值为 cluster-2 的 Peer 相匹配。

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*HkGITqJx0q8AAAAAAAAAAAAADrGAAQ/original)

创建 Dragonfly 集群 B 记录成功。

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*iNGFSK86pyoAAAAAAAAAAAAADrGAAQ/original)

### 使用 Scopes 配置区分 不同 Dragonfly 集群 

Cluster 管辖的 Scopes 信息。Peer 会根据 Dfdaemon 启动的配置文件 host.idc、host.location 以及 host.advertiseIP 的内容上报给 Manager。然后 Manager 选择跟 Cluster Scopes 中 IDC、Location 以及 CIDRs 匹配的 Cluster。被选中的 Cluster 会提供自身的 Scheduler Cluster 和 Seed Peer Cluster 对当前 Peer 进行服务。这样可以通过 Scopes 来区分不同 Cluster 服务的 Peer 群，在多集群场景中非常重要。Peer 的配置文件可以参考文档 dfdaemon config\[2]。

如果 Peer 的 Scopes 信息和 Dragonfly 集群匹配，那么会优先使用当前 Dragonfly 集群的 Scheduler 和 Seed Peer 提供服务。也就是说当前 Dragonfly 集群内的 Peer 只能在集群内部进行 P2P 传输数据。如果没有匹配的 Dragonfly 集群，那么使用默认的 Dragonfly 集群提供服务。

**Location:** Cluster 需要为该 Location 的所有 Peer 提供服务。当对 Peer 配置中的 Location 与 Cluster 中的 Location 配时，Peer 将优先使用 Cluster 的 Scheduler 和 Seed Peer。用“|”分隔，例如“地区|国家|省|城市”。

**IDC:** Cluster 需要服务 IDC 内的所有 Peer。当 Peer 配置中的 IDC 与 Cluster 中的 IDC 匹配时，Peer 将优先使用 Cluster 的 Scheduler 和 Seed Peer。IDC 在 Scopes 内的优先级高于 Location。

**CIDRs:** Cluster 需要为 CIDR 中的所有 Peer 提供服务。当 Peer 启动时，将在 Peer 配置中使用 Advertise IP，如果 Peer 配置中的 Advertise IP 为空， 则 Peer 将自动获取 Expose IP 作为 Advertise IP。当 Peer 上报的 IP 与 Cluster 中的 CIDR 匹配时，Peer 将优先使用 Cluster 的 Scheduler 和 Seed Peer。CIDR 在 Scopes 内的优先级高于 IDC。

### 基于 Helm Charts 创建 Dragonfly 集群 B

创建 Helm Charts 文件的内容可以在 Manager 控制台对应的 Dragonfly 集群信息详情中查看。

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*VI86QKxxeJoAAAAAAAAAAAAADrGAAQ/original)

*   `Scheduler.config.manager.schedulerClusterID` 是 Manager 控制台的 cluster-2 集群信息中的 `Scheduler cluster ID` 值。

*   `Scheduler.config.manager.addr` 是 Manager 的 GRPC 服务地址。

*   `seedPeer.config.scheduler.manager.seedPeer.clusterID` 是 Manager 控制台的 cluster-2 集群信息中的 `Seed peer cluster ID` 值。

*   `seedPeer.config.scheduler.manager.netAddrs[0].addr` 是 Manager 的 GRPC 服务地址。

*   `dfdaemon.config.host.idc` 是 Manager 控制台的 cluster-2 集群信息中的 IDC 值。

*   `dfdaemon.config.scheduler.manager.netAddrs[0].addr` 是 Manager 的 GRPC 服务地址。

*   `externalManager.host` 是 Manager 的 GRPC 服务的 Host。

*   `externalRedis.addrs[0]` 是 Redis 的服务地址。

创建 Helm Charts 的 Dragonfly 集群 B 的配置文件 charts-config-cluster-b.yaml，配置如下:

```go
containerRuntime:
  containerd:
    enable: true
    injectConfigPath: true
    registries:
      - 'https://ghcr.io'

scheduler:
  image: dragonflyoss/scheduler
  tag: latest
  nodeSelector:
    cluster: b
  replicas: 1
  config:
    manager:
      addr: dragonfly-manager.cluster-a.svc.cluster.local:65003
      schedulerClusterID: 2

seedPeer:
  image: dragonflyoss/dfdaemon
  tag: latest
  nodeSelector:
    cluster: b
  replicas: 1
  config:
    scheduler:
      manager:
        netAddrs:
          - type: tcp
            addr: dragonfly-manager.cluster-a.svc.cluster.local:65003
        seedPeer:
          enable: true
          clusterID: 2

dfdaemon:
  image: dragonflyoss/dfdaemon
  tag: latest
  nodeSelector:
    cluster: b
  config:
    host:
      idc: cluster-2
    scheduler:
      manager:
        netAddrs:
          - type: tcp
            addr: dragonfly-manager.cluster-a.svc.cluster.local:65003

manager:
  enable: false

externalManager:
  enable: true
  host: dragonfly-manager.cluster-a.svc.cluster.local
  restPort: 8080
  grpcPort: 65003

redis:
  enable: false

externalRedis:
  addrs:
    - dragonfly-redis-master.cluster-a.svc.cluster.local:6379
  password: dragonfly

mysql:
  enable: false

jaeger:
  enable: true
```

使用配置文件部署 Helm Charts 的 Dragonfly 集群 B:

```go
$ helm install --wait --create-namespace --namespace cluster-b dragonfly dragonfly/dragonfly -f charts-config-cluster-b.yaml
NAME: dragonfly
LAST DEPLOYED: Mon Aug  7 22:13:51 2023
NAMESPACE: cluster-b
STATUS: deployed
REVISION: 1
TEST SUITE: None
NOTES:
1. Get the scheduler address by running these commands:
  export SCHEDULER_POD_NAME=$(kubectl get pods --namespace cluster-b -l "app=dragonfly,release=dragonfly,component=scheduler" -o jsonpath={.items[0].metadata.name})
  export SCHEDULER_CONTAINER_PORT=$(kubectl get pod --namespace cluster-b $SCHEDULER_POD_NAME -o jsonpath="{.spec.containers[0].ports[0].containerPort}")
  kubectl --namespace cluster-b port-forward $SCHEDULER_POD_NAME 8002:$SCHEDULER_CONTAINER_PORT
  echo "Visit http://127.0.0.1:8002 to use your scheduler"

2. Get the dfdaemon port by running these commands:
  export DFDAEMON_POD_NAME=$(kubectl get pods --namespace cluster-b -l "app=dragonfly,release=dragonfly,component=dfdaemon" -o jsonpath={.items[0].metadata.name})
  export DFDAEMON_CONTAINER_PORT=$(kubectl get pod --namespace cluster-b $DFDAEMON_POD_NAME -o jsonpath="{.spec.containers[0].ports[0].containerPort}")
  You can use $DFDAEMON_CONTAINER_PORT as a proxy port in Node.

3. Configure runtime to use dragonfly:
  https://d7y.io/docs/getting-started/quick-start/kubernetes/


4. Get Jaeger query URL by running these commands:
  export JAEGER_QUERY_PORT=$(kubectl --namespace cluster-b get services dragonfly-jaeger-query -o jsonpath="{.spec.ports[0].port}")
  kubectl --namespace cluster-b port-forward service/dragonfly-jaeger-query 16686:$JAEGER_QUERY_PORT
  echo "Visit http://127.0.0.1:16686/search?limit=20&lookback=1h&maxDuration&minDuration&service=dragonfly to query download events"
```

检查 Dragonfly 集群 B 是否部署成功：

```go
$ kubectl get po -n dragonfly-system
NAME                                READY   STATUS    RESTARTS   AGE
dragonfly-dfdaemon-q8bsg            1/1     Running   0          67s
dragonfly-dfdaemon-tsqls            1/1     Running   0          67s
dragonfly-jaeger-84dbfd5b56-rg5dv   1/1     Running   0          67s
dragonfly-scheduler-0               1/1     Running   0          67s
dragonfly-seed-peer-0               1/1     Running   0          67s
```

创建 Dragonfly 集群 B 成功。

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*dlhMS586PfwAAAAAAAAAAAAADrGAAQ/original)

## 使用 Dragonfly 在多集群环境下分发镜像

### 集群 A 中 Containerd 通过 Dragonfly 首次回源拉镜像 

在 kind-worker Node 下载 `ghcr.io/dragonflyoss/dragonfly2/scheduler:v2.0.5` 镜像：

```go
    docker exec -i kind-worker /usr/local/bin/crictl pull ghcr.io/dragonflyoss/dragonfly2/scheduler:v2.0.5
````

暴露 Jaeger 16686 端口：

```go
    kubectl --namespace cluster-a port-forward service/dragonfly-jaeger-query 16686:16686
```

进入 Jaeger 页面 [http://127.0.0.1:16686/search](http://127.0.0.1:16686/search)，搜索 Tags 值为 `http.url="/v2/dragonflyoss/dragonfly2/scheduler/blobs/sha256:82cbeb56bf8065dfb9ff5a0c6ea212ab3a32f413a137675df59d496e68eaf399?ns=ghcr.io"` Tracing：

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*bDJKSoNHOjsAAAAAAAAAAAAADrGAAQ/original)

Tracing 详细内容：

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*Og1iT5IzZf8AAAAAAAAAAAAADrGAAQ/original)

集群 A 内首次回源时，下载 `82cbeb56bf8065dfb9ff5a0c6ea212ab3a32f413a137675df59d496e68eaf399` 层需要消耗时间为 `1.47s`。

### 集群 A 中 Containerd 下载镜像命中 Dragonfly 远程 Peer 的缓存

在 kind-worker2 Node 下载 `ghcr.io/dragonflyoss/dragonfly2/scheduler:v2.0.5` 镜像：

```go
    docker exec -i kind-worker2 /usr/local/bin/crictl pull ghcr.io/dragonflyoss/dragonfly2/scheduler:v2.0.5
````

暴露 Jaeger 16686 端口：

```go
    kubectl --namespace cluster-a port-forward service/dragonfly-jaeger-query 16686:16686
```

进入 Jaeger 页面 [http://127.0.0.1:16686/search](http://127.0.0.1:16686/search)，搜索 Tags 值为 `http.url="/v2/dragonflyoss/dragonfly2/scheduler/blobs/sha256:82cbeb56bf8065dfb9ff5a0c6ea212ab3a32f413a137675df59d496e68eaf399?ns=ghcr.io"` Tracing：

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*zcLeTIFpe8YAAAAAAAAAAAAADrGAAQ/original)

Tracing 详细内容：

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*KsbfTbX-IAYAAAAAAAAAAAAADrGAAQ/original)

集群 A 中命中远程 Peer 缓存时，下载 `82cbeb56bf8065dfb9ff5a0c6ea212ab3a32f413a137675df59d496e68eaf399` 层需要消耗时间为 `37.48ms`。

### 集群 B 中 Containerd 通过 Dragonfly 首次回源拉镜像 

在 kind-worker3 Node 下载 `ghcr.io/dragonflyoss/dragonfly2/scheduler:v2.0.5` 镜像：

```go
    docker exec -i kind-worker3 /usr/local/bin/crictl pull ghcr.io/dragonflyoss/dragonfly2/scheduler:v2.0.5
````

暴露 Jaeger 16686 端口：

```go
    kubectl --namespace cluster-b port-forward service/dragonfly-jaeger-query 16686:16686
```

进入 Jaeger 页面 [http://127.0.0.1:16686/search](http://127.0.0.1:16686/search)，搜索 Tags 值为 `http.url="/v2/dragonflyoss/dragonfly2/scheduler/blobs/sha256:82cbeb56bf8065dfb9ff5a0c6ea212ab3a32f413a137675df59d496e68eaf399?ns=ghcr.io"` Tracing：

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*PLn6SqQUC90AAAAAAAAAAAAADrGAAQ/original)

Tracing 详细内容：

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*ThGLQZnHQDgAAAAAAAAAAAAADrGAAQ/original)

集群 B 中命中远程 Peer 缓存时，下载 `82cbeb56bf8065dfb9ff5a0c6ea212ab3a32f413a137675df59d496e68eaf399` 层需要消耗时间为 `4.97s`。

### 集群 B 中 Containerd 下载镜像命中 Dragonfly 远程 Peer 的缓存

在 kind-worker4 Node 下载 `ghcr.io/dragonflyoss/dragonfly2/scheduler:v2.0.5` 镜像：

```go
    docker exec -i kind-worker4 /usr/local/bin/crictl pull ghcr.io/dragonflyoss/dragonfly2/scheduler:v2.0.5
```

暴露 Jaeger 16686 端口：

```go
    kubectl --namespace cluster-b port-forward service/dragonfly-jaeger-query 16686:16686
```

进入 Jaeger 页面 [http://127.0.0.1:16686/search](http://127.0.0.1:16686/search)，搜索 Tags 值为 `http.url="/v2/dragonflyoss/dragonfly2/scheduler/blobs/sha256:82cbeb56bf8065dfb9ff5a0c6ea212ab3a32f413a137675df59d496e68eaf399?ns=ghcr.io"` Tracing：

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*KZ2nQ69TgSoAAAAAAAAAAAAADrGAAQ/original)

Tracing 详细内容：

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*-5dfTo0bE3kAAAAAAAAAAAAADrGAAQ/original)

集群 B 中命中远程 Peer 缓存时，下载 `82cbeb56bf8065dfb9ff5a0c6ea212ab3a32f413a137675df59d496e68eaf399` 层需要消耗时间为 `14.53ms`。

## **Dragonfly Star 一下✨：**

[https://github.com/dragonflyoss/Dragonfly2](https://github.com/dragonflyoss/Dragonfly2)

## 相关链接

\[1]Kind：[https://kind.sigs.k8s.io/](https://kind.sigs.k8s.io/)

\[2]dfdaemon config：[https://d7y.io/zh/docs/next/reference/configuration/dfdaemon/](https://d7y.io/zh/docs/next/reference/configuration/dfdaemon/)

\[3]Dragonfly 官网：[https://d7y.io/](https://d7y.io/)

\[4]Dragonfly Github 仓库：[https://github.com/dragonflyoss/Dragonfly2](https://github.com/dragonflyoss/Dragonfly2)

\[5]Dragonfly Slack Channel（ *#dragonfly on CNCF Slack*）：[https://cloud-native.slack.com/?redir=%2Fmessages%2Fdragonfly%2F](https://cloud-native.slack.com/?redir=%2Fmessages%2Fdragonfly%2F)

\[6]Dragonfly  Discussion Group:  dragonfly-discuss@googlegroups.com 

\[7]Dragonfly Twitter（ *@dragonfly\_oss*）：[https://twitter.com/dragonfly_oss](https://twitter.com/dragonfly_oss)

\[8]Nydus  Github 仓库: [https://github.com/dragonflyoss/image-service](https://github.com/dragonflyoss/image-service)

\[9]Nydus  官网: [https://nydus.dev/](https://nydus.dev/)

## 推荐阅读

[Dragonfly 发布 v2.1.0 版本!](https://mp.weixin.qq.com/s/qXs_DMw-r18aaqMnOAEh8Q)

[Dragonfly 中 P2P 传输协议优化](https://mp.weixin.qq.com/s/LE1Sx8Ska-4WyHgTh-HFvw)

[蚂蚁 SOFAServerless 微服务新架构的探索与实践](https://mp.weixin.qq.com/s/dSyWTEascUkF4Jd3_RBjVQ)

[超越边界：FaaS 的应用实践和未来展望](https://mp.weixin.qq.com/s/mo6vYR3qXQXMW3ZK5dAuVg)
