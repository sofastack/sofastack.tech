---

title: "Client usage"
aliases: "/sofa-registry/docs/Client-QuickStart"
---

## 1. Create a Maven project

After deploying the servers, we can create a new Maven project to use services provided by SOFARegistry. Create a new Maven project, and then import the following dependency:

```xml
<dependency>
    <groupId>com.alipay.sofa</groupId>
    <artifactId>registry-client-all</artifactId>
    <version>${registry.client.version}</version>
</dependency>
```

## 2. Publish data

```java
// Create a client instance.
RegistryClientConfig config = DefaultRegistryClientConfigBuilder.start().setRegistryEndpoint("127.0.0.1").setRegistryEndpointPort(9603).build();
DefaultRegistryClient registryClient = new DefaultRegistryClient(config);
registryClient.init();

// Create a publisher registry.
String dataId = "com.alipay.test.demo.service:1.0@DEFAULT";
PublisherRegistration registration = new PublisherRegistration(dataId);

// Register the registry with the client and publish data.
registryClient.register(registration, "10.10.1.1:12200?xx=yy");
```

Perform the following steps to publish data by using SOFARegistry:

1. Create a client instance.
1. Create a publisher registry.
1. Register the registry with the client and publish data.

### 2.1 Create a client instance

The key to creating a client instance is to create a RegistryClientConfig object. When creating a RegistryClientConfig object, you need to specify the RegistryEndpoint and RegistryEndpointPort.

* RegistryEndpoint: the endpoint of any session node of SOFARegistry
* RegistryEndpointPort: the session.server.httpServerPort port number configured for a session node

### 2.2 Create a publisher registry

To create a publisher registry, you only need to create a PublisherRegistration object and specify the dataId, which is the unique identifier of the publisher service.

### 2.3 Publish data

You can call the register method of the RegistryClient to publish data. This method requires two parameters: the first is a publisher registry with the specified dataId of a service, and the second is a string type data value.

## 3. Subscribe to the data

```java
// Create a client instance.
RegistryClientConfig config = DefaultRegistryClientConfigBuilder.start().setRegistryEndpoint("127.0.0.1").setRegistryEndpointPort(9603).build();
DefaultRegistryClient registryClient = new DefaultRegistryClient(config);
registryClient.init();

// Create SubscriberDataObserver. 
SubscriberDataObserver subscriberDataObserver = new SubscriberDataObserver() {
  	public void handleData(String dataId, UserData userData) {
    		System.out.println("receive data success, dataId: " + dataId + ", data: " + userData);
  	}
};

// Create a subscriber registry and specify the subscription level. ScopeEnum covers three subscription levels: zone, dataCenter, and global.
String dataId = "com.alipay.test.demo.service:1.0@DEFAULT";
SubscriberRegistration registration = new SubscriberRegistration(dataId, subscriberDataObserver);
registration.setScopeEnum(ScopeEnum.global);

// Register the registry with the client and subscribe to the data. The subscribed data will be sent to SubscriberDataObserver in the form of a callback.
registryClient.register(registration);
```

Perform the following steps to subscribe to data by using SOFARegistry:

1. Create a client instance.
2. Create SubscriberDataObserver.
3. Create a subscriber registry.
4. Register the registry with the client and subscribe to data.

The client instance creation step is identical to that of the data publication step as described previously.

### 3.1 Create SubscriberDataObserver

SubscriberDataObserver is a callback interface that defines the handleData method, which provides two parameters: the dataId and the final data. This method will be called when the client receives the subscribed data. In SOFARegistry, data is returned from the servers in the form of UserData. This UserData class provides the following two methods:

```java
public interface UserData {
    Map<String, List<String>> getZoneData();
    String getLocalZone();
}
```

* getLocalZone: returns the current zone.
* getZoneData: returns data by taking zone as the key, and data of each zone as the value.

### 3.2 Create a subscriber registry

To create a subscriber registry, you need to create a SubscriberRegistration object by specifying the dataId and the SubscriberDataObserver.

### 3.3 Subscribe to data

You can call the register method of RegistryClient for data subscription. The register method requires only one parameter, that is the SubscriberRegistration object.

If we run first the data publication program and then the data subscription program, we can see the following output on the console:

```plain
receive data success, dataId: com.alipay.test.demo.service:1.0@DEFAULT, data: DefaultUserData{zoneData={DEFAULT_ZONE=[10.10.1.1:12200?xx=yy]}, localZone='DEFAULT_ZONE'}
```

