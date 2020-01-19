import assert from 'assert';
import Service from '../service';
import {Topic} from '../../topic';
import {callbackToPromise} from '../../utils';
import * as gatewayTopics from './gateway_topics';
import {ICommandCallback} from '../../interfaces';
import {SUCCESS_CODE, SIGN_METHOD} from '../../constants';
import {GatewayClient} from '../../client/gateway_client';
import {IUpstreamOptions} from '../../client/device_client';
import {UpstreamRequest, IUpstreamResponse} from '../../message';
import {SubDeviceInfo, ISubDeviceIdentifier} from '../../deviceinfo';

export default class GatewayService extends Service<GatewayClient> {
  /**
   * Register a device
   */
  async registerDevice(registerParams: IRegisterUpstreamOptions): Promise<ISubDeviceRegistryPromiseResponse> {
    this._validateParams(registerParams);
    assert(registerParams && registerParams.subDevices, '"subDevices" is required');
    assert(Array.isArray(registerParams.subDevices), '"subDevices" should be an array');

    const params = this._extractParams(registerParams);
    const topic = new Topic(gatewayTopics.registerDeviceTopic, params.deviceInfo);
    const message = new UpstreamRequest(topic, (registerParams && registerParams.subDevices) || []);
    return callbackToPromise((_callback) => {
      this._transport.publish(message, params.upstreamOptions, _callback);
    });
  }

  /**
   * Get topological relationships of sub-devices
   */
  async getTopo(queryParams?: IUpstreamOptions): Promise<IGetTopoPromiseResponse> {
    this._validateParams(queryParams);

    const params = this._extractParams(queryParams);
    const topic = new Topic(gatewayTopics.getTopoTopic, params.deviceInfo);
    const message = new UpstreamRequest(topic, {});
    return callbackToPromise((_callback) => {
      this._transport.publish(message, params.upstreamOptions, _callback);
    });
  }

  /**
   * Add topological relationships of sub-devices
   */
  async addTopo(addParams: IAddTopoUpstreamOptions): Promise<IUpstreamResponse<void>> {
    this._validateParams(addParams);
    assert(addParams && addParams.subDevices, '"subDevices" is required');
    assert(Array.isArray(addParams.subDevices), '"subDevices" should be an array');

    const subDeviceLoginInfos: any = [];
    (addParams.subDevices || []).forEach((subDevice) => {
      if (subDevice instanceof SubDeviceInfo) {
        subDeviceLoginInfos.push(subDevice.getLoginInfo());
      } else {
        subDeviceLoginInfos.push(new SubDeviceInfo(subDevice as ISubDeviceIdentifier).getLoginInfo());
      }
    });

    const params = this._extractParams(addParams);
    const topic = new Topic(gatewayTopics.addTopoTopic, params.deviceInfo);
    const message = new UpstreamRequest(topic, subDeviceLoginInfos);
    return callbackToPromise((_callback) => {
      this._transport.publish(message, params.upstreamOptions, _callback);
    });
  }

  /**
   * Delete topological relationships of sub-devices
   */
  async deleteTopo(deleteParams: IDeleteTopoUpstreamOptions): Promise<IUpstreamResponse<void>> {
    this._validateParams(deleteParams);
    assert(deleteParams && deleteParams.subDevices, '"subDevices" is required');
    assert(Array.isArray(deleteParams.subDevices), '"subDevices" should be an array');

    const params = this._extractParams(deleteParams);
    const topic = new Topic(gatewayTopics.deleteTopoTopic, params.deviceInfo);
    const message = new UpstreamRequest(topic, (deleteParams && deleteParams.subDevices) || []);
    return callbackToPromise((_callback) => {
      this._transport.publish(message, params.upstreamOptions, _callback);
    });
  }

  /**
   * Connect a sub-device to EnOS Cloud
   *
   * Ensure that the sub-device to connect has been registered to the EnOS Cloud.
   * Ensure that the topological relationship with the edge has been added to the edge.
   * EnOS Cloud verifies the identity of the sub-device according to the topological relationship to identify whether the sub-device can use the edge connection.
   */
  async loginSubDevice(loginParams: ILoginUpstreamOptions): Promise<ISubDeviceLoginPromiseResponse> {
    this._validateParams(loginParams);
    assert(loginParams && loginParams.subDevice, '"subDevice" is required');
    assert(this._client instanceof GatewayClient);

    let subDeviceInfo: SubDeviceInfo;
    if (loginParams.subDevice instanceof SubDeviceInfo) {
      subDeviceInfo = loginParams.subDevice;
    } else {
      subDeviceInfo = new SubDeviceInfo(loginParams.subDevice as ISubDeviceIdentifier);
    }

    const params = this._extractParams(loginParams);
    const topic = new Topic(gatewayTopics.loginSubDeviceTopic, params.deviceInfo);
    const message = new UpstreamRequest(topic, subDeviceInfo.getLoginInfo() || {});

    return callbackToPromise((_callback) => {
      this._transport.publish<ISubDeviceLoginResponse>(message, params.upstreamOptions, (err, result?: ISubDeviceLoginPromiseResponse) => {
        // Cache the logined sub-device info
        if (result && result.code === SUCCESS_CODE && result.data) {
          this._client.loginedSubDeviceMap.set(this._getLoginedDeviceId(result.data.productKey, result.data.deviceKey), subDeviceInfo);
        }
        _callback(err, result);
      });
    });
  }

  /**
   * Connect sub-devices to EnOS Cloud in batch
   *
   * Ensure that the sub-devices to connect have been registered to the EnOS Cloud.
   * Ensure that the topological relationship with the edge has been added to the edge.
   * EnOS Cloud verifies the identity of the sub-devices according to the topological relationship to identify whether the sub-devices can use the edge connection.
   */
  async batchLoginSubDevice(loginParams: IBatchLoginUpstreamOptions): Promise<ISubDeviceBatchLoginPromiseResponse> {
    this._validateParams(loginParams);
    assert(loginParams && loginParams.subDevices, '"subDevices" is required');
    assert(Array.isArray(loginParams.subDevices), '"subDevices should be an array');

    const params = this._extractParams(loginParams);
    const timestamp = parseInt(loginParams.timestamp || '0') || new Date().getTime();
    const clientId = loginParams.clientId || this._client.deviceInfo.productKey;
    const signMethod = SIGN_METHOD.SHA256;
    const requestParams = {
      clientId,
      signMethod,
      timestamp: `${timestamp}`,
      subDevices: [] as any
    };
    const subDeviceInfoMap: Map<string, SubDeviceInfo> = new Map();

    requestParams.subDevices = loginParams.subDevices.map((subDevice) => {
      const deviceInfo = new SubDeviceInfo({
        timestamp,
        clientId,
        productKey: subDevice.productKey,
        deviceKey: subDevice.deviceKey,
        deviceSecret: subDevice.deviceSecret
      });

      subDeviceInfoMap.set(subDevice.deviceKey, deviceInfo);
      return {
        sign: deviceInfo.getLoginInfo().sign,
        secureMode: deviceInfo.getSecureMode(),
        productKey: deviceInfo.productKey,
        deviceKey: deviceInfo.deviceKey
      };
    });

    const topic = new Topic(gatewayTopics.batchLoginSubDeviceTopic, params.deviceInfo);
    const message = new UpstreamRequest(topic, requestParams || {});

    return callbackToPromise((_callback) => {
      this._transport.publish(message, params.upstreamOptions, (err, result: ISubDeviceBatchLoginPromiseResponse | undefined) => {
        // Cache logined sub-devices
        if (result && result.code === SUCCESS_CODE && result.data) {
          (result.data.loginedSubDevices || []).forEach((subDevice) => {
            const subDeviceInfo = subDeviceInfoMap.get(subDevice.deviceKey);

            if (subDeviceInfo) {
              this._client.loginedSubDeviceMap.set(this._getLoginedDeviceId(subDevice.productKey, subDevice.deviceKey), subDeviceInfo);
            }
          });
        }
        _callback(err, result);
      });
    });
  }

  /**
   * Disconnect the sub-device from EnOS Cloud
   */
  async logoutSubDevice(logoutParams: ILogoutUpstreamOptions): Promise<ISubDeviceSimpleInfoPromise> {
    this._validateParams(logoutParams);
    assert(logoutParams && logoutParams.subDevice, '"subDevice" is required');

    const params = this._extractParams(logoutParams);
    const topic = new Topic(gatewayTopics.logoutSubDeviceTopic, params.deviceInfo);
    const message = new UpstreamRequest(topic, (logoutParams && logoutParams.subDevice) || []);
    return callbackToPromise((_callback) => {
      this._transport.publish(message, params.upstreamOptions, (err, result: ISubDeviceSimpleInfoPromise | undefined) => {
        if (result && result.code === SUCCESS_CODE && result.data) {
          // remove logout sub device from cache
          this._client.loginedSubDeviceMap.delete(this._getLoginedDeviceId(result.data.productKey, result.data.deviceKey));
        }
        _callback(err, result);
      });
    });
  }

  /**
   * Called when sub-devices are enabled
   */
  onSubDevicesEnable(callback: ICommandCallback<ISubDeviceSimpleInfo, any>) {
    const topic = new Topic(gatewayTopics.subDeviceEnableTopic, this._client.deviceInfo);
    this._transport.onCommand(topic, callback);
  }

  /**
   * Called when sub-devices are disabled
   */
  onSubDevicesDisable(callback: ICommandCallback<ISubDeviceSimpleInfo, any>) {
    const topic = new Topic(gatewayTopics.subDeviceDisableTopic, this._client.deviceInfo);
    this._transport.onCommand(topic, callback);
  }

  /**
   * Called when sub-devices are deleted
   */
  onSubDevicesDelete(callback: ICommandCallback<ISubDeviceSimpleInfo, any>) {
    const topic = new Topic(gatewayTopics.subDeviceDeleteTopic, this._client.deviceInfo);
    this._transport.onCommand(topic, callback);
  }

  private _getLoginedDeviceId(productKey: string, deviceKey: string): string {
    return `${productKey}-${deviceKey}`;
  }
}

/** upstream options of registering sub-devices */
interface IRegisterUpstreamOptions extends IUpstreamOptions {
  /** sub-device list */
  subDevices: {
    productKey: string;
    deviceKey?: string;
    deviceName: I18NString;
    deviceAttributes?: Directory<Object>;
    timezone: string;
    deviceDesc?: string;
  }[]
}

/** successful response of registering sub-devices */
interface ISubDeviceRegisterResponse {
  assetId: string;
  deviceKey: string;
  productKey: string;
  deviceSecret: string;
}
type ISubDeviceRegistryPromiseResponse = IUpstreamResponse<ISubDeviceRegisterResponse[]>;


/** Upstream options of adding topological relationships of sub-devices */
interface IAddTopoUpstreamOptions extends IUpstreamOptions {
  /** 待添加拓扑关系的子设备信息 */
  subDevices: (SubDeviceInfo | ISubDeviceCredential)[]
}

/** Upstream options of deleting topological relationships of sub-devices */
interface IDeleteTopoUpstreamOptions extends IUpstreamOptions {
  subDevices: ISubDeviceSimpleInfo[]
}

/** Upstream options of connecting a sub-device to EnOS Cloud */
interface ILoginUpstreamOptions extends IUpstreamOptions {
  /** Sub-device information to be connected */
  subDevice: SubDeviceInfo | ISubDeviceCredential
}

/** Upstream options of connecting sub-devices to EnOS Cloud in batch */
interface IBatchLoginUpstreamOptions extends IUpstreamOptions {
  /** sub-device list to be connected */
  subDevices: (SubDeviceInfo | ISubDeviceCredential)[],
  clientId?: string;
  // signMethod?: SIGN_METHOD;
  timestamp?: string;
}

/** Upstream options of disconnecting a sub-device from EnOS Cloud */
interface ILogoutUpstreamOptions extends IUpstreamOptions {
  subDevice: ISubDeviceSimpleInfo
}

/** Sub-device login credentials, used to generate sub-device login information */
interface ISubDeviceCredential {
  productKey: string;
  productSecret?: string;
  deviceKey: string;
  deviceSecret: string;
  /** The identifier of the sub-device. The value can be productKey or deviceName. */
  clientId?: string;
  timestamp?: number;
  signMethod?: string;
  /** Indicates whether to clear offline information for all sub-devices, which is information that has not been received by QoS 1. */
  cleanSession?: boolean;
}

/** Response of getting topological relationships of sub-devices */
interface IGetTopoResponse {
  productKey: string;
  productName: string;
  iotId: string;
  deviceKey: string;
  deviceSecret: string;
  deviceAttributes: Directory<Object>;
  deviceName: string;
  timezone: string;
  isDST: boolean;
  topo: string;
  orgCode: string;
  createBy: string;
  gmtCreate: number;
  modifiedByOrg: string;
  modifiedBy: string;
  gmtModified: number;
  gmtActive: number;
  gmtOnline: number;
  gmtOffline: number;
  status: string;
  nodeType: number;
  dataType: number;
}
type IGetTopoPromiseResponse = IUpstreamResponse<IGetTopoResponse[]>;

interface ISubDeviceLoginResponse {
  assetId: string;
  deviceKey: string;
  productKey: string;
}
type ISubDeviceLoginPromiseResponse = IUpstreamResponse<ISubDeviceLoginResponse>;

interface ISubDeviceBatchLoginResponse {
  code: number;
  message?: string;
  loginedSubDevices: ISubDeviceLoginResponse[],
  failedSubDevices: ISubDeviceSimpleInfo[]
}
type ISubDeviceBatchLoginPromiseResponse = IUpstreamResponse<ISubDeviceBatchLoginResponse>;

interface ISubDeviceSimpleInfo {
  productKey: string;
  deviceKey: string;
}
type ISubDeviceSimpleInfoPromise = IUpstreamResponse<ISubDeviceSimpleInfo>;

interface I18NString {
  defaultValue: string;
  i18nValue?: {
    /* eslint-disable-next-line camelcase */
    en_US?: string;
    /* eslint-disable-next-line camelcase */
    zh_CN?: string;
  }
}
