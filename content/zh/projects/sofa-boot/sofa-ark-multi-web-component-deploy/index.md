---
title: "SOFAArk 源码解析-多 Web 应用合并部署"
author: "吴航"
authorlink: "https://github.com/MingkeVan"
description: "SOFAArk 源码解析-多 Web 应用合并部署"
categories: "SOFAStack"
tags: [“源码解析”]
date: 2022-06-16T15:00:00+08:00
---

- [背景](#背景)
- [原生 springboot-web 应用部署流程](#原生springboot-web应用部署流程)
- [两种合并部署模式](#两种合并部署模式)
- [支持单 Host 合并部署的关键点](#支持单Host合并部署的关键点)
  - [多 Biz 共用 tomcat 实例](#多Biz共用tomcat实例)
  - [多 Biz 接口区分](#多Biz接口区分)
- [总结](#总结)

## 背景

SOFAArk 基于 java 类加载机制，为我们提供了一种 java 进程内多模块隔离的方案。每个业务模块——Ark Biz，都是一个完整的 springboot 项目，可独立运行；也可作为一个 maven 依赖或远程 jar 包，引入被称为 Master Biz 的基座 Biz，随着 Master Biz 的启动合并部署运行，并由专属的 BizClassLoader 加载来实现隔离。  

当多个合并部署的 Biz 为 web 应用时，则面临着更多的挑战，这里我们可以对比独立 tomcat 部署多个 webapp 的实现，其除了各 webapp 之间的隔离外，还要保证 tomcat 自身资源的共享和统一管控。SOFAArk 从 0.6.0 开始支持基于 springboot embedded tomcat 的多 web 应用合并部署，它是如何做到的，是否可以继续扩展支持其它类型 web 容器应用，下文将会进行具体分析。

## 原生 springboot-web 应用部署流程

![springboot tomcat应用启动流程](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*aZ3-TLWCZ7MAAAAAAAAAAAAAARQnAQ)  

我们先从原生的 springboot 构建的基于内置 tomcat 的 web 应用说起。其在运行 main 函数初始化时，使用 TomcatServletWebServerFactory#getWebServer 这一工厂方法，创建了一个实现 WebServer 接口的 TomcatWebServer 实例，用来控制一个 tomcat 服务器，其中包括了一个 Catalina Server 的实现 StandardServer，Server 中的 Engine、Host、Context 容器也都是一个，Context 中包含了唯一的 contextPath。  

springboot 自身还有 jetty、netty 等 WebServer 的实现，同样由其对应的工厂方法创建。对应的工厂 bean 基于 springboot 的自动装配机制加载。

## 两种合并部署模式

![两种合并部署模式](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*vCX1S5rmAuwAAAAAAAAAAAAAARQnAQ)

首先我们可以参考非 Web 的多 Biz 合并部署，SOFAArk 使用不同的类加载器加载不同的 Biz，其中 Master Biz 为 LaunchedURLClassLoader 加载，非 Master Biz 有其专属的 BizClassLoader 加载。对于每个 Web Biz，也会使用其类加载器完成上述原生 springboot web 应用的启动流程，创建自己的 Server、Host 等。  
这种情况下，为了区分不同 Biz 的接口，需要为每个 Biz 配置不同的 port。

这种方式由于一个 Jvm 进程中包含了多个 Server 及其 Host，因此被称为多 Host 模式。  

多 Host 模式的问题首先在于重复创建了 tomcat 相关的资源，造成资源的浪费；其次是每个 Biz 有自己的端口，不利于整个 Ark 包应用整体对外提供服务。因此 SOFAArk 提供了类似独立 tomcat 部署多 webapp 的方式。所有 Biz 共用同一个 Server 及 Host，每个 Biz 只创建自己的 Context，通过 Context 中的 contextPath 将自身接口与其它 Biz 接口做区分。

这种方式由于一个 Jvm 进程中共用一个 Server 及其 Host，因此被称为单 Host（多 Context）模式。下面将就其实现做重点介绍。

## 支持单 Host 合并部署的关键点

相较于单纯的 springboot 应用，一个 Ark 包的复杂之处在于，它可以包含多个 Ark Biz，其中每个 Ark Biz 都是一个完整的 springboot 项目。因此在使用单个内置 tomcat 实例部署时会面临以下问题：

1. 多个 Biz(springboot 项目)需要共用 tomcat 实例；

2. 需要像独立 tomcat 下部署多 webapp 一样，通过添加前缀的方式区分不同 Biz 的 http 接口。

因此 sofa-ark 对 springboot 的相关实现做了替换，具体如下：  

| sofa-ark                           | springboot                      |
| ---------------------------------- | ------------------------------- |
| ArkTomcatServletWebServerFactory   | TomcatServletWebServerFactory   |
| ArkTomcatEmbeddedWebappClassLoader | TomcatEmbeddedWebappClassLoader |
| ArkTomcatWebServer                 | TomcatWebServer                 |

并使用其插件机制来扩展，ArkTomcatEmbeddedWebappClassLoader 位于 web-ark-plugin 插件中，当 maven 依赖该插件时，springboot 判断 ArkTomcatEmbeddedWebappClassLoader 类存在，加载 ArkTomcatServletWebServerFactory，该 Factory 再创建 ArkTomcatWebServer，由此使用单 Host 模式合并部署。  

若未依赖该插件，则 ArkTomcatEmbeddedWebappClassLoader 不存在，springboot 自动加载其原生实现，使用多 Host 模式合并部署。

### 多 Biz 共用 tomcat 实例

针对第一个问题——多个 Biz 要共用 tomcat 实例，sofa-ark 定义了 EmbeddedServerService 接口，插件 web-ark-plugin 里包含了接口的实现 EmbeddedServerServiceImpl，来持有公共 tomcat 实例。

````Java
package com.alipay.sofa.ark.web.embed.tomcat;
//作为ark plugin导出
public class EmbeddedServerServiceImpl implements EmbeddedServerService<Tomcat> {
    //共享tomcat
    private Tomcat tomcat;
    private Object lock = new Object();

    @Override
    public Tomcat getEmbedServer() {
        return tomcat;
    }

    @Override
    public void setEmbedServer(Tomcat tomcat) {
        if (this.tomcat == null) {
            //通过加锁，避免多Web Biz并发启动加载时重复创建tomcat实例
            synchronized (lock) {
                if (this.tomcat == null) {
                    this.tomcat = tomcat;
                }
            }
        }
    }
}
````

如果 Biz 引入了 web-ark-plugin，则在 ArkTomcatServletWebServerFactory 中注入 EmbeddedServerServiceImpl，持有最先初始化的 Web Biz 创建的 Tomcat 实例(TomcatWebServer 的核心)，并在后续初始化的其它 Biz 调用 getWebServer 获取 tomcat 实例时，返回持有的同一个实例，以此来保证多个 Biz 运行在同一个 tomcat 中。

````Java
package com.alipay.sofa.ark.springboot.web;
//每个Web Biz启动中都会创建一个自己的该类实例
public class ArkTomcatServletWebServerFactory extends TomcatServletWebServerFactory {

    @ArkInject
    private EmbeddedServerService<Tomcat> embeddedServerService;
    //每个Web Biz启动中调用一次
    @Override
    public WebServer getWebServer(ServletContextInitializer... initializers) {
        if (embeddedServerService == null) {
            // 未依赖web-ark-plugin插件，找不到EmbeddedServerService实现注入时，与原生springboot embedded tomcat实现保持一致
            return super.getWebServer(initializers);
        } else if (embeddedServerService.getEmbedServer() == null) {
            // 最先启动的Web Biz(2.0.0版本之后为Master Biz)运行时，tomcat实例还未创建，初始化一次
            embeddedServerService.setEmbedServer(initEmbedTomcat());
        }
        // 多个biz共用同一个tomcat
        Tomcat embedTomcat = embeddedServerService.getEmbedServer();
        // 多个biz共用同一个host，只创建各自的Context容器
        prepareContext(embedTomcat.getHost(), initializers);
        return getWebServer(embedTomcat);
    }
}
````

### 多 Biz 接口区分

对于第二个问题——区分不同 Biz 的 http 接口，独立运行的 tomcat 是通过 contextPath 这一配置来实现的，每个 webapp 设置不同的 contextPath，作为不同 webapp 接口的前缀，例如 server.xml 中可以做如下配置

````Java
<context path="test1" docBase="~/Documents/web1/" reloadable = true>
<context path="test2" docBase="~/Documents/web2/" reloadable = true>
````

默认情况下使用 war 包解压后的文件夹名作为其 contextPath。  
springboot 中可使用以下方式指定 contextPath，默认为""，一个 springboot 项目只能指定一个。

````Java
server:
  servlet:
    context-path: /myapp1
````

因此对于 sofa-ark 而言，参考了独立 tomcat 的实现方式，基于 contextPath 区分，并对 springboot 的内置 tomcat 实现做了改造，每个 Biz 均是如下流程：  

1、在其 MANIFEST 文件中配置 web-context-path 属性的值作为其 contextPath，例如：

````Java
Manifest-Version: 1.0
web-context-path: another
````

2、在调用 BizFactoryServiceImpl 的 createBiz 方法创建 BizModel 时，设置到该 Biz 的 BizModel 对象中

````Java
package com.alipay.sofa.ark.container.service.biz;

@Singleton
public class BizFactoryServiceImpl implements BizFactoryService {
    //基于Biz的jar包创建Biz
    @Override
    public Biz createBiz(BizArchive bizArchive) throws IOException {
        BizModel bizModel = new BizModel();
        //读取MANIFEST文件
        Attributes manifestMainAttributes = bizArchive.getManifest().getMainAttributes();
        bizModel
            .setBizState(BizState.RESOLVED)
            .setBizName(manifestMainAttributes.getValue(ARK_BIZ_NAME))
            .setBizVersion(manifestMainAttributes.getValue(ARK_BIZ_VERSION))
            //contextPath设置
            .setWebContextPath(manifestMainAttributes.getValue(WEB_CONTEXT_PATH))
            .setClassPath(bizArchive.getUrls());
        //专属BizClassLoader创建
        BizClassLoader bizClassLoader = new BizClassLoader(bizModel.getIdentity(),
            getBizUcp(bizModel.getClassPath()), bizArchive instanceof ExplodedBizArchive
                                                || bizArchive instanceof DirectoryBizArchive);
        bizClassLoader.setBizModel(bizModel);
        bizModel.setClassLoader(bizClassLoader);
        return bizModel;
    }
}
````

3、随后在 ArkTomcatServletWebServerFactory 的 prepareContext 方法中，为每个 Biz 创建其 Context 时，设置其对应的 contextPath。

````Java
package com.alipay.sofa.ark.springboot.web;

public class ArkTomcatServletWebServerFactory extends TomcatServletWebServerFactory {

    @ArkInject
    private BizManagerService             bizManagerService;
    @Override
    protected void prepareContext(Host host, ServletContextInitializer[] initializers) {
        StandardContext context = new StandardContext();
        context.setName(getContextPath());
        context.setPath(getContextPath());
        host.addChild(context);
    }
    @Override
    public String getContextPath() {
        String contextPath = super.getContextPath();
        //基于当前正在使用的ClassLoader找到对应的Biz
        Biz biz = bizManagerService.getBizByClassLoader(Thread.currentThread()
            .getContextClassLoader());
        if (!StringUtils.isEmpty(contextPath)) {
            //优先使用springboot原生配置
            return contextPath;
        } else if (biz != null) {
            //如果Biz没有配置，默认为根目录""
            if (StringUtils.isEmpty(biz.getWebContextPath())) {
                return ROOT_WEB_CONTEXT_PATH;
            }
            //Biz有显式配置，则使用Biz
            return biz.getWebContextPath();
        } else {
            return ROOT_WEB_CONTEXT_PATH;
        }
    }
}
````

![sofa-ark tomcat应用启动流程](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*WxxOQphiHdQAAAAAAAAAAAAAARQnAQ)

## 总结

针对合并部署这一 SOFAArk 主要特性，Web 应用可以仿照普通 SOFAArk 应用，基于类隔离，在单进程内创建多个相互隔离的 web 容器实例(tomcat、jetty、netty 等)，这种多 Host 模式下需要通过端口区分不同的 web 容器。  

此外还可以用插件的方式为不同 web 容器提供深度扩展支持，多应用共享相同的 web 容器实例，只对 contextPath 等 Biz 专属的上下文配置做好隔离，减少资源的重复创建，这就是单 Host 模式。  

随着 Webflux 应用越来越广泛，SOFAArk 后续也会按照上述思路，对其使用的 netty 服务器进行合并部署支持，敬请期待。
