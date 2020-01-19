import {format} from 'util';
import {DeviceInfo} from './deviceinfo';

export interface ITopicConstant {
  requestTopic: string;
  requestTopicPattern?: RegExp;
  responseTopic?: string;
  method?: string;
}

export class Topic {
  _deviceInfo: DeviceInfo;
  _topicContant: ITopicConstant;
  _extraInfos: string[];

  constructor(topicConstant: ITopicConstant, deviceInfo: DeviceInfo, ...extraInfos: string[]) {
    this._deviceInfo = deviceInfo;
    this._topicContant = topicConstant;
    this._extraInfos = extraInfos;
  }

  _formatTopicName(topic) {
    return format(topic, this._deviceInfo.productKey, this._deviceInfo.deviceKey, ...this._extraInfos);
  }

  getTopicName(): string {
    return this._formatTopicName(this._topicContant.requestTopic);
  }

  getResponseTopicName() {
    const {responseTopic} = this._topicContant;
    return (responseTopic && this._formatTopicName(responseTopic)) || `${this.getTopicName()}_reply`;
  }

  getMethod() {
    return format(this._topicContant.method, ...this._extraInfos);
  }
}
