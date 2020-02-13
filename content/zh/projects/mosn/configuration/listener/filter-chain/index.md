---
title: "FilterChain 配置"
---

本文描述的是 MOSN 的 FilterChain 配置。

FilterChain 是 MOSN Listener 配置中核心逻辑配置，不同的 FilterChain 配置描述了 Listener 会如何处理请求。

目前 MOSN 一个 Listener 只支持一个 FilterChain。

FilterChain 的配置结构如下所示。

```json
{
  "tls_context": {},
  "tls_context_set": [],
  "filters": []
}
```

### tls_context_set

- 一组 `tls_context` 配置，MOSN 默认使用 `tls_context_set` 来描述 listener 的 TLS 的证书信息。
- 一个 listener 可同时支持配置多张 TLS 证书。

### tls_context

- 单独配置 `tls_context` 而不是使用 `tls_context_set` 是兼容 MOSN 历史配置（只支持一张证书配置时）的场景，这种配置方式后面会逐步废弃。
- tls_context 的详细配置说明，参考 [tls_context](../../custom#tls-context)。

### filters

一组 network filter 配置。

### network filter

network filter 描述了 MOSN 在连接建立以后如何在 4 层处理连接数据。

```json
{
  "type":"",
  "config": {}
}
```

- type 是一个字符串，描述了 filter 的类型。
- config 可以是任意 json 配置，描述不同 filter 的配置。
- network filter 可自定义扩展实现，默认支持的 type 包括 `proxy`、`tcp proxy`、`connection_manager`。
  - `connection_manager` 是一个特殊的 network filter，它需要和 `proxy` 一起使用，用于描述 `proxy` 中路由相关的配置，是一个兼容性质的配置，后续可能有修改。