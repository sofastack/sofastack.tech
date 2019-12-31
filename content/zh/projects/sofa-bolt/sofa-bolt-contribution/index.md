---
title: "SOFABolt 参与贡献"
aliases: "/sofa-bolt/docs/Contribution"
---
# 参与贡献

开放代码允许在签署协议之后,提交贡献代码.

## 版权协议

对 SOFABolt 代码的修改和变更，需要遵守[版权协议](https://github.com/sofastack/sofa-bolt/blob/master/LICENSE)。

## 准备工作

- 贡献代码前需要先了解git工具的使用和GitHub网站的使用。
- git 工具用法可以查看git官方书籍,需要阅读前几章来熟悉。
- git 协作流程可以查看这篇文章Git协作流程

## GitHub 贡献代码流程

### 提issue

不论你是修复 Bolt 的bug还是新增 Bolt 的功能，在你提交代码之前，在 Bolt 的GitHub上提交一个 issue, 描述你要修复的问题或者要增加的功能。这么做有几个好处:

- 不会与其它开发者或是他们对这个项目的计划发生冲突,产生重复工作。Bolt 的维护人员会对你提的bug或者新增功能进行相关讨论，确定该修改是不是必要，有没有提升的空间或更好的办法。
- 在达成一致后再开发,并提交代码，减少双方沟通成本，也减少pull request被拒绝的情况。

### 获取源码

要修改或新增功能，在提issue后，点击左上角的fork按钮，复制一份 Bolt 主干代码到你的代码仓库。

### 拉分支

Bolt 所有修改都在分支上进行，修改完后提交 pull request ， 在code review 后由项目维护人员 merge 到主干。
因此，在获取源码步骤介绍后，你需要：

* 下载代码到本地,这一步你可以选择git/https方式.

```bash
git clone https://github.com/sofastack/sofa-bolt.git
```

* 拉分支准备修改代码

```java
git branch add_xxx_feature
```

* 执行完上述命令后，你的代码仓库就切换到相应分支了。执行如下命令可以看到你当前分支：

```java
git branch -a
```

* 如果你想切换回主干，执行下面命令:

```java
git checkout -b master
```

* 如果你想切换回分支，执行下面命令：

```java
git checkout -b "branchName"
```

* 想直接从github上拉取分支到本地

```java
git clone -b branchname https://xxx.git
```

### 修改代码提交到本地

拉完分支后，就可以修改代码了。

#### 修改代码注意事项

* 代码风格保持一致
Bolt 通过 Maven插件来保持代码格式一致.在提交代码前,务必本地执行

```java
mvn clean package
```

* 补充单元测试代码
* 新有修改应该通过已有的单元测试.
* 应该提供新的单元测试来证明以前的代码存在bugs，而新的代码已经解决了这些bugs.

你可以用如下命令运行所有测试

```java
mvn clean test
```

也可以通过IDE来辅助运行.

#### 其它注意事项

* 请保持你编辑的代码的原有风格,尤其是空格换行等.
* 对于无用的注释, 请直接删除
* 对逻辑和功能不容易被理解的地方添加注释.
* 及时更新文档
修改完代码后，执行如下命令提交所有修改到本地:

```java
git commit -am '添加xx功能'
```

### 提交代码到远程仓库

在代码提交到本地后，就是与远程仓库同步代码了。执行如下命令提交本地修改到github上：

```java
git push origin "branchname"
```

如果前面你是通过fork来做的,那么那么这里的 origin 是push到你的代码仓库，而不是 Bolt 的代码仓库.

### 提交合并代码到主干的请求

在你的代码提交到GitHub后，你就可以发送请求来把你改好的代码合入 Bolt 主干代码了。此时你需要进入你的 GitHub 上的对应仓库，按右上角的 pull request按钮。选择目标分支,一般就是主干master,
系统会通知 Bolt 的人员，Bolt 人员会 review 你的代码，符合要求后就会合入主干，成为 Bolt 主干代码的一部分。

#### 代码review

在你提交代码后，你的代码会被指派给维护人员review,请保持耐心。如果在数天后，仍然没有人对你的提交给予任何回复，可以在pull request下面留言,并@对应的人员.
对于代码review的意见会提交到对应issue。如果觉得建议是合理的，也请你把这些建议更新到你的补丁中。

#### 合并代码到主干

在代码 Bolt 通过后，就由 Bolt 维护人员操作合入主干了。这一步不用参与,review合并之后,你会收到合并成功的提示.

## Contributing to SOFABolt

SOFABolt is released under the Apache 2.0 license, and follows a very
standard Github development process, using Github tracker for issues and
merging pull requests into master . If you would like to contribute something, 
or simply want to hack on the code this document should help you get started.

### Sign the Contributor License Agreement

Before we accept a non-trivial patch or pull request we will need you to 
sign the Contributor License Agreement. Signing the contributor’s agreement 
does not grant anyone commit rights to the main repository, but it does mean 
that we can accept your contributions, and you will get an author credit if 
we do. Active contributors might be asked to join the core team, and given 
the ability to merge pull requests.

### Code Conventions

None of these is essential for a pull request, but they will all help. 

1. we provided a [code formatter file](AlipayFormatter.xml), it will formatting
automatically your project when during process of building.

2. Make sure all new `.java` files to have a simple Javadoc class comment 
with at least an `@author` tag identifying you, and preferably at least a 
paragraph on what the class is for.

3. Add the ASF license header comment to all new `.java` files (copy from existing files in the project)

4. Add yourself as an `@author` to the `.java` files that you modify substantially (more than cosmetic changes).

5. Add some Javadocs.

6. A few unit tests would help a lot as well — someone has to do it.

7. When writing a commit message please follow [these conventions](https://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html), if 
you are fixing an existing issue please add Fixes gh-XXXX at the end 
of the commit message (where XXXX is the issue number).
