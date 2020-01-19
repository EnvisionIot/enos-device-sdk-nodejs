import {EventEmitter} from 'events';
import {IDeviceIdentifier} from './deviceinfo';
import {UpstreamRequest, UpstreamResponse, CommandResponse, CommandRequest, RawDataCommandResponse} from './message';
import {Topic} from './topic';
import {SECURE_MODE} from './constants';

/** Connection options of MqttTransport */
export interface IMqttTransportOptions {
  /** time to wait before the connection is established, unit: seconds, default: 30s */
  connectionTimeout?: number;
  /** Reconnection interval, unit: seconds, default: 3s */
  reconnectPeriod?: number;
  /** unit: seconds */
  keepAlive?: number;
}

/** Connection options for secure login */
export interface IDeviceClientSecureOptions {
  /** p12 file */
  pfx?: string | Buffer | Array<string | Buffer | Object>;
  /** private secret of device */
  key?: string | string[] | Buffer | Buffer[] | Object[];
  passphrase?: string;
  /** device cert */
  cert?: string | string[] | Buffer | Buffer[];
  /** root cert */
  ca?: string | string[] | Buffer | Buffer[];
}

/** Connection options of device client */
export type IDeviceClientOptions = IDeviceIdentifier & IDeviceClientSecureOptions & {
  brokerUrl: string;
  secureMode: SECURE_MODE;
  mqttOptions?: IMqttTransportOptions;
  httpOptions?: any;
};

export type INipCallback = () => void;
export type INodeStyleCallback<T> = (err?: Error | null, result?: T) => void;
export type ICallbackWithoutResult = (err?: Error) => void;
/** Command callback of non-raw data */
export type ICommandCallback<T, R> = (request: CommandRequest<T>, response: CommandResponse<R>) => void;
/** Command callback of raw data */
export type IRawDataCommandCallback<R> = (payload: Buffer, response: RawDataCommandResponse<R>) => void;
/** Upstream request callback of non-raw data */
export type IUpstreamRequestCallback<T> = INodeStyleCallback<UpstreamResponse<T>>;
/** Upstream request callback of raw data */
export type IUpstreamRawDataRequestCallback = INodeStyleCallback<Buffer>;
/** Genenal upstream request callback */
export type IUpRequestCallback<T> = IUpstreamRequestCallback<T> | IUpstreamRawDataRequestCallback;

/** publish options of upstream messages */
export interface ITransportPublishOptions {
  qos?: 0 | 1;
  /** Identifies if a server response is required */
  needReply?: boolean;
}

/**
 * Device protocol interface.
 *
 * New protocols need to implement the methods defined by this interface.
 */
export interface IDeviceTransport extends EventEmitter {
  /** Identifies whether the client is connected */
  connected: boolean;
  /** Identifies whether the client is reconnected */
  reconnected: boolean;

  /** Connect the client to cloud */
  connect(callback: INodeStyleCallback<string>): void;
  /** Close the connection */
  end(force?: boolean, callback?: INipCallback): void;

  /** Publish message to cloud */
  publish<T>(message: UpstreamRequest, callback: IUpRequestCallback<T>): void;
  publish<T>(message: UpstreamRequest, options: ITransportPublishOptions, callback: IUpRequestCallback<T>): void;

  /** Process the downstream commands with non-raw data from the cloud */
  onCommand<T, R>(commandTopic: Topic, callback: ICommandCallback<T, R>): void;
  /** Process the downstream commands with raw data from the cloud */
  onRawDataCommand<R>(commandTopic: Topic, callback: IRawDataCommandCallback<R>): void;
  /** Send a response to the cloud after receiving downstream commands */
  sendCommandResponse<R>(response: CommandResponse<R>, callback?: ICallbackWithoutResult): void;
}

export type IDeviceTransportCtor = new (options: IDeviceClientOptions) => IDeviceTransport;
