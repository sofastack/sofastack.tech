---
title: "VLDB2023｜方略：一个交互式的规则研发系统"
authorlink: "https://github.com/sofastack"
description: "VLDB2023｜方略：一个交互式的规则研发系统"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2023-10-03T15:00:00+08:00
cover: "https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*byB8Q68O4HoAAAAAAAAAAAAADrGAAQ/original"
---

文｜**梁仕威（花名：栖川）**

蚂蚁集团算法专家

*方略平台技术负责人，专注于分布式计算领域，主要负责蚂蚁基础算法的分布式设计与开发。*

**本文 3419 字，阅读 9 分钟**

在类似安全风控这种对抗性的场景中，由于欺诈者作案手法的频繁变化，使得训练数据并不总会包含足够的信息给算法自动挖掘出优质的拦截规则，这种场景下高质量拦截规则的挖掘需要结合专家领域知识。如何将算法和专家领域知识相结合成为了业界一个值得探索的课题。蚂蚁集团 AI Infra 团队针对上述问题，构建了一个交互式的规则研发系统——**方略**，提供了一种在规则研发过程中高效融入专家领域知识的解决方案。  

描述该系统的 Demonstration Paper **《Fanglue: An Interactive System for Decision Rule Crafting》** 近期已经被数据库领域的重要会议 International Conference on Very Large Data Bases *（VLDB2023）* 所接收。VLDB 是中国计算机学会 *（CCF）* 推荐的 A 类会议，每年都会吸引国内外各大高校和科技公司的投稿。

## 1｜背景

决策规则由于其直观可解释的 If-Then 结构，被广泛应用于欺诈预防等金融科技领域至关重要的任务中。**标准的决策规则由两部分构成：一系列条件和预测值。** 条件是由**特征、操作符、值**构成的三元组结构，例如 age<50。当规则中的所有条件都被满足时，规则会输出预测值。

目前大多数现有的规则挖掘系统都是以端到端形式运行的，即给定训练集后，专家设定规则挖掘算法的优化指标和超参数，然后等待算法运行结束就可以获得一组规则。在这种方式下，设置超参数和优化指标是融入专家领域知识的唯一途径，一旦规则挖掘过程开始，专家就没有其他方法能够干预规则的生成。但是在如风控这种对抗性的场景中，由于作案手法的频繁变化，训练数据里并不总会包含足够的信息给算法自动挖掘出优质的规则。在这种情况下，专家必须将领域知识更深入地融合到规则生成过程中才能获得有意义的结果。

举个例子，假设支付宝的一位风控专家，想要编辑规则来拦截一种新型欺诈行为。由于该欺诈行为是最近才出现的，他准备的数据集中只有少数关于这种欺诈行为的黑样本。假设这种欺诈行为的一个关键步骤是要求受害者向欺诈者发送多个付款码，因此短时间内付款码刷新的次数是识别这种欺诈活动的重要特征。然而风控专家发现挖掘算法返回的规则中没有使用该特征，大多数规则都使用了交易金额来区分欺诈行为和正常行为，因为数据集中的交易金额巧合地将这两种行为区分开了。但是随着新型欺诈行为的普及，交易金额就不能继续作为识别这种欺诈行为的有力依据了。这种现象在反欺诈场景中并不罕见，当黑样本太少时，无关的特征也能够区分出输入数据中的黑白样本。虽然付款码刷新频次确实是规则挖掘过程中一个非常有竞争力的特征 *（例如评估指标排名靠前）* ，但由于数据中噪声的影响，使得其不能排到最前面，从而不能被算法挖掘出来。这种情况下，将专家领域知识融入进来，让付款码刷新频次这个特征应用到拦截规则中，对阻止新型欺诈行为扩散尤为重要。

为了能在规则研发过程中高效融入专家领域知识，蚂蚁集团 AI Infra 团队构建了一个交互式的规则研发系统——**方略**。方略为用户提供了一个 Web 界面来可视化地制定决策规则。用户将数据上传到方略后就可以开始规则研发流程，方略会实时地推荐出规则的候选条件与对应评估指标，并生成数据分析结果，为用户提供有用的定量分析信息。同时方略使用 Ray 作为计算引擎并将数据分布式存储在内存中，以满足在交互式处理大规模数据时的实时响应需求。

## 2｜系统架构

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/f6ecd687628048c78ce9e308147308c4~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1080&h=626&s=252749&e=png&b=f2f2f2)

（图 1）

图 1 展示了方略的系统架构。用户通过 Web 界面与方略进行交互。方略的界面上有三个核心模块：**条件推荐模块**、**条件编辑模块**和**规则评估模块**。服务端的 Task Manager 负责接收来自三个核心模块的请求①，并且会启动相应的 Ray 作业②。  

用于计算的数据水平切分后预先加载进 Ray 的一组 Actor 内存里。对于一个特定的计算任务，每个 Actor 都会基于分配到的数据计算出局部统计信息，这些局部统计信息会汇集到 Driver 里进一步处理得到全局统计信息③。然后全局统计信息返回给 Task Manager④，并被传递给 Data Processor。Data Processor 在全局统计信息的基础上进一步处理，例如计算出各个候选条件的评估指标，得到的处理结果会在 Web 界面上展示给用户⑤。然后整个系统会等待用户的下一步操作。

一旦用户作出某些操作 *（例如从候选条件中选择一个加入到当前规则中）* 触发相应的核心模块，系统就会重复上述过程。用户编辑好的规则会保存到数据库里⑥。

## 3｜技术细节

不同于标准规则，方略采用合取范式 *（Conjunctive Normal Form）* 的规则表示形式，即同时支持“AND”和“OR”条件。合取范式规则是由一个或多个子句和一个预测值组成的合取式 *（AND 连接）* ，其中子句是条件的析取式 *（OR 连接）* ，条件的形式为特征、运算符、值。方略专注于二分类问题，使用训练集和验证集上的精确度、召回率、F1 得分或黑样本覆盖率等指标来评估决策规则。

方略提供三种实时的条件推荐帮助用户构建规则： **“AND”条件推荐**、 **“OR”条件推荐**、**近似条件推荐**。

假设我们已经有了一些子句构成的决策规则，需要往这个规则中增加一个“AND”或者“OR”条件，方略会搜索所有可能的三元组 *（特征、运算符、值）* ，并通过将这些候选条件附加到当前规则里计算评估指标。标准的规则学习算法会选择具有最佳指标的候选条件，而方略会在 Web 界面上展示在验证集上取得 top 评估指标的候选条件列表供用户选择。

为了快速计算所有候选条件的评估指标，方略使用 Ray 作为计算引擎，每个 Actor 计算出局部统计信息，然后聚合到 Driver 里得到全局统计信息。为了验证系统的效率，我们在一个包含 140 万个样本和 50 个特征的数据集上进行了实验。图 2 对比了在生成“AND”候选条件下，方略的实现与基于 Mars on Ray *（基于 DataFrame 运算）* 实现的耗时。可以看到方略的实现非常高效，使用 16 个 Actor 就可以在 1 秒内返回结果，满足交互式环境下高响应的需要。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/479e2fd870ff4df6b0b700a05a8bd9bc~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1080&h=581&s=126498&e=png&b=ffffff)

（图 2） 

在安全风控场景下，当规则中存在一些容易被攻击的条件时 *（例如拦截规则里有条件：转账金额>=500，欺诈方只需要使得转账金额小于 500 就可以绕过拦截规则）* ，风控专家会希望通过寻找“语义上相似”的条件来增加另一层保护。为了加强规则的鲁棒性，方略提出并引入了近似条件。假设当前的规则是 C1 and C2 and C3，覆盖的样本集为 A，我们希望在 C2 上增加近似条件，那么方略会在 C1 and C3 的基础上遍历所有的候选条件 *（特征、运算符、值）* ，每个候选条件都会覆盖数据的一个子集，记为 B。一个理想的近似条件应该在 A 和 B 之间具有高重叠度，同时又不引入太多额外的白样本。方略基于图 3 所示的公式衡量条件的相似度，其中![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7e0c058a4f9f4bd39670b72362ac1d54~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=88&h=58&s=8354&e=png&b=fffefe)表示![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/00d8740e858f410dbc3570d2ba9f3c7f~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=48&h=52&s=7224&e=png&b=fffefe)中带有正标签的子集，![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0907429ba6ac4e5c9c3701d4f2151232~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=96&h=54&s=8551&e=png&b=fffefe)表示![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8116369e66c64e0788bdb9f5cd776007~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=48&h=52&s=7224&e=png&b=fffefe)中带有负标签的子集。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/60d169f81eff4b699a312cd4ac22f7a4~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=864&h=166&s=47952&e=png&b=fffefe)![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bb8f61a5e1db4e7b91432e0cce6efae4~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=794&h=158&s=43669&e=png&b=fffefe)![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1e2643c615f34daca6f987a25bcb1bd0~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1080&h=113&s=89209&e=png&b=fefcfc)

（图 3）

方略支持在一个数据集上依次编辑多条规则。当完成一条规则，用户可以选择将这条规则覆盖的数据删除，以便在编辑下一条规则的时候能专注于没有被覆盖的数据，这种形式叫做**序贯覆盖模式**，如图 4 所示。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/aaf581383fb5465aa1aa87fd8e3ee264~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1080&h=850&s=239819&e=png&b=fefefe)

（图 4）

## 4｜场景演示

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/666dae7449874c338bb29fe2c7ef3ef1~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1080&h=333&s=103468&e=png&b=fcfcfc)

（图 5）

图 5 左图在面板的右侧展示了方略推荐出来的“AND”条件，其中有多个特征的候选条件具有相同的 Recall，用户将会根据领域知识来选择其中一个条件加入到画面中间的规则里。右边的图为用户在方略上手动编辑“AND”条件的弹窗。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1eb74e61d88a45bca650bf63455d2bd6~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1080&h=623&s=337533&e=png&b=fefefe)

（图 6）

图 6 左图展示了一个选定的条件在增加近似条件 *（浅绿色）* 之前和之后的截图，可以看到在当前规则上增加了近似条件后对规则的指标不会造成太大的变化。右图为方略推荐出来的近似条件及其 Overall SIM 和 POS Jaccard 指标。

## 5｜总结&未来计划  

当前方略已经应用到蚂蚁集团内部的安全风控场景中，也输出给了外部的金融机构。这种算法与专家领域知识相结合的交互式规则研发方式，不仅提高了规则的研发效率，降低了研发成本，也通过探索更广的规则空间提高了规则的准确度。
 
下一步我们会针对推荐算法和评估指标做优化与扩展，以满足更多复杂多变场景的需求。

欢迎大家多关注蚂蚁集团 AI Infra 团队后续的工作。

## 了解更多

**DLRover Star 一下✨：**  
[https://github.com/intelligent-machine-learning/dlrover](https://github.com/intelligent-machine-learning/dlrover)

## 本周推荐阅读

[DLRover 在 K8s 上千卡级大模型训练稳定性保障的技术实践](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247542032&idx=1&sn=ae2a0c66f480fa2e8f98ce3d4a9d8890&chksm=faa3cacacdd443dc0712e1b9204cbd3d98ab2b20889646bd5c21407dc21582af390088ae38a7&scene=21)

[DLRover：蚂蚁开源大规模智能分布式训练系统](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247526048&idx=1&sn=3b15877be6c51d7faf0cb0def8dd8f2c&chksm=faa3897acdd4006c3d4e9984ff8d2c48198aca74115e03ac0becddbbe649a2494ba66f81e26f&scene=21)

[Hybrid Embedding：蚂蚁集团万亿参数稀疏 CTR 模型解决方案](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247538202&idx=1&sn=3821df8df57526b223e2fb0a12c3674e&chksm=faa3b9c0cdd430d674d5449404c5a7349b89a9e6e334a6e206f23ed30d62023639d7540dcf25&scene=21)
 
[降本增效: 蚂蚁在 Sidecarless 的探索和实践](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247517989&idx=1&sn=1b49b68c9281d0c2514fa4caa38284fb&chksm=faa368ffcdd4e1e9fa5361d6ea376bbc426272c7a32250cc67ae27dcd84a6113b4a016a1518d&scene=21)

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6430b24ce7a44459abb84aaf2e991383~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1080&h=792&s=66602&e=jpg&b=fefefe)
