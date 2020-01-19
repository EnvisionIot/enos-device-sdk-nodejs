const {DeviceClient, SECURE_MODE} = require('enos-mqtt-sdk-nodejs');
const {getTestData} = require('../../fixtures/util');

const testData = getTestData();

/**
 * Used to create test suite for establishing a connection
 *
 * @param {DeviceClient} client
 */
function connectionOpenSuiteFactory(client) {
  describe('Client open connection', () => {
    it('should throw an exception if brokerUrl is not provided', () => {
      expect(() => new DeviceClient({
        secureMode: SECURE_MODE.VIA_DEVICE_SECRET
      })).toThrow();
    });

    it('should throw an exception if secureMode is not provided', () => {
      expect(() => new DeviceClient({
        brokerUrl: testData.tcpBrokerUrl
      })).toThrow();
    });

    it('should throw an exception if secureMode is invalid', () => {
      expect(() => new DeviceClient({
        brokerUrl: testData.tcpBrokerUrl,
        secureMode: 0
      })).toThrow();
    });

    it('should throw an expection if secureMode is 2 and pk/dk/ds is not complete', () => {
      expect(() => new DeviceClient({
        brokerUrl: testData.tcpBrokerUrl,
        secureMode: SECURE_MODE.VIA_DEVICE_SECRET,
        productKey: 'randomKey',
        deviceKey: 'randonKey'
      })).toThrow();
    });

    it('should throw an expection if secureMode is 3 and pk/dk/ps is not complete', () => {
      expect(() => new DeviceClient({
        brokerUrl: testData.tcpBrokerUrl,
        secureMode: SECURE_MODE.VIA_DEVICE_SECRET,
        productKey: 'randomKey',
        deviceKey: 'randonKey'
      })).toThrow();
    });

    it('should throw an exception if the provided options are not valid', () => {
      const deviceClient = new DeviceClient({
        brokerUrl: testData.tcpBrokerUrl,
        secureMode: SECURE_MODE.VIA_DEVICE_SECRET,
        productKey: 'randomKey',
        deviceKey: 'randonKey',
        deviceSecret: 'randomSecret',
        mqttOptions: {
          reconnectPeriod: 0
        }
      });
      return expect(deviceClient.connect()).rejects.toThrow();
    });

    it('should connect successfully and return deviceSecret', async(done) => {
      client.on('connect', () => {
        expect(client.connected).toBe(true);
        done();
      });

      expect(client.connected).toBe(false);
      const deviceSecret = await client.connect();
      expect(client.connected).toBe(true);
      expect(deviceSecret).toEqual(client.deviceInfo.deviceSecret);
    });
  });
}

/**
 * generate connection close suite
 *
 * @param {DeviceClient} client
 */
function connectionCloseSuiteFactory(client) {
  describe('Client close connection', () => {
    it('should close successfully', async() => {
      client.on('close', () => {
        expect(client.connected).toBe(false);
      });
      client.on('end', () => {
        expect(client.connected).toBe(false);
      });
      expect(client.connected).toBe(true);
      await client.close();
      expect(client.connected).toBe(false);
    });
  });
}

module.exports = {
  connectionOpenSuiteFactory,
  connectionCloseSuiteFactory
};
