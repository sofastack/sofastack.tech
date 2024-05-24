---
title: "应用面板"
aliases: "/sofa-dashboard/docs/DashboardClient"
---

SOFADashboard 支持查看应用的 IP、端口、健康检查状态等基本信息。此功能依赖 SOFADashboard client ，如果一个应用需要将应用信息展示到 SOFADashboard 管控端，可以通过引入客户端依赖即可：

```xml
<denpendency>
    <groupId>com.alipay.sofa</groupId>
    <artifactId>dashboard-client-sofa-boot-starter</artifactId>
</denpendency>
```

除此之外，SOFADashboard 解耦了类似于 SpringBoot Admin 客户端和服务端直连的模式，引入了第三方的储存，目前默认是 redis，因此如果希望能够监控 更多 actuator 信息，可以添加如下依赖：

```xml
<denpendency>
     <groupId>com.alipay.sofa</groupId>
    <artifactId>dashboard-ext-redis-store</artifactId>
</denpendency>
```

## 功能展示

相关数据的展示采用了 [react-json-view](https://github.com/mac-s-g/react-json-view) 组件，是的可以直观的看到原始数据集。

### 应用维度展示

![client-func](https://gw.alipayobjects.com/mdn/rms_9959bb/afts/img/A*E8ChTaYjMzMAAAAAAAAAAABkARQnAQ)

### 应用实例

![](https://gw.alipayobjects.com/mdn/rms_9959bb/afts/img/A*yx95SKUM_DAAAAAAAAAAAABkARQnAQ)

### 基础信息

![](https://gw.alipayobjects.com/mdn/rms_9959bb/afts/img/A*gANQSYu1Vx0AAAAAAAAAAABkARQnAQ)

健康检查详细数据
![](https://gw.alipayobjects.com/mdn/rms_9959bb/afts/img/A*ol2GRInEdS0AAAAAAAAAAABkARQnAQ)

### 环境变量

![](https://gw.alipayobjects.com/mdn/rms_9959bb/afts/img/A*auCST4IAN44AAAAAAAAAAABkARQnAQ)

### loggins

![](https://gw.alipayobjects.com/mdn/rms_9959bb/afts/img/A*8mGtS4Sx55EAAAAAAAAAAABkARQnAQ)

### mappings

![](https://gw.alipayobjects.com/mdn/rms_9959bb/afts/img/A*jGWjT7ZU3dMAAAAAAAAAAABkARQnAQ)

## 配置

**client , prefix : com.alipay.sofa.dashboard.client**

| 属性                  | 名称                | 默认值 | 备注 |
| ----                 | ----                | ---- | -----|
| enable               | 是否可用             | true |  当开启时，dashboard client 的相应功能才会作用|
| instanceIp           | 指定当前实例的 IP 地址  | "" | 一般用于测试或者需要指定 IP 的场景  |
| storeInitDelayExp    | 初始上报延迟          |  30s | Dashboard 度量数据存储上报延迟期望(s) |
| storeUploadPeriodExp | 上报周期 | 60s       | Dashboard 度量数据存储上报周期(s) |
| virtualHost         | 虚拟地址             | "" | 服务发布虚拟 host（同 SofaRpc 中相同定义），可使用-Dcom.alipay.sofa.rpc.virtual.host 引入|
| virutalPort         | 虚拟端口             | "" | 服务发布虚拟 port（同 SofaRpc 中相同定义），可使用-Dcom.alipay.sofa.rpc.virtual.port 引入|
| internalHost        | 内部地址             | "" | 容器内部地址（例如 podIp 等)，可使用-Dcom.alipay.sofa.rpc.virtual.internal.host 引入|
| arkEnable           | 是否启用 ark 管理      |true | 当开启时，dashboard client 的相应功能才会作用|

注：virtualHost，virutalPort 如果通过 com.alipay.sofa.rpc 指定了相应参数，则不需要通过 dashborad 再次指定

**zookeeper , prefix : com.alipay.sofa.dashboard.zookeeper**

| 属性                  | 名称                | 默认值 | 备注 |
| ----                 | ----                | ---- | -----|
| address               | 地址             | true |  |
| baseSleepTimeMs           | 客户端错误重试间隔(ms).  | 1000 |   |
| maxRetries    | 客户端最大重试次数          |  3 |  |
| sessionTimeoutMs | 客户端会话超时时间(ms) | 6000      | |
| connectionTimeoutMs | 客户端超时时间(ms) | 6000       |  |

**redis , prefix : com.alipay.sofa.dashboard.redis**

| 属性                  | 名称                | 默认值 | 备注 |
| ----                 | ----                | ---- | -----|
| enble               | 是否可用            | true | 当开启时，dashboard 会使用 redis 作为存储 |
| recordTtl           | 上报周期(ms).  | 3600 |   |
| url    | redis 对应 url          |   | 例如：redis://user:password@example.com:6379 |
| host | redis 对应 host（单实例模式） |       | |
| port | redis 对应 port（单实例模式） |       |  |
| password | redis 密码 |                     |  |
| Sentinel.master | Sentinel 模式 master |        | master 节点名，需参阅集群搭建设置 |
| Sentinel.nodes | Sentinel 模式节点地址 |        |  例如 host1:port1;host2:port2;host3:port3   |
| Cluster.nodes | Cluster 模式节点地址 |        |  例如 host1:port1;host2:port2;host3:port3  |
| Cluster.maxRedirects | Cluster 模式重定向次数 |   0    |  建议给值，例如 10 |
