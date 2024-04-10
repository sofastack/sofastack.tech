
---

title: "SOFATracer 链路追踪"
aliases: "/sofa-rpc/docs/SOFATracer-Usage"
---

在 SOFARPC(5.4.0 及之后的版本) 后的版本中，我们集成了 SOFATracer 的功能，默认开启，可以输出链路中的数据信息。

默认为 `JSON` 数据格式，具体的字段含义解释如下：

## RPC 客户端 摘要日志（ rpc-client-digest.log）

* 日志打印时间
* TraceId
* SpanId
* Span 类型
* 当前 appName
* 协议类型
* 服务接口信息
* 方法名
* 当前线程名
* 调用类型
* 路由记录
* 目标 ip
* 本机 ip
* 返回码
* 请求序列化时间
* 响应反序列化时间
* 响应大小(单位 Byte)
* 请求大小(单位 Byte)
* 客户端连接耗时
* 调用总耗时
* 本地客户端端口
* 透传的 baggage 数据 (kv 格式)

样例：

```plain
{"timestamp":"2018-05-20 17:03:20.708","tracerId":"1e27326d1526807000498100185597","spanId":"0","span.kind":"client","local.app":"SOFATracerRPC","protocol":"bolt","service":"com.alipay.sofa.tracer.examples.sofarpc.direct.DirectService:1.0","method":"sayDirect","current.thread.name":"main","invoke.type":"sync","router.record":"DIRECT","remote.ip":"127.0.0.1:12200","local.client.ip":"127.0.0.1","result.code":"00","req.serialize.time":"33","resp.deserialize.time":"39","resp.size":"170","req.size":"582","client.conn.time":"0","client.elapse.time":"155","local.client.port":"59774","baggage":""}
```

## RPC  服务端 摘要日志（ rpc-server-digest.log）

* 日志打印时间
* TraceId
* SpanId
* Span 类型
* 服务接口信息
* 方法名
* 来源 ip
* 来源 appName
* 协议
* 本应用 appName
* 当前线程名
* 返回码
* 服务端线程池等待时间
* 业务处理耗时
* 响应序列化时间
* 请求反序列化时间
* 响应大小(单位 Byte)
* 请求大小(单位 Byte)
* 透传的 baggage 数据 (kv 格式)

样例：

```plain
{"timestamp":"2018-05-20 17:00:53.312","tracerId":"1e27326d1526806853032100185011","spanId":"0","span.kind":"server","service":"com.alipay.sofa.tracer.examples.sofarpc.direct.DirectService:1.0","method":"sayDirect","remote.ip":"127.0.0.1","remote.app":"SOFATracerRPC","protocol":"bolt","local.app":"SOFATracerRPC","current.thread.name":"SOFA-BOLT-BIZ-12200-5-T1","result.code":"00","server.pool.wait.time":"3","biz.impl.time":"0","resp.serialize.time":"4","req.deserialize.time":"38","resp.size":"170","req.size":"582","baggage":"",{"timestamp":"2018-05-20 17:03:05.646","tracerId":"1e27326d1526806985394100185589","spanId":"0","span.kind":"server","service":"com.alipay.sofa.tracer.examples.sofarpc.direct.DirectService:1.0","method":"sayDirect","remote.ip":"127.0.0.1","remote.app":"SOFATracerRPC","protocol":"bolt","local.app":"SOFATracerRPC","current.thread.name":"SOFA-BOLT-BIZ-12200-5-T1","result.code":"00","server.pool.wait.time":"2","biz.impl.time":"1","resp.serialize.time":"1","req.deserialize.time":"6","resp.size":"170","req.size":"582","baggage":"",{"timestamp":"2018-05-20 17:03:20.701","tracerId":"1e27326d1526807000498100185597","spanId":"0","span.kind":"server","service":"com.alipay.sofa.tracer.examples.sofarpc.direct.DirectService:1.0","method":"sayDirect","remote.ip":"127.0.0.1","remote.app":"SOFATracerRPC","protocol":"bolt","local.app":"SOFATracerRPC","current.thread.name":"SOFA-BOLT-BIZ-12200-5-T1","result.code":"00","server.pool.wait.time":"2","biz.impl.time":"0","resp.serialize.time":"1","req.deserialize.time":"4","resp.size":"170","req.size":"582","baggage":"",{"timestamp":"2018-05-20 17:04:19.966","tracerId":"1e27326d1526807046606100185635","spanId":"0","span.kind":"server","service":"com.alipay.sofa.tracer.examples.sofarpc.direct.DirectService:1.0","method":"sayDirect","remote.ip":"127.0.0.1","remote.app":"SOFATracerRPC","protocol":"bolt","local.app":"SOFATracerRPC","current.thread.name":"SOFA-BOLT-BIZ-12200-5-T1","result.code":"00","server.pool.wait.time":"2","biz.impl.time":"0","resp.serialize.time":"1","req.deserialize.time":"4","resp.size":"170","req.size":"582","baggage":""}
```

## RPC 客户端 统计日志（ rpc-client-stat.log）

* 日志打印时间
* 日志关键 key
* 方法信息
* 客户端 appName
* 服务接口信息
* 调用次数
* 总耗时
* 调用结果

样例：

```plain
{"time":"2018-05-18 07:02:19.717","stat.key":{"method":"method","local.app":"client","service":"app.service:1.0"},"count":10,"total.cost.milliseconds":17,"success":"Y"}
```

## RPC  服务端 统计日志（ rpc-server-stat.log）

* 日志打印时间
* 日志关键 key
* 方法信息
* 客户端 appName
* 服务接口信息
* 调用次数
* 总耗时
* 调用结果

样例：

```plain
{"time":"2018-05-18 07:02:19.717","stat.key":{"method":"method","local.app":"client","service":"app.service:1.0"},"count":10,"total.cost.milliseconds":17,"success":"Y"}
```
