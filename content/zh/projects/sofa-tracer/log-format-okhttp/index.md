
---
title: "OkHttp 日志"
aliases: "/sofa-tracer/docs/Log_Format_OkHttp"
---


SOFATracer 集成 OkHttp 后输出请求的链路数据格式，默认为 `JSON` 数据格式。

### OkHttp 摘要日志（okhttp-digest.log）

以 JSON 格式输出的数据，相应 key 的含义解释如下：

key | 表达含义
--------- | -------------
 time | 日志打印时间
 local.app | 当前应用名
 traceId | TraceId
 spanId | SpanId
 request.url | 请求 URL
 method | 请求 HTTP 方法
 result.code | HTTP 返回状态码
 req.size.bytes | Request Body 大小
 resp.size.bytes | Response Body 大小
 time.cost.milliseconds | 请求耗时（ms）
 current.thread.name | 当前线程名
 remote.app | 目标应用
 baggage | 透传的 baggage 数据

样例：

```json
{"time":"2019-09-03 11:35:28.429","local.app":"OkHttpDemo","traceId":"0a0fe9271567481728265100112783","spanId":"0","span.kind":"client","result.code":"200","current.thread.name":"main","time.cost.milliseconds":"164ms","request.url":"http://localhost:8081/okhttp?name=sofa","method":"GET","result.code":"200","req.size.bytes":0,"resp.size.bytes":0,"remote.app":"","sys.baggage":"","biz.baggage":""}
```

### OkHttp 统计日志（okhttp-stat.log）

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
      <td>请求结果：Y 表示成功；N 表示失败</td>
   </tr>
   <tr>
      <td colspan="2">load.test</td>
      <td>压测标记：T 是压测；F 不是压测</td>
   </tr>
</table>

样例：

```json
{"time":"2019-09-03 11:43:06.975","stat.key":{"method":"GET","local.app":"OkHttpDemo","request.url":"http://localhost:8081/okhttp?name=sofa"},"count":1,"total.cost.milliseconds":174,"success":"true","load.test":"F"}
```