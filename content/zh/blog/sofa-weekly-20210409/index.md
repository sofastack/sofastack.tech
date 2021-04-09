---
？title: "SOFA Weekly | SOFAJRaft 发布新版本，QA 整理"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA WEEKLY | SOFAJRaft 发布新版本，QA 整理"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2021-04-09T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*Ig-jSIUZWx0AAAAAAAAAAAAAARQnAQ"
---
SOFA WEEKLY | 每周精选，筛选每周精华问答
同步开源进展，欢迎留言互动
![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*ARgKS6SuU7YAAAAAAAAAAAAAARQnAQ)
SOFAStack（Scalable Open Financial Architecture Stack）是蚂蚁金服自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

SOFAStack 官网: [https://www.sofastack.tech](https://www.sofastack.tech/)<br />
SOFAStack: [https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动
我们会筛选重点问题
通过 " SOFA WEEKLY " 的形式回复

**1、@闫文超** 提问：

>问下 SOFARPC 注册到 nacos 上，可以指定 group 的名字吗？想用于不同租户的隔离的功能。<br />

A：可以用这里的命名空间：<br />namespace :com.alipay.sofa.rpc.registry.nacos.NacosRegistry。<br />![](https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*EnAeR57WiW4AAAAAAAAAAAAAARQnAQ)
<br /> SOFAJRaft：[https://github.com/sofastack/sofa-jraft](https://github.com/sofastack/sofa-jraft)<br />

**2、@霂白** 提问：

> 注解方式发布的服务，有插件能自动生成给其他语言使用的 protobuf 的文件吗？Java 已经写了接口和 bean 的结构，直接转换为对应 pb 的文件。现在有 pb的定义文件转换注解方式的，Java 的代码的 maven 插件吗？写 pb 转 Java  或者写 Java 转 pb 两个方向总有一个通的吧，不然又写 Java，又写pb？<br />
![](https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*9KamToue8TwAAAAAAAAAAAAAARQnAQ)<br />

A：这个我理解目前应该是没有的，不过确实是一个比较有意思的方向。<br />A：pb 转 Java 问题不大，有现成的工具， 自己写一个也不是很复杂，Java 转 pb 不太兼容；pb 不支持两个参数，这里的问题在于传输协议，不在于代码格式，有需要我们开个 issue 详细聊下 ，鉴权这块后续应该会交给 MOSN 来做。<br />SOFAStack：[https://github.com/sofastack/sofastack.tech](https://github.com/sofastack/sofastack.tech)<br />

**3、@阿怪** 提问：

>请教大佬一个问题：TCC 模式，事务异常，回滚走自定义实现的 cancel 方法，这个方法里面操作了数据库回滚并且报错，有两个问题：
> 1.重试次数如何配置？
> 2.线程的 ThreadLocal 的数据无法获取，BusinessActionContext 这个类获取不到，可不可以配置？<br />

A：那就用 localtcc，一开始的 TCC 不支持 spring cloud，后续开发了个 localtcc 的注解和功能来满足。<br />Seata：[https://github.com/seata/seata](https://github.com/seata/seata)<br />

**4、@冯明明** 提问：

>我用的是最新版的 spring-cloud-ablibaba rpc 使用的 Dubbo 。截图中这种依赖方式，必须在接口上增加@LocalTcc 才能应用 TCC 模式。我看源码 这种依赖生成的是 xxx.proxy0 这种实现类不能被 RemotingParser解析，接口提供者倒是能被解析，但 DubboRemotingParser 生成的 RemoteSpec 的 protocol 属性是 Dubbo，源码中只有 injvm 能走 TCC 的相关逻辑，请问我是哪里没有配置正确吗 ?<br />
![](https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*wmiTRZxN9oMAAAAAAAAAAAAAARQnAQ)

A：1.方便以后出控制台可以实时查看分支事务状态； 2.比如某些分支吞了异常后，有 report 的情况下方便判断。比如：a 调 b 再调 c，b 其实已经出现异常并且本地事务下已经回滚了，此时 c 响应给 a，a 做后续处理的时候异常，此时 TC 发现 b 已经由本地事务回滚了，就无需驱动了，这样就减少了下发的数量。<br />
Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

**5、@张红亮** 提问：

>能在 service 实现里再次调用的方法上加 @GlobalTransactional 吗？<br />
![](https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*WcvTTZsXge0AAAAAAAAAAAAAARQnAQ)
![](https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*R59sQJyrxo4AAAAAAAAAAAAAARQnAQ)

A：可以的，跟本地事务注解一样，支持事务传播。<br />
Seata：[https://github.com/seata/seata](https://github.com/seata/seata)

### 本周推荐阅读

- [Protocol Extension Base On Wasm——协议扩展篇](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487546&idx=1&sn=72c3f1ede27ca4ace7988e11ca20d5f9&chksm=faa0ffe0cdd776f6d17323466b500acee50a371663f18da34d8e4cbe32304d7681cf58ff9b45&scene=21)

- [WebAssembly 在 MOSN 中的实践 - 基础框架篇](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487508&idx=1&sn=4b725ef4d19372f1711c2eb066611acf&chksm=faa0ffcecdd776d81c3d78dbfff588d12ef3ec3c5607036e3994fee3e215695279996c045dbc&scene=21)

- [MOSN 的无人值守变更实践](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487479&idx=1&sn=e5972cbc1d8c04cff843380117158539&chksm=faa0e02dcdd7693b965e35014cfef4dc3be84e477e0c74694421658a2570162ad73883e7b054&scene=21)

- [SOFAGW 网关：安全可信的跨域 RPC/消息 互通解决方案](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247487444&idx=1&sn=1d55a7c68e105f305198eae65f587e2e&chksm=faa0e00ecdd76918b5cf4b5f4102347581de6c6f5154551d57dabfbfe16b45309f021e150a6f&scene=21)

### 本周发布
**本周发布详情如下：**<br />**1**、SOFAJRaft **** 发布 v**1.3.6 版本，主要变更如下：**

- 增加 Replicator 的状态变化监听器 <br />
- RheaKV 增加批量原子更新 API <br />
- Grpc 模块支持 max_inbound_message_size 配置 <br />
- 优化 RheaKV 内存占用 <br />

详细参考：<br />[https://github.com/sofastack/sofa-jraft/releases/tag/1.3.6](https://github.com/sofastack/sofa-jraft/releases/tag/1.3.6)

