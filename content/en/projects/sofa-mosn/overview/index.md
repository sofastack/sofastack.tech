---
title: "Overview"
aliases: "/sofa-mosn/docs/Home"
---

**MOSN's official website [mosn.io](http://mosn.io) is under construction. The documents are temporarily hosted here.**

MOSN is a powerful proxy written in Go that can be used as a Service Mesh's data plane. MOSN is the short name of Modular Observable Smart Network. MOSN can be integrated with any Service Mesh wich support xDS API, also used as a standalone load balancer on layer 4 or 7. In the future, MOSN will support more cloud native scenarios and the core forwarding function of Nginx.

## Core competence

+ Integrated with Istio
	+ Integrated with Istio 1.0 and V4 APIs to run based on full dynamic resource configuration
+ Core forwarding
	+ Self-contained Web server
	+ Support TCP proxy
	+ Support TProxy mode
+ Multi-protocol
	+ Support HTTP/1.1 and HTTP/2
	+ Support SOFARPC
	+ Support Dubbo protocol (under development)
+ Core routing
	+ Support Virtual Host routing
	+ Support Headers/URL/Prefix routing
	+ Support Host Metadata-based Subset routing
	+ Support retry
+ Backend Management and load balancing
	+ Support connection pool
	+ Support throttling
	+ Support active backend health check
	+ Support load balancing strategies, such as Random and RR
	+ Support Host Metadata-based Subset load balancing strategy
+ Observability
	+ Observe network data
	+ Observing protocol data
+ TLS
	+ Support HTTP/1.1 on TLS
	+ Support HTTP/2.0 on TLS
	+ Support SOFARPC on TLS
+ Process management
    + Support smooth reload
    + Support smooth upgrade
+ Extension capability
    + Support custom private protocols
    + Support adding custom extensions in protocol at the TCP IO layer

## Acknowledgement
MOSN builds on open source projects such as [Envoy](https://github.com/envoyproxy/envoy) and [Istio](https://github.com/istio/istio), thanks to the efforts of the open source community.
