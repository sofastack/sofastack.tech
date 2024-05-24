---
title: "SOFA Weekly | QA 整理"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly | QA 整理"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2021-07-02T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*Ig-jSIUZWx0AAAAAAAAAAAAAARQnAQ"
---
SOFA WEEKLY | 每周精选，筛选每周精华问答
同步开源进展，欢迎留言互动
![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*ARgKS6SuU7YAAAAAAAAAAAAAARQnAQ)
SOFAStack（Scalable Open Financial Architecture Stack）是蚂蚁金服自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

SOFAStack 官网: [https://www.sofastack.tech](https://www.sofastack.tech/)

SOFAStack: [https://github.com/sofastack](https://github.com/sofastack)

### 每周读者问答提炼

欢迎大家向公众号留言提问或在群里与我们互动

我们会筛选重点问题

通过 " SOFA WEEKLY " 的形式回复

1、@刘世杰 提问：

> 新接触 SOFABoot，有 2 个问题想请教一下：
>1.如何根据不同的贡献方选择对应的扩展实现？贡献方有多个的情况下，覆盖了原始的对象，没看到如何根据身份定位具体实现的逻辑，不知道是遗漏了什么说明文档，我看的这个文档：[https://www.sofastack.tech/projects/sofa-boot/extension/](https://www.sofastack.tech/projects/sofa-boot/extension/)

> 2.如何确保贡献方提供的 jar 包不对服务提供方产生影响？如果多个贡献方提供的  jar 包里间接依赖了不同版本的二三方的 jar 包。在同一个 classloader 下只能加载一个版本的 class，那对某些贡献方的逻辑处理可能会出现 NoClassDefFoundError 类的异常。SOFAArk 是具备了这种隔离的能力的，是否需要引入这种方式？

A：1.如果有多个扩展点 x 的扩展地方，那么 A 的 registerExtension 就会被调用多次（与被扩展的次数一样，这个方法需要线程安全）；框架无法获知扩展者的身份，这个就需要扩展点提供方自行甄别。

2.第二种情况，其实不仅限于 SOFABoot 中的扩展点，仅有一个 class loader 的情况下，会出现这种情况。个人认为在没有动态性要求的情况下，优先解决 maven 依赖冲突。

SOFABoot：[https://github.com/sofastack/sofa-boot](https://github.com/sofastack/sofa-boot)

2、@刘世杰 提问：

> 1.按照官网的 Demo，如果有多个贡献方 A、B、C，按照顺序执行了 registerExtension 方法，那 word 的值会以 C 为准吗？意思是不是说在运行时一个扩展点只有一个贡献方？

> 2.如果贡献方比较多的话，这个后期的解决冲突的成本会不会比较高。还有些比较隐蔽的实现，可能不是太好测试出来，到生产才发现问题。另外，如果做动态的话在 SOFABoot 的技术栈里是扩展点 +Ark 的方式？

A：1.这个顺序是没有保证的，SOFABoot 为了启动速度，并行化了上下文刷新的，因此可能是 A、B、C 顺序，也有可能是 C、B、A；运行时可以有多个实现的，这个取决于你的服务类型，以及如何实现的。

2.可以这么理解，SOFAArk 就是一种动态扩展的方案。

SOFABoot：[https://github.com/sofastack/sofa-boot](https://github.com/sofastack/sofa-boot)

3、@证道者 提问：

> MOSN mirror 功能是只能转发 Dubbo 的流量么？

A：不是只能转发 Dubbo，都可以的。

MOSN：[https://github.com/mosn/mosn/](https://github.com/mosn/mosn/)

### 本周推荐阅读

- [【感谢有你，SOFAer】一图看懂 SOFAStack 2021 半年报](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247488905&idx=1&sn=aaa36d4e22b5f9bd0512d92f16096fef&chksm=faa0fa53cdd7734554398ec37259f6fd07f63f38203d3d52d4991a481fe4f2d572bf879c0830&scene=21)

- [MOSN 多协议扩展开发实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247488899&idx=1&sn=5558ae0a0c23615b2770a13a39663bb3&chksm=faa0fa59cdd7734f35bea5491e364cb1d90a7b9c2c129502da0a765817602d228660b8fbba20&scene=21&token=1675156365&lang=zh_CN#wechat_redirect)

- [MOSN 子项目 Layotto：开启服务网格+应用运行时新篇章](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247488835&idx=1&sn=d645b9abc866048e679b56bfe3b72482&chksm=faa0fa99cdd7738ff1749ae75b1670f953c92b70dcf0358337977438fd74b632b21a7b17ece3&scene=21)

- [揭秘 AnolisOS 国密生态，想要看懂这一篇就够了](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247488577&idx=1&sn=172642c14cc511e27aa882ca7586a4c4&chksm=faa0fb9bcdd7728db0fdceec44b44bb93f36664cbb33e3c50e61fcc05dbc2647ff65dfcda3ee&scene=21)

更多文章请扫码关注“金融级分布式架构”公众号

> ![](https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*s3UzR6VeQ6cAAAAAAAAAAAAAARQnAQ)
