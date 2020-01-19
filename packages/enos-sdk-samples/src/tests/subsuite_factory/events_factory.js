/* eslint-disable */
const {DeviceClient, DeviceInfo} = require('enos-mqtt-sdk-nodejs');
/* eslint-enable */

/**
 * Used to create test suite for events
 *
 * @param {DeviceClient} client
 * @param {any[]} [subDeviceInfos] sub-devices info, used by gateway
 */
function eventsSuiteFactory(client, subDeviceInfos) {
  let subDeviceInfo;

  describe('send events', () => {
    beforeAll(() => {
      if (subDeviceInfos && subDeviceInfos[0]) {
        subDeviceInfo = new DeviceInfo(subDeviceInfos[0]);
      }
    });

    it('should throw a exception if no eventName is provided', () => {
      expect.assertions(1);
      return expect(client.deviceData.postEvent({
        deviceInfo: subDeviceInfo
      })).rejects.toThrow();
    });

    it('should return fail if the provided eventName is not defined in the corresponding model', async() => {
      const result = await client.deviceData.postEvent({
        eventName: 'test-111',
        deviceInfo: subDeviceInfo
      });
      expect(result.code).toBe(1204);
    });

    it('should return successfully', async() => {
      const result = await client.deviceData.postEvent({
        eventName: 'event_test',
        eventParams: {
          isMale: 2,
          isChild: 10
        },
        deviceInfo: subDeviceInfo
      });
      expect(result.code).toBe(200);
    });
  });
}

module.exports = eventsSuiteFactory;
