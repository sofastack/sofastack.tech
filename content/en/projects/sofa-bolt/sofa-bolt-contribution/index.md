---
title: "How to contribute to SOFABolt"
aliases: "/sofa-bolt/docs/Contribution"
---

# How to contribute

SOFABolt's code is open source. You can submit your contributions to the code after signing the required agreement.

## Contributor License Agreement

Alterations and modifications made to SOFABolt's code must comply with the [Contributor License Agreement.](https://github.com/sofastack/sofa-bolt/blob/master/LICENSE)

## Prerequisites

Before contributing any code, you need to know how to use the Git tool and the GitHub website.

For the use of Git tools, refer to the official Pro Git book and get familiar with the tools by reading the first few chapters.

For the Git collaboration process, refer to Git Workflows.

## GitHub Code Contribution Process

### Submit an issue

Regardless of whether you are fixing a Bolt bug or adding a Bolt feature, submit an issue on the Bolt GitHub address to describe the bug you are going to fix or the feature you intend to add before you submit the code. There are several advantages of doing so:

- There will not be any conflict with other developers or their plans for this project. This avoids repetitive work.
- The Bolt maintenance personnel will discuss the issue or new feature you submitted to determine whether the modification is necessary, or if there is any room for improvement or a better solution.
- Start developing and submitting code after agreement to reduce the cost of communication between both parties as well as the number of rejected pull requests.

### Get the source code

To modify or add a feature after submitting an issue, click the fork button in the upper left corner to copy the Bolt's master branch code to your code repository.

### Pull a branch

All Bolt modifications are performed on branches. After the modification, submit a pull request. The modifications will then be merged into the master branch by the project maintenance personnel after the code review.
Therefore, after getting familiar with the getting source code step, you need to:

* Download the code locally. You may select the git/https mode in this step.

```bash
git clone https://github.com/sofastack/sofa-bolt.git
```

* Pull a branch to prepare for code modification.

```java
git branch add_xxx_feature
```

* After the preceding command is executed, your code repository is switched to the corresponding branch. To view the current branch, execute the following command:

```java
git branch -a
```

* If you want to switch back to the master branch, execute the following command:

```java
git checkout -b master
```

* If you want to switch back to your branch, execute the following command:

```java
git checkout -b "branchName"
```

* If you want to directly pull a branch from GitHub, execute the following command:

```java
git clone -b branchname https://xxx.git
```

### Modify the code and submit it locally

After a branch is pulled, you can modify the code.

#### When modifying the code, note the following:

* Keep the code style consistent.
Bolt uses the Maven plug-in to keep the code style consistent. Before submitting the code, be sure to execute the following command locally.

```java
mvn clean package
```

* Add the unit test code.
* Modifications should have passed existing unit tests.
* You should provide a new unit test to prove that the previous code has bugs and the bugs have been fixed in the new code.

Execute the following command to run all tests:

```java
mvn clean test
```

You can also use IDE to help run a test.

#### Other do's and don'ts

* Retain the original style of the code you are editing, especially the usage of spaces and line feeds in the code.
* Delete unnecessary comments.
* Add comments where the logic and functionality are difficult to understand.
* Update documents in a timely manner.
After the code is modified, execute the following command to submit all modifications to the local repository:

```java
git commit -am 'Add xx feature'
```

### Submit the code to a remote repository

After being submitted to the local repository, the code is synchronized to a remote repository. Execute the following command to submit the local modification to GitHub:

```java
git push origin "branchname"
```

If you clicked the 'fork' button to get the source code, the modified code is pushed to your code repository rather than the Bolt repository.

### Submit a request for merging the code into the master branch

After submitting the code to GitHub, you can send a request to merge your modified code into Bolt's master branch. To do so, enter the corresponding repository on your GitHub and click the Pull Request button in the upper right corner. Select the target branch (usually master), 
and the system will notify the Bolt maintenance personnel, who will review your code and merge it into Bolt's master branch code if it meets the requirements.

#### Code review

After you submit the code, it will be assigned to maintenance personnel for review. Wait patiently for the review result. If you have not received a reply after several days, leave a message under the PR, and put an at (@) sign before the name of the responsible person.
The code review comments are submitted to the corresponding issue. If you find the suggestions reasonable, update your patch based on the comments.

#### Merge the code into the master branch

After your code passes the review, the Bolt maintenance personnel merges it into the master branch. You do not need to get involved in this step. After the code is merged, you will receive a message.

## Contribute to SOFABolt

SOFABolt is released under the Apache 2.0 license, and follows a very
standard Github development process, using Github tracker for issues and
merging pull requests into master. If you would like to contribute something,
or simply want to hack on the code, this document should help you get started.

### Sign the Contributor License Agreement

Before we accept a non-trivial patch or pull request we will need you to
sign the Contributor License Agreement. Signing the contributor’s agreement
does not grant anyone commit rights to the main repository, but it does mean
that we can accept your contributions, and you will get an author credit if
we do. Active contributors might be asked to join the core team, and given
the ability to merge pull requests.

### Code Conventions

None of these is essential for a pull request, but they will all help.

1. We provided a [code formatter file](AlipayFormatter.xml), it will format
your project automatically when you create the project.

2. Make sure all new `.java` files have a simple Javadoc class comment
with at least an `@author` tag identifying you, and preferably at least a
paragraph on what the class is for.

3. Add the ASF license header comment to all new `.java` files (copy from existing files in the project)

4. Add yourself as an `@author` to the `.java` files that you modify substantially (more than cosmetic changes).

5. Add some Javadocs.

6. A few unit tests would help a lot as well — someone has to do it.

7. When writing a commit message please follow [these conventions](https://tbaggery.com/2008/04/19/a-note-about-git-commit-messages.html), if
you are fixing an existing issue please add Fixes gh-XXXX at the end
of the commit message (where XXXX is the issue number).

