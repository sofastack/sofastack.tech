---
title: "使用 CloudMesh 轻松实践 Service Mesh"
description: "使用该指南您可以快速部署应用到 CloudMesh ，对服务进行访问，通过监控查看流量，体验服务治理、Sidecar管理和对服务的新版本进行灰度发布等实用功能。"
github: "https://github.com/sofastack-guides/kc-cloud-mesh-demo"
projects: [{name: "SOFAMesh", link: "https://github.com/sofastack/sofa-mesh"}]
---

## Demo内容介绍

Service Mesh 将服务间通信能力下沉到基础设施，让应用解耦并轻量化。

![进程拆分](https://gw.alipayobjects.com/mdn/rms_631dea/afts/img/A*sU9uRZHdKxIAAAAAAAAAAABkARQnAQ)

但 Service Mesh 本身的复杂度依然存在，CloudMesh 通过将 Service Mesh 托管在云上，使得您可以轻松的实践 Service Mesh 技术。

![使用的技术](https://gw.alipayobjects.com/mdn/rms_631dea/afts/img/A*cfXeT5aA_p0AAAAAAAAAAABkARQnAQ)

通过我们的 workshop，您可以将以多种编程语言开发的应用，简单部署到 CloudMesh 上，即可获得服务网格提供的强大能力。包括对服务进行访问，通过监控查看流量，体验服务治理、Sidecar管理和对服务的新版本进行灰度发布等实用功能。

![BOOKINFO](https://gw.alipayobjects.com/mdn/rms_631dea/afts/img/A*A1mgR7I9RQMAAAAAAAAAAABkARQnAQ)

本次demo中，我们将重点体验 CloudMesh 强大的流量控制能力。在灰度发布过程中，可以对灰度流量占比进行精准控制，并通过实时流量监控了解服务网格中流量的实际走向：

![灰度发布](https://gw.alipayobjects.com/mdn/rms_631dea/afts/img/A*SyIGTqvtIfcAAAAAAAAAAABkARQnAQ)

常规的灰度发布，在灰度过程中需要占用两倍容量：

![灰度](https://gw.alipayobjects.com/mdn/rms_631dea/afts/img/A*8MXfQorNe6AAAAAAAAAAAABkARQnAQ)

Cloud Mesh提供的灰度发布功能，可以实现在灰度发布过程中不必占有额外的容量，而且容许在发布期间多次暂停以便修改灰度占比：

![灰度](https://gw.alipayobjects.com/mdn/rms_631dea/afts/img/A*JRTmR4YUZ0kAAAAAAAAAAABkARQnAQ)

## Demo操作指南

为了方便参加本次demo的同学，我们准备了整个demo流程的详尽的操作指南。

## 更多

- 请[点击此处访问](/cloud-mesh-demo)在线版本。
- [下载本地 Demo 幻灯片](https://gw.alipayobjects.com/os/basement_prod/2927b0a3-670a-4fd2-992c-115a6785c7c9.pdf)。