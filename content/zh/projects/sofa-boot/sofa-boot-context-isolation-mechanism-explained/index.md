---
title: "源码解析｜SOFABoot 上下文隔离机制解析"
author: "梁倍宁"
authorlink: "https://github.com/icodening"
description: "源码解析｜SOFABoot 上下文隔离机制解析"
categories: "SOFAStack"
tags: [“源码解析”]
date: 2022-07-22T15:00:00+08:00
---

## 前言

> SOFABoot的isle模块为Spring Boot应用提供了上下文隔离的能力以更好的支持模块化开发。借助该能力，可以很好的解决不同模块中的Bean冲突问题，有效的提高了团队协作开发的效率，尽可能的避免因冲突带来的额外时间成本
SOFABoot的模块隔离能力，也叫做Spring上下文隔离能力，相较于`类加载器隔离`的实现方式，Spring上下文隔离的实现更为简单。SOFA给每一个模块都提供了一个独立的Spring上下文，这样各模块之间的Bean就无法直接引用，直接引用时通常会出现NoSuchBeanDefinitionException表示当前容器没有指定的Bean，以达到各模块在`运行时`隔离的效果。

## 模块化启动相关类

| 类名                                                   | 描述                                                         |
| ------------------------------------------------------ | ------------------------------------------------------------ |
| com.alipay.sofa.isle.stage.PipelineStage               | 该接口是PipelineContext中一个步骤的描述，SOFA将启动行为抽象成了一条流水线中的各个步骤 |
| com.alipay.sofa.isle.stage.ModelCreatingStage          | 该类是PipelineStage实现之一，其主要作用是创建模块            |
| com.alipay.sofa.isle.stage.SpringContextInstallStage   | 该类是PipelineStage实现之一，其主要作用是将SOFA定义的“模块”安装到Spring的上下文中，也是SOFA模块化中最关键的一个步骤 |
| com.alipay.sofa.isle.stage.ModuleLogOutputStage        | 该类是PipelineStage实现之一，其主要作用只是模块化的相关日志  |
| com.alipay.sofa.isle.spring.SofaModuleContextLifecycle | 该类是SOFA模块化核心实现的入口类，实现了SmartLifecycle接口，会在Spring发布ContextRefreshed事件之前调用 |

## 主体流程

### SofaModuleContextLifecycle

SOFABoot的模块化能力主要是基于Spring的`Lifecycle`来实现的，核心的入口类为`com.alipay.sofa.isle.spring.SofaModuleContextLifecycle`，该类实现了Spring的`org.springframework.context.SmartLifecycle`接口，会在`ContextRefreshedEvent`事件发布之前调用。当Spring的上下文刷新时会触发SOFA模块化的装配流程，其源码如下：

```java
public void start() {
    if (isleRefreshed.compareAndSet(false, true)) {
        try {
            pipelineContext.process();
        } catch (Throwable t) {
            SofaLogger.error(ErrorCode.convert("01-10000"), t);
            throw new RuntimeException(t);
        }
    }
}
```

1. 检查当前状态是否是已经调用，如已调用则直接返回。
2. 如果是Root上下文，则直接调用PipelineContext的process，该调用会顺序执行模块化流水线上的各个步骤`ModelCreatingStage`、`SpringContextInstallStage`、`ModuleLogOutputStage`

接下来我们逐个解析`PipelineStage`的行为。

### ModelCreatingStage

顾名思义模型构造阶段，该阶段会对应用程序构造一个应用模型，用以描述应用的基本属性以及所拥有的模块。ModelCreatingStage的process源码码如下：

```java
protected void doProcess() throws Exception {
    ApplicationRuntimeModel application = new ApplicationRuntimeModel();
    application.setAppName(appName);
    SofaRuntimeManager sofaRuntimeManager = applicationContext
        .getBean(SofaRuntimeManager.class);
    application.setSofaRuntimeContext(sofaRuntimeManager.getSofaRuntimeContext());
    application.setModuleDeploymentValidator(new DefaultModuleDeploymentValidator());
    getAllDeployments(application);
    applicationContext.getBeanFactory().registerSingleton(SofaBootConstants.APPLICATION,
        application);
}
```

1. 为应用构造运行时模型ApplicationRuntimeModel

2. 为ApplicationRuntimeModel设置应用名，即环境变量中的`spring.application.name`对应的值

3. 为应用模型设置SOFA运行时上下文

4. 读取所有的`Deployment`并装载到ApplicationRuntimeModel中

5. 将该ApplicationRuntimeModel注册到应用程序的Root Spring上下文中

这里详细说明一下第3步中是如何加载`Deployment`的，以下是`getAllDeployments`的代码:

```java
    protected void getAllDeployments(ApplicationRuntimeModel application) throws IOException,
                                                                         DeploymentException {
        Enumeration<URL> urls = appClassLoader.getResources(SofaBootConstants.SOFA_MODULE_FILE);
        if (urls == null || !urls.hasMoreElements()) {
            return;
        }
        while (urls.hasMoreElements()) {
            URL url = urls.nextElement();
            UrlResource urlResource = new UrlResource(url);
            Properties props = new Properties();
            props.load(urlResource.getInputStream());
            DeploymentDescriptorConfiguration deploymentDescriptorConfiguration = new DeploymentDescriptorConfiguration(
                Collections.singletonList(SofaBootConstants.MODULE_NAME),
                Collections.singletonList(SofaBootConstants.REQUIRE_MODULE));
            DeploymentDescriptor dd = DeploymentBuilder.build(url, props,
                deploymentDescriptorConfiguration, appClassLoader);
            if (application.isModuleDeployment(dd)) {
                if (sofaModuleProfileChecker.acceptModule(dd)) {
                    validateDuplicateModule(application.addDeployment(dd), dd);
                } else {
                    application.addInactiveDeployment(dd);
                }
            }
        }
    }
```

1. 通过应用的类加载器加载当前classpath下名为`sofa-module.properties`的资源(该资源名是固定的)

2. 根据读取到的文件信息，创建DeploymentDescriptor(Deployment描述符)

3. 检查模块是否符合生效profiles

4. 将``DeploymentDescriptor``装载到ApplicationRuntimeModel中

> 小结：通过以上`ModelCreatingStage`的流程我们可以获悉：要使用SOFA模块化必须在模块下创建用于描述模块基本属性的`sofa-module.properties`文件!
### SpringContextInstallStage

Spring上下文装配阶段，也是SOFA模块化实现的核心阶段，其主体代码如下(已合并并省略无关代码):

```java
SpringContextLoader springContextLoader = createSpringContextLoader();
installSpringContext(application, springContextLoader);
if (sofaModuleProperties.isModuleStartUpParallel()) {
    refreshSpringContextParallel(application);
} else {
    refreshSpringContext(application);
}
```

1. 构造一个SpringContextLoader Spring上下文加载器
2. 为各模块装载其对应的Spring上下文(installSpringContext)
3. ``并行/串行``刷新各模块的Spring上下文

> 问题：SOFA是如何实现模块并行化刷新能力并妥当处理各模块的依赖关系的呢？该问题在后面会详细解析
接下来细说`installSpringContext`安装Spring上下文阶段做了什么，以下是对应的代码块:

```java
private void installSpringContext(ApplicationRuntimeModel application,
                                  SpringContextLoader springContextLoader) {
    ClassLoader oldClassLoader = Thread.currentThread().getContextClassLoader();
    for (DeploymentDescriptor deployment : application.getResolvedDeployments()) {
        if (deployment.isSpringPowered()) {
            ....
            try {
                Thread.currentThread().setContextClassLoader(deployment.getClassLoader());
                springContextLoader.loadSpringContext(deployment, application);
            } catch (Throwable e) {
                ....
            } finally {
                Thread.currentThread().setContextClassLoader(oldClassLoader);
            }
        }
    }
}
```

1. 首先取出当前线程上下文类加载器以便加载完模块后复原

2. 遍历所有的模块描述符(DeploymentDescriptor)，并使用Deployment中声明的类加载器覆盖当前线程上下文类加载器

3. 装载各模块的Spring上下文，并在结束时重置线程上下文类加载器

其中`springContextLoader.loadSpringContext`是该阶段中的核心初始化逻辑，其代码如下:

```java
public void loadSpringContext(DeploymentDescriptor deployment,
                              ApplicationRuntimeModel application) throws Exception {
    SofaModuleProperties sofaModuleProperties = rootApplicationContext
        .getBean(SofaModuleProperties.class);
    BeanLoadCostBeanFactory beanFactory = new BeanLoadCostBeanFactory(
        sofaModuleProperties.getBeanLoadCost(), deployment.getModuleName());
    beanFactory
        .setAutowireCandidateResolver(new QualifierAnnotationAutowireCandidateResolver());
    GenericApplicationContext ctx = sofaModuleProperties.isPublishEventToParent() ? new GenericApplicationContext(
        beanFactory) : new SofaModuleApplicationContext(beanFactory);
    ctx.setId(deployment.getModuleName());
    String activeProfiles = sofaModuleProperties.getActiveProfiles();
    if (StringUtils.hasText(activeProfiles)) {
        String[] profiles = activeProfiles.split(SofaBootConstants.PROFILE_SEPARATOR);
        ctx.getEnvironment().setActiveProfiles(profiles);
    }
    setUpParentSpringContext(ctx, deployment, application);
    final ClassLoader moduleClassLoader = deployment.getClassLoader();
    ctx.setClassLoader(moduleClassLoader);
    CachedIntrospectionResults.acceptClassLoader(moduleClassLoader);
    // set allowBeanDefinitionOverriding
    ctx.setAllowBeanDefinitionOverriding(sofaModuleProperties.isAllowBeanDefinitionOverriding());
    ctx.getBeanFactory().setBeanClassLoader(moduleClassLoader);
    ctx.getBeanFactory().addPropertyEditorRegistrar(new PropertyEditorRegistrar() {
        public void registerCustomEditors(PropertyEditorRegistry registry) {
            registry.registerCustomEditor(Class.class, new ClassEditor(moduleClassLoader));
            registry.registerCustomEditor(Class[].class,
                new ClassArrayEditor(moduleClassLoader));
        }
    });
    deployment.setApplicationContext(ctx);
    XmlBeanDefinitionReader beanDefinitionReader = new XmlBeanDefinitionReader(ctx);
    beanDefinitionReader.setValidating(true);
    beanDefinitionReader.setNamespaceAware(true);
    beanDefinitionReader
        .setBeanClassLoader(deployment.getApplicationContext().getClassLoader());
    beanDefinitionReader.setResourceLoader(ctx);
    loadBeanDefinitions(deployment, beanDefinitionReader);
    addPostProcessors(beanFactory);
}
```

1. 首先通过root Spring上下文获取SOFA配置
2. 构建一个SOFA自定义的可以统计创建Bean耗时的BeanFactory
3. 构造一个属于当前模块的Spring上下文，该上下文就是SOFA模块化中用于模块隔离的上下文了
4. 将SOFA配置的profiles也设置到刚创建的Spring上下文
5. 将刚构建完成的模块Spring上下文，与应用的Spring上下文与之关联，即`modleContext.setParent(parentSpringContext)`
6. 加载该模块下的Bean定义配置文件(`META-INF/spring`下所有后缀是xml的文件)
7. 往该模块的BeanFactory中添加Root Spring上下文中的`BeanPostProcessor`与`BeanFactoryPostProcessor` (这两类Bean是从`SofaModuleBeanFactoryPostProcessor`得来)

> 小结：通过剖析`springContextLoader.loadSpringContext`的源码逻辑我们得知，各个模块的Spring上下文是在该阶段构建的，并且在这一阶段将Root Spring上下文与模块的Spring上下文关联起来。
### ModuleLogOutputStage

该模块的逻辑很简单，其核心功能就是打印输出当前应用加载的各个模块现况。其源码如下, 通过方法名我们也能很直观的知道，主要打印信息有加载成功的模块、加载失败的模块、耗时情况，这里就不展开细说了。

```java
ApplicationRuntimeModel application = applicationContext.getBean(SofaBootConstants.APPLICATION, ApplicationRuntimeModel.class);
StringBuilder stringBuilder = new StringBuilder();
logInstalledModules(stringBuilder, application.getInstalled());
logFailedModules(stringBuilder, application.getFailed());
logInfoBeanCost(stringBuilder, application.getInstalled());
SofaLogger.info(stringBuilder.toString());
```

以上就是SOFA整个模块化能力的核心启动流程。但上面我们还遗留了一个问题，``SOFA是如何实现模块并行化刷新能力并妥当处理各模块的依赖关系的呢？``接下来我们来剖析模块化并行启动的源码实现。

> 总结：通过以上剖析，我们了解到了SOFA模块化的整体启动流程基于Spring的``Lifecycle``实现的，关键类是``SofaModuleContextLifecycle``。而SOFA将模块化的启动过程抽象成了一条流水线，将各个步骤抽象成了``PipelineStage``，其中最关最关键的一步便是``SpringContextInstallStage``。在这一阶段，SOFA给各模块创建一个Spring上下文用于模块隔离，通过梳理的依赖关系实现了并行刷新的正确性。
## 模块并行启动

模块化并行启动能力是SOFA模块化下的一个特色能力，主要目的是加快应用的启动速度，其配置项如下，默认值为true表示打开，如不需要则可以配置为false以关闭并行启动能力。

````properties
com.alipay.sofa.boot.module-start-up-parallel=false
````

模块化并行启动的核心实现位于``SpringContextInstallStage``阶段中的``refreshSpringContextParallel``方法中，源码如下：

```java
private void refreshSpringContextParallel(ApplicationRuntimeModel application) {
    ClassLoader oldClassLoader = Thread.currentThread().getContextClassLoader();
    List<DeploymentDescriptor> coreRoots = new ArrayList<>();
    int coreSize = (int) (CPU_COUNT * sofaModuleProperties.getParallelRefreshCoreCountFactor());
    long taskTimeout = sofaModuleProperties.getParallelRefreshTimeout();
    long period = sofaModuleProperties.getParallelRefreshCheckPeriod();
    ThreadPoolExecutor executor = new SofaThreadPoolExecutor(coreSize, coreSize, 60,
        TimeUnit.MILLISECONDS, new ArrayBlockingQueue<>(DEFAULT_REFRESH_TASK_QUEUE_SIZE),
        new NamedThreadFactory("sofa-module-start"), new ThreadPoolExecutor.CallerRunsPolicy(),
        "sofa-module-start", SofaBootConstants.SOFABOOT_SPACE_NAME, taskTimeout, period,
        TimeUnit.SECONDS);
    try {
        for (DeploymentDescriptor deployment : application.getResolvedDeployments()) {
            DependencyTree.Entry entry = application.getDeployRegistry().getEntry(
                deployment.getModuleName());
            if (entry != null && entry.getDependencies() == null) {
                coreRoots.add(deployment);
            }
        }
        refreshSpringContextParallel(coreRoots, application.getResolvedDeployments().size(),
            application, executor);
    } finally {
        ......
    }
}
```

从中我们可以看到，在并行刷新上下文时，SOFA会创建一个以``CPU count * parallelRefreshCoreCountFactor``作为核心线程数的一个线程池，通过多线程的能力来支持模块的并行启动。

> 遗留问题：SOFA是如何实现模块并行化刷新能力并妥当处理各模块的依赖关系的呢？
关于这个问题，我们应该会想到，要保证并行刷新的正确性首先需要正确的解析出各模块之间的依赖树，而SOFA解析模块依赖树的关键类是``com.alipay.sofa.isle.deployment.DependencyTree``，其中主要是``com.alipay.sofa.isle.deployment.DeployRegistry``类直接继承了它。为了方便解析，我们将``com.alipay.sofa.isle.deployment.DependencyTree``上的泛型声明定义为``K=String,T=DeploymentDescriptor``。以下是``DependencyTree``的add方法源码(已将泛型替换为具体类型，String参数的具体业务类型是``模块名``)：

````java
public void add(String key, DeploymentDescriptor object, Collection<String> requires) {
    Entry<String, DeploymentDescriptor> entry = registry.get(key);
    if (entry == null) {
        entry = new Entry<>(key, object);
        registry.put(key, entry);
    } else if (entry.object == null) {
        entry.object = object;
    } else {
        return;
    }
    updateDependencies(entry, requires);
    if (entry.isResolved()) {
        resolve(entry);
    }
}
````

1. 首先检查``模块名->部署模块描述符``的映射项是否存在
2. 如不存在，则先创建一个空项并存入到registry这个Map中
3. 调用``updateDependencies``更新该模块的依赖项模块项
4. 如果当前模块未解析，则会调用``resolve``进行模块解析

以下是``updateDependencies``的核心源码：

````java
protected void updateDependencies(Entry<String, DeploymentDescriptor> entry, Collection<String> requires) {
    if (requires != null) {
        for (String req : requires) {
            Entry<String, DeploymentDescriptor> reqEntry = registry.get(req);
            if (reqEntry != null) {
                if (reqEntry.isResolved()) {
                    reqEntry.addDependsOnMe(entry);
                    entry.addDependency(reqEntry);
                    continue;
                }
            } else {
                reqEntry = new Entry<>(req, null);
                registry.put(req, reqEntry);
            }
            reqEntry.addDependsOnMe(entry);
            entry.addDependency(reqEntry);
            entry.addWaitingFor(reqEntry);
        }
    }
}
````

1. 首先检查传入的依赖项是否为空，为空则忽略
2. 遍历所有依赖的模块项
3. 根据依赖的模块从``registry``中尝试取出
4. 如果依赖项已存在且已解析，则把当前模块添加到依赖的模块的``dependsOnMe``，建立了一个双向关联的关系
5. 如过依赖项不存在则创建一个空Entry映射项，其中映射键是该模块所依赖的模块名
6. 调用依赖的模块的Entry映射的``addDependsOnMe``与当前模块Entry的``addDependency``，相互建立关联关系
7. 调用当前模块Entry的``addWaitingFor``，表示当前模块需要等待依赖的模块解析

``updateDependencies``最后有一步``addWaitingFor``，其作用是将``resolve``状态置标记为未解析状态，这样在``updateDependencies``结束后并不会立即解析当前模块。因为应用运行时加载出来的模块列表通常是乱序的，而可以解析模块的必要条件便是其依赖的所有模块均已经解析完毕。这样当加载到那些已经解析完毕的模块时，可以通过该方式将之前加载过但未解析的模块对其进行解析。以下是``resolve``方法的源码：

````java
public void resolve(Entry<String, DeploymentDescriptor> entry) {
    resolved.add(entry);
    // resolve any dependent entry if they are waiting only for me
    Set<Entry<String, DeploymentDescriptor>> dependencies = entry.getDependsOnMe();
    if (dependencies != null) {
        for (Entry<String, DeploymentDescriptor> dep : dependencies) {
            dep.removeWaitingFor(entry);
            if (dep.isResolved()) {
                resolve(dep); // resolve the dependent entry
            }
        }
    }
}
````

1. 将当前模块的Entry添加到``resolved``这个List集合中
2. 获取依赖了当前模块的模块
3. 如果存在依赖了当前模块的模块，则调用``removeWaitingFor``移除等待项
4. 如果模块是已经解析的状态，则递归调用``resolve``继续解析

> 小结: 通过对依赖树源码的解析，我们了解到了SOFA为了在乱序的模块中梳理出有层次关系的模块依赖树，使用了``dependsOnMe``以及``waitingFor``两个关键的属性，并通过递归调用的方式完成了模块依赖树的整理，同时也很巧妙的整理出了``resolved``这个List集合，可以保证``串行启动``时能够正常按依赖的顺序启动。
在梳理出模块依赖树后，后面便是通过该依赖树来实现并行初始化。其中并行初始化的核心源码位于``SpringContextInstallStage``的``refreshSpringContextParallel``方法，源码如下(已精简且合并代码)：

```java
final CountDownLatch latch = new CountDownLatch(totalSize);
List<Future> futures = new CopyOnWriteArrayList<>();
for (final DeploymentDescriptor deployment : rootDeployments) {
    futures.add(executor.submit(new Runnable() {
        public void run() {
            ......
            try {
                ......
                Thread.currentThread().setContextClassLoader(deployment.getClassLoader());
                if (deployment.isSpringPowered()
                    && !application.getFailed().contains(deployment)) {
                    doRefreshSpringContext(deployment, application);
                }
                DependencyTree.Entry<String, DeploymentDescriptor> entry = application
                    .getDeployRegistry().getEntry(deployment.getModuleName());
                if (entry != null && entry.getDependsOnMe() != null) {
                    for (final DependencyTree.Entry<String, DeploymentDescriptor> child : entry
                        .getDependsOnMe()) {
                        child.getDependencies().remove(entry);
                        if (child.getDependencies().size() == 0) {
                            refreshSpringContextParallel(child.get(), application, executor,
                                latch, futures);
                        }
                    }
                }
            } catch (Throwable e) {
                ......
            } finally {
                latch.countDown();
                ......
            }
        }
    }));
}
try {
    latch.await();
} catch (InterruptedException e) {
    ......
}
for (Future future : futures) {
    try {
        future.get();
    } catch (Throwable e) {
        throw new RuntimeException(e);
    }
}
```

1. 首先构建一个大小为Deployment总和的CountDownLatch，其主要目的是用于阻塞等待未完成刷新的模块，保证并行任务能在``SpringContextInstallStage``阶段完成
2. 首先遍历那些``没有依赖``的模块，优先刷新这些模块的Spring上下文
3. 将刷新任务提交到并行刷新线程池中，其中`doRefreshSpringContext`中会调用Spring上下文的`refresh`方法以初始化Spring IoC容器。
4. 遍历那些``依赖当前模块``的子模块列表，对子模块的依赖数减少1，并判断依赖当前模块的子模块的前置依赖模块数是否等于0，只有依赖的模块数等于0才表示当前子模块依赖的所有模块都已经启动完毕，此时才能调用``refreshSpringContextParallel``方法来刷新该子模块。
5. 当一个模块上下文刷新完毕后，会调用`latch.countDown()`将CountDownLatch减1
6. 当CountDownLatch的计数器置为0值时，继续后续的流程

> 小结：我们从中可以得知，模块并行启动解决模块依赖启动关系的核心点有如下3点：
> 1. 应用必须在该阶段之前将完整的模块依赖树梳理
> 2. 每启动完毕一个模块，需要对其子模块的依赖模块数减少1
> 3. 通过``child.getDependencies().size() == 0``来判断前置依赖模块是否都已初始化完毕
## 总结

通过上文的源码剖析，我们了解到了SOFABoot的模块化隔离下所提供的能力及其对应的实现原理:

1. 模块化的装配启动入口是通过Spring提供的``Lifecycle``机制实现的，其入口类名为``SofaModuleContextLifecycle``
2. 模块的隔离是通过Spring Context进行隔离的
3. 模块的并行启动是通过线程池来实现的，而在多线程下进行正确的顺序启动的前置条件则是对模块依赖树的梳理。
