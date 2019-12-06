---
title: "User guide"
aliases: "/sofa-bolt/docs/sofa-bolt-handbook"
---

# User guide

## Maven coordinator

```xml
<dependency>
  <groupId>com.alipay.sofa</groupId>
  <artifactId>bolt</artifactId>
  <version>${version}</version>
</dependency>
```

>Check [release notes](https://github.com/sofastack/sofa-bolt/releases) for the version information.

## 1. Basic functions

### 1.1. Implement user request processor (UserProcessor)

We provide two types of user request processors: SyncUserProcessor and AsyncUserProcessor.
The difference between them is that the former returns the processing result in the form of a return value in the current processor thread, while the latter has an AsyncContext stub and can call the `sendResponse`method in the current thread or an asynchronous thread to return the processing result. For examples, refer to the following two types:

* [Synchronous request processor](https://github.com/sofastack/sofa-bolt/blob/master/src/test/java/com/alipay/remoting/rpc/common/SimpleServerUserProcessor.java)
* [Asynchronous request processor](https://github.com/sofastack/sofa-bolt/blob/master/src/test/java/com/alipay/remoting/rpc/common/AsyncServerUserProcessor.java)

### 1.2 Implement connection event processor (ConnectionEventProcessor)

We provide two connection event processors: ConnectionEventType.CONNECT and ConnectionEventType.CLOSE. You can create your own event processors and register them with the client or the server. The client side and server side can each monitor both of their connection and disconnection events.

* [Process connection event](https://github.com/sofastack/sofa-bolt/blob/master/src/test/java/com/alipay/remoting/rpc/common/CONNECTEventProcessor.java)
* [Process disconnection event](https://github.com/sofastack/sofa-bolt/blob/master/src/test/java/com/alipay/remoting/rpc/common/DISCONNECTEventProcessor.java)

### 1.3 Client side and server side initialization (RpcClient, RpcServer)

We have provided an RpcClient and RpcServer. They can be used after going through a simple initialization of necessary functions, or after switching on the functions. The most simple example is as follows:

* [Client side initialization example](https://github.com/sofastack/sofa-bolt/blob/master/src/test/java/com/alipay/remoting/demo/RpcClientDemoByMain.java)
* [Server side initialization example](https://github.com/sofastack/sofa-bolt/blob/master/src/test/java/com/alipay/remoting/demo/RpcServerDemoByMain.java)

### 1.4 Basic communication model

We have provided four types of communication models:

**1. Oneway calls**

The current thread initiates a call that is not interested in the call result and is not subject to timeout control. As long as the request is sent out, the call is completed. Note: Oneway calls are not guaranteed to succeed, and the initiator of the call has no way of knowing its result. For that reason, these calls are usually used in scenarios that can be retried or that have fixed-time notifications. Network problems or machine malfunctions during the call process may result in failure. This kind of call should only be used in business scenarios that accept such exceptions. For more information, see [Example](https://github.com/sofastack/sofa-bolt/blob/master/src/test/java/com/alipay/remoting/demo/BasicUsageDemoByJunit.java##L101).

**2. Sync calls**

The current thread initiates a call that only completes if it receives a result within the set timeout time. If a result is not received within the timeout time, it will generate a timeout error. This is the most commonly used call type. Ensure that the timeout time is set reasonably in accordance with the opposing terminal's processing capacity. For more information, see [Example](https://github.com/sofastack/sofa-bolt/blob/master/src/test/java/com/alipay/remoting/demo/BasicUsageDemoByJunit.java##L120).

**3. Future calls**

The current thread initiates a call and can then move onto executing the next call after getting an RpcResponseFuture object. The get() method of the RpcResponseFuture object can be used at any time to get the result. If the response has already been returned, the result can be acquired straight away. If the response has not been returned yet, the current thread is blocked until the response is turned or the response times out. For more information, see [Example](https://github.com/sofastack/sofa-bolt/blob/master/src/test/java/com/alipay/remoting/demo/BasicUsageDemoByJunit.java##L144).

**4. Callback asynchronous calls**

The current thread initiates a call and it immediately ends, allowing the execution of the next call. A callback needs to be registered when the call is initiated. This callback must be assigned an asynchronous thread pool. After waiting for a response to come back, the callback logic will be executed in the callback's asynchronous thread pool. For more information, see [Example](https://github.com/sofastack/sofa-bolt/blob/master/src/test/java/com/alipay/remoting/demo/BasicUsageDemoByJunit.java##L168).

### 1.5 Print logs

SOFABolt only depends on SLF4J as the logging facade. Three types of log template are available: log4j, log4j2, and logback. Users only need to depend on one type of log implementation during run-time. The sofa-common-tools component that we are relying on will dynamically sense which type of log implementation is being used during run-time. It will load the correct log template and print. The log is printed and saved under the `~/logs/bolt/` directory, and following types of logs are included:

* common-default.log: The default log. Prints ordinary logs from the communication process, such as those relating to the client side and server start-up/shut-down.
* common-error.log: The exceptions log. Prints framework operation errors.
* connection-event.log: The connection event log
* remoting-rpc.log: The log related to the RPC protocol

For log dependencies, refer to [ Log implementation dependencies](https://github.com/sofastack/sofa-bolt/wiki/log_implementation_jar).

## 2. Advanced functions

### 2.1 Request context

During the call process, we provide the InvokeContext API and pass it down. It can be acquired from the custom serializer and user request processor. We call context based on two scenarios:

* Client-side: The user can set some parameters valid for this request, such as serializer type or whether CRC (or other mechanisms) is enabled. At the same time, they can acquire information from the context like the time taken to establish a connection, connection information, etc.
* Server-side: The user can acquire the queuing time after the request arrival, connection information, and other such information from the user request processor.
* Note: The contexts of the client side and server side are independent. That is to say, the context set on the client side is only visible on the client side, and vice versa.
* [Examples](https://github.com/sofastack/sofa-bolt/blob/master/src/test/java/com/alipay/remoting/rpc/invokecontext/BasicUsage_InvokeContext_Test.java##L128)

### 2.2 Duplex communication

In addition to the server side being able to register user request processors, our client side can also register user request processors. When registered, the server side can initiate calls to the client side. It can also use [1.4](https://github.com/sofastack/sofa-bolt/wiki/SOFA-Bolt-Handbook##14-%E5%9F%BA%E7%A1%80%E9%80%9A%E4%BF%A1%E6%A8%A1%E5%9E%8B) to refer to any type of communication model.

* [Sample 1: Use the Connection object's duplex communication ](https://github.com/sofastack/sofa-bolt/blob/master/src/test/java/com/alipay/remoting/demo/BasicUsageDemoByJunit.java##L223). Note: When using the Connection object's duplex communication, the server side needs to save the Connection object through the event monitoring processor or the user request processor.
* [Sample 2: Use the Address duplex communication ](https://github.com/sofastack/sofa-bolt/blob/master/src/test/java/com/alipay/remoting/demo/BasicUsageDemoByJunit.java##L263). Note: When using the address method's duplex communication, when you initialize the RpcServer, enable manageConnection to indicate that the server side will maintain the mapping relationship between an address and the connection according to the connection initiated by the client side. When duplex communication is not needed by default, this function is disabled.

### 2.3 Establishing multiple connections and connection warm-up

Generally speaking, for point-to-point direct communication, or client side to server side, one IP to one connection object is sufficient. In terms of anything from throughput to concurrency, standard business communication needs can all be met. But there are other scenarios, such as non-P2P communication that goes through LVS VIP or F5 device connection instead, where fault tolerance and load balancing require establishing multiple connections for a single URL. The method below establishes multiple connections. When initiating the call, it adds the following parameter to the transmission URL: `127.0.0.1:12200? CONNECTIONNUM=30&_CONNECTIONWARMUP=true`, indicating that this IP address needs the establishment of 30 connections, and the connections need to be warmed up. The difference between warmed up and not warmed up:

* Warmed up: The first time it is called (e.g. Sync synchronous call), 30 links are established.
* Not warmed up: Every time it is called, it creates one connection until 30 have been established.
* [Examples](https://github.com/sofastack/sofa-bolt/blob/master/src/test/java/com/alipay/remoting/rpc/addressargs/AddressArgs_CONNECTIONNUM_Test.java##L234)

### 2.4 Automatic disconnection and reconnection

In the process of the RPC call, there is not usually disconnection or reconnection. This is because during every RPC call, it will check whether there is a usable connection, and if there is not, it will establish a new one. But in some scenarios, disconnecting and maintaining long connections are required:

* Automatic disconnection: For example, when establishing multiple connections through LVS VIP or F5, because of the network device's load balancing mechanism, some connections might be fix-mapped to the RS of several back ends. At this point, they need to disconnect and reconnect, relying on the randomness of the connection establishment process to implement the final load balancing. Note: In scenarios where automatic disconnection is enabled, it normally has to be used in cooperation with reconnection.
* Reconnection: For example, after the client side initiates connection establishment, the server side sends a request to the client side through duplex communication. If there is no reconnection mechanism at this time, it cannot be implemented.
* [Use case](https://github.com/sofastack/sofa-bolt/blob/master/src/test/java/com/alipay/remoting/rpc/connectionmanage/ScheduledDisconnectStrategyTest.java##L246). Remember to take into consideration that a process may have multiple SOFABolt communication instances. We have provided a global switch and user switch as the two different activation methods:

```java
  //Turn on or off through system attributes. If a process has multiple RpcClient, they take effect simultaneously.
  System.setProperty(Configs.CONN_MONITOR_SWITCH, "true");
  System.setProperty(Configs.CONN_RECONNECT_SWITCH, "true");
    
  //Turn on or off through the user switch. Only the current RpcClient instance is affected.
  client.enableReconnectSwitch();
  client.enableConnectionMonitorSwitch();
```

### 2.5 Serializer and deserializer

For the default serializer and deserializer, we currently recommend using Hessian. But considering the needs of different scenarios, we support the extension of the default serializer and the custom serializer's functional characteristics.

* Serializer extension: Implement an inherited serializer, then register and assign an index through SerializerManager. Sample code:

```java
   // 1. Implement Serializer
       public class HessianSerializer implements Serializer {
        @Override
        public byte[] serialize(Object obj) throws CodecException {
            ...
        }
    
        @Override
        public <T> T deserialize(byte[] data, String classOfT) throws CodecException {
        }
   }
       
   // 2. Register
   public static final byte    Hessian2    = 1;
   SerializerManager.addSerializer(Hessian2, new HessianSerializer());

   // 3. Set validity through system attributes
   System.setProperty(Configs.SERIALIZER, String.valueOf(Hessian2));
```

* Custom serializer: Implement a CustomSerializer type. Custom serializer and deserializer can be applied to Header and Content. At the same time, we have provided InvokeContext on the API, so the logic of the serializer and deserializer can be dynamically adjusted according to the request context.
* [Example](https://github.com/sofastack/sofa-bolt/blob/master/src/test/java/com/alipay/remoting/rpc/serializer/CustomSerializerCodecTest.java##L133)

## 3. Advanced functions

### 3.1 Enable I/O thread processing mechanism

By default, we use the thread model in the best practice to process requests, that is, occupying I/O threads as few as possible. But in some scenarios, such as when the computing process is simple, you may want to reduce thread switching and increase I/O throughput as much as possible. In these cases, we have provided a switch to allow business processing to be executed on the I/O thread.

* [Example](https://github.com/sofastack/sofa-bolt/blob/master/src/test/java/com/alipay/remoting/rpc/userprocessor/processinio/SpecificServerUserProcessor.java##L126)

### 3.2 Enable user processor multi-thread pool mechanism

In request processing, there is one thread pool by default. When a fault occurs on the thread pool, the overall throughput will decrease. But in some business scenarios, an individual thread pool needs to be allocated to the core request processing. In this way, interference between different requests can be avoided. Thereby, we have provided a thread pool selector.

* Implement a thread pool selector. [[Example]](https://github.com/sofastack/sofa-bolt/blob/master/src/test/java/com/alipay/remoting/rpc/userprocessor/executorselector/DefaultExecutorSelector.java)
* Then install it in the user request processor. During the calling process, it can select the corresponding thread pool based on the selector's logic. [[Example]](https://github.com/sofastack/sofa-bolt/blob/master/src/test/java/com/alipay/remoting/rpc/userprocessor/executorselector/BasicUsage_ExecutorSelector_Test.java##L91)

### 3.3 Request process timeout FailFast mechanism

After the server side receives a request, if the waiting time of the thread pool queue exceeds the timeout time of the client side upon calling initiation, then the calling can be discarded because it is no longer of use to the client side. (Note: this mechanism does not apply to the one-way calling method because it does need a timeout time to be set.) By default, this function is enabled. However, as users may need to make their own judgments about whether to discard requests, and at the same time print out logs to make records, we have provided a switch to control this function:

* Switch control

```java
    @Override
    public boolean timeoutDiscard() {
    return false;// true indicates automatic discarding being enabled; false indicates automatic discarding being disabled. Users can determine by themselves later in the processor
    }
```

* Determine timeout and print the log

```java
    public class SimpleClientUserProcessor extends SyncUserProcessor<RequestBody> {
       @Override
       public Object handleRequest(BizContext bizCtx, RequestBody request) throws Exception {
           if(bizCtx.isRequestTimeout()){
              log.info("arrive time: {}", bizCtx.getArriveTimestamp());
              ...
           }
       }
    }
```

### 3.3 Customize protocols

In scenarios where communications are relatively simple, we use the RPC communication protocol. Using the corresponding communication type can solve most problems. But in some scenarios, such as with information middleware, database middleware, etc., they have their own private communication protocols, and the bulk of request command types in such scenarios need to redefine their protocols. In these scenarios, SOFABolt is used as a protocol framework and as a component with basic communication functions, like base communication model and connection management functions, etc., which can be reused. For protocol-related parts that you need to develop and implement yourself, refer to the RPC protocol implementation content. [[Example]](https://github.com/sofastack/sofa-bolt/tree/master/src/main/java/com/alipay/remoting/rpc).

## 4. Related articles

* [Ant Financial communication framework practices](https://mp.weixin.qq.com/s/JRsbK1Un2av9GKmJ8DK7IQ)
* [Analysis | Overall design and scaling mechanism of the SOFARPC framework](https://mp.weixin.qq.com/s/ZKUmmFT0NWEAvba2MJiJfA)
* [SOFABolt lab](https://www.sofastack.tech/categories/sofabolt/)

