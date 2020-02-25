---
title: "蚂蚁金服研发框架日志隔离解析 | SOFABoot 框架剖析"
author: "盲僧"
authorlink: "https://github.com/masteryourself"
description: "本文将从 Java 的日志体系谈起，对 JCL、SLF4J 两个经典的日志框架做一个阐述，引出 SOFABoot 开源的日志隔离框架 sofa-common-tools，并且有实战 Demo，能够帮助我们快速上手和了解这款框架的使用和作用，最后从源码角度对其进行分析，不仅知其然，还要知其所以然。"
categories: "SOFABoot"
tags: ["SOFABoot","剖析 | SOFABoot 框架","SOFALab"]
date: 2020-02-18T17:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1582090700679-c0b8255c-cea6-4bd6-8854-efd68a5ebc71.jpeg"
---

> **SOFA**Stack（**S**calable **O**pen **F**inancial **A**rchitecture Stack）是蚂蚁金服自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，是在金融场景里锤炼出来的最佳实践。

![日志隔离.jpg](https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1581911050981-626f14d1-d990-4e2e-8213-7db06ebd26fd.jpeg)

本文为《剖析 | SOFABoot 框架》第二篇，本篇作者盲僧，来自遨游酒店信息技术。《剖析 | SOFABoot 框架》系列由 SOFA 团队和源码爱好者们出品，项目代号：[SOFA:BootLab/]()，文章尾部有参与方式，欢迎同样对源码热情的你加入。

SOFABoot 是蚂蚁金服开源的基于 SpringBoot 的研发框架，提供了诸如 Readiness Check、类隔离、日志空间隔离等能力，用于快速、敏捷地开发 Spring 应用程序，特别适合构建微服务系统。

本文将从 Java 的日志体系谈起，对 JCL、SLF4J 两个经典的日志框架做一个阐述，引出 SOFABoot 开源的日志隔离框架 `sofa-common-tools` ，并且有实战 Demo，能够帮助我们快速上手和了解这款框架的使用和作用，最后从源码角度对其进行分析，不仅知其然，还要知其所以然。

SOFABoot ：[https://github.com/sofastack/sofa-boot](https://github.com/sofastack/sofa-boot)

sofa-common-tools ：[https://github.com/sofastack/sofa-common-tools](https://github.com/sofastack/sofa-common-tools)

## Java 日志问题

### 业务开发对日志的选择

众所周知，Java 的日志体系非常复杂，有 Log4j、Log4j2、Logback、JUL 等实现，这么多的日志实现让开发人员在选择上不得不犯晕，因为每个日志实现都对外提供了不同的 API，而且还要担心与项目中现有的第三方框架依赖的日志实现产生冲突问题，甚至还要去维护第三方框架带来的日志依赖。在这些问题的基础上，Java 日志框架应运而生，典型的有 JCL 和 SLF4J。

#### JCL

JCL 即 Apache Commons Logging，它的原理是提供了一套接口，用户使用了它的接口进行编程，具体实现交由它的 `LogFactoryImpl` 去动态查找，  但是它并不能绑定所有的日志实现，因为查找绑定的日志实现是放在 `classesToDiscover`  数组里写死的，导致扩展起来比较麻烦，当前最新版本是 1.2 版本，还不支持绑定 Log4j2 和 Logback。

#### SLF4J

于是乎，大名鼎鼎的 SLF4J 出现了，它的存在就是为了替换 JCL，所以肯定提供了比 JCL 更强大的功能。同样是面向接口编程的设计，但是 SLF4J 充分考虑到了后期的扩展问题：一旦市面上有新的日志实现，那么只需要提供新的绑定包即可，相对于 JCL 的动态绑定，SLF4J 实际上是静态绑定，因为应用程序具体要选用哪种日志组件是由开发人员使用哪个绑定包决定的。绑定原理请看下图：

![concrete-bindings.png](https://cdn.nlark.com/yuque/0/2019/png/432786/1572076051632-7da39af2-68ef-4ad7-a039-cdaceaa93be8.png)

除此之外，SLF4J 还提供了桥接包，它的意思是指可以把使用某个具体 Log 组件的 API 重定向到 SLF4J 的 API 里（前提需要排除具体实现包，然后引入桥接包），然后 SLF4J 会根据具体的绑定包输出内容，从而达到多种日志实现统一输出的目的。绑定原理请看下图：

![](https://cdn.nlark.com/yuque/0/2020/png/432786/1581078242260-a92c5604-4a66-4968-8cba-3b87fda628bb.png)

### 中间件对日志的选择

上面解决了业务开发人员的问题，那么对于从事中间件的开发者来说呢？日志依旧是一个痛点。参考一些中间件项目，如 `zookeeper` 使用的是 log4j ，`hibernate-validator` 使用的是 jboss-logging，当业务开发人员去集成这些第三方组件时，就会感到头疼，因为这些组件的日志实现很有可能会和当前业务自身的日志依赖产生冲突。常用的解决方法就是排除某一种日志实现依赖，然后修改 `appender` 和 `logger` 达到日志隔离。但这并不是一个一劳永逸的方法，因为每次引入新的 jar 包，你都需要考虑是否有日志冲突。

那么市面上是否有成熟的框架来解决这个问题呢？当然是有的，蚂蚁金服开源的 SOFABoot 就提供了这样的功能，底层主要是通过 [sofa-common-tools](https://github.com/sofastack/sofa-common-tools) 实现的。那么 `sofa-common-tools`  又是个啥呢？借用官网的描述： `sofa-common-tools`  是 SOFAStack 中间件依赖的一个通用工具包，通过自动感知应用的日志实现，提供中间件与应用隔离的日志空间打印能力。

本篇将通过一个案例 demo 先来直观的体验下 sofa-common-tools 所能解决的问题，然后再在此基础上，通过源码解析了解其内部的具体实现原理，以帮助大家更好的认识和了解 sofa-common-tools 这个“小而美”的日志工具包。

## 日志隔离实战

> 完整项目已经上传到 [https://github.com/masteryourself/study-sofa.git](https://github.com/masteryourself/study-sofa.git) ，工程是 `study-sofa-common-tools`

有这样一个场景：公司的中间件团队做了一款 `middleware-apm`  监控系统，并且通过以输出日志的方式向监控系统提供基础数据。由于公司并没有制定统一的日志规范，各个业务方所使用的日志也是千差万别；如：如订单系统使用的是 log4j，账务系统用的 Logback，用户中心用的是 Log4j2； 如果期望 apm 提供的日志输出和业务的不冲突，可以独立的并且完整的兼容业务日志的不同实现，此时便可以使用 SOFABoot 提供的日志隔离框架；其可以帮助我们解决日志实现冲突、日志文件隔离以及动态调试日志级别等功能。下面就先来看下 apm  是如何使用 sofa-commons-tools 来实现的。

### middleware-apm 项目

新建 `middleware-apm` 工程，然后执行 `mvn clean install` 命令，安装到本地仓库。具体代码可以参考
[middleware-apm](https://github.com/masteryourself/study-sofa/tree/master/study-sofa-common-tools/middleware-apm) ，下面对一些核心代码进行简单的说明和分析。代码结构如下：

![](https://cdn.nlark.com/yuque/0/2020/png/432786/1579283585347-79116448-f770-4c81-9cfb-ce46fef80484.png)

#### 日志资源文件配置

这里主要是在 `pers.masteryourself.study.sofa.apm.log` 目录下创建 log4j、log4j2、logback 的配置文件，详情请参考 [github 链接](https://github.com/masteryourself/study-sofa/tree/master/study-sofa-common-tools/middleware-apm/src/main/resources/pers/masteryourself/study/sofa/apm/log)。

#### 核心日志工厂类-ApmLoggerFactory

ApmLoggerFactory 主要是对外提供获取 Logger 实例的 API 方法，其作用类似于 slf4j 中的 `LoggerFactory` 类；对于想使用 SOFABoot 日志特性的类，只要使用它调用 getLogger 方法获得的 Logger 实例即可。

`LoggerFactory` 和 `ApmLoggerFactory` 的最本质区别在于 `ApmLoggerFactory` 引入了 LOG_SPACE 的概念。

```java
public class ApmLoggerFactory {
    // 日志空间
    private static final String APM_LOG_SPACE = "pers.masteryourself.study.sofa.apm";

    static {
        if (!MultiAppLoggerSpaceManager.isSpaceInitialized(APM_LOG_SPACE)) {
            Map spaceIdProperties = new HashMap<String, String>();
            MultiAppLoggerSpaceManager.init(APM_LOG_SPACE, spaceIdProperties);
        }
    }
    // 实际上也是面向 slf4j 接口进行编程的
    public static org.slf4j.Logger getLogger(Class<?> clazz) {
        if (clazz == null) {
            return null;
        }
        return getLogger(clazz.getCanonicalName());
    }

    public static org.slf4j.Logger getLogger(String name) {
        //From "pers/masteryourself/study/apm/log" get the xml  and init,then get the logger object
        return MultiAppLoggerSpaceManager.getLoggerBySpace(name, APM_LOG_SPACE);
    }

}
```

#### 监控工具类-Metrics 

模拟 APM 对外提供的一个工具类，提供了一个 metrics 埋点的 API ，其内部主要是通过 ApmMetrics 类进行埋点。

```java
public class Apm {

    public static ApmMetrics begin(String methodName) {
        ApmMetrics metrics = new ApmMetrics();
        metrics.setBeginTime(System.currentTimeMillis());
        metrics.setMethodName(methodName);
        return metrics;
    }

}
```

#### 监控核心类-ApmMetrics

ApmMetrics 模拟 APM 监控的一些数据指标、异常信息，如果出错了就调用 error 方法记录异常，最后调用 end 方法提交，这里提交任务只是简单的打印输出。

```java
@Data
public class ApmMetrics {

    private static final Logger LOGGER = ApmLoggerFactory.getLogger(ApmMetrics.class);

    private String methodName;

    private String errorMsg;

    private Long beginTime;

    private Long endTime;

    public void error(Throwable e) {
        this.setErrorMsg(e.getMessage());
    }

    public void end() {
        this.setEndTime(System.currentTimeMillis());
        this.submitResult();
    }

    private void submitResult() {
        long spendTime = this.getEndTime() - this.getBeginTime();
        if (StringUtil.isEmpty(this.getErrorMsg())) {
            LOGGER.info("{} 执行正常，耗时 {} ms", this.getMethodName(), spendTime);
        } else {
            LOGGER.error("{} 执行失败，耗时 {} ms，异常信息 {}", this.getMethodName(),
                    spendTime, this.getErrorMsg());
        }
    }

}
```

此项目主要是对外提供入口方法用于监控程序的运行情况，项目的日志会单独记录到一个文件夹中，与业务方日志分开打印，具体效果请配合 `user-center` 项目一起使用。

### user-center 项目

此工程是 SpringBoot 工程，主要是引入 `middleware-apm` 的 jar 包和 SpringBoot 相关的包。

具体代码可以参考 [https://github.com/masteryourself/study-sofa/tree/master/study-sofa-common-tools/user-center](https://github.com/masteryourself/study-sofa/tree/master/study-sofa-common-tools/user-center) ，下面列举一些核心代码。代码结构如下：

![image.png](https://cdn.nlark.com/yuque/0/2020/png/432786/1579288889477-34f6ec33-69b5-4d07-8c96-10cd9e04a18e.png)

#### 资源文件配置

1. application.properites

```java
## 这里为了在控制台看到效果，先这样配置，后面在源码分析中会介绍原因
sofa.middleware.log.pers.masteryourself.study.sofa.apm.console=true
sofa.middleware.log.console.log4j2.pattern=%d{yyyy-MM-dd HH:mm:ss.SSS} %5p %X{PID} --- [来自于 middleware-apm 框架打印的日志] [%15.15t] %-40.40logger{39} : %m%n
```

2. log4j2.xml

log 配置请参考 [github 链接](https://github.com/masteryourself/study-sofa/tree/master/study-sofa-common-tools/user-center/src/main/resources)

#### 业务类-UserService

模拟一段业务程序的运行，如果运行时间超过 500ms 表示程序超时，抛出异常。

```java
@Service
public class UserService {

    private static final Logger LOGGER = LoggerFactory.getLogger(UserService.class);

    public void printUserInfo() throws Exception {
        LOGGER.info("打印用户信息");
        long time = new Random().nextInt(1000);
        TimeUnit.MILLISECONDS.sleep(time);
        if (time > 500) {
            throw new RuntimeException("timeout");
        }
    }

}
```

#### 测试用例-UserServiceTest

这里用的是 SpringBoot 提供的测试注解，在调用真正的业务方法之前，会先用 APM 进行埋点，监控程序运行情况。

```java
@RunWith(SpringRunner.class)
@SpringBootTest(classes = Application.class)
public class UserServiceTest {

    @Autowired
    private UserService userService;

    @Test
    public void testPrintUserInfo() {
        ApmMetrics metrics = Apm.begin("printUserInfo");
        try {
            userService.printUserInfo();
        } catch (Exception e) {
            metrics.error(e);
        } finally {
            metrics.end();
        }
    }

}
```

#### 运行结果

运行 `UserServiceTest`  测试用例，我们可以看到 console 控制台上生成了两种日志格式的信息。

![image.png](https://cdn.nlark.com/yuque/0/2020/png/432786/1579284270731-12b3434b-3436-49f6-bf2f-68670907d4b9.png)

对于文件中的日志呢？我们先把 `application.properties` 中的配置先注释，再运行一次测试用例，让它生成文件日志。我们去中间件的日志目录和业务的日志目录，可以看到生成了两份日志，日志隔离效果生效。

![](https://cdn.nlark.com/yuque/0/2020/png/432786/1579284926104-e74804fe-4964-4bd3-9dd3-5ecdfe663e7c.png) 

## 源码解析

考虑到直接看源码可能比较枯燥无聊，这里准备了一个流程图，大致分析出了 `sofa-common-tools` 的整个原理，下面就一些重要的步骤给出解析，如果大家想看源码注释部分，可参考我在 github 上的[源码解析工程](https://github.com/masteryourself/sofa-common-tools) ，里面对部分核心代码做了注释。

![sofa-log.jpg](https://cdn.nlark.com/yuque/0/2020/jpeg/432786/1579289076929-7becf4ea-a83e-4b45-8a9e-154614f85fdd.jpeg)

①：Spring 容器启动，会发布 `ApplicationEnvironmentPreparedEvent` 事件（Spring 加载配置文件事件），然后会通知 `CommonLoggingApplicationListener`  监听器。

②：在这个监听器中，主要是查找是否存在一个这样的 key：key 以 sofa.middleware.log. 开头且 key 不等于 sofa.middleware.log.console 且 key 以 .console 结尾，如果有就先初始化 log，然后 reInitialize。

③：在这里会首先初始化一个 `SpaceInfo` ，也即每个 `SpaceId`  对应一个 `SpaceInfo`  ， `SpaceInfo`  里有啥呢，有一个 `AbstractLoggerSpaceFactory` ，它有多个实现（包含 log4j2、logback 等），看到这里应该就明白了为啥要求每个中间件组件都有一个唯一的 spaceId 的原因了，日志隔离就是靠这个 spaceId 来实现的。

④：从名字上看就知道这是一个多种日志与空间对应管理的类， `createILoggerFactory` 顾名思义就是创建 `AbstractLoggerSpaceFactory` ，它实现了 SLF4J 的 `ILoggerFactory` 接口。如果组件不是以 Spring-Boot 方式启动初始化的，那么就会等到手动调用此 API 的时候再去初始化 logger。

⑤：log4j2 判断：判断规则是看当前 classloader 能够加载到 `org.apache.logging.slf4j.Log4jLoggerFactory` 类，如果可以加载到，再判断配置文件中是否禁用了 log4j2。logback、log4j、jcl 的判断与之基本类似，请读者自行分析。

⑥：这里加载的规则是读取 spaceName + /log/log4j2/log-conf.xml，也即我们在项目实战中定义的特殊位置的配置文件，如果有多个，则会根据 priority 属性排序。

⑦：初始化 loggerContext，注意它是 log4j2 中的对象，再接下来即是拿到 xml 中的配置，然后去初始化 log 组件，在此不做分析，有兴趣的同学可参考 [log4j2 官网](https://logging.apache.org/log4j/2.x/)研究一下。值得一提的是，在这里 SOFA 团队也提供了扩展机制 Log4j2FilterGenerator，是通过 spi 来做扩展的，通过它可以添加自定义的 filter。

⑧：在这里首先会去判断 logger 是否已经存在，不存在的会调用 newLogger 方法创建，在这个方法里，实际上就是用之前创建的 loggerContext 对象去创建 logger。

⑨：这里会根据配置文件中的值判断是否需要添加 consoleAppender，因为目前 SOFA 只支持通过 properties 添加一个 `ConsoleAppender` ，并不能在配置文件中配置很高级的自定义 appender。

至此我们应该了解了 `sofa-common-tools` 的大概原理了，重点主要有如下三个：

- `log-sofa-boot-starter` 比 `sofa-common-tools` 多了个 reInitialize 方法，同时支持通过 Spring 配置文件的方式去设置一些 log 属性。
- `sofa-common-tools` 自动发现日志实现是有优先级顺序的，logback > log4j2 > log4j > jcl，但同时也提供了禁用属性来打破这种默认规则。
- `sofa-common-tools` 提供了一些 SPI 扩展，如 `Log4j2FilterGenerator` 、 `Log4j2ReInitializer` 等，具体可见 jar 包中的 `META-INF/services` 目录 。

从 `LoggerSpaceFactoryBuilder` 类图分析可知，它有四种 LogFactoryBuilder 实现，所以 `sofa-common-tools` 并不是重复造轮子，底层还是用市面上常见的日志组件去实例化 log 对象。

![LoggerSpaceFactoryBuilder.png](https://cdn.nlark.com/yuque/0/2020/png/432786/1579287516403-62aa7e17-c235-4518-acc1-a9c7d4138576.png)

从 `AbstractLoggerSpaceFactory` 类图分析可知，它实现了 SLF4J 的 `ILoggerFactory` 接口，从而替换 SLF4J 的实现。

![AbstractLoggerSpaceFactory.png](https://cdn.nlark.com/yuque/0/2020/png/432786/1579287524892-4c1d7502-897b-4425-8e0f-423b298301ca.png)

最后，让我们来看看 sofa-boot 下各个组件之间的日志隔离效果吧。

![carbon (13).png](https://cdn.nlark.com/yuque/0/2020/png/226702/1582018050027-8648fc05-942f-42d2-b4e4-7cec54d332a8.png)

## 总结

通过上文的分析，我们可以知道这款日志框架的主要作用了：

- 解决日志冲突问题
- 实现日志隔离效果
- 动态调试日志级别
- 提供了 SPI 扩展，能够自由扩展组件
- 提供启动参数，通过设置启动参数可以更改日志的默认行为，使用更加灵活

其实在整个 SOFA 体系中，`sofa-common-tools` 也是被广泛使用的，比如 sofa-rpc 中的 `RpcLoggerFactory` ，sofa-ark 中的 `ArkLoggerFactory` ，它们都是基于此实现的日志功能。总而言之，这款产品最主要的还是适用于以中间件的形式对外提供服务，如果大家是从事中间件开发或者有类似的需求，不妨可以试一试这款产品，只需要很小的改动，就可以享受到它独特的魅力。

## 欢迎加入，参与 SOFABoot 源码解析

本文为 SOFABoot 的日志隔离功能的介绍，《剖析 | SOFABoot 框架》系列会继续逐步详细介绍各个部分的代码设计和实现，预计按照如下的目录进行：

- **【已完成】SOFABoot 总览**
- **【已完成】SOFABoot 日志隔离解析**
- 【已领取】SOFABoot HealthCheck 机制解析	
- 【已领取】SOFABoot runtime 机制解析	
- 【待领取】SOFABoot 上下文隔离机制解析

如果有同学对以上某个主题特别感兴趣的，可以留言讨论，我们会适当根据大家的反馈调整文章的顺序，谢谢大家关注 SOFAStack ，关注 SOFABoot，我们会一直与大家一起成长的。

领取方式：
直接回复本公众号想认领的文章名称，我们将会主动联系你，确认资质后，即可加入，It's your show time！

除了源码解析，也欢迎提交 issue 和 PR：
SOFABoot：[https://github.com/sofastack/sofa-boot](https://github.com/sofastack/sofa-boot)
