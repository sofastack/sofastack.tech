---
title: "SOFALookout 服务端快速开始"
aliases: "/sofa-lookout/docs/quickstart-metrics-server"
---

## 1.使用本机 ES 服务

- 1)本地启动 ES

```bash
docker run -d --name es -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" elasticsearch:5.6
```

版本：V5，V6

- 2)检查 ES 是否健康

```bash
http://localhost:9200/_cat/health?v
```

- 3)启动 Lookout 服务

执行 all-in-one-bootstrap 编译后的 fat-jar 包，[如何获得，见文末备注部分](#备注)：

```bash
java -Dcom.alipay.sofa.ark.master.biz=lookoutall -jar lookout-all-in-one-bootstrap-1.6.0-executable-ark.jar
```

- 注意 `-Dcom.alipay.sofa.ark.master.biz=lookoutall` 是必须的, 用于设置 sofa-ark 的 master biz。

- 4)最后进行功能验证

查询 （Gateway）的 metrics 作为功能验证，访问“localhost:9090”，在查询框输入：

```bash
jvm.memory.heap.used{app="gateway"}
```

![可视化例子](https://gw.alipayobjects.com/mdn/rms_e6b00c/afts/img/A*KMStRaUXIkIAAAAAAAAAAABkARQnAQ)

最后，也可以[使用 grafana](../use-guide-grafana)

## 2.使用远程 ES 服务

总体步骤和“使用本机 ES 服务”类似，唯一不同的是，需要指定配置文件。

```bash
java -Dcom.alipay.sofa.ark.master.biz=lookoutall -Dlookoutall.config-file=abc.properties \
-jar lookout-all-in-one-bootstrap-1.6.0-executable-ark.jar
```

`-Dlookoutall.config-file`（如果你本地启动 ES 测试的话则该配置项可以忽略！），该配置项制定的文件暂时只能引用文件系统上的 properties 文件(没有像 spring-boot 支持那么丰富），配置项必须以应用名开头，从而提供隔离能力。

例如：在fat-jar同目录下创建一个`abc.properties`配置文件, 用于存放存放配置文件(下面列出了必须的配置项,用于指向使用的 ES 服务地址）：

```properties
gateway.metrics.exporter.es.host=localhost
gateway.metrics.exporter.es.port=9200
metrics-server.spring.data.jest.uri=http://localhost:9200
```

## 备注

如何获得 all-in-one-bootstrap 编译后的 fat-jar。

**方式1：本地编译**

```bash
./boot/all-in-one-bootstrap/build.sh
```

> 打包结果在`boot/all-in-one-bootstrap/target/allinone-executable.jar`

**方式2：发布报告中附件获取**

临时方式（针对 1.6.0）暂时提供一个 v1.6.0的snapshot包，下载后（保证ES服务已经单独启动）运行：

```bash
java -Dcom.alipay.sofa.ark.master.biz=lookoutall -jar lookout-all-1.6.0.snapshot.jar
```

**方式3：使用docker镜像**

服务端默认会连接到 `localhost:9200` 的ES实例, 而我所用的开发机器是MacOS，无法使用 `--net=host` 模式启动容器，因此在容器内无法通过 `localhost:9200` 连接ES，需要使用如下方式绕过去：

编辑一个配置文件，比如 `foo.properties`：

```properties
gateway.metrics.exporter.es.host=es
metrics-server.spring.data.jest.uri=http://es:9200
```

在 `foo.properties` 所在的目录下运行 all-in-one 镜像：

```bash
docker run -it \
--name allinone \
--link es:es \
-p 7200:7200 \
-p 9090:9090 \
-v $PWD/foo.properties:/home/admin/deploy/foo.properties \
-e JAVA_OPTS="-Dlookoutall.config-file=/home/admin/deploy/foo.properties" \
-e JAVA_OPTS="...定制JVM系统属性..." \
xzchaoo/lookout-allinone:1.6.0-SNAPSHOT
```

> 这里利用了docker的--link参数使得应用可以访问到ES实例
这里做测试用，所以不用-d参数在后台运行
