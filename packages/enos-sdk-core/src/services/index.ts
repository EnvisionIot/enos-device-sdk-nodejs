import TagService from './tag_service';
import CommandService from './command_service';
import GatewayService from './gateway_service';

import * as attributeTopics from './attribute_service/attribute_topics';
import * as commandTopics from './command_service/command_topics';
import * as gatewayTopics from './gateway_service/gateway_topics';
import * as tagTopics from './tag_service/tag_topics';
import * as tslTopics from './tsl_service/tsl_topics';

class UpstreamService extends TagService {}

const topics = {
  ...attributeTopics,
  ...commandTopics,
  ...gatewayTopics,
  ...tagTopics,
  ...tslTopics
};

export {
  UpstreamService,
  CommandService,
  GatewayService,
  topics
};
