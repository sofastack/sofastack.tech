
---

title: "服务器端 Metrics 存储扩展机制"
aliases: "/sofa-lookout/docs/useguide-storage-ext"
---

如果需要扩展支持适配一个新的数据存储，可能需要下面的步骤:

## 1.写入适配

- 需要在 gateway/metrics/exporter/ 下面添加新的 exporter;

  参考已有的 "gateway/metrics/exporter/elasticsearch" 模块；
  
- 提供个新存储的 MetricExporter

  功能是写入数据到存储中，参考"com.alipay.sofa.lookout.gateway.metrics.exporter.es.ESMetricExporter"，提供个新存储的 MetricExporter；

- 提供个该模块的 spring 配置类

  参考 "com.alipay.sofa.lookout.gateway.metrics.exporter.es.spring.bean.config.EsExporterConfiguration"，它包括 ESProperties 的配置描述映射。尤其重要的是带有注解 `@ConditionalOnExporterComponent`方便该功能开关；
  
- 在 "com.alipay.sofa.lookout.gateway.metrics.starter.MetricPipelineConfiguration" 中 @import 上述存储 spring 配置类；
  
## 2.查询数据适配

- 需要在 server/metrics 目录下，添加新 storage 扩展；

  参考  “server/metrics/storage-ext-es” 模块，比如新增“storage-ext-**”
  
- 提供个新的存储 Storage 实现；

  参考已有 “com.alipay.sofa.lookout.server.storage.ext.es.ElasticSearchStorage”，实现 Storage 接口。这里也需要 ES 实现对应的 “QueryStmt”，”LabelValuesStmt“，”LabelNamesStmt“.
  
- 提供个该模块的 spring 配置类

  参考"com.alipay.sofa.lookout.server.storage.ext.es.spring.bean.config.ElasticSearchServerConfig",提供 Storage 的实例。
另外参考支持”@ConditionalOnProperty“的功能开关配置；
  
- 在 "com.alipay.sofa.lookout.server.starter.ServerAutoConfiguration" 中 @import 上述存储 spring 配置类；

## 3.最后贡献建议

- 提 issue 说明需求，并可以介绍下方案；
- 保证测试覆盖；
- fork 代码，编译通过后，提交 PR；
  