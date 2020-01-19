/**
 * Reporting an event
 */

const {getDeviceClient, DEVICE_TYPE} = require('../fixtures/util');

async function testPostEvent() {
  const client = getDeviceClient(DEVICE_TYPE.STATIC);

  try {
    await client.connect();

    // Report an event named "event_test"
    const postEventResponse = await client.deviceData.postEvent({
      eventName: 'event_test',
      eventParams: {
        isMale: 2,
        isChild: 10
      }
    });
    console.log('post event response: ', postEventResponse);
  } catch (err) {
    console.log('error occurs: ', err && err.message);
  } finally {
    client.close();
  }
}

testPostEvent();
