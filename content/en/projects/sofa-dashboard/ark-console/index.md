---

title: "SOFAArk control"
aliases: "/sofa-dashboard/docs/ArkConsole"
---

[SOFAArk](https://www.sofastack.tech/sofa-boot/docs/sofa-ark-readme) offers a variety of methods to support multi-application (module) consolidation and deployment, including command line-based control and API-based control. SOFAArk control is an implementation of SOFADashboard's control over APIs. SOFAArk control is implemented by pushing commands to and parsing commands in ZooKeeper.

SOFAArk control mainly provides the following functions:

* Plug-in registration: registers the ark-biz package with SOFADashboard as basic data processors.
* Application association: binds the ark-biz package with host applications.
* Plug-in details: On the plug-in details page, you can view the information about all host applications that are associated with the current ark-biz package, as well as the status information of the ark-biz package in these host applications.
* Command push: On the plug-in details page, you can push some commands for specific applications and IP addresses, such as install and uninstall. When these commands are written to a ZooKeeper node, all host applications that listen to this node will parse the commands and perform related operations.

## Plug-in registration

Register the ark-biz package with SOFADashboard:

![ark-console.png](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*xD_oSK6yq4AAAAAAAAAAAABjARQnAQ)

Enter basic information of the plug-in

![image.png](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*DsGNQau9wKQAAAAAAAAAAABjARQnAQ)

After successful registration, the plug-in is displayed on the module list as follows.

![image.png](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*3PnhQ7fqXAwAAAAAAAAAAABjARQnAQ)

## Application association

Click Associate application in the Actions column of a plug-in on the module list to associate it with an application.

![image.png](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*Xh6yQ7-txaIAAAAAAAAAAABjARQnAQ)

Click Associate application in the Actions column of the plug-in to associate it with an application.

![image.png](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*tnc-S7bSXOUAAAAAAAAAAABjARQnAQ)

## Plug-in details

Click Details in the Actions column of a plug-in to view all apps and app instances associated with the current plug-in.

![image.png](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*kJ5GTInKWD0AAAAAAAAAAABjARQnAQ)

* Version switch

![image.png](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*a1x5Rr5e1eMAAAAAAAAAAABjARQnAQ)

After switching the plug-in to V2.0.0, the status information is empty, because the plug-in V2.0.0 has not been installed in the host application.

## Command push

SOFADashboard supports command push in two dimensions:

* Application-based command push, where all instances of the specified application listen to this command
* IP-based and group-based command push for single-IP address scenarios

### IP-based command push

![image.png](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*TdyoQLZtf2QAAAAAAAAAAABjARQnAQ)

Click Install. The page is refreshed after about 1s to 1.5s.

![image.png](https://gw.alipayobjects.com/mdn/sofastack/afts/img/A*yDJEQJHJTDsAAAAAAAAAAABjARQnAQ)

> Application-based command push is similar.

