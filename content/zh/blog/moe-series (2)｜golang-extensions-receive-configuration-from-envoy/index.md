文｜朱德江（GitHub ID：doujiang24)

MOSN 项目核心开发者

蚂蚁集团技术专家

![图片](https://mmbiz.qpic.cn/mmbiz_png/nibOZpaQKw08VNbtYZicic5Nog5MV3VxrPUbpSOe4Pn693qzEiacbqxwuqcyhl24RbPibibbgxhIwZmRG36CzjZicDRUA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

*专注于云原生网关研发的相关工作*

**本文 1445  字 阅读 5** **分钟**

[*上一篇*](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247532898&idx=1&sn=26fcd50a6a50666a563bf8feede16959&chksm=faa3aeb8cdd427aeadc7fa02598b2d177e8b2fb239261f917fe4e4ab65ab07bac3851796429f&scene=21#wechat_redirect)我们用一个简单的示例，体验了用 Golang 扩展 Envoy 的极速上手。

*这次我们再通过一个示例，来体验 Golang 扩展的一个强大的特性：*

***从 Envoy 接收配置***。

Basic Auth

我们还是从一个小示例来体验，这次我们实现标准的 Basic Auth 的认证，与上一次示例不同的是，这次认证的用户密码信息，需要从 Envoy 传给 Go，不能在 Go 代码中写死了。

完整的代码可以看 example-basic-auth[1]，下面我们展开介绍一番。

获取配置

为了更加灵活，在设计上，Envoy 传给 Go 的配置是 Protobuf 的 Any 类型，也就是说，配置内容对于 Envoy 是透明的，我们在 Go 侧注册一个解析器，来完成这个 Any 配置的解析。

如下示例：

```
func init() {
  // 注册 parser
  http.RegisterHttpFilterConfigParser(&parser{})
}

func (p *parser) Parse(any *anypb.Any) interface{} {
  configStruct := &xds.TypedStruct{}
  if err := any.UnmarshalTo(configStruct); err != nil {
    panic(err)
  }

  v := configStruct.Value
  conf := &config{}
  if username, ok := v.AsMap()["username"].(string); ok {
    conf.username = username
  }
  if password, ok := v.AsMap()["password"].(string); ok {
    conf.password = password
  }
  return conf
}
```

这里为了方便，Any 中的类型是 Envoy 定义的 TypedStruct 类型，这样我们可以直接使用现成的 Go pb 库。

值得一提的是，这个配置解析，只有在首次加载的时候需要执行，后续在 Go 使用的是解析后的配置，所以，我们解析到一个 Go map 可以拥有更好的运行时性能。

同时，由于 Envoy 的配置，也是有层级关系的，比如 http-filter, virtual host, router, virtual clusters 这四级，我们也支持这四个层级同时有配置，在 Go 侧来组织 merge。

当然，这个只有在 Go 侧有复杂的 filter 组织逻辑的时候用得上，后面我们在 MOSN 的上层封装的时候，可以看到这种用法，这里暂时不做展开介绍。

认证

具体的 Basic Auth 认证逻辑，我们可以参考 Go 标准 net/http 库中的 Basic Auth 实现。

```
func (f *filter) verify(header api.RequestHeaderMap) (bool, string) {
  auth, ok := header.Get("authorization")
  if !ok {
    return false, "no Authorization"
  }
  username, password, ok := parseBasicAuth(auth)
  if !ok {
    return false, "invalid Authorization format"
  }
  if f.config.username == username && f.config.password == password {
    return true, ""
  }
  return false, "invalid username or password"
}
```

这里面的 `parseBasicAuth` 就是从 net/http 库中的实现，是不是很方便呢。

配置

简单起见，这次我们使用本地文件的配置方式。如下是关键的配置：

```
http_filters:
  - name: envoy.filters.http.golang
    typed_config:
      "@type": type.googleapis.com/envoy.extensions.filters.http.golang.v3alpha.Config
      library_id: example
      library_path: /etc/envoy/libgolang.so
      plugin_name: basic-auth
      plugin_config:
        "@type": type.googleapis.com/xds.type.v3.TypedStruct
        value:
          username: "foo"
          password: "bar"
```

这里我们配置了用户名密码：`foo:bar`。

预告一下，下一篇我们会体验通过 Istio 来推送配置，体会一番动态更新配置的全流程。

测试

编译，运行，跟上篇一样，我们还是使用 Envoy 官方提供的镜像即可。

跑起来之后，我们测试一下：

```
$ curl -s -I 'http://localhost:10000/'
HTTP/1.1 401 Unauthorized

# invalid username:password
$ curl -s -I 'http://localhost:10000/' -H 'Authorization: basic invalid'
HTTP/1.1 401 Unauthorized

# valid foo:bar
$ curl -s -I 'http://localhost:10000/' -H 'Authorization: basic Zm9vOmJhcg=='
HTTP/1.1 200 OK
```

是不是很简单呢，一个标准的 Basic Auth 扩展就完成了。

总结

Envoy 是面向云原生的架构设计，提供了配置动态变更的机制，Go 扩展可以从 Envoy 接受配置，也就意味着 Go 扩展也可以很好的利用这套机制。

Go 扩展的开发者，不需要关心配置的动态更新，只需要解析配置即可，非常的方便~

下一篇我们会介绍，配合 Istio 来动态更新用户名密码，体验一番云原生的配置变更体验。

后续还有更多 Golang 扩展的特性介绍，原理解析，以及，更上层的 MOSN 集成体验，欢迎持续关注。

[1]example-basic-auth：

*[https://github.com/doujiang24/envoy-go-filter-example/tree/master/example-basic-auth](https://github.com/doujiang24/envoy-go-filter-example/tree/master/example-basic-auth)*

**了解更多…**

**MOSN Star 一下✨：**
[*https://github.com/mosn/mosn*
