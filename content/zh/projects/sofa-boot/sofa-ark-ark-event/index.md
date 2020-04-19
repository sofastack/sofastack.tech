---
title: "Ark 事件机制"
aliases: "/sofa-boot/docs/sofa-ark-ark-event"
---

# 使用 Ark 事件处理机制

SOFAArk 从 1.1.0 版本开始提供了全新的事件模型，囊括了 SOFAArk 中 biz 和 plugin 的各个生命周期；该版本提供的事件模型参考了 Spring 中的生命周期事件模型。本篇文档将描述如何使用 SOFAArk 的事件机制。

## 事件概览

### biz 生命周期事件
| 事件名 | 描述 |
| --- | --- |
| AfterBizStartupEvent | biz 启动之后发送的事件 |
| AfterBizStopEvent | biz 停止之后发送的事件 |
| AfterBizSwitchEvent | biz 切换之后发送的事件 |
| BeforeBizStartupEvent | biz 启动之前发送的事件 |
| BeforeBizStopEvent | biz 停止之前发送的事件 |
| BeforeBizSwitchEvent | biz 切换之前发送的事件 |


### plugin 生命周期事件
| 事件名 | 描述 |
| --- | --- |
| AfterPluginStartupEvent | plugin 启动之后发送的事件 |
| AfterPluginStopEvent | plugin 停止之后发送的事件 |
| BeforePluginStartupEvent | plugin 启动之前发送的事件 |
| BeforePluginStopEvent | plugin 停止之前发送的事件 |


### 容器级别生命周期事件
| 事件名 | 描述 |
| --- | --- |
| AfterFinishDeployEvent | 执行完 DeployStage 阶段之后发送的事件 |
| AfterFinishStartupEvent | 执行完 Ark 容器启动之后发送的事件 |


## 事件监听

### 监听指定类型的事件
上述提到的各个阶段的事件，我们可以通过编写 EventHandler 来处理，例如，希望监听类型为 BeforeBizStartupEvent 的事件，则可以通过以下方式实现监听：

```java
@Component
public class EventHandlerSample implements EventHandler<BeforeBizStartupEvent> {

    private static final Logger LOGGER = LoggerFactory.getLogger("EVENT-HANDLER-LOGGER");

    @Override
    public int getPriority() {
        return 0;
    }

    @Override
    public void handleEvent(BeforeBizStartupEvent event) {
        Biz source = event.getSource();
        LOGGER.info("begin to startup biz, current biz is: {}",source.getIdentity());
    }
}
```

> 日志目录：target/test/logs/host-app/event-handler.log
> 日志输出：
> 2019-11-28 15:18:33,248 INFO  EVENT-HANDLER-LOGGER - begin to startup biz, current biz is: provider1:2.0.0, bizState: resolved


在此基础上，在提供其他几个 event 的处理器：

- AfterBizStartupEvent

```java
@Component
public class AfterBizStartupEventHandler implements EventHandler<AfterBizStartupEvent> {

    private static final Logger LOGGER = LoggerFactory.getLogger("EVENT-HANDLER-LOGGER");

    @Override
    public void handleEvent(AfterBizStartupEvent event) {
        Biz source = event.getSource();
        LOGGER.info("after startup biz, current biz is: {}, bizState: {}",source.getIdentity(),source.getBizState() );
    }

    @Override
    public int getPriority() {
        return 0;
    }
}
```

分别启动 基座 -> 安装 ark-provider 模块 -> 卸载 ark-provider 模块 ，然后看到日志输出如下：

```java
2019-11-28 15:31:42,325 INFO  EVENT-HANDLER-LOGGER - after startup biz, current biz is: host-app:2.0.0, bizState: resolved
2019-11-28 15:36:23,956 INFO  EVENT-HANDLER-LOGGER - begin to startup biz, current biz is: provider1:2.0.0, bizState: resolved
2019-11-28 15:36:27,216 INFO  EVENT-HANDLER-LOGGER - after startup biz, current biz is: provider1:2.0.0, bizState: resolved
2019-11-28 15:53:38,225 INFO  EVENT-HANDLER-LOGGER - before stop biz, current biz is: provider1:2.0.0, bizState: deactivated
2019-11-28 15:53:38,233 INFO  EVENT-HANDLER-LOGGER - after biz stop, current biz is: provider1:2.0.0, bizState: unresolved
```

### 监听不指定类型的事件
某些情况下，如果期望监听所有 biz 或者 plugin 生命周期事件，可以使用以下方式：

```java
@Component
public class AbstractArkEventHandler implements EventHandler<AbstractArkEvent> {
    @Override
    public int getPriority() {
        return 0;
    }
    @Override
    public void handleEvent(AbstractArkEvent event) {
        System.out.println("------------ current event topic: " + event.getTopic());
    }
}
```

> 为了区分输出，可以 sout 输出到 console.


在上一小节中提供了 4 个 EventHandler，分别用于处理 BeforeBizStartupEvent、AfterBizStartupEvent、BeforeBizStopEvent、AfterBizStopEvent 事件；这里又提供了监听 AbstractArkEvent 的 EventHandler ，因为 AbstractArkEvent 是上述 4 种事件类型的父类，所以 AbstractArkEventHandler 会接收到 这 4 个事件。

启动 基座 -> 安装 ark-provider 模块 -> 卸载 ark-provider 模块 ，控制台输出如下：

```bash
# 基座 + host-app 启动之后 AbstractArkEventHandler 的输出
------------ current event topic: AFTER-INVOKE-BIZ-START
------------ current event topic: AFTER-FINISH-DEPLOY-STAGE
------------ current event topic: AFTER-FINISH-STARTUP-STAGE
# ark-provider 启动之前
------------ current event topic: BEFORE-INVOKE-BIZ-START
# ark-provider 启动之前
------------ current event topic: AFTER-INVOKE-BIZ-START
```

所以这些事件都可以被 AbstractArkEventHandler 处理到。

### 发送自定义事件
1、自定义事件

```java
public class CustomEvent implements ArkEvent {
    @Override
    public String getTopic() {
        return "THIS IS CUSTOM";
    }
}
```

2、定义事件处理器

```java
@Component
public class CustomEventHandler implements EventHandler {
    private static final Logger LOGGER = LoggerFactory.getLogger("EVENT-HANDLER-LOGGER");
    @Override
    public void handleEvent(ArkEvent event) {
        if (event instanceof CustomEvent){
            LOGGER.info("CUSTOM EVENT TOPIC: {}",event.getTopic());
        }
    }
    @Override
    public int getPriority() {
        return 0;
    }
}
```

> 注意这里不可以使用 EventHandler<CustomEvent>

3、发送事件

```java
@RequestMapping("customEvent")
public String customEvent(){
    # 获取 EventAdminService
    EventAdminService eventAdminService = ArkClient.getEventAdminService();
    # 通过 eventAdminService 发送事件
    eventAdminService.sendEvent(new CustomEvent());
    return "send success";
}
```

> 2019-11-28 16:31:22,077 INFO  EVENT-HANDLER-LOGGER - CUSTOM EVENT TOPIC: THIS IS CUSTOM