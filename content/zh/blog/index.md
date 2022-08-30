---
title: "Go 代码城市上云——KusionStack 实践"
authorlink: "https://github.com/sofastack"
description: "Go 代码城市上云——KusionStack 实践"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2022-08-30T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*zsfWSJblKAkAAAAAAAAAAAAAARQnAQ"
---

![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*hTloRpjaIwsAAAAAAAAAAAAAARQnAQ)

**导语**

KusionStack 是面向 Kubernetes 云原生场景的 IaC 配置代码化实践的开源一站式可编程协议栈。其基本思想是让「应用方+平台方」的同学能够共同基于 IaC 构建的 Konfig 模型库同一平面进行 DevOps 协同工作。今天我们和大家分享一个好玩的 Go 代码城市应用，以及 KusionStack 是如何一键将其部署到 K8s 云原生环境的。

**KusionStack 项目主仓库：**

[https://github.com/KusionStack/kusion](https://github.com/KusionStack/kusion)

**PART. 1**

**什么是代码城市（CodeCity）**

CodeCity 代码城市是瑞典工程师 Richard Wettel 开发的创意应用，可以通过类似数字城市的视觉形式展示和度量代码的复杂性。其效果如图：

![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*ZAgoSaGy-TEAAAAAAAAAAAAAARQnAQ)

在 3D 形式展示的代码城市中的中心地标非常直观——最大、最高的建筑总是容易追踪的焦点。因为这个极具特色的创意，CodeCity 获得了 2008 年的"Riconoscimento ated-ICT Ticino" 一等奖，同时也可以免费用于非商业的科研和学习用途。

今天要展示的 GoCity 是 Go 语言版本的代码城市，我们可以通过这种方式评估 KusionStack 等 Go 语言项目的代码复杂度。也可以通过在线的 GoCity 查看 KusionStack/kusion 仓库的展示效果。

**PART. 2**

**本地执行 GO 代码城市**

之前的 GoCity 还是在 2021 年 10 月更新的，在最新的 Docker 和 Go1.18 环境有一些小问题，还好 KusionStack 相关同学为其提交了补丁进行了修复（_这也是开源项目的魅力所在，也希望开源社区小伙伴能够参与 KusionStack 的共建_），现在可以执行以下命令安装：go install github.com/rodrigo-brito/gocity@latest。然后通过 gocity open 打开 Github 或本地仓库。

**- 比如打开本地的 KusionStack/kusion 仓库**

$ gocity open $HOME/go/src/github.com/KusionStack/kusionINFO[0000] Visualization available at: http://localhost:4000/_#/local_

**- 然后浏览器打开对应页面**

![](https://intranetproxy.alipay.com/skylark/lark/0/2022/jpeg/71456658/1661860320070-2c1a0201-c6ca-4ff3-9971-2ac437042a1d.jpeg#clientId=uc728f140-cd19-4&crop=0&crop=0&crop=1&crop=1&from=paste&id=u4405f2a0&margin=%5Bobject%20Object%5D&originHeight=506&originWidth=924&originalType=url&ratio=1&rotation=0&showTitle=false&status=done&style=none&taskId=u09690741-38b7-4cc0-b155-58fa485d8cb&title=)

本地执行一切正常！

**PART. 3**

**Go 代码城市一键上云**

作为一个类似数字城市的应用，在云原生、元宇宙等背景下，部署上云也是一个自然的需求。同时我们也希望通过 GoCity 展示下 KusionStack 的基本用法。在 GoCity 上云之前，我们先尝试如何本地执行该应用。

相应的容器镜像已经推送到 Docker Hub_（https://hub.docker.com/r/yuanhao1223/gocity）_，运行命令如下：docker run -d -p 4000:4000 yuanhao1223/gocity:latest

运行成功后，可打开本地地址_（http://localhost:4000/）_查看 Go 项目的数字城市 3D 效果。

容器化成功后，现在准备上云。从本地执行容器的方式可以看出，想要在 Kubernetes 部署，至少需要 Deployment 和 Service 两种资源。其中 Deployment 用来部署 Go 代码城市，Service 暴露端口，访问无状态应用。

首先参考安装文档_（https://kusionstack.io/docs/user_docs/getting-started/install/）_安装好本地 Kusion 命令，然后通过 kusion init 的在线仓库提供了相应的模板。Kusion 命令支持一键初始化配置：
kusion init --online

输出类似以下信息：
![](https://intranetproxy.alipay.com/skylark/lark/0/2022/png/71456658/1661860320026-e7149d2f-092f-4082-bb75-76bb072d0b9b.png#clientId=uc728f140-cd19-4&crop=0&crop=0&crop=1&crop=1&from=paste&id=u0c2537b3&margin=%5Bobject%20Object%5D&originHeight=179&originWidth=1080&originalType=url&ratio=1&rotation=0&showTitle=false&status=done&style=none&taskId=u35175eeb-dcdb-4cf0-9ae2-aeb32d09ff0&title=)

为了方便展示，Kusion 模板已经内置了 CodeCity 的例子。其中 code-city 模板依赖 konfig 大库中抽象化的前/后端模型，code-city 模板无依赖，可以自闭环。我们选择后者：

![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*gCF1SK1xhWQAAAAAAAAAAAAAARQnAQ)

初始化过程中，指定了容器镜像，并且容器端口和 Service 端口均为 4000，现在进入配置目录，目录结构如下：

![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*n-_2QZUt1koAAAAAAAAAAAAAARQnAQ)

**- 完整的代码可以参考 ：**

[https://github.com/KusionStack/kusion-templates/tree/main/code-city-demo](https://github.com/KusionStack/kusion-templates/tree/main/code-city-demo)

为了方便本地测试，可以通过 minikube start 本地启动 MiniKube 服务。然后命令行模式切换到 code-city-kcl 目录，然后执行 kusion apply 命令生效配置。到此，开始正式上云：
kusion apply main.k

输出类似于：
![](https://intranetproxy.alipay.com/skylark/lark/0/2022/gif/71456658/1661860320925-33005c51-4adc-49e0-adfd-3ef80d96c645.gif#clientId=uc728f140-cd19-4&crop=0&crop=0&crop=1&crop=1&from=paste&id=u4214b7cb&margin=%5Bobject%20Object%5D&originHeight=439&originWidth=800&originalType=url&ratio=1&rotation=0&showTitle=false&status=done&style=none&taskId=u1448c75d-4c98-44ff-8a35-ded42846b62&title=)

检查 Deployment 的状态：
kubectl get deploy gocity

输出类似于：
NAME     READY   UP-TO-DATE   AVAILABLE   AGEgocity   1/1     1            1           85s

使用 kubectl 端口转发：
kubectl port-forward svc/gocity 4000:4000

访问本地地址_（https://localhost:4000/）_，点击 Example 处的链接 “KusionStack/kusion”，可以看到和本地执行一样的效果：

![](https://intranetproxy.alipay.com/skylark/lark/0/2022/gif/71456658/1661860320887-025c6fb8-2de8-4061-bb46-023e3db9eccc.gif#clientId=uc728f140-cd19-4&crop=0&crop=0&crop=1&crop=1&from=paste&id=u9484a70e&margin=%5Bobject%20Object%5D&originHeight=480&originWidth=768&originalType=url&ratio=1&rotation=0&showTitle=false&status=done&style=none&taskId=ue577b776-f59f-4598-85ec-38976deff12&title=)

至此，完成了 Go 代码城市的一键上云。有兴趣的读者，可以基于模型库 Konfig，选择其他模板，探索 KusionStack 支持的其它运维场景，下面我们将探索代码城市内部的原理。

**PART. 4**

**认识数字城市中的建筑含义**

说实话代码城市第一眼看上去更像一个电路板，要理解其中的含义需要了解几个基本的参数映射关系，如预览页面的右下角图所示：

![](https://intranetproxy.alipay.com/skylark/lark/0/2022/jpeg/71456658/1661860320983-18078a6d-741d-4dc5-b70b-603f09e741ca.jpeg#clientId=uc728f140-cd19-4&crop=0&crop=0&crop=1&crop=1&from=paste&id=u81525b81&margin=%5Bobject%20Object%5D&originHeight=206&originWidth=412&originalType=url&ratio=1&rotation=0&showTitle=false&status=done&style=none&taskId=uaaff0e71-f557-4385-b0fc-2f79f7d8942&title=)

以上的对应关系在其官方文档中也说明，如下图所示：

![](https://intranetproxy.alipay.com/skylark/lark/0/2022/jpeg/71456658/1661860321001-7bf7ca15-3a5e-4e5f-9518-9f270247282c.jpeg#clientId=uc728f140-cd19-4&crop=0&crop=0&crop=1&crop=1&from=paste&id=u80bd37de&margin=%5Bobject%20Object%5D&originHeight=237&originWidth=512&originalType=url&ratio=1&rotation=0&showTitle=false&status=done&style=none&taskId=ufabae7d8-00da-4999-9415-6eeb0673e5e&title=)

其中地面的粉红色表示 Go 包对应的目录（_因为包的依赖关系可能再产生叠加_），灰色表示目录内部的文件，而蓝色表示结构体。其中表示文件的灰色建筑物的大小即文件的大小，表示结构体的蓝色建筑物的高度即方法的数量，建筑物的长宽表示结构体中属性的数量，蓝色颜色的深度表示相关代码行数。

我们可以选择 DiffOptions 结构体对应建筑物查看其相关的属性参数：

![](https://intranetproxy.alipay.com/skylark/lark/0/2022/jpeg/71456658/1661860321007-042584a0-a6de-434b-9777-a57385c76a32.jpeg#clientId=uc728f140-cd19-4&crop=0&crop=0&crop=1&crop=1&from=paste&id=u546fd302&margin=%5Bobject%20Object%5D&originHeight=446&originWidth=678&originalType=url&ratio=1&rotation=0&showTitle=false&status=done&style=none&taskId=ub0c9db79-5b77-442c-b261-c7d16659165&title=)

可以看到该结构体中有 15 个属性、3 个方法、共 156 行代码。通过点击其中的 “Github 链接” 按钮可以跳转到对应的位置：

![](https://intranetproxy.alipay.com/skylark/lark/0/2022/jpeg/71456658/1661860321561-a9104a9d-1887-4e5d-917e-948cd70cfe6e.jpeg#clientId=uc728f140-cd19-4&crop=0&crop=0&crop=1&crop=1&from=paste&id=u28101f5b&margin=%5Bobject%20Object%5D&originHeight=379&originWidth=646&originalType=url&ratio=1&rotation=0&showTitle=false&status=done&style=none&taskId=u43a00647-1981-4599-ac39-e015f5cf267&title=)

因此通过这种方式我们可以很容易查看全局有无特别高大的建筑，从而判断是否存在某些文件和结构体的代码需要改进。可以说 GoCity 是一个很有趣的代码分析工具，甚至可以集成到 Github PR 代码评审流程中。

**PART. 5**

**分析 GoCity 的代码架构**

GoCity 代码架构主要分为代码数据提取和前端模型展示两块，如图所示：

![](https://intranetproxy.alipay.com/skylark/lark/0/2022/jpeg/71456658/1661860321691-deff8bee-fb43-4598-b4c3-7266a418ea96.jpeg#clientId=uc728f140-cd19-4&crop=0&crop=0&crop=1&crop=1&from=paste&id=ue8d825f1&margin=%5Bobject%20Object%5D&originHeight=220&originWidth=537&originalType=url&ratio=1&rotation=0&showTitle=false&status=done&style=none&taskId=u7040e067-60fa-4ba1-b91a-e5669f9563e&title=)

首先 Codebase 表示要展示的代码，通过 Git Service 被拉取，然后通过 Parser 和 Position 服务提取得到对应的参数信息，然后通过前端展示。Go 语言代码主要集中在模型数据提取部分，而前端展示主要为 JS 等实现。前端展示资源文件通过 embed.FS 内嵌到程序中，GoCity 命令启动 Web 服务展示页面。代码架构比较清晰，也是一个比较理想可用于 Go 语言学习的开源项目。

**PART. 6**

**展望**

我们通过 KusionStack 的方式，配合少量的 KCL 配置代码，完成了 Go 代码城市一键上云的操作。虽然云上的 Go 代码城市和本地的版本看不出什么区别，但是云上程序的整个生命周期管理将大为不同。在后面的例子中我们将展示如何通过 KusionStack 结合 KCL 配置语言进行 IaC 方式的云原生应用的运维操作。感谢关注🙏

**参考链接**

● [https://github.com/KusionStack/kusion](https://github.com/KusionStack/kusion)

● [https://github.com/KusionStack/examples](https://github.com/KusionStack/examples)

● [https://github.com/rodrigo-brito/gocity](https://github.com/rodrigo-brito/gocity)

● [https://wettel.github.io/codecity.html](https://wettel.github.io/codecity.html)

**了解更多...**

**KusionStack Star 一下✨：**

[https://github.com/KusionStack/Kusion](https://github.com/KusionStack/Kusion)


**本周推荐阅读**

[KusionStack 在蚂蚁集团的探索实践 (上)](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247515247&idx=1&sn=dc2d55f335f75c406ba073a837371359&chksm=faa353b5cdd4daa3a41fada52ac41be4644d6a20bd0429f4cfefedfb74f2de4de4492a89d4b1&scene=21#wechat_redirect)

[Kusion 模型库和工具链的探索实践](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247512283&idx=1&sn=b1a6218e9c396749846baaa9b6b38a2d&chksm=faa35f01cdd4d6177f00938c93b0c652533da148e5ecb888280205525f0e89e4636d010b64ee&scene=21#wechat_redirect)

[精彩回顾｜KusionStack](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247509944&idx=1&sn=e0e45403aa4fab624a2147bae6397154&chksm=faa34862cdd4c1747bd6a419c4eb2c2cd0244d9587179aabbbf246946ed28a83636ab9cedc86&scene=21#wechat_redirect)

[历时两年，打破“隔行如隔山”困境](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247510766&idx=1&sn=16d7ab76854829ee64211dd6b9f6915c&chksm=faa34534cdd4cc223422efda8872757cb2deb73d22fe1067e9153d4b4f28508481b85649e444&scene=21#wechat_redirect)

**欢迎扫码关注我们的公众号**

![](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*OvOsRLqjPgQAAAAAAAAAAAAAARQnAQ)
