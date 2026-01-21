export interface MessageProps {
  correlationId?: string;
  replyTo?: string;
}

export interface IMessageConsumer {
  consume<T>(
    handler: (message: T, props: MessageProps) => Promise<void>,
  ): Promise<void>;
}

export interface IMessageProducer {
  sendToQueue<T>(
    queue: string,
    message: T,
    props?: MessageProps,
  ): Promise<void>;
}

export type IMessagingService = IMessageConsumer & IMessageProducer;

export const MESSAGING_SERVICE = 'MESSAGING_SERVICE';
