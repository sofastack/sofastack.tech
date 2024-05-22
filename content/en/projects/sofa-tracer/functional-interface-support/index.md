---
title: "Functional interface support"
---
Since Java 8, Java has introduced various `@FunctionalInterface` interfaces to support functional programming. Generally, Java functions will be executed in a ForkJoinPool. If some thread variables of Tracer are not passed in, it will cause the loss of Trace information.

Therefore, in SOFATracer XXX version, a series of wrapper classes for these `@FunctionalInterface` interfaces has been added to ensure that trace-related information can be transferred correctly and transparently. The following is an example of the `Consumer` interface, just need to change the construction of `Consumer` to `SofaTracerConsumer`, and pass the original `Consumer` as the parameter of the constructor of `SofaTracerConsumer`:

```java
Consumer<String> consumer = new SofaTracerConsumer<>(System.out::println);
```

All wrapped classes are in the <https://github.com/sofastack/sofa-tracer/tree/master/tracer-core/src/main/java/com/alipay/common/tracer/core/async> directory.
