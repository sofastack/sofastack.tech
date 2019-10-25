---
title: "在 Kubernetes 中快速开始"
aliases: "/sofa-mesh/docs/pilot-setup-zookeeper-quick_start_docker"
---

本文旨在描述如何在 Kubernetes 快速开始安装和配置 Istio。
SOFA Mosn 不仅可以支持 Istio 标准的部署模式，也能支持单方面的 Inbound Sidecar，Outbound Sidecar的部署模式，满足用户的各种需求。

## 前置要求

- Docker
- Docker Compose

## 安装步骤

1. 下载最新的 release 包
2. 解压安装文件，并且进入解压后的路径，安装路径包含：
- 示例应用路径 `samples/`
- /bin 路径下应该能找到 istioctl 客户端可执行文件，istioctl 可用于创建路由规则和策略
- 配置文件 istion.VERSION
3. 把 Istio 的 bin 路径添加到系统的 PATH。比如，在 MacOS 或者 Linux 系统下执行如下命令：
    ```SHELL
    export PATH=$PWD/bin;$PATH
    ```
4. 安装helm
5. 创建命名空间
    ```SHELL
    kubectl create namespace istio-system
    ```
6. 使用helm安装istio CRD    
    ```SHELL
    helm template install/kubernetes/helm/istio-init --name istio-init --namespace istio-system | kubectl apply -f -
    ```
7. 使用helm安装各个组件
    ```SHELL
    helm template install/kubernetes/helm/istio --name istio --namespace istio-system | kubectl apply -f -
    ```
8. 确认所有 pod 都在运行中：
    ```SHELL
    kubectl get pod -n istio-system
    ```
    如果 Istio pilot 容器意外终止，确保运行 istioctl context-create 命令，并且重新执行上一个命令。


## 部署应用程序

现在开始部署 Bookinfo 示例程序
为 default 命名空间打上标签 istio-injection=enabled，实现 Sidecar 自动注入
```bash
kubectl label namespace default istio-injection=enabled
```
使用 kubectl 部署Bookinfo的服务
```bash
kubectl apply -f samples/bookinfo/platform/kube/bookinfo.yaml
```
确认所有的服务和 Pod 都已经正确的定义和启动
```SHELL
kubectl get services
kubectl get pods
```

## 卸载 Istio

```bash
helm template install/kubernetes/helm/istio --name istio --namespace istio-system | kubectl delete -f -
kubectl delete namespace istio-system
```
