
---
title: "服务器端常见数据采集协议支持"
aliases: "/sofa-lookout/docs/useguide-other-metrics-protocol-support"
---


使用 Lookout sdk 是推荐方式，当然 Lookout gateway 还支持其他协议上报。（但由于属于非标接入，细节可联系我们）

注意如果使用 **非 lookout sdk ，自己一定注意控制客户端 metrics 数量！ [**[Don't over use labels(tags)](https://prometheus.io/docs/practices/instrumentation/#do-not-overuse-labels)**]**

## 1.Promethues Push 协议写入支持

- Lookout-gateway 这里扮演的是一个 prometheus-pushgateway 角色：


```plain
echo "some_metric{k1="v1"} 3.14" | curl --data-binary \
 @- http://localhost:7200/prom/metrics/job/{job}/app/{app}/step/{step}
```

- 区别在于："[http://localhost:7200/prom/](http://localhost:7200/prom/)"，端口为`7200`，加了级主路径为`/prom`.

- 【必选】URL 路径变量 {app}  {job} 和{step}，必须要指定哦。step 单位秒，表示您定时上报的时间间隔（假如 10s 上报一次数据，那么 step=10）

- 【可选】如果和 lookout gateway 间有网络代理，建议 URL 里也附带上客户端真实 ip （如 "/ip/{ip}"）。

- 上报格式样式: 【 http_requests_total{method="post",code="200"} 1027 】，多个以换行符【'\n'】分割；

- 更多细节可以参考：[prometheus-pushgateway](https://github.com/prometheus/pushgateway)  ，你可以选择官方[对应编程语言的 SDKs](https://prometheus.io/docs/instrumenting/clientlibs/)


## 2. Lookout 自有协议写入支持

默认的收集服务和数据协议标准(即 Lookout 自有的协议支持标准)

- localhost:7200/lookout/metrics/app/{app}/step/{step}


```plain
curl -H "Content-type:text/plain"  -X POST -d 'xx' \
 localhost:7200/lookout/metrics/app/{app}/step/{step}
```

- 请求体是一种批量复合形式。内容是多条 metrics 数据以 "\t" 进行连接；


```plain
{"time":"1970-01-01T08:00:00+08:00","tags":{"k1":"v1"},"m_name":{"count":0,"rate":0.0}}
\t{"time":"1970-01-01T08:00:00+08:00","tags":{"k1":"v1"},"m_name":{"value":99.0}}
\t{"time":"1970-01-01T08:00:00+08:00","tags":{"k1":"v1"},"m_name":{"elapPerExec":0.0,"totalTime":0.0,"max":0.0}}
\t{"time":"1970-01-01T08:00:00+08:00","tags":{"k1":"v1"},"m_name":{"totalAmount":0.0,"rate":0.0,"max":0}}
```
上面内容中组成部分分别是：counter 型,gauge 型,Timer 型

- 其中单条数据结构

```plain
{
  "time": "1970-01-01T08:00:00+08:00",
  "tags": {
    "k1": "v1"
  },
  "m_name": {
    "count": 0,
    "rate": 0
  }
}
```

- tag 的 value 需要转义;

- 如果内容由进行了 snappy 压缩，需添加请求头 "Content-Encoding:snappy",且"Content-type: application/octet-stream";



## 3.OPEN TSDB 协议写入支持

- 请求 demo


```plain
curl -X POST \
 http://localhost:7200/opentsdb/api/put \
 -H 'Content-Type: application/json' \
 -H 'step: 10000' \
 -H 'app: xx' \
 -H 'X-Lookout-Token: xx' \
 -d '[{
   "metric": "xzc.cpu",
   "timestamp": 1530624430,
   "value": 30,
   "tags": {
      "host": "web02",
      "dc": "lga"
   }
}]'
```

- 注意 timestamp 的单位是秒(而且尽量是当前时间附近哦，否则不太好查询)

- post 的内容可以是一个 json 对象或 json 数组(批量模式)

- 更多细节可以参考 OpenTSDB 的 /api/put 接口 [http://opentsdb.net/docs/build/html/api_http/put.html](http://opentsdb.net/docs/build/html/api_http/put.html)


## 4.Metricbeat 写入协议支持

### （1）.metricbeat 的配置

配置文件 metricbeat.yml

```plain
output.elasticsearch:
  hosts: ['10.15.232.67:7200']
  path: /beat
```
host 是 lookout-gateway 的地址,端口是`7200`. 另外加了级主路径`/beat`;
### (2).为了符合 metrics2.0 标准，gateway 会对数据进行转换

这块后续去时序库查询，你需要关注：

- FROM:

```plain
{
  "@timestamp": "2018-03-29T08:27:21.200Z",
  "metricset": {
    "name": "network",
    "module": "system",
    "rtt": 3487
  },
  "system": {
    "network": {
      "in": {
        "errors": 0,
        "dropped": 0,
        "bytes": 0,
        "packets": 0
      },
      "out": {
        "errors": 0,
        "dropped": 0,
        "packets": 0,
        "bytes": 0
      },
      "name": "ip_vti0"
    }
  },
  "beat": {
    "name": "moby",
    "hostname": "moby",
    "version": "6.2.3"
  }
}
```

- TO:


```plain
{
  "metrics": {
    "system.network.in.out.packets": 0,
    "system.network.in.out.errors": 0,
    "system.network.in.out.dropped": 0,
    "system.network.in.out.bytes": 0,
    "system.network.in.packets": 0,
    "system.network.in.errors": 0,
    "system.network.in.bytes": 0,
    "system.network.in.dropped": 0
  },
  "tags": {
    "beat.hostname": "moby",
    "beat.name": "moby",
    "metricset.name": "network",
    "system.network.in.name": "ip_vti0",
    "metricset.module": "system",
    "metricset.rtt": 3487,
    "beat.version": "6.2.3"
  },
  "timestamp": 1522312041200
}
```


