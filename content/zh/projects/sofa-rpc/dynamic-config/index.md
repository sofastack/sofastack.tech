---
title: "动态配置中心（Zookeeper & Nacos）"
aliases: "/sofa-rpc/docs/Dynamic-Config"
---

SOFARPC 自 v5.14.0 版本起支持基于 Zookeeper 和 Nacos 的**接口级别动态配置**能力，可以在运行时动态调整服务发布和引用的配置参数，无需重启应用。

### 功能特性

- **接口级别粒度**：针对特定接口动态调整配置，不影响其他接口
- **运行时生效**：配置变更后实时推送，自动生效
- **支持 Zookeeper 和 Nacos**：两种主流的动态配置中心
- **动态调整参数**：支持动态调整超时时间、权重、负载均衡策略等

### 使用 Zookeeper 作为动态配置中心

#### Zookeeper 依赖引入

确保项目中已包含 Zookeeper 客户端依赖：

```xml
<dependency>
    <groupId>com.alipay.sofa</groupId>
    <artifactId>sofa-rpc-all</artifactId>
    <version>5.14.0+</version>
</dependency>
```

#### Zookeeper 配置方式

在 SOFABoot 配置文件中添加 Zookeeper 动态配置中心地址：

```properties
# Zookeeper 动态配置中心地址
com.alipay.sofa.rpc.dynamic.config.address=zookeeper://127.0.0.1:2181
```

或在 XML 中配置：

```xml
<sofa:dynamic-config protocol="zookeeper" address="127.0.0.1:2181"/>
```

#### Zookeeper 动态配置示例

通过 Zookeeper 客户端修改接口配置：

```bash
# 设置某个接口的超时时间
zkCli.sh set /sofa-rpc/dynamic/config/com.example.SampleService/timeout 5000

# 设置某个接口的权重
zkCli.sh set /sofa-rpc/dynamic/config/com.example.SampleService/weight 100
```

### 使用 Nacos 作为动态配置中心

#### Nacos 依赖引入

确保项目中已包含 Nacos 客户端依赖：

```xml
<dependency>
    <groupId>com.alibaba.nacos</groupId>
    <artifactId>nacos-client</artifactId>
    <version>2.x.x</version>
</dependency>
```

#### Nacos 配置方式

```properties
# Nacos 动态配置中心地址
com.alipay.sofa.rpc.dynamic.config.address=nacos://127.0.0.1:8848
# 可选：配置 group
com.alipay.sofa.rpc.dynamic.config.group=SOFA_RPC_GROUP
```

#### 通过 Nacos 控制台管理配置

1. 登录 Nacos 控制台
2. 进入「配置管理」→「配置列表」
3. 创建配置，Data ID 格式为：`sofa-rpc.dynamic.config.{interfaceName}.{key}`
4. 配置内容直接写入配置值即可

### 支持的动态配置项

| 配置项 | 说明 | 示例值 |
|--------|------|--------|
| `timeout` | 接口调用超时时间（毫秒） | `5000` |
| `weight` | 服务权重 | `100` |
| `loadBalancer` | 负载均衡策略 | `random`, `roundRobin`, `leastActive` |
| `retries` | 重试次数 | `2` |

### 注意事项

1. 动态配置优先级**高于**静态配置
2. 配置变更后自动推送，通常在 1-3 秒内生效
3. 需要确保动态配置中心的高可用性
4. 版本要求：SOFARPC v5.14.0 及以上
