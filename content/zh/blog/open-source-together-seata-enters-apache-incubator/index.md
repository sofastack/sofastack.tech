---
title: "携手开源，共同见证｜Seata 进入 Apache 孵化器"
authorlink: "https://github.com/sofastack"
description: "携手开源，共同见证｜Seata 进入 Apache 孵化器"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2023-11-16T15:00:00+08:00
cover: "https://mdn.alipayobjects.com/huamei_soxoym/afts/img/A*PH0mSqHeR_IAAAAAAAAAAAAADrGAAQ/original"
---

北京时间 2023 年 10 月 29 日，分布式事务开源项目 Seata 通过 Apache 基金会的投票决议，以全票通过的优秀表现正式成为 Apache 孵化器项目！

根据 Apache基金会邮件列表显示，包含 13 个约束性投票（binding votes）和 6 个无约束性投票（non-binding votes）的投票全部持赞同意见，无弃权票和反对票，投票顺利通过。

“Welcome Seata to the ASF incubator.”

## 项目历史

<font color=#1E90FF>早在 2007 年</font>

蚂蚁集团和阿里巴巴就在内部开发了分布式事务中间件，用于解决电商、支付、物流等业务场景中应用数据的一致性问题。内部项目分别被称为 XTS（eXtended Transaction Service）/TXC（Taobao Transaction Constructor），该项目几乎在每笔订单的交易支付链路几乎都有使用。

<font color=#1E90FF>自 2013 年以来</font>

蚂蚁集团在金融云上向企业客户发布了分布式事务云服务产品 DTX（Distributed Transaction-eXtended），阿里巴巴在阿里云上发布 GTS（global transaction service），两者均在各个行业领域积累了大量用户。

<font color=#1E90FF>2019 年 1 月</font>

阿里巴巴集团正式开源了该项目，项目命名为 Fescar（Fast & Easy Commit and Rollback）。项目开源以来，它受到了众多开发人员的热烈欢迎和赞扬，开源一周收获了超 3k star，曾一度蝉联 GitHub Trending 排行榜第一。

<font color=#1E90FF>2019 年 4 月</font>

蚂蚁集团数据中间件团队加入了 Fescar 社区。为了创建一个更加开放和中立的社区，Fescar 改名为 Seata（Simple Extensible Autonomous Transaction Architecture），代码仓库从 Alibaba organization 迁移到其独立的 Seata organization。

<font color=#1E90FF>2019 年 12 月</font>

Seata 开源项目正式发布 1.0.0 GA 版本，标志着项目已基本可生产使用。

<font color=#1E90FF>2023 年 10 月</font>

为了更好地通过社区驱动技术的演进，蚂蚁集团和阿里巴巴携手，正式将 Seata 捐赠给 Apache 基金会，提案通过了 Apache 基金会的投票决议。

## 项目现状

- Seata 开源 4 年来，主项目在 GitHub 累计收获 star 超 24k，累计发布版本超 40 次，参与代码贡献人数超 300 人。

- Seata 被各领域企业/组织广泛应用于解决分布式事务问题，在 GitHub「Used by」拥有超过 3.1k 的仓库依赖，金融领域企业纷纷试点使用。

- Seata 对于市面上主流的关系数据库、RPC 框架做了广泛的支持，同时被许多第三方社区做了主动和被动集成。

## 项目特性

- 提供 AT、TCC、Saga 和 XA 事务模式，支持事务模式的混用，以满足不同业务场景的数据一致性需求。

- 提供 Java、Golang 等多语言 SDK 支持。

- 支持了 Apache Dubbo、Spring Cloud Alibaba、gRPC、Motan、SOFARPC、HttpClient 等服务调用框架。

- 提供了 MySQL、MariaDB、Oracle、PostgreSQL、OceanBase、TiDB、SQLServer、PolarDB、Dameng 等关系数据库无侵入 AT 事务模式的支持。

- 支持基于多种关系数据库、Redis 存储的存算分离的集群模式，支持基于 Raft 的存算不分离集群模式，满足不同运维场景下的集群高可用需求。

- 支持了市面上主流的注册中心和配置中心。

- 提供了丰富的插件化扩展机制，支持用户自定义 SDK 侧 30 多个扩展点。

## 致谢

感谢所有曾经参与到社区建设中来的贡献者。

特别感谢愿意为 Seata 提供指导的 Champion 和 Mentors:

Champion：

Sheng Wu（wusheng @apache.org）

Mentors：

Sheng Wu(wusheng @apache.org）

Justin Mclean(justin @classsoftware.com）

Huxing Zhang(huxing @apache.org）

Heng Du(duhengforever @apache.org）

我们坚信，将 Seata 引入 ASF 可以推动开源社区向着更强大、更多元化发展。我们将努力践行 Apache Way，同时欢迎更多的公司和个人加入到开发队伍中来，让 Seata 社区更加健康、茁壮地成长，让更多人享受开源带来的技术红利！

## 项目寄语

四年前，我们秉持开源开放的理念，在社区写下了第一行代码。回顾过去四年，Seata 开源社区的技术演进和社区运营就像一次创业旅程。这四年我们取得了不菲的成绩，Seata 的出现快速占领了开发者的心智，成为了分布式事务领域的事实标准，在理论实践中我们牵头推动了行业标准的建立。Seata 捐赠给 ASF 是我们迈向更多元化社区治理和全球化发展的重要里程碑。

-- 季敏（Seata 开源社区创始人）

恭喜 Seata 全票通过进入 Apache 孵化器！2019 年，蚂蚁集团和阿里集团携手一起开源了分布式事务框架 Seata，各自贡献了内部分布式事务的最佳实践。经过了四年的发展，Seata 早已成为一个被社区广泛认可的分布式事务项目，大量的贡献者在 Seata 里面贡献代码，丰富了 Seata 的各种功能，很多用户在自己的环境中使用 Seata，给 Seata 带来了大量的实践落地案例。Seata 进入 Apache 孵化器不是终点，而是新的起点，期待 Seata 后面能够持续按照 The Apache Way 的方式运作，以更加中立的姿态，吸引更多的贡献者和用户，走向更加宽阔的未来。

-- 黄挺（蚂蚁集团中间件负责人）

非常高兴 Seata 这个阿里和蚂蚁合作多年的开源项目进入 Apache 基金会进行孵化，相信 Apache Way 会帮助项目更加社区化、服务更多人，也期待 Apache 的 Seata 能为社区带来更多微小而美好的改变。对于蚂蚁开源来说，Seata 进入 Apache 孵化也是一个重要的里程碑，希望未来有更多蚂蚁团队发起的项目能走上 Apache 之路。

-- 王旭（蚂蚁开源技术委员会副主席）

分布式事务是微服务架构最复杂，技术水位最深的部分。阿里&蚂蚁在开源捐献之前申请了数十个专利，开源之后在社区推动下高速发展，吸收 70%+外部开发者，大幅降低分布式的复杂度，扩展了分布式事务的生态；未来随着微服务高速发展，随着数据一致性要求越来越高，相信分布式事务会发挥越来越大的作用！

--李艳林（阿里云微服务团队负责人）

Seata 是一款由阿里巴巴和蚂蚁集团共同参与开发的分布式事务解决方案，广泛应用于两家公司的内部系统。它的突出特点在于高性能和简单易用，为微服务架构下的分布式事务处理提供了高效且可靠的解决方案。我们坚信将 Seata 捐赠给 ASF，社区将会得到更好的发展，能为更多的开发者提供更优质的服务。同时，我们也期待更多的开发者能够加入到 Seata 的开发中来，共同推动分布式事务解决方案的进步和发展。

-- 谢吉宝（阿里云云原生中间件负责人）

很高兴能够作为 Champion 和 Mentor ，帮助 Seata 社区进入到 Apache 孵化器。Seata 项目在过去的 4 年，在分布式事务领域取得了长足的进度，并以开放的心态面向社区，并一步步的做好走进 Apache 孵化器的各项准备工作。希望在未来的一到两年的实践中，项目成员能够很好的学习以及融入 ASF 的文化中，并进一步增加社区的多元化和国际化。进入孵化器是一个里程碑，更是一个新的开始，祝贺 Seata 项目。

-- 吴晟（Apache 软件基金会会员、Apache 软件基金会首位中国董事、Apache 软件基金会孵化器 PMC 成员和项目导师）

我关注 Seata 这个项目关注很长时间，从 Fescar 到 Seata，该项目从诞生之初就保持了旺盛的生命力，在近几年社区和逐步壮大，逐步成长为分布式事务这个领域杰出的一个开源项目，很高兴看到 Seata 加入 Apache 基金会进行孵化，相信 Seata 今后会以更加中立的身份，吸引更多的贡献者，一群人一起走可以走得更稳更远。很荣幸以导师的身份陪伴 Seata 的孵化之旅，预祝 Seata 一切顺利！

-- 张乎兴（Apache 基金会成员、Apache Tomcat、Apache Dubbo 社区 PMC 成员、Apache Seata(incubating) 导师）

Seata 作为在阿里跟蚂蚁久经验证的分布式事务框架，不仅经历了历年海量流量的验证，而且在开源之后迅速成长为国内分布式事务领域的事实标准。很高兴看到 Seata 成为 Apache 基金会孵化项目，作为一个新的开始，希望 Seata 能够吸引更多的开发者，打磨更多的场景，行稳致远，相信在众多开发者的共同努力下，Seata 一定能够成为数据与应用之间的坚实桥梁。

--杜恒（ASF member、Apache RocketMQ PMC member）

Seata 作为分布式事务协调器，是微服务架构中最重要的独立组件之一，也是整个阿里巴巴微服务领域最精华的部分之一。Seata 项目从开源以来就受到了广泛的开发者支持，而现在它将进入 Apache 基金会孵化，我相信会在 Apache Way 开放的文化帮助下，Seata 项目将继续成为微服务架构中的一颗明星，为我们带来更多便利和创新。

-- 王小瑞（AutoMQ 联合创始人 & CEO、Apache RocketMQ 作者、PMC Chair）

在分布式、微服务领域，Seata 绝对占得重要的一席，它开创性的创造了多种事务模式。Dubbo & Spring Cloud Alibaba 一直和 Seata 有深度的集成与合作，我本人也与作者季敏、社区核心成员有过多次深入交流，这是一个有技术追求、有责任心、充满活力的开源社区。非常高兴见证 Seata 加入 ASF 大家庭，开启新的旅程，祝一切顺利。

-- 刘军（Apache Dubbo PMC Chair、Spring Cloud Alibaba 负责人）

分布式事务一直是一个被大众敬而远之，视而不见却实际存在的问题,四年前 Seata 将业界对待分布式事务的“鸵鸟心态”转为轻松面对，将一个业界最难攻克的问题，以一种标准化、无侵入、低成本的方式引进，目前登记在册已有数百家企业，覆盖各式各样的业务场景。如果说四年前 Seata 是一粒种在这个领域的种子，那么目前已经枝繁叶茂了，相信捐赠给 ASF 后更加的中立与开放,吸引更多开发者共同建设，共同演进分布式事务领域的未来技术架构，将这棵已经枝繁叶茂的大树做到硕果累累。

-- 陈健斌 （Apache Seata（incubating）PPMC 成员）

作为分布式事务领域的重要项目，Seata 自诞生以来，一直致力于解决微服务架构下的数据一致性问题，帮助开发者构建高性能、易扩展、易使用的分布式应用。现在，Seata 即将踏上新的征程。我们相信 Seata 在捐赠给 ASF 这个大家庭后，将会得到更广泛的关注和使用，也相信在未来的日子里，Seata 将会为更多的开发者解决分布式事务的难题。

-- 王良（Apache Seata（incubating）PPMC 成员）

Seata 作为一个强大而稳定的开源分布式事务解决方案，为广大开发者在分布式事务的场景下，提供了极大的帮助和便利。贡献给 Apache 将进一步推动项目发展和全球社区的参与度。祝愿在 Apache 的托管下，能够不断发展，更加中立化，标准化，助力全球更多的开发者构建可靠的分布式事务业务。

-- 雷志远（Apache Seata（incubating）PPMC 成员）

作为一名中间件老兵，有幸见证：微服务浪潮下，源自国内的分布式事务中间件从阿里、蚂蚁内部创新孵化，到商业化，再到开源，一步步走向更广阔的天地，产生更大的价值。相信，捐赠给 ASF 将让 SEATA 成为世界上更多“苦分布式事务久矣”的开发者们的解药！

-- 申海强（Apache Seata（incubating）PPMC 成员、前阿里分布式事务中间件核心成员）

有幸跟随着这个项目从 Fescar 到 Seata 再到现在捐献给 Apache 基金会，见证了在这四年时间里一间又一间的企业因为 Seata 而解决了分布式事务的难题。现在 Seata 站在了全新的起点上将以开放、包容的姿态去面对每一个用户，悉心聆听每一个声音，开拓出这条能够通往全球的道路。

-- 张嘉伟（Apache Seata(incubating) PPMC 成员）

非常高兴看到 Seata 成为 Apache 孵化项目，这定会是分布式事务领域的标杆解决方案。从最初的 Fescar 到 Seata，我与你一路相伴，让我们一起努力，期待 Seata 蜕变成 Apache Seata。

-- 吴江坷（Apache Seata（incubating)PPMC 成员）

在微服务开发模式下，分布式系统的数据一致性常常成为系统的难题。Seata 开源以来，社区积累了各种事务模式解决方案和丰富的用户使用案例。非常高兴 Seata 项目能加入 Apache 基金会，社区将更加开放和多元化，将吸引更多的提交者，帮助更多的用户，项目成为分布式事务的事实标准。

--  王欣（Apache Dubbo 社区 PMC 成员、Apache Seata（incubating）PPMC 成员）

## 写到最后

为促进分布式事务技术的普及和实践，增进 Apache Seata（incubating）使用者的交流与学习，我们将定期邀请业内资深的技术专家，分享实战经验。

欢迎订阅 dev-subscribe@seata.apache.org 邮件组，关注 Apache Seata（incubating）社区技术发展。

欢迎持续关注 Seata！

官网地址：[https://seata.io/zh-cn/](https://seata.io/zh-cn/)
