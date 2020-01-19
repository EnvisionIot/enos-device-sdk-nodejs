import sha256 from 'crypto-js/sha256';
import sha1 from 'crypto-js/sha1';
import md5 from 'crypto-js/md5';
import hamcsha1 from 'crypto-js/hmac-sha1';
import {SIGN_METHOD} from '../constants';

export interface ISignParams {
  clientId: string;
  deviceKey: string;
  productKey: string;
  timestamp: number;
  cleanSession?: string;
}

const signMethodMap = {
  [SIGN_METHOD.SHA1]: sha1,
  [SIGN_METHOD.HMACSHA1]: hamcsha1,
  [SIGN_METHOD.MD5]: md5,
  [SIGN_METHOD.SHA256]: sha256
};

export function isSupportedSignMethod(signMethodName: SIGN_METHOD): boolean {
  return !!signMethodMap[signMethodName];
}

export function sign(params: ISignParams, secret: string, signMethodName: SIGN_METHOD): string {
  const signMethod = signMethodMap[signMethodName] || null;
  let signingStr = '';

  if (!isSupportedSignMethod(signMethodName)) {
    throw new Error(`signMethod ${signMethodName} not exists`);
  }

  if (params) {
    signingStr = Object.keys(params).sort().reduce((str, paramName) => (
      `${str}${paramName}${params[paramName]}`
    ), '');
  }

  signingStr += secret;
  return signMethod(signingStr, secret).toString().toUpperCase();
}
