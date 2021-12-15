---

title: "Deployment"
aliases: "/sofa-registry/docs/Deployment"
---

## 1. Environment preparation

To use SOFARegistry, you need to prepare the basic environment first. SOFARegistry depends on the following environment:

- Linux, UNIX, Mac are supported.
- JDK8
- Compile it with Apache Maven 3.2.5 or later versions.

## 2. Resource Quota

-cpu: 4c
-memory: 8G
-disk: 50G

## 3. Two deployment modes

- Integrated deployment
  - Package and integrate the three roles of meta, data, and session into one jvm, which can be deployed on a standalone machine or a cluster. The deployment is simple.
- Independent deployment
  - Deploy the meta, data, and session roles separately. You can deploy each of them on a standalone machine or a cluster. You can deploy different numbers of servers for each role as needed.
  - We recommend that you use this deployment mode in the production environment.

## 4. Configuration parameters

The deployment of SOFARegistry depends on some public parameters

| properties            | environment   | Default value     | Function                                                      |
| --------------------- | ------------- | ----------------- | ------------------------------------------------------------- |
| nodes.localDataCenter | x             | DefaultDataCenter | Cluster name, multiple registry centers use the same database |
| nodes.localRegion     | x             | DEFAULT_ZONE      | Logical region, create multiple groups of sessions            |
| jdbc.url              | JDBC_URL      | Required          | Database address                                              |
| jdbc.username         | JDBC_USERNAME | required          | database user name                                            |
| jdbc.password         | JDBC_PASSWORD | Required          | Database password                                             |

Properties can be written in registry-all/conf/application.properties, deployment under kubernetes can also use configmap for file mounting

## 5. Packaging

### jar

[release page](https://github.com/sofastack/sofa-registry/releases) Download the latest registry-all.tgz package

```bash
tar -zxvf registry-all.tgz
cd registry-all
```

Or package from source

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

image hosted at [https://hub.docker.com/r/sofaregistry/sofaregistry](https://hub.docker.com/r/sofaregistry/sofaregistry)

Or build from source code:
Modify the image repository in Makefile

```bash
git clone https://github.com/sofastack/sofa-registry.git
cd sofa-registry
mvn clean package -Dmaven.test.skip=true
make image_build
make image_push
```

## 6. Integrated deployment mode

The integrated deployment mode is to package and integrate the three roles of meta/data/session into a JVM to run. It can be deployed on a single machine or in a cluster. It is not recommended for large-scale use

### 6.1 jar stand-alone deployment

For the stand-alone deployment mode of integrated deployment, you can directly refer to the [Quick Start-Server Deployment] (../server-quick-start) section.

### 6.2 jar cluster deployment

- Unzip registry-all.tgz and modify the configuration file

Cluster deployment, that is, to build a cluster of 2 or more, it is recommended to use at least 3 (note: currently does not support the deployment of multiple SOFARegistry on the same machine, so you must have 3 different machines). The deployment method on each machine is the same as above:

```bash
cp ./server/distribution/all/target/registry-all.tgz <somewhere>
cd <somewhere>
tar -zxvf registry-all.tgz
cd registry-all
```

The difference is that each machine needs to modify the registry-all/conf/application.properties configuration during deployment, and multiple machines forming the same registry need to be configured with the same database and `nodes.localDataCenter`

```bash
nodes.localDataCenter=DefaultDataCenter
nodes.localRegion=DEFAULT_ZONE
jdbc.url = jdbc:mysql://127.0.0.1:3306/registrymetadb?useUnicode=true&characterEncoding=utf8
jdbc.username = root
jdbc.password = root
```

- Start registry-integration

After each machine has modified the above configuration file, follow the steps of "single machine deployment" to start registry-integration.
`sh bin/integration/start.sh`

### 6.3 Docker cluster deployment

The client and SOFARegistry need to be in the same three-layer network, so deploying with docker requires the use of host network
It can be deployed by mounting configuration files, or by passing environment variables
At the same time, you need to add REGISTRY_APP_NAME=integration to enter the integration mode and start 3 roles in a jvm

In the image, the decompression address of registry-all.tgz is in `registry-distribution/registry-all`, the configuration needs to be mounted to the correct directory

```bash
docker run -e REGISTRY_APP_NAME=integration \
  --name=sofa-registry --rm --net=host \
  -v $PWD/conf/:/registry-distribution/registry-all/conf/ \
  -e JDBC_URL=jdbc:mysql://172.17.0.1:3306/registrymetadb
  -e JDBC_USERNAME=root
  -e JDBC_PASSWORD=root
  sofaregistry/sofaregistry:6.1.4
```

## 7. Standalone deployment mode

The independent deployment mode is to deploy the three roles of meta/data/session separately. Each role can be deployed on a single machine or in a cluster. A different number can be deployed for each role according to the actual situation. This deployment mode is recommended for production environments.

The following describes the deployment steps of the 332 mode (that is, 3 meta + 3 data + 2 session).

### 7.1 jar cluster deployment

- Unzip registry-all.tgz and modify the configuration file
  Cluster deployment, that is, to build a cluster of 2 or more, it is recommended to use at least 3 (note: currently does not support the deployment of multiple SOFARegistry on the same machine, so you must have 3 different machines). The deployment method on each machine is the same as above:

```bash
cp ./server/distribution/all/target/registry-all.tgz <somewhere>
cd <somewhere>
tar -zxvf registry-all.tgz
cd registry-all
```

Application.properties configuration, multiple machines forming the same registry need to be configured with the same database and `nodes.localDataCenter`

```bash
nodes.localDataCenter=DefaultDataCenter
nodes.localRegion=DEFAULT_ZONE
jdbc.url = jdbc:mysql://127.0.0.1:3306/registrymetadb?useUnicode=true&characterEncoding=utf8
jdbc.username = root
jdbc.password = root
```

#### 7.1.1 meta deployment

```bash
sh bin/meta/start.sh
```

#### 7.1.2 data deployment

```bash
sh bin/data/start.sh
```

#### 7.1.3 session deployment

```bash
sh bin/session/start.sh
```

### 7.2 Docker cluster deployment

The client and SOFARegistry need to be in the same three-layer network, so deploying with docker requires the use of host network
It can be deployed by mounting configuration files, or by passing environment variables
At the same time, you need to add REGISTRY_APP_NAME=integration to enter the integration mode and start 3 roles in a jvm

In the image, the decompression address of registry-all.tgz is in `registry-distribution/registry-all`, the configuration needs to be mounted to the correct directory

#### 7.2.1 Meta start

```bash
docker run -e REGISTRY_APP_NAME=meta \
  --name=sofa-registry --rm --net=host \
  -v $PWD/conf/:/registry-distribution/registry-all/conf/ \
  -e JDBC_URL=jdbc:mysql://172.17.0.1:3306/registrymetadb
  -e JDBC_USERNAME=root
  -e JDBC_PASSWORD=root
  sofaregistry/sofaregistry:6.1.4
```

#### 7.2.2 Data start

```bash
docker run -e REGISTRY_APP_NAME=data \
  --name=sofa-registry --rm --net=host \
  -v $PWD/conf/:/registry-distribution/registry-all/conf/ \
  -e JDBC_URL=jdbc:mysql://172.17.0.1:3306/registrymetadb
  -e JDBC_USERNAME=root
  -e JDBC_PASSWORD=root
  sofaregistry/sofaregistry:6.1.4
```

#### 7.2.3 Session start

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

SOFARegistry uses kustomize for configuration rendering
Download source code

```bash
git clone git@github.com:sofastack/sofa-registry.git
```

configmap-patch.yaml and db-secret-patch.yaml are the configuration passed to each role
Modify the corresponding configuration and use kustomize to render the yaml used for deployment

```bash
kustomize build docker/kube/sofa-registry/overlays/standalone-dc2
```

At the same time, you need to apply for loadbalancer to mount port 9603 of session ip

## 8. Status check

Confirm the running status: For each machine, you can access the health monitoring api provided by the three roles, or view the logs _logs/registry-startup.log_

```bash
# View the health detection interface of the meta role: (3 machines, 1 is Leader, and the other 2 are Followers)
$ curl http://$META_IP:9615/health/check
{"success":true,"message":"..."}

# View the health detection interface of the data role:
$ curl http://$DATA_IP:9622/health/check
{"success":true,"message":"..."}

# View the health detection interface of the session role:
$ curl http://$SESSION_IP:9603/health/check
{"success":true,"message":"..."}
```
