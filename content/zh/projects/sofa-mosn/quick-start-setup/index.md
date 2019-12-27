---
title: "快速开始"
aliases: "/sofa-mosn/docs/docs-quickstart-Setup"
---

本文用于帮助初次接触 MOSN 项目的开发人员，快速搭建开发环境，完成构建，测试，打包和示例代码的运行。

**注**：MOSN 基于 Go 1.12.7 开发，使用 dep 进行依赖管理。

## 准备运行环境

+ 如果您使用容器运行 MOSN，请先 [安装 docker](https://docs.docker.com/install/)
+ 如果您使用本地机器，请使用类 Unix 环境
+ 安装 Go 的编译环境 
+ 安装 dep : 参考[官方安装文档](https://golang.github.io/dep/docs/installation.html)

## 获取代码

MOSN 项目的代码托管在 [Github](https://github.com/mosn/mosn)，获取方式如下：

```bash
go get -u mosn.io/mosn
```

如果您的 go get 下载存在问题，请手动创建项目工程

```bash
# 进入 GOPATH 下的 src 目录
cd $GOPATH/src
# 创建 mosn.io 目录
mkdir -p mosn.io
cd mosn.io

# 克隆 MOSN 代码
git clone git@github.com:mosn/mosn.git
cd mosn
```

最终 MOSN 的源代码代码路径为 `$GOPATH/src/mosn.io/mosn`

## 导入IDE

使用您喜爱的 Go IDE 导入 `$GOPATH/src/mosn.io/mosn` 项目，推荐 Goland。

## 编译代码

在项目根目录下，根据自己机器的类型以及欲执行二进制的环境，选择以下命令编译 MOSN 的二进制文件。

### 使用 docker 镜像编译

```bash
make build // 编译出 linux 64bit 可运行二进制文件
```

### 本地编译

使用下面的命令编译本地可运行二进制文件。

```bash
make build-local
```

在非 Linux 机器交叉编译 Linux 64bit 可运行二进制文件。

```bash
make build-linux64
```

在非 Linux 机器交叉编译 Linux 32bit 可运行二进制文件。

```bash
make build-linux32
```

完成后可以在 `build/bundles/${version}/binary` 目录下找到编译好的二进制文件。

## 打包

在项目根目录下执行如下命令进行打包。

```bash
make rpm
```

完成后可以在 `build/bundles/${version}/rpm` 目录下找到打包好的文件。

## 创建镜像

执行如下命令进行镜像创建。

```bash
make image
```

## 运行测试

在项目根目录下执行如下命令运行单元测试：

```bash
make unit-test
```

在项目根目录下执行如下命令运行集成测试（较慢）。

```bash
make integrate
```

## 从配置文件启动 MOSN

运行下面的命令使用配置文件启动 MOSN。

```bash
./mosn start -c '$CONFIG_FILE'
```

## 开启 MOSN 转发示例程序

参考 `examples` 目录下的示例工程[运行 Samples](../quick-start-run-samples)。

## 使用 MOSN 搭建 Service Mesh 平台

请参考[与 Istio 集成](../quick-start-run-with-sofamesh)。
