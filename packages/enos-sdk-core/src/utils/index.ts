import {topics} from '../services';

export {callbackToPromise} from './promise_util';
export * from './sign';

/**
 * Determine if raw data stream is needed
 */
export function isNeedRawPayload(topic: string): boolean {
  const modelDownRawTopicPattern = topics.modelDownRawTopic.requestTopicPattern;
  const modelUpRawTopicPattern = topics.modelUpRawTopic.requestTopicPattern;
  if ((modelDownRawTopicPattern && modelDownRawTopicPattern.test(topic))
    || (modelUpRawTopicPattern && modelUpRawTopicPattern.test(topic))) {
    return true;
  }

  return false;
}
