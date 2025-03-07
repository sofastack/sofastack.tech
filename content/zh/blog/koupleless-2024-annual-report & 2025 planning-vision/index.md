---
title: "Koupleless 2024 年度报告 & 2025 规划展望"
authorlink: "https://github.com/sofastack"
description: "Koupleless 是一个基于模块化技术的企业级解决方案，涉及的组件和功能较多，包括研发框架、运维调度、研发工具、生态治理工具链等。从 2023 年经过半年的建设到 24 年初基本框架成型发布 1.0.0 版本"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2025-02-18T15:00:00+08:00
cover: "https://img.alicdn.com/imgextra/i1/O1CN01tgLCeN1Hv9PsqFE6B_!!6000000000819-0-tps-1217-516.jpg"
---

# Koupleless 2024 年度报告 & 2025 规划展望

> **赵真灵** *（花名：有济）*
> 
> Koupleless 负责人
> 蚂蚁集团技术专家
> 
> Koupleless 社区的开发和维护者，曾负责基于 K8s 的应用研发运维平台、Node/Pod 多级弹性伸缩与产品建设，当前主要负责蚂蚁及开源社区模块化应用架构演进和 Serverless 相关工作。
> 
> 本文 **4389** 字，预计阅读**​ 8** 分钟

时光匆匆又是一年。2024 落幕之际，我们对过去这一年做了回顾与总结，不仅是对一年以来每一位在 Koupleless 社区一起努力的同学们的答复和感谢，也是趁此机会对 25 年做个规划和展望。

Koupleless 是一个基于模块化技术的企业级解决方案，涉及的组件和功能较多，包括研发框架、运维调度、研发工具、生态治理工具链等。从 2023 年经过半年的建设到 24 年初基本框架成型发布 1.0.0 版本[^1]，我们仍然面对一些难题：

1、​**研发阶段的成本仍然较高**​，尤其是新模块创建、模块瘦身等成本；

2、​**广泛的生态组件不支持模块化**​，体现在多个 Spring Boot 安装在一个 JVM 里、动态卸载等，需要解决其中的兼容性适配问题；

3、​**Koupleless 的发布运维平台建设成本很高**​，且不同企业的基础设施不同，很难为不同企业提供不同的集成方案。如何让更多企业能低成本集成 Koupleless 模块化发布运维能力，是 Koupleless 项目能否顺利推广的关键。

24 年除了继续在每个组件每个环节上持续迭代和演进**快、省、灵活部署、平滑演进**四大特性，我们还重点针对上述难题进行了攻坚。这一年，Koupleless  各个项目*​（包括 SOFAArk、Runtime、Adapter、Plugin、Virtual-Kubelet、Module-Controller、ArkCtl、Scanner、Koupleless-idea 等组件）​*共合并了 **608** 个 PR，完成 **10** 次主版本发布 ​（*包含 79 个子项目版本*），发布 **228** 个功能项，后面会再介绍下其中重要的进展，详细可以查看 github release 列表​[^2]​。

在开发者生态上，新增 **20** 位 Contributor，其中 1 位优秀 Contributor，1 位晋升为 Committer。发布 **13** 篇原理介绍文章、**4** 篇企业案例，进行 **6** 次大会分享，社区群人员数量达到**700+**​。

**主项目：Koupleless**

![图片](https://img.alicdn.com/imgextra/i2/O1CN01fs5H841iYhd5h5kRx_!!6000000004425-0-tps-668-734.jpg)

![图片](https://img.alicdn.com/imgextra/i4/O1CN01qDdjHt1QkSiM2N1hE_!!6000000002014-0-tps-1080-831.jpg)

**子项目：SOFAArk**

![图片](https://img.alicdn.com/imgextra/i2/O1CN01DM5aoN1q94OAHt9u5_!!6000000005452-0-tps-696-770.jpg)

![图片](https://img.alicdn.com/imgextra/i2/O1CN014RZpUI1ckiJzlO75E_!!6000000003639-0-tps-1080-697.jpg)

> 以下是 Koupleless 社区 24 年参与贡献的同学：
> @ToviHe,@compasty,@g-stream,@lbj1104026847,@linwaiwai,@liu-657667,@qq290584697,@yuhaiqun19892019,@suntaiming,@pmupkin,@2041951416,@loong-coder,@hadoop835,@xymak,@jyyfei,@laglangyue,@yuandongjian,@98DE9E1F,@leewaiho,@KennanYang,@Jackisome,@liufeng-xiwo,@Simon-Dongnan,@oxsean,@langke93,@XiWangWy,@Juzi-jiang,@ligure,@chenjian6824

## 项目功能演进

### 研发框架

首先在模块的研发上，为了降低模块的创建和接入成本，Koupleless 提供了：

1、基于研发工具 arkctl[^3]​的普通应用一键转换成模块；

2、开放了模块拆分插件 Koupleless-idea​[^4]​，目前已有 122 次下载，帮助用户以可视化的方式将存量大应用拆分出多个小模块；

3、提供模块脚手架，快速创建出新模块。

![图片](https://img.alicdn.com/imgextra/i2/O1CN01bKlQwJ1zgLi13wUdh_!!6000000006743-0-tps-1080-320.jpg)

在模块研发上线整体流程上，从上图可以看到模块创建的三种方式都已经提供有工具来降低成本。不过当前对改造成基座并没有提供工具，考虑到这部分主要工作是引入 Koupleless sdk 的 starter，参考官网实现即可✅。

模块接入和研发过程中，还有个关键且必需的步骤“模块瘦身”​[^5]​，这一过程需要同步分析基座和模块的代码。由于这两部分信息比较分散，所以常常出现该瘦身的没有瘦身、不该瘦身的瘦身结果导致模块启动失败等问题。今年我们对模块瘦身做了三大重大升级：

1、提升基座与模块信息的感知度；

2、低成本的模块瘦身；

3、确保瘦身的正确性。

将模块瘦身的操作从原来的黑盒状态转变成白盒状态，可以大幅降低这部分的改造和研发成本。另外在模块打包构建上提供了 gradle 版本的打包插件​[^6]​，可以让 gradle 工程也能使用 Koupleless 的所有能力。模块隔离上也新增了环境变量隔离能力。

### 模块化兼容性治理

Koupleless 模块化是在单个 JVM 内同时运行多个 Spring Boot，并提供动态热更新的能力，势必存在一些生态组件不完全适配问题。主要体现在三个方面：

1、共享变量的互相覆盖；

2、多 ClassLoader 切换导致的不一致；

3、部分资源未清理干净。

我们发布了系列文章来详细阐述上述问题，欢迎查阅：

进阶系列一：Koupleless 模块化的优势与挑战，我们是如何应对挑战的[^7]
进阶系列二：Koupleless 内核系列 | 单进程多应用如何解决兼容问题[^8]
进阶系列三：Koupleless 内核系列 | 一台机器内 Koupleless 模块数量的极限在哪里？[^9]
进阶系列四：Koupleless 可演进架构的设计与实践｜当我们谈降本时，我们谈些什么[^10]
进阶系列五：Koupleless 内科系列 ｜怎么在一个基座上安装更多的 Koupleless 模块？[^11]

同时我们也在社区将完整的生态治理工具链开放出来，包括事前的代码扫描 → 事中的低成本治理 adapter + plugin → 事后的防御集成测试框架 multiAppTest，每个组件的使用都可以查阅官网文档。

![图片](https://img.alicdn.com/imgextra/i1/O1CN01gtUikL1EQ3gHeNahd_!!6000000000345-0-tps-1080-267.jpg)

当前已完成所发现的 50 多个常用组件的兼容性治理或已提供最佳实践。

### 运维调度

在发布与运维调度上，Koupleless 是在原有的基座进程里动态安装卸载多个模块。由于这套模式与企业的现有基础设施有较大不同，需要在原来的基础设施上新建一层模块化的控制面，有较高的建设成本和与周边设施打通的成本，如下图：

![图片](https://img.alicdn.com/imgextra/i3/O1CN01EjePlT1PqaOWSCSt0_!!6000000001892-2-tps-1080-802.png)

需要建设设配的周边平台不限于：

1、应用元数据管理平台：新增模块应用元数据；
2、研发与迭代管理平台：增加模块创建、模块迭代、模块构建、发起模块发布；
3、联调平台：增加模块与基座、模块与普通应用联调；
4、可观测平台：监控与告警、trace 追踪、日志采集与查询；
5、灰度平台；
6、模块流量。

今年我们根据内部实战经验，考虑生态适配的成本问题，将模块安装调度到基座上的行为抽象等同为 Pod 安装调度到 Node 上的行为，巧妙利用 Virtual-Kubelet 将模块实例映射为 vPod，将基座 Pod 映射为 vNode。

![图片](https://img.alicdn.com/imgextra/i1/O1CN01vo1YQH29Dd1xFkVfr_!!6000000008034-0-tps-1080-579.jpg)

基于 Virtual-Kubelet 的 ModuleController 方案，将原来的三层架构打平到与传统一致的两层架构，可以大量复用为普通应用建设的基础设施能力，包括直接使用基座 PaaS 平台来发布模块，达到可低成本扩展出模块化发布、运维、调度能力的目的，这套方案也在内部实际业务落地过程得到了验证。

![图片](https://img.alicdn.com/imgextra/i3/O1CN01hCI4dF1yVz8AVQAPY_!!6000000006585-2-tps-1080-398.png)

更多能力不再一一罗列，详细可查看 github release 列表​[^12]​。

## 企业接入与案例

当前已累计有 **45** 家企业（不完全统计）已经完成接入上线，其中于 24 年新增 26 家企业，包括快手、涂鸦、民生银行等，沉淀 4 个案例：

高效降本｜深度案例解读 Koupleless 在南京爱福路的落地实践[^13]

Koupleless 助力蚂蚁搜推平台 Serverless 化演进[^14]

涂鸦智能落地 Koupleless 合并部署，实现云服务降本增效[^15]

Koupleless 助力「人力家」实现分布式研发集中式部署，又快又省！[^16]

这些企业在多个业务场景里落地了 Koupleless，包括“中台代码片段研发提效”、“企业内合并部署省资源”、“私有云、边缘云交付”、“长尾应用治理”等，同时也完成了一些新业务的探索落地。

### 新业务场景探索落地

#### 实时计算

在蚂蚁内部的 Flink 计算引擎，原来采用业内常用的启动进程的方式编译用户提交上来的作业代码，每次占用资源且耗时较高。使用 Koupleless 中提供的动态模块与动态 plugin 能力，将每一次编译请求从进程模型调整线程模型，每一次请求实际变成安装一次模块，然后触发线程内的编译，编译完成后立即卸载模块。将编译速度提升 **5** 倍以上，解决了原来的三大痛点：资源消耗大、相应速度慢、处理请求有限，当前一篇专利正在申请中。

![图片](https://img.alicdn.com/imgextra/i1/O1CN01hvSdsc1zO1ropuowa_!!6000000006703-2-tps-1080-437.png)

#### 进程调度

该业务场景需要在一个 Pod 内动态开启或关闭多个子进程，并同步状态到控制平台。这个过程相当于在一个 Pod 的基座进程里安装了多个进程模块，与 Koupleless 模块化实际上非常类似，区别只是进程内模块化还是进程间模块化的区别，在运维调度上本质是相通的，需要考虑的问题如下：

1、资源的分配与调度；

2、玩法进程的启动；

3、玩法进程关闭；

4、玩法进程的状态查询与同步等。

![图片](https://img.alicdn.com/imgextra/i4/O1CN01PQiXoT1jcCGYYOBiZ_!!6000000004568-2-tps-1080-174.png)

我们基于 Virtual-Kubelet 的 ModuleController 方法，同样把基座进程映射成 vNode，把动态启停的子进程映射成 vPod，然后由 K8s 控制组件完成实例管理、调度、运维等，通过实现类似 Kubelet 的 agent 管道实现子进程的启动和关闭，最终帮助业务快速完成了运维和调度等三层能力的建设。

除了这些已有的和 24 年新增的业务场景，相信还有更多的业务场景可以使用 Koupleless，欢迎一起在社区里碰撞出更多可能，帮助更多企业实现降本增效和绿色计算！

## 25 年规划

24 年已经过去，不管是风和雨还是喜和乐，它都是一段不可缺少的经历。在社区的陪伴下，今年的 Koupleless 极大地成长了！

Koupleless 感谢每一位一起共建的 Contributor，你们的每一个 issue、每一次 comment、每一条 PR、每一个回复都已经成为 Koupleless 不可或缺的一部分。

也感谢每一个愿意试用的企业和开发者，你们已经踏出了关键的第一步“动手试用”，愿意去尝试和发现 Koupleless 的价值；过程可能遭遇挫折，但最终都完成了评估验证。不管是否实际落地业务，你们都为 Koupleless 的发展提供了业务基础。

更感谢最终成功落地业务的企业和开发者们，你们不光解决了 Koupleless 框架的适配问题，还克服了企业落地的困难​（*有不少企业因为非技术的原因停在了这一步*）​，用你们对 Koupleless 的耐心和信心，持续努力最终顺利在企业内部落地，在这个过程中持续陪伴和滋养了 Koupleless 的成长。

因为有你们的陪伴，Koupleless 在这一年里成长了：除了进一步打磨底盘完善体验外，对于年初的三大难题也探索出了方向，实现了完整的架构和工具链或组件。不过，这些难题还待继续磨砺💪，25 年有更多的共同目标，主要集中在以下几个方面。

### 进一步完善模块化兼容性治理工具链

1、Adapter 虽然可以通过类覆盖的方式完成组件的治理，但因为要拷贝原来完整的类过来，可能覆盖掉某些版本的实现。需要调整为 ​**patch 的方式完成覆盖**​，详见 GitHub issue#183​[^17]​。

2、Plugin 当前可以帮助基座自动匹配到对应的 adapter 并引入，但是当前的匹配方式是基于 Koupleless-adapter-config里的映射关系表实现的，如果企业内部自定义的 adapter 是不在这个映射表里的，需要​**支持企业内部的关系表映射**​。

3、**多应用集成测试框架**还需重新设计方案，以便可以利用已有的测试的用例快速建设多应用的集成测试用例。

4、另外，当前这些工具是手动模式，无法支持更广泛的组件的扫描与治理，需要考虑**自动化**的能力去做好生态更广泛的治理工作。

### 提升 ModuleController 性能与体验

当前 ModuleController 已经提供 http 和 mqtt 两种类型的运维管道能力，但目前实现功能还需要在更复杂的运维环境里测试验证。未来：

1、ModuleController 提供​**更完整的运维能力和集成测试验证能力**​；

2、验证并提高基座与模块的​**同时并行运维的能力**​；

3、ModuleController  **自身成功率达到 99%**。

### DevOps 平台

当前 ModuleController 只是提供了模块化发布、运维与调度能力，不具备 DevOps 的平台能力，也无法提供基座和模块的管理能力。因此需要：

1、发布 ​**0.5 版本 DevOps 平台**​，提供基础的基座与模块管理能力、模块迭代与流水线能力等；

2、提供​**快速试用 PlayGroud**​。

### 打造 Serverless 能力

1、建设​**弹性能力与调度**​，如模块 HPA；

2、提供​**通用基座示例**​，打造 Serverless 体系。

这些能力的建设还需要更多社区同学一起努力，欢迎更多有志之士一起加入 Koupleless 社区，一起打造模块化研发体系，帮助更多企业实现降本增效和绿色计算！

## 参考链接

[^1]: *https://github.com/koupleless/koupleless/releases/tag/v1.0.0*

[^2]: *https://github.com/koupleless/koupleless/releases*

[^3]: *https://github.com/koupleless/arkctl/releases*

[^4]: *https://plugins.jetbrains.com/plugin/24389-kouplelesside*

[^5]: *https://koupleless.io/docs/tutorials/module-development/module-slimming*

[^6]: *https://github.com/sofastack/sofa-ark/tree/master/sofa-ark-parent/support/ark-gradle-plugin*

[^7]: *https://koupleless.io/blog/2024/01/25/koupleless-内核系列模块化隔离与共享带来的收益与挑战/*

[^8]: *https://koupleless.io/blog/2024/01/25/koupleless-内核系列-单进程多应用如何解决兼容问题*

[^9]: *https://koupleless.io/blog/2024/01/25/koupleless-内核系列-一台机器内-koupleless-模块数量的极限在哪里*

[^10]: *https://koupleless.io/blog/2024/01/25/koupleless-可演进架构的设计与实践当我们谈降本时我们谈些什么*

[^11]: *https://koupleless.io/blog/2024/12/05/怎么在一个基座上安装更多的-koupleless-模块*

[^12]: *https://github.com/koupleless/koupleless/releases*

[^13]: *https://koupleless.io/user-cases/aifulu-car/*

[^14]: *https://koupleless.io/user-cases/ant-arec/*

[^15]: *https://koupleless.io/user-cases/tuya/*

[^16]: *https://koupleless.io/user-cases/renlijia/*

[^17]: *https://github.com/koupleless/koupleless/issues/183*
