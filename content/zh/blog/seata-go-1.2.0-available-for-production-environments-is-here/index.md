---
title: "生产环境可用的 Seata-go 1.2.0 来啦！！！"
authorlink: "https://github.com/sofastack"
description: "生产环境可用的 Seata-go 1.2.0 来啦！！！"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2023-06-06T15:00:00+08:00
cover: "https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*wlc_SJYaYC4AAAAAAAAAAAAADrGAAQ/original"

---

![图片](https://img-blog.csdnimg.cn/img_convert/4fb4a738c67370e5ccf164bef59bd9b7.gif)  

文｜刘月财（GitHub ID：luky116)

360 服务端开发专家

Seata-go 项目负责人

本文 **2752** 字 阅读 **7** 分钟

**发布概览**

Seata-go 1.2.0 版本支持 XA 模式。XA 协议是由 X/Open 组织提出的分布式事务处理规范，其优点是对业务代码无侵入。当前 Seata-go 的 XA 模式支持 MySQL 数据库。至此，Seata-go 已经集齐 AT、TCC、Saga 和 XA 四种事务模式，完成了与 Seata Java 的功能对齐。

**XA 模式的主要功能:**

- 支持了 XA 数据源代理

- 支持了 XA 事务模式

XA 相关的 Samples 可以参考示例：

<https://github.com/seata/seata-go-samples/tree/main/xa>

在本版本中还修复了近期大量用户在使用过程中提交的 issue。  

**版本的主要更新如下**  

**Feature：**

[#467] 实现 XA 模式支持 MySQL

<https://github.com/seata/seata-go/pull/467>

[#534] 支持 Session 的负载均衡  

<https://github.com/seata/seata-go/pull/534>

**Bugfix：**

[#540] 修复初始化 XA 模式的 bug  

<https://github.com/seata/seata-go/pull/540>

[#545] 修复 XA 模式获取 db 版本号的 bug

<https://github.com/seata/seata-go/pull/545>

[#548] 修复启动 XA 时候会失败的 bug

<https://github.com/seata/seata-go/pull/548>

[#556] 修复 XA 数据源的 bug

<https://github.com/seata/seata-go/pull/556>

[#562] 修复提交 XA 全局事务的 bug

<https://github.com/seata/seata-go/pull/562>

[#564] 修复提交 XA 分支事务的 bug  

<https://github.com/seata/seata-go/pull/564>

[#566] 修复使用 XA 数据源执行本地事务的 bug

<https://github.com/seata/seata-go/pull/566>

**Optimize：**

[#523] 优化 CI 流程

<https://github.com/seata/seata-go/pull/523>

[#525] 将 Jackson 序列化重命名为 JSON

<https://github.com/seata/seata-go/pull/525>

[#532] 移除重复的代码

<https://github.com/seata/seata-go/pull/532>

[#536] 优化 go import 代码格式

<https://github.com/seata/seata-go/pull/536>

[#554] 优化 XA 模式的性能

<https://github.com/seata/seata-go/pull/554>

[#561] 优化 XA 模式的日志输出

<https://github.com/seata/seata-go/pull/561>

**Test:**

[#535] 添加集成测试  

<https://github.com/seata/seata-go/pull/535>

**Doc:**

[#550] 添加 1.2.0 版本的改动日志  

<https://github.com/seata/seata-go/pull/550>

英文版：<https://github.com/seata/seata-go/releases/tag/v1.2.0>

**致谢**

非常感谢以下 Contributors 的代码贡献。若有无意遗漏，请报告。

@georgehao

<https://github.com/georgehao>

@luky116

<https://github.com/luky116>

@jasondeng1997

<https://github.com/jasondeng1997>

@106umao

<https://github.com/106umao>

@wang1309

<https://github.com/wang1309>

@iSuperCoder

<https://github.com/iSuperCoder>

@Charlie17Li

<https://github.com/Charlie17Li>

@Code-Fight

<https://github.com/Code-Fight>

@Kirhaku

<https://github.com/Kirhaku>

@Vaderkai

<https://github.com/VaderKai>

同时，我们收到了社区反馈的很多有价值的 issue 和建议，非常感谢大家。

**社区讨论**

**加入钉钉群：**

Seata-go 社区群：**33069364**

Seata-go 开发群：**44816898**

**未来展望**

Seata 社区近期与不少国内 Go 语言微服务框架以及 ORM 框架背后的开发社区达成合作，比如 GORM 框架，已经集成到了 Sample 中，后续会将更多的 ORM 框架集成在 Seata-go-samples 项目中。

Seata-go-samples 集成到 Seata-go GitHub Actions 的集成测试环境，目前已经在进行中，用于测试每个 PR，保证系统的兼容性与稳定性。  
Seata-go 后续的 Saga 模式，计划采用 Temporal 框架来做服务编排，目前正在规划中，期待能给用户带来更实用便利的 Saga 使用体验。

欢迎对开源感兴趣的朋友加入 Seata 开源建设中来。  

**常用链接**

**Seata：**

<http://github.com/seata/seata>

<https://github.com/seata/seata-php>

<https://github.com/seata/seata-js>

<https://github.com/seata/seata-go>

**Samples：**

<https://github.com/seata/seata-samples>

<https://github.com/seata/seata-go-samples>

**官网：**

<https://seata.io/>

**投稿**

欢迎大家将 Seata/Seata-go/Seata-php/Seata-js 相关的实践文章投稿至：<https://www.yuque.com/fred-x/ngfgiz/le1h4u5kn0xyhhoh>

**Seata Star 一下✨：**  
**https://github.com/seata/seata-go**
