---
title: "MOSN"
description: "MOSN 是一款采用 Go 开发的 Service Mesh 数据平面代理。"
github: "https://github.com/sofastack/sofa-mosn"
level: "main"
icon: "/img/icons/sofamosn.png"
weight: 3
sidebar:
  - title: 'MOSN 介绍'
    link: 'overview'
  - title: '架构原理'
    sub:
      - title: '核心概念'
        link: 'concept/core-concept'
      - title: 'Sidecar 模式'
        link: 'concept/sidecar-pattern'
      - title: '流量劫持'
        link: 'concept/traffic-hijack'
      - title: 'TLS 安全链路'
        link: 'concept/tls'
  - title: '配置说明'
    sub:
      - title: '配置概览'
        link: 'configuration/overview'
      - title: 'Server'
        sub:
          - title: "Server 配置"
            link: 'configuration/server/overview'
      - title: 'Listener'
        sub:
          - title: 'Listener 配置'
            link: 'configuration/listener/overview'
          - title: 'FilterChain 配置'
            link: 'configuration/listener/filter-chain'
          - title: 'Network Filter'
            sub:
              - title: 'proxy'
                link: 'configuration/listener/network-filter/proxy'
              - title: 'connection_manager'
                link: 'configuration/listener/network-filter/connection-manager'
      - title: '自定义配置说明'
        link: 'configuration/custom'
  - title: '开发文档'
    sub:
      - title: '快速开始'
        link: 'quick-start-setup'
      - title: '工程示例'
        link: 'quick-start-run-samples'
      - title: '使用 MOSN 搭建 Service Mesh 平台'
        link: 'quick-start-run-with-sofamesh'
  - title: '压测文档'
    sub:
      - title: 'MOSN 0.1.0 性能报告'
        link: 'reference-performance-report010'
      - title: 'MOSN 0.2.1 性能报告'
        link: 'reference-performance-report021'
  - title: '发布历史'
    link: 'release-notes'
---
