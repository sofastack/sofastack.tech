
---
title: "Dubbo 日志"
aliases: "/sofa-tracer/docs/Log_Format_Dubbo"
---

SOFATracer 集成 Dubbo 后输出请求的链路数据格式，默认为 `JSON` 数据格式。

### Dubbo 服务消费方摘要日志（dubbo-client-digest.log）

以 JSON 格式输出的数据，相应 key 的含义解释如下：

key | 表达含义
--------- | -------------
 time | 日志打印时间
 local.app | 当前应用名
 traceId | TraceId
 spanId | SpanId
 span.kind | Span 类型
 result.code | 状态码
 current.thread.name | 当前线程名
 time.cost.milliseconds | span 耗时
 protocol | 协议
 service | 服务接口
 method | 调用方法
 invoke.type| 调用类型
 remote.host | 目标主机
 remote.port | 目标端口
 local.host | 本地主机
 client.serialize.time | 请求序列化时间
 client.deserialize.time | 响应反序列化时间
 req.size.bytes | Request Body 大小
 resp.size.bytes | Response Body 大小
 error | 错误信息
 sys.baggage | 系统透传的 baggage 数据
 biz.baggage | 业务透传的 baggage 数据

样例：

```json
{"time":"2019-09-02 23:36:08.250","local.app":"dubbo-consumer","traceId":"1e27a79c156743856804410019644","spanId":"0","span.kind":"client","result.code":"00","current.thread.name":"http-nio-8080-exec-2","time.cost.milliseconds":"205ms","protocol":"dubbo","service":"com.glmapper.bridge.boot.service.HelloService","method":"SayHello","invoke.type":"sync","remote.host":"192.168.2.103","remote.port":"20880","local.host":"192.168.2.103","client.serialize.time":35,"client.deserialize.time":5,"req.size.bytes":336,"resp.size.bytes":48,"error":"","sys.baggage":"","biz.baggage":""}
```
### Dubbo 服务提供方摘要日志（dubbo-server-digest.log）

以 JSON 格式输出的数据，相应 key 的含义解释如下：

key | 表达含义
--------- | -------------
 time | 日志打印时间
 local.app | 当前应用名
 traceId | TraceId
 spanId | SpanId
 span.kind | Span 类型
 result.code | 状态码
 current.thread.name | 当前线程名
 time.cost.milliseconds | span 耗时
 protocol | 协议
 service | 服务接口
 method | 调用方法
 invoke.type| 调用类型
 local.host | 本地主机
 local.port | 本地端口
 server.serialize.time | 响应序列化时间
 server.deserialize.time | 请求反序列化时间
 req.size.bytes | Request Body 大小
 resp.size.bytes | Response Body 大小
 error | 错误信息
 sys.baggage | 系统透传的 baggage 数据
 biz.baggage | 业务透传的 baggage 数据

样例：

```json
{"time":"2019-09-02 23:36:08.219","local.app":"dubbo-provider","traceId":"1e27a79c156743856804410019644","spanId":"0","span.kind":"server","result.code":"00","current.thread.name":"DubboServerHandler-192.168.2.103:20880-thread-2","time.cost.milliseconds":"9ms","protocol":"dubbo","service":"com.glmapper.bridge.boot.service.HelloService","method":"SayHello","local.host":"192.168.2.103","local.port":"62443","server.serialize.time":0,"server.deserialize.time":27,"req.size.bytes":336,"resp.size.bytes":0,"error":"","sys.baggage":"","biz.baggage":""}
```

### Dubbo 统计日志

`stat.key` 即本段时间内的统计关键字集合，统一关键字集合唯一确定一组统计数据，包含local.app、service、和 method 字段.

<table>
   <tr>
      <td colspan="2">key</td>
      <td>表达含义</td>
   </tr>
   <tr>
      <td colspan="2">time</td>
      <td>日志打印时间</td>
   </tr>
   <tr>
      <td rowspan="3">stat.key</td>
      <td>local.app</td>
      <td>当前应用名</td>
   </tr>
   <tr>
      <td>method</td>
      <td>调用方法</td>
   </tr>
   <tr>
      <td> service </td>
      <td>服务名</td>
   </tr>
   <tr>
      <td colspan="2">count</td>
      <td>本段时间内请求次数</td>
   </tr>
   <tr>
      <td colspan="2">total.cost.milliseconds</td>
      <td>本段时间内的请求总耗时（ms）</td>
   </tr>
   <tr>
      <td colspan="2">success</td>
      <td>请求结果：Y 表示成功；N 表示失败</td>
   </tr>
   <tr>
      <td colspan="2">load.test</td>
      <td>压测标记：T 是压测；F 不是压测</td>
   </tr>
</table>

样例：

* dubbo-client-stat.log
```json
{"time":"2019-09-02 23:36:13.040","stat.key":{"method":"SayHello","local.app":"dubbo-consumer","service":"com.glmapper.bridge.boot.service.HelloService"},"count":1,"total.cost.milliseconds":205,"success":"true","load.test":"F"}
```

* dubbo-server-stat.log
```json
{"time":"2019-09-02 23:36:13.208","stat.key":{"method":"SayHello","local.app":"dubbo-provider","service":"com.glmapper.bridge.boot.service.HelloService"},"count":1,"total.cost.milliseconds":9,"success":"true","load.test":"F"}
```