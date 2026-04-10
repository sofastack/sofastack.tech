---
title: "RPC 调用 Deadline 超时控制"
aliases: "/sofa-rpc/docs/Deadline-Usage"
---

SOFARPC 自 v5.14.1 版本起支持 **Deadline** 机制，允许在 RPC 调用时设置一个绝对截止时间戳，而不仅仅是相对超时时间。

### Deadline vs Timeout 的区别

| 特性 | Timeout（超时） | Deadline（截止时间） |
|------|----------------|---------------------|
| 定义方式 | 相对时间（如 3000ms） | 绝对时间戳（纳秒） |
| 适用场景 | 单次调用超时控制 | 跨多个服务链路的总时间预算 |
| 链路透传 | 不自动传递 | 自动传递到下游服务 |
| 级联控制 | 每个调用独立计时 | 全局统一计时，防止级联超时放大 |

### 使用场景

当你的服务需要调用多个下游服务时，使用 Deadline 可以确保整个调用链的总耗时不超过预算。例如：

- 服务 A 调用服务 B，B 再调用 C 和 D
- 使用 Timeout：A→B 设置 3s，B→C 设置 2s，B→D 设置 2s → 总耗时可能达到 7s
- 使用 Deadline：A 设置 5s deadline → 整个链路保证在 5s 内完成或超时

### 代码示例

#### 设置 Deadline

```java
// 获取当前时间 + 5秒的 deadline（纳秒时间戳）
long deadline = System.nanoTime() + TimeUnit.SECONDS.toNanos(5);

// 通过 RpcInvokeContext 设置 deadline
RpcInvokeContext.getContext().setRequestProp(RpcConstants.INVOKE_CTX_DEADLINE, deadline);

// 发起 RPC 调用
SampleService service = ...;
String result = service.sayHello("world");
```

#### 在链路中传递 Deadline

SOFARPC 会自动将 Deadline 传递到下游服务调用中。下游服务收到请求后，会检查剩余时间：

```java
// 在下游服务中获取剩余时间
Long deadline = RpcInvokeContext.getContext().getRequestProp(RpcConstants.INVOKE_CTX_DEADLINE);
if (deadline != null) {
    long remainingNs = deadline - System.nanoTime();
    if (remainingNs <= 0) {
        // 已超时，可以直接拒绝处理
        throw new RpcException("Deadline exceeded");
    }
    // 根据剩余时间调整内部处理逻辑
}
```

### 配置说明

通过 SOFABoot XML 配置时，Deadline 功能默认启用，无需额外配置。只需要在调用时通过 `RpcInvokeContext` 设置即可。

### 注意事项

1. **时间单位**：Deadline 使用纳秒时间戳，由 `System.nanoTime()` 获取
2. **透传机制**：Deadline 值会在同一条调用链中自动传递，不需要手动在每个下游设置
3. **优先级**：当同时设置 Timeout 和 Deadline 时，以先触发的为准
4. **版本要求**：需要 SOFARPC v5.14.1 及以上版本
