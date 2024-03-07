---
title: "高效降本｜深度案例解读 Koupleless 在南京爱福路的落地实践"
authorlink: "https://github.com/sofastack"
description: "高效降本｜深度案例解读 Koupleless 在南京爱福路的落地实践"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2024-02-27T15:00:00+08:00
cover: "https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*2VbVRJaGtF8AAAAAAAAAAAAADrGAAQ/original"
---

文｜**祁晓波**

南京爱福路汽车科技基础设施负责人

主要研究微服务、可观测、稳定性、研发效能、Java 中间件等领域。

**本文 4812 字 阅读 12 分钟**

Koupleless *（原 SOFAServerless）* 自 2023 年开源以来已经落地了若干企业，这些企业也见证了从 SOFAServerless 到 Koupleless 的品牌&技术能力迭代升级。随着 Koupleless 1.0 的重磅发布，一些企业已经在内部取得了不错的效果，例如南京爱福路汽车科技有限公司。

南京爱福路汽车科技有限公司和大多数科技企业一样，在企业生产开发过程遇到了微服务的一些问题，例如资源成本过高、启动慢等问题。在看到 Koupleless 项目正不断开源出实实在在的能力和案例，在解决很实际的微服务痛点问题，决定采用 Koupleless 进行尝试，并随着 Koupleless 一路走来，已经将 6 个应用合并成 1 个应用大幅降低资源成本，取得了不错的效果。

## 1｜背景

南京爱福路汽车科技有限公司 *（以下简称爱福路）* 作为行业 top 的汽车后市场解决方案提供商，为维修门店提供智慧管理系统、为行业提供维修应用大数据，致力于成为汽车后市场数智化构建者。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/10985f31ca1c48b68b4511a79e84893b~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1080\&h=675\&s=267030\&e=png\&b=fefafa)

随着其服务的企业增多，爱福路也越来越多地接触到了各类体量的企业。

这就对爱福路的服务提供形式提出了较多不同的诉求： **除了单纯的公有云 SAAS 之外，还包括私有化部署等解决方案的诉求。**

## 2｜问题提出

我们知道，随着微服务和云原生技术的普及，应用数量急剧膨胀。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8f63fe5b75204348911d61baf3f9b0f9~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=864\&h=480\&s=597034\&e=png\&b=e9e9e9)

如此多的应用也带来了比较大的成本问题。

爱福路在为海量公域客户提供服务的时候，更关注稳定、弹性。

但是在为某个客户提供独立部署方案时，爱福路发现如此多的服务在部署到 K8s 时所带来的服务器成本非常高 *（通常来说，独立部署服务面向的客户群体比之公域客户少了 1-2 个数量级）*，而单个客户也很难有足够的预算负担整个部署方案。这就大大阻塞了爱福路后续持续拓展私有化部署客户的进度。

举个例子：一个应用在进行 K8s 交付时，最少会提供两个副本；而大量这样的 Java 应用存在对于整体的集群利用率不高，继而造成较高的成本。

因此爱福路面临着如下的课题： **当进行私有化交付时，如何能够更便捷地、低成本地交付我们现有的产物？**

其中，低成本至少应该包含如下几个角度：

*   既存代码的低成本改造；
*   新的交付方式低成本的维护；
*   运行产物低成本的 IT 成本。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3a1132f109f3418b95c45d307ebf781e~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=844\&h=470\&s=425816\&e=png\&b=fbfafa)

## 3｜问题探索和推导

爱福路基于当前的微服务架构和云原生方式进行了思考和探索： **是否到了爱福路微服务架构进一步升级的时候了？**

在当前整体降本增效的大环境趋势中，在保持服务稳定的前提下对于服务器有更加极致的使用。

**从业务视角来看，服务单店的整体服务器成本越低，爱福路的竞争力就越强。**

那么，有没有可能在保持 Java 的生态环境下，低成本的同时能够保证爱福路继续享受云原生的红利？爱福路做了如下推导：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c5c1ee84cafc47b596d87353d8216314~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=920\&h=592\&s=161374\&e=png\&b=fefefe)

通过上述的推导，爱福路判断**也许「模块化+Serverless」将是一种解法。**

因此一款来自蚂蚁的开源框架成为他们重点的关注，那就是 Koupleless。（阅读原文可跳转官网地址：[https://koupleless.io/user-cases/ant-group/](https://koupleless.io/user-cases/ant-group/)）

当然一个重要原因是蚂蚁开源一直做得不错，社区也比较活跃。除了社区群和 GitHub 之外，PMC 有济也积极地建立了独享的 VIP 群进行专门对接。

## 4｜Koupleless（原 SOFAServerless）

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0bbc8e7b460e4b92ace63201370ea74e~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1080\&h=217\&s=56869\&e=png\&a=1\&b=fa9580)

Koupleless 技术体系是在业务发展、研发运维的复杂性和成本不断增加的情况下，蚂蚁集团为帮助应用又快又稳地迭代而决定研发，从细化研发运维粒度和屏蔽基础设施的角度出发，演进出的一套低成本接入的「模块化+Serverless」解决方案。

核心方式是通过类隔离和热部署技术，将应用从代码结构和开发者阵型拆分为两个层次：业务模块和基座，基座为业务模块提供计算环境并屏蔽基础设施，模块开发者不感知机器、容量、中间件等基础设施，专注于业务研发帮助业务快速向前发展。

### 合并部署降成本

在企业中， “80%” 的长尾应用仅服务 “20%” 的流量，蚂蚁集团也不例外。

在蚂蚁集团存在大量长尾应用，每个长尾应用至少需要 预发布、灰度、生产 3 个环境，每个环境最少需要部署 3 个机房，每个机房又必须保持 2 台机器高可用，因此大量长尾应用 CPU 使用率不足 10%。

通过使用 Koupleless，蚂蚁集团对长尾应用进行了服务器裁撤，借助类委托隔离、资源监控、日志监控等技术，在保证稳定性的前提下，实现了多应用的合并部署，极大降低了业务的运维成本和资源成本。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/73c57c9f4cdc4d25bd3ec03894e29bd9~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=920\&h=234\&s=110267\&e=png\&b=ffffff)

此外，采用这种模式，小应用可以不走应用申请上线流程，也不需要申请机器，可以直接部署到业务通用基座之上，从而帮助小流量业务实现了快速创新。

2023 年底 SOFAServerless 品牌全新升级为 Koupleless（GitHub页面：[https://github.com/koupleless/koupleless](https://github.com/koupleless/koupleless)）。

企业里不同业务有不同的发展阶段，因此应用也拥有自己的生命周期。

>  ![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/78fd8d92534a4cf6b0243616eb34bb80~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1080\&h=55\&s=7133\&e=jpg\&b=f5b536)
> *   初创期：一个初创的应用一般会先采用单体架构。
> *   增长期：随着业务增长，应用开发者也随之增加。此时您可能不确定业务的未来前景，也不希望过早把业务拆分成多个应用以避免不必要的维护、治理和资源成本，那么您可以用 Koupleless 低成本地将应用拆分为一个基座和多个功能模块，不同功能模块之间可以并行研发运维独立迭代，从而提高应用在此阶段的研发协作和需求交付效率。
> *   成熟期：随着业务进一步增长，您可以使用 Koupleless 低成本地将部分或全部功能模块拆分成独立应用去研发运维。
> *   长尾期：部分业务在经历增长期或者成熟期后，也可能慢慢步入到低活状态或者长尾状态，此时您可以用 Koupleless 低成本地将这些应用一键改回模块，合并部署到一起实现降本增效。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/320ebc0adfea4398999cc9a5ef87397c~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=920\&h=164\&s=46640\&e=png\&b=fefcfc)

<center>应用生命周期演进</center>

可以看到 Koupleless 主要通过将应用模块化来降低整个服务的运行成本，更值得称道的是支持模块和应用的来回切换，可以更低成本地接入，支持平滑演进。

## 5｜架构适配尝试

### Spring Boot 1「可行性确认」

爱福路的存量应用中，九成使用的是 Spring Boot 1，RPC 主要依赖 Dubbo 2.6。这点和社区是有一定出入的，社区仅仅支持 SpringBoot 2。

为此爱福路需要尝试对于 Spring Boot 1 的支持，也因此提出了相应的 issue👇

[https://github.com/sofastack/sofa-ark/issues/268](https://github.com/sofastack/sofa-ark/issues/268)

通过和社区沟通协调确认，爱福路发现只是社区没能够完全覆盖到这块，企业自身可以通过部分扩展进行支持。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5d00e025e00744778201827c56ec6b9d~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=920\&h=618\&s=348981\&e=png\&b=131519)

当时社区同学认为这个是比较重要的变更，可以进一步覆盖更多的社区用户，为此还特地调整了中央仓库的发版频次：加速 review、加速发 snapshot。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/12a2c6e9c1aa437eb12fb417046859ad~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=654\&h=300\&s=124170\&e=png\&b=edeff0)

正是这些细节让爱福路更加信任 Koupleless 团队👍，也坚定了此次方案能够实际落地的信心。

### 应用合并

当 Spring Boot 1 得到支持之后，爱福路可以快速地将原来的应用转换成为模块，也能够成功地启动和运行。

### Dubbo 2.6 合并问题

*   Dubbo 是一种高效、可扩展、可靠的分布式服务框架解决方案，由阿里巴巴公司开发并开源，适用于构建大型分布式系统。它基于 RPC 的服务调用和服务治理，具有透明化的远程调用、负载均衡、服务注册与发现、高度可扩展性、服务治理等特点。

正如上文所说，爱福路的服务主要是 Dubbo 进行 RPC 调用，但是 Dubbo 2.6 对于 Sofa-ark 倡导的多 ClassLoader 支持不够完善，因此爱福路也通过各种方式来进行尝试。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9fba333cf3884a30b749e349bb0d86c2~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=920\&h=408\&s=383488\&e=png\&b=0b0b0b)

为此，爱福路也和社区进行沟通确认，最后社区提供了一套相对简便的能够增强 Dubbo 版本、支持多 ClassLoader 的方案👇

[https://github.com/sofastack/sofa-serverless/pull/279](https://github.com/sofastack/sofa-serverless/pull/279)

### 应用模型抽象封装

*   Apollo（阿波罗）是一款可靠的分布式配置管理中心，诞生于携程框架研发部，能够集中化管理应用不同环境、不同集群的配置，配置修改后能够实时推送到应用端，并且具备规范的权限、流程治理等特性，适用于微服务配置管理场景。

服务端基于 Spring Boot 和 Spring Cloud 开发，打包后可以直接运行，不需要额外安装 Tomcat 等应用容器。Java 客户端不依赖任何框架，能够运行于所有 Java 运行时环境，同时对 Spring/Spring Boot 环境也有较好的支持。

但问题是，在同一个 JVM 中，Apollo 的 appid 会互相污染，导致最后只有一个 Apollo 配置能够获取。

[https://github.com/apolloconfig/apollo/issues/2921](https://github.com/apolloconfig/apollo/issues/2921)

```Java

private static final String[] APOLLO_SYSTEM_PROPERTIES = {"app.id", ConfigConsts.APOLLO_CLUSTER_KEY,
      "apollo.cacheDir", "apollo.accesskey.secret", ConfigConsts.APOLLO_META_KEY, PropertiesFactory.APOLLO_PROPERTY_ORDER_ENABLE};
/**
   * To fill system properties from environment config
   */
  void initializeSystemProperty(ConfigurableEnvironment environment) {
    for (String propertyName : APOLLO_SYSTEM_PROPERTIES) {
      fillSystemPropertyFromEnvironment(environment, propertyName);
    }
  }

  private void fillSystemPropertyFromEnvironment(ConfigurableEnvironment environment, String propertyName) {
    if (System.getProperty(propertyName) != null) {
      return;
    }

    String propertyValue = environment.getProperty(propertyName);

    if (Strings.isNullOrEmpty(propertyValue)) {
      return;
    }

    System.setProperty(propertyName, propertyValue);
  }

```

核心是因为其使用了 System.setProperty 导致了 appid 的覆盖。基于此，社区也提供了相关的一键接入组件，可以便捷接入。

### 静态合并发布加速

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bb33d3e51e59499aa53aab4c304e5a2e~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=920\&h=404\&s=417748\&e=png\&b=151618)

此外爱福路还遇到了启动时间太长的问题。与社区沟通后，社区立项提供了静态部署的加速方案，将原来的串行发布修改为并行发布，启动速度提升明显。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bc4a4c1afb2c4c219244201dc8ce6d55~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=920\&h=136\&s=89848\&e=png\&b=16181a)

对比上下两张图，可以发现修改之后，启动时间从原来的 114 秒加速到了 29 秒。

## 6｜初步成果

爱福路接入了 Koupleless 之后，成功地合并了多个应用。

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/96224982ef284ecfa414d900993cf5df~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=460\&h=168\&s=23673\&e=png\&b=030303)

## 7｜后续演进和诉求

对于社区，爱福路有着满满的肯定，更多应用也将落地 Koupleless，因此提出了后续的演进诉求：

1、对于模块应用的卸载稳定性的诉求：对于动态发布，不希望每次修改一个模块就要重启整个应用；

2、针对爱福路利用 K8s 的 service 作为 http 的自动发现来说，pod 的就绪探针是一起的，那么如何做到一个模块发布不影响其他流量请求，以及 ingress 需要如何做；

3、针对云原生发布来看，如何更加无缝接入当前的发布体系

\## 推荐阅读

[SOFAServerless 品牌升级为 Koupleless，重磅发布 1.0 版本](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==\&mid=2247548953\&idx=1\&sn=41accf0f98fe31e0985087f36826acaa\&chksm=faa3efc3cdd466d53fabc76e827a73ff2ead3411d4039d16460461d4e80158ae76557d7b91f0\&scene=21)

[线上应用 10 秒启动、只占 20M 内存！](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==\&mid=2247547389\&idx=1\&sn=48f6caf11829e9ada93791c9e20b0e6e\&chksm=faa3d627cdd45f31960ce0983c71894d62cfe0520a9f6b845a4aa6c512213c91e1bc82ec8503\&scene=21)

[大象转身：支付宝资金技术 Serverless 提效总结](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==\&mid=2247541695\&idx=1\&sn=70ea82d3e7fc9c2de5df9dc70ebcbc46\&chksm=faa3cc65cdd44573a00b4f092f42a5cdcc5519a466fcdf2638e8912594b4b6438bb8932faa83\&scene=21)

[Lunettes - 让 Kubernetes 服务运营更简单](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==\&mid=2247545565\&idx=1\&sn=bc25382475741cbd512bfcc78f7e89b2\&chksm=faa3dd07cdd454116d2646cc6034d01aa11757fea7efaf3fb32b0033e8f2d11e4ee4d3cf0896\&scene=21)

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7068c5db428942ec907dbbd2aefa37af~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1080\&h=812\&s=66592\&e=jpg\&b=fefefe)
