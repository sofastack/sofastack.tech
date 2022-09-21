---
author: "SOFA 团队"
date: 2022-09-14T15:00:00+08:00
title: "SOFATalk#1 SOFARegistry 源码解析：推送延迟 trace"
tags: ["SOFATalk","SOFARegistry","源码解析"]
cover: "https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*8O_ZQq76vxcAAAAAAAAAAAAAARQnAQ"
categories: "SOFATalk"
description: "2022 年 9 月 14 日 19：00 - 20：00  ，Talk 第 1 期。"
---

## 概要

- 活动主题：SOFATalk#1 SOFARegistry 源码解析：推送延迟 trace
- 活动时间：09 月 14 日，周三晚 19 点
- 活动形式：线上直播
- 直播回放：[点击观看](https://www.bilibili.com/video/BV1ug41127Bx/?vd_source=65cf108a3fb8e9985d41bd64c5448f63)
- 资料下载：[戳这里](https://gw.alipayobjects.com/os/bmw-prod/ba8a0bc7-1070-4a4f-886b-d0fea084365e.pdf)
- 查看文章：[SOFARegistry 源码解析｜推送延迟 tracre](https://www.sofastack.tech/projects/sofa-registry/code-analyze/code-analyze-push-delay-trace/)

## 介绍

### | SOFATalk

`<SOFA:Talk/>` SOFATalk 系列活动是 SOFAStack 社区开展的全新直播栏目，与以往的直播不同的是，SOFATalk 为大家搭建了一个更加自由开放的交流环境，参与者不仅可以在直播间发送弹幕讨论，还能够进入钉钉会议与嘉宾直接连麦讨论！茶余饭后，跟着 SOFA Talk 一下～

### | SOFATalk#1 SOFARegistry 源码解析：推送延迟 trace

对于分布式注册中心，整个推送过程涉及到很多的流程和节点。如何计算从发布端变更到广播给全集群所有的订阅方的延迟？以及每个阶段的延迟分别是多少？这对排查集群内部的问题及注册中心的负载具有比较大的价值，因此需要对整个推送过程进行延迟链路跟踪。

### | 加入 SOFA 钉钉互动群

欢迎加入直播互动钉钉群：44858463（搜索群号加入即可）

## 分享嘉宾

- 张晨

- SOFARegistry Contributor，开源爱好者。

## 嘉宾海报

>![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*-NFTR6z3POgAAAAAAAAAAAAAARQnAQ)

## 了解更多技术干货

使用钉钉搜索群号：**44858463**，即可加入，获取一手开源技术干货；或微信扫码关注“金融级分布式架构”微信公众号👇

![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*tvfDQLxTbsgAAAAAAAAAAAAAARQnAQQ)
