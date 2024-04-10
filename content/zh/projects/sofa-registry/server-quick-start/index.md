---
title: "服务端部署"
aliases: "/sofa-registry/docs/Server-QuickStart"
---

## 本地开发

在本地启动 SOFARegistry 是使用的 H2 database 作为注册中心使用的配置数据库, 可以直接启动
`com.alipay.sofa.registry.server.integration.RegistryApplication#main`

默认会使用  `application-dev.properties` 作为配置文件

## 部署模式

SOFARegistry 部署依赖 mysql, 使用 mysql 作为注册中心自身的元数据存储。

支持两种部署模式，分别是集成部署模式及独立部署模式，本文将介绍最简单的单节点集成部署模式，更多更详细的部署模式介绍可以查看 [部署文档](../deployment)。

## 部署步骤

### 1.下载源码或者安装包

#### 下载源码方式

```bash
git clone https://github.com/sofastack/sofa-registry.git
cd sofa-registry
mvn clean package -Pserver-release -Dmaven.test.skip=true
cp ./server/distribution/all/target/registry-all.tgz <somewhere>
cd <somewhere>
tar -zxvf registry-all.tgz
cd registry-all
```

#### 下载安装包方式

您可以从 [release 页面](https://github.com/sofastack/sofa-registry/releases) 下载最新的 registry-all.tgz 包 。

**建议下载 v6 以上版本**

```bash
tar -zxvf registry-all.tgz
cd registry-all
```

### 2.启动 registry-integration

2.1 如果是本地启动开发注册中心, 可以使用 h2 作为数据库

IDEA 源码启动: 运行 com.alipay.sofa.registry.server.integration.RegistryApplication#main

fat jar 脚本启动命令: `sh bin/integration/start_dev.sh`

2.2 正式环境建议使用 mysql

创建 database 和 table

```bash
echo "create database registrymetadb " | mysql -u username -p
mysql -u username -p registrymetadb < create_table.sql
```

修改 `conf/application.properties` 中的配置，数据库密码也可以通过 `JDBC_PASSWORD` 环境变量传入

启动命令: `sh bin/integration/start.sh`

### 3.确认运行状态

可访问三个角色提供的健康监测 API，或查看日志 logs/registry-startup.log：

```bash
# 查看meta角色的健康检测接口：
$ curl http://localhost:9615/health/check
{"success":true,"message":"..."}

# 查看data角色的健康检测接口：
$ curl http://localhost:9622/health/check
{"success":true,"message":"... status:WORKING"}

# 查看session角色的健康检测接口：
$ curl http://localhost:9603/health/check
{"success":true,"message":"..."}
```
