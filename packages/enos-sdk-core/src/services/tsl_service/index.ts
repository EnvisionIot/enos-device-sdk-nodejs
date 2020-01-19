import assert from 'assert';
import * as tslTopics from './tsl_topics';
import {callbackToPromise} from '../../utils';
import {Topic, ITopicConstant} from '../../topic';
import AttributeService from '../attribute_service';
import {IDeviceUpstreamOptions} from '../../client/device_client';
import {UpstreamRequest, MeasurePointBatchRequest, IUpstreamResponse} from '../../message';

/** Upstream options of reporting (offline) measurement points */
interface IPostMPUpstreamOptions extends IDeviceUpstreamOptions {
  /** Information of measurement points to be reported */
  point: IMeasurePoint
}

/** Upstream options of reporting (offline) measurement points in batch */
interface IBatchPostMPUpstreamOptions extends IDeviceUpstreamOptions {
  /** Information of measurement points to be reported in batch */
  points: IBatchMeasurePoint[],
  /**
   * Whether to allow sending measurement point data for offline devices. False by default.
   *
   * If sending data of offline device is not allowed and the request contains an offline device, the entire request is declined.
   */
  allowOfflineSubDevice?: boolean;
  /**
   * Whether to neglect invalid measurement point data in a request. False by default.
   *
   * If the value is set to false and the request contains invalid measurement point data, the entire request is declined.
   */
  skipInvalidMeasurepoints?: boolean;
}

/** Measurement point information */
type IMeasurePoint = {
  measurepoints: {
    [x: string]: Object
  },
  time?: number;
};

/** Measurement point information to be reported in batch */
type IBatchMeasurePoint = {
  /**
   * Product key of a sub-device.
   *
   * 1. If the data of a sub-device needs reporting, the product key and device key of the sub-device are required.
   * 2. If the product key and device key of the sub-device is not provided, those of the gateway device is used instead.
   */
  productKey?: string;
  /**
   * Device key of a sub-device.
   *
   * 1. If the data of a sub-device needs reporting, the product key and device key of the sub-device are required.
   * 2. If the product key and device key of the sub-device is not provided, those of the gateway device is used
   */
  deviceKey?: string;
} & IMeasurePoint;

interface ISendEventUpstreamOptions extends IDeviceUpstreamOptions {
  eventName: string;
  eventParams: any;
}

interface IRawDataUpstreamOptions extends IDeviceUpstreamOptions {
  /** Raw data to be reported */
  rawData: Buffer;
}

export default class TSLService extends AttributeService {
  /**
   * Report device measurement points
   */
  async postMeasurepoint(postParams: IPostMPUpstreamOptions): Promise<IUpstreamResponse<void>> {
    return this._postMp(postParams, tslTopics.postMeasurepointTopic);
  }

  /**
   * Report offline measurement points
   */
  async resumeMeasurepoint(resumeParams: IPostMPUpstreamOptions): Promise<IUpstreamResponse<void>> {
    return this._postMp(resumeParams, tslTopics.resumeMeasurepointTopic);
  }

  /**
   * Report device measurement points in batch
   *
   * Suitable for the following scenarios:
   * 1. A gateway device reports the measurement point data of its sub-devices.
   * 2. A device that is directly connected to EnOS reports the measurement point data of different timestamps.
   * 3. A mixture of the previous two scenarios.
   */
  async batchPostMeasurepoint(postParams: IBatchPostMPUpstreamOptions): Promise<IUpstreamResponse<void>> {
    return this._postMpBatch(postParams, tslTopics.batchPostMeasurepointTopic);
  }

  /**
   * Report offline measurement points in batch
   *
   * Suitable for the following scenarios:
   * 1. A gateway device reports the measurement point data of its sub-devices.
   * 2. A device that is directly connected to EnOS reports the measurement point data of different timestamps.
   * 3. A mixture of the previous two scenarios.
   */
  async batchResumeMeasurepoint(postParams: IBatchPostMPUpstreamOptions): Promise<IUpstreamResponse<void>> {
    return this._postMpBatch(postParams, tslTopics.batchResumeMeasurepointTopic);
  }

  /**
   * Report device events (non-passthrough)
   */
  async postEvent(postEventParams: ISendEventUpstreamOptions): Promise<IUpstreamResponse<void>> {
    this._validateParams(postEventParams);
    assert(postEventParams && postEventParams.eventName, 'eventName is required');

    const params = this._extractParams(postEventParams);
    const topic = new Topic(tslTopics.postEventTopic, params.deviceInfo, postEventParams.eventName);
    const message = new UpstreamRequest(topic, {events: (postEventParams && postEventParams.eventParams) || {}});
    return callbackToPromise((_callback) => {
      this._transport.publish(message, params.upstreamOptions, _callback);
    });
  }

  /**
   * Report raw data to the cloud (passthrough)
   *
   * The device sends raw data such as a binary data stream to the cloud.
   * EnOS Cloud converts the raw data to JSON format using the script that you defined. The raw data can be of any format.
   */
  async upRawModel(rawDataParams: IRawDataUpstreamOptions): Promise<Buffer> {
    this._validateParams(rawDataParams);
    assert(rawDataParams && rawDataParams.rawData, 'rawData is required');

    const params = this._extractParams(rawDataParams);
    const topic = new Topic(tslTopics.modelUpRawTopic, params.deviceInfo);
    const message = new UpstreamRequest(topic, rawDataParams.rawData, true);
    return callbackToPromise((_callback) => {
      this._transport.publish(message, params.upstreamOptions, _callback);
    });
  }

  /**
   * Report (offline) measurement points
   */
  private _postMp(postParams: IPostMPUpstreamOptions, mpTopic: ITopicConstant): Promise<IUpstreamResponse<void>> {
    this._validateParams(postParams);
    assert(postParams && postParams.point && postParams.point.measurepoints, 'point.measurepoints is required');

    const params = this._extractParams(postParams);
    const topic = new Topic(mpTopic, params.deviceInfo);
    const message = new UpstreamRequest(topic, ((postParams && postParams.point) || {}));
    return callbackToPromise((_callback) => {
      this._transport.publish(message, params.upstreamOptions, _callback);
    });
  }

  /**
   * Report (offline) measurepoint points in batch
   */
  private _postMpBatch(postParams: IBatchPostMPUpstreamOptions, batchTopic: ITopicConstant): Promise<IUpstreamResponse<void>> {
    this._validateParams(postParams);
    assert(postParams && postParams.points, 'points is required');
    assert(Array.isArray(postParams.points), 'points should be array');
    for (let i = 0; i < postParams.points.length; i++) {
      const point = postParams.points[i];
      assert(point.measurepoints, 'measurepoints is required');
    }

    const params = this._extractParams(postParams);
    const topic = new Topic(batchTopic, params.deviceInfo);

    const message = new MeasurePointBatchRequest(topic, ((postParams && postParams.points) || []));
    if (postParams.allowOfflineSubDevice) {
      message.setAllowOfflineSubDevice(postParams.allowOfflineSubDevice);
    }
    if (postParams.skipInvalidMeasurepoints) {
      message.setSkipInvalidMeasurepoints(postParams.skipInvalidMeasurepoints);
    }

    return callbackToPromise((_callback) => {
      this._transport.publish(message, params.upstreamOptions, _callback);
    });
  }
}
