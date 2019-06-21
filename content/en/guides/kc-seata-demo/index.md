---
title: "Seata distributed transaction practice"
description: "This guide introduces how to use the AT mode and TCC mode of the open-source distributed transaction framework Seata to solve the final consistency of service data."
github: "https://github.com/sofastack-guides/kc-seata-demo"
projects: [{name: "Seata", link: "https://github.com/seata/seata"}]
---

SEATA Demo for SOFAStack Cloud Native Workshop on KubeCon China 2019

## AT mode

#### 1.Introduce maven dependencies

Introduce the following dependencies into the POM file of the parent project (seata-demo-at/pom.xml):

```xml
...
<properties>
    ...
    <seata.version>0.6.1</seata.version>
    <netty4.version>4.1.24.Final</netty4.version>
</properties>
...
<dependencyManagement>
    <dependencies>
        ...

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

Introduce the following dependencies into the POM file of the stock-mng project (seata-demo-at/stock-mng/pom.xml):

```xml
<dependencies>
....
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

Introduce the following dependencies into the POM file of the balance-mng-impl project (seata-demo-at/balance-mng/balance-mng-impl/pom.xml):

```xml
<dependencies>
....
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

#### 2. Use Seata's DataSourceProxy to proxy actual data source and configure GlobalTransactionScanner to scan @GlobalTransaction annotation

Add the following java snippet to the main methods in BalanceMngApplication and StockMngApplication classes:

```java
...
import io.seata.rm.datasource.DataSourceProxy;
import io.seata.spring.annotation.GlobalTransactionScanner;
...

@Configuration
public static class DataSourceConfig {

    @Bean
    @Primary
    @ConfigurationProperties(prefix = "spring.datasource.hikari")
    public DataSource dataSource(DataSourceProperties properties) {
        HikariDataSource dataSource = createDataSource(properties, HikariDataSource.class);
        if (StringUtils.hasText(properties.getName())) {
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

Note that the above dataSource method returns the data source of the DataSourceProxy.


#### 3. Configure @GlobalTransactional annotation to validate the distributed transaction effective

Add the @GlobalTransactional annotation to the purchase method in the BookStoreControllerImpl class:


```java
...
import io.seata.spring.annotation.GlobalTransactional;
...

@Override
@GlobalTransactional(timeoutMills = 300000, name = "kc-book-store-tx")
public Success purchase(String body) {
  ...
}
```

#### 4. Configure Seata server

For simplicity, start Seata server together with BalanceMngApplication, and add the code to start Seata server in the BalanceMngApplication class:


```java
...
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
...
```

The Seata server in demo uses local file as storage. Copy the following two files to the `/src/main/resources` directory in the balance-mng-bootstrap and stock-mng projects:

<br>File name: file.conf
<br>File content:

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

<br>File name: registry.conf
<br>File content:

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

#### 5. Create undo_log table

Create an undo_log table in both the balance_db and stock_db databases:

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

#### 6. Start Seata server, stock-mng and balance-mng applications

1. Run the main method of BalanceMngApplication class (including starting Seata server)
1. Run the main method of StockMngApplication class
1. Visit http://127.0.0.1:8080/ in the browser


## TCC mode

#### 1. Introduce maven dependencies

See above for AT mode

#### 2. Implement three interfaces required by TCC mode: prepare, commit, rollback

1. Introduce dependencies in the POM file of balance-mng-facade project:

```xml
...
<dependencies>
    <dependency>
        <groupId>io.seata</groupId>
        <artifactId>seata-all</artifactId>
    </dependency>
</dependencies>

```

2. Add three methods to the BalanceMngFacade interface:

```java
...
@TwoPhaseBusinessAction(name = "minusBalancePrepare", commitMethod = "minusBalanceCommit", rollbackMethod = "minusBalanceRollback")
boolean minusBalancePrepare(BusinessActionContext context,
                            @BusinessActionContextParameter(paramName = "userName") String userName,
                            @BusinessActionContextParameter(paramName = "amount") BigDecimal amount);

boolean minusBalanceCommit(BusinessActionContext context);

boolean minusBalanceRollback(BusinessActionContext context);

```

3. Implement the SQL required for the above three interfaces in the BalanceMngMapper interface:

```java
...
@Update("update balance_tb set balance = balance - #{amount}, freezed = freezed +  #{amount} where user_name = #{userName}")
int minusBalancePrepare(@Param("userName") String userName, @Param("amount") BigDecimal amount);

@Update("update balance_tb set freezed = freezed - #{amount} where user_name = #{userName}")
int minusBalanceCommit(@Param("userName") String userName, @Param("amount") BigDecimal amount);

@Update("update balance_tb set balance = balance + #{amount}, freezed = freezed - #{amount} where user_name = #{userName}")
int minusBalanceRollback(@Param("userName") String userName, @Param("amount") BigDecimal amount);

```

4. Modify the table structure of balance_tb and add the freezed field:

```sql
ALTER TABLE balance_tb add column freezed decimal(10,2) default 0.00;

```

5. Implement the three methods added to the BalanceMngFacade interface in the BalanceMngImpl class:

```java
...
private static final Logger LOGGER = LoggerFactory.getLogger(BalanceMngImpl.class);

@Override
public boolean minusBalancePrepare(BusinessActionContext context, String userName, BigDecimal amount) {
    LOGGER.info("minus balance prepare begin ...");
    LOGGER.info("minus balance prepare SQL: update balance_tb set balance = balance - {}, freezed = freezed + {}  where user_name = {}", amount, amount, userName);

    int effect = balanceMngMapper.minusBalancePrepare(userName, amount);
    LOGGER.info("minus balance prepare end");
    return (effect > 0);
}

@Override
public boolean minusBalanceCommit(BusinessActionContext context) {

    //Transcation ID
    final String xid = context.getXid();

    final String userName = String.valueOf(context.getActionContext("userName"));

    final BigDecimal amount = new BigDecimal(String.valueOf(context.getActionContext("amount")));

    LOGGER.info("minus balance commit begin ... xid: " + xid);
    LOGGER.info("minus balance commit SQL: update balance_tb set freezed = freezed - {}  where user_name = {}", amount, userName);

    int effect = balanceMngMapper.minusBalanceCommit(userName, amount);
    LOGGER.info("minus balance commit end");
    return (effect > 0);
}

@Override
public boolean minusBalanceRollback(BusinessActionContext context) {
    //Transcation ID
    final String xid = context.getXid();

    final String userName = String.valueOf(context.getActionContext("userName"));

    final BigDecimal amount = new BigDecimal(String.valueOf(context.getActionContext("amount")));

    LOGGER.info("minus balance rollback begin ... xid: " + xid);
    LOGGER.info("minus balance rollback SQL: update balance_tb set balance = balance + {}, freezed = freezed - {}  where user_name = {}", amount, amount, userName);

    int effect = balanceMngMapper.minusBalanceRollback(userName, amount);
    LOGGER.info("minus balance rollback end");
    return (effect > 0);
}

```

#### 3、Cancel the DataSourceProxy using AT mode

The TCC mode does not need proxy data source, since there is no need to parse sql, generate an undo log, and comment out the dataSource and createDataSource methods in the BalanceMngApplication class:


```java
...
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

#### 4、Change BookStoreControllerImpl purchase method to the BalanceMngFacade.minusBalancePrepare method:

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
    LOGGER.info("purchase begin ... XID:" + RootContext.getXID());
    stockMngFacade.createOrder(userName, productCode, count);
    stockMngFacade.minusStockCount(userName, productCode, count);
    balanceMngFacade.minusBalancePrepare(null, userName, productPrice.multiply(new BigDecimal(count)));
    LOGGER.info("purchase end");
    Success success = new Success();
    success.setSuccess("true");
    return success;
}

```

#### 5. Introduce BalanceMngFacade interface that StockMngImpl depends on using XML

BalanceMngFacade is an RPC interface. In the previous example, it is introduced by @SofaReference annotation. Currently, the TCC mode does not support annotation interception (the next version is fixed), so it is required to change to XML method:

1. Create a spring directory in src/main/resources directory of stock-mng project and create `seata-sofarpc-reference.xml`:

```xml
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

2. Add @ImportResource annotation on the StockMngApplication class to load the above spring configuration file:


```java
...
@SpringBootApplication
@ImportResource("classpath*:spring/*.xml")
public class StockMngApplication {
...

```

3. Replace the annotation to reference balanceMngFacade interface in BookStoreControllerImpl class with @Autowared:

```java
...
//@SofaReference(interfaceType = BalanceMngFacade.class, uniqueId = "${service.unique.id}", binding = @SofaReferenceBinding(bindingType = "bolt"))
@Autowired
private BalanceMngFacade balanceMngFacade;
...

```

#### 6. Start Seata server, stock-mng and balance-mng applications:
1. Run the main method in BalanceMngApplication class (including starting Seata server)
1. Run the main method in StockMngApplication class
1. Visit http://127.0.0.1:8080/ in the browser