---
title: "Put Service Mesh into practice with CloudMesh"
description: "This guide introduces how to quickly deploy applications to CloudMesh, access services, monitor traffic, experience service governance, manage Sidecar, and perform gray release of new versions of services."
github: "https://github.com/sofastack-guides/kc-cloud-mesh-demo"
projects: [{name: "SOFAMesh", link: "https://github.com/sofastack/sofa-mesh"}]
---

**To run this demo, you should sign up an Ant Financial technology account. Please see [Ant Finanical Official Site](https://tech.antfin.com) to see more details.**

## Demo content

Service Mesh applies the communication capabilities between services to the infrastructure, thus decoupling and lightweighting applications.

![architecture](https://gw.alipayobjects.com/mdn/rms_631dea/afts/img/A*ApfhTbQQPAwAAAAAAAAAAABkARQnAQ)

However, Service Mesh itself is still complex. CloudMesh can easily implement Service Mesh technology by hosting Service Mesh on the cloud.

![component relationship](https://gw.alipayobjects.com/mdn/rms_631dea/afts/img/A*f8N_TaB7oVwAAAAAAAAAAABkARQnAQ)

With our workshop, you can easily deploy applications developed in multiple programming languages ​​to CloudMesh, thereby experiencing the capabilities of Service Mesh. The capabilities include accessing services, monitoring traffic, experiencing service goverance, managing Sidecar, and gray release of new versions of services.

![bookinfo](https://gw.alipayobjects.com/mdn/rms_631dea/afts/img/A*A1mgR7I9RQMAAAAAAAAAAABkARQnAQ)

This demo focuses on the powerful traffic control capability of CloudMesh. In the process of gray release, you can precisely control the gray traffic ratio, and monitor the actual traffic trend in CloudMesh:

![gray traffic](https://gw.alipayobjects.com/mdn/rms_631dea/afts/img/A*SyIGTqvtIfcAAAAAAAAAAABkARQnAQ)

The general gray release function occupies twice capacity in the gray process.

![general gray release](https://gw.alipayobjects.com/mdn/rms_631dea/afts/img/A*8MXfQorNe6AAAAAAAAAAAABkARQnAQ)

The gray release function of CloudMesh does not need to occupy extra capacity in gray release process, and also allows pausing the release process to modify gray ratio multiple times.

![cloudmesh gray release](https://gw.alipayobjects.com/mdn/rms_631dea/afts/img/A*JRTmR4YUZ0kAAAAAAAAAAABkARQnAQ)

## Operation guide

For convenience, we have prepared a detailed operation guide for this demo.

Click here to [visit online version](https://www.sofastack.tech/).
