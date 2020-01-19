import dbg from 'debug';
import {SUCCESS_CODE} from '../constants';
import {SubDeviceInfo} from '../deviceinfo';
import {DeviceClient} from './device_client';
import GatewayService from '../services/gateway_service';
import {IDeviceTransportCtor, IDeviceClientOptions} from '../interfaces';

const debug = dbg('enos-sdk-core:gateway_client');

export class GatewayClient extends DeviceClient {
  loginedSubDeviceMap: Map<string, SubDeviceInfo> = new Map();
  subDeviceManagement: GatewayService;

  constructor(TransportCtor: IDeviceTransportCtor, options: IDeviceClientOptions) {
    super(TransportCtor, options);

    this.subDeviceManagement = new GatewayService(this, this._transport);
    this._transport.on('connect', () => {
      // Auto connect the logined sub-devices once the client is reconnected
      if (this.reconnected) {
        this._autoLoginSubDevices();
      }
    });
  }

  private _autoLoginSubDevices() {
    if (this.loginedSubDeviceMap.size > 0) {
      this.subDeviceManagement.batchLoginSubDevice({
        subDevices: Array.from(this.loginedSubDeviceMap.values())
      }).then((result) => {
        if (result.code === SUCCESS_CODE) {
          debug('auto login sub-devices');
        } else {
          debug('failed to auto login sub-devices');
        }
      }).catch(() => {
        debug('failed to auto login sub-devices');
      });
    }
  }
}
