/* eslint-disable */
const {DeviceClient} = require('enos-mqtt-sdk-nodejs');
/* eslint-enable */
const {DEVICE_TYPE} = require('../../fixtures/util');
const {connectionOpenSuiteFactory, connectionCloseSuiteFactory} = require('../subsuite_factory/connection_factory');
const tagSuiteFactory = require('../subsuite_factory/tag_factory');
const attributeSuiteFactory = require('../subsuite_factory/attribute_factory');
const measurepointSuiteFactory = require('../subsuite_factory/measurepoint_factory');
const gatewaySuiteFactory = require('../subsuite_factory/gateway_factory');
const eventsSuiteFactory = require('../subsuite_factory/events_factory');
const rawDataSuiteFactory = require('../subsuite_factory/rawdata_factory');

/**
 * Used to create test suite for devices
 *
 * @param {DeviceClient} client
 * @param {boolean} isGateway
 */
function deviceSuiteFactory(client, deviceType) {
  describe(`${deviceType} device test suite: `, () => {
    connectionOpenSuiteFactory(client);

    switch (deviceType) {
    case DEVICE_TYPE.GATEWAY:
      gatewaySuiteFactory(client);
      break;
    case DEVICE_TYPE.RAW:
      rawDataSuiteFactory(client);
      break;
    default:
      tagSuiteFactory(client);
      attributeSuiteFactory(client);
      measurepointSuiteFactory(client);
      eventsSuiteFactory(client);
    }

    connectionCloseSuiteFactory(client);
  });
}

module.exports = deviceSuiteFactory;
