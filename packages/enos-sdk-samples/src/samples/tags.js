/**
 * Obtaining, reporting, or deleting device tags
 */

const {getDeviceClient, DEVICE_TYPE} = require('../fixtures/util');

async function testTags() {
  const client = getDeviceClient(DEVICE_TYPE.STATIC);

  try {
    await client.connect();

    // Obtain tags
    const queryTagResponse = await client.deviceData.queryTag();
    console.log('query tag response: ', queryTagResponse);

    // Update tags
    const updateTagResponse = await client.deviceData.updateTag({
      tags: [
        {tagKey: 'test', tagValue: 'aaaaa'},
        {tagKey: 'waitingDelete', tagValue: 'delete'}
      ]
    });
    console.log('update tag response: ', updateTagResponse);

    // Delete tags
    const deleteTagResponse = await client.deviceData.deleteTag({
      tagKeys: ['waitingDelete']
    });
    console.log('delete tag response: ', deleteTagResponse);
  } catch (err) {
    console.log('error ocucrs: ', err && err.message);
  } finally {
    client.close();
  }
}

testTags();
