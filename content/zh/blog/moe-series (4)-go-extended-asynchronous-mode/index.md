---
title: "MoE 系列（四）｜Go 扩展的异步模式"
authorlink: "https://github.com/sofastack"
description: "MoE 系列（四）｜Go 扩展的异步模式"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2023-05-16T15:00:00+08:00
cover: "https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*Q_GgSKOFXIYAAAAAAAAAAAAADrGAAQ/original"
---

*在*[*《MoE 系列（三）｜使用 Istio 动态更新 Go 扩展配置》*](https://mp.weixin.qq.com/s/gvbvAZEUbjtD-UpKziHmBA)*中我们体验了用 Istio 做控制面，给 Go 扩展推送配置，这次我们来体验一下，在 Go 扩展的异步模式下，对 Goroutine 等全部 Go 特性的支持。*

**异步模式**

之前，我们实现了一个简单的 Basic Auth[1]，但是，那个实现是同步的，也就是说，Go 扩展会阻塞，直到 Basic Auth 验证完成，才会返回给 Envoy。

因为 Basic Auth 是一个非常简单的场景，用户名密码已经解析在 Go 内存中了，整个过程只是纯 CPU 计算，所以，这种同步的实现方式是没问题的。

但是，如果我们要实现一个更复杂的需求，比如，我们要将用户名密码调用远程接口查询，涉及网络操作，这个时候，同步的实现方式就不太合适了。因为同步模式下，如果我们要等待远程接口返回，Go 扩展就会阻塞，Envoy 也就无法处理其他请求了。

所以，我们需要一种异步模式：

-   我们在 Go 扩展中，启动一个 Goroutine，然后立即返回给 Envoy，当前正在处理的请求会被挂起，Envoy 则可以继续处理其他请求。
-   Goroutine 在后台异步执行，当 Goroutine 中的任务完成之后，再回调通知 Envoy，挂起的请求可以继续处理了。

注意：虽然 Goroutine 是异步执行，但是 Goroutine 中的代码，与同步模式下的代码，几乎是一样的，并不需要特别的处理。

**为什么需要**

为什么需要支持 Goroutine 等全部 Go 的特性呢？

有两方面的原因：

-   有了 Full-feature supported Go，我们可以实现非常强大、复杂的扩展。
-   可以非常方便的集成现有 Go 世界的代码，享受 Go 生态的红利。

如果不支持全部的 Go 特性，那么在集成现有 Go 代码的时候，会有诸多限制，导致需要重写大量的代码，这样，就享受不到 Go 生态的红利了。

**实现**

接下来，我们还是通过一个示例来体验，这次我们实现 Basic Auth 的远程校验版本，关键代码如下：

```bash
func (f *filter) DecodeHeaders(header api.RequestHeaderMap, endStream bool) api.StatusType {
  go func() {
    // verify 中的代码，可以不需要感知是否异步
    // 同时，verify 中是可以使用全部的 Go 特性，比如，http.Post
    if ok, msg := f.verify(header); !ok {
      f.callbacks.SendLocalReply(401, msg, map[string]string{}, 0, "bad-request")
      return
    }
    // 这里是唯一的 API 区别，异步回调，通知 Envoy，可以继续处理当前请求了
    f.callbacks.Continue(api.Continue)
  }()
  // Running 表示 Go 还在处理中，Envoy 会挂起当前请求，继续处理其他请求
  return api.Running
}
```

再来看 `verify` 的代码，重点是，我们可以在这里使用全部的 Go 特性：

```bash
// 这里使用了 http.Post
func checkRemote(config *config, username, password string) bool {
  body := fmt.Sprintf(`{"username": "%s", "password": "%s"}`, username, password)
  remoteAddr := "http://" + config.host + ":" + strconv.Itoa(int(config.port)) + "/check"
  resp, err := http.Post(remoteAddr, "application/json", strings.NewReader(body))
  if err != nil {
    fmt.Printf("check error: %v\n", err)
    return false
  }
  if resp.StatusCode != 200 {
    return false
  }
  return true
}
// 这里操作 header 这个 interface，与同步模式完全一样
func (f *filter) verify(header api.RequestHeaderMap) (bool, string) {
  auth, ok := header.Get("authorization")
  if !ok {
    return false, "no Authorization"
  }
  username, password, ok := parseBasicAuth(auth)
  if !ok {
    return false, "invalid Authorization format"
  }
  fmt.Printf("got username: %v, password: %v\n", username, password)
  if ok := checkRemote(f.config, username, password); !ok {
    return false, "invalid username or password"
  }
  return true, ""
}
```

另外，我们还需要实现一个简单的 HTTP 服务，用来校验用户名密码，这里就不展开了，用户名密码还是 `foo:bar`。

完整的代码，请移步 Github[2]。

**测试**

老规矩，启动之后，我们使用 `curl` 来测试一下：

```bash
$ curl -s -I -HHost:httpbin.example.com "http://$INGRESS_HOST:$INGRESS_PORT/status/200"
HTTP/1.1 401 Unauthorized
# valid foo:bar
$ curl -s -I -HHost:httpbin.example.com "http://$INGRESS_HOST:$INGRESS_PORT/status/200" -H 'Authorization: basic Zm9vOmJhcg=='
HTTP/1.1 200 OK
```

依旧符合预期。

**总结**

在同步模式下，Go 代码中常规的异步非阻塞也会变成阻塞执行，这是因为 Go 和 Envoy 是两套事件循环体系。

而通过异步模式，Go 可以在后台异步执行，不会阻塞 Envoy 的事件循环，这样，就可以用上全部的 Go 特性了。

由于 Envoy Go 暴露的是底层的 API，所以实现 Go 扩展的时候，需要关心同步和异步的区别。

当然，这对于普通的扩展开发而言，并不是一个友好的设计，之所以这么设计，更多是为了极致性能的考量。

大多数场景下，其实并不需要到这么极致，所以，我们会在更上层提供一种默认异步的模式。这样，Go 扩展的开发者，就不需要关心同步和异步的区别了。

下一篇我们将介绍 Envoy Go 扩展之内存安全。欢迎感兴趣的持续关注~

敬请期待：**MoE 系列（五）｜Envoy Go 扩展之内存安全**

[1]Basic Auth：

<https://uncledou.site/2023/moe-extend-envoy-using-golang-2/>

[2]Github：

<https://github.com/doujiang24/envoy-go-filter-example/tree/master/example-remote-basic-auth>
