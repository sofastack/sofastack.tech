---
title: "给研发工程师的代码质量利器 | SOFAChannel#5 直播整理"
author: "青勤"
authorlink: "https://github.com/elseifer"
description: "本文根据 SOFAChannel#5 直播分享整理，主题：给研发工程师的代码质量利器 —— 自动化测试框架 SOFAActs。"
categories: "SOFAActs"
tags: ["SOFAActs","SOFAChannel"]
date: 2019-04-24T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1563455530059-b90e96a5-b1e8-4d0c-b2fe-2f7fba9bd6cf.jpeg"
---

> <SOFA:Channel/>，有趣实用的分布式架构频道。
> 本文根据 SOFAChannel#5 直播分享整理，主题：给研发工程师的代码质量利器 —— 自动化测试框架 SOFAActs。
> 回顾视频以及 PPT 查看地址见文末。
> 欢迎加入直播互动钉钉群：23195297，不错过每场直播。

![SOFAChannel#5](https://cdn.nlark.com/yuque/0/2019/png/226702/1558322592318-ca61f84d-9ca9-49ae-9193-dc18bc3402c5.png)

大家晚上好，我是蚂蚁金服自动化测试框架 SOFAActs 开源核心成员青勤，目前从事测试技术相关的研发工作，今晚将由我来给大家分享交流自动化测试框架 SOFAActs 的基本原理和使用，今天的内容主要分为以下四个章节：

- 项目介绍
- SOFAActs 接入
- 功能介绍与使用
- 升阶功能使用

欢迎大家 Star 我，SOFAActs：[https://github.com/sofastack/sofa-acts](https://github.com/sofastack/sofa-acts)

## 1 项目介绍

在分享使用操作前，我将引导大家来熟悉下 SOFAActs 的项目背景、基本原理等。

对于研发质量保障而言，金融系统和金融业务的多样性、复杂性同样也会在测试场景、测试验证和测试流程的复杂程度上得到充分体现。

譬如，对于包含出参、RPC 调用、DB 变更和异常等多个测试验证点的用例而言，在研发和测试人员维护和验证用例场景的过程中，时常发生业务结果校验遗漏，对我们及早发现和纠错问题造成干扰，进而无法严格保障产品质量。这些问题对研发质量保障提出了很高的挑战，相应的自动化、精细化的白盒测试工具需求日益增长，这其中就包括 SOFAActs。

为了解决上述痛点、满足精细化测试需要，在多年测试实践积累与沉淀下，我们研发了基于模型驱动的 SOFAActs 测试框架，它可以灵活、可扩展的提供一站式用例管理，标准化测试执行和精细化校验。目前 SOFAActs 测试框架逐渐成熟并在蚂蚁金服内部得到广泛应用。

### 1.1 项目架构

介绍完背景，我们来看下 SOFAActs 的大体框架，SOFAActs 底层封装并集成适配 SOFABoot 等运行环境。

![SOFAActs 框架](https://cdn.nlark.com/yuque/0/2019/png/226702/1558411556485-9158ded4-a7bc-46b7-98cb-85eedcb3dc6d.png)

在重要的引擎层，SOFAActs 封装了工具类和数据模型，并将测试模式的过程进行了标准化，提供通用测试能力和扩展点。对于有自动化测试经验的同学来讲，测试模式其实并不复杂，这其中有很多工作是可以抽象和固定的，SOFAActs 将这部分内容内聚到引擎层，封装成标准测试流程等，尤其是模型驱动和精细化校验等，从而释放精力，将更多关注点聚焦在待测目标上。

引擎层之上，是 SOFAActs 提供的可视化用例管理功能，可以一站式的维护测试脚本、测试数据和数据模型，借助可视化编辑器可成倍提高用例管理等等操作效率，整体而言 SOFAActs 围绕模型驱动引擎和可视化编辑器，将测试代码的编写工作量极尽降低，目标聚焦在测试对象上。

这里我们示例看下，SOFAActs 对测试代码和效率的优化。这里以 Credit 接口为例，业务处理开始之前会检查传参，构造上下文、随后发起业务处理，涉及对三张表的读取或变更，并在数据库事物结束之后，返回业务处理结果。

<video id="Credit 接口的完整测试用例" controls="" preload="none" alt="title"> <source id="mp41" src="https://gw.alipayobjects.com/mdn/rms_95b965/afts/file/A*40JMT4iGEokAAAAAAAAAAABkARQnAQ" type="video/mp4"> </video>
针对这一业务逻辑，这里我们构造一个 Credit 接口的完整测试用例，在代码驱动测试时，它需要一下 9 个步骤，手动准备依赖数据、构造请求参数、执行业务逻辑、校验业务结果以及数据清理等等，人工介入成本居高，尤其当存在多个用例时，测试代码可复用性低，测试效率是难以得到有效提升。而与之对比，在模型驱动测试下，Credit 接口的 SOFAActs 测试脚本会对固有的测试模式进行封装，用例复杂度得到极大精简，众多用例数据可以得到高效的可视化管理。

### 1.2 执行原理

在开始使用 SOFAActs 之前，我们来了解一下有关 SOFAActs 执行引擎的运作原理。SOFAActs 框架也提供了非常多的扩展点，如果需要个性化的定义，可以对每一个环节进行扩展。

上文中已提到过 SOFAActs 执行引擎是对测试模式过程的封装，Setup 方法是引擎入口，用于加载初始化 SOFAActs 运行时的必需资源，如获取数据源。

以下是主体测试过程：clear、prepare、execute、check 这 4 个方法依次负责环境清理、依赖准备、执行、结果校验等。这些内容是代码驱动测试时需要手写的测试代码和内容，每个测试脚本的完成意味着上面的过程会被我们重复一遍，于是 SOFAActs 将这部分内容进行了封装，实现了最通用基础的功能。

![SOFAActs 执行原理](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1558322592266-970c70c8-1ee2-4576-aa91-bba8717142d0.jpeg)

右侧，我们对高频数据如方法入参、出参、异常和依赖DB数据进行了抽象，给出 SOFAActs 的模型，这是代码驱动转向模型驱动、精细化校验的基础。左侧的数据总线会贯穿每个用例的执行生命周期，即贯穿中间的主体测试过程，如果大家对框架封装的基础功能有自定义需要，可以通过数据总线对 SOFAActs 的对象、方法进行获取、重写，以便更灵活的控制框架行为。当然 SOFAActs 对这些内容作了较好的封装，覆盖了大部分的测试需求，无需大家过度关注。

以上就是 SOFAActs 的执行原理，接下来我会给大家详细介绍 SOFAActs 的接入和使用。

## 2 SOFAActs 接入

SOFAActs 分为两部分，其一是可视化编辑器，在 [SOFAStack 官网上 [1](https://www.sofastack.tech/sofa-acts/docs/GettingStarted) 我们可以获取该编辑器的安装包，并通过 IDEA 的插件管理进行安装。其二是 SOFAActs 的基础 jar，它提供了 SOFAActs 用例运行的环境支持，在 test 模块 pom 中添加下列依赖即可，有关 test 模块或者多模块详细内容大家可以参考 [SOFAActs 的快速开始文档 [1](https://www.sofastack.tech/sofa-acts/docs/GettingStarted) 。

## 3 功能介绍和使用

下面，我们进入 SOFAActs 的功能介绍和使用章节，这部分我将分为三小节展开：一站式构建、SOFAActs 核心的模型驱动以及 SOFAActs 提供的精准校验。

### 3.1 一站式构建

一站式构建中，SOFAActs 通过可视化编辑器为我们提供了便捷操作，以帮助一键配置初始化、构建测试脚本与模型，可视化管理用例数据等等。借助可视化编辑器，在整个过程中我们可以替换大部分手工编写代码的工作，进行一站式操作。

![一站式构建](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1558322592268-28ec9a5e-fd93-4666-ab76-43a66a4e09c6.jpeg)

**一键初始化**

这里我们示例看下，如何操作一键初始化以及一键初始化做哪些内容。首先一键初始化框架只需要 3 个鼠标点击步骤。在 Package 视图下选中测试模块并右键选择 SOFAActs 功能，一键初始化，输入该应用的应用名称和工程编码格式。在一键初始化完成后，SOFAActs 将会在 test 模块写入 SOFAActs 配置文件，DB 连接配置文件，测试套件配置文件以及创建模型存储目录等。

<video id="如何操作一键初始化" controls="" preload="none" alt="title"> <source id="mp42" src="https://gw.alipayobjects.com/mdn/rms_95b965/afts/file/A*p7OuQ4M6qsEAAAAAAAAAAABkARQnAQ" type="video/mp4"> </video>
acts-config 配置文件是 SOFAActs 的核心配置，提供了测试环境切换、数据库连接切换、冒烟测试以及预跑反填等配置，来开关 SOFAActs 的相关功能；model 目录用于存放对象模型、数据模型，以便对模型进行统一管理；DB 配置文件指明了数据库连接信息，用于生成数据模型时自动填充表结构和模版数据。

**一键生成测试脚本**

在完成配置初始化操作后，我们可以开始第一个用例的编写，SOFAActs 提供了一键测试脚本生成功能。以待测的 getMessage 接口为例，在其方法定义上右键选择 SOFAActs 功能，生成测试用例，在弹出框中检查用例信息，修正无误后点击确定可以生成该接口的测试脚本。校正依赖的启动类并运行 SOFAActs 测试脚本，可以看到能够正常启动 SOFABoot，SOFAActs 会拉起 SOFABoot 以尽量模拟业务代码运行时的容器环境，因此如果存在 SOFABoot 上下文加载失败，需要排查应用配置。

**一键生成数据模型**

通常在我们创建 SOFAActs 测试脚本时方法入参和出参的对象模型会一并生成好，因此这里着重介绍下如何一键生成数据模型。事先，我们在 acts-config 配置文件中，指明 DB 环境如 dev 并配置 dev 环境下 DB 连接信息。就绪后，我们打开测试脚本，在被 @test 注解的方法上右键选择 SOFAActs 功能，生成 DB 表结构模型，在弹出视图中选择需要的 DB 表，当有多个表时，可以一并添加至右侧，点击 OK 以生成 DB 模型，之后可在 model／dbModel 目录查看生成的数据模型。

稍后模型驱动内容中，我将给大家详细介绍 SOFAActs 中模型的概念和使用。

**可视化用例管理**

在 SOFAActs 编辑器中，我们能够可视化地修改入参、DB 和结果数据等。在用例级别，编辑器提供了用例复制功能，对于设计等价用例而言，通常正常测试用例之间，异常测试用例之间的差异可能只在于某一关键字段的取值，而大部分数据是相同的，这时用例数据复用十分必要。SOFAActs 提供了用例复制等管理功能，可用于快速发起用例构建。

### 3.2 模型驱动

下面我们介绍模型驱动，在代码驱动测试时，方法入参、出参和 DB等测试数据是通过代码组织的，随着业务复杂度提升，尤其在金融级业务场景中，类和表动辄十几个属性或者字段，属性嵌套也时常可见，代码驱动测试难移应对：测试脚本可复用性低、测试数据管理困难等问题。于是，SOFAActs 将方法入参、出参、异常和 DB 等数据抽象为模型，用以结构化地记录数据类型、取值和校验规则，可以快速发起用例数据构建。

![模型驱动](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1558322592271-7be9f6ca-1fb0-4e48-bc47-3a3e1ec30b06.jpeg)

SOFAActs 中的模型主要分为：数据模型和对象模型。

对象模型：主要用于构造方法入参、期望结果和期望异常。期望结果和期望异常是指在符合测试预期下被测方法的返回结果或者异常抛出。

数据模型：对于一个有 DB 依赖的业务场景的测试验证，需要生成相关 DB 表的数据模型，用于快速构建 DB 准备数据和期望数据。DB 准备数据是业务执行期间依赖的前置 DB 数据，例如在验证转账场景时参与双方的账户余额等，DB 期望数据是指在符合测试预期下，被测方法对 DB 的变更。

经过模型化，一个复杂对象或数据可以被快速模版化地创建、拷贝和校验，达到测试数据与测试代码解耦合的效果，另一方面，配套使用 SOFAActs 编辑器，实现测试数据一站式管理，来提高用例编写效率和降低维护成本。

下面我详细介绍下数据模型和对象模型的结构和使用。

#### 3.2.1 数据模型

通常 SOFAActs 只需要填充 DB 准备数据，而 DB 期望数据可以利用预跑反填功能进行自动采集。

为了更好地理解数据模型， 在model／dbModel 下的 csv 文件中，我们可以看到某一张表的全部字段、取值以及校验规则。数据模型聚合了表的结构、数据和校验规则，结合可视化编辑器可快速创建、复制 DB 数据，一次编辑多次使用。这里我们来看下示例，在编辑器如何使用数据模型。

<video id="如何使用数据模型" controls="" preload="none" alt="title"> <source id="mp43" src="https://gw.alipayobjects.com/mdn/rms_95b965/afts/file/A*oQuwRYktDckAAAAAAAAAAABkARQnAQ" type="video/mp4"> </video>
#### 3.2.2 对象模型

对象模型，它是方法入参、出参等对象在 SOFAActs 中的映射，可以在 model／objModel 目录下查看生成的对象模型。对象模型的结构和数据模型相似，是属性、取值、校验规则的聚合，与数据模型不同的是，对象模型可能存在多层嵌套，因为类的某一属性可以是 map、集合、类等引用类型。

在 SOFAActs 编辑器中可以为一个新的用例添加入参数据，如果入参是简单类型，如 int、String 等可以选择简单类型填充，这里示例下复杂类型，即业务对象的模型使用，在左侧的列表中选择目标对象，添加至右侧，如果有多个入参可以一并添加到右侧后，再点击确定，即可以在入参设置中看到入参数据并可进行编辑。对于有多个入参的方法，入参设置中从上之下的顺序和方法声明入参顺序是需要一致的。

<video id="一键脚本生成" controls="" preload="none" alt="title"> <source id="mp44" src="https://gw.alipayobjects.com/mdn/rms_95b965/afts/file/A*CsRxTpwXIv0AAAAAAAAAAABkARQnAQ" type="video/mp4"> </video>
### 3.3 精细化校验

下面我们介绍精细化校验，在一开始时，我们提及到复杂业务场景下极易出现校验遗漏，形成校验假绿。为此，SOFAActs 内置了精细化校验，从校验规则和行为还原两点，来保证复杂场景的校验覆盖。

![精细化校验](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1558322592283-33a1c432-4e02-4c42-ab51-76958ee85948.jpeg)

如右图，SOFAActs 将重复性 assert 代码抽象归纳为校验规则，与测试数据一同作为数据模型的一部分，可以细化校验每个字段。目前acts支持的校验标签如下，其中常用有 Y、N、C 标签，Y 表示了校验时必须一致的对象或属性、N 表示校验时不关心的属性或记录值、C 标签标示 DB 数据校验时的 DB 查询条件，即 where 条件，参考右图我们可以理解标签的使用。

为了真实还原业务行为以提高验证覆盖和用例数据的编写效率，SOFAActs 提供了行为还原，作为精细化校验的一部分，行为还原在 SOFAActs 中称为预跑反填功能，是指在方法入参、依赖的 DB 数据等用例正常执行的基本数据准备完成后，可先不必填写期望数据而直接运行测试脚本，框架可自动捕获运行时方法返回结果、所有 DB 表变更等数据，通过 SOFAActs 编辑器可填充用例的期望数据，小幅度修正和标记校验规则后即可完成全部校验点的参考数据的编写。

这里我给大家演示如何使用 SOFAActs 的预跑反填功能：

启用 SOFAActs 的预跑反填功能需要在 acts-config 中打开结果收集开关，然后执行用例，运行完毕唤起 SOFAActs 编辑器，点击左上角的预跑反填，选中需要的用例数据，点击确定就完成了相应用例的期望结果、期望 DB 数据的构造，但预跑反填功能本身并不保障校验数据的准确性，需要针对待测业务场景将数据修正。

## 4 进阶功能

下面，我们进入本次分享的最后一部分，SOFAActs 进阶功能的使用。这里为大家介绍使用频度最高的两个功能：自定义引擎流程和参数化。

稍做回忆，在一开始我们熟悉了 SOFAActs 的运行原理，提及到 SOFAActs 执行引擎是对测试模式过程的封装，同时为数据模型、数据总线提供了扩展点，这里我们举例使用、重写这些 API 。另一个高频功能是参数化，提供了运行动态替换 String 类型取值的功能，以满足部分随机动态的测试需要。

```java
@Override
public void check(ActsRuntimeContext actsRuntimeContext) {
  if (actsRuntimeContext.caseId.endsWith("001")) {
    if (((AccountTransResult) actsRuntimeContext.getResultObj()).isSuccess()) {
      actsRuntimeContext.paramMap.put("status", "0");
    } else {
      actsRuntimeContext.paramMap.put("status", "1");
    }
    actsRuntimeContext.refreshDataParam();
  }
  super.check(actsRuntimeContext);
}
```

我们以 check 流程为例，重写了 check 方法来满足动态校验，这里依据返回结果设置了自定义参数，放置到数据总线 Actsruntimecontext 中，我们将期望 DB 数据中的 mast 表的 status 字段设置为自定义参数，表示该字段的期望值应该和方法返回结果中的状态保持一致或者关联。然后运行用例来查看我们重写的校验是否达到了预期。

## 5 总结

SOFAActs 提供了很多扩展点可以让大家适配应用的测试需求，如果你需要一个更强大的 SOFAActs，可以动手重写这些 API 将基础功能进行延伸，当然更欢迎大家在 [Github](https://github.com/sofastack/sofa-acts) 中提 Issue、Commit 来一同完善 SOFAActs。

以上内容由 SOFAChannel#5 直播分享整理，如果大家有疑问可以在钉钉群（搜索群号即可加入：23195297）或者 [Github](https://github.com/sofastack/sofa-acts) 上与我们讨论交流，我们将进行解答。

SOFAActs：[https://github.com/sofastack/sofa-acts](https://github.com/sofastack/sofa-acts)

### 文章相关涉及链接

SOFAActs 下载地址以及快速开始文档：[https://www.sofastack.tech/sofa-acts/docs/GettingStarted](https://www.sofastack.tech/sofa-acts/docs/GettingStarted)

### 本期视频回顾以及 PPT 查看地址

[https://tech.antfin.com/activities/552](https://tech.antfin.com/activities/552)

### 往期直播精彩回顾

- 分布式事务 Seata TCC 模式深度解析 | SOFAChannel#4 直播整理：[https://tech.antfin.com/activities/462](https://tech.antfin.com/activities/462)
- SOFAChannel#3 SOFARPC 性能优化实践（下）：[https://tech.antfin.com/activities/245](https://tech.antfin.com/activities/245)
- SOFAChannel#2 SOFARPC 性能优化实践（上）：[https://tech.antfin.com/activities/244](https://tech.antfin.com/activities/244)
- SOFAChannel#1 从蚂蚁金服微服务实践谈起：[https://tech.antfin.com/activities/148](https://tech.antfin.com/activities/148)