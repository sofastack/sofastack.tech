---
title: "【开源之夏 2023】欢迎报名 Dragonfly、Kata Containers、Nydus 社区项目！"
authorlink: "https://github.com/sofastack"
description: "【开源之夏 2023】欢迎报名 Dragonfly、Kata Containers、Nydus 社区项目！"
categories: "开源之夏"
tags: ["开源之夏"]
date: 2023-05-11T15:00:00+08:00
cover: "https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*Ad7UQZuRFaEAAAAAAAAAAAAADrGAAQ/original"

---

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e13c4d4d121041b2b6df149d6de82b05~tplv-k3u1fbpfcp-zoom-1.image)

开源之夏是由“开源软件供应链点亮计划”发起并长期支持的一项暑期开源活动，旨在鼓励在校学生积极参与开源软件的开发维护，促进优秀开源软件社区的蓬勃发展，培养和发掘更多优秀的开发者。

活动联合国内外各大开源社区，针对重要开源软件的开发与维护提供项目任务，并面向全球高校学生开放报名。

**Dragonfly 项目介绍**

Dragonfly 是一个基于 P2P 技术的文件分发和镜像加速系统，并且是云原生架构中镜像加速领域的标准解决方案以及最佳实践。自 2017 年开源以来，Dragonfly 被许多大规模互联网公司选用并投入生产使用，并在 2018 年 10 月正式进入 CNCF，成为中国第三个进入 CNCF 沙箱项目 *（Sandbox）* 。2020 年 4 月，CNCF 技术监督委员会 *（TOC）* 投票决定接受 Dragonfly 作为孵化项目 *（Incubating）* 。经过多年生产实践经验打磨的下一代产品，汲取了 Dragonfly 1.x 的优点并针对已知问题做了大量的优化，在解决大规模文件分发场景下有着无可比拟的优势。基于 P2P 技术的优势，在 AI Inference 分发模型场景可以解决大文件分发过程中的性能瓶颈。并且可以通过集成 Dragonfly P2P 技术减少源站压力，提高模型分发效率。在未来，Dragonfly 会结合 AI 领域生态进行拓展，服务 AI 领域并且成为其重要基础设施。

**Kata Containers** **项目介绍**

自 2013 年 Docker 问世以来，容器技术立刻让全球的开发者为之着迷，并逐渐成为现代应用程序、构建、发布和运维的主流方式。容器以标准格式对应用程序进行封装，应用程序可从一个计算环境快速、安全地切换到另一个计算环境，这对于想要快速构建、测试和部署软件的开发者而言至关重要。然而传统的以 runC 为代表的容器方案基于共享内核技术，通过 Linux 提供的 Cgroups 和 Namespace 等方案进行隔离和控制，如果某一容器中的恶意程序利用了系统缺陷从容器中逃逸，则会对宿主机系统构成严重威胁。尤其是在公有云环境，这一潜在威胁成为了容器技术普及和落地的一大障碍。如果将不同容器再嵌套放入到不同的虚拟机，通过增加一层相对安全、成熟的隔离技术，就能大大提高系统的安全性，减少系统被攻破的可能。基于这种思想的开源技术也随之出现，代表性的两个项目为 Intel 开源技术中心的 Clear Containers 和 Hyper.sh 的 runV。2017 年，这两个开源项目合并，共同创建了开源项目 Kata Containers，其目标是将虚拟机的安全优势与容器的高速及可管理性相结合，为用户提供标准化、安全、高性能的容器解决方案。Kata Containers 创建的不同 Pod *（容器）* 运行在不同的虚拟机 *（Kernel）* 之中，比传统容器提供了更好的隔离性和安全性，同时继承了容器快速启动和标准化等优点。

**Nydus** **项目介绍**

镜像是容器基础设施中的一个重要部分，目前 OCI 标准镜像的缺陷之一是容器需要等待整个镜像数据下载完成后才能启动，这导致了容器启动时消耗了过多的端到端时间。在大规模集群场景下，这对网络与存储负载的影响尤为明显。Nydus 镜像加速框架提供了容器镜像按需加载的能力，它在生产环境里支撑了每日百万级别的加速镜像容器创建，将容器端到端冷启动时间从分钟级降低到了秒级。Nydus 目前由蚂蚁集团，阿里云，字节跳动联合研发，与内核态 EROFS 做了深度集成，也是 Kata Containers 与 Linux 内核态原生支持的镜像加速方案。目前 Nydus 已经被容器生态主流项目支持，例如 Containerd，Docker，Podman，BuildKit, Nerdctl，Kata Containers。

**活动规则**

开源之夏官网：

[https://summer-ospp.ac.cn/](https://summer-ospp.ac.cn/)

各位同学可以自由选择项目，与社区导师沟通实现方案并撰写项目计划书。被选中的学生将在社区导师指导下，按计划完成开发工作，并将成果贡献给社区。社区评估学生的完成度，主办方根据评估结果发放资助金额给学生。

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e9ca14be14f64bf8bd392d768685be9b~tplv-k3u1fbpfcp-zoom-1.image)

**Dragonfly 社区项目**

**项目链接：** [https://summer-ospp.ac.cn/org/orgdetail/72e6f975-d2b8-4fa3-a377-441c1038db10?lang=zh](https://summer-ospp.ac.cn/org/orgdetail/72e6f975-d2b8-4fa3-a377-441c1038db10?lang=zh)

**PyTorch Serve 基于 Dragonfly P2P 技术分发模型**

**导师：** yxxhero

**邮箱：** <aiopsclub@163.com>

**项目难度：** 进阶/Advanced

**项目链接：** [https://summer-ospp.ac.cn/org/prodetail/2372e0132?list=org&navpage=org](https://summer-ospp.ac.cn/org/prodetail/2372e0132?list=org&navpage=org)

**TensorFlow Serving 基于 Dragonfly P2P 技术分发模型**

**导师：** 崔大钧

**邮箱：** <bigerous@qq.com>

**项目难度：** 进阶/Advanced

**项目链接：** [https://summer-ospp.ac.cn/org/prodetail/2372e0022?list=org&navpage=org](https://summer-ospp.ac.cn/org/prodetail/2372e0022?list=org&navpage=org)

**Triton Inference Server 基于 Dragonfly P2P 技术分发模型**

**导师：** 戚文博

**邮箱：** <gaius.qi@gmail.com>

**项目难度：** 进阶/Advanced

**项目链接：** [https://summer-ospp.ac.cn/org/prodetail/2372e0001?list=org&navpage=org](https://summer-ospp.ac.cn/org/prodetail/2372e0001?list=org&navpage=org)

**Kata Containers 社区项目**

**项目链接：** [https://summer-ospp.ac.cn/org/orgdetail/301597a0-ca46-418a-89d1-13ea3c050ee9?lang=zh](https://summer-ospp.ac.cn/org/orgdetail/301597a0-ca46-418a-89d1-13ea3c050ee9?lang=zh)

**基于 VSOCK FD Passthrough 对 Container IO Stream 进行重构**

**导师：** 李福攀

**邮箱：** <fupan.lfp@antgroup.com>

**项目难度：** 进阶/Advanced

**项目链接：** [https://summer-ospp.ac.cn/org/prodetail/233010451?list=org&navpage=org](https://summer-ospp.ac.cn/org/prodetail/233010451?list=org&navpage=org)

**Nydus RAFS v6 guest 内核支持优化**

**导师：** 李亚南

**邮箱：** <alex.lyn@antgroup.com>

**项目难度：** 进阶/Advanced

**项目链接：** [https://summer-ospp.ac.cn/org/prodetail/233010419?list=org&navpage=org](https://summer-ospp.ac.cn/org/prodetail/233010419?list=org&navpage=org)

**跨容器 shared-mount 支持**

**导师：** 彭涛

**邮箱：** bergwolf@hyper.sh

**项目难度：** 进阶/Advanced

**项目链接：** [https://summer-ospp.ac.cn/org/prodetail/233010417?list=org&navpage=org](https://summer-ospp.ac.cn/org/prodetail/233010417?list=org&navpage=org)

**Nydus 社区项目**

**项目链接：** [https://summer-ospp.ac.cn/org/orgdetail/1919a78b-344c-46d6-9276-b47d3a0a4a42?lang=zh](https://summer-ospp.ac.cn/org/orgdetail/1919a78b-344c-46d6-9276-b47d3a0a4a42?lang=zh)

**Nydus 容器社区开源生态集成**

**导师：** 井守

**邮箱：** <yansong.ys@antgroup.com>

**项目难度：** 进阶/Advanced

**项目链接：** [https://summer-ospp.ac.cn/org/prodetail/231910250?list=org&navpage=org](https://summer-ospp.ac.cn/org/prodetail/231910250?list=org&navpage=org)

**Nydus 开源存储构建与分发支持**

**导师：** 泰友

**邮箱：** <cuichengxu.ccx@antgroup.com>

**项目难度：** 进阶/Advanced

**项目链接：** [https://summer-ospp.ac.cn/org/prodetail/231910252?list=org&navpage=org](https://summer-ospp.ac.cn/org/prodetail/231910252?list=org&navpage=org)

**申请资格**

-   本活动面向年满 18 周岁在校学生。
-   暑期即将毕业的学生，只要在申请时学生证处在有效期内，就可以提交申请。
-   中国籍学生参与活动需提供身份证、学生证、教育部学籍在线验证报告（学信网）或在读证明。
-   外籍学生参与活动需提供护照，同时提供录取通知书、学生卡、在读证明等文件用于证明学生身份。

**活动流程**

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/90e335b5588d4a9f9f9193a7beb4ebab~tplv-k3u1fbpfcp-zoom-1.image)

欢迎扫描下方二维码加入钉钉群交流，或搜索群号：31047501 入群，期待各大高校学生报名参加。
