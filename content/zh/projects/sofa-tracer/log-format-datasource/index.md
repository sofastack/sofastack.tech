
---
title: "DataSource 日志"
aliases: "/sofa-tracer/docs/Log_Format_Datasource"
---


SOFATracer 对标准的 JDBC 数据源进行埋点，输出 SQL 语句执行链路数据，默认日志输出为 `JSON` 数据格式。

### DataSource 摘要日志（datasource-client-digest.log）

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
 database.name | 数据库名称
 sql | sql执行语句
 connection.establish.span | sql执行建连时间
 db.execute.cost | sql执行时间
 database.type | 数据库类型
 database.endpoint | 数据库url
 sys.baggage | 系统透传的 baggage 数据
 biz.baggage | 业务透传的 baggage 数据

样例：

```json
{"time":"2019-09-02 21:31:31.566","local.app":"SOFATracerDataSource","traceId":"0a0fe91d156743109138810017302","spanId":"0.1","span.kind":"client","result.code":"00","current.thread.name":"http-nio-8080-exec-1","time.cost.milliseconds":"15ms","database.name":"test","sql":"DROP TABLE IF EXISTS TEST;
CREATE TABLE TEST(ID INT PRIMARY KEY%2C NAME VARCHAR(255));","connection.establish.span":"128ms","db.execute.cost":"15ms","database.type":"h2","database.endpoint":"jdbc:h2:~/test:-1","sys.baggage":"","biz.baggage":""}
```

### DataSource 统计日志（datasource-client-stat.log）

`stat.key` 即本段时间内的统计关键字集合，统一关键字集合唯一确定一组统计数据，包含local.app、database.name、和 sql 字段.

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
      <td>database.name</td>
      <td>数据库名称</td>
   </tr>
   <tr>
      <td>sql</td>
      <td>sql执行语句</td>
   </tr>
   <tr>
      <td colspan="2">count</td>
      <td>本段时间内sql执行次数</td>
   </tr>
   <tr>
      <td colspan="2">total.cost.milliseconds</td>
      <td>本段时间内sql执行总耗时（ms）</td>
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
{"time":"2019-09-02 21:31:50.435","stat.key":{"local.app":"SOFATracerDataSource","database.name":"test","sql":"DROP TABLE IF EXISTS TEST;
CREATE TABLE TEST(ID INT PRIMARY KEY%2C NAME VARCHAR(255));"},"count":1,"total.cost.milliseconds":15,"success":"true","load.test":"F"}
```