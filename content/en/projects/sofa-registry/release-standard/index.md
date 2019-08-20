---

title: "Version rules"
aliases: "/sofa-registry/docs/Release-Standard"
---

## Version number

SOFARegistry uses a three-digit version number in the form of major, minor, and patch. For example, 5.2.0.

For more information, see [https://semver.org/](http://semver.org/lang/zh-CN/).

* Major version number: All versions with the same major version number must be compatible with each other. They are not necessarily fully compatible with other major versions. However, it is best to be downward compatible.
* Minor version number: represents feature enhancement. The larger the version number, the more features it has.
* Patch number: represents the BugFix version. Such versions are only used for bug fixing. The larger the version number, the more stable the application.

## Version maintenance

Up to two versions can be maintained simultaneously.

For example, if the current version of the master branch code is 5.4.0, the BugFix branch of version 5.3.x will be maintained, but bugs in branch 5.2.x will no longer be fixed. Therefore, a version upgrade for 5.2.x is recommended.

## Release process

* The develop branches use SNAPSHOT versions, for example, 5.3.0-SNAPSHOT.
* Upon formal release, SNAPSHOT is replaced with a formal version number, for example 5.3.0.
* After the formal release, the next version is pulled, for example, 5.3.1-SNAPSHOT.

