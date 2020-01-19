import {EventEmitter} from 'events';
import mqtt, {MqttClient, IClientOptions, QoS} from 'mqtt';
import {
  utils, Constants, Topic,
  IDeviceTransport, IDeviceClientOptions, IDeviceClientSecureOptions, ITransportPublishOptions,
  IUpRequestCallback, UpstreamRequest, UpstreamResponse, CommandRequest, CommandResponse, RawDataCommandResponse,
  IUpstreamRequestCallback, ICommandCallback, IRawDataCommandCallback,
  INipCallback, ICallbackWithoutResult, IUpstreamRawDataRequestCallback
} from 'enos-device-sdk-nodejs-core';
import dbg from 'debug';
import url from 'url';

const debug = dbg('mqtt_transport');
const {SECURE_MODE, SIGN_METHOD} = Constants;

/** Command callback; `CommandRequest` for non-raw data, `Buffer` for raw data  */
type ITransportCommandCallback<T> = (request: CommandRequest<T> | Buffer) => void;
type IMqttClientOptions = IClientOptions & IDeviceClientSecureOptions;

enum CLIENT_EVENT {
  CLOSE = 'close',
  ERROR = 'error',
  END = 'end'
};

export class MqttTransport extends EventEmitter implements IDeviceTransport {
  private _brokerUrl: string;
  private _mqttClient: MqttClient | null = null;
  private _mqttClientOptions: IMqttClientOptions;
  /**
   * Identifies whether the connection is established and if it is the first time
   *
   * * `undefined`: Connection not established
   * * `true`: First connection
   * * `false`: Reconnected
   */
  private _isFirstConnected: boolean | undefined;
  /** Callback map of downstream commands from cloud */
  private _commandTopicCallbackMap: Map<string, ITransportCommandCallback<any>>;
  /** Topic map of device subscription */
  private _subscribeTopicMap: Map<string, boolean>;
  /**
   * Callback map of non-raw data requests emitted by the device
   *
   * Use message ID as the key, so that the same topic can be sent multiple times to respond separately
   */
  private _messageIdCallbackMap: Map<string, IUpstreamRequestCallback<any>>;
  /**
   * Callback map of raw data requests emitted by the device
   *
   * Because the message ID of the raw data cannot be resolved, the topic name is used as the key;
   */
  private _upstreamTopicCallbackMap: Map<string, IUpstreamRawDataRequestCallback>;
  private _messageId: number = 1;

  constructor(options: IDeviceClientOptions) {
    super();
    this._brokerUrl = options.brokerUrl;
    this._mqttClientOptions = this._getMqttClientOptions(options);
    this._commandTopicCallbackMap = new Map();
    this._subscribeTopicMap = new Map();
    this._messageIdCallbackMap = new Map();
    this._upstreamTopicCallbackMap = new Map();
  }

  get connected(): boolean {
    return this._mqttClient ? this._mqttClient.connected : false;
  }

  get reconnected(): boolean {
    return this.connected && this._isFirstConnected === false;
  }

  connect(callback: ICallbackWithoutResult) {
    this._mqttClient = mqtt.connect(this._brokerUrl, this._mqttClientOptions);

    /** Error callback during the first connection; `error` event won't be emitted on the first connection */
    const errorCallbackOnFirstConnect = this._createEventCallback(CLIENT_EVENT.ERROR, callback, false);
    /** Error callback after the first connection */
    const errorCallbackAfterConnect = this._createEventCallback(CLIENT_EVENT.ERROR);
    /** Close callback when the client is closed during the first connection */
    const closeCallbackOnFirstConnect = this._createEventCallback(CLIENT_EVENT.CLOSE, callback);
    /** Close callback when the client is closed after connected */
    const closeCallbackAfterConnect = this._createEventCallback(CLIENT_EVENT.CLOSE);
    this._mqttClient.on('error', errorCallbackOnFirstConnect);
    this._mqttClient.on('close', closeCallbackOnFirstConnect);

    const connectCallback = () => {
      debug('The device is connected');

      if (this._mqttClient) {
        this._mqttClient.removeListener('error', errorCallbackOnFirstConnect);
        this._mqttClient.removeListener('error', errorCallbackAfterConnect);
        this._mqttClient.removeListener('close', closeCallbackOnFirstConnect);
        this._mqttClient.removeListener('close', closeCallbackAfterConnect);
        this._mqttClient.on('error', errorCallbackAfterConnect);
        this._mqttClient.on('close', closeCallbackAfterConnect);

        if (typeof this._isFirstConnected === 'undefined') {
          this._isFirstConnected = true;
          if (callback) callback();
        } else if (this._isFirstConnected === true) {
          this._isFirstConnected = false;
        }

        this.emit('connect');
      }
    };

    this._mqttClient.on('connect', connectCallback);
    this._mqttClient.on('message', (topic, payload, packet) => {
      this._dispatchMqttMessage(topic, payload);
      process.nextTick(() => {
        this.emit('message', topic, payload);
      });
    });

    const endCallback = this._createEventCallback(CLIENT_EVENT.END);
    this._mqttClient.removeListener('end', endCallback);
    this._mqttClient.on('end', endCallback);
  }

  end(force?: boolean, callback?: INipCallback): void {
    if (this._mqttClient) {
      this._mqttClient.end(force, callback);
    }
  }

  /**
   * Send a message to the cloud
   *
   * If you don't need to wait for the cloud response, you can set the `needReply` in `options` to false, and the callback will be called immediately after sending the message successfully.
   */
  publish<T>(message: UpstreamRequest, options: ITransportPublishOptions | IUpRequestCallback<T>, callback?: IUpRequestCallback<T>) {
    let newCallback = callback as IUpRequestCallback<T>;
    if (options && typeof options === 'function') {
      newCallback = options;
    }

    if (!this._mqttClient) {
      newCallback(new Error('device is not connected, please connect first'));
      return;
    }

    if (!message.messageId) {
      message.setMessageId((this._messageId++).toString());
    }

    const defaultOptions: ITransportPublishOptions = {qos: 1, needReply: true};
    const finalOptions = {...defaultOptions, ...options};

    const publishTopic = () => {
      if (this._mqttClient) {
        const payload = message.isRawData() ? message.getPayload() as Buffer : JSON.stringify(message.getPayload());
        this._mqttClient.publish(message.getTopicName(), payload, {
          qos: finalOptions.qos as QoS
        }, (err) => {
          if (err) {
            newCallback(new Error(`publish topic ${message.getTopicName()} fail: ${err.message}`));
          } else if (!finalOptions.needReply) {
            // Call the callback immediately if no need to wait for the cloud response
            newCallback(null);
          }
        });
      }
    };

    const setCallback = (topicName: string) => {
      if (message.isRawData()) {
        this._upstreamTopicCallbackMap.set(topicName, newCallback as IUpstreamRawDataRequestCallback);
      } else {
        this._messageIdCallbackMap.set(message.messageId, newCallback as IUpstreamRequestCallback<any>);
      }
    };

    // Subscribe topic before sending the message if the cloud response is needed
    if (finalOptions.needReply) {
      const responseTopicName = message.getResponseTopicName();

      // Topics that have already been subscribed do not need to be subscribed again
      if (this._subscribeTopicMap.get(responseTopicName)) {
        setCallback(responseTopicName);
        publishTopic();
      } else {
        this._mqttClient.subscribe(responseTopicName, {qos: 1}, (err) => {
          this._subscribeTopicMap.set(responseTopicName, true);
          if (err) {
            debug('subscribe error: %s', err.message);
            newCallback(new Error(`subscribe response topic ${responseTopicName} fail: ${err.message}`));
          } else {
            setCallback(responseTopicName);
            publishTopic();
          }
        });
      }
    } else {
      publishTopic();
    }
  }

  /** Process the downstream commands with non-raw data from the cloud */
  onCommand<T, R>(commandTopic: Topic, callback: ICommandCallback<T, R>) {
    const topicName = commandTopic.getTopicName();

    if (this._commandTopicCallbackMap.get(topicName)) {
      debug(`command topic ${topicName} callback has existed, will override`);
    }

    const newCallback: ITransportCommandCallback<T> = (request) => {
      const commandResponse = new CommandResponse<R>((request as CommandRequest<T>).messageId, commandTopic, this);
      callback(request as CommandRequest<T>, commandResponse);
    };
    this._commandTopicCallbackMap.set(topicName, newCallback);
  }

  /**
   * Process the downstream commands with raw data from the cloud
   *
   * Unlike the downstream commands with non-raw data, the raw data is returned without processing
   */
  onRawDataCommand<R>(commandTopic: Topic, callback: IRawDataCommandCallback<R>) {
    const topicName = commandTopic.getTopicName();

    if (this._commandTopicCallbackMap.get(topicName)) {
      debug(`command topic ${topicName} callback has existed, will override`);
    }

    const newCallback: ITransportCommandCallback<R> = (payload) => {
      const commandResponse = new RawDataCommandResponse<R>(commandTopic, this);
      callback(payload as Buffer, commandResponse);
    };
    this._commandTopicCallbackMap.set(topicName, newCallback);
  }

  sendCommandResponse<R>(response: CommandResponse<R>, callback?: ICallbackWithoutResult): void {
    if (this._mqttClient) {
      this._mqttClient.publish(response.getTopicName(), response.getEncodedPayload(), {
        qos: 0, retain: false
      }, (err) => {
        if (callback) {
          callback(err);
        }
      });
    }
  }

  /**
   * Construct the connection parameters of the Mqtt protocol according to the parameters of `Constructor`
   */
  private _getMqttClientOptions(options: IDeviceClientOptions): IMqttClientOptions {
    const {productKey, productSecret, deviceKey, deviceSecret = '', mqttOptions = {}, secureMode} = options;
    const timestamp = new Date().getTime();
    const username = `${deviceKey}&${productKey}`;
    const clientId = `${deviceKey}|securemode=${secureMode},signmethod=sha256,timestamp=${timestamp}|`;

    const password = utils.sign({
      productKey,
      timestamp,
      deviceKey,
      clientId: deviceKey
    }, secureMode === SECURE_MODE.VIA_PRODUCT_SECRET ? (productSecret || '') : (deviceSecret || ''), SIGN_METHOD.SHA256);

    const clientOptions: IMqttClientOptions = {
      clientId,
      username,
      password,
      key: options.key,
      cert: options.cert,
      ca: options.ca,
      pfx: options.pfx,
      passphrase: options.passphrase,
      // rejectUnauthorized: false,
      protocolId: 'MQTT',
      protocolVersion: 4,
      connectTimeout: 30 * 1000,
      reconnectPeriod: 3 * 1000,
      keepalive: 60
    };

    if (!options.brokerUrl) {
      throw new Error('Please provide broker url');
    }

    // In the underlying logic of MQTT.js, if `key`, `cert` and `ca` exist at the same time, it will check whether the provided protocol is a secure protocol, but the `ssl` protocol is excluded
    // Since `mqtts` and `ssl` protocol use the same tsl module at the bottom level, change the protocol to `mqtts` so MQTT.js can identify it
    const parsed = url.parse(options.brokerUrl, true);
    if (parsed.protocol && parsed.protocol.indexOf('ssl') > -1) {
      if (options.ca && options.key && options.cert) {
        clientOptions.protocol = 'mqtts';
      }
    }

    if (mqttOptions.connectionTimeout) {
      clientOptions.connectTimeout = mqttOptions.connectionTimeout * 1000;
    }

    if (mqttOptions.keepAlive || mqttOptions.keepAlive === 0) {
      clientOptions.keepalive = mqttOptions.keepAlive;
    }

    if (mqttOptions.reconnectPeriod || mqttOptions.reconnectPeriod === 0) {
      clientOptions.reconnectPeriod = mqttOptions.reconnectPeriod * 1000;
    }

    return clientOptions;
  }

  /**
   * Create event callback for event within `CLIENT_EVENT`
   *
   * @param {CLIENT_EVENT} eventName
   * @param {ICallbackWithoutResult} callback
   * @param {boolean} isEmitEvent
   */
  private _createEventCallback(eventName: CLIENT_EVENT, callback?: ICallbackWithoutResult, isEmitEvent: boolean = true) {
    return (err) => {
      debug(`receive ${eventName} event from mqtt client`);
      if (isEmitEvent) {
        debug(`emit ${eventName} event`);
        this.emit(eventName, err);
      }
      if (callback && (eventName === CLIENT_EVENT.CLOSE || CLIENT_EVENT.ERROR)) {
        callback(err || new Error('Unable to establish a connection'));
      }
    };
  }

  private _dispatchMqttMessage(topic: string, payload: Buffer) {
    let messageContent: any;

    try {
      messageContent = utils.isNeedRawPayload(topic) ? payload : JSON.parse(payload.toString());
    } catch (e) {
      messageContent = '';
    }

    const upstreamResponseCallback = this._messageIdCallbackMap.get(messageContent.id);
    const upstreamRawResponseCallback = this._upstreamTopicCallbackMap.get(topic);
    const commandTopicCallback = this._commandTopicCallbackMap.get(topic);

    if (upstreamResponseCallback || upstreamRawResponseCallback) {
      // Dispatch response of upstream message
      if (utils.isNeedRawPayload(topic) && upstreamRawResponseCallback) {
        upstreamRawResponseCallback(null, payload);
      } else if (upstreamResponseCallback) {
        const upstreamResponse = new UpstreamResponse(payload);
        upstreamResponseCallback(null, upstreamResponse);
      }
    } else if (commandTopicCallback) {
      // Dispatch response of downstream command
      if (utils.isNeedRawPayload(topic)) {
        commandTopicCallback(payload);
      } else {
        const commandRequest = new CommandRequest(payload);
        commandTopicCallback(commandRequest);
      }
    }
  }
}
