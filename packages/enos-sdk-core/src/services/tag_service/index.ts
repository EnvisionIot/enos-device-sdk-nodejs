import assert from 'assert';
import {Topic} from '../../topic';
import TSLService from '../tsl_service';
import * as tagTopics from './tag_topics';
import {callbackToPromise} from '../../utils';
import {UpstreamRequest, IUpstreamResponse} from '../../message';
import {IDeviceUpstreamOptions} from '../../client/device_client';

interface IQueryTagUpstreamOptions extends IDeviceUpstreamOptions {
  /** List of tag keys to be queried; when the keys is empty, all device tags will be returned */
  tagKeys?: string[]
}

interface IdeleteTagUpstreamOptions extends IDeviceUpstreamOptions {
  /** List of tag keys to be deleted */
  tagKeys: string[]
}

interface IUpdateTagUpstreamOptions extends IDeviceUpstreamOptions {
  /** List of tags to be updated */
  tags: {tagKey: string, tagValue: string}[]
}

export default class TagService extends TSLService {
  /**
   * Query tags
   *
   * If it is to obtain all tag information, set `queryParams` to` null`, or set tagKeys in `queryParams` to `[]`
   */
  async queryTag(queryParams?: IQueryTagUpstreamOptions): Promise<IUpstreamResponse<Directory<string>>> {
    this._validateParams(queryParams);
    if (queryParams && queryParams.tagKeys) {
      assert(Array.isArray(queryParams.tagKeys), 'queryParams.tagKeys should be an array');
    }

    const params = this._extractParams(queryParams);
    const topic = new Topic(tagTopics.queryTagTopic, params.deviceInfo);
    const message = new UpstreamRequest(topic, {tags: (queryParams && queryParams.tagKeys) || []});

    return callbackToPromise((_callback) => {
      this._transport.publish(message, params.upstreamOptions, _callback);
    });
  }

  /**
   * Update tags
   */
  async updateTag(updateParams: IUpdateTagUpstreamOptions): Promise<IUpstreamResponse<string>> {
    this._validateParams(updateParams);
    assert(updateParams && updateParams.tags, 'tags is required');
    assert(Array.isArray(updateParams.tags), 'tags should be an array');

    const params = this._extractParams(updateParams);
    const topic = new Topic(tagTopics.updateTagTopic, params.deviceInfo);
    const message = new UpstreamRequest(topic, updateParams.tags);
    return callbackToPromise((_callback) => {
      this._transport.publish(message, params.upstreamOptions, _callback);
    });
  }

  /**
   * Delete tags
   */
  async deleteTag(deleteParams: IdeleteTagUpstreamOptions): Promise<IUpstreamResponse<string>> {
    this._validateParams(deleteParams);
    assert(deleteParams && deleteParams.tagKeys, 'tagKeys is required');
    assert(Array.isArray(deleteParams.tagKeys), 'tagKeys should be an array');

    const params = this._extractParams(deleteParams);
    const topic = new Topic(tagTopics.deleteTagTopic, params.deviceInfo);
    const message = new UpstreamRequest(topic, {tags: (deleteParams && deleteParams.tagKeys) || []});
    return callbackToPromise((_callback) => {
      this._transport.publish(message, params.upstreamOptions, _callback);
    });
  }
}
