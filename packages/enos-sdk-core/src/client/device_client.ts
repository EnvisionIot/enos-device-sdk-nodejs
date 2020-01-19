import assert from 'assert';
import {EventEmitter} from 'events';
import {SECURE_MODE} from '../constants';
import {DeviceInfo} from '../deviceinfo';
import {callbackToPromise} from '../utils';
import {Topic, ITopicConstant} from '../topic';
import {UpstreamService, CommandService} from '../services';
import {INodeStyleCallback, IDeviceClientOptions, IDeviceTransport, IDeviceTransportCtor} from '../interfaces';

export interface IUpstreamOptions {
  qos?: 0 | 1;
  /**
   * Identifies whether it is necessary to wait for the server to return. Default is true;
   * if set to false, the callback function will be called immediately after the message is sent successfully
   */
  needReply?: boolean;
}

export interface IDeviceUpstreamOptions extends IUpstreamOptions {
  deviceInfo?: DeviceInfo;
}

type IDeviceActivateCommandRequest = {
  assetId: string;
  productKey: string;
  deviceKey: string;
  deviceSecret: string;
};

export class DeviceClient extends EventEmitter {
  protected _transport: IDeviceTransport;
  protected _deviceInfo: DeviceInfo;
  protected _secureMode: SECURE_MODE;
  deviceData: UpstreamService;
  deviceCommand: CommandService;

  constructor(TransportCtor: IDeviceTransportCtor, options: IDeviceClientOptions) {
    super();

    this._validateClientOptions(options);

    const {productKey, productSecret, deviceKey, deviceSecret, secureMode} = options;
    this._deviceInfo = new DeviceInfo({productKey, productSecret, deviceKey, deviceSecret});
    this._transport = new TransportCtor(options);
    this._secureMode = secureMode;

    this.deviceData = new UpstreamService(this, this._transport);
    this.deviceCommand = new CommandService(this, this._transport);

    this._transport.on('connect', () => { this.emit('connect'); });
    this._transport.on('error', (err) => { this.emit('error', err); });
    this._transport.on('close', () => { this.emit('close'); });
    this._transport.on('end', () => { this.emit('end'); });
    this._transport.on('message', (topic, payload) => {
      this.emit('message', topic, payload);
    });
  }

  private _validateClientOptions(options: IDeviceClientOptions) {
    assert(options.brokerUrl, 'option brokerUrl is required');
    assert(options.secureMode, 'option secureMode is required');
    assert(options.secureMode in SECURE_MODE, 'option secureMode is invalid');

    if (options.secureMode === SECURE_MODE.VIA_DEVICE_SECRET) {
      assert(options.productKey && options.deviceKey && options.deviceSecret,
        'options deviceKey & productKey & deviceSecret are all required with VIA_DEVICE_SECRET mode enabled'
      );
    }

    if (options.secureMode === SECURE_MODE.VIA_PRODUCT_SECRET) {
      assert(options.productKey && options.deviceKey && options.productSecret,
        'options deviceKey & productKey & productSecret are all required with VIA_PRODUCT_SECRET mode enabled'
      );
    }
  }

  get connected(): boolean {
    return this._transport.connected;
  }

  get reconnected(): boolean {
    return this._transport.reconnected;
  }

  get deviceInfo(): DeviceInfo {
    return this._deviceInfo;
  }

  get secureMode(): SECURE_MODE {
    return this._secureMode;
  }

  /**
   * Connect to the cloud
   *
   * After the connection is successful, return the device secret of the device
   */
  async connect(): Promise<string> {
    return callbackToPromise((_callback) => {
      if (this._transport.connected) {
        _callback(null, this._deviceInfo.deviceSecret);
      } else {
        this._transport.connect((err) => {
          if (err) {
            _callback(err);
          } else if (this._secureMode === SECURE_MODE.VIA_PRODUCT_SECRET) {
            // 当鉴权方式为一型一密的动态激活时，需要监听Cloud返回已获取deviceSecret
            this._onDynamicDeviceActivate(_callback);
          } else {
            _callback(null, this._deviceInfo.deviceSecret);
          }
        });
      }
    });
  }

  /**
   * Closes the transport connection and destroys the client resources.
   *
   * *Note: After calling this method the Client object cannot be reused.*
   */
  async close(): Promise<void> {
    return callbackToPromise((_callback) => {
      this._transport.end(false, () => {
        _callback();
      });
    });
  }

  /**
   * Subscribe dynamic activate command of the device
   *
   * Once activated, cloud will return the device secret of the device
   */
  protected _onDynamicDeviceActivate(callback: INodeStyleCallback<string>) {
    const deviceActivateTopic: ITopicConstant = {
      requestTopic: '/ext/session/%s/%s/thing/activate/info'
    };
    const topic = new Topic(deviceActivateTopic, this._deviceInfo);
    this._transport.onCommand<IDeviceActivateCommandRequest, any>(topic, (request, response) => {
      if (request.params && request.params.deviceSecret) {
        this._deviceInfo.deviceSecret = request.params.deviceSecret;
        callback(null, request.params.deviceSecret);
      }
      response.send(200);
    });
  }
}
