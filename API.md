# API Reference

* [DeviceClient](#DeviceClient)
  * [Constructor](#deviceConstructor)
  * [Events](#Events)
  * [Methods](#deviceMethods)
    * [connect](#connect)
    * [close](#close)
  * [Properties](#deviceProperty)
    * [connected](#connected)
    * [reconnected](#reconnected)
    * [deviceData](#deviceData)
      * [queryTag](#queryTag)
      * [updateTag](#updateTag)
      * [deleteTag](#deleteTag)
      * [queryAttribute](#queryAttribute)
      * [updateAttribute](#updateAttribute)
      * [deleteAttribute](#deleteAttribute)
      * [postMeasurepoint](#postMeasurepoint)
      * [resumeMeasurepoint](#resumeMeasurepoint)
      * [batchPostMeasurepoint](#batchPostMeasurepoint)
      * [batchResumeMeasurepoint](#batchResumeMeasurepoint)
      * [postEvent](#postEvent)
      * [upRawModel](#upRawModel)
    * [deviceCommand](#deviceCommand)
      * [onInvokeService](#onInvokeService)
      * [onSetMeasurepoint](#onSetMeasurepoint)
* [GatewayClient](#GatewayClient)
  * [Properties](#gatewayProperties)
    * [subDeviceManagament](#subDeviceManagament)
      * [registerDevice](#registerDevice)
      * [getTopo](#getTopo)
      * [addTopo](#addTopo)
      * [deleteTopo](#deleteTopo)
      * [loginSubDevice](#loginSubDevice)
      * [logoutSubDevice](#logoutDevice)
      * [batchLoginSubDevice](#batchLoginSubDevice)
      * [onSubDevicesEnable](#onSubDevicesEnable)
      * [onSubDevicesDisable](#onSubDevicesDisable)
      * [onSubDevicesDelete](#onSubDevicesDelete)
* [DeviceInfo](#DeviceInfo)
  * [Constructor](#deviceInfoConstrcutor)
  * [Properties](#deviceProperties)
    * [productKey](#devicePK)
    * [deviceKey](#deviceDK)
    * [productSecret](#devicePS)
    * [deviceSecret](#deviceDS)
* [SubDeviceInfo](#SubDeviceInfo)
  * [Constructor](#subDeviceInfoConstrcutor)
  * [Properties](#subDeviceProperties)
      * [productKey](#subDevicePK)
      * [deviceKey](#subDeviceDK)
      * [productSecret](#subDevicePS)
      * [deviceSecret](#subDeviceDS)
      * [timestamp](#timestamp)
      * [clientId](#clientId)
      * [cleanSession](#cleanSession)
* [SECURE_MODE](#SECURE_MODE)

> Note: There are 2 kinds of parameters in this document:   
>   param: ***  indicates a required parameter   
>   [param]: *** indicates an optional parameter

<a name='DeviceClient'></a>
## DeviceClient

Core class that can establish connection between a device and EnOS Cloud.   
After a connection is established, you can call the methods of this class to make the device report data to and receive commands from EnOS cloud.   
As this class is inherited from [events.EventEmitter](https://nodejs.org/api/events.html), relevent events will be triggered when a connection is established, a command is received, or a connection is closed. For more information, see [Events](#Events).

---

<a name='deviceConstructor'></a>
### Constructor

```javascript
DeviceClient(clientOptions)
```

**Arguments**

* clientOptions - `Object` required for device connection, whose parameters are as follows:
  * brokerUrl - `string` The address of EnOS cloud.
  * secureMode  - `SECURE_MODE` Security mode. For the values of `SECURE_MODE`, see [SECURE_MODE](#SECURE_MODE).
  * productKey -  `string` The product key of a device.
  * deviceKey - `string` The device key of a device.
  * [productSecret] - `string` The product secret required if you use dynamic authentication.
  * [deviceSecret] - `string` The device secret required if you use static authentication.
  * [ca] - `string | Buffer | Array<string | Buffer>` Root certificate, required if you use certificate-based authentication.
  * [pfx] - `string | Buffer | Array<string | Buffer | Object>` Private key + device certificate.
  * [passphrase] - `string` Private key password.
  * [key] - `string | Buffer | Array<string | Buffer | Object>` Private key on the device side
  * [cert] - `string | Buffer | Array<string | Buffer>` Device certificate   
  * [mqttOptions] - MQTT-specific parameter, which includes the following:
    * [connectionTimeout] - `number` The longest wating time for connection. The unit being second and the default value 30 seconds.
    * [reconnectPeriod] - `number` Reconnection interval, the unit being second. The default value is 3 seconds, indicating that reconnection is attempted every 3 seconds. 0 indicates the reconnection is disabled.
    * [keepAlive] - `number`. The unit is second and default value 60 seconds. 0 indicates the keepAlive is disabled.

**Sample**

```javascript
const clientOptions = {
  brokerUrl: 'brokerUrl',
  secureCode: SECURE_MODE.VIA_DEVICE_SECRET,
  productKey: 'productKey', deviceKey: 'deviceKey', deviceSecret: 'deviceSecret',
  mqttOptions: {
    connectionTimeout: 30,
    reconnectPeroid: 0, // The reconnection is disabled.
    keepAlive: 0 // The keepAlive disalbed.
  }
}
const client = new DeviceClient(clientOptions);
```

---

<a name='Events'></a>
### Events

#### Event `'connect'`

```javascript
client.on('connect', () => { console.log('connected') });
```

This event is triggered when a connection or reconnection is established.

#### Event `'close'`

```javascript
client.on('close', () => { console.log('connection is disconnected') });
```

This event is triggered when a connection is closed, whether manually or due to an exception.

If `reconnectPeriod` is not 0 when the connection is established, and the connection is not closed manually, a reconnection will be initiated after a `close` event.

#### Event `'message'`

```javascript
client.on('message', (topic, message) => {
  console.log(`${topic}:${message}`);
})
```

This event is triggered when a command or message response from the cloud is received

* topic - `string` Topic of the received message
* message - `Buffer` Payload of the message

#### Event `'error'`

```javascript
client.on('error', (err) => { console.log('err: ', err); })
```

This event is triggered when a parsing error or connection exception occurs.

---

<a name='deviceMethods'></a>
### Methods

#### connect()

```typescript
function connect(): Promise<string>
```

Establishing a connection between a device and the cloud.   
An event named `connect` is triggered when the connection is established successfully.   
The authentication modes for the connection between a device and EnOS Cloud are as follows, corresponding to the different parameter values to `clientOptions` in [Constructor](#constructor):

1. Per-device secret authentication   
   `brokerUrl` should be a TCP-protocol-based url.   
   `secureMode` should be [SECURE_MODE](#SECURE_MODE).VIA_DEVICE_SECRET.   
   `productKey、deviceKey、deviceSecret` are required.

2. Per-product secret authentication   
   `brokerUrl` should be a TCP-protocol-based url.   
   `secureMode` should be [SECURE_MODE](#SECURE_MODE).VIA_PRODUCT_SECRET.   
   `productKey、deviceKey、productSecret`are required.

3. X.509-certificate-based authentication   
   `brokerUrl` should be a TCP-protocol-based url.   
   `secureMode` should be [SECURE_MODE](#SECURE_MODE).VIA_DEVICE_SECRET   
   `productKey、deviceKey、deviceSecret` are required.  
   Either `pfx` or `key/cert` is required.

**Response**

Promise\<string>

* deviceSecret - `string` Device secret (for dynamic authentication)

**Sample**

```javascript
client.connect()
  .then(deviceSecret => {
    console.log('deviceSecret: ', deviceSecret);
  })
  .catch(err => {
    console.log('err: ', err);
  })
```

---

#### close()

```typescript
function close(): Promise<void>
```

Closing a connection between a device and the cloud.   
An event named `close` is triggered after the connection to the cloud is closed.

**Sample**

```javascript
client.close()
  .then(() => {
    console.log('connection closed')
  })
  .catch(err => {
    console.log('err: ', err);
  })
```

---

<a name='deviceProperty'></a>
### Properties

<a name='connected'></a>
#### connected  `boolean`

Indicates whether or not the device is connected to the cloud.   
For first connection and reconnection, the value is `true`. For disconnected connection, the value is `false`.

<a name='reconnected'></a>
#### reconnected  `boolean`

Indicates whether the device is reconnected.    
For first connection, the value is `false`.

<a name='deviceData'></a>
#### deviceData `Object`

Methods for reporting data is included in this attribute. These methods have common request parameters and response values.
In the following explanation, common parameters will be omitted in request parameters. In the response, only unique elements in `data` will be explained.

<a name='upstreamRequest'></a>
**Common request parameters**

 * [deviceInfo] - `DeviceInfo` Information of the sub-device. Used for indicating sub-devices of a gateway device.
 * [qos] - `number` Level of QoS (quality of service). Supports `0` or `1`.
 * [needReply] - `boolean` Indicates whether the response from the cloud needs to be waited. The default value is `true`.

<a name='upstreamResponse'></a>
**Common response structure**

* response - `UpstreamResponse` The response object.
  * id - `string` Request ID.
  * code - `number` Response code. `200` indicates success.
  * data - `object | string | void`. Detailed response information. Explanation is included in the method definitions.
  * [message] - `string` If the response code is not `200`, [message] indicates the exception information.

---

<a name='queryTag'></a>
#### deviceData#queryTag(queryParams)

```typescript
function queryTag(queryParams: Object): Promise<UpstreamResponse>
```

Query tag information of devices.

**Arguments**

* [queryParams] - `Object` Query parameter object.
  * [tagKeys] - `string[]` Key-value list for tags.
  * [Common parameters：deviceData/qos/needReply](#upstreamRequest)

**Response**

> For more information on the response object `UpstreamResponse`, see [Common response format](#upstreamResponse)

* data - `{key: value}` Key-value pair for tag.

  ```javascript
  { key1: 'value1', key2: 'value2' }
  ```

**Sample**

```javascript
client.deviceData.queryTag()
  .then(response => {
    console.log(response.code, response.data);
  })
  .catch(err => {
    console.log('err: ', err);
  })
```

---

<a name='updateTag'></a>

#### deviceData.updateTag(updateParams)

```typescript
function updateTag(updateParams: Object): Promise<UpstreamResponse>
```

Report tag information

**Arguments**

* updateParams - `Object`
  * tags - `{tagKey: string, tagValue: string}[]`  List of tags to be reported.
  * [Common parameters: deviceData/qos/needReply](#upstreamRequest)

**Response**

> For more information on `UpstreamResponse`, see [Common response format](#upstreamResponse)

* data - `string` `1` will be returned if the update is successful.

**Sample**

```javascript
const updateTagResponse = await client.deviceData.updateTag({
  tags: [
    {tagKey: 'test', tagValue: 'aaaaa'},
    {tagKey: 'waitingDelete', tagValue: 'delete'}
  ]
});
```

---

<a name='deleteTag'></a>

#### deviceData#deleteTag(deleteParams)

```typescript
function deleteTag(deleteParams: Object): Promise<UpstreamResponse>
```

Delete tag information

**Arguments**

deleteParams - `Object`

* tagKeys - `string[]`  The list of tag keys to be deleted
* [Common parameters：deviceData/qos/needReply](#upstreamRequest)

**Response**

> For more information on `UpstreamResponse`, see [Common response format](#upstreamResponse)

* data - `string` `1` will be returned if the deletion is successful.

**Sample**

```javascript
const deleteTagResponse = await client.deviceData.deleteTag({
  tagKeys: ['waitingDelete']
});
```

---

<a name='queryAttribute'></a>

#### deviceData#queryAttribute(queryParams)

```typescript
function queryAttribute(queryParams: Object): Promise<UpstreamResponse>
```

Get Attribute Information

**Arguments**

[queryParams] - `Object`

* [attributeIds] - `string[]`  List of attribute IDs to be queried.
* [Common parameters：deviceData/qos/needReply](#upstreamRequest)

**Response**

> For more information on `UpstreamResponse`, see [Common response format](#upstreamResponse)

* data - `Object`. Attribute map obtained. For example, `{age: 30}`.

**Sample**

```javascript
const queryAttributeResponse = await client.deviceData.queryAttribute({
  attributeIds: []
});
```

---

<a name='updateAttribute'></a>

#### deviceData#updateAttribute(updateParams)

```typescript
function updateAttribute(updateParams: Object): Promise<UpstreamResponse>
```

Report Attribute Information

**Arguments**

updateParams - `Object`

* attributeMap - `{[x: string]: Object}`  A map of key-value attribute pairs to be reported

  ```javascript
  // example:
  { age: 300, name: 'test' }
  ```

* [Common parameters：deviceData/qos/needReply](#upstreamRequest)

**Response**

> For more information on `UpstreamResponse`, see [Common response format](#upstreamResponse)

* data - `string` An empty string is returned if the update is successful.

**Sample**

```javascript
const updateAttributeResponse = await client.deviceData.updateAttribute({
  attributeMap: {
    age: 900,
    attribute_struct: {
      struct_int: 10,
      struct_string: 'test'
    }
  }
});
```

---

<a name='deleteAttribute'></a>

#### deviceData#deleteAttribute(deleteParams)

```typescript
function deleteAttribute(deleteParams: Object): Promise<UpstreamResponse>
```

Delete Attribute Information

**Arguments**

deleteParams - `Object`

* attributeIds - `string[]`  List of attribute IDs to be deleted
* [Common parameters：deviceData/qos/needReply](#upstreamRequest)

**Response**

> For more information on `UpstreamResponse`, see [Common response format](#upstreamResponse)

* data - `string` An empty string is returned if the deleting is successful.

**Sample**

```javascript
const deleteAttributeResponse = await client.deviceData.deleteAttribute({
  attributeIds: ['age']
});
```

---

<a name='postMeasurepoint'></a>

#### deviceData#postMeasurepoint(postParams)

```typescript
function postMeasurepoint(postParams: Object): Promise<UpstreamResponse>
```

Report a Device Measurement Point

**Arguments**

postParams - `Object`

* point - `Object`  Measurement point information to be reported.
  * measurepoints - `{[x: string]: Object}`
  * [time] - `number` The timestamp for this measurement point. When not specified, the value is the server time.
* [Common parameters：deviceData/qos/needReply](#upstreamRequest)

**Response**

> For more information on `UpstreamResponse`, see [Common response format](#upstreamResponse)

* data - `string`

**Sample**

```javascript
const postMpResponse = await client.deviceData.postMeasurepoint({
  point: {
    measurepoints: {
      mp_struct: {
        sub_age: 100,
        sub_gender: 'male'
      }
    }
  }
});
```

---

<a name='resumeMeasurepoint'></a>
#### deviceData#resumeMeasurepoint(resumeParams)

```typescript
function resumeMeasurepoint(resumeParams: Object): Promise<UpstreamResponse>
```

Report an Offline Measurement Point

**Arguments**

resumeParams - `Object` Same as in [postMeasurepoint](#postMeasurepoint)

**Response**

> For more information on `UpstreamResponse`, see [Common response format](#upstreamResponse)

* data - `string` `1` will be returned if the reporting is successful.

**Sample**

```javascript
const resumeMpResponse = await client.deviceData.resumeMeasurepoint({
  point: {
    measurepoints: {
      mp_struct: {
        sub_age: 50,
        sub_gender: 'female'
      }
    },
    time: new Date('2019-12-11 00:00').getTime()
  }
});
```

---

<a name='batchPostMeasurepoint'></a>

#### deviceData#batchPostMeasurepoint(postParams)

```typescript
function batchPostMeasurepoint(postParams: Object): Promise<UpstreamResponse>
```

Report Measurement Points in Batch

Measurement points are reported in batch in the following scenarios:

* A gateway device reports the measurement point data of its sub-devices.
* A device that is directly connected to EnOS reports data of different timestamps.
* A mixture of the previous two scenarios.

**Arguments**

postParams - `Object`

* points - `Object[]`  List of measurement points to be reported
  * [productKey] - `string` Used to specify the sub-device of a gateway device
  * [deviceKey] - `string` Used to specify the sub-device of a gateway device
  * measurepoints - `{[x: string]: Object}`  Measurement point information
  * [time] - `number` The timestamp for this measurement point. When not specified, the value is the server time.
* [allowOfflineSubDevice] - `boolean` Whether to allow sending measurement point data for offline devices. False by default. If sending data of offline device is not allowed and the request contains an offline device, the entire request is declined.
* [skipInvalidMeasurepoints] - `boolean` Whether to neglect invalid measurement point data in a request. False by default. If the value is set to false and the request contains invalid measurement point data, the entire request is declined.
* [Common Parameters：deviceData/qos/needReply](#upstreamRequest)

**Response**

> For more information on `UpstreamResponse`, see [Common response format](#upstreamResponse)

* data - `string` `1` will be returned if the reporting is successful.

**Sample**

```javascript
const batchPostMpResponse = await client.deviceData.batchPostMeasurepoint({
  points: [
    {
      measurepoints: {
        mp_age: 50
      }
    },
    {
      measurepoints: {
        mp_age: 10
      },
      time: new Date('2019-10-20 20:00').getTime()
    }
  ]
});
```

---

<a name='batchResumeMeasurepoint'></a>
#### deviceData#batchResumeMeasurepoint(resumeParams)

```typescript
function batchResumeMeasurepoint(resumeParams: Object): Promise<UpstreamResponse>
```

Report Offline Measurement Points in Batch

Offline measurement points are reported in batch in the following scenarios:

* A gateway device reports the measurement point data of its sub-devices.
* A device that is directly connected to EnOS reports data of different timestamps.
* A mixture of the previous two scenarios.

**Arguments**

resumeParams - `Object` Same as in [batchPostMeasurepoint](#batchPostMeasurepoint)

**Response**

Same as in [batchPostMeasurepoint](#batchPostMeasurepoint)

**Sample**

```javascript
const batchResumeMpResponse = await client.deviceData.batchResumeMeasurepoint({
  points: [
    {
      measurepoints: {
        mp_age: 200
      }
    },
    {
      measurepoints: {
        mp_age: 30
      },
      time: new Date('2019-10-20 20:00').getTime()
    }
  ]
});
```

---

<a name='postEvent'></a>
#### deviceData#postEvent(postEventParams)

```typescript
function postEvent(postEventParams: Object): Promise<UpstreamResponse>
```

Report Device Events

**Arguments**

postEventParams - `Object`

* eventName - `string` Event name
* eventParams - `any` Event parameters
* [Common parameters：deviceData/qos/needReply](#upstreamRequest)

**Response**

> For more information on `UpstreamResponse`, see [Common response format](#upstreamResponse)

* data - `string` An empty string is returned if the reporting is successful.

**Sample**

```javascript
const postEventResponse = await client.deviceData.postEvent({
  eventName: 'event_test',
  eventParams: {
    isMale: 2,
    isChild: 10
  }
});
```

---

<a name='upRawModel'></a>
#### deviceData#upRawModel(rawDataParams)

```typescript
function upRawModel(rawDataParams: Object): Promise<Buffer>
```

Send raw data such as a binary data stream to the cloud

**Arguments**

rawDataParams - `Object`

* rawData - `Buffer`  Information to be reported
* [Common parameters：deviceData/qos/needReply](#upstreamRequest)

**Response**

Promise<Buffer>
The response of this method is Buffer

**Sample**

```javascript
const rawData = [0x00, 0x00, 0x00, 0x14];
const rawDataResult = await client.deviceData.upRawModel({
  rawData: Buffer.from(rawData)
});
```

---

<a name='deviceCommand'></a>
#### deviceCommand `Object`

The methods of device receiving commands from the cloud is included in this attribute.

<a name='commandRequest'></a>
**Command Request Structure** CommandRequest

* messageId - `string` Message ID
* version - `string` Protocol version
* method - `string` Request method
* params - `any` Command parameters

<a name='commandResponse'></a>
**Command Response Structure** CommandResponse

* send(code, [data], [callback]) - `function` Sends response data to cloud
  * code - `number`  Error code. `200` indicates success.
  * [data] - `Object` Detailed response information.

---

<a name='onInvokeService'></a>
#### deviceCommand#onInvokeService(serviceName, [deviceInfo], callback)

```typescript
function onInvokeService(serviceName: string, deviceInfo?: DeviceInfo, callback: (request: CommandRequest, response: CommandResponse) => void): Promise<UpstreamResponse>
```

Call Device Services

**Arguments**

* serviceName - `string` Service name
* [deviceInfo] - `DeviceInfo` Sub-device information
* callback(request, response) - `function` Callback after receiving a command
  * request - `CommandRequest` See [CommandRequest](#commandRequest)
  * response - `CommandResponse` See [CommandResponse](#commandResponse)

**Sample**

```javascript
client.deviceCommand.onInvokeService('resetAge', (request, response) => {
  console.log('invoke service request: ', request.params);
  response.send(200);
});
```

---

<a name='onSetMeasurepoint'></a>
#### deviceCommand#onSetMeasurepoint([deviceInfo], callback)

```typescript
function onSetMeasurepoint(deviceInfo?: DeviceInfo, callback: (request: CommandRequest, response: CommandResponse) => void): Promise<UpstreamResponse>
```

Set Device Measurements

**Arguments**

* [deviceInfo] - `DeviceInfo` Sub-device information
* callback(request, response) - `function` Callback after receiving a command
  * request - `CommandRequest` See [CommandRequest](#commandRequest)
  * response - `CommandResponse` See [CommandResponse](#commandResponse)

**Sample**

```javascript
client.deviceCommand.onSetMeasurepoint(async(request, response) => {
  console.log('set measurepoint request: ', request);
  await client.deviceData.postMeasurepoint({
    point: {
      measurepoints: request.params
    }
  });
  response.send(200);
});
```

---

<a name='GatewayClient'></a>
## GatewayClient

Inherited from [DeviceClient](#DeviceClient). It has the same capability as [DeviceClient](#DeviceClient) and sub-device management capability.

A gateway device uses this client to communicate with the cloud.

### Sample Attribute：

#### subDeviceManagement

Methods of sub-device management are included in this attribute.

<a name='gatewayUpstreamRequest'></a>
**Common Request Parameters**

 * [qos] - `number` QoS level. Supports `0 | 1`
 * [needReply] - `boolean` Indicates whether the response from the cloud needs to be waited. The default value is `true`

---

<a name='registerDevice'></a>

##### subDeviceManagement#registerDevice(registerParams)

```typescript
function registerDevice(registerParams: Object): Promise<UpstreamResponse>
```

Registering Devices

**Arguments**

registerParams - `Object`

* subDevices - `Object[]`
  * productKey - `string` Product key of the device.
  * deviceName - {Object} Name of the device.
    * defaultValue - `string`
    * I18nValue - `Object`
      * en_US - `string`
      * zh_CN - `string`
  * timezone - `string` Timezone of the device
  * [deviceKey] - `string` Device Key of the device.
  * [deviceAttributes] - `{[x: string]: Object`  List of the properties of the device.
  * [deviceDesc] - `string` Description of the device.
* [Common Parameters：qos/needReply](#gatewayUpstreamRequest)

**Response**

> For more information on `UpstreamResponse`, see [Common response format](#upstreamResponse)

* data - `Object[]` List of devices successfully registered.
  * assetId - `string` Identifier of the device
  * deviceKey - `string` Device key of the device
  * productKey - `string` Product key of the device
  * deviceSecret - `string` Device secret of the device

**Sample**

```javascript
const registerDeviceResponse = await client.subDeviceManagement.registerDevice({
  subDevices: [{
    timezone: '+08:00',
    productKey: 'productKey',
    deviceAttributes: {
      name: 'test',
      age: 30
    },
    deviceName: {
      defaultValue: 'sdk_demo_name'
    }
  }]
});
```

---

<a name='getTopo'></a>

##### subDeviceManagement#getTopo(queryParams)

```typescript
function getTopo(queryParams: Object): Promise<UpstreamResponse>
```

Getting Topological Relationships of Sub-devices

**Arguments**

[queryParams] - `Object`

* [Common Parameters：qos/needReply](#gatewayUpstreamRequest)

**Response**

> For more information on `UpstreamResponse`, see [Common response format](#upstreamResponse)

* data - `Object[]` List of sub-devices
  * productKey - `string`
  * productName - `string`
  * iotId - `string`
  * deviceKey - `string`
  * deviceSecret - `string`
  * deviceAttributes - `[x: string]: Object`
  * deviceName - `string`
  * timezone - `string`
  * isDST - `boolean`
  * topo - `string`
  * orgCode - `string`
  * createBy - `string`
  * gmtCreate - `number`
  * modifiedByOrg - `string`
  * modifiedBy - `string`
  * gmtModified - `number`
  * gmtActive - `number`
  * gmtOnline - `number`
  * gmtOffline - `number`
  * status - `string`
  * nodeType - `number`
  * dataType - `number`

**Sample**

```javascript
const getTopoResonse = await client.subDeviceManagement.getTopo();
```

---

<a name='addTopo'></a>

##### subDeviceManagement#addTopo(registerParams)

```typescript
function addTopo(addParams: Object): Promise<UpstreamResponse>
```

Adding Topological Relationships of Sub-devices

**Arguments**

addParams - `Object`
* subDevices - `(SubDeviceInfo | ISubDeviceCredential)[] `
  `SubDeviceInfo` See [SubDeviceInfo](#SubDeviceInfo)
  `ISubDeviceCredential` The structure is as follows:

* [Common Parameters：qos/needReply](#gatewayUpstreamRequest)

> <a name='ISubDeviceCredential'></a>
>
> ISubDeviceCredential - `Object`
>
> * productKey - `string`  Product key of the sub-device
> * deviceKey - `string`  Device key of the sub-device
> * deviceSecret - `string`  Device secret of the sub-device
> * [clientId] - `string`  Identifier of the sub-device. The value can be productKey or deviceKey.
> * [timestamp] - `string`  Timestamp
> * [cleanSession] - `boolean`  If the value is true, it indicates to clear offline information for all sub-devices, which is information that has not been received by QoS 1.

**Response**

> For more information on `UpstreamResponse`, see [Common response format](#upstreamResponse)

* data - `string` An empty string is returned if the adding is successful.

**Sample**

```javascript
const subDeviceInfo = new SubDeviceInfo({
  productKey: 'productKey',
  deviceKey: 'deviceKey',
  deviceSecret: 'deviceSecret'
});
const addTopoResponse = await client.subDeviceManagement.addTopo({
  subDevices: [
    subDeviceInfo,
    {
      productKey: 'productKey',
      deviceKey: 'deviceKey',
      deviceSecret: 'deviceSecret'
    }
  ]
});
```

---

<a name='deleteTopo'></a>

##### subDeviceManagement#deleteTopo(registerParams)

```typescript
function deleteTopo(deleteParams: Object): Promise<UpstreamResponse>
```

Deleting Topological Relationships of Sub-devices

**Arguments**

deleteParams - `Object`
* subDevices - `Object[]`
  * productKey - `string`  Product key of the sub-device
  * deviceKey - `string`  Device key of the sub-device
* [Common Parameters：qos/needReply](#gatewayUpstreamRequest)

**Response**

> For more information on `UpstreamResponse`, see [Common response format](#upstreamResponse)

* data - `string`  An empty string is returned if the deletion is successful.

**Sample**

```javascript
const deleteTopoResponse = await client.subDeviceManagement.deleteTopo({
  subDevices: [{
    productKey: 'productKey',
    deviceKey: 'deviceKey'
  }]
});
```

---

<a name='loginSubDevice'></a>

##### subDeviceManagement#loginSubDevice(loginParams)

```typescript
function loginSubDevice(loginParams: Object): Promise<UpstreamResponse>
```

Connecting Sub-devices

**Arguments**

loginParams - `Object`
* subDevice - `SubDeviceInfo | ISubDeviceCredential`
  `SubDeviceInfo` See [SubDeviceInfo](#SubDeviceInfo)
  `ISubDeviceCredential` See [ISubDeviceCredential](#ISubDeviceCredential)

* [Common Parameters：qos/needReply](#gatewayUpstreamRequest)

**Response**

> For more information on `UpstreamResponse`, see [Common response format](#upstreamResponse)

* data - `Object` Information of sub-devices that are connected successfully.
  * assetId - `string`
  * deviceKey - `string`
  * productKey - `string`

**Sample**

```javascript
const loginSubDeviceResponse = await client.subDeviceManagement.loginSubDevice({
  subDevice: {
    productKey: 'productKey',
    deviceKey: 'deviceKey',
    deviceSecret: 'deviceSecret'
  }
});
```

---

<a name='logoutDevice'></a>

##### subDeviceManagement#logoutSubDevice(logoutParams)

```typescript
function logoutSubDevice(logoutParams: Object): Promise<UpstreamResponse>
```

Disconnecting Sud-devices

**Arguments**

logoutParams - `Object`
* subDevice - `Object`
  * productKey - `string` Product key of the sub-device
  * deviceKey - `string` Device key of the sub-device
* [Common Parameters：qos/needReply](#gatewayUpstreamRequest)

**Response**

> For more information on `UpstreamResponse`, see [Common response format](#upstreamResponse)

* data - `Object[]` Information of disconnected sub-devices
  * deviceKey - `string` Device key of the sub-device
  * productKey - `string` Product key of the sub-device

**Sample**

```javascript

```

---

<a name='batchLoginSubDevice'></a>

##### subDeviceManagement#batchLoginSubDevice(loginParams)

```typescript
function batchLoginSubDevice(loginParams: Object): Promise<UpstreamResponse>
```

Connecting Sub-devices in Batch

**Arguments**

loginParams - `Object`
* subDevices - `(SubDeviceInfo | ISubDeviceCredential)[]`
  `SubDeviceInfo` See [SubDeviceInfo](#SubDeviceInfo)
  `ISubDeviceCredential` See [ISubDeviceCredential](#ISubDeviceCredential)
* [clientId] - `string`  The identifier of the device. The value can be productKey or deviceName.
* [timestamp] - `string`  Timestamp
* [Common Parameters：qos/needReply](#gatewayUpstreamRequest)

**Response**

> For more information on `UpstreamResponse`, see [Common response format](#upstreamResponse)

* data - `Object` Login result
  * loginedSubDevices - `Object[]` Devices that successfully logged in.
    * assetId - `string`
    * deviceKey - `string`
    * productKey - `string`
  * failedSubDevices - `Object[]`  Devices that failed to log in.
    * productKey - `string`
    * deviceKey - `string`

**Sample**

```javascript
const subDeviceInfo = new SubDeviceInfo({
  productKey: 'productKey',
  deviceKey: 'deviceKey',
  deviceSecret: 'deviceSecret'
});
const batchLoginResponse = await client.subDeviceManagement.batchLoginSubDevice({
  subDevices: [
    subDeviceInfo,
    {
      productKey: 'productKey',
      deviceKey: 'deviceKey',
      deviceSecret: 'deviceSecret'
    }
  ]
});
```

---

<a name='onSubDevicesEnable'></a>

##### subDeviceManagement#onSubDevicesEnable(callback)

```typescript
function onSubDevicesEnable(callback: (request: CommandRequest, response: CommandResponse) => void): void
```

Enabling Sub-devices

**Arguments**

* callback(request, response) - `function` Callback after a command is received.
  * request - `CommandRequest` See [CommandRequest](#commandRequest)
  * response - `CommandResponse` See [CommandResponse](#commandResponse)

**Sample**

```javascript
client.subDeviceManagement.onSubDevicesEnable((request, response) => {
  response.send(200);
});
```

---

<a name='onSubDevicesDisable'></a>

##### subDeviceManagement#onSubDevicesDisable(callback)

```typescript
function onSubDevicesDisable(callback: (request: CommandRequest, response: CommandResponse) => void): void
```

Disabling Sub-devices

**Arguments**

* callback(request, response) - `function` Callback after a command is received
  * request - `CommandRequest` See [CommandRequest](#commandRequest)
  * response - `CommandResponse` See [CommandResponse](#commandResponse)

**Sample**

```javascript
client.subDeviceManagement.onSubDevicesDisable((request, response) => {
  response.send(200);
});
```

---

<a name='onSubDevicesDelete'></a>

##### subDeviceManagement#onSubDevicesDelete(callback)

```typescript
function onSubDevicesDelete(callback: (request: CommandRequest, response: CommandResponse) => void): void
```

Deleting Sub-devices

**Arguments**

* callback(request, response) - `function` Callback after a command is received
  * request - `CommandRequest` See [CommandRequest](#commandRequest)
  * response - `CommandResponse` See [CommandResponse](#commandResponse)

**Sample**

```javascript
client.subDeviceManagement.onSubDevicesDelete((request, response) => {
  response.send(200);
});
```

---

<a name='DeviceInfo'></a>

## DeviceInfo

<a name='deviceInfoConstrcutor'></a>
### Constructor

```javascript
DeviceInfo(deviceInfo)
```

**Arguments**
* deviceInfo - `Object`
  * productKey - `string` Product key of the device
  * deviceKey - `string` Device key of the device
  * [productSecret] - `string` Product secret of the device
  * [deviceSecret] - `string` Device secret of the device

<a name='deviceProperties'></a>
### Properties

<a name='devicePK'></a>
#### productKey `string`
Product key of the device

<a name='deviceDK'></a>
#### deviceKey `string`
Device key of the device

<a name='devicePS'></a>
#### productSecret `string`
Product secret of the device

<a name='deviceDS'></a>
#### deviceSecret `string`
Device secret of the device

---

<a name='SubDeviceInfo'></a>
## SubDeviceInfo

<a name='subDeviceInfoConstrcutor'></a>
### Constructor

```javascript
SubDeviceInfo(subDeviceInfo)
```

**Arguments**
* subDeviceInfo - `Object`
  * productKey - `string` Product key of the sub-device
  * deviceKey - `string` Device key of the sub-device
  * [productSecret] - `string` Product secret of the sub-device
  * [deviceSecret] - `string` Device secret of the sub-device
  * [timestamp] - `number` Timestamp
  * [clientId] - `string` Identifier of the sub-device
  * [cleanSession] - `boolean` If the value is set to true, it indicates to clear offline information for all sub-devices, which is information that has not been received by QoS 1.

<a name='subDeviceProperties'></a>
### Properties

<a name='subDevicePK'></a>
#### productKey `string`
Product key of the sub-device

<a name='subDeviceDK'></a>
#### deviceKey `string`
Device key of the sub-device

<a name='subDevicePS'></a>
#### productSecret `string`
Product secret of the sub-device

<a name='subDeviceDS'></a>
#### deviceSecret `string`
Device secret of the sub-device

<a name='timestamp'></a>
#### timestamp `number`
Timestamp

<a name='clientId'></a>
#### clientId `string`
Identifier of the sub-device

<a name='cleanSession'></a>
#### cleanSession `boolean`
If the value is set to true, it indicates to clear offline information for all sub-devices, which is information that has not been received by QoS 1.

---

<a name='SECURE_MODE'></a>
## SECURE_MODE

Authentication mode. Used when creating a client instance.

```javascript
const clientOptions = {..., secureMode: SECURE_MODE.VIA_DEVICE_SECRET}
```

* VIA_DEVICE_SECRET - Use static authentication
* VIA_PRODUCT_SECRET - Use dynamic authentication
