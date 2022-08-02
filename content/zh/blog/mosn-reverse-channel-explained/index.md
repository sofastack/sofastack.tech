---
title: "MOSN 反向通道详解”"
authorlink: "https://github.com/sofastack"
description: "本文主要介绍之前新合入 master 分支的「反向通道」的使用场景和设计原理，欢迎大家留言探讨。"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2022-08-02T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*p9jGQ67tX30AAAAAAAAAAAAAARQnAQ"
---

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/104e584695fb43e88d707ff621bbc27e~tplv-k3u1fbpfcp-zoom-1.image)

文｜郑泽超（GitHub ID：CodingSinger )

字节跳动高级工程师

*热衷于微服务和 ServiceMesh 开源社区*

**本文 6802 字，阅读 15 分钟**

## Part.1--贡献者前言

说起来非常的抓马，当时和 MOSN 的相遇是在给于雨负责的开源项目 Dubbo-go 贡献代码那阵。在自己顺利当上了 Dubbo 开源社区的 Committer 之后，心想着能更深入的学习 Golang 语言，机缘巧合之下碰到了 MOSN 的老大哥烈元 *（也是元总领我进了 MOSN 社区的大门）* 。

作为一款目标对齐 Envoy 的高性能可扩展安全网络代理，MOSN 支持的生态能力更贴近国内互联网公司的技术栈，并且对新功能的响应也很迅速。其次 MOSN 有着很多值得借鉴的巧妙设计和进阶的使用技巧，能充分满足自己在工作之外深入学习 Golang 语言的诉求。

目前，我在社区里陆续参与了 EDF Scheduler、LAR、WRR 负载均衡、DSL 路由能力、UDS Listener、Plugin 模式的 Filter 扩展以及反向通道等一些比较大的 feature 能力建设。再次感谢雨哥、元总、鹏总、毅松等社区内一众大佬们帮我考究方案并且帮我 Review 代码。

本文主要介绍之前新合入 master 分支的「**反向通道**」的使用场景和设计原理，欢迎大家留言探讨。

### MOSN 项目概述

MOSN（Modular Open Smart Network）是一款主要使用 Go 语言开发的云原生网络代理平台，由蚂蚁集团开源并经过双 11 大促几十万容器的生产级验证，具备**高性能**、**易扩展**的特点。MOSN 可以和 Istio 集成构建 Service Mesh，也可以作为独立的四、七层负载均衡、API Gateway、云原生 Ingress 等使用。

## Part.2--MOSN 的反向通道实现

在云边协同的网络场景，通常都是单向网络，云侧节点无法主动发起连接与边缘节点通讯。这种限制虽然在极大程度上保证了边缘节点的安全，但缺点也很明显，即只允许边缘节点主动发起访问云端节点。

云边隧道旨在解决云端无法主动访问边缘节点的问题，其本质是一个反向通道 *（后文统称为反向通道）* 。通过在边缘侧主动发起建连的方式与云端节点之间构建一条专用的全双工连接，用来传输云端节点的请求数据和回传最终的响应结果。

目前例如 SuperEdge、Yurttunnel 等业界知名云边协同开源框架，对于云边通信的实现方案都是基于反向通道。

本文将着重介绍 MOSN 之上的反向通道运作流程和原理。总体架构如下所示 *(图中箭头表示 TCP 建连反向)* ：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/b410d1ad44eb4579a21295f7e5eb332a~tplv-k3u1fbpfcp-zoom-1.image)

整个运作流程可以简单概括为：

**1.** 边缘侧的 MOSN 实例 *（后文统称为 Tunnel Agent）* 在启动时 Tunnel Agent 相关服务协程。

**2.** 通过指定的静态配置或者动态服务发现方式拿到需要反向建连的公有云侧的 MOSN Server 地址列表 *（后文统称 Tunnel Server ）* ，并且建立反向连接。

**3.** 云侧的 Frontend 与 Tunnel Server 侧的转发端口进行数据交互，这部分数据会被托管到之前建立的反向连接进行发送。

**4.** 边缘节点接受到请求之后，再将请求转发给实际的后端目标节点，回包过程则远路返回。

## Part.3--反向通道启动过程

MOSN Agent 通过 ExtendConfig 特性，在 MOSN 启动时加载和完成初始化 Tunnel Agent 的工作。

ExtendConfig 中定义 AgentBootstrapConfig 结构如下：

```
type AgentBootstrapConfig struct {
	Enable bool `json:"enable"`
	// The number of connections established between the agent and each server
	ConnectionNum int `json:"connection_num"`
	// The cluster of remote server
	Cluster string `json:"cluster"`
	// After the connection is established, the data transmission is processed by this listener
	HostingListener string `json:"hosting_listener"`
	// Static remote server list
	StaticServerList []string `json:"server_list"`

	// DynamicServerListConfig is used to specify dynamic server configuration
	DynamicServerListConfig struct {
		DynamicServerLister string `json:"dynamic_server_lister"`
	}

	// ConnectRetryTimes
	ConnectRetryTimes int `json:"connect_retry_times"`
	// ReconnectBaseDuration
	ReconnectBaseDurationMs int `json:"reconnect_base_duration_ms"`

	// ConnectTimeoutDurationMs specifies the timeout for establishing a connection and initializing the agent
	ConnectTimeoutDurationMs int    `json:"connect_timeout_duration_ms"`
	CredentialPolicy         string `json:"credential_policy"`
	// GracefulCloseMaxWaitDurationMs specifies the maximum waiting time to close conn gracefully
	GracefulCloseMaxWaitDurationMs int `json:"graceful_close_max_wait_duration_ms"`

	TLSContext *v2.TLSConfig `json:"tls_context"`
}
```

**-** **ConnectionNum**：Tunnel Agent 和每个 Tunnel Server 建立的物理连接数量。

**-** **HostingListener**：指定 Agent 建立连接之后托管的 MOSN Listener，即 Tunnel Server 发来的请求会由该 Listener 托管处理。

**-** **DynamicServerListConfig**：动态 Tunnel Server 的服务发现相关配置，可通过自定义的服务发现组件提供动态的地址服务。

**-** **CredentialPolicy**：自定义的连接级别的鉴权策略配置。

**-** **TLSContext**：MOSN TLS 配置，提供 TCP 之上通信的保密性和可靠性。

针对每个远端的 Tunnel Server 实例，Agent 对应一个 AgentPeer 对象，启动时除了主动建立 ConnectionNum 个反向通信连接，还会额外建立一条旁路连接，这条旁路连接主要是用来发送一些管控参数，例如平滑关闭连接、调整连接比重。

```
func (a *AgentPeer) Start() {
	connList := make([]*AgentClientConnection, 0, a.conf.ConnectionNumPerAddress)
	for i := 0; i < a.conf.ConnectionNumPerAddress; i++ {
	  // 初始化和建立反向连接
		conn := NewAgentCoreConnection(*a.conf, a.listener)
		err := conn.initConnection()
		if err == nil {
			connList = append(connList, conn)
		}
	}
	a.connections = connList
	// 建立一个旁路控制连接
	a.initAside()
}
```

initConnection 方法进行具体的初始化完整的反向连接，采取指数退避的方式保证在最大重试次数之内建连成功。

```
func (a *connection) initConnection() error {
	var err error
	backoffConnectDuration := a.reconnectBaseDuration

	for i := 0; i < a.connectRetryTimes || a.connectRetryTimes == -1; i++ {
		if a.close.Load() {
			return fmt.Errorf("connection closed, don't attempt to connect, address: %v", a.address)
		}
		// 1. 初始化物理连接和传输反向连接元数据
		err = a.init()
		if err == nil {
			break
		}
		log.DefaultLogger.Errorf("[agent] failed to connect remote server, try again after %v seconds, address: %v, err: %+v", backoffConnectDuration, a.address, err)
		time.Sleep(backoffConnectDuration)
		backoffConnectDuration *= 2
	}
	if err != nil {
		return err
	}
	// 2. 托管listener
	utils.GoWithRecover(func() {
		ch := make(chan api.Connection, 1)
		a.listener.GetListenerCallbacks().OnAccept(a.rawc, a.listener.UseOriginalDst(), nil, ch, a.readBuffer.Bytes(), []api.ConnectionEventListener{a})
	}, nil)
	return nil
}
```

该方法主要步骤：

**1.** a.init( ) 方法会调用 initAgentCoreConnection 方法初始化物理连接并完成建连交互过程。Tunnel Server 通过 Agent 传输的元数据信息，进行管理反向连接。具体的交互过程和协议后文会细讲。

**2.** 建连成功之后，Tunnel Agent 托管 raw conn 给指定的 Listener。之后该 raw conn 的生命周期由该 Listener 全权管理，并且完全复用该 Listener 的能力。

其定义了初始化反向连接的交互流程，具体代码细节可以看：

*pkg/filter/network/tunnel/connection.go:250*，本文不展开技术细节。

## Part.4--交互过程

目前 MOSN 的反向通道只支持了 raw conn 的实现，因此定义了一套简单明了的网络通信协议。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/424250c05deb41508dd26604c51797bb~tplv-k3u1fbpfcp-zoom-1.image)

主要包括：

**-** 协议魔数：2 byte；

**-** 协议版本：1 byte；

**-** 主体结构类型：1 byte，包括初始化、平滑关闭等；

**-** 主体数据长度：2 byte；

**-** JSON 序列化的主体数据。

MOSN 反向通道完整的生命周期交互过程：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/659b51d004f24fde855e3c9655fc36e9~tplv-k3u1fbpfcp-zoom-1.image)

建连过程中由 Tunnel Agent 主动发起，并且在 TCP 连接建立成功 *（TLS 握手成功）* 之后，将反向建连的关键信息 ConnectionInitInfo 序列化并传输给对端 Tunnel Server，该结构体定义了反向通道的元数据信息。

```
// ConnectionInitInfo is the basic information of agent host,
// it is sent immediately after the physical connection is established
type ConnectionInitInfo struct {
	ClusterName      string                 `json:"cluster_name"`
	Weight           int64                  `json:"weight"`
	HostName         string                 `json:"host_name"`
	CredentialPolicy string                 `json:"credential_policy"`
	Credential       string                 `json:"credential"`
	Extra            map[string]interface{} `json:"extra"`
}
```

Tunnel Server 接受该元数据信息之后，主要工作包括：

**1.** 如果有设置自定义鉴权方式，则进行连接鉴权；

**2.** clusterManager 将该连接加入到指定的 ClusterSnapshot 并回写建连结果。

此时建连过程才算完成。

```
func (t *tunnelFilter) handleConnectionInit(info *ConnectionInitInfo) api.FilterStatus {
	// Auth the connection
	conn := t.readCallbacks.Connection()
	if info.CredentialPolicy != "" {
		// 1. 自定义鉴权操作，篇幅原因省略
	}
	if !t.clusterManager.ClusterExist(info.ClusterName) {
		writeConnectResponse(ConnectClusterNotExist, conn)
		return api.Stop
	}
	// Set the flag that has been initialized, subsequent data processing skips this filter
	err := writeConnectResponse(ConnectSuccess, conn)
	if err != nil {
		return api.Stop
	}
	conn.AddConnectionEventListener(NewHostRemover(conn.RemoteAddr().String(), info.ClusterName))
	tunnelHostMutex.Lock()
	defer tunnelHostMutex.Unlock()
	snapshot := t.clusterManager.GetClusterSnapshot(context.Background(), info.ClusterName)
	// 2. host加入到指定的cluster
	_ = t.clusterManager.AppendClusterTypesHosts(info.ClusterName, []types.Host{NewHost(v2.Host{
		HostConfig: v2.HostConfig{
			Address:    conn.RemoteAddr().String(),
			Hostname:   info.HostName,
			Weight:     uint32(info.Weight),
			TLSDisable: false,
		}}, snapshot.ClusterInfo(), CreateAgentBackendConnection(conn))})
	t.connInitialized = true
	return api.Stop
}
```

然后是通信过程，为了便于理解，以下图请求单向流转示意图举例：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7c0a6823a7244af3bd81cd47066be07f~tplv-k3u1fbpfcp-zoom-1.image)

在传统的 MOSN Sidecar 应用场景中，Frontend 发送的请求首先经过 Client-MOSN，然后通过路由模块，主动创建连接 *(虚线部分)* 并流转到对端，经由 Server-MOSN biz-listener 处理转交给 Backend。

而在云边场景的反向通道实现中，Client MOSN *(Tunnel Server)* 在接受到对端 Tunnel Agent 发起创建反向通道的请求后，即将该物理连接加入路由到对端 MOSN 的 cluster snapshot 中。从而 Frontend 的请求流量能由该反向通道流转到对端 MOSN，而因为 Tunnel Agent 侧把该连接托管给了 biz-listener，则读写处理都由 biz-listener 进行处理，biz-listener 将处理完的请求再转发给真正的 Backend 服务。

## Part.5--总结和规划

本文主要介绍了 MOSN 反向通道的实现原理和设计思路。MOSN 作为高性能的云原生网络代理，希望反向通道的能力能更加有效地支持其作为云边协同场景中承接东西向流量的职责。

当然，后续我们也会继续做一系列的拓展支持，包括但不限于：

**1.** 反向通道支持 gRPC 实现，gRPC 作为云原生时代最通用的服务通讯框架，本身内置了各种强大的治理能力；

**2.** 结合更多云原生场景，内置更加通用的 Tunnel Server 动态服务发现能力组件；

**3.** 更多的配套自动化运维和部署工具。

### 了解更多…

**MOSN Star 一下✨：**
*[https://github.com/mosn/mosn](https://github.com/mosn/mosn)*

快来和我们一起共建吧🧸

### 本周推荐阅读

Go 原生插件使用问题全解析

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/faea6f50adff43699ac7b5202692a677~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247512138&idx=1&sn=851abb8d07d47f703e33978c9c125c59&chksm=faa35f90cdd4d6869c6cd4934c042484dbe1063c3fb85462d2f33e936b96240ae33d02d18c3a&scene=21)

MOSN 构建 Subset 优化思路分享

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2862702817fd4967bd682198a2f8a5aa~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247511573&idx=1&sn=86019e1570b797f0d4c7f4aa2bcf2ad3&chksm=faa341cfcdd4c8d9aea24212d29c31f2732ec88ee65271703d2caa96dabc114e873f975fec8f&scene=21)

MOSN 文档使用指南

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9769fad083a943b78975089bf17a13c1~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247507103&idx=1&sn=e8da41af0ceaa18ae13f31ca2905da8e&chksm=faa33345cdd4ba5397a43adfe8cabdc85321d3f9f14066c470885b41e2f704ec505a9f086cec&scene=21)

MOSN 1.0 发布，开启新架构演进

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d3bda5e8349b42ac9385e9a04cb7b14e~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247506881&idx=1&sn=b61b931c11c83d3aceea93a90bbe8c5d&chksm=faa3341bcdd4bd0d1fb1348c99e7d38be2597dcb6767a68c69149d954eae02bd39bc447e521f&scene=21)

欢迎扫码关注我们的公众号：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3b0e0b3a773246fb979a9d2e3dd17efb~tplv-k3u1fbpfcp-zoom-1.image)
