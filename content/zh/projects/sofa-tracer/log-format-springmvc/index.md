
---
title: "Spring MVC 日志"
aliases: "/sofa-tracer/docs/Log_Format_SpringMVC"
---


SOFATracer 集成 SpringMVC 后输出 MVC 请求的链路数据格式，默认为 `JSON` 数据格式。

### Spring MVC 摘要日志（spring-mvc-digest.log）

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
{"time":"2019-09-03 10:33:10.336","local.app":"RestTemplateDemo","traceId":"0a0fe9271567477985327100211176","spanId":"0.1","span.kind":"server","result.code":"200","current.thread.name":"http-nio-8801-exec-2","time.cost.milliseconds":"5006ms","request.url":"http://localhost:8801/asyncrest","method":"GET","req.size.bytes":-1,"resp.size.bytes":0,"sys.baggage":"","biz.baggage":""}
```

### Spring MVC 统计日志（spring-mvc-stat.log）

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
{"time":"2019-09-03 10:34:04.129","stat.key":{"method":"GET","local.app":"RestTemplateDemo","request.url":"http://localhost:8801/asyncrest"},"count":1,"total.cost.milliseconds":5006,"success":"true","load.test":"F"}
```