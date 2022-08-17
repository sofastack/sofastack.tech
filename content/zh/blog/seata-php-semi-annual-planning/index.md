---
title: "Seata-php 半年规划"
authorlink: "https://github.com/sofastack"
description: "让 PHPer 也能使用 seata-php 来实现分布式事务"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2022-08-16T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*pKjuT5TGEdAAAAAAAAAAAAAAARQnAQ"
---

![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*hTloRpjaIwsAAAAAAAAAAAAAARQnAQ)

文｜

赵新（花名：于雨)：蚂蚁集团 Seata 项目开源负责人、开放原子开源基金会代码贡献之星

郭成（花名：星北)：Seata-php 项目共同发起人、蚂蚁集团技术专家

刘岳健：Seata-php 项目共同发起人、Hyperf 开发组成员、广东快客电子商务有限公司高级后端工程师

**本文 5894 字 阅读 12 分钟**

## 导语

通俗地讲，seata-php 是 Seata  的 PHP 语言实现，它实现了 Java 和 PHP 之间的互通，让 PHPer 也能使用 seata-php 来实现分布式事务。

Seata 是一个非常成熟的分布式事务框架，在 Java 领域是事实上的分布式事务技术标准平台。Seata 目前正在构建其多语言体系[1]，整个体系包含了目前常用的五大类语言：Java、Go、Python、JS 和 PHP。目前的态势是后四种语言都依据 Seata Java 版本构建起对应语言的实现。

除了追求 Seata 多语言体系过程中因为开源价值要求构建  Seata 的 PHP 版本这个原因外，作为构建起 Web 1.0 时代技术基础 LAMP 架构中的要角，PHP 语言在电商和金融交易场景下依然被广泛使用。而这些场景对数据一致性要求非常强烈，这是构建 seata-php 最大的诱因，也是其技术价值所在。

## PART. 1--Seata 架构与多语言体系

![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*vzZsQK6Q9MoAAAAAAAAAAAAAARQnAQ)

> 图片来自 Seata 官网

Seata 总体架构由如下角色构成：

**- 事务协调器 Transaction Coordinator**

简称 TC，维护全局事务和分支事务的状态，驱动全局事务提交或者回滚。

**- 事务管理器 Transaction Manager**

简称 TM，定义全局事务的范围，提交或者回滚全局事务。

**- 资源管理器 Resource Manager**

简称 RM，和分支事务在同一个应用，进行分支事务的注册，报告分支事务的状态，驱动分支事务的提交或者回滚。

从 C/S 通信架构角度来看，TC 是服务端，TM 和 RM 是客户端。TC 与 TM 以及各个 RM 之间使用 Netty 框架进行长链接通信。具体而言，Seata Java 版本的通信协议是在四层 TCP 协议之上又定义了一套私有的二进制双向通信协议，通信框架使用了 Netty。其他四种语言只要依据 Seata 的通信协议标准实现其通信功能，即可在多语言生态体系内任何语言之间进行通信和服务调用。

三个角色中，TM 和 RM 以 SDK API 形式供上层 APP 调用，而 TC 是独立进程部署，使用任何语言实现都可以。据说懒惰是程序员的第一美德，在 Seata Java 已经实现了 Java 版本的 TC 的情况下，多语言体系内其他语言就没必要再做重复工作，只需要构建其对应语言的 TM 和 RM 的 SDK API 包，与 Seata Java TC 通信即可。

## PART. 2--Seata 与 PHP 技术

分布式事务技术是微服务技术体系的一环，构建 Seata PHP 首先需要选择其微服务技术平台，seata-php 目前使用的微服务框架是 Hyperf。

PHP 在业界以入门门槛低著称，目前常用的微服务框架有 Laravel 以及在其上构建的 Lumen。Laravel 框架的最大优点就是其生态丰富，各种组件应有尽有，如果 Laravel 可以和 Spring 框架类比，Lumen 就是 Spring Boot。但其缺点是性能堪忧，例如在普通的 8C 机器上，空跑一个只运行 echo 逻辑的 HTTP 服务，其吞吐量仅有 1K QPS。

Hyperf 框架是近年内出现的由国人基于 Swoole 开发的一个微服务框架，特点如下：

**1.** 类似于 Nginx，Hyperf 以多进程形式常驻内存，每个进程内都有一个弹性线程池。正常情况下 Hyperf 收到调用请求后，可以保证 1ms 之内分配服务线程，而 Lumen 的响应时间常在 10ms 左右；

**2.** 因为 Hyperf 服务常驻内存的特点，其稳定性好，资源利用率当然比以 CGI 机制运行的 Lumen 低很多；

**3.** Hyperf 的对请求的处理过程借鉴了 Go 语言机制，其 runtime 层面以异步方式执行上层的用户同步调用，相比 Lumen 其吞吐率高而延迟低。例如在同样环境下使用 Hyperf 实现同样的 echo HTTP 服务，可以轻松达到 60K QPS；

除了 Hyperf 自身稳定性与高性能外，依赖于 Hyperf 服务进程常驻内存的特点，TC 可以很方便的对seata-php 的 RM 发起二阶段事务处理，即作为 Server 的 Java TC 对作为 Client 的 PHP 版本的 RM 发起 RPC 回调。如果使用 Lumen 作为 seata-php 的微服务框架，几乎不可能实现这个技术点。

## PART. 3--快速入门 seata-php

基于 Hyperf 微服务框架，seata-php 已经实现了 AT 事务模式，并给出了测试用例。本章节的目的是基于现有实现，让对 seata-php 这个项目感兴趣的同学能够快速入门 seata-php。

### 3.1--搭建 PHP 开发环境

使用 Hyperf/Box 这个工具能够快速创建开发环境，并且能够与其他自建开发工具链隔离，避免污染日常的开发环境。

#### 3.1.1 下载 Hyperf/Box

```
# Mac
wget https://github.com/hyperf/box/releases/download/v0.0.3/box_php8.1_x86_64_macos -O box
# Linux x86_64
wget https://github.com/hyperf/box/releases/download/v0.0.3/box_php8.1_x86_64_linux -O box
# Linux aarch64
wget https://github.com/hyperf/box/releases/download/v0.0.3/box_php8.1_aarch64_linux -O box

sudo mv ./box /usr/local/bin/box
sudo chmod +x /usr/local/bin/box

# 在 https://github.com/settings/tokens/new 创建 token 后，配置到 box 中
box config set github.access-token <Your Token>

```

**注意**：

**-** 如果你是 Mac 用户首次使用的话，需要在“系统偏好设置”-->“安全性与隐私”中给 Box 工具进行授权；

**-** 已经测试过，X86 的 Box，可以在 M1 版本的 Mac 上使用；

**-** 使用 Box 时，创建 GitHub access token 权限需要 repo、workflow。

#### 3.1.2 配置 PHP 环境

当 Box 下载好后，继续下载 PHP 8.0 版本

```
# 下载 php8.0
box get php@8.0
# 将 box 设置为 php8.0 版本
box config set-php-version 8.0
```

![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*Er48R6wqgWoAAAAAAAAAAAAAARQnAQ)

#### 3.1.3 下载 composer

```
# 下载 composer
box get composer
```

![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*AE2VR5oA4EAAAAAAAAAAAAAAARQnAQ)

### 3.2--运行 seata-php

环境搭建完毕过后，找一个目录来存放 seata-php 项目的代码。

```
# 找个地方创建一个目录
mkdir ./seata

# 进入到目录内
cd ./seata

# 下载 seata 骨架包
git clone https://github.com/PandaLIU-1111/seata-skeleton

# 下载 seata/seata-php 组件包
git clone git@github.com:seata/seata-php.git

# 进入到 seata骨架包内
cd seata-skeleton

# 执行 composer 更新项目内的组件包
composer update -o

# 查看是否与 seata/seata-php 建立软连接
ls -al vendor/hyperf/ | grep seata

# 查看命令执行后是否有以下内容
...
seata -> ../../../seata-php/  // 与 seata/seata-php 包建立软连接
...

# 启动项目
box php bin/hyperf.php start
```

![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*E0_5TL5ThukAAAAAAAAAAAAAARQnAQ)

至此，即可看到 seata-php 运行成功，在命令行中可以看到 seata-php 客户端与 Seata Java 服务端 TC 的交互报文。

### 3.3--项目代码风格

Seata-php 遵循 PSR-1 代码规范[2]。

社区提供了一个类似于 Go 语言 gofmt 一样的代码格式化工具——composer cs-fix，具体使用方式是：

```
# 格式化某个文件
composer cs-fix ${FileName}
# 格式化某个目录
composer cs-fix ${DirName}
```

### 3.4--测试用例

目前，seata-php 仅提供了单测用例，放置在项目 tests 目录中，可直接通过 composer test 命令执行这些单测用例。我们近期就会把这些单测用例配置在  GitHub action 上，用于测试每个提交的 PR。

下一步，我们会像 seata-go 一样补充集成测试用例，并配置在 GitHub action 上用于自动测试项目的每个 PR。

## PART. 4--下半年规划

Seata-php 目前已有的工作仅仅是迈出了下半年长征的第一步，尚未达到生产可用的状态。下半年的整体目标是：

**1.【事务模式】** 对齐将于 9 月份发布的 Seata Java v1.6.0 的 TCC、AT、SATA 和 XA 模式；

**2.【测试用例】** 单测覆盖率达 70% 以上，并实现两种模式下的 Seata Java 中已有的集成测试用例的 PHP 版本；

**3.【代码 samples】** 实现两种模式下的 Seata Java 中已有的 samples 示例的 PHP 版本；

**4.【文档建设】** 构建 API 接口级别的详细说明文档；

**5.【生产案例】** 实际生产用户 3 家以上；

**6.【社区建设】** 培养 Seata Committer 5 人以上。

上述目标可以理解为 seata-php 社区的 KPI。为达成目的，有可分为“三步走” 的如下执行 plan。

### 4.1--发布一个可用版本

这是第一个阶段。我们计划在国庆节前后发布第一个 GA 版本，详细的技术点如下：

**1. 实现 TM 与 RM**

作为分布式事务的发起方，TM 在与下游的微服务应用在通信时，能够在 HTTP 协议与 gRPC 协议中，传递事务上下文，下游的服务也可以随时加入到事务中。

**2. 实现分布式锁 API**

用于避免业务数据在一阶段与二阶段之间，由于并发被修改，导致二阶段提交、回滚失效。

**3. 实现 TCC 与 AT 模式**

**完全实现 TCC 模式** 。而 AT 模式依赖于具体的 DB 类型和 DB 版本，我们把 DB 限定为 MySQL v5.7，在此之上支持最基本的 INSERT 与 UPDATE 语句，基本可以完成大部分的实际应用场景覆盖。

**4. 支持注册中心**

支持注册中心的目的，是方便 TM 和 RM 对 TC 进行微服务发现。将会支持 File 与 Nacos 两种服务发现方式。

优先支持 File 服务发现方式。其好处是，在 K8s 环境下，可以通过环境变量或者是挂载 configmap，实现动态配置，不依赖人力变更。

其次支持 Nacos 作为注册中心的服务发现方式。目前，国内的阿里云、腾讯云、华为云等主流云厂商都支持 Nacos 注册中心，可以方便广大用户进行服务联通。

**5. 其他**

如自动化的单元测试，集成测试和项目的 samples。

社区已经将第一阶段涉及到的所有任务都作为 task 发布在 seata-php issue 上，可以方便的查看任务负责人，并及时跟踪项目进度 *（直接查看当前进度）* 。

### 4.2--技术能力全面对齐

这是半年目标的第二阶段。这个阶段产出的版本，将会是一个比较完善的版本，能够覆盖绝大部分的业务场景，降低开发者在使用 seata-php 的门槛与成本。关键技术点如下：

**1. 实现 XA 与 SAGA 模式**

除了补齐这两个模式外，还将继续完善 AT 模式支持的 SQL ，能够做到支持大部分的 SQL 语句。

**2. 支持配置中心**

支持配置中心的目的，是方便拉取事务相关的配置。初步计划支持 File、Nacos、Apollo 三种配置方式。

**3. 支持 gRPC**

计划于 9 月份发布的 Seata Java v1.6，将支持 gRPC 通信方式。Seata-php 在第二阶段也将支持这一 RPC 调动方式进行事务传播。

**4. 其他数据库**

首先支持更多的 MySQL 版本，如 v8.0。并支持 PostgreSQL、OceanBase、Redis 等更多类型的 DB。

**5. 事务异常处理**

提升分布式事务防悬挂的能力，自动处理请求幂等、空提交、空回滚、资源悬挂等事务异常逻辑。

第二阶段的时间节点的 deadline 大概是在本年 11 月底左右。

### 4.3--社区建设

前两个步骤，主要集中在 seata-php 自身的技术能力建设上。到此，seata-php 在技术上可以认为已经成熟。

这两个步骤的推进，首先依赖于社区自身的健康发展，毕竟开源项目的事情需要社区同学来推进。当下社区由 **于雨** 同学负责发展壮大，项目总体由 **星北** 同学来负责推进实施，目前已有代码 Contributor 4 人。

当然，我们欢迎更多的同学参与到 seata-php 的代码建设中来。提交 issue 和 PR 时，建议尽可能详尽的描述相关细节。比如：

**提交 bug issue 时**

**-** 标题可以写：bugfix:NotFoundClass Redis with PHP version is 7.2

**-** 内容可以提交 bug 的详细情况、发生现象的详细情况、对应的堆栈信息、预期的情况、以及当前的环境情况、发生的事、修复意见、以及补充的信息、当前的环境情况等信息。

**提交 PR 时**

**-** 标题可以写：Feature: AT mode need to support pgsql

**-** 内容可以写明：这个 Feature 的意义，以及期望的用法，还包括其他相关信息等。

这一步骤与前两个步骤相生相伴，同步进行。

## PART. 5--总结

Seata-php 有 Seata Java 这个标杆在，初期以推进代码进度为主。

作为一个开源项目，seata-php 的开源价值当然是在用户的生产环境使用起来，而生产用户也是社区建设的一部分。目前已有两家用户愿意在其开发测试环境对 seata-php 进行验证，帮助提升项目的稳定性、易用性和代码质量。

为保持项目和社区的健康可持续发展，开源项目的贡献者，不仅包含 coding 的代码贡献者，还应当包括进行文档贡献、产品宣传和品牌推广等方面的贡献者。我们将组织社区热心参与者在各大技术论坛发表博客，在语音、视频网站和技术大会上进行技术干货以及生产案例的推广宣传。欢迎对这些工作感兴趣的朋友加入社区钉钉群 **44788115** ，与我们联系沟通。

### 【参考文档】

1.《Seata 多语言体系建设》：[https://mp.weixin.qq.com/s/UwzscqfuCYtsSdWYj-t-uQ](https://mp.weixin.qq.com/s/UwzscqfuCYtsSdWYj-t-uQ)

2.《PHP PSR-1 代码规范》：[https://www.php-fig.org/psr/psr-1/](https://www.php-fig.org/psr/psr-1/)

### 本周推荐阅读

[Seata 在蚂蚁国际银行业务的落地实践](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247512945&idx=1&sn=006cc63f41c96a73b60ea7a11477310d&chksm=faa35cabcdd4d5bd910d44550bda12642de3baa61eea1a7c966387d53ca62afa63cc9f76ad66&scene=21)

[Seata 多语言体系建设](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247512283&idx=2&sn=179ef79e922a7c7475d5db288c9af96d&chksm=faa35f01cdd4d617ec9a818bdbe65b3581fa91e2f4b6162551bbacb93c11c0aef211bae8195e&scene=21)

[深入 HTTP/3（2）｜不那么 Boring 的 SSL](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247509738&idx=1&sn=6ad1f938181797999e003458fcc57dcc&chksm=faa34930cdd4c0262d79902d293ec15c6ce74903073a642fa28ab8d2272c25271b5347997e89&scene=21)

[Go 原生插件使用问题全解析](http://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247512138&idx=1&sn=851abb8d07d47f703e33978c9c125c59&chksm=faa35f90cdd4d6869c6cd4934c042484dbe1063c3fb85462d2f33e936b96240ae33d02d18c3a&scene=21)

欢迎扫码关注我们的公众号：

![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*OvOsRLqjPgQAAAAAAAAAAAAAARQnAQ)
