/* eslint-disable */
const {DeviceClient, DeviceInfo} = require('enos-mqtt-sdk-nodejs');
/* eslint-enable */

const {getTestData} = require('../../fixtures/util');

const testData = getTestData();
const updatingMeasurepoints = {...testData.updatingMeasurepoints};

/**
 * Used to create test suite for measurement points
 *
 * @param {DeviceClient} client
 * @param {SubDeviceInfo[]} [subDeviceInfos] only have value in running progress
 */
function measurepointSuiteFactory(client, subDeviceInfos) {
  let subDeviceInfo;

  describe('tsl services', () => {
    beforeAll(() => {
      if (subDeviceInfos && subDeviceInfos[0]) {
        subDeviceInfo = new DeviceInfo(subDeviceInfos[0]);
      }
    });

    describe('post single measurepoint', () => {
      it('should throw a exception if no measurepoints is provided', () => {
        expect.assertions(1);
        return expect(client.deviceData.postMeasurepoint({
          deviceInfo: subDeviceInfo
        })).rejects.toThrow();
      });

      it('should return fail if part of the provided measurepoints are not defined in corresponding model', async() => {
        const postResult = await client.deviceData.postMeasurepoint({
          point: {
            measurepoints: {
              ...updatingMeasurepoints,
              mp_age22: 20
            }
          },
          deviceInfo: subDeviceInfo
        });
        expect(postResult.code).toBe(1204);
      });

      it('should return successfully', async() => {
        const postResult = await client.deviceData.postMeasurepoint({
          point: {
            measurepoints: updatingMeasurepoints
          },
          deviceInfo: subDeviceInfo
        });
        expect(postResult.code).toBe(200);
      });
    });

    describe('resume measurepoint', () => {
      it('should throw a exception if no measurepoints is provided', () => {
        expect.assertions(1);
        return expect(client.deviceData.resumeMeasurepoint({
          deviceInfo: subDeviceInfo
        })).rejects.toThrow();
      });

      it('should return fail if part of the provided measurepoints are not defined in corresponding model', async() => {
        const postResult = await client.deviceData.resumeMeasurepoint({
          point: {
            measurepoints: {
              ...updatingMeasurepoints,
              mp_age22: 20
            }
          },
          deviceInfo: subDeviceInfo
        });
        expect(postResult.code).toBe(1204);
      });

      it('should return successfully', async() => {
        const postResult = await client.deviceData.resumeMeasurepoint({
          point: {
            measurepoints: updatingMeasurepoints
          },
          deviceInfo: subDeviceInfo
        });
        expect(postResult.code).toBe(200);
      });
    });

    // remove tests from gateway case
    if (!subDeviceInfos) {
      describe('post measurepoints batch', () => {
        it('should throw a exception if no measurepoints is provided', () => {
          expect.assertions(1);
          return expect(client.deviceData.batchPostMeasurepoint({
            deviceInfo: subDeviceInfo
          })).rejects.toThrow();
        });

        it('should throw a exception if the provided measurepoints are not array', () => {
          expect.assertions(1);
          return expect(client.deviceData.batchPostMeasurepoint({
            points: {},
            deviceInfo: subDeviceInfo
          })).rejects.toThrow();
        });

        it('should throw a exception if no measurepoints is provided', () => {
          expect.assertions(1);
          return expect(client.deviceData.batchPostMeasurepoint({
            points: [{
              measurepoints: updatingMeasurepoints
            }, {
              time: new Date().getTime()
            }],
            deviceInfo: subDeviceInfo
          })).rejects.toThrow();
        });

        it('should throw a exception if qos is not 0 or 1', () => {
          expect.assertions(1);
          return expect(client.deviceData.batchPostMeasurepoint({
            qos: 2,
            points: [{
              measurepoints: updatingMeasurepoints
            }],
            deviceInfo: subDeviceInfo
          })).rejects.toThrow();
        });

        // it('should return fail with invalid measurepoints if skipInvalidMeasurepoints is set to false ', async() => {
        //   const result = await client.deviceData.batchPostMeasurepoint({
        //     points: [{
        //       measurepoints: {
        //         mp_age333: 40
        //       }
        //     }],
        //     skipInvalidMeasurepoints: false
        //   });
        //   console.log('result: ', result);
        //   expect(result.code).not.toBe(200);
        // });

        it('should return successfully with invalid measurepoints if skipInvalidMeasurepoints is set to true ', async() => {
          const result = await client.deviceData.batchPostMeasurepoint({
            points: [{
              measurepoints: {
                mp_age333: 40
              }
            }],
            skipInvalidMeasurepoints: true,
            deviceInfo: subDeviceInfo
          });
          expect(result.code).toBe(200);
        });

        it('should return successfully', async() => {
          const result = await client.deviceData.batchPostMeasurepoint({
            points: [{
              measurepoints: updatingMeasurepoints
            }, {
              measurepoints: updatingMeasurepoints,
              time: new Date('2019-10-20 20:00').getTime()
            }],
            deviceInfo: subDeviceInfo
          });

          expect(result.code).toBe(200);
        });
      });
    }

    // remove tests from gateway case
    if (!subDeviceInfos) {
      describe('resume measurepoints batch', () => {
        it('should throw a exception if no measurepoints is provided', () => {
          expect.assertions(1);
          return expect(client.deviceData.batchResumeMeasurepoint({
            deviceInfo: subDeviceInfo
          })).rejects.toThrow();
        });

        it('should throw a exception if the provided measurepoints are not array', () => {
          expect.assertions(1);
          return expect(client.deviceData.batchResumeMeasurepoint({
            points: {},
            deviceInfo: subDeviceInfo
          })).rejects.toThrow();
        });

        it('should throw a exception if no measurepoints is provided', () => {
          expect.assertions(1);
          return expect(client.deviceData.batchResumeMeasurepoint({
            points: [{
              measurepoints: updatingMeasurepoints
            }, {
              time: new Date().getTime()
            }],
            deviceInfo: subDeviceInfo
          })).rejects.toThrow();
        });

        it('should throw a exception if qos is not 0 or 1', () => {
          expect.assertions(1);
          return expect(client.deviceData.batchResumeMeasurepoint({
            qos: 2,
            points: [{
              measurepoints: updatingMeasurepoints
            }],
            deviceInfo: subDeviceInfo
          })).rejects.toThrow();
        });

        // it('should return fail with invalid measurepoints if skipInvalidMeasurepoints is set to false ', async() => {
        //   const result = await client.deviceData.batchResumeMeasurepoint({
        //     points: [{
        //       measurepoints: {
        //         mp_age333: 40
        //       }
        //     }],
        //     skipInvalidMeasurepoints: false
        //   });
        //   console.log('result: ', result);
        //   expect(result.code).not.toBe(200);
        // });

        it('should return successfully with invalid measurepoints if skipInvalidMeasurepoints is set to true ', async() => {
          const result = await client.deviceData.batchResumeMeasurepoint({
            points: [{
              measurepoints: {
                mp_age333: 40
              }
            }],
            skipInvalidMeasurepoints: true,
            deviceInfo: subDeviceInfo
          });
          expect(result.code).toBe(200);
        });

        it('should return successfully', async() => {
          const result = await client.deviceData.batchResumeMeasurepoint({
            points: [{
              measurepoints: updatingMeasurepoints
            }, {
              measurepoints: updatingMeasurepoints,
              time: new Date('2019-10-20 20:00').getTime()
            }],
            deviceInfo: subDeviceInfo
          });
          expect(result.code).toBe(200);
        });
      });
    }
  });
}

module.exports = measurepointSuiteFactory;
