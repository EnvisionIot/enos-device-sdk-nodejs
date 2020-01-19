import {DeviceClient as BaseDeviceClient, GatewayClient as BaseGatewayClient, IDeviceClientOptions} from 'enos-device-sdk-nodejs-core';
import {MqttTransport} from './mqtt_transport';

export class DeviceClient extends BaseDeviceClient {
  constructor(clientOptions: IDeviceClientOptions) {
    super(MqttTransport, clientOptions);
  }
}

export class GatewayClient extends BaseGatewayClient {
  constructor(clientOptions: IDeviceClientOptions) {
    super(MqttTransport, clientOptions);
  }
}
