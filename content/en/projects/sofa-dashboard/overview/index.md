---

title: "SOFADashboard overview"
aliases: "/sofa-dashboard/docs/Home"
---

SOFADashboard is designed to implement unified management over SOFA framework components, including service governance and SOFAArk control. All technology stacks used by SOFADashboard are developed and constructed based on open-source community products, such as Ant Design Pro, SOFABoot, Spring, and MyBatis.

Currently, service governance and SOFAArk control of SOFADashboard are dependent on ZooKeeper. Therefore, you need to ensure the ZooKeeper service is available when you decide to use SOFADashboard. You also need to ensure that MySQL is available, because SOFAArk control and deployment uses MySQL for resource data storage.

## Architecture

![image.png](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*uVAiQKWS4G4AAAAAAAAAAABjARQnAQ)

Currently, service governance and SOFAArk control of SOFADashboard are implemented upon ZooKeeper-based programming.

* SOFADashboard backend corresponds to the sofa-dashboard-backend project. It is the server end project of SOFADashboard, responsible for data interaction between ZooKeeper and MySQL and for providing the rest API to the SOFADashboard frontend.
* SOFADashboard frontend corresponds to the sofa-dashboard-frontend project. It is the frontend project of SOFADashboard. It provides UIs for interaction with users.
* Application
   * rpc provider: service provider of SOFARPC, which registers services with ZooKeeper.
   * rpc consumer: service consumer of SOFARPC, which subscribes to services on ZooKeeper.
   * client: SOFADashboard client, which is available upon the installation of the sofa-dashboard-client package. Currently, the SOFADashboard client only supports registration of health-check status and port information of applications with ZooKeeper. Later on, it will evolve into SOFABoot client, and report more diversified application data.
   * ark-biz host app: see [SOFAArk ](https://www.sofastack.tech/sofa-boot/docs/sofa-ark-ark-config).

