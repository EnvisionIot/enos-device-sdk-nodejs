/**
 * Receiving the following types of commands from the cloud:
 *
 * 1. Calling services of a device
 * 2. Setting a measurement point
 */

const {getDeviceClient, DEVICE_TYPE} = require('../fixtures/util');

async function testCommands() {
  const client = getDeviceClient(DEVICE_TYPE.STATIC);

  try {
    await client.connect();

    // Call a device service
    client.deviceCommand.onInvokeService('resetAge', async(request, response) => {
      console.log('invoke service request: ', request);
      await client.deviceData.postMeasurepoint({
        point: {
          measurepoints: {
            mp_age: request.params.age
          }
        }
      });
      response.send(200);
    });

    // Set measurement points
    client.deviceCommand.onSetMeasurepoint(async(request, response) => {
      console.log('set measurepoint request: ', request);
      await client.deviceData.postMeasurepoint({
        point: {
          measurepoints: request.params
        }
      });
      response.send(200);
    });
  } catch (err) {
    console.log('error occurs: ', err && err.message);
  }
}

testCommands();
