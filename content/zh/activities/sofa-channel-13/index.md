---
author: "潘潘"
date: 2020-03-16T17:00:00+08:00
title: "SOFAChannel#13：云原生网络代理 MOSN 的多协议机制解析"
tags: ["SOFAChannel","MOSN"]
cover: "https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1584350858191-cb9a29fd-c5a0-48dd-a1da-498bc7333a06.jpeg"
categories: "SOFAChannel"
description: "3 月 26 日周四晚 7 点，线上直播第 13 期。"
---

## 概要

- 活动主题：SOFAChannel#13：云原生网络代理 MOSN 的多协议机制解析

- 活动时间：3 月 26 日周四晚 7 点

- 活动形式：线上直播

- 直播回顾：[戳这里](https://tech.antfin.com/community/live/1131)

## 介绍

### | SOFAChannel

`<SOFA:Channel/>` 有趣实用的分布式架构频道，前沿技术、直播 Coding、观点“抬杠”，多种形式。

`<SOFA:Channel/>` 将作为 SOFA 所有在线内容的承载，包含直播/音视频教程，集中体现 SOFAStack 的能力全景图。

### | SOFAChannel#13：云原生网络代理 MOSN 的多协议机制解析

作为云原生网络代理，Service Mesh 是 MOSN 的重要应用场景。随着 Service Mesh 概念的日益推广，大家对这套体系都已经不再陌生，有了较为深入的认知。但是与理论传播相对应的是，生产级别的大规模落地实践案例却并不多见。这其中有多方面的原因，包括社区方案饱受诟病的“大规模场景性能问题”、“配套的运维监控基础设施演进速度跟不上”、“存量服务化体系的兼容方案”等等。

现实场景中，大部分国内厂商都有一套自研 RPC 的服务化体系，属于「存量服务化体系的兼容方案」中的协议适配问题。为此，MOSN 设计了一套多协议框架，用于降低自研体系的协议适配及接入成本，加速 Service Mesh 的落地普及。本次演讲将向大家介绍 MOSN 实现多协议低成本接入的设计思路，以及相应的快速接入实践案例。

本期为 SOFAChannel 线上直播第 13 期，将邀请蚂蚁金服技术专家& MOSN Committer 无钩分享《云原生网络代理 MOSN 的多协议机制解析》。

### | 加入 SOFA 钉钉互动群

欢迎加入直播互动钉钉群：21992058（搜索群号加入即可）

### | 点击即可报名

<https://tech.antfin.com/community/live/1131>

## 议程

### 19:00-19:05  主持人开场

SOFAGirl 主持人

### 19:05-20:00  蚂蚁金服分布式事务实践解析

无钩 蚂蚁金服技术专家 MOSN Committer

### 本期分享大纲

- 一个请求的 MOSN 之旅
- 如何在 MOSN 中接入新的协议
- SOFABolt 协议接入实践
- 未来发展：统一路由框架

## 嘉宾

- SOFAGirl  主持人
- 无钩 蚂蚁金服技术专家 MOSN Committer
