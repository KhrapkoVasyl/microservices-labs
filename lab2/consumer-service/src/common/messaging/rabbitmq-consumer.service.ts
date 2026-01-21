import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { LoggerService } from '@common/logger';
import { IMessageConsumer, MessageProps } from './messaging.interface';
import { RabbitMQConnectionManager } from './rabbitmq-connection.manager';

export interface RabbitMQConsumerOptions {
  url: string;
  queue: string;
}

@Injectable()
export class RabbitMQConsumer implements IMessageConsumer, OnModuleDestroy {
  private readonly connectionManager: RabbitMQConnectionManager;
  private readonly queue: string;

  constructor(
    private readonly options: RabbitMQConsumerOptions,
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
  }

  async consume<T>(
    handler: (message: T, props: MessageProps) => Promise<void>,
  ): Promise<void> {
    const channel = await this.connectionManager.getChannel();

    this.logger.log('Waiting for messages', { queue: this.queue });

    await channel.consume(this.queue, async (msg) => {
      if (msg) {
        try {
          const content = JSON.parse(msg.content.toString()) as T;
          await handler(content, {
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

  async close(): Promise<void> {
    await this.connectionManager.close();
  }
}
