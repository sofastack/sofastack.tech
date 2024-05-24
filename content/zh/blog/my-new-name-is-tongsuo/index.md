---
title: "你好，我的新名字叫“铜锁/Tongsuo”"
authorlink: "https://github.com/sofastack"
description: "再见 BabaSSL ，你好 Tongsuo!"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2022-07-29T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*0b1lSI8T9_0AAAAAAAAAAAAAARQnAQ"
---

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c86c1ed3037949c3a4fa2ef8b82eaac6~tplv-k3u1fbpfcp-zoom-1.image)

文｜杨洋（花名：凯申 )

铜锁开源密码库创始人、蚂蚁集团高级技术专家

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9c88346da3654c1880bcd0ae9507338c~tplv-k3u1fbpfcp-zoom-1.image)

**本文 2816 字，阅读 8 分钟**

***再见 BabaSSL ，你好 Tongsuo!***

> *BabaSSL 这个名字由于其历史上的若干特殊原因，导致了其看起来是主要 SSL/TLS 协议的密码学产品，这其实并不符合整个产品的功能特性，名字本身也不够中立，这会让用户产生一定程度的误解。*

> *目前 BabaSSL 在积极推进向开放原子开源基金会的捐赠行动，并结合社区未来发展的方向，现决定对 BabaSSL 项目进行更名。新名字需要更加中立化，而且需要体现项目的功能特性。基于这些考虑，计划取新名字为：铜锁，对应拉丁字母名称为铜锁的汉语拼音“Tongsuo”。铜锁是在中华文明 5000 年历史的进程中得到了广泛应用的安全设施，且小巧、设计精妙，极具中国传统特色，符合密码库的产品特色和发展目标。*

## 一、BabaSSL  从何而来，为何而改？

BabaSSL 于 2019 年诞生在蚂蚁和阿里集团内部，是基于 OpenSSL 1.1.1 版本 fork 而来的一个变种版本。创建 BabaSSL 项目的动机是在蚂蚁和阿里内部得到一个统一的 OpenSSL 变种版本，以便使用此统一版本来支撑蚂蚁和阿里内部的各种业务。这样可以减小各个业务方维护 OpenSSL 的成本，实现密码学能力的统一管理和维护，进而降低潜在的安全风险。

针对蚂蚁和阿里内部的业务特点，BabaSSL 需要采用和 OpenSSL 完全不同的发展路线。简单来说，BabaSSL 需要覆盖的场景非常的多样化，包括移动端、服务器端、资源受限的嵌入式环境等。而且在算法和密码学特性的支持上，蚂蚁和阿里的业务对前沿的技术存在较大需求，因此要求 BabaSSL 需要采用相对激进的演进策略，但还要确保很高的质量标准以应对蚂蚁和阿里的业务规模。所以我们当年使用 Brisk and Better Assured Cryptography and SSL/TLS toolkit 来命名这个密码学基础库，并缩写为 BabaSSL。

随着 BabaSSL 项目的发展，我们发现除了蚂蚁和阿里内部的业务对其有着重大的依赖之外，业界也对国密合规和前沿密码学技术存在较大需求。因此在 2020 年 10 月份，我们将 BabaSSL 进行了开源，并维持 BabaSSL 名称不变。随着 BabaSSL 开源社区的发展、用户数量的增多，我们逐渐发现 BabaSSL 这个名称已经无法继续肩负整个社区更大的目标和使命，因此取一个新名字就十分必要。

## 二、我的新名字——"铜锁/Tongsuo"

经过与开源社区小伙伴们共同探讨，并与开放原子开源基金会沟通后，我们最终选定了 “铜锁/Tongsuo” 作为 BabaSSL 开源项目的新名字，其含义如下：

**1.** 铜锁的设计形象和密码学的锁形象异曲同工，都是保障安全的技术

**2.** 铜锁的历史悠久，应用十分广泛

**3.** 铜锁诞生于中国汉代，流行至明清，极具中国特色，代表了中国的传统文化

**4.** 铜锁设计精妙、体积小巧，安全性高

铜锁的这些特点，符合 BabaSSL 的项目定位和发展目标：适应场景最广、性能最好、可靠性最高且监管合规的开源密码学基础库。正如铜锁是中国 5000 年历史长河中为人民生命财产提供保证的最基础元素，“铜锁密码库”作为信息安全领域基础组件、中国网络空间安全和数据安全的核心基础元素，也希望能为中国人民的信息和财产安全贡献力量。

铜锁的拉丁字母名称则直接采用铜锁的汉语拼音：Tongsuo，除此之外不再赋予其他含义解释，目的是集中体现中国的品牌名称和文化价值。

## 三、更名后的一系列操作

我们近期会针对 BabaSSL 开源项目进行如下的更名举措，其中部分举措可能会对用户造成影响，需额外注意：

**「代码库名称变更」**

**1.** 在 Github 上创建新的 Tongsuo 组织，并将 BabaSSL 代码仓库更名为 Tongsuo 后迁移其下；

**2.** BabaSSL 代码仓库的转地址会在 Github 上自动跳转到新的 Tongsuo 仓库地址，方便已有用户访问；

**3.** 新的 Tongsuo 代码仓库的 master 分支变更为基于 OpenSSL 3.0 代码基础，并整体迁移为 Apache License 2.0 开源许可证。由此进行相关分支变更如下：

**a.** 现有的 master 分支更名为 master-babassl，并设置为只读模式，即不再接受新的代码合并，只留做参考用；

**b.** 将 master-tongsuo 分支更名为 master，作为下个大版本 tongsuo-8.4.0 的开发分支。由于新的 master 分支和旧的 master 分支之间没有代码提交的逻辑关系，因此需要用户手动重新检出新的 master 分支并覆盖本地的旧 master 分支内容。在此过程中如果你的本地 master 分支存在代码修改，请注意保存以免代码修改丢失。

**「网站改名」**

**1.** 启动 tongsuo.net 网站，并更新网站内容/品牌；

**2.** 将对 babassl.cn 网站的访问重定向到 tongsuo.net；

**3.** 新增 tongsuo.readthedocs.org 网站，作为铜锁项目的文档库。

**「Release 改名和版本策略」**

**1.** 在 8.3.x 版本中将沿用 BabaSSL 名称，即 BabaSSL 8.3.1 等后续版本；

**2.** 从 8.4.0 开始更名为 Tongsuo。Tongsuo 延续 BabaSSL 的版本编号，不再重新定义编号。主要是考虑软件版本的升级和比较的前后兼容性问题。新的 release 包名称为：tongsuo-a.b.c.tar.gz 或 tongsuo-a.b.c.zip。

**「代码 API 命名修改」**

需要考虑兼容问题，因此 BABASSL_ 开头的 API 还需持续保留，直到 9.0 大版本发布。

## 四、期待与你共“铜”成长

经过这一年的努力，铜锁/Tongsuo 开源密码库项目通过了开放原子开源基金会的 TOC 答辩。接下来我们的重心是继续推进铜锁 8.4.0 版本的研发工作，该版本会在半同态加密算法等前沿密码学领域进行相关特性的大力支持，为铜锁的用户带来隐私计算领域的底层密码学原语能力。

希望能有更多朋友参与进来，与我们共同去完善**铜锁/Tongsuo**，不论你所处哪一个研究领域，我们都非常期待和欢迎你的加入。此外，我们于近期建立了铜锁 *（BabaSSL）* 的开源项目钉钉群，方便铜锁密码库的用户们进行沟通交流，期待着能有更多的社区朋友在铜锁 *（BabaSSL）* 共同成长！

钉钉用户交流群群号：44810299

> *铜锁（BabaSSL）的更名涉及到较多的现有资产名称变更事宜，例如代码库改名、文档内容名称替换等。具体的相关进展和状态，我们会及时在上述钉钉群中向大家通告。*

**了解更多……**

**铜锁/Tongsuo Star 一下✨：**
*[https://github.com/BabaSSL/BabaSSL](https://github.com/BabaSSL/BabaSSL)*

### 本周推荐阅读

BabaSSL：支持半同态加密算法 EC-ElGamal

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4912ef8c61af457bb467f4697a9bce02~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247502645&idx=1&sn=efb490d530f4254a8b12dff89714ace7&chksm=faa324efcdd4adf9119222551a407da68e388fd1b3f652fc034860fee9d687311e2136bbd28c&scene=21)

BabaSSL 发布 8.3.0｜实现相应隐私计算的需求

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3b7bde1e85244a8fbc6c8111f204b2f0~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247502271&idx=1&sn=861bcea32cc766721bb6fd95361ef6eb&chksm=faa32665cdd4af73dcc42c51f79e6c61035cddf95ecad822ea6e85cb188c60cb85c9b8027484&scene=21)

Tengine + BabaSSL ，让国密更易用！

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/39f758a191b543299970772af1d0be05~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247500065&idx=1&sn=2ffec7fa6a7dc6563f48f176ae2b9180&chksm=faa32efbcdd4a7ed31789e7752045cb0d632c64f13c9f46fedec24d3c733eb271dd82e4a0f72&scene=21)

TLS 握手带宽直降 80%，BabaSSL 是怎么做到的？

[![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e04944d58f024a3fb6ace200f25289c2~tplv-k3u1fbpfcp-zoom-1.image)](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247498688&idx=1&sn=7379528f786e0e35db67d1ce7576b5c4&chksm=faa3141acdd49d0ce56d580cc1ea32347c04ecfa1503198c1ec8ce5614ead2bd8169a737250c&scene=21)

欢迎扫码关注：

![图片](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/e2340996423e46f0ad481840b1065e34~tplv-k3u1fbpfcp-zoom-1.image)
