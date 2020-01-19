import {SECURE_MODE, SIGN_METHOD} from './constants';
import {sign} from './utils';

export interface IDeviceIdentifier {
  productKey: string;
  productSecret?: string;
  deviceKey: string;
  deviceSecret?: string;
}

export interface ISubDeviceIdentifier extends IDeviceIdentifier {
  // signMethod?: SIGN_METHOD;
  timestamp?: number;
  clientId?: string;
  cleanSession?: boolean;
}

/** Sub-device login information, used to add topology relationships and go online for sub-devices */
export interface ISubDeviceLoginInfo {
  productKey: string;
  deviceKey: string;
  clientId: string;
  timestamp: number;
  signMethod: string;
  secureMode?: SECURE_MODE;
  sign: string;
  cleanSession?: 'true' | 'false'
}

export class DeviceInfo {
  productKey: string;
  productSecret?: string;
  deviceKey: string;
  deviceSecret?: string;

  constructor(deviceInfo: IDeviceIdentifier) {
    this.productKey = deviceInfo.productKey;
    this.productSecret = deviceInfo.productSecret || '';
    this.deviceKey = deviceInfo.deviceKey;
    this.deviceSecret = deviceInfo.deviceSecret || '';
  }

  getSecureMode(): SECURE_MODE | undefined {
    if (this.deviceSecret) {
      return SECURE_MODE.VIA_DEVICE_SECRET;
    }

    if (this.productSecret) {
      return SECURE_MODE.VIA_PRODUCT_SECRET;
    }

    return undefined;
  }
}

export class SubDeviceInfo extends DeviceInfo {
  private _signMethod: SIGN_METHOD;
  clientId: string;
  cleanSession: boolean;
  timestamp: number;

  constructor(deviceInfo: ISubDeviceIdentifier) {
    super({
      productKey: deviceInfo.productKey,
      productSecret: deviceInfo.productSecret,
      deviceKey: deviceInfo.deviceKey,
      deviceSecret: deviceInfo.deviceSecret
    });

    const {clientId, timestamp, cleanSession} = deviceInfo;

    this._signMethod = SIGN_METHOD.SHA256;
    this.clientId = clientId || this.deviceKey;
    this.cleanSession = cleanSession || false;
    this.timestamp = timestamp || 0;
  }

  setClientId(clientId: string) {
    this.clientId = clientId;
  }

  getLoginInfo(signMethod?: SIGN_METHOD, signTimestamp?: number): ISubDeviceLoginInfo {
    const signMethodName = signMethod || this._signMethod;
    const timestamp = signTimestamp || this.timestamp || new Date().getTime();

    const signStr = sign({
      timestamp,
      productKey: this.productKey,
      deviceKey: this.deviceKey,
      clientId: this.clientId
    }, this.deviceSecret || '', signMethodName);

    const subDeviceLoginInfo: ISubDeviceLoginInfo = {
      timestamp,
      productKey: this.productKey,
      deviceKey: this.deviceKey,
      clientId: this.clientId,
      signMethod: signMethodName,
      sign: signStr
    };

    if (this.cleanSession) {
      subDeviceLoginInfo.cleanSession = 'true';
    }

    return subDeviceLoginInfo;
  }
}

export default DeviceInfo;
