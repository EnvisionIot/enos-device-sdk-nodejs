import {ITopicConstant} from '../../topic';

/** Topic of reporting device measure points topic */
export const postMeasurepointTopic: ITopicConstant = {
  requestTopic: '/sys/%s/%s/thing/measurepoint/post',
  method: 'thing.measurepoint.post'
};

/** Topic of reporting offline measure points */
export const resumeMeasurepointTopic: ITopicConstant = {
  requestTopic: '/sys/%s/%s/thing/measurepoint/resume',
  method: 'thing.measurepoint.resume'
};

/** Topic of reporting device measure points in batch */
export const batchPostMeasurepointTopic: ITopicConstant = {
  requestTopic: '/sys/%s/%s/thing/measurepoint/post/batch',
  method: 'thing.measurepoint.post.batch'
};

/** Topic of reporting offline measure points in batch */
export const batchResumeMeasurepointTopic: ITopicConstant = {
  requestTopic: '/sys/%s/%s/thing/measurepoint/resume/batch',
  method: 'thing.measurepoint.resume.batch'
};

/** Topic of reporting device events (non-passthrough) */
export const postEventTopic: ITopicConstant = {
  requestTopic: '/sys/%s/%s/thing/event/%s/post',
  method: 'thing.event.%s.post'
};

/** Topic of reporting device events (passthrough) */
export const modelUpRawTopic: ITopicConstant = {
  requestTopic: '/sys/%s/%s/thing/model/up_raw',
  requestTopicPattern: /\/thing\/model\/up_raw/,
  method: 'thing.model.up_raw'
};
