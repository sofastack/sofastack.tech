
---
title: "HttpClient 日志"
aliases: "/sofa-tracer/docs/Log_Format_HttpClient"
---


SOFATracer 集成 sofa-tracer-httpclient-plugin 插件后输出 HttpClient 请求的链路数据，默认为 `JSON` 数据格式。

### HttpClient 摘要日志（httpclient-digest.log）

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
 request.url | 请求地址
 method | http method
 req.size.bytes | 请求大小
 resp.size.bytes| 响应大小
 sys.baggage | 系统透传的 baggage 数据
 biz.baggage | 业务透传的 baggage 数据

样例：

```json
{"time":"2019-09-02 23:43:13.191","local.app":"HttpClientDemo","traceId":"1e27a79c1567438993170100210107","spanId":"0","span.kind":"client","result.code":"200","current.thread.name":"I/O dispatcher 1","time.cost.milliseconds":"21ms","request.url":"http://localhost:8080/httpclient","method":"GET","req.size.bytes":0,"resp.size.bytes":-1,"remote.app":"","sys.baggage":"","biz.baggage":""}
```

备注：应用名称可以通过 `SofaTracerHttpClientBuilder` 构造 HttpClient 实例时以入参的形式传入。

### HttpClient 统计日志（httpclient-stat.log）

`stat.key` 即本段时间内的统计关键字集合，统一关键字集合唯一确定一组统计数据，包含local.app、request.url、和 method 字段.

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
      <td>request.url</td>
      <td>请求 URL</td>
   </tr>
   <tr>
      <td> method </td>
      <td>请求 HTTP 方法</td>
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
      <td>请求结果：Y 表示成功(1 开头和 2 开头的结果码算是成功的，302表示的重定向算成功，其他算是失败的)；N 表示失败</td>
   </tr>
   <tr>
      <td colspan="2">load.test</td>
      <td>压测标记：T 是压测；F 不是压测</td>
   </tr>
</table>

样例：

```json
{"time":"2019-09-02 23:44:11.785","stat.key":{"method":"GET","local.app":"HttpClientDemo","request.url":"http://localhost:8080/httpclient"},"count":2,"total.cost.milliseconds":229,"success":"true","load.test":"F"}

```

