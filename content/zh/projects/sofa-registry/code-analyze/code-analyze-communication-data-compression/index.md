---
title: "源码解析｜通讯数据压缩"
author: "Carver_007"
authorlink: "https://github.com/czbcxy"
description: "源码解析｜通讯数据压缩"
categories: "SOFAStack"
tags: [“源码解析”]
date: 2022-03-30T15:00:00+08:00
---

> 为了支撑超大规模集群以及大内容传输的支持，增加传输效率，减少网络带宽，考虑对消息进行压缩处理，SOFARegistry 的 data 和 session 以及 session 和 client (目前只有 go 支持）添加了对压缩数据传输的支持，同时增加缓存来减少压缩带来的较高的 cpu 的消耗。

### SOFARegistry 通讯默认支持了哪些压缩算法
>
> 目前 SOFARegistry 默认支持了 gzip 和 zstd 两种压缩算法。
> _gzip 是目前使用最广泛，压缩比较高的一种压缩算法。_
> _zstd 是由 Facebook 的 Yann Collet 开发的一个无损数据压缩算法，Zstandard 在设计上与 DEFLATE（.zip、gzip）算法有着差不多的压缩比，但是相比 gzip 有更高的压缩和解压缩速度。_

#### 两种压缩的基本实现代码如下

![image.png](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*ReTbS76_HCQAAAAAAAAAAAAAARQnAQ)

#### 整体结构如下如

![image.png](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*DlRSRKZAOpoAAAAAAAAAAAAAARQnAQ)

CompressUtils 工具类采用静态 Map 对象（compressorMap），以编码方式为 key，以具体编码对应的压缩对象为 value 进行装载，然后待其使用的时候通过编码方式进行获取对应的编码对象实现类。
启动的时候装载到一个 Map 对象，key 为上图的两种编码常量，value 为具体实现类。当需要压缩的时候通过一下 find 方法或者重载方法进行获取具体压缩对象。代码如下：

![image.png](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*i6JST5bIJPwAAAAAAAAAAAAAARQnAQ)

### 缓存的使用

由于压缩和解压缩的对资源的消耗极大，SOFARegistry 采用了 Google 的 Guava 缓存来提升部分性能，当需要获取压缩的时候首选从缓存中获取，缓存中没有, 才进行压缩操作，同时将压缩结果缓存起来，以便下次获取的时候能直接获取。 具体代码细节参考如下：

> 小注：默认采用 hession 进行序列化

![image.png](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*_cgLR4GynqkAAAAAAAAAAAAAARQnAQ)

![image.png](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*I0GXQbzqIfoAAAAAAAAAAAAAARQnAQ)

![image.png](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*s0Y7RqHuNKcAAAAAAAAAAAAAARQnAQ)

### 3.数据推送以及通讯两端的数据协商机制

发送端压缩对象的选择由订阅者接收端配置信息决定，所以可以保证发送端和接收端的压缩格式的统一。

![image.png](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*oyryQ4_rY00AAAAAAAAAAAAAARQnAQ)

![image.png](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*8teQS5XYHoIAAAAAAAAAAAAAARQnAQ)

### 小结

SOFARegistry 是一种定位大型金融级分布式注册中心，数据通信定位偏向于大数据包大流量，因此对于数据传输效率和数据安全较为关注，采用高效的压缩方式，能有效的增加传输效率和使用安全性。目前支持的两种压缩方式都是市面上主流的压缩算法，同时配合这缓存的机制，极好的解决了大数据包带来大流量对网络带宽的压力，因此非常适合大型项目，但是相较于小型项目，这种压缩机制就显得很多余，压缩带来较高的 cpu 压力，因此 SOFARegistry 同时支持关闭压缩传输方式，以支持一些小型项目，具体使用根据业务来定。
