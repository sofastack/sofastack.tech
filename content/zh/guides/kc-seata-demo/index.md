---
title: "使用 Seata 保障支付一致性"
description: "该指南将向您展示如何使用开源分布式事务框架 Seata 的 AT 模式、TCC 模式解决业务数据的最终一致性问题。 "
github: "https://github.com/sofastack-guides/kc-seata-demo"
projects: [{name: "Seata", link: "https://github.com/seata/seata"}]
---
# 使用 Seata 保障支付一致性

**注意：您需要自行部署后端环境依赖，并修改示例中的服务依赖地址即可使用。**

在开始该demo之前先完成《[使用 SOFAStack 快速构建微服务](https://github.com/sofastack-guides/kc-sofastack-demo)》，如果没有完成，可以基于仓库里的kc-sofastack-demo工程为基线完成下面的demo，该demo是在它基础上加上Seata分布式事务。但该demo不是只能应用于SOFA，可以适用于任何java技术栈应用。

## AT 模式
#### 1、引入maven依赖

将下面的依赖引入到父工程的pom文件中（kc-sofastack-demo/pom.xml）:
```html

<properties>
    <seata.version>0.6.1</seata.version>
    <netty4.version>4.1.24.Final</netty4.version>
</properties>
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>io.seata</groupId>
            <artifactId>seata-all</artifactId>
            <version>${seata.version}</version>
        </dependency>

        <dependency>
            <groupId>io.seata</groupId>
            <artifactId>seata-server</artifactId>
            <version>${seata.version}</version>
            <exclusions>
                <exclusion>
                    <groupId>javax.servlet</groupId>
                    <artifactId>servlet-api</artifactId>
                </exclusion>
            </exclusions>
        </dependency>

        <dependency>
            <groupId>io.netty</groupId>
            <artifactId>netty-all</artifactId>
            <version>${netty4.version}</version>
        </dependency>
    </dependencies>
</dependencyManagement>

```

将下面的依赖引入到 stock-mng 工程的pom文件中（kc-sofastack-demo/stock-mng/pom.xml）:
```html

<dependencies>
    <dependency>
        <groupId>io.seata</groupId>
        <artifactId>seata-all</artifactId>
    </dependency>

    <dependency>
        <groupId>io.netty</groupId>
        <artifactId>netty-all</artifactId>
    </dependency>
<dependencies>

```

将下面的依赖引入到 balance-mng-impl 工程的pom文件中（kc-sofastack-demo/balance-mng/balance-mng-impl/pom.xml）:
```html

<dependencies>

    <dependency>
        <groupId>io.seata</groupId>
        <artifactId>seata-all</artifactId>
    </dependency>

    <dependency>
        <groupId>io.seata</groupId>
        <artifactId>seata-server</artifactId>
    </dependency>

    <dependency>
        <groupId>io.netty</groupId>
        <artifactId>netty-all</artifactId>
    </dependency>
<dependencies>

```

#### 2、使用Seata的DataSourceProxy代理实际的数据源，并配置GlobalTransactionScanner扫描@GlobalTransaction注解

将下面的java代码段加到 BalanceMngApplication 和 StockMngApplication 类的main方法下面:
```java

import io.seata.rm.datasource.DataSourceProxy;
import io.seata.spring.annotation.GlobalTransactionScanner;



public static void main(String[] args) {
    SpringApplication.run(BalanceMngApplication.class, args);
}

@Configuration
public static class DataSourceConfig {

    @Bean
    @Primary
    @ConfigurationProperties(prefix = "spring.datasource.hikari")
    public DataSource dataSource(DataSourceProperties properties) {
        HikariDataSource dataSource = createDataSource(properties, HikariDataSource.class);
        if (properties.getName()!=null && properties.getName().length() > 0) {
            dataSource.setPoolName(properties.getName());
        }
        return new DataSourceProxy(dataSource);
    }

    @SuppressWarnings("unchecked")
    protected static <T> T createDataSource(DataSourceProperties properties,
                                            Class<? extends DataSource> type) {
        return (T) properties.initializeDataSourceBuilder().type(type).build();
    }

    @Bean
    @Primary
    public GlobalTransactionScanner globalTransactionScanner(){
        return new GlobalTransactionScanner("kc-balance-mng", "my_test_tx_group");
    }
}

```
注意上面的dataSource方法返回的是DataSourceProxy代理的数据源

#### 3、配置@GlobalTransactional注解使分布式事务生效:

在BookStoreControllerImpl类的purchase方法上加入@GlobalTransactional注解:
```java

import io.seata.spring.annotation.GlobalTransactional;


@Override
@GlobalTransactional(timeoutMills = 300000, name = "kc-book-store-tx")
public Success purchase(String body) {
  
}
```

#### 4、配置Seata server:
简单起见，将Seata server和BalanceMngApplication一起启动，在BalanceMngApplication类中加入启动Seata server的代码:
```java

public static void main(String[] args) {

    startSeatServer();

    SpringApplication.run(BalanceMngApplication.class, args);
}

/**
 * The seata server.
 */
static Server server = null;

private static void startSeatServer(){

    new Thread(new Runnable() {

        public void run() {
            server = new Server();
            try {
                server.main(new String[] {"8091", StoreMode.FILE.name(), "127.0.0.1"});
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }
    }).start();

}

```

演示的Seata server使用本地文件作为存储，将下面两个文件复制到balance-mng-bootstrap和stock-mng工程的/src/main/resources目录下:
<br>文件名：file.conf
<br>文件内容：
```yaml

transport {
  # tcp udt unix-domain-socket
  type = "TCP"
  #NIO NATIVE
  server = "NIO"
  #enable heartbeat
  heartbeat = true
  #thread factory for netty
  thread-factory {
    boss-thread-prefix = "NettyBoss"
    worker-thread-prefix = "NettyServerNIOWorker"
    server-executor-thread-prefix = "NettyServerBizHandler"
    share-boss-worker = false
    client-selector-thread-prefix = "NettyClientSelector"
    client-selector-thread-size = 1
    client-worker-thread-prefix = "NettyClientWorkerThread"
    # netty boss thread size,will not be used for UDT
    boss-thread-size = 1
    #auto default pin or 8
    worker-thread-size = 8
  }
}
service {
  #vgroup->rgroup
  vgroup_mapping.my_test_tx_group = "default"
  #only support single node
  default.grouplist = "127.0.0.1:8091"
  #degrade current not support
  enableDegrade = false
  #disable
  disable = false
}
client {
  async.commit.buffer.limit = 10000
  lock {
    retry.internal = 10
    retry.times = 30
  }
}

## transaction log store
store {
  ## store mode: file、db
  mode = "file"

  ## file store
  file {
    dir = "file_store/seata"
  }
}

```

<br>文件名：registry.conf
<br>文件内容：
```yaml

registry {
  # file 、nacos 、eureka、redis、zk
  type = "file"

  nacos {
    serverAddr = "localhost"
    namespace = "public"
    cluster = "default"
  }
  eureka {
    serviceUrl = "http://localhost:1001/eureka"
    application = "default"
    weight = "1"
  }
  redis {
    serverAddr = "localhost:6379"
    db = "0"
  }
  zk {
    cluster = "default"
    serverAddr = "127.0.0.1:2181"
    session.timeout = 6000
    connect.timeout = 2000
  }
  file {
    name = "file.conf"
  }
}

config {
  # file、nacos 、apollo、zk
  type = "file"

  nacos {
    serverAddr = "localhost"
    namespace = "public"
    cluster = "default"
  }
  apollo {
    app.id = "fescar-server"
    apollo.meta = "http://192.168.1.204:8801"
  }
  zk {
    serverAddr = "127.0.0.1:2181"
    session.timeout = 6000
    connect.timeout = 2000
  }
  file {
    name = "file.conf"
  }
}

```

#### 5、创建undo_log表:
在balance_db和stock_db两个数据库中都创建undo_log表:
```sql

CREATE TABLE `undo_log` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `branch_id` bigint(20) NOT NULL,
  `xid` varchar(100) NOT NULL,
  `rollback_info` longblob NOT NULL,
  `log_status` int(11) NOT NULL,
  `log_created` datetime NOT NULL,
  `log_modified` datetime NOT NULL,
  `ext` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ux_undo_log` (`xid`,`branch_id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

```

#### 6、启动Seata server和stock-mng、balance-mng应用:
1. 运行BalanceMngApplication类的main方法(包含启动Seata server)
2. 运行StockMngApplication类的main方法
3. 浏览器打开 http://localhost:8080/index.html





## TCC 模式
#### 1、引入maven依赖

见上文AT模式的1、引入maven依赖

#### 2、实现TCC模式要求的三个接口: prepare、commit、rollback

1. 在balance-mng-facade工程的pom文件引入依赖(kc-sofastack-demo/balance-mng/balance-mng-facade/pom.xml):
```html

<dependencies>
    <dependency>
        <groupId>io.seata</groupId>
        <artifactId>seata-all</artifactId>
    </dependency>
</dependencies>
```
2. 在BalanceMngFacade接口增加三个方法:
```java

@TwoPhaseBusinessAction(name = "minusBalancePrepare", commitMethod = "minusBalanceCommit", rollbackMethod = "minusBalanceRollback")
boolean minusBalancePrepare(BusinessActionContext context,
                            @BusinessActionContextParameter(paramName = "userName") String userName,
                            @BusinessActionContextParameter(paramName = "amount") BigDecimal amount);

boolean minusBalanceCommit(BusinessActionContext context);

boolean minusBalanceRollback(BusinessActionContext context);
```

3. 在BalanceMngMapper接口中实现上面三个接口需要用的sql:
```java

@Update("update balance_tb set balance = balance - #{amount}, freezed = freezed +  #{amount} where user_name = #{userName}")
int minusBalancePrepare(@Param("userName") String userName, @Param("amount") BigDecimal amount);

@Update("update balance_tb set freezed = freezed - #{amount} where user_name = #{userName}")
int minusBalanceCommit(@Param("userName") String userName, @Param("amount") BigDecimal amount);

@Update("update balance_tb set balance = balance + #{amount}, freezed = freezed - #{amount} where user_name = #{userName}")
int minusBalanceRollback(@Param("userName") String userName, @Param("amount") BigDecimal amount);
```
4. 修改balance_tb的表结构，增加freezed（冻结金额）字段:
```sql

ALTER TABLE balance_tb add column freezed decimal(10,2) default 0.00;

```

5. 在BalanceMngImpl类中实现BalanceMngFacade接口中增加的三个方法:
```java

private static final Logger LOGGER = LoggerFactory.getLogger(BalanceMngImpl.class);

@Override
public boolean minusBalancePrepare(BusinessActionContext context, String userName, BigDecimal amount) {
    LOGGER.info("minus balance prepare begin ");
    LOGGER.info("minus balance prepare SQL: update balance_tb set balance = balance - {}, freezed = freezed + {}  where user_name = {}", amount, amount, userName);

    int effect = balanceMngMapper.minusBalancePrepare(userName, amount);
    LOGGER.info("minus balance prepare end");
    return (effect > 0);
}

@Override
public boolean minusBalanceCommit(BusinessActionContext context) {

    //分布式事务ID
    final String xid = context.getXid();

    final String userName = String.valueOf(context.getActionContext("userName"));

    final BigDecimal amount = new BigDecimal(String.valueOf(context.getActionContext("amount")));

    LOGGER.info("minus balance commit begin  xid: " + xid);
    LOGGER.info("minus balance commit SQL: update balance_tb set freezed = freezed - {}  where user_name = {}", amount, userName);

    int effect = balanceMngMapper.minusBalanceCommit(userName, amount);
    LOGGER.info("minus balance commit end");
    return (effect > 0);
}

@Override
public boolean minusBalanceRollback(BusinessActionContext context) {
    //分布式事务ID
    final String xid = context.getXid();

    final String userName = String.valueOf(context.getActionContext("userName"));

    final BigDecimal amount = new BigDecimal(String.valueOf(context.getActionContext("amount")));

    LOGGER.info("minus balance rollback begin  xid: " + xid);
    LOGGER.info("minus balance rollback SQL: update balance_tb set balance = balance + {}, freezed = freezed - {}  where user_name = {}", amount, amount, userName);

    int effect = balanceMngMapper.minusBalanceRollback(userName, amount);
    LOGGER.info("minus balance rollback end");
    return (effect > 0);
}

```

#### 3、取消使用AT模式的DataSourceProxy

TCC模式不需要代理数据源，因为不需要解析sql，生成undo log，在BalanceMngApplication类中注释掉dataSource和createDataSource方法:
```java

@Configuration
public static class DataSourceConfig {

    //@Bean
    //@Primary
    //@ConfigurationProperties(prefix = "spring.datasource.hikari")
    //public DataSource dataSource(DataSourceProperties properties) {
    //    HikariDataSource dataSource = createDataSource(properties, HikariDataSource.class);
    //    if (StringUtils.hasText(properties.getName())) {
    //        dataSource.setPoolName(properties.getName());
    //    }
    //    return new DataSourceProxy(dataSource);
    //}
    //
    //@SuppressWarnings("unchecked")
    //protected static <T> T createDataSource(DataSourceProperties properties,
    //                                        Class<? extends DataSource> type) {
    //    return (T) properties.initializeDataSourceBuilder().type(type).build();
    //}

    @Bean
    @Primary
    public GlobalTransactionScanner globalTransactionScanner(){
        return new GlobalTransactionScanner("kc-balance-mng", "my_test_tx_group");
    }
}

```

#### 4、BookStoreControllerImpl的purchase方法改成调用BalanceMngFacade.minusBalancePrepare方法:
```java

@Override
@GlobalTransactional(timeoutMills = 300000, name = "kc-book-store-tx")
public Success purchase(String body) {

    JSONObject obj = JSON.parseObject(body);
    String userName = obj.getString("userName");
    String productCode = obj.getString("productCode");
    int count = obj.getInteger("count");

    BigDecimal productPrice = stockMngFacade.queryProductPrice(productCode, userName);
    if (productPrice == null) {
        throw new RuntimeException("product code does not exist");
    }
    if (count <= 0) {
        throw new RuntimeException("purchase count should not be negative");
    }
    LOGGER.info("purchase begin  XID:" + RootContext.getXID());
    stockMngFacade.createOrder(userName, productCode, count);
    stockMngFacade.minusStockCount(userName, productCode, count);


    /* == 这里改成调minusBalancePrepare方法 == */
    balanceMngFacade.minusBalancePrepare(null, userName, productPrice.multiply(new BigDecimal(count)));
    /* ==== */

    LOGGER.info("purchase end");
    Success success = new Success();
    success.setSuccess("true");
    return success;
}

```

#### 5、StockMngImpl依赖的BalanceMngFacade接口改成使用xml方式引入:
BalanceMngFacade是一个rpc接口，之前的例子我们是用@SofaReference注解方式引入，目前TCC模式不支持注解的方式拦截（一下个版本修复），所以需要改成用xml的方法引入:
1. 在stock-mng工程的src/main/resources目录下创建spring目录，并创建seata-sofarpc-reference.xml:
```html

<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:sofa="http://sofastack.io/schema/sofaboot"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
            http://sofastack.io/schema/sofaboot http://sofastack.io/schema/sofaboot.xsd"
       default-autowire="byName">

    <sofa:reference id="balanceMngFacade" interface="io.sofastack.balance.manage.facade.BalanceMngFacade" unique-id="${service.unique.id}">
        <sofa:binding.bolt />
    </sofa:reference>

</beans>

```
2. 在StockMngApplication类上加入@ImportResource注解加载上面的spring配置文件
```java

@SpringBootApplication
@ImportResource("classpath*:spring/*.xml")
public class StockMngApplication {

```

3. 将BookStoreControllerImpl类中引用balanceMngFacade接口的注解换成@Autowared:
```java

//@SofaReference(interfaceType = BalanceMngFacade.class, uniqueId = "${service.unique.id}", binding = @SofaReferenceBinding(bindingType = "bolt"))
@Autowired
private BalanceMngFacade balanceMngFacade;

```

#### 6、启动Seata server和stock-mng、balance-mng应用:

1. 运行BalanceMngApplication类的main方法(包含启动Seata server)
2. 运行StockMngApplication类的main方法
3. 浏览器打开 http://localhost:8080/index.html

## 更多

- [下载本次 Demo 幻灯片](https://gw.alipayobjects.com/os/basement_prod/04ed66e1-b962-4593-8924-ba2b0c096fe4.pdf)
