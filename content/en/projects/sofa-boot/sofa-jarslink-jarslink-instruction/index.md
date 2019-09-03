---
title: "Interactive instruction"
aliases: "/sofa-boot/docs/sofa-jarslink-jarslink-instruction"
---

Jarslink2.0 supports receiving dynamic commands at runtime to manage the Biz package lifecycle. Before starting an Ark package that has introduced the Jarslink2.0 plugin, you can send commands through the telnet connection protocol with port 1234. For example, execute `telnet ip 1234` to enter the Jarslink2.0 command interface and type "help" in the interface to obtain all relevant command manuals. Next we will introduce the syntax of each Jarslink2.0 command.

+ Install the Biz package:  The installation command is used to dynamically deploy of applications. Its syntax is install -b $bizFile. You can replace -b with -biz. All Jarslink2.0 commands must contain either a –b or –biz. The "install" command has only one parameter, the Biz package URI, which can either be the path of a local file or the link to a remote file, for example, install -b file:///Users/qilong.zql/sample-ark-biz.jar. 


+ Uninstall the Biz package: The uninstall command is used to close the application. The services released by the application and the resources that it occupied will be destroyed. Command syntax: uninstall -b -n $bizName -v $bizVersion. The command must specify the name and version number of the Biz package by -n and -v, which can be replaced with -name and -version. The name and version number of a Biz package are determined at the time of packaging. For detailed information, see [Application Packaging](../sofa-jarslink-jarslink-repackage).


+ Switch the Biz package: The switch command is used for the Biz package hot update to ensure service continuity. Jarslink2.0 allows loading different versions of Biz packages with the same name at runtime. However, only one Biz package can deliver services at one time. To upgrade the loaded Biz package that is delivering services at runtime, execute the installation command to install a later version of the Biz package. After installation, the newer version is inactive because the older version is providing services. Execute the switch command to switch to the newer version without suspending the services that the application is delivering. This is called a hot update. The command syntax is switch -b -n $bizName -v $bizVersion. Parameters are the same as the above.


+ Query the Biz package: The query command is used to query the Biz packages installed in JVM and their status. The command syntax is check -b -n $bizName -v $bizVersion, where the Biz package's name and version number are optional parameters. If you do not specify the name and the version number, information for all Biz packages will be returned. If you only specify the name, information for all versions with the specified name will be returned.
