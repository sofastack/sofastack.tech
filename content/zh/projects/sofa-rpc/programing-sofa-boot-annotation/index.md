
---
title: "SOFABoot 环境注解使用"
aliases: "/sofa-rpc/docs/Programing-SOFA-BOOT-Annotation"
---
## 注解服务发布与服务引用

除了常规的 xml 方式发布服务外，我们也支持在 SOFABoot 环境下，注解方式的发布与引用，同 xml 类似，我们有
`@SofaService` 和 `@SofaReference`，同时对于多协议，存在`@SofaServiceBinding` 和 `@SofaReferenceBinding` 注解。

### 服务发布

如果要发布一个 RPC 服务。我们只需要在 Bean 上面打上`@SofaService`注解。指定接口和协议类型即可。

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

### 服务引用

对于需要引用远程服务的 bean, 只需要在属性，或者方法上，打上`@SofaReference`的注解即可，支持 bolt, dubbo, rest 协议。

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

### 使用演示

可以在 sample 工程目录的 annotation 子项目中进行验证测试。
