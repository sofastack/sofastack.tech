
---

title: "SOFABoot 4.0 正式发布，多项新特性等你来体验！"
aliases: "/sofa-boot/docs/upgrade_4_x"
---

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c2c467481d7844019332576418b5093c~tplv-k3u1fbpfcp-zoom-1.image)

# Part.1 「亿点点」新特性

## 基于 Java 17

SOFABoot 4.0 依赖 Java 17 作为最小支持的 JDK 版本。如果你的应用目前使用 Java 8 或 11，你需要先将自己的 JDK 版本升级到 17 才能基于 SOFABoot 4.0 进行开发。

## 二方库升级

SOFABoot 4.0 基于 Spring Boot 3.0 与 Spring Framework 6 构建。在 Spring Boot 3.0 与 Spring Framework 6 引入的二方库升级列表可参考文档👉 [Spring Boot 3.0 Release Notes](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-3.0-Release-Notes)

**在 SOFABoot 4.0 引入的二方库升级列表如下**：

- Spring Boot 3.0.7
- Spring Cloud 4.0.0
- Spring Cloud Stream 3.2.6
- SOFA Common tools 2.0.0
- SOFATracer 4.0.0
- SOFARPC 5.10.0
- FastJson 1.2.83
- Guava 31.1-jre
- Grpc 1.51.1
- Grpc common protos 2.11.0
- Druid 1.2.16
- ASM 9.4
- Javassist 3.29.2-GA
- Curator 4.3.0
- Dubbo 3.1.8
- Nacos 2.0.3
- Swagger 1.6.7
- Swagger2 2.2.8

## 基于 Jakarta EE

Spring Boot 3.0 中依赖 Jakarta EE 规范的部分已经升级到了 Jakarta EE 10 版本。例如，使用 Servlet 6.0 和 JPA 3.1 规范。因此，部分包的命名空间也进行了替换，例如你应该使用：

✅`jakarta.servlet.Filter`

而不是 `javax.servlet.Filter`。

同时，如果你使用了自己的依赖提供 Jakarta EE 规范的 API，需注意进行对应的依赖升级，例如你应该使用：

✅`jakarta.servlet:jakarta.servlet-api`

而不是 `javax.servlet:javax.servlet-api`。

可参考文档：[Migrate to Jakarta EE 9](https://docs.openrewrite.org/recipes/java/migrate/jakarta/javaxmigrationtojakarta) 来修改 Jakarta 相关的包名以及依赖。

## 支持 SOFAArk 2.0

[SOFAArk 2.0 模式](https://www.sofastack.tech/projects/sofa-boot/sofa-ark-migration-guide/)是 SOFAArk 框架的整体优化版本，相较于 SOFAArk 1.0 模式，它的整体优化思路和原则是 Ark Master Biz 保持和原生 SOFABoot 保持一致，弱化复杂的 Ark Plugin 类管控机制，将 Ark Plugin 与 Master Biz 合并。使得 Ark Master Biz 和原生 SOFABoot 应用的启动方式、类加载方式保持一致，大大降低了 Master Biz 应用的编程难度。

SOFABoot 4.0 版本不再支持 SOFAArk 1.0 模式，如果你想要在 SOFABoot 应用中使用 SOFAArk 2.0 模式，可以按照以下步骤进行操作：

**1、在项目中引入 SOFAArk 组件依赖**

```xml
<dependency>  
<groupId>com.alipay.sofa</groupId>  
<artifactId>ark-sofa-boot-starter</artifactId>
</dependency>

```

**2、添加 Spring Boot 的 Package 插件**

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-maven-plugin</artifactId>

            <configuration>
                <outputDirectory>target</outputDirectory>
                <classifier>ark-biz</classifier>
            </configuration>
            <executions>
                <execution>
                    <id>package</id>
                    <goals>
                        <goal>repackage</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```

**3、启动应用**

- 方式一：

IDEA 启动，注意需要添加启动参数：`-Dsofa.ark.embed.enable=true -Dcom.alipay.sofa.ark.master.biz=${bizName}`

- 方式二：

命令行启动，先运行 `mvn clean package` 命令进行打包，生成 ${bizName}-${bizVersion}-ark-biz.jar 的可执行文件，然后在终端运行以下启动参数：

`java -jar -Dsofa.ark.embed.enable=true -Dcom.alipay.sofa.ark.master.biz=${bizName} ${bizName}-${bizVersion}-ark-biz.jar`

## 支持场景化的按配置加载能力

通常情况下，应用在不同的场景下可能需要开启或者关闭不同的功能，Spring Boot 提供了丰富的 Configuration 动态配置能力[4] 能力以支持应用在不同的场景下加载不同的 Bean。  
SOFABoot 在此基础上，对 `org.springframework.context.ApplicationContextInitializer` 等扩展点进行了增强，支持通过统一风格的配置定制各类 Bean 以及扩展点的开启与关闭，并提供了定制模版配置的开启方式以降低应用配置项的复杂度。

- 通过：

`com.alipay.sofa.boot.autoconfigure.condition.ConditionalOnSwitch` 注解为 Bean 添加按配置开启能力：

```java
@Configuration(proxyBeanMethods = false)
@ConditionalOnSwitch(id="sample")
public class SampleConfiguration {

    @Bean
    public SampleBean sampleBean() {
        return new SampleBean();
    }
}
```

添加：

`sofa.boot.switch.bean.sample.enabled=false` 配置后，`SampleConfiguration` 配置类将不再加载。

- 通过继承：

`com.alipay.sofa.boot.Initializer.SwitchableApplicationContextInitializer` 类为：

`ApplicationContextInitializer` 添加按配置开启能力：

```java
public class SampleSwitchSpringContextInitializer extends
                                                     SwitchableApplicationContextInitializer {
    @Override
    protected void doInitialize(ConfigurableApplicationContext applicationContext) {
        applicationContext.getEnvironment().addActiveProfile("sampleswitchtest");
    }

    @Override
    protected String switchKey() {
        return "sample";
    }

}
```

添加：

`sofa.boot.switch.initializer.sample.enabled=false` 配置后，

`SampleSwitchSpringContextInitializer` 类将不再执行 `doInitialize` 方法。

- 通过继承：

`com.alipay.sofa.boot.listener.SwitchableApplicationListener` 类为：

`ApplicationListener` 添加添加按配置开启能力：

```java
public class SampleSwitchApplicationListener
                                                 extends
                                                 SwitchableApplicationListener<ContextRefreshedEvent> {

    @Override
    protected void doOnApplicationEvent(ContextRefreshedEvent event) {
        SampleBean sampleBean = event.getApplicationContext().getBean(SampleBean.class);
        sampleBean.setTrigger(true);
    }

    @Override
    protected String switchKey() {
        return "sample";
    }

}
```

添加：

`sofa.boot.switch.listener.sample.enabled=false` 配置后，

`SampleSwitchApplicationListener` 类将不再执行 `doOnApplicationEvent` 方法。

在使用上述扩展点为你的 Bean 和扩展点添加按配置开启能力后，你可以在 `/sofa-boot/scenens` 目录下添加指定场景名 `scene-key` 前缀的配置文件 *（支持 application 及 yaml 格式）* ，在配置文件中添加该场景下的配置文件模版，例如：

```xml
sofa.boot.switch.bean.a.enabled=false
sofa.boot.switch.bean.b.enabled=true
sofa.boot.switch.initializer.a.enabled=false
sofa.boot.switch.initializer.b.enabled=false
sofa.boot.switch.initializer.c.enabled=false
```

当你的应用打包后，你只需要添加配置 `sofa.boot.scenens=scene-key` 便可以生效 `/sofa-boot/scenens/scene-key.properites` 配置文件中的开关配置。该配置项同时支持配置多个场景名，可以同时生效多个场景配置文件。

## 启动耗时统计能力增强

SOFABoot 在 3.6.0 版本提供了 `/actuator/startup` 能力用于查询应用启动过程中的耗时细节。后来，Spring Boot 在 2.4 版本也提供了官方的 `/actuator/startup` 能力用于展示应用启动耗时详情。在 SOFA Boot 4.0 版本中，我们整合了 SOFA Boot 与 Spring Boot 提供的启动耗时统计能力：

- 保留了 SOFABoot 特有的阶段耗时统计能力，例如 SOFA 模块化刷新耗时统计、健康检查耗时统计等；

- 使用 Spring Framework 提供的 `org.springframework.boot.context.metrics.buffering.BufferingApplicationStartup` 统计 Applicaiton Context 的启动耗时详情。

你可以通过下述方式使用 SOFABoot 增强的 `/actuator/startup` 能力：

**1、在项目中引入 actuator 组件依赖：**

```xml
<dependency>
  <groupId>com.alipay.sofa</groupId>
  <artifactId>actuator-sofa-boot-starter</artifactId>
</dependency>
```

**2、使用：**

`com.alipay.sofa.boot.startup.StartupSpringApplication` **作为启动类启动应用：**

```java
public static void main(String[] args) {
    StartupSpringApplication startupSpringApplication = new StartupSpringApplication(Sofaboot4DemoApplication.class);
    startupSpringApplication.run(args);
}
```

**3、启动应用后，访问：**

localhost:8080/actuator/startup **查看启动耗时详情信息。**

## 更丰富的 SPI

SOFABoot 4.0 版本中新增了大量 SPI ，你可以通过这些 SPI 定制 SOFABoot 框架的运行逻辑。

- **添加自定义的启动耗时阶段信息**

`com.alipay.sofa.boot.startup.StartupReporterAware` 接口的使用方式与 `org.springframework.context.ApplicationContextAware` 接口的使用方法使用类似，当你的 Bean 实现了该接口时，你可以感知到应用中的：`com.alipay.sofa.boot.startup.StartupReporter` 实例。

`com.alipay.sofa.boot.startup.StartupReporter` 类用于管理 SOFABoot 提供的 `/actuator/startup` 耗时信息，你可以通过 `com.alipay.sofa.boot.startup.StartupReporter#addCommonStartupStat` 方法添加你定制的耗时阶段信息。

- **添加自定义的 Bean 启动耗时信息**

`com.alipay.sofa.boot.startup.BeanStatCustomizer` 接口用于定制 SOFABoot 提供的 `/actuator/startup` 耗时信息中的 Bean 启动耗时特征。如果你想注册自定义的 `com.alipay.sofa.boot.startup.BeanStatCustomizer` 接口实现类，需要在 `META-INF/spring.factories` 文件注册 Spring Factories 形式的 SPI。你可以参考框架内置的 `com.alipay.sofa.runtime.startup.ComponentBeanStatCustomizer` 类用于提取 ServiceFactoryBean 类型的 Bean 的 Interface 字段用于展示。

- **定制 BeanPostProcessor 与 BeanFactoryPostProcessor 在 SOFA 上下文中的共享模式**

在开启模块化隔离特性时，你在 Spring Boot 上下文中注册的 `BeanPostProcessor` 以及 `BeanFactoryPostProcessor` 将 BeanDefinition 将被共享至所有的 SOFA 模块中，每个 SOFA 模块的上下文中都会创建一个 PostProcessor 类的实例。你可以通过以下方式，修改指定的 `BeanPostProcessor` 或者`BeanFactoryPostProcessor` 的共享方式：

- * 在 PostProcessor 类上添加：

`com.alipay.sofa.boot.context.processor.UnshareSofaPostProcessor` 注解，PostProcessor 将不会被共享至 SOFA 模块中。

- * 在 PostProcessor 类上添加：

`com.alipay.sofa.boot.context.processor.SingletonSofaPostProcessor` 注解，SOFA Boot 框架会获取其在 Spring Boot 上下文中的 Singleton 实例注册至 SOFA 模块中，而不是注册 BeanDefinition，这将确保 PostProcessor 类在整个应用中保持单例。

- * 自定义：

`com.alipay.sofa.boot.context.processor.SofaPostProcessorShareFilter` 接口的实现类并将其注册至 Spring Boot 上下文中，通过 bean name 或 bean class 指定 PostProcessor 的共享方式。

- **添加感知 SOFA 模块刷新的扩展点**

在开启模块化隔离特性时，你可以自定义 `com.alipay.sofa.boot.context.ContextRefreshInterceptor` 接口的实现类并将其注册至 Spring Boot 上下文中，当每个 SOFA 模块的 Spring 上下文开始刷新前以及刷新完成后，都会触发该接口的 `beforeRefresh` 以及 `afterRefresh` 方法。

你可以参考框架内置的：`com.alipay.sofa.runtime.context.ComponentContextRefreshInterceptor` 类，它用于在 SOFA 模块中的 Spring 上下文刷新成功后，将其注为 `SpringContextComponent`，在 SOFA 模块中的 Spring 上下文刷新失败后取消注册的 `ComponentInfo`。

- **支持注解参数的占位符替换**

在一些情况下，我们希望自定义注解中的属性使用非固定值，通过 Spring 配置进行定制。SOFABoot 提供了：

`com.alipay.sofa.boot.annotation.WrapperAnnotation` 工具类，用于快速实现上述功能。例如，你自定义了一个注解类 `DemoAnnotation`，并在某个类上使用了该注解：

```java
@Retention(RetentionPolicy.RUNTIME)
@Target({ ElementType.FIELD, ElementType.METHOD, ElementType.PARAMETER })
public @interface DemoAnnotation {

    String key() default "";
}   
```

```java
@DemoAnnotation(key = "${spring.annotation.config}")
public class TestClass {
}
```

通过以下方式获取的 key 字段数值将转换为你在 Spring Envrionment 中定义的 `spring.annotation.config` 配置值：

```java
public String getAnnotationKey(Environment environment, DemoAnnotation demoAnnotation) {
    AnnotationWrapper<DemoAnnotation> serviceAnnotationWrapper = AnnotationWrapper.create(DemoAnnotation.class)
        .withEnvironment(environment)
        .withBinder(DefaultPlaceHolderBinder.INSTANCE);
    return serviceAnnotationWrapper.wrap(demoAnnotation).key();
}
```

# **Part.2 注意有重命名哦!**

**请先留意以下信息！**

- 通过 actuator-sofa-boot-starter 引入的 SOFABoot 增强的 actuator 能力，通过配置项定制开启的 actuator。
- 依赖 health-sofa-boot-starter 与 startup-sofa-boot-starter 已被废弃，请使用 actuator-sofa-boot-starter 替换。
- 依赖 log-sofa-boot-starter 已被废弃，如果你引入了其他的 sofa boot starter，可以直接删除该依赖。如果你没有引入任何其他 sofa boot starter，使用 sofa-boot-starter 代替它。
- 依赖 rpc-sofa-boot-plugin、runtime-sofa-boot-plugin、tracer-sofa-boot-plugin 已被废弃，可使用 ark-sofa-boot-starter 代替它们。

我们对下表中包名下的类进行了重命名，如果你使用了对应的类，则需要修改为新的包名：

| 原包名                                | 新包名                                |
| ------------------------------------- | ------------------------------------- |
| com.alipay.sofa.startup               | com.alipay.sofa.boot.actuator.startup |
| com.alipay.sofa.healthcheck           | com.alipay.sofa.boot.actuator.health  |
| com.alipay.sofa.isle                  | com.alipay.sofa.boot.isle             |
| com.alipay.sofa.tracer.boot           | com.alipay.sofa.boot.tracer           |
| com.alipay.sofa.service.api.component | com.alipay.sofa.runtime.ext           |

SOFABoot 提供的以下 API 类进行了重命名，如果你使用了对应的类，则需要修改为新的类名：

| 原类名                                                       | 新类名                                                       |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| com.alipay.sofa.healthcheck.core.HealthChecker               | com.alipay.sofa.boot.actuator.health.HealthChecker           |
| com.alipay.sofa.healthcheck.startup.ReadinessCheckCallback   | com.alipay.sofa.boot.actuator.health.ReadinessCheckCallback  |
| com.alipay.sofa.runtime.spring.singleton.SingletonSofaPostProcessor | com.alipay.sofa.boot.context.processor.SingletonSofaPostProcessor |
| com.alipay.sofa.runtime.spring.share.UnshareSofaPostProcessor | com.alipay.sofa.boot.context.processor.UnshareSofaPostProcessor |
| com.alipay.sofa.runtime.factory.BeanLoadCostBeanFactory      | com.alipay.sofa.boot.context.SofaDefaultListableBeanFactory  |

# Part.3 废弃特性

**再见啦，SOFAArk 1.0**

SOFABoot 4.0 不再支持 SOFAArk 1.0 模式，用于支持 Ark 测试的相关工具类已被移除，SOFAArk 2.0 模式下你不再需要这些类：  

- com.alipay.sofa.test.annotation.DelegateToRunner
- com.alipay.sofa.test.runner.SofaBootRunner
- com.alipay.sofa.test.runner.SofaJUnit4Runner

# Part.4 请收下这份升级指南🙆🏻‍♂️

## Before You Start

### 升级 SOFABoot 至 最新的 3.x 版本

在开始升级之前，请确保升级到最新可用的 3.x 版本。这将确保你正在针对该行的最新依赖项进行构建。

### 检查依赖列表

迁移到 SOFABoot 4.0 将升级许多依赖项 *（包括 Spring Boot 3.0 升级的依赖项）* ，请确认依赖项升级对你的应用的影响。请参考：

- [Spring Boot 2.7.x 依赖索引](https://docs.spring.io/spring-boot/docs/2.7.x/reference/html/dependency-versions.html#appendix.dependency-versions)

- [Spring Boot 3.0.x 依赖索引](https://docs.spring.io/spring-boot/docs/3.0.x/reference/html/dependency-versions.html#appendix.dependency-versions)

### 检查已废弃的特性

SOFABoot 3 以及 Spring Boot 2 中弃用的类、方法和属性，请确保在升级之前没有调用已弃用的功能。详情请参考上方「**Part.3 废弃特性｜再见啦，SOFAArk 1.0**」章节。

### 检查系统配置

SOFABoot 4.0 依赖 Java 17 或者更高的版本，不再支持 Java 8。同时依赖 Spring Boot 3.0。

## 升级至 SOFA Boot 4.0

### 修改重命名的配置项

请参考下方「**Part.5 附录｜配置变更**」章节以及文档 [Spring Boot 2 -> 3 配置变更](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-3.0-Configuration-Changelog)

### 修改重命名的类与依赖

参考上方「**Part.2 注意有重命名哦！** 」章节

### 升级 Spring Boot 3.0

参考文档： [Spring Boot 3.0 升级文档](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-3.0-Migration-Guide)

# Part.5 附录｜配置变更

*注：配置属性对比基于 3.16.3 与 4.0 版本。*

- **在 4.0 版本中废弃的配置**

| key                                                          |
| ------------------------------------------------------------ |
| com.alipay.sofa.boot.serviceNameWithBeanId                   |
| com.alipay.sofa.boot.unregisterComponentWhenModuleInstallFailure |
| com.alipay.sofa.boot.startup.skipSofaBean                    |

- **在 4.0 版本中新增的配置**

| key                                          | default value | description                                          |
| -------------------------------------------- | ------------- | ---------------------------------------------------- |
| sofa.boot.isle.ignoreModules                 | 无            | 指定忽略的 SOFA 模块列表                             |
| sofa.boot.isle.ignoreCalculateRequireModules | 无            | 指定忽略 require module 属性的 SOFA 模块列表         |
| sofa.boot.scenes                             | 无            | 开启的场景配置列表                                   |
| sofa.boot.startup.bufferSize                 | 4096          | 框架内置的 BufferingApplicationStartup 的缓存大小    |
| sofa.boot.threadPoolMonitor.disable          | false         | 关闭 SOFA 线程池监控能力                             |
| sofa.boot.rpc.enableAutoPublish              | false         | 支持应用启动时自动发布 rpc 服务，不依赖 Actuator 模块 |

- **在 4.0 版本中重命名的配置**

**runtime properties**

| origin key                                        | replaced key                                  |
| ------------------------------------------------- | --------------------------------------------- |
| com.alipay.sofa.boot.jvmFilterEnable              | sofa.boot.runtime.jvmFilterEnable             |
| com.alipay.sofa.boot.disableJvmFirst              | sofa.boot.runtime.disableJvmFirst             |
| com.alipay.sofa.boot.skipJvmReferenceHealthCheck  | sofa.boot.runtime.skipJvmReferenceHealthCheck |
| com.alipay.sofa.boot.extensionFailureInsulating   | sofa.boot.runtime.extensionFailureInsulating  |
| com.alipay.sofa.boot.skipExtensionHealthCheck     | sofa.boot.runtime.skipExtensionHealthCheck    |
| com.alipay.sofa.boot.serviceInterfaceTypeCheck    | sofa.boot.runtime.serviceInterfaceTypeCheck   |
| com.alipay.sofa.boot.skipAllComponentShutdown     | sofa.boot.runtime.skipAllComponentShutdown    |
| com.alipay.sofa.boot.skipCommonComponentShutdown  | sofa.boot.runtime.skipCommonComponentShutdown |
| com.alipay.sofa.boot.asyncInitBeanCoreSize        | sofa.boot.runtime.asyncInitExecutorCoreSize   |
| com.alipay.sofa.boot.asyncInitBeanMaxSize         | sofa.boot.runtime.asyncInitExecutorMaxSize    |
| com.alipay.sofa.boot.dynamicJvmServiceCacheEnable | sofa.boot.ark.jvmServiceCache                 |
| com.alipay.sofa.boot.skipJvmSerialize             | sofa.boot.ark.jvmInvokeSerialize              |
| com.alipay.sofa.boot.beanLoadCost                 | sofa.boot.startup.costThreshold               |

**isle properties**

| origin key                                                   | replaced key                                 |
| ------------------------------------------------------------ | -------------------------------------------- |
| com.alipay.sofa.boot.activeProfiles                          | sofa.boot.isle.activeProfiles                |
| com.alipay.sofa.boot.allowBeanDefinitionOverriding           | sofa.boot.isle.allowBeanDefinitionOverriding |
| com.alipay.sofa.boot.moduleStartUpParallel                   | sofa.boot.isle.moduleStartUpParallel         |
| com.alipay.sofa.boot.publishEventToParent                    | sofa.boot.isle.publishEventToParent          |
| com.alipay.sofa.boot.enableIsle                              | sofa.boot.isle.enabled                       |
| com.alipay.sofa.boot.allowModuleOverriding                   | sofa.boot.isle.allowModuleOverriding         |
| com.alipay.sofa.boot.ignoreModuleInstallFailure              | sofa.boot.isle.ignoreModuleInstallFailure    |
| com.alipay.sofa.boot.parallelRefreshCoreCountFactor          | sofa.boot.isle.parallelRefreshPoolSizeFactor |
| com.alipay.sofa.boot.parallelRefreshTimeout                  | sofa.boot.isle.parallelRefreshTimeout        |
| com.alipay.sofa.boot.parallelRefreshCheckPeriod              | sofa.boot.isle.parallelRefreshCheckPeriod    |
| com.alipay.sofa.boot.share.parent.context.post.processor.enabled | sofa.boot.isle.shareParentPostProcessor      |

**actuator properties**

| origin key                                                 | replaced key                                                 |
| ---------------------------------------------------------- | ------------------------------------------------------------ |
| com.alipay.sofa.boot.manualReadinessCallback               | sofa.boot.actuator.health.manualReadinessCallback            |
| com.alipay.sofa.healthcheck.skip.all                       | sofa.boot.actuator.health.skipAll                            |
| com.alipay.sofa.healthcheck.skip.component                 | sofa.boot.actuator.health.skipHealthChecker                  |
| com.alipay.sofa.healthcheck.skip.indicator                 | sofa.boot.actuator.health.skipHealthIndicator                |
| com.alipay.sofa.healthcheck.component.check.retry.count    | sofa.boot.actuator.health.healthCheckerConfig.components.retryCount |
| com.alipay.sofa.healthcheck.component.check.retry.interval | sofa.boot.actuator.health.healthCheckerConfig.components.retryTimeInterval |
| com.alipay.sofa.healthcheck.component.check.strict.enabled | sofa.boot.actuator.health.healthCheckerConfig.components.strictCheck |
| com.alipay.sofa.healthcheck.component.timeout              | sofa.boot.actuator.health.healthCheckerConfig.components.timeout |
| com.alipay.sofa.healthcheck.module.check.retry.count       | sofa.boot.actuator.health.healthCheckerConfig.modules.retryCount |
| com.alipay.sofa.healthcheck.module.check.retry.interval    | sofa.boot.actuator.health.healthCheckerConfig.modules.retryTimeInterval |
| com.alipay.sofa.healthcheck.module.check.strict.enabled    | sofa.boot.actuator.health.healthCheckerConfig.modules.strictCheck |
| com.alipay.sofa.healthcheck.module.timeout                 | sofa.boot.actuator.health.healthCheckerConfig.modules.timeout |
| com.alipay.sofa.healthcheck.default.timeout                | sofa.boot.actuator.health.globalHealthCheckerTimeout         |
| com.alipay.sofa.healthcheck.indicator.timeout              | sofa.boot.actuator.health.globalHealthIndicatorTimeout       |
| com.alipay.sofa.boot.healthCheckInsulator                  | sofa.boot.actuator.health.insulator                          |
| com.alipay.sofa.boot.healthCheckParallelEnable             | sofa.boot.actuator.health.parallelCheck                      |
| com.alipay.sofa.boot.healthCheckParallelTimeout            | sofa.boot.actuator.health.parallelCheckTimeout               |
| com.alipay.sofa.boot.excludedIndicators                    | sofa.boot.actuator.health.excludedIndicators                 |

**tracer properties**

| origin key                                        | replaced key                                |
| ------------------------------------------------- | ------------------------------------------- |
| com.alipay.sofa.tracer.datasource.enable          | sofa.boot.tracer.datasource.enabled         |
| com.alipay.sofa.tracer.feign.enabled              | sofa.boot.tracer.feign.enabled              |
| com.alipay.sofa.tracer.springmvc.enable           | sofa.boot.tracer.springmvc.enabled          |
| com.alipay.sofa.tracer.springmvc.filterOrder      | sofa.boot.tracer.springmvc.filterOrder      |
| com.alipay.tracer.kafka.enabled                   | sofa.boot.tracer.kafka.enabled              |
| com.alipay.tracer.mongodb.enabled                 | sofa.boot.tracer.mongodb.enabled            |
| com.alipay.sofa.tracer.rabbitmq.enable            | sofa.boot.tracer.rabbitmq.enabled           |
| com.alipay.sofa.tracer.redis.enabled              | sofa.boot.tracer.redis.enabled              |
| com.alipay.sofa.tracer.resttemplate               | sofa.boot.tracer.resttemplate.enabled       |
| com.alipay.sofa.tracer.rocketmq                   | sofa.boot.tracer.rocketmq.enabled           |
| com.alipay.sofa.tracer.message                    | sofa.boot.tracer.springmessage.enabled      |
| com.alipay.sofa.tracer.flexible                   | sofa.boot.tracer.flexible.enabled           |
| com.alipay.sofa.tracer.zipkin.enabled             | sofa.boot.tracer.zipkin.enabled             |
| com.alipay.sofa.tracer.zipkin.baseUrl             | sofa.boot.tracer.zipkin.baseUrl             |
| com.alipay.sofa.tracer.zipkin.gzipped             | sofa.boot.tracer.zipkin.gzipped             |
| com.alipay.sofa.tracer.disableDigestLog           | sofa.boot.tracer.disableDigestLog           |
| com.alipay.sofa.tracer.disableConfiguration       | sofa.boot.tracer.disableConfiguration       |
| com.alipay.sofa.tracer.tracerGlobalRollingPolicy  | sofa.boot.tracer.tracerGlobalRollingPolicy  |
| com.alipay.sofa.tracer.tracerGlobalLogReserveDay  | sofa.boot.tracer.tracerGlobalLogReserveDay  |
| com.alipay.sofa.tracer.statLogInterval            | sofa.boot.tracer.statLogInterval            |
| com.alipay.sofa.tracer.baggageMaxLength           | sofa.boot.tracer.baggageMaxLength           |
| com.alipay.sofa.tracer.samplerName                | sofa.boot.tracer.samplerName                |
| com.alipay.sofa.tracer.samplerPercentage          | sofa.boot.tracer.samplerPercentage          |
| com.alipay.sofa.tracer.samplerCustomRuleClassName | sofa.boot.tracer.samplerCustomRuleClassName |
| com.alipay.sofa.tracer.reporterName               | sofa.boot.tracer.reporterName               |
| com.alipay.sofa.tracer.jsonOutput                 | sofa.boot.tracer.jsonOutput                 |

**rpc properties**

| origin key                                              | replaced key                                      |
| ------------------------------------------------------- | ------------------------------------------------- |
| com.alipay.sofa.rpc.aftRegulationEffective              | sofa.boot.rpc.aftRegulationEffective              |
| com.alipay.sofa.rpc.aftDegradeEffective                 | sofa.boot.rpc.aftDegradeEffective                 |
| com.alipay.sofa.rpc.aftTimeWindow                       | sofa.boot.rpc.aftTimeWindow                       |
| com.alipay.sofa.rpc.aftLeastWindowCount                 | sofa.boot.rpc.aftLeastWindowCount                 |
| com.alipay.sofa.rpc.aftLeastWindowExceptionRateMultiple | sofa.boot.rpc.aftLeastWindowExceptionRateMultiple |
| com.alipay.sofa.rpc.aftWeightDegradeRate                | sofa.boot.rpc.aftWeightDegradeRate                |
| com.alipay.sofa.rpc.aftWeightRecoverRate                | sofa.boot.rpc.aftWeightRecoverRate                |
| com.alipay.sofa.rpc.aftDegradeLeastWeight               | sofa.boot.rpc.aftDegradeLeastWeight               |
| com.alipay.sofa.rpc.aftDegradeMaxIpCount                | sofa.boot.rpc.aftDegradeMaxIpCount                |
| com.alipay.sofa.rpc.boltPort                            | sofa.boot.rpc.boltPort                            |
| com.alipay.sofa.rpc.boltThreadPoolCoreSize              | sofa.boot.rpc.boltThreadPoolCoreSize              |
| com.alipay.sofa.rpc.boltThreadPoolMaxSize               | sofa.boot.rpc.boltThreadPoolMaxSize               |
| com.alipay.sofa.rpc.boltThreadPoolQueueSize             | sofa.boot.rpc.boltThreadPoolQueueSize             |
| com.alipay.sofa.rpc.boltAcceptsSize                     | sofa.boot.rpc.boltAcceptsSize                     |
| com.alipay.sofa.rpc.boltProcessInIoThread               | sofa.boot.rpc.boltProcessInIoThread               |
| com.alipay.sofa.rpc.enableSwagger                       | sofa.boot.rpc.enableSwagger                       |
| com.alipay.sofa.rpc.mockUrl                             | sofa.boot.rpc.mockUrl                             |
| com.alipay.sofa.rpc.h2cPort                             | sofa.boot.rpc.h2cPort                             |
| com.alipay.sofa.rpc.h2cThreadPoolCoreSize               | sofa.boot.rpc.h2cThreadPoolCoreSize               |
| com.alipay.sofa.rpc.h2cThreadPoolMaxSize                | sofa.boot.rpc.h2cThreadPoolMaxSize                |
| com.alipay.sofa.rpc.h2cThreadPoolQueueSize              | sofa.boot.rpc.h2cThreadPoolQueueSize              |
| com.alipay.sofa.rpc.h2cAcceptsSize                      | sofa.boot.rpc.h2cAcceptsSize                      |
| com.alipay.sofa.rpc.restHostname                        | sofa.boot.rpc.restHostname                        |
| com.alipay.sofa.rpc.restPort                            | sofa.boot.rpc.restPort                            |
| com.alipay.sofa.rpc.restIoThreadSize                    | sofa.boot.rpc.restIoThreadSize                    |
| com.alipay.sofa.rpc.restContextPath                     | sofa.boot.rpc.restContextPath                     |
| com.alipay.sofa.rpc.restAllowedOrigins                  | sofa.boot.rpc.restAllowedOrigins                  |
| com.alipay.sofa.rpc.restThreadPoolCoreSize              | sofa.boot.rpc.restThreadPoolCoreSize              |
| com.alipay.sofa.rpc.restThreadPoolMaxSize               | sofa.boot.rpc.restThreadPoolMaxSize               |
| com.alipay.sofa.rpc.restMaxRequestSize                  | sofa.boot.rpc.restMaxRequestSize                  |
| com.alipay.sofa.rpc.restTelnet                          | sofa.boot.rpc.restTelnet                          |
| com.alipay.sofa.rpc.restDaemon                          | sofa.boot.rpc.restDaemon                          |
| com.alipay.sofa.rpc.restSwagger                         | sofa.boot.rpc.restSwagger                         |
| com.alipay.sofa.rpc.dubboPort                           | sofa.boot.rpc.dubboPort                           |
| com.alipay.sofa.rpc.dubboIoThreadSize                   | sofa.boot.rpc.dubboIoThreadSize                   |
| com.alipay.sofa.rpc.dubboThreadPoolCoreSize             | sofa.boot.rpc.dubboThreadPoolCoreSize             |
| com.alipay.sofa.rpc.dubboThreadPoolMaxSize              | sofa.boot.rpc.dubboThreadPoolMaxSize              |
| com.alipay.sofa.rpc.dubboThreadPoolQueueSize            | sofa.boot.rpc.dubboThreadPoolQueueSize            |
| com.alipay.sofa.rpc.dubboAcceptsSize                    | sofa.boot.rpc.dubboAcceptsSize                    |
| com.alipay.sofa.rpc.httpPort                            | sofa.boot.rpc.httpPort                            |
| com.alipay.sofa.rpc.httpThreadPoolCoreSize              | sofa.boot.rpc.httpThreadPoolCoreSize              |
| com.alipay.sofa.rpc.httpThreadPoolMaxSize               | sofa.boot.rpc.httpThreadPoolMaxSize               |
| com.alipay.sofa.rpc.httpThreadPoolQueueSize             | sofa.boot.rpc.httpThreadPoolQueueSize             |
| com.alipay.sofa.rpc.httpAcceptsSize                     | sofa.boot.rpc.httpAcceptsSize                     |
| com.alipay.sofa.rpc.triplePort                          | sofa.boot.rpc.triplePort                          |
| com.alipay.sofa.rpc.tripleThreadPoolCoreSize            | sofa.boot.rpc.tripleThreadPoolCoreSize            |
| com.alipay.sofa.rpc.tripleThreadPoolMaxSize             | sofa.boot.rpc.tripleThreadPoolMaxSize             |
| com.alipay.sofa.rpc.tripleThreadPoolQueueSize           | sofa.boot.rpc.tripleThreadPoolQueueSize           |
| com.alipay.sofa.rpc.tripleAcceptsSize                   | sofa.boot.rpc.tripleAcceptsSize                   |
| com.alipay.sofa.rpc.registryAddress                     | sofa.boot.rpc.registryAddress                     |
| com.alipay.sofa.rpc.virtualHost                         | sofa.boot.rpc.virtualHost                         |
| com.alipay.sofa.rpc.virtualPort                         | sofa.boot.rpc.virtualPort                         |
| com.alipay.sofa.rpc.enabledIpRange                      | sofa.boot.rpc.enabledIpRange                      |
| com.alipay.sofa.rpc.bindNetworkInterface                | sofa.boot.rpc.bindNetworkInterface                |
| com.alipay.sofa.rpc.boundHost                           | sofa.boot.rpc.boundHost                           |
| com.alipay.sofa.rpc.lookoutCollectDisable               | sofa.boot.rpc.lookoutCollectDisable               |
| com.alipay.sofa.rpc.registries                          | sofa.boot.rpc.registries                          |
| com.alipay.sofa.rpc.enableMesh                          | sofa.boot.rpc.enableMesh                          |
| com.alipay.sofa.rpc.consumerRepeatedReferenceLimit      | sofa.boot.rpc.consumerRepeatedReferenceLimit      |
| com.alipay.sofa.rpc.hystrixEnable                       | sofa.boot.rpc.hystrixEnable                       |
| com.alipay.sofa.rpc.defaultTracer                       | sofa.boot.rpc.defaultTracer                       |
| com.alipay.sofa.rpc.dynamicConfig                       | sofa.boot.rpc.dynamicConfig                       |
| sofa.rpc.registry.disablePub                            | sofa.boot.rpc.registry.disablePub                 |
| sofa.rpc.registry.defaultRegistry                       | sofa.boot.rpc.registry.defaultRegistry            |

**了解更多...**

**SOFABoot Star 一下✨：**  
[https://github.com/sofastack/sofa-boot](https://github.com/sofastack/sofa-boot)
