import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { LoggerService } from '@common/logger';
import {
  IMessageConsumer,
  IMessageProducer,
  MessageProps,
} from './messaging.interface';
import { RabbitMQConnectionManager } from './rabbitmq-connection.manager';

export interface RabbitMQServiceOptions {
  url: string;
  queue: string;
}

@Injectable()
export class RabbitMQService
  implements IMessageConsumer, IMessageProducer, OnModuleDestroy
{
  private readonly connectionManager: RabbitMQConnectionManager;
  private readonly queue: string;

  constructor(
    private readonly options: RabbitMQServiceOptions,
    private readonly logger: LoggerService,
  ) {
    this.queue = options.queue;
    this.connectionManager = new RabbitMQConnectionManager(
      options.url,
      logger,
      'Consumer',
    );
  }

  async onModuleDestroy() {
    await this.close();
  }

  async connect(): Promise<void> {
    const channel = await this.connectionManager.connect();
    await channel.assertQueue(this.queue, { durable: false });
    await channel.prefetch(1);

    this.logger.log('Consumer connected to RabbitMQ', {
      url: this.options.url,
      queue: this.options.queue,
    });
  }

  async consume<T>(
    handler: (message: T, props: MessageProps) => Promise<void>,
  ): Promise<void> {
    await this.connect();

    const channel = await this.connectionManager.getChannel();

    this.logger.log('Waiting for messages', { queue: this.queue });

    await channel.consume(this.queue, async (msg) => {
      if (msg) {
        try {
          const messageData = JSON.parse(msg.content.toString()) as T;
          this.logger.debug('Received message', {
            queue: this.queue,
            messageData,
          });

          await handler(messageData, {
            correlationId: msg.properties.correlationId,
            replyTo: msg.properties.replyTo,
          });

          channel.ack(msg);
        } catch (error) {
          this.logger.error('Error processing message', { error });
          channel.nack(msg, false, false);
        }
      }
    });
  }

  async sendToQueue<T>(
    queue: string,
    message: T,
    props?: MessageProps,
  ): Promise<void> {
    await this.connect();

    const channel = await this.connectionManager.getChannel();
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
      correlationId: props?.correlationId,
    });
  }

  async close(): Promise<void> {
    try {
      await this.connectionManager.close();
      this.logger.log('Consumer disconnected from RabbitMQ');
    } catch (error) {
      this.logger.error('Error closing RabbitMQ connection', { error });
    }
  }
}
