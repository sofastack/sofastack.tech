---

title: "Quick start"
aliases: "/sofa-dashboard/docs/QuickStart"
---

This topic helps you quickly download, install, and use SOFADashboard on your computer.

## Prepare the environment

sofa-dashboard-backend needs to be run in a [Java](https://docs.oracle.com/cd/E19182-01/820-7851/inst_cli_jdk_javahome_t/) environment. Make sure that it can be used normally in the following runtime environments:

* JDK 1.8+: [Download](http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html) and [Configure](https://docs.oracle.com/cd/E19182-01/820-7851/inst_cli_jdk_javahome_t/).
* Maven 3.2.5+: [Download](https://maven.apache.org/download.cgi) and [Configure](https://maven.apache.org/settings.html).

sofa-dashboard-frontend uses the [Ant Design Pro](https://github.com/ant-design/ant-design-pro) scaffold. For more information about the frontend environment, see [Ant Design.](https://github.com/ant-design/ant-design/blob/master/README-zh_CN.md)

### Initialize the database

> MySQL version: 5.6+

SOFAArk control uses MySQL for resource data storage. You can find the SofaDashboardDB.sql script under the project directory and run this script to initialize database tables.

### ZooKeeper 

> ZooKeeper 3.4.x and ZooKeeper 3.5.x

Service governance and SOFAArk control of SOFADashboard are dependent on ZooKeeper, therefore you need to start the ZooKeeper service locally. For more information, see [ZooKeeper Document](https://zookeeper.apache.org/doc/current/zookeeperStarted.html).

## Run the backend project

```bash
> git clone https://github.com/sofastack/sofa-dashboard.git
> cd sofa-dashboard
> mvn clean package -DskipTests
> cd sofa-dashboard-backend/sofa-dashboard-web/target/
> java -jar sofa-dashboard-web-1.0.0-SNAPSHOT.jar
```

## Run the frontend project

sofa-dashboard-front is the frontend code-based project of SOFADashboard. It is developed based on the open-source frontend framework [antd](https://ant.design/) of Ant Financial.

```bash
> cd sofa-dashboard-front
> npm i
> npm start
```

