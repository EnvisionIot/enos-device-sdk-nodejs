/* eslint-disable */
const {DeviceClient, DeviceInfo} = require('enos-mqtt-sdk-nodejs');
/* eslint-enable */

const {getTestData} = require('../../fixtures/util');

const testData = getTestData();

/**
 * Used to create test suite for raw data
 *
 * @param {DeviceClient} client
 * @param {any[]} [subDeviceInfos] sub-devices info, used by gateway
 */
function rawDataSuiteFactory(client, subDeviceInfos) {
  let subDeviceInfo;

  describe('send raw data', () => {
    beforeAll(() => {
      if (subDeviceInfos && subDeviceInfos[0]) {
        subDeviceInfo = new DeviceInfo(subDeviceInfos[0]);
      }
    });

    it('should throw a exception if no "rawData" is provided', () => {
      expect.assertions(1);
      return expect(client.deviceData.upRawModel({
        deviceInfo: subDeviceInfo
      })).rejects.toThrow();
    });

    // Cloud service has problems
    it('should receive reply', async() => {
      const result = await client.deviceData.upRawModel({
        rawData: Buffer.from(testData.rawData),
        deviceInfo: subDeviceInfo
      });
      expect(result).toBeDefined();
    });
  });
}

module.exports = rawDataSuiteFactory;
