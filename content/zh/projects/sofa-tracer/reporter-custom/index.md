---
title: "自定义 Reporter"
---
在使用自定义埋点组件的情况下，用户可以选择自定义 Reporter。

## 自定义 Reporter 实现

```java
public class MyReporter implements Reporter {

    @Override
    public String getReporterType() {
        return "myReporter";
    }

    @Override
    public void report(SofaTracerSpan sofaTracerSpan) {
        // System.out 输出
        System.out.println("this is my custom reporter");
    }

    @Override
    public void close() {
        // ignore
    }
}
```

## 配置

```properties
com.alipay.sofa.tracer.reporter-name=com.glmapper.bridge.boot.flexible.MyReporter
```

自定义实现 Reporter 可以将业务埋点的日志输出到任何期望的地方。
