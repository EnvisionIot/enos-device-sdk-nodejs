const {getDeviceClient, DEVICE_TYPE} = require('../fixtures/util');
const deviceSuiteFactory = require('./suite_factory/device_factory');

deviceSuiteFactory(getDeviceClient(DEVICE_TYPE.STATIC), DEVICE_TYPE.STATIC);
