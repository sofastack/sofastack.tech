---
title: "Server 配置说明"
---

本文是关于 MOSN server 配置的说明。

虽然 MOSN 的配置结构里 `servers` 是一个 server 数组，但是目前最多只支持配置一个server。

`server` 描述的 MOSN 的基本的全局参数如下所示。

```josn
{
  "default_log_path":"",
  "default_log_level":"",
  "global_log_roller":"",
  "graceful_timeout":"",
  "processor":"",
  "listeners":[]
}
```

## default_log_path

默认的错误日志文件路径，支持配置完整的日志路径，以及标准输出（stdout）和标准错误（stderr）。

- 如果配置为空，则默认输出到标准错误（stderr）。

## default_log_level

默认的错误日志级别，支持`DEBUG`、`INFO`、`WARN`、`ERROR`、`FATAL`。

- 如果配置为空，则默认为 `INFO`。

## global_log_roller

- 日志轮转配置，会对所有的日志生效，如 tracelog、accesslog、defaultlog。
- 字符串配置，支持两种模式的配置，一种是按时间轮转，一种是按日志大小轮转。同时只能有一种模式生效。
- 按照日志大小轮转
  - size， 表示日志达到多少 M 进行轮转。
  - age，表示最多保存多少天的日志。
  - keep，表示最多保存多少个日志。
  - compress，表示日志是否压缩，on 为压缩，off 为不压缩。

```
"global_log_roller": "size=100 age=10 keep=10 compress=off"
```

- 按照时间轮转
  - time，表示每个多少个小时轮转一次。

```
"global_log_roller":"time=1"
```

## graceful_timeout

- [Duration String ](../../custom#duration-string)的字符串配置，表示 MOSN 在进行平滑升级时，等待连接关闭的最大时间。
- 如果没有配置，默认为 30s。

### processor

MOSN 使用的 `GOMAXPROCS` 数量
- 如果没有配置，默认为 CPU 数量。
- 如果配置为 0，等价于没有配置。

## Listeners

一组 [Listener](../../listener/overview) 的配置。