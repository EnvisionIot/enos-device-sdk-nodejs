import assert from 'assert';
import Service from '../service';
import {Topic} from '../../topic';
import {DeviceInfo} from '../../deviceinfo';
import * as commandTopics from './command_topics';
import {DeviceClient} from '../../client/device_client';
import {ICommandCallback, IRawDataCommandCallback} from '../../interfaces';

export default class CommandService extends Service<DeviceClient> {
  /**
   * Called when the cloud invokes the specific device service
   */
  onInvokeService(serviceName: string, callback: ICommandCallback<any, any>): void;
  onInvokeService(serviceName: string, deviceInfo: DeviceInfo, callback: ICommandCallback<any, any>): void
  onInvokeService(serviceName: string, deviceInfo: DeviceInfo | ICommandCallback<any, any>, callback?: ICommandCallback<any, any>): void {
    assert(serviceName, '"serviceName" is required');
    assert(typeof serviceName === 'string', '"serviceName" should be a string');

    let newCallback = callback;
    let finalDeviceInfo = this._client.deviceInfo;

    if (deviceInfo) {
      if (typeof deviceInfo === 'function') {
        newCallback = deviceInfo;
      } else {
        finalDeviceInfo = deviceInfo;
      }
    }

    assert(newCallback, 'callback is required');
    assert(typeof newCallback === 'function', 'callback should be a function');

    const topic = new Topic(commandTopics.serviceTopic, finalDeviceInfo, serviceName);
    this._transport.onCommand(topic, newCallback as ICommandCallback<any, any>);
  }

  /**
   * Called when the device measurement point is updated
   */
  onSetMeasurepoint(callback: ICommandCallback<any, any>): void;
  onSetMeasurepoint(deviceInfo: DeviceInfo, callback: ICommandCallback<any, any>): void;
  onSetMeasurepoint(deviceInfo: DeviceInfo | ICommandCallback<any, any>, callback?: ICommandCallback<any, any>) {
    let newCallback = callback;
    let finalDeviceInfo = this._client.deviceInfo;

    if (deviceInfo) {
      if (typeof deviceInfo === 'function') {
        newCallback = deviceInfo;
      } else {
        finalDeviceInfo = deviceInfo;
      }
    }

    assert(newCallback, 'callback is required');
    assert(typeof newCallback === 'function', 'callback should be a function');

    const topic = new Topic(commandTopics.setMeasurePointTopic, finalDeviceInfo);
    this._transport.onCommand(topic, newCallback as ICommandCallback<any, any>);
  }

  /**
   * Called when the device received raw data from the cloud
   */
  onModelDownRaw(callback: IRawDataCommandCallback<Buffer>) {
    const topic = new Topic(commandTopics.modelDownRawTopic, this._client.deviceInfo);
    this._transport.onRawDataCommand(topic, callback);
  }
}
