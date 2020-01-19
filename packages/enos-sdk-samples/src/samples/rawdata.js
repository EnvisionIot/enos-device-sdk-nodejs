/**
 * This sample demonstrates the following upstream and downstream pass-through scenarios:
 *
 * 1. Passing through device data to the cloud
 * 2. Receiving passed-through data from the cloud
 */
const {getDeviceClient, DEVICE_TYPE} = require('../fixtures/util');

async function testRawData() {
  const client = getDeviceClient(DEVICE_TYPE.RAW);

  try {
    await client.connect();

    const rawData = [
      0x01, // method, thing.measurepoint.post
      0x00, 0x00, 0x00, 0x14, // id
      0x01, // mp_int code
      0x00, 0x04, // length
      0x00, 0x00, 0x25, 0xf5, // value
      0x02, // mp_string code
      0x00, 0x0a, // length
      0x61, 0x62, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6a, // value
      0x03, // mp_double code
      0x00, 0x08, // length
      0x3f, 0xf2, 0x3d, 0x70, 0xa3, 0xd7, 0x0a, 0x3d, // value
      0x04, // mp_array code
      0x00, 0x14, // length
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x03, 0x00, 0x00, 0x00, 0x05, 0x00, 0x00, 0x00, 0x07, 0x00, 0x00, 0x00, 0x09, // value
      0x05, // mp_int_quality
      0x00, 0x05, // length
      0x00, 0x00, 0x01, 0xa7, // value
      0x01 // quality
    ];

    // A device passing through data to the cloud
    const rawDataResponse = await client.deviceData.upRawModel({
      rawData: Buffer.from(rawData),
      needReply: false
    });
    console.log('raw data response: ', rawDataResponse);

    // A device receiving passed-through data from the cloud
    client.deviceCommand.onModelDownRaw((payload, response) => {
      console.log('receive raw data: ', payload);
      response.sendRawData(Buffer.from(rawData));
    });
  } catch (err) {
    console.log('error occurs: ', err && err.message);
  }
}

testRawData();
