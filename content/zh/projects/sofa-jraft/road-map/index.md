---
title: "Road Map"
---

## SOFAJRaft 2019 年 4-7 月开发计划

1. **(p1)** Telnet 服务（或其他，越简单越好），作为一种在线排查问题的手段，主要提供以下几个功能
    - Raft_stat: 以 node 节点为 root，能列出大部分甚至所有相关 stat
    - Metrics: 展示当前节点最新的所有 metrics 指标度量(虽然日志里有相关数据但是相对分散)
2. **(p1)** 扩展点：引入 SPI 机制，先列出几个扩展点
    - LogStorage
    - LogEntry codec
    - RaftMetaStorage
    - Metric 指标度量
3. **(p1)** 对于 multi-raft-group 场景，提供一个 manual rebalance api 用于平衡各个节点的 leaders 数量
4. **(p2)** 文档国际化
5. **(p2)** 添加 Learner 角色，只用于同步数据不参与投票
6. **(p3)** RheaKV 完成 jepsen 验证        
