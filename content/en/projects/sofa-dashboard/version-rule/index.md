---

title: "Version rules"
aliases: "/sofa-dashboard/docs/VersionRule"
---

## Version number

Major, minor, and revision version numbers are used. For example, 1.0.0.

For more information, see [https://semver.org/](http://semver.org/lang/zh-CN/)

* Major version number: All versions with the same major version number must be compatible with each other. They are not necessarily fully compatible with other major versions. However, it is best to be downward compatible.
* Minor version number: represents feature enhancement. The larger the version number, the more features it has.
* Revision version number: represents the BugFix version. Such versions are only used for bug fixing. The larger the version number, the more stable the application.

## Version maintenance

Up to two versions can be maintained simultaneously.

For example, if the current version of the master branch code is `1.2.0`, the BugFix branch `1.1.x` will be maintained, but bugs in branch `1.0.x` will no longer be fixed. In this case, a version upgrade is recommended.

## Release process

* The develop branches use SNAPSHOT versions, for example, `1.0.0-SNAPSHOT`.
* Upon formal release, the snapshot version is modified to the formal version, for example `1.0.0`.
* After the formal release, the next version is pulled, for example, `1.0.1-SNAPSHOT`.

