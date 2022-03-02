---
title: "BabaSSL 发布 8.3.0｜实现相应隐私计算的需求"
author: "SOFAStack"
authorlink: "https://github.com/sofastack"
description: "BabaSSL 发布 8.3.0｜实现相应隐私计算的需求"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2022-03-02T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*cKRdQb_z-H0AAAAAAAAAAAAAARQnAQ"
---

## BabaSSL 8.3.0 稳定版本发布！ 

密码学开源项目 BabaSSL 近日发布了 8.3.0 稳定版本，该版本中提供了若干 bug 修复以及较多的新特性支持。

从具体特性角度来看，BabaSSL 8.3.0 版本在国际前沿技术标准、国内密码合规能力以及国密算法的性能优化上均进行了能力的提升。其中：

### 前沿技术标准：

RFC8879 所定义的 TLS 证书压缩功能为 TLS 握手带来了很大的性能提升、进一步降低了 TLS 加密通信时的延迟，对于提升用户体验起到了很好的增强，可直接降低 TLS 握手带宽 80% 以上。

### 国内密码合规能力：

支持 NTLS session ticket、客户端认证以及 RSA_SM4 加密套件，为目前国内各行业也在进行的国密改造提供了功能上的大力支持；

而对国密合规的软随机数生成器的支持，更是满足了国密改造过程中的合规性要求。

### 国密算法性能优化：

此次 BabaSSL 连同 ARM、阿里云对国密 SM3 和 SM4 算法在 ARM v8 架构上进行了特殊硬件指令的优化，使得 BabaSSL 在具备相关指令集的 ARM 架构 CPU 上可以取得更好的 SM3 和 SM4 的计算性能。

例如，在阿里云倚天 710上，SM3 获得最高 74% 以及 SM4 算法最高 36 倍的性能提升；此外，SM4 算法逻辑的 C 语言优化，也实现了在通用 CPU 上性能的提升。

## BabaSSL 8.3.0 主要存在如下方面的更新：

- 修复 CVE-2021-4160

- openssl enc 命令支持 wrap 模式

- ASYNC: 支持 job 的嵌套

- 支持 TLS 证书压缩 (RFC 8879)

- 发行版上游 patch 集合合并 [hustliyilin]

- 支持 NTLS session ticket

- 支持祖冲之消息完整性算法 128-EIA3

- 支持 NTLS 客户端认证

- 移除 ARIA 算法

- 支持国密合规的软随机数生成器

- 支持半同态加密算法 EC-ElGamal

- 在 NTLS 中支持 RSA_SM4 加密套件

- ARM 平台上提供 SM3 和 SM4 的性能优化

- SM4 算法逻辑优化以提升性能 [zzl360]

值得一提的是，针对数据安全和隐私保护市场的兴起，BabaSSL 8.3.0 中实现了对半同态加密算法 EC-ElGamal 的支持，隐私计算领域的用户可以便捷的使用该算法实现相应隐私计算的需求，并同时利用 BabaSSL 提供的国密能力实现技术合规。

此外，BabaSSL 目前作为蚂蚁隐私计算一体机中默认集成的软件密码库，为蚂蚁隐私计算一体机的用户提供统一的密码学 API 接口，方便隐私计算应用程序的开发和调试。

欢迎下载 BabaSSL 8.3.0 版本，下载地址：

[https://github.com/BabaSSL/BabaSSL/releases/tag/8.3.0](https://github.com/BabaSSL/BabaSSL/releases/tag/8.3.0)

## BabaSSL 是什么 ？ 

BabaSSL 是一个提供现代密码学算法和安全通信协议的开源基础密码库，为存储、网络、密钥管理、隐私计算等诸多业务场景提供底层的密码学基础能力。实现数据在传输、使用、存储等过程中的私密性、完整性和可认证性的保证，为数据生命周期中的隐私和安全提供保护能力。

作为国内稀缺的密码学开源项目，BabaSSL  填补了国内信息基础设施领域相关产品的空白，是我国建设国产密码学大生态、解决密码学技术“卡脖子”问题、发展前沿密码学技术的关键一环。

除了在国家商用密码算法领域之外，BabaSSL 还在前沿密码学领域进行了支持，包括隐私计算场景下所需的各种密码学算法以及为了应对量子计算而产生的后量子密码学算法等。

![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*KrzLQa8-KjAAAAAAAAAAAAAAARQnAQ)

BabaSSL 对国际和国内的新型技术标准采用快速跟进的策略，因此支持的功能十分丰富。同时基于蚂蚁和阿里海量的用户场景，其性能和稳定性也达到了互联网生产级别。

自 2020 年开源以来，BabaSSL 也在行业内得到了广大用户的使用和验证，并应用到了众多业务场景里。

## BabaSSL 的前世今生 

BabaSSL 诞生于蚂蚁集团和阿里集团内部，目前作为蚂蚁和阿里的统一基础密码库，广泛应用在各类蚂蚁和阿里的业务当中，提供了 TLS、数据存储、国密合规等关键的密码学相关能力，确保了各项业务平稳、安全、合规的运行。

2020 年进行开源以来，BabaSSL 将蚂蚁和阿里内部所积累的密码学技术能力提供给业界使用，同时在申请商用密码产品软件密码模块一级资质，也是首个有望获得商用密码产品型号证书的开源密码学产品。

从具体场景来看，有如下三个方面，分别是存储、网络和端上的设备。其中网络服务的场景，是 BabaSSL 最大的支撑场景，例如淘宝、天猫、阿里云等各种涉及到链路加密的服务器端。此外移动端 App，例如支付宝手机 App 中集成了 BabaSSL 来实现多种密码学的能力。

### 1. 揭秘 AnolisOS 国密生态，想要看懂这一篇就够了

有了基础国密算法支持，我们在 AnolisOS 上构建出一个围绕国密算法展开的基础软件生态，同时它也是一个全栈国密解决方案：从底层固件，内核，到基础密码学库，在主要链路上做国密改造，最终形成一个完整的基于国密的安全信任链条。

### 2. RFC8998+BabaSSL---让国密驶向更远的星辰大海

TLS 可以说是整个互联网安全的基石，保障着我们的通信数据的安全。随着 TLS 1.3+ 国密正式成为了国家/国际层面均认可的标准（RFC8998），我们也正式在 BabaSSL 中支持了相关能力并将其开源，并建设了 BabaSSL 社区。

### 3. TLS 握手带宽直降 80%，BabaSSL 是怎么做到的 

为了保障数据的安全性，通常使用 TLS/SSL 进行加密传输。当客户端访问服务器后台时，客户端会先和服务器进行 TLS 握手。RFC 8879 TLS Certificate Compression 就是为了解决这个问题，在 TLS 1.3 握手时提供证书压缩功能，大大降低数据传输，减少 TLS 握手的带宽消耗呢。

### 4. Tengine + BabaSSL ，让国密更易用！

国内著名 Web 服务器和反向代理开源软件 Tengine（https://tengine.taobao.org）完成了对 BabaSSL（https://www.babassl.cn）的适配工作。Tengine 对 BabaSSL 提供的特殊 API 进行了适配，并增加对 NTLS 相关能力的支持。无需额外的 patch 或者代码改动，从用户使用的角度进一步提升了便利性。

对密码学、隐私计算感兴趣的话 

等你加入我们！

![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*4Rq1QLqMffoAAAAAAAAAAAAAARQnAQ)

## 本周推荐阅读

[Tengine + BabaSSL ，让国密更易用！](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247500065&idx=1&sn=2ffec7fa6a7dc6563f48f176ae2b9180&chksm=faa32efbcdd4a7ed31789e7752045cb0d632c64f13c9f46fedec24d3c733eb271dd82e4a0f72&scene=21)

[TLS 握手带宽直降 80%，BabaSSL 是怎么做到的](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247498688&idx=1&sn=7379528f786e0e35db67d1ce7576b5c4&chksm=faa3141acdd49d0ce56d580cc1ea32347c04ecfa1503198c1ec8ce5614ead2bd8169a737250c&scene=21)

[RFC8998+BabaSSL---让国密驶向更远的星辰大海](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247490428&idx=1&sn=8ca31baa5c99e0790cdee8a075a7c046&chksm=faa0f4a6cdd77db07f3fb1149b7f6505fe6b8eca5b2e2a724960aee76d9667e3e970c44eef5a&scene=21)

[揭秘 AnolisOS 国密生态，想要看懂这一篇就够了](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247488577&idx=1&sn=172642c14cc511e27aa882ca7586a4c4&chksm=faa0fb9bcdd7728db0fdceec44b44bb93f36664cbb33e3c50e61fcc05dbc2647ff65dfcda3ee&scene=21)

![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*tvfDQLxTbsgAAAAAAAAAAAAAARQnAQ)
