--
title: "Special Weekly | SOFAStack 社区牛年展望，Let's have fun together!"
author: "SOFA 团队"
authorlink: "https://github.com/sofastack"
description: "Special Weekly | SOFAStack 社区牛年展望，Let's have fun together!"
categories: "SOFA Weekly"
tags: ["SOFA Weekly"]
date: 2021-02-12T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*T6yDTKfrBaAAAAAAAAAAAAAAARQnAQ"
---

> 本文作者：蚂蚁集团黄挺（花名鲁直），SOFAStack 社区主理人，同时负责蚂蚁集团云原生方向的推动和落地，包括 Service Mesh、Serverless、消息、微服务等领域，带领 SOFA 团队扎根技术完成很多落地实践。

大家好，我是鲁直，有段时间没有和大家见面，今天是农历一年的起点，首先祝大家新年快乐，在新的一年牛气冲天！在这样特别的日子里，我想和大家分享对于 Service Mesh 未来方向的思考，再谈谈 SOFAStack 社区接下来计划做的一些事情，希望大家接下来能够在社区里面玩得开心，let's have fun together!
![https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*Cl6LR4AMi0AAAAAAAAAAAAAAARQnAQ](https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*Cl6LR4AMi0AAAAAAAAAAAAAAARQnAQ)
### **Service Mesh 是否已经解决了所有问题？**
2020 年， SOFA 团队宋顺（花名齐天，当前蚂蚁集团 Service Mesh 负责人）在 QCon 上海站分享了《[蚂蚁 Service Mesh 大规模落地实践与展望](https://mp.weixin.qq.com/s/ZyJs9kRkX8c6isZ6-VzWXA)》，详细讲述了 Service Mesh 在蚂蚁集团的进展和未来规划。
![https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*xY4zToCg8a8AAAAAAAAAAAAAARQnAQ](https://gw.alipayobjects.com/mdn/rms_95b965/afts/img/A*xY4zToCg8a8AAAAAAAAAAAAAARQnAQ)
在过去的几年里面，Service Mesh 在整个云原生社区如火如荼地发展，从刚开始的 Linkerd，到后面的 Istio，不断地有大公司加入到 Service Mesh 的领域的开拓之中，随着小剑、净超等同学在国内布道 Service Mesh，Service Mesh 从 2017 开始在国内火热程度也不断升温，SOFA 团队也在这个时候开始关注到 Service Mesh 这个领域，并且开始在内部尝试做落地的事情，也和业界的很多朋友一起举办了一场又一场的 Service Mesh Meetup。


应该说我们是幸运的，成功在 2019 年实现了 Service Mesh 在蚂蚁大促业务链路上的全面落地，获得了大规模落地 Service Mesh 的经验，并且在这之后持续应对 Service Mesh 大规模落地之后的遇到的各种挑战，截止到 2020 年底，蚂蚁集团已经基本上实现了**在线业务的全面 Service Mesh 化，在一部分网关场景上，也采用了 Service Mesh 的架构，实现了南北向和东西向流量架构的统一**。


但是随着 Mesh 化的进程不断地往前推进，一直在我们心中萦绕这一个问题，**Service Mesh 在一定程度上解决了基础设施和业务耦合的问题，但是是否已经把所有的问题都解决完毕了？**这个问题的答案显然是没有全部解决完毕，这个尚待解决的问题还是基础设施和业务耦合的问题。


目前包括蚂蚁集团在内的各种各样的 Service Mesh 的解决方案，都是会选择采用尽量透明的方式去适配应用已有的协议，让业务尽量减少接入 Service Mesh 的成本，即使不是全透明的方式，而是采用瘦 SDK 的方式接入（蚂蚁集团目前采用了这种方式），也是为了这个目的。在这种形态下，应用固然可以透明地获得非常多的能力，包括限流，服务发现，安全通信等等，但是一旦涉及到 RPC 协议的变化（从 SOFARPC 到 gRPC），后端缓存的变化（从 Memcached 到 Redis），应用还是需要去修改代码适配新框架的 SDK，这又是一件无论让应用还是让基础设施团队非常痛苦的事情，本质上还是应用去适配基础设施的变化，而不是反过来。


### **Service Mesh 的未来方向：Cloud Native Application Runtime**
**那么我们应该如何去解决这个问题？**在一次内部的会议上，我们和几个同事在讨论如何对 K8s 里面我们自定义的 Operator 进行规范化的问题，防止一个有问题的 Operator 把整个 K8s 搞挂了，但是一个同事提出了 Operator Framework 的想法，在 Operator 里面运行一个 Sidecar，这个 Sidecar 提供 Operator Framwork 的能力，这里面给了我们一个启发，可以用 Sidecar 这种模式去实现一个开发框架，一个运行时，来更好地帮助业务屏蔽掉对于后端基础设施的访问，我们看到业界也出现了这样的一些产品，比如 Dapr，CloudState 等，在这种模式下 Sidecar 已经不是一个简简单单的 Proxy，而是一个 Runtime，**我们把这种形态称之为 Cloud Native Application Runtime**。


这种模式之所以可以称之为 Cloud Native Application Runtime，关键还是 Sidecar 定义了一套面向应用的 API，这套 API 正是解耦应用和基础设施的关键。有了这套 API Spec，就相当于在应用和基础设施之间构建了一层防腐层，只要这一层 API Spec 能够持续往前保持兼容，后面的基础设施不断地演进和变化，都不会动到应用侧，基础设施和应用之间才能够实现更加彻底的分离，未来基础设施无缝升级才会成为可能。未来云原生的应用在不同的云之间迁移，甚至基于多朵云来构建应用，应用这一侧也不用重复进行适配的工作，应该说，这种模式也是符合未来混合云的方向的。所以，我们大胆的预测，未来 Service Mesh 持续往前继续演进，必然会发展到 Cloud Native Application Runtime 这样的方向。


基于这样的思考，在 2021 年，SOFAStack 社区一方面会**继续推进已有的项目的健康发展**，另一方面在**继续在Service Mesh 的方向上深耕**：继续分享在 Service Mesh 领域上的一些新思考之外，比如 Service Mesh 大规模落地之后的研发效率和运维效率的解决思路，我们也会和社区中的其他的组织一起通过 Service Mesh 的 Meetup 等活动继续推动 Service Mesh 的理念在国内的影响力，以及企业落地实践。（PS：最近 MOSN 刚刚公布了 2021 年的 RoadMap，欢迎大家关注：[https://github.com/mosn/mosn/issues/1559](https://github.com/mosn/mosn/issues/1559)，其他项目的 RoadMap 也会在春节后陆续和社区讨论然后公布；PPS：我们计划在 3 月份举办一次 Service Mesh 的 Meetup，欢迎感兴趣的社区同学报名；）


SOFAStack 开源社区即将成立三周年，SOFA 团队深刻地体会到一个开源项目的持续健康地发展，关键在于社区和社区中的每一位开发者，是你们每一个 star，每一个 issue 和 PR 推动着项目的成长。特别感谢接近三年时间，大家一同参与社区建设，感谢一起帮助社区成长的小伙伴们。SOFAStack 开源社区还有很长的路要和你们走，我们也会联合其他社区**一起推动 Cloud Native Application Runtime 的理念的落地和实践**，希望有更多开发者可以和我们一起去探索 Service Mesh 的未来形态，一起推动其成为云原生应用构建的一种标准方式。


Awesome SOFAer, then awesome SOFAStack，
Let's have fun together！
