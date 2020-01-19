# Using EnOS Device SDK for MQTT

**Table of Contents**

* [Prerequisites](#Prerequisites)
  * [Installing Node](#installing)
  * [Obtaining the SDK](#obtaining)
* [Feature List](#features)
* [Quick Start](#quickStart)
* [Sample Code](#samples)
* [Related Information](#related)
* [API Reference](#api)
* [Release Notes](#releaseNotes)

<a name='Prerequisites'></a>

## Prerequisites

<a name='installing'></a>

### Installing Node
To use the EnOS Device SDK for NodeJS, you will need to install [Node.js](https://nodejs.org/en/) 8 or later.

<a name='obtaining'></a>

### Obtaining the SDK

[npm](https://docs.npmjs.com/about-npm/index.html) is a command-line package manager that is installed with Node.js is installed, and will be used to obtain the SDK.

```bash
$ npm install --save enos-mqtt-sdk-nodejs
```

<a name='features'></a>

## Feature List

For the list of features supported by this SDK and the availability of EnOS device connectivity and management features in all SDKs we provide, see [EnOS Device SDK](https://github.com/EnvisionIot/enos-iot-device-sdk).

## Quick Start

1. Establishing connection with EnOS Cloud
```javascript
const {DeviceClient, SECURE_MODE} = require('enos-mqtt-sdk-nodejs');

// create client instance
const clientOptions = {
  brokerUrl: 'brokerUrl',
  secureMode: SECURE_MODE.VIA_DEVICE_SECRET,
  productKey: 'productKey', deviceKey: 'deviceKey', deviceSecret: 'deviceSecret'
}
const client = new DeviceClient(clientOptions);

// listen to 'connect' event
client.on('connect', () => {
  console.log('connected');
})

// listen to 'close' event
client.on('close', () => {
  console.log('connection closed');
})

// establish connection
client.connect().then(async() => {
  // interact with the cloud
});
```

2. Reporting measurement points
```javascript
const mpResponse = await client.deviceData.postMeasurepoint({
  point: {
    measurepoints: {
      mp_age: 20
    }
  }
});
console.log(mpResponse.data);
```

3. Closing the connection
```javascript
client.close();
```


<a name='samples'></a>

## Sample Code

* [Establishing Connection with EnOS Cloud](https://github.com/EnvisionIot/enos-device-sdk-nodejs/blob/master/packages/enos-sdk-samples/src/samples/connection.js)
* [Device Tags](https://github.com/EnvisionIot/enos-device-sdk-nodejs/blob/master/packages/enos-sdk-samples/src/samples/tags.js)
* [Device Attributes](https://github.com/EnvisionIot/enos-device-sdk-nodejs/blob/master/packages/enos-sdk-samples/src/samples/attributes.js)
* [Reporting Measurement Points](https://github.com/EnvisionIot/enos-device-sdk-nodejs/blob/master/packages/enos-sdk-samples/src/samples/measurepoints.js)
* [Reporting Events](https://github.com/EnvisionIot/enos-device-sdk-nodejs/blob/master/packages/enos-sdk-samples/src/samples/post_event.js)
* [Receiving Commands from Cloud](https://github.com/EnvisionIot/enos-device-sdk-nodejs/blob/master/packages/enos-sdk-samples/src/samples/commands.js)
* [Passing Through Device Information or Receving Passed-through Information from Cloud](https://github.com/EnvisionIot/enos-device-sdk-nodejs/blob/master/packages/enos-sdk-samples/src/samples/rawdata.js)
* [Managing Sub-devices](https://github.com/EnvisionIot/enos-device-sdk-nodejs/blob/master/packages/enos-sdk-samples/src/samples/gateway.js)

<a name='related'></a>

## Related Information

* To learn more about EnOS IoT Hub, see [EnOS IoT Hub Documentation](https://support.envisioniot.com/docs/device-connection/en/latest/device_management_overview.html).

<a name='api'></a>

## API Reference

See [api reference](https://github.com/EnvisionIot/enos-device-sdk-nodejs/blob/master/API.md)

<a name='releaseNotes'></a>

## Release Notes

* 2020/01/15 (Initial Release)
