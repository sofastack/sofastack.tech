---
title: "Docker 环境基于 Dragonfly 的 Kubernetes 多集群镜像分发实践"
authorlink: "https://github.com/sofastack"
description: "Docker 环境基于 Dragonfly 的 Kubernetes 多集群镜像分发实践"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2023-09-19T15:00:00+08:00
cover: "https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*tgriQrW1muUAAAAAAAAAAAAADrGAAQ/original"
---

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/13029393037d43829c313f9bc2c4b0ac~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=638&h=90&s=206394&e=gif&f=120&b=ffffff)

文｜**唐荦彦**

深信服高级开发工程师，主要负责 SASE 云化架构以及基础设施建设

**本文 3056 字，阅读 6 分钟**

## 1｜你将在本文学到什么

- 多 K8s 集群镜像分发方案
- Dragonfly 的理解
- Harbor 的预热机制
- Dragonfly 的使用以及排障

## 2｜K8S 多集群镜像分发问题

在边缘云架构的生产环境下，演进过程中，一开始的镜像分发方案如下：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cf2e14d4cfc94ccc9332a7163b4be156~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=986&h=675&s=10331&e=png&b=ffffff)

每个边缘集群都存在节点的 Harbor 仓库，进行缓存操作，当边缘集群集体崩溃重启过程中，不会引发所有 worker 上中心仓拉取镜像。

带来的问题是：

- 每套环境一个 Harbor，导致部署、维护的困难。
- Harbor 的复制策略比较简单，无法单例执行。并且重试非常占用中心仓带宽。

那么面对这种场景存在以下两种方案：

- Harbor 仓库分级复制策略
- P2P 镜像分发策略

Harbor 仓库分级复制策略，存在以下问题：

- 如何进行分级划分
- 升级过程，如果节点所处的是第三级，如何触发复制策略加速缓存
- 每个节点增加了安全暴露面
- 节点的不断增加，后续是否需要 3 级、4 级、5 级，维护管理成本指数增加。

所以在项目中，我的选择是 Dragonfly 的 P2P 镜像分发策略。

## 3｜Dragonfly 是什么

在理解过程中，首先需要搞懂以下几个问题：

1. P2P 是什么？

2. 镜像的分层拉取策略。

### 什么是 P2P

此 P2P 不是金融圈里面经常爆雷的，而是 Peer to Peer 网络技术。有几个比较突出的使用：

- 迅雷；
- 某夭折的播放器（*快 B*）；
- 国内一些视频网站白嫖用户网络的 P2P CDN。

#### 为什么需要 P2P 网络

P2P 网络对应的就是传统网络传输 C/S 模式。传统模式下，所有的客户端请求数据下载都需要访问服务器，那么服务器的压力会非常大，当客户端多的情况下，网络带宽也存在问题。

**以下来自 WIKI 百科：**

对等式网络（*英语：peer-to-peer，简称 P2P*），又称点对点技术，是去中心化、依靠用户群（*peers*）交换信息的互联网体系。它的作用在于，减低以往网路传输中的节点，以降低资料遗失的风险。与有中心服务器的中央网络系统不同，对等网络的每个用户端既是一个节点，也有服务器的功能，任何一个节点无法直接找到其他节点，必须依靠其户群进行信息交流。

### 镜像分层拉取

Docker 镜像通过分层进行资源共享，通过 copy-on-write 完成文件隔离。在执行 Pull 的时候，可以看到：

```Java
c1c792ed5250: Already exists
fcac137f6aa5: Already exists
c31aa26549dd: Already exists
04699d7e44fb: Pull complete
```

可以分析得出，在 Docker pull 时，先会判断本地是否存在当前层，如果没有则从远端服务器拉取层。

### Dragonfly  架构

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cb1178aab8db4dc187fb7f396b0e5304~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=985&h=618&s=100887&e=png&b=fbfbfb)

组件包括：

**Manager:** 多 Dragonfly 调度节点进行管理，提供了 UI 管理界面、镜像预热机制。

**Scheduler:**

- 基于机器学习的多场景自适应智能 P2P 节点调度，为当前下载节点选择最优父节点；
- 构建 P2P 下载网络的有向无环图；
- 根据不同特征值评估节点下载能力, 剔除异常节点；
- 当下载失败情况，主动通知 Dfdaemon 进行回源下载。

**Dfdaemon：** （*分为 Peer、Seed Peer*）

- 基于 gRPC 提供下载功能, 并提供多源适配能力；
- 开启 Seed Peer 模式可以作为 P2P 集群中回源下载节点, 也就是整个集群中下载的根节点；
- 为镜像仓库或者其他 HTTP 下载任务提供代理服务；
- 下载任务基于 HTTP 或 HTTPS 或其他自定义协议。

使用场景流程说明如下：（*当需要下载某一层镜像时*）

1. Docker 在请求下载镜像时，通过配置 Docker http proxy 代理，将请求转发到 Peer 节点。

2. Peer 节点进行本地缓存判断，查看是否存在该层镜像；

- 是，则直接响应。如图：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/842e577478504b08b9795115d2f0625a~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1080&h=383&s=71928&e=png&b=f7f7f7)

3. 如果当前 Peer 不存在，将当前请求转发到 Scheduler；

4. Scheduler 将判断 Seed Peer 中是否存在：

- 是，则将对应的地址返回，通知 Peer 去指定的 Seed Peer 拉取资源,如图：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/460db07a503e424fbe8da4fa4f5b2661~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1080&h=486&s=112922&e=png&b=f8f8f8)

5. 否，则通知 Seed Peer 回源拉取，拉取成功后，Peer 再进行拉取。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/a176aca5dd554d3a985f2f91dca9dff1~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1080&h=415&s=76989&e=png&b=fafafa)

最长路径：Docker -> Peer -> Seed Peer -> 源站 -> Seed Peer -> Peer -> Docker。

## Dragonfly 操作实践（*Docker 版*）

由于 K8s 版本过于简单，封装了 Docker 手动操作部分，这里讲源码版本如何使用。

**源码安装**

从上面已经了解到：Docker pull 通过 http proxy 配置即可通过 Peer 拉取镜像，那么操作就简单了。

步骤如下：

1. 配置 Docker；

2. 安装依赖组件：MySQL、Redis、Jaeger（*为了研究操作路径以及代码*）;

3. 配置 Manager、Scheduler、Seed Peer、Peer；

详细步骤如下：

### a.配置 Docker

- 配置 http proxy

```Java
vi /etc/systemd/system/docker.service.d/http-proxy.conf


[Service]
Environment="HTTP_PROXY=http://127.0.0.1:65001"
Environment="HTTPS_PROXY=http://127.0.0.1:65001"
```

- 私有仓库的话，配置忽略证书 insecure-registries；

```Java
vi /etc/docker/daemon.json


{
  "insecure-registries": ["your.private.registry"]
}
```

重启 Docker：systemctl restart docker。

### b.安装依赖

MySQL:

```MySQL
docker run -d --name dragonfly-mysql --restart=always -p 3306:3306 \
         --env MARIADB_USER="dragonfly" \
         --env MARIADB_PASSWORD="dragonfly" \
         --env MARIADB_DATABASE="manager" \
         --env MARIADB_ALLOW_EMPTY_ROOT_PASSWORD="yes" \
         mariadb:10.6
```

Redis：

```Redis
docker run -d --name dragonfly-redis --restart=always -p 6379:6379 \
        redis:6-alpine \
        --requirepass "dragonfly"
```

Jaeger：

```Jaeger
docker run --rm --name jaeger \
  -e COLLECTOR_ZIPKIN_HOST_PORT=:9411 \
  -p 6831:6831/udp \
  -p 6832:6832/udp \
  -p 5778:5778 \
  -p 16686:16686 \
  -p 4317:4317 \
  -p 4318:4318 \
  -p 14250:14250 \
  -p 14268:14268 \
  -p 14269:14269 \
  -p 9411:9411 \
  jaegertracing/all-in-one:1.48
```

### c.配置组件

私有仓库的情况下，需要给 Dragonfly 代理也配置一个私有证书；如果不配置，在拉取过程中，会偶发 pull 失败的情况，报错如下：

```Java
http: server gave HTTP response to HTTPS client
```

生成一个 CA 证书私钥。

```Java
openssl genrsa -out ca.key 2048
```

打开 OpenSSL 配置文件 openssl.conf。设置 basicConstraints 为 true，然后你就能修改这些值。

```Java
[ req ]
#default_bits = 2048
#default_md = sha256
#default_keyfile = privkey.pem
distinguished_name = req_distinguished_name
attributes = req_attributes
extensions               = v3_ca
req_extensions           = v3_ca
[ req_distinguished_name ]
countryName = Country Name (2 letter code)
countryName_min = 2
countryName_max = 2
stateOrProvinceName = State or Province Name (full name)
localityName = Locality Name (eg, city)
0.organizationName = Organization Name (eg, company)
organizationalUnitName = Organizational Unit Name (eg, section)
commonName = Common Name (eg, fully qualified host name)
commonName_max = 64
emailAddress = Email Address
emailAddress_max = 64
[ req_attributes ]
challengePassword = A challenge password
challengePassword_min = 4
challengePassword_max = 20
[ v3_ca ]
basicConstraints         = CA:TRUE
```

生成 CA 证书。

```Java
openssl req -new -key ca.key -nodes -out ca.csr -config openssl.conf
openssl x509 -req -days 36500 -extfile openssl.conf \
    -extensions v3_ca -in ca.csr -signkey ca.key -out ca.crt
```

⚠️注意：**配置只说明需要改的地方。**

#### 配置 Peer

```Java
jaeger: "http://127.0.0.1:14268/api/traces"
console: true  # 打开可从窗口查看日志
scheduler：  # 配置调度器
  .....  省略
  netAddrs:
    - type: tcp
      addr: 127.0.0.1:8002




proxy:
  security:
    insecure: true
  tcpListen:
    listen: 0.0.0.0
    port: 65001
  proxies:
    - regx: blobs/sha256.*
  hijackHTTPS:
    # CA certificate's path used to hijack https requests
    cert: ca.crt   
    key: ca.key
    hosts:
      - regx: your.private.registry
        insecure: true
```

#### 配置 Seed Peer

```Java
jaeger: "http://127.0.0.1:14268/api/traces"
console: true  # 打开可从窗口查看日志
scheduler:
    enable: true
    netAddrs:
      - type: tcp
        addr: 127.0.0.1:65003
        # scheduler list refresh interval
        refreshInterval: 10s
    seedPeer:
      # Dfdaemon enabled seed peer mode.
      enable: true
      # Seed peer type includes super, strong and weak.
      type: super
      # Seed peer cluster id.
      clusterID: 1    # 全局唯一
```

#### 配置 Scheduler

```Java
jaeger: "http://127.0.0.1:14268/api/traces"
console: true  # 打开可从窗口查看日志
# Manager configuration.
manager:
  # 配置manager 地址
  addr: "127.0.0.1:65003"
  # schedulerClusterID cluster id to which scheduler instance belongs.
  schedulerClusterID: "1"
database:  ##!!!!!! 必须和manager同一个redis
  # Redis configuration.
  redis:
    addrs:
      - "127.0.0.1:6379"
    # Redis username.
    username: ''
    # Redis password.
    password: dragonfly
    # Redis brokerDB name.
    brokerDB: 1
    # Redis backendDB name.
    backendDB: 2
server:
  # # Advertise ip.
  advertiseIP: 127.0.0.1
  # # Listen ip.
  # listenIP: 0.0.0.0
  # Port is the ip and port scheduler server listens on.
  port: 8002
```

#### 配置 Manager

```Java
server:
  # GRPC server configure.
  grpc:
    advertiseIP: 127.0.0.1
    port:
      start: 65003
      end: 65003
  # REST server configure
  rest:
    # REST server address
    addr: :8888
# Database info used for server.
database:
  # Database type, supported types include mysql, mariadb and postgres.
  type: mysql
  # Mysql configure.
  mysql:
    user: dragonfly
    password: dragonfly
    host: 127.0.0.1
    port: 3306
    dbname: manager
    migrate: true
  redis:
    # Redis addresses.
    addrs:
      - "127.0.0.1:6379"
    password: dragonfly
    # Redis DB name.
    db: 0
    # Redis brokerDB name.
    brokerDB: 1
    # Redis backendDB name.
    backendDB: 2
    
job:
  preheat:
   registryTimeout: 1m
   tls:   ##！！！！！预热必须将harbor仓库的证书放在这
    caCert: "/etc/docker/certs.d/your.private.registry/ca.crt"
    
jaeger: "http://127.0.0.1:14268/api/traces"
console: true  # 打开可从窗口查看日志
```

### d.Harbor 预热机制

预热，顾名思义，需要使用的时候，它已经是可以使用的状态了。如，电热毯在我们上床前，它已经是热的了。对于我们 Harbor 的使用场景，则是在 K8S 需要使用镜像的时候，Harbor 已经以前将镜像分发到了对应集群内了。

#### 如何使用预热

Dragonfly 的使用逻辑如下：

Harbor 配置策略 -> 通知 Manager -> 查询现有活动的 Scheduler 集群 -> 创建任务 -> Scheduler 调用 Seed Peer 拉取镜像。

**Harbor 配置如下：**

- 配置分发实例

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4d274daddfee4fbf8cda570000af2e6a~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1080&h=408&s=42127&e=png&b=162b33)

- 为对应的项目配置 P2P 策略

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/dca9a92ea4764857924b3c95064ab0f6~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1062&h=636&s=28873&e=png&b=101f25)

基于事件，在有新的镜像时，会通知 Manager。

## 其他问题

**我们怎么判断当前的镜像层已经缓存到了本地？**

- Dfdaemon 将缓存默认存放在 /var/lib/Dragonfly 目录下，名称为 task 名称；
- 通过查看源码，task 名称的来源为：func taskIDV1（*url string, meta *commonv1.UrlMeta, ignoreRange bool*） 。即对每一层算法计算出来的。
- 快速：直接查看对应的日志即可。

## Dragonfly Star 一下✨

[https://github.com/dragonflyoss/Dragonfly2](https://github.com/dragonflyoss/Dragonfly2)

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b32a918cfa864153ac41ec79257a78c2~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=148&h=148&s=386&e=png)

扫描二维码查看 Dragonfly GitHub 页面

## 推荐阅读

[议题征集中｜KCD 2023 杭州站](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247542086&idx=1&sn=1f5eb568ca6173eb81c54c829384127e&chksm=faa3ca9ccdd4438a35134755f70210f0e5e565db794de80d70f260e450d23d7f47f5898cfe09&scene=21)

[Dragonfly 在 Kubernetes 多集群环境下分发文件和镜像](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247540111&idx=1&sn=4cf998d461908b14edb0b2aa3e3145d5&chksm=faa3b255cdd43b431efbfb1af6dc726cbad961315ed9cc35d9b315ead8dae626b7f302d92c1a&scene=21)

[Dragonfly 发布 v2.1.0 版本!](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247538971&idx=1&sn=81d6a2bb2cc0b36c3002973193ab0f02&chksm=faa3b6c1cdd43fd7c7e80a1e2a0edef1ddec1f0e379c208de85768b5d10a02d86ce90ca176f6&scene=21)

[Dragonfly 中 P2P 传输协议优化](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247517262&idx=1&sn=65ff04b4dbfed7fb97d3507ee3f4174e&chksm=faa36b94cdd4e2821813e3f1ab88c8c7770a37b3137f028a6ac27e39831f8a0a801c53e78568&scene=21)

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7068c5db428942ec907dbbd2aefa37af~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1080&h=812&s=66592&e=jpg&b=fefefe)
