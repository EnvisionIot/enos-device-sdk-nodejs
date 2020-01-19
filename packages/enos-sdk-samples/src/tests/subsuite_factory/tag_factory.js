/* eslint-disable */
const {DeviceClient, DeviceInfo} = require('enos-mqtt-sdk-nodejs');
/* eslint-enable */

const {getTestData} = require('../../fixtures/util');

const testData = getTestData();
const updatingTags = [...testData.updatingTags];
const updatingTagKeys = updatingTags.map(tag => tag.tagKey);

/**
 * Used to create test suite for tags
 *
 * @param {DeviceClient} client
 * @param {any[]} subDeviceInfos
 */
function tagSuiteFactory(client, subDeviceInfos) {
  let subDeviceInfo;

  describe('tag services', () => {
    // Empty tags within the specific device
    beforeAll(async() => {
      if (subDeviceInfos && subDeviceInfos[0]) {
        subDeviceInfo = new DeviceInfo(subDeviceInfos[0]);
      }

      const tags = await client.deviceData.queryTag({
        deviceInfo: subDeviceInfo
      });

      if (tags.code === 200) {
        await client.deviceData.deleteTag({
          tagKeys: Object.keys(tags.data),
          deviceInfo: subDeviceInfo
        });
      }
    });

    describe('method queryTag', () => {
      it('should throw exception if options.tagKeys is not an array', () => {
        expect.assertions(1);
        return expect(client.deviceData.queryTag({
          tagKeys: {},
          deviceInfo: subDeviceInfo
        })).rejects.toThrow();
      });

      it('should return successfully and zero tags with no tagKeys specified', async() => {
        const tags = await client.deviceData.queryTag({deviceInfo: subDeviceInfo});
        expect(tags.code).toBe(200);
        return expect(Object.keys(tags.data).length).toBe(0);
      });

      it('should return empty if "needReply" is set to false', async() => {
        const tags = await client.deviceData.queryTag({
          needReply: false,
          deviceInfo: subDeviceInfo
        });
        expect(tags).toBeUndefined();
      });

      // it('should return specified tags with specified tagKeys param', async() => {
      //   return true;
      // });
    });

    describe('method updateTag', () => {
      it('should throw exception if no options.tags specified', () => {
        expect.assertions(1);
        return expect(client.deviceData.updateTag({
          deviceInfo: subDeviceInfo
        })).rejects.toThrow();
      });

      it('should throw exception if options.tags is not an array', () => {
        expect.assertions(1);
        return expect(client.deviceData.updateTag({
          tags: {},
          deviceInfo: subDeviceInfo
        })).rejects.toThrow();
      });

      it('should return fail if tags is in uncorrect format', async() => {
        const updateResult = await client.deviceData.updateTag({
          tags: [{333: '444'}],
          deviceInfo: subDeviceInfo
        });
        expect(updateResult.code).not.toBe(200);
      });

      it('should return successfully if params is correct', async() => {
        const updateResult = await client.deviceData.updateTag({
          tags: updatingTags,
          deviceInfo: subDeviceInfo
        });
        expect(updateResult.code).toBe(200);

        const queryResult = await client.deviceData.queryTag();
        expect(Object.keys(queryResult.data)).toEqual(updatingTagKeys);
      });
    });

    describe('method deleteTag', () => {
      it('should throw exception if no tagKeys is specified', () => {
        expect.assertions(1);
        return expect(client.deviceData.deleteTag({
          deviceInfo: subDeviceInfo
        })).rejects.toThrow();
      });

      it('should throw exception if tagKeys is not an array', () => {
        expect.assertions(1);
        return expect(client.deviceData.deleteTag({
          tagKeys: {},
          deviceInfo: subDeviceInfo
        })).rejects.toThrow();
      });

      it('should return successfully', async() => {
        const deleteResult = await client.deviceData.deleteTag({
          tagKeys: [updatingTagKeys[0]],
          deviceInfo: subDeviceInfo
        });
        expect(deleteResult.code).toBe(200);

        const queryResult = await client.deviceData.queryTag({
          deviceInfo: subDeviceInfo
        });
        expect(Object.keys(queryResult.data).length).toBe(updatingTagKeys.length - 1);
      });
    });
  });
}

module.exports = tagSuiteFactory;
