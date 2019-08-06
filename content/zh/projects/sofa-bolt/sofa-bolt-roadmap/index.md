---
title: "SOFABolt 发展路线"
aliases: "/sofa-bolt/docs/sofa-bolt-roadmap"
---
# 发展路线

## Version 1.5.1

* 修复项目中代码风格的问题：<https://github.com/alipay/sofa-bolt/issues/85>
* 修复项目中已知的BUG：<https://github.com/alipay/sofa-bolt/issues/82>
* RPC 层支持从 IO 线程派发 message list：<https://github.com/alipay/sofa-bolt/pull/84>

## Version 1.6.0 

### 整体目标

* 统一生命周期组件
* 抽象并沉淀网络组件的API
* 收敛配置入口&增强配置的可扩展性

### 统一生命周期组件

在1.5.x的Bolt版本中，管理组件的生命周期相关的API命名并不统一，比如：

* ReconnectManager不需要启动或者初始化，关闭方法为stop
* DefaultConnectionMonitor初始化方法为start，关闭的方法为destroy
* RpcClient初始化方法为init，关闭的方法为shutdown
* RpcTaskScanner初始化的方法为start，关闭方法为shutdown

在1.6.0版本里，统一了所有组件的生命周期接口：

* 对于有生命周期的组件，即使用前需要进行初始化，使用完毕需要释放资源的，统一提供startup/shutdown接口

### 抽象并沉淀网络组件的API

Bolt中remoting类是网络操作的主要入口，目前以抽象类的形式提供，后续希望对方法进行收敛，暴露对应的接口：

* 标准化，规范使用
* 沉淀接口，保持稳定
* 收敛入口，便于内部的代码迭代

在1.5.x的版本中，ReconnectManager类尽管提供了public的addCancelUrl方法，但是这个方法在Bolt项目中没有调用：

* IDE会给出警告
* 给用户造成困惑：这个方法可否删除？

在1.6.0版本中解决了以上的问题，抽象出一套稳定的API，便于用户使用、提升代码可读性，同时也为后续的迭代打下基础。

### 收敛配置入口&增强配置的可扩展性

1.5.x版本的Bolt配置入口有以下几个：

* ProtocolSwitch：协议配置（是否开启CRC校验），通过静态的方法创建配置对象
* GlobalSwitch：实例级配置，每个AbstractConfigurableInstance拥有自己的GlobalSwitch配置，默认值取自SystemProperty，可以通过API调整配置
* ConfigItem：Netty相关的配置项的枚举，不可以继承拓展（用户需要修改源码）
* ConfigManager：配置读取入口，通过静态方法读取SystemProperty的配置
* Configs：配置项名称的定义和配置项的默认值

整体上看Bolt的配置项比较零散，且对用户来说难以拓展使用，有以接口暴露的配置项、有以静态方法暴露的配置项，配置项可以通过系统参数配置也可以通过API执行配置。

且Bolt配置项存在相互影响的问题，比如一个产品同时使用了RPC和消息，而RPC和消息底层都依赖于Bolt，那么基于SystemProperty的配置将无法做到RPC和消息的配置隔离。

在1.6.0版本中对配置模块进行了调整，在兼容当前版本配置的情况下：

* 收敛配置入口，提供统一的配置的编程界面（以类似Netty的Option的方式进行配置）
* 支持配置隔离，不同的Bolt实例使用不同的配置项
* 提升配置的可扩展性
