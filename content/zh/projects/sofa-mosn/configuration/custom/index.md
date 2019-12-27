---
title: "自定义配置说明"
---

本文是对 MOSN 自定义配置的说明。

### Duration String

- 字符串，由一个十进制数字和一个时间单位后缀组成，有效的时间单位为 `ns`、`us`（或`µs`）、`ms`、`s`、`m`、`h`，例如 `1h`、`3s`、`500ms`。

### metadata

`metadata` 用于 MOSN 路由和 Cluster Host 之间的匹配。

```json
{
  "filter_metadata":{
    "mosn.lb":{}
  }
}
```

`mosn.lb` 可对应任意的 `string-string` 的内容。

### tls_context

```json
{
  "status":"",
  "type":"",
  "server_name":"",
  "ca_cert":"",
  "cert_chain":"",
  "private_key":"",
  "verify_client":"",
  "require_client_cert":"",
  "insecure_skip":"",
  "cipher_suites":"",
  "ecdh_curves":"",
  "min_version":"",
  "max_version":"",
  "alpn":"",
  "fall_back":"",
  "extend_verify":"",
  "sds_source":{}
}
```

- `status`，bool类型，表示是否开启 TLS，默认是 false。
- `type`，字符串类型，描述 tls_context 的类型。tls_context 支持扩展实现，不同的 type 对应不同的实现方式，默认实现方式对应的 type 是空字符串。
- `server_name`，当没有配置 insecure_skip 时，用于校验服务端返回证书的 hostname。作为Cluster配置时有效。
- `ca_cert`，证书签发的根 CA 证书。
- `cert_chain`，TLS 证书链配置。
- `private_key`，证书私钥配置。
- `verify_client`，bool 类型，作为 Listener 配置时有效，表示是否要校验 Client 端证书
- `require_client_cert`，bool 类型，表示是否强制 Client 端必须携带证书。
- `insecure_skip`，bool 类型，作为 Cluster 配置时有效，表示是否要忽略 Server 端的证书校验。
- `cipher_suites`，如果配置了该配置，那么 TLS 连接将只支持配置了的密码套件，并且会按照配置的顺序作为优先级使用，支持的套件类型如下：

```
ECDHE-ECDSA-AES256-GCM-SHA384
ECDHE-RSA-AES256-GCM-SHA384
ECDHE-ECDSA-AES128-GCM-SHA256
ECDHE-RSA-AES128-GCM-SHA256
ECDHE-ECDSA-WITH-CHACHA20-POLY1305
ECDHE-RSA-WITH-CHACHA20-POLY1305
ECDHE-RSA-AES256-CBC-SHA
ECDHE-RSA-AES128-CBC-SHA
ECDHE-ECDSA-AES256-CBC-SHA
ECDHE-ECDSA-AES128-CBC-SHA
RSA-AES256-CBC-SHA
RSA-AES128-CBC-SHA
ECDHE-RSA-3DES-EDE-CBC-SHA
RSA-3DES-EDE-CBC-SHA
ECDHE-RSA-SM4-SM3
ECDHE-ECDSA-SM4-SM3
```

- `ecdh_curves`，如果配置了该配置，那么 TLS 连接将只支持配置了的曲线。

- - 支持 x25519、p256、p384、p521。

- `min_version`，最低的 TLS 协议版本，默认是 TLS1.0。

- - 支持 TLS1.0、TLS1.1、TLS1.2。
  - 默认会自动识别可用的 TLS 协议版本。

- `max_version`，最高的 TLS 协议版本，默认是 TLS1.2。

- - 支持 TLS1.0、TLS1.1、TLS1.2。
  - 默认会自动识别可用的 TLS 协议版本。

- `alpn`，TLS 的 ALPN 配置。

- - 支持 h2、http/1.1、 sofa。

- `fall_back`，bool类型，当配置为 true 时，如果证书解析失败，不会报错而是相当于没有开启 TLS。
- `extend_verify`，任意 json 类型，当 type 为非空时，作为扩展的配置参数。
- `sds_source`，访问 SDS API 的配置，如果配置了这个配置，`ca_cert`、`cert_chain` 和 `private_key` 都会被忽略，但是其余的配置依然有效。

### sds_source

```json
{
  "CertificateConfig":{},
  "ValidationConfig":{}
}
```

- `CertificateConfig` 描述了如何获取 cert_chain 和 private_key 的配置。
- `ValidationConfig` 描述了如何获取 `ca_cert` 的配置。
- 详细的 Config 内容参考 [envoy: sdssecretconfig](https://www.envoyproxy.io/docs/envoy/latest/api-v2/api/v2/auth/cert.proto#envoy-api-msg-auth-sdssecretconfig)。