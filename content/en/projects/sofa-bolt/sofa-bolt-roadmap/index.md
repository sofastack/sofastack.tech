---

title: "Roadmap"
aliases: "/sofa-bolt/docs/sofa-bolt-roadmap"
---

# Roadmap

## Version 1.5.1

* Fixed code style problems in the project: <https://github.com/alipay/sofa-bolt/issues/85>
* Fixed known bugs in the project: <https://github.com/alipay/sofa-bolt/issues/82>
* The RPC layer supports message list dispatching from the I/O thread: <https://github.com/alipay/sofa-bolt/pull/84>

## Version 1.6.0

### Overall goal

* Unify lifecycle APIs for all components
* Extract and incorporate network component APIs
* Converge configuration methods and enhance configuration scalability

### Unify lifecycle APIs for all components

In the current Bolt version, APIs of lifecycle management components are named inconsistently, for example:

* ReconnectManager does not need startup or initialization, and the disabling method is stop.
* The initialization method for DefaultConnectionMonitor of is start, and the disabling method is destroy.
* The initialization method forRpcClient init, and the disabling method is shutdown.
* The initialization method forRpcTaskScanner is start, and the disabling method is shutdown.

We plan to unify lifecycle APIs of all components in V1.6.0:

* For components that are subject to lifecycle management, which require initialization before use and must release resources after use, their startup/shutdown APIs are to be unified.

### Extract and incorporate network component APIs

Network operations of Bolt are mainly performed by using the remoting class, which is provided as an abstract class. We plan to converge methods of this class, and provide them in the form of APIs in the future. There are a few advantages of doing so:

* Standardized usage
* Stable service
* Convenient internal code iteration

Taking the ReconnectManager as an example. It provides the public addCancelUrl method, which is not called in the Bolt project. This may cause problems:

* IDE will give a warning.
* Users may get confused on whether they should delete this method.

We plan to solve the these problems in V1.6.0 by extracting a set of stable APIs, which are convenient for users to use, helpful to improve code readability, and can lay a solid foundation for future iterations.

### Converge configuration methods and enhance configuration scalability

Currently, Bolt supports the following configuration methods:

* ProtocolSwitch: supports protocol configuration (enabling or disabling CRC validation), and creates configuration objects by static means. 
* GlobalSwitch: offers instance-level configuration, and offers GlobalSwitch configuration items to every AbstractConfigurableInstance. The default value is taken from the SystemProperty, and the configuration can be adjusted through an API.
* ConfigItem: enumerates Netty-related configuration items that cannot be inherited or extended before you modify the source code.
* ConfigManager: reads SystemProperty configurations by static means.
* Configs: defines the configuration item names and specifies their default values.

Generally, Bolt's configuration items look to be loose and scattered and are hard for users to extend their usage. Some configuration items are exposed in the form of APIs and some are exposed by static means. Some configuration items can be configured with system parameters, and some can be configured with APIs.

In addition, Bolt's configuration items affect each other. For example, if a product simultaneously uses RPC and Message, both of which are dependent on Bolt at the underlayer, SystemProperty cannot provide separate configurations for RPC and Message.

We plan to adjust the configuration module in V1.6.0, and make some changes while keeping it compatible with the configuration of the current version:

* Converge configuration methods, and provide a unified configuration programing interface that is similar to Option in Netty.
* Support configuration isolation where different configuration items are used for different Bolt instances.
* Improve the configuration scalability.

