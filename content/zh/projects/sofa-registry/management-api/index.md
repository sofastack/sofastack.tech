---
title: "运维命令"
aliases: "/sofa-registry/docs/Management-API"
---

## 1. registry-meta

### 1.1 推送开关

在注册中心新版本发布的过程中为了把对业务的影响减少到最小，避免服务端重启动引发大规模服务地址信息变更产生大量推送，我们提供运维层面暂时关闭推送的能力。在服务端完成发布后，可以打开推送恢复正常工作状态，在关闭期间的数据订阅和服务发布信息会再次进行全局推送进行补偿。

打开推送：

```shell
curl "http://<meta_ip>:9615/stopPushDataSwitch/close"
```

关闭推送：

```shell
curl "http://<meta_ip>:9615/stopPushDataSwitch/open"
```

### 1.2 查询地址列表

查看 meta 集群的地址列表：

```shell
curl "http://<meta_ip>:9615/digest/META/node/query"
```

查看 data 集群的地址列表：

```shell
curl "http://<meta_ip>:9615/digest/DATA/node/query"
```

查看 session 集群的地址列表：

```shell
curl "http://<meta_ip>:9615/digest/SESSION/node/query"
```

## 2. registry-data

### 2.1 查询数据

查看 pub 数量：

```shell
curl "http://<data_ip>:9622/digest/datum/count"
```

根据客户端的 ip&port 查询其发布的数据：

```shell
curl -X POST "http://<data_ip>:9622/digest/connect/query" -H "Content-Type: application/json" -d '{"<clientIP>":"<client端口>"}'
```

## 3. registry-session

### 3.1 查询数据

根据客户端的 ip&port 查询其发布的数据：

```shell
curl -X POST "http://<session_ip>:9603/digest/pub/connect/query" -H "Content-Type: application/json" -d '["<clientIP>:<client端口>"]'
```

根据客户端的 ip&port 查询其订阅的数据：

```shell
curl -X POST "http://<session_ip>:9603/digest/sub/connect/query" -H "Content-Type: application/json" -d '["<clientIP>:<client端口>"]'
```

### 3.2 断开客户端链接：clientOff

根据客户端的 ip&port 强制删除其所有 sub&pub 数据（但不会断开连接）：

```shell
curl -X POST "http://<session_ip>:9603/api/clients/off" -H "Content-Type: application/json" -d '{"connectIds": ["<clientIP>:<client端口>"]}'
```
