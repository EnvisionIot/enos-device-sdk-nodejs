import {Topic} from '../topic';
import * as Constants from '../constants';
import {IDeviceTransport, ICallbackWithoutResult} from '../interfaces';

export class CommandResponse<T> {
  private _messageId: string;
  private _code: number = Constants.SUCCESS_CODE;
  private _data: T | null = null;
  protected _topic: Topic;
  protected _transport: IDeviceTransport;

  constructor(messageId: string, topic: Topic, transport: IDeviceTransport) {
    this._messageId = messageId;
    this._topic = topic;
    this._transport = transport;
  }

  getEncodedPayload(): string | Buffer {
    return JSON.stringify({
      id: this._messageId,
      code: this._code,
      data: this._data || {}
    });
  }

  getTopicName() {
    return this._topic.getResponseTopicName();
  }

  /** Send response to cloud */
  send(code: number): void;
  send(code: number, data: T): void;
  send(code: number, data?: T): void {
    if (data) {
      this._data = data;
    }

    this._code = code;
    this._transport.sendCommandResponse<T>(this);
  }
}

export class RawDataCommandResponse<T> extends CommandResponse<T> {
  private _payload?: Buffer;
  constructor(topic: Topic, transport: IDeviceTransport) {
    super('', topic, transport);
  }

  getEncodedPayload(): Buffer {
    return this._payload || Buffer.from('');
  }

  send(code: number, data?: T | ICallbackWithoutResult, callback?: ICallbackWithoutResult): void {
    throw new Error('Please use sendRawData to send response data');
  }

  sendRawData(payload: Buffer): void;
  sendRawData(payload: Buffer, callback: ICallbackWithoutResult): void;
  sendRawData(payload: Buffer, callback?: ICallbackWithoutResult): void {
    this._payload = payload;
    this._transport.sendCommandResponse<T>(this, callback);
  }
}
