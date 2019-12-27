---
title: "Quick start guide"
aliases: "/sofa-mosn/docs/docs-quickstart-Setup"
---

This article is intended to help developers who are new to the MOSN project to quickly build a development environment, and compile, test, package, and run sample code.

Note: MOSN is developed based on Go 1.12.7 and uses dep for dependency management.

## Prepare running environment

+ If you use a container to run MOSN, you must [install Docker](https://docs.docker.com/install/) first.
+ If you use a local machine, you must use a Unix-like environment.
+ Install Go's build environment.
+ Install dep. See the [official installation documentation](https://golang.github.io/dep/docs/installation.html).

## Get codes

The codes for the MOSN project are hosted in [GitHub](https://github.com/mosn/mosn) and can be obtained in the following way:


```bash
go get mosn.io/mosn
```

If an error occurs when run "go get", just create the project manually.

```bash
# Enter src dirctory under GOPATH
cd $GOPATH/src
# Create mosn.io dirctory
mkdir -p mosn.io
cd mosn.io

# clone MOSN codes
git clone git@github.com:mosn/mosn.git
cd sofa-mosn
```

The final path of MOSN source codes is `$GOPATH/src/mosn.io/mosn`.

## Import by using IDE

Use the Golang IDE to import the `$GOPATH/src/mosn.io/mosn` project. Goland is recommended.

## Compile codes

In the project root directory, select the following command to compile the MOSN binary file according to your machine type and the environment where you want to execute binary:

**Compile with Docker image**

```bash
make build // compile linux 64bit executable binary
```
**non-docker, local compilation**

Compile local executable binary files.

```bash
make build-local
```
Non-Linux machine compiles Linux 64-bit executable binary files crosswise.

```bash
make build-linux64
```
Non-Linux machine compiles Linux 32-bit executable binary files crosswise.

```bash
make build-linux32
```
Once compiled, the compiled binary files can be found in the `build/bundles/${version}/binary` directory.

## Create image

Run the following command to create an image:

```bash
make image
```

## Run test

In the project root directory, run the unit test:

```bash
make unit-test
```

In the project root directory, run the integrate test(slow):

```bash
make integrate
```

## Start MOSN from configuration file

```bash
 ./mosn start -c '$CONFIG_FILE'
```

## Start MOSN forwarding sample program

See the [sample project](../quick-start-run-samples) in the `examples` directory.

## Use MOSN to build a Service Mesh platform

See [Integrate Istio](../quick-start-run-with-sofamesh).
