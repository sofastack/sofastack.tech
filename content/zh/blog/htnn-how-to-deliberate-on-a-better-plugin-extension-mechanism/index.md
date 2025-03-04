---
title: "社区文章｜HTNN 如何斟酌出更好的插件扩展机制"
authorlink: "https://github.com/sofastack"
description: "在设计插件扩展机制时，HTNN 关注两大核心目标：强大的扩展能力与高效的开发效率。为此，HTNN 引入了统一的 FilterPolicy CRD，通过 targetRef 与 filters 两个核心字段，实现了针对网络资源的策略配置与插件解耦"
categories: "SOFAStack"
tags: ["SOFAStack"]
date: 2024-11-05T15:00:00+08:00
cover: "[https://gw.alipayobjects.com/mdn/rms_1c90e8/afts/img/A*Rap6SJnP9f0AAAAAAAAAAAAAARQnAQ](https://img.alicdn.com/imgextra/i3/O1CN01FFfozQ2803gDYqkjo_!!6000000007869-0-tps-1080-459.jpg)"
---

# HTNN 如何斟酌出更好的插件扩展机制

在设计插件扩展机制时，HTNN 关注两点：

1. 扩展性尽可能强。扩展能力是插件的根基。如果一个插件机制一无所长、处处碰壁，那么其他能力再好也拯救不了它。
2. 开发效率尽可能高。大部分功能都是通过插件来实现的，所以插件机制的开发效率越高，整体的功能迭代速度就越快。


**GitHub**: https://github.com/mosn/htnn

## FilterPolicy CRD

绝大部分应用网络层次上的业务需求，都是围绕着网络协议做一些事情，如认证鉴权、限流限速、请求改写等等。HTNN 把这部分的需求都抽象出来，使用 FilterPolicy 来表达具体的配置规则。

和一些同类产品不同，HTNN 并没有为不同的业务分类使用不同的 CRD，而是统一使用 FilterPolicy 这个 CRD 来解决所有的策略层面上的业务需求。这是因为我们觉得多 CRD 的成本太大了。对于开发者，大量相似的 CRD 往往意味着更多重复的实现代码；对于使用者，要记住哪个 CRD 提供哪种能力总是件麻烦的事。

一个典型的 FilterPolicy 结构如下：

```
apiVersion: htnn.mosn.io/v1
kind: FilterPolicy
metadata:
  creationTimestamp: "2024-05-13T07:15:09Z"
  generation: 1
  name: policy
  namespace: istio-system
  resourceVersion: "158934"
  uid: 5b368582-0de3-4db0-b447-6c858b5a1305
spec:
  targetRef:
    group: networking.istio.io
    kind: VirtualService
    name: vs
    sectionName: to-httpbin
  filters:
    animal:
      config:
        pet: goldfish
    plant:
      config:
        vegetable: carrot
status:
  conditions:
  - lastTransitionTime: "2024-05-13T07:15:10Z"
    message: The policy targets non-existent resource
    observedGeneration: 1
    reason: TargetNotFound
    status: "False"
    type: Accepted
```

**FilterPolicy 有两个核心字段：targetRef 和 filters。**

targetRef 可以指向不同种类、层次各异的资源。我们可以用 targetRef 给 Gateway API 中的 HTTPRoute 配置策略，也可以给 istio API 中的 VirtualService 配置策略。我们可以用 targetRef 在 Gateway 层次上给所有路由配置策略，也可以在 VirtualService 层次上给某个路由配置策略。将来如果要支持配置上游层次的策略，只需让 targetRef 支持 Service 就好，其他的部分不需要改变。

filters 的类型是`map[string]Plugin`的KV 对。Key 是插件名，Value 是 Plugin。Plugin 不关心具体有什么配置，只是个载体：


```
type Plugin struct {
    Config runtime.RawExtension `json:"config"`
}
```

插件开发者会向 HTNN 注册插件。当 HTNN 调和 FilterPolicy 时，会根据插件名找到对应的插件，然后执行插件的逻辑。这里我们实现了业务逻辑的解耦：

1. FilterPolicy 专注于提供一套高扩展性的机制，不关心具体插件的实现。
2. 插件专注于解决具体的业务问题，不关心如何绑定到 Gateway 或者路由上。

**通过解耦，我们可以让插件开发者在对 HTNN 内部实现无感知的情况下完成插件开发**。对于插件开发者而言，插件开发可以只是完成 go test 能跑通的一段代码，不需要懂网关的实现细节。由于插件开发的门槛降低了，开发者能够更加聚焦业务问题，取得更高的开发效率。

## Validate via Protobuf and Go

插件并不能简单地作为黑盒来看待，尤其是涉及配置的时候。网关因为配置变更导致的故障，大部分是由不合法的配置造成的。HTNN 必须有一种方法来校验插件的配置，而且这个校验越前置越好。所以在设计插件扩展机制时，我们引入 protobuf 来描述插件配置的 schema。用户在注册插件时需要提供对应的 protobuf，并使用 protoc-gen-validate 来指定插件字段上的约束。通过 protobuf 验证有一个好处：我们有些插件是通过配置 Envoy 的 filter 来执行的，而 Envoy 的 filter 的配置方式就是用 protobuf。因为我们也用 protobuf 在控制面上验证插件配置，所以我们可以直接复用 Envoy filter 的 protobuf 定义。另外 protobuf 可以生成对应的 JSONSchema，理论上前端代码里也能用上 protobuf 的定义来校验插件配置（虽然现在没有用上）。

有些情况里，光依赖 protoc-gen-validate 没办法完成对插件配置的校验。举个例子，我们现在有个执行 OPA 规则的插件。这个插件配置的规则是用 Rego 代码写成，只靠 protoc-gen-validate 没法确保这些代码的合法性，需要编译一下。幸运的是，我们的控制面和数据面都跑 Go 代码，所以我们可以允许用户自定义 Validate 方法。用户自定义方法可以在 protobuf 校验之外，加上额外的校验（比如编译 OPA 规则）。

将插件配置校验收敛到插件代码内部有一个好处，就是在不同场景里（对接用户的 console、作为控制面的 istiod、执行 Go 代码的 Envoy Golang filter）都能使用同一套校验代码，既减少了重复的开发量，也避免了校验代码不一致导致的配置下发失败问题。

## Run in Istiod or Envoy

**HTNN 的插件分为两种：Native Plugin 和 Go Plugin**。Native Plugin 跑在 istiod（控制面）上，通过生成 EnvoyFilter，在 Envoy 里执行特定的 Envoy 自己的 filter。Go Plugin 则是在 Envoy Golang filter 这个 filter 里加了一层自己的 filter manager，执行用户自己开发的 Go 代码。借助在控制面和数据面上都提供插件扩展机制，HTNN 允许用户根据具体问题选择合适的二次开发方案。如果是适合通过现有 Envoy filter 解决的问题，那么用户可以开发 Native Plugin；如果是适合借力 Go 生态来解决的问题，那么用户可以开发 Go Plugin。东方不亮西方亮，总有适合自己的一条路。

* **Native Plugin 能很好地补充 istio 的能力**

在 istio API 中，VirtualService 包含了 CORS 配置。但在 Gateway API 里，对应的 HTTPRoute 去掉了专有的 CORS 配置。截止本文写作之时，Gateway API 对 CORS 的支持还只有一个提案。而 HTNN 已经内置了 CORS Native Plugin，支持通过指向 HTTPRoute 的 FilterPolicy 把 CORS 的能力加回来。Native Plugin 的能力不仅限于补齐 istio 现有能力和 Gateway API 之间的间隙。istio 官方推荐用 EnvoyFilter 来解决一些常见问题，比如 rate-limit。但是 EnvoyFilter 是无结构的配置，istio 自己不会校验 EnvoyFilter 的正确性。同样由于缺乏结构性，周边工具也不方便改进 EnvoyFilter 的开发体验。通过将无结构的 EnvoyFilter 转换成有校验的 Native Plugin，我们能带来更丝滑的开发体验。

* **Go Plugin 能很好地拓宽 Envoy 的领域**

由于 Envoy 自己没办法直接访问 Redis，所以它的全局限流功能，是通过部署一个 rate-limiting 服务代理 Redis 来实现的。虽然有些第三方通过修改 Envoy 实现了 Redis 访问功能，但是 HTNN 通过 Go 插件，无需改动一行 Envoy 代码直接复用 Redis 的 Go 客户端，即可直接访问 Redis，没有中间商赚差价。而且 HTNN 通过 Redis Go 客户端的能力可以做任何 Redis 客户端能做的事情，不仅限于实现限流功能所需的存储元数据，还可以直接将 Redis 作为缓存用，解锁更多业务场景。

## 总结

**在设计插件扩展机制时，HTNN 关注两大核心目标：强大的扩展能力与高效的开发效率**。为此，HTNN 引入了统一的 FilterPolicy CRD，通过 targetRef 与 filters 两个核心字段，实现了针对网络资源的策略配置与插件解耦。通过 Protobuf 与 Go 的双重校验机制，在多个层次确保了插件配置的合法性。同时，HTNN 支持在控制面和数据面两个层次运行插件，Native Plugin 适合借助现有 Envoy 能力，Go Plugin 则拥抱 Go 生态解决更广泛的问题。这一整体设计赋予了 HTNN 卓越的扩展性与开发效率，有力地补充和拓展了 HTNN 的网络能力，为终端用户带来前所未有的体验。

**欢迎大家加入社区与我们交流**

**GitHub**


https://github.com/mosn/htnn
