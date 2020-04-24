---
author: "潘潘"
date: 2020-03-27T17:00:00+08:00
title: "SOFAChannel#14：云原生网络代理 MOSN 的扩展机制解析"
tags: ["SOFAChannel","MOSN"]
cover: "https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1585544894349-8be1db03-e0ab-4569-9c66-53ba2079d6dd.jpeg"
categories: "SOFAChannel"
description: "4 月 9 日周四晚 7 点，线上直播第 14 期。"
---

## 概要

- 活动主题：SOFAChannel#14：云原生网络代理 MOSN 的扩展机制解析

- 活动时间：4 月 9 日周四晚 7 点

- 活动形式：线上直播

- 直播回顾：[戳这里](https://tech.antfin.com/community/live/1152)

## 介绍

### | SOFAChannel

`<SOFA:Channel/>` 有趣实用的分布式架构频道，前沿技术、直播 Coding、观点“抬杠”，多种形式。

`<SOFA:Channel/>` 将作为 SOFA 所有在线内容的承载，包含直播/音视频教程，集中体现 SOFAStack 的能力全景图。

### | SOFAChannel#14：云原生网络代理 MOSN 的扩展机制解析

MOSN 是一款使用 Go 语言开发的网络代理软件，由蚂蚁金服开源并经过几十万容器的生产级验证。

MOSN 作为云原生的网络数据平面，旨在为服务提供多协议，模块化，智能化，安全的代理能力。在实际的生产使用场景中，通用的网络代理总会与实际业务定制需求存在差异，MOSN 提供了一系列可编程的扩展机制，就是为了解决这种场景。

本次分享将向大家介绍 MOSN 的扩展机制解析以及一些扩展实践的案例。

欢迎先下载 Demo，提前体验 MOSN 拓展机制的使用，成功完成预习作业—— Demo 完整操作的，有机会获得小礼物哟（记得留下完成的证明，获得方式在直播中公布），我们将在直播中公布答案——进行 Demo 的详细演示。PS：在直播中也会发布闯关任务，完成闯关任务也有机会获得小礼物哟～

Demo：[https://github.com/mosn/mosn/tree/master/examples/codes/mosn-extensions](https://github.com/mosn/mosn/tree/master/examples/codes/mosn-extensions)

Demo Readme：[https://github.com/mosn/mosn/tree/master/examples/cn_readme/mosn-extensions](https://github.com/mosn/mosn/tree/master/examples/cn_readme/mosn-extensions)

欢迎了解 MOSN：[https://github.com/mosn/mosn](https://github.com/mosn/mosn)

### | 针对人群

对云原生、Service Mesh、网络代理有基本了解，想要了解云原生以及对云原生网络代理 MOSN 有二次开发需求的人群

### | 加入 SOFA 钉钉互动群

欢迎加入直播互动钉钉群：21992058（搜索群号加入即可）

### | 点击即可报名

<https://tech.antfin.com/community/live/1131>

## 议程

### 19:00-19:05  主持人开场

SOFAGirl 主持人

### 19:05-20:00  蚂蚁金服分布式事务实践解析

永鹏  蚂蚁金服高级开发工程师， MOSN Committer

### 你将收获

- 快速了解 MOSN 的多种扩展能力
- 3 个案例，实际体验 MOSN 扩展能力
- 多案例多形式，使用 MOSN 实现个性化业务需求

## 嘉宾

- SOFAGirl  主持人
- 永鹏  蚂蚁金服高级开发工程师， MOSN Committer
