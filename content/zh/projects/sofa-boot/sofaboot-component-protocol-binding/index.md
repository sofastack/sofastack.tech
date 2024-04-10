---
title: "源码解析：SOFABoot 组件协议 binding 机制解析"
author: "林楠"
authorlink: "https://github.com/it-linnan"
description: "源码解析 | SOFABoot 组件协议 binding 机制解析"
categories: "SOFAStack"
tags: [“源码解析”]
date: 2022-07-19T15:00:00+08:00
---

## 前言

SOFABoot 提供两种服务通信能力，一种是 JVM 服务，用于同一应用内不同模块间的通信，一种是 RPC 服务，用于不同应用间的通信。SOFABoot 提供三种方式实现服务的发布和引用，分别是 XML 配置文件、注解和 API 的方式，本文从源码角度解析从服务的发布和引用到组件协议 binding 机制的实现原理。

## 服务发布与引用

在了解组件协议 binding 机制之前，我们先简单了解一下服务的发布与引用的源码。

### XML

通过 XML 方式发布或引用服务时，使用 sofa:service 发布服务，使用 sofa:reference 引用服务，示例代码如下：

```xml
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:sofa="http://sofastack.io/schema/sofaboot"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
            http://sofastack.io/schema/sofaboot   http://sofastack.io/schema/sofaboot.xsd">
    <sofa:service ref="sampleJvmService" interface="com.alipay.sofa.isle.sample.SampleJvmService">
        <sofa:binding.jvm/>
    </sofa:service>
  
    <sofa:reference id="sampleJvmService" interface="com.alipay.sofa.isle.sample.SampleJvmService">
          <sofa:binding.jvm/>
    </sofa:service>
</beans>
```

我们可以看到在 xml 中使用 xmlns:sofa，将 sofa 前缀的命名空间定义为 `http://sofastack.io/schema/sofaboot` ，Spring 在解析 sofa:* 标签时会与该命名空间相关联。对于 xml 的解析，SOFABoot 在 sofa-boot 模块中使用 spring.handlers 配置文件中注册了 sofa 命名空间的 XML 处理器。

```xml
http\://sofastack.io/schema/sofaboot=com.alipay.sofa.boot.spring.namespace.handler.SofaBootNamespaceHandler
```

SofaBootNamespaceHandler 在初始化阶段，基于 SPI 机制查找所有标签解析器，调用 registerTagParser 方法注册标签解析器。

```java
public void init() {
    ServiceLoader<SofaBootTagNameSupport> serviceLoaderSofaBoot = ServiceLoader.load(SofaBootTagNameSupport.class);
    serviceLoaderSofaBoot.forEach(this::registerTagParser);
}
```

注册标签解析器时，调用解析器的 supportTagName 方法获取标签名，将解析器与标签名关联起来。

```java
private void registerTagParser(SofaBootTagNameSupport tagNameSupport) {
    if (tagNameSupport instanceof BeanDefinitionParser) {
        registerBeanDefinitionParser(tagNameSupport.supportTagName(),
                                     (BeanDefinitionParser) tagNameSupport);
    } else if (tagNameSupport instanceof BeanDefinitionDecorator) {
        registerBeanDefinitionDecoratorForAttribute(tagNameSupport.supportTagName(),
                                                    (BeanDefinitionDecorator) tagNameSupport);
    } else {
        ...
    }
}
```

sofa:service 标签的解析器是 ServiceDefinitionParser，使用 doParseInternal 方法读取 xml 标签属性值，并解析为 bean 定义，根据 getBeanClass 定义的类型，将 sofa:service 标签定义的服务转换为 ServiceFactoryBean，并注册到 Spring 上下文中。

```java
public class ServiceDefinitionParser extends AbstractContractDefinitionParser {
    ...
    @Override
    protected void doParseInternal(Element element, ParserContext parserContext,
                                   BeanDefinitionBuilder builder) {
        String ref = element.getAttribute(REF);
        builder.addPropertyReference(REF, ref);
        if (element.hasAttribute("id")) {
            String id = element.getAttribute("id");
            builder.addPropertyValue(BEAN_ID, id);
        } else {
            builder.addPropertyValue(BEAN_ID, ref);
        }
    }
    @Override
    protected Class getBeanClass(Element element) {
        return ServiceFactoryBean.class;
    }
    @Override
    public String supportTagName() {
        return "service";
    }
}
```

根据 Spring 的机制，在注册 bean 时，对 bean 的属性赋值后会调用 bean 的 afterPropertiesSet  方法。而在注册 ServiceFactoryBean 时，会先调用 ServiceFactoryBean 父类 AbstractContractFactoryBean 中的 afterPropertiesSet 方法。

```java
public abstract class AbstractContractFactoryBean implements InitializingBean, FactoryBean,
                                                 ApplicationContextAware {
    ...
    @Override
    public void afterPropertiesSet() throws Exception {
        ...
        doAfterPropertiesSet();
    }
}
```

在调用 ServiceFactoryBean 中的 doAfterPropertiesSet 方法，将服务配置转换为 ServiceComponent，注册到 SOFA 的 ComponentManager 中

```java
public class ServiceFactoryBean extends AbstractContractFactoryBean {
    ...
    @Override
    protected void doAfterPropertiesSet() {
        ...
        Implementation implementation = new DefaultImplementation();
        implementation.setTarget(ref);
        service = buildService();
        ...
        ComponentInfo componentInfo = new ServiceComponent(implementation, service,
            bindingAdapterFactory, sofaRuntimeContext);
        componentInfo.setApplicationContext(applicationContext);
        sofaRuntimeContext.getComponentManager().register(componentInfo);
    }
}
```

sofa:reference 标签的解析器是 ReferenceDefinitionParser，使用 doParseInternal 方法读取 xml 标签属性值，并解析为 bean 定义，根据 getBeanClass 定义的类型，将 sofa:reference 标签定义的服务转换为 ReferenceFactoryBean，并注册到 Spring 上下文中。

```java
public class ReferenceDefinitionParser extends AbstractContractDefinitionParser {
    ...
    @Override
    protected void doParseInternal(Element element, ParserContext parserContext,
                                   BeanDefinitionBuilder builder) {
        String jvmFirstString = element.getAttribute(JVM_FIRST);

        if (StringUtils.hasText(jvmFirstString)) {
            if ("true".equalsIgnoreCase(jvmFirstString)) {
                builder.addPropertyValue(PROPERTY_JVM_FIRST, true);
            } else if ("false".equalsIgnoreCase(jvmFirstString)) {
                builder.addPropertyValue(PROPERTY_JVM_FIRST, false);
            } else {
                ...
            }
        }

        String loadBalance = element.getAttribute(PROPERTY_LOAD_BALANCE);
        if (StringUtils.hasText(loadBalance)) {
            builder.addPropertyValue(PROPERTY_LOAD_BALANCE, loadBalance);
        }
    }
    @Override
    protected Class getBeanClass(Element element) {
        return ReferenceFactoryBean.class;
    }
    @Override
    public String supportTagName() {
        return "reference";
    }
}

```

ReferenceFactoryBean 中 doAfterPropertiesSet 方法，将服务配置转换为 ReferenceComponent，注册到 SOFA 的 ComponentManager 中

```java
public class ReferenceFactoryBean extends AbstractContractFactoryBean {
    ...
    @Override
    protected void doAfterPropertiesSet() {
        Reference reference = buildReference();
        ...
        proxy = ReferenceRegisterHelper.registerReference(reference, bindingAdapterFactory,
            sofaRuntimeContext, applicationContext);
    }
    protected Reference buildReference() {
        return new ReferenceImpl(uniqueId, getInterfaceClass(), InterfaceMode.spring, jvmFirst);
    }
}
public class ReferenceRegisterHelper {
    public static Object registerReference(Reference reference,
                                           BindingAdapterFactory bindingAdapterFactory,
                                           SofaRuntimeContext sofaRuntimeContext) {
        return registerReference(reference, bindingAdapterFactory, sofaRuntimeContext, null);
    }
    public static Object registerReference(Reference reference,
                                           BindingAdapterFactory bindingAdapterFactory,
                                           SofaRuntimeContext sofaRuntimeContext,
                                           ApplicationContext applicationContext) {
        ...
        ComponentManager componentManager = sofaRuntimeContext.getComponentManager();
        ReferenceComponent referenceComponent = new ReferenceComponent(reference,
            new DefaultImplementation(), bindingAdapterFactory, sofaRuntimeContext);

        if (componentManager.isRegistered(referenceComponent.getName())) {
            return componentManager.getComponentInfo(referenceComponent.getName())
                .getImplementation().getTarget();
        }

        ComponentInfo componentInfo = componentManager.registerAndGet(referenceComponent);
        componentInfo.setApplicationContext(applicationContext);
        return componentInfo.getImplementation().getTarget();
    }
}
```

### 注解

通过注解方式发布或引用服务时，使用 @SofaService 发布服务，使用 @SofaReference 引用服务，示例代码如下：

```java
@SofaService(uniqueId = "annotationImpl")
public class SampleJvmServiceAnnotationImpl implements SampleJvmService {
    @Override
    public String message() {
        return "Hello, jvm service annotation implementation.";
    }
}
public class JvmServiceConsumer implements ClientFactoryAware {
    @SofaReference(uniqueId = "annotationImpl")
    private SampleJvmService sampleJvmServiceAnnotationImpl;
}
```

对于 @SofaService 注解的处理，SOFABoot 在 runtime-sofa-boot 模块中提供了相应的处理器 ServiceBeanFactoryPostProcessor。ServiceBeanFactoryPostProcessor 在 postProcessBeanDefinitionRegistry 方法中遍历所有 bean，检查 bean 是否含有 @SofaService 注解，如果有就会解析注解中定义的属性值，将 bean 转换为 SOFA 服务。
入口是 transformSofaBeanDefinition 方法，先判断 bean 的定义方式，从而决定如何获取 SOFA 注解：如果 bean 是在配置类中定义的，那么就需要从方法上获取注解，也就是调用 generateSofaServiceDefinitionOnMethod 方法；另一种方式是直接在 bean 的类上获取注解，也就是调用 generateSofaServiceDefinitionOnClass 方法。

```java
public class ServiceBeanFactoryPostProcessor implements BeanDefinitionRegistryPostProcessor,
                                            ApplicationContextAware, EnvironmentAware {

    @Override
    public void postProcessBeanDefinitionRegistry(BeanDefinitionRegistry registry) throws BeansException {
        Arrays.stream(registry.getBeanDefinitionNames())
                .collect(Collectors.toMap(Function.identity(), registry::getBeanDefinition))
                .forEach((key, value) -> transformSofaBeanDefinition(key, value, registry));
    }
    private void transformSofaBeanDefinition(String beanId, BeanDefinition beanDefinition,
                                             BeanDefinitionRegistry registry) {
        if (BeanDefinitionUtil.isFromConfigurationSource(beanDefinition)) {
            generateSofaServiceDefinitionOnMethod(beanId, (AnnotatedBeanDefinition) beanDefinition,
                registry);
        } else {
            Class<?> beanClassType = BeanDefinitionUtil.resolveBeanClassType(beanDefinition);
            if (beanClassType == null) {
                SofaLogger.warn("Bean class type cant be resolved from bean of {}", beanId);
                return;
            }
            generateSofaServiceDefinitionOnClass(beanId, beanClassType, beanDefinition, registry);
        }
    }
}
```

这里我们看下 generateSofaServiceDefinitionOnClass 方法：先从类定义中获取 @SofaService 注解，调用 generateSofaServiceDefinition 方法，将注解定义转换为 ServiceFactoryBean 。在转换时通过 getSofaServiceBinding 方法将 @SofaService 注解转换为 binding 设置到 ServiceFactoryBean 属性，通过 dependsOn 控制了加载顺序。最后调用 registry.registerBeanDefinition 方法，将 ServiceFactoryBean 注册到 Spring 上下文中。

```java
private void generateSofaServiceDefinitionOnClass(String beanId, Class<?> beanClass,
                                                    BeanDefinition beanDefinition,
                                                    BeanDefinitionRegistry registry) {
    SofaService sofaServiceAnnotation = AnnotationUtils.findAnnotation(beanClass, SofaService.class);
    generateSofaServiceDefinition(beanId, sofaServiceAnnotation, beanClass, beanDefinition, registry);
}
private void generateSofaServiceDefinition(String beanId, SofaService sofaServiceAnnotation,
                                               Class<?> beanClass, BeanDefinition beanDefinition,
                                               BeanDefinitionRegistry registry) {
    ...
    BeanDefinitionBuilder builder = BeanDefinitionBuilder.genericBeanDefinition();
    String serviceId = SofaBeanNameGenerator.generateSofaServiceBeanName(interfaceType, sofaServiceAnnotation.uniqueId());
    if (!registry.containsBeanDefinition(serviceId)) {
        builder.getRawBeanDefinition().setScope(beanDefinition.getScope());
        builder.setLazyInit(beanDefinition.isLazyInit());
        builder.getRawBeanDefinition().setBeanClass(ServiceFactoryBean.class);
        builder.addAutowiredProperty(AbstractContractDefinitionParser.SOFA_RUNTIME_CONTEXT);
        builder.addAutowiredProperty(AbstractContractDefinitionParser.BINDING_CONVERTER_FACTORY);
        builder.addAutowiredProperty(AbstractContractDefinitionParser.BINDING_ADAPTER_FACTORY);
        builder.addPropertyValue(AbstractContractDefinitionParser.INTERFACE_CLASS_PROPERTY, interfaceType);
        builder.addPropertyValue(AbstractContractDefinitionParser.UNIQUE_ID_PROPERTY, sofaServiceAnnotation.uniqueId());
        builder.addPropertyValue(AbstractContractDefinitionParser.BINDINGS,
                                 getSofaServiceBinding(sofaServiceAnnotation, sofaServiceAnnotation.bindings()));
        builder.addPropertyReference(ServiceDefinitionParser.REF, beanId);
        builder.addPropertyValue(ServiceDefinitionParser.BEAN_ID, beanId);
        builder.addPropertyValue(AbstractContractDefinitionParser.DEFINITION_BUILDING_API_TYPE, true);
        builder.addDependsOn(beanId);
        registry.registerBeanDefinition(serviceId, builder.getBeanDefinition());
    } else {
        SofaLogger.warn("SofaService was already registered: {}", serviceId);
    }
}
```

对于 @SofaReference 注解的处理，SOFABoot 在 runtime-sofa-boot 模块中提供了相应的处理器 ReferenceAnnotationBeanPostProcessor。在 postProcessBeforeInitialization 方法中调用 processSofaReference 方法，通过 FieldFilter 筛选 bean 类中的含有 @SofaReference 注解的字段。在 doWith 方法中解析字段的 @SofaReference 注解中定义的属性值，调用 createReferenceProxy 方法，根据属性值生成 SOFA 服务引用代理。将 SOFA 服务引用代理设置到类字段中，通过该字段调用服务就相当于调用服务引用代理。

```java
public Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {
    processSofaReference(bean);
    return bean;
}
private void processSofaReference(final Object bean) {
    final Class<?> beanClass = bean.getClass();
    ReflectionUtils.doWithFields(beanClass, new ReflectionUtils.FieldCallback() {
        @Override
        public void doWith(Field field) throws IllegalArgumentException, IllegalAccessException {
            AnnotationWrapperBuilder<SofaReference> builder = AnnotationWrapperBuilder.wrap(
                field.getAnnotation(SofaReference.class)).withBinder(binder);
            SofaReference sofaReferenceAnnotation = builder.build();
            ...
            Object proxy = createReferenceProxy(sofaReferenceAnnotation, interfaceType);
            ReflectionUtils.makeAccessible(field);
            ReflectionUtils.setField(field, bean, proxy);
        }
    }, new ReflectionUtils.FieldFilter() {
        @Override
        public boolean matches(Field field) {
            if (!field.isAnnotationPresent(SofaReference.class)) {
                return false;
            }
            if (Modifier.isStatic(field.getModifiers())) {
                SofaLogger.warn("SofaReference annotation is not supported on static fields: {}", field);
                return false;
            }
            return true;
        }
    });
}
```

### API

通过 API 方式发布或引用服务时，使用 ServiceClient 发布服务，使用 ReferenceClient 引用服务，示例代码如下：

```java
ServiceClient serviceClient = clientFactory.getClient(ServiceClient.class);
ServiceParam serviceParam = new ServiceParam();
serviceParam.setInstance(new SampleJvmServiceImpl("Hello, jvm service service client implementation."));
serviceParam.setInterfaceType(SampleJvmService.class);
serviceParam.setUniqueId("serviceClientImpl");
serviceClient.service(serviceParam);

ReferenceClient referenceClient = clientFactory.getClient(ReferenceClient.class);
ReferenceParam<SampleJvmService> referenceParam = new ReferenceParam<>();
referenceParam.setInterfaceType(SampleJvmService.class);
referenceParam.setUniqueId("serviceClientImpl");
SampleJvmService sampleJvmServiceClientImpl = referenceClient.reference(referenceParam);
sampleJvmServiceClientImpl.message();
```

API 方式发布服务，是通过 ServiceClientImpl 的 service 方法实现的，将服务配置转换为 ServiceComponent ，注册到 SOFA 的 ComponentManager 中，但没有向 Spring 上下文中注册 bean。

```java
public class ServiceClientImpl implements ServiceClient {
    
    ...
    public void service(ServiceParam serviceParam) {
        Implementation implementation = new DefaultImplementation();
        implementation.setTarget(serviceParam.getInstance());
        ...
        Service service = new ServiceImpl(serviceParam.getUniqueId(),
            serviceParam.getInterfaceType(), InterfaceMode.api, serviceParam.getInstance(), null);
        ...
        ComponentInfo componentInfo = new ServiceComponent(implementation, service,
            bindingAdapterFactory, sofaRuntimeContext);
        sofaRuntimeContext.getComponentManager().register(componentInfo);
    }
}
```

API 方式引用服务，是通过 ReferenceClientImpl 的 reference 方法实现的，将服务配置转换为 ReferenceComponent，注册到 SOFA 的 ComponentManager 中。与发布服务相同，也没有向 Spring 上下文中注册 bean。

```java
public class ReferenceClientImpl implements ReferenceClient {
    public <T> T reference(ReferenceParam<T> referenceParam) {
        return (T) ReferenceRegisterHelper.registerReference(
            getReferenceFromReferenceParam(referenceParam), bindingAdapterFactory,
            sofaRuntimeContext);
    }
}
```

### 服务发布与引用总结

以上篇幅介绍了服务发布与引用的大致流程，XML 方式是向 Spring 上下文中注册了一个新的 bean，服务发布注册的是 ServiceFactoryBean，通过 ServiceFactoryBean 的注册流程向 ComponentManager 中注册 ServiceComponent；引用服务注册的是 ReferenceFactoryBean，通过 ReferenceFactoryBean 的注册流程向 ComponentManager 中注册 ReferenceComponent。注解方式的服务发布注册的是 ServiceFactoryBean，通过 ServiceFactoryBean 的注册流程向 ComponentManager 中注册 ServiceComponent；引用服务则是根据字段上的 @SofaReference 注解生成服务引用代理对象，将字段值设置为代理对象。API 方式的服务发布则是通过 ServiceClientImpl 直接向 ComponentManager 中注册 ServiceComponent ，引用服务是通过 ReferenceClientImpl 直接向 ComponentManager 中注册 ReferenceComponent。
在前面的给出的代码中我们略过了一部分代码，这部分代码实际上就是组件协议 binding 的机制，接下来，我们进入正题。

## 组件协议 binding

在介绍组件协议 binding 机制之前，先看一下 binding 机制中的一些重要接口

| 接口类 | 说明 |
| --- | --- |
| com.alipay.sofa.runtime.spi.binding.Binding | SOFA 组件协议接口，表示服务绑定了哪些协议，对外提供哪些协议的服务调用方式。SOFABoot 内置 JVM 协议、RPC 协议（bolt、dubbo 等） |
| com.alipay.sofa.runtime.api.client.param.BindingParam | SOFA 组件协议参数接口，每种服务协议都需要配置一些参数，比如 RPC 协议通常需要配置超时时间、负载均衡算法等 |
| com.alipay.sofa.runtime.spi.service.BindingConverter | Binding 转换器接口，用于将服务协议配置转换为具体的 Binding |
| com.alipay.sofa.runtime.spi.service.BindingConverterFactory | Binding 转换器工厂，能够通过协议名获取 Binding 转换器 |
| com.alipay.sofa.runtime.spi.binding.BindingAdapter | Binding 适配器，用于将 Binding 服务发布出去或生成服务引用 |
| com.alipay.sofa.runtime.spi.binding.BindingAdapterFactory | Binding 适配器工厂，能够通过协议名获取 Binding 适配器 |

组件协议 binding 是服务发布和引用流程的一部分，因此我们从这两个角度分别看一下实现方式。

### 服务发布

#### ServiceFactoryBean

先看一下 ServiceFactoryBean 的父类 AbstractContractFactoryBean，通过 parseBindings 方法解析服务协议配置，从而获取服务支持的组件协议 bindings。

```java
public abstract class AbstractContractFactoryBean implements InitializingBean, FactoryBean,
                                                 ApplicationContextAware {
    ...
    protected List<Binding> bindings = new ArrayList<>(2);
    ...
    @Override
    public void afterPropertiesSet() throws Exception {
        List<Element> tempElements = new ArrayList<>();
        ...
        if (!apiType) {
            this.bindings = parseBindings(tempElements, applicationContext, isInBinding());
        }
        doAfterPropertiesSet();
    }
}
```

通过 BindingConverter 工厂获取组件协议的 BindingConverter，调用 convert 方法将配置转换为组件协议 Binding。

```java
protected List<Binding> parseBindings(List<Element> parseElements,
                                      ApplicationContext appContext, boolean isInBinding) {
    List<Binding> result = new ArrayList<>();

    if (parseElements != null) {
        for (Element element : parseElements) {
            String tagName = element.getLocalName();
            BindingConverter bindingConverter = bindingConverterFactory
                .getBindingConverterByTagName(tagName);
            ...
            Binding binding = bindingConverter.convert(element, bindingConverterContext);
            result.add(binding);
        }
    }

    return result;
}
```

再看 ServiceFactoryBean 的 doAfterPropertiesSet 方法：如果服务未配置任何组件协议，会默认绑定 JVM 协议。调用 ComponentManager 的 register 方法，注册 ServiceComponent。

```java
protected void doAfterPropertiesSet() {
    ...
    if (bindings.size() == 0) {
        JvmBindingParam jvmBindingParam = new JvmBindingParam().setSerialize(true);
        bindings.add(new JvmBinding().setJvmBindingParam(jvmBindingParam));
    }

    for (Binding binding : bindings) {
        service.addBinding(binding);
    }

    ComponentInfo componentInfo = new ServiceComponent(implementation, service,
                                                       bindingAdapterFactory, sofaRuntimeContext);
    componentInfo.setApplicationContext(applicationContext);
    sofaRuntimeContext.getComponentManager().register(componentInfo);
}
```

ComponentManager 的注册方法中：调用 ServiceComponent 的 register 方法，将组件状态更新为 REGISTERED。调用 resolve 方法，解析组件的绑定协议，并将组件状态更新为 RESOLVED。调用 activate 方法，激活组件，将服务发布出去，并将组件状态更新为 ACTIVATED。

```java
public void register(ComponentInfo componentInfo) {
    doRegister(componentInfo);
}
private ComponentInfo doRegister(ComponentInfo ci) {
    ...
    try {
        ci.register();
    } catch (Throwable t) {
        ...
        return null;
    }
    try {
        ...
        if (ci.resolve()) {
            typeRegistry(ci);
            ci.activate();
        }
    } catch (Throwable t) {
        ...
    }

    return ci;
}
```

ServiceComponent 的 resolve 方法中，根据组件绑定协议获取对应的 BindingAdapter，调用 preOutBinding 方法，进行服务预发布。

```java
public boolean resolve() {
    resolveBinding();
    return super.resolve();
}
private void resolveBinding() {
    ...
    if (service.hasBinding()) {
        Set<Binding> bindings = service.getBindings();
        ...boolean allPassed = true;
        for (Binding binding : bindings) {
            BindingAdapter<Binding> bindingAdapter = this.bindingAdapterFactory
                .getBindingAdapter(binding.getBindingType());
            ...
            try {
                bindingAdapter.preOutBinding(service, binding, target, getContext());
            } catch (Throwable t) {
                ...
            }
            ...
        }
        ...
    }
}
```

BindingAdapter 的 preOutBinding 方法有两个实现，一个是 JVM 协议的 JvmBindingAdapter，但方法中没有具体实现代码，也就是说预发布 JVM 协议的服务不需要做特殊处理；另外一个是 RPC 协议的 RpcBindingAdapter，将 Binding 转换为服务提供者信息 ProviderConfig，并将 ProviderConfig 添加到 ProviderConfigContainer。

```java
public void preOutBinding(Object contract, RpcBinding binding, Object target,
                              SofaRuntimeContext sofaRuntimeContext) {
    ApplicationContext applicationContext = sofaRuntimeContext.getSofaRuntimeManager()
        .getRootApplicationContext();
    ProviderConfigContainer providerConfigContainer = applicationContext
        .getBean(ProviderConfigContainer.class);
    String uniqueName = providerConfigContainer.createUniqueName((Contract) contract, binding);
    ProviderConfigHelper providerConfigHelper = applicationContext.getBean(ProviderConfigHelper.class);
    ProviderConfig providerConfig = providerConfigHelper.getProviderConfig((Contract) contract, binding, target);
    try {
        providerConfigContainer.addProviderConfig(uniqueName, providerConfig);
    } catch (Exception e) {
        ...
    }
}
```

ServiceComponent 的 activate 方法中，根据组件绑定协议获取对应的 BindingAdapter，调用 outBinding 方法，进行服务发布。

```java
public void activate() throws ServiceRuntimeException {
    activateBinding();
    super.activate();
}
private void activateBinding() {
    ...
    if (service.hasBinding()) {
        ...
        Set<Binding> bindings = service.getBindings();
        for (Binding binding : bindings) {
            BindingAdapter<Binding> bindingAdapter = this.bindingAdapterFactory
                .getBindingAdapter(binding.getBindingType());
            ...
            Object outBindingResult;
            ...
            try {
                outBindingResult = bindingAdapter.outBinding(service, binding, target,
                                                             getContext());
            } catch (Throwable t) {
                ...
            }
            ...
        }
        ...
    }
    ...
}
```

BindingAdapter 的 outBinding 方法作用是服务发布，outBinding 方法有两个实现，一个是 JVM 协议的 JvmBindingAdapter，但方法中没有具体实现代码，也就是说发布 JVM 协议的服务不需要做特殊处理；另外一个是 RPC 协议的 RpcBindingAdapter，从 ProviderConfigContainer 中取出 ProviderConfig，调用 export 方法，将服务发布出去，并将服务提供者信息注册到注册中心上。

```java
public Object outBinding(Object contract, RpcBinding binding, Object target,
                         SofaRuntimeContext sofaRuntimeContext) {
    ApplicationContext applicationContext = sofaRuntimeContext.getSofaRuntimeManager()
        .getRootApplicationContext();
    ProviderConfigContainer providerConfigContainer = applicationContext
        .getBean(ProviderConfigContainer.class);
    ProcessorContainer processorContainer = applicationContext
        .getBean(ProcessorContainer.class);

    String uniqueName = providerConfigContainer.createUniqueName((Contract) contract, binding);
    ProviderConfig providerConfig = providerConfigContainer.getProviderConfig(uniqueName);
    processorContainer.processorProvider(providerConfig);

    ...

    try {
        providerConfig.export();
    } catch (Exception e) {
        ...
    }

    if (providerConfigContainer.isAllowPublish()) {
        providerConfig.setRegister(true);
        List<RegistryConfig> registrys = providerConfig.getRegistry();
        for (RegistryConfig registryConfig : registrys) {
            Registry registry = RegistryFactory.getRegistry(registryConfig);
            registry.init();
            registry.start();
            registry.register(providerConfig);
        }
    }
    return Boolean.TRUE;
}
```

#### ServiceClient

在分析过 ServiceFactoryBean 之后，再来看 ServiceClient 的源码，binding 的实现是相似的：通过 BindingConverter 工厂获取组件协议的 BindingConverter，调用 convert 方法将配置转换为组件协议 Binding。与 ServiceFactoryBean 不同的是，不管是否绑定了其他组件协议都会默认绑定 JVM 协议。调用 ComponentManager 的 register 方法，注册 ServiceComponent，从而实现服务的发布。

```java
public void service(ServiceParam serviceParam) {
    ...
    Service service = new ServiceImpl(serviceParam.getUniqueId(),
        serviceParam.getInterfaceType(), InterfaceMode.api, serviceParam.getInstance(), null);

    for (BindingParam bindingParam : serviceParam.getBindingParams()) {
        BindingConverter bindingConverter = bindingConverterFactory
            .getBindingConverter(bindingParam.getBindingType());
        ...
        Binding binding = bindingConverter.convert(bindingParam, bindingConverterContext);
        service.addBinding(binding);
    }

    boolean hasJvmBinding = false;
    for (Binding binding : service.getBindings()) {
        if (binding.getBindingType().equals(JvmBinding.JVM_BINDING_TYPE)) {
            hasJvmBinding = true;
            break;
        }
    }

    if (!hasJvmBinding) {
        service.addBinding(new JvmBinding());
    }

    ComponentInfo componentInfo = new ServiceComponent(implementation, service,
        bindingAdapterFactory, sofaRuntimeContext);
    sofaRuntimeContext.getComponentManager().register(componentInfo);
}
```

### 服务引用

#### ReferenceFactoryBean

ReferenceFactoryBean 的父类同样是 AbstractContractFactoryBean，通过 parseBindings 方法解析服务协议配置，从而获取服务支持的组件协议 bindings。

```java
public abstract class AbstractContractFactoryBean implements InitializingBean, FactoryBean,
                                                 ApplicationContextAware {
    ...
    protected List<Binding> bindings = new ArrayList<>(2);
    ...
    @Override
    public void afterPropertiesSet() throws Exception {
        List<Element> tempElements = new ArrayList<>();
        ...
        if (!apiType) {
            this.bindings = parseBindings(tempElements, applicationContext, isInBinding());
        }
        doAfterPropertiesSet();
    }
}
```

再看 ReferenceFactoryBean 的 doAfterPropertiesSet 方法：如果服务未配置任何组件协议，会默认绑定 JVM 协议。这里需要注意的一个细节，一个服务引用客户端只能绑定一种组件协议，因此就按顺序取配置协议中的第一个，绑定到服务引用客户端上。再调用 ReferenceRegisterHelper 的 registerReference 方法，注册 ReferenceComponent。

```java
protected void doAfterPropertiesSet() {
    ...
    Reference reference = buildReference();
    ...
    if (bindings.size() == 0) {
        // default reference prefer to ignore serialize
        JvmBindingParam jvmBindingParam = new JvmBindingParam();
        jvmBindingParam.setSerialize(false);
        bindings.add(new JvmBinding().setJvmBindingParam(jvmBindingParam));
    }

    reference.addBinding(bindings.get(0));
    proxy = ReferenceRegisterHelper.registerReference(reference, bindingAdapterFactory,
        sofaRuntimeContext, applicationContext);
}
```

在 ReferenceRegisterHelper 的 registerReference 方法中，如果服务引用绑定协议是 JVM 以外的协议，且配置了 JVM 调用优先，那么就在绑定协议中再追加一个 JVM 协议。再调用 ComponentManager 的 registerAndGet 方法，注册 ReferenceComponent。

```java
public class ReferenceRegisterHelper {
    ...
    public static Object registerReference(Reference reference,
                                           BindingAdapterFactory bindingAdapterFactory,
                                           SofaRuntimeContext sofaRuntimeContext,
                                           ApplicationContext applicationContext) {
        Binding binding = (Binding) reference.getBindings().toArray()[0];

        if (!binding.getBindingType().equals(JvmBinding.JVM_BINDING_TYPE)
            && !SofaRuntimeProperties.isDisableJvmFirst(sofaRuntimeContext)
            && reference.isJvmFirst()) {
            // as rpc invocation would be serialized, so here would Not ignore serialized
            reference.addBinding(new JvmBinding());
        }

        ComponentManager componentManager = sofaRuntimeContext.getComponentManager();
        ReferenceComponent referenceComponent = new ReferenceComponent(reference,
            new DefaultImplementation(), bindingAdapterFactory, sofaRuntimeContext);

        if (componentManager.isRegistered(referenceComponent.getName())) {
            return componentManager.getComponentInfo(referenceComponent.getName())
                .getImplementation().getTarget();
        }

        ComponentInfo componentInfo = componentManager.registerAndGet(referenceComponent);
        componentInfo.setApplicationContext(applicationContext);
        return componentInfo.getImplementation().getTarget();

    }
}
```

这里与服务发布的流程一样，在 ComponentManager 的注册方法中：调用 ReferenceComponent 的 register 方法，将组件状态更新为 REGISTERED。调用 resolve 方法，将组件状态更新为 RESOLVED。调用 activate 方法，激活组件，创建服务引用客户端代理，并将组件状态更新为 ACTIVATED。

```java
public ComponentInfo registerAndGet(ComponentInfo componentInfo) {
    return doRegister(componentInfo);
}
private ComponentInfo doRegister(ComponentInfo ci) {
    ...
    try {
        ci.register();
    } catch (Throwable t) {
        ...
        return null;
    }
    try {
        ...
        if (ci.resolve()) {
            typeRegistry(ci);
            ci.activate();
        }
    } catch (Throwable t) {
        ...
    }

    return ci;
}
```

ReferenceComponent 的 activate 方法中，如果只绑定了一种组件协议，就直接生成服务引用客户端代理；如果绑定了多种服务协议，这种情况是服务引用绑定的是 RPC 协议，且配置了 JVM 调用优先，会生成一种特殊的服务引用客户端代理，会先使用 JVM 协议调用服务，如果找不到 JVM 服务会降级使用 RPC 服务引用。

```java
public void activate() throws ServiceRuntimeException {
    if (reference.hasBinding()) {
        Binding candidate = null;
        Set<Binding> bindings = reference.getBindings();
        if (bindings.size() == 1) {
            candidate = bindings.iterator().next();
        } else if (bindings.size() > 1) {
            Object backupProxy = null;
            for (Binding binding : bindings) {
                if (JvmBinding.JVM_BINDING_TYPE.getType().equals(binding.getName())) {
                    candidate = binding;
                } else {
                    // Under normal RPC reference (local-first/jvm-first is not set to false) binding,
                    // backup proxy is the RPC proxy, which will be invoked if Jvm service is not found
                    backupProxy = createProxy(reference, binding);
                }
            }
            if (candidate != null) {
                ((JvmBinding) candidate).setBackupProxy(backupProxy);
            }
        }

        Object proxy = null;
        if (candidate != null) {
            proxy = createProxy(reference, candidate);
        }

        this.implementation = new DefaultImplementation();
        implementation.setTarget(proxy);
    }

    super.activate();
    ...
}
```

服务引用客户端代理是通过 createProxy 方法创建的，核心在于调用 inBinding 方法来生成代理。

```java
private Object createProxy(Reference reference, Binding binding) {
    BindingAdapter<Binding> bindingAdapter = bindingAdapterFactory.getBindingAdapter(binding.getBindingType());
    ...
    Object proxy;
    try {
        proxy = bindingAdapter.inBinding(reference, binding, sofaRuntimeContext);
    } finally {
        ...
    }
    return proxy;
}
```

BindingAdapter 的 inBinding 方法作用是服务引用，inBinding 方法有两个实现，先看一下 JVM 协议的 JvmBindingAdapter，创建一个 AOP 代理，实际调用会委托给 JvmServiceInvoker。

```java
public class JvmBindingAdapter implements BindingAdapter<JvmBinding> {
    public Object inBinding(Object contract, JvmBinding binding,
                            SofaRuntimeContext sofaRuntimeContext) {
        return createServiceProxy((Contract) contract, binding, sofaRuntimeContext);
    }
    private Object createServiceProxy(Contract contract, JvmBinding binding,
                                      SofaRuntimeContext sofaRuntimeContext) {
        ...
        try {
            ...
            ServiceProxy handler = new JvmServiceInvoker(contract, binding, sofaRuntimeContext);
            ProxyFactory factory = new ProxyFactory();
            if (javaClass.isInterface()) {
                factory.addInterface(javaClass);
                factory.addInterface(JvmBindingInterface.class);
            } else {
                factory.setTargetClass(javaClass);
                factory.setProxyTargetClass(true);
            }
            factory.addAdvice(handler);
            return factory.getProxy(newClassLoader);
        } finally {
            Thread.currentThread().setContextClassLoader(oldClassLoader);
        }
    }
}
```

另外一个是 RPC 协议的 RpcBindingAdapter，根据组件协议生成 ConsumerConfig，调用 refer 方法，生成服务引用。

```java
public abstract class RpcBindingAdapter implements BindingAdapter<RpcBinding> {
    public Object inBinding(Object contract, RpcBinding binding,
                            SofaRuntimeContext sofaRuntimeContext) {
        ...
        ConsumerConfig consumerConfig = consumerConfigHelper.getConsumerConfig((Contract) contract, binding);
        ...
        try {
            Object result = consumerConfig.refer();
            binding.setConsumerConfig(consumerConfig);
            return result;
        } catch (Exception e) {
            ...
        }
    }
}
```

#### ReferenceClient

ReferenceClient 引用服务实现是通过 ReferenceRegisterHelper 的 registerReference 方法，与 ReferenceFactoryBean 是一致的。

```java
public <T> T reference(ReferenceParam<T> referenceParam) {
    return (T) ReferenceRegisterHelper.registerReference(
        getReferenceFromReferenceParam(referenceParam), bindingAdapterFactory,
        sofaRuntimeContext);
}
```
