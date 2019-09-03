---

title: "Server deployment"
aliases: "/sofa-registry/docs/Server-QuickStart"
---

## Deployment

SOFARegistry supports two types of deployment modes, which are integrated deployment and independent deployment. This topic describes the simplest integrated single-node deployment. For more information about deployment modes, see the [Deployment topic](../deployment).

## Deployment steps

### 1. Download the source code or installation package.

#### Download the source code.

```bash
git clone https://github.com/sofastack/sofa-registry.git
cd sofa-registry
mvn clean package -DskipTests
cp server/distribution/integration/target/registry-integration.tgz <somewhere>
cd <somewhere> && mkdir registry-integration 
tar -zxvf registry-integration.tgz -C registry-integration
cd registry-integration
```

#### Download the installation package.

You can download the latest registry-integration-$version.tar.gz package from [Releases](https://github.com/sofastack/sofa-registry/releases).

```bash
mkdir registry-integration 
tar -zxvf registry-integration-$version.tar.gz -C registry-integration
cd registry-integration
```

### 2. Start registry-integration.

#### Linux/Unix/Mac

Startup command: `sh bin/startup.sh`

#### Windows

Double click the startup.bat file under the bin directory.

### 3. Check the running status.

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

