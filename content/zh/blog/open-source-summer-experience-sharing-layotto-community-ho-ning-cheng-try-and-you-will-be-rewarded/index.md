---
title: "开源之夏经验分享｜Layotto 社区 郑浩宁：尝试，就会有收获！"
authorlink: "https://github.com/sofastack"
description: "Layotto 在创建之初，目标就是需要兼容 Dapr 接口和 Dapr 相关的 component 的实现，并且在 22 年，对 Dapr 的 v1.5.2 版本做了第一次的兼容。但是当前 Dapr 的版本已经走到了 v1.13.0，很多能力做了修复，就需要我们将 Layotto 中 Dapr 的兼容版本升级到 v1.13.0。"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2024-12-17T15:00:00+08:00
cover: "https://img.alicdn.com/imgextra/i4/O1CN01tv0Mrm1z0DGuwoHTc_!!6000000006651-0-tps-1215-518.jpg"
---

# 开源之夏经验分享｜Layotto 社区 郑浩宁：尝试，就会有收获！

**文 郑浩宁** 
软件工程专业
Layotto 社区贡献者

就读于福州大学，软件工程专业的大三学生。当前致力于微服务与云原生领域。

**本文1708字，预计阅读5 分钟**

今天 SOFAStack 邀请到了开源之夏 2024 Layotto 社区的中选学生**郑浩宁**同学。在本项目中，他完成了「**对齐**​​**​ Layotto 对 Dapr 的依赖**​」这一课题任务。希望他分享的这段经历，能让更多人了解到 Layotto 开源社区，感受开源的魅力～

​**项目链接**​：[https://summer-ospp.ac.cn/org/prodetail/24f080353?list=org&navpage=org](https://summer-ospp.ac.cn/org/prodetail/24f080353?list=org&navpage=org)

## 项目信息

​**项目名称**​：对齐 Layotto 对 Dapr 的依赖

​**项目导师**​：王文学

​**项目描述**​：Layotto 在创建之初，目标就是需要兼容 Dapr 接口和 Dapr 相关的 component 的实现，并且在 22 年，对 Dapr 的 v1.5.2 版本做了第一次的兼容。但是当前 Dapr 的版本已经走到了 v1.13.0，很多能力做了修复，就需要我们将 Layotto 中 Dapr 的兼容版本升级到 v1.13.0。

## 项目实现思路

### 对 Layotto 项目中的相关 Dapr API 进行处理

对于早期依赖于 Dapr API 的部分，这部分由于无人使用且维护成本高，需要将原 Dapr API 的相关内容迁移到 Layotto API 部分中，然后将整个 Dapr API 部分移除。

![图片](https://img.alicdn.com/imgextra/i4/O1CN01gDm3QN1q5rcGDvLXF_!!6000000005445-0-tps-747-582.jpg)

以 SaveState 代码示例：

**修改前:**

```bash
func (a *api) SaveState(ctx context.Context, in *runtimev1pb.SaveStateRequest) (*emptypb.Empty, error) {
        // 构造请求 
        // ...
        // ...


        // 调用 Dapr API
        return a.daprAPI.SaveState(ctx, daprReq)
}


func (d *daprGrpcAPI) SaveState(ctx context.Context, in *dapr_v1pb.SaveStateRequest) (*emptypb.Empty, error) {
        // 构造请求 
        // ...
        // ...


        // 调用 Dapr-contrib 执行具体逻辑
        err = store.BulkSet(reqs)
        if err != nil {
                err = d.wrapDaprComponentError(err, messages.ErrStateSave, in.StoreName, err.Error())
                log.DefaultLogger.Errorf("[runtime] [grpc.SaveState] error: %v", err)
                return &emptypb.Empty{}, err
        }
        return &emptypb.Empty{}, nil
}
```

**修改后：**

```bash
func (a *api) SaveState(ctx context.Context, in *runtimev1pb.SaveStateRequest) (*emptypb.Empty, error) {
        // 构造请求 
        // ...
        // ...


        // 直接调用 Dapr-contrib 执行具体逻辑
        err = store.BulkSet(ctx, reqs, state.BulkStoreOpts{})


        if err != nil {
                err = a.wrapDaprComponentError(err, messages.ErrStateSave, in.StoreName, err.Error())
                log.DefaultLogger.Errorf("[runtime] [grpc.SaveState] error: %v", err)
                return &emptypb.Empty{}, err
        }


        return &emptypb.Empty{}, nil
}
```

### Dapr 相关依赖进行升级

这部分工作可简要概括如下：

![图片](https://img.alicdn.com/imgextra/i1/O1CN01bndlzl1NUwRfvxRcD_!!6000000001574-0-tps-547-431.jpg)

## 开源之夏个人随访

### ​ 自我介绍

大家好，我是​**郑浩宁**​，目前是福州大学软件工程专业的大三学生。自从大二以来，我就对开源抱有浓厚的兴趣，这次是我第一次真正意义上为社区的开源项目进行贡献。

### 参与该项目的原因​

因为我本身就对**微服务与云原生领域**抱有兴趣，在这次 OSPP 的申报过程中也就自然而然的接触到了 SOFAStack 社区，进而注意到了 Layotto 项目。

在对 Layotto 项目有了一定程度的了解之后，我马上对这个项目产生了浓厚的兴趣，并且最终决定参与到 Layotto 项目的开源贡献之中。

### 如何克服项目过程中的困难与挑战

OSPP 开始后，我参考了官方以及 Dapr 的文档、相关联的 issues、项目的源码实现，同时在与导师进行积极的交流之后，最后得出对于这次课题的合适方案。

在项目开发的过程中，导师给予了我许多的帮助。当我在开发过程中遇到问题时，我会将具体问题​**整理成文档并附上个人的理解**​，通过文档与导师一起讨论问题并解决问题。

在项目的开发过程中，也有一些问题让我留下了深刻印象。比如对于 Dapr 的依赖升级：Dapr 已经走过了很多版本，许多功能都进行了升级完善，而 Layotto 使用的 Dapr 依赖已经是很早之前的版本了，由于版本跨度大，对 Dapr 的依赖进行升级后， Layotto 会出现大量的错误，此时就需要修复所有因此出现的错误。

在通过与导师的沟通交流完成课题工作后，又由于这部分的工作导致了 Github 上的 CI/CD 失效，后续还是通过与导师的配合一起完成了这部分的功能。

### 你对社区的印象

SOFAStack 社区是一个充满活力、专业的组织，致力于推动云原生技术的发展。通过开源合作、技术创新和社区生态系统的建设，该社区为开发者提供了丰富的资源和平台，以促进云原生应用的普及和应用。

SOFAStack 社区同时也是一个充满开源精神的组织，欢迎并鼓励学生和开源爱好者的积极参与，与所有开源爱好者一同建设，共同成长。

### 有哪些收获

参与这次开源之夏项目，不仅加深了我对云原生领域的认识，更让我在实践中获得了珍贵的经验。同时，这次经历也拓宽了我的技术领域，激发了我投身开源事业的热忱。

在开发过程中，我遭遇了众多未预见的难题。然而，正是这些挑战及其克服过程，为我的编程生涯塑造、积累了极为宝贵的经验。

### 寄语

开源之夏为所有人都提供了一个很好的机会。而对于开源本身，我相信只要勇于尝试，无论结果如何，都会有所收获！
