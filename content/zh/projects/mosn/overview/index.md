---
title: "MOSN 介绍"
aliases: "/sofa-mosn/docs/Home"
---

**MOSN 的官方网站 [mosn.io](http://mosn.io) 正在建设中，文档临时托管在这里。**

MOSN 是一款使用 Go 语言开发的网络代理软件，作为云原生的网络数据平面，旨在为服务提供多协议，模块化，智能化，安全的代理能力。MOSN 是 Modular Open Smart Network-proxy 的简称。MOSN 可以与任何支持 xDS API 的 Service Mesh 集成，亦可以作为独立的四、七层负载均衡，API Gateway，云原生 Ingress 等使用。

## 快速开始

请参考[快速开始](../quick-start-setup)。

## 核心能力

+ Istio集成
    + 集成 Istio 1.0 版本与 V4 API，可基于全动态资源配置运行
+ 核心转发
    + 自包含的网络服务器
    + 支持 TCP 代理
    + 支持 TProxy 模式
+ 多协议
    + 支持 HTTP/1.1，HTTP/2
    + 支持 SOFARPC
    + 支持 Dubbo 协议（开发中）
+ 核心路由
    + 支持 Virtual Host 路由
    + 支持 Headers/URL/Prefix 路由
    + 支持基于 Host Metadata 的 Subset 路由
    + 支持重试
+ 后端管理&负载均衡
    + 支持连接池
    + 支持熔断
    + 支持后端主动健康检查
    + 支持 Random/RR 等负载策略
    + 支持基于 Host Metadata 的 Subset 负载策略
+ 可观察性
    + 观察网络数据
    + 观察协议数据
+ TLS
    + 支持 HTTP/1.1 on TLS
    + 支持 HTTP/2.0 on TLS
    + 支持 SOFARPC on TLS
+ 进程管理
    + 支持平滑 reload
    + 支持平滑升级
+ 扩展能力
    + 支持自定义私有协议
    + 支持在 TCP IO 层，协议层面加入自定义扩展

## 社区

MOSN 仍处在初级阶段，有很多能力需要补全，所以我们欢迎所有人参与进来与我们一起共建。

如有任何疑问欢迎[提交 Issue](https://github.com/mosn/mosn/issues)。
