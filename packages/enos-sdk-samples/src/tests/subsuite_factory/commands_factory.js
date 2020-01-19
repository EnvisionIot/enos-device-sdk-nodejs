/* eslint-disable */
const {DeviceClient} = require('enos-mqtt-sdk-nodejs');
/* eslint-enable */
const {getDeviceClient, DEVICE_TYPE} = require('../../fixtures/util');

describe('DeviceClient', () => {
  /** @type DeviceClient */
  let client;

  beforeAll(async() => {
    client = getDeviceClient(DEVICE_TYPE.STATIC);
    await client.connect();
  });

  describe('call device service', () => {
    it('should throw a exception if no serviceName is provided', () => {
      expect(client.deviceCommand.onInvokeService).toThrow();
    });

    it('should throw if no callback is provided', () => {
      expect(() => client.deviceCommand.onInvokeService('resetAge', {productKey: 'test'})).toThrow();
      expect(() => client.deviceCommand.onInvokeService('resetAge')).toThrow();
    });
  });

  describe();

  afterAll(async() => {
    await client.close();
  });
});
