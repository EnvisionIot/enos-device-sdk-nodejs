/* eslint-disable */
const {DeviceClient, DeviceInfo} = require('enos-mqtt-sdk-nodejs');
/* eslint-enable */

const {getTestData} = require('../../fixtures/util');

const testData = getTestData();
const updatingAttributes = testData.updatingAttributes;

/**
 * Used to create test suite for attributes
 *
 * @param {DeviceClient} client
 */
function attributeSuiteFactory(client, subDeviceInfos) {
  let subDeviceInfo;

  describe('attributes services', () => {
    // Ensure attributes are empty
    beforeAll(async() => {
      if (subDeviceInfos && subDeviceInfos[0]) {
        subDeviceInfo = new DeviceInfo(subDeviceInfos[0]);
      }

      const attributes = await client.deviceData.queryAttribute({
        deviceInfo: subDeviceInfo
      });

      if (attributes.code === 200) {
        await client.deviceData.deleteAttribute({
          attributeIds: Object.keys(attributes.data),
          deviceInfo: subDeviceInfo
        });
      }
    });

    describe('method queryAttribute', () => {
      it('should throw exception if options.attributeIds is not an array', () => {
        expect.assertions(1);
        return expect(client.deviceData.queryAttribute({attributeIds: {}})).rejects.toThrow();
      });

      // Only works for devices with no default attributes
      it('should return successfully with zero attributes', async() => {
        const attributeResponse = await client.deviceData.queryAttribute({
          deviceInfo: subDeviceInfo
        });
        // code with 200
        expect(attributeResponse.code).toBe(200);
        // zero attributes (all attribute values are deleted before test)
        expect(Object.keys(attributeResponse.data).length).toBe(0);
      });
    });

    describe('method updateAttribute', () => {
      it('should throw exception if no attributeMap is specified', () => {
        expect.assertions(1);
        return expect(client.deviceData.updateAttribute({
          deviceInfo: subDeviceInfo
        })).rejects.toThrow();
      });

      it('should throw exception if attributeMap is not in {key: value} format', () => {
        expect.assertions(1);
        return expect(client.deviceData.updateAttribute({
          attributeMap: 33,
          deviceInfo: subDeviceInfo
        })).rejects.toThrow();
      });

      it('should return successfully if params is correct', async() => {
        const updateResult = await client.deviceData.updateAttribute({
          attributeMap: updatingAttributes,
          deviceInfo: subDeviceInfo
        });

        // return successfully
        expect(updateResult.code).toBe(200);

        const queryResult = await client.deviceData.queryAttribute({
          deviceInfo: subDeviceInfo
        });
        // queryed attributes is same as attributed updated just now
        expect(queryResult.data).toEqual(updatingAttributes);
      });
    });

    describe('delete attributes', () => {
      it('should throw exception if no attributeIds is specified', () => {
        expect.assertions(1);
        return expect(client.deviceData.deleteAttribute({
          deviceInfo: subDeviceInfo
        })).rejects.toThrow();
      });

      it('should throw exception if attributeIds is not an array', () => {
        expect.assertions(1);
        return expect(client.deviceData.deleteAttribute({
          attributeIds: {},
          deviceInfo: subDeviceInfo
        })).rejects.toThrow();
      });

      it('should delete attribute values successfully', async() => {
        const deleteAttributeIds = [Object.keys(updatingAttributes)[0]];
        const deleteResult = await client.deviceData.deleteAttribute({
          attributeIds: deleteAttributeIds,
          deviceInfo: subDeviceInfo
        });
        expect(deleteResult.code).toBe(200);

        const queryResult = await client.deviceData.queryAttribute({
          deviceInfo: subDeviceInfo
        });
        expect(Object.keys(queryResult.data)).not.toContain(deleteAttributeIds);
      });
    });
  });
}

module.exports = attributeSuiteFactory;
