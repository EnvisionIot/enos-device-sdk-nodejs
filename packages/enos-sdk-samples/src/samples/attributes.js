/**
 * Obtaining, reporting, or deleting device tags
 */

const {getDeviceClient, DEVICE_TYPE} = require('../fixtures/util');

async function testAttributes() {
  const client = getDeviceClient(DEVICE_TYPE.STATIC);

  try {
    await client.connect();

    // Obtain attributes
    const queryAttributeResponse = await client.deviceData.queryAttribute({
      attributeIds: []
    });
    console.log('query attribute response: ', queryAttributeResponse);

    // Update attributes
    const updateAttributeResponse = await client.deviceData.updateAttribute({
      attributeMap: {
        age: 900,
        attribute_struct: {
          struct_int: 10,
          struct_string: 'test'
        }
      }
    });
    console.log('update attribute response: ', updateAttributeResponse);

    // Delete attributes
    const deleteAttributeResponse = await client.deviceData.deleteAttribute({
      attributeIds: ['age']
    });
    console.log('delete attribute response: ', deleteAttributeResponse);
  } catch (err) {
    console.log('error occurs: ', err && err.message);
  } finally {
    await client.close();
  }
}

testAttributes();
