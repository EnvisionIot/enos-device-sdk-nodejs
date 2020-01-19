import {ITopicConstant} from '../../topic';

/** Topic of invoking device services (non-passthrough) */
export const serviceTopic: ITopicConstant = {
  requestTopic: '/sys/%s/%s/thing/service/%s',
  requestTopicPattern: /\/sys\/(.*)\/(.*)\/thing\/service\/(.*)/
};

/** Topic of set device measurement points */
export const setMeasurePointTopic: ITopicConstant = {
  requestTopic: '/sys/%s/%s/thing/service/measurepoint/set'
};

/** Topic of invoking device services (passthrough) */
export const modelDownRawTopic: ITopicConstant = {
  requestTopic: '/sys/%s/%s/thing/model/down_raw',
  requestTopicPattern: /\/thing\/model\/down_raw/
};
