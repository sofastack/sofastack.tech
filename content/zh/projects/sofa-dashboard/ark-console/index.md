---
title: "SOFAArk 管控"
aliases: "/sofa-dashboard/docs/ArkConsole"
---

[SOFAArk](https://www.sofastack.tech/sofa-boot/docs/sofa-ark-readme)  本身提供了多种方式来支持多应用(模块)合并部署 ，包括基于命令行的管控，基于 API 的管控等；SOFAARK 管控是 SOFADashboard 针对 API 的管控的一种实现。通过面向 Zookeeper 进行命令的推送和命令的解析执行。

SOFAArk 管控主要包括以下功能：

* 插件注册：将 ark-biz 插件注册到 SOFADashboard，作为基础数据
* 关联应用：将 ark-biz 插件与宿主应用进行绑定
* 插件详情：通过插件详情页，可以看下当前 ark-biz 插件下所有关联的宿主应用信息，以及宿主应用中的ark-biz 状态信息
* 命令推送：插件详情页，可以针对应用维度、分组维度、IP 维度 推送一些指令，比如 install、uninstall 等等，当这些命令被写入到 Zookeeper 的某个节点上时，所有监听此节点的 宿主应用均会解析此指令，并进行相关的操作

## 插件管理

![](https://img.alicdn.com/imgextra/i4/O1CN01O312QG1NU1UvZ0G4m_!!6000000001572-0-tps-1888-462.jpg)

### 插件注册

将 ark-biz 插件注册到 SOFADashboard：

![ark-console.png](https://img.alicdn.com/imgextra/i1/O1CN01P9RoDK1tbrz7kfzGW_!!6000000005921-0-tps-1600-419.jpg)

### 插件删除

![](https://img.alicdn.com/imgextra/i4/O1CN01v7KVHL28YPEH7B2PG_!!6000000007944-0-tps-1602-399.jpg)

### 添加插件版本

![](https://img.alicdn.com/imgextra/i2/O1CN01G8NJ3l1RkkQHvuD1a_!!6000000002150-0-tps-1527-429.jpg)

### 插件版本 biz 包路径

![](https://img.alicdn.com/imgextra/i2/O1CN01G8NJ3l1RkkQHvuD1a_!!6000000002150-0-tps-1527-429.jpg)

### 删除版本

![](https://img.alicdn.com/imgextra/i4/O1CN01cvTscG22ozslV7v1V_!!6000000007168-0-tps-1624-415.jpg)

### 关联应用

点击模块列表操作菜单栏中的关联应用，可以将一个应用与插件进行绑定：

![image.png](https://img.alicdn.com/imgextra/i1/O1CN01gW0EgE1ZIpCZKMWPd_!!6000000003172-0-tps-1491-397.jpg)

## 动态管控

点击插件列表后面的 详情 按钮，可以查看当前插件下所有应用信息和应用实例信息。

![image.png](https://img.alicdn.com/imgextra/i1/O1CN01FHHvf520TLvr7pbG5_!!6000000006850-0-tps-1838-489.jpg)

### 命令推送

SOFADashboard 提供三种维度的命令推送

* 基于应用维度，当前应用所有的实例都会监听到此命令变更
* 基于IP 维度，分组维度的单 ip 场景

### 动态模块详情

点击 状态详细按钮，左侧栏将会展开 "抽屉" 展示详情状态数据

![image.png](https://img.alicdn.com/imgextra/i3/O1CN013Dj57g1UswM4EtJq2_!!6000000002574-0-tps-1657-977.jpg)
