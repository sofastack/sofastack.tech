---
title: "RPC Call Deadline Timeout Control"
aliases: "/sofa-rpc/docs/Deadline-Usage"
---

# RPC Call Deadline Timeout Control

SOFARPC supports **Deadline** mechanism since v5.14.1, allowing you to set an absolute expiration timestamp on RPC calls, rather than just a relative timeout.

### Deadline vs Timeout

| Feature | Timeout | Deadline |
|---------|---------|----------|
| Definition | Relative duration (e.g., 3000ms) | Absolute timestamp (nanoseconds) |
| Use Case | Single call timeout control | Total time budget across service chains |
| Chain Propagation | Not automatically propagated | Automatically propagated to downstream services |
| Cascading Control | Each call timed independently | Global unified timing, prevents cascading timeout amplification |

### Use Case

When your service needs to call multiple downstream services, using Deadline ensures the total call chain duration stays within budget. For example:

- Service A calls Service B, which then calls C and D
- With Timeout: A→B sets 3s, B→C sets 2s, B→D sets 2s → total can reach 7s
- With Deadline: A sets 5s deadline → entire chain guaranteed to complete or timeout within 5s

### Code Example

#### Setting Deadline

```java
// Get deadline as current time + 5 seconds (nanosecond timestamp)
long deadline = System.nanoTime() + TimeUnit.SECONDS.toNanos(5);

// Set deadline via RpcInvokeContext
RpcInvokeContext.getContext().setRequestProp(RpcConstants.INVOKE_CTX_DEADLINE, deadline);

// Make the RPC call
SampleService service = ...;
String result = service.sayHello("world");
```

#### Propagating Deadline in Call Chain

SOFARPC automatically propagates the Deadline to downstream service calls. When a downstream service receives a request, it can check the remaining time:

```java
// Get remaining time in downstream service
Long deadline = RpcInvokeContext.getContext().getRequestProp(RpcConstants.INVOKE_CTX_DEADLINE);
if (deadline != null) {
    long remainingNs = deadline - System.nanoTime();
    if (remainingNs <= 0) {
        // Already exceeded, can reject directly
        throw new RpcException("Deadline exceeded");
    }
    // Adjust internal processing logic based on remaining time
}
```

### Configuration

The Deadline feature is enabled by default in SOFABoot. No additional configuration is needed - just set the deadline via `RpcInvokeContext` at call time.

### Notes

1. **Time Unit**: Deadline uses nanosecond timestamps from `System.nanoTime()`
2. **Propagation**: Deadline value is automatically propagated through the call chain
3. **Priority**: When both Timeout and Deadline are set, whichever fires first takes effect
4. **Version**: Requires SOFARPC v5.14.1 or above
