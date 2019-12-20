---
title: "Listener 配置"
---

本文描述的是 MOSN listener 配置。

- Listener 配置详细描述了 MOSN 启动时监听的端口，以及对应的端口对应不同逻辑的配置。
- Listener 的配置可以通过Listener动态接口进行添加和修改。

```json
{
  "name":"",
  "type":"",
  "address":"",
  "bind_port":"",
  "use_original_dst":"",
  "access_logs":[],
  "filter_chains":[],
  "stream_filters":[],
  "inspector":"",
  "connection_idle_timeout":""
}
```

## name

用于唯一区分 Listener，如果配置为空，会默认生成一个 UUID 作为 name。在对 Listener  进行动态更新时，使用 name 作为索引，如果 name 不存在，则是新增一个 listener，如果 name 存在则是对 listener 进行更新。

## type

标记 Listener 的类型，目前支持 `ingress` 和 `egress` 两种类型。不同 type 的 Listener 输出的 tracelog 不同。

## address

`IP:Port` 形式的字符串，Listener 监听的地址，唯一。

## bind_port

bool 类型，表示 Listener 是否会占用 address 配置的地址，通常情况下都需要配置为true。

## use_original_dst

bool 类型，用于透明代理。

## access_logs

一组 `access_log` 配置。

## filter_chains

一组 [FilterChain](../filter-chain) 配置，但是目前 MOSN 仅支持一个 `filter_chain`。

## stream_filters

一组 `stream_filter` 配置，目前只在 `filter_chain` 中配置了 filter 包含 `proxy` 时生效。

## inspector

bool 类型，当此值为 true 时，表示即便 listener 在 `filter_chain` 中配置开启了 TLS 监听，listener 依然可以处理非 TLS 的请求。

## connection_idle_timeout

[Duration String](../../custom#duration-string)，空闲连接超时配置。当 listener 上建立的连接空闲超过配置的超时时间以后，MOSN 会将此连接关闭。