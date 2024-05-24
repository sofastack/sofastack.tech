---
title: "MoE 系列（三）｜使用 Istio 动态更新 Go 扩展配置"
authorlink: "https://github.com/sofastack"
description: "MoE 系列（三）｜使用 Istio 动态更新 Go 扩展配置"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2023-05-02T15:00:00+08:00
cover: "https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*2o6cQI-j4qkAAAAAAAAAAAAADrGAAQ/original"
---

上一篇我们用 Go 扩展实现了 Basic Auth，体验了 Go 扩展从 Envoy 接受配置。

之所以这么设计，是想复用 Envoy 原有的 xDS 配置推送通道，今天我们就来体验一番，**云原生的配置变更**。

**前提准备**

这次我们需要一套 K8s 环境，如果你手头没有，推荐使用 Kind 安装一套。具体安装方式，这里就不展开了。

**安装 Istio**

我们直接安装最新版的 Istio：

```bash
# 下载最新版的 istioctl$ export ISTIO_VERSION=1.18.0-alpha.0$ curl -L https://istio.io/downloadIstio | sh -

# 将 istioctl 加入 PATH$ cd istio-$ISTIO_VERSION/$ export PATH=$PATH:$(pwd)/bin

# 安装，包括 istiod 和 ingressgateway$ istioctl install
```

是的，由于 Go 扩展已经贡献给了上游官方，Istiod（Pilot）和 Ingress Gateway 都已经默认开启了 Go 扩展，并不需要重新编译。

**Istio 配置 Ingress**

我们先用 Istio 完成标准的 Ingress 场景配置，具体可以看 Istio 的官方文档[1]。

配置好了之后，简单测试一下：

```bash
curl -s -I -HHost:httpbin.example.com "http://$INGRESS_HOST:$INGRESS_PORT/status/200"HTTP/1.1 200 OKserver: istio-envoydate: Fri, 10 Mar 2023 15:49:37 GMT
```

基本的 Ingress 已经跑起来了。

**挂载 Golang so**

之前我们介绍过，Go 扩展是单独编译为 so 文件的，所以，我们需要把 so 文件，挂载到 Ingress Gateway 中。

这里我们把上次 Basic Auth 编译出来的 libgolang.so，通过本地文件挂载进来。简单点搞，直接 edit deployment 加了这些配置：

```bash
# 申明一个 hostPath 的 volumevolumes:- name: golang-so-basic-auth  hostPath:    path: /data/golang-so/example-basic-auth/libgolang.so    type: File

# 挂载进来volumeMounts:- mountPath: /etc/golang/basic-auth.so  name: golang-so-basic-auth  readOnly: true
```

**开启 Basic Auth 认证**

Istio 提供了 EnvoyFilter CRD，所以，用 Istio 来配置 Go 扩展也比较方便，apply 这段配置，Basic Auth 就开启了。

```bash
apiVersion: networking.istio.io/v1alpha3kind: EnvoyFiltermetadata:  name: golang-filter  namespace: istio-systemspec:  configPatches:    # The first patch adds the lua filter to the listener/http connection manager  - applyTo: HTTP_FILTER    match:      context: GATEWAY      listener:        filterChain:          filter:            name: "envoy.filters.network.http_connection_manager"            subFilter:              name: "envoy.filters.http.router"    patch:      operation: INSERT_BEFORE      value: # golang filter specification       name: envoy.filters.http.golang       typed_config:          "@type": "type.googleapis.com/envoy.extensions.filters.http.golang.v3alpha.Config"          library_id: example          library_path: /etc/golang/basic-auth.so          plugin_name: basic-auth          plugin_config:            "@type": "type.googleapis.com/xds.type.v3.TypedStruct"            type_url: typexx            value:              username: foo              password: bar
```

虽然有点长，但是，也很明显，配置的用户名密码还是：`foo:bar`。

**测试**

我们测试一下：

```bash
$ curl -s -I -HHost:httpbin.example.com "http://$INGRESS_HOST:$INGRESS_PORT/status/200"HTTP/1.1 401 Unauthorized

# valid foo:bar$ curl -s -I -HHost:httpbin.example.com "http://$INGRESS_HOST:$INGRESS_PORT/status/200" -H 'Authorization: basic Zm9vOmJhcg=='HTTP/1.1 200 OK
```

符合预期。

接下来，我们改一下 EnvoyFilter 中的密码，重新 apply，再测试一下：

```bash
# foo:bar not match the new password$ curl -s -I -HHost:httpbin.example.com "http://$INGRESS_HOST:$INGRESS_PORT/status/200" -H 'Authorization: basic Zm9vOmJhcg=='HTTP/1.1 401 Unauthorized
```

此时的 Envoy 并不需要重启，新的配置就立即生效了，云原生的体验就是这么溜~

**总结**

因为 Go 扩展可以利用 Envoy 原有的 xDS 来接受配置，所以，从 Istio 推送配置也变得很顺利。

不过，Istio 提供的 EnvoyFilter CRD 在使用上，其实并不是那么方便和自然，后面我们找机会试试 Envoy Gateway，看看 K8s Gateway API 的体验如何。

至此，我们已经体验了整个 Envoy Go 的开发&使用流程，在云原生时代，人均 Golang 的背景下，相信可以很好的完成网关场景的各种定制需求。

下一篇，我们将介绍，如何在 Go 扩展中使用异步协程。这意味着，我们可以使用的是一个全功能的 Go 语言，而不是像 Go Wasm 那样，只能用阉割版的。

敬请期待：**MoE 系列（四）｜Go 扩展的异步模式**

[1]Istio 的官方文档：

[*https://istio.io/latest/docs/tasks/traffic-management/ingress/ingress-control/*](https://istio.io/latest/docs/tasks/traffic-management/ingress/ingress-control/)
