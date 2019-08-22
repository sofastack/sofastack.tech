---
author: "潘潘"
date: 2019-07-08T16:10:00+08:00
title: "SOFAChannel#7：扩展 Kubernetes 实现金融级云原生发布部署 - 自定义资源 CAFEDeployment 的背景、实现和演进"
tags: ["SOFAChannel","CAFEDeployment"]
cover: "https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1562661745338-383eac84-8e5e-43e3-9ab7-e3d93690e8af.jpeg"
categories: "SOFAChannel"
description: "7 月 18 日周四晚 7 点，线上直播第 7 期。"
---

## 概要

- 活动主题：SOFAChannel#7：扩展 Kubernetes 实现金融级云原生发布部署 - 自定义资源 CAFEDeployment 的背景、实现和演进
- 活动时间：7 月 18 日周四晚 7 点
- 活动形式：线上直播
- [直播视频回顾](https://tech.antfin.com/community/live/737)
- [直播回顾文章](https://www.sofastack.tech/blog/sofa-channel-7-retrospect/)

## 介绍

### | SOFAChannel

`<SOFA:Channel/>` 有趣实用的分布式架构频道：前沿技术、直播 Coding、观点“抬杠”，多种形式。 

`<SOFA:Channel/>` 将作为 SOFA 所有在线内容的承载，包含直播/音视频教程，集中体现 SOFAStack 的能力全景图。

### | SOFAChannel#7：扩展 Kubernetes 实现金融级云原生发布部署 - 自定义资源 CAFEDeployment 的背景、实现和演进

在 6 月 KubeCon 大会期间，蚂蚁金服正式宣布加入了 CNCF 成为黄金会员，同时 SOFAStack-CAFE 云应用引擎产品也通过了 K8S 一致性认证，旨在向广大金融机构提供云原生的可落地路径。

为满足金融级云原生发布部署、变更管控场景对于可灰度、可监控、可应急的需求，SOFAStack 产品研发团队在 Kubernetes 基础上实现了自定义资源 CAFEDeployment ，它能够通过可靠而灵活的分发、风险控制的部署策略以及高性能的原地升级更新扩展部署能力。它尤其消除了金融服务行业所面临的技术障碍，使用户能够专心发展核心业务。

与 Kubernetes 原生工作负载对象 Deployment 所提供的简洁轻量的滚动发布相比，CAFEDeployment 旨在满足金融场景对分批发布、多活容灾、原地升级等方面的诉求。

7 月 18 日周四晚 7 点，将邀请 蚂蚁金服 SOFAStack-CAFE 云应用引擎 容器应用服务研发负责人 枫晟 为大家分享《**扩展 Kubernetes 实现金融级云原生发布部署 - 自定义资源 CAFEDeployment 的背景、实现和演进》**。

在此次分享中，将介绍对此 Kubernetes 扩展能力的相关观点主张、产品探索和实际演示。

### | 加入 SOFA 钉钉互动群

欢迎加入直播互动钉钉群：23195297（搜索群号加入即可）

### | 点击即可报名

<https://tech.antfin.com/community/live/737>

## 议程

### 19:00-19:05  主持人开场

SOFAGirl 主持人

### 19:05-20:00  扩展 Kubernetes 实现金融级云原生发布部署 - 自定义资源 CAFEDeployment 的背景、实现和演进

枫晟 蚂蚁金服 SOFAStack-CAFE 云应用引擎 容器应用服务研发负责人

### 本期分享大纲：

- Kubernetes Deployment 发展历史与现状
- Kubernetes Deployment 在互联网金融云场景下的问题与挑战
- CafeDeployment 适配互联网金融发布的工作负载
- CafeDeployment 的运行机制
- CafeDeployment 功能演示

## 嘉宾

- SOFAGirl  主持人
- 枫晟 蚂蚁金服 SOFAStack-CAFE 云应用引擎 容器应用服务研发负责人

![SOFAChannel#7](https://cdn.nlark.com/yuque/0/2019/jpeg/226702/1562656413756-e6659edf-263d-4756-8cf2-4533b5f824aa.jpeg)