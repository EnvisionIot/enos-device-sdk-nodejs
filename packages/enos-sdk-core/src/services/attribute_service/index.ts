import assert from 'assert';
import Service from '../service';
import {Topic} from '../../topic';
import * as attributeTopics from './attribute_topics';
import {callbackToPromise} from '../../utils';
import {UpstreamRequest, IUpstreamResponse} from '../../message';
import {IDeviceUpstreamOptions, DeviceClient} from '../../client/device_client';

interface IQueryAttributeUpstreamOptions extends IDeviceUpstreamOptions {
  attributeIds?: string[]
}

interface IUpdateAttributeUpstreamOptions extends IDeviceUpstreamOptions {
  attributeMap: Directory<Object>;
}

interface IDeleteAttributeUpstreamOptions extends IDeviceUpstreamOptions {
  attributeIds: string[]
}

export default class AttributeService extends Service<DeviceClient> {
  /**
   * Query attributes
   *
   * 1. If the specified attribute identifier list is empty, the cloud returns all attributes having values
   * 2. If the attributes to be queried has no value, it will not be in the returned list
   */
  async queryAttribute(queryParams: IQueryAttributeUpstreamOptions): Promise<IUpstreamResponse<Directory<Object>>> {
    this._validateParams(queryParams);
    if (queryParams && queryParams.attributeIds) {
      assert(Array.isArray(queryParams.attributeIds), 'attributeIds should be an array');
    }

    const params = this._extractParams(queryParams);
    const topic = new Topic(attributeTopics.queryAttributeTopic, params.deviceInfo);
    const message = new UpstreamRequest(topic, {attributes: (queryParams && queryParams.attributeIds) || []});
    return callbackToPromise((_callback) => {
      this._transport.publish(message, params.upstreamOptions, _callback);
    });
  }

  /**
   * Update attributes
   *
   * 1. The updated attributes must be existing attributes of the device, and the value type must match
   * 2. The updating operation is atomic; As long as one of the attributes does not meet the specifications, the other attributes will not be updated
   */
  async updateAttribute(updateParams: IUpdateAttributeUpstreamOptions): Promise<IUpstreamResponse<void>> {
    this._validateParams(updateParams);
    assert(updateParams && updateParams.attributeMap, 'attributeMap is required');
    assert(typeof updateParams.attributeMap === 'object', 'attributeMap should be in {key:value} format');

    const params = this._extractParams(updateParams);
    const topic = new Topic(attributeTopics.updateAttributeTopic, params.deviceInfo);
    const message = new UpstreamRequest(topic, {attributes: (updateParams && updateParams.attributeMap) || {}});
    return callbackToPromise((_callback) => {
      this._transport.publish(message, params.upstreamOptions, _callback);
    });
  }

  /**
   * Delete attributes
   *
   * 1. Just delete the value of the attribute, the attribute itself is still on the device
   * 2. After deleting, you can reset the value of the attribute through `updateAttribute` method
   */
  async deleteAttribute(deleteParams: IDeleteAttributeUpstreamOptions): Promise<IUpstreamResponse<void>> {
    this._extractParams(deleteParams);
    assert(deleteParams && deleteParams.attributeIds, 'attributeIds is required');
    assert(Array.isArray(deleteParams.attributeIds), 'attributeIds should be an array');

    const params = this._extractParams(deleteParams);
    const topic = new Topic(attributeTopics.deleteAttributeTopic, params.deviceInfo);
    const message = new UpstreamRequest(topic, {attributes: (deleteParams && deleteParams.attributeIds) || []});
    return callbackToPromise((_callback) => {
      this._transport.publish(message, params.upstreamOptions, _callback);
    });
  }
}
