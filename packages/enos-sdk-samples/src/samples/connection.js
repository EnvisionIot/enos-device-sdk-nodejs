/**
 * Connecting a device to cloud
 *
 * You can connect a device through:
 * 1. Per-device secret authentication
 * 2. Per-product secret authentication
 * 3. X.509-certificate-based authentication
 */

const {getDeviceClient, DEVICE_TYPE} = require('../fixtures/util');

/** Per-device secret authentication */
async function testStaticDeviceLogin() {
  const client = getDeviceClient(DEVICE_TYPE.STATIC);

  client.on('connect', () => {
    console.log('connect event of the static device');
  });
  client.on('close', () => {
    console.log('close event of the static device');
  });

  try {
    const loginDeviceSecret = await client.connect();
    console.log('static device connected: ', loginDeviceSecret);

    setTimeout(async() => {
      await client.close();
      console.log('the connection of the static device is closed');
    }, 2000);
  } catch (err) {
    console.log(err && err.message);
  }
}
testStaticDeviceLogin();

/** Per-product secret authentication */
async function testDynamicDeviceLogin() {
  const client = getDeviceClient(DEVICE_TYPE.DYNAMIC);

  try {
    const dynamicDeviceSecret = await client.connect();
    console.log('dynamic device connected: ', dynamicDeviceSecret);

    setTimeout(async() => {
      await client.close();
      console.log('the connection of the dynamic device is closed');
    }, 3000);
  } catch (err) {
    console.log(err && err.message);
  }
}
testDynamicDeviceLogin();

/** X.509-certificate-based authentication */
async function testSecureLogin() {
  const client = getDeviceClient(DEVICE_TYPE.CERT);

  client.connect()
    .then((certDeviceSecret) => {
      console.log('cert device connected: ', certDeviceSecret);

      return client.close();
    })
    .then(() => {
      console.log('the connection of the cert device is closed');
    })
    .catch((err) => {
      console.log(err && err.message);
    });
}
testSecureLogin();
