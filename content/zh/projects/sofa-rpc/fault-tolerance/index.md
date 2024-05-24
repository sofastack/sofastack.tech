
---

title: "自动故障剔除"
aliases: "/sofa-rpc/docs/Fault-Tolerance"
---

集群中通常一个服务有多个服务提供者。其中部分服务提供者可能由于网络，配置，长时间 fullgc ，线程池满，硬件故障等导致长连接还存活但是程序已经无法正常响应。单机故障剔除功能会将这部分异常的服务提供者进行降级，使得客户端的请求更多地指向健康节点。当异常节点的表现正常后，单机故障剔除功能会对该节点进行恢复，使得客户端请求逐渐将流量分发到该节点。单机故障剔除功能解决了服务故障持续影响业务的问题，避免了雪崩效应。可以减少人工干预需要的较长的响应时间，提高系统可用率。

运行机制：

* 单机故障剔除会统计一个时间窗口内的调用次数和异常次数，并计算每个服务对应 ip 的异常率和该服务的平均异常率。
* 当达到 ip 异常率大于服务平均异常率到一定比例时，会对该服务+ip 的维度进行权重降级。
* 如果该服务+ip 维度的权重并没有降为 0，那么当该服务+ip 维度的调用情况正常时，则会对其进行权重恢复。
* 整个计算和调控过程异步进行，不会阻塞调用。

单机故障剔除的使用方式如下：

```java
FaultToleranceConfig faultToleranceConfig = new FaultToleranceConfig();
        faultToleranceConfig.setRegulationEffective(true);
        faultToleranceConfig.setDegradeEffective(true);
        faultToleranceConfig.setTimeWindow(20);
        faultToleranceConfig.setWeightDegradeRate(0.5);

FaultToleranceConfigManager.putAppConfig("appName", faultToleranceConfig);
```

如上，该应用会在打开了单机故障剔除开关，每 20s 的时间窗口进行一次异常情况的计算，如果某个服务+ip 的调用维度被判定为故障节点，则会进行将该服务+ip 的权重降级为 0.5 倍。

更加详细的参数请参考[单机故障剔除参数](../configuration-fault-tolerance)。
