const fs = require('fs');
const {DeviceClient, GatewayClient, SECURE_MODE, DeviceInfo} = require('enos-mqtt-sdk-nodejs');

const TEST_ENV = {
  ALPAH: 'alpha',
  BETA: 'beta',
  PROD: 'prod'
};

const DEVICE_TYPE = {
  STATIC: 'static',
  DYNAMIC: 'dynamic',
  GATEWAY: 'gateway',
  CERT: 'cert',
  RAW: 'raw'
};

function getTestData() {
  const currentTestEnv = process.env.TEST_ENV || TEST_ENV.BETA;

  switch (currentTestEnv) {
  case TEST_ENV.ALPAH:
    return require('./alpha');
  case TEST_ENV.BETA:
    return require('./beta');
  case TEST_ENV.PROD:
    return require('./prod');
  default:
    return require('./beta');
  }
}

const testData = getTestData();
const staticDeviceInfo = new DeviceInfo(testData.staticDevice);
const dynamicDeviceInfo = new DeviceInfo(testData.dynamicDevice);
const gatewayDeviceInfo = new DeviceInfo(testData.gatewayDevice);
const certDeviceInfo = new DeviceInfo(testData.certDevice);
const rawDeviceInfo = new DeviceInfo(testData.rawDataDevice);

function getSampleDevices(type) {
  switch (type) {
  case DEVICE_TYPE.STATIC:
    return staticDeviceInfo;
  case DEVICE_TYPE.DYNAMIC:
    return dynamicDeviceInfo;
  case DEVICE_TYPE.GATEWAY:
    return gatewayDeviceInfo;
  case DEVICE_TYPE.CERT:
    return certDeviceInfo;
  case DEVICE_TYPE.RAW:
    return rawDeviceInfo;
  default:
    return staticDeviceInfo;
  }
}

/**
 * Get device client
 *
 * @param {string} deviceType 参见 DEVICE_TYPE
 * @returns {DeviceClient | GatewayClient} 返回非证书认证的连接端
 */
function getDeviceClient(deviceType) {
  const {productKey, productSecret, deviceKey, deviceSecret} = getSampleDevices(deviceType);
  const clientOptions = {
    productKey,
    productSecret,
    deviceKey,
    deviceSecret,
    secureMode: deviceType === DEVICE_TYPE.DYNAMIC ? SECURE_MODE.VIA_PRODUCT_SECRET : SECURE_MODE.VIA_DEVICE_SECRET,
    brokerUrl: deviceType === DEVICE_TYPE.CERT ? testData.sslBrokerUrl : testData.tcpBrokerUrl,
    mqttOptions: {
      reconnectPeriod: 3
    }
  };

  if (deviceType === DEVICE_TYPE.CERT) {
    clientOptions.ca = fs.readFileSync(testData.caPath);
    // clientOptions.pfx = fs.readFileSync(testData.pfxPath);
    clientOptions.key = fs.readFileSync(testData.key);
    clientOptions.cert = fs.readFileSync(testData.deviceCert);
    clientOptions.passphrase = testData.passphrase;
  // const key = fs.readFileSync(path.join(__dirname, '../mqtt-sample-dev01.key'));
  // const cert = fs.readFileSync(path.join(__dirname, '../mqtt-sample-dev01.pem'));
  }

  if (deviceType === DEVICE_TYPE.GATEWAY) {
    return new GatewayClient(clientOptions);
  }

  return new DeviceClient(clientOptions);
}

/**
 * Get gateway client
 *
 * @returns {GatewayClient}
 */
function getGatewayClient() {
  return getDeviceClient(DEVICE_TYPE.GATEWAY);
}

module.exports = {
  getDeviceClient,
  getGatewayClient,
  DEVICE_TYPE,
  getTestData
};
