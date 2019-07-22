---
title: "Jepsen 验证"
---

除了几百个单元测试以及部分 chaos 测试之外, SOFAJRaft 还使用 [jepsen](https://github.com/jepsen-io/jepsen) 这个分布式验证和故障注入测试框架模拟了很多种情况，都已验证通过：

- 随机分区，一大一小两个网络分区
- 随机增加和移除节点
- 随机停止和启动节点
- 随机 kill -9 和启动节点
- 随机划分为两组，互通一个中间节点，模拟分区情况
- 随机划分为不同的 majority 分组

[sofa-jraft-jepsen 项目地址](https://github.com/sofastack/sofa-jraft-jepsen)