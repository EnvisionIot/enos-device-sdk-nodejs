import {ITopicConstant} from '../../topic';

/** Topic of registering devices */
export const registerDeviceTopic: ITopicConstant = {
  requestTopic: '/sys/%s/%s/thing/device/register',
  method: 'thing.device.register'
};

/** Topic of getting topological relationships of sub-devices */
export const getTopoTopic: ITopicConstant = {
  requestTopic: '/sys/%s/%s/thing/topo/get',
  method: 'thing.topo.get'
};

/** Topic of adding topological relationships of sub-devices */
export const addTopoTopic: ITopicConstant = {
  requestTopic: '/sys/%s/%s/thing/topo/add',
  method: 'thing.topo.add'
};

/** Topic of deleting topological relationships of sub-devices */
export const deleteTopoTopic: ITopicConstant = {
  requestTopic: '/sys/%s/%s/thing/topo/delete',
  method: 'thing.topo.delete'
};

/** Topic of connecting a sub-device to cloud */
export const loginSubDeviceTopic: ITopicConstant = {
  requestTopic: '/ext/session/%s/%s/combine/login',
  method: 'combine.login'
};

/** Topic of connecting sub-devices to cloud in batch */
export const batchLoginSubDeviceTopic: ITopicConstant = {
  requestTopic: '/ext/session/%s/%s/combine/login/batch',
  method: 'combine.login.batch'
};

/** Topic of disconnecting a sub-device from the cloud */
export const logoutSubDeviceTopic: ITopicConstant = {
  requestTopic: '/ext/session/%s/%s/combine/logout',
  method: 'combine.logout'
};

/** Topic of sub-devices enabled */
export const subDeviceEnableTopic: ITopicConstant = {
  requestTopic: '/ext/session/%s/%s/combine/enable'
};

/** Topic of sub-devices disabled */
export const subDeviceDisableTopic: ITopicConstant = {
  requestTopic: '/ext/session/%s/%s/combine/disable'
};

/** Topic of sub-devices deleted */
export const subDeviceDeleteTopic: ITopicConstant = {
  requestTopic: '/ext/session/%s/%s/combine/delete'
};
