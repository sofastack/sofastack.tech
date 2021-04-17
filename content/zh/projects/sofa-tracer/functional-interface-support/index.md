---
title: "Functional 接口支持"
---
从 Java 8 中，Java 开始引入了各种 `@FunctionalInterface` 接口，以更好地支持函数式编程，通常，Java 的函数会在一个 ForkJoinPool 中执行，如果这个时候没有把 Tracer 的一些线程变量传递进去的话，就会造成 Trace 信息的丢失。

因此，在 SOFATracer XXX 版本中增加了对这些 `@FunctionalInterface` 接口的包装类，以确保 Trace 相关的信息能够正确地传递下面，下面以 `Consumer` 接口为例进行说明，只需要将原来构造 `Consumer` 的地方修改成构造 `SofaTracerConsumer`，并且将原来的 `Consumer` 传入作为 `SofaTracerConsumer` 的构造函数的参数即可：

```java
Consumer<String> consumer = new SofaTracerConsumer<>(System.out::println);
```

所有做了包装的类都在 <https://github.com/sofastack/sofa-tracer/tree/master/tracer-core/src/main/java/com/alipay/common/tracer/core/async> 目录下，文档中不一一列举。