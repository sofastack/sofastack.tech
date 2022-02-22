---
title: "部署"
aliases: "/sofa-registry/docs/Deployment"
---

## 1. 环境准备

要使用 SOFARegistry，需要先准备好基础环境，SOFARegistry 依赖以下环境：

- Linux/Unix/Mac
- JDK8
- 需要采用 Apache Maven 3.2.5 或者以上的版本来编译

## 2. 资源配额

- cpu: 4c
- memory: 8G
- disk: 50G

## 3. 两种部署模式

- 集成部署模式
  - 将 meta/data/session 三个角色打包集成在一个 jvm 里运行，可单机或集群部署，部署简单。
- 独立部署模式
  - 将 meta/data/session 三个角色分开部署，每个角色都可以单机或集群部署，可根据实际情况为每个角色部署不同的数量。
  - 生产环境建议使用这种部署模式。

## 4. 配置参数

SOFARegistry 的部署，依赖于一些公共参数

| properties            | environment   | 默认值            | 作用                                     |
| --------------------- | ------------- | ----------------- | ---------------------------------------- |
| nodes.localDataCenter | x             | DefaultDataCenter | 集群名，多个注册中心公用同一个数据库用到 |
| nodes.localRegion     | x             | DEFAULT_ZONE      | 逻辑 region, 创建多组 session            |
| jdbc.url              | JDBC_URL      | 必填              | 数据库地址                               |
| jdbc.username         | JDBC_USERNAME | 必填              | 数据库用户名                             |
| jdbc.password         | JDBC_PASSWORD | 必填              | 数据库密码                               |

properties 可以写在 registry-all/conf/application.properties 中， kubernetes 下部署也可以使用 configmap 进行文件挂载

## 5. 打包

### jar

[release 页面](https://github.com/sofastack/sofa-registry/releases) 下载最新的 registry-all.tgz 包

```bash
tar -zxvf registry-all.tgz
cd registry-all
```

或者从源码打包

```bash
git clone https://github.com/sofastack/sofa-registry.git
cd sofa-registry
mvn clean package -Dmaven.test.skip=true
cp ./server/distribution/all/target/registry-all.tgz <somewhere>
cd <somewhere>
tar -zxvf registry-all.tgz
cd registry-all
```

### image

image 托管于 [https://hub.docker.com/r/sofaregistry/sofaregistry](https://hub.docker.com/r/sofaregistry/sofaregistry)

或者从源码 build:
修改 Makefile 中 image 的 repository

```bash
git clone https://github.com/sofastack/sofa-registry.git
cd sofa-registry
mvn clean package -Dmaven.test.skip=true
make image_build
make image_push
```

## 6. 集成部署模式

集成部署模式，是将 meta/data/session 三个角色打包集成在一个 JVM 里运行，可单机或集群部署, 不建议大规模使用

### 6.1 jar 单机部署

集成部署的单机部署模式可以直接参考[快速开始-服务端部署](../server-quick-start)部分。

### 6.2 jar 集群部署

- 解压 registry-all.tgz，并修改配置文件

集群部署，即搭建 2 台以上的集群，建议至少使用 3 台（注意：目前不支持在同一台机器部署多个 SOFARegistry，因此您必须有 3 台不同的机器）。在每一台机器上的部署方法同上：

```bash
cp ./server/distribution/all/target/registry-all.tgz <somewhere>
cd <somewhere>
tar -zxvf registry-all.tgz
cd registry-all
```

区别是每台机器在部署时需要修改 registry-all/conf/application.properties 配置, 组成同一个注册中心的多台机器需要配置相同的数据库和`nodes.localDataCenter`

```bash
nodes.localDataCenter=DefaultDataCenter
nodes.localRegion=DEFAULT_ZONE
jdbc.url = jdbc:mysql://127.0.0.1:3306/registrymetadb?useUnicode=true&characterEncoding=utf8
jdbc.username = root
jdbc.password = root
```

- 启动 registry-integration

每台机器都修改以上配置文件后，按照“单机部署”的步骤去启动 registry-integration 即可。
`sh bin/integration/start.sh`

### 6.3 docker 集群部署

客户端和 SOFARegistry 需要同一个三层网络内，因此利用 docker 部署需要使用 host network
可以通过配置文件挂载的方式进行部署，也可以通过环境变量传递的方式
同时需要添加 REGISTRY_APP_NAME=integration 进入集成模式，在一个 jvm 里启动 3 个角色

image 中， registry-all.tgz 的解压地址在 `registry-distribution/registry-all`, 配置需要挂载到正确的目录

```bash
docker run -e REGISTRY_APP_NAME=integration \
  --name=sofa-registry --rm --net=host \
  -v $PWD/conf/:/registry-distribution/registry-all/conf/ \
  -e JDBC_URL=jdbc:mysql://172.17.0.1:3306/registrymetadb
  -e JDBC_USERNAME=root
  -e JDBC_PASSWORD=root
  sofaregistry/sofaregistry:6.1.4
```

## 7. 独立部署模式

独立部署模式，是将 meta/data/session 三个角色分开部署，每个角色都可以单机或集群部署，可根据实际情况为每个角色部署不同的数量，生产环境推荐使用这种部署模式。

以下介绍 332 模式（即 3 台 meta + 3 台 data + 2 台 session）的部署步骤。

### 7.1 jar 集群部署

- 解压 registry-all.tgz，并修改配置文件
  集群部署，即搭建 2 台以上的集群，建议至少使用 3 台（注意：目前不支持在同一台机器部署多个 SOFARegistry，因此您必须有 3 台不同的机器）。在每一台机器上的部署方法同上：

```bash
cp ./server/distribution/all/target/registry-all.tgz <somewhere>
cd <somewhere>
tar -zxvf registry-all.tgz
cd registry-all
```

application.properties 配置, 组成同一个注册中心的多台机器需要配置相同的数据库和`nodes.localDataCenter`

```bash
nodes.localDataCenter=DefaultDataCenter
nodes.localRegion=DEFAULT_ZONE
jdbc.url = jdbc:mysql://127.0.0.1:3306/registrymetadb?useUnicode=true&characterEncoding=utf8
jdbc.username = root
jdbc.password = root
```

#### 7.1.1 meta 部署

```bash
sh bin/meta/start.sh
```

#### 7.1.2 data 部署

```bash
sh bin/data/start.sh
```

#### 7.1.3 session 部署

```bash
sh bin/session/start.sh
```

### 7.2 docker 集群部署

客户端和 SOFARegistry 需要同一个三层网络内，因此利用 docker 部署需要使用 host network
可以通过配置文件挂载的方式进行部署，也可以通过环境变量传递的方式
同时需要添加 REGISTRY_APP_NAME=integration 进入集成模式，在一个 jvm 里启动 3 个角色

image 中， registry-all.tgz 的解压地址在 `registry-distribution/registry-all`, 配置需要挂载到正确的目录

#### 7.2.1 meta 启动

```bash
docker run -e REGISTRY_APP_NAME=meta \
  --name=sofa-registry --rm --net=host \
  -v $PWD/conf/:/registry-distribution/registry-all/conf/ \
  -e JDBC_URL=jdbc:mysql://172.17.0.1:3306/registrymetadb
  -e JDBC_USERNAME=root
  -e JDBC_PASSWORD=root
  sofaregistry/sofaregistry:6.1.4
```

#### 7.2.2 data 启动

```bash
docker run -e REGISTRY_APP_NAME=data \
  --name=sofa-registry --rm --net=host \
  -v $PWD/conf/:/registry-distribution/registry-all/conf/ \
  -e JDBC_URL=jdbc:mysql://172.17.0.1:3306/registrymetadb
  -e JDBC_USERNAME=root
  -e JDBC_PASSWORD=root
  sofaregistry/sofaregistry:6.1.4
```

#### 7.2.3 session 启动

```bash
docker run -e REGISTRY_APP_NAME=session \
  --name=sofa-registry --rm --net=host \
  -v $PWD/conf/:/registry-distribution/registry-all/conf/ \
  -e JDBC_URL=jdbc:mysql://172.17.0.1:3306/registrymetadb
  -e JDBC_USERNAME=root
  -e JDBC_PASSWORD=root
  sofaregistry/sofaregistry:6.1.4
```

### 7.3 kubernetes

SOFARegistry 使用 kustomize 来进行配置渲染
下载源码

```bash
git clone git@github.com:sofastack/sofa-registry.git
```

configmap-patch.yaml 和 db-secret-patch.yaml 中是传给每个角色的配置
修改对应配置，使用 kustomize 渲染得到部署用到的 yaml

```bash
kustomize build docker/kube/sofa-registry/overlays/standalone-dc2
```

同时需要申请 loadbalancer 挂载 session ip 的 9603 端口

## 8. 状态检查

确认运行状态：对每一台机器，都可访问三个角色提供的健康监测 api，或查看日志 _logs/registry-startup.log_

```bash
# 查看meta角色的健康检测接口：(3台机器，有1台是Leader，其他2台是Follower)
$ curl http://$META_IP:9615/health/check
{"success":true,"message":"..."}

# 查看data角色的健康检测接口：
$ curl http://$DATA_IP:9622/health/check
{"success":true,"message":"..."}

# 查看session角色的健康检测接口：
$ curl http://$SESSION_IP:9603/health/check
{"success":true,"message":"..."}
```
