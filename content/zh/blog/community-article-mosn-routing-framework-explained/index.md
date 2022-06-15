---
title: "社区文章｜MOSN 路由框架详解"
author: "曹先胜"
authorlink: "https://github.com/sofastack"
description: "社区文章｜MOSN 路由框架详解"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2022-03-15T15:00:00+08:00
cover: "https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*TpZATZH8MlMAAAAAAAAAAAAAARQnAQ"
---

文｜曹先胜

e签宝中间件开发

负责e签宝中间件开发和维护，包括 MQ、网关、微服务、数据同步、全链路压测等

## 贡献者前言 

「 开源就是在使用中，共同成长的过程 」

从 2018 年学习 SOFAStack 的一些开源项目，到如今深入使用 MOSN，伴随着 SOFA 走到四周年。

因为兴趣也接触了不少的开源社区，唯独对 SOFA 社区的组件体验颇多， 例如 SOFAArk、SOFARPC、MOSN。长年混迹在钉钉群里提问题，都能得到及时回复，这对我们研究 MOSN 有很大的帮助。也因此通过 MOSN 的代码设计，学习到了很多关于 Sidecar 的设计理念。

我们使用 MOSN 的出发点是公司框架使用了很多的中间件，每个中间件有自己的依赖，这些依赖经常性的会发生冲突。虽然我们使用了类似 Spring Boot 的 Pom 管理机制，但升级框架过程中，如果有同学自行引入了 jar 包，就不可避免的会发生 jar 冲突。为了解决这个问题，我们调研了很多方案，最终认为 Service Mesh 是解决这个问题的一个比较合适的方案。

同时，也调研了一些其他的开源产品，经过内部讨论和各种取舍，我们选择了MOSN。

在使用 MOSN 时，因为要对接 Eureka，需要进行动态路由，而官网关于路由的文章不是很多。因此，在自己和烈元老师学习后，总结了这样一篇路由分享文章。

MOSN 作为网络边缘代理组件，路由功能是核心功能，本文将介绍 MOSN 路由如何使用，以及 MOSN 路由的一些高级使用技巧，欢迎大家留言指导。

## 路由基本设计 

在 MOSN 的路由设计中，Cluster 和 Route 是高度关联的，说白了 Route 的配置，就是为了表达如何准确找到你想找到的 Cluster，另外一个 Cluster 可以有多个 Host 机器。

例如一个 Cluster 有 100 台机器，其中有 50 台是 v1 版本，50 台是 v2 版本，如何根据一些特定的规则，准确地把请求路由到 v1 版本或者 v2 版本呢？

再例如，我想根据 Header 里的某个值，再将这个值和“配置中心”里的某个值进行计算，才能找到 Cluster，那么我该如何配置呢？

- 首先，我们看最简单的路由设置。

![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*Y3yjRZxNms0AAAAAAAAAAAAAARQnAQ)

上图是一个简单的 Json 配置。其中，Cluster Manager 和 Routers 的配置是路由的关键。我们可以根据 Cluster Manager 配置多个 Cluster，每个 Cluster 配置多个 Host。

然后在 Routers 配置中，根据一些规则，告诉 MOSN 如何将请求路由到 Cluster 中。

如下图：

![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*i0dqTaH-AbAAAAAAAAAAAAAAARQnAQ)

此配置表示，现在有一个 Rouer 配置名为 Server_Router，有一个虚拟主机，可配置多个域名，这里匹配所有域名。

同时，这个域名有多个路由配置，这里暂且配置了一个路由配置：前缀匹配，只要是 / 开头的，就转发到 ServerCluster 里的 Host 中，也就是下面的 Cluster Manager 配置里的 ServerCluster。

这样，就实现了一个简单的 MOSN 路由的配置。

## 动态路由 Cluster 

大部分情况下，如果我们的路由逻辑很简单，例如根据 Header 里的某个名字，找到对应的 Cluster，代码或者配置就是这么写的：

、、、java
router := v2.Router{
    // header 匹配
    RouterConfig: v2.RouterConfig{
        Match: v2.RouterMatch{
            Headers: []v2.HeaderMatcher{
                // 这个 header 匹配, 就转发到 app.Name cluster.
                {
                    Name:  "X-service-id",
                    Value: app.Name,
                },
            },
        },
        // cluster 名称匹配.
        Route: v2.RouteAction{
            RouterActionConfig: v2.RouterActionConfig{
                ClusterName: app.Name,
            },
        },
    },
}
r.VirtualHosts[0].Routers = append(r.VirtualHosts[0].Routers, router)
、、、

上面代码的意思是如果 Header 里有 X-service-id 这个 kv，那么就能找到下面 RouteAction 对应的 Cluster 了。

那如果是更复杂的逻辑呢？

比如利用请求里的 Header 和“配置中心”的某个值进行计算，如何才能找到 Cluster呢？

此时，通过配置已经无法解决这个需求，因为这其中涉及到了计算逻辑，MOSN 通过动态配置可以支持该需求。

如下图配置：

![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*MoKOTawDqcQAAAAAAAAAAAAAARQnAQ)

我们设置了一个（"Cluster_Variable": "My-ClusterVariable"） 的 KV 配置。

同时，我们还需要在 StreamFilter 中，利用变量机制设置 key 为 “My-ClusterVariable” 的 Value ，这个 Value 就是计算出来的 Cluster 名称。

代码如下：

、、、Java
// 先注册这个 key 到变量表中。
func init() {
  variable.Register(variable.NewStringVariable("My-ClusterVariable", nil, nil, variable.DefaultStringSetter, 0))
}

var clusterMap = make(map[int]string, 0)

func (f *MyFilter) OnReceive(ctx context.Context, headers api.HeaderMap, buf buffer.IoBuffer, trailers api.HeaderMap) api.StreamFilterStatus {
  l := len(clusterMap)
    // 找 Cluster
  cluster := // 执行一些计算
    // 设置到上下文变量中。这个 key 必须和配置文件中保持一致。
  variable.SetString(ctx, "My-ClusterVariable", cluster)
  return api.StreamFilterContinue
}
、、、

## MOSN Subset 

如上面所述，我们经常有在一个集群里有多个版本，如何根据某些标签将请求路由到指定的版本呢？ 

通常，我们会使用 Subset 方案，即“子集合”。可在一个 Cluster 里面，为每个应用打标。同时我们的路由也配置相关的配置（MOSN 称为 Metadata），实现较为复杂的路由。

MOSN 官方文档中，简单介绍了 Metadata 的使用。

下面让我们更详细的介绍 Subset 的使用：

![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*i25aTpwjbjAAAAAAAAAAAAAAARQnAQ)

上图中左边是 Cluster Host 配置，右边是 Router 配置。

这个路由配置的 Match 意思是：当请求者的 Header 里指定了 Name 和 Value，且其值匹配这个路由值 Service 和 Service.Green，那么该请求就被路由到了这个 Cluster_Subset 集群中。

这个集群可能有多个机器，那么需要这个机器的元数据和路由配置的元数据相同， 必须都是 Subset:Green，才能匹配上这个 Host，否则提示找不到（fall_back_policy 策略是 0 为前提）。

由此，我们解决了一个 Cluster 里面有多个版本的 Host 的路由问题。

再进一步，一个 Cluster 会有多个 Host，每个 Host 可能有不同的 Subset，这可能就需要很多的路由，如果都使用配置文件的方式写死，就比较麻烦。

MOSN 支持基于 stream filter 的方式，设置动态路由。

如下：

![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*lEklS7UnTrAAAAAAAAAAAAAAARQnAQ)

基于 MOSN 的变量机制，在请求级别的 VarRouterMeta 中设置 kv Metadata 组合，效果和上面配置文件的方式类似。

另外，如果路由配置中配置 Metadata，请求级别也配置了 Metadata。那么， MOSN 会将 2 个元数据进行合并，和 Host 进行匹配，这个逻辑 pkg/proxy/downstream.go:1497 代码中有体现。

来个简单的例子，例如分组里指定机器调用：

1.请求时：可在 Header 里指定 IP，并在 VarRouterMeta 里设置这个 IP

2.Host 配置：可在 Metadata 里配置 IP kv，例如 IP：192.168.2.3

如下图:

![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*D3pITbpzJBYAAAAAAAAAAAAAARQnAQ)

这样就能匹配到指定机器了。

ps: 关于这个例子，我们其实也可以使用 MOSN 的 ORIGINAL_DST 机制，将 Cluster 的 Type 设置为 ORIGINAL_DST（MOSN 还支持 DNS 集群类型），然后配置 cluster.original_dst_lb_config.use_header = true。我们请求的时候，在 Header 里加入Host = {目标地址}， MOSN 就会根据这个指定的 Host Header 进行转发。

当然，MOSN 也可以自定义名字，不一定要叫 Host。

来个复杂的例子：假设一个场景，单个 Host 存在于多个分组，而请求时只能指定一个分组。

如下图：

![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*ad9eT77JJwEAAAAAAAAAAAAAARQnAQ)

我们现在有 2 台机器，共 3 个分组：AAA、BBB、CCC。每个机器都包含 AAA 分组。现在有 3 个请求，每个请求都是不同的分组。

此时，我们该如何配置元数据呢？

首先，本质上给机器加分组，其实就是打标，我们将元数据想象成 Tag 列表即可。

上面的代码展示了：我们将多个分组标签，转换成 MOSN 可以认识的元数据 kv，每个标签对应一个固定的 value true（为什么设置为 true 呢？value 自身其实在 MOSN 的 SubsetLB 中是有含义的，即最终根据请中携带的 metadata 的值去匹配 cluster 中满足条件的 Subset host entry。但由于 metadata 是个 map， 而因为我们这个例子的特殊性，只能使用 key 自身做分组，所有的 value 都保持一样，本质上任何值都是可以的）。同时注意这些 Key 都要保存到 SubsetSelectors 中，否则 MOSN 无法识别。每次调用时，我们在 Filter 里从 Header 里面取出分组标签，然后设置进“上下文变量”中。

例如：

![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*xnuwTaNIhJ0AAAAAAAAAAAAAARQnAQ)

这样，我们就能够完成更加复杂的分组路由。

那 MOSN 是如何寻找 Subset 的呢？

代码如下:

![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*R5XqSoElXrYAAAAAAAAAAAAAARQnAQ)

当执行 chooseHost 时，subsetLoadBalancer.findSubset 函数会根据当前请求的元数据，从 subSetLoadbalancer 里找出匹配的 Host List。

## 总结 

我们先讲了基于简单的配置，来实现简单的 Router 和 Cluster 的配置文件路由。

再讲了可以基于 stream filter 的方式实现动态寻找 Cluster。同时 MOSN 支持 Subset，可以基于 Route 配置文件来进行路由和 Cluster Host 进行匹配，如果逻辑复杂，也可以基于 stream filter + varRouterMeta 变量的方式来动态寻找 Subset。

其实大部分情况下，我们用 Json 配置就能解决我们的路由问题。如果复杂的话，我们就用 stream filter + varRouterMeta / stream filter + cluster_variable 这两种动态机制解决我们的需求。

下面尝试用一张图来结束本文

![weekly.jpg](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*0Y4qR6bEicoAAAAAAAAAAAAAARQnAQ)

「参考资料」

[1] [Router 配置 MOSN SubsetLB 开发文档 Load Balancer Subsets](https://www.bookstack.cn/read/SOFAMesh-zh/mosn-develop-SubsetLB.md)

[2] [Metadata 的使用](https://mosn.io/docs/configuration/custom/#metadata)

### 本周推荐阅读  

[BabaSSL 发布 8.3.0｜实现相应隐私计算的需求](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247502271&idx=1&sn=861bcea32cc766721bb6fd95361ef6eb&chksm=faa32665cdd4af73dcc42c51f79e6c61035cddf95ecad822ea6e85cb188c60cb85c9b8027484&scene=21)

[HAVE FUN | SOFARegistry 源码解析](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247502760&idx=1&sn=2980bf857055853220934944c42fd2af&chksm=faa32472cdd4ad641cb062e0c3bb5ec5b46dafba1ea25b19d774ebdac2704ae610994511874b&scene=21)

[BabaSSL：支持半同态加密算法 EC-ElGamal](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247502645&idx=1&sn=efb490d530f4254a8b12dff89714ace7&chksm=faa324efcdd4adf9119222551a407da68e388fd1b3f652fc034860fee9d687311e2136bbd28c&scene=21)

[恭喜 吕冰洁 成为 SOFAStack committer！](https://mp.weixin.qq.com/s?__biz=MzUzMzU5Mjc1Nw==&mid=2247502520&idx=1&sn=45bc1b879e3014b18f3fc3ee6a10277e&chksm=faa32562cdd4ac74657f95e7f3e1cfad7619638a08fb9f8754e5539f2fdf05718c87436c5c5e&scene=21)

![img](https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*tvfDQLxTbsgAAAAAAAAAAAAAARQnAQ) 
