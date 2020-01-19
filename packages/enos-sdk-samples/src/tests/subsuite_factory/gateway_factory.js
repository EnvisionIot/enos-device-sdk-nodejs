const debug = require('debug')('gateway-test');
/* eslint-disable-next-line */
const {GatewayClient, SubDeviceInfo, DeviceInfo} = require('enos-mqtt-sdk-nodejs');
// const tagSuiteFactory = require('./tag_factory');
const attributeSuiteFactory = require('./attribute_factory');
const measurepointSuiteFactory = require('./measurepoint_factory');
const eventsSuiteFactory = require('./events_factory');

const {getTestData} = require('../../fixtures/util');

const testData = getTestData();

const subDeviceProductKey = testData.staticDevice.productKey;
const subDeviceNames = [...testData.subDeviceNames];

// generate subDevices used to register
const generateSubDevices = deviceNames => (
  deviceNames.map(name => ({
    timezone: '+08:00',
    productKey: subDeviceProductKey,
    // deviceAttributes: {
    //   attribute_name: 'guo',
    //   attribute_age: 30
    // },
    deviceName: {
      defaultValue: name
    },
    deviceDesc: ''
  }))
);
const registeringSubDevices = generateSubDevices(subDeviceNames);

/**
 * Used to create test suite for gateway devices
 *
 * @param {GatewayClient} client
 */
function gatewaySuiteFactory(client) {
  // Used during the whole test process of gateway servcie
  const subDeviceInfos = [];

  describe('gateway services', () => {
    // clear topo of the connected edge device
    beforeAll(async() => {
      const topoResponse = await client.subDeviceManagement.getTopo();
      if (topoResponse.code === 200) {
        const subDevices = (topoResponse.data || []).map(device => ({
          productKey: device.productKey,
          deviceKey: device.deviceKey
        }));

        const deleteResponse = await client.subDeviceManagement.deleteTopo({subDevices});
        if (deleteResponse.code === 200) {
          debug('empty topo successfully');
        }
      }
    });

    describe('register sub devices', () => {
      it('should throw exception if no subDevices is provided', () => {
        expect.assertions(1);
        return expect(client.subDeviceManagement.registerDevice()).rejects.toThrow();
      });

      it('should throw exception if subDevices is not an array', () => {
        expect.assertions(1);
        return expect(client.subDeviceManagement.registerDevice({
          subDevices: {}
        })).rejects.toThrow();
      });

      it('should return fail if provided subDevices with uncomplete fields', async() => {
        const result = await client.subDeviceManagement.registerDevice({
          subDevices: [{
            productKey: subDeviceProductKey
          }]
        });
        expect(result.code).not.toBe(200);
      });

      it('should return successfully', async() => {
        const result = await client.subDeviceManagement.registerDevice({
          subDevices: registeringSubDevices
        });
        expect(result.code).toBe(200);

        // Cache the registered sub-device infos
        if (result.code === 200) {
          (result.data || []).forEach((device, index) => {
            const {productKey, deviceKey, deviceSecret} = device;
            if (index === 0) {
              const subDevice = new SubDeviceInfo({
                productKey, deviceKey, deviceSecret
              });
              subDeviceInfos.push(subDevice);
            } else {
              subDeviceInfos.push({
                productKey, deviceKey, deviceSecret
              });
            }
          });
        }
      });

      it('should return fail if part fo the proviced subDevices are already registered', async() => {
        const registeredDeviceKey = subDeviceInfos[0].deviceKey;
        const result = await client.subDeviceManagement.registerDevice({
          subDevices: [
            registeringSubDevices[0],
            {
              productKey: subDeviceProductKey,
              deviceKey: registeredDeviceKey,
              deviceName: {
                defaultValue: 'already_registered'
              },
              timezone: '+08:00'
            }
          ]
        });

        expect(result.code).toBe(702);
      });
    });

    describe('get topo', () => {
      it('should return successfully with no sub-device', async() => {
        const result = await client.subDeviceManagement.getTopo();
        expect(result.code).toBe(200);
        expect(result.data.length).toBe(0);
      });
    });

    describe('add topo', () => {
      it('should throw an exception if no subDevices if provided', () => {
        expect.assertions(1);
        return expect(client.subDeviceManagement.addTopo()).rejects.toThrow();
      });

      it('should throw an exception if the provided subDevices is not an array', () => {
        expect.assertions(1);
        return expect(client.subDeviceManagement.addTopo({
          subDevices: {}
        })).rejects.toThrow();
      });

      it('should return fail if part of the provided subDevices do not exsit', async() => {
        const result = await client.subDeviceManagement.addTopo({
          subDevices: [
            subDeviceInfos[0],
            {
              productKey: 'not_exist',
              deviceKey: 'not_exist',
              deviceSecret: 'not_exist'
            }
          ]
        });

        expect(result.code).not.toBe(200);
      });

      it('should add topo successfully', async() => {
        const result = await client.subDeviceManagement.addTopo({
          subDevices: subDeviceInfos
        });
        expect(result.code).toBe(200);

        const getTopoResult = await client.subDeviceManagement.getTopo();
        expect(getTopoResult.data.length).toBe(subDeviceInfos.length);
      });
    });

    describe('remove topo', () => {
      it('should throw an exception if no subDevices is provided', () => {
        expect.assertions(1);
        return expect(client.subDeviceManagement.deleteTopo()).rejects.toThrow();
      });

      it('should throw an exception if the provided subDevices if not an array', () => {
        expect.assertions(1);
        return expect(client.subDeviceManagement.deleteTopo({
          subDevices: {}
        })).rejects.toThrow();
      });

      it('should return fail if all of the proviced subDevices are invalid', async() => {
        const result = await client.subDeviceManagement.deleteTopo({
          subDevices: [{
            productKey: 'not_exist',
            deviceKey: 'not_exist'
          }]
        });

        expect(result.code).not.toBe(200);
      });

      // TODO: 和文档不一致，现在的情况是：只要有一个删除成功，就算是成功的
      // it('should return fail if part of the proviced subDevices are invalid', async() => {
      //   const result = await client.subDeviceManagement.deleteTopo({
      //     subDevices: [{
      //       productKey: 'not_exist',
      //       deviceKey: 'not_exist'
      //     }, {
      //       productKey: subDeviceInfos[0].productKey,
      //       deviceKey: subDeviceInfos[0].deviceKey
      //     }]
      //   });

      //   expect(result.code).not.toBe(200);
      // });

      it('should remove topo successfully', async() => {
        const result = await client.subDeviceManagement.deleteTopo({
          subDevices: [{
            productKey: subDeviceInfos[0].productKey,
            deviceKey: subDeviceInfos[0].deviceKey
          }]
        });
        expect(result.code).toBe(200);

        const getTopoResult = await client.subDeviceManagement.getTopo();
        expect(getTopoResult.data.length).toBe(subDeviceInfos.length - 1);

        // remove the device from cache
        subDeviceInfos.splice(0, 1);
      });
    });

    describe('login single sub-device', () => {
      it('should throw an exception if no subDevice is provided', () => {
        expect.assertions(1);
        return expect(client.subDeviceManagement.loginSubDevice()).rejects.toThrow();
      });

      it('should return fail if subDevice in invalid', async() => {
        const result = await client.subDeviceManagement.loginSubDevice({
          subDevice: {
            productKey: 'not_exist',
            deviceKey: 'not_exist',
            deviceSecret: 'not_exist'
          }
        });

        expect(result.code).not.toBe(200);
      });

      it('should login successfully', async() => {
        const result = await client.subDeviceManagement.loginSubDevice({
          subDevice: subDeviceInfos[0]
        });

        expect(result.code).toBe(200);

        // if querying the sub-device's tags successfully, then we can confirm the sub-device is login
        const deviceInfo = new DeviceInfo({
          productKey: result.data.productKey,
          deviceKey: result.data.deviceKey
        });
        const tagResult = await client.deviceData.queryTag({
          deviceInfo
        });
        expect(tagResult.code).toBe(200);
      });
    });

    describe('logout single sub-device', () => {
      it('should throw an exception if no subDevice is provided', () => {
        expect.assertions(1);
        return expect(client.subDeviceManagement.logoutSubDevice()).rejects.toThrow();
      });

      it('should return successfully if the provided subDevice doesn\'t exist', async() => {
        const result = await client.subDeviceManagement.logoutSubDevice({
          subDevice: {
            productKey: 'not_exist',
            deviceKey: 'not_exist'
          }
        });

        expect(result.code).toBe(200);
      });

      it('should logout device successfully', async() => {
        const result = await client.subDeviceManagement.logoutSubDevice({
          subDevice: {
            productKey: subDeviceInfos[0].productKey,
            deviceKey: subDeviceInfos[0].deviceKey
          }
        });

        expect(result.code).toBe(200);
      });
    });

    describe('login sub-devices batch', () => {
      it('should throw an exception if no subDevices is provided', () => {
        expect.assertions(1);
        return expect(client.subDeviceManagement.batchLoginSubDevice()).rejects.toThrow();
      });

      it('should throw an exception if the provided subDevices is not an array', () => {
        expect.assertions(1);
        return expect(client.subDeviceManagement.batchLoginSubDevice({
          subDevices: {}
        })).rejects.toThrow();
      });

      it('should return fail if part of the provided subDevices is invalid', async() => {
        const result = await client.subDeviceManagement.batchLoginSubDevice({
          subDevices: [
            subDeviceInfos[0],
            {
              productKey: 'not_exist',
              deviceKey: 'not_exit',
              deviceSecret: 'not_exist'
            }
          ]
        });

        expect(result.code).not.toBe(200);
        expect(result.data.failedSubDevices.length).toBe(1);
        expect(result.data.loginedSubDevices.length).toBe(1);

        // logout the sub-devices which is login just
        const logoutResult = await client.subDeviceManagement.logoutSubDevice({
          subDevice: {
            productKey: subDeviceInfos[0].deviceKey,
            deviceKey: subDeviceInfos[0].deviceKey
          }
        });
        expect(logoutResult.code).toBe(200);
      });

      it('should login all provided sub-devices successfully', async() => {
        const result = await client.subDeviceManagement.batchLoginSubDevice({
          subDevices: subDeviceInfos
        });

        expect(result.code).toBe(200);
        expect(result.data.failedSubDevices.length).toBe(0);
        expect(result.data.loginedSubDevices.length).toBe(subDeviceInfos.length);
      });

      // it('should login sub-devices auto if reconnected', (done) => {
      //   client.on('connect', async() => {
      //     expect(client.reconnected).toBe(true);

      //     // if querying the sub-device's tags successfully, then we can confirm the sub-device is login
      //     setTimeout(async() => {
      //       const deviceInfo = new DeviceInfo({
      //         productKey: subDeviceInfos[0].productKey,
      //         deviceKey: subDeviceInfos[0].deviceKey
      //       });
      //       const tagResult = await client.deviceData.queryTag({
      //         deviceInfo
      //       });
      //       console.log('tagResult****: ', tagResult);
      //       expect(tagResult.code).toBe(200);
      //       done();
      //     }, 1000);
      //   });
      //   /* eslint-disable-next-line */
      //   client._transport._mqttClient.stream.destroy();
      // });
    });
  });

  describe('post measurepoints of sub-devices batch', () => {
    it('should return fail if part of the provided measurepoints are invalid with skipInvalidMeasurepoints set to false', async() => {
      const points = subDeviceInfos.map((deviceInfo, index) => ({
        productKey: deviceInfo.productKey,
        deviceKey: deviceInfo.deviceKey,
        measurepoints: index === 0 ? {
          ...testData.updatingMeasurepoints,
          mp_not_exist: 'eee'
        } : testData.updatingMeasurepoints
      }));

      const result = await client.deviceData.batchPostMeasurepoint({
        points,
        skipInvalidMeasurepoints: false
      });

      expect(result.code).not.toBe(200);
    });

    it('should return successfully if part of the provided measurepoints are invalid with skipInvalidMeasurepoints set to true', async() => {
      const points = subDeviceInfos.map((deviceInfo, index) => ({
        productKey: deviceInfo.productKey,
        deviceKey: deviceInfo.deviceKey,
        measurepoints: index === 0 ? {
          ...testData.updatingMeasurepoints,
          mp_not_exist: 'eee'
        } : testData.updatingMeasurepoints
      }));

      const result = await client.deviceData.batchPostMeasurepoint({
        points,
        skipInvalidMeasurepoints: true
      });

      expect(result.code).toBe(200);
    });

    it('should return successfully', async() => {
      const points = subDeviceInfos.map(deviceInfo => ({
        productKey: deviceInfo.productKey,
        deviceKey: deviceInfo.deviceKey,
        measurepoints: testData.updatingMeasurepoints
      }));

      const result = await client.deviceData.batchPostMeasurepoint({
        points
      });

      expect(result.code).toBe(200);
    });
  });

  // tagSuiteFactory(client, subDeviceInfos);
  attributeSuiteFactory(client, subDeviceInfos);
  measurepointSuiteFactory(client, subDeviceInfos);
  eventsSuiteFactory(client, subDeviceInfos);
}

module.exports = gatewaySuiteFactory;
