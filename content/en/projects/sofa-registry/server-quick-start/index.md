---

title: "Server deployment"
aliases: "/sofa-registry/docs/Server-QuickStart"
---

## Local development

Starting SOFARegistry locally is to use the H2 database as the configuration database used by the registry, which can be started directly
`com.alipay.sofa.registry.server.integration.RegistryApplication#main`

By default, `application-dev.properties` will be used as the configuration file

## Deployment

The deployment of SOFARegistry relies on mysql, which uses mysql as the metadata storage of the registry itself
SOFARegistry supports two types of deployment modes, which are integrated deployment and independent deployment. This topic describes the simplest integrated single-node deployment. For more information about deployment modes, see the [Deployment topic](../deployment).

## Deployment steps

### 1. Download the source code or installation package

#### Download the source code

```bash
git clone https://github.com/sofastack/sofa-registry.git
cd sofa-registry
 mvn clean package -Dmaven.test.skip=true
cp ./server/distribution/all/target/registry-all.tgz <somewhere>
cd <somewhere>
tar -zxvf registry-all.tgz
cd registry-all
```

#### Download the installation package

You can download the latest registry-all.tgz package from [Releases](https://github.com/sofastack/sofa-registry/releases).

**recommended to download v6 or above**

```bash
tar -zxvf registry-all.tgz
cd registry-all
```

### 2. Start registry-integration

2.1 If you start the development registry locally, you can use h2 as the database

IDEA source code startup: run com.alipay.sofa.registry.server.integration.RegistryApplication#main

Fat jar script start command: `sh bin/start_dev.sh`

2.2 MySQL is recommended for the official environment
Create database and table

```bash
echo "create database registrymetadb " | mysql -u username -p
mysql -u username -p registrymetadb < create_table.sql
```

Modify the configuration in `conf/application.properties`, the database password can also be passed in through the `JDBC_PASSWORD` environment variable

Start command: `sh bin/integration/start.sh`

### 3. Check the running status

You can access the healthcheck API provided by these three roles, or view logs/registry-startup.log to check the running status.

```bash
# View the healthcheck API of the meta role:
$ curl http://localhost:9615/health/check
{"success":true,"message":"... raftStatus:Leader"}

# View the healthcheck API of the data role:
$ curl http://localhost:9622/health/check
{"success":true,"message":"... status:WORKING"}

# View the healthcheck API of the session role:
$ curl http://localhost:9603/health/check
{"success":true,"message":"..."}
```
