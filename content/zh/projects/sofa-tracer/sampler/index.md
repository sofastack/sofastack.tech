
---

title: "采样模式"
aliases: "/sofa-tracer/docs/Sampler"
---

目前 SOFATracer 提供了两种采样模式，一种是基于 BitSet 实现的基于固定采样率的采样模式；另外一种是提供给用户自定义实现采样的采样模式。下面通过案例来演示如何使用。

本示例基于 tracer-sample-with-springmvc 工程；除 `application.properties` 之外，其他均相同。

### 基于固定采样率的采样模式

#### 在 application.properties 中增加采样相关配置项

```properties
#采样率  0~100
com.alipay.sofa.tracer.samplerPercentage=100
#采样模式类型名称
com.alipay.sofa.tracer.samplerName=PercentageBasedSampler
```

#### 验证方式

* 当采样率设置为 100 时，每次都会打印摘要日志。
* 当采样率设置为 0 时，不打印
* 当采样率设置为 0~100 之间时，按概率打印

以请求 10 次来验证下结果。

1、当采样率设置为 100 时，每次都会打印摘要日志

启动工程，浏览器中输入：<http://localhost:8080/springmvc> ；并且刷新地址 10 次，查看日志如下：

```json
{"time":"2018-11-09 11:54:47.643","local.app":"SOFATracerSpringMVC","traceId":"0a0fe8ec154173568757510019269","spanId":"0.1","request.url":"http://localhost:8080/springmvc","method":"GET","result.code":"200","req.size.bytes":-1,"resp.size.bytes":0,"time.cost.milliseconds":68,"current.thread.name":"http-nio-8080-exec-1","baggage":""}
{"time":"2018-11-09 11:54:50.980","local.app":"SOFATracerSpringMVC","traceId":"0a0fe8ec154173569097710029269","spanId":"0.1","request.url":"http://localhost:8080/springmvc","method":"GET","result.code":"200","req.size.bytes":-1,"resp.size.bytes":0,"time.cost.milliseconds":3,"current.thread.name":"http-nio-8080-exec-2","baggage":""}
{"time":"2018-11-09 11:54:51.542","local.app":"SOFATracerSpringMVC","traceId":"0a0fe8ec154173569153910049269","spanId":"0.1","request.url":"http://localhost:8080/springmvc","method":"GET","result.code":"200","req.size.bytes":-1,"resp.size.bytes":0,"time.cost.milliseconds":3,"current.thread.name":"http-nio-8080-exec-4","baggage":""}
{"time":"2018-11-09 11:54:52.061","local.app":"SOFATracerSpringMVC","traceId":"0a0fe8ec154173569205910069269","spanId":"0.1","request.url":"http://localhost:8080/springmvc","method":"GET","result.code":"200","req.size.bytes":-1,"resp.size.bytes":0,"time.cost.milliseconds":2,"current.thread.name":"http-nio-8080-exec-6","baggage":""}
{"time":"2018-11-09 11:54:52.560","local.app":"SOFATracerSpringMVC","traceId":"0a0fe8ec154173569255810089269","spanId":"0.1","request.url":"http://localhost:8080/springmvc","method":"GET","result.code":"200","req.size.bytes":-1,"resp.size.bytes":0,"time.cost.milliseconds":2,"current.thread.name":"http-nio-8080-exec-8","baggage":""}
{"time":"2018-11-09 11:54:52.977","local.app":"SOFATracerSpringMVC","traceId":"0a0fe8ec154173569297610109269","spanId":"0.1","request.url":"http://localhost:8080/springmvc","method":"GET","result.code":"200","req.size.bytes":-1,"resp.size.bytes":0,"time.cost.milliseconds":1,"current.thread.name":"http-nio-8080-exec-10","baggage":""}
{"time":"2018-11-09 11:54:53.389","local.app":"SOFATracerSpringMVC","traceId":"0a0fe8ec154173569338710129269","spanId":"0.1","request.url":"http://localhost:8080/springmvc","method":"GET","result.code":"200","req.size.bytes":-1,"resp.size.bytes":0,"time.cost.milliseconds":2,"current.thread.name":"http-nio-8080-exec-2","baggage":""}
{"time":"2018-11-09 11:54:53.742","local.app":"SOFATracerSpringMVC","traceId":"0a0fe8ec154173569374110149269","spanId":"0.1","request.url":"http://localhost:8080/springmvc","method":"GET","result.code":"200","req.size.bytes":-1,"resp.size.bytes":0,"time.cost.milliseconds":1,"current.thread.name":"http-nio-8080-exec-4","baggage":""}
{"time":"2018-11-09 11:54:54.142","local.app":"SOFATracerSpringMVC","traceId":"0a0fe8ec154173569414010169269","spanId":"0.1","request.url":"http://localhost:8080/springmvc","method":"GET","result.code":"200","req.size.bytes":-1,"resp.size.bytes":0,"time.cost.milliseconds":2,"current.thread.name":"http-nio-8080-exec-6","baggage":""}
{"time":"2018-11-09 11:54:54.565","local.app":"SOFATracerSpringMVC","traceId":"0a0fe8ec154173569456310189269","spanId":"0.1","request.url":"http://localhost:8080/springmvc","method":"GET","result.code":"200","req.size.bytes":-1,"resp.size.bytes":0,"time.cost.milliseconds":2,"current.thread.name":"http-nio-8080-exec-8","baggage":""}
```

2、当采样率设置为 0 时，不打印

启动工程，浏览器中输入：<http://localhost:8080/springmvc> ；并且刷新地址 10 次，查看 ./logs/tracerlog/ 目录，没有 spring-mvc-digest.log 日志文件

3、当采样率设置为 0~100 之间时，按概率打印

这里设置成 20

* 刷新 10 次请求

```json
{"time":"2018-11-09 12:14:29.466","local.app":"SOFATracerSpringMVC","traceId":"0a0fe8ec154173686946410159846","spanId":"0.1","request.url":"http://localhost:8080/springmvc","method":"GET","result.code":"200","req.size.bytes":-1,"resp.size.bytes":0,"time.cost.milliseconds":2,"current.thread.name":"http-nio-8080-exec-5","baggage":""}
{"time":"2018-11-09 12:15:21.776","local.app":"SOFATracerSpringMVC","traceId":"0a0fe8ec154173692177410319846","spanId":"0.1","request.url":"http://localhost:8080/springmvc","method":"GET","result.code":"200","req.size.bytes":-1,"resp.size.bytes":0,"time.cost.milliseconds":2,"current.thread.name":"http-nio-8080-exec-2","baggage":""}
```

* 刷新 20 次请求

```json
{"time":"2018-11-09 12:14:29.466","local.app":"SOFATracerSpringMVC","traceId":"0a0fe8ec154173686946410159846","spanId":"0.1","request.url":"http://localhost:8080/springmvc","method":"GET","result.code":"200","req.size.bytes":-1,"resp.size.bytes":0,"time.cost.milliseconds":2,"current.thread.name":"http-nio-8080-exec-5","baggage":""}
{"time":"2018-11-09 12:15:21.776","local.app":"SOFATracerSpringMVC","traceId":"0a0fe8ec154173692177410319846","spanId":"0.1","request.url":"http://localhost:8080/springmvc","method":"GET","result.code":"200","req.size.bytes":-1,"resp.size.bytes":0,"time.cost.milliseconds":2,"current.thread.name":"http-nio-8080-exec-2","baggage":""}
{"time":"2018-11-09 12:15:22.439","local.app":"SOFATracerSpringMVC","traceId":"0a0fe8ec154173692243810359846","spanId":"0.1","request.url":"http://localhost:8080/springmvc","method":"GET","result.code":"200","req.size.bytes":-1,"resp.size.bytes":0,"time.cost.milliseconds":1,"current.thread.name":"http-nio-8080-exec-6","baggage":""}
{"time":"2018-11-09 12:15:22.817","local.app":"SOFATracerSpringMVC","traceId":"0a0fe8ec154173692281510379846","spanId":"0.1","request.url":"http://localhost:8080/springmvc","method":"GET","result.code":"200","req.size.bytes":-1,"resp.size.bytes":0,"time.cost.milliseconds":2,"current.thread.name":"http-nio-8080-exec-8","baggage":""}
```

> 按 20% 进行采样，测试结果仅供参考

### 自定义采样模式

SOFATracer 中提供了一个采样率计算的接口 Sampler ，如果你需要定制化自己的采样策略，可通过实现此接口来进行扩展。下面通过一个简单的 Demo 来演示如何使用自定义采样模式。

#### 自定义采样规则类

```java
public class CustomOpenRulesSamplerRuler implements Sampler {

    private static final String TYPE = "CustomOpenRulesSamplerRuler";

    @Override
    public SamplingStatus sample(SofaTracerSpan sofaTracerSpan) {
        SamplingStatus samplingStatus = new SamplingStatus();
        Map<String, Object> tags = new HashMap<String, Object>();
        tags.put(SofaTracerConstant.SAMPLER_TYPE_TAG_KEY, TYPE);
        tags = Collections.unmodifiableMap(tags);
        samplingStatus.setTags(tags);

        if (sofaTracerSpan.isServer()) {
            samplingStatus.setSampled(false);
        } else {
            samplingStatus.setSampled(true);
        }
        return samplingStatus;
    }

    @Override
    public String getType() {
        return TYPE;
    }

    @Override
    public void close() {
        // do nothing 
    }
}
```

在 sample 方法中，用户可以根据当前 sofaTracerSpan 提供的信息来决定是否进行打印。这个案例是通过判断 isServer 来决定是否采样，isServer=true,不采样，否则采样。

#### 在 application.properties 中增加采样相关配置项

```properties
com.alipay.sofa.tracer.samplerName.samplerCustomRuleClassName=com.alipay.sofa.tracer.examples.springmvc.sampler.CustomOpenRulesSamplerRuler
```

相关实验结果，可以自行验证下。
