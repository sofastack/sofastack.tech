---
title: "proxy"
---

proxy 是 MOSN 最常用的 network filter，其配置格式如下。

```json
{
  "downstream_protocol":"",
  "upstream_protocol":"",
  "router_config_name":"",
  "extend_config":{}
}
```

- `downstream_protocol` 描述 proxy 期望收到的请求协议，在连接收到数据时，会使用此协议去解析数据包并完成转发，如果收到的数据包协议和配置不符，MOSN 会将连接断开。
- `upstream_protocol` 描述 proxy 将以何种协议转发数据，通常情况下应该和`downstream_protocol` 保持一致，只有特殊的场景会进行对应协议的转换。
- `router_config_name` 描述 proxy 的路由配置的索引，通常情况下，这个配置会和同 listener 下的 `connection_manager` 中配置的 `router_config_name` 保持一致。
- `extend_config` 扩展配置，目前仅在 MOSN 的 `XProtocol` 协议中使用。