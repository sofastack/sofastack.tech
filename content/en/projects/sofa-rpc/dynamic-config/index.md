---
title: "Dynamic Configuration Center (Zookeeper & Nacos)"
aliases: "/sofa-rpc/docs/Dynamic-Config"
---

SOFARPC supports **interface-level dynamic configuration** based on Zookeeper and Nacos since v5.14.0, allowing you to dynamically adjust service publishing and reference configuration parameters at runtime without restarting the application.

## Features

- **Interface-level granularity**: Dynamically adjust configuration for specific interfaces without affecting others
- **Runtime生效**: Configuration changes are pushed in real-time and take effect automatically
- **Zookeeper and Nacos support**: Two mainstream dynamic configuration centers
- **Adjustable parameters**: Supports dynamic adjustment of timeout, weight, load balancing strategy, etc.

## Using Zookeeper as Dynamic Configuration Center

### Dependency

Ensure the Zookeeper client dependency is included:

```xml
<dependency>
    <groupId>com.alipay.sofa</groupId>
    <artifactId>sofa-rpc-all</artifactId>
    <version>5.14.0+</version>
</dependency>
```

### Configuration

Add the Zookeeper dynamic configuration center address in SOFABoot properties:

```properties
com.alipay.sofa.rpc.dynamic.config.address=zookeeper://127.0.0.1:2181
```

Or configure in XML:

```xml
<sofa:dynamic-config protocol="zookeeper" address="127.0.0.1:2181"/>
```

### Dynamic Configuration Example

Modify interface configuration via Zookeeper client:

```bash
# Set timeout for a specific interface
zkCli.sh set /sofa-rpc/dynamic/config/com.example.SampleService/timeout 5000

# Set weight for a specific interface
zkCli.sh set /sofa-rpc/dynamic/config/com.example.SampleService/weight 100
```

## Using Nacos as Dynamic Configuration Center

### Dependency

Ensure the Nacos client dependency is included:

```xml
<dependency>
    <groupId>com.alibaba.nacos</groupId>
    <artifactId>nacos-client</artifactId>
    <version>2.x.x</version>
</dependency>
```

### Configuration

```properties
com.alipay.sofa.rpc.dynamic.config.address=nacos://127.0.0.1:8848
com.alipay.sofa.rpc.dynamic.config.group=SOFA_RPC_GROUP
```

## Supported Dynamic Configuration Items

| Item | Description | Example |
|------|-------------|---------|
| `timeout` | Interface call timeout (milliseconds) | `5000` |
| `weight` | Service weight | `100` |
| `loadBalancer` | Load balancing strategy | `random`, `roundRobin`, `leastActive` |
| `retries` | Retry count | `2` |

## Notes

1. Dynamic configuration takes **priority** over static configuration
2. Configuration changes are auto-pushed, typically taking effect within 1-3 seconds
3. Ensure high availability of the dynamic configuration center
4. Version requirement: SOFARPC v5.14.0 or above
