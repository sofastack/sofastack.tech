---

title: "Java SDK"
aliases: "/sofa-registry/docs/JAVA-SDK"
---

## 1. Create a Maven project and import the dependency

```xml
<dependency>
    <groupId>com.alipay.sofa</groupId>
    <artifactId>registry-client-all</artifactId>
    <version>${registry.client.version}</version>
</dependency>
```

## 2. Create the SOFARegistry client instance

The key code for creating the SOFARegistry client instance is as follows:

```java
RegistryClientConfig config =  DefaultRegistryClientConfigBuilder.start().setRegistryEndpoint("127.0.0.1").setRegistryEndpointPort(9603).build();
DefaultRegistryClient registryClient = new DefaultRegistryClient(config);
registryClient.init();
```

Properties related to SOFARegistry are specified by the DefaultRegistryClientConfigBuilder class, which provides the following key properties:

```java
public class DefaultRegistryClientConfigBuilder {
    private String  instanceId;
    private String  zone                      = DEFAULT_ZONE;
    private String  registryEndpoint;
    private int     registryEndpointPort      = 9603;
    private String  dataCenter                = DEFAULT_DATA_CENTER;
    private String  appName;
    private int     connectTimeout            = 3000;
    private int     socketTimeout             = 3000;
    private int     invokeTimeout             = 1000;
    private int     recheckInterval           = 500;
    private int     observerThreadCoreSize    = 5;
    private int     observerThreadMaxSize     = 10;
    private int     observerThreadQueueLength = 1000;
    private int     syncConfigRetryInterval   = 30000;
}
```

| Property | Type | Description |
| --- | --- | --- |
| instanceId | String | The ID of the instance. Default value: DEFAULT_INSTANCE_ID. The same instance ID must be used for data publishing and subscription. The unique data identifier consists of dataId+group+instanceId. |
| zone | String | The zone where the instance is located. Default value: DEFAULT_ZONE. |
| registryEndpoint | String | The endpoint of any session node of the servers. |
| registryEndpointPort | Integer | The session.server.httpServerPort configured for a session node. Default value: 9603. |
| dataCenter | String | The data center of SOFARegistry. Default value: DefaultDataCenter. |
| appName | String | The name of the app that accesses SOFARegistry. |
| connectTimeout | Integer | Specifies the timeout for establishing a connection with a server. Default value: 3000 ms. |
| socketTimeout | Integer | Specifies the timeout for accessing the servers' REST API. Default value: 3000 ms. |
| invokeTimeout | Integer | Specifies the timeout for calling services on the servers. Default value: 1000 ms. |
| recheckInterval | Integer | Specifies the interval for checking the task queue. Default value: 500 ms. |
| observerThreadCoreSize | Integer | Specifies the number of core threads in the thread pool that process data pushed from the servers. Default value: 5. |
| observerThreadMaxSize | Integer | Specifies the maximum number of threads in the thread pool that process data pushed from the servers. Default value: 10. |
| observerThreadQueueLength | Integer | Specifies the maximum thread queue length of the thread pool that processes data pushed from the servers. Default value: 1000. |
| syncConfigRetryInterval | Integer | Specifies the retry interval to synchronize the registry server. Default value: 30000 ms. |

## 3. Publish data

The key code for publishing data is as follows:

```java
// Create a publisher registry.
PublisherRegistration registration = new PublisherRegistration("com.alipay.test.demo.service:1.0@DEFAULT");
registration.setGroup("TEST_GROUP");
registration.setAppName("TEST_APP");

// Register the registry with the client and publish data.
Publisher publisher = registryClient.register(registration, "10.10.1.1:12200?xx=yy");

// If you need to overwrite data published previously, you can use the publisher model to republish the data.
publisher.republish("10.10.1.1:12200?xx=zz");
```

The key for publishing data is to create the PublisherRegistration class, which provides three properties:

| Property | Type | Description |
| --- | --- | --- |
| dataId | String | The data ID. Use the same data ID for data publishing and subscription. A unique data identifier comprises dataId+group+instanceId. |
| group | String | The data group. Default value: DEFAULT_GROUP. Use the same data group for data publishing and subscription. A unique data identifier comprises dataId+group+instanceId. |
| appName | String | The name of the app that accesses SOFARegistry. |

## 4. Subscribe to the data

The key code for data subscription is as follows:

```java
// Create SubscriberDataObserver. 
SubscriberDataObserver subscriberDataObserver = new SubscriberDataObserver() {
    @Override
    public void handleData(String dataId, UserData userData) {
        System.out.println("receive data success, dataId: " + dataId + ", data: " + userData);
    }
};

// Create a subscriber registry and specify the subscription level. ScopeEnum covers three subscription levels: zone, dataCenter, and global.
String dataId = "com.alipay.test.demo.service:1.0@DEFAULT";
SubscriberRegistration registration = new SubscriberRegistration(dataId, subscriberDataObserver);
registration.setGroup("TEST_GROUP");
registration.setAppName("TEST_APP");
registration.setScopeEnum(ScopeEnum.global);

// Register the registry with the client and subscribe to the data. <Register the registry with the client and subscribe to the data. The subscribed data will be sent to SubscriberDataObserver in the form of a callback.
Subscriber subscriber = registryClient.register(registration);
```

To subscribe to data, you need to create two key classes: SubscriberDataObserver and SubscriberRegistration. The former is the callback interface that will be executed after the client receives data from the servers, and the latter is the subscriber registration class that registers subscription information with the servers.

### 4.1 SubscriberDataObserver

The SubscriberDataObserver only provides one method:

```java
void handleData(String dataId, UserData data);
```

Parameter description

| Name | Type | Description |
| :--- | :--- | --- |
| dataId | String | The data ID. |
| data | UserData | The content of the data. |

The UserData class wraps the content of the data and provides the following methods:

```java
public interface UserData {
    Map<String, List<String>> getZoneData();
    String getLocalZone();
}
```

* getLocalZone: returns the current zone.
* getZoneData: returns data by taking zone as the key, and data of each zone as the value.

### 4.2 SubscriberRegistration

SubscriberRegistration provides the following properties:

| Property | Type | Description |
| --- | --- | --- |
| dataId | String | The data ID. Use the same data ID for data publishing and subscription. A unique data identifier comprises dataId+group+instanceId. |
| group | String | The data group. Default value: DEFAULT_GROUP. Use the same data group for data publishing and subscription. A unique data identifier comprises dataId+group+instanceId. |
| appName | String | The name of the app that accesses SOFARegistry. |
| ScopeEnum | ScopeEnum | The enumeration value of any of the three subscription scope types: zone, dataCenter, and global.|
| subscriberDataObserver | SubscriberDataObserver | The callback interface to be executed after Client receives the subscribed data. |

## 5. Unregistration and unsubscription

The interface for unregistration and unsubscription is as follows:

```java
int unregister(String dataId, String group, RegistryType registryType);
```

Request parameters

| Parameter | Type | Description |
| --- | --- | --- |
| dataId | String | The data ID. |
| group | String | The data group. |
| registryType | RegistryType | The enumeration value of any of the three types: PUBLISHER, SUBSCRIBER, and CONFIGURATOR. |

The Integer values returned by the method show the numbers of unregistered and unsubscribed users.

