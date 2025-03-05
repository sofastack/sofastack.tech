# 开源之夏经验分享｜MOSN 社区韦鑫：做自己认为很酷的事

---
title: "开源之夏经验分享｜MOSN 社区韦鑫：做自己认为很酷的事"
authorlink: "https://github.com/sofastack"
description: "MoE*​（MOSN on Envoy）​*融合了 MOSN 和 Envoy 生态，打造高性能、高扩展性的数据平面，MOSN 技术团队已经把 MoE 技术贡献到 Envoy 上游，可直接使用 Envoy 最新版本来开发。"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2024-12-10T15:00:00+08:00
cover: "[https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*Rap6SJnP9f0AAAAAAAAAAAAAARQnAQ](https://img.alicdn.com/imgextra/i1/O1CN01lLtyJs1k5y0irosCL_!!6000000004633-0-tps-1218-516.jpg)"
---

**文|韦鑫** 
计算机科学与技术学院
HTNN 社区贡献者

就读于南京航空航天大学，是计算机科学与技术学院研三的同学，研究方向是分布式系统。

**本文 3756​ 字，预计阅读 7 分钟 ​** 
今天 SOFAStack 邀请到了开源之夏 2024 MOSN 社区的中选学生韦鑫同学！在本项目中，他负责将 Sentinel-golang 流量控制能力集成进 MoE *（MOSN on Envoy）* 态。希望他分享的这段经历，能让更多人了解到 MOSN 开源社区，感受开源的魅力～

​**项目链接**​：[https://github.com/mosn/htnn/tree/main/plugins/plugins/sentinel](*https://github.com/mosn/htnn/tree/main/plugins/plugins/sentinel*)

## 项目信息

​**项目名称**​：将 Sentinel-golang 流量控制能力集成进 MoE*​（MOSN on Envoy）​*生态

​**项目导师**​：付建豪

​**项目描述**​：MoE*​（MOSN on Envoy）​*融合了 MOSN 和 Envoy 生态，打造高性能、高扩展性的数据平面，MOSN 技术团队已经把 MoE 技术贡献到 Envoy 上游，可直接使用 Envoy 最新版本来开发。通过 MoE 技术可以使用全功能的 Golang 编程语言来编写 Envoy 插件，极大提高了业务插件的开发效率。

本次使用 MoE 技术把 Sentinel-golang 项目和 Envoy 相融合，把 Sentinel 生态引入到 MoE 生态中。

## 项目实现思路

### 概述

在完成该项目前，HTNN 社区已经提供了`limit_count_redis` ，`limit_req` ，`local_ratelimit` 等限流插件。通过引入 Sentinel-golang，我们可以为用户提供更多的限流选择、提升限流能力。

### 方案

当前在 Sentinel-golang 中，拥有以下流量治理能力：

* 流量控制​*（Flow）*​：通过配置具体规则，对请求流量进行限制；
* 热点参数流控​*（HotSpot）*​：统计某些热点数据中访问频次最高的 Top K 数据，并对其访问进行限制；
* 熔断降级​*（CircuitBreaker）*​：当系统异常情况发生时，可以自动熔断系统，保证系统的可用性；
* 并发隔离控制​*（Isolation）*​：控制对资源访问的最大并发数，避免因为资源的异常导致协程耗尽；
* 系统自适应保护​*（System）*​：在系统负载高峰期间，可以限制请求流量，避免系统资源耗尽。

然而经过理论分析与实践得出，以下流控治理能力在本项目插件中并不适用：

* Flow 中的基于内存使用水位的流控能力 *（Low/HighMemUsageThreshold、MemLow/HighWaterMarkBytes)* ，因为它获取到的水位是流控插件，也就是网关的内存信息，并不是后端服务的内存使用情况，因此不符合预期；
* Isolation，插件的 Filter 生命周期为一次请求-响应​ *（如 DecodeHeaders、Onlog 阶段均为单一协程）*，不需考虑多协程 *（goroutine）​*的情况，因此不符合预期；
* System，与 Flow 的内存水位一样，它获取到的系统负载信息是网关的，而不是后端服务的，因此也不符合预期。

因此最终项目实践裁切掉了一部分插件无需实现的 Sentinel-golang 的流控能力，分别实现了 Flow *（部分）*、HotSpot、CircuitBreaker 流控能力。

### 插件处理流程

#### 一次请求-响应流程

![图片](https://img.alicdn.com/imgextra/i4/O1CN01jGAXCH1hZKYZjoYIk_!!6000000004291-0-tps-1080-1478.jpg)

可分为以下 3 种规则分别描述该流程：

* **FLow 规则**
  DecodeHeaders：

1. 首先从请求头部、请求参数获取流控资源名称 res
2. 以 res 作为入参调用 Sentinel API Entry，得到 entry 和 blockError
3. 若 blockError 不为空则触发流控规则，根据用户配置的响应信息进行返回
4. 若 blockError 为空则请求放行，并将 entry 记录到 Filter 上下文中

Onlog：

5. 从 Filter 上下文中取出 entry
6. 调用 entry.Exit() 完成本次流控记录

* **HotSpot 规则**
  DecodeHeaders：

1. 首先从请求头部、请求参数获取流控资源名称 res
2. 以 res、用户配置的 params、attachments 作为入参调用 Sentinel API Entry，得到 entry 和 blockError
3. 若 blockError 不为空则触发流控规则，根据用户配置的响应信息进行返回
4. 若 blockError 为空则请求放行，并将 entry 记录到 Filter 上下文中

Onlog：

5. 从 Filter 上下文中取出 entry
6. 调用 entry.Exit() 完成本次流控记录

* **CircuitBreaker 规则**
  DecodeHeaders：

1. 首先从请求头部、请求参数获取流控资源名称 res
2. 以 res 作为入参调用 Sentinel API Entry，得到 entry 和 blockError
3. 若 blockError 不为空则触发流控规则，根据用户配置的响应信息进行返回
4. 若 blockError 为空则请求放行，并将 entry 记录到 Filter 上下文中

Onlog：

5. 从 Filter 上下文中取出 entry
6. 获取后端返回的响应状态码，并与用户配置的失败状态码列表进行匹配
7. 若匹配上，则以 entry 为入参调用 Sentinel API TraceError 统计错误*（当达到用户配置的错误数量时会在下一次调用 Sentinel API Entry 时触发流控，即熔断） ​*
8. 调用 entry.Exit() 完成本次流控记录

#### 插件开发过程

接下来阐述 Sentinel 插件的开发过程，同时可以给对 HTNN 插件感兴趣的同学提供开发参考路径。

需要添加/修改的文件及目录结构如下：

```bash
├── maintainer
  │   └── feature_maturity_level.yaml # 插件成熟等级
  ├── plugins
  │   ├── go.mod
  │   ├── go.sum
  │   ├── plugins.go # 引入插件
  │   ├── plugins
  │   │   └── sentinel # 插件主体
  │   │       ├── config.go
  │   │       ├── config_test.go
  │   │       ├── filter.go
  │   │       ├── filter_test.go
  │   │       └── ...
  │   └── tests
  │       └── integration # 集成测试
  │           ├── sentinel_route.yaml
  │           └── sentinel_test.go
  ├── site
  │   └── content # 中英文档
  │       ├── en
  │       │   └── docs
  │       │       └── reference
  │       │           └── plugins
  │       │               └── sentinel.md
  │       └── zh-hans
  │           └── docs
  │               └── reference
  │                   └── plugins
  │                       └── sentinel.md
  └── types
      └── plugins 
          ├── plugins.go # 引入插件
          └──  sentinel  # 插件配置结构
              ├── config.go
              ├── config.pb.go
              ├── config.pb.validate.go
              └── config.proto
```

**插件配置结构**：

1. 进入 `<span>types/plugins</span>` 目录，创建插件配置结构目录 `<span>sentinel</span>`
2. 在 `<span>sentinel/config.proto</span>` 中定义插件模型，即配置结构
3. 通过根目录的 `<span>Makefile</span>`，执行 `<span>make gen-proto</span>` 生成插件的 Go 配置结构
4. 在 `<span>sentinel/config.go</span>` 定义插件名称、类型、执行顺序等，并编写 Validate 作为配置校验逻辑
5. 在 `<span>plugins.go</span>` 中添加配置结构 package

**插件开发及单元测试：**

1. 进入 plugins/plugins 目录，创建插件目录 sentinel
2. 在 `<span>sentinel/config.go</span>` 中编写插件配置解析逻辑
3. 在 `<span>sentinel/filter.go</span>` 中编写插件核心工作逻辑
4. 在 `<span>sentinel/config_test.go</span>` 中编写配置解析的单元测试
5. 在 `<span>sentinel/filter_test.go</span>` 中编写插件工作所依赖方法的单元测试

**集成测试：**

1. 返回 `<span>plugins</span>` 目录
2. 在 `<span>plugins.go</span>` 中添加插件 package
3. 在 `<span>tests/integration/sentinel_test.go</span>` 中编写集成测试
4. 通过当前目录下的 `<span>Makefile</span>`，执行 `<span>make bulid_test_so</span>` 得到编译产物，接着进行集成测试，如GreenOpstest -v  ./tests/integration/sentinel\_test.go ./tests/integration/suite\_test.go

**插件文档：**

1. 进入 `<span>site</span>` 目录
2. 在如下位置编写中文文档

`<span>content/zh-hans/docs/reference/plugins/sentinel.md</span>` 中

3. 使用仓库提供的翻译工具得到 `<span>prompt：go run cmd/translator/main.go -f .content/zh-hans/docs/reference/plugins/sentinel.md --from zh-Hans | pbcopy</span>`
4. 将粘贴板内容提交到 LLM，如 ChatGPT 中得到英文文档，保存到

`<span>content/en/docs/reference/plugins/sentinel.md</span>` 中

其他：

1. 在 `maintainer/feature_maturity_level.yaml` 中添加插件的成熟级别*（feature maturity level）  ​*
2. 通过根目录的 `<span>Makefile</span>`， 执行 make lint，make fmt 等命令做代码提交前的检查

### 参考

* 如何二次开发 HTNN：[*https://github.com/mosn/htnn/blob/main/site/content/zh-hans/docs/developer-guide/get\_involved.md*](*https://github.com/mosn/htnn/blob/main/site/content/zh-hans/docs/developer-guide/get\_involved.md*)
* 插件开发：[*https://github.com/mosn/htnn/blob/main/site/content/zh-hans/docs/developer-guide/plugin\_development.md*](*https://github.com/mosn/htnn/blob/main/site/content/zh-hans/docs/developer-guide/plugin\_development.md*)
* 插件集成测试框架：[*https://github.com/mosn/htnn/blob/main/site/content/zh-hans/docs/developer-guide/plugin\_integration\_test\_framework.md*](*https://github.com/mosn/htnn/blob/main/site/content/zh-hans/docs/developer-guide/plugin\_integration\_test\_framework.md*)

## 开源之夏个人随访

### 自我介绍

大家好，我是​**韦鑫**​，目前就读于南京航空航天大学，是计算机科学与技术学院研三的学生，研究方向是分布式系统。

### 参与该项目的原因​

在本科期间，我就想要尝试参与开源活动。我认为这是一件很酷、很有趣的事情，但总会认为自己知识储备不足选择望而却步。然而，想到学生时代仍有不过这短短几年，**​与其自我矛盾、踌躇不前，不如先行动起来再说。​**因此在 2023 年，我根据自己的研究方向，第一次参与开源之夏的项目。事实证明，**技术不足并不是妨碍参与开源活动的关键，缺乏热情才是。**在那里，我认识了非常有趣的社区同学，了解了相关行业现状，并在实践中学习，在学习中实践，这种相互交流讨论、学以致用的过程让我很有成就感。

在科研工作中，我了解并学习了需要使用到的 Kubernetes、Istio，进而了解到了 Envoy 及 MOSN。因此在本次开源之夏中，我选择了与自身匹配度较高的、隶属于 MOSN 社区下的 HTNN 子项目。HTNN 社区虽然正处于前期快速迭代阶段，但是综合社区文档代码等方面来看，对我而言仍然是一个非常难得的学习机会。

### 如何克服项目过程中的困难与挑战

在代码开发过程中碰到问题和挑战是再寻常不过的事情，​**战胜困难的最好方法就是直面困难**​。通常我会先尽自己所能去寻找问题的答案，尽管这样会花费大量的时间，但也会在这个过程中能够收获许多。面临实在无法解决或拿捏不准的问题时，我会将自己的探索过程及想法同步到社区，与社区同学和导师讨论交流、集思广益。

在进行此次项目的过程中，我与社区同学及导师讨论了许多问题。令我印象最深的一个问题是 Sentinel Entry 的 Exit 时机问题。Sentinle Entry 的 Exit 时机不当可能会导致资源泄露、指标统计不准确等问题。最初我选择在 EncodeHeaders 阶段进行 Exit 操作，考量是 CircuitBreaker 熔断策略需要在响应阶段根据响应状态码统计指标。但在与社区同学讨论后得出结论是：客户端可能会在 EncodeHeaders 阶段之前中断请求，此时无法执行其中的 Exit，从而出现上述问题。因此最终决定在客户端中断请求也会被触发的 OnLog 阶段进行 Exit 操作，保证上述边界情况出现时依然能正常释放资源、统计指标。

将代码逻辑从 EncodeHeaders 迁移至 OnLog 衍生出了无法获取到响应头部的问题。这是因为在 Envoy 1.31 中还不支持在 OnLog 中获取头部信息，需要额外执行头部获取操作来缓存该项信息，我也因此提交另外一个 PR。

### 你对 HTNN 的印象

MOSN 社区的 HTNN 是个非常有趣的项目，是一款基于云原生技术的 L3 & L4 & L7 Cross-Layer 网络全局解决方案产品。我曾有幸参与过 Envoy WASM 的插件开发、维护工作，但受限于 WASM 的成熟度，Golang 生成 WASM 会存在诸多的限制，因此仅仅是能够使用全功能的 Golang 进行插件开发这一点就足以让我眼前一亮，相信这一能力在今后也能够吸引到更多 Gopher，另外 HTNN 还有其他更多宝藏等着我们去发掘。

**​麻雀虽小，五脏俱全。​**作为早期快速迭代的开源项目，HTNN 有着相当完备的说明文档、国际化、单元测试、集成测试框架和 CI/CD，同时代码也十分工整优雅。当有问题发 Issue 时，能够很快的得到社区同学的响应和帮助；对于 PR，相关同学也会非常认真负责地进行 Code Review，并给出相当有见解的修改建议。因此我认为这对想要入门学习云原生、服务网格、网关等相关技术的同学而言是一个非常棒且值得考虑的社区。

**总而言之，HTNN 是一个开放、热情、有活力且极具有强技术力的开源社区。**

### 有哪些收获

在此次项目中，我学会了如何开发 HTNN 插件。它基于 MoE 能力，即 Envoy Golang 扩展机制，使我在服务网格、云原生网关方面的拼图更加完整，这对我今后的开源活动、工作提供了十分宝贵的实践经验。

同时，社区完备的自动化能力让我深刻地意识到​**严格的单元测试、集成测试、CI/CD 对于整个项目的重要性**​。它能够很好地规范代码、减少不必要的错误、提升代码质量、减轻 Reviewer 的心智负担，这也是我今后需要重点关注和学习的方向。

### 寄语

或许我们曾长久仰望，那些看似遥不可及的璀璨星辰；却未曾察觉，在默默耕耘的岁月里，自己正悄然蜕变成那颗最耀眼的星。**相信自己，勇敢地去做自己认为很酷的事！**
