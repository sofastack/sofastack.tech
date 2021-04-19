
---
title: "RPC 应用参数配置"
aliases: "sofa-rpc/docs/Application-RPC-Config"
---

在 SOFABoot 的使用场景下，RPC 框架在应用层面，提供一些配置参数，支持的应用级别的参数配置，如端口，线程池等信息，都是通过
Spring Boot的`@ConfigurationProperties` 进行的绑定。绑定属性类是`com.alipay.sofa.rpc.boot.config.SofaBootRpcProperties`，配置前缀是

```java

static final String PREFIX = "com.alipay.sofa.rpc";
``` 

那么在 application.properties 文件中，目前可以配置以下几个选项。其中使用者也可以根据自己的编码习惯，按照 Spring Boot的规范，按照驼峰，中划线等进行书写。

**单机故障剔除**

| 配置项                                                       | 说明                     | 类型    | 默认值 |
| ------------------------------------------------------------ | ------------------------ | ------- | ------ |
| com.alipay.sofa.rpc.aft.regulation.effective                 | 是否开启单机故障剔除功能 | Boolean | false  |
| com.alipay.sofa.rpc.aft.degrade.effective                    | 是否开启降级             | Boolean | false  |
| com.alipay.sofa.rpc.aft.time.window                          | 时间窗口                 | Long    | 10     |
| com.alipay.sofa.rpc.aft.least.window.count                   | 最小调用次数             | Long    | 10     |
| com.alipay.sofa.rpc.aft.least.window.exception.rate.multiple | 最小异常率               | Double  | 6.0    |
| com.alipay.sofa.rpc.aft.weight.degrade.rate                  | 降级速率                 | Double  | 0.05   |
| com.alipay.sofa.rpc.aft.weight.recover.rate                  | 恢复速率                 | Double  | 2.0    |
| com.alipay.sofa.rpc.aft.degrade.least.weight                 | 降级最小权重             | Integer | 1      |
| com.alipay.sofa.rpc.aft.degrade.max.ip.count                 | 最大降级 ip数量          | Integer | 2      |

**Bolt**

| 配置项                                          | 说明                                      | 类型    | 默认值                                                       |
| ----------------------------------------------- | ----------------------------------------- | ------- | ------------------------------------------------------------ |
| com.alipay.sofa.rpc.bolt.port                   | bolt 端口                                 | Integer | 优先生效的是environment中是否设置rpc_tr_port，然后才是此处设置的值。默认12200 |
| com.alipay.sofa.rpc.bolt.thread.pool.core.size  | bolt 核心线程数                           | Integer | 20                                                           |
| com.alipay.sofa.rpc.bolt.thread.pool.max.size   | bolt 最大线程数                           | Integer | 200                                                          |
| com.alipay.sofa.rpc.bolt.thread.pool.queue.size | bolt 线程池队列                           | Integer | 0                                                            |
| com.alipay.sofa.rpc.bolt.accepts.size           | bolt 服务端允许客户端建立的连接数         | Integer | 必须大于0，默认100000                                        |
| com.alipay.sofa.rpc.bolt.process.in.io.thread   | bolt 服务端业务处理是否直接在worker中处理 | Boolean | false                                                        |
| com.alipay.sofa.rpc.enable.swagger              | 是否开启针对bolt协议的swagger文档         | Boolean | false                                                        |

**Rest**

| 配置项                                         | 说明                                       | 类型    | 默认值               |
| ---------------------------------------------- | ------------------------------------------ | ------- | -------------------- |
| com.alipay.sofa.rpc.rest.hostname              | rest hostname                              | String  | “”                   |
| com.alipay.sofa.rpc.rest.port                  | rest port                                  | Integer | 8341                 |
| com.alipay.sofa.rpc.rest.io.thread.size        | rest io 线程数                             | Integer | 机器cpu核数* 2       |
| com.alipay.sofa.rpc.rest.context.path          | rest context path                          | String  | “”                   |
| com.alipay.sofa.rpc.rest.thread.pool.core.size | rest 核心线程数                            | Integer | 目前不可配置，默认20 |
| com.alipay.sofa.rpc.rest.thread.pool.max.size  | rest 最大线程数                            | Integer | 200                  |
| com.alipay.sofa.rpc.rest.max.request.size      | rest 最大请求大小                          | Integer | 10485760             |
| com.alipay.sofa.rpc.rest.telnet                | 是否允许 rest telnet                       | Boolean | true                 |
| com.alipay.sofa.rpc.rest.daemon                | 是否hold住端口，true的话随主线程退出而退出 | String  | true                 |
| com.alipay.sofa.rpc.rest.allowed.origins       | 跨域设置                                   | String  | “”                   |
| com.alipay.sofa.rpc.rest.swagger               | 是否开启针对rest协议的swagger文档          | boolean | false                |

**Dubbo**

| 配置项                                           | 说明                               | 类型    | 默认值                |
| ------------------------------------------------ | ---------------------------------- | ------- | --------------------- |
| com.alipay.sofa.rpc.dubbo.port                   | dubbo port                         | Integer | 20880                 |
| com.alipay.sofa.rpc.dubbo.io.thread.size         | dubbo io 线程大小                  | Integer | 0                     |
| com.alipay.sofa.rpc.dubbo.thread.pool.max.size   | dubbo 业务线程最大数               | Integer | 200                   |
| com.alipay.sofa.rpc.dubbo.accepts.size           | dubbo 服务端允许客户端建立的连接数 | Integer | 必须大于0，默认100000 |
| com.alipay.sofa.rpc.dubbo.thread.pool.core.size  | dubbo 核心线程数                   | Integer | 目前不可配置，默认20  |
| com.alipay.sofa.rpc.dubbo.thread.pool.queue.size | dubbo 线程池队列大小               | Integer | 目前不可配置，默认0   |

**Http**

| 配置项                                          | 说明                              | 类型    | 默认值                |
| ----------------------------------------------- | --------------------------------- | ------- | --------------------- |
| com.alipay.sofa.rpc.http.port                   | http port                         | Integer | 12400                 |
| com.alipay.sofa.rpc.http.thread.pool.core.size  | http 核心线程数                   | Integer | 20                    |
| com.alipay.sofa.rpc.http.thread.pool.max.size   | http 最大线程数                   | Integer | 200                   |
| com.alipay.sofa.rpc.http.thread.pool.queue.size | http 线程池队列大小               | Integer | 0                     |
| com.alipay.sofa.rpc.http.accepts.size           | http 服务端允许客户端建立的连接数 | Integer | 必须大于0，默认100000 |

**Triple**

| 配置项                                             | 说明                                | 类型    | 默认值                |
| -------------------------------------------------- | ----------------------------------- | ------- | --------------------- |
| com.alipay.sofa.rpc.triple.port                    | triple port                         | Integer | 50051                 |
| com.alipay.sofa.rpc.triple.thread.pool.core.size   | triple 核心线程数                   | Integer | 20                    |
| com.alipay.sofa.rpc.triple.thread.pool.max.size    | triple 最大线程数                   | Integer | 200                   |
| com.alipay.sofa.rpc.triple.thread.pool..queue.size | triple 线程池队列大小               | Integer | 0                     |
| com.alipay.sofa.rpc.triple.accepts.size            | triple 服务端允许客户端建立的连接数 | Integer | 必须大于0，默认100000 |

**H2c**

| 配置项                                         | 说明                         | 类型    | 默认值                |
| ---------------------------------------------- | ---------------------------- | ------- | --------------------- |
| com.alipay.sofa.rpc.h2c.port                   | h2c 端口                     | Integer | 12300                 |
| com.alipay.sofa.rpc.h2c.thread.pool.core.size  | h2c 核心线程数               | Integer | 20                    |
| com.alipay.sofa.rpc.h2c.thread.pool.max.size   | h2c 最大线程数               | Integer | 200                   |
| com.alipay.sofa.rpc.h2c.thread.pool.queue.size | h2c 队列大小                 | Integer | 0                     |
| com.alipay.sofa.rpc.h2c.accepts.size           | 服务端允许客户端建立的连接数 | Integer | 必须大于0，默认100000 |

**Registry**

| 配置项                                     | 说明                       | 类型                | 默认值                                                       |
| ------------------------------------------ | -------------------------- | ------------------- | ------------------------------------------------------------ |
| com.alipay.sofa.rpc.registry.address       | 注册中心地址               | String              | 默认使用local模式作为注册方式                                |
| com.alipay.sofa.rpc.virtual.host           | virtual host               | String              | ""                                                           |
| com.alipay.sofa.rpc.bound.host             | 绑定 host                  | String              | ""                                                           |
| com.alipay.sofa.rpc.virtual.port           | virtual端口                | String              | ""                                                           |
| com.alipay.sofa.rpc.enabled.ip.range       | 多网卡 ip 范围             | String              | 优先生效的是environment中设置的rpc_enabled_ip_range，然后才是此处设置的值。默认"" |
| com.alipay.sofa.rpc.bind.network.interface | 绑定网卡，用来获取网卡地址 | String              | 优先生效的是environment中设置的rpc_bind_network_interface，然后才是此处设置的值。默认"" |
| com.alipay.sofa.rpc.registries             | 多注册中心                 | Map<String, String> | 多种类型注册中心设置，key为注册中心的种类，value为具体注册中心地址 |

**扩展**

| 配置项                                      | 说明                             | 类型    | 默认值                                                       |
| ------------------------------------------- | -------------------------------- | ------- | ------------------------------------------------------------ |
| com.alipay.sofa.rpc.lookout.collect.disable | 是否关闭 lookout                 | Boolean | false                                                        |
| com.alipay.sofa.rpc.hystrix.enable          | 是否开启hystrix                  | String  | 不为true时，最终生效都是false                                |
| com.alipay.sofa.rpc.enable.mesh             | 是否开启mesh支持，目前只支持bolt | String  | 配置值是meshProtocol，多个以英文逗号分隔。当用户protocol包含在配置的meshProtocol时，这个协议才会开启mesh，或者当配置为all时也会开启mesh；默认值“”，例如"bolt, rest" |
| com.alipay.sofa.rpc.mock.url                | mock地址                         | String  | ""                                                           |
| com.alipay.sofa.rpc.default.tracer          | tracer实现                       | String  | ""                                                           |

**代理**

| 配置项                                                | 说明                                     | 类型   | 默认值 |
| ----------------------------------------------------- | ---------------------------------------- | ------ | ------ |
| com.alipay.sofa.rpc.consumer.repeated.reference.limit | 允许客户端对同一个服务生成的引用代理数量 | String | 3      |

