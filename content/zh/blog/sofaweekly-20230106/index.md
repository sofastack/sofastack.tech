---
title: "SOFA Weekly | SOFANews、本周贡献 & issue 精选"
authorlink: "https://github.com/sofastack"
description: "SOFA Weekly | SOFANews、本周贡献 & issue 精选"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2023-01-06T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*NAHaRrQqGzAAAAAAAAAAAAAAARQnAQ"
---

## SOFA WEEKLY | 每周精选

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1e08fca65f7643c783d33f590bb41d5a~tplv-k3u1fbpfcp-zoom-1.image)

**筛选每周精华问答，同步开源进展，欢迎留言互动～**

**SOFA**Stack（**S**calable **O**pen **F**inancial **A**rchitecture Stack）是蚂蚁集团自主研发的金融级云原生架构，包含了构建金融级云原生架构所需的各个组件，包括微服务研发框架，RPC 框架，服务注册中心，分布式定时任务，限流/熔断框架，动态配置推送，分布式链路追踪，Metrics 监控度量，分布式高可用消息队列，分布式事务框架，分布式数据库代理层等组件，也是在金融场景里锤炼出来的最佳实践。

**SOFAStack 官网:** *[https://www.sofastack.tech](https://www.sofastack.tech)*

**SOFAStack:** *[https://github.com/sofastack](https://github.com/sofastack)*

### SOFAStack 社区本周贡献

![图片](https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*UIbfRpBphOwAAAAAAAAAAAAADrGAAQ/original)

### SOFAStack GitHub issue 精选

**本周各项目回复 issue 共计 3 条**

欢迎大家在 GitHub 提交 issue 与我们互动

我们会筛选 issue 通过

" SOFA WEEKLY " 的形式回复

**1. @dengqian #2203**

> Why pprof debug server do not support hot upgrade?

A：Debug server init here：

```Java
func DefaultInitStage(c *v2.MOSNConfig) {
  InitDefaultPath(c)
  InitDebugServe(c)
  InitializePidFile(c)
  InitializeTracing(c)
  InitializePlugin(c)
  InitializeWasm(c)
  InitializeThirdPartCodec(c)
}
```

And started here:

```Java
func (m *Mosn) inheritConfig(c *v2.MOSNConfig) (err error) {
  m.Config = c
  server.EnableInheritOldMosnconfig(c.InheritOldMosnconfig)

  // default is graceful mode, turn graceful off by set it to false
  if !c.DisableUpgrade && server.IsReconfigure() {
    m.isFromUpgrade = true
    if err = m.inheritHandler(); err != nil {
      return
    }
  }
  log.StartLogger.Infof("[mosn] [NewMosn] new mosn created")
  // start init services
  if err = store.StartService(nil); err != nil {
    log.StartLogger.Errorf("[mosn] [NewMosn] start service failed: %v, exit", err)
  }
  return
}
```

**「MOSN」**：*[https://github.com//mosn/mosn/](https://github.com//mosn/mosn/)*

**2. @yemoli #1290**

> SOFARPC 发现了安全漏洞在哪提交呢？

A：可以邮件给：[khotyn.huangt@antgroup.com](khotyn.huangt@antgroup.com)。

**「SOFARPC」**：*[https://github.com/sofastack/sofa-rpc/](https://github.com/sofastack/sofa-rpc/)*

### 本周推荐阅读

[SOFARegistry | 聊一聊服务发现的数据一致性](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247520348&idx=1&sn=459c9262761bd719a028c8ea27f56591&chksm=faa37f86cdd4f690cefbcb8564ab79b327512e409ada02870561ece96c6fc07c050fdc3b7f66&scene=21)

[SOFARegistry | 大规模集群优化实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247517005&idx=1&sn=685cea90982f8ecec5ffc56880d63175&chksm=faa36c97cdd4e58163830407bd827838f6ecb0a5b0e22130b507141fe9a24b2e645666fc0571&scene=21)

[MOSN 反向通道详解](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247513902&idx=1&sn=be00c5af2e9775a4039430bf187e16f4&chksm=faa358f4cdd4d1e23d7e9c93b4a94d6e6c377f51eb5e96b6dd5f74b840e48ebd3f518c4bf80a&scene=21)

[如何看待 Dapr、Layotto 这种多运行时架构？](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247510516&idx=1&sn=eff21915cd0ac1a8c8e3f126b549a605&chksm=faa3462ecdd4cf38ab6ab0c7201902fb53d54cea4865f9b7d7cdcdc7eaa00cf354d8b05e5393&scene=21)

欢迎扫码关注：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e19d0a6d7f734ad6a585cde82ae4f3bf~tplv-k3u1fbpfcp-zoom-1.image)
