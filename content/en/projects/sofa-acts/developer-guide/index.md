---

title: "Developer guide"
aliases: "/sofa-acts/docs/DeveloperGuide"
---

## 1. How to compile

> Install JDK7 or later versions, and Maven 3.2.5 or later versions.
Directly download the code, and execute the following command in the code directory:

```
mvn clean install
```

## 2. Version release

### Version number

ACTS uses a three-digit version number in the form of major, minor, and patch, for example, 1.0.1.

For more information, see [https://semver.org/](http://semver.org/lang/zh-CN/).

* Major version number: All versions within a major version number must be compatible with each other. They are not necessarily compatible with other major versions. However, it is best to be downward compatible.
* Minor version number: represents feature enhancement. The larger the version number, more features it has.
* Patch number: represents the BugFix version. Such versions are only used for bug fixing. The larger the version number, the more stable the application is.

### Version maintenance

At most two versions can be maintained simultaneously.

For example, if the current version of the master branch code is `1.3.0`, the BugFix branch of version `1.2.x` will be maintained, but bugs in branch `1.1.x` will no longer be fixed. Therefore, a version upgrade for 1.1.x is recommended.

### Release process

* The develop branches use SNAPSHOT versions, for example, `1.3.0-SNAPSHOT`.
* Upon formal release, SNAPSHOT is replaced with a formal version number, for example `1.3.0`.
* After the formal release, the next version is pulled, for example, `1.3.1-SNAPSHOT`.

## 3. Testing

### Unit test

Add the unit test case to the model that you have developed. The package name of the test class is identical to that of the tested class.

