---
title: "在 Kubernetes 中快速开始"
aliases: "/sofa-mesh/docs/sofa-mesh-setup"
---

本文旨在描述如何在 Kubernetes 快速开始安装和配置 Istio。

SOFA Mosn 不仅可以支持 Istio 标准的部署模式，也能支持单方面的 Inbound Sidecar，Outbound Sidecar的部署模式，满足用户的各种需求。

## 前置要求

1. Kubernetes
2. 安装 Helm

## 安装步骤

Step 1. 下载最新的 release 包
Step 2. 把 Istio 的 bin 路径添加到系统的 PATH。比如，在 Linux 系统下执行如下命令：

```bash
export PATH=$PWD/bin;$PATH
```

Step 3. 创建命名空间

```bash
kubectl create namespace istio-system
```

Step 4. 使用helm安装istio CRD

```bash
helm template install/kubernetes/helm/istio-init --name istio-init --namespace istio-system | kubectl apply -f -
```

Step 5. 使用helm安装各个组件

```bash
helm template install/kubernetes/helm/istio --name istio --namespace istio-system | kubectl apply -f -
```

Step 6. 确认所有 pod 都在运行中

```bash
kubectl get pod -n istio-system
```

## 部署应用程序

现在开始部署 Bookinfo 示例程序。

为 default 命名空间打上标签 istio-injection=enabled，实现 Sidecar 自动注入：

```bash
kubectl label namespace default istio-injection=enabled
```

使用 kubectl 部署Bookinfo的服务：

```bash
kubectl apply -f samples/bookinfo/platform/kube/bookinfo.yaml
```

确认所有的服务和 Pod 都已经正确的定义和启动：

```bash
kubectl get services
kubectl get pods
```

## 卸载 Istio

```bash
helm template install/kubernetes/helm/istio --name istio --namespace istio-system | kubectl delete -f -
kubectl delete namespace istio-system
```


