---
title: "SOFA Weekly | Tongsuo 8.3.2 版本发布、C 位大咖说、本周 Contributor & QA"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly | Tongsuo 8.3.2 版本发布、C 位大咖说、本周 Contributor & QA"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2022-12-16T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ"
---

## SOFA WEEKLY | 每周精选

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1e08fca65f7643c783d33f590bb41d5a~tplv-k3u1fbpfcp-zoom-1.image)

**筛选每周精华问答，同步开源进展，欢迎留言互动～**

**SOFA**Stack（**S**calable **O**pen **F**inancial **A**rchitecture Stack）是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

**SOFAStack 官网:** *[https://www.sofastack.tech](https://www.sofastack.tech)*

**SOFAStack:** *[https://github.com/sofastack](https://github.com/sofastack)*

### SOFAStack 社区本周 Contributor

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*MU1NSaXM4cYAAAAAAAAAAAAADrGAAQ/original      )

### 每周读者问答提炼

***欢迎大家向公众号留言提问或在群里与我们互动，我们会筛选重点问题通过 " SOFA WEEKLY " 的形式回复***

**1.小白** 提问：

>运行之后我发现和文档写的不一样 biz 和宿主的 Spring Boot 没有隔开，文档上写的是 2.6.6 和 2.5.0 但是实际启动都是 2.6.6，这是怎么回事？

A：不建议用不同 Spring Boot，多 host 模式只要不使用 Web-Ark-Plugin 是可以的；我用 Sofa-Ark-Spring-Guides 试了一下，可以设置不同的 host。

**「SOFAArk」**：*[https://github.com/sofastack/sofa-ark](https://github.com/sofastack/sofa-ark)*

**2.吴东梁** 提问：

>保存在内存里的事务信息多久会删除一次，来避免 OOM？

A：结束就删。

>那如果在事务结束之后只删内存的数据，不删除数据库里面数据会不会产生问题？

A：没有内存和数据库共用的版本，不会的。

**「Seata」**：*[https://github.com/seata/seata](https://github.com/seata/seata)*

### Tongsuo 8.3.2 版本发布

主要变更如下：

1.修复 C90 下的编译问题；

2.修复 SSL_CTX_dup() 函数的 bug；

3.修复 NTLS ServerKeyExchange 消息的 RSA 签名问题；

4.修复 apps/x509 的 SM2 证书签名 bug；

5.支持新特性 - 添加导出符号前缀。

下载地址：

[https://github.com/Tongsuo-Project/Tongsuo/releases/tag/8.3.2](https://github.com/Tongsuo-Project/Tongsuo/releases/tag/8.3.2)

### 本周推荐阅读

[Tongsuo 支持半同态加密算法 Paillier](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247517315&idx=1&sn=646e8effa2756e228c196a6f01b3d964&chksm=faa36b59cdd4e24f4719f804af649640040fd7b6c845bc021bff8c58e3de0e5e635674a17b81&scene=21)

[金融级应用开发｜SOFABoot 框架剖析](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247505461&idx=1&sn=198480c36943e1b904ab88291b539057&chksm=faa339efcdd4b0f91810d2c2dc2a9536f5378973a67d03e98f5b6a813771d46bd9cb145ed4d1&scene=21)

[Seata AT 模式代码级详解](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247516247&idx=1&sn=f57bb355cef6b823a32cd8b30c0b53ee&chksm=faa36f8dcdd4e69b91a9231330f82af5558de9349425b97e2e88e6fb3f8b33845d93af156fb1&scene=21)

[SOFA 飞船 Layotto 星球登陆计划最新进展](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247517277&idx=1&sn=b455dd163575bab9c4ca457bdd266290&chksm=faa36b87cdd4e291103881503bcc130b9ec6dc651b3fd3c9813aaa0d77377d867ee8d870ccb8&scene=21)

欢迎扫码关注：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e19d0a6d7f734ad6a585cde82ae4f3bf~tplv-k3u1fbpfcp-zoom-1.image)
