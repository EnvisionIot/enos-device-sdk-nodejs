import {ITopicConstant} from '../../topic';

/** Query attributes topic */
export const queryAttributeTopic: ITopicConstant = {
  requestTopic: '/sys/%s/%s/thing/attribute/query',
  method: 'thing.attribute.query'
};

/** Update attributes topic */
export const updateAttributeTopic: ITopicConstant = {
  requestTopic: '/sys/%s/%s/thing/attribute/update',
  method: 'thing.attribute.update'
};

/** Delete attributes topic */
export const deleteAttributeTopic: ITopicConstant = {
  requestTopic: '/sys/%s/%s/thing/attribute/delete',
  method: 'thing.attribute.delete'
};
