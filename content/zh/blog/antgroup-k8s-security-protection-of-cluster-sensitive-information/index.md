---
title: "蚂蚁是如何改进 K8s 集群敏感信息的安全防护的？"
author: "万佳"
authorlink: "https://github.com/sofastack"
description: "K8s Secret 面临着哪些安全问题？这些安全问题会带来什么影响？社区提供的解决方案存在哪些不足？"
categories: "Kubernetes"
tags: ["Kubernetes"]
date: 2020-08-12T15:00:00+08:00
cover: "https://cdn.nlark.com/yuque/0/2020/png/226702/1597204932141-aed56623-9eb5-4f2c-a2e1-6e57cec1db41.png"
---

在 Kubernetes 中，Secret 显得尤其重要。因为它是 K8s 中存储所有敏感信息的对象。据悉，这些敏感信息包含密码、集群的证书、OAuth token、ssh key 以及其他用户自定义的敏感文件等。因此，一旦 K8s 中 Secret 出现安全问题，后果将非常严重。此外，虽然社区提供了一定的安全防护方案，但是依然存在诸多问题。

K8s Secret 面临着哪些安全问题？这些安全问题会带来什么影响？社区提供的解决方案存在哪些不足？......针对这些问题，InfoQ 记者采访了蚂蚁集团高级工程师秦凯伦，他专注于可信计算、系统安全和虚拟化等领域，对 K8s Secret 有着深入的研究和探索。

## K8s Secret 的安全问题

根据 Kubernetes 文档，Secret 是 K8s 中存储所有敏感信息的对象。事实上，如果敏感信息直接存放于 K8s 的 Pod spec 或镜像中，不仅管控困难，而且存在较大的安全隐患。因此，K8s 通过创建、管理、应用 Secret 对象，可以更好地控制敏感信息的用途，并降低其意外暴露的风险。

秦凯伦称，虽然引入 K8s Secret 对象，这在一定程度上降低了意外泄露的风险（更多地是通过集中式的管理），但是 K8s Secret 对象自身的安全性，“社区默认方案中仍存在许多安全问题”。

一般来说，K8s 中，Secret 数据以纯文本的方式存储在 etcd 中，默认只有 base64 编码，未经加密。同时，共享该文件或将其检入代码库，密码容易泄露。

## 社区解决方案的不足

针对此问题，K8s 社区提供了基于 KMS 的 K8s Secret 加密方案，谷歌云、AWS 和 Azure 均支持该方案。他说，“这虽然解决了 etcd 中 Secret 明文存储问题，但依然有一些问题。”

- Secret、加密 Secret 的密钥在内存中明文存放、易被攻破；
- 攻击者可以假冒合法用户，调用解密接口，窃取密钥；

密钥一旦泄露，将导致所有数据的泄露，从而引起用户对整个系统的信任崩溃。“为此，社区和一些公司尝试为该方案中的 Plugin 加上基于硬件的安全保护，从而提升攻击难度。但对某些特定用户来说，保护的覆盖面和程度依然不够”。

实际上，我们可以从 K8s Secret 的整个生命周期来看：

![K8s Secret 整个生命周期](https://cdn.nlark.com/yuque/0/2020/png/226702/1597203596344-8c46ecc8-8b51-4fb8-8ff3-0d8e7a5c9349.png)

- Secret 的生成及访问 Secret 的身份证书明文存放在用户侧内存中，用户侧环境复杂，容易被攻击者攻破；
- 加密 Secret 的密钥的生成、cache 等在 K8s API server 中明文存放在内存中，安全根易被窃取或破坏；
- 与 KMS 交互的 Plugin 的加解密接口无法防止攻击者假冒，存在泄漏风险；
- Secret 在 Node 中消费，依然明文内存存放，暴露出一定攻击面；

在秦凯伦看来，理想中，对 K8s 中 Secret 的保护程度应该考虑其整个生命周期的安全、可信，做到端到端的安全防护。

## 蚂蚁集团的探索

为此，他们基于 TEE 技术，将 K8s Secret 整个生命周期和端到端使用过程中的关键组件、步骤保护起来。整体方案大致如下：

![蚂蚁集团基于 TEE 探索 K8s 的生命周期](https://cdn.nlark.com/yuque/0/2020/png/226702/1597203486917-f3180676-b29c-4377-8b29-696ba0b650a1.png)

- 将 API Server 端与 KMS 交互的 KMS Plugin  用 TEE 保护，在保障了 Plugin 中根密钥（安全根）、数据加密密钥无泄漏风险的前提下，降低了性能开销；
- 将 API Server 端的 KMS provider 用 TEE 保护，避免数据密钥及 Secret 在任何时候明文直接暴露在内存中；同时，通过 TEE 的本地证明机制能够认证解密数据密钥接口的调用者，防止攻击者假冒，确保密钥的安全；
- 将用户端的 kubectl、kubeconfig 等使用 TEE 保护，一方面 kubeconfig 不落盘同时被硬件保护，提升了安全水位；另一方面，用户的 Secret 通过安全信道直通到 TEE 中进行处理，避免了直接暴露在内存中，规避了被恶意窃取的风险，且用户对 API Server 进行 TEE 远程证明，可以帮助用户确信他正在把自己的 Secret 托付给可信的软件实体（没有含有故意泄露用户秘密的恶意逻辑），建立对 API Server 的信任；
- 将 Node 端的 kubelet 中 Secret 的消费过程用 TEE 保护，进一步避免了 Secret直接暴露在内存中，规避了被恶意窃取的风险；

秦凯伦向 InfoQ 记者指出，“这种方案是基于 TEE 的端到端 K8s Secret 保护，还引入 LibOS 技术，实现 TEE 保护对用户、开发者和运维团队完全透明。”

据悉，KMS Plugin 和 TEE-based KMS Plugin 没有标准和开源的社区实现，因此他们设计并开发了自己的 KMS Plugin，并在灰度发布、应急处理、监控管理等方面进行了生产增强。“在与 TEE 结合的过程中，我们为了应对 SGX 机型存在的性能问题，提供了 standalone 和服务化 KMS Plugin 两套方案”。

同样，TEE-based kubectl 也没有标准和开源的社区实现，他说：“我们基于 kubeproxy 开发了自己的安全 kubectl，实现了 kubeconfig 对用户透明、与用户身份绑定、不落盘并采用TEE保护内存安全等设计目标。”

此外，考虑到 TEE 保护的易用性、可靠性、可扩展性和可维护性等，他们在评估多套方案后，引入了由蚂蚁开源的 Occlum LibOS，屏蔽了 TEE 对用户、开发者和运维团队的影响，大大降低了 TEE 开发的门槛和成本。

在秦凯伦看来，K8s 作为蚂蚁大规模容器集群的管控根基，应用基于 TEE 的端到端 K8s Secret 保护防护方案，增强了其自身安全和可信，提升了蚂蚁核心管控平面的安全水位，“这对于金融场景下高标准的数据安全和隐私保护来说不可或缺”。

## K8s 相关阅读

- [备战双 11！蚂蚁金服万级规模 K8s 集群管理系统如何设计？](https://www.sofastack.tech/blog/ant-financial-managing-large-scale-kubernetes-clusters/)
- [Kubernetes: 微内核的分布式操作系统](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247486583&idx=1&sn=de15ec3224bc4f00b7e77c9f7481eee0&chksm=faa0e3adcdd76abb1b771514c09a486483f008dd911c27295b52da7979cf7509858134ffaf01&scene=21)
- [开箱即用的 Java Kubernetes Operator 运行时](https://www.sofastack.tech/blog/java-kubernetes-operator-kubecon-na2019/)
- [深入Kubernetes 的“无人区” — 蚂蚁金服双十一的调度系统](https://www.sofastack.tech/blog/kubernetes-practice-antfinal-shopping-festival/)
- [深度 | 蚂蚁金服自动化运维大规模 Kubernetes 集群的实践之路](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247484020&idx=1&sn=6f429bf694b491098264c1690f15ccf1&chksm=faa0edaecdd764b80c0d69538c42e9cb9719848ebf0d76db44667d8c4c5cb2f67f97c8a8ea27&scene=21)
