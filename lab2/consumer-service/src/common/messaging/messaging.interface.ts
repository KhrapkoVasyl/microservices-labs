export interface MessageProps {
  correlationId?: string;
  replyTo?: string;
}

export interface IMessageProducer {
  send<T>(message: T, options?: MessageProps): Promise<void>;
}

export interface IMessageConsumer {
  consume<T>(
    handler: (message: T, props: MessageProps) => Promise<void>,
  ): Promise<void>;
}

export interface IRequestReplyClient {
  sendAndReceive<T, R>(message: T): Promise<R>;
}

export const MESSAGE_PRODUCER = 'MESSAGE_PRODUCER';
export const MESSAGE_CONSUMER = 'MESSAGE_CONSUMER';
