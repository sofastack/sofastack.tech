---
title: "SOFAMesh overview"
aliases: "/sofa-mesh/docs/Home"
---

**This repository is deprecated. It will contribute to istio directly instead of developing in a forked repo. Please go to see [Istio’s doc](https://istio.io).**

---

SOFAMesh is a large-scale implementation scheme of Service Mesh based on [Istio](https://istio.io). On the basis of inheriting the powerful functions and rich features of Istio, in order to meet the performance requirements in large-scale deployments and to respond to the actual situation in the implementation, the following improvements are made:

- [MOSN](https://github.com/mosn/mosn) written in Golang instead of [Envoy](https://github.com/envoyproxy/envoy)
- Merge Mixer to data plane to resolve performance bottlenecks
- Enhance Pilot for more flexible service discovery mechanism
- Added support for [SOFA RPC](https://github.com/sofastack/sofa-rpc), Dubbo

The initial version was contributed by Ant Financial and Alibaba UC Business Unit.

The following figure shows the architectural differences between SOFAMesh and Istio:

![SOFAMesh architecture](sofa-mesh-arch.png)

## Main components

### MOSN

In SOFAMesh, the data pane adopts Golang to write a module called MOSN (Modular Open Smart Network), and replaces Envoy with MOSN to integrate with Istio to implement the functions of Sidecar. MOSN is fully compatible with Envoy's APIs.

![SOFA MOSN architecture](mosn-sofa-mesh-golang-sidecar.png)

### SOFAMesh Pilot

SOFAMesh greatly expands and enhances the Pilot module in Istio:

![SOFAMesh Pilot Architecture](sofa-mesh-pilot.png)

1. Add an Adapter for SOFA Registry to provide solutions for super large-scale service registration and discovery;
2. Add data synchronization modules to enable data exchange between multiple service registry centers;
3. Add Open Service Registry API to provide standardized service registration.

Together with Pilot and MOSN, SOFAMesh provides the ability to enable traditional intrusive frameworks (such as Spring Cloud, Dubbo and SOFARPC) and Service Mesh products to communicate with each other, thus it can smoothly evolve and transit to Service Mesh.
