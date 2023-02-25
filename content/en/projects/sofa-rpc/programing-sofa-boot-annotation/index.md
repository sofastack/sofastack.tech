
---
title: "Use annotation in SOFABoot"
aliases: "/sofa-rpc/docs/Programing-SOFA-BOOT-Annotation"
---

## Use annotation for service publishing/reference

In addition to the regular xml mode, it is also supported to publish and reference services with annotation in the SOFABoot environment. Similar to xml, we provide
`@SofaService` and `@SofaReference` as well as `@SofaServiceBinding` and `@SofaReferenceBinding` annotation for multi-protocol.

### Service publishing

To publish an RPC service, you only need to add a `@SofaService` annotation on the bean to specify the interface and protocol type.

```java
import com.alipay.sofa.runtime.api.annotation.SofaService;
import com.alipay.sofa.runtime.api.annotation.SofaServiceBinding;
import org.springframework.stereotype.Service;

@SofaService(interfaceType = AnnotationService.class, bindings = { @SofaServiceBinding(bindingType = "bolt") })
@Service
public class AnnotationServiceImpl implements AnnotationService {
    @Override
    public String sayAnnotation(String string) {
        return string;
    }
}
```


### Service reference

For a bean that needs to reference a remote service, you only need to add the `@SofaReference` annotation on the attribute or method. This supports the bolt, dubbo, rest protocol.

```java
import com.alipay.sofa.runtime.api.annotation.SofaReference;
import com.alipay.sofa.runtime.api.annotation.SofaReferenceBinding;
import org.springframework.stereotype.Service;

@Service
public class AnnotationClientImpl {

    @SofaReference(interfaceType = AnnotationService.class, jvmFirst = false, 
            binding = @SofaReferenceBinding(bindingType = "bolt"))
    private AnnotationService annotationService;

    public String sayClientAnnotation(String str) {
        return annotationService.sayAnnotation(str);
    }
}
```

### Use the demo

You can test in the annotation subproject of the sample project.