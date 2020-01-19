import assert from 'assert';
import {DeviceInfo} from '../deviceinfo';
import {IDeviceTransport} from '../interfaces';
import {GatewayClient} from '../client/gateway_client';
import {DeviceClient, IUpstreamOptions} from '../client/device_client';

export default class Service<T extends (DeviceClient | GatewayClient)> {
  protected _client: T;
  protected _transport: IDeviceTransport;

  constructor(client: T, transport: IDeviceTransport) {
    this._client = client;
    this._transport = transport;
  }

  /**
   * Extra needed params from upstream params
   */
  protected _extractParams(upstreamParams: any): {deviceInfo: DeviceInfo, upstreamOptions: IUpstreamOptions} {
    const result = {
      deviceInfo: this._client.deviceInfo,
      upstreamOptions: {}
    };
    const upstreamOptionFields = ['qos', 'needReply'];

    if (upstreamParams) {
      Object.keys(upstreamParams).forEach((key) => {
        if (upstreamOptionFields.indexOf(key) > -1) {
          result.upstreamOptions[key] = upstreamParams[key];
        }
      });

      if (upstreamParams.deviceInfo) {
        result.deviceInfo = upstreamParams.deviceInfo;
      }
    }

    return result;
  }

  /**
   * Validate common upstream-options, including `qos` and `needReply`
   */
  protected _validateParams(params?: IUpstreamOptions) {
    if (params && params.qos) {
      assert(params.qos >= 0 && params.qos < 2, 'only qos 0 and 1 is support in current version');
    }

    if (params && params.needReply) {
      assert(typeof params.needReply === 'boolean', 'needReply should be boolean');
    }
  }
}

export type IServiceCtor<T extends (DeviceClient | GatewayClient)> = new (client: T, transport: IDeviceTransport) => Service<T>;
