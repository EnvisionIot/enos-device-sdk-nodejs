const path = require('path');

module.exports = {
  tcpBrokerUrl: 'tcpBrokerUrl',
  sslBrokerUrl: 'sslBrokerUrl',
  // Device info for per-device secret authentication
  staticDevice: {
    productKey: 'staticProductKey',
    productSecret: 'staticProductSecret',
    deviceKey: 'staticDeviceKey',
    deviceSecret: 'staticDeviceSecret'
  },
  // Device info for per-product secret authentication
  dynamicDevice: {
    productKey: 'dynamicProductKey',
    productSecret: 'dynamicProductSecret',
    deviceKey: 'dynamicDeviceKey',
    deviceSecret: 'dynamicDeviceSecret'
  },
  // Device info for X.509-certificate-based authentication
  certDevice: {
    productKey: 'certProductKey',
    productSecret: 'certProductSecret',
    deviceKey: 'certDeviceKey',
    deviceSecret: 'certDeviceSecret'
  },
  // Root cert
  caPath: path.join(__dirname, 'cert/cacert.pem'),
  // Private key + device certificate
  // pfxPath: path.join(__dirname, 'cert/device.p12'),
  key: path.join(__dirname, 'cert/device.key'),
  deviceCert: path.join(__dirname, 'cert/device.pem'),
  passphrase: 'passphrase',
  // Gateway device
  gatewayDevice: {
    productKey: 'gatewayProductKey',
    productSecret: 'gatewayProductSecret',
    deviceKey: 'gatewayDeviceKey',
    deviceSecret: 'gatewayDeviceSecret'
  },
  // Names of sub-devices to be registered
  subDeviceNames: ['auto_sdk_test_subdevice1', 'auto_sdk_test_subdevice2', 'auto_sdk_test_subdevice3'],
  // Device info for pass-through data
  rawDataDevice: {
    productKey: 'rawProductKey',
    productSecret: 'rawProductSecret',
    deviceKey: 'rawDeviceKey',
    deviceSecret: 'rawDeviceSecret'
  },
  // Used for tag testing, preferably no less than 2 key-value pairs
  updatingTags: [
    {tagKey: 'tagKey1', tagValue: 'tagValue1'},
    {tagKey: 'tagKey2', tagValue: 'tagValue2'}
  ],
  // Used for attribute testing
  updatingAttributes: {
    name: 'testName',
    age: 30
  },
  // Measurement points to be updated
  updatingMeasurepoints: {
    mp_age: 100
  },
  certUpdatingMeasurepoints: {
    'sample.string_mp': 'auto-update'
  },
  // raw data to be reported to cloud
  rawData: [
    0x01, // method, thing.measurepoint.post
    0x00, 0x00, 0x00, 0x14, // id
    0x01, // mp_int code
    0x00, 0x04, // length
    0x00, 0x00, 0x25, 0xf5, // value
    0x02, // mp_string code
    0x00, 0x0a, // length
    0x61, 0x62, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6a, // value
    0x03, // mp_double code
    0x00, 0x08, // length
    0x3f, 0xf2, 0x3d, 0x70, 0xa3, 0xd7, 0x0a, 0x3d, // value
    0x04, // mp_array code
    0x00, 0x14, // length
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x03, 0x00, 0x00, 0x00, 0x05, 0x00, 0x00, 0x00, 0x07, 0x00, 0x00, 0x00, 0x09, // value
    0x05, // mp_int_quality
    0x00, 0x05, // length
    0x00, 0x00, 0x01, 0xa7, // value
    0x01 // quality
  ]
};
