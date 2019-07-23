---
title: "Bolt 协议"
aliases: "/sofa-rpc/docs/Bolt"
---

Bolt 协议一个基于 TCP 的自定义的协议，相比 HTTP 来说，性能更好，在蚂蚁金服内部，大量的 RPC 都是采用 Bolt 协议来进行通信：
* [基本使用](../bolt-usage)
* [调用方式](../invoke-type)
* [超时控制](../bolt-timeout)
* [泛化调用](../generic-invoke)
* [序列化协议](../serialization)
* [自定义线程池](../custom-threadpool)
