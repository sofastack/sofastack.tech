
---
title: "REST Exception"
aliases: "/sofa-rpc/docs/RESTful-Exception"
---



对于 REST，我们设计了一个 JAXRSProviderManager 管理器类。在服务端生效，生效时间为服务启动时。如果希望有一个通用的
异常处理类，用来处理 REST 的某中异常类型的信息。可以实现一个 REST 的处理类。如下示例是一个拦截`SofaRpcException` 的通用处理器。


```java
@PreMatching
public class CustomExceptionMapper implements ExceptionMapper<SofaRpcException> {

    @Override
    public Response toResponse(SofaRpcException exception) {
        return Response.status(500).entity(exception.getMessage()).build();
    }
}

```

并将该处理器注册到 JAXRSProviderManager 中，时机可以在 Main 方法中。具体说明可以参考[RESTful-Filter](../restful-filter)。
