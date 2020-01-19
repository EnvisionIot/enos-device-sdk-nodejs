interface ICommandRequest {
  id: string;
  method: string;
  params: any;
  version: string;
}

export class CommandRequest<T> {
  messageId: string;
  version: string;
  method: string;
  params: T;

  constructor(payload: Buffer) {
    const msg = this._decodePayload(payload);

    if (!msg) {
      throw new Error(`decode payload ${(payload || '').toString()} fail: `);
    }

    this.messageId = msg.id;
    this.version = msg.version;
    this.method = msg.method;
    this.params = msg.params;
  }

  private _decodePayload(payload: Buffer): ICommandRequest | null {
    if (!payload) {
      return null;
    }

    let msg: ICommandRequest = {} as ICommandRequest;
    try {
      msg = JSON.parse(payload.toString());
      // The `params` field in `msg` is already an object, no special processing is required
      return msg;
    } catch (e) {
      return null;
    }
  }
}
