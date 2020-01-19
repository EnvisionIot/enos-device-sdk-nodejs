import {ITopicConstant} from '../../topic';

/** query tags topic */
export const queryTagTopic: ITopicConstant = {
  requestTopic: '/sys/%s/%s/thing/tag/query',
  method: 'thing.tag.query'
};

/** update tags topic */
export const updateTagTopic: ITopicConstant = {
  requestTopic: '/sys/%s/%s/thing/tag/update',
  method: 'thing.tag.update'
};

/** delete tags topic */
export const deleteTagTopic: ITopicConstant = {
  requestTopic: '/sys/%s/%s/thing/tag/delete',
  method: 'thing.tag.delete'
};
