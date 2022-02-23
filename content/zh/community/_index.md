---
layout: singlepage
title: "SOFAStack 社区"
---

Hello~欢迎来到 SOFAStack 开源社区，首先感谢一直以来支持 SOFAStack 的你们❤

社区随时都欢迎各种贡献，无论是**简单的错别字修正**、**bug 修复**还是**增加新功能**，欢迎提 issue 或 pull request 至 Github 社区，也可以加入钉钉群：群号 34197075 联系我们。

项目地址：[https://github.com/sofastack](https://github.com/sofastack)

## 提问指南

当您在使用 SOFAStack 相关组件时**遇到困难**，可以查阅[相关项目的文档](/projects/)查看解决方案；

如果文档解决不了您的问题，欢迎社区所有同学通过 [Github](https://github.com/sofastack) issue 区提交反馈，在 issue 里写下异常现象和复现步骤，或者是其他您想咨询的问题。发 issue 也可以方便后人，后人遇到问题时通过搜索引擎就能搜到解决方案。

如果issue回复不及时，可以去钉钉群里找群管理员，群管理员会帮忙催项目维护者回issue。

## 参与开源共建

欢迎参与 SOFAStack 开源社区共建，您可以通过以下的方式参与共建：
- **<SOFAStack&MOSN:新手任务计划/> （火热进行中）**
  - 作为技术同学，你是否有过“想参与某个开源项目的开发、但是不知道从何下手”的感觉？
为了帮助大家更好的参与开源项目，SOFAStack和MOSN社区会定期发布适合新手的新手开发任务，帮助大家learning by doing!
  - [Layotto社区任务](https://github.com/mosn/layotto/issues/108) 欢迎认领! 具体上手步骤可以看[新手攻略：从零开始成为 Layotto 贡献者](https://mosn.io/layotto/#/zh/development/start-from-zero)
  - [SOFA-RPC社区任务](https://github.com/sofastack/sofa-rpc/issues/1127) 欢迎认领! 
- **参与 SOFALab 源码解析（旧系列已完结，新系列策划中）**：
  - `SOFA:Lab` 源码研究实验室，由 SOFA 团队和源码爱好者们出品；
  - [SOFABootLab](/activities/sofa-boot-lab/) 、 [SOFAArkLab](/activities/sofa-ark-lab/) 、 [SOFARegistryLab](/tags/%E5%89%96%E6%9E%90-sofaregistry-%E6%A1%86%E6%9E%B6/) 、[SOFABoltLab](/tags/%E5%89%96%E6%9E%90-sofabolt-%E6%A1%86%E6%9E%B6/)、[SOFAJRaftLab](/tags/%E5%89%96%E6%9E%90-sofajraft-%E5%AE%9E%E7%8E%B0%E5%8E%9F%E7%90%86/)、[SOFATracerLab](/tags/%E5%89%96%E6%9E%90-sofatracer-%E6%A1%86%E6%9E%B6/)、[SOFARPCLab](/tags/%E5%89%96%E6%9E%90-sofarpc-%E6%A1%86%E6%9E%B6/) 系列已经完结；

- **参与代码或文档贡献**： 
  - 无论是简单的错别字修正、bug 修复还是增加新功能，欢迎您的贡献！

## 参加开源活动

- 欢迎关注【金融级分布式架构】微信公众号；
- [SOFAMeetup](/tags/sofameetup/)：线下高质量的云原生架构面基活动，将以每2月一场的频次，在全国各个城市站，举行线下技术交流会；
- [SOFAChannel](/tags/sofachannel/)：有趣实用的分布式架构频道，将以每月一场的频次，在线上展开直播活动，分享技术干货；

有想要交流的话题或者想要举办的城市，非常欢迎告诉我们，加入互动钉钉群：群号 34197075 与我们交流。

## SOFAStack 社区组织架构

![Community Organzation](https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*DpjGQqAcRyQAAAAAAAAAAAAAARQnAQ)

### Developer Group（代码层面）

#### Contributor

**如何成为 Contributor：**

在 SOFAStack 的任何一个正式项目中成功提交一个 PR 并合并。

#### Member

加入 SOFAStack GitHub 组织，成为 SOFAStack 开源社区的一员。

##### 成为Member的条件

满足以下条件可以申请成为Member:

- 贡献过一个有价值的PR，例如一个 Easy 级别的社区开发任务
- 有意愿一起维护社区

##### 职责

Member 需要一起帮忙回复issue/pr，triage（把issue分配给对应模块的负责人）

##### 权限

Triage权限。有权限操作issue和pr，例如打label、分配问题。

详细的权限说明见 [permissions-for-each-role](https://docs.github.com/en/organizations/managing-access-to-your-organizations-repositories/repository-roles-for-an-organization#permissions-for-each-role)

#### Reviewer （可选）

模块负责人，负责某个模块的issue review和code review

该角色可选，各位项目负责人如果觉得没必要可以不设置该角色。

##### 成为Reviewer的条件

有意愿负责某个模块的issue review和code review，且对该模块贡献过的PR满足**下列条件之一:**
- 1个Hard级别的PR
- 2个Medium级别的PR
- 1个Medium+2个Easy级别的PR

注：相当于`Hard:Medium:Easy`的换算关系是`1:2:4`

>设计这个规则的逻辑是： Reviewer要对某个模块很懂，才能对这个模块把关。那怎么判断他很懂呢？可以看他做过的PR，1个hard级别的pr，或者2个medium级别的pr，或者1个medium+2个easy级别的pr

##### Reviewer 的职责

负责某个模块的issue review和code review,给出技术建议。有该模块相关的重大变更会request review模块Reviewer。

#### Committer

**如何成为 Committer：**

贡献过的PR满足下列条件:
- 合并的 PR 达到 10个；
- 其中至少包含1个 Hard 级别PR, 或者4个 Medium 级别PR；

**职责**

- 社区咨询支持；
- 积极响应指派给您的 Issue 或 PR；
- 对于社区重大决定的投票权；
- Review 社区的 PR；

**权限**

- Pull Request review 权限；
- Pull Request approve 权限；

**认证、运营宣传**

- 在Discussion区颁发电子证书

示例： [Welcome new committer: Zhang Li Bin](https://github.com/mosn/layotto/discussions/352)
  
- 邮寄实体证书

- 公众号宣传

示例：

[恭喜 张立斌 成为 Layotto committer！](https://mp.weixin.qq.com/s/no6mDymNEGxH3uoZbl1YTQ)

[恭喜 赵延 成为 SOFAJRaft committer！](https://mp.weixin.qq.com/s/BKJ0bcaGBeYNErDhpjk42Q)

### PMC

项目管理委员会，为项目核心管理团队，参与 roadmap 制定与社区相关的重大决议；

**如何成为 PMC：**

由项目的PMC Member为某位Committer提名，然后PMC 投票，投票过半即可晋升为PMC Member

**职责：**

- 积极参与社区讨论，对社区重大决策给予指导；
- 负责保证开源项目的社区活动都能运转良好；

**权限：**

- Pull Request review 权限；
- Pull Request approve 权限；
- Merge 权限；

### User Group（社区层面）

#### Community Leader

**如何成为 Community Leader：**

由已有的 PMC 推荐，参与 SOFAStack 布道，必须满足以下两个以上条件：

- 成为社区成员时间超过三个月，并三个月内保持活跃；
- 原创 SOFAStack 相关文章并发布数达到3篇以上；
- 至少代表 SOFAStack，参与大会、Meetup 等分享一次；

**职责**

- 社区咨询支持；
- 积极响应指派给您的文章或分享；
- 对于社区重大决定的投票权；

**权利**

- 可以对社区运营方向建议以及推进；
- 获得 SOFAStack 布道师勋章；

#### Ambassador

**如何成为 Ambassador：**

- 原创 SOFAStack 相关文章并成功发布一篇以上。

**职责：**

- 积极响应社区内提问；

**权利：**

- 获得 SOFAStack 相关周边。

### 城市站社区管理者

**如何成为城市站社区管理者：**

- 只要你对 SOFAStack 有热情，愿意为 SOFAStack 的布道贡献自己的一份力，一次及以上参与社区线下共建；

**职责：**

- 主导 SOFAStack 城市站线上线下活动，包括但不限于 SOFAMeetup、SOFAChannel 等形式；
- 参与 SOFAStack 城市布道；

**权利：**

- 认证成为 SOFAStack 城市站社区管理者，获得相关证书；
- 获得 SOFAStack 相关运营周边支持；
- 获得 SOFAStack 运营以及内容支持；
