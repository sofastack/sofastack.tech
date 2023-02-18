---
title: "Tengine + BabaSSL ，让国密更易用！"
author: "杨洋"
authorlink: "https://github.com/sofastack"
description: "Tengine + BabaSSL ，让国密更易用！"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2022-01-11T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*Vb3fRq8fMagAAAAAAAAAAAAAARQnAQ"
---

文｜杨洋（花名：凯申 )

蚂蚁集团高级技术专家

负责密码学工程能力建设、BabaSSL 开源社区建设

本文 2366 字 阅读 5 分钟

近日，国内著名 Web 服务器和反向代理开源软件 Tengine[BabaSSL](https://tengine.taobao.org) 完成了对 [BabaSSL](https://www.babassl.cn)的适配工作。

Tengine 对 BabaSSL 提供的特殊 API 进行了适配，并增加对 NTLS 相关能力的支持。

「详细 Pull Request 请见」：[https://github.com/alibaba/tengine/pull/1595](https://github.com/alibaba/tengine/pull/1595)

至此，对我国密码行业相关安全通信协议，有使用需求的用户可以直接使用 Tengine + BabaSSL 的组合。而无需额外的 patch 或者代码改动，从用户使用的角度进一步提升了便利性。

## PART. 1 NTLS

目前，我国密码行业中有两个主要的通信协议相关的技术标准。一个是由信安标委于 2020 年发布的 TLCP 协议，即传输层密码协议；另外一个则是由密标委在 2012 年发布的 GM/T 0024《SSL VPN 技术规范》（以下简称 0024）。

TLCP 和 0024 的具体内容差别不大，均是从 TLS 协议发展而来，他们的主要特点是将商用密码算法 SM2、SM3 和 SM4 应用到了 TLS 协议中，并使用 SM2 密钥交换机制替换掉了 TLS 协议原有的密钥交换流程。

TLCP 和 0024 另外一个显著的特点将 TLS 协议中使用的数字证书拆分成了加密和签名两种用途的证书，加密证书和签名证书以及对应私钥均需要进行配置使用，所以 TLCP 和 0024 也俗称“国密双证书”协议。

BabaSSL 对上述国密双证书协议进行了支持，并统称为 NTLS。

NTLS 的全名为 National TLS，即我国核准的传输层安全协议，所以也可以叫做国密 TLS。

由此可见，NTLS 并不是指某一种具体的符合商用密码相关技术标准要求的网络协议，而是多个协议的统称。在 BabaSSL 中代指 TLCP 和 0024 国密双证书协议，因为 NTLS 和标准 TLS 协议存在工作方式的不同，因此 BabaSSL 中增加了一些新的 API 来对其进行支持。而应用程序若想使用 NTLS 功能，就需要调用这些新增 API，给现有基于 OpenSSL API 进行适配的应用程序带来了额外的开发工作量。

## PART. 2 Tengine + BabaSSL

Tengine 是由淘宝网发起的 Web 服务器项目，它在 Nginx 的基础上，针对大访问量网站的需求，添加了很多高级功能和特性。

Tengine 的性能和稳定性已经在大型的网站(如淘宝网，天猫商城等)得到了很好的检验。它的最终目标是打造一个高效、稳定、安全、易用的 Web 平台。

Tengine 作为国内知名的开源 Web 服务器软件，在各领域均得到了广泛的使用且享有很高的知名度。

BabaSSL 是一款轻巧、灵活且靠谱的密码学和 TLS 协议工具集。BabaSSL 是蚂蚁集团和阿里集团的各主要业务中所使用的底层密码库，目前开源出来供业界使用。BabaSSL 广泛的应用在包括网络、存储、移动端 App 等场景中。

Tengine 来源于 Nginx，所以默认使用的是 OpenSSL。此次 Tengine 针对 BabaSSL 中的 NTLS 功能进行了适配，用户如果选择使用 BabaSSL 作为 Tengine 的底层密码库来实现通信加密的能力，则可以无需对 Tengine 进行任何代码改动，原生开启 NTLS 能力。

## PART. 3 Tengine 启用 NTLS

具体来说，此次在 Tengine 中增加了几个新的指令，对 NTLS 进行支持。

### 1. 下载 BabaSSL 和 Tengine 

- 前往 👇 下载 BabaSSL 的源代码包:

[https://github.com/BabaSSL/BabaSSL/releases](https://github.com/BabaSSL/BabaSSL/releases)

- 前往 👇 获取 Tengine 的最新代码:

「git clone」

[https://github.com/alibaba/tengine.git](https://github.com/alibaba/tengine.git)

### 2. 编译 BabaSSL 和 Tengine

使用如下配置：

```java
./configure --add-module=modules/ngx_openssl_ntls \
    --with-openssl=../path/to/BabaSSL \
    --with-openssl-opt="--strict-warnings enable-ntls" \
    --with-http_ssl_module --with-stream \
    --with-stream_ssl_module --with-stream_sni
```

### 3. 配置 Tengine 开启 NTLS 

一个开启了 NTLS 的 Tengine 配置文件的例子：

```java
worker_processes  1;
events {
    worker_connections  1024;
}
http {
    include       mime.types;
    default_type  application/octet-stream;
    server {
        listen       443 ssl;
        server_name  localhost;
        enable_ntls  on;
        ssl_sign_certificate        server_sign.crt;
        ssl_sign_certificate_key    server_sign.key;
        ssl_enc_certificate         server_enc.crt;
        ssl_enc_certificate_key     server_enc.key;
        location / {
            return 200 "body $ssl_protocol:$ssl_cipher";
        }
    }
}
stream {
     server {
        listen       8443 ssl;
        enable_ntls  on;
        ssl_sign_certificate        server_sign.crt;
        ssl_sign_certificate_key    server_sign.key;
        ssl_enc_certificate         server_enc.crt;
        ssl_enc_certificate_key     server_enc.key;
        return "body $ssl_protocol:$ssl_cipher";
    }
}
```

### 4. 测试 NTLS 

可以使用 BabaSSL 的 s_client 工具对开启了 NTLS 的 Tengine 进行测试。

「具体可以参考」：

[https://babassl.readthedocs.io/zh/latest/Tutorial/SM/ntls/](https://babassl.readthedocs.io/zh/latest/Tutorial/SM/ntls/)

## PART. 4 总 结

随着互联网业务的发展，在新时期下，数据成为了影响人们正常生活的核心要素。

因此数据安全和个人信息保护等问题变得更加需要重视，国家近期也针对数据安全领域进行了相关立法。

密码学技术作为整个信息安全领域的基础技术能力，对数据安全也存在着很大的影响。同时密码行业是属于受到国家强监管的行业，其相关技术的应用和实施均有一定的特殊性。

BabaSSL 作为一个开源的密码库，其核心目标之一就是为用户提供合规的技术能力，使得用户在符合要求的情况下可以更加便捷的将国家核定的技术标准应用起来。从而在满足技术合规的要求，也同时实现了对数据安全需求的达成。

Tengine 作为国内著名的 Web 服务器和反向代理开源软件，在国内各行业的应用十分广泛，同时也是网络通信领域中实现对数据进行加密的关键开源软件。此次 Tengine 官方对 BabaSSL 进行适配和支持，让用户可以更加便捷的使用 BabaSSL 所提供的商用密码能力，也必将进一步的扩大各行业对商用密码算法的应用落地。

BabaSSL 在未来会持续在技术合规和前沿密码学等方向上持续演进，给广大用户带来高效、易用、安全、稳定的密码学基础库。

BabaSSL 的代码目前托管在 Github 上：[https://github.com/BabaSSL/BabaSSL](https://github.com/BabaSSL/BabaSSL)

欢迎广大开发者积极参与到 BabaSSL 的建设中，为我国密码行业的发展壮大贡献力量！

## 本周推荐阅读

[TLS 握手带宽直降 80%，BabaSSL 是怎么做到的](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247498688&idx=1&sn=7379528f786e0e35db67d1ce7576b5c4&chksm=faa3141acdd49d0ce56d580cc1ea32347c04ecfa1503198c1ec8ce5614ead2bd8169a737250c&scene=21)

[RFC8998+BabaSSL---让国密驶向更远的星辰大海](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247490428&idx=1&sn=8ca31baa5c99e0790cdee8a075a7c046&chksm=faa0f4a6cdd77db07f3fb1149b7f6505fe6b8eca5b2e2a724960aee76d9667e3e970c44eef5a&scene=21)

[还在为多集群管理烦恼吗？OCM来啦！](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247490574&idx=1&sn=791b8d49759131ea1feb5393e1b51e7c&chksm=faa0f3d4cdd77ac2316b179a24b7c3ac90a08d3768379795d97c18b14a9c69e4b82012c3c097&scene=21)

[一行降低 100000kg 碳排放量的代码！](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247499661&idx=1&sn=7c609883a7fd3b6f738bd0c13b82d8e5&chksm=faa31057cdd49941e00d39e0df6dd2e8c91050c0cb33bad124983cd8d732c6f5f2fc0bbdba49&scene=21)

![img](https://gw.alipayobjects.com/zos/bmw-prod/75d7bde6-1f48-4f28-80a4-215f8ec811bd.webp) 
