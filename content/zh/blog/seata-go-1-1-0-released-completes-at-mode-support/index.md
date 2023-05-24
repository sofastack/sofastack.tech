---
title: "Seata-go 1.1.0 发布，补齐 AT 模式支持"
authorlink: "https://github.com/sofastack"
description: "Seata-go 1.1.0 发布，补齐 AT 模式支持"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2023-03-14T15:00:00+08:00
cover: "https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*IK-BTa1-DLkAAAAAAAAAAAAADrGAAQ/original"
---

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bacfe54225f44945942e25aea5710af4~tplv-k3u1fbpfcp-zoom-1.image)

## 发布概览

Seata-go 1.1.0 版本补齐了 AT 模式下对 Multi Delete、Multi Update、Insert on Update 和 Select for Update 的支持。至此 Seata-go 的 AT 模式与 Seata  AT 模式全面对齐。

此版本给出了在 Dubbo-go/Gin/gRPC 中使用 Seata-go TCC/AT 两种模式的示例。

示例链接：[https://github.com/seata/seata-go-samples/tree/main/at](https://github.com/seata/seata-go-samples/tree/main/at)

### AT 模式:

- AT 模式支持并集成了 Multi Delete SQL 语法
- AT 模式支持并集成了 Multi Update SQL 语法
- AT 模式支持并集成了 Insert on Update SQL 语法
- AT 模式支持并集成了 Select for Update SQL 语法

### 配置文件：

完善了更多地方读取配置文件功能

## 版本的主要更新如下

### Feature：

[#491] 支持查询全局事务锁
[https://github.com/seata/seata-go/pull/491](https://github.com/seata/seata-go/pull/491)

[#482] 支持 AT 模式 Multi Delete SQL 执行器
[https://github.com/seata/seata-go/pull/482](https://github.com/seata/seata-go/pull/482)

[#481] 支持 AT 模式 Multi Update SQL 执行器
[https://github.com/seata/seata-go/pull/481](https://github.com/seata/seata-go/pull/481)

[#478] 支持 AT 模式 Select for Update SQL 执行器
[https://github.com/seata/seata-go/pull/478](https://github.com/seata/seata-go/pull/478)

[#477] 支持 Undo Log 的 Json 序列化方式
[https://github.com/seata/seata-go/pull/477](https://github.com/seata/seata-go/pull/477)

[#456] 支持 AT 模式 Insert on Update SQL 执行器
[https://github.com/seata/seata-go/pull/456](https://github.com/seata/seata-go/pull/456)

[#444] 支持 BZip 压缩算法
[https://github.com/seata/seata-go/pull/444](https://github.com/seata/seata-go/pull/444)

[#436] 支持读取 RM 相关的配置文件
[https://github.com/seata/seata-go/pull/436](https://github.com/seata/seata-go/pull/436)

[#433] 支持 XA 连接管理器
[https://github.com/seata/seata-go/pull/433](https://github.com/seata/seata-go/pull/433)

[#430] 支持读取 Getty 相关的配置文件
[https://github.com/seata/seata-go/pull/430](https://github.com/seata/seata-go/pull/430)

**Bugfix：**

[#509] 修复 AT 模式下执行 Insert on Update 时 Undo Log 的 SQLType 字段的问题
[https://github.com/seata/seata-go/pull/509](https://github.com/seata/seata-go/pull/509)

[#495] 修复 Undo Log 的 SQLType 字段的问题
[https://github.com/seata/seata-go/pull/495](https://github.com/seata/seata-go/pull/495)

[#487] 修复 AT 执行时出现的问题
[https://github.com/seata/seata-go/pull/487](https://github.com/seata/seata-go/pull/487)

[#472] 修复全局事务中上下文丢失值问题
[https://github.com/seata/seata-go/pull/472](https://github.com/seata/seata-go/pull/472)

[#461] 修复 Error_Code_test 中变量未定义导致的 CI 失败问题
[https://github.com/seata/seata-go/pull/461](https://github.com/seata/seata-go/pull/461)

[#459] 修复 Error 日志重复打印问题
[https://github.com/seata/seata-go/pull/459](https://github.com/seata/seata-go/pull/459)

[#452] 修复 AT 模式执行 Insert SQL 时 ID 增的报错问题
[https://github.com/seata/seata-go/pull/452](https://github.com/seata/seata-go/pull/452)

**Optimize：**

Seata-go 的示例项目已经全部迁移到新的仓库：[https://github.com/seata/seata-go-samples](https://github.com/seata/seata-go-samples)

[#507] 优化 AT 模式 Multiple Update SQL 执行器
[https://github.com/seata/seata-go/pull/507](https://github.com/seata/seata-go/pull/507)

[#505] 优化 AT 模式 Multi SQL 执行器
[https://github.com/seata/seata-go/pull/505](https://github.com/seata/seata-go/pull/505)

[#453] 优化 Message Type 和 Transaction error Code 枚举值
[https://github.com/seata/seata-go/pull/453](https://github.com/seata/seata-go/pull/453)

[#447] 优化数据源初始化流程
[https://github.com/seata/seata-go/pull/447](https://github.com/seata/seata-go/pull/447)

[#466] 优化变量的命名
[https://github.com/seata/seata-go/pull/466](https://github.com/seata/seata-go/pull/466)

**Test:**

[#445] 添加 Transaction error Code 的单元测试
[https://github.com/seata/seata-go/pull/445](https://github.com/seata/seata-go/pull/445)

**Doc:**

[#492] 更新 Readme 文件的已完成功能列表
[https://github.com/seata/seata-go/pull/492](https://github.com/seata/seata-go/pull/492)

[#489] 添加 1.1.0 版本的 Change Log
[https://github.com/seata/seata-go/pull/489](https://github.com/seata/seata-go/pull/489)

英文版：[https://github.com/seata/seata-go/releases/tag/v1.1.0](https://github.com/seata/seata-go/releases/tag/v1.1.0)

**致谢**

非常感谢以下 Contributors 的代码贡献。若有无意遗漏，请报告。

@luky116
[https://github.com/luky116](https://github.com/luky116)

@georgehao
[https://github.com/georgehao](https://github.com/georgehao)

@lxfeng1997
[https://github.com/lxfeng1997](https://github.com/lxfeng1997)
@106umao
[https://github.com/106umao](https://github.com/106umao)
@wang1309
[https://github.com/wang1309](https://github.com/wang1309)
@iSuperCoder
[https://github.com/iSuperCoder](https://github.com/iSuperCoder)
@Charlie17Li
[https://github.com/Charlie17Li](https://github.com/Charlie17Li)
@Code-Fight
[https://github.com/Code-Fight](https://github.com/Code-Fight)
@Kirhaku
[https://github.com/Kirhaku](https://github.com/Kirhaku)
@Vaderkai
[https://github.com/VaderKai](https://github.com/VaderKai)
@springrain
[https://github.com/springrain](https://github.com/springrain)
@Shaozhou Hu
[https://github.com/raspberry-hu](https://github.com/raspberry-hu)
@finkyky
[https://github.com/Finkyky](https://github.com/Finkyky)

同时，我们收到了社区反馈的很多有价值的 issue 和建议，非常感谢大家。

### 未来展望

Seata 社区近期与不少国内 go 语言微服务框架以及 ORM 框架背后的开发社区达成合作，比如 GORM 框架，已经集成到了 Sample 中，后续会将更多的 ORM 框架集成在 Seata-go-Samples 项目中。与 MOSN 社区的合作也在推进中，可实现真正的基于 Seata 的 Transaction Mesh。

Seata-go-samples 集成到 Seata-go GitHub Actions 的集成测试环境，目前已经在进行中，用于测试每个 PR，保证系统的兼容性与稳定性。

预计在 4 月中旬发布的 Seata-go v1.2.0，将实现 XA 分布式事务模式。Seata-go 正在开发中的 Saga 模式，将在现有的 Seata Saga 模式之上实现一定的突破：实现基于工作流的微服务编排能力。

当前的 Saga 模式仅实现了服务编排的正向推进与反向 Rollback 能力，更进一步的服务编排则可以实现 DAG、定时任务、任务批量调度，覆盖工作流的所有流程，提升用户在 Seata 这个平台上的使用体验。目前 Seata-go 依赖于 Seata Java 的 TC，按照这个工作计划，可能需要在未来的 Seata-go 版本中实现一个功能更强大的 TC 调度。

Seata 多语言版本，目前发展最快的就是 Seata-go，其次成熟度较高的是 Seata-php，目前发展比较快的还有 Seata-js，欢迎对开源感兴趣的朋友加入 Seata 开源建设中来。

**常用链接**

**Seata：**
[http://github.com/seata/seata](http://github.com/seata/seata)
[https://github.com/seata/seata-php](https://github.com/seata/seata-php)
[https://github.com/seata/seata-js](https://github.com/seata/seata-js)
[https://github.com/seata/seata-go](https://github.com/seata/seata-go)

**Samples：**
[https://github.com/seata/seata-samples](https://github.com/seata/seata-samples)
[https://github.com/seata/seata-go-samples](https://github.com/seata/seata-go-samples)

**官网：**
[https://seata.io/](https://seata.io/)

**投稿**

欢迎大家将 Seata/Seata-go/Seata-php/Seata-js 相关的实践文章投稿至：[https://www.yuque.com/fred-x/ngfgiz/le1h4u5kn0xyhhoh](https://www.yuque.com/fred-x/ngfgiz/le1h4u5kn0xyhhoh)

**Seata Star 一下**
[https://github.com/seata/seata-go](https://github.com/seata/seata-go)
