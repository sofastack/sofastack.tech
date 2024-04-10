---
title: "SOFABolt 发展路线"
aliases: "/sofa-bolt/docs/sofa-bolt-roadmap"
---
# 发展路线

## Version 1.5.1

* 修复项目中代码风格的问题：<https://github.com/alipay/sofa-bolt/issues/85>
* 修复项目中已知的 BUG：<https://github.com/alipay/sofa-bolt/issues/82>
* RPC 层支持从 IO 线程派发 message list：<https://github.com/alipay/sofa-bolt/pull/84>

## Version 1.6.0 

### 整体目标

* 统一生命周期组件
* 抽象并沉淀网络组件的 API
* 收敛配置入口&增强配置的可扩展性

### 统一生命周期组件

在 1.5.x 的 Bolt 版本中，管理组件的生命周期相关的 API 命名并不统一，比如：

* ReconnectManager 不需要启动或者初始化，关闭方法为 stop
* DefaultConnectionMonitor 初始化方法为 start，关闭的方法为 destroy
* RpcClient 初始化方法为 init，关闭的方法为 shutdown
* RpcTaskScanner 初始化的方法为 start，关闭方法为 shutdown

在 1.6.0 版本里，统一了所有组件的生命周期接口：

* 对于有生命周期的组件，即使用前需要进行初始化，使用完毕需要释放资源的，统一提供 startup/shutdown 接口

### 抽象并沉淀网络组件的 API

Bolt 中 remoting 类是网络操作的主要入口，目前以抽象类的形式提供，后续希望对方法进行收敛，暴露对应的接口：

* 标准化，规范使用
* 沉淀接口，保持稳定
* 收敛入口，便于内部的代码迭代

在 1.5.x 的版本中，ReconnectManager 类尽管提供了 public 的 addCancelUrl 方法，但是这个方法在 Bolt 项目中没有调用：

* IDE 会给出警告
* 给用户造成困惑：这个方法可否删除？

在 1.6.0 版本中解决了以上的问题，抽象出一套稳定的 API，便于用户使用、提升代码可读性，同时也为后续的迭代打下基础。

### 收敛配置入口&增强配置的可扩展性

1.5.x 版本的 Bolt 配置入口有以下几个：

* ProtocolSwitch：协议配置（是否开启 CRC 校验），通过静态的方法创建配置对象
* GlobalSwitch：实例级配置，每个 AbstractConfigurableInstance 拥有自己的 GlobalSwitch 配置，默认值取自 SystemProperty，可以通过 API 调整配置
* ConfigItem：Netty 相关的配置项的枚举，不可以继承拓展（用户需要修改源码）
* ConfigManager：配置读取入口，通过静态方法读取 SystemProperty 的配置
* Configs：配置项名称的定义和配置项的默认值

整体上看 Bolt 的配置项比较零散，且对用户来说难以拓展使用，有以接口暴露的配置项、有以静态方法暴露的配置项，配置项可以通过系统参数配置也可以通过 API 执行配置。

且 Bolt 配置项存在相互影响的问题，比如一个产品同时使用了 RPC 和消息，而 RPC 和消息底层都依赖于 Bolt，那么基于 SystemProperty 的配置将无法做到 RPC 和消息的配置隔离。

在 1.6.0 版本中对配置模块进行了调整，在兼容当前版本配置的情况下：

* 收敛配置入口，提供统一的配置的编程界面（以类似 Netty 的 Option 的方式进行配置）
* 支持配置隔离，不同的 Bolt 实例使用不同的配置项
* 提升配置的可扩展性
