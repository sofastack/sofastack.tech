---
title: "手动埋点"
---
SOFATracer 此前的埋点均是基于组件维度的埋点，用户很难在自己业务代码中进行埋点操作，或者增加自定义 tag 值来监控一些链路信息。基于此，SOFATracer 从 2.4.1/3.0.6 版本开始支持手动埋点和基于注解的埋点方式，帮助用户解决自定义埋点问题。

## 使用方式

自定义埋点提供了两种方式，一种是手动埋点，一种是基于注解方式埋点。

### 手动埋点

手动埋点的方式遵循 opentracing 规范，SOFATracer 中通过 beforeInvoke 和 afterInvoke 两个函数封装了 span 的周期，如下：

```java
// 注入 tracer
@Autowired
Tracer tracer;

private void testManual(){
    try {
        // beforeInvoke 开始
        SofaTracerSpan sofaTracerSpan = ((FlexibleTracer) tracer).beforeInvoke("testManual");
        sofaTracerSpan.setTag("manualKey","glmapper");
        // do your biz

    } catch (Throwable t){
        // 异常结束
        ((FlexibleTracer) tracer).afterInvoke(t.getMessage());
    } finally {
        // 正常结束
        ((FlexibleTracer) tracer).afterInvoke();
    }
}
```

这种方式在使用上没有直接使用注解方便，但是可以直观的了解到 span 的生命周期，另外手动埋点也是对基于注解方式埋点的一种补充，下面介绍。

### 基于注解方式

SOFATracer 中提供了 @Tracer 注解，其作用域是 method 级别。

```java
// 在 hello 方法上使用 @Tracer 注解进行埋点
@Tracer
public String hello(String word){
    // 自定义 tag 数据
    SpanTags.putTags("author","glmapper");

    // 失效
    helloInner(word);

    return "glmapper : hello " + word;
}

// 在 hello 方法上使用 @Tracer 注解进行埋点
@Tracer
private String helloInner(String word){
    return "glmapper : hello " + word;
}

```

@Tracer 是基于 Spring Aop 实现，因此一定程度上依赖 Spring 中的代理机制。如代码片段中所示，helloInner 方法由于执行过程中不会使用代理对象，而是 this，所以会导致 helloInner 的注解埋点失效。那么对于此种情况，就可以使用手动埋点的方式来弥补。

SpanTags 是 SOFATracer 中提供的工具类，在使用注解或者手动埋点的情况下，可以通过此类提供的静态方法来设置 tag 。

## 日志格式

* json 格式

```json
{"time":"2019-09-05 10:23:53.549","local.app":"flexible-sample","traceId":"0a0fe9291567650233504100130712","spanId":"0.2","span.kind":"client","result.code":"","current.thread.name":"http-nio-8080-exec-1","time.cost.milliseconds":"4ms","method":"hello","param.types":"java.lang.String","author":"glmapper","sys.baggage":"","biz.baggage":""}
```

* 非 json 格式

> 2019-09-05 10:25:50.992,flexible-sample,0a0fe9291567650350953100130778,0.2,client,,http-nio-8080-exec-1,4ms,hello,param.types=java.lang.String&author=glmapper&,,

