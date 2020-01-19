module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest'
  }
  // testMatch: [
  //   '**/tests/gateway_device.test.js'
  // ]
};
