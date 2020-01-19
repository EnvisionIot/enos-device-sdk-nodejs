export interface IUpstreamResponse<T> {
  id: string;
  code: number;
  data: T;
  message?: string;
}

export class UpstreamResponse<T> {
  id: string;
  code: number;
  data: T;
  message?: string;

  constructor(payload: Buffer) {
    const msg = this._decodePayload(payload);
    if (!msg) {
      throw new Error(`decode payload ${(payload || '').toString()} fail: `);
    }

    this.id = msg.id;
    this.code = msg.code;
    this.message = msg.message;
    this.data = msg.data;
  }

  private _decodePayload(payload: Buffer): IUpstreamResponse<T> | null {
    if (!payload) {
      return null;
    }

    let msg: IUpstreamResponse<any> = {} as IUpstreamResponse<any>;
    try {
      msg = JSON.parse(payload.toString());
      // The `data` field in the msg object may be an empty object {}, a string, an object or an array
      // After the string with only number strings are converted with `JSON.parse`, it will be converted to the `number` type.
      // So only the common object and array scenes will be converted, and the other scenes will be output as they are.
      if (msg && msg.data && typeof msg.data !== 'object') {
        const parsedData = JSON.parse(msg.data);
        if (typeof parsedData === 'object') {
          msg.data = parsedData;
        }
      }

      return msg;
    } catch (e) {
      return null;
    }
  }
}
