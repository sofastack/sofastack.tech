---

title: "Deployment"
aliases: "/sofa-registry/docs/Deployment"
---

## Environment preparation

To use SOFARegistry, you need to prepare the basic environment first. SOFARegistry depends on the following environment:

* Linux, UNIX, Mac, and Windows are supported.
* JDK8
* Compile it with Apache Maven 3.2.5 or later versions.

## Two deployment modes

* Integrated deployment
   * Package and integrate the three roles of meta, data, and session into one jvm, which can be deployed on a standalone machine or a cluster. The deployment is simple.
* Independent deployment
   * Deploy the meta, data, and session roles separately. You can deploy each of them on a standalone machine or a cluster. You can deploy different numbers of servers for each role as needed.
   * We recommend that you use this deployment mode in the production environment.

## Deployment steps

### 1. Download source code, and compile and package the code

#### 1.1 Download the source code

```bash
git clone https://github.com/sofastack/sofa-registry.git
cd sofa-registry
```

#### 1.2 Compile and package the code

```bash
mvn clean package -DskipTests
```

### 2. Deploy SOFARegistry

#### 2.1 Integrated deployment

Package and integrate the three roles of meta, data, and session into one jvm, which can be deployed on a standalone machine or a cluster. 

##### 2.1.1 Standalone deployment

For more information about the standalone deployment mode of integrated deployment, see [Quick start- Server deployment](../server-quick-start).

##### 2.1.2 Cluster deployment

* Decompress registry-integration.tgz and modify the configuration file.

Cluster deployment: In this mode, you need to build a cluster of two or more servers. We recommend that you use at least three servers. Note: Currently, you cannot deploy more than one SOFARegistry instance on the same server, which means you must have at least three different servers. The method for deploying SOFARegistry on each server is basically the same as that in standalone deployment:

```bash
cp server/distribution/integration/target/registry-integration.tgz <somewhere>
cd <somewhere> && mkdir registry-integration 
tar -zxvf registry-integration.tgz -C registry-integration
```

The difference is that, when you deploy each server in the cluster deployment mode, you need to modify the *conf/application.properties* configuration:

```bash
# Enter the IP addresses or hostnames of the three servers in the following fields (the hostname will be resolved to the IP address within SOFARegistry)
nodes.metaNode=DefaultDataCenter:<hostname1>,<hostname2>,<hostname3>
nodes.localDataCenter=DefaultDataCenter
nodes.localRegion=DefaultZone
```

* Start registry-integration

After modifying the configuration file for each server, you can start registry-integration as specified in Server deployment.

* Linux/Unix/Mac: sh bin/startup.sh.
* Windows: Double click the startup.bat file under the bin directory.
* Check the running status: For each server, you can access the healthcheck API provided by these three roles, or view *logs/registry-startup.log to check the running status.*

```bash
# View the healthcheck API of the meta role (one leader and two followers):
$ curl http://localhost:9615/health/check
{"success":true,"message":"... raftStatus:Leader"}

# View the healthcheck API of the data role:
$ curl http://localhost:9622/health/check
{"success":true,"message":"... status:WORKING"}

# View the healthcheck API of the session role:
$ curl http://localhost:9603/health/check
{"success":true,"message":"..."}
```

## 2.2 Independent deployment

DDeploy the meta, data, and session soles separately. Each of the roles can be deployed on a standalone machine or a cluster. You can deploy different numbers of servers for each role as needed. We recommend that you use this deployment mode in the production environment.

Next, we will describe the deployment steps of the 3-3-2 mode (three meta servers + three data servers + two session servers)

#### 2.2.1 Deploy the meta role

* Decompress the registry-meta.tgz and modify the configuration file.

Deploy the meta role on three servers. Run the following command to deploy the role on each machine:

```bash
cp server/distribution/meta/target/registry-meta.tgz <somewhere>
cd <somewhere> && mkdir registry-meta 
tar -zxvf registry-meta.tgz -C registry-meta
```

You need to modify the configuration of *conf/application.properties* when you deploy the role on each machine:

```bash
# Enter the IP addresses or hostnames of the three meta machines in the following fields (the hostname will be resolved to the IP address within SOFARegistry).
nodes.metaNode=DefaultDataCenter:<meta_hostname1>,<meta_hostname2>,<meta_hostname3>
nodes.localDataCenter=DefaultDataCenter
```

* Start registry-meta.
   * Linux/Unix/Mac: sh bin/startup.sh.
   * Windows: Double click the startup.bat file under the bin directory.
* Check the running status: For each server, you can access the healthcheck API provided by the meta role, or view logs/registry-startup.log to check the running status.

```bash
# View the healthcheck API of the meta role (one leader and two followers):
$ curl http://localhost:9615/health/check
{"success":true,"message":"... raftStatus:Leader"}
```

#### 2.2.2 Deploy the data role

* Decompress the registry-data.tgz and modify the configuration file.

Deploy the data role on three servers. Run the following command to deploy the role on each machine:

```bash
cp server/distribution/data/target/registry-data.tgz <somewhere>
cd <somewhere> && mkdir registry-data 
tar -zxvf registry-data.tgz -C registry-data
```

You need to modify the configuration of *conf/application.properties* when you deploy the role on each machine:

```bash
# Enter the IP addresses or hostnames of the three meta machines in the following fields (the hostname will be resolved to the IP address within SOFARegistry).
nodes.metaNode=DefaultDataCenter:<meta_hostname1>,<meta_hostname2>,<meta_hostname3>
nodes.localDataCenter=DefaultDataCenter
data.server.numberOfReplicas=1
```

* Restart registry-data.
   * Linux/Unix/Mac: sh bin/startup.sh.
   * Windows: Double click the startup.bat file under the bin directory.
* Check the running status: For each server, you can access the healthcheck API provided by the data role, or view *logs/registry-startup.log to check the running status.*

```bash
# View the healthcheck API of the data role:
$ curl http://localhost:9622/health/check
{"success":true,"message":"... status:WORKING"}
```

#### 2.2.2 Deploy the session role

* Decompress the registry-session.tgz and modify the configuration file.

Deploy the session role on two servers. Run the following command to deploy the role on each machine:

```bash
cp server/distribution/session/target/registry-session.tgz <somewhere>
cd <somewhere> && mkdir registry-session 
tar -zxvf registry-session.tgz -C registry-session
```

You need to modify the configuration of *conf/application.properties* when you deploy the role on each machine:

```bash
# Enter the IP addresses or hostnames of the three meta machines in the following fields (the hostname will be resolved to the IP address within SOFARegistry).
nodes.metaNode=DefaultDataCenter:<meta_hostname1>,<meta_hostname2>,<meta_hostname3>
nodes.localDataCenter=DefaultDataCenter
nodes.localRegion=DefaultZone
```

* Start registry-session
   * Linux/Unix/Mac: sh bin/startup.sh.
   * Windows: Double click the startup.bat file under the bin directory.
* Check the running status: For each server, you can access the healthcheck API provided by the session role, or view *logs/registry-startup.log to check the running status.*

```bash
# View the healthcheck API of the session role:
$ curl http://localhost:9603/health/check
{"success":true,"message":"..."}
```

