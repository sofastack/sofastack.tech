---
author: "潘潘"
date: 2020-04-17T17:00:00+08:00
title: "SOFAChannel#15：分布式链路组件 SOFATracer 埋点机制解析"
tags: ["SOFAChannel","SOFATracer"]
cover: "https://cdn.nlark.com/yuque/0/2020/jpeg/226702/1587624983028-cf812798-a686-4ea4-87c3-00810d69aa94.jpeg"
categories: "SOFAChannel"
description: "4 月 23 日周四晚 7 点，线上直播第 15 期。"
---

## 概要

- 活动主题：SOFAChannel#15：分布式链路组件 SOFATracer 埋点机制解析

- 活动时间：4 月 23 日周四晚 7 点

- 活动形式：线上直播

- 直播回顾：[戳这里](https://tech.antfin.com/community/live/1167)

## 介绍

### | SOFAChannel

`<SOFA:Channel/>` 有趣实用的分布式架构频道，前沿技术、直播 Coding、观点“抬杠”，多种形式。

`<SOFA:Channel/>` 将作为 SOFA 所有在线内容的承载，包含直播/音视频教程，集中体现 SOFAStack 的能力全景图。

### | SOFAChannel#15：分布式链路组件 SOFATracer 埋点机制解析

SOFATracer 是蚂蚁金服开源的基于 [OpenTracing 规范](http://opentracing.io/documentation/pages/spec.html) 的分布式链路跟踪系统，其核心理念就是通过一个全局的 TraceId 将分布在各个服务节点上的同一次请求串联起来。通过统一的 TraceId 将调用链路中的各种网络调用情况以日志的方式记录下来同时也提供远程汇报到 [Zipkin](https://zipkin.io/) 进行展示的能力，以此达到透视化网络调用的目的。

### | 加入 SOFA 钉钉互动群

欢迎加入直播互动钉钉群：30315793（搜索群号加入即可）

### | 点击即可报名

<https://tech.antfin.com/community/live/1167>

## 议程

### 19:00-19:05  主持人开场

SOFAGirl 主持人

### 19:05-20:00  分布式链路组件 SOFATracer 埋点机制解析

卫恒 SOFATracer 开源负责人

### 你将收获

- 带你快速上手 SOFATracer；
- SOFATracer 功能点详细介绍；
- SOFATracer 埋点机制原理详解；

## 嘉宾

- SOFAGirl  主持人
- 卫恒 SOFATracer 开源负责人
