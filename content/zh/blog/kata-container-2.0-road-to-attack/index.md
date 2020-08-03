---
title: "Kata Containers 2.0 的进击之路"
author: "李昊阳"
authorlink: "https://thenewstack.io/the-road-to-kata-containers-2-0/"
description: "Kata Containers 项目的奋进之路"
categories: "Kata Containers"
tags: ["Kata Containers"]
date: 2020-07-28T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2020/png/226702/1596422461653-dd61eb12-2ee8-4ad5-b868-bbdfa5253f2a.png"
---

Kata Containers 开源项目于2017年底正式启动，其目标是将虚拟机（VM）的安全优势与容器的高速及可管理性相结合，为用户带来出色的容器解决方案。该项目在过去两年取得了哪些进展？下一版本的路线图包含什么特性？首先让我们快速回顾一下 Kata Containers 项目的奋进之路… 

## 缘起：Kata Containers

2013 年，Docker 问世，容器成为热门新事物，全球的开发者为之着迷。也难怪，容器以标准格式封装，将运行于标准操作系统环境上的应用打包，使应用程序可从一个计算环境快速可靠的切换至另一个计算环境，这对于那些想要快速构建、测试和部署软件的开发者而言至关重要。容器具有轻量化、低开销的特性，几乎可以立即被调度和启动，可在任何环境中运行，为微服务提供便利，扩展资源等（以上仅列举了一些流行的优势）。 尽管有许多技术优势，但容器有一个缺点 - 容器与宿主机共享内核，这可能会引发严重的安全漏洞问题。理论上，如果您在单个主机上部署了多个容器，一旦其中某个容器被恶意代码利用，由于共享namespace，该主机上的其他所有容器也容易受到攻击，在这种情况下，可能会对云基础设施整体构成严重的安全威胁。如果您是云供应商，安全威胁可能会扩展到云端客户的数据和业务，这是绝对要避免的。

![image.png](https://cdn.nlark.com/yuque/0/2020/png/226702/1595836237811-17374ea6-c340-4ac8-be6a-0dc73bfb9799.png)

图1. 传统容器：主要通过共享内核的 Cgroup 和 Namespace 来达到容器隔离和资源限制的目的

因此，许多负责大规模容器运行的运维人员将容器“嵌套”在虚拟机中，从逻辑上将其与运行在同一主机上的其他进程隔离开，但在虚拟机中运行容器会丧失容器的速度和敏捷性优势。Intel 和 Hyper.sh（已加入蚂蚁集团）的开发人员意识到了这个问题，同时开始独立研发解决方案，两家公司都希望容器可以摆脱传统虚机的所有包袱，换言之，就是开发“面向云原生的虚拟化”技术：

- 来自 Intel 开源技术中心的工程师在 Intel Clear Containers 项目中运用 Intel Virtualization Technology（Intel VT）技术来强化性能和安全隔离；
- 与此同时，Hyper.sh 的工程师采用相似的策略启动了开源项目 runV，将容器放在一个安全“沙箱”中，通过支持多种 CPU 架构和管理程序，侧重于开发技术中立的解决方案；

2017年，两家公司将项目合并，互为补充，创建了开源项目 Kata Containers。Intel 和 Hyper.sh 联合开发者社区，希望在各方的共同努力下，兼顾性能和兼容性，在为终端用户提供出色应用体验的同时，加速开发新的功能特性以满足未来新兴用例的需求。Kata Containers 成为 OpenStack 基金会（OSF）除 OpenStack 之外的首个托管项目，该项目于2017年12月在北美 KubeCon 上正式公开亮相，社区座右铭是“快如容器，稳似虚机”。 其实质是，通过 Kata Containers 让每个容器/pod 采用其单独的内核，运行在一个轻量级的虚拟机中。由于每个容器/pod 现在都运行在专属虚拟机中，恶意代码无法再利用共享内核来访问邻近的容器，因此，容器即服务(CaaS)供应商能够更安全的提供在裸金属上运行容器的服务。由于容器之间的硬件隔离，Kata Containers 允许互不信任的租户，甚至生产应用及未经认证的生产应用程序都能在同一集群内安全运行。

![image.png](https://cdn.nlark.com/yuque/0/2020/png/226702/1595837666693-21bd7f5f-6f44-4c7e-9e80-6a37d67606ac.png)

图2. Kata Containers: 
每个容器/pod 被隔离在各自的轻量级虚拟机中

因此，Kata Containers 与容器一样轻便快捷，并且可与容器生态系统无缝集成（包括流行的编排工具，如 Docker 和 Kubernetes），同时还具有虚拟机的安全优势。

## 社区进展

Kata Containers 项目成立的第一年，社区主要致力于合并 Intel 及 Hyper.sh 的代码，并在全球的行业活动中介绍该项目独特的硬件隔离方案，这是其他容器运行时所缺乏的功能，同时也邀请了大量的社区开发者共同推进该项目。 Kata Containers 社区如今已经拥有众多的贡献者和支持者，包括来自九州云、阿里巴巴、AMD、AWS、百度、Canonical、中国移动、CityNetwork、戴尔易安信、易捷行云、烽火通信、谷歌、华为、IBM、微软、红帽、SUSE、腾讯、同方有云、中兴、英伟达、Mirantis、NetApp、PackageCloud、Packet、Vexxhost 等许多有影响力公司的开发者。随着社区的不断壮大，该项目正在稳步发展中。 社区成就包括：

- 加入开放容器倡议（OCI）规范，Kata Containers 社区持续与 OCI 和 Kubernetes 社区紧密合作，并在 AWS、Azure、GCP 和 OpenStack 公有云环境以及所有主要 Linux 发行版中对 Kata Containers 进行定期测试；
- 添加了对主要架构的支持，除 x86_64 外，还包括 AMD64，ARM，IBM p- 系列和 IBM z- 系列等架构；
- 无缝集成上游 Kubernetes 生态系统，Kata Containers 现在可以立即连接到大多数开箱即用的 Kubernetes 网络；
- 删除不必要的间接层，社区已经去掉了 kata-proxy 组件，并在 KubernetesSIG-Node 开发者和 containerd 社区的帮助下引入了 shim-v2，从而减少了 Kata Containers 辅助进程的数量；
- 降低开销，提升速度，社区正努力提升启动速度，减少内存消耗，并朝着创建（几乎）“零开销”沙箱技术的目标迈进。为此引入多个虚拟机管理程序，包括 QEMU，QEMU-lite，NEMU和AWSFirecracker。还与 containerd 项目整合，推动建立了 rust-vmm 项目，2019年，社区用 Rust 重写了一个沙箱内的 agent，显著减少了匿名页。总之，社区正通过一系列的改进工作来最大限度地减少开销，通过引入 FirecrackerVMM 将内存开销减少到 10MB，而通过 rust-agent 的合并将 agent 的匿名页从10MB减少到1.1MB；
- “面向云原生的虚拟化”，与面向虚拟机领域不同，容器领域是以应用为中心的，为了解决这种差异，社区引入了 virtio-vsock 和 virtio-fs，后续将引入更灵活的内存弹性技术virtio-mem；

如需详细了解项目进展，可查看王旭的系列博客：[KataContainers: 两年而立](http://mp.weixin.qq.com/s?__biz=MzUzOTk2OTQzOA==&mid=2247483874&idx=1&sn=cdc118f8c76a6bed6a6bd15153f5cb10&chksm=fac11313cdb69a055a2a200883b348a30f4d80f219b2f33a628efeccbfd6fd54efc7f7706f93&scene=21)  

## 百度智能云的 Kata Containers 应用实践

百度，中国领先的搜索引擎运营商，全球最大的中文网站托管商，全球领先的 AI 公司-正在其百度智能云中大规模（超过 43k CPU 内核！）应用 Kata Containers，包括百度智能云函数计算（CFC）、百度智能云容器实例（BCI）、百度边缘计算等多种实践场景。 百度智能云是百度面向企业和开发人员的智能云计算平台，致力于为各行各业的企业提供一体化的人工智能、大数据和云计算服务。根据 Synergy Research Group 发布的《2019年第一季度亚太公有云市场报告》，百度已跻身中国公有云市场前四阵营。 百度智能云是一个拥有大量流量和复杂部署场景的复杂网络，如单集群峰值每日网页访问量达 10 亿+，单租户容器规模 50,000+ 等。基于广泛的安全容器技术调研，百度团队认为 Kata Containers 是一项具备高度安全和实践性的安全容器技术，最终选择采用 Kata Containers 进行技术开发和应用。 百度在“[Kata Containers 在百度智能云的应用实践](https://mp.weixin.qq.com/s?__biz=MzUzOTk2OTQzOA==&mid=2247483879&idx=1&sn=f7d753a6f356f527d18fcd3dfd86f6be&scene=21#wechat_redirect)”白皮书中详细阐述了选择 Kata Containers 的原因，记录并分享了其有关 Kata Containers 的应用案例，应用该技术时遇到的技术挑战以及百度工程师解决这些问题的创新方式。 张宇，百度高级架构师及白皮书作者表示：

- 百度必须找出如何在充分发挥容器轻量化和敏捷性的同时，提高其容器隔离性来保障资源共享的安全，从而保障整个云基础架构和租户业务及数据的安全；
- Kata Containers 的虚拟机隔离模式既保障了容器在在多租户环境中的安全隔离，同时也实现了对应用和用户的不可见；
- Kata Containers 作为一种安全容器解决方案，在百度的容器服务中扮演重要角色，并通过在不同场景下将虚拟机监控器（Virtual Machine Monitor, VMM）做替换来满足客户多样化的需要；

在成功申请成为超级用户的过程中，百度阐述了 Kata Containers 改变其业务的方式： 

2019年，我们基于Kata Containers的产品在FaaS（功能即服务）、CaaS（容器即服务）和边缘计算领域取得了市场成功。百度智能云函数计算服务（CFC）基于Kata Containers为小度助手（DuerOS，达到亿级装机量的对话式人工智能操作系统）智能硬件的技术开发者提供部署平台，为3,000多名开发者、近20,000个技能提供了计算能力。百度容器实例服务（BCI）为百度内部的大数据业务提供了强大的基础架构支撑，帮助大数据部门构建起面向多租户的 Serverless 数据处理平台。百度智能云边缘计算节点（BEC）为所有客户提供开放式服务，基于 Kata Containers 的特性使多用户互相隔离、互不影响。

张宇在2019年11月开源基础设施峰会上海发表演讲时表示：百度已经有17个重要的线上业务迁移到了 Kata Containers 平台。Kata Containers 提供容器级别的类似于虚拟机的安全性机制，这给客户带来了极大的信心，减少了他们将业务转移到容器环境时的担忧。 

## Kata Containers 2.0 技术线路图

过去两年，Kata Containers 社区在付出一些开销的代价下，增强了容器的隔离性，同时推动了虚拟化更加的轻量化且“容器友好”。Kata Containers 项目的未来愿景是继续完善沙箱隔离，进一步降低开销，开发面向云原生的虚拟化技术，以最小的成本进一步透明地隔离云本机应用程序。 Kata Containers 2.0 版本预计于今年晚些时候发布，其主要目标如下：

- 与已有的 Kubernetes 生态系统保持兼容；
- 允许将全部的应用，包括运行时进程、镜像/根文件系统等封装进沙箱中；
- 去掉 Agent 的非必要功能，通过重写 Rust 中的关键组件以及改进其他架构，减少对 Kata Containers 进程的封装；
- 改进安全性，如调整架构等，将宿主机的功能尽量留在用户空间，并让长生命周期进程可以使用非 root 权限进行；
- 添加对新内存缩放技术 virtio-mem 的支持，从而可在不破坏安全隔离性的情况下，可按页进行内存的扩缩容，且不再需要考虑内存条这些物理上本来并不存在的硬件的限制；
- 支持 cloud-hypervisor 并为 Kata Containers 的场景进行配置与定制；

如需进一步了解社区有关2.0版本的改进计划，请访问王旭的系列博客：

- [Kata Containers: 面向云原生的虚拟化](https://mp.weixin.qq.com/s?__biz=MzUzOTk2OTQzOA==&mid=2247483883&idx=1&sn=23c9ce9d31821a13bdeb2e73dc355302&scene=21#wechat_redirect)
- [Kata Containers: 2.0的蓝图](https://mp.weixin.qq.com/s?__biz=MzUzOTk2OTQzOA==&mid=2247483919&idx=1&sn=0448ee1346cde7e9b51b3f2b9b339457&scene=21#wechat_redirect)

进一步了解/参与 Kata Containers 项目百度公司是一个很好的示范，积极参与开源项目及社区并取得成功。Kata Containers 社区欢迎其他个人和组织的加入，通过贡献代码、文档及用例，促进项目的开发、优化和发展。

如需详细了解 Kata Containers 项目，可以点击链接访问社区官网：[https://katacontainers.io/](https://katacontainers.io/)

## 关于作者

李昊阳 Horace Li：OpenStack 基金会中国社区经理，主要负责推进 OpenStack 生态系统在中国的发展，提升开源基础设施项目（包括 Kata Containers 等项目）及社区的活跃度与参与度。在加入 OpenStack 基金会之前，曾在 Intel 开源技术中心任职13年，担任技术客户经理，为中国的开源社区项目提供支持。

本文英文原文：[https://thenewstack.io/the-road-to-kata-containers-2-0/](https://thenewstack.io/the-road-to-kata-containers-2-0/) 
