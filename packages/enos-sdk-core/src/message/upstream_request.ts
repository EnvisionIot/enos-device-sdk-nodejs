import {Topic} from '../topic';

const VERSION = '1.0';

export class UpstreamRequest {
  messageId: string = '';
  version: string = VERSION;
  params: any;
  protected _topic: Topic;
  protected _isRawData: boolean;

  constructor(topic: Topic, params: any, isRawData: boolean = false) {
    this.params = params;
    this._topic = topic;
    this._isRawData = isRawData;
  }

  getMessageId(): string | undefined {
    return this.messageId;
  }

  setMessageId(messageId: string): void {
    this.messageId = messageId;
  }

  getTopicName(): string {
    return this._topic.getTopicName();
  }

  getResponseTopicName(): string {
    return this._topic.getResponseTopicName();
  }

  isRawData() {
    return this._isRawData;
  }

  getPayload(): Object {
    // If it is raw data, the payload is the data itself
    if (this._isRawData) {
      return this.params;
    }

    return {
      id: this.messageId,
      version: this.version,
      params: this.params,
      method: this._topic.getMethod()
    };
  }
}

export class MeasurePointBatchRequest extends UpstreamRequest {
  /**
   * Whether to allow sending measurement point data for offline devices. False by default.
   * If sending data of offline device is not allowed and the request contains an offline device, the entire request is declined.
   */
  private _allowOfflineSubDevice: boolean = false;
  /**
   * Whether to neglect invalid measurement point data in a request. False by default.
   * If the value is set to false and the request contains invalid measurement point data, the entire request is declined.
   */
  private _skipInvalidMeasurepoints: boolean = false;

  setAllowOfflineSubDevice(allowOfflineSubDevice: boolean): void {
    this._allowOfflineSubDevice = allowOfflineSubDevice;
  }

  setSkipInvalidMeasurepoints(skipInvalidMeasurepoints: boolean): void {
    this._skipInvalidMeasurepoints = skipInvalidMeasurepoints;
  }

  getPayload(): Object {
    return {
      ...super.getPayload(),
      allowOfflineSubDevice: this._allowOfflineSubDevice,
      skipInvalidMeasurepoints: this._skipInvalidMeasurepoints
    };
  }
}
