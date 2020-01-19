/** Secure Mode */
export enum SECURE_MODE {
  VIA_DEVICE_SECRET = 2,
  VIA_PRODUCT_SECRET = 3
}

/** Supportted sign methods */
export enum SIGN_METHOD {
  SHA1 = 'sha1',
  HMACSHA1 = 'hmacsha1',
  MD5 = 'md5',
  SHA256 = 'sha256'
};

/** Success code of response */
export const SUCCESS_CODE = 200;
