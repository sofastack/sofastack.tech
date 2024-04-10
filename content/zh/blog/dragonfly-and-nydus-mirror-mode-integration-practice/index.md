---
title: "Dragonfly 和 Nydus Mirror 模式集成实践"
authorlink: "https://github.com/sofastack"
description: "Dragonfly 和 Nydus Mirror 模式集成实践"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2022-12-20T15:00:00+08:00
cover: "https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*MtLSSKurEhcAAAAAAAAAAAAADrGAAQ/original"
---
![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/79f11b7767c04c0c9f12fa97968cdf52~tplv-k3u1fbpfcp-zoom-1.image)

文｜戚文博 *（花名：百蓦）*

Dragonfly Maintainer 蚂蚁集团软件工程师

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bd5eb6f417f843fba85968c7a3754a04~tplv-k3u1fbpfcp-zoom-1.image)

主要负责「基于 P2P 的文件以及镜像加速系统」。  

本文 **2175** 字 阅读 **15** 分钟

## PART. 1 背景

自 17 年开源以来，Dragonfly 被许多大规模互联网公司选用并投入生产使用，并在 18 年 10 月正式进入 CNCF，成为中国第三个进入 CNCF 沙箱级别的项目。2020 年 4 月，CNCF 技术监督委员会 *（TOC）* 投票决定接受 Dragonfly 作为孵化级别的托管项目。Dragonfly 多年生产实践经验打磨的下一代产品，它汲取了上一代 Dragonfly1.x[1] 的优点并针对已知问题做了大量的优化。

Nydus 作为 Dragonfly 的子项目优化了 OCIv1 镜像格式，并以此设计了一个用户态文件系统，使容器可以按需下载镜像，不再需要下载完整镜像即可启动容器。在最新版本中 Dragonfly 完成了和子项目 Nydus 的集成，让容器启动即可以按需下载镜像，减少下载量。也可以在传输过程中利用 Dragonfly P2P 的传输方式，降低回源流量并且提升下载速度。

## PART. 2 实践

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d2a6591318b649979bc73ce7eec45112~tplv-k3u1fbpfcp-zoom-1.image)

注:如果没有可用的 Kubernetes 集群进行测试，推荐使用 Kind[2]。  

**安装 Dragonfly**

基于 Kubernetes cluster 详细安装文档可以参考：

*[https://d7y.io/docs/next/getting-started/quick-start/kubernetes/](https://d7y.io/docs/next/getting-started/quick-start/kubernetes/)* 。

**使用 Kind 安装 Kubernetes 集群**

创建 Kind 多节点集群配置文件  `kind-config.yaml` ，配置如下:

```YAML
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
- role: worker    
extraPortMappings:
- containerPort: 30950 
hostPort: 65001  
- role: worker
```

使用配置文件创建 Kind 集群:

```YAML
kind create cluster --config kind-config.yaml
```

切换 Kubectl 的 context 到 Kind 集群:

```YAML
kubectl config use-context kind-kind
```

**Kind 加载 Dragonfly 镜像**

下载 Dragonfly latest 镜像:

```YAML
docker pull dragonflyoss/scheduler:latest
docker pull dragonflyoss/manager:latest
docker pull dragonflyoss/dfdaemon:latest
```

Kind 集群加载 Dragonfly latest 镜像:

```YAML
kind load docker-image dragonflyoss/scheduler:latest
kind load docker-image dragonflyoss/manager:latest
kind load docker-image dragonflyoss/dfdaemon:latest
```

**基于 Helm Charts**

**创建 Dragonfly P2P 集群**

创建 Helm Charts 配置文件 `charts-config.yaml` 并且开启 Peer 的预取功能, 配置如下:

```YAML
scheduler:  
replicas: 1  
metrics:    
enable: true  
config: 
verbose: true    
pprofPort: 18066
seedPeer:  replicas: 1  
metrics:    
enable: true  
config:    
verbose: true    
pprofPort: 18066    
download:      
prefetch: true
dfdaemon:  
hostNetwork: true  
config:    
verbose: true    
pprofPort: 18066   
metrics: :8000    
download:    
prefetch: true   
proxy:      
defaultFilter: 'Expires&Signature&ns'    
security:     
insecure: true     
tcpListen:      
listen: 0.0.0.0   
port: 65001   
registryMirror:   
dynamic: true    
url: https://index.docker.io   
proxies:    
- regx: blobs/sha256.*
manager: 
replicas: 1 
metrics:   
enable: true 
config:   
verbose: true  
pprofPort: 18066
```

使用配置文件部署 Dragonfly Helm Charts:

```YAML
$ helm repo add dragonfly 
https://dragonflyoss.github.io/helm-charts/$ helm install --wait --create-namespace --namespace dragonfly-system dragonfly 
dragonfly/dragonfly 
-f
charts-config.yamlNAME: dragonflyLAST
DEPLOYED: Wed Oct 19 04:23:22
2022NAMESPACE: dragonfly-system
STATUS: deployedREVISION: 1TEST 
SUITE: None
NOTES:

1. Get the scheduler address by running these commands:  export SCHEDULER_POD_NAME=$(kubectl get pods --namespace dragonfly-system -l
"app=dragonfly,release=dragonfly,component=scheduler" -o jsonpath={.items[0].metadata.name})  export SCHEDULER_CONTAINER_PORT=$(kubectl
get pod --namespace dragonfly-system $SCHEDULER_POD_NAME -o jsonpath="{.spec.containers[0].ports[0].containerPort}")
kubectl --namespace dragonfly-system port-forward $SCHEDULER_POD_NAME 8002:$SCHEDULER_CONTAINER_PORT  echo "Visit http://127.0.0.1:8002 to use your scheduler"

2. Get the dfdaemon port by running these commands:  export DFDAEMON_POD_NAME=$(kubectl get pods
--namespace dragonfly-system -l
"app=dragonfly,release=dragonfly,component=dfdaemon" -o jsonpath={.items[0].metadata.name})  export DFDAEMON_CONTAINER_PORT=$
(kubectl get pod --namespace dragonfly-system $DFDAEMON_POD_NAME -o jsonpath="{
.spec.containers[0].ports[0].containerPort}")  You can use $DFDAEMON_CONTAINER_PORT as a proxy port in Node.

3. Configure runtime to use dragonfly:  https://d7y.io/docs/getting-started/quick-start/kubernetes/
```

检查 Dragonfly 是否部署成功:

```YAML
$ kubectl get po -n dragonfly-systemNAME 
READY   STATUS    RESTARTS 
AGEdragonfly-dfdaemon-rhnr6 
1/1     Running   4 (101s ago)   3m27sdragonfly-dfdaemon-s6sv5  
1/1     Running   5 (111s ago)   3m27sdragonfly-manager-67f97d7986-8dgn8
1/1     Running   0              3m27sdragonfly-mysql-0             
1/1     Running   0              3m27sdragonfly-redis-master-0    
1/1     Running   0              3m27sdragonfly-redis-replicas-0      
1/1     Running   1 (115s ago)   3m27sdragonfly-redis-replicas-1      
1/1     Running   0              95sdragonfly-redis-replicas-2    
1/1     Running   0              70sdragonfly-scheduler-0        
1/1     Running   0              3m27sdragonfly-seed-peer-0          
1/1     Running   2 (95s ago)    3m27s
```

创建 Peer Service 配置文件 `peer-service-config.yaml` 配置如下:

```YAML
apiVersion: v1
kind: Servicemeta
data:  name: peer  
namespace:
dragonfly-systemspec: 
type: NodePort  ports:    
- name: http    
nodePort: 30950      
port: 65001  
selector:  
app: dragonfly    
component: dfdaemon  
release: dragonfly
```

使用配置文件部署 Peer Service:

```YAML
kubectl apply -f peer-service-config.yaml
```

**Containerd 集成 Nydus**

生产环境 Containerd 集成 Nydus 详细文档可以参考：

*[https://github.com/dragonflyoss/image-service/blob/master/docs/containerd-env-setup.md#nydus-setup-for-containerd-environment](https://github.com/dragonflyoss/image-service/blob/master/docs/containerd-env-setup.md#nydus-setup-for-containerd-environment)*。

下面例子使用 Systemd 管理 `nydus-snapshotter` 服务。

**下载安装 Nydus 工具**

下载 `containerd-nydus-grpc` 二进制文件, 下载地址为：

*[https://github.com/containerd/nydus-snapshotter/releases/latest](https://github.com/containerd/nydus-snapshotter/releases/latest)* 。

```YAML
NYDUS_SNAPSHOTTER_VERSION=0.3.0w
get 
https://github.com/containerd/nydus-snapshotter/releases/download/v$NYDUS_SNAPSHOTTER_VERSION/nydus-snapshotter-v$NYDUS_SNAPSHOTTER_VERSION-x86_64.tgztar zxvf nydus-snapshotter-v$NYDUS_SNAPSHOTTER_VERSION-x86_64.tgz
```

安装 `containerd-nydus-grpc` 工具:

```YAML
sudo cp nydus-snapshotter/containerd-nydus-grpc /usr/local/bin/
```

下载 `nydus-image`、`nydusd` 以及 `nydusify` 二进制文件, 下载地址为

*[https://github.com/dragonflyoss/image-service/releases/latest](https://github.com/dragonflyoss/image-service/releases/latest)* :

```YAML
NYDUS_VERSION=2.1.0wget 
https://github.com/dragonflyoss/image-service/releases/download/v$NYDUS_VERSION/nydus-static-v
$NYDUS_VERSION-linux-amd64.tgztar zxvf nydus-static-v
$NYDUS_VERSION-linux-amd64.tgz
```

安装 `nydus-image`、`nydusd` 以及 `nydusify` 工具:

```YAML
sudo cp nydus-static/nydus-image nydus-static/nydusd nydus-static/nydusify /usr/local/bin/
```

**Containerd 集成**

**Nydus Snapshotter 插件**

配置 Containerd 使用 `nydus-snapshotter` 插件, 详细文档参考：

*[https://github.com/dragonflyoss/image-service/blob/master/docs/containerd-env-setup.md#configure-and-start-containerd](https://github.com/dragonflyoss/image-service/blob/master/docs/containerd-env-setup.md#configure-and-start-containerd)*。

首先修改 Containerd 配置在 `/etc/containerd/config.toml` 添加下面内容:

```YAML
[proxy_plugins] 
[proxy_plugins.nydus]  
type = "snapshot"   
address = "/run/containerd-nydus/containerd-nydus-grpc.sock"
[plugins.cri] 
[plugins.cri.containerd]   
snapshotter = "nydus"  
disable_snapshot_annotations = false
```

重启 Containerd 服务:

```YAML
sudo systemctl restart containerd
```

验证 Containerd 是否使用 `nydus-snapshotter` 插件:

```YAML
$ ctr -a /run/containerd/containerd.sock plugin ls | grep nydusio.containerd.snapshotter.v1          nydus                    -              ok
```

**Systemd 启动**

**Nydus Snapshotter 服务**

Nydusd 的 Mirror 模式配置详细文档可以参考：

*[https://github.com/dragonflyoss/image-service/blob/master/docs/nydusd.md#enable-mirrors-for-storage-backend](https://github.com/dragonflyoss/image-service/blob/master/docs/nydusd.md#enable-mirrors-for-storage-backend)*。

创建 Nydusd 配置文件 `nydusd-config.json`,配置如下:

```YAML
{  "device": {    "backend": {      "type": "registry",      "config": {        "mirrors": [          {            "host": "http://127.0.0.1:65001",            "auth_through": false,            "headers": {              "X-Dragonfly-Registry": "https://index.docker.io"            }          }        ],        "scheme": "https",        "skip_verify": false,        "timeout": 10,        "connect_timeout": 10,        "retry_limit": 2      }    },    "cache": {      "type": "blobcache",      "config": {        "work_dir": "/var/lib/nydus/cache/"      }    }  },  "mode": "direct",  "digest_validate": false,  "iostats_files": false,  "enable_xattr": true,  "fs_prefetch": {    "enable": true,    "threads_count": 10,    "merging_size": 131072,    "bandwidth_rate": 1048576  }}
```

复制配置文件至

 `/etc/nydus/config.json` 文件:

```YAML
sudo mkdir /etc/nydus && cp nydusd-config.json /etc/nydus/config.json
```

创建 Nydus Snapshotter Systemd 配置文件 `nydus-snapshotter.service` , 配置如下:

```YAML
[Unit]Description=nydus snapshotterAfter=network.targetBefore=containerd.service
[Service]Type=simpleEnvironment=HOME=/rootExecStart=/usr/local/bin/containerd-nydus-grpc --config-path /etc/nydus/config.jsonRestart=alwaysRestartSec=1KillMode=processOOMScoreAdjust=-999StandardOutput=journalStandardError=journal
[Install]WantedBy=multi-user.target
```

复制配置文件至

 `/etc/systemd/system/` 目录:

```YAML
sudo cp nydus-snapshotter.service /etc/systemd/system/
```

Systemd 启动 Nydus Snapshotter 服务:

```YAML
$ sudo systemctl enable nydus-snapshotter$ sudo systemctl start nydus-snapshotter$ sudo systemctl status nydus-snapshotter● nydus-snapshotter.service - nydus snapshotter     Loaded: loaded (/etc/systemd/system/nydus-snapshotter.service; enabled; vendor preset: enabled)     Active: active (running) since Wed 2022-10-19 08:01:00 UTC; 2s ago   Main PID: 2853636 (containerd-nydu)      Tasks: 9 (limit: 37574)     Memory: 4.6M        CPU: 20ms     CGroup: /system.slice/nydus-snapshotter.service             └─2853636 /usr/local/bin/containerd-nydus-grpc --config-path /etc/nydus/config.json
Oct 19 08:01:00 kvm-gaius-0 systemd[1]: Started nydus snapshotter.Oct 19 08:01:00 kvm-gaius-0 containerd-nydus-grpc[2853636]: time="2022-10-19T08:01:00.493700269Z" level=info msg="gc goroutine start..."Oct 19 08:01:00 kvm-gaius-0 containerd-nydus-grpc[2853636]: time="2022-10-19T08:01:00.493947264Z" level=info msg="found 0 daemons running"
```

**转换 Nydus 格式镜像**

转换 `python:latest` 镜像为 Nydus 格式镜像, 可以直接使用已经转换好的 

`dragonflyoss/python-nydus:latest` 镜像, 跳过该步骤。转换工具可以使用 Nydusify[3] 也可以使用 acceld[4]。

**登陆 Dockerhub**

转换 Nydus 镜像, 

`DOCKERHUB_REPO_NAME` 环境变量设置为用户个人的镜像仓库:

```YAML
DOCKERHUB_REPO_NAME=dragonflyosssudo nydusify convert --nydus-image /usr/local/bin/nydus-image --source python:latest --target $DOCKERHUB_REPO_NAME/python-nydus:latest
```

**Nerdctl 运行 Nydus 镜像**

使用 Nerdctl 运行 `python-nydus:latest` , 过程中即通过 Nydus 和 Dragonfly 下载镜像:

```YAML
sudo nerdctl --snapshotter nydus run --rm -it $DOCKERHUB_REPO_NAME/python-nydus:latest
```

搜索日志验证 Nydus 基于 Mirror 模式通过 Dragonfly 分发流量:

```YAML
$ grep mirrors /var/lib/containerd-nydus/logs/**/*log[2022-10-19 10:16:13.276548 +00:00] INFO [storage/src/backend/connection.rs:271] backend config: ConnectionConfig { proxy: ProxyConfig { url: "", ping_url: "", fallback: false, check_interval: 5, use_http: false }, mirrors: [MirrorConfig { host: "http://127.0.0.1:65001", headers: {"X-Dragonfly-Registry": "https://index.docker.io"}, auth_through: false }], skip_verify: false, timeout: 10, connect_timeout: 10, retry_limit: 2 }
```

**PART. 3**

**性能测试**

测试 Nydus Mirror 模式与 Dragonfly P2P 集成后的单机镜像下载的性能。测试是在同一台机器上面做不同场景的测试。由于机器本身网络环境、配置等影响，实际下载时间不具有参考价值，但是不同场景下载时间所提升的比率是有重要意义的。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2725d1fc556c473883fe374f943d7b5b~tplv-k3u1fbpfcp-zoom-1.image)

●**OCIv1**: 使用 Containerd 直接拉取镜像并且启动成功的数据。

●**Nydus Cold Boot**: 使用 Containerd 通过 Nydus 拉取镜像，没有命中任何缓存并且启动成功的数据。

●**Nydus & Dragonfly Cold Boot**: 使用 Containerd 通过 Nydus 拉取镜像，并且基于 Nydus Mirror 模式流量转发至 Dragonfly P2P，在没有命中任何缓存并且启动成功的数据。

●**Hit Dragonfly Remote Peer Cache**: 使用 Containerd 通过 Nydus 拉取镜像，并且基于 Nydus Mirror 模式流量转发至 Dragonfly P2P，在命中 Dragonfly 的远端 Peer 缓存的情况下并且成功启动的数据。

●**Hit Dragonfly Local Peer Cache**: 使用 Containerd 通过 Nydus 拉取镜像，并且基于 Nydus Mirror 模式流量转发至 Dragonfly P2P，在命中 Dragonfly 的本地 Peer 缓存的情况下并且成功启动的数据。

●**Hit Nydus Cache**: 使用 Containerd 通过 Nydus 拉取镜像，并且基于 Nydus Mirror 模式流量转发至 Dragonfly P2P，在命中 Nydus 的本地缓存的情况下并且成功启动的数据。

测试结果表明 Nydus Mirror 模式和 Dragonfly P2P 集成。使用 Nydus 下载镜像对比 OCIv1 的模式，能够有效减少镜像下载时间。Nydus 冷启动和 Nydus & Dragonfly 冷启动数据基本接近。

其他命中 Dragonfly Cache 的结果均好于只使用 Nydus 的情况。最重要的是如果很大规模集群使用 Nydus 拉取镜像，会将每个镜像层的下载分解按需产生很多 Range 请求。增加镜像仓库源站 QPS 。

而 Dragonfly 可以基于 P2P 技术有效减少回源镜像仓库的请求数量和下载流量。最优的情况，Dragonfly 可以保证大规模集群中每个下载任务只回源一次。

**｜相关链接｜**
 
[1]Dragonfly1.x:*[https://github.com/dragonflyoss/Dragonfly](https://github.com/dragonflyoss/Dragonfly)*

[2]Kind:*[https://kind.sigs.k8s.io/](https://kind.sigs.k8s.io/)* 

[3]Nydusify:*[https://github.com/dragonflyoss/image-service/blob/master/docs/nydusify.md](https://github.com/dragonflyoss/image-service/blob/master/docs/nydusify.md)*

[4]Acceld:*[https://github.com/goharbor/acceleration-service](https://github.com/goharbor/acceleration-service)*

**｜社区相关网址｜**

**Dragonfly 社区官网网站**:

*[https://d7y.io/](https://d7y.io/)*

Github 仓库:

*[https://github.com/dragonflyoss/Dragonfly2](https://github.com/dragonflyoss/Dragonfly2)*

Slack Channel: 

*#dragonflyonCNCF Slack*

Discussion Group:

*dragonfly-discuss@googlegroups.com*

Twitter: *@dragonfly_oss*

**Nydus 社区官方网站**:

*[https://nydus.dev/](https://nydus.dev/)*

Github 库:

*[https://github.com/dragonflyoss/image-service](https://github.com/dragonflyoss/image-service)*

Slack Channel:   *#nydus*

**点击原文，了解更多……**

**Dragonfly Star 一下✨：**  

**[https://github.com/dragonflyoss/Dragonfly2](https://github.com/dragonflyoss/Dragonfly2)**

** 本周推荐阅读**

[Dragonfly 基于 P2P 的文件和镜像分发系统](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247515730&idx=1&sn=185ccafb2e52b09b0c5746e5dd70f9ae&chksm=faa35188cdd4d89e014c71c1ebfdaa615eafca514443e40e923933df5e6ea32fe90ae50af74d&scene=21)

[Dragonfly 中 P2P 传输协议优化](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247517262&idx=1&sn=65ff04b4dbfed7fb97d3507ee3f4174e&chksm=faa36b94cdd4e2821813e3f1ab88c8c7770a37b3137f028a6ac27e39831f8a0a801c53e78568&scene=21)

[Nydus | 容器镜像基础](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247517164&idx=1&sn=28f50763db2883839908057125a7b497&chksm=faa36c36cdd4e52050796d00f2f5bf357471692c2da8727cc44ae47856cd925e599b6e954314&scene=21)

[Nydus —— 下一代容器镜像的探索实践](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247510940&idx=1&sn=b545e0836a6182abddd13a05b2f90ba9&chksm=faa34446cdd4cd50a461f071cdc4d871bd6eeef2318a2ec73968c117b41740a56a296c726aee&scene=21)
