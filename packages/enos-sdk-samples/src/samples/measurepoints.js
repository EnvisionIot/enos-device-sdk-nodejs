/**
 * This sample includes the following scenarios:
 *
 * 1. Reporting an individual measurement point
 * 2. Reporting an individual offline measurement point
 * 3. Reporting measurement points in batch
 * 4. Reporting measurement points of multiple sub-devices in batch
 * 5. Reporting offline measurement points in batch
 */

const {getGatewayClient} = require('../fixtures/util');

async function testMeasurepoints() {
  const client = getGatewayClient();

  try {
    await client.connect();

    // Report an individual measurement point
    const postMpResponse = await client.deviceData.postMeasurepoint({
      point: {
        measurepoints: {
          mp_struct: {
            sub_age: 400,
            sub_gender: 'male'
          }
        }
      }
    });
    console.log('post mp response: ', postMpResponse);

    // Report an individual offline measurement point
    const resumeMpResponse = await client.deviceData.resumeMeasurepoint({
      point: {
        measurepoints: {
          mp_struct: {
            sub_age: 50,
            sub_gender: 'female'
          }
        },
        time: new Date('2019-12-11 00:00').getTime()
      }
    });
    console.log('resume mp response: ', resumeMpResponse);

    /** Reporting measurement points in batch */
    const batchPostMpResponse = await client.deviceData.batchPostMeasurepoint({
      points: [
        {
          measurepoints: {
            mp_age: 60
          }
        },
        {
          measurepoints: {
            mp_age: 20
          },
          time: new Date('2019-10-20 20:00').getTime()
        }
      ]
    });
    console.log('batch post mp response: ', batchPostMpResponse);

    /** Reporting offline measurement points in batch */
    const batchResumeMpResponse = await client.deviceData.batchResumeMeasurepoint({
      points: [
        {
          measurepoints: {
            mp_age: 200
          }
        },
        {
          measurepoints: {
            mp_age: 30
          },
          time: new Date('2019-10-20 20:00').getTime()
        }
      ]
    });

    console.log('batch resume mp response: ', batchResumeMpResponse);

    // Connecting sub-devices and reporting measurement points of multiple sub-devices in batch
    const loginResponse = await client.subDeviceManagement.batchLoginSubDevice({
      subDevices: [{
        productKey: 'C57DbCYa',
        deviceKey: 'Ko8gjY988u',
        deviceSecret: 'OGQsEiUtK9cxFGdE771N'
      }, {
        productKey: 'C57DbCYa',
        deviceKey: 'cDLROutVwE',
        deviceSecret: 'P96QPJk4KZ4kFPIpYySO'
      }]
    });
    console.log('login sub-devices response: ', loginResponse);

    const batchPostSubDevicesMpResponse = await client.deviceData.batchPostMeasurepoint({
      points: [{
        measurepoints: {
          mp_age: 200
        },
        productKey: 'C57DbCYa',
        deviceKey: 'cDLROutVwE'
      }, {
        measurepoints: {
          mp_age: 200
        },
        productKey: 'C57DbCYa',
        deviceKey: 'Ko8gjY988u'
      }]
    });
    console.log('batch post measurepoints of sub-devices response: ', batchPostSubDevicesMpResponse);
  } catch (err) {
    console.log('error occurs: ', err && err.message);
  } finally {
    client.close();
  }
}

testMeasurepoints();
