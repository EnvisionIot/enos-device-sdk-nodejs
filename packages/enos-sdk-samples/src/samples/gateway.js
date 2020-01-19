/**
 * This sample demonstrates the following sub-device management features:
 *
 * 1. Registering sub-devices
 * 2. Obtaining, adding or deleting topological relations
 * 3. Getting an individual sub-device online or offline, or getting multiple sub-devices online
 * 4. Receiving a command that enable, disable, or delete a sub-device
 */

const {SubDeviceInfo} = require('enos-mqtt-sdk-nodejs');
const {getGatewayClient, getTestData} = require('../fixtures/util');

const testData = getTestData();
const subDeviceProductKey = testData.staticDevice.productKey;
const subDeviceNames = [...testData.subDeviceNames];

async function testSubDevices() {
  const client = getGatewayClient();

  try {
    await client.connect();

    // Registering sub-devices
    const registerDeviceResponse = await client.subDeviceManagement.registerDevice({
      subDevices: generateSubDevices(subDeviceNames)
    });
    console.log('register device response: ', registerDeviceResponse);
    const registeredDevices = registerDeviceResponse.data;

    // Obtaining a topological relation between sub-devices and their gateway device
    const topos = await client.subDeviceManagement.getTopo();
    console.log('the amount of the sub-devices belong to topo: ', topos.data.length);

    // Adding newly registered sub-devices to a gateway device
    const subDevices = [];
    if (registeredDevices.length > 0) {
      for (let i = 0; i < registeredDevices.length; i++) {
        const subDevice = registeredDevices[i];

        if (i === 0) {
          subDevices.push(new SubDeviceInfo({
            productKey: subDevice.productKey,
            deviceKey: subDevice.deviceKey,
            deviceSecret: subDevice.deviceSecret
          }));
        } else {
          subDevices.push({
            productKey: subDevice.productKey,
            deviceKey: subDevice.deviceKey,
            deviceSecret: subDevice.deviceSecret
          });
        }
      }
    }
    const addTopoResult = await client.subDeviceManagement.addTopo({
      subDevices
    });
    console.log('add topo result: ', addTopoResult);

    // Querying the updated topological relation
    const newTopos = await client.subDeviceManagement.getTopo();
    console.log('get topo after add: ', newTopos.data.length);

    // Log in to the first registered sub-device
    const singleLoginResponse = await client.subDeviceManagement.loginSubDevice({
      subDevice: subDevices[0]
    });
    console.log('single device login response: ', singleLoginResponse);

    // Get the newly logined sub-device offline
    const logoutResponse = await client.subDeviceManagement.logoutSubDevice({
      subDevice: {
        productKey: subDevices[0].productKey,
        deviceKey: subDevices[0].deviceKey
      }
    });
    console.log('logout response: ', logoutResponse);

    // Get registered sub-devices online in batch
    const batchLoginResponse = await client.subDeviceManagement.batchLoginSubDevice({
      subDevices
    });
    console.log('batch login response: ', batchLoginResponse);

    // Unbind the first registered sub-device with its gateway device.
    const deleteResult = await client.subDeviceManagement.deleteTopo({
      subDevices: registeredDevices.map(subDevice => ({
        productKey: subDevice.productKey,
        deviceKey: subDevice.deviceKey
      }))
    });
    console.log('delete topo result: ', deleteResult);

    // Querying the updated topological relation
    const afterDeleteTopos = await client.subDeviceManagement.getTopo();
    console.log('get topo after delete: ', afterDeleteTopos.data.length);

    // Enable sub-devices
    client.subDeviceManagement.onSubDevicesEnable((request, response) => {
      console.log('enable request: ', request);
      response.send(200);
    });

    // Disable sub-devices
    client.subDeviceManagement.onSubDevicesDisable((request, response) => {
      console.log('disable request: ', request);
      response.send(200);
    });

    // Delete sub-devices
    client.subDeviceManagement.onSubDevicesDelete((request, response) => {
      console.log('delete request: ', request);
      response.send(200);
    });
  } catch (err) {
    console.log(err && err.message);
  }
}


testSubDevices();

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
