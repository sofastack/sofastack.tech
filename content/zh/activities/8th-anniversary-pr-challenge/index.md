---
title: "🦐 不办 Meetup，开挑战赛！SOFAStack PR Challenge | SOFAStack 8 周年"
authorlink: "https://github.com/sofastack"
description: "SOFAStack 8 周年， 我们决定玩点不一样的。今年我们不办 Meetup，开挑战赛！Ready? Let's hack with AI! ​🚀🦐"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2026-04-01T15:00:00+08:00
cover: "https://img.alicdn.com/imgextra/i4/O1CN01nQV4rg21PysXLl52c_!!6000000006978-0-tps-2001-1127.jpg"
---

**用 AI 搞定真实 Issue，成为 AI 时代的开源贡献者**

**SOFAStack 8 周年， 我们决定玩点不一样的**

**不办 Meetup，开挑战赛！**

![](https://img.alicdn.com/imgextra/i4/O1CN01nQV4rg21PysXLl52c_!!6000000006978-0-tps-2001-1127.jpg)

## 🦐 养虾修代码 —— SOFAStack PR Challenge

我们相信：**AI 不是替代开发者，而是让每个人都能成为贡献者。** 我们诚邀您，带着您最得力的 **AI Agent**​  *​  （Claude Code, Cursor, OpenClaw...）  ​*  来参与本次活动。用 AI 解决 SOFAStack 社区真实 issue，体验"人机协作"的全新开源参与方式。

## 📺 活动日历

* ​**活动入口**​：[https://sofastack.github.io/8th-anniversary-challenge/](https://sofastack.github.io/8th-anniversary-challenge/)
* ​**活动时间**​：2026 年 4 月 1 日-2026 年 4 月 25 日
* ​**周年庆 Peak 日**​：4 月 19 日​*（SOFAStack 8 周年生日 ​*​🎂*）*

## 🚀  活动指南

**​1. 选择任务：​**浏览带有以下标签的 issue

* `SOFA-8th-Challenge` - 本次活动专属任务
* `difficulty-easy` 或 `difficulty-medium` - 难度分级

**​2. 使用 AI 修复：​**使用 AI Agent 工具（*Claude Code、OpenClaw、Cursor 等*） 引导其理解背景、编写修复代码并进行人工验证。

**3. 提交 PR： ​** 标题统一为 `[AI-8th] 修复简述`，建议在 PR 描述中添加 ​**AI 协作记录**​， 分享你的调教心得

```plain
1## AI 协作记录
2- **使用的 AI 工具**：Claude Code / OpenClaw / 其他
3- **关键 Prompt**：简述你是如何描述问题的
4- **AI 主要贡献**：代码生成 / 调试优化 / 文档补充 / 其他
5- **人工验证步骤**：如何确认修复有效
6- **遇到的问题**：AI 搞不定的部分，如何解决的
```

**​4. 审核合并：​**等待 GitHub Action 机器人初审 + Maintainer 复审

## 🛠️ 挑战赛任务池

**本次活动涵盖 ​** SOFARegistry、SOFAJRaft、SOFARPC、SOFABoot 四个开源项目共 32 个 issue ，并划分了难度等级，大家可以选择适合自己的 issue 进行挑战。

​**参与建议**​：

🟢 **初学者**​​​ (Easy)​：从文档优化、工具类替换、版本升级入手，熟悉 AI Agent 的 Prompt 调教。

🟡🔴 **进阶者**​​​ (Medium /Hard )​：挑战内核并发、内存溢出修复或新特性实现，展示深度人机交互。

### SOFARegistry

🟢 **​Admin API 文档完善：​**增加 Session 自动控制攒批时长机制的说明文档

🟢 **​CacheCountTask 内存优化：​**优化 Publisher 统计信息时的 Map 申请逻辑，降低内存占用

[`>> 更多 Issue`](https://github.com/sofastack/sofa-registry/issues?q=state%3Aopen%20label%3A%22SOFA-8th-Challenge%22)

### **SOFAJRaft**

🟢 ​**清理项目未使用代码**​：全局清理 Unused Imports，提升代码整洁度

🟡 ​**修复潜在内存泄漏**​：从 Netty 同步 Recycler 实现以修复相关泄漏问题

[`>> 更多 Issue`](https://github.com/sofastack/sofa-jraft/issues?q=state%3Aopen%20label%3A%22SOFA-8th-Challenge%22)

### **SOFARPC**

🟢 ​**AI 辅助文档优化**​：使用 AI 翻译和优化文档，并提供可运行示例

🔴 ​**TripleX 多协议传输支持**​：挑战 Triple 协议在 H1/H2/H3 上的全栈运行

[`>> 更多 Issue`](https://github.com/sofastack/sofa-rpc/issues?q=state%3Aopen%20label%3A%22SOFA-8th-Challenge%22)

### **SOFABoot**

🟢 ​**Spring Boot 版本升级**​：将底层框架平滑升级至 Spring Boot 3.5.12

🟡 ​**运行时诊断端点**​：新增 SofaDiagnosticEndpoint 辅助线上问题排查

[`>> 更多 Issue`](https://github.com/sofastack/sofa-boot/issues?q=state%3Aopen%20label%3A%22SOFA-8th-Challenge%22)

## 🏆 荣誉奖项

🥇 ​**高产奖**​​（3位）：合并 PR 数量 Top 3

🥈 ​**高质奖**（3位）​：修复最优雅、逻辑最硬核的 PR

📝 ​**最佳工作流奖**​​（3位）：分享“调教 AI 修代码”深度经验的优质作者

🎁 ​**锦鲤奖**​​（5位）：成功参与的新人中随机抽取

![](https://img.alicdn.com/imgextra/i3/O1CN019CyTRw20qiNiLUJBR_!!6000000006901-2-tps-1200-1200.png)

## ⚠️ 活动守则

* ​**有效 PR**​：仅针对带 `SOFA-8th-Challenge` 标签的 issue 提交才计入统计
* ​**质量门槛**​：机器人初审不通过*​（如无法编译或通过 CI 、Lint 规范检查等）​*将被直接关闭
* ​**版权说明**​：参与者需确保代码无版权争议，最终解释权归SOFAStack 社区所有

### 💬 有问题？ 进群聊！

欢迎加入 SOFAStack 用户群

![](https://img.alicdn.com/imgextra/i3/O1CN01nNH1DF1ZJHqe3FtsP_!!6000000003173-2-tps-348-346.png)

【钉钉群号： 88800020698】

---

**Ready? Let's hack with AI! ​🚀🦐**
