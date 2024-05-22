---
title: "源码解析：SOFABoot HealthCheck 机制解析"
author: "林楠"
authorlink: "https://github.com/it-linnan"
description: "源码解析 | SOFABoot HealthCheck 机制解析"
categories: "SOFAStack"
tags: [“源码解析”]
date: 2022-06-15T15:00:00+08:00
---

## 前言

> spring-boot-starter-actuator 模块为 Spring Boot 应用提供了监控能力，内置一系列健康指标，如数据源、磁盘空间等，并且允许开发者自定义健康指标。Spring Boot 提供 health 端点，将所有健康指标聚合，当应用中有一个组件状态异常，那么应用的整体状态视为 down，开发者可以访问 health 端点来了解应用当前的运行状况。

SOFABoot 基于 actuator 模块扩展了健康指标，为应用提供 SOFA 组件的健康检查能力。同时，在 Spring Boot 原生的健康检查能力基础之上，增加了 Readiness Check 的能力。在这里我们做一个区分，Spring Boot 原生的健康检查称为 Liveness Check，SOFABoot 增加的健康检查称为 Readiness Check。Liveness Check 关注应用运行是否正常，如果 Liveness 状态异常，表示这个应用已经无法对外提供服务；Readiness Check 则关注的是应用有没有启动完成，是否进入“准备就绪”状态，能否对外提供服务。

> Readiness Check 只在应用启动阶段执行一次，通过请求 readiness 端点获取就绪状态，准备就绪后流量将进入应用。Readiness Check 完成后，多次请求 readiness 端点，不会重新发起检查。因此，在运行阶段应使用 Liveness Check 检查应用健康情况。

## 总体流程

在介绍总体流程前，先看一下 SOFABoot 健康检查机制中的一些重要接口：

| 接口类 | 说明 |
| --- | --- |
| org.springframework.boot.actuate.health.HealthIndicator | Spring Boot 原生的健康检查接口，想要新增一个自定义健康指标，可以直接扩展此接口 |
| com.alipay.sofa.healthcheck.core.HealthChecker | SOFABoot 提供的健康检查接口，相比 HealthIndicator 接口，增加了一些扩展参数，如失败重试次数，超时时间等 |
| com.alipay.sofa.boot.health.NonReadinessCheck | SOFABoot 默认会将所有 HealthIndicator 和 HealthChecker 纳入 Readiness Check 中，可以实现该接口将指标项标记为不参与 Readiness Check |
| com.alipay.sofa.healthcheck.startup.ReadinessCheckCallback | SOFABoot 在 Readiness Check 之后会回调这个接口，如果想要在健康检查后做一些处理，可以直接扩展此接口 |

SOFABoot 的健康检查是基于 Spring 事件机制实现的，核心是 com.alipay.sofa.healthcheck.ReadinessCheckListener。ReadinessCheckListener 类实现了 GenericApplicationListener 接口，并监听 ContextRefreshedEvent 事件，当 Spring 上下文刷新时触发健康检查流程：

```java
public void onContextRefreshedEvent(ContextRefreshedEvent event) {
    if (applicationContext.equals(event.getApplicationContext())) {
        healthCheckerProcessor.init();
        healthIndicatorProcessor.init();
        afterReadinessCheckCallbackProcessor.init();
        readinessHealthCheck();
        readinessCheckFinish = true;
    }
}
```

1. 初始化 HealthCheckerProcessor：在 Spring 上下文中查找所有 HealthChecker 类型的 Bean；
1. 初始化 HealthIndicatorProcessor：在 Spring 上下文中查找所有 HealthIndicator 类型的 Bean，并排除掉不参与 Readiness Check 的 Bean。默认会排除 NonReadinessCheck 类型的 Bean，还可以通过参数 com.alipay.sofa.boot.excludedIndicators 配置要排除的类型；
1. 初始化 AfterReadinessCheckCallbackProcessor：在 Spring 上下文中查找所有 ReadinessCheckCallback 类型的 Bean ；
1. 执行 Readiness Check

从上文中可以看出，readinessHealthCheck 方法是 Readiness Check 的入口：

```java
public void readinessHealthCheck() {
    ......
    healthCheckerStatus = healthCheckerProcessor
                .readinessHealthCheck(healthCheckerDetails);
    ......
    healthIndicatorStatus = healthIndicatorProcessor
                .readinessHealthCheck(healthIndicatorDetails);
    ......
    if (healthCheckerStatus && healthIndicatorStatus) {
        ......
        healthCallbackStatus = afterReadinessCheckCallbackProcessor
            .afterReadinessCheckCallback(healthCallbackDetails);
    }
    determineReadinessState();
}
```

Readiness Check 的主要流程是依次执行 HealthChecker 和 HealthIndicator 的检查，如果所有健康指标状态均正常，才会执行 ReadinessCheckCallback 回调。最后聚合所有指标状态，判断应用是否准备就绪。
健康检查的核心逻辑就在三个处理器 HealthCheckerProcessor、HealthIndicatorProcessor 和 AfterReadinessCheckCallbackProcessor 中，接下来我们依次分析一下。

## HealthCheckerProcessor

首先看一下 HealthChecker 接口为开发者提了哪些方法：

| 方法签名 | 说明 |
| --- | --- |
| Health isHealthy() | 指标项检查，返回值标识指标项状态是否正常 |
| String getComponentName() | 指标项名称 |
| int getRetryCount() | 失败重试次数，在大于 0 的情况，指标项状态异常时可以重试检查。接口中提供了默认实现，返回 0，即不重试 |
| long getRetryTimeInterval() | 重试时间间隔，单位是毫秒。接口中提供了默认实现，返回 0，即不等待立刻重试 |
| boolean isStrictCheck() | 严格检查：true，使用 isHealthy() 的最终结果作为指标项的检查结果；false，则不管 isHealthy() 的最终结果是什么，都认为指标项是健康的，但会打印异常日志。接口中提供了默认实现，返回 true，即严格检查 |
| int getTimeout() | 检查超时时间，单位是毫秒。如果健康检查超时，认为指标项状态是不健康的（未知状态，UNKNOWN)。接口中提供了默认实现，返回 0 |

在初始化阶段，HealthCheckerProcessor 已经拿到 Spring 上下文中所有 HealthChecker 类型的 Bean。执行检查实际上就是遍历这些 Bean ，调用检查方法，将每个指标项的检查结果聚合到 healthMap 中，最后返回整体的健康状态。这里需要注意的是，如果有一个指标项状态异常，整体状态就认为是异常的。

```java
public boolean readinessHealthCheck(Map<String, Health> healthMap) {
    ......
    Map<String, HealthChecker> readinessHealthCheckers = healthCheckers.entrySet().stream()
        .filter(entry -> !(entry.getValue() instanceof NonReadinessCheck))
        .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
    ......
    boolean result = readinessHealthCheckers.entrySet().stream()
        .map(entry -> doHealthCheck(entry.getKey(), entry.getValue(), true, healthMap, true))
        .reduce(true, BinaryOperators.andBoolean());
    ......
    return result;
}
```

在检查之前，HealthCheckerProcessor 对 HealthChecker 做了一次过滤，排除了 NonReadinessCheck 类型的 Bean。将 HealthChecker 委托给 doHealthCheck 方法，执行具体指标项的健康检查。

> 为什么 HealthIndicatorProcessor 在初始化阶段就已经进行了过滤操作，而 HealthCheckerProcessor 的过滤操作要放到 readinessHealthCheck 方法中呢？这里我们先记下这个问题，在后续的分析中将会解答这个问题。

```java
private boolean doHealthCheck(String beanId, HealthChecker healthChecker, boolean isRetry,
                              Map<String, Health> healthMap, boolean isReadiness) {
    ......
    do {
        Future<Health> future = HealthCheckExecutor.submitTask(healthChecker::isHealthy);
        try {
            health = future.get(timeout, TimeUnit.MILLISECONDS);
        }  catch (TimeoutException e) {
            ......
            health = new Health.Builder().withException(e).status(Status.UNKNOWN).build();
        } catch (Throwable e) {
            ......
            health = new Health.Builder().withException(e).status(Status.DOWN).build();
        }
        result = health.getStatus().equals(Status.UP);
        if (result) {
            ......
            break;
        } else {
            ......
        }
        if (isRetry && retryCount < healthChecker.getRetryCount()) {
            try {
                retryCount += 1;
                TimeUnit.MILLISECONDS.sleep(healthChecker.getRetryTimeInterval());
            } catch (InterruptedException e) {
                ......
            }
        }
    } while (isRetry && retryCount < healthChecker.getRetryCount());
    healthMap.put(beanId, health);
    ......
    return !healthChecker.isStrictCheck() || result;
}
```

HealthCheckExecutor 是健康检查使用的线程池，将 HealthChecker 的 isHealthy 方法提交到线程池中执行，通过 future.get 的方式获取健康状态，同时也能够控制方法执行时间，如果超时将抛出 TimeoutException，将状态设置为 UNKNOWN。当健康状态是 DOWN 或者 UNKNOWN 时，将开始反复重试，重试前会等待一段时间，时长由 getRetryTimeInterval 方法决定，重试次数由 getRetryCount 方法决定。最后，调用 isStrictCheck 方法判断是否是严格检查，如果是严格检查，将返回最终的健康状态；如果不是严格检查，将直接返回 true。

> 1. 只有健康状态是 UP 时，才认为指标是正常的。超时的状态是 UNKNOWN，因此也认为是不健康的。
> 1. 当 HealthChecker 不是严格检查时，并不会丢弃真实的健康状况，只是使 doHealthCheck 方法的返回值为 true，使当前指标项的状态不影响应用的状态。健康状态详情会输出到日志中，同时也会原封不动放到健康检查结果集 healthMap 里，在调用 readiness 端点时能够看到原始的健康状态详情。

当 HealthChecker 未定义超时时间时，将使用健康检查默认超时时间，默认为 60 秒，可通过参数 com.alipay.sofa.healthcheck.default.timeout 进行配置

```java
@Value("${" + SofaBootConstants.SOFABOOT_HEALTH_CHECK_DEFAULT_TIMEOUT + ":"
           + SofaBootConstants.SOFABOOT_HEALTH_CHECK_DEFAULT_TIMEOUT_VALUE + "}")
private int defaultTimeout;
private boolean doHealthCheck(String beanId, HealthChecker healthChecker, boolean isRetry,
                                  Map<String, Health> healthMap, boolean isReadiness) {
    ......
    int timeout = healthChecker.getTimeout();
    if (timeout <= 0) {
        timeout = defaultTimeout;
    }
    ......
}
```

## HealthIndicatorProcessor

与 HealthCheckerProcessor 相同，在初始化阶段，HealthIndicatorProcessor 已经拿到 Spring 上下文中所有 HealthIndicator 类型的 Bean。执行检查实际上就是遍历这些 Bean ，调用检查方法，将每个指标项的检查结果聚合到 healthMap 中，返回健康状态。同样，如果有一个指标项状态异常，整体状态就认为是异常的。

```java
public boolean readinessHealthCheck(Map<String, Health> healthMap) {
    ......
    String checkComponentNames = healthIndicators.keySet().stream()
        .collect(Collectors.joining(","));
    ......
    boolean result = healthIndicators.entrySet().stream()
        .map(entry -> doHealthCheck(entry.getKey(), entry.getValue(), healthMap))
        .reduce(true, BinaryOperators.andBoolean());
    ......
    return result;
}
```

同样，将 HealthIndicator 委托给 doHealthCheck 方法，执行具体指标项的健康检查。

```java
public boolean doHealthCheck(String beanId, HealthIndicator healthIndicator,
                             Map<String, Health> healthMap) {
    ......
    try {
        Future<Health> future = HealthCheckExecutor
            .submitTask(healthIndicator::health);
        health = future.get(timeout, TimeUnit.MILLISECONDS);
        Status status = health.getStatus();
        result = status.equals(Status.UP);
        ......
        healthMap.put(getKey(beanId), health);
    } catch (TimeoutException e) {
        result = false;
        ......
    } catch (Exception e) {
        result = false;
        ......
    }
    return result;
}
```

这里的健康检查流程相对简单，将 HealthIndicator 的 health 方法提交到线程池执行，通过 future.get 的方式等待健康检查结果，超时将抛出 TimeoutException，返回 false，未超时则返回实际的健康状态。

> HealthIndicator 是 Spring Boot 原生提供的接口，因此没有做重试、严格检查等处理。

HealthIndicator 超时时间可以通过参数配置，参数名格式如下：

```properties
com.alipay.sofa.healthcheck.indicator.timeout.${beanId} = 10000
# 如数据源健康检查超时时间
com.alipay.sofa.healthcheck.indicator.timeout.dbHealthIndicator = 10000
```

未对 HealthIndicator 单独配置超时时间时，使用健康检查默认超时时间，默认为 60 秒，可通过参数 com.alipay.sofa.healthcheck.default.timeout 进行配置。

```java
@Value("${" + SofaBootConstants.SOFABOOT_HEALTH_CHECK_DEFAULT_TIMEOUT + ":"
       + SofaBootConstants.SOFABOOT_HEALTH_CHECK_DEFAULT_TIMEOUT_VALUE + "}")
private int defaultTimeout;
private boolean doHealthCheck(String beanId, HealthChecker healthChecker, boolean isRetry,
                                  Map<String, Health> healthMap, boolean isReadiness) {
    ......
    Integer timeout = environment.getProperty(
                SofaBootConstants.SOFABOOT_INDICATOR_HEALTH_CHECK_TIMEOUT_PREFIX + beanId,
                Integer.class);
    if (timeout == null || timeout <= 0) {
        timeout = defaultTimeout;
    }
    ......
}
```

## AfterReadinessCheckCallbackProcessor

在初始化阶段，AfterReadinessCheckCallbackProcessor 已经拿到 Spring 上下文中所有 ReadinessCheckCallback 类型的 Bean。这里的回调实际上是通知所有的 ReadinessCheckCallback Bean ，应用当前已处于准备就绪状态。

```java
public boolean afterReadinessCheckCallback(Map<String, Health> healthMap) {
    ......
    for (Map.Entry<String, ReadinessCheckCallback> entry : readinessCheckCallbacks.entrySet()) {
        String beanId = entry.getKey();
        if (allResult) {
            if (!doHealthCheckCallback(beanId, entry.getValue(), healthMap)) {
                ......
                allResult = false;
            }
        } else {
            ......
        }
    }
    ......
    return allResult;
}
```

与 HealthCheckerProcessor 和 HealthIndicatorProcessor 不同的是，AfterReadinessCheckCallbackProcessor 在处理时，采用的是快速失败的策略，当有一个 ReadinessCheckCallback 返回状态异常时，剩余的回调都不再执行，快速返回失败的状态。

将 ReadinessCheckCallback 委托给 doHealthCheckCallback 方法，执行具体的回调。

```java
private boolean doHealthCheckCallback(String beanId,
                                      ReadinessCheckCallback readinessCheckCallback,
                                      Map<String, Health> healthMap) {
    ......
    try {
        health = readinessCheckCallback.onHealthy(applicationContext);
        result = health.getStatus().equals(Status.UP);
        ......
    } catch (Throwable t) {
        ......
        health = new Health.Builder().down(new RuntimeException(t)).build();
        ......
    } finally {
        healthMap.put(beanId, health);
    }
    return result;
}
```

### ReadinessCheckCallback

ReadinessCheckCallback 的作用到底是什么呢？SOFABoot 内置了一个实现 RpcAfterHealthCheckCallback，我们可以通过分析这个实例了解 ReadinessCheckCallback 存在的意义。

```java
public Health onHealthy(ApplicationContext applicationContext) {
    Health.Builder builder = new Health.Builder();
    //rpc 开始启动事件监听器
    applicationContext.publishEvent(new SofaBootRpcStartEvent(applicationContext));
    //rpc 启动完毕事件监听器
    applicationContext.publishEvent(new SofaBootRpcStartAfterEvent(applicationContext));
    return builder.status(Status.UP).build();
}
```

RpcAfterHealthCheckCallback 在监听到应用准备就绪时，会发布 SofaBootRpcStartEvent 事件，事件将被 SofaBootRpcStartListener 处理：

```java
public void onApplicationEvent(SofaBootRpcStartEvent event) {
    ......
    Collection<ProviderConfig> allProviderConfig = providerConfigContainer
        .getAllProviderConfig();
    if (!CollectionUtils.isEmpty(allProviderConfig)) {
        //start server
        serverConfigContainer.startServers();
    }
    ......
        //register registry
        providerConfigContainer.publishAllProviderConfig();
    ......
}
```

SofaBootRpcStartListener 将会获取所有的服务提供者配置信息，启动 SOFARPC 服务（bolt server、REST server 等），并将服务提供者信息发布到注册中心。

我们可以总结一下， RpcAfterHealthCheckCallback 的作用就是待所有指标项检查通过，应用准备就绪后，启动 SOFARPC 服务，并向注册中心发布服务信息，此时流量才能够通过服务发现进入到应用中。如果前面的健康检查有未通过的指标项，那么 SOFARPC 服务不会启动，也不会将服务信息上报到注册中心上，从而实现了流量控制。

至此，我们分析了 Readiness Check 是如何工作的，也了解到 SOFABoot 是如何通过 Readiness Check 来控制流量。应用的健康检查实际上还包括应用运行时的 Liveness Check ，其原理与 HealthIndicatorProcessor 大致相似，具体细节不在本文讨论范围内，各位同学可阅读 HealthEndpoint 的源码。

细心的同学可能还记得，我们还遗留了一个问题没有解决，在这里我想通过 Liveness Check 的角度解答这个问题（可以先回顾一下 HealthCheckerProcessor 小节）

## Liveness Check

前文中提到，Spring Boot 原生的健康检查称为 Liveness Check，原生的健康检查能力基于 HealthIndicator 接口实现， Spring Boot 内置了一系列健康指标，如数据源、磁盘空间等。实际上在运行时，除了这些内置的健康指标，我们也希望对 SOFA 组件进行监控，因此， SOFABoot 内置了 SofaBootHealthIndicator。通过 SofaBootHealthIndicator 使 Liveness Check 具备了监控 SOFA 组件健康状态的能力。

```java
public Health health() {
    if (!readinessCheckListener.isReadinessCheckFinish()) {
        return Health
            .down()
            .withDetail(CHECK_RESULT_PREFIX,
                        SofaBootConstants.SOFABOOT_HEALTH_CHECK_NOT_READY_MSG).build();
    }
    Map<String, Health> healths = new HashMap<>();
    boolean checkSuccessful = healthCheckerProcessor.livenessHealthCheck(healths);
    if (checkSuccessful) {
        return Health.up().withDetail(CHECK_RESULT_PREFIX, healths).build();
    } else {
        return Health.down().withDetail(CHECK_RESULT_PREFIX, healths).build();
    }
}
```

SofaBootHealthIndicator 采用了一种快速失败的方式，判断 Readiness Check 是否完成，未完成表示应用还没有达到就绪状态，此时不需要重复检查，直接返回失败的状态。如果应用已准备就绪，就调用 HealthCheckerProcessor 的 livenessHealthCheck 方法发起一次检查。

```java
public boolean livenessHealthCheck(Map<String, Health> healthMap) {
    ......
    boolean result = healthCheckers.entrySet().stream()
        .map(entry -> doHealthCheck(entry.getKey(), entry.getValue(), false, healthMap, false))
        .reduce(true, BinaryOperators.andBoolean());
    ......
    return result;
}
```

在 livenessHealthCheck 方法中同样使用了 HealthCheckerProcessor 初始化阶段从 Spring 上下文中获取的 HealthChecker Bean。Liveness Check 的主流程就是遍历这些 Bean， 委托 doHealthCheck 方法执行健康检查。
现在我们来回顾一下之前遗留的问题：

```java
public boolean readinessHealthCheck(Map<String, Health> healthMap) {
    ......
    Map<String, HealthChecker> readinessHealthCheckers = healthCheckers.entrySet().stream()
        .filter(entry -> !(entry.getValue() instanceof NonReadinessCheck))
        .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
    ......
    boolean result = readinessHealthCheckers.entrySet().stream()
        .map(entry -> doHealthCheck(entry.getKey(), entry.getValue(), true, healthMap, true))
        .reduce(true, BinaryOperators.andBoolean());
    ......
    return result;
}
```

在 readinessHealthCheck 中，首先对 HealthChecker 做了一次过滤，排除掉 NonReadinessCheck 类型的 Bean。然后再将 HealthChecker 委托给 doHealthCheck 方法，执行具体指标项的健康检查。

> 为什么 HealthIndicatorProcessor 在初始化阶段就已经进行了过滤操作，而 HealthCheckerProcessor 的过滤操作要放到 readinessHealthCheck 方法中呢？

现在可以解答这个问题了，因为 HealthIndicatorProcessor 只用于 Readiness Check，Liveness Check 是 Spring Boot 原生具备的健康检查能力，不需要借助于 HealthIndicatorProcessor。而 HealthCheckerProcessor 需要同时支持 Readiness Check 和 Liveness Check，所有的 HealthChecker 都需要参与 Liveness Check。因此不能将过滤操作提前到初始化阶段，只需要在 readinessHealthCheck 方法中排除掉 NonReadinessCheck 类型的 Bean 即可。

## 启动加速

SOFABoot 提供了并行健康检查的能力，用于加快应用启动速度。并行检查可以通过开关参数启用，参数名格式如下：

```properties
com.alipay.sofa.boot.timeout.healthCheckParallelEnable = true
```

并行检查开关开启后，健康检查线程池 HealthCheckExecutor 的核心线程数和最大线程数将设置为 cpu * 5。

```java
public HealthCheckExecutor(HealthCheckProperties properties) {
    int threadPoolSize;
    if (properties.isHealthCheckParallelEnable()) {
        threadPoolSize = Runtime.getRuntime().availableProcessors() * 5;
    } else {
        threadPoolSize = 1;
    }
    this.executor = new SofaThreadPoolExecutor(threadPoolSize, threadPoolSize, 30,
        TimeUnit.SECONDS, new SynchronousQueue<>(), new NamedThreadFactory("health-check"),
        new ThreadPoolExecutor.CallerRunsPolicy(), "health-check",
        SofaBootConstants.SOFABOOT_SPACE_NAME);
    ......
}
```

readinessHealthCheck 与 livenessHealthCheck 的并行检查过程是一致的：

```java
public boolean readinessHealthCheck(Map<String, Health> healthMap) {
    ......
    boolean result;
    if (healthCheckProperties.isHealthCheckParallelEnable()) {
        CountDownLatch countDownLatch = new CountDownLatch(healthCheckers.size());
        AtomicBoolean parallelResult = new AtomicBoolean(true);
        healthCheckers.forEach((String key, HealthChecker value) -> healthCheckExecutor.executeTask(() -> {
            try {
                if (!doHealthCheck(key, value, false, healthMap, true, false)) {
                    parallelResult.set(false);
                }
            } catch (Throwable t) {
                ......
            } finally {
                countDownLatch.countDown();
            }
        }));
        boolean finished = false;
        try {
            finished = countDownLatch.await(healthCheckProperties.getHealthCheckParallelTimeout(), TimeUnit.MILLISECONDS);
        } catch (InterruptedException e) {
            ......
        }
        result = finished && parallelResult.get();
    } else {
        result = readinessHealthCheckers.entrySet().stream()
            .map(entry -> doHealthCheck(entry.getKey(), entry.getValue(), true, healthMap, true, true))
            .reduce(true, BinaryOperators.andBoolean());
    }
    ......
    return result;
}

public boolean livenessHealthCheck(Map<String, Health> healthMap) {
    ......
    boolean result;
    if (healthCheckProperties.isHealthCheckParallelEnable()) {
        CountDownLatch countDownLatch = new CountDownLatch(healthCheckers.size());
        AtomicBoolean parallelResult = new AtomicBoolean(true);
        healthCheckers.forEach((key, value) -> healthCheckExecutor.executeTask(() -> {
            try {
                if (!doHealthCheck(key, value, false, healthMap, false, false)) {
                    parallelResult.set(false);
                }
            } catch (Throwable t) {
                ......
            } finally {
                countDownLatch.countDown();
            }
        }));
        boolean finished = false;
        try {
            finished = countDownLatch.await(healthCheckProperties.getHealthCheckParallelTimeout(), TimeUnit.MILLISECONDS);
        } catch (InterruptedException e) {
            ......
        }
        result = finished && parallelResult.get();
    } else {
        result = healthCheckers.entrySet().stream()
                .map(entry -> doHealthCheck(entry.getKey(), entry.getValue(), false, healthMap, false, true))
                .reduce(true, BinaryOperators.andBoolean());
    }
    ......
    return result;
}
```

在并行检查开始前，将 CountDownLatch 初始值设置为任务数，然后开始向健康检查线程池 HealthCheckExecutor 提交健康检查任务，以 cpu * 5 的并发数并行执行，在检查过程中，如果有一项检查失败，就将 parallelResult 设置为 false。每结束一个任务，CountDownLatch 计数减一，通过 CountDownLatch.await 等待所有检查完成，等待超时时结束标志 finished 为 false。如果 finished 为 false（即并行检查超时）或 parallelResult 为 false（即至少有一项检查失败），则健康检查结果为 DOWN。

## 总结

通过上文的分析，我们了解了 SOFABoot 的 HealthCheck 机制：

1. Readiness Check 和 Liveness Check 的区别

    readiness 表示应用启动完成之后，在某一瞬间应用的状态是否健康，用来表示应用是否 ready，是否能接受和处理流量请求。这个健康状态会保存下来，不管应用后续的运行情况如何，readiness 状态是不会改变的。而 liveness 是随着应用的运行情况，实时反馈结果。因此会存在一种情况，readiness 是 UP 而 liveness 是 DOWN，这个时候就需要额外的手段或者人工介入。

2. 如何扩展健康检查指标
3. 如何通过 Readiness Check 控制流量

需要注意一点，虽然 SOFABoot 通过 Readiness Check 提供了流量控制的能力。但是实际情况中，流量除了以服务发现的形式进入到应用中，还有可能通过如 Kubernetes 的 Service 进入应用中，因此还需要与 PaaS 层的健康检查能力配合，实现完整、可靠的健康检查。
